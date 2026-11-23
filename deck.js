/* FishPin national pitch: presentation engine.
   Scripts load in this order: reveal.js, notes.js, gsap, assets/icons.js, deck-data.js, deck.js.
   On load: slide code builds data-driven markup (RENDER) -> icons are inlined -> every
   [data-k] element is filled from DECK -> Reveal starts -> each slide's entrance and
   signature motion (ANIM) run when it is shown.
   CSS always holds a slide's FINAL state. Animations only play into it, so static,
   print and reduced-motion modes need no special cases. */
(function () {
  'use strict';

  /* ---------- modes ---------- */
  const query = new URLSearchParams(location.search);
  const isPrint = /print-pdf/i.test(location.search);
  const isStatic = query.get('static') === '1';
  const isCheck = query.get('check') === '1';
  const still = isPrint || isStatic || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (still) document.documentElement.classList.add('still');

  /* Headless print jobs can starve requestAnimationFrame, and Reveal's PDF layout waits on it.
     In print mode, race each frame against a short timeout so the layout always finishes. */
  if (isPrint) {
    const nativeRAF = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = cb => {
      let done = false;
      const runOnce = ts => { if (!done) { done = true; cb(ts); } };
      const t = setTimeout(() => runOnce(performance.now()), 32);
      nativeRAF(runOnce);
      return t;
    };
  }

  /* ---------- helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const pad = n => String(n).padStart(2, '0');
  const sections = () => $$('.reveal .slides > section');
  const mainSlides = () => sections().filter(s => !s.hasAttribute('data-appendix'));
  const nf = (v, dp = 0) => Number(v).toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });

  /* ---------- number formats for [data-f] ---------- */
  const FORMAT = {
    text: v => String(v),
    int: v => nf(v),
    dec1: v => nf(v, 1),
    php: v => 'PHP ' + nf(v),
    php2: v => 'PHP ' + nf(v, 2),
    phpM: v => 'PHP ' + nf(v) + 'M',
    pct: v => nf(v, 2) + '%',
    pct1: v => nf(v, 1) + '%',
    share: v => nf(v * 100) + '%',
    yrs: v => nf(v, 2) + ' yrs',
    million: v => nf(v / 1e6, 1) + ' million',
    date: v => new Date(v + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
  };
  const WHOLE = new Set(['int', 'php', 'phpM']);
  const format = (el, v) => {
    if (el.dataset.f && !FORMAT[el.dataset.f]) console.error('deck: unknown format "' + el.dataset.f + '" on ' + el.dataset.k);
    return (FORMAT[el.dataset.f] || FORMAT.text)(v);
  };

  function bind(root) {
    $$('[data-k]', root).forEach(el => {
      const v = DECK.get(el.dataset.k);
      if (v === undefined || v === null || v === '') { console.error(`deck: no data for "${el.dataset.k}"`); return; }
      el.textContent = format(el, v);
      if (typeof v === 'number') el.dataset.v = String(v);
    });
  }

  function inlineIcons(root) {
    $$('[data-icon]', root).forEach(el => {
      const svg = window.ICONS && window.ICONS[el.dataset.icon];
      if (!svg) { console.error(`deck: missing icon "${el.dataset.icon}"`); return; }
      el.innerHTML = svg;
    });
  }

  /* ---------- registries filled by the slide code below ---------- */
  const RENDER = [];   // functions that build data-driven markup once, before icons and bindings
  const ANIM = {};     // slide id -> (slide, timeline) => signature motion
  const ACTIONS = {};  // named actions bound to keys, e.g. ACTIONS.airplane (M)
  const timers = [];
  const later = (ms, fn) => { timers.push(setTimeout(fn, ms)); };
  const every = (ms, fn, first = ms) => { timers.push(setTimeout(() => { fn(); timers.push(setInterval(fn, ms)); }, first)); };
  const stopTimers = () => { timers.forEach(id => { clearTimeout(id); clearInterval(id); }); timers.length = 0; };

  /* ---------- entrances ---------- */
  function countUp(el, tl) {
    const end = Number(el.dataset.v);
    if (!Number.isFinite(end)) return;
    const from = el.dataset.from !== undefined ? Number(el.dataset.from) : 0;
    const whole = WHOLE.has(el.dataset.f);
    const o = { v: from };
    el.textContent = format(el, whole ? Math.round(from) : from);
    tl.fromTo(o, { v: from }, {
      v: end, duration: Number(el.dataset.countDur || 0.9), ease: 'power2.out',
      onUpdate: () => { el.textContent = format(el, whole ? Math.round(o.v) : o.v); },
      onComplete: () => { el.textContent = format(el, end); },
    }, Number(el.dataset.countAt || 0.15));
    const at = Number(el.dataset.countAt || 0.15);
    if (at > 0.4) tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power1.out', clearProps: 'opacity' }, at);
  }

  let tl = null;
  function enter(slide) {
    if (tl) tl.kill();
    tl = null;
    stopTimers();
    if (still) return;
    tl = gsap.timeline();
    const rise = $$('[data-rise]', slide);
    if (rise.length) {
      tl.fromTo(rise, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.32, ease: 'power3.out', stagger: { each: 0.035, amount: Math.min(0.035 * (rise.length - 1), 0.4) }, clearProps: 'transform' }, 0.05);
    }
    $$('[data-count]', slide).forEach(el => countUp(el, tl));
    $$('[data-grow]', slide).forEach((el, i) => {
      tl.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power3.out', transformOrigin: 'left center', clearProps: 'transform' },
        Number(el.dataset.growAt || 0.25) + i * 0.08);
    });
    if (ANIM[slide.id]) ANIM[slide.id](slide, tl);
  }

  /* ===== slide code: each later task inserts its slide's RENDER/ANIM above the end marker ===== */

  /* 01 cover: the app phones rise into place while the sonar rings pulse behind them */
  ANIM.cover = (s, t) => {
    t.fromTo($('.cover-phones', s), { y: 60, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out', clearProps: 'transform' }, 0.2);
  };

  /* 02 problem: 103 dots, one per fisherman. 93 fade, 10 light amber, the count falls 103 -> 10. */
  RENDER.push(function problemDots() {
    const box = $('#fisherDots');
    if (!box) return;
    const total = DECK.market.barangayFishermen;
    const lit = DECK.market.barangayGps;
    let seed = 20261123;
    const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
    const litAt = new Set();
    for (let n = 0; litAt.size < lit && n < 10000; n++) litAt.add(Math.floor(rnd() * total));
    box.innerHTML = Array.from({ length: total }, (_, i) => `<i class="dot${litAt.has(i) ? ' gps' : ''}"></i>`).join('');
    $('#gpsCount').dataset.from = String(total);
  });
  ANIM.problem = (s, t) => {
    const dots = $$('.dot', s);
    const lit = dots.filter(d => d.classList.contains('gps'));
    const dim = dots.filter(d => !d.classList.contains('gps'));
    t.fromTo(dots, { scale: 0, opacity: 0, backgroundColor: '#9FB3D9' }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2)', stagger: 0.004 }, 0.25)
      .to(dim, { backgroundColor: 'rgba(159,179,217,0.22)', duration: 0.6, ease: 'power2.out', stagger: { each: 0.004, from: 'random' } }, 0.95)
      .to(lit, { backgroundColor: '#FFC857', scale: 1.25, duration: 0.4, ease: 'back.out(3)', stagger: 0.04 }, 1.2)
      .set(dots, { clearProps: 'all' });
  };

  /* 03 solution: an amber pin drops on the chart, then the tiles light in turn as the screen changes */
  ANIM.solution = (s, t) => {
    const tiles = $$('[data-tile]', s);
    const screens = $$('.scr', s);
    const phone = $('.sol-phone', s);
    let i = 0;
    const show = n => {
      tiles.forEach((el, k) => el.classList.toggle('on', k === n));
      screens.forEach((el, k) => el.classList.toggle('on', k === n));
      phone.classList.toggle('at-0', n === 0);
    };
    show(0);
    t.fromTo($('.pin-drop', s), { y: -160, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'bounce.out', clearProps: 'transform' }, 0.35)
      .fromTo($('.pin-ripple', s), { scale: 0.2, opacity: 0.8 }, { scale: 3, opacity: 0, duration: 1, ease: 'power2.out' }, 0.9);
    every(1800, () => { i = (i + 1) % tiles.length; show(i); }, 2400);
  };

  /* 04 offline: the switch flips, signal bars fall, online-only items strike through, checks pulse */
  let airTouched = false;
  function setAirplane(on) {
    const s = $('#offline');
    if (!s) return;
    s.classList.toggle('air-on', on);
    $('#airSwitch').setAttribute('aria-checked', String(on));
    $('#airCaption').textContent = on ? 'Airplane mode on' : 'Signal on';
    if (on && !still) gsap.fromTo($$('.checks [data-icon]', s), { scale: 0.6 }, { scale: 1, duration: 0.35, ease: 'back.out(3)', stagger: 0.06, clearProps: 'transform' });
  }
  ACTIONS.airplane = () => {
    const s = $('#offline');
    airTouched = true;
    if (s) setAirplane(!s.classList.contains('air-on'));
  };
  RENDER.push(function airplaneSwitch() {
    const sw = $('#airSwitch');
    if (sw) sw.addEventListener('click', () => ACTIONS.airplane());
  });
  ANIM.offline = () => {
    airTouched = false;
    setAirplane(false);
    later(1400, () => { if (!airTouched) setAirplane(true); });
  };

  /* 05 novelty: 6,337 counts up while two rows of real local fish names drift */
  RENDER.push(function fishNames() {
    $$('#novelty .track').forEach((track, row) => {
      const names = row ? [...DECK.fishNames].reverse() : DECK.fishNames;
      const html = names.map(n => `<span>${n}</span>`).join('');
      track.innerHTML = html + html;
    });
  });
  ANIM.novelty = (s, t) => {
    t.fromTo($('.marquee', s), { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.4);
  };

  /* 06 traction: accounts count up, the timeline draws and each milestone pops as the line reaches it */
  RENDER.push(function tractionTimeline() {
    const ol = $('#traction .timeline');
    if (!ol) return;
    ol.innerHTML = DECK.traction.milestones.map(m =>
      `<li class="ms${m.planned ? ' planned' : ''}"><span class="ms-dot"><i data-icon="${m.icon}"></i></span><b>${m.when}</b><span>${m.what}</span></li>`).join('');
    const ms = DECK.traction.milestones;
    const last = ms.map(m => !m.planned).lastIndexOf(true);
    $('#traction .tl-wrap').style.setProperty('--fill-end', `calc(${Math.max(0, last)} / ${ms.length} * (100% + 16px))`);
    const impl = $('#traction .impl');
    const items = DECK.traction.implemented;
    impl.hidden = !items.length;
    $('ul', impl).innerHTML = items.map(text => `<li><i data-icon="check"></i><span>${text}</span></li>`).join('');
  });
  ANIM.traction = (s, t) => {
    const dots = $$('.ms-dot', s);
    const span = 1.4;
    const track = $('.tl-fill', s).getBoundingClientRect();
    t.fromTo($('.tr-photo', s), { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, ease: 'power3.out', clearProps: 'transform' }, 0.15)
      .fromTo($('.tl-fill', s), { scaleX: 0 }, { scaleX: 1, duration: span, ease: 'none', clearProps: 'transform' }, 0.5);
    dots.forEach(d => {
      const r = d.getBoundingClientRect();
      const f = Math.min(1, Math.max(0, (r.left + r.width / 2 - track.left) / track.width));
      t.fromTo(d, { scale: 0 }, { scale: 1, duration: 0.35, ease: 'back.out(2.5)', clearProps: 'transform' }, 0.5 + f * span - 0.1);
    });
  };

  /* 07 model: competitor five-year bars grow long, then FishPin's arrives last and tiny */
  RENDER.push(function costBars() {
    const box = $('#model .bars');
    if (!box) return;
    const max = Math.max(...DECK.competitors.map(c => c.max || c.fiveYear));
    const pct = v => `${(v / max * 100).toFixed(2)}%`;
    const php = v => 'PHP ' + nf(v);
    const rows = DECK.competitors.map(c => c.min
      ? `<div class="bar-row"><span class="who">${c.name}</span><span class="bar-track"><i class="bar-fill" data-grow style="width:${pct(c.min)}"></i><i class="bar-range" style="left:${pct(c.min)};width:${pct(c.max - c.min)}"></i><span class="bar-val" style="left:calc(${pct(c.min)} + 18px)">${php(c.min)} to ${nf(c.max)}</span></span></div>`
      : `<div class="bar-row"><span class="who">${c.name}</span><span class="bar-track"><i class="bar-fill" data-grow style="width:${pct(c.fiveYear)}"></i><span class="bar-val inside" style="left:calc(${pct(c.fiveYear)} - 18px)">${php(c.fiveYear)}</span></span></div>`);
    rows.push(`<div class="bar-row us"><span class="who">FishPin</span><span class="bar-track"><i class="bar-fill" data-grow data-grow-at="1.0" style="width:${pct(DECK.price)}"></i><span class="bar-val" style="left:calc(${pct(DECK.price)} + 18px)">${php(DECK.price)}</span></span></div>`);
    box.innerHTML = rows.join('');
    const top = DECK.competitors.filter(c => c.fiveYear).reduce((a, c) => (c.fiveYear > a.fiveYear ? c : a));
    $('#model .ratio').textContent = `${Math.floor(top.fiveYear / DECK.price)}x`;
    $('#model .ratio-who').textContent = top.name;
  });
  ANIM.model = (s, t) => {
    t.fromTo($$('.bar-row:not(.us) .bar-val', s), { opacity: 0 }, { opacity: 1, duration: 0.3, stagger: 0.08 }, 0.7)
      .fromTo($('.bar-row.us .bar-val', s), { opacity: 0 }, { opacity: 1, duration: 0.3 }, 1.6)
      .fromTo($('.cost-callout', s), { opacity: 0 }, { opacity: 1, duration: 0.4 }, 1.8);
  };

  /* 08 market: TAM, SAM, SOM rings grow from the base, largest first (area is proportional) */
  RENDER.push(function marketRings() {
    const box = $('#market .rings');
    if (!box) return;
    const m = DECK.market;
    const size = v => Math.max(56, Math.round(720 * Math.sqrt(v / m.tamM)));
    box.innerHTML = [['tam', m.tamM], ['sam', m.samM], ['som', m.somM]].map(([key, v]) => {
      const d = size(v);
      return `<i class="ring ${key}" style="width:${d}px;height:${d}px;left:calc(50% - ${d / 2}px)"><span>${key.toUpperCase()}</span></i>`;
    }).join('');
  });
  ANIM.market = (s, t) => {
    t.fromTo($$('.ring', s), { scale: 0, transformOrigin: '50% 100%' }, { scale: 1, duration: 0.7, ease: 'power3.out', stagger: 0.3, clearProps: 'transform' }, 0.25);
  };

  /* 09 go-to-market: the coast lights outward from Mansalay, pins and names appear as the light reaches them */
  const COAST_SEGS = [[238,0,246,40,236,80,252,118],[252,118,266,150,286,190,290,232],[290,232,294,270,310,300,304,338],[304,338,298,378,322,410,330,446],[330,446,338,484,330,520,348,556],[348,556,362,586,384,600,374,640],[374,640,364,684,382,716,366,752],[366,752,352,786,330,806,318,840]];
  const COAST_Y = { Bansud: 118, Bongabong: 285, Roxas: 450, Mansalay: 640, Bulalacao: 770 };
  function coastX(y) {
    let best = [0, 1e9];
    COAST_SEGS.forEach(([x0, y0, x1, y1, x2, y2, x3, y3]) => {
      for (let i = 0; i <= 200; i++) {
        const u = i / 200, v = 1 - u;
        const py = v*v*v*y0 + 3*v*v*u*y1 + 3*v*u*u*y2 + u*u*u*y3;
        if (Math.abs(py - y) < best[1]) best = [v*v*v*x0 + 3*v*v*u*x1 + 3*v*u*u*x2 + u*u*u*x3, Math.abs(py - y)];
      }
    });
    return best[0];
  }
  RENDER.push(function gtmCoast() {
    const g = $('#gtm .towns');
    if (!g) return;
    g.innerHTML = DECK.gtm.towns.map(name => {
      const y = COAST_Y[name];
      const x = Math.round(coastX(y));
      const home = name === DECK.gtm.home;
      return `<g class="town${home ? ' home' : ''}" data-y="${y}"><circle class="ripple" cx="${x}" cy="${y}" r="16"/><circle class="pin" cx="${x}" cy="${y}" r="${home ? 16 : 12}"/><text x="${x + 34}" y="${y + 10}">${name}</text></g>`;
    }).join('');
  });
  ANIM.gtm = (s, t) => {
    const hl = $('.coast-hl', s);
    const L = hl.getTotalLength();
    const lenAt = (y) => { let best = 0, bd = 1e9; for (let l = 0; l <= L; l += 2) { const d = Math.abs(hl.getPointAtLength(l).y - y); if (d < bd) { bd = d; best = l; } } return best; };
    const m = lenAt(COAST_Y[DECK.gtm.home]);
    t.fromTo($$('.land, .coast-line', s), { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power1.out', clearProps: 'opacity' }, 0.1);
    hl.setAttribute('stroke-dasharray', `0 ${L + 10}`);
    const home = $('.town.home', s);
    t.fromTo($('.pin', home), { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.4, ease: 'back.out(3)' }, 0.8)
      .fromTo($('.ripple', home), { scale: 0.5, opacity: 0.9, transformOrigin: '50% 50%' }, { scale: 3, opacity: 0, duration: 1, ease: 'power2.out' }, 0.9)
      .fromTo($('text', home), { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.9);
    const o = { a: m, b: 0 };
    t.fromTo(o, { a: m, b: 0 }, { a: 0, b: L, duration: 1.2, ease: 'power2.inOut',
      onUpdate: () => hl.setAttribute('stroke-dasharray', `0 ${o.a} ${o.b} ${L}`),
      onComplete: () => hl.removeAttribute('stroke-dasharray') }, 0.9);
    const inv = p => p < 0.5 ? Math.sqrt(p / 2) : 1 - Math.sqrt((1 - p) / 2);
    $$('.town:not(.home)', s).forEach(g => {
      const l = lenAt(Number(g.dataset.y));
      const p = Math.min(1, Math.abs(l - m) / (l < m ? m : L - m));
      const at = 0.9 + 1.2 * inv(p);
      t.fromTo($('.pin', g), { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.35, ease: 'back.out(3)' }, at)
        .fromTo($('text', g), { opacity: 0 }, { opacity: 1, duration: 0.3 }, at);
    });
  };

  /* 10 financials: the three funding blocks stack to the total, then ROI and payback count up */
  RENDER.push(function fundingStack() {
    const stack = $('#financials .stack');
    if (!stack) return;
    const f = DECK.fin;
    stack.innerHTML = [f.grantProvincial, f.grantRegional, f.counterpart]
      .map((v, i) => `<i class="s${i + 1}" data-grow data-grow-at="${(0.3 + i * 0.45).toFixed(2)}" style="width:${(v / f.total * 100).toFixed(2)}%"></i>`).join('');
  });

  /* ===== end slide code ===== */

  /* ---------- footer, letterbox, progress ---------- */
  let lastMain = null;
  function onSlide(slide) {
    const appx = slide.hasAttribute('data-appendix');
    const bg = appx ? '#EEF4FB' : '#061233';
    document.documentElement.style.background = bg;
    document.body.style.background = bg;
    document.body.classList.toggle('on-appx', appx);
    document.body.classList.toggle('no-foot-mark', slide.id === 'cover' || slide.id === 'close');
    const counter = $('#slideCounter');
    if (appx) {
      counter.textContent = 'Q&A · ' + (slide.dataset.title || '');
    } else {
      lastMain = slide;
      const main = mainSlides();
      const n = main.indexOf(slide) + 1;
      counter.textContent = `${pad(n)} / ${pad(main.length)}`;
      $('#progressFill').style.transform = `scaleX(${n / main.length})`;
    }
    enter(slide);
  }

  /* ---------- presenter timer: T shows, R restarts ---------- */
  const timerEl = $('#timer');
  let t0 = performance.now();
  function tick() {
    const s = (performance.now() - t0) / 1000;
    $('#timerLabel').textContent = Math.floor(s / 60) + ':' + pad(Math.floor(s % 60));
    $('#timerFill').style.transform = `scaleX(${Math.min(s / DECK.meta.pitchSeconds, 1)})`;
    timerEl.dataset.zone = s >= DECK.meta.timerRed ? 'red' : s >= DECK.meta.timerAmber ? 'amber' : 'ok';
  }
  setInterval(tick, 250);
  const toggleTimer = () => timerEl.classList.toggle('hidden');
  const resetTimer = () => { t0 = performance.now(); tick(); };

  /* ---------- Q&A jump menu (Q), help (H), going back (Esc / Backspace) ---------- */
  const qmenu = $('#qmenu');
  const help = $('#help');
  const isOpen = el => el.classList.contains('open');
  const setOpen = (el, open) => { el.classList.toggle('open', open); el.setAttribute('aria-hidden', String(!open)); };
  function buildQMenu() {
    const grid = $('.q-grid', qmenu);
    grid.innerHTML = '';
    sections().forEach((s, index) => {
      if (!s.hasAttribute('data-appendix')) return;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'q-item';
      b.dataset.target = s.id;
      b.innerHTML = `<span class="q-key mono">${grid.children.length + 1}</span><span>${s.dataset.title || s.id}</span>`;
      b.addEventListener('click', () => { setOpen(qmenu, false); Reveal.slide(index); });
      grid.appendChild(b);
    });
  }
  const toggleQ = () => { setOpen(help, false); setOpen(qmenu, !isOpen(qmenu)); };
  const toggleHelp = () => { setOpen(qmenu, false); setOpen(help, !isOpen(help)); };
  function goBack() {
    if (isOpen(qmenu)) return setOpen(qmenu, false);
    if (isOpen(help)) return setOpen(help, false);
    const cur = Reveal.getCurrentSlide();
    if (cur && cur.hasAttribute('data-appendix') && lastMain) Reveal.slide(sections().indexOf(lastMain));
  }
  document.addEventListener('keydown', e => {
    if (!isOpen(qmenu)) return;
    const n = Number(e.key);
    const item = n >= 1 && n <= 9 ? $$('.q-item', qmenu)[n - 1] : null;
    if (item) { e.preventDefault(); e.stopPropagation(); item.click(); }
  }, true);

  /* ---------- ?check=1: data self-check banner for Robert ---------- */
  function runCheck() {
    if (!isCheck) return;
    const problems = DECK.verify();
    const pending = DECK.pending();
    pending.forEach(key => $$(`[data-k^="${key}"]`).forEach(el => el.classList.add('is-pending')));
    if (!problems.length && !pending.length) return;
    const list = (title, items) => items.length ? `<b>${title}</b><ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>` : '';
    const banner = $('#checkBanner');
    banner.innerHTML = list('Data check failed: fix deck-data.js', problems) + list('Not yet confirmed (traction)', pending);
    banner.classList.toggle('only-pending', !problems.length);
    banner.hidden = false;
  }

  /* ---------- start ---------- */
  RENDER.forEach(fn => fn());
  inlineIcons(document);
  bind(document);
  buildQMenu();
  runCheck();

  const NEXT_KEYS = new Set([32, 34, 39, 40, 76, 78]); // space, page down, right, down, L, N
  Reveal.on('pdf-ready', () => { window.__pdfReady = true; });
  Reveal.on('slidechanged', e => onSlide(e.currentSlide));
  Reveal.initialize({
    width: 1920, height: 1080, margin: 0, minScale: 0.05, maxScale: 4,
    center: false, hash: true, controls: false, progress: false, slideNumber: false,
    overview: false, help: false, jumpToSlide: false,
    transition: 'fade', transitionSpeed: 'fast', backgroundTransition: 'none',
    pdfMaxPagesPerSlide: 1, pdfSeparateFragments: false,
    keyboardCondition: e => {
      if (isOpen(qmenu) || isOpen(help)) return [8, 27, 72, 81].includes(e.keyCode);
      const cur = Reveal.getCurrentSlide();
      return !(cur && cur.id === 'close' && NEXT_KEYS.has(e.keyCode));
    },
    keyboard: {
      8: goBack, 27: goBack, 72: toggleHelp, 81: toggleQ, 82: resetTimer, 84: toggleTimer,
      35: () => {},
      77: () => { if (ACTIONS.airplane) ACTIONS.airplane(); },
    },
    plugins: [RevealNotes],
  }).then(() => {
    onSlide(Reveal.getCurrentSlide());
    window.__deckReady = true;
  });
})();

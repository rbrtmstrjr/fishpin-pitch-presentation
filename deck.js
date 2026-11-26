/* FishPin national pitch: presentation engine.
   Scripts load in this order: reveal.js, gsap, assets/icons.js, deck-data.js, deck.js.
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
  if (isPrint || isStatic) document.documentElement.classList.add('show-all');

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
    mil1: v => nf(v / 1e6, 1),
    date: v => new Date(v + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    dec2: v => nf(v, 2),
    peso: v => '\u20B1' + nf(v),
    pts: v => '+' + nf(v, 1),
    pesoM: v => '\u20B1' + nf(v) + 'M',
    drop: v => '\u2212' + nf(v, 1) + '%',
  };
  const WHOLE = new Set(['int', 'php', 'phpM', 'peso']);
  const format = (el, v) => {
    if (el.dataset.f && !FORMAT[el.dataset.f]) console.error('deck: unknown format "' + el.dataset.f + '" on ' + el.dataset.k);
    return (FORMAT[el.dataset.f] || FORMAT.text)(v);
  };

  function bind(root) {
    $$('[data-k]', root).forEach(el => {
      const v = DECK.get(el.dataset.k);
      if (v === null && 'dash' in el.dataset) { el.textContent = '\u2013'; delete el.dataset.count; return; }
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
    const rise = $$('[data-rise]', slide).filter(el => !el.dataset.at);
    if (rise.length) {
      tl.fromTo(rise, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.32, ease: 'power3.out', stagger: { each: 0.035, amount: Math.min(0.035 * (rise.length - 1), 0.4) }, clearProps: 'transform' }, 0.05);
    }
    // details that arrive later: data-at is seconds after the slide appears
    $$('[data-rise][data-at]', slide).forEach(el => tl.fromTo(el, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out', clearProps: 'transform,opacity' }, Number(el.dataset.at)));
    $$('[data-pop]', slide).forEach(el => tl.fromTo(el, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2.2)', clearProps: 'transform,opacity' }, Number(el.dataset.at || 0.3)));
    $$('[data-grow-y]', slide).forEach(el => tl.fromTo(el, { scaleY: 0 }, { scaleY: 1, duration: 0.4, ease: 'power3.out', transformOrigin: 'center bottom', clearProps: 'transform' }, Number(el.dataset.at || 0.3)));
    $$('[data-count]', slide).forEach(el => countUp(el, tl));
    $$('[data-grow]', slide).forEach((el, i) => {
      tl.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power3.out', transformOrigin: 'left center', clearProps: 'transform' },
        Number(el.dataset.growAt || 0.25) + i * 0.08);
    });
    if (ANIM[slide.id]) ANIM[slide.id](slide, tl);
  }

  /* ===== slide code: each later task inserts its slide's RENDER/ANIM above the end marker ===== */

  /* 01 cover: Tatay's face surfaces out of the navy and settles while the title rises over it.
     The video (face, banca heading out, fisherman at sea, FishPin navigating) loops until the slide changes
     (Reveal plays it via data-autoplay and pauses it on leave); still mode
     keeps it paused on its poster so print and static screenshots match the Figma frame. */
  RENDER.push(function coverVideo() {
    if (!still) return;
    $$('video[data-autoplay]').forEach(v => v.removeAttribute('data-autoplay'));
  });
  ANIM.cover = (s, t) => {
    t.fromTo($('.cover-media', s), { opacity: 0, scale: 1.05 }, { opacity: 1, scale: 1, duration: 2.4, ease: 'power2.out', clearProps: 'opacity,transform' }, 0);
  };

  /* 02-16: FishPin Pitch 2026 as slides. The markup and CSS hold each scene's finished frame;
     these build the data-driven parts and animate the details into place. */

  /* Sea backdrop for every navy slide, matching the video pitch: ten wave lines whose
     shape repeats every 960px (so a -960px CSS drift loops seamlessly) and 36 specks
     drawn twice, 1080px apart (so a -1080px CSS rise loops seamlessly). */
  RENDER.push(function seaBackdrop() {
    const W = 3840, P = 960;
    const waves = Array.from({ length: 10 }, (_, i) => {
      const y0 = 60 + i * 108; let d = '';
      for (let x = 0; x <= W; x += 24) {
        const y = y0 + Math.sin((2 * Math.PI * x) / P + i * 0.7) * (16 + i * 2) + Math.sin((4 * Math.PI * x) / P - i * 1.2) * 5;
        d += `${x ? ' L' : 'M'} ${x} ${y.toFixed(1)}`;
      }
      return `<path d="${d}"/>`;
    }).join('');
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const dots = Array.from({ length: 36 }, () => ({ x: rnd() * 1920, y: rnd() * 1080, r: 1.5 + rnd() * 3.2, o: 0.12 + rnd() * 0.3 }));
    const specks = dots.map(d => [0, 1080].map(dy => `<circle cx="${d.x.toFixed(0)}" cy="${(d.y + dy).toFixed(0)}" r="${d.r.toFixed(1)}" opacity="${d.o.toFixed(2)}"/>`).join('')).join('');
    const html = `<div class="sea" data-bleed aria-hidden="true"><svg class="waves" viewBox="0 0 ${W} 1080">${waves}</svg><svg class="specks" viewBox="0 0 1920 2160">${specks}</svg></div>`;
    $$('.reveal .slides > section.contour').forEach(s => s.insertAdjacentHTML('afterbegin', html));
  });

  /* draw an SVG stroke (pathLength="1" paths) from nothing to its CSS final state */
  const draw = (t, el, at, dur = 0.9) => el && t.fromTo(el, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: dur, ease: 'power2.inOut', clearProps: 'strokeDashoffset' }, at);

  /* 02 problems: one card per click (Reveal fragments). As each card lands its photo settles and its line
     draws; on the fifth the signal bars drop out one by one, then the slash strikes */
  Reveal.on('fragmentshown', e => {
    const card = e.fragment;
    if (still || !card.classList.contains('pg-card')) return;
    const t = gsap.timeline();
    t.fromTo($('.pg-photo img', card), { scale: 1.12 }, { scale: 1, duration: 3, ease: 'power1.out', clearProps: 'transform' }, 0);
    t.fromTo($('.pg-num i', card), { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power3.out', transformOrigin: 'left center', clearProps: 'transform' }, 0.2);
    const bars = $$('.pg-nosvc .bars rect', card);
    if (bars.length) {
      t.fromTo(bars, { fill: '#FFFFFF' }, { fill: 'rgba(234,242,255,0.28)', duration: 0.25, stagger: { each: 0.16, from: 'end' }, clearProps: 'fill' }, 0.5);
      draw(t, $('.pg-nosvc .bars .slash', card), 1.1, 0.35);
    }
  });

  /* 17 competitors: five-year cost to the fisherman; the alternatives grow long, FishPin arrives last and tiny */
  RENDER.push(function competitorBars() {
    const box = $('#cpBars');
    if (!box) return;
    const peso = v => '\u20B1' + nf(v);
    const top = Math.max(...DECK.competitors.map(c => c.max || c.fiveYear));
    const rows = DECK.competitors.map(c => c.min
      ? { name: c.name, logo: c.logo, sub: c.model, lo: c.min, hi: c.max, val: `${peso(c.min)}–${nf(c.max)}` }
      : { name: c.name, logo: c.logo, sub: c.model, lo: c.fiveYear, val: peso(c.fiveYear) });
    rows.push({ us: true, name: 'FishPin', logo: 'assets/pitch/play-icon.png', sub: `Pay once, after a ${DECK.trialDays}-day free trial`, lo: DECK.price, val: `${peso(DECK.price)} once` });
    box.innerHTML = rows.map((r, i) => {
      const at = (0.5 + i * 0.35).toFixed(2);
      const bar = r.hi
        ? `<i class="range" style="width:${(r.hi / top) * 100}%" data-grow data-grow-at="${at}"></i><i style="width:${(r.lo / top) * 100}%" data-grow data-grow-at="${at}"></i>`
        : `<i style="width:${(r.lo / top) * 100}%" data-grow data-grow-at="${at}"></i>`;
      return `<div class="cp-row${r.us ? ' us' : ''}" data-rise data-at="${(0.4 + i * 0.35).toFixed(2)}"><div class="cp-who"><img class="cp-logo" src="${r.logo}" alt="${r.name} logo"><p class="cp-name"><b>${r.name}</b><span>${r.sub}</span></p></div><div class="cp-track">${bar}</div><p class="cp-val num">${r.val}</p></div>`;
    }).join('');
  });

  /* 05 the solution: the three phones lift and settle */
  ANIM.solution = (s, t) => t.fromTo($('.so-phones', s), { scale: 0.94 }, { scale: 1, duration: 1.4, ease: 'power2.out', clearProps: 'transform' }, 0.25);

  /* backup: airplane mode flips on, then the chart keeps working */
  ANIM['demo-chart'] = (s, t) => {
    const tog = $('#airToggle', s);
    tog.classList.add('off');
    t.call(() => tog.classList.remove('off'), null, 1.3);
  };

  /* 09 demo: local fish names from the species guide */
  RENDER.push(function fishChips() {
    const box = $('#fishChips');
    if (box) box.innerHTML = DECK.fishNames.slice(0, 8).map(n => `<span data-pop data-at="${(1.7 + DECK.fishNames.indexOf(n) * 0.08).toFixed(2)}">${n}</span>`).join('');
  });

  /* 10 value: the search zigzag, then the straight line back to the proven spot */
  ANIM.value = (s, t) => { draw(t, $('.v-route .search', s), 1.3, 0.9); draw(t, $('.v-route .straight', s), 2.0, 0.6); };

  /* 13 business: the seven trial days */
  RENDER.push(function trialDays() {
    const box = $('#trialDays');
    if (box) box.innerHTML = Array.from({ length: DECK.trialDays }, (_, i) => `<span data-pop data-at="${(0.45 + i * 0.07).toFixed(2)}">${i + 1}</span>`).join('');
  });

  /* 14 go-to-market: towns on the coast (closing.tsx TOWNS, in the map's 1920x1080 space) and one mark per session */
  const TOWN_XY = { Bansud: [451, 140], Bongabong: [490, 285], Roxas: [531, 491], Mansalay: [430, 573], Bulalacao: [330, 800] };
  RENDER.push(function gtmTowns() {
    const box = $('#gtmTowns'), tally = $('#gtmTally');
    if (box) box.innerHTML = DECK.gtm.towns.map((n, i) => {
      const [x, y] = TOWN_XY[n] || [0, 0];
      // the map's viewBox starts at (80, 20) and is drawn at 1:1, so a town sits 80px left and 20px up
      return `<span class="town${n === DECK.gtm.home ? ' home' : ''}" style="left:${x - 80}px;top:${y - 20}px" data-pop data-at="${(0.4 + i * 0.12).toFixed(2)}"><i></i>${n}</span>`;
    }).join('');
    if (tally) tally.innerHTML = Array.from({ length: DECK.gtm.coopSessions }, () => '<i data-icon="users"></i>').join('');
  });
  ANIM.gtm = (s, t) => { draw(t, $('.g-map .coast', s), 0.1, 1.0); };

  /* 15 financials: the funding bar in proportion, the year-one ramp, and the payback month */
  RENDER.push(function finParts() {
    const f = DECK.fin;
    [['segProv', f.grantProvincial], ['segReg', f.grantRegional], ['segNat', f.grantNational], ['segCp', f.counterpart]].forEach(([id, v]) => {
      const el = $('#' + id); if (el) el.style.width = `${(v / f.total) * 100}%`;
    });
    const ramp = $('#finRamp'), top = Math.max(...f.ramp);
    if (ramp) ramp.innerHTML = f.ramp.map((n, i) => `<i style="height:${(n / top) * 100}%" data-grow-y data-at="${(1.8 + i * 0.05).toFixed(2)}"></i>`).join('');
    const months = Math.round(f.payback * 12);
    if ($('#paybackMonth')) $('#paybackMonth').textContent = String(months);
    if ($('#paybackMonths')) $('#paybackMonths').textContent = String(months);
  });
  ANIM.financials = (s, t) => {
    const b = $('#paybackMonth', s), months = Number(b.textContent), o = { m: 1 };
    t.fromTo(o, { m: 1 }, { m: months, duration: 1.0, ease: 'power1.in', onUpdate: () => { b.textContent = String(Math.round(o.m)); }, onComplete: () => { b.textContent = String(months); } }, 2.0);
    t.fromTo($('.cal .paid', s), { scale: 1.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2)', clearProps: 'transform,opacity' }, 3.05);
  };

  /* 15 close: the AVP's call to action, revealed in its steps (the line sharpening into place, then the English) */
  ANIM.close = (s, t) => {
    t.fromTo($('.cta-media', s), { opacity: 0 }, { opacity: 1, duration: 1.0, ease: 'power1.out', clearProps: 'opacity' }, 0);
    t.fromTo($('.cta-line', s), { opacity: 0, y: 18, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.87, ease: 'power3.out', clearProps: 'opacity,transform,filter' }, 0.4);
    t.fromTo($('.cta-en', s), { opacity: 0 }, { opacity: 1, duration: 0.73, ease: 'power3.out', clearProps: 'opacity' }, 1.13);
  };

  /* Q&A appendix: tables and the licence ramp are built from DECK so they can never drift */
  RENDER.push(function appendixTables() {
    const f = DECK.fin;
    const php = v => 'PHP ' + nf(v, Number.isInteger(v) ? 0 : 2);
    const rows = items => items.map(i => `<tr><td>${i.label}</td><td class="num">${php(i.amount)}</td></tr>`).join('');
    const capex = $('#q-costs .capex tbody');
    if (capex) capex.innerHTML = rows(f.capexItems) + `<tr class="total"><td>Capital expense</td><td class="num">${php(f.capex)}</td></tr>`;
    const opex = $('#q-costs .opex tbody');
    if (opex) opex.innerHTML = rows(f.opexItems) + `<tr class="total"><td>Operating expense, 12 months</td><td class="num">${php(f.opex)}</td></tr>`;

    const ramp = $('#q-cashflow .ramp');
    if (ramp) {
      const max = Math.max(...f.ramp);
      ramp.innerHTML = f.ramp.map((v, i) => `<div class="rb"><b>${v}</b><i style="height:${(v / max * 78).toFixed(1)}%"></i><span>M${i + 1}</span></div>`).join('');
    }

    const sens = $('#q-sensitivity .sens tbody');
    if (sens) {
      sens.innerHTML = f.sensitivity.map(r => `<tr${r.units === f.unitsY1 ? ' class="headline"' : ''}><td>${nf(r.units)}</td><td class="num">${php(r.net)}</td><td class="num">${nf(r.roi, 2)}%</td><td class="num">${nf(r.payback, 2)} yrs</td></tr>`).join('');
    }

    const comp = $('#q-competitors .comp');
    if (comp) {
      const cols = [
        { name: 'FishPin', us: true, price: `${php(DECK.price)} once`, model: `One-time, after a ${DECK.trialDays}-day free trial`, five: php(DECK.price), built: 'Filipino municipal fishermen' },
        ...DECK.competitors.map(c => c.min
          ? { name: c.name, price: `${php(c.min)} to ${nf(c.max)}`, model: c.model, five: `${php(c.min)} to ${nf(c.max)}`, built: c.builtFor }
          : { name: c.name, price: `${php(c.perYear)} a year`, model: c.model, five: php(c.fiveYear), built: c.builtFor }),
      ];
      const cell = (c, v, tag = 'td') => `<${tag}${c.us ? ' class="us"' : ''}>${v}</${tag}>`;
      $('thead', comp).innerHTML = `<tr><th></th>${cols.map(c => cell(c, c.name, 'th')).join('')}</tr>`;
      $('tbody', comp).innerHTML = [['Price', 'price'], ['Pricing', 'model'], ['Five-year cost', 'five'], ['Built for', 'built']]
        .map(([label, key]) => `<tr><td>${label}</td>${cols.map(c => cell(c, c[key])).join('')}</tr>`).join('');
    }
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
    document.body.classList.toggle('no-foot-mark', !appx); // the video-style slides carry no footer logo; the counter stays
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
  }).then(() => {
    onSlide(Reveal.getCurrentSlide());
    window.__deckReady = true;
  });
})();

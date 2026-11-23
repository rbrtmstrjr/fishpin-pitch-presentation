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

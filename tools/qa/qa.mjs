// Browser QA for the FishPin national pitch deck.
// Opens FishPin-Pitch.html over file:// in Chrome with every network request blocked
// (the venue may have no internet), steps through every slide, and fails on: runtime
// errors, blocked requests, elements outside the 1920x1080 frame, text under 28px on
// main slides, unfilled numbers, broken images, text still hidden after the entrance,
// wrong counters, speaker notes over their time budget, slide-specific facts, and
// broken interactions (airplane toggle, SOS hold, Q menu, Esc return, clicker guard, timer).
//
// Usage (from the deck root):
//   node tools/qa/qa.mjs                  full check; screenshots + rendered.txt in tools/qa/out/
//   node tools/qa/qa.mjs --only=cover     only these slide ids (comma separated)
//   node tools/qa/qa.mjs --notes          also require speaker notes on every main slide
//   node tools/qa/qa.mjs --viewports      also check 16:10 and 4:3 letterboxing
//   node tools/qa/qa.mjs --export         also write exports/png/*.png and exports/FishPin-Pitch.pdf
import { chromium } from 'playwright-core';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = resolve(import.meta.dirname, '..', '..');
const OUT = join(ROOT, 'tools', 'qa', 'out');
const EXPORTS = join(ROOT, 'exports');
const DECK_URL = pathToFileURL(join(ROOT, 'FishPin-Pitch.html')).href;
const argv = process.argv.slice(2);
const has = name => argv.includes(`--${name}`);
const only = argv.find(a => a.startsWith('--only='))?.slice('--only='.length).split(',') ?? null;

const WORDS_PER_MINUTE = 140;
const MAIN_SECONDS = 280;
const MIN_FONT = 28;
const DEFAULT_WAIT = 1800;
const WAIT = { problem: 2600, offline: 3000, traction: 2600, model: 2200, market: 2200, gtm: 3000, financials: 2400, impact: 5200, close: 2800 };

/* Slide facts that must hold once the slide has settled. Each returns '' or an error. */
const CHECKS = {
  problem: () => {
    const dots = document.querySelectorAll('#problem .dot').length;
    const lit = document.querySelectorAll('#problem .dot.gps').length;
    if (dots !== DECK.market.barangayFishermen) return `expected ${DECK.market.barangayFishermen} dots, found ${dots}`;
    if (lit !== DECK.market.barangayGps) return `expected ${DECK.market.barangayGps} lit dots, found ${lit}`;
    return document.getElementById('gpsCount').textContent.trim() === String(DECK.market.barangayGps) ? '' : 'GPS counter did not land on the data value';
  },
  solution: () => document.querySelectorAll('#solution [data-tile]').length === 6 && document.querySelectorAll('#solution .scr').length === 6 ? '' : 'solution needs 6 tiles and 6 screens',
  novelty: () => document.querySelectorAll('#novelty .track span').length >= DECK.fishNames.length * 2 ? '' : 'fish-name rows are not filled',
  traction: () => document.querySelectorAll('#traction .ms').length === DECK.traction.milestones.length ? '' : 'timeline does not match DECK.traction.milestones',
  model: () => document.querySelectorAll('#model .bar-row').length === DECK.competitors.length + 1 ? '' : 'cost bars do not match DECK.competitors plus FishPin',
  market: () => document.querySelectorAll('#market .ring').length === 3 ? '' : 'market needs 3 rings',
  gtm: () => document.querySelectorAll('#gtm .town').length === DECK.gtm.towns.length ? '' : 'coast map does not show every town',
  financials: () => document.querySelectorAll('#financials .stack i').length === 3 ? '' : 'funding stack needs 3 segments',
  impact: () => document.getElementById('sos').dataset.state === 'sent' ? '' : 'SOS demo did not reach the sent state',
  close: () => { const b = document.querySelector('#close .boat'); return b && b.style.transform ? '' : 'boat is not placed on the route'; },
};

const failures = [];
const warnings = [];
const fail = (where, msg) => failures.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);
const pad = n => String(n).padStart(2, '0');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const run = id => !only || only.includes(id);
async function phase(name, fn) {
  try { return await fn(); } catch (e) { fail(name, `crashed: ${String(e && e.message || e).split('\n')[0]}`); return undefined; }
}

const browser = await chromium.launch({ channel: 'chrome' });

async function open(query = '', viewport = { width: 1920, height: 1080 }) {
  const context = await browser.newContext({ viewport });
  const errors = [];
  await context.route('**/*', route => {
    const url = route.request().url();
    if (/^(file|data|blob|about):/.test(url)) return route.continue();
    errors.push(`network request blocked: ${url}`);
    return route.abort();
  });
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(`page error: ${e.message}`));
  page.on('console', m => { if (m.type() === 'error') errors.push(`console error: ${m.text()}`); });
  page.on('requestfailed', r => { if (!/^https?:/.test(r.url())) errors.push(`failed to load: ${r.url()}`); });
  let ready = true;
  try {
    await page.goto(DECK_URL + query);
    await page.waitForFunction(() => window.__deckReady === true, null, { timeout: 15000 });
  } catch (e) {
    ready = false;
    errors.push(`deck did not become ready: ${e.message.split('\n')[0]}`);
  }
  return { context, page, errors, ready };
}

const slideList = page => page.evaluate(() => [...document.querySelectorAll('.reveal .slides > section')]
  .map((s, i) => ({ i, id: s.id, appendix: s.hasAttribute('data-appendix'), time: Number(s.dataset.time || 0) })));
const goTo = (page, id) => page.evaluate(id => {
  const all = [...document.querySelectorAll('.reveal .slides > section')];
  Reveal.slide(all.findIndex(s => s.id === id));
}, id);
const currentId = page => page.evaluate(() => Reveal.getCurrentSlide().id);

/* Runs inside the page: measures the current slide once it has settled. */
function inspect(minFont) {
  const sec = Reveal.getCurrentSlide();
  const main = !sec.hasAttribute('data-appendix');
  const box = sec.getBoundingClientRect();
  const k = box.width / 1920;
  const name = el => el.id ? `#${el.id}` : `${el.tagName.toLowerCase()}${el.classList.length ? '.' + [...el.classList].join('.') : ''}`;
  const shown = el => (typeof el.checkVisibility === 'function') ? el.checkVisibility({ visibilityProperty: true, checkVisibilityCSS: true }) : (getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden');
  const exempt = el => el.closest('aside.notes, [data-bleed], [data-ui]');
  const els = [...sec.querySelectorAll('*')].filter(el => !el.closest('aside.notes'));
  const overflow = els.filter(el => {
    if (exempt(el) || !shown(el)) return false;
    const b = el.getBoundingClientRect();
    if (!b.width || !b.height) return false;
    const l = (b.left - box.left) / k, t = (b.top - box.top) / k, r = (b.right - box.left) / k, btm = (b.bottom - box.top) / k;
    return l < -2 || t < -2 || r > 1922 || btm > 1082;
  }).slice(0, 5).map(name);
  const tiny = main ? els.filter(el => {
    if (exempt(el) || !shown(el)) return false;
    const ownText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    return ownText && parseFloat(getComputedStyle(el).fontSize) < minFont - 0.5;
  }).slice(0, 5).map(el => `${name(el)} (${getComputedStyle(el).fontSize})`) : [];
  const unbound = [...sec.querySelectorAll('[data-k]')].filter(el => !el.textContent.trim() || /undefined|NaN/.test(el.textContent)).map(el => el.dataset.k);
  const broken = [...sec.querySelectorAll('img')].filter(im => !im.complete || !im.naturalWidth).map(im => im.getAttribute('src'));
  const hidden = [...sec.querySelectorAll('[data-rise]')].filter(el => parseFloat(getComputedStyle(el).opacity) < 0.95).map(name);
  const counter = document.getElementById('slideCounter')?.textContent.trim() ?? '';
  const notes = sec.querySelector('aside.notes')?.textContent.trim() ?? '';
  return { overflow, tiny, unbound, broken, hidden, counter, notes, text: sec.innerText.trim() };
}

async function checkSlides() {
  const { context, page, errors, ready } = await open();
  try {
    return await checkSlidesInner(page, ready);
  } finally {
    errors.forEach(e => fail('runtime', e));
    await context.close();
  }
}

async function checkSlidesInner(page, ready) {
  if (!ready) return [];
  const slides = await slideList(page);
  if (!slides.length) { fail('slides', 'deck has no slides'); return []; }
  const mains = slides.filter(s => !s.appendix);
  if (only) only.filter(id => !slides.some(s => s.id === id)).forEach(id => fail('slides', `no slide with id "${id}"`));

  const data = await page.evaluate(() => ({ problems: DECK.verify(), pending: DECK.pending() }));
  data.problems.forEach(p => fail('DECK.verify', p));
  if (data.pending.length) warn('DECK.pending', `not yet confirmed: ${data.pending.join(', ')}`);

  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });
  let rendered = '';
  for (const s of slides) {
    if (!run(s.id)) continue;
    await goTo(page, s.id);
    const wait = WAIT[s.id] ?? DEFAULT_WAIT;
    await sleep(wait);
    const r = await page.evaluate(inspect, MIN_FONT);
    const where = `${pad(s.i + 1)} ${s.id}`;
    if (r.overflow.length) fail(where, `outside the 1920x1080 frame: ${r.overflow.join(', ')}`);
    if (r.tiny.length) fail(where, `text below ${MIN_FONT}px: ${r.tiny.join(', ')}`);
    if (r.unbound.length) fail(where, `unfilled data: ${r.unbound.join(', ')}`);
    if (r.broken.length) fail(where, `broken images: ${r.broken.join(', ')}`);
    if (r.hidden.length) fail(where, `still hidden after ${wait}ms: ${r.hidden.join(', ')}`);
    if (s.appendix) {
      if (!r.counter.startsWith('Q&A')) fail(where, `counter shows "${r.counter}", expected Q&A`);
    } else {
      const want = `${pad(mains.findIndex(m => m.id === s.id) + 1)} / ${pad(mains.length)}`;
      if (r.counter !== want) fail(where, `counter shows "${r.counter}", expected "${want}"`);
      if (!s.time) fail(where, 'main slide has no data-time');
      const words = r.notes ? r.notes.split(/\s+/).length : 0;
      const budget = Math.ceil(s.time * WORDS_PER_MINUTE / 60);
      if (words > budget) fail(where, `speaker notes are ${words} words; budget is ${budget} for ${s.time}s`);
      if (has('notes') && !words) fail(where, 'speaker notes missing');
    }
    if (CHECKS[s.id]) {
      const msg = await page.evaluate(`(${CHECKS[s.id]})()`);
      if (msg) fail(where, msg);
    }
    await page.screenshot({ path: join(OUT, `${pad(s.i + 1)}-${s.id}.png`) });
    rendered += `=== ${s.id} [${s.appendix ? 'appendix' : 'main'}] ===\n${r.text}\n--- notes ---\n${r.notes}\n\n`;
  }
  if (!only) {
    const total = mains.reduce((t, s) => t + s.time, 0);
    if (has('notes')) {
      if (mains.length !== 12) fail('deck shape', `expected 12 main slides, found ${mains.length}`);
      if (total !== MAIN_SECONDS) fail('timing', `main slides add up to ${total}s; expected ${MAIN_SECONDS}s`);
    } else if (total > MAIN_SECONDS) {
      fail('timing', `main slides add up to ${total}s; budget is ${MAIN_SECONDS}s`);
    }
  }
  writeFileSync(join(OUT, 'rendered.txt'), rendered, 'utf8');
  await phase('interactions', () => checkInteractions(page, slides));
  return slides;
}

async function checkInteractions(page, slides) {
  const ids = new Set(slides.map(s => s.id));
  const attr = (sel, a) => page.evaluate(([sel, a]) => document.querySelector(sel)?.getAttribute(a), [sel, a]);

  if (ids.has('offline') && run('offline')) {
    await goTo(page, 'offline'); await sleep(3000);
    if (await attr('#airSwitch', 'aria-checked') !== 'true') fail('offline', 'airplane switch did not flip on by itself');
    await page.keyboard.press('m'); await sleep(500);
    if (await attr('#airSwitch', 'aria-checked') !== 'false') fail('offline', 'M key did not toggle airplane mode');
    await page.click('#airSwitch'); await sleep(500);
    if (await attr('#airSwitch', 'aria-checked') !== 'true') fail('offline', 'click did not toggle airplane mode');
  }

  if (ids.has('impact') && run('impact')) {
    await goTo(page, 'impact'); await sleep(5200);
    if (await attr('#sos', 'data-state') !== 'sent') fail('impact', 'SOS demo did not finish on its own');
    const b = await page.locator('#sosBtn').boundingBox();
    if (!b) {
      fail('impact', '#sosBtn has no bounding box');
    } else {
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
      await page.mouse.down(); await sleep(800); await page.mouse.up(); await sleep(700);
      if (await attr('#sos', 'data-state') !== 'idle') fail('impact', 'a short press did not reset the SOS ring');
      await page.mouse.down(); await sleep(3400); await page.mouse.up(); await sleep(400);
      if (await attr('#sos', 'data-state') !== 'sent') fail('impact', 'a full hold did not send');
    }
  }

  const appx = slides.find(s => s.appendix);
  const home = slides.find(s => s.id === 'financials') ?? slides.find(s => !s.appendix && s.id !== 'close');
  if (appx && home && !only) {
    await goTo(page, home.id); await sleep(500);
    await page.keyboard.press('q'); await sleep(300);
    if (!(await page.evaluate(() => document.getElementById('qmenu').classList.contains('open')))) fail('q-menu', 'Q did not open the menu');
    await page.click(`#qmenu [data-target="${appx.id}"]`); await sleep(700);
    if (await currentId(page) !== appx.id) fail('q-menu', `menu click did not jump to ${appx.id}`);
    await page.keyboard.press('Escape'); await sleep(700);
    if (await currentId(page) !== home.id) fail('q-menu', `Esc did not return to ${home.id}`);
    await page.keyboard.press('q'); await sleep(300); await page.keyboard.press('1'); await sleep(700);
    if (await currentId(page) !== appx.id) fail('q-menu', 'number key 1 did not open the first backup slide');
    await page.keyboard.press('Backspace'); await sleep(700);
    if (await currentId(page) !== home.id) fail('q-menu', `Backspace did not return to ${home.id}`);
  }

  if (ids.has('close') && !only) {
    await goTo(page, 'close'); await sleep(500);
    for (const key of ['ArrowRight', 'PageDown', 'Space']) {
      await page.keyboard.press(key); await sleep(400);
      if (await currentId(page) !== 'close') fail('clicker', `${key} on the last main slide left it`);
    }
  }

  if (!only) {
    await page.keyboard.press('t'); await sleep(200);
    if (await page.evaluate(() => document.getElementById('timer').classList.contains('hidden'))) fail('timer', 'T did not show the timer');
    await sleep(1300); await page.keyboard.press('r'); await sleep(300);
    const label = await page.evaluate(() => document.getElementById('timerLabel').textContent);
    if (label !== '0:00') fail('timer', `R did not reset the timer (shows ${label})`);
    await page.keyboard.press('t');
  }
}

async function checkStatic() {
  const { context, page, errors, ready } = await open('?static=1');
  if (ready) {
    for (const s of await slideList(page)) {
      if (!run(s.id)) continue;
      await goTo(page, s.id); await sleep(250);
      const r = await page.evaluate(inspect, MIN_FONT);
      if (r.hidden.length) fail(`static ${s.id}`, `hidden in static mode: ${r.hidden.join(', ')}`);
      if (r.unbound.length) fail(`static ${s.id}`, `unfilled data: ${r.unbound.join(', ')}`);
    }
  }
  errors.forEach(e => fail('static runtime', e));
  await context.close();
}

async function checkViewports() {
  for (const vp of [{ width: 1280, height: 800 }, { width: 1024, height: 768 }]) {
    const { context, page, errors } = await open('', vp);
    const slides = await slideList(page);
    for (const s of [slides.find(x => !x.appendix), slides.find(x => x.appendix)].filter(Boolean)) {
      await goTo(page, s.id); await sleep(1200);
      const bg = await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor);
      const want = s.appendix ? 'rgb(238, 244, 251)' : 'rgb(6, 18, 51)';
      if (bg !== want) fail(`viewport ${vp.width}x${vp.height}`, `letterbox on ${s.id} is ${bg}, expected ${want}`);
      await page.screenshot({ path: join(OUT, `vp-${vp.width}x${vp.height}-${s.id}.png`) });
    }
    errors.forEach(e => fail(`viewport ${vp.width}x${vp.height}`, e));
    await context.close();
  }
}

async function checkSpeakerView() {
  const { context, page, errors } = await open();
  try {
    const [popup] = await Promise.all([context.waitForEvent('page', { timeout: 6000 }), page.keyboard.press('s')]);
    await sleep(3000);
    const text = await popup.evaluate(() => document.body.innerText);
    if (!/notes/i.test(text)) warn('speaker view', 'opened but shows no notes panel');
    await popup.close();
  } catch (e) {
    warn('speaker view', `did not open over file:// (${e.message.split('\n')[0]}). Use the Vercel link or "python -m http.server" for speaker view.`);
  }
  errors.forEach(e => fail('speaker view runtime', e));
  await context.close();
}

async function exportBackups(slides) {
  rmSync(EXPORTS, { recursive: true, force: true });
  mkdirSync(join(EXPORTS, 'png'), { recursive: true });
  const still = await open('?static=1');
  for (const s of slides) {
    await goTo(still.page, s.id); await sleep(300);
    await still.page.screenshot({ path: join(EXPORTS, 'png', `${pad(s.i + 1)}-${s.id}.png`) });
  }
  still.errors.forEach(e => fail('export png', e));
  await still.context.close();

  const print = await open('?print-pdf');
  await print.page.waitForFunction(() => window.__pdfReady === true, null, { timeout: 30000 })
    .catch(() => fail('export pdf', 'Reveal never reported pdf-ready'));
  await sleep(1500);
  const file = join(EXPORTS, 'FishPin-Pitch.pdf');
  await print.page.pdf({ path: file, printBackground: true, preferCSSPageSize: true });
  const pages = (readFileSync(file, 'latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  if (pages !== slides.length) fail('export pdf', `PDF has ${pages} pages, expected ${slides.length}`);
  print.errors.forEach(e => fail('export pdf', e));
  await print.context.close();
}

let slides = [];
try {
  slides = (await phase('slides', checkSlides)) ?? [];
  if (slides.length) {
    await phase('static', checkStatic);
    if (has('viewports')) await phase('viewports', checkViewports);
    if (has('notes')) await phase('speaker view', checkSpeakerView);
    if (has('export')) await phase('export', () => exportBackups(slides));
  }
} finally {
  await browser.close();
}
warnings.forEach(w => console.log(`warn  ${w}`));
failures.forEach(f => console.log(`FAIL  ${f}`));
console.log(`\n${slides.length} slide(s) checked, ${failures.length} failure(s), ${warnings.length} warning(s). Screenshots: tools/qa/out/`);
process.exit(failures.length ? 1 : 0);

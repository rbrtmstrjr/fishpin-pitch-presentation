// Records each slide's finished frame as a list of layers, for tools/figma/build.js to rebuild
// in Figma as editable layers (text, boxes, images, vectors). Opens the deck in still mode
// (final states, no motion) at 1920x1080.
//
//   node tools/figma/extract.mjs                writes tools/qa/out/figma/<slide>.json for every main slide
//   node tools/figma/extract.mjs hook,financials   only these slides
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = resolve(import.meta.dirname, '..', '..');
const OUT = join(ROOT, 'tools', 'qa', 'out', 'figma');
const require = createRequire(join(ROOT, 'tools', 'qa', 'package.json'));
const { chromium } = require('playwright-core');
const only = (process.argv[2] || '').split(',').filter(Boolean);

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
await page.goto(pathToFileURL(join(ROOT, 'FishPin-Pitch.html')).href + '?static=1');
await page.waitForFunction(() => window.__deckReady === true);
await page.evaluate(() => document.fonts.ready);
const ids = await page.evaluate(() => [...document.querySelectorAll('.reveal .slides > section')].filter(s => !s.hasAttribute('data-appendix')).map(s => s.id));
const root = pathToFileURL(ROOT).href + '/';

for (const id of ids.filter(i => !only.length || only.includes(i))) {
  await page.evaluate(id => { const all = [...document.querySelectorAll('.reveal .slides > section')]; Reveal.slide(all.findIndex(s => s.id === id)); }, id);
  await page.waitForTimeout(700);
  const layers = await page.evaluate(([id, root]) => {
    const sec = document.getElementById(id);
    const S = sec.getBoundingClientRect();
    const k = S.width / 1920;
    const out = [];
    const rel = src => decodeURIComponent(src.replace(root, ''));
    const box = el => { const r = el.getBoundingClientRect(); return { x: (r.left - S.left) / k, y: (r.top - S.top) / k, w: r.width / k, h: r.height / k }; };
    const angle = t => { if (!t || t === 'none') return 0; const m = t.match(/matrix\(([^)]+)\)/); if (!m) return 0; const [a, b] = m[1].split(',').map(Number); return Math.atan2(b, a) * 180 / Math.PI; };
    const visible = (el, cs) => cs.display !== 'none' && cs.visibility !== 'hidden' && Number(cs.opacity) > 0.01;
    const STYLE = ['fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'opacity', 'fill-opacity', 'stroke-opacity', 'font-family', 'font-size', 'font-weight'];
    const inlineSvg = svg => {
      const clone = svg.cloneNode(true);
      const a = [svg, ...svg.querySelectorAll('*')], b = [clone, ...clone.querySelectorAll('*')];
      a.forEach((el, i) => {
        const cs = getComputedStyle(el);
        STYLE.forEach(p => { const v = cs.getPropertyValue(p); if (v && v !== 'none' || p === 'fill') b[i].setAttribute(p, v); });
        b[i].removeAttribute('class'); b[i].removeAttribute('pathLength'); b[i].removeAttribute('style');
      });
      const r = svg.getBoundingClientRect();
      clone.setAttribute('width', r.width / k); clone.setAttribute('height', r.height / k);
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      return clone.outerHTML;
    };
    const runStyle = (el) => { const cs = getComputedStyle(el); return { family: cs.fontFamily.split(',')[0].replace(/["']/g, '').trim(), weight: Number(cs.fontWeight), size: parseFloat(cs.fontSize) , color: cs.color, ls: cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing), upper: cs.textTransform === 'uppercase', lh: cs.lineHeight === 'normal' ? null : parseFloat(cs.lineHeight) }; };
    // a text block: the element's own text plus its inline descendants' text, as styled runs
    const textBlock = el => {
      const runs = []; const range = document.createRange(); const rects = []; const own = [];
      const visit = node => {
        for (const n of node.childNodes) {
          if (n.nodeType === 3) {
            const t = n.textContent.replace(/\s+/g, ' ');
            if (!t.trim() && !runs.length) continue;
            range.selectNodeContents(n); [...range.getClientRects()].forEach(r => rects.push(r));
            runs.push({ text: t, ...runStyle(n.parentElement) });
            if (n.parentElement === el) [...range.getClientRects()].forEach(r => own.push(r));
          } else if (n.nodeType === 1) {
            const cs = getComputedStyle(n);
            if (!visible(n, cs) || n.matches('svg, img, [data-icon]')) { if (visible(n, cs)) walk(n); continue; }
            if (n.tagName === 'BR') { runs.push({ text: '\n', ...runStyle(node) }); continue; }
            const boxy = cs.display.includes('block') && (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || parseFloat(cs.borderTopWidth) > 0);
            if (boxy) { walk(n); continue; }
            visit(n);
          }
        }
      };
      visit(el);
      if (!runs.length || !rects.length) return;
      // trim the outer whitespace the source indentation left
      runs[0].text = runs[0].text.replace(/^\s+/, ''); runs[runs.length - 1].text = runs[runs.length - 1].text.replace(/\s+$/, '');
      // left and right from every run; top and bottom from the block's own text, so a mono number inside
      // a Poppins line does not shift the line's measured box
      const v = own.length ? own : rects;
      const L = Math.min(...rects.map(r => r.left)), T = Math.min(...v.map(r => r.top)), R = Math.max(...rects.map(r => r.right)), B = Math.max(...v.map(r => r.bottom));
      const cs = getComputedStyle(el);
      // lines: the block's own line boxes, merging tops a few px apart (a mono number sits slightly lower)
      let lines = 0, last = -1e9;
      for (const t of v.map(r => r.top).sort((p, q) => p - q)) { if (t - last > 12) { lines++; last = t; } }
      out.push({ kind: 'text', x: (L - S.left) / k, y: (T - S.top) / k, w: (R - L) / k, h: (B - T) / k, align: cs.textAlign, multi: lines > 1, lines, shadow: cs.textShadow, runs });
    };
    const walk = el => {
      const cs = getComputedStyle(el);
      if (!visible(el, cs) || el.matches('aside.notes')) return;
      if (el.classList.contains('sea')) { out.push({ kind: 'sea' }); return; }
      const tag = el.tagName.toLowerCase();
      const b = box(el);
      const rot = angle(cs.transform);
      const size = { ow: el.offsetWidth || b.w, oh: el.offsetHeight || b.h };
      if (tag === 'img') { out.push({ kind: 'img', src: rel(el.currentSrc || el.src), ...b, ...size, rot, fit: cs.objectFit, shadow: cs.filter, opacity: Number(cs.opacity), radius: parseFloat(cs.borderTopLeftRadius) || 0 }); return; }
      if (tag === 'video') { out.push({ kind: 'img', src: rel(el.poster), ...b, ...size, rot: 0, fit: 'cover', opacity: 1 }); return; }
      if (tag === 'svg') { out.push({ kind: 'svg', svg: inlineSvg(el), ...b, rot }); return; }
      const bg = cs.backgroundColor, bgi = cs.backgroundImage, bw = parseFloat(cs.borderTopWidth) || 0;
      if (el !== sec && ((bg && bg !== 'rgba(0, 0, 0, 0)') || (bgi && bgi !== 'none') || bw > 0)) {
        out.push({ kind: 'box', ...b, ...size, rot, bg, bgi, bw, bc: cs.borderTopColor, radius: parseFloat(cs.borderTopLeftRadius) || 0, shadow: cs.boxShadow, blur: cs.backdropFilter, opacity: Number(cs.opacity) });
      }
      const ownText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
      if (ownText) { textBlock(el); return; }
      for (const c of el.children) walk(c);
    };
    const secCs = getComputedStyle(sec);
    const glow = { gx: parseFloat(secCs.getPropertyValue('--gx')) / 100 || 0.7, gy: parseFloat(secCs.getPropertyValue('--gy')) / 100 || 0.4 };
    walk(sec);
    return { id, glow, contour: sec.classList.contains('contour'), bg: secCs.backgroundColor, layers: out };
  }, [id, root]);
  writeFileSync(join(OUT, `${id}.json`), JSON.stringify(layers));
  console.log(`${id}: ${layers.layers.length} layers`);
}
await browser.close();

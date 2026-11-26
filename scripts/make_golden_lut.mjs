// Captures the national AVP's golden grade, as Chrome draws it, into a 3D LUT for ffmpeg.
// The AVP (Remotion, so Chrome) grades its last shot with the CSS filter below. Chrome draws a grid of
// every colour on a 33-step cube with that filter, and the result is written as a .cube file that
// scripts/build_cta_video.py bakes into assets/video/cta-sea.mp4 (so the slide filters nothing live).
// Run: node scripts/make_golden_lut.mjs   (uses tools/qa's playwright-core and local Chrome)
import { chromium } from '../tools/qa/node_modules/playwright-core/index.mjs';
import { writeFileSync } from 'node:fs';
import { PNG } from '../tools/qa/node_modules/playwright-core/lib/utilsBundle.js';

const N = 33, FILTER = 'sepia(.24) saturate(1.28) contrast(1.06) brightness(1.04)';
const W = N * N, H = N;
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await p.setContent(`<body style="margin:0"><canvas id="c" width="${W}" height="${H}" style="display:block;filter:${FILTER}"></canvas></body>`);
await p.evaluate(([N, W, H]) => {
  const ctx = document.getElementById('c').getContext('2d'); const img = ctx.createImageData(W, H);
  const v = i => Math.round(i * 255 / (N - 1));
  for (let bl = 0; bl < N; bl++) for (let g = 0; g < N; g++) for (let r = 0; r < N; r++) {
    const o = (g * W + bl * N + r) * 4; img.data[o] = v(r); img.data[o + 1] = v(g); img.data[o + 2] = v(bl); img.data[o + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}, [N, W, H]);
const png = PNG.sync.read(await p.screenshot({ type: 'png' }));
await b.close();
const lines = [`TITLE "FishPin AVP golden grade: ${FILTER}"`, `LUT_3D_SIZE ${N}`];
for (let bl = 0; bl < N; bl++) for (let g = 0; g < N; g++) for (let r = 0; r < N; r++) {
  const o = (g * W + bl * N + r) * 4;
  lines.push([0, 1, 2].map(k => (png.data[o + k] / 255).toFixed(6)).join(' '));
}
writeFileSync(new URL('./golden.cube', import.meta.url), lines.join('\n') + '\n');
console.log(`wrote scripts/golden.cube (${N}^3 colours, graded by Chrome)`);

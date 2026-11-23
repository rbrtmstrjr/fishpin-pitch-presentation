// Builds the deck's slide clips from a clean copy of the FishPin Pitch 2026 source.
//
//   node scripts/build_clips.mjs                 render every section, then cut every clip
//   node scripts/build_clips.mjs --only=problem  render (and cut) only these sections
//   node scripts/build_clips.mjs --cut           cut clips from the last section renders
//
// Source: video/ in this repo (a copy of fishpin-brand/15-video/src/pitch5 and its
// imports, with captions off and the deck's numbers in). Footage and images are read,
// never written, from fishpin-brand/15-video/public. Heavy work happens in a build
// folder outside OneDrive (%LOCALAPPDATA%/fishpin-deck-clips): node_modules, the
// public subset, the bundle and the section renders.
// Output: assets/clips/<id>.mp4 (muted, H.264) and assets/clips/<id>.jpg (its last frame).
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'video');
const BRAND_PUBLIC = join(homedir(), 'OneDrive', 'Documents', 'fishpin-brand', '15-video', 'public');
const BUILD = join(process.env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local'), 'fishpin-deck-clips');
const OUT = join(ROOT, 'assets', 'clips');
const PUBLIC_PARTS = ['pitch5', 'mockups', 'pitch', 'sfx', 'fonts', 'photos', 'shots', 'logo-white.svg'];

// Sections of the pitch timeline (global seconds), each rendered once.
const SECTIONS = {
  hook: [5, 25],
  problem: [45, 95],
  demo: [95, 167],
  value: [167, 183],
  status: [201, 230],
  business: [230, 257],
  financials: [257, 287],
  close: [287, 299],
};
// Slide clips cut from the section renders (global seconds; the last frame is held on stage).
const CLIPS = JSON.parse(readFileSync(join(SRC, 'clips.json'), 'utf8'));

const args = process.argv.slice(2);
const only = (args.find(a => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const cutOnly = args.includes('--cut');
const run = (cmd, argv, cwd) => execFileSync(cmd, argv, { cwd, stdio: 'inherit' });
// the CLIs run through node directly: no shell, so JSON arguments reach them intact
const cli = (pkgPath, argv) => run(process.execPath, [join(BUILD, 'node_modules', ...pkgPath.split('/')), ...argv], BUILD);
const FF = execFileSync('python', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())'], { encoding: 'utf8' }).trim();

function deckNumbers() {
  // deck-data.js defines window.DECK; evaluate it with a stand-in window.
  const win = {};
  new Function('window', readFileSync(join(ROOT, 'deck-data.js'), 'utf8'))(win);
  const { fin, market, gtm } = win.DECK;
  return {
    source: 'Generated from deck-data.js by scripts/build_clips.mjs. Do not edit by hand.',
    barangayFishermen: market.barangayFishermen,
    barangayGps: market.barangayGps,
    plotterMin: market.plotterMin,
    plotterMax: market.plotterMax,
    investmentTotal: fin.total,
    grantProvincial: fin.grantProvincial,
    grantRegional: fin.grantRegional,
    grantNational: fin.grantNational,
    counterpart: fin.counterpart,
    counterpartInKind: fin.counterpartInKind,
    counterpartCash: fin.counterpartCash,
    yearOneLicences: fin.unitsY1,
    ramp: fin.ramp,
    roi: fin.roi,
    payback: fin.payback,
    coopSessions: gtm.coopSessions,
    towns: gtm.towns,
  };
}

function syncWorkspace() {
  mkdirSync(BUILD, { recursive: true });
  writeFileSync(join(SRC, 'src', 'deck-numbers.json'), JSON.stringify(deckNumbers(), null, 2) + '\n');
  rmSync(join(BUILD, 'src'), { recursive: true, force: true });
  for (const p of ['package.json', 'package-lock.json', 'tsconfig.json', 'remotion.config.ts', 'src', 'public']) {
    cpSync(join(SRC, p), join(BUILD, p), { recursive: true, force: true });
  }
  const lock = join(BUILD, 'node_modules', '.package-lock.json');
  if (!existsSync(lock)) {
    execFileSync('npm ci --no-audit --no-fund', { cwd: BUILD, stdio: 'inherit', shell: true });
  }
  for (const p of PUBLIC_PARTS) {
    const to = join(BUILD, 'public', p);
    if (!existsSync(to) || p === 'pitch5') cpSync(join(BRAND_PUBLIC, p), to, { recursive: true, force: false, errorOnExist: false });
  }
}

function renderSections(names) {
  cli('typescript/bin/tsc', ['--noEmit', '-p', '.']);
  const bundle = join(BUILD, 'bundle');
  rmSync(bundle, { recursive: true, force: true });
  cli('@remotion/cli/remotion-cli.js', ['bundle', '--out-dir', bundle]);
  mkdirSync(join(BUILD, 'sections'), { recursive: true });
  for (const name of names) {
    const [from, to] = SECTIONS[name];
    const out = join(BUILD, 'sections', `${name}.mp4`);
    const props = join(BUILD, 'sections', `${name}.props.json`);
    writeFileSync(props, JSON.stringify({ from, to }));
    cli('@remotion/cli/remotion-cli.js', ['render', bundle, 'clip', out, `--props=${props}`, '--muted', '--crf=14', '--image-format=jpeg', '--jpeg-quality=95']);
  }
}

function cutClips(names) {
  mkdirSync(OUT, { recursive: true });
  for (const c of CLIPS.filter(c => !names.length || names.includes(c.section))) {
    const [from] = SECTIONS[c.section];
    const src = join(BUILD, 'sections', `${c.section}.mp4`);
    const ss = (c.from - from).toFixed(3), dur = (c.to - c.from).toFixed(3);
    const mp4 = join(OUT, `${c.id}.mp4`), jpg = join(OUT, `${c.id}.jpg`);
    execFileSync(FF, ['-v', 'error', '-y', '-ss', ss, '-i', src, '-t', dur, '-an', '-c:v', 'libx264', '-crf', '22', '-maxrate', '5M', '-bufsize', '10M',
      '-preset', 'slow', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4]);
    // the poster is the clip's last frame: still mode (print, ?static=1, reduced motion) shows the finished scene
    execFileSync(FF, ['-v', 'error', '-y', '-sseof', '-0.1', '-i', mp4, '-frames:v', '1', '-q:v', '3', '-update', '1', jpg]);
    console.log(`clip ${c.id}: ${c.section} ${c.from}-${c.to}s (${(statSync(mp4).size / 1e6).toFixed(1)} MB)`);
  }
}

const names = only.length ? only : Object.keys(SECTIONS);
for (const n of names) if (!SECTIONS[n]) throw new Error(`unknown section ${n}`);
if (!cutOnly) {
  syncWorkspace();
  renderSections(names);
}
cutClips(only);

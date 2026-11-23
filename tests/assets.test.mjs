import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';

const REQUIRED = [
  'assets/vendor/reveal/reveal.js', 'assets/vendor/reveal/reveal.css', 'assets/vendor/reveal/notes.js',
  'assets/vendor/gsap/gsap.min.js', 'assets/icons.js',
  'assets/brand/logo/fishpin-horizontal-dark.svg', 'assets/brand/logo/fishpin-horizontal-light.svg',
  'assets/brand/logo/fishpin-mark-dark.svg',
  'assets/brand/mascots/map.svg', 'assets/brand/mascots/storm_bouya.svg', 'assets/brand/mascots/boat_side.svg',
  'assets/brand/fonts/Poppins_400Regular.ttf', 'assets/brand/fonts/Poppins_500Medium.ttf',
  'assets/brand/fonts/Poppins_600SemiBold.ttf', 'assets/brand/fonts/Poppins_700Bold.ttf',
  'assets/brand/fonts/Poppins_300Light.ttf', 'assets/brand/fonts/Poppins_800ExtraBold.ttf',
  'assets/brand/fonts/IBMPlexMono_500Medium.ttf', 'assets/brand/fonts/IBMPlexMono_600SemiBold.ttf',
  'assets/brand/fonts/OFL-Poppins.txt', 'assets/brand/fonts/OFL-IBM-Plex-Mono.txt',
  'assets/brand/texture/contour.svg', 'assets/video/cover-tatay.mp4', 'assets/video/cover-tatay.jpg',
  'assets/screens/map-nautical.png', 'assets/screens/navigate.png', 'assets/screens/trip.png',
  'assets/screens/anchor-armed.png', 'assets/screens/scan-result.png', 'assets/screens/sos.png',
  'assets/photos/phone-splash.jpg', 'assets/photos/robert-and-fisherman.jpg',
  'assets/photos/showing-the-app.jpg', 'assets/photos/robert-portrait.jpg', 'assets/photos/dusk-banca.jpg',
];

const ICON_NAMES = [
  'award', 'wallet', 'wifi-off', 'map', 'map-pin', 'route', 'anchor', 'scan-line', 'siren',
  'plane', 'check', 'cloud-off', 'waves', 'users', 'star', 'rocket', 'calendar', 'megaphone',
  'printer', 'arrow-right', 'shield-check', 'trending-up', 'book-open', 'house', 'smartphone',
  'circle-alert',
];

test('every deck asset exists and is not empty', () => {
  for (const p of REQUIRED) {
    assert.ok(existsSync(p), `missing ${p}`);
    assert.ok(statSync(p).size > 0, `empty ${p}`);
  }
});

test('vendored libraries are the pinned versions', () => {
  assert.match(readFileSync('assets/vendor/reveal/reveal.js', 'utf8').slice(0, 300), /reveal\.js 5\.1\.0/);
  assert.match(readFileSync('assets/vendor/gsap/gsap.min.js', 'utf8').slice(0, 300), /GSAP 3\.12\.5/);
});

test('icons.js defines every icon the deck uses as an inline SVG', () => {
  const win = {};
  new Function('window', readFileSync('assets/icons.js', 'utf8'))(win);
  for (const name of ICON_NAMES) {
    assert.match(win.ICONS[name] ?? '', /^<svg[^>]*viewBox="0 0 24 24"/, `icon ${name}`);
  }
});

test('contour texture is recoloured to the brand line colour', () => {
  assert.match(readFileSync('assets/brand/texture/contour.svg', 'utf8'), /#7DC3FF/);
});

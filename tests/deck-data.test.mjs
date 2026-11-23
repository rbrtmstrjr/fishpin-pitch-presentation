import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

function load() {
  const win = {};
  new Function('window', readFileSync('deck-data.js', 'utf8'))(win);
  return win.DECK;
}

test('headline figures match the 2 Nov 2026 financial plan and BMC', () => {
  const D = load();
  assert.equal(D.price, 599);
  assert.equal(D.trialDays, 7);
  assert.equal(D.fin.unitsY1, 1000);
  assert.equal(D.fin.capex, 76525);
  assert.equal(D.fin.opex, 199290);
  assert.equal(D.fin.total, 275815);
  assert.equal(D.fin.grantProvincial, 80000);
  assert.equal(D.fin.grantRegional, 150000);
  assert.equal(D.fin.counterpart, 45815);
  assert.equal(D.fin.gross, 599000);
  assert.equal(D.fin.cogs, 175522);
  assert.equal(D.fin.net, 423478);
  assert.equal(D.fin.roi, 153.54);
  assert.equal(D.fin.payback, 0.65);
  assert.deepEqual(D.fin.targets, [1000, 3000, 5000]);
  assert.equal(D.market.sector, 1100000);
  assert.equal(D.market.tamM, 659);
  assert.equal(D.market.samM, 461);
  assert.equal(D.market.somM, 3);
  assert.equal(D.market.barangayFishermen, 103);
  assert.equal(D.market.barangayGps, 10);
});

test('verify() is clean on the shipped data', () => {
  assert.deepEqual(load().verify(), []);
});

test('verify() catches a wrong ROI', () => {
  const D = load();
  D.fin.roi = 150;
  const msgs = D.verify();
  assert.ok(msgs.some(m => m.startsWith('fin.roi')), msgs.join('\n'));
});

test('verify() catches a cost line that no longer adds up', () => {
  const D = load();
  D.fin.opexItems[0].amount += 1;
  const msgs = D.verify();
  assert.ok(msgs.some(m => m.startsWith('fin.opex')), msgs.join('\n'));
});

test('verify() catches a ramp that misses the year-1 target', () => {
  const D = load();
  D.fin.ramp[0] = 26;
  assert.ok(D.verify().some(m => m.startsWith('ramp')));
});

test('verify() catches a sensitivity row that does not recompute', () => {
  const D = load();
  D.fin.sensitivity[0].roi = 64;
  assert.ok(D.verify().some(m => m.startsWith('sensitivity 500 roi')));
});

test('get() resolves dotted paths, including array indexes', () => {
  const D = load();
  assert.equal(D.get('fin.roi'), 153.54);
  assert.equal(D.get('fin.targets.2'), 5000);
  assert.equal(D.get('fin.sensitivity.0.units'), 500);
  assert.equal(D.get('fin.nope'), undefined);
});

test('pending() lists traction fields not yet confirmed by Robert', () => {
  const D = load();
  assert.ok(D.pending().includes('traction.accounts'));
  D.traction.confirmed.accounts = true;
  assert.ok(!D.pending().includes('traction.accounts'));
});

test('every figure family has a source', () => {
  const D = load();
  for (const k of ['price', 'fin.total', 'fin.roi', 'fin.payback', 'fin.net', 'fin.gross', 'fin.cogs',
    'fin.sensitivity', 'fin.ramp', 'market.tamM', 'market.samM', 'market.somM', 'market.barangayFishermen',
    'market.barangayGps', 'gtm.reach', 'product.localNames', 'traction.accounts', 'fishNames']) {
    assert.ok(D.src[k], `no source for ${k}`);
  }
});

const APP_DATA = join(homedir(), 'OneDrive', 'Documents', 'FishPin', 'apps', 'mobile', 'data', 'ph-fish-guide.json');
test('species counts and fish names match the app data', { skip: !existsSync(APP_DATA) && 'app data not on this machine' }, () => {
  const D = load();
  const species = JSON.parse(readFileSync(APP_DATA, 'utf8')).species;
  const local = species.flatMap(s => s.localNames || []);
  assert.equal(species.length, D.product.species);
  assert.equal(local.length, D.product.localNames);
  assert.equal(new Set(local.map(n => n.lang)).size, D.product.languages);
  const names = species.flatMap(s => [...String(s.nameLocal || '').split('·'), ...(s.localNames || []).map(n => n.name)]);
  const hay = '|' + names.map(n => n.trim().toLowerCase()).join('|') + '|';
  for (const n of D.fishNames) assert.ok(hay.includes(n.toLowerCase()), `${n} is not in the app data`);
});

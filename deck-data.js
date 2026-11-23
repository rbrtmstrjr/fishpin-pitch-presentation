/* FishPin national pitch: every number the slides show, and where it comes from.
   Slides never type a figure. deck.js fills each [data-k="path"] element from DECK.
   FP   = D. YFC Financials_Work and Financial Plan - FishPin Regional (1).xlsx (2 Nov 2026)
   BMC  = D. YFC-BMC-TEMPLATE - FishPin Regional (1).docx (2 Nov 2026)
   NBMC = Narrative BMC - FishPin - Robert Maestro Jr (6).docx (2 Nov 2026)
   Traction is marked unconfirmed until Robert sends current figures: set
   traction.confirmed.<field> = true once a value is checked. */
(function (root) {
  'use strict';

  const DECK = {
    meta: { pitchSeconds: 300, timerAmber: 240, timerRed: 285 },
    price: 599,
    trialDays: 7,

    fin: {
      unitsY1: 1000,
      playFee: 0.15,
      vatOnFee: 0.12,
      capexItems: [
        { id: 'laptop', label: 'Development laptop (in kind)', amount: 35000 },
        { id: 'play', label: 'Google Play Console account (in kind)', amount: 1525 },
        { id: 'permits', label: 'Business registration and permits (DTI, BIR, Mayor’s Permit, Barangay)', amount: 6000 },
        { id: 'handsets', label: 'Android test and demo handsets, 2 units', amount: 14000 },
        { id: 'iphone', label: 'Test iPhone for the iOS build', amount: 19000 },
        { id: 'notary', label: 'Notarization', amount: 1000 },
      ],
      opexItems: [
        { id: 'supabase', label: 'Supabase Pro: database, login, backups', amount: 18300, cogs: true },
        { id: 'maptiler', label: 'MapTiler Flex: nautical and night maps', amount: 21960, cogs: true },
        { id: 'mapbox', label: 'Mapbox: offline map packs', amount: 6000, cogs: true },
        { id: 'gemini', label: 'Google Gemini API: AI fish scan', amount: 3660, cogs: true },
        { id: 'openmeteo', label: 'Open-Meteo API Standard: weather and marine data', amount: 24360, cogs: true },
        { id: 'ses', label: 'Amazon SES: password-reset email', amount: 610, cogs: true },
        { id: 'claude', label: 'Claude Pro: AI development assistant', amount: 16800, cogs: false },
        { id: 'apple', label: 'Apple Developer Program', amount: 6000, cogs: false },
        { id: 'domain', label: 'Domain renewal', amount: 1200, cogs: false },
        { id: 'internet', label: 'Internet connectivity', amount: 18000, cogs: false },
        { id: 'ads', label: 'Facebook and TikTok advertising', amount: 60000, cogs: false },
        { id: 'coopMansalay', label: 'Mansalay cooperative sessions (4)', amount: 4000, cogs: false },
        { id: 'coopExpansion', label: 'Expansion cooperative sessions (8)', amount: 10400, cogs: false },
        { id: 'guides', label: 'Printed Tagalog guides and SOS cards (1,000)', amount: 8000, cogs: false },
      ],
      capex: 76525,
      opex: 199290,
      total: 275815,
      grantProvincial: 80000,
      grantRegional: 150000,
      counterpart: 45815,
      counterpartInKind: 36525,
      counterpartCash: 9290,
      gross: 599000,
      cogs: 175522,
      net: 423478,
      roi: 153.54,
      payback: 0.65,
      roiStrict: 108.43,
      paybackStrict: 0.92,
      netPerSale: 498.37,
      sensitivity: [
        { units: 500, net: 174294, roi: 63.19, payback: 1.58 },
        { units: 700, net: 273967.6, roi: 99.33, payback: 1.01 },
        { units: 1000, net: 423478, roi: 153.54, payback: 0.65 },
      ],
      targets: [1000, 3000, 5000],
      ramp: [25, 40, 50, 60, 75, 85, 90, 95, 105, 115, 125, 135],
      openingCash: 239290,
      endingCashM12: 498368,
    },

    market: {
      sector: 1100000,
      smartphoneShare: 0.7,
      somUsers: 5000,
      tamM: 659,
      samM: 461,
      somM: 3,
      barangayFishermen: 103,
      barangayGps: 10,
      barangayMemory: 93,
      plotterMin: 8000,
      plotterMax: 30000,
      povertyPct: 27.4,
      povertyYear: 2023,
    },

    gtm: {
      towns: ['Bansud', 'Bongabong', 'Roxas', 'Mansalay', 'Bulalacao'],
      home: 'Mansalay',
      townCount: 5,
      coopSessions: 12,
      coopMansalay: 4,
      coopExpansion: 8,
      costMansalay: 1000,
      costExpansion: 1300,
      fishermenPerSession: 30,
      reach: 360,
      costPerReach: 40,
      adsPerMonth: 5000,
      guides: 1000,
      guideCost: 8,
    },

    competitors: [
      { name: 'Navionics', perYear: 3250, fiveYear: 16250, model: 'Yearly subscription', builtFor: 'Connected recreational boaters' },
      { name: 'Fishbrain', perYear: 4200, fiveYear: 21000, model: 'Yearly subscription', builtFor: 'Connected recreational boaters' },
      { name: 'Garmin plotter', min: 8000, max: 30000, model: 'Dedicated hardware', builtFor: 'Boats with a dedicated plotter' },
    ],

    product: {
      species: 300,
      localNames: 6337,
      languages: 26,
      sosContactsMin: 3,
      sosContactsMax: 5,
      sosHoldSeconds: 3,
      version: '1.2.0',
    },

    fishNames: ['Talakitok', 'Tambakol', 'Tanigue', 'Lapu-lapu', 'Maya-maya', 'Tulingan', 'Galunggong', 'Bangus',
      'Alumahan', 'Bisugo', 'Dalagang bukid', 'Samaral', 'Dilis', 'Sapsap', 'Lawlaw', 'Malasugi', 'Apahap', 'Banak'],

    traction: {
      asOf: '2026-10-22',
      accounts: 118,
      foundingAnglers: 35,
      rating: 5.0,
      version: '1.2.0',
      milestones: [
        { when: 'Aug 2026', what: 'Provincial winner', icon: 'award' },
        { when: '17 Oct 2026', what: 'Free to try, then Lifetime', icon: 'rocket' },
        { when: 'Nov 2026', what: 'MIMAROPA regional winner', icon: 'award' },
        { when: 'Dec 2026', what: 'iOS release (planned)', icon: 'calendar', planned: true },
      ],
      implemented: [],
      confirmed: { asOf: false, accounts: false, foundingAnglers: false, rating: false, version: false, milestones: false, implemented: false },
    },

    src: {
      price: 'FP Investment Cost!E62; BMC general information',
      trialDays: 'FP Investment Cost!E65 basis note',
      'fin.capex': 'FP Investment Cost!E16',
      'fin.opex': 'FP Investment Cost!E34',
      'fin.total': 'FP Investment Cost!E36',
      'fin.grantProvincial': 'FP Investment Cost!E39',
      'fin.grantRegional': 'FP Investment Cost!E40',
      'fin.counterpart': 'FP Investment Cost!E42',
      'fin.gross': 'FP Investment Cost!E49',
      'fin.cogs': 'FP Investment Cost!E47',
      'fin.net': 'FP Investment Cost!E51',
      'fin.roi': 'FP Ratios!E4',
      'fin.payback': 'FP Ratios!E5',
      'fin.roiStrict': 'FP Ratios!E7',
      'fin.paybackStrict': 'FP Ratios!E8',
      'fin.sensitivity': 'FP Ratios!C14:F16',
      'fin.netPerSale': 'FP Investment Cost!E65 basis note',
      'fin.targets': 'FP Investment Cost!E65 basis note',
      'fin.ramp': 'FP Cashflow!E20:P20',
      'fin.openingCash': 'FP Cashflow!E10',
      'fin.endingCashM12': 'FP Cashflow!P39',
      'fin.capexItems': 'FP Investment Cost!C10:E15',
      'fin.opexItems': 'FP Investment Cost!C20:E33',
      'market.sector': 'BMC Customer Segments; NBMC 2',
      'market.tamM': 'BMC Customer Segments',
      'market.samM': 'BMC Customer Segments',
      'market.somM': 'BMC Customer Segments',
      'market.smartphoneShare': 'BMC Customer Segments (assumption)',
      'market.barangayFishermen': 'BMC Value Proposition; NBMC 1',
      'market.barangayGps': 'BMC Value Proposition; NBMC 1',
      'market.plotterMin': 'BMC Value Proposition',
      'market.plotterMax': 'BMC Value Proposition',
      'market.povertyPct': 'PSA 2023 fisherfolk poverty incidence (provincial deck)',
      'gtm.coopSessions': 'FP Work and Financial Plan rows 29-30; BMC Channels',
      'gtm.reach': 'FP Investment Cost!E65 basis note',
      'gtm.adsPerMonth': 'FP Investment Cost!E30',
      'gtm.guides': 'FP Investment Cost!E33',
      'gtm.towns': 'BMC Customer Segments',
      competitors: 'NBMC 2; fishpin-web lib/comparison.ts',
      'product.species': 'FishPin apps/mobile/data/ph-fish-guide.json',
      'product.localNames': 'FishPin apps/mobile/data/ph-fish-guide.json',
      'product.languages': 'FishPin apps/mobile/data/ph-fish-guide.json',
      'traction.accounts': 'FishPin docs/marketing/facebook-ads.md (22 Oct 2026)',
      'traction.foundingAnglers': 'FishPin CLAUDE.md (paid-download era, to 17 Oct 2026)',
      'traction.rating': 'Google Play ratings export, Oct 2026',
      fishNames: 'FishPin apps/mobile/data/ph-fish-guide.json',
    },
  };

  const round = (v, dp) => Math.round(v * 10 ** dp) / 10 ** dp;
  const sum = list => list.reduce((s, x) => s + x, 0);

  DECK.get = function (path) {
    return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), DECK);
  };

  DECK.verify = function () {
    const f = DECK.fin, m = DECK.market, g = DECK.gtm, p = DECK.price, out = [];
    const eq = (name, actual, expected) => {
      if (actual !== expected) out.push(`${name}: data says ${actual} but it computes to ${expected}`);
    };
    const services = sum(f.opexItems.filter(i => i.cogs).map(i => i.amount));
    const nonCogs = sum(f.opexItems.filter(i => !i.cogs).map(i => i.amount));
    const netAt = units => round(units * p - units * p * f.playFee * (1 + f.vatOnFee) - services, 2);

    eq('fin.capex', f.capex, sum(f.capexItems.map(i => i.amount)));
    eq('fin.opex', f.opex, sum(f.opexItems.map(i => i.amount)));
    eq('fin.total', f.total, f.capex + f.opex);
    eq('fund sources', f.grantProvincial + f.grantRegional + f.counterpart, f.total);
    eq('fin.counterpart', f.counterpart, f.counterpartInKind + f.counterpartCash);
    eq('fin.gross', f.gross, f.unitsY1 * p);
    eq('fin.cogs', f.cogs, Math.round(f.gross * f.playFee * (1 + f.vatOnFee)) + services);
    eq('fin.net', f.net, f.gross - f.cogs);
    eq('fin.roi', f.roi, round(f.net / f.total * 100, 2));
    eq('fin.payback', f.payback, round(f.total / f.net, 2));
    eq('fin.roiStrict', f.roiStrict, round((f.net - nonCogs) / f.total * 100, 2));
    eq('fin.paybackStrict', f.paybackStrict, round(f.total / (f.net - nonCogs), 2));
    eq('fin.netPerSale', f.netPerSale, round(p - p * f.playFee * (1 + f.vatOnFee), 2));
    eq('fin.openingCash', f.openingCash, f.grantProvincial + f.grantRegional + f.counterpartCash);
    eq('ramp total', sum(f.ramp), f.unitsY1);
    eq('fin.targets.0', f.targets[0], f.unitsY1);
    f.sensitivity.forEach(r => {
      const net = netAt(r.units);
      eq(`sensitivity ${r.units} net`, r.net, net);
      eq(`sensitivity ${r.units} roi`, r.roi, round(net / f.total * 100, 2));
      eq(`sensitivity ${r.units} payback`, r.payback, round(f.total / net, 2));
    });
    const top = f.sensitivity[f.sensitivity.length - 1];
    eq('sensitivity top row', `${top.units}/${top.net}/${top.roi}/${top.payback}`, `${f.unitsY1}/${f.net}/${f.roi}/${f.payback}`);

    eq('market.tamM', m.tamM, Math.round(m.sector * p / 1e6));
    eq('market.samM', m.samM, Math.round(m.sector * p * m.smartphoneShare / 1e6));
    eq('market.somM', m.somM, Math.round(m.somUsers * p / 1e6));
    eq('market.somUsers', m.somUsers, f.targets[2]);
    eq('market.barangayMemory', m.barangayMemory, m.barangayFishermen - m.barangayGps);

    eq('gtm.townCount', g.townCount, g.towns.length);
    eq('gtm.coopSessions', g.coopSessions, g.coopMansalay + g.coopExpansion);
    eq('gtm.reach', g.reach, g.coopSessions * g.fishermenPerSession);
    eq('gtm.costPerReach', g.costPerReach, Math.round((g.coopMansalay * g.costMansalay + g.coopExpansion * g.costExpansion) / g.reach));
    eq('gtm.adsPerMonth', g.adsPerMonth * 12, f.opexItems.find(i => i.id === 'ads').amount);
    eq('gtm.guides', g.guides * g.guideCost, f.opexItems.find(i => i.id === 'guides').amount);
    DECK.competitors.filter(c => c.perYear).forEach(c => eq(`${c.name} five-year`, c.fiveYear, c.perYear * 5));
    return out;
  };

  DECK.pending = function () {
    const c = DECK.traction.confirmed;
    return Object.keys(c).filter(k => !c[k]).map(k => `traction.${k}`);
  };

  root.DECK = DECK;
})(typeof window !== 'undefined' ? window : globalThis);

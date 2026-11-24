/* FishPin national pitch: every number the slides show, and where it comes from.
   Slides never type a figure. deck.js fills each [data-k="path"] element from DECK.
   FP   = D. YFC Financials_Work and Financial Plan - FishPin National.xlsx (23 Nov 2026)
   BMC  = D. YFC-BMC-TEMPLATE - FishPin National.docx (dated 11 Nov 2026, received 23 Nov 2026)
   NBMC = Narrative BMC - FishPin - Robert Maestro Jr .docx (23 Nov 2026; same text as the 2 Nov version)
   Traction is marked unconfirmed until Robert sends current figures: set
   traction.confirmed.<field> = true once a value is checked. */
(function (root) {
  'use strict';

  const DECK = {
    meta: { pitchSeconds: 300, timerAmber: 240, timerRed: 285 },
    price: 599,
    trialDays: 7,

    fin: {
      unitsY1: 2000,
      playFee: 0.15,
      vatOnFee: 0.12,
      capexItems: [
        { id: 'laptop', label: 'Development laptop (in kind)', amount: 35000 },
        { id: 'play', label: 'Google Play Console account (in kind)', amount: 1525 },
        { id: 'permits', label: 'Registration and permits (DTI, BIR, Mayor’s, Barangay)', amount: 6000 },
        { id: 'handsets', label: 'Android test and demo handsets, 2 units', amount: 14000 },
        { id: 'iphone', label: 'Test iPhone for the iOS build', amount: 19000 },
        { id: 'notary', label: 'Notarization', amount: 1000 },
        { id: 'demokit', label: 'Landing demo kit: banners, table, power banks, pouches', amount: 6000 },
      ],
      opexItems: [
        { id: 'supabase', label: 'Supabase Pro: database, login, backups', amount: 18300, cogs: true },
        { id: 'maptiler', label: 'MapTiler Flex: nautical and night maps', amount: 21960, cogs: true },
        { id: 'mapbox', label: 'Mapbox: offline map packs', amount: 6000, cogs: true },
        { id: 'aiscan', label: 'Anthropic Claude API: AI fish scan', amount: 3660, cogs: true },
        { id: 'openmeteo', label: 'Open-Meteo API Standard: weather and marine data', amount: 24360, cogs: true },
        { id: 'ses', label: 'Amazon SES: password-reset email', amount: 610, cogs: true },
        { id: 'claude', label: 'Claude Pro: AI development assistant', amount: 16800, cogs: false },
        { id: 'apple', label: 'Apple Developer Program', amount: 6000, cogs: false },
        { id: 'domain', label: 'Domain renewal', amount: 1200, cogs: false },
        { id: 'internet', label: 'Internet connectivity', amount: 18000, cogs: false },
        { id: 'ads', label: 'Facebook and TikTok advertising', amount: 60000, cogs: false },
        { id: 'coopMansalay', label: 'Mansalay cooperative sessions (4)', amount: 4000, cogs: false },
        { id: 'coopExpansion', label: 'Expansion cooperative sessions (4)', amount: 5200, cogs: false },
        { id: 'guides', label: 'Printed Tagalog guides and SOS cards (1,000)', amount: 8000, cogs: false },
        { id: 'chart', label: 'Nautical chart check, Tablas Strait', amount: 600, cogs: false },
        { id: 'wages', label: 'Wages: 2 field demo and support officers', amount: 240240, cogs: false },
        { id: 'fuel', label: 'Fuel for weekly landing demos', amount: 14400, cogs: false },
        { id: 'vlogs', label: 'Paid vlogger videos (14)', amount: 35000, cogs: false },
      ],
      capex: 82525,
      opex: 484330,
      total: 566855,
      grantProvincial: 80000,
      grantRegional: 150000,
      grantNational: 300000,
      counterpart: 36855,
      counterpartInKind: 36525,
      counterpartCash: 330,
      gross: 1198000,
      cogs: 276154,
      net: 921846,
      roi: 162.62,
      payback: 0.61,
      roiStrict: 90.39,
      paybackStrict: 1.11,
      breakEvenStrict: 972,
      netPerSale: 498.37,
      sensitivity: [
        { units: 1000, net: 423478, roi: 74.71, payback: 1.34 },
        { units: 1500, net: 672662, roi: 118.67, payback: 0.84 },
        { units: 2000, net: 921846, roi: 162.62, payback: 0.61 },
      ],
      ramp: [60, 90, 110, 130, 150, 165, 175, 185, 195, 215, 250, 275],
      openingCash: 530000,
      endingCashM12: 996406,
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
      mimaropaPovertyRisePts: 10.0,
      catch2023: 3523,
      catch2024: 1995,
      catchDropPct: 43.4,
    },

    gtm: {
      towns: ['Bansud', 'Bongabong', 'Roxas', 'Mansalay', 'Bulalacao'],
      home: 'Mansalay',
      townCount: 5,
      coopSessions: 8,
      coopMansalay: 4,
      coopExpansion: 4,
      costMansalay: 1000,
      costExpansion: 1300,
      fishermenPerSession: 30,
      reach: 240,
      costPerReach: 38,
      adsPerMonth: 5000,
      guides: 1000,
      guideCost: 8,
    },

    competitors: [
      { name: 'Navionics', perYear: 3250, fiveYear: 16250, model: 'Yearly subscription', builtFor: 'Connected recreational boaters' },
      { name: 'Fishbrain', perYear: 4200, fiveYear: 21000, model: 'Yearly subscription', builtFor: 'Connected recreational boaters' },
      { name: 'Garmin plotter', min: 8000, max: 30000, model: 'Dedicated hardware', builtFor: 'Boats with a dedicated plotter' },
    ],

    // the demo navigation shown in the app screenshot (FishPin Pitch 2026, chapter 2)
    demo: { distanceNm: 2.6, etaMin: 25 },

    product: {
      species: 300,
      saltwater: 262,
      freshwater: 38,
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
      accounts: 300,
      foundingAnglers: 35,
      rating: 5.0,
      version: '1.2.0',
      lifetimeSales: null,
      milestones: [
        { when: 'Aug 2026', what: 'Provincial winner', icon: 'award' },
        { when: '17 Oct 2026', what: 'Free to try, then Lifetime', icon: 'rocket' },
        { when: 'Nov 2026', what: 'MIMAROPA regional winner', icon: 'award' },
        { when: 'Dec 2026', what: 'iOS release (planned)', icon: 'calendar', planned: true },
      ],
      implemented: [],
      confirmed: { asOf: false, accounts: false, foundingAnglers: false, rating: false, version: false, lifetimeSales: false, milestones: false, implemented: false },
    },

    src: {
      price: 'FP Investment Cost!E68; BMC general information',
      trialDays: 'FP Investment Cost!C71 basis note',
      'fin.capex': 'FP Investment Cost!E17',
      'fin.opex': 'FP Investment Cost!E39',
      'fin.total': 'FP Investment Cost!E41',
      'fin.grantProvincial': 'FP Investment Cost!E44',
      'fin.grantRegional': 'FP Investment Cost!E45',
      'fin.grantNational': 'FP Investment Cost!E46',
      'fin.counterpart': 'FP Investment Cost!E48 (in kind PhP 36,525 + PhP 330 reinvested sales)',
      'fin.gross': 'FP Investment Cost!E55',
      'fin.cogs': 'FP Investment Cost!E53',
      'fin.net': 'FP Investment Cost!E57',
      'fin.roi': 'FP Ratios!E4',
      'fin.payback': 'FP Ratios!E5',
      'fin.roiStrict': 'FP Ratios!E7',
      'fin.paybackStrict': 'FP Ratios!E8',
      'fin.sensitivity': 'FP Ratios!C14:F16',
      'fin.breakEvenStrict': 'FP Ratios!D17',
      'fin.netPerSale': 'FP Investment Cost!C71 basis note',
      'fin.ramp': 'FP Cashflow!E21:P21',
      'fin.openingCash': 'FP Cashflow!E10',
      'fin.endingCashM12': 'FP Cashflow!P44',
      'fin.capexItems': 'FP Investment Cost!C10:E16',
      'fin.opexItems': 'FP Investment Cost!C21:E38',
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
      'market.mimaropaPovertyRisePts': 'PSA MIMAROPA poverty statistics 2021-2023 (FishPin Pitch 2026, regional round)',
      'market.catch2023': 'PSA Oriental Mindoro fisheries 2024, municipal catch in MT (FishPin Pitch 2026)',
      'market.catch2024': 'PSA Oriental Mindoro fisheries 2024, municipal catch in MT (FishPin Pitch 2026)',
      'product.saltwater': 'FishPin apps/mobile/data/ph-fish-guide.json (FishPin Pitch 2026 guide scene)',
      'gtm.coopSessions': 'FP Work and Financial Plan rows 29-30 and note B39; BMC Channels',
      'gtm.reach': 'FP Investment Cost!C71 basis note',
      'gtm.adsPerMonth': 'FP Investment Cost!E31',
      'gtm.guides': 'FP Investment Cost!E34',
      'gtm.towns': 'BMC Customer Segments',
      competitors: 'NBMC 2; fishpin-web lib/comparison.ts',
      'product.species': 'FishPin apps/mobile/data/ph-fish-guide.json',
      'product.localNames': 'FishPin apps/mobile/data/ph-fish-guide.json',
      'product.languages': 'FishPin apps/mobile/data/ph-fish-guide.json',
      'traction.accounts': 'Robert, Figma frame 11 (24 Nov 2026); asOf not yet updated to match',
      'traction.foundingAnglers': 'FishPin CLAUDE.md (paid-download era, to 17 Oct 2026)',
      'traction.rating': 'Google Play ratings export, Oct 2026',
      'traction.lifetimeSales': 'Google Play Console orders (Robert to fill in)',
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
    eq('fund sources', f.grantProvincial + f.grantRegional + f.grantNational + f.counterpart, f.total);
    eq('fin.counterpart', f.counterpart, f.counterpartInKind + f.counterpartCash);
    eq('fin.gross', f.gross, f.unitsY1 * p);
    eq('fin.cogs', f.cogs, Math.round(f.gross * f.playFee * (1 + f.vatOnFee)) + services);
    eq('fin.net', f.net, f.gross - f.cogs);
    eq('fin.roi', f.roi, round(f.net / f.total * 100, 2));
    eq('fin.payback', f.payback, round(f.total / f.net, 2));
    eq('fin.roiStrict', f.roiStrict, round((f.net - nonCogs) / f.total * 100, 2));
    eq('fin.paybackStrict', f.paybackStrict, round(f.total / (f.net - nonCogs), 2));
    eq('fin.netPerSale', f.netPerSale, round(p - p * f.playFee * (1 + f.vatOnFee), 2));
    eq('fin.openingCash', f.openingCash, f.grantProvincial + f.grantRegional + f.grantNational); // the cash counterpart comes from sales later
    eq('ramp total', sum(f.ramp), f.unitsY1);
    eq('fin.breakEvenStrict', f.breakEvenStrict, Math.ceil(nonCogs / (p - p * f.playFee * (1 + f.vatOnFee)) + services / (p - p * f.playFee * (1 + f.vatOnFee))));
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
    eq('market.barangayMemory', m.barangayMemory, m.barangayFishermen - m.barangayGps);
    eq('market.catchDropPct', m.catchDropPct, round((1 - m.catch2024 / m.catch2023) * 100, 1));
    eq('product species split', DECK.product.saltwater + DECK.product.freshwater, DECK.product.species);

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

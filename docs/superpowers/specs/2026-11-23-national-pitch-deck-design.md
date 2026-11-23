# FishPin national pitch deck: design

Date: 2026-11-23
Owner: Robert S. Maestro Jr.
Status: approved in brainstorming, awaiting spec review

## 1. Goal

Rebuild `FishPin-Pitch.html` for the **Young Farmers Challenge (YFC) national round**, delivered **live on stage in 5 minutes**, followed by Q&A. The deck must:

1. Follow the 2026 FishPin brand (navy-led, amber accent, Poppins + IBM Plex Mono).
2. Use the numbers in the 2 Nov 2026 financial plan and business model canvas exactly.
3. Tell a self-contained story. The national AVP ("Ang Pwesto ni Tatay") is played separately; the deck must not depend on it or repeat its story beats.
4. Work with no internet, from a USB stick, on an unknown venue laptop and projector.

Out of scope: a national-grant (PHP 300,000) budget slide; auto-advance/video recording mode; changes to any repo outside this folder.

## 2. Context and sources

All sources are read only. Nothing outside `FishPin Presentation/` is modified.

| Source | Path | Used for |
| --- | --- | --- |
| Financial plan (final) | `~/Downloads/D. YFC Financials_Work and Financial Plan - FishPin Regional (1).xlsx` (2026-11-02) | Every financial figure |
| BMC template (final) | `~/Downloads/D. YFC-BMC-TEMPLATE - FishPin Regional (1).docx` (2026-11-02) | BMC blocks, TAM/SAM/SOM |
| Narrative BMC (final) | `~/Downloads/Narrative BMC - FishPin - Robert Maestro Jr (6).docx` (2026-11-02) | Value proposition, channels, activities |
| Brand kit | `~/OneDrive/Documents/fishpin-brand/` | Tokens, logo, mascots, textures, screenshots, fonts |
| Brand system doc | `~/OneDrive/Documents/fishpin-documentation/08-brand-system.md` | Token rules |
| Web rebrand map | `~/OneDrive/Documents/fishpin-web/REBRAND-PROMPT.md` | Old to new token mapping |
| App repo | `~/OneDrive/Documents/FishPin/` (CLAUDE.md, docs/) | Current features, pricing model, traction notes |
| National round research | `fishpin-brand/research_notes/YFC national round AVP/`, `fishpin-brand/reports/YFC national round AVP.md` | Format, rubric, claims guard |
| Awarding photos (real) | `fishpin-brand/16-yfc-awarding/final/Maestro_Robert_YFC_Photo1-5.jpg` | Photography |

Do **not** use `16-yfc-awarding/reference-samples/*` (AI reference images, marked "not for submission").

### 2.1 What the national panel scores

DA MC 27 s.2026, Digital Agriculture rubric (same criteria at every level; national judges the **status of implementation**):

- A. Agribiz-Tech Development: Technology Novelty and Innovation; Digital Value Addition.
- B. Agribiz-Tech Commercialization: Business Model and Value Proposition; Revenue Stream and Financial Viability; Social, Economic and Environmental Impact.

National grant: PHP 300,000 (15 national winners, 2 in Digital Agriculture). No published pitch time limit; Robert confirmed **5 minutes**.

## 3. Numbers (single source of truth)

All figures live in `deck-data.js` with a `src` string. The slides only read from it. Price is **PHP 599** everywhere (decision 2026-11-23, matches the plan, even though Play Console showed PHP 499 on that date).

### 3.1 Financial plan (`Investment Cost, Sales and ROI` sheet unless noted)

| Key | Value | Source cell |
| --- | --- | --- |
| price | PHP 599 one-time, after a 7-day free trial | E62, E65 |
| unitsY1 | 1,000 licences | E61 |
| capex | PHP 76,525 | E16 |
| opex | PHP 199,290 | E34 |
| totalInvestment | PHP 275,815 | E36 |
| grantProvincial | PHP 80,000 | E39 |
| grantRegional | PHP 150,000 (additional) | E40 |
| counterpart | PHP 45,815 (PHP 36,525 in kind, PHP 9,290 cash) | E42 |
| grossSales | PHP 599,000 | E49 |
| cogs | PHP 175,522 (Play fee 15% + 12% VAT on fee + cloud, map, weather, AI, email) | E47 |
| netIncome | PHP 423,478 | E51 |
| roi | 153.54% | Ratios!E4 |
| payback | 0.65 years | Ratios!E5 |
| roiStrict | 108.43% (after all operating expenses) | Ratios!E7 |
| paybackStrict | 0.92 years | Ratios!E8 |
| sensitivity | 500: net PHP 174,294, ROI 63.19%, 1.58 yrs; 700: net PHP 273,967.60, ROI 99.33%, 1.01 yrs; 1,000: net PHP 423,478, ROI 153.54%, 0.65 yrs | Ratios!C14:F16 |
| netPerSale | PHP 498.37 per PHP 599 sale | E65 text |
| targets | 1,000 / 3,000 / 5,000 paid users in years 1 / 2 / 3 | E65 text |
| monthlyRamp | 25, 40, 50, 60, 75, 85, 90, 95, 105, 115, 125, 135 (sum 1,000) | Cashflow!E20:P20 |
| openingCash | PHP 239,290 | Cashflow!E10 |
| endingCashM12 | PHP 498,368 | Cashflow!P39 |
| fx | USD 1 = PHP 61; EUR 1 = PHP 70 | E65 text |

Capex items: development laptop PHP 35,000 (in kind); Google Play Console PHP 1,525 (in kind); business registration and permits PHP 6,000; 2 Android handsets PHP 14,000; test iPhone PHP 19,000; notarization PHP 1,000.

Opex items: Supabase Pro PHP 18,300; MapTiler Flex PHP 21,960; Mapbox PHP 6,000; Gemini API PHP 3,660; Open-Meteo API Standard PHP 24,360; Amazon SES PHP 610; Claude Pro PHP 16,800; Apple Developer Program PHP 6,000; domain PHP 1,200; internet PHP 18,000; Facebook and TikTok ads PHP 60,000 (PHP 5,000/month); Mansalay co-op sessions 4 x PHP 1,000 = PHP 4,000; expansion co-op sessions 8 x PHP 1,300 = PHP 10,400; printed Tagalog guides and SOS cards 1,000 x PHP 8 = PHP 8,000.

### 3.2 Business model canvas

| Key | Value |
| --- | --- |
| barangayFishermen | about 103 fishermen in Brgy. B. del Mundo, Mansalay |
| barangayGpsOwners | 10 own a Garmin GPS; the rest navigate by memory |
| plotterCost | PHP 8,000 to PHP 30,000 |
| sector | 1.1 million registered municipal fishermen (always "1.1 million") |
| tam | PHP 659M (1.1M x PHP 599) |
| sam | PHP 461M (70% smartphone ownership, **labeled an assumption**) |
| som | PHP 3M (5,000 users x PHP 599, year 3) |
| towns | Mansalay, Bulalacao, Roxas, Bongabong, Bansud (southern Oriental Mindoro), then MIMAROPA, Visayas, Bicol |
| coopSessions | 12 sessions, one a month (4 Mansalay, 8 expansion), reaching about 360 fishermen at about PHP 40 each |
| payment | Google Play: GCash, Maya, card, load |
| competitors | Navionics PHP 3,250/yr; Fishbrain PHP 4,200/yr; Garmin plotter PHP 8K to 30K. 5-year: PHP 16,250 / PHP 21,000 / PHP 8K to 30K vs FishPin PHP 599 once |
| roadmap | iOS release planned December 2026; Filipino translation of the interface (planned) |

Context stat: fisherfolk poverty incidence 27.4% (PSA, 2023), second highest of all basic sectors.

### 3.3 Product facts (app repo, Nov 2026)

- Name "FishPin", Play listing "FishPin: Offline Sea Charts", package `com.fishpin.app`, Android 7.0+, latest build 1.2.0.
- Model: free install, opt-in 7-day trial, one-time "FishPin Lifetime" purchase. No subscription, no ads.
- Shipped: offline maps (Nautical, Night, Standard, Satellite); built-in Philippine depth chart; 4 Hz GPS, compass, speed; saved spots and trails to re-follow; trip recording with the screen off; navigation and route planning with ETA; anchor-drag alarm that rings on silent; fishing score and 7-day best-window forecast; catch log and gear; species guide of **300 species with 6,337 local names in 26 languages**; AI fish ID; SOS by SMS to 3 to 5 contacts with borrow-load codes; cloud backup.
- Needs a connection: weather and forecast, AI fish ID, search, map downloads, backup, first sign-in.
- Not shipped (never claim as live): iOS app, Filipino-language app screens, SOS live tracking link, reef chart.

### 3.4 Traction (pending from Robert)

Robert will send current figures. Until then the traction block holds the latest file values, each flagged `pending: true`, and the slide renders a visible "PENDING" marker in check mode. No estimated or rounded traction numbers may ship.

| Field | Latest file value | Source |
| --- | --- | --- |
| accounts | about 120 (2026-10-30) | `FishPin/docs/marketing/facebook-ads.md` |
| foundingAnglers | 35 paid-era accounts (2026-10-17) | `FishPin/CLAUDE.md` |
| lifetimeSales | to confirm | Play Console |
| activeInstalls | 30 (2026-10-15) | Play installs CSV |
| rating | 5.0 (2026-10) | Play ratings CSV |
| appVersion | 1.2.0 | `apps/mobile/android/version.properties` |
| awards | Provincial winner (Oriental Mindoro); MIMAROPA regional winner (awarding 2026-11-12, to confirm) | AVP plan |
| grantImplementation | to confirm: registrations, devices bought, co-op sessions held, licences paid | Robert |

## 4. Story: 12 main slides, 4:40 spoken

The counter shows `01 / 12`. Appendix slides are not counted.

| # | id | Title idea | Content | Time | Rubric |
| --- | --- | --- | --- | --- | --- |
| 1 | `cover` | Sea charts that work with no signal. | Dark-background logo, name, "Mansalay, Oriental Mindoro", "Digital Agriculture"; badges: Provincial winner, MIMAROPA regional winner. Swimming fin. | 0:10 | |
| 2 | `problem` | 103 fishermen. 10 GPS. | Hero number `103 -> 10` in amber; "the rest navigate by memory"; plotter PHP 8K to 30K; apps need signal offshore; footnote 27.4% poverty (PSA 2023). Real photo. | 0:25 | Business model: verified need |
| 3 | `solution` | One phone. Everything a plotter does. | Phone with new UI (white card); six capability tiles: offline sea chart with PH depths, save a spot and navigate back, trip recording, anchor alarm, AI fish ID, SOS. | 0:25 | Digital value addition |
| 4 | `offline` | No signal? No problem. | Airplane-mode toggle (auto-flips on entry, M key and click also toggle). Honest two-column list: works offline / needs a connection. Mascot: `map`. | 0:25 | Novelty |
| 5 | `novelty` | Built for Philippine waters. | Built-in PH depth chart; 300 species, 6,337 local names (amber hero number); anchor alarm rings on silent; SOS with borrow-load codes. | 0:25 | Novelty |
| 6 | `traction` | Since the regional round. | Data block from section 3.4 with "as of" date; short timeline: provincial win, regional win, now. | 0:30 | Status of implementation |
| 7 | `model` | Pay once. Own it. | PHP 599 once after a 7-day free trial (amber); why not a subscription; GCash, Maya, card, load; 5-year cost bars vs Navionics, Fishbrain, Garmin (text only). | 0:25 | Revenue stream |
| 8 | `market` | A PHP 659M market. | TAM / SAM (assumption label) / SOM tiers; five towns first, then MIMAROPA, Visayas, Bicol. | 0:20 | Business model |
| 9 | `gtm` | How we reach them. | 12 co-op sessions, about 360 fishermen; ads PHP 5,000/month; 1,000 Tagalog guides and SOS cards; targets 1,000 / 3,000 / 5,000. | 0:20 | Scaling |
| 10 | `financials` | Honest math. | Funding stack PHP 80,000 + 150,000 + 45,815 = PHP 275,815 (white card); gross PHP 599,000, net PHP 423,478, ROI 153.54% (amber), payback 0.65 yrs; "Still viable at 500 licences: 63.19% ROI". | 0:30 | Financial viability |
| 11 | `impact` | Safety. Income. Knowledge. | Live SOS hold-to-send demo (auto-plays on entry, hold to re-run); three impact cards. Mascot: `storm_bouya`. | 0:25 | Social impact |
| 12 | `close` | Every Filipino fisher knows where to fish, and the way home. | Next: iOS (planned Dec 2026), Filipino interface, SOS live tracking; thank you; logo. | 0:20 | |

Total 4:40, leaving a 0:20 buffer.

### 4.1 Q&A appendix (off-white, jump menu)

| id | Content |
| --- | --- |
| `q-bmc` | All 9 BMC blocks from the 2 Nov template |
| `q-costs` | Capex and opex line items, fund sources |
| `q-cashflow` | 12-month licence ramp and ending balance chart |
| `q-sensitivity` | 500 / 700 / 1,000 table plus the strict view (108.43%, 0.92 yrs) |
| `q-competitors` | Comparison table, plain-text names, no logos |
| `q-offline` | Full works-offline vs needs-connection list |
| `q-data` | Data ownership and privacy: fishermen own their data, never sold |
| `q-risks` | Risks and mitigations: one-time revenue (year 2 carries only recurring services), map licence (MapTiler free plan ran out on 2026-10-30 at about 120 accounts), solo founder, adoption |
| `q-founder` | Anak ng mangingisda, six years a professional developer, BS Information Technology (no university named) |

## 5. Visual system

### 5.1 Tokens

| Role | Value |
| --- | --- |
| Main canvas (deep navy) | `#061233` |
| Panel / anchor navy | `#0a2461` |
| Card on navy | `#0c1d45`, border `rgba(255,255,255,.08)`, strong `rgba(255,255,255,.18)` |
| Text on navy | `#EAF2FF` primary, `#9FB3D9` secondary, `#6B7FA8` tertiary |
| Amber accent | `#FFC857` (warm step `#FFA74B`); text on amber is always `#0a2461` |
| Brand blue (lines, icons, charts, links) | `#147dff` on light, `#40a2ff` on navy |
| Contour texture on navy | `rgba(125,195,255,.34)` lines, from `07-textures/contour-lines` |
| Appendix canvas | `#EEF4FB`, cards `#FFFFFF`, sunken `#E3ECF7`, hairline `#D5E0EF` |
| Text on light | `#0a2461` headings, `#4B5A78` body, `#8A94A8` captions |
| Status | success `#34D399` on navy / `#1F9D55` on light; danger `#F87171` / `#DC2626` |
| Radius | chip 8, button 12, card 16, sheet 24, pill 999 |
| Shadows | light only: `0 2px 6px rgba(10,36,97,.05)`, `0 4px 12px rgba(10,36,97,.10)`; none on navy |

### 5.2 Rules

- Main slides are navy. Appendix slides are off-white.
- Amber: one hero number per slide, small icon squares, the logo fin, the progress bar. Never a large fill, never status, never text on a light background.
- No gradients, including photo scrims. Photos sit beside solid navy panels.
- Poppins (500/600/700) for all words. IBM Plex Mono (500/600) for every number, eyebrow and coordinate. No Inter.
- Stage legibility: minimum 28px on main slides, headlines 72 to 96px, hero numbers 160 to 220px, about 25 words per main slide.
- Logo: `logo-dark-background/fishpin-horizontal.svg` on navy, `logo-light-background/...` on off-white. Clear space = half the mark height. No recolouring or effects.
- Mascots: at most one per slide, never on number slides.
- Icons: Lucide, 2px stroke, inlined as SVG (no runtime script).
- No competitor logos.

### 5.3 Motion

- Durations 200 to 320ms, easing `cubic-bezier(0.2,0,0,1)`, stagger 40ms. Every entrance settles in under 0.8s.
- Numbers count up once in Plex Mono with tabular figures.
- Swimming fin on cover and close. Gentle contour drift on navy is optional and must not distract.
- `prefers-reduced-motion`, `?static=1` and print render final states with no animation.
- No fragments: one clicker press always advances one slide.

## 6. Stage features

| Feature | Behaviour |
| --- | --- |
| Offline | Reveal.js 5.1.0, its notes plugin and GSAP 3.12.5 copied to `assets/vendor/`. Fonts self-hosted. No CDN or Google Fonts. Works over `file://` (double-click) and on Vercel. |
| Navigation | Arrows, Page Up/Down, Space. One press, one slide. |
| Speaker view | `S` opens Reveal's notes window: notes, next slide, timer. |
| On-screen timer | `T` toggles. Counts against 5:00, amber at 4:00, red at 4:45. `R` resets. |
| Q&A jump menu | `Q` opens a grid of appendix slides. `Esc` returns to the main slide you left. |
| Blank / fullscreen | `B` black screen, `F` fullscreen (Reveal built-ins). |
| Airplane demo | Auto-flips on entry; `M` and click also toggle. |
| SOS demo | Auto-plays on entry; press and hold to re-run; resets when released early. |
| Letterbox | Outside the 16:9 frame takes the slide's own background. |
| Removed | Auto-advance mode (`A`), Chart.js, Lucide runtime, TextPlugin. |

Speaker notes: about 650 words total in English, each slide within its time budget at about 140 words per minute. Robert may deliver in Taglish.

## 7. Claims guard (automated content check)

The build fails if the deck text contains any of:

- an em dash
- a sector size other than "1.1 million"
- the 70% figure without the word "assumption"
- any university name
- "free" or "libre" except in "7-day free trial" or "free to try"
- "100% offline" or "fully offline" without the offline / needs-connection split
- "PHP 499" or "₱499"
- partner, endorsement or "katuwang" claims for BFAR, NAMRIA, LGUs, the Coast Guard or cooperatives (channels may be named as planned channels)
- a Tagalog/Filipino app claim, or iOS as shipped (only "planned December 2026")
- "no safety feature behind a paywall"
- "Gemini" on a main slide (say "AI fish ID")
- a competitor logo image

## 8. Architecture

| File | Role |
| --- | --- |
| `FishPin-Pitch.html` | Slides (markup + CSS + presentation script). Rewritten. |
| `deck-data.js` | `window.DECK` numbers with `src` strings, the traction block, and the self-check (`DECK.verify()`). |
| `assets/vendor/` | reveal.js, reveal.css, notes plugin, gsap.min.js |
| `assets/brand/` | logo SVGs, mascot SVGs, contour texture, fonts (Poppins, IBM Plex Mono woff2) copied from the brand kit |
| `assets/screens/` | selected v1.0.2 light screenshots |
| `assets/photos/` | awarding photos (resized) and the existing fishermen photos |
| `scripts/check-claims.py` | Claims guard (section 7) |
| `scripts/qa.md` | How to run the browser QA |

Binding: elements carry `data-k="fin.roi"` (and an optional format). On load the script fills them from `DECK`. `?check=1` runs `DECK.verify()` and shows a red banner listing any mismatch or pending traction field.

`DECK.verify()` recomputes: TAM = 1.1M x price; SAM = 70% x TAM; SOM = 5,000 x price; gross = units x price; net = gross - COGS; ROI = net / total; payback = total / net; grants + counterpart = total; capex + opex = total; sum(monthlyRamp) = units. Rounded comparisons use the precision shown in the source.

## 9. Testing

1. `scripts/check-claims.py` passes.
2. `?check=1` shows no banner (except known pending traction fields until Robert sends them).
3. Playwright, with all non-local requests blocked: load, step through 12 main slides and every appendix slide, zero console errors, zero failed requests, no element outside the 1920x1080 frame, every image loaded. Screenshot each slide.
4. Interactions: airplane toggle (auto, M, click), SOS (auto, short press resets, full hold completes), Q menu open, jump and Esc return, T timer and R reset.
5. Viewports 1920x1080, 1280x800 (16:10), 1024x768 (4:3).
6. Launch via `file://`.
7. Speaker notes: word count per slide within budget; total 4:40 or less.
8. Regenerate `FishPin-Pitch.pdf` (main + appendix, final states) and per-slide PNGs; check the page count.

## 10. Delivery

- Work on branch `national-deck`. Tag the current deck `provincial-final` (commit `cc85125`) before changing it.
- Remove unused old assets at the end (they stay in git history).
- Robert reviews rendered slides early (first three slides) before the rest are built.

## 11. Open items for Robert

1. Current traction numbers and grant implementation status (section 3.4).
2. Play Console price is PHP 499 today; the deck shows PHP 599. Change the Play price before the pitch, or be ready to explain the switch.
3. The workbook still says "nineteen cooperative sessions" (Ratios!C10) and "an extra expansion session in months 4, 8 and 12" (Cashflow note), but the plan has 12 sessions. The deck uses 12.
4. Confirm the regional awarding date (2026-11-12) and the provincial award wording.
5. Q&A risks: SOS on Android can report "not sent" after a real send (fixed only in SOS V2); "many canceled" Lifetime orders in Play; MapTiler outage on 2026-10-30. Prepare answers.

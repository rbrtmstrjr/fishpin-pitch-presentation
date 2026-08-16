# CLAUDE DESIGN PROMPT — FishPin Interactive Web Presentation

Copy everything below the divider into Claude Design.

---

Build an interactive, animated web presentation for a Philippine government agri-fishery grant competition. It will be screen-recorded as a 5-minute video pitch, and may also be presented live over Zoom. Follow the content below exactly. Do not invent statistics, do not add data points I have not given you, and do not embellish any claim.

## PURPOSE AND HARD CONSTRAINTS

- **Exactly 17 slides.** The competition caps it at 17. Not 18.
- **Fixed 1920 x 1080, 16:9.** It will be recorded at that resolution, so it must scale cleanly and never letterbox.
- **Total narration time is 5 minutes**, roughly 17 seconds per slide. Text must be minimal: a headline plus a few supporting elements. If a judge has to read, the slide has failed.
- **Keyboard navigable.** Arrow keys and spacebar advance. No mouse required, since I will be recording.
- **Must export to PDF** so I can produce a static backup deck.
- **No em dashes anywhere.** Use commas, colons, or parentheses.
- Currency is Philippine pesos, written as PHP or the peso sign.
- Every figure below is final. Do not round, adjust, or "improve" any number.

## TECH STACK

Single self-contained HTML file, libraries from CDN.

- **Reveal.js** as the presentation backbone. It gives fixed 16:9 sizing, keyboard navigation, fragment animations, speaker notes, and PDF export out of the box. Configure `width: 1920, height: 1080, controls: false, progress: true, transition: 'slide'`.
- **GSAP** for timeline animation: counters, staggered reveals, drawn paths, bar growth.
- **Chart.js** for the adoption ramp bar chart, animated on slide entry.
- **Lucide icons** via CDN for all iconography. No emoji anywhere.
- **Google Fonts:** a bold condensed grotesque for headlines and a clean humanist sans for body.

Use `Reveal.on('slidechanged')` to trigger each slide's GSAP timeline so animations replay correctly when navigating back and forth.

## VISUAL SYSTEM

Define these as CSS custom properties:

```
--navy-deep:   #0A2472
--navy:        #0E3A8A
--blue:        #1E7BFF
--blue-light:  #5BA3FF
--paper:       #F5F8FC
--ink:         #0B1B3A
--ink-soft:    #4A5D80
--green:       #16A34A
--amber:       #F59E0B
--red:         #DC2626
```

- Alternate between full-bleed navy gradient slides (statement moments) and near-white paper slides (content). This gives the deck rhythm on video.
- Headlines: very large, tight leading, bold.
- Thin uppercase letterspaced eyebrow label above every headline, in accent blue.
- Card-based layouts, generous whitespace, soft shadows, 16px radius.
- A subtle animated SVG wave at the bottom of every navy slide, drifting slowly. Keep it slow enough not to distract on video.
- Persistent footer: small FishPin logo bottom left, slide number bottom right.
- **The footer must never name any university or institution.**

## ANIMATION PRINCIPLES

- Every element enters. Nothing is simply present on load.
- Stagger reveals by 80 to 120ms so the eye follows a path.
- Numbers count up from zero using GSAP, roughly 1.2 seconds with an ease-out.
- Use `prefers-reduced-motion` to disable animation gracefully.
- Keep every entrance under 1.5 seconds total. At 17 seconds per slide there is no room for slow choreography.
- No spinning, bouncing, or flip effects. This is a government grant pitch, not a product launch.

## MEDIA PLACEHOLDERS

Where I mark media, build a styled placeholder container with a dashed border, an icon, and the caption text, sized correctly so I can drop the real file in later. Structure the HTML so I can swap a placeholder for a `<video>` or `<img>` tag by replacing one element.

Video placeholders must be `<video autoplay muted loop playsinline>` ready, with a `poster` attribute slot.

---

## SLIDE 1, COVER

Full navy gradient.

- FishPin logo mark and wordmark, fading in first
- Headline: **The Fisherman's Companion**
- Subhead: Affordable, offline-first marine navigation for Filipino fishermen. No internet, no expensive device.
- Three pill tags animating in with stagger: Offline GPS · AI Fish Scanner · One-Tap SOS
- Lower left credential block:
  - Enterprise: **FishPin Marine Navigation App**
  - Proponent: **Robert S. Maestro Jr.**
  - Province: **Oriental Mindoro**
  - Category: **Start-Up, Digital Agriculture**
- Right: video placeholder, "Fisherman heading out to sea at dawn," with a soft vignette

**Animation:** logo fades, headline words rise in sequence, pills stagger, video fades up last.

## SLIDE 2, THE FOUNDER

Paper background. Eyebrow: WHY I APPLIED
Headline: **Built by the son of a fisherman.**

Left, a profile card with a circular photo placeholder:
- Robert S. Maestro Jr., Founder and Developer
- Mansalay, Oriental Mindoro
- BS Information Technology, 2020
- Six years as a professional software developer
- Tags: React Native · UI/UX · Anak ng mangingisda

Right, a navy pull-quote card:
> "I grew up watching my father and our neighbours push their bancas into the dark with nothing but landmarks to guide them. I built the tool they never had."

Below: I applied to the Young Farmers Challenge because the product already works. I need help putting it into their hands.

**Do not mention any university mentor, faculty adviser, or campus affiliation.**

**Animation:** card slides from left, quote fades from right with a typewriter reveal on the first line only.

## SLIDE 3, CONTEXT

Paper. Eyebrow: CONTEXT
Headline: **The poorest people in the country feed the rest of it.**

Left: **27.4%** counting up from zero, very large.
Caption: Fisherfolk poverty incidence, 2023. Second highest of all basic sectors.
Source: Philippine Statistics Authority

Right, two cards:
1. **1.1 million municipal fishermen** (count up) — Registered fishermen work Philippine coastal waters in small boats, on thin margins, with almost no modern tools. Source: BFAR registry.
2. **An entire sector left offline** — Technology reached the cities. At sea, where there is no signal, fishermen still rely on memory, landmarks, and luck.

**Use 1.1 million as the sector size everywhere in the deck. No other figure.**

## SLIDE 4, THE PROBLEM

Paper. Eyebrow: THE PROBLEM
Headline: **Four things go wrong on a single fishing trip.**

Four cards, staggered entry, each with a Lucide icon:
1. **Cannot remember spots** — Productive grounds live only in memory and fade with the fisherman.
2. **Cannot navigate in the dark** — Fog and night erase the landmarks they steer by.
3. **Cannot identify the catch** — Unknown species mean value lost at the market.
4. **Cannot call for help** — Out of signal, a stranded boat has no way to reach shore.

Navy banner sliding up last: The cost is wasted fuel they cannot afford, smaller catches, and lives put at risk, every single trip.

## SLIDE 5, WHY TODAY'S TOOLS FAIL

Paper. Eyebrow: CURRENT ALTERNATIVES
Headline: **Today's solutions fail at the worst moment.**

Table, rows revealing one by one with a 100ms stagger:

| What they use today | Where it breaks down |
|---|---|
| Memorised landmarks and elders' knowledge | Vanish in fog or darkness; the knowledge dies with the elder who held it |
| Visual memory to identify fish | Unknown species get sold for less than they are worth |
| Paper notes for catches and spots | Lost to seawater, rain, and time |
| Garmin GPS plotters, PHP 8K to PHP 30K | Unaffordable for a municipal fisherman |
| Radio or shouting to other boats | Useless once you are far from other boats or any signal |

Callout bar in amber: Every alternative shares one fatal gap. None of them work when there is no signal and no one nearby, which is exactly when a fisherman needs them most.

## SLIDE 6, THE SOLUTION

Navy gradient. Eyebrow: OUR SOLUTION
Headline: **One app that works where the signal doesn't.**

Three glass-effect feature cards with icons:
1. **Offline GPS spot-saving** — Pin productive grounds and navigate back, fully offline, with marine charts and trail recording.
2. **One-tap SOS** — Send exact coordinates to emergency contacts by SMS, anywhere at sea.
3. **AI fish scanner** — Photograph a catch to identify the species, estimate size, and surface market value, from a guide of 200+ Philippine species.

Bottom strip, small: BUILT ON — React Native · SQLite offline · Supabase · Mapbox · Gemini AI

## SLIDE 7, THE OFFLINE PROOF (interactive centrepiece)

Paper. Eyebrow: THE INNOVATION
Headline: **Airplane mode on. Still working.**

**This is the most important slide in the deck. Build it as a genuine interactive demonstration.**

Centre: a phone frame containing a video placeholder, "At-sea screen recording: airplane mode toggled on, chart still live."

Above the phone, an interactive toggle switch labelled **Airplane Mode**. Wire it up:
- Toggle OFF: a signal-bars icon shows connected, and a caption reads "Any navigation app works here."
- Toggle ON: the signal icon crosses out, an airplane icon appears, and three competitor chips (Navionics, Fishbrain, Google Maps) visibly grey out and dim with a short GSAP fade, while the FishPin chip stays fully lit and pulses once in accent blue. Caption changes to "Only FishPin still works."

Right, a short card: Once installed, navigation, charts, waypoints and the species guide function entirely without a signal. This is the one thing every competitor gets wrong.

## SLIDE 8, HOW IT WORKS IN THE HAND

Paper. Eyebrow: SOLUTION DESIGN
Headline: **Designed for one hand, at sea, in the dark.**

Left: a phone mockup with a video placeholder, "Screen recording: dropping a pin, trail recording, fish scanner result."

Right, three tabs the viewer can click, each swapping the phone content and a short description:
- **Save a spot** — One tap saves a productive ground permanently. Navigate straight back to it next week.
- **Record the route** — The trail records as the boat moves, so he can find his way home in fog or darkness.
- **Scan the catch** — Photograph an unfamiliar fish. The app names the species in Filipino, estimates weight, and shows market value.

Default to the first tab. Auto-advance through the tabs every 5 seconds so the recording captures all three without me clicking.

## SLIDE 9, VALUE PROPOSITION

Full navy gradient. Eyebrow: VALUE PROPOSITION

One sentence, centred, very large, words rising in sequence:

**An affordable, offline-first navigation and safety app for Filipino fishermen. No internet, no expensive device.**

Three supporting lines fading in beneath, in a row:
- Works fully offline at sea
- PHP 499 once, no subscription
- Philippine species, Philippine emergency numbers

## SLIDE 10, COMPETITIVE LANDSCAPE

Paper. Eyebrow: COMPETITION ANALYSIS
Headline: **Strong products, for the wrong fisherman.**

Comparison table, FishPin column highlighted in accent blue and scaled very slightly larger. Rows reveal with stagger; green checks and grey crosses pop in.

| Feature | FishPin | Navionics | Fishbrain | Garmin plotter |
|---|---|---|---|---|
| Works fully offline at sea | Yes | Charts only, needs subscription | No, needs internet | Yes |
| Price | PHP 499 once | ~PHP 2K per year | ~PHP 4.5K per year | PHP 8K to 30K device |
| PH fish guide with local names | Yes | No | No | No |
| One-tap SOS by SMS | Yes | No | No | No |
| Cost over 5 years | PHP 499 | ~PHP 10K | ~PHP 22K | PHP 8K to 30K+ |

Callout: A PHP 499 one-time market does not fit a subscription incumbent's model. The moat compounds with every user: localised species data with Filipino names, community fishing records, and cooperative trust no global player has on the ground.

## SLIDE 11, BUSINESS MODEL CANVAS

Paper. Eyebrow: BUSINESS MODEL CANVAS
Headline: **The whole venture, on one page.**

Nine-block canvas grid, blocks fading in with stagger, the centre Unique Value Proposition block in navy and revealed last.

- **Problem:** Marine navigation tools are too expensive, internet-dependent, and not designed for life at sea.
- **Solution:** Affordable offline app with GPS spot-saving, AI fish scanner, one-tap SOS.
- **Unique Value Proposition:** Offline GPS and fishing app for Filipino fishermen. No internet, no expensive device.
- **Unfair Advantage:** Built by the son of a fisherman from Oriental Mindoro. Lived community knowledge no competitor has.
- **Customer Segments:** Smartphone-owning municipal fishermen and recreational anglers. Fisherfolk cooperatives as the trusted channel.
- **Key Metrics:** Downloads, purchase conversion, pins and trails saved, SOS uses, catches logged, retention.
- **Channels:** Google Play Store, social media, word of mouth, cooperative and BFAR partnerships.
- **Cost Structure:** Development and maintenance, Supabase, map tile licensing, Gemini AI, Play Store fees, advertising.
- **Revenue Streams:** One-time PHP 499 purchase via Google Play Billing. Cooperative bulk licensing kept as a future option.

## SLIDE 12, MARKET SIZE

Paper. Eyebrow: MARKET SIZE
Headline: **One market, measured in fishermen.**

Three horizontal bars growing left to right in sequence, values counting up:
- **TAM, PHP 549M** — 1.1M PH municipal fishermen × PHP 499
- **SAM, PHP 384M** — estimated 70% smartphone ownership × PHP 499
- **SOM, PHP 2.5M** — 5,000 paid users over 3 years × PHP 499

Right, a card headed **Basis and assumptions**:
- Sector size from the BFAR registry of registered municipal fishermen.
- Smartphone ownership is a working assumption, not yet measured.
- Structured interviews at Mansalay landing sites are scheduled to validate it.
- Starting market: roughly 103 small-banca fishermen in Barangay B. del Mundo, then Mansalay, then Oriental Mindoro and MIMAROPA.

**Critical: label the 70% an assumption. Never write "measured," "surveyed," "interviewed," or "field-validated" on this slide or anywhere else.**

## SLIDE 13, GO TO MARKET

Paper. Eyebrow: MARKETING AND SALES STRATEGY
Headline: **Start where I'm trusted. Then ride the coastline.**

Animated rollout chevron drawing left to right: Oriental Mindoro and MIMAROPA → Visayas → Bicol

Four cards, staggered:
1. **Digital** — Facebook, TikTok, and Play Store listing optimisation, reaching fishing groups and coastal barangay networks. PHP 2,000 per month.
2. **On the ground** — Live demonstrations at fish landing sites and cooperative gatherings.
3. **Partners** — BFAR extension workers, fisherfolk cooperatives, barangay officials, Municipal Agriculture Office.
4. **Metrics** — Downloads, install-to-purchase rate, cost per acquisition, retention at 30 and 90 days.

Footer line: Marketing cost of PHP 24,000 for the year against a target of 200 paid users, or PHP 120 per paying customer.

## SLIDE 14, REVENUE MODEL

Split layout, navy left and paper right. Eyebrow: REVENUE MODEL AND PRICING
Headline: **Pay once. Own it. No subscription at sea.**

Left, a large price card: **PHP 499** one-time, the number counting up.
A single in-app purchase through Google Play Billing unlocks FishPin permanently.
Small line: Roughly a fifth to a sixtieth of a PHP 8K to 30K Garmin plotter.

Add a small animated five-year cost comparison: four thin bars growing to show FishPin at PHP 499 staying flat while Navionics reaches ~PHP 10K and Fishbrain ~PHP 22K.

Right, two cards:
1. **Why one-time, not subscription** — Fishermen have scarce cash and scarcer data. A subscription dies the first month money is tight. This is a deliberate design choice, not a limitation.
2. **Payment** — Google Play Billing handles card, GCash, Maya, and carrier load. No cash for the enterprise to collect.

Bottom strip: Year 1 target of 200 paid licences equals PHP 99,800 in gross sales.

## SLIDE 15, FINANCIAL PROJECTIONS

Paper. Eyebrow: FINANCIAL PROJECTIONS
Headline: **Honest math, and a model that improves.**

Left: Chart.js bar chart, cumulative paid users by quarter, animating on entry.
Q1 = 15, Q2 = 45, Q3 = 120, Q4 = 200

Right, a figures panel, each value counting up:

| | |
|---|---|
| Total investment cost | PHP 132,521 |
| YFC grant applied for | PHP 80,000 |
| Proponent counterpart | PHP 52,521 |
| Gross sales, year 1 | PHP 99,800 |
| Net income, year 1 | PHP 40,034 |
| Return on investment | 30.21% |
| Payback period | 3.31 years |

Callout bar: Year one carries the entire capital cost. From the second cycle onward only recurring services remain while the paid base keeps growing, so net income and return on investment both improve substantially.

**Do not display PHP 227,000 or any "total raise." That figure is obsolete.**

## SLIDE 16, SOCIAL AND ENVIRONMENTAL IMPACT

Navy gradient. Eyebrow: SOCIAL IMPACT
Headline: **More than a tool. A safer way to make a living.**

Left: a phone mockup showing the SOS screen. **Build a working interactive hold-to-activate button:** press and hold and a circular progress ring fills over three seconds, then reveals a simulated sent message showing coordinates. It must reset when released early. Auto-play this animation once on slide entry so the recording captures it without input.

Right, three cards revealing in sequence:
1. **Safety at sea** — Three seconds on the SOS button sends exact coordinates to family by SMS, even with no internet. The app detects the network and shows how to borrow load.
2. **Income and dignity** — Fewer wasted trips, less fuel burned, and fair market value for every catch identified.
3. **Knowledge preserved** — Fishing grounds and species knowledge recorded instead of dying with the elder who held it.

Closing line across the bottom, fading in last and held: Fisherfolk feed this country. They should not also be the ones who go missing because they had no way to say where they were.

## SLIDE 17, STATUS AND THE ASK

Full navy gradient, mirroring the cover.

Logo plus a live pill: Live now · Google Play

Headline: **Help me reach the first 2,000 fishermen.**

Three metric cards, values counting up:
- **30** closed testers running the production build
- **1st** paying customer already in
- **6** core flows live, 200+ fish species

Subhead: A live product on Google Play since June 2026, built by someone who lived the problem. With this grant I register the enterprise properly and scale across Oriental Mindoro and MIMAROPA.

Three cards along the bottom:
- **THE ASK** — PHP 80,000 YFC grant, against PHP 52,521 of my own counterpart
- **THE PLAN** — 200 paid users in year one, then MIMAROPA-wide
- **THE POINT** — Bring every fisherman home

Video placeholder behind, dimmed: "A fisherman returning home at golden hour"

---

## ADDITIONAL FEATURES TO BUILD IN

1. **Presenter timer.** A thin progress bar across the top showing elapsed time against 5:00, turning amber at 4:30 and red at 4:50. Toggle with the `T` key so I can hide it before recording.
2. **Auto-advance mode.** Press `A` to run the whole deck on a timer using the per-slide durations from my script, so I can record hands-free. Roughly 17 seconds per slide, but longer on slides 7, 8, 16 and 17.
3. **Speaker notes** in Reveal's notes plugin, so I can open the speaker view on a second screen.
4. **PDF export** working via Reveal's print stylesheet, so `?print-pdf` produces a clean static deck.
5. **Slide 0 hidden title card** that shows only in the recording's first second, then auto-advances. Skip if it complicates the export.

## CONTENT RULES, APPLY THROUGHOUT

1. **No survey or interview statistics.** Never state that anyone was interviewed or surveyed, or that any figure was measured or field-validated. No "103 fishermen interviewed," no "80 said," no "70% measured," no "1 in 2 would pay," no named interviewees.
2. **The only place 103 appears** is slide 12, as roughly 103 small-banca fishermen in Barangay B. del Mundo. It is a local population estimate, not research.
3. **No self-assigned scores.** No viability index, no percentage rating of the venture.
4. **No university, campus, faculty mentor, or academic affiliation** anywhere, including footers.
5. **Sector size is 1.1 million** everywhere.
6. **No customer persona** with an invented named individual.
7. **No em dashes.**
8. Do not add slides beyond the 17 specified.

# Handover: Vaibhav Sharma personal site

Everything needed to pick this project up cold: what the site is, how it is built and deployed, every
design and content decision made so far (and why), the facts on the page and where each came from,
what is still open, and the tooling and gotchas met along the way.

Live site: https://vaibhavsharma-iima.github.io/Personal-Website/
Repository: https://github.com/VaibhavSharma-IIMA/Personal-Website (default branch `main`)

---

## 1. What the site is

A single-page, dependency-free personal site (plain HTML, CSS and JavaScript, no build step) for
**Vaibhav Sharma**: ex-Software Engineer (Observability, Logs & Events) at LinkedIn, ex-Investment
Banking Summer Intern at Deutsche Bank, Investment Partner at Campus Fund, and PGP (MBA) candidate at
IIM Ahmedabad, Class of 2027.

**Audience:** prospective hirers first (the site doubles as a portfolio) and student founders second
(Campus Fund). Campus Fund must not read as his permanent job; the MBA leads.

**Origin:** modelled on the site of a former LinkedIn teammate, Likith Srinath
(https://likithsrinath2000.github.io/, repo `likithsrinath2000/likithsrinath2000.github.io`): an
observability-themed page with a scrolling log-stream background, a KQL-console career log and
canvas animations. The base CSS and JS structure was adapted from it, then grew far beyond it.

**The idea:** the page tells Vaibhav's story in three acts, and the visual theme changes with each
act as you scroll:

| Act | Period | Look | Background stream |
| --- | --- | --- | --- |
| I · Campus | 2017 to 2023 | Mission control: navy, phosphor green (`#3dff9a`) | A CanSat telemetry packet table |
| II · LinkedIn | 2022 to 2025 | Observability console: dark, cyan (`#38e1ff`) | Structured log lines |
| III · MBA & finance | 2025 to now | Bloomberg terminal: near-black, amber (`#ffa31a`) | A market ticker tape |

Two scroll-driven "pivot" sections morph one act into the next.

---

## 2. Page structure (top to bottom, as live)

Section numbers are assigned automatically by JS to visible sections.

1. **Hero** (campus look). Status pill: "now: MBA candidate at IIM A, Class of 2027, and Investment
   Partner at Campus Fund". Name "Vaibhav **Sharma**" (surname in accent, kept by choice). A rotating
   typewriter title (order: MBA Candidate @ IIM Ahmedabad, Class of 2027 → Investment Partner @
   Campus Fund → ex-Investment Banking Summer Intern @ Deutsche Bank → ex-Software Engineer @
   LinkedIn). Intro paragraph (the user prefers this original wording, see § 6). Buttons: "Start the
   story ↓" (to About) and "Contact". The hero has no visual panel any more (the ground track was
   removed; see § 5.6).
2. **01 Right now**: three cards. Investment Partner, Campus Fund, 2026 to now (current; links to
   Contact, "Founders, get in touch →"). MBA candidate, Class of 2027, IIM Ahmedabad, 2025 to now
   (current). Investment Banking Summer Intern, Deutsche Bank, Summer 2026 ("just wrapped").
3. **02 A life of crossroads**: three-paragraph story (forward chronological) plus a timeline listed
   **newest first** with date ranges (2026 to now, Summer 2026, 2025 to now, 2023 to 2025, 2021,
   2019 to 2023). The paragraph rewrite is pending (§ 7).
4. **ACT I: Campus, 2017 to 2023**
   - **03 Flight record // education**: B.Tech card (NSUT, 8.95/10, Dept Rank 3/147, CVSPK merit
     scholar, "with a full tuition fee waiver") and School card (Mount Carmel School, Delhi (CBSE),
     XII 97%, X 10/10, KVPY 1/869; NDA AIR 10 mentioned).
   - **04 Mission summary // CanSat 2021, Team GAGAN**: six stat tiles (#2 intl rank of 200+ teams,
     99.17% final score, 10 people led as a sophomore, 100% practical, 100% documentation, 0% packet
     loss), then two animated panels side by side (flight replay; ground-station link), then the
     simulated telemetry readout bar, then two text panels (Mission; Ground station: my build).
   - **05 Side missions // hackathons & competitions**: nine cards in a 3 × 3 grid (CanSat ground
     station, Project SATARK, Chandigarh Police, IACE, WIEHack 3.0, Innovathon'22, CuseHacks'21,
     ApolloHacks'21, Reply Code Challenge).
   - **06 Badges // exams & scholarships**: campus honors table (NDA, KVPY, JEE, CVSPK, Reply, NCC 'A',
     MUN).
   - **07 Off the launchpad // leadership on campus**: one full-width panel, three entries side by
     side (Editor, The Alliance; WIE Vice Chair, IEEE NSUT; Public speaking & MUNs).
5. **Pivot 1** "From ground station to data centre": the CanSat flight profile's telemetry points drop
   into daily log-volume bars; campus look → engineering look.
6. **ACT II: LinkedIn, 2022 to 2025**
   - **08 Career log // grep -r "vaibhav" ./linkedin**: six impact stats, the TEAM strip, and the KQL
     explorer (filters: all, logs, events, reliability, internship; rows expand).
   - **09 What I built on**: the event-pipeline animation and a simulated metrics bar, then three cards
     (Logs, Events, Reliability).
   - **10 Tools of the trade**: stack chips.
7. **Pivot 2** "From throughput to returns": log-volume bars morph into candlesticks; engineering →
   finance.
8. **ACT III: MBA & finance, 2025 to now**
   - **11 Tombstones // deals closed & positions open**: IIM Ahmedabad (₹14L, Xceedance merit
     scholarship), Deutsche Bank (Summer ’26, investment banking internship), Campus Fund (Day 0,
     backing student founders). LinkedIn was removed from the tombstones by request.
   - **12 Holdings // MBA-era honors**: CAT, Xceedance, Sangharsh'26, Shaurya 2025, Yalgaar, PM Dissect.
9. **Epilogue**
   - **13 VBHV // the whole journey as one ticker**: an illustrative "price" chart 2017 → today with
     clickable real events, range buttons (1Y/3Y/5Y/MAX).
   - **14 Get in touch**: a "contact sheet" with two lanes (§ 5.9).
10. Footer: "© year Vaibhav Sharma, Ahmedabad" and a status line that changes with the act
    (telemetry nominal / all systems operational / markets open, long builders).

Nav: Now · About · Campus · LinkedIn · Finance · Journey · **Contact** (button). Brand wordmark suffix
changes with the act: `vaibhav.launch` → `vaibhav.o11y` → `vaibhav.capital`.

---

## 3. Files and architecture

```
index.html                 the page
assets/css/style.css       all styles; Hallmark stamp in the first lines
assets/js/main.js          all behaviour (vanilla JS, canvas and SVG)
.github/workflows/deploy.yml   GitHub Pages deploy on push to main
.nojekyll                  serve files as-is
README.md                  short overview (written for the two-act version; partly outdated)
HANDOVER.md                this file
```

### 3.1 Modes and the phase variable (main.js top)

- `window.__mix1` (pivot 1 progress, 0 → 1) and `window.__mix2` (pivot 2) are set by the two pivot
  modules. `window.__phase = __mix1 + __mix2` runs 0 (campus) → 1 (engineering) → 2 (finance).
- `window.__updateMode()` sets `<html data-mode="campus|eng|fin">` at phase 0.5 / 1.5, swaps the brand
  suffix and the footer status, and fires a `modechange` event.
- `<html data-theme="dark|light">` is the theme toggle (saved in `localStorage`); default follows the
  OS. The head script also sets `data-mode="campus"` and adds a `js` class before first paint.

### 3.2 Colour tokens (style.css)

- Registered custom properties (`@property`) for `--bg`, `--glow-1`, `--glow-2`, `--accent`,
  `--accent-2`, `--event`, `--border` so they tween over 0.9s when the mode changes.
- Blocks: `:root` (engineering default), `:root[data-mode="campus"]`, `:root[data-mode="fin"]`, and
  light-theme versions `:root[data-theme="light"]`, `[data-theme="light"][data-mode="campus"]`,
  `[data-theme="light"][data-mode="fin"]`.
- A "fixed palette" block at the top of `:root` holds every literal colour (`--shade`, `--sheen`,
  `--cyan`, `--green`, `--phosphor`, `--amber`, `--amber-term`, `--kql-*`, `--term-*`, etc.) and the
  fonts `--font-body` (Inter) and `--font-mono` (JetBrains Mono). No literal colour or font-family
  appears outside the token blocks (Hallmark gate 48).

### 3.3 Background canvas (`#log-stream`)

Fixed full-viewport canvas behind everything. Three layers blended by phase weights
(`wC = 1 - phase`, `wE = 1 - |phase - 1|`, `wF = phase - 1`):

- **Campus: CanSat packet table** (illustrative). A status strip (`LINK RX  RSSI -7x dBm  LOSS 0.0%
  MISSION T+hh:mm:ss  STATE`), a pinned column header, then rows. Columns: TEAM (always `GAGAN`),
  MISSION_TIME, PKT, ALT_m, an altitude bar, PRESS_hPa (standard-atmosphere formula from altitude),
  TEMP_C, VOLT, SATS (7 to 9; chosen over GPS coordinates so no real launch location is implied),
  STATE, CRC (`OK`). The newest packet enters at the top and is lit like a live feed (▶ marker);
  rows flow down. A flight-phase change prints an amber event line (ON THE PAD, LIFTOFF, APOGEE
  REACHED, SEPARATION, PARACHUTE DEPLOYED, TOUCHDOWN). The flight loops every 300 packets: pad
  (t<4), ascent to 700 m (t<22), apogee (t<26), descent at 3.2 m/s (t<120), parachute at 2.4 m/s
  from 400 m (t<288), landed. Tables tile across wide screens (720px each).
- **Engineering: log lines** (`HH:MM:SS.mmm LEVEL [service] message`) in falling columns, levels
  coloured INFO/DEBUG/WARN/ERROR.
- **Finance: market tape** (`SYMBOL price ▲/▼ change%`, symbols like NIFTY50, SENSEX, USDINR, VBHV).
- Opacity: dark 0.28 (fin 0.18); light 0.3 (fin 0.22), raised by request so light mode keeps its look.

### 3.4 Pivots

Both are sticky sections (280vh tall) whose sticky panel sits under the nav (`top: var(--nav-h)`,
`--nav-h: 72px`). Progress p 0 → 1; the mix uses `smooth((p - 0.3) / 0.4)`.

- **Pivot 1 (liftoff)**: 32 points along an illustrative flight profile (fast climb, slow descent),
  green dots and line, drop into cyan log-volume bars that are exactly pivot 2's starting bars
  (`window.__pivotVols`). Legend crossfades "Altitude (m), CanSat flight profile (illustrative)" →
  "Daily log volume (PB)"; x-axis "mission time →" → "days →"; right axis "700 m…0 m" → "9 PB…0 PB".
  Caption: "The CanSat ground station was the first time I built software that pulled data from a
  live system. At LinkedIn the data got a lot bigger."
- **Pivot 2**: cyan log bars → Bloomberg candles (up `#00d26a`, down `#ff3b30`, amber grid, white
  5-day moving average). Legend "Daily log volume (PB)" → "VBHV price (illustrative)" with up/down/
  average swatches; x-axis "days →" → "trading days →". Caption: "I now look at startups with an
  engineer's sense of what's genuinely hard to build and a banker's eye for whether the economics
  hold up." Data is seeded (seed 7) so the morph is identical every visit.

### 3.5 Other JS modules

- Typewriter (reserves the height of its longest phrase so wrapping never shifts the page; the title
  line is wider than the intro on desktop).
- **Mission summary sims**: one shared illustrative flight (`FLIGHT_MS = 16000`) drives the flight
  replay (side view: rocket, apogee, CanSat, parachute, landing; event ticks LAUNCH, APOGEE, PARACHUTE,
  LANDED), the ground-station link (dish, CanSat with canopy once deployed, blue command squares up,
  green telemetry dots down, counters, "LOSS 0.0%") and the telemetry readout (altitude, descent rate,
  payload temp, packet loss, altitude sparkline). Reduced motion shows a static frame.
- Event pipeline (producers → emitter → kafka → events platform → query) and simulated metrics bar
  (ingest events/s, p99 ms, log volume TB/hr, errors %), flagged "simulated, not real metrics".
- Focus-card mini visuals: logs (streaming bars), events (fan-in/fan-out: producers → topic →
  consumers), reliability (SLO line).
- Career log explorer: `CAREER` array, filters rewrite the KQL text, histogram of detail lines per
  year (2022 to 2025), expandable rows (collapsed details are `visibility: hidden`).
- Count-up stats on every `.impact` block.
- VBHV chart: `EVENTS` array (t = fractional year, v = index level), seeded monthly series, SVG,
  markers are focusable buttons, prev/next, range buttons; `NOW = 2026.82`.
- Honors tables: `H` array, rows tagged `campus`, `fin` or `other`; tables render by `data-act`.
- Heading snap: on scroll end, if a section heading (or a pivot's `.snap-mark`) is within **80px**
  (`SNAP_PX`) of its resting spot under the nav, glide it into place. CSS proximity snapping was
  replaced because browsers snap from about 250px away (not adjustable), which felt too sticky.
- Scroll reveal: `.reveal` hidden only under `html.js`; cascade delay follows reading order,
  `Math.min(i, 10) * 70ms` (it used to wrap every 8 items, which made the 9th card appear first).
- Terminal clock (IST), theme toggle (SVG moon/sun icons, swapped by CSS).

### 3.6 Preview variants (still in the code)

`?honors=split|epilogue|chart` (default `split`): `split` = campus Badges in Act I plus MBA Holdings
in Act III; `epilogue` = one combined Holdings table in the epilogue; `chart` = no tables, extra
markers on the VBHV chart (AMIMUN'20, CVSPK, PM Dissect, Sangharsh'26). Any variant parameter or
`?preview` shows a small switcher bar at the bottom. Visitors without parameters never see it. The
user has not formally picked a variant; the default shipped. A former `beyond` variant was removed
when Beyond the desk was deleted. Once a variant is chosen, the others and the switcher can be removed.

---

## 4. Deployment

- GitHub Pages, **Source: GitHub Actions**, workflow `.github/workflows/deploy.yml` deploys the repo
  root on every push to `main`. The site updates about 30 to 40 seconds after a merge.
- Setup history (resolved, kept for reference): the repo started with only the working branch, which
  became the default. An empty `main` was created ("Initial commit") and the first PR merged into it.
  The first deploy failed because Pages was not enabled yet ("Get Pages site failed"); the second
  failed because the `github-pages` environment only allowed the old default branch ("Branch main is
  not allowed to deploy to github-pages due to environment protection rules"). Fix: Settings →
  Environments → github-pages → deployment branches: allow `main`; Settings → General → Default
  branch: `main`.
- Browser cache: Pages sends `max-age=600`, so a hard refresh (Cmd/Ctrl+Shift+R) is needed to see a
  deploy immediately. Several "not updated" reports were this cache.
- Workflow used throughout: work on branch `claude/jolly-goldberg-28t2su`, reset it from `main` after
  each merge, open a PR, merge on the user's "ship it".
- Merged PRs: #1 initial site · #2 round-2 polish · #3 hero title, heading snap, timeline ranges,
  chart labels · #4 three-act restructure, mission-control theme, packet table, latest-first hybrid ·
  #5 Hallmark polish · #6 mission sims, richer packet table, contact framing, content trims · #7
  reveal order and full-width leadership panel.
- Note: the deploy publishes the whole repo root, so this file is also served at `/HANDOVER.md` on the
  live site.

### Custom domain (discussed, not done)

Possible: buy a domain (e.g. a `.com`, or `vaibhav.capital` to match the finance wordmark), add four A
records for `@` (185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153) and a `www`
CNAME to `vaibhavsharma-iima.github.io`, enter it in Settings → Pages → Custom domain, then Enforce
HTTPS. No CNAME file is needed with Actions deploys. Renaming the repo to
`vaibhavsharma-iima.github.io` would give the root URL without `/Personal-Website`. Changing the
`vaibhavsharma-iima` part means renaming the GitHub account (not recommended). Name ideas offered:
`vaibhavsharma-iima.github.io` (recommended), `vaibhav`, `vaibhav.capital`, `throughput-to-returns`,
`builder-to-backer`.

---

## 5. Decisions (with the reasons)

### 5.1 Metrics and honesty

- Use **only Vaibhav's own numbers** (CV and LinkedIn). Likith's personal metrics ($550K saved, 5PB/day,
  157 Go services, 800 Kafka topics, 500+ PRs) were **not** copied: they are his and mostly from his
  Senior role after Vaibhav left. Shared team context (the platforms and stack) was used.
- Simulated figures are always labelled ("simulated, not real metrics/telemetry", "illustrative",
  "The price line is made up for illustration. The events on it are real").
- "83% faster" traffic shifts is from the CV (Hallmark's metric warning was dismissed).
- The career-log migration line keeps "single-handedly" (CV wording) in the stat note; the Logs card
  was changed to credit the team ("Our team ran the central logs platform…"; "on my own" removed).

### 5.2 Structure and order

- Option A, strict chronology in three acts, chosen over a minimal reshuffle or an overview-first page.
- **Hybrid latest-first**: the hero, the "Right now" strip and the newest-first timeline lead with the
  present; the story sections then run forward. Full reverse chronology was rejected because the
  pivots would read backwards ("from returns to throughput").
- Tombstones without LinkedIn. Honors split by period (default variant).
- Simulations moved out of the hero (first to What I built on, and the CanSat ones to Mission summary).

### 5.3 Visual direction

- Campus theme: **mission control** (chosen over blueprint, campus newspaper, exam-hall/OMR).
- Campus background: **labelled packet table** (option A, chosen over strip charts, a webcast HUD or
  radar), then extended with all of: live newest row, event lines, altitude bar, status strip,
  mission clock, SATS and CRC columns, and a PRESS_hPa column.
- Pivot 2 colours: option 6 "Bloomberg" (green/red on amber grid, white MA), chosen from six.
- Events card animation: option B "fan-in / fan-out" (from service graph, fan-in/out, partitioned log,
  trace waterfall).
- Mission summary panels: **C flight replay + B ground-station link**, with the telemetry readout
  moved there from the hero. The old hero ground track was dropped (it implied an orbit; CanSat is
  rocket-launched to about 700 m and parachutes down).
- Light mode keeps the background streams visible (raised opacity).
- Hero title colour: the surname keeps the accent (a deliberate exception to Hallmark gate 38iii).
- Terminal labels kept: uppercase tracked mono labels, `01`… section numbers and act tags stay by
  choice even though Hallmark rules them out (gates 54, 64, 67).

### 5.4 Copy rules the user set

- Plain, human voice; run prose through the **humanizer** skill; do not run it on short phrases or
  labels. No em/en dashes in copy, no middle-dot strings (use commas, colons, parentheses, "to"),
  typographic quotes in prose and straight quotes in code.
- Not braggy in the early drafts (no "no coaching, no prep", no "knowing nothing about satellites");
  later the user asked to **brag more** where facts justify it (mission leadership, olympiads, the
  pending crossroads rewrite).
- "Investment Banking" always spelled out (never "IB"); former roles prefixed "ex-".
- "Towards markets" is wrong (it was not a trading role); the finance interest is phrased around how
  deals get done.
- The hero intro stays as originally written ("Building is the through-line…"); a humanized rewrite
  was rejected.
- Always show drafted text for approval before changing prose on the site.

### 5.5 Approved copy now on the site (key passages)

- Crossroads (current, pending replacement): NDA AIR 10 → chose engineering; NSUT satellite team,
  first year to leader in second year, second in the world at CanSat 2021 (NASA-sponsored); LinkedIn
  two years; deferred IIM A, joined 2025; "The finance courses in first year made me want to see how
  deals actually get done, so I spent the summer at Deutsche Bank as an investment banking intern,
  learning how to value a business and check whether the numbers hold up. Now I'm an Investment
  Partner at Campus Fund, where I back student founders."
- Mission summary: "I joined the team in my first year and was made its leader in my second, the first
  time the university had ever given that role to a sophomore; it had always gone to seniors. NASA and
  Lockheed Martin scientists judged our live satellite demonstration, and it scored 100%."
- MUNs line: "Best Delegate out of 100+ at AMIMUN’20, and a Special Mention out of 50+ at SYMUNC’19.
  All through school I competed in olympiads in maths, science, social science, English and Hindi,
  and in poetry, debate and quiz competitions, and I consistently topped them."
- TEAM strip: "Observability Engineering (Logs & Events), LinkedIn Bangalore. We owned two
  company-wide platforms: the centralized logging platform and the centralized events platform. Logs
  were collected by Fluent Bit agents running on LinkedIn's servers, streamed through Kafka, and landed
  in Azure Data Explorer, where engineers searched them with KQL. Events came in through emitter
  libraries (Python and Go) and an API layer, and flowed through Kafka into the events platform. Our
  own services were written mostly in Go and Python." (No Event Grid, no Blob Storage, no traffic-shift
  mention: the traffic-shift tool was not the observability team's.)

### 5.6 Removed by request

Ground-track hero panel; LinkedIn tombstone; "Beyond the desk" (On the court, On the trail, On the
shelf); freshers basketball tournament; Delhi Zonals win; the NSUT row in the career log and its
"college" filter; Event Grid / Azure Blob / Kubernetes from the stack (Fluent Bit added); the
hero's simulated metrics bar (moved); "Pitch me" framing (now Contact).

### 5.7 Honors placement

- Campus Badges: NDA-2 2018 (AIR 10), KVPY (1/869), JEE Mains/Advanced, CVSPK, Reply Code Challenge,
  NCC 'A' Certificate (4 Delhi Battalion NCC, 2016), AMIMUN'20/SYMUNC'19.
- MBA-era Holdings: CAT 2022, Xceedance Scholarship, Sangharsh'26 (silver medal, inter-IIM tournament
  between IIM A, B, C, L, basketball), Shaurya 2025 (silver medal, inter-college tournament between
  colleges and universities in Gujarat), Yalgaar (runner-up, IIM A basketball, 2025), PM Dissect.
- In the combined table only (epilogue variant): CanSat 2021, B.Tech, Bravo Award ×2.

### 5.8 Contact and privacy

- Shown: LinkedIn `/in/vaibhavsharma08`, IIM A email `p25vaibhav@iima.ac.in` (hiring and
  conversations), Campus Fund email `vaibhav.sharma@yourcampusfund.com` (founders lane only).
- Not shown, by choice: phone number, dorm address, personal Gmail, GitHub link.

### 5.9 Contact framing

Section "Get in touch", a "Contact sheet" ("two ways in"): lane 1 "Hiring or a conversation"
(LinkedIn, IIM A email); lane 2, smaller, "Founders, through Campus Fund" (who: UG/PG/PhD students or
2023+ graduates/dropouts; sectors: AI, DeepTech, SpaceTech, ClimateTech, HealthTech, Consumer,
FinTech, Robotics, uncategorised; to start: a prototype, an early experiment, or a strong conviction;
Campus Fund email). Intro: "For roles and conversations, LinkedIn or my IIM Ahmedabad email reach me
fastest. If you are a student founder, Campus Fund backs teams from their earliest days, and I would
like to hear what you are building."

---

## 6. Facts and sources

Sources: the CV PDF (pre-MBA, outdated for IB and Campus Fund), the public LinkedIn profile (updated
source for Deutsche Bank, Campus Fund, Xceedance), and the user's own messages in a ChatGPT export
("HR questions based on profile"; only the user's prompts were treated as fact, never ChatGPT's
answers). The LinkedIn profile was read logged-out through the agent-reach web channel; logging in
was declined (see § 8).

**School:** Mount Carmel School, Delhi (CBSE); X 10/10 (2017, Certificate of Merit); XII 97% (2019,
95+ in 5/5 subjects); KVPY Fellowship 2017 (1/869, Class 11 SA stream, IISc; Vijyoshi camp at IISER
Bhopal); NDA-2 2018 AIR 10 (of 520 recommended, out of 6,931 R1-selected); JEE Mains top 0.834%ile of
11L+, JEE Advanced top 3.2%ile of 1.7L+ (2019); NCC 'A' Certificate (4 Delhi Battalion, 2016);
olympiads (maths, science, social science, English, Hindi), poetry, debates, quizzes.

**NSUT (2019 to 2023):** B.Tech IT, 8.95/10, Department Rank 3/147; CVSPK Scholarship (top 5% of
1,280+, full tuition fee waiver). CanSat 2021: Team GAGAN leader as a sophomore (first ever), 10-member
team, International Rank 2 of 200+ teams, final score 99.17%, 100% practical and documentation scores,
evaluated by NASA and Lockheed Martin scientists; sponsors NASA, Lockheed Martin, US Naval Research
Lab; organised by the American Astronautical Society. Ground station built from scratch: two-way
comms, 0% packet loss, 100% commands received, +30% team score in practical evaluation, 1s latency
via multithreaded GUI, 40% less space complexity. CanSat 2020: Intl Rank 17 in round 1. Hackathons:
5G Hackathon (Project SATARK, Top 100 of 1K+, ₹1 Lakh, DoT, 2020/21); Chandigarh Police × Infosys
(2nd of 20+, ₹50K, 2021); IACE (Top 5 of 1,500+, NITI Aayog AIM × CSIRO, 2021); WIEHack 3.0 (1st of
100+, ₹10K, 2021); Innovathon'22 (3rd of 100+, ₹4K, Lady Hardinge Medical College); CuseHacks'21
(Best Hack for Social Good, $100, 200+); ApolloHacks'21 (Best Solo Hack, $100, 50+); Reply Code
Challenge 2021 (India #10, World #106, 2,000+ teams). Editor, The Alliance (5 editions, 8K+ readers;
the IAS-senior interview quote "do it once more, not for success, but to avoid the weight of
regret"); IEEE NSUT WIE Vice Chair (2021 to 2022), IEEE TEMS India Student Ambassador, INDICON 2020
volunteer; AMIMUN'20 Best Delegate (100+), SYMUNC'19 Special Mention (50+).

**LinkedIn:** SRE Intern, Groups platform, May to Jul 2022 (75% lower API operational cost, 4+ docs,
40% projected time saving via automation; PPO). Software Engineer, Observability Engineering (Logs &
Events), Bangalore, Jul 2023 to Jun 2025 (23 months): $1M+ annual savings migrating 3PB+ daily log
ingestion across Azure regions single-handedly; 9PB+ daily ingestion on the central logs platform;
events platform from scratch with the team, 0 → 300K+ events/day, 5+ producer teams; Python emitter
library and API layer (per recommendations; the Go version followed its design); 83% faster
inter-datacenter traffic shifts; Bravo award twice, sole recipient among 4; Couchbase → MySQL (data
loss window indefinite → 1 day); Gradle → native Go builds (5x faster, 50+ person-hours); test
coverage 10% → 80%+; 15+ alerts and 10 dashboards (20% less customer impact); 30+ releases, 44+ code
reviews, 13+ proposals reviewed; GenAI incident-analysis prototype (projected 30% lower MTTD); 20+
critical incidents, 300+ queries over 8+ weeks on call; 5+ product KTs and 3+ migration KTs; mentored
1 new hire and 1 intern; drafted a rewrite of the traffic-shift tool that moved to another team in a
restructure. Recommendations from Amal Abdul Majeed (manager) and Gopal Venkatesan.

**MBA and after:** CAT 2022 99.89%ile (VARC 99.97%ile, 2.8L+ candidates); offers from IIM A, C, K, I;
deferred IIM A two years; PGP 2025 to 2027 (Class of 2027); Xceedance Scholarship (Jul 2026, first-year
academics, entire second-year fee, about ₹14 lakh, IIMA Endowment Fund and Xceedance); PM Dissect
(ProdMan Club, Top 25 of 99 teams, 219 participants, 2025); Sangharsh'26 silver; Shaurya 2025 silver;
Yalgaar runner-up 2025. Deutsche Bank Investment Banking Summer Intern, Apr to May 2026 (valuation,
diligence, underwriting a business; no division named on the site). Campus Fund Investment Partner,
2026 to now (the LinkedIn title is "Student Investment Partner"; the site says "Investment Partner"
by request).

**Personal (no longer on the site):** treks (Hidimba Devi snow trek in Manali, Kedarnath, Savandurga and
others near Bangalore); mythological fiction (The Mahabharata Secret series by Christopher C. Doyle;
Shiva Trilogy and Ram Chandra Series by Amish Tripathi).

---

## 7. Open items

1. **Crossroads paragraph rewrite (pending approval).** The user wants a paragraph that moves "from
   high to high", stressing how coveted each opportunity was. Draft offered (not yet applied):

   > In 2017 IISc chose me as one of 869 KVPY fellows in my stream. A year later I cleared the NDA exam
   > with All India Rank 10 among the 6,931 candidates who made the written cut, which put an Air Force
   > cockpit within reach. I turned it down for engineering, and JEE then placed me in the top 0.834% of
   > more than 11 lakh candidates.
   >
   > At NSUT I became the first sophomore ever to lead the university's satellite team, a role that had
   > always gone to seniors. We finished second in the world at CanSat 2021, in a field of 200+ teams
   > judged by NASA and Lockheed Martin scientists. LinkedIn turned my internship into a full-time offer.
   >
   > At LinkedIn I worked on the platforms behind the company's logs and events. One of them takes in
   > 9PB+ a day, a migration I ran on my own now saves $1M+ a year, and I was the sole recipient of a
   > Bravo award twice.
   >
   > CAT put me at 99.89 percentile, with offers from IIM Ahmedabad, Calcutta, Kozhikode and Indore. I
   > chose Ahmedabad and deferred it two years to finish what I was building. My first-year results there
   > earned a merit scholarship covering my entire second year, I spent the summer in investment banking
   > at Deutsche Bank, and I'm now an Investment Partner at Campus Fund.

2. **Honors variant**: confirm `split` (shipped default) or pick `epilogue` / `chart`, then remove the
   other variants and the preview switcher.
3. **README.md** still describes the earlier two-act version; update when convenient.
4. Hallmark structural findings recorded but not acted on (a full redesign would be needed): the hero
   fills only part of the first screen at 1440px; the hero grid backdrop reads as an empty picture;
   word count per screen far above Hallmark's budget; section gaps vary (some under 120px); some
   headings sit closer to what precedes them than what they head; glass-panel surfaces; one container
   recipe on many selectors; two container widths (1000 and 1120px).
5. Optional: custom domain or repo rename (§ 4).

---

## 8. Tooling used in this project

- **agent-reach** (https://github.com/Panniantong/Agent-Reach, installed from its GitHub release with
  `uv tool install`, never from PyPI). Used to read the public LinkedIn profile via its `web` channel
  (`agent-reach web read <url>`); its LinkedIn channel only reads job postings. Logging in to LinkedIn
  with someone's credentials (directly or via a secret) was declined: automated logins risk account
  locks and break LinkedIn's terms, and the skill forbids logging in for the user. Better routes:
  LinkedIn "Save to PDF" or "Get a copy of your data".
- **humanizer** (https://github.com/blader/humanizer, `SKILL.md` copied to `~/.claude/skills/humanizer`).
  Used on every paragraph-length passage; not on labels or short phrases. Writing samples came from the
  user's own messages (plain words, longish sentences joined with "and", no dashes).
- **Hallmark** (https://github.com/nutlope/hallmark, `skills/hallmark` copied to
  `~/.claude/skills/hallmark`). Ran `audit` at polish depth (layout kept). Genre inferred:
  atmospheric. Before: 201 FAIL / 159 REFLEX; after: 46 FAIL / 13 REFLEX, every remaining FAIL being a
  label rule kept by choice (54 ×21, 67 ×25). The CSS opens with the Hallmark check stamp (gate 20).
  To run its render tier in a cloud container (root, no puppeteer):
  1. `npm install puppeteer-core` in a scratch folder.
  2. Make a wrapper script that runs the bundled Chromium with `--no-sandbox` (Chrome refuses to run
     as root otherwise), e.g. `exec /opt/pw-browsers/chromium-*/chrome-linux*/chrome --no-sandbox "$@"`.
  3. Run `HALLMARK_PUPPETEER=<scratch>/node_modules/puppeteer-core CHROME_PATH=<wrapper> node
     ~/.claude/skills/hallmark/scripts/sloplint.mjs index.html --genre atmospheric --render` from a
     scratch directory. It writes a `.hallmark/` folder into the project: move or delete it before
     committing.
- Skills installed this way live outside the repo and do not survive a fresh container; reinstall
  them in a new session.
- Visual checks used Playwright (preinstalled) against `python3 -m http.server 8080`: screenshots per
  section at 1366px and 390px, dark and light, checking console errors and horizontal scroll.

---

## 9. Working agreements with the user

- Plan first and ask before decisions that are the user's; show copy drafts for approval before
  putting prose on the site.
- Offer visual previews (rendered option sheets) for design choices: this is how chart colours, the
  events animation, the campus theme, the background and the satellite panels were chosen.
- Merge and deploy only on an explicit "ship it"; confirm the live site afterwards.
- Never invent numbers; label anything simulated.

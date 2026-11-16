# vaibhav.launch → .o11y → .capital — personal site

A single-page personal site for **Vaibhav Sharma**: ex-Software Engineer (Observability · Logs & Events)
at LinkedIn, ex-Investment Banking Summer Intern at Deutsche Bank, Investment Partner at Campus Fund, and
PGP candidate at IIM Ahmedabad.

Pure static HTML/CSS/JS: no build step, no framework, no runtime dependencies, no third-party requests.

## The idea

The page tells the story in three acts, and the whole look changes between them.

| Act | Look | Brand | What is in it |
| --- | --- | --- | --- |
| I · Campus | mission control, phosphor green | `vaibhav.launch` | education, CanSat 2021 mission summary with a flight replay, hackathons, exam and scholarship honours, campus leadership |
| II · LinkedIn | observability console, cyan | `vaibhav.o11y` | impact stats, a KQL-style career log with filters, an event-pipeline canvas, platform cards, tools |
| III · MBA & finance | trading terminal, amber | `vaibhav.capital` | deal "tombstones", MBA-era honours, then an epilogue: a `VBHV` price chart of the whole journey and a contact sheet |

Before Act I there is a hero, a "Right now" strip (latest first) and a short About with a timeline.

Two sticky **pivot** sections do the switching as you scroll through them:

1. `#liftoff`: the CanSat flight profile's telemetry packets drop into daily log-volume bars (campus → engineering).
2. `#pivot`: those same bars morph into a candlestick chart (engineering → finance).

Each pivot reports its progress (`__mix1`, `__mix2`), which sets `data-mode` on `<html>` to `campus`, `eng`
or `fin`. The CSS colour tokens tween between modes, and the fixed backdrop canvas crossfades from a
telemetry packet table to a log stream to a market tape.

Light and dark themes are supported. `prefers-reduced-motion` turns the animations off and keeps the content.

## Structure

```
index.html                     # all content and markup
404.html                       # self-contained not-found page
assets/css/style.css           # tokens, themes, modes, layout
assets/js/theme.js             # sets the theme before first paint (loaded without defer)
assets/js/main.js              # everything else
assets/fonts/                  # Inter and JetBrains Mono, self-hosted (SIL OFL 1.1, licences alongside)
assets/og.png                  # link-preview image (1200×630 screenshot of the hero)
.github/workflows/deploy.yml   # GitHub Pages deploy
.nojekyll                      # only matters if Pages is ever switched to "deploy from branch"
```

## Run locally

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080. Opening `index.html` straight from disk is not supported, because the
Content-Security-Policy only allows same-origin files.

## Deploy (GitHub Pages)

1. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Merge to `main`. The workflow copies `index.html`, `404.html` and `assets/` into `_site` and publishes
   only that, so nothing else in the repo goes public.

If you add a new top-level file or folder the site needs, add it to the `cp` line in the workflow.

The site URL (`https://vaibhavsharma-iima.github.io/Personal-Website/`) is written into the canonical and
Open Graph tags in `index.html` and the home link in `404.html`. Update those if the site moves.

## Editing content

Text that is plain prose lives in `index.html`. Lists are arrays in `assets/js/main.js`:

- Career log entries: `CAREER`.
- Journey chart events: `EVENTS` (`t` = fractional year, `v` = index level). The chart always runs to today.
- Honours tables: `H`. The first field is the act (`campus` or `fin`) and decides which table a row lands in.
- Hackathons and competitions: `items`.
- Tools: `stack`.
- Colours: CSS custom properties in `:root`, `:root[data-mode="campus"]`, `:root[data-mode="fin"]` and the
  `:root[data-theme="light"]` variants in `assets/css/style.css`. Canvas colours that follow the theme are in
  `INK` at the top of `main.js`.

If the hero changes noticeably, retake `assets/og.png` (a 1200×630 screenshot of the top of the page).

## Conventions for anyone changing the code

- **Escape everything that goes into `innerHTML`.** Use the shared `esc()` helper, as the existing templates do.
- **No inline `<script>` and no external hosts.** The Content-Security-Policy in `index.html` blocks both. A new
  script goes in `assets/js/`; a new font or image goes in `assets/`.
- **Canvas loops go through `animate(el, frame)`**, which pauses them while the canvas is off screen.
- **One flight model.** `flight(f)` at the top of `main.js` drives the backdrop table, the mission replay, the
  ground-station view, the readout and the first pivot.
- **Section numbers are written in `index.html`.** Renumber them by hand when a section is added or removed.
- **Actions are pinned to commit SHAs** in the workflow, with the tag in a comment.

## Known limits

- With JavaScript off, the prose, stats and contact details show, but the script-built lists and charts are
  empty (a `<noscript>` note says so).
- The two email addresses are plain `mailto:` links by choice, so that they work everywhere.

Design adapted from [likithsrinath2000.github.io](https://github.com/likithsrinath2000/likithsrinath2000.github.io).

# vaibhav.o11y → vaibhav.capital — personal site

A single-page, dependency-free personal site for **Vaibhav Sharma**: ex-Software Engineer
(Observability · Logs & Events) at LinkedIn, Investment Banking Summer Intern at Deutsche Bank,
Investment Partner at Campus Fund, and PGP candidate at IIM Ahmedabad.

Pure static HTML/CSS/JS: no build step, no framework, no dependencies.

## The idea

The page starts as an **observability console** and turns into a **trading terminal** partway down.

- **Engineering half**: live log-stream backdrop, event-pipeline canvas, a KQL-style career log
  explorer with filters, impact stats, focus cards, stack, and builds/hackathons.
- **The pivot**: a sticky scroll section in which a log-volume histogram morphs bar by bar into a
  candlestick chart. The site's colour tokens tween from cyan to amber, the background log stream
  crossfades into a market ticker tape, and the brand flips from `.o11y` to `.capital`.
- **Finance half**: a Bloomberg-style command bar, deal tombstones, a `VBHV` price chart of the
  journey with clickable event markers, an honors "holdings" table, and a term-sheet contact block.

Light and dark themes are supported, and `prefers-reduced-motion` turns the animations off while
keeping all the content.

## Structure

```
index.html
assets/css/style.css
assets/js/main.js
.github/workflows/deploy.yml   # GitHub Pages CI
.nojekyll                      # serve files as-is
```

## Run locally

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Deploy (GitHub Pages)

1. Merge to `main`.
2. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. The workflow deploys on every push to `main`.

## Editing content

- Career log entries: the `CAREER` array in `assets/js/main.js`.
- Journey chart events: the `EVENTS` array in `assets/js/main.js` (`t` = fractional year, `v` = index level).
- Honors table: the `H` array in `assets/js/main.js`.
- Builds and hackathons: the `items` array in `assets/js/main.js`.
- Colours: CSS custom properties in `:root` and `:root[data-mode="fin"]` in `assets/css/style.css`.

Design adapted from [likithsrinath2000.github.io](https://github.com/likithsrinath2000/likithsrinath2000.github.io).

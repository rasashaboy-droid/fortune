# Fortune House — website draft

Static site: plain HTML, CSS and JavaScript, no build step.

## Run locally
- Windows: double-click `start-server.bat` — it starts a server on http://localhost:8080 and opens the site.
- Any OS: `python -m http.server 8080` in this folder, then open http://localhost:8080
- Or just open `index.html` in a browser (everything works without a server too).

Photos are loaded from Unsplash, so an internet connection is needed to see them.

## Pages
- `index.html` — home: hero + search bar + "Choose apartment" popup, carousel, why us, CTA, investors, footer
- `search.html` — results by city / dates / guests (`search.html?city=phuket&in=2026-11-10&out=2026-11-15&adults=2`)
- `apartment.html?id=…` — apartment page: gallery, details, booking card
- `investors.html` — investors page with income calculator and FAQ
- `privacy.html` — privacy policy (draft)

## Where to edit
- Apartments, cities, photos: `assets/js/data.js` — the top of the file explains every field.
  Entries are validated on load; mistakes (unknown city, duplicate id, missing price…) are
  reported in the browser console (F12) and never break the page.
- Connecting a backend: set `FH_CONFIG.api.apartments` (GET, JSON list) and
  `FH_CONFIG.api.requests` (POST, JSON) in `data.js`. Until then booking and contact
  requests are kept in the browser under localStorage key `fh-requests` for testing.
- Hero photo framing: `--hero-pos` on `.hero` in `style.css`.
- Styles (colors, radii, spacing at the top in `:root`): `assets/css/style.css`
- Interactions: `assets/js/main.js`
- All copy, prices and figures are drafts — placeholders are in [square brackets].

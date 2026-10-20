# Fortune House — website

Static site: plain HTML, CSS and JavaScript, no build step.

## Run locally
- Windows: double-click `start-server.bat` — it starts a server on http://localhost:8080 and opens the site.
- Any OS: `python -m http.server 8080` in this folder, then open http://localhost:8080
- Or just open `index.html` in a browser (everything works without a server too).

Photos are loaded from Unsplash, so an internet connection is needed to see them.

## Pages
- `index.html` — home: hero + search bar + "Choose apartment" popup, carousel, why us, CTA, investors, footer
- `search.html` — results with filters: city / dates / guests, budget (Budget · Mid-range · Luxury),
  property type, sorting and "Show more" (`search.html?city=phuket&tier=luxury&type=Villa&in=2026-11-10&out=2026-11-15&adults=2`)
- `search.html?saved=1` — apartments saved with the heart (kept on the visitor's device)
- `apartment.html?id=…` — apartment page: gallery, details, booking card.
  Booking flow: dates → Done → guests → Done → "Request to book" → email → request sent.
- `investors.html` — investors page with income calculator and FAQ
- `privacy.html` — privacy policy

## Catalogue
100 apartments in 10 cities (Bangkok 18, Phuket 16, Pattaya 14, Chiang Mai 10, Koh Samui 9,
Krabi 8, Hua Hin 7, Koh Phangan 7, Hat Yai 6, Chiang Rai 5), split 20 % budget / 50 % mid-range /
30 % luxury. Listings are modelled on what is offered on the big booking sites in each city
(real districts and condo projects, typical sizes and nightly prices).

## Where to edit
- Apartments, cities, amenities, highlight chips, photos: `assets/js/data.js` — the top of the file
  explains every field. Entries are validated on load; mistakes (unknown city, duplicate id,
  missing price…) are reported in the browser console (F12) and never break the page.
- Highlight chips (coloured labels on cards, e.g. "Private pool" in blue): `HIGHLIGHTS` in `data.js`.
- Connecting a backend: set `FH_CONFIG.api.apartments` (GET, JSON list) and
  `FH_CONFIG.api.requests` (POST, JSON) in `data.js`. Until then booking and contact
  requests are kept in the browser under localStorage key `fh-requests` for testing.
- Hero photo framing: `--hero-pos` on `.hero` in `style.css`.
- Styles (colors, radii, spacing at the top in `:root`): `assets/css/style.css`
- Interactions: `assets/js/main.js`
- Phone, email and office address in the footer are placeholders in [square brackets].

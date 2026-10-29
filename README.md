# Fortune House — website

Static site: plain HTML, CSS and JavaScript, no build step.

## Run locally
- Windows: double-click `start-server.bat` — it starts a server on http://localhost:8080 and opens the site.
- Any OS: `python -m http.server 8080` in this folder, then open http://localhost:8080
- Or just open `index.html` in a browser (everything works without a server too).

Apartment photos load from Airbnb and Unsplash, so an internet connection is needed to see them. The home hero photos are local, in `assets/img/`.

## Pages
- `index.html` — home: hero + search bar + "Choose apartment" popup, carousel, why us, CTA, investors, footer
- `search.html` — results with filters like on the big booking sites: city / dates / guests, price range
  (histogram + slider + min/max), property type, bedrooms & bathrooms, amenities, booking options,
  guest favourites and rating, plus sorting and "Show more"
  (`search.html?city=phuket&price=1500-6000&types=Villa,Condo&beds=2&f=pool,seaview`).
  "Recommended" order puts great-value budget and mid-range stays first, with 2–3 luxury stays in the first 15.
- `search.html?saved=1` — apartments saved with the heart (kept on the visitor's device)
- `apartment.html?id=…` — apartment page: gallery, details, booking card.
  Booking flow: dates → Done → guests → Done → "Request to book" → email → request sent.
- `investors.html` — investors page with income calculator and FAQ
- `privacy.html` — privacy policy

## Catalogue
118 real Airbnb listings in 10 cities (Bangkok 24, Phuket 22, Pattaya 20, Chiang Mai 10, Koh Samui 9,
Krabi 8, Hua Hin 7, Koh Phangan 7, Hat Yai 6, Chiang Rai 5): 26 budget / 59 mid-range / 33 luxury.
Photos, bedrooms, baths, guests, rating, reviews and amenities come from the same listing (link in the
`source` field of each entry). Nightly prices are market estimates, because Airbnb only shows prices
after dates are picked. Raw data and the generator: `_work/real/*.json`, `_work/build_real.py`.

## Where to edit
- Apartments, cities, amenities, highlight chips, photos: `assets/js/data.js` — the top of the file
  explains every field. Entries are validated on load; mistakes (unknown city, duplicate id,
  missing price…) are reported in the browser console (F12) and never break the page.
- Highlight chips (coloured labels on cards, e.g. "Private pool" in blue): `HIGHLIGHTS` in `data.js`.
- Connecting a backend: set `FH_CONFIG.api.apartments` (GET, JSON list) and
  `FH_CONFIG.api.requests` (POST, JSON) in `data.js`. Until then booking and contact
  requests are kept in the browser under localStorage key `fh-requests` for testing.
- Home hero photos: `hero` (wide screens) and `heroMobile` (phones and portrait tablets) in `PHOTOS` in `data.js`,
  now `assets/img/hero-villa.jpg` (made from the original `hero.jpg`) and `assets/img/hero-mobile.jpg`
  (from „Минималистичная вилла у лазурного бассейна.png“). The earlier phone crop `hero-villa-m.jpg` is kept. Framing: `--hero-pos` / `--hero-pos-m` on `.hero` in `style.css`.
  On phones the hero shows the headline, two buttons and the photo; "Find an apartment" opens the full search sheet.
- Styles (colors, radii, spacing at the top in `:root`): `assets/css/style.css`
- Interactions: `assets/js/main.js`
- Phone, email and office address in the footer are placeholders in [square brackets].

/* ==========================================================================
   Fortune House — content "database" (draft)

   HOW TO ADD AN APARTMENT
   Copy one object in APARTMENTS below and change the fields:

     id         unique slug, latin letters / digits / dashes  -> apartment.html?id=<id>
     title      display name
     city       one of the CITIES ids below ('phuket', 'bangkok', ...)
     area       district / beach name
     type       'Apartment' | 'Villa' | 'Condo' | 'Penthouse' | 'Loft' | 'House' (any text works,
                filters are built from the values you use)
     beds, baths, guests, size (m²)   numbers
     price      price per night in THB (number)
     rating     0–5, reviews  number of reviews
     featured   true -> shown in the home page carousel
     photos     list of photos. Each item can be:
                  - a key from PHOTOS below ('v1', 'i3', ...)
                  - an Unsplash photo id ('1613490493576-7fde63acd811')
                  - a full URL ('https://...jpg') or a local path ('assets/img/kata-1.jpg')
     amenities  keys from AMENITIES below
     text       description for the apartment page

   Entries are checked on load: problems are reported in the browser console
   (F12 → Console) and broken entries are skipped instead of breaking the site.

   CONNECTING A REAL BACKEND LATER
   Set FH_CONFIG.api.apartments to a URL that returns JSON in the same shape
   ({ apartments: [...] } or just [...]) and FH_CONFIG.api.requests to a URL that
   accepts POSTed booking / contact requests as JSON. Until then requests are kept
   in the browser (localStorage key "fh-requests") so the flow can be tested.
   ========================================================================== */

window.FH_CONFIG = {
  currency: 'THB',
  api: {
    apartments: null, // e.g. '/api/apartments'
    requests: null    // e.g. '/api/requests'
  },
  fees: {
    cleaningShare: 0.3, // cleaning fee = 30% of one night, rounded to 100
    serviceShare: 0.05  // service fee = 5% of the stay
  }
};

(function () {
  var PHOTOS = {
    // exteriors & pools
    hero: '1785512364392-a3ab5a83b254', // white arched villa, sea on the right. Alternatives: '1771388907963-bc5af7128396', '1613977257363-707ba9348227'
    v1: '1613490493576-7fde63acd811', v2: '1600596542815-ffad4c1539a9', v3: '1580587771525-78b9dba3b914',
    v4: '1602343168117-bb8ffe3e2e9f', v5: '1582610191340-fa501e6e5040', v6: '1706808849780-7a04fbac83ef',
    v7: '1670589953882-b94c9cb380f5', v8: '1721989519334-40923a0ee1c0', v9: '1759372945658-1e9f56e751bd',
    v10: '1766937754720-4d30de201fd1', v11: '1745761320791-5ae142edee8c', v12: '1719887805632-de5be825f72b',
    v13: '1543489822-c49534f3271f', v14: '1520250497591-112f2f40a3f4', v15: '1628012209120-d9db7abf7eab',
    v16: '1722421492323-eaf9c401befe', v17: '1692736933732-ad902fc34626', v18: '1613977257592-4871e5fcd7c4',
    v19: '1582268611958-ebfd161ef9cf', v20: '1512917774080-9991f1c4c750',
    // interiors
    i1: '1680416124510-5eae1beca412', i2: '1757924461488-ef9ad0670978', i3: '1628592102751-ba83b0314276',
    i4: '1758448755952-42b404bc6f39', i5: '1713832139688-79676097edde', i6: '1697947656193-a87d460b5fb5',
    i7: '1512914890251-2f96a9b0bbe2', i8: '1715985160053-d339e8b6eb94',
    // bedrooms
    b1: '1616594039964-ae9021a400a0', b2: '1505693416388-ac5ce068fe85', b3: '1512918728675-ed5a9ecdebfd',
    b4: '1731336478850-6bce7235e320', b5: '1757344454333-cc666252e596', b6: '1617098900591-3f90928e8c54',
    // city
    c1: '1610276040024-71a41b03e850', c2: '1582541314837-32dafa464fc6', c3: '1706351252368-940bdefab6da',
    c4: '1708875520726-69237871bf9f', c5: '1595262493050-5b0f29ccf4b1', c6: '1629307015909-5fa16cb14a70'
  };

  var CITIES = [
    { id: 'phuket', name: 'Phuket', note: 'Beaches & pool villas' },
    { id: 'bangkok', name: 'Bangkok', note: 'City apartments & penthouses' },
    { id: 'koh-samui', name: 'Koh Samui', note: 'Island hideaways' },
    { id: 'pattaya', name: 'Pattaya', note: 'Sea-view residences' },
    { id: 'chiang-mai', name: 'Chiang Mai', note: 'Calm in the mountains' },
    { id: 'hua-hin', name: 'Hua Hin', note: 'Quiet beach town' }
  ];

  var AMENITIES = {
    pool: 'Private pool', wifi: 'Fast Wi-Fi', ac: 'Air conditioning', kitchen: 'Full kitchen',
    workspace: 'Dedicated workspace', parking: 'Free parking', gym: 'Gym access', seaview: 'Sea view',
    washer: 'Washing machine', concierge: '24/7 concierge', cleaning: 'Weekly cleaning', balcony: 'Balcony or terrace',
    cityview: 'City view', garden: 'Tropical garden'
  };

  var APARTMENTS = [
    { id: 'kata-cliff-villa', title: 'Kata Cliff Villa', city: 'phuket', area: 'Kata Beach', type: 'Villa',
      beds: 3, baths: 3, guests: 6, size: 240, price: 14900, rating: 4.97, reviews: 64, featured: true,
      photos: ['v13', 'v1', 'i2', 'b1', 'i7', 'v6'],
      amenities: ['pool', 'seaview', 'wifi', 'ac', 'kitchen', 'concierge', 'cleaning', 'parking'],
      text: 'A three-bedroom villa on the cliffs above Kata Beach with an infinity pool facing the Andaman Sea. Floor-to-ceiling glass, a chef’s kitchen and a shaded terrace for long evenings.' },
    { id: 'sukhumvit-sky-residence', title: 'Sukhumvit Sky Residence', city: 'bangkok', area: 'Sukhumvit 24', type: 'Apartment',
      beds: 2, baths: 2, guests: 4, size: 96, price: 5200, rating: 4.92, reviews: 118, featured: true,
      photos: ['c1', 'i1', 'b2', 'i3', 'c4', 'i7'],
      amenities: ['cityview', 'wifi', 'ac', 'kitchen', 'workspace', 'gym', 'pool', 'concierge'],
      text: 'A bright two-bedroom apartment on the 38th floor, five minutes from BTS Phrom Phong. Skyline views, a quiet workspace and a rooftop pool in the building.' },
    { id: 'palm-house-samui', title: 'Palm House Samui', city: 'koh-samui', area: 'Bophut', type: 'Villa',
      beds: 4, baths: 4, guests: 8, size: 320, price: 18500, rating: 4.95, reviews: 41, featured: true,
      photos: ['v11', 'v8', 'i5', 'b4', 'v17', 'i4'],
      amenities: ['pool', 'garden', 'wifi', 'ac', 'kitchen', 'concierge', 'cleaning', 'parking'],
      text: 'A four-bedroom family villa among coconut palms, a short walk from Fisherman’s Village. Private pool, open-air living room and a garden made for slow mornings.' },
    { id: 'riverside-loft', title: 'Riverside Loft', city: 'bangkok', area: 'Charoen Krung', type: 'Loft',
      beds: 1, baths: 1, guests: 2, size: 68, price: 3400, rating: 4.88, reviews: 203, featured: true,
      photos: ['c3', 'i6', 'b3', 'i8', 'c2'],
      amenities: ['cityview', 'wifi', 'ac', 'kitchen', 'workspace', 'washer', 'gym'],
      text: 'A high-ceiling loft by the Chao Phraya river, surrounded by galleries, cafés and the city’s best street food. Ideal for one or two guests staying a week or a month.' },
    { id: 'pratumnak-sea-view', title: 'Pratumnak Sea View', city: 'pattaya', area: 'Pratumnak Hill', type: 'Apartment',
      beds: 2, baths: 2, guests: 4, size: 110, price: 4600, rating: 4.86, reviews: 97, featured: true,
      photos: ['c5', 'i2', 'b5', 'i1', 'v14'],
      amenities: ['seaview', 'pool', 'wifi', 'ac', 'kitchen', 'balcony', 'gym', 'parking'],
      text: 'A calm two-bedroom residence on Pratumnak Hill with a wide balcony over the Gulf of Thailand. Resort-style pool, gym and quick access to Cosy Beach.' },
    { id: 'nimman-garden-suite', title: 'Nimman Garden Suite', city: 'chiang-mai', area: 'Nimmanhaemin', type: 'Apartment',
      beds: 1, baths: 1, guests: 2, size: 74, price: 2900, rating: 4.9, reviews: 156, featured: true,
      photos: ['v10', 'i3', 'b4', 'i7', 'v8'],
      amenities: ['garden', 'wifi', 'ac', 'kitchen', 'workspace', 'washer', 'balcony'],
      text: 'A quiet garden suite in Nimman, Chiang Mai’s design district. Mountain air, a proper desk for remote work and the best coffee in the city on your doorstep.' },
    { id: 'layan-pool-villa', title: 'Layan Pool Villa', city: 'phuket', area: 'Layan', type: 'Villa',
      beds: 3, baths: 3, guests: 6, size: 260, price: 12800, rating: 4.93, reviews: 52, featured: true,
      photos: ['v6', 'v2', 'i4', 'b6', 'v17', 'i5'],
      amenities: ['pool', 'garden', 'wifi', 'ac', 'kitchen', 'concierge', 'cleaning', 'parking'],
      text: 'A modern pool villa near Layan Beach, minutes from Bang Tao’s restaurants and beach clubs. Sun deck, outdoor dining and a living room that opens fully to the garden.' },
    { id: 'hua-hin-beach-house', title: 'Hua Hin Beach House', city: 'hua-hin', area: 'Khao Takiab', type: 'House',
      beds: 3, baths: 2, guests: 6, size: 190, price: 7600, rating: 4.84, reviews: 73, featured: true,
      photos: ['v4', 'v5', 'i5', 'b2', 'i8'],
      amenities: ['pool', 'seaview', 'wifi', 'ac', 'kitchen', 'parking', 'washer', 'garden'],
      text: 'A relaxed beach house a few steps from the sand at Khao Takiab. Shared pool, a big family kitchen and sunset walks along the quietest part of Hua Hin.' },
    { id: 'thonglor-penthouse', title: 'Thonglor Penthouse', city: 'bangkok', area: 'Thonglor', type: 'Penthouse',
      beds: 3, baths: 3, guests: 6, size: 210, price: 16900, rating: 4.96, reviews: 38,
      photos: ['c2', 'i4', 'b1', 'i1', 'c6', 'b6'],
      amenities: ['cityview', 'pool', 'wifi', 'ac', 'kitchen', 'workspace', 'gym', 'concierge'],
      text: 'A full-floor penthouse in Thonglor with a private terrace and panoramic city views. Designer interiors, a dining table for eight and a concierge on call.' },
    { id: 'chaweng-hill-residence', title: 'Chaweng Hill Residence', city: 'koh-samui', area: 'Chaweng Noi', type: 'Apartment',
      beds: 2, baths: 2, guests: 4, size: 120, price: 6200, rating: 4.89, reviews: 88,
      photos: ['v7', 'i6', 'b5', 'v13', 'i2'],
      amenities: ['seaview', 'pool', 'wifi', 'ac', 'kitchen', 'balcony', 'cleaning'],
      text: 'A hillside residence above Chaweng Noi bay with a shared infinity pool and a terrace for sunrise coffee. Quiet, yet five minutes to the beach.' },
    { id: 'surin-beach-condo', title: 'Surin Beach Condo', city: 'phuket', area: 'Surin', type: 'Condo',
      beds: 1, baths: 1, guests: 3, size: 72, price: 3900, rating: 4.87, reviews: 141,
      photos: ['v15', 'i1', 'b3', 'v14'],
      amenities: ['pool', 'wifi', 'ac', 'kitchen', 'balcony', 'gym', 'parking'],
      text: 'A smart one-bedroom condo, a short walk to Surin Beach. Lagoon pool, gym and everything you need for a comfortable longer stay.' },
    { id: 'jomtien-modern-villa', title: 'Jomtien Modern Villa', city: 'pattaya', area: 'Jomtien', type: 'Villa',
      beds: 4, baths: 3, guests: 8, size: 280, price: 11400, rating: 4.91, reviews: 46,
      photos: ['v3', 'v9', 'i3', 'b2', 'i7'],
      amenities: ['pool', 'garden', 'wifi', 'ac', 'kitchen', 'parking', 'washer', 'cleaning'],
      text: 'A spacious modern villa in a gated Jomtien community. Private pool, BBQ terrace and four en-suite bedrooms — made for families and friends travelling together.' }
  ];

  /* Builds an image URL for any photo reference (key, Unsplash id, URL or local path). */
  function photoUrl(ref, width) {
    if (!ref) return '';
    var id = PHOTOS[ref] || ref;
    if (/^(https?:)?\/\//.test(id) || id.indexOf('/') > -1 || /\.(jpe?g|png|webp|avif)$/i.test(id)) return id;
    return 'https://images.unsplash.com/photo-' + id + '?auto=format&fit=crop&w=' + (width || 1200) + '&q=80';
  }

  window.FH_DATA = { photos: PHOTOS, photoUrl: photoUrl, cities: CITIES, amenities: AMENITIES, apartments: APARTMENTS };
})();

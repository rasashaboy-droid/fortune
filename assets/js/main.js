/* ==========================================================================
   Fortune House — interactions
   Structure:
     1. Icons & helpers
     2. Repo   — the only place that reads apartments (local data or API)
     3. Api    — sends booking / contact requests (API or local queue)
     4. Stores — search state (shared, saved per session) and booking state
     5. UI     — calendar, guests, popovers, modals, cards, carousel, lightbox
     6. Pages  — home, search, apartment, investors
   ========================================================================== */
(function () {
  'use strict';

  var D = window.FH_DATA || { photos: {}, photoUrl: function () { return ''; }, cities: [], amenities: {}, apartments: [] };
  var CFG = window.FH_CONFIG || { api: {}, fees: {} };
  CFG.api = CFG.api || {};
  CFG.fees = CFG.fees || {};
  var doc = document;
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };
  var mqMobile = window.matchMedia('(max-width: 719px)');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  doc.documentElement.classList.remove('no-js');

  /* ================================================================== */
  /* 1. Icons & helpers                                                  */
  /* ================================================================== */

  var ICONS = {
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowLeft: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
    arrowUp: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    chevronDown: '<path d="m6.5 9.5 5.5 5.5 5.5-5.5"/>',
    chevronLeft: '<path d="M14.5 6.5 9 12l5.5 5.5"/>',
    chevronRight: '<path d="M9.5 6.5 15 12l-5.5 5.5"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
    pin: '<path d="M12 20.5s-6.5-5.6-6.5-10.8a6.5 6.5 0 0 1 13 0c0 5.2-6.5 10.8-6.5 10.8Z"/><circle cx="12" cy="9.7" r="2.3"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="3.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    users: '<circle cx="9" cy="8.5" r="3.3"/><path d="M3 19.5c.7-3.2 3.1-5 6-5s5.3 1.8 6 5"/><path d="M15.5 5.4a3.2 3.2 0 0 1 0 6.2M17.5 14.7c1.7.6 2.9 2.2 3.4 4.8"/>',
    user: '<circle cx="12" cy="8.3" r="3.6"/><path d="M5 20c.9-3.6 3.6-5.6 7-5.6s6.1 2 7 5.6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    close: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    heart: '<path d="M12 19.8s-7.5-4.5-7.5-10.1A4.2 4.2 0 0 1 12 7.1a4.2 4.2 0 0 1 7.5 2.6c0 5.6-7.5 10.1-7.5 10.1Z"/>',
    star: '<path d="m12 3.8 2.45 5.02 5.5.8-3.98 3.88.94 5.48L12 16.4l-4.91 2.58.94-5.48-3.98-3.88 5.5-.8Z" fill="currentColor" stroke="none"/>',
    bed: '<path d="M3.5 18.5V6.5M3.5 15h17v3.5M20.5 15v-2.5a3 3 0 0 0-3-3H11V15"/><circle cx="7.2" cy="12" r="1.8"/>',
    bath: '<path d="M4 12h16v2.5a4.5 4.5 0 0 1-4.5 4.5h-7A4.5 4.5 0 0 1 4 14.5Z"/><path d="M6.5 12V6.3a2.3 2.3 0 0 1 4.2-1.3M7.5 19l-1 1.8M16.5 19l1 1.8"/>',
    area: '<path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15"/>',
    home: '<path d="M4 10.3 12 4l8 6.3v8.2a1.5 1.5 0 0 1-1.5 1.5H15v-5.5H9V20H5.5A1.5 1.5 0 0 1 4 18.5Z"/>',
    shield: '<path d="M12 3.5 19 6v5.6c0 4.3-2.9 7.7-7 8.9-4.1-1.2-7-4.6-7-8.9V6Z"/><path d="m9 12 2.1 2.1L15.2 10"/>',
    receipt: '<path d="M6.5 3.5h11v17l-2.75-1.6L12 20.5l-2.75-1.6L6.5 20.5Z"/><path d="M9.5 8h5M9.5 11.5h5M9.5 15h2.5"/>',
    headset: '<path d="M4.5 14v-2a7.5 7.5 0 0 1 15 0v2"/><rect x="3.5" y="13" width="4" height="6" rx="2"/><rect x="16.5" y="13" width="4" height="6" rx="2"/><path d="M18.5 19c0 1.2-1.4 2-3.5 2h-2"/>',
    calendarCheck: '<rect x="3.5" y="5" width="17" height="15.5" rx="3.5"/><path d="M3.5 10h17M8 3v4M16 3v4M9.3 15l1.9 1.9 3.6-3.6"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="m10.9 12.1 8.6-8.6M15.5 7.5l2.5 2.5M13.5 9.5l2 2"/>',
    map: '<path d="M9 4.5 3.5 6.5v13l5.5-2 6 2 5.5-2v-13l-5.5 2Z"/><path d="M9 4.5v13M15 6.5v13"/>',
    wifi: '<path d="M2.8 9.2a13.5 13.5 0 0 1 18.4 0M5.8 12.6a9 9 0 0 1 12.4 0M8.9 15.9a4.6 4.6 0 0 1 6.2 0"/><circle cx="12" cy="19" r=".9" fill="currentColor"/>',
    pool: '<path d="M8 14.5V6.8a2.3 2.3 0 0 1 4.6 0M15.5 14.5V6.8a2.3 2.3 0 0 0-2.9-2.2M8 9.5h7.5M8 12.5h7.5"/><path d="M3 18.5c1.5 0 1.5 1 3 1s1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1"/>',
    ac: '<path d="M12 3.5v17M4.6 7.75l14.8 8.5M4.6 16.25l14.8-8.5M9.6 4.8 12 7.2l2.4-2.4M9.6 19.2 12 16.8l2.4 2.4"/>',
    kitchen: '<path d="M6 3.5V10a2 2 0 0 0 2 2m2-8.5V10a2 2 0 0 1-2 2m0 0v8.5M8 3.5V8M17 20.5V3.5c-2 .9-3 3.3-3 6.3V13h3"/>',
    workspace: '<rect x="5" y="5" width="14" height="10" rx="2"/><path d="M3 19h18"/>',
    parking: '<rect x="4" y="4" width="16" height="16" rx="4.5"/><path d="M10 16.5v-9h3a2.6 2.6 0 0 1 0 5.2h-3"/>',
    gym: '<path d="M6.5 7.5v9M17.5 7.5v9M4 10v4M20 10v4M6.5 12h11"/>',
    seaview: '<path d="M3 18c1.5 0 1.5 1 3 1s1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1M7 14a5 5 0 0 1 10 0M12 4.5v2M5.8 7.3l1.4 1.4M18.2 7.3l-1.4 1.4"/>',
    washer: '<rect x="4.5" y="3" width="15" height="18" rx="3"/><circle cx="12" cy="13" r="4"/><path d="M8 6.5h1.5"/>',
    concierge: '<path d="M4 17.5h16M5.5 17.5a6.5 6.5 0 0 1 13 0M12 11V9M10.5 9h3M3.5 20.5h17"/>',
    cleaning: '<path d="m11 4 1.5 4L16.5 9.5l-4 1.5L11 15l-1.5-4-4-1.5 4-1.5Z"/><path d="m17.5 14 .8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8Z"/>',
    balcony: '<path d="M4 12.5h16M4 20h16M6.5 12.5V20M10 12.5V20M14 12.5V20M17.5 12.5V20M7 12.5V5.8A1.8 1.8 0 0 1 8.8 4h6.4A1.8 1.8 0 0 1 17 5.8v6.7"/>',
    cityview: '<path d="M3 20.5h18M5 20.5V9.5l5-2.5v13.5M10 20.5V4h6v16.5M16 20.5v-10l3.5 1.5v8.5M12.5 8h1M12.5 11.5h1M12.5 15h1"/>',
    garden: '<path d="M5.5 18.5C5.5 10 10 5.5 18.5 5.5c0 8.5-4.5 13-13 13Z"/><path d="m5.5 18.5 7.5-7.5"/>',
    share: '<path d="M12 3.5v11M8 7.5l4-4 4 4M5.5 12v6.5A1.5 1.5 0 0 0 7 20h10a1.5 1.5 0 0 0 1.5-1.5V12"/>',
    grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.8"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.8"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.8"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.8"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    ban: '<circle cx="12" cy="12" r="8.5"/><path d="m6 6 12 12"/>',
    instagram: '<rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.7"/><circle cx="16.9" cy="7.1" r=".9" fill="currentColor" stroke="none"/>',
    telegram: '<path d="M20.5 4.5 3.8 11.1l5.8 2.1 2.1 5.9 3.1-3.6 4.4 3.1Z"/><path d="m9.6 13.2 10.9-8.7"/>',
    whatsapp: '<path d="M4.5 19.5 5.6 16A8 8 0 1 1 8.3 18.4Z"/><path d="M9 9.2c.3 2.6 2.4 4.9 5.6 5.6l.9-1.5-1.9-.9-.8.8c-.9-.4-1.8-1.3-2.2-2.2l.8-.8-.9-1.9Z"/>',
    trend: '<path d="m3.5 17 5.5-5.5 4 4 7.5-7.5M15 8h5.5v5.5"/>',
    wallet: '<rect x="3.5" y="6" width="17" height="13.5" rx="3.5"/><path d="M3.5 10h17M15.5 14.8h1.5"/>',
    chart: '<path d="M4.5 20.5V11M10 20.5V4.5M15.5 20.5v-7M21 20.5H3"/>',
    sparkle: '<path d="m12 3.5 1.9 5.3 5.3 1.9-5.3 1.9L12 18l-1.9-5.4-5.3-1.9 5.3-1.9Z"/>',
    logo: '<path d="M5.5 19.5v-8.2L12 5l6.5 6.3v8.2"/><path d="M10 19.5V15h4v4.5"/>',
    mountain: '<path d="M2.5 19.5 9 8.5l3.6 6 2.4-3.5 6.5 8.5Z"/><path d="m6.9 12 2.1 1.6 1.9-1.5"/>',
    umbrella: '<path d="M12 4.5a8.5 8.5 0 0 1 8.5 8h-17A8.5 8.5 0 0 1 12 4.5Z"/><path d="M12 12.5v6a2 2 0 0 1-4 0M12 3v1.5"/>',
    waves: '<path d="M3 8.5c1.5 0 1.5 1 3 1s1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1M3 13.5c1.5 0 1.5 1 3 1s1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1M3 18.5c1.5 0 1.5 1 3 1s1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1"/>',
    window: '<rect x="2.5" y="6" width="19" height="12" rx="2.5"/><path d="M8.8 6v12M15.2 6v12"/>',
    bubbles: '<circle cx="8.5" cy="15" r="4.5"/><circle cx="16.5" cy="8.5" r="3"/><circle cx="17" cy="16.5" r="1.7"/><circle cx="9.5" cy="5.8" r="1.5"/>',
    paw: '<circle cx="6.6" cy="10.4" r="1.7"/><circle cx="10" cy="6.4" r="1.7"/><circle cx="14" cy="6.4" r="1.7"/><circle cx="17.4" cy="10.4" r="1.7"/><path d="M12 11.6c-2.6 0-5 3.4-5 5.6 0 1.6 1.3 2.3 2.6 2.3.9 0 1.6-.5 2.4-.5s1.5.5 2.4.5c1.3 0 2.6-.7 2.6-2.3 0-2.2-2.4-5.6-5-5.6Z"/>',
    tv: '<rect x="3" y="4.5" width="18" height="12.5" rx="2.5"/><path d="M8.5 20.5h7M12 17v3.5"/>',
    flame: '<path d="M12 21c-3.6 0-6-2.4-6-5.7 0-3.9 3.4-5.6 4-9.8 2.6 1.5 4.3 4.3 4.3 6.6.9-.5 1.5-1.4 1.7-2.4 1.3 1.4 2 3.4 2 5.3C18 18.6 15.6 21 12 21Z"/>',
    award: '<circle cx="12" cy="9" r="5.5"/><path d="m8.7 13.3-1.4 7.2L12 18.2l4.7 2.3-1.4-7.2"/>',
    building: '<path d="M5 20.5v-15A1.5 1.5 0 0 1 6.5 4h7A1.5 1.5 0 0 1 15 5.5v15M15 10h3.5a1.5 1.5 0 0 1 1.5 1.5v9M3.5 20.5h17M8.5 8h3M8.5 11.5h3M8.5 15h3"/>',
    near: '<path d="M19.5 4.5 13.4 20l-2.5-6.9L4 10.6Z"/>',
    mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="3"/><path d="m4.5 7.5 7.5 5.8 7.5-5.8"/>',
    tag: '<path d="M3.5 12.4V5A1.5 1.5 0 0 1 5 3.5h7.4a1.5 1.5 0 0 1 1 .4l6.7 6.7a1.5 1.5 0 0 1 0 2.1l-7.4 7.4a1.5 1.5 0 0 1-2.1 0L3.9 13.4a1.5 1.5 0 0 1-.4-1Z"/><circle cx="8.3" cy="8.3" r="1.4"/>',
    sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2.2"/><circle cx="9" cy="17" r="2.2"/>'
  };
  /* amenity / highlight keys that reuse a drawing */
  var ICON_ALIAS = {
    privatepool: 'pool', jacuzzi: 'bubbles', riverview: 'waves', lakeview: 'waves', mountainview: 'mountain',
    beach: 'umbrella', beachfront: 'umbrella', bbq: 'flame', security: 'shield', bathtub: 'bath',
    selfcheckin: 'key', pets: 'paw', petfriendly: 'paw', panoramic: 'window', skyline: 'cityview'
  };

  function icon(name, size, sw) {
    size = size || 20;
    var path = ICONS[name] || ICONS[ICON_ALIAS[name]] || ICONS.check;
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (sw || 1.6) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + '</svg>';
  }
  /* "arrow-pair" kept as a name for markup compatibility: one arrow, animated by CSS */
  function btnArrow(size) { return icon('arrowRight', size || 18); }

  function hydrateIcons(root) {
    $$('i[data-icon]', root).forEach(function (el) {
      var name = el.getAttribute('data-icon');
      var size = +el.getAttribute('data-size') || (name === 'arrow-pair' ? 18 : 20);
      var html = name === 'arrow-pair' ? btnArrow(size) : icon(name, size, el.getAttribute('data-sw'));
      el.insertAdjacentHTML('beforebegin', html);
      el.remove();
    });
  }

  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var MON = MONTHS.map(function (m) { return m.slice(0, 3); });

  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function toISO(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function fromISO(s) {
    if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
    var p = s.split('-');
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    if (isNaN(d) || d.getMonth() !== +p[1] - 1) return null; // rejects 2026-02-31
    return d;
  }
  function today() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function nightsBetween(a, b) {
    var A = fromISO(a), B = fromISO(b);
    if (!A || !B) return 0;
    return Math.max(0, Math.round((B - A) / 864e5));
  }
  function fmtDay(iso) { var d = fromISO(iso); return d ? d.getDate() + ' ' + MON[d.getMonth()] : ''; }
  function fmtRange(a, b) {
    var A = fromISO(a), B = fromISO(b);
    if (!A) return '';
    if (!B) return fmtDay(a) + ' – …';
    if (A.getMonth() === B.getMonth() && A.getFullYear() === B.getFullYear()) return A.getDate() + ' – ' + B.getDate() + ' ' + MON[B.getMonth()];
    return fmtDay(a) + ' – ' + fmtDay(b);
  }
  function money(n) { return '฿' + Math.round(n).toLocaleString('en-US'); }
  function usd(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function lsGet(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  function ssGet(k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch (e) { return null; } }
  function ssSet(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  function params() { var o = {}; new URLSearchParams(location.search).forEach(function (v, k) { o[k] = v; }); return o; }
  function clampInt(v, min, max, def) { v = parseInt(v, 10); if (isNaN(v)) v = def; return Math.min(max, Math.max(min, v)); }
  function smooth() { return reduceMotion ? 'auto' : 'smooth'; }

  /* ================================================================== */
  /* 2. Repo — apartments "database"                                     */
  /* ================================================================== */

  var Repo = (function () {
    var list = [], byId = {}, cityById = {}, ready = null;
    var TIERS = { budget: 'Budget', mid: 'Mid-range', luxury: 'Luxury' }, TIER_KEYS = ['budget', 'mid', 'luxury'];
    var HL = D.highlights || {};
    D.cities.forEach(function (c) { cityById[c.id] = c; });

    function warn(msg) { if (window.console) console.warn('[Fortune House data] ' + msg); }
    function num(v, def) { v = Number(v); return isFinite(v) ? v : def; }

    function normalize(r, i) {
      if (!r || typeof r !== 'object') { warn('entry #' + (i + 1) + ' is not an object — skipped'); return null; }
      var id = String(r.id || '').trim();
      if (!/^[a-z0-9][a-z0-9-]*$/i.test(id)) { warn('entry #' + (i + 1) + ' has a missing or invalid "id" — skipped'); return null; }
      var a = {
        id: id,
        title: String(r.title || 'Untitled apartment'),
        city: String(r.city || ''),
        area: String(r.area || ''),
        type: String(r.type || 'Apartment'),
        beds: Math.max(0, Math.round(num(r.beds, 1))),
        baths: Math.max(0, Math.round(num(r.baths, 1) * 2) / 2),
        guests: Math.max(1, Math.round(num(r.guests, 2))),
        size: Math.max(0, Math.round(num(r.size, 0))),
        price: Math.max(0, num(r.price, 0)),
        rating: Math.min(5, Math.max(0, num(r.rating, 0))),
        reviews: Math.max(0, Math.round(num(r.reviews, 0))),
        featured: !!r.featured,
        building: String(r.building || ''),
        near: String(r.near || ''),
        tier: TIERS[r.tier] ? r.tier : '',
        highlights: [],
        photos: [],
        amenities: [],
        text: String(r.text || '')
      };
      if (!a.tier) {
        if (r.tier) warn('"' + id + '": unknown tier "' + r.tier + '" — use budget, mid or luxury');
        var tb = CFG.tiers || {};
        a.tier = a.price && a.price < (tb.budgetBelow || 1500) ? 'budget' : a.price >= (tb.luxuryFrom || 5500) ? 'luxury' : 'mid';
      }
      (Array.isArray(r.highlights) ? r.highlights : []).forEach(function (k) {
        if (HL[k]) { if (a.highlights.indexOf(k) < 0) a.highlights.push(k); } else warn('"' + id + '": unknown highlight "' + k + '"');
      });
      if (!cityById[a.city]) warn('"' + id + '": unknown city "' + a.city + '" — add it to CITIES');
      if (!r.title) warn('"' + id + '": missing title');
      if (!a.price) warn('"' + id + '": missing price — shown as "Price on request"');
      (Array.isArray(r.photos) ? r.photos : (Array.isArray(r.img) ? r.img : [])).forEach(function (p) {
        if (typeof p === 'string' && p.trim()) a.photos.push(p.trim());
      });
      if (!a.photos.length) warn('"' + id + '": no photos');
      (Array.isArray(r.amenities) ? r.amenities : []).forEach(function (k) {
        if (D.amenities[k]) a.amenities.push(k); else warn('"' + id + '": unknown amenity "' + k + '"');
      });
      return a;
    }

    function ingest(arr) {
      list = []; byId = {};
      (Array.isArray(arr) ? arr : []).forEach(function (r, i) {
        var a = normalize(r, i);
        if (!a) return;
        if (byId[a.id]) { warn('duplicate id "' + a.id + '" — second entry skipped'); return; }
        byId[a.id] = a; list.push(a);
      });
      return list;
    }

    function load() {
      if (ready) return ready;
      var url = CFG.api.apartments;
      var source = url && window.fetch
        ? fetch(url, { headers: { Accept: 'application/json' } })
          .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
          .then(function (j) { return Array.isArray(j) ? j : (j && j.apartments) || []; })
          .catch(function (e) { warn('could not load ' + url + ' (' + e.message + '), using local data'); return D.apartments; })
        : Promise.resolve(D.apartments);
      ready = source.then(ingest);
      return ready;
    }

    /* "Recommended": rating weighted by how many reviews back it, plus a nudge for featured stays */
    function score(a) {
      return a.rating * 20 + Math.log(a.reviews + 1) * 2.2 + (a.featured ? 4 : 0) + (a.highlights.length ? 1 : 0);
    }

    /* q: { city, guests, type, tier, ids, featured, sort, exclude } */
    function search(q) {
      q = q || {};
      var out = list.filter(function (a) {
        if (q.ids && q.ids.indexOf(a.id) < 0) return false;
        if (q.city && a.city !== q.city) return false;
        if (q.guests && a.guests < q.guests) return false;
        if (q.type && q.type !== 'All' && a.type !== q.type) return false;
        if (q.tier && q.tier !== 'all' && a.tier !== q.tier) return false;
        if (q.featured && !a.featured) return false;
        if (q.exclude && a.id === q.exclude) return false;
        return true;
      });
      var priceKey = function (a) { return a.price || Infinity; };
      if (q.sort === 'price-asc') out.sort(function (a, b) { return priceKey(a) - priceKey(b); });
      else if (q.sort === 'price-desc') out.sort(function (a, b) { return (b.price || 0) - (a.price || 0); });
      else if (q.sort === 'rating') out.sort(function (a, b) { return b.rating - a.rating || b.reviews - a.reviews; });
      else if (q.sort === 'recommended') out.sort(function (a, b) { return score(b) - score(a); });
      else if (q.sort === 'saved' && q.ids) out.sort(function (a, b) { return q.ids.indexOf(b.id) - q.ids.indexOf(a.id); });
      return out;
    }

    return {
      load: load,
      all: function () { return list.slice(); },
      get: function (id) { return byId[id] || null; },
      search: search,
      count: function (q) { return search(q).length; },
      /* property types, most common first */
      types: function () {
        var n = {};
        list.forEach(function (a) { n[a.type] = (n[a.type] || 0) + 1; });
        return Object.keys(n).sort(function (x, y) { return n[y] - n[x] || (x < y ? -1 : 1); });
      },
      tiers: function () { return TIER_KEYS.slice(); },
      tierName: function (k) { return TIERS[k] || ''; },
      highlight: function (k) { return HL[k] || null; },
      isGuestFav: function (a) { return a.rating >= 4.95 && a.reviews >= 40; },
      cities: function () { return D.cities.slice(); },
      isCity: function (id) { return !!cityById[id]; },
      cityName: function (id) {
        if (cityById[id]) return cityById[id].name;
        return id ? id.replace(/-/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); }) : '';
      },
      photo: function (ref, w) { return D.photoUrl(ref, w); }
    };
  })();

  /* ================================================================== */
  /* 3. Api — booking & contact requests                                 */
  /* ================================================================== */

  var Api = {
    send: function (kind, payload) {
      var body = { kind: kind, payload: payload, page: location.pathname.split('/').pop() || 'index.html', createdAt: new Date().toISOString() };
      if (CFG.api.requests && window.fetch) {
        return fetch(CFG.api.requests, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
          .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json().catch(function () { return {}; }); });
      }
      // No backend yet: keep requests in this browser so the flow is testable.
      return new Promise(function (resolve) {
        setTimeout(function () {
          var q = lsGet('fh-requests') || [];
          body.id = 'local-' + Date.now().toString(36);
          q.unshift(body);
          lsSet('fh-requests', q.slice(0, 50));
          if (window.console) console.info('[Fortune House] request saved locally (set FH_CONFIG.api.requests to send it to a server):', body);
          resolve({ id: body.id, local: true });
        }, 650);
      });
    }
  };

  /* ================================================================== */
  /* 4. Stores                                                           */
  /* ================================================================== */

  function createStore(initial, opts) {
    opts = opts || {};
    var s = {};
    for (var k in initial) s[k] = initial[k];
    if (opts.persist) {
      var saved = ssGet(opts.persist);
      if (saved) for (var j in s) if (saved[j] !== undefined) s[j] = saved[j];
    }
    var subs = [];
    function sanitize() {
      var t = toISO(today());
      if (!fromISO(s.checkin) || s.checkin < t) { s.checkin = ''; }
      if (!s.checkin || !fromISO(s.checkout) || s.checkout <= s.checkin) s.checkout = '';
      var max = opts.maxGuests ? opts.maxGuests() : 16;
      s.adults = clampInt(s.adults, 1, max, 2);
      s.children = clampInt(s.children, 0, Math.min(10, max - s.adults), 0);
      if ('city' in s && s.city && !Repo.isCity(s.city)) s.city = '';
    }
    sanitize();
    return {
      get: function () { return s; },
      set: function (patch, silent) {
        for (var k2 in patch) if (k2 in s) s[k2] = patch[k2];
        sanitize();
        if (opts.persist) ssSet(opts.persist, s);
        if (!silent) subs.slice().forEach(function (f) { f(s); });
      },
      on: function (f) { subs.push(f); f(s); },
      guests: function () { return s.adults + s.children; }
    };
  }

  var Search = null; // created after Repo.load() so the city can be validated

  function searchQuery(s, extra) {
    var q = new URLSearchParams();
    if (s.city) q.set('city', s.city);
    if (s.checkin) q.set('in', s.checkin);
    if (s.checkout) q.set('out', s.checkout);
    q.set('adults', s.adults);
    if (s.children) q.set('children', s.children);
    if (extra) for (var k in extra) if (extra[k]) q.set(k, extra[k]);
    return q.toString();
  }
  function guestsLabel(s) { return plural(s.adults + s.children, 'guest'); }

  /* ================================================================== */
  /* 5. UI                                                               */
  /* ================================================================== */

  /* ---- images: fade in on load, quiet fallback on error ---- */
  function setupImages(root) {
    $$('img[data-photo]', root).forEach(function (img) {
      img.src = Repo.photo(img.getAttribute('data-photo'), +img.getAttribute('data-w') || 1200);
      img.removeAttribute('data-photo');
    });
    $$('.media img', root).forEach(function (img) {
      if (img._fh) return;
      img._fh = true;
      var box = img.closest('.media');
      var done = function (ok) {
        img.classList.add(ok ? 'is-loaded' : 'is-failed');
        if (box) box.classList.add('is-ready');
      };
      if (img.getAttribute('src') && img.complete) { done(!!img.naturalWidth); return; }
      img.addEventListener('load', function () { done(true); });
      img.addEventListener('error', function () { done(false); });
    });
  }

  /* ---- scroll lock, counted ---- */
  var lockCount = 0;
  function lockScroll() {
    if (lockCount++ === 0) {
      var sw = window.innerWidth - doc.documentElement.clientWidth;
      doc.body.style.paddingRight = sw > 0 ? sw + 'px' : '';
      doc.body.classList.add('is-locked');
    }
  }
  function unlockScroll() {
    if (lockCount === 0) return;
    if (--lockCount === 0) {
      doc.body.classList.remove('is-locked');
      doc.body.style.paddingRight = '';
    }
  }

  /* ---- toast ---- */
  var toastEl, toastTimer;
  function toast(msg) {
    if (!toastEl) {
      toastEl = doc.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      doc.body.appendChild(toastEl);
    }
    toastEl.innerHTML = icon('check', 18) + '<span>' + esc(msg) + '</span>';
    requestAnimationFrame(function () { toastEl.classList.add('is-visible'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-visible'); }, 2400);
  }

  /* ---- button loading state ---- */
  function setLoading(btn, on) {
    if (!btn) return;
    btn.classList.toggle('is-loading', on);
    btn.disabled = on;
    btn.setAttribute('aria-busy', on ? 'true' : 'false');
  }

  /* ---- calendar ---- */
  function Calendar(el, opts) {
    this.el = el;
    this.opts = opts || {};
    this.start = this.opts.start || '';
    this.end = this.opts.end || '';
    this.hover = '';
    this.min = today();
    var base = fromISO(this.start) || this.min;
    this.view = new Date(base.getFullYear(), base.getMonth(), 1);
    this.minView = new Date(this.min.getFullYear(), this.min.getMonth(), 1);
    this.maxView = new Date(this.min.getFullYear(), this.min.getMonth() + 17, 1);
    el.classList.add('cal');
    this.bind();
    this.render(0);
  }
  Calendar.prototype.months = function () {
    return typeof this.opts.months === 'function' ? this.opts.months() : (this.opts.months || 1);
  };
  Calendar.prototype.set = function (start, end) {
    this.start = start || ''; this.end = end || ''; this.hover = '';
    var s = fromISO(this.start);
    if (s) {
      var last = new Date(this.view.getFullYear(), this.view.getMonth() + this.months(), 0);
      if (s < this.view || s > last) this.view = new Date(s.getFullYear(), s.getMonth(), 1);
    }
    if (this.view < this.minView) this.view = new Date(this.minView);
    this.render(0);
  };
  Calendar.prototype.render = function (dir) {
    var count = this.months();
    this.el.classList.toggle('cal--two', count === 2);
    this.el.style.setProperty('--cal-dir', (dir || 0) * 18 + 'px');
    var html = '<div class="cal__months">';
    for (var m = 0; m < count; m++) {
      var first = new Date(this.view.getFullYear(), this.view.getMonth() + m, 1);
      var days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
      var offset = (first.getDay() + 6) % 7;
      html += '<div class="cal__month"' + (dir ? '' : ' style="animation:none"') + '><div class="cal__head">';
      html += m === 0 ? '<button type="button" class="cal__nav" data-cal="prev" aria-label="Previous month"' + (this.view <= this.minView ? ' disabled' : '') + '>' + icon('chevronLeft', 18) + '</button>' : '<span class="cal__nav cal__nav--ghost"></span>';
      html += '<div class="cal__title">' + MONTHS[first.getMonth()] + ' ' + first.getFullYear() + '</div>';
      html += m === count - 1 ? '<button type="button" class="cal__nav" data-cal="next" aria-label="Next month"' + (this.view >= this.maxView ? ' disabled' : '') + '>' + icon('chevronRight', 18) + '</button>' : '<span class="cal__nav cal__nav--ghost"></span>';
      html += '</div><div class="cal__grid">';
      ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].forEach(function (d) { html += '<div class="cal__dow">' + d + '</div>'; });
      for (var e = 0; e < offset; e++) html += '<div class="cal__empty"></div>';
      for (var d = 1; d <= days; d++) {
        var date = new Date(first.getFullYear(), first.getMonth(), d);
        html += '<button type="button" class="cal__day' + (d === 1 ? ' cap-l' : '') + (d === days ? ' cap-r' : '') + '" data-date="' + toISO(date) + '"' + (date < this.min ? ' disabled' : '') + ' aria-label="' + d + ' ' + MONTHS[first.getMonth()] + '"><span>' + d + '</span></button>';
      }
      html += '</div></div>';
    }
    this.el.innerHTML = html + '</div>';
    this.paint();
  };
  Calendar.prototype.paint = function () {
    var s = this.start, e = this.end || (s && this.hover > s ? this.hover : '');
    var t = toISO(this.min);
    this.el.classList.toggle('is-preview', !this.end && !!e);
    $$('.cal__day', this.el).forEach(function (b) {
      var d = b.getAttribute('data-date');
      b.classList.toggle('is-today', d === t);
      b.classList.toggle('is-start', !!s && d === s);
      b.classList.toggle('is-end', !!e && d === e);
      b.classList.toggle('has-end', !!e && d === s);
      b.classList.toggle('in-range', !!s && !!e && d > s && d < e);
      b.setAttribute('aria-pressed', (d === s || d === e) ? 'true' : 'false');
    });
  };
  Calendar.prototype.bind = function () {
    var self = this;
    this.el.addEventListener('click', function (ev) {
      var nav = ev.target.closest('[data-cal]');
      if (nav) {
        var dir = nav.getAttribute('data-cal') === 'next' ? 1 : -1;
        self.view = new Date(self.view.getFullYear(), self.view.getMonth() + dir, 1);
        self.render(dir);
        return;
      }
      var day = ev.target.closest('.cal__day');
      if (!day || day.disabled) return;
      var d = day.getAttribute('data-date');
      if (!self.start || self.end || d <= self.start) { self.start = d; self.end = ''; }
      else self.end = d;
      self.hover = '';
      self.paint();
      if (self.opts.onChange) self.opts.onChange(self.start, self.end);
    });
    this.el.addEventListener('mouseover', function (ev) {
      if (!self.start || self.end || !finePointer.matches) return;
      var day = ev.target.closest('.cal__day');
      var h = day && !day.disabled ? day.getAttribute('data-date') : '';
      if (h !== self.hover) { self.hover = h; self.paint(); }
    });
    this.el.addEventListener('mouseleave', function () { if (self.hover) { self.hover = ''; self.paint(); } });
  };
  function calSummary(a, b) {
    if (!a) return 'Select your <b>check-in</b> date';
    if (!b) return '<b>' + fmtDay(a) + '</b> · now select <b>check-out</b>';
    return '<b>' + fmtRange(a, b) + '</b> · ' + plural(nightsBetween(a, b), 'night');
  }

  /* ---- guests stepper ---- */
  function guestsHTML() {
    var row = function (key, title, sub) {
      return '<div class="stepper-row"><div class="stepper-row__text"><span class="stepper-row__title">' + title + '</span><span class="stepper-row__sub">' + sub + '</span></div>' +
        '<div class="stepper"><button type="button" class="stepper__btn" data-step="' + key + ':-1" aria-label="Fewer ' + title.toLowerCase() + '">' + icon('minus', 18) + '</button>' +
        '<span class="stepper__val" data-val="' + key + '" aria-live="polite"></span>' +
        '<button type="button" class="stepper__btn" data-step="' + key + ':1" aria-label="More ' + title.toLowerCase() + '">' + icon('plus', 18) + '</button></div></div>';
    };
    return row('adults', 'Adults', 'Age 13 or above') + row('children', 'Children', 'Age 2–12');
  }
  function bindGuests(root, store, getMax) {
    function paint(s) {
      var max = getMax ? getMax() : 16;
      $$('[data-val]', root).forEach(function (v) {
        var val = String(s[v.getAttribute('data-val')]);
        if (v.textContent !== val) {
          var first = v.textContent === '';
          v.textContent = val;
          if (!first) { v.classList.remove('bump'); void v.offsetWidth; v.classList.add('bump'); }
        }
      });
      $('[data-step="adults:-1"]', root).disabled = s.adults <= 1;
      $('[data-step="children:-1"]', root).disabled = s.children <= 0;
      $('[data-step="adults:1"]', root).disabled = s.adults + s.children >= max;
      $('[data-step="children:1"]', root).disabled = s.adults + s.children >= max || s.children >= 10;
    }
    root.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-step]');
      if (!b || b.disabled) return;
      var p = b.getAttribute('data-step').split(':');
      var patch = {}; patch[p[0]] = store.get()[p[0]] + (+p[1]);
      store.set(patch);
    });
    store.on(paint);
  }

  /* ---- popovers: rendered at <body> level, anchored to their field ---- */
  var Pop = {
    current: null, anchor: null, scrim: null, locked: false,
    init: function () {
      var self = this;
      this.scrim = doc.createElement('div');
      this.scrim.className = 'pop-scrim';
      doc.body.appendChild(this.scrim);
      this.scrim.addEventListener('click', function () { self.close(); });
      doc.addEventListener('pointerdown', function (ev) {
        if (!self.current || mqMobile.matches) return;
        if (self.current.contains(ev.target) || (self.anchor && self.anchor.contains(ev.target))) return;
        self.close();
      });
      window.addEventListener('resize', function () { if (self.current) self.place(false); });
      var onBp = function () { self.close(); };
      if (mqMobile.addEventListener) mqMobile.addEventListener('change', onBp); else if (mqMobile.addListener) mqMobile.addListener(onBp);
    },
    create: function (cls, title, inner) {
      var el = doc.createElement('div');
      el.className = 'pop ' + (cls || '');
      el.setAttribute('role', 'dialog');
      el.setAttribute('aria-label', title);
      el.innerHTML = '<div class="pop__head"><span class="pop__title">' + esc(title) + '</span><button type="button" class="icon-btn icon-btn--sm icon-btn--plain" data-pop-close aria-label="Close">' + icon('close', 18) + '</button></div>' + inner;
      doc.body.appendChild(el);
      var self = this;
      el.addEventListener('click', function (ev) { if (ev.target.closest('[data-pop-close]')) self.close(); });
      return el;
    },
    toggle: function (pop, anchor) { if (this.current === pop) this.close(); else this.open(pop, anchor); },
    open: function (pop, anchor) {
      if (this.current && this.current !== pop) this.close(true);
      this.current = pop; this.anchor = anchor;
      if (pop._onOpen) pop._onOpen();
      this.place(true);
      anchor.setAttribute('aria-expanded', 'true');
      if (mqMobile.matches) {
        if (!this.locked) { lockScroll(); this.locked = true; }
        this.scrim.classList.add('is-open');
      }
      requestAnimationFrame(function () { pop.classList.add('is-open'); });
    },
    close: function (switching) {
      var pop = this.current;
      if (!pop) return;
      pop.classList.remove('is-open');
      if (this.anchor) this.anchor.setAttribute('aria-expanded', 'false');
      if (!switching) {
        this.scrim.classList.remove('is-open');
        if (this.locked) { unlockScroll(); this.locked = false; }
      }
      this.current = null; this.anchor = null;
    },
    place: function (allowScroll) {
      var pop = this.current, a = this.anchor;
      if (!pop || !a) return;
      if (mqMobile.matches) { pop.style.left = ''; pop.style.top = ''; return; }
      var r = (pop._alignTo || a).getBoundingClientRect();
      var w = pop.offsetWidth, h = pop.offsetHeight;
      var vw = doc.documentElement.clientWidth;
      var left = pop._alignRight ? r.right - w : r.left;
      left = Math.max(12, Math.min(left, vw - w - 12));
      var below = window.innerHeight - r.bottom, above = r.top;
      var top, flip = below < h + 20 && above > h + 90;
      if (flip) { top = r.top - h - 10; pop.style.transformOrigin = 'bottom left'; }
      else { top = r.bottom + 10; pop.style.transformOrigin = 'top left'; }
      pop.style.left = (left + window.scrollX) + 'px';
      pop.style.top = (top + window.scrollY) + 'px';
      if (allowScroll && !flip && top + h > window.innerHeight - 12) {
        window.scrollBy({ top: top + h - window.innerHeight + 24, behavior: smooth() });
      }
    }
  };

  /* ---- modal ---- */
  var Modal = {
    current: null, lastFocus: null,
    open: function (el) {
      if (typeof el === 'string') el = doc.getElementById(el);
      if (!el || !el.classList.contains('modal')) return;
      if (this.current) this.close(true);
      if (Pop.current) Pop.close();
      toggleMenu(false);
      this.lastFocus = doc.activeElement;
      this.current = el;
      if (el._onOpen) el._onOpen();
      el.setAttribute('aria-hidden', 'false');
      lockScroll();
      requestAnimationFrame(function () { el.classList.add('is-open'); });
      setTimeout(function () {
        var f = finePointer.matches && $('[data-autofocus]', el) || $('.modal__head [data-close]', el);
        if (f) f.focus({ preventScroll: true });
      }, 80);
    },
    close: function (instant) {
      var el = this.current;
      if (!el) return;
      if (Pop.current) Pop.close();
      el.classList.remove('is-open');
      el.setAttribute('aria-hidden', 'true');
      this.current = null;
      unlockScroll();
      if (el._onClose) setTimeout(el._onClose, instant ? 0 : 600);
      if (this.lastFocus && this.lastFocus.focus && doc.contains(this.lastFocus)) this.lastFocus.focus({ preventScroll: true });
    },
    build: function (id, opts) {
      var el = doc.createElement('div');
      el.className = 'modal';
      el.id = id;
      el.setAttribute('role', 'dialog');
      el.setAttribute('aria-modal', 'true');
      el.setAttribute('aria-hidden', 'true');
      el.setAttribute('aria-labelledby', id + '-title');
      el.innerHTML = '<div class="modal__scrim" data-close></div><div class="modal__panel ' + (opts.size === 'sm' ? 'modal__panel--sm' : '') + '">' +
        '<div class="modal__head"><h2 class="modal__title" id="' + id + '-title">' + opts.title + '</h2><button type="button" class="icon-btn icon-btn--sm icon-btn--plain" data-close aria-label="Close">' + icon('close', 18) + '</button></div>' +
        '<div class="modal__body">' + opts.body + '</div>' + (opts.foot ? '<div class="modal__foot">' + opts.foot + '</div>' : '') + '</div>';
      doc.body.appendChild(el);
      var self = this;
      el.addEventListener('click', function (ev) { if (ev.target.closest('[data-close]')) self.close(); });
      el.addEventListener('keydown', function (ev) {
        if (ev.key !== 'Tab') return;
        var f = $$('button:not([disabled]), a[href], input, textarea, select, [tabindex]:not([tabindex="-1"])', el).filter(function (n) { return n.offsetParent !== null; });
        if (!f.length) return;
        if (ev.shiftKey && doc.activeElement === f[0]) { ev.preventDefault(); f[f.length - 1].focus(); }
        else if (!ev.shiftKey && doc.activeElement === f[f.length - 1]) { ev.preventDefault(); f[0].focus(); }
      });
      return el;
    }
  };

  doc.addEventListener('keydown', function (ev) {
    if (ev.key !== 'Escape') return;
    if (Lightbox.isOpen) { Lightbox.close(); return; }
    if (Pop.current) { var a = Pop.anchor; Pop.close(); if (a) a.focus(); return; }
    if (Modal.current) { Modal.close(); return; }
    toggleMenu(false);
  });

  /* ---- search bar (hero + search page) ---- */
  function initSearchBar(bar, store, onSubmit) {
    if (!bar) return;
    var fCity = $('[data-sb="city"]', bar), fDates = $('[data-sb="dates"]', bar), fGuests = $('[data-sb="guests"]', bar);
    var vCity = $('.sb-field__value', fCity), vDates = $('.sb-field__value', fDates), vGuests = $('.sb-field__value', fGuests);

    var opts = '<div class="opt-list opt-list--cities" role="listbox" aria-label="City">' +
      '<button type="button" class="opt" role="option" data-city=""><span class="opt__icon">' + icon('map', 20) + '</span><span class="opt__text"><span class="opt__title">Anywhere in Thailand</span><span class="opt__sub">' + plural(Repo.count({}), 'stay') + ' · ' + Repo.cities().length + ' cities</span></span><span class="opt__check">' + icon('check', 14, 2) + '</span></button>' +
      Repo.cities().map(function (c) {
        return '<button type="button" class="opt" role="option" data-city="' + esc(c.id) + '"><span class="opt__icon">' + icon('pin', 20) + '</span><span class="opt__text"><span class="opt__title">' + esc(c.name) + '</span><span class="opt__sub">' + plural(Repo.count({ city: c.id }), 'stay') + ' · ' + esc(c.note) + '</span></span><span class="opt__check">' + icon('check', 14, 2) + '</span></button>';
      }).join('') + '</div>';
    var popCity = Pop.create('pop--cities', 'Where to?', opts);
    var popDates = Pop.create('pop--cal', 'When?', '<div class="cal-host"></div><div class="pop__foot"><span class="cal__summary"></span><div class="row gap-8"><button type="button" class="btn btn--sm btn--ghost" data-clear>Clear</button><button type="button" class="btn btn--sm btn--primary" data-done>Done</button></div></div>');
    var popGuests = Pop.create('', 'Who’s coming?', '<div class="pop__pad">' + guestsHTML() + '</div><div class="pop__foot"><span class="cal__summary" data-gsum></span><button type="button" class="btn btn--sm btn--primary" data-done>Done</button></div>');

    var twoMonths = function () { return window.innerWidth >= 900 ? 2 : 1; };
    var cal = new Calendar($('.cal-host', popDates), {
      months: twoMonths, start: store.get().checkin, end: store.get().checkout,
      // picking dates never closes the window: Done moves on to the guests step
      onChange: function (a, b) { store.set({ checkin: a, checkout: b }); }
    });
    popDates._onOpen = function () {
      popDates.classList.toggle('pop--two', twoMonths() === 2);
      cal.set(store.get().checkin, store.get().checkout);
    };

    popCity.addEventListener('click', function (ev) {
      var o = ev.target.closest('[data-city]');
      if (!o) return;
      store.set({ city: o.getAttribute('data-city') });
      setTimeout(function () {
        if (Pop.current !== popCity) return;
        if (!store.get().checkin) Pop.open(popDates, fDates); else Pop.close();
      }, 180);
    });
    popDates.addEventListener('click', function (ev) {
      if (ev.target.closest('[data-clear]')) { store.set({ checkin: '', checkout: '' }); cal.set('', ''); }
      if (ev.target.closest('[data-done]')) {
        var s = store.get();
        if (s.checkin && !s.checkout) { nudge($('.cal__summary', popDates)); return; }
        if (s.checkin && s.checkout) Pop.open(popGuests, fGuests); else Pop.close();
      }
    });
    bindGuests(popGuests, store);
    popGuests.addEventListener('click', function (ev) { if (ev.target.closest('[data-done]')) Pop.close(); });

    fCity.addEventListener('click', function () { Pop.toggle(popCity, fCity); });
    fDates.addEventListener('click', function () { Pop.toggle(popDates, fDates); });
    fGuests.addEventListener('click', function () { Pop.toggle(popGuests, fGuests); });

    store.on(function (s) {
      setValue(vCity, s.city ? Repo.cityName(s.city) : '', 'Anywhere in Thailand');
      setValue(vDates, s.checkin ? fmtRange(s.checkin, s.checkout) : '', 'Add dates');
      setValue(vGuests, guestsLabel(s), '');
      $$('.opt', popCity).forEach(function (o) { o.setAttribute('aria-selected', o.getAttribute('data-city') === s.city ? 'true' : 'false'); });
      $('.cal__summary', popDates).innerHTML = calSummary(s.checkin, s.checkout);
      $('[data-gsum]', popGuests).textContent = guestsLabel(s);
    });

    bar.addEventListener('submit', function (ev) {
      ev.preventDefault();
      Pop.close();
      onSubmit();
    });
  }

  function setValue(el, val, placeholder) {
    var text = val || placeholder;
    el.classList.toggle('is-placeholder', !val);
    if (el.textContent !== text) el.textContent = text;
  }

  /* ---- finder modal: "Choose apartment" ---- */
  function buildFinder() {
    var chips = '<button type="button" class="chip" role="radio" data-fcity="">Anywhere</button>' + Repo.cities().map(function (c) {
      return '<button type="button" class="chip" role="radio" data-fcity="' + esc(c.id) + '">' + esc(c.name) + '</button>';
    }).join('');
    var body =
      '<p class="muted" style="margin-bottom:22px">Tell us where, when and who — we’ll show apartments that fit.</p>' +
      '<div class="m-block"><div class="m-label"><span>Where to?</span></div><div class="chips" role="radiogroup" aria-label="City">' + chips + '</div></div>' +
      '<div class="m-block"><div class="m-label"><span>When?</span><span class="cal__summary" data-fsum></span></div><div data-fcal></div></div>' +
      '<div class="m-block"><div class="m-label"><span>Who’s coming?</span></div><div data-fguests>' + guestsHTML() + '</div></div>';
    var foot = '<button type="button" class="btn btn--sm btn--ghost" data-freset>Clear all</button><button type="button" class="btn btn--primary btn--arrow" data-fgo><span data-fcount>Show apartments</span><span class="btn__arrow">' + btnArrow() + '</span></button>';
    var m = Modal.build('finder', { title: 'Find your apartment', body: body, foot: foot });
    var cal = new Calendar($('[data-fcal]', m), {
      months: function () { return window.innerWidth >= 720 ? 2 : 1; },
      start: Search.get().checkin, end: Search.get().checkout,
      onChange: function (a, b) { Search.set({ checkin: a, checkout: b }); }
    });
    bindGuests($('[data-fguests]', m), Search);
    m._onOpen = function () { cal.set(Search.get().checkin, Search.get().checkout); };
    m.addEventListener('click', function (ev) {
      var c = ev.target.closest('[data-fcity]');
      if (c) Search.set({ city: c.getAttribute('data-fcity') });
      if (ev.target.closest('[data-freset]')) { Search.set({ city: '', checkin: '', checkout: '', adults: 2, children: 0 }); cal.set('', ''); }
      if (ev.target.closest('[data-fgo]')) { Modal.close(); navigate('search.html?' + searchQuery(Search.get())); }
    });
    Search.on(function (s) {
      $$('[data-fcity]', m).forEach(function (c) { c.setAttribute('aria-checked', c.getAttribute('data-fcity') === s.city ? 'true' : 'false'); });
      $('[data-fsum]', m).innerHTML = s.checkin ? calSummary(s.checkin, s.checkout) : 'Any dates';
      var n = Repo.count({ city: s.city, guests: s.adults + s.children });
      $('[data-fcount]', m).textContent = n ? 'Show ' + plural(n, 'apartment') : 'Show all apartments';
    });
  }

  /* ---- request modal (personal selection, consultation, forecast) ---- */
  function buildRequest() {
    var body =
      '<form class="contact-form" novalidate>' +
      '<p class="muted" data-csub style="margin-bottom:22px"></p>' +
      '<div class="form-grid form-grid--2">' +
      '<div class="field"><label for="c-name">Your name</label><input class="input" id="c-name" name="name" autocomplete="name" required data-autofocus></div>' +
      '<div class="field"><label for="c-contact">Phone, WhatsApp or email</label><input class="input" id="c-contact" name="contact" autocomplete="email" required></div>' +
      '<div class="field span-2"><label for="c-msg">Anything we should know? <span class="muted">(optional)</span></label><textarea class="input" id="c-msg" name="message" placeholder="Dates, budget, number of guests…"></textarea></div>' +
      '</div>' +
      '<p class="form-error" data-cerr role="alert" hidden></p>' +
      '<button type="submit" class="btn btn--primary btn--block btn--arrow" style="margin-top:18px"><span data-csubmit>Send request</span><span class="btn__arrow">' + btnArrow() + '</span></button>' +
      '<p class="form-note" style="margin-top:12px;text-align:center">By sending, you agree to our <a href="privacy.html">Privacy Policy</a>.</p>' +
      '</form>' +
      '<div class="success" hidden><div class="success__icon"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></div><h3 class="h3">Thank you — request received</h3><p class="muted">Our team will get back to you within one hour during working time (9:00–21:00, GMT+7).</p><button type="button" class="btn btn--primary" data-close style="margin-top:8px">Done</button></div>';
    var m = Modal.build('request', { title: 'Get a personal selection', body: body, size: 'sm' });
    var form = $('form', m), ok = $('.success', m), err = $('[data-cerr]', m), submit = $('button[type=submit]', form);
    var kind = 'selection';
    $$('.input', form).forEach(function (i) { i.addEventListener('input', function () { i.classList.remove('is-invalid'); }); });
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (submit.disabled) return;
      err.hidden = true;
      var bad = $$('[required]', form).filter(function (i) { return !i.value.trim(); });
      $$('[required]', form).forEach(function (i) { i.classList.toggle('is-invalid', bad.indexOf(i) > -1); });
      if (bad.length) { bad[0].focus(); return; }
      var s = Search.get();
      setLoading(submit, true);
      Api.send(kind, {
        name: form.name.value.trim(), contact: form.contact.value.trim(), message: form.message.value.trim(),
        search: { city: s.city, checkin: s.checkin, checkout: s.checkout, adults: s.adults, children: s.children }
      }).then(function () {
        form.hidden = true; ok.hidden = false;
        $('.modal__title', m).textContent = 'All set';
      }, function () {
        err.textContent = 'We couldn’t send your request. Please try again or message us on WhatsApp.';
        err.hidden = false;
      }).then(function () { setLoading(submit, false); });
    });
    m._onClose = function () { form.reset(); form.hidden = false; ok.hidden = true; err.hidden = true; $$('.input', form).forEach(function (i) { i.classList.remove('is-invalid'); }); };
    m._config = function (k, title, sub, cta) {
      kind = k || 'selection';
      $('.modal__title', m).textContent = title;
      $('[data-csub]', m).textContent = sub;
      $('[data-csubmit]', m).textContent = cta;
    };
    return m;
  }

  /* ---- header & menu (header is static: it does not follow the scroll) ---- */
  function toggleMenu(force) {
    var isOpen = doc.body.classList.contains('menu-open');
    var open = typeof force === 'boolean' ? force : !isOpen;
    if (open === isOpen) return;
    doc.body.classList.toggle('menu-open', open);
    var b = $('.burger');
    if (b) b.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  function initHeader() {
    var b = $('.burger');
    if (b) b.addEventListener('click', function () { toggleMenu(); });
    var scrim = $('.menu-scrim');
    if (scrim) scrim.addEventListener('click', function () { toggleMenu(false); });
    $$('.mobile-menu a').forEach(function (a) { a.addEventListener('click', function () { toggleMenu(false); }); });
    window.addEventListener('resize', function () { if (window.innerWidth >= 960) toggleMenu(false); });
  }

  /* ---- smooth page transitions ---- */
  function navigate(href) {
    if (reduceMotion) { location.href = href; return; }
    doc.body.classList.add('is-leaving');
    setTimeout(function () { location.href = href; }, 260);
  }
  function initTransitions() {
    doc.addEventListener('click', function (ev) {
      var a = ev.target.closest('a[href]');
      if (!a || ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
      if (a.target === '_blank' || a.hasAttribute('download') || a.hasAttribute('data-open')) return;
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#' || /^(mailto|tel|javascript):/.test(href)) return;
      if (a.protocol !== location.protocol || a.host !== location.host) return;
      if (a.pathname === location.pathname && a.search === location.search && a.hash) return;
      ev.preventDefault();
      navigate(a.href);
    });
    window.addEventListener('pageshow', function (ev) { if (ev.persisted) doc.body.classList.remove('is-leaving'); });
  }

  /* ---- reveal on scroll + counters ---- */
  var revealIO = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      if (e.target.hasAttribute('data-count')) countUp(e.target);
      $$('[data-count]', e.target).forEach(countUp);
      revealIO.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }) : null;

  function initReveal(root) {
    $$('[data-stagger]', root).forEach(function (g) {
      var step = parseFloat(g.getAttribute('data-stagger')) || 0.07;
      Array.prototype.forEach.call(g.children, function (c, i) {
        if (!c.hasAttribute('data-reveal')) c.setAttribute('data-reveal', '');
        c.style.setProperty('--d', (i * step).toFixed(2) + 's');
      });
    });
    $$('[data-reveal]', root).forEach(function (el) {
      if (el._rv) return; el._rv = true;
      if (revealIO && !reduceMotion) revealIO.observe(el); else { el.classList.add('is-in'); $$('[data-count]', el).forEach(countUp); }
    });
  }

  function countUp(el) {
    if (el._counted) return; el._counted = true;
    var to = parseFloat(el.getAttribute('data-count'));
    var dec = +(el.getAttribute('data-decimals') || 0);
    var pre = el.getAttribute('data-prefix') || '', suf = el.getAttribute('data-suffix') || '';
    if (reduceMotion) { el.textContent = pre + to.toFixed(dec) + suf; return; }
    var t0 = null;
    (function frame(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / 1400), e = 1 - Math.pow(1 - p, 4);
      el.textContent = pre + (to * e).toFixed(dec) + suf;
      if (p < 1) requestAnimationFrame(frame);
    })(performance.now());
  }

  /* ---- apartment cards ---- */
  var favs = (lsGet('fh-favs') || []).filter(function (x) { return typeof x === 'string'; });

  function linkAttrs() { return finePointer.matches ? ' target="_blank" rel="noopener"' : ''; }

  function priceHTML(a, nights) {
    if (!a.price) return '<span class="price"><b>Price on request</b></span>';
    if (nights) return '<span class="price"><b>' + money(a.price * nights) + '</b> total<small>' + money(a.price) + ' / night · ' + plural(nights, 'night') + '</small></span>';
    return '<span class="price"><b>' + money(a.price) + '</b> / night</span>';
  }

  function hlChip(k, size, tag) {
    var h = Repo.highlight(k);
    if (!h) return '';
    tag = tag || 'li';
    return '<' + tag + ' class="hl hl--' + esc(h.tone || 'neutral') + '">' + icon(h.icon || k, size || 15, 1.8) + esc(h.label) + '</' + tag + '>';
  }

  function cardHTML(a, opts) {
    opts = opts || {};
    var href = 'apartment.html?id=' + encodeURIComponent(a.id);
    var isFav = favs.indexOf(a.id) > -1;
    var photos = a.photos.length ? a.photos : [''];
    var slides = photos.map(function (p, i) {
      var src = p ? Repo.photo(p, 900) : '';
      return '<div class="apt-media__slide media">' + (src ? '<img ' + (i === 0 ? 'src' : 'data-src') + '="' + esc(src) + '" alt="' + esc(a.title) + (i ? ' — photo ' + (i + 1) : '') + '" loading="lazy" decoding="async" draggable="false">' : '') + '</div>';
    }).join('');
    var many = photos.length > 1;
    var where = esc(a.type) + (a.area ? ' · ' + esc(a.area) : '') + ', ' + esc(Repo.cityName(a.city));
    var specs = '<li class="spec">' + icon('bed', 16) + (a.beds ? plural(a.beds, 'bedroom') : 'Studio') + '</li>' +
      '<li class="spec">' + icon('user', 16) + plural(a.guests, 'guest') + '</li>' +
      (a.size ? '<li class="spec">' + icon('area', 16) + a.size + ' m²</li>' : '');
    var hl = a.highlights.slice(0, 2).map(function (k) { return hlChip(k, 15); }).join('');
    return '<article class="apt-card' + (opts.boxed ? ' apt-card--boxed' : '') + '"' + (opts.i !== undefined ? ' style="--i:' + opts.i + '"' : '') + '>' +
      '<div class="apt-media" data-gallery data-index="0" data-photos="' + photos.length + '">' +
      '<div class="apt-media__strip">' + slides + '</div>' +
      (many ? '<button type="button" class="apt-media__nav apt-media__nav--prev" data-slide="-1" aria-label="Previous photo" disabled>' + icon('chevronLeft', 18, 2) + '</button>' +
        '<button type="button" class="apt-media__nav apt-media__nav--next" data-slide="1" aria-label="Next photo">' + icon('chevronRight', 18, 2) + '</button>' +
        (photos.length <= 8 ? '<div class="apt-media__dots" aria-hidden="true">' + photos.map(function (p, i) { return '<span' + (i === 0 ? ' class="is-active"' : '') + '></span>'; }).join('') + '</div>' : '') : '') +
      (Repo.isGuestFav(a) ? '<div class="apt-card__badges"><span class="badge">' + icon('award', 15, 1.8) + 'Guest favourite</span></div>' : '') +
      '<button type="button" class="fav" data-fav="' + esc(a.id) + '" aria-pressed="' + isFav + '" aria-label="Save ' + esc(a.title) + '">' + icon('heart', 20) + '</button>' +
      '</div>' +
      '<div class="apt-card__body">' +
      '<div class="apt-card__top"><p class="apt-card__loc">' + where + '</p>' +
      (a.rating && a.reviews ? '<span class="rating">' + icon('star', 14) + a.rating.toFixed(2) + '<span class="rating__n">(' + a.reviews + ')</span></span>' : '<span class="rating rating--new">New</span>') + '</div>' +
      '<h3 class="apt-card__title"><a class="apt-card__link" href="' + href + '"' + linkAttrs() + '>' + esc(a.title) + '</a></h3>' +
      (a.near ? '<p class="apt-card__near">' + icon('near', 14) + '<span>' + esc(a.near) + '</span></p>' : '') +
      '<ul class="specs">' + specs + '</ul>' +
      (hl ? '<ul class="hl-chips" aria-label="Highlights">' + hl + '</ul>' : '') +
      '<div class="apt-card__foot">' + priceHTML(a, opts.nights) +
      '<a class="btn btn--sm btn--soft btn--arrow see-more" href="' + href + '"' + linkAttrs() + '>See more<span class="btn__arrow">' + btnArrow(16) + '</span></a>' +
      '</div></div></article>';
  }

  /* card photo slider (delegated, works for any card on any page) */
  function slideCard(media, dir) {
    var count = +media.getAttribute('data-photos');
    var i = Math.min(count - 1, Math.max(0, +media.getAttribute('data-index') + dir));
    media.setAttribute('data-index', i);
    var slides = media.querySelectorAll('.apt-media__slide');
    [i, i + 1].forEach(function (k) { // load the visible photo and the next one
      var img = slides[k] && slides[k].querySelector('img[data-src]');
      if (img) { img.src = img.getAttribute('data-src'); img.removeAttribute('data-src'); }
    });
    $('.apt-media__strip', media).style.transform = 'translate3d(' + (-100 * i) + '%,0,0)';
    var prev = $('[data-slide="-1"]', media), next = $('[data-slide="1"]', media);
    if (prev) prev.disabled = i === 0;
    if (next) next.disabled = i === count - 1;
    $$('.apt-media__dots span', media).forEach(function (d, k) { d.classList.toggle('is-active', k === i); });
  }
  function initCards() {
    doc.addEventListener('click', function (ev) {
      var nav = ev.target.closest('[data-slide]');
      if (nav) {
        ev.preventDefault(); ev.stopPropagation();
        var media = nav.closest('[data-gallery]');
        if (media && !nav.disabled) slideCard(media, +nav.getAttribute('data-slide'));
        return;
      }
      var b = ev.target.closest('[data-fav]');
      if (!b) return;
      ev.preventDefault(); ev.stopPropagation();
      var id = b.getAttribute('data-fav');
      var i = favs.indexOf(id);
      if (i > -1) favs.splice(i, 1); else favs.push(id);
      lsSet('fh-favs', favs);
      $$('[data-fav]').forEach(function (x) {
        if (x.getAttribute('data-fav') !== id) return;
        x.setAttribute('aria-pressed', i > -1 ? 'false' : 'true');
        x.classList.remove('pulse'); void x.offsetWidth; x.classList.add('pulse');
      });
      syncFavCount(true);
      toast(i > -1 ? 'Removed from saved' : 'Saved to your list');
      favSubs.forEach(function (f) { f(id, i < 0); });
    });
    // another tab changed the list
    window.addEventListener('storage', function (ev) {
      if (ev.key !== 'fh-favs') return;
      favs.length = 0;
      (lsGet('fh-favs') || []).forEach(function (x) { if (typeof x === 'string') favs.push(x); });
      $$('[data-fav]').forEach(function (x) { x.setAttribute('aria-pressed', favs.indexOf(x.getAttribute('data-fav')) > -1 ? 'true' : 'false'); });
      syncFavCount(false);
      favSubs.forEach(function (f) { f(null); });
    });
  }
  var favSubs = [];
  /* header "Saved" counters */
  function syncFavCount(bump) {
    var n = favs.filter(function (id) { return Repo.get(id); }).length;
    $$('[data-fav-count]').forEach(function (el) {
      el.textContent = n > 99 ? '99+' : String(n);
      el.classList.toggle('is-empty', !n);
      if (bump && n) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
    });
  }
  function renderCards(container, items, opts) {
    container.innerHTML = items.map(function (a, i) {
      var o = {}; for (var k in opts) o[k] = opts[k]; o.i = i;
      return cardHTML(a, o);
    }).join('');
    setupImages(container);
  }

  /* ---- carousel: arrows beside the cards, soft fade where more cards hide ---- */
  function initCarousel(root) {
    var track = $('.carousel__track', root);
    var frame = $('.carousel__frame', root) || root;
    var prev = $('[data-prev]', root), next = $('[data-next]', root);
    var bar = $('.carousel__progress span', root);
    if (!track) return function () {};
    var ticking = false;
    function measure() {
      var media = $('.apt-media', track);
      if (media) {
        var fr = frame.getBoundingClientRect(), mr = media.getBoundingClientRect();
        frame.style.setProperty('--nav-y', Math.round(mr.top - fr.top + mr.height / 2) + 'px');
      }
      update();
    }
    function update() {
      ticking = false;
      var max = track.scrollWidth - track.clientWidth;
      var atStart = track.scrollLeft <= 4, atEnd = track.scrollLeft >= max - 4;
      if (prev) prev.disabled = atStart;
      if (next) next.disabled = atEnd || max <= 4;
      track.classList.toggle('more-r', max > 4 && !atEnd);
      track.classList.toggle('more-l', max > 4 && atEnd && !atStart);
      if (bar) {
        var ratio = track.scrollWidth ? Math.min(1, track.clientWidth / track.scrollWidth) : 1;
        bar.style.width = (ratio * 100) + '%';
        bar.style.transform = 'translateX(' + (max > 0 ? (track.scrollLeft / max) * ((1 / ratio) - 1) * 100 : 0) + '%)';
      }
    }
    function step() {
      var c = track.children[0];
      var gap = parseFloat(getComputedStyle(track).columnGap) || 16;
      return c ? c.getBoundingClientRect().width + gap : track.clientWidth * 0.8;
    }
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: smooth() }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: smooth() }); });
    track.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', measure);
    track.addEventListener('keydown', function (ev) {
      if (ev.target !== track) return;
      if (ev.key === 'ArrowRight') { ev.preventDefault(); track.scrollBy({ left: step(), behavior: smooth() }); }
      if (ev.key === 'ArrowLeft') { ev.preventDefault(); track.scrollBy({ left: -step(), behavior: smooth() }); }
    });
    measure();
    setTimeout(measure, 350);
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(measure);
    return measure;
  }

  /* ---- lightbox (apartment gallery) ---- */
  var Lightbox = {
    el: null, isOpen: false,
    build: function (photos, title) {
      var el = doc.createElement('div');
      el.className = 'lightbox';
      el.setAttribute('role', 'dialog');
      el.setAttribute('aria-modal', 'true');
      el.setAttribute('aria-label', 'Photos');
      el.innerHTML = '<div class="lightbox__top"><span data-lbc>1 / ' + photos.length + '</span><button type="button" class="icon-btn" data-lbclose aria-label="Close photos">' + icon('close', 20) + '</button></div>' +
        '<div class="lightbox__track">' + photos.map(function (p, i) {
          return '<div class="lightbox__slide"><div class="media"><img src="' + esc(Repo.photo(p, 2000)) + '" alt="' + esc(title) + ' — photo ' + (i + 1) + '" loading="lazy"></div></div>';
        }).join('') + '</div>' +
        '<div class="lightbox__arrows"><button type="button" class="icon-btn" data-lbprev aria-label="Previous photo">' + icon('arrowLeft', 22) + '</button><button type="button" class="icon-btn" data-lbnext aria-label="Next photo">' + icon('arrowRight', 22) + '</button></div>';
      doc.body.appendChild(el);
      setupImages(el);
      this.el = el;
      var track = $('.lightbox__track', el), counter = $('[data-lbc]', el), self = this;
      var go = function (d) { track.scrollBy({ left: d * track.clientWidth, behavior: smooth() }); };
      el.addEventListener('click', function (ev) {
        if (ev.target.closest('[data-lbclose]')) self.close();
        if (ev.target.closest('[data-lbprev]')) go(-1);
        if (ev.target.closest('[data-lbnext]')) go(1);
      });
      track.addEventListener('scroll', function () {
        counter.textContent = (Math.round(track.scrollLeft / track.clientWidth) + 1) + ' / ' + photos.length;
      }, { passive: true });
      el.addEventListener('keydown', function (ev) {
        if (ev.key === 'ArrowRight') go(1);
        if (ev.key === 'ArrowLeft') go(-1);
      });
    },
    open: function (i) {
      if (!this.el) return;
      var el = this.el, track = $('.lightbox__track', el);
      this.isOpen = true;
      lockScroll();
      el.classList.add('is-open');
      track.scrollLeft = i * track.clientWidth;
      requestAnimationFrame(function () { track.scrollLeft = i * track.clientWidth; $('[data-lbclose]', el).focus({ preventScroll: true }); });
    },
    close: function () {
      if (!this.isOpen) return;
      this.isOpen = false;
      this.el.classList.remove('is-open');
      unlockScroll();
    }
  };

  /* ================================================================== */
  /* 6. Pages                                                            */
  /* ================================================================== */

  function pageHome() {
    var track = $('#featured-track');
    if (track) {
      var items = Repo.search({ featured: true, sort: 'recommended' });
      if (!items.length) items = Repo.all().slice(0, 8);
      renderCards(track, items, {});
      initCarousel($('#featured'));
    }
    initSearchBar($('#hero-search'), Search, function () { navigate('search.html?' + searchQuery(Search.get())); });
  }

  function pageSearch() {
    var p = params();
    var patch = {};
    if ('city' in p) patch.city = p.city;
    if ('in' in p) patch.checkin = p['in'];
    if ('out' in p) patch.checkout = p.out;
    if ('adults' in p) patch.adults = p.adults;
    if ('children' in p) patch.children = p.children;
    Search.set(patch, true);

    var PAGE = 12;
    var types = Repo.types();
    var TIER_HINT = (function () {
      var t = CFG.tiers || {}, lo = t.budgetBelow || 1500, hi = t.luxuryFrom || 5500;
      return { budget: 'under ' + money(lo) + ' a night', mid: money(lo) + '–' + money(hi).replace('฿', '') + ' a night', luxury: 'from ' + money(hi) + ' a night' };
    })();
    var SORTS = { recommended: 'Recommended', 'price-asc': 'Price: low to high', 'price-desc': 'Price: high to low', rating: 'Top rated', saved: 'Recently saved' };
    var state = {
      saved: p.saved === '1',
      type: types.indexOf(p.type) > -1 ? p.type : 'All',
      tier: Repo.tierName(p.tier) ? p.tier : 'all',
      sort: SORTS[p.sort] ? p.sort : (p.saved === '1' ? 'saved' : 'recommended'),
      limit: PAGE
    };
    if (state.sort === 'saved' && !state.saved) state.sort = 'recommended';

    var grid = $('#results-grid'), count = $('#results-count'), title = $('#results-title'), sub = $('#results-sub');
    var chipsBox = $('#type-chips'), seg = $('#tier-seg'), filters = $('#filters');
    var more = $('#results-more'), moreBtn = $('#more-btn'), moreText = $('#more-text'), moreBar = $('#more-bar');
    var crumb = $('#results-crumb');

    // budget segments
    seg.innerHTML = '<span class="seg__thumb" aria-hidden="true"></span>' + [['all', 'Any budget']].concat(Repo.tiers().map(function (k) { return [k, Repo.tierName(k)]; })).map(function (t) {
      return '<button type="button" class="seg__opt" role="radio" data-tier="' + t[0] + '" aria-checked="false"' + (TIER_HINT[t[0]] ? ' title="' + esc(TIER_HINT[t[0]]) + '"' : '') + '>' + (t[0] === 'all' ? '<span class="seg__long">Any budget</span><span class="seg__short">Any</span>' : esc(t[1])) + '</button>';
    }).join('');
    var thumb = $('.seg__thumb', seg);
    function placeThumb(instant) {
      var on = $('[aria-checked="true"]', seg);
      if (!on) return;
      if (instant) thumb.style.transition = 'none';
      thumb.style.width = on.offsetWidth + 'px';
      thumb.style.transform = 'translateX(' + on.offsetLeft + 'px)';
      if (instant) { void thumb.offsetWidth; thumb.style.transition = ''; }
    }
    window.addEventListener('resize', function () { placeThumb(true); });
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { placeThumb(true); });

    // property types
    chipsBox.innerHTML = ['All'].concat(types).map(function (t) {
      return '<button type="button" class="chip" data-type="' + esc(t) + '" aria-pressed="false">' + (t === 'All' ? 'All types' : esc(t) + 's') + '<span class="chip__n" data-n></span></button>';
    }).join('');

    var sortBtn = $('#sort-btn');
    var popSort = Pop.create('pop--narrow', 'Sort by', '<div class="opt-list" role="listbox">' + Object.keys(SORTS).map(function (k) {
      return '<button type="button" class="opt" role="option" data-sort="' + k + '"><span class="opt__text"><span class="opt__title">' + SORTS[k] + '</span></span><span class="opt__check">' + icon('check', 14, 2) + '</span></button>';
    }).join('') + '</div>');
    popSort._alignRight = true;
    sortBtn.addEventListener('click', function () { Pop.toggle(popSort, sortBtn); });
    popSort.addEventListener('click', function (ev) {
      var o = ev.target.closest('[data-sort]');
      if (!o) return;
      state.sort = o.getAttribute('data-sort');
      state.limit = PAGE;
      Pop.close();
      render(true);
    });
    chipsBox.addEventListener('click', function (ev) {
      var c = ev.target.closest('[data-type]');
      if (!c || c.disabled) return;
      state.type = c.getAttribute('data-type');
      state.limit = PAGE;
      render(true);
    });
    seg.addEventListener('click', function (ev) {
      var o = ev.target.closest('[data-tier]');
      if (!o) return;
      state.tier = o.getAttribute('data-tier');
      state.limit = PAGE;
      render(true);
    });
    moreBtn.addEventListener('click', function () {
      state.limit += PAGE;
      render(false, true);
    });

    function syncURL() {
      var extra = state.saved ? { saved: '1', sort: state.sort !== 'saved' ? state.sort : '' }
        : { type: state.type !== 'All' ? state.type : '', tier: state.tier !== 'all' ? state.tier : '', sort: state.sort !== 'recommended' ? state.sort : '' };
      try { history.replaceState(null, '', 'search.html?' + searchQuery(Search.get(), extra)); } catch (e) { /* some browsers block this on file:// */ }
    }

    function query(s, over) {
      var q = state.saved ? { ids: favs.slice(), sort: state.sort }
        : { city: s.city, guests: s.adults + s.children, type: state.type, tier: state.tier, sort: state.sort };
      if (over) for (var k in over) q[k] = over[k];
      return q;
    }

    var first = true, swapTimer, shown = 0;
    function render(animate, append) {
      var s = Search.get();
      var nights = nightsBetween(s.checkin, s.checkout);
      var list = Repo.search(query(s));
      var page = list.slice(0, state.limit);

      filters.hidden = state.saved;
      $$('[data-sort="saved"]', popSort).forEach(function (o) { o.hidden = !state.saved; });
      $$('[data-tier]', seg).forEach(function (x) { x.setAttribute('aria-checked', x.getAttribute('data-tier') === state.tier ? 'true' : 'false'); });
      placeThumb(first);
      $$('[data-type]', chipsBox).forEach(function (x) {
        var t = x.getAttribute('data-type');
        var n = Repo.count(query(s, { type: t, sort: '' }));
        x.setAttribute('aria-pressed', t === state.type ? 'true' : 'false');
        $('[data-n]', x).textContent = n;
        x.disabled = !n && t !== state.type;
      });
      $('.sort-btn__label', sortBtn).textContent = SORTS[state.sort];
      $$('[data-sort]', popSort).forEach(function (o) { o.setAttribute('aria-selected', o.getAttribute('data-sort') === state.sort ? 'true' : 'false'); });

      if (state.saved) {
        title.textContent = 'Saved apartments';
        sub.textContent = list.length ? plural(list.length, 'apartment') + ' on your list · saved on this device' : 'Tap the heart on any apartment to keep it here';
        count.innerHTML = '<b>' + list.length + '</b> saved';
        if (crumb) crumb.textContent = 'Saved';
      } else {
        title.textContent = s.city ? 'Apartments in ' + Repo.cityName(s.city) : 'Apartments across Thailand';
        sub.textContent = (s.checkin && s.checkout ? fmtRange(s.checkin, s.checkout) + ' · ' + plural(nights, 'night') : 'Any dates') + ' · ' + guestsLabel(s);
        count.innerHTML = '<b>' + list.length + '</b> ' + (state.tier !== 'all' ? Repo.tierName(state.tier).toLowerCase() + ' ' : '') + (list.length === 1 ? 'stay' : 'stays') +
          (state.tier !== 'all' ? '<span class="results__hint"> · ' + TIER_HINT[state.tier] + '</span>' : ' found');
        if (crumb) crumb.textContent = 'Apartments';
      }
      doc.title = title.textContent + ' — Fortune House';

      var paint = function () {
        if (append && shown && list.length) {
          var html = page.slice(shown).map(function (a, i) { return cardHTML(a, { nights: nights, boxed: true, i: i }); }).join('');
          var tmp = doc.createElement('div'); tmp.innerHTML = html;
          var added = Array.prototype.slice.call(tmp.children);
          added.forEach(function (c) { grid.appendChild(c); });
          added.forEach(function (c) { setupImages(c); });
        } else if (list.length) renderCards(grid, page, { nights: nights, boxed: true });
        else if (state.saved) grid.innerHTML = '<div class="empty" style="grid-column:1/-1"><div class="empty__icon">' + icon('heart', 26) + '</div><h3 class="h3">No saved apartments yet</h3><p class="muted" style="max-width:380px">Tap the heart on any apartment and it will wait for you here — on this device, no sign-up needed.</p><a class="btn btn--primary btn--sm btn--arrow" href="search.html">Browse apartments<span class="btn__arrow">' + btnArrow(16) + '</span></a></div>';
        else grid.innerHTML = '<div class="empty" style="grid-column:1/-1"><div class="empty__icon">' + icon('search', 26) + '</div><h3 class="h3">No apartments match yet</h3><p class="muted" style="max-width:380px">Try another city, a different budget or fewer guests — or ask us for a personal selection.</p><div class="row gap-8" style="flex-wrap:wrap;justify-content:center"><button type="button" class="btn btn--primary btn--sm" data-reset>Reset filters</button><button type="button" class="btn btn--ghost btn--sm" data-open="contact">Ask an expert</button></div></div>';
        shown = list.length ? page.length : 0;
        more.hidden = list.length <= page.length;
        moreText.textContent = 'Showing ' + page.length + ' of ' + list.length;
        moreBar.style.width = (list.length ? page.length / list.length * 100 : 0) + '%';
        grid.classList.remove('is-updating');
      };
      clearTimeout(swapTimer);
      if (animate && !first && !reduceMotion && !append) { grid.classList.add('is-updating'); swapTimer = setTimeout(paint, 220); }
      else paint();
      first = false;
      syncURL();
    }

    grid.addEventListener('click', function (ev) {
      if (!ev.target.closest('[data-reset]')) return;
      state.type = 'All'; state.tier = 'all'; state.limit = PAGE;
      Search.set({ city: '', adults: 1, children: 0 });
      render(true);
    });
    // on the saved list, removing a heart takes the card away
    favSubs.push(function () {
      if (!state.saved) return;
      setTimeout(function () { render(true); }, 260);
    });

    initSearchBar($('#page-search'), Search, function () {
      if (state.saved) { state.saved = false; state.sort = 'recommended'; }
      state.limit = PAGE;
      render(true);
      var r = $('#results');
      if (r && r.getBoundingClientRect().top > window.innerHeight * 0.6) r.scrollIntoView({ behavior: smooth() });
    });
    render(false);
  }

  function nudge(el) {
    if (!el) return;
    el.classList.remove('nudge'); void el.offsetWidth; el.classList.add('nudge');
    clearTimeout(el._nudgeT);
    el._nudgeT = setTimeout(function () { el.classList.remove('nudge'); }, 1400);
  }
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function pageApartment() {
    var a = Repo.get(params().id);
    if (!a) {
      doc.title = 'Apartment not found — Fortune House';
      $('#apt-main').innerHTML = '<div class="container"><div class="empty" style="padding:96px 16px"><div class="empty__icon">' + icon('home', 26) + '</div><h1 class="h3">This apartment is no longer available</h1><p class="muted" style="max-width:380px">It may have been booked out or removed. Have a look at similar places instead.</p><a class="btn btn--primary btn--arrow" href="search.html">Browse apartments<span class="btn__arrow">' + btnArrow() + '</span></a></div></div>';
      var simTrack = $('#similar-track');
      if (simTrack) { renderCards(simTrack, Repo.search({ sort: 'recommended' }).slice(0, 8), {}); initCarousel($('#similar')); }
      var bb = $('#book-bar'); if (bb) bb.remove();
      return;
    }
    var cityName = Repo.cityName(a.city);
    doc.title = a.title + ' — ' + cityName + ' — Fortune House';
    var md = $('meta[name="description"]');
    if (md) md.setAttribute('content', (a.text || a.title).slice(0, 155));
    var set = function (sel, html) { $$(sel).forEach(function (el) { el.innerHTML = html; }); };
    set('[data-apt="title"]', esc(a.title));
    set('[data-apt="crumb"]', esc(a.title));
    set('[data-apt="meta"]',
      (a.rating && a.reviews ? '<span class="rating">' + icon('star', 15) + a.rating.toFixed(2) + ' <span class="muted" style="font-weight:400">· ' + plural(a.reviews, 'review') + '</span></span>' : '<span class="rating">New listing</span>') +
      '<span class="row gap-8">' + icon('pin', 17) + esc(a.area) + (a.area ? ', ' : '') + esc(cityName) + '</span>' +
      '<span class="row gap-8">' + icon('home', 17) + esc(a.type) + '</span>' +
      (a.building ? '<span class="row gap-8">' + icon('building', 17) + esc(a.building) + '</span>' : ''));
    var hlBox = $('[data-apt="highlights"]');
    if (hlBox) {
      var chips = (Repo.isGuestFav(a) ? '<li class="hl hl--ink">' + icon('award', 15, 1.8) + 'Guest favourite</li>' : '') + a.highlights.map(function (k) { return hlChip(k, 15); }).join('');
      if (chips) hlBox.innerHTML = chips; else hlBox.remove();
    }
    set('[data-apt="text"]', (a.text ? '<p>' + esc(a.text) + '</p>' : '') + '<p style="margin-top:14px">Every Fortune House apartment is inspected in person before it is listed, professionally cleaned between stays and backed by our local team. Linen, towels, Wi-Fi and utilities are included in the price.</p>');
    set('[data-apt="facts"]',
      [a.beds ? [a.beds, plural(a.beds, 'Bedroom').replace(/^\d+ /, ''), 'bed'] : ['Studio', 'Layout', 'bed'],
        [a.baths, plural(a.baths, 'Bathroom').replace(/^\d+ /, ''), 'bath'], [a.guests, 'Guests max', 'users'], [a.size ? a.size + ' m²' : '—', 'Living space', 'area']].map(function (f) {
        return '<div class="fact">' + icon(f[2], 22) + '<div><div class="fact__val">' + f[0] + '</div><div class="fact__label">' + f[1] + '</div></div></div>';
      }).join(''));
    set('[data-apt="amenities"]', a.amenities.map(function (k) {
      return '<li class="amenity"><span class="amenity__icon">' + icon(k, 20) + '</span>' + esc(D.amenities[k]) + '</li>';
    }).join(''));
    set('[data-apt="where"]', (a.building ? esc(a.building) + ' · ' : '') + esc(a.area) + (a.area ? ', ' : '') + esc(cityName));
    var nearEl = $('[data-apt="near"]');
    if (nearEl) { if (a.near) nearEl.innerHTML = icon('near', 16) + '<span>' + esc(a.near) + '</span>'; else nearEl.remove(); }
    set('[data-apt="price"]', a.price ? money(a.price) : 'On request');

    // gallery
    var photos = a.photos.length ? a.photos : [''];
    var g = $('#gallery-grid');
    g.innerHTML = photos.map(function (p, i) {
      return '<button type="button" class="gallery__item media" data-open-photo="' + i + '" aria-label="Open photo ' + (i + 1) + '">' + (p ? '<img src="' + esc(Repo.photo(p, i === 0 ? 1600 : 900)) + '" alt="' + esc(a.title) + ' — photo ' + (i + 1) + '"' + (i > 2 ? ' loading="lazy"' : '') + '>' : '') + '</button>';
    }).join('');
    g.setAttribute('data-photos', Math.min(photos.length, 5));
    setupImages(g);
    var counter = $('#gallery-counter');
    var syncCounter = function () { counter.textContent = (Math.round(g.scrollLeft / Math.max(1, g.clientWidth)) + 1) + ' / ' + photos.length; };
    g.addEventListener('scroll', syncCounter, { passive: true });
    syncCounter();
    if (a.photos.length) {
      Lightbox.build(a.photos, a.title);
      g.addEventListener('click', function (ev) {
        var b = ev.target.closest('[data-open-photo]');
        if (b) Lightbox.open(+b.getAttribute('data-open-photo'));
      });
      $('#gallery-all').addEventListener('click', function () { Lightbox.open(0); });
    } else {
      $('#gallery-all').hidden = true;
    }

    // booking — its own store, seeded from the search, dates written back to the search
    var s0 = Search.get();
    var Booking = createStore({ checkin: s0.checkin, checkout: s0.checkout, adults: s0.adults, children: s0.children }, { maxGuests: function () { return a.guests; } });
    Booking.on(function (s) { Search.set({ checkin: s.checkin, checkout: s.checkout }, true); ssSet('fh-search', Search.get()); });

    var bk = $('#booking');
    var fIn = $('[data-bk="in"]', bk), fOut = $('[data-bk="out"]', bk), fG = $('[data-bk="guests"]', bk);
    var fields = $('.booking__fields', bk);
    var popDates = Pop.create('pop--cal', 'Select dates', '<div class="cal-host"></div><div class="pop__foot"><span class="cal__summary"></span><div class="row gap-8"><button type="button" class="btn btn--sm btn--ghost" data-clear>Clear</button><button type="button" class="btn btn--sm btn--primary" data-done>Done</button></div></div>');
    var twoMonths = function () { return window.innerWidth >= 900 ? 2 : 1; };
    // the calendar never closes on its own: the guest picks both dates, then presses Done
    var cal = new Calendar($('.cal-host', popDates), {
      months: twoMonths, start: Booking.get().checkin, end: Booking.get().checkout,
      onChange: function (x, y) { Booking.set({ checkin: x, checkout: y }); }
    });
    popDates._alignTo = fields;
    popDates._alignRight = true;
    popDates._onOpen = function () { popDates.classList.toggle('pop--two', twoMonths() === 2); cal.set(Booking.get().checkin, Booking.get().checkout); };
    var popG = Pop.create('', 'Who’s coming?', '<div class="pop__pad">' + guestsHTML() + '<p class="muted" style="font-size:13px;padding:10px 0 4px">This apartment hosts up to ' + plural(a.guests, 'guest') + '.</p></div><div class="pop__foot"><span class="cal__summary" data-gsum></span><button type="button" class="btn btn--sm btn--primary" data-done>Done</button></div>');
    popG._alignTo = fields;
    popG._alignRight = true;
    bindGuests(popG, Booking, function () { return a.guests; });

    var bookBtn = $('#book-btn'), bookErr = $('#book-error'), bookNote = $('#book-note');
    popDates.addEventListener('click', function (ev) {
      if (ev.target.closest('[data-clear]')) { Booking.set({ checkin: '', checkout: '' }); cal.set('', ''); }
      if (ev.target.closest('[data-done]')) {
        var s = Booking.get();
        if (s.checkin && !s.checkout) { nudge($('.cal__summary', popDates)); return; }
        if (s.checkin && s.checkout) Pop.open(popG, fG); else Pop.close();
      }
    });
    popG.addEventListener('click', function (ev) {
      if (!ev.target.closest('[data-done]')) return;
      Pop.close();
      var s = Booking.get();
      if (s.checkin && s.checkout) setTimeout(function () { nudge(bookBtn); }, 250);
    });

    fIn.addEventListener('click', function () { Pop.toggle(popDates, fIn); });
    fOut.addEventListener('click', function () { Pop.toggle(popDates, fOut); });
    fG.addEventListener('click', function () { Pop.toggle(popG, fG); });

    var cleaning = Math.round(a.price * (CFG.fees.cleaningShare || 0) / 100) * 100;
    var bd = $('#breakdown'), label = $('[data-bk-label]', bk), barSub = $('#book-bar-sub'), barBtn = $('#book-bar-btn');
    function quote(s) {
      var n = nightsBetween(s.checkin, s.checkout);
      if (!n || !a.price) return null;
      var base = a.price * n, fee = Math.round(base * (CFG.fees.serviceShare || 0));
      return { nights: n, base: base, cleaning: cleaning, fee: fee, total: base + cleaning + fee };
    }
    Booking.on(function (s) {
      var ready = !!(s.checkin && s.checkout);
      setValue($('.bk-field__value', fIn), s.checkin ? fmtDay(s.checkin) : '', 'Add date');
      setValue($('.bk-field__value', fOut), s.checkout ? fmtDay(s.checkout) : '', 'Add date');
      setValue($('.bk-field__value', fG), guestsLabel(s), '');
      $('.cal__summary', popDates).innerHTML = calSummary(s.checkin, s.checkout);
      $('[data-gsum]', popG).textContent = guestsLabel(s);
      var q = quote(s);
      if (q) {
        bd.innerHTML = '<div class="breakdown__row"><span>' + money(a.price) + ' × ' + plural(q.nights, 'night') + '</span><span>' + money(q.base) + '</span></div>' +
          (q.cleaning ? '<div class="breakdown__row"><span>Cleaning fee</span><span>' + money(q.cleaning) + '</span></div>' : '') +
          (q.fee ? '<div class="breakdown__row"><span>Service fee</span><span>' + money(q.fee) + '</span></div>' : '') +
          '<div class="breakdown__row breakdown__row--total"><span>Total</span><span>' + money(q.total) + '</span></div>';
        bd.classList.remove('is-empty');
      } else bd.classList.add('is-empty');
      label.textContent = ready ? 'Request to book' : 'Check availability';
      if (barBtn) barBtn.textContent = ready ? 'Request to book' : 'Check availability';
      if (barSub) barSub.textContent = ready ? fmtRange(s.checkin, s.checkout) + ' · ' + guestsLabel(s) : 'Add your dates';
    });

    // contact step: "Please, leave your contact information"
    var okIcon = '<div class="success__icon"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></div>';
    var REQ_TITLE = 'Please, leave your contact information';
    var req = Modal.build('book-request', {
      title: REQ_TITLE, size: 'sm',
      body: '<form class="book-form" novalidate>' +
        '<p class="modal__sub">We’ll confirm the apartment’s availability and get back to you within an hour.</p>' +
        '<div class="book-sum"><div class="book-sum__img media"><img alt=""></div><div class="book-sum__text"><span class="book-sum__title">' + esc(a.title) + '</span><span class="book-sum__meta" data-rs-meta></span></div><span class="book-sum__total" data-rs-total></span></div>' +
        '<label class="sr-only" for="rq-email">Email</label>' +
        '<div class="input-icon"><span class="input-icon__i">' + icon('mail', 20) + '</span><input class="input" id="rq-email" name="email" type="email" inputmode="email" autocomplete="email" autocapitalize="off" spellcheck="false" placeholder="example@gmail.com" required data-autofocus></div>' +
        '<p class="field-error" data-rq-err hidden>Please enter a valid email, like name@gmail.com</p>' +
        '<p class="form-error" data-rq-fail role="alert" hidden></p>' +
        '<button type="submit" class="btn btn--primary btn--block btn--arrow"><span>Send request</span><span class="btn__arrow">' + btnArrow() + '</span></button>' +
        '<p class="form-note">You won’t be charged yet. By sending, you agree to our <a href="privacy.html">Privacy Policy</a>.</p>' +
        '</form>' +
        '<div class="success" hidden>' + okIcon + '<h3 class="h3">Request sent</h3><p class="muted" data-rq-done></p><button type="button" class="btn btn--primary" data-close style="margin-top:8px">Great, thanks</button></div>'
    });
    var rqForm = $('form', req), rqEmail = $('#rq-email', req), rqErr = $('[data-rq-err]', req), rqFail = $('[data-rq-fail]', req);
    var rqSubmit = $('button[type=submit]', rqForm), rqOk = $('.success', req);
    var rqImg = $('.book-sum__img img', req);
    req._onOpen = function () {
      var s = Booking.get(), q = quote(s);
      if (!rqImg.getAttribute('src') && a.photos[0]) { rqImg.src = Repo.photo(a.photos[0], 240); setupImages(req); }
      $('[data-rs-meta]', req).textContent = fmtRange(s.checkin, s.checkout) + ' · ' + plural(nightsBetween(s.checkin, s.checkout), 'night') + ' · ' + guestsLabel(s);
      $('[data-rs-total]', req).textContent = q ? money(q.total) : '';
      var saved = lsGet('fh-contact');
      if (!rqEmail.value && saved && typeof saved.email === 'string') rqEmail.value = saved.email;
    };
    req._onClose = function () {
      rqForm.hidden = false; rqOk.hidden = true; rqErr.hidden = true; rqFail.hidden = true;
      rqEmail.classList.remove('is-invalid');
      $('.modal__title', req).textContent = REQ_TITLE;
    };
    rqEmail.addEventListener('input', function () { rqEmail.classList.remove('is-invalid'); rqErr.hidden = true; });
    rqForm.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (rqSubmit.disabled) return;
      rqFail.hidden = true;
      var email = rqEmail.value.trim();
      if (!EMAIL_RE.test(email)) {
        rqEmail.classList.add('is-invalid'); rqErr.hidden = false; nudge(rqEmail); rqEmail.focus();
        return;
      }
      var s = Booking.get(), q = quote(s);
      if (!(s.checkin && s.checkout)) { Modal.close(); return; }
      setLoading(rqSubmit, true);
      Api.send('booking', {
        apartment: a.id, title: a.title, city: a.city, checkin: s.checkin, checkout: s.checkout, adults: s.adults, children: s.children,
        nights: nightsBetween(s.checkin, s.checkout), total: q ? q.total : null, currency: CFG.currency || 'THB', email: email
      }).then(function () {
        lsSet('fh-contact', { email: email });
        $('[data-rq-done]', req).innerHTML = 'We’re checking ' + esc(a.title) + ' for <b class="nowrap">' + esc(fmtRange(s.checkin, s.checkout)) + '</b> and will reply to <b>' + esc(email) + '</b> within an hour. Nothing is charged until you confirm.';
        $('.modal__title', req).textContent = 'Thank you!';
        rqForm.hidden = true; rqOk.hidden = false;
        if (bookNote) bookNote.textContent = 'Request sent — we’ll reply to ' + email;
      }, function () {
        rqFail.textContent = 'We couldn’t send your request. Please try again or message us on WhatsApp.';
        rqFail.hidden = false;
      }).then(function () { setLoading(rqSubmit, false); });
    });

    function startBooking() {
      var s = Booking.get();
      if (bookErr) bookErr.hidden = true;
      if (!(s.checkin && s.checkout)) { Pop.open(popDates, fIn); return; }
      Modal.open(req);
    }
    bookBtn.addEventListener('click', startBooking);

    // mobile bottom bar: same flow as the booking card
    var bar = $('#book-bar');
    if (bar && 'IntersectionObserver' in window) {
      var bkVisible = false, pastGallery = false;
      var sync = function () { bar.classList.toggle('is-visible', pastGallery && !bkVisible); };
      new IntersectionObserver(function (e) { bkVisible = e[0].isIntersecting; sync(); }, { threshold: 0.15 }).observe(bk);
      new IntersectionObserver(function (e) { pastGallery = !e[0].isIntersecting && e[0].boundingClientRect.top < 0; sync(); }).observe($('#gallery'));
    }
    if (barBtn) barBtn.addEventListener('click', function () {
      var s = Booking.get();
      if (mqMobile.matches || (s.checkin && s.checkout)) { startBooking(); return; }
      // tablets: the date picker opens next to the booking card, so bring it into view first
      bk.scrollIntoView({ behavior: smooth(), block: 'center' });
      setTimeout(startBooking, reduceMotion ? 0 : 520);
    });

    $('#share-btn').addEventListener('click', function () {
      if (navigator.share) { navigator.share({ title: a.title, url: location.href }).catch(function () {}); return; }
      var ok = function () { toast('Link copied'); };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(location.href).then(ok, ok); else ok();
    });
    var save = $('#save-btn');
    save.setAttribute('data-fav', a.id);
    save.setAttribute('aria-pressed', favs.indexOf(a.id) > -1 ? 'true' : 'false');

    // similar: same city first, then the same budget, best rated first
    var sim = Repo.search({ exclude: a.id, sort: 'recommended' }).sort(function (x, y) {
      return ((y.city === a.city) * 2 + (y.tier === a.tier)) - ((x.city === a.city) * 2 + (x.tier === a.tier));
    }).slice(0, 8);
    renderCards($('#similar-track'), sim, {});
    initCarousel($('#similar'));
  }

  function pageInvestors() {
    var calc = $('#calc');
    if (!calc) return;
    var r = { price: $('#r-price', calc), rate: $('#r-rate', calc), occ: $('#r-occ', calc) };
    var shown = { gross: 0, net: 0, costs: 0, yield: 0 };
    var raf;
    function fill(input) { input.style.setProperty('--p', ((input.value - input.min) / (input.max - input.min) * 100) + '%'); }
    function compute() {
      var price = +r.price.value, rate = +r.rate.value, occ = +r.occ.value / 100;
      $('#v-price').textContent = usd(price);
      $('#v-rate').textContent = usd(rate);
      $('#v-occ').textContent = Math.round(occ * 100) + '%';
      Object.keys(r).forEach(function (k) { fill(r[k]); });
      var gross = rate * 365 * occ, costs = gross * 0.3, net = gross - costs;
      var target = { gross: gross, net: net, costs: costs, yield: price ? net / price * 100 : 0 };
      var from = { gross: shown.gross, net: shown.net, costs: shown.costs, yield: shown.yield };
      var t0 = null;
      cancelAnimationFrame(raf);
      (function frame(t) {
        if (!t0) t0 = t;
        var p = reduceMotion ? 1 : Math.min(1, (t - t0) / 450), e = 1 - Math.pow(1 - p, 3);
        for (var k in target) shown[k] = from[k] + (target[k] - from[k]) * e;
        $('#o-net').textContent = usd(shown.net);
        $('#o-gross').textContent = usd(shown.gross);
        $('#o-costs').textContent = '−' + usd(shown.costs);
        $('#o-yield').textContent = shown.yield.toFixed(1) + '%';
        if (p < 1) raf = requestAnimationFrame(frame);
      })(performance.now());
    }
    Object.keys(r).forEach(function (k) { r[k].addEventListener('input', compute); });
    compute();
  }

  function initFAQ() {
    $$('.faq__item').forEach(function (item) {
      var q = $('.faq__q', item);
      q.addEventListener('click', function () {
        var open = !item.classList.contains('is-open');
        $$('.faq__item.is-open', item.parentNode).forEach(function (o) { if (o !== item) { o.classList.remove('is-open'); $('.faq__q', o).setAttribute('aria-expanded', 'false'); } });
        item.classList.toggle('is-open', open);
        q.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
  }

  /* ================================================================== */
  /* Boot                                                                */
  /* ================================================================== */

  function boot() {
    hydrateIcons(doc);
    initHeader();
    initTransitions();
    initFAQ();
    Pop.init();
    initCards();

    var y = $('#year');
    if (y) y.textContent = new Date().getFullYear();
    $$('[data-to-top]').forEach(function (b) { b.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: smooth() }); }); });

    Repo.load().then(function () {
      Search = createStore({ city: '', checkin: '', checkout: '', adults: 2, children: 0 }, { persist: 'fh-search' });
      // forget saved apartments that are no longer listed
      var live = favs.filter(function (id) { return Repo.get(id); });
      if (live.length !== favs.length && Repo.all().length) { favs.length = 0; live.forEach(function (id) { favs.push(id); }); lsSet('fh-favs', favs); }
      syncFavCount(false);
      setupImages(doc);
      buildFinder();
      var request = buildRequest();

      doc.addEventListener('click', function (ev) {
        var t = ev.target.closest('[data-open]');
        if (!t) return;
        ev.preventDefault();
        var id = t.getAttribute('data-open');
        if (id === 'contact') {
          request._config(
            t.getAttribute('data-kind') || 'selection',
            t.getAttribute('data-title') || 'Get a personal selection',
            t.getAttribute('data-sub') || 'Leave your contact and we’ll send 3–5 apartments that match your dates and budget — usually within an hour.',
            t.getAttribute('data-submit') || 'Send request');
          Modal.open(request);
        } else Modal.open(id);
      });

      var page = doc.body.getAttribute('data-page');
      try {
        if (page === 'home') pageHome();
        if (page === 'search') pageSearch();
        if (page === 'apartment') pageApartment();
        if (page === 'investors') pageInvestors();
      } catch (e) {
        if (window.console) console.error('[Fortune House] page init failed:', e);
      }
      initReveal(doc);
    });
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot); else boot();
})();

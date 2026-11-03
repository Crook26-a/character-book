// Service worker: caches the whole app so it opens instantly, even offline.
const CACHE = "character-book-v37";
// the shop's pixel font, kept from its first load on (a cache of its own, so a new version doesn't throw it away)
const FONTS = "character-book-fonts";
const ASSETS = ["./", "./index.html", "./srd.js", "./qrcode.min.js", "./rules.js", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-512-maskable.png",
  "./pictures/auspicious-cart-1.png", "./pictures/auspicious-cart-2.png", "./pictures/auspicious-cart-3.png"];

self.addEventListener("install", e => {
  // Fetch each asset with cache:"reload" so a new version never re-caches a stale
  // index.html out of the browser's HTTP cache.
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== FONTS).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", e => {
  if (/^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(e.request.url)) {
    e.respondWith(caches.open(FONTS).then(c => c.match(e.request).then(r => r || fetch(e.request).then(res => { if (res.ok || res.type === "opaque") c.put(e.request, res.clone()); return res; }))));
    return;
  }
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request)));
});

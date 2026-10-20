// Network-first so updates show up right away; falls back to cache when offline.
const CACHE = 'elsas-castle-v17';
const FILES = ['./', 'index.html', 'style.css', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png',
  'src/main.js', 'src/art.js', 'src/cast.js', 'src/audio.js', 'src/wardrobe.js', 'src/teeth.js', 'src/kitchen.js', 'src/cakeart.js', 'src/stickers.js', 'src/lakeart.js', 'src/tripkit.js', 'src/trips.js', 'src/forest.js', 'src/garden.js', 'src/skypaint.js', 'src/bridge.js', 'src/treasure.js', 'src/freeride.js', 'src/sky.js', 'src/party.js', 'src/photos.js', 'src/stable.js', 'src/stableart.js'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then((r) => {
      const copy = r.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy));
      return r;
    }).catch(() => caches.match(e.request))
  );
});

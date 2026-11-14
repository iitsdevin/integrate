// Offline support for Integrate.
// Install: every built file (scripts, styles, fonts, the PDF reader) is fetched and
// cached up front, so the app works offline from the very first visit — including
// parts that have not been opened yet. The list is written in at build time.
// Pages: network first, so updates arrive when online; the cached copy when offline.
// Built assets have hashed names, so a cached copy never goes stale.
const ASSETS = /*__PRECACHE__*/[];
const VERSION = /*__VERSION__*/'dev';
const CACHE = 'integrate-' + VERSION;
const SHELL = ['./', './manifest.webmanifest', './icons/icon-192.png', './icons/apple-touch-icon.png', './icons/unalome.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(SHELL).then(() => Promise.all(ASSETS.map((u) => c.add(u).catch(() => {}))))) // one missing file must not block the rest
      .then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // the API and links go straight to the network

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put('./', copy)); return res; })
        .catch(() => caches.match('./').then((r) => r || caches.match(req)))
    );
    return;
  }
  e.respondWith(
    // ignoreVary: the copy cached at install was requested by the worker, whose headers
    // differ from a page's; the file name is hashed, so any copy of it is the right one.
    caches.match(req, { ignoreVary: true }).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }))
  );
});

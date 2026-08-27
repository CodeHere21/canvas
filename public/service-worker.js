/* Canvas service worker — enables PWA install + light offline caching.
   Registered only in production (see src/index.tsx). */
const CACHE = 'canvas-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(['/', '/index.html']))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // Never cache API/auth calls — always hit the network (fresh, auth-sensitive).
  if (sameOrigin && (url.pathname.startsWith('/api') || url.pathname.startsWith('/auth'))) {
    return;
  }

  // Page navigations: network-first so HTML is always fresh; fall back to the
  // cached shell when offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('/index.html').then((r) => r || caches.match('/')))
    );
    return;
  }

  // Same-origin static assets (JS/CSS/icons): cache-first, then network.
  if (sameOrigin) {
    event.respondWith(
      caches.match(req).then((cached) =>
        cached ||
        fetch(req).then((res) => {
          if (res.ok && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
      )
    );
  }
  // Cross-origin (e.g. Cloudinary images): let the browser fetch normally.
});

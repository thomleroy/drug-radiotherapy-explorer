/* Radiosync service worker
 *
 * Strategy:
 *  - Pre-cache the app shell on install (best-effort, gracefully degrades).
 *  - Network-first for navigation requests so users always get the
 *    freshest HTML when online; falls back to the cached shell offline.
 *  - Cache-first with background revalidation for static assets
 *    (JS / CSS / fonts / images) so the app keeps loading without a
 *    network connection. The data is bundled into the JS, so once the
 *    main chunk is cached the entire drug catalog is available offline.
 *
 * Versioning: bump CACHE_VERSION whenever the cached asset list changes;
 * the activate handler purges any caches that don't match.
 */

const CACHE_VERSION = 'radiosync-v1';
const APP_SHELL = ['./', './index.html', './manifest.json', './favicon.ico'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL).catch(() => undefined))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

const isStaticAsset = (request) => {
  const url = new URL(request.url);
  return /\.(?:js|css|woff2?|png|jpe?g|svg|ico|webp)$/.test(url.pathname);
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // Skip cross-origin (Vercel analytics, fonts CDNs, etc.)
  if (new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  if (isStaticAsset(request)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then((response) => {
            if (response && response.status === 200 && response.type === 'basic') {
              const copy = response.clone();
              caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
            }
            return response;
          })
          .catch(() => cached);
        return cached || networkFetch;
      })
    );
  }
});

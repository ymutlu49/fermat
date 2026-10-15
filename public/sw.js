// ─── FerMat — Service Worker v7 ───────────────────────────────────────────────
// v6: the website lives at /, the app at /app/.
// v7 (2026-10-15): seslendirme önceden üretilmiş Kurmancî seslere geçti. Eski sürüm
// Türkçe tarayıcı sesiyle harf harf okuyordu; etkinleşince bütün eski önbellekler
// silinir ve açık sayfalar bir kez yeniden yüklenir — eski kod hiçbir cihazda kalmaz.
const CACHE_NAME = 'ferhenga-v7';
const PRECACHE_URLS = [
  './',
  './index.html',
  './app/',
  './app/index.html',
  './manifest.json',
  './favicon.svg',
  './icon-192.png',
  './icon-512.png',
];

// Install: precache shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Activate: clean old caches, then reload open pages once so they run the new code
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    const eski = keys.filter(k => k !== CACHE_NAME);
    await Promise.all(eski.map(k => caches.delete(k)));
    await self.clients.claim();
    if (eski.length) {
      const pencereler = await self.clients.matchAll({ type: 'window' });
      for (const p of pencereler) {
        try { await p.navigate(p.url); } catch (e) { /* yeniden yüklenemeyen pencere: sonraki açılışta yenisi gelir */ }
      }
    }
  })());
});

// Fetch: network-first for navigation, stale-while-revalidate for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Downloads (the APK) always come from the network and are never cached
  if (new URL(request.url).pathname.startsWith('/dl/')) return;

  // Navigation requests: network first, fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(async () => {
          // Offline: the page itself if cached, otherwise the matching shell
          const cached = await caches.match(request);
          if (cached) return cached;
          const isApp = new URL(request.url).pathname.startsWith('/app');
          return caches.match(isApp ? './app/index.html' : './index.html');
        })
    );
    return;
  }

  // Hashed assets (Vite default produces 8+ hex chars in filename): cache-first (immutable)
  if (request.url.match(/\/assets\/.*-[A-Za-z0-9_-]{6,}\./)) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        });
      })
    );
    return;
  }

  // Other static assets: stale-while-revalidate
  if (request.url.match(/\.(js|css|png|jpg|svg|woff2?|ico)$/)) {
    event.respondWith(
      caches.match(request).then(cached => {
        const fetchPromise = fetch(request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        }).catch(() => cached);

        return cached || fetchPromise;
      })
    );
    return;
  }

  // Other requests: network with cache fallback
  event.respondWith(
    fetch(request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        return response;
      })
      .catch(() => caches.match(request))
  );
});

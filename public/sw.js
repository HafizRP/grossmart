/**
 * Grossmart PWA Service Worker (v1.0.0)
 * Toko Kelontong Mandiri - Offline-first caching for retail reliability
 */

const CACHE_NAME = 'grossmart-static-v1';
const DYNAMIC_CACHE = 'grossmart-dynamic-v1';

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-192.png',
  '/icons/icon-maskable-512.png',
  '/sounds/beep.wav',
  '/sounds/error.wav',
  '/sounds/chime.wav'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== DYNAMIC_CACHE) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Jangan cache non-GET dan request API non-idempotent
  if (req.method !== 'GET') {
    return;
  }

  // Permintaan static assets (icons, sounds, css, js, fonts) -> Cache first, fallback to network
  if (
    url.pathname.startsWith('/build/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/sounds/') ||
    url.pathname === '/manifest.json' ||
    url.pathname.match(/\.(css|js|woff2?|png|jpg|jpeg|svg|ico)$/)
  ) {
    event.respondWith(
      caches.match(req).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(req).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, responseToCache);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Navigasi HTML & inertia page -> Network first, fallback to cached HTML
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(req, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          if (cached) return cached;
          const fallback = await caches.match('/');
          return fallback || new Response(
            '<div style="font-family: sans-serif; text-align: center; padding: 40px;"><h2>Grossmart Offline</h2><p>Koneksi internet terputus. Silakan hubungkan kembali ke Wi-Fi toko.</p></div>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // Request lainnya -> Network with cache fallback
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});

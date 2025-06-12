const CACHE_NAME = 'gps-speed-tracker-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './icons/icon-512x512.maskable.png',
  './main.css',
  './main.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  const whitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => !whitelist.includes(key) ? caches.delete(key) : null)
    ))
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Cache-first strategy for tile requests (OpenStreetMap)
  if (url.origin.includes('tile.openstreetmap.org') ||
      url.pathname.match(/\.png$/)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(event.request).then(resp =>
          resp || fetch(event.request).then(fetched => {
            cache.put(event.request, fetched.clone());
            return fetched;
          })
        )
      )
    );
    return;
  }

  // Default network-first fallback
  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(event.request)
    )
  );
});

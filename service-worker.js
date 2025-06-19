const cacheName = 'bill-calendar-cache-v1';
const filesToCache = [
  '/',
  '/index.html',
  '/script.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.17/index.global.min.css',
  'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.17/index.global.min.js'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});

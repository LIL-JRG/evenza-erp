// Basic service worker to prevent 404 errors
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated.');
});

self.addEventListener('fetch', (event) => {
  // Basic fetch handler - just pass through
  event.respondWith(fetch(event.request));
});
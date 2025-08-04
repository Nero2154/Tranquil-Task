// A basic service worker for PWA capabilities

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  // Pre-cache app shell, if needed
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Basic fetch handler, can be expanded for offline strategies
  event.respondWith(fetch(event.request));
});

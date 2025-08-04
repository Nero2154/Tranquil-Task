self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
});

self.addEventListener('fetch', (event) => {
  // We are not caching anything in this version of the service worker
});

self.addEventListener('push', event => {
  const data = event.data.json();
  const title = data.title;
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

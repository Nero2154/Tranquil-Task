const CACHE_NAME = 'tranquil-task-cache-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/tranquil_icon.png',
  '/sounds/classic.mp3',
  '/sounds/digital.mp3',
  '/sounds/chime.mp3',
  // Next.js build output paths - these might need adjustment based on your build
  '/_next/static/css/',
  '/_next/static/chunks/',
  '/_next/static/webpack/',
  // Google Fonts
  'https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap',
  'https://fonts.gstatic.com/s/ptsans/v17/jizaRExUiTo99u79D0-ExdGM.woff2',
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache).catch(error => {
          console.error('Failed to cache urls:', error);
        });
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});


self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request because it's a one-time-use stream
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              if (response && response.type === 'opaque') {
                 // Don't cache opaque responses (e.g., from CDNs without CORS)
              } else {
                 return response;
              }
            }
            
            if (event.request.url.startsWith('https://fonts.gstatic.com')) {
               const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, responseToCache);
                  });
            }


            return response;
          }
        );
      })
    );
});


self.addEventListener('notificationclick', event => {
  event.notification.close();
  // Future: Implement snooze/dismiss from notification
});

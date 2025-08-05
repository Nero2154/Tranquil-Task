// A basic service worker for PWA functionality
const CACHE_NAME = 'tranquil-task-cache-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/sounds/classic.mp3',
  '/sounds/digital.mp3',
  '/sounds/chime.mp3',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

self.addEventListener('notificationclick', (event) => {
    const notification = event.notification;
    const action = event.action;
    const alarmId = notification.data.alarmId;

    if (action === 'dismiss') {
        // The notification is closed automatically.
        // If we needed to stop a sound, we would message the client.
    } else if (action && action.startsWith('snooze-')) {
        const minutes = parseInt(action.split('-')[1], 10);
        
        // You can't directly call application logic like `handleSnooze` from here.
        // You would typically send a message to the active client(s) to handle it.
        // Or re-schedule a new notification from the service worker itself.
        
        const snoozeTime = new Date().getTime() + minutes * 60 * 1000;
        
        // Re-schedule the notification
        self.registration.showNotification('Snoozed: ' + notification.body, {
            ...notification,
            tag: alarmId + '-snoozed',
            showTrigger: new self.TimestampTrigger(snoozeTime),
        });

    }

    notification.close();

    // Focus the app window if it's open
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            for (const client of clientList) {
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

self.addEventListener('push', event => {
  const data = event.data.json();
  const { title, body, icon, tag, data: notificationData, actions } = data;
  
  const options = {
    body: body,
    icon: icon,
    tag: tag,
    data: notificationData,
    actions: actions,
    requireInteraction: true,
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

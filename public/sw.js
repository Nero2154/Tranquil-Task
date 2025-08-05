// A simple service worker for background notifications

self.addEventListener('install', event => {
  console.log('Service Worker installing.');
  self.skipWaiting(); // Activate worker immediately
});

self.addEventListener('activate', event => {
  console.log('Service Worker activating.');
  event.waitUntil(self.clients.claim()); // Become available to all pages
});

self.addEventListener('notificationclick', event => {
  const notification = event.notification;
  const action = event.action;
  const alarmId = notification.data ? notification.data.alarmId : null;

  console.log(`Notification clicked. Action: ${action}, Alarm ID: ${alarmId}`);

  if (action === 'dismiss') {
    // Just close the notification
  } else if (action && action.startsWith('snooze-')) {
    const minutes = parseInt(action.split('-')[1], 10);
    console.log(`Snoozing for ${minutes} minutes.`);
    // Here you would typically reschedule the notification.
    // This is complex without a server, as the SW might be terminated.
    // For now, we just close it. A more robust solution would involve push messages.
  }

  notification.close();

  // Optional: Focus the app window if it's open
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return clients.openWindow('/');
    })
  );
});


self.addEventListener('push', event => {
    // This event is triggered when a push message is received from a server.
    // We are using local notifications for now, but this is where you'd handle server pushes.
    console.log('Push event received.', event);

    if (event.data) {
        const data = event.data.json();
        const title = data.title || 'Tranquil Task';
        const options = {
            body: data.body,
            icon: data.icon || '/icons/icon-192x192.png',
            badge: '/icons/icon-96x96.png',
            ...data
        };
        event.waitUntil(self.registration.showNotification(title, options));
    }
});

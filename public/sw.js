
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const alarmId = event.notification.data?.alarmId;

  if (event.action === 'dismiss') {
    // The main app will handle the state logic
  } else if (event.action === 'snooze') {
    // This is a simplified snooze. For a real app, you might want
    // to schedule a new notification from the service worker.
    // For now, we'll rely on the app being open to handle the snooze logic
    // which includes the AI joke.
  }

  // Focus the app window
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

self.addEventListener('push', (event) => {
    const data = event.data.json();
    self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon,
    });
});

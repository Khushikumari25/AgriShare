// sw.js — Service Worker for Push Notifications
// HELPINGFARMERS folder ke ROOT mein save karo (index.html ke saath)

self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title   = data.title   || '🌾 AgriShare';
  const options = {
    body:    data.body    || 'Aapke liye nayi notification!',
    icon:    data.icon    || '/favicon.ico',
    badge:   '/favicon.ico',
    vibrate: [200, 100, 200],
    data:    { url: data.url || '/' },
    actions: [
      { action: 'view',    title: '👀 Dekho' },
      { action: 'dismiss', title: '✕ Band karo' }
    ]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  if (event.action === 'dismiss') return;
  const url = event.notification.data?.url || '/';
  event.waitUntil(clients.openWindow(url));
});
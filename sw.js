self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(fetch(e.request).catch(() => new Response('App ist offline')));
});

self.addEventListener('push', function(e) {
  const data = e.data ? e.data.json() : { title: 'Dex Messager', body: 'Neue Nachricht' };
  const isCall = data.title.includes('Anruf');
  const options = {
    body: data.body,
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    vibrate: isCall ? [500, 200, 500, 200, 500, 200, 500, 200, 500] : [100, 50, 100],
    requireInteraction: isCall // Sorgt dafür, dass die Meldung fest auf dem Sperrbildschirm bleibt!
  };
  e.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
    if (windowClients.length > 0) {
      return windowClients[0].focus(); // Holt die App in den Vordergrund, wenn sie im Hintergrund offen ist!
    } else {
      return clients.openWindow('./'); // Öffnet den korrekten GitHub-Pages Pfad statt der 404-Seite!
    }
  }));
});

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  e.respondWith(fetch(e.request).catch(() => new Response('App ist offline')));
});

self.addEventListener('push', (e) => {
  let data = { title: 'Dex Messager', body: 'Neue Nachricht' };

  try {
    if (e.data) data = e.data.json();
  } catch (err) {
    data = { title: 'Dex Messager', body: e.data ? e.data.text() : 'Neue Nachricht' };
  }

  const title = data.title || 'Dex Messager';
  const body = data.body || 'Neue Nachricht';
  const isCall = title.includes('Anruf') || body.includes('ruft');
  const options = {
    body,
    icon: 'icon.svg',
    badge: 'icon.svg',
    vibrate: isCall ? [500, 200, 500, 200, 500, 200, 500, 200, 500] : [100, 50, 100],
    requireInteraction: isCall,
    tag: isCall ? 'incoming-call' : 'new-msg',
    renotify: isCall,
    timestamp: Date.now(),
    silent: false,
    data: { url: data.url || self.registration.scope },
    actions: isCall
      ? [{ action: 'open', title: 'Öffnen' }]
      : [{ action: 'open', title: 'Antworten' }]
  };

  e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const targetUrl = e.notification.data && e.notification.data.url
    ? e.notification.data.url
    : self.registration.scope;

  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
    if (windowClients.length > 0) {
      return windowClients[0].focus();
    }

    return clients.openWindow(targetUrl);
  }));
});

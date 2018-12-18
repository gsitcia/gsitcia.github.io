self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

  const title = 'Push Success';
  const options = {
    body: event.data.text()
  };

  console.log(event);
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('install', e => {
  e.waitUntil(async function() {
    if (!e.clientId) return;

    const client = await clients.get(e.clientId);
    if (!client) return;

    client.postMessage({msg:'Started!'});
  });
});

/*
self.addEventListener('message', function(m) {
  e.waitUntil(self.registration.showNotification('asdf'));
});/**/

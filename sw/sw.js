self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

  const title = 'Push Success';
  const options = {
    body: event.data.text()
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
/*
self.addEventListener('install', function(e) {
  e.waitUntil(self.registration.showNotification('Notification is set up!'));
});

/*
self.addEventListener('message', function(m) {
  e.waitUntil(self.registration.showNotification('asdf'));
});/**/

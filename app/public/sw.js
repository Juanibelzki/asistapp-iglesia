self.addEventListener('install', (event) => {
  event.waitUntil(caches.open('asistapp-v1').then((cache) => {
    return cache.addAll(['/', '/login', '/dashboard', '/ninos', '/eventos']);
  }));
});

self.addEventListener('fetch', (event) => {
  event.respondWith(caches.match(event.request).then((response) => {
    return response || fetch(event.request);
  }));
});

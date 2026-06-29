const CACHE_NAME = 'mbfm-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Installatie van de Service Worker
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activeren en oude caches opruimen
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Slimme fetch: Dropbox MP3-bestanden NOOIT cachen, maar direct streamen.
// Dit voorkomt dat het besturingssysteem de stream stopt in stand-by!
self.addEventListener('fetch', (e) => {
  const url = e.request.url;
  
  if (url.includes('dropbox.com') || url.includes('.mp3')) {
    e.respondWith(fetch(e.request));
  } else {
    e.respondWith(
      caches.match(e.request).then((cachedResponse) => {
        return cachedResponse || fetch(e.request);
      })
    );
  }
});
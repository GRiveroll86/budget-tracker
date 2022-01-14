const CACHE_NAME = "budget-cache-v1";
const DATA_CACHE_NAME = "budget-data-cache-v1";
const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/style.css",
    "/index.js",
    "/db.js",
    "/manifest.webmanifest",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
    "/service-worker.js"
];
  
self.addEventListener("install", function (event) {
    event.waitUntil(caches.open(DATA_CACHE_NAME)
      .then((cache) => cache.add("/api/transaction"))
      .catch(err => console.error(err))
    );

    event.waitUntil(caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(FILES_TO_CACHE))
      .catch(err => console.error(err))
    );

    self.skipWaiting();
});

// self.addEventListener('install', (event) => {
//   event.waitUntil(caches.open(DATA_CACHE_NAME)
//       .then((cache) => cache.addAll(FILES_TO_CACHE))
//       .then(self.skipWaiting())
//   );
// });

self.addEventListener("activate", event => {
    const currentCaches = [CACHE_NAME, DATA_CACHE_NAME];
    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) => {
                return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
            })
            .then((cachesToDelete) => {
                return Promise.all(
                    cachesToDelete.map(cacheToDelete => {
                        return caches.delete(cacheToDelete);
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    if (event.request.url.includes("/api/transaction")) {
      event.respondWith(
        caches.open(DATA_CACHE_NAME).then(cache => {
          return fetch(event.request)
            .then(response => {
              cache.put(event.request, response.clone());
              return response;
            })
            .catch(() => caches.match(event.request));
        })
      );
      return;
    }



  });
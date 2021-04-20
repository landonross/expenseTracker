const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/style.css",
    "/index.js",
    "/app.js",
    "/manifest.webmanifest.json",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
  ];

  const CACHE_NAME = "static-cache-v2";

  // install
  self.addEventListener("install", function (evt) {
    evt.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        return cache.addAll(FILES_TO_CACHE);
      })
    );
  
    self.skipWaiting();
  });
  
  // activate
  self.addEventListener("activate", function (evt) {
    evt.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== CACHE_NAME) {
              console.log('Removing old cache data', key);
              return caches.delete(key);
  
            }
          })
        );
      })
    );
    self.clients.claim();
  })
  
  // fetch
  self.addEventListener("fetch", function (evt) {
    // cache successful requests to the API
    if (evt.request.url.includes("/api/")) {
      console.log("requested URL:  " + evt.request.url);
      evt.respondWith(
        caches.open(CACHE_NAME).then(response => {
          //   return fetch(evt.request)
          if (response.status === 200) {
            cache.put(evt.request.url, response.clone());
            return request
          } else {
            return fetch(evt.request)
          }
        })
          .catch(err => {
            console.log("catch Fail:   " + err)
            // Network request failed, try to get it from the cache.
            return caches.match(evt.request);
          })
      )
      return;
    }
  
  
    // if the request is not for the API, serve static assets using "offline-first" approach.
    evt.respondWith(
      caches.match(evt.request).then(function (response) {
        return response || fetch(evt.request);
      })
    );
  
  })
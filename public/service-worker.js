const CACHE_NAME = "my-site-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";
const FILES_TO_CACHE = [
  "/",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/db.js",
  "/index.html",
  "/index.js",
  "/manifest.webmanifest.json",
  "/style.css",
];


// install
self.addEventListener("install", function (evt) {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  // self.skipWaiting();
});

// activate
// self.addEventListener("activate", function (evt) {
//   evt.waitUntil(
//     caches.keys().then(keyList => {
//       return Promise.all(
//         keyList.map(key => {
//           if (key !== CACHE_NAME) {
//             console.log('Removing old cache data', key);
//             return caches.delete(key);

//           }
//         })
//       );
//     })
//   );
//   self.clients.claim();
// })

// fetch
self.addEventListener("fetch", function (evt) {
  // cache successful requests to the API
  if (evt.request.url.includes("/api/")) {
    console.log("requested URL:  " + evt.request.url);
    evt.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(evt.request)
          .then(response => {
            if (response.status === 200) {
              cache.put(evt.request.url, response.clone());
              // return response
            }
            return response
          })
          .catch(err => {
            console.log("catch Fail:   " + err)
            // Network request failed, try to get it from the cache.
            return cache.match(evt.request);
          })
      }).catch(err => {
        console.log(err);
      })
    )
    return;
  }


  // if the request is not for the API, serve static assets using "offline-first" approach.
  evt.respondWith(
    fetch(evt.request).catch(function () {
      return caches.match(evt.request).then(function (response) {
        if (response) {
          return (response)
        } else if (evt.request.headers.get("accept").includes("text/html")) {
          return caches.match("/")
        }
      })
    })
  );

})
const cacheName = 'VegNab-v0.01';
const appShellFiles = [
//  '/vegnab-webapp/',
  '../index.html',
  '../main.js',
  '../regions.js',
  '../bootstrap.bundle.min.js',
  '../main.css',
  '../bootstrap.min.css',
  '../bootstrap.min.css.map',
  '../bootstrap-glyphicons.css',
  '../nrcs_spp.txt',
  '../favicon_io/android-chrome-192x192.png',
  '../favicon_io/android-chrome-512x512.png',
  '../favicon_io/apple-touch-icon.png',
  '../favicon_io/favicon.ico',
  '../favicon_io/favicon-16x16.png',
  '../favicon_io/favicon-32x32.png',
  '../favicon_io/site.webmanifest',
];
// the sw.js file itself does not go in the cache
// in case there are extra files to cache
const extraFiles = []; // reserve space
const contentToCache = appShellFiles.concat(extraFiles);

// install Service Worker
self.addEventListener('install', (e) => {
  console.log('[Service Worker install] Begin install');
  e.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    console.log('[Service Worker install] Caching content');
    await cache.addAll(contentToCache);
  })());
});

// fetch content using Service Worker
// self.addEventListener('fetch', (e) => {
//   e.respondWith((async () => {
//     const r = await caches.match(e.request);
//     console.log(`[Service Worker fetch] Fetching resource: ${e.request.url}`);
//     if (r) return r;
//     const response = await fetch(e.request);
//     const cache = await caches.open(cacheName);
//     console.log(`[Service Worker fetch] Caching new resource: ${e.request.url}`);
//     cache.put(e.request, response.clone());
//     return response;
//   })());
// });

self.addEventListener('fetch', (e) => {
  console.log('Handling fetch event for', e.request.url);

  e.respondWith(
    caches.open(cacheName).then((cache) => {
      return cache.match(e.request).then((response) => {
        if (response) {
          // If there is an entry in the cache for event.request, then response
          // will be defined and we can just return it.
          console.log(' Found response in cache:', response);
          return response;
        }

        // Otherwise, if there is no entry in the cache for event.request,
        // response will be undefined, and we need to fetch() the resource.
        console.log(' No response for %s found in cache. About to fetch ' +
          'from network…', e.request.url);

        // We call .clone() on the request since we might use it in a call to
        // cache.put() later on. Both fetch() and cache.put() "consume" the
        // request, so we need to make a copy.
        // (see https://developer.mozilla.org/en-US/docs/Web/API/Request/clone)
        return fetch(e.request.clone()).then((response) => {
          console.log('  Response for %s from network is: %O',
            e.request.url, response);

          if (response.status < 400) {
            // This avoids caching responses that we know are errors
            //(i.e. HTTP status code of 4xx or 5xx).
            console.log('  Caching the response to', e.request.url);
            // We call .clone() on the response to save a copy of it to the
            // cache. By doing so, we get to keep the original response object
            // which we will return back to the controlled page.
            // (see https://developer.mozilla.org/en-US/docs/Web/API/Request/clone)
            cache.put(e.request, response.clone());
          } else {
            console.log('  Not caching the response to', e.request.url);
          }

          // Return the original response object, which will be used to fulfill the resource request.
          return response;
        });
      }).catch((error) => {
        // This catch() will handle exceptions that arise from the match() or fetch() operations.
        // Note that a HTTP error response (e.g. 404) will NOT trigger an exception.
        // It will return a normal response object that has the appropriate error code set.
        console.error('  Error in fetch handler:', error);

        throw error;
      });
    })
  );
});

// cleanup on version change
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keyList) => {
    return Promise.all(keyList.map((key) => {
      if (key === cacheName) { return; }
      console.log(`[Service Worker activate] deleting key: ${key}`);
      return caches.delete(key);
    }));
  }));
});

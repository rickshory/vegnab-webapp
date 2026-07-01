
const APP_PREFIX = 'VegNab' 
const APP_VERSION = 'v0.34'
const CACHE_NAME = APP_PREFIX + "_" + APP_VERSION

console.log('[SW] Loaded. Version:', APP_VERSION);

// Install event — forces immediate activation
self.addEventListener('install', event => {
  console.log('[SW] Install event');
  self.skipWaiting(); // Activate immediately after install
});

// Activate event — takes control of all clients
self.addEventListener('activate', event => {
  console.log('[SW] Activate event');
  event.waitUntil(self.clients.claim()); // Take control without waiting
});

// Handle messages from the main app
self.addEventListener('message', event => {
  console.log('[SW] Message received:', event.data);

  if (event.data?.type === 'GET_APP_VERSION') {
    console.log('[SW] About to post message:'
      , "type: 'APP_VERSION_RESPONSE'", "version: " + APP_VERSION);
    event.source.postMessage({
      type: 'APP_VERSION_RESPONSE',
      version: APP_VERSION
    });
    console.log('[SW] Message posted:'
      , "type: 'APP_VERSION_RESPONSE'", "version: " + APP_VERSION);
  }

  // Add more message handlers here
});
// const appRoot = '/vegnab-webapp';
const appShellFiles = [
//  '/vegnab-webapp/',
  'index.html',
  'nrcs_spp.js',
  'main.js',
  'regions.js',
  'bootstrap.bundle.min.js',
  'bootstrap.bundle.min.js.map',
  'main.css',
  'bootstrap.min.css',
  'bootstrap.min.css.map',
  'bootstrap-glyphicons.css',
  'favicon_io/android-chrome-192x192.png',
  'favicon_io/android-chrome-512x512.png',
  'favicon_io/apple-touch-icon.png',
  'favicon_io/favicon.ico',
  'favicon_io/favicon-16x16.png',
  'favicon_io/favicon-32x32.png',
  'favicon_io/site.webmanifest',
];
// The sw.js file itself does not go in the cache
const extraFiles = []; // reserve space for any additional files to cache
var contentToCache = (appShellFiles.concat(extraFiles)).map(file_name => {
  // optionally prepend path formatting
  return '' + file_name;
});

// install Service Worker
self.addEventListener('install', (e) => {
  console.log('[Service Worker install] Begin install');
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
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
//     const cache = await caches.open(CACHE_NAME);
//     console.log(`[Service Worker fetch] Caching new resource: ${e.request.url}`);
//     cache.put(e.request, response.clone());
//     return response;
//   })());
// });

self.addEventListener('fetch', (e) => {
  console.log('Handling fetch event for', e.request.url);

  // temporary diagnostics, cache check
  console.log('Checking cache');
  caches.open(CACHE_NAME).then(function(cache) {
    cache.keys().then(function(keys) {
      console.log('Cache contents:', keys.map(k => k.url));
    });
  });

  if (e.request.mode === 'navigate') {
    // Always serve app shell for navigation — handles OAuth redirect too
    console.log('Handling mode==navigate', e.request.url);
//    e.respondWith(caches.match('/vegnab-webapp/'));
    e.respondWith(
      caches.match(e.request).then(function(cachedResponse) {
        return cachedResponse || fetch(e.request);
      })
    );
    return;
  }

  e.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(e.request).then((response) => {
        if (response) {
          // If there is an entry in the cache for event.request, then response
          // will be defined and we can use it.
          console.log(' Found response in cache:', response);
          //return response;
          // if the page is trying an initial load from completely offline, we need to 
          // override the original headers, which may have specified browser caching,
          // which visually loads the app, but the screen is dead

          // Clone the response to add headers without modifying the original cached response
          var ovHeaders = new Headers(response.headers);
          ovHeaders.append('Cache-Control', 'public, max-age=0');
          var clonedResponse = new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: ovHeaders
          });
          return clonedResponse;
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
    // 'keyList' contains all cache names under username.github.io
    // filter out those that have this app prefix to create white list
    var cacheWhitelist = keyList.filter(function (key) {
      return key.indexOf(APP_PREFIX)
    })
    // add current cache name to white list
    cacheWhitelist.push(CACHE_NAME)
    return Promise.all(keyList.map(function (key, i) {
      if (cacheWhitelist.indexOf(key) === -1) {
        console.log('deleting cache : ' + keyList[i])
        return caches.delete(keyList[i])
      }
    }))
  })); 
});

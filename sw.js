const cacheName = 'VegNab-v0.00';
const appShellFiles = [
//  '/vegnab-webapp/',
  '../index.html',
  '../main.js',
  '../main.css',
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
self.addEventListener('fetch', (e) => {
  e.respondWith((async () => {
    const r = await caches.match(e.request);
    console.log(`[Service Worker fetch] Fetching resource: ${e.request.url}`);
    if (r) return r;
    const response = await fetch(e.request);
    const cache = await caches.open(cacheName);
    console.log(`[Service Worker fetch] Caching new resource: ${e.request.url}`);
    cache.put(e.request, response.clone());
    return response;
  })());
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

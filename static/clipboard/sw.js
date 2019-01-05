var cacheName = 'clipboard';

var filesToCache = [
  '/clipboard',
  '/static/clipboard/app.css',
  '/static/clipboard/app.js',
  '/static/clipboard/sw.js',
  '/static/clipboard/manifest.json',
  '/static/clipboard/icon192x192.png',
  '/static/clipboard/icon512x512.png',
  '//cdn.staticfile.org/clipboard.js/2.0.4/clipboard.min.js',
  '//cdn.jsdelivr.net/npm/clipboard@2/dist/clipboard.min.js',
];

// todo: check if service worker is installed before
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/static/clipboard/sw.js', { scope: '/' }).then(function() {
    console.log('sw: registration ok');
  }).catch(function(err) {
    console.error(err);
  });
}
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('sw: writing files into cache');
      return cache.addAll(filesToCache);
    })
  )
});

self.addEventListener('activate', function (event) {
  console.log('sw: service worker ready and activated', event);
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    // test if the request is cached
    caches.match(event.request).then(function(response) {
      // 1) if response cached, it will be returned from browser cache
      // 2) if response not cached, fetch resource from network
      return response || fetch(event.request);
    }).catch(function (err) {
      // if response not cached and network not available an error is thrown => return fallback image
      return caches.match('/static/clipboard/icon512x512.png');
    })
  )
});
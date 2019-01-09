var cacheName = 'filecase';

var filesToCache = [
  '/filecase',
  '/static/filecase/app.css',
  '/static/filecase/app.js',
  '/static/filecase/sw.js',
  '/static/filecase/manifest.json',
  '/static/filecase/filecase64.png',
  '/static/filecase/filecase128.png',
  '/static/filecase/filecase192.png',
  '/static/filecase/filecase512.png',
];

// todo: check if service worker is installed before
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/static/filecase/sw.js', { scope: '/filecase' }).then(function() {
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
      return caches.match('/static/filecase/filecase512.png');
    })
  )
});
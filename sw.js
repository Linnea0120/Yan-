/* ===== Service Worker（离线缓存）===== */
var CACHE = 'yan-v1';
var ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './src/css/base.css',
  './src/css/phone.css',
  './src/css/views.css',
  './src/js/store.js',
  './src/js/views.js',
  './src/js/app.js'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  var req = e.request;
  if(req.method !== 'GET') return;
  /* 接口请求不缓存 */
  if(req.url.indexOf('/chat/completions') > -1) return;

  e.respondWith(
    fetch(req).then(function(res){
      var copy = res.clone();
      caches.open(CACHE).then(function(c){ c.put(req, copy); });
      return res;
    }).catch(function(){
      return caches.match(req).then(function(r){
        return r || caches.match('./index.html');
      });
    })
  );
});

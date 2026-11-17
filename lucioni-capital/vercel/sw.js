// Lucioni Capital — service worker: la app abre sin conexión; los datos siempre vienen de la red.
const V = 'lc-shell-v1';
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(['/', '/manifest.webmanifest', '/icons/icon-192.png'])).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || u.pathname.startsWith('/api/')) return; // APIs: nunca desde caché
  if (e.request.mode === 'navigate' || u.pathname === '/') {
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(V).then(x => x.put('/', c)); return r; }).catch(() => caches.match('/')));
    return;
  }
  e.respondWith(caches.match(e.request).then(m => m || fetch(e.request).then(r => { if (r.ok) { const c = r.clone(); caches.open(V).then(x => x.put(e.request, c)); } return r; })));
});

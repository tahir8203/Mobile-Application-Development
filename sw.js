/* MAD Course offline cache. Bump VERSION with the ?v= number in index.html. */
const VERSION = 'mad-v4';
const CORE = ['./', 'index.html', 'manifest.webmanifest',
  'assets/theme.css?v=4', 'assets/present.css?v=4', 'assets/portal.css?v=4',
  'assets/portal-data.js?v=4', 'assets/present.js?v=4', 'assets/course-data.js?v=4',
  'assets/course.js?v=4', 'assets/labs.js?v=4', 'assets/portal.js?v=4',
  'assets/instructor.webp', 'assets/icons/icon-192.png']
  .concat(Array.from({ length: 16 }, (_, i) => 'assets/slides/l' + String(i + 1).padStart(2, '0') + '.js?v=4'));

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const page = req.mode === 'navigate' || req.destination === 'document';
  if (page) { // newest page when online, cached page when offline
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(VERSION).then(x => x.put('index.html', c)); return r; })
      .catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r.ok) { const c = r.clone(); caches.open(VERSION).then(x => x.put(req, c)); }
    return r;
  })));
});

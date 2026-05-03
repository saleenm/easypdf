const CACHE = 'easypdf-v1';
const STATIC = [
  '/easypdf/',
  '/easypdf/index.html',
  '/easypdf/compress-pdf.html',
  '/easypdf/merge-pdf.html',
  '/easypdf/split-pdf.html',
  '/easypdf/pdf-to-images.html',
  '/easypdf/word-to-pdf.html',
  '/easypdf/delete-pages.html',
  '/easypdf/protect-pdf.html',
  '/easypdf/extract-pages.html',
  '/easypdf/how-to-compress-pdf.html',
  '/easypdf/how-to-split-pdf.html',
  '/easypdf/how-to-delete-pdf-pages.html',
  '/easypdf/how-to-protect-pdf.html',
  '/easypdf/merge-pdf-online.html',
  '/easypdf/pdf-to-image-converter.html'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // CDN libs — network first, cache fallback
  if(url.hostname === 'unpkg.com' || url.hostname === 'cdnjs.cloudflare.com'){
    e.respondWith(
      fetch(e.request).then(r => {
        const clone = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return r;
      }).catch(() => caches.match(e.request))
    );
    return;
  }
  // Same-origin — cache first, network fallback
  if(url.hostname === self.location.hostname){
    e.respondWith(
      caches.match(e.request).then(cached => {
        if(cached) return cached;
        return fetch(e.request).then(r => {
          const clone = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return r;
        });
      })
    );
  }
});

// Lets the app open with no signal. The page itself is fetched fresh when online (so updates arrive) and kept for offline;
// the libraries it uses (Excel, PDF, fonts, text reading...) are saved the first time they load.
// Never cached: Google sign-in / Drive, Firebase data, weather.
const CACHE = 'tour-v1';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
const LIBS = ['cdnjs.cloudflare.com', 'cdn.jsdelivr.net', 'www.gstatic.com', 'fonts.gstatic.com', 'tessdata.projectnaptha.com'];
const keep = (r, res) => { if (res.ok || res.type === 'opaque') { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); } return res; };

self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    e.respondWith(fetch(r).then(res => keep(r, res)).catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || caches.match('index.html'))));
  } else if (LIBS.includes(u.hostname)) {
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => keep(r, res))));
  } else if (u.hostname === 'fonts.googleapis.com') {
    e.respondWith(fetch(r).then(res => keep(r, res)).catch(() => caches.match(r)));
  }
});

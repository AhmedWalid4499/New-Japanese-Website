// Offline support: the app and its study content are cached so lessons work without a connection.
// Bump VERSION whenever app files change so phones pick up the update.
const VERSION = 'sakura-app-v4';
const FILES = [
  './', './index.html', './app.css', './manifest.webmanifest',
  './js/core.js', './js/course.js', './js/lesson.js', './js/screens.js', './js/grammar.js', './js/extras.js', './js/main.js',
  './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png',
  '../assets/js/data/grammar.js', '../assets/js/data/kana.js', '../assets/js/data/kanji.js',
  '../assets/js/data/vocab.js', '../assets/js/data/phrases.js', '../assets/js/data/practice.js',
  '../assets/js/data/course1.js', '../assets/js/data/course2.js', '../assets/js/data/course.js',
  '../assets/js/data/stories.js', '../assets/js/data/dialogues.js',
  '../assets/js/shared/conjugate.js', '../assets/js/shared/sakura-ai.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

// Serve from cache instantly, refresh the cache in the background (stale-while-revalidate)
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(VERSION).then(async (cache) => {
    const hit = await cache.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then((res) => {
      if (res.ok && (new URL(e.request.url).origin === location.origin || e.request.url.includes('fonts.g'))) cache.put(e.request, res.clone());
      return res;
    }).catch(() => hit);
    return hit || net;
  }));
});

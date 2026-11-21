/* ميزان — service worker. Bump CACHE whenever you upload a new index.html. */
const CACHE = "mizan-v1";
const SHELL = ["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./icon-maskable-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL).catch(()=>{})).then(()=>self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // never cache Firebase/Google
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).catch(()=>caches.match("./index.html").then(r=>r||caches.match("./"))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(res => {
      if (res && res.status === 200) { const c = res.clone(); caches.open(CACHE).then(k=>k.put(req,c)); }
      return res;
    }).catch(()=>hit);
    return hit || net;
  }));
});

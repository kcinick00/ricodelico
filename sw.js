const CACHE_NAME = "sandwich-app-v26";
const FILES_TO_CACHE = [
  "index.html",
  "app.js",4
  "combos.js",
  "ingredients.js",
  "manifest.json",
  "icon-192.png",
  "icon-512.png",
  "images/aguacate.jpg",
  "images/baguette.jpg",
  "images/bbq.jpg",
  "images/cebolla.jpg",
  "images/salsatomate.jpg",
  "images/huevo.jpg",
  "images/jamon.jpg",
  "images/tomate.jpg",
  "images/lechuga.jpg",
  "images/mayonesa.jpg",
  "images/mostaza.jpg",
  "images/pan-blanco.jpg",
  "images/pan-integral.jpg",
  "images/pavo.jpg",
  "images/pollo.jpg",
  "images/queso.jpg",
  "images/res.jpg",
  "images/salami.jpg",
  "images/telera.jpg",
  "images/tocino.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});

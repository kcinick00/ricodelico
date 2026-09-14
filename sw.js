const CACHE_NAME = "sandwich-app-v8";
const FILES_TO_CACHE = [
  "index.html",
  "app.js",
  "ingredients.js",
  "manifest.json",
  "icon-192.png",
  "icon-512.png",
  // Imágenes de la selección (menú)
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
  "images/tocino.jpg",
  // Imágenes de las capas del sándwich (si las tienes)
  "images/layers/lechuga.png",
  "images/layers/jitomate.png",
  "images/layers/cebolla.png",
  "images/layers/aguacate.png",
  "images/layers/jamon.png",
  "images/layers/pavo.png",
  "images/layers/salami.png",
  "images/layers/tocino.png",
  "images/layers/pollo.png",
  "images/layers/res.png",
  "images/layers/queso-panela.png",
  "images/layers/huevo.png",
  "images/layers/mayonesa.png",
  "images/layers/mostaza.png",
  "images/layers/chipotle.png",
  "images/layers/bbq.png",
  "images/layers/pan-blanco-top.png",
  "images/layers/pan-blanco-bottom.png",
  "images/layers/pan-integral-top.png",
  "images/layers/pan-integral-bottom.png",
  "images/layers/telera-top.png",
  "images/layers/telera-bottom.png",
  "images/layers/baguette-top.png",
  "images/layers/baguette-bottom.png"
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
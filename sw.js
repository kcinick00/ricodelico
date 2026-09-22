// =========================================================
// sw.js - Service Worker para "Arma tu sándwich"
// =========================================================

const CACHE_NAME = "sandwich-app-v36";

// Archivos que se cachean al instalar el SW (app shell)
const FILES_TO_CACHE = [
  "index.html",
  "app.js",
  "combos.js",
  "ingredients.js",
  "manifest.json",
  "icon-192.png",
  "icon-512.png",
  "fondo-sandwich.jpg",
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

// =========================================================
// INSTALL: precachear el app shell
// =========================================================
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        FILES_TO_CACHE.map((url) =>
          cache.add(url).catch((err) => {
            console.warn("[SW] No se pudo cachear:", url, err);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

// =========================================================
// ACTIVATE: limpiar cachés viejos
// =========================================================
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => {
            console.log("[SW] Eliminando caché viejo:", k);
            return caches.delete(k);
          })
      )
    )
  );
  self.clients.claim();
});

// =========================================================
// FETCH: estrategia cache-first con cacheo dinámico
// =========================================================
self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  if (url.includes("docs.google.com/spreadsheets")) return;
  if (event.request.method !== "GET") return;
  if (!url.startsWith("http")) return;
  if (url.includes("print-iframe")) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        fetch(event.request)
          .then((response) => {
            if (response && response.status === 200 && response.type === "basic") {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, response.clone());
              });
            }
          })
          .catch(() => {});
        return cached;
      }

      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch((err) => {
          console.warn("[SW] Falló fetch y no está en caché:", event.request.url);
          if (event.request.mode === "navigate") {
            return caches.match("index.html");
          }
          throw err;
        });
    })
  );
});

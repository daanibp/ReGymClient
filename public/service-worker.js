// public/service-worker.js

const CACHE_NAME = "today-gym-cache";
const urlsToCache = [
    "/",
    "/index.html",
    "/favicon.ico",
    "/static/js/main.js",
    "/static/css/main.css",
    // Agrega aquí otros archivos o recursos que quieras cachear
];

// Durante la instalación del Service Worker, caché los archivos estáticos
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache);
        })
    );
});

// Durante el fetch, trato de servir los archivos desde el caché primero
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Si se encuentra una respuesta en el caché, la devuelve
            if (cachedResponse) {
                return cachedResponse;
            }
            // Si no, la obtiene de la red
            return fetch(event.request);
        })
    );
});

// Cuando el Service Worker recibe una actualización, borra los cachés antiguos
self.addEventListener("activate", (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

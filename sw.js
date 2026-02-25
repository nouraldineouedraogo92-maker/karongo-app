const CACHE_NAME = 'karongo-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './logo.png',
  './manifest.json',
  'https://cdn.tailwindcss.com?plugins=typography',
  'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:wght@300;400;700&display=swap'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // On essaie de mettre en cache les ressources critiques
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
          console.warn('Certaines ressources non critiques n\'ont pas pu être mises en cache', err);
      });
    })
  );
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Interception des requêtes réseau
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Stratégie : Network Only pour l'API Gemini et Google Fonts (pour éviter les problèmes CORS opaques ou dynamicité)
  if (url.hostname.includes('googleapis.com') || url.hostname.includes('generativelanguage')) {
    return;
  }

  // Stratégie : Stale-While-Revalidate pour le reste
  // On sert le cache tout de suite, mais on met à jour le cache en arrière-plan
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Si la réponse est valide, on la met en cache
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
         // Si échec réseau (offline), rien à faire de plus ici, le cache a déjà été retourné ou le sera
      });

      return cachedResponse || fetchPromise;
    })
  );
});
const CACHE = "ridfou-expo-2026-11-08-v3";
const HOME = new URL("./index.html", self.registration.scope).href;

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    try {
      await cache.add(new Request(HOME, {cache: "reload"}));
    } catch (e) {}
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  const scope = new URL(self.registration.scope);
  if (url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;

  event.respondWith((async () => {
    try {
      const response = await fetch(request, {cache: "no-store"});
      if (response.ok) {
        const cache = await caches.open(CACHE);
        await cache.put(request, response.clone());
        if (request.mode === "navigate") await cache.put(HOME, response.clone());
      }
      return response;
    } catch (e) {
      const cache = await caches.open(CACHE);
      return (await cache.match(request, {ignoreSearch: true}))
        || (request.mode === "navigate" ? await cache.match(HOME) : undefined)
        || Response.error();
    }
  })());
});

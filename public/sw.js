// Mahesh Bike Institute — asset caching service worker.
// Bump VERSION to invalidate every cache and force re-download.
const VERSION = "v3";
const STATIC_CACHE = `mbi-static-${VERSION}`;
const MEDIA_CACHE = `mbi-media-${VERSION}`;
const RUNTIME_CACHE = `mbi-runtime-${VERSION}`;

// Pre-cached on install so the second visit paints instantly.
// Skip the heavy video here — runtime cache will pick it up after first play.
const PRECACHE_URLS = [
  "/images/hero.png",
  "/images/hero-classroom.jpg",
  "/images/customer-workshop.png",
  "/sounds/press.wav",
  "/sounds/drag.mp3",
];

const ALLOWED_CACHES = new Set([STATIC_CACHE, MEDIA_CACHE, RUNTIME_CACHE]);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(MEDIA_CACHE)
      .then((cache) =>
        Promise.allSettled(PRECACHE_URLS.map((u) => cache.add(u)))
      )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => !ALLOWED_CACHES.has(k)).map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Mutations and non-GET requests go straight to network (server actions, etc.)
  if (req.method !== "GET") return;

  let url;
  try {
    url = new URL(req.url);
  } catch {
    return;
  }

  // Only handle same-origin
  if (url.origin !== self.location.origin) return;

  // Range requests (e.g. <video> seeking) — let the browser talk to network directly
  if (req.headers.has("range")) return;

  // Skip dynamic / authenticated / RSC payloads
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/auth/") ||
    url.pathname.startsWith("/_next/data/") ||
    url.pathname.startsWith("/_next/image") ||
    url.search.includes("_rsc=")
  ) {
    return;
  }

  // Cache-first for Next.js's content-hashed assets — safe to keep forever
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(req, STATIC_CACHE));
    return;
  }

  // Stale-while-revalidate for static media
  if (
    /\.(?:png|jpe?g|webp|avif|gif|svg|ico|mp4|webm|m4v|wav|mp3|ogg|woff2?|ttf|otf)$/i.test(
      url.pathname
    )
  ) {
    event.respondWith(staleWhileRevalidate(req, MEDIA_CACHE));
    return;
  }

  // HTML navigations — pass through so users always see fresh content
  if (req.mode === "navigate" || req.destination === "document") {
    return;
  }

  // Anything else: stale-while-revalidate in the runtime cache
  event.respondWith(staleWhileRevalidate(req, RUNTIME_CACHE));
});

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (isCacheable(res)) cache.put(req, res.clone());
    return res;
  } catch (err) {
    if (cached) return cached;
    throw err;
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  const networkPromise = fetch(req)
    .then((res) => {
      if (isCacheable(res)) cache.put(req, res.clone());
      return res;
    })
    .catch(() => cached);
  return cached || networkPromise;
}

function isCacheable(res) {
  return (
    res &&
    res.ok &&
    res.status === 200 &&
    (res.type === "basic" || res.type === "default")
  );
}

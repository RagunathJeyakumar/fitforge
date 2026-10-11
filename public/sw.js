/**
 * FitForge Production-Ready Service Worker
 * Version: fitforge-v1.0.0
 * 
 * Provides:
 * - App Shell caching for fast, reliable offline load
 * - Network-first strategy for dynamic HTML pages with /offline fallback
 * - Stale-while-revalidate for versioned static assets (/_next/static/)
 * - Cache-first for icons, fonts, and static media
 * - STRICT SECURITY: Complete bypass for Supabase, OAuth, /auth/* routes,
 *   and sensitive authenticated responses to prevent cross-user data leakage.
 */

const CACHE_VERSION = "fitforge-v1.0.0";
const SHELL_CACHE = `fitforge-shell-${CACHE_VERSION}`;
const STATIC_CACHE = `fitforge-static-${CACHE_VERSION}`;
const FONTS_CACHE = `fitforge-fonts-${CACHE_VERSION}`;

// Pre-cached critical application shell assets
const PRECACHE_ASSETS = [
  "/",
  "/offline",
  "/manifest.webmanifest",
  "/icons/icon.svg",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/icon-maskable-192x192.png",
  "/icons/apple-touch-icon.png",
  "/favicon.png",
];

// Domains and URL patterns to NEVER cache (Strict Security & Multi-User Isolation)
const NEVER_CACHE_PATTERNS = [
  /\/auth\//i,              // Auth routes & callbacks
  /\/api\/auth/i,           // Auth API endpoints
  /supabase\.co/i,          // Supabase REST / Auth / Realtime API
  /\btoken\b/i,             // Token requests
  /\bsession\b/i,           // Session endpoints
  /\/rest\/v1\//i,          // Supabase PostgREST
  /\/realtime\/v1\//i,      // Supabase WebSockets
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => {
        // Pre-cache core shell assets
        return cache.addAll(PRECACHE_ASSETS).catch((err) => {
          console.warn("[SW] Some assets failed to precache:", err);
        });
      })
      .then(() => {
        // Do not force skipWaiting automatically: wait for user confirmation
        // to avoid corrupting an in-progress gym session!
      })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (
              name.startsWith("fitforge-") &&
              name !== SHELL_CACHE &&
              name !== STATIC_CACHE &&
              name !== FONTS_CACHE
            ) {
              console.log("[SW] Deleting obsolete cache:", name);
              return caches.delete(name);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// User or UI sent message (e.g. SKIP_WAITING after workout completion)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Only handle GET requests; mutations are never cached
  if (request.method !== "GET") {
    return;
  }

  // 2. Strict Security: Never cache sensitive auth, Supabase, or user-specific API calls
  const isExcluded = NEVER_CACHE_PATTERNS.some((pattern) => pattern.test(request.url));
  if (isExcluded || request.headers.has("authorization")) {
    return; // Pass through directly to network with no cache involvement
  }

  // 3. Navigation requests (HTML pages): Network-First, fallback to Cache, then /offline
  if (request.mode === "navigate" || request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // If valid response, clone and update shell cache
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(SHELL_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(async () => {
          // Network failed: try cache first
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }

          // Fallback to pre-cached /offline page
          const offlineFallback = await caches.match("/offline");
          if (offlineFallback) {
            return offlineFallback;
          }

          // Fallback to cached root
          const rootCached = await caches.match("/");
          if (rootCached) {
            return rootCached;
          }

          return new Response("Offline - Connect to internet to load this page", {
            status: 503,
            statusText: "Service Unavailable",
            headers: { "Content-Type": "text/plain" },
          });
        })
    );
    return;
  }

  // 4. Versioned Next.js static files (/_next/static/*): Stale-While-Revalidate
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // 5. Fonts (Google Fonts, gstatic, local woff2): Cache-First
  if (
    url.hostname.includes("fonts.googleapis.com") ||
    url.hostname.includes("fonts.gstatic.com") ||
    url.pathname.match(/\.(woff2?|ttf|otf|eot)$/i)
  ) {
    event.respondWith(
      caches.open(FONTS_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;

          return fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // 6. Static image assets, icons, manifest: Stale-While-Revalidate
  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname.match(/\.(svg|png|jpg|jpeg|webp|ico)$/i) ||
    url.pathname === "/manifest.webmanifest"
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // 7. Default: Try network first, then cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

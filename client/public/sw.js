/**
 * Keeps the app openable without a connection and shows pushes.
 *
 * The shell and its hashed assets are cached; API calls are not — a stale plan or an old
 * diary would be worse than a clear "you are offline".
 */
const SHELL = "fitcore-shell-v1";
const ASSETS = "fitcore-assets-v1";

// Filled in at build time with this build's hashed files. Without it the first visit caches
// the HTML but none of the code, and an offline reload renders an empty page.
const PRECACHE = self.__PRECACHE ?? [];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const shell = await caches.open(SHELL);
      await shell.addAll(["/", "/index.html", "/manifest.webmanifest"]);

      const assets = await caches.open(ASSETS);
      // One failed asset must not fail the whole install.
      await Promise.all(PRECACHE.map((url) => assets.add(url).catch(() => {})));
    })()
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== SHELL && key !== ASSETS).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return; // never serve stale data

  // Hashed assets never change under the same name.
  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(
      caches.open(ASSETS).then(async (cache) => {
        const hit = await cache.match(request);
        if (hit) return hit;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      })
    );
    return;
  }

  // Everything else is the shell: network first, cache when the network is gone.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && request.mode === "navigate") {
          const copy = response.clone();
          caches.open(SHELL).then((cache) => cache.put("/index.html", copy));
        }
        return response;
      })
      .catch(async () => (await caches.match("/index.html")) ?? Response.error())
  );
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload = {};
  try {
    payload = event.data.json();
  } catch {
    payload = { notification: { title: "FitCore", body: event.data.text() } };
  }

  const notification = payload.notification ?? payload;
  event.waitUntil(
    self.registration.showNotification(notification.title ?? "FitCore", {
      body: notification.body,
      icon: "/icon-512.png",
      badge: "/icon-512.png",
      dir: "rtl",
      lang: "ar",
      data: { route: payload.data?.route ?? "/" }
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const route = event.notification.data?.route ?? "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const open = clients.find((client) => client.url.includes(self.location.origin));
      if (open) {
        open.focus();
        open.postMessage({ type: "navigate", route });
        return undefined;
      }
      return self.clients.openWindow(route);
    })
  );
});

// Guarda la app en caché para que abra rápido; la IA y los datos siempre van al servidor.
const C = "yste-v2";
const FILES = ["/", "/index.html", "/styles.css", "/app.js", "/hero.js", "/manifest.webmanifest", "/icons/icon.svg", "/icons/icon-192.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(C).then((c) => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== C).map((k) => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  // Compartir una captura desde WhatsApp u otra app (Android)
  if (e.request.method === "POST" && u.pathname === "/share") {
    e.respondWith((async () => {
      try {
        const fd = await e.request.formData(), files = fd.getAll("images").slice(0, 4);
        const c = await caches.open("yste-shared");
        for (const k of await c.keys()) await c.delete(k);
        await Promise.all(files.map((f, i) => c.put("/shared/" + i, new Response(f, { headers: { "content-type": f.type || "image/jpeg" } }))));
      } catch {}
      return Response.redirect("/?shared=1", 303);
    })());
    return;
  }
  if (e.request.method !== "GET" || u.pathname.startsWith("/api/") || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then((r) => { const cp = r.clone(); caches.open(C).then((c) => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request)));
});

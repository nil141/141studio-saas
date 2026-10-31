// Service worker de 141'STUDIO: solo recibe y muestra las notificaciones push.
// No intercepta peticiones ni guarda nada en caché (la app se carga como siempre).
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data ? e.data.text() : "" }; }
  // Título vacío permitido: en iPhone queda solo el nombre de la app arriba.
  e.waitUntil(self.registration.showNotification(typeof d.title === "string" ? d.title : "141'STUDIO", {
    body: d.body || "",
    icon: "/favicon-192.png",
    badge: "/favicon-32.png",
    tag: d.tag || undefined,
    data: { url: d.url || "/" },
  }));
});

// Al tocar la notificación: abre la app (o la trae al frente). Si el aviso
// lleva un enlace externo (p. ej. una reunión de Meet), abre ese enlace.
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || "/", self.location.origin).href;
  e.waitUntil((async () => {
    if (url.startsWith(self.location.origin)) {
      const wins = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const w of wins) { if ("focus" in w) return w.focus(); }
    }
    return self.clients.openWindow(url);
  })());
});

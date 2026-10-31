// Notificaciones push (como de app) en este dispositivo.
// Registra /sw.js, pide permiso y guarda la suscripción en el servidor
// (/api/push/*). En iPhone solo funciona con la web añadida a la pantalla de
// inicio y abierta desde su icono (iOS 16.4 o superior).
(() => {
const { useState, useEffect } = React;

const PREFS_KEY = "141_push_prefs";
const KINDS = [
  { k: "clients", label: "Avisos de clientes", sub: "Completan una tarea, te dan un acceso, actualizan sus datos…" },
  { k: "events", label: "Recordatorios de eventos", sub: "15 min antes; los de todo el día, a las 8:00" },
  { k: "tasks", label: "Resumen de tareas", sub: "Cada mañana a las 8:00, si tienes tareas para hoy" },
];
const _loadPrefs = () => { try { return Object.assign({ clients: true, events: true, tasks: true }, JSON.parse(localStorage.getItem(PREFS_KEY) || "{}")); } catch (_) { return { clients: true, events: true, tasks: true }; } };
const _savePrefs = (p) => { try { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); } catch (_) {} };

const isIOS = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const isStandalone = () => { try { return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true; } catch (_) { return false; } };
const supported = () => "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
const device = () => {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return "iPad";
  if (/Android/.test(ua)) return "Android";
  if (/Mac/.test(ua)) return "Mac";
  if (/Windows/.test(ua)) return "Windows";
  return "Navegador";
};
const _b64ToBytes = (b64) => {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
};
const _api = async (path, body) => {
  const res = await window.apiFetch("/api/push/" + path, body || {});
  return (await res.json().catch(() => null)) || { ok: false, error: "Sin respuesta del servidor" };
};
const _registration = async () => (await navigator.serviceWorker.getRegistration("/")) || null;

// Estado del dispositivo: unsupported | needs-install | denied | off | on
const getState = async () => {
  if (!supported()) return isIOS() && !isStandalone() ? "needs-install" : "unsupported";
  if (isIOS() && !isStandalone()) return "needs-install";
  if (Notification.permission === "denied") return "denied";
  const reg = await _registration();
  const sub = reg ? await reg.pushManager.getSubscription() : null;
  return sub && Notification.permission === "granted" ? "on" : "off";
};

const enable = async (prefs) => {
  const perm = await Notification.requestPermission();   // debe ir tras un toque del usuario
  if (perm !== "granted") return { ok: false, error: perm === "denied" ? "Has bloqueado las notificaciones para esta web." : "No se dio permiso." };
  const k = await _api("key");
  if (!k.ok || !k.key || !k.ready) return { ok: false, error: "Las notificaciones aún no están activadas en el servidor." };
  const reg = (await _registration()) || (await navigator.serviceWorker.register("/sw.js", { scope: "/" }));
  await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: _b64ToBytes(k.key) });
  const r = await _api("subscribe", { subscription: sub.toJSON(), prefs, device: device() });
  if (!r.ok) { try { await sub.unsubscribe(); } catch (_) {} return r; }
  _savePrefs(prefs);
  return { ok: true };
};

const disable = async () => {
  const reg = await _registration();
  const sub = reg ? await reg.pushManager.getSubscription() : null;
  if (sub) {
    try { await _api("unsubscribe", { endpoint: sub.endpoint }); } catch (_) {}
    try { await sub.unsubscribe(); } catch (_) {}
  }
  return { ok: true };
};

const savePrefs = async (prefs) => {
  _savePrefs(prefs);
  const reg = await _registration();
  const sub = reg ? await reg.pushManager.getSubscription() : null;
  if (!sub) return { ok: true };
  return _api("subscribe", { subscription: sub.toJSON(), prefs, device: device() });
};

const test = () => _api("test");

// Hook para las pantallas de ajustes (panel nuevo y ajustes antiguos)
const usePush = () => {
  const [state, setState] = useState(null);
  const [prefs, setPrefs] = useState(_loadPrefs);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const refresh = async () => { try { setState(await getState()); } catch (_) { setState("unsupported"); } };
  useEffect(() => { refresh(); }, []);
  const run = async (fn, okMsg) => {
    setBusy(true); setMsg("");
    try { const r = await fn(); setMsg(r && r.ok ? (okMsg || "") : ((r && r.error) || "No se pudo completar.")); }
    catch (e) { setMsg(String((e && e.message) || e)); }
    setBusy(false); refresh();
  };
  return {
    state, prefs, busy, msg, kinds: KINDS,
    enable: () => run(() => enable(prefs), "Notificaciones activadas en este dispositivo."),
    disable: () => run(disable, "Notificaciones desactivadas en este dispositivo."),
    test: () => run(test, "Te hemos enviado una notificación de prueba."),
    setPref: (k, v) => { const p = { ...prefs, [k]: v }; setPrefs(p); savePrefs(p); },
    isIOS: isIOS(),
  };
};

// Texto de ayuda según el estado
const pushHelp = (s, ios) => ({
  "needs-install": "En iPhone, primero añade la web a la pantalla de inicio (Safari → Compartir → «Añadir a pantalla de inicio») y ábrela desde ese icono.",
  "unsupported": ios ? "Necesitas iOS 16.4 o superior y abrir la app desde el icono de la pantalla de inicio." : "Este navegador no admite notificaciones.",
  "denied": ios ? "Están bloqueadas: actívalas en Ajustes → Notificaciones → 141'STUDIO." : "Están bloqueadas: permítelas en los ajustes del navegador para esta web.",
  "off": "Aún no están activadas en este dispositivo.",
  "on": "Activadas en este dispositivo.",
}[s] || "");

window.PushKit = { usePush, pushHelp, getState, enable, disable, test, savePrefs };
})();

// Tarjeta para los ajustes antiguos (los que se ven en el móvil)
(() => {
const PushSettingsCard = () => {
  const P = window.PushKit.usePush();
  const st = P.state;
  const can = st === "off" || st === "on";
  return (
    <div className="card" style={{ gridColumn: "1/-1" }}>
      <div className="card-header"><div className="card-title">Notificaciones en este dispositivo</div></div>
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="muted small">Recibe los avisos del CRM como notificaciones del móvil, también con la app cerrada.</div>
        <div className="small">{st === null ? "Comprobando…" : window.PushKit.pushHelp(st, P.isIOS)}</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {st === "off" && <button className="btn primary" disabled={P.busy} onClick={P.enable}>{P.busy ? "Activando…" : "Activar notificaciones"}</button>}
          {st === "on" && <button className="btn" disabled={P.busy} onClick={P.test}>Enviar una de prueba</button>}
          {st === "on" && <button className="btn" disabled={P.busy} onClick={P.disable}>Desactivar</button>}
        </div>
        {P.msg && <div className="muted small">{P.msg}</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, opacity: can ? 1 : 0.5 }}>
          {P.kinds.map(k => (
            <label key={k.k} style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: can ? "pointer" : "default" }}>
              <input type="checkbox" checked={!!P.prefs[k.k]} disabled={!can} onChange={e => P.setPref(k.k, e.target.checked)} style={{ marginTop: 3 }}/>
              <span><span style={{ fontWeight: 500 }}>{k.label}</span><br/><span className="muted small">{k.sub}</span></span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
window.PushSettingsCard = PushSettingsCard;
})();

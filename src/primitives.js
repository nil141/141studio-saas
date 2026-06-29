const { useState, useEffect, useRef, useMemo, createContext, useContext } = React;
const Avatar = ({ name, initials, color, size, src }) => {
  const cls = "avatar" + (size ? " " + size : "");
  const style = color ? { background: color + "33", color, borderColor: color + "55" } : {};
  return /* @__PURE__ */ React.createElement("span", { className: cls, style, title: name }, src ? /* @__PURE__ */ React.createElement("img", { src, alt: name, style: { width: "100%", height: "100%", objectFit: "cover" } }) : initials || (name || "?").slice(0, 2).toUpperCase());
};
const Switch = ({ on, onChange }) => /* @__PURE__ */ React.createElement(
  "button",
  {
    "aria-pressed": on,
    className: "switch" + (on ? " on" : ""),
    onClick: () => onChange(!on),
    style: { border: "0.5px solid var(--border-strong)" }
  }
);
const Sidebar = ({ current, onNavigate, kind = "agency", session, onAssistant, onQuickCreate }) => {
  const D = window.Data;
  D.useStore();
  const pendingTasks = Object.values(D.TASKS).flat().filter((t) => t.column !== "done").length || null;
  const agencySections = [
    {
      title: "Trabajo",
      items: [
        { id: "dashboard", label: "Inicio", icon: "home" },
        { id: "projects", label: "Proyectos", icon: "folder" },
        { id: "tasks", label: "Tareas", icon: "list-todo" },
        { id: "clients", label: "Clientes", icon: "users" },
        { id: "campaigns", label: "Campa\xF1as", icon: "megaphone" },
        { id: "agentes", label: "Agentes", icon: "sparkles" }
      ]
    },
    {
      title: "Finanzas",
      items: [
        { id: "billing", label: "Facturaci\xF3n", icon: "receipt" }
      ]
    },
    {
      title: "Comunicaci\xF3n",
      items: [
        { id: "mail", label: "Correo", icon: "mail" },
        { id: "agenda", label: "Agenda", icon: "calendar" }
      ]
    }
  ];
  const clientSections = [
    {
      title: "Tu cuenta",
      items: [
        { id: "client-dashboard", label: "Inicio", icon: "home" },
        { id: "client-project", label: "Tu proyecto", icon: "folder", badge: 2 },
        { id: "client-invoices", label: "Facturas", icon: "receipt" },
        { id: "client-messages", label: "Mensajes", icon: "msg-circle" }
      ]
    }
  ];
  const sections = kind === "client" ? clientSections : agencySections;
  const cleanName = (raw, fallback) => {
    if (!raw) return fallback;
    const n = raw.includes("@") ? raw.split("@")[0] : raw;
    return n.charAt(0).toUpperCase() + n.slice(1);
  };
  const me = session ? kind === "agency" ? { name: cleanName(session.name || session.email, "Nil"), initials: cleanName(session.name || session.email, "N")[0].toUpperCase(), email: session.email || "" } : { name: cleanName(session.name || session.email, "Cliente"), initials: cleanName(session.name || session.email, "C")[0].toUpperCase(), email: session.email || "" } : { name: "Nil", initials: "N", email: "nil@141agency.com" };
  const [logoutOpen, setLogoutOpen] = React.useState(false);
  const navContainerRef = useRef(null);
  const itemRefs = useRef({});
  const [pill, setPill] = React.useState(null);
  const firstPill = useRef(true);
  useEffect(() => {
    const activeId = current === "campaign" ? "campaigns" : current;
    const el = itemRefs.current[activeId];
    const container = navContainerRef.current;
    if (!el || !container) {
      setPill((prev) => prev ? { ...prev, visible: false } : null);
      return;
    }
    const eR = el.getBoundingClientRect();
    const cR = container.getBoundingClientRect();
    const top = eR.top - cR.top + container.scrollTop;
    if (firstPill.current) {
      firstPill.current = false;
      setPill({ top, height: eR.height, animated: false, visible: true });
    } else {
      setPill({ top, height: eR.height, animated: true, visible: true });
    }
  }, [current]);
  const NavItem = ({ id, icon, label, badge }) => {
    const [hov, setHov] = React.useState(false);
    const isActive = current === id || id === "campaigns" && current === "campaign";
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        ref: (el) => {
          itemRefs.current[id] = el;
        },
        onClick: () => onNavigate(id),
        onMouseEnter: () => setHov(true),
        onMouseLeave: () => setHov(false),
        style: {
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "9px 10px",
          borderRadius: 10,
          cursor: "pointer",
          background: "transparent",
          color: isActive ? "#c8c5f2" : hov ? "#cccccc" : "var(--text-muted)",
          transition: "color .12s",
          fontSize: 15,
          fontWeight: 400,
          letterSpacing: "-0.96px",
          userSelect: "none"
        }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: icon, size: 16, strokeWidth: 1.7 }),
      /* @__PURE__ */ React.createElement("span", { style: { flex: 1 } }, label),
      badge ? /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, background: "rgba(255,255,255,0.07)", color: "var(--text-muted)", padding: "1px 7px", borderRadius: 99 } }, badge) : null,
      isActive ? /* @__PURE__ */ React.createElement(Icon, { name: "chevron", size: 13, style: { color: "rgba(158,154,229,0.6)", flexShrink: 0 } }) : null
    );
  };
  const FooterItem = ({ icon, label, onClick, kbd, active }) => {
    const [hov, setHov] = React.useState(false);
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        onClick,
        onMouseEnter: () => setHov(true),
        onMouseLeave: () => setHov(false),
        style: {
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "9px 10px",
          borderRadius: 10,
          cursor: "pointer",
          background: active ? "var(--bg-hover)" : "transparent",
          color: active || hov ? "#cccccc" : "var(--text-muted)",
          transition: "color .12s, background .12s",
          fontSize: 15,
          fontWeight: 400,
          letterSpacing: "-0.96px",
          userSelect: "none"
        }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: icon, size: 16, strokeWidth: 1.6 }),
      /* @__PURE__ */ React.createElement("span", { style: { flex: 1 } }, label),
      kbd ? /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, color: "var(--text-subtle)", fontFamily: "var(--font-mono)" } }, kbd) : null
    );
  };
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("aside", { className: "sidebar", style: {
    width: 220,
    background: "var(--bg)",
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    position: "sticky",
    top: 0,
    padding: "20px 12px 16px",
    overflow: "hidden",
    flexShrink: 0
  } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, padding: "4px 10px 24px 10px" } }, /* @__PURE__ */ React.createElement("div", { style: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    flexShrink: 0,
    background: "rgba(158,154,229,0.18)",
    color: "#c8c5f2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 500,
    letterSpacing: "-0.5px"
  } }, me.initials), /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 400, letterSpacing: "-0.96px", color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, me.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-subtle)", letterSpacing: "-0.5px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, "@" + (me.email ? me.email.split("@")[0] : me.name.toLowerCase())))), /* @__PURE__ */ React.createElement("div", { ref: navContainerRef, style: { flex: 1, overflowY: "auto", scrollbarWidth: "none", msOverflowStyle: "none", position: "relative" } }, pill && /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    left: 0,
    right: 0,
    top: pill.top,
    height: pill.height,
    background: "rgba(158,154,229,0.13)",
    borderRadius: 10,
    pointerEvents: "none",
    zIndex: 0,
    opacity: pill.visible ? 1 : 0,
    transition: `top ${pill.animated ? "0.22s cubic-bezier(0.4,0,0.2,1)" : "0s"}, opacity 0.45s ease`
  } }), sections.map((section, si) => /* @__PURE__ */ React.createElement("div", { key: si, style: { marginBottom: 20 } }, /* @__PURE__ */ React.createElement("div", { style: {
    fontSize: 11,
    fontWeight: 500,
    color: "var(--text-subtle)",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    padding: "0 12px",
    marginBottom: 2
  } }, section.title), section.items.map((it) => /* @__PURE__ */ React.createElement(NavItem, { key: it.id, id: it.id, icon: it.icon, label: it.label, badge: it.badge }))))), /* @__PURE__ */ React.createElement("div", { style: { borderTop: "0.5px solid rgba(255,255,255,0.06)", paddingTop: 8, display: "flex", flexDirection: "column", gap: 0 } }, kind === "agency" && (session == null ? void 0 : session.role) === "admin" && /* @__PURE__ */ React.createElement(FooterItem, { icon: "sparkles", label: "Nora IA", onClick: onAssistant, active: current === "nora" }), /* @__PURE__ */ React.createElement(FooterItem, { icon: "settings", label: "Configuraci\xF3n", onClick: () => onNavigate("settings"), active: current === "settings" }), /* @__PURE__ */ React.createElement(FooterItem, { icon: "log-out", label: "Cerrar sesi\xF3n", onClick: () => setLogoutOpen(true) }))), logoutOpen && ReactDOM.createPortal(
    /* @__PURE__ */ React.createElement("div", { onClick: () => setLogoutOpen(false), style: {
      position: "fixed",
      inset: 0,
      zIndex: 900,
      background: "rgba(0,0,0,0.72)",
      backdropFilter: "blur(20px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      animation: "fade .15s ease-out"
    } }, /* @__PURE__ */ React.createElement("div", { onClick: (e) => e.stopPropagation(), style: {
      width: 340,
      background: "#161616",
      border: "0.5px solid rgba(255,255,255,0.08)",
      borderRadius: 24,
      padding: "28px 24px 20px",
      boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
      animation: "pop .2s cubic-bezier(.2,.8,.2,1)"
    } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 22, fontWeight: 500, letterSpacing: "-0.8px", marginBottom: 10 } }, "\xBFSeguro?"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 28, letterSpacing: "-0.3px" } }, "Si cierras sesi\xF3n tendr\xE1s que volver a identificarte para acceder."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10 } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setLogoutOpen(false),
        style: {
          flex: 1,
          padding: "13px 0",
          borderRadius: 99,
          background: "rgba(255,255,255,0.07)",
          border: "0.5px solid rgba(255,255,255,0.1)",
          color: "var(--text)",
          fontSize: 15,
          letterSpacing: "-0.4px",
          cursor: "pointer",
          fontFamily: "inherit",
          fontWeight: 400,
          transition: "background .12s"
        },
        onMouseEnter: (e) => e.currentTarget.style.background = "rgba(255,255,255,0.12)",
        onMouseLeave: (e) => e.currentTarget.style.background = "rgba(255,255,255,0.07)"
      },
      "Cancelar"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          setLogoutOpen(false);
          onNavigate("__logout");
        },
        style: {
          flex: 1,
          padding: "13px 0",
          borderRadius: 99,
          background: "rgba(220,38,38,0.18)",
          border: "1.5px solid rgba(220,38,38,0.7)",
          color: "#f87171",
          fontSize: 15,
          letterSpacing: "-0.4px",
          cursor: "pointer",
          fontFamily: "inherit",
          fontWeight: 400,
          boxShadow: "0 0 18px rgba(220,38,38,0.25)",
          transition: "background .12s"
        },
        onMouseEnter: (e) => e.currentTarget.style.background = "rgba(220,38,38,0.28)",
        onMouseLeave: (e) => e.currentTarget.style.background = "rgba(220,38,38,0.18)"
      },
      "Cerrar sesi\xF3n"
    )))),
    document.body
  ));
};
const Topbar = ({ crumb, right, theme, setTheme, onSearch, kind = "agency" }) => /* @__PURE__ */ React.createElement("div", { className: "topbar" }, /* @__PURE__ */ React.createElement("div", { className: "topbar-left grow" }, /* @__PURE__ */ React.createElement("div", { className: "search" }, /* @__PURE__ */ React.createElement(Icon, { name: "search", size: 14 }), /* @__PURE__ */ React.createElement("input", { placeholder: kind === "agency" ? "Buscar clientes, proyectos, tareas\u2026" : "Buscar en tu cuenta\u2026", onChange: (e) => onSearch && onSearch(e.target.value) }), /* @__PURE__ */ React.createElement("span", { className: "kbd" }, "\u2318K")), crumb ? /* @__PURE__ */ React.createElement("div", { className: "crumb", style: { marginLeft: 8 } }, crumb) : null), /* @__PURE__ */ React.createElement("div", { className: "topbar-right" }, right, /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only", "data-tooltip": "Notificaciones", onClick: () => {
} }, /* @__PURE__ */ React.createElement(Icon, { name: "bell", size: 15 }))));
const Modal = ({ open, onClose, title, sub, footer, children, size }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  if (!open) return null;
  return /* @__PURE__ */ React.createElement("div", { className: "modal-overlay", onClick: onClose }, /* @__PURE__ */ React.createElement("div", { className: "modal" + (size === "lg" ? " lg" : ""), onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("div", { className: "modal-head" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "modal-title" }, title), sub ? /* @__PURE__ */ React.createElement("div", { className: "modal-sub" }, sub) : null), /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only sm", onClick: onClose }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 14 }))), /* @__PURE__ */ React.createElement("div", { className: "modal-body" }, children), footer ? /* @__PURE__ */ React.createElement("div", { className: "modal-foot" }, footer) : null));
};
const ToastContext = createContext(null);
const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const push = (msg, kind = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  };
  return /* @__PURE__ */ React.createElement(ToastContext.Provider, { value: push }, children, /* @__PURE__ */ React.createElement("div", { className: "toast-stack" }, toasts.map((t) => /* @__PURE__ */ React.createElement("div", { className: "toast", key: t.id }, /* @__PURE__ */ React.createElement(Icon, { name: t.kind === "success" ? "check" : t.kind === "warn" ? "alert-triangle" : "info", size: 14 }), /* @__PURE__ */ React.createElement("span", null, t.msg)))));
};
const useToast = () => useContext(ToastContext);
const StatusChip = ({ status, label }) => {
  const map = {
    green: { cls: "green", text: label || "En curso" },
    amber: { cls: "amber", text: label || "Pendiente" },
    red: { cls: "red", text: label || "Bloqueado" },
    blue: { cls: "blue", text: label || "Activo" },
    paused: { cls: "", text: label || "Pausado" },
    archived: { cls: "", text: label || "Archivado" },
    review: { cls: "amber", text: label || "Revisi\xF3n" },
    active: { cls: "green", text: label || "Activo" },
    paid: { cls: "green", text: label || "Pagada" },
    pending: { cls: "amber", text: label || "Pendiente" },
    overdue: { cls: "red", text: label || "Vencida" },
    approved: { cls: "green", text: label || "Aprobado" },
    done: { cls: "green", text: label || "Hecho" },
    current: { cls: "blue", text: label || "Actual" },
    future: { cls: "", text: label || "Pr\xF3ximo" }
  };
  const m = map[status] || { cls: "", text: label || status };
  return /* @__PURE__ */ React.createElement("span", { className: "chip " + m.cls }, m.text);
};
const Empty = ({ icon = "inbox", title, sub }) => /* @__PURE__ */ React.createElement("div", { style: { padding: 40, textAlign: "center", color: "var(--text-muted)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "inline-flex", padding: 12, border: "0.5px solid var(--border)", borderRadius: 12, marginBottom: 12 } }, /* @__PURE__ */ React.createElement(Icon, { name: icon, size: 20 })), /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 500, color: "var(--text)", fontSize: 14 } }, title), sub ? /* @__PURE__ */ React.createElement("div", { className: "small", style: { marginTop: 4 } }, sub) : null);
const ConfirmContext = createContext(null);
const ConfirmProvider = ({ children }) => {
  const [state, setState] = useState(null);
  const confirm = (opts) => new Promise((resolve) => setState({ ...opts, resolve }));
  const close = (val) => {
    state == null ? void 0 : state.resolve(val);
    setState(null);
  };
  return /* @__PURE__ */ React.createElement(ConfirmContext.Provider, { value: confirm }, children, state && /* @__PURE__ */ React.createElement("div", { className: "modal-overlay", onClick: () => close(false) }, /* @__PURE__ */ React.createElement("div", { className: "modal", style: { maxWidth: 420 }, onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("div", { className: "modal-head" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "modal-title" }, state.title || "\xBFEst\xE1s seguro?"), state.body ? /* @__PURE__ */ React.createElement("div", { className: "modal-sub", style: { marginTop: 6, lineHeight: 1.5 } }, state.body) : null)), /* @__PURE__ */ React.createElement("div", { className: "modal-foot" }, /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: () => close(false) }, state.cancelLabel || "Cancelar"), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn " + (state.danger ? "danger" : "primary"),
      style: state.danger ? { background: "var(--red)", color: "#fff", borderColor: "var(--red)" } : {},
      onClick: () => close(true)
    },
    state.confirmLabel || "Eliminar"
  )))));
};
const useConfirm = () => useContext(ConfirmContext);
const _TPC_H = 54;
const TimeColumn = ({ items, selected, onSelect, fmt }) => {
  const ref = useRef(null);
  const timerRef = useRef(null);
  const dragging = useRef(false);
  const startY = useRef(0);
  const startScroll = useRef(0);
  const itemsRef = useRef(items);
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    itemsRef.current = items;
  });
  useEffect(() => {
    onSelectRef.current = onSelect;
  });
  useEffect(() => {
    if (!ref.current) return;
    const idx = items.indexOf(selected);
    if (idx >= 0) ref.current.scrollTop = idx * _TPC_H;
  }, []);
  const doSnap = () => {
    if (!ref.current) return;
    const idx = Math.round(ref.current.scrollTop / _TPC_H);
    const c = Math.max(0, Math.min(itemsRef.current.length - 1, idx));
    ref.current.scrollTo({ top: c * _TPC_H, behavior: "smooth" });
    onSelectRef.current(itemsRef.current[c]);
  };
  const handleScroll = () => {
    if (dragging.current) return;
    const idx = Math.round(ref.current.scrollTop / _TPC_H);
    const c = Math.max(0, Math.min(itemsRef.current.length - 1, idx));
    onSelectRef.current(itemsRef.current[c]);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(doSnap, 160);
  };
  const handleMouseDown = (e) => {
    e.preventDefault();
    dragging.current = true;
    startY.current = e.clientY;
    startScroll.current = ref.current.scrollTop;
  };
  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;
      ref.current.scrollTop = startScroll.current + (startY.current - e.clientY);
      const idx = Math.round(ref.current.scrollTop / _TPC_H);
      const c = Math.max(0, Math.min(itemsRef.current.length - 1, idx));
      onSelectRef.current(itemsRef.current[c]);
    };
    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      doSnap();
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);
  return /* @__PURE__ */ React.createElement("div", { style: { position: "relative", flex: 1, height: _TPC_H * 5, overflow: "hidden", cursor: "ns-resize" } }, /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    top: _TPC_H * 2,
    left: 2,
    right: 2,
    height: _TPC_H,
    background: "rgba(255,255,255,0.055)",
    borderRadius: 14,
    pointerEvents: "none",
    zIndex: 1
  } }), /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: _TPC_H * 2.3,
    background: "linear-gradient(to bottom, #0f0f13 0%, rgba(15,15,19,0) 100%)",
    pointerEvents: "none",
    zIndex: 2
  } }), /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: _TPC_H * 2.3,
    background: "linear-gradient(to top, #0f0f13 0%, rgba(15,15,19,0) 100%)",
    pointerEvents: "none",
    zIndex: 2
  } }), /* @__PURE__ */ React.createElement(
    "div",
    {
      ref,
      onScroll: handleScroll,
      onMouseDown: handleMouseDown,
      style: {
        height: "100%",
        overflowY: "scroll",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        paddingTop: _TPC_H * 2,
        paddingBottom: _TPC_H * 2,
        userSelect: "none"
      }
    },
    items.map((item, i) => {
      const isSel = item === selected;
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          key: i,
          onClick: () => {
            onSelect(item);
            ref.current.scrollTo({ top: i * _TPC_H, behavior: "smooth" });
          },
          style: {
            height: _TPC_H,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            fontWeight: 400,
            color: isSel ? "#f0f0f0" : "rgba(255,255,255,0.2)",
            cursor: "pointer",
            userSelect: "none",
            fontFamily: "var(--font-display)",
            letterSpacing: "-1px",
            transition: "color 0.1s"
          }
        },
        fmt ? fmt(item) : item
      );
    })
  ));
};
const TimePicker = ({ value, onChange, onClose }) => {
  const pad = (n) => String(n).padStart(2, "0");
  const now = /* @__PURE__ */ new Date();
  const [h, setH] = useState(value ? parseInt(value.split(":")[0]) : now.getHours());
  const [m, setM] = useState(value ? parseInt(value.split(":")[1]) : 0);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const mins = Array.from({ length: 60 }, (_, i) => i);
  const overlayMouseDown = useRef(false);
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 400,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "fade .15s ease-out"
      },
      onMouseDown: (e) => {
        overlayMouseDown.current = e.target === e.currentTarget;
      },
      onClick: (e) => {
        if (overlayMouseDown.current && e.target === e.currentTarget) onClose();
      }
    },
    /* @__PURE__ */ React.createElement(
      "div",
      {
        onClick: (e) => e.stopPropagation(),
        style: {
          width: 320,
          background: "#0f0f13",
          border: "0.5px solid rgba(255,255,255,0.1)",
          borderRadius: 28,
          overflow: "hidden",
          animation: "pop .2s cubic-bezier(.2,.8,.2,1)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)"
        }
      },
      /* @__PURE__ */ React.createElement("div", { style: {
        padding: "24px 24px 4px",
        textAlign: "center",
        fontSize: 17,
        fontWeight: 400,
        letterSpacing: "-0.96px",
        color: "var(--text)"
      } }, "Seleccionar hora"),
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", padding: "0 20px 4px", gap: 0 } }, /* @__PURE__ */ React.createElement(TimeColumn, { items: hours, selected: h, onSelect: setH, fmt: pad }), /* @__PURE__ */ React.createElement("div", { style: {
        width: 28,
        flexShrink: 0,
        textAlign: "center",
        fontSize: 34,
        fontWeight: 200,
        color: "rgba(255,255,255,0.18)",
        userSelect: "none",
        paddingBottom: 2
      } }, ":"), /* @__PURE__ */ React.createElement(TimeColumn, { items: mins, selected: m, onSelect: setM, fmt: pad })),
      /* @__PURE__ */ React.createElement("div", { style: { padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => {
            onChange(pad(h) + ":" + pad(m));
            onClose();
          },
          style: {
            width: "100%",
            padding: "14px 24px",
            background: "rgba(255,255,255,0.09)",
            border: "0.5px solid rgba(255,255,255,0.12)",
            borderRadius: 14,
            color: "#f0f0f0",
            fontSize: 16,
            letterSpacing: "-0.96px",
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
            fontWeight: 400,
            transition: "background .1s"
          },
          onMouseEnter: (e) => e.currentTarget.style.background = "rgba(255,255,255,0.13)",
          onMouseLeave: (e) => e.currentTarget.style.background = "rgba(255,255,255,0.09)"
        },
        "Confirmar"
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: onClose,
          style: {
            width: "100%",
            padding: "12px 24px",
            background: "transparent",
            border: "none",
            borderRadius: 14,
            color: "rgba(255,255,255,0.32)",
            fontSize: 15,
            letterSpacing: "-0.96px",
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
            transition: "color .1s"
          },
          onMouseEnter: (e) => e.currentTarget.style.color = "rgba(255,255,255,0.55)",
          onMouseLeave: (e) => e.currentTarget.style.color = "rgba(255,255,255,0.32)"
        },
        "Cancelar"
      ))
    )
  );
};
Object.assign(window, { Avatar, Switch, Sidebar, Topbar, Modal, ToastProvider, useToast, StatusChip, Empty, ConfirmProvider, useConfirm, TimePicker });

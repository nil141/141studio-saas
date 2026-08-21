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
  let clientUnread = 0;
  try {
    let l = D.NOTIFICATIONS || [];
    const pid = sessionStorage.getItem("141_preview_client");
    if (pid) l = l.filter((n) => n.clientId === pid);
    clientUnread = l.filter((n) => !n.read).length;
  } catch (e) {
  }
  const topItem = { id: "dashboard", label: "Inicio", icon: "home" };
  const agencySections = [
    {
      title: "Trabajo",
      items: [
        { id: "projects", label: "Proyectos", icon: "folder" },
        { id: "tasks", label: "Tareas", icon: "list-todo" },
        { id: "clients", label: "Clientes", icon: "users" },
        { id: "campaigns", label: "Campa\xF1as", icon: "megaphone" }
      ]
    },
    {
      title: "Finanzas",
      items: [
        { id: "income", label: "Facturaci\xF3n", icon: "trending-up" },
        { id: "billing", label: "Gastos", icon: "receipt" }
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
        { id: "client-status", label: "Estado del proyecto", icon: "activity" },
        { id: "client-docs", label: "Documentaci\xF3n", icon: "file-text" },
        { id: "client-credentials", label: "Credenciales", icon: "lock" },
        { id: "client-notifications", label: "Notificaciones", icon: "bell", badge: clientUnread || void 0 }
      ]
    }
  ];
  const sections = kind === "client" ? clientSections : agencySections;
  const drilldown = kind === "agency";
  const sectionOfItem = {};
  sections.forEach((s) => s.items.forEach((it) => {
    sectionOfItem[it.id] = s.title;
  }));
  const SECTION_ICONS = { "Trabajo": "layers", "Finanzas": "trending-up", "Comunicaci\xF3n": "msg-circle" };
  const _mapNav = (c) => c === "campaign" ? "campaigns" : c === "project" ? "projects" : c === "clientDetail" ? "clients" : c;
  const curNav = _mapNav(current);
  const _activeSection = sectionOfItem[curNav] || null;
  const [openCat, setOpenCat] = React.useState(_activeSection);
  const [detailCat, setDetailCat] = React.useState(_activeSection);
  const openCategory = (title) => {
    setDetailCat(title);
    setOpenCat(title);
  };
  const detailSection = sections.find((s) => s.title === detailCat) || sections[0];
  const prevCurrent = useRef(current);
  useEffect(() => {
    if (!drilldown || prevCurrent.current === current) return;
    prevCurrent.current = current;
    const sec = sectionOfItem[_mapNav(current)];
    if (sec) {
      setDetailCat(sec);
      setOpenCat(sec);
    } else setOpenCat(null);
  }, [current]);
  const cleanName = (raw, fallback) => {
    if (!raw) return fallback;
    const n = raw.includes("@") ? raw.split("@")[0] : raw;
    return n.charAt(0).toUpperCase() + n.slice(1);
  };
  const me = session ? kind === "agency" ? { name: cleanName(session.name || session.email, "Nil"), initials: cleanName(session.name || session.email, "N")[0].toUpperCase(), email: session.email || "" } : { name: cleanName(session.name || session.email, "Cliente"), initials: cleanName(session.name || session.email, "C")[0].toUpperCase(), email: session.email || "" } : { name: "Nil", initials: "N", email: "nil@141agency.com" };
  const [logoutOpen, setLogoutOpen] = React.useState(false);
  const COLLAPSE_KEY = "sidebar_collapsed_v1";
  const [collapsed, setCollapsed] = React.useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(COLLAPSE_KEY) || "[]"));
    } catch (e) {
      return /* @__PURE__ */ new Set();
    }
  });
  const toggleSection = (title) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(title) ? next.delete(title) : next.add(title);
      try {
        localStorage.setItem(COLLAPSE_KEY, JSON.stringify([...next]));
      } catch (e) {
      }
      return next;
    });
  };
  const navContainerRef = useRef(null);
  const itemRefs = useRef({});
  const [pill, setPill] = React.useState(null);
  const firstPill = useRef(true);
  const measurePill = () => {
    const activeId = current === "campaign" ? "campaigns" : current;
    const el = itemRefs.current[activeId];
    const container = navContainerRef.current;
    const secTitle = sectionOfItem[activeId];
    if (!el || !container || secTitle && collapsed.has(secTitle)) {
      setPill((prev) => prev ? { ...prev, visible: false } : null);
      return;
    }
    const eR = el.getBoundingClientRect();
    const cR = container.getBoundingClientRect();
    const top = eR.top - cR.top + container.scrollTop;
    const animated = !firstPill.current;
    firstPill.current = false;
    setPill({ top, height: eR.height, animated, visible: true });
  };
  useEffect(() => {
    measurePill();
    const t = setTimeout(measurePill, 280);
    return () => clearTimeout(t);
  }, [current, collapsed]);
  const NavItem = ({ id, icon, label, badge, onClick, chevron, active, bare, rowRef }) => {
    const [hov, setHov] = React.useState(false);
    const isActive = active != null ? active : curNav === id;
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        ref: rowRef,
        onClick: onClick || (() => onNavigate(id)),
        onMouseEnter: () => setHov(true),
        onMouseLeave: () => setHov(false),
        style: {
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          gap: 12,
          height: 48,
          padding: "0 12px",
          borderRadius: 16,
          cursor: "pointer",
          background: bare ? "transparent" : isActive ? "rgba(255,255,255,0.07)" : hov ? "rgba(255,255,255,0.03)" : "transparent",
          border: bare ? "1px solid transparent" : isActive ? "1px solid #232324" : "1px solid transparent",
          color: isActive ? "var(--accent)" : hov ? "#fff" : "var(--text-muted)",
          transition: "color .15s, background .15s",
          fontSize: 16,
          fontWeight: 400,
          letterSpacing: "-0.06em",
          userSelect: "none"
        }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: icon, size: 17, strokeWidth: 1.7 }),
      /* @__PURE__ */ React.createElement("span", { style: { flex: 1 } }, label),
      badge ? /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, background: "rgba(255,255,255,0.07)", color: "var(--text-muted)", padding: "1px 7px", borderRadius: 99 } }, badge) : null,
      chevron ? /* @__PURE__ */ React.createElement(Icon, { name: "chevron", size: 15, style: { flexShrink: 0, opacity: hov || isActive ? 1 : 0.45, transition: "opacity .15s" } }) : isActive ? /* @__PURE__ */ React.createElement(Icon, { name: "chevron", size: 15, style: { flexShrink: 0 } }) : null
    );
  };
  const rootPaneRef = useRef(null), detailPaneRef = useRef(null);
  const rootRefs = useRef({}), detailRefs = useRef({});
  const [rootPill, setRootPill] = React.useState(null);
  const [detailPill, setDetailPill] = React.useState(null);
  const firstRoot = useRef(true);
  const lastDetailCat = useRef(null);
  const _activeId = curNav;
  const _rootActiveKey = current === "dashboard" ? "dashboard" : sectionOfItem[_activeId] ? "__cat_" + sectionOfItem[_activeId] : null;
  const _detailActiveKey = detailSection && detailSection.items.some((it) => it.id === _activeId) ? _activeId : null;
  useEffect(() => {
    const place = (paneEl, refs, key, setPill2, animated) => {
      const el = key != null ? refs.current[key] : null;
      if (!el || !paneEl) {
        setPill2((prev) => prev ? { ...prev, visible: false } : null);
        return;
      }
      const eR = el.getBoundingClientRect(), cR = paneEl.getBoundingClientRect();
      setPill2({ top: eR.top - cR.top + paneEl.scrollTop, height: eR.height, animated, visible: true });
    };
    place(rootPaneRef.current, rootRefs, _rootActiveKey, setRootPill, !firstRoot.current);
    firstRoot.current = false;
    place(detailPaneRef.current, detailRefs, _detailActiveKey, setDetailPill, lastDetailCat.current === detailCat);
    lastDetailCat.current = detailCat;
  }, [_rootActiveKey, _detailActiveKey, detailCat, openCat]);
  const renderPill = (pill2) => pill2 ? /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    left: 0,
    right: 0,
    top: pill2.top + 3,
    height: pill2.height - 6,
    background: "rgba(255,255,255,0.07)",
    border: "1px solid #232324",
    borderRadius: 16,
    pointerEvents: "none",
    zIndex: 0,
    opacity: pill2.visible ? 1 : 0,
    transition: `top ${pill2.animated ? "0.22s cubic-bezier(0.4,0,0.2,1)" : "0s"}, opacity .3s ease`
  } }) : null;
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
          gap: 12,
          height: 48,
          padding: "0 12px",
          borderRadius: 16,
          cursor: "pointer",
          background: active ? "rgba(255,255,255,0.07)" : "transparent",
          border: active ? "1px solid #232324" : "1px solid transparent",
          color: active ? "var(--accent)" : hov ? "#fff" : "var(--text-muted)",
          transition: "color .15s, background .15s",
          fontSize: 16,
          fontWeight: 400,
          letterSpacing: "-0.06em",
          userSelect: "none"
        }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: icon, size: 17, strokeWidth: 1.6 }),
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
  } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12, padding: "4px 8px 24px 8px" } }, /* @__PURE__ */ React.createElement("div", { style: {
    width: 40,
    height: 40,
    borderRadius: 16,
    flexShrink: 0,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.05)",
    color: "var(--accent)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    fontWeight: 400
  } }, (me.initials || "").charAt(0)), /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 400, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, me.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, "@" + (me.email ? me.email.split("@")[0] : me.name.toLowerCase())))), /* @__PURE__ */ React.createElement("div", { ref: navContainerRef, style: { flex: 1, overflow: "hidden", position: "relative" } }, drilldown ? /* @__PURE__ */ React.createElement("div", { style: {
    display: "flex",
    width: "200%",
    height: "100%",
    transform: openCat != null ? "translateX(-50%)" : "translateX(0)",
    transition: "transform .3s cubic-bezier(0.4,0,0.2,1)"
  } }, /* @__PURE__ */ React.createElement("div", { ref: rootPaneRef, style: {
    width: "50%",
    flexShrink: 0,
    paddingRight: 2,
    height: "100%",
    position: "relative",
    overflowY: "auto",
    scrollbarWidth: "none"
  } }, renderPill(rootPill), /* @__PURE__ */ React.createElement(
    NavItem,
    {
      bare: true,
      rowRef: (el) => {
        rootRefs.current["dashboard"] = el;
      },
      id: topItem.id,
      icon: topItem.icon,
      label: topItem.label,
      active: current === "dashboard"
    }
  ), sections.map((section) => {
    const inHere = section.items.some((it) => it.id === _activeId);
    return /* @__PURE__ */ React.createElement(
      NavItem,
      {
        bare: true,
        key: section.title,
        rowRef: (el) => {
          rootRefs.current["__cat_" + section.title] = el;
        },
        id: "__cat_" + section.title,
        icon: SECTION_ICONS[section.title] || "grid",
        label: section.title,
        onClick: () => openCategory(section.title),
        chevron: true,
        active: inHere
      }
    );
  })), /* @__PURE__ */ React.createElement("div", { style: { width: "50%", flexShrink: 0, paddingLeft: 2, height: "100%", display: "flex", flexDirection: "column" } }, /* @__PURE__ */ React.createElement(
    "div",
    {
      onClick: () => setOpenCat(null),
      onMouseEnter: (e) => e.currentTarget.style.color = "#fff",
      onMouseLeave: (e) => e.currentTarget.style.color = "var(--text-muted)",
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        height: 44,
        padding: "0 10px",
        flexShrink: 0,
        cursor: "pointer",
        color: "var(--text-muted)",
        transition: "color .15s",
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: "0.04em",
        textTransform: "uppercase"
      }
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "chevron", size: 14, style: { transform: "rotate(180deg)", flexShrink: 0 } }),
    /* @__PURE__ */ React.createElement("span", null, detailSection.title)
  ), /* @__PURE__ */ React.createElement("div", { style: { height: 6, flexShrink: 0 } }), /* @__PURE__ */ React.createElement("div", { ref: detailPaneRef, style: { flex: 1, minHeight: 0, position: "relative", overflowY: "auto", scrollbarWidth: "none" } }, renderPill(detailPill), detailSection.items.map((it) => /* @__PURE__ */ React.createElement(
    NavItem,
    {
      bare: true,
      key: it.id,
      rowRef: (el) => {
        detailRefs.current[it.id] = el;
      },
      id: it.id,
      icon: it.icon,
      label: it.label,
      badge: it.badge,
      active: it.id === _activeId
    }
  ))))) : /* @__PURE__ */ React.createElement("div", { style: { overflowY: "auto", scrollbarWidth: "none", height: "100%" } }, sections.map((section, si) => /* @__PURE__ */ React.createElement("div", { key: si, style: { marginBottom: 20 } }, /* @__PURE__ */ React.createElement("div", { style: {
    fontSize: 11,
    fontWeight: 500,
    color: "var(--text-subtle)",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    padding: "0 12px",
    marginBottom: 2
  } }, section.title), section.items.map((it) => /* @__PURE__ */ React.createElement(NavItem, { key: it.id, id: it.id, icon: it.icon, label: it.label, badge: it.badge })))))), /* @__PURE__ */ React.createElement("div", { style: { borderTop: "0.5px solid rgba(255,255,255,0.06)", paddingTop: 8, display: "flex", flexDirection: "column", gap: 0 } }, kind === "agency" && (session == null ? void 0 : session.role) === "admin" && /* @__PURE__ */ React.createElement(FooterItem, { icon: "sparkles", label: "Nora IA", onClick: onAssistant, active: current === "nora" }), /* @__PURE__ */ React.createElement(FooterItem, { icon: "settings", label: "Configuraci\xF3n", onClick: () => onNavigate("settings"), active: current === "settings" }), /* @__PURE__ */ React.createElement(FooterItem, { icon: "log-out", label: "Cerrar sesi\xF3n", onClick: () => setLogoutOpen(true) }))), logoutOpen && ReactDOM.createPortal(
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
const _notifAgo = (iso) => {
  if (!iso) return "ahora";
  const d = new Date(iso);
  const s = Math.floor((Date.now() - d.getTime()) / 1e3);
  if (s < 60) return "ahora";
  const m = Math.floor(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  const dd = Math.floor(h / 24);
  if (dd < 7) return `hace ${dd} d`;
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
};
const NotificationBell = ({ kind }) => {
  const D = window.Data;
  D.useStore && D.useStore();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [open]);
  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 8, left: Math.max(8, Math.min(r.left, window.innerWidth - 342)) });
    }
    setOpen((o) => !o);
  };
  let list = [];
  if (kind === "client") {
    list = D.NOTIFICATIONS || [];
    try {
      const pid = sessionStorage.getItem("141_preview_client");
      if (pid) list = list.filter((n) => n.clientId === pid);
    } catch (e) {
    }
  }
  const unread = list.filter((n) => !n.read).length;
  return /* @__PURE__ */ React.createElement("div", { style: { position: "relative" }, onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("button", { ref: btnRef, className: "btn ghost icon-only", "data-tooltip": "Notificaciones", onClick: toggle }, /* @__PURE__ */ React.createElement(Icon, { name: "bell", size: 15 }), unread > 0 && /* @__PURE__ */ React.createElement("span", { style: {
    position: "absolute",
    top: 3,
    right: 3,
    minWidth: 15,
    height: 15,
    padding: "0 3px",
    borderRadius: 99,
    background: "var(--red)",
    color: "#fff",
    fontSize: 9.5,
    fontWeight: 700,
    display: "grid",
    placeItems: "center",
    lineHeight: 1
  } }, unread > 9 ? "9+" : unread)), open && /* @__PURE__ */ React.createElement("div", { style: {
    position: "fixed",
    left: pos.left,
    top: pos.top,
    zIndex: 200,
    width: 330,
    maxWidth: "90vw",
    background: "var(--bg-elev)",
    border: "0.5px solid var(--border-strong)",
    borderRadius: 14,
    overflow: "hidden",
    boxShadow: "0 12px 34px rgba(0,0,0,0.35)"
  } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", borderBottom: "0.5px solid var(--border)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 600, fontSize: 14 } }, "Notificaciones"), unread > 0 && /* @__PURE__ */ React.createElement("button", { onClick: () => D.markAllNotificationsRead(), style: { background: "transparent", border: 0, color: "var(--text-muted)", fontSize: 12, cursor: "pointer", fontFamily: "inherit" } }, "Marcar le\xEDdas")), /* @__PURE__ */ React.createElement("div", { style: { maxHeight: 380, overflowY: "auto" } }, list.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { padding: "28px 16px", textAlign: "center", color: "var(--text-subtle)", fontSize: 13 } }, "Sin notificaciones") : list.slice(0, 25).map((n) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: n.id,
      onClick: () => D.markNotificationRead(n.id),
      style: { display: "flex", gap: 10, padding: "12px 16px", borderBottom: "0.5px solid var(--border)", cursor: "pointer", background: n.read ? "transparent" : "var(--accent-soft)" }
    },
    /* @__PURE__ */ React.createElement("span", { style: { width: 7, height: 7, borderRadius: 99, marginTop: 5, flexShrink: 0, background: n.read ? "transparent" : "var(--accent)" } }),
    /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0, flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 500 } }, n.title), n.body && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.4 } }, n.body), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-subtle)", marginTop: 4 } }, _notifAgo(n.createdAt)))
  )))));
};
const Topbar = ({ crumb, right, theme, setTheme, onSearch, kind = "agency" }) => /* @__PURE__ */ React.createElement("div", { className: "topbar" }, /* @__PURE__ */ React.createElement("div", { className: "topbar-left grow" }, /* @__PURE__ */ React.createElement("div", { className: "search" }, /* @__PURE__ */ React.createElement(Icon, { name: "search", size: 14 }), /* @__PURE__ */ React.createElement("input", { placeholder: kind === "agency" ? "Buscar clientes, proyectos, tareas\u2026" : "Buscar en tu cuenta\u2026", onChange: (e) => onSearch && onSearch(e.target.value) }), /* @__PURE__ */ React.createElement("span", { className: "kbd" }, "\u2318K")), crumb ? /* @__PURE__ */ React.createElement("div", { className: "crumb", style: { marginLeft: 8 } }, crumb) : null), /* @__PURE__ */ React.createElement("div", { className: "topbar-right" }, right, /* @__PURE__ */ React.createElement(NotificationBell, { kind })));
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
  return /* @__PURE__ */ React.createElement("div", { className: "modal-overlay", onClick: onClose }, /* @__PURE__ */ React.createElement("div", { className: "modal" + (size === "lg" ? " lg" : ""), onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("div", { className: "modal-head" }, /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { className: "modal-title" }, title), sub ? /* @__PURE__ */ React.createElement("div", { className: "modal-sub" }, sub) : null), /* @__PURE__ */ React.createElement("button", { onClick: onClose, style: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    flexShrink: 0,
    cursor: "pointer",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.06)",
    display: "grid",
    placeItems: "center",
    color: "var(--text-muted)"
  } }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 15 }))), /* @__PURE__ */ React.createElement("div", { className: "modal-body" }, children), footer ? /* @__PURE__ */ React.createElement("div", { className: "modal-foot" }, footer) : null));
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
const ActionPill = ({ plusActions, moreActions, plusIcon = "plus" }) => {
  const [open, setOpen] = useState(null);
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);
  const pillBtn = {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--text-muted)",
    transition: "background .12s",
    flexShrink: 0
  };
  const dropdown = {
    position: "absolute",
    right: 0,
    top: "calc(100% + 8px)",
    zIndex: 50,
    background: "#1a1a1c",
    border: "0.5px solid rgba(255,255,255,0.1)",
    borderRadius: 14,
    boxShadow: "0 8px 32px rgba(0,0,0,0.5)"
  };
  const mItem = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    width: "100%",
    padding: "10px 12px",
    borderRadius: 9,
    cursor: "pointer",
    background: "transparent",
    border: 0,
    fontFamily: "inherit",
    textAlign: "left",
    transition: "background .1s"
  };
  const mIcon = {
    width: 32,
    height: 32,
    borderRadius: 9,
    flexShrink: 0,
    background: "var(--bg-elev-2)",
    border: "0.5px solid var(--border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--text-muted)"
  };
  const handlePlus = (e) => {
    e.stopPropagation();
    if (typeof plusActions === "function") return plusActions();
    if (Array.isArray(plusActions) && plusActions.length === 1) return plusActions[0].onClick();
    setOpen((o) => o === "plus" ? null : "plus");
  };
  const handleMore = (e) => {
    e.stopPropagation();
    if (!moreActions || !moreActions.length) return;
    setOpen((o) => o === "more" ? null : "more");
  };
  return /* @__PURE__ */ React.createElement("div", { style: { position: "relative" }, onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("div", { style: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    padding: "3px 4px",
    background: "rgba(255,255,255,0.07)",
    border: "0.5px solid rgba(255,255,255,0.1)",
    borderRadius: 99
  } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handlePlus,
      style: pillBtn,
      onMouseEnter: (e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)",
      onMouseLeave: (e) => e.currentTarget.style.background = "transparent"
    },
    /* @__PURE__ */ React.createElement(Icon, { name: plusIcon, size: 15 })
  ), moreActions && moreActions.length > 0 && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleMore,
      style: pillBtn,
      onMouseEnter: (e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)",
      onMouseLeave: (e) => e.currentTarget.style.background = "transparent"
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "more-h", size: 15 })
  )), open === "plus" && Array.isArray(plusActions) && plusActions.length > 1 && /* @__PURE__ */ React.createElement("div", { style: { ...dropdown, padding: 5, minWidth: 280 } }, plusActions.map((a, i) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: i,
      onClick: () => {
        setOpen(null);
        a.onClick();
      },
      style: mItem,
      onMouseEnter: (e) => e.currentTarget.style.background = "var(--bg-hover)",
      onMouseLeave: (e) => e.currentTarget.style.background = "transparent"
    },
    /* @__PURE__ */ React.createElement("div", { style: a.accent ? { ...mIcon, background: "var(--accent-soft)", color: "var(--accent)" } : mIcon }, /* @__PURE__ */ React.createElement(Icon, { name: a.icon, size: 14, strokeWidth: 1.7 })),
    /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, fontWeight: 500, color: "var(--text)", letterSpacing: "-0.2px" } }, a.label), a.sub && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--text-subtle)", marginTop: 2, letterSpacing: "-0.1px" } }, a.sub))
  ))), open === "more" && moreActions && /* @__PURE__ */ React.createElement("div", { style: { ...dropdown, padding: "6px 0", minWidth: 200 } }, moreActions.map((a, i) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: i,
      onClick: () => {
        setOpen(null);
        a.onClick();
      },
      style: { padding: "10px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 },
      onMouseEnter: (e) => e.currentTarget.style.background = "rgba(255,255,255,0.04)",
      onMouseLeave: (e) => e.currentTarget.style.background = "transparent"
    },
    /* @__PURE__ */ React.createElement(Icon, { name: a.icon, size: 13, style: { color: "var(--text-muted)" } }),
    /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: "var(--text)", letterSpacing: "-0.3px" } }, a.label)
  ))));
};
const Empty = ({ icon = "inbox", title, sub }) => /* @__PURE__ */ React.createElement("div", { style: { padding: 40, textAlign: "center", color: "var(--text-muted)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "inline-flex", padding: 12, border: "0.5px solid var(--border)", borderRadius: 12, marginBottom: 12 } }, /* @__PURE__ */ React.createElement(Icon, { name: icon, size: 20 })), /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 500, color: "var(--text)", fontSize: 14 } }, title), sub ? /* @__PURE__ */ React.createElement("div", { className: "small", style: { marginTop: 4 } }, sub) : null);
const TrendDelta = ({ pct, goodUp = true, suffix, size = 14 }) => {
  if (pct === null || pct === void 0 || isNaN(pct)) return null;
  const up = pct > 0, down = pct < 0, flat = pct === 0;
  const good = flat ? null : up === goodUp;
  const color = good === null ? "var(--text-subtle)" : good ? "var(--green)" : "var(--red)";
  const deg = flat ? 45 : down ? 90 : 0;
  const badge = Math.round(size);
  return /* @__PURE__ */ React.createElement("span", { style: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    lineHeight: 1,
    fontSize: size,
    color,
    letterSpacing: "-0.2px",
    fontVariantNumeric: "tabular-nums"
  } }, /* @__PURE__ */ React.createElement("span", { style: { opacity: 0.85 } }, up ? "+" : down ? "\u2212" : "", Math.abs(pct), "%"), /* @__PURE__ */ React.createElement("span", { style: {
    width: badge,
    height: badge,
    borderRadius: "50%",
    flexShrink: 0,
    background: "color-mix(in srgb, currentColor 22%, transparent)",
    display: "grid",
    placeItems: "center"
  } }, /* @__PURE__ */ React.createElement(
    Icon,
    {
      name: "arrow-up-right",
      size: Math.round(badge * 0.72),
      strokeWidth: 3,
      style: { transform: deg ? `rotate(${deg}deg)` : "none" }
    }
  )), suffix && /* @__PURE__ */ React.createElement("span", { style: { fontSize: Math.round(size * 0.78), color: "var(--text-subtle)", letterSpacing: "-0.1px", marginLeft: 1 } }, suffix));
};
const MetricDelta = ({ text, suffix, dir = "up", tone = "muted", size = 14 }) => {
  const color = tone === "good" ? "var(--green)" : tone === "bad" ? "var(--red)" : "var(--text-muted)";
  const deg = dir === "down" ? 90 : dir === "flat" ? 45 : 0;
  const badge = Math.round(size);
  return /* @__PURE__ */ React.createElement("span", { style: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    lineHeight: 1,
    fontSize: size,
    color,
    letterSpacing: "-0.1px",
    fontVariantNumeric: "tabular-nums"
  } }, /* @__PURE__ */ React.createElement("span", { style: { opacity: 0.8 } }, text), /* @__PURE__ */ React.createElement("span", { style: {
    width: badge,
    height: badge,
    borderRadius: "50%",
    flexShrink: 0,
    background: "color-mix(in srgb, currentColor 20%, transparent)",
    display: "grid",
    placeItems: "center"
  } }, /* @__PURE__ */ React.createElement(
    Icon,
    {
      name: "arrow-up-right",
      size: Math.round(badge * 0.72),
      strokeWidth: 3,
      style: { transform: deg ? `rotate(${deg}deg)` : "none" }
    }
  )), suffix && /* @__PURE__ */ React.createElement("span", { style: { fontSize: Math.round(size * 0.82), color: "var(--text-subtle)", opacity: 1, marginLeft: 0 } }, suffix));
};
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
const _DP_MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre"
];
const _DP_DOW = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];
const _dpPad = (n) => String(n).padStart(2, "0");
const _dpStr = (y, m, d) => `${y}-${_dpPad(m + 1)}-${_dpPad(d)}`;
const DatePicker = ({ value, onChange, onClose, accent = "#9e9ae5" }) => {
  const now = /* @__PURE__ */ new Date();
  const parsed = value ? value.split("-").map(Number) : null;
  const [view, setView] = useState(
    parsed ? { y: parsed[0], m: parsed[1] - 1 } : { y: now.getFullYear(), m: now.getMonth() }
  );
  const overlayDown = useRef(false);
  const todayStr = _dpStr(now.getFullYear(), now.getMonth(), now.getDate());
  const first = new Date(view.y, view.m, 1);
  const lead = (first.getDay() + 6) % 7;
  const daysIn = new Date(view.y, view.m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= daysIn; d++) cells.push(d);
  const shift = (delta) => setView((v) => {
    let m = v.m + delta, y = v.y;
    if (m < 0) {
      m = 11;
      y--;
    }
    if (m > 11) {
      m = 0;
      y++;
    }
    return { y, m };
  });
  const NavBtn = ({ icon, onClick }) => /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick,
      style: {
        width: 30,
        height: 30,
        borderRadius: "50%",
        flexShrink: 0,
        background: "rgba(255,255,255,0.06)",
        border: "0.5px solid rgba(255,255,255,0.1)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-muted)",
        transition: "background .1s"
      },
      onMouseEnter: (e) => e.currentTarget.style.background = "rgba(255,255,255,0.11)",
      onMouseLeave: (e) => e.currentTarget.style.background = "rgba(255,255,255,0.06)"
    },
    /* @__PURE__ */ React.createElement(Icon, { name: icon, size: 15 })
  );
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
        overlayDown.current = e.target === e.currentTarget;
      },
      onClick: (e) => {
        if (overlayDown.current && e.target === e.currentTarget) onClose();
      }
    },
    /* @__PURE__ */ React.createElement(
      "div",
      {
        onClick: (e) => e.stopPropagation(),
        style: {
          width: 360,
          background: "#0f0f13",
          border: "0.5px solid rgba(255,255,255,0.1)",
          borderRadius: 28,
          overflow: "hidden",
          padding: "24px 24px 20px",
          animation: "pop .2s cubic-bezier(.2,.8,.2,1)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)"
        }
      },
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 } }, /* @__PURE__ */ React.createElement("div", { style: {
        fontSize: 19,
        fontWeight: 400,
        letterSpacing: "-0.8px",
        color: "var(--text)",
        textTransform: "capitalize",
        fontFamily: "var(--font-display)"
      } }, _DP_MONTHS[view.m], " ", view.y), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement(NavBtn, { icon: "chevron-left", onClick: () => shift(-1) }), /* @__PURE__ */ React.createElement(NavBtn, { icon: "chevron-right", onClick: () => shift(1) }))),
      /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 6 } }, _DP_DOW.map((d, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: {
        textAlign: "center",
        fontSize: 12,
        color: "var(--text-subtle)",
        letterSpacing: "-0.3px",
        padding: "4px 0"
      } }, d))),
      /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", rowGap: 4 } }, cells.map((d, i) => {
        if (d === null) return /* @__PURE__ */ React.createElement("div", { key: i });
        const ds = _dpStr(view.y, view.m, d);
        const isSel = value === ds;
        const isToday = todayStr === ds;
        return /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", justifyContent: "center", padding: "2px 0" } }, /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: () => {
              onChange(ds);
              onClose();
            },
            style: {
              width: 38,
              height: 38,
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 15,
              letterSpacing: "-0.5px",
              fontFamily: "var(--font-sans)",
              background: isSel ? accent : "transparent",
              border: isToday && !isSel ? `1px solid ${accent}77` : "1px solid transparent",
              color: isSel ? "#fff" : "var(--text)",
              transition: "background .1s, border-color .1s"
            },
            onMouseEnter: (e) => {
              if (!isSel) e.currentTarget.style.background = "rgba(255,255,255,0.07)";
            },
            onMouseLeave: (e) => {
              if (!isSel) e.currentTarget.style.background = "transparent";
            }
          },
          d
        ));
      }))
    )
  );
};
const QUICK_FIELD = {
  background: "rgba(255,255,255,0.07)",
  border: "0.5px solid rgba(255,255,255,0.14)",
  borderRadius: 14,
  color: "var(--text)",
  fontSize: 16,
  padding: "10px 22px",
  fontFamily: "var(--font-sans)",
  letterSpacing: "-0.5px",
  outline: "none"
};
const QuickPill = ({ selected, onClick, children, accent = "#9e9ae5" }) => /* @__PURE__ */ React.createElement("button", { onClick, style: {
  padding: "8px 18px",
  borderRadius: 99,
  fontSize: 13,
  letterSpacing: "-0.5px",
  background: selected ? accent + "22" : "rgba(255,255,255,0.07)",
  border: selected ? `1px solid ${accent}66` : "0.5px solid rgba(255,255,255,0.12)",
  color: selected ? accent : "var(--text-muted)",
  cursor: "pointer",
  fontFamily: "var(--font-sans)",
  transition: "all .1s"
} }, children);
const QuickModal = ({
  open,
  onClose,
  onSubmit,
  canSubmit,
  headerLabel = "Crear nuevo",
  accent = "#9e9ae5",
  titlePlaceholder = "Nombre...",
  titleValue = "",
  onTitleChange,
  secondPlaceholder,
  secondValue = "",
  onSecondChange,
  tabs = [],
  renderTab,
  // Selector de tipo en la barra superior (como Tarea/Evento/Reunión en Tareas)
  types = null,
  type = null,
  onTypeChange
}) => {
  const [activeTab, setActiveTab] = useState(null);
  useEffect(() => {
    if (open) setActiveTab(null);
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const fn = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open]);
  if (!open) return null;
  const toggleTab = (id) => setActiveTab((prev) => prev === id ? null : id);
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      style: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.78)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        animation: "fade .15s ease-out"
      },
      onClick: onClose
    },
    /* @__PURE__ */ React.createElement(
      "div",
      {
        onClick: (e) => e.stopPropagation(),
        style: {
          width: "100%",
          maxWidth: 520,
          background: "#111111",
          border: "0.5px solid rgba(255,255,255,0.08)",
          borderRadius: 32,
          animation: "pop .2s cubic-bezier(.2,.8,.2,1)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minHeight: 420
        }
      },
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 22px 0" } }, /* @__PURE__ */ React.createElement("button", { onClick: onClose, style: {
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.08)",
        border: "0.5px solid rgba(255,255,255,0.1)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-muted)"
      } }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 15 })), types && types.length > 0 ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, types.map((tp) => /* @__PURE__ */ React.createElement("button", { key: tp.id, onClick: () => onTypeChange && onTypeChange(tp.id), style: {
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "6px 13px",
        borderRadius: 99,
        background: type === tp.id ? "rgba(255,255,255,0.09)" : "transparent",
        border: type === tp.id ? "0.5px solid rgba(255,255,255,0.15)" : "0.5px solid rgba(255,255,255,0.06)",
        color: type === tp.id ? "var(--text)" : "var(--text-subtle)",
        fontSize: 12,
        letterSpacing: "-0.4px",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        transition: "all .1s"
      } }, /* @__PURE__ */ React.createElement(Icon, { name: tp.icon, size: 12, strokeWidth: 1.6 }), tp.label))) : /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "var(--text-subtle)", letterSpacing: "-0.5px" } }, headerLabel), /* @__PURE__ */ React.createElement("button", { onClick: () => {
        if (canSubmit) onSubmit();
      }, style: {
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: canSubmit ? accent : "rgba(255,255,255,0.08)",
        border: "none",
        cursor: canSubmit ? "pointer" : "default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        transition: "all .15s",
        opacity: canSubmit ? 1 : 0.4
      } }, /* @__PURE__ */ React.createElement(Icon, { name: "arrow-up", size: 15 }))),
      /* @__PURE__ */ React.createElement("div", { style: { padding: "28px 28px 8px" } }, /* @__PURE__ */ React.createElement(
        "input",
        {
          autoFocus: true,
          placeholder: titlePlaceholder,
          value: titleValue,
          onChange: (e) => onTitleChange && onTitleChange(e.target.value),
          onKeyDown: (e) => {
            if (e.key === "Enter" && canSubmit) onSubmit();
          },
          style: {
            width: "100%",
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: 28,
            fontWeight: 400,
            letterSpacing: "-1.4px",
            color: titleValue ? "var(--text)" : "rgba(255,255,255,0.15)",
            fontFamily: "var(--font-display)",
            caretColor: accent
          }
        }
      ), onSecondChange && /* @__PURE__ */ React.createElement(
        "input",
        {
          placeholder: secondPlaceholder || "Descripci\xF3n (opcional)",
          value: secondValue,
          onChange: (e) => onSecondChange(e.target.value),
          style: {
            width: "100%",
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: 14,
            letterSpacing: "-0.5px",
            marginTop: 8,
            color: secondValue ? "var(--text-muted)" : "rgba(255,255,255,0.13)",
            fontFamily: "var(--font-sans)",
            caretColor: accent
          }
        }
      )),
      /* @__PURE__ */ React.createElement("div", { style: { flex: 1, padding: "0 28px", minHeight: 120, display: "flex", alignItems: "center", justifyContent: "center" } }, !activeTab ? /* @__PURE__ */ React.createElement("div", { style: { color: "rgba(255,255,255,0.08)", fontSize: 13, letterSpacing: "-0.5px" } }, "Selecciona una opci\xF3n abajo") : renderTab ? renderTab(activeTab) : null),
      /* @__PURE__ */ React.createElement("div", { style: { height: "0.5px", background: "rgba(255,255,255,0.07)" } }),
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, padding: "16px 22px 22px", flexWrap: "wrap" } }, tabs.map((tab) => /* @__PURE__ */ React.createElement("button", { key: tab.id, onClick: () => toggleTab(tab.id), style: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 16px",
        borderRadius: 99,
        background: activeTab === tab.id ? accent + "22" : tab.hasVal ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.05)",
        border: activeTab === tab.id ? `0.5px solid ${accent}55` : tab.hasVal ? "0.5px solid rgba(255,255,255,0.18)" : "0.5px solid rgba(255,255,255,0.08)",
        color: activeTab === tab.id ? accent : tab.hasVal ? "var(--text)" : "var(--text-subtle)",
        fontSize: 13,
        letterSpacing: "-0.5px",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        transition: "all .12s"
      } }, /* @__PURE__ */ React.createElement(Icon, { name: tab.icon, size: 13, strokeWidth: 1.6 }), tab.label, tab.hasVal && tab.badge && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, color: accent, marginLeft: 2 } }, tab.badge), tab.hasVal && !tab.badge && /* @__PURE__ */ React.createElement("span", { style: { width: 6, height: 6, borderRadius: "50%", background: accent, flexShrink: 0 } }))))
    )
  );
};
Object.assign(window, { Avatar, Switch, Sidebar, Topbar, Modal, ToastProvider, useToast, StatusChip, Empty, ConfirmProvider, useConfirm, TimePicker, DatePicker, ActionPill, QuickModal, QuickPill, QUICK_FIELD });

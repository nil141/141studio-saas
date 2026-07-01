// Shared primitives: Sidebar, Topbar, Modal, Toast, Switch, Avatar
const { useState, useEffect, useRef, useMemo, createContext, useContext } = React;

const Avatar = ({ name, initials, color, size, src }) => {
  const cls = "avatar" + (size ? " " + size : "");
  const style = color ? { background: color + "33", color: color, borderColor: color + "55" } : {};
  return (
    <span className={cls} style={style} title={name}>
      {src ? <img src={src} alt={name} style={{width:"100%",height:"100%",objectFit:"cover"}}/> : (initials || (name||"?").slice(0,2).toUpperCase())}
    </span>
  );
};

const Switch = ({ on, onChange }) => (
  <button
    aria-pressed={on}
    className={"switch" + (on ? " on" : "")}
    onClick={() => onChange(!on)}
    style={{ border: "0.5px solid var(--border-strong)" }}
  />
);

const Sidebar = ({ current, onNavigate, kind = "agency", session, onAssistant, onQuickCreate }) => {
  const D = window.Data;
  D.useStore();

  const pendingTasks = Object.values(D.TASKS).flat().filter(t => t.column !== "done").length || null;

  const agencySections = [
    {
      title: "Trabajo",
      items: [
        { id: "dashboard",  label: "Inicio",      icon: "home" },
        { id: "projects",   label: "Proyectos",   icon: "folder" },
        { id: "tasks",      label: "Tareas",      icon: "list-todo" },
        { id: "clients",    label: "Clientes",    icon: "users" },
        { id: "campaigns",  label: "Campañas",    icon: "megaphone" },
        { id: "agentes",    label: "Agentes",     icon: "sparkles" },
      ],
    },
    {
      title: "Finanzas",
      items: [
        { id: "income",  label: "Ingresos", icon: "trending-up" },
        { id: "billing", label: "Gastos",   icon: "receipt" },
      ],
    },
    {
      title: "Comunicación",
      items: [
        { id: "mail",   label: "Correo", icon: "mail" },
        { id: "agenda", label: "Agenda", icon: "calendar" },
      ],
    },
  ];

  const clientSections = [
    {
      title: "Tu cuenta",
      items: [
        { id: "client-dashboard",   label: "Inicio",       icon: "home" },
        { id: "client-project",     label: "Tu proyecto",  icon: "folder", badge: 2 },
        { id: "client-invoices",    label: "Facturas",     icon: "receipt" },
        { id: "client-messages",    label: "Mensajes",     icon: "msg-circle" },
      ],
    },
  ];

  const sections = kind === "client" ? clientSections : agencySections;

  const cleanName = (raw, fallback) => {
    if (!raw) return fallback;
    const n = raw.includes("@") ? raw.split("@")[0] : raw;
    return n.charAt(0).toUpperCase() + n.slice(1);
  };
  const me = session
    ? (kind === "agency"
        ? { name: cleanName(session.name || session.email, "Nil"), initials: (cleanName(session.name || session.email, "N"))[0].toUpperCase(), email: session.email || "" }
        : { name: cleanName(session.name || session.email, "Cliente"), initials: (cleanName(session.name || session.email, "C"))[0].toUpperCase(), email: session.email || "" })
    : { name: "Nil", initials: "N", email: "nil@141agency.com" };

  // ── Sliding pill refs ──────────────────────────────────────────────
  const [logoutOpen, setLogoutOpen] = React.useState(false);

  const navContainerRef = useRef(null);
  const itemRefs = useRef({});
  const [pill, setPill] = React.useState(null); // { top, height, animated, visible }
  const firstPill = useRef(true);

  useEffect(() => {
    const activeId = current === "campaign" ? "campaigns" : current;
    const el = itemRefs.current[activeId];
    const container = navContainerRef.current;
    if (!el || !container) {
      // Footer page: fade out the pill
      setPill(prev => prev ? { ...prev, visible: false } : null);
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
    const isActive = current === id || (id === "campaigns" && current === "campaign");
    return (
      <div
        ref={el => { itemRefs.current[id] = el; }}
        onClick={() => onNavigate(id)}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          position:"relative", zIndex:1,
          display:"flex", alignItems:"center", gap:10,
          padding:"9px 10px", borderRadius:10, cursor:"pointer",
          background:"transparent",
          color: isActive ? "#c8c5f2" : hov ? "#cccccc" : "var(--text-muted)",
          transition:"color .12s",
          fontSize:15, fontWeight:400, letterSpacing:"-0.96px", userSelect:"none",
        }}
      >
        <Icon name={icon} size={16} strokeWidth={1.7}/>
        <span style={{flex:1}}>{label}</span>
        {badge ? (
          <span style={{fontSize:11, background:"rgba(255,255,255,0.07)", color:"var(--text-muted)", padding:"1px 7px", borderRadius:99}}>
            {badge}
          </span>
        ) : null}
        {isActive ? <Icon name="chevron" size={13} style={{color:"rgba(158,154,229,0.6)", flexShrink:0}}/> : null}
      </div>
    );
  };

  const FooterItem = ({ icon, label, onClick, kbd, active }) => {
    const [hov, setHov] = React.useState(false);
    return (
      <div
        onClick={onClick}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display:"flex", alignItems:"center", gap:10,
          padding:"9px 10px", borderRadius:10, cursor:"pointer",
          background: active ? "var(--bg-hover)" : "transparent",
          color: active || hov ? "#cccccc" : "var(--text-muted)",
          transition:"color .12s, background .12s",
          fontSize:15, fontWeight:400, letterSpacing:"-0.96px", userSelect:"none",
        }}
      >
        <Icon name={icon} size={16} strokeWidth={1.6}/>
        <span style={{flex:1}}>{label}</span>
        {kbd ? <span style={{fontSize:10, color:"var(--text-subtle)", fontFamily:"var(--font-mono)"}}>{kbd}</span> : null}
      </div>
    );
  };

  return (
    <>
    <aside className="sidebar" style={{
      width: 220,
      background: "var(--bg)",
      display: "flex", flexDirection: "column",
      height: "100vh", position: "sticky", top: 0,
      padding: "20px 12px 16px",
      overflow: "hidden",
      flexShrink: 0,
    }}>
      {/* User profile */}
      <div style={{display:"flex", alignItems:"center", gap:10, padding:"4px 10px 24px 10px"}}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
          background: "rgba(158,154,229,0.18)", color: "#c8c5f2",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 500, letterSpacing: "-0.5px",
        }}>
          {me.initials}
        </div>
        <div style={{minWidth:0}}>
          <div style={{fontSize:15, fontWeight:400, letterSpacing:"-0.96px", color:"var(--text)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
            {me.name}
          </div>
          <div style={{fontSize:12, color:"var(--text-subtle)", letterSpacing:"-0.5px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
            {"@" + (me.email ? me.email.split("@")[0] : me.name.toLowerCase())}
          </div>
        </div>
      </div>

      {/* Nav con secciones */}
      <div ref={navContainerRef} style={{flex:1, overflowY:"auto", scrollbarWidth:"none", msOverflowStyle:"none", position:"relative"}}>
        {/* Sliding pill */}
        {pill && (
          <div style={{
            position:"absolute", left:0, right:0,
            top: pill.top, height: pill.height,
            background:"rgba(158,154,229,0.13)",
            borderRadius:10, pointerEvents:"none", zIndex:0,
            opacity: pill.visible ? 1 : 0,
            transition: `top ${pill.animated ? "0.22s cubic-bezier(0.4,0,0.2,1)" : "0s"}, opacity 0.45s ease`,
          }}/>
        )}
        {sections.map((section, si) => (
          <div key={si} style={{marginBottom: 20}}>
            <div style={{
              fontSize: 11, fontWeight: 500, color: "var(--text-subtle)",
              letterSpacing: "0.06em", textTransform: "uppercase",
              padding: "0 12px", marginBottom: 2,
            }}>
              {section.title}
            </div>
            {section.items.map(it => (
              <NavItem key={it.id} id={it.id} icon={it.icon} label={it.label} badge={it.badge}/>
            ))}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{borderTop:"0.5px solid rgba(255,255,255,0.06)", paddingTop:8, display:"flex", flexDirection:"column", gap:0}}>
        {kind === "agency" && session?.role === "admin" && (
          <FooterItem icon="sparkles" label="Nora IA" onClick={onAssistant} active={current === "nora"}/>
        )}
        <FooterItem icon="settings" label="Configuración" onClick={() => onNavigate("settings")} active={current === "settings"}/>
        <FooterItem icon="log-out" label="Cerrar sesión" onClick={() => setLogoutOpen(true)}/>
      </div>
    </aside>

    {logoutOpen && ReactDOM.createPortal(
      <div onClick={() => setLogoutOpen(false)} style={{
        position:"fixed", inset:0, zIndex:900,
        background:"rgba(0,0,0,0.72)", backdropFilter:"blur(20px)",
        display:"flex", alignItems:"center", justifyContent:"center",
        animation:"fade .15s ease-out",
      }}>
        <div onClick={e => e.stopPropagation()} style={{
          width:340, background:"#161616",
          border:"0.5px solid rgba(255,255,255,0.08)",
          borderRadius:24, padding:"28px 24px 20px",
          boxShadow:"0 32px 80px rgba(0,0,0,0.7)",
          animation:"pop .2s cubic-bezier(.2,.8,.2,1)",
        }}>
          <div style={{fontSize:22, fontWeight:500, letterSpacing:"-0.8px", marginBottom:10}}>¿Seguro?</div>
          <div style={{fontSize:14, color:"var(--text-muted)", lineHeight:1.5, marginBottom:28, letterSpacing:"-0.3px"}}>
            Si cierras sesión tendrás que volver a identificarte para acceder.
          </div>
          <div style={{display:"flex", gap:10}}>
            <button onClick={() => setLogoutOpen(false)} style={{
              flex:1, padding:"13px 0", borderRadius:99,
              background:"rgba(255,255,255,0.07)", border:"0.5px solid rgba(255,255,255,0.1)",
              color:"var(--text)", fontSize:15, letterSpacing:"-0.4px",
              cursor:"pointer", fontFamily:"inherit", fontWeight:400,
              transition:"background .12s",
            }}
              onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.12)"}
              onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.07)"}
            >Cancelar</button>
            <button onClick={() => { setLogoutOpen(false); onNavigate("__logout"); }} style={{
              flex:1, padding:"13px 0", borderRadius:99,
              background:"rgba(220,38,38,0.18)", border:"1.5px solid rgba(220,38,38,0.7)",
              color:"#f87171", fontSize:15, letterSpacing:"-0.4px",
              cursor:"pointer", fontFamily:"inherit", fontWeight:400,
              boxShadow:"0 0 18px rgba(220,38,38,0.25)",
              transition:"background .12s",
            }}
              onMouseEnter={e => e.currentTarget.style.background="rgba(220,38,38,0.28)"}
              onMouseLeave={e => e.currentTarget.style.background="rgba(220,38,38,0.18)"}
            >Cerrar sesión</button>
          </div>
        </div>
      </div>,
      document.body
    )}
    </>
  );
};

const Topbar = ({ crumb, right, theme, setTheme, onSearch, kind = "agency" }) => (
  <div className="topbar">
    <div className="topbar-left grow">
      <div className="search">
        <Icon name="search" size={14}/>
        <input placeholder={kind === "agency" ? "Buscar clientes, proyectos, tareas…" : "Buscar en tu cuenta…"} onChange={e => onSearch && onSearch(e.target.value)} />
        <span className="kbd">⌘K</span>
      </div>
      {crumb ? <div className="crumb" style={{marginLeft: 8}}>{crumb}</div> : null}
    </div>
    <div className="topbar-right">
      {right}
      <button className="btn ghost icon-only" data-tooltip="Notificaciones" onClick={() => {}}>
        <Icon name="bell" size={15}/>
      </button>

    </div>
  </div>
);

const Modal = ({ open, onClose, title, sub, footer, children, size }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={"modal" + (size === "lg" ? " lg" : "")} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">{title}</div>
            {sub ? <div className="modal-sub">{sub}</div> : null}
          </div>
          <button className="btn ghost icon-only sm" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer ? <div className="modal-foot">{footer}</div> : null}
      </div>
    </div>
  );
};

const ToastContext = createContext(null);
const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const push = (msg, kind = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  };
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="toast-stack">
        {toasts.map(t => (
          <div className="toast" key={t.id}>
            <Icon name={t.kind === "success" ? "check" : t.kind === "warn" ? "alert-triangle" : "info"} size={14}/>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
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
    review: { cls: "amber", text: label || "Revisión" },
    active: { cls: "green", text: label || "Activo" },
    paid: { cls: "green", text: label || "Pagada" },
    pending: { cls: "amber", text: label || "Pendiente" },
    overdue: { cls: "red", text: label || "Vencida" },
    approved: { cls: "green", text: label || "Aprobado" },
    done: { cls: "green", text: label || "Hecho" },
    current: { cls: "blue", text: label || "Actual" },
    future: { cls: "", text: label || "Próximo" },
  };
  const m = map[status] || { cls: "", text: label || status };
  return <span className={"chip " + m.cls}>{m.text}</span>;
};

// ── ActionPill — botón de acción estilo Tareas (pill translúcido) ────
// Uso: <ActionPill plusActions={...} moreActions={[...]} />
//   plusActions: () => void  →  el "+" ejecuta directo
//   plusActions: [{icon,label,sub,accent,onClick}, ...]  →  el "+" abre menú
//   moreActions: [{icon,label,onClick}, ...] | null
const ActionPill = ({ plusActions, moreActions, plusIcon = "plus" }) => {
  const [open, setOpen] = useState(null); // null | "plus" | "more"
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  const pillBtn = {
    width: 34, height: 34, borderRadius: "50%",
    background: "transparent", border: "none", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "var(--text-muted)", transition: "background .12s", flexShrink: 0,
  };
  const dropdown = {
    position: "absolute", right: 0, top: "calc(100% + 8px)", zIndex: 50,
    background: "#1a1a1c", border: "0.5px solid rgba(255,255,255,0.1)",
    borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
  };
  const mItem = {
    display: "flex", alignItems: "center", gap: 12, width: "100%",
    padding: "10px 12px", borderRadius: 9, cursor: "pointer",
    background: "transparent", border: 0, fontFamily: "inherit", textAlign: "left",
    transition: "background .1s",
  };
  const mIcon = {
    width: 32, height: 32, borderRadius: 9, flexShrink: 0,
    background: "var(--bg-elev-2)", border: "0.5px solid var(--border)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "var(--text-muted)",
  };

  const handlePlus = (e) => {
    e.stopPropagation();
    if (typeof plusActions === "function") return plusActions();
    if (Array.isArray(plusActions) && plusActions.length === 1) return plusActions[0].onClick();
    setOpen(o => o === "plus" ? null : "plus");
  };
  const handleMore = (e) => {
    e.stopPropagation();
    if (!moreActions || !moreActions.length) return;
    setOpen(o => o === "more" ? null : "more");
  };

  return (
    <div style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
      <div style={{
        display: "flex", alignItems: "center", gap: 2, padding: "3px 4px",
        background: "rgba(255,255,255,0.07)",
        border: "0.5px solid rgba(255,255,255,0.1)",
        borderRadius: 99,
      }}>
        <button onClick={handlePlus} style={pillBtn}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          <Icon name={plusIcon} size={15}/>
        </button>
        {moreActions && moreActions.length > 0 && (
          <button onClick={handleMore} style={pillBtn}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <Icon name="more-h" size={15}/>
          </button>
        )}
      </div>

      {open === "plus" && Array.isArray(plusActions) && plusActions.length > 1 && (
        <div style={{ ...dropdown, padding: 5, minWidth: 280 }}>
          {plusActions.map((a, i) => (
            <button key={i} onClick={() => { setOpen(null); a.onClick(); }} style={mItem}
              onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div style={a.accent ? { ...mIcon, background: "var(--accent-soft)", color: "var(--accent)" } : mIcon}>
                <Icon name={a.icon} size={14} strokeWidth={1.7}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text)", letterSpacing: "-0.2px" }}>{a.label}</div>
                {a.sub && <div style={{ fontSize: 11.5, color: "var(--text-subtle)", marginTop: 2, letterSpacing: "-0.1px" }}>{a.sub}</div>}
              </div>
            </button>
          ))}
        </div>
      )}

      {open === "more" && moreActions && (
        <div style={{ ...dropdown, padding: "6px 0", minWidth: 200 }}>
          {moreActions.map((a, i) => (
            <div key={i} onClick={() => { setOpen(null); a.onClick(); }}
              style={{ padding: "10px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <Icon name={a.icon} size={13} style={{ color: "var(--text-muted)" }}/>
              <span style={{ fontSize: 13, color: "var(--text)", letterSpacing: "-0.3px" }}>{a.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Empty = ({ icon = "inbox", title, sub }) => (
  <div style={{padding: 40, textAlign: "center", color: "var(--text-muted)"}}>
    <div style={{display:"inline-flex", padding: 12, border:"0.5px solid var(--border)", borderRadius: 12, marginBottom: 12}}>
      <Icon name={icon} size={20}/>
    </div>
    <div style={{fontWeight: 500, color: "var(--text)", fontSize: 14}}>{title}</div>
    {sub ? <div className="small" style={{marginTop: 4}}>{sub}</div> : null}
  </div>
);

// Confirm dialog primitive — promise-based via useConfirm()
const ConfirmContext = createContext(null);
const ConfirmProvider = ({ children }) => {
  const [state, setState] = useState(null);
  const confirm = (opts) => new Promise(resolve => setState({ ...opts, resolve }));
  const close = (val) => { state?.resolve(val); setState(null); };
  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div className="modal-overlay" onClick={() => close(false)}>
          <div className="modal" style={{maxWidth: 420}} onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <div className="modal-title">{state.title || "¿Estás seguro?"}</div>
                {state.body ? <div className="modal-sub" style={{marginTop: 6, lineHeight: 1.5}}>{state.body}</div> : null}
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn" onClick={() => close(false)}>{state.cancelLabel || "Cancelar"}</button>
              <button className={"btn " + (state.danger ? "danger" : "primary")}
                style={state.danger ? {background:"var(--red)", color:"#fff", borderColor:"var(--red)"} : {}}
                onClick={() => close(true)}>{state.confirmLabel || "Eliminar"}</button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};
const useConfirm = () => useContext(ConfirmContext);

// ── TimePicker drum-roll ──────────────────────────────────────────────────────
const _TPC_H = 54; // height per item

const TimeColumn = ({ items, selected, onSelect, fmt }) => {
  const ref       = useRef(null);
  const timerRef  = useRef(null);
  const dragging  = useRef(false);
  const startY    = useRef(0);
  const startScroll = useRef(0);
  // Use refs so event-listener closures always see latest values
  const itemsRef    = useRef(items);
  const onSelectRef = useRef(onSelect);
  useEffect(() => { itemsRef.current    = items;    });
  useEffect(() => { onSelectRef.current = onSelect; });

  // Scroll to selected item on mount
  useEffect(() => {
    if (!ref.current) return;
    const idx = items.indexOf(selected);
    if (idx >= 0) ref.current.scrollTop = idx * _TPC_H;
  }, []);

  const doSnap = () => {
    if (!ref.current) return;
    const idx = Math.round(ref.current.scrollTop / _TPC_H);
    const c = Math.max(0, Math.min(itemsRef.current.length - 1, idx));
    ref.current.scrollTo({ top: c * _TPC_H, behavior: 'smooth' });
    onSelectRef.current(itemsRef.current[c]);
  };

  // Wheel / touch scroll: update live + snap on settle
  const handleScroll = () => {
    if (dragging.current) return;
    const idx = Math.round(ref.current.scrollTop / _TPC_H);
    const c = Math.max(0, Math.min(itemsRef.current.length - 1, idx));
    onSelectRef.current(itemsRef.current[c]);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(doSnap, 160);
  };

  // Mouse drag: grab → move → release
  const handleMouseDown = (e) => {
    e.preventDefault();
    dragging.current  = true;
    startY.current    = e.clientY;
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
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };
  }, []);

  return (
    <div style={{ position:'relative', flex:1, height: _TPC_H * 5, overflow:'hidden', cursor:'ns-resize' }}>
      {/* Selection highlight */}
      <div style={{
        position:'absolute', top: _TPC_H * 2, left:2, right:2, height: _TPC_H,
        background:'rgba(255,255,255,0.055)', borderRadius:14,
        pointerEvents:'none', zIndex:1,
      }}/>
      {/* Gradient fade top */}
      <div style={{
        position:'absolute', top:0, left:0, right:0, height: _TPC_H * 2.3,
        background:'linear-gradient(to bottom, #0f0f13 0%, rgba(15,15,19,0) 100%)',
        pointerEvents:'none', zIndex:2,
      }}/>
      {/* Gradient fade bottom */}
      <div style={{
        position:'absolute', bottom:0, left:0, right:0, height: _TPC_H * 2.3,
        background:'linear-gradient(to top, #0f0f13 0%, rgba(15,15,19,0) 100%)',
        pointerEvents:'none', zIndex:2,
      }}/>
      <div
        ref={ref}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        style={{
          height:'100%', overflowY:'scroll', scrollbarWidth:'none', msOverflowStyle:'none',
          paddingTop: _TPC_H * 2, paddingBottom: _TPC_H * 2,
          userSelect:'none',
        }}
      >
        {items.map((item, i) => {
          const isSel = item === selected;
          return (
            <div
              key={i}
              onClick={() => {
                onSelect(item);
                ref.current.scrollTo({ top: i * _TPC_H, behavior:'smooth' });
              }}
              style={{
                height: _TPC_H,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:   28,
                fontWeight: 400,
                color:      isSel ? '#f0f0f0' : 'rgba(255,255,255,0.2)',
                cursor:'pointer', userSelect:'none',
                fontFamily:'var(--font-display)',
                letterSpacing: '-1px',
                transition:'color 0.1s',
              }}
            >
              {fmt ? fmt(item) : item}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TimePicker = ({ value, onChange, onClose }) => {
  const pad = n => String(n).padStart(2, '0');
  const now = new Date();
  const [h, setH] = useState(value ? parseInt(value.split(':')[0]) : now.getHours());
  const [m, setM] = useState(value ? parseInt(value.split(':')[1]) : 0);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const mins  = Array.from({ length: 60 }, (_, i) => i);
  // Solo cerrar si mousedown Y mouseup ocurrieron en el overlay (no al arrastrar desde columna)
  const overlayMouseDown = useRef(false);

  return (
    <div
      style={{
        position:'fixed', inset:0, zIndex:400,
        background:'rgba(0,0,0,0.65)', backdropFilter:'blur(12px)',
        display:'flex', alignItems:'center', justifyContent:'center',
        animation:'fade .15s ease-out',
      }}
      onMouseDown={e => { overlayMouseDown.current = e.target === e.currentTarget; }}
      onClick={e => { if (overlayMouseDown.current && e.target === e.currentTarget) onClose(); }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width:320, background:'#0f0f13',
          border:'0.5px solid rgba(255,255,255,0.1)',
          borderRadius:28, overflow:'hidden',
          animation:'pop .2s cubic-bezier(.2,.8,.2,1)',
          boxShadow:'0 32px 80px rgba(0,0,0,0.7)',
        }}
      >
        {/* Title */}
        <div style={{
          padding:'24px 24px 4px', textAlign:'center',
          fontSize:17, fontWeight:400, letterSpacing:'-0.96px', color:'var(--text)',
        }}>
          Seleccionar hora
        </div>

        {/* Drum roll columns */}
        <div style={{ display:'flex', alignItems:'center', padding:'0 20px 4px', gap:0 }}>
          <TimeColumn items={hours} selected={h} onSelect={setH} fmt={pad}/>
          <div style={{
            width:28, flexShrink:0, textAlign:'center',
            fontSize:34, fontWeight:200, color:'rgba(255,255,255,0.18)',
            userSelect:'none', paddingBottom:2,
          }}>:</div>
          <TimeColumn items={mins} selected={m} onSelect={setM} fmt={pad}/>
        </div>

        {/* Buttons */}
        <div style={{ padding:'12px 16px 16px', display:'flex', flexDirection:'column', gap:8 }}>
          <button
            onClick={() => { onChange(pad(h) + ':' + pad(m)); onClose(); }}
            style={{
              width:'100%', padding:'14px 24px',
              background:'rgba(255,255,255,0.09)',
              border:'0.5px solid rgba(255,255,255,0.12)',
              borderRadius:14,
              color:'#f0f0f0', fontSize:16, letterSpacing:'-0.96px',
              cursor:'pointer', fontFamily:'var(--font-sans)', fontWeight:400,
              transition:'background .1s',
            }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.13)'}
            onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.09)'}
          >
            Confirmar
          </button>
          <button
            onClick={onClose}
            style={{
              width:'100%', padding:'12px 24px',
              background:'transparent', border:'none', borderRadius:14,
              color:'rgba(255,255,255,0.32)', fontSize:15, letterSpacing:'-0.96px',
              cursor:'pointer', fontFamily:'var(--font-sans)',
              transition:'color .1s',
            }}
            onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.55)'}
            onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.32)'}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

// ── QuickModal — shell de creación estilo Tareas (overlay blur, card redondeada,
//    X + flecha de envío, input grande sin bordes, tabs pill abajo) ─────────────
// Uso:
//   <QuickModal open onClose onSubmit canSubmit
//     titlePlaceholder="Nombre..." titleValue={v} onTitleChange={fn}
//     secondPlaceholder="Descripción (opcional)" secondValue={v2} onSecondChange={fn2}
//     tabs={[{id,label,icon,hasVal,badge}]} renderTab={(id)=>nodo} />
const QUICK_FIELD = {
  background:"rgba(255,255,255,0.07)", border:"0.5px solid rgba(255,255,255,0.14)",
  borderRadius:14, color:"var(--text)", fontSize:16, padding:"10px 22px",
  fontFamily:"var(--font-sans)", letterSpacing:"-0.5px", outline:"none",
};

const QuickPill = ({ selected, onClick, children, accent = "#9e9ae5" }) => (
  <button onClick={onClick} style={{
    padding:"8px 18px", borderRadius:99, fontSize:13, letterSpacing:"-0.5px",
    background: selected ? accent + "22" : "rgba(255,255,255,0.07)",
    border: selected ? `1px solid ${accent}66` : "0.5px solid rgba(255,255,255,0.12)",
    color: selected ? accent : "var(--text-muted)",
    cursor:"pointer", fontFamily:"var(--font-sans)", transition:"all .1s",
  }}>
    {children}
  </button>
);

const QuickModal = ({
  open, onClose, onSubmit, canSubmit,
  headerLabel = "Crear nuevo",
  accent = "#9e9ae5",
  titlePlaceholder = "Nombre...",
  titleValue = "", onTitleChange,
  secondPlaceholder, secondValue = "", onSecondChange,
  tabs = [],
  renderTab,
  // Selector de tipo en la barra superior (como Tarea/Evento/Reunión en Tareas)
  types = null, type = null, onTypeChange,
}) => {
  const [activeTab, setActiveTab] = useState(null);
  useEffect(() => { if (open) setActiveTab(null); }, [open]);
  useEffect(() => {
    if (!open) return;
    const fn = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open]);
  if (!open) return null;

  const toggleTab = (id) => setActiveTab(prev => prev === id ? null : id);

  return (
    <div
      style={{
        position:"fixed", inset:0,
        background:"rgba(0,0,0,0.78)",
        backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)",
        zIndex:200,
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:24,
        animation:"fade .15s ease-out",
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width:"100%", maxWidth:520,
          background:"#111111",
          border:"0.5px solid rgba(255,255,255,0.08)",
          borderRadius:32,
          animation:"pop .2s cubic-bezier(.2,.8,.2,1)",
          display:"flex", flexDirection:"column",
          overflow:"hidden",
          minHeight:420,
        }}
      >
        {/* Top bar */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"22px 22px 0" }}>
          <button onClick={onClose} style={{
            width:40, height:40, borderRadius:"50%",
            background:"rgba(255,255,255,0.08)",
            border:"0.5px solid rgba(255,255,255,0.1)",
            cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
            color:"var(--text-muted)",
          }}>
            <Icon name="x" size={15}/>
          </button>

          {types && types.length > 0 ? (
            <div style={{ display:"flex", gap:6 }}>
              {types.map(tp => (
                <button key={tp.id} onClick={() => onTypeChange && onTypeChange(tp.id)} style={{
                  display:"flex", alignItems:"center", gap:5,
                  padding:"6px 13px", borderRadius:99,
                  background: type === tp.id ? "rgba(255,255,255,0.09)" : "transparent",
                  border: type === tp.id ? "0.5px solid rgba(255,255,255,0.15)" : "0.5px solid rgba(255,255,255,0.06)",
                  color: type === tp.id ? "var(--text)" : "var(--text-subtle)",
                  fontSize:12, letterSpacing:"-0.4px", cursor:"pointer",
                  fontFamily:"var(--font-sans)", transition:"all .1s",
                }}>
                  <Icon name={tp.icon} size={12} strokeWidth={1.6}/>
                  {tp.label}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ fontSize:13, color:"var(--text-subtle)", letterSpacing:"-0.5px" }}>{headerLabel}</div>
          )}

          <button onClick={() => { if (canSubmit) onSubmit(); }} style={{
            width:40, height:40, borderRadius:"50%",
            background: canSubmit ? accent : "rgba(255,255,255,0.08)",
            border:"none", cursor: canSubmit ? "pointer" : "default",
            display:"flex", alignItems:"center", justifyContent:"center",
            color:"#fff", transition:"all .15s", opacity: canSubmit ? 1 : 0.4,
          }}>
            <Icon name="arrow-up" size={15}/>
          </button>
        </div>

        {/* Inputs de título + secundario */}
        <div style={{ padding:"28px 28px 8px" }}>
          <input
            autoFocus
            placeholder={titlePlaceholder}
            value={titleValue}
            onChange={e => onTitleChange && onTitleChange(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && canSubmit) onSubmit(); }}
            style={{
              width:"100%", background:"transparent", border:"none", outline:"none",
              fontSize:28, fontWeight:400, letterSpacing:"-1.4px",
              color: titleValue ? "var(--text)" : "rgba(255,255,255,0.15)",
              fontFamily:"var(--font-display)", caretColor: accent,
            }}
          />
          {onSecondChange && (
            <input
              placeholder={secondPlaceholder || "Descripción (opcional)"}
              value={secondValue}
              onChange={e => onSecondChange(e.target.value)}
              style={{
                width:"100%", background:"transparent", border:"none", outline:"none",
                fontSize:14, letterSpacing:"-0.5px", marginTop:8,
                color: secondValue ? "var(--text-muted)" : "rgba(255,255,255,0.13)",
                fontFamily:"var(--font-sans)", caretColor: accent,
              }}
            />
          )}
        </div>

        {/* Zona central — panel del tab activo */}
        <div style={{ flex:1, padding:"0 28px", minHeight:120, display:"flex", alignItems:"center", justifyContent:"center" }}>
          {!activeTab ? (
            <div style={{ color:"rgba(255,255,255,0.08)", fontSize:13, letterSpacing:"-0.5px" }}>
              Selecciona una opción abajo
            </div>
          ) : (renderTab ? renderTab(activeTab) : null)}
        </div>

        {/* Divider */}
        <div style={{ height:"0.5px", background:"rgba(255,255,255,0.07)" }}/>

        {/* Tabs inferiores */}
        <div style={{ display:"flex", gap:8, padding:"16px 22px 22px", flexWrap:"wrap" }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => toggleTab(tab.id)} style={{
              display:"flex", alignItems:"center", gap:6,
              padding:"8px 16px", borderRadius:99,
              background: activeTab === tab.id
                ? accent + "22"
                : tab.hasVal ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.05)",
              border: activeTab === tab.id
                ? `0.5px solid ${accent}55`
                : tab.hasVal ? "0.5px solid rgba(255,255,255,0.18)" : "0.5px solid rgba(255,255,255,0.08)",
              color: activeTab === tab.id ? accent : tab.hasVal ? "var(--text)" : "var(--text-subtle)",
              fontSize:13, letterSpacing:"-0.5px", cursor:"pointer",
              fontFamily:"var(--font-sans)", transition:"all .12s",
            }}>
              <Icon name={tab.icon} size={13} strokeWidth={1.6}/>
              {tab.label}
              {tab.hasVal && tab.badge && (
                <span style={{ fontSize:10, color:accent, marginLeft:2 }}>{tab.badge}</span>
              )}
              {tab.hasVal && !tab.badge && (
                <span style={{ width:6, height:6, borderRadius:"50%", background:accent, flexShrink:0 }}/>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { Avatar, Switch, Sidebar, Topbar, Modal, ToastProvider, useToast, StatusChip, Empty, ConfirmProvider, useConfirm, TimePicker, ActionPill, QuickModal, QuickPill, QUICK_FIELD });

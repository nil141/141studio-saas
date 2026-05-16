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

const Sidebar = ({ current, onNavigate, kind = "agency", session }) => {
  const D = window.Data;
  D.useStore(); // re-render on store changes (badge counts)

  const pendingTasks = Object.values(D.TASKS).flat().filter(t => t.column !== "done").length || null;
  const activeClients = D.CLIENTS.filter(c => c.status === "active").length;

  const agencySections = [
    {
      title: "Trabajo",
      items: [
        { id: "dashboard",  label: "Inicio",     icon: "home" },
        { id: "projects",   label: "Proyectos",  icon: "folder" },
        { id: "tasks",      label: "Tareas",     icon: "list-todo", badge: pendingTasks },
        { id: "clients",    label: "Clientes",   icon: "users" },
        { id: "campaigns",  label: "Campañas",   icon: "megaphone" },
      ],
    },
    {
      title: "Finanzas",
      items: [
        { id: "billing", label: "Facturación", icon: "receipt" },
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

  const me = session
    ? (kind === "agency"
        ? { name: session.name || "Andrés", role: "Founder", initials: session.initials || "AN", color: "#a78bfa" }
        : { name: session.name || "Cliente", role: session.email || "", initials: session.initials || "CL", color: "#fb7185" })
    : D.ME;

  const NavIcon = ({ id, icon, label, badge }) => {
    const isActive = current === id || (id === "campaigns" && current === "campaign");
    return (
      <div
        data-tooltip={label}
        data-tooltip-side="right"
        onClick={() => onNavigate(id)}
        style={{
          position: "relative",
          width: 40, height: 40,
          display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: 10,
          cursor: "pointer",
          background: isActive ? "var(--bg-elev-2)" : "transparent",
          border: isActive ? "0.5px solid var(--border-strong)" : "0.5px solid transparent",
          color: isActive ? "var(--text)" : "var(--text-subtle)",
          transition: "all .12s",
          flexShrink: 0,
        }}
      >
        <Icon name={icon} size={17}/>
        {badge ? (
          <span style={{
            position:"absolute", top:4, right:4,
            minWidth:14, height:14, borderRadius:7,
            background:"var(--accent)", color:"#fff",
            fontSize:9, fontWeight:700,
            display:"flex", alignItems:"center", justifyContent:"center",
            padding:"0 3px",
          }}>{badge > 99 ? "99+" : badge}</span>
        ) : null}
      </div>
    );
  };

  return (
    <aside className="sidebar" style={{
      width: 64,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "12px 0",
      gap: 0,
    }}>
      {/* Logo mark */}
      <div style={{
        width: 36, height: 36, borderRadius: 10, marginBottom: 16,
        background: "var(--bg-elev-2)", border: "0.5px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em",
        fontFamily: "var(--font-display)",
      }}>141</div>

      {/* Nav sections */}
      <div style={{flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2, width:"100%", padding:"0 12px", overflowY:"auto", scrollbarWidth:"none", msOverflowStyle:"none"}}>
        {sections.map((section, si) => (
          <React.Fragment key={si}>
            {si > 0 && (
              <div style={{
                width: 20, height: 1,
                background: "var(--border)",
                margin: "6px 0",
                flexShrink: 0,
              }}/>
            )}
            {section.items.map(it => (
              <NavIcon key={it.id} id={it.id} icon={it.icon} label={it.label} badge={it.badge}/>
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* Footer: avatar + logout */}
      <div style={{display:"flex", flexDirection:"column", alignItems:"center", gap:6, borderTop:"0.5px solid var(--border)", width:"100%", padding:"8px 12px 0"}}>
        <div
          data-tooltip="Cerrar sesión"
          data-tooltip-side="right"
          onClick={() => onNavigate("__logout")}
          style={{
            width:40, height:40, borderRadius:10, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
            color:"var(--text-subtle)", border:"0.5px solid transparent",
            transition:"all .12s",
          }}
        >
          <Icon name="log-out" size={17}/>
        </div>
        <NavIcon id="settings" icon="settings" label="Ajustes"/>
        <Avatar
          name={me.name}
          initials={me.initials}
          color={me.color}
          data-tooltip={me.name}
          data-tooltip-side="right"
        />
      </div>
    </aside>
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

Object.assign(window, { Avatar, Switch, Sidebar, Topbar, Modal, ToastProvider, useToast, StatusChip, Empty, ConfirmProvider, useConfirm });

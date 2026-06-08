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

const Sidebar = ({ current, onNavigate, kind = "agency", session, onAssistant }) => {
  const D = window.Data;
  D.useStore();

  const pendingTasks = Object.values(D.TASKS).flat().filter(t => t.column !== "done").length || null;

  const agencySections = [
    {
      title: "Trabajo",
      items: [
        { id: "dashboard",  label: "Inicio",      icon: "home" },
        { id: "projects",   label: "Proyectos",   icon: "folder" },
        { id: "tasks",      label: "Tareas",      icon: "list-todo", badge: pendingTasks },
        { id: "clients",    label: "Clientes",    icon: "users" },
        { id: "campaigns",  label: "Campañas",    icon: "megaphone" },
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
        ? { name: session.name || "Nil", initials: (session.name || "N")[0].toUpperCase(), email: session.email || "" }
        : { name: session.name || "Cliente", initials: (session.name || "C")[0].toUpperCase(), email: session.email || "" })
    : { name: "Nil", initials: "N", email: "nil@141agency.com" };

  const navItemStyle = (isActive) => ({
    display: "flex", alignItems: "center", gap: 10,
    padding: "9px 10px", borderRadius: 10, cursor: "pointer",
    background: isActive ? "rgba(158,154,229,0.14)" : "transparent",
    color: isActive ? "#c4c1f0" : "var(--text-muted)",
    transition: "all .1s", marginBottom: 2,
    fontSize: 15, fontWeight: isActive ? 500 : 400,
    letterSpacing: "-0.96px",
  });

  const NavItem = ({ id, icon, label, badge }) => {
    const isActive = current === id || (id === "campaigns" && current === "campaign");
    return (
      <div
        onClick={() => onNavigate(id)}
        style={navItemStyle(isActive)}
        onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#e0e0e0"; }}}
        onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}}
      >
        <Icon name={icon} size={16} strokeWidth={1.7}/>
        <span style={{flex:1}}>{label}</span>
        {badge ? (
          <span style={{fontSize:10, background:"rgba(255,255,255,0.08)", color:"var(--text-muted)", padding:"1px 7px", borderRadius:99, fontWeight:600}}>
            {badge}
          </span>
        ) : null}
        {isActive ? <Icon name="chevron" size={12} style={{color:"var(--text-subtle)", flexShrink:0}}/> : null}
      </div>
    );
  };

  const FooterItem = ({ icon, label, onClick, kbd }) => (
    <div
      onClick={onClick}
      style={navItemStyle(false)}
      onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "var(--text)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
    >
      <Icon name={icon} size={16} strokeWidth={1.7}/>
      <span style={{flex:1}}>{label}</span>
      {kbd ? <span style={{fontSize:10, color:"var(--text-subtle)", fontFamily:"var(--font-mono)"}}>{kbd}</span> : null}
    </div>
  );

  return (
    <aside style={{
      width: 220,
      background: "var(--bg)",
      display: "flex", flexDirection: "column",
      height: "100vh", position: "sticky", top: 0,
      padding: "16px 10px 12px",
      overflow: "hidden",
      flexShrink: 0,
    }}>
      {/* User profile */}
      <div style={{display:"flex", alignItems:"center", gap:10, padding:"4px 8px 20px 8px"}}>
        <div style={{
          width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
          background: "rgba(124,112,232,0.2)", color: "#a5b4fc",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 700,
        }}>
          {me.initials}
        </div>
        <div style={{minWidth:0}}>
          <div style={{fontSize:13, fontWeight:600, color:"var(--text)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
            {me.name}
          </div>
          <div style={{fontSize:11, color:"var(--text-subtle)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
            {me.email ? "@" + me.email.split("@")[0] : ""}
          </div>
        </div>
      </div>

      {/* Nav sections */}
      <div style={{flex:1, overflowY:"auto", scrollbarWidth:"none", msOverflowStyle:"none"}}>
        {sections.map((section, si) => (
          <div key={si} style={{marginBottom: 20}}>
            <div style={{
              fontSize: 10, fontWeight: 600, color: "var(--text-subtle)",
              letterSpacing: "0.08em", textTransform: "uppercase",
              padding: "0 10px", marginBottom: 4,
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
      <div style={{borderTop:"0.5px solid var(--border)", paddingTop:10, display:"flex", flexDirection:"column", gap:0}}>
        {kind === "agency" && session?.role === "admin" && (
          <FooterItem icon="sparkles" label="Nora IA" onClick={onAssistant} kbd="⌘J"/>
        )}
        {kind === "agency" && session?.role === "admin" && (
          <FooterItem icon="eye" label="Ver como cliente" onClick={() => onNavigate("__switch")}/>
        )}
        <FooterItem icon="settings" label="Ajustes" onClick={() => onNavigate("settings")}/>
        <FooterItem icon="log-out" label="Cerrar sesión" onClick={() => onNavigate("__logout")}/>
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

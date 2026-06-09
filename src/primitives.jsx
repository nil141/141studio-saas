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

  const navItemStyle = (isActive) => ({
    display: "flex", alignItems: "center", gap: 10,
    padding: "9px 10px", borderRadius: 10, cursor: "pointer",
    background: isActive ? "rgba(158,154,229,0.13)" : "transparent",
    color: isActive ? "#c8c5f2" : "var(--text-muted)",
    transition: "color .12s",
    fontSize: 15, fontWeight: 400,
    letterSpacing: "-0.96px",
    userSelect: "none",
  });

  const NavItem = ({ id, icon, label, badge }) => {
    const [hov, setHov] = React.useState(false);
    const isActive = current === id || (id === "campaigns" && current === "campaign");
    return (
      <div
        onClick={() => onNavigate(id)}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          ...navItemStyle(isActive),
          color: isActive ? "#c8c5f2" : hov ? "#cccccc" : "var(--text-muted)",
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

  const FooterItem = ({ icon, label, onClick, kbd }) => {
    const [hov, setHov] = React.useState(false);
    return (
      <div
        onClick={onClick}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          ...navItemStyle(false),
          color: hov ? "#cccccc" : "var(--text-muted)",
        }}
      >
        <Icon name={icon} size={16} strokeWidth={1.6}/>
        <span style={{flex:1}}>{label}</span>
        {kbd ? <span style={{fontSize:10, color:"var(--text-subtle)", fontFamily:"var(--font-mono)"}}>{kbd}</span> : null}
      </div>
    );
  };

  return (
    <aside style={{
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
      <div style={{flex:1, overflowY:"auto", scrollbarWidth:"none", msOverflowStyle:"none"}}>
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

Object.assign(window, { Avatar, Switch, Sidebar, Topbar, Modal, ToastProvider, useToast, StatusChip, Empty, ConfirmProvider, useConfirm, TimePicker });

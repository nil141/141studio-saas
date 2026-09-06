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

// ── Nav de la agencia (un nivel + "Otros" desplegable + listas) ───────────────
const _NAV_MAIN = [
  { id: "dashboard",     label: "Inicio",        icon: "home" },
  { id: "tasks",         label: "Tareas",        icon: "list-todo" },
  { id: "agenda",        label: "Agenda",        icon: "calendar" },
  { id: "notifications", label: "Notificaciones", icon: "bell" },
];
const _NAV_OTROS = [
  { id: "projects",  label: "Proyectos",   icon: "folder" },
  { id: "clients",   label: "Clientes",    icon: "users" },
  { id: "outreach",  label: "Propuestas Outreach", icon: "send" },
  { id: "income",    label: "Facturación", icon: "trending-up" },
  { id: "billing",   label: "Gastos",      icon: "receipt" },
];
const _navSecLabel = { fontSize: 11, fontWeight: 600, color: "var(--text-subtle)", letterSpacing: "0.01em",
  textTransform: "uppercase", padding: "0 12px", marginBottom: 6, display: "flex", alignItems: "center", gap: 7,
  whiteSpace: "nowrap" };

const AgencyNav = ({ current, curNav, activePid, onNavigate, NavItem, D, navSearch, otrosOpen, toggleOtros, pal }) => {
  const q = (navSearch || "").trim().toLowerCase();
  const nameOf = (c) => c.company || c.name || "Cliente";

  // Proyectos en desarrollo activo (no completados)
  const activeProjects = (D.PROJECTS || []).filter(p => {
    const tks = (D.TASKS && D.TASKS[p.id]) || [];
    const pct = tks.length ? Math.round(tks.filter(t => t.column === "done").length / tks.length * 100) : (p.progress || 0);
    return pct < 100;
  });
  const allProjects = D.PROJECTS || [];
  const matchP = (p) => (p.name || "").toLowerCase().includes(q) || (p.clientName || "").toLowerCase().includes(q);
  const fp = q ? activeProjects.filter(matchP) : activeProjects;
  const fAll = q ? allProjects.filter(matchP) : allProjects;
  const [otrosHov, setOtrosHov] = React.useState(false);
  const [projOpen, setProjOpen] = React.useState(() => { try { return localStorage.getItem("141_nav_proj") === "1"; } catch { return false; } });
  const toggleProj = () => setProjOpen(v => { const n = !v; try { localStorage.setItem("141_nav_proj", n ? "1" : "0"); } catch {} return n; });

  const ListRow = ({ label, color, active, onClick }) => {
    const [hov, setHov] = React.useState(false);
    return (
      <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{ display: "flex", alignItems: "center", gap: 10, height: 34, padding: "0 10px", borderRadius: 10, cursor: "pointer",
          background: active ? "rgba(255,255,255,0.07)" : hov ? "rgba(255,255,255,0.03)" : "transparent",
          color: active ? "#fff" : hov ? "#fff" : "var(--text-muted)", transition: "color .15s, background .15s" }}>
        <span style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, display: "grid", placeItems: "center",
          background: color + "26", color: color, fontSize: 10.5, fontWeight: 600, fontFamily: "var(--font-display)" }}>
          {(label || "?").trim().charAt(0).toUpperCase()}
        </span>
        <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, letterSpacing: "-0.2px", overflow: "hidden", whiteSpace: "nowrap",
          maskImage: "linear-gradient(to right, #000 88%, transparent)", WebkitMaskImage: "linear-gradient(to right, #000 88%, transparent)" }}>{label}</span>
      </div>
    );
  };

  const SkelRow = () => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, height: 34, padding: "0 10px" }}>
      <span className="skel" style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0 }}/>
      <span className="skel" style={{ height: 9, borderRadius: 5, flex: 1, maxWidth: 130 }}/>
    </div>
  );

  return (
    <div style={{ overflowY: "auto", scrollbarWidth: "none", height: "100%", paddingRight: 2 }}>
      {/* Nav plano principal */}
      {_NAV_MAIN.map(it => (
        <NavItem key={it.id} id={it.id} icon={it.icon} label={it.label}/>
      ))}

      {/* Otros — desplegable de un nivel (icono tres puntos + flecha animada) */}
      <div onClick={toggleOtros} onMouseEnter={() => setOtrosHov(true)} onMouseLeave={() => setOtrosHov(false)}
        style={{ display: "flex", alignItems: "center", gap: 11, height: 38, padding: "0 10px", borderRadius: 10, cursor: "pointer",
          background: otrosHov ? "rgba(255,255,255,0.03)" : "transparent",
          color: otrosHov || otrosOpen ? "#fff" : "var(--text-muted)", transition: "color .15s, background .15s",
          fontSize: 14, letterSpacing: "-0.04em", userSelect: "none" }}>
        <Icon name="more-h" size={16} strokeWidth={1.7}/>
        <span style={{ flex: 1 }}>Otros</span>
        <Icon name="chevron-right" size={14} style={{ flexShrink: 0, opacity: 0.6, transform: otrosOpen ? "rotate(90deg)" : "none", transition: "transform .25s cubic-bezier(0.4,0,0.2,1)" }}/>
      </div>
      {otrosOpen && (
        <div style={{ margin: "2px 0 4px", paddingLeft: 8, animation: "pageIn .18s ease-out" }}>
          {_NAV_OTROS.map(it => (
            <NavItem key={it.id} id={it.id} icon={it.icon} label={it.label} nested/>
          ))}
        </div>
      )}

      {/* En desarrollo activo */}
      {!D.READY ? (
        <div style={{ marginTop: 16 }}>
          <div style={{ ..._navSecLabel, color: "var(--accent)", opacity: 0.72 }}>
            <Icon name="activity" size={12} style={{ color: "var(--accent)" }}/>
            <span>En desarrollo activo</span>
          </div>
          <SkelRow/><SkelRow/>
        </div>
      ) : fp.length > 0 ? (
        <div style={{ marginTop: 16 }} className="fade-in">
          <div style={{ ..._navSecLabel, color: "var(--accent)", opacity: 0.72 }}>
            <Icon name="activity" size={12} style={{ color: "var(--accent)" }}/>
            <span>En desarrollo activo</span>
            <span style={{ color: "var(--accent)", fontWeight: 500 }}>{fp.length}</span>
          </div>
          {fp.slice(0, 8).map((p, i) => (
            <ListRow key={p.id} label={p.clientName || p.name} color={pal[i % pal.length]}
              active={false} onClick={() => onNavigate("project", { projectId: p.id })}/>
          ))}
        </div>
      ) : null}

      {/* Todos los proyectos — plegable, cerrado por defecto, con "+" */}
      <div style={{ marginTop: 16, paddingBottom: 8 }}>
        <div onClick={toggleProj}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer",
            padding: "0 12px", marginBottom: 6, userSelect: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, fontWeight: 600,
            color: "var(--text-subtle)", letterSpacing: "0.01em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
            <span>Todos los proyectos</span>
          </div>
          <Icon name="plus" size={13} style={{ color: "var(--text-subtle)", flexShrink: 0,
            transform: projOpen ? "rotate(45deg)" : "none", transition: "transform .2s" }}/>
        </div>
        {projOpen && (fAll.length === 0 ? (
          <div style={{ fontSize: 12.5, color: "var(--text-subtle)", padding: "4px 12px" }}>
            {q ? "Sin resultados." : "Aún no tienes proyectos."}
          </div>
        ) : (
          <div style={{ animation: "sectionIn .2s ease-out" }}>
            {fAll.map((p, i) => (
              <ListRow key={p.id} label={p.name || "Proyecto"} color={pal[i % pal.length]}
                active={false} onClick={() => onNavigate("project", { projectId: p.id })}/>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const Sidebar = ({ current, currentParams, onNavigate, kind = "agency", session, onAssistant, onQuickCreate, onToggleCollapse }) => {
  const D = window.Data;
  D.useStore();

  const pendingTasks = Object.values(D.TASKS).flat().filter(t => t.column !== "done").length || null;

  let clientUnread = 0;
  try {
    let l = D.NOTIFICATIONS || [];
    const pid = sessionStorage.getItem("141_preview_client");
    if (pid) l = l.filter(n => n.clientId === pid);
    clientUnread = l.filter(n => !n.read).length;
  } catch {}

  // "Inicio" va fijo arriba, fuera de las categorías plegables
  const topItem = { id: "dashboard", label: "Inicio", icon: "home" };

  const agencySections = [
    {
      title: "Trabajo",
      items: [
        { id: "projects",   label: "Proyectos",   icon: "folder" },
        { id: "tasks",      label: "Tareas",      icon: "list-todo" },
        { id: "clients",    label: "Clientes",    icon: "users" },
        { id: "campaigns",  label: "Campañas",    icon: "megaphone" },
      ],
    },
    {
      title: "Finanzas",
      items: [
        { id: "income",  label: "Facturación", icon: "trending-up" },
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
        { id: "client-dashboard",     label: "Inicio",              icon: "home" },
        { id: "client-status",        label: "Estado del proyecto", icon: "activity" },
        { id: "client-docs",          label: "Documentación",       icon: "file-text" },
        { id: "client-credentials",   label: "Credenciales",        icon: "lock" },
      ],
    },
  ];

  const sections = kind === "client" ? clientSections : agencySections;
  const drilldown = kind === "agency";
  const sectionOfItem = {};
  sections.forEach(s => s.items.forEach(it => { sectionOfItem[it.id] = s.title; }));
  const SECTION_ICONS = { "Trabajo": "layers", "Finanzas": "trending-up", "Comunicación": "msg-circle" };

  // Las páginas de detalle mapean a su item de menú (para que el sidebar no
  // salga de la categoría): un proyecto → Proyectos, una campaña → Campañas.
  const _mapNav = (c) =>
    c === "campaign" ? "campaigns" :
    c === "project" ? "projects" :
    c === "clientDetail" ? "clients" : c;
  const curNav = _mapNav(current);

  // Menú de dos niveles: raíz (categorías en cajas) → detalle (items de una categoría)
  const _activeSection = sectionOfItem[curNav] || null;
  const [openCat, setOpenCat] = React.useState(_activeSection);
  const [detailCat, setDetailCat] = React.useState(_activeSection);
  const openCategory = (title) => { setDetailCat(title); setOpenCat(title); };
  const detailSection = sections.find(s => s.title === detailCat) || sections[0];

  // Al NAVEGAR a una página dentro de una categoría (p. ej. desde un KPI de
  // Inicio), abrimos su nivel 2 automáticamente. Solo al cambiar de página,
  // para no impedir volver al nivel 1 manualmente.
  const prevCurrent = useRef(current);
  useEffect(() => {
    if (!drilldown || prevCurrent.current === current) return;
    prevCurrent.current = current;
    const sec = sectionOfItem[_mapNav(current)];
    if (sec) { setDetailCat(sec); setOpenCat(sec); }
    else setOpenCat(null);
  }, [current]);

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

  // En el portal de cliente (incl. la vista previa de la agencia), la cuenta
  // de abajo debe ser la del CLIENTE, no la del admin que previsualiza.
  let clientAccount = me;
  if (kind === "client") {
    try {
      const cs = D.CLIENTS || [];
      const pid = sessionStorage.getItem("141_preview_client");
      const rec = pid ? cs.find(c => c.id === pid) : cs[0];
      if (rec && rec.name) clientAccount = { name: rec.name, initials: rec.name.trim().charAt(0).toUpperCase(), email: rec.email || "" };
    } catch {}
  }

  // ── Sliding pill refs ──────────────────────────────────────────────
  const [logoutOpen, setLogoutOpen] = React.useState(false);
  const [logoErr, setLogoErr] = React.useState(false);

  // Secciones plegables del menú (se recuerda en el navegador)
  const COLLAPSE_KEY = "sidebar_collapsed_v1";
  const [collapsed, setCollapsed] = React.useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(COLLAPSE_KEY) || "[]")); }
    catch { return new Set(); }
  });
  const toggleSection = (title) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      next.has(title) ? next.delete(title) : next.add(title);
      try { localStorage.setItem(COLLAPSE_KEY, JSON.stringify([...next])); } catch (e) {}
      return next;
    });
  };

  const [navSearch, setNavSearch] = React.useState("");
  const [otrosOpen, setOtrosOpen] = React.useState(() => { try { return localStorage.getItem("141_nav_otros") === "1"; } catch { return false; } });
  const toggleOtros = () => setOtrosOpen(v => { const n = !v; try { localStorage.setItem("141_nav_otros", n ? "1" : "0"); } catch {} return n; });

  // Paleta para las iniciales de la lista de clientes/proyectos
  const _NAVPAL = ["#9e9ae5", "#60a5fa", "#34d399", "#f6a15b", "#e879a6", "#eee586", "#22d3ee", "#f472b6"];

  const navContainerRef = useRef(null);
  const itemRefs = useRef({});
  const [pill, setPill] = React.useState(null); // { top, height, animated, visible }
  const firstPill = useRef(true);

  const measurePill = () => {
    const activeId = current === "campaign" ? "campaigns" : current;
    const el = itemRefs.current[activeId];
    const container = navContainerRef.current;
    const secTitle = sectionOfItem[activeId];
    if (!el || !container || (secTitle && collapsed.has(secTitle))) {
      // Página de footer o sección plegada: se oculta la píldora
      setPill(prev => prev ? { ...prev, visible: false } : null);
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
    // Recolocar tras la animación de plegado/desplegado
    const t = setTimeout(measurePill, 280);
    return () => clearTimeout(t);
  }, [current, collapsed]);

  const NavItem = ({ id, icon, label, badge, onClick, chevron, active, bare, rowRef, nested }) => {
    const [hov, setHov] = React.useState(false);
    const isActive = active != null ? active : (curNav === id);
    return (
      <div
        ref={rowRef}
        onClick={onClick || (() => onNavigate(id))}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          position:"relative", zIndex:1,
          display:"flex", alignItems:"center", gap:11,
          height: nested ? 34 : 38, padding:"0 10px", borderRadius:10, cursor:"pointer",
          background: bare ? "transparent" : (isActive ? "rgba(255,255,255,0.07)" : hov ? "rgba(255,255,255,0.03)" : "transparent"),
          border: bare ? "1px solid transparent" : (isActive ? "1px solid #232324" : "1px solid transparent"),
          color: isActive || hov ? "var(--text)" : "var(--text-muted)",
          opacity: nested && !isActive && !hov ? 0.72 : 1,
          transition:"color .15s, background .15s, opacity .15s",
          fontSize: nested ? 13.5 : 14, fontWeight:400, letterSpacing:"-0.04em", userSelect:"none",
        }}
      >
        <Icon name={icon} size={16} strokeWidth={1.7}/>
        <span style={{flex:1}}>{label}</span>
        {badge ? (
          <span style={{fontSize:11, background:"rgba(255,255,255,0.07)", color:"var(--text-muted)", padding:"1px 7px", borderRadius:99}}>
            {badge}
          </span>
        ) : null}
        {chevron ? <Icon name="chevron" size={15} style={{flexShrink:0, opacity: hov || isActive ? 1 : 0.45, transition:"opacity .15s"}}/> : null}
      </div>
    );
  };

  // Píldoras deslizantes por panel (nivel 1 y nivel 2) — a nivel de Sidebar
  // para que no se reinicien en cada render.
  const rootPaneRef = useRef(null), detailPaneRef = useRef(null);
  const rootRefs = useRef({}), detailRefs = useRef({});
  const [rootPill, setRootPill] = React.useState(null);
  const [detailPill, setDetailPill] = React.useState(null);
  const firstRoot = useRef(true);
  const lastDetailCat = useRef(null);

  const _activeId = curNav;
  const _rootActiveKey = current === "dashboard" ? "dashboard"
    : (sectionOfItem[_activeId] ? "__cat_" + sectionOfItem[_activeId] : null);
  const _detailActiveKey = detailSection && detailSection.items.some(it => it.id === _activeId) ? _activeId : null;

  useEffect(() => {
    const place = (paneEl, refs, key, setPill, animated) => {
      const el = key != null ? refs.current[key] : null;
      if (!el || !paneEl) { setPill(prev => prev ? { ...prev, visible:false } : null); return; }
      const eR = el.getBoundingClientRect(), cR = paneEl.getBoundingClientRect();
      setPill({ top: eR.top - cR.top + paneEl.scrollTop, height: eR.height, animated, visible:true });
    };
    place(rootPaneRef.current, rootRefs, _rootActiveKey, setRootPill, !firstRoot.current);
    firstRoot.current = false;
    // misma categoría → deslizar; categoría distinta → saltar (sin animación)
    place(detailPaneRef.current, detailRefs, _detailActiveKey, setDetailPill, lastDetailCat.current === detailCat);
    lastDetailCat.current = detailCat;
  }, [_rootActiveKey, _detailActiveKey, detailCat, openCat]);

  const renderPill = (pill) => pill ? (
    <div style={{
      position:"absolute", left:0, right:0, top: pill.top + 3, height: pill.height - 6,
      background:"rgba(255,255,255,0.07)", border:"1px solid #232324", borderRadius:16,
      pointerEvents:"none", zIndex:0, opacity: pill.visible ? 1 : 0,
      transition:`top ${pill.animated ? "0.22s cubic-bezier(0.4,0,0.2,1)" : "0s"}, opacity .3s ease`,
    }}/>
  ) : null;

  const FooterItem = ({ icon, label, onClick, kbd, active }) => {
    const [hov, setHov] = React.useState(false);
    return (
      <div
        onClick={onClick}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display:"flex", alignItems:"center", gap:11,
          height:38, padding:"0 10px", borderRadius:10, cursor:"pointer",
          background: active ? "rgba(255,255,255,0.07)" : "transparent",
          border: active ? "1px solid #232324" : "1px solid transparent",
          color: active ? "var(--accent)" : hov ? "#fff" : "var(--text-muted)",
          transition:"color .15s, background .15s",
          fontSize:14, fontWeight:400, letterSpacing:"-0.04em", userSelect:"none",
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
    <aside className="sidebar">
      {/* Cabecera del menú: logo para el cliente, perfil para la agencia */}
      {kind === "client" ? (
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 8px 30px 10px"}}>
          {logoErr ? (
            <div style={{fontFamily:"var(--font-display)", fontSize:16, fontWeight:500, letterSpacing:"-0.5px", color:"#fff"}}>
              141<span style={{color:"var(--accent)"}}>'</span>DIGITAL
            </div>
          ) : (
            <img src="/logo-141digital-white.png" alt="141'DIGITAL"
              onError={() => setLogoErr(true)}
              style={{height:17, width:"auto", maxWidth:130, flexShrink:0, display:"block", objectFit:"contain", opacity:0.95}} />
          )}
          <NotificationBell kind={kind} onNavigate={onNavigate}/>
        </div>
      ) : (
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"4px 8px 16px 8px"}}>
        <img src="/wordmark.svg" alt="141'DIGITAL"
          style={{height:18, width:"auto", maxWidth:150, display:"block", objectFit:"contain", opacity:0.95}} />
        <button onClick={() => onToggleCollapse && onToggleCollapse()} title="Ocultar menú" aria-label="Ocultar menú"
          style={{background:"transparent", border:"none", cursor:"pointer", color:"var(--text-subtle)", padding:6, borderRadius:8, display:"flex"}}
          onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--text-subtle)"}>
          <Icon name="panel-left" size={17} strokeWidth={1.7}/>
        </button>
      </div>
      )}

      {/* Crear + buscador (agencia) */}
      {kind === "agency" && (
        <div style={{display:"flex", flexDirection:"column", gap:8, padding:"0 2px 12px", flexShrink:0}}>
          <button onClick={() => onQuickCreate && onQuickCreate()}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(158,154,229,0.28)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--accent-soft)"}
            style={{display:"flex", alignItems:"center", justifyContent:"center", gap:8, height:40, borderRadius:12,
              background:"var(--accent-soft)", color:"var(--accent)", border:"1px solid rgba(158,154,229,0.3)", cursor:"pointer",
              fontFamily:"inherit", fontSize:14, fontWeight:500, letterSpacing:"-0.02em", transition:"background .12s"}}>
            <Icon name="plus" size={16}/> Crear
          </button>
          <div style={{display:"flex", alignItems:"center", gap:8, height:36, padding:"0 11px", borderRadius:10,
            background:"rgba(255,255,255,0.05)"}}>
            <Icon name="search" size={14} style={{color:"var(--text-subtle)", flexShrink:0}}/>
            <input className="nav-search" value={navSearch} onChange={e => setNavSearch(e.target.value)} placeholder="Buscar clientes y proyectos…"
              style={{flex:1, minWidth:0, background:"transparent", border:"none", outline:"none", color:"var(--text)",
                fontSize:13, fontFamily:"var(--font-sans)", letterSpacing:"-0.2px", caretColor:"var(--accent)"}}/>
            {navSearch && <span onClick={() => setNavSearch("")} style={{cursor:"pointer", color:"var(--text-subtle)", display:"flex"}}><Icon name="x" size={13}/></span>}
          </div>
        </div>
      )}

      {/* Nav con secciones */}
      <div ref={navContainerRef} style={{flex:1, overflow:"hidden", position:"relative"}}>
        {drilldown ? (
          <AgencyNav
            current={current} curNav={curNav} activePid={currentParams && currentParams.projectId} onNavigate={onNavigate} NavItem={NavItem}
            D={D} navSearch={navSearch} otrosOpen={otrosOpen} toggleOtros={toggleOtros} pal={_NAVPAL}/>
        ) : (
          <div style={{overflowY:"auto", scrollbarWidth:"none", height:"100%"}}>
            {sections.map((section, si) => (
              <div key={si} style={{marginBottom: 20}}>
                <div style={{
                  fontSize: 11, fontWeight: 500, color: "var(--text-subtle)",
                  letterSpacing: "0.06em", textTransform: "uppercase",
                  padding: "0 12px", marginBottom: 2,
                }}>{section.title}</div>
                {section.items.map(it => (
                  <NavItem key={it.id} id={it.id} icon={it.icon} label={it.label} badge={it.badge}/>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{borderTop:"0.5px solid rgba(255,255,255,0.06)", paddingTop:8, display:"flex", flexDirection:"column", gap:0}}>
        {kind === "client" ? (
          <button onClick={() => onNavigate("client-settings")}
            style={{display:"flex", alignItems:"center", gap:10, width:"100%", padding:"8px 10px", border:0, borderRadius:10, cursor:"pointer", fontFamily:"inherit", textAlign:"left",
              background: current === "client-settings" ? "var(--bg-hover)" : "transparent", color:"var(--text)"}}>
            <span style={{width:30, height:30, borderRadius:9, flexShrink:0, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.05)", color:"var(--accent)", display:"grid", placeItems:"center", fontSize:14, fontFamily:"var(--font-display)"}}>{(clientAccount.initials || "").charAt(0)}</span>
            <span style={{minWidth:0}}>
              <span style={{display:"block", fontSize:13.5, fontWeight:500, color:"#fff", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{clientAccount.name}</span>
              <span style={{display:"block", fontSize:11.5, color:"var(--text-muted)"}}>Ver tu cuenta</span>
            </span>
          </button>
        ) : (
          <>
            {/* Cuenta iniciada */}
            <button onClick={() => onNavigate("settings")}
              style={{display:"flex", alignItems:"center", gap:10, width:"100%", padding:"8px 10px", border:0, borderRadius:10, cursor:"pointer", fontFamily:"inherit", textAlign:"left", marginBottom:2,
                background: current === "settings" ? "var(--bg-hover)" : "transparent"}}
              onMouseEnter={e => { if (current !== "settings") e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
              onMouseLeave={e => { if (current !== "settings") e.currentTarget.style.background = "transparent"; }}>
              <span style={{width:30, height:30, borderRadius:9, flexShrink:0, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.05)", color:"var(--accent)", display:"grid", placeItems:"center", fontSize:14, fontFamily:"var(--font-display)"}}>{(me.initials || "").charAt(0)}</span>
              <span style={{minWidth:0, flex:1}}>
                <span style={{display:"block", fontSize:13.5, fontWeight:500, color:"#fff", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{me.name}</span>
                <span style={{display:"block", fontSize:11.5, color:"var(--text-muted)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{me.email || ("@" + (me.name || "").toLowerCase())}</span>
              </span>
            </button>
            <FooterItem icon="settings" label="Configuración" onClick={() => onNavigate("settings")} active={current === "settings"}/>
          </>
        )}
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

const _notifAgo = (iso) => {
  if (!iso) return "ahora";
  const d = new Date(iso); const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "ahora";
  const m = Math.floor(s / 60); if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60); if (h < 24) return `hace ${h} h`;
  const dd = Math.floor(h / 24); if (dd < 7) return `hace ${dd} d`;
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
};

const _notifRoute = (n) => {
  switch (n && n.kind) {
    case "project":     return "client-status";
    case "task":        return "client-dashboard";
    case "credential":  return "client-credentials";
    case "document":
    case "doc":         return "client-docs";
    case "invoice":     return "client-docs";
    default:            return "client-dashboard";
  }
};

const NotificationBell = ({ kind, onNavigate }) => {
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
    setOpen(o => !o);
  };

  let list = D.NOTIFICATIONS || [];
  if (kind === "client") {
    // Portal del cliente: solo avisos dirigidos al cliente
    list = list.filter(n => (n.target || "client") !== "agency");
    try { const pid = sessionStorage.getItem("141_preview_client"); if (pid) list = list.filter(n => n.clientId === pid); } catch {}
  } else {
    // Campana del CRM (agencia): solo avisos dirigidos a la agencia
    list = list.filter(n => n.target === "agency");
  }
  const unread = list.filter(n => !n.read).length;

  return (
    <div style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
      <button ref={btnRef} className="btn ghost icon-only" aria-label="Notificaciones" onClick={toggle}>
        <Icon name="bell" size={13}/>
        {unread > 0 && (
          <span style={{ position: "absolute", top: 3, right: 3, minWidth: 15, height: 15, padding: "0 3px", borderRadius: 99,
            background: "var(--red)", color: "#fff", fontSize: 9.5, fontWeight: 700, display: "grid", placeItems: "center", lineHeight: 1 }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && ReactDOM.createPortal(
        <div onClick={e => e.stopPropagation()}
          style={{ position: "fixed", left: pos.left, top: pos.top, zIndex: 4000, width: 330, maxWidth: "92vw",
          background: "var(--bg-elev)", border: "0.5px solid var(--border-strong)", borderRadius: 14, overflow: "hidden",
          boxShadow: "0 18px 44px rgba(0,0,0,0.45)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", borderBottom: "0.5px solid var(--border)" }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Notificaciones</div>
            {unread > 0 && <button onClick={() => list.filter(n => !n.read).forEach(n => D.markNotificationRead(n.id))} style={{ background: "transparent", border: 0, color: "var(--text-muted)", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Marcar leídas</button>}
          </div>
          <div style={{ maxHeight: 380, overflowY: "auto" }}>
            {list.length === 0 ? (
              <div style={{ padding: "28px 16px", textAlign: "center", color: "var(--text-subtle)", fontSize: 13 }}>Sin notificaciones</div>
            ) : list.slice(0, 25).map(n => (
              <div key={n.id} onClick={() => { D.markNotificationRead(n.id); setOpen(false); if (!onNavigate) return; if (kind === "agency") { if (n.clientId) onNavigate("clientDetail", { clientId: n.clientId }); } else onNavigate(n.route || _notifRoute(n)); }}
                style={{ display: "flex", gap: 10, padding: "12px 16px", borderBottom: "0.5px solid var(--border)", cursor: "pointer", background: n.read ? "transparent" : "var(--accent-soft)" }}>
                <span style={{ width: 7, height: 7, borderRadius: 99, marginTop: 5, flexShrink: 0, background: n.read ? "transparent" : "var(--accent)" }}/>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{n.title}</div>
                  {n.body && <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.4 }}>{n.body}</div>}
                  <div style={{ fontSize: 11, color: "var(--text-subtle)", marginTop: 4 }}>{_notifAgo(n.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

// Página de Notificaciones (agencia) — mismo estilo que el resto de páginas
const AgencyNotifications = ({ navigate }) => {
  const D = window.Data; D.useStore();
  const list = D.NOTIFICATIONS || [];
  const unread = list.filter(n => !n.read).length;
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Notificaciones</h1>
          <div className="sub">{unread > 0 ? `${unread} sin leer` : "Todo al día"}</div>
        </div>
        {unread > 0 && (
          <button className="btn ghost sm" onClick={() => list.filter(n => !n.read).forEach(n => D.markNotificationRead(n.id))}>
            Marcar todas leídas
          </button>
        )}
      </div>
      {list.length === 0 ? (
        <div style={{ padding: "60px 0" }}>
          <Empty icon="bell" title="Sin notificaciones" sub="Aquí verás la actividad de tu agencia."/>
        </div>
      ) : (
        <div style={{ border: "0.5px solid var(--border)", borderRadius: 16, overflow: "hidden", background: "var(--bg-elev-2)" }}>
          {list.map((n, i) => (
            <div key={n.id}
              onClick={() => { D.markNotificationRead(n.id); if (n.clientId) navigate("clientDetail", { clientId: n.clientId }); }}
              onMouseEnter={e => e.currentTarget.style.background = n.read ? "rgba(255,255,255,0.02)" : "var(--accent-active)"}
              onMouseLeave={e => e.currentTarget.style.background = n.read ? "transparent" : "var(--accent-soft)"}
              style={{ display: "flex", gap: 12, padding: "15px 18px", borderTop: i ? "0.5px solid var(--border)" : "none",
                cursor: "pointer", background: n.read ? "transparent" : "var(--accent-soft)", transition: "background .1s" }}>
              <span style={{ width: 8, height: 8, borderRadius: 99, marginTop: 6, flexShrink: 0, background: n.read ? "var(--text-subtle)" : "var(--accent)" }}/>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{n.title}</div>
                {n.body && <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.45 }}>{n.body}</div>}
                <div style={{ fontSize: 11.5, color: "var(--text-subtle)", marginTop: 4 }}>{_notifAgo(n.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
window.AgencyNotifications = AgencyNotifications;

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
      <NotificationBell kind={kind}/>
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
          <div style={{ minWidth: 0 }}>
            <div className="modal-title">{title}</div>
            {sub ? <div className="modal-sub">{sub}</div> : null}
          </div>
          <button onClick={onClose} style={{
            width: 40, height: 40, borderRadius: "50%", flexShrink: 0, cursor: "pointer",
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.06)",
            display: "grid", placeItems: "center", color: "var(--text-muted)",
          }}><Icon name="x" size={15}/></button>
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
  // Puente global para poder lanzar toasts desde la capa de datos (no-React).
  React.useEffect(() => { window.__pushToast = push; return () => { if (window.__pushToast === push) delete window.__pushToast; }; }, []);
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

// Comparativa estilo outdomode: valor + flecha dentro de un círculo translúcido.
// pct = variación con signo · goodUp = si subir es bueno (verde) o malo (rojo).
const TrendDelta = ({ pct, goodUp = true, suffix, size = 14 }) => {
  if (pct === null || pct === undefined || isNaN(pct)) return null;
  const up = pct > 0, down = pct < 0, flat = pct === 0;
  const good  = flat ? null : (up === goodUp);
  const color = good === null ? "var(--text-subtle)" : good ? "var(--green)" : "var(--red)";
  const deg   = flat ? 45 : down ? 90 : 0;   // flecha: arriba-dcha · abajo-dcha · horizontal
  const badge = Math.round(size);
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, lineHeight:1,
      fontSize:size, color, letterSpacing:"-0.2px", fontVariantNumeric:"tabular-nums" }}>
      <span style={{ opacity:0.85 }}>{up ? "+" : down ? "−" : ""}{Math.abs(pct)}%</span>
      <span style={{ width:badge, height:badge, borderRadius:"50%", flexShrink:0,
        background:"color-mix(in srgb, currentColor 22%, transparent)", display:"grid", placeItems:"center" }}>
        <Icon name="arrow-up-right" size={Math.round(badge * 0.72)} strokeWidth={3}
          style={{ transform: deg ? `rotate(${deg}deg)` : "none" }}/>
      </span>
      {suffix && <span style={{ fontSize:Math.round(size * 0.78), color:"var(--text-subtle)", letterSpacing:"-0.1px", marginLeft:1 }}>{suffix}</span>}
    </span>
  );
};

// Indicador genérico estilo outdomode: texto + flecha en círculo translúcido.
// tone: good (verde) · bad (rojo) · muted (gris) · dir: up · down · flat
const MetricDelta = ({ text, suffix, dir = "up", tone = "muted", size = 14 }) => {
  const color = tone === "good" ? "var(--green)" : tone === "bad" ? "var(--red)" : "var(--text-muted)";
  const deg   = dir === "down" ? 90 : dir === "flat" ? 45 : 0;
  const badge = Math.round(size);
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:6, lineHeight:1,
      fontSize:size, color, letterSpacing:"-0.1px", fontVariantNumeric:"tabular-nums" }}>
      <span style={{ opacity:0.8 }}>{text}</span>
      <span style={{ width:badge, height:badge, borderRadius:"50%", flexShrink:0,
        background:"color-mix(in srgb, currentColor 20%, transparent)", display:"grid", placeItems:"center" }}>
        <Icon name="arrow-up-right" size={Math.round(badge * 0.72)} strokeWidth={3}
          style={{ transform: deg ? `rotate(${deg}deg)` : "none" }}/>
      </span>
      {suffix && <span style={{ fontSize:Math.round(size * 0.82), color:"var(--text-subtle)", opacity:1, marginLeft:0 }}>{suffix}</span>}
    </span>
  );
};

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

// ── DatePicker — calendario mensual (estilo Outdomode) ──────────────────────
//   value: "YYYY-MM-DD" | "" · onChange(dateStr) · onClose()
const _DP_MONTHS = ["enero","febrero","marzo","abril","mayo","junio","julio",
  "agosto","septiembre","octubre","noviembre","diciembre"];
const _DP_DOW = ["Lu","Ma","Mi","Ju","Vi","Sa","Do"];
const _dpPad = n => String(n).padStart(2, "0");
const _dpStr = (y, m, d) => `${y}-${_dpPad(m + 1)}-${_dpPad(d)}`;

const DatePicker = ({ value, onChange, onClose, accent = "#9e9ae5" }) => {
  const now = new Date();
  const parsed = value ? value.split("-").map(Number) : null;
  const [view, setView] = useState(
    parsed ? { y: parsed[0], m: parsed[1] - 1 } : { y: now.getFullYear(), m: now.getMonth() }
  );
  const overlayDown = useRef(false);

  const todayStr = _dpStr(now.getFullYear(), now.getMonth(), now.getDate());
  const first    = new Date(view.y, view.m, 1);
  const lead     = (first.getDay() + 6) % 7; // lunes primero
  const daysIn   = new Date(view.y, view.m + 1, 0).getDate();
  const cells    = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= daysIn; d++) cells.push(d);

  const shift = (delta) => setView(v => {
    let m = v.m + delta, y = v.y;
    if (m < 0)  { m = 11; y--; }
    if (m > 11) { m = 0;  y++; }
    return { y, m };
  });

  const NavBtn = ({ icon, onClick }) => (
    <button onClick={onClick} style={{
      width:30, height:30, borderRadius:"50%", flexShrink:0,
      background:"rgba(255,255,255,0.06)", border:"0.5px solid rgba(255,255,255,0.1)",
      cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
      color:"var(--text-muted)", transition:"background .1s",
    }}
    onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.11)"}
    onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.06)"}>
      <Icon name={icon} size={15}/>
    </button>
  );

  return (
    <div
      style={{
        position:"fixed", inset:0, zIndex:400,
        background:"rgba(0,0,0,0.65)", backdropFilter:"blur(12px)",
        display:"flex", alignItems:"center", justifyContent:"center",
        animation:"fade .15s ease-out",
      }}
      onMouseDown={e => { overlayDown.current = e.target === e.currentTarget; }}
      onClick={e => { if (overlayDown.current && e.target === e.currentTarget) onClose(); }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width:360, background:"#0f0f13",
          border:"0.5px solid rgba(255,255,255,0.1)",
          borderRadius:28, overflow:"hidden", padding:"24px 24px 20px",
          animation:"pop .2s cubic-bezier(.2,.8,.2,1)",
          boxShadow:"0 32px 80px rgba(0,0,0,0.7)",
        }}
      >
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
          <div style={{
            fontSize:19, fontWeight:400, letterSpacing:"-0.8px", color:"var(--text)",
            textTransform:"capitalize", fontFamily:"var(--font-display)",
          }}>
            {_DP_MONTHS[view.m]} {view.y}
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <NavBtn icon="chevron-left"  onClick={() => shift(-1)}/>
            <NavBtn icon="chevron-right" onClick={() => shift(1)}/>
          </div>
        </div>

        {/* Weekday row */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", marginBottom:6 }}>
          {_DP_DOW.map((d, i) => (
            <div key={i} style={{
              textAlign:"center", fontSize:12, color:"var(--text-subtle)",
              letterSpacing:"-0.3px", padding:"4px 0",
            }}>{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", rowGap:4 }}>
          {cells.map((d, i) => {
            if (d === null) return <div key={i}/>;
            const ds      = _dpStr(view.y, view.m, d);
            const isSel   = value === ds;
            const isToday = todayStr === ds;
            return (
              <div key={i} style={{ display:"flex", justifyContent:"center", padding:"2px 0" }}>
                <button
                  onClick={() => { onChange(ds); onClose(); }}
                  style={{
                    width:38, height:38, borderRadius:"50%", cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:15, letterSpacing:"-0.5px", fontFamily:"var(--font-sans)",
                    background: isSel ? accent : "transparent",
                    border: isToday && !isSel ? `1px solid ${accent}77` : "1px solid transparent",
                    color: isSel ? "#fff" : "var(--text)",
                    transition:"background .1s, border-color .1s",
                  }}
                  onMouseEnter={e => { if (!isSel) e.currentTarget.style.background="rgba(255,255,255,0.07)"; }}
                  onMouseLeave={e => { if (!isSel) e.currentTarget.style.background="transparent"; }}
                >
                  {d}
                </button>
              </div>
            );
          })}
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

Object.assign(window, { Avatar, Switch, Sidebar, Topbar, Modal, ToastProvider, useToast, StatusChip, Empty, ConfirmProvider, useConfirm, TimePicker, DatePicker, ActionPill, QuickModal, QuickPill, QUICK_FIELD });

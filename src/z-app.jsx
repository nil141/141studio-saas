// Root app: routing + theme + tweaks + auth gate
const { useState: useStateA, useEffect: useEffectA } = React;

// Enlace directo desde un correo (/?goto=client-status): lo guardamos al cargar
// para que sobreviva al login por enlace mágico y se consuma tras iniciar sesión.
try {
  const _g = new URLSearchParams(window.location.search).get("goto");
  if (_g && /^client-[a-z-]+$/.test(_g)) localStorage.setItem("141_goto", _g);
} catch {}

// ── Session storage helpers ───────────────────────────────────
const _SK  = "141_session";
const _SEK = "141_session_exp";
const _SDK = "141_session_dur";

const _saveSession = (sess, days) => {
  localStorage.setItem(_SDK, String(days));
  if (!days || days === 0) {
    sessionStorage.setItem(_SK, JSON.stringify(sess));
    localStorage.removeItem(_SK); localStorage.removeItem(_SEK);
  } else {
    const exp = days === -1 ? "never" : String(Date.now() + days * 86400000);
    localStorage.setItem(_SK, JSON.stringify(sess));
    localStorage.setItem(_SEK, exp);
    sessionStorage.removeItem(_SK);
  }
};
const _loadSession = () => {
  try {
    const ls = localStorage.getItem(_SK);
    if (ls) {
      const exp = localStorage.getItem(_SEK);
      if (!exp || exp === "never" || parseInt(exp) > Date.now()) return JSON.parse(ls);
      localStorage.removeItem(_SK); localStorage.removeItem(_SEK);
    }
    return JSON.parse(sessionStorage.getItem(_SK) || "null");
  } catch { return null; }
};
const _clearSession = () => {
  sessionStorage.removeItem(_SK);
  localStorage.removeItem(_SK); localStorage.removeItem(_SEK);
};
const _sessionInfo = () => ({
  days: parseInt(localStorage.getItem(_SDK) || "0"),
  exp:  localStorage.getItem(_SEK),
});
window._sessionUtils = { save: _saveSession, info: _sessionInfo };

const TWEAKS_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "dark",
  "density": "balanced",
  "showSearch": true,
  "agencyName": "141'STUDIO"
}/*EDITMODE-END*/;

// ── Navegación móvil superior (estilo app: cuenta + pestañas deslizables) ──
const _MOBILE_TABS = [
  { name: "dashboard",     label: "Inicio" },
  { name: "tasks",         label: "Tareas" },
  { name: "agenda",        label: "Agenda" },
  { name: "projects",      label: "Proyectos" },
  { name: "clients",       label: "Clientes" },
  { name: "outreach",      label: "Outreach" },
  { name: "billing",       label: "Gastos" },
  { name: "notifications", label: "Notificaciones" },
];
const _mapMobileTab = (v) => v === "project" ? "projects" : v === "clientDetail" ? "clients" : v;

const MobileTopNav = ({ view, navigate, session }) => {
  const [menu, setMenu] = React.useState(false);
  const tabsRef = React.useRef(null);
  React.useEffect(() => {
    if (!menu) return;
    const c = () => setMenu(false);
    window.addEventListener("click", c);
    return () => window.removeEventListener("click", c);
  }, [menu]);
  const cur = _mapMobileTab(view.name);
  React.useEffect(() => {
    try {
      const el = tabsRef.current && tabsRef.current.querySelector('[data-active="1"]');
      if (el) el.scrollIntoView({ inline: "center", block: "nearest" });
    } catch {}
  }, [cur]);
  const raw = (session && (session.name || session.email)) || "Nil";
  const nm = raw.includes("@") ? raw.split("@")[0] : raw;
  const name = nm.charAt(0).toUpperCase() + nm.slice(1);
  const initial = name.charAt(0).toUpperCase();
  return (
    <div className="mobile-topnav">
      <div className="mtn-bar">
        <div style={{ position: "relative" }}>
          <button className="mtn-acct" onClick={e => { e.stopPropagation(); setMenu(v => !v); }}>
            <span className="mtn-ava">{initial}</span>
            <span className="mtn-name">{name}</span>
            <Icon name="chevron" size={14} style={{ transform: menu ? "rotate(90deg)" : "none", transition: "transform .15s", color: "var(--text-muted)" }}/>
          </button>
          {menu && (
            <div className="mtn-menu" onClick={e => e.stopPropagation()}>
              <button onClick={() => { setMenu(false); navigate("settings"); }}><Icon name="settings" size={16}/> Configuración</button>
              <button onClick={() => { setMenu(false); navigate("__logout"); }} style={{ color: "var(--red)" }}><Icon name="log-out" size={16}/> Cerrar sesión</button>
            </div>
          )}
        </div>
        <button className="mtn-bell" onClick={() => navigate("notifications")} aria-label="Notificaciones">
          <Icon name="bell" size={19}/>
        </button>
      </div>
      <div className="mtn-tabs" ref={tabsRef}>
        {_MOBILE_TABS.map(t => (
          <button key={t.name} data-active={cur === t.name ? "1" : undefined}
            className={"mtn-tab" + (cur === t.name ? " active" : "")}
            onClick={() => navigate(t.name)}>{t.label}</button>
        ))}
      </div>
    </div>
  );
};

const App = () => {
  window.Data.useStore();   // re-render cuando termina la carga inicial (READY)
  // session: null = logged out (show AuthGate); { role, name, ... } = logged in
  const [session, setSession] = useState(_loadSession);
  const [view, setView] = useState({ name: "dashboard", side: "agency", params: {} });
  const [theme, setTheme] = useState("dark");
  const [modal, setModal] = useState(null);
  const [modalParams, setModalParams] = useState({});
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [quickCreate, setQuickCreate] = useState(false);
  const [quickCreateType, setQuickCreateType] = useState("task");
  const [quickCreateDate, setQuickCreateDate] = useState("");
  const [quickCreateLock, setQuickCreateLock] = useState(false);
  const [quickCreateEdit, setQuickCreateEdit] = useState(null);
  const [loadTimedOut, setLoadTimedOut] = useState(false);
  const [minSplash, setMinSplash] = useState(false);   // tiempo mínimo del loader
  const [navCollapsed, setNavCollapsed] = useState(() => { try { return localStorage.getItem("141_nav_collapsed") === "1"; } catch { return false; } });
  const toggleNav = () => setNavCollapsed(v => { const n = !v; try { localStorage.setItem("141_nav_collapsed", n ? "1" : "0"); } catch {} return n; });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Salvavidas: si la carga inicial tarda demasiado, mostrar la app igualmente.
  useEffect(() => {
    if (!session || window.Data.READY) return;
    const t = setTimeout(() => setLoadTimedOut(true), 6000);
    return () => clearTimeout(t);
  }, [session]);

  // Mantén el loader un mínimo para que se aprecie la animación del logo.
  useEffect(() => {
    if (!session) return;
    const t = setTimeout(() => setMinSplash(true), 1600);
    return () => clearTimeout(t);
  }, [session]);

  // Si Supabase detecta sesión caducada, cerrar sesión y mandar al login
  useEffect(() => {
    const onExpired = () => { _clearSession(); setSession(null); };
    window.addEventListener("141-session-expired", onExpired);
    return () => window.removeEventListener("141-session-expired", onExpired);
  }, []);

  useEffect(() => {
    const onKey = e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        if (session && session.role === "admin") navigate("nora");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [session]);

  // When session changes, reset to default landing for role and load account data
  useEffect(() => {
    if (!session) return;
    // Clients load data from their admin's store, not their own key
    const dataKey = session.role === "client" ? session.adminEmail : session.email;
    window.Data.initAccount(dataKey);
    if (session.role === "admin") {
      setView({ name: "dashboard", side: "agency", params: {} });
    } else {
      // Enlace directo desde un correo: /?goto=client-status lleva a esa sección.
      let goto = null;
      try {
        const g = new URLSearchParams(window.location.search).get("goto") || localStorage.getItem("141_goto");
        if (g && /^client-[a-z-]+$/.test(g)) goto = g;
      } catch {}
      setView({ name: goto || "client-dashboard", side: "client", params: {} });
      try { localStorage.removeItem("141_goto"); } catch {}
      try { if (new URLSearchParams(window.location.search).get("goto")) window.history.replaceState({}, "", window.location.pathname); } catch {}
    }
  }, [session]);

  const navigate = (name, params = {}) => {
    if (name === "__logout") {
      _clearSession();
      window.Data.authSignOut();
      setSession(null);
      return;
    }
    if (name === "__switch") {
      // admin previewing client view (no logout)
      setView({ name: "client-dashboard", side: "client", params: {} });
      return;
    }
    if (name.startsWith("client-")) {
      setView({ name, side: "client", params });
    } else {
      setView({ name, side: "agency", params });
    }
    window.scrollTo({ top: 0 });
    // El contenido ahora hace scroll dentro de .main (no en la ventana),
    // así que también reseteamos ese contenedor al navegar.
    try { requestAnimationFrame(() => { const m = document.querySelector(".main"); if (m) m.scrollTop = 0; }); } catch {}
  };

  const openModal = (name, params = {}) => {
    if (name === "newTask") {
      setQuickCreateEdit(null);
      setQuickCreateType("task");
      setQuickCreateDate(params.date || "");
      setQuickCreateLock(true);
      setQuickCreate(true);
      return;
    }
    if (name === "editTask") {
      setQuickCreateEdit({ task: params.task, pid: params.pid });
      setQuickCreateType("task");
      setQuickCreateDate("");
      setQuickCreateLock(true);
      setQuickCreate(true);
      return;
    }
    setModal(name); setModalParams(params);
  };
  const closeModal = () => setModal(null);

  // ── Not logged in: show auth gate
  if (!session) {
    return <AuthGate onAuth={(acc, days) => { _saveSession(acc, days); setSession(acc); }}/>;
  }

  // Cargar todo a la vez: hasta que la primera carga termina, un loader limpio
  // (evita que unas partes salgan cargadas y otras no).
  if ((!window.Data.READY || !minSplash) && !loadTimedOut) {
    return (
      <div className="app-loader">
        <div className="lg"/>
      </div>
    );
  }

  const renderAgency = () => {
    switch (view.name) {
      case "dashboard": return <AgencyDashboard navigate={navigate} openModal={openModal} session={session}/>;
case "clients": return <AgencyClientsList navigate={navigate} openModal={openModal}/>;
      case "clientDetail": return <AgencyClientDetail navigate={navigate} openModal={openModal} clientId={view.params.clientId}/>;
      case "projects": return <AgencyProjects navigate={navigate} openModal={openModal}/>;
      case "project": return <AgencyProject navigate={navigate} openModal={openModal} projectId={view.params.projectId}/>;
      case "tasks": return <TasksBoard navigate={navigate} openModal={openModal} initialDate={view.params.date}/>;
      case "campaigns": return <CampaignsPage navigate={navigate}/>;
      case "outreach": return <AgencyOutreach navigate={navigate}/>;
      case "campaign":  return <CampaignDetail campaignId={view.params.campaignId} navigate={navigate} initialAction={view.params.action}/>;
      case "agenda": return <AgendaPage navigate={navigate}/>;
      case "notifications": return <AgencyNotifications navigate={navigate}/>;
      case "nora": return <NoraPage/>;
      case "billing": return null; // rendered always below
      case "income": return <IncomePage/>;
      case "mail": return null; // rendered always below
      case "settings": return <SettingsPage/>;
      default: return <AgencyDashboard navigate={navigate} openModal={openModal} session={session}/>;
    }
  };

  const renderClient = () => {
    switch (view.name) {
      case "client-dashboard": return <ClientDashboard navigate={navigate} openModal={openModal} session={session}/>;
      case "client-status": return <ClientStatus navigate={navigate} openModal={openModal} session={session} projectId={view.params.projectId}/>;
      case "client-docs": return <ClientDocs navigate={navigate} openModal={openModal} session={session} projectId={view.params.projectId}/>;
      case "client-credentials": return <ClientCredentials navigate={navigate} openModal={openModal} session={session}/>;
      case "client-notifications": return <ClientNotifications navigate={navigate} session={session}/>;
      case "client-settings": return <ClientSettings navigate={navigate} session={session}/>;
      // compat con enlaces antiguos
      case "client-project": return <ClientStatus navigate={navigate} openModal={openModal} session={session} projectId={view.params.projectId}/>;
      case "client-deliverables": return <ClientStatus navigate={navigate} openModal={openModal} session={session} projectId={view.params.projectId} initialTab="deliverables"/>;
      case "client-invoices": return <ClientDocs navigate={navigate} openModal={openModal} session={session}/>;
      default: return <ClientDashboard navigate={navigate} openModal={openModal} session={session}/>;
    }
  };

  const isClient = view.side === "client";
  const isAdminPreview = isClient && session.role === "admin";
  const sideIndicator = null;
  const _previewId = (() => { try { return sessionStorage.getItem("141_preview_client"); } catch { return null; } })();
  const _previewClient = (isAdminPreview && _previewId) ? (window.Data.CLIENTS || []).find(c => c.id === _previewId) : null;
  const _previewName = _previewClient ? (_previewClient.company || _previewClient.name) : null;
  const _exitPreview = () => { const id = _previewId; try { sessionStorage.removeItem("141_preview_client"); } catch {} if (id) navigate("clientDetail", { clientId: id }); else navigate("clients"); };

  return (
    <>
      {isAdminPreview && (
        <div style={{padding:"7px 16px", background:"var(--amber-soft)", color:"var(--amber)", fontSize: 12.5, borderBottom:"0.5px solid var(--amber)", display:"flex", alignItems:"center", justifyContent:"center", gap:14, flexWrap:"wrap"}}>
          <span>Vista previa del portal{_previewName ? <> de <b>{_previewName}</b></> : ""}</span>
          <button onClick={_exitPreview} style={{padding:"3px 12px", borderRadius:99, border:"0.5px solid var(--amber)", background:"transparent", color:"var(--amber)", fontSize:12, cursor:"pointer", fontFamily:"inherit", fontWeight:500}}>
            ← Volver al panel
          </button>
        </div>
      )}
      <div className={"app fade-in" + (isClient ? " client" : "") + (navCollapsed ? " nav-collapsed" : "")} data-screen-label={view.name}>
        <Sidebar current={view.name} currentParams={view.params} onNavigate={navigate} kind={isClient ? "client" : "agency"} session={session} onAssistant={() => navigate("nora")} onQuickCreate={() => setQuickCreate(true)} onToggleCollapse={toggleNav}/>
        {navCollapsed && !isClient && (
          <button onClick={toggleNav} title="Mostrar menú" aria-label="Mostrar menú"
            style={{ position:"fixed", top:14, left:14, zIndex:50, width:34, height:34, borderRadius:10, cursor:"pointer",
              display:"grid", placeItems:"center", background:"var(--bg-elev)", border:"0.5px solid var(--border)", color:"var(--text-muted)" }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>
            <Icon name="chevrons-right" size={16} strokeWidth={1.7}/>
          </button>
        )}
        <div className="main">
          {!isClient && <MobileTopNav view={view} navigate={navigate} session={session}/>}
          <Topbar theme={theme} setTheme={setTheme} kind={isClient ? "client" : "agency"} right={null}/>
          <div key={view.name} className="page-enter">
            {isClient ? renderClient() : renderAgency()}
          </div>
          {/* GmailView y AgencyBilling siempre montados para cargar en background */}
          {!isClient && (
            <>
              {/* La clase page-enter se añade solo al mostrarse: así la animación se relanza sin desmontar */}
              <div className={view.name === "mail" ? "page-enter" : ""} style={{display: view.name === "mail" ? "contents" : "none"}}>
                <GmailView/>
              </div>
              <div className={view.name === "billing" ? "page-enter" : ""} style={{display: view.name === "billing" ? "contents" : "none"}}>
                <AgencyBilling openModal={openModal}/>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile bottom nav */}
      {!isClient && (
        <nav className="mobile-nav">
          {[
            { name:"dashboard", icon:"home",      label:"Inicio"    },
            { name:"projects",  icon:"folder",    label:"Proyectos" },
            { name:"tasks",     icon:"list-todo", label:"Tareas"    },
            { name:"clients",   icon:"users",     label:"Clientes"  },
            { name:"billing",   icon:"receipt",   label:"Finanzas"  },
          ].map(item => (
            <button key={item.name}
              className={"mobile-nav-item" + (view.name === item.name ? " active" : "")}
              onClick={() => navigate(item.name)}>
              <Icon name={item.icon} size={20}/>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      )}

      <NewProjectModal open={modal === "newProject"} onClose={closeModal} prefilledClientId={modalParams.clientId}/>
      <NewClientModal open={modal === "newClient"} onClose={closeModal} onCreateProject={(clientId) => openModal("newProject", { clientId })}/>
      <NewTaskModal open={modal === "newTask"} onClose={closeModal}/>
      <window.RoutineModal open={modal === "newRoutine" || modal === "editRoutine"} onClose={closeModal}
        routine={modal === "editRoutine" ? modalParams.routine : null} date={modalParams.date}/>
      <NewLeadModal open={modal === "newLead"} onClose={closeModal}/>
      <window.StripeInvoiceModal open={modal === "newInvoice"} onClose={closeModal}/>
      <InviteClientModal open={modal === "invite"} onClose={closeModal} session={session}/>
      <ApproveDeliverableModal open={modal === "approve"} onClose={closeModal} deliverable={modalParams.deliverable}/>
      <AssistantPanel open={assistantOpen} onClose={() => setAssistantOpen(false)}/>
      <QuickCreateModal open={quickCreate} onClose={() => { setQuickCreate(false); setQuickCreateLock(false); setQuickCreateEdit(null); }} defaultType={quickCreateType} defaultDate={quickCreateDate} lockType={quickCreateLock} openModal={openModal} editTask={quickCreateEdit}/>
    </>
  );
};


window.__initApp = () => {
  const _inviteToken = window.location.pathname.match(/^\/invite\/([A-Za-z0-9_-]+)/)?.[1];
  ReactDOM.createRoot(document.getElementById("root")).render(
    _inviteToken
      ? <ToastProvider><OnboardingPage token={_inviteToken}/></ToastProvider>
      : <ToastProvider><ConfirmProvider><App/></ConfirmProvider></ToastProvider>
  );
};

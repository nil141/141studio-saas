// Root app: routing + theme + tweaks + auth gate
const { useState: useStateA, useEffect: useEffectA } = React;

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

const App = () => {
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

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

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
      setView({ name: "client-dashboard", side: "client", params: {} });
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
  };

  const openModal = (name, params = {}) => {
    if (name === "newTask") {
      setQuickCreateType("task");
      setQuickCreateDate(params.date || "");
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

  const renderAgency = () => {
    switch (view.name) {
      case "dashboard": return <AgencyDashboard navigate={navigate} openModal={openModal} session={session}/>;
case "clients": return <AgencyClientsList navigate={navigate} openModal={openModal}/>;
      case "clientDetail": return <AgencyClientDetail navigate={navigate} openModal={openModal} clientId={view.params.clientId}/>;
      case "projects": return <AgencyProjects navigate={navigate} openModal={openModal}/>;
      case "project": return <AgencyProject navigate={navigate} openModal={openModal} projectId={view.params.projectId}/>;
      case "tasks": return <TasksBoard navigate={navigate} openModal={openModal} initialDate={view.params.date}/>;
      case "campaigns": return <CampaignsPage navigate={navigate}/>;
      case "campaign":  return <CampaignDetail campaignId={view.params.campaignId} navigate={navigate} initialAction={view.params.action}/>;
      case "agenda": return <AgendaPage navigate={navigate}/>;
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
      case "client-project": return <ClientProject navigate={navigate} openModal={openModal} session={session}/>;
      case "client-deliverables": return <ClientProject navigate={navigate} openModal={openModal} session={session}/>;
      case "client-invoices": return <SimplePage title="Tus facturas" icon="receipt"/>;
      case "client-messages": return <SimplePage title="Mensajes" icon="msg-circle"/>;
      default: return <ClientDashboard navigate={navigate} openModal={openModal} session={session}/>;
    }
  };

  const isClient = view.side === "client";
  const isAdminPreview = isClient && session.role === "admin";
  const sideIndicator = null;

  return (
    <>
      {isAdminPreview && (
        <div style={{padding:"6px 16px", background:"var(--amber-soft)", color:"var(--amber)", fontSize: 12, textAlign:"center", borderBottom:"0.5px solid var(--amber)"}}>
          Estás viendo el portal como vería <b>Ana (Acme Co.)</b> · vista solo lectura
        </div>
      )}
      <div className={"app" + (isClient ? " client" : "")} data-screen-label={view.name}>
        <Sidebar current={view.name} onNavigate={navigate} kind={isClient ? "client" : "agency"} session={session} onAssistant={() => navigate("nora")} onQuickCreate={() => setQuickCreate(true)}/>
        <div className="main">
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
      <QuickCreateModal open={quickCreate} onClose={() => { setQuickCreate(false); setQuickCreateLock(false); }} defaultType={quickCreateType} defaultDate={quickCreateDate} lockType={quickCreateLock} openModal={openModal}/>
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

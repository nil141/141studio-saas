(() => {
  const { useState: useStateA, useEffect: useEffectA } = React;
  const _SK = "141_session";
  const _SEK = "141_session_exp";
  const _SDK = "141_session_dur";
  const _saveSession = (sess, days) => {
    localStorage.setItem(_SDK, String(days));
    if (!days || days === 0) {
      sessionStorage.setItem(_SK, JSON.stringify(sess));
      localStorage.removeItem(_SK);
      localStorage.removeItem(_SEK);
    } else {
      const exp = days === -1 ? "never" : String(Date.now() + days * 864e5);
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
        localStorage.removeItem(_SK);
        localStorage.removeItem(_SEK);
      }
      return JSON.parse(sessionStorage.getItem(_SK) || "null");
    } catch (e) {
      return null;
    }
  };
  const _clearSession = () => {
    sessionStorage.removeItem(_SK);
    localStorage.removeItem(_SK);
    localStorage.removeItem(_SEK);
  };
  const _sessionInfo = () => ({
    days: parseInt(localStorage.getItem(_SDK) || "0"),
    exp: localStorage.getItem(_SEK)
  });
  window._sessionUtils = { save: _saveSession, info: _sessionInfo };
  const App = () => {
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
    useEffect(() => {
      const onExpired = () => {
        _clearSession();
        setSession(null);
      };
      window.addEventListener("141-session-expired", onExpired);
      return () => window.removeEventListener("141-session-expired", onExpired);
    }, []);
    useEffect(() => {
      const onKey = (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
          e.preventDefault();
          if (session && session.role === "admin") navigate("nora");
        }
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [session]);
    useEffect(() => {
      if (!session) return;
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
      setModal(name);
      setModalParams(params);
    };
    const closeModal = () => setModal(null);
    if (!session) {
      return /* @__PURE__ */ React.createElement(AuthGate, { onAuth: (acc, days) => {
        _saveSession(acc, days);
        setSession(acc);
      } });
    }
    const renderAgency = () => {
      switch (view.name) {
        case "dashboard":
          return /* @__PURE__ */ React.createElement(AgencyDashboard, { navigate, openModal, session });
        case "clients":
          return /* @__PURE__ */ React.createElement(AgencyClientsList, { navigate, openModal });
        case "clientDetail":
          return /* @__PURE__ */ React.createElement(AgencyClientDetail, { navigate, openModal, clientId: view.params.clientId });
        case "projects":
          return /* @__PURE__ */ React.createElement(AgencyProjects, { navigate, openModal });
        case "project":
          return /* @__PURE__ */ React.createElement(AgencyProject, { navigate, openModal, projectId: view.params.projectId });
        case "tasks":
          return /* @__PURE__ */ React.createElement(TasksBoard, { navigate, openModal, initialDate: view.params.date });
        case "campaigns":
          return /* @__PURE__ */ React.createElement(CampaignsPage, { navigate });
        case "campaign":
          return /* @__PURE__ */ React.createElement(CampaignDetail, { campaignId: view.params.campaignId, navigate });
        case "agenda":
          return /* @__PURE__ */ React.createElement(AgendaPage, { navigate });
        case "agentes":
          return /* @__PURE__ */ React.createElement(AgentesPage, { navigate });
        case "nora":
          return /* @__PURE__ */ React.createElement(NoraPage, null);
        case "billing":
          return null;
        // rendered always below
        case "income":
          return /* @__PURE__ */ React.createElement(IncomePage, null);
        case "mail":
          return null;
        // rendered always below
        case "settings":
          return /* @__PURE__ */ React.createElement(SettingsPage, null);
        default:
          return /* @__PURE__ */ React.createElement(AgencyDashboard, { navigate, openModal, session });
      }
    };
    const renderClient = () => {
      switch (view.name) {
        case "client-dashboard":
          return /* @__PURE__ */ React.createElement(ClientDashboard, { navigate, openModal, session });
        case "client-project":
          return /* @__PURE__ */ React.createElement(ClientProject, { navigate, openModal, session });
        case "client-deliverables":
          return /* @__PURE__ */ React.createElement(ClientProject, { navigate, openModal, session });
        case "client-invoices":
          return /* @__PURE__ */ React.createElement(SimplePage, { title: "Tus facturas", icon: "receipt" });
        case "client-messages":
          return /* @__PURE__ */ React.createElement(SimplePage, { title: "Mensajes", icon: "msg-circle" });
        default:
          return /* @__PURE__ */ React.createElement(ClientDashboard, { navigate, openModal, session });
      }
    };
    const isClient = view.side === "client";
    const isAdminPreview = isClient && session.role === "admin";
    const sideIndicator = null;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, isAdminPreview && /* @__PURE__ */ React.createElement("div", { style: { padding: "6px 16px", background: "var(--amber-soft)", color: "var(--amber)", fontSize: 12, textAlign: "center", borderBottom: "0.5px solid var(--amber)" } }, "Est\xE1s viendo el portal como ver\xEDa ", /* @__PURE__ */ React.createElement("b", null, "Ana (Acme Co.)"), " \xB7 vista solo lectura"), /* @__PURE__ */ React.createElement("div", { className: "app" + (isClient ? " client" : ""), "data-screen-label": view.name }, /* @__PURE__ */ React.createElement(Sidebar, { current: view.name, onNavigate: navigate, kind: isClient ? "client" : "agency", session, onAssistant: () => navigate("nora"), onQuickCreate: () => setQuickCreate(true) }), /* @__PURE__ */ React.createElement("div", { className: "main" }, /* @__PURE__ */ React.createElement(Topbar, { theme, setTheme, kind: isClient ? "client" : "agency", right: null }), /* @__PURE__ */ React.createElement("div", { key: view.name, className: "page-enter" }, isClient ? renderClient() : renderAgency()), !isClient && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: view.name === "mail" ? "page-enter" : "", style: { display: view.name === "mail" ? "contents" : "none" } }, /* @__PURE__ */ React.createElement(GmailView, null)), /* @__PURE__ */ React.createElement("div", { className: view.name === "billing" ? "page-enter" : "", style: { display: view.name === "billing" ? "contents" : "none" } }, /* @__PURE__ */ React.createElement(AgencyBilling, { openModal }))))), !isClient && /* @__PURE__ */ React.createElement("nav", { className: "mobile-nav" }, [
      { name: "dashboard", icon: "home", label: "Inicio" },
      { name: "projects", icon: "folder", label: "Proyectos" },
      { name: "tasks", icon: "list-todo", label: "Tareas" },
      { name: "clients", icon: "users", label: "Clientes" },
      { name: "billing", icon: "receipt", label: "Finanzas" }
    ].map((item) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: item.name,
        className: "mobile-nav-item" + (view.name === item.name ? " active" : ""),
        onClick: () => navigate(item.name)
      },
      /* @__PURE__ */ React.createElement(Icon, { name: item.icon, size: 20 }),
      /* @__PURE__ */ React.createElement("span", null, item.label)
    ))), /* @__PURE__ */ React.createElement(NewProjectModal, { open: modal === "newProject", onClose: closeModal, prefilledClientId: modalParams.clientId }), /* @__PURE__ */ React.createElement(NewClientModal, { open: modal === "newClient", onClose: closeModal, onCreateProject: (clientId) => openModal("newProject", { clientId }) }), /* @__PURE__ */ React.createElement(NewTaskModal, { open: modal === "newTask", onClose: closeModal }), /* @__PURE__ */ React.createElement(window.RoutineModal, { open: modal === "newRoutine" || modal === "editRoutine", onClose: closeModal, routine: modal === "editRoutine" ? modalParams.routine : null, date: modalParams.date }), /* @__PURE__ */ React.createElement(NewLeadModal, { open: modal === "newLead", onClose: closeModal }), /* @__PURE__ */ React.createElement(NewInvoiceModal, { open: modal === "newInvoice", onClose: closeModal }), /* @__PURE__ */ React.createElement(InviteClientModal, { open: modal === "invite", onClose: closeModal, session }), /* @__PURE__ */ React.createElement(ApproveDeliverableModal, { open: modal === "approve", onClose: closeModal, deliverable: modalParams.deliverable }), /* @__PURE__ */ React.createElement(AssistantPanel, { open: assistantOpen, onClose: () => setAssistantOpen(false) }), /* @__PURE__ */ React.createElement(QuickCreateModal, { open: quickCreate, onClose: () => {
      setQuickCreate(false);
      setQuickCreateLock(false);
    }, defaultType: quickCreateType, defaultDate: quickCreateDate, lockType: quickCreateLock, openModal }));
  };
  window.__initApp = () => {
    var _a;
    const _inviteToken = (_a = window.location.pathname.match(/^\/invite\/([A-Za-z0-9_-]+)/)) == null ? void 0 : _a[1];
    ReactDOM.createRoot(document.getElementById("root")).render(
      _inviteToken ? /* @__PURE__ */ React.createElement(ToastProvider, null, /* @__PURE__ */ React.createElement(OnboardingPage, { token: _inviteToken })) : /* @__PURE__ */ React.createElement(ToastProvider, null, /* @__PURE__ */ React.createElement(ConfirmProvider, null, /* @__PURE__ */ React.createElement(App, null)))
    );
  };
})();

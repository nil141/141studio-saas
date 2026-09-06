(() => {
  // src/z-app.jsx
  var { useState: useStateA, useEffect: useEffectA } = React;
  try {
    const _g = new URLSearchParams(window.location.search).get("goto");
    if (_g && /^client-[a-z-]+$/.test(_g)) localStorage.setItem("141_goto", _g);
  } catch {
  }
  var _SK = "141_session";
  var _SEK = "141_session_exp";
  var _SDK = "141_session_dur";
  var _saveSession = (sess, days) => {
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
  var _loadSession = () => {
    try {
      const ls = localStorage.getItem(_SK);
      if (ls) {
        const exp = localStorage.getItem(_SEK);
        if (!exp || exp === "never" || parseInt(exp) > Date.now()) return JSON.parse(ls);
        localStorage.removeItem(_SK);
        localStorage.removeItem(_SEK);
      }
      return JSON.parse(sessionStorage.getItem(_SK) || "null");
    } catch {
      return null;
    }
  };
  var _clearSession = () => {
    sessionStorage.removeItem(_SK);
    localStorage.removeItem(_SK);
    localStorage.removeItem(_SEK);
  };
  var _sessionInfo = () => ({
    days: parseInt(localStorage.getItem(_SDK) || "0"),
    exp: localStorage.getItem(_SEK)
  });
  window._sessionUtils = { save: _saveSession, info: _sessionInfo };
  var App = () => {
    window.Data.useStore();
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
    const [minSplash, setMinSplash] = useState(false);
    useEffect(() => {
      document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);
    useEffect(() => {
      if (!session || window.Data.READY) return;
      const t = setTimeout(() => setLoadTimedOut(true), 6e3);
      return () => clearTimeout(t);
    }, [session]);
    useEffect(() => {
      if (!session) return;
      const t = setTimeout(() => setMinSplash(true), 1100);
      return () => clearTimeout(t);
    }, [session]);
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
        let goto = null;
        try {
          const g = new URLSearchParams(window.location.search).get("goto") || localStorage.getItem("141_goto");
          if (g && /^client-[a-z-]+$/.test(g)) goto = g;
        } catch {
        }
        setView({ name: goto || "client-dashboard", side: "client", params: {} });
        try {
          localStorage.removeItem("141_goto");
        } catch {
        }
        try {
          if (new URLSearchParams(window.location.search).get("goto")) window.history.replaceState({}, "", window.location.pathname);
        } catch {
        }
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
    if ((!window.Data.READY || !minSplash) && !loadTimedOut) {
      return /* @__PURE__ */ React.createElement("div", { className: "app-loader" }, /* @__PURE__ */ React.createElement("svg", { className: "lg", viewBox: "0 0 1233.86 193.24", xmlns: "http://www.w3.org/2000/svg" }, /* @__PURE__ */ React.createElement("path", { pathLength: "1", d: "M333.02,5.21h5.11v-.26h56.91c15.26,0,28.6,1.74,40.02,5.21,11.41,3.48,20.93,8.85,28.57,16.15,7.63,7.29,13.37,16.71,17.23,28.26,3.85,11.55,5.78,25.39,5.78,41.54,0,32.29-7.67,55.6-23.01,69.93-15.34,14.32-38.2,21.49-68.59,21.49h-62.03V5.21ZM356.14,25.78v140.89h31.35c11.86,0,22.53-.82,32.01-2.47,9.48-1.65,17.56-5.03,24.23-10.16,6.67-5.12,11.78-12.28,15.34-21.49,3.56-9.2,5.34-21.36,5.34-36.46,0-14.06-1.59-25.61-4.78-34.64-3.19-9.03-7.86-16.19-14.01-21.49-6.15-5.29-13.78-8.98-22.9-11.07s-19.68-3.13-31.68-3.13h-34.9Z" }), /* @__PURE__ */ React.createElement("path", { pathLength: "1", d: "M503.53,5.21h23.12v182.3h-23.12V5.21Z" }), /* @__PURE__ */ React.createElement("path", { pathLength: "1", d: "M545.55,96.62c0-14.58,2.19-27.78,6.56-39.59,4.37-11.8,10.45-21.96,18.23-30.47,7.78-8.5,17.12-15.06,28.01-19.66,10.89-4.6,22.93-6.9,36.13-6.9,10.23,0,20.34,1.52,30.35,4.56,10,3.04,19.01,7.64,27.01,13.8,8,6.17,14.49,13.85,19.45,23.05,4.96,9.2,7.52,19.97,7.67,32.29h-22.01c-.15-8.85-2.08-16.58-5.78-23.18-3.71-6.6-8.52-12.11-14.45-16.54-5.93-4.43-12.56-7.72-19.9-9.9-7.34-2.17-14.78-3.26-22.34-3.26-9.93,0-19.01,1.91-27.23,5.73-8.23,3.82-15.27,9.07-21.12,15.76-5.86,6.69-10.41,14.67-13.67,23.96-3.26,9.29-4.89,19.4-4.89,30.34s1.63,21.01,4.89,30.21c3.26,9.2,7.82,17.19,13.67,23.96,5.85,6.77,12.89,12.02,21.12,15.76,8.23,3.74,17.3,5.6,27.23,5.6,7.41,0,14.41-1.34,21.01-4.04,6.59-2.69,12.48-6.34,17.67-10.94,5.19-4.6,9.63-10.03,13.34-16.28,3.7-6.25,6.45-13.02,8.23-20.31h-56.91v-15.89h81.15v82.82h-15.56v-30.47c-7.71,11.46-17.6,20.36-29.68,26.69-12.08,6.34-25.16,9.51-39.24,9.51-12.75,0-24.53-2.3-35.35-6.9-10.82-4.6-20.2-11.15-28.12-19.66-7.93-8.5-14.16-18.71-18.67-30.6-4.52-11.89-6.78-25.04-6.78-39.46Z" }), /* @__PURE__ */ React.createElement("path", { pathLength: "1", d: "M734.75,5.21h23.12v182.3h-23.12V5.21Z" }), /* @__PURE__ */ React.createElement("path", { pathLength: "1", d: "M771.43,5.21h149.4v24.48h-64.03v157.82h-23.12V29.69h-62.47l.22-24.48Z" }), /* @__PURE__ */ React.createElement("path", { pathLength: "1", d: "M974.63,5.21h24.23l80.26,182.3h-24.23l-18.23-41.41h-100.71l-18.23,41.41h-23.34L974.63,5.21ZM945.73,123.71h81.15l-40.46-91.93-40.68,91.93Z" }), /* @__PURE__ */ React.createElement("path", { pathLength: "1", d: "M1092.46,5.21h23.12v157.82h118.27v24.48h-141.4V5.21Z" }), /* @__PURE__ */ React.createElement("path", { pathLength: "1", d: "M0,57.5v-15.8c18.63,0,31.71-16.83,40.14-34.96v-.52h21.29v181.03h-21.29V33.68C30.82,47.4,17.52,57.5,0,57.5Z" }), /* @__PURE__ */ React.createElement("path", { pathLength: "1", d: "M207.87,142.6h-11.66v44.91h-21.24v-44.91h-97.35v-20.23L174.96,6.23h21.24v116.15h11.66v20.23ZM174.96,122.38V31.86l-75.44,90.51h75.44Z" }), /* @__PURE__ */ React.createElement("path", { pathLength: "1", d: "M219.08,57.5v-15.8c18.63,0,31.71-16.83,40.14-34.96v-.52h21.29v181.03h-21.29V33.68c-9.31,13.73-22.62,23.83-40.14,23.83Z" }), /* @__PURE__ */ React.createElement("path", { pathLength: "1", d: "M316.1,6.23l-1.73,49.75h-15.74l-1.93-49.75h19.4Z" })));
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
        case "outreach":
          return /* @__PURE__ */ React.createElement(AgencyOutreach, { navigate });
        case "campaign":
          return /* @__PURE__ */ React.createElement(CampaignDetail, { campaignId: view.params.campaignId, navigate, initialAction: view.params.action });
        case "agenda":
          return /* @__PURE__ */ React.createElement(AgendaPage, { navigate });
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
        case "client-status":
          return /* @__PURE__ */ React.createElement(ClientStatus, { navigate, openModal, session, projectId: view.params.projectId });
        case "client-docs":
          return /* @__PURE__ */ React.createElement(ClientDocs, { navigate, openModal, session, projectId: view.params.projectId });
        case "client-credentials":
          return /* @__PURE__ */ React.createElement(ClientCredentials, { navigate, openModal, session });
        case "client-notifications":
          return /* @__PURE__ */ React.createElement(ClientNotifications, { navigate, session });
        case "client-settings":
          return /* @__PURE__ */ React.createElement(ClientSettings, { navigate, session });
        // compat con enlaces antiguos
        case "client-project":
          return /* @__PURE__ */ React.createElement(ClientStatus, { navigate, openModal, session, projectId: view.params.projectId });
        case "client-deliverables":
          return /* @__PURE__ */ React.createElement(ClientStatus, { navigate, openModal, session, projectId: view.params.projectId, initialTab: "deliverables" });
        case "client-invoices":
          return /* @__PURE__ */ React.createElement(ClientDocs, { navigate, openModal, session });
        default:
          return /* @__PURE__ */ React.createElement(ClientDashboard, { navigate, openModal, session });
      }
    };
    const isClient = view.side === "client";
    const isAdminPreview = isClient && session.role === "admin";
    const sideIndicator = null;
    const _previewId = (() => {
      try {
        return sessionStorage.getItem("141_preview_client");
      } catch {
        return null;
      }
    })();
    const _previewClient = isAdminPreview && _previewId ? (window.Data.CLIENTS || []).find((c) => c.id === _previewId) : null;
    const _previewName = _previewClient ? _previewClient.company || _previewClient.name : null;
    const _exitPreview = () => {
      const id = _previewId;
      try {
        sessionStorage.removeItem("141_preview_client");
      } catch {
      }
      if (id) navigate("clientDetail", { clientId: id });
      else navigate("clients");
    };
    return /* @__PURE__ */ React.createElement(React.Fragment, null, isAdminPreview && /* @__PURE__ */ React.createElement("div", { style: { padding: "7px 16px", background: "var(--amber-soft)", color: "var(--amber)", fontSize: 12.5, borderBottom: "0.5px solid var(--amber)", display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", null, "Vista previa del portal", _previewName ? /* @__PURE__ */ React.createElement(React.Fragment, null, " de ", /* @__PURE__ */ React.createElement("b", null, _previewName)) : ""), /* @__PURE__ */ React.createElement("button", { onClick: _exitPreview, style: { padding: "3px 12px", borderRadius: 99, border: "0.5px solid var(--amber)", background: "transparent", color: "var(--amber)", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 500 } }, "\u2190 Volver al panel")), /* @__PURE__ */ React.createElement("div", { className: "app fade-in" + (isClient ? " client" : ""), "data-screen-label": view.name }, /* @__PURE__ */ React.createElement(Sidebar, { current: view.name, onNavigate: navigate, kind: isClient ? "client" : "agency", session, onAssistant: () => navigate("nora"), onQuickCreate: () => setQuickCreate(true) }), /* @__PURE__ */ React.createElement("div", { className: "main" }, /* @__PURE__ */ React.createElement(Topbar, { theme, setTheme, kind: isClient ? "client" : "agency", right: null }), /* @__PURE__ */ React.createElement("div", { key: view.name, className: "page-enter" }, isClient ? renderClient() : renderAgency()), !isClient && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: view.name === "mail" ? "page-enter" : "", style: { display: view.name === "mail" ? "contents" : "none" } }, /* @__PURE__ */ React.createElement(GmailView, null)), /* @__PURE__ */ React.createElement("div", { className: view.name === "billing" ? "page-enter" : "", style: { display: view.name === "billing" ? "contents" : "none" } }, /* @__PURE__ */ React.createElement(AgencyBilling, { openModal }))))), !isClient && /* @__PURE__ */ React.createElement("nav", { className: "mobile-nav" }, [
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
    ))), /* @__PURE__ */ React.createElement(NewProjectModal, { open: modal === "newProject", onClose: closeModal, prefilledClientId: modalParams.clientId }), /* @__PURE__ */ React.createElement(NewClientModal, { open: modal === "newClient", onClose: closeModal, onCreateProject: (clientId) => openModal("newProject", { clientId }) }), /* @__PURE__ */ React.createElement(NewTaskModal, { open: modal === "newTask", onClose: closeModal }), /* @__PURE__ */ React.createElement(
      window.RoutineModal,
      {
        open: modal === "newRoutine" || modal === "editRoutine",
        onClose: closeModal,
        routine: modal === "editRoutine" ? modalParams.routine : null,
        date: modalParams.date
      }
    ), /* @__PURE__ */ React.createElement(NewLeadModal, { open: modal === "newLead", onClose: closeModal }), /* @__PURE__ */ React.createElement(window.StripeInvoiceModal, { open: modal === "newInvoice", onClose: closeModal }), /* @__PURE__ */ React.createElement(InviteClientModal, { open: modal === "invite", onClose: closeModal, session }), /* @__PURE__ */ React.createElement(ApproveDeliverableModal, { open: modal === "approve", onClose: closeModal, deliverable: modalParams.deliverable }), /* @__PURE__ */ React.createElement(AssistantPanel, { open: assistantOpen, onClose: () => setAssistantOpen(false) }), /* @__PURE__ */ React.createElement(QuickCreateModal, { open: quickCreate, onClose: () => {
      setQuickCreate(false);
      setQuickCreateLock(false);
      setQuickCreateEdit(null);
    }, defaultType: quickCreateType, defaultDate: quickCreateDate, lockType: quickCreateLock, openModal, editTask: quickCreateEdit }));
  };
  window.__initApp = () => {
    const _inviteToken = window.location.pathname.match(/^\/invite\/([A-Za-z0-9_-]+)/)?.[1];
    ReactDOM.createRoot(document.getElementById("root")).render(
      _inviteToken ? /* @__PURE__ */ React.createElement(ToastProvider, null, /* @__PURE__ */ React.createElement(OnboardingPage, { token: _inviteToken })) : /* @__PURE__ */ React.createElement(ToastProvider, null, /* @__PURE__ */ React.createElement(ConfirmProvider, null, /* @__PURE__ */ React.createElement(App, null)))
    );
  };
})();

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
  var _MOBILE_TABS = [
    { name: "dashboard", label: "Inicio" },
    { name: "tasks", label: "Tareas" },
    { name: "agenda", label: "Agenda" },
    { name: "projects", label: "Proyectos" },
    { name: "clients", label: "Clientes" },
    { name: "outreach", label: "Outreach" },
    { name: "billing", label: "Gastos" },
    { name: "notifications", label: "Notificaciones" }
  ];
  var _mapMobileTab = (v) => v === "project" ? "projects" : v === "clientDetail" ? "clients" : v;
  var MobileTopNav = ({ view, navigate, session }) => {
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
      } catch {
      }
    }, [cur]);
    const raw = session && (session.name || session.email) || "Nil";
    const nm = raw.includes("@") ? raw.split("@")[0] : raw;
    const name = nm.charAt(0).toUpperCase() + nm.slice(1);
    const initial = name.charAt(0).toUpperCase();
    return /* @__PURE__ */ React.createElement("div", { className: "mobile-topnav" }, /* @__PURE__ */ React.createElement("div", { className: "mtn-bar" }, /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement("button", { className: "mtn-acct", onClick: (e) => {
      e.stopPropagation();
      setMenu((v) => !v);
    } }, /* @__PURE__ */ React.createElement("span", { className: "mtn-ava" }, initial), /* @__PURE__ */ React.createElement("span", { className: "mtn-name" }, name), /* @__PURE__ */ React.createElement(Icon, { name: "chevron", size: 14, style: { transform: menu ? "rotate(90deg)" : "none", transition: "transform .15s", color: "var(--text-muted)" } })), menu && /* @__PURE__ */ React.createElement("div", { className: "mtn-menu", onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("button", { onClick: () => {
      setMenu(false);
      navigate("settings");
    } }, /* @__PURE__ */ React.createElement(Icon, { name: "settings", size: 16 }), " Configuraci\xF3n"), /* @__PURE__ */ React.createElement("button", { onClick: () => {
      setMenu(false);
      navigate("__logout");
    }, style: { color: "var(--red)" } }, /* @__PURE__ */ React.createElement(Icon, { name: "log-out", size: 16 }), " Cerrar sesi\xF3n"))), /* @__PURE__ */ React.createElement("button", { className: "mtn-bell", onClick: () => navigate("notifications"), "aria-label": "Notificaciones" }, /* @__PURE__ */ React.createElement(Icon, { name: "bell", size: 19 }))), /* @__PURE__ */ React.createElement("div", { className: "mtn-tabs", ref: tabsRef }, _MOBILE_TABS.map((t) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: t.name,
        "data-active": cur === t.name ? "1" : void 0,
        className: "mtn-tab" + (cur === t.name ? " active" : ""),
        onClick: () => navigate(t.name)
      },
      t.label
    ))));
  };
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
    const [navCollapsed, setNavCollapsed] = useState(() => {
      try {
        return localStorage.getItem("141_nav_collapsed") === "1";
      } catch {
        return false;
      }
    });
    const toggleNav = () => setNavCollapsed((v) => {
      const n = !v;
      try {
        localStorage.setItem("141_nav_collapsed", n ? "1" : "0");
      } catch {
      }
      return n;
    });
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
      const t = setTimeout(() => setMinSplash(true), 1600);
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
      try {
        requestAnimationFrame(() => {
          const m = document.querySelector(".main");
          if (m) m.scrollTop = 0;
        });
      } catch {
      }
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
      return /* @__PURE__ */ React.createElement("div", { className: "app-loader" }, /* @__PURE__ */ React.createElement("div", { className: "lg" }));
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
        case "notifications":
          return /* @__PURE__ */ React.createElement(AgencyNotifications, { navigate });
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
    return /* @__PURE__ */ React.createElement(React.Fragment, null, isAdminPreview && /* @__PURE__ */ React.createElement("div", { style: { padding: "7px 16px", background: "var(--amber-soft)", color: "var(--amber)", fontSize: 12.5, borderBottom: "0.5px solid var(--amber)", display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", null, "Vista previa del portal", _previewName ? /* @__PURE__ */ React.createElement(React.Fragment, null, " de ", /* @__PURE__ */ React.createElement("b", null, _previewName)) : ""), /* @__PURE__ */ React.createElement("button", { onClick: _exitPreview, style: { padding: "3px 12px", borderRadius: 99, border: "0.5px solid var(--amber)", background: "transparent", color: "var(--amber)", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 500 } }, "\u2190 Volver al panel")), /* @__PURE__ */ React.createElement("div", { className: "app fade-in" + (isClient ? " client" : "") + (navCollapsed ? " nav-collapsed" : ""), "data-screen-label": view.name }, /* @__PURE__ */ React.createElement(Sidebar, { current: view.name, currentParams: view.params, onNavigate: navigate, kind: isClient ? "client" : "agency", session, onAssistant: () => navigate("nora"), onQuickCreate: () => setQuickCreate(true), onToggleCollapse: toggleNav }), navCollapsed && !isClient && /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: toggleNav,
        title: "Mostrar men\xFA",
        "aria-label": "Mostrar men\xFA",
        style: {
          position: "fixed",
          top: 14,
          left: 14,
          zIndex: 50,
          width: 34,
          height: 34,
          borderRadius: 10,
          cursor: "pointer",
          display: "grid",
          placeItems: "center",
          background: "var(--bg-elev)",
          border: "0.5px solid var(--border)",
          color: "var(--text-muted)"
        },
        onMouseEnter: (e) => e.currentTarget.style.color = "var(--text)",
        onMouseLeave: (e) => e.currentTarget.style.color = "var(--text-muted)"
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "chevrons-right", size: 16, strokeWidth: 1.7 })
    ), /* @__PURE__ */ React.createElement("div", { className: "main" }, !isClient && /* @__PURE__ */ React.createElement(MobileTopNav, { view, navigate, session }), /* @__PURE__ */ React.createElement(Topbar, { theme, setTheme, kind: isClient ? "client" : "agency", right: null }), /* @__PURE__ */ React.createElement("div", { key: view.name, className: "page-enter" }, isClient ? renderClient() : renderAgency()), !isClient && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: view.name === "mail" ? "page-enter" : "", style: { display: view.name === "mail" ? "contents" : "none" } }, /* @__PURE__ */ React.createElement(GmailView, null)), /* @__PURE__ */ React.createElement("div", { className: view.name === "billing" ? "page-enter" : "", style: { display: view.name === "billing" ? "contents" : "none" } }, /* @__PURE__ */ React.createElement(AgencyBilling, { openModal }))))), !isClient && /* @__PURE__ */ React.createElement("nav", { className: "mobile-nav" }, [
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

(() => {
  const { useState } = React;
  const _HOME_DONE = ["cerrado", "descartado"];
  const _homeToday = (D) => D.today ? D.today() : (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const _homeGreet = () => {
    const h = (/* @__PURE__ */ new Date()).getHours();
    return h < 12 ? "Buenos d\xEDas" : h < 20 ? "Buenas tardes" : "Buenas noches";
  };
  const _HM = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const _homeParseDate = (s) => {
    if (!s) return null;
    const t = String(s).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return /* @__PURE__ */ new Date(t + "T12:00:00");
    const m = t.toLowerCase().match(/^(\d{1,2})\s+([a-záéíóú]{3})/);
    if (m) {
      const mi = _HM.indexOf(m[2].slice(0, 3));
      if (mi >= 0) {
        const now = /* @__PURE__ */ new Date();
        let y = now.getFullYear();
        const d = new Date(y, mi, parseInt(m[1]), 12);
        if (d < new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2)) d.setFullYear(y + 1);
        return d;
      }
    }
    return null;
  };
  const _homeFmtDate = (s) => {
    const d = _homeParseDate(s);
    return d ? `${d.getDate()} ${_HM[d.getMonth()]}` : s || "";
  };
  const HomeCard = ({ icon, color, title, sub, items, onOpen, defaultOpen }) => {
    const [open, setOpen] = useState(!!defaultOpen);
    const expandable = items && items.length > 0;
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "home-card",
        onClick: () => expandable ? setOpen((o) => !o) : onOpen && onOpen(),
        style: {
          borderRadius: 16,
          background: "rgba(255,255,255,0.055)",
          border: "0.5px solid rgba(255,255,255,0.09)",
          cursor: "pointer",
          overflow: "hidden",
          transition: "background .15s"
        },
        onMouseEnter: (e) => e.currentTarget.style.background = "rgba(255,255,255,0.075)",
        onMouseLeave: (e) => e.currentTarget.style.background = "rgba(255,255,255,0.055)"
      },
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 13, padding: "15px 16px" } }, /* @__PURE__ */ React.createElement("div", { style: { flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color } }, /* @__PURE__ */ React.createElement(Icon, { name: icon, size: 15, strokeWidth: 1.8 })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, fontWeight: 600, color: "var(--text)", letterSpacing: "-0.2px", marginBottom: 3 } }, title), sub && /* @__PURE__ */ React.createElement("div", { style: {
        fontSize: 12.5,
        color: "var(--text-muted)",
        lineHeight: 1.5,
        display: "-webkit-box",
        WebkitLineClamp: open ? 10 : 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden"
      } }, sub)), expandable && /* @__PURE__ */ React.createElement(Icon, { name: "chevron-down", size: 15, style: { color: "var(--text-subtle)", flexShrink: 0, marginTop: 3, transform: open ? "rotate(180deg)" : "none", transition: "transform .18s" } })),
      /* @__PURE__ */ React.createElement("div", { style: {
        display: "grid",
        gridTemplateRows: open && expandable ? "1fr" : "0fr",
        transition: "grid-template-rows .34s cubic-bezier(.4,0,.2,1)"
      } }, /* @__PURE__ */ React.createElement("div", { style: { overflow: "hidden", minHeight: 0 } }, /* @__PURE__ */ React.createElement(
        "div",
        {
          onClick: (e) => e.stopPropagation(),
          style: {
            borderTop: "0.5px solid rgba(255,255,255,0.07)",
            padding: "6px 8px 8px",
            opacity: open ? 1 : 0,
            transition: "opacity .22s ease"
          }
        },
        (items || []).map((it, i) => /* @__PURE__ */ React.createElement(
          "div",
          {
            key: i,
            onClick: it.onClick,
            style: { display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 10, cursor: it.onClick ? "pointer" : "default" },
            onMouseEnter: (e) => it.onClick && (e.currentTarget.style.background = "rgba(255,255,255,0.05)"),
            onMouseLeave: (e) => e.currentTarget.style.background = "transparent"
          },
          it.dot && /* @__PURE__ */ React.createElement("span", { style: { width: 7, height: 7, borderRadius: "50%", background: it.dot, flexShrink: 0 } }),
          /* @__PURE__ */ React.createElement("span", { style: { flex: 1, minWidth: 0, fontSize: 13, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, it.label),
          it.right && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11.5, color: "var(--text-subtle)", flexShrink: 0, whiteSpace: "nowrap" } }, it.right)
        )),
        onOpen && /* @__PURE__ */ React.createElement("div", { onClick: onOpen, style: { padding: "9px 10px", fontSize: 12.5, color: "var(--accent)", cursor: "pointer", fontWeight: 500 } }, "Ver todo \u2192")
      )))
    );
  };
  const AgencyHome = ({ navigate, openModal, session }) => {
    const D = window.Data;
    D.useStore();
    const today = _homeToday(D);
    const _base = (session && session.name || "").trim() || (D.SETTINGS && D.SETTINGS.email || "nil@141agency.com");
    const name = _base.includes("@") ? (() => {
      const n = _base.split("@")[0];
      return n.charAt(0).toUpperCase() + n.slice(1);
    })() : _base;
    const [ask, setAsk] = useState("");
    const projIds = new Set((D.PROJECTS || []).map((p) => p.id));
    const liveTasks = Object.entries(D.TASKS || {}).filter(([pid]) => pid === "__none__" || projIds.has(pid)).flatMap(([pid, arr]) => (arr || []).map((t) => ({ ...t, _pid: pid })));
    const todayTasks = liveTasks.filter((t) => t.column !== "done" && t.deadline && t.deadline <= today).sort((a, b) => a.deadline < b.deadline ? -1 : 1);
    const projs = (D.PROJECTS || []).map((p) => {
      const tks = D.TASKS[p.id] || [];
      const pct = tks.length ? Math.round(tks.filter((t) => t.column === "done").length / tks.length * 100) : p.progress || 0;
      return { ...p, _pct: pct };
    });
    const activeProjs = projs.filter((p) => p._pct < 100).sort((a, b) => {
      const da = _homeParseDate(a.deadline), db = _homeParseDate(b.deadline);
      if (da && db) return da - db;
      if (da) return -1;
      if (db) return 1;
      return 0;
    });
    const dueFollowups = (D.OUTREACH || []).filter((o) => o.nextFollowup && !_HOME_DONE.includes(o.status) && !o.convertedClientId && o.nextFollowup <= today).sort((a, b) => a.nextFollowup < b.nextFollowup ? -1 : 1);
    const submitAsk = () => {
      const q = ask.trim();
      try {
        if (q) sessionStorage.setItem("nora_prefill", q);
      } catch (_) {
      }
      navigate("nora");
    };
    const sec = (label, child) => /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 20 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--text-subtle)", marginBottom: 9, letterSpacing: "0.01em" } }, label), child);
    return /* @__PURE__ */ React.createElement("div", { style: { position: "relative", minHeight: "100dvh", padding: "0 24px 60px", background: "transparent" } }, /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 620, margin: "0 auto", paddingTop: "15vh" } }, /* @__PURE__ */ React.createElement("h1", { style: { fontFamily: "var(--font-display)", fontSize: 27, fontWeight: 400, letterSpacing: "-0.04em", margin: "0 0 26px", color: "var(--text)" } }, _homeGreet(), ", ", name, "."), sec("Hoy", todayTasks.length === 0 ? /* @__PURE__ */ React.createElement(HomeCard, { icon: "check", color: "#34d399", title: "Todo hecho por hoy \u{1F389}", sub: "No te queda ninguna tarea pendiente para hoy.", onOpen: () => navigate("tasks") }) : /* @__PURE__ */ React.createElement(
      HomeCard,
      {
        icon: "list-todo",
        color: "#9e9ae5",
        title: `Tienes ${todayTasks.length} tarea${todayTasks.length === 1 ? "" : "s"} para hoy`,
        sub: todayTasks.slice(0, 3).map((t) => t.title).join(" \xB7 "),
        items: todayTasks.slice(0, 8).map((t) => ({ label: t.title, right: t.deadline && t.deadline < today ? "Atrasada" : "Hoy", dot: t.deadline < today ? "var(--red)" : "var(--accent)", onClick: () => navigate("tasks") })),
        onOpen: () => navigate("tasks")
      }
    )), sec("Entregas pr\xF3ximas", activeProjs.length === 0 ? /* @__PURE__ */ React.createElement(HomeCard, { icon: "package", color: "#60a5fa", title: "Sin entregas pendientes", sub: "No tienes proyectos en marcha ahora mismo.", onOpen: () => navigate("projects") }) : /* @__PURE__ */ React.createElement(
      HomeCard,
      {
        icon: "package",
        color: "#60a5fa",
        title: `${activeProjs.length} entrega${activeProjs.length === 1 ? "" : "s"} pr\xF3xima${activeProjs.length === 1 ? "" : "s"}`,
        sub: activeProjs.slice(0, 2).map((p) => `${p.clientName && !["\u2014", "-", "Interno"].includes((p.clientName || "").trim()) ? p.clientName + " | " : ""}${p.name}`).join("  \xB7  "),
        items: activeProjs.slice(0, 8).map((p) => ({ label: `${p.clientName && !["\u2014", "-", "Interno"].includes((p.clientName || "").trim()) ? p.clientName + " | " : ""}${p.name}`, right: _homeFmtDate(p.deadline), onClick: () => navigate("project", { projectId: p.id }) })),
        onOpen: () => navigate("projects")
      }
    )), sec("Seguimientos", dueFollowups.length === 0 ? /* @__PURE__ */ React.createElement(HomeCard, { icon: "send", color: "#e2b45c", title: "Sin seguimientos para hoy", sub: "No tienes seguimientos de outreach que vencen hoy.", onOpen: () => navigate("outreach") }) : /* @__PURE__ */ React.createElement(
      HomeCard,
      {
        icon: "send",
        color: "#e2b45c",
        title: `${dueFollowups.length} seguimiento${dueFollowups.length === 1 ? "" : "s"} para hoy`,
        sub: dueFollowups.slice(0, 3).map((o) => o.brand).join(" \xB7 "),
        items: dueFollowups.slice(0, 8).map((o) => ({ label: o.brand, right: o.nextFollowup < today ? "Atrasado" : "Hoy", dot: o.nextFollowup < today ? "var(--red)" : "var(--amber)", onClick: () => navigate("outreach") })),
        onOpen: () => navigate("outreach")
      }
    )), /* @__PURE__ */ React.createElement("div", { style: {
      marginTop: 26,
      borderRadius: 16,
      background: "rgba(0,0,0,0.3)",
      border: "0.5px solid rgba(255,255,255,0.1)",
      padding: "14px 16px"
    } }, /* @__PURE__ */ React.createElement(
      "input",
      {
        value: ask,
        onChange: (e) => setAsk(e.target.value),
        onKeyDown: (e) => {
          if (e.key === "Enter") submitAsk();
        },
        placeholder: "Preg\xFAntale a Nora\u2026",
        style: { width: "100%", background: "transparent", border: "none", outline: "none", color: "var(--text)", fontSize: 14, fontFamily: "inherit" }
      }
    ), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: "var(--text-subtle)" } }, "@"), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: submitAsk,
        title: "Preguntar a Nora",
        style: {
          width: 30,
          height: 30,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          background: ask.trim() ? "var(--accent)" : "rgba(255,255,255,0.1)",
          color: ask.trim() ? "#0a0a0a" : "var(--text-subtle)",
          border: "none",
          transition: "background .15s"
        }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "arrow-up", size: 15 })
    )))));
  };
  window.AgencyHome = AgencyHome;
})();

const parseSpanishDate = (str) => {
  if (!str || str === "\u2014") return null;
  const M = { ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5, jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11 };
  const parts = str.trim().toLowerCase().split(/[\s\/\-]+/);
  if (parts.length < 2) return null;
  const day = parseInt(parts[0]);
  const mon = M[parts[1].slice(0, 3)];
  if (isNaN(day) || mon === void 0) return null;
  return new Date((/* @__PURE__ */ new Date()).getFullYear(), mon, day);
};
const IconBadge = ({ icon }) => /* @__PURE__ */ React.createElement("div", { style: {
  width: 38,
  height: 38,
  borderRadius: 10,
  background: "var(--bg-elev-2)",
  border: "0.5px solid var(--border)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  color: "var(--text-muted)"
} }, /* @__PURE__ */ React.createElement(Icon, { name: icon, size: 18, strokeWidth: 1.6 }));
const AgencyDashboard = ({ openModal, navigate, session }) => {
  const D = window.Data;
  D.useStore();
  const greeting = (() => {
    const h = (/* @__PURE__ */ new Date()).getHours();
    if (h < 6) return "Buenas noches";
    if (h < 13) return "Buenos d\xEDas";
    if (h < 21) return "Buenas tardes";
    return "Buenas noches";
  })();
  const todayStr = (() => {
    const now = /* @__PURE__ */ new Date();
    const dias = ["domingo", "lunes", "martes", "mi\xE9rcoles", "jueves", "viernes", "s\xE1bado"];
    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    return `${dias[now.getDay()]} ${now.getDate()} de ${meses[now.getMonth()]}`;
  })();
  const agencyName = D.SETTINGS.name || "141'STUDIO";
  const adminEmail = D.SETTINGS.email || "nil@141agency.com";
  const adminName = (() => {
    const n = adminEmail.split("@")[0];
    return n.charAt(0).toUpperCase() + n.slice(1);
  })();
  const activeProjects = D.PROJECTS.length;
  const pendingTasks = Object.values(D.TASKS).flat().filter((t) => t.column !== "done").length;
  const overdueTasks = Object.values(D.TASKS).flat().filter((t) => {
    if (!t.deadline || t.column === "done") return false;
    return /* @__PURE__ */ new Date(t.deadline + "T00:00:00") < /* @__PURE__ */ new Date();
  }).length;
  const pendingInvoices = D.INVOICES.filter((i) => i.status !== "paid").length;
  const atRisk = D.PROJECTS.filter((p) => p.light === "red").length;
  const capacity = activeProjects <= 3 ? "green" : activeProjects <= 4 ? "amber" : "red";
  const capacityLabel = activeProjects === 0 ? "Sin proyectos" : activeProjects <= 3 ? "Capacidad c\xF3moda" : activeProjects <= 4 ? "Capacidad media" : "Al l\xEDmite";
  const [stripeMonth, setStripeMonth] = useState(null);
  useEffect(() => {
    const now = /* @__PURE__ */ new Date();
    const monthStart = Math.floor(new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1e3);
    fetch("/api/stripe/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ limit: 100 }) }).then((r) => r.json()).then((res) => {
      if (!res.ok) {
        setStripeMonth(false);
        return;
      }
      const total = (res.invoices || []).filter((i) => i.status === "paid" && i.created >= monthStart).reduce((a, b) => a + (b.amount_paid ?? b.amount ?? 0), 0);
      setStripeMonth(total);
    }).catch(() => setStripeMonth(false));
  }, []);
  const upcomingEvents = React.useMemo(() => {
    const ev = [];
    const now = /* @__PURE__ */ new Date();
    D.PROJECTS.forEach((p) => {
      const d = parseSpanishDate(p.deadline);
      if (d) ev.push({
        date: d,
        label: p.name,
        sub: p.clientName,
        type: "entrega",
        color: p.light === "red" ? "var(--red)" : p.light === "amber" ? "var(--amber)" : "var(--green)",
        icon: "folder"
      });
    });
    D.INVOICES.filter((i) => i.status !== "paid").forEach((i) => {
      const d = parseSpanishDate(i.due);
      if (d) ev.push({
        date: d,
        label: i.id,
        sub: `${i.client} \xB7 \u20AC${i.amount}`,
        type: "factura",
        color: i.status === "overdue" ? "var(--red)" : "var(--amber)",
        icon: "receipt"
      });
    });
    Object.entries(D.TASKS).forEach(([pid, taskList]) => {
      const project = pid !== "__none__" ? D.PROJECTS.find((p) => p.id === pid) : null;
      (taskList || []).forEach((t) => {
        if (!t.deadline || t.column === "done") return;
        const d = /* @__PURE__ */ new Date(t.deadline + "T00:00:00");
        if (isNaN(d)) return;
        ev.push({
          date: d,
          label: t.title,
          sub: project ? project.name : "\u2014",
          type: "tarea",
          color: "var(--blue)",
          icon: "list-todo"
        });
      });
    });
    try {
      const custom = JSON.parse(localStorage.getItem("agenda_custom_events") || "[]");
      custom.forEach((e) => {
        if (!e.date) return;
        const d = /* @__PURE__ */ new Date(e.date + "T00:00:00");
        if (isNaN(d)) return;
        const iconMap = { meeting: "users", task: "list-todo", custom: "calendar" };
        const colorMap = { meeting: "var(--red)", task: "var(--accent)", custom: "var(--blue)" };
        const typeLabel = { meeting: "Reuni\xF3n", task: "Tarea", custom: "Evento" };
        ev.push({
          date: d,
          label: e.title,
          time: e.time || null,
          timeEnd: e.timeEnd || null,
          type: typeLabel[e.type] || "Evento",
          color: colorMap[e.type] || "var(--blue)",
          icon: iconMap[e.type] || "calendar"
        });
      });
    } catch (err) {
    }
    const todayMid = new Date(now);
    todayMid.setHours(0, 0, 0, 0);
    return ev.filter((e) => {
      const dMid = new Date(e.date);
      dMid.setHours(0, 0, 0, 0);
      const diff = Math.round((dMid - todayMid) / 864e5);
      return diff >= -30 && diff <= 60;
    }).sort((a, b) => a.date - b.date).slice(0, 8);
  }, [D.PROJECTS, D.INVOICES, D.TASKS]);
  const formatEventDate = (d) => {
    const todayMid = /* @__PURE__ */ new Date();
    todayMid.setHours(0, 0, 0, 0);
    const dMid = new Date(d);
    dMid.setHours(0, 0, 0, 0);
    const diff = Math.round((dMid - todayMid) / 864e5);
    if (diff < 0) return `hace ${Math.abs(diff)}d`;
    if (diff === 0) return "Hoy";
    if (diff === 1) return "Ma\xF1ana";
    const dias = ["Dom", "Lun", "Mar", "Mi\xE9", "Jue", "Vie", "S\xE1b"];
    const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    return `${dias[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]}`;
  };
  const kpis = [
    {
      label: "Proyectos activos",
      value: activeProjects,
      sub: activeProjects === 0 ? "Crea el primero" : capacityLabel,
      icon: "folder"
    },
    {
      label: "Tareas pendientes",
      value: pendingTasks,
      sub: pendingTasks === 0 ? "Todo al d\xEDa" : "en todos los proyectos",
      icon: "list-todo"
    },
    {
      label: "Tareas vencidas",
      value: overdueTasks,
      sub: overdueTasks === 0 ? "Ninguna vencida" : "requieren atenci\xF3n",
      icon: "alert-triangle"
    },
    {
      label: "Proyectos en riesgo",
      value: atRisk,
      sub: atRisk === 0 ? "Todo en orden" : "sem\xE1foro rojo",
      icon: "flag"
    },
    {
      label: "Facturado este mes",
      value: stripeMonth === null ? "\u2026" : stripeMonth === false ? "\u2014" : `\u20AC${(stripeMonth / 100).toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      sub: stripeMonth === null ? "Conectando\u2026" : stripeMonth === false ? "Sin conexi\xF3n Stripe" : (/* @__PURE__ */ new Date()).toLocaleString("es-ES", { month: "long" }),
      icon: "receipt"
    }
  ];
  const queues = [
    { icon: "list-todo", label: "Tareas sin completar", count: pendingTasks, action: () => navigate("projects") },
    { icon: "clock", label: "Tareas vencidas", count: overdueTasks, action: () => navigate("projects") },
    { icon: "flag", label: "Proyectos en riesgo", count: atRisk, action: () => navigate("projects") },
    { icon: "receipt", label: "Facturas pendientes", count: pendingInvoices, action: () => navigate("invoices") }
  ];
  const APPLE_CARD = {
    background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
    border: "0.5px solid rgba(255,255,255,0.08)",
    borderRadius: 18,
    backdropFilter: "blur(40px) saturate(180%)",
    WebkitBackdropFilter: "blur(40px) saturate(180%)",
    boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset, 0 12px 32px -16px rgba(0,0,0,0.4)"
  };
  const APPLE_SECTION = {
    fontSize: 11,
    fontWeight: 600,
    color: "var(--text-subtle)",
    textTransform: "uppercase",
    letterSpacing: "0.08em"
  };
  return /* @__PURE__ */ React.createElement("div", { style: {
    display: "flex",
    flexDirection: "column",
    gap: 28,
    padding: "32px 36px 48px",
    maxWidth: 1440,
    margin: "0 auto"
  } }, /* @__PURE__ */ React.createElement("header", { style: { display: "flex", flexDirection: "column", gap: 20 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", { style: {
    fontSize: 44,
    fontWeight: 600,
    letterSpacing: "-1.6px",
    lineHeight: 1.05,
    margin: 0,
    fontFamily: "var(--font-display)"
  } }, greeting, ", ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--accent)" } }, adminName), "."), /* @__PURE__ */ React.createElement("div", { style: {
    marginTop: 10,
    fontSize: 15,
    color: "var(--text-muted)",
    letterSpacing: "-0.3px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap"
  } }, /* @__PURE__ */ React.createElement("span", null, agencyName, " \xB7 ", todayStr), /* @__PURE__ */ React.createElement("span", { style: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "3px 10px 3px 8px",
    borderRadius: 99,
    fontSize: 11.5,
    fontWeight: 500,
    background: capacity === "green" ? "var(--green-soft)" : capacity === "amber" ? "var(--amber-soft)" : "var(--red-soft)",
    color: capacity === "green" ? "var(--green)" : capacity === "amber" ? "var(--amber)" : "var(--red)",
    letterSpacing: 0
  } }, /* @__PURE__ */ React.createElement("span", { style: {
    width: 6,
    height: 6,
    borderRadius: 99,
    background: capacity === "green" ? "var(--green)" : capacity === "amber" ? "var(--amber)" : "var(--red)"
  } }), capacityLabel)))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } }, [
    { label: "Nueva tarea", icon: "plus", fn: () => openModal("newTask"), primary: true },
    { label: "Nuevo proyecto", icon: "folder", fn: () => openModal("newProject") },
    { label: "Invitar cliente", icon: "external-link", fn: () => openModal("invite") },
    { label: "Nueva factura", icon: "receipt", fn: () => navigate("billing") }
  ].map((b) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: b.label,
      onClick: b.fn,
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        height: 34,
        padding: "0 14px",
        borderRadius: 11,
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 500,
        letterSpacing: "-0.2px",
        fontFamily: "inherit",
        transition: "background .12s, border-color .12s",
        background: b.primary ? "var(--accent-soft)" : "rgba(255,255,255,0.04)",
        color: b.primary ? "var(--accent)" : "var(--text)",
        border: "0.5px solid " + (b.primary ? "rgba(158,154,229,0.4)" : "rgba(255,255,255,0.08)")
      },
      onMouseEnter: (e) => e.currentTarget.style.background = b.primary ? "rgba(158,154,229,0.28)" : "rgba(255,255,255,0.07)",
      onMouseLeave: (e) => e.currentTarget.style.background = b.primary ? "var(--accent-soft)" : "rgba(255,255,255,0.04)"
    },
    /* @__PURE__ */ React.createElement(Icon, { name: b.icon, size: 13, strokeWidth: 1.7 }),
    b.label
  )))), /* @__PURE__ */ React.createElement("section", { style: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }, className: "dash-kpis" }, kpis.map((k, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { ...APPLE_CARD, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("div", { style: {
    width: 32,
    height: 32,
    borderRadius: 9,
    background: "rgba(158,154,229,0.12)",
    border: "0.5px solid rgba(158,154,229,0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--accent)"
  } }, /* @__PURE__ */ React.createElement(Icon, { name: k.icon, size: 15, strokeWidth: 1.7 }))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: {
    fontSize: typeof k.value === "string" && k.value.startsWith("\u20AC") ? 26 : 34,
    fontWeight: 600,
    lineHeight: 1,
    letterSpacing: "-1.4px",
    fontVariantNumeric: "tabular-nums",
    fontFamily: "var(--font-display)",
    color: "var(--text)"
  } }, k.value), /* @__PURE__ */ React.createElement("div", { style: {
    marginTop: 8,
    fontSize: 12.5,
    color: "var(--text)",
    fontWeight: 500,
    letterSpacing: "-0.3px"
  } }, k.label), /* @__PURE__ */ React.createElement("div", { style: {
    marginTop: 3,
    fontSize: 11.5,
    color: "var(--text-subtle)",
    letterSpacing: "-0.2px"
  } }, k.sub))))), /* @__PURE__ */ React.createElement("section", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }, className: "dash-bottom" }, /* @__PURE__ */ React.createElement("div", { style: { ...APPLE_CARD, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 360 } }, /* @__PURE__ */ React.createElement("div", { style: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 22px 14px",
    borderBottom: "0.5px solid rgba(255,255,255,0.06)"
  } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: APPLE_SECTION }, "Pr\xF3ximamente"), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 4, fontSize: 17, fontWeight: 600, letterSpacing: "-0.6px", color: "var(--text)" } }, "Agenda")), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => navigate("agenda"),
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        height: 28,
        padding: "0 10px",
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 500,
        color: "var(--accent)",
        background: "transparent",
        border: 0,
        cursor: "pointer",
        fontFamily: "inherit",
        letterSpacing: "-0.2px"
      }
    },
    "Ver todo ",
    /* @__PURE__ */ React.createElement(Icon, { name: "arrow", size: 12 })
  )), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, overflowY: "auto" } }, upcomingEvents.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { padding: 40, textAlign: "center" } }, /* @__PURE__ */ React.createElement(Empty, { icon: "check", title: "Sin eventos pr\xF3ximos", sub: "Todo al d\xEDa por ahora." })) : upcomingEvents.map((ev, i) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: i,
      onMouseEnter: (e) => e.currentTarget.style.background = "rgba(255,255,255,0.025)",
      onMouseLeave: (e) => e.currentTarget.style.background = "transparent",
      style: {
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 22px",
        transition: "background .1s",
        borderBottom: i < upcomingEvents.length - 1 ? "0.5px solid rgba(255,255,255,0.04)" : "none"
      }
    },
    /* @__PURE__ */ React.createElement("div", { style: {
      width: 36,
      height: 36,
      borderRadius: 10,
      flexShrink: 0,
      background: "rgba(255,255,255,0.04)",
      border: "0.5px solid rgba(255,255,255,0.06)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: ev.color || "var(--text-muted)"
    } }, /* @__PURE__ */ React.createElement(Icon, { name: ev.icon, size: 15, strokeWidth: 1.7 })),
    /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: {
      fontSize: 13.5,
      fontWeight: 500,
      letterSpacing: "-0.3px",
      color: "var(--text)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    } }, ev.label), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-subtle)", marginTop: 2, letterSpacing: "-0.2px" } }, formatEventDate(ev.date), ev.time ? `, ${ev.time}${ev.timeEnd ? ` \u2013 ${ev.timeEnd}` : ""}` : "")),
    /* @__PURE__ */ React.createElement("span", { style: {
      fontSize: 10.5,
      padding: "3px 9px",
      borderRadius: 99,
      background: "rgba(255,255,255,0.05)",
      color: "var(--text-muted)",
      border: "0.5px solid rgba(255,255,255,0.08)",
      letterSpacing: "-0.1px",
      whiteSpace: "nowrap",
      fontWeight: 500
    } }, ev.type)
  )))), /* @__PURE__ */ React.createElement("div", { style: { ...APPLE_CARD, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 360 } }, /* @__PURE__ */ React.createElement("div", { style: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 22px 14px",
    borderBottom: "0.5px solid rgba(255,255,255,0.06)"
  } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: APPLE_SECTION }, "Pendiente"), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 4, fontSize: 17, fontWeight: 600, letterSpacing: "-0.6px", color: "var(--text)" } }, "Colas de trabajo")), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => navigate("projects"),
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        height: 28,
        padding: "0 10px",
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 500,
        color: "var(--accent)",
        background: "transparent",
        border: 0,
        cursor: "pointer",
        fontFamily: "inherit",
        letterSpacing: "-0.2px"
      }
    },
    "Ver todo ",
    /* @__PURE__ */ React.createElement(Icon, { name: "arrow", size: 12 })
  )), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, overflowY: "auto" } }, queues.map((q, i) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: i,
      onClick: q.action,
      onMouseEnter: (e) => e.currentTarget.style.background = "rgba(255,255,255,0.025)",
      onMouseLeave: (e) => e.currentTarget.style.background = "transparent",
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 22px",
        cursor: "pointer",
        transition: "background .1s",
        borderBottom: "0.5px solid rgba(255,255,255,0.04)"
      }
    },
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 14 } }, /* @__PURE__ */ React.createElement("div", { style: {
      width: 32,
      height: 32,
      borderRadius: 9,
      flexShrink: 0,
      background: "rgba(255,255,255,0.04)",
      border: "0.5px solid rgba(255,255,255,0.06)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--text-muted)"
    } }, /* @__PURE__ */ React.createElement(Icon, { name: q.icon, size: 14, strokeWidth: 1.7 })), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13.5, fontWeight: 500, letterSpacing: "-0.3px" } }, q.label)),
    /* @__PURE__ */ React.createElement("span", { style: {
      fontSize: 20,
      fontWeight: 600,
      fontVariantNumeric: "tabular-nums",
      color: q.count > 0 ? "var(--text)" : "var(--text-subtle)",
      letterSpacing: "-0.6px",
      fontFamily: "var(--font-display)"
    } }, q.count)
  )), /* @__PURE__ */ React.createElement("div", { style: { padding: "18px 22px 14px" } }, /* @__PURE__ */ React.createElement("div", { style: { ...APPLE_SECTION, marginBottom: 12 } }, "Proyectos activos"), D.PROJECTS.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: "var(--text-subtle)", padding: "4px 0" } }, "Sin proyectos. ", /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => openModal("newProject"),
      style: {
        background: "transparent",
        border: 0,
        color: "var(--accent)",
        cursor: "pointer",
        fontSize: 12.5,
        padding: 0,
        fontFamily: "inherit",
        textDecoration: "underline"
      }
    },
    "Crear uno"
  )) : D.PROJECTS.slice(0, 5).map((p) => {
    const pTasks = D.TASKS[p.id] || [];
    const live = pTasks.length ? Math.round(pTasks.filter((t) => t.column === "done").length / pTasks.length * 100) : 0;
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: p.id,
        onClick: () => navigate("project", { projectId: p.id }),
        onMouseEnter: (e) => e.currentTarget.style.background = "rgba(255,255,255,0.04)",
        onMouseLeave: (e) => e.currentTarget.style.background = "transparent",
        style: {
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "8px 8px",
          cursor: "pointer",
          borderRadius: 8,
          transition: "background .1s",
          marginInline: -8
        }
      },
      /* @__PURE__ */ React.createElement("span", { className: "dot " + p.light }),
      /* @__PURE__ */ React.createElement("span", { style: {
        flex: 1,
        fontSize: 13,
        fontWeight: 500,
        minWidth: 0,
        letterSpacing: "-0.2px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      } }, p.name),
      /* @__PURE__ */ React.createElement("div", { style: { width: 78, display: "flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement("div", { className: "progress", style: { flex: 1 } }, /* @__PURE__ */ React.createElement("i", { style: { width: live + "%" } })), /* @__PURE__ */ React.createElement("span", { style: {
        fontSize: 11,
        color: "var(--text-muted)",
        fontVariantNumeric: "tabular-nums",
        width: 28,
        textAlign: "right"
      } }, live, "%"))
    );
  }))))));
};
window.AgencyDashboard = AgencyDashboard;

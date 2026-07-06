(() => {
  // src/agency-dashboard.jsx
  var parseSpanishDate = (str) => {
    if (!str || str === "\u2014") return null;
    const M = { ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5, jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11 };
    const parts = str.trim().toLowerCase().split(/[\s\/\-]+/);
    if (parts.length < 2) return null;
    const day = parseInt(parts[0]);
    const mon = M[parts[1].slice(0, 3)];
    if (isNaN(day) || mon === void 0) return null;
    return new Date((/* @__PURE__ */ new Date()).getFullYear(), mon, day);
  };
  var AgencyDashboard = ({ openModal, navigate, session }) => {
    const D = window.Data;
    D.useStore();
    const [now, setNow] = useState(/* @__PURE__ */ new Date());
    useEffect(() => {
      const id = setInterval(() => setNow(/* @__PURE__ */ new Date()), 1e3);
      return () => clearInterval(id);
    }, []);
    const greeting = (() => {
      const h = now.getHours();
      if (h < 6) return "Buenas noches";
      if (h < 13) return "Buenos d\xEDas";
      if (h < 21) return "Buenas tardes";
      return "Buenas noches";
    })();
    const todayStr = (() => {
      const dias = ["domingo", "lunes", "martes", "mi\xE9rcoles", "jueves", "viernes", "s\xE1bado"];
      const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
      return `${dias[now.getDay()]} ${now.getDate()} de ${meses[now.getMonth()]}`;
    })();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
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
    const dayMessage = `Hoy es ${todayStr} y son las ${timeStr}`;
    const [stripeMonth, setStripeMonth] = useState(null);
    const [stripePrev, setStripePrev] = useState(null);
    useEffect(() => {
      const now2 = /* @__PURE__ */ new Date();
      const monthStart = Math.floor(new Date(now2.getFullYear(), now2.getMonth(), 1).getTime() / 1e3);
      const prevStart = Math.floor(new Date(now2.getFullYear(), now2.getMonth() - 1, 1).getTime() / 1e3);
      window.apiFetch("/api/stripe/invoices", { limit: 100 }).then((r) => r.json()).then((res) => {
        if (!res.ok) {
          setStripeMonth(false);
          return;
        }
        const paid = (res.invoices || []).filter((i) => i.status === "paid");
        setStripeMonth(paid.filter((i) => i.created >= monthStart).reduce((a, b) => {
          var _a, _b;
          return a + ((_b = (_a = b.amount_paid) != null ? _a : b.amount) != null ? _b : 0);
        }, 0));
        setStripePrev(paid.filter((i) => i.created >= prevStart && i.created < monthStart).reduce((a, b) => {
          var _a, _b;
          return a + ((_b = (_a = b.amount_paid) != null ? _a : b.amount) != null ? _b : 0);
        }, 0));
      }).catch(() => setStripeMonth(false));
    }, []);
    const upcomingEvents = React.useMemo(() => {
      const ev = [];
      const todayMid = /* @__PURE__ */ new Date();
      todayMid.setHours(0, 0, 0, 0);
      D.PROJECTS.forEach((p) => {
        const d = parseSpanishDate(p.deadline);
        if (d) ev.push({
          date: d,
          label: p.name,
          sub: p.clientName,
          type: "Entrega",
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
          type: "Factura",
          color: i.status === "overdue" ? "var(--red)" : "var(--amber)",
          icon: "receipt"
        });
      });
      try {
        const fin = JSON.parse(localStorage.getItem("141_finance_v1") || "{}");
        (fin.subs || []).filter((s) => s.active !== false && s.nextRenewal).forEach((s) => {
          let d = /* @__PURE__ */ new Date(s.nextRenewal + "T00:00:00");
          if (isNaN(d)) return;
          let guard = 0;
          while (d < todayMid && guard < 60) {
            if (s.cycle === "yearly") d.setFullYear(d.getFullYear() + 1);
            else d.setMonth(d.getMonth() + 1);
            guard++;
          }
          const amount = Number(s.amount) || 0;
          ev.push({
            date: d,
            label: s.name,
            sub: `Cobro \xB7 \u20AC${amount.toLocaleString("es-ES")} \xB7 ${s.cycle === "yearly" ? "anual" : "mensual"}`,
            type: "Suscripci\xF3n",
            color: "var(--accent)",
            icon: "refresh-cw"
          });
        });
      } catch (err) {
      }
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
      return ev.filter((e) => {
        const dMid = new Date(e.date);
        dMid.setHours(0, 0, 0, 0);
        const diff = Math.round((dMid - todayMid) / 864e5);
        return diff >= 0 && diff <= 7;
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
    const _spendForMonth = (offset = 0) => {
      try {
        const fin = JSON.parse(localStorage.getItem("141_finance_v1") || "{}");
        const rec = (fin.subs || []).filter((s) => s.active !== false).reduce((a, s) => a + (s.cycle === "yearly" ? (Number(s.amount) || 0) / 12 : Number(s.amount) || 0), 0);
        const base = /* @__PURE__ */ new Date();
        const y = base.getFullYear(), m = base.getMonth() + offset;
        const ref = new Date(y, m, 1);
        const exp = (fin.expenses || []).filter((e) => {
          if (!e.date) return false;
          const d = new Date(e.date);
          return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
        }).reduce((a, e) => a + (Number(e.amount) || 0), 0);
        return rec + exp;
      } catch (e) {
        return 0;
      }
    };
    const monthSpend = _spendForMonth(0);
    const lastMonthSpend = _spendForMonth(-1);
    const prevMonthLabel = new Date(now.getFullYear(), now.getMonth() - 1, 1).toLocaleString("es-ES", { month: "short" });
    const _pctDelta = (cur, prev) => prev > 0 ? Math.round((cur - prev) / prev * 100) : null;
    const spendDelta = _pctDelta(monthSpend, lastMonthSpend);
    const invoiceDelta = stripeMonth !== null && stripeMonth !== false && stripePrev !== null ? _pctDelta(stripeMonth, stripePrev) : null;
    const _countDelta = (n, word) => n > 0 ? { text: String(n), suffix: word, dir: "down", tone: "bad" } : { text: "0", suffix: word, dir: "flat", tone: "muted" };
    const _pctToDelta = (pct, goodUp, suffix) => {
      if (pct === null) return { text: "\u2014", suffix, dir: "flat", tone: "muted" };
      const up = pct > 0, down = pct < 0;
      const good = up === goodUp;
      return {
        text: `${up ? "+" : down ? "\u2212" : ""}${Math.abs(pct)}%`,
        suffix,
        dir: up ? "up" : down ? "down" : "flat",
        tone: up || down ? good ? "good" : "bad" : "muted"
      };
    };
    const kpis = [
      {
        label: "Proyectos activos",
        value: activeProjects,
        delta: _countDelta(atRisk, "en riesgo")
      },
      {
        label: "Tareas pendientes",
        value: pendingTasks,
        delta: _countDelta(overdueTasks, "vencidas")
      },
      {
        label: "Gastos este mes",
        value: `\u20AC${monthSpend.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        delta: _pctToDelta(spendDelta, false, `vs ${prevMonthLabel}`)
      },
      {
        label: "Facturado este mes",
        value: stripeMonth === null ? "\u2026" : stripeMonth === false ? "\u2014" : `\u20AC${(stripeMonth / 100).toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
        delta: stripeMonth === false ? { text: "Sin Stripe", dir: "flat", tone: "muted" } : _pctToDelta(invoiceDelta, true, `vs ${prevMonthLabel}`)
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
    const Header = /* @__PURE__ */ React.createElement("header", { style: { display: "flex", flexDirection: "column", gap: 20, flexShrink: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement("h1", { style: {
      fontSize: "clamp(36px, 4vw, 56px)",
      fontWeight: 400,
      letterSpacing: "-0.04em",
      lineHeight: 1.05,
      margin: 0,
      fontFamily: "var(--font-display)",
      color: "var(--text)"
    } }, greeting, ", ", adminName, "."), /* @__PURE__ */ React.createElement("p", { style: {
      margin: 0,
      fontSize: 16,
      color: "var(--text-muted)",
      letterSpacing: "-0.2px",
      lineHeight: 1.4
    } }, dayMessage)), /* @__PURE__ */ React.createElement(
      ActionPill,
      {
        plusActions: [
          { icon: "plus", label: "Nueva tarea", sub: "A\xF1ade una tarea r\xE1pida.", accent: true, onClick: () => openModal("newTask") },
          { icon: "folder", label: "Nuevo proyecto", sub: "Crea un proyecto.", onClick: () => openModal("newProject") },
          { icon: "users", label: "Nuevo cliente", sub: "A\xF1ade una ficha o portal.", onClick: () => openModal("newClient") },
          { icon: "receipt", label: "Nueva factura", sub: "Registra una factura.", onClick: () => navigate("billing") }
        ]
      }
    )));
    const EYEBROW = (txt) => /* @__PURE__ */ React.createElement("div", { style: APPLE_SECTION }, txt);
    const recentActivity = [
      ...D.PROJECTS.slice(0, 2).map((p) => ({ icon: "folder", text: p.name, sub: "Proyecto en curso" })),
      ...D.CLIENTS.slice(0, 2).map((c) => ({ icon: "users", text: c.company, sub: c.service || "Cliente" })),
      ...(D.INVOICES || []).slice(0, 1).map((i) => ({ icon: "receipt", text: i.client, sub: "Factura " + (i.status || "\u2014") }))
    ].slice(0, 5);
    const renderKpiTile = (k, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { ...APPLE_CARD, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("div", { style: {
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
      fontSize: typeof k.value === "string" && k.value.startsWith("\u20AC") ? 22 : 28,
      fontWeight: 400,
      lineHeight: 1,
      letterSpacing: "-1.1px",
      fontVariantNumeric: "tabular-nums",
      fontFamily: "var(--font-display)",
      color: "var(--text)"
    } }, k.value), /* @__PURE__ */ React.createElement("div", { style: {
      marginTop: 8,
      fontSize: 12,
      color: "var(--text-muted)",
      fontWeight: 500,
      letterSpacing: "-0.3px"
    } }, k.label), /* @__PURE__ */ React.createElement("div", { style: {
      marginTop: 3,
      fontSize: 11,
      color: "var(--text-subtle)",
      letterSpacing: "-0.2px"
    } }, k.sub)));
    const renderMiniKpi = (k, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { ...APPLE_CARD, padding: "14px 16px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11.5, color: "var(--text-muted)", letterSpacing: "-0.2px" } }, k.label), /* @__PURE__ */ React.createElement(Icon, { name: k.icon, size: 12, strokeWidth: 1.7, style: { color: "var(--text-subtle)" } })), /* @__PURE__ */ React.createElement("div", { style: {
      fontSize: typeof k.value === "string" && k.value.startsWith("\u20AC") ? 18 : 22,
      fontWeight: 400,
      letterSpacing: "-0.8px",
      fontFamily: "var(--font-display)",
      fontVariantNumeric: "tabular-nums",
      lineHeight: 1
    } }, k.value));
    const AgendaBlock = ({ height = 360, slice = 8 }) => /* @__PURE__ */ React.createElement("div", { style: { ...APPLE_CARD, display: "flex", flexDirection: "column", overflow: "hidden", height } }, /* @__PURE__ */ React.createElement("div", { style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "18px 22px 14px",
      borderBottom: "0.5px solid rgba(255,255,255,0.06)"
    } }, /* @__PURE__ */ React.createElement("div", null, EYEBROW("Pr\xF3ximamente"), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 4, fontSize: 15, fontWeight: 500, letterSpacing: "-0.5px" } }, "Agenda")), /* @__PURE__ */ React.createElement("button", { onClick: () => navigate("agenda"), style: LINK_BTN }, "Ver todo ", /* @__PURE__ */ React.createElement(Icon, { name: "arrow", size: 12 }))), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, overflowY: "auto" } }, upcomingEvents.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { padding: 40, textAlign: "center" } }, /* @__PURE__ */ React.createElement(Empty, { icon: "check", title: "Sin eventos pr\xF3ximos", sub: "Todo al d\xEDa por ahora." })) : upcomingEvents.slice(0, slice).map((ev, i) => /* @__PURE__ */ React.createElement(EventRow, { key: i, ev, last: i === Math.min(slice - 1, upcomingEvents.length - 1), formatEventDate }))));
    const QueuesBlock = ({ height = 360, showProjects = true }) => /* @__PURE__ */ React.createElement("div", { style: { ...APPLE_CARD, display: "flex", flexDirection: "column", overflow: "hidden", height } }, /* @__PURE__ */ React.createElement("div", { style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "18px 22px 14px",
      borderBottom: "0.5px solid rgba(255,255,255,0.06)"
    } }, /* @__PURE__ */ React.createElement("div", null, EYEBROW("Pendiente"), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 4, fontSize: 15, fontWeight: 500, letterSpacing: "-0.5px" } }, "Colas de trabajo")), /* @__PURE__ */ React.createElement("button", { onClick: () => navigate("projects"), style: LINK_BTN }, "Ver todo ", /* @__PURE__ */ React.createElement(Icon, { name: "arrow", size: 12 }))), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, overflowY: "auto" } }, queues.map((q, i) => /* @__PURE__ */ React.createElement(QueueRow, { key: i, q })), showProjects && /* @__PURE__ */ React.createElement(ActiveProjects, { D, navigate, openModal, APPLE_SECTION })));
    const ProjectsBlock = ({ height = 360, slice = 6 }) => /* @__PURE__ */ React.createElement("div", { style: { ...APPLE_CARD, display: "flex", flexDirection: "column", overflow: "hidden", height } }, /* @__PURE__ */ React.createElement("div", { style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "18px 22px 14px",
      borderBottom: "0.5px solid rgba(255,255,255,0.06)"
    } }, /* @__PURE__ */ React.createElement("div", null, EYEBROW("En curso"), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 4, fontSize: 15, fontWeight: 500, letterSpacing: "-0.5px" } }, "Proyectos")), /* @__PURE__ */ React.createElement("button", { onClick: () => navigate("projects"), style: LINK_BTN }, "Ver todo ", /* @__PURE__ */ React.createElement(Icon, { name: "arrow", size: 12 }))), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: "14px 22px" } }, D.PROJECTS.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: "var(--text-subtle)", padding: "4px 0" } }, "Sin proyectos. ", /* @__PURE__ */ React.createElement(
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
    )) : D.PROJECTS.slice(0, slice).map((p) => {
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
            gap: 10,
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
        /* @__PURE__ */ React.createElement("div", { style: { width: 70, display: "flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement("div", { className: "progress", style: { flex: 1 } }, /* @__PURE__ */ React.createElement("i", { style: { width: live + "%" } })), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: "var(--text-muted)", fontVariantNumeric: "tabular-nums", width: 28, textAlign: "right" } }, live, "%"))
      );
    })));
    const StatsInline = () => /* @__PURE__ */ React.createElement("div", { style: { ...APPLE_CARD, display: "flex", flexWrap: "wrap", gap: 32, padding: "20px 24px" } }, kpis.map((k, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", flexDirection: "column", gap: 4, minWidth: 130 } }, /* @__PURE__ */ React.createElement("div", { style: {
      fontSize: 11,
      color: "var(--text-subtle)",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      fontWeight: 500
    } }, k.label), /* @__PURE__ */ React.createElement("div", { style: {
      fontSize: typeof k.value === "string" && k.value.startsWith("\u20AC") ? 22 : 26,
      fontWeight: 400,
      letterSpacing: "-0.9px",
      fontFamily: "var(--font-display)",
      fontVariantNumeric: "tabular-nums",
      lineHeight: 1.1
    } }, k.value), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--text-muted)" } }, k.sub))));
    const V3 = /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("section", { style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 32,
      borderBottom: "0.5px solid var(--border)",
      padding: "0 4px 26px",
      flexShrink: 0
    } }, kpis.map((k, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", flexDirection: "column", gap: 14 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 16, lineHeight: 1.3, color: "var(--text-muted)", letterSpacing: "-0.2px" } }, k.label), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 7 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 4 } }, /* @__PURE__ */ React.createElement("span", { style: {
      fontSize: 32,
      color: "var(--text)",
      letterSpacing: "-0.08em",
      lineHeight: 1,
      fontFamily: "var(--font-display)",
      fontVariantNumeric: "tabular-nums"
    } }, k.value), k.unit && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 16, color: "var(--text-muted)" } }, k.unit)), k.delta && /* @__PURE__ */ React.createElement(MetricDelta, { ...k.delta }))))), /* @__PURE__ */ React.createElement("section", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, flex: 1, minHeight: 0 } }, /* @__PURE__ */ React.createElement(AgendaBlock, { height: "100%", slice: 6 }), /* @__PURE__ */ React.createElement(QueuesBlock, { height: "100%", showProjects: false }), /* @__PURE__ */ React.createElement(ProjectsBlock, { height: "100%" })));
    return /* @__PURE__ */ React.createElement("div", { style: {
      display: "flex",
      flexDirection: "column",
      gap: 28,
      height: "100vh",
      overflow: "hidden",
      padding: "28px 32px",
      maxWidth: 1400,
      margin: "0 auto"
    } }, Header, V3);
  };
  var LINK_BTN = {
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
  };
  var EventRow = ({ ev, last, formatEventDate }) => /* @__PURE__ */ React.createElement(
    "div",
    {
      onMouseEnter: (e) => e.currentTarget.style.background = "rgba(255,255,255,0.025)",
      onMouseLeave: (e) => e.currentTarget.style.background = "transparent",
      style: {
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 22px",
        transition: "background .1s",
        borderBottom: last ? "none" : "0.5px solid rgba(255,255,255,0.04)"
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
    } }, ev.label), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-subtle)", marginTop: 2, letterSpacing: "-0.2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-muted)" } }, formatEventDate(ev.date), ev.time ? `, ${ev.time}${ev.timeEnd ? ` \u2013 ${ev.timeEnd}` : ""}` : ""), ev.sub ? ` \xB7 ${ev.sub}` : "")),
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
  );
  var QueueRow = ({ q }) => /* @__PURE__ */ React.createElement(
    "div",
    {
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
      fontSize: 17,
      fontWeight: 400,
      fontVariantNumeric: "tabular-nums",
      color: q.count > 0 ? "var(--text)" : "var(--text-subtle)",
      letterSpacing: "-0.5px",
      fontFamily: "var(--font-display)"
    } }, q.count)
  );
  var ActiveProjects = ({ D, navigate, openModal, APPLE_SECTION }) => /* @__PURE__ */ React.createElement("div", { style: { padding: "18px 22px 14px" } }, /* @__PURE__ */ React.createElement("div", { style: { ...APPLE_SECTION, marginBottom: 12 } }, "Proyectos activos"), D.PROJECTS.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: "var(--text-subtle)", padding: "4px 0" } }, "Sin proyectos. ", /* @__PURE__ */ React.createElement(
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
  }));
  window.AgencyDashboard = AgencyDashboard;
})();

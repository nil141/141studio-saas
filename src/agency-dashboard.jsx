// Agency Dashboard — 141'STUDIO MVP

// ── Date helpers ─────────────────────────────────────────────
const parseSpanishDate = (str) => {
  if (!str || str === "—") return null;
  const M = {ene:0,feb:1,mar:2,abr:3,may:4,jun:5,jul:6,ago:7,sep:8,oct:9,nov:10,dic:11};
  const parts = str.trim().toLowerCase().split(/[\s\/\-]+/);
  if (parts.length < 2) return null;
  const day = parseInt(parts[0]);
  const mon = M[parts[1].slice(0,3)];
  if (isNaN(day) || mon === undefined) return null;
  return new Date(new Date().getFullYear(), mon, day);
};

// ── Icon badge ────────────────────────────────────────────────
const IconBadge = ({ icon }) => (
  <div style={{
    width: 38, height: 38, borderRadius: 10,
    background: "var(--bg-elev-2)",
    border: "0.5px solid var(--border)",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
    color: "var(--text-muted)",
  }}>
    <Icon name={icon} size={18} strokeWidth={1.6}/>
  </div>
);

// ── Dashboard ────────────────────────────────────────────────
const AgencyDashboard = ({ openModal, navigate, session }) => {
  const D = window.Data;
  D.useStore();

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 6)  return "Buenas noches";
    if (h < 13) return "Buenos días";
    if (h < 21) return "Buenas tardes";
    return "Buenas noches";
  })();

  const todayStr = (() => {
    const now = new Date();
    const dias  = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
    const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
    return `${dias[now.getDay()]} ${now.getDate()} de ${meses[now.getMonth()]}`;
  })();

  const agencyName     = D.SETTINGS.name || "141'STUDIO";
  const adminEmail     = D.SETTINGS.email || "nil@141agency.com";
  const adminName      = (() => { const n = adminEmail.split("@")[0]; return n.charAt(0).toUpperCase() + n.slice(1); })();
  const activeProjects = D.PROJECTS.length;
  const pendingTasks   = Object.values(D.TASKS).flat().filter(t => t.column !== "done").length;
  const overdueTasks   = Object.values(D.TASKS).flat().filter(t => {
    if (!t.deadline || t.column === "done") return false;
    return new Date(t.deadline + "T00:00:00") < new Date();
  }).length;
  const pendingInvoices = D.INVOICES.filter(i => i.status !== "paid").length;
  const atRisk = D.PROJECTS.filter(p => p.light === "red").length;
  const capacity = activeProjects <= 3 ? "green" : activeProjects <= 4 ? "amber" : "red";
  const capacityLabel = activeProjects === 0 ? "Sin proyectos"
    : activeProjects <= 3 ? "Capacidad cómoda"
    : activeProjects <= 4 ? "Capacidad media" : "Al límite";

  // ── Selector de opción de diseño ──
  const [dashOpt, setDashOpt] = useState(() => {
    try { return localStorage.getItem("dash_opt") || "v1"; } catch { return "v1"; }
  });
  const pickOpt = (o) => { setDashOpt(o); try { localStorage.setItem("dash_opt", o); } catch {} };

  // ── Stripe ──
  const [stripeMonth, setStripeMonth] = useState(null);
  useEffect(() => {
    const now = new Date();
    const monthStart = Math.floor(new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000);
    fetch("/api/stripe/invoices", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({limit:100}) })
      .then(r => r.json())
      .then(res => {
        if (!res.ok) { setStripeMonth(false); return; }
        const total = (res.invoices || []).filter(i => i.status==="paid" && i.created>=monthStart)
          .reduce((a,b) => a+(b.amount_paid??b.amount??0), 0);
        setStripeMonth(total);
      })
      .catch(() => setStripeMonth(false));
  }, []);

  // ── Upcoming events ──
  const upcomingEvents = React.useMemo(() => {
    const ev = [];
    const now = new Date();

    // Proyectos con deadline
    D.PROJECTS.forEach(p => {
      const d = parseSpanishDate(p.deadline);
      if (d) ev.push({ date: d, label: p.name, sub: p.clientName, type: "entrega",
        color: p.light==="red"?"var(--red)":p.light==="amber"?"var(--amber)":"var(--green)",
        icon: "folder" });
    });

    // Facturas pendientes
    D.INVOICES.filter(i => i.status !== "paid").forEach(i => {
      const d = parseSpanishDate(i.due);
      if (d) ev.push({ date: d, label: i.id, sub: `${i.client} · €${i.amount}`, type: "factura",
        color: i.status==="overdue"?"var(--red)":"var(--amber)", icon: "receipt" });
    });

    // Tareas con deadline
    Object.entries(D.TASKS).forEach(([pid, taskList]) => {
      const project = pid !== "__none__" ? D.PROJECTS.find(p => p.id === pid) : null;
      (taskList||[]).forEach(t => {
        if (!t.deadline || t.column === "done") return;
        const d = new Date(t.deadline + "T00:00:00");
        if (isNaN(d)) return;
        ev.push({ date: d, label: t.title, sub: project?project.name:"—", type: "tarea",
          color: "var(--blue)", icon: "list-todo" });
      });
    });

    // Eventos personalizados de Agenda (localStorage)
    try {
      const custom = JSON.parse(localStorage.getItem("agenda_custom_events") || "[]");
      custom.forEach(e => {
        if (!e.date) return;
        const d = new Date(e.date + "T00:00:00");
        if (isNaN(d)) return;
        const iconMap = { meeting:"users", task:"list-todo", custom:"calendar" };
        const colorMap = { meeting:"var(--red)", task:"var(--accent)", custom:"var(--blue)" };
        const typeLabel = { meeting:"Reunión", task:"Tarea", custom:"Evento" };
        ev.push({
          date: d,
          label: e.title,
          time: e.time || null,
          timeEnd: e.timeEnd || null,
          type: typeLabel[e.type] || "Evento",
          color: colorMap[e.type] || "var(--blue)",
          icon: iconMap[e.type] || "calendar",
        });
      });
    } catch(err) {}

    const todayMid = new Date(now); todayMid.setHours(0,0,0,0);
    return ev
      .filter(e => {
        const dMid = new Date(e.date); dMid.setHours(0,0,0,0);
        const diff = Math.round((dMid - todayMid) / 86400000);
        return diff >= -30 && diff <= 60;
      })
      .sort((a,b) => a.date - b.date)
      .slice(0, 8);
  }, [D.PROJECTS, D.INVOICES, D.TASKS]);

  const formatEventDate = (d) => {
    const todayMid = new Date(); todayMid.setHours(0,0,0,0);
    const dMid = new Date(d);   dMid.setHours(0,0,0,0);
    const diff = Math.round((dMid - todayMid) / 86400000);
    if (diff < 0)  return `hace ${Math.abs(diff)}d`;
    if (diff === 0) return "Hoy";
    if (diff === 1) return "Mañana";
    const dias  = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
    const meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
    return `${dias[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]}`;
  };

  // ── KPI config ──
  const kpis = [
    {
      label:  "Proyectos activos",
      value:  activeProjects,
      sub:    activeProjects===0 ? "Crea el primero" : capacityLabel,
      icon:   "folder",
    },
    {
      label:  "Tareas pendientes",
      value:  pendingTasks,
      sub:    pendingTasks===0 ? "Todo al día" : "en todos los proyectos",
      icon:   "list-todo",
    },
    {
      label:  "Tareas vencidas",
      value:  overdueTasks,
      sub:    overdueTasks===0 ? "Ninguna vencida" : "requieren atención",
      icon:   "alert-triangle",
    },
    {
      label:  "Proyectos en riesgo",
      value:  atRisk,
      sub:    atRisk===0 ? "Todo en orden" : "semáforo rojo",
      icon:   "flag",
    },
    {
      label:  "Facturado este mes",
      value:  stripeMonth===null?"…":stripeMonth===false?"—":`€${(stripeMonth/100).toLocaleString("es-ES",{minimumFractionDigits:0,maximumFractionDigits:0})}`,
      sub:    stripeMonth===null?"Conectando…":stripeMonth===false?"Sin conexión Stripe":new Date().toLocaleString("es-ES",{month:"long"}),
      icon:   "receipt",
    },
  ];

  // ── Queues ──
  const queues = [
    { icon:"list-todo", label:"Tareas sin completar",  count:pendingTasks,    action:()=>navigate("projects") },
    { icon:"clock",     label:"Tareas vencidas",        count:overdueTasks,    action:()=>navigate("projects") },
    { icon:"flag",      label:"Proyectos en riesgo",    count:atRisk,          action:()=>navigate("projects") },
    { icon:"receipt",   label:"Facturas pendientes",    count:pendingInvoices, action:()=>navigate("invoices") },
  ];

  // ───────────────────────────────────────────────────────────────────────────
  // Apple HIG style — tokens locales (vibrancy / continuous radius / SF system)
  // ───────────────────────────────────────────────────────────────────────────
  const APPLE_CARD = {
    background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
    border: "0.5px solid rgba(255,255,255,0.08)",
    borderRadius: 18,
    backdropFilter: "blur(40px) saturate(180%)",
    WebkitBackdropFilter: "blur(40px) saturate(180%)",
    boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset, 0 12px 32px -16px rgba(0,0,0,0.4)",
  };
  const APPLE_SECTION = {
    fontSize: 11, fontWeight: 600, color: "var(--text-subtle)",
    textTransform: "uppercase", letterSpacing: "0.08em",
  };

  // ── Cabecera común (saludo + selector + quick actions) ───────────────────
  const Header = (
    <header style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
        <div>
          <h1 style={{
            fontSize: 36, fontWeight: 400, letterSpacing: "-1.2px", lineHeight: 1.05,
            margin: 0, fontFamily: "var(--font-display)", color: "var(--text)",
          }}>{greeting}, {adminName}.</h1>
          <div style={{
            marginTop: 10, fontSize: 15, color: "var(--text-muted)",
            letterSpacing: "-0.3px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
          }}>
            <span>{agencyName} · {todayStr}</span>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "3px 10px 3px 8px", borderRadius: 99, fontSize: 11.5, fontWeight: 500,
              background: capacity === "green" ? "var(--green-soft)" : capacity === "amber" ? "var(--amber-soft)" : "var(--red-soft)",
              color: capacity === "green" ? "var(--green)" : capacity === "amber" ? "var(--amber)" : "var(--red)",
              letterSpacing: 0,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: 99,
                background: capacity === "green" ? "var(--green)" : capacity === "amber" ? "var(--amber)" : "var(--red)" }}/>
              {capacityLabel}
            </span>
          </div>
        </div>

        {/* Selector de opción de diseño */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 4, padding: 3,
          background: "rgba(255,255,255,0.04)",
          border: "0.5px solid rgba(255,255,255,0.08)",
          borderRadius: 10,
        }}>
          {[
            { id: "v1", label: "General" },
            { id: "v2", label: "Financiera" },
            { id: "v3", label: "Del día" },
            { id: "v4", label: "Cartera" },
          ].map(opt => (
            <button key={opt.id} onClick={() => pickOpt(opt.id)}
              style={{
                height: 26, padding: "0 11px", borderRadius: 7, cursor: "pointer",
                fontSize: 12, fontWeight: 500, letterSpacing: "-0.2px", fontFamily: "inherit",
                border: 0, transition: "background .12s, color .12s",
                background: dashOpt === opt.id ? "var(--accent-soft)" : "transparent",
                color: dashOpt === opt.id ? "var(--accent)" : "var(--text-muted)",
              }}>{opt.label}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[
          { label: "Nueva tarea",     icon: "plus",          fn: () => openModal("newTask"),    primary: true },
          { label: "Nuevo proyecto",  icon: "folder",        fn: () => openModal("newProject") },
          { label: "Invitar cliente", icon: "external-link", fn: () => openModal("invite")     },
          { label: "Nueva factura",   icon: "receipt",       fn: () => navigate("billing")    },
        ].map(b => (
          <button key={b.label} onClick={b.fn}
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              height: 34, padding: "0 14px", borderRadius: 11, cursor: "pointer",
              fontSize: 13, fontWeight: 500, letterSpacing: "-0.2px",
              fontFamily: "inherit", transition: "background .12s, border-color .12s",
              background: b.primary ? "var(--accent-soft)" : "rgba(255,255,255,0.04)",
              color: b.primary ? "var(--accent)" : "var(--text)",
              border: "0.5px solid " + (b.primary ? "rgba(158,154,229,0.4)" : "rgba(255,255,255,0.08)"),
            }}
            onMouseEnter={e => e.currentTarget.style.background = b.primary ? "rgba(158,154,229,0.28)" : "rgba(255,255,255,0.07)"}
            onMouseLeave={e => e.currentTarget.style.background = b.primary ? "var(--accent-soft)" : "rgba(255,255,255,0.04)"}
          >
            <Icon name={b.icon} size={13} strokeWidth={1.7}/>
            {b.label}
          </button>
        ))}
      </div>
    </header>
  );

  const EYEBROW = (txt) => <div style={APPLE_SECTION}>{txt}</div>;

  // ═══ Opción 1 — Vista equilibrada (actual) ═══════════════════════════════
  const V1 = (
    <>
      <section style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }} className="dash-kpis">
        {kpis.map((k, i) => (
          <div key={i} style={{ ...APPLE_CARD, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: "rgba(158,154,229,0.12)",
                border: "0.5px solid rgba(158,154,229,0.18)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--accent)",
              }}>
                <Icon name={k.icon} size={15} strokeWidth={1.7}/>
              </div>
            </div>
            <div>
              <div style={{
                fontSize: typeof k.value === "string" && k.value.startsWith("€") ? 22 : 28,
                fontWeight: 400, lineHeight: 1, letterSpacing: "-1.1px",
                fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-display)",
                color: "var(--text)",
              }}>{k.value}</div>
              <div style={{
                marginTop: 8, fontSize: 12, color: "var(--text-muted)",
                fontWeight: 500, letterSpacing: "-0.3px",
              }}>{k.label}</div>
              <div style={{
                marginTop: 3, fontSize: 11, color: "var(--text-subtle)", letterSpacing: "-0.2px",
              }}>{k.sub}</div>
            </div>
          </div>
        ))}
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="dash-bottom">
        {/* Agenda */}
        <div style={{ ...APPLE_CARD, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 360 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "18px 22px 14px", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
            <div>
              {EYEBROW("Próximamente")}
              <div style={{ marginTop: 4, fontSize: 15, fontWeight: 500, letterSpacing: "-0.5px", color: "var(--text)" }}>Agenda</div>
            </div>
            <button onClick={() => navigate("agenda")} style={LINK_BTN}>Ver todo <Icon name="arrow" size={12}/></button>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {upcomingEvents.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center" }}>
                <Empty icon="check" title="Sin eventos próximos" sub="Todo al día por ahora."/>
              </div>
            ) : upcomingEvents.map((ev, i) => (
              <EventRow key={i} ev={ev} last={i === upcomingEvents.length - 1} formatEventDate={formatEventDate}/>
            ))}
          </div>
        </div>

        {/* Colas */}
        <div style={{ ...APPLE_CARD, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 360 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "18px 22px 14px", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
            <div>
              {EYEBROW("Pendiente")}
              <div style={{ marginTop: 4, fontSize: 15, fontWeight: 500, letterSpacing: "-0.5px", color: "var(--text)" }}>Colas de trabajo</div>
            </div>
            <button onClick={() => navigate("projects")} style={LINK_BTN}>Ver todo <Icon name="arrow" size={12}/></button>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {queues.map((q, i) => (
              <QueueRow key={i} q={q}/>
            ))}
            <ActiveProjects D={D} navigate={navigate} openModal={openModal} APPLE_SECTION={APPLE_SECTION}/>
          </div>
        </div>
      </section>
    </>
  );

  // ── Datos derivados para las vistas alternativas ─────────────────────────
  const todayMid = new Date(); todayMid.setHours(0,0,0,0);
  const todayStrYMD = `${todayMid.getFullYear()}-${String(todayMid.getMonth()+1).padStart(2,'0')}-${String(todayMid.getDate()).padStart(2,'0')}`;

  // Tareas (hoy + vencidas) ordenadas: vencidas primero
  const tasksTodayAndOverdue = Object.entries(D.TASKS).flatMap(([pid, list]) =>
    (list || []).filter(t => {
      if (!t.deadline || t.column === "done") return false;
      const d = new Date(t.deadline + "T00:00:00");
      return d.getTime() <= todayMid.getTime();
    }).map(t => ({ ...t, projectId: pid }))
  ).sort((a, b) => (a.deadline || "").localeCompare(b.deadline || ""));

  // Próximas reuniones
  const upcomingMeetings = upcomingEvents.filter(ev => ev.type === "Reunión");

  // Próximos eventos hoy
  const todayEvents = upcomingEvents.filter(ev => {
    const d = new Date(ev.date); d.setHours(0,0,0,0);
    return d.getTime() === todayMid.getTime();
  });

  // Facturas pendientes (orden por vencimiento)
  const pendingInvoicesList = D.INVOICES
    .filter(i => i.status !== "paid")
    .map(i => ({ ...i, _due: parseSpanishDate(i.due) || new Date(9999, 0, 1) }))
    .sort((a, b) => a._due - b._due);
  const pendingAmount = pendingInvoicesList.reduce((s, i) => s + (i.amount || 0), 0);

  // Top clientes por facturación pagada
  const clientRevenue = {};
  D.INVOICES.filter(i => i.status === "paid").forEach(i => {
    const k = i.clientId || i.client || "—";
    clientRevenue[k] = (clientRevenue[k] || 0) + (i.amount || 0);
  });
  const topClients = Object.entries(clientRevenue).map(([k, v]) => {
    const c = D.CLIENTS.find(cl => cl.id === k);
    return { name: c?.company || k, value: v, color: c?.color || "var(--accent)", id: c?.id, initials: c?.initials };
  }).sort((a, b) => b.value - a.value).slice(0, 5);
  const topClientsMax = topClients[0]?.value || 1;

  // Gastos mensuales recurrentes (de la página Gastos)
  const finData = (() => {
    try {
      const d = JSON.parse(localStorage.getItem("141_finance_v1"));
      return d && typeof d === "object" ? { subs: d.subs || [], expenses: d.expenses || [] } : { subs: [], expenses: [] };
    } catch { return { subs: [], expenses: [] }; }
  })();
  const monthlyRecurring = finData.subs.filter(s => s.active).reduce((a, s) =>
    a + (s.cycle === "yearly" ? (Number(s.amount) || 0) / 12 : (Number(s.amount) || 0)), 0);
  const upcomingRenewals = finData.subs.filter(s => s.active && s.nextRenewal)
    .map(s => ({ ...s, _d: new Date(s.nextRenewal) }))
    .filter(s => !isNaN(s._d))
    .sort((a, b) => a._d - b._d)
    .slice(0, 4);

  // Cartera: clientes activos, leads, MRR estimado
  const activeClients = D.CLIENTS.filter(c => c.status === "active" || !c.status).length;
  const totalLeads = (D.LEADS || []).filter(l => l.stage !== "lost" && l.stage !== "won").length;
  const mrrEstimated = D.CLIENTS.reduce((a, c) => a + (Number(c.mrr) || 0), 0);

  // Leads por etapa (pipeline)
  const leadsByStage = (window.Data.LEAD_STAGES || []).filter(s => s.id !== "lost").map(s => ({
    stage: s, items: (D.LEADS || []).filter(l => l.stage === s.id),
  }));

  // Formato €
  const fmtEur = (n) => "€" + Math.round(n || 0).toLocaleString("es-ES");
  const fmtEurC = (n) => "€" + ((n || 0) / 100).toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  // KPI tile compartido (estilo Apple)
  const renderKpiTile = (k, i) => (
    <div key={i} style={{ ...APPLE_CARD, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: "rgba(158,154,229,0.12)",
          border: "0.5px solid rgba(158,154,229,0.18)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--accent)",
        }}>
          <Icon name={k.icon} size={15} strokeWidth={1.7}/>
        </div>
      </div>
      <div>
        <div style={{
          fontSize: typeof k.value === "string" && k.value.startsWith("€") ? 22 : 28,
          fontWeight: 400, lineHeight: 1, letterSpacing: "-1.1px",
          fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-display)",
          color: "var(--text)",
        }}>{k.value}</div>
        <div style={{
          marginTop: 8, fontSize: 12, color: "var(--text-muted)",
          fontWeight: 500, letterSpacing: "-0.3px",
        }}>{k.label}</div>
        <div style={{
          marginTop: 3, fontSize: 11, color: "var(--text-subtle)", letterSpacing: "-0.2px",
        }}>{k.sub}</div>
      </div>
    </div>
  );

  // ═══ Opción 2 — Vista financiera ═════════════════════════════════════════
  const finKpis = [
    { label: "Cobrado este mes", icon: "receipt",
      value: stripeMonth === null ? "…" : stripeMonth === false ? "—" : fmtEurC(stripeMonth),
      sub: stripeMonth === null ? "Conectando…" : new Date().toLocaleString("es-ES", { month: "long" }) },
    { label: "Por cobrar", icon: "clock", value: fmtEur(pendingAmount),
      sub: `${pendingInvoicesList.length} ${pendingInvoicesList.length === 1 ? "factura" : "facturas"} pendientes` },
    { label: "Gasto recurrente", icon: "refresh-cw", value: fmtEur(monthlyRecurring),
      sub: monthlyRecurring ? "al mes (suscripciones)" : "Sin suscripciones" },
    { label: "Facturas vencidas", icon: "alert-triangle",
      value: pendingInvoicesList.filter(i => i._due < todayMid).length,
      sub: "requieren cobro" },
  ];

  const V2 = (
    <>
      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {finKpis.map(renderKpiTile)}
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        {/* Facturas pendientes */}
        <div style={{ ...APPLE_CARD, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 360 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "18px 22px 14px", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
            <div>
              {EYEBROW("Por cobrar")}
              <div style={{ marginTop: 4, fontSize: 15, fontWeight: 500, letterSpacing: "-0.5px" }}>Facturas pendientes</div>
            </div>
            <button onClick={() => navigate("billing")} style={LINK_BTN}>Ver todo <Icon name="arrow" size={12}/></button>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {pendingInvoicesList.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center" }}>
                <Empty icon="check" title="Sin facturas pendientes" sub="Todo cobrado."/>
              </div>
            ) : pendingInvoicesList.slice(0, 8).map((inv, i) => {
              const isOverdue = inv._due < todayMid;
              return (
                <div key={inv.id} onClick={() => navigate("billing")}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.025)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "14px 22px",
                    cursor: "pointer", transition: "background .1s",
                    borderBottom: i < Math.min(7, pendingInvoicesList.length - 1) ? "0.5px solid rgba(255,255,255,0.04)" : "none",
                  }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: isOverdue ? "var(--red-soft)" : "rgba(255,255,255,0.04)",
                    border: "0.5px solid " + (isOverdue ? "rgba(220,91,93,0.25)" : "rgba(255,255,255,0.06)"),
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: isOverdue ? "var(--red)" : "var(--text-muted)",
                  }}>
                    <Icon name="receipt" size={15} strokeWidth={1.7}/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: "-0.3px",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inv.client}</div>
                    <div style={{ fontSize: 12, color: "var(--text-subtle)", marginTop: 2 }}>
                      {inv.id} · {isOverdue ? <span style={{ color: "var(--red)" }}>Vencida</span> : "Vence " + (inv.due || "—")}
                    </div>
                  </div>
                  <div style={{
                    fontSize: 16, fontWeight: 500, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.3px",
                    color: isOverdue ? "var(--red)" : "var(--text)",
                  }}>€{(inv.amount || 0).toLocaleString("es-ES")}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top clientes */}
        <div style={{ ...APPLE_CARD, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 360 }}>
          <div style={{ padding: "18px 22px 14px", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
            {EYEBROW("Top clientes")}
            <div style={{ marginTop: 4, fontSize: 15, fontWeight: 500, letterSpacing: "-0.5px" }}>Por facturación</div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "10px 22px" }}>
            {topClients.length === 0 ? (
              <div style={{ padding: 30, textAlign: "center" }}>
                <Empty icon="users" title="Sin facturación" sub="Aún no hay facturas pagadas."/>
              </div>
            ) : topClients.map((c, i) => (
              <div key={i} onClick={() => c.id && navigate("clientDetail", { clientId: c.id })}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.025)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                style={{ padding: "12px 8px", cursor: "pointer", borderRadius: 8, transition: "background .1s",
                  marginInline: -8 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 99, background: c.color, flexShrink: 0 }}/>
                    <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: "-0.2px",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                  </div>
                  <span style={{ fontSize: 12.5, fontVariantNumeric: "tabular-nums", color: "var(--text-muted)" }}>
                    €{c.value.toLocaleString("es-ES")}
                  </span>
                </div>
                <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(c.value / topClientsMax) * 100}%`,
                    background: c.color, borderRadius: 99 }}/>
                </div>
              </div>
            ))}

            {upcomingRenewals.length > 0 && (
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: "0.5px solid rgba(255,255,255,0.06)" }}>
                <div style={{ ...APPLE_SECTION, marginBottom: 10 }}>Próximas renovaciones</div>
                {upcomingRenewals.map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "6px 0", fontSize: 12.5 }}>
                    <span style={{ color: "var(--text)", letterSpacing: "-0.2px" }}>{s.name}</span>
                    <span style={{ color: "var(--text-subtle)", fontVariantNumeric: "tabular-nums" }}>
                      €{(Number(s.amount) || 0).toLocaleString("es-ES")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );

  // ═══ Opción 3 — Vista del día ════════════════════════════════════════════
  const todayKpis = [
    { label: "Tareas para hoy", icon: "list-todo",
      value: tasksTodayAndOverdue.filter(t => t.deadline === todayStrYMD).length,
      sub: "incluyendo vencidas" },
    { label: "Tareas vencidas", icon: "alert-triangle", value: overdueTasks,
      sub: overdueTasks ? "requieren atención" : "Todo al día" },
    { label: "Eventos hoy", icon: "calendar", value: todayEvents.length,
      sub: todayEvents.length ? "en agenda" : "Sin eventos" },
    { label: "Proyectos en riesgo", icon: "flag", value: atRisk,
      sub: atRisk ? "semáforo rojo" : "Todo en orden" },
  ];

  const V3 = (
    <>
      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {todayKpis.map(renderKpiTile)}
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        {/* Mis tareas (hoy + vencidas) */}
        <div style={{ ...APPLE_CARD, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 360 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "18px 22px 14px", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
            <div>
              {EYEBROW("Para mí")}
              <div style={{ marginTop: 4, fontSize: 15, fontWeight: 500, letterSpacing: "-0.5px" }}>Tareas de hoy</div>
            </div>
            <button onClick={() => navigate("tasks")} style={LINK_BTN}>Ver todo <Icon name="arrow" size={12}/></button>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {tasksTodayAndOverdue.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center" }}>
                <Empty icon="check" title="Día limpio" sub="No hay tareas para hoy."/>
              </div>
            ) : tasksTodayAndOverdue.slice(0, 9).map((t, i) => {
              const overdue = t.deadline < todayStrYMD;
              const project = t.projectId !== "__none__" ? D.PROJECTS.find(p => p.id === t.projectId) : null;
              return (
                <div key={t.id} onClick={() => navigate(project ? "project" : "tasks", project ? { projectId: project.id } : {})}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.025)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 22px",
                    cursor: "pointer", transition: "background .1s",
                    borderBottom: i < Math.min(8, tasksTodayAndOverdue.length - 1) ? "0.5px solid rgba(255,255,255,0.04)" : "none" }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                    border: `1.5px solid ${overdue ? "var(--red)" : "var(--border-strong)"}`,
                    background: "transparent",
                  }}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: "-0.3px",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</div>
                    <div style={{ fontSize: 11.5, color: overdue ? "var(--red)" : "var(--text-subtle)", marginTop: 2 }}>
                      {project ? project.name + " · " : ""}{overdue ? "Vencida" : "Hoy"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Próximas reuniones */}
        <div style={{ ...APPLE_CARD, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 360 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "18px 22px 14px", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
            <div>
              {EYEBROW("Calendario")}
              <div style={{ marginTop: 4, fontSize: 15, fontWeight: 500, letterSpacing: "-0.5px" }}>Próximas reuniones</div>
            </div>
            <button onClick={() => navigate("agenda")} style={LINK_BTN}>Agenda <Icon name="arrow" size={12}/></button>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {upcomingMeetings.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center" }}>
                <Empty icon="users" title="Sin reuniones" sub="No tienes reuniones próximas."/>
              </div>
            ) : upcomingMeetings.map((ev, i) => (
              <EventRow key={i} ev={ev} last={i === upcomingMeetings.length - 1} formatEventDate={formatEventDate}/>
            ))}
          </div>
        </div>
      </section>
    </>
  );

  // ═══ Opción 4 — Vista de cartera ═════════════════════════════════════════
  const carteraKpis = [
    { label: "Clientes activos", icon: "users", value: activeClients,
      sub: D.CLIENTS.length + " en total" },
    { label: "Proyectos en curso", icon: "folder", value: activeProjects, sub: capacityLabel },
    { label: "Leads abiertos", icon: "flag", value: totalLeads,
      sub: totalLeads ? "en pipeline" : "Sin actividad" },
    { label: "MRR estimado", icon: "receipt", value: mrrEstimated ? fmtEur(mrrEstimated) : "—",
      sub: mrrEstimated ? "mensual recurrente" : "Sin MRR" },
  ];

  const V4 = (
    <>
      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {carteraKpis.map(renderKpiTile)}
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        {/* Cartera de clientes */}
        <div style={{ ...APPLE_CARD, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 360 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "18px 22px 14px", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
            <div>
              {EYEBROW("Cartera")}
              <div style={{ marginTop: 4, fontSize: 15, fontWeight: 500, letterSpacing: "-0.5px" }}>Clientes activos</div>
            </div>
            <button onClick={() => navigate("clients")} style={LINK_BTN}>Ver todo <Icon name="arrow" size={12}/></button>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {D.CLIENTS.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center" }}>
                <Empty icon="users" title="Sin clientes" sub="Añade tu primer cliente."/>
              </div>
            ) : D.CLIENTS.slice(0, 8).map((c, i) => {
              const projs = D.PROJECTS.filter(p => p.clientId === c.id);
              const anyRisk = projs.some(p => p.light === "red");
              return (
                <div key={c.id} onClick={() => navigate("clientDetail", { clientId: c.id })}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.025)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 22px",
                    cursor: "pointer", transition: "background .1s",
                    borderBottom: i < Math.min(7, D.CLIENTS.length - 1) ? "0.5px solid rgba(255,255,255,0.04)" : "none" }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                    background: (c.color || "var(--accent)") + "22",
                    border: "0.5px solid " + (c.color || "var(--accent)") + "33",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: c.color || "var(--accent)",
                    fontSize: 12, fontWeight: 600, letterSpacing: "-0.02em",
                  }}>{c.initials || (c.company || "?").slice(0,2).toUpperCase()}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: "-0.3px",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.company}</div>
                    <div style={{ fontSize: 11.5, color: "var(--text-subtle)", marginTop: 2 }}>
                      {projs.length} {projs.length === 1 ? "proyecto" : "proyectos"}
                      {c.service && c.service !== "—" ? " · " + c.service : ""}
                    </div>
                  </div>
                  <span style={{
                    width: 8, height: 8, borderRadius: 99,
                    background: anyRisk ? "var(--red)" : projs.length ? "var(--green)" : "var(--text-subtle)",
                    flexShrink: 0,
                  }}/>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pipeline de leads */}
        <div style={{ ...APPLE_CARD, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 360 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "18px 22px 14px", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
            <div>
              {EYEBROW("Pipeline")}
              <div style={{ marginTop: 4, fontSize: 15, fontWeight: 500, letterSpacing: "-0.5px" }}>Leads por etapa</div>
            </div>
            <button onClick={() => navigate("clients")} style={LINK_BTN}>Ver todo <Icon name="arrow" size={12}/></button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "10px 22px" }}>
            {leadsByStage.length === 0 || (D.LEADS || []).length === 0 ? (
              <div style={{ padding: 30, textAlign: "center" }}>
                <Empty icon="flag" title="Sin leads" sub="El pipeline está vacío."/>
              </div>
            ) : leadsByStage.map((g, i) => (
              <div key={i} style={{ padding: "10px 0",
                borderBottom: i < leadsByStage.length - 1 ? "0.5px solid rgba(255,255,255,0.04)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12.5, color: "var(--text-muted)", letterSpacing: "-0.2px" }}>{g.stage.label}</span>
                  <span style={{ fontSize: 14, fontVariantNumeric: "tabular-nums", color: "var(--text)",
                    fontFamily: "var(--font-display)" }}>{g.items.length}</span>
                </div>
                <div style={{ marginTop: 6, height: 4, borderRadius: 99, background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, g.items.length * 20)}%`,
                    background: "var(--accent)", borderRadius: 99 }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 28,
      padding: "32px 36px 48px",
      maxWidth: 1440, margin: "0 auto",
    }}>
      {Header}
      {dashOpt === "v1" && V1}
      {dashOpt === "v2" && V2}
      {dashOpt === "v3" && V3}
      {dashOpt === "v4" && V4}
    </div>
  );
};

// ─── Subcomponentes compartidos (fuera del cuerpo de AgencyDashboard) ──────
const LINK_BTN = {
  display: "inline-flex", alignItems: "center", gap: 4, height: 28, padding: "0 10px",
  borderRadius: 8, fontSize: 12, fontWeight: 500, color: "var(--accent)",
  background: "transparent", border: 0, cursor: "pointer", fontFamily: "inherit", letterSpacing: "-0.2px",
};

const EventRow = ({ ev, last, formatEventDate }) => (
  <div
    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.025)"}
    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "14px 22px", transition: "background .1s",
      borderBottom: last ? "none" : "0.5px solid rgba(255,255,255,0.04)",
    }}>
    <div style={{
      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
      background: "rgba(255,255,255,0.04)",
      border: "0.5px solid rgba(255,255,255,0.06)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: ev.color || "var(--text-muted)",
    }}>
      <Icon name={ev.icon} size={15} strokeWidth={1.7}/>
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        fontSize: 13.5, fontWeight: 500, letterSpacing: "-0.3px",
        color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>{ev.label}</div>
      <div style={{ fontSize: 12, color: "var(--text-subtle)", marginTop: 2, letterSpacing: "-0.2px" }}>
        {formatEventDate(ev.date)}{ev.time ? `, ${ev.time}${ev.timeEnd ? ` – ${ev.timeEnd}` : ""}` : ""}
      </div>
    </div>
    <span style={{
      fontSize: 10.5, padding: "3px 9px", borderRadius: 99,
      background: "rgba(255,255,255,0.05)", color: "var(--text-muted)",
      border: "0.5px solid rgba(255,255,255,0.08)", letterSpacing: "-0.1px",
      whiteSpace: "nowrap", fontWeight: 500,
    }}>{ev.type}</span>
  </div>
);

const QueueRow = ({ q }) => (
  <div onClick={q.action}
    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.025)"}
    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 22px", cursor: "pointer", transition: "background .1s",
      borderBottom: "0.5px solid rgba(255,255,255,0.04)",
    }}>
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{
        width: 32, height: 32, borderRadius: 9, flexShrink: 0,
        background: "rgba(255,255,255,0.04)",
        border: "0.5px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "var(--text-muted)",
      }}>
        <Icon name={q.icon} size={14} strokeWidth={1.7}/>
      </div>
      <span style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: "-0.3px" }}>{q.label}</span>
    </div>
    <span style={{
      fontSize: 17, fontWeight: 400, fontVariantNumeric: "tabular-nums",
      color: q.count > 0 ? "var(--text)" : "var(--text-subtle)",
      letterSpacing: "-0.5px", fontFamily: "var(--font-display)",
    }}>{q.count}</span>
  </div>
);

const ActiveProjects = ({ D, navigate, openModal, APPLE_SECTION }) => (
  <div style={{ padding: "18px 22px 14px" }}>
    <div style={{ ...APPLE_SECTION, marginBottom: 12 }}>Proyectos activos</div>
    {D.PROJECTS.length === 0 ? (
      <div style={{ fontSize: 12.5, color: "var(--text-subtle)", padding: "4px 0" }}>
        Sin proyectos. <button onClick={() => openModal("newProject")}
          style={{ background: "transparent", border: 0, color: "var(--accent)", cursor: "pointer",
            fontSize: 12.5, padding: 0, fontFamily: "inherit", textDecoration: "underline" }}>Crear uno</button>
      </div>
    ) : D.PROJECTS.slice(0, 5).map(p => {
      const pTasks = D.TASKS[p.id] || [];
      const live = pTasks.length ? Math.round(pTasks.filter(t => t.column === "done").length / pTasks.length * 100) : 0;
      return (
        <div key={p.id} onClick={() => navigate("project", { projectId: p.id })}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          style={{
            display: "flex", alignItems: "center", gap: 12, padding: "8px 8px",
            cursor: "pointer", borderRadius: 8, transition: "background .1s", marginInline: -8,
          }}>
          <span className={"dot " + p.light}/>
          <span style={{
            flex: 1, fontSize: 13, fontWeight: 500, minWidth: 0, letterSpacing: "-0.2px",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{p.name}</span>
          <div style={{ width: 78, display: "flex", alignItems: "center", gap: 8 }}>
            <div className="progress" style={{ flex: 1 }}><i style={{ width: live + "%" }}/></div>
            <span style={{
              fontSize: 11, color: "var(--text-muted)",
              fontVariantNumeric: "tabular-nums", width: 28, textAlign: "right",
            }}>{live}%</span>
          </div>
        </div>
      );
    })}
  </div>
);

window.AgencyDashboard = AgencyDashboard;

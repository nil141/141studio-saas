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
            { id: "v1", label: "Opción 1" },
            { id: "v2", label: "Opción 2" },
            { id: "v3", label: "Opción 3" },
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

  // ═══ Opción 2 — Foco del día (resumen ejecutivo) ═════════════════════════
  const todayTasks = Object.values(D.TASKS).flat().filter(t => {
    if (!t.deadline || t.column === "done") return false;
    const d = new Date(t.deadline + "T00:00:00");
    const today = new Date(); today.setHours(0,0,0,0);
    return d.getTime() === today.getTime();
  });
  const todayEvents = upcomingEvents.filter(ev => {
    const d = new Date(ev.date); d.setHours(0,0,0,0);
    const today = new Date(); today.setHours(0,0,0,0);
    return d.getTime() === today.getTime();
  });

  const V2 = (
    <section style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }}>
      {/* Columna principal */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Tarjeta Hoy */}
        <div style={{ ...APPLE_CARD, padding: "22px 24px" }}>
          {EYEBROW("Hoy")}
          <div style={{ marginTop: 6, fontSize: 22, fontWeight: 500, letterSpacing: "-0.8px", fontFamily: "var(--font-display)" }}>
            {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 18 }}>
            {[
              { label: "Tareas para hoy", value: todayTasks.length, sub: todayTasks.length ? "pendientes" : "Sin tareas", icon: "list-todo" },
              { label: "Eventos hoy",     value: todayEvents.length, sub: todayEvents.length ? "en agenda" : "Sin eventos", icon: "calendar" },
              { label: "Vencidas",        value: overdueTasks, sub: overdueTasks ? "requieren atención" : "Todo al día", icon: "alert-triangle" },
            ].map((k, i) => (
              <div key={i} style={{
                padding: "14px 16px", borderRadius: 12,
                background: "rgba(255,255,255,0.03)",
                border: "0.5px solid rgba(255,255,255,0.06)",
              }}>
                <Icon name={k.icon} size={14} strokeWidth={1.7} style={{ color: "var(--text-muted)", marginBottom: 10 }}/>
                <div style={{
                  fontSize: 26, fontWeight: 400, letterSpacing: "-1px", fontFamily: "var(--font-display)",
                  fontVariantNumeric: "tabular-nums", lineHeight: 1,
                }}>{k.value}</div>
                <div style={{ marginTop: 6, fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>{k.label}</div>
                <div style={{ marginTop: 2, fontSize: 11, color: "var(--text-subtle)" }}>{k.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Cronología única */}
        <div style={{ ...APPLE_CARD, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 320 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "18px 22px 14px", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
            <div>
              {EYEBROW("Próximos días")}
              <div style={{ marginTop: 4, fontSize: 15, fontWeight: 500, letterSpacing: "-0.5px" }}>Cronología</div>
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
      </div>

      {/* Sidebar de estado */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ ...APPLE_CARD, padding: "18px 22px" }}>
          {EYEBROW("Estado")}
          <div style={{ marginTop: 4, fontSize: 15, fontWeight: 500, letterSpacing: "-0.5px", marginBottom: 14 }}>Pulso de la agencia</div>
          {kpis.map((k, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 0", borderBottom: i < kpis.length - 1 ? "0.5px solid rgba(255,255,255,0.05)" : "none",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                <Icon name={k.icon} size={14} strokeWidth={1.7} style={{ color: "var(--text-muted)", flexShrink: 0 }}/>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", letterSpacing: "-0.3px" }}>{k.label}</div>
                  <div style={{ fontSize: 11, color: "var(--text-subtle)" }}>{k.sub}</div>
                </div>
              </div>
              <div style={{
                fontSize: 18, fontWeight: 400, letterSpacing: "-0.6px", fontFamily: "var(--font-display)",
                fontVariantNumeric: "tabular-nums", flexShrink: 0, paddingLeft: 12,
              }}>{k.value}</div>
            </div>
          ))}
        </div>

        <div style={{ ...APPLE_CARD, padding: "18px 22px" }}>
          {EYEBROW("Proyectos")}
          <div style={{ marginTop: 4, fontSize: 15, fontWeight: 500, letterSpacing: "-0.5px", marginBottom: 12 }}>Activos</div>
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
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500, minWidth: 0, letterSpacing: "-0.2px",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                <span style={{ fontSize: 11, color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>{live}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );

  // ═══ Opción 3 — Minimalista (stats inline + 3 columnas) ══════════════════
  const V3 = (
    <>
      {/* Tira de stats inline (sin tiles) */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 32, padding: "20px 24px",
        ...APPLE_CARD,
      }}>
        {kpis.map((k, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 130 }}>
            <div style={{ fontSize: 11, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500 }}>
              {k.label}
            </div>
            <div style={{
              fontSize: typeof k.value === "string" && k.value.startsWith("€") ? 22 : 26,
              fontWeight: 400, letterSpacing: "-0.9px", fontFamily: "var(--font-display)",
              fontVariantNumeric: "tabular-nums", lineHeight: 1.1,
            }}>{k.value}</div>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* 3 columnas: Agenda | Colas | Proyectos activos */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 16 }}>
        {/* Agenda */}
        <div style={{ ...APPLE_CARD, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 380 }}>
          <div style={{ padding: "18px 22px 14px", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
            {EYEBROW("Próximamente")}
            <div style={{ marginTop: 4, fontSize: 15, fontWeight: 500, letterSpacing: "-0.5px" }}>Agenda</div>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {upcomingEvents.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center" }}>
                <Empty icon="check" title="Sin eventos" sub=""/>
              </div>
            ) : upcomingEvents.slice(0, 6).map((ev, i) => (
              <EventRow key={i} ev={ev} last={i === Math.min(5, upcomingEvents.length - 1)} formatEventDate={formatEventDate}/>
            ))}
          </div>
        </div>

        {/* Colas */}
        <div style={{ ...APPLE_CARD, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 380 }}>
          <div style={{ padding: "18px 22px 14px", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
            {EYEBROW("Pendiente")}
            <div style={{ marginTop: 4, fontSize: 15, fontWeight: 500, letterSpacing: "-0.5px" }}>Colas</div>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {queues.map((q, i) => <QueueRow key={i} q={q}/>)}
          </div>
        </div>

        {/* Proyectos */}
        <div style={{ ...APPLE_CARD, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 380 }}>
          <div style={{ padding: "18px 22px 14px", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
            {EYEBROW("En curso")}
            <div style={{ marginTop: 4, fontSize: 15, fontWeight: 500, letterSpacing: "-0.5px" }}>Proyectos</div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 22px" }}>
            {D.PROJECTS.length === 0 ? (
              <div style={{ fontSize: 12.5, color: "var(--text-subtle)", padding: "4px 0" }}>
                Sin proyectos. <button onClick={() => openModal("newProject")}
                  style={{ background: "transparent", border: 0, color: "var(--accent)", cursor: "pointer",
                    fontSize: 12.5, padding: 0, fontFamily: "inherit", textDecoration: "underline" }}>Crear uno</button>
              </div>
            ) : D.PROJECTS.slice(0, 6).map(p => {
              const pTasks = D.TASKS[p.id] || [];
              const live = pTasks.length ? Math.round(pTasks.filter(t => t.column === "done").length / pTasks.length * 100) : 0;
              return (
                <div key={p.id} onClick={() => navigate("project", { projectId: p.id })}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "8px 8px",
                    cursor: "pointer", borderRadius: 8, transition: "background .1s", marginInline: -8,
                  }}>
                  <span className={"dot " + p.light}/>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 500, minWidth: 0, letterSpacing: "-0.2px",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                  <div style={{ width: 60, display: "flex", alignItems: "center", gap: 6 }}>
                    <div className="progress" style={{ flex: 1 }}><i style={{ width: live + "%" }}/></div>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", fontVariantNumeric: "tabular-nums", width: 28, textAlign: "right" }}>{live}%</span>
                  </div>
                </div>
              );
            })}
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

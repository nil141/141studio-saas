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

  // Reloj en vivo — se actualiza cada segundo
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const greeting = (() => {
    const h = now.getHours();
    if (h < 6)  return "Buenas noches";
    if (h < 13) return "Buenos días";
    if (h < 21) return "Buenas tardes";
    return "Buenas noches";
  })();

  const todayStr = (() => {
    const dias  = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
    const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
    return `${dias[now.getDay()]} ${now.getDate()} de ${meses[now.getMonth()]}`;
  })();

  const timeStr = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}:${String(now.getSeconds()).padStart(2,"0")}`;

  const agencyName     = D.SETTINGS.name || "141'STUDIO";
  const adminEmail     = D.SETTINGS.email || "nil@141agency.com";
  const adminName      = (() => { const n = adminEmail.split("@")[0]; return n.charAt(0).toUpperCase() + n.slice(1); })();
  const activeProjects = D.PROJECTS.length;
  // Solo tareas "vivas": de proyectos existentes + sueltas (__none__). Excluye
  // huérfanas de proyectos borrados, que inflaban el contador de pendientes.
  const _projIds = new Set(D.PROJECTS.map(p => p.id));
  const _liveTasks = Object.entries(D.TASKS)
    .filter(([pid]) => pid === "__none__" || _projIds.has(pid))
    .flatMap(([, arr]) => arr);
  const _todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
  const _pending  = _liveTasks.filter(t => t.column !== "done");
  // "Tareas pendientes" del panel = las de HOY: vencen hoy o son atrasadas que
  // se arrastran (misma lógica que el tablero de Tareas).
  const pendingTasks = _pending.filter(t => t.deadline && t.deadline <= _todayStr).length;
  const overdueTasks = _pending.filter(t => t.deadline && t.deadline < _todayStr).length;
  const backlogTasks = _pending.length;   // todas las incompletas (para la cola de trabajo)
  const pendingInvoices = D.INVOICES.filter(i => i.status !== "paid").length;
  const atRisk = D.PROJECTS.filter(p => p.light === "red").length;
  const capacity = activeProjects <= 3 ? "green" : activeProjects <= 4 ? "amber" : "red";
  const capacityLabel = activeProjects === 0 ? "Sin proyectos"
    : activeProjects <= 3 ? "Capacidad cómoda"
    : activeProjects <= 4 ? "Capacidad media" : "Al límite";

  // ── Mensaje bajo el saludo: "Hoy es [fecha] y son las [hora]." ──
  const dayMessage = `Hoy es ${todayStr} y son las ${timeStr}`;

  // ── Stripe ──
  const [stripeMonth, setStripeMonth] = useState(null);
  const [stripePrev, setStripePrev]   = useState(null);   // mes anterior (para la comparativa)
  useEffect(() => {
    const now = new Date();
    const monthStart = Math.floor(new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000);
    const prevStart  = Math.floor(new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime() / 1000);
    window.apiFetch("/api/stripe/invoices", { limit: 100 })
      .then(r => r.json())
      .then(res => {
        if (!res.ok) { setStripeMonth(false); return; }
        const paid = (res.invoices || []).filter(i => i.status === "paid");
        setStripeMonth(paid.filter(i => i.created >= monthStart).reduce((a,b) => a+(b.amount_paid??b.amount??0), 0));
        setStripePrev(paid.filter(i => i.created >= prevStart && i.created < monthStart).reduce((a,b) => a+(b.amount_paid??b.amount??0), 0));
      })
      .catch(() => setStripeMonth(false));
  }, []);

  // ── Próximos eventos (solo lo que está por venir: reuniones, cobros, entregas, facturas) ──
  const upcomingEvents = React.useMemo(() => {
    const ev = [];
    const todayMid = new Date(); todayMid.setHours(0,0,0,0);

    // Entregas de proyectos (con deadline futuro)
    D.PROJECTS.forEach(p => {
      const d = parseSpanishDate(p.deadline);
      if (d) ev.push({ date: d, label: p.name, sub: p.clientName, type: "Entrega",
        color: p.light==="red"?"var(--red)":p.light==="amber"?"var(--amber)":"var(--green)",
        icon: "folder" });
    });

    // Facturas pendientes de cobro
    D.INVOICES.filter(i => i.status !== "paid").forEach(i => {
      const d = parseSpanishDate(i.due);
      if (d) ev.push({ date: d, label: i.id, sub: `${i.client} · €${i.amount}`, type: "Factura",
        color: i.status==="overdue"?"var(--red)":"var(--amber)", icon: "receipt" });
    });

    // Cobros de suscripciones (siguiente renovación desde Gastos)
    try {
      const fin = JSON.parse(localStorage.getItem("141_finance_v1") || "{}");
      (fin.subs || []).filter(s => s.active !== false && s.nextRenewal).forEach(s => {
        let d = new Date(s.nextRenewal + "T00:00:00");
        if (isNaN(d)) return;
        // Si la fecha ya pasó, avanzamos al siguiente ciclo hasta que sea futura
        let guard = 0;
        while (d < todayMid && guard < 60) {
          if (s.cycle === "yearly") d.setFullYear(d.getFullYear() + 1);
          else d.setMonth(d.getMonth() + 1);
          guard++;
        }
        const amount = Number(s.amount) || 0;
        ev.push({
          date: d, label: s.name,
          sub: `Cobro · €${amount.toLocaleString("es-ES")} · ${s.cycle === "yearly" ? "anual" : "mensual"}`,
          type: "Suscripción", color: "var(--accent)", icon: "refresh-cw",
        });
      });
    } catch (err) {}

    // Eventos personalizados de Agenda (reuniones, etc.)
    try {
      const custom = JSON.parse(localStorage.getItem("agenda_custom_events") || "[]");
      custom.forEach(e => {
        if (!e.date) return;
        const d = new Date(e.date + "T00:00:00");
        if (isNaN(d)) return;
        const iconMap  = { meeting:"users", task:"list-todo", custom:"calendar" };
        const colorMap = { meeting:"var(--red)", task:"var(--accent)", custom:"var(--blue)" };
        const typeLabel= { meeting:"Reunión", task:"Tarea", custom:"Evento" };
        ev.push({
          date: d, label: e.title,
          time: e.time || null, timeEnd: e.timeEnd || null,
          type: typeLabel[e.type] || "Evento",
          color: colorMap[e.type] || "var(--blue)",
          icon: iconMap[e.type] || "calendar",
        });
      });
    } catch(err) {}

    // Solo los próximos 7 días (hoy incluido)
    return ev
      .filter(e => {
        const dMid = new Date(e.date); dMid.setHours(0,0,0,0);
        const diff = Math.round((dMid - todayMid) / 86400000);
        return diff >= 0 && diff <= 7;
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
  // Gastos por mes — mismos datos que la página de Gastos (recurrente + puntual)
  const _spendForMonth = (offset = 0) => {
    try {
      const fin = JSON.parse(localStorage.getItem("141_finance_v1") || "{}");
      const rec = (fin.subs || []).filter(s => s.active !== false)
        .reduce((a, s) => a + (s.cycle === "yearly" ? (Number(s.amount) || 0) / 12 : (Number(s.amount) || 0)), 0);
      const base = new Date(); const y = base.getFullYear(), m = base.getMonth() + offset;
      const ref = new Date(y, m, 1);
      const exp = (fin.expenses || []).filter(e => {
        if (!e.date) return false;
        const d = new Date(e.date);
        return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
      }).reduce((a, e) => a + (Number(e.amount) || 0), 0);
      return rec + exp;
    } catch { return 0; }
  };
  const monthSpend     = _spendForMonth(0);
  const lastMonthSpend = _spendForMonth(-1);
  const prevMonthLabel = new Date(now.getFullYear(), now.getMonth() - 1, 1).toLocaleString("es-ES", { month: "short" });
  const _pctDelta = (cur, prev) => (prev > 0 ? Math.round(((cur - prev) / prev) * 100) : null);
  const spendDelta   = _pctDelta(monthSpend, lastMonthSpend);
  const invoiceDelta = (stripeMonth !== null && stripeMonth !== false && stripePrev !== null)
    ? _pctDelta(stripeMonth, stripePrev) : null;

  // Comparativa: {text, suffix, dir, tone} para el indicador estilo outdomode
  const _countDelta = (n, word) => n > 0
    ? { text: String(n), suffix: word, dir: "down", tone: "bad" }
    : { text: "0", suffix: word, dir: "flat", tone: "muted" };
  const _pctToDelta = (pct, goodUp, suffix) => {
    if (pct === null) return { text: "—", suffix, dir: "flat", tone: "muted" };
    const up = pct > 0, down = pct < 0;
    const good = up === goodUp;
    return {
      text: `${up ? "+" : down ? "−" : ""}${Math.abs(pct)}%`,
      suffix, dir: up ? "up" : down ? "down" : "flat",
      tone: (up || down) ? (good ? "good" : "bad") : "muted",
    };
  };

  const [hoverKpi, setHoverKpi] = useState(null);
  const kpis = [
    {
      label:  "Proyectos activos",
      value:  activeProjects,
      delta:  _countDelta(atRisk, "en riesgo"),
      nav:    "projects",
    },
    {
      label:  "Tareas pendientes",
      value:  pendingTasks,
      delta:  _countDelta(overdueTasks, "vencidas"),
      nav:    "tasks",
    },
    {
      label:  "Gastos este mes",
      value:  `€${monthSpend.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      delta:  _pctToDelta(spendDelta, false, `vs ${prevMonthLabel}`),
      nav:    "billing",
    },
    {
      label:  "Facturado este mes",
      value:  stripeMonth===null?"…":stripeMonth===false?"—":`€${(stripeMonth/100).toLocaleString("es-ES",{minimumFractionDigits:0,maximumFractionDigits:0})}`,
      delta:  stripeMonth===false
                ? { text:"Sin Stripe", dir:"flat", tone:"muted" }
                : _pctToDelta(invoiceDelta, true, `vs ${prevMonthLabel}`),
      nav:    "income",
    },
  ];

  // ── Queues ──
  const queues = [
    { icon:"list-todo", label:"Tareas sin completar",  count:backlogTasks,    action:()=>navigate("projects") },
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

  // ── Cabecera común (saludo + acción rápida) ──────────────────────────────
  const Header = (
    <header style={{ display: "flex", flexDirection: "column", gap: 20, flexShrink: 0,
      borderBottom: "0.5px solid var(--border)", paddingBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h1 style={{
            fontSize: 36, fontWeight: 400, letterSpacing: "-1.2px", lineHeight: 1.05,
            margin: 0, fontFamily: "var(--font-display)", color: "var(--text)",
          }}>{greeting}, {adminName}.</h1>
          <p style={{
            margin: 0, fontSize: 14, color: "var(--text-muted)", letterSpacing: "-0.2px", lineHeight: 1.4,
          }}>
            {dayMessage}
          </p>
        </div>

        <ActionPill
          plusActions={[
            { icon: "plus",    label: "Nueva tarea",    sub: "Añade una tarea rápida.",  accent: true, onClick: () => openModal("newTask") },
            { icon: "folder",  label: "Nuevo proyecto", sub: "Crea un proyecto.",        onClick: () => openModal("newProject") },
            { icon: "users",   label: "Nuevo cliente",  sub: "Añade una ficha o portal.", onClick: () => openModal("newClient") },
            { icon: "receipt", label: "Nueva factura",  sub: "Registra una factura.",    onClick: () => navigate("billing") },
          ]}
        />
      </div>
    </header>
  );

  const EYEBROW = (txt) => <div style={APPLE_SECTION}>{txt}</div>;

  // ── Activity reciente (datos compartidos para varias vistas) ─────────────
  const recentActivity = [
    ...D.PROJECTS.slice(0, 2).map(p => ({ icon: "folder", text: p.name, sub: "Proyecto en curso" })),
    ...D.CLIENTS.slice(0, 2).map(c => ({ icon: "users", text: c.company, sub: c.service || "Cliente" })),
    ...(D.INVOICES || []).slice(0, 1).map(i => ({ icon: "receipt", text: i.client, sub: "Factura " + (i.status || "—") })),
  ].slice(0, 5);

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

  // Mini KPI compacto (para variantes densas)
  const renderMiniKpi = (k, i) => (
    <div key={i} style={{ ...APPLE_CARD, padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 11.5, color: "var(--text-muted)", letterSpacing: "-0.2px" }}>{k.label}</span>
        <Icon name={k.icon} size={12} strokeWidth={1.7} style={{ color: "var(--text-subtle)" }}/>
      </div>
      <div style={{
        fontSize: typeof k.value === "string" && k.value.startsWith("€") ? 18 : 22,
        fontWeight: 400, letterSpacing: "-0.8px", fontFamily: "var(--font-display)",
        fontVariantNumeric: "tabular-nums", lineHeight: 1,
      }}>{k.value}</div>
    </div>
  );

  // Bloques reutilizables
  const AgendaBlock = ({ height = 360, slice = 8 }) => (
    <div style={{ ...APPLE_CARD, display: "flex", flexDirection: "column", overflow: "hidden", height }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 22px 14px", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
        <div>
          {EYEBROW("Próximamente")}
          <div style={{ marginTop: 4, fontSize: 15, fontWeight: 500, letterSpacing: "-0.5px" }}>Agenda</div>
        </div>
        <button onClick={() => navigate("agenda")} style={LINK_BTN}>Ver todo <Icon name="arrow" size={12}/></button>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {upcomingEvents.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center" }}>
            <Empty icon="check" title="Sin eventos próximos" sub="Todo al día por ahora."/>
          </div>
        ) : upcomingEvents.slice(0, slice).map((ev, i) => (
          <EventRow key={i} ev={ev} last={i === Math.min(slice - 1, upcomingEvents.length - 1)} formatEventDate={formatEventDate}/>
        ))}
      </div>
    </div>
  );

  const QueuesBlock = ({ height = 360, showProjects = true }) => (
    <div style={{ ...APPLE_CARD, display: "flex", flexDirection: "column", overflow: "hidden", height }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 22px 14px", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
        <div>
          {EYEBROW("Pendiente")}
          <div style={{ marginTop: 4, fontSize: 15, fontWeight: 500, letterSpacing: "-0.5px" }}>Colas de trabajo</div>
        </div>
        <button onClick={() => navigate("projects")} style={LINK_BTN}>Ver todo <Icon name="arrow" size={12}/></button>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {queues.map((q, i) => <QueueRow key={i} q={q}/>)}
        {showProjects && <ActiveProjects D={D} navigate={navigate} openModal={openModal} APPLE_SECTION={APPLE_SECTION}/>}
      </div>
    </div>
  );

  const ProjectsBlock = ({ height = 360, slice = 6 }) => (
    <div style={{ ...APPLE_CARD, display: "flex", flexDirection: "column", overflow: "hidden", height }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 22px 14px", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
        <div>
          {EYEBROW("En curso")}
          <div style={{ marginTop: 4, fontSize: 15, fontWeight: 500, letterSpacing: "-0.5px" }}>Proyectos</div>
        </div>
        <button onClick={() => navigate("projects")} style={LINK_BTN}>Ver todo <Icon name="arrow" size={12}/></button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 22px" }}>
        {D.PROJECTS.length === 0 ? (
          <div style={{ fontSize: 12.5, color: "var(--text-subtle)", padding: "4px 0" }}>
            Sin proyectos. <button onClick={() => openModal("newProject")}
              style={{ background: "transparent", border: 0, color: "var(--accent)", cursor: "pointer",
                fontSize: 12.5, padding: 0, fontFamily: "inherit", textDecoration: "underline" }}>Crear uno</button>
          </div>
        ) : D.PROJECTS.slice(0, slice).map(p => {
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
              <div style={{ width: 70, display: "flex", alignItems: "center", gap: 8 }}>
                <div className="progress" style={{ flex: 1 }}><i style={{ width: live + "%" }}/></div>
                <span style={{ fontSize: 11, color: "var(--text-muted)", fontVariantNumeric: "tabular-nums", width: 28, textAlign: "right" }}>{live}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Stats inline (tira sin tiles)
  const StatsInline = () => (
    <div style={{ ...APPLE_CARD, display: "flex", flexWrap: "wrap", gap: 32, padding: "20px 24px" }}>
      {kpis.map((k, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 130 }}>
          <div style={{ fontSize: 11, color: "var(--text-subtle)", textTransform: "uppercase",
            letterSpacing: "0.08em", fontWeight: 500 }}>{k.label}</div>
          <div style={{
            fontSize: typeof k.value === "string" && k.value.startsWith("€") ? 22 : 26,
            fontWeight: 400, letterSpacing: "-0.9px", fontFamily: "var(--font-display)",
            fontVariantNumeric: "tabular-nums", lineHeight: 1.1,
          }}>{k.value}</div>
          <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{k.sub}</div>
        </div>
      ))}
    </div>
  );

  // ═══ Opción 3 — Tres columnas iguales ════════════════════════════════════
  const V3 = (
    <>
      <section style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32,
        borderBottom: "0.5px solid var(--border)", padding: "0 4px 26px", flexShrink: 0,
      }}>
        {kpis.map((k, i) => {
          const clickable = !!k.nav;
          const on = hoverKpi === i;
          return (
          <div key={i}
            onClick={clickable ? () => navigate(k.nav) : undefined}
            onMouseEnter={clickable ? () => setHoverKpi(i) : undefined}
            onMouseLeave={clickable ? () => setHoverKpi(null) : undefined}
            style={{ display: "flex", flexDirection: "column", gap: 14, cursor: clickable ? "pointer" : "default" }}>
            <span style={{ fontSize: 16, lineHeight: 1.3, color: on ? "var(--text)" : "var(--text-muted)", letterSpacing: "-0.2px", transition: "color .15s" }}>{k.label}</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 32, color: on ? "var(--accent)" : "var(--text)", letterSpacing: "-0.08em", lineHeight: 1,
                  fontFamily: "var(--font-display)", fontVariantNumeric: "tabular-nums", transition: "color .15s" }}>{k.value}</span>
                {k.unit && <span style={{ fontSize: 16, color: "var(--text-muted)" }}>{k.unit}</span>}
              </div>
              {k.delta && <MetricDelta {...k.delta}/>}
            </div>
          </div>
          );
        })}
      </section>
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, flex: 1, minHeight: 0 }}>
        <AgendaBlock height="100%" slice={6}/>
        <QueuesBlock height="100%" showProjects={false}/>
        <ProjectsBlock height="100%"/>
      </section>
    </>
  );

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 28,
      height: "100vh", overflow: "hidden",
      padding: "28px 32px",
      maxWidth: 1400, margin: "0 auto",
    }}>
      {Header}
      {V3}
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
      <div style={{ fontSize: 12, color: "var(--text-subtle)", marginTop: 2, letterSpacing: "-0.2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        <span style={{ color: "var(--text-muted)" }}>{formatEventDate(ev.date)}{ev.time ? `, ${ev.time}${ev.timeEnd ? ` – ${ev.timeEnd}` : ""}` : ""}</span>
        {ev.sub ? ` · ${ev.sub}` : ""}
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

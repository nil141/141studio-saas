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

  const agencyName   = D.SETTINGS.name || "141'STUDIO";
  const adminName    = (D.SETTINGS.email || "nil@141agency.com").split("@")[0];
  const activeProjects = D.PROJECTS.length;
  const pendingTasks   = Object.values(D.TASKS).flat().filter(t => t.column !== "done").length;
  const overdueTasks   = Object.values(D.TASKS).flat().filter(t => {
    if (!t.deadline || t.column === "done") return false;
    return new Date(t.deadline + "T00:00:00") < new Date();
  }).length;
  const pendingInvoices = D.INVOICES.filter(i => i.status !== "paid").length;
  const atRisk = D.PROJECTS.filter(p => p.light === "red").length;

  // Capacity
  const capacity = activeProjects <= 3 ? "green" : activeProjects <= 4 ? "amber" : "red";
  const capacityLabel = activeProjects === 0 ? "Sin proyectos" : activeProjects <= 3 ? "Capacidad cómoda" : activeProjects <= 4 ? "Capacidad media" : "Capacidad al límite";

  // ── Facturado este mes ──
  const [stripeMonth, setStripeMonth] = useState(null);
  useEffect(() => {
    const now = new Date();
    const monthStart = Math.floor(new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000);
    fetch("/api/stripe/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ limit: 100 }),
    })
      .then(r => r.json())
      .then(res => {
        if (!res.ok) { setStripeMonth(false); return; }
        const total = (res.invoices || [])
          .filter(i => i.status === "paid" && i.created >= monthStart)
          .reduce((a, b) => a + (b.amount_paid ?? b.amount ?? 0), 0);
        setStripeMonth(total);
      })
      .catch(() => setStripeMonth(false));
  }, []);

  // ── Upcoming events ──
  const upcomingEvents = React.useMemo(() => {
    const ev = [];
    const today = new Date();
    D.PROJECTS.forEach(p => {
      const d = parseSpanishDate(p.deadline);
      if (d) ev.push({ date: d, label: p.name, sub: p.clientName, type: "entrega",
        dot: p.light === "red" ? "var(--red)" : p.light === "amber" ? "var(--amber)" : "var(--green)" });
    });
    D.INVOICES.filter(i => i.status !== "paid").forEach(i => {
      const d = parseSpanishDate(i.due);
      if (d) ev.push({ date: d, label: i.id, sub: `${i.client} · €${i.amount}`, type: "factura",
        dot: i.status === "overdue" ? "var(--red)" : "var(--amber)" });
    });
    Object.entries(D.TASKS).forEach(([pid, taskList]) => {
      const project = pid !== "__none__" ? D.PROJECTS.find(p => p.id === pid) : null;
      (taskList || []).forEach(t => {
        if (!t.deadline || t.column === "done") return;
        const d = new Date(t.deadline + "T00:00:00");
        if (isNaN(d)) return;
        ev.push({ date: d, label: t.title, sub: project ? project.name : "—", type: "tarea",
          dot: "var(--blue)" });
      });
    });
    return ev
      .filter(e => {
        const diff = e.date - today;
        return diff >= -86400000 && diff <= 60 * 86400000;
      })
      .sort((a, b) => a.date - b.date)
      .slice(0, 8);
  }, [D.PROJECTS, D.INVOICES, D.TASKS]);

  const formatEventDate = (d) => {
    const today = new Date();
    const diff  = Math.round((d - today) / 86400000);
    if (diff < 0)  return `hace ${Math.abs(diff)}d`;
    if (diff === 0) return "Hoy";
    if (diff === 1) return "Mañana";
    const dias  = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
    const meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
    return `${dias[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]}`;
  };

  // ── KPI cards config ──
  const kpis = [
    {
      label: "Proyectos activos",
      value: activeProjects,
      sub: activeProjects === 0 ? "Crea el primero" : capacityLabel,
      color: capacity === "green" ? "var(--green)" : capacity === "amber" ? "var(--amber)" : "var(--red)",
      icon: "folder",
    },
    {
      label: "Tareas pendientes",
      value: pendingTasks,
      sub: pendingTasks === 0 ? "Todo al día ✓" : "en todos los proyectos",
      color: pendingTasks === 0 ? "var(--green)" : "var(--blue)",
      icon: "check",
    },
    {
      label: "Tareas vencidas",
      value: overdueTasks,
      sub: overdueTasks === 0 ? "Ninguna vencida ✓" : "requieren atención",
      color: overdueTasks > 0 ? "var(--red)" : "var(--green)",
      icon: "warning",
    },
    {
      label: "Proyectos en riesgo",
      value: atRisk,
      sub: atRisk === 0 ? "Todo en orden ✓" : "semáforo rojo",
      color: atRisk > 0 ? "var(--red)" : "var(--green)",
      icon: "bolt",
    },
    {
      label: "Facturado este mes",
      value: stripeMonth === null ? "…"
           : stripeMonth === false ? "—"
           : `€${(stripeMonth / 100).toLocaleString("es-ES", {minimumFractionDigits:0, maximumFractionDigits:0})}`,
      sub: stripeMonth === null ? "Conectando…"
         : stripeMonth === false ? "Sin conexión Stripe"
         : new Date().toLocaleString("es-ES", {month:"long"}),
      color: "var(--accent)",
      icon: "euro",
      big: true,
    },
  ];

  // ── Work queues ──
  const queues = [
    {
      label: "Tareas sin completar",
      count: pendingTasks,
      color: "var(--blue)",
      action: () => navigate("projects"),
    },
    {
      label: "Tareas vencidas",
      count: overdueTasks,
      color: overdueTasks > 0 ? "var(--red)" : "var(--text-subtle)",
      action: () => navigate("projects"),
    },
    {
      label: "Proyectos en riesgo",
      count: atRisk,
      color: atRisk > 0 ? "var(--red)" : "var(--text-subtle)",
      action: () => navigate("projects"),
    },
    {
      label: "Facturas pendientes",
      count: pendingInvoices,
      color: pendingInvoices > 0 ? "var(--amber)" : "var(--text-subtle)",
      action: () => navigate("invoices"),
    },
  ];

  return (
    <div className="page" style={{display:"flex", flexDirection:"column", gap:18, paddingBottom:32}}>

      {/* ── Welcome banner ── */}
      <div className="card" style={{padding:0, overflow:"hidden"}}>
        <div style={{display:"flex", alignItems:"stretch", gap:0}}>
          {/* Left: greeting + actions */}
          <div style={{flex:1, padding:"24px 28px 22px"}}>
            <div style={{fontSize:10, fontWeight:700, letterSpacing:"0.12em",
              color:"var(--text-subtle)", marginBottom:8, textTransform:"uppercase"}}>
              Resumen del espacio de trabajo
            </div>
            <div style={{fontSize:26, fontWeight:700, lineHeight:1.15, marginBottom:4}}>
              {greeting}, {adminName}.
            </div>
            <div style={{fontSize:13, color:"var(--text-muted)", marginBottom:18}}>
              {agencyName} · {todayStr}
            </div>
            <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
              <button className="btn sm" onClick={() => openModal("newTask")}>
                <Icon name="plus" size={13}/> Nueva tarea
              </button>
              <button className="btn sm" onClick={() => openModal("newProject")}>
                <Icon name="plus" size={13}/> Nuevo proyecto
              </button>
              <button className="btn sm" onClick={() => openModal("invite")}>
                <Icon name="external-link" size={13}/> Invitar cliente
              </button>
              <button className="btn sm" onClick={() => navigate("invoices")}>
                <Icon name="euro" size={13}/> Nueva factura
              </button>
            </div>
          </div>

          {/* Right: capacity */}
          <div style={{
            width:220, padding:"22px 24px",
            borderLeft:"0.5px solid var(--border)",
            background:"var(--bg-elev-2)",
            display:"flex", flexDirection:"column", justifyContent:"center", gap:10,
          }}>
            <div style={{fontSize:10, fontWeight:700, letterSpacing:"0.1em",
              color:"var(--text-subtle)", textTransform:"uppercase", marginBottom:2}}>
              Capacidad
            </div>
            <div style={{display:"flex", gap:5}}>
              {[1,2,3,4,5].map(n => (
                <div key={n} style={{
                  flex:1, height:6, borderRadius:99,
                  background: n <= activeProjects
                    ? (capacity === "green" ? "var(--green)" : capacity === "amber" ? "var(--amber)" : "var(--red)")
                    : "var(--border)",
                  transition:"background .3s",
                }}/>
              ))}
            </div>
            <div style={{fontSize:12, fontWeight:500,
              color: capacity === "green" ? "var(--green)" : capacity === "amber" ? "var(--amber)" : "var(--red)"}}>
              {capacityLabel}
            </div>
            <div style={{fontSize:11, color:"var(--text-subtle)"}}>
              {activeProjects} proyecto{activeProjects !== 1 ? "s" : ""} activo{activeProjects !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI row ── */}
      <div style={{display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12}}>
        {kpis.map((k, i) => (
          <div key={i} className="card" style={{padding:0, overflow:"hidden"}}>
            <div style={{padding:"16px 18px 12px"}}>
              <div style={{fontSize:11, color:"var(--text-subtle)", fontWeight:500, marginBottom:8}}>
                {k.label}
              </div>
              <div style={{
                fontSize: k.big ? 20 : 28,
                fontWeight:700, lineHeight:1,
                fontVariantNumeric:"tabular-nums",
                marginBottom:6,
              }}>
                {k.value}
              </div>
              <div style={{fontSize:11, color:"var(--text-muted)"}}>
                {k.sub}
              </div>
            </div>
            <div style={{height:3, background: k.color}}/>
          </div>
        ))}
      </div>

      {/* ── Bottom two columns ── */}
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>

        {/* Agenda próxima */}
        <div className="card" style={{display:"flex", flexDirection:"column"}}>
          <div className="card-header">
            <div>
              <div className="card-title">Agenda próxima</div>
              <div className="card-sub">Próximos vencimientos y entregas</div>
            </div>
            <button className="btn ghost sm" onClick={() => navigate("projects")}>
              Ver todo <Icon name="arrow" size={12}/>
            </button>
          </div>
          <div className="card-body flush" style={{flex:1}}>
            {upcomingEvents.length === 0 ? (
              <div style={{padding:32, textAlign:"center"}}>
                <Empty icon="check" title="Sin eventos próximos" sub="Todo al día por ahora."/>
              </div>
            ) : upcomingEvents.map((ev, i) => (
              <div key={i} style={{
                display:"flex", alignItems:"center", gap:12, padding:"11px 18px",
                borderBottom: i < upcomingEvents.length - 1 ? "0.5px solid var(--border)" : "none",
              }}>
                <div style={{width:6, height:6, borderRadius:"50%", background:ev.dot, flexShrink:0}}/>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:13, fontWeight:500, overflow:"hidden",
                    textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{ev.label}</div>
                  <div style={{fontSize:11, color:"var(--text-subtle)"}}>{ev.sub}</div>
                </div>
                <div style={{display:"flex", alignItems:"center", gap:6, flexShrink:0}}>
                  <span style={{fontSize:11, color:"var(--text-muted)", whiteSpace:"nowrap"}}>
                    {formatEventDate(ev.date)}
                  </span>
                  <span style={{
                    fontSize:10, padding:"1px 7px", borderRadius:99,
                    border:"0.5px solid var(--border)", color:"var(--text-subtle)",
                  }}>{ev.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Colas de trabajo */}
        <div className="card" style={{display:"flex", flexDirection:"column"}}>
          <div className="card-header">
            <div>
              <div className="card-title">Colas de trabajo</div>
              <div className="card-sub">Seguimiento inmediato · requieren acción</div>
            </div>
          </div>
          <div className="card-body flush" style={{flex:1}}>
            {queues.map((q, i) => (
              <div key={i}
                onClick={q.action}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                style={{
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                  padding:"14px 18px", cursor:"pointer", transition:"background .08s",
                  borderBottom: i < queues.length - 1 ? "0.5px solid var(--border)" : "none",
                }}>
                <div style={{display:"flex", alignItems:"center", gap:10}}>
                  <div style={{width:8, height:8, borderRadius:2, background:q.color, flexShrink:0}}/>
                  <span style={{fontSize:13}}>{q.label}</span>
                </div>
                <span style={{
                  fontSize:15, fontWeight:700, color:q.color,
                  fontVariantNumeric:"tabular-nums",
                }}>
                  {q.count}
                </span>
              </div>
            ))}

            {/* Active projects list */}
            <div style={{padding:"14px 18px 6px", borderTop:"0.5px solid var(--border)"}}>
              <div style={{fontSize:11, fontWeight:600, color:"var(--text-subtle)",
                textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10}}>
                Proyectos activos
              </div>
              {D.PROJECTS.length === 0 ? (
                <div style={{fontSize:12, color:"var(--text-subtle)", padding:"8px 0"}}>
                  Sin proyectos activos
                </div>
              ) : D.PROJECTS.slice(0, 4).map((p, i) => {
                const pTasks = D.TASKS[p.id] || [];
                const liveProgress = pTasks.length
                  ? Math.round(pTasks.filter(t => t.column === "done").length / pTasks.length * 100)
                  : 0;
                return (
                  <div key={p.id}
                    onClick={() => navigate("project", { projectId: p.id })}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    style={{
                      display:"flex", alignItems:"center", gap:10, padding:"7px 0",
                      cursor:"pointer", borderRadius:6, transition:"background .08s",
                    }}>
                    <span className={"dot " + p.light}/>
                    <span style={{flex:1, fontSize:12.5, fontWeight:500, minWidth:0,
                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
                      {p.name}
                    </span>
                    <div style={{width:70, display:"flex", alignItems:"center", gap:6}}>
                      <div className="progress" style={{flex:1}}>
                        <i style={{width: liveProgress + "%"}}/>
                      </div>
                      <span style={{fontSize:11, color:"var(--text-muted)",
                        fontVariantNumeric:"tabular-nums", width:26, textAlign:"right"}}>
                        {liveProgress}%
                      </span>
                    </div>
                  </div>
                );
              })}
              {D.PROJECTS.length > 4 && (
                <button className="btn ghost sm" style={{marginTop:6, width:"100%"}}
                  onClick={() => navigate("projects")}>
                  Ver todos ({D.PROJECTS.length}) <Icon name="arrow" size={11}/>
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

window.AgencyDashboard = AgencyDashboard;

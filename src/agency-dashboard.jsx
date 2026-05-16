// Agency Dashboard — 141'STUDIO MVP

// ── Mini calendar helper ─────────────────────────────────────
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

const DashboardCalendar = ({ navigate }) => {
  const D = window.Data;
  const [viewDate, setViewDate] = React.useState(() => new Date());
  const [selected, setSelected] = React.useState(null);

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const MONTH_NAMES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const DAY_NAMES   = ["L","M","X","J","V","S","D"];

  const today    = new Date();
  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  // Gather events from projects + invoices + tasks
  const events = React.useMemo(() => {
    const ev = [];
    D.PROJECTS.forEach(p => {
      const d = parseSpanishDate(p.deadline);
      if (d) ev.push({ date: d, label: p.name, sub: p.clientName, type: "project",
        dot: p.light === "red" ? "var(--red)" : p.light === "amber" ? "var(--amber)" : "var(--green)" });
    });
    D.INVOICES.filter(i => i.status !== "paid").forEach(i => {
      const d = parseSpanishDate(i.due);
      if (d) ev.push({ date: d, label: i.id, sub: `${i.client} · €${i.amount}`, type: "invoice",
        dot: i.status === "overdue" ? "var(--red)" : "var(--amber)" });
    });
    Object.entries(D.TASKS).forEach(([pid, taskList]) => {
      const project = pid !== "__none__" ? D.PROJECTS.find(p => p.id === pid) : null;
      (taskList || []).forEach(t => {
        if (!t.deadline) return;
        const d = new Date(t.deadline + "T00:00:00");
        if (isNaN(d)) return;
        ev.push({ date: d, label: t.title, sub: t.clientName || "", type: "task",
          dot: "var(--blue)", projectName: project ? project.name : null });
      });
    });
    return ev.sort((a, b) => a.date - b.date);
  }, [D.PROJECTS, D.INVOICES, D.TASKS]);

  const eventsOnDay = (d) => events.filter(e =>
    e.date.getFullYear() === year && e.date.getMonth() === month && e.date.getDate() === d
  );

  const startOffset = (new Date(year, month, 1).getDay() + 6) % 7; // Mon-based
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const upcomingEvents = selected
    ? eventsOnDay(selected)
    : events.filter(e => {
        const diff = e.date - today;
        return diff >= -86400000 && diff <= 45 * 86400000;
      }).slice(0, 7);

  return (
    <div className="card" style={{display:"flex", flexDirection:"column"}}>
      {/* Header */}
      <div className="card-header">
        <div className="card-title">Calendario</div>
        <div className="row tight" style={{alignItems:"center"}}>
          <button className="btn ghost icon-only sm"
            onClick={() => { setViewDate(new Date(year, month - 1, 1)); setSelected(null); }}>
            <Icon name="chevron" size={12} style={{transform:"rotate(180deg)"}}/>
          </button>
          <span style={{fontSize:12, fontWeight:500, minWidth:110, textAlign:"center"}}>
            {MONTH_NAMES[month]} {year}
          </span>
          <button className="btn ghost icon-only sm"
            onClick={() => { setViewDate(new Date(year, month + 1, 1)); setSelected(null); }}>
            <Icon name="chevron" size={12}/>
          </button>
          <button className="btn ghost sm" style={{fontSize:11, marginLeft:4}}
            onClick={() => { setViewDate(new Date()); setSelected(null); }}>Hoy</button>
        </div>
      </div>

      <div style={{padding:"12px 16px 0"}}>
        {/* Day headers */}
        <div style={{display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, marginBottom:4}}>
          {DAY_NAMES.map(d => (
            <div key={d} style={{textAlign:"center", fontSize:10, fontWeight:600,
              color:"var(--text-subtle)", padding:"2px 0"}}>{d}</div>
          ))}
        </div>
        {/* Day cells */}
        <div style={{display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2}}>
          {Array.from({length: startOffset}).map((_,i) => <div key={"e"+i}/>)}
          {Array.from({length: daysInMonth}).map((_,i) => {
            const day  = i + 1;
            const key  = `${year}-${month}-${day}`;
            const isToday    = key === todayKey;
            const isSelected = selected === day;
            const dayEvs     = eventsOnDay(day);
            return (
              <div key={day}
                onClick={() => setSelected(isSelected ? null : day)}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "var(--bg-hover)"; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isToday ? "var(--accent-soft)" : "transparent"; }}
                style={{
                  textAlign:"center", padding:"5px 2px", borderRadius:7, cursor:"pointer",
                  background: isSelected ? "var(--accent)" : isToday ? "var(--accent-soft)" : "transparent",
                  color: isSelected ? "var(--accent-fg)" : "var(--text-muted)",
                  transition:"background .1s",
                }}>
                <div style={{fontSize:12, fontWeight: isToday || isSelected ? 600 : 400}}>{day}</div>
                {dayEvs.length > 0 && (
                  <div style={{display:"flex", justifyContent:"center", gap:2, marginTop:2}}>
                    {dayEvs.slice(0,3).map((ev,idx) => (
                      <div key={idx} style={{width:4, height:4, borderRadius:"50%",
                        background: isSelected ? "var(--accent-fg)" : ev.dot}}/>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Events list */}
      <div style={{padding:"10px 16px 14px", marginTop:8, borderTop:"0.5px solid var(--border)"}}>
        <div style={{fontSize:11, fontWeight:600, color:"var(--text-subtle)", marginBottom:8}}>
          {selected
            ? `${selected} de ${MONTH_NAMES[month].toLowerCase()}`
            : "Próximos eventos"}
        </div>
        {upcomingEvents.length === 0 ? (
          <div style={{textAlign:"center", color:"var(--text-subtle)", fontSize:12, padding:"12px 0"}}>
            Sin eventos {selected ? "este día" : "próximos"}
          </div>
        ) : (
          <div style={{display:"flex", flexDirection:"column", gap:5}}>
            {upcomingEvents.map((ev, i) => (
              <div key={i} style={{display:"flex", alignItems:"center", gap:8,
                padding:"6px 8px", borderRadius:7, background:"var(--bg-elev-2)"}}>
                <div style={{width:6, height:6, borderRadius:"50%", background:ev.dot, flexShrink:0}}/>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:12, fontWeight:500, overflow:"hidden",
                    textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{ev.label}</div>
                  <div style={{fontSize:11, color:"var(--text-subtle)"}}>{ev.sub}</div>
                </div>
                {ev.type === "project" && (
                  <span style={{fontSize:10, color:"var(--text-subtle)", flexShrink:0,
                    padding:"1px 6px", border:"0.5px solid var(--border)", borderRadius:99}}>
                    entrega
                  </span>
                )}
                {ev.type === "invoice" && (
                  <span style={{fontSize:10, color:"var(--text-subtle)", flexShrink:0,
                    padding:"1px 6px", border:"0.5px solid var(--border)", borderRadius:99}}>
                    factura
                  </span>
                )}
                {ev.type === "task" && ev.projectName && (
                  <span style={{fontSize:10, color:"var(--text-subtle)", flexShrink:0,
                    padding:"1px 6px", border:"0.5px solid var(--border)", borderRadius:99}}>
                    {ev.projectName}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
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

  const agencyName  = D.SETTINGS.name || "141'STUDIO";
  const activeProjects = D.PROJECTS.length;
  const capacity    = activeProjects <= 3 ? "green" : activeProjects === 4 ? "amber" : "red";
  const capacityLabel = activeProjects === 0 ? "Sin proyectos" : activeProjects <= 3 ? "Zona cómoda" : activeProjects === 4 ? "Zona de atención" : "Zona de riesgo";
  const pendingTasks  = Object.values(D.TASKS).flat().filter(t => t.column !== "done").length;
  const toApprove     = 2;

  // ── Facturado este mes desde Stripe ──
  const [stripeMonth, setStripeMonth] = useState(null); // null = cargando
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

  return (
    <div className="page" style={{display:"flex", flexDirection:"column", minHeight:"calc(100vh - 56px)", paddingBottom:28}}>
      <div className="page-head">
        <div>
          <h1>{greeting}, {agencyName.split(" ")[0]}.</h1>
          <div className="sub">{todayStr} · esto tienes encima de la mesa.</div>
        </div>
        <div className="row tight">
          <button className="btn" onClick={() => openModal("newTask")}><Icon name="plus" size={14}/> Nueva tarea</button>
          <button className="btn" onClick={() => openModal("invite")}><Icon name="external-link" size={14}/> Invitar cliente</button>
          <button className="btn primary" onClick={() => openModal("newProject")}><Icon name="plus" size={14}/> Nuevo proyecto</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="rg-4" style={{marginBottom:18}}>
        <div className="card"><div className="card-body">
          <div className="metric">
            <div className="row between">
              <div className="metric-label">Proyectos activos</div>
              <span className={"chip " + capacity}>{capacityLabel}</span>
            </div>
            <div className="metric-value">{activeProjects}</div>
            <div className="metric-delta">{activeProjects === 0 ? "Crea el primero" : `${activeProjects} en marcha`}</div>
          </div>
        </div></div>

        <div className="card"><div className="card-body">
          <div className="metric">
            <div className="metric-label">Tareas pendientes</div>
            <div className="metric-value">{pendingTasks}</div>
            <div className="metric-delta">{pendingTasks === 0 ? "Todo al día" : "en todos los proyectos"}</div>
          </div>
        </div></div>

        <div className="card"><div className="card-body">
          <div className="metric">
            <div className="metric-label">Por aprobar (cliente)</div>
            <div className="metric-value" style={toApprove > 0 ? {color:"var(--amber)"} : {}}>{toApprove}</div>
            <div className="metric-delta warn">Acción del cliente</div>
          </div>
        </div></div>

        <div className="card"><div className="card-body">
          <div className="metric">
            <div className="metric-label">Facturado este mes</div>
            <div className="metric-value">
              {stripeMonth === null
                ? <span style={{fontSize:18, color:"var(--text-subtle)"}}>…</span>
                : stripeMonth === false
                  ? <span style={{fontSize:16, color:"var(--text-subtle)"}}>—</span>
                  : `€${(stripeMonth / 100).toLocaleString("es-ES", {minimumFractionDigits:2, maximumFractionDigits:2})}`
              }
            </div>
            <div className="metric-delta">
              {stripeMonth === null ? "Conectando con Stripe…"
               : stripeMonth === false ? "Sin conexión a Stripe"
               : "Cobrado en " + new Date().toLocaleString("es-ES", {month:"long"})}
            </div>
          </div>
        </div></div>
      </div>

      <div className="rg-dash">
        {/* Active projects */}
        <div className="card" style={{display:"flex", flexDirection:"column"}}>
          <div className="card-header">
            <div>
              <div className="card-title">Proyectos activos</div>
              <div className="card-sub">{D.PROJECTS.length} en marcha · semáforo de estado y próxima acción</div>
            </div>
            <button className="btn ghost sm" onClick={() => navigate("projects")}>Ver todos <Icon name="arrow" size={12}/></button>
          </div>
          <div className="card-body flush" style={{flex:1, overflowY:"auto"}}>
            {D.PROJECTS.length === 0 ? (
              <div style={{padding:40}}>
                <Empty icon="folder" title="Sin proyectos activos" sub="Crea uno para empezar a trabajar."/>
                <div className="row" style={{justifyContent:"center", marginTop:8}}>
                  <button className="btn primary sm" onClick={() => openModal("newProject")}><Icon name="plus" size={12}/> Nuevo proyecto</button>
                </div>
              </div>
            ) : D.PROJECTS.map((p, i) => {
              const phase = D.PHASES[p.phase];
              const pTasks = D.TASKS[p.id] || [];
              const liveProgress = pTasks.length ? Math.round(pTasks.filter(t=>t.column==="done").length/pTasks.length*100) : 0;
              return (
                <div key={p.id} onClick={() => navigate("project", { projectId: p.id })}
                  style={{display:"flex", alignItems:"center", gap:14, padding:"14px 18px",
                    borderBottom: i === D.PROJECTS.length - 1 ? "0" : "0.5px solid var(--border)",
                    cursor:"pointer", transition:"background .08s"}}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <span className={"dot " + p.light}/>
                  <div className="grow" style={{minWidth:0}}>
                    <div className="row tight">
                      <span style={{fontWeight:500, fontSize:13.5}}>{p.name}</span>
                      <span className="muted xsmall">·</span>
                      <span className="muted small">{p.clientName}</span>
                    </div>
                    <div className="row tight" style={{marginTop:4, color:"var(--text-muted)", fontSize:12}}>
                      <span className="chip" style={{padding:"1px 7px", fontSize:10.5}}>{phase.label} · {phase.weeks}</span>
                      <span style={{color: p.light === "red" ? "var(--red)" : p.light === "amber" ? "var(--amber)" : "var(--text-muted)"}}>
                        → {p.nextMilestone}
                      </span>
                    </div>
                  </div>
                  <div style={{width:120, display:"flex", alignItems:"center", gap:10}}>
                    <div className="progress grow"><i style={{width: liveProgress + "%"}}/></div>
                    <span style={{fontSize:12, color:"var(--text-muted)", fontVariantNumeric:"tabular-nums", width:32, textAlign:"right"}}>{liveProgress}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Calendar */}
        <DashboardCalendar navigate={navigate}/>
      </div>
    </div>
  );
};

window.AgencyDashboard = AgencyDashboard;

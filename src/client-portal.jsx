// Portal de cliente — datos reales: fases del proyecto (project.service) +
// progreso desde las tareas (D.TASKS), entregables y facturas de SUS proyectos.
const ClientLogin = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <div style={{minHeight:"100vh", display:"grid", gridTemplateColumns:"1fr 1fr", background:"var(--bg)"}}>
      <div style={{padding: 60, display:"flex", flexDirection:"column"}}>
        <div className="row tight" style={{marginBottom: "auto"}}>
          <div className="brand-mark">141</div>
          <div className="brand-name">141<span className="tick">'</span>STUDIO</div>
        </div>
        <div style={{maxWidth: 360}}>
          <h1 style={{fontSize: 32, fontWeight: 500, lineHeight: 1.15, marginBottom: 8}}>Bienvenido al portal de tu proyecto.</h1>
          <div className="muted" style={{fontSize: 14, marginBottom: 32}}>Aquí puedes ver el avance por fases, aprobar entregables y descargar tus facturas.</div>
          {!sent ? (
            <>
              <div className="label">Tu email</div>
              <input className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@empresa.com" style={{height: 40, marginBottom: 12}}/>
              <button className="btn primary full" style={{height: 40}} onClick={() => { setSent(true); setTimeout(onLogin, 900); }}>
                Enviar enlace mágico
              </button>
              <div className="subtle xsmall" style={{marginTop: 16, lineHeight: 1.5}}>Te enviaremos un enlace seguro a tu email. Sin contraseñas.</div>
            </>
          ) : (
            <div style={{padding: 20, border:"0.5px solid var(--border)", borderRadius: 12, background:"var(--bg-elev)"}}>
              <div className="row tight" style={{marginBottom: 8}}><Icon name="mail" size={14}/><span style={{fontWeight: 500}}>Revisa tu correo</span></div>
              <div className="muted small">Te hemos enviado un enlace a <b>{email}</b>. Entrando…</div>
            </div>
          )}
        </div>
        <div className="subtle xsmall" style={{marginTop: "auto"}}>© 141'STUDIO · soporte@141.studio</div>
      </div>
      <div style={{background:"linear-gradient(160deg,#0f172a 0%,#020617 60%,#312e81 100%)", position:"relative", overflow:"hidden"}}/>
    </div>
  );
};

const WhatsAppFloat = () => (
  <a href="https://wa.me/34611223344" target="_blank"
    style={{position:"fixed", right: 24, bottom: 24, zIndex: 30,
      background:"#25D366", color:"#fff", borderRadius: 99,
      padding:"12px 18px", display:"flex", alignItems:"center", gap: 8,
      boxShadow:"0 6px 20px rgba(37,211,102,0.35)", fontSize: 13, fontWeight: 500,
      textDecoration:"none"}}>
    <Icon name="msg-circle" size={15}/> Hablar con el equipo
  </a>
);

// ── Modelo real de fases + progreso (mismo que la vista de agencia) ──────────
// Las fases son nombres libres guardados en project.service; cada tarea lleva
// su fase en task.phase; el progreso se calcula desde las tareas hechas.
const _phaseStatus = (done, total) =>
  total === 0    ? { label: "Sin tareas",  cls: "" }
  : done === total ? { label: "Completada", cls: "green" }
  : done > 0     ? { label: "En curso",   cls: "blue" }
  :                { label: "Sin empezar", cls: "" };

const _planOf = (p) => {
  const D = window.Data;
  const names = (p.service || "").split(",").map(s => s.trim())
    .filter(n => n && n !== "libre" && n !== "—");
  const tasks = D.TASKS[p.id] || [];
  const mk = (name, gt) => {
    const done = gt.filter(t => t.column === "done").length;
    return { name, tasks: gt, done, total: gt.length, pct: gt.length ? Math.round(done / gt.length * 100) : 0 };
  };
  const groups = names.map(name => mk(name, tasks.filter(t => (t.phase || null) === name)));
  const otras = tasks.filter(t => !names.includes(t.phase || null));
  if (otras.length) groups.push(mk("Otras tareas", otras));
  const total = tasks.length;
  const done = tasks.filter(t => t.column === "done").length;
  const pct = total ? Math.round(done / total * 100) : (p.progress || 0);
  const active = groups.find(g => g.done > 0 && g.done < g.total)
    || groups.find(g => g.total > 0 && g.done === 0)
    || groups[groups.length - 1] || null;
  return { names, groups, total, done, pct, active };
};

const ClientDashboard = ({ navigate, session }) => {
  const D = window.Data;
  D.useStore && D.useStore();
  const projects = D.PROJECTS || [];

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 6)  return "Buenas noches";
    if (h < 13) return "Buenos días";
    if (h < 21) return "Buenas tardes";
    return "Buenas noches";
  })();
  const dateStr = (() => {
    const now = new Date();
    const dias  = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
    const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
    return `${dias[now.getDay()]} ${now.getDate()} de ${meses[now.getMonth()]}`;
  })();
  const firstName = session?.name?.split(" ")[0] || "";

  // Entregables reales pendientes de aprobar (de todos sus proyectos)
  const pending = (D.DELIVERABLES || []).filter(d => d.status && d.status !== "approved");

  const head = (
    <div className="page-head">
      <div>
        <h1>{greeting}{firstName ? ", " + firstName : ""}.</h1>
        <div className="sub">{dateStr}{projects.length ? " · esto tienes encima de la mesa." : ""}</div>
      </div>
    </div>
  );

  if (!projects.length) return (
    <div className="page">
      {head}
      <div style={{display:"flex", alignItems:"center", justifyContent:"center", minHeight:"40vh"}}>
        <Empty icon="folder" title="Sin proyectos activos" sub="Cuando tu agencia cree un proyecto podrás ver aquí su avance."/>
      </div>
      <WhatsAppFloat/>
    </div>
  );

  return (
    <div className="page">
      {head}

      {pending.length > 0 && (
        <div className="card" style={{marginBottom: 18, borderColor:"var(--amber)", background:"var(--amber-soft)"}}>
          <div className="card-body" style={{padding: 16, display:"flex", alignItems:"center", gap: 14, flexWrap:"wrap"}}>
            <div style={{width: 36, height: 36, borderRadius: 10, background:"var(--amber-soft)", display:"grid", placeItems:"center", color:"var(--amber)", border:"0.5px solid var(--amber)"}}>
              <Icon name="package" size={16}/>
            </div>
            <div className="grow">
              <div style={{fontWeight: 500}}>
                Tienes {pending.length} entregable{pending.length === 1 ? "" : "s"} pendiente{pending.length === 1 ? "" : "s"} de aprobar
              </div>
              <div className="small muted" style={{marginTop: 2}}>{pending.map(d => d.title).slice(0,3).join(" · ")}</div>
            </div>
            <button className="btn primary" onClick={() => navigate("client-project", { projectId: pending[0].projectId })}>Revisar ahora</button>
          </div>
        </div>
      )}

      <div style={{marginBottom: 12, fontSize: 13, color:"var(--text-muted)", fontWeight: 500}}>
        {projects.length === 1 ? "Tu proyecto" : "Tus proyectos"}
      </div>
      <div style={{display:"flex", flexDirection:"column", gap: 14}}>
        {projects.map(p => {
          const plan = _planOf(p);
          const ph = D.PHASES[p.phase] || D.PHASES[0] || { label: "" };
          const sub = plan.active ? plan.active.name : ph.label;
          return (
            <div key={p.id} className="card" style={{cursor:"pointer"}} onClick={() => navigate("client-project", { projectId: p.id })}>
              <div className="card-body" style={{padding: 22}}>
                <div className="row between" style={{alignItems:"flex-start"}}>
                  <div>
                    <div style={{fontWeight: 500, fontSize: 18, fontFamily:"var(--font-display)"}}>{p.name}</div>
                    <div className="muted small" style={{marginTop: 4}}>{sub ? "Fase actual: " + sub : "Proyecto en marcha"}</div>
                  </div>
                  <StatusChip status={p.light} label={ph.label}/>
                </div>
                <div style={{marginTop: 16, display:"flex", alignItems:"center", gap: 10}}>
                  <div className="progress grow"><i style={{width: plan.pct + "%"}}/></div>
                  <span className="muted small" style={{minWidth: 34, textAlign:"right"}}>{plan.pct}%</span>
                </div>
                <div className="row between" style={{marginTop: 14}}>
                  <div className="muted xsmall">
                    {plan.total ? `${plan.done}/${plan.total} tareas` : "Plan en preparación"}
                    {p.deadline ? <> · <Icon name="calendar" size={11}/> Entrega {p.deadline}</> : null}
                  </div>
                  <span className="small" style={{color:"var(--text)"}}>Ver proyecto <Icon name="arrow" size={11}/></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <WhatsAppFloat/>
    </div>
  );
};

const ClientProject = ({ navigate, openModal, projectId, initialTab }) => {
  const D = window.Data;
  D.useStore && D.useStore();
  const p = (projectId && D.PROJECTS.find(x => x.id === projectId)) || D.PROJECTS[0];
  const [tab, setTab] = useState(initialTab || "plan");
  if (!p) return (
    <div className="page" style={{display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh"}}>
      <Empty icon="folder" title="Sin proyecto" sub="Cuando tu agencia cree un proyecto podrás verlo aquí."/>
    </div>
  );
  const phase = D.PHASES[p.phase] || D.PHASES[0] || { label: "", weeks: "" };
  const plan = _planOf(p);
  const deliverables = (D.DELIVERABLES || []).filter(d => d.projectId === p.id);
  const invoices = (D.INVOICES || []).filter(i => !i.project || i.project === p.name || i.clientId === p.clientId);

  const secLabel = { fontSize:11, textTransform:"uppercase", letterSpacing:"0.07em", color:"var(--text-subtle)", marginBottom:10 };

  return (
    <div className="page">
      <div style={{marginBottom: 16}}>
        <button className="btn ghost sm" onClick={() => navigate("client-dashboard")}>
          <Icon name="chevron" size={12} style={{transform:"rotate(180deg)"}}/> Inicio
        </button>
      </div>

      <div className="page-head">
        <div>
          <h1>{p.name}</h1>
          <div className="row tight" style={{marginTop: 8, color:"var(--text-muted)", fontSize: 13, flexWrap:"wrap"}}>
            <StatusChip status={p.light} label={phase.label + (phase.weeks ? " · " + phase.weeks : "")}/>
            {p.deadline && <><span className="vdiv hide-mobile"/><span className="hide-mobile"><Icon name="calendar" size={12}/> Entrega estimada {p.deadline}</span></>}
            <span className="vdiv hide-mobile"/>
            <span style={{display:"inline-flex", alignItems:"center", gap: 6}}>
              <span style={{width: 100}}><div className="progress"><i style={{width: plan.pct + "%"}}/></div></span>
              {plan.pct}%
            </span>
          </div>
        </div>
      </div>

      <div className="tabs">
        {[
          {id:"plan", label:"Plan", count: plan.names.length || null},
          {id:"deliverables", label:"Entregables", count: deliverables.length || null},
          {id:"invoices", label:"Facturas", count: invoices.length || null},
        ].map(t => (
          <div key={t.id} className={"tab" + (tab === t.id ? " active" : "")} onClick={() => setTab(t.id)}>
            {t.label}{t.count != null ? <span className="count">{t.count}</span> : null}
          </div>
        ))}
      </div>

      {tab === "plan" && (
        <div style={{display:"flex", flexDirection:"column", gap: 24}}>
          {/* Resumen de avance */}
          <div className="card"><div className="card-body" style={{padding: 22}}>
            <div className="row between" style={{alignItems:"flex-end", marginBottom: 12}}>
              <div>
                <div style={secLabel}>Avance del proyecto</div>
                <div style={{fontSize: 30, fontFamily:"var(--font-display)", fontWeight: 500, lineHeight: 1}}>{plan.pct}%</div>
              </div>
              <div className="muted small" style={{textAlign:"right"}}>
                {plan.total ? `${plan.done} de ${plan.total} tareas completadas` : "Aún sin tareas"}
                {plan.active && <div style={{marginTop: 4}}>Fase actual: <b style={{color:"var(--text)"}}>{plan.active.name}</b></div>}
              </div>
            </div>
            <div style={{height:6, borderRadius:99, background:"var(--border)", overflow:"hidden"}}>
              <div style={{width: plan.pct + "%", height:"100%", background:"var(--accent)", borderRadius:99, transition:"width .4s"}}/>
            </div>
          </div></div>

          {/* Fases */}
          <div>
            <div style={secLabel}>Fases del proyecto</div>
            {plan.groups.length === 0 ? (
              <Empty icon="list-todo" title="Plan en preparación" sub="Tu agencia está organizando el proyecto en fases. Vuelve pronto."/>
            ) : (
              <div style={{display:"flex", flexDirection:"column", gap: 12}}>
                {plan.groups.map((g, i) => {
                  const st = _phaseStatus(g.done, g.total);
                  const isActive = plan.active && g.name === plan.active.name && st.cls !== "green";
                  const isDone = g.total > 0 && g.done === g.total;
                  return (
                    <div key={i} style={{
                      border: isActive ? "0.5px solid var(--accent)" : "0.5px solid var(--border)",
                      borderRadius:12, overflow:"hidden",
                      background: isActive ? "var(--accent-soft)" : "var(--bg-elev-2)",
                      opacity: isDone ? 0.7 : 1,
                    }}>
                      <div style={{padding:"14px 18px"}}>
                        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: g.total ? 10 : 0}}>
                          <div style={{fontWeight:600, fontSize:14, display:"flex", alignItems:"center", gap:8}}>
                            {isDone && <Icon name="check" size={13} style={{color:"var(--green)"}}/>}
                            {g.name}
                            {st.label && <span className={"chip " + st.cls} style={{fontSize:10, padding:"1px 7px"}}>{st.label}</span>}
                          </div>
                          {g.total > 0 && <span style={{fontSize:13, fontWeight:600, color: isDone ? "var(--green)" : "var(--text-subtle)"}}>{g.pct}%</span>}
                        </div>
                        {g.total > 0 && (
                          <>
                            <div style={{height:4, borderRadius:99, background:"var(--border)", overflow:"hidden", marginBottom:12}}>
                              <div style={{width:g.pct+"%", height:"100%", background: isDone?"var(--green)":"var(--accent)", borderRadius:99, transition:"width .4s"}}/>
                            </div>
                            <div style={{display:"flex", flexDirection:"column", gap:6}}>
                              {g.tasks.map((t, ti) => {
                                const taskDone = t.column === "done";
                                return (
                                  <div key={ti} style={{display:"flex", alignItems:"center", gap:9, fontSize:12.5}}>
                                    <div style={{width:15, height:15, borderRadius:5, flexShrink:0, display:"grid", placeItems:"center",
                                      background: taskDone?"var(--green)":"transparent",
                                      border: taskDone?"none":"1px solid var(--border-strong)"}}>
                                      {taskDone && <Icon name="check" size={10} style={{color:"#000"}}/>}
                                    </div>
                                    <span style={{color: taskDone?"var(--text-subtle)":"var(--text)", textDecoration: taskDone?"line-through":"none"}}>{t.title}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "deliverables" && (
        deliverables.length === 0 ? (
          <Empty icon="package" title="Sin entregables todavía" sub="Aquí verás los entregables cuando tu agencia los suba para tu revisión."/>
        ) : (
          <div>
            <div className="card" style={{marginBottom: 14, padding: 12, display:"flex", alignItems:"center", gap: 12}}>
              <Icon name="info" size={14} style={{color:"var(--text-muted)"}}/>
              <div className="small grow">Revisa cada entregable y apruébalo cuando estés conforme. Tu aprobación queda registrada.</div>
            </div>
            <div className="rg-deliverables">
              {deliverables.map(d => (
                <div key={d.id} className="card">
                  <div style={{aspectRatio:"16/10", background: d.thumb || "linear-gradient(135deg,#1e3a8a,#0f172a)", borderTopLeftRadius: 10, borderTopRightRadius: 10}}/>
                  <div className="card-body">
                    <div className="row between">
                      <div style={{fontWeight: 500, fontSize: 13.5}}>{d.title}</div>
                      {d.version && <span className="chip">{d.version}</span>}
                    </div>
                    <div className="subtle xsmall" style={{marginTop: 6}}>{d.type}{d.date ? " · subido " + d.date : ""}</div>
                    <div style={{marginTop: 14}}>
                      {d.status === "approved" ? (
                        <div className="row tight" style={{color:"var(--green)", fontSize: 12.5}}>
                          <Icon name="check" size={13}/> Aprobado
                        </div>
                      ) : (
                        <div className="row tight">
                          <button className="btn primary sm grow" onClick={() => openModal("approve", { deliverable: d })}>
                            <Icon name="thumbs-up" size={12}/> Revisar
                          </button>
                          <button className="btn ghost icon-only sm"><Icon name="download" size={12}/></button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {tab === "invoices" && (
        invoices.length === 0 ? (
          <Empty icon="file-text" title="Sin facturas" sub="Aquí aparecerán tus facturas cuando tu agencia las emita."/>
        ) : (
          <div className="card"><div className="card-body flush">
            <table className="table">
              <thead><tr><th>Nº</th><th>Tipo</th><th>Emitida</th><th>Vencimiento</th><th style={{textAlign:"right"}}>Importe</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                {invoices.map(i => (
                  <tr key={i.id}>
                    <td style={{fontFamily:"var(--font-mono)", fontSize: 12}}>{i.id}</td>
                    <td>{i.type ? <span className="chip">{i.type}</span> : "—"}</td>
                    <td className="muted">{i.issued || "—"}</td>
                    <td className="muted">{i.due || "—"}</td>
                    <td style={{textAlign:"right", fontWeight: 500}}>€{Number(i.amount || 0).toLocaleString("es-ES")}</td>
                    <td><StatusChip status={i.status}/></td>
                    <td>
                      {i.status === "pending" || i.status === "overdue" ? (
                        <button className="btn primary sm" style={{background:"#635bff", borderColor:"#635bff", color:"#fff"}}>Pagar con Stripe</button>
                      ) : (
                        <button className="btn ghost sm"><Icon name="download" size={12}/> PDF</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div></div>
        )
      )}

      <WhatsAppFloat/>
    </div>
  );
};

Object.assign(window, { ClientLogin, ClientDashboard, ClientProject });

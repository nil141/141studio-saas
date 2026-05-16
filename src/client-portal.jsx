// Client portal: login, dashboard, project view (MVP — Plan · Intake · Entregables · Archivos · Facturas)
const ClientLogin = ({ onLogin }) => {
  const [email, setEmail] = useState("ana@acme.co");
  const [sent, setSent] = useState(false);
  return (
    <div style={{minHeight:"100vh", display:"grid", gridTemplateColumns:"1fr 1fr", background:"var(--bg)"}}>
      <div style={{padding: 60, display:"flex", flexDirection:"column"}}>
        <div className="row tight" style={{marginBottom: "auto"}}>
          <div className="brand-mark">141</div>
          <div className="brand-name">141<span className="tick">'</span>STUDIO</div>
        </div>
        <div style={{maxWidth: 360}}>
          <h1 style={{fontSize: 32, fontWeight: 500, lineHeight: 1.15, marginBottom: 8}}>Bienvenida al portal de tu proyecto.</h1>
          <div className="muted" style={{fontSize: 14, marginBottom: 32}}>Aquí puedes ver el plan, completar el intake, aprobar entregables y descargar tus facturas.</div>
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
      <div style={{background:"linear-gradient(160deg,#0f172a 0%,#020617 60%,#312e81 100%)", position:"relative", overflow:"hidden"}}>
        <div style={{position:"absolute", inset: 40, border:"0.5px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: 28, color:"#e5e7eb"}}>
          <div className="xsmall" style={{color:"#94a3b8", marginBottom: 12}}>Tu próximo hito</div>
          <div style={{fontSize: 24, fontFamily:"var(--font-display)", fontWeight: 500, lineHeight: 1.15, marginBottom: 14}}>Mockups landing v3 · listos para revisar</div>
          <div style={{height: 4, borderRadius: 99, background:"rgba(255,255,255,0.08)"}}><div style={{width: "65%", height: "100%", background:"#e5e7eb", borderRadius: 99}}/></div>
          <div className="row between" style={{marginTop: 12, fontSize: 12, color:"#94a3b8"}}>
            <span>Rediseño web · Acme Co.</span><span>65%</span>
          </div>
        </div>
      </div>
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

const ClientDashboard = ({ navigate, openModal, session }) => {
  const D = window.Data;
  D.useStore && D.useStore();
  const p = D.PROJECTS[0];
  const pTasks = p ? (D.TASKS[p.id] || []) : [];
  const liveProgress = pTasks.length ? Math.round(pTasks.filter(t=>t.column==="done").length/pTasks.length*100) : 0;

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

  if (!p) return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>{greeting}{firstName ? ", " + firstName : ""}.</h1>
          <div className="sub">{dateStr} · esto tienes encima de la mesa.</div>
        </div>
      </div>
      <div style={{display:"flex", alignItems:"center", justifyContent:"center", minHeight:"40vh"}}>
        <Empty icon="folder" title="Sin proyectos activos" sub="Cuando tu agencia cree un proyecto podrás verlo aquí."/>
      </div>
    </div>
  );
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>{greeting}{firstName ? ", " + firstName : ""}.</h1>
          <div className="sub">{dateStr} · esto tienes encima de la mesa.</div>
        </div>
      </div>

      <div className="card" style={{marginBottom: 18, borderColor:"var(--amber)", background:"var(--amber-soft)"}}>
        <div className="card-body" style={{padding: 16, display:"flex", alignItems:"center", gap: 14, flexWrap:"wrap"}}>
          <div style={{width: 36, height: 36, borderRadius: 10, background:"var(--amber-soft)", display:"grid", placeItems:"center", color:"var(--amber)", border:"0.5px solid var(--amber)"}}>
            <Icon name="package" size={16}/>
          </div>
          <div className="grow">
            <div style={{fontWeight: 500}}>Tienes 2 entregables pendientes de aprobar</div>
            <div className="small muted" style={{marginTop: 2}}>Mockups landing v3 y Animación hero · proyecto Rediseño web</div>
          </div>
          <button className="btn primary" onClick={() => navigate("client-project")}>Revisar ahora</button>
        </div>
      </div>

      <div style={{marginBottom: 12, fontSize: 13, color:"var(--text-muted)", fontWeight: 500}}>Tu proyecto</div>
      <div className="card" style={{cursor:"pointer"}} onClick={() => navigate("client-project")}>
        <div className="client-project-card">
          <div className="client-project-card-thumb" style={{aspectRatio:"1/1", background:"linear-gradient(135deg,#1e3a8a 0%,#0f172a 100%)"}}/>
          <div className="card-body" style={{padding: 24}}>
            <div className="row between">
              <div>
                <div style={{fontWeight: 500, fontSize: 18, fontFamily:"var(--font-display)"}}>{p.name}</div>
                <div className="muted small" style={{marginTop: 4}}>{p.service} · {D.PHASES[p.phase].label} (semana {p.week})</div>
              </div>
              <StatusChip status={p.light} label={D.PHASES[p.phase].label}/>
            </div>
            <div className="muted small" style={{marginTop: 14}}>Próximo: {p.nextMilestone}</div>
            <div style={{marginTop: 16, display:"flex", alignItems:"center", gap: 10}}>
              <div className="progress grow"><i style={{width: liveProgress + "%"}}/></div>
              <span className="muted small">{liveProgress}%</span>
            </div>
            <div className="row between" style={{marginTop: 14}}>
              <div className="muted xsmall"><Icon name="calendar" size={11}/> Entrega {p.deadline}</div>
              <span className="small" style={{color:"var(--text)"}}>Ver proyecto <Icon name="arrow" size={11}/></span>
            </div>
          </div>
        </div>
      </div>

      <WhatsAppFloat/>
    </div>
  );
};

const ClientProject = ({ navigate, openModal }) => {
  const D = window.Data;
  D.useStore && D.useStore();
  const p = D.PROJECTS[0];
  const [tab, setTab] = useState("plan");
  if (!p) return (
    <div className="page" style={{display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh"}}>
      <Empty icon="folder" title="Sin proyecto" sub="Cuando tu agencia cree un proyecto podrás verlo aquí."/>
    </div>
  );
  const phase = D.PHASES[p.phase];
  const cpTasks = D.TASKS[p.id] || [];
  const liveProgress = cpTasks.length ? Math.round(cpTasks.filter(t=>t.column==="done").length/cpTasks.length*100) : 0;
  const [revisionsUsed] = useState(1);

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
            <StatusChip status={p.light} label={phase.label + " · " + phase.weeks}/>
            <span className="vdiv hide-mobile"/>
            <span className="hide-mobile"><Icon name="calendar" size={12}/> Entrega estimada {p.deadline}</span>
            <span className="vdiv hide-mobile"/>
            <span style={{display:"inline-flex", alignItems:"center", gap: 6}}>
              <span style={{width: 100}}><div className="progress"><i style={{width: liveProgress + "%"}}/></div></span>
              {liveProgress}%
            </span>
          </div>
        </div>
      </div>

      <div className="tabs">
        {[
          {id:"plan", label:"Plan"},
          {id:"intake", label:"Intake", count: "12/24"},
          {id:"deliverables", label:"Entregables", count: 3},
          {id:"files", label:"Archivos"},
          {id:"invoices", label:"Facturas"},
        ].map(t => (
          <div key={t.id} className={"tab" + (tab === t.id ? " active" : "")} onClick={() => setTab(t.id)}>
            {t.label}{t.count != null ? <span className="count">{t.count}</span> : null}
          </div>
        ))}
      </div>

      {tab === "plan" && (() => {
        const aiPhases = (() => {
          try { return JSON.parse(localStorage.getItem("141_phases_" + p.id) || "null"); } catch { return null; }
        })();
        const projectTasks = D.TASKS[p.id] || [];
        return (
        <div style={{display:"flex", flexDirection:"column", gap: 16}}>
          <div className="card"><div className="card-body" style={{padding: 24}}>
            <div className="card-title" style={{marginBottom: 14}}>Plan del proyecto</div>
            {aiPhases ? (
              <div style={{display:"flex", flexDirection:"column", gap:12}}>
                {aiPhases.map((ph, pi) => {
                  const allTitles = (ph.tasks||[]).map(t => typeof t==="string"?t:t.title);
                  const done = projectTasks.filter(t=>allTitles.includes(t.title)&&t.column==="done").length;
                  const total = allTitles.length;
                  const pct = total ? Math.round(done/total*100) : 0;
                  const top3 = allTitles.slice(0,3);
                  const isActive = done > 0 && done < total;
                  const isDone = total > 0 && done === total;
                  return (
                    <div key={pi} style={{
                      border: isActive ? "0.5px solid var(--accent)" : "0.5px solid var(--border)",
                      borderRadius:12, overflow:"hidden",
                      background: isActive ? "var(--accent-soft)" : "var(--bg-elev-2)",
                      opacity: isDone ? 0.65 : 1,
                    }}>
                      <div style={{padding:"14px 18px"}}>
                        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6}}>
                          <div style={{fontWeight:600, fontSize:14, display:"flex", alignItems:"center", gap:8}}>
                            {isDone && <Icon name="check" size={13} style={{color:"var(--green)"}}/>}
                            {isActive && <span className="chip blue" style={{fontSize:10, padding:"1px 6px"}}>En curso</span>}
                            {ph.name}
                          </div>
                          <span style={{fontSize:13, fontWeight:600, color: isDone ? "var(--green)" : "var(--text-subtle)"}}>{pct}%</span>
                        </div>
                        {ph.description && <div style={{fontSize:12, color:"var(--text-subtle)", marginBottom:10, lineHeight:1.5}}>{ph.description}</div>}
                        <div style={{height:4, borderRadius:99, background:"var(--border)", overflow:"hidden", marginBottom:10}}>
                          <div style={{width:pct+"%", height:"100%", background: isDone?"var(--green)":"var(--accent)", borderRadius:99, transition:"width .4s"}}/>
                        </div>
                        <div style={{display:"flex", flexDirection:"column", gap:5}}>
                          {top3.map((title, ti) => {
                            const matched = projectTasks.find(t=>t.title===title);
                            const taskDone = matched?.column==="done";
                            return (
                              <div key={ti} style={{display:"flex", alignItems:"center", gap:8, fontSize:12}}>
                                <div style={{width:14, height:14, borderRadius:4, flexShrink:0, display:"grid", placeItems:"center",
                                  background: taskDone?"var(--green)":"transparent",
                                  border: taskDone?"none":"1px solid var(--border-strong)"}}>
                                  {taskDone && <Icon name="check" size={9} style={{color:"#000"}}/>}
                                </div>
                                <span style={{color: taskDone?"var(--text-subtle)":"var(--text)", textDecoration: taskDone?"line-through":"none"}}>{title}</span>
                              </div>
                            );
                          })}
                          {allTitles.length > 3 && <div style={{fontSize:11, color:"var(--text-muted)", paddingLeft:22}}>+{allTitles.length-3} tareas más</div>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Empty icon="list-todo" title="Plan en preparación" sub="Tu agencia está trabajando en el plan. Vuelve pronto."/>
            )}
          </div></div>

          <div className="card">
            <div className="card-header"><div className="card-title">Última actualización del equipo</div><span className="subtle xsmall">hace 2 días</span></div>
            <div className="card-body">
              <div className="row tight" style={{marginBottom: 8}}>
                <Avatar size="sm" name="Marta" initials="MR" color="#fb7185"/>
                <span style={{fontWeight: 500, fontSize: 13}}>Marta — 141'STUDIO</span>
              </div>
              <div className="small" style={{lineHeight: 1.6}}>Hola Ana, te dejo los mockups v3 para revisar. Hemos ajustado la jerarquía del hero y la sección de producto como hablamos. Cuando los apruebes pasamos a desarrollo.</div>
            </div>
          </div>
        </div>
        );
      })()}

      {tab === "intake" && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Intake del proyecto</div>
              <div className="card-sub">Última edición hace 2 horas · auto-guardado</div>
            </div>
            <span className="chip amber">Incompleto · 12/24</span>
          </div>
          <div className="card-body flush">
            {D.INTAKE_SECTIONS.map((s, i) => {
              const complete = s.done === s.items;
              return (
                <div key={s.id} className="client-intake-row" style={{padding:"16px 18px", borderBottom: i === D.INTAKE_SECTIONS.length - 1 ? 0 : "0.5px solid var(--border)", cursor:"pointer"}}>
                  <div style={{width: 36, height: 36, borderRadius: 10, background: complete ? "var(--green-soft)" : "var(--bg-elev-2)", color: complete ? "var(--green)" : "var(--text-muted)", display:"grid", placeItems:"center", border:"0.5px solid var(--border)", flexShrink:0}}>
                    <Icon name={complete ? "check" : s.icon} size={15}/>
                  </div>
                  <div className="grow">
                    <div style={{fontWeight: 500, fontSize: 14}}>{s.title}</div>
                    <div className="muted xsmall" style={{marginTop: 2}}>{s.done}/{s.items} respondidas</div>
                  </div>
                  <div className="client-intake-progress">
                    <div className="progress"><i style={{width: (s.done/s.items*100)+"%", background: complete ? "var(--green)" : "var(--text)"}}/></div>
                  </div>
                  <button className="btn sm" style={{flexShrink:0}}>{complete ? "Revisar" : "Continuar"} <Icon name="chevron" size={11}/></button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "deliverables" && (
        <div>
          <div className="card" style={{marginBottom: 14, padding: 12, display:"flex", alignItems:"center", gap: 12}}>
            <Icon name="info" size={14} style={{color:"var(--text-muted)"}}/>
            <div className="small grow">Llevas <b>{revisionsUsed} de 2</b> rondas de revisión incluidas. Tu aprobación escrita activa la factura del 50% final.</div>
          </div>
          <div className="rg-deliverables">
            {D.DELIVERABLES.filter(d => d.projectId === "p1").map(d => (
              <div key={d.id} className="card">
                <div style={{aspectRatio:"16/10", background: d.thumb, borderTopLeftRadius: 10, borderTopRightRadius: 10}}/>
                <div className="card-body">
                  <div className="row between">
                    <div style={{fontWeight: 500, fontSize: 13.5}}>{d.title}</div>
                    <span className="chip">{d.version}</span>
                  </div>
                  <div className="subtle xsmall" style={{marginTop: 6}}>{d.type} · subido {d.date}</div>
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
      )}

      {tab === "files" && (
        <div className="card">
          <div className="card-header">
            <div className="row tight">
              <div style={{width:24, height:24, borderRadius:6, background:"#fff", display:"grid", placeItems:"center"}}>
                <svg width="14" height="14" viewBox="0 0 24 24"><path fill="#1FA463" d="M7.71 3.5L1.15 15l3.27 5.5h13.16L21.85 15 14.29 3.5z"/><path fill="#FFD041" d="M7.71 3.5h6.58L21.85 15l-3.27 5.5z" opacity=".7"/></svg>
              </div>
              <div className="card-title">Carpeta del proyecto en Google Drive</div>
            </div>
            <button className="btn sm"><Icon name="external-link" size={12}/> Abrir en Drive</button>
          </div>
          <div className="card-body flush">
            {D.DRIVE_FOLDERS.map((f, i) => (
              <div key={f.name} style={{padding:"14px 18px", display:"flex", alignItems:"center", gap: 12, borderBottom: i === D.DRIVE_FOLDERS.length - 1 ? "0" : "0.5px solid var(--border)", cursor:"pointer"}}>
                <Icon name="folder" size={16} style={{color:"var(--text-muted)"}}/>
                <div className="grow">
                  <div style={{fontWeight: 500, fontSize: 13}}>/{f.name}</div>
                  <div className="subtle xsmall">{f.count} archivos · {f.size}</div>
                </div>
                <Icon name="chevron" size={13} style={{color:"var(--text-subtle)"}}/>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "invoices" && (
        <div className="card"><div className="card-body flush">
          <table className="table">
            <thead><tr><th>Nº</th><th>Tipo</th><th>Emitida</th><th>Vencimiento</th><th style={{textAlign:"right"}}>Importe</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              {D.INVOICES.filter(i => i.clientId === "c1").map(i => (
                <tr key={i.id}>
                  <td style={{fontFamily:"var(--font-mono)", fontSize: 12}}>{i.id}</td>
                  <td><span className="chip">{i.type}</span></td>
                  <td className="muted">{i.issued}</td>
                  <td className="muted">{i.due}</td>
                  <td style={{textAlign:"right", fontWeight: 500}}>€{i.amount.toLocaleString("es-ES")}</td>
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
      )}

      <WhatsAppFloat/>
    </div>
  );
};

Object.assign(window, { ClientLogin, ClientDashboard, ClientProject });

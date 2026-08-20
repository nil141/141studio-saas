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

// Imagen de fondo del hero del portal (opcional). Deja "" para usar el
// degradado por defecto, o pon la URL de una foto para el look de la referencia.
const HERO_BG = "";

// Anillo de progreso (número dentro, etiqueta a la derecha). Va sobre el hero oscuro.
const RingStat = ({ pct = 0, label }) => {
  const size = 58, sw = 4, r = (size - sw) / 2, c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, Math.round(pct)));
  return (
    <div style={{display:"flex", alignItems:"center", gap: 12}}>
      <div style={{position:"relative", width:size, height:size, flexShrink:0}}>
        <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={sw}/>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#fff" strokeWidth={sw} strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)} style={{transition:"stroke-dashoffset .6s ease"}}/>
        </svg>
        <div style={{position:"absolute", inset:0, display:"grid", placeItems:"center", fontSize:13, fontWeight:600, color:"#fff"}}>{v}%</div>
      </div>
      <div style={{fontSize: 13.5, color:"rgba(255,255,255,0.82)", lineHeight:1.3, maxWidth: 130}}>{label}</div>
    </div>
  );
};

const ClientDashboard = ({ navigate, session }) => {
  const D = window.Data;
  D.useStore && D.useStore();
  const projects = D.PROJECTS || [];
  const [selId, setSelId] = useState(null);
  const primary = projects.find(p => p.id === selId) || projects[0] || null;

  const name = session?.name || "";
  const pending = (D.DELIVERABLES || []).filter(d => d.status && d.status !== "approved");
  const plan = primary ? _planOf(primary) : { groups: [], pct: 0, done: 0, total: 0, active: null };
  const fasesDone = plan.groups.filter(g => g.total > 0 && g.done === g.total).length;
  const fasesPct = plan.groups.length ? Math.round(fasesDone / plan.groups.length * 100) : 0;

  const heroBg = HERO_BG
    ? `linear-gradient(90deg, rgba(8,8,10,0.94) 0%, rgba(8,8,10,0.75) 40%, rgba(8,8,10,0.3) 100%), url(${HERO_BG}) center/cover`
    : `radial-gradient(130% 120% at 82% 0%, rgba(150,105,70,0.38) 0%, rgba(20,16,14,0) 55%), linear-gradient(120deg, #16130f 0%, #0b0b0d 58%, #191410 100%)`;

  const hero = (
    <div style={{position:"relative", borderRadius: 22, overflow:"hidden", background: heroBg,
      minHeight: 380, padding: "clamp(28px, 5vw, 48px)", display:"flex", flexDirection:"column",
      justifyContent:"flex-end", border:"0.5px solid var(--border)"}}>
      <div style={{display:"inline-flex", alignItems:"center", gap: 7, alignSelf:"flex-start",
        padding:"5px 12px", borderRadius: 99, background:"rgba(255,255,255,0.1)",
        border:"0.5px solid rgba(255,255,255,0.18)", color:"rgba(255,255,255,0.9)",
        fontSize: 11, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom: 18}}>
        <span style={{width:6, height:6, borderRadius:99, background:"var(--green)"}}/>
        Portal{primary ? " · " + primary.name : ""}
      </div>
      <h1 style={{fontFamily:"var(--font-display)", fontWeight: 300,
        fontSize:"clamp(38px, 6vw, 58px)", lineHeight:1.02, letterSpacing:"-1.5px", color:"#fff", margin:0}}>
        Hola, {name || "bienvenido"}
      </h1>
      <p style={{color:"rgba(255,255,255,0.72)", fontSize: 14.5, lineHeight:1.6, maxWidth: 560, marginTop: 14}}>
        Esta es tu área de cliente. Desde aquí sigues el estado del proyecto, subes documentación,
        das acceso a tus herramientas y ves todo lo importante en un solo sitio.
      </p>
      <div style={{display:"flex", gap: 40, marginTop: 28, flexWrap:"wrap"}}>
        <RingStat pct={plan.pct} label="Progreso del proyecto"/>
        <RingStat pct={fasesPct} label="Fases completadas"/>
      </div>
    </div>
  );

  if (!projects.length) return (
    <div className="page">
      {hero}
      <div style={{marginTop: 24}}>
        <Empty icon="folder" title="Sin proyecto activo" sub="Cuando tu agencia cree tu proyecto, aquí verás su avance por fases."/>
      </div>
      <WhatsAppFloat/>
    </div>
  );

  return (
    <div className="page">
      {hero}

      {projects.length > 1 && (
        <div style={{display:"flex", gap: 8, marginTop: 18, flexWrap:"wrap"}}>
          {projects.map(pr => (
            <button key={pr.id} className={"btn sm" + (pr.id === primary.id ? " primary" : " ghost")}
              onClick={() => setSelId(pr.id)}>{pr.name}</button>
          ))}
        </div>
      )}

      {pending.length > 0 && (
        <div className="card" style={{marginTop: 22, borderColor:"var(--amber)", background:"var(--amber-soft)"}}>
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
            <button className="btn primary" onClick={() => navigate("client-status", { projectId: pending[0].projectId })}>Revisar ahora</button>
          </div>
        </div>
      )}

      {/* El estado del proyecto — tira de fases */}
      <div style={{marginTop: 30, marginBottom: 14, fontFamily:"var(--font-display)", fontSize: 22, fontWeight: 500, letterSpacing:"-0.5px"}}>
        El estado del proyecto
      </div>
      {plan.groups.length === 0 ? (
        <Empty icon="list-todo" title="Plan en preparación" sub="Tu agencia está organizando el proyecto en fases."/>
      ) : (
        <div style={{display:"flex", gap: 12, overflowX:"auto", paddingBottom: 6}}>
          {plan.groups.map((g, i) => {
            const st = _phaseStatus(g.done, g.total);
            const isActive = plan.active && g.name === plan.active.name && st.cls !== "green";
            const isDone = g.total > 0 && g.done === g.total;
            return (
              <div key={i} onClick={() => navigate("client-status", { projectId: primary.id })}
                style={{cursor:"pointer", flex:"0 0 auto", width: 186, minHeight: 118, borderRadius: 16,
                  padding: "16px 18px", display:"flex", flexDirection:"column",
                  border: isActive ? "0.5px solid var(--accent)" : "0.5px solid var(--border)",
                  background: isActive ? "var(--accent-soft)" : "var(--bg-elev-2)", opacity: isDone ? 0.72 : 1}}>
                <div className="row tight" style={{marginBottom: 8}}>
                  {isDone && <Icon name="check" size={13} style={{color:"var(--green)"}}/>}
                  {st.label && <span className={"chip " + st.cls} style={{fontSize:10, padding:"1px 7px"}}>{st.label}</span>}
                </div>
                <div style={{fontFamily:"var(--font-display)", fontSize: 17, fontWeight: 500, marginBottom: 6}}>{g.name}</div>
                <div className="muted xsmall" style={{marginTop:"auto"}}>
                  {g.total ? `${g.done}/${g.total} tareas` : "Sin tareas aún"}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Accesos rápidos */}
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap: 12, marginTop: 26}}>
        {[
          { id:"client-docs", icon:"file-text", title:"Documentación", sub:"Archivos y facturas" },
          { id:"client-credentials", icon:"lock", title:"Credenciales", sub:"Tus accesos compartidos" },
        ].map(q => (
          <div key={q.id} className="card" style={{cursor:"pointer"}} onClick={() => navigate(q.id)}>
            <div className="card-body" style={{padding: 18, display:"flex", alignItems:"center", gap: 12}}>
              <div style={{width: 38, height: 38, borderRadius: 10, background:"var(--bg-elev-2)", display:"grid", placeItems:"center", color:"var(--text-muted)", border:"0.5px solid var(--border)", flexShrink:0}}>
                <Icon name={q.icon} size={17}/>
              </div>
              <div className="grow">
                <div style={{fontWeight: 500, fontSize: 14}}>{q.title}</div>
                <div className="muted xsmall" style={{marginTop: 2}}>{q.sub}</div>
              </div>
              <Icon name="chevron" size={14} style={{color:"var(--text-subtle)"}}/>
            </div>
          </div>
        ))}
      </div>

      <WhatsAppFloat/>
    </div>
  );
};

const ClientStatus = ({ navigate, openModal, projectId, initialTab }) => {
  const D = window.Data;
  D.useStore && D.useStore();
  const projects = D.PROJECTS || [];
  const p = (projectId && projects.find(x => x.id === projectId)) || projects[0];
  const [tab, setTab] = useState(initialTab || "plan");
  if (!p) return (
    <div className="page">
      <div className="page-head"><div><h1>Estado del proyecto</h1><div className="sub">El avance de tu proyecto aparecerá aquí.</div></div></div>
      <div style={{display:"flex", alignItems:"center", justifyContent:"center", minHeight:"40vh"}}>
        <Empty icon="folder" title="Sin proyecto" sub="Cuando tu agencia cree un proyecto podrás seguir su avance aquí."/>
      </div>
      <WhatsAppFloat/>
    </div>
  );
  const phase = D.PHASES[p.phase] || D.PHASES[0] || { label: "", weeks: "" };
  const plan = _planOf(p);
  const deliverables = (D.DELIVERABLES || []).filter(d => d.projectId === p.id);

  const secLabel = { fontSize:11, textTransform:"uppercase", letterSpacing:"0.07em", color:"var(--text-subtle)", marginBottom:10 };

  return (
    <div className="page">
      {projects.length > 1 && (
        <div style={{display:"flex", gap: 8, marginBottom: 16, flexWrap:"wrap"}}>
          {projects.map(pr => (
            <button key={pr.id} className={"btn sm" + (pr.id === p.id ? " primary" : " ghost")}
              onClick={() => navigate("client-status", { projectId: pr.id })}>{pr.name}</button>
          ))}
        </div>
      )}

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
          {id:"plan", label:"Plan y fases", count: plan.names.length || null},
          {id:"deliverables", label:"Entregables", count: deliverables.length || null},
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

      <WhatsAppFloat/>
    </div>
  );
};

// ── Documentación: archivos + facturas ──────────────────────────────
const ClientDocs = ({ session }) => {
  const D = window.Data;
  D.useStore && D.useStore();
  const invoices = D.INVOICES || [];

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Documentación</h1>
          <div className="sub">Tus facturas y archivos del proyecto.</div>
        </div>
      </div>

      <div style={{marginBottom: 10, fontSize: 11, textTransform:"uppercase", letterSpacing:"0.07em", color:"var(--text-subtle)"}}>Facturas</div>
      {invoices.length === 0 ? (
        <Empty icon="file-text" title="Sin facturas todavía" sub="Aquí aparecerán tus facturas cuando tu agencia las emita."/>
      ) : (
        <div className="card" style={{marginBottom: 24}}><div className="card-body flush">
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
      )}

      <div style={{marginBottom: 10, fontSize: 11, textTransform:"uppercase", letterSpacing:"0.07em", color:"var(--text-subtle)"}}>Archivos</div>
      <Empty icon="folder" title="Sin archivos compartidos" sub="Cuando tu agencia comparta archivos o entregables descargables, los verás aquí."/>

      <WhatsAppFloat/>
    </div>
  );
};

// ── Credenciales: accesos compartidos con la agencia ────────────────
const CredForm = ({ initial, onSave, onCancel }) => {
  const [f, setF] = useState(initial || { label:"", url:"", username:"", password:"", notes:"" });
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const inp = { width:"100%", height:40, borderRadius:10, padding:"8px 12px", background:"var(--bg-elev)",
    border:"0.5px solid var(--border)", color:"var(--text)", fontFamily:"inherit", fontSize:14, marginBottom:10 };
  return (
    <div className="card" style={{marginBottom: 14}}>
      <div className="card-body" style={{padding: 16}}>
        <input style={inp} placeholder="Nombre del acceso (p.ej. Instagram, Hosting…)" value={f.label} onChange={e => set("label", e.target.value)} autoFocus/>
        <input style={inp} placeholder="URL (p.ej. instagram.com)" value={f.url} onChange={e => set("url", e.target.value)}/>
        <input style={inp} placeholder="Usuario / email" value={f.username} onChange={e => set("username", e.target.value)}/>
        <input style={inp} placeholder="Contraseña" value={f.password} onChange={e => set("password", e.target.value)}/>
        <input style={{...inp, marginBottom: 14}} placeholder="Notas (opcional)" value={f.notes} onChange={e => set("notes", e.target.value)}/>
        <div className="row tight">
          <button className="btn primary sm" disabled={!f.label.trim()} onClick={() => onSave(f)}>Guardar</button>
          <button className="btn ghost sm" onClick={onCancel}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

const CredCard = ({ c, onEdit, onDelete }) => {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState("");
  const copy = (val, which) => { try { navigator.clipboard.writeText(val); setCopied(which); setTimeout(() => setCopied(""), 1200); } catch {} };
  const row = (label, val, which, mono) => val ? (
    <div style={{display:"flex", alignItems:"center", gap: 8, marginTop: 8}}>
      <div style={{width: 78, fontSize: 12, color:"var(--text-subtle)", flexShrink:0}}>{label}</div>
      <div style={{flex:1, fontSize: 13.5, fontFamily: mono ? "var(--font-mono)" : "inherit", wordBreak:"break-all"}}>{val}</div>
      <button className="btn ghost icon-only sm" onClick={() => copy(val, which)} title="Copiar">
        <Icon name={copied === which ? "check" : "copy"} size={13}/>
      </button>
    </div>
  ) : null;
  return (
    <div className="card">
      <div className="card-body" style={{padding: 16}}>
        <div className="row between" style={{alignItems:"flex-start"}}>
          <div className="row tight">
            <div style={{width: 34, height: 34, borderRadius: 9, background:"var(--bg-elev-2)", display:"grid", placeItems:"center", color:"var(--text-muted)", border:"0.5px solid var(--border)"}}>
              <Icon name="key" size={15}/>
            </div>
            <div style={{fontWeight: 500, fontSize: 14.5}}>{c.label}</div>
          </div>
          <div className="row tight">
            <button className="btn ghost icon-only sm" onClick={() => onEdit(c)} title="Editar"><Icon name="edit" size={13}/></button>
            <button className="btn ghost icon-only sm" onClick={() => onDelete(c)} title="Eliminar"><Icon name="trash" size={13}/></button>
          </div>
        </div>
        {row("Web", c.url, "url")}
        {row("Usuario", c.username, "user")}
        {c.password ? (
          <div style={{display:"flex", alignItems:"center", gap: 8, marginTop: 8}}>
            <div style={{width: 78, fontSize: 12, color:"var(--text-subtle)", flexShrink:0}}>Contraseña</div>
            <div style={{flex:1, fontSize: 13.5, fontFamily:"var(--font-mono)", wordBreak:"break-all"}}>{show ? c.password : "••••••••"}</div>
            <button className="btn ghost icon-only sm" onClick={() => setShow(s => !s)} title={show ? "Ocultar" : "Mostrar"}>
              <Icon name={show ? "eye-off" : "eye"} size={13}/>
            </button>
            <button className="btn ghost icon-only sm" onClick={() => copy(c.password, "pw")} title="Copiar">
              <Icon name={copied === "pw" ? "check" : "copy"} size={13}/>
            </button>
          </div>
        ) : null}
        {c.notes ? <div className="muted small" style={{marginTop: 10, lineHeight: 1.5}}>{c.notes}</div> : null}
      </div>
    </div>
  );
};

const ClientCredentials = ({ session }) => {
  const D = window.Data;
  D.useStore && D.useStore();
  const clientId = session?.clientId;
  const creds = D.CREDENTIALS || [];
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);

  const save = (f) => {
    if (editing) D.updateCredential(editing.id, f); else D.addCredential(clientId, f);
    setAdding(false); setEditing(null);
  };
  const del = (c) => { if (confirm(`¿Eliminar el acceso "${c.label}"?`)) D.deleteCredential(c.id); };

  return (
    <div className="page">
      <div className="page-head">
        <div className="row between" style={{alignItems:"flex-start", width:"100%"}}>
          <div>
            <h1>Credenciales</h1>
            <div className="sub">Accesos que compartes con tu agencia. Solo tú y el equipo de 141 podéis verlos.</div>
          </div>
          {!adding && !editing && (
            <button className="btn primary" onClick={() => setAdding(true)}><Icon name="plus" size={14}/> Añadir acceso</button>
          )}
        </div>
      </div>

      {(adding || editing) && (
        <CredForm initial={editing} onSave={save} onCancel={() => { setAdding(false); setEditing(null); }}/>
      )}

      {creds.length === 0 && !adding ? (
        <Empty icon="lock" title="Sin accesos guardados" sub="Añade aquí los accesos (web, hosting, redes, dominio…) que tu agencia necesita para trabajar."/>
      ) : (
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap: 14}}>
          {creds.map(c => (
            <CredCard key={c.id} c={c} onEdit={(x) => { setEditing(x); setAdding(false); }} onDelete={del}/>
          ))}
        </div>
      )}

      <WhatsAppFloat/>
    </div>
  );
};

Object.assign(window, { ClientLogin, ClientDashboard, ClientStatus, ClientDocs, ClientCredentials });

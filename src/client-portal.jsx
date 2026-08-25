// Portal de cliente — datos reales: fases del proyecto (project.service) +
// progreso desde las tareas (D.TASKS), entregables y facturas de SUS proyectos.

// Etiqueta del botón según la sección de destino de una tarea/aviso.
const _SECTION_CTA = {
  "client-docs": "Ir a Documentación",
  "client-credentials": "Ir a Credenciales",
  "client-status": "Ver estado del proyecto",
  "client-dashboard": "Ir al inicio",
};
const _sectionCta = (route) => _SECTION_CTA[route] || "Abrir";

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

const WhatsAppFloat = () => null;

// Vista previa de la agencia: si un admin abre el portal de un cliente, se
// guarda su id en sessionStorage y aquí filtramos los datos a ese cliente.
const _previewClientId = (session) => {
  try { return session?.role === "admin" ? (sessionStorage.getItem("141_preview_client") || null) : null; } catch { return null; }
};
const _portalScope = (session) => {
  const D = window.Data;
  const pcid = _previewClientId(session);
  const projects = pcid ? (D.PROJECTS || []).filter(p => p.clientId === pcid) : (D.PROJECTS || []);
  const pids = new Set(projects.map(p => p.id));
  const find = (id) => (D.CLIENTS || []).find(c => c.id === id);
  return {
    pcid, projects,
    invoices:    pcid ? (D.INVOICES || []).filter(i => i.clientId === pcid) : (D.INVOICES || []),
    credentials: pcid ? (D.CREDENTIALS || []).filter(c => c.clientId === pcid) : (D.CREDENTIALS || []),
    clientTasks: pcid ? (D.CLIENT_TASKS || []).filter(t => t.clientId === pcid) : (D.CLIENT_TASKS || []),
    deliverables:pcid ? (D.DELIVERABLES || []).filter(d => pids.has(d.projectId)) : (D.DELIVERABLES || []),
    me:          pcid ? find(pcid) : (D.CLIENTS || [])[0],
    name:        pcid ? (find(pcid)?.name || "") : (session?.name || ""),
    clientId:    pcid || session?.clientId,
    preview:     !!pcid,
  };
};

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
  const doneSet = new Set(p.phasesDone || []);   // fases marcadas a mano
  const descMap = p.phasesDesc || {};
  const mk = (name, gt) => {
    const done = gt.filter(t => t.column === "done").length;
    // Completa si se marcó a mano, o si tiene tareas y todas están hechas.
    const complete = doneSet.has(name) || (gt.length > 0 && done === gt.length);
    return { name, tasks: gt, done, total: gt.length, complete, desc: descMap[name] || "",
      pct: gt.length ? Math.round(done / gt.length * 100) : (complete ? 100 : 0) };
  };
  const groups = names.map(name => mk(name, tasks.filter(t => (t.phase || null) === name)));
  const otras = tasks.filter(t => !names.includes(t.phase || null));
  if (otras.length) groups.push(mk("Otras tareas", otras));
  const totalPhases = groups.length;
  const donePhases = groups.filter(g => g.complete).length;
  const activeIdx = (() => { const i = groups.findIndex(g => !g.complete); return i === -1 ? groups.length - 1 : i; })();
  const active = groups[activeIdx] || null;
  const total = tasks.length;
  const done = tasks.filter(t => t.column === "done").length;
  // Progreso del proyecto = tareas completadas / total (se mueve al hacer cada
  // tarea). Si aún no hay tareas, cae a fases completas o al progreso manual.
  const pct = total ? Math.round(done / total * 100)
            : (totalPhases ? Math.round(donePhases / totalPhases * 100) : (p.progress || 0));
  return { names, groups, total, done, pct, active, activeIdx, donePhases, totalPhases };
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
  const S = _portalScope(session);
  const projects = S.projects;
  const [selId, setSelId] = useState(null);
  const [projOpen, setProjOpen] = useState(false);
  React.useEffect(() => { if (!projOpen) return; const c = () => setProjOpen(false); window.addEventListener("click", c); return () => window.removeEventListener("click", c); }, [projOpen]);
  const primary = projects.find(p => p.id === selId) || projects[0] || null;

  const name = S.name;
  const pending = S.deliverables.filter(d => d.status && d.status !== "approved");
  const plan = primary ? _planOf(primary) : { groups: [], pct: 0, done: 0, total: 0, active: null };
  // "Qué te toca ahora": tareas de onboarding que el cliente debe realizar.
  const clientTasks = S.clientTasks;
  const myDone = clientTasks.filter(t => t.done).length;
  const myPct = clientTasks.length ? Math.round(myDone / clientTasks.length * 100) : 0;

  // Capas de fundido: abajo hacia el fondo (--bg) y a la izquierda hacia --bg,
  // para que el hero no haga corte con la barra lateral ni con la página.
  const heroFade = "linear-gradient(to bottom, rgba(0,0,0,0) 55%, var(--bg) 100%), linear-gradient(to right, var(--bg) 0%, rgba(0,0,0,0) 9%)";
  const heroBg = HERO_BG
    ? `${heroFade}, linear-gradient(90deg, rgba(8,8,10,0.94) 0%, rgba(8,8,10,0.75) 40%, rgba(8,8,10,0.3) 100%), url(${HERO_BG}) center/cover`
    : `${heroFade}, radial-gradient(130% 120% at 82% 0%, rgba(158,154,229,0.34) 0%, rgba(158,154,229,0) 55%), linear-gradient(120deg, #131019 0%, #0b0b0d 58%, #15121c 100%)`;

  const hero = (
    <div className="portal-hero" style={{position:"relative", overflow:"hidden", background: heroBg,
      minHeight: 420, padding: "clamp(32px, 5vw, 56px)", display:"flex", flexDirection:"column",
      justifyContent:"flex-end"}}>
      <div style={{position:"relative", alignSelf:"flex-start", marginBottom: 18}} onClick={e => e.stopPropagation()}>
        <button onClick={() => projects.length > 1 && setProjOpen(o => !o)}
          style={{display:"inline-flex", alignItems:"center", gap: 7,
            padding:"5px 12px", borderRadius: 99, background:"rgba(255,255,255,0.1)",
            border:"0.5px solid rgba(255,255,255,0.18)", color:"rgba(255,255,255,0.9)",
            fontSize: 11, letterSpacing:"0.08em", textTransform:"uppercase", fontFamily:"inherit",
            cursor: projects.length > 1 ? "pointer" : "default"}}>
          <span style={{width:6, height:6, borderRadius:99, background:"var(--green)"}}/>
          Portal{primary ? " · " + primary.name : ""}
          {projects.length > 1 && <Icon name="chevron-down" size={12} style={{opacity:0.85, marginLeft:2}}/>}
        </button>
        {projOpen && projects.length > 1 && (
          <div style={{position:"absolute", top:"calc(100% + 6px)", left:0, zIndex:30, minWidth:240,
            background:"var(--bg-elev)", border:"0.5px solid var(--border-strong)", borderRadius:12, padding:6,
            boxShadow:"0 14px 34px rgba(0,0,0,0.45)"}}>
            <div style={{fontSize:10.5, letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--text-subtle)", padding:"4px 10px 6px"}}>Tus proyectos</div>
            {projects.map(pr => (
              <button key={pr.id} onClick={() => { setSelId(pr.id); setProjOpen(false); }}
                style={{display:"flex", alignItems:"center", gap:8, width:"100%", padding:"9px 10px", border:0, borderRadius:8,
                  cursor:"pointer", fontFamily:"inherit", textAlign:"left", fontSize:13.5,
                  background: pr.id === primary.id ? "var(--bg-hover)" : "transparent", color:"var(--text)"}}>
                <Icon name="check" size={13} style={{opacity: pr.id === primary.id ? 1 : 0}}/>
                <span>{pr.name}</span>
              </button>
            ))}
          </div>
        )}
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
        <RingStat pct={myPct} label="Tus tareas completadas"/>
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
            const isDone = g.complete;
            const isActive = i === plan.activeIdx && !isDone;
            const chip = {fontSize:10, padding:"2px 8px", borderRadius:99, whiteSpace:"nowrap", flexShrink:0,
              background:"var(--bg-hover)", border:"0.5px solid var(--border)", color:"var(--text-muted)",
              display:"inline-flex", alignItems:"center", gap:5, letterSpacing:"0.02em"};
            const desc = g.desc || (g.total ? `${g.done} de ${g.total} tareas` : "");
            return (
              <div key={i} onClick={() => navigate("client-status", { projectId: primary.id })}
                style={{cursor:"pointer", flex:"0 0 auto", width: 214, minHeight: 104, borderRadius: 16,
                  padding: "15px 18px", display:"flex", flexDirection:"column", gap: 7,
                  border:"0.5px solid var(--border)",
                  background: isActive ? "var(--surface)" : "var(--bg-elev-2)", opacity: isDone ? 0.6 : 1}}>
                <div style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap: 8}}>
                  <div style={{fontFamily:"var(--font-display)", fontSize: 20, fontWeight: 400, letterSpacing:"-0.6px", lineHeight:1.1}}>{g.name}</div>
                  {isDone && <span style={chip}><Icon name="check" size={9}/> Completada</span>}
                  {isActive && <span style={chip}><span style={{width:5, height:5, borderRadius:99, background:"var(--text-muted)"}}/> En curso</span>}
                </div>
                {desc && <div style={{fontSize: 12.5, color:"var(--text-muted)", lineHeight:1.45,
                  display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden"}}>{desc}</div>}
              </div>
            );
          })}
        </div>
      )}

      {/* Qué te toca ahora — tareas de onboarding del cliente */}
      {clientTasks.length > 0 && (
        <>
          <div style={{marginTop: 34, marginBottom: 14, fontFamily:"var(--font-display)", fontSize: 22, fontWeight: 500, letterSpacing:"-0.5px"}}>
            Qué te toca ahora
          </div>
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(320px, 1fr))", gap: 14}}>
            {clientTasks.map((t, i) => (
              <div key={t.id} className="card" style={{opacity: t.done ? 0.7 : 1}}>
                <div className="card-body" style={{padding: 20, display:"flex", gap: 18}}>
                  <div style={{fontFamily:"var(--font-display)", fontSize: 30, fontWeight: 300, lineHeight: 1,
                    color:"var(--text-subtle)", flexShrink:0, minWidth: 24}}>{i + 1}</div>
                  <div style={{flex: 1, minWidth: 0}}>
                    <div style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap: 10}}>
                      <div style={{fontWeight: 500, fontSize: 14.5, lineHeight: 1.3}}>{t.title}</div>
                      <button className={t.done ? "btn sm" : "btn ghost sm"} style={{flexShrink:0, whiteSpace:"nowrap"}}
                        onClick={() => D.toggleClientTask(t.id)}>
                        {t.done ? <><Icon name="check" size={12}/> Realizado</> : "Marcar como realizado"}
                      </button>
                    </div>
                    {t.description && <div className="muted small" style={{marginTop: 5, lineHeight: 1.5}}>{t.description}</div>}
                    {t.link && !t.done && (
                      <button className="btn ghost sm" style={{marginTop: 12}} onClick={() => navigate(t.link)}>
                        {_sectionCta(t.link)} <Icon name="arrow" size={12}/>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Módulos de tu portal */}
      <div style={{marginTop: 34, marginBottom: 14, fontFamily:"var(--font-display)", fontSize: 22, fontWeight: 500, letterSpacing:"-0.5px"}}>
        Módulos de tu portal
      </div>
      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", gap: 16}}>
        {[
          { id:"client-status",      badge:"PROYECTO",  title:"Estado del proyecto", desc:"Fases, avance y entregables.",        status: plan.pct > 0 ? "En curso" : "Por empezar", pct: plan.pct, showPct: true },
          { id:"client-docs",        badge:"DOCUMENTOS", title:"Documentación",       desc:"Archivos y facturas del proyecto." },
          { id:"client-credentials", badge:"ACCESOS",    title:"Credenciales",        desc:"Accesos que compartes con el equipo." },
        ].map(m => (
          <div key={m.id} className="card" style={{cursor:"pointer", overflow:"hidden"}} onClick={() => navigate(m.id)}>
            <div style={{height: 118, position:"relative", padding: 16,
              background:"radial-gradient(120% 130% at 85% 0%, rgba(150,105,70,0.22) 0%, rgba(20,16,14,0) 55%), linear-gradient(135deg, #17141140 0%, var(--bg-elev-2) 70%)",
              borderBottom:"0.5px solid var(--border)"}}>
              <span style={{fontSize: 10, letterSpacing:"0.08em", padding:"4px 10px", borderRadius: 99,
                background:"var(--bg-hover)", border:"0.5px solid var(--border)", color:"var(--text-muted)"}}>{m.badge}</span>
            </div>
            <div style={{padding: 18}}>
              <div style={{fontFamily:"var(--font-display)", fontSize: 20, fontWeight: 400, letterSpacing:"-0.5px"}}>{m.title}</div>
              <div className="muted small" style={{marginTop: 4}}>{m.desc}</div>
              {m.showPct && (
                <>
                  <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginTop: 16, marginBottom: 6}}>
                    <span style={{fontSize: 10.5, letterSpacing:"0.06em", textTransform:"uppercase", color:"var(--text-subtle)"}}>{m.status}</span>
                    <span style={{fontSize: 12, color:"var(--text-muted)"}}>{m.pct}%</span>
                  </div>
                  <div style={{height: 3, borderRadius: 99, background:"var(--border)", overflow:"hidden"}}>
                    <div style={{width: m.pct + "%", height:"100%", background:"var(--text-muted)", borderRadius: 99}}/>
                  </div>
                </>
              )}
              <div style={{marginTop: m.showPct ? 14 : 18, fontSize: 13, color:"var(--text)"}}>Entrar en el módulo <Icon name="arrow" size={12}/></div>
            </div>
          </div>
        ))}
      </div>

      <WhatsAppFloat/>
    </div>
  );
};

const ClientStatus = ({ navigate, openModal, projectId, initialTab, session }) => {
  const D = window.Data;
  D.useStore && D.useStore();
  const S = _portalScope(session);
  const projects = S.projects;
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
  const plan = _planOf(p);
  const deliverables = S.deliverables.filter(d => d.projectId === p.id);

  // Historial de eventos derivado de lo conocido (fases y hitos completados).
  const events = [];
  plan.groups.forEach(g => { if (g.complete) events.push({ type:"Fase", title:`Fase completada: ${g.name}` }); });
  plan.groups.forEach(g => g.tasks.forEach(t => { if (t.column === "done") events.push({ type:"Hito", title:`Hito completado: ${t.title}` }); }));
  events.push({ type:"Portal", title:"Portal del cliente activado" });

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

      {/* Cabecera */}
      <div style={{marginBottom: 24}}>
        <div style={{fontSize:11, textTransform:"uppercase", letterSpacing:"0.09em", color:"var(--text-subtle)", marginBottom:8}}>
          Proyecto{p.name ? " · " + p.name : ""}
        </div>
        <h1 style={{fontFamily:"var(--font-display)", fontWeight:400, fontSize:"clamp(26px,3.5vw,34px)", letterSpacing:"-1px"}}>Estado del proyecto</h1>
        <div className="sub" style={{marginTop:8, maxWidth:640, color:"var(--text-muted)"}}>
          Aquí ves las fases del proyecto en detalle: qué ocurre en cada una, en cuál estás ahora y los hitos que ha definido tu equipo.
        </div>
      </div>

      {/* Dos columnas: fases + historial */}
      <div style={{display:"flex", gap:20, alignItems:"flex-start", flexWrap:"wrap"}}>
        <div style={{flex:"1 1 460px", minWidth:0, display:"flex", flexDirection:"column", gap:16}}>
          {plan.groups.length === 0 ? (
            <Empty icon="list-todo" title="Plan en preparación" sub="Tu agencia está organizando el proyecto en fases. Vuelve pronto."/>
          ) : plan.groups.map((g, i) => {
            const isComplete = g.complete;
            const isActive = i === plan.activeIdx && !isComplete;
            const nChip = {padding:"3px 9px", borderRadius:99, fontSize:10, letterSpacing:"0.05em", textTransform:"uppercase",
              whiteSpace:"nowrap", flexShrink:0, display:"inline-flex", alignItems:"center", gap:5,
              border:"0.5px solid var(--border)", background:"var(--bg-hover)", color:"var(--text-muted)"};
            const aChip = {...nChip, border:"0.5px solid var(--amber)", background:"var(--amber-soft)", color:"var(--amber)"};
            return (
              <div key={i} style={{
                borderRadius:16, padding:"20px 22px",
                border: isActive ? "1px solid var(--amber)" : "0.5px solid var(--border)",
                background: isActive ? "var(--amber-soft)" : "var(--bg-elev-2)",
                opacity: isComplete ? 0.85 : 1}}>
                <div style={{display:"flex", justifyContent:"space-between", gap:12, alignItems:"flex-start"}}>
                  <div style={{display:"flex", gap:14, minWidth:0}}>
                    <div style={{width:30, height:30, borderRadius:99, flexShrink:0, display:"grid", placeItems:"center", fontSize:13, fontWeight:600,
                      border:"1.5px solid " + (isComplete?"var(--green)":isActive?"var(--amber)":"var(--border-strong)"),
                      color: isComplete?"var(--green)":isActive?"var(--amber)":"var(--text-muted)",
                      background: isActive?"var(--amber-soft)":"transparent"}}>
                      {isComplete ? <Icon name="check" size={14}/> : i+1}
                    </div>
                    <div style={{minWidth:0}}>
                      <div style={{fontFamily:"var(--font-display)", fontSize:20, fontWeight:500, letterSpacing:"-0.4px"}}>{g.name}</div>
                      {g.desc && <div className="muted small" style={{marginTop:5, lineHeight:1.5, maxWidth:560}}>{g.desc}</div>}
                    </div>
                  </div>
                  <span style={isActive ? aChip : nChip}>
                    {isActive && <span style={{width:5, height:5, borderRadius:99, background:"var(--amber)"}}/>}
                    {isComplete ? "Completada" : isActive ? "En curso" : "Pendiente"}
                  </span>
                </div>

                {g.tasks.length > 0 && (
                  <div style={{marginTop:18}}>
                    <div style={{fontSize:10.5, textTransform:"uppercase", letterSpacing:"0.08em", color:"var(--text-subtle)", marginBottom:4}}>Hitos de esta fase</div>
                    {g.tasks.map((t, ti) => {
                      const done = t.column === "done";
                      return (
                        <div key={ti} style={{display:"flex", gap:12, alignItems:"flex-start", padding:"12px 0", borderTop:"0.5px solid var(--border)"}}>
                          <div style={{width:16, height:16, borderRadius:99, marginTop:1, flexShrink:0, display:"grid", placeItems:"center",
                            background: done?"var(--green)":"transparent", border: done?"none":"1.5px solid var(--border-strong)"}}>
                            {done && <Icon name="check" size={10} style={{color:"#000"}}/>}
                          </div>
                          <div style={{flex:1, minWidth:0}}>
                            <div style={{fontSize:13.5, color: done?"var(--text-muted)":"var(--text)"}}>{t.title}</div>
                            {t.notes && <div className="muted xsmall" style={{marginTop:2, lineHeight:1.45}}>{t.notes}</div>}
                          </div>
                          <span style={{...nChip, alignSelf:"center"}}>{done ? "Hecho" : "Pendiente"}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Entregables */}
          {deliverables.length > 0 && (
            <div style={{marginTop:10}}>
              <div style={secLabel}>Entregables</div>
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
          )}
        </div>

        {/* Historial de eventos */}
        <div style={{flex:"1 1 240px", minWidth:0, maxWidth:340}}>
          <div className="card"><div className="card-body" style={{padding:18}}>
            <div className="row between" style={{alignItems:"flex-start"}}>
              <div style={{fontFamily:"var(--font-display)", fontSize:16, fontWeight:500}}>Historial de eventos</div>
              <span className="muted xsmall">{events.length}</span>
            </div>
            <div className="muted xsmall" style={{marginTop:4, marginBottom:16, lineHeight:1.5}}>Lo que ha pasado en el proyecto, en orden cronológico inverso.</div>
            {events.length === 0 ? (
              <div className="muted small">Aún no hay eventos registrados.</div>
            ) : (
              <div style={{display:"flex", flexDirection:"column", gap:14}}>
                {events.map((e, i) => (
                  <div key={i} style={{display:"flex", gap:10}}>
                    <div style={{width:7, height:7, borderRadius:99, background:"var(--text-subtle)", marginTop:5, flexShrink:0}}/>
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:10, letterSpacing:"0.07em", textTransform:"uppercase", color:"var(--text-subtle)"}}>{e.type}</div>
                      <div style={{fontSize:13, marginTop:2, lineHeight:1.4}}>{e.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div></div>
        </div>
      </div>

      <WhatsAppFloat/>
    </div>
  );
};

// Logo de Google Drive
const DriveLogo = ({ size = 24 }) => (
  <svg viewBox="0 0 87.3 78" width={size} height={size}>
    <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
    <path d="M43.65 25L29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3L1.2 48.5c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47"/>
    <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.85 11.5z" fill="#ea4335"/>
    <path d="M43.65 25L57.4 1.2C56.05.4 54.5 0 52.95 0H34.35c-1.55 0-3.1.45-4.45 1.2z" fill="#00832d"/>
    <path d="M59.8 52.9H27.5L13.75 76.7c1.35.8 2.9 1.2 4.45 1.2h50.9c1.55 0 3.1-.45 4.45-1.2z" fill="#2684fc"/>
    <path d="M73.4 26.5L60.75 4.5c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25l16.15 27.9h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
  </svg>
);

// ── Documentación operativa ─────────────────────────────────────────
const ClientDocs = ({ session }) => {
  const D = window.Data;
  D.useStore && D.useStore();
  const S = _portalScope(session);
  const invoices = S.invoices;
  const me = S.me || null;
  const driveUrl = me?.driveUrl || "";
  const p0 = S.projects[0];
  const plan0 = p0 ? _planOf(p0) : null;
  const eyebrow = (plan0?.active ? plan0.active.name : "Documentación");
  const needs = [
    { t:"Activos de marca", d:"Logos, tipografías, colores, manual de marca y cualquier recurso gráfico que tengas." },
    { t:"Contenido y materiales", d:"Fotos, vídeos, textos, catálogos, presentaciones… lo que uses en tu negocio." },
    { t:"Documentación y procesos", d:"Cómo trabajáis por dentro: procedimientos, plantillas, mensajes tipo, exports de Notion, etc." },
  ];
  const numCircle = {width:26, height:26, borderRadius:99, flexShrink:0, display:"grid", placeItems:"center",
    fontSize:12, fontWeight:600, color:"var(--text-muted)", border:"1.5px solid var(--border-strong)"};

  return (
    <div className="page">
      {/* Cabecera */}
      <div style={{marginBottom: 24}}>
        <div style={{fontSize:11, textTransform:"uppercase", letterSpacing:"0.09em", color:"var(--text-subtle)", marginBottom:8}}>{eyebrow}</div>
        <h1 style={{fontFamily:"var(--font-display)", fontWeight:400, fontSize:"clamp(26px,3.5vw,34px)", letterSpacing:"-1px"}}>Documentación y materiales</h1>
        <div className="sub" style={{marginTop:8, maxWidth:620, color:"var(--text-muted)"}}>
          Esta es tu carpeta compartida. Sube aquí todo lo que creas que puede servir para tu proyecto: activos de marca, contenido, materiales y documentación de tu negocio.
        </div>
      </div>

      {/* Tarjeta Google Drive */}
      <div className="card" style={{marginBottom: 18}}>
        <div className="card-body" style={{padding: 24, display:"flex", gap:18, alignItems:"flex-start", flexWrap:"wrap"}}>
          <div style={{width:46, height:46, borderRadius:12, background:"var(--bg-elev-2)", border:"0.5px solid var(--border)", display:"grid", placeItems:"center", flexShrink:0}}>
            <DriveLogo size={24}/>
          </div>
          <div style={{flex:1, minWidth:240}}>
            <div style={{fontFamily:"var(--font-display)", fontSize:18, fontWeight:500, letterSpacing:"-0.4px", lineHeight:1.25}}>
              Adjunta toda la documentación en tu carpeta de Google Drive
            </div>
            <div className="muted small" style={{marginTop:8, lineHeight:1.6, maxWidth:560}}>
              {driveUrl
                ? "Sube aquí todo tu material operativo. Puedes abrir la carpeta cuando quieras desde el botón."
                : "Estamos preparando la carpeta compartida. En cuanto esté lista, el botón se activará y podrás abrirla desde aquí. Te avisamos también por WhatsApp."}
            </div>
            <div style={{marginTop:16}}>
              {driveUrl ? (
                <a className="btn primary" href={driveUrl} target="_blank" rel="noreferrer" style={{textDecoration:"none"}}>
                  Abrir carpeta en Google Drive <Icon name="external-link" size={13}/>
                </a>
              ) : (
                <button className="btn" disabled style={{opacity:0.45, cursor:"not-allowed"}}>
                  Abrir carpeta en Google Drive <Icon name="external-link" size={13}/>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Qué necesitamos que subas */}
      <div className="card" style={{marginBottom: 24}}>
        <div className="card-body" style={{padding: 24}}>
          <div style={{fontFamily:"var(--font-display)", fontSize:18, fontWeight:500, letterSpacing:"-0.4px"}}>Qué necesitamos que subas</div>
          <div className="muted small" style={{marginTop:6}}>Estos son los tipos de material que nos interesan.</div>
          <div style={{marginTop:14}}>
            {needs.map((n, i) => (
              <div key={i} style={{display:"flex", gap:16, alignItems:"flex-start", padding:"14px 0", borderTop: i ? "0.5px solid var(--border)" : "none"}}>
                <div style={numCircle}>{i+1}</div>
                <div>
                  <div style={{fontWeight:500, fontSize:14}}>{n.t}</div>
                  <div className="muted small" style={{marginTop:3, lineHeight:1.5}}>{n.d}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="muted small" style={{marginTop:16, lineHeight:1.6, paddingTop:16, borderTop:"0.5px solid var(--border)"}}>
            Sube todo lo que creas que puede servir, aunque no estés seguro. Cuanto más completo, mejor — no hace falta que esté perfecto ni ordenado.
          </div>
        </div>
      </div>

      {/* Facturas */}
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

      <WhatsAppFloat/>
    </div>
  );
};

// ── Credenciales: catálogo de accesos ───────────────────────────────
const _brandBox = (size = 40) => ({ width:size, height:size, borderRadius:11, background:"var(--bg-elev-2)", display:"grid", placeItems:"center", color:"var(--text)", border:"0.5px solid var(--border)", flexShrink:0 });
const _credComplete = (c, mode) => mode === "access" ? !!c.granted : !!(c.username && c.password);
const CredStatus = ({ ok, label }) => (
  <span style={{fontSize:10.5, letterSpacing:"0.03em", padding:"3px 9px", borderRadius:99, whiteSpace:"nowrap", flexShrink:0,
    display:"inline-flex", alignItems:"center", gap:5,
    background: ok ? "var(--green-soft)" : "var(--amber-soft)", color: ok ? "var(--green)" : "var(--amber)",
    border: "0.5px solid " + (ok ? "var(--green)" : "var(--amber)")}}>
    {ok && <Icon name="check" size={9}/>}{label}
  </span>
);

const CredCatalog = ({ onPick, onCancel, used }) => {
  const D = window.Data;
  const u = used || new Set();
  const cat = (D.CRED_CATALOG || []).filter(p => p.key === "otro" || !u.has(p.key));
  const groups = [
    { mode:"login",  title:"Con usuario y contraseña", sub:"Nos das tus datos de acceso." },
    { mode:"access", title:"Dando acceso a nuestro correo", sub:"Nos añades como colaborador; no compartes contraseñas." },
  ];
  return (
    <div className="card" style={{marginBottom:18}}><div className="card-body" style={{padding:22}}>
      <div className="row between" style={{alignItems:"flex-start", marginBottom:4}}>
        <div style={{fontFamily:"var(--font-display)", fontSize:18, fontWeight:500, letterSpacing:"-0.4px"}}>Añadir un acceso</div>
        <button className="btn ghost sm" onClick={onCancel}>Cancelar</button>
      </div>
      <div className="muted small" style={{marginBottom:4}}>Elige la plataforma.</div>
      {groups.map(g => (
        <div key={g.mode} style={{marginTop:18}}>
          <div style={{fontSize:11, textTransform:"uppercase", letterSpacing:"0.07em", color:"var(--text-subtle)"}}>{g.title}</div>
          <div className="muted xsmall" style={{marginTop:2, marginBottom:10}}>{g.sub}</div>
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(156px,1fr))", gap:10}}>
            {cat.filter(p => p.mode === g.mode).map(p => (
              <button key={p.key} className="cred-tile" onClick={() => onPick(p)}
                style={{display:"flex", alignItems:"center", gap:11, padding:"11px 13px", cursor:"pointer", background:"var(--bg-elev-2)", border:"0.5px solid var(--border)", borderRadius:12, textAlign:"left", fontFamily:"inherit"}}>
                <span style={_brandBox(34)}><CredGlyph meta={p} size={17}/></span>
                <span style={{minWidth:0, fontWeight:500, fontSize:13.5, color:"var(--text)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div></div>
  );
};

const CredItem = ({ c, agencyEmail, editable, onDelete }) => {
  const D = window.Data;
  const meta = D.credMeta(c.platform);
  const mode = meta.mode;
  const complete = _credComplete(c, mode);
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState("");
  const [editing, setEditing] = useState(editable && mode === "login" && !c.username && !c.password);
  const [f, setF] = useState({ username: c.username, password: c.password, notes: c.notes });
  const copy = (val, which) => { try { navigator.clipboard.writeText(val); setCopied(which); setTimeout(() => setCopied(""), 1200); } catch {} };
  const inp = { width:"100%", height:38, borderRadius:9, padding:"8px 12px", background:"var(--bg-elev)", border:"0.5px solid var(--border)", color:"var(--text)", fontFamily:"inherit", fontSize:13.5, marginBottom:9 };
  const saveEdit = () => { D.updateCredential(c.id, f); setEditing(false); };
  const field = (label, val, mono, which, extra) => (
    <div style={{display:"flex", alignItems:"center", gap:8, marginTop:9}}>
      <div style={{width:66, fontSize:11.5, color:"var(--text-subtle)", flexShrink:0}}>{label}</div>
      <div style={{flex:1, fontSize:13.5, fontFamily: mono ? "var(--font-mono)" : "inherit", wordBreak:"break-all"}}>{val}</div>
      {extra}
      <button className="btn ghost icon-only sm" onClick={() => copy(typeof val === "string" ? val : "", which)}><Icon name={copied === which ? "check" : "copy"} size={12}/></button>
    </div>
  );

  return (
    <div className="card"><div className="card-body" style={{padding:18}}>
      <div className="row between" style={{alignItems:"flex-start", gap:10}}>
        <div style={{display:"flex", gap:12, minWidth:0}}>
          <span style={_brandBox(40)}><CredGlyph meta={meta} size={19}/></span>
          <div style={{minWidth:0}}>
            <div style={{fontWeight:500, fontSize:15}}>{c.label || meta.name}</div>
            <div className="muted xsmall" style={{marginTop:2}}>{mode === "access" ? "Dar acceso" : "Usuario y contraseña"}</div>
          </div>
        </div>
        <div className="row tight" style={{flexShrink:0}}>
          <CredStatus ok={complete} label={mode === "access" ? (complete ? "Concedido" : "Pendiente") : (complete ? "Guardado" : "Pendiente")}/>
          {mode === "login" && editable && !editing && <button className="btn ghost icon-only sm" onClick={() => setEditing(true)}><Icon name="edit" size={13}/></button>}
          {editable && <button className="btn ghost icon-only sm" onClick={() => onDelete(c)}><Icon name="trash" size={13}/></button>}
        </div>
      </div>

      {mode === "access" ? (
        <div style={{marginTop:14, paddingTop:14, borderTop:"0.5px solid var(--border)"}}>
          <div className="muted small" style={{lineHeight:1.5, marginBottom:8}}>Añade este correo como acceso en tu cuenta de <b style={{color:"var(--text)"}}>{meta.name}</b>:</div>
          <div style={{display:"flex", alignItems:"center", gap:8}}>
            <div style={{flex:1, fontSize:13.5, fontFamily:"var(--font-mono)", wordBreak:"break-all", background:"var(--bg-elev)", border:"0.5px solid var(--border)", borderRadius:9, padding:"9px 12px"}}>{agencyEmail}</div>
            <button className="btn ghost icon-only sm" onClick={() => copy(agencyEmail, "mail")}><Icon name={copied === "mail" ? "check" : "copy"} size={13}/></button>
          </div>
          {editable ? (
            <button className={"btn sm" + (c.granted ? "" : " ghost")} style={{marginTop:12}} onClick={() => D.updateCredential(c.id, { granted: !c.granted })}>
              {c.granted ? <><Icon name="check" size={12}/> Acceso concedido</> : "Ya he dado el acceso"}
            </button>
          ) : null}
        </div>
      ) : editing ? (
        <div style={{marginTop:14, paddingTop:14, borderTop:"0.5px solid var(--border)"}}>
          <input style={inp} placeholder="Usuario / email" value={f.username} onChange={e => setF(s => ({...s, username:e.target.value}))} autoFocus/>
          <input style={inp} placeholder="Contraseña" value={f.password} onChange={e => setF(s => ({...s, password:e.target.value}))}/>
          <input style={{...inp, marginBottom:12}} placeholder="Notas (opcional)" value={f.notes} onChange={e => setF(s => ({...s, notes:e.target.value}))}/>
          <div className="row tight"><button className="btn primary sm" onClick={saveEdit}>Guardar</button><button className="btn ghost sm" onClick={() => setEditing(false)}>Cancelar</button></div>
        </div>
      ) : (
        <div style={{marginTop:14, paddingTop:14, borderTop:"0.5px solid var(--border)"}}>
          {c.username && field("Usuario", c.username, false, "u")}
          {c.password && field("Contraseña", show ? c.password : "••••••••••", true, "p",
            <button className="btn ghost icon-only sm" onClick={() => setShow(s => !s)}><Icon name={show ? "eye-off" : "eye"} size={12}/></button>)}
          {!c.username && !c.password && (
            <div className="muted small" style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:8}}>
              <span>Aún no has rellenado este acceso.</span>
              {editable && <button className="btn primary sm" onClick={() => setEditing(true)}>Rellenar</button>}
            </div>
          )}
          {c.notes ? <div className="muted small" style={{marginTop:10, lineHeight:1.5}}>{c.notes}</div> : null}
        </div>
      )}
    </div></div>
  );
};

const ClientCredentials = ({ session }) => {
  const D = window.Data;
  D.useStore && D.useStore();
  const S = _portalScope(session);
  const clientId = S.clientId;
  const creds = S.credentials;
  const agencyEmail = (D.SETTINGS && D.SETTINGS.email) || "tu agencia";
  const [picking, setPicking] = useState(false);
  const add = (p) => { D.addCredential(clientId, { platform: p.key, label: p.name }); setPicking(false); };
  const del = (c) => { if (confirm(`¿Eliminar "${c.label || ""}"?`)) D.deleteCredential(c.id); };
  const doneCount = creds.filter(c => _credComplete(c, D.credMeta(c.platform).mode)).length;

  return (
    <div className="page">
      {/* Cabecera */}
      <div style={{marginBottom: 20}}>
        <div style={{fontSize:11, textTransform:"uppercase", letterSpacing:"0.09em", color:"var(--text-subtle)", marginBottom:8}}>Accesos</div>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:16, flexWrap:"wrap"}}>
          <div style={{minWidth:0}}>
            <h1 style={{fontFamily:"var(--font-display)", fontWeight:400, fontSize:"clamp(26px,3.5vw,34px)", letterSpacing:"-1px"}}>Credenciales</h1>
            <div className="sub" style={{marginTop:8, maxWidth:560, color:"var(--text-muted)"}}>
              Guarda aquí los accesos que tu equipo de 141 necesita para trabajar. Solo tú y el equipo podéis verlos.
            </div>
          </div>
          {!picking && <button className="btn primary" onClick={() => setPicking(true)}><Icon name="plus" size={14}/> Añadir acceso</button>}
        </div>
        {creds.length > 0 && (
          <div className="muted xsmall" style={{marginTop:14, display:"inline-flex", alignItems:"center", gap:7}}>
            <Icon name="lock" size={12}/> {doneCount} de {creds.length} accesos listos · cifrado y privado
          </div>
        )}
      </div>

      {picking && <CredCatalog onPick={add} onCancel={() => setPicking(false)} used={new Set(creds.map(c => c.platform))}/>}

      {creds.length === 0 && !picking ? (
        <div className="card"><div className="card-body" style={{padding:"40px 24px", textAlign:"center"}}>
          <div style={{width:52, height:52, borderRadius:14, margin:"0 auto 16px", display:"grid", placeItems:"center", background:"var(--bg-elev-2)", border:"0.5px solid var(--border)", color:"var(--text-muted)"}}>
            <Icon name="lock" size={22}/>
          </div>
          <div style={{fontFamily:"var(--font-display)", fontSize:18, fontWeight:500}}>Sin accesos todavía</div>
          <div className="muted small" style={{marginTop:6, maxWidth:380, marginLeft:"auto", marginRight:"auto", lineHeight:1.5}}>
            Añade los accesos que tu agencia necesita: redes sociales, web, hosting, analytics… Elige la plataforma y te decimos qué necesitamos.
          </div>
          <button className="btn primary" style={{marginTop:18}} onClick={() => setPicking(true)}><Icon name="plus" size={14}/> Añadir acceso</button>
        </div></div>
      ) : (
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px,1fr))", gap:14}}>
          {creds.map(c => <CredItem key={c.id} c={c} agencyEmail={agencyEmail} editable={true} onDelete={del}/>)}
        </div>
      )}

      <WhatsAppFloat/>
    </div>
  );
};

const _notifAgoP = (iso) => {
  if (!iso) return "ahora";
  const d = new Date(iso); const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "ahora";
  const m = Math.floor(s / 60); if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60); if (h < 24) return `hace ${h} h`;
  const dd = Math.floor(h / 24); if (dd < 7) return `hace ${dd} d`;
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
};

const ClientNotifications = ({ session }) => {
  const D = window.Data;
  D.useStore && D.useStore();
  const pcid = _previewClientId(session);
  let list = D.NOTIFICATIONS || [];
  if (pcid) list = list.filter(n => n.clientId === pcid);
  const unread = list.filter(n => !n.read).length;

  return (
    <div className="page">
      <div style={{marginBottom: 22}}>
        <div style={{fontSize:11, textTransform:"uppercase", letterSpacing:"0.09em", color:"var(--text-subtle)", marginBottom:8}}>Tu cuenta</div>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:16, flexWrap:"wrap"}}>
          <div>
            <h1 style={{fontFamily:"var(--font-display)", fontWeight:400, fontSize:"clamp(26px,3.5vw,34px)", letterSpacing:"-1px"}}>Notificaciones</h1>
            <div className="sub" style={{marginTop:8, color:"var(--text-muted)"}}>Novedades de tu proyecto y lo que tu agencia necesita de ti.</div>
          </div>
          {unread > 0 && <button className="btn ghost" onClick={() => D.markAllNotificationsRead()}>Marcar todas leídas</button>}
        </div>
      </div>

      {list.length === 0 ? (
        <Empty icon="bell" title="Sin notificaciones" sub="Aquí verás los avisos cuando tu agencia añada proyectos o tareas."/>
      ) : (
        <div style={{display:"flex", flexDirection:"column", gap:10}}>
          {list.map(n => (
            <div key={n.id} className="card" style={{cursor: n.read ? "default" : "pointer", borderColor: n.read ? "var(--border)" : "var(--accent)"}}
              onClick={() => { if (!n.read) D.markNotificationRead(n.id); }}>
              <div className="card-body" style={{padding:16, display:"flex", gap:14, alignItems:"flex-start"}}>
                <div style={{width:38, height:38, borderRadius:10, flexShrink:0, display:"grid", placeItems:"center",
                  background: n.read ? "var(--bg-elev-2)" : "var(--accent-soft)", color: n.read ? "var(--text-muted)" : "var(--accent)", border:"0.5px solid var(--border)"}}>
                  <Icon name={n.kind === "task" ? "list-todo" : n.kind === "project" ? "folder" : "bell"} size={17}/>
                </div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{display:"flex", justifyContent:"space-between", gap:10, alignItems:"baseline"}}>
                    <div style={{fontWeight:500, fontSize:14.5}}>{n.title}</div>
                    <div className="muted xsmall" style={{flexShrink:0}}>{_notifAgoP(n.createdAt)}</div>
                  </div>
                  {n.body && <div className="muted small" style={{marginTop:3, lineHeight:1.5}}>{n.body}</div>}
                </div>
                {!n.read && <span style={{width:8, height:8, borderRadius:99, background:"var(--accent)", flexShrink:0, marginTop:6}}/>}
              </div>
            </div>
          ))}
        </div>
      )}

      <WhatsAppFloat/>
    </div>
  );
};

const ClientSettings = ({ session }) => {
  const D = window.Data;
  D.useStore && D.useStore();
  const S = _portalScope(session);
  const me = S.me;
  const clientId = S.clientId;
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(false);
  React.useEffect(() => {
    if (me) setForm({
      name: me.name || "", company: me.company || "", whatsapp: me.whatsapp || "",
      website: me.website || "", fiscalName: me.fiscalName || "", nif: me.nif || "",
      fiscalAddress: me.fiscalAddress || "", about: me.about || "",
    });
  }, [me && me.id]);
  const set = (k, v) => setForm(s => ({ ...s, [k]: v }));
  const save = () => { D.updateClient(clientId, form); setSaved(true); setTimeout(() => setSaved(false), 1800); };
  const inp = { width:"100%", height:42, borderRadius:10, padding:"10px 12px", background:"var(--bg-elev)", border:"0.5px solid var(--border)", color:"var(--text)", fontFamily:"inherit", fontSize:14 };
  const field = (label, k, ph) => (
    <div>
      <div style={{fontSize:12, color:"var(--text-subtle)", marginBottom:5}}>{label}</div>
      <input style={inp} value={(form && form[k]) || ""} placeholder={ph || ""} onChange={e => set(k, e.target.value)}/>
    </div>
  );

  const head = (
    <div style={{marginBottom: 22}}>
      <div style={{fontSize:11, textTransform:"uppercase", letterSpacing:"0.09em", color:"var(--text-subtle)", marginBottom:8}}>Tu cuenta</div>
      <h1 style={{fontFamily:"var(--font-display)", fontWeight:400, fontSize:"clamp(26px,3.5vw,34px)", letterSpacing:"-1px"}}>Ajustes</h1>
      <div className="sub" style={{marginTop:8, color:"var(--text-muted)"}}>Revisa y actualiza tus datos. Puedes cambiar lo que rellenaste al principio.</div>
    </div>
  );

  if (!me || !form) return (
    <div className="page">{head}<Empty icon="user-cog" title="Cargando tu cuenta…"/><WhatsAppFloat/></div>
  );

  return (
    <div className="page">
      {head}
      <div className="card"><div className="card-body" style={{padding: 22}}>
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(240px,1fr))", gap: 16}}>
          {field("Nombre de contacto", "name", "Tu nombre")}
          {field("Empresa", "company", "Mi Empresa S.L.")}
          {field("Teléfono / WhatsApp", "whatsapp", "+34 600 000 000")}
          {field("Web", "website", "tuweb.com")}
          {field("Razón social", "fiscalName", "Mi Empresa S.L.")}
          {field("NIF / CIF", "nif")}
          {field("Dirección fiscal", "fiscalAddress")}
        </div>
        <div style={{marginTop: 16}}>
          <div style={{fontSize:12, color:"var(--text-subtle)", marginBottom:5}}>A qué te dedicas</div>
          <textarea style={{...inp, height:80, resize:"vertical", lineHeight:1.5}} value={form.about} placeholder="Cuéntanos brevemente tu negocio" onChange={e => set("about", e.target.value)}/>
        </div>
        <div className="row tight" style={{marginTop: 18}}>
          <button className="btn primary" onClick={save}>Guardar cambios</button>
          {saved && <span className="small" style={{color:"var(--green)"}}>Guardado ✓</span>}
        </div>
      </div></div>

      <div className="muted xsmall" style={{marginTop:14, display:"flex", alignItems:"center", gap:7}}>
        <Icon name="mail" size={12}/> Tu correo de acceso es {me.email || "—"} (no se puede cambiar desde aquí).
      </div>

      <WhatsAppFloat/>
    </div>
  );
};

Object.assign(window, { ClientLogin, ClientDashboard, ClientStatus, ClientDocs, ClientCredentials, ClientNotifications, ClientSettings });

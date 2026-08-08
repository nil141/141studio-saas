// Modal de edición de proyecto — nombre, cliente (opcional), tipo y fecha
const _PM_MESES = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
const _pmIsoToShort = (iso) => {
  if (!iso) return "";
  const d = new Date(iso + "T12:00:00");
  return isNaN(d) ? "" : `${d.getDate()} ${_PM_MESES[d.getMonth()]}`;
};
const EditProjectModal = ({ project, onClose }) => {
  const D = window.Data;
  const toast = useToast();
  const [name, setName]           = useState(project.name || "");
  const [clientId, setClientId]   = useState(project.clientId || "");
  const [recurring, setRecurring] = useState(!!project.recurring);
  const [deadline, setDeadline]   = useState("");   // ISO nuevo; vacío = mantener el actual
  const [pickClient, setPickClient] = useState(false);

  const clients = D.CLIENTS || [];
  const selClient = clientId ? clients.find(c => c.id === clientId) : null;

  const save = () => {
    if (!name.trim()) { toast("Ponle un nombre al proyecto", "warn"); return; }
    const cl = clientId ? clients.find(c => c.id === clientId) : null;
    const changes = {
      name: name.trim(),
      clientId: clientId || null,
      clientName: cl ? (cl.company || cl.name || "—") : "Interno",
      recurring,
    };
    if (recurring) changes.deadline = "";
    else if (deadline) changes.deadline = _pmIsoToShort(deadline);
    D.updateProject(project.id, changes);
    toast("Proyecto actualizado", "success");
    onClose();
  };

  return (
    <Modal open onClose={onClose} title="Editar proyecto"
      footer={
        <div style={{ display:"flex", gap:10, justifyContent:"flex-end", width:"100%" }}>
          <button className="btn ghost" onClick={onClose}>Cancelar</button>
          <button className="btn primary" onClick={save}><Icon name="check" size={13}/> Guardar</button>
        </div>
      }>
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {/* Nombre */}
        <div>
          <div className="label">Nombre del proyecto</div>
          <input className="input" value={name} onChange={e => setName(e.target.value)} autoFocus/>
        </div>

        {/* Cliente (opcional) */}
        <div style={{ position:"relative" }}>
          <div className="label">Cliente <span style={{ color:"var(--text-subtle)", fontWeight:400 }}>(opcional)</span></div>
          <button className="input row tight" style={{ textAlign:"left", height:38 }} onClick={() => setPickClient(s => !s)}>
            <span className="grow" style={{ textAlign:"left", color: selClient ? "var(--text)" : "var(--text-muted)" }}>
              {selClient ? (selClient.company || selClient.name) : "Sin cliente · proyecto interno"}
            </span>
            <Icon name="chevron" size={12} style={{ transform:"rotate(90deg)" }}/>
          </button>
          {pickClient && (
            <div style={{ marginTop:6, background:"var(--bg-elev-2)", border:"0.5px solid var(--border-strong)",
              borderRadius:10, overflow:"hidden", maxHeight:200, overflowY:"auto" }}>
              <div onClick={() => { setClientId(""); setPickClient(false); }}
                style={{ padding:"8px 12px", display:"flex", alignItems:"center", gap:10, cursor:"pointer", fontSize:13 }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <span className="grow">Sin cliente · proyecto interno</span>
                {!clientId && <Icon name="check" size={13}/>}
              </div>
              {clients.map(c => (
                <div key={c.id} onClick={() => { setClientId(c.id); setPickClient(false); }}
                  style={{ padding:"8px 12px", display:"flex", alignItems:"center", gap:10, cursor:"pointer", fontSize:13 }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <span className="grow">{[c.name, c.company].filter(Boolean).join(" · ")}</span>
                  {c.id === clientId && <Icon name="check" size={13}/>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tipo */}
        <div>
          <div className="label">Tipo</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {[{ id:false, title:"Puntual", icon:"flag" }, { id:true, title:"Recurrente", icon:"refresh-cw" }].map(opt => {
              const on = recurring === opt.id;
              return (
                <button key={String(opt.id)} onClick={() => setRecurring(opt.id)} style={{
                  display:"flex", alignItems:"center", gap:9, textAlign:"left",
                  padding:"10px 12px", borderRadius:12, cursor:"pointer", fontFamily:"inherit",
                  background: on ? "rgba(158,154,229,0.14)" : "rgba(255,255,255,0.03)",
                  border: on ? "0.5px solid rgba(158,154,229,0.5)" : "0.5px solid var(--border)",
                  color: on ? "var(--text)" : "var(--text-muted)", transition:"all .12s",
                }}>
                  <Icon name={opt.icon} size={14} strokeWidth={1.7} style={{ color: on ? "var(--accent)" : "var(--text-subtle)" }}/>
                  <span style={{ fontSize:13 }}>{opt.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fecha de entrega (solo puntual) */}
        {!recurring && (
          <div>
            <div className="label">Fecha de entrega</div>
            <input className="input" type="date" value={deadline} onChange={e => setDeadline(e.target.value)}/>
            {project.deadline && project.deadline !== "—" && (
              <div style={{ fontSize:11.5, color:"var(--text-subtle)", marginTop:5 }}>
                Actual: {project.deadline}{deadline ? "" : " · déjalo vacío para mantenerla"}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

// Agency Project detail with 6-week roadmap
const AgencyProject = ({ projectId, navigate, openModal }) => {
  const D = window.Data;
  D.useStore();
  const toast = useToast();
  const confirm = useConfirm();
  const p = D.PROJECTS.find(x => x.id === projectId) || D.PROJECTS[0];
  // Empty state — no projects at all
  if (!p) {
    return (
      <div className="page">
        <div className="page-head"><div><h1>Proyecto</h1></div></div>
        <div className="card"><div className="card-body" style={{padding: 60}}>
          <Empty icon="folder" title="Sin proyectos" sub="Aún no tienes proyectos creados."/>
          <div className="row" style={{justifyContent:"center", marginTop: 12}}>
            <button className="btn primary" onClick={() => openModal("newProject")}><Icon name="plus" size={13}/> Crear proyecto</button>
          </div>
        </div></div>
      </div>
    );
  }
  const phase = D.PHASES[p.phase] || D.PHASES[0] || { label: "", weeks: "" };
  const [tab, setTab]         = useState("plan");
  const [phaseTab, setPhaseTab] = useState(null);
  const [adding, setAdding]   = useState(null);
  const [draft, setDraft]     = useState("");
  const [dragOver, setDragOver] = useState(null);
  const dragTaskRef = React.useRef(null);
  // Task context menu
  const [ctxMenu, setCtxMenu]     = useState(null); // {x, y, taskId}
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState("");
  const [datePicking, setDatePicking] = useState(null); // taskId
  const [phaseAdding, setPhaseAdding] = useState(false);
  const [phaseDraft, setPhaseDraft]   = useState("");
  const [editOpen, setEditOpen]       = useState(false);
  // Carpeta de Drive del proyecto (por ahora guardada localmente; la creación
  // automática llegará al conectar Google Drive).
  const [driveTick, setDriveTick] = useState(0);
  const [driveEditing, setDriveEditing] = useState(false);
  const [driveDraft, setDriveDraft] = useState("");
  const [hoverId, setHoverId] = useState(null); // fase resaltada en el Plan

  // Close context menu on outside click
  React.useEffect(() => {
    if (!ctxMenu) return;
    const close = () => setCtxMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [!!ctxMenu]);

  // Fases del proyecto: nombres libres que se guardan en el campo service
  // (persiste en la nube). Cada fase es solo un nombre; las tareas las crea el
  // usuario dentro de cada fase.
  const aiPhases = React.useMemo(() => {
    const names = (p.service || "").split(",").map(s => s.trim())
      .filter(n => n && n !== "libre" && n !== "—");
    return names.length ? names.map(n => ({ name: n })) : null;
  }, [p.id, p.service]);

  // La fase de una tarea es la que ella misma guarda (persistida en la nube).
  const taskPhase = (t) => t.phase || null;

  // Default to first phase when phases available
  React.useEffect(() => {
    if (aiPhases?.length > 0) {
      setPhaseTab(ph => ph === null ? aiPhases[0].name : ph);
    }
  }, [p.id, aiPhases]);

  const projectTasks = D.TASKS[p.id] || [];

  // Live progress from actual tasks
  const liveProgress = projectTasks.length
    ? Math.round(projectTasks.filter(t => t.column === "done").length / projectTasks.length * 100)
    : 0;

  const tasksByCol = {
    todo:   projectTasks.filter(t => t.column === "todo"),
    doing:  projectTasks.filter(t => t.column === "doing"),
    review: projectTasks.filter(t => t.column === "review"),
    done:   projectTasks.filter(t => t.column === "done"),
  };

  const addTaskInline = (col) => {
    if (!draft.trim()) { setAdding(null); setDraft(""); return; }
    D.addTask({ projectId: p.id, title: draft.trim(), column: col, phase: phaseTab || null });
    toast("Tarea añadida", "success");
    setDraft("");
    setAdding(null);
  };

  // ── Gestión de fases (nombres libres guardados en p.service) ──────────────
  const phaseList = () => (p.service || "").split(",").map(s => s.trim())
    .filter(n => n && n !== "libre" && n !== "—");
  const savePhases = (names) => D.updateProject(p.id, { service: names.join(", ") || "libre" });
  const addPhase = (name) => {
    const v = (name || "").trim();
    if (!v) { setPhaseAdding(false); setPhaseDraft(""); return; }
    const names = phaseList();
    if (!names.some(n => n.toLowerCase() === v.toLowerCase())) { savePhases([...names, v]); toast("Fase añadida", "success"); }
    setPhaseDraft(""); setPhaseAdding(false);
  };
  const removePhase = (name) => {
    // Las tareas de esa fase pasan a "sin fase" (Otras tareas), no se borran.
    (D.TASKS[p.id] || []).filter(t => t.phase === name).forEach(t => D.updateTask(p.id, t.id, { phase: null }));
    savePhases(phaseList().filter(n => n !== name));
    toast("Fase eliminada", "success");
  };

  const onDragStart = (taskId) => { dragTaskRef.current = taskId; };
  const onDragOver = (e, colId) => { e.preventDefault(); setDragOver(colId); };
  const onDrop = (e, colId) => {
    e.preventDefault();
    if (dragTaskRef.current) {
      D.moveTask(p.id, dragTaskRef.current, colId);
      dragTaskRef.current = null;
    }
    setDragOver(null);
  };
  const onDragEnd = () => { dragTaskRef.current = null; setDragOver(null); };

  const removeProjectFromHere = async () => {
    const ok = await confirm({
      title: `Eliminar el proyecto "${p.name}"?`,
      body: "Se eliminarán también sus tareas y entregables. Esta acción no se puede deshacer.",
      confirmLabel: "Sí, eliminar",
      danger: true,
    });
    if (ok) { D.deleteProject(p.id); toast("Proyecto eliminado", "success"); navigate("projects"); }
  };

  return (
    <>
    <div className="page">
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: 16}}>
        <button className="btn ghost sm" onClick={() => navigate("projects")}>
          <Icon name="chevron" size={12} style={{transform:"rotate(180deg)"}}/> Proyectos
        </button>
        <ActionPill
          plusActions={() => { setTab("tasks"); setAdding("add:" + ((aiPhases && aiPhases[0]) ? aiPhases[0].name : "__otras__")); setDraft(""); }}
          moreActions={[
            { icon:"edit", label:"Editar proyecto", sub:"Cambia nombre, cliente, tipo o fecha.", onClick: () => setEditOpen(true) },
            { icon:"trash", label:"Eliminar proyecto", sub:"Borra el proyecto y sus tareas.", onClick: removeProjectFromHere },
          ]}
        />
      </div>

      <div className="page-head" style={{marginBottom: 14}}>
        <div>
          <h1>{p.name}</h1>
          <div className="sub">
            {(() => {
              const parts = [p.clientName];
              if (p.recurring) parts.push("Mensual");
              else if (p.deadline && p.deadline !== "—") parts.push("Entrega " + p.deadline);
              if (aiPhases) parts.push(aiPhases.length + " fase" + (aiPhases.length === 1 ? "" : "s"));
              return parts.join(" · ");
            })()}
          </div>
        </div>
      </div>

      {/* Barra de progreso del proyecto */}
      <div style={{display:"flex", alignItems:"center", gap:14, marginBottom:22}}>
        <div style={{flex:1, height:6, borderRadius:99, background:"rgba(255,255,255,0.06)", overflow:"hidden"}}>
          <div style={{width: liveProgress + "%", height:"100%", borderRadius:99,
            background: "var(--accent)", transition:"width .4s ease"}}/>
        </div>
        <div style={{flexShrink:0, fontSize:13, color:"var(--text-muted)"}}>
          <span style={{color:"var(--text)", fontWeight:600}}>{liveProgress}%</span>
          <span style={{margin:"0 6px", opacity:0.4}}>·</span>
          {tasksByCol.done.length}/{projectTasks.length} tareas
        </div>
      </div>

      <div className="tabs">
        {[
          {id:"plan", label: aiPhases ? `Plan (${aiPhases.length} fases)` : "Plan"},
          {id:"tasks", label:"Tablero"},
          {id:"files", label:"Archivos"},
        ].map(t => (
          <div key={t.id} className={"tab" + (tab === t.id ? " active" : "")} onClick={() => setTab(t.id)}>
            {t.label}{t.count != null ? <span className="count">{t.count}</span> : null}
          </div>
        ))}
      </div>

      <div>
          {tab === "plan" && (() => {
            // ── Vista de SEGUIMIENTO (solo lectura) ──────────────────
            const phaseNames = (aiPhases || []).map(ph => ph.name);
            const planGroups = phaseNames.map(name => ({
              name, label: name,
              tasks: projectTasks.filter(t => taskPhase(t) === name),
            }));
            const otras = projectTasks.filter(t => !phaseNames.includes(taskPhase(t)));
            if (otras.length) planGroups.push({ name: "__otras__", label: "Otras tareas", tasks: otras });

            // Estado de fecha respecto a hoy
            const today = new Date(); today.setHours(0,0,0,0);
            const MES = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
            const parseD = (s) => { if(!s) return null; const d = new Date(s + "T12:00:00"); return isNaN(d.getTime()) ? null : d; };
            const dateInfo = (s) => {
              const d = parseD(s); if(!d) return null;
              const diff = Math.round((d - today) / 86400000);
              const label = `${d.getDate()} ${MES[d.getMonth()]}`;
              if (diff < 0)  return { label, tag:`Vencida (${-diff}d)`, color:"var(--red)" };
              if (diff === 0) return { label, tag:"Hoy", color:"var(--amber)" };
              if (diff <= 7) return { label, tag:`En ${diff}d`, color:"var(--amber)" };
              return { label, tag:"", color:"var(--text-subtle)" };
            };

            // Próximos vencimientos: tareas con fecha, no hechas, ordenadas
            const upcoming = projectTasks
              .filter(t => t.deadline && t.column !== "done")
              .map(t => ({ t, info: dateInfo(t.deadline) }))
              .filter(x => x.info)
              .sort((a,b) => parseD(a.t.deadline) - parseD(b.t.deadline));

            const phaseStatus = (done, total) => {
              if (total === 0) return { label:"Sin tareas", cls:"" };
              if (done === total) return { label:"Completada", cls:"green" };
              if (done > 0) return { label:"En curso", cls:"blue" };
              return { label:"Sin empezar", cls:"" };
            };

            const secLabel = { fontSize:11, textTransform:"uppercase", letterSpacing:"0.07em", color:"var(--text-subtle)", marginBottom:4 };
            return (
              <div style={{display:"flex", flexDirection:"column", gap:34}}>
                {/* Fases del proyecto — lista plana estilo del resto del SaaS */}
                <div>
                  <div style={secLabel}>Fases del proyecto</div>
                  {planGroups.length === 0 ? (
                    <div style={{display:"flex", flexDirection:"column", alignItems:"center", gap:14, padding:"20px 0"}}>
                      <Empty icon="list-todo" title="Sin fases" sub="Organiza el proyecto en fases y añade tareas dentro de cada una."/>
                      <button className="btn primary sm" onClick={() => setTab("tasks")}>
                        <Icon name="plus" size={13}/> Crear fases y tareas
                      </button>
                    </div>
                  ) : (
                    <div style={{display:"flex", flexDirection:"column", width:"100%"}}>
                      {planGroups.map((g, i) => {
                        const gDone = g.tasks.filter(t => t.column === "done").length;
                        const gPct = g.tasks.length ? Math.round(gDone / g.tasks.length * 100) : 0;
                        const st = phaseStatus(gDone, g.tasks.length);
                        const isReal = g.name !== "__otras__";
                        const on = hoverId === g.name;
                        return (
                          <div key={g.name}
                            onClick={() => { if (isReal) { setTab("tasks"); setPhaseTab(g.name); } }}
                            onMouseEnter={() => setHoverId(g.name)} onMouseLeave={() => setHoverId(null)}
                            style={{display:"flex", flexDirection:"column", gap:12, padding:"18px 6px", cursor: isReal ? "pointer" : "default"}}>
                            <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:12}}>
                              <div style={{display:"flex", alignItems:"center", gap:14, minWidth:0}}>
                                <span style={{width:26, height:26, borderRadius:99, flexShrink:0, display:"grid", placeItems:"center",
                                  fontSize:12, fontWeight:600, background:"transparent",
                                  color: gPct===100 ? "var(--accent)" : "var(--text-muted)",
                                  border: "1.5px solid " + (gPct===100 ? "var(--accent)" : "var(--border-strong)")}}>
                                  {gPct===100 ? <Icon name="check" size={13}/> : (isReal ? i+1 : "·")}
                                </span>
                                <div style={{minWidth:0}}>
                                  <div style={{fontSize:17, color:"var(--text)", letterSpacing:"-0.4px", lineHeight:1.2,
                                    whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{g.label}</div>
                                  <div style={{fontSize:12.5, color:"var(--text-muted)", marginTop:3, display:"flex", alignItems:"center", gap:6}}>
                                    <span style={{color: (st.cls==="green" || st.cls==="blue") ? "var(--accent)" : "var(--text-muted)"}}>{st.label}</span>
                                    <span style={{opacity:0.4, fontSize:10}}>•</span>
                                    <span>{gDone}/{g.tasks.length} tareas</span>
                                    <span style={{opacity:0.4, fontSize:10}}>•</span>
                                    <span>{gPct}%</span>
                                  </div>
                                </div>
                              </div>
                              {isReal && (
                                <Icon name="chevron-right" size={18}
                                  style={{color: on ? "var(--text)" : "var(--text-muted)", transform: on ? "translateX(3px)" : "none",
                                    transition:"all .2s", flexShrink:0}}/>
                              )}
                            </div>
                            <div style={{height:1, width:"100%", background:"var(--border)"}}/>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Próximos vencimientos — lista plana */}
                <div>
                  <div style={secLabel}>Próximos vencimientos</div>
                  {upcoming.length === 0 ? (
                    <div className="muted small" style={{padding:"14px 6px", color:"var(--text-subtle)"}}>
                      No hay tareas con fecha pendientes. Añade fechas a las tareas desde el Tablero (clic derecho en la tarjeta).
                    </div>
                  ) : (
                    <div style={{display:"flex", flexDirection:"column", width:"100%"}}>
                      {upcoming.map(({t, info}, i) => (
                        <div key={t.id} style={{display:"flex", alignItems:"center", gap:14, padding:"16px 6px",
                          borderTop: i===0 ? "none" : "0.5px solid var(--border)"}}>
                          <span style={{width:9, height:9, borderRadius:99, background:info.color, flexShrink:0}}/>
                          <div style={{flex:1, minWidth:0}}>
                            <div style={{fontSize:15, letterSpacing:"-0.2px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{t.title}</div>
                            {taskPhase(t) && <div style={{fontSize:12, color:"var(--text-muted)", marginTop:2}}>{taskPhase(t)}</div>}
                          </div>
                          <div style={{textAlign:"right", flexShrink:0}}>
                            <div style={{fontSize:14, fontWeight:500}}>{info.label}</div>
                            {info.tag && <div style={{fontSize:11.5, color:info.color, marginTop:1}}>{info.tag}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {tab === "tasks" && (() => {
            const ORDER = { todo:0, doing:1, review:2, done:3 };
            const STATE = { todo:"Por hacer", doing:"En curso", review:"Revisión", done:"Hecho" };
            const ARC   = { todo:0, doing:0.34, review:0.7, done:1 };
            const cycle = (t) => {
              const seq = ["todo","doing","review","done"];
              D.moveTask(p.id, t.id, seq[(seq.indexOf(t.column) + 1) % 4]);
            };
            // Grupos por fase + "Otras tareas"
            const phaseNames = (aiPhases || []).map(ph => ph.name);
            const groups = phaseNames.map(name => ({ name, label:name, tasks: projectTasks.filter(t => taskPhase(t) === name) }));
            const otras = projectTasks.filter(t => !phaseNames.includes(taskPhase(t)));
            if (otras.length || !phaseNames.length) groups.push({ name:"__otras__", label:"Otras tareas", tasks: otras });
            const addTo = (phaseName) => {
              if (!draft.trim()) { setAdding(null); setDraft(""); return; }
              D.addTask({ projectId: p.id, title: draft.trim(), column: "todo",
                phase: phaseName === "__otras__" ? null : phaseName });
              setDraft(""); setAdding(null);
            };
            // Una fila de tarea (reutilizable)
            const renderRow = (t, last) => {
              const isDone = t.column === "done";
              const sz = 38, r = 16, circ = 2 * Math.PI * r;
              const frac = ARC[t.column] || 0;
              return (
                <div key={t.id} className="task-row"
                  onContextMenu={e => { e.preventDefault(); setCtxMenu({x:e.clientX, y:e.clientY, taskId:t.id}); }}
                  style={{display:"flex", alignItems:"center", gap:13, padding:"12px 4px",
                    borderBottom: last ? "none" : "0.5px solid var(--border)"}}>
                  <button onClick={() => cycle(t)} title={"Estado: " + STATE[t.column] + " (clic para avanzar)"}
                    style={{width:sz, height:sz, flexShrink:0, position:"relative", display:"grid", placeItems:"center",
                      background:"none", border:"none", padding:0, cursor:"pointer"}}>
                    <svg width={sz} height={sz} style={{position:"absolute", top:0, left:0}}>
                      <circle cx={sz/2} cy={sz/2} r={r} fill="none"
                        stroke={isDone ? "var(--accent)" : "rgba(255,255,255,0.12)"} strokeWidth="2"/>
                      {!isDone && frac > 0 && (
                        <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"
                          strokeDasharray={`${frac*circ} ${circ}`} transform={`rotate(-90,${sz/2},${sz/2})`}/>
                      )}
                    </svg>
                    {isDone
                      ? <Icon name="check" size={15} style={{color:"var(--accent)", position:"relative"}}/>
                      : <span style={{width:5, height:5, borderRadius:99, background:"rgba(255,255,255,0.25)", position:"relative"}}/>}
                  </button>
                  <div style={{flex:1, minWidth:0}}>
                    {editingId === t.id ? (
                      <input autoFocus className="input" value={editDraft}
                        onChange={e => setEditDraft(e.target.value)}
                        onKeyDown={e => {
                          if(e.key==="Enter"){ if(editDraft.trim()) D.updateTask(p.id, t.id, {title:editDraft.trim()}); setEditingId(null); }
                          if(e.key==="Escape") setEditingId(null);
                        }}
                        onBlur={() => { if(editDraft.trim()) D.updateTask(p.id, t.id, {title:editDraft.trim()}); setEditingId(null); }}
                        style={{padding:"4px 6px", fontSize:14}}/>
                    ) : (
                      <div onClick={() => { setEditingId(t.id); setEditDraft(t.title); }}
                        style={{fontSize:14, letterSpacing:"-0.3px", cursor:"text",
                          color: isDone ? "var(--text-subtle)" : "var(--text)",
                          textDecoration: isDone ? "line-through" : "none",
                          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{t.title}</div>
                    )}
                    <div style={{fontSize:11.5, color:"var(--text-subtle)", marginTop:2}}>
                      {STATE[t.column]}{t.deadline ? " · " + t.deadline : ""}
                    </div>
                  </div>
                  <button className="task-del btn ghost icon-only sm" data-tooltip="Fecha"
                    onClick={() => setDatePicking(datePicking === t.id ? null : t.id)}
                    style={{flexShrink:0, color:"var(--text-subtle)"}}>
                    <Icon name="calendar" size={13}/>
                  </button>
                  <button className="task-del btn ghost icon-only sm"
                    onClick={() => D.deleteTask(p.id, t.id)}
                    style={{flexShrink:0, color:"var(--text-subtle)"}}>
                    <Icon name="x" size={12}/>
                  </button>
                  {datePicking === t.id && (
                    <input type="date" autoFocus className="input" defaultValue={t.deadline||""}
                      onChange={e => { D.updateTask(p.id, t.id, {deadline:e.target.value}); setDatePicking(null); }}
                      onBlur={() => setDatePicking(null)}
                      style={{flexShrink:0, fontSize:12, padding:"3px 6px", width:140}}/>
                  )}
                </div>
              );
            };
            return (
              <div style={{display:"flex", flexDirection:"column", width:"100%"}}>
                {groups.map((g, gi) => {
                  const gTasks = [...g.tasks].sort((a,b) => ORDER[a.column] - ORDER[b.column]);
                  const gDone = g.tasks.filter(t => t.column === "done").length;
                  const addKey = "add:" + g.name;
                  const isAdding = adding === addKey;
                  return (
                    <div key={g.name} style={{marginTop: gi === 0 ? 0 : 26}}>
                      {/* Encabezado de fase */}
                      <div className="phase-head" style={{display:"flex", alignItems:"center", gap:8, marginBottom:2,
                        paddingBottom:8, borderBottom:"0.5px solid var(--border)"}}>
                        <span style={{fontSize:11.5, textTransform:"uppercase", letterSpacing:"0.06em", color:"var(--text-subtle)", fontWeight:600}}>{g.label}</span>
                        <span style={{fontSize:11, color:"var(--text-subtle)", opacity:0.7}}>{gDone}/{g.tasks.length}</span>
                        {g.name !== "__otras__" && (
                          <button className="phase-del btn ghost icon-only sm" title="Eliminar fase"
                            onClick={() => removePhase(g.name)}
                            style={{marginLeft:"auto", color:"var(--text-subtle)"}}>
                            <Icon name="trash" size={12}/>
                          </button>
                        )}
                      </div>
                      {/* Tareas de la fase */}
                      {gTasks.map(t => renderRow(t, false))}
                      {/* Añadir tarea a la fase */}
                      {isAdding ? (
                        <div style={{display:"flex", alignItems:"center", gap:13, padding:"12px 4px", borderTop: gTasks.length ? "0.5px solid var(--border)" : "none"}}>
                          <span style={{width:38, height:38, flexShrink:0, display:"grid", placeItems:"center"}}>
                            <span style={{width:20, height:20, borderRadius:99, border:"1.5px dashed var(--border-strong)"}}/>
                          </span>
                          <input autoFocus className="input" placeholder="Nombre de la tarea…"
                            value={draft} onChange={e => setDraft(e.target.value)}
                            onKeyDown={e => { if(e.key==="Enter") addTo(g.name); if(e.key==="Escape"){setAdding(null);setDraft("");} }}
                            onBlur={() => addTo(g.name)} style={{flex:1, padding:"5px 8px", fontSize:14}}/>
                        </div>
                      ) : (
                        <button className="btn ghost sm" onClick={() => { setAdding(addKey); setDraft(""); }}
                          style={{justifyContent:"flex-start", color:"var(--text-subtle)", marginTop: 4, padding:"9px 4px"}}>
                          <Icon name="plus" size={13}/> Añadir tarea
                        </button>
                      )}
                    </div>
                  );
                })}
                {/* Añadir una fase nueva */}
                <div style={{marginTop: groups.length ? 26 : 0, paddingTop: 14, borderTop:"0.5px solid var(--border)"}}>
                  {phaseAdding ? (
                    <input autoFocus className="input" placeholder="Nombre de la fase…"
                      value={phaseDraft} onChange={e => setPhaseDraft(e.target.value)}
                      onKeyDown={e => { if(e.key==="Enter") addPhase(phaseDraft); if(e.key==="Escape"){setPhaseAdding(false);setPhaseDraft("");} }}
                      onBlur={() => addPhase(phaseDraft)} style={{maxWidth:320, padding:"7px 10px", fontSize:14}}/>
                  ) : (
                    <button className="btn ghost sm" onClick={() => { setPhaseAdding(true); setPhaseDraft(""); }}
                      style={{justifyContent:"flex-start", color:"var(--accent)", padding:"9px 4px"}}>
                      <Icon name="plus" size={13}/> Añadir fase
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {tab === "files" && (() => {
            const driveKey = "proj_drive_" + p.id;
            const driveUrl = (typeof localStorage !== "undefined" && localStorage.getItem(driveKey)) || "";
            const saveDrive = (url) => {
              const v = (url || "").trim();
              if (v) localStorage.setItem(driveKey, v); else localStorage.removeItem(driveKey);
              setDriveEditing(false); setDriveDraft(""); setDriveTick(x => x + 1);
            };
            return (
              <div className="card"><div className="card-body">
                <div className="row between" style={{marginBottom: 4}}>
                  <div className="card-title">Carpeta del proyecto</div>
                  {driveUrl && !driveEditing && (
                    <button className="btn ghost sm" onClick={() => { setDriveDraft(driveUrl); setDriveEditing(true); }}>
                      <Icon name="edit" size={12}/> Editar
                    </button>
                  )}
                </div>

                {driveUrl && !driveEditing ? (
                  <div style={{display:"flex", flexDirection:"column", gap:12, marginTop:8}}>
                    <div style={{display:"flex", alignItems:"center", gap:12, padding:"14px 16px", borderRadius:12,
                      background:"var(--bg-elev-2)", border:"0.5px solid var(--border)"}}>
                      <div style={{width:38, height:38, borderRadius:10, flexShrink:0, display:"grid", placeItems:"center",
                        background:"rgba(158,154,229,0.14)", color:"var(--accent)"}}>
                        <Icon name="folder" size={18}/>
                      </div>
                      <div style={{flex:1, minWidth:0}}>
                        <div style={{fontWeight:500, fontSize:14}}>Carpeta de Drive</div>
                        <div className="subtle xsmall truncate">{driveUrl}</div>
                      </div>
                    </div>
                    <div className="row tight">
                      <a className="btn primary" href={driveUrl} target="_blank" rel="noreferrer">
                        <Icon name="external-link" size={13}/> Abrir carpeta
                      </a>
                      <button className="btn" onClick={() => {
                        try { navigator.clipboard.writeText(driveUrl); toast("Enlace copiado para el cliente", "success"); }
                        catch { toast("No se pudo copiar", "error"); }
                      }}>
                        <Icon name="paperclip" size={13}/> Copiar enlace para el cliente
                      </button>
                    </div>
                    <div className="muted xsmall">El cliente puede acceder a la carpeta con este enlace.</div>
                  </div>
                ) : driveEditing ? (
                  <div style={{display:"flex", flexDirection:"column", gap:10, marginTop:10}}>
                    <input autoFocus className="input" placeholder="Pega el enlace de la carpeta de Drive…"
                      value={driveDraft} onChange={e => setDriveDraft(e.target.value)}
                      onKeyDown={e => { if(e.key==="Enter") saveDrive(driveDraft); if(e.key==="Escape") setDriveEditing(false); }}/>
                    <div className="row tight">
                      <button className="btn primary" onClick={() => saveDrive(driveDraft)}><Icon name="check" size={12}/> Guardar</button>
                      <button className="btn" onClick={() => setDriveEditing(false)}>Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <div style={{marginTop:8}}>
                    <Empty icon="folder" title="Sin carpeta todavía"
                      sub="Pega el enlace de la carpeta de Drive del proyecto para compartirla con el cliente."/>
                    <div className="row" style={{justifyContent:"center", marginTop:12}}>
                      <button className="btn primary" onClick={() => { setDriveDraft(""); setDriveEditing(true); }}>
                        <Icon name="plus" size={13}/> Añadir carpeta de Drive
                      </button>
                    </div>
                  </div>
                )}
              </div></div>
            );
          })()}

      </div>
    </div>

    {/* Task context menu */}
    {ctxMenu && (() => {
      const ctxTask = projectTasks.find(t => t.id === ctxMenu.taskId);
      if (!ctxTask) return null;
      return (
        <div onClick={e => e.stopPropagation()}
          style={{
            position:"fixed", left:ctxMenu.x, top:ctxMenu.y, zIndex:300,
            background:"var(--bg-elev-2)", border:"0.5px solid var(--border-strong)",
            borderRadius:10, padding:4, minWidth:180,
            boxShadow:"0 8px 32px rgba(0,0,0,0.35)",
          }}>
          {[
            { label:"Editar nombre", icon:"list-todo", action:() => {
              setEditingId(ctxTask.id); setEditDraft(ctxTask.title); setCtxMenu(null);
            }},
            { label:"Fecha de vencimiento", icon:"calendar", action:() => {
              setDatePicking(ctxTask.id); setCtxMenu(null);
            }},
          ].map(it => (
            <button key={it.label} onClick={it.action} style={{
              display:"flex", alignItems:"center", gap:9, width:"100%",
              padding:"8px 12px", borderRadius:7, background:"none", border:"none",
              cursor:"pointer", fontSize:13, color:"var(--text)", textAlign:"left",
            }}
            onMouseEnter={e=>e.currentTarget.style.background="var(--bg-hover)"}
            onMouseLeave={e=>e.currentTarget.style.background="none"}>
              <Icon name={it.icon} size={13} style={{color:"var(--text-subtle)"}}/>
              {it.label}
            </button>
          ))}
          <div style={{height:1, background:"var(--border)", margin:"3px 4px"}}/>
          <button onClick={() => { D.deleteTask(p.id, ctxTask.id); setCtxMenu(null); toast("Tarea eliminada", "success"); }}
            style={{
              display:"flex", alignItems:"center", gap:9, width:"100%",
              padding:"8px 12px", borderRadius:7, background:"none", border:"none",
              cursor:"pointer", fontSize:13, color:"var(--red)", textAlign:"left",
            }}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(239,68,68,0.08)"}
            onMouseLeave={e=>e.currentTarget.style.background="none"}>
            <Icon name="x" size={13}/>
            Eliminar tarea
          </button>
        </div>
      );
    })()}
    {editOpen && <EditProjectModal project={p} onClose={() => setEditOpen(false)}/>}
    </>
  );
};

window.AgencyProject = AgencyProject;

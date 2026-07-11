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

  // Close context menu on outside click
  React.useEffect(() => {
    if (!ctxMenu) return;
    const close = () => setCtxMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [!!ctxMenu]);

  // Fases del proyecto: se reconstruyen desde el campo service (los servicios
  // marcados al crear el proyecto), que sí persiste en la nube. Cada servicio
  // aporta su fase con sus tareas. Sin copias locales.
  const aiPhases = React.useMemo(() => {
    const cat = window.PROJECT_SERVICES || [];
    const labels = (p.service || "").split(",").map(s => s.trim()).filter(Boolean);
    const phases = labels.map(lbl => cat.find(sv => sv.label === lbl)).filter(Boolean)
      .map(sv => ({ name: sv.label, tasks: sv.tasks }));
    return phases.length ? phases : null;
  }, [p.id, p.service]);

  // Mapa título → fase, para agrupar cada tarea en su fase también tras recargar
  // (cuando el campo phase en memoria ya no está).
  const phaseOfTitle = React.useMemo(() => {
    const m = {};
    (aiPhases || []).forEach(ph => (ph.tasks || []).forEach(t => {
      m[(typeof t === "string" ? t : t.title)] = ph.name;
    }));
    return m;
  }, [aiPhases]);
  const taskPhase = (t) => t.phase || phaseOfTitle[t.title] || null;

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
    <div className="page wide" style={{maxWidth: 1500}}>
      <div style={{marginBottom: 16}}>
        <button className="btn ghost sm" onClick={() => navigate("projects")}>
          <Icon name="chevron" size={12} style={{transform:"rotate(180deg)"}}/> Proyectos
        </button>
      </div>

      <div className="page-head">
        <div>
          <div className="row tight" style={{marginBottom: 6}}>
            <span className={"dot " + p.light}/>
            <span className="muted small">{p.clientName}</span>
            <span className="vdiv"/>
            <span className="chip">{p.service}</span>
            <span className="vdiv"/>
            <span className="chip">{phase.label} · {phase.weeks}</span>
          </div>
          <h1>{p.name}</h1>
          <div className="row tight" style={{marginTop: 8, color:"var(--text-muted)", fontSize: 13}}>
            <span><Icon name="calendar" size={12}/> Entrega {p.deadline}</span>
            <span className="vdiv"/>
            <span>Revisiones {p.revisionsUsed}/2</span>
            <span className="vdiv"/>
            <span style={{display:"inline-flex", alignItems:"center", gap: 6}}>
              <span style={{width: 80}}><div className="progress"><i style={{width: liveProgress + "%"}}/></div></span>
              {liveProgress}%
            </span>
          </div>
        </div>
        <div className="row tight">
          <button className="btn primary" onClick={() => { setTab("tasks"); setAdding("todo"); }}><Icon name="plus" size={13}/> Tarea</button>
          <button className="btn danger" onClick={removeProjectFromHere}><Icon name="x" size={13}/> Eliminar</button>
        </div>
      </div>

      <div className="tabs">
        {[
          {id:"plan", label: aiPhases ? `Plan (${aiPhases.length} fases)` : "Plan"},
          {id:"tasks", label:"Tablero"},
        ].map(t => (
          <div key={t.id} className={"tab" + (tab === t.id ? " active" : "")} onClick={() => setTab(t.id)}>
            {t.label}{t.count != null ? <span className="count">{t.count}</span> : null}
          </div>
        ))}
      </div>

      <div style={{display:"grid", gridTemplateColumns:"1fr 280px", gap: 16}}>
        <div>
          {tab === "plan" && (
            aiPhases ? (
              <div className="card"><div className="card-body">
                <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16}}>
                  <div className="card-title">Roadmap · {aiPhases.reduce((n,ph)=>n+(ph.tasks?.length||0),0)} tareas</div>
                  <div className="row tight">
                    {aiPhases.map((ph,i) => {
                      const titles = (ph.tasks||[]).map(t => typeof t==="string"?t:t.title);
                      const done = projectTasks.filter(t=>titles.includes(t.title)&&t.column==="done").length;
                      const total = titles.length;
                      return <span key={i} className="chip" style={{fontSize:11}}>{ph.name} {done}/{total}</span>;
                    })}
                  </div>
                </div>
                <div style={{display:"flex", flexDirection:"column", gap:10}}>
                  {aiPhases.map((ph, pi) => {
                    const titles = (ph.tasks||[]).map(t=>typeof t==="string"?t:t.title);
                    const pTasks = projectTasks.filter(t=>titles.includes(t.title));
                    const done = pTasks.filter(t=>t.column==="done").length;
                    const pct = titles.length ? Math.round(done/titles.length*100) : 0;
                    return (
                      <div key={pi} style={{border:"0.5px solid var(--border)", borderRadius:12, overflow:"hidden"}}>
                        <div style={{padding:"11px 16px", background:"var(--bg-elev-2)", display:"flex", alignItems:"center", gap:12}}>
                          <div style={{flex:1}}>
                            <div style={{fontWeight:600, fontSize:14}}>{ph.name}</div>
                            {ph.description && <div style={{fontSize:12, color:"var(--text-subtle)", marginTop:1}}>{ph.description}</div>}
                          </div>
                          <div style={{fontSize:12, color:"var(--text-subtle)", flexShrink:0}}>{done}/{titles.length}</div>
                          <div style={{width:72, height:4, borderRadius:99, background:"var(--border)", overflow:"hidden", flexShrink:0}}>
                            <div style={{width:pct+"%", height:"100%", background:"var(--green)", borderRadius:99, transition:"width .3s"}}/>
                          </div>
                        </div>
                        <div style={{padding:"8px 12px", display:"flex", flexDirection:"column", gap:3}}>
                          {(ph.tasks||[]).map((task, ti) => {
                            const title = typeof task==="string"?task:task.title;
                            const matched = projectTasks.find(t=>t.title===title);
                            const isDone = matched?.column==="done";
                            const isActive = matched?.column==="doing";
                            const isReview = matched?.column==="review";
                            return (
                              <div key={ti} style={{display:"flex", alignItems:"center", gap:10, padding:"6px 8px", borderRadius:8, fontSize:13,
                                background: isActive ? "rgba(74,222,128,0.06)" : "transparent"}}>
                                <div style={{width:16, height:16, borderRadius:5, flexShrink:0, display:"grid", placeItems:"center",
                                  background: isDone ? "var(--green)" : "transparent",
                                  border: isDone ? "none" : "1.5px solid var(--border-strong)"}}>
                                  {isDone && <Icon name="check" size={10} style={{color:"#000"}}/>}
                                </div>
                                <span style={{flex:1, textDecoration: isDone ? "line-through" : "none",
                                  color: isDone ? "var(--text-subtle)" : "var(--text)"}}>{title}</span>
                                {isActive && <span className="chip green" style={{fontSize:10, padding:"1px 7px"}}>En curso</span>}
                                {isReview && <span className="chip amber" style={{fontSize:10, padding:"1px 7px"}}>Revisión</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div></div>
            ) : (
              <div className="card"><div className="card-body">
                <div className="card-title" style={{marginBottom: 14}}>Plan del proyecto</div>
                <Empty icon="list-todo" title="Sin roadmap generado" sub="Crea el próximo proyecto con Nora para generar un plan automático."/>
              </div></div>
            )
          )}

          {tab === "tasks" && (() => {
            // Filter tasks for current phase tab
            const visibleTasks = aiPhases && phaseTab
              ? projectTasks.filter(t => taskPhase(t) === phaseTab)
              : projectTasks;
            const vByCol = {
              todo:   visibleTasks.filter(t=>t.column==="todo"),
              doing:  visibleTasks.filter(t=>t.column==="doing"),
              review: visibleTasks.filter(t=>t.column==="review"),
              done:   visibleTasks.filter(t=>t.column==="done"),
            };
            return (
              <div>
                {/* Phase tabs */}
                {aiPhases && (
                  <div style={{display:"flex", gap:6, flexWrap:"wrap", marginBottom:14}}>
                    {aiPhases.map((ph, i) => {
                      const count = projectTasks.filter(t=>taskPhase(t)===ph.name).length;
                      const done = projectTasks.filter(t=>taskPhase(t)===ph.name&&t.column==="done").length;
                      const isActive = phaseTab === ph.name;
                      return (
                        <button key={i} onClick={() => setPhaseTab(ph.name)}
                          className={"chip" + (isActive ? " blue" : "")}
                          style={{cursor:"pointer", padding:"5px 12px", fontWeight: isActive ? 600 : 400}}>
                          {ph.name} · {done}/{count}
                        </button>
                      );
                    })}
                  </div>
                )}
                <div className="kanban">
                  {[{id:"todo",label:"Por hacer"},{id:"doing",label:"En curso"},{id:"review",label:"Revisión"},{id:"done",label:"Hecho"}].map(c => (
                    <div key={c.id}
                      className={"kanban-col" + (dragOver === c.id ? " drop" : "")}
                      onDragOver={e => onDragOver(e, c.id)}
                      onDrop={e => onDrop(e, c.id)}
                      onDragLeave={() => setDragOver(null)}>
                      <div className="kanban-head">
                        <span>{c.label}</span>
                        <span className="row tight">
                          <span className="muted xsmall">{vByCol[c.id].length}</span>
                          <button className="btn ghost icon-only sm" onClick={() => { setAdding(c.id); setDraft(""); }}><Icon name="plus" size={11}/></button>
                        </span>
                      </div>
                      <div className="kanban-body">
                        {vByCol[c.id].map(t => (
                          <div key={t.id} className="kanban-card"
                            draggable onDragStart={() => onDragStart(t.id)} onDragEnd={onDragEnd}
                            style={{cursor:"grab"}}
                            onContextMenu={e => { e.preventDefault(); setCtxMenu({x:e.clientX, y:e.clientY, taskId:t.id}); }}>
                            {editingId === t.id ? (
                              <input autoFocus className="input" value={editDraft}
                                onChange={e => setEditDraft(e.target.value)}
                                onKeyDown={e => {
                                  if(e.key==="Enter"){ D.updateTask(p.id, t.id, {title:editDraft.trim()||t.title}); setEditingId(null); }
                                  if(e.key==="Escape") setEditingId(null);
                                }}
                                onBlur={() => { if(editDraft.trim()) D.updateTask(p.id, t.id, {title:editDraft.trim()}); setEditingId(null); }}
                                style={{padding:"4px 6px", fontSize:13, width:"100%"}}/>
                            ) : (
                              <div style={{fontWeight:500}}>{t.title}</div>
                            )}
                            {datePicking === t.id && (
                              <input type="date" autoFocus className="input"
                                defaultValue={t.deadline||""}
                                onChange={e => { D.updateTask(p.id, t.id, {deadline:e.target.value}); setDatePicking(null); }}
                                onBlur={() => setDatePicking(null)}
                                style={{marginTop:5, fontSize:12, padding:"3px 6px"}}/>
                            )}
                            {t.deadline && datePicking !== t.id && (
                              <div style={{fontSize:11, color:"var(--text-subtle)", marginTop:3, display:"flex", alignItems:"center", gap:4}}>
                                <Icon name="calendar" size={10}/>{t.deadline}
                              </div>
                            )}
                            {taskPhase(t) && !phaseTab && <div className="muted xsmall" style={{marginTop:3}}>· {taskPhase(t)}</div>}
                            {t.assignee && t.assignee !== "Tú" && <div className="muted xsmall">· {t.assignee}</div>}
                          </div>
                        ))}
                        {adding === c.id && (
                          <div className="kanban-card" style={{padding:8}}>
                            <input autoFocus className="input" placeholder="Nombre de la tarea…"
                              value={draft} onChange={e => setDraft(e.target.value)}
                              onKeyDown={e => { if(e.key==="Enter") addTaskInline(c.id); if(e.key==="Escape"){setAdding(null);setDraft("");} }}
                              onBlur={() => addTaskInline(c.id)}
                              style={{padding:"6px 8px", fontSize:13}}/>
                          </div>
                        )}
                        {vByCol[c.id].length === 0 && adding !== c.id && (
                          <button className="btn ghost sm full" style={{justifyContent:"center", color:"var(--text-subtle)", border:"0.5px dashed var(--border-strong)"}}
                            onClick={() => { setAdding(c.id); setDraft(""); }}>
                            <Icon name="plus" size={11}/> Añadir tarea
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

        </div>

        {/* Panel derecho — datos reales del proyecto */}
        <div style={{display:"flex", flexDirection:"column", gap: 14}}>
          {/* Progreso */}
          <div className="card"><div className="card-body">
            <div style={{display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom: 10}}>
              <div className="card-title">Progreso</div>
              <div style={{fontSize:22, fontWeight:600}}>{liveProgress}<span style={{fontSize:14, color:"var(--text-subtle)"}}>%</span></div>
            </div>
            <div style={{height:6, borderRadius:99, background:"var(--border)", overflow:"hidden"}}>
              <div style={{width: liveProgress + "%", height:"100%", background:"var(--green)", borderRadius:99, transition:"width .3s"}}/>
            </div>
            <div className="muted xsmall" style={{marginTop: 8}}>{tasksByCol.done.length} de {projectTasks.length} tareas completadas</div>
          </div></div>

          {/* Resumen por estado */}
          <div className="card"><div className="card-body">
            <div className="card-title" style={{marginBottom: 10}}>Resumen de tareas</div>
            {[
              {id:"todo",   label:"Por hacer", dot:"var(--border-strong)"},
              {id:"doing",  label:"En curso",  dot:"var(--green)"},
              {id:"review", label:"Revisión",  dot:"var(--amber)"},
              {id:"done",   label:"Hecho",     dot:"var(--green)"},
            ].map((s, i) => (
              <div key={s.id} className="row tight" style={{padding:"7px 0", borderTop: i===0 ? "none" : "0.5px solid var(--border)"}}>
                <span style={{width:8, height:8, borderRadius:99, background:s.dot, flexShrink:0}}/>
                <div className="grow small">{s.label}</div>
                <span className="muted small">{tasksByCol[s.id].length}</span>
              </div>
            ))}
          </div></div>

          {/* Detalles */}
          <div className="card"><div className="card-body">
            <div className="card-title" style={{marginBottom: 10}}>Detalles</div>
            <div className="row between" style={{padding:"6px 0"}}>
              <span className="muted small">Cliente</span>
              <span className="small" style={{fontWeight:500}}>{p.clientName || "—"}</span>
            </div>
            <div className="row between" style={{padding:"6px 0", borderTop:"0.5px solid var(--border)"}}>
              <span className="muted small">Entrega</span>
              <span className="small" style={{fontWeight:500}}>{p.deadline || "—"}</span>
            </div>
            {aiPhases && aiPhases.length > 0 && (
              <div style={{padding:"8px 0 2px", borderTop:"0.5px solid var(--border)"}}>
                <div className="muted small" style={{marginBottom: 8}}>Servicios</div>
                <div className="row tight" style={{flexWrap:"wrap", gap: 6}}>
                  {aiPhases.map(ph => <span key={ph.name} className="chip" style={{fontSize:11}}>{ph.name}</span>)}
                </div>
              </div>
            )}
          </div></div>
        </div>
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
    </>
  );
};

window.AgencyProject = AgencyProject;

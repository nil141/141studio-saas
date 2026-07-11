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
  // Carpeta de Drive del proyecto (por ahora guardada localmente; la creación
  // automática llegará al conectar Google Drive).
  const [driveTick, setDriveTick] = useState(0);
  const [driveEditing, setDriveEditing] = useState(false);
  const [driveDraft, setDriveDraft] = useState("");

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
            {p.recurring && <><span className="vdiv"/><span className="chip" style={{fontSize:11, color:"var(--accent)"}}><Icon name="refresh-cw" size={10}/> Mensual</span></>}
            {aiPhases && <><span className="vdiv"/><span className="muted small">{aiPhases.length} fase{aiPhases.length===1?"":"s"}</span></>}
          </div>
          <h1>{p.name}</h1>
          <div className="row tight" style={{marginTop: 8, color:"var(--text-muted)", fontSize: 13}}>
            {p.deadline && p.deadline !== "—" && <span><Icon name="calendar" size={12}/> Entrega {p.deadline}</span>}
            {p.deadline && p.deadline !== "—" && <span className="vdiv"/>}
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

            return (
              <div style={{display:"flex", flexDirection:"column", gap:16}}>
                {/* Fases (solo seguimiento) */}
                <div className="card"><div className="card-body">
                  <div className="card-title" style={{marginBottom:14}}>Fases del proyecto</div>
                  {planGroups.length === 0 ? (
                    <Empty icon="list-todo" title="Sin fases" sub="Este proyecto no tiene fases. Añade tareas desde el Tablero."/>
                  ) : (
                    <div style={{display:"flex", flexDirection:"column", gap:10}}>
                      {planGroups.map((g, i) => {
                        const gDone = g.tasks.filter(t => t.column === "done").length;
                        const gPct = g.tasks.length ? Math.round(gDone / g.tasks.length * 100) : 0;
                        const st = phaseStatus(gDone, g.tasks.length);
                        const isReal = g.name !== "__otras__";
                        return (
                          <div key={g.name}
                            onClick={() => { if (isReal) { setTab("tasks"); setPhaseTab(g.name); } }}
                            style={{border:"0.5px solid var(--border)", borderRadius:12, padding:"14px 16px",
                              cursor: isReal ? "pointer" : "default", transition:"background .12s"}}
                            onMouseEnter={e => { if(isReal) e.currentTarget.style.background = "var(--bg-elev-2)"; }}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:10}}>
                              <span style={{width:22, height:22, borderRadius:99, flexShrink:0, display:"grid", placeItems:"center",
                                fontSize:11, fontWeight:600,
                                background: gPct===100 ? "var(--green)" : "var(--bg-elev-2)",
                                color: gPct===100 ? "#000" : "var(--text-subtle)",
                                border: gPct===100 ? "none" : "0.5px solid var(--border-strong)"}}>
                                {gPct===100 ? <Icon name="check" size={12}/> : (isReal ? i+1 : "·")}
                              </span>
                              <div style={{flex:1, fontWeight:600, fontSize:14.5}}>{g.label}</div>
                              <span className={"chip" + (st.cls ? " "+st.cls : "")} style={{fontSize:11}}>{st.label}</span>
                              {isReal && <Icon name="chevron" size={13} style={{color:"var(--text-subtle)", flexShrink:0}}/>}
                            </div>
                            <div style={{display:"flex", alignItems:"center", gap:12}}>
                              <div style={{flex:1, height:6, borderRadius:99, background:"var(--border)", overflow:"hidden"}}>
                                <div style={{width:gPct+"%", height:"100%", background: gPct===100 ? "var(--green)" : "var(--primary-600, #8277db)", borderRadius:99, transition:"width .3s"}}/>
                              </div>
                              <span className="muted xsmall" style={{flexShrink:0, width:64, textAlign:"right"}}>{gDone}/{g.tasks.length} · {gPct}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div></div>

                {/* Próximos vencimientos */}
                <div className="card"><div className="card-body">
                  <div className="card-title" style={{marginBottom:12}}>Próximos vencimientos</div>
                  {upcoming.length === 0 ? (
                    <div className="muted small" style={{padding:"6px 0"}}>
                      No hay tareas con fecha pendientes. Añade fechas a las tareas desde el Tablero (menú de cada tarea).
                    </div>
                  ) : (
                    <div style={{display:"flex", flexDirection:"column"}}>
                      {upcoming.map(({t, info}, i) => (
                        <div key={t.id} className="row tight" style={{padding:"10px 0", borderTop: i===0 ? "none" : "0.5px solid var(--border)"}}>
                          <span style={{width:8, height:8, borderRadius:99, background:info.color, flexShrink:0}}/>
                          <div className="grow" style={{minWidth:0}}>
                            <div className="small truncate">{t.title}</div>
                            {taskPhase(t) && <div className="subtle xsmall">{taskPhase(t)}</div>}
                          </div>
                          <div style={{textAlign:"right", flexShrink:0}}>
                            <div className="small" style={{fontWeight:500}}>{info.label}</div>
                            {info.tag && <div className="xsmall" style={{color:info.color}}>{info.tag}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div></div>
              </div>
            );
          })()}

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
    </>
  );
};

window.AgencyProject = AgencyProject;

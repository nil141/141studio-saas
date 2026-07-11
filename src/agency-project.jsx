// Agency Project detail — diseño único, básico e intuitivo para todos los proyectos
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

  const [addingPhase, setAddingPhase] = useState(null); // nombre de fase (o "__otras__") con input abierto
  const [draft, setDraft]     = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState("");

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

  // Mapa título → fase, para agrupar cada tarea en su fase también tras recargar.
  const phaseOfTitle = React.useMemo(() => {
    const m = {};
    (aiPhases || []).forEach(ph => (ph.tasks || []).forEach(t => {
      m[(typeof t === "string" ? t : t.title)] = ph.name;
    }));
    return m;
  }, [aiPhases]);
  const taskPhase = (t) => t.phase || phaseOfTitle[t.title] || null;

  const projectTasks = D.TASKS[p.id] || [];

  // Progreso real a partir de las tareas
  const doneCount = projectTasks.filter(t => t.column === "done").length;
  const liveProgress = projectTasks.length
    ? Math.round(doneCount / projectTasks.length * 100)
    : 0;

  // Agrupa las tareas por fase; lo que no encaje cae en "Otras tareas".
  const phaseNames = (aiPhases || []).map(ph => ph.name);
  const groups = phaseNames.map(name => ({
    name,
    tasks: projectTasks.filter(t => taskPhase(t) === name),
  }));
  const otherTasks = projectTasks.filter(t => !phaseNames.includes(taskPhase(t)));
  if (otherTasks.length || !aiPhases) {
    groups.push({ name: "__otras__", label: aiPhases ? "Otras tareas" : "Tareas", tasks: otherTasks });
  }

  const toggleDone = (t) => {
    D.moveTask(p.id, t.id, t.column === "done" ? "todo" : "done");
  };

  const addTaskInline = (phaseName) => {
    if (!draft.trim()) { setAddingPhase(null); setDraft(""); return; }
    D.addTask({ projectId: p.id, title: draft.trim(), column: "todo",
      phase: phaseName === "__otras__" ? null : phaseName });
    setDraft("");
    setAddingPhase(null);
  };

  const removeProjectFromHere = async () => {
    const ok = await confirm({
      title: `Eliminar el proyecto "${p.name}"?`,
      body: "Se eliminarán también sus tareas. Esta acción no se puede deshacer.",
      confirmLabel: "Sí, eliminar",
      danger: true,
    });
    if (ok) { D.deleteProject(p.id); toast("Proyecto eliminado", "success"); navigate("projects"); }
  };

  return (
    <div className="page" style={{maxWidth: 880}}>
      <div style={{marginBottom: 14}}>
        <button className="btn ghost sm" onClick={() => navigate("projects")}>
          <Icon name="chevron" size={12} style={{transform:"rotate(180deg)"}}/> Proyectos
        </button>
      </div>

      {/* Cabecera */}
      <div style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap: 16}}>
        <div>
          <div className="row tight" style={{marginBottom: 6, color:"var(--text-muted)", fontSize: 13}}>
            <span className={"dot " + p.light}/>
            <span>{p.clientName}</span>
            {p.deadline && <><span className="vdiv"/><span><Icon name="calendar" size={12}/> Entrega {p.deadline}</span></>}
          </div>
          <h1 style={{margin: 0}}>{p.name}</h1>
        </div>
        <button className="btn ghost sm" onClick={removeProjectFromHere} style={{flexShrink:0, color:"var(--text-subtle)"}}>
          <Icon name="x" size={13}/> Eliminar
        </button>
      </div>

      {/* Barra de progreso global */}
      <div style={{display:"flex", alignItems:"center", gap: 12, margin:"16px 0 26px"}}>
        <div style={{flex:1, height:6, borderRadius:99, background:"var(--border)", overflow:"hidden"}}>
          <div style={{width: liveProgress + "%", height:"100%", background:"var(--green)", borderRadius:99, transition:"width .3s"}}/>
        </div>
        <span className="muted small" style={{flexShrink:0}}>{doneCount}/{projectTasks.length} · {liveProgress}%</span>
      </div>

      {/* Fases con tareas — lista básica, sin tarjetas pesadas */}
      <div style={{display:"flex", flexDirection:"column", gap: 30}}>
        {groups.map((g) => {
          const gDone = g.tasks.filter(t => t.column === "done").length;
          const isAdding = addingPhase === g.name;
          return (
            <div key={g.name}>
              {/* Cabecera de fase */}
              <div style={{display:"flex", alignItems:"baseline", gap: 10, marginBottom: 6,
                paddingBottom: 8, borderBottom:"0.5px solid var(--border)"}}>
                <div style={{flex:1, fontWeight:600, fontSize:15}}>{g.label || g.name}</div>
                <div className="muted xsmall" style={{flexShrink:0}}>{gDone}/{g.tasks.length}</div>
              </div>

              {/* Tareas */}
              {g.tasks.map(t => {
                const isDone = t.column === "done";
                return (
                  <div key={t.id} className="task-row"
                    style={{display:"flex", alignItems:"center", gap: 11, padding:"9px 2px"}}>
                    <button onClick={() => toggleDone(t)} title={isDone ? "Marcar sin hacer" : "Marcar hecho"}
                      style={{flexShrink:0, width:19, height:19, borderRadius:6, cursor:"pointer", padding:0,
                        display:"grid", placeItems:"center",
                        background: isDone ? "var(--green)" : "transparent",
                        border: isDone ? "none" : "1.5px solid var(--border-strong)"}}>
                      {isDone && <Icon name="check" size={11} style={{color:"#000"}}/>}
                    </button>
                    {editingId === t.id ? (
                      <input autoFocus className="input" value={editDraft}
                        onChange={e => setEditDraft(e.target.value)}
                        onKeyDown={e => {
                          if(e.key==="Enter"){ if(editDraft.trim()) D.updateTask(p.id, t.id, {title:editDraft.trim()}); setEditingId(null); }
                          if(e.key==="Escape") setEditingId(null);
                        }}
                        onBlur={() => { if(editDraft.trim()) D.updateTask(p.id, t.id, {title:editDraft.trim()}); setEditingId(null); }}
                        style={{flex:1, padding:"4px 6px", fontSize:14}}/>
                    ) : (
                      <span onClick={() => { setEditingId(t.id); setEditDraft(t.title); }}
                        style={{flex:1, fontSize:14, cursor:"text",
                          textDecoration: isDone ? "line-through" : "none",
                          color: isDone ? "var(--text-subtle)" : "var(--text)"}}>{t.title}</span>
                    )}
                    <button className="task-del btn ghost icon-only sm"
                      onClick={() => { D.deleteTask(p.id, t.id); }}
                      style={{flexShrink:0, color:"var(--text-subtle)"}}>
                      <Icon name="x" size={12}/>
                    </button>
                  </div>
                );
              })}

              {/* Añadir tarea */}
              {isAdding ? (
                <div style={{display:"flex", alignItems:"center", gap: 11, padding:"9px 2px"}}>
                  <span style={{flexShrink:0, width:19, height:19, borderRadius:6, border:"1.5px dashed var(--border-strong)"}}/>
                  <input autoFocus className="input" placeholder="Nombre de la tarea…"
                    value={draft} onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => { if(e.key==="Enter") addTaskInline(g.name); if(e.key==="Escape"){setAddingPhase(null);setDraft("");} }}
                    onBlur={() => addTaskInline(g.name)}
                    style={{flex:1, padding:"5px 8px", fontSize:14}}/>
                </div>
              ) : (
                <button className="btn ghost sm"
                  onClick={() => { setAddingPhase(g.name); setDraft(""); }}
                  style={{justifyContent:"flex-start", color:"var(--text-subtle)", marginTop: 4, padding:"7px 2px"}}>
                  <Icon name="plus" size={12}/> Añadir tarea
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

window.AgencyProject = AgencyProject;

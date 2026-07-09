// Agency Projects list + Billing (MVP) + simple page + tasks board

// ── GeneralTaskCard — kanban card with hover state ───────────
const GeneralTaskCard = ({ t, onDelete, onUpdate, onToggle }) => {
  const [hover, setHover] = useState(false);
  const isDone = t.column === "done";
  return (
    <div
      className="kanban-card"
      style={{marginBottom:6, cursor:"default", gap:6}}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Title row with checkbox */}
      <div style={{display:"flex", alignItems:"flex-start", gap:8}}>
        <button
          onClick={onToggle}
          style={{
            width:16, height:16, borderRadius:"50%", flexShrink:0, marginTop:1,
            border: isDone ? "none" : "1.5px solid var(--border-strong)",
            background: isDone ? "var(--green)" : "transparent",
            display:"flex", alignItems:"center", justifyContent:"center",
            cursor:"pointer", padding:0, transition:"all .15s",
          }}>
          {isDone && <Icon name="check" size={9} style={{color:"#fff"}}/>}
        </button>
        <span style={{
          flex:1, fontWeight:500, fontSize:13, lineHeight:1.3,
          color: isDone ? "var(--text-subtle)" : "var(--text)",
          textDecoration: isDone ? "line-through" : "none",
        }}>{t.title}</span>
      </div>

      {/* Deadline */}
      {t.deadline && (
        <div style={{fontSize:11, color:"var(--amber)", paddingLeft:24}}>
          <Icon name="calendar" size={10} style={{verticalAlign:"middle", marginRight:3}}/>
          {new Date(t.deadline + "T00:00:00").toLocaleDateString("es-ES", { day:"numeric", month:"short" })}
        </div>
      )}

      {/* Bottom row: client name + dots (always reserve space) */}
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", paddingLeft:24}}>
        {t.clientName
          ? <span style={{fontSize:11, color:"var(--text-subtle)"}}>{t.clientName}</span>
          : <span/>
        }
        <div style={{visibility: hover ? "visible" : "hidden"}}>
          <TaskDotsMenu
            task={t}
            onDelete={onDelete}
            onUpdate={onUpdate}
            projectId="__none__"
          />
        </div>
      </div>
    </div>
  );
};

// ── GeneralTaskColumn — tasks without a project ──────────────
const GeneralTaskColumn = ({ tasks, toast, openModal }) => {
  const D = window.Data;
  const [doneOpen, setDoneOpen] = useState(false);
  const ACTIVE_COLS = ["todo","doing","review"];
  const COL_LABELS = { todo:"Por hacer", doing:"En curso", review:"Revisión" };
  const COL_COLORS = { todo:"var(--text-subtle)", doing:"var(--blue)", review:"var(--amber)" };

  const active = tasks.filter(t => t.column !== "done");
  const done   = tasks.filter(t => t.column === "done");

  const cardProps = (t) => ({
    t,
    onToggle: () => D.moveTask("__none__", t.id, t.column === "done" ? "todo" : "done"),
    onDelete: () => { D.deleteTask("__none__", t.id); toast("Tarea eliminada", "success"); },
    onUpdate: (ch) => { D.updateTask("__none__", t.id, ch); },
  });

  return (
    <div style={{
      width:300, flexShrink:0,
      background:"var(--bg-elev)",
      border:"0.5px solid var(--border)",
      borderRadius:14,
      display:"flex", flexDirection:"column",
      maxHeight:"calc(100vh - 160px)",
      overflow:"hidden",
    }}>
      {/* Header */}
      <div style={{
        padding:"14px 16px 12px",
        borderBottom:"0.5px solid var(--border)",
        background:"var(--bg-elev)",
      }}>
        <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:4}}>
          <span className="dot muted"/>
          <span style={{fontWeight:600, fontSize:14, letterSpacing:"-0.01em", flex:1}}>Sin proyecto</span>
          <button className="btn ghost icon-only sm" data-tooltip="Nueva tarea sin proyecto"
            onClick={() => openModal("newTask")}>
            <Icon name="plus" size={12}/>
          </button>
        </div>
        <div className="subtle xsmall">{active.length} pendiente{active.length !== 1 ? "s" : ""}</div>
      </div>

      {/* Task list */}
      <div style={{overflowY:"auto", flex:1, padding:"8px 0"}}>
        {active.length === 0 && (
          <div style={{padding:"24px 16px", textAlign:"center", color:"var(--text-subtle)", fontSize:12}}>
            Sin tareas pendientes
          </div>
        )}

        {ACTIVE_COLS.map(col => {
          const colTasks = active.filter(t => t.column === col);
          if (colTasks.length === 0) return null;
          return (
            <div key={col} style={{marginBottom:4}}>
              <div style={{
                fontSize:11, fontWeight:500, color:COL_COLORS[col],
                padding:"2px 16px 4px", letterSpacing:"0.01em",
              }}>{COL_LABELS[col]}</div>
              {colTasks.map(t => (
                <div key={t.id} style={{padding:"0 8px"}}>
                  <GeneralTaskCard {...cardProps(t)}/>
                </div>
              ))}
            </div>
          );
        })}

        {/* Completada section */}
        {done.length > 0 && (
          <>
            <button
              onClick={() => setDoneOpen(o => !o)}
              style={{
                display:"flex", alignItems:"center", gap:6, width:"100%",
                padding:"8px 16px", border:0, background:"transparent",
                color:"var(--text-subtle)", fontSize:12, fontWeight:500,
                cursor:"pointer", fontFamily:"inherit", textAlign:"left",
              }}>
              <Icon name="chevron" size={11} style={{transform: doneOpen ? "rotate(90deg)" : "rotate(0deg)", transition:"transform .15s"}}/>
              Completada ({done.length})
            </button>
            {doneOpen && done.map(t => (
              <div key={t.id} style={{padding:"0 8px"}}>
                <GeneralTaskCard {...cardProps(t)}/>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

// ── TasksBoard v2 — week view + grouped by client ────────────
const TasksBoard = ({ navigate, openModal, initialDate }) => {
  const D = window.Data;
  D.useStore();

  const [selectedDay, setSelectedDay] = useState(initialDate ? new Date(initialDate + "T12:00:00") : new Date());

  const [taskModal,      setTaskModal]      = useState(null); // { task, pid }
  const [hideCompleted,  setHideCompleted]  = useState(false);
  const [optionsOpen,    setOptionsOpen]    = useState(false);

  const DAY_ES  = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
  const MON_ES  = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  const C_DOTS  = ["#fb7185","#60a5fa","#fbbf24","#34d399","#a78bfa","#f472b6","#22d3ee","#f59e0b"];

  // Tira de días con scroll: se ven 7 (una semana) y se desliza para ver más.
  // Rango: 30 días atrás → 60 adelante (respecto a hoy).
  const stripDays = (() => {
    const base = new Date(); base.setHours(12, 0, 0, 0);
    return Array.from({ length: 91 }, (_, i) => {
      const d = new Date(base); d.setDate(base.getDate() - 30 + i); return d;
    });
  })();
  const stripRef = useRef(null);

  const todayMid = new Date(); todayMid.setHours(0,0,0,0);
  const selMid   = new Date(selectedDay); selMid.setHours(0,0,0,0);

  // Alinear la tira al LUNES de la semana del día seleccionado
  // (así se ve lunes→domingo; el ancho de día = 1/7 del contenedor visible)
  useEffect(() => {
    const el = stripRef.current; if (!el) return;
    const monday = new Date(selMid);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7)); // 0=Dom → retrocede a lunes
    const idx = stripDays.findIndex(d => {
      const m = new Date(d); m.setHours(0,0,0,0);
      return m.getTime() === monday.getTime();
    });
    if (idx < 0) return;
    const dayW = el.clientWidth / 7;
    el.scrollTo({ left: Math.max(0, idx * dayW), behavior: el.dataset.init ? "smooth" : "auto" });
    el.dataset.init = "1";
  }, [selectedDay]);

  // Solo tareas "vivas": de proyectos existentes + sueltas (__none__).
  // Excluye huérfanas de proyectos borrados, que inflaban los contadores.
  const _projIds = new Set(D.PROJECTS.map(p => p.id));
  const allTasks = Object.entries(D.TASKS)
    .filter(([pid]) => pid === "__none__" || _projIds.has(pid))
    .flatMap(([, arr]) => arr);

  // Selected day as YYYY-MM-DD string
  const selDateStr = (() => {
    const d = new Date(selectedDay);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  })();

  const todayStr = `${todayMid.getFullYear()}-${String(todayMid.getMonth()+1).padStart(2,'0')}-${String(todayMid.getDate()).padStart(2,'0')}`;
  const isToday  = selDateStr === todayStr;

  // Daily Progress — based on selected day's tasks (calculated after matchesDay/dayTasks below)
  // donePct is computed after dayTasks is defined

  // A task belongs to the selected day if it's due that day,
  // OR (viewing today) it's overdue and either still pending or completed today
  const matchesDay = t =>
    t.deadline === selDateStr ||
    (isToday && t.deadline && t.deadline < selDateStr && (t.column !== "done" || t.doneAt === todayStr));

  // Filter tasks to only those matching the selected day
  const dayTasks = allTasks.filter(matchesDay);

  // Los pasos de las rutinas del día también cuentan para el Daily Progress
  const dayRoutines = (D.routinesForDay ? D.routinesForDay(selDateStr) : []);
  let routineTotal = 0, routineDone = 0;
  dayRoutines.forEach(r => (r.items || []).forEach(it => {
    routineTotal += 1;
    if (D.routineItemDone(r.id, selDateStr, it.id)) routineDone += 1;
  }));

  const progressUnits = dayTasks.length + routineTotal;
  const donePct = progressUnits
    ? Math.round((dayTasks.reduce((s, t) => s + (t.column === "done" ? 100 : (t.progress || 0)), 0)
                  + routineDone * 100) / progressUnits)
    : 0;

  // Build groups: client → [projects + tasks]  — only with tasks for selected day
  const clientColorMap = {};
  D.CLIENTS.forEach((c, i) => { clientColorMap[c.id] = C_DOTS[i % C_DOTS.length]; });

  const groupMap = {};
  D.PROJECTS.forEach(p => {
    const tasks = (D.TASKS[p.id] || []).filter(matchesDay);
    const key   = p.clientId || "__nc";
    if (!groupMap[key]) {
      const cl = D.CLIENTS.find(c => c.id === p.clientId);
      groupMap[key] = {
        clientId: key,
        clientName: (cl?.company || p.clientName || "Sin cliente").toUpperCase(),
        color: clientColorMap[p.clientId] || "#a78bfa",
        projects: [],
      };
    }
    groupMap[key].projects.push({ project: p, tasks });
  });

  const groups = Object.values(groupMap);

  // __none__ tasks: only for selected day (or overdue when viewing today)
  const noProj = (D.TASKS["__none__"] || []).filter(matchesDay);
  const generalTasks = [];
  noProj.forEach(t => {
    if (t.clientId) {
      // Find or create the client group
      let grp = groups.find(g => g.clientId === t.clientId);
      if (!grp) {
        const cl = D.CLIENTS.find(c => c.id === t.clientId);
        grp = {
          clientId: t.clientId,
          clientName: (cl?.company || cl?.name || t.clientName || "Sin cliente").toUpperCase(),
          color: clientColorMap[t.clientId] || "#a78bfa",
          projects: [],
        };
        groups.push(grp);
      }
      // Add to a "no project" bucket within this client group
      let bucket = grp.projects.find(p => p.project === null && p._clientBucket);
      if (!bucket) { bucket = { project: null, tasks: [], _clientBucket: true }; grp.projects.push(bucket); }
      bucket.tasks.push(t);
    } else {
      generalTasks.push(t);
    }
  });
  if (generalTasks.length > 0) groups.push({
    clientId:"__general", clientName:"GENERAL",
    color:"var(--text-subtle)", projects:[{ project:null, tasks:generalTasks }],
  });

  const toggleDone = (pid, t) =>
    D.moveTask(pid, t.id, t.column === "done" ? "todo" : "done");

  return (
    <div
      onClick={() => setOptionsOpen(false)}
      style={{
        height:"100vh",
        display:"flex", flexDirection:"column",
        padding:"28px 32px 0",
        maxWidth:1400, margin:"0 auto",
        overflow:"hidden",
      }}
    >

      {/* Header — title + ActionPill (igual que el resto de páginas) */}
      <div className="page-head" style={{ flexShrink:0 }}>
        <div onClick={() => { if (!isToday) setSelectedDay(new Date()); }}
          data-tooltip={!isToday ? "Volver a hoy" : undefined}
          style={{ cursor: isToday ? "default" : "pointer" }}>
          <h1>Tareas</h1>
          <div className="sub">
            {(() => {
              const f = new Date(selectedDay).toLocaleDateString("es-ES", { weekday:"long", day:"numeric", month:"long", year:"numeric" });
              return f.charAt(0).toUpperCase() + f.slice(1);
            })()}
          </div>
        </div>
        <ActionPill
          plusActions={[
            { icon:"list-todo", label:"Nueva tarea", sub:"Una tarea puntual para un día.", accent:true,
              onClick:() => openModal("newTask", { date: selDateStr }) },
            { icon:"refresh-cw", label:"Nueva rutina", sub:"Una tarea que se repite en el tiempo.",
              onClick:() => openModal("newRoutine", { date: selDateStr }) },
          ]}
          moreActions={[
            { icon: hideCompleted ? "eye" : "eye-off",
              label: hideCompleted ? "Mostrar completadas" : "Ocultar completadas",
              onClick: () => setHideCompleted(h => !h) },
          ]}
        />
      </div>

      {/* Tira horizontal de días (scroll) + progreso */}
      <div style={{ borderBottom:"0.5px solid var(--border)", paddingBottom:18, marginBottom:0, flexShrink:0 }}>
        <style>{`.day-scroll::-webkit-scrollbar{display:none}`}</style>

        {/* Day strip — activity rings con scroll horizontal */}
        {(() => {
          return (
            <div ref={stripRef} className="day-scroll" style={{
              display:"flex", alignItems:"stretch", padding:"4px 0",
              overflowX:"auto", scrollbarWidth:"none", msOverflowStyle:"none",
              scrollSnapType:"x mandatory",
            }}>
              {stripDays.map((d, i) => {
                const dMid = new Date(d); dMid.setHours(0,0,0,0);
                const isSel = dMid.getTime() === selMid.getTime();
                const isToday = dMid.getTime() === todayMid.getTime();
                const dStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
                const tasksToday = allTasks.filter(t => t.deadline === dStr);
                let doneToday  = tasksToday.filter(t => t.column === "done").length;
                let totalToday = tasksToday.length;
                // Los pasos de las rutinas de ese día también cuentan en el aro
                (D.routinesForDay ? D.routinesForDay(dStr) : []).forEach(r => (r.items || []).forEach(it => {
                  totalToday += 1;
                  if (D.routineItemDone(r.id, dStr, it.id)) doneToday += 1;
                }));
                const loadPct    = totalToday ? Math.min(100, Math.round((doneToday/totalToday)*100)) : 0;
                const hasLoad    = totalToday > 0;

                const sz = 56;
                const r  = 24;
                const sw = 3;
                const c  = 2 * Math.PI * r;

                // Track + ring colors según estado
                const trackCol = isSel ? "rgba(158,154,229,0.18)"
                              : isToday ? "rgba(158,154,229,0.10)"
                              : "rgba(255,255,255,0.06)";
                const ringCol  = isSel ? "var(--accent)"
                              : isToday ? "rgba(158,154,229,0.65)"
                              : "rgba(255,255,255,0.35)";

                return (
                  <button key={d.toISOString()} onClick={() => setSelectedDay(new Date(d))} style={{
                    flex:"0 0 calc(100% / 7)", cursor:"pointer", border:"none", background:"transparent",
                    display:"flex", flexDirection:"column", alignItems:"center",
                    gap:8, padding:"6px 0",
                    scrollSnapAlign: d.getDay() === 1 ? "start" : "none",  // encaja por lunes
                    scrollSnapStop: d.getDay() === 1 ? "always" : "normal",
                    transition:"transform .25s cubic-bezier(0.34,1.2,0.46,1)",
                    transform: isSel ? "scale(1.04)" : "scale(1)",
                  }}>
                    {/* Eyebrow */}
                    <span style={{
                      fontSize:10, fontWeight:600,
                      color: isSel ? "var(--accent)" : isToday ? "var(--text-muted)" : "var(--text-subtle)",
                      letterSpacing:"0.16em", textTransform:"uppercase",
                      transition:"color .2s",
                    }}>
                      {["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"][d.getDay()]}
                    </span>

                    {/* Ring + número */}
                    <div style={{
                      position:"relative",
                      width:sz, height:sz,
                      display:"flex", alignItems:"center", justifyContent:"center",
                    }}>
                      <svg width={sz} height={sz} style={{ position:"absolute", inset:0, transform:"rotate(-90deg)" }}>
                        {/* Track completo */}
                        <circle cx={sz/2} cy={sz/2} r={r} fill="none"
                          stroke={trackCol} strokeWidth={sw}/>
                        {/* Progreso (sólo si hay carga) */}
                        {hasLoad && (
                          <circle cx={sz/2} cy={sz/2} r={r} fill="none"
                            stroke={ringCol} strokeWidth={sw} strokeLinecap="round"
                            strokeDasharray={`${(loadPct/100)*c} ${c}`}
                            style={{
                              transition:"stroke-dasharray .5s ease, stroke .25s",
                              filter: isSel ? "drop-shadow(0 0 6px rgba(158,154,229,0.55))" : "none",
                            }}/>
                        )}
                        {/* Punto "hoy" sobre el ring si está vacío */}
                        {!hasLoad && isToday && (
                          <circle cx={sz/2} cy={sz/2 - r} r={2.5}
                            fill="var(--accent)" transform={`rotate(90 ${sz/2} ${sz/2})`}/>
                        )}
                      </svg>

                      {/* Fondo del centro: tintado si seleccionado */}
                      {isSel && (
                        <div style={{
                          position:"absolute",
                          width:sz - sw*2 - 4, height:sz - sw*2 - 4,
                          borderRadius:"50%",
                          background:"radial-gradient(circle, rgba(158,154,229,0.22) 0%, rgba(158,154,229,0.05) 70%, transparent 100%)",
                        }}/>
                      )}

                      <span style={{
                        position:"relative", zIndex:1,
                        fontSize:18,
                        fontWeight: isToday || isSel ? 500 : 400,
                        color: isToday ? "var(--accent)" : isSel ? "#f0eeff" : "var(--text-muted)",
                        letterSpacing:"-0.6px",
                        lineHeight:1,
                        transition:"color .2s",
                      }}>
                        {d.getDate()}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })()}

        {/* Daily progress */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginTop:18 }}>
          <span style={{ fontSize:11, color:"var(--text-subtle)", letterSpacing:"0.05em", textTransform:"uppercase", fontWeight:500, flexShrink:0 }}>
            Daily Progress
          </span>
          <div style={{
            flex:1, height:12, borderRadius:99,
            border:"0.5px solid var(--border-strong)",
            background:"rgba(255,255,255,0.02)",
            padding:3, display:"flex", alignItems:"center",
          }}>
            <div style={{ width:`${donePct}%`, height:"100%", background:"var(--accent)", borderRadius:99, transition:"width .4s" }}/>
          </div>
          <span style={{ fontSize:12, color:"var(--text-muted)", fontWeight:500, flexShrink:0 }}>{donePct}%</span>
        </div>
      </div>

      {/* Zona scrollable: solo las tareas se deslizan */}
      <div className="tasks-scroll" style={{
        flex:1, minHeight:0,
        overflowY:"auto",
        scrollbarGutter:"stable",
        paddingRight:10, paddingTop:22, paddingBottom:8,
        WebkitMaskImage:"linear-gradient(to bottom, transparent 0, #000 22px, #000 calc(100% - 24px), transparent 100%)",
        maskImage:"linear-gradient(to bottom, transparent 0, #000 22px, #000 calc(100% - 24px), transparent 100%)",
      }}>

      <window.RoutineDayList day={selDateStr} onEdit={(r) => openModal("editRoutine", { routine: r })}/>

      {groups.length === 0 && D.routinesForDay(selDateStr).length === 0 && (
        <div style={{ textAlign:"center", padding:"60px 0", color:"var(--text-subtle)", fontSize:14, letterSpacing:"-0.5px" }}>
          Sin tareas para este día — <button className="btn ghost sm" onClick={() => openModal("newTask", { date: selDateStr })}>crear una</button>
        </div>
      )}

      {groups.map((group, gIdx) => (
        <div key={group.clientId} style={{ marginBottom: gIdx === groups.length - 1 ? 0 : 32 }}>
          {/* Client header */}
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:group.color, flexShrink:0 }}/>
            <span style={{ fontSize:12, fontWeight:400, letterSpacing:"0", textTransform:"uppercase", color:"#9e9e9e" }}>
              {group.clientName}
            </span>
          </div>

            {/* Task rows — no individual cards, flat rows with divider */}
            {group.projects.map(({ project, tasks }) => tasks.filter(t => !hideCompleted || t.column !== "done").map((t, idx, arr) => {
              const pid = project?.id || "__none__";
              const isDone = t.column === "done";
              const colLabel = { todo:"Por hacer", doing:"En curso", review:"Revisión" }[t.column];
              const isLast = idx === arr.length - 1;
              const prog = t.progress || 0;
              const isOverdue = isToday && t.deadline && t.deadline < selDateStr && !isDone;
              return (
                <div key={t.id}
                  onClick={() => setTaskModal({ task: t, pid })}
                  className="task-row"
                  style={{
                    display:"flex", alignItems:"center", gap:14,
                    padding:"12px 4px", cursor:"pointer",
                    borderBottom: isLast ? "none" : "0.5px solid var(--border)",
                  }}>
                  {/* Progress ring — same SVG weight for done and partial */}
                  {(() => {
                    const sz = 40, r = 17, circ = 2 * Math.PI * r;
                    return (
                      <div style={{ width:sz, height:sz, flexShrink:0, position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <svg width={sz} height={sz} style={{ position:"absolute", top:0, left:0 }}>
                          <circle cx={sz/2} cy={sz/2} r={r} fill="none"
                            stroke={isDone ? "var(--accent)" : "rgba(255,255,255,0.12)"} strokeWidth="2"/>
                          {!isDone && prog > 0 && (
                            <circle cx={sz/2} cy={sz/2} r={r} fill="none"
                              stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"
                              strokeDasharray={`${(prog/100)*circ} ${circ}`}
                              transform={`rotate(-90,${sz/2},${sz/2})`}/>
                          )}
                        </svg>
                        {isDone
                          ? <Icon name="check" size={15} style={{ color:"var(--accent)", position:"relative" }}/>
                          : <Icon name="x" size={11} style={{ color:"rgba(255,255,255,0.22)", position:"relative" }}/>
                        }
                      </div>
                    );
                  })()}
                  {/* Title + subtitle */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, letterSpacing:"-0.5px", color: isDone ? "var(--text-subtle)" : "var(--text)" }}>
                      {t.title}
                    </div>
                    <div style={{ fontSize:11, color: isOverdue ? "var(--red)" : "var(--text-subtle)", marginTop:2, letterSpacing:"-0.2px" }}>
                      {project ? project.name : (isDone ? "Completada" : colLabel || "Por hacer")}
                      {t.deadline ? ` · ${new Date(t.deadline+"T00:00:00").toLocaleDateString("es-ES",{day:"numeric",month:"short"})}` : ""}
                      {isOverdue ? " · Vencida" : ""}
                    </div>
                  </div>
                  <Icon name="chevron-right" size={14} style={{ color:"rgba(255,255,255,0.15)", flexShrink:0 }}/>
                </div>
              );
            }))}

          {gIdx !== groups.length - 1 && (
            <div className="client-divider" style={{ height:"0.5px", background:"var(--border)", marginTop:4 }}/>
          )}
        </div>
      ))}

      </div>

      {taskModal && (
        <TaskProgressModal
          task={taskModal.task}
          projectId={taskModal.pid}
          open={true}
          onClose={() => setTaskModal(null)}
          onDelete={() => {
            window.Data.deleteTask(taskModal.pid, taskModal.task.id);
            setTaskModal(null);
          }}
          onUpdate={changes => {
            window.Data.updateTask(taskModal.pid, taskModal.task.id, changes);
          }}
        />
      )}
    </div>
  );
};

const ProjectTaskColumn = ({ project: p, navigate, toast }) => {
  const D = window.Data;
  const [draft, setDraft] = useState("");
  const [adding, setAdding] = useState(false);
  const [doneOpen, setDoneOpen] = useState(false);
  const inputRef = useRef(null);

  const allTasks = D.TASKS[p.id] || [];
  const active = allTasks.filter(t => t.column !== "done");
  const done   = allTasks.filter(t => t.column === "done");

  const commitAdd = () => {
    if (draft.trim()) {
      D.addTask({ projectId: p.id, title: draft.trim(), column: "todo" });
      toast("Tarea añadida", "success");
    }
    setDraft("");
    setAdding(false);
  };

  const toggleDone = (t) => {
    D.moveTask(p.id, t.id, t.column === "done" ? "todo" : "done");
  };

  const remove = (t) => {
    D.deleteTask(p.id, t.id);
  };

  const update = (t, changes) => {
    D.updateTask(p.id, t.id, changes);
  };

  const COL_COLORS = { todo:"var(--text-subtle)", doing:"var(--blue)", review:"var(--amber)", done:"var(--green)" };
  const COL_LABELS = { todo:"Por hacer", doing:"En curso", review:"Revisión", done:"Hecho" };

  return (
    <div style={{
      width: 300, flexShrink: 0,
      background:"var(--bg-elev)",
      border:"0.5px solid var(--border)",
      borderRadius:14,
      display:"flex", flexDirection:"column",
      maxHeight:"calc(100vh - 160px)",
      overflow:"hidden",
    }}>
      {/* Column header */}
      <div style={{
        padding:"14px 16px 12px",
        borderBottom:"0.5px solid var(--border)",
        position:"sticky", top:0,
        background:"var(--bg-elev)",
        zIndex:1,
      }}>
        <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:4}}>
          <span className={"dot " + p.light}/>
          <span style={{fontWeight:600, fontSize:14, letterSpacing:"-0.01em", flex:1}}>{p.name}</span>
          <button className="btn ghost icon-only sm" data-tooltip="Añadir tarea"
            onClick={() => setAdding(true)}>
            <Icon name="plus" size={12}/>
          </button>
          <button className="btn ghost icon-only sm" data-tooltip="Abrir proyecto"
            onClick={() => navigate("project", { projectId: p.id })}>
            <Icon name="external-link" size={12}/>
          </button>
        </div>
        <div className="subtle xsmall">{p.clientName} · {active.length} pendiente{active.length !== 1 ? "s" : ""}</div>

        {/* Inline add input (only shown when adding) */}
        {adding && (
          <div style={{marginTop:10, display:"flex", gap:6, alignItems:"center"}}>
            <input
              ref={inputRef}
              autoFocus
              className="input"
              placeholder="Nueva tarea…"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") commitAdd(); if (e.key === "Escape") { setAdding(false); setDraft(""); } }}
              onBlur={commitAdd}
              style={{height:30, fontSize:13, flex:1}}
            />
          </div>
        )}
      </div>

      {/* Task list */}
      <div style={{overflowY:"auto", flex:1, padding:"8px 0"}}>
        {active.length === 0 && !adding && (
          <div style={{padding:"24px 16px", textAlign:"center", color:"var(--text-subtle)", fontSize:12}}>
            Sin tareas pendientes
          </div>
        )}

        {active.map(t => (
          <TaskRow key={t.id} task={t} onToggle={() => toggleDone(t)} onDelete={() => remove(t)} onUpdate={ch => update(t, ch)} COL_COLORS={COL_COLORS} COL_LABELS={COL_LABELS} projectId={p.id}/>
        ))}

        {/* Done section */}
        {done.length > 0 && (
          <>
            <button
              onClick={() => setDoneOpen(o => !o)}
              style={{
                display:"flex", alignItems:"center", gap:6, width:"100%",
                padding:"8px 16px", border:0, background:"transparent",
                color:"var(--text-subtle)", fontSize:12, fontWeight:500,
                cursor:"pointer", fontFamily:"inherit", textAlign:"left",
              }}>
              <Icon name="chevron" size={11} style={{transform: doneOpen ? "rotate(90deg)" : "rotate(0deg)", transition:"transform .15s"}}/>
              Completada ({done.length})
            </button>
            {doneOpen && done.map(t => (
              <TaskRow key={t.id} task={t} onToggle={() => toggleDone(t)} onDelete={() => remove(t)} onUpdate={ch => update(t, ch)} COL_COLORS={COL_COLORS} COL_LABELS={COL_LABELS} isDone projectId={p.id}/>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

const TaskDotsMenu = ({ task: t, onDelete, onUpdate }) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState(null); // null | "deadline"
  const [dateVal, setDateVal] = useState(t.deadline || "");
  const [pos, setPos] = useState({ top:0, left:0 });
  const btnRef = useRef(null);
  const panelRef = useRef(null);

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target) &&
          btnRef.current && !btnRef.current.contains(e.target)) {
        setOpen(false); setMode(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const toggleOpen = (e) => {
    e.stopPropagation();
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const panelH = mode === "deadline" ? 130 : 90;
      const spaceBelow = window.innerHeight - r.bottom;
      const top = spaceBelow < panelH + 8 ? r.top - panelH - 4 : r.bottom + 4;
      setPos({ top, left: r.right - 190 });
    }
    setOpen(o => !o);
    setMode(null);
  };

  const saveDeadline = () => {
    onUpdate({ deadline: dateVal || null });
    setOpen(false); setMode(null);
  };

  const panel = open ? ReactDOM.createPortal(
    <div ref={panelRef} style={{
      position:"fixed", top: pos.top, left: pos.left, zIndex:9999,
      background:"var(--bg-elev)", border:"0.5px solid var(--border)",
      borderRadius:10, boxShadow:"0 8px 24px rgba(0,0,0,0.22)",
      minWidth:190, overflow:"hidden",
    }}>
      {mode === null && (
        <>
          <button onClick={() => setMode("deadline")} style={{
            display:"flex", alignItems:"center", gap:10, width:"100%",
            padding:"10px 14px", border:0, background:"transparent",
            color:"var(--text)", fontSize:13, cursor:"pointer",
            fontFamily:"inherit", textAlign:"left",
          }}
          onMouseEnter={e => e.currentTarget.style.background="var(--bg-hover)"}
          onMouseLeave={e => e.currentTarget.style.background="transparent"}>
            <Icon name="calendar" size={13}/> Añadir fecha límite
          </button>
          <div style={{height:"0.5px", background:"var(--border)", margin:"2px 0"}}/>
          <button onClick={() => { setOpen(false); onDelete(); }} style={{
            display:"flex", alignItems:"center", gap:10, width:"100%",
            padding:"10px 14px", border:0, background:"transparent",
            color:"var(--red)", fontSize:13, cursor:"pointer",
            fontFamily:"inherit", textAlign:"left",
          }}
          onMouseEnter={e => e.currentTarget.style.background="var(--bg-hover)"}
          onMouseLeave={e => e.currentTarget.style.background="transparent"}>
            <Icon name="trash" size={13}/> Eliminar
          </button>
        </>
      )}
      {mode === "deadline" && (
        <div style={{padding:"12px 14px"}}>
          <div style={{fontSize:12, fontWeight:500, color:"var(--text-subtle)", marginBottom:8}}>Fecha límite</div>
          <input type="date" className="input" value={dateVal}
            onChange={e => setDateVal(e.target.value)} autoFocus
            style={{width:"100%", height:32, fontSize:13, marginBottom:8}}/>
          <div style={{display:"flex", gap:6}}>
            <button className="btn primary sm" onClick={saveDeadline} style={{flex:1, fontSize:12}}>Guardar</button>
            <button className="btn ghost sm" onClick={() => setMode(null)} style={{fontSize:12}}>Atrás</button>
          </div>
        </div>
      )}
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button ref={btnRef} onClick={toggleOpen} style={{
        border:0, background:"transparent", padding:"2px 4px", cursor:"pointer",
        color:"var(--text-subtle)", display:"flex", alignItems:"center",
        borderRadius:4, fontSize:15, letterSpacing:"0.05em", lineHeight:1,
        fontWeight:700, flexShrink:0,
      }}>···</button>
      {panel}
    </>
  );
};

const TaskRow = ({ task: t, onToggle, onDelete, onUpdate, COL_COLORS, COL_LABELS, isDone, projectId }) => {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display:"flex", alignItems:"center", gap:10,
        padding:"7px 16px",
        background: hover ? "var(--bg-hover)" : "transparent",
        transition:"background .08s",
      }}>
      {/* Checkbox */}
      <button
        onClick={onToggle}
        style={{
          width:18, height:18, borderRadius:"50%", flexShrink:0,
          border: isDone ? "none" : "1.5px solid var(--border-strong)",
          background: isDone ? "var(--green)" : "transparent",
          display:"flex", alignItems:"center", justifyContent:"center",
          cursor:"pointer", padding:0, transition:"all .15s",
        }}>
        {isDone && <Icon name="check" size={10} style={{color:"#fff"}}/>}
      </button>
      {/* Title + deadline */}
      <div style={{flex:1, minWidth:0}}>
        <span style={{
          fontSize:13, lineHeight:1.4,
          color: isDone ? "var(--text-subtle)" : "var(--text)",
          textDecoration: isDone ? "line-through" : "none",
        }}>{t.title}</span>
        {t.deadline && (
          <div style={{fontSize:11, color:"var(--amber)", marginTop:1}}>
            <Icon name="calendar" size={10} style={{verticalAlign:"middle", marginRight:3}}/>
            {new Date(t.deadline + "T00:00:00").toLocaleDateString("es-ES", { day:"numeric", month:"short" })}
          </div>
        )}
        {t.subtasks && t.subtasks.length > 0 && (
          <div style={{fontSize:11, color:"var(--text-subtle)", marginTop:1}}>
            {t.subtasks.filter(s=>s.done).length}/{t.subtasks.length} subtareas
          </div>
        )}
      </div>
      {/* Column badge (only on active tasks) */}
      {!isDone && t.column !== "todo" && (
        <span style={{
          fontSize:10.5, padding:"1px 6px", borderRadius:99,
          background:"transparent", border:"0.5px solid var(--border)",
          color: COL_COLORS[t.column], flexShrink:0,
        }}>{COL_LABELS[t.column]}</span>
      )}
      {/* Three-dots menu on hover */}
      {hover && (
        <TaskDotsMenu task={t} onDelete={onDelete} onUpdate={onUpdate} projectId={projectId}/>
      )}
    </div>
  );
};


const AgencyProjects = ({ navigate, openModal }) => {
  const D = window.Data;
  D.useStore();
  const confirm = useConfirm();
  const toast = useToast();
  const [hoverId, setHoverId] = useState(null);
  const _lightColor = (l) => l === "red" ? "var(--red)" : l === "amber" ? "var(--amber)" : l === "green" ? "var(--green)" : "var(--accent)";
  const cap = D.PROJECTS.length;
  const capColor = cap === 0 ? "green" : cap <= 3 ? "green" : cap === 4 ? "amber" : "red";
  const capLabel = cap === 0 ? "Sin proyectos" : cap <= 3 ? "Zona cómoda" : cap === 4 ? "Zona de atención" : "Zona de riesgo";

  const removeProject = async (p, e) => {
    e?.stopPropagation();
    const ok = await confirm({
      title: `Eliminar el proyecto "${p.name}"?`,
      body: "Se eliminarán también sus entregables. Esta acción no se puede deshacer.",
      confirmLabel: "Sí, eliminar",
      danger: true,
    });
    if (ok) { D.deleteProject(p.id); toast("Proyecto eliminado", "success"); }
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Proyectos</h1>
          <div className="sub">{cap} en marcha · {capLabel}</div>
        </div>
        <ActionPill
          plusActions={() => openModal("newProject")}
          moreActions={[
            { icon: "refresh-cw", label: "Actualizar lista", onClick: () => D.reload && D.reload() },
          ]}
        />
      </div>

      <div style={{ display:"flex", flexDirection:"column", width:"100%" }}>
        {D.PROJECTS.map(p => {
          const pTasks = D.TASKS[p.id] || [];
          const doneN = pTasks.filter(t => t.column === "done").length;
          const liveProgress = pTasks.length ? Math.round(doneN / pTasks.length * 100) : 0;
          const col = _lightColor(p.light);
          const on = hoverId === p.id;
          return (
            <div key={p.id} onClick={() => navigate("project", { projectId: p.id })}
              onMouseEnter={() => setHoverId(p.id)} onMouseLeave={() => setHoverId(null)}
              style={{ display:"flex", flexDirection:"column", gap:12, padding:"18px 6px", cursor:"pointer",
                borderBottom:"0.5px solid var(--border)" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:14, minWidth:0 }}>
                  <Icon name="package" size={22} strokeWidth={1.6}
                    style={{ color:"var(--text)", flexShrink:0, transform: on ? "scale(1.06)" : "none", transition:"transform .3s" }}/>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:17, color:"var(--text)", letterSpacing:"-0.4px", lineHeight:1.2,
                      whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.name}</div>
                    <div style={{ fontSize:12.5, color:"var(--text-muted)", marginTop:3, display:"flex", alignItems:"center", gap:6, minWidth:0 }}>
                      <span style={{ flexShrink:0 }}>{pTasks.length} {pTasks.length === 1 ? "tarea" : "tareas"}</span>
                      <span style={{ opacity:0.4, fontSize:10 }}>•</span>
                      <span style={{ flexShrink:0 }}>{doneN} hechas</span>
                      {p.clientName && <>
                        <span style={{ opacity:0.4, fontSize:10 }}>•</span>
                        <span style={{ whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.clientName}</span>
                      </>}
                    </div>
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
                  <button className="btn ghost icon-only sm" data-tooltip="Eliminar"
                    onClick={(e) => removeProject(p, e)}
                    style={{ opacity: on ? 0.65 : 0, transition:"opacity .15s", color:"var(--red)" }}>
                    <Icon name="trash" size={13}/>
                  </button>
                  <Icon name="chevron-right" size={18}
                    style={{ color: on ? "var(--text)" : "var(--text-muted)", transform: on ? "translateX(3px)" : "none",
                      transition:"all .2s", flexShrink:0 }}/>
                </div>
              </div>
              <div style={{ position:"relative", width:"100%", height:3, background:"rgba(255,255,255,0.05)", borderRadius:99, overflow:"hidden" }}>
                <div style={{ position:"absolute", height:"100%", borderRadius:99, background:col, width:`${liveProgress}%`, transition:"width .3s" }}/>
              </div>
            </div>
          );
        })}

        {/* Añadir proyecto — botón discontinuo estilo outdomode */}
        <button onClick={() => openModal("newProject")} style={{
          marginTop:16, width:"100%", padding:"26px", borderRadius:22,
          border:"1px dashed var(--border)", background:"transparent", cursor:"pointer",
          color:"var(--text-muted)", fontSize:15, fontFamily:"inherit", opacity:0.5, transition:"opacity .2s",
          display:"flex", alignItems:"center", justifyContent:"center", gap:8, letterSpacing:"-0.2px",
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = 0.85}
          onMouseLeave={e => e.currentTarget.style.opacity = 0.5}>
          {D.PROJECTS.length === 0 ? "Crea tu primer proyecto" : "Añadir proyecto"} <Icon name="plus" size={16}/>
        </button>
      </div>
    </div>
  );
};

// ── helpers Stripe ────────────────────────────────────────────
const _stripeApi = async (endpoint, body = {}) => {
  const res = await window.apiFetch(`/api/stripe/${endpoint}`, body);
  return res.json();
};

const _cents = (n, cur = "eur") => {
  const sym = { eur:"€", usd:"$", gbp:"£" }[cur] || "€";
  return `${sym}${(n / 100).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const _tsDate = (ts) => {
  if (!ts) return "—";
  const d = new Date(ts * 1000);
  const M = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${d.getDate()} ${M[d.getMonth()]} ${d.getFullYear()}`;
};

// ── Gráfico SVG de ingresos ───────────────────────────────────
const RevenueChart = ({ buckets, loading }) => {
  const [mouseX, setMouseX] = useState(null);
  const svgRef = React.useRef(null);
  const W = 900, H = 280;
  const P = { t: 16, r: 4, b: 38, l: 4 };
  const cW = W - P.l - P.r, cH = H - P.t - P.b;

  if (loading) return (
    <div style={{height:H, display:"flex", alignItems:"center", justifyContent:"center", color:"var(--text-subtle)", fontSize:13}}>
      Cargando datos…
    </div>
  );
  if (!buckets || !buckets.length) return null;

  const maxAmt = Math.max(...buckets.map(b => b.amount), 1);
  const toX = i => P.l + (buckets.length > 1 ? (i / (buckets.length - 1)) : 0.5) * cW;
  const toY = v => P.t + cH - (v / maxAmt) * cH;

  const pts  = buckets.map((b, i) => ({ ...b, x: toX(i), y: toY(b.amount) }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  const area = `${line} L${pts[pts.length-1].x.toFixed(2)},${(P.t+cH).toFixed(2)} L${pts[0].x.toFixed(2)},${(P.t+cH).toFixed(2)} Z`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1];
  const xStep  = Math.max(1, Math.floor(buckets.length / 6));

  // Hover: guide line tracks exact mouse, dot snaps to nearest point
  const cx = mouseX !== null ? Math.max(P.l, Math.min(P.l + cW, mouseX)) : null;
  const hoverPt = (mouseX !== null && pts.length)
    ? pts.reduce((a, b) => Math.abs(a.x - mouseX) < Math.abs(b.x - mouseX) ? a : b)
    : null;
  // Tooltip: clamp so it doesn't overflow either edge
  const tooltipLeft = cx !== null
    ? `${Math.min(Math.max((cx / W) * 100, 10), 78)}%`
    : "50%";

  return (
    <div style={{position:"relative", userSelect:"none"}} onMouseLeave={() => setMouseX(null)}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`}
        style={{width:"100%", height:"auto", display:"block"}}
        onMouseMove={e => {
          const r = svgRef.current.getBoundingClientRect();
          setMouseX((e.clientX - r.left) / r.width * W);
        }}>
        <defs>
          <linearGradient id="rGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="var(--accent)" stopOpacity="0.16"/>
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/>
          </linearGradient>
        </defs>

        {/* Y grid + labels (overlaid on chart) */}
        {yTicks.map((f, i) => {
          const y = P.t + cH * (1 - f);
          return (
            <g key={i}>
              <line x1={P.l} y1={y} x2={P.l + cW} y2={y}
                stroke="var(--border)" strokeWidth="0.5"/>
              {f > 0 && (
                <text x={P.l + 8} y={y - 5} textAnchor="start"
                  fontSize="11" fill="var(--text-subtle)">{_cents(maxAmt * f)}</text>
              )}
            </g>
          );
        })}

        {/* Area + line */}
        <path d={area} fill="url(#rGrad)"/>
        <path d={line} fill="none" stroke="var(--accent)" strokeWidth="2"
          strokeLinejoin="round" strokeLinecap="round"/>

        {/* X labels */}
        {buckets.map((b, i) => {
          if (i % xStep !== 0 && i !== buckets.length - 1) return null;
          return (
            <text key={i} x={toX(i)} y={H - 10} textAnchor="middle"
              fontSize="11" fill="var(--text-subtle)">{b.label}</text>
          );
        })}

        {/* Guide line (follows mouse exactly) + dot (snaps to nearest point) */}
        {cx !== null && (
          <>
            <line x1={cx} y1={P.t} x2={cx} y2={P.t + cH}
              stroke="var(--border-strong)" strokeWidth="1" strokeDasharray="4,3"/>
            {hoverPt && (
              <circle cx={hoverPt.x} cy={hoverPt.y} r="5"
                fill="var(--accent)" stroke="var(--bg-elev)" strokeWidth="2.5"/>
            )}
          </>
        )}
      </svg>

      {/* Tooltip follows guide line */}
      {hoverPt && cx !== null && (
        <div style={{
          position:"absolute", top:20, left:tooltipLeft,
          transform:"translateX(-50%)", pointerEvents:"none",
          background:"var(--bg-elev-2)", border:"0.5px solid var(--border-strong)",
          borderRadius:9, padding:"7px 12px", fontSize:12,
          boxShadow:"0 6px 20px rgba(0,0,0,0.3)", whiteSpace:"nowrap",
        }}>
          <div style={{fontSize:11, color:"var(--text-subtle)", marginBottom:2}}>{hoverPt.label}</div>
          <div style={{fontWeight:600, fontSize:15, color:"var(--text)"}}>{_cents(hoverPt.amount)}</div>
          {hoverPt.count > 0 && (
            <div style={{fontSize:11, color:"var(--text-subtle)", marginTop:1}}>
              {hoverPt.count} cobro{hoverPt.count !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Modal crear factura Stripe ────────────────────────────────
const CreateInvoiceModal = ({ open, onClose, onCreated }) => {
  const D = window.Data;
  const toast = useToast();

  // Cliente combobox
  const [clientSearch,   setClientSearch]   = useState("");
  const [clientOpen,     setClientOpen]     = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  // Proyecto
  const [selectedProject, setSelectedProject] = useState(null);
  // Campos factura
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [amount,  setAmount]  = useState("");
  const [cur,     setCur]     = useState("eur");
  const [desc,    setDesc]    = useState("");
  const [dueDays, setDueDays] = useState(30);
  const [sendNow, setSendNow] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState("");

  const reset = () => {
    setClientSearch(""); setClientOpen(false);
    setSelectedClient(null); setSelectedProject(null);
    setName(""); setEmail(""); setAmount(""); setDesc(""); setErr("");
  };

  // Clientes filtrados por búsqueda
  const allClients = D.CLIENTS || [];
  const filteredClients = clientSearch.trim()
    ? allClients.filter(c =>
        c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
        c.company.toLowerCase().includes(clientSearch.toLowerCase()))
    : allClients;

  // Proyectos del cliente seleccionado
  const clientProjects = selectedClient
    ? (D.PROJECTS || []).filter(p => p.clientId === selectedClient.id)
    : [];

  const pickClient = (c) => {
    setSelectedClient(c);
    setClientSearch(c.name + (c.company ? ` — ${c.company}` : ""));
    setClientOpen(false);
    setName(c.name);
    setEmail(c.email || "");
    setSelectedProject(null);
    setAmount("");
  };

  const pickProject = (p) => {
    setSelectedProject(p);
    setDesc(p.name);
    if (p.budget && p.budget > 0) setAmount(String(p.budget));
  };

  const create = async () => {
    if (!email.trim() || !amount || parseFloat(amount) <= 0) {
      setErr("Email e importe son obligatorios."); return;
    }
    setLoading(true); setErr("");
    try {
      const res = await _stripeApi("create_invoice", {
        name, email: email.trim(), amount: parseFloat(amount),
        currency: cur, description: desc || "Servicio",
        due_days: dueDays, send_now: sendNow,
      });
      if (res.ok) {
        toast(`Factura ${res.number || res.invoice_id} creada${sendNow ? " y enviada" : ""}`, "success");
        reset(); onClose(); onCreated && onCreated();
      } else {
        setErr(res.error || "Error al crear la factura");
      }
    } catch (e) {
      setErr("Error de conexión con el servidor");
    }
    setLoading(false);
  };

  if (!open) return null;
  const inputStyle = { height: 38, fontSize: 13 };
  const labelStyle = { display:"block", fontSize:11, color:"var(--text-subtle)", marginBottom:4, fontWeight:500 };

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:300,
      background:"rgba(0,0,0,0.55)", display:"flex", alignItems:"center", justifyContent:"center",
    }} onClick={e => { if (e.target === e.currentTarget) { reset(); onClose(); }}}>
      <div style={{
        width:480, background:"var(--bg-elev)", border:"0.5px solid var(--border-strong)",
        borderRadius:16, padding:28, boxShadow:"0 24px 64px rgba(0,0,0,0.5)",
      }} onClick={e => { e.stopPropagation(); setClientOpen(false); }}>
        <div style={{display:"flex", alignItems:"center", marginBottom:20}}>
          <div style={{flex:1}}>
            <div style={{fontWeight:600, fontSize:16}}>Nueva factura</div>
            <div style={{fontSize:12, color:"var(--text-subtle)", marginTop:2}}>Se crea directamente en Stripe</div>
          </div>
          <button className="btn ghost icon-only sm" onClick={() => { reset(); onClose(); }}>
            <Icon name="x" size={14}/>
          </button>
        </div>

        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12}}>

          {/* ── Combobox cliente ── */}
          <div style={{gridColumn:"1/-1", position:"relative"}} onClick={e => e.stopPropagation()}>
            <label style={labelStyle}>Cliente</label>
            <div style={{position:"relative"}}>
              <Icon name="search" size={13} style={{position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"var(--text-subtle)", pointerEvents:"none"}}/>
              <input
                className="input"
                value={clientSearch}
                onChange={e => { setClientSearch(e.target.value); setClientOpen(true); setSelectedClient(null); }}
                onFocus={() => setClientOpen(true)}
                placeholder="Buscar o escribir cliente…"
                style={{...inputStyle, paddingLeft:32}}
              />
              {selectedClient && (
                <button onClick={() => { setClientSearch(""); setSelectedClient(null); setSelectedProject(null); setEmail(""); setName(""); setAmount(""); }}
                  style={{position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", border:0, background:"transparent", cursor:"pointer", color:"var(--text-subtle)", padding:2}}>
                  <Icon name="x" size={11}/>
                </button>
              )}
            </div>
            {clientOpen && filteredClients.length > 0 && (
              <div style={{
                position:"absolute", top:"100%", left:0, right:0, zIndex:20, marginTop:4,
                background:"var(--bg-elev)", border:"0.5px solid var(--border-strong)",
                borderRadius:10, boxShadow:"0 8px 24px rgba(0,0,0,0.35)",
                maxHeight:200, overflowY:"auto",
              }}>
                {filteredClients.map(c => (
                  <div key={c.id}
                    onClick={() => pickClient(c)}
                    style={{
                      display:"flex", alignItems:"center", gap:10,
                      padding:"8px 12px", cursor:"pointer",
                      background: selectedClient?.id === c.id ? "var(--accent-soft)" : "transparent",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
                    onMouseLeave={e => e.currentTarget.style.background = selectedClient?.id === c.id ? "var(--accent-soft)" : "transparent"}>
                    <span style={{
                      width:28, height:28, borderRadius:"50%", flexShrink:0,
                      background: c.color || "var(--accent)", display:"flex",
                      alignItems:"center", justifyContent:"center",
                      fontSize:10, fontWeight:700, color:"#fff",
                    }}>{c.initials}</span>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontSize:13, fontWeight:500}}>{c.name}</div>
                      <div style={{fontSize:11, color:"var(--text-subtle)"}}>{c.company} · {c.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Proyecto (solo si hay cliente) ── */}
          {clientProjects.length > 0 && (
            <div style={{gridColumn:"1/-1"}}>
              <label style={labelStyle}>Proyecto <span style={{color:"var(--text-subtle)", fontWeight:400}}>(opcional)</span></label>
              <div style={{display:"flex", gap:6, flexWrap:"wrap"}}>
                {clientProjects.map(p => (
                  <button key={p.id}
                    onClick={() => pickProject(selectedProject?.id === p.id ? null : p)}
                    style={{
                      padding:"5px 12px", borderRadius:99, fontSize:12, cursor:"pointer",
                      border: `1px solid ${selectedProject?.id === p.id ? "var(--accent)" : "var(--border-strong)"}`,
                      background: selectedProject?.id === p.id ? "var(--accent-soft)" : "var(--bg-elev-2)",
                      color: selectedProject?.id === p.id ? "var(--accent)" : "var(--text)",
                      transition:"all .1s",
                    }}>
                    {p.name}
                    {p.budget > 0 && <span style={{marginLeft:6, opacity:0.6}}>€{p.budget}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Email */}
          <div style={{gridColumn:"1/-1"}}>
            <label style={labelStyle}>Email *</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="cliente@empresa.com" style={inputStyle}/>
          </div>

          {/* Importe + divisa */}
          <div>
            <label style={labelStyle}>Importe *</label>
            <div style={{position:"relative"}}>
              <span style={{position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:13, color:"var(--text-muted)"}}>
                {cur === "eur" ? "€" : cur === "usd" ? "$" : "£"}
              </span>
              <input className="input" type="number" min="0.01" step="0.01" value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0,00" style={{...inputStyle, paddingLeft:28}}/>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Divisa</label>
            <select className="input" value={cur} onChange={e => setCur(e.target.value)} style={{...inputStyle, cursor:"pointer"}}>
              <option value="eur">EUR — Euro</option>
              <option value="usd">USD — Dólar</option>
              <option value="gbp">GBP — Libra</option>
            </select>
          </div>

          {/* Descripción */}
          <div style={{gridColumn:"1/-1"}}>
            <label style={labelStyle}>Descripción</label>
            <input className="input" value={desc} onChange={e => setDesc(e.target.value)}
              placeholder="Ej: Diseño web — mayo 2026" style={inputStyle}/>
          </div>

          {/* Vencimiento + toggle enviar */}
          <div>
            <label style={labelStyle}>Vencimiento</label>
            <select className="input" value={dueDays} onChange={e => setDueDays(parseInt(e.target.value))} style={{...inputStyle, cursor:"pointer"}}>
              {[7,14,30,45,60].map(d => <option key={d} value={d}>{d} días</option>)}
            </select>
          </div>
          <div style={{display:"flex", alignItems:"center", gap:10, paddingTop:18}}>
            <button onClick={() => setSendNow(v => !v)}
              style={{
                width:36, height:20, borderRadius:10, border:0, cursor:"pointer", padding:0,
                background: sendNow ? "var(--accent)" : "var(--bg-elev-2)",
                position:"relative", transition:"background .15s", flexShrink:0,
              }}>
              <span style={{
                position:"absolute", top:2, left: sendNow ? 18 : 2,
                width:16, height:16, borderRadius:"50%",
                background: sendNow ? "var(--accent-fg)" : "var(--text-subtle)",
                transition:"left .15s",
              }}/>
            </button>
            <span style={{fontSize:12, color:"var(--text-muted)"}}>Enviar al cliente ahora</span>
          </div>
        </div>

        {err && (
          <div style={{display:"flex", gap:8, padding:"8px 12px", background:"var(--red-soft)",
            border:"0.5px solid var(--red)", borderRadius:8, marginBottom:12, fontSize:12, color:"var(--red)"}}>
            <Icon name="alert-triangle" size={13} style={{flexShrink:0, marginTop:1}}/>{err}
          </div>
        )}

        <div style={{display:"flex", gap:8, justifyContent:"flex-end"}}>
          <button className="btn ghost sm" onClick={() => { reset(); onClose(); }}>Cancelar</button>
          <button className="btn primary sm" onClick={create} disabled={loading || !email || !amount}>
            {loading ? "Creando…" : sendNow ? <><Icon name="send" size={12}/> Crear y enviar</> : <><Icon name="plus" size={12}/> Crear factura</>}
          </button>
        </div>
      </div>
    </div>
  );
};

const STRIPE_STATUS = {
  paid:          { label: "Pagada",     color: "var(--green)",   bg: "var(--green-soft)"  },
  open:          { label: "Pendiente",  color: "var(--amber)",   bg: "var(--amber-soft)"  },
  draft:         { label: "Borrador",   color: "var(--text-subtle)", bg: "var(--bg-elev-2)" },
  void:          { label: "Anulada",    color: "var(--text-subtle)", bg: "var(--bg-elev-2)" },
  uncollectible: { label: "Incobrable", color: "var(--red)",     bg: "var(--red-soft)"    },
  succeeded:     { label: "Pagado",     color: "var(--green)",   bg: "var(--green-soft)"  },
  failed:        { label: "Fallido",    color: "var(--red)",     bg: "var(--red-soft)"    },
};

const StripeChip = ({ status }) => {
  const s = STRIPE_STATUS[status] || { label: status, color: "var(--text-muted)", bg: "var(--bg-elev-2)" };
  return (
    <span style={{
      display:"inline-flex", alignItems:"center",
      padding:"2px 8px", borderRadius:99, fontSize:11, fontWeight:500,
      color: s.color, background: s.bg,
    }}>{s.label}</span>
  );
};

const PERIODS = [
  { id:"7d",  label:"7 días"  },
  { id:"30d", label:"30 días" },
  { id:"3m",  label:"3 meses" },
  { id:"12m", label:"1 año"   },
];

// ── Finanzas: control manual de gastos y suscripciones (localStorage) ──
const FIN_KEY  = "141_finance_v1";
const FIN_CATS = ["Software", "Hosting", "Marketing", "Publicidad", "Oficina", "Impuestos", "Freelance", "Otros"];

const _eur = (n) => "€" + (Number(n) || 0).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const _finLoad = () => {
  const d = (window.Data && window.Data.FINANCE) || {};
  return { subs: d.subs || [], expenses: d.expenses || [] };
};
// Guardar en la nube (sin localStorage): la fuente de verdad es el servidor
const _finSave = (d) => { try { window.Data.saveFinance(d); } catch (e) {} };
const _finId = () => (window.crypto && crypto.randomUUID ? crypto.randomUUID() : "id" + Date.now() + Math.floor(Math.random() * 1e6));
const _subMonthly = (s) => (s.cycle === "yearly" ? (Number(s.amount) || 0) / 12 : (Number(s.amount) || 0));
const _sameMonth = (iso) => { if (!iso) return false; const d = new Date(iso); const n = new Date(); return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth(); };
const _todayISO = () => new Date().toISOString().slice(0, 10);
const _finDate = (iso) => { if (!iso) return "—"; const d = new Date(iso); const M = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"]; return isNaN(d) ? "—" : `${d.getDate()} ${M[d.getMonth()]} ${d.getFullYear()}`; };

const FIN_INPUT = {
  padding: "9px 11px", borderRadius: 9, fontSize: 13, fontFamily: "inherit",
  background: "var(--bg-elev)", border: "0.5px solid var(--border)", color: "var(--text)",
  outline: "none", letterSpacing: "-0.2px", width: "100%",
};
const FIN_CYCLES = [{ id: "monthly", label: "Mensual" }, { id: "yearly", label: "Anual" }];

// Colores de serie del gráfico — mismo lenguaje que el área de Campañas
// (primary-600 de outdomode para la serie principal).
const FIN_SERIES = { rec: "#8277db", pun: "#199e70" };

// Curva suave (Catmull-Rom → Bézier). Los puntos de control se acotan en Y al
// rango del segmento para evitar el overshoot (la curva hundiéndose bajo un tramo plano).
const _finSmooth = (pts) => {
  if (pts.length < 2) return "";
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const yMin = Math.min(p1[1], p2[1]), yMax = Math.max(p1[1], p2[1]);
    const clampY = (y) => Math.max(yMin, Math.min(yMax, y));
    const c1y = clampY(p1[1] + (p2[1] - p0[1]) / 6);
    const c2y = clampY(p2[1] - (p3[1] - p1[1]) / 6);
    d += `C${p1[0] + (p2[0] - p0[0]) / 6},${c1y},${p2[0] - (p3[0] - p1[0]) / 6},${c2y},${p2[0]},${p2[1]}`;
  }
  return d;
};

// Gráfico de líneas: recurrente vs puntual, últimos 6 meses. Crosshair + tooltip al pasar el ratón.
const FinTrendChart = ({ trend, single = false }) => {
  const [hov, setHov] = useState(null); // { i: índice de mes, px, py: posición del ratón en px }
  const W = 600, H = 150, PX = 10, PY = 14;
  const maxV = Math.max(...(single ? trend.map(t => t.total) : [...trend.map(t => t.rec), ...trend.map(t => t.puntual)]), 1) * 1.15;
  const x = (i) => PX + i * (W - 2 * PX) / (trend.length - 1);
  const y = (v) => H - PY - (v / maxV) * (H - 2 * PY);
  const recPts = trend.map((t, i) => [x(i), y(t.rec)]);
  const punPts = trend.map((t, i) => [x(i), y(t.puntual)]);
  const totPts = trend.map((t, i) => [x(i), y(t.total)]);
  const baseY = H - PY;
  const areaOf = (pts) => { const c = _finSmooth(pts); return c ? `${c}L${pts[pts.length-1][0]},${baseY}L${pts[0][0]},${baseY}Z` : ""; };

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - r.left, py = e.clientY - r.top;
    const relX = px / r.width * W;
    let best = 0, bd = Infinity;
    trend.forEach((t, i) => { const d = Math.abs(x(i) - relX); if (d < bd) { bd = d; best = i; } });
    setHov({ i: best, px, py, w: r.width, h: r.height });
  };

  // Posición del punto activo en % del área del gráfico. El punto y el tooltip
  // son capas HTML: dentro del SVG estirado el círculo se deformaba en elipse.
  const dotLeftPct = hov !== null ? (x(hov.i) / W) * 100 : 0;
  const dotTopPct  = hov !== null ? (y(trend[hov.i].total) / H) * 100 : 0;
  const flip       = hov !== null && (dotLeftPct / 100) * (hov.w || 600) > (hov.w || 600) - 230;

  return (
    <div style={{ position:"relative", flex:1, minHeight:0, display:"flex", flexDirection:"column" }}>
      <div style={{ position:"relative", flex:1, minHeight:0 }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
          style={{ display:"block", cursor:"crosshair" }}
          onMouseMove={onMove} onMouseLeave={() => setHov(null)}>
          <defs>
            <linearGradient id="finGradRec" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={FIN_SERIES.rec} stopOpacity="0.3"/>
              <stop offset="95%" stopColor={FIN_SERIES.rec} stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="finGradPun" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={FIN_SERIES.pun} stopOpacity="0.22"/>
              <stop offset="95%" stopColor={FIN_SERIES.pun} stopOpacity="0"/>
            </linearGradient>
          </defs>
          {/* Líneas de referencia punteadas (como el área de Campañas) */}
          {[0, 0.25, 0.5, 0.75, 1].map(f => (
            <line key={f} x1={PX} x2={W - PX} y1={PY + f * (H - 2 * PY)} y2={PY + f * (H - 2 * PY)}
              stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" strokeWidth="1" vectorEffect="non-scaling-stroke"/>
          ))}
          {/* Crosshair — en single: línea blanca del punto a la base, como outdomode */}
          {hov !== null && (single ? (
            <line x1={x(hov.i)} x2={x(hov.i)} y1={y(trend[hov.i].total)} y2={baseY + 4}
              stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
          ) : (
            <line x1={x(hov.i)} x2={x(hov.i)} y1={PY - 4} y2={H - PY + 4}
              stroke="rgba(255,255,255,0.18)" strokeWidth="1" vectorEffect="non-scaling-stroke"/>
          ))}
          {/* Áreas y curvas — en modo single, una sola línea morada (total) como outdomode */}
          {single ? (
            <>
              <path d={areaOf(totPts)} fill="url(#finGradRec)" stroke="none"/>
              <path d={_finSmooth(totPts)} fill="none" stroke={FIN_SERIES.rec} strokeWidth="3"
                strokeLinecap="round" vectorEffect="non-scaling-stroke"/>
            </>
          ) : (
            <>
              <path d={areaOf(punPts)} fill="url(#finGradPun)" stroke="none"/>
              <path d={areaOf(recPts)} fill="url(#finGradRec)" stroke="none"/>
              <path d={_finSmooth(punPts)} fill="none" stroke={FIN_SERIES.pun} strokeWidth="2.5"
                strokeLinecap="round" vectorEffect="non-scaling-stroke"/>
              <path d={_finSmooth(recPts)} fill="none" stroke={FIN_SERIES.rec} strokeWidth="3"
                strokeLinecap="round" vectorEffect="non-scaling-stroke"/>
              {(hov !== null ? [hov.i] : [trend.length - 1]).map(i => (
                <g key={i}>
                  <circle cx={x(i)} cy={y(trend[i].rec)} r="3.5" fill={FIN_SERIES.rec} stroke="var(--bg-elev)" strokeWidth="2"/>
                  <circle cx={x(i)} cy={y(trend[i].puntual)} r="3.5" fill={FIN_SERIES.pun} stroke="var(--bg-elev)" strokeWidth="2"/>
                </g>
              ))}
            </>
          )}
        </svg>

        {/* Punto activo + tooltip estilo outdomode (solo single) */}
        {single && hov !== null && (
          <>
            <div style={{
              position:"absolute", left:`${dotLeftPct}%`, top:`${dotTopPct}%`,
              transform:"translate(-50%,-50%)", width:15, height:15, borderRadius:"50%",
              background:FIN_SERIES.rec, border:"3px solid #fff",
              boxShadow:"0 2px 10px rgba(0,0,0,0.45)", pointerEvents:"none", zIndex:4,
            }}/>
            {/* Tooltip compacto (~50px) anclado al punto activo (a ~10px a su derecha,
                algo por debajo) con deslizamiento de 400ms, como el
                recharts-tooltip-wrapper de outdomode: translate(x_punto+10, y_punto+…) */}
            <div style={{
              position:"absolute", left:0, top:0,
              transform:
                `translate(${(dotLeftPct / 100) * (hov.w || 0) + (flip ? -12 : 12)}px, ${Math.max(8, Math.min((dotTopPct / 100) * (hov.h || 150) + 18, (hov.h || 150) - 60))}px)`
                + (flip ? " translateX(-100%)" : ""),
              transition:"transform 400ms",
              background:"rgba(32,32,36,0.85)",
              backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
              border:"0.5px solid rgba(255,255,255,0.08)",
              borderRadius:14, padding:"9px 16px", pointerEvents:"none", zIndex:5,
              boxShadow:"0 12px 36px rgba(0,0,0,0.45)", whiteSpace:"nowrap",
            }}>
              <div style={{ fontSize:12.5, color:"var(--text-muted)", letterSpacing:"-0.2px" }}>{trend[hov.i].full}</div>
              <div style={{ fontSize:17, fontWeight:600, letterSpacing:"-0.4px", fontVariantNumeric:"tabular-nums", color:"var(--text)", marginTop:1 }}>{_eur(trend[hov.i].total)}</div>
            </div>
          </>
        )}
      </div>
      {/* Etiquetas de mes — 12px text-muted, como el eje de outdomode */}
      <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 2px 0", flexShrink:0 }}>
        {trend.map((t, i) => (
          <span key={t.key} style={{ fontSize:12, color: hov && hov.i === i ? "var(--text)" : "var(--text-muted)", letterSpacing:"-0.1px", transition:"color .1s" }}>
            {t.label}
          </span>
        ))}
      </div>
      {/* Tooltip clásico de dos series (Gastos) — sigue al ratón */}
      {!single && hov !== null && (
        <div style={{
          position:"absolute",
          left: hov.px > (hov.w || 0) - 190 ? hov.px - 16 : hov.px + 16,
          transform: hov.px > (hov.w || 0) - 190 ? "translateX(-100%)" : "none",
          top: hov.py,
          background:"#1c1c1f", border:"0.5px solid rgba(255,255,255,0.12)",
          borderRadius:10, padding:"8px 11px", pointerEvents:"none", zIndex:5,
          boxShadow:"0 8px 24px rgba(0,0,0,0.45)", whiteSpace:"nowrap",
        }}>
          <div style={{ fontSize:10.5, color:"var(--text-subtle)", marginBottom:5, letterSpacing:"0.04em", textTransform:"uppercase" }}>{trend[hov.i].full}</div>
          <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, marginBottom:3 }}>
            <span style={{ width:7, height:7, borderRadius:99, background:FIN_SERIES.rec, flexShrink:0 }}/>
            <span style={{ color:"var(--text-muted)" }}>Recurrente</span>
            <span style={{ fontVariantNumeric:"tabular-nums", marginLeft:"auto", paddingLeft:10 }}>{_eur(trend[hov.i].rec)}</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12 }}>
            <span style={{ width:7, height:7, borderRadius:99, background:FIN_SERIES.pun, flexShrink:0 }}/>
            <span style={{ color:"var(--text-muted)" }}>Puntual</span>
            <span style={{ fontVariantNumeric:"tabular-nums", marginLeft:"auto", paddingLeft:10 }}>{_eur(trend[hov.i].puntual)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const AgencyBilling = () => {
  const toast = useToast();
  const [data, setData] = useState(_finLoad);
  const [tab, setTab]   = useState("subs"); // subs | expenses
  const [addOpen, setAddOpen] = useState(false);
  const [finType, setFinType] = useState("sub"); // "sub" | "exp" — tipo dentro del pop-up
  const blankSub = { name: "", amount: "", cycle: "monthly", category: "Software", nextRenewal: "" };
  const blankExp = { date: _todayISO(), concept: "", amount: "", category: "Software" };
  const [subForm, setSubForm] = useState(blankSub);
  const [expForm, setExpForm] = useState(blankExp);

  const persist = (next) => { setData(next); _finSave(next); };

  // Cuando el servidor sincroniza las finanzas (otro dispositivo / primer login), recargar
  useEffect(() => {
    const onSync = () => setData(_finLoad());
    window.addEventListener("141-userdata-synced", onSync);
    return () => window.removeEventListener("141-userdata-synced", onSync);
  }, []);

  const saveSub = () => {
    if (!subForm.name.trim() || !(Number(subForm.amount) > 0)) { toast("Pon nombre e importe", "error"); return; }
    const sub = { id: _finId(), name: subForm.name.trim(), amount: Number(subForm.amount), cycle: subForm.cycle, category: subForm.category, nextRenewal: subForm.nextRenewal, active: true };
    persist({ ...data, subs: [sub, ...data.subs] });
    setSubForm(blankSub); setAddOpen(false); setTab("subs"); toast("Suscripción añadida", "success");
  };
  const toggleSub = (id) => persist({ ...data, subs: data.subs.map(s => s.id === id ? { ...s, active: !s.active } : s) });
  const delSub = (id) => persist({ ...data, subs: data.subs.filter(s => s.id !== id) });

  const saveExp = () => {
    if (!expForm.concept.trim() || !(Number(expForm.amount) > 0)) { toast("Pon concepto e importe", "error"); return; }
    const exp = { id: _finId(), date: expForm.date || _todayISO(), concept: expForm.concept.trim(), amount: Number(expForm.amount), category: expForm.category };
    persist({ ...data, expenses: [exp, ...data.expenses] });
    setExpForm(blankExp); setAddOpen(false); setTab("expenses"); toast("Gasto añadido", "success");
  };
  const delExp = (id) => persist({ ...data, expenses: data.expenses.filter(e => e.id !== id) });

  const activeSubs  = data.subs.filter(s => s.active);
  const recurringMo = activeSubs.reduce((a, s) => a + _subMonthly(s), 0);
  const expMonth    = data.expenses.filter(e => _sameMonth(e.date)).reduce((a, e) => a + (Number(e.amount) || 0), 0);
  const totalMonth  = recurringMo + expMonth;

  // ── Serie mensual (últimos 6 meses) para el gráfico ──
  // El recurrente se calcula por mes: cada suscripción cuenta desde su fecha de
  // renovación (cuando empezó a pagarse), nunca antes. Sin fecha → desde el mes actual.
  const MES_ES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  const trend = (() => {
    const now = new Date();
    const nowKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const subStartKey = (s) => {
      if (!s.nextRenewal) return nowKey;
      const k = s.nextRenewal.slice(0, 7); // YYYY-MM
      return k < nowKey ? k : nowKey;      // si la renovación es futura, ya se paga ahora
    };
    return Array.from({ length: 6 }, (_, k) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - k), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const puntual = data.expenses
        .filter(e => (e.date || "").startsWith(key))
        .reduce((a, e) => a + (Number(e.amount) || 0), 0);
      const rec = activeSubs
        .filter(s => subStartKey(s) <= key)
        .reduce((a, s) => a + _subMonthly(s), 0);
      return { key, label: MES_ES[d.getMonth()], full: `${MES_ES[d.getMonth()]} ${d.getFullYear()}`, puntual, rec, total: puntual + rec };
    });
  })();
  const deltaPct = trend[4].total > 0
    ? Math.round(((trend[5].total - trend[4].total) / trend[4].total) * 100)
    : null;

  // ── Desglose por categoría (este mes) ──
  const byCat = {};
  activeSubs.forEach(s => { byCat[s.category] = (byCat[s.category] || 0) + _subMonthly(s); });
  data.expenses.filter(e => _sameMonth(e.date)).forEach(e => { byCat[e.category] = (byCat[e.category] || 0) + (Number(e.amount) || 0); });
  const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const catMax = cats.length ? cats[0][1] : 1;

  return (
    <div style={{
      height:"100vh", display:"flex", flexDirection:"column",
      padding:"28px 32px 0", maxWidth:1400, margin:"0 auto", overflow:"hidden",
    }}>
      {/* Header — título + ActionPill (igual que el resto de páginas) */}
      <div className="page-head" style={{ flexShrink:0 }}>
        <div>
          <h1>Gastos</h1>
          <div className="sub">
            {_eur(totalMonth)} este mes · {activeSubs.length} suscripci{activeSubs.length === 1 ? "ón" : "ones"} activa{activeSubs.length === 1 ? "" : "s"}
          </div>
        </div>
        <ActionPill
          plusActions={() => { setFinType(tab === "expenses" ? "exp" : "sub"); setAddOpen(true); }}
        />
      </div>

      {/* ── Fila de gráficos: tendencia + categorías + stats ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1.8fr 1fr 0.72fr", gap:14, marginBottom:20, flexShrink:0, height:248 }}>

        {/* Card A — Gasto mensual (líneas). zIndex para que el tooltip pinte sobre las tarjetas vecinas */}
        <div className="card" style={{ padding:"16px 18px 14px", display:"flex", flexDirection:"column", overflow:"visible", position:"relative", zIndex:2 }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:10 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:600, color:"var(--text-subtle)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>
                Gasto mensual
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:26, fontWeight:400, letterSpacing:"-1.1px", fontVariantNumeric:"tabular-nums", lineHeight:1 }}>
                  {_eur(totalMonth)}
                </span>
                <TrendDelta pct={deltaPct} goodUp={false} suffix={`vs ${trend[4].label.toLowerCase()}`}/>
              </div>
            </div>
            {/* Leyenda */}
            <div style={{ display:"flex", gap:14, paddingTop:2 }}>
              {[["Recurrente", FIN_SERIES.rec], ["Puntual", FIN_SERIES.pun]].map(([lbl, col]) => (
                <span key={lbl} style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:11, color:"var(--text-muted)" }}>
                  <span style={{ width:7, height:7, borderRadius:99, background:col }}/>
                  {lbl}
                </span>
              ))}
            </div>
          </div>
          <FinTrendChart trend={trend}/>
        </div>

        {/* Card B — Por categoría (barras) */}
        <div className="card" style={{ padding:"16px 18px", display:"flex", flexDirection:"column" }}>
          <div style={{ fontSize:11, fontWeight:600, color:"var(--text-subtle)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:14, flexShrink:0 }}>
            Por categoría · este mes
          </div>
          <div style={{ flex:1, minHeight:0, overflow:"hidden", display:"flex", flexDirection:"column", gap:13 }}>
            {cats.length === 0 ? (
              <div style={{ color:"var(--text-subtle)", fontSize:13, letterSpacing:"-0.3px" }}>Sin datos todavía.</div>
            ) : cats.map(([cat, amt]) => (
              <div key={cat}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:5 }}>
                  <span style={{ color:"var(--text-muted)", letterSpacing:"-0.2px" }}>{cat}</span>
                  <span style={{ fontVariantNumeric:"tabular-nums", color:"var(--text)" }}>{_eur(amt)}</span>
                </div>
                <div style={{ height:4, borderRadius:99, background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${Math.max(3, (amt / catMax) * 100)}%`, background:FIN_SERIES.rec, borderRadius:99, transition:"width .3s" }}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card C — Mini stats en columna */}
        <div className="card" style={{ padding:"16px 18px", display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
          {[
            { label: "Recurrente",     value: _eur(recurringMo),      sub: "al mes" },
            { label: "Puntual",        value: _eur(expMonth),         sub: "este mes" },
            { label: "Anual estimado", value: _eur(recurringMo * 12), sub: "solo suscripciones" },
          ].map((m, i) => (
            <div key={m.label} style={{
              paddingTop: i === 0 ? 0 : 12,
              borderTop: i === 0 ? "none" : "0.5px solid var(--border)",
            }}>
              <div style={{ fontSize:10.5, fontWeight:600, color:"var(--text-subtle)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:5 }}>
                {m.label}
              </div>
              <div style={{ fontSize:18, fontWeight:400, letterSpacing:"-0.7px", fontVariantNumeric:"tabular-nums", lineHeight:1 }}>
                {m.value}
              </div>
              <div style={{ fontSize:10.5, color:"var(--text-subtle)", marginTop:3, letterSpacing:"-0.2px" }}>{m.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom:6, flexShrink:0 }}>
        <div className="seg">
          <button className={tab === "subs" ? "active" : ""} onClick={() => setTab("subs")}>Suscripciones</button>
          <button className={tab === "expenses" ? "active" : ""} onClick={() => setTab("expenses")}>Gastos puntuales</button>
        </div>
      </div>

      {/* Zona scrollable — solo las listas se deslizan */}
      <div className="tasks-scroll" style={{
        flex:1, minHeight:0, overflowY:"auto", scrollbarGutter:"stable",
        paddingRight:10, paddingTop:16, paddingBottom:8,
        WebkitMaskImage:"linear-gradient(to bottom, transparent 0, #000 16px, #000 calc(100% - 24px), transparent 100%)",
        maskImage:"linear-gradient(to bottom, transparent 0, #000 16px, #000 calc(100% - 24px), transparent 100%)",
      }}>

        {/* ── Suscripciones ── */}
        {tab === "subs" && (
          <>
            {data.subs.length === 0 && !addOpen ? (
              <div style={{ textAlign:"center", padding:"60px 0", color:"var(--text-subtle)", fontSize:14, letterSpacing:"-0.5px" }}>
                Sin suscripciones — <button className="btn ghost sm" onClick={() => { setFinType("sub"); setAddOpen(true); }}>añadir una</button>
              </div>
            ) : data.subs.map((s, i) => (
              <div key={s.id} className="task-row" style={{
                display:"flex", alignItems:"center", gap:14,
                padding:"13px 4px", opacity: s.active ? 1 : 0.45,
                borderBottom: i === data.subs.length - 1 ? "none" : "0.5px solid var(--border)",
                transition:"opacity .15s",
              }}>
                {/* Icono */}
                <div style={{
                  width:38, height:38, borderRadius:"50%", flexShrink:0,
                  border:"1px solid rgba(255,255,255,0.1)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  color: s.active ? "var(--accent)" : "var(--text-subtle)",
                }}>
                  <Icon name="refresh-cw" size={14} strokeWidth={1.7}/>
                </div>
                {/* Nombre + meta */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14, letterSpacing:"-0.5px", color:"var(--text)" }}>{s.name}</div>
                  <div style={{ fontSize:11, color:"var(--text-subtle)", marginTop:2, letterSpacing:"-0.2px" }}>
                    {s.category} · {s.cycle === "yearly" ? "Anual" : "Mensual"}
                    {s.nextRenewal ? ` · Renueva ${_finDate(s.nextRenewal)}` : ""}
                  </div>
                </div>
                {/* Importe */}
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontSize:14, fontVariantNumeric:"tabular-nums", letterSpacing:"-0.4px" }}>
                    {_eur(s.amount)}<span style={{ color:"var(--text-subtle)", fontSize:11.5 }}>/{s.cycle === "yearly" ? "año" : "mes"}</span>
                  </div>
                  {s.cycle === "yearly" && (
                    <div style={{ fontSize:10.5, color:"var(--text-subtle)", marginTop:1 }}>{_eur(_subMonthly(s))}/mes</div>
                  )}
                </div>
                {/* Acciones */}
                <button className="btn ghost sm" onClick={() => toggleSub(s.id)} style={{ color: s.active ? "var(--green)" : "var(--text-subtle)", flexShrink:0 }}>
                  {s.active ? "Activa" : "Pausada"}
                </button>
                <button className="btn ghost icon-only sm" onClick={() => delSub(s.id)} title="Eliminar" style={{ flexShrink:0 }}>
                  <Icon name="trash" size={13}/>
                </button>
              </div>
            ))}
          </>
        )}

        {/* ── Gastos puntuales ── */}
        {tab === "expenses" && (
          <>
            {data.expenses.length === 0 && !addOpen ? (
              <div style={{ textAlign:"center", padding:"60px 0", color:"var(--text-subtle)", fontSize:14, letterSpacing:"-0.5px" }}>
                Sin gastos puntuales — <button className="btn ghost sm" onClick={() => { setFinType("exp"); setAddOpen(true); }}>añadir uno</button>
              </div>
            ) : [...data.expenses].sort((a, b) => (b.date || "").localeCompare(a.date || "")).map((e, i, arr) => (
              <div key={e.id} className="task-row" style={{
                display:"flex", alignItems:"center", gap:14,
                padding:"13px 4px",
                borderBottom: i === arr.length - 1 ? "none" : "0.5px solid var(--border)",
              }}>
                <div style={{
                  width:38, height:38, borderRadius:"50%", flexShrink:0,
                  border:"1px solid rgba(255,255,255,0.1)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  color:"var(--text-muted)",
                }}>
                  <Icon name="receipt" size={14} strokeWidth={1.7}/>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14, letterSpacing:"-0.5px", color:"var(--text)" }}>{e.concept}</div>
                  <div style={{ fontSize:11, color:"var(--text-subtle)", marginTop:2, letterSpacing:"-0.2px" }}>
                    {_finDate(e.date)} · {e.category}
                  </div>
                </div>
                <div style={{ fontSize:14, fontVariantNumeric:"tabular-nums", letterSpacing:"-0.4px", flexShrink:0 }}>
                  {_eur(e.amount)}
                </div>
                <button className="btn ghost icon-only sm" onClick={() => delExp(e.id)} title="Eliminar" style={{ flexShrink:0 }}>
                  <Icon name="trash" size={13}/>
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* ── Pop-up unificado: Suscripción / Gasto puntual — estilo Tareas ── */}
      <QuickModal
        open={addOpen}
        onClose={() => { setAddOpen(false); setSubForm(blankSub); setExpForm(blankExp); }}
        onSubmit={() => (finType === "sub" ? saveSub() : saveExp())}
        canSubmit={finType === "sub"
          ? (!!subForm.name.trim() && Number(subForm.amount) > 0)
          : (!!expForm.concept.trim() && Number(expForm.amount) > 0)}
        types={[
          { id:"sub", label:"Suscripción", icon:"refresh-cw" },
          { id:"exp", label:"Gasto",       icon:"receipt"    },
        ]}
        type={finType}
        onTypeChange={setFinType}
        titlePlaceholder={finType === "sub" ? "Nombre de la suscripción..." : "Concepto del gasto..."}
        titleValue={finType === "sub" ? subForm.name : expForm.concept}
        onTitleChange={v => finType === "sub"
          ? setSubForm({ ...subForm, name: v })
          : setExpForm({ ...expForm, concept: v })}
        tabs={finType === "sub" ? [
          { id:"amount",  label:"Importe",    icon:"receipt",    hasVal: Number(subForm.amount) > 0, badge: Number(subForm.amount) > 0 ? _eur(subForm.amount) : null },
          { id:"cycle",   label:"Ciclo",      icon:"refresh-cw", hasVal: true, badge: subForm.cycle === "yearly" ? "Anual" : "Mensual" },
          { id:"cat",     label:"Categoría",  icon:"tag",        hasVal: true, badge: subForm.category },
          { id:"renewal", label:"Renovación", icon:"calendar",   hasVal: !!subForm.nextRenewal, badge: subForm.nextRenewal ? _finDate(subForm.nextRenewal) : null },
        ] : [
          { id:"amount", label:"Importe",   icon:"receipt",  hasVal: Number(expForm.amount) > 0, badge: Number(expForm.amount) > 0 ? _eur(expForm.amount) : null },
          { id:"date",   label:"Fecha",     icon:"calendar", hasVal: !!expForm.date, badge: expForm.date ? _finDate(expForm.date) : null },
          { id:"cat",    label:"Categoría", icon:"tag",      hasVal: true, badge: expForm.category },
        ]}
        renderTab={(id) => {
          if (id === "amount") return (
            <input style={{ ...QUICK_FIELD, width:180, textAlign:"center", fontSize:22, fontWeight:300, letterSpacing:"-1px", fontFamily:"var(--font-display)" }}
              type="number" step="0.01" min="0" placeholder="0,00 €" autoFocus
              value={finType === "sub" ? subForm.amount : expForm.amount}
              onChange={e => finType === "sub"
                ? setSubForm({ ...subForm, amount: e.target.value })
                : setExpForm({ ...expForm, amount: e.target.value })}/>
          );
          if (id === "cycle") return (
            <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
              {FIN_CYCLES.map(c => (
                <QuickPill key={c.id} selected={subForm.cycle === c.id} onClick={() => setSubForm({ ...subForm, cycle: c.id })}>
                  {c.label}
                </QuickPill>
              ))}
            </div>
          );
          if (id === "cat") return (
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center" }}>
              {FIN_CATS.map(c => (
                <QuickPill key={c}
                  selected={(finType === "sub" ? subForm.category : expForm.category) === c}
                  onClick={() => finType === "sub"
                    ? setSubForm({ ...subForm, category: c })
                    : setExpForm({ ...expForm, category: c })}>
                  {c}
                </QuickPill>
              ))}
            </div>
          );
          if (id === "renewal") return (
            <input style={{ ...QUICK_FIELD }} type="date"
              value={subForm.nextRenewal} onChange={e => setSubForm({ ...subForm, nextRenewal: e.target.value })}/>
          );
          if (id === "date") return (
            <input style={{ ...QUICK_FIELD }} type="date"
              value={expForm.date} onChange={e => setExpForm({ ...expForm, date: e.target.value })}/>
          );
          return null;
        }}
      />
    </div>
  );
};

const SimplePage = ({ title, sub, icon }) => (
  <div className="page">
    <div className="page-head"><div><h1>{title}</h1>{sub && <div className="sub">{sub}</div>}</div></div>
    <div className="card"><div className="card-body" style={{padding: 60}}><Empty icon={icon} title="Próximamente" sub="Esta sección está en construcción"/></div></div>
  </div>
);

const SESSION_OPTS = [
  { days: 0,  label: "Solo esta sesión",  sub: "Se cerrará al cerrar el navegador" },
  { days: 1,  label: "1 día",             sub: "Hasta mañana a esta hora" },
  { days: 7,  label: "7 días",            sub: "Una semana sin volver a entrar" },
  { days: 30, label: "30 días",           sub: "Comodidad máxima" },
];

const SessionCard = () => {
  const toast = useToast();
  const info = window._sessionUtils?.info() || { days: 0, exp: null };
  const [days, setDays] = React.useState(info.days || 0);

  const expLabel = (() => {
    if (!info.exp || info.exp === "0") return "Solo esta sesión (cierra con el navegador)";
    if (info.exp === "never") return "Sin expiración";
    const d = new Date(parseInt(info.exp));
    if (isNaN(d)) return "Solo esta sesión";
    const dias  = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
    const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
    return `Hasta el ${dias[d.getDay()]} ${d.getDate()} de ${meses[d.getMonth()]} a las ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  })();

  const save = () => {
    try {
      const raw = localStorage.getItem("141_session");
      if (!raw) { toast("No hay sesión activa", "error"); return; }
      window._sessionUtils.save(JSON.parse(raw), days);
      toast("Sesión actualizada", "success");
    } catch { toast("Error al guardar", "error"); }
  };

  return (
    <div className="card" style={{gridColumn:"1/-1"}}>
      <div className="card-header"><div className="card-title">Sesión y acceso</div></div>
      <div className="card-body">
        <div className="muted small" style={{marginBottom:16}}>
          Estado actual: <span style={{color:"var(--text)", fontWeight:500}}>{expLabel}</span>
        </div>
        <div style={{display:"flex", flexDirection:"column", gap:8, marginBottom:20, maxWidth:480}}>
          {SESSION_OPTS.map(opt => (
            <div key={opt.days} onClick={() => setDays(opt.days)}
              style={{
                padding:"10px 14px", borderRadius:10, cursor:"pointer",
                border:`1.5px solid ${days === opt.days ? "var(--accent)" : "var(--border-strong)"}`,
                background: days === opt.days ? "var(--accent-soft)" : "var(--bg-elev)",
                display:"flex", alignItems:"center", gap:12, transition:"all .1s",
              }}>
              <div style={{width:16, height:16, borderRadius:"50%", flexShrink:0,
                border:`2px solid ${days === opt.days ? "var(--accent)" : "var(--border-strong)"}`,
                display:"grid", placeItems:"center"}}>
                {days === opt.days && <div style={{width:7, height:7, borderRadius:"50%", background:"var(--accent)"}}/>}
              </div>
              <div>
                <div style={{fontSize:13, fontWeight:500, color: days === opt.days ? "var(--accent)" : "var(--text)"}}>{opt.label}</div>
                <div style={{fontSize:11, color:"var(--text-subtle)", marginTop:1}}>{opt.sub}</div>
              </div>
            </div>
          ))}
        </div>
        <button className="btn primary sm" onClick={save}>
          <Icon name="check" size={12}/> Aplicar
        </button>
      </div>
    </div>
  );
};

const SettingsPage = () => {
  const D = window.Data;
  D.useStore();
  const toast = useToast();
  const [form, setForm] = useState({ ...D.SETTINGS });
  const [saved, setSaved] = useState(false);

  const field = (key) => ({
    value: form[key] || "",
    onChange: e => { setForm(f => ({ ...f, [key]: e.target.value })); setSaved(false); }
  });

  const save = () => {
    D.updateSettings(form);
    setSaved(true);
    toast("Ajustes guardados", "success");
  };

  return (
    <div className="page">
      <div className="page-head">
        <div><h1>Ajustes</h1><div className="sub">Información de la agencia y preferencias generales</div></div>
        <button className="btn primary" onClick={save}><Icon name="check" size={13}/> Guardar cambios</button>
      </div>

      <div className="rg-settings">
        <div className="card" style={{gridColumn:"1/-1"}}>
          <div className="card-header"><div className="card-title">Información de la agencia</div></div>
          <div className="card-body" style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap: 16}}>
            <div>
              <label className="label">Nombre de la agencia</label>
              <input className="input" {...field("name")} placeholder="141'STUDIO"/>
            </div>
            <div>
              <label className="label">Tagline</label>
              <input className="input" {...field("tagline")} placeholder="Agencia digital"/>
            </div>
            <div>
              <label className="label">Email de contacto</label>
              <input className="input" type="email" {...field("email")} placeholder="hello@tuagencia.com"/>
            </div>
            <div>
              <label className="label">Teléfono / WhatsApp</label>
              <input className="input" {...field("phone")} placeholder="+34 600 000 000"/>
            </div>
            <div style={{gridColumn:"1/-1"}}>
              <label className="label">Web</label>
              <input className="input" {...field("website")} placeholder="https://tuagencia.com"/>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">Credenciales de acceso</div></div>
          <div className="card-body">
            <div className="muted small" style={{marginBottom: 14}}>
              Las credenciales de acceso se gestionan directamente en el código fuente por seguridad.
            </div>
            <div style={{background:"var(--bg-elev-2)", border:"0.5px solid var(--border)", borderRadius: 8, padding:"10px 14px", fontFamily:"var(--font-mono)", fontSize: 12, color:"var(--text-muted)"}}>
              Email: nil@141agency.com
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">Apariencia</div></div>
          <div className="card-body">
            <div className="muted small">El tema claro/oscuro se controla con el botón en la barra superior derecha.</div>
            <div style={{marginTop: 14, padding:"10px 14px", background:"var(--accent-soft)", borderRadius: 8, fontSize: 12, color:"var(--text-muted)"}}>
              <Icon name="sparkles" size={12}/> Próximamente: colores de acento personalizables, logo de la agencia y dominio del portal cliente.
            </div>
          </div>
        </div>

        <SessionCard/>
      </div>
    </div>
  );
};

// ── TaskProgressModal — arc progress picker ──────────────────
const TaskProgressModal = ({ task, projectId, open, onClose, onDelete, onUpdate }) => {
  const [progress,     setProgress]     = useState(0);
  const [dotsOpen,     setDotsOpen]     = useState(false);
  const [dragging,     setDragging]     = useState(false);
  const [mode,         setMode]         = useState("progress"); // "progress" | "edit"
  const [editTitle,    setEditTitle]    = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [displayProgress, setDisplayProgress] = useState(0);
  const svgRef         = useRef(null);
  const dragRef        = useRef({ angle: 0, progress: 0 });
  const animFrameRef   = useRef(null);
  const justDraggedRef = useRef(false);

  const taskId = task ? task.id : null;
  useEffect(() => {
    if (open && task) {
      const init = Math.round((task.progress || 0) / 25) * 25;
      setProgress(init); setDisplayProgress(init);
      setMode("progress"); setDotsOpen(false);
      setEditTitle(task.title || ""); setEditDeadline(task.deadline || "");
    }
  }, [open, taskId]);

  useEffect(() => {
    if (!open) return;
    const fn = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (dragging) { setDisplayProgress(progress); return; }
    const target = progress;
    const step = () => {
      setDisplayProgress(prev => {
        const diff = target - prev;
        if (Math.abs(diff) < 0.15) return target;
        animFrameRef.current = requestAnimationFrame(step);
        return prev + diff * 0.22;
      });
    };
    animFrameRef.current = requestAnimationFrame(step);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [progress, dragging]);

  if (!open || !task) return null;

  // Arc geometry — Outdomode drum-selector style.
  // viewBox 640×170. Huge circle center at (320, 456), apex (320, 0) = top of SVG.
  // The ▼ indicator is FIXED at the apex (top-center) always.
  // The labels ROTATE: value p appears at angle  90 + (progress − p) * ARC_SWEEP/100
  // so the current progress is always directly under the fixed ▼.
  const CX = 320, CY = 456, R = 456;
  const ARC_SWEEP = 64;   // total degrees for the 0-100% range

  const toPt = (stdDeg, r = R) => {
    const rad = stdDeg * Math.PI / 180;
    return [CX + r * Math.cos(rad), CY - r * Math.sin(rad)];
  };

  // Background arc: static — full visible arc left edge → apex → right edge
  const bgY = CY - Math.sqrt(R * R - CX * CX); // ≈ 131
  const bgArcPath = `M 0 ${bgY.toFixed(1)} A ${R} ${R} 0 0 1 640 ${bgY.toFixed(1)}`;

  // Where label for value p sits on the arc given current progress
  const tickAngle = (p) => 90 + (displayProgress - p) * ARC_SWEEP / 100;

  // Angle of mouse relative to circle centre (standard math degrees)
  const getMouseAngle = (clientX, clientY) => {
    if (!svgRef.current) return 90;
    const rect = svgRef.current.getBoundingClientRect();
    const mx = (clientX - rect.left) / rect.width * 640;
    const my = (clientY - rect.top) / rect.height * 170;
    return Math.atan2(CY - my, mx - CX) * 180 / Math.PI;
  };

  const startDrag = (clientX, clientY) => {
    dragRef.current = { angle: getMouseAngle(clientX, clientY), progress };
    setDragging(true);
    const onMove = (e) => moveDrag(e.clientX, e.clientY);
    const onUp   = () => {
      setDragging(false);
      setProgress(p => Math.round(p / 25) * 25);
      justDraggedRef.current = true;
      setTimeout(() => { justDraggedRef.current = false; }, 0);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
  };

  const moveDrag = (clientX, clientY) => {
    const angle  = getMouseAngle(clientX, clientY);
    const delta  = (angle - dragRef.current.angle) * 100 / ARC_SWEEP;
    const newP = Math.round(Math.max(0, Math.min(100, dragRef.current.progress + delta)));
    setProgress(newP);
  };

  const TICKS = [0, 25, 50, 75, 100];
  const statusLabel = progress === 100 ? "COMPLETADA" : progress === 0 ? "PENDIENTE" : "EN CURSO";

  const confirmProgress = () => {
    const updates = { progress };
    if (progress === 100) {
      updates.column = "done";
      const n = new Date();
      updates.doneAt = `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;
    } else if (task.column === "done") {
      updates.column = "todo";
      updates.doneAt = null;
    }
    onUpdate(updates);
    onClose();
  };

  const saveEdit = () => {
    const ch = {};
    if (editTitle.trim() && editTitle.trim() !== task.title) ch.title = editTitle.trim();
    if (editDeadline !== task.deadline) ch.deadline = editDeadline || null;
    if (Object.keys(ch).length) onUpdate(ch);
    setMode("progress");
  };

  const btnCircle = (onClick, children) => (
    <button onClick={onClick} style={{
      width:36, height:36, borderRadius:"50%",
      background:"rgba(255,255,255,0.08)",
      border:"0.5px solid rgba(255,255,255,0.1)",
      cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
      color:"var(--text-muted)", flexShrink:0,
    }}>{children}</button>
  );

  return ReactDOM.createPortal(
    <div
      className="progress-modal-overlay"
      style={{
        position:"fixed", inset:0, zIndex:500,
        background:"rgba(0,0,0,0.78)", backdropFilter:"blur(18px)",
        display:"flex", alignItems:"center", justifyContent:"center",
        animation:"fade .15s ease-out",
      }}
      onClick={() => { if (justDraggedRef.current) return; onClose(); }}
    >
      <div
        className="progress-modal-sheet"
        onClick={e => e.stopPropagation()}
        style={{
          width:"100%", maxWidth:540,
          background:"#111111",
          border:"0.5px solid rgba(255,255,255,0.08)",
          borderRadius:32,
          overflow:"hidden",
          animation:"pop .2s cubic-bezier(.2,.8,.2,1)",
          display:"flex", flexDirection:"column",
          userSelect:"none",
        }}
      >
        {/* Drag handle */}
        <div style={{ display:"flex", justifyContent:"center", paddingTop:12 }}>
          <div style={{ width:36, height:4, borderRadius:99, background:"rgba(255,255,255,0.18)" }}/>
        </div>

        {/* Top bar */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px 0" }}>
          {/* X */}
          <button onClick={onClose} style={{
            width:40, height:40, borderRadius:"50%",
            background:"rgba(255,255,255,0.08)", border:"0.5px solid rgba(255,255,255,0.1)",
            cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
            color:"var(--text-muted)", flexShrink:0,
          }}><Icon name="x" size={15}/></button>

          {/* Right pill: ↗ + ··· */}
          <div style={{ position:"relative" }}>
            <div style={{ display:"flex", alignItems:"center", background:"rgba(255,255,255,0.08)", border:"0.5px solid rgba(255,255,255,0.1)", borderRadius:99 }}>
              <button onClick={() => setMode("edit")} style={{
                width:46, height:40, background:"transparent", border:"none",
                borderRight:"0.5px solid rgba(255,255,255,0.1)",
                cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                color:"var(--text-muted)",
              }}><Icon name="arrow-up-right" size={15}/></button>
              <button onClick={e => { e.stopPropagation(); setDotsOpen(o => !o); }} style={{
                width:46, height:40, background:"transparent", border:"none",
                cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                color:"var(--text-muted)",
              }}><Icon name="more-h" size={15}/></button>
            </div>
            {dotsOpen && (
              <div
                onClick={e => e.stopPropagation()}
                style={{
                  position:"absolute", right:0, top:48, zIndex:600,
                  background:"#1c1c1e", border:"0.5px solid rgba(255,255,255,0.1)",
                  borderRadius:14, overflow:"hidden", minWidth:170,
                  boxShadow:"0 12px 32px rgba(0,0,0,0.5)",
                }}
              >
                <button
                  onClick={() => { setDotsOpen(false); setMode("edit"); }}
                  style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"12px 16px", border:0, background:"transparent", color:"var(--text)", fontSize:13, cursor:"pointer", fontFamily:"inherit", textAlign:"left" }}
                  onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.06)"}
                  onMouseLeave={e => e.currentTarget.style.background="transparent"}
                >
                  <Icon name="edit-2" size={13}/> Editar tarea
                </button>
                <div style={{ height:"0.5px", background:"rgba(255,255,255,0.08)" }}/>
                <button
                  onClick={() => { setDotsOpen(false); onClose(); onDelete(); }}
                  style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"12px 16px", border:0, background:"transparent", color:"var(--red)", fontSize:13, cursor:"pointer", fontFamily:"inherit", textAlign:"left" }}
                  onMouseEnter={e => e.currentTarget.style.background="rgba(220,91,93,0.08)"}
                  onMouseLeave={e => e.currentTarget.style.background="transparent"}
                >
                  <Icon name="trash" size={13}/> Eliminar tarea
                </button>
              </div>
            )}
          </div>
        </div>

        {mode === "progress" ? (<>
          {/* Percentage + status */}
          <div style={{ textAlign:"center", padding:"28px 0 60px" }}>
            <div style={{ fontSize:86, fontWeight:300, letterSpacing:"-4px", color:"var(--text)", lineHeight:1 }}>
              {progress}%
            </div>
            <div style={{ fontSize:11, color:"var(--text-subtle)", letterSpacing:"0.12em", marginTop:10, fontWeight:500 }}>
              {statusLabel}
            </div>
          </div>

          {/* Arc SVG — drum-selector: ▼ fixed at apex, labels rotate */}
          <svg
            ref={svgRef}
            viewBox="0 -32 640 202"
            style={{ width:"100%", display:"block", cursor: dragging ? "grabbing" : "grab", overflow:"visible" }}
            onMouseDown={e => { e.preventDefault(); startDrag(e.clientX, e.clientY); }}
            onTouchStart={e => { e.preventDefault(); const t = e.touches[0]; startDrag(t.clientX, t.clientY); }}
            onTouchMove={e => { e.preventDefault(); const t = e.touches[0]; moveDrag(t.clientX, t.clientY); }}
            onTouchEnd={() => { setDragging(false); setProgress(p => Math.round(p / 25) * 25); }}
          >
            {/* Static background arc */}
            <path d={bgArcPath} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5"/>

            {/* Rotating tick marks — each pct label orbits to stay relative to current progress */}
            {TICKS.map(pct => {
              const deg  = tickAngle(pct);
              const rad  = deg * Math.PI / 180;
              const cosR = Math.cos(rad), sinR = Math.sin(rad);
              const [ax, ay] = toPt(deg);

              // Hide if too far off the visible arc
              const dist = Math.abs(deg - 90);
              if (dist > 52) return null;
              const fade = dist > 36 ? Math.max(0, (52 - dist) / 16) : 1;

              const t1x = ax - cosR * 8,  t1y = ay + sinR * 8;   // inward start (gap from arc)
              const t2x = ax - cosR * 20, t2y = ay + sinR * 20;  // inward end
              const lx  = ax - cosR * 40, ly  = ay + sinR * 40;

              const isActive = pct === progress;
              return (
                <g key={pct} opacity={fade}>
                  <line x1={t1x.toFixed(1)} y1={t1y.toFixed(1)} x2={t2x.toFixed(1)} y2={t2y.toFixed(1)}
                    stroke={isActive ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.35)"} strokeWidth={isActive ? "2" : "1.5"} strokeLinecap="round"/>
                  <text x={lx.toFixed(1)} y={ly.toFixed(1)} textAnchor="middle" dominantBaseline="middle"
                    fontSize={isActive ? "18" : "13"} fontWeight={isActive ? "500" : "400"}
                    fill={isActive ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)"} fontFamily="var(--font-sans)">{pct}%</text>
                </g>
              );
            })}

            {/* Fixed ▼ — floats above arc, no stem */}
            <polygon points={`${CX-5},-22 ${CX+5},-22 ${CX},-10`} fill="white"/>
          </svg>

          {/* Confirm button */}
          <div style={{ padding:"0 20px 28px", display:"flex", justifyContent:"center" }}>
            <button onClick={confirmProgress}
              style={{ padding:"13px 52px", background:"rgba(255,255,255,0.06)", border:"0.5px solid rgba(255,255,255,0.12)", borderRadius:99, color:"var(--text)", fontSize:14, letterSpacing:"-0.5px", cursor:"pointer", fontFamily:"var(--font-sans)", transition:"background .15s" }}
              onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.1)"}
              onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.06)"}
            >Confirmar</button>
          </div>
        </>) : (
          /* Edit mode */
          <div style={{ padding:"24px 20px" }}>
            <div style={{ fontSize:11, color:"var(--text-subtle)", marginBottom:16, letterSpacing:"0.08em", textTransform:"uppercase", fontWeight:500 }}>Editar tarea</div>
            <div style={{ marginBottom:12 }}>
              <label style={{ display:"block", fontSize:11, color:"var(--text-subtle)", marginBottom:6 }}>Nombre</label>
              <input autoFocus value={editTitle} onChange={e => setEditTitle(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setMode("progress"); }}
                style={{ width:"100%", background:"rgba(255,255,255,0.06)", border:"0.5px solid rgba(255,255,255,0.1)", borderRadius:10, color:"var(--text)", fontSize:14, padding:"10px 14px", fontFamily:"var(--font-sans)", outline:"none", boxSizing:"border-box" }}
              />
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={{ display:"block", fontSize:11, color:"var(--text-subtle)", marginBottom:6 }}>Fecha límite</label>
              <input type="date" value={editDeadline} onChange={e => setEditDeadline(e.target.value)}
                style={{ width:"100%", background:"rgba(255,255,255,0.06)", border:"0.5px solid rgba(255,255,255,0.1)", borderRadius:10, color:"var(--text)", fontSize:14, padding:"10px 14px", fontFamily:"var(--font-sans)", outline:"none", boxSizing:"border-box" }}
              />
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={saveEdit} style={{ flex:1, padding:"11px", background:"var(--accent-soft)", border:"0.5px solid var(--accent)", borderRadius:12, color:"var(--accent)", fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
                Guardar
              </button>
              <button onClick={() => setMode("progress")} style={{ padding:"11px 16px", background:"rgba(255,255,255,0.05)", border:"0.5px solid rgba(255,255,255,0.08)", borderRadius:12, color:"var(--text-muted)", fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

// ═══ Ingresos — espejo de Gastos: mensualidades (recurrente) + cobros puntuales.
//     Datos manuales en localStorage; preparada para conectar Stripe (las
//     suscripciones de Stripe entrarán como mensualidades y los pagos como puntuales). ═══
const INC_KEY = "141_income_v1";
const _incLoad = () => {
  try {
    const d = JSON.parse(localStorage.getItem(INC_KEY));
    return d && typeof d === "object" ? { recs: d.recs || [], incomes: d.incomes || [] } : { recs: [], incomes: [] };
  } catch { return { recs: [], incomes: [] }; }
};
const _incSave = (d) => { try { localStorage.setItem(INC_KEY, JSON.stringify(d)); } catch {} };

const IncomePage = () => {
  const D = window.Data;
  D.useStore();
  const toast = useToast();
  const [data, setData] = useState(_incLoad);
  const [addOpen, setAddOpen] = useState(false);
  const [incType, setIncType] = useState("rec"); // "rec" | "pun" — tipo dentro del pop-up
  const blankRec = { concept: "", amount: "", cycle: "monthly", clientId: "", nextCharge: "", vat: 21, irpf: 15 };
  const blankInc = { date: _todayISO(), concept: "", amount: "", clientId: "", vat: 21, irpf: 15 };
  const [recForm, setRecForm] = useState(blankRec);
  const [incForm, setIncForm] = useState(blankInc);

  // Stripe como fuente real: las facturas pagadas entran como cobros puntuales.
  // null = sin conexión (o cargando) · [] = conectado sin cobros aún
  const [stripeInc, setStripeInc]   = useState(null);
  const [stripeMeta, setStripeMeta] = useState(null);   // saldo + facturas abiertas
  const [stripeInvOpen, setStripeInvOpen] = useState(false);
  const [payLinkOpen, setPayLinkOpen]     = useState(false);
  const [range, setRange] = useState(6);   // meses del gráfico (6 | 12)

  const fetchStripe = () => {
    window.apiFetch("/api/stripe/invoices", { limit: 100 })
      .then(r => r.json())
      .then(res => {
        if (!res.ok) return;
        const paid = (res.invoices || [])
          .filter(inv => inv.status === "paid" && (inv.amount_paid || 0) > 0)
          .map(inv => ({
            id: "stripe-" + (inv.stripe_id || inv.id),
            date: inv.created ? new Date(inv.created * 1000).toISOString().slice(0, 10) : _todayISO(),
            concept: inv.description || `Factura ${inv.id}`,
            clientName: inv.customer && inv.customer !== "—" ? inv.customer : "",
            // El importe de Stripe ya es el total cobrado → base=total, sin IVA/IRPF añadidos
            amount: (inv.amount_paid || 0) / 100,
            vat: 0, irpf: 0,
            source: "stripe", hostedUrl: inv.hosted_url || null,
          }));
        setStripeInc(paid);
        // Facturas emitidas y aún sin pagar → pendientes de cobro
        const open = (res.invoices || [])
          .filter(inv => inv.status === "open")
          .map(inv => ({
            id: "open-" + (inv.stripe_id || inv.id),
            concept: inv.description || `Factura ${inv.id}`,
            clientName: inv.customer && inv.customer !== "—" ? inv.customer : "",
            amount: (inv.amount || 0) / 100,
            date: inv.created ? new Date(inv.created * 1000).toISOString().slice(0, 10) : "",
            due: inv.due_date ? new Date(inv.due_date * 1000).toISOString().slice(0, 10) : "",
            hostedUrl: inv.hosted_url || null,
          }));
        setStripeMeta(m => ({ ...(m || {}), open, openSum: open.reduce((a, i) => a + i.amount, 0) }));
      })
      .catch(() => {});
    window.apiFetch("/api/stripe/balance", {})
      .then(r => r.json())
      .then(res => {
        if (res.ok) setStripeMeta(m => ({ ...(m || {}), available: res.available / 100, pending: res.pending / 100 }));
      })
      .catch(() => {});
  };
  useEffect(() => { fetchStripe(); }, []);

  const stripeConnected = stripeInc !== null;
  const stripeOpen = (stripeMeta && stripeMeta.open) || [];
  // Ingresos combinados (manuales + Stripe) para totales, gráfico y listas
  const allIncomes = stripeInc ? [...data.incomes, ...stripeInc] : data.incomes;

  const persist = (next) => { setData(next); _incSave(next); };
  const clientName = (id) => { const c = D.CLIENTS.find(c => c.id === id); return c ? (c.company || c.name || "") : ""; };

  // IVA e IRPF por línea: el importe se introduce como base imponible.
  // Total factura = Base + IVA − retención IRPF (15% a empresas/autónomos).
  const _vatOf   = (x) => (x.vat === undefined || x.vat === null ? 21 : Number(x.vat));
  const _irpfOf  = (x) => (x.irpf === undefined || x.irpf === null ? 0 : Number(x.irpf));
  const _withVat = (x) => (Number(x.amount) || 0) * (1 + _vatOf(x) / 100);
  const _cobro   = (x) => (Number(x.amount) || 0) * (1 + _vatOf(x) / 100 - _irpfOf(x) / 100);
  const _recMoVat   = (r) => (r.cycle === "yearly" ? _withVat(r) / 12 : _withVat(r));
  const _recMoCobro = (r) => (r.cycle === "yearly" ? _cobro(r) / 12 : _cobro(r));
  const _recMoBase  = (r) => _subMonthly(r);
  const _fiscalSub  = (x) => `Base ${_eur(x.amount)}${_vatOf(x) ? ` + IVA ${_vatOf(x)}%` : ""}${_irpfOf(x) ? ` − IRPF ${_irpfOf(x)}%` : ""}`;

  const saveRec = () => {
    if (!recForm.concept.trim() || !(Number(recForm.amount) > 0)) { toast("Pon concepto e importe", "error"); return; }
    const rec = {
      id: _finId(), concept: recForm.concept.trim(), amount: Number(recForm.amount),
      cycle: recForm.cycle, clientId: recForm.clientId || "", clientName: clientName(recForm.clientId),
      nextCharge: recForm.nextCharge, vat: Number(recForm.vat) || 0, irpf: Number(recForm.irpf) || 0, active: true,
    };
    persist({ ...data, recs: [rec, ...data.recs] });
    setRecForm(blankRec); setAddOpen(false); toast("Mensualidad añadida", "success");
  };
  const toggleRec = (id) => persist({ ...data, recs: data.recs.map(r => r.id === id ? { ...r, active: !r.active } : r) });
  const delRec = (id) => persist({ ...data, recs: data.recs.filter(r => r.id !== id) });

  const saveInc = () => {
    if (!incForm.concept.trim() || !(Number(incForm.amount) > 0)) { toast("Pon concepto e importe", "error"); return; }
    const inc = {
      id: _finId(), date: incForm.date || _todayISO(),
      concept: incForm.concept.trim(), amount: Number(incForm.amount),
      clientId: incForm.clientId || "", clientName: clientName(incForm.clientId),
      vat: Number(incForm.vat) || 0, irpf: Number(incForm.irpf) || 0,
    };
    persist({ ...data, incomes: [inc, ...data.incomes] });
    setIncForm(blankInc); setAddOpen(false); toast("Ingreso añadido", "success");
  };
  const delInc = (id) => persist({ ...data, incomes: data.incomes.filter(i => i.id !== id) });

  const activeRecs  = data.recs.filter(r => r.active);
  const recurringMo = activeRecs.reduce((a, r) => a + _recMoVat(r), 0);   // facturado recurrente (con IVA)
  const punMonth    = allIncomes.filter(i => _sameMonth(i.date)).reduce((a, i) => a + _withVat(i), 0);
  const monthTotal  = recurringMo + punMonth;                              // facturado este mes (con IVA)
  const baseMonth   = activeRecs.reduce((a, r) => a + _recMoBase(r), 0)
                    + allIncomes.filter(i => _sameMonth(i.date)).reduce((a, i) => a + (Number(i.amount) || 0), 0);
  const ivaMonth    = monthTotal - baseMonth;                              // IVA repercutido, a apartar
  const irpfMonth   = activeRecs.reduce((a, r) => a + _recMoBase(r) * _irpfOf(r) / 100, 0)
                    + allIncomes.filter(i => _sameMonth(i.date)).reduce((a, i) => a + (Number(i.amount) || 0) * _irpfOf(i) / 100, 0);

  // ── Serie mensual (últimos 6 meses): cada mensualidad cuenta desde su fecha de cobro ──
  const MES_ES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  const trend = (() => {
    const now = new Date();
    const nowKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const recStartKey = (r) => {
      if (!r.nextCharge) return nowKey;
      const k = r.nextCharge.slice(0, 7);
      return k < nowKey ? k : nowKey;
    };
    return Array.from({ length: range }, (_, k) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (range - 1 - k), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const puntual = allIncomes
        .filter(i => (i.date || "").startsWith(key))
        .reduce((a, i) => a + _withVat(i), 0);
      const rec = activeRecs
        .filter(r => recStartKey(r) <= key)
        .reduce((a, r) => a + _recMoVat(r), 0);
      return { key, label: MES_ES[d.getMonth()], full: `${MES_ES[d.getMonth()]} ${d.getFullYear()}`, puntual, rec, total: puntual + rec };
    });
  })();
  // En ingresos, subir es bueno: verde al alza, rojo a la baja
  const _prevMo = trend[trend.length - 2], _curMo = trend[trend.length - 1];
  const deltaPct = _prevMo.total > 0
    ? Math.round(((_curMo.total - _prevMo.total) / _prevMo.total) * 100)
    : null;

  // ── Por cliente · este mes (mensualidades activas + puntuales del mes) ──
  const byClient = {};
  activeRecs.forEach(r => { const k = r.clientName || "Sin cliente"; byClient[k] = (byClient[k] || 0) + _recMoVat(r); });
  allIncomes.filter(i => _sameMonth(i.date)).forEach(i => {
    const k = i.clientName || "Sin cliente";
    byClient[k] = (byClient[k] || 0) + _withVat(i);
  });
  const clients = Object.entries(byClient).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const cliMax = clients.length ? clients[0][1] : 1;

  const sortedInc = [...allIncomes].sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  // Origen de la facturación de este mes (para Analíticas)
  const stripeMonthSum = allIncomes.filter(i => _sameMonth(i.date) && i.source === "stripe").reduce((a, i) => a + _withVat(i), 0);
  const manualPunSum   = allIncomes.filter(i => _sameMonth(i.date) && i.source !== "stripe").reduce((a, i) => a + _withVat(i), 0);

  const cardStyle = { background:"var(--bg-elev-1)", border:"0.5px solid var(--border)", borderRadius:16, padding:"18px 20px" };
  const cardTitle = { fontSize:11, textTransform:"uppercase", letterSpacing:"0.07em", color:"var(--text-subtle)", marginBottom:14 };
  const sectionHead = { fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em", color:"var(--text-subtle)",
    display:"flex", alignItems:"center", gap:8, margin:"28px 4px 6px" };
  const sectionSum = { marginLeft:"auto", fontWeight:400, textTransform:"none", letterSpacing:"-0.2px", fontSize:12, opacity:0.8 };
  const dashedBtn = {
    marginTop:14, width:"100%", padding:"18px", borderRadius:18,
    border:"1px dashed var(--border)", background:"transparent", cursor:"pointer",
    color:"var(--text-muted)", fontSize:14, fontFamily:"inherit", opacity:0.5, transition:"opacity .2s",
    display:"flex", alignItems:"center", justifyContent:"center", gap:8, letterSpacing:"-0.2px",
  };

  return (
    <div style={{
      height:"100vh", display:"flex", flexDirection:"column",
      padding:"28px 32px 0", maxWidth:1400, margin:"0 auto", overflow:"hidden",
    }}>
      {/* Cabecera fija: título + secciones + tira de KPIs */}
      <div style={{ flexShrink:0 }}>
        <div className="page-head" style={{ marginBottom:22 }}>
          <div>
            <h1>Facturación</h1>
            <div className="sub" style={{ display:"flex", alignItems:"center", gap:7 }}>
              <span style={{ width:6, height:6, borderRadius:99, flexShrink:0,
                background: stripeConnected ? "var(--green)" : "var(--text-subtle)", display:"inline-block" }}/>
              Stripe {stripeConnected ? "conectado" : "sin conectar"}
              {` · ${activeRecs.length} mensualidad${activeRecs.length === 1 ? "" : "es"} activa${activeRecs.length === 1 ? "" : "s"}`}
              {stripeOpen.length ? ` · ${stripeOpen.length} factura${stripeOpen.length === 1 ? "" : "s"} sin cobrar` : ""}
            </div>
          </div>
          <ActionPill plusActions={[
            { icon:"receipt", label:"Factura Stripe", sub:"Se crea y envía desde Stripe.", accent:true,
              onClick: () => setStripeInvOpen(true) },
            { icon:"external-link", label:"Enlace de pago", sub:"Link de cobro de Stripe para compartir.",
              onClick: () => setPayLinkOpen(true) },
            { icon:"edit", label:"Ingreso manual", sub:"Mensualidad o cobro apuntado a mano.",
              onClick: () => { setIncType("pun"); setAddOpen(true); } },
          ]}/>
        </div>

        {/* Tira de KPIs — mismo formato que el hero de Inicio (label 16 · valor 32 · delta con círculo) */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:32,
          padding:"20px 4px 24px", borderTop:"0.5px solid var(--border)", borderBottom:"0.5px solid var(--border)" }}>
          {[
            { label:"Facturado este mes", value:_eur(monthTotal),
              // Si el mes anterior fue 0 no hay % que calcular: comparativa plana con el importe
              delta: deltaPct === null
                ? <MetricDelta text={_eur(_prevMo.total)} suffix={`vs ${_prevMo.label.toLowerCase()}`}
                    dir={monthTotal > _prevMo.total ? "up" : "flat"}
                    tone={monthTotal > _prevMo.total ? "good" : "muted"}/>
                : <TrendDelta pct={deltaPct} goodUp={true} suffix={`vs ${_prevMo.label.toLowerCase()}`}/> },
            { label:"Saldo Stripe",
              value: stripeMeta && stripeMeta.available !== undefined ? _eur(stripeMeta.available) : "—",
              delta:<MetricDelta text={_eur((stripeMeta && stripeMeta.pending) || 0)} suffix="pendiente de abono"
                dir={((stripeMeta && stripeMeta.pending) || 0) > 0 ? "up" : "flat"}
                tone={((stripeMeta && stripeMeta.pending) || 0) > 0 ? "good" : "muted"}/> },
            { label:"Pendiente de cobro",
              value: stripeConnected ? _eur((stripeMeta && stripeMeta.openSum) || 0) : "—",
              delta:<MetricDelta text={String(stripeOpen.length)}
                suffix={`factura${stripeOpen.length === 1 ? "" : "s"} abierta${stripeOpen.length === 1 ? "" : "s"}`}
                dir={stripeOpen.length ? "down" : "flat"}
                tone={stripeOpen.length ? "bad" : "muted"}/> },
          ].map(k => (
            <div key={k.label} style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <span style={{ fontSize:16, lineHeight:1.3, color:"var(--text-muted)", letterSpacing:"-0.2px" }}>{k.label}</span>
              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                <span style={{ fontSize:32, color:"var(--text)", letterSpacing:"-0.08em", lineHeight:1,
                  fontFamily:"var(--font-display)", fontVariantNumeric:"tabular-nums" }}>{k.value}</span>
                {k.delta}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Zona scrollable — solo las listas se deslizan */}
      <div className="tasks-scroll" style={{
        flex:1, minHeight:0, overflowY:"auto", overflowX:"hidden", scrollbarGutter:"stable",
        paddingRight:10, paddingTop:16, paddingBottom:8,
        WebkitMaskImage:"linear-gradient(to bottom, transparent 0, #000 16px, #000 calc(100% - 24px), transparent 100%)",
        maskImage:"linear-gradient(to bottom, transparent 0, #000 16px, #000 calc(100% - 24px), transparent 100%)",
      }}>

        {/* ── Gráfico de tendencia — formato "Daily completion" de outdomode ── */}
        <div style={{ padding:"6px 4px 0" }}>
          <div style={{ fontSize:16, color:"var(--text-muted)", letterSpacing:"-0.2px" }}>Facturación mensual</div>
          <div style={{ display:"flex", gap:6, marginTop:14 }}>
            {[[6, "6 meses"], [12, "12 meses"]].map(([n, lbl]) => {
              const on = range === n;
              return (
                <button key={n} onClick={() => setRange(n)} style={{
                  padding:"8px 18px", borderRadius:99, cursor:"pointer", fontFamily:"inherit",
                  background: on ? "rgba(255,255,255,0.08)" : "transparent",
                  border: on ? "0.5px solid rgba(255,255,255,0.14)" : "0.5px solid transparent",
                  color: on ? "var(--text)" : "var(--text-subtle)",
                  fontSize:13.5, letterSpacing:"-0.3px", fontWeight: on ? 500 : 400,
                  transition:"all .12s",
                }}>
                  {lbl}
                </button>
              );
            })}
          </div>
          <div style={{ height:192, display:"flex", flexDirection:"column", margin:"24px 0 4px" }}>
            <FinTrendChart trend={trend} single/>
          </div>
        </div>

        {/* ── Mensualidades ── */}
        <div style={sectionHead}>
          Mensualidades
          <span style={{ opacity:0.55, fontWeight:400 }}>· {data.recs.length}</span>
          {recurringMo > 0 && <span style={sectionSum}>{_eur(recurringMo)}/mes</span>}
        </div>
        {data.recs.map((r, i) => (
            <div key={r.id} className="task-row" style={{
              display:"flex", alignItems:"center", gap:14,
              padding:"13px 4px", opacity: r.active ? 1 : 0.45,
              borderBottom: i === data.recs.length - 1 ? "none" : "0.5px solid var(--border)",
              transition:"opacity .15s",
            }}>
              <div style={{
                width:38, height:38, borderRadius:"50%", flexShrink:0,
                border:"1px solid rgba(255,255,255,0.1)",
                display:"flex", alignItems:"center", justifyContent:"center",
                color: r.active ? FIN_SERIES.rec : "var(--text-subtle)",
              }}>
                <Icon name="refresh-cw" size={14} strokeWidth={1.7}/>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14, letterSpacing:"-0.5px", color:"var(--text)" }}>{r.concept}</div>
                <div style={{ fontSize:11, color:"var(--text-subtle)", marginTop:2, letterSpacing:"-0.2px" }}>
                  {r.clientName || "Sin cliente"} · {r.cycle === "yearly" ? "Anual" : "Mensual"}
                  {r.nextCharge ? ` · Cobro ${_finDate(r.nextCharge)}` : ""}
                </div>
              </div>
              <div style={{ textAlign:"right", flexShrink:0 }}>
                <div style={{ fontSize:14, fontVariantNumeric:"tabular-nums", letterSpacing:"-0.4px" }}>
                  {_eur(_cobro(r))}<span style={{ color:"var(--text-subtle)", fontSize:11.5 }}>/{r.cycle === "yearly" ? "año" : "mes"}</span>
                </div>
                <div style={{ fontSize:10.5, color:"var(--text-subtle)", marginTop:1 }}>
                  {_fiscalSub(r)}
                </div>
              </div>
              <button className="btn ghost sm" onClick={() => toggleRec(r.id)} style={{ color: r.active ? "var(--green)" : "var(--text-subtle)", flexShrink:0 }}>
                {r.active ? "Activa" : "Pausada"}
              </button>
              <button className="btn ghost icon-only sm" onClick={() => delRec(r.id)} title="Eliminar" style={{ flexShrink:0 }}>
                <Icon name="trash" size={13}/>
              </button>
            </div>
          ))}
        <button onClick={() => { setIncType("rec"); setAddOpen(true); }} style={dashedBtn}
          onMouseEnter={e => e.currentTarget.style.opacity = 0.85}
          onMouseLeave={e => e.currentTarget.style.opacity = 0.5}>
          {data.recs.length === 0 ? "Añade tu primera mensualidad" : "Añadir mensualidad"} <Icon name="plus" size={15}/>
        </button>

        {/* ── Cobros: facturas de Stripe + ingresos puntuales ── */}
        <div style={sectionHead}>
          Cobros
          <span style={{ opacity:0.55, fontWeight:400 }}>· {stripeOpen.length + sortedInc.length}</span>
          {punMonth > 0 && <span style={sectionSum}>{_eur(punMonth)} este mes</span>}
        </div>
          {/* Facturas de Stripe emitidas y pendientes de cobro */}
          {stripeOpen.map(inv => (
            <div key={inv.id} className="task-row" style={{
              display:"flex", alignItems:"center", gap:14,
              padding:"13px 4px", borderBottom:"0.5px solid var(--border)",
            }}>
              <div style={{
                width:38, height:38, borderRadius:"50%", flexShrink:0,
                border:"1px solid rgba(238,229,134,0.35)",
                display:"flex", alignItems:"center", justifyContent:"center",
                color:"var(--amber)",
              }}>
                <Icon name="clock" size={14} strokeWidth={1.7}/>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14, letterSpacing:"-0.5px", color:"var(--text)", display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{inv.concept}</span>
                  <span style={{ fontSize:10, padding:"2px 8px", borderRadius:99, flexShrink:0,
                    background:"var(--amber-soft)", border:"0.5px solid rgba(238,229,134,0.4)", color:"var(--amber)" }}>
                    Abierta
                  </span>
                </div>
                <div style={{ fontSize:11, color:"var(--text-subtle)", marginTop:2, letterSpacing:"-0.2px" }}>
                  Emitida {_finDate(inv.date)}{inv.due ? ` · vence ${_finDate(inv.due)}` : ""}{inv.clientName ? ` · ${inv.clientName}` : ""}
                </div>
              </div>
              <div style={{ textAlign:"right", flexShrink:0 }}>
                <div style={{ fontSize:14, fontVariantNumeric:"tabular-nums", letterSpacing:"-0.4px", color:"var(--amber)" }}>
                  {_eur(inv.amount)}
                </div>
                <div style={{ fontSize:10.5, color:"var(--text-subtle)", marginTop:1 }}>pendiente de cobro</div>
              </div>
              {inv.hostedUrl
                ? <a className="btn ghost icon-only sm" href={inv.hostedUrl} target="_blank" rel="noopener noreferrer"
                    title="Ver / cobrar en Stripe" style={{ flexShrink:0 }}>
                    <Icon name="external-link" size={13}/>
                  </a>
                : <span style={{ width:28, flexShrink:0 }}/>}
            </div>
          ))}
          {sortedInc.map((inc, i) => (
            <div key={inc.id} className="task-row" style={{
              display:"flex", alignItems:"center", gap:14,
              padding:"13px 4px",
              borderBottom: i === sortedInc.length - 1 ? "none" : "0.5px solid var(--border)",
            }}>
              <div style={{
                width:38, height:38, borderRadius:"50%", flexShrink:0,
                border:"1px solid rgba(255,255,255,0.1)",
                display:"flex", alignItems:"center", justifyContent:"center",
                color:FIN_SERIES.pun,
              }}>
                <Icon name="trending-up" size={14} strokeWidth={1.7}/>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14, letterSpacing:"-0.5px", color:"var(--text)", display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{inc.concept}</span>
                  {inc.source === "stripe" && (
                    <span style={{ fontSize:10, padding:"2px 8px", borderRadius:99, flexShrink:0,
                      background:"rgba(99,91,255,0.14)", border:"0.5px solid rgba(99,91,255,0.4)", color:"#9d97ff" }}>
                      Stripe
                    </span>
                  )}
                </div>
                <div style={{ fontSize:11, color:"var(--text-subtle)", marginTop:2, letterSpacing:"-0.2px" }}>
                  {_finDate(inc.date)}{inc.clientName ? ` · ${inc.clientName}` : ""}
                </div>
              </div>
              <div style={{ textAlign:"right", flexShrink:0 }}>
                <div style={{ fontSize:14, fontVariantNumeric:"tabular-nums", letterSpacing:"-0.4px" }}>
                  +{_eur(_cobro(inc))}
                </div>
                <div style={{ fontSize:10.5, color:"var(--text-subtle)", marginTop:1 }}>
                  {inc.source === "stripe" ? "Cobrado en Stripe" : _fiscalSub(inc)}
                </div>
              </div>
              {inc.source === "stripe" ? (
                inc.hostedUrl
                  ? <a className="btn ghost icon-only sm" href={inc.hostedUrl} target="_blank" rel="noopener noreferrer"
                      title="Ver factura en Stripe" style={{ flexShrink:0 }}>
                      <Icon name="external-link" size={13}/>
                    </a>
                  : <span style={{ width:28, flexShrink:0 }}/>
              ) : (
                <button className="btn ghost icon-only sm" onClick={() => delInc(inc.id)} title="Eliminar" style={{ flexShrink:0 }}>
                  <Icon name="trash" size={13}/>
                </button>
              )}
            </div>
          ))}
        <button onClick={() => { setIncType("pun"); setAddOpen(true); }} style={{ ...dashedBtn, marginBottom:24 }}
          onMouseEnter={e => e.currentTarget.style.opacity = 0.85}
          onMouseLeave={e => e.currentTarget.style.opacity = 0.5}>
          {stripeOpen.length + sortedInc.length === 0 ? "Registra tu primer cobro" : "Añadir cobro"} <Icon name="plus" size={15}/>
        </button>
      </div>

      {/* ── Pop-up unificado: Mensualidad / Puntual — estilo Tareas ── */}
      <QuickModal
        open={addOpen}
        onClose={() => { setAddOpen(false); setRecForm(blankRec); setIncForm(blankInc); }}
        onSubmit={() => (incType === "rec" ? saveRec() : saveInc())}
        canSubmit={incType === "rec"
          ? (!!recForm.concept.trim() && Number(recForm.amount) > 0)
          : (!!incForm.concept.trim() && Number(incForm.amount) > 0)}
        types={[
          { id:"rec", label:"Mensualidad", icon:"refresh-cw"   },
          { id:"pun", label:"Puntual",     icon:"trending-up"  },
        ]}
        type={incType}
        onTypeChange={setIncType}
        titlePlaceholder={incType === "rec" ? "Concepto (ej. Fee mensual)..." : "Concepto del ingreso..."}
        titleValue={incType === "rec" ? recForm.concept : incForm.concept}
        onTitleChange={v => incType === "rec"
          ? setRecForm({ ...recForm, concept: v })
          : setIncForm({ ...incForm, concept: v })}
        tabs={incType === "rec" ? [
          { id:"amount", label:"Importe", icon:"receipt",    hasVal: Number(recForm.amount) > 0, badge: Number(recForm.amount) > 0 ? `${_eur(recForm.amount)} base` : null },
          { id:"vat",    label:"IVA",     icon:"tag",        hasVal: true, badge: `${recForm.vat}%` },
          { id:"irpf",   label:"IRPF",    icon:"minus",      hasVal: Number(recForm.irpf) > 0, badge: `${recForm.irpf}%` },
          { id:"cycle",  label:"Ciclo",   icon:"refresh-cw", hasVal: true, badge: recForm.cycle === "yearly" ? "Anual" : "Mensual" },
          { id:"client", label:"Cliente", icon:"users",      hasVal: !!recForm.clientId, badge: recForm.clientId ? clientName(recForm.clientId) : null },
          { id:"charge", label:"Cobro",   icon:"calendar",   hasVal: !!recForm.nextCharge, badge: recForm.nextCharge ? _finDate(recForm.nextCharge) : null },
        ] : [
          { id:"amount", label:"Importe", icon:"receipt",  hasVal: Number(incForm.amount) > 0, badge: Number(incForm.amount) > 0 ? `${_eur(incForm.amount)} base` : null },
          { id:"vat",    label:"IVA",     icon:"tag",      hasVal: true, badge: `${incForm.vat}%` },
          { id:"irpf",   label:"IRPF",    icon:"minus",    hasVal: Number(incForm.irpf) > 0, badge: `${incForm.irpf}%` },
          { id:"date",   label:"Fecha",   icon:"calendar", hasVal: !!incForm.date, badge: incForm.date ? _finDate(incForm.date) : null },
          { id:"client", label:"Cliente", icon:"users",    hasVal: !!incForm.clientId, badge: incForm.clientId ? clientName(incForm.clientId) : null },
        ]}
        renderTab={(id) => {
          if (id === "amount") return (
            <input style={{ ...QUICK_FIELD, width:180, textAlign:"center", fontSize:22, fontWeight:300, letterSpacing:"-1px", fontFamily:"var(--font-display)" }}
              type="number" step="0.01" min="0" placeholder="0,00 €" autoFocus
              value={incType === "rec" ? recForm.amount : incForm.amount}
              onChange={e => incType === "rec"
                ? setRecForm({ ...recForm, amount: e.target.value })
                : setIncForm({ ...incForm, amount: e.target.value })}/>
          );
          if (id === "vat") return (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
              <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
                {[21, 10, 0].map(v => {
                  const sel = Number(incType === "rec" ? recForm.vat : incForm.vat) === v;
                  return (
                    <QuickPill key={v} selected={sel}
                      onClick={() => incType === "rec"
                        ? setRecForm({ ...recForm, vat: v })
                        : setIncForm({ ...incForm, vat: v })}>
                      {v === 0 ? "Sin IVA" : `${v}%`}
                    </QuickPill>
                  );
                })}
              </div>
              {(() => {
                const f = incType === "rec" ? recForm : incForm;
                const base = Number(f.amount) || 0;
                if (!base) return null;
                return (
                  <span style={{ fontSize:12, color:"var(--text-subtle)", letterSpacing:"-0.3px" }}>
                    Base {_eur(base)} → Total {_eur(base * (1 + Number(f.vat) / 100))}
                  </span>
                );
              })()}
            </div>
          );
          if (id === "irpf") return (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
              <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
                {[15, 7, 0].map(v => {
                  const sel = Number(incType === "rec" ? recForm.irpf : incForm.irpf) === v;
                  return (
                    <QuickPill key={v} selected={sel}
                      onClick={() => incType === "rec"
                        ? setRecForm({ ...recForm, irpf: v })
                        : setIncForm({ ...incForm, irpf: v })}>
                      {v === 0 ? "Sin IRPF" : `${v}%`}
                    </QuickPill>
                  );
                })}
              </div>
              <span style={{ fontSize:11.5, color:"var(--text-subtle)", letterSpacing:"-0.3px", textAlign:"center", maxWidth:300 }}>
                Retención para empresas y autónomos. Sin IRPF para particulares.
              </span>
              {(() => {
                const f = incType === "rec" ? recForm : incForm;
                const base = Number(f.amount) || 0;
                if (!base) return null;
                return (
                  <span style={{ fontSize:12, color:"var(--text-subtle)", letterSpacing:"-0.3px" }}>
                    Cobras {_eur(base * (1 + Number(f.vat) / 100 - Number(f.irpf) / 100))}
                  </span>
                );
              })()}
            </div>
          );
          if (id === "cycle") return (
            <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
              {FIN_CYCLES.map(c => (
                <QuickPill key={c.id} selected={recForm.cycle === c.id} onClick={() => setRecForm({ ...recForm, cycle: c.id })}>
                  {c.label}
                </QuickPill>
              ))}
            </div>
          );
          if (id === "client") return (
            <div style={{ width:"100%", maxHeight:180, overflowY:"auto", display:"flex", flexDirection:"column", gap:4 }}>
              {D.CLIENTS.length === 0
                ? <span style={{ fontSize:13, color:"var(--text-subtle)", textAlign:"center" }}>Sin clientes</span>
                : [...D.CLIENTS].sort((a, b) => (a.company || a.name || "").localeCompare(b.company || b.name || "")).map(c => {
                  const sel = (incType === "rec" ? recForm.clientId : incForm.clientId) === c.id;
                  return (
                    <QuickPill key={c.id} selected={sel}
                      onClick={() => incType === "rec"
                        ? setRecForm({ ...recForm, clientId: sel ? "" : c.id })
                        : setIncForm({ ...incForm, clientId: sel ? "" : c.id })}>
                      {c.company || c.name}
                    </QuickPill>
                  );
                })
              }
            </div>
          );
          if (id === "charge") return (
            <input style={{ ...QUICK_FIELD }} type="date"
              value={recForm.nextCharge} onChange={e => setRecForm({ ...recForm, nextCharge: e.target.value })}/>
          );
          if (id === "date") return (
            <input style={{ ...QUICK_FIELD }} type="date"
              value={incForm.date} onChange={e => setIncForm({ ...incForm, date: e.target.value })}/>
          );
          return null;
        }}
      />

      {/* Funcionalidades de Stripe */}
      <NewInvoiceModal open={stripeInvOpen} onClose={() => setStripeInvOpen(false)} onCreated={fetchStripe}/>
      <PaymentLinkModal open={payLinkOpen} onClose={() => setPayLinkOpen(false)}/>
    </div>
  );
};

// ── Enlace de pago de Stripe (concepto + importe → URL para compartir) ──
const PaymentLinkModal = ({ open, onClose }) => {
  const toast = useToast();
  const [concept, setConcept] = useState("");
  const [amount, setAmount]   = useState("");
  const [busy, setBusy] = useState(false);
  const [url, setUrl]   = useState("");
  useEffect(() => { if (open) { setConcept(""); setAmount(""); setUrl(""); setBusy(false); } }, [open]);

  const create = async () => {
    if (!concept.trim() || !(Number(amount) > 0)) { toast("Pon concepto e importe", "warn"); return; }
    setBusy(true);
    try {
      const res = await _stripeApi("create_payment_link", { name: concept.trim(), amount: Number(amount) });
      if (res.ok) setUrl(res.url);
      else toast(res.error || "No se pudo crear el enlace", "warn");
    } catch (e) { toast("Error de conexión", "warn"); }
    setBusy(false);
  };
  const copy = () => navigator.clipboard.writeText(url)
    .then(() => toast("Enlace copiado", "success")).catch(() => {});

  return (
    <Modal open={open} onClose={onClose} title="Enlace de pago"
      sub="Un link de cobro de Stripe: compártelo por WhatsApp, email o donde quieras."
      footer={url ? (
        <>
          <button className="btn" onClick={onClose}>Cerrar</button>
          <button className="btn primary" onClick={copy}><Icon name="file" size={12}/> Copiar enlace</button>
        </>
      ) : (
        <>
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn primary" onClick={create} disabled={busy}>
            {busy ? "Creando…" : <><Icon name="plus" size={12}/> Crear enlace</>}
          </button>
        </>
      )}>
      {url ? (
        <div>
          <div className="label">Tu enlace de pago</div>
          <input className="input" readOnly value={url} onClick={e => e.target.select()}
            style={{ fontFamily:"var(--font-mono)", fontSize:12.5 }}/>
          <div style={{ fontSize:12, color:"var(--text-subtle)", marginTop:10, lineHeight:1.5 }}>
            Cuando alguien pague, el cobro aparecerá automáticamente en esta página.
          </div>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
          <div>
            <div className="label">Concepto</div>
            <input className="input" placeholder="Ej. Auditoría web" value={concept}
              onChange={e => setConcept(e.target.value)} autoFocus/>
          </div>
          <div>
            <div className="label">Importe (€)</div>
            <input className="input" type="number" min="0" step="0.01" placeholder="150"
              value={amount} onChange={e => setAmount(e.target.value)} style={{ maxWidth:180 }}/>
          </div>
        </div>
      )}
    </Modal>
  );
};

Object.assign(window, { AgencyBilling, IncomePage, AgencyProjects, SimplePage, SettingsPage, TasksBoard, ProjectTaskColumn, TaskRow });

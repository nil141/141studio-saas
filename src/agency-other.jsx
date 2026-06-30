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

  // Si venimos de la Agenda con un día concreto, aterrizamos en esa semana/día
  const initWeekOffset = (() => {
    if (!initialDate) return 0;
    const mondayOf = d => { const x = new Date(d); x.setHours(0,0,0,0); x.setDate(x.getDate() - ((x.getDay()+6)%7)); return x; };
    const nowMon = mondayOf(new Date());
    const selMon = mondayOf(new Date(initialDate + "T12:00:00"));
    return Math.round((selMon - nowMon) / (7 * 86400000));
  })();

  const [weekOffset, setWeekOffset] = useState(initWeekOffset);
  const [selectedDay, setSelectedDay] = useState(initialDate ? new Date(initialDate + "T12:00:00") : new Date());

  const [taskModal,      setTaskModal]      = useState(null); // { task, pid }
  const [hideCompleted,  setHideCompleted]  = useState(false);
  const [optionsOpen,    setOptionsOpen]    = useState(false);

  const DAY_ES  = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
  const MON_ES  = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  const C_DOTS  = ["#fb7185","#60a5fa","#fbbf24","#34d399","#a78bfa","#f472b6","#22d3ee","#f59e0b"];

  // Week days
  const weekDays = (() => {
    const now = new Date();
    const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dow = base.getDay();
    const mon = new Date(base);
    mon.setDate(base.getDate() - (dow === 0 ? 6 : dow - 1) + weekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(mon); d.setDate(mon.getDate() + i); return d;
    });
  })();

  const todayMid = new Date(); todayMid.setHours(0,0,0,0);
  const selMid   = new Date(selectedDay); selMid.setHours(0,0,0,0);
  const midMonth = MON_ES[weekDays[3].getMonth()];

  const allTasks = Object.values(D.TASKS).flat();

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

  const donePct = dayTasks.length
    ? Math.round(dayTasks.reduce((s, t) => s + (t.column === "done" ? 100 : (t.progress || 0)), 0) / dayTasks.length)
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

  // Label for the week range shown in left panel
  const weekStart = weekDays[0];
  const weekEnd   = weekDays[6];
  const weekLabel = (() => {
    const s = `${weekStart.getDate()} ${MON_ES[weekStart.getMonth()]}`;
    const e = `${weekEnd.getDate()} ${MON_ES[weekEnd.getMonth()]}`;
    return `${s} — ${e}`;
  })();

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
        <div>
          <h1>Tareas</h1>
          <div className="sub">
            {DAY_ES[new Date(selectedDay).getDay()]} {new Date(selectedDay).getDate()} {MON_ES[new Date(selectedDay).getMonth()]} · {dayTasks.filter(t => t.column !== "done").length} pendientes
          </div>
        </div>
        <ActionPill
          plusActions={() => openModal("newTask", { date: selDateStr })}
          moreActions={[
            { icon: hideCompleted ? "eye" : "eye-off",
              label: hideCompleted ? "Mostrar completadas" : "Ocultar completadas",
              onClick: () => setHideCompleted(h => !h) },
          ]}
        />
      </div>

      {/* Tira horizontal: navegación de mes + días + progreso */}
      <div style={{ borderBottom:"0.5px solid var(--border)", paddingBottom:18, marginBottom:28, flexShrink:0 }}>
        {/* Month nav — grupo centrado */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:16, marginBottom:18 }}>
          <button onClick={() => setWeekOffset(o => o-1)} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)", padding:"4px 6px", display:"flex" }}>
            <Icon name="chevron-left" size={16}/>
          </button>
          <span style={{ fontSize:15, fontWeight:500, letterSpacing:"-0.3px", color:"var(--text)", minWidth:80, textAlign:"center" }}>
            {MON_ES[weekDays[3].getMonth()]} {weekDays[3].getFullYear()}
          </span>
          <button onClick={() => setWeekOffset(o => o+1)} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)", padding:"4px 6px", display:"flex" }}>
            <Icon name="chevron-right" size={16}/>
          </button>
        </div>

        {/* Day strip — Opción 3: glass bar con píldora deslizante + indicadores de carga */}
        {(() => {
          const selIdx = weekDays.findIndex(d => {
            const m = new Date(d); m.setHours(0,0,0,0);
            return m.getTime() === selMid.getTime();
          });
          const segPct = 100 / 7;
          return (
            <div style={{
              position:"relative",
              display:"flex", alignItems:"stretch",
              background:"rgba(255,255,255,0.035)",
              border:"0.5px solid rgba(255,255,255,0.07)",
              borderRadius:18,
              padding:6,
              backdropFilter:"blur(24px) saturate(180%)",
              WebkitBackdropFilter:"blur(24px) saturate(180%)",
              overflow:"hidden",
            }}>
              {/* Píldora deslizante */}
              {selIdx >= 0 && (
                <div style={{
                  position:"absolute",
                  top:6, bottom:6,
                  left:`calc(${selIdx * segPct}% + 6px)`,
                  width:`calc(${segPct}% - 12px)`,
                  background:"linear-gradient(180deg, rgba(158,154,229,0.28), rgba(158,154,229,0.14))",
                  borderRadius:13,
                  boxShadow:"0 0 0 0.5px rgba(158,154,229,0.45), 0 8px 24px rgba(158,154,229,0.12)",
                  transition:"left .32s cubic-bezier(0.4,0,0.2,1), width .32s cubic-bezier(0.4,0,0.2,1)",
                  zIndex:0,
                }}/>
              )}

              {weekDays.map((d, i) => {
                const dMid = new Date(d); dMid.setHours(0,0,0,0);
                const isSel = dMid.getTime() === selMid.getTime();
                const isToday = dMid.getTime() === todayMid.getTime();
                const dStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
                const tasksToday = allTasks.filter(t => t.deadline === dStr);
                const doneToday  = tasksToday.filter(t => t.column === "done").length;
                const totalToday = tasksToday.length;
                const loadPct    = totalToday ? Math.min(100, Math.round((doneToday/totalToday)*100)) : 0;
                const hasLoad    = totalToday > 0;

                return (
                  <button key={d.toISOString()} onClick={() => setSelectedDay(new Date(d))} style={{
                    flex:1, cursor:"pointer", border:"none", background:"transparent",
                    position:"relative", zIndex:1,
                    display:"flex", flexDirection:"column", alignItems:"center",
                    gap:6, padding:"12px 0 12px",
                    transition:"transform .15s",
                  }}>
                    {/* Hairline separator */}
                    {i > 0 && !isSel && weekDays[i-1] && (() => {
                      const prevMid = new Date(weekDays[i-1]); prevMid.setHours(0,0,0,0);
                      return prevMid.getTime() !== selMid.getTime();
                    })() && (
                      <span style={{
                        position:"absolute", left:0, top:"24%", bottom:"24%",
                        width:"0.5px", background:"rgba(255,255,255,0.06)",
                      }}/>
                    )}

                    {/* Eyebrow */}
                    <span style={{
                      fontSize:10.5, fontWeight:600,
                      color: isSel ? "var(--accent)" : "var(--text-subtle)",
                      letterSpacing:"0.12em", textTransform:"uppercase",
                      transition:"color .2s",
                    }}>
                      {["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"][d.getDay()]}
                    </span>

                    {/* Day number */}
                    <span style={{
                      fontSize:22,
                      fontWeight: isSel ? 500 : isToday ? 500 : 300,
                      color: isSel ? "#e7e4ff" : isToday ? "var(--text)" : "var(--text-muted)",
                      letterSpacing:"-0.9px",
                      lineHeight:1,
                      transition:"color .2s",
                    }}>
                      {d.getDate()}
                    </span>

                    {/* Load indicator: mini barra de carga del día (o puntito hoy) */}
                    <div style={{
                      height:3, width:24, borderRadius:99, marginTop:4,
                      background: hasLoad ? "rgba(255,255,255,0.08)" : "transparent",
                      position:"relative", overflow:"hidden",
                    }}>
                      {hasLoad && (
                        <div style={{
                          position:"absolute", inset:0,
                          width:`${loadPct}%`,
                          background: isSel ? "var(--accent)" : isToday ? "var(--text-muted)" : "rgba(255,255,255,0.22)",
                          borderRadius:99,
                          transition:"width .3s",
                        }}/>
                      )}
                      {!hasLoad && isToday && !isSel && (
                        <span style={{
                          position:"absolute", left:"50%", top:"50%",
                          transform:"translate(-50%,-50%)",
                          width:3, height:3, borderRadius:"50%",
                          background:"var(--accent)",
                        }}/>
                      )}
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
          <div style={{ flex:1, height:2, background:"var(--border)", borderRadius:99 }}>
            <div style={{ width:`${donePct}%`, height:"100%", background:"var(--accent)", borderRadius:99, transition:"width .4s" }}/>
          </div>
          <span style={{ fontSize:12, color:"var(--text-muted)", fontWeight:500, flexShrink:0 }}>{donePct}%</span>
        </div>
      </div>

      {/* Zona scrollable: solo las tareas se deslizan */}
      <div style={{
        flex:1, minHeight:0,
        overflowY:"auto",
        scrollbarGutter:"stable",
        paddingRight:4, paddingBottom:80,
      }}>

      {groups.length === 0 && (
        <div style={{ textAlign:"center", padding:"60px 0", color:"var(--text-subtle)", fontSize:14, letterSpacing:"-0.5px" }}>
          Sin tareas para este día — <button className="btn ghost sm" onClick={() => openModal("newTask", { date: selDateStr })}>crear una</button>
        </div>
      )}

      {groups.map((group, gIdx) => (
        <div key={group.clientId} style={{ marginBottom:32 }}>
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

          <div className="client-divider" style={{ height:"0.5px", background:"var(--border)", marginTop:4 }}/>
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

      <div className="card" style={{marginBottom: 16}}>
        <div className="card-body" style={{padding: 16, display:"flex", alignItems:"center", gap: 16}}>
          <div className="metric-label">Capacidad</div>
          <div className="grow">
            <div className="row tight">
              <span style={{fontWeight: 500}}>{cap} {cap === 1 ? "proyecto activo" : "proyectos activos"}</span>
              <span className={"chip " + capColor}>{capLabel}</span>
            </div>
          </div>
          <div className="muted xsmall" style={{textAlign:"right", lineHeight: 1.5}}>1-3 cómoda · 4 atención · 5+ riesgo</div>
        </div>
      </div>

      {D.PROJECTS.length === 0 ? (
        <div className="card"><div className="card-body" style={{padding: 60}}>
          <Empty icon="folder" title="Sin proyectos" sub="Crea tu primer proyecto para empezar"/>
        </div></div>
      ) : (
      <div className="rg-projects">
        {D.PROJECTS.map(p => {
          const phase = D.PHASES[p.phase];
          const pTasks = D.TASKS[p.id] || [];
          const liveProgress = pTasks.length ? Math.round(pTasks.filter(t=>t.column==="done").length/pTasks.length*100) : 0;
          return (
            <div key={p.id} className="card" style={{cursor:"pointer", position:"relative"}} onClick={() => navigate("project", { projectId: p.id })}>
              <button className="btn ghost icon-only sm danger" data-tooltip="Eliminar"
                style={{position:"absolute", top: 10, right: 10, zIndex: 1}}
                onClick={(e) => removeProject(p, e)}>
                <Icon name="x" size={12}/>
              </button>
              <div className="card-body">
                <div className="row between">
                  <div className="row tight"><span className={"dot " + p.light}/><span style={{fontWeight: 500}}>{p.name}</span></div>
                  <span className="chip" style={{marginRight: 32}}>{phase.label}</span>
                </div>
                <div className="muted small" style={{marginTop: 6}}>{p.clientName} · {p.service}</div>
                <div className="muted small" style={{marginTop: 8}}>{p.description}</div>
                <div style={{marginTop: 14, display:"flex", alignItems:"center", gap: 10}}>
                  <div className="progress grow"><i style={{width: liveProgress + "%"}}/></div>
                  <span className="muted small">{liveProgress}%</span>
                </div>
                <div className="row between" style={{marginTop: 10}}>
                  <div className="muted xsmall"><Icon name="calendar" size={11}/> {p.deadline}</div>
                  <div className="xsmall" style={{color: p.light === "red" ? "var(--red)" : p.light === "amber" ? "var(--amber)" : "var(--text-muted)"}}>→ {p.nextMilestone}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};

// ── helpers Stripe ────────────────────────────────────────────
const _stripeApi = async (endpoint, body = {}) => {
  const res = await fetch(`/api/stripe/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
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
  try {
    const d = JSON.parse(localStorage.getItem(FIN_KEY));
    return d && typeof d === "object" ? { subs: d.subs || [], expenses: d.expenses || [] } : { subs: [], expenses: [] };
  } catch { return { subs: [], expenses: [] }; }
};
const _finSave = (d) => { try { localStorage.setItem(FIN_KEY, JSON.stringify(d)); } catch {} };
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

const AgencyBilling = () => {
  const toast = useToast();
  const [data, setData] = useState(_finLoad);
  const [tab, setTab]   = useState("subs"); // subs | expenses
  const [addSub, setAddSub] = useState(false);
  const [addExp, setAddExp] = useState(false);
  const blankSub = { name: "", amount: "", cycle: "monthly", category: "Software", nextRenewal: "" };
  const blankExp = { date: _todayISO(), concept: "", amount: "", category: "Software" };
  const [subForm, setSubForm] = useState(blankSub);
  const [expForm, setExpForm] = useState(blankExp);

  const persist = (next) => { setData(next); _finSave(next); };

  const saveSub = () => {
    if (!subForm.name.trim() || !(Number(subForm.amount) > 0)) { toast("Pon nombre e importe", "error"); return; }
    const sub = { id: _finId(), name: subForm.name.trim(), amount: Number(subForm.amount), cycle: subForm.cycle, category: subForm.category, nextRenewal: subForm.nextRenewal, active: true };
    persist({ ...data, subs: [sub, ...data.subs] });
    setSubForm(blankSub); setAddSub(false); toast("Suscripción añadida", "success");
  };
  const toggleSub = (id) => persist({ ...data, subs: data.subs.map(s => s.id === id ? { ...s, active: !s.active } : s) });
  const delSub = (id) => persist({ ...data, subs: data.subs.filter(s => s.id !== id) });

  const saveExp = () => {
    if (!expForm.concept.trim() || !(Number(expForm.amount) > 0)) { toast("Pon concepto e importe", "error"); return; }
    const exp = { id: _finId(), date: expForm.date || _todayISO(), concept: expForm.concept.trim(), amount: Number(expForm.amount), category: expForm.category };
    persist({ ...data, expenses: [exp, ...data.expenses] });
    setExpForm(blankExp); setAddExp(false); toast("Gasto añadido", "success");
  };
  const delExp = (id) => persist({ ...data, expenses: data.expenses.filter(e => e.id !== id) });

  const activeSubs  = data.subs.filter(s => s.active);
  const recurringMo = activeSubs.reduce((a, s) => a + _subMonthly(s), 0);
  const expMonth    = data.expenses.filter(e => _sameMonth(e.date)).reduce((a, e) => a + (Number(e.amount) || 0), 0);
  const totalMonth  = recurringMo + expMonth;

  const upcoming = activeSubs
    .filter(s => s.nextRenewal)
    .map(s => ({ ...s, _d: new Date(s.nextRenewal) }))
    .filter(s => !isNaN(s._d))
    .sort((a, b) => a._d - b._d)
    .slice(0, 4);

  const byCat = {};
  activeSubs.forEach(s => { byCat[s.category] = (byCat[s.category] || 0) + _subMonthly(s); });
  data.expenses.filter(e => _sameMonth(e.date)).forEach(e => { byCat[e.category] = (byCat[e.category] || 0) + (Number(e.amount) || 0); });
  const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  const catMax = cats.length ? cats[0][1] : 1;

  const monthName = new Date().toLocaleDateString("es-ES", { month: "long", year: "numeric" });

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Gastos</h1>
          <div className="sub">Control de gastos y suscripciones · {monthName}</div>
        </div>
      </div>

      {/* ── Métricas ── */}
      <div className="rg-4" style={{ marginBottom: 18 }}>
        <div className="card"><div className="card-body">
          <div className="metric-label">Gasto este mes</div>
          <div className="metric-value">{_eur(totalMonth)}</div>
          <div className="metric-delta">Recurrente + puntual</div>
        </div></div>
        <div className="card"><div className="card-body">
          <div className="metric-label">Recurrente / mes</div>
          <div className="metric-value" style={{ color: "var(--blue)" }}>{_eur(recurringMo)}</div>
          <div className="metric-delta">{activeSubs.length} suscripciones activas</div>
        </div></div>
        <div className="card"><div className="card-body">
          <div className="metric-label">Gastos puntuales</div>
          <div className="metric-value" style={{ color: "var(--amber)" }}>{_eur(expMonth)}</div>
          <div className="metric-delta">Este mes</div>
        </div></div>
        <div className="card"><div className="card-body">
          <div className="metric-label">Coste anual estimado</div>
          <div className="metric-value">{_eur(recurringMo * 12)}</div>
          <div className="metric-delta">Solo suscripciones</div>
        </div></div>
      </div>

      {/* ── Desglose + próximas renovaciones ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, marginBottom: 18 }} className="fin-split">
        <div className="card"><div className="card-body">
          <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 14 }}>Desglose por categoría (este mes)</div>
          {cats.length === 0 ? (
            <div style={{ color: "var(--text-subtle)", fontSize: 13, padding: "8px 0" }}>Sin datos todavía.</div>
          ) : cats.map(([cat, amt]) => (
            <div key={cat} style={{ marginBottom: 11 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 5, color: "var(--text-muted)" }}>
                <span>{cat}</span>
                <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--text)" }}>{_eur(amt)}</span>
              </div>
              <div style={{ height: 6, borderRadius: 99, background: "var(--bg-elev-2)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.max(4, (amt / catMax) * 100)}%`, background: "var(--accent)", borderRadius: 99 }} />
              </div>
            </div>
          ))}
        </div></div>
        <div className="card"><div className="card-body">
          <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 14 }}>Próximas renovaciones</div>
          {upcoming.length === 0 ? (
            <div style={{ color: "var(--text-subtle)", fontSize: 13, padding: "8px 0" }}>Sin fechas de renovación.</div>
          ) : upcoming.map(s => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "0.5px solid var(--border)" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</div>
                <div style={{ fontSize: 11.5, color: "var(--text-subtle)" }}>{_finDate(s.nextRenewal)}</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{_eur(s.amount)}</div>
            </div>
          ))}
        </div></div>
      </div>

      {/* ── Tabs Suscripciones / Gastos ── */}
      <div className="card">
        <div className="card-header">
          <div className="seg">
            <button className={tab === "subs" ? "active" : ""} onClick={() => setTab("subs")}>Suscripciones</button>
            <button className={tab === "expenses" ? "active" : ""} onClick={() => setTab("expenses")}>Gastos</button>
          </div>
          <ActionPill
            plusActions={[
              { icon: "refresh-cw", label: "Nueva suscripción", sub: "Gasto recurrente (mensual o anual).",
                onClick: () => { setTab("subs"); setAddSub(true); } },
              { icon: "receipt",    label: "Nuevo gasto puntual", sub: "Un gasto único de un día.",
                accent: true, onClick: () => { setTab("expenses"); setAddExp(true); } },
            ]}
          />
        </div>

        {/* ── Suscripciones ── */}
        {tab === "subs" && (
          <div className="card-body flush">
            {addSub && (
              <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.8fr 0.9fr 1fr 1fr auto", gap: 8, padding: "14px 18px", borderBottom: "0.5px solid var(--border)", alignItems: "center", background: "var(--bg-elev)" }}>
                <input style={FIN_INPUT} placeholder="Nombre (ej. Adobe CC)" value={subForm.name} onChange={e => setSubForm({ ...subForm, name: e.target.value })} />
                <input style={FIN_INPUT} type="number" step="0.01" placeholder="€" value={subForm.amount} onChange={e => setSubForm({ ...subForm, amount: e.target.value })} />
                <select style={FIN_INPUT} value={subForm.cycle} onChange={e => setSubForm({ ...subForm, cycle: e.target.value })}>
                  {FIN_CYCLES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
                <select style={FIN_INPUT} value={subForm.category} onChange={e => setSubForm({ ...subForm, category: e.target.value })}>
                  {FIN_CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input style={FIN_INPUT} type="date" title="Próxima renovación" value={subForm.nextRenewal} onChange={e => setSubForm({ ...subForm, nextRenewal: e.target.value })} />
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn primary sm" onClick={saveSub}>Guardar</button>
                  <button className="btn ghost sm" onClick={() => { setAddSub(false); setSubForm(blankSub); }}>✕</button>
                </div>
              </div>
            )}
            {data.subs.length === 0 ? (
              <Empty icon="refresh-cw" title="Sin suscripciones" sub="Añade tus gastos recurrentes para controlarlos" />
            ) : (
              <table className="table">
                <thead><tr>
                  <th>Suscripción</th><th>Categoría</th><th>Ciclo</th>
                  <th style={{ textAlign: "right" }}>Importe</th><th style={{ textAlign: "right" }}>Equiv. /mes</th>
                  <th>Renovación</th><th>Estado</th><th style={{ width: 44 }}></th>
                </tr></thead>
                <tbody>
                  {data.subs.map(s => (
                    <tr key={s.id} style={{ opacity: s.active ? 1 : 0.5 }}>
                      <td style={{ fontWeight: 500 }}>{s.name}</td>
                      <td className="muted">{s.category}</td>
                      <td className="muted">{s.cycle === "yearly" ? "Anual" : "Mensual"}</td>
                      <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{_eur(s.amount)}</td>
                      <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: "var(--text-muted)" }}>{_eur(_subMonthly(s))}</td>
                      <td className="muted">{_finDate(s.nextRenewal)}</td>
                      <td>
                        <button className="btn ghost sm" onClick={() => toggleSub(s.id)} style={{ color: s.active ? "var(--green)" : "var(--text-subtle)" }}>
                          {s.active ? "Activa" : "Pausada"}
                        </button>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button className="btn ghost icon-only sm" onClick={() => delSub(s.id)} title="Eliminar"><Icon name="trash" size={13} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Gastos ── */}
        {tab === "expenses" && (
          <div className="card-body flush">
            {addExp && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr 0.8fr 1fr auto", gap: 8, padding: "14px 18px", borderBottom: "0.5px solid var(--border)", alignItems: "center", background: "var(--bg-elev)" }}>
                <input style={FIN_INPUT} type="date" value={expForm.date} onChange={e => setExpForm({ ...expForm, date: e.target.value })} />
                <input style={FIN_INPUT} placeholder="Concepto" value={expForm.concept} onChange={e => setExpForm({ ...expForm, concept: e.target.value })} />
                <input style={FIN_INPUT} type="number" step="0.01" placeholder="€" value={expForm.amount} onChange={e => setExpForm({ ...expForm, amount: e.target.value })} />
                <select style={FIN_INPUT} value={expForm.category} onChange={e => setExpForm({ ...expForm, category: e.target.value })}>
                  {FIN_CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn primary sm" onClick={saveExp}>Guardar</button>
                  <button className="btn ghost sm" onClick={() => { setAddExp(false); setExpForm(blankExp); }}>✕</button>
                </div>
              </div>
            )}
            {data.expenses.length === 0 ? (
              <Empty icon="receipt" title="Sin gastos" sub="Registra tus gastos puntuales del mes" />
            ) : (
              <table className="table">
                <thead><tr>
                  <th>Fecha</th><th>Concepto</th><th>Categoría</th>
                  <th style={{ textAlign: "right" }}>Importe</th><th style={{ width: 44 }}></th>
                </tr></thead>
                <tbody>
                  {[...data.expenses].sort((a, b) => (b.date || "").localeCompare(a.date || "")).map(e => (
                    <tr key={e.id}>
                      <td className="muted">{_finDate(e.date)}</td>
                      <td style={{ fontWeight: 500 }}>{e.concept}</td>
                      <td className="muted">{e.category}</td>
                      <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{_eur(e.amount)}</td>
                      <td style={{ textAlign: "right" }}>
                        <button className="btn ghost icon-only sm" onClick={() => delExp(e.id)} title="Eliminar"><Icon name="trash" size={13} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
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

Object.assign(window, { AgencyBilling, AgencyProjects, SimplePage, SettingsPage, TasksBoard, ProjectTaskColumn, TaskRow });

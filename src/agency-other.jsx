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
const TasksBoard = ({ navigate, openModal }) => {
  const D = window.Data;
  D.useStore();

  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(new Date());

  // Sliding pill for day selector
  const daysContainerRef = useRef(null);
  const dayItemRefs      = useRef({});
  const [dayPill, setDayPill] = useState(null);
  const firstDayPill     = useRef(true);
  const [taskModal, setTaskModal] = useState(null); // { task, pid }

  useEffect(() => {
    const key = new Date(selectedDay).toDateString();
    const el  = dayItemRefs.current[key];
    const container = daysContainerRef.current;
    if (!el || !container) return;
    const eR = el.getBoundingClientRect();
    const cR = container.getBoundingClientRect();
    const top = eR.top - cR.top + container.scrollTop;
    if (firstDayPill.current) {
      firstDayPill.current = false;
      setDayPill({ top, height: eR.height, animated: false });
    } else {
      setDayPill({ top, height: eR.height, animated: true });
    }
  }, [selectedDay]);

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
  const donePct  = allTasks.length
    ? Math.round(allTasks.filter(t => t.column === "done").length / allTasks.length * 100) : 0;

  // Selected day as YYYY-MM-DD string
  const selDateStr = (() => {
    const d = new Date(selectedDay);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  })();

  // Filter tasks to only those matching the selected day
  const dayTasks = allTasks.filter(t => t.deadline === selDateStr);

  // Build groups: client → [projects + tasks]  — only with tasks for selected day
  const clientColorMap = {};
  D.CLIENTS.forEach((c, i) => { clientColorMap[c.id] = C_DOTS[i % C_DOTS.length]; });

  const groupMap = {};
  D.PROJECTS.forEach(p => {
    const tasks = (D.TASKS[p.id] || []).filter(t => t.deadline === selDateStr);
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

  // __none__ tasks: only for selected day
  const noProj = (D.TASKS["__none__"] || []).filter(t => t.deadline === selDateStr);
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
    <div style={{ display:"flex", height:"100vh", overflow:"hidden" }}>

      {/* ── Left: week selector ───────────────────── */}
      <div style={{
        width:260, flexShrink:0,
        borderRight:"0.5px solid var(--border)",
        display:"flex", flexDirection:"column",
        justifyContent:"center",
        padding:"20px 16px 20px 20px",
        overflow:"hidden",
      }}>
        {/* Month nav — FIRST, large centered */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <button onClick={() => setWeekOffset(o => o-1)}
            style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)", padding:"6px 8px", borderRadius:8, display:"flex", alignItems:"center" }}>
            <Icon name="chevron-left" size={16}/>
          </button>
          <span style={{ fontSize:26, fontWeight:400, letterSpacing:"-1px", color:"var(--text)" }}>
            {MON_ES[weekDays[3].getMonth()]}
          </span>
          <button onClick={() => setWeekOffset(o => o+1)}
            style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)", padding:"6px 8px", borderRadius:8, display:"flex", alignItems:"center" }}>
            <Icon name="chevron-right" size={16}/>
          </button>
        </div>

        {/* Progress — below month nav, in a card */}
        <div style={{ background:"rgba(255,255,255,0.04)", border:"0.5px solid var(--border)", borderRadius:12, padding:"12px 14px", marginBottom:14 }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"var(--text-subtle)", marginBottom:8, letterSpacing:"0.05em", textTransform:"uppercase", fontWeight:500 }}>
            <span>Daily Progress</span>
            <span style={{ fontWeight:600, color:"var(--text-muted)" }}>{donePct}%</span>
          </div>
          <div style={{ height:3, background:"var(--border)", borderRadius:99 }}>
            <div style={{ width:`${donePct}%`, height:"100%", background:"var(--accent)", borderRadius:99, transition:"width .4s" }}/>
          </div>
        </div>

        {/* Day rows — current week + next weeks dimmed to fill space */}
        {(() => {
          const nextDays = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(weekDays[6]); d.setDate(weekDays[6].getDate() + 1 + i); return d;
          });
          const allDays = weekDays.map(d => ({ d, dimmed: false }))
            .concat(nextDays.map(d => ({ d, dimmed: true })));
          return (
            <div ref={daysContainerRef} style={{ position:"relative", display:"flex", flexDirection:"column", gap:6 }}>
              {/* Sliding pill — sits behind the day boxes */}
              {dayPill && (
                <div style={{
                  position:"absolute", left:0, right:0,
                  top: dayPill.top, height: dayPill.height,
                  background:"rgba(158,154,229,0.18)",
                  borderRadius:10, pointerEvents:"none", zIndex:0,
                  transition: dayPill.animated ? "top 0.22s cubic-bezier(0.4,0,0.2,1)" : "none",
                }}/>
              )}
              {allDays.map(({ d, dimmed }) => {
                const dMid = new Date(d); dMid.setHours(0,0,0,0);
                const isToday = dMid.getTime() === todayMid.getTime();
                const isSel   = dMid.getTime() === selMid.getTime();
                const dayTasks = allTasks.filter(t => {
                  if (!t.deadline) return false;
                  const td = new Date(t.deadline + "T00:00:00"); td.setHours(0,0,0,0);
                  return td.getTime() === dMid.getTime();
                });
                return (
                  <div
                    key={d.toISOString()}
                    ref={el => { dayItemRefs.current[d.toDateString()] = el; }}
                    onClick={() => setSelectedDay(new Date(d))}
                    style={{
                      position:"relative", zIndex:1,
                      display:"flex", alignItems:"center", gap:12,
                      padding:"7px 12px", borderRadius:10, cursor:"pointer",
                      background: isSel ? "transparent" : "rgba(255,255,255,0.035)",
                      border: isSel ? "none" : "0.5px solid var(--border)",
                      opacity: dimmed ? 0.38 : 1,
                      transition: "opacity .15s",
                    }}>
                    {/* Day name */}
                    <span style={{ fontSize:13, width:28, letterSpacing:"-0.2px", flexShrink:0,
                      color: isSel ? "var(--accent)" : "var(--text-subtle)", fontWeight: isSel ? 500 : 400 }}>
                      {DAY_ES[d.getDay()]}
                    </span>
                    {/* Day number */}
                    <span style={{ fontSize:20, fontWeight:400, letterSpacing:"-0.5px", flex:1,
                      color: isSel ? "#c8c5f2" : isToday ? "var(--text)" : "var(--text-muted)" }}>
                      {d.getDate()}
                    </span>
                    {/* Today dot */}
                    {isToday && (
                      <span style={{ width:5, height:5, borderRadius:"50%", background:"var(--accent)", flexShrink:0 }}/>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}

      </div>

      {/* ── Right: tasks grouped by client ───────── */}
      <div style={{ flex:1, overflowY:"auto", padding:"28px 32px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28, paddingBottom:20, borderBottom:"0.5px solid var(--border)" }}>
          <div>
            <h1 style={{ margin:0, fontSize:22, fontWeight:400, letterSpacing:"-0.96px" }}>Tareas</h1>
            <div style={{ fontSize:13, color:"var(--text-muted)", marginTop:4, letterSpacing:"-0.5px" }}>
              {DAY_ES[new Date(selectedDay).getDay()]} {new Date(selectedDay).getDate()} {MON_ES[new Date(selectedDay).getMonth()]} · {dayTasks.filter(t => t.column !== "done").length} pendientes
            </div>
          </div>
          <button className="btn primary sm" onClick={() => openModal("newTask", { date: selDateStr })}>
            <Icon name="plus" size={13}/> Nueva tarea
          </button>
        </div>

        {groups.length === 0 && (
          <div style={{ textAlign:"center", padding:"60px 0", color:"var(--text-subtle)", fontSize:14, letterSpacing:"-0.5px" }}>
            Sin tareas para este día — <button className="btn ghost sm" onClick={() => openModal("newTask", { date: selDateStr })}>crear una</button>
          </div>
        )}

        {groups.map(group => (
          <div key={group.clientId} style={{ marginBottom:32 }}>
            {/* Client header */}
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:group.color, flexShrink:0 }}/>
              <span style={{ fontSize:11, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--text-muted)" }}>
                {group.clientName}
              </span>
            </div>

            {/* Task rows — no individual cards, flat rows with divider */}
            {group.projects.map(({ project, tasks }) => tasks.map((t, idx) => {
              const pid = project?.id || "__none__";
              const isDone = t.column === "done";
              const colLabel = { todo:"Por hacer", doing:"En curso", review:"Revisión" }[t.column];
              const isLast = idx === tasks.length - 1;
              const prog = t.progress || 0;
              return (
                <div key={t.id}
                  onClick={() => setTaskModal({ task: t, pid })}
                  style={{
                    display:"flex", alignItems:"center", gap:14,
                    padding:"12px 4px", cursor:"pointer",
                    borderBottom: isLast ? "none" : "0.5px solid var(--border)",
                  }}>
                  {/* Large circle toggle */}
                  <button style={{
                    width:40, height:40, borderRadius:"50%", flexShrink:0,
                    border: isDone ? "2px solid var(--accent)" : "1.5px solid rgba(255,255,255,0.18)",
                    background: "transparent",
                    cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                    padding:0, transition:"all .18s",
                  }}>
                    {isDone
                      ? <Icon name="check" size={15} style={{ color:"var(--accent)" }}/>
                      : <Icon name="x" size={13} style={{ color:"rgba(255,255,255,0.22)" }}/>
                    }
                  </button>
                  {/* Title + subtitle */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, letterSpacing:"-0.5px", color: isDone ? "var(--text-subtle)" : "var(--text)" }}>
                      {t.title}
                    </div>
                    <div style={{ fontSize:11, color:"var(--text-subtle)", marginTop:2, letterSpacing:"-0.2px" }}>
                      {project ? project.name : (isDone ? "Completada" : colLabel || "Por hacer")}
                      {t.deadline ? ` · ${new Date(t.deadline+"T00:00:00").toLocaleDateString("es-ES",{day:"numeric",month:"short"})}` : ""}
                    </div>
                  </div>
                  {/* Progress pill — only when > 0 */}
                  {prog > 0 && !isDone && (
                    <span style={{ fontSize:11, color:"var(--accent)", background:"var(--accent-soft)", border:"0.5px solid rgba(158,154,229,0.3)", borderRadius:99, padding:"2px 8px", flexShrink:0 }}>
                      {prog}%
                    </span>
                  )}
                  <Icon name="chevron-right" size={14} style={{ color:"rgba(255,255,255,0.15)", flexShrink:0 }}/>
                </div>
              );
            }))}

            <div style={{ height:"0.5px", background:"var(--border)", marginTop:4 }}/>
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
        <button className="btn primary" onClick={() => openModal("newProject")}><Icon name="plus" size={13}/> Nuevo proyecto</button>
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

const AgencyBilling = ({ openModal }) => {
  const toast = useToast();
  const [filter,       setFilter]       = useState("all");
  const [menuOpen,     setMenuOpen]     = useState(null);
  const [invoices,     setInvoices]     = useState([]);
  const [balance,      setBalance]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [buckets,      setBuckets]      = useState([]);
  const [period,       setPeriod]       = useState("30d");
  const [periodTotal,  setPeriodTotal]  = useState(0);
  const [showCreate,   setShowCreate]   = useState(false);
  const [error,        setError]        = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [balRes, invRes] = await Promise.all([
        _stripeApi("balance"),
        _stripeApi("invoices", { limit: 100 }),
      ]);
      if (balRes.ok) setBalance(balRes);
      if (invRes.ok) setInvoices(invRes.invoices || []);
      else setError(invRes.error || "Error cargando facturas");
    } catch (e) {
      setError("No se pudo conectar con el servidor. ¿Está mail_server.py en marcha?");
    }
    setLoading(false);
  };

  const loadChart = async (p) => {
    setChartLoading(true);
    try {
      const res = await _stripeApi("revenue", { period: p });
      if (res.ok) { setBuckets(res.buckets || []); setPeriodTotal(res.total || 0); }
    } catch {}
    setChartLoading(false);
  };

  const changePeriod = (p) => { setPeriod(p); loadChart(p); };

  React.useEffect(() => { load(); loadChart("30d"); }, []);

  const filtered = invoices.filter(i =>
    filter === "all"      ? true :
    filter === "pending"  ? i.status === "open"  :
    filter === "paid"     ? i.status === "paid"  :
    filter === "void"     ? (i.status === "void" || i.status === "uncollectible") : true
  );

  const totals = {
    paid:    invoices.filter(i => i.status === "paid").reduce((a,b) => a + b.amount_paid, 0),
    pending: invoices.filter(i => i.status === "open").reduce((a,b) => a + b.amount, 0),
    draft:   invoices.filter(i => i.status === "draft").length,
  };

  const menuBtn = {
    display:"flex", alignItems:"center", gap:8, width:"100%",
    padding:"7px 10px", border:0, background:"transparent",
    color:"var(--text)", fontSize:13, borderRadius:6,
    cursor:"pointer", fontFamily:"inherit", textAlign:"left",
  };

  return (
    <div className="page" onClick={() => setMenuOpen(null)}>
      <div className="page-head">
        <div>
          <h1>Facturación</h1>
          <div className="sub" style={{display:"flex", alignItems:"center", gap:6}}>
            <svg width="32" height="12" viewBox="0 0 60 25" style={{opacity:0.5}}><text x="0" y="20" fontFamily="Inter" fontWeight="700" fontSize="22" fill="currentColor">stripe</text></svg>
            {loading ? "Cargando…" : error ? "Error de conexión" : `${invoices.length} facturas`}
          </div>
        </div>
        <div style={{display:"flex", gap:8}}>
          <button className="btn ghost sm" onClick={load} disabled={loading}>
            <Icon name="refresh-cw" size={13}/> Actualizar
          </button>
          <button className="btn primary sm" onClick={() => setShowCreate(true)}>
            <Icon name="plus" size={13}/> Nueva factura
          </button>
        </div>
      </div>

      {error && (
        <div style={{display:"flex", gap:10, padding:"12px 16px", marginBottom:16,
          background:"var(--red-soft)", border:"0.5px solid var(--red)",
          borderRadius:10, fontSize:13, color:"var(--red)"}}>
          <Icon name="alert-triangle" size={14} style={{flexShrink:0, marginTop:1}}/>{error}
        </div>
      )}

      {/* ── Métricas ── */}
      <div className="rg-4" style={{marginBottom:18}}>
        <div className="card"><div className="card-body">
          <div className="metric-label">Disponible en Stripe</div>
          <div className="metric-value">{balance ? _cents(balance.available) : "—"}</div>
          <div className="metric-delta">Saldo liquidado</div>
        </div></div>
        <div className="card"><div className="card-body">
          <div className="metric-label">En tránsito</div>
          <div className="metric-value" style={{color:"var(--blue)"}}>{balance ? _cents(balance.pending) : "—"}</div>
          <div className="metric-delta">Pendiente de liquidar</div>
        </div></div>
        <div className="card"><div className="card-body">
          <div className="metric-label">Cobrado (facturas)</div>
          <div className="metric-value">{_cents(totals.paid)}</div>
          <div className="metric-delta">{invoices.filter(i=>i.status==="paid").length} pagadas</div>
        </div></div>
        <div className="card"><div className="card-body">
          <div className="metric-label">Por cobrar</div>
          <div className="metric-value" style={{color:"var(--amber)"}}>{_cents(totals.pending)}</div>
          <div className="metric-delta">{invoices.filter(i=>i.status==="open").length} abiertas</div>
        </div></div>
      </div>

      {/* ── Gráfico de ingresos ── */}
      <div className="card" style={{marginBottom:18}}>
        <div className="card-header">
          <div style={{flex:1}}>
            <div style={{fontWeight:500, fontSize:13}}>Ingresos cobrados</div>
            {!chartLoading && (
              <div style={{fontSize:12, color:"var(--text-subtle)", marginTop:2}}>
                {_cents(periodTotal)} en {PERIODS.find(p=>p.id===period)?.label}
              </div>
            )}
          </div>
          <div className="seg">
            {PERIODS.map(p => (
              <button key={p.id} className={period === p.id ? "active" : ""} onClick={() => changePeriod(p.id)}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="card-body" style={{padding:"20px 32px"}}>
          <RevenueChart buckets={buckets} loading={chartLoading}/>
        </div>
      </div>

      {/* ── Tabla de facturas ── */}
      <div className="card">
        <div className="card-header">
          <div className="seg">
            {[{id:"all",label:"Todas"},{id:"pending",label:"Pendientes"},{id:"paid",label:"Pagadas"},{id:"void",label:"Anuladas"}].map(f => (
              <button key={f.id} className={filter === f.id ? "active" : ""} onClick={() => setFilter(f.id)}>{f.label}</button>
            ))}
          </div>
          <div className="row tight muted xsmall">
            <div style={{width:7,height:7,borderRadius:"50%",background:"var(--green)"}}/>
            Stripe conectado
          </div>
        </div>
        <div className="card-body flush">
          {loading ? (
            <div style={{padding:60, textAlign:"center", color:"var(--text-subtle)", fontSize:13}}>Cargando facturas…</div>
          ) : filtered.length === 0 ? (
            <Empty icon="receipt" title="Sin facturas" sub="No hay facturas con esos filtros"/>
          ) : (
            <table className="table">
              <thead><tr>
                <th>Nº</th><th>Cliente</th><th>Fecha</th><th>Vencimiento</th>
                <th style={{textAlign:"right"}}>Importe</th><th>Estado</th><th style={{width:50}}></th>
              </tr></thead>
              <tbody>
                {filtered.map(inv => (
                  <tr key={inv.stripe_id}>
                    <td style={{fontFamily:"var(--font-mono)", fontSize:11, color:"var(--text-subtle)"}}>{inv.id}</td>
                    <td style={{maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{inv.customer}</td>
                    <td className="muted">{_tsDate(inv.created)}</td>
                    <td className="muted">{inv.due_date ? _tsDate(inv.due_date) : "—"}</td>
                    <td style={{textAlign:"right", fontVariantNumeric:"tabular-nums", fontWeight:500}}>
                      {_cents(inv.amount, inv.currency)}
                    </td>
                    <td><StripeChip status={inv.status}/></td>
                    <td style={{position:"relative"}} onClick={e => e.stopPropagation()}>
                      <button className="btn ghost icon-only sm"
                        onClick={() => setMenuOpen(menuOpen === inv.stripe_id ? null : inv.stripe_id)}>
                        <Icon name="more-h" size={13}/>
                      </button>
                      {menuOpen === inv.stripe_id && (
                        <div style={{
                          position:"absolute", right:12, top:"calc(100% - 6px)", zIndex:10,
                          background:"var(--bg-elev)", border:"0.5px solid var(--border-strong)",
                          borderRadius:10, padding:4, minWidth:200,
                          boxShadow:"0 8px 24px rgba(0,0,0,0.3)",
                        }}>
                          {inv.pdf_url && (
                            <a href={inv.pdf_url} target="_blank" rel="noreferrer"
                              style={{...menuBtn, textDecoration:"none"}}
                              onClick={() => setMenuOpen(null)}>
                              <Icon name="download" size={13}/> Descargar PDF
                            </a>
                          )}
                          {inv.hosted_url && (
                            <a href={inv.hosted_url} target="_blank" rel="noreferrer"
                              style={{...menuBtn, textDecoration:"none"}}
                              onClick={() => setMenuOpen(null)}>
                              <Icon name="external-link" size={13}/> Ver en Stripe
                            </a>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <CreateInvoiceModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => { load(); loadChart(period); }}
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
  const svgRef  = useRef(null);
  const dragRef = useRef({ angle: 0, progress: 0 });

  const taskId = task ? task.id : null;
  useEffect(() => {
    if (open && task) {
      setProgress(task.progress || 0);
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

  if (!open || !task) return null;

  // Arc geometry — Outdomode drum-selector style.
  // viewBox 640×170. Huge circle center at (320, 456), apex (320, 0) = top of SVG.
  // The ▼ indicator is FIXED at the apex (top-center) always.
  // The labels ROTATE: value p appears at angle  90 + (progress − p) * ARC_SWEEP/100
  // so the current progress is always directly under the fixed ▼.
  const CX = 320, CY = 456, R = 456;
  const ARC_SWEEP = 44;   // total degrees for the 0-100% range

  const toPt = (stdDeg, r = R) => {
    const rad = stdDeg * Math.PI / 180;
    return [CX + r * Math.cos(rad), CY - r * Math.sin(rad)];
  };

  // Background arc: static — full visible arc left edge → apex → right edge
  const bgY = CY - Math.sqrt(R * R - CX * CX); // ≈ 131
  const bgArcPath = `M 0 ${bgY.toFixed(1)} A ${R} ${R} 0 0 1 640 ${bgY.toFixed(1)}`;

  // Where label for value p sits on the arc given current progress
  const tickAngle = (p) => 90 + (progress - p) * ARC_SWEEP / 100;

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
  };

  const moveDrag = (clientX, clientY) => {
    const angle  = getMouseAngle(clientX, clientY);
    const delta  = (angle - dragRef.current.angle) * 100 / ARC_SWEEP;
    const newP   = Math.round(Math.max(0, Math.min(100, dragRef.current.progress + delta)));
    setProgress(newP);
  };

  const TICKS = [0, 25, 50, 75, 100];
  const statusLabel = progress === 100 ? "COMPLETADA" : progress === 0 ? "PENDIENTE" : "EN CURSO";

  const confirmProgress = () => { onUpdate({ progress }); onClose(); };

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
      style={{
        position:"fixed", inset:0, zIndex:500,
        background:"rgba(0,0,0,0.82)", backdropFilter:"blur(18px)",
        display:"flex", alignItems:"center", justifyContent:"center",
        animation:"fade .15s ease-out",
      }}
      onClick={onClose}
      onMouseMove={e => { if (dragging) { e.preventDefault(); moveDrag(e.clientX, e.clientY); }}}
      onMouseUp={() => setDragging(false)}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width:"100%", maxWidth:540,
          background:"#111111",
          border:"0.5px solid rgba(255,255,255,0.08)",
          borderRadius:32, overflow:"hidden",
          animation:"pop .2s cubic-bezier(.2,.8,.2,1)",
          display:"flex", flexDirection:"column",
          userSelect:"none",
        }}
      >
        {/* Top bar */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 20px 0" }}>
          {btnCircle(onClose, <Icon name="x" size={14}/>)}

          <div style={{ fontSize:13, color:"var(--text-subtle)", letterSpacing:"-0.4px", maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {task.title}
          </div>

          {/* Three-dots menu */}
          <div style={{ position:"relative" }}>
            {btnCircle(e => { e.stopPropagation(); setDotsOpen(o => !o); },
              <span style={{ fontSize:16, letterSpacing:"0.04em", fontWeight:700, lineHeight:1 }}>···</span>
            )}
            {dotsOpen && (
              <div
                onClick={e => e.stopPropagation()}
                style={{
                  position:"absolute", right:0, top:44, zIndex:600,
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
            onTouchEnd={() => setDragging(false)}
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

              return (
                <g key={pct} opacity={fade}>
                  <line x1={t1x.toFixed(1)} y1={t1y.toFixed(1)} x2={t2x.toFixed(1)} y2={t2y.toFixed(1)}
                    stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round"/>
                  <text x={lx.toFixed(1)} y={ly.toFixed(1)} textAnchor="middle" dominantBaseline="middle"
                    fontSize="12" fill="rgba(255,255,255,0.3)" fontFamily="var(--font-sans)">{pct}%</text>
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

// Panel · Tareas (Figma 125:37): semana con anillos de progreso, pendientes,
// completadas (apiladas) y caja para crear tareas. Mismos datos y criterios
// que la página de Tareas anterior (tareas del día + pasos de rutinas).
(() => {
const { useState, useEffect } = React;
const PN = window.PN;

PIcon.add({
  "chk-off": [24, `<path d="M12 22.5C17.799 22.5 22.5 17.799 22.5 12C22.5 6.20101 17.799 1.5 12 1.5C6.20101 1.5 1.5 6.20101 1.5 12C1.5 17.799 6.20101 22.5 12 22.5Z" stroke="white" stroke-opacity="0.35" stroke-width="1.5"/>`],
  "chk-on":  [24, `<path d="M12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23Z" fill="#F5F5F5"/><path d="M7.5 12.3L10.5 15.3L16.5 9" stroke="#0A0A0A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`],
  "chev":    [16, `<path d="M6 4L10 8L6 12" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>`],
});

const _noClient = (s) => !s || ["—", "-", "Interno"].includes(String(s).trim());
const _addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const _monday = (d) => { const x = new Date(d); x.setHours(12, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };

// Anillo del día: pista + arco de progreso (desde arriba, en sentido horario)
const DayRing = ({ pct, strong }) => {
  const r = 24.5, c = 2 * Math.PI * r, p = Math.max(0, Math.min(100, pct || 0));
  return (
    <svg width="54" height="54" viewBox="0 0 54 54" fill="none" style={{ position: "absolute", inset: 0 }}>
      <circle cx="27" cy="27" r={r} stroke="white" strokeOpacity="0.08" strokeWidth="2.5"/>
      {p > 0 && (
        <circle cx="27" cy="27" r={r} stroke="#F5F5F5" strokeOpacity={strong ? 1 : 0.45} strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray={`${(p / 100) * c} ${c}`} transform="rotate(-90 27 27)" style={{ transition: "stroke-dasharray .5s cubic-bezier(.22,1,.36,1)" }}/>
      )}
    </svg>
  );
};

// Fila de tarea: check, título + meta, etiqueta opcional y flecha
const Row = ({ title, meta, checked, onCheck, onOpen, badge }) => (
  <div className={"pn-task" + (checked ? " done" : "")} role="button" onClick={onOpen}>
    <button className="pn-task-chk" aria-label={checked ? "Marcar como pendiente" : "Marcar como hecha"}
      onClick={e => { e.stopPropagation(); onCheck(); }}>
      <PIcon name={checked ? "chk-on" : "chk-off"}/>
    </button>
    <div className="pn-task-txt">
      <p className="t-card-title">{title}</p>
      {meta ? <p className="t-small meta">{meta}</p> : null}
    </div>
    {badge ? <span className="pn-badge-red t-caption">{badge}</span> : null}
    <span className="pn-task-go"><PIcon name="chev"/></span>
  </div>
);

const PanelTasks = ({ navigate, openModal, initialDate }) => {
  const D = window.Data; D.useStore();
  const todayStr = D.today ? D.today() : PN.ymd(new Date());
  const [sel, setSel] = useState(initialDate || todayStr);
  const [doneOpen, setDoneOpen] = useState(false);
  const [taskModal, setTaskModal] = useState(null);       // { task, pid }
  const [routineModal, setRoutineModal] = useState(null); // { r, it }
  const [draft, setDraft] = useState("");
  const [assign, setAssign] = useState(null);             // cliente para la tarea rápida
  useEffect(() => { setDoneOpen(false); }, [sel]);

  const isToday = sel === todayStr;
  const projIds = new Set((D.PROJECTS || []).map(p => p.id));
  const all = Object.entries(D.TASKS || {})
    .filter(([pid]) => pid === "__none__" || projIds.has(pid))
    .flatMap(([pid, arr]) => (arr || []).map(t => ({ ...t, _pid: pid })));
  // Igual que antes: del día seleccionado, y si es hoy también las vencidas pendientes
  const matches = (t) => t.deadline === sel || (isToday && t.deadline && t.deadline < sel && t.column !== "done");
  const dayTasks = all.filter(matches);

  const routines = D.routinesForDay ? D.routinesForDay(sel) : [];
  const steps = [];
  routines.forEach(r => (r.items || []).filter(it => D.stepAppliesOn ? D.stepAppliesOn(it, sel) : true).forEach(it => {
    const pct = D.routineItemProgress ? D.routineItemProgress(r.id, sel, it.id) : (D.routineItemDone(r.id, sel, it.id) ? 100 : 0);
    steps.push({ r, it, pct, done: pct >= 100 });
  }));

  const metaOf = (t) => {
    const p = (D.PROJECTS || []).find(x => x.id === t._pid);
    const cl = t.clientId ? (D.CLIENTS || []).find(c => c.id === t.clientId) : null;
    const who = p ? (_noClient(p.clientName) ? p.name : p.clientName) : (cl ? (cl.company || cl.name) : (t.clientName || "General"));
    const n = PN.dayDiff(t.deadline);
    const when = n === null ? "" : n < 0 ? (n === -1 ? "Venció ayer" : `Venció ${PN.relDay(t.deadline)}`) : PN.cap(PN.shortDay(t.deadline));
    return [who, when].filter(Boolean).join("  ·  ");
  };
  const byDate = (a, b) => ((a.deadline || "") < (b.deadline || "") ? -1 : (a.deadline || "") > (b.deadline || "") ? 1 : (a.id || "") < (b.id || "") ? -1 : 1);
  const pending = dayTasks.filter(t => t.column !== "done").sort(byDate);
  const done = dayTasks.filter(t => t.column === "done").sort(byDate);
  const pSteps = steps.filter(s => !s.done), dSteps = steps.filter(s => s.done);
  const nPending = pending.length + pSteps.length;
  const doneNames = done.map(t => t.title).concat(dSteps.map(s => s.it.text));

  const toggleTask = (t) => D.moveTask(t._pid, t.id, t.column === "done" ? "todo" : "done");
  const openStep = (s) => {
    setRoutineModal({ r: s.r, it: s.it });
  };

  const taskRow = (t) => (
    <Row key={t.id} title={t.title} meta={metaOf(t)} checked={t.column === "done"}
      badge={t.column !== "done" && t.deadline && t.deadline < todayStr ? "Atrasada" : null}
      onCheck={() => toggleTask(t)} onOpen={() => setTaskModal({ task: t, pid: t._pid })}/>
  );
  const stepRow = (s) => (
    <Row key={s.r.id + ":" + s.it.id} title={s.it.text} checked={s.done}
      meta={["Rutina · " + s.r.title, !s.done && s.pct > 0 ? `${s.pct}%` : ""].filter(Boolean).join("  ·  ")}
      onCheck={() => D.toggleRoutineItem(s.r.id, sel, s.it.id)} onOpen={() => openStep(s)}/>
  );

  // Semana (lunes → domingo) del día seleccionado
  const mon = _monday(PN.parseYmd(sel));
  const week = Array.from({ length: 7 }, (_, i) => _addDays(mon, i));
  const dayPct = (ds) => {
    const ts = all.filter(t => t.deadline === ds);
    let tot = ts.length, ok = ts.filter(t => t.column === "done").length;
    (D.routinesForDay ? D.routinesForDay(ds) : []).forEach(r => (r.items || []).filter(it => D.stepAppliesOn ? D.stepAppliesOn(it, ds) : true).forEach(it => {
      tot += 1; if (D.routineItemDone(r.id, ds, it.id)) ok += 1;
    }));
    return tot ? Math.round(ok / tot * 100) : 0;
  };
  const shiftWeek = (n) => setSel(PN.ymd(_addDays(PN.parseYmd(sel), n * 7)));
  useEffect(() => {
    const k = (e) => {
      if (e.target && /input|textarea/i.test(e.target.tagName)) return;
      if (e.key === "ArrowLeft") shiftWeek(-1);
      if (e.key === "ArrowRight") shiftWeek(1);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });
  let wheelAcc = 0, wheelT = 0;
  const onWheel = (e) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    const now = Date.now(); if (now - wheelT < 450) return;
    wheelAcc += e.deltaX;
    if (Math.abs(wheelAcc) > 40) { shiftWeek(wheelAcc > 0 ? 1 : -1); wheelAcc = 0; wheelT = now; }
  };

  const n = PN.dayDiff(sel);
  const title = n === 0 ? ["Tareas ", "de hoy"] : n === 1 ? ["Tareas ", "de mañana"] : n === -1 ? ["Tareas ", "de ayer"]
    : ["Tareas ", `del ${PN.DIAS[PN.parseYmd(sel).getDay()]} ${PN.parseYmd(sel).getDate()}`];

  // Caja: crea la tarea en el día seleccionado
  const clients = (D.CLIENTS || []);
  const lastClient = (() => {
    const withClient = all.filter(t => t.clientId || ((D.PROJECTS || []).find(p => p.id === t._pid) || {}).clientId);
    const t = withClient.sort((a, b) => ((b.deadline || "") > (a.deadline || "") ? 1 : -1))[0];
    if (!t) return clients[0] || null;
    const cid = t.clientId || ((D.PROJECTS || []).find(p => p.id === t._pid) || {}).clientId;
    return clients.find(c => c.id === cid) || null;
  })();
  const clientLabel = (c) => c ? (c.company || c.name) : "";
  const create = (text) => {
    const tt = (text || "").trim(); if (!tt) return;
    D.addTask({ title: tt, deadline: sel, column: "todo", clientId: assign ? assign.id : null, clientName: assign ? clientLabel(assign) : null });
    setDraft("");
  };
  const toNora = () => {
    try { sessionStorage.setItem("nora_prefill", draft.trim() ? `Crea una tarea para ${PN.relDay(sel)}: ${draft.trim()}` : `Ayúdame a crear tareas para ${PN.relDay(sel)}`); } catch (_) {}
    navigate("nora");
  };

  return (
    <div className="pn-stage">
      <div className="pn-col">
        <div className="pn-head pn-head-tasks">
          <p className="t-small" style={{ color: "var(--gray-300)", lineHeight: "17px" }}>
            {PN.longDate(PN.parseYmd(sel))} · {nPending} pendiente{nPending === 1 ? "" : "s"}
          </p>
          <h1 className="t-h2" style={{ margin: "10px 0 0", color: "var(--ink-900)" }}>{title[0]}{title[1]}</h1>
        </div>

        <div className="pn-week" onWheel={onWheel}>
          {week.map(d => {
            const ds = PN.ymd(d), on = ds === sel, today = ds === todayStr, past = ds < todayStr;
            return (
              <button key={ds} className={"pn-day" + (on ? " on" : "") + (past ? " past" : "")} onClick={() => setSel(ds)}
                aria-label={PN.longDate(d)}>
                <span className="t-caption lbl">{PN.DIAS_C[d.getDay()].toUpperCase()}</span>
                <span className="ring">
                  <DayRing pct={dayPct(ds)} strong={on}/>
                  {on && <i className="fill"/>}
                  <span className="t-title-m num">{d.getDate()}</span>
                </span>
                <i className={"dot" + (today ? " today" : "")}/>
              </button>
            );
          })}
        </div>

        <PN.ScrollArea top={315} bottom={244}>
          <div className="pn-tasks">
            {nPending === 0 && doneNames.length === 0 ? (
              <div className="pn-empty">
                <p className="t-title-m" style={{ color: "var(--ink-900)" }}>Sin tareas para {PN.relDay(sel)}</p>
                <p className="t-small" style={{ color: "var(--gray-300)" }}>Escribe una abajo para crearla.</p>
              </div>
            ) : null}
            {nPending > 0 && (
              <>
                <p className="t-caption pn-sec">Pendientes</p>
                <div className="pn-list">
                  {pending.map(taskRow)}
                  {pSteps.map(stepRow)}
                </div>
              </>
            )}
            {doneNames.length > 0 && (
              <>
                <p className="t-caption pn-sec" style={{ marginTop: nPending > 0 ? 24 : 0 }}>Completadas</p>
                {doneNames.length === 1 ? (
                  <div className="pn-list">{done.map(taskRow)}{dSteps.map(stepRow)}</div>
                ) : doneOpen ? (
                  <div className="pn-list pn-group-open">
                    {done.map(taskRow)}{dSteps.map(stepRow)}
                    <div style={{ display: "flex", justifyContent: "center" }}><PN.Pill onClick={() => setDoneOpen(false)}>Mostrar menos</PN.Pill></div>
                  </div>
                ) : (
                  <div className="pn-stack">
                    <div className="pn-task done sum" role="button" onClick={() => setDoneOpen(true)}>
                      <span className="pn-task-chk"><PIcon name="chk-on"/></span>
                      <div className="pn-task-txt">
                        <p className="t-card-title">{doneNames.length} tareas completadas</p>
                        <p className="t-small meta">{PN.listMore(doneNames.slice(0, 3), doneNames.length)}</p>
                      </div>
                      <span className="pn-task-go"><PIcon name="chev"/></span>
                    </div>
                    <div className="pn-layers"><i/><i/></div>
                  </div>
                )}
              </>
            )}
          </div>
        </PN.ScrollArea>

        <div className="pn-nora">
          <div className="pn-nora-sug">
            <PN.Pill sug onClick={() => openModal("newTask", { date: sel })}>{`Para ${PN.relDay(sel)}`}</PN.Pill>
            {lastClient && (
              <PN.Pill sug className={assign && assign.id === lastClient.id ? "on" : ""}
                onClick={() => setAssign(a => (a && a.id === lastClient.id ? null : lastClient))}>
                {`Asignar a ${clientLabel(lastClient)}`}
              </PN.Pill>
            )}
            <PN.Pill sug onClick={toNora}>Crear con Nora</PN.Pill>
          </div>
          <div className="pn-nora-box">
            <span className="clip"><PIcon name="clip"/></span>
            <input value={draft} onChange={e => setDraft(e.target.value)} placeholder={assign ? `Nueva tarea para ${clientLabel(assign)}…` : "Nueva tarea…"}
              onKeyDown={e => { if (e.key === "Enter") create(draft); }}/>
            <button className="pn-send" aria-label="Crear tarea" onClick={() => create(draft)}><PIcon name="arrow-up"/></button>
          </div>
        </div>
      </div>

      {taskModal && window.TaskProgressModal && (
        <window.TaskProgressModal task={taskModal.task} projectId={taskModal.pid} open={true}
          onClose={() => setTaskModal(null)}
          onDelete={() => { D.deleteTask(taskModal.pid, taskModal.task.id); setTaskModal(null); }}
          onUpdate={ch => D.updateTask(taskModal.pid, taskModal.task.id, ch)}
          onEdit={() => openModal("editTask", { task: taskModal.task, pid: taskModal.pid })}/>
      )}
      {routineModal && (() => {
        const metric = window._routineMetric ? window._routineMetric(routineModal.it.text) : null;
        const common = { routineId: routineModal.r.id, day: sel, itemId: routineModal.it.id, onClose: () => setRoutineModal(null) };
        if (metric === "weight" && window.WeightLogModal) return <window.WeightLogModal {...common}/>;
        if (metric === "macros" && window.MacrosLogModal) return <window.MacrosLogModal {...common}/>;
        if (metric === "steps" && window.StepsLogModal) return <window.StepsLogModal {...common} text={routineModal.it.text}/>;
        return window.TaskProgressModal ? (
          <window.TaskProgressModal routineMode open={true}
            task={{ id: "rt:" + routineModal.r.id + ":" + routineModal.it.id, title: routineModal.it.text,
              progress: D.routineItemProgress(routineModal.r.id, sel, routineModal.it.id), deadline: "",
              column: D.routineItemDone(routineModal.r.id, sel, routineModal.it.id) ? "done" : "todo" }}
            onClose={() => setRoutineModal(null)}
            onUpdate={ch => { if (ch.progress != null) D.setRoutineItemProgress(routineModal.r.id, sel, routineModal.it.id, ch.progress); }}/>
        ) : null;
      })()}
    </div>
  );
};

window.PanelTasks = PanelTasks;
})();

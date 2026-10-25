(() => {
  (() => {
    const { useState, useEffect } = React;
    const PN = window.PN;
    PIcon.add({
      "chk-off": [24, `<path d="M12 22.5C17.799 22.5 22.5 17.799 22.5 12C22.5 6.20101 17.799 1.5 12 1.5C6.20101 1.5 1.5 6.20101 1.5 12C1.5 17.799 6.20101 22.5 12 22.5Z" stroke="white" stroke-opacity="0.35" stroke-width="1.5"/>`],
      "chk-on": [24, `<path d="M12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23Z" fill="#F5F5F5"/><path d="M7.5 12.3L10.5 15.3L16.5 9" stroke="#0A0A0A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`],
      "chev": [16, `<path d="M6 4L10 8L6 12" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>`]
    });
    const _noClient = (s) => !s || ["\u2014", "-", "Interno"].includes(String(s).trim());
    const _addDays = (d, n) => {
      const x = new Date(d);
      x.setDate(x.getDate() + n);
      return x;
    };
    const _monday = (d) => {
      const x = new Date(d);
      x.setHours(12, 0, 0, 0);
      x.setDate(x.getDate() - (x.getDay() + 6) % 7);
      return x;
    };
    const DayRing = ({ pct, strong }) => {
      const r = 24.5, c = 2 * Math.PI * r, p = Math.max(0, Math.min(100, pct || 0));
      return /* @__PURE__ */ React.createElement("svg", { width: "54", height: "54", viewBox: "0 0 54 54", fill: "none", style: { position: "absolute", inset: 0 } }, /* @__PURE__ */ React.createElement("circle", { cx: "27", cy: "27", r, stroke: "white", strokeOpacity: "0.08", strokeWidth: "2.5" }), p > 0 && /* @__PURE__ */ React.createElement(
        "circle",
        {
          cx: "27",
          cy: "27",
          r,
          stroke: "#F5F5F5",
          strokeOpacity: strong ? 1 : 0.45,
          strokeWidth: "2.5",
          strokeLinecap: "round",
          strokeDasharray: `${p / 100 * c} ${c}`,
          transform: "rotate(-90 27 27)",
          style: { transition: "stroke-dasharray .5s cubic-bezier(.22,1,.36,1)" }
        }
      ));
    };
    const Row = ({ title, meta, checked, onCheck, onOpen, badge }) => /* @__PURE__ */ React.createElement("div", { className: "pn-task" + (checked ? " done" : ""), role: "button", onClick: onOpen }, /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "pn-task-chk",
        "aria-label": checked ? "Marcar como pendiente" : "Marcar como hecha",
        onClick: (e) => {
          e.stopPropagation();
          onCheck();
        }
      },
      /* @__PURE__ */ React.createElement(PIcon, { name: checked ? "chk-on" : "chk-off" })
    ), /* @__PURE__ */ React.createElement("div", { className: "pn-task-txt" }, /* @__PURE__ */ React.createElement("p", { className: "t-card-title" }, title), meta ? /* @__PURE__ */ React.createElement("p", { className: "t-small meta" }, meta) : null), badge ? /* @__PURE__ */ React.createElement("span", { className: "pn-badge-red t-caption" }, badge) : null, /* @__PURE__ */ React.createElement("span", { className: "pn-task-go" }, /* @__PURE__ */ React.createElement(PIcon, { name: "chev" })));
    const PanelTasks = ({ navigate, openModal, initialDate }) => {
      const D = window.Data;
      D.useStore();
      const todayStr = D.today ? D.today() : PN.ymd(/* @__PURE__ */ new Date());
      const [sel, setSel] = useState(initialDate || todayStr);
      const [doneOpen, setDoneOpen] = useState(false);
      const [taskModal, setTaskModal] = useState(null);
      const [routineModal, setRoutineModal] = useState(null);
      const [draft, setDraft] = useState("");
      const [assign, setAssign] = useState(null);
      useEffect(() => {
        setDoneOpen(false);
      }, [sel]);
      const isToday = sel === todayStr;
      const projIds = new Set((D.PROJECTS || []).map((p) => p.id));
      const all = Object.entries(D.TASKS || {}).filter(([pid]) => pid === "__none__" || projIds.has(pid)).flatMap(([pid, arr]) => (arr || []).map((t) => ({ ...t, _pid: pid })));
      const matches = (t) => t.deadline === sel || isToday && t.deadline && t.deadline < sel && t.column !== "done";
      const dayTasks = all.filter(matches);
      const routines = D.routinesForDay ? D.routinesForDay(sel) : [];
      const steps = [];
      routines.forEach((r) => (r.items || []).filter((it) => D.stepAppliesOn ? D.stepAppliesOn(it, sel) : true).forEach((it) => {
        const pct = D.routineItemProgress ? D.routineItemProgress(r.id, sel, it.id) : D.routineItemDone(r.id, sel, it.id) ? 100 : 0;
        steps.push({ r, it, pct, done: pct >= 100 });
      }));
      const metaOf = (t) => {
        const p = (D.PROJECTS || []).find((x) => x.id === t._pid);
        const cl = t.clientId ? (D.CLIENTS || []).find((c) => c.id === t.clientId) : null;
        const who = p ? _noClient(p.clientName) ? p.name : p.clientName : cl ? cl.company || cl.name : t.clientName || "General";
        const n2 = PN.dayDiff(t.deadline);
        const when = n2 === null ? "" : n2 < 0 ? n2 === -1 ? "Venci\xF3 ayer" : `Venci\xF3 ${PN.relDay(t.deadline)}` : PN.cap(PN.shortDay(t.deadline));
        return [who, when].filter(Boolean).join("  \xB7  ");
      };
      const byDate = (a, b) => (a.deadline || "") < (b.deadline || "") ? -1 : (a.deadline || "") > (b.deadline || "") ? 1 : (a.id || "") < (b.id || "") ? -1 : 1;
      const pending = dayTasks.filter((t) => t.column !== "done").sort(byDate);
      const done = dayTasks.filter((t) => t.column === "done").sort(byDate);
      const pSteps = steps.filter((s) => !s.done), dSteps = steps.filter((s) => s.done);
      const nPending = pending.length + pSteps.length;
      const doneNames = done.map((t) => t.title).concat(dSteps.map((s) => s.it.text));
      const toggleTask = (t) => D.moveTask(t._pid, t.id, t.column === "done" ? "todo" : "done");
      const openStep = (s) => {
        setRoutineModal({ r: s.r, it: s.it });
      };
      const taskRow = (t) => /* @__PURE__ */ React.createElement(
        Row,
        {
          key: t.id,
          title: t.title,
          meta: metaOf(t),
          checked: t.column === "done",
          badge: t.column !== "done" && t.deadline && t.deadline < todayStr ? "Atrasada" : null,
          onCheck: () => toggleTask(t),
          onOpen: () => setTaskModal({ task: t, pid: t._pid })
        }
      );
      const stepRow = (s) => /* @__PURE__ */ React.createElement(
        Row,
        {
          key: s.r.id + ":" + s.it.id,
          title: s.it.text,
          checked: s.done,
          meta: ["Rutina \xB7 " + s.r.title, !s.done && s.pct > 0 ? `${s.pct}%` : ""].filter(Boolean).join("  \xB7  "),
          onCheck: () => D.toggleRoutineItem(s.r.id, sel, s.it.id),
          onOpen: () => openStep(s)
        }
      );
      const mon = _monday(PN.parseYmd(sel));
      const week = Array.from({ length: 7 }, (_, i) => _addDays(mon, i));
      const dayPct = (ds) => {
        const ts = all.filter((t) => t.deadline === ds);
        let tot = ts.length, ok = ts.filter((t) => t.column === "done").length;
        (D.routinesForDay ? D.routinesForDay(ds) : []).forEach((r) => (r.items || []).filter((it) => D.stepAppliesOn ? D.stepAppliesOn(it, ds) : true).forEach((it) => {
          tot += 1;
          if (D.routineItemDone(r.id, ds, it.id)) ok += 1;
        }));
        return tot ? Math.round(ok / tot * 100) : 0;
      };
      const shiftWeek = (n2) => setSel(PN.ymd(_addDays(PN.parseYmd(sel), n2 * 7)));
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
        const now = Date.now();
        if (now - wheelT < 450) return;
        wheelAcc += e.deltaX;
        if (Math.abs(wheelAcc) > 40) {
          shiftWeek(wheelAcc > 0 ? 1 : -1);
          wheelAcc = 0;
          wheelT = now;
        }
      };
      const n = PN.dayDiff(sel);
      const title = n === 0 ? ["Tareas ", "de hoy"] : n === 1 ? ["Tareas ", "de ma\xF1ana"] : n === -1 ? ["Tareas ", "de ayer"] : ["Tareas ", `del ${PN.DIAS[PN.parseYmd(sel).getDay()]} ${PN.parseYmd(sel).getDate()}`];
      const clients = D.CLIENTS || [];
      const lastClient = (() => {
        const withClient = all.filter((t2) => t2.clientId || ((D.PROJECTS || []).find((p) => p.id === t2._pid) || {}).clientId);
        const t = withClient.sort((a, b) => (b.deadline || "") > (a.deadline || "") ? 1 : -1)[0];
        if (!t) return clients[0] || null;
        const cid = t.clientId || ((D.PROJECTS || []).find((p) => p.id === t._pid) || {}).clientId;
        return clients.find((c) => c.id === cid) || null;
      })();
      const clientLabel = (c) => c ? c.company || c.name : "";
      const create = (text) => {
        const tt = (text || "").trim();
        if (!tt) return;
        D.addTask({ title: tt, deadline: sel, column: "todo", clientId: assign ? assign.id : null, clientName: assign ? clientLabel(assign) : null });
        setDraft("");
      };
      const toNora = () => {
        try {
          sessionStorage.setItem("nora_prefill", draft.trim() ? `Crea una tarea para ${PN.relDay(sel)}: ${draft.trim()}` : `Ay\xFAdame a crear tareas para ${PN.relDay(sel)}`);
        } catch (_) {
        }
        navigate("nora");
      };
      return /* @__PURE__ */ React.createElement("div", { className: "pn-stage" }, /* @__PURE__ */ React.createElement("div", { className: "pn-col" }, /* @__PURE__ */ React.createElement("div", { className: "pn-head pn-head-tasks" }, /* @__PURE__ */ React.createElement("p", { className: "t-small", style: { color: "var(--gray-300)", lineHeight: "17px" } }, PN.longDate(PN.parseYmd(sel)), " \xB7 ", nPending, " pendiente", nPending === 1 ? "" : "s"), /* @__PURE__ */ React.createElement("h1", { className: "t-h2", style: { margin: "10px 0 0", color: "var(--ink-900)" } }, title[0], title[1])), /* @__PURE__ */ React.createElement("div", { className: "pn-week", onWheel }, week.map((d) => {
        const ds = PN.ymd(d), on = ds === sel, today = ds === todayStr, past = ds < todayStr;
        return /* @__PURE__ */ React.createElement(
          "button",
          {
            key: ds,
            className: "pn-day" + (on ? " on" : "") + (past ? " past" : ""),
            onClick: () => setSel(ds),
            "aria-label": PN.longDate(d)
          },
          /* @__PURE__ */ React.createElement("span", { className: "t-caption lbl" }, PN.DIAS_C[d.getDay()].toUpperCase()),
          /* @__PURE__ */ React.createElement("span", { className: "ring" }, /* @__PURE__ */ React.createElement(DayRing, { pct: dayPct(ds), strong: on }), on && /* @__PURE__ */ React.createElement("i", { className: "fill" }), /* @__PURE__ */ React.createElement("span", { className: "t-title-m num" }, d.getDate())),
          /* @__PURE__ */ React.createElement("i", { className: "dot" + (today ? " today" : "") })
        );
      })), /* @__PURE__ */ React.createElement(PN.ScrollArea, { top: 315, bottom: 244 }, /* @__PURE__ */ React.createElement("div", { className: "pn-tasks" }, nPending === 0 && doneNames.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "pn-empty" }, /* @__PURE__ */ React.createElement("p", { className: "t-title-m", style: { color: "var(--ink-900)" } }, "Sin tareas para ", PN.relDay(sel)), /* @__PURE__ */ React.createElement("p", { className: "t-small", style: { color: "var(--gray-300)" } }, "Escribe una abajo para crearla.")) : null, nPending > 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("p", { className: "t-caption pn-sec" }, "Pendientes"), /* @__PURE__ */ React.createElement("div", { className: "pn-list" }, pending.map(taskRow), pSteps.map(stepRow))), doneNames.length > 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("p", { className: "t-caption pn-sec", style: { marginTop: nPending > 0 ? 24 : 0 } }, "Completadas"), doneNames.length === 1 ? /* @__PURE__ */ React.createElement("div", { className: "pn-list" }, done.map(taskRow), dSteps.map(stepRow)) : doneOpen ? /* @__PURE__ */ React.createElement("div", { className: "pn-list pn-group-open" }, done.map(taskRow), dSteps.map(stepRow), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(PN.Pill, { onClick: () => setDoneOpen(false) }, "Mostrar menos"))) : /* @__PURE__ */ React.createElement("div", { className: "pn-stack" }, /* @__PURE__ */ React.createElement("div", { className: "pn-task done sum", role: "button", onClick: () => setDoneOpen(true) }, /* @__PURE__ */ React.createElement("span", { className: "pn-task-chk" }, /* @__PURE__ */ React.createElement(PIcon, { name: "chk-on" })), /* @__PURE__ */ React.createElement("div", { className: "pn-task-txt" }, /* @__PURE__ */ React.createElement("p", { className: "t-card-title" }, doneNames.length, " tareas completadas"), /* @__PURE__ */ React.createElement("p", { className: "t-small meta" }, PN.listMore(doneNames.slice(0, 3), doneNames.length))), /* @__PURE__ */ React.createElement("span", { className: "pn-task-go" }, /* @__PURE__ */ React.createElement(PIcon, { name: "chev" }))), /* @__PURE__ */ React.createElement("div", { className: "pn-layers" }, /* @__PURE__ */ React.createElement("i", null), /* @__PURE__ */ React.createElement("i", null)))))), /* @__PURE__ */ React.createElement("div", { className: "pn-nora" }, /* @__PURE__ */ React.createElement("div", { className: "pn-nora-sug" }, /* @__PURE__ */ React.createElement(PN.Pill, { sug: true, onClick: () => openModal("newTask", { date: sel }) }, `Para ${PN.relDay(sel)}`), lastClient && /* @__PURE__ */ React.createElement(
        PN.Pill,
        {
          sug: true,
          className: assign && assign.id === lastClient.id ? "on" : "",
          onClick: () => setAssign((a) => a && a.id === lastClient.id ? null : lastClient)
        },
        `Asignar a ${clientLabel(lastClient)}`
      ), /* @__PURE__ */ React.createElement(PN.Pill, { sug: true, onClick: toNora }, "Crear con Nora")), /* @__PURE__ */ React.createElement("div", { className: "pn-nora-box" }, /* @__PURE__ */ React.createElement("span", { className: "clip" }, /* @__PURE__ */ React.createElement(PIcon, { name: "clip" })), /* @__PURE__ */ React.createElement(
        "input",
        {
          value: draft,
          onChange: (e) => setDraft(e.target.value),
          placeholder: assign ? `Nueva tarea para ${clientLabel(assign)}\u2026` : "Nueva tarea\u2026",
          onKeyDown: (e) => {
            if (e.key === "Enter") create(draft);
          }
        }
      ), /* @__PURE__ */ React.createElement("button", { className: "pn-send", "aria-label": "Crear tarea", onClick: () => create(draft) }, /* @__PURE__ */ React.createElement(PIcon, { name: "arrow-up" }))))), taskModal && window.TaskProgressModal && /* @__PURE__ */ React.createElement(
        window.TaskProgressModal,
        {
          task: taskModal.task,
          projectId: taskModal.pid,
          open: true,
          onClose: () => setTaskModal(null),
          onDelete: () => {
            D.deleteTask(taskModal.pid, taskModal.task.id);
            setTaskModal(null);
          },
          onUpdate: (ch) => D.updateTask(taskModal.pid, taskModal.task.id, ch),
          onEdit: () => openModal("editTask", { task: taskModal.task, pid: taskModal.pid })
        }
      ), routineModal && (() => {
        const metric = window._routineMetric ? window._routineMetric(routineModal.it.text) : null;
        const common = { routineId: routineModal.r.id, day: sel, itemId: routineModal.it.id, onClose: () => setRoutineModal(null) };
        if (metric === "weight" && window.WeightLogModal) return /* @__PURE__ */ React.createElement(window.WeightLogModal, { ...common });
        if (metric === "macros" && window.MacrosLogModal) return /* @__PURE__ */ React.createElement(window.MacrosLogModal, { ...common });
        if (metric === "steps" && window.StepsLogModal) return /* @__PURE__ */ React.createElement(window.StepsLogModal, { ...common, text: routineModal.it.text });
        return window.TaskProgressModal ? /* @__PURE__ */ React.createElement(
          window.TaskProgressModal,
          {
            routineMode: true,
            open: true,
            task: {
              id: "rt:" + routineModal.r.id + ":" + routineModal.it.id,
              title: routineModal.it.text,
              progress: D.routineItemProgress(routineModal.r.id, sel, routineModal.it.id),
              deadline: "",
              column: D.routineItemDone(routineModal.r.id, sel, routineModal.it.id) ? "done" : "todo"
            },
            onClose: () => setRoutineModal(null),
            onUpdate: (ch) => {
              if (ch.progress != null) D.setRoutineItemProgress(routineModal.r.id, sel, routineModal.it.id, ch.progress);
            }
          }
        ) : null;
      })());
    };
    window.PanelTasks = PanelTasks;
  })();
})();

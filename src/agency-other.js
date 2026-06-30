(() => {
  const TasksBoard = ({ navigate, openModal, initialDate }) => {
    const D = window.Data;
    D.useStore();
    const initWeekOffset = (() => {
      if (!initialDate) return 0;
      const mondayOf = (d) => {
        const x = new Date(d);
        x.setHours(0, 0, 0, 0);
        x.setDate(x.getDate() - (x.getDay() + 6) % 7);
        return x;
      };
      const nowMon = mondayOf(/* @__PURE__ */ new Date());
      const selMon = mondayOf(/* @__PURE__ */ new Date(initialDate + "T12:00:00"));
      return Math.round((selMon - nowMon) / (7 * 864e5));
    })();
    const [weekOffset, setWeekOffset] = useState(initWeekOffset);
    const [selectedDay, setSelectedDay] = useState(initialDate ? /* @__PURE__ */ new Date(initialDate + "T12:00:00") : /* @__PURE__ */ new Date());
    const [taskModal, setTaskModal] = useState(null);
    const [hideCompleted, setHideCompleted] = useState(false);
    const [optionsOpen, setOptionsOpen] = useState(false);
    const DAY_ES = ["Dom", "Lun", "Mar", "Mi\xE9", "Jue", "Vie", "S\xE1b"];
    const MON_ES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const C_DOTS = ["#fb7185", "#60a5fa", "#fbbf24", "#34d399", "#a78bfa", "#f472b6", "#22d3ee", "#f59e0b"];
    const weekDays = (() => {
      const now = /* @__PURE__ */ new Date();
      const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const dow = base.getDay();
      const mon = new Date(base);
      mon.setDate(base.getDate() - (dow === 0 ? 6 : dow - 1) + weekOffset * 7);
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(mon);
        d.setDate(mon.getDate() + i);
        return d;
      });
    })();
    const todayMid = /* @__PURE__ */ new Date();
    todayMid.setHours(0, 0, 0, 0);
    const selMid = new Date(selectedDay);
    selMid.setHours(0, 0, 0, 0);
    const midMonth = MON_ES[weekDays[3].getMonth()];
    const allTasks = Object.values(D.TASKS).flat();
    const selDateStr = (() => {
      const d = new Date(selectedDay);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    })();
    const todayStr = `${todayMid.getFullYear()}-${String(todayMid.getMonth() + 1).padStart(2, "0")}-${String(todayMid.getDate()).padStart(2, "0")}`;
    const isToday = selDateStr === todayStr;
    const matchesDay = (t) => t.deadline === selDateStr || isToday && t.deadline && t.deadline < selDateStr && (t.column !== "done" || t.doneAt === todayStr);
    const dayTasks = allTasks.filter(matchesDay);
    const donePct = dayTasks.length ? Math.round(dayTasks.reduce((s, t) => s + (t.column === "done" ? 100 : t.progress || 0), 0) / dayTasks.length) : 0;
    const clientColorMap = {};
    D.CLIENTS.forEach((c, i) => {
      clientColorMap[c.id] = C_DOTS[i % C_DOTS.length];
    });
    const groupMap = {};
    D.PROJECTS.forEach((p) => {
      const tasks = (D.TASKS[p.id] || []).filter(matchesDay);
      const key = p.clientId || "__nc";
      if (!groupMap[key]) {
        const cl = D.CLIENTS.find((c) => c.id === p.clientId);
        groupMap[key] = {
          clientId: key,
          clientName: ((cl == null ? void 0 : cl.company) || p.clientName || "Sin cliente").toUpperCase(),
          color: clientColorMap[p.clientId] || "#a78bfa",
          projects: []
        };
      }
      groupMap[key].projects.push({ project: p, tasks });
    });
    const groups = Object.values(groupMap);
    const noProj = (D.TASKS["__none__"] || []).filter(matchesDay);
    const generalTasks = [];
    noProj.forEach((t) => {
      if (t.clientId) {
        let grp = groups.find((g) => g.clientId === t.clientId);
        if (!grp) {
          const cl = D.CLIENTS.find((c) => c.id === t.clientId);
          grp = {
            clientId: t.clientId,
            clientName: ((cl == null ? void 0 : cl.company) || (cl == null ? void 0 : cl.name) || t.clientName || "Sin cliente").toUpperCase(),
            color: clientColorMap[t.clientId] || "#a78bfa",
            projects: []
          };
          groups.push(grp);
        }
        let bucket = grp.projects.find((p) => p.project === null && p._clientBucket);
        if (!bucket) {
          bucket = { project: null, tasks: [], _clientBucket: true };
          grp.projects.push(bucket);
        }
        bucket.tasks.push(t);
      } else {
        generalTasks.push(t);
      }
    });
    if (generalTasks.length > 0) groups.push({
      clientId: "__general",
      clientName: "GENERAL",
      color: "var(--text-subtle)",
      projects: [{ project: null, tasks: generalTasks }]
    });
    const toggleDone = (pid, t) => D.moveTask(pid, t.id, t.column === "done" ? "todo" : "done");
    const weekStart = weekDays[0];
    const weekEnd = weekDays[6];
    const weekLabel = (() => {
      const s = `${weekStart.getDate()} ${MON_ES[weekStart.getMonth()]}`;
      const e = `${weekEnd.getDate()} ${MON_ES[weekEnd.getMonth()]}`;
      return `${s} \u2014 ${e}`;
    })();
    return /* @__PURE__ */ React.createElement("div", { className: "page", onClick: () => setOptionsOpen(false) }, /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", null, "Tareas"), /* @__PURE__ */ React.createElement("div", { className: "sub" }, DAY_ES[new Date(selectedDay).getDay()], " ", new Date(selectedDay).getDate(), " ", MON_ES[new Date(selectedDay).getMonth()], " \xB7 ", dayTasks.filter((t) => t.column !== "done").length, " pendientes")), /* @__PURE__ */ React.createElement(
      ActionPill,
      {
        plusActions: () => openModal("newTask", { date: selDateStr }),
        moreActions: [
          {
            icon: hideCompleted ? "eye" : "eye-off",
            label: hideCompleted ? "Mostrar completadas" : "Ocultar completadas",
            onClick: () => setHideCompleted((h) => !h)
          }
        ]
      }
    )), /* @__PURE__ */ React.createElement("div", { style: { borderBottom: "0.5px solid var(--border)", paddingBottom: 18, marginBottom: 28 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", marginBottom: 14 } }, /* @__PURE__ */ React.createElement("button", { onClick: () => setWeekOffset((o) => o - 1), style: { background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px 6px", display: "flex" } }, /* @__PURE__ */ React.createElement(Icon, { name: "chevron-left", size: 18 })), /* @__PURE__ */ React.createElement("span", { style: { flex: 1, textAlign: "center", fontSize: 20, fontWeight: 400, letterSpacing: "-0.8px" } }, MON_ES[weekDays[3].getMonth()]), /* @__PURE__ */ React.createElement("button", { onClick: () => setWeekOffset((o) => o + 1), style: { background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px 6px", display: "flex" } }, /* @__PURE__ */ React.createElement(Icon, { name: "chevron-right", size: 18 }))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, weekDays.map((d) => {
      const dMid = new Date(d);
      dMid.setHours(0, 0, 0, 0);
      const isSel = dMid.getTime() === selMid.getTime();
      const isToday2 = dMid.getTime() === todayMid.getTime();
      return /* @__PURE__ */ React.createElement("button", { key: d.toISOString(), onClick: () => setSelectedDay(new Date(d)), style: {
        flex: 1,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        padding: "14px 0 12px",
        borderRadius: 999,
        border: isSel ? "1.5px solid var(--accent)" : "0.5px solid rgba(255,255,255,0.08)",
        background: isSel ? "rgba(158,154,229,0.10)" : "rgba(255,255,255,0.03)",
        transition: "all .18s"
      } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, fontWeight: 500, color: isSel ? "var(--accent)" : "var(--text-muted)", letterSpacing: "0.02em" } }, ["D", "L", "M", "X", "J", "V", "S"][d.getDay()]), /* @__PURE__ */ React.createElement("div", { style: {
        width: 34,
        height: 34,
        borderRadius: "50%",
        background: isSel ? "rgba(158,154,229,0.22)" : "rgba(255,255,255,0.05)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all .18s"
      } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, fontWeight: isSel || isToday2 ? 500 : 400, color: isSel ? "#dad7f7" : isToday2 ? "var(--text)" : "var(--text-muted)", letterSpacing: "-0.3px" } }, d.getDate())));
    })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12, marginTop: 18 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: "var(--text-subtle)", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 500, flexShrink: 0 } }, "Daily Progress"), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, height: 2, background: "var(--border)", borderRadius: 99 } }, /* @__PURE__ */ React.createElement("div", { style: { width: `${donePct}%`, height: "100%", background: "var(--accent)", borderRadius: 99, transition: "width .4s" } })), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "var(--text-muted)", fontWeight: 500, flexShrink: 0 } }, donePct, "%"))), groups.length === 0 && /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", padding: "60px 0", color: "var(--text-subtle)", fontSize: 14, letterSpacing: "-0.5px" } }, "Sin tareas para este d\xEDa \u2014 ", /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: () => openModal("newTask", { date: selDateStr }) }, "crear una")), groups.map((group, gIdx) => /* @__PURE__ */ React.createElement("div", { key: group.clientId, style: { marginBottom: 32 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 7, height: 7, borderRadius: "50%", background: group.color, flexShrink: 0 } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, fontWeight: 400, letterSpacing: "0", textTransform: "uppercase", color: "#9e9e9e" } }, group.clientName)), group.projects.map(({ project, tasks }) => tasks.filter((t) => !hideCompleted || t.column !== "done").map((t, idx, arr) => {
      const pid = (project == null ? void 0 : project.id) || "__none__";
      const isDone = t.column === "done";
      const colLabel = { todo: "Por hacer", doing: "En curso", review: "Revisi\xF3n" }[t.column];
      const isLast = idx === arr.length - 1;
      const prog = t.progress || 0;
      const isOverdue = isToday && t.deadline && t.deadline < selDateStr && !isDone;
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          key: t.id,
          onClick: () => setTaskModal({ task: t, pid }),
          className: "task-row",
          style: {
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "12px 4px",
            cursor: "pointer",
            borderBottom: isLast ? "none" : "0.5px solid var(--border)"
          }
        },
        (() => {
          const sz = 40, r = 17, circ = 2 * Math.PI * r;
          return /* @__PURE__ */ React.createElement("div", { style: { width: sz, height: sz, flexShrink: 0, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement("svg", { width: sz, height: sz, style: { position: "absolute", top: 0, left: 0 } }, /* @__PURE__ */ React.createElement(
            "circle",
            {
              cx: sz / 2,
              cy: sz / 2,
              r,
              fill: "none",
              stroke: isDone ? "var(--accent)" : "rgba(255,255,255,0.12)",
              strokeWidth: "2"
            }
          ), !isDone && prog > 0 && /* @__PURE__ */ React.createElement(
            "circle",
            {
              cx: sz / 2,
              cy: sz / 2,
              r,
              fill: "none",
              stroke: "var(--accent)",
              strokeWidth: "2",
              strokeLinecap: "round",
              strokeDasharray: `${prog / 100 * circ} ${circ}`,
              transform: `rotate(-90,${sz / 2},${sz / 2})`
            }
          )), isDone ? /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 15, style: { color: "var(--accent)", position: "relative" } }) : /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 11, style: { color: "rgba(255,255,255,0.22)", position: "relative" } }));
        })(),
        /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, letterSpacing: "-0.5px", color: isDone ? "var(--text-subtle)" : "var(--text)" } }, t.title), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: isOverdue ? "var(--red)" : "var(--text-subtle)", marginTop: 2, letterSpacing: "-0.2px" } }, project ? project.name : isDone ? "Completada" : colLabel || "Por hacer", t.deadline ? ` \xB7 ${(/* @__PURE__ */ new Date(t.deadline + "T00:00:00")).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}` : "", isOverdue ? " \xB7 Vencida" : "")),
        /* @__PURE__ */ React.createElement(Icon, { name: "chevron-right", size: 14, style: { color: "rgba(255,255,255,0.15)", flexShrink: 0 } })
      );
    })), /* @__PURE__ */ React.createElement("div", { className: "client-divider", style: { height: "0.5px", background: "var(--border)", marginTop: 4 } }))), taskModal && /* @__PURE__ */ React.createElement(
      TaskProgressModal,
      {
        task: taskModal.task,
        projectId: taskModal.pid,
        open: true,
        onClose: () => setTaskModal(null),
        onDelete: () => {
          window.Data.deleteTask(taskModal.pid, taskModal.task.id);
          setTaskModal(null);
        },
        onUpdate: (changes) => {
          window.Data.updateTask(taskModal.pid, taskModal.task.id, changes);
        }
      }
    ));
  };
  const ProjectTaskColumn = ({ project: p, navigate, toast }) => {
    const D = window.Data;
    const [draft, setDraft] = useState("");
    const [adding, setAdding] = useState(false);
    const [doneOpen, setDoneOpen] = useState(false);
    const inputRef = useRef(null);
    const allTasks = D.TASKS[p.id] || [];
    const active = allTasks.filter((t) => t.column !== "done");
    const done = allTasks.filter((t) => t.column === "done");
    const commitAdd = () => {
      if (draft.trim()) {
        D.addTask({ projectId: p.id, title: draft.trim(), column: "todo" });
        toast("Tarea a\xF1adida", "success");
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
    const COL_COLORS = { todo: "var(--text-subtle)", doing: "var(--blue)", review: "var(--amber)", done: "var(--green)" };
    const COL_LABELS = { todo: "Por hacer", doing: "En curso", review: "Revisi\xF3n", done: "Hecho" };
    return /* @__PURE__ */ React.createElement("div", { style: {
      width: 300,
      flexShrink: 0,
      background: "var(--bg-elev)",
      border: "0.5px solid var(--border)",
      borderRadius: 14,
      display: "flex",
      flexDirection: "column",
      maxHeight: "calc(100vh - 160px)",
      overflow: "hidden"
    } }, /* @__PURE__ */ React.createElement("div", { style: {
      padding: "14px 16px 12px",
      borderBottom: "0.5px solid var(--border)",
      position: "sticky",
      top: 0,
      background: "var(--bg-elev)",
      zIndex: 1
    } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 4 } }, /* @__PURE__ */ React.createElement("span", { className: "dot " + p.light }), /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 600, fontSize: 14, letterSpacing: "-0.01em", flex: 1 } }, p.name), /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "btn ghost icon-only sm",
        "data-tooltip": "A\xF1adir tarea",
        onClick: () => setAdding(true)
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 12 })
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "btn ghost icon-only sm",
        "data-tooltip": "Abrir proyecto",
        onClick: () => navigate("project", { projectId: p.id })
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "external-link", size: 12 })
    )), /* @__PURE__ */ React.createElement("div", { className: "subtle xsmall" }, p.clientName, " \xB7 ", active.length, " pendiente", active.length !== 1 ? "s" : ""), adding && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 10, display: "flex", gap: 6, alignItems: "center" } }, /* @__PURE__ */ React.createElement(
      "input",
      {
        ref: inputRef,
        autoFocus: true,
        className: "input",
        placeholder: "Nueva tarea\u2026",
        value: draft,
        onChange: (e) => setDraft(e.target.value),
        onKeyDown: (e) => {
          if (e.key === "Enter") commitAdd();
          if (e.key === "Escape") {
            setAdding(false);
            setDraft("");
          }
        },
        onBlur: commitAdd,
        style: { height: 30, fontSize: 13, flex: 1 }
      }
    ))), /* @__PURE__ */ React.createElement("div", { style: { overflowY: "auto", flex: 1, padding: "8px 0" } }, active.length === 0 && !adding && /* @__PURE__ */ React.createElement("div", { style: { padding: "24px 16px", textAlign: "center", color: "var(--text-subtle)", fontSize: 12 } }, "Sin tareas pendientes"), active.map((t) => /* @__PURE__ */ React.createElement(TaskRow, { key: t.id, task: t, onToggle: () => toggleDone(t), onDelete: () => remove(t), onUpdate: (ch) => update(t, ch), COL_COLORS, COL_LABELS, projectId: p.id })), done.length > 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setDoneOpen((o) => !o),
        style: {
          display: "flex",
          alignItems: "center",
          gap: 6,
          width: "100%",
          padding: "8px 16px",
          border: 0,
          background: "transparent",
          color: "var(--text-subtle)",
          fontSize: 12,
          fontWeight: 500,
          cursor: "pointer",
          fontFamily: "inherit",
          textAlign: "left"
        }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "chevron", size: 11, style: { transform: doneOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform .15s" } }),
      "Completada (",
      done.length,
      ")"
    ), doneOpen && done.map((t) => /* @__PURE__ */ React.createElement(TaskRow, { key: t.id, task: t, onToggle: () => toggleDone(t), onDelete: () => remove(t), onUpdate: (ch) => update(t, ch), COL_COLORS, COL_LABELS, isDone: true, projectId: p.id })))));
  };
  const TaskDotsMenu = ({ task: t, onDelete, onUpdate }) => {
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState(null);
    const [dateVal, setDateVal] = useState(t.deadline || "");
    const [pos, setPos] = useState({ top: 0, left: 0 });
    const btnRef = useRef(null);
    const panelRef = useRef(null);
    React.useEffect(() => {
      if (!open) return;
      const handler = (e) => {
        if (panelRef.current && !panelRef.current.contains(e.target) && btnRef.current && !btnRef.current.contains(e.target)) {
          setOpen(false);
          setMode(null);
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
      setOpen((o) => !o);
      setMode(null);
    };
    const saveDeadline = () => {
      onUpdate({ deadline: dateVal || null });
      setOpen(false);
      setMode(null);
    };
    const panel = open ? ReactDOM.createPortal(
      /* @__PURE__ */ React.createElement("div", { ref: panelRef, style: {
        position: "fixed",
        top: pos.top,
        left: pos.left,
        zIndex: 9999,
        background: "var(--bg-elev)",
        border: "0.5px solid var(--border)",
        borderRadius: 10,
        boxShadow: "0 8px 24px rgba(0,0,0,0.22)",
        minWidth: 190,
        overflow: "hidden"
      } }, mode === null && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => setMode("deadline"),
          style: {
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            padding: "10px 14px",
            border: 0,
            background: "transparent",
            color: "var(--text)",
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "inherit",
            textAlign: "left"
          },
          onMouseEnter: (e) => e.currentTarget.style.background = "var(--bg-hover)",
          onMouseLeave: (e) => e.currentTarget.style.background = "transparent"
        },
        /* @__PURE__ */ React.createElement(Icon, { name: "calendar", size: 13 }),
        " A\xF1adir fecha l\xEDmite"
      ), /* @__PURE__ */ React.createElement("div", { style: { height: "0.5px", background: "var(--border)", margin: "2px 0" } }), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => {
            setOpen(false);
            onDelete();
          },
          style: {
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            padding: "10px 14px",
            border: 0,
            background: "transparent",
            color: "var(--red)",
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "inherit",
            textAlign: "left"
          },
          onMouseEnter: (e) => e.currentTarget.style.background = "var(--bg-hover)",
          onMouseLeave: (e) => e.currentTarget.style.background = "transparent"
        },
        /* @__PURE__ */ React.createElement(Icon, { name: "trash", size: 13 }),
        " Eliminar"
      )), mode === "deadline" && /* @__PURE__ */ React.createElement("div", { style: { padding: "12px 14px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, fontWeight: 500, color: "var(--text-subtle)", marginBottom: 8 } }, "Fecha l\xEDmite"), /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "date",
          className: "input",
          value: dateVal,
          onChange: (e) => setDateVal(e.target.value),
          autoFocus: true,
          style: { width: "100%", height: 32, fontSize: 13, marginBottom: 8 }
        }
      ), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, /* @__PURE__ */ React.createElement("button", { className: "btn primary sm", onClick: saveDeadline, style: { flex: 1, fontSize: 12 } }, "Guardar"), /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: () => setMode(null), style: { fontSize: 12 } }, "Atr\xE1s")))),
      document.body
    ) : null;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("button", { ref: btnRef, onClick: toggleOpen, style: {
      border: 0,
      background: "transparent",
      padding: "2px 4px",
      cursor: "pointer",
      color: "var(--text-subtle)",
      display: "flex",
      alignItems: "center",
      borderRadius: 4,
      fontSize: 15,
      letterSpacing: "0.05em",
      lineHeight: 1,
      fontWeight: 700,
      flexShrink: 0
    } }, "\xB7\xB7\xB7"), panel);
  };
  const TaskRow = ({ task: t, onToggle, onDelete, onUpdate, COL_COLORS, COL_LABELS, isDone, projectId }) => {
    const [hover, setHover] = useState(false);
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        onMouseEnter: () => setHover(true),
        onMouseLeave: () => setHover(false),
        style: {
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "7px 16px",
          background: hover ? "var(--bg-hover)" : "transparent",
          transition: "background .08s"
        }
      },
      /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: onToggle,
          style: {
            width: 18,
            height: 18,
            borderRadius: "50%",
            flexShrink: 0,
            border: isDone ? "none" : "1.5px solid var(--border-strong)",
            background: isDone ? "var(--green)" : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            padding: 0,
            transition: "all .15s"
          }
        },
        isDone && /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 10, style: { color: "#fff" } })
      ),
      /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("span", { style: {
        fontSize: 13,
        lineHeight: 1.4,
        color: isDone ? "var(--text-subtle)" : "var(--text)",
        textDecoration: isDone ? "line-through" : "none"
      } }, t.title), t.deadline && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--amber)", marginTop: 1 } }, /* @__PURE__ */ React.createElement(Icon, { name: "calendar", size: 10, style: { verticalAlign: "middle", marginRight: 3 } }), (/* @__PURE__ */ new Date(t.deadline + "T00:00:00")).toLocaleDateString("es-ES", { day: "numeric", month: "short" })), t.subtasks && t.subtasks.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-subtle)", marginTop: 1 } }, t.subtasks.filter((s) => s.done).length, "/", t.subtasks.length, " subtareas")),
      !isDone && t.column !== "todo" && /* @__PURE__ */ React.createElement("span", { style: {
        fontSize: 10.5,
        padding: "1px 6px",
        borderRadius: 99,
        background: "transparent",
        border: "0.5px solid var(--border)",
        color: COL_COLORS[t.column],
        flexShrink: 0
      } }, COL_LABELS[t.column]),
      hover && /* @__PURE__ */ React.createElement(TaskDotsMenu, { task: t, onDelete, onUpdate, projectId })
    );
  };
  const AgencyProjects = ({ navigate, openModal }) => {
    const D = window.Data;
    D.useStore();
    const confirm = useConfirm();
    const toast = useToast();
    const cap = D.PROJECTS.length;
    const capColor = cap === 0 ? "green" : cap <= 3 ? "green" : cap === 4 ? "amber" : "red";
    const capLabel = cap === 0 ? "Sin proyectos" : cap <= 3 ? "Zona c\xF3moda" : cap === 4 ? "Zona de atenci\xF3n" : "Zona de riesgo";
    const removeProject = async (p, e) => {
      e == null ? void 0 : e.stopPropagation();
      const ok = await confirm({
        title: `Eliminar el proyecto "${p.name}"?`,
        body: "Se eliminar\xE1n tambi\xE9n sus entregables. Esta acci\xF3n no se puede deshacer.",
        confirmLabel: "S\xED, eliminar",
        danger: true
      });
      if (ok) {
        D.deleteProject(p.id);
        toast("Proyecto eliminado", "success");
      }
    };
    return /* @__PURE__ */ React.createElement("div", { className: "page" }, /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", null, "Proyectos"), /* @__PURE__ */ React.createElement("div", { className: "sub" }, cap, " en marcha \xB7 ", capLabel)), /* @__PURE__ */ React.createElement(
      ActionPill,
      {
        plusActions: () => openModal("newProject"),
        moreActions: [
          { icon: "refresh-cw", label: "Actualizar lista", onClick: () => D.reload && D.reload() }
        ]
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "card", style: { marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", { className: "card-body", style: { padding: 16, display: "flex", alignItems: "center", gap: 16 } }, /* @__PURE__ */ React.createElement("div", { className: "metric-label" }, "Capacidad"), /* @__PURE__ */ React.createElement("div", { className: "grow" }, /* @__PURE__ */ React.createElement("div", { className: "row tight" }, /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 500 } }, cap, " ", cap === 1 ? "proyecto activo" : "proyectos activos"), /* @__PURE__ */ React.createElement("span", { className: "chip " + capColor }, capLabel))), /* @__PURE__ */ React.createElement("div", { className: "muted xsmall", style: { textAlign: "right", lineHeight: 1.5 } }, "1-3 c\xF3moda \xB7 4 atenci\xF3n \xB7 5+ riesgo"))), D.PROJECTS.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body", style: { padding: 60 } }, /* @__PURE__ */ React.createElement(Empty, { icon: "folder", title: "Sin proyectos", sub: "Crea tu primer proyecto para empezar" }))) : /* @__PURE__ */ React.createElement("div", { className: "rg-projects" }, D.PROJECTS.map((p) => {
      const phase = D.PHASES[p.phase];
      const pTasks = D.TASKS[p.id] || [];
      const liveProgress = pTasks.length ? Math.round(pTasks.filter((t) => t.column === "done").length / pTasks.length * 100) : 0;
      return /* @__PURE__ */ React.createElement("div", { key: p.id, className: "card", style: { cursor: "pointer", position: "relative" }, onClick: () => navigate("project", { projectId: p.id }) }, /* @__PURE__ */ React.createElement(
        "button",
        {
          className: "btn ghost icon-only sm danger",
          "data-tooltip": "Eliminar",
          style: { position: "absolute", top: 10, right: 10, zIndex: 1 },
          onClick: (e) => removeProject(p, e)
        },
        /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 12 })
      ), /* @__PURE__ */ React.createElement("div", { className: "card-body" }, /* @__PURE__ */ React.createElement("div", { className: "row between" }, /* @__PURE__ */ React.createElement("div", { className: "row tight" }, /* @__PURE__ */ React.createElement("span", { className: "dot " + p.light }), /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 500 } }, p.name)), /* @__PURE__ */ React.createElement("span", { className: "chip", style: { marginRight: 32 } }, phase.label)), /* @__PURE__ */ React.createElement("div", { className: "muted small", style: { marginTop: 6 } }, p.clientName, " \xB7 ", p.service), /* @__PURE__ */ React.createElement("div", { className: "muted small", style: { marginTop: 8 } }, p.description), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 14, display: "flex", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { className: "progress grow" }, /* @__PURE__ */ React.createElement("i", { style: { width: liveProgress + "%" } })), /* @__PURE__ */ React.createElement("span", { className: "muted small" }, liveProgress, "%")), /* @__PURE__ */ React.createElement("div", { className: "row between", style: { marginTop: 10 } }, /* @__PURE__ */ React.createElement("div", { className: "muted xsmall" }, /* @__PURE__ */ React.createElement(Icon, { name: "calendar", size: 11 }), " ", p.deadline), /* @__PURE__ */ React.createElement("div", { className: "xsmall", style: { color: p.light === "red" ? "var(--red)" : p.light === "amber" ? "var(--amber)" : "var(--text-muted)" } }, "\u2192 ", p.nextMilestone))));
    })));
  };
  const FIN_KEY = "141_finance_v1";
  const FIN_CATS = ["Software", "Hosting", "Marketing", "Publicidad", "Oficina", "Impuestos", "Freelance", "Otros"];
  const _eur = (n) => "\u20AC" + (Number(n) || 0).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const _finLoad = () => {
    try {
      const d = JSON.parse(localStorage.getItem(FIN_KEY));
      return d && typeof d === "object" ? { subs: d.subs || [], expenses: d.expenses || [] } : { subs: [], expenses: [] };
    } catch (e) {
      return { subs: [], expenses: [] };
    }
  };
  const _finSave = (d) => {
    try {
      localStorage.setItem(FIN_KEY, JSON.stringify(d));
    } catch (e) {
    }
  };
  const _finId = () => window.crypto && crypto.randomUUID ? crypto.randomUUID() : "id" + Date.now() + Math.floor(Math.random() * 1e6);
  const _subMonthly = (s) => s.cycle === "yearly" ? (Number(s.amount) || 0) / 12 : Number(s.amount) || 0;
  const _sameMonth = (iso) => {
    if (!iso) return false;
    const d = new Date(iso);
    const n = /* @__PURE__ */ new Date();
    return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth();
  };
  const _todayISO = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const _finDate = (iso) => {
    if (!iso) return "\u2014";
    const d = new Date(iso);
    const M = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    return isNaN(d) ? "\u2014" : `${d.getDate()} ${M[d.getMonth()]} ${d.getFullYear()}`;
  };
  const FIN_INPUT = {
    padding: "9px 11px",
    borderRadius: 9,
    fontSize: 13,
    fontFamily: "inherit",
    background: "var(--bg-elev)",
    border: "0.5px solid var(--border)",
    color: "var(--text)",
    outline: "none",
    letterSpacing: "-0.2px",
    width: "100%"
  };
  const FIN_CYCLES = [{ id: "monthly", label: "Mensual" }, { id: "yearly", label: "Anual" }];
  const AgencyBilling = () => {
    const toast = useToast();
    const [data, setData] = useState(_finLoad);
    const [tab, setTab] = useState("subs");
    const [addSub, setAddSub] = useState(false);
    const [addExp, setAddExp] = useState(false);
    const blankSub = { name: "", amount: "", cycle: "monthly", category: "Software", nextRenewal: "" };
    const blankExp = { date: _todayISO(), concept: "", amount: "", category: "Software" };
    const [subForm, setSubForm] = useState(blankSub);
    const [expForm, setExpForm] = useState(blankExp);
    const persist = (next) => {
      setData(next);
      _finSave(next);
    };
    const saveSub = () => {
      if (!subForm.name.trim() || !(Number(subForm.amount) > 0)) {
        toast("Pon nombre e importe", "error");
        return;
      }
      const sub = { id: _finId(), name: subForm.name.trim(), amount: Number(subForm.amount), cycle: subForm.cycle, category: subForm.category, nextRenewal: subForm.nextRenewal, active: true };
      persist({ ...data, subs: [sub, ...data.subs] });
      setSubForm(blankSub);
      setAddSub(false);
      toast("Suscripci\xF3n a\xF1adida", "success");
    };
    const toggleSub = (id) => persist({ ...data, subs: data.subs.map((s) => s.id === id ? { ...s, active: !s.active } : s) });
    const delSub = (id) => persist({ ...data, subs: data.subs.filter((s) => s.id !== id) });
    const saveExp = () => {
      if (!expForm.concept.trim() || !(Number(expForm.amount) > 0)) {
        toast("Pon concepto e importe", "error");
        return;
      }
      const exp = { id: _finId(), date: expForm.date || _todayISO(), concept: expForm.concept.trim(), amount: Number(expForm.amount), category: expForm.category };
      persist({ ...data, expenses: [exp, ...data.expenses] });
      setExpForm(blankExp);
      setAddExp(false);
      toast("Gasto a\xF1adido", "success");
    };
    const delExp = (id) => persist({ ...data, expenses: data.expenses.filter((e) => e.id !== id) });
    const activeSubs = data.subs.filter((s) => s.active);
    const recurringMo = activeSubs.reduce((a, s) => a + _subMonthly(s), 0);
    const expMonth = data.expenses.filter((e) => _sameMonth(e.date)).reduce((a, e) => a + (Number(e.amount) || 0), 0);
    const totalMonth = recurringMo + expMonth;
    const upcoming = activeSubs.filter((s) => s.nextRenewal).map((s) => ({ ...s, _d: new Date(s.nextRenewal) })).filter((s) => !isNaN(s._d)).sort((a, b) => a._d - b._d).slice(0, 4);
    const byCat = {};
    activeSubs.forEach((s) => {
      byCat[s.category] = (byCat[s.category] || 0) + _subMonthly(s);
    });
    data.expenses.filter((e) => _sameMonth(e.date)).forEach((e) => {
      byCat[e.category] = (byCat[e.category] || 0) + (Number(e.amount) || 0);
    });
    const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
    const catMax = cats.length ? cats[0][1] : 1;
    const monthName = (/* @__PURE__ */ new Date()).toLocaleDateString("es-ES", { month: "long", year: "numeric" });
    return /* @__PURE__ */ React.createElement("div", { className: "page" }, /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", null, "Gastos"), /* @__PURE__ */ React.createElement("div", { className: "sub" }, "Control de gastos y suscripciones \xB7 ", monthName))), /* @__PURE__ */ React.createElement("div", { className: "rg-4", style: { marginBottom: 18 } }, /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body" }, /* @__PURE__ */ React.createElement("div", { className: "metric-label" }, "Gasto este mes"), /* @__PURE__ */ React.createElement("div", { className: "metric-value" }, _eur(totalMonth)), /* @__PURE__ */ React.createElement("div", { className: "metric-delta" }, "Recurrente + puntual"))), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body" }, /* @__PURE__ */ React.createElement("div", { className: "metric-label" }, "Recurrente / mes"), /* @__PURE__ */ React.createElement("div", { className: "metric-value", style: { color: "var(--blue)" } }, _eur(recurringMo)), /* @__PURE__ */ React.createElement("div", { className: "metric-delta" }, activeSubs.length, " suscripciones activas"))), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body" }, /* @__PURE__ */ React.createElement("div", { className: "metric-label" }, "Gastos puntuales"), /* @__PURE__ */ React.createElement("div", { className: "metric-value", style: { color: "var(--amber)" } }, _eur(expMonth)), /* @__PURE__ */ React.createElement("div", { className: "metric-delta" }, "Este mes"))), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body" }, /* @__PURE__ */ React.createElement("div", { className: "metric-label" }, "Coste anual estimado"), /* @__PURE__ */ React.createElement("div", { className: "metric-value" }, _eur(recurringMo * 12)), /* @__PURE__ */ React.createElement("div", { className: "metric-delta" }, "Solo suscripciones")))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, marginBottom: 18 }, className: "fin-split" }, /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body" }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 500, fontSize: 13, marginBottom: 14 } }, "Desglose por categor\xEDa (este mes)"), cats.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { color: "var(--text-subtle)", fontSize: 13, padding: "8px 0" } }, "Sin datos todav\xEDa.") : cats.map(([cat, amt]) => /* @__PURE__ */ React.createElement("div", { key: cat, style: { marginBottom: 11 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 5, color: "var(--text-muted)" } }, /* @__PURE__ */ React.createElement("span", null, cat), /* @__PURE__ */ React.createElement("span", { style: { fontVariantNumeric: "tabular-nums", color: "var(--text)" } }, _eur(amt))), /* @__PURE__ */ React.createElement("div", { style: { height: 6, borderRadius: 99, background: "var(--bg-elev-2)", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { height: "100%", width: `${Math.max(4, amt / catMax * 100)}%`, background: "var(--accent)", borderRadius: 99 } })))))), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body" }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 500, fontSize: 13, marginBottom: 14 } }, "Pr\xF3ximas renovaciones"), upcoming.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { color: "var(--text-subtle)", fontSize: 13, padding: "8px 0" } }, "Sin fechas de renovaci\xF3n.") : upcoming.map((s) => /* @__PURE__ */ React.createElement("div", { key: s.id, style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "0.5px solid var(--border)" } }, /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, s.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--text-subtle)" } }, _finDate(s.nextRenewal))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 500, fontVariantNumeric: "tabular-nums", flexShrink: 0 } }, _eur(s.amount))))))), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-header" }, /* @__PURE__ */ React.createElement("div", { className: "seg" }, /* @__PURE__ */ React.createElement("button", { className: tab === "subs" ? "active" : "", onClick: () => setTab("subs") }, "Suscripciones"), /* @__PURE__ */ React.createElement("button", { className: tab === "expenses" ? "active" : "", onClick: () => setTab("expenses") }, "Gastos")), /* @__PURE__ */ React.createElement(
      ActionPill,
      {
        plusActions: [
          {
            icon: "refresh-cw",
            label: "Nueva suscripci\xF3n",
            sub: "Gasto recurrente (mensual o anual).",
            onClick: () => {
              setTab("subs");
              setAddSub(true);
            }
          },
          {
            icon: "receipt",
            label: "Nuevo gasto puntual",
            sub: "Un gasto \xFAnico de un d\xEDa.",
            accent: true,
            onClick: () => {
              setTab("expenses");
              setAddExp(true);
            }
          }
        ]
      }
    )), tab === "subs" && /* @__PURE__ */ React.createElement("div", { className: "card-body flush" }, addSub && /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1.4fr 0.8fr 0.9fr 1fr 1fr auto", gap: 8, padding: "14px 18px", borderBottom: "0.5px solid var(--border)", alignItems: "center", background: "var(--bg-elev)" } }, /* @__PURE__ */ React.createElement("input", { style: FIN_INPUT, placeholder: "Nombre (ej. Adobe CC)", value: subForm.name, onChange: (e) => setSubForm({ ...subForm, name: e.target.value }) }), /* @__PURE__ */ React.createElement("input", { style: FIN_INPUT, type: "number", step: "0.01", placeholder: "\u20AC", value: subForm.amount, onChange: (e) => setSubForm({ ...subForm, amount: e.target.value }) }), /* @__PURE__ */ React.createElement("select", { style: FIN_INPUT, value: subForm.cycle, onChange: (e) => setSubForm({ ...subForm, cycle: e.target.value }) }, FIN_CYCLES.map((c) => /* @__PURE__ */ React.createElement("option", { key: c.id, value: c.id }, c.label))), /* @__PURE__ */ React.createElement("select", { style: FIN_INPUT, value: subForm.category, onChange: (e) => setSubForm({ ...subForm, category: e.target.value }) }, FIN_CATS.map((c) => /* @__PURE__ */ React.createElement("option", { key: c, value: c }, c))), /* @__PURE__ */ React.createElement("input", { style: FIN_INPUT, type: "date", title: "Pr\xF3xima renovaci\xF3n", value: subForm.nextRenewal, onChange: (e) => setSubForm({ ...subForm, nextRenewal: e.target.value }) }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, /* @__PURE__ */ React.createElement("button", { className: "btn primary sm", onClick: saveSub }, "Guardar"), /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: () => {
      setAddSub(false);
      setSubForm(blankSub);
    } }, "\u2715"))), data.subs.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { icon: "refresh-cw", title: "Sin suscripciones", sub: "A\xF1ade tus gastos recurrentes para controlarlos" }) : /* @__PURE__ */ React.createElement("table", { className: "table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Suscripci\xF3n"), /* @__PURE__ */ React.createElement("th", null, "Categor\xEDa"), /* @__PURE__ */ React.createElement("th", null, "Ciclo"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "Importe"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "Equiv. /mes"), /* @__PURE__ */ React.createElement("th", null, "Renovaci\xF3n"), /* @__PURE__ */ React.createElement("th", null, "Estado"), /* @__PURE__ */ React.createElement("th", { style: { width: 44 } }))), /* @__PURE__ */ React.createElement("tbody", null, data.subs.map((s) => /* @__PURE__ */ React.createElement("tr", { key: s.id, style: { opacity: s.active ? 1 : 0.5 } }, /* @__PURE__ */ React.createElement("td", { style: { fontWeight: 500 } }, s.name), /* @__PURE__ */ React.createElement("td", { className: "muted" }, s.category), /* @__PURE__ */ React.createElement("td", { className: "muted" }, s.cycle === "yearly" ? "Anual" : "Mensual"), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", fontVariantNumeric: "tabular-nums" } }, _eur(s.amount)), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", fontVariantNumeric: "tabular-nums", color: "var(--text-muted)" } }, _eur(_subMonthly(s))), /* @__PURE__ */ React.createElement("td", { className: "muted" }, _finDate(s.nextRenewal)), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: () => toggleSub(s.id), style: { color: s.active ? "var(--green)" : "var(--text-subtle)" } }, s.active ? "Activa" : "Pausada")), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right" } }, /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only sm", onClick: () => delSub(s.id), title: "Eliminar" }, /* @__PURE__ */ React.createElement(Icon, { name: "trash", size: 13 })))))))), tab === "expenses" && /* @__PURE__ */ React.createElement("div", { className: "card-body flush" }, addExp && /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1.6fr 0.8fr 1fr auto", gap: 8, padding: "14px 18px", borderBottom: "0.5px solid var(--border)", alignItems: "center", background: "var(--bg-elev)" } }, /* @__PURE__ */ React.createElement("input", { style: FIN_INPUT, type: "date", value: expForm.date, onChange: (e) => setExpForm({ ...expForm, date: e.target.value }) }), /* @__PURE__ */ React.createElement("input", { style: FIN_INPUT, placeholder: "Concepto", value: expForm.concept, onChange: (e) => setExpForm({ ...expForm, concept: e.target.value }) }), /* @__PURE__ */ React.createElement("input", { style: FIN_INPUT, type: "number", step: "0.01", placeholder: "\u20AC", value: expForm.amount, onChange: (e) => setExpForm({ ...expForm, amount: e.target.value }) }), /* @__PURE__ */ React.createElement("select", { style: FIN_INPUT, value: expForm.category, onChange: (e) => setExpForm({ ...expForm, category: e.target.value }) }, FIN_CATS.map((c) => /* @__PURE__ */ React.createElement("option", { key: c, value: c }, c))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, /* @__PURE__ */ React.createElement("button", { className: "btn primary sm", onClick: saveExp }, "Guardar"), /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: () => {
      setAddExp(false);
      setExpForm(blankExp);
    } }, "\u2715"))), data.expenses.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { icon: "receipt", title: "Sin gastos", sub: "Registra tus gastos puntuales del mes" }) : /* @__PURE__ */ React.createElement("table", { className: "table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Fecha"), /* @__PURE__ */ React.createElement("th", null, "Concepto"), /* @__PURE__ */ React.createElement("th", null, "Categor\xEDa"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "Importe"), /* @__PURE__ */ React.createElement("th", { style: { width: 44 } }))), /* @__PURE__ */ React.createElement("tbody", null, [...data.expenses].sort((a, b) => (b.date || "").localeCompare(a.date || "")).map((e) => /* @__PURE__ */ React.createElement("tr", { key: e.id }, /* @__PURE__ */ React.createElement("td", { className: "muted" }, _finDate(e.date)), /* @__PURE__ */ React.createElement("td", { style: { fontWeight: 500 } }, e.concept), /* @__PURE__ */ React.createElement("td", { className: "muted" }, e.category), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", fontVariantNumeric: "tabular-nums" } }, _eur(e.amount)), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right" } }, /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only sm", onClick: () => delExp(e.id), title: "Eliminar" }, /* @__PURE__ */ React.createElement(Icon, { name: "trash", size: 13 }))))))))));
  };
  const SimplePage = ({ title, sub, icon }) => /* @__PURE__ */ React.createElement("div", { className: "page" }, /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", null, title), sub && /* @__PURE__ */ React.createElement("div", { className: "sub" }, sub))), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body", style: { padding: 60 } }, /* @__PURE__ */ React.createElement(Empty, { icon, title: "Pr\xF3ximamente", sub: "Esta secci\xF3n est\xE1 en construcci\xF3n" }))));
  const SESSION_OPTS = [
    { days: 0, label: "Solo esta sesi\xF3n", sub: "Se cerrar\xE1 al cerrar el navegador" },
    { days: 1, label: "1 d\xEDa", sub: "Hasta ma\xF1ana a esta hora" },
    { days: 7, label: "7 d\xEDas", sub: "Una semana sin volver a entrar" },
    { days: 30, label: "30 d\xEDas", sub: "Comodidad m\xE1xima" }
  ];
  const SessionCard = () => {
    var _a;
    const toast = useToast();
    const info = ((_a = window._sessionUtils) == null ? void 0 : _a.info()) || { days: 0, exp: null };
    const [days, setDays] = React.useState(info.days || 0);
    const expLabel = (() => {
      if (!info.exp || info.exp === "0") return "Solo esta sesi\xF3n (cierra con el navegador)";
      if (info.exp === "never") return "Sin expiraci\xF3n";
      const d = new Date(parseInt(info.exp));
      if (isNaN(d)) return "Solo esta sesi\xF3n";
      const dias = ["domingo", "lunes", "martes", "mi\xE9rcoles", "jueves", "viernes", "s\xE1bado"];
      const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
      return `Hasta el ${dias[d.getDay()]} ${d.getDate()} de ${meses[d.getMonth()]} a las ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    })();
    const save = () => {
      try {
        const raw = localStorage.getItem("141_session");
        if (!raw) {
          toast("No hay sesi\xF3n activa", "error");
          return;
        }
        window._sessionUtils.save(JSON.parse(raw), days);
        toast("Sesi\xF3n actualizada", "success");
      } catch (e) {
        toast("Error al guardar", "error");
      }
    };
    return /* @__PURE__ */ React.createElement("div", { className: "card", style: { gridColumn: "1/-1" } }, /* @__PURE__ */ React.createElement("div", { className: "card-header" }, /* @__PURE__ */ React.createElement("div", { className: "card-title" }, "Sesi\xF3n y acceso")), /* @__PURE__ */ React.createElement("div", { className: "card-body" }, /* @__PURE__ */ React.createElement("div", { className: "muted small", style: { marginBottom: 16 } }, "Estado actual: ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text)", fontWeight: 500 } }, expLabel)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 20, maxWidth: 480 } }, SESSION_OPTS.map((opt) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key: opt.days,
        onClick: () => setDays(opt.days),
        style: {
          padding: "10px 14px",
          borderRadius: 10,
          cursor: "pointer",
          border: `1.5px solid ${days === opt.days ? "var(--accent)" : "var(--border-strong)"}`,
          background: days === opt.days ? "var(--accent-soft)" : "var(--bg-elev)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          transition: "all .1s"
        }
      },
      /* @__PURE__ */ React.createElement("div", { style: {
        width: 16,
        height: 16,
        borderRadius: "50%",
        flexShrink: 0,
        border: `2px solid ${days === opt.days ? "var(--accent)" : "var(--border-strong)"}`,
        display: "grid",
        placeItems: "center"
      } }, days === opt.days && /* @__PURE__ */ React.createElement("div", { style: { width: 7, height: 7, borderRadius: "50%", background: "var(--accent)" } })),
      /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 500, color: days === opt.days ? "var(--accent)" : "var(--text)" } }, opt.label), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-subtle)", marginTop: 1 } }, opt.sub))
    ))), /* @__PURE__ */ React.createElement("button", { className: "btn primary sm", onClick: save }, /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 12 }), " Aplicar")));
  };
  const SettingsPage = () => {
    const D = window.Data;
    D.useStore();
    const toast = useToast();
    const [form, setForm] = useState({ ...D.SETTINGS });
    const [saved, setSaved] = useState(false);
    const field = (key) => ({
      value: form[key] || "",
      onChange: (e) => {
        setForm((f) => ({ ...f, [key]: e.target.value }));
        setSaved(false);
      }
    });
    const save = () => {
      D.updateSettings(form);
      setSaved(true);
      toast("Ajustes guardados", "success");
    };
    return /* @__PURE__ */ React.createElement("div", { className: "page" }, /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", null, "Ajustes"), /* @__PURE__ */ React.createElement("div", { className: "sub" }, "Informaci\xF3n de la agencia y preferencias generales")), /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: save }, /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 13 }), " Guardar cambios")), /* @__PURE__ */ React.createElement("div", { className: "rg-settings" }, /* @__PURE__ */ React.createElement("div", { className: "card", style: { gridColumn: "1/-1" } }, /* @__PURE__ */ React.createElement("div", { className: "card-header" }, /* @__PURE__ */ React.createElement("div", { className: "card-title" }, "Informaci\xF3n de la agencia")), /* @__PURE__ */ React.createElement("div", { className: "card-body", style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "label" }, "Nombre de la agencia"), /* @__PURE__ */ React.createElement("input", { className: "input", ...field("name"), placeholder: "141'STUDIO" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "label" }, "Tagline"), /* @__PURE__ */ React.createElement("input", { className: "input", ...field("tagline"), placeholder: "Agencia digital" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "label" }, "Email de contacto"), /* @__PURE__ */ React.createElement("input", { className: "input", type: "email", ...field("email"), placeholder: "hello@tuagencia.com" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "label" }, "Tel\xE9fono / WhatsApp"), /* @__PURE__ */ React.createElement("input", { className: "input", ...field("phone"), placeholder: "+34 600 000 000" })), /* @__PURE__ */ React.createElement("div", { style: { gridColumn: "1/-1" } }, /* @__PURE__ */ React.createElement("label", { className: "label" }, "Web"), /* @__PURE__ */ React.createElement("input", { className: "input", ...field("website"), placeholder: "https://tuagencia.com" })))), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-header" }, /* @__PURE__ */ React.createElement("div", { className: "card-title" }, "Credenciales de acceso")), /* @__PURE__ */ React.createElement("div", { className: "card-body" }, /* @__PURE__ */ React.createElement("div", { className: "muted small", style: { marginBottom: 14 } }, "Las credenciales de acceso se gestionan directamente en el c\xF3digo fuente por seguridad."), /* @__PURE__ */ React.createElement("div", { style: { background: "var(--bg-elev-2)", border: "0.5px solid var(--border)", borderRadius: 8, padding: "10px 14px", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)" } }, "Email: nil@141agency.com"))), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-header" }, /* @__PURE__ */ React.createElement("div", { className: "card-title" }, "Apariencia")), /* @__PURE__ */ React.createElement("div", { className: "card-body" }, /* @__PURE__ */ React.createElement("div", { className: "muted small" }, "El tema claro/oscuro se controla con el bot\xF3n en la barra superior derecha."), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 14, padding: "10px 14px", background: "var(--accent-soft)", borderRadius: 8, fontSize: 12, color: "var(--text-muted)" } }, /* @__PURE__ */ React.createElement(Icon, { name: "sparkles", size: 12 }), " Pr\xF3ximamente: colores de acento personalizables, logo de la agencia y dominio del portal cliente."))), /* @__PURE__ */ React.createElement(SessionCard, null)));
  };
  const TaskProgressModal = ({ task, projectId, open, onClose, onDelete, onUpdate }) => {
    const [progress, setProgress] = useState(0);
    const [dotsOpen, setDotsOpen] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [mode, setMode] = useState("progress");
    const [editTitle, setEditTitle] = useState("");
    const [editDeadline, setEditDeadline] = useState("");
    const [displayProgress, setDisplayProgress] = useState(0);
    const svgRef = useRef(null);
    const dragRef = useRef({ angle: 0, progress: 0 });
    const animFrameRef = useRef(null);
    const justDraggedRef = useRef(false);
    const taskId = task ? task.id : null;
    useEffect(() => {
      if (open && task) {
        const init = Math.round((task.progress || 0) / 25) * 25;
        setProgress(init);
        setDisplayProgress(init);
        setMode("progress");
        setDotsOpen(false);
        setEditTitle(task.title || "");
        setEditDeadline(task.deadline || "");
      }
    }, [open, taskId]);
    useEffect(() => {
      if (!open) return;
      const fn = (e) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", fn);
      return () => window.removeEventListener("keydown", fn);
    }, [open]);
    useEffect(() => {
      if (open) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
      return () => {
        document.body.style.overflow = "";
      };
    }, [open]);
    useEffect(() => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (dragging) {
        setDisplayProgress(progress);
        return;
      }
      const target = progress;
      const step = () => {
        setDisplayProgress((prev) => {
          const diff = target - prev;
          if (Math.abs(diff) < 0.15) return target;
          animFrameRef.current = requestAnimationFrame(step);
          return prev + diff * 0.22;
        });
      };
      animFrameRef.current = requestAnimationFrame(step);
      return () => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };
    }, [progress, dragging]);
    if (!open || !task) return null;
    const CX = 320, CY = 456, R = 456;
    const ARC_SWEEP = 64;
    const toPt = (stdDeg, r = R) => {
      const rad = stdDeg * Math.PI / 180;
      return [CX + r * Math.cos(rad), CY - r * Math.sin(rad)];
    };
    const bgY = CY - Math.sqrt(R * R - CX * CX);
    const bgArcPath = `M 0 ${bgY.toFixed(1)} A ${R} ${R} 0 0 1 640 ${bgY.toFixed(1)}`;
    const tickAngle = (p) => 90 + (displayProgress - p) * ARC_SWEEP / 100;
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
      const onUp = () => {
        setDragging(false);
        setProgress((p) => Math.round(p / 25) * 25);
        justDraggedRef.current = true;
        setTimeout(() => {
          justDraggedRef.current = false;
        }, 0);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    };
    const moveDrag = (clientX, clientY) => {
      const angle = getMouseAngle(clientX, clientY);
      const delta = (angle - dragRef.current.angle) * 100 / ARC_SWEEP;
      const newP = Math.round(Math.max(0, Math.min(100, dragRef.current.progress + delta)));
      setProgress(newP);
    };
    const TICKS = [0, 25, 50, 75, 100];
    const statusLabel = progress === 100 ? "COMPLETADA" : progress === 0 ? "PENDIENTE" : "EN CURSO";
    const confirmProgress = () => {
      const updates = { progress };
      if (progress === 100) {
        updates.column = "done";
        const n = /* @__PURE__ */ new Date();
        updates.doneAt = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
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
    const btnCircle = (onClick, children) => /* @__PURE__ */ React.createElement("button", { onClick, style: {
      width: 36,
      height: 36,
      borderRadius: "50%",
      background: "rgba(255,255,255,0.08)",
      border: "0.5px solid rgba(255,255,255,0.1)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--text-muted)",
      flexShrink: 0
    } }, children);
    return ReactDOM.createPortal(
      /* @__PURE__ */ React.createElement(
        "div",
        {
          className: "progress-modal-overlay",
          style: {
            position: "fixed",
            inset: 0,
            zIndex: 500,
            background: "rgba(0,0,0,0.78)",
            backdropFilter: "blur(18px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "fade .15s ease-out"
          },
          onClick: () => {
            if (justDraggedRef.current) return;
            onClose();
          }
        },
        /* @__PURE__ */ React.createElement(
          "div",
          {
            className: "progress-modal-sheet",
            onClick: (e) => e.stopPropagation(),
            style: {
              width: "100%",
              maxWidth: 540,
              background: "#111111",
              border: "0.5px solid rgba(255,255,255,0.08)",
              borderRadius: 32,
              overflow: "hidden",
              animation: "pop .2s cubic-bezier(.2,.8,.2,1)",
              display: "flex",
              flexDirection: "column",
              userSelect: "none"
            }
          },
          /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "center", paddingTop: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 36, height: 4, borderRadius: 99, background: "rgba(255,255,255,0.18)" } })),
          /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px 0" } }, /* @__PURE__ */ React.createElement("button", { onClick: onClose, style: {
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            border: "0.5px solid rgba(255,255,255,0.1)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-muted)",
            flexShrink: 0
          } }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 15 })), /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", background: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 99 } }, /* @__PURE__ */ React.createElement("button", { onClick: () => setMode("edit"), style: {
            width: 46,
            height: 40,
            background: "transparent",
            border: "none",
            borderRight: "0.5px solid rgba(255,255,255,0.1)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-muted)"
          } }, /* @__PURE__ */ React.createElement(Icon, { name: "arrow-up-right", size: 15 })), /* @__PURE__ */ React.createElement("button", { onClick: (e) => {
            e.stopPropagation();
            setDotsOpen((o) => !o);
          }, style: {
            width: 46,
            height: 40,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-muted)"
          } }, /* @__PURE__ */ React.createElement(Icon, { name: "more-h", size: 15 }))), dotsOpen && /* @__PURE__ */ React.createElement(
            "div",
            {
              onClick: (e) => e.stopPropagation(),
              style: {
                position: "absolute",
                right: 0,
                top: 48,
                zIndex: 600,
                background: "#1c1c1e",
                border: "0.5px solid rgba(255,255,255,0.1)",
                borderRadius: 14,
                overflow: "hidden",
                minWidth: 170,
                boxShadow: "0 12px 32px rgba(0,0,0,0.5)"
              }
            },
            /* @__PURE__ */ React.createElement(
              "button",
              {
                onClick: () => {
                  setDotsOpen(false);
                  setMode("edit");
                },
                style: { display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 16px", border: 0, background: "transparent", color: "var(--text)", fontSize: 13, cursor: "pointer", fontFamily: "inherit", textAlign: "left" },
                onMouseEnter: (e) => e.currentTarget.style.background = "rgba(255,255,255,0.06)",
                onMouseLeave: (e) => e.currentTarget.style.background = "transparent"
              },
              /* @__PURE__ */ React.createElement(Icon, { name: "edit-2", size: 13 }),
              " Editar tarea"
            ),
            /* @__PURE__ */ React.createElement("div", { style: { height: "0.5px", background: "rgba(255,255,255,0.08)" } }),
            /* @__PURE__ */ React.createElement(
              "button",
              {
                onClick: () => {
                  setDotsOpen(false);
                  onClose();
                  onDelete();
                },
                style: { display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 16px", border: 0, background: "transparent", color: "var(--red)", fontSize: 13, cursor: "pointer", fontFamily: "inherit", textAlign: "left" },
                onMouseEnter: (e) => e.currentTarget.style.background = "rgba(220,91,93,0.08)",
                onMouseLeave: (e) => e.currentTarget.style.background = "transparent"
              },
              /* @__PURE__ */ React.createElement(Icon, { name: "trash", size: 13 }),
              " Eliminar tarea"
            )
          ))),
          mode === "progress" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", padding: "28px 0 60px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 86, fontWeight: 300, letterSpacing: "-4px", color: "var(--text)", lineHeight: 1 } }, progress, "%"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-subtle)", letterSpacing: "0.12em", marginTop: 10, fontWeight: 500 } }, statusLabel)), /* @__PURE__ */ React.createElement(
            "svg",
            {
              ref: svgRef,
              viewBox: "0 -32 640 202",
              style: { width: "100%", display: "block", cursor: dragging ? "grabbing" : "grab", overflow: "visible" },
              onMouseDown: (e) => {
                e.preventDefault();
                startDrag(e.clientX, e.clientY);
              },
              onTouchStart: (e) => {
                e.preventDefault();
                const t = e.touches[0];
                startDrag(t.clientX, t.clientY);
              },
              onTouchMove: (e) => {
                e.preventDefault();
                const t = e.touches[0];
                moveDrag(t.clientX, t.clientY);
              },
              onTouchEnd: () => {
                setDragging(false);
                setProgress((p) => Math.round(p / 25) * 25);
              }
            },
            /* @__PURE__ */ React.createElement("path", { d: bgArcPath, fill: "none", stroke: "rgba(255,255,255,0.1)", strokeWidth: "1.5" }),
            TICKS.map((pct) => {
              const deg = tickAngle(pct);
              const rad = deg * Math.PI / 180;
              const cosR = Math.cos(rad), sinR = Math.sin(rad);
              const [ax, ay] = toPt(deg);
              const dist = Math.abs(deg - 90);
              if (dist > 52) return null;
              const fade = dist > 36 ? Math.max(0, (52 - dist) / 16) : 1;
              const t1x = ax - cosR * 8, t1y = ay + sinR * 8;
              const t2x = ax - cosR * 20, t2y = ay + sinR * 20;
              const lx = ax - cosR * 40, ly = ay + sinR * 40;
              const isActive = pct === progress;
              return /* @__PURE__ */ React.createElement("g", { key: pct, opacity: fade }, /* @__PURE__ */ React.createElement(
                "line",
                {
                  x1: t1x.toFixed(1),
                  y1: t1y.toFixed(1),
                  x2: t2x.toFixed(1),
                  y2: t2y.toFixed(1),
                  stroke: isActive ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.35)",
                  strokeWidth: isActive ? "2" : "1.5",
                  strokeLinecap: "round"
                }
              ), /* @__PURE__ */ React.createElement(
                "text",
                {
                  x: lx.toFixed(1),
                  y: ly.toFixed(1),
                  textAnchor: "middle",
                  dominantBaseline: "middle",
                  fontSize: isActive ? "18" : "13",
                  fontWeight: isActive ? "500" : "400",
                  fill: isActive ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)",
                  fontFamily: "var(--font-sans)"
                },
                pct,
                "%"
              ));
            }),
            /* @__PURE__ */ React.createElement("polygon", { points: `${CX - 5},-22 ${CX + 5},-22 ${CX},-10`, fill: "white" })
          ), /* @__PURE__ */ React.createElement("div", { style: { padding: "0 20px 28px", display: "flex", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(
            "button",
            {
              onClick: confirmProgress,
              style: { padding: "13px 52px", background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: 99, color: "var(--text)", fontSize: 14, letterSpacing: "-0.5px", cursor: "pointer", fontFamily: "var(--font-sans)", transition: "background .15s" },
              onMouseEnter: (e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)",
              onMouseLeave: (e) => e.currentTarget.style.background = "rgba(255,255,255,0.06)"
            },
            "Confirmar"
          ))) : (
            /* Edit mode */
            /* @__PURE__ */ React.createElement("div", { style: { padding: "24px 20px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-subtle)", marginBottom: 16, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 } }, "Editar tarea"), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 12 } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: 11, color: "var(--text-subtle)", marginBottom: 6 } }, "Nombre"), /* @__PURE__ */ React.createElement(
              "input",
              {
                autoFocus: true,
                value: editTitle,
                onChange: (e) => setEditTitle(e.target.value),
                onKeyDown: (e) => {
                  if (e.key === "Enter") saveEdit();
                  if (e.key === "Escape") setMode("progress");
                },
                style: { width: "100%", background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "var(--text)", fontSize: 14, padding: "10px 14px", fontFamily: "var(--font-sans)", outline: "none", boxSizing: "border-box" }
              }
            )), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 20 } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: 11, color: "var(--text-subtle)", marginBottom: 6 } }, "Fecha l\xEDmite"), /* @__PURE__ */ React.createElement(
              "input",
              {
                type: "date",
                value: editDeadline,
                onChange: (e) => setEditDeadline(e.target.value),
                style: { width: "100%", background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "var(--text)", fontSize: 14, padding: "10px 14px", fontFamily: "var(--font-sans)", outline: "none", boxSizing: "border-box" }
              }
            )), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { onClick: saveEdit, style: { flex: 1, padding: "11px", background: "var(--accent-soft)", border: "0.5px solid var(--accent)", borderRadius: 12, color: "var(--accent)", fontSize: 13, cursor: "pointer", fontFamily: "inherit" } }, "Guardar"), /* @__PURE__ */ React.createElement("button", { onClick: () => setMode("progress"), style: { padding: "11px 16px", background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "var(--text-muted)", fontSize: 13, cursor: "pointer", fontFamily: "inherit" } }, "Cancelar")))
          )
        )
      ),
      document.body
    );
  };
  Object.assign(window, { AgencyBilling, AgencyProjects, SimplePage, SettingsPage, TasksBoard, ProjectTaskColumn, TaskRow });
})();

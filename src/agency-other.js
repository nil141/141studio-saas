(() => {
  // src/agency-other.jsx
  var TasksBoard = ({ navigate, openModal, initialDate }) => {
    const D = window.Data;
    D.useStore();
    const [selectedDay, setSelectedDay] = useState(initialDate ? /* @__PURE__ */ new Date(initialDate + "T12:00:00") : /* @__PURE__ */ new Date());
    const [taskModal, setTaskModal] = useState(null);
    const [hideCompleted, setHideCompleted] = useState(false);
    const [optionsOpen, setOptionsOpen] = useState(false);
    const DAY_ES = ["Dom", "Lun", "Mar", "Mi\xE9", "Jue", "Vie", "S\xE1b"];
    const MON_ES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const C_DOTS = ["#fb7185", "#60a5fa", "#fbbf24", "#34d399", "#a78bfa", "#f472b6", "#22d3ee", "#f59e0b"];
    const stripDays = (() => {
      const base = /* @__PURE__ */ new Date();
      base.setHours(12, 0, 0, 0);
      return Array.from({ length: 91 }, (_, i) => {
        const d = new Date(base);
        d.setDate(base.getDate() - 30 + i);
        return d;
      });
    })();
    const stripRef = useRef(null);
    const todayMid = /* @__PURE__ */ new Date();
    todayMid.setHours(0, 0, 0, 0);
    const selMid = new Date(selectedDay);
    selMid.setHours(0, 0, 0, 0);
    useEffect(() => {
      const el = stripRef.current;
      if (!el) return;
      const monday = new Date(selMid);
      monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
      const idx = stripDays.findIndex((d) => {
        const m = new Date(d);
        m.setHours(0, 0, 0, 0);
        return m.getTime() === monday.getTime();
      });
      if (idx < 0) return;
      const dayW = el.clientWidth / 7;
      el.scrollTo({ left: Math.max(0, idx * dayW), behavior: el.dataset.init ? "smooth" : "auto" });
      el.dataset.init = "1";
    }, [selectedDay]);
    const _projIds = new Set(D.PROJECTS.map((p) => p.id));
    const allTasks = Object.entries(D.TASKS).filter(([pid]) => pid === "__none__" || _projIds.has(pid)).flatMap(([, arr]) => arr);
    const selDateStr = (() => {
      const d = new Date(selectedDay);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    })();
    const todayStr = `${todayMid.getFullYear()}-${String(todayMid.getMonth() + 1).padStart(2, "0")}-${String(todayMid.getDate()).padStart(2, "0")}`;
    const isToday = selDateStr === todayStr;
    const matchesDay = (t) => t.deadline === selDateStr || isToday && t.deadline && t.deadline < selDateStr && (t.column !== "done" || t.doneAt === todayStr);
    const dayTasks = allTasks.filter(matchesDay);
    const dayRoutines = D.routinesForDay ? D.routinesForDay(selDateStr) : [];
    let routineTotal = 0, routineDone = 0;
    dayRoutines.forEach((r) => (r.items || []).forEach((it) => {
      routineTotal += 1;
      if (D.routineItemDone(r.id, selDateStr, it.id)) routineDone += 1;
    }));
    const progressUnits = dayTasks.length + routineTotal;
    const donePct = progressUnits ? Math.round((dayTasks.reduce((s, t) => s + (t.column === "done" ? 100 : t.progress || 0), 0) + routineDone * 100) / progressUnits) : 0;
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
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        onClick: () => setOptionsOpen(false),
        style: {
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          padding: "28px 32px 0",
          maxWidth: 1400,
          margin: "0 auto",
          overflow: "hidden"
        }
      },
      /* @__PURE__ */ React.createElement("div", { className: "page-head", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement(
        "div",
        {
          onClick: () => {
            if (!isToday) setSelectedDay(/* @__PURE__ */ new Date());
          },
          "data-tooltip": !isToday ? "Volver a hoy" : void 0,
          style: { cursor: isToday ? "default" : "pointer" }
        },
        /* @__PURE__ */ React.createElement("h1", null, "Tareas"),
        /* @__PURE__ */ React.createElement("div", { className: "sub" }, (() => {
          const f = new Date(selectedDay).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
          return f.charAt(0).toUpperCase() + f.slice(1);
        })())
      ), /* @__PURE__ */ React.createElement(
        ActionPill,
        {
          plusActions: [
            {
              icon: "list-todo",
              label: "Nueva tarea",
              sub: "Una tarea puntual para un d\xEDa.",
              accent: true,
              onClick: () => openModal("newTask", { date: selDateStr })
            },
            {
              icon: "refresh-cw",
              label: "Nueva rutina",
              sub: "Una tarea que se repite en el tiempo.",
              onClick: () => openModal("newRoutine", { date: selDateStr })
            }
          ],
          moreActions: [
            {
              icon: hideCompleted ? "eye" : "eye-off",
              label: hideCompleted ? "Mostrar completadas" : "Ocultar completadas",
              onClick: () => setHideCompleted((h) => !h)
            }
          ]
        }
      )),
      /* @__PURE__ */ React.createElement("div", { style: { borderBottom: "0.5px solid var(--border)", paddingBottom: 18, marginBottom: 0, flexShrink: 0 } }, /* @__PURE__ */ React.createElement("style", null, `.day-scroll::-webkit-scrollbar{display:none}`), (() => {
        return /* @__PURE__ */ React.createElement("div", { ref: stripRef, className: "day-scroll", style: {
          display: "flex",
          alignItems: "stretch",
          padding: "4px 0",
          overflowX: "auto",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          scrollSnapType: "x mandatory"
        } }, stripDays.map((d, i) => {
          const dMid = new Date(d);
          dMid.setHours(0, 0, 0, 0);
          const isSel = dMid.getTime() === selMid.getTime();
          const isToday2 = dMid.getTime() === todayMid.getTime();
          const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          const tasksToday = allTasks.filter((t) => t.deadline === dStr);
          let doneToday = tasksToday.filter((t) => t.column === "done").length;
          let totalToday = tasksToday.length;
          (D.routinesForDay ? D.routinesForDay(dStr) : []).forEach((r2) => (r2.items || []).forEach((it) => {
            totalToday += 1;
            if (D.routineItemDone(r2.id, dStr, it.id)) doneToday += 1;
          }));
          const loadPct = totalToday ? Math.min(100, Math.round(doneToday / totalToday * 100)) : 0;
          const hasLoad = totalToday > 0;
          const sz = 56;
          const r = 24;
          const sw = 3;
          const c = 2 * Math.PI * r;
          const trackCol = isSel ? "rgba(158,154,229,0.18)" : isToday2 ? "rgba(158,154,229,0.10)" : "rgba(255,255,255,0.06)";
          const ringCol = isSel ? "var(--accent)" : isToday2 ? "rgba(158,154,229,0.65)" : "rgba(255,255,255,0.35)";
          return /* @__PURE__ */ React.createElement("button", { key: d.toISOString(), onClick: () => setSelectedDay(new Date(d)), style: {
            flex: "0 0 calc(100% / 7)",
            cursor: "pointer",
            border: "none",
            background: "transparent",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            padding: "6px 0",
            scrollSnapAlign: d.getDay() === 1 ? "start" : "none",
            // encaja por lunes
            scrollSnapStop: d.getDay() === 1 ? "always" : "normal",
            transition: "transform .25s cubic-bezier(0.34,1.2,0.46,1)",
            transform: isSel ? "scale(1.04)" : "scale(1)"
          } }, /* @__PURE__ */ React.createElement("span", { style: {
            fontSize: 10,
            fontWeight: 600,
            color: isSel ? "var(--accent)" : isToday2 ? "var(--text-muted)" : "var(--text-subtle)",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            transition: "color .2s"
          } }, ["Dom", "Lun", "Mar", "Mi\xE9", "Jue", "Vie", "S\xE1b"][d.getDay()]), /* @__PURE__ */ React.createElement("div", { style: {
            position: "relative",
            width: sz,
            height: sz,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          } }, /* @__PURE__ */ React.createElement("svg", { width: sz, height: sz, style: { position: "absolute", inset: 0, transform: "rotate(-90deg)" } }, /* @__PURE__ */ React.createElement(
            "circle",
            {
              cx: sz / 2,
              cy: sz / 2,
              r,
              fill: "none",
              stroke: trackCol,
              strokeWidth: sw
            }
          ), hasLoad && /* @__PURE__ */ React.createElement(
            "circle",
            {
              cx: sz / 2,
              cy: sz / 2,
              r,
              fill: "none",
              stroke: ringCol,
              strokeWidth: sw,
              strokeLinecap: "round",
              strokeDasharray: `${loadPct / 100 * c} ${c}`,
              style: {
                transition: "stroke-dasharray .5s ease, stroke .25s",
                filter: isSel ? "drop-shadow(0 0 6px rgba(158,154,229,0.55))" : "none"
              }
            }
          ), !hasLoad && isToday2 && /* @__PURE__ */ React.createElement(
            "circle",
            {
              cx: sz / 2,
              cy: sz / 2 - r,
              r: 2.5,
              fill: "var(--accent)",
              transform: `rotate(90 ${sz / 2} ${sz / 2})`
            }
          )), isSel && /* @__PURE__ */ React.createElement("div", { style: {
            position: "absolute",
            width: sz - sw * 2 - 4,
            height: sz - sw * 2 - 4,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(158,154,229,0.22) 0%, rgba(158,154,229,0.05) 70%, transparent 100%)"
          } }), /* @__PURE__ */ React.createElement("span", { style: {
            position: "relative",
            zIndex: 1,
            fontSize: 18,
            fontWeight: isToday2 || isSel ? 500 : 400,
            color: isToday2 ? "var(--accent)" : isSel ? "#f0eeff" : "var(--text-muted)",
            letterSpacing: "-0.6px",
            lineHeight: 1,
            transition: "color .2s"
          } }, d.getDate())));
        }));
      })(), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12, marginTop: 18 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: "var(--text-subtle)", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 500, flexShrink: 0 } }, "Daily Progress"), /* @__PURE__ */ React.createElement("div", { style: {
        flex: 1,
        height: 12,
        borderRadius: 99,
        border: "0.5px solid var(--border-strong)",
        background: "rgba(255,255,255,0.02)",
        padding: 3,
        display: "flex",
        alignItems: "center"
      } }, /* @__PURE__ */ React.createElement("div", { style: { width: `${donePct}%`, height: "100%", background: "var(--accent)", borderRadius: 99, transition: "width .4s" } })), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "var(--text-muted)", fontWeight: 500, flexShrink: 0 } }, donePct, "%"))),
      /* @__PURE__ */ React.createElement("div", { className: "tasks-scroll", style: {
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        scrollbarGutter: "stable",
        paddingRight: 10,
        paddingTop: 22,
        paddingBottom: 8,
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0, #000 22px, #000 calc(100% - 24px), transparent 100%)",
        maskImage: "linear-gradient(to bottom, transparent 0, #000 22px, #000 calc(100% - 24px), transparent 100%)"
      } }, /* @__PURE__ */ React.createElement(window.RoutineDayList, { day: selDateStr, onEdit: (r) => openModal("editRoutine", { routine: r }) }), groups.length === 0 && D.routinesForDay(selDateStr).length === 0 && /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", padding: "60px 0", color: "var(--text-subtle)", fontSize: 14, letterSpacing: "-0.5px" } }, "Sin tareas para este d\xEDa \u2014 ", /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: () => openModal("newTask", { date: selDateStr }) }, "crear una")), groups.map((group, gIdx) => /* @__PURE__ */ React.createElement("div", { key: group.clientId, style: { marginBottom: gIdx === groups.length - 1 ? 0 : 32 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 7, height: 7, borderRadius: "50%", background: group.color, flexShrink: 0 } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, fontWeight: 400, letterSpacing: "0", textTransform: "uppercase", color: "#9e9e9e" } }, group.clientName)), group.projects.map(({ project, tasks }) => tasks.filter((t) => !hideCompleted || t.column !== "done").map((t, idx, arr) => {
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
      })), gIdx !== groups.length - 1 && /* @__PURE__ */ React.createElement("div", { className: "client-divider", style: { height: "0.5px", background: "var(--border)", marginTop: 4 } })))),
      taskModal && /* @__PURE__ */ React.createElement(
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
      )
    );
  };
  var ProjectTaskColumn = ({ project: p, navigate, toast }) => {
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
  var TaskDotsMenu = ({ task: t, onDelete, onUpdate }) => {
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
  var TaskRow = ({ task: t, onToggle, onDelete, onUpdate, COL_COLORS, COL_LABELS, isDone, projectId }) => {
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
  var AgencyProjects = ({ navigate, openModal }) => {
    const D = window.Data;
    D.useStore();
    const confirm = useConfirm();
    const toast = useToast();
    const [hoverId, setHoverId] = useState(null);
    const _lightColor = (l) => l === "red" ? "var(--red)" : l === "amber" ? "var(--amber)" : l === "green" ? "var(--green)" : "var(--accent)";
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
    )), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", width: "100%" } }, D.PROJECTS.map((p) => {
      const pTasks = D.TASKS[p.id] || [];
      const doneN = pTasks.filter((t) => t.column === "done").length;
      const liveProgress = pTasks.length ? Math.round(doneN / pTasks.length * 100) : 0;
      const col = _lightColor(p.light);
      const on = hoverId === p.id;
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          key: p.id,
          onClick: () => navigate("project", { projectId: p.id }),
          onMouseEnter: () => setHoverId(p.id),
          onMouseLeave: () => setHoverId(null),
          style: {
            display: "flex",
            flexDirection: "column",
            gap: 12,
            padding: "18px 6px",
            cursor: "pointer",
            borderBottom: "0.5px solid var(--border)"
          }
        },
        /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 14, minWidth: 0 } }, /* @__PURE__ */ React.createElement(
          Icon,
          {
            name: "package",
            size: 22,
            strokeWidth: 1.6,
            style: { color: "var(--text)", flexShrink: 0, transform: on ? "scale(1.06)" : "none", transition: "transform .3s" }
          }
        ), /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: {
          fontSize: 17,
          color: "var(--text)",
          letterSpacing: "-0.4px",
          lineHeight: 1.2,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis"
        } }, p.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: "var(--text-muted)", marginTop: 3, display: "flex", alignItems: "center", gap: 6, minWidth: 0 } }, /* @__PURE__ */ React.createElement("span", { style: { flexShrink: 0 } }, pTasks.length, " ", pTasks.length === 1 ? "tarea" : "tareas"), /* @__PURE__ */ React.createElement("span", { style: { opacity: 0.4, fontSize: 10 } }, "\u2022"), /* @__PURE__ */ React.createElement("span", { style: { flexShrink: 0 } }, doneN, " hechas"), p.clientName && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { style: { opacity: 0.4, fontSize: 10 } }, "\u2022"), /* @__PURE__ */ React.createElement("span", { style: { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, p.clientName))))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 4, flexShrink: 0 } }, /* @__PURE__ */ React.createElement(
          "button",
          {
            className: "btn ghost icon-only sm",
            "data-tooltip": "Eliminar",
            onClick: (e) => removeProject(p, e),
            style: { opacity: on ? 0.65 : 0, transition: "opacity .15s", color: "var(--red)" }
          },
          /* @__PURE__ */ React.createElement(Icon, { name: "trash", size: 13 })
        ), /* @__PURE__ */ React.createElement(
          Icon,
          {
            name: "chevron-right",
            size: 18,
            style: {
              color: on ? "var(--text)" : "var(--text-muted)",
              transform: on ? "translateX(3px)" : "none",
              transition: "all .2s",
              flexShrink: 0
            }
          }
        ))),
        /* @__PURE__ */ React.createElement("div", { style: { position: "relative", width: "100%", height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 99, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", height: "100%", borderRadius: 99, background: col, width: `${liveProgress}%`, transition: "width .3s" } }))
      );
    }), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => openModal("newProject"),
        style: {
          marginTop: 16,
          width: "100%",
          padding: "26px",
          borderRadius: 22,
          border: "1px dashed var(--border)",
          background: "transparent",
          cursor: "pointer",
          color: "var(--text-muted)",
          fontSize: 15,
          fontFamily: "inherit",
          opacity: 0.5,
          transition: "opacity .2s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          letterSpacing: "-0.2px"
        },
        onMouseEnter: (e) => e.currentTarget.style.opacity = 0.85,
        onMouseLeave: (e) => e.currentTarget.style.opacity = 0.5
      },
      D.PROJECTS.length === 0 ? "Crea tu primer proyecto" : "A\xF1adir proyecto",
      " ",
      /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 16 })
    )));
  };
  var _stripeApi = async (endpoint, body = {}) => {
    const res = await window.apiFetch(`/api/stripe/${endpoint}`, body);
    return res.json();
  };
  var FIN_CATS = ["Software", "Hosting", "Marketing", "Publicidad", "Oficina", "Impuestos", "Freelance", "Otros"];
  var _eur = (n) => "\u20AC" + (Number(n) || 0).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var _finLoad = () => {
    const d = window.Data && window.Data.FINANCE || {};
    return { subs: d.subs || [], expenses: d.expenses || [] };
  };
  var _finSave = (d) => {
    try {
      window.Data.saveFinance(d);
    } catch (e) {
    }
  };
  var _finId = () => window.crypto && crypto.randomUUID ? crypto.randomUUID() : "id" + Date.now() + Math.floor(Math.random() * 1e6);
  var _subMonthly = (s) => s.cycle === "yearly" ? (Number(s.amount) || 0) / 12 : Number(s.amount) || 0;
  var _sameMonth = (iso) => {
    if (!iso) return false;
    const d = new Date(iso);
    const n = /* @__PURE__ */ new Date();
    return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth();
  };
  var _todayISO = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  var _finDate = (iso) => {
    if (!iso) return "\u2014";
    const d = new Date(iso);
    const M = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    return isNaN(d) ? "\u2014" : `${d.getDate()} ${M[d.getMonth()]} ${d.getFullYear()}`;
  };
  var FIN_CYCLES = [{ id: "monthly", label: "Mensual" }, { id: "yearly", label: "Anual" }];
  var FIN_SERIES = { rec: "#8277db", pun: "#199e70" };
  var _finSmooth = (pts) => {
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
  var FinTrendChart = ({ trend }) => {
    const [hov, setHov] = useState(null);
    const W = 600, H = 150, PX = 10, PY = 14;
    const maxV = Math.max(...trend.map((t) => t.rec), ...trend.map((t) => t.puntual), 1) * 1.15;
    const x = (i) => PX + i * (W - 2 * PX) / (trend.length - 1);
    const y = (v) => H - PY - v / maxV * (H - 2 * PY);
    const recPts = trend.map((t, i) => [x(i), y(t.rec)]);
    const punPts = trend.map((t, i) => [x(i), y(t.puntual)]);
    const baseY = H - PY;
    const areaOf = (pts) => {
      const c = _finSmooth(pts);
      return c ? `${c}L${pts[pts.length - 1][0]},${baseY}L${pts[0][0]},${baseY}Z` : "";
    };
    const onMove = (e) => {
      const r = e.currentTarget.getBoundingClientRect();
      const px = e.clientX - r.left, py = e.clientY - r.top;
      const relX = px / r.width * W;
      let best = 0, bd = Infinity;
      trend.forEach((t, i) => {
        const d = Math.abs(x(i) - relX);
        if (d < bd) {
          bd = d;
          best = i;
        }
      });
      setHov({ i: best, px, py });
    };
    return /* @__PURE__ */ React.createElement("div", { style: { position: "relative", flex: 1, minHeight: 0, display: "flex", flexDirection: "column" } }, /* @__PURE__ */ React.createElement(
      "svg",
      {
        width: "100%",
        height: "100%",
        viewBox: `0 0 ${W} ${H}`,
        preserveAspectRatio: "none",
        style: { flex: 1, minHeight: 0, display: "block", cursor: "crosshair" },
        onMouseMove: onMove,
        onMouseLeave: () => setHov(null)
      },
      /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("linearGradient", { id: "finGradRec", x1: "0", y1: "0", x2: "0", y2: "1" }, /* @__PURE__ */ React.createElement("stop", { offset: "5%", stopColor: FIN_SERIES.rec, stopOpacity: "0.3" }), /* @__PURE__ */ React.createElement("stop", { offset: "95%", stopColor: FIN_SERIES.rec, stopOpacity: "0" })), /* @__PURE__ */ React.createElement("linearGradient", { id: "finGradPun", x1: "0", y1: "0", x2: "0", y2: "1" }, /* @__PURE__ */ React.createElement("stop", { offset: "5%", stopColor: FIN_SERIES.pun, stopOpacity: "0.22" }), /* @__PURE__ */ React.createElement("stop", { offset: "95%", stopColor: FIN_SERIES.pun, stopOpacity: "0" }))),
      [0, 0.25, 0.5, 0.75, 1].map((f) => /* @__PURE__ */ React.createElement(
        "line",
        {
          key: f,
          x1: PX,
          x2: W - PX,
          y1: PY + f * (H - 2 * PY),
          y2: PY + f * (H - 2 * PY),
          stroke: "rgba(255,255,255,0.05)",
          strokeDasharray: "3 3",
          strokeWidth: "1",
          vectorEffect: "non-scaling-stroke"
        }
      )),
      hov !== null && /* @__PURE__ */ React.createElement(
        "line",
        {
          x1: x(hov.i),
          x2: x(hov.i),
          y1: PY - 4,
          y2: H - PY + 4,
          stroke: "rgba(255,255,255,0.18)",
          strokeWidth: "1",
          vectorEffect: "non-scaling-stroke"
        }
      ),
      /* @__PURE__ */ React.createElement("path", { d: areaOf(punPts), fill: "url(#finGradPun)", stroke: "none" }),
      /* @__PURE__ */ React.createElement("path", { d: areaOf(recPts), fill: "url(#finGradRec)", stroke: "none" }),
      /* @__PURE__ */ React.createElement(
        "path",
        {
          d: _finSmooth(punPts),
          fill: "none",
          stroke: FIN_SERIES.pun,
          strokeWidth: "2.5",
          strokeLinecap: "round",
          vectorEffect: "non-scaling-stroke"
        }
      ),
      /* @__PURE__ */ React.createElement(
        "path",
        {
          d: _finSmooth(recPts),
          fill: "none",
          stroke: FIN_SERIES.rec,
          strokeWidth: "3",
          strokeLinecap: "round",
          vectorEffect: "non-scaling-stroke"
        }
      ),
      (hov !== null ? [hov.i] : [trend.length - 1]).map((i) => /* @__PURE__ */ React.createElement("g", { key: i }, /* @__PURE__ */ React.createElement("circle", { cx: x(i), cy: y(trend[i].rec), r: "3.5", fill: FIN_SERIES.rec, stroke: "var(--bg-elev)", strokeWidth: "2" }), /* @__PURE__ */ React.createElement("circle", { cx: x(i), cy: y(trend[i].puntual), r: "3.5", fill: FIN_SERIES.pun, stroke: "var(--bg-elev)", strokeWidth: "2" })))
    ), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", padding: "6px 2px 0", flexShrink: 0 } }, trend.map((t, i) => /* @__PURE__ */ React.createElement("span", { key: t.key, style: { fontSize: 10, color: hov && hov.i === i ? "var(--text)" : "var(--text-subtle)", letterSpacing: "0.04em", transition: "color .1s" } }, t.label))), hov !== null && /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      left: hov.px + 16,
      top: hov.py,
      background: "#1c1c1f",
      border: "0.5px solid rgba(255,255,255,0.12)",
      borderRadius: 10,
      padding: "8px 11px",
      pointerEvents: "none",
      zIndex: 5,
      boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
      whiteSpace: "nowrap"
    } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10.5, color: "var(--text-subtle)", marginBottom: 5, letterSpacing: "0.04em", textTransform: "uppercase" } }, trend[hov.i].full), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: 12, marginBottom: 3 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 7, height: 7, borderRadius: 99, background: FIN_SERIES.rec, flexShrink: 0 } }), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-muted)" } }, "Recurrente"), /* @__PURE__ */ React.createElement("span", { style: { fontVariantNumeric: "tabular-nums", marginLeft: "auto", paddingLeft: 10 } }, _eur(trend[hov.i].rec))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: 12 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 7, height: 7, borderRadius: 99, background: FIN_SERIES.pun, flexShrink: 0 } }), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-muted)" } }, "Puntual"), /* @__PURE__ */ React.createElement("span", { style: { fontVariantNumeric: "tabular-nums", marginLeft: "auto", paddingLeft: 10 } }, _eur(trend[hov.i].puntual)))));
  };
  var AgencyBilling = () => {
    const toast = useToast();
    const [data, setData] = useState(_finLoad);
    const [tab, setTab] = useState("subs");
    const [addOpen, setAddOpen] = useState(false);
    const [finType, setFinType] = useState("sub");
    const blankSub = { name: "", amount: "", cycle: "monthly", category: "Software", nextRenewal: "" };
    const blankExp = { date: _todayISO(), concept: "", amount: "", category: "Software" };
    const [subForm, setSubForm] = useState(blankSub);
    const [expForm, setExpForm] = useState(blankExp);
    const persist = (next) => {
      setData(next);
      _finSave(next);
    };
    useEffect(() => {
      const onSync = () => setData(_finLoad());
      window.addEventListener("141-userdata-synced", onSync);
      return () => window.removeEventListener("141-userdata-synced", onSync);
    }, []);
    const saveSub = () => {
      if (!subForm.name.trim() || !(Number(subForm.amount) > 0)) {
        toast("Pon nombre e importe", "error");
        return;
      }
      const sub = { id: _finId(), name: subForm.name.trim(), amount: Number(subForm.amount), cycle: subForm.cycle, category: subForm.category, nextRenewal: subForm.nextRenewal, active: true };
      persist({ ...data, subs: [sub, ...data.subs] });
      setSubForm(blankSub);
      setAddOpen(false);
      setTab("subs");
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
      setAddOpen(false);
      setTab("expenses");
      toast("Gasto a\xF1adido", "success");
    };
    const delExp = (id) => persist({ ...data, expenses: data.expenses.filter((e) => e.id !== id) });
    const activeSubs = data.subs.filter((s) => s.active);
    const recurringMo = activeSubs.reduce((a, s) => a + _subMonthly(s), 0);
    const expMonth = data.expenses.filter((e) => _sameMonth(e.date)).reduce((a, e) => a + (Number(e.amount) || 0), 0);
    const totalMonth = recurringMo + expMonth;
    const MES_ES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const trend = (() => {
      const now = /* @__PURE__ */ new Date();
      const nowKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const subStartKey = (s) => {
        if (!s.nextRenewal) return nowKey;
        const k = s.nextRenewal.slice(0, 7);
        return k < nowKey ? k : nowKey;
      };
      return Array.from({ length: 6 }, (_, k) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - k), 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const puntual = data.expenses.filter((e) => (e.date || "").startsWith(key)).reduce((a, e) => a + (Number(e.amount) || 0), 0);
        const rec = activeSubs.filter((s) => subStartKey(s) <= key).reduce((a, s) => a + _subMonthly(s), 0);
        return { key, label: MES_ES[d.getMonth()], full: `${MES_ES[d.getMonth()]} ${d.getFullYear()}`, puntual, rec, total: puntual + rec };
      });
    })();
    const deltaPct = trend[4].total > 0 ? Math.round((trend[5].total - trend[4].total) / trend[4].total * 100) : null;
    const byCat = {};
    activeSubs.forEach((s) => {
      byCat[s.category] = (byCat[s.category] || 0) + _subMonthly(s);
    });
    data.expenses.filter((e) => _sameMonth(e.date)).forEach((e) => {
      byCat[e.category] = (byCat[e.category] || 0) + (Number(e.amount) || 0);
    });
    const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const catMax = cats.length ? cats[0][1] : 1;
    return /* @__PURE__ */ React.createElement("div", { style: {
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      padding: "28px 32px 0",
      maxWidth: 1400,
      margin: "0 auto",
      overflow: "hidden"
    } }, /* @__PURE__ */ React.createElement("div", { className: "page-head", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", null, "Gastos"), /* @__PURE__ */ React.createElement("div", { className: "sub" }, _eur(totalMonth), " este mes \xB7 ", activeSubs.length, " suscripci", activeSubs.length === 1 ? "\xF3n" : "ones", " activa", activeSubs.length === 1 ? "" : "s")), /* @__PURE__ */ React.createElement(
      ActionPill,
      {
        plusActions: () => {
          setFinType(tab === "expenses" ? "exp" : "sub");
          setAddOpen(true);
        }
      }
    )), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1.8fr 1fr 0.72fr", gap: 14, marginBottom: 20, flexShrink: 0, height: 248 } }, /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "16px 18px 14px", display: "flex", flexDirection: "column", overflow: "visible", position: "relative", zIndex: 2 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, fontWeight: 600, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 } }, "Gasto mensual"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 26, fontWeight: 400, letterSpacing: "-1.1px", fontVariantNumeric: "tabular-nums", lineHeight: 1 } }, _eur(totalMonth)), /* @__PURE__ */ React.createElement(TrendDelta, { pct: deltaPct, goodUp: false, suffix: `vs ${trend[4].label.toLowerCase()}` }))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 14, paddingTop: 2 } }, [["Recurrente", FIN_SERIES.rec], ["Puntual", FIN_SERIES.pun]].map(([lbl, col]) => /* @__PURE__ */ React.createElement("span", { key: lbl, style: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--text-muted)" } }, /* @__PURE__ */ React.createElement("span", { style: { width: 7, height: 7, borderRadius: 99, background: col } }), lbl)))), /* @__PURE__ */ React.createElement(FinTrendChart, { trend })), /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "16px 18px", display: "flex", flexDirection: "column" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, fontWeight: 600, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14, flexShrink: 0 } }, "Por categor\xEDa \xB7 este mes"), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column", gap: 13 } }, cats.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { color: "var(--text-subtle)", fontSize: 13, letterSpacing: "-0.3px" } }, "Sin datos todav\xEDa.") : cats.map(([cat, amt]) => /* @__PURE__ */ React.createElement("div", { key: cat }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 } }, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-muted)", letterSpacing: "-0.2px" } }, cat), /* @__PURE__ */ React.createElement("span", { style: { fontVariantNumeric: "tabular-nums", color: "var(--text)" } }, _eur(amt))), /* @__PURE__ */ React.createElement("div", { style: { height: 4, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { height: "100%", width: `${Math.max(3, amt / catMax * 100)}%`, background: FIN_SERIES.rec, borderRadius: 99, transition: "width .3s" } })))))), /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "16px 18px", display: "flex", flexDirection: "column", justifyContent: "space-between" } }, [
      { label: "Recurrente", value: _eur(recurringMo), sub: "al mes" },
      { label: "Puntual", value: _eur(expMonth), sub: "este mes" },
      { label: "Anual estimado", value: _eur(recurringMo * 12), sub: "solo suscripciones" }
    ].map((m, i) => /* @__PURE__ */ React.createElement("div", { key: m.label, style: {
      paddingTop: i === 0 ? 0 : 12,
      borderTop: i === 0 ? "none" : "0.5px solid var(--border)"
    } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10.5, fontWeight: 600, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 } }, m.label), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: 400, letterSpacing: "-0.7px", fontVariantNumeric: "tabular-nums", lineHeight: 1 } }, m.value), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10.5, color: "var(--text-subtle)", marginTop: 3, letterSpacing: "-0.2px" } }, m.sub))))), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 6, flexShrink: 0 } }, /* @__PURE__ */ React.createElement("div", { className: "seg" }, /* @__PURE__ */ React.createElement("button", { className: tab === "subs" ? "active" : "", onClick: () => setTab("subs") }, "Suscripciones"), /* @__PURE__ */ React.createElement("button", { className: tab === "expenses" ? "active" : "", onClick: () => setTab("expenses") }, "Gastos puntuales"))), /* @__PURE__ */ React.createElement("div", { className: "tasks-scroll", style: {
      flex: 1,
      minHeight: 0,
      overflowY: "auto",
      scrollbarGutter: "stable",
      paddingRight: 10,
      paddingTop: 16,
      paddingBottom: 8,
      WebkitMaskImage: "linear-gradient(to bottom, transparent 0, #000 16px, #000 calc(100% - 24px), transparent 100%)",
      maskImage: "linear-gradient(to bottom, transparent 0, #000 16px, #000 calc(100% - 24px), transparent 100%)"
    } }, tab === "subs" && /* @__PURE__ */ React.createElement(React.Fragment, null, data.subs.length === 0 && !addOpen ? /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", padding: "60px 0", color: "var(--text-subtle)", fontSize: 14, letterSpacing: "-0.5px" } }, "Sin suscripciones \u2014 ", /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: () => {
      setFinType("sub");
      setAddOpen(true);
    } }, "a\xF1adir una")) : data.subs.map((s, i) => /* @__PURE__ */ React.createElement("div", { key: s.id, className: "task-row", style: {
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "13px 4px",
      opacity: s.active ? 1 : 0.45,
      borderBottom: i === data.subs.length - 1 ? "none" : "0.5px solid var(--border)",
      transition: "opacity .15s"
    } }, /* @__PURE__ */ React.createElement("div", { style: {
      width: 38,
      height: 38,
      borderRadius: "50%",
      flexShrink: 0,
      border: "1px solid rgba(255,255,255,0.1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: s.active ? "var(--accent)" : "var(--text-subtle)"
    } }, /* @__PURE__ */ React.createElement(Icon, { name: "refresh-cw", size: 14, strokeWidth: 1.7 })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, letterSpacing: "-0.5px", color: "var(--text)" } }, s.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-subtle)", marginTop: 2, letterSpacing: "-0.2px" } }, s.category, " \xB7 ", s.cycle === "yearly" ? "Anual" : "Mensual", s.nextRenewal ? ` \xB7 Renueva ${_finDate(s.nextRenewal)}` : "")), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right", flexShrink: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.4px" } }, _eur(s.amount), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-subtle)", fontSize: 11.5 } }, "/", s.cycle === "yearly" ? "a\xF1o" : "mes")), s.cycle === "yearly" && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10.5, color: "var(--text-subtle)", marginTop: 1 } }, _eur(_subMonthly(s)), "/mes")), /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: () => toggleSub(s.id), style: { color: s.active ? "var(--green)" : "var(--text-subtle)", flexShrink: 0 } }, s.active ? "Activa" : "Pausada"), /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only sm", onClick: () => delSub(s.id), title: "Eliminar", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement(Icon, { name: "trash", size: 13 }))))), tab === "expenses" && /* @__PURE__ */ React.createElement(React.Fragment, null, data.expenses.length === 0 && !addOpen ? /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", padding: "60px 0", color: "var(--text-subtle)", fontSize: 14, letterSpacing: "-0.5px" } }, "Sin gastos puntuales \u2014 ", /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: () => {
      setFinType("exp");
      setAddOpen(true);
    } }, "a\xF1adir uno")) : [...data.expenses].sort((a, b) => (b.date || "").localeCompare(a.date || "")).map((e, i, arr) => /* @__PURE__ */ React.createElement("div", { key: e.id, className: "task-row", style: {
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "13px 4px",
      borderBottom: i === arr.length - 1 ? "none" : "0.5px solid var(--border)"
    } }, /* @__PURE__ */ React.createElement("div", { style: {
      width: 38,
      height: 38,
      borderRadius: "50%",
      flexShrink: 0,
      border: "1px solid rgba(255,255,255,0.1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--text-muted)"
    } }, /* @__PURE__ */ React.createElement(Icon, { name: "receipt", size: 14, strokeWidth: 1.7 })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, letterSpacing: "-0.5px", color: "var(--text)" } }, e.concept), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-subtle)", marginTop: 2, letterSpacing: "-0.2px" } }, _finDate(e.date), " \xB7 ", e.category)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.4px", flexShrink: 0 } }, _eur(e.amount)), /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only sm", onClick: () => delExp(e.id), title: "Eliminar", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement(Icon, { name: "trash", size: 13 })))))), /* @__PURE__ */ React.createElement(
      QuickModal,
      {
        open: addOpen,
        onClose: () => {
          setAddOpen(false);
          setSubForm(blankSub);
          setExpForm(blankExp);
        },
        onSubmit: () => finType === "sub" ? saveSub() : saveExp(),
        canSubmit: finType === "sub" ? !!subForm.name.trim() && Number(subForm.amount) > 0 : !!expForm.concept.trim() && Number(expForm.amount) > 0,
        types: [
          { id: "sub", label: "Suscripci\xF3n", icon: "refresh-cw" },
          { id: "exp", label: "Gasto", icon: "receipt" }
        ],
        type: finType,
        onTypeChange: setFinType,
        titlePlaceholder: finType === "sub" ? "Nombre de la suscripci\xF3n..." : "Concepto del gasto...",
        titleValue: finType === "sub" ? subForm.name : expForm.concept,
        onTitleChange: (v) => finType === "sub" ? setSubForm({ ...subForm, name: v }) : setExpForm({ ...expForm, concept: v }),
        tabs: finType === "sub" ? [
          { id: "amount", label: "Importe", icon: "receipt", hasVal: Number(subForm.amount) > 0, badge: Number(subForm.amount) > 0 ? _eur(subForm.amount) : null },
          { id: "cycle", label: "Ciclo", icon: "refresh-cw", hasVal: true, badge: subForm.cycle === "yearly" ? "Anual" : "Mensual" },
          { id: "cat", label: "Categor\xEDa", icon: "tag", hasVal: true, badge: subForm.category },
          { id: "renewal", label: "Renovaci\xF3n", icon: "calendar", hasVal: !!subForm.nextRenewal, badge: subForm.nextRenewal ? _finDate(subForm.nextRenewal) : null }
        ] : [
          { id: "amount", label: "Importe", icon: "receipt", hasVal: Number(expForm.amount) > 0, badge: Number(expForm.amount) > 0 ? _eur(expForm.amount) : null },
          { id: "date", label: "Fecha", icon: "calendar", hasVal: !!expForm.date, badge: expForm.date ? _finDate(expForm.date) : null },
          { id: "cat", label: "Categor\xEDa", icon: "tag", hasVal: true, badge: expForm.category }
        ],
        renderTab: (id) => {
          if (id === "amount") return /* @__PURE__ */ React.createElement(
            "input",
            {
              style: { ...QUICK_FIELD, width: 180, textAlign: "center", fontSize: 22, fontWeight: 300, letterSpacing: "-1px", fontFamily: "var(--font-display)" },
              type: "number",
              step: "0.01",
              min: "0",
              placeholder: "0,00 \u20AC",
              autoFocus: true,
              value: finType === "sub" ? subForm.amount : expForm.amount,
              onChange: (e) => finType === "sub" ? setSubForm({ ...subForm, amount: e.target.value }) : setExpForm({ ...expForm, amount: e.target.value })
            }
          );
          if (id === "cycle") return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, justifyContent: "center" } }, FIN_CYCLES.map((c) => /* @__PURE__ */ React.createElement(QuickPill, { key: c.id, selected: subForm.cycle === c.id, onClick: () => setSubForm({ ...subForm, cycle: c.id }) }, c.label)));
          if (id === "cat") return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" } }, FIN_CATS.map((c) => /* @__PURE__ */ React.createElement(
            QuickPill,
            {
              key: c,
              selected: (finType === "sub" ? subForm.category : expForm.category) === c,
              onClick: () => finType === "sub" ? setSubForm({ ...subForm, category: c }) : setExpForm({ ...expForm, category: c })
            },
            c
          )));
          if (id === "renewal") return /* @__PURE__ */ React.createElement(
            "input",
            {
              style: { ...QUICK_FIELD },
              type: "date",
              value: subForm.nextRenewal,
              onChange: (e) => setSubForm({ ...subForm, nextRenewal: e.target.value })
            }
          );
          if (id === "date") return /* @__PURE__ */ React.createElement(
            "input",
            {
              style: { ...QUICK_FIELD },
              type: "date",
              value: expForm.date,
              onChange: (e) => setExpForm({ ...expForm, date: e.target.value })
            }
          );
          return null;
        }
      }
    ));
  };
  var SimplePage = ({ title, sub, icon }) => /* @__PURE__ */ React.createElement("div", { className: "page" }, /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", null, title), sub && /* @__PURE__ */ React.createElement("div", { className: "sub" }, sub))), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body", style: { padding: 60 } }, /* @__PURE__ */ React.createElement(Empty, { icon, title: "Pr\xF3ximamente", sub: "Esta secci\xF3n est\xE1 en construcci\xF3n" }))));
  var SESSION_OPTS = [
    { days: 0, label: "Solo esta sesi\xF3n", sub: "Se cerrar\xE1 al cerrar el navegador" },
    { days: 1, label: "1 d\xEDa", sub: "Hasta ma\xF1ana a esta hora" },
    { days: 7, label: "7 d\xEDas", sub: "Una semana sin volver a entrar" },
    { days: 30, label: "30 d\xEDas", sub: "Comodidad m\xE1xima" }
  ];
  var SessionCard = () => {
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
  var SettingsPage = () => {
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
  var TaskProgressModal = ({ task, projectId, open, onClose, onDelete, onUpdate }) => {
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
  var INC_KEY = "141_income_v1";
  var _incLoad = () => {
    try {
      const d = JSON.parse(localStorage.getItem(INC_KEY));
      return d && typeof d === "object" ? { recs: d.recs || [], incomes: d.incomes || [] } : { recs: [], incomes: [] };
    } catch (e) {
      return { recs: [], incomes: [] };
    }
  };
  var _incSave = (d) => {
    try {
      localStorage.setItem(INC_KEY, JSON.stringify(d));
    } catch (e) {
    }
  };
  var FinKpi = ({ label, value, sub, color, delta }) => /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-subtle)", marginBottom: 6 } }, label), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement("span", { style: {
    fontSize: 22,
    fontWeight: 600,
    fontFamily: "var(--font-display)",
    letterSpacing: "-0.5px",
    color: color || "var(--text)",
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap"
  } }, value), delta), sub && /* @__PURE__ */ React.createElement("div", { style: {
    fontSize: 11.5,
    color: "var(--text-muted)",
    marginTop: 3,
    letterSpacing: "-0.2px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  } }, sub));
  var IncomePage = () => {
    const D = window.Data;
    D.useStore();
    const toast = useToast();
    const [data, setData] = useState(_incLoad);
    const [addOpen, setAddOpen] = useState(false);
    const [incType, setIncType] = useState("rec");
    const blankRec = { concept: "", amount: "", cycle: "monthly", clientId: "", nextCharge: "", vat: 21, irpf: 15 };
    const blankInc = { date: _todayISO(), concept: "", amount: "", clientId: "", vat: 21, irpf: 15 };
    const [recForm, setRecForm] = useState(blankRec);
    const [incForm, setIncForm] = useState(blankInc);
    const [stripeInc, setStripeInc] = useState(null);
    const [stripeMeta, setStripeMeta] = useState(null);
    const [stripeInvOpen, setStripeInvOpen] = useState(false);
    const [payLinkOpen, setPayLinkOpen] = useState(false);
    const fetchStripe = () => {
      window.apiFetch("/api/stripe/invoices", { limit: 100 }).then((r) => r.json()).then((res) => {
        if (!res.ok) return;
        const paid = (res.invoices || []).filter((inv) => inv.status === "paid" && (inv.amount_paid || 0) > 0).map((inv) => ({
          id: "stripe-" + (inv.stripe_id || inv.id),
          date: inv.created ? new Date(inv.created * 1e3).toISOString().slice(0, 10) : _todayISO(),
          concept: inv.description || `Factura ${inv.id}`,
          clientName: inv.customer && inv.customer !== "\u2014" ? inv.customer : "",
          // El importe de Stripe ya es el total cobrado → base=total, sin IVA/IRPF añadidos
          amount: (inv.amount_paid || 0) / 100,
          vat: 0,
          irpf: 0,
          source: "stripe",
          hostedUrl: inv.hosted_url || null
        }));
        setStripeInc(paid);
        const open = (res.invoices || []).filter((inv) => inv.status === "open").map((inv) => ({
          id: "open-" + (inv.stripe_id || inv.id),
          concept: inv.description || `Factura ${inv.id}`,
          clientName: inv.customer && inv.customer !== "\u2014" ? inv.customer : "",
          amount: (inv.amount || 0) / 100,
          date: inv.created ? new Date(inv.created * 1e3).toISOString().slice(0, 10) : "",
          due: inv.due_date ? new Date(inv.due_date * 1e3).toISOString().slice(0, 10) : "",
          hostedUrl: inv.hosted_url || null
        }));
        setStripeMeta((m) => ({ ...m || {}, open, openSum: open.reduce((a, i) => a + i.amount, 0) }));
      }).catch(() => {
      });
      window.apiFetch("/api/stripe/balance", {}).then((r) => r.json()).then((res) => {
        if (res.ok) setStripeMeta((m) => ({ ...m || {}, available: res.available / 100, pending: res.pending / 100 }));
      }).catch(() => {
      });
    };
    useEffect(() => {
      fetchStripe();
    }, []);
    const stripeConnected = stripeInc !== null;
    const stripeOpen = stripeMeta && stripeMeta.open || [];
    const allIncomes = stripeInc ? [...data.incomes, ...stripeInc] : data.incomes;
    const persist = (next) => {
      setData(next);
      _incSave(next);
    };
    const clientName = (id) => {
      const c = D.CLIENTS.find((c2) => c2.id === id);
      return c ? c.company || c.name || "" : "";
    };
    const _vatOf = (x) => x.vat === void 0 || x.vat === null ? 21 : Number(x.vat);
    const _irpfOf = (x) => x.irpf === void 0 || x.irpf === null ? 0 : Number(x.irpf);
    const _withVat = (x) => (Number(x.amount) || 0) * (1 + _vatOf(x) / 100);
    const _cobro = (x) => (Number(x.amount) || 0) * (1 + _vatOf(x) / 100 - _irpfOf(x) / 100);
    const _recMoVat = (r) => r.cycle === "yearly" ? _withVat(r) / 12 : _withVat(r);
    const _recMoCobro = (r) => r.cycle === "yearly" ? _cobro(r) / 12 : _cobro(r);
    const _recMoBase = (r) => _subMonthly(r);
    const _fiscalSub = (x) => `Base ${_eur(x.amount)}${_vatOf(x) ? ` + IVA ${_vatOf(x)}%` : ""}${_irpfOf(x) ? ` \u2212 IRPF ${_irpfOf(x)}%` : ""}`;
    const saveRec = () => {
      if (!recForm.concept.trim() || !(Number(recForm.amount) > 0)) {
        toast("Pon concepto e importe", "error");
        return;
      }
      const rec = {
        id: _finId(),
        concept: recForm.concept.trim(),
        amount: Number(recForm.amount),
        cycle: recForm.cycle,
        clientId: recForm.clientId || "",
        clientName: clientName(recForm.clientId),
        nextCharge: recForm.nextCharge,
        vat: Number(recForm.vat) || 0,
        irpf: Number(recForm.irpf) || 0,
        active: true
      };
      persist({ ...data, recs: [rec, ...data.recs] });
      setRecForm(blankRec);
      setAddOpen(false);
      toast("Mensualidad a\xF1adida", "success");
    };
    const toggleRec = (id) => persist({ ...data, recs: data.recs.map((r) => r.id === id ? { ...r, active: !r.active } : r) });
    const delRec = (id) => persist({ ...data, recs: data.recs.filter((r) => r.id !== id) });
    const saveInc = () => {
      if (!incForm.concept.trim() || !(Number(incForm.amount) > 0)) {
        toast("Pon concepto e importe", "error");
        return;
      }
      const inc = {
        id: _finId(),
        date: incForm.date || _todayISO(),
        concept: incForm.concept.trim(),
        amount: Number(incForm.amount),
        clientId: incForm.clientId || "",
        clientName: clientName(incForm.clientId),
        vat: Number(incForm.vat) || 0,
        irpf: Number(incForm.irpf) || 0
      };
      persist({ ...data, incomes: [inc, ...data.incomes] });
      setIncForm(blankInc);
      setAddOpen(false);
      toast("Ingreso a\xF1adido", "success");
    };
    const delInc = (id) => persist({ ...data, incomes: data.incomes.filter((i) => i.id !== id) });
    const activeRecs = data.recs.filter((r) => r.active);
    const recurringMo = activeRecs.reduce((a, r) => a + _recMoVat(r), 0);
    const punMonth = allIncomes.filter((i) => _sameMonth(i.date)).reduce((a, i) => a + _withVat(i), 0);
    const monthTotal = recurringMo + punMonth;
    const baseMonth = activeRecs.reduce((a, r) => a + _recMoBase(r), 0) + allIncomes.filter((i) => _sameMonth(i.date)).reduce((a, i) => a + (Number(i.amount) || 0), 0);
    const ivaMonth = monthTotal - baseMonth;
    const irpfMonth = activeRecs.reduce((a, r) => a + _recMoBase(r) * _irpfOf(r) / 100, 0) + allIncomes.filter((i) => _sameMonth(i.date)).reduce((a, i) => a + (Number(i.amount) || 0) * _irpfOf(i) / 100, 0);
    const MES_ES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const trend = (() => {
      const now = /* @__PURE__ */ new Date();
      const nowKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const recStartKey = (r) => {
        if (!r.nextCharge) return nowKey;
        const k = r.nextCharge.slice(0, 7);
        return k < nowKey ? k : nowKey;
      };
      return Array.from({ length: 6 }, (_, k) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - k), 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const puntual = allIncomes.filter((i) => (i.date || "").startsWith(key)).reduce((a, i) => a + _withVat(i), 0);
        const rec = activeRecs.filter((r) => recStartKey(r) <= key).reduce((a, r) => a + _recMoVat(r), 0);
        return { key, label: MES_ES[d.getMonth()], full: `${MES_ES[d.getMonth()]} ${d.getFullYear()}`, puntual, rec, total: puntual + rec };
      });
    })();
    const deltaPct = trend[4].total > 0 ? Math.round((trend[5].total - trend[4].total) / trend[4].total * 100) : null;
    const byClient = {};
    activeRecs.forEach((r) => {
      const k = r.clientName || "Sin cliente";
      byClient[k] = (byClient[k] || 0) + _recMoVat(r);
    });
    allIncomes.filter((i) => _sameMonth(i.date)).forEach((i) => {
      const k = i.clientName || "Sin cliente";
      byClient[k] = (byClient[k] || 0) + _withVat(i);
    });
    const clients = Object.entries(byClient).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const cliMax = clients.length ? clients[0][1] : 1;
    const sortedInc = [...allIncomes].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    const stripeMonthSum = allIncomes.filter((i) => _sameMonth(i.date) && i.source === "stripe").reduce((a, i) => a + _withVat(i), 0);
    const manualPunSum = allIncomes.filter((i) => _sameMonth(i.date) && i.source !== "stripe").reduce((a, i) => a + _withVat(i), 0);
    const cardStyle = { background: "var(--bg-elev-1)", border: "0.5px solid var(--border)", borderRadius: 16, padding: "18px 20px" };
    const cardTitle = { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-subtle)", marginBottom: 14 };
    const sectionHead = {
      fontSize: 11,
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      color: "var(--text-subtle)",
      display: "flex",
      alignItems: "center",
      gap: 8,
      margin: "28px 4px 6px"
    };
    return /* @__PURE__ */ React.createElement("div", { style: {
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      padding: "28px 32px 0",
      maxWidth: 1400,
      margin: "0 auto",
      overflow: "hidden"
    } }, /* @__PURE__ */ React.createElement("div", { style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("div", { className: "page-head", style: { marginBottom: 22 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", null, "Facturaci\xF3n"), /* @__PURE__ */ React.createElement("div", { className: "sub", style: { display: "flex", alignItems: "center", gap: 7 } }, /* @__PURE__ */ React.createElement("span", { style: {
      width: 6,
      height: 6,
      borderRadius: 99,
      flexShrink: 0,
      background: stripeConnected ? "var(--green)" : "var(--text-subtle)",
      display: "inline-block"
    } }), "Stripe ", stripeConnected ? "conectado" : "sin conectar", ` \xB7 ${activeRecs.length} mensualidad${activeRecs.length === 1 ? "" : "es"} activa${activeRecs.length === 1 ? "" : "s"}`, stripeOpen.length ? ` \xB7 ${stripeOpen.length} factura${stripeOpen.length === 1 ? "" : "s"} sin cobrar` : "")), /* @__PURE__ */ React.createElement(ActionPill, { plusActions: [
      {
        icon: "receipt",
        label: "Factura Stripe",
        sub: "Se crea y env\xEDa desde Stripe.",
        accent: true,
        onClick: () => setStripeInvOpen(true)
      },
      {
        icon: "external-link",
        label: "Enlace de pago",
        sub: "Link de cobro de Stripe para compartir.",
        onClick: () => setPayLinkOpen(true)
      },
      {
        icon: "edit",
        label: "Ingreso manual",
        sub: "Mensualidad o cobro apuntado a mano.",
        onClick: () => {
          setIncType("pun");
          setAddOpen(true);
        }
      }
    ] })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 26, padding: "18px 2px", borderTop: "0.5px solid var(--border)", borderBottom: "0.5px solid var(--border)" } }, /* @__PURE__ */ React.createElement(
      FinKpi,
      {
        label: "Facturado este mes",
        value: _eur(monthTotal),
        delta: /* @__PURE__ */ React.createElement(TrendDelta, { pct: deltaPct, goodUp: true, size: 13 }),
        sub: `${_eur(baseMonth)} de base imponible`
      }
    ), /* @__PURE__ */ React.createElement(FinKpi, { label: "Cobras", value: _eur(monthTotal - irpfMonth), sub: "te entra este mes, tras IRPF" }), /* @__PURE__ */ React.createElement(
      FinKpi,
      {
        label: "Saldo Stripe",
        color: "var(--accent)",
        value: stripeMeta && stripeMeta.available !== void 0 ? _eur(stripeMeta.available) : "\u2014",
        sub: stripeMeta && stripeMeta.available !== void 0 ? `${_eur(stripeMeta.pending || 0)} pendiente de abono` : "conecta Stripe para verlo"
      }
    ), /* @__PURE__ */ React.createElement(
      FinKpi,
      {
        label: "Pendiente de cobro",
        color: stripeOpen.length ? "var(--amber)" : void 0,
        value: stripeConnected ? _eur(stripeMeta && stripeMeta.openSum || 0) : "\u2014",
        sub: stripeOpen.length ? `${stripeOpen.length} factura${stripeOpen.length === 1 ? "" : "s"} abierta${stripeOpen.length === 1 ? "" : "s"}` : "sin facturas abiertas"
      }
    ), /* @__PURE__ */ React.createElement(FinKpi, { label: "IVA a apartar", value: _eur(ivaMonth), sub: "repercutido este mes" }))), /* @__PURE__ */ React.createElement("div", { className: "tasks-scroll", style: {
      flex: 1,
      minHeight: 0,
      overflowY: "auto",
      scrollbarGutter: "stable",
      paddingRight: 10,
      paddingTop: 16,
      paddingBottom: 8,
      WebkitMaskImage: "linear-gradient(to bottom, transparent 0, #000 16px, #000 calc(100% - 24px), transparent 100%)",
      maskImage: "linear-gradient(to bottom, transparent 0, #000 16px, #000 calc(100% - 24px), transparent 100%)"
    } }, /* @__PURE__ */ React.createElement("div", { style: { ...cardStyle, padding: "16px 18px 12px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { ...cardTitle, marginBottom: 8 } }, "Facturaci\xF3n mensual \xB7 \xFAltimos 6 meses"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 26, fontWeight: 400, letterSpacing: "-1.1px", fontVariantNumeric: "tabular-nums", lineHeight: 1 } }, _eur(monthTotal)), /* @__PURE__ */ React.createElement(TrendDelta, { pct: deltaPct, goodUp: true, suffix: `vs ${trend[4].label.toLowerCase()}` }))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 14, paddingTop: 2 } }, [["Recurrente", FIN_SERIES.rec], ["Puntual", FIN_SERIES.pun]].map(([lbl, col]) => /* @__PURE__ */ React.createElement("span", { key: lbl, style: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--text-muted)" } }, /* @__PURE__ */ React.createElement("span", { style: { width: 7, height: 7, borderRadius: 99, background: col } }), lbl)))), /* @__PURE__ */ React.createElement("div", { style: { height: 140, display: "flex", flexDirection: "column" } }, /* @__PURE__ */ React.createElement(FinTrendChart, { trend }))), /* @__PURE__ */ React.createElement("div", { style: sectionHead }, "Mensualidades", /* @__PURE__ */ React.createElement("span", { style: { opacity: 0.55, fontWeight: 400 } }, "\xB7 ", data.recs.length)), data.recs.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { padding: "14px 4px", color: "var(--text-subtle)", fontSize: 13, letterSpacing: "-0.3px" } }, "Sin mensualidades \u2014 ", /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: () => {
      setIncType("rec");
      setAddOpen(true);
    } }, "a\xF1adir una")) : data.recs.map((r, i) => /* @__PURE__ */ React.createElement("div", { key: r.id, className: "task-row", style: {
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "13px 4px",
      opacity: r.active ? 1 : 0.45,
      borderBottom: i === data.recs.length - 1 ? "none" : "0.5px solid var(--border)",
      transition: "opacity .15s"
    } }, /* @__PURE__ */ React.createElement("div", { style: {
      width: 38,
      height: 38,
      borderRadius: "50%",
      flexShrink: 0,
      border: "1px solid rgba(255,255,255,0.1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: r.active ? FIN_SERIES.rec : "var(--text-subtle)"
    } }, /* @__PURE__ */ React.createElement(Icon, { name: "refresh-cw", size: 14, strokeWidth: 1.7 })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, letterSpacing: "-0.5px", color: "var(--text)" } }, r.concept), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-subtle)", marginTop: 2, letterSpacing: "-0.2px" } }, r.clientName || "Sin cliente", " \xB7 ", r.cycle === "yearly" ? "Anual" : "Mensual", r.nextCharge ? ` \xB7 Cobro ${_finDate(r.nextCharge)}` : "")), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right", flexShrink: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.4px" } }, _eur(_cobro(r)), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-subtle)", fontSize: 11.5 } }, "/", r.cycle === "yearly" ? "a\xF1o" : "mes")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10.5, color: "var(--text-subtle)", marginTop: 1 } }, _fiscalSub(r))), /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: () => toggleRec(r.id), style: { color: r.active ? "var(--green)" : "var(--text-subtle)", flexShrink: 0 } }, r.active ? "Activa" : "Pausada"), /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only sm", onClick: () => delRec(r.id), title: "Eliminar", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement(Icon, { name: "trash", size: 13 })))), /* @__PURE__ */ React.createElement("div", { style: sectionHead }, "Cobros", /* @__PURE__ */ React.createElement("span", { style: { opacity: 0.55, fontWeight: 400 } }, "\xB7 ", stripeOpen.length + sortedInc.length)), stripeOpen.map((inv) => /* @__PURE__ */ React.createElement("div", { key: inv.id, className: "task-row", style: {
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "13px 4px",
      borderBottom: "0.5px solid var(--border)"
    } }, /* @__PURE__ */ React.createElement("div", { style: {
      width: 38,
      height: 38,
      borderRadius: "50%",
      flexShrink: 0,
      border: "1px solid rgba(238,229,134,0.35)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--amber)"
    } }, /* @__PURE__ */ React.createElement(Icon, { name: "clock", size: 14, strokeWidth: 1.7 })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, letterSpacing: "-0.5px", color: "var(--text)", display: "flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, inv.concept), /* @__PURE__ */ React.createElement("span", { style: {
      fontSize: 10,
      padding: "2px 8px",
      borderRadius: 99,
      flexShrink: 0,
      background: "var(--amber-soft)",
      border: "0.5px solid rgba(238,229,134,0.4)",
      color: "var(--amber)"
    } }, "Abierta")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-subtle)", marginTop: 2, letterSpacing: "-0.2px" } }, "Emitida ", _finDate(inv.date), inv.due ? ` \xB7 vence ${_finDate(inv.due)}` : "", inv.clientName ? ` \xB7 ${inv.clientName}` : "")), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right", flexShrink: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.4px", color: "var(--amber)" } }, _eur(inv.amount)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10.5, color: "var(--text-subtle)", marginTop: 1 } }, "pendiente de cobro")), inv.hostedUrl ? /* @__PURE__ */ React.createElement(
      "a",
      {
        className: "btn ghost icon-only sm",
        href: inv.hostedUrl,
        target: "_blank",
        rel: "noopener noreferrer",
        title: "Ver / cobrar en Stripe",
        style: { flexShrink: 0 }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "external-link", size: 13 })
    ) : /* @__PURE__ */ React.createElement("span", { style: { width: 28, flexShrink: 0 } }))), sortedInc.length === 0 && stripeOpen.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", padding: "60px 0", color: "var(--text-subtle)", fontSize: 14, letterSpacing: "-0.5px" } }, "Sin ingresos puntuales \u2014 ", /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: () => {
      setIncType("pun");
      setAddOpen(true);
    } }, "a\xF1adir uno")) : sortedInc.map((inc, i) => /* @__PURE__ */ React.createElement("div", { key: inc.id, className: "task-row", style: {
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "13px 4px",
      borderBottom: i === sortedInc.length - 1 ? "none" : "0.5px solid var(--border)"
    } }, /* @__PURE__ */ React.createElement("div", { style: {
      width: 38,
      height: 38,
      borderRadius: "50%",
      flexShrink: 0,
      border: "1px solid rgba(255,255,255,0.1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: FIN_SERIES.pun
    } }, /* @__PURE__ */ React.createElement(Icon, { name: "trending-up", size: 14, strokeWidth: 1.7 })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, letterSpacing: "-0.5px", color: "var(--text)", display: "flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, inc.concept), inc.source === "stripe" && /* @__PURE__ */ React.createElement("span", { style: {
      fontSize: 10,
      padding: "2px 8px",
      borderRadius: 99,
      flexShrink: 0,
      background: "rgba(99,91,255,0.14)",
      border: "0.5px solid rgba(99,91,255,0.4)",
      color: "#9d97ff"
    } }, "Stripe")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-subtle)", marginTop: 2, letterSpacing: "-0.2px" } }, _finDate(inc.date), inc.clientName ? ` \xB7 ${inc.clientName}` : "")), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right", flexShrink: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.4px" } }, "+", _eur(_cobro(inc))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10.5, color: "var(--text-subtle)", marginTop: 1 } }, inc.source === "stripe" ? "Cobrado en Stripe" : _fiscalSub(inc))), inc.source === "stripe" ? inc.hostedUrl ? /* @__PURE__ */ React.createElement(
      "a",
      {
        className: "btn ghost icon-only sm",
        href: inc.hostedUrl,
        target: "_blank",
        rel: "noopener noreferrer",
        title: "Ver factura en Stripe",
        style: { flexShrink: 0 }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "external-link", size: 13 })
    ) : /* @__PURE__ */ React.createElement("span", { style: { width: 28, flexShrink: 0 } }) : /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only sm", onClick: () => delInc(inc.id), title: "Eliminar", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement(Icon, { name: "trash", size: 13 }))))), /* @__PURE__ */ React.createElement(
      QuickModal,
      {
        open: addOpen,
        onClose: () => {
          setAddOpen(false);
          setRecForm(blankRec);
          setIncForm(blankInc);
        },
        onSubmit: () => incType === "rec" ? saveRec() : saveInc(),
        canSubmit: incType === "rec" ? !!recForm.concept.trim() && Number(recForm.amount) > 0 : !!incForm.concept.trim() && Number(incForm.amount) > 0,
        types: [
          { id: "rec", label: "Mensualidad", icon: "refresh-cw" },
          { id: "pun", label: "Puntual", icon: "trending-up" }
        ],
        type: incType,
        onTypeChange: setIncType,
        titlePlaceholder: incType === "rec" ? "Concepto (ej. Fee mensual)..." : "Concepto del ingreso...",
        titleValue: incType === "rec" ? recForm.concept : incForm.concept,
        onTitleChange: (v) => incType === "rec" ? setRecForm({ ...recForm, concept: v }) : setIncForm({ ...incForm, concept: v }),
        tabs: incType === "rec" ? [
          { id: "amount", label: "Importe", icon: "receipt", hasVal: Number(recForm.amount) > 0, badge: Number(recForm.amount) > 0 ? `${_eur(recForm.amount)} base` : null },
          { id: "vat", label: "IVA", icon: "tag", hasVal: true, badge: `${recForm.vat}%` },
          { id: "irpf", label: "IRPF", icon: "minus", hasVal: Number(recForm.irpf) > 0, badge: `${recForm.irpf}%` },
          { id: "cycle", label: "Ciclo", icon: "refresh-cw", hasVal: true, badge: recForm.cycle === "yearly" ? "Anual" : "Mensual" },
          { id: "client", label: "Cliente", icon: "users", hasVal: !!recForm.clientId, badge: recForm.clientId ? clientName(recForm.clientId) : null },
          { id: "charge", label: "Cobro", icon: "calendar", hasVal: !!recForm.nextCharge, badge: recForm.nextCharge ? _finDate(recForm.nextCharge) : null }
        ] : [
          { id: "amount", label: "Importe", icon: "receipt", hasVal: Number(incForm.amount) > 0, badge: Number(incForm.amount) > 0 ? `${_eur(incForm.amount)} base` : null },
          { id: "vat", label: "IVA", icon: "tag", hasVal: true, badge: `${incForm.vat}%` },
          { id: "irpf", label: "IRPF", icon: "minus", hasVal: Number(incForm.irpf) > 0, badge: `${incForm.irpf}%` },
          { id: "date", label: "Fecha", icon: "calendar", hasVal: !!incForm.date, badge: incForm.date ? _finDate(incForm.date) : null },
          { id: "client", label: "Cliente", icon: "users", hasVal: !!incForm.clientId, badge: incForm.clientId ? clientName(incForm.clientId) : null }
        ],
        renderTab: (id) => {
          if (id === "amount") return /* @__PURE__ */ React.createElement(
            "input",
            {
              style: { ...QUICK_FIELD, width: 180, textAlign: "center", fontSize: 22, fontWeight: 300, letterSpacing: "-1px", fontFamily: "var(--font-display)" },
              type: "number",
              step: "0.01",
              min: "0",
              placeholder: "0,00 \u20AC",
              autoFocus: true,
              value: incType === "rec" ? recForm.amount : incForm.amount,
              onChange: (e) => incType === "rec" ? setRecForm({ ...recForm, amount: e.target.value }) : setIncForm({ ...incForm, amount: e.target.value })
            }
          );
          if (id === "vat") return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, justifyContent: "center" } }, [21, 10, 0].map((v) => {
            const sel = Number(incType === "rec" ? recForm.vat : incForm.vat) === v;
            return /* @__PURE__ */ React.createElement(
              QuickPill,
              {
                key: v,
                selected: sel,
                onClick: () => incType === "rec" ? setRecForm({ ...recForm, vat: v }) : setIncForm({ ...incForm, vat: v })
              },
              v === 0 ? "Sin IVA" : `${v}%`
            );
          })), (() => {
            const f = incType === "rec" ? recForm : incForm;
            const base = Number(f.amount) || 0;
            if (!base) return null;
            return /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "var(--text-subtle)", letterSpacing: "-0.3px" } }, "Base ", _eur(base), " \u2192 Total ", _eur(base * (1 + Number(f.vat) / 100)));
          })());
          if (id === "irpf") return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, justifyContent: "center" } }, [15, 7, 0].map((v) => {
            const sel = Number(incType === "rec" ? recForm.irpf : incForm.irpf) === v;
            return /* @__PURE__ */ React.createElement(
              QuickPill,
              {
                key: v,
                selected: sel,
                onClick: () => incType === "rec" ? setRecForm({ ...recForm, irpf: v }) : setIncForm({ ...incForm, irpf: v })
              },
              v === 0 ? "Sin IRPF" : `${v}%`
            );
          })), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11.5, color: "var(--text-subtle)", letterSpacing: "-0.3px", textAlign: "center", maxWidth: 300 } }, "Retenci\xF3n para empresas y aut\xF3nomos. Sin IRPF para particulares."), (() => {
            const f = incType === "rec" ? recForm : incForm;
            const base = Number(f.amount) || 0;
            if (!base) return null;
            return /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "var(--text-subtle)", letterSpacing: "-0.3px" } }, "Cobras ", _eur(base * (1 + Number(f.vat) / 100 - Number(f.irpf) / 100)));
          })());
          if (id === "cycle") return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, justifyContent: "center" } }, FIN_CYCLES.map((c) => /* @__PURE__ */ React.createElement(QuickPill, { key: c.id, selected: recForm.cycle === c.id, onClick: () => setRecForm({ ...recForm, cycle: c.id }) }, c.label)));
          if (id === "client") return /* @__PURE__ */ React.createElement("div", { style: { width: "100%", maxHeight: 180, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 } }, D.CLIENTS.length === 0 ? /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: "var(--text-subtle)", textAlign: "center" } }, "Sin clientes") : [...D.CLIENTS].sort((a, b) => (a.company || a.name || "").localeCompare(b.company || b.name || "")).map((c) => {
            const sel = (incType === "rec" ? recForm.clientId : incForm.clientId) === c.id;
            return /* @__PURE__ */ React.createElement(
              QuickPill,
              {
                key: c.id,
                selected: sel,
                onClick: () => incType === "rec" ? setRecForm({ ...recForm, clientId: sel ? "" : c.id }) : setIncForm({ ...incForm, clientId: sel ? "" : c.id })
              },
              c.company || c.name
            );
          }));
          if (id === "charge") return /* @__PURE__ */ React.createElement(
            "input",
            {
              style: { ...QUICK_FIELD },
              type: "date",
              value: recForm.nextCharge,
              onChange: (e) => setRecForm({ ...recForm, nextCharge: e.target.value })
            }
          );
          if (id === "date") return /* @__PURE__ */ React.createElement(
            "input",
            {
              style: { ...QUICK_FIELD },
              type: "date",
              value: incForm.date,
              onChange: (e) => setIncForm({ ...incForm, date: e.target.value })
            }
          );
          return null;
        }
      }
    ), /* @__PURE__ */ React.createElement(NewInvoiceModal, { open: stripeInvOpen, onClose: () => setStripeInvOpen(false), onCreated: fetchStripe }), /* @__PURE__ */ React.createElement(PaymentLinkModal, { open: payLinkOpen, onClose: () => setPayLinkOpen(false) }));
  };
  var PaymentLinkModal = ({ open, onClose }) => {
    const toast = useToast();
    const [concept, setConcept] = useState("");
    const [amount, setAmount] = useState("");
    const [busy, setBusy] = useState(false);
    const [url, setUrl] = useState("");
    useEffect(() => {
      if (open) {
        setConcept("");
        setAmount("");
        setUrl("");
        setBusy(false);
      }
    }, [open]);
    const create = async () => {
      if (!concept.trim() || !(Number(amount) > 0)) {
        toast("Pon concepto e importe", "warn");
        return;
      }
      setBusy(true);
      try {
        const res = await _stripeApi("create_payment_link", { name: concept.trim(), amount: Number(amount) });
        if (res.ok) setUrl(res.url);
        else toast(res.error || "No se pudo crear el enlace", "warn");
      } catch (e) {
        toast("Error de conexi\xF3n", "warn");
      }
      setBusy(false);
    };
    const copy = () => navigator.clipboard.writeText(url).then(() => toast("Enlace copiado", "success")).catch(() => {
    });
    return /* @__PURE__ */ React.createElement(
      Modal,
      {
        open,
        onClose,
        title: "Enlace de pago",
        sub: "Un link de cobro de Stripe: comp\xE1rtelo por WhatsApp, email o donde quieras.",
        footer: url ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: onClose }, "Cerrar"), /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: copy }, /* @__PURE__ */ React.createElement(Icon, { name: "file", size: 12 }), " Copiar enlace")) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: onClose }, "Cancelar"), /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: create, disabled: busy }, busy ? "Creando\u2026" : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 12 }), " Crear enlace")))
      },
      url ? /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Tu enlace de pago"), /* @__PURE__ */ React.createElement(
        "input",
        {
          className: "input",
          readOnly: true,
          value: url,
          onClick: (e) => e.target.select(),
          style: { fontFamily: "var(--font-mono)", fontSize: 12.5 }
        }
      ), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-subtle)", marginTop: 10, lineHeight: 1.5 } }, "Cuando alguien pague, el cobro aparecer\xE1 autom\xE1ticamente en esta p\xE1gina.")) : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 13 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Concepto"), /* @__PURE__ */ React.createElement(
        "input",
        {
          className: "input",
          placeholder: "Ej. Auditor\xEDa web",
          value: concept,
          onChange: (e) => setConcept(e.target.value),
          autoFocus: true
        }
      )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Importe (\u20AC)"), /* @__PURE__ */ React.createElement(
        "input",
        {
          className: "input",
          type: "number",
          min: "0",
          step: "0.01",
          placeholder: "150",
          value: amount,
          onChange: (e) => setAmount(e.target.value),
          style: { maxWidth: 180 }
        }
      )))
    );
  };
  Object.assign(window, { AgencyBilling, IncomePage, AgencyProjects, SimplePage, SettingsPage, TasksBoard, ProjectTaskColumn, TaskRow });
})();

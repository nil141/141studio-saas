(function() {
const GeneralTaskCard = ({ t, onDelete, onUpdate, onToggle }) => {
  const [hover, setHover] = useState(false);
  const isDone = t.column === "done";
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "kanban-card",
      style: { marginBottom: 6, cursor: "default", gap: 6 },
      onMouseEnter: () => setHover(true),
      onMouseLeave: () => setHover(false)
    },
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "flex-start", gap: 8 } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: onToggle,
        style: {
          width: 16,
          height: 16,
          borderRadius: "50%",
          flexShrink: 0,
          marginTop: 1,
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
      isDone && /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 9, style: { color: "#fff" } })
    ), /* @__PURE__ */ React.createElement("span", { style: {
      flex: 1,
      fontWeight: 500,
      fontSize: 13,
      lineHeight: 1.3,
      color: isDone ? "var(--text-subtle)" : "var(--text)",
      textDecoration: isDone ? "line-through" : "none"
    } }, t.title)),
    t.deadline && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--amber)", paddingLeft: 24 } }, /* @__PURE__ */ React.createElement(Icon, { name: "calendar", size: 10, style: { verticalAlign: "middle", marginRight: 3 } }), (/* @__PURE__ */ new Date(t.deadline + "T00:00:00")).toLocaleDateString("es-ES", { day: "numeric", month: "short" })),
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", paddingLeft: 24 } }, t.clientName ? /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: "var(--text-subtle)" } }, t.clientName) : /* @__PURE__ */ React.createElement("span", null), /* @__PURE__ */ React.createElement("div", { style: { visibility: hover ? "visible" : "hidden" } }, /* @__PURE__ */ React.createElement(
      TaskDotsMenu,
      {
        task: t,
        onDelete,
        onUpdate,
        projectId: "__none__"
      }
    )))
  );
};
const GeneralTaskColumn = ({ tasks, toast, openModal }) => {
  const D = window.Data;
  const [doneOpen, setDoneOpen] = useState(false);
  const ACTIVE_COLS = ["todo", "doing", "review"];
  const COL_LABELS = { todo: "Por hacer", doing: "En curso", review: "Revisi\xF3n" };
  const COL_COLORS = { todo: "var(--text-subtle)", doing: "var(--blue)", review: "var(--amber)" };
  const active = tasks.filter((t) => t.column !== "done");
  const done = tasks.filter((t) => t.column === "done");
  const cardProps = (t) => ({
    t,
    onToggle: () => D.moveTask("__none__", t.id, t.column === "done" ? "todo" : "done"),
    onDelete: () => {
      D.deleteTask("__none__", t.id);
      toast("Tarea eliminada", "success");
    },
    onUpdate: (ch) => {
      D.updateTask("__none__", t.id, ch);
    }
  });
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
    background: "var(--bg-elev)"
  } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 4 } }, /* @__PURE__ */ React.createElement("span", { className: "dot muted" }), /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 600, fontSize: 14, letterSpacing: "-0.01em", flex: 1 } }, "Sin proyecto"), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn ghost icon-only sm",
      "data-tooltip": "Nueva tarea sin proyecto",
      onClick: () => openModal("newTask")
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 12 })
  )), /* @__PURE__ */ React.createElement("div", { className: "subtle xsmall" }, active.length, " pendiente", active.length !== 1 ? "s" : "")), /* @__PURE__ */ React.createElement("div", { style: { overflowY: "auto", flex: 1, padding: "8px 0" } }, active.length === 0 && /* @__PURE__ */ React.createElement("div", { style: { padding: "24px 16px", textAlign: "center", color: "var(--text-subtle)", fontSize: 12 } }, "Sin tareas pendientes"), ACTIVE_COLS.map((col) => {
    const colTasks = active.filter((t) => t.column === col);
    if (colTasks.length === 0) return null;
    return /* @__PURE__ */ React.createElement("div", { key: col, style: { marginBottom: 4 } }, /* @__PURE__ */ React.createElement("div", { style: {
      fontSize: 11,
      fontWeight: 500,
      color: COL_COLORS[col],
      padding: "2px 16px 4px",
      letterSpacing: "0.01em"
    } }, COL_LABELS[col]), colTasks.map((t) => /* @__PURE__ */ React.createElement("div", { key: t.id, style: { padding: "0 8px" } }, /* @__PURE__ */ React.createElement(GeneralTaskCard, { ...cardProps(t) }))));
  }), done.length > 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
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
  ), doneOpen && done.map((t) => /* @__PURE__ */ React.createElement("div", { key: t.id, style: { padding: "0 8px" } }, /* @__PURE__ */ React.createElement(GeneralTaskCard, { ...cardProps(t) }))))));
};
const TasksBoard = ({ navigate, openModal }) => {
  const D = window.Data;
  D.useStore();
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(/* @__PURE__ */ new Date());
  const daysContainerRef = useRef(null);
  const dayItemRefs = useRef({});
  const [dayPill, setDayPill] = useState(null);
  const firstDayPill = useRef(true);
  const [taskModal, setTaskModal] = useState(null);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  useEffect(() => {
    const key = new Date(selectedDay).toDateString();
    const el = dayItemRefs.current[key];
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
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", height: "100vh", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { className: "tasks-left", style: {
    width: 260,
    flexShrink: 0,
    borderRight: "0.5px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    padding: "20px 16px 20px 20px",
    overflow: "hidden"
  } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setWeekOffset((o) => o - 1),
      style: { background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "6px 8px", borderRadius: 8, display: "flex", alignItems: "center" }
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "chevron-left", size: 16 })
  ), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 26, fontWeight: 400, letterSpacing: "-1px", color: "var(--text)" } }, MON_ES[weekDays[3].getMonth()]), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setWeekOffset((o) => o + 1),
      style: { background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "6px 8px", borderRadius: 8, display: "flex", alignItems: "center" }
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "chevron-right", size: 16 })
  )), /* @__PURE__ */ React.createElement("div", { style: { background: "rgba(255,255,255,0.04)", border: "0.5px solid var(--border)", borderRadius: 12, padding: "12px 14px", marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-subtle)", marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 500 } }, /* @__PURE__ */ React.createElement("span", null, "Daily Progress"), /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 600, color: "var(--text-muted)" } }, donePct, "%")), /* @__PURE__ */ React.createElement("div", { style: { height: 3, background: "var(--border)", borderRadius: 99 } }, /* @__PURE__ */ React.createElement("div", { style: { width: `${donePct}%`, height: "100%", background: "var(--accent)", borderRadius: 99, transition: "width .4s" } }))), (() => {
    const nextDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekDays[6]);
      d.setDate(weekDays[6].getDate() + 1 + i);
      return d;
    });
    const allDays = weekDays.map((d) => ({ d, dimmed: false })).concat(nextDays.map((d) => ({ d, dimmed: true })));
    return /* @__PURE__ */ React.createElement("div", { ref: daysContainerRef, style: { position: "relative", display: "flex", flexDirection: "column", gap: 6 } }, dayPill && /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      left: 0,
      right: 0,
      top: dayPill.top,
      height: dayPill.height,
      background: "rgba(158,154,229,0.18)",
      borderRadius: 10,
      pointerEvents: "none",
      zIndex: 0,
      transition: dayPill.animated ? "top 0.22s cubic-bezier(0.4,0,0.2,1)" : "none"
    } }), allDays.map(({ d, dimmed }) => {
      const dMid = new Date(d);
      dMid.setHours(0, 0, 0, 0);
      const isToday2 = dMid.getTime() === todayMid.getTime();
      const isSel = dMid.getTime() === selMid.getTime();
      const dayTasks2 = allTasks.filter((t) => {
        if (!t.deadline) return false;
        const td = /* @__PURE__ */ new Date(t.deadline + "T00:00:00");
        td.setHours(0, 0, 0, 0);
        return td.getTime() === dMid.getTime();
      });
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          key: d.toISOString(),
          ref: (el) => {
            dayItemRefs.current[d.toDateString()] = el;
          },
          onClick: () => setSelectedDay(new Date(d)),
          style: {
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "7px 12px",
            borderRadius: 10,
            cursor: "pointer",
            background: isSel ? "transparent" : "rgba(255,255,255,0.035)",
            border: isSel ? "none" : "0.5px solid var(--border)",
            opacity: dimmed ? 0.38 : 1,
            transition: "opacity .15s"
          }
        },
        /* @__PURE__ */ React.createElement("span", { style: {
          fontSize: 13,
          width: 28,
          letterSpacing: "-0.2px",
          flexShrink: 0,
          color: isSel ? "var(--accent)" : "var(--text-subtle)",
          fontWeight: isSel ? 500 : 400
        } }, DAY_ES[d.getDay()]),
        /* @__PURE__ */ React.createElement("span", { style: {
          fontSize: 20,
          fontWeight: 400,
          letterSpacing: "-0.5px",
          flex: 1,
          color: isSel ? "#c8c5f2" : isToday2 ? "var(--text)" : "var(--text-muted)"
        } }, d.getDate()),
        isToday2 && /* @__PURE__ */ React.createElement("span", { style: { width: 5, height: 5, borderRadius: "50%", background: "var(--accent)", flexShrink: 0 } })
      );
    }));
  })()), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: "28px 32px" }, className: "tasks-right", onClick: () => setOptionsOpen(false) }, /* @__PURE__ */ React.createElement("div", { className: "tasks-mobile-header" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", marginBottom: 14 } }, /* @__PURE__ */ React.createElement("button", { onClick: () => setWeekOffset((o) => o - 1), style: { background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px 6px", display: "flex" } }, /* @__PURE__ */ React.createElement(Icon, { name: "chevron-left", size: 18 })), /* @__PURE__ */ React.createElement("span", { style: { flex: 1, textAlign: "center", fontSize: 24, fontWeight: 400, letterSpacing: "-1px" } }, MON_ES[weekDays[3].getMonth()]), /* @__PURE__ */ React.createElement("button", { onClick: () => setWeekOffset((o) => o + 1), style: { background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px 6px", display: "flex" } }, /* @__PURE__ */ React.createElement(Icon, { name: "chevron-right", size: 18 }))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4 } }, weekDays.map((d) => {
    const dMid = new Date(d);
    dMid.setHours(0, 0, 0, 0);
    const isSel = dMid.getTime() === selMid.getTime();
    const isToday2 = dMid.getTime() === todayMid.getTime();
    return /* @__PURE__ */ React.createElement("button", { key: d.toISOString(), onClick: () => setSelectedDay(new Date(d)), style: {
      flex: 1,
      background: "transparent",
      border: "none",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 6,
      padding: "4px 0"
    } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 500, color: isSel ? "var(--accent)" : "var(--text-subtle)", letterSpacing: "0.02em" } }, ["D", "L", "M", "X", "J", "V", "S"][d.getDay()]), /* @__PURE__ */ React.createElement("div", { style: {
      width: 34,
      height: 34,
      borderRadius: "50%",
      border: isSel ? "1.5px solid var(--accent)" : isToday2 ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.1)",
      background: isSel ? "rgba(158,154,229,0.14)" : "rgba(255,255,255,0.04)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15, fontWeight: isSel || isToday2 ? 500 : 400, color: isSel ? "#c8c5f2" : isToday2 ? "var(--text)" : "var(--text-muted)", letterSpacing: "-0.4px" } }, d.getDate())));
  })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, margin: "14px 0 0", paddingBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1, height: 2, background: "var(--border)", borderRadius: 99 } }, /* @__PURE__ */ React.createElement("div", { style: { width: `${donePct}%`, height: "100%", background: "var(--accent)", borderRadius: 99, transition: "width .4s" } })), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: "var(--text-muted)", fontWeight: 500, flexShrink: 0 } }, donePct, "%"))), /* @__PURE__ */ React.createElement("div", { className: "tasks-desktop-header", style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, paddingBottom: 20, borderBottom: "0.5px solid var(--border)" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", { style: { margin: 0, fontSize: 22, fontWeight: 400, letterSpacing: "-0.96px" } }, "Tareas"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "var(--text-muted)", marginTop: 4, letterSpacing: "-0.5px" } }, DAY_ES[new Date(selectedDay).getDay()], " ", new Date(selectedDay).getDate(), " ", MON_ES[new Date(selectedDay).getMonth()], " \xB7 ", dayTasks.filter((t) => t.column !== "done").length, " pendientes")), /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement("div", { style: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    padding: "3px 4px",
    background: "rgba(255,255,255,0.07)",
    border: "0.5px solid rgba(255,255,255,0.1)",
    borderRadius: 99
  } }, [
    { icon: "plus", onClick: () => openModal("newTask", { date: selDateStr }) },
    { icon: "more-h", onClick: (e) => {
      e.stopPropagation();
      setOptionsOpen((o) => !o);
    } }
  ].map((btn) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: btn.icon,
      onClick: btn.onClick,
      style: {
        width: 34,
        height: 34,
        borderRadius: "50%",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-muted)",
        transition: "background .12s",
        flexShrink: 0
      },
      onMouseEnter: (e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)",
      onMouseLeave: (e) => e.currentTarget.style.background = "transparent"
    },
    /* @__PURE__ */ React.createElement(Icon, { name: btn.icon, size: 15 })
  ))), optionsOpen && /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    top: 44,
    right: 0,
    zIndex: 50,
    background: "#1a1a1c",
    border: "0.5px solid rgba(255,255,255,0.1)",
    borderRadius: 14,
    padding: "8px 0",
    minWidth: 210,
    boxShadow: "0 8px 32px rgba(0,0,0,0.5)"
  }, onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement(
    "div",
    {
      style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", cursor: "pointer" },
      onClick: () => setHideCompleted((h) => !h)
    },
    /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: "var(--text)", letterSpacing: "-0.5px" } }, "Ocultar completadas"),
    /* @__PURE__ */ React.createElement("div", { style: {
      width: 36,
      height: 20,
      borderRadius: 99,
      position: "relative",
      background: hideCompleted ? "var(--accent)" : "rgba(255,255,255,0.12)",
      transition: "background .2s",
      flexShrink: 0
    } }, /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      top: 2,
      left: hideCompleted ? 18 : 2,
      width: 16,
      height: 16,
      borderRadius: "50%",
      background: "white",
      transition: "left .2s"
    } }))
  )))), groups.length === 0 && /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", padding: "60px 0", color: "var(--text-subtle)", fontSize: 14, letterSpacing: "-0.5px" } }, "Sin tareas para este d\xEDa \u2014 ", /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: () => openModal("newTask", { date: selDateStr }) }, "crear una")), groups.map((group, gIdx) => /* @__PURE__ */ React.createElement("div", { key: group.clientId, style: { marginBottom: 32 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 7, height: 7, borderRadius: "50%", background: group.color, flexShrink: 0 } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, fontWeight: 400, letterSpacing: "0", textTransform: "uppercase", color: "#9e9e9e" } }, group.clientName), gIdx === 0 && /* @__PURE__ */ React.createElement("div", { className: "mobile-pill-inline", style: { marginLeft: "auto", display: "flex", alignItems: "center", gap: 2, padding: "3px 4px", background: "rgba(255,255,255,0.07)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 99 } }, [
    { icon: "plus", onClick: () => openModal("newTask", { date: selDateStr }) },
    { icon: "more-h", onClick: (e) => {
      e.stopPropagation();
      setOptionsOpen((o) => !o);
    } }
  ].map((btn) => /* @__PURE__ */ React.createElement("button", { key: btn.icon, onClick: btn.onClick, style: { width: 30, height: 26, borderRadius: "50%", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" } }, /* @__PURE__ */ React.createElement(Icon, { name: btn.icon, size: 13 }))))), group.projects.map(({ project, tasks }) => tasks.filter((t) => !hideCompleted || t.column !== "done").map((t, idx, arr) => {
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
  })), /* @__PURE__ */ React.createElement("div", { className: "client-divider", style: { height: "0.5px", background: "var(--border)", marginTop: 4 } })))), taskModal && /* @__PURE__ */ React.createElement(
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
  return /* @__PURE__ */ React.createElement("div", { className: "page" }, /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", null, "Proyectos"), /* @__PURE__ */ React.createElement("div", { className: "sub" }, cap, " en marcha \xB7 ", capLabel)), /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: () => openModal("newProject") }, /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 13 }), " Nuevo proyecto")), /* @__PURE__ */ React.createElement("div", { className: "card", style: { marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", { className: "card-body", style: { padding: 16, display: "flex", alignItems: "center", gap: 16 } }, /* @__PURE__ */ React.createElement("div", { className: "metric-label" }, "Capacidad"), /* @__PURE__ */ React.createElement("div", { className: "grow" }, /* @__PURE__ */ React.createElement("div", { className: "row tight" }, /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 500 } }, cap, " ", cap === 1 ? "proyecto activo" : "proyectos activos"), /* @__PURE__ */ React.createElement("span", { className: "chip " + capColor }, capLabel))), /* @__PURE__ */ React.createElement("div", { className: "muted xsmall", style: { textAlign: "right", lineHeight: 1.5 } }, "1-3 c\xF3moda \xB7 4 atenci\xF3n \xB7 5+ riesgo"))), D.PROJECTS.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body", style: { padding: 60 } }, /* @__PURE__ */ React.createElement(Empty, { icon: "folder", title: "Sin proyectos", sub: "Crea tu primer proyecto para empezar" }))) : /* @__PURE__ */ React.createElement("div", { className: "rg-projects" }, D.PROJECTS.map((p) => {
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
const _stripeApi = async (endpoint, body = {}) => {
  const res = await fetch(`/api/stripe/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return res.json();
};
const _cents = (n, cur = "eur") => {
  const sym = { eur: "\u20AC", usd: "$", gbp: "\xA3" }[cur] || "\u20AC";
  return `${sym}${(n / 100).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
const _tsDate = (ts) => {
  if (!ts) return "\u2014";
  const d = new Date(ts * 1e3);
  const M = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return `${d.getDate()} ${M[d.getMonth()]} ${d.getFullYear()}`;
};
const RevenueChart = ({ buckets, loading }) => {
  const [mouseX, setMouseX] = useState(null);
  const svgRef = React.useRef(null);
  const W = 900, H = 280;
  const P = { t: 16, r: 4, b: 38, l: 4 };
  const cW = W - P.l - P.r, cH = H - P.t - P.b;
  if (loading) return /* @__PURE__ */ React.createElement("div", { style: { height: H, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-subtle)", fontSize: 13 } }, "Cargando datos\u2026");
  if (!buckets || !buckets.length) return null;
  const maxAmt = Math.max(...buckets.map((b) => b.amount), 1);
  const toX = (i) => P.l + (buckets.length > 1 ? i / (buckets.length - 1) : 0.5) * cW;
  const toY = (v) => P.t + cH - v / maxAmt * cH;
  const pts = buckets.map((b, i) => ({ ...b, x: toX(i), y: toY(b.amount) }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1].x.toFixed(2)},${(P.t + cH).toFixed(2)} L${pts[0].x.toFixed(2)},${(P.t + cH).toFixed(2)} Z`;
  const yTicks = [0, 0.25, 0.5, 0.75, 1];
  const xStep = Math.max(1, Math.floor(buckets.length / 6));
  const cx = mouseX !== null ? Math.max(P.l, Math.min(P.l + cW, mouseX)) : null;
  const hoverPt = mouseX !== null && pts.length ? pts.reduce((a, b) => Math.abs(a.x - mouseX) < Math.abs(b.x - mouseX) ? a : b) : null;
  const tooltipLeft = cx !== null ? `${Math.min(Math.max(cx / W * 100, 10), 78)}%` : "50%";
  return /* @__PURE__ */ React.createElement("div", { style: { position: "relative", userSelect: "none" }, onMouseLeave: () => setMouseX(null) }, /* @__PURE__ */ React.createElement(
    "svg",
    {
      ref: svgRef,
      viewBox: `0 0 ${W} ${H}`,
      style: { width: "100%", height: "auto", display: "block" },
      onMouseMove: (e) => {
        const r = svgRef.current.getBoundingClientRect();
        setMouseX((e.clientX - r.left) / r.width * W);
      }
    },
    /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("linearGradient", { id: "rGrad", x1: "0", y1: "0", x2: "0", y2: "1" }, /* @__PURE__ */ React.createElement("stop", { offset: "0%", stopColor: "var(--accent)", stopOpacity: "0.16" }), /* @__PURE__ */ React.createElement("stop", { offset: "100%", stopColor: "var(--accent)", stopOpacity: "0" }))),
    yTicks.map((f, i) => {
      const y = P.t + cH * (1 - f);
      return /* @__PURE__ */ React.createElement("g", { key: i }, /* @__PURE__ */ React.createElement(
        "line",
        {
          x1: P.l,
          y1: y,
          x2: P.l + cW,
          y2: y,
          stroke: "var(--border)",
          strokeWidth: "0.5"
        }
      ), f > 0 && /* @__PURE__ */ React.createElement(
        "text",
        {
          x: P.l + 8,
          y: y - 5,
          textAnchor: "start",
          fontSize: "11",
          fill: "var(--text-subtle)"
        },
        _cents(maxAmt * f)
      ));
    }),
    /* @__PURE__ */ React.createElement("path", { d: area, fill: "url(#rGrad)" }),
    /* @__PURE__ */ React.createElement(
      "path",
      {
        d: line,
        fill: "none",
        stroke: "var(--accent)",
        strokeWidth: "2",
        strokeLinejoin: "round",
        strokeLinecap: "round"
      }
    ),
    buckets.map((b, i) => {
      if (i % xStep !== 0 && i !== buckets.length - 1) return null;
      return /* @__PURE__ */ React.createElement(
        "text",
        {
          key: i,
          x: toX(i),
          y: H - 10,
          textAnchor: "middle",
          fontSize: "11",
          fill: "var(--text-subtle)"
        },
        b.label
      );
    }),
    cx !== null && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
      "line",
      {
        x1: cx,
        y1: P.t,
        x2: cx,
        y2: P.t + cH,
        stroke: "var(--border-strong)",
        strokeWidth: "1",
        strokeDasharray: "4,3"
      }
    ), hoverPt && /* @__PURE__ */ React.createElement(
      "circle",
      {
        cx: hoverPt.x,
        cy: hoverPt.y,
        r: "5",
        fill: "var(--accent)",
        stroke: "var(--bg-elev)",
        strokeWidth: "2.5"
      }
    ))
  ), hoverPt && cx !== null && /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    top: 20,
    left: tooltipLeft,
    transform: "translateX(-50%)",
    pointerEvents: "none",
    background: "var(--bg-elev-2)",
    border: "0.5px solid var(--border-strong)",
    borderRadius: 9,
    padding: "7px 12px",
    fontSize: 12,
    boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
    whiteSpace: "nowrap"
  } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-subtle)", marginBottom: 2 } }, hoverPt.label), /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 600, fontSize: 15, color: "var(--text)" } }, _cents(hoverPt.amount)), hoverPt.count > 0 && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-subtle)", marginTop: 1 } }, hoverPt.count, " cobro", hoverPt.count !== 1 ? "s" : "")));
};
const CreateInvoiceModal = ({ open, onClose, onCreated }) => {
  const D = window.Data;
  const toast = useToast();
  const [clientSearch, setClientSearch] = useState("");
  const [clientOpen, setClientOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [cur, setCur] = useState("eur");
  const [desc, setDesc] = useState("");
  const [dueDays, setDueDays] = useState(30);
  const [sendNow, setSendNow] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const reset = () => {
    setClientSearch("");
    setClientOpen(false);
    setSelectedClient(null);
    setSelectedProject(null);
    setName("");
    setEmail("");
    setAmount("");
    setDesc("");
    setErr("");
  };
  const allClients = D.CLIENTS || [];
  const filteredClients = clientSearch.trim() ? allClients.filter((c) => c.name.toLowerCase().includes(clientSearch.toLowerCase()) || c.company.toLowerCase().includes(clientSearch.toLowerCase())) : allClients;
  const clientProjects = selectedClient ? (D.PROJECTS || []).filter((p) => p.clientId === selectedClient.id) : [];
  const pickClient = (c) => {
    setSelectedClient(c);
    setClientSearch(c.name + (c.company ? ` \u2014 ${c.company}` : ""));
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
      setErr("Email e importe son obligatorios.");
      return;
    }
    setLoading(true);
    setErr("");
    try {
      const res = await _stripeApi("create_invoice", {
        name,
        email: email.trim(),
        amount: parseFloat(amount),
        currency: cur,
        description: desc || "Servicio",
        due_days: dueDays,
        send_now: sendNow
      });
      if (res.ok) {
        toast(`Factura ${res.number || res.invoice_id} creada${sendNow ? " y enviada" : ""}`, "success");
        reset();
        onClose();
        onCreated && onCreated();
      } else {
        setErr(res.error || "Error al crear la factura");
      }
    } catch (e) {
      setErr("Error de conexi\xF3n con el servidor");
    }
    setLoading(false);
  };
  if (!open) return null;
  const inputStyle = { height: 38, fontSize: 13 };
  const labelStyle = { display: "block", fontSize: 11, color: "var(--text-subtle)", marginBottom: 4, fontWeight: 500 };
  return /* @__PURE__ */ React.createElement("div", { style: {
    position: "fixed",
    inset: 0,
    zIndex: 300,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }, onClick: (e) => {
    if (e.target === e.currentTarget) {
      reset();
      onClose();
    }
  } }, /* @__PURE__ */ React.createElement("div", { style: {
    width: 480,
    background: "var(--bg-elev)",
    border: "0.5px solid var(--border-strong)",
    borderRadius: 16,
    padding: 28,
    boxShadow: "0 24px 64px rgba(0,0,0,0.5)"
  }, onClick: (e) => {
    e.stopPropagation();
    setClientOpen(false);
  } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", marginBottom: 20 } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 600, fontSize: 16 } }, "Nueva factura"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-subtle)", marginTop: 2 } }, "Se crea directamente en Stripe")), /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only sm", onClick: () => {
    reset();
    onClose();
  } }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 14 }))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { gridColumn: "1/-1", position: "relative" }, onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("label", { style: labelStyle }, "Cliente"), /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement(Icon, { name: "search", size: 13, style: { position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)", pointerEvents: "none" } }), /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "input",
      value: clientSearch,
      onChange: (e) => {
        setClientSearch(e.target.value);
        setClientOpen(true);
        setSelectedClient(null);
      },
      onFocus: () => setClientOpen(true),
      placeholder: "Buscar o escribir cliente\u2026",
      style: { ...inputStyle, paddingLeft: 32 }
    }
  ), selectedClient && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setClientSearch("");
        setSelectedClient(null);
        setSelectedProject(null);
        setEmail("");
        setName("");
        setAmount("");
      },
      style: { position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", border: 0, background: "transparent", cursor: "pointer", color: "var(--text-subtle)", padding: 2 }
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 11 })
  )), clientOpen && filteredClients.length > 0 && /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    zIndex: 20,
    marginTop: 4,
    background: "var(--bg-elev)",
    border: "0.5px solid var(--border-strong)",
    borderRadius: 10,
    boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
    maxHeight: 200,
    overflowY: "auto"
  } }, filteredClients.map((c) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: c.id,
      onClick: () => pickClient(c),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 12px",
        cursor: "pointer",
        background: (selectedClient == null ? void 0 : selectedClient.id) === c.id ? "var(--accent-soft)" : "transparent"
      },
      onMouseEnter: (e) => e.currentTarget.style.background = "var(--bg-hover)",
      onMouseLeave: (e) => e.currentTarget.style.background = (selectedClient == null ? void 0 : selectedClient.id) === c.id ? "var(--accent-soft)" : "transparent"
    },
    /* @__PURE__ */ React.createElement("span", { style: {
      width: 28,
      height: 28,
      borderRadius: "50%",
      flexShrink: 0,
      background: c.color || "var(--accent)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 10,
      fontWeight: 700,
      color: "#fff"
    } }, c.initials),
    /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 500 } }, c.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-subtle)" } }, c.company, " \xB7 ", c.email))
  )))), clientProjects.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { gridColumn: "1/-1" } }, /* @__PURE__ */ React.createElement("label", { style: labelStyle }, "Proyecto ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-subtle)", fontWeight: 400 } }, "(opcional)")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } }, clientProjects.map((p) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: p.id,
      onClick: () => pickProject((selectedProject == null ? void 0 : selectedProject.id) === p.id ? null : p),
      style: {
        padding: "5px 12px",
        borderRadius: 99,
        fontSize: 12,
        cursor: "pointer",
        border: `1px solid ${(selectedProject == null ? void 0 : selectedProject.id) === p.id ? "var(--accent)" : "var(--border-strong)"}`,
        background: (selectedProject == null ? void 0 : selectedProject.id) === p.id ? "var(--accent-soft)" : "var(--bg-elev-2)",
        color: (selectedProject == null ? void 0 : selectedProject.id) === p.id ? "var(--accent)" : "var(--text)",
        transition: "all .1s"
      }
    },
    p.name,
    p.budget > 0 && /* @__PURE__ */ React.createElement("span", { style: { marginLeft: 6, opacity: 0.6 } }, "\u20AC", p.budget)
  )))), /* @__PURE__ */ React.createElement("div", { style: { gridColumn: "1/-1" } }, /* @__PURE__ */ React.createElement("label", { style: labelStyle }, "Email *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "input",
      type: "email",
      value: email,
      onChange: (e) => setEmail(e.target.value),
      placeholder: "cliente@empresa.com",
      style: inputStyle
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: labelStyle }, "Importe *"), /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement("span", { style: { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "var(--text-muted)" } }, cur === "eur" ? "\u20AC" : cur === "usd" ? "$" : "\xA3"), /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "input",
      type: "number",
      min: "0.01",
      step: "0.01",
      value: amount,
      onChange: (e) => setAmount(e.target.value),
      placeholder: "0,00",
      style: { ...inputStyle, paddingLeft: 28 }
    }
  ))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: labelStyle }, "Divisa"), /* @__PURE__ */ React.createElement("select", { className: "input", value: cur, onChange: (e) => setCur(e.target.value), style: { ...inputStyle, cursor: "pointer" } }, /* @__PURE__ */ React.createElement("option", { value: "eur" }, "EUR \u2014 Euro"), /* @__PURE__ */ React.createElement("option", { value: "usd" }, "USD \u2014 D\xF3lar"), /* @__PURE__ */ React.createElement("option", { value: "gbp" }, "GBP \u2014 Libra"))), /* @__PURE__ */ React.createElement("div", { style: { gridColumn: "1/-1" } }, /* @__PURE__ */ React.createElement("label", { style: labelStyle }, "Descripci\xF3n"), /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "input",
      value: desc,
      onChange: (e) => setDesc(e.target.value),
      placeholder: "Ej: Dise\xF1o web \u2014 mayo 2026",
      style: inputStyle
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: labelStyle }, "Vencimiento"), /* @__PURE__ */ React.createElement("select", { className: "input", value: dueDays, onChange: (e) => setDueDays(parseInt(e.target.value)), style: { ...inputStyle, cursor: "pointer" } }, [7, 14, 30, 45, 60].map((d) => /* @__PURE__ */ React.createElement("option", { key: d, value: d }, d, " d\xEDas")))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, paddingTop: 18 } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setSendNow((v) => !v),
      style: {
        width: 36,
        height: 20,
        borderRadius: 10,
        border: 0,
        cursor: "pointer",
        padding: 0,
        background: sendNow ? "var(--accent)" : "var(--bg-elev-2)",
        position: "relative",
        transition: "background .15s",
        flexShrink: 0
      }
    },
    /* @__PURE__ */ React.createElement("span", { style: {
      position: "absolute",
      top: 2,
      left: sendNow ? 18 : 2,
      width: 16,
      height: 16,
      borderRadius: "50%",
      background: sendNow ? "var(--accent-fg)" : "var(--text-subtle)",
      transition: "left .15s"
    } })
  ), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "var(--text-muted)" } }, "Enviar al cliente ahora"))), err && /* @__PURE__ */ React.createElement("div", { style: {
    display: "flex",
    gap: 8,
    padding: "8px 12px",
    background: "var(--red-soft)",
    border: "0.5px solid var(--red)",
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 12,
    color: "var(--red)"
  } }, /* @__PURE__ */ React.createElement(Icon, { name: "alert-triangle", size: 13, style: { flexShrink: 0, marginTop: 1 } }), err), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: () => {
    reset();
    onClose();
  } }, "Cancelar"), /* @__PURE__ */ React.createElement("button", { className: "btn primary sm", onClick: create, disabled: loading || !email || !amount }, loading ? "Creando\u2026" : sendNow ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Icon, { name: "send", size: 12 }), " Crear y enviar") : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 12 }), " Crear factura")))));
};
const STRIPE_STATUS = {
  paid: { label: "Pagada", color: "var(--green)", bg: "var(--green-soft)" },
  open: { label: "Pendiente", color: "var(--amber)", bg: "var(--amber-soft)" },
  draft: { label: "Borrador", color: "var(--text-subtle)", bg: "var(--bg-elev-2)" },
  void: { label: "Anulada", color: "var(--text-subtle)", bg: "var(--bg-elev-2)" },
  uncollectible: { label: "Incobrable", color: "var(--red)", bg: "var(--red-soft)" },
  succeeded: { label: "Pagado", color: "var(--green)", bg: "var(--green-soft)" },
  failed: { label: "Fallido", color: "var(--red)", bg: "var(--red-soft)" }
};
const StripeChip = ({ status }) => {
  const s = STRIPE_STATUS[status] || { label: status, color: "var(--text-muted)", bg: "var(--bg-elev-2)" };
  return /* @__PURE__ */ React.createElement("span", { style: {
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 8px",
    borderRadius: 99,
    fontSize: 11,
    fontWeight: 500,
    color: s.color,
    background: s.bg
  } }, s.label);
};
const PERIODS = [
  { id: "7d", label: "7 d\xEDas" },
  { id: "30d", label: "30 d\xEDas" },
  { id: "3m", label: "3 meses" },
  { id: "12m", label: "1 a\xF1o" }
];
const AgencyBilling = ({ openModal }) => {
  var _a;
  const toast = useToast();
  const [filter, setFilter] = useState("all");
  const [menuOpen, setMenuOpen] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [buckets, setBuckets] = useState([]);
  const [period, setPeriod] = useState("30d");
  const [periodTotal, setPeriodTotal] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState("");
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [balRes, invRes] = await Promise.all([
        _stripeApi("balance"),
        _stripeApi("invoices", { limit: 100 })
      ]);
      if (balRes.ok) setBalance(balRes);
      if (invRes.ok) setInvoices(invRes.invoices || []);
      else setError(invRes.error || "Error cargando facturas");
    } catch (e) {
      setError("No se pudo conectar con el servidor. \xBFEst\xE1 mail_server.py en marcha?");
    }
    setLoading(false);
  };
  const loadChart = async (p) => {
    setChartLoading(true);
    try {
      const res = await _stripeApi("revenue", { period: p });
      if (res.ok) {
        setBuckets(res.buckets || []);
        setPeriodTotal(res.total || 0);
      }
    } catch (e) {
    }
    setChartLoading(false);
  };
  const changePeriod = (p) => {
    setPeriod(p);
    loadChart(p);
  };
  React.useEffect(() => {
    load();
    loadChart("30d");
  }, []);
  const filtered = invoices.filter(
    (i) => filter === "all" ? true : filter === "pending" ? i.status === "open" : filter === "paid" ? i.status === "paid" : filter === "void" ? i.status === "void" || i.status === "uncollectible" : true
  );
  const totals = {
    paid: invoices.filter((i) => i.status === "paid").reduce((a, b) => a + b.amount_paid, 0),
    pending: invoices.filter((i) => i.status === "open").reduce((a, b) => a + b.amount, 0),
    draft: invoices.filter((i) => i.status === "draft").length
  };
  const menuBtn = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    width: "100%",
    padding: "7px 10px",
    border: 0,
    background: "transparent",
    color: "var(--text)",
    fontSize: 13,
    borderRadius: 6,
    cursor: "pointer",
    fontFamily: "inherit",
    textAlign: "left"
  };
  return /* @__PURE__ */ React.createElement("div", { className: "page", onClick: () => setMenuOpen(null) }, /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", null, "Facturaci\xF3n"), /* @__PURE__ */ React.createElement("div", { className: "sub", style: { display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement("svg", { width: "32", height: "12", viewBox: "0 0 60 25", style: { opacity: 0.5 } }, /* @__PURE__ */ React.createElement("text", { x: "0", y: "20", fontFamily: "Inter", fontWeight: "700", fontSize: "22", fill: "currentColor" }, "stripe")), loading ? "Cargando\u2026" : error ? "Error de conexi\xF3n" : `${invoices.length} facturas`)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: load, disabled: loading }, /* @__PURE__ */ React.createElement(Icon, { name: "refresh-cw", size: 13 }), " Actualizar"), /* @__PURE__ */ React.createElement("button", { className: "btn primary sm", onClick: () => setShowCreate(true) }, /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 13 }), " Nueva factura"))), error && /* @__PURE__ */ React.createElement("div", { style: {
    display: "flex",
    gap: 10,
    padding: "12px 16px",
    marginBottom: 16,
    background: "var(--red-soft)",
    border: "0.5px solid var(--red)",
    borderRadius: 10,
    fontSize: 13,
    color: "var(--red)"
  } }, /* @__PURE__ */ React.createElement(Icon, { name: "alert-triangle", size: 14, style: { flexShrink: 0, marginTop: 1 } }), error), /* @__PURE__ */ React.createElement("div", { className: "rg-4", style: { marginBottom: 18 } }, /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body" }, /* @__PURE__ */ React.createElement("div", { className: "metric-label" }, "Disponible en Stripe"), /* @__PURE__ */ React.createElement("div", { className: "metric-value" }, balance ? _cents(balance.available) : "\u2014"), /* @__PURE__ */ React.createElement("div", { className: "metric-delta" }, "Saldo liquidado"))), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body" }, /* @__PURE__ */ React.createElement("div", { className: "metric-label" }, "En tr\xE1nsito"), /* @__PURE__ */ React.createElement("div", { className: "metric-value", style: { color: "var(--blue)" } }, balance ? _cents(balance.pending) : "\u2014"), /* @__PURE__ */ React.createElement("div", { className: "metric-delta" }, "Pendiente de liquidar"))), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body" }, /* @__PURE__ */ React.createElement("div", { className: "metric-label" }, "Cobrado (facturas)"), /* @__PURE__ */ React.createElement("div", { className: "metric-value" }, _cents(totals.paid)), /* @__PURE__ */ React.createElement("div", { className: "metric-delta" }, invoices.filter((i) => i.status === "paid").length, " pagadas"))), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body" }, /* @__PURE__ */ React.createElement("div", { className: "metric-label" }, "Por cobrar"), /* @__PURE__ */ React.createElement("div", { className: "metric-value", style: { color: "var(--amber)" } }, _cents(totals.pending)), /* @__PURE__ */ React.createElement("div", { className: "metric-delta" }, invoices.filter((i) => i.status === "open").length, " abiertas")))), /* @__PURE__ */ React.createElement("div", { className: "card", style: { marginBottom: 18 } }, /* @__PURE__ */ React.createElement("div", { className: "card-header" }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 500, fontSize: 13 } }, "Ingresos cobrados"), !chartLoading && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-subtle)", marginTop: 2 } }, _cents(periodTotal), " en ", (_a = PERIODS.find((p) => p.id === period)) == null ? void 0 : _a.label)), /* @__PURE__ */ React.createElement("div", { className: "seg" }, PERIODS.map((p) => /* @__PURE__ */ React.createElement("button", { key: p.id, className: period === p.id ? "active" : "", onClick: () => changePeriod(p.id) }, p.label)))), /* @__PURE__ */ React.createElement("div", { className: "card-body", style: { padding: "20px 32px" } }, /* @__PURE__ */ React.createElement(RevenueChart, { buckets, loading: chartLoading }))), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-header" }, /* @__PURE__ */ React.createElement("div", { className: "seg" }, [{ id: "all", label: "Todas" }, { id: "pending", label: "Pendientes" }, { id: "paid", label: "Pagadas" }, { id: "void", label: "Anuladas" }].map((f) => /* @__PURE__ */ React.createElement("button", { key: f.id, className: filter === f.id ? "active" : "", onClick: () => setFilter(f.id) }, f.label))), /* @__PURE__ */ React.createElement("div", { className: "row tight muted xsmall" }, /* @__PURE__ */ React.createElement("div", { style: { width: 7, height: 7, borderRadius: "50%", background: "var(--green)" } }), "Stripe conectado")), /* @__PURE__ */ React.createElement("div", { className: "card-body flush" }, loading ? /* @__PURE__ */ React.createElement("div", { style: { padding: 60, textAlign: "center", color: "var(--text-subtle)", fontSize: 13 } }, "Cargando facturas\u2026") : filtered.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { icon: "receipt", title: "Sin facturas", sub: "No hay facturas con esos filtros" }) : /* @__PURE__ */ React.createElement("table", { className: "table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "N\xBA"), /* @__PURE__ */ React.createElement("th", null, "Cliente"), /* @__PURE__ */ React.createElement("th", null, "Fecha"), /* @__PURE__ */ React.createElement("th", null, "Vencimiento"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "Importe"), /* @__PURE__ */ React.createElement("th", null, "Estado"), /* @__PURE__ */ React.createElement("th", { style: { width: 50 } }))), /* @__PURE__ */ React.createElement("tbody", null, filtered.map((inv) => /* @__PURE__ */ React.createElement("tr", { key: inv.stripe_id }, /* @__PURE__ */ React.createElement("td", { style: { fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-subtle)" } }, inv.id), /* @__PURE__ */ React.createElement("td", { style: { maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, inv.customer), /* @__PURE__ */ React.createElement("td", { className: "muted" }, _tsDate(inv.created)), /* @__PURE__ */ React.createElement("td", { className: "muted" }, inv.due_date ? _tsDate(inv.due_date) : "\u2014"), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 500 } }, _cents(inv.amount, inv.currency)), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(StripeChip, { status: inv.status })), /* @__PURE__ */ React.createElement("td", { style: { position: "relative" }, onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn ghost icon-only sm",
      onClick: () => setMenuOpen(menuOpen === inv.stripe_id ? null : inv.stripe_id)
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "more-h", size: 13 })
  ), menuOpen === inv.stripe_id && /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    right: 12,
    top: "calc(100% - 6px)",
    zIndex: 10,
    background: "var(--bg-elev)",
    border: "0.5px solid var(--border-strong)",
    borderRadius: 10,
    padding: 4,
    minWidth: 200,
    boxShadow: "0 8px 24px rgba(0,0,0,0.3)"
  } }, inv.pdf_url && /* @__PURE__ */ React.createElement(
    "a",
    {
      href: inv.pdf_url,
      target: "_blank",
      rel: "noreferrer",
      style: { ...menuBtn, textDecoration: "none" },
      onClick: () => setMenuOpen(null)
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "download", size: 13 }),
    " Descargar PDF"
  ), inv.hosted_url && /* @__PURE__ */ React.createElement(
    "a",
    {
      href: inv.hosted_url,
      target: "_blank",
      rel: "noreferrer",
      style: { ...menuBtn, textDecoration: "none" },
      onClick: () => setMenuOpen(null)
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "external-link", size: 13 }),
    " Ver en Stripe"
  ))))))))), /* @__PURE__ */ React.createElement(
    CreateInvoiceModal,
    {
      open: showCreate,
      onClose: () => setShowCreate(false),
      onCreated: () => {
        load();
        loadChart(period);
      }
    }
  ));
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
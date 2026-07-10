(() => {
  // src/agency-project.jsx
  var AgencyProject = ({ projectId, navigate, openModal }) => {
    const D = window.Data;
    D.useStore();
    const toast = useToast();
    const confirm = useConfirm();
    const p = D.PROJECTS.find((x) => x.id === projectId) || D.PROJECTS[0];
    if (!p) {
      return /* @__PURE__ */ React.createElement("div", { className: "page" }, /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", null, "Proyecto"))), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body", style: { padding: 60 } }, /* @__PURE__ */ React.createElement(Empty, { icon: "folder", title: "Sin proyectos", sub: "A\xFAn no tienes proyectos creados." }), /* @__PURE__ */ React.createElement("div", { className: "row", style: { justifyContent: "center", marginTop: 12 } }, /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: () => openModal("newProject") }, /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 13 }), " Crear proyecto")))));
    }
    const phase = D.PHASES[p.phase];
    const [tab, setTab] = useState("plan");
    const [phaseTab, setPhaseTab] = useState(null);
    const [adding, setAdding] = useState(null);
    const [draft, setDraft] = useState("");
    const [dragOver, setDragOver] = useState(null);
    const dragTaskRef = React.useRef(null);
    const [ctxMenu, setCtxMenu] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editDraft, setEditDraft] = useState("");
    const [datePicking, setDatePicking] = useState(null);
    React.useEffect(() => {
      if (!ctxMenu) return;
      const close = () => setCtxMenu(null);
      window.addEventListener("click", close);
      return () => window.removeEventListener("click", close);
    }, [!!ctxMenu]);
    const aiPhases = React.useMemo(() => {
      const cat = window.PROJECT_SERVICES || [];
      const labels = (p.service || "").split(",").map((s) => s.trim()).filter(Boolean);
      const phases = labels.map((lbl) => cat.find((sv) => sv.label === lbl)).filter(Boolean).map((sv) => ({ name: sv.label, tasks: sv.tasks }));
      return phases.length ? phases : null;
    }, [p.id, p.service]);
    const phaseOfTitle = React.useMemo(() => {
      const m = {};
      (aiPhases || []).forEach((ph) => (ph.tasks || []).forEach((t) => {
        m[typeof t === "string" ? t : t.title] = ph.name;
      }));
      return m;
    }, [aiPhases]);
    const taskPhase = (t) => t.phase || phaseOfTitle[t.title] || null;
    React.useEffect(() => {
      if ((aiPhases == null ? void 0 : aiPhases.length) > 0) {
        setPhaseTab((ph) => ph === null ? aiPhases[0].name : ph);
      }
    }, [p.id, aiPhases]);
    const projectTasks = D.TASKS[p.id] || [];
    const liveProgress = projectTasks.length ? Math.round(projectTasks.filter((t) => t.column === "done").length / projectTasks.length * 100) : 0;
    const tasksByCol = {
      todo: projectTasks.filter((t) => t.column === "todo"),
      doing: projectTasks.filter((t) => t.column === "doing"),
      review: projectTasks.filter((t) => t.column === "review"),
      done: projectTasks.filter((t) => t.column === "done")
    };
    const addTaskInline = (col) => {
      if (!draft.trim()) {
        setAdding(null);
        setDraft("");
        return;
      }
      D.addTask({ projectId: p.id, title: draft.trim(), column: col, phase: phaseTab || null });
      toast("Tarea a\xF1adida", "success");
      setDraft("");
      setAdding(null);
    };
    const onDragStart = (taskId) => {
      dragTaskRef.current = taskId;
    };
    const onDragOver = (e, colId) => {
      e.preventDefault();
      setDragOver(colId);
    };
    const onDrop = (e, colId) => {
      e.preventDefault();
      if (dragTaskRef.current) {
        D.moveTask(p.id, dragTaskRef.current, colId);
        dragTaskRef.current = null;
      }
      setDragOver(null);
    };
    const onDragEnd = () => {
      dragTaskRef.current = null;
      setDragOver(null);
    };
    const removeProjectFromHere = async () => {
      const ok = await confirm({
        title: `Eliminar el proyecto "${p.name}"?`,
        body: "Se eliminar\xE1n tambi\xE9n sus tareas y entregables. Esta acci\xF3n no se puede deshacer.",
        confirmLabel: "S\xED, eliminar",
        danger: true
      });
      if (ok) {
        D.deleteProject(p.id);
        toast("Proyecto eliminado", "success");
        navigate("projects");
      }
    };
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "page wide", style: { maxWidth: 1500 } }, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 16 } }, /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: () => navigate("projects") }, /* @__PURE__ */ React.createElement(Icon, { name: "chevron", size: 12, style: { transform: "rotate(180deg)" } }), " Proyectos")), /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "row tight", style: { marginBottom: 6 } }, /* @__PURE__ */ React.createElement("span", { className: "dot " + p.light }), /* @__PURE__ */ React.createElement("span", { className: "muted small" }, p.clientName), /* @__PURE__ */ React.createElement("span", { className: "vdiv" }), /* @__PURE__ */ React.createElement("span", { className: "chip" }, p.service), /* @__PURE__ */ React.createElement("span", { className: "vdiv" }), /* @__PURE__ */ React.createElement("span", { className: "chip" }, phase.label, " \xB7 ", phase.weeks)), /* @__PURE__ */ React.createElement("h1", null, p.name), /* @__PURE__ */ React.createElement("div", { className: "row tight", style: { marginTop: 8, color: "var(--text-muted)", fontSize: 13 } }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement(Icon, { name: "calendar", size: 12 }), " Entrega ", p.deadline), /* @__PURE__ */ React.createElement("span", { className: "vdiv" }), /* @__PURE__ */ React.createElement("span", null, "Revisiones ", p.revisionsUsed, "/2"), /* @__PURE__ */ React.createElement("span", { className: "vdiv" }), /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 80 } }, /* @__PURE__ */ React.createElement("div", { className: "progress" }, /* @__PURE__ */ React.createElement("i", { style: { width: liveProgress + "%" } }))), liveProgress, "%"))), /* @__PURE__ */ React.createElement("div", { className: "row tight" }, /* @__PURE__ */ React.createElement("a", { className: "btn", href: "#", style: { color: "#25D366", borderColor: "#25D36655" } }, /* @__PURE__ */ React.createElement(Icon, { name: "msg-circle", size: 13 }), " WhatsApp"), /* @__PURE__ */ React.createElement("button", { className: "btn" }, /* @__PURE__ */ React.createElement(Icon, { name: "external-link", size: 13 }), " Vista cliente"), /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: () => {
      setTab("tasks");
      setAdding("todo");
    } }, /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 13 }), " Tarea"), /* @__PURE__ */ React.createElement("button", { className: "btn danger", onClick: removeProjectFromHere }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 13 }), " Eliminar"))), /* @__PURE__ */ React.createElement("div", { className: "tabs" }, [
      { id: "plan", label: aiPhases ? `Plan (${aiPhases.length} fases)` : "Plan" },
      { id: "tasks", label: "Tareas internas" },
      { id: "deliverables", label: "Entregables", count: D.DELIVERABLES.filter((d) => d.projectId === p.id).length },
      { id: "files", label: "Archivos" },
      { id: "notes", label: "Notas" }
    ].map((t) => /* @__PURE__ */ React.createElement("div", { key: t.id, className: "tab" + (tab === t.id ? " active" : ""), onClick: () => setTab(t.id) }, t.label, t.count != null ? /* @__PURE__ */ React.createElement("span", { className: "count" }, t.count) : null))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 } }, /* @__PURE__ */ React.createElement("div", null, tab === "plan" && (aiPhases ? /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", { className: "card-title" }, "Roadmap \xB7 ", aiPhases.reduce((n, ph) => {
      var _a;
      return n + (((_a = ph.tasks) == null ? void 0 : _a.length) || 0);
    }, 0), " tareas"), /* @__PURE__ */ React.createElement("div", { className: "row tight" }, aiPhases.map((ph, i) => {
      const titles = (ph.tasks || []).map((t) => typeof t === "string" ? t : t.title);
      const done = projectTasks.filter((t) => titles.includes(t.title) && t.column === "done").length;
      const total = titles.length;
      return /* @__PURE__ */ React.createElement("span", { key: i, className: "chip", style: { fontSize: 11 } }, ph.name, " ", done, "/", total);
    }))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, aiPhases.map((ph, pi) => {
      const titles = (ph.tasks || []).map((t) => typeof t === "string" ? t : t.title);
      const pTasks = projectTasks.filter((t) => titles.includes(t.title));
      const done = pTasks.filter((t) => t.column === "done").length;
      const pct = titles.length ? Math.round(done / titles.length * 100) : 0;
      return /* @__PURE__ */ React.createElement("div", { key: pi, style: { border: "0.5px solid var(--border)", borderRadius: 12, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "11px 16px", background: "var(--bg-elev-2)", display: "flex", alignItems: "center", gap: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 600, fontSize: 14 } }, ph.name), ph.description && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-subtle)", marginTop: 1 } }, ph.description)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-subtle)", flexShrink: 0 } }, done, "/", titles.length), /* @__PURE__ */ React.createElement("div", { style: { width: 72, height: 4, borderRadius: 99, background: "var(--border)", overflow: "hidden", flexShrink: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { width: pct + "%", height: "100%", background: "var(--green)", borderRadius: 99, transition: "width .3s" } }))), /* @__PURE__ */ React.createElement("div", { style: { padding: "8px 12px", display: "flex", flexDirection: "column", gap: 3 } }, (ph.tasks || []).map((task, ti) => {
        const title = typeof task === "string" ? task : task.title;
        const matched = projectTasks.find((t) => t.title === title);
        const isDone = (matched == null ? void 0 : matched.column) === "done";
        const isActive = (matched == null ? void 0 : matched.column) === "doing";
        const isReview = (matched == null ? void 0 : matched.column) === "review";
        return /* @__PURE__ */ React.createElement("div", { key: ti, style: {
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "6px 8px",
          borderRadius: 8,
          fontSize: 13,
          background: isActive ? "rgba(74,222,128,0.06)" : "transparent"
        } }, /* @__PURE__ */ React.createElement("div", { style: {
          width: 16,
          height: 16,
          borderRadius: 5,
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
          background: isDone ? "var(--green)" : "transparent",
          border: isDone ? "none" : "1.5px solid var(--border-strong)"
        } }, isDone && /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 10, style: { color: "#000" } })), /* @__PURE__ */ React.createElement("span", { style: {
          flex: 1,
          textDecoration: isDone ? "line-through" : "none",
          color: isDone ? "var(--text-subtle)" : "var(--text)"
        } }, title), isActive && /* @__PURE__ */ React.createElement("span", { className: "chip green", style: { fontSize: 10, padding: "1px 7px" } }, "En curso"), isReview && /* @__PURE__ */ React.createElement("span", { className: "chip amber", style: { fontSize: 10, padding: "1px 7px" } }, "Revisi\xF3n"));
      })));
    })))) : /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body" }, /* @__PURE__ */ React.createElement("div", { className: "card-title", style: { marginBottom: 14 } }, "Plan del proyecto"), /* @__PURE__ */ React.createElement(Empty, { icon: "list-todo", title: "Sin roadmap generado", sub: "Crea el pr\xF3ximo proyecto con Nora para generar un plan autom\xE1tico." })))), tab === "tasks" && (() => {
      const visibleTasks = aiPhases && phaseTab ? projectTasks.filter((t) => taskPhase(t) === phaseTab) : projectTasks;
      const vByCol = {
        todo: visibleTasks.filter((t) => t.column === "todo"),
        doing: visibleTasks.filter((t) => t.column === "doing"),
        review: visibleTasks.filter((t) => t.column === "review"),
        done: visibleTasks.filter((t) => t.column === "done")
      };
      return /* @__PURE__ */ React.createElement("div", null, aiPhases && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 } }, aiPhases.map((ph, i) => {
        const count = projectTasks.filter((t) => taskPhase(t) === ph.name).length;
        const done = projectTasks.filter((t) => taskPhase(t) === ph.name && t.column === "done").length;
        const isActive = phaseTab === ph.name;
        return /* @__PURE__ */ React.createElement(
          "button",
          {
            key: i,
            onClick: () => setPhaseTab(ph.name),
            className: "chip" + (isActive ? " blue" : ""),
            style: { cursor: "pointer", padding: "5px 12px", fontWeight: isActive ? 600 : 400 }
          },
          ph.name,
          " \xB7 ",
          done,
          "/",
          count
        );
      })), /* @__PURE__ */ React.createElement("div", { className: "kanban" }, [{ id: "todo", label: "Por hacer" }, { id: "doing", label: "En curso" }, { id: "review", label: "Revisi\xF3n" }, { id: "done", label: "Hecho" }].map((c) => /* @__PURE__ */ React.createElement(
        "div",
        {
          key: c.id,
          className: "kanban-col" + (dragOver === c.id ? " drop" : ""),
          onDragOver: (e) => onDragOver(e, c.id),
          onDrop: (e) => onDrop(e, c.id),
          onDragLeave: () => setDragOver(null)
        },
        /* @__PURE__ */ React.createElement("div", { className: "kanban-head" }, /* @__PURE__ */ React.createElement("span", null, c.label), /* @__PURE__ */ React.createElement("span", { className: "row tight" }, /* @__PURE__ */ React.createElement("span", { className: "muted xsmall" }, vByCol[c.id].length), /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only sm", onClick: () => {
          setAdding(c.id);
          setDraft("");
        } }, /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 11 })))),
        /* @__PURE__ */ React.createElement("div", { className: "kanban-body" }, vByCol[c.id].map((t) => /* @__PURE__ */ React.createElement(
          "div",
          {
            key: t.id,
            className: "kanban-card",
            draggable: true,
            onDragStart: () => onDragStart(t.id),
            onDragEnd,
            style: { cursor: "grab" },
            onContextMenu: (e) => {
              e.preventDefault();
              setCtxMenu({ x: e.clientX, y: e.clientY, taskId: t.id });
            }
          },
          editingId === t.id ? /* @__PURE__ */ React.createElement(
            "input",
            {
              autoFocus: true,
              className: "input",
              value: editDraft,
              onChange: (e) => setEditDraft(e.target.value),
              onKeyDown: (e) => {
                if (e.key === "Enter") {
                  D.updateTask(p.id, t.id, { title: editDraft.trim() || t.title });
                  setEditingId(null);
                }
                if (e.key === "Escape") setEditingId(null);
              },
              onBlur: () => {
                if (editDraft.trim()) D.updateTask(p.id, t.id, { title: editDraft.trim() });
                setEditingId(null);
              },
              style: { padding: "4px 6px", fontSize: 13, width: "100%" }
            }
          ) : /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 500 } }, t.title),
          datePicking === t.id && /* @__PURE__ */ React.createElement(
            "input",
            {
              type: "date",
              autoFocus: true,
              className: "input",
              defaultValue: t.deadline || "",
              onChange: (e) => {
                D.updateTask(p.id, t.id, { deadline: e.target.value });
                setDatePicking(null);
              },
              onBlur: () => setDatePicking(null),
              style: { marginTop: 5, fontSize: 12, padding: "3px 6px" }
            }
          ),
          t.deadline && datePicking !== t.id && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-subtle)", marginTop: 3, display: "flex", alignItems: "center", gap: 4 } }, /* @__PURE__ */ React.createElement(Icon, { name: "calendar", size: 10 }), t.deadline),
          taskPhase(t) && !phaseTab && /* @__PURE__ */ React.createElement("div", { className: "muted xsmall", style: { marginTop: 3 } }, "\xB7 ", taskPhase(t)),
          t.assignee && t.assignee !== "T\xFA" && /* @__PURE__ */ React.createElement("div", { className: "muted xsmall" }, "\xB7 ", t.assignee)
        )), adding === c.id && /* @__PURE__ */ React.createElement("div", { className: "kanban-card", style: { padding: 8 } }, /* @__PURE__ */ React.createElement(
          "input",
          {
            autoFocus: true,
            className: "input",
            placeholder: "Nombre de la tarea\u2026",
            value: draft,
            onChange: (e) => setDraft(e.target.value),
            onKeyDown: (e) => {
              if (e.key === "Enter") addTaskInline(c.id);
              if (e.key === "Escape") {
                setAdding(null);
                setDraft("");
              }
            },
            onBlur: () => addTaskInline(c.id),
            style: { padding: "6px 8px", fontSize: 13 }
          }
        )), vByCol[c.id].length === 0 && adding !== c.id && /* @__PURE__ */ React.createElement(
          "button",
          {
            className: "btn ghost sm full",
            style: { justifyContent: "center", color: "var(--text-subtle)", border: "0.5px dashed var(--border-strong)" },
            onClick: () => {
              setAdding(c.id);
              setDraft("");
            }
          },
          /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 11 }),
          " A\xF1adir tarea"
        ))
      ))));
    })(), tab === "deliverables" && /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 } }, D.DELIVERABLES.filter((d) => d.projectId === p.id).map((d) => /* @__PURE__ */ React.createElement("div", { key: d.id, className: "card" }, /* @__PURE__ */ React.createElement("div", { style: { aspectRatio: "16/10", background: d.thumb, borderTopLeftRadius: 10, borderTopRightRadius: 10 } }), /* @__PURE__ */ React.createElement("div", { className: "card-body" }, /* @__PURE__ */ React.createElement("div", { className: "row between" }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 500, fontSize: 13 } }, d.title), /* @__PURE__ */ React.createElement("span", { className: "chip" }, d.version)), /* @__PURE__ */ React.createElement("div", { className: "row between", style: { marginTop: 8 } }, /* @__PURE__ */ React.createElement("span", { className: "subtle xsmall" }, d.type, " \xB7 ", d.date), /* @__PURE__ */ React.createElement(StatusChip, { status: d.status })))))), tab === "files" && /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body flush" }, D.DRIVE_FOLDERS.map((f, i) => /* @__PURE__ */ React.createElement("div", { key: f.name, style: { padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, borderBottom: i === D.DRIVE_FOLDERS.length - 1 ? "0" : "0.5px solid var(--border)" } }, /* @__PURE__ */ React.createElement(Icon, { name: "folder", size: 16, style: { color: "var(--text-muted)" } }), /* @__PURE__ */ React.createElement("div", { className: "grow" }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 500, fontSize: 13 } }, "/", f.name), /* @__PURE__ */ React.createElement("div", { className: "subtle xsmall" }, f.count, " archivos \xB7 ", f.size)))))), tab === "notes" && /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body" }, /* @__PURE__ */ React.createElement("textarea", { className: "textarea", rows: 6, defaultValue: "Notas internas del proyecto\u2026" })))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } }, /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-header" }, /* @__PURE__ */ React.createElement("div", { className: "card-title" }, "Pr\xF3ximos deadlines")), /* @__PURE__ */ React.createElement("div", { className: "card-body", style: { paddingTop: 10, paddingBottom: 10 } }, [{ l: "Mockups v3", d: "7 may", s: "amber" }, { l: "Migraci\xF3n blog", d: "11 may", s: "green" }, { l: "Entrega final", d: "12 jun", s: "green" }].map((d) => /* @__PURE__ */ React.createElement("div", { key: d.l, className: "row tight", style: { padding: "8px 0", borderBottom: "0.5px solid var(--border)" } }, /* @__PURE__ */ React.createElement("span", { className: "dot " + d.s }), /* @__PURE__ */ React.createElement("div", { className: "grow small" }, d.l), /* @__PURE__ */ React.createElement("span", { className: "muted xsmall" }, d.d))))), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-header" }, /* @__PURE__ */ React.createElement("div", { className: "card-title" }, "Comentarios cliente"), /* @__PURE__ */ React.createElement("span", { className: "chip amber", style: { padding: "1px 6px" } }, "2 sin leer")), /* @__PURE__ */ React.createElement("div", { className: "card-body", style: { paddingTop: 10, paddingBottom: 10 } }, /* @__PURE__ */ React.createElement("div", { className: "row tight", style: { padding: "8px 0" } }, /* @__PURE__ */ React.createElement(Avatar, { size: "sm", name: "Ana", initials: "AC", color: "#fb7185" }), /* @__PURE__ */ React.createElement("div", { className: "grow" }, /* @__PURE__ */ React.createElement("div", { className: "small", style: { fontWeight: 500 } }, "Ana Mar\xEDn"), /* @__PURE__ */ React.createElement("div", { className: "subtle xsmall" }, '"Me gusta el hero pero\u2026"'))), /* @__PURE__ */ React.createElement("div", { className: "row tight", style: { padding: "8px 0" } }, /* @__PURE__ */ React.createElement(Avatar, { size: "sm", name: "Ana", initials: "AC", color: "#fb7185" }), /* @__PURE__ */ React.createElement("div", { className: "grow" }, /* @__PURE__ */ React.createElement("div", { className: "small", style: { fontWeight: 500 } }, "Ana Mar\xEDn"), /* @__PURE__ */ React.createElement("div", { className: "subtle xsmall" }, '"\xBFPodemos cambiar la tipo?"'))))), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-header" }, /* @__PURE__ */ React.createElement("div", { className: "card-title" }, "Archivos recientes")), /* @__PURE__ */ React.createElement("div", { className: "card-body", style: { paddingTop: 10, paddingBottom: 10 } }, ["mockups-v3.fig", "copys-home.docx", "brief-acme.pdf"].map((f) => /* @__PURE__ */ React.createElement("div", { key: f, className: "row tight", style: { padding: "7px 0" } }, /* @__PURE__ */ React.createElement(Icon, { name: "file", size: 13, style: { color: "var(--text-muted)" } }), /* @__PURE__ */ React.createElement("div", { className: "grow truncate small" }, f)))))))), ctxMenu && (() => {
      const ctxTask = projectTasks.find((t) => t.id === ctxMenu.taskId);
      if (!ctxTask) return null;
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          onClick: (e) => e.stopPropagation(),
          style: {
            position: "fixed",
            left: ctxMenu.x,
            top: ctxMenu.y,
            zIndex: 300,
            background: "var(--bg-elev-2)",
            border: "0.5px solid var(--border-strong)",
            borderRadius: 10,
            padding: 4,
            minWidth: 180,
            boxShadow: "0 8px 32px rgba(0,0,0,0.35)"
          }
        },
        [
          { label: "Editar nombre", icon: "list-todo", action: () => {
            setEditingId(ctxTask.id);
            setEditDraft(ctxTask.title);
            setCtxMenu(null);
          } },
          { label: "Fecha de vencimiento", icon: "calendar", action: () => {
            setDatePicking(ctxTask.id);
            setCtxMenu(null);
          } }
        ].map((it) => /* @__PURE__ */ React.createElement(
          "button",
          {
            key: it.label,
            onClick: it.action,
            style: {
              display: "flex",
              alignItems: "center",
              gap: 9,
              width: "100%",
              padding: "8px 12px",
              borderRadius: 7,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              color: "var(--text)",
              textAlign: "left"
            },
            onMouseEnter: (e) => e.currentTarget.style.background = "var(--bg-hover)",
            onMouseLeave: (e) => e.currentTarget.style.background = "none"
          },
          /* @__PURE__ */ React.createElement(Icon, { name: it.icon, size: 13, style: { color: "var(--text-subtle)" } }),
          it.label
        )),
        /* @__PURE__ */ React.createElement("div", { style: { height: 1, background: "var(--border)", margin: "3px 4px" } }),
        /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: () => {
              D.deleteTask(p.id, ctxTask.id);
              setCtxMenu(null);
              toast("Tarea eliminada", "success");
            },
            style: {
              display: "flex",
              alignItems: "center",
              gap: 9,
              width: "100%",
              padding: "8px 12px",
              borderRadius: 7,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              color: "var(--red)",
              textAlign: "left"
            },
            onMouseEnter: (e) => e.currentTarget.style.background = "rgba(239,68,68,0.08)",
            onMouseLeave: (e) => e.currentTarget.style.background = "none"
          },
          /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 13 }),
          "Eliminar tarea"
        )
      );
    })());
  };
  window.AgencyProject = AgencyProject;
})();

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
    const [addingPhase, setAddingPhase] = useState(null);
    const [draft, setDraft] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editDraft, setEditDraft] = useState("");
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
    const projectTasks = D.TASKS[p.id] || [];
    const doneCount = projectTasks.filter((t) => t.column === "done").length;
    const liveProgress = projectTasks.length ? Math.round(doneCount / projectTasks.length * 100) : 0;
    const phaseNames = (aiPhases || []).map((ph) => ph.name);
    const groups = phaseNames.map((name) => ({
      name,
      tasks: projectTasks.filter((t) => taskPhase(t) === name)
    }));
    const otherTasks = projectTasks.filter((t) => !phaseNames.includes(taskPhase(t)));
    if (otherTasks.length || !aiPhases) {
      groups.push({ name: "__otras__", label: aiPhases ? "Otras tareas" : "Tareas", tasks: otherTasks });
    }
    const toggleTask = (t) => {
      D.moveTask(p.id, t.id, t.column === "done" ? "todo" : "done");
    };
    const addTaskInline = (phaseName) => {
      if (!draft.trim()) {
        setAddingPhase(null);
        setDraft("");
        return;
      }
      D.addTask({
        projectId: p.id,
        title: draft.trim(),
        column: "todo",
        phase: phaseName === "__otras__" ? null : phaseName
      });
      setDraft("");
      setAddingPhase(null);
    };
    const removeProjectFromHere = async () => {
      const ok = await confirm({
        title: `Eliminar el proyecto "${p.name}"?`,
        body: "Se eliminar\xE1n tambi\xE9n sus tareas. Esta acci\xF3n no se puede deshacer.",
        confirmLabel: "S\xED, eliminar",
        danger: true
      });
      if (ok) {
        D.deleteProject(p.id);
        toast("Proyecto eliminado", "success");
        navigate("projects");
      }
    };
    return /* @__PURE__ */ React.createElement("div", { className: "page", style: { maxWidth: 760 } }, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 16 } }, /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: () => navigate("projects") }, /* @__PURE__ */ React.createElement(Icon, { name: "chevron", size: 12, style: { transform: "rotate(180deg)" } }), " Proyectos")), /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "row tight", style: { marginBottom: 6 } }, /* @__PURE__ */ React.createElement("span", { className: "dot " + p.light }), /* @__PURE__ */ React.createElement("span", { className: "muted small" }, p.clientName), p.deadline && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { className: "vdiv" }), /* @__PURE__ */ React.createElement("span", { className: "muted small" }, /* @__PURE__ */ React.createElement(Icon, { name: "calendar", size: 12 }), " Entrega ", p.deadline))), /* @__PURE__ */ React.createElement("h1", null, p.name)), /* @__PURE__ */ React.createElement("div", { className: "row tight" }, /* @__PURE__ */ React.createElement("button", { className: "btn danger", onClick: removeProjectFromHere }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 13 }), " Eliminar"))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12, margin: "4px 0 22px" } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1, height: 6, borderRadius: 99, background: "var(--border)", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { width: liveProgress + "%", height: "100%", background: "var(--green)", borderRadius: 99, transition: "width .3s" } })), /* @__PURE__ */ React.createElement("span", { className: "muted small", style: { flexShrink: 0 } }, doneCount, "/", projectTasks.length, " \xB7 ", liveProgress, "%")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 16 } }, groups.map((g, gi) => {
      const gDone = g.tasks.filter((t) => t.column === "done").length;
      const gPct = g.tasks.length ? Math.round(gDone / g.tasks.length * 100) : 0;
      const isAdding = addingPhase === g.name;
      return /* @__PURE__ */ React.createElement("div", { key: g.name, className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12, marginBottom: g.tasks.length || isAdding ? 12 : 0 } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1, fontWeight: 600, fontSize: 15 } }, g.label || g.name), /* @__PURE__ */ React.createElement("div", { className: "muted xsmall", style: { flexShrink: 0 } }, gDone, "/", g.tasks.length), /* @__PURE__ */ React.createElement("div", { style: { width: 64, height: 4, borderRadius: 99, background: "var(--border)", overflow: "hidden", flexShrink: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { width: gPct + "%", height: "100%", background: "var(--green)", borderRadius: 99, transition: "width .3s" } }))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column" } }, g.tasks.map((t) => {
        const isDone = t.column === "done";
        return /* @__PURE__ */ React.createElement(
          "div",
          {
            key: t.id,
            className: "task-row",
            style: { display: "flex", alignItems: "center", gap: 11, padding: "9px 4px", borderTop: "0.5px solid var(--border)" }
          },
          /* @__PURE__ */ React.createElement(
            "button",
            {
              onClick: () => toggleTask(t),
              style: {
                flexShrink: 0,
                width: 19,
                height: 19,
                borderRadius: 6,
                cursor: "pointer",
                padding: 0,
                display: "grid",
                placeItems: "center",
                background: isDone ? "var(--green)" : "transparent",
                border: isDone ? "none" : "1.5px solid var(--border-strong)"
              }
            },
            isDone && /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 11, style: { color: "#000" } })
          ),
          editingId === t.id ? /* @__PURE__ */ React.createElement(
            "input",
            {
              autoFocus: true,
              className: "input",
              value: editDraft,
              onChange: (e) => setEditDraft(e.target.value),
              onKeyDown: (e) => {
                if (e.key === "Enter") {
                  if (editDraft.trim()) D.updateTask(p.id, t.id, { title: editDraft.trim() });
                  setEditingId(null);
                }
                if (e.key === "Escape") setEditingId(null);
              },
              onBlur: () => {
                if (editDraft.trim()) D.updateTask(p.id, t.id, { title: editDraft.trim() });
                setEditingId(null);
              },
              style: { flex: 1, padding: "4px 6px", fontSize: 14 }
            }
          ) : /* @__PURE__ */ React.createElement(
            "span",
            {
              onClick: () => {
                setEditingId(t.id);
                setEditDraft(t.title);
              },
              style: {
                flex: 1,
                fontSize: 14,
                cursor: "text",
                textDecoration: isDone ? "line-through" : "none",
                color: isDone ? "var(--text-subtle)" : "var(--text)"
              }
            },
            t.title
          ),
          /* @__PURE__ */ React.createElement(
            "button",
            {
              className: "task-del btn ghost icon-only sm",
              onClick: () => {
                D.deleteTask(p.id, t.id);
              },
              style: { flexShrink: 0, color: "var(--text-subtle)" }
            },
            /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 12 })
          )
        );
      }), isAdding ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 11, padding: "9px 4px", borderTop: g.tasks.length ? "0.5px solid var(--border)" : "none" } }, /* @__PURE__ */ React.createElement("span", { style: { flexShrink: 0, width: 19, height: 19, borderRadius: 6, border: "1.5px dashed var(--border-strong)" } }), /* @__PURE__ */ React.createElement(
        "input",
        {
          autoFocus: true,
          className: "input",
          placeholder: "Nombre de la tarea\u2026",
          value: draft,
          onChange: (e) => setDraft(e.target.value),
          onKeyDown: (e) => {
            if (e.key === "Enter") addTaskInline(g.name);
            if (e.key === "Escape") {
              setAddingPhase(null);
              setDraft("");
            }
          },
          onBlur: () => addTaskInline(g.name),
          style: { flex: 1, padding: "5px 8px", fontSize: 14 }
        }
      )) : /* @__PURE__ */ React.createElement(
        "button",
        {
          className: "btn ghost sm",
          onClick: () => {
            setAddingPhase(g.name);
            setDraft("");
          },
          style: { justifyContent: "flex-start", color: "var(--text-subtle)", marginTop: g.tasks.length ? 6 : 0, padding: "7px 4px" }
        },
        /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 12 }),
        " A\xF1adir tarea"
      ))));
    })));
  };
  window.AgencyProject = AgencyProject;
})();

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
    const phase = D.PHASES[p.phase] || D.PHASES[0] || { label: "", weeks: "" };
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
    const [driveTick, setDriveTick] = useState(0);
    const [driveEditing, setDriveEditing] = useState(false);
    const [driveDraft, setDriveDraft] = useState("");
    React.useEffect(() => {
      if (!ctxMenu) return;
      const close = () => setCtxMenu(null);
      window.addEventListener("click", close);
      return () => window.removeEventListener("click", close);
    }, [!!ctxMenu]);
    const aiPhases = React.useMemo(() => {
      const names = (p.service || "").split(",").map((s) => s.trim()).filter((n) => n && n !== "libre" && n !== "\u2014");
      return names.length ? names.map((n) => ({ name: n })) : null;
    }, [p.id, p.service]);
    const taskPhase = (t) => t.phase || null;
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
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "page" }, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 16 } }, /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: () => navigate("projects") }, /* @__PURE__ */ React.createElement(Icon, { name: "chevron", size: 12, style: { transform: "rotate(180deg)" } }), " Proyectos")), /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "row tight", style: { marginBottom: 6 } }, /* @__PURE__ */ React.createElement("span", { className: "dot " + p.light }), /* @__PURE__ */ React.createElement("span", { className: "muted small" }, p.clientName), p.recurring && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { className: "vdiv" }), /* @__PURE__ */ React.createElement("span", { className: "chip", style: { fontSize: 11, color: "var(--accent)" } }, /* @__PURE__ */ React.createElement(Icon, { name: "refresh-cw", size: 10 }), " Mensual")), aiPhases && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { className: "vdiv" }), /* @__PURE__ */ React.createElement("span", { className: "muted small" }, aiPhases.length, " fase", aiPhases.length === 1 ? "" : "s"))), /* @__PURE__ */ React.createElement("h1", null, p.name), /* @__PURE__ */ React.createElement("div", { className: "row tight", style: { marginTop: 8, color: "var(--text-muted)", fontSize: 13 } }, p.deadline && p.deadline !== "\u2014" && /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement(Icon, { name: "calendar", size: 12 }), " Entrega ", p.deadline), p.deadline && p.deadline !== "\u2014" && /* @__PURE__ */ React.createElement("span", { className: "vdiv" }), /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 80 } }, /* @__PURE__ */ React.createElement("div", { className: "progress" }, /* @__PURE__ */ React.createElement("i", { style: { width: liveProgress + "%" } }))), liveProgress, "%"))), /* @__PURE__ */ React.createElement("div", { className: "row tight" }, /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: () => {
      setTab("tasks");
      setAdding("todo");
    } }, /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 13 }), " Tarea"), /* @__PURE__ */ React.createElement("button", { className: "btn danger", onClick: removeProjectFromHere }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 13 }), " Eliminar"))), /* @__PURE__ */ React.createElement("div", { className: "tabs" }, [
      { id: "plan", label: aiPhases ? `Plan (${aiPhases.length} fases)` : "Plan" },
      { id: "tasks", label: "Tablero" },
      { id: "files", label: "Archivos" }
    ].map((t) => /* @__PURE__ */ React.createElement("div", { key: t.id, className: "tab" + (tab === t.id ? " active" : ""), onClick: () => setTab(t.id) }, t.label, t.count != null ? /* @__PURE__ */ React.createElement("span", { className: "count" }, t.count) : null))), /* @__PURE__ */ React.createElement("div", null, tab === "plan" && (() => {
      const phaseNames = (aiPhases || []).map((ph) => ph.name);
      const planGroups = phaseNames.map((name) => ({
        name,
        label: name,
        tasks: projectTasks.filter((t) => taskPhase(t) === name)
      }));
      const otras = projectTasks.filter((t) => !phaseNames.includes(taskPhase(t)));
      if (otras.length) planGroups.push({ name: "__otras__", label: "Otras tareas", tasks: otras });
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      const MES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
      const parseD = (s) => {
        if (!s) return null;
        const d = /* @__PURE__ */ new Date(s + "T12:00:00");
        return isNaN(d.getTime()) ? null : d;
      };
      const dateInfo = (s) => {
        const d = parseD(s);
        if (!d) return null;
        const diff = Math.round((d - today) / 864e5);
        const label = `${d.getDate()} ${MES[d.getMonth()]}`;
        if (diff < 0) return { label, tag: `Vencida (${-diff}d)`, color: "var(--red)" };
        if (diff === 0) return { label, tag: "Hoy", color: "var(--amber)" };
        if (diff <= 7) return { label, tag: `En ${diff}d`, color: "var(--amber)" };
        return { label, tag: "", color: "var(--text-subtle)" };
      };
      const upcoming = projectTasks.filter((t) => t.deadline && t.column !== "done").map((t) => ({ t, info: dateInfo(t.deadline) })).filter((x) => x.info).sort((a, b) => parseD(a.t.deadline) - parseD(b.t.deadline));
      const phaseStatus = (done, total) => {
        if (total === 0) return { label: "Sin tareas", cls: "" };
        if (done === total) return { label: "Completada", cls: "green" };
        if (done > 0) return { label: "En curso", cls: "blue" };
        return { label: "Sin empezar", cls: "" };
      };
      return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 16 } }, /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body" }, /* @__PURE__ */ React.createElement("div", { className: "card-title", style: { marginBottom: 14 } }, "Fases del proyecto"), planGroups.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { icon: "list-todo", title: "Sin fases", sub: "Este proyecto no tiene fases. A\xF1ade tareas desde el Tablero." }) : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, planGroups.map((g, i) => {
        const gDone = g.tasks.filter((t) => t.column === "done").length;
        const gPct = g.tasks.length ? Math.round(gDone / g.tasks.length * 100) : 0;
        const st = phaseStatus(gDone, g.tasks.length);
        const isReal = g.name !== "__otras__";
        return /* @__PURE__ */ React.createElement(
          "div",
          {
            key: g.name,
            onClick: () => {
              if (isReal) {
                setTab("tasks");
                setPhaseTab(g.name);
              }
            },
            style: {
              border: "0.5px solid var(--border)",
              borderRadius: 12,
              padding: "14px 16px",
              cursor: isReal ? "pointer" : "default",
              transition: "background .12s"
            },
            onMouseEnter: (e) => {
              if (isReal) e.currentTarget.style.background = "var(--bg-elev-2)";
            },
            onMouseLeave: (e) => e.currentTarget.style.background = "transparent"
          },
          /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 } }, /* @__PURE__ */ React.createElement("span", { style: {
            width: 22,
            height: 22,
            borderRadius: 99,
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            fontSize: 11,
            fontWeight: 600,
            background: gPct === 100 ? "var(--green)" : "var(--bg-elev-2)",
            color: gPct === 100 ? "#000" : "var(--text-subtle)",
            border: gPct === 100 ? "none" : "0.5px solid var(--border-strong)"
          } }, gPct === 100 ? /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 12 }) : isReal ? i + 1 : "\xB7"), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, fontWeight: 600, fontSize: 14.5 } }, g.label), /* @__PURE__ */ React.createElement("span", { className: "chip" + (st.cls ? " " + st.cls : ""), style: { fontSize: 11 } }, st.label), isReal && /* @__PURE__ */ React.createElement(Icon, { name: "chevron", size: 13, style: { color: "var(--text-subtle)", flexShrink: 0 } })),
          /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1, height: 6, borderRadius: 99, background: "var(--border)", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { width: gPct + "%", height: "100%", background: gPct === 100 ? "var(--green)" : "var(--primary-600, #8277db)", borderRadius: 99, transition: "width .3s" } })), /* @__PURE__ */ React.createElement("span", { className: "muted xsmall", style: { flexShrink: 0, width: 64, textAlign: "right" } }, gDone, "/", g.tasks.length, " \xB7 ", gPct, "%"))
        );
      })))), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body" }, /* @__PURE__ */ React.createElement("div", { className: "card-title", style: { marginBottom: 12 } }, "Pr\xF3ximos vencimientos"), upcoming.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "muted small", style: { padding: "6px 0" } }, "No hay tareas con fecha pendientes. A\xF1ade fechas a las tareas desde el Tablero (men\xFA de cada tarea).") : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column" } }, upcoming.map(({ t, info }, i) => /* @__PURE__ */ React.createElement("div", { key: t.id, className: "row tight", style: { padding: "10px 0", borderTop: i === 0 ? "none" : "0.5px solid var(--border)" } }, /* @__PURE__ */ React.createElement("span", { style: { width: 8, height: 8, borderRadius: 99, background: info.color, flexShrink: 0 } }), /* @__PURE__ */ React.createElement("div", { className: "grow", style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { className: "small truncate" }, t.title), taskPhase(t) && /* @__PURE__ */ React.createElement("div", { className: "subtle xsmall" }, taskPhase(t))), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right", flexShrink: 0 } }, /* @__PURE__ */ React.createElement("div", { className: "small", style: { fontWeight: 500 } }, info.label), info.tag && /* @__PURE__ */ React.createElement("div", { className: "xsmall", style: { color: info.color } }, info.tag))))))));
    })(), tab === "tasks" && (() => {
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
    })(), tab === "files" && (() => {
      const driveKey = "proj_drive_" + p.id;
      const driveUrl = typeof localStorage !== "undefined" && localStorage.getItem(driveKey) || "";
      const saveDrive = (url) => {
        const v = (url || "").trim();
        if (v) localStorage.setItem(driveKey, v);
        else localStorage.removeItem(driveKey);
        setDriveEditing(false);
        setDriveDraft("");
        setDriveTick((x) => x + 1);
      };
      return /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body" }, /* @__PURE__ */ React.createElement("div", { className: "row between", style: { marginBottom: 4 } }, /* @__PURE__ */ React.createElement("div", { className: "card-title" }, "Carpeta del proyecto"), driveUrl && !driveEditing && /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: () => {
        setDriveDraft(driveUrl);
        setDriveEditing(true);
      } }, /* @__PURE__ */ React.createElement(Icon, { name: "edit", size: 12 }), " Editar")), driveUrl && !driveEditing ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12, marginTop: 8 } }, /* @__PURE__ */ React.createElement("div", { style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 16px",
        borderRadius: 12,
        background: "var(--bg-elev-2)",
        border: "0.5px solid var(--border)"
      } }, /* @__PURE__ */ React.createElement("div", { style: {
        width: 38,
        height: 38,
        borderRadius: 10,
        flexShrink: 0,
        display: "grid",
        placeItems: "center",
        background: "rgba(158,154,229,0.14)",
        color: "var(--accent)"
      } }, /* @__PURE__ */ React.createElement(Icon, { name: "folder", size: 18 })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 500, fontSize: 14 } }, "Carpeta de Drive"), /* @__PURE__ */ React.createElement("div", { className: "subtle xsmall truncate" }, driveUrl))), /* @__PURE__ */ React.createElement("div", { className: "row tight" }, /* @__PURE__ */ React.createElement("a", { className: "btn primary", href: driveUrl, target: "_blank", rel: "noreferrer" }, /* @__PURE__ */ React.createElement(Icon, { name: "external-link", size: 13 }), " Abrir carpeta"), /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: () => {
        try {
          navigator.clipboard.writeText(driveUrl);
          toast("Enlace copiado para el cliente", "success");
        } catch (e) {
          toast("No se pudo copiar", "error");
        }
      } }, /* @__PURE__ */ React.createElement(Icon, { name: "paperclip", size: 13 }), " Copiar enlace para el cliente")), /* @__PURE__ */ React.createElement("div", { className: "muted xsmall" }, "El cliente puede acceder a la carpeta con este enlace.")) : driveEditing ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10, marginTop: 10 } }, /* @__PURE__ */ React.createElement(
        "input",
        {
          autoFocus: true,
          className: "input",
          placeholder: "Pega el enlace de la carpeta de Drive\u2026",
          value: driveDraft,
          onChange: (e) => setDriveDraft(e.target.value),
          onKeyDown: (e) => {
            if (e.key === "Enter") saveDrive(driveDraft);
            if (e.key === "Escape") setDriveEditing(false);
          }
        }
      ), /* @__PURE__ */ React.createElement("div", { className: "row tight" }, /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: () => saveDrive(driveDraft) }, /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 12 }), " Guardar"), /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: () => setDriveEditing(false) }, "Cancelar"))) : /* @__PURE__ */ React.createElement("div", { style: { marginTop: 8 } }, /* @__PURE__ */ React.createElement(
        Empty,
        {
          icon: "folder",
          title: "Sin carpeta todav\xEDa",
          sub: "Pega el enlace de la carpeta de Drive del proyecto para compartirla con el cliente."
        }
      ), /* @__PURE__ */ React.createElement("div", { className: "row", style: { justifyContent: "center", marginTop: 12 } }, /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: () => {
        setDriveDraft("");
        setDriveEditing(true);
      } }, /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 13 }), " A\xF1adir carpeta de Drive")))));
    })())), ctxMenu && (() => {
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

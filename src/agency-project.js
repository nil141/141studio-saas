(() => {
  // src/agency-project.jsx
  var _PM_MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  var _pmIsoToShort = (iso) => {
    if (!iso) return "";
    const d = /* @__PURE__ */ new Date(iso + "T12:00:00");
    return isNaN(d) ? "" : `${d.getDate()} ${_PM_MESES[d.getMonth()]}`;
  };
  var EditProjectModal = ({ project, onClose }) => {
    const D = window.Data;
    const toast = useToast();
    const [name, setName] = useState(project.name || "");
    const [clientId, setClientId] = useState(project.clientId || "");
    const [recurring, setRecurring] = useState(!!project.recurring);
    const [deadline, setDeadline] = useState("");
    const [figmaUrl, setFigmaUrl] = useState(project.figmaUrl || "");
    const [figmaPhase, setFigmaPhase] = useState(project.figmaPhase || "");
    const [pickClient, setPickClient] = useState(false);
    const phaseNames = (project.service || "").split(",").map((s) => s.trim()).filter((n) => n && n !== "libre" && n !== "\u2014");
    const clients = D.CLIENTS || [];
    const selClient = clientId ? clients.find((c) => c.id === clientId) : null;
    const save = () => {
      if (!name.trim()) {
        toast("Ponle un nombre al proyecto", "warn");
        return;
      }
      const cl = clientId ? clients.find((c) => c.id === clientId) : null;
      const changes = {
        name: name.trim(),
        clientId: clientId || null,
        clientName: cl ? cl.company || cl.name || "\u2014" : "Interno",
        recurring,
        figmaUrl: figmaUrl.trim(),
        figmaPhase: figmaUrl.trim() ? figmaPhase : ""
      };
      if (recurring) changes.deadline = "";
      else if (deadline) changes.deadline = _pmIsoToShort(deadline);
      D.updateProject(project.id, changes);
      toast("Proyecto actualizado", "success");
      onClose();
    };
    return /* @__PURE__ */ React.createElement(
      Modal,
      {
        open: true,
        onClose,
        title: "Editar proyecto",
        footer: /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end", width: "100%" } }, /* @__PURE__ */ React.createElement("button", { className: "btn ghost", onClick: onClose }, "Cancelar"), /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: save }, /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 13 }), " Guardar"))
      },
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Nombre del proyecto"), /* @__PURE__ */ React.createElement("input", { className: "input", value: name, onChange: (e) => setName(e.target.value), autoFocus: true })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Enlace de Figma (dise\xF1o)"), /* @__PURE__ */ React.createElement(
        "input",
        {
          className: "input",
          value: figmaUrl,
          onChange: (e) => setFigmaUrl(e.target.value),
          placeholder: "https://www.figma.com/file/\u2026"
        }
      ), /* @__PURE__ */ React.createElement("div", { className: "muted xsmall", style: { marginTop: 5, lineHeight: 1.5 } }, "En Figma: Share \u2192 \xABAnyone with the link\xBB \u2192 Copy link. El cliente ver\xE1 el dise\xF1o incrustado en \xABEstado del proyecto\xBB.")), figmaUrl.trim() && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Mostrar el dise\xF1o en la fase"), /* @__PURE__ */ React.createElement("select", { className: "input", value: figmaPhase, onChange: (e) => setFigmaPhase(e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "Autom\xE1tico (fase de dise\xF1o o la fase en curso)"), phaseNames.map((n) => /* @__PURE__ */ React.createElement("option", { key: n, value: n }, n))), /* @__PURE__ */ React.createElement("div", { className: "muted xsmall", style: { marginTop: 5, lineHeight: 1.5 } }, "Elige en qu\xE9 fase del proyecto aparece el bot\xF3n \xABVer el dise\xF1o en Figma\xBB para el cliente.")), /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Cliente ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-subtle)", fontWeight: 400 } }, "(opcional)")), /* @__PURE__ */ React.createElement("button", { className: "input row tight", style: { textAlign: "left", height: 38 }, onClick: () => setPickClient((s) => !s) }, /* @__PURE__ */ React.createElement("span", { className: "grow", style: { textAlign: "left", color: selClient ? "var(--text)" : "var(--text-muted)" } }, selClient ? selClient.company || selClient.name : "Sin cliente \xB7 proyecto interno"), /* @__PURE__ */ React.createElement(Icon, { name: "chevron", size: 12, style: { transform: "rotate(90deg)" } })), pickClient && /* @__PURE__ */ React.createElement("div", { style: {
        marginTop: 6,
        background: "var(--bg-elev-2)",
        border: "0.5px solid var(--border-strong)",
        borderRadius: 10,
        overflow: "hidden",
        maxHeight: 200,
        overflowY: "auto"
      } }, /* @__PURE__ */ React.createElement(
        "div",
        {
          onClick: () => {
            setClientId("");
            setPickClient(false);
          },
          style: { padding: "8px 12px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13 },
          onMouseEnter: (e) => e.currentTarget.style.background = "var(--bg-hover)",
          onMouseLeave: (e) => e.currentTarget.style.background = "transparent"
        },
        /* @__PURE__ */ React.createElement("span", { className: "grow" }, "Sin cliente \xB7 proyecto interno"),
        !clientId && /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 13 })
      ), clients.map((c) => /* @__PURE__ */ React.createElement(
        "div",
        {
          key: c.id,
          onClick: () => {
            setClientId(c.id);
            setPickClient(false);
          },
          style: { padding: "8px 12px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13 },
          onMouseEnter: (e) => e.currentTarget.style.background = "var(--bg-hover)",
          onMouseLeave: (e) => e.currentTarget.style.background = "transparent"
        },
        /* @__PURE__ */ React.createElement("span", { className: "grow" }, [c.name, c.company].filter(Boolean).join(" \xB7 ")),
        c.id === clientId && /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 13 })
      )))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Tipo"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 } }, [{ id: false, title: "Puntual", icon: "flag" }, { id: true, title: "Recurrente", icon: "refresh-cw" }].map((opt) => {
        const on = recurring === opt.id;
        return /* @__PURE__ */ React.createElement("button", { key: String(opt.id), onClick: () => setRecurring(opt.id), style: {
          display: "flex",
          alignItems: "center",
          gap: 9,
          textAlign: "left",
          padding: "10px 12px",
          borderRadius: 12,
          cursor: "pointer",
          fontFamily: "inherit",
          background: on ? "rgba(158,154,229,0.14)" : "rgba(255,255,255,0.03)",
          border: on ? "0.5px solid rgba(158,154,229,0.5)" : "0.5px solid var(--border)",
          color: on ? "var(--text)" : "var(--text-muted)",
          transition: "all .12s"
        } }, /* @__PURE__ */ React.createElement(Icon, { name: opt.icon, size: 14, strokeWidth: 1.7, style: { color: on ? "var(--accent)" : "var(--text-subtle)" } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13 } }, opt.title));
      }))), !recurring && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Fecha de entrega"), /* @__PURE__ */ React.createElement("input", { className: "input", type: "date", value: deadline, onChange: (e) => setDeadline(e.target.value) }), project.deadline && project.deadline !== "\u2014" && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--text-subtle)", marginTop: 5 } }, "Actual: ", project.deadline, deadline ? "" : " \xB7 d\xE9jalo vac\xEDo para mantenerla")))
    );
  };
  var _eurP = (n) => "\u20AC" + (Number(n) || 0).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var ProjectPayments = ({ project }) => {
    const D = window.Data;
    const toast = useToast();
    const payments = project.payments || [];
    const [editing, setEditing] = useState(false);
    const [price, setPrice] = useState(String(project.amount || ""));
    const [plan, setPlan] = useState("5050");
    const savePlan = () => {
      const amt = Number(price) || 0;
      if (amt <= 0) {
        toast("Pon un precio mayor que 0", "warn");
        return;
      }
      D.updateProject(project.id, { amount: amt, payments: D.buildPayments(amt, plan) });
      setEditing(false);
      toast("Plan de cobro guardado", "success");
    };
    const togglePaid = (payId) => {
      const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
      const next = payments.map((p) => p.id === payId ? { ...p, paid: !p.paid, paidDate: !p.paid ? today : null } : p);
      D.updateProject(project.id, { payments: next });
    };
    const cardStyle = { background: "var(--bg-elev-1)", border: "0.5px solid var(--border)", borderRadius: 16, padding: "16px 18px", marginBottom: 22 };
    const total = payments.reduce((a, p) => a + (Number(p.amount) || 0), 0) || Number(project.amount) || 0;
    const cobrado = payments.filter((p) => p.paid).reduce((a, p) => a + (Number(p.amount) || 0), 0);
    const pend = total - cobrado;
    if (editing || payments.length === 0) {
      if (!editing) {
        return /* @__PURE__ */ React.createElement("div", { style: cardStyle }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, color: "var(--text)", letterSpacing: "-0.3px" } }, "Cobro del proyecto"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-subtle)", marginTop: 2 } }, "A\xF1ade el precio cerrado y c\xF3mo lo cobras.")), /* @__PURE__ */ React.createElement("button", { className: "btn sm", onClick: () => {
          setPrice(String(project.amount || ""));
          setEditing(true);
        } }, /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 12 }), " A\xF1adir cobro")));
      }
      return /* @__PURE__ */ React.createElement("div", { style: cardStyle }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, color: "var(--text)", letterSpacing: "-0.3px", marginBottom: 12 } }, "Cobro del proyecto"), /* @__PURE__ */ React.createElement("div", { className: "label" }, "Precio cerrado"), /* @__PURE__ */ React.createElement("div", { style: { position: "relative", maxWidth: 200, marginBottom: 12 } }, /* @__PURE__ */ React.createElement("span", { style: { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)", fontSize: 14 } }, "\u20AC"), /* @__PURE__ */ React.createElement(
        "input",
        {
          className: "input",
          type: "number",
          min: "0",
          step: "any",
          placeholder: "Ej. 1500",
          value: price,
          onChange: (e) => setPrice(e.target.value),
          style: { paddingLeft: 26 },
          autoFocus: true
        }
      )), /* @__PURE__ */ React.createElement("div", { className: "label" }, "C\xF3mo se cobra"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 } }, Object.entries(D.PAY_PLANS).map(([id, pl]) => {
        const on = plan === id;
        return /* @__PURE__ */ React.createElement("button", { key: id, onClick: () => setPlan(id), style: {
          textAlign: "left",
          padding: "9px 11px",
          borderRadius: 11,
          cursor: "pointer",
          fontFamily: "inherit",
          background: on ? "rgba(158,154,229,0.14)" : "rgba(255,255,255,0.03)",
          border: on ? "0.5px solid rgba(158,154,229,0.5)" : "0.5px solid var(--border)"
        } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: on ? "var(--text)" : "var(--text-muted)" } }, pl.label), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "var(--text-subtle)", marginTop: 1 } }, pl.desc));
      })), Number(price) > 0 && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 10, display: "flex", flexDirection: "column", gap: 4 } }, D.buildPayments(Number(price), plan).map((p, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)" } }, /* @__PURE__ */ React.createElement("span", null, p.label, " ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-subtle)" } }, "\xB7 ", p.pct, "%")), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text)" } }, _eurP(p.amount))))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 14 } }, /* @__PURE__ */ React.createElement("button", { className: "btn primary sm", onClick: savePlan }, /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 12 }), " Guardar"), payments.length > 0 && /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: () => setEditing(false) }, "Cancelar")));
    }
    return /* @__PURE__ */ React.createElement("div", { style: cardStyle }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, color: "var(--text)", letterSpacing: "-0.3px" } }, "Cobro del proyecto ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-subtle)", fontWeight: 400 } }, "\xB7 ", _eurP(total))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-muted)", letterSpacing: "-0.2px" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--accent)" } }, _eurP(cobrado)), " cobrado", pend > 5e-3 && /* @__PURE__ */ React.createElement("span", null, " \xB7 ", _eurP(pend), " pendiente"), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          setPrice(String(project.amount || ""));
          setEditing(true);
        },
        title: "Editar plan",
        style: {
          marginLeft: 10,
          background: "transparent",
          border: 0,
          cursor: "pointer",
          color: "var(--text-subtle)",
          padding: 0,
          verticalAlign: "middle"
        }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "edit", size: 12 })
    ))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 2 } }, payments.map((p) => /* @__PURE__ */ React.createElement("div", { key: p.id, style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "9px 2px",
      borderTop: "0.5px solid var(--border)"
    } }, /* @__PURE__ */ React.createElement("button", { onClick: () => togglePaid(p.id), title: p.paid ? "Marcar pendiente" : "Marcar cobrado", style: {
      width: 22,
      height: 22,
      borderRadius: 99,
      flexShrink: 0,
      cursor: "pointer",
      padding: 0,
      display: "grid",
      placeItems: "center",
      background: p.paid ? "var(--accent)" : "transparent",
      border: p.paid ? "0.5px solid var(--accent)" : "0.5px solid var(--border-strong)"
    } }, p.paid && /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 12, style: { color: "#fff" } })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: p.paid ? "var(--text-muted)" : "var(--text)", letterSpacing: "-0.2px" } }, p.label), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-subtle)", marginTop: 1 } }, p.pct, "%", p.paid && p.paidDate ? ` \xB7 cobrado ${p.paidDate.split("-").reverse().slice(0, 2).join("/")}` : " \xB7 pendiente")), /* @__PURE__ */ React.createElement("div", { style: {
      fontSize: 13.5,
      fontVariantNumeric: "tabular-nums",
      flexShrink: 0,
      color: p.paid ? "var(--accent)" : "var(--text)"
    } }, _eurP(p.amount))))));
  };
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
    const [phaseAdding, setPhaseAdding] = useState(false);
    const [phaseDraft, setPhaseDraft] = useState("");
    const [editOpen, setEditOpen] = useState(false);
    const [driveTick, setDriveTick] = useState(0);
    const [driveEditing, setDriveEditing] = useState(false);
    const [driveDraft, setDriveDraft] = useState("");
    const [hoverId, setHoverId] = useState(null);
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
      if (aiPhases?.length > 0) {
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
    const phaseList = () => (p.service || "").split(",").map((s) => s.trim()).filter((n) => n && n !== "libre" && n !== "\u2014");
    const savePhases = (names) => D.updateProject(p.id, { service: names.join(", ") || "libre" });
    const addPhase = (name) => {
      const v = (name || "").trim();
      if (!v) {
        setPhaseAdding(false);
        setPhaseDraft("");
        return;
      }
      const names = phaseList();
      if (!names.some((n) => n.toLowerCase() === v.toLowerCase())) {
        savePhases([...names, v]);
        toast("Fase a\xF1adida", "success");
      }
      setPhaseDraft("");
      setPhaseAdding(false);
    };
    const removePhase = (name) => {
      (D.TASKS[p.id] || []).filter((t) => t.phase === name).forEach((t) => D.updateTask(p.id, t.id, { phase: null }));
      savePhases(phaseList().filter((n) => n !== name));
      toast("Fase eliminada", "success");
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
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "page" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 } }, /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: () => navigate("projects") }, /* @__PURE__ */ React.createElement(Icon, { name: "chevron", size: 12, style: { transform: "rotate(180deg)" } }), " Proyectos"), /* @__PURE__ */ React.createElement(
      ActionPill,
      {
        plusActions: () => {
          setTab("tasks");
          setAdding("add:" + (aiPhases && aiPhases[0] ? aiPhases[0].name : "__otras__"));
          setDraft("");
        },
        moreActions: [
          { icon: "edit", label: "Editar proyecto", sub: "Cambia nombre, cliente, tipo o fecha.", onClick: () => setEditOpen(true) },
          { icon: "trash", label: "Eliminar proyecto", sub: "Borra el proyecto y sus tareas.", onClick: removeProjectFromHere }
        ]
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "page-head", style: { marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", null, p.name), /* @__PURE__ */ React.createElement("div", { className: "sub" }, (() => {
      const parts = [p.clientName];
      if (p.recurring) parts.push("Mensual");
      else if (p.deadline && p.deadline !== "\u2014") parts.push("Entrega " + p.deadline);
      if (aiPhases) parts.push(aiPhases.length + " fase" + (aiPhases.length === 1 ? "" : "s"));
      return parts.join(" \xB7 ");
    })()))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 14, marginBottom: 22 } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1, height: 6, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: {
      width: liveProgress + "%",
      height: "100%",
      borderRadius: 99,
      background: "var(--accent)",
      transition: "width .4s ease"
    } })), /* @__PURE__ */ React.createElement("div", { style: { flexShrink: 0, fontSize: 13, color: "var(--text-muted)" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text)", fontWeight: 600 } }, liveProgress, "%"), /* @__PURE__ */ React.createElement("span", { style: { margin: "0 6px", opacity: 0.4 } }, "\xB7"), tasksByCol.done.length, "/", projectTasks.length, " tareas")), /* @__PURE__ */ React.createElement("div", { className: "tabs" }, [
      { id: "plan", label: aiPhases ? `Plan (${aiPhases.length} fases)` : "Plan" },
      { id: "tasks", label: "Tablero" },
      { id: "files", label: "Archivos" },
      { id: "pay", label: "Cobro" }
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
      const secLabel = { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-subtle)", marginBottom: 4 };
      return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 34 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: secLabel }, "Fases del proyecto"), planGroups.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "20px 0" } }, /* @__PURE__ */ React.createElement(Empty, { icon: "list-todo", title: "Sin fases", sub: "Organiza el proyecto en fases y a\xF1ade tareas dentro de cada una." }), /* @__PURE__ */ React.createElement("button", { className: "btn primary sm", onClick: () => setTab("tasks") }, /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 13 }), " Crear fases y tareas")) : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", width: "100%" } }, planGroups.map((g, i) => {
        const gDone = g.tasks.filter((t) => t.column === "done").length;
        const gPct = g.tasks.length ? Math.round(gDone / g.tasks.length * 100) : 0;
        const isReal = g.name !== "__otras__";
        const doneSet = new Set(p.phasesDone || []);
        const isComplete = isReal && (doneSet.has(g.name) || g.tasks.length > 0 && gDone === g.tasks.length);
        const desc = (p.phasesDesc || {})[g.name] || "";
        const on = hoverId === g.name;
        const editDesc = (e) => {
          e.stopPropagation();
          const v = prompt(`Descripci\xF3n de la fase \xAB${g.label}\xBB (la ve el cliente):`, desc);
          if (v !== null) D.setProjectPhaseDesc(p.id, g.name, v);
        };
        const toggleDone = (e) => {
          e.stopPropagation();
          D.toggleProjectPhase(p.id, g.name);
          toast(isComplete ? "Fase reabierta" : "Fase completada", "success");
        };
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
            onMouseEnter: () => setHoverId(g.name),
            onMouseLeave: () => setHoverId(null),
            style: { display: "flex", flexDirection: "column", gap: 12, padding: "18px 6px", cursor: isReal ? "pointer" : "default" }
          },
          /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 14, minWidth: 0 } }, /* @__PURE__ */ React.createElement("span", { style: {
            width: 26,
            height: 26,
            borderRadius: 99,
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            fontSize: 12,
            fontWeight: 600,
            background: "transparent",
            color: isComplete ? "var(--accent)" : "var(--text-muted)",
            border: "1.5px solid " + (isComplete ? "var(--accent)" : "var(--border-strong)")
          } }, isComplete ? /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 13 }) : isReal ? i + 1 : "\xB7"), /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: {
            fontSize: 17,
            color: "var(--text)",
            letterSpacing: "-0.4px",
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          } }, g.label), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: "var(--text-muted)", marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, desc || (g.tasks.length ? `${gDone}/${g.tasks.length} tareas \xB7 ${gPct}%` : "Sin descripci\xF3n")))), isReal && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, flexShrink: 0 } }, /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only sm", onClick: editDesc, title: "Editar descripci\xF3n" }, /* @__PURE__ */ React.createElement(Icon, { name: "edit", size: 12 })), /* @__PURE__ */ React.createElement("button", { className: "btn sm" + (isComplete ? " ghost" : ""), onClick: toggleDone, title: isComplete ? "Reabrir fase" : "Marcar fase completada" }, isComplete ? "Reabrir" : "Completar"), /* @__PURE__ */ React.createElement(
            Icon,
            {
              name: "chevron-right",
              size: 18,
              style: {
                color: on ? "var(--text)" : "var(--text-muted)",
                transform: on ? "translateX(3px)" : "none",
                transition: "all .2s"
              }
            }
          ))),
          /* @__PURE__ */ React.createElement("div", { style: { height: 1, width: "100%", background: "var(--border)" } })
        );
      }))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: secLabel }, "Pr\xF3ximos vencimientos"), upcoming.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "muted small", style: { padding: "14px 6px", color: "var(--text-subtle)" } }, "No hay tareas con fecha pendientes. A\xF1ade fechas a las tareas desde el Tablero (clic derecho en la tarjeta).") : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", width: "100%" } }, upcoming.map(({ t, info }, i) => /* @__PURE__ */ React.createElement("div", { key: t.id, style: {
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "16px 6px",
        borderTop: i === 0 ? "none" : "0.5px solid var(--border)"
      } }, /* @__PURE__ */ React.createElement("span", { style: { width: 9, height: 9, borderRadius: 99, background: info.color, flexShrink: 0 } }), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, letterSpacing: "-0.2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, t.title), taskPhase(t) && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-muted)", marginTop: 2 } }, taskPhase(t))), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right", flexShrink: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontWeight: 500 } }, info.label), info.tag && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: info.color, marginTop: 1 } }, info.tag)))))));
    })(), tab === "tasks" && (() => {
      const ORDER = { todo: 0, doing: 1, review: 2, done: 3 };
      const STATE = { todo: "Por hacer", doing: "En curso", review: "Revisi\xF3n", done: "Hecho" };
      const ARC = { todo: 0, doing: 0.34, review: 0.7, done: 1 };
      const cycle = (t) => {
        const seq = ["todo", "doing", "review", "done"];
        D.moveTask(p.id, t.id, seq[(seq.indexOf(t.column) + 1) % 4]);
      };
      const phaseNames = (aiPhases || []).map((ph) => ph.name);
      const groups = phaseNames.map((name) => ({ name, label: name, tasks: projectTasks.filter((t) => taskPhase(t) === name) }));
      const otras = projectTasks.filter((t) => !phaseNames.includes(taskPhase(t)));
      if (otras.length || !phaseNames.length) groups.push({ name: "__otras__", label: "Otras tareas", tasks: otras });
      const addTo = (phaseName) => {
        if (!draft.trim()) {
          setAdding(null);
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
        setAdding(null);
      };
      const renderRow = (t, last) => {
        const isDone = t.column === "done";
        const sz = 38, r = 16, circ = 2 * Math.PI * r;
        const frac = ARC[t.column] || 0;
        return /* @__PURE__ */ React.createElement(
          "div",
          {
            key: t.id,
            className: "task-row",
            onContextMenu: (e) => {
              e.preventDefault();
              setCtxMenu({ x: e.clientX, y: e.clientY, taskId: t.id });
            },
            style: {
              display: "flex",
              alignItems: "center",
              gap: 13,
              padding: "12px 4px",
              borderBottom: last ? "none" : "0.5px solid var(--border)"
            }
          },
          /* @__PURE__ */ React.createElement(
            "button",
            {
              onClick: () => cycle(t),
              title: "Estado: " + STATE[t.column] + " (clic para avanzar)",
              style: {
                width: sz,
                height: sz,
                flexShrink: 0,
                position: "relative",
                display: "grid",
                placeItems: "center",
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer"
              }
            },
            /* @__PURE__ */ React.createElement("svg", { width: sz, height: sz, style: { position: "absolute", top: 0, left: 0 } }, /* @__PURE__ */ React.createElement(
              "circle",
              {
                cx: sz / 2,
                cy: sz / 2,
                r,
                fill: "none",
                stroke: isDone ? "var(--accent)" : "rgba(255,255,255,0.12)",
                strokeWidth: "2"
              }
            ), !isDone && frac > 0 && /* @__PURE__ */ React.createElement(
              "circle",
              {
                cx: sz / 2,
                cy: sz / 2,
                r,
                fill: "none",
                stroke: "var(--accent)",
                strokeWidth: "2",
                strokeLinecap: "round",
                strokeDasharray: `${frac * circ} ${circ}`,
                transform: `rotate(-90,${sz / 2},${sz / 2})`
              }
            )),
            isDone ? /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 15, style: { color: "var(--accent)", position: "relative" } }) : /* @__PURE__ */ React.createElement("span", { style: { width: 5, height: 5, borderRadius: 99, background: "rgba(255,255,255,0.25)", position: "relative" } })
          ),
          /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, editingId === t.id ? /* @__PURE__ */ React.createElement(
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
              style: { padding: "4px 6px", fontSize: 14 }
            }
          ) : /* @__PURE__ */ React.createElement(
            "div",
            {
              onClick: () => {
                setEditingId(t.id);
                setEditDraft(t.title);
              },
              style: {
                fontSize: 14,
                letterSpacing: "-0.3px",
                cursor: "text",
                color: isDone ? "var(--text-subtle)" : "var(--text)",
                textDecoration: isDone ? "line-through" : "none",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }
            },
            t.title
          ), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--text-subtle)", marginTop: 2 } }, STATE[t.column], t.deadline ? " \xB7 " + t.deadline : "")),
          /* @__PURE__ */ React.createElement(
            "button",
            {
              className: "task-del btn ghost icon-only sm",
              "data-tooltip": "Fecha",
              onClick: () => setDatePicking(datePicking === t.id ? null : t.id),
              style: { flexShrink: 0, color: "var(--text-subtle)" }
            },
            /* @__PURE__ */ React.createElement(Icon, { name: "calendar", size: 13 })
          ),
          /* @__PURE__ */ React.createElement(
            "button",
            {
              className: "task-del btn ghost icon-only sm",
              onClick: () => D.deleteTask(p.id, t.id),
              style: { flexShrink: 0, color: "var(--text-subtle)" }
            },
            /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 12 })
          ),
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
              style: { flexShrink: 0, fontSize: 12, padding: "3px 6px", width: 140 }
            }
          )
        );
      };
      return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", width: "100%" } }, groups.map((g, gi) => {
        const gTasks = [...g.tasks].sort((a, b) => ORDER[a.column] - ORDER[b.column]);
        const gDone = g.tasks.filter((t) => t.column === "done").length;
        const addKey = "add:" + g.name;
        const isAdding = adding === addKey;
        return /* @__PURE__ */ React.createElement("div", { key: g.name, style: { marginTop: gi === 0 ? 0 : 26 } }, /* @__PURE__ */ React.createElement("div", { className: "phase-head", style: {
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 2,
          paddingBottom: 8,
          borderBottom: "0.5px solid var(--border)"
        } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-subtle)", fontWeight: 600 } }, g.label), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: "var(--text-subtle)", opacity: 0.7 } }, gDone, "/", g.tasks.length), g.name !== "__otras__" && /* @__PURE__ */ React.createElement(
          "button",
          {
            className: "phase-del btn ghost icon-only sm",
            title: "Eliminar fase",
            onClick: () => removePhase(g.name),
            style: { marginLeft: "auto", color: "var(--text-subtle)" }
          },
          /* @__PURE__ */ React.createElement(Icon, { name: "trash", size: 12 })
        )), gTasks.map((t) => renderRow(t, false)), isAdding ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 13, padding: "12px 4px", borderTop: gTasks.length ? "0.5px solid var(--border)" : "none" } }, /* @__PURE__ */ React.createElement("span", { style: { width: 38, height: 38, flexShrink: 0, display: "grid", placeItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { width: 20, height: 20, borderRadius: 99, border: "1.5px dashed var(--border-strong)" } })), /* @__PURE__ */ React.createElement(
          "input",
          {
            autoFocus: true,
            className: "input",
            placeholder: "Nombre de la tarea\u2026",
            value: draft,
            onChange: (e) => setDraft(e.target.value),
            onKeyDown: (e) => {
              if (e.key === "Enter") addTo(g.name);
              if (e.key === "Escape") {
                setAdding(null);
                setDraft("");
              }
            },
            onBlur: () => addTo(g.name),
            style: { flex: 1, padding: "5px 8px", fontSize: 14 }
          }
        )) : /* @__PURE__ */ React.createElement(
          "button",
          {
            className: "btn ghost sm",
            onClick: () => {
              setAdding(addKey);
              setDraft("");
            },
            style: { justifyContent: "flex-start", color: "var(--text-subtle)", marginTop: 4, padding: "9px 4px" }
          },
          /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 13 }),
          " A\xF1adir tarea"
        ));
      }), /* @__PURE__ */ React.createElement("div", { style: { marginTop: groups.length ? 26 : 0, paddingTop: 14, borderTop: "0.5px solid var(--border)" } }, phaseAdding ? /* @__PURE__ */ React.createElement(
        "input",
        {
          autoFocus: true,
          className: "input",
          placeholder: "Nombre de la fase\u2026",
          value: phaseDraft,
          onChange: (e) => setPhaseDraft(e.target.value),
          onKeyDown: (e) => {
            if (e.key === "Enter") addPhase(phaseDraft);
            if (e.key === "Escape") {
              setPhaseAdding(false);
              setPhaseDraft("");
            }
          },
          onBlur: () => addPhase(phaseDraft),
          style: { maxWidth: 320, padding: "7px 10px", fontSize: 14 }
        }
      ) : /* @__PURE__ */ React.createElement(
        "button",
        {
          className: "btn ghost sm",
          onClick: () => {
            setPhaseAdding(true);
            setPhaseDraft("");
          },
          style: { justifyContent: "flex-start", color: "var(--accent)", padding: "9px 4px" }
        },
        /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 13 }),
        " A\xF1adir fase"
      )));
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
        } catch {
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
    })(), tab === "pay" && /* @__PURE__ */ React.createElement(ProjectPayments, { project: p }))), ctxMenu && (() => {
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
    })(), editOpen && /* @__PURE__ */ React.createElement(EditProjectModal, { project: p, onClose: () => setEditOpen(false) }));
  };
  window.AgencyProject = AgencyProject;
})();

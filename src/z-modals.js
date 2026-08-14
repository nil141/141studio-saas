const ChoiceCard = ({ label, sub, icon, selected, onClick, half }) => /* @__PURE__ */ React.createElement("div", { onClick, style: {
  padding: "13px 14px",
  borderRadius: 10,
  cursor: "pointer",
  transition: "all .12s",
  border: `1.5px solid ${selected ? "var(--accent)" : "var(--border-strong)"}`,
  background: selected ? "var(--accent-soft)" : "var(--bg-elev-2)",
  display: "flex",
  flexDirection: half ? "row" : "column",
  alignItems: half ? "center" : "flex-start",
  gap: half ? 10 : 6
} }, icon && /* @__PURE__ */ React.createElement(Icon, { name: icon, size: 16, style: { color: selected ? "var(--accent)" : "var(--text-muted)", flexShrink: 0 } }), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 500, color: selected ? "var(--accent)" : "var(--text)" } }, label), sub && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-subtle)", marginTop: 2 } }, sub)), half && selected && /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 13, style: { color: "var(--accent)", flexShrink: 0 } }));
const WizardQuestion = ({ label, hint, children }) => /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 20 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: hint ? 2 : 10 } }, label), hint && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-subtle)", marginBottom: 10 } }, hint), children);
const WIZARD_TYPES = [
  { id: "web", label: "Web", icon: "external-link", sub: "Web corporativa o landing" },
  { id: "brand", label: "Branding", icon: "sparkles", sub: "Identidad y sistema de marca" },
  { id: "ecommerce", label: "E-commerce", icon: "receipt", sub: "Tienda online" },
  { id: "campaign", label: "Campa\xF1a", icon: "trending-up", sub: "Redes, email o ads" },
  { id: "app", label: "App / Producto", icon: "folder", sub: "App o producto digital" },
  { id: "other", label: "Otro", icon: "list-todo", sub: "Proyecto personalizado" }
];
const TOTAL_STEPS = 2;
const PROJECT_SERVICES = [
  { id: "web-design", label: "Dise\xF1o web", icon: "image", tasks: [
    "Recopilar referencias y briefing",
    "Arquitectura y wireframes",
    "Dise\xF1o UI en Figma",
    "Dise\xF1o responsive (m\xF3vil)",
    "Revisi\xF3n con el cliente",
    "Ajustes finales de dise\xF1o"
  ] },
  { id: "web-dev", label: "Desarrollo web", icon: "list-todo", tasks: [
    "Maquetaci\xF3n HTML/CSS",
    "Programaci\xF3n front-end",
    "Integraci\xF3n CMS/backend",
    "Formularios y contacto",
    "Pruebas en navegadores",
    "Puesta en producci\xF3n"
  ] },
  { id: "branding", label: "Branding", icon: "sparkles", tasks: [
    "Investigaci\xF3n de marca",
    "Propuestas de logo",
    "Paleta y tipograf\xEDas",
    "Manual de marca",
    "Entrega de assets"
  ] },
  { id: "ecommerce", label: "E-commerce", icon: "package", tasks: [
    "Configurar la tienda",
    "Cargar productos",
    "M\xE9todos de pago",
    "Env\xEDos e impuestos",
    "Pruebas de compra"
  ] },
  { id: "seo", label: "SEO", icon: "search", tasks: [
    "Auditor\xEDa SEO inicial",
    "Estudio de palabras clave",
    "Optimizaci\xF3n on-page",
    "Metadatos y sitemap",
    "Alta en Search Console"
  ] },
  { id: "content", label: "Contenido", icon: "edit", tasks: [
    "Definir tono y mensajes",
    "Redactar textos de p\xE1ginas",
    "Seleccionar im\xE1genes",
    "Revisi\xF3n ortogr\xE1fica"
  ] },
  { id: "ads", label: "Marketing / Ads", icon: "megaphone", tasks: [
    "Estrategia de campa\xF1a",
    "Definir p\xFAblicos",
    "Dise\xF1ar creatividades",
    "Configurar campa\xF1as",
    "Seguimiento y optimizaci\xF3n"
  ] },
  { id: "social", label: "Redes sociales", icon: "users", tasks: [
    "Plan de contenidos",
    "Dise\xF1o de plantillas",
    "Calendario mensual",
    "Programar publicaciones"
  ] },
  { id: "maintenance", label: "Mantenimiento", icon: "refresh-cw", tasks: [
    "Copias de seguridad",
    "Actualizaciones",
    "Monitorizaci\xF3n",
    "Informe mensual"
  ] }
];
window.PROJECT_SERVICES = PROJECT_SERVICES;
const NewProjectModal = ({ open, onClose, onCreate, prefilledClientId }) => {
  const D = window.Data;
  D.useStore && D.useStore();
  const toast = useToast();
  const blank = () => ({ name: "", clientId: prefilledClientId || "", deadline: "", recurring: false, amount: "", plan: "5050" });
  const [step, setStep] = useState(0);
  const [a, setA] = useState(blank);
  const [searching, setSearching] = useState(false);
  const [cq, setCq] = useState("");
  const [phases, setPhases] = useState([]);
  const [phaseInput, setPhaseInput] = useState("");
  const [creating, setCreating] = useState(false);
  useEffect(() => {
    if (!open) return;
    setStep(0);
    setA(blank());
    setSearching(false);
    setCq("");
    setPhases([]);
    setPhaseInput("");
    setCreating(false);
  }, [open]);
  const set = (k, v) => setA((p) => ({ ...p, [k]: v }));
  const addPhase = (name) => {
    const v = (name || "").trim();
    if (!v) return;
    setPhases((ps) => ps.includes(v) ? ps : [...ps, v]);
    setPhaseInput("");
  };
  const removePhase = (name) => setPhases((ps) => ps.filter((x) => x !== name));
  const SUGGESTED_PHASES = [
    "Onboarding y estrategia",
    "Auditor\xEDa y diagn\xF3stico",
    "Dise\xF1o y producci\xF3n",
    "Lanzamiento y optimizaci\xF3n"
  ];
  const hasClients = D.CLIENTS.length > 0;
  const filtered = D.CLIENTS.filter(
    (c) => (c.name || "").toLowerCase().includes(cq.toLowerCase()) || (c.company || "").toLowerCase().includes(cq.toLowerCase())
  );
  const selClient = D.CLIENTS.find((c) => c.id === a.clientId);
  const canNext = [
    // Cliente opcional (proyectos internos). Puntual necesita fecha; recurrente no.
    !!(a.name.trim() && (a.recurring || a.deadline)),
    true
    // las fases son opcionales: se puede crear un proyecto vacío
  ];
  const submit = async () => {
    if (creating) return;
    setCreating(true);
    const amt = Number(a.amount) || 0;
    const res = await D.addProjectAsync({
      name: a.name.trim(),
      clientId: a.clientId || null,
      deadline: a.recurring ? "" : a.deadline,
      recurring: a.recurring,
      template: phases.join(", ") || "libre",
      amount: amt,
      payments: amt > 0 ? D.buildPayments(amt, a.plan) : []
    });
    const p = res && res.project;
    if (!p) {
      setCreating(false);
      toast(res && res.error ? res.error : "No se pudo crear el proyecto", "error");
      return;
    }
    toast(
      phases.length ? `Proyecto "${p.name}" creado con ${phases.length} fase${phases.length === 1 ? "" : "s"}` : `Proyecto "${p.name}" creado`,
      "success"
    );
    setCreating(false);
    onClose();
    onCreate && onCreate(p);
  };
  const STEP_LABELS = ["B\xE1sicos", "Fases"];
  const renderStep0 = () => /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Tipo de proyecto"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 } }, [
    { id: false, title: "Puntual", sub: "Trabajo con entrega", icon: "flag" },
    { id: true, title: "Recurrente", sub: "Mensual (ej. redes)", icon: "refresh-cw" }
  ].map((opt) => {
    const on = a.recurring === opt.id;
    return /* @__PURE__ */ React.createElement("button", { key: String(opt.id), onClick: () => set("recurring", opt.id), style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      textAlign: "left",
      padding: "11px 13px",
      borderRadius: 12,
      cursor: "pointer",
      fontFamily: "inherit",
      background: on ? "rgba(158,154,229,0.14)" : "rgba(255,255,255,0.03)",
      border: on ? "0.5px solid rgba(158,154,229,0.5)" : "0.5px solid var(--border)",
      transition: "all .12s"
    } }, /* @__PURE__ */ React.createElement("div", { style: {
      width: 30,
      height: 30,
      borderRadius: 9,
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: on ? "rgba(158,154,229,0.18)" : "rgba(255,255,255,0.05)",
      color: on ? "var(--accent)" : "var(--text-subtle)"
    } }, /* @__PURE__ */ React.createElement(Icon, { name: opt.icon, size: 15, strokeWidth: 1.7 })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, letterSpacing: "-0.3px", color: on ? "var(--text)" : "var(--text-muted)" } }, opt.title), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-subtle)", marginTop: 1 } }, opt.sub)));
  }))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Nombre del proyecto"), /* @__PURE__ */ React.createElement("input", { className: "input", placeholder: "Ej. Redise\xF1o web 2026", value: a.name, onChange: (e) => set("name", e.target.value), autoFocus: true })), /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Cliente ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-subtle)", fontWeight: 400 } }, "(opcional)")), /* @__PURE__ */ React.createElement("button", { className: "input row tight", style: { textAlign: "left", height: 38 }, onClick: () => setSearching((s) => !s) }, selClient ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Avatar, { size: "sm", name: selClient.name, initials: selClient.initials, color: selClient.color }), /* @__PURE__ */ React.createElement("span", { className: "grow", style: { textAlign: "left" } }, [selClient.name, selClient.company].filter(Boolean).join(" \xB7 ")), /* @__PURE__ */ React.createElement(Icon, { name: "chevron", size: 12, style: { transform: "rotate(90deg)" } })) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { className: "grow muted", style: { textAlign: "left" } }, "Sin cliente \xB7 proyecto interno"), /* @__PURE__ */ React.createElement(Icon, { name: "chevron", size: 12, style: { transform: "rotate(90deg)" } }))), searching && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 6, background: "var(--bg-elev-2)", border: "0.5px solid var(--border-strong)", borderRadius: 10, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { padding: 8, borderBottom: "0.5px solid var(--border)" } }, /* @__PURE__ */ React.createElement("div", { className: "search" }, /* @__PURE__ */ React.createElement(Icon, { name: "search", size: 13 }), /* @__PURE__ */ React.createElement("input", { autoFocus: true, placeholder: "Buscar\u2026", value: cq, onChange: (e) => setCq(e.target.value) }))), /* @__PURE__ */ React.createElement("div", { style: { maxHeight: 200, overflowY: "auto" } }, /* @__PURE__ */ React.createElement(
    "div",
    {
      onClick: () => {
        set("clientId", "");
        setSearching(false);
      },
      style: { padding: "8px 12px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" },
      onMouseEnter: (e) => e.currentTarget.style.background = "var(--bg-hover)",
      onMouseLeave: (e) => e.currentTarget.style.background = "transparent"
    },
    /* @__PURE__ */ React.createElement("div", { style: {
      width: 26,
      height: 26,
      borderRadius: 8,
      flexShrink: 0,
      display: "grid",
      placeItems: "center",
      background: "rgba(255,255,255,0.05)",
      border: "0.5px solid var(--border)",
      color: "var(--text-muted)"
    } }, /* @__PURE__ */ React.createElement(Icon, { name: "folder", size: 13 })),
    /* @__PURE__ */ React.createElement("span", { className: "grow small" }, "Sin cliente \xB7 proyecto interno"),
    !a.clientId && /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 13 })
  ), filtered.map((c) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: c.id,
      onClick: () => {
        set("clientId", c.id);
        setSearching(false);
      },
      style: { padding: "8px 12px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" },
      onMouseEnter: (e) => e.currentTarget.style.background = "var(--bg-hover)",
      onMouseLeave: (e) => e.currentTarget.style.background = "transparent"
    },
    /* @__PURE__ */ React.createElement(Avatar, { size: "sm", name: c.name, initials: c.initials, color: c.color }),
    /* @__PURE__ */ React.createElement("span", { className: "grow small" }, [c.name, c.company].filter(Boolean).join(" \xB7 ")),
    c.id === a.clientId && /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 13 })
  ))))), a.recurring ? /* @__PURE__ */ React.createElement("div", { style: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "11px 13px",
    borderRadius: 10,
    background: "rgba(158,154,229,0.08)",
    border: "0.5px solid rgba(158,154,229,0.25)",
    fontSize: 12.5,
    color: "var(--text-muted)"
  } }, /* @__PURE__ */ React.createElement(Icon, { name: "refresh-cw", size: 14, style: { color: "var(--accent)" } }), /* @__PURE__ */ React.createElement("span", null, "Servicio mensual: se renueva cada mes, sin fecha de entrega fija.")) : /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Fecha de entrega"), /* @__PURE__ */ React.createElement("input", { className: "input", type: "date", value: a.deadline, onChange: (e) => set("deadline", e.target.value) })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Precio cerrado ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-subtle)", fontWeight: 400 } }, "(opcional)")), /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement("span", { style: { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)", fontSize: 14 } }, "\u20AC"), /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "input",
      type: "number",
      min: "0",
      step: "any",
      placeholder: "Ej. 1500",
      value: a.amount,
      onChange: (e) => set("amount", e.target.value),
      style: { paddingLeft: 26 }
    }
  ))), Number(a.amount) > 0 && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, "C\xF3mo se cobra"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 } }, Object.entries(D.PAY_PLANS).map(([id, pl]) => {
    const on = a.plan === id;
    return /* @__PURE__ */ React.createElement("button", { key: id, onClick: () => set("plan", id), style: {
      textAlign: "left",
      padding: "10px 12px",
      borderRadius: 12,
      cursor: "pointer",
      fontFamily: "inherit",
      background: on ? "rgba(158,154,229,0.14)" : "rgba(255,255,255,0.03)",
      border: on ? "0.5px solid rgba(158,154,229,0.5)" : "0.5px solid var(--border)",
      transition: "all .12s"
    } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: on ? "var(--text)" : "var(--text-muted)", letterSpacing: "-0.2px" } }, pl.label), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10.5, color: "var(--text-subtle)", marginTop: 2 } }, pl.desc));
  })), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 10, display: "flex", flexDirection: "column", gap: 5 } }, D.buildPayments(Number(a.amount), a.plan).map((p, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)", letterSpacing: "-0.2px" } }, /* @__PURE__ */ React.createElement("span", null, p.label, " ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-subtle)" } }, "\xB7 ", p.pct, "%")), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text)", fontVariantNumeric: "tabular-nums" } }, "\u20AC", p.amount.toLocaleString("es-ES")))))));
  const renderStep1 = () => {
    const available = SUGGESTED_PHASES.filter((s) => !phases.includes(s));
    return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: "var(--text-muted)", letterSpacing: "-0.2px", lineHeight: 1.5 } }, "A\xF1ade las fases del proyecto. Las tareas de cada fase las creas t\xFA luego dentro del proyecto. Puedes crearlo sin fases y organizarlo despu\xE9s."), /* @__PURE__ */ React.createElement("div", { className: "row tight" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        className: "input",
        placeholder: "Nombre de la fase\u2026",
        value: phaseInput,
        onChange: (e) => setPhaseInput(e.target.value),
        onKeyDown: (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            addPhase(phaseInput);
          }
        },
        style: { flex: 1 }
      }
    ), /* @__PURE__ */ React.createElement("button", { className: "btn", disabled: !phaseInput.trim(), onClick: () => addPhase(phaseInput) }, /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 13 }), " A\xF1adir")), available.length > 0 && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--text-subtle)", marginBottom: 7 } }, "Tu metodolog\xEDa (toca para a\xF1adir)"), /* @__PURE__ */ React.createElement("div", { className: "row tight", style: { flexWrap: "wrap", gap: 6 } }, available.map((s) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: s,
        onClick: () => addPhase(s),
        className: "chip",
        style: { cursor: "pointer", fontSize: 12, padding: "5px 11px" }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 11 }),
      " ",
      s
    )))), phases.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, phases.map((n, i) => /* @__PURE__ */ React.createElement("div", { key: n, style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 13px",
      borderRadius: 10,
      background: "rgba(255,255,255,0.03)",
      border: "0.5px solid var(--border)"
    } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: "var(--text-subtle)", width: 16, flexShrink: 0 } }, i + 1), /* @__PURE__ */ React.createElement("span", { style: { flex: 1, fontSize: 13.5 } }, n), /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only sm", onClick: () => removePhase(n), style: { color: "var(--text-subtle)" } }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 12 }))))));
  };
  const steps = [renderStep0, renderStep1];
  if (!open) return null;
  return /* @__PURE__ */ React.createElement("div", { className: "modal-overlay", onClick: onClose }, /* @__PURE__ */ React.createElement("div", { className: "modal lg", style: { maxWidth: 600 }, onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("div", { className: "modal-head" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "modal-title" }, "Nuevo proyecto"), /* @__PURE__ */ React.createElement("div", { className: "modal-sub" }, STEP_LABELS[step], " \xB7 ", step + 1, " / ", TOTAL_STEPS)), /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only sm", onClick: onClose }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 14 }))), /* @__PURE__ */ React.createElement("div", { style: { padding: "0 24px" } }, /* @__PURE__ */ React.createElement("div", { style: { height: 3, background: "var(--border)", borderRadius: 99, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { height: "100%", width: `${step / (TOTAL_STEPS - 1) * 100}%`, background: "var(--accent)", borderRadius: 99, transition: "width .25s ease" } }))), /* @__PURE__ */ React.createElement("div", { className: "modal-body", style: { minHeight: 200, maxHeight: "58vh", overflowY: "auto", scrollbarWidth: "none" } }, steps[step]()), /* @__PURE__ */ React.createElement("div", { className: "modal-foot" }, /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: () => step === 0 ? onClose() : setStep((s) => s - 1) }, step === 0 ? "Cancelar" : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Icon, { name: "chevron", size: 12, style: { transform: "rotate(180deg)" } }), " Atr\xE1s")), step < TOTAL_STEPS - 1 ? /* @__PURE__ */ React.createElement("button", { className: "btn primary", disabled: !canNext[step], onClick: () => setStep((s) => s + 1) }, "Siguiente ", /* @__PURE__ */ React.createElement(Icon, { name: "chevron", size: 12 })) : /* @__PURE__ */ React.createElement("button", { className: "btn primary", disabled: !canNext[step] || creating, onClick: submit }, creating ? "Creando\u2026" : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 12 }), " Crear proyecto")))));
};
const NewClientModal = ({ open, onClose, onCreated, onCreateProject }) => {
  const D = window.Data;
  const [step, setStep] = useState("form");
  const [data, setData] = useState({ name: "", email: "", phone: "", company: "", sector: "" });
  const [createdId, setCreatedId] = useState(null);
  const [sectorOpen, setSectorOpen] = useState(false);
  const toast = useToast();
  useEffect(() => {
    if (!sectorOpen) return;
    const close = () => setSectorOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [sectorOpen]);
  const submit = () => {
    if (!data.name.trim()) return toast("El nombre es obligatorio", "warn");
    const c = D.addClient(data);
    setCreatedId(c.id);
    toast(`${c.company} a\xF1adido a clientes`, "success");
    setStep("ask");
  };
  const reset = () => {
    setStep("form");
    setData({ name: "", email: "", phone: "", company: "", sector: "" });
    setCreatedId(null);
  };
  if (!open) return null;
  if (step === "ask") {
    return /* @__PURE__ */ React.createElement(Modal, { open: true, onClose: () => {
      reset();
      onClose();
    }, title: "Cliente creado", sub: `${data.company || data.name} ya est\xE1 en tu lista de clientes`, footer: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: () => {
      reset();
      onClose();
    } }, "M\xE1s tarde"), /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: () => {
      reset();
      onClose();
      onCreateProject && onCreateProject(createdId);
    } }, /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 12 }), " Crear primer proyecto ahora")) }, /* @__PURE__ */ React.createElement("div", { className: "row", style: { gap: 14, alignItems: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { width: 48, height: 48, borderRadius: 12, background: "var(--green-soft)", color: "var(--green)", display: "grid", placeItems: "center" } }, /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 20 })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 500 } }, "\xBFQuieres crear ya un proyecto para ", (data.name || "este cliente").split(" ")[0], "?"), /* @__PURE__ */ React.createElement("div", { className: "muted small", style: { marginTop: 4 } }, "Te ahorramos el clic. Si no, podr\xE1s hacerlo desde su ficha."))));
  }
  const SECTORES = ["Restauraci\xF3n", "Moda / Retail", "Salud / Bienestar", "Tecnolog\xEDa", "Educaci\xF3n", "Inmobiliaria", "Hosteler\xEDa", "Deporte / Fitness", "ONG / Social", "Consultor\xEDa", "Arte / Cultura", "Construcci\xF3n", "Alimentaci\xF3n", "Otro"];
  const canSubmit = !!data.name.trim();
  const FIELD = {
    width: "100%",
    padding: "12px 16px",
    fontSize: 14,
    borderRadius: 14,
    background: "rgba(255,255,255,0.04)",
    border: "0.5px solid rgba(255,255,255,0.1)",
    color: "var(--text)",
    outline: "none",
    fontFamily: "inherit",
    letterSpacing: "-0.3px",
    transition: "border-color .2s, background .2s"
  };
  return /* @__PURE__ */ React.createElement("div", { onClick: () => {
    reset();
    onClose();
  }, style: {
    position: "fixed",
    inset: 0,
    zIndex: 200,
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    animation: "fade .15s ease-out"
  } }, /* @__PURE__ */ React.createElement("style", null, `.od-input:focus { border-color: rgba(158,154,229,0.5) !important; background: rgba(158,154,229,0.05) !important; }`), /* @__PURE__ */ React.createElement("div", { onClick: (e) => e.stopPropagation(), style: {
    width: "100%",
    maxWidth: 520,
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#0e0e10",
    border: "1px solid #232324",
    borderRadius: 32,
    boxShadow: "0 40px 90px rgba(0,0,0,0.6)",
    animation: "pop .2s cubic-bezier(.2,.8,.2,1)",
    display: "flex",
    flexDirection: "column"
  } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 22px 0" } }, /* @__PURE__ */ React.createElement("button", { onClick: () => {
    reset();
    onClose();
  }, style: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.08)",
    border: "0.5px solid rgba(255,255,255,0.1)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--text-muted)"
  } }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 15 })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "var(--text-subtle)", letterSpacing: "-0.5px" } }, "Nuevo cliente"), /* @__PURE__ */ React.createElement("button", { onClick: submit, style: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: canSubmit ? "var(--accent)" : "rgba(255,255,255,0.08)",
    border: "none",
    cursor: canSubmit ? "pointer" : "default",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    transition: "all .15s",
    opacity: canSubmit ? 1 : 0.4
  } }, /* @__PURE__ */ React.createElement(Icon, { name: "arrow-up", size: 15 }))), /* @__PURE__ */ React.createElement("div", { style: { padding: "28px 28px 8px" } }, /* @__PURE__ */ React.createElement(
    "input",
    {
      autoFocus: true,
      placeholder: "Nombre del cliente...",
      value: data.name,
      onChange: (e) => setData({ ...data, name: e.target.value }),
      onKeyDown: (e) => {
        if (e.key === "Enter" && canSubmit) submit();
      },
      style: {
        width: "100%",
        background: "transparent",
        border: "none",
        outline: "none",
        fontSize: 28,
        fontWeight: 400,
        letterSpacing: "-1.4px",
        color: data.name ? "var(--text)" : "rgba(255,255,255,0.15)",
        fontFamily: "var(--font-display)",
        caretColor: "var(--accent)"
      }
    }
  ), /* @__PURE__ */ React.createElement(
    "input",
    {
      placeholder: "Empresa (opcional)",
      value: data.company,
      onChange: (e) => setData({ ...data, company: e.target.value }),
      style: {
        width: "100%",
        background: "transparent",
        border: "none",
        outline: "none",
        fontSize: 14,
        letterSpacing: "-0.5px",
        marginTop: 8,
        color: data.company ? "var(--text-muted)" : "rgba(255,255,255,0.13)",
        fontFamily: "var(--font-sans)",
        caretColor: "var(--accent)"
      }
    }
  )), /* @__PURE__ */ React.createElement("div", { style: { padding: "20px 28px 26px", display: "flex", flexDirection: "column", gap: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "od-input",
      style: FIELD,
      type: "email",
      placeholder: "ana@empresa.com",
      value: data.email,
      onChange: (e) => setData({ ...data, email: e.target.value })
    }
  ), /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "od-input",
      style: FIELD,
      type: "tel",
      placeholder: "+34 600 000 000",
      value: data.phone,
      onChange: (e) => setData({ ...data, phone: e.target.value })
    }
  )), /* @__PURE__ */ React.createElement("div", { style: { position: "relative" }, onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("button", { onClick: () => setSectorOpen((o) => !o), style: {
    ...FIELD,
    cursor: "pointer",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    color: data.sector ? "var(--text)" : "var(--text-subtle)",
    borderColor: sectorOpen ? "rgba(158,154,229,0.5)" : "rgba(255,255,255,0.1)"
  } }, /* @__PURE__ */ React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement(Icon, { name: "tag", size: 13, style: { color: data.sector ? "var(--accent)" : "var(--text-subtle)" } }), data.sector || "Sector (opcional)"), /* @__PURE__ */ React.createElement(Icon, { name: "chevron-down", size: 13, style: {
    opacity: 0.5,
    transform: sectorOpen ? "rotate(180deg)" : "none",
    transition: "transform .15s"
  } })), sectorOpen && /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: "calc(100% + 8px)",
    zIndex: 30,
    background: "#1a1a1c",
    border: "0.5px solid rgba(255,255,255,0.1)",
    borderRadius: 14,
    padding: 6,
    maxHeight: 224,
    overflowY: "auto",
    boxShadow: "0 12px 40px rgba(0,0,0,0.55)"
  } }, data.sector && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setData({ ...data, sector: "" });
        setSectorOpen(false);
      },
      style: {
        display: "block",
        width: "100%",
        textAlign: "left",
        padding: "9px 12px",
        borderRadius: 9,
        border: 0,
        background: "transparent",
        cursor: "pointer",
        fontSize: 13,
        fontFamily: "inherit",
        color: "var(--text-subtle)",
        letterSpacing: "-0.3px"
      },
      onMouseEnter: (e) => e.currentTarget.style.background = "var(--bg-hover)",
      onMouseLeave: (e) => e.currentTarget.style.background = "transparent"
    },
    "Sin sector"
  ), SECTORES.map((s) => {
    const on = data.sector === s;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: s,
        onClick: () => {
          setData({ ...data, sector: s });
          setSectorOpen(false);
        },
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          textAlign: "left",
          padding: "9px 12px",
          borderRadius: 9,
          border: 0,
          cursor: "pointer",
          background: on ? "rgba(158,154,229,0.1)" : "transparent",
          fontSize: 13,
          fontFamily: "inherit",
          letterSpacing: "-0.3px",
          color: on ? "var(--accent)" : "var(--text)"
        },
        onMouseEnter: (e) => {
          if (!on) e.currentTarget.style.background = "var(--bg-hover)";
        },
        onMouseLeave: (e) => {
          e.currentTarget.style.background = on ? "rgba(158,154,229,0.1)" : "transparent";
        }
      },
      s,
      on && /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 13 })
    );
  }))))));
};
const ApproveDeliverableModal = ({ open, onClose, deliverable }) => {
  const [comment, setComment] = useState("");
  const toast = useToast();
  const d = deliverable || { title: "Mockups landing v3", type: "Dise\xF1o", thumb: "linear-gradient(135deg,#1f2937,#0f172a)", version: "v3", date: "7 may" };
  return /* @__PURE__ */ React.createElement(Modal, { open, onClose, title: "Revisar entregable", sub: d.title + " \xB7 " + d.version, size: "lg", footer: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: onClose }, "Cancelar"), /* @__PURE__ */ React.createElement("button", { className: "btn", style: { borderColor: "var(--amber)", color: "var(--amber)" }, onClick: () => {
    toast("Cambios solicitados al equipo", "warn");
    onClose();
  } }, /* @__PURE__ */ React.createElement(Icon, { name: "msg-circle", size: 12 }), " Pedir cambios"), /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: () => {
    toast("\xA1Entregable aprobado! Gracias.", "success");
    onClose();
  } }, /* @__PURE__ */ React.createElement(Icon, { name: "thumbs-up", size: 12 }), " Aprobar")) }, /* @__PURE__ */ React.createElement("div", { style: { aspectRatio: "16/8", background: d.thumb, borderRadius: 10, marginBottom: 16, position: "relative", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: 12, left: 12, color: "#fff", fontSize: 11, opacity: 0.7 } }, d.type, " \xB7 ", d.version), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", bottom: 12, right: 12 } }, /* @__PURE__ */ React.createElement("button", { className: "btn sm", style: { background: "rgba(0,0,0,0.4)", color: "#fff", borderColor: "rgba(255,255,255,0.2)" } }, /* @__PURE__ */ React.createElement(Icon, { name: "download", size: 12 }), " Descargar"))), /* @__PURE__ */ React.createElement("div", { className: "row between", style: { marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { className: "row tight muted small" }, /* @__PURE__ */ React.createElement(Icon, { name: "paperclip", size: 12 }), " 4 archivos \xB7 18.4 MB", /* @__PURE__ */ React.createElement("span", { className: "vdiv" }), /* @__PURE__ */ React.createElement(Icon, { name: "calendar", size: 12 }), " Subido ", d.date), /* @__PURE__ */ React.createElement("div", { className: "row tight" }, /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm" }, /* @__PURE__ */ React.createElement(Icon, { name: "external-link", size: 12 }), " Pantalla completa"))), /* @__PURE__ */ React.createElement("div", { className: "label" }, "Comentario (opcional)"), /* @__PURE__ */ React.createElement("textarea", { className: "textarea", rows: 3, placeholder: "Cu\xE9ntale al equipo qu\xE9 te ha parecido o qu\xE9 cambiar\xEDas\u2026", value: comment, onChange: (e) => setComment(e.target.value) }), /* @__PURE__ */ React.createElement("div", { className: "row tight", style: { marginTop: 10, color: "var(--text-muted)", fontSize: 12 } }, /* @__PURE__ */ React.createElement(Icon, { name: "info", size: 12 }), /* @__PURE__ */ React.createElement("span", null, "Si pides cambios, el comentario se enviar\xE1 al equipo y volveremos a notificarte cuando haya nueva versi\xF3n.")));
};
const NewTaskModal = ({ open, onClose }) => {
  const D = window.Data;
  D.useStore && D.useStore();
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [column, setColumn] = useState("todo");
  const [assignee, setAssignee] = useState("T\xFA");
  const [clientSearch, setClientSearch] = useState("");
  const [clientOpen, setClientOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [projectId, setProjectId] = useState("__none__");
  const COLUMNS = [
    { id: "todo", label: "Por hacer" },
    { id: "doing", label: "En curso" },
    { id: "review", label: "Revisi\xF3n" },
    { id: "done", label: "Hecho" }
  ];
  const allClients = D.CLIENTS || [];
  const filteredClients = clientSearch.trim() ? allClients.filter((c) => c.name.toLowerCase().includes(clientSearch.toLowerCase()) || (c.company || "").toLowerCase().includes(clientSearch.toLowerCase())) : allClients;
  const clientProjects = selectedClient ? (D.PROJECTS || []).filter((p) => p.clientId === selectedClient.id) : [];
  const pickClient = (c) => {
    setSelectedClient(c);
    setClientSearch(c.name + (c.company ? ` \u2014 ${c.company}` : ""));
    setClientOpen(false);
    setProjectId("__none__");
  };
  const reset = () => {
    setTitle("");
    setColumn("todo");
    setAssignee("T\xFA");
    setClientSearch("");
    setSelectedClient(null);
    setProjectId("__none__");
    setClientOpen(false);
  };
  const submit = () => {
    if (!title.trim()) {
      toast("Escribe el nombre de la tarea", "warn");
      return;
    }
    D.addTask({
      projectId,
      title: title.trim(),
      column,
      assignee,
      clientId: (selectedClient == null ? void 0 : selectedClient.id) || null,
      clientName: (selectedClient == null ? void 0 : selectedClient.company) || (selectedClient == null ? void 0 : selectedClient.name) || null
    });
    toast("Tarea a\xF1adida", "success");
    reset();
    onClose();
  };
  return /* @__PURE__ */ React.createElement(
    Modal,
    {
      open,
      onClose: () => {
        reset();
        onClose();
      },
      title: "Nueva tarea",
      sub: "Asigna una tarea a un cliente o proyecto.",
      footer: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: () => {
        reset();
        onClose();
      } }, "Cancelar"), /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: submit }, /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 12 }), " Crear tarea"))
    },
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Nombre de la tarea"), /* @__PURE__ */ React.createElement(
      "input",
      {
        className: "input",
        autoFocus: true,
        placeholder: "Ej. Preparar propuesta de dise\xF1o",
        value: title,
        onChange: (e) => setTitle(e.target.value),
        onKeyDown: (e) => e.key === "Enter" && submit()
      }
    )), /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Cliente ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-subtle)" } }, "(opcional)")), /* @__PURE__ */ React.createElement(
      "input",
      {
        className: "input",
        placeholder: "Buscar cliente\u2026",
        value: clientSearch,
        onChange: (e) => {
          setClientSearch(e.target.value);
          setClientOpen(true);
          setSelectedClient(null);
          setProjectId("__none__");
        },
        onFocus: () => setClientOpen(true),
        onBlur: () => setTimeout(() => setClientOpen(false), 150)
      }
    ), clientOpen && filteredClients.length > 0 && /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      top: "100%",
      left: 0,
      right: 0,
      zIndex: 50,
      marginTop: 4,
      background: "var(--bg-elev-2)",
      border: "0.5px solid var(--border-strong)",
      borderRadius: 10,
      overflow: "hidden",
      boxShadow: "0 8px 24px rgba(0,0,0,0.2)"
    } }, filteredClients.slice(0, 6).map((c) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key: c.id,
        onMouseDown: () => pickClient(c),
        style: {
          padding: "10px 14px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 13,
          borderBottom: "0.5px solid var(--border)"
        },
        onMouseEnter: (e) => e.currentTarget.style.background = "var(--bg-hover)",
        onMouseLeave: (e) => e.currentTarget.style.background = ""
      },
      /* @__PURE__ */ React.createElement("div", { style: {
        width: 28,
        height: 28,
        borderRadius: 8,
        background: c.color + "22",
        color: c.color,
        display: "grid",
        placeItems: "center",
        fontSize: 11,
        fontWeight: 600,
        flexShrink: 0
      } }, c.initials),
      /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 500 } }, c.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-subtle)" } }, c.company))
    )))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Proyecto ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-subtle)" } }, "(opcional)")), /* @__PURE__ */ React.createElement(
      "select",
      {
        className: "select",
        value: projectId,
        onChange: (e) => setProjectId(e.target.value),
        disabled: !selectedClient && clientProjects.length === 0
      },
      /* @__PURE__ */ React.createElement("option", { value: "__none__" }, "Sin proyecto espec\xEDfico"),
      clientProjects.map((p) => /* @__PURE__ */ React.createElement("option", { key: p.id, value: p.id }, p.name)),
      !selectedClient && (D.PROJECTS || []).length > 0 && (D.PROJECTS || []).map((p) => /* @__PURE__ */ React.createElement("option", { key: p.id, value: p.id }, p.name, " \xB7 ", p.clientName))
    )))
  );
};
Object.assign(window, { NewProjectModal, NewClientModal, ApproveDeliverableModal, NewTaskModal });

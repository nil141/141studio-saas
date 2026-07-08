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
const TOTAL_STEPS = 3;
const _AI_URL = "https://ofnkazimemuiwovhxepq.supabase.co/functions/v1/rapid-processor";
const _AI_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mbmthemltZW11aXdvdmh4ZXBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NTU5OTcsImV4cCI6MjA5NDUzMTk5N30.NVRoZb_Ie2ZgPELFkS7CxNWrLGZcgdOdWGEEkT_CNqo";
const _NORA_FIRST = "Cu\xE9ntame sobre este proyecto. \xBFQu\xE9 quieres conseguir y qu\xE9 tipo de trabajo implica?";
const _NORA_FALLBACKS = [
  "\xBFQui\xE9n es el p\xFAblico objetivo? \xBFA qui\xE9n va dirigido este proyecto?",
  "\xBFTienes referencias de estilo, competidores o marcas que te inspiren o sirvan de gu\xEDa?",
  "\xBFQu\xE9 entregables concretos esperas recibir al finalizar el proyecto?",
  "\xBFEl cliente tiene materiales existentes \u2014logo, fotos, textos\u2014 que vayamos a usar?",
  "\xBFHay alguna restricci\xF3n de presupuesto o fecha interna que deba tener en cuenta?",
  "\xBFEn qu\xE9 canales o plataformas se va a publicar o usar este trabajo?"
];
const NewProjectModal = ({ open, onClose, onCreate, prefilledClientId }) => {
  const D = window.Data;
  D.useStore && D.useStore();
  const toast = useToast();
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const blank = () => {
    var _a;
    return { name: "", clientId: prefilledClientId || ((_a = D.CLIENTS[0]) == null ? void 0 : _a.id) || "", deadline: "" };
  };
  const [step, setStep] = useState(0);
  const [a, setA] = useState(blank);
  const [searching, setSearching] = useState(false);
  const [cq, setCq] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState("");
  const [typing, setTyping] = useState(false);
  const [noraReady, setNoraReady] = useState(false);
  const [docs, setDocs] = useState([]);
  const [urlInput, setUrlInput] = useState("");
  const [docsOpen, setDocsOpen] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiTab, setAiTab] = useState("roadmap");
  useEffect(() => {
    if (!open) return;
    setStep(0);
    setA(blank());
    setSearching(false);
    setCq("");
    setMessages([]);
    setInputVal("");
    setTyping(false);
    setDocs([]);
    setUrlInput("");
    setDocsOpen(false);
    setAiResult(null);
    setAiLoading(false);
    setAiError(null);
    setAiTab("roadmap");
  }, [open]);
  useEffect(() => {
    if (step === 1) {
      setMessages([{ role: "nora", content: _NORA_FIRST }]);
      setInputVal("");
      setNoraReady(false);
    }
  }, [step]);
  useEffect(() => {
    var _a;
    (_a = chatEndRef.current) == null ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);
  useEffect(() => {
    if (step === 2 && !aiResult && !aiLoading && !aiError) callAI();
  }, [step]);
  const set = (k, v) => setA((p) => ({ ...p, [k]: v }));
  const callNora = async (history) => {
    setTyping(true);
    const userCount = history.filter((m) => m.role === "user").length;
    try {
      const res = await fetch(_AI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${_AI_KEY}` },
        body: JSON.stringify({
          mode: "chat",
          projectName: a.name,
          clientName: (selClient == null ? void 0 : selClient.company) || (selClient == null ? void 0 : selClient.name) || "",
          history: history.map((m) => ({ role: m.role === "nora" ? "assistant" : "user", content: m.content }))
        })
      });
      const data = await res.json();
      setTyping(false);
      if (data.done) {
        setNoraReady(true);
        setMessages((prev) => [...prev, { role: "nora", content: data.message || "\xA1Perfecto, tengo suficiente contexto! Puedes generar el plan." }]);
      } else if (data.message) {
        setMessages((prev) => [...prev, { role: "nora", content: data.message }]);
      } else {
        noraLocalFallback(userCount);
      }
    } catch (e) {
      setTyping(false);
      noraLocalFallback(userCount);
    }
  };
  const noraLocalFallback = (userCount) => {
    setTyping(false);
    if (userCount >= _NORA_FALLBACKS.length + 1) {
      setNoraReady(true);
      setMessages((prev) => [...prev, { role: "nora", content: "\xA1Perfecto, tengo suficiente contexto para preparar el plan! Haz clic en \xABGenerar plan\xBB cuando quieras." }]);
    } else {
      const q = _NORA_FALLBACKS[userCount - 1] || "\xBFHay algo m\xE1s que quieras a\xF1adir antes de generar el plan?";
      setMessages((prev) => [...prev, { role: "nora", content: q }]);
    }
  };
  const sendMessage = () => {
    const val = inputVal.trim();
    if (!val || typing || noraReady) return;
    const updated = [...messages, { role: "user", content: val }];
    setMessages(updated);
    setInputVal("");
    callNora(updated);
  };
  const handleFiles = (files) => {
    Array.from(files).forEach((file) => {
      const isText = file.type.startsWith("text/") || /\.(txt|md|csv)$/i.test(file.name);
      if (isText) {
        const reader = new FileReader();
        reader.onload = (ev) => setDocs((prev) => [...prev, { name: file.name, content: ev.target.result.slice(0, 4e3), type: "text" }]);
        reader.readAsText(file);
      } else {
        setDocs((prev) => [...prev, { name: file.name, content: null, type: file.type || "file" }]);
      }
    });
  };
  const addUrl = () => {
    const val = urlInput.trim();
    if (!val) return;
    setDocs((prev) => [...prev, { name: val, content: null, type: "url" }]);
    setUrlInput("");
  };
  const removeDoc = (i) => setDocs((prev) => prev.filter((_, idx) => idx !== i));
  const callAI = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const pairs = [];
      let lastQ = null;
      for (const m of messages) {
        if (m.role === "nora") {
          lastQ = m.content;
        } else if (m.role === "user" && lastQ) {
          pairs.push(`${lastQ}
${m.content}`);
          lastQ = null;
        }
      }
      const briefing = pairs.join("\n\n");
      const answers = { "Briefing del proyecto": briefing };
      if (docs.length) {
        answers["Documentos adjuntos"] = docs.map(
          (d) => d.content ? `[${d.name}]: ${d.content.slice(0, 500)}` : d.name
        ).join("\n");
      }
      const res = await fetch(_AI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${_AI_KEY}` },
        body: JSON.stringify({
          projectType: "libre",
          clientName: (selClient == null ? void 0 : selClient.company) || (selClient == null ? void 0 : selClient.name) || "",
          projectName: a.name,
          answers
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAiResult(data);
      setAiTab("roadmap");
    } catch (e) {
      setAiError(e.message || "Error al conectar con Nora");
    } finally {
      setAiLoading(false);
    }
  };
  const hasClients = D.CLIENTS.length > 0;
  const filtered = D.CLIENTS.filter(
    (c) => c.name.toLowerCase().includes(cq.toLowerCase()) || c.company.toLowerCase().includes(cq.toLowerCase())
  );
  const selClient = D.CLIENTS.find((c) => c.id === a.clientId);
  const userAnswers = messages.filter((m) => m.role === "user").length;
  const canNext = [
    !!(a.name.trim() && a.clientId && a.deadline && hasClients),
    userAnswers >= 1,
    !!(aiResult && !aiLoading)
  ];
  const submit = () => {
    const p = D.addProject({ name: a.name.trim(), clientId: a.clientId, deadline: a.deadline, template: "IA" });
    if (aiResult == null ? void 0 : aiResult.phases) {
      localStorage.setItem("141_phases_" + p.id, JSON.stringify(aiResult.phases));
      aiResult.phases.forEach(
        (phase) => (phase.tasks || []).forEach(
          (task) => D.addTask({ projectId: p.id, title: typeof task === "string" ? task : task.title, column: "todo", assignee: "T\xFA", phase: phase.name })
        )
      );
      const total = aiResult.phases.reduce((n, ph) => {
        var _a;
        return n + (((_a = ph.tasks) == null ? void 0 : _a.length) || 0);
      }, 0);
      toast(`Proyecto "${p.name}" creado con ${total} tareas \u2728`, "success");
    } else {
      toast(`Proyecto "${p.name}" creado`, "success");
    }
    onClose();
    onCreate && onCreate(p);
  };
  const NoraAvatar = () => /* @__PURE__ */ React.createElement("div", { style: {
    width: 28,
    height: 28,
    borderRadius: 8,
    flexShrink: 0,
    background: "linear-gradient(135deg,rgba(167,139,250,0.3),rgba(96,165,250,0.3))",
    border: "0.5px solid var(--border-strong)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  } }, /* @__PURE__ */ React.createElement(Icon, { name: "sparkles", size: 13, style: { color: "var(--accent)" } }));
  const STEP_LABELS = ["B\xE1sicos", "Cu\xE9ntale a Nora", "Plan IA"];
  const renderStep0 = () => /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } }, !hasClients && /* @__PURE__ */ React.createElement("div", { style: { padding: 12, background: "var(--amber-soft)", border: "0.5px solid var(--amber)", borderRadius: 10, color: "var(--amber)", fontSize: 13, display: "flex", gap: 10, alignItems: "center" } }, /* @__PURE__ */ React.createElement(Icon, { name: "info", size: 14 }), " ", /* @__PURE__ */ React.createElement("span", null, "Crea primero un cliente antes de a\xF1adir proyectos.")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Nombre del proyecto"), /* @__PURE__ */ React.createElement("input", { className: "input", placeholder: "Ej. Redise\xF1o web 2026", value: a.name, onChange: (e) => set("name", e.target.value), autoFocus: true })), /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Cliente"), /* @__PURE__ */ React.createElement("button", { className: "input row tight", style: { textAlign: "left", height: 38 }, onClick: () => setSearching((s) => !s) }, selClient ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Avatar, { size: "sm", name: selClient.name, initials: selClient.initials, color: selClient.color }), /* @__PURE__ */ React.createElement("span", { className: "grow", style: { textAlign: "left" } }, selClient.name, " \xB7 ", selClient.company), /* @__PURE__ */ React.createElement(Icon, { name: "chevron", size: 12, style: { transform: "rotate(90deg)" } })) : /* @__PURE__ */ React.createElement("span", { className: "muted" }, "Selecciona un cliente")), searching && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, background: "var(--bg-elev-2)", border: "0.5px solid var(--border-strong)", borderRadius: 10, zIndex: 10, overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" } }, /* @__PURE__ */ React.createElement("div", { style: { padding: 8, borderBottom: "0.5px solid var(--border)" } }, /* @__PURE__ */ React.createElement("div", { className: "search" }, /* @__PURE__ */ React.createElement(Icon, { name: "search", size: 13 }), /* @__PURE__ */ React.createElement("input", { autoFocus: true, placeholder: "Buscar\u2026", value: cq, onChange: (e) => setCq(e.target.value) }))), /* @__PURE__ */ React.createElement("div", { style: { maxHeight: 160, overflowY: "auto" } }, filtered.map((c) => /* @__PURE__ */ React.createElement(
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
    /* @__PURE__ */ React.createElement("span", { className: "grow small" }, c.name, " \xB7 ", c.company),
    c.id === a.clientId && /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 13 })
  ))))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Fecha de entrega"), /* @__PURE__ */ React.createElement("input", { className: "input", type: "date", value: a.deadline, onChange: (e) => set("deadline", e.target.value) })));
  const renderStep1 = () => /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", height: 420 } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingBottom: 8, scrollbarWidth: "none" } }, messages.map((msg, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: {
    display: "flex",
    gap: 8,
    alignItems: "flex-end",
    flexDirection: msg.role === "user" ? "row-reverse" : "row"
  } }, msg.role === "nora" && /* @__PURE__ */ React.createElement(NoraAvatar, null), /* @__PURE__ */ React.createElement("div", { style: {
    maxWidth: "80%",
    padding: "10px 14px",
    fontSize: 13,
    lineHeight: 1.6,
    borderRadius: msg.role === "nora" ? "4px 12px 12px 12px" : "12px 4px 12px 12px",
    background: msg.role === "nora" ? "var(--bg-elev-2)" : "var(--accent)",
    color: msg.role === "nora" ? "var(--text)" : "var(--accent-fg)",
    border: msg.role === "nora" ? "0.5px solid var(--border-strong)" : "none"
  } }, msg.content))), typing && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "flex-end" } }, /* @__PURE__ */ React.createElement(NoraAvatar, null), /* @__PURE__ */ React.createElement("div", { style: {
    padding: "10px 16px",
    borderRadius: "4px 12px 12px 12px",
    background: "var(--bg-elev-2)",
    border: "0.5px solid var(--border-strong)",
    display: "flex",
    gap: 4,
    alignItems: "center"
  } }, [0, 1, 2].map((i) => /* @__PURE__ */ React.createElement("div", { key: i, style: {
    width: 5,
    height: 5,
    borderRadius: "50%",
    background: "var(--text-subtle)",
    opacity: 0.5 + i * 0.25
  } })))), noraReady && !typing && /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", padding: "4px 0" } }, /* @__PURE__ */ React.createElement("span", { style: {
    fontSize: 11,
    color: "var(--text-subtle)",
    padding: "4px 10px",
    borderRadius: 20,
    background: "var(--bg-elev-2)",
    border: "0.5px solid var(--border)"
  } }, "\u2713 Nora tiene suficiente contexto \xB7 puedes generar el plan")), /* @__PURE__ */ React.createElement("div", { ref: chatEndRef })), /* @__PURE__ */ React.createElement("div", { style: { borderTop: "0.5px solid var(--border)", paddingTop: 10, display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement(
    "textarea",
    {
      className: "textarea",
      rows: 2,
      placeholder: "Escribe tu respuesta\u2026",
      value: inputVal,
      onChange: (e) => setInputVal(e.target.value),
      onKeyDown: (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      },
      style: { flex: 1, resize: "none", fontSize: 13 },
      disabled: typing || noraReady
    }
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn primary",
      onClick: sendMessage,
      disabled: !inputVal.trim() || typing || noraReady,
      style: { alignSelf: "flex-end", padding: "8px 12px" }
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "arrow", size: 14 })
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("button", { onClick: () => setDocsOpen((o) => !o), style: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "var(--text-subtle)",
    fontSize: 11,
    padding: 0
  } }, /* @__PURE__ */ React.createElement(Icon, { name: "chevron", size: 10, style: { transform: docsOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform .15s" } }), /* @__PURE__ */ React.createElement(Icon, { name: "paperclip", size: 11 }), "Adjuntar contexto", docs.length > 0 && /* @__PURE__ */ React.createElement("span", { style: { color: "var(--accent)", fontWeight: 600 } }, docs.length, " archivo", docs.length > 1 ? "s" : ""), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-muted)" } }, "(opcional)")), docsOpen && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 8, display: "flex", flexDirection: "column", gap: 7 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, /* @__PURE__ */ React.createElement(
    "input",
    {
      ref: fileInputRef,
      type: "file",
      multiple: true,
      accept: ".txt,.md,.csv,.pdf,.doc,.docx,.png,.jpg,.jpeg",
      style: { display: "none" },
      onChange: (e) => {
        handleFiles(e.target.files);
        e.target.value = "";
      }
    }
  ), /* @__PURE__ */ React.createElement("button", { className: "btn sm", style: { flex: 1 }, onClick: () => {
    var _a;
    return (_a = fileInputRef.current) == null ? void 0 : _a.click();
  } }, /* @__PURE__ */ React.createElement(Icon, { name: "folder", size: 12 }), " Subir archivo"), /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "input",
      style: { flex: 2, fontSize: 12, height: 32 },
      placeholder: "https://drive.google.com/\u2026",
      value: urlInput,
      onChange: (e) => setUrlInput(e.target.value),
      onKeyDown: (e) => e.key === "Enter" && addUrl()
    }
  ), /* @__PURE__ */ React.createElement("button", { className: "btn sm", onClick: addUrl }, /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 12 }))), docs.map((d, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    padding: "5px 9px",
    borderRadius: 7,
    background: "var(--bg-elev-2)",
    border: "0.5px solid var(--border)",
    fontSize: 11
  } }, /* @__PURE__ */ React.createElement(
    Icon,
    {
      name: d.type === "url" ? "external-link" : d.content ? "list-todo" : "folder",
      size: 11,
      style: { color: "var(--text-subtle)", flexShrink: 0 }
    }
  ), /* @__PURE__ */ React.createElement("span", { style: { flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, d.name), d.content && /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-muted)", flexShrink: 0 } }, "le\xEDdo"), /* @__PURE__ */ React.createElement("button", { onClick: () => removeDoc(i), style: { background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0 } }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 11 }))))))));
  const renderStep2 = () => {
    var _a, _b, _c;
    if (aiLoading) return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "52px 0", gap: 18 } }, /* @__PURE__ */ React.createElement("div", { style: {
      width: 48,
      height: 48,
      borderRadius: 14,
      background: "linear-gradient(135deg,rgba(167,139,250,0.18),rgba(96,165,250,0.18))",
      border: "0.5px solid var(--border-strong)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    } }, /* @__PURE__ */ React.createElement(Icon, { name: "sparkles", size: 22, style: { color: "var(--accent)" } })), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 600, fontSize: 14 } }, "Nora est\xE1 analizando tu proyecto\u2026"), /* @__PURE__ */ React.createElement("div", { style: { color: "var(--text-subtle)", fontSize: 12, marginTop: 5 } }, "Generando roadmap, materiales y email de kickoff")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, [0, 1, 2].map((i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", opacity: 0.35 + i * 0.3 } }))));
    if (aiError) return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 0", gap: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { color: "var(--red)", fontSize: 13, display: "flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement(Icon, { name: "info", size: 14 }), " ", aiError), /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: callAI }, /* @__PURE__ */ React.createElement(Icon, { name: "list-todo", size: 13 }), " Reintentar"));
    if (!aiResult) return null;
    const TABS = [
      { id: "roadmap", label: "Roadmap", icon: "list-todo" },
      { id: "materials", label: "Materiales", icon: "paperclip" },
      { id: "email", label: "Email kickoff", icon: "mail" }
    ];
    const total = (aiResult.phases || []).reduce((n, ph) => {
      var _a2;
      return n + (((_a2 = ph.tasks) == null ? void 0 : _a2.length) || 0);
    }, 0);
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 12,
      padding: "9px 12px",
      background: "linear-gradient(135deg,rgba(167,139,250,0.08),rgba(96,165,250,0.08))",
      border: "0.5px solid var(--border-strong)",
      borderRadius: 9
    } }, /* @__PURE__ */ React.createElement(Icon, { name: "sparkles", size: 13, style: { color: "var(--accent)" } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "var(--text-subtle)" } }, "Plan generado \xB7 ", /* @__PURE__ */ React.createElement("strong", { style: { color: "var(--text)" } }, total, " tareas"), " en ", /* @__PURE__ */ React.createElement("strong", { style: { color: "var(--text)" } }, ((_a = aiResult == null ? void 0 : aiResult.phases) == null ? void 0 : _a.length) || 0, " fases")), /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", style: { marginLeft: "auto", fontSize: 11 }, onClick: () => {
      setAiResult(null);
      callAI();
    } }, /* @__PURE__ */ React.createElement(Icon, { name: "list-todo", size: 11 }), " Regenerar")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", borderBottom: "0.5px solid var(--border)", marginBottom: 12 } }, TABS.map((t) => /* @__PURE__ */ React.createElement("button", { key: t.id, onClick: () => setAiTab(t.id), style: {
      padding: "7px 13px",
      fontSize: 12,
      fontWeight: aiTab === t.id ? 600 : 400,
      color: aiTab === t.id ? "var(--text)" : "var(--text-subtle)",
      borderBottom: aiTab === t.id ? "2px solid var(--accent)" : "2px solid transparent",
      background: "none",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 5,
      marginBottom: "-0.5px"
    } }, /* @__PURE__ */ React.createElement(Icon, { name: t.icon, size: 12 }), t.label))), aiTab === "roadmap" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 7 } }, (aiResult.phases || []).map((phase, pi) => /* @__PURE__ */ React.createElement("div", { key: pi, style: { border: "0.5px solid var(--border)", borderRadius: 10, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "9px 14px", background: "var(--bg-elev-2)", display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 600, fontSize: 13 } }, phase.name), phase.description && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: "var(--text-subtle)", maxWidth: "60%", textAlign: "right" } }, phase.description)), /* @__PURE__ */ React.createElement("div", { style: { padding: "7px 10px", display: "flex", flexDirection: "column", gap: 3 } }, (phase.tasks || []).map((task, ti) => /* @__PURE__ */ React.createElement("div", { key: ti, style: { display: "flex", alignItems: "center", gap: 8, padding: "5px 8px", borderRadius: 7, fontSize: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 14, height: 14, borderRadius: 4, border: "1.5px solid var(--border-strong)", flexShrink: 0 } }), /* @__PURE__ */ React.createElement("span", { style: { flex: 1 } }, typeof task === "string" ? task : task.title))))))), aiTab === "materials" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 7 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-subtle)", marginBottom: 2 } }, "Pide esto al cliente antes del kickoff:"), (aiResult.materials || []).map((m, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", borderRadius: 9, background: "var(--bg-elev-2)", border: "0.5px solid var(--border)", fontSize: 13 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 18, height: 18, borderRadius: 5, border: "1.5px solid var(--border-strong)", display: "grid", placeItems: "center", flexShrink: 0, marginTop: 1 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 9, color: "var(--text-subtle)" } }, i + 1)), m))), aiTab === "email" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 9 } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "10px 14px", borderRadius: 9, background: "var(--bg-elev-2)", border: "0.5px solid var(--border)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-subtle)", marginBottom: 4 } }, "Asunto"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 500 } }, (_b = aiResult.kickoffEmail) == null ? void 0 : _b.subject)), /* @__PURE__ */ React.createElement("div", { style: { padding: "14px", borderRadius: 9, background: "var(--bg-elev-2)", border: "0.5px solid var(--border)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-subtle)", marginBottom: 8 } }, "Cuerpo"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, lineHeight: 1.65, whiteSpace: "pre-wrap" } }, (_c = aiResult.kickoffEmail) == null ? void 0 : _c.body)), /* @__PURE__ */ React.createElement("button", { className: "btn sm", style: { alignSelf: "flex-start" }, onClick: () => {
      var _a2, _b2;
      navigator.clipboard.writeText(`Asunto: ${(_a2 = aiResult.kickoffEmail) == null ? void 0 : _a2.subject}

${(_b2 = aiResult.kickoffEmail) == null ? void 0 : _b2.body}`);
      toast("Email copiado al portapapeles", "success");
    } }, /* @__PURE__ */ React.createElement(Icon, { name: "paperclip", size: 12 }), " Copiar al portapapeles")));
  };
  const steps = [renderStep0, renderStep1, renderStep2];
  if (!open) return null;
  return /* @__PURE__ */ React.createElement("div", { className: "modal-overlay", onClick: onClose }, /* @__PURE__ */ React.createElement("div", { className: "modal lg", style: { maxWidth: 600 }, onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("div", { className: "modal-head" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "modal-title" }, "Nuevo proyecto"), /* @__PURE__ */ React.createElement("div", { className: "modal-sub" }, STEP_LABELS[step], " \xB7 ", step + 1, " / ", TOTAL_STEPS)), /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only sm", onClick: onClose }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 14 }))), /* @__PURE__ */ React.createElement("div", { style: { padding: "0 24px" } }, /* @__PURE__ */ React.createElement("div", { style: { height: 3, background: "var(--border)", borderRadius: 99, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { height: "100%", width: `${step / (TOTAL_STEPS - 1) * 100}%`, background: "var(--accent)", borderRadius: 99, transition: "width .25s ease" } }))), /* @__PURE__ */ React.createElement("div", { className: "modal-body", style: {
    minHeight: 200,
    maxHeight: "58vh",
    overflowY: "auto",
    scrollbarWidth: "none",
    ...step === 1 ? { padding: "16px 24px 8px" } : {}
  } }, steps[step]()), /* @__PURE__ */ React.createElement("div", { className: "modal-foot" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn",
      disabled: step === 2 && aiLoading,
      onClick: () => step === 0 ? onClose() : setStep((s) => s - 1)
    },
    step === 0 ? "Cancelar" : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Icon, { name: "chevron", size: 12, style: { transform: "rotate(180deg)" } }), " Atr\xE1s")
  ), step < TOTAL_STEPS - 1 ? /* @__PURE__ */ React.createElement("button", { className: "btn primary", disabled: !canNext[step], onClick: () => setStep((s) => s + 1) }, step === 1 ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Icon, { name: "sparkles", size: 12 }), " Generar plan") : /* @__PURE__ */ React.createElement(React.Fragment, null, "Siguiente ", /* @__PURE__ */ React.createElement(Icon, { name: "chevron", size: 12 }))) : /* @__PURE__ */ React.createElement("button", { className: "btn primary", disabled: !canNext[step], onClick: submit }, /* @__PURE__ */ React.createElement(Icon, { name: "sparkles", size: 12 }), " Crear proyecto"))));
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

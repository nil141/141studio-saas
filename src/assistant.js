(function() {
const ASSISTANT_SYSTEM = `Eres "Nora", la asistente operativa de 141'STUDIO, una agencia digital. El usuario es Andr\xE9s, fundador. Hablas en espa\xF1ol, tono cercano, directo, sin formalidades. Sin emojis salvo que \xE9l los use.

Tu trabajo: ayudar a Andr\xE9s a gestionar la agencia. Puedes:
- Crear y asignar tareas a ti misma o al equipo (Marta dise\xF1o, Diego dev, Luc\xEDa copy)
- Hacer seguimiento de proyectos y clientes
- Redactar emails, mensajes a clientes, briefings
- Recordar cosas, organizar la semana

Cuando Andr\xE9s te pida hacer algo accionable (una tarea), DEBES devolver un bloque JSON al final de tu respuesta con este formato exacto:
\`\`\`task
{"title":"...","assignee":"Nora|Marta|Diego|Luc\xEDa|Andr\xE9s","due":"hoy|ma\xF1ana|YYYY-MM-DD","priority":"alta|media|baja","project":"opcional","notes":"opcional"}
\`\`\`
Puedes incluir varios bloques task si son varias tareas. Antes del JSON, una respuesta breve y natural (1-3 frases). No expliques el formato JSON.

Si solo es conversaci\xF3n o pregunta, no incluyas JSON.

Contexto agencia:
- Clientes activos: Acme Co. (redise\xF1o web), Lumen Studio (branding), Norte Caf\xE9 (e-commerce)
- 2 entregables esperando aprobaci\xF3n de Acme
- Factura ACME-003 vencida hace 4 d\xEDas`;
const AssistantPanel = ({ open, onClose }) => {
  var _a;
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hey, \xBFen qu\xE9 te ayudo hoy? Puedo crear tareas, redactar mensajes a clientes o repasar lo de esta semana." }
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [tasks, setTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("nora_tasks") || "[]");
    } catch (e) {
      return [];
    }
  });
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  useEffect(() => {
    localStorage.setItem("nora_tasks", JSON.stringify(tasks));
  }, [tasks]);
  useEffect(() => {
    if (open) setTimeout(() => {
      var _a2;
      return (_a2 = inputRef.current) == null ? void 0 : _a2.focus();
    }, 80);
  }, [open]);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, busy]);
  const send = async (text) => {
    const trimmed = (text != null ? text : input).trim();
    if (!trimmed || busy) return;
    const userMsg = { role: "user", content: trimmed };
    const next = [...messages, userMsg];
    setMessages([...next, { role: "assistant", content: "", thinking: true }]);
    setInput("");
    setBusy(true);
    try {
      const reply = await window.claude.complete({
        messages: [
          { role: "user", content: ASSISTANT_SYSTEM + "\n\n---\n\nConversaci\xF3n hasta ahora:\n" + next.map((m) => (m.role === "user" ? "Andr\xE9s" : "Nora") + ": " + m.content).join("\n") + "\n\nNora:" }
        ]
      });
      const { text: cleanText, tasks: parsedTasks } = parseAssistantReply(reply);
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content: cleanText, tasks: parsedTasks };
        return copy;
      });
      if (parsedTasks.length) {
        setTasks((t) => [
          ...parsedTasks.map((p) => ({ ...p, id: "t" + Date.now() + Math.random().toString(36).slice(2, 5), createdAt: (/* @__PURE__ */ new Date()).toISOString(), status: "open" })),
          ...t
        ]);
      }
    } catch (e) {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content: "Vaya, no he podido conectar. \xBFLo intentamos de nuevo?" };
        return copy;
      });
    }
    setBusy(false);
  };
  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };
  const quickPrompts = [
    "Recordatorio: llamar a Acme ma\xF1ana 10:00",
    "P\xEDdele a Marta que mande mockups v3 hoy",
    "Resume c\xF3mo va la semana",
    "Redacta email para Lumen sobre la factura"
  ];
  if (!open) return null;
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { onClick: onClose, style: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    zIndex: 90,
    animation: "fade .15s ease-out"
  } }), /* @__PURE__ */ React.createElement("div", { style: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    width: 440,
    background: "var(--bg-elev)",
    borderLeft: "0.5px solid var(--border)",
    zIndex: 91,
    display: "flex",
    flexDirection: "column",
    animation: "slidein .22s cubic-bezier(.2,.8,.2,1)"
  } }, /* @__PURE__ */ React.createElement("style", null, `
          @keyframes slidein { from { transform: translateX(20px); opacity: 0; } to { transform: none; opacity: 1; } }
          @keyframes pulse { 0%,100% { opacity: .35; } 50% { opacity: 1; } }
          .nora-dot { animation: pulse 1.2s infinite; }
          .nora-dot:nth-child(2) { animation-delay: .15s; }
          .nora-dot:nth-child(3) { animation-delay: .3s; }
          .nora-msg { line-height: 1.55; font-size: 13.5px; white-space: pre-wrap; word-wrap: break-word; }
          .nora-msg b { font-weight: 500; }
        `), /* @__PURE__ */ React.createElement("div", { style: { padding: "14px 16px", borderBottom: "0.5px solid var(--border)", display: "flex", alignItems: "center", gap: 12 } }, /* @__PURE__ */ React.createElement("div", { style: {
    width: 32,
    height: 32,
    borderRadius: 10,
    background: "linear-gradient(135deg,#a78bfa 0%,#60a5fa 100%)",
    display: "grid",
    placeItems: "center",
    color: "#fff"
  } }, /* @__PURE__ */ React.createElement(Icon, { name: "sparkles", size: 15 })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 500, fontSize: 14, fontFamily: "var(--font-display)" } }, "Nora"), /* @__PURE__ */ React.createElement("div", { className: "subtle xsmall", style: { display: "flex", alignItems: "center", gap: 5 } }, /* @__PURE__ */ React.createElement("span", { className: "dot green", style: { width: 5, height: 5, boxShadow: "none" } }), " Tu asistente \xB7 ", tasks.filter((t) => t.status === "open").length, " tareas activas")), /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only sm", "data-tooltip": "Limpiar conversaci\xF3n", onClick: () => setMessages([{ role: "assistant", content: "Empezamos de cero. \xBFQu\xE9 necesitas?" }]) }, /* @__PURE__ */ React.createElement(Icon, { name: "rotate-ccw", size: 13 })), /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only sm", onClick: onClose }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 14 }))), /* @__PURE__ */ React.createElement("div", { ref: scrollRef, style: { flex: 1, overflowY: "auto", padding: "18px 16px", display: "flex", flexDirection: "column", gap: 14 } }, messages.map((m, i) => /* @__PURE__ */ React.createElement(NoraMessage, { key: i, m })), busy && ((_a = messages[messages.length - 1]) == null ? void 0 : _a.thinking) && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4, padding: "4px 8px" } }, /* @__PURE__ */ React.createElement("span", { className: "dot muted nora-dot", style: { width: 5, height: 5, boxShadow: "none" } }), /* @__PURE__ */ React.createElement("span", { className: "dot muted nora-dot", style: { width: 5, height: 5, boxShadow: "none" } }), /* @__PURE__ */ React.createElement("span", { className: "dot muted nora-dot", style: { width: 5, height: 5, boxShadow: "none" } })), messages.length <= 1 && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 8 } }, /* @__PURE__ */ React.createElement("div", { className: "subtle xsmall", style: { marginBottom: 8 } }, "Prueba preguntando\u2026"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, quickPrompts.map((q) => /* @__PURE__ */ React.createElement("button", { key: q, onClick: () => send(q), style: {
    textAlign: "left",
    padding: "8px 12px",
    background: "var(--bg-elev-2)",
    border: "0.5px solid var(--border)",
    borderRadius: 8,
    fontSize: 12.5,
    color: "var(--text-muted)",
    cursor: "pointer",
    fontFamily: "inherit"
  } }, q))))), tasks.filter((t) => t.status === "open").length > 0 && /* @__PURE__ */ React.createElement("div", { style: { padding: "10px 16px", borderTop: "0.5px solid var(--border)", background: "var(--bg)" } }, /* @__PURE__ */ React.createElement("div", { className: "row between", style: { marginBottom: 6 } }, /* @__PURE__ */ React.createElement("div", { className: "xsmall subtle", style: { fontWeight: 500 } }, "Tareas pendientes"), /* @__PURE__ */ React.createElement("span", { className: "xsmall subtle" }, tasks.filter((t) => t.status === "open").length)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4, maxHeight: 120, overflowY: "auto" } }, tasks.filter((t) => t.status === "open").slice(0, 4).map((t) => /* @__PURE__ */ React.createElement("div", { key: t.id, style: { display: "flex", alignItems: "center", gap: 8, padding: "4px 0", fontSize: 12.5 } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setTasks((ts) => ts.map((x) => x.id === t.id ? { ...x, status: "done" } : x)),
      style: { width: 14, height: 14, borderRadius: 4, border: "0.5px solid var(--border-strong)", background: "transparent", cursor: "pointer", flexShrink: 0 }
    }
  ), /* @__PURE__ */ React.createElement("span", { className: "grow truncate" }, t.title), /* @__PURE__ */ React.createElement("span", { className: "chip", style: { fontSize: 10, padding: "0 6px" } }, t.assignee), t.priority === "alta" && /* @__PURE__ */ React.createElement("span", { className: "dot red", style: { width: 5, height: 5, boxShadow: "none" } }))))), /* @__PURE__ */ React.createElement("div", { style: { padding: 12, borderTop: "0.5px solid var(--border)" } }, /* @__PURE__ */ React.createElement("div", { style: {
    display: "flex",
    alignItems: "flex-end",
    gap: 8,
    background: "var(--bg-elev-2)",
    border: "0.5px solid var(--border-strong)",
    borderRadius: 12,
    padding: 8
  } }, /* @__PURE__ */ React.createElement(
    "textarea",
    {
      ref: inputRef,
      value: input,
      onChange: (e) => setInput(e.target.value),
      onKeyDown: onKey,
      placeholder: "Escribe a Nora o p\xEDdele algo\u2026",
      rows: 1,
      style: {
        flex: 1,
        border: 0,
        outline: 0,
        background: "transparent",
        resize: "none",
        fontFamily: "inherit",
        fontSize: 13.5,
        color: "var(--text)",
        padding: "4px 6px",
        maxHeight: 120,
        lineHeight: 1.5
      }
    }
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn primary icon-only sm",
      disabled: !input.trim() || busy,
      onClick: () => send(),
      style: { opacity: !input.trim() || busy ? 0.5 : 1 }
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "arrow", size: 12 })
  )), /* @__PURE__ */ React.createElement("div", { className: "row between", style: { marginTop: 6, padding: "0 4px" } }, /* @__PURE__ */ React.createElement("span", { className: "subtle xsmall" }, "Enter para enviar \xB7 Shift+Enter nueva l\xEDnea"), /* @__PURE__ */ React.createElement("span", { className: "subtle xsmall", style: { display: "flex", alignItems: "center", gap: 4 } }, /* @__PURE__ */ React.createElement(Icon, { name: "sparkles", size: 10 }), " Powered by Claude")))));
};
const NoraMessage = ({ m }) => {
  if (m.role === "user") {
    return /* @__PURE__ */ React.createElement("div", { style: { alignSelf: "flex-end", maxWidth: "85%" } }, /* @__PURE__ */ React.createElement("div", { style: {
      background: "var(--accent)",
      color: "var(--accent-fg)",
      padding: "8px 12px",
      borderRadius: "12px 12px 4px 12px",
      fontSize: 13.5,
      lineHeight: 1.5,
      whiteSpace: "pre-wrap"
    } }, m.content));
  }
  if (m.thinking) return null;
  return /* @__PURE__ */ React.createElement("div", { style: { alignSelf: "flex-start", maxWidth: "92%", display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("div", { style: {
    width: 22,
    height: 22,
    borderRadius: 6,
    flexShrink: 0,
    background: "linear-gradient(135deg,#a78bfa 0%,#60a5fa 100%)",
    display: "grid",
    placeItems: "center",
    color: "#fff",
    marginTop: 2
  } }, /* @__PURE__ */ React.createElement(Icon, { name: "sparkles", size: 11 })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { className: "nora-msg", dangerouslySetInnerHTML: { __html: formatMarkdownish(m.content) } }), m.tasks && m.tasks.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 10, display: "flex", flexDirection: "column", gap: 6 } }, m.tasks.map((t, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: {
    background: "var(--bg-elev-2)",
    border: "0.5px solid var(--border)",
    borderRadius: 10,
    padding: "10px 12px",
    display: "flex",
    alignItems: "flex-start",
    gap: 10
  } }, /* @__PURE__ */ React.createElement("div", { style: {
    width: 26,
    height: 26,
    borderRadius: 7,
    flexShrink: 0,
    background: "var(--green-soft)",
    color: "var(--green)",
    display: "grid",
    placeItems: "center"
  } }, /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 13 })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 500, fontSize: 13, marginBottom: 4 } }, t.title), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 } }, /* @__PURE__ */ React.createElement("span", { className: "chip" }, t.assignee), t.due && /* @__PURE__ */ React.createElement("span", { className: "chip" }, /* @__PURE__ */ React.createElement(Icon, { name: "calendar", size: 10 }), " ", t.due), t.priority && /* @__PURE__ */ React.createElement("span", { className: "chip " + (t.priority === "alta" ? "red" : t.priority === "media" ? "amber" : "") }, t.priority), t.project && /* @__PURE__ */ React.createElement("span", { className: "chip blue" }, t.project)), t.notes && /* @__PURE__ */ React.createElement("div", { className: "muted xsmall", style: { marginTop: 6, lineHeight: 1.5 } }, t.notes)))), /* @__PURE__ */ React.createElement("div", { className: "subtle xsmall", style: { display: "flex", alignItems: "center", gap: 5 } }, /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 10 }), " A\xF1adidas a tu lista"))));
};
function parseAssistantReply(raw) {
  const tasks = [];
  let text = raw || "";
  const re = /```task\s*([\s\S]*?)```/g;
  let match;
  while ((match = re.exec(raw)) !== null) {
    try {
      const obj = JSON.parse(match[1].trim());
      tasks.push(obj);
    } catch (e) {
    }
  }
  text = text.replace(re, "").trim();
  return { text, tasks };
}
function formatMarkdownish(s) {
  if (!s) return "";
  let out = s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  out = out.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
  out = out.replace(/`([^`]+)`/g, '<code style="background:var(--bg-elev-2);padding:1px 5px;border-radius:4px;font-family:var(--font-mono);font-size:11.5px">$1</code>');
  return out;
}
const NoraPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, busy]);
  useEffect(() => {
    var _a;
    (_a = inputRef.current) == null ? void 0 : _a.focus();
  }, []);
  const send = async (text) => {
    const trimmed = (text != null ? text : input).trim();
    if (!trimmed || busy) return;
    const userMsg = { role: "user", content: trimmed };
    const history = [...messages, userMsg];
    setMessages([...history, { role: "assistant", content: "", thinking: true }]);
    setInput("");
    setBusy(true);
    try {
      const reply = await window.claude.complete({
        messages: [{ role: "user", content: ASSISTANT_SYSTEM + "\n\n---\n\nConversaci\xF3n:\n" + history.map((m) => (m.role === "user" ? "T\xFA" : "Nora") + ": " + m.content).join("\n") + "\n\nNora:" }]
      });
      const { text: cleanText, tasks: parsedTasks } = parseAssistantReply(reply);
      setMessages((m) => {
        const c = [...m];
        c[c.length - 1] = { role: "assistant", content: cleanText, tasks: parsedTasks };
        return c;
      });
    } catch (e) {
      setMessages((m) => {
        const c = [...m];
        c[c.length - 1] = { role: "assistant", content: "No he podido conectar. \xBFLo intentamos de nuevo?" };
        return c;
      });
    }
    setBusy(false);
  };
  const quickPrompts = [
    "Mis puntos d\xE9biles",
    "\xBFQu\xE9 hacer hoy?",
    "Repaso semanal",
    "Analiza la carga de trabajo",
    "Necesito motivaci\xF3n"
  ];
  const isEmpty = messages.length === 0;
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg)" } }, /* @__PURE__ */ React.createElement("style", null, `
        @keyframes pulse { 0%,100%{opacity:.3}50%{opacity:1} }
        .nora-dot { animation: pulse 1.2s infinite; }
        .nora-dot:nth-child(2) { animation-delay:.15s; }
        .nora-dot:nth-child(3) { animation-delay:.3s; }
        .nora-msg { line-height:1.6; font-size:14px; white-space:pre-wrap; word-wrap:break-word; }
        .nora-msg b { font-weight:500; }
      `), /* @__PURE__ */ React.createElement("div", { style: { height: 56, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", flexShrink: 0 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15, fontWeight: 500, letterSpacing: "-0.5px" } }, "Nora IA"), /* @__PURE__ */ React.createElement("button", { onClick: () => setMessages([]), style: { position: "absolute", right: 16, width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "0.5px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" } }, /* @__PURE__ */ React.createElement(Icon, { name: "rotate-ccw", size: 14 }))), /* @__PURE__ */ React.createElement("div", { ref: scrollRef, style: { flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" } }, isEmpty ? /* @__PURE__ */ React.createElement("div", { style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px", gap: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "0.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(Icon, { name: "sparkles", size: 28, strokeWidth: 1.4, color: "var(--text-muted)" })), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 28, fontWeight: 400, letterSpacing: "-1.2px", marginBottom: 8 } }, "\xBFEn qu\xE9 te ayudo?"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: "var(--text-muted)", letterSpacing: "-0.4px" } }, "Gestiona tu agencia, crea tareas y redacta mensajes con tu asistente IA."))) : /* @__PURE__ */ React.createElement("div", { style: { flex: 1, display: "flex", flexDirection: "column", gap: 16, padding: "24px 32px 8px", width: "100%", boxSizing: "border-box" } }, messages.map((m, i) => m.thinking ? null : /* @__PURE__ */ React.createElement(NoraMessage, { key: i, m })), busy && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4, padding: "4px 0" } }, /* @__PURE__ */ React.createElement("span", { className: "dot muted nora-dot", style: { width: 5, height: 5, boxShadow: "none" } }), /* @__PURE__ */ React.createElement("span", { className: "dot muted nora-dot", style: { width: 5, height: 5, boxShadow: "none" } }), /* @__PURE__ */ React.createElement("span", { className: "dot muted nora-dot", style: { width: 5, height: 5, boxShadow: "none" } })))), /* @__PURE__ */ React.createElement("div", { style: { flexShrink: 0, padding: "12px 32px calc(28px + env(safe-area-inset-bottom))", width: "100%", boxSizing: "border-box" } }, isEmpty && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, scrollbarWidth: "none" } }, quickPrompts.map((q) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: q,
      onClick: () => send(q),
      style: { flexShrink: 0, padding: "8px 16px", borderRadius: 99, background: "#0d0d0d", border: "0.5px solid rgba(255,255,255,0.1)", color: "var(--text-muted)", fontSize: 13, letterSpacing: "-0.4px", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", transition: "background .12s" },
      onMouseEnter: (e) => e.currentTarget.style.background = "#1a1a1a",
      onMouseLeave: (e) => e.currentTarget.style.background = "#0d0d0d"
    },
    q
  ))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.04)", border: "0.5px solid var(--border-strong)", borderRadius: 16, padding: "10px 10px 10px 16px" } }, /* @__PURE__ */ React.createElement(
    "textarea",
    {
      ref: inputRef,
      value: input,
      onChange: (e) => setInput(e.target.value),
      onKeyDown: (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          send();
        }
      },
      placeholder: "Escribe a Nora\u2026",
      rows: 1,
      style: { flex: 1, border: 0, outline: 0, background: "transparent", resize: "none", fontFamily: "inherit", fontSize: 14, color: "var(--text)", letterSpacing: "-0.4px", lineHeight: 1.5, maxHeight: 120 }
    }
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => send(),
      disabled: !input.trim() || busy,
      style: { width: 34, height: 34, borderRadius: "50%", background: input.trim() && !busy ? "var(--accent)" : "rgba(255,255,255,0.08)", border: "none", cursor: input.trim() && !busy ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0, opacity: input.trim() && !busy ? 1 : 0.4, transition: "all .15s" }
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "arrow-up", size: 15 })
  ))));
};
Object.assign(window, { AssistantPanel, NoraPage });

})();
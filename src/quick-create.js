(function() {
const { useState, useEffect } = React;
const TYPES = [
  { id: "task", label: "Tarea", icon: "list-todo" },
  { id: "event", label: "Evento", icon: "calendar" },
  { id: "meeting", label: "Reuni\xF3n", icon: "users" }
];
const FREQ_OPTS = [
  { id: "once", label: "Una vez" },
  { id: "daily", label: "Diaria" },
  { id: "weekly", label: "Semanal" },
  { id: "monthly", label: "Mensual" }
];
const today = () => {
  const n = /* @__PURE__ */ new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
};
const QuickCreateModal = ({ open, onClose, defaultType = "task", defaultDate = "", lockType = false, openModal }) => {
  const D = window.Data;
  D.useStore();
  const [type, setType] = useState(defaultType);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [clientId, setClientId] = useState("");
  const [date, setDate] = useState(today());
  const [time, setTime] = useState("");
  const [timeEnd, setTimeEnd] = useState("");
  const [freq, setFreq] = useState("once");
  const [activeTab, setActiveTab] = useState(null);
  const [pickerFor, setPickerFor] = useState(null);
  useEffect(() => {
    if (open) {
      setTitle("");
      setDesc("");
      setClientId("");
      setDate(defaultDate || today());
      setTime("");
      setTimeEnd("");
      setFreq("once");
      setType(defaultType);
      setActiveTab(null);
      setPickerFor(null);
    }
  }, [open, defaultType, defaultDate]);
  useEffect(() => {
    if (!open) return;
    const fn = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open]);
  if (!open) return null;
  const canSubmit = title.trim().length > 0;
  const handleSubmit = () => {
    if (!canSubmit) return;
    const t = title.trim();
    if (type === "task") {
      const deadline = defaultDate || null;
      if (clientId) {
        const client = D.CLIENTS.find((c) => c.id === clientId);
        const proj = D.PROJECTS.find((p) => p.clientId === clientId);
        if (proj) {
          D.addTask({ projectId: proj.id, title: t, column: "todo", assignee: "", deadline, time: time || null, frequency: freq, notes: desc || null });
        } else {
          D.addTask({ title: t, column: "todo", assignee: "", clientId, clientName: (client == null ? void 0 : client.company) || (client == null ? void 0 : client.name) || "", deadline, time: time || null, frequency: freq, notes: desc || null });
        }
      } else {
        D.addTask({ title: t, column: "todo", assignee: "", deadline, time: time || null, frequency: freq, notes: desc || null });
      }
    } else if (type === "event" || type === "meeting") {
      const CUSTOM_KEY = "agenda_custom_events";
      const prev = (() => {
        try {
          return JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]");
        } catch (e) {
          return [];
        }
      })();
      localStorage.setItem(CUSTOM_KEY, JSON.stringify([...prev, {
        id: "custom-" + Date.now(),
        date,
        title: t,
        time: time || null,
        timeEnd: timeEnd || null,
        frequency: freq,
        type: type === "meeting" ? "meeting" : "custom"
      }]));
    }
    onClose();
  };
  const accentColor = { task: "var(--accent)", event: "#60a5fa", meeting: "#34d399" }[type];
  const accentHex = { task: "#9e9ae5", event: "#60a5fa", meeting: "#34d399" }[type];
  const tabs = [
    ...type === "task" ? [{ id: "client", label: "Cliente", icon: "users", hasVal: !!clientId }] : [],
    { id: "freq", label: "Frecuencia", icon: "refresh-cw", hasVal: freq !== "once" },
    { id: "time", label: "Hora", icon: "clock", hasVal: !!time },
    ...type !== "task" ? [{ id: "date", label: "Fecha", icon: "calendar", hasVal: false }] : []
  ];
  const toggleTab = (id) => setActiveTab((prev) => prev === id ? null : id);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
    "div",
    {
      style: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.78)",
        backdropFilter: "blur(16px)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        animation: "fade .15s ease-out"
      },
      onClick: onClose
    },
    /* @__PURE__ */ React.createElement(
      "div",
      {
        onClick: (e) => e.stopPropagation(),
        style: {
          width: "100%",
          maxWidth: 520,
          background: "#111111",
          border: "0.5px solid rgba(255,255,255,0.08)",
          borderRadius: 32,
          animation: "pop .2s cubic-bezier(.2,.8,.2,1)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minHeight: 420
        }
      },
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 22px 0" } }, /* @__PURE__ */ React.createElement("button", { onClick: onClose, style: {
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
      } }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 15 })), lockType ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "var(--text-subtle)", letterSpacing: "-0.5px" } }, "Crear nuevo") : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, TYPES.map((tp) => /* @__PURE__ */ React.createElement("button", { key: tp.id, onClick: () => setType(tp.id), style: {
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "6px 13px",
        borderRadius: 99,
        background: type === tp.id ? "rgba(255,255,255,0.09)" : "transparent",
        border: type === tp.id ? "0.5px solid rgba(255,255,255,0.15)" : "0.5px solid rgba(255,255,255,0.06)",
        color: type === tp.id ? "var(--text)" : "var(--text-subtle)",
        fontSize: 12,
        letterSpacing: "-0.4px",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        transition: "all .1s"
      } }, /* @__PURE__ */ React.createElement(Icon, { name: tp.icon, size: 12, strokeWidth: 1.6 }), tp.label))), /* @__PURE__ */ React.createElement("button", { onClick: handleSubmit, style: {
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: canSubmit ? accentColor : "rgba(255,255,255,0.08)",
        border: "none",
        cursor: canSubmit ? "pointer" : "default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        transition: "all .15s",
        opacity: canSubmit ? 1 : 0.4
      } }, /* @__PURE__ */ React.createElement(Icon, { name: "arrow-up", size: 15 }))),
      /* @__PURE__ */ React.createElement("div", { style: { padding: "28px 28px 8px" } }, /* @__PURE__ */ React.createElement(
        "input",
        {
          autoFocus: true,
          placeholder: { task: "Nombre de la tarea...", event: "Nombre del evento...", meeting: "Nombre de la reuni\xF3n..." }[type],
          value: title,
          onChange: (e) => setTitle(e.target.value),
          onKeyDown: (e) => {
            if (e.key === "Enter" && canSubmit) handleSubmit();
          },
          style: {
            width: "100%",
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: 28,
            fontWeight: 400,
            letterSpacing: "-1.4px",
            color: title ? "var(--text)" : "rgba(255,255,255,0.15)",
            fontFamily: "var(--font-display)",
            caretColor: accentColor
          }
        }
      ), /* @__PURE__ */ React.createElement(
        "input",
        {
          placeholder: "Descripci\xF3n (opcional)",
          value: desc,
          onChange: (e) => setDesc(e.target.value),
          style: {
            width: "100%",
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: 14,
            letterSpacing: "-0.5px",
            marginTop: 8,
            color: desc ? "var(--text-muted)" : "rgba(255,255,255,0.13)",
            fontFamily: "var(--font-sans)",
            caretColor: accentColor
          }
        }
      )),
      /* @__PURE__ */ React.createElement("div", { style: { flex: 1, padding: "0 28px", minHeight: 120, display: "flex", alignItems: "center", justifyContent: "center" } }, !activeTab && /* @__PURE__ */ React.createElement("div", { style: { color: "rgba(255,255,255,0.08)", fontSize: 13, letterSpacing: "-0.5px" } }, "Selecciona una opci\xF3n abajo"), activeTab === "client" && /* @__PURE__ */ React.createElement("div", { style: { width: "100%", maxHeight: 180, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 } }, D.CLIENTS.length === 0 ? /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: "var(--text-subtle)", textAlign: "center" } }, "Sin clientes") : [...D.CLIENTS].sort((a, b) => (a.company || a.name || "").localeCompare(b.company || b.name || "")).map((c) => /* @__PURE__ */ React.createElement("button", { key: c.id, onClick: () => setClientId(clientId === c.id ? "" : c.id), style: {
        padding: "10px 16px",
        borderRadius: 12,
        fontSize: 13,
        letterSpacing: "-0.5px",
        background: clientId === c.id ? accentHex + "22" : "rgba(255,255,255,0.04)",
        border: clientId === c.id ? `1px solid ${accentHex}55` : "0.5px solid rgba(255,255,255,0.08)",
        color: clientId === c.id ? accentHex : "var(--text-muted)",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        transition: "all .1s",
        textAlign: "left",
        width: "100%"
      } }, c.company || c.name))), activeTab === "freq" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" } }, FREQ_OPTS.map((f) => /* @__PURE__ */ React.createElement("button", { key: f.id, onClick: () => setFreq(f.id), style: {
        padding: "8px 18px",
        borderRadius: 99,
        fontSize: 13,
        letterSpacing: "-0.5px",
        background: freq === f.id ? accentHex + "22" : "rgba(255,255,255,0.07)",
        border: freq === f.id ? `1px solid ${accentHex}66` : "0.5px solid rgba(255,255,255,0.12)",
        color: freq === f.id ? accentHex : "var(--text-muted)",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        transition: "all .1s"
      } }, f.label))), activeTab === "time" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12 } }, /* @__PURE__ */ React.createElement("button", { onClick: () => setPickerFor("start"), style: {
        padding: "10px 22px",
        borderRadius: 14,
        cursor: "pointer",
        background: time ? accentHex + "22" : "rgba(255,255,255,0.07)",
        border: time ? `1px solid ${accentHex}66` : "0.5px solid rgba(255,255,255,0.12)",
        color: time ? accentHex : "var(--text-muted)",
        fontSize: 22,
        fontWeight: 300,
        letterSpacing: "-1px",
        fontFamily: "var(--font-display)",
        transition: "all .1s"
      } }, time || "00:00"), (type === "event" || type === "meeting") && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 16, color: "var(--text-subtle)" } }, "\u2013"), /* @__PURE__ */ React.createElement("button", { onClick: () => setPickerFor("end"), style: {
        padding: "10px 22px",
        borderRadius: 14,
        cursor: "pointer",
        background: timeEnd ? accentHex + "22" : "rgba(255,255,255,0.07)",
        border: timeEnd ? `1px solid ${accentHex}66` : "0.5px solid rgba(255,255,255,0.12)",
        color: timeEnd ? accentHex : "var(--text-muted)",
        fontSize: 22,
        fontWeight: 300,
        letterSpacing: "-1px",
        fontFamily: "var(--font-display)",
        transition: "all .1s"
      } }, timeEnd || "00:00"))), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "var(--text-subtle)" } }, "Toca para cambiar la hora")), activeTab === "date" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 12 } }, /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "date",
          value: date,
          onChange: (e) => setDate(e.target.value),
          style: {
            background: "rgba(255,255,255,0.07)",
            border: "0.5px solid rgba(255,255,255,0.14)",
            borderRadius: 14,
            color: "var(--text)",
            fontSize: 16,
            padding: "10px 22px",
            fontFamily: "var(--font-sans)",
            letterSpacing: "-0.5px"
          }
        }
      ))),
      /* @__PURE__ */ React.createElement("div", { style: { height: "0.5px", background: "rgba(255,255,255,0.07)", margin: "0 0 0 0" } }),
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, padding: "16px 22px 22px", flexWrap: "wrap" } }, tabs.map((tab) => {
        var _a;
        return /* @__PURE__ */ React.createElement("button", { key: tab.id, onClick: () => toggleTab(tab.id), style: {
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 16px",
          borderRadius: 99,
          background: activeTab === tab.id ? accentHex + "22" : tab.hasVal ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.05)",
          border: activeTab === tab.id ? `0.5px solid ${accentHex}55` : tab.hasVal ? "0.5px solid rgba(255,255,255,0.18)" : "0.5px solid rgba(255,255,255,0.08)",
          color: activeTab === tab.id ? accentHex : tab.hasVal ? "var(--text)" : "var(--text-subtle)",
          fontSize: 13,
          letterSpacing: "-0.5px",
          cursor: "pointer",
          fontFamily: "var(--font-sans)",
          transition: "all .12s"
        } }, /* @__PURE__ */ React.createElement(Icon, { name: tab.icon, size: 13, strokeWidth: 1.6 }), tab.label, tab.id === "client" && clientId && /* @__PURE__ */ React.createElement("span", { style: { width: 6, height: 6, borderRadius: "50%", background: accentHex, flexShrink: 0 } }), tab.id === "freq" && freq !== "once" && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, color: accentHex, marginLeft: 2 } }, (_a = FREQ_OPTS.find((f) => f.id === freq)) == null ? void 0 : _a.label), tab.id === "time" && time && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, color: accentHex, marginLeft: 2 } }, time));
      }))
    )
  ), pickerFor && /* @__PURE__ */ React.createElement(
    TimePicker,
    {
      value: pickerFor === "start" ? time : timeEnd,
      onChange: (v) => pickerFor === "start" ? setTime(v) : setTimeEnd(v),
      onClose: () => setPickerFor(null)
    }
  ));
};
window.QuickCreateModal = QuickCreateModal;

})();
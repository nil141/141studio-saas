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
  const submitBg = { task: "rgb(130,119,219)", event: "#3b82f6", meeting: "#10b981" }[type];
  const typeName = { task: "Nueva tarea", event: "Nuevo evento", meeting: "Nueva reuni\xF3n" }[type];
  const OD_INPUT = {
    width: "100%",
    padding: "17px 22px",
    fontSize: 16,
    borderRadius: 18,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "var(--text)",
    outline: "none",
    fontFamily: "inherit",
    letterSpacing: "-0.3px",
    transition: "border-color .2s, background .2s"
  };
  const OD_LABEL = { fontSize: 15, color: "var(--text-muted)", letterSpacing: "-0.3px", marginBottom: 12 };
  const chip = (on) => ({
    padding: "13px 19px",
    borderRadius: 16,
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 14,
    letterSpacing: "-0.3px",
    transition: "all .15s",
    background: on ? accentHex + "1f" : "transparent",
    border: on ? `1px solid ${accentHex}99` : "1px solid rgba(255,255,255,0.1)",
    color: on ? accentHex : "var(--text-muted)"
  });
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { onClick: onClose, style: {
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
  } }, /* @__PURE__ */ React.createElement("style", null, `.od-input:focus { border-color: ${accentHex}80 !important; background: ${accentHex}0d !important; }`), /* @__PURE__ */ React.createElement("div", { onClick: (e) => e.stopPropagation(), style: {
    width: "100%",
    maxWidth: 620,
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#0e0e10",
    border: "1px solid #232324",
    borderRadius: 32,
    padding: "38px 42px 34px",
    boxShadow: "0 40px 90px rgba(0,0,0,0.6)",
    animation: "pop .2s cubic-bezier(.2,.8,.2,1)"
  } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 18, marginBottom: lockType ? 32 : 26 } }, /* @__PURE__ */ React.createElement("button", { onClick: onClose, style: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    flexShrink: 0,
    cursor: "pointer",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.06)",
    display: "grid",
    placeItems: "center",
    color: "var(--text-muted)"
  } }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 17 })), /* @__PURE__ */ React.createElement("h1", { style: { fontSize: 32, fontWeight: 400, letterSpacing: "-0.04em", margin: 0 } }, typeName)), !lockType && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, marginBottom: 28 } }, TYPES.map((tp) => {
    const on = type === tp.id;
    return /* @__PURE__ */ React.createElement("button", { key: tp.id, onClick: () => setType(tp.id), style: {
      ...chip(on),
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      padding: "15px 12px"
    } }, /* @__PURE__ */ React.createElement(Icon, { name: tp.icon, size: 14, strokeWidth: 1.6 }), tp.label);
  })), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 28 } }, /* @__PURE__ */ React.createElement("div", { style: OD_LABEL }, "Nombre"), /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "od-input",
      style: OD_INPUT,
      autoFocus: true,
      placeholder: { task: "Nombre de la tarea", event: "Nombre del evento", meeting: "Nombre de la reuni\xF3n" }[type],
      value: title,
      onChange: (e) => setTitle(e.target.value),
      onKeyDown: (e) => {
        if (e.key === "Enter" && canSubmit) handleSubmit();
      }
    }
  ), /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "od-input",
      style: { ...OD_INPUT, marginTop: 12, fontSize: 15 },
      placeholder: "Descripci\xF3n (opcional)",
      value: desc,
      onChange: (e) => setDesc(e.target.value)
    }
  )), type === "task" && D.CLIENTS.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 28 } }, /* @__PURE__ */ React.createElement("div", { style: OD_LABEL }, "Cliente ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-subtle)" } }, "(opcional)")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap", maxHeight: 158, overflowY: "auto" } }, [...D.CLIENTS].sort((a, b) => (a.company || a.name || "").localeCompare(b.company || b.name || "")).map((c) => /* @__PURE__ */ React.createElement("button", { key: c.id, onClick: () => setClientId(clientId === c.id ? "" : c.id), style: chip(clientId === c.id) }, c.company || c.name)))), type !== "task" && /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 28 } }, /* @__PURE__ */ React.createElement("div", { style: OD_LABEL }, "Fecha"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "date",
      className: "od-input",
      style: { ...OD_INPUT, colorScheme: "dark" },
      value: date,
      onChange: (e) => setDate(e.target.value)
    }
  )), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr auto", gap: 24, marginBottom: 34 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: OD_LABEL }, "Frecuencia"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap" } }, FREQ_OPTS.map((f) => /* @__PURE__ */ React.createElement("button", { key: f.id, onClick: () => setFreq(f.id), style: chip(freq === f.id) }, f.label)))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: OD_LABEL }, "Hora ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-subtle)" } }, "(opcional)")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { onClick: () => setPickerFor("start"), style: { ...chip(!!time), fontVariantNumeric: "tabular-nums" } }, time || "00:00"), (type === "event" || type === "meeting") && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15, color: "var(--text-subtle)" } }, "\u2013"), /* @__PURE__ */ React.createElement("button", { onClick: () => setPickerFor("end"), style: { ...chip(!!timeEnd), fontVariantNumeric: "tabular-nums" } }, timeEnd || "00:00"))))), /* @__PURE__ */ React.createElement("button", { onClick: handleSubmit, disabled: !canSubmit, style: {
    width: "100%",
    height: 56,
    borderRadius: 18,
    border: 0,
    cursor: "pointer",
    background: submitBg,
    color: "#fff",
    fontSize: 16,
    fontFamily: "inherit",
    letterSpacing: "-0.3px",
    fontWeight: 500,
    transition: "opacity .2s",
    opacity: canSubmit ? 1 : 0.35
  } }, "Crear ", { task: "tarea", event: "evento", meeting: "reuni\xF3n" }[type]))), pickerFor && /* @__PURE__ */ React.createElement(
    TimePicker,
    {
      value: pickerFor === "start" ? time : timeEnd,
      onChange: (v) => pickerFor === "start" ? setTime(v) : setTimeEnd(v),
      onClose: () => setPickerFor(null)
    }
  ));
};
window.QuickCreateModal = QuickCreateModal;

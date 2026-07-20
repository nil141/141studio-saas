// QuickCreate — modal estilo Outdomode
// (usa los hooks globales de primitives.js)

const TYPES = [
  { id: "task",    label: "Tarea",   icon: "list-todo" },
  { id: "event",   label: "Evento",  icon: "calendar"  },
  { id: "meeting", label: "Reunión", icon: "users"     },
];

const FREQ_OPTS = [
  { id: "once",    label: "Una vez"  },
  { id: "daily",   label: "Diaria"   },
  { id: "weekly",  label: "Semanal"  },
  { id: "monthly", label: "Mensual"  },
];

const today = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;
};

const QuickCreateModal = ({ open, onClose, defaultType = "task", defaultDate = "", lockType = false, openModal, editTask = null }) => {
  const D = window.Data;
  D.useStore();

  const [type,      setType]      = useState(defaultType);
  const [title,     setTitle]     = useState("");
  const [desc,      setDesc]      = useState("");
  const [clientId,  setClientId]  = useState("");
  const [date,      setDate]      = useState(today());
  const [time,      setTime]      = useState("");
  const [timeEnd,   setTimeEnd]   = useState("");
  const [freq,      setFreq]      = useState("once");
  const [activeTab, setActiveTab] = useState(null); // null | "client" | "freq" | "time" | "date"
  const [pickerFor, setPickerFor] = useState(null);
  const [datePicker, setDatePicker] = useState(false);

  useEffect(() => {
    if (open) {
      if (editTask && editTask.task) {
        const tk = editTask.task;
        setTitle(tk.title || ""); setDesc(tk.notes || ""); setClientId(tk.clientId || "");
        setDate(tk.deadline || defaultDate || today());
        setTime(tk.time || ""); setTimeEnd(""); setFreq(tk.frequency || "once");
        setType("task");
      } else {
        setTitle(""); setDesc(""); setClientId(""); setDate(defaultDate || today());
        setTime(""); setTimeEnd(""); setFreq("once");
        setType(defaultType);
      }
      setActiveTab(null); setPickerFor(null); setDatePicker(false);
    }
  }, [open, defaultType, defaultDate, editTask && editTask.task && editTask.task.id]);

  useEffect(() => {
    if (!open) return;
    const fn = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open]);

  if (!open) return null;

  const canSubmit = title.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const t = title.trim();
    if (editTask && editTask.task) {
      D.updateTask(editTask.pid, editTask.task.id, {
        title: t, notes: desc || null,
        deadline: date || null, time: time || null, frequency: freq,
      });
      onClose();
      return;
    }
    if (type === "task") {
      const deadline = date || defaultDate || null;
      if (clientId) {
        const client = D.CLIENTS.find(c => c.id === clientId);
        const proj   = D.PROJECTS.find(p => p.clientId === clientId);
        if (proj) {
          D.addTask({ projectId: proj.id, title: t, column: "todo", assignee: "", deadline, time: time||null, frequency: freq, notes: desc||null });
        } else {
          D.addTask({ title: t, column: "todo", assignee: "", clientId, clientName: client?.company || client?.name || "", deadline, time: time||null, frequency: freq, notes: desc||null });
        }
      } else {
        D.addTask({ title: t, column: "todo", assignee: "", deadline, time: time||null, frequency: freq, notes: desc||null });
      }
    } else if (type === "event" || type === "meeting") {
      const CUSTOM_KEY = "agenda_custom_events";
      const prev = (() => { try { return JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]"); } catch { return []; } })();
      localStorage.setItem(CUSTOM_KEY, JSON.stringify([...prev, {
        id: "custom-" + Date.now(), date, title: t,
        time: time||null, timeEnd: timeEnd||null,
        frequency: freq, type: type === "meeting" ? "meeting" : "custom",
      }]));
    }
    onClose();
  };

  const accentColor = { task:"var(--accent)", event:"#60a5fa", meeting:"#34d399" }[type];
  const accentHex   = { task:"#9e9ae5",       event:"#60a5fa", meeting:"#34d399" }[type];

  // Fecha en formato corto "20 jul"
  const _MESES = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  const fmtDate = (ds) => {
    if (!ds) return "";
    const [y,m,d] = ds.split("-").map(Number);
    return `${d} ${_MESES[m-1]}`;
  };
  const dateChanged = date && date !== (defaultDate || today());

  // Tab definitions — "cliente" only for task
  const tabs = [
    ...(type === "task" ? [{ id:"client", label:"Cliente", icon:"users",    hasVal: !!clientId }] : []),
    { id:"freq", label:"Frecuencia", icon:"refresh-cw", hasVal: freq !== "once" },
    { id:"time", label:"Hora",       icon:"clock",      hasVal: !!time },
    { id:"date", label:"Fecha",      icon:"calendar",   hasVal: dateChanged },
  ];

  const toggleTab = (id) => setActiveTab(prev => prev === id ? null : id);

  return (
    <>
    <div
      style={{
        position:"fixed", inset:0,
        background:"rgba(0,0,0,0.78)",
        backdropFilter:"blur(18px)",
        zIndex:200,
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:24,
        animation:"fade .15s ease-out",
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width:"100%", maxWidth:540,
          background:"#111111",
          border:"0.5px solid rgba(255,255,255,0.08)",
          borderRadius:32,
          animation:"pop .2s cubic-bezier(.2,.8,.2,1)",
          display:"flex", flexDirection:"column",
          overflow:"hidden",
          minHeight:420,
        }}
      >
        {/* Drag handle */}
        <div style={{ display:"flex", justifyContent:"center", paddingTop:12 }}>
          <div style={{ width:36, height:4, borderRadius:99, background:"rgba(255,255,255,0.18)" }}/>
        </div>

        {/* Top bar */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 22px 0" }}>
          <button onClick={onClose} style={{
            width:40, height:40, borderRadius:"50%",
            background:"rgba(255,255,255,0.08)",
            border:"0.5px solid rgba(255,255,255,0.1)",
            cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
            color:"var(--text-muted)",
          }}>
            <Icon name="x" size={15}/>
          </button>

          {/* Type pills — hidden when lockType */}
          {lockType
            ? <div style={{ fontSize:13, color:"var(--text-subtle)", letterSpacing:"-0.5px" }}>{editTask ? "Editar tarea" : "Crear nuevo"}</div>
            : <div style={{ display:"flex", gap:6 }}>
                {TYPES.map(tp => (
                  <button key={tp.id} onClick={() => setType(tp.id)} style={{
                    display:"flex", alignItems:"center", gap:5,
                    padding:"6px 13px", borderRadius:99,
                    background: type === tp.id ? "rgba(255,255,255,0.09)" : "transparent",
                    border: type === tp.id ? "0.5px solid rgba(255,255,255,0.15)" : "0.5px solid rgba(255,255,255,0.06)",
                    color: type === tp.id ? "var(--text)" : "var(--text-subtle)",
                    fontSize:12, letterSpacing:"-0.4px", cursor:"pointer",
                    fontFamily:"var(--font-sans)", transition:"all .1s",
                  }}>
                    <Icon name={tp.icon} size={12} strokeWidth={1.6}/>
                    {tp.label}
                  </button>
                ))}
              </div>
          }

          <button onClick={handleSubmit} style={{
            width:40, height:40, borderRadius:"50%",
            background: canSubmit ? accentColor : "rgba(255,255,255,0.08)",
            border:"none", cursor: canSubmit ? "pointer" : "default",
            display:"flex", alignItems:"center", justifyContent:"center",
            color:"#fff", transition:"all .15s", opacity: canSubmit ? 1 : 0.4,
          }}>
            <Icon name="arrow-up" size={15}/>
          </button>
        </div>

        {/* Title + description inputs */}
        <div style={{ padding:"28px 28px 8px" }}>
          <input
            autoFocus
            placeholder={{ task:"Nombre de la tarea...", event:"Nombre del evento...", meeting:"Nombre de la reunión..." }[type]}
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && canSubmit) handleSubmit(); }}
            style={{
              width:"100%", background:"transparent", border:"none", outline:"none",
              fontSize:28, fontWeight:400, letterSpacing:"-1.4px",
              color: title ? "var(--text)" : "rgba(255,255,255,0.15)",
              fontFamily:"var(--font-display)", caretColor: accentColor,
            }}
          />
          <input
            placeholder="Descripción (opcional)"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            style={{
              width:"100%", background:"transparent", border:"none", outline:"none",
              fontSize:14, letterSpacing:"-0.5px", marginTop:8,
              color: desc ? "var(--text-muted)" : "rgba(255,255,255,0.13)",
              fontFamily:"var(--font-sans)", caretColor: accentColor,
            }}
          />
        </div>

        {/* Content area — shows selected tab */}
        <div style={{ flex:1, padding:"0 28px", minHeight:120, display:"flex", alignItems:"center", justifyContent:"center" }}>

          {/* No tab selected */}
          {!activeTab && (
            <div style={{ color:"rgba(255,255,255,0.08)", fontSize:13, letterSpacing:"-0.5px" }}>
              Selecciona una opción abajo
            </div>
          )}

          {/* Cliente */}
          {activeTab === "client" && (
            <div style={{ width:"100%", maxHeight:180, overflowY:"auto", display:"flex", flexDirection:"column", gap:4 }}>
              {D.CLIENTS.length === 0
                ? <span style={{ fontSize:13, color:"var(--text-subtle)", textAlign:"center" }}>Sin clientes</span>
                : [...D.CLIENTS].sort((a,b) => (a.company||a.name||"").localeCompare(b.company||b.name||"")).map(c => (
                  <button key={c.id} onClick={() => setClientId(clientId === c.id ? "" : c.id)} style={{
                    padding:"10px 16px", borderRadius:12, fontSize:13, letterSpacing:"-0.5px",
                    background: clientId === c.id ? accentHex + "22" : "rgba(255,255,255,0.04)",
                    border: clientId === c.id ? `1px solid ${accentHex}55` : "0.5px solid rgba(255,255,255,0.08)",
                    color: clientId === c.id ? accentHex : "var(--text-muted)",
                    cursor:"pointer", fontFamily:"var(--font-sans)", transition:"all .1s",
                    textAlign:"left", width:"100%",
                  }}>
                    {c.company || c.name}
                  </button>
                ))
              }
            </div>
          )}

          {/* Frecuencia */}
          {activeTab === "freq" && (
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center" }}>
              {FREQ_OPTS.map(f => (
                <button key={f.id} onClick={() => setFreq(f.id)} style={{
                  padding:"8px 18px", borderRadius:99, fontSize:13, letterSpacing:"-0.5px",
                  background: freq === f.id ? accentHex + "22" : "rgba(255,255,255,0.07)",
                  border: freq === f.id ? `1px solid ${accentHex}66` : "0.5px solid rgba(255,255,255,0.12)",
                  color: freq === f.id ? accentHex : "var(--text-muted)",
                  cursor:"pointer", fontFamily:"var(--font-sans)", transition:"all .1s",
                }}>
                  {f.label}
                </button>
              ))}
            </div>
          )}

          {/* Hora */}
          {activeTab === "time" && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <button onClick={() => setPickerFor("start")} style={{
                  padding:"10px 22px", borderRadius:14, cursor:"pointer",
                  background: time ? accentHex + "22" : "rgba(255,255,255,0.07)",
                  border: time ? `1px solid ${accentHex}66` : "0.5px solid rgba(255,255,255,0.12)",
                  color: time ? accentHex : "var(--text-muted)",
                  fontSize:22, fontWeight:300, letterSpacing:"-1px",
                  fontFamily:"var(--font-display)", transition:"all .1s",
                }}>
                  {time || "00:00"}
                </button>
                {(type === "event" || type === "meeting") && (
                  <>
                    <span style={{ fontSize:16, color:"var(--text-subtle)" }}>–</span>
                    <button onClick={() => setPickerFor("end")} style={{
                      padding:"10px 22px", borderRadius:14, cursor:"pointer",
                      background: timeEnd ? accentHex + "22" : "rgba(255,255,255,0.07)",
                      border: timeEnd ? `1px solid ${accentHex}66` : "0.5px solid rgba(255,255,255,0.12)",
                      color: timeEnd ? accentHex : "var(--text-muted)",
                      fontSize:22, fontWeight:300, letterSpacing:"-1px",
                      fontFamily:"var(--font-display)", transition:"all .1s",
                    }}>
                      {timeEnd || "00:00"}
                    </button>
                  </>
                )}
              </div>
              <span style={{ fontSize:12, color:"var(--text-subtle)" }}>Toca para cambiar la hora</span>
            </div>
          )}

        </div>

        {/* Divider */}
        <div style={{ height:"0.5px", background:"rgba(255,255,255,0.07)", margin:"0 0 0 0" }}/>

        {/* Bottom tabs */}
        <div style={{ display:"flex", gap:8, padding:"16px 22px 22px", flexWrap:"wrap" }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => tab.id === "date" ? setDatePicker(true) : toggleTab(tab.id)} style={{
              display:"flex", alignItems:"center", gap:6,
              padding:"8px 16px", borderRadius:99,
              background: activeTab === tab.id
                ? accentHex + "22"
                : tab.hasVal ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.05)",
              border: activeTab === tab.id
                ? `0.5px solid ${accentHex}55`
                : tab.hasVal ? "0.5px solid rgba(255,255,255,0.18)" : "0.5px solid rgba(255,255,255,0.08)",
              color: activeTab === tab.id ? accentHex : tab.hasVal ? "var(--text)" : "var(--text-subtle)",
              fontSize:13, letterSpacing:"-0.5px", cursor:"pointer",
              fontFamily:"var(--font-sans)", transition:"all .12s",
            }}>
              <Icon name={tab.icon} size={13} strokeWidth={1.6}/>
              {tab.label}
              {tab.id === "client" && clientId && (
                <span style={{ width:6, height:6, borderRadius:"50%", background:accentHex, flexShrink:0 }}/>
              )}
              {tab.id === "freq" && freq !== "once" && (
                <span style={{ fontSize:10, color:accentHex, marginLeft:2 }}>
                  {FREQ_OPTS.find(f => f.id === freq)?.label}
                </span>
              )}
              {tab.id === "time" && time && (
                <span style={{ fontSize:10, color:accentHex, marginLeft:2 }}>{time}</span>
              )}
              {tab.id === "date" && dateChanged && (
                <span style={{ fontSize:10, color:accentHex, marginLeft:2 }}>{fmtDate(date)}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>

    {pickerFor && (
      <TimePicker
        value={pickerFor === "start" ? time : timeEnd}
        onChange={v => pickerFor === "start" ? setTime(v) : setTimeEnd(v)}
        onClose={() => setPickerFor(null)}
      />
    )}
    {datePicker && (
      <DatePicker
        value={date}
        onChange={setDate}
        onClose={() => setDatePicker(false)}
        accent={accentHex}
      />
    )}
  </>
  );
};

window.QuickCreateModal = QuickCreateModal;

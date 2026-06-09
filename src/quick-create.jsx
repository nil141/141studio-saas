// QuickCreate — modal unificado para crear cualquier elemento
const { useState, useEffect } = React;

const TYPES = [
  { id: "task",    label: "Tarea",   icon: "list-todo" },
  { id: "event",   label: "Evento",  icon: "calendar"  },
  { id: "meeting", label: "Reunión", icon: "users"     },
];

const FREQ = [
  { id: "once",    label: "Una vez"  },
  { id: "daily",   label: "Diaria"   },
  { id: "weekly",  label: "Semanal"  },
  { id: "monthly", label: "Mensual"  },
];

const today = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;
};

const PillBtn = ({ active, onClick, children, color }) => {
  const base = color || "rgba(255,255,255,0.14)";
  const softBg = color ? color + "1a" : "rgba(255,255,255,0.09)";
  return (
    <button onClick={onClick} style={{
      padding:"5px 12px", borderRadius:99, fontSize:12, letterSpacing:"-0.4px",
      background: active ? softBg : "rgba(255,255,255,0.06)",
      border: active ? `0.5px solid ${base}` : "0.5px solid rgba(255,255,255,0.1)",
      color: active ? (color || "var(--text)") : "var(--text-muted)",
      cursor:"pointer", fontFamily:"var(--font-sans)", flexShrink:0,
      transition:"all .1s",
    }}>
      {children}
    </button>
  );
};

const QuickCreateModal = ({ open, onClose, defaultType = "task", defaultDate = "", openModal }) => {
  const D = window.Data;
  D.useStore();

  const [type,      setType]      = useState(defaultType);
  const [title,     setTitle]     = useState("");
  const [clientId,  setClientId]  = useState("");
  const [date,      setDate]      = useState(today());
  const [time,      setTime]      = useState("");
  const [timeEnd,   setTimeEnd]   = useState("");
  const [freq,      setFreq]      = useState("once");
  const [pickerFor, setPickerFor] = useState(null);

  useEffect(() => {
    if (open) {
      setTitle(""); setClientId(""); setDate(defaultDate || today());
      setTime(""); setTimeEnd(""); setFreq("once");
      setType(defaultType); setPickerFor(null);
    }
  }, [open, defaultType, defaultDate]);

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

    if (type === "task") {
      const deadline = defaultDate || null;
      const taskTime = time || null;
      if (clientId) {
        const client = D.CLIENTS.find(c => c.id === clientId);
        const proj   = D.PROJECTS.find(p => p.clientId === clientId);
        if (proj) {
          D.addTask({ projectId: proj.id, title: t, column: "todo", assignee: "", deadline, time: taskTime, frequency: freq });
        } else {
          D.addTask({ title: t, column: "todo", assignee: "", clientId, clientName: client?.company || client?.name || "", deadline, time: taskTime, frequency: freq });
        }
      } else {
        D.addTask({ title: t, column: "todo", assignee: "", deadline, time: taskTime, frequency: freq });
      }
    } else if (type === "event" || type === "meeting") {
      const CUSTOM_KEY = "agenda_custom_events";
      const prev = (() => { try { return JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]"); } catch { return []; } })();
      const evt = {
        id: "custom-" + Date.now(), date, title: t,
        time: time || null, timeEnd: timeEnd || null,
        frequency: freq,
        type: type === "meeting" ? "meeting" : "custom",
      };
      localStorage.setItem(CUSTOM_KEY, JSON.stringify([...prev, evt]));
    }
    onClose();
  };

  const placeholder = {
    task:    "Nombre de la tarea...",
    event:   "Nombre del evento...",
    meeting: "Nombre de la reunión...",
  }[type];

  const accentColor = {
    task:    "var(--accent)",
    event:   "#60a5fa",
    meeting: "#34d399",
  }[type];

  const accentHex = {
    task:    "#9e9ae5",
    event:   "#60a5fa",
    meeting: "#34d399",
  }[type];

  return (
    <>
    <div
      style={{
        position:"fixed", inset:0,
        background:"rgba(0,0,0,0.72)",
        backdropFilter:"blur(14px)",
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
          width:"100%", maxWidth:460,
          background:"#0f0f0f",
          border:"0.5px solid rgba(255,255,255,0.1)",
          borderRadius:28,
          overflow:"hidden",
          animation:"pop .2s cubic-bezier(.2,.8,.2,1)",
          display:"flex", flexDirection:"column",
        }}
      >
        {/* Top row */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 20px 14px" }}>
          <button onClick={onClose} style={{
            width:38, height:38, borderRadius:"50%",
            background:"rgba(255,255,255,0.07)",
            border:"0.5px solid rgba(255,255,255,0.1)",
            cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
            color:"var(--text-muted)",
          }}>
            <Icon name="x" size={15}/>
          </button>
          <div style={{ fontSize:13, color:"var(--text-subtle)", letterSpacing:"-0.5px" }}>Crear nuevo</div>
          <button onClick={handleSubmit} style={{
            width:38, height:38, borderRadius:"50%",
            background: canSubmit ? accentColor : "rgba(255,255,255,0.08)",
            border:"none", cursor: canSubmit ? "pointer" : "default",
            display:"flex", alignItems:"center", justifyContent:"center",
            color:"#fff", transition:"all .15s", opacity: canSubmit ? 1 : 0.4,
          }}>
            <Icon name="arrow-up" size={15}/>
          </button>
        </div>

        {/* Type selector */}
        <div style={{ display:"flex", gap:6, padding:"0 20px 16px" }}>
          {TYPES.map(tp => (
            <button key={tp.id} onClick={() => setType(tp.id)} style={{
              display:"flex", alignItems:"center", gap:6,
              padding:"7px 14px", borderRadius:99, flexShrink:0,
              background: type === tp.id ? "rgba(255,255,255,0.09)" : "transparent",
              border: type === tp.id ? "0.5px solid rgba(255,255,255,0.15)" : "0.5px solid rgba(255,255,255,0.07)",
              color: type === tp.id ? "var(--text)" : "var(--text-subtle)",
              fontSize:13, letterSpacing:"-0.5px", cursor:"pointer",
              fontFamily:"var(--font-sans)", transition:"all .1s",
            }}>
              <Icon name={tp.icon} size={13} strokeWidth={1.6}/>
              {tp.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height:"0.5px", background:"rgba(255,255,255,0.07)" }}/>

        {/* Title */}
        <div style={{ padding:"22px 24px 16px" }}>
          <input
            autoFocus
            placeholder={placeholder}
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && canSubmit) handleSubmit(); }}
            style={{
              width:"100%", background:"transparent", border:"none", outline:"none",
              fontSize:24, fontWeight:400, letterSpacing:"-1.2px",
              color: title ? "var(--text)" : "rgba(255,255,255,0.18)",
              fontFamily:"var(--font-display)", caretColor: accentColor,
            }}
          />
        </div>

        {/* Divider */}
        <div style={{ height:"0.5px", background:"rgba(255,255,255,0.07)" }}/>

        {/* Bottom options */}
        <div style={{ padding:"14px 20px 18px", display:"flex", flexDirection:"column", gap:14 }}>

          {/* Tarea: selector de cliente */}
          {type === "task" && D.CLIENTS.length > 0 && (
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
              <span style={{ fontSize:12, color:"var(--text-subtle)", marginRight:4, flexShrink:0 }}>Cliente:</span>
              {D.CLIENTS.slice(0,5).map(c => (
                <PillBtn key={c.id} active={clientId === c.id} color={accentHex}
                  onClick={() => setClientId(clientId === c.id ? "" : c.id)}>
                  {c.company || c.name}
                </PillBtn>
              ))}
            </div>
          )}

          {/* Evento / Reunión: fecha */}
          {(type === "event" || type === "meeting") && (
            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
              <span style={{ fontSize:12, color:"var(--text-subtle)", flexShrink:0 }}>Fecha:</span>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                style={{
                  background:"rgba(255,255,255,0.06)", border:"0.5px solid rgba(255,255,255,0.1)",
                  borderRadius:99, color:"var(--text-muted)", fontSize:12, padding:"5px 14px",
                  fontFamily:"var(--font-sans)",
                }}
              />
            </div>
          )}

          {/* Hora — todos los tipos */}
          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
            <span style={{ fontSize:12, color:"var(--text-subtle)", flexShrink:0 }}>Hora:</span>
            <button onClick={() => setPickerFor("start")} style={{
              display:"flex", alignItems:"center", gap:5,
              padding:"5px 14px", borderRadius:99, cursor:"pointer",
              background: time ? accentHex + "1a" : "rgba(255,255,255,0.06)",
              border: time ? `0.5px solid ${accentHex}55` : "0.5px solid rgba(255,255,255,0.1)",
              color: time ? accentHex : "var(--text-muted)",
              fontSize:12, fontFamily:"var(--font-sans)", letterSpacing:"-0.3px",
            }}>
              <Icon name="clock" size={12} strokeWidth={1.6}/>
              {time || "Inicio"}
            </button>
            {(type === "event" || type === "meeting") && (
              <>
                <span style={{ fontSize:11, color:"var(--text-subtle)" }}>–</span>
                <button onClick={() => setPickerFor("end")} style={{
                  padding:"5px 14px", borderRadius:99, cursor:"pointer",
                  background: timeEnd ? accentHex + "1a" : "rgba(255,255,255,0.06)",
                  border: timeEnd ? `0.5px solid ${accentHex}55` : "0.5px solid rgba(255,255,255,0.1)",
                  color: timeEnd ? accentHex : "var(--text-muted)",
                  fontSize:12, fontFamily:"var(--font-sans)", letterSpacing:"-0.3px",
                }}>
                  {timeEnd || "Fin"}
                </button>
              </>
            )}
          </div>

          {/* Frecuencia — todos los tipos */}
          <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
            <span style={{ fontSize:12, color:"var(--text-subtle)", marginRight:4, flexShrink:0 }}>Frecuencia:</span>
            {FREQ.map(f => (
              <PillBtn key={f.id} active={freq === f.id} color={accentHex}
                onClick={() => setFreq(f.id)}>
                {f.label}
              </PillBtn>
            ))}
          </div>

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
  </>
  );
};

window.QuickCreateModal = QuickCreateModal;

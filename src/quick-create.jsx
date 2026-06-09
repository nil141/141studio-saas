// QuickCreate — modal unificado para crear cualquier elemento
const { useState, useEffect } = React;

const TYPES = [
  { id: "task",    label: "Tarea",    icon: "list-todo" },
  { id: "project", label: "Proyecto", icon: "folder" },
  { id: "event",   label: "Evento",   icon: "calendar" },
  { id: "invoice", label: "Factura",  icon: "receipt" },
];

const today = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;
};

const QuickCreateModal = ({ open, onClose, defaultType = "task", openModal }) => {
  const D = window.Data;
  D.useStore();

  const [type,  setType]  = useState(defaultType);
  const [title, setTitle] = useState("");
  const [sub,   setSub]   = useState("");   // project / client / notes
  const [date,  setDate]  = useState(today());
  const [time,  setTime]  = useState("");
  const [eventType, setEventType] = useState("custom");

  useEffect(() => { if (open) { setTitle(""); setSub(""); setDate(today()); setTime(""); setType(defaultType); } }, [open, defaultType]);
  useEffect(() => { if (!open) return; const fn = e => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", fn); return () => window.removeEventListener("keydown", fn); }, [open]);

  if (!open) return null;

  const canSubmit = title.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const t = title.trim();

    if (type === "task") {
      const projectId = sub || (D.PROJECTS[0]?.id);
      if (projectId) { D.addTask(projectId, { title: t, column: "todo", assignee: "" }); }
    } else if (type === "project") {
      const clientId = sub || (D.CLIENTS[0]?.id);
      if (clientId) { D.addProject({ clientId, name: t, deadline: date, budget: 0 }); }
      else { openModal && openModal("newProject"); onClose(); return; }
    } else if (type === "event") {
      const CUSTOM_KEY = "agenda_custom_events";
      const prev = (() => { try { return JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]"); } catch { return []; }})();
      const evt = { id:"custom-"+Date.now(), date, title:t, sub: time ? time + (sub ? " · "+sub : "") : sub, type: eventType };
      localStorage.setItem(CUSTOM_KEY, JSON.stringify([...prev, evt]));
    } else if (type === "invoice") {
      openModal && openModal("newInvoice"); onClose(); return;
    }
    onClose();
  };

  const placeholder = {
    task:    "Nombre de la tarea...",
    project: "Nombre del proyecto...",
    event:   "Nombre del evento o reunión...",
    invoice: "Concepto de la factura...",
  }[type];

  const sublabel = {
    task:    "Proyecto (opcional)",
    project: "Notas",
    event:   "Descripción o ubicación",
    invoice: "",
  }[type];

  const accentColor = {
    task:    "var(--accent)",
    project: "#00cc70",
    event:   "#60a5fa",
    invoice: "#eee586",
  }[type];

  return (
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
          background:"#131317",
          border:"0.5px solid rgba(255,255,255,0.1)",
          borderRadius:28,
          overflow:"hidden",
          animation:"pop .2s cubic-bezier(.2,.8,.2,1)",
          display:"flex", flexDirection:"column",
        }}
      >
        {/* Top row */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 20px 14px" }}>
          <button
            onClick={onClose}
            style={{
              width:38, height:38, borderRadius:"50%",
              background:"rgba(255,255,255,0.07)",
              border:"0.5px solid rgba(255,255,255,0.1)",
              cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
              color:"var(--text-muted)",
            }}
          >
            <Icon name="x" size={15}/>
          </button>

          <div style={{ fontSize:13, color:"var(--text-subtle)", letterSpacing:"-0.5px" }}>
            Crear nuevo
          </div>

          <button
            onClick={handleSubmit}
            style={{
              width:38, height:38, borderRadius:"50%",
              background: canSubmit ? accentColor : "rgba(255,255,255,0.08)",
              border:"none", cursor: canSubmit ? "pointer" : "default",
              display:"flex", alignItems:"center", justifyContent:"center",
              color:"#fff", transition:"all .15s",
              opacity: canSubmit ? 1 : 0.4,
            }}
          >
            <Icon name="arrow-up" size={15}/>
          </button>
        </div>

        {/* Type selector */}
        <div style={{ display:"flex", gap:6, padding:"0 20px 16px", overflowX:"auto", scrollbarWidth:"none" }}>
          {TYPES.map(t => (
            <button
              key={t.id}
              onClick={() => setType(t.id)}
              style={{
                display:"flex", alignItems:"center", gap:6,
                padding:"7px 14px", borderRadius:99, flexShrink:0,
                background: type === t.id ? "rgba(255,255,255,0.09)" : "transparent",
                border: type === t.id ? "0.5px solid rgba(255,255,255,0.15)" : "0.5px solid rgba(255,255,255,0.07)",
                color: type === t.id ? "var(--text)" : "var(--text-subtle)",
                fontSize:13, letterSpacing:"-0.5px", cursor:"pointer",
                fontFamily:"var(--font-sans)", transition:"all .1s",
              }}
            >
              <Icon name={t.icon} size={13} strokeWidth={1.6}/>
              {t.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height:"0.5px", background:"rgba(255,255,255,0.07)" }}/>

        {/* Title */}
        <div style={{ padding:"22px 24px 4px" }}>
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

        {/* Sub-field */}
        {sublabel && (
          <div style={{ padding:"0 24px 16px" }}>
            <input
              placeholder={sublabel}
              value={sub}
              onChange={e => setSub(e.target.value)}
              style={{
                width:"100%", background:"transparent", border:"none", outline:"none",
                fontSize:14, letterSpacing:"-0.96px",
                color: sub ? "var(--text-muted)" : "rgba(255,255,255,0.13)",
                fontFamily:"var(--font-sans)", caretColor: accentColor,
              }}
            />
          </div>
        )}

        {/* Divider */}
        <div style={{ height:"0.5px", background:"rgba(255,255,255,0.07)" }}/>

        {/* Bottom options — contextual by type */}
        <div style={{ padding:"14px 20px 18px", display:"flex", flexDirection:"column", gap:12 }}>

          {/* Tarea: selector de proyecto */}
          {type === "task" && D.PROJECTS.length > 0 && (
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              <span style={{ fontSize:12, color:"var(--text-subtle)", alignSelf:"center", marginRight:4 }}>Proyecto:</span>
              {D.PROJECTS.slice(0,5).map(p => (
                <button key={p.id} onClick={() => setSub(p.id)} style={{
                  padding:"5px 12px", borderRadius:99, fontSize:12, letterSpacing:"-0.5px",
                  background: sub === p.id ? "rgba(158,154,229,0.18)" : "rgba(255,255,255,0.06)",
                  border: sub === p.id ? "0.5px solid rgba(158,154,229,0.4)" : "0.5px solid rgba(255,255,255,0.1)",
                  color: sub === p.id ? "#c8c5f2" : "var(--text-muted)",
                  cursor:"pointer", fontFamily:"var(--font-sans)",
                }}>
                  {p.name}
                </button>
              ))}
            </div>
          )}

          {/* Proyecto / Evento: fecha */}
          {(type === "project" || type === "event") && (
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:12, color:"var(--text-subtle)", flexShrink:0 }}>
                {type === "event" ? "Fecha:" : "Fecha límite:"}
              </span>
              <input
                type="date" value={date}
                onChange={e => setDate(e.target.value)}
                style={{
                  background:"rgba(255,255,255,0.06)",
                  border:"0.5px solid rgba(255,255,255,0.1)",
                  borderRadius:99, color:"var(--text-muted)",
                  fontSize:12, padding:"5px 14px",
                  fontFamily:"var(--font-sans)",
                }}
              />
              {type === "event" && (
                <input
                  type="time" value={time}
                  onChange={e => setTime(e.target.value)}
                  style={{
                    background: time ? "rgba(96,165,250,0.1)" : "rgba(255,255,255,0.06)",
                    border: time ? "0.5px solid rgba(96,165,250,0.3)" : "0.5px solid rgba(255,255,255,0.1)",
                    borderRadius:99, color: time ? "#7db8f7" : "var(--text-muted)",
                    fontSize:12, padding:"5px 14px",
                    fontFamily:"var(--font-sans)",
                  }}
                />
              )}
            </div>
          )}

          {/* Evento: tipo */}
          {type === "event" && (
            <div style={{ display:"flex", gap:6 }}>
              {[{v:"custom",l:"Evento",i:"calendar"},{v:"meeting",l:"Reunión",i:"users"},{v:"task",l:"Tarea",i:"list-todo"}].map(t => (
                <button key={t.v} onClick={() => setEventType(t.v)} style={{
                  display:"flex", alignItems:"center", gap:5,
                  padding:"5px 12px", borderRadius:99, fontSize:12, letterSpacing:"-0.5px",
                  background: eventType === t.v ? "rgba(96,165,250,0.12)" : "rgba(255,255,255,0.06)",
                  border: eventType === t.v ? "0.5px solid rgba(96,165,250,0.3)" : "0.5px solid rgba(255,255,255,0.1)",
                  color: eventType === t.v ? "#7db8f7" : "var(--text-muted)",
                  cursor:"pointer", fontFamily:"var(--font-sans)",
                }}>
                  <Icon name={t.i} size={12} strokeWidth={1.6}/>{t.l}
                </button>
              ))}
            </div>
          )}

          {/* Factura: aviso */}
          {type === "invoice" && (
            <div style={{ fontSize:13, color:"var(--text-subtle)", letterSpacing:"-0.5px" }}>
              Se abrirá el formulario completo de factura.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

window.QuickCreateModal = QuickCreateModal;

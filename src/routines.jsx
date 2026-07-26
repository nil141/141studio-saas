// 141'STUDIO — Rutinas (checklists recurrentes)
// Una rutina es una plantilla que se repite (ej. "Rutina mañanera") y que
// contiene varios pasos. Cada día que aplica, se muestra con su checklist y
// se van tachando los pasos. Datos en window.Data (localStorage).
const { useState, useEffect, useRef } = React;

const R_FREQ = [
  { id: "daily",    label: "Cada día" },
  { id: "weekdays", label: "Días laborables" },
  { id: "weekly",   label: "Cada semana" },
  { id: "monthly",  label: "Cada mes" },
];
const R_FREQ_LABEL = { daily: "Cada día", weekdays: "Días laborables", weekly: "Cada semana", monthly: "Cada mes" };

// ── Modal: crear / editar una rutina ─────────────────────────────────
const RoutineModal = ({ open, onClose, routine, date }) => {
  const D = window.Data;
  const toast = useToast();
  const editing = !!routine;

  const [title, setTitle] = useState("");
  const [freq, setFreq]   = useState("daily");
  const [items, setItems] = useState([]);      // [{id?, text}]
  const [draft, setDraft] = useState("");
  const draftRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    if (routine) {
      setTitle(routine.title || "");
      setFreq(routine.frequency || "daily");
      setItems((routine.items || []).map(it => ({ id: it.id, text: it.text })));
    } else {
      setTitle(""); setFreq("daily"); setItems([]);
    }
    setDraft("");
  }, [open, routine]);

  const addItem = () => {
    const t = draft.trim();
    if (!t) return;
    setItems(prev => [...prev, { text: t }]);
    setDraft("");
    if (draftRef.current) draftRef.current.focus();
  };
  const removeItem = (i) => setItems(prev => prev.filter((_, idx) => idx !== i));
  const editItem   = (i, v) => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, text: v } : it));

  const submit = () => {
    if (!title.trim()) { toast("Ponle un nombre a la rutina", "warn"); return; }
    const cleanItems = items.map(it => ({ ...it, text: it.text.trim() })).filter(it => it.text);
    if (editing) {
      D.updateRoutine(routine.id, { title: title.trim(), frequency: freq, items: cleanItems });
      toast("Rutina actualizada", "success");
    } else {
      D.addRoutine({ title: title.trim(), frequency: freq, items: cleanItems, startDate: date || undefined });
      toast("Rutina creada", "success");
    }
    onClose();
  };

  const removeRoutine = () => {
    if (!editing) return;
    D.deleteRoutine(routine.id);
    toast("Rutina eliminada", "success");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}
      title={editing ? "Editar rutina" : "Nueva rutina"}
      sub="Una lista de pasos que se repite en los días que elijas."
      footer={
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%" }}>
          <div>
            {editing && (
              <button className="btn ghost sm" onClick={removeRoutine} style={{ color:"var(--red)" }}>
                <Icon name="trash" size={13}/> Eliminar
              </button>
            )}
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn" onClick={onClose}>Cancelar</button>
            <button className="btn primary" onClick={submit}>
              <Icon name={editing ? "check" : "plus"} size={12}/> {editing ? "Guardar" : "Crear rutina"}
            </button>
          </div>
        </div>
      }>
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

        {/* Nombre */}
        <div>
          <div className="label">Nombre de la rutina</div>
          <input className="input" autoFocus placeholder="Ej. Rutina mañanera"
            value={title} onChange={e => setTitle(e.target.value)}/>
        </div>

        {/* Frecuencia */}
        <div>
          <div className="label">Frecuencia</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {R_FREQ.map(f => {
              const on = freq === f.id;
              return (
                <button key={f.id} onClick={() => setFreq(f.id)} style={{
                  padding:"8px 16px", borderRadius:99, fontSize:13, letterSpacing:"-0.3px", cursor:"pointer",
                  fontFamily:"inherit", transition:"all .1s",
                  background: on ? "var(--accent-soft)" : "rgba(255,255,255,0.05)",
                  border: on ? "1px solid var(--accent)" : "0.5px solid var(--border)",
                  color: on ? "var(--accent)" : "var(--text-muted)",
                }}>{f.label}</button>
              );
            })}
          </div>
        </div>

        {/* Pasos (checklist) */}
        <div>
          <div className="label">Pasos <span style={{ color:"var(--text-subtle)" }}>· lo que haces dentro de la rutina</span></div>

          <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:10 }}>
            {items.length === 0 && (
              <div style={{ fontSize:12.5, color:"var(--text-subtle)", padding:"6px 2px", letterSpacing:"-0.2px" }}>
                Añade los pasos que quieras (ej. “Revisar correos”, “Planificar el día”…).
              </div>
            )}
            {items.map((it, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--text-subtle)", flexShrink:0 }}/>
                <input className="input" value={it.text}
                  onChange={e => editItem(i, e.target.value)}
                  style={{ flex:1, padding:"9px 12px", fontSize:13 }}/>
                <button className="btn ghost icon-only sm" onClick={() => removeItem(i)}
                  data-tooltip="Quitar paso" style={{ flexShrink:0 }}>
                  <Icon name="x" size={13}/>
                </button>
              </div>
            ))}
          </div>

          {/* Añadir paso */}
          <div style={{ display:"flex", gap:8 }}>
            <input ref={draftRef} className="input" placeholder="Escribe un paso y pulsa Enter…"
              value={draft} onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addItem(); } }}
              style={{ flex:1 }}/>
            <button className="btn" onClick={addItem} style={{ flexShrink:0 }}>
              <Icon name="plus" size={13}/> Añadir
            </button>
          </div>
        </div>

      </div>
    </Modal>
  );
};

// ── Tarjeta de una rutina para un día ────────────────────────────────
const RoutineCard = ({ r, day, onEdit, onStep }) => {
  const D = window.Data;
  const [celebrate, setCelebrate] = useState(false);
  const total = (r.items || []).length;
  const doneCount = (r.items || []).filter(it => D.routineItemDone(r.id, day, it.id)).length;
  const allDone = total > 0 && doneCount === total;

  // Racha: si el día visible está completo, cuenta desde ese día; si no,
  // mira si hay racha viva desde el día anterior (pendiente de mantener hoy).
  let streak = D.routineStreak ? D.routineStreak(r.id, day) : 0;
  let streakPending = false;
  if (!streak && D.routineStreak) {
    const prev = new Date(day + "T12:00:00");
    prev.setDate(prev.getDate() - 1);
    const prevStr = `${prev.getFullYear()}-${String(prev.getMonth()+1).padStart(2,'0')}-${String(prev.getDate()).padStart(2,'0')}`;
    const s = D.routineStreak(r.id, prevStr);
    if (s > 0) { streak = s; streakPending = true; }
  }

  const toggle = (it) => {
    const wasDone = D.routineItemDone(r.id, day, it.id);
    // ¿este toque completa la rutina al 100%?
    const willComplete = !wasDone && total > 0 && doneCount === total - 1;
    D.toggleRoutineItem(r.id, day, it.id);
    if (willComplete) setCelebrate(true);
  };

  return (
    <div style={{ marginBottom: 28 }}>
      {/* Cabecera de grupo — el nombre de la rutina (como un grupo de cliente) */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
        <Icon name="refresh-cw" size={12} style={{ color:"var(--accent)", flexShrink:0, marginRight:-3 }}/>
        <span onClick={() => onEdit && onEdit(r)} data-tooltip="Editar rutina"
          style={{ fontSize:12, fontWeight:400, letterSpacing:"0", textTransform:"uppercase", color:"#9e9e9e", cursor:"pointer" }}>
          {r.title}
        </span>
        {streak > 0 && (
          <div data-tooltip={streakPending ? `Racha de ${streak} — completa hoy para mantenerla` : `${streak} ${streak === 1 ? "día" : "días"} de racha`}
            style={{ display:"flex", alignItems:"center", gap:4, marginLeft:2,
              color: streakPending ? "var(--text-subtle)" : "var(--accent)" }}>
            <span style={{ display:"inline-flex", transformOrigin:"50% 85%",
              animation: streakPending ? "none" : "rtFlicker 1.7s ease-in-out infinite" }}>
              <Icon name="flame" size={13} strokeWidth={1.7}/>
            </span>
            <span style={{ fontSize:12, fontWeight:600, letterSpacing:"-0.2px" }}>{streak}</span>
          </div>
        )}
      </div>

      {/* Pasos — cada uno como una fila de tarea (anillo + texto + estado) */}
      {r.items.map((it, idx) => {
        const pct = D.routineItemProgress ? D.routineItemProgress(r.id, day, it.id) : (D.routineItemDone(r.id, day, it.id) ? 100 : 0);
        const done = pct >= 100;
        const last = idx === r.items.length - 1;
        const circ = 2 * Math.PI * 17;
        // Registros con datos (peso / macros) → mostrar el valor en el subtítulo
        const log = D.routineItemLog ? D.routineItemLog(r.id, day, it.id) : null;
        const lt = (it.text || "").toLowerCase();
        let sub = done ? "Hecho" : pct > 0 ? "En curso" : "Por hacer";
        if (log) {
          if (lt.includes("peso") && log.weight != null) {
            sub = `${String(log.weight).replace(".", ",")} kg`;
          } else if (lt.includes("macro")) {
            const parts = [];
            if (log.kcal    != null) parts.push(`${log.kcal} kcal`);
            if (log.protein != null) parts.push(`${log.protein}P`);
            if (log.fat     != null) parts.push(`${log.fat}G`);
            if (log.carbs   != null) parts.push(`${log.carbs}C`);
            if (parts.length) sub = parts.join(" · ");
          }
        }
        return (
          <div key={it.id} onClick={() => onStep ? onStep(r, it) : toggle(it)} className="task-row"
            style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 4px", cursor:"pointer",
              borderBottom: last ? "none" : "0.5px solid var(--border)" }}>
            <div style={{ width:40, height:40, flexShrink:0, position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="40" height="40" style={{ position:"absolute", top:0, left:0 }}>
                <circle cx="20" cy="20" r="17" fill="none"
                  stroke={done ? "var(--accent)" : "rgba(255,255,255,0.12)"} strokeWidth="2"/>
                {!done && pct > 0 && (
                  <circle cx="20" cy="20" r="17" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"
                    strokeDasharray={`${(pct/100)*circ} ${circ}`} transform="rotate(-90,20,20)"/>
                )}
              </svg>
              {done
                ? <Icon name="check" size={15} style={{ color:"var(--accent)", position:"relative" }}/>
                : pct > 0
                  ? <span style={{ fontSize:10.5, fontWeight:400, color:"var(--text-muted)", position:"relative", letterSpacing:"-0.7px" }}>{pct}%</span>
                  : <Icon name="x" size={11} style={{ color:"rgba(255,255,255,0.22)", position:"relative" }}/>}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:14, letterSpacing:"-0.5px",
                color: done ? "var(--text-subtle)" : "var(--text)",
                textDecoration: done ? "line-through" : "none" }}>{it.text}</div>
              <div style={{ fontSize:11, color: log && done ? "var(--accent)" : "var(--text-subtle)", marginTop:2, letterSpacing:"-0.2px" }}>
                {sub}
              </div>
            </div>
          </div>
        );
      })}

      {celebrate && (
        <RoutineCelebration rId={r.id} day={day} onClose={() => setCelebrate(false)}/>
      )}
    </div>
  );
};

// ── Celebración al completar una rutina — clon de la animación de
// outdomode (gota neón + halo que respira + anillo con glow + partículas
// orbitando + textos que entran con blur + botón con glow) ─────────────
const CELEB_MSG = [
  "One day you're gonna be the shit, dude!",
  "Así se construye un hábito 🔥",
  "Constancia > motivación.",
  "Pequeños pasos, grandes cambios.",
  "Imparable. Sigue así.",
  "Un día vas a ser una máquina.",
];

const RoutineCelebration = ({ rId, day, onClose }) => {
  const D = window.Data;
  const streak = Math.max(1, D.routineStreak ? D.routineStreak(rId, day) : 1);
  const msg = CELEB_MSG[(streak - 1) % CELEB_MSG.length];

  const P = "rgb(130,119,219)"; // primary del botón (outdomode)

  // Portal a <body>: la tarjeta vive dentro del contenedor de scroll de Tareas,
  // que lleva mask-image (fade de bordes) — la máscara recorta también a los
  // descendientes position:fixed, así que el overlay debe montarse fuera.
  // Sin autocierre: solo se cierra con el botón.
  return ReactDOM.createPortal(
    <div style={{
      position:"fixed", inset:0, zIndex:400, overflow:"hidden",
      display:"flex", alignItems:"center", justifyContent:"center",
      animation:"odFade .3s ease-out",
    }}>
      <style>{`
        @keyframes odFade   { from{opacity:0} to{opacity:1} }
        @keyframes odPop    { 0%{transform:scale(.55);opacity:0} 60%{transform:scale(1.06);opacity:1} 100%{transform:scale(1)} }
        @keyframes odSpin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes odBreath { 0%,100%{transform:scale(1)} 50%{transform:scale(1.12)} }
        @keyframes odPulse  { 0%,100%{transform:scale(1);opacity:.28} 50%{transform:scale(1.05);opacity:.5} }
        @keyframes odFloat  { 0%,100%{transform:translateY(0);opacity:.34} 50%{transform:translateY(-2.5px);opacity:.5} }
        @keyframes odRise   { from{opacity:0;filter:blur(8px);transform:translateY(14px)} to{opacity:1;filter:blur(0);transform:translateY(0)} }
      `}</style>

      {/* Fondo: gradiente oscuro + overlay (bg-gradient / bg-overlay) */}
      <div style={{ position:"absolute", inset:0, zIndex:-1, pointerEvents:"none" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(120% 90% at 50% 0%, #17171d 0%, #0b0b0f 55%, #070709 100%)" }}/>
        <div style={{ position:"absolute", inset:0, background:"rgba(5,5,8,0.55)" }}/>
      </div>

      <div style={{ position:"relative", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"0 16px", width:"100%", maxWidth:512, textAlign:"center" }}>

        {/* Icono 130×130: halo + anillo + gota + partículas en órbita */}
        <div style={{ position:"relative", width:130, height:130, marginBottom:16, overflow:"visible", pointerEvents:"none", animation:"odPop .55s cubic-bezier(.2,.8,.2,1) both" }}>
          {/* halo que respira (blur 60px) */}
          <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:"rgba(158,154,229,0.2)", filter:"blur(60px)", animation:"odBreath 3s ease-in-out infinite" }}/>
          {/* anillo con glow */}
          <div style={{ position:"absolute", inset:16, borderRadius:"50%", border:"1px solid rgba(158,154,229,0.6)", filter:"drop-shadow(0 0 8px rgba(158,154,229,0.8))" }}/>
          {/* gota con gradiente neón */}
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", zIndex:10 }}>
            <svg width="91" height="91" viewBox="0 0 24 24" fill="none" style={{ overflow:"visible", filter:"drop-shadow(0 0 20px rgba(158,154,229,0.5))" }}>
              <defs>
                <linearGradient id="rtNeonGrad" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#E0DFFF"/>
                  <stop offset="40%" stopColor="#9E9AE5"/>
                  <stop offset="100%" stopColor="#6C68B0"/>
                </linearGradient>
              </defs>
              {/* eco exterior pulsando */}
              <path d="M12 2C12 2 19 7 19 13C19 16.866 15.866 20 12 20C8.13401 20 5 16.866 5 13C5 7 12 2 12 2Z"
                fill="rgba(158,154,229,0.10)"
                style={{ transformOrigin:"50% 50%", transformBox:"fill-box", animation:"odPulse 2.4s ease-in-out infinite" }}/>
              {/* gota principal */}
              <path d="M12 2.5C12 2.5 18.5 7.5 18.5 13C18.5 16.59 15.59 19.5 12 19.5C8.41 19.5 5.5 16.59 5.5 13C5.5 7.5 12 2.5 12 2.5Z"
                fill="url(#rtNeonGrad)" opacity="0.95"/>
              {/* brillo interior flotando */}
              <path d="M12 8C12 8 15 10.5 15 14C15 15.6569 13.6569 17 12 17C10.3431 17 9 15.6569 9 14C9 10.5 12 8 12 8Z"
                fill="#fff" style={{ mixBlendMode:"overlay", transformOrigin:"50% 50%", transformBox:"fill-box", animation:"odFloat 2.2s ease-in-out infinite" }}/>
            </svg>
          </div>
          {/* partículas blancas orbitando (2, a distinta velocidad) */}
          <div style={{ position:"absolute", inset:0, pointerEvents:"none", animation:"odSpin 7s linear infinite" }}>
            <div style={{ position:"absolute", top:"15%", left:"50%", transform:"translateX(-50%)", width:4, height:4, borderRadius:"50%", background:"#fff", opacity:0.3, filter:"blur(0.2px)" }}/>
          </div>
          <div style={{ position:"absolute", inset:0, pointerEvents:"none", animation:"odSpin 11s linear infinite reverse" }}>
            <div style={{ position:"absolute", top:"15%", left:"50%", transform:"translateX(-50%)", width:4, height:4, borderRadius:"50%", background:"#fff", opacity:0.3, filter:"blur(0.2px)" }}/>
          </div>
        </div>

        {/* Racha */}
        <h2 style={{
          fontSize:32, fontWeight:500, letterSpacing:"-0.06em", color:"#fff", margin:0,
          fontFamily:"var(--font-display)",
          animation:"odRise .55s ease-out .12s both",
        }}>
          {streak === 1 ? "1 día de racha" : `${streak} días de racha`}
        </h2>
        <p style={{
          fontSize:16, color:"rgba(255,255,255,0.5)", maxWidth:280, margin:"8px auto", letterSpacing:"-0.2px",
          animation:"odRise .55s ease-out .22s both",
        }}>
          {msg}
        </p>

        {/* Botón (colores exactos del original) */}
        <div style={{ animation:"odRise .55s ease-out .32s both" }}>
          <button onClick={onClose} style={{
            marginTop:48, padding:"12px 24px", borderRadius:999, cursor:"pointer",
            display:"inline-flex", alignItems:"center", justifyContent:"center",
            fontSize:17, fontWeight:500, letterSpacing:"-0.3px", fontFamily:"inherit", userSelect:"none",
            backgroundColor:"rgba(130,119,219,0.25)",
            border:`1px solid ${P}`,
            boxShadow:"0 0 20px rgba(130,119,219,0.27)",
            color:P,
            transition:"filter .3s, transform .15s",
          }}
          onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.1)"}
          onMouseLeave={e => e.currentTarget.style.filter = ""}
          onMouseDown={e => e.currentTarget.style.transform = "scale(0.95)"}
          onMouseUp={e => e.currentTarget.style.transform = ""}>
            Let's fucking go
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

// ── Lista de rutinas del día (se inserta en la vista de Tareas) ──────
const RoutineDayList = ({ day, onEdit, onStep }) => {
  const D = window.Data;
  D.useStore();
  const routines = D.routinesForDay(day);
  if (!routines.length) return null;
  return (
    <div style={{ marginBottom: 32 }}>
      <style>{`
        @keyframes rtFlicker {
          0%, 100% { transform: scale(1) rotate(-2deg); }
          28%      { transform: scale(1.1) rotate(1.5deg); }
          52%      { transform: scale(0.94) rotate(-1deg); }
          78%      { transform: scale(1.06) rotate(2deg); }
        }
      `}</style>
      {routines.map(r => <RoutineCard key={r.id} r={r} day={day} onEdit={onEdit} onStep={onStep}/>)}
    </div>
  );
};

window.RoutineModal   = RoutineModal;
window.RoutineDayList = RoutineDayList;

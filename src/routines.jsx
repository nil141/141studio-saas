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
const RoutineCard = ({ r, day, onEdit }) => {
  const D = window.Data;
  const [celebrate, setCelebrate] = useState(false);
  const total = (r.items || []).length;
  const doneCount = (r.items || []).filter(it => D.routineItemDone(r.id, day, it.id)).length;
  const allDone = total > 0 && doneCount === total;

  const toggle = (it) => {
    const wasDone = D.routineItemDone(r.id, day, it.id);
    // ¿este toque completa la rutina al 100%?
    const willComplete = !wasDone && total > 0 && doneCount === total - 1;
    D.toggleRoutineItem(r.id, day, it.id);
    if (willComplete) setCelebrate(true);
  };

  return (
    <div style={{
      background:"var(--bg-elev-1)", border:"0.5px solid var(--border)", borderRadius:16,
      padding:"14px 16px", marginBottom:12,
    }}>
      {/* Cabecera */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom: total ? 12 : 0 }}>
        <div style={{
          width:34, height:34, borderRadius:10, flexShrink:0, display:"grid", placeItems:"center",
          background: allDone ? "var(--accent-soft)" : "rgba(255,255,255,0.05)",
          border:"0.5px solid var(--border)",
          color: allDone ? "var(--accent)" : "var(--text-muted)",
        }}>
          <Icon name={allDone ? "check" : "refresh-cw"} size={15} strokeWidth={1.8}/>
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:14.5, fontWeight:500, letterSpacing:"-0.4px", color:"var(--text)" }}>{r.title}</div>
          <div style={{ fontSize:11.5, color:"var(--text-subtle)", marginTop:2, letterSpacing:"-0.2px" }}>
            {R_FREQ_LABEL[r.frequency] || "Rutina"}{total ? ` · ${doneCount}/${total}` : ""}
          </div>
        </div>
        {/* Mini barra de progreso */}
        {total > 0 && (
          <div style={{ width:54, height:5, borderRadius:99, background:"rgba(255,255,255,0.08)", overflow:"hidden", flexShrink:0 }}>
            <div style={{ width:`${(doneCount/total)*100}%`, height:"100%", background:"var(--accent)", transition:"width .2s" }}/>
          </div>
        )}
        <button className="btn ghost icon-only sm" onClick={() => onEdit && onEdit(r)}
          data-tooltip="Editar rutina" style={{ flexShrink:0 }}>
          <Icon name="edit" size={13}/>
        </button>
      </div>

      {/* Checklist */}
      {total > 0 && (
        <div style={{ display:"flex", flexDirection:"column" }}>
          {r.items.map((it, idx) => {
            const done = D.routineItemDone(r.id, day, it.id);
            const last = idx === r.items.length - 1;
            return (
              <div key={it.id}
                onClick={() => toggle(it)}
                style={{
                  display:"flex", alignItems:"center", gap:12, cursor:"pointer",
                  padding:"9px 2px", borderBottom: last ? "none" : "0.5px solid var(--border)",
                }}>
                <div style={{
                  width:20, height:20, borderRadius:"50%", flexShrink:0, display:"grid", placeItems:"center",
                  background: done ? "var(--accent)" : "transparent",
                  border: done ? "none" : "1.5px solid rgba(255,255,255,0.2)",
                  transition:"all .12s",
                }}>
                  {done && <Icon name="check" size={12} style={{ color:"#0c0c0c" }}/>}
                </div>
                <span style={{
                  fontSize:13.5, letterSpacing:"-0.3px",
                  color: done ? "var(--text-subtle)" : "var(--text)",
                  textDecoration: done ? "line-through" : "none",
                }}>{it.text}</span>
              </div>
            );
          })}
        </div>
      )}

      {celebrate && (
        <RoutineCelebration rId={r.id} day={day} onClose={() => setCelebrate(false)}/>
      )}
    </div>
  );
};

// ── Celebración al completar una rutina (estilo racha) ───────────────
const CELEB_MSG = [
  "Otro día que te ganas a ti mismo.",
  "Así se construye un hábito 🔥",
  "Constancia > motivación.",
  "Pequeños pasos, grandes cambios.",
  "Imparable. Sigue así.",
  "Un día vas a ser una máquina.",
];
const CELEB_COLORS = ["#9e9ae5", "#34d399", "#60a5fa", "#fbbf24", "#fb7185", "#22d3ee"];

const RoutineCelebration = ({ rId, day, onClose }) => {
  const D = window.Data;
  const streak = D.routineStreak ? D.routineStreak(rId, day) : 1;
  const msg = CELEB_MSG[(Math.max(1, streak) - 1) % CELEB_MSG.length];

  // Auto-cierre a los 4.2s
  useEffect(() => {
    const t = setTimeout(onClose, 4200);
    return () => clearTimeout(t);
  }, []);

  // Partículas de confeti (direcciones deterministas)
  const N = 22;
  const parts = Array.from({ length: N }, (_, i) => {
    const ang = (i / N) * Math.PI * 2 + (i % 2 ? 0.35 : 0);
    const dist = 120 + (i % 5) * 34;
    return {
      tx: Math.round(Math.cos(ang) * dist),
      ty: Math.round(Math.sin(ang) * dist) - 40,
      c: CELEB_COLORS[i % CELEB_COLORS.length],
      d: (i % 7) * 0.04,
      sq: i % 3 === 0,
    };
  });

  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, zIndex:400,
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      background:"rgba(6,6,8,0.9)", backdropFilter:"blur(18px)", WebkitBackdropFilter:"blur(18px)",
      animation:"celebFade .28s ease-out",
    }}>
      <style>{`
        @keyframes celebFade { from{opacity:0} to{opacity:1} }
        @keyframes celebPop {
          0%{ transform:scale(0) rotate(-25deg); opacity:0 }
          55%{ transform:scale(1.15) rotate(6deg); opacity:1 }
          75%{ transform:scale(0.94) rotate(-2deg) }
          100%{ transform:scale(1) rotate(0) }
        }
        @keyframes celebGlow {
          0%,100%{ box-shadow:0 0 0 0 rgba(158,154,229,.0), 0 0 60px 8px rgba(158,154,229,.35) }
          50%{ box-shadow:0 0 0 14px rgba(158,154,229,.0), 0 0 90px 18px rgba(158,154,229,.55) }
        }
        @keyframes celebRing {
          0%{ transform:scale(0.8); opacity:.7 }
          100%{ transform:scale(2.1); opacity:0 }
        }
        @keyframes celebRise {
          from{ transform:translateY(16px); opacity:0 }
          to{ transform:translateY(0); opacity:1 }
        }
        @keyframes celebConfetti {
          0%{ transform:translate(0,0) scale(0) rotate(0); opacity:0 }
          12%{ opacity:1 }
          42%{ transform:translate(var(--tx),var(--ty)) scale(1) rotate(180deg); opacity:1 }
          100%{ transform:translate(var(--tx), calc(var(--ty) + 260px)) scale(.85) rotate(460deg); opacity:0 }
        }
        @keyframes celebBtnGlow {
          0%,100%{ box-shadow:0 0 22px -4px rgba(158,154,229,.6) }
          50%{ box-shadow:0 0 34px 0px rgba(158,154,229,.85) }
        }
      `}</style>

      {/* Confeti */}
      <div style={{ position:"absolute", top:"42%", left:"50%", width:0, height:0, pointerEvents:"none" }}>
        {parts.map((p, i) => (
          <span key={i} style={{
            position:"absolute", width: p.sq ? 9 : 8, height: p.sq ? 9 : 8,
            background:p.c, borderRadius: p.sq ? 2 : "50%",
            "--tx": `${p.tx}px`, "--ty": `${p.ty}px`,
            animation:`celebConfetti 1.5s cubic-bezier(.2,.7,.3,1) ${p.d}s forwards`,
          }}/>
        ))}
      </div>

      {/* Icono con glow + anillo */}
      <div style={{ position:"relative", marginBottom:34, animation:"celebPop .6s cubic-bezier(.2,.8,.2,1) both" }}>
        <div style={{
          position:"absolute", inset:0, borderRadius:"50%",
          border:"1.5px solid rgba(158,154,229,.5)", animation:"celebRing 1s ease-out .15s both",
        }}/>
        <div style={{
          width:128, height:128, borderRadius:"50%",
          display:"grid", placeItems:"center",
          background:"radial-gradient(circle at 50% 38%, rgba(158,154,229,.34), rgba(158,154,229,.08) 62%, transparent 75%)",
          border:"1px solid rgba(158,154,229,.35)",
          animation:"celebGlow 1.8s ease-in-out infinite",
        }}>
          <Icon name="check" size={54} strokeWidth={2.4} style={{ color:"#c9c5f5" }}/>
        </div>
      </div>

      {/* Racha */}
      <div style={{
        fontSize:44, fontWeight:600, letterSpacing:"-1.5px", color:"#fff",
        fontFamily:"var(--font-display)", textAlign:"center",
        animation:"celebRise .5s ease-out .12s both",
      }}>
        {streak > 1 ? `${streak} días seguidos` : "¡Rutina completada!"}
      </div>
      <div style={{
        fontSize:16, color:"rgba(255,255,255,0.55)", marginTop:10, letterSpacing:"-0.3px", textAlign:"center", maxWidth:340,
        animation:"celebRise .5s ease-out .2s both",
      }}>
        {streak > 1 ? msg : "Vuelve mañana para empezar tu racha 🔥"}
      </div>

      {/* Botón */}
      <button onClick={onClose} style={{
        marginTop:38, padding:"14px 34px", borderRadius:99, cursor:"pointer",
        background:"rgba(158,154,229,0.12)", border:"1px solid rgba(158,154,229,0.55)",
        color:"#c9c5f5", fontSize:16, fontWeight:600, letterSpacing:"-0.3px", fontFamily:"inherit",
        animation:"celebRise .5s ease-out .3s both, celebBtnGlow 2s ease-in-out infinite 1s",
      }}>
        ¡Vamos! 🚀
      </button>
    </div>
  );
};

// ── Lista de rutinas del día (se inserta en la vista de Tareas) ──────
const RoutineDayList = ({ day, onEdit }) => {
  const D = window.Data;
  D.useStore();
  const routines = D.routinesForDay(day);
  if (!routines.length) return null;
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
        <Icon name="refresh-cw" size={12} style={{ color:"var(--accent)" }}/>
        <span style={{ fontSize:12, fontWeight:400, textTransform:"uppercase", letterSpacing:"0.4px", color:"#9e9e9e" }}>
          Rutinas
        </span>
      </div>
      {routines.map(r => <RoutineCard key={r.id} r={r} day={day} onEdit={onEdit}/>)}
    </div>
  );
};

window.RoutineModal   = RoutineModal;
window.RoutineDayList = RoutineDayList;

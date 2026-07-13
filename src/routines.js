(() => {
  // src/routines.jsx
  var { useState, useEffect, useRef } = React;
  var R_FREQ = [
    { id: "daily", label: "Cada d\xEDa" },
    { id: "weekdays", label: "D\xEDas laborables" },
    { id: "weekly", label: "Cada semana" },
    { id: "monthly", label: "Cada mes" }
  ];
  var RoutineModal = ({ open, onClose, routine, date }) => {
    const D = window.Data;
    const toast = useToast();
    const editing = !!routine;
    const [title, setTitle] = useState("");
    const [freq, setFreq] = useState("daily");
    const [items, setItems] = useState([]);
    const [draft, setDraft] = useState("");
    const draftRef = useRef(null);
    useEffect(() => {
      if (!open) return;
      if (routine) {
        setTitle(routine.title || "");
        setFreq(routine.frequency || "daily");
        setItems((routine.items || []).map((it) => ({ id: it.id, text: it.text })));
      } else {
        setTitle("");
        setFreq("daily");
        setItems([]);
      }
      setDraft("");
    }, [open, routine]);
    const addItem = () => {
      const t = draft.trim();
      if (!t) return;
      setItems((prev) => [...prev, { text: t }]);
      setDraft("");
      if (draftRef.current) draftRef.current.focus();
    };
    const removeItem = (i) => setItems((prev) => prev.filter((_, idx) => idx !== i));
    const editItem = (i, v) => setItems((prev) => prev.map((it, idx) => idx === i ? { ...it, text: v } : it));
    const submit = () => {
      if (!title.trim()) {
        toast("Ponle un nombre a la rutina", "warn");
        return;
      }
      const cleanItems = items.map((it) => ({ ...it, text: it.text.trim() })).filter((it) => it.text);
      if (editing) {
        D.updateRoutine(routine.id, { title: title.trim(), frequency: freq, items: cleanItems });
        toast("Rutina actualizada", "success");
      } else {
        D.addRoutine({ title: title.trim(), frequency: freq, items: cleanItems, startDate: date || void 0 });
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
    return /* @__PURE__ */ React.createElement(
      Modal,
      {
        open,
        onClose,
        title: editing ? "Editar rutina" : "Nueva rutina",
        sub: "Una lista de pasos que se repite en los d\xEDas que elijas.",
        footer: /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" } }, /* @__PURE__ */ React.createElement("div", null, editing && /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: removeRoutine, style: { color: "var(--red)" } }, /* @__PURE__ */ React.createElement(Icon, { name: "trash", size: 13 }), " Eliminar")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: onClose }, "Cancelar"), /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: submit }, /* @__PURE__ */ React.createElement(Icon, { name: editing ? "check" : "plus", size: 12 }), " ", editing ? "Guardar" : "Crear rutina")))
      },
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 16 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Nombre de la rutina"), /* @__PURE__ */ React.createElement(
        "input",
        {
          className: "input",
          autoFocus: true,
          placeholder: "Ej. Rutina ma\xF1anera",
          value: title,
          onChange: (e) => setTitle(e.target.value)
        }
      )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Frecuencia"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } }, R_FREQ.map((f) => {
        const on = freq === f.id;
        return /* @__PURE__ */ React.createElement("button", { key: f.id, onClick: () => setFreq(f.id), style: {
          padding: "8px 16px",
          borderRadius: 99,
          fontSize: 13,
          letterSpacing: "-0.3px",
          cursor: "pointer",
          fontFamily: "inherit",
          transition: "all .1s",
          background: on ? "var(--accent-soft)" : "rgba(255,255,255,0.05)",
          border: on ? "1px solid var(--accent)" : "0.5px solid var(--border)",
          color: on ? "var(--accent)" : "var(--text-muted)"
        } }, f.label);
      }))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Pasos ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-subtle)" } }, "\xB7 lo que haces dentro de la rutina")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 } }, items.length === 0 && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: "var(--text-subtle)", padding: "6px 2px", letterSpacing: "-0.2px" } }, "A\xF1ade los pasos que quieras (ej. \u201CRevisar correos\u201D, \u201CPlanificar el d\xEDa\u201D\u2026)."), items.map((it, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 6, height: 6, borderRadius: "50%", background: "var(--text-subtle)", flexShrink: 0 } }), /* @__PURE__ */ React.createElement(
        "input",
        {
          className: "input",
          value: it.text,
          onChange: (e) => editItem(i, e.target.value),
          style: { flex: 1, padding: "9px 12px", fontSize: 13 }
        }
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          className: "btn ghost icon-only sm",
          onClick: () => removeItem(i),
          "data-tooltip": "Quitar paso",
          style: { flexShrink: 0 }
        },
        /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 13 })
      )))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement(
        "input",
        {
          ref: draftRef,
          className: "input",
          placeholder: "Escribe un paso y pulsa Enter\u2026",
          value: draft,
          onChange: (e) => setDraft(e.target.value),
          onKeyDown: (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addItem();
            }
          },
          style: { flex: 1 }
        }
      ), /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: addItem, style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 13 }), " A\xF1adir"))))
    );
  };
  var RoutineCard = ({ r, day, onEdit, onStep }) => {
    const D = window.Data;
    const [celebrate, setCelebrate] = useState(false);
    const total = (r.items || []).length;
    const doneCount = (r.items || []).filter((it) => D.routineItemDone(r.id, day, it.id)).length;
    const allDone = total > 0 && doneCount === total;
    let streak = D.routineStreak ? D.routineStreak(r.id, day) : 0;
    let streakPending = false;
    if (!streak && D.routineStreak) {
      const prev = /* @__PURE__ */ new Date(day + "T12:00:00");
      prev.setDate(prev.getDate() - 1);
      const prevStr = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}-${String(prev.getDate()).padStart(2, "0")}`;
      const s = D.routineStreak(r.id, prevStr);
      if (s > 0) {
        streak = s;
        streakPending = true;
      }
    }
    const toggle = (it) => {
      const wasDone = D.routineItemDone(r.id, day, it.id);
      const willComplete = !wasDone && total > 0 && doneCount === total - 1;
      D.toggleRoutineItem(r.id, day, it.id);
      if (willComplete) setCelebrate(true);
    };
    return /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 28 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 12 } }, /* @__PURE__ */ React.createElement(Icon, { name: "refresh-cw", size: 12, style: { color: "var(--accent)", flexShrink: 0, marginRight: -3 } }), /* @__PURE__ */ React.createElement(
      "span",
      {
        onClick: () => onEdit && onEdit(r),
        "data-tooltip": "Editar rutina",
        style: { fontSize: 12, fontWeight: 400, letterSpacing: "0", textTransform: "uppercase", color: "#9e9e9e", cursor: "pointer" }
      },
      r.title
    ), streak > 0 && /* @__PURE__ */ React.createElement(
      "div",
      {
        "data-tooltip": streakPending ? `Racha de ${streak} \u2014 completa hoy para mantenerla` : `${streak} ${streak === 1 ? "d\xEDa" : "d\xEDas"} de racha`,
        style: {
          display: "flex",
          alignItems: "center",
          gap: 4,
          marginLeft: 2,
          color: streakPending ? "var(--text-subtle)" : "var(--accent)"
        }
      },
      /* @__PURE__ */ React.createElement("span", { style: {
        display: "inline-flex",
        transformOrigin: "50% 85%",
        animation: streakPending ? "none" : "rtFlicker 1.7s ease-in-out infinite"
      } }, /* @__PURE__ */ React.createElement(Icon, { name: "flame", size: 13, strokeWidth: 1.7 })),
      /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, fontWeight: 600, letterSpacing: "-0.2px" } }, streak)
    )), r.items.map((it, idx) => {
      const pct = D.routineItemProgress ? D.routineItemProgress(r.id, day, it.id) : D.routineItemDone(r.id, day, it.id) ? 100 : 0;
      const done = pct >= 100;
      const last = idx === r.items.length - 1;
      const circ = 2 * Math.PI * 17;
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          key: it.id,
          onClick: () => onStep ? onStep(r, it) : toggle(it),
          className: "task-row",
          style: {
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "12px 4px",
            cursor: "pointer",
            borderBottom: last ? "none" : "0.5px solid var(--border)"
          }
        },
        /* @__PURE__ */ React.createElement("div", { style: { width: 40, height: 40, flexShrink: 0, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement("svg", { width: "40", height: "40", style: { position: "absolute", top: 0, left: 0 } }, /* @__PURE__ */ React.createElement(
          "circle",
          {
            cx: "20",
            cy: "20",
            r: "17",
            fill: "none",
            stroke: done ? "var(--accent)" : "rgba(255,255,255,0.12)",
            strokeWidth: "2"
          }
        ), !done && pct > 0 && /* @__PURE__ */ React.createElement(
          "circle",
          {
            cx: "20",
            cy: "20",
            r: "17",
            fill: "none",
            stroke: "var(--accent)",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeDasharray: `${pct / 100 * circ} ${circ}`,
            transform: "rotate(-90,20,20)"
          }
        )), done ? /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 15, style: { color: "var(--accent)", position: "relative" } }) : pct > 0 ? /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 600, color: "var(--accent)", position: "relative", letterSpacing: "-0.5px" } }, pct) : /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 11, style: { color: "rgba(255,255,255,0.22)", position: "relative" } })),
        /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: {
          fontSize: 14,
          letterSpacing: "-0.5px",
          color: done ? "var(--text-subtle)" : "var(--text)",
          textDecoration: done ? "line-through" : "none"
        } }, it.text), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-subtle)", marginTop: 2, letterSpacing: "-0.2px" } }, done ? "Hecho" : pct > 0 ? "En curso" : "Por hacer"))
      );
    }), celebrate && /* @__PURE__ */ React.createElement(RoutineCelebration, { rId: r.id, day, onClose: () => setCelebrate(false) }));
  };
  var CELEB_MSG = [
    "One day you're gonna be the shit, dude!",
    "As\xED se construye un h\xE1bito \u{1F525}",
    "Constancia > motivaci\xF3n.",
    "Peque\xF1os pasos, grandes cambios.",
    "Imparable. Sigue as\xED.",
    "Un d\xEDa vas a ser una m\xE1quina."
  ];
  var RoutineCelebration = ({ rId, day, onClose }) => {
    const D = window.Data;
    const streak = Math.max(1, D.routineStreak ? D.routineStreak(rId, day) : 1);
    const msg = CELEB_MSG[(streak - 1) % CELEB_MSG.length];
    const P = "rgb(130,119,219)";
    return ReactDOM.createPortal(
      /* @__PURE__ */ React.createElement("div", { style: {
        position: "fixed",
        inset: 0,
        zIndex: 400,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "odFade .3s ease-out"
      } }, /* @__PURE__ */ React.createElement("style", null, `
        @keyframes odFade   { from{opacity:0} to{opacity:1} }
        @keyframes odPop    { 0%{transform:scale(.55);opacity:0} 60%{transform:scale(1.06);opacity:1} 100%{transform:scale(1)} }
        @keyframes odSpin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes odBreath { 0%,100%{transform:scale(1)} 50%{transform:scale(1.12)} }
        @keyframes odPulse  { 0%,100%{transform:scale(1);opacity:.28} 50%{transform:scale(1.05);opacity:.5} }
        @keyframes odFloat  { 0%,100%{transform:translateY(0);opacity:.34} 50%{transform:translateY(-2.5px);opacity:.5} }
        @keyframes odRise   { from{opacity:0;filter:blur(8px);transform:translateY(14px)} to{opacity:1;filter:blur(0);transform:translateY(0)} }
      `), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, zIndex: -1, pointerEvents: "none" } }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 50% 0%, #17171d 0%, #0b0b0f 55%, #070709 100%)" } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, background: "rgba(5,5,8,0.55)" } })), /* @__PURE__ */ React.createElement("div", { style: { position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 16px", width: "100%", maxWidth: 512, textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { position: "relative", width: 130, height: 130, marginBottom: 16, overflow: "visible", pointerEvents: "none", animation: "odPop .55s cubic-bezier(.2,.8,.2,1) both" } }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(158,154,229,0.2)", filter: "blur(60px)", animation: "odBreath 3s ease-in-out infinite" } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 16, borderRadius: "50%", border: "1px solid rgba(158,154,229,0.6)", filter: "drop-shadow(0 0 8px rgba(158,154,229,0.8))" } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 } }, /* @__PURE__ */ React.createElement("svg", { width: "91", height: "91", viewBox: "0 0 24 24", fill: "none", style: { overflow: "visible", filter: "drop-shadow(0 0 20px rgba(158,154,229,0.5))" } }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("linearGradient", { id: "rtNeonGrad", x1: "12", y1: "2", x2: "12", y2: "22", gradientUnits: "userSpaceOnUse" }, /* @__PURE__ */ React.createElement("stop", { offset: "0%", stopColor: "#E0DFFF" }), /* @__PURE__ */ React.createElement("stop", { offset: "40%", stopColor: "#9E9AE5" }), /* @__PURE__ */ React.createElement("stop", { offset: "100%", stopColor: "#6C68B0" }))), /* @__PURE__ */ React.createElement(
        "path",
        {
          d: "M12 2C12 2 19 7 19 13C19 16.866 15.866 20 12 20C8.13401 20 5 16.866 5 13C5 7 12 2 12 2Z",
          fill: "rgba(158,154,229,0.10)",
          style: { transformOrigin: "50% 50%", transformBox: "fill-box", animation: "odPulse 2.4s ease-in-out infinite" }
        }
      ), /* @__PURE__ */ React.createElement(
        "path",
        {
          d: "M12 2.5C12 2.5 18.5 7.5 18.5 13C18.5 16.59 15.59 19.5 12 19.5C8.41 19.5 5.5 16.59 5.5 13C5.5 7.5 12 2.5 12 2.5Z",
          fill: "url(#rtNeonGrad)",
          opacity: "0.95"
        }
      ), /* @__PURE__ */ React.createElement(
        "path",
        {
          d: "M12 8C12 8 15 10.5 15 14C15 15.6569 13.6569 17 12 17C10.3431 17 9 15.6569 9 14C9 10.5 12 8 12 8Z",
          fill: "#fff",
          style: { mixBlendMode: "overlay", transformOrigin: "50% 50%", transformBox: "fill-box", animation: "odFloat 2.2s ease-in-out infinite" }
        }
      ))), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, pointerEvents: "none", animation: "odSpin 7s linear infinite" } }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: "15%", left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: "#fff", opacity: 0.3, filter: "blur(0.2px)" } })), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, pointerEvents: "none", animation: "odSpin 11s linear infinite reverse" } }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: "15%", left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: "#fff", opacity: 0.3, filter: "blur(0.2px)" } }))), /* @__PURE__ */ React.createElement("h2", { style: {
        fontSize: 32,
        fontWeight: 500,
        letterSpacing: "-0.06em",
        color: "#fff",
        margin: 0,
        fontFamily: "var(--font-display)",
        animation: "odRise .55s ease-out .12s both"
      } }, streak === 1 ? "1 d\xEDa de racha" : `${streak} d\xEDas de racha`), /* @__PURE__ */ React.createElement("p", { style: {
        fontSize: 16,
        color: "rgba(255,255,255,0.5)",
        maxWidth: 280,
        margin: "8px auto",
        letterSpacing: "-0.2px",
        animation: "odRise .55s ease-out .22s both"
      } }, msg), /* @__PURE__ */ React.createElement("div", { style: { animation: "odRise .55s ease-out .32s both" } }, /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: onClose,
          style: {
            marginTop: 48,
            padding: "12px 24px",
            borderRadius: 999,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 17,
            fontWeight: 500,
            letterSpacing: "-0.3px",
            fontFamily: "inherit",
            userSelect: "none",
            backgroundColor: "rgba(130,119,219,0.25)",
            border: `1px solid ${P}`,
            boxShadow: "0 0 20px rgba(130,119,219,0.27)",
            color: P,
            transition: "filter .3s, transform .15s"
          },
          onMouseEnter: (e) => e.currentTarget.style.filter = "brightness(1.1)",
          onMouseLeave: (e) => e.currentTarget.style.filter = "",
          onMouseDown: (e) => e.currentTarget.style.transform = "scale(0.95)",
          onMouseUp: (e) => e.currentTarget.style.transform = ""
        },
        "Let's fucking go"
      )))),
      document.body
    );
  };
  var RoutineDayList = ({ day, onEdit, onStep }) => {
    const D = window.Data;
    D.useStore();
    const routines = D.routinesForDay(day);
    if (!routines.length) return null;
    return /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 32 } }, /* @__PURE__ */ React.createElement("style", null, `
        @keyframes rtFlicker {
          0%, 100% { transform: scale(1) rotate(-2deg); }
          28%      { transform: scale(1.1) rotate(1.5deg); }
          52%      { transform: scale(0.94) rotate(-1deg); }
          78%      { transform: scale(1.06) rotate(2deg); }
        }
      `), routines.map((r) => /* @__PURE__ */ React.createElement(RoutineCard, { key: r.id, r, day, onEdit, onStep })));
  };
  window.RoutineModal = RoutineModal;
  window.RoutineDayList = RoutineDayList;
})();

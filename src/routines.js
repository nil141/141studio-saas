(() => {
  // src/routines.jsx
  var { useState, useEffect, useRef } = React;
  var R_FREQ = [
    { id: "daily", label: "Cada d\xEDa" },
    { id: "weekdays", label: "D\xEDas laborables" },
    { id: "weekly", label: "Cada semana" },
    { id: "monthly", label: "Cada mes" }
  ];
  var R_FREQ_LABEL = { daily: "Cada d\xEDa", weekdays: "D\xEDas laborables", weekly: "Cada semana", monthly: "Cada mes" };
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
  var RoutineCard = ({ r, day, onEdit }) => {
    const D = window.Data;
    const [celebrate, setCelebrate] = useState(false);
    const total = (r.items || []).length;
    const doneCount = (r.items || []).filter((it) => D.routineItemDone(r.id, day, it.id)).length;
    const allDone = total > 0 && doneCount === total;
    const toggle = (it) => {
      const wasDone = D.routineItemDone(r.id, day, it.id);
      const willComplete = !wasDone && total > 0 && doneCount === total - 1;
      D.toggleRoutineItem(r.id, day, it.id);
      if (willComplete) setCelebrate(true);
    };
    return /* @__PURE__ */ React.createElement("div", { style: {
      background: "var(--bg-elev-1)",
      border: "0.5px solid var(--border)",
      borderRadius: 16,
      padding: "14px 16px",
      marginBottom: 12
    } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: total ? 12 : 0 } }, /* @__PURE__ */ React.createElement("div", { style: {
      width: 34,
      height: 34,
      borderRadius: 10,
      flexShrink: 0,
      display: "grid",
      placeItems: "center",
      background: allDone ? "var(--accent-soft)" : "rgba(255,255,255,0.05)",
      border: "0.5px solid var(--border)",
      color: allDone ? "var(--accent)" : "var(--text-muted)"
    } }, /* @__PURE__ */ React.createElement(Icon, { name: allDone ? "check" : "refresh-cw", size: 15, strokeWidth: 1.8 })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14.5, fontWeight: 500, letterSpacing: "-0.4px", color: "var(--text)" } }, r.title), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--text-subtle)", marginTop: 2, letterSpacing: "-0.2px" } }, R_FREQ_LABEL[r.frequency] || "Rutina", total ? ` \xB7 ${doneCount}/${total}` : "")), total > 0 && /* @__PURE__ */ React.createElement("div", { style: { width: 54, height: 5, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden", flexShrink: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { width: `${doneCount / total * 100}%`, height: "100%", background: "var(--accent)", transition: "width .2s" } })), /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "btn ghost icon-only sm",
        onClick: () => onEdit && onEdit(r),
        "data-tooltip": "Editar rutina",
        style: { flexShrink: 0 }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "edit", size: 13 })
    )), total > 0 && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column" } }, r.items.map((it, idx) => {
      const done = D.routineItemDone(r.id, day, it.id);
      const last = idx === r.items.length - 1;
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          key: it.id,
          onClick: () => toggle(it),
          style: {
            display: "flex",
            alignItems: "center",
            gap: 12,
            cursor: "pointer",
            padding: "9px 2px",
            borderBottom: last ? "none" : "0.5px solid var(--border)"
          }
        },
        /* @__PURE__ */ React.createElement("div", { style: {
          width: 20,
          height: 20,
          borderRadius: "50%",
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
          background: done ? "var(--accent)" : "transparent",
          border: done ? "none" : "1.5px solid rgba(255,255,255,0.2)",
          transition: "all .12s"
        } }, done && /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 12, style: { color: "#0c0c0c" } })),
        /* @__PURE__ */ React.createElement("span", { style: {
          fontSize: 13.5,
          letterSpacing: "-0.3px",
          color: done ? "var(--text-subtle)" : "var(--text)",
          textDecoration: done ? "line-through" : "none"
        } }, it.text)
      );
    })), celebrate && /* @__PURE__ */ React.createElement(RoutineCelebration, { rId: r.id, day, onClose: () => setCelebrate(false) }));
  };
  var CELEB_MSG = [
    "Otro d\xEDa que te ganas a ti mismo.",
    "As\xED se construye un h\xE1bito \u{1F525}",
    "Constancia > motivaci\xF3n.",
    "Peque\xF1os pasos, grandes cambios.",
    "Imparable. Sigue as\xED.",
    "Un d\xEDa vas a ser una m\xE1quina."
  ];
  var CELEB_COLORS = ["#9e9ae5", "#34d399", "#60a5fa", "#fbbf24", "#fb7185", "#22d3ee"];
  var RoutineCelebration = ({ rId, day, onClose }) => {
    const D = window.Data;
    const streak = D.routineStreak ? D.routineStreak(rId, day) : 1;
    const msg = CELEB_MSG[(Math.max(1, streak) - 1) % CELEB_MSG.length];
    useEffect(() => {
      const t = setTimeout(onClose, 4200);
      return () => clearTimeout(t);
    }, []);
    const N = 22;
    const parts = Array.from({ length: N }, (_, i) => {
      const ang = i / N * Math.PI * 2 + (i % 2 ? 0.35 : 0);
      const dist = 120 + i % 5 * 34;
      return {
        tx: Math.round(Math.cos(ang) * dist),
        ty: Math.round(Math.sin(ang) * dist) - 40,
        c: CELEB_COLORS[i % CELEB_COLORS.length],
        d: i % 7 * 0.04,
        sq: i % 3 === 0
      };
    });
    return /* @__PURE__ */ React.createElement("div", { onClick: onClose, style: {
      position: "fixed",
      inset: 0,
      zIndex: 400,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(6,6,8,0.9)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      animation: "celebFade .28s ease-out"
    } }, /* @__PURE__ */ React.createElement("style", null, `
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
      `), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: "42%", left: "50%", width: 0, height: 0, pointerEvents: "none" } }, parts.map((p, i) => /* @__PURE__ */ React.createElement("span", { key: i, style: {
      position: "absolute",
      width: p.sq ? 9 : 8,
      height: p.sq ? 9 : 8,
      background: p.c,
      borderRadius: p.sq ? 2 : "50%",
      "--tx": `${p.tx}px`,
      "--ty": `${p.ty}px`,
      animation: `celebConfetti 1.5s cubic-bezier(.2,.7,.3,1) ${p.d}s forwards`
    } }))), /* @__PURE__ */ React.createElement("div", { style: { position: "relative", marginBottom: 34, animation: "celebPop .6s cubic-bezier(.2,.8,.2,1) both" } }, /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      inset: 0,
      borderRadius: "50%",
      border: "1.5px solid rgba(158,154,229,.5)",
      animation: "celebRing 1s ease-out .15s both"
    } }), /* @__PURE__ */ React.createElement("div", { style: {
      width: 128,
      height: 128,
      borderRadius: "50%",
      display: "grid",
      placeItems: "center",
      background: "radial-gradient(circle at 50% 38%, rgba(158,154,229,.34), rgba(158,154,229,.08) 62%, transparent 75%)",
      border: "1px solid rgba(158,154,229,.35)",
      animation: "celebGlow 1.8s ease-in-out infinite"
    } }, /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 54, strokeWidth: 2.4, style: { color: "#c9c5f5" } }))), /* @__PURE__ */ React.createElement("div", { style: {
      fontSize: 44,
      fontWeight: 600,
      letterSpacing: "-1.5px",
      color: "#fff",
      fontFamily: "var(--font-display)",
      textAlign: "center",
      animation: "celebRise .5s ease-out .12s both"
    } }, streak > 1 ? `${streak} d\xEDas seguidos` : "\xA1Rutina completada!"), /* @__PURE__ */ React.createElement("div", { style: {
      fontSize: 16,
      color: "rgba(255,255,255,0.55)",
      marginTop: 10,
      letterSpacing: "-0.3px",
      textAlign: "center",
      maxWidth: 340,
      animation: "celebRise .5s ease-out .2s both"
    } }, streak > 1 ? msg : "Vuelve ma\xF1ana para empezar tu racha \u{1F525}"), /* @__PURE__ */ React.createElement("button", { onClick: onClose, style: {
      marginTop: 38,
      padding: "14px 34px",
      borderRadius: 99,
      cursor: "pointer",
      background: "rgba(158,154,229,0.12)",
      border: "1px solid rgba(158,154,229,0.55)",
      color: "#c9c5f5",
      fontSize: 16,
      fontWeight: 600,
      letterSpacing: "-0.3px",
      fontFamily: "inherit",
      animation: "celebRise .5s ease-out .3s both, celebBtnGlow 2s ease-in-out infinite 1s"
    } }, "\xA1Vamos! \u{1F680}"));
  };
  var RoutineDayList = ({ day, onEdit }) => {
    const D = window.Data;
    D.useStore();
    const routines = D.routinesForDay(day);
    if (!routines.length) return null;
    return /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 32 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 12 } }, /* @__PURE__ */ React.createElement(Icon, { name: "refresh-cw", size: 12, style: { color: "var(--accent)" } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, fontWeight: 400, textTransform: "uppercase", letterSpacing: "0.4px", color: "#9e9e9e" } }, "Rutinas")), routines.map((r) => /* @__PURE__ */ React.createElement(RoutineCard, { key: r.id, r, day, onEdit })));
  };
  window.RoutineModal = RoutineModal;
  window.RoutineDayList = RoutineDayList;
})();

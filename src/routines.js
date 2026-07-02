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
    const total = (r.items || []).length;
    const doneCount = (r.items || []).filter((it) => D.routineItemDone(r.id, day, it.id)).length;
    const allDone = total > 0 && doneCount === total;
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
          onClick: () => D.toggleRoutineItem(r.id, day, it.id),
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
    })));
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

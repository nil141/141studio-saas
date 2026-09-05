(() => {
  // src/agency-outreach.jsx
  var { useState, useEffect } = React;
  var OUTREACH_STATUS = [
    { id: "guardado", label: "Guardado", color: "#8b8b93" },
    { id: "contactado", label: "Contactado", color: "#60a5fa" },
    { id: "respondio", label: "Respondi\xF3", color: "#9e9ae5" },
    { id: "conversacion", label: "En conversaci\xF3n", color: "#e2b45c" },
    { id: "propuesta", label: "Propuesta enviada", color: "#d98cc0" },
    { id: "cerrado", label: "Cerrado", color: "#34d399" },
    { id: "descartado", label: "Descartado", color: "#dc5b5d" }
  ];
  var _stMeta = (id) => OUTREACH_STATUS.find((s) => s.id === id) || OUTREACH_STATUS[0];
  var _igUrl = (h) => {
    const u = (h || "").trim().replace(/^@/, "");
    return u ? "https://instagram.com/" + u : null;
  };
  var _webUrl = (w) => {
    const u = (w || "").trim();
    if (!u) return null;
    return /^https?:\/\//.test(u) ? u : "https://" + u;
  };
  var _OM = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  var _fmtDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return isNaN(d) ? "" : `${d.getDate()} ${_OM[d.getMonth()]}`;
  };
  var Check = ({ on, onToggle, dim }) => /* @__PURE__ */ React.createElement(
    "span",
    {
      onClick: (e) => {
        e.stopPropagation();
        onToggle();
      },
      style: {
        width: 16,
        height: 16,
        borderRadius: 5,
        flexShrink: 0,
        display: "grid",
        placeItems: "center",
        cursor: "pointer",
        border: on ? "none" : "1.5px solid var(--border-strong)",
        background: on ? "var(--accent)" : "transparent",
        opacity: dim && !on ? 0.5 : 1
      }
    },
    on && /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 11, style: { color: "#fff" } })
  );
  var InlineText = ({ value, onSave, placeholder, mono }) => {
    const [edit, setEdit] = useState(false);
    const [d, setD] = useState(value || "");
    useEffect(() => {
      if (!edit) setD(value || "");
    }, [value, edit]);
    if (edit) return /* @__PURE__ */ React.createElement(
      "input",
      {
        autoFocus: true,
        value: d,
        onChange: (e) => setD(e.target.value),
        onClick: (e) => e.stopPropagation(),
        onBlur: () => {
          setEdit(false);
          if (d !== (value || "")) onSave(d);
        },
        onKeyDown: (e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") {
            setD(value || "");
            setEdit(false);
          }
        },
        style: {
          width: "100%",
          minWidth: 90,
          background: "rgba(255,255,255,0.05)",
          border: "0.5px solid var(--accent)",
          borderRadius: 6,
          color: "var(--text)",
          fontSize: 13,
          padding: "4px 7px",
          fontFamily: mono ? "var(--font-mono)" : "inherit",
          outline: "none"
        }
      }
    );
    return /* @__PURE__ */ React.createElement(
      "span",
      {
        onClick: (e) => {
          e.stopPropagation();
          setD(value || "");
          setEdit(true);
        },
        style: {
          fontSize: 13,
          color: value ? "var(--text-muted)" : "var(--text-subtle)",
          cursor: "text",
          fontFamily: mono ? "var(--font-mono)" : "inherit",
          whiteSpace: "nowrap"
        }
      },
      value || placeholder
    );
  };
  var StatusPill = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);
    const m = _stMeta(value);
    useEffect(() => {
      if (!open) return;
      const c = () => setOpen(false);
      window.addEventListener("click", c);
      return () => window.removeEventListener("click", c);
    }, [open]);
    return /* @__PURE__ */ React.createElement("span", { style: { position: "relative", display: "inline-block" }, onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setOpen((o) => !o),
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "3px 10px",
          borderRadius: 7,
          cursor: "pointer",
          border: "none",
          fontFamily: "inherit",
          fontSize: 11.5,
          fontWeight: 500,
          whiteSpace: "nowrap",
          background: m.color + "22",
          color: m.color
        }
      },
      /* @__PURE__ */ React.createElement("span", { style: { width: 6, height: 6, borderRadius: "50%", background: m.color } }),
      m.label,
      /* @__PURE__ */ React.createElement(Icon, { name: "chevron-down", size: 11, style: { opacity: 0.7 } })
    ), open && /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      top: "calc(100% + 4px)",
      left: 0,
      zIndex: 30,
      minWidth: 175,
      background: "var(--bg-elev)",
      border: "0.5px solid var(--border-strong)",
      borderRadius: 12,
      padding: 5,
      boxShadow: "0 16px 40px rgba(0,0,0,0.5)"
    } }, OUTREACH_STATUS.map((s) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key: s.id,
        onClick: () => {
          onChange(s.id);
          setOpen(false);
        },
        onMouseEnter: (e) => e.currentTarget.style.background = "var(--bg-hover)",
        onMouseLeave: (e) => e.currentTarget.style.background = "transparent",
        style: { display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 8, cursor: "pointer", fontSize: 13 }
      },
      /* @__PURE__ */ React.createElement("span", { style: { width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 } }),
      /* @__PURE__ */ React.createElement("span", { style: { flex: 1 } }, s.label),
      s.id === value && /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 13, style: { color: "var(--accent)" } })
    ))));
  };
  var _cell = { padding: "0 14px", height: 48, verticalAlign: "middle", whiteSpace: "nowrap" };
  var OutreachRow = ({ o, D, sel, onSel, last }) => {
    const ig = _igUrl(o.instagram), web = _webUrl(o.web);
    const m = _stMeta(o.status);
    const cell = { ..._cell, borderTop: "0.5px solid var(--border)" };
    return /* @__PURE__ */ React.createElement(
      "tr",
      {
        onMouseEnter: (e) => e.currentTarget.style.background = sel ? "var(--accent-soft)" : "rgba(255,255,255,0.02)",
        onMouseLeave: (e) => e.currentTarget.style.background = sel ? "var(--accent-active)" : "transparent",
        style: { transition: "background .1s", background: sel ? "var(--accent-active)" : "transparent" }
      },
      /* @__PURE__ */ React.createElement("td", { style: { ...cell, paddingLeft: 16, paddingRight: 4 } }, /* @__PURE__ */ React.createElement(Check, { on: sel, onToggle: onSel, dim: true })),
      /* @__PURE__ */ React.createElement("td", { style: { ...cell, fontWeight: 500, fontSize: 14 } }, /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 8, height: 8, borderRadius: "50%", background: m.color, flexShrink: 0 } }), o.brand)),
      /* @__PURE__ */ React.createElement("td", { style: cell }, /* @__PURE__ */ React.createElement(StatusPill, { value: o.status, onChange: (s) => D.updateOutreach(o.id, { status: s }) })),
      /* @__PURE__ */ React.createElement("td", { style: cell }, /* @__PURE__ */ React.createElement(InlineText, { value: o.contact, placeholder: "\u2014", onSave: (v) => D.updateOutreach(o.id, { contact: v }) })),
      /* @__PURE__ */ React.createElement("td", { style: cell }, ig ? /* @__PURE__ */ React.createElement(
        "a",
        {
          href: ig,
          target: "_blank",
          rel: "noreferrer",
          onClick: (e) => e.stopPropagation(),
          style: { color: "var(--accent)", textDecoration: "none", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 5 }
        },
        /* @__PURE__ */ React.createElement(SiIcon, { name: "instagram", size: 13 }),
        " ",
        o.instagram.startsWith("@") ? o.instagram : "@" + o.instagram
      ) : /* @__PURE__ */ React.createElement(InlineText, { value: "", placeholder: "@instagram", onSave: (v) => D.updateOutreach(o.id, { instagram: v }) })),
      /* @__PURE__ */ React.createElement("td", { style: cell }, web ? /* @__PURE__ */ React.createElement(
        "a",
        {
          href: web,
          target: "_blank",
          rel: "noreferrer",
          onClick: (e) => e.stopPropagation(),
          style: { color: "var(--text-muted)", textDecoration: "none", fontSize: 12.5, display: "inline-flex", alignItems: "center", gap: 5 }
        },
        /* @__PURE__ */ React.createElement(Icon, { name: "link", size: 12 }),
        " Web"
      ) : /* @__PURE__ */ React.createElement(InlineText, { value: "", placeholder: "web", onSave: (v) => D.updateOutreach(o.id, { web: v }) })),
      /* @__PURE__ */ React.createElement("td", { style: cell }, /* @__PURE__ */ React.createElement(InlineText, { value: o.email, placeholder: "correo", mono: true, onSave: (v) => D.updateOutreach(o.id, { email: v }) })),
      /* @__PURE__ */ React.createElement("td", { style: { ...cell, whiteSpace: "normal", minWidth: 180 } }, /* @__PURE__ */ React.createElement(InlineText, { value: o.notes, placeholder: "A\xF1adir nota\u2026", onSave: (v) => D.updateOutreach(o.id, { notes: v }) })),
      /* @__PURE__ */ React.createElement("td", { style: { ...cell, fontSize: 12, color: "var(--text-subtle)" } }, _fmtDate(o.createdAt)),
      /* @__PURE__ */ React.createElement("td", { style: { ...cell, textAlign: "right", paddingRight: 12 } }, /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => D.deleteOutreach(o.id),
          title: "Eliminar",
          style: { background: "transparent", border: "none", cursor: "pointer", color: "var(--text-subtle)", padding: 4, borderRadius: 6 },
          onMouseEnter: (e) => e.currentTarget.style.color = "var(--red)",
          onMouseLeave: (e) => e.currentTarget.style.color = "var(--text-subtle)"
        },
        /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 14 })
      ))
    );
  };
  var AgencyOutreach = ({ navigate }) => {
    const D = window.Data;
    D.useStore();
    const all = D.OUTREACH || [];
    const [q, setQ] = useState("");
    const [sel, setSel] = useState(() => /* @__PURE__ */ new Set());
    const [showAdd, setShowAdd] = useState(false);
    const _emptyF = { brand: "", instagram: "", contact: "", email: "", web: "", status: "guardado", notes: "" };
    const [f, setF] = useState(_emptyF);
    const upd = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
    const saveNew = () => {
      if (!f.brand.trim()) return;
      D.addOutreach({
        brand: f.brand.trim(),
        instagram: f.instagram.trim(),
        contact: f.contact.trim(),
        email: f.email.trim(),
        web: f.web.trim(),
        status: f.status,
        notes: f.notes.trim()
      });
      setF(_emptyF);
      setShowAdd(false);
    };
    const counts = {};
    OUTREACH_STATUS.forEach((s) => counts[s.id] = 0);
    all.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    const ql = q.trim().toLowerCase();
    const rows = all.filter((o) => !ql || (o.brand || "").toLowerCase().includes(ql) || (o.instagram || "").toLowerCase().includes(ql) || (o.contact || "").toLowerCase().includes(ql));
    const toggle = (id) => setSel((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
    const allSel = rows.length > 0 && rows.every((o) => sel.has(o.id));
    const toggleAll = () => setSel(allSel ? /* @__PURE__ */ new Set() : new Set(rows.map((o) => o.id)));
    const bulkDelete = () => {
      sel.forEach((id) => D.deleteOutreach(id));
      setSel(/* @__PURE__ */ new Set());
    };
    const th = {
      textAlign: "left",
      padding: "0 14px",
      height: 38,
      fontSize: 10.5,
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      color: "var(--text-subtle)",
      whiteSpace: "nowrap",
      position: "sticky",
      top: 0
    };
    return /* @__PURE__ */ React.createElement("div", { className: "page" }, /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", null, "Propuestas Outreach"), /* @__PURE__ */ React.createElement("div", { className: "sub", style: { display: "flex", gap: 6, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", { style: { color: "var(--text)", fontWeight: 600 } }, all.length), " marcas"), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-subtle)" } }, "\xB7"), /* @__PURE__ */ React.createElement("span", null, counts.contactado || 0, " contactadas"), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-subtle)" } }, "\xB7"), /* @__PURE__ */ React.createElement("span", null, counts.respondio || 0, " respuestas"), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-subtle)" } }, "\xB7"), /* @__PURE__ */ React.createElement("span", null, counts.propuesta || 0, " propuestas"))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, sel.size > 0 && /* @__PURE__ */ React.createElement("button", { onClick: bulkDelete, className: "btn ghost sm", style: { color: "var(--red)" } }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 13 }), " Eliminar (", sel.size, ")"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, height: 34, padding: "0 12px", borderRadius: 9, background: "var(--bg-elev-2)", border: "0.5px solid var(--border)" } }, /* @__PURE__ */ React.createElement(Icon, { name: "search", size: 14, style: { color: "var(--text-subtle)" } }), /* @__PURE__ */ React.createElement(
      "input",
      {
        value: q,
        onChange: (e) => setQ(e.target.value),
        placeholder: "Buscar\u2026",
        style: { background: "transparent", border: "none", outline: "none", color: "var(--text)", fontSize: 13, fontFamily: "inherit", width: 150 }
      }
    )), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setShowAdd(true),
        onMouseEnter: (e) => e.currentTarget.style.background = "rgba(158,154,229,0.28)",
        onMouseLeave: (e) => e.currentTarget.style.background = "var(--accent-soft)",
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          height: 34,
          padding: "0 14px",
          borderRadius: 9,
          background: "var(--accent-soft)",
          color: "var(--accent)",
          border: "1px solid rgba(158,154,229,0.3)",
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: 13,
          fontWeight: 500,
          whiteSpace: "nowrap",
          transition: "background .15s"
        }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 14 }),
      " Nuevo lead"
    ))), /* @__PURE__ */ React.createElement("div", { style: { border: "0.5px solid var(--border)", borderRadius: 16, overflow: "hidden", background: "var(--bg-elev-2)" } }, /* @__PURE__ */ React.createElement("div", { style: { overflowX: "auto" } }, /* @__PURE__ */ React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", minWidth: 1e3 } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { style: { background: "var(--bg-elev-2)" } }, /* @__PURE__ */ React.createElement("th", { style: { ...th, paddingLeft: 16, paddingRight: 4, width: 34 } }, /* @__PURE__ */ React.createElement(Check, { on: allSel, onToggle: toggleAll })), /* @__PURE__ */ React.createElement("th", { style: th }, "Marca"), /* @__PURE__ */ React.createElement("th", { style: th }, "Estado"), /* @__PURE__ */ React.createElement("th", { style: th }, "Contacto"), /* @__PURE__ */ React.createElement("th", { style: th }, "Instagram"), /* @__PURE__ */ React.createElement("th", { style: th }, "Web"), /* @__PURE__ */ React.createElement("th", { style: th }, "Correo"), /* @__PURE__ */ React.createElement("th", { style: th }, "Notas"), /* @__PURE__ */ React.createElement("th", { style: th }, "Fecha"), /* @__PURE__ */ React.createElement("th", { style: { ...th, textAlign: "right" } }))), /* @__PURE__ */ React.createElement("tbody", null, rows.map((o) => /* @__PURE__ */ React.createElement(OutreachRow, { key: o.id, o, D, sel: sel.has(o.id), onSel: () => toggle(o.id), last: false }))))), rows.length === 0 && /* @__PURE__ */ React.createElement("div", { style: { padding: "44px 0" } }, /* @__PURE__ */ React.createElement(
      Empty,
      {
        icon: "send",
        title: all.length === 0 ? "A\xFAn no tienes leads" : "Sin resultados",
        sub: all.length === 0 ? "A\xF1ade la primera cuenta con \xABNuevo lead\xBB." : "Prueba con otra b\xFAsqueda."
      }
    ))), showAdd && /* @__PURE__ */ React.createElement(NewLeadModal, { f, upd, setF, onClose: () => setShowAdd(false), onSave: saveNew }));
  };
  var _fst = {
    width: "100%",
    height: 40,
    background: "var(--bg-elev-2)",
    border: "0.5px solid var(--border)",
    borderRadius: 10,
    padding: "0 12px",
    color: "var(--text)",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none"
  };
  var _lst = { fontSize: 12, color: "var(--text-muted)", marginBottom: 6, display: "block" };
  var Fld = ({ label, children }) => /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("label", { style: _lst }, label), children);
  var NewLeadModal = ({ f, upd, setF, onClose, onSave }) => {
    useEffect(() => {
      const onKey = (e) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, []);
    return /* @__PURE__ */ React.createElement("div", { className: "modal-overlay", onClick: onClose }, /* @__PURE__ */ React.createElement("div", { className: "modal", style: { maxWidth: 540 }, onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("div", { style: { padding: "22px 24px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { style: { fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 500 } }, "Nuevo lead"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "var(--text-muted)", marginTop: 4 } }, "Guarda una cuenta que quieras contactar.")), /* @__PURE__ */ React.createElement("button", { onClick: onClose, style: { background: "transparent", border: "none", cursor: "pointer", color: "var(--text-subtle)", padding: 4 } }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 18 }))), /* @__PURE__ */ React.createElement("div", { style: { padding: "20px 24px 4px", display: "grid", gap: 14 } }, /* @__PURE__ */ React.createElement(Fld, { label: "Marca / cuenta *" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        autoFocus: true,
        value: f.brand,
        onChange: upd("brand"),
        placeholder: "Nombre de la marca",
        onKeyDown: (e) => {
          if (e.key === "Enter") onSave();
        },
        style: _fst
      }
    )), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, /* @__PURE__ */ React.createElement(Fld, { label: "Instagram" }, /* @__PURE__ */ React.createElement("input", { value: f.instagram, onChange: upd("instagram"), placeholder: "@usuario", style: _fst })), /* @__PURE__ */ React.createElement(Fld, { label: "Persona de contacto" }, /* @__PURE__ */ React.createElement("input", { value: f.contact, onChange: upd("contact"), placeholder: "Nombre", style: _fst }))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, /* @__PURE__ */ React.createElement(Fld, { label: "Correo" }, /* @__PURE__ */ React.createElement("input", { value: f.email, onChange: upd("email"), placeholder: "correo@marca.com", style: _fst })), /* @__PURE__ */ React.createElement(Fld, { label: "Web" }, /* @__PURE__ */ React.createElement("input", { value: f.web, onChange: upd("web"), placeholder: "marca.com", style: _fst }))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, /* @__PURE__ */ React.createElement(Fld, { label: "Estado" }, /* @__PURE__ */ React.createElement("select", { value: f.status, onChange: upd("status"), style: { ..._fst, cursor: "pointer" } }, OUTREACH_STATUS.map((s) => /* @__PURE__ */ React.createElement("option", { key: s.id, value: s.id }, s.label))))), /* @__PURE__ */ React.createElement(Fld, { label: "Notas" }, /* @__PURE__ */ React.createElement(
      "textarea",
      {
        value: f.notes,
        onChange: upd("notes"),
        placeholder: "Contexto, por qu\xE9 encaja, siguiente paso\u2026",
        rows: 3,
        style: { ..._fst, height: "auto", padding: "10px 12px", resize: "vertical", lineHeight: 1.45 }
      }
    ))), /* @__PURE__ */ React.createElement("div", { style: { padding: "18px 24px 22px", display: "flex", justifyContent: "flex-end", gap: 10 } }, /* @__PURE__ */ React.createElement("button", { onClick: onClose, className: "btn ghost" }, "Cancelar"), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: onSave,
        disabled: !f.brand.trim(),
        className: "btn primary",
        style: { opacity: f.brand.trim() ? 1 : 0.5, pointerEvents: f.brand.trim() ? "auto" : "none" }
      },
      "Guardar lead"
    ))));
  };
  window.AgencyOutreach = AgencyOutreach;
})();

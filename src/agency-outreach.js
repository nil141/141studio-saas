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
  var _todayYmd = () => (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  var _DONE_ST = ["cerrado", "descartado"];
  var _isDue = (o) => !!o.nextFollowup && o.nextFollowup <= _todayYmd() && !_DONE_ST.includes(o.status) && !o.convertedClientId;
  var _followMeta = (o) => {
    if (o.convertedClientId || _DONE_ST.includes(o.status) || !o.nextFollowup) return null;
    const t = _todayYmd();
    if (o.nextFollowup < t) return { color: "#dc5b5d", label: "Atrasado" };
    if (o.nextFollowup === t) return { color: "#e2b45c", label: "Hoy" };
    return { color: "var(--text-subtle)", label: _fmtDate(o.nextFollowup) };
  };
  var _looksUrl = (s) => /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/\S*)?$/i.test(s) && !s.startsWith("@");
  var parseImport = (text) => {
    const out = [];
    (text || "").split(/\r?\n/).forEach((line) => {
      const raw = line.trim();
      if (!raw) return;
      const parts = raw.split(/\s*[,;\t|]\s*/).map((p) => p.trim()).filter(Boolean);
      let instagram = "", web = "";
      const leftover = [];
      parts.forEach((p) => {
        if (!instagram && p.startsWith("@")) instagram = p;
        else if (!web && _looksUrl(p)) web = p;
        else leftover.push(p);
      });
      let brand = leftover.shift() || "";
      const contact = leftover.shift() || "";
      if (!brand && instagram) brand = instagram.replace(/^@/, "");
      if (!brand && web) brand = web.replace(/^https?:\/\//, "").split(/[./]/)[0];
      if (!brand) return;
      out.push({ brand, instagram, web, contact });
    });
    return out;
  };
  var _norm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
  var _splitCsvLine = (line, delim) => {
    const out = [];
    let cur = "", inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (inQ) {
        if (c === '"') {
          if (line[i + 1] === '"') {
            cur += '"';
            i++;
          } else inQ = false;
        } else cur += c;
      } else if (c === '"') inQ = true;
      else if (c === delim) {
        out.push(cur);
        cur = "";
      } else cur += c;
    }
    out.push(cur);
    return out.map((s) => s.trim());
  };
  var parseCsv = (text) => {
    let t = (text || "").replace(/^﻿/, "");
    const lines = t.split(/\r?\n/).filter((l) => l.trim() !== "");
    if (!lines.length) return [];
    const first = lines[0];
    const cnt = (re) => (first.match(re) || []).length;
    const delim = cnt(/;/g) > cnt(/,/g) ? ";" : cnt(/\t/g) > cnt(/,/g) ? "	" : ",";
    const rows = lines.map((l) => _splitCsvLine(l, delim));
    const hdr = rows[0].map(_norm);
    const known = ["marca", "brand", "nombre", "empresa", "instagram", "ig", "usuario", "user", "web", "url", "sitio", "website", "contacto", "contact", "persona", "correo", "email", "mail", "notas", "notes", "nota", "estado", "status"];
    const hasHeader = hdr.some((h) => known.includes(h));
    const colFor = (names) => hdr.findIndex((h) => names.includes(h));
    const map = hasHeader ? {
      brand: colFor(["marca", "brand", "nombre", "empresa"]),
      instagram: colFor(["instagram", "ig", "usuario", "user"]),
      web: colFor(["web", "url", "sitio", "website"]),
      contact: colFor(["contacto", "contact", "persona"]),
      email: colFor(["correo", "email", "mail"]),
      notes: colFor(["notas", "notes", "nota"]),
      status: colFor(["estado", "status"])
    } : null;
    const STATUS_IDS = OUTREACH_STATUS.map((s) => s.id);
    const STATUS_BY_LABEL = {};
    OUTREACH_STATUS.forEach((s) => STATUS_BY_LABEL[_norm(s.label)] = s.id);
    const dataRows = hasHeader ? rows.slice(1) : rows;
    const out = [];
    dataRows.forEach((cols) => {
      if (!cols.length || cols.every((c) => !c)) return;
      if (hasHeader) {
        const g = (i) => (i >= 0 && i < cols.length ? cols[i] : "") || "";
        let brand = g(map.brand), instagram = g(map.instagram), web = g(map.web);
        const contact = g(map.contact), email = g(map.email), notes = g(map.notes);
        const sr = _norm(g(map.status));
        const status = STATUS_IDS.includes(sr) ? sr : STATUS_BY_LABEL[sr] || "guardado";
        if (!brand && instagram) brand = instagram.replace(/^@/, "");
        if (!brand) return;
        if (instagram && !instagram.startsWith("@")) instagram = "@" + instagram.replace(/^@/, "");
        out.push({ brand, instagram, web, contact, email, notes, status });
      } else {
        const p = parseImport(cols.join(","));
        if (p.length) out.push(p[0]);
      }
    });
    return out;
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
          color: value ? "var(--text)" : "var(--text-subtle)",
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
    const [pos, setPos] = useState(null);
    const btnRef = React.useRef(null);
    const m = _stMeta(value);
    const openMenu = () => {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 5, left: r.left });
      setOpen(true);
    };
    useEffect(() => {
      if (!open) return;
      const close = () => setOpen(false);
      window.addEventListener("click", close);
      window.addEventListener("scroll", close, true);
      window.addEventListener("resize", close);
      return () => {
        window.removeEventListener("click", close);
        window.removeEventListener("scroll", close, true);
        window.removeEventListener("resize", close);
      };
    }, [open]);
    return /* @__PURE__ */ React.createElement("span", { style: { display: "inline-block" }, onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement(
      "button",
      {
        ref: btnRef,
        onClick: () => open ? setOpen(false) : openMenu(),
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
    ), open && pos && ReactDOM.createPortal(
      /* @__PURE__ */ React.createElement(
        "div",
        {
          onClick: (e) => e.stopPropagation(),
          style: {
            position: "fixed",
            top: pos.top,
            left: pos.left,
            zIndex: 3e3,
            minWidth: 190,
            background: "var(--bg-elev)",
            border: "0.5px solid var(--border-strong)",
            borderRadius: 12,
            padding: 5,
            boxShadow: "0 16px 40px rgba(0,0,0,0.5)"
          }
        },
        OUTREACH_STATUS.map((s) => /* @__PURE__ */ React.createElement(
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
        ))
      ),
      document.body
    ));
  };
  var _cell = { padding: "0 14px", height: 48, verticalAlign: "middle", whiteSpace: "nowrap" };
  var OutreachRow = ({ o, D, sel, onSel, first }) => {
    const ig = _igUrl(o.instagram), web = _webUrl(o.web);
    const fm = _followMeta(o);
    const cell = { ..._cell, borderTop: first ? "none" : "0.5px solid var(--border)" };
    const iconBtn = { background: "transparent", border: "none", cursor: "pointer", color: "var(--text-subtle)", padding: 4, borderRadius: 6, display: "inline-flex" };
    return /* @__PURE__ */ React.createElement(
      "tr",
      {
        onMouseEnter: (e) => e.currentTarget.style.background = sel ? "var(--accent-soft)" : "rgba(255,255,255,0.02)",
        onMouseLeave: (e) => e.currentTarget.style.background = sel ? "var(--accent-active)" : "transparent",
        style: { transition: "background .1s", background: sel ? "var(--accent-active)" : "transparent" }
      },
      /* @__PURE__ */ React.createElement("td", { style: { ...cell, paddingLeft: 16, paddingRight: 4 } }, /* @__PURE__ */ React.createElement(Check, { on: sel, onToggle: onSel, dim: true })),
      /* @__PURE__ */ React.createElement("td", { style: { ...cell, fontWeight: 500, fontSize: 14 } }, o.brand),
      /* @__PURE__ */ React.createElement("td", { style: cell }, /* @__PURE__ */ React.createElement(StatusPill, { value: o.status, onChange: (s) => D.updateOutreach(o.id, { status: s }) })),
      /* @__PURE__ */ React.createElement("td", { style: cell }, fm ? /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500, color: fm.color } }, /* @__PURE__ */ React.createElement(Icon, { name: "bell", size: 11 }), " ", fm.label) : /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "var(--text-subtle)" } }, "\u2014")),
      /* @__PURE__ */ React.createElement("td", { style: cell }, /* @__PURE__ */ React.createElement(InlineText, { value: o.contact, placeholder: "\u2014", onSave: (v) => D.updateOutreach(o.id, { contact: v }) })),
      /* @__PURE__ */ React.createElement("td", { style: cell }, ig ? /* @__PURE__ */ React.createElement(
        "a",
        {
          href: ig,
          target: "_blank",
          rel: "noreferrer",
          onClick: (e) => e.stopPropagation(),
          style: { color: "var(--text)", textDecoration: "none", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 5 }
        },
        o.instagram.startsWith("@") ? o.instagram : "@" + o.instagram
      ) : /* @__PURE__ */ React.createElement(InlineText, { value: "", placeholder: "@instagram", onSave: (v) => D.updateOutreach(o.id, { instagram: v }) })),
      /* @__PURE__ */ React.createElement("td", { style: cell }, web ? /* @__PURE__ */ React.createElement(
        "a",
        {
          href: web,
          target: "_blank",
          rel: "noreferrer",
          onClick: (e) => e.stopPropagation(),
          title: o.web,
          style: { color: "var(--text)", textDecoration: "none", fontSize: 12.5, display: "inline-block", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", verticalAlign: "middle" }
        },
        o.web.replace(/^https?:\/\//, "")
      ) : /* @__PURE__ */ React.createElement(InlineText, { value: "", placeholder: "URL", onSave: (v) => D.updateOutreach(o.id, { web: v }) })),
      /* @__PURE__ */ React.createElement("td", { style: { ...cell, whiteSpace: "normal", minWidth: 180 } }, /* @__PURE__ */ React.createElement(InlineText, { value: o.notes, placeholder: "A\xF1adir nota\u2026", onSave: (v) => D.updateOutreach(o.id, { notes: v }) })),
      /* @__PURE__ */ React.createElement("td", { style: { ...cell, fontSize: 12, color: "var(--text-subtle)" } }, _fmtDate(o.createdAt)),
      /* @__PURE__ */ React.createElement("td", { style: { ...cell, textAlign: "right", paddingRight: 12 } }, /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, justifyContent: "flex-end" } }, !_DONE_ST.includes(o.status) && !o.convertedClientId && /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => D.outreachMarkContacted(o.id),
          title: "Marcar contactado hoy (programa seguimiento en 3 d\xEDas)",
          style: iconBtn,
          onMouseEnter: (e) => e.currentTarget.style.color = "var(--accent)",
          onMouseLeave: (e) => e.currentTarget.style.color = "var(--text-subtle)"
        },
        /* @__PURE__ */ React.createElement(Icon, { name: "send", size: 13 })
      ), o.convertedClientId ? /* @__PURE__ */ React.createElement("span", { title: "Ya es cliente", style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 500, color: "var(--green)", padding: "0 4px" } }, /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 12 }), " Cliente") : o.status === "cerrado" ? /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => D.convertOutreachToClient(o.id),
          title: "Convertir en cliente del CRM",
          style: {
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "3px 9px",
            borderRadius: 7,
            cursor: "pointer",
            background: "var(--accent-soft)",
            color: "var(--accent)",
            border: "1px solid rgba(158,154,229,0.3)",
            fontFamily: "inherit",
            fontSize: 11.5,
            fontWeight: 500,
            whiteSpace: "nowrap"
          }
        },
        /* @__PURE__ */ React.createElement(Icon, { name: "arrow-up-right", size: 12 }),
        " Cliente"
      ) : null, /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => D.deleteOutreach(o.id),
          title: "Eliminar",
          style: iconBtn,
          onMouseEnter: (e) => e.currentTarget.style.color = "var(--red)",
          onMouseLeave: (e) => e.currentTarget.style.color = "var(--text-subtle)"
        },
        /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 14 })
      )))
    );
  };
  var AgencyOutreach = ({ navigate }) => {
    const D = window.Data;
    D.useStore();
    const all = D.OUTREACH || [];
    const [q, setQ] = useState("");
    const [sel, setSel] = useState(() => /* @__PURE__ */ new Set());
    const [showAdd, setShowAdd] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const today = _todayYmd();
    const doImport = (leads) => {
      leads.forEach((l) => D.addOutreach({
        brand: l.brand,
        instagram: l.instagram || "",
        web: l.web || "",
        contact: l.contact || "",
        email: l.email || "",
        notes: l.notes || "",
        status: l.status || "guardado"
      }));
      setShowImport(false);
    };
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
    let rows = all.filter((o) => !ql || (o.brand || "").toLowerCase().includes(ql) || (o.instagram || "").toLowerCase().includes(ql) || (o.contact || "").toLowerCase().includes(ql));
    const _dueRank = (o) => _isDue(o) ? o.nextFollowup < today ? 0 : 1 : 2;
    rows = rows.slice().sort((a, b) => _dueRank(a) - _dueRank(b));
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
      height: 34,
      fontSize: 10.5,
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      color: "var(--text-subtle)",
      whiteSpace: "nowrap"
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
        onClick: () => setShowImport(true),
        title: "Importar varios leads pegando una lista",
        onMouseEnter: (e) => e.currentTarget.style.color = "var(--text)",
        onMouseLeave: (e) => e.currentTarget.style.color = "var(--text-muted)",
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          height: 34,
          padding: "0 12px",
          borderRadius: 9,
          background: "var(--bg-elev-2)",
          color: "var(--text-muted)",
          border: "0.5px solid var(--border)",
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: 13,
          fontWeight: 500,
          whiteSpace: "nowrap",
          transition: "color .15s"
        }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "file-text", size: 14 }),
      " Importar"
    ), /* @__PURE__ */ React.createElement(
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
    ))), /* @__PURE__ */ React.createElement("div", { style: { overflowX: "auto", marginTop: 4 } }, /* @__PURE__ */ React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", minWidth: 1120 } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { style: { borderBottom: "0.5px solid var(--border)" } }, /* @__PURE__ */ React.createElement("th", { style: { ...th, paddingLeft: 16, paddingRight: 4, width: 34 } }, /* @__PURE__ */ React.createElement(Check, { on: allSel, onToggle: toggleAll })), /* @__PURE__ */ React.createElement("th", { style: th }, "Marca"), /* @__PURE__ */ React.createElement("th", { style: th }, "Estado"), /* @__PURE__ */ React.createElement("th", { style: th }, "Seguimiento"), /* @__PURE__ */ React.createElement("th", { style: th }, "Contacto"), /* @__PURE__ */ React.createElement("th", { style: th }, "Instagram"), /* @__PURE__ */ React.createElement("th", { style: th }, "Web"), /* @__PURE__ */ React.createElement("th", { style: th }, "Notas"), /* @__PURE__ */ React.createElement("th", { style: th }, "Fecha"), /* @__PURE__ */ React.createElement("th", { style: { ...th, textAlign: "right" } }))), /* @__PURE__ */ React.createElement("tbody", null, rows.map((o, i) => /* @__PURE__ */ React.createElement(OutreachRow, { key: o.id, o, D, sel: sel.has(o.id), onSel: () => toggle(o.id), first: i === 0 }))))), rows.length === 0 && /* @__PURE__ */ React.createElement("div", { style: { padding: "44px 0" } }, /* @__PURE__ */ React.createElement(
      Empty,
      {
        icon: "send",
        title: all.length === 0 ? "A\xFAn no tienes leads" : "Sin resultados",
        sub: all.length === 0 ? "A\xF1ade la primera cuenta con \xABNuevo lead\xBB." : "Prueba con otra b\xFAsqueda."
      }
    )), showAdd && /* @__PURE__ */ React.createElement(NewLeadModal, { f, upd, setF, onClose: () => setShowAdd(false), onSave: saveNew }), showImport && /* @__PURE__ */ React.createElement(ImportLeadsModal, { onClose: () => setShowImport(false), onImport: doImport }));
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
  var ImportLeadsModal = ({ onClose, onImport }) => {
    const [file, setFile] = useState(null);
    const [drag, setDrag] = useState(false);
    const [err, setErr] = useState("");
    const inputRef = React.useRef(null);
    useEffect(() => {
      const onKey = (e) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, []);
    const loadFile = (f) => {
      if (!f) return;
      setErr("");
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const leads = parseCsv(String(reader.result || ""));
          if (!leads.length) {
            setErr("No he encontrado ninguna fila v\xE1lida en el archivo.");
            setFile(null);
            return;
          }
          setFile({ name: f.name, leads });
        } catch (_) {
          setErr("No he podido leer el archivo. \xBFEs un CSV?");
          setFile(null);
        }
      };
      reader.onerror = () => setErr("No he podido leer el archivo.");
      reader.readAsText(f);
    };
    const onDrop = (e) => {
      e.preventDefault();
      setDrag(false);
      const f = e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) loadFile(f);
    };
    const parsed = file ? file.leads : [];
    return /* @__PURE__ */ React.createElement("div", { className: "modal-overlay", onClick: onClose }, /* @__PURE__ */ React.createElement("div", { className: "modal", style: { maxWidth: 580 }, onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("div", { style: { padding: "22px 24px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { style: { fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 500 } }, "Importar leads"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "var(--text-muted)", marginTop: 4 } }, "Sube un ", /* @__PURE__ */ React.createElement("b", { style: { color: "var(--text)" } }, "CSV"), " o pega una lista.")), /* @__PURE__ */ React.createElement("button", { onClick: onClose, style: { background: "transparent", border: "none", cursor: "pointer", color: "var(--text-subtle)", padding: 4 } }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 18 }))), /* @__PURE__ */ React.createElement("div", { style: { padding: "18px 24px 4px" } }, /* @__PURE__ */ React.createElement(
      "input",
      {
        ref: inputRef,
        type: "file",
        accept: ".csv,text/csv,text/plain",
        style: { display: "none" },
        onChange: (e) => loadFile(e.target.files && e.target.files[0])
      }
    ), file ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 12, background: "var(--bg-elev-2)", border: "0.5px solid var(--border)" } }, /* @__PURE__ */ React.createElement(Icon, { name: "file-text", size: 18, style: { color: "var(--accent)" } }), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, file.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-muted)" } }, file.leads.length, " lead", file.leads.length > 1 ? "s" : "", " detectados")), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          setFile(null);
          if (inputRef.current) inputRef.current.value = "";
        },
        style: { background: "transparent", border: "none", cursor: "pointer", color: "var(--text-subtle)", padding: 4 },
        title: "Quitar archivo"
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 16 })
    )) : /* @__PURE__ */ React.createElement(
      "div",
      {
        onClick: () => inputRef.current && inputRef.current.click(),
        onDragOver: (e) => {
          e.preventDefault();
          setDrag(true);
        },
        onDragLeave: () => setDrag(false),
        onDrop,
        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "26px 16px",
          borderRadius: 12,
          cursor: "pointer",
          textAlign: "center",
          border: "1px dashed " + (drag ? "var(--accent)" : "var(--border-strong)"),
          background: drag ? "var(--accent-soft)" : "var(--bg-elev-2)",
          transition: "all .15s"
        }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "file-text", size: 22, style: { color: drag ? "var(--accent)" : "var(--text-muted)" } }),
      /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, fontWeight: 500 } }, "Arrastra un CSV aqu\xED o haz clic para elegirlo"),
      /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-subtle)" } }, "Columnas: Marca \xB7 Instagram \xB7 Web \xB7 Contacto \xB7 Correo \xB7 Notas \xB7 Estado")
    ), err && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: "var(--red)", marginTop: 10 } }, err)), /* @__PURE__ */ React.createElement("div", { style: { padding: "16px 24px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: parsed.length ? "var(--accent)" : "var(--text-subtle)", fontWeight: 500 } }, parsed.length ? `${parsed.length} lead${parsed.length > 1 ? "s" : ""} para importar` : "Nada que importar todav\xEDa"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10 } }, /* @__PURE__ */ React.createElement("button", { onClick: onClose, className: "btn ghost" }, "Cancelar"), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => onImport(parsed),
        disabled: !parsed.length,
        className: "btn primary",
        style: { opacity: parsed.length ? 1 : 0.5, pointerEvents: parsed.length ? "auto" : "none" }
      },
      "Importar ",
      parsed.length || ""
    )))));
  };
  window.AgencyOutreach = AgencyOutreach;
})();

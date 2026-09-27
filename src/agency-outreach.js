(() => {
  const { useState, useEffect } = React;
  const OUTREACH_STATUS = [
    { id: "guardado", label: "Por contactar", color: "#8b8b93" },
    { id: "contactado", label: "Contactado", color: "#60a5fa" },
    { id: "respondio", label: "Respondi\xF3", color: "#9e9ae5" },
    { id: "propuesta", label: "Loom enviado", color: "#d98cc0" },
    { id: "conversacion", label: "Reuni\xF3n / precio", color: "#e2b45c" },
    { id: "cerrado", label: "Cerrado", color: "#34d399" },
    { id: "descartado", label: "Descartado", color: "#dc5b5d" }
  ];
  const _stMeta = (id) => OUTREACH_STATUS.find((s) => s.id === id) || OUTREACH_STATUS[0];
  const _igUrl = (h) => {
    const u = (h || "").trim().replace(/^@/, "");
    return u ? "https://instagram.com/" + u : null;
  };
  const _igDmUrl = (h) => {
    const u = (h || "").trim().replace(/^@/, "");
    return u ? "https://ig.me/m/" + u : null;
  };
  const _webUrl = (w) => {
    const u = (w || "").trim();
    if (!u) return null;
    return /^https?:\/\//.test(u) ? u : "https://" + u;
  };
  const _OM = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const _fmtDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return isNaN(d) ? "" : `${d.getDate()} ${_OM[d.getMonth()]}`;
  };
  const _todayYmd = () => (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const _DONE_ST = ["cerrado", "descartado"];
  const _isDue = (o) => !!o.nextFollowup && o.nextFollowup <= _todayYmd() && !_DONE_ST.includes(o.status) && !o.convertedClientId;
  const _followMeta = (o) => {
    if (o.convertedClientId || _DONE_ST.includes(o.status) || !o.nextFollowup) return null;
    const t = _todayYmd();
    if (o.nextFollowup < t) return { color: "#dc5b5d", label: "Atrasado" };
    if (o.nextFollowup === t) return { color: "#e2b45c", label: "Hoy" };
    return { color: "var(--text-subtle)", label: _fmtDate(o.nextFollowup) };
  };
  const _looksUrl = (s) => /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/\S*)?$/i.test(s) && !s.startsWith("@");
  const parseImport = (text) => {
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
  const _norm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
  const _splitCsvLine = (line, delim) => {
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
  const parseCsv = (text) => {
    let t = (text || "").replace(/^﻿/, "");
    const lines = t.split(/\r?\n/).filter((l) => l.trim() !== "");
    if (!lines.length) return [];
    const first = lines[0];
    const cnt = (re) => (first.match(re) || []).length;
    const delim = cnt(/;/g) > cnt(/,/g) ? ";" : cnt(/\t/g) > cnt(/,/g) ? "	" : ",";
    const rows = lines.map((l) => _splitCsvLine(l, delim));
    const hdr = rows[0].map(_norm);
    const known = ["marca", "brand", "nombre", "empresa", "instagram", "ig", "usuario", "user", "usuario ig", "web", "url", "sitio", "website", "contacto", "contact", "persona", "correo", "email", "mail", "notas", "notes", "nota", "estado", "status", "nicho", "niche", "mensaje", "message", "n"];
    const hasHeader = hdr.some((h) => known.includes(h) || h.startsWith("mensaje") || h.startsWith("usuario"));
    const colFor = (names) => hdr.findIndex((h) => names.includes(h));
    const colStarts = (pre) => hdr.findIndex((h) => h.startsWith(pre));
    const map = hasHeader ? {
      brand: colFor(["marca", "brand", "nombre", "empresa"]),
      instagram: colFor(["instagram", "ig", "usuario", "user", "usuario ig"]) >= 0 ? colFor(["instagram", "ig", "usuario", "user", "usuario ig"]) : colStarts("usuario"),
      web: colFor(["web", "url", "sitio", "website"]),
      contact: colFor(["contacto", "contact", "persona"]),
      email: colFor(["correo", "email", "mail"]),
      notes: colFor(["notas", "notes", "nota"]),
      status: colFor(["estado", "status"]),
      niche: colFor(["nicho", "niche"]),
      message: colFor(["mensaje", "message"]) >= 0 ? colFor(["mensaje", "message"]) : colStarts("mensaje")
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
        const niche = g(map.niche), message = g(map.message);
        const sr = _norm(g(map.status));
        const status = STATUS_IDS.includes(sr) ? sr : STATUS_BY_LABEL[sr] || "guardado";
        if (!brand && instagram) brand = instagram.replace(/^@/, "");
        if (!brand) return;
        if (instagram && !instagram.startsWith("@")) instagram = "@" + instagram.replace(/^@/, "");
        out.push({ brand, instagram, web, contact, email, notes, status, niche, message });
      } else {
        const p = parseImport(cols.join(","));
        if (p.length) out.push(p[0]);
      }
    });
    return out;
  };
  const _ensureXLSX = () => new Promise((resolve, reject) => {
    if (window.XLSX) return resolve(window.XLSX);
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    s.onload = () => resolve(window.XLSX);
    s.onerror = () => reject(new Error("No se pudo cargar el lector de Excel."));
    document.head.appendChild(s);
  });
  const rowsToLeads = (aoa) => {
    let hi = (aoa || []).findIndex((r) => (r || []).map(_norm).some((c) => c === "marca" || c === "nicho" || c.startsWith("mensaje") || c.startsWith("usuario")));
    if (hi < 0) hi = 0;
    const hdr = (aoa[hi] || []).map(_norm);
    const idx = (names, pre) => {
      let i = hdr.findIndex((h) => names.includes(h));
      if (i < 0 && pre) i = hdr.findIndex((h) => h.startsWith(pre));
      return i;
    };
    const m = {
      brand: idx(["marca", "brand", "nombre", "empresa"]),
      instagram: idx(["instagram", "ig", "usuario", "user", "usuario ig"], "usuario"),
      web: idx(["web", "url", "sitio", "website"]),
      notes: idx(["notas", "notes", "nota"]),
      niche: idx(["nicho", "niche"]),
      message: idx(["mensaje", "message"], "mensaje"),
      contact: idx(["contacto", "contact", "persona"]),
      email: idx(["correo", "email", "mail"])
    };
    const out = [];
    for (let r = hi + 1; r < aoa.length; r++) {
      const row = aoa[r] || [];
      const g = (i) => {
        const v = i >= 0 && i < row.length ? row[i] : "";
        return v == null ? "" : String(v).trim();
      };
      let brand = g(m.brand), instagram = g(m.instagram);
      const web = g(m.web), notes = g(m.notes), niche = g(m.niche), message = g(m.message), contact = g(m.contact), email = g(m.email);
      if (!brand && instagram) brand = instagram.replace(/^@/, "");
      if (!brand && !instagram) continue;
      if (instagram && !instagram.startsWith("@")) instagram = "@" + instagram.replace(/^@/, "");
      out.push({ brand, instagram, web, notes, niche, message, contact, email, status: "guardado" });
    }
    return out;
  };
  const parseXlsx = async (arrayBuffer) => {
    const XLSX = await _ensureXLSX();
    const wb = XLSX.read(arrayBuffer, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false, defval: "" });
    return { leads: rowsToLeads(aoa), sheetName: wb.SheetNames[0] };
  };
  const _guessCampaign = (s) => {
    const t = (s || "").toString();
    const m = t.match(/tanda\s*\d+/i);
    if (m) return m[0].replace(/tanda/i, "Tanda").replace(/\s+/, " ");
    return "";
  };
  const Check = ({ on, onToggle, dim }) => /* @__PURE__ */ React.createElement(
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
  const InlineText = ({ value, onSave, placeholder, mono }) => {
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
  const StatusPill = ({ value, onChange }) => {
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
  const _cell = { padding: "0 14px", height: 48, verticalAlign: "middle", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
  const FollowupCell = ({ o, D }) => {
    const [editing, setEditing] = useState(false);
    const fm = _followMeta(o);
    if (o.convertedClientId) return /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "var(--text-subtle)" } }, "\u2014");
    if (editing) {
      return /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 }, onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "date",
          autoFocus: true,
          defaultValue: o.nextFollowup || "",
          onChange: (e) => {
            D.updateOutreach(o.id, { nextFollowup: e.target.value || null });
            setEditing(false);
          },
          onBlur: () => setEditing(false),
          style: {
            background: "var(--bg-elev-2)",
            border: "0.5px solid var(--accent)",
            borderRadius: 6,
            color: "var(--text)",
            fontSize: 12,
            fontFamily: "inherit",
            padding: "3px 6px",
            outline: "none",
            colorScheme: "dark"
          }
        }
      ), o.nextFollowup && /* @__PURE__ */ React.createElement(
        "button",
        {
          onMouseDown: (e) => {
            e.preventDefault();
            e.stopPropagation();
            D.updateOutreach(o.id, { nextFollowup: null });
            setEditing(false);
          },
          title: "Quitar seguimiento",
          style: { background: "transparent", border: "none", cursor: "pointer", color: "var(--text-subtle)", padding: 2, display: "inline-flex" }
        },
        /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 12 })
      ));
    }
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: (e) => {
          e.stopPropagation();
          setEditing(true);
        },
        title: "Programar / cambiar seguimiento",
        onMouseEnter: (e) => {
          if (!fm) e.currentTarget.style.color = "var(--text-muted)";
        },
        onMouseLeave: (e) => {
          if (!fm) e.currentTarget.style.color = "var(--text-subtle)";
        },
        style: {
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 0,
          fontFamily: "inherit",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          transition: "color .12s",
          fontSize: 12,
          fontWeight: fm ? 500 : 400,
          color: fm ? fm.color : "var(--text-subtle)"
        }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: fm ? "bell" : "calendar", size: 11 }),
      fm ? fm.label : "Programar"
    );
  };
  const OutreachRow = ({ o, D, sel, onSel, first }) => {
    const ig = _igUrl(o.instagram), web = _webUrl(o.web);
    const [open, setOpen] = useState(false);
    const toast = useToast();
    const cell = { ..._cell, borderTop: first ? "none" : "0.5px solid var(--border)" };
    const iconBtn = { background: "transparent", border: "none", cursor: "pointer", color: "var(--text-subtle)", padding: 4, borderRadius: 6, display: "inline-flex" };
    const hasMsg = !!(o.message || "").trim();
    const copyMsg = () => {
      const m = (o.message || "").trim();
      if (!m) return;
      try {
        navigator.clipboard.writeText(m).then(() => toast("Mensaje copiado", "success")).catch(() => {
        });
      } catch (_) {
      }
    };
    const sendDM = () => {
      const m = (o.message || "").trim();
      if (m) {
        try {
          navigator.clipboard.writeText(m).then(() => toast("Mensaje copiado \u2014 p\xE9galo en el DM (\u2318V)", "success")).catch(() => {
          });
        } catch (_) {
        }
      }
      const dm = _igDmUrl(o.instagram) || web;
      if (dm) window.open(dm, "_blank", "noopener");
      if (!_DONE_ST.includes(o.status) && !o.convertedClientId) D.outreachMarkContacted(o.id);
    };
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
      "tr",
      {
        onMouseEnter: (e) => e.currentTarget.style.background = sel ? "var(--accent-soft)" : "rgba(255,255,255,0.02)",
        onMouseLeave: (e) => e.currentTarget.style.background = sel ? "var(--accent-active)" : "transparent",
        style: { transition: "background .1s", background: sel ? "var(--accent-active)" : "transparent" }
      },
      /* @__PURE__ */ React.createElement("td", { style: { ...cell, paddingLeft: 16, paddingRight: 4 } }, /* @__PURE__ */ React.createElement(Check, { on: sel, onToggle: onSel, dim: true })),
      /* @__PURE__ */ React.createElement("td", { style: cell }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 500, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis" } }, o.brand), (o.niche || o.campaign) && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, marginTop: 2, alignItems: "center", overflow: "hidden" } }, o.campaign && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, fontWeight: 600, color: "var(--accent)", background: "var(--accent-soft)", borderRadius: 5, padding: "1px 6px", whiteSpace: "nowrap" } }, o.campaign), o.niche && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: "var(--text-subtle)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, o.niche))),
      /* @__PURE__ */ React.createElement("td", { style: cell }, /* @__PURE__ */ React.createElement(StatusPill, { value: o.status, onChange: (s) => D.updateOutreach(o.id, { status: s }) })),
      /* @__PURE__ */ React.createElement("td", { style: { ...cell, overflow: "visible" } }, /* @__PURE__ */ React.createElement(FollowupCell, { o, D })),
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
      /* @__PURE__ */ React.createElement("td", { style: { ...cell, whiteSpace: "normal", minWidth: 140 } }, /* @__PURE__ */ React.createElement(InlineText, { value: o.notes, placeholder: "A\xF1adir nota\u2026", onSave: (v) => D.updateOutreach(o.id, { notes: v }) })),
      /* @__PURE__ */ React.createElement(
        "td",
        {
          style: { ...cell, fontSize: 12, color: "var(--text-subtle)" },
          title: o.createdAt ? "A\xF1adido el " + new Date(o.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) : ""
        },
        _fmtDate(o.createdAt)
      ),
      /* @__PURE__ */ React.createElement("td", { style: { ...cell, textAlign: "right", paddingRight: 12 } }, /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, justifyContent: "flex-end" } }, hasMsg && /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => setOpen(true),
          title: "Ver mensaje / copiar",
          style: { ...iconBtn, color: "var(--text-subtle)" },
          onMouseEnter: (e) => e.currentTarget.style.color = "var(--accent)",
          onMouseLeave: (e) => e.currentTarget.style.color = "var(--text-subtle)"
        },
        /* @__PURE__ */ React.createElement(Icon, { name: "file-text", size: 14 })
      ), !_DONE_ST.includes(o.status) && !o.convertedClientId && /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: sendDM,
          title: hasMsg ? "Copia el mensaje y abre el DM de Instagram, y marca contactado" : "Abre el DM de Instagram y marca contactado",
          style: {
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "4px 10px",
            borderRadius: 8,
            cursor: "pointer",
            background: "var(--accent-soft)",
            color: "var(--accent)",
            border: "1px solid rgba(158,154,229,0.35)",
            fontFamily: "inherit",
            fontSize: 12,
            fontWeight: 600,
            whiteSpace: "nowrap"
          },
          onMouseEnter: (e) => e.currentTarget.style.background = "rgba(158,154,229,0.28)",
          onMouseLeave: (e) => e.currentTarget.style.background = "var(--accent-soft)"
        },
        /* @__PURE__ */ React.createElement(Icon, { name: "send", size: 12 }),
        " Enviar"
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
            background: "var(--bg-elev-2)",
            color: "var(--text-muted)",
            border: "0.5px solid var(--border)",
            fontFamily: "inherit",
            fontSize: 11.5,
            fontWeight: 500,
            whiteSpace: "nowrap"
          }
        },
        /* @__PURE__ */ React.createElement(Icon, { name: "arrow-up-right", size: 12 }),
        " Cliente"
      ) : null))
    ), open && hasMsg && /* @__PURE__ */ React.createElement(MessageModal, { o, onClose: () => setOpen(false), onCopy: copyMsg, onSend: () => {
      sendDM();
      setOpen(false);
    } }));
  };
  const MessageModal = ({ o, onClose, onCopy, onSend }) => {
    useEffect(() => {
      const onKey = (e) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, []);
    const dm = _igDmUrl(o.instagram);
    const handle = o.instagram ? o.instagram.startsWith("@") ? o.instagram : "@" + o.instagram : "";
    return ReactDOM.createPortal(
      /* @__PURE__ */ React.createElement("div", { className: "modal-overlay", onClick: onClose }, /* @__PURE__ */ React.createElement("div", { className: "modal", style: { maxWidth: 560 }, onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("div", { className: "modal-head" }, /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { className: "modal-title", style: { fontSize: 21 } }, o.brand), /* @__PURE__ */ React.createElement("div", { className: "modal-sub", style: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 6 } }, handle && /* @__PURE__ */ React.createElement("span", null, handle), o.niche && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-subtle)" } }, "\xB7"), /* @__PURE__ */ React.createElement("span", null, o.niche)), o.campaign && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 600, color: "var(--accent)", background: "var(--accent-soft)", borderRadius: 5, padding: "1px 7px" } }, o.campaign))), /* @__PURE__ */ React.createElement("button", { onClick: onClose, className: "btn ghost icon-only sm" }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 16 }))), /* @__PURE__ */ React.createElement("div", { className: "modal-body" }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-subtle)", marginBottom: 8 } }, "Mensaje listo para enviar"), /* @__PURE__ */ React.createElement("div", { style: {
        background: "var(--bg-elev-2)",
        border: "0.5px solid var(--border)",
        borderRadius: 14,
        padding: "14px 16px",
        maxHeight: "42vh",
        overflowY: "auto",
        fontSize: 14,
        lineHeight: 1.6,
        color: "var(--text)",
        whiteSpace: "pre-wrap"
      } }, o.message || /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-subtle)" } }, "Esta cuenta no tiene mensaje guardado.")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-subtle)", marginTop: 10, lineHeight: 1.5 } }, "Instagram no deja rellenar el texto: al abrir el DM, pega con ", /* @__PURE__ */ React.createElement("b", { style: { color: "var(--text-muted)" } }, "\u2318V"), " y env\xEDa.")), /* @__PURE__ */ React.createElement("div", { className: "modal-foot" }, /* @__PURE__ */ React.createElement("button", { onClick: onCopy, className: "btn" }, /* @__PURE__ */ React.createElement(Icon, { name: "copy", size: 13 }), " Copiar mensaje"), dm && /* @__PURE__ */ React.createElement("button", { onClick: onSend, className: "btn primary" }, /* @__PURE__ */ React.createElement(Icon, { name: "send", size: 13 }), " Copiar y abrir DM")))),
      document.body
    );
  };
  const _OcRow = ({ label, children }) => /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, minWidth: 0 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "var(--text-subtle)", flexShrink: 0 } }, label), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: "var(--text)", minWidth: 0, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, children));
  const OutreachCard = ({ o, D, sel, onSel }) => {
    const ig = _igUrl(o.instagram), web = _webUrl(o.web);
    const iconBtn = { background: "transparent", border: "none", cursor: "pointer", color: "var(--text-subtle)", padding: 6, borderRadius: 8, display: "inline-flex" };
    return /* @__PURE__ */ React.createElement("div", { style: { background: sel ? "var(--accent-active)" : "var(--bg-elev)", border: "0.5px solid " + (sel ? "rgba(158,154,229,0.4)" : "var(--border)"), borderRadius: 14, padding: "13px 14px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 11, marginBottom: 12 } }, /* @__PURE__ */ React.createElement(Check, { on: sel, onToggle: onSel, dim: true }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15.5, fontWeight: 600, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, o.brand), /* @__PURE__ */ React.createElement(StatusPill, { value: o.status, onChange: (s) => D.updateOutreach(o.id, { status: s }) })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 9 } }, /* @__PURE__ */ React.createElement(_OcRow, { label: "Seguimiento" }, /* @__PURE__ */ React.createElement(FollowupCell, { o, D })), /* @__PURE__ */ React.createElement(_OcRow, { label: "Instagram" }, ig ? /* @__PURE__ */ React.createElement("a", { href: ig, target: "_blank", rel: "noreferrer", style: { color: "var(--text)", textDecoration: "none" } }, o.instagram.startsWith("@") ? o.instagram : "@" + o.instagram) : /* @__PURE__ */ React.createElement(InlineText, { value: "", placeholder: "@instagram", onSave: (v) => D.updateOutreach(o.id, { instagram: v }) })), /* @__PURE__ */ React.createElement(_OcRow, { label: "Web" }, web ? /* @__PURE__ */ React.createElement("a", { href: web, target: "_blank", rel: "noreferrer", style: { color: "var(--text)", textDecoration: "none" } }, o.web.replace(/^https?:\/\//, "")) : /* @__PURE__ */ React.createElement(InlineText, { value: "", placeholder: "URL", onSave: (v) => D.updateOutreach(o.id, { web: v }) })), /* @__PURE__ */ React.createElement(_OcRow, { label: "Contacto" }, /* @__PURE__ */ React.createElement(InlineText, { value: o.contact, placeholder: "\u2014", onSave: (v) => D.updateOutreach(o.id, { contact: v }) })), /* @__PURE__ */ React.createElement(_OcRow, { label: "Notas" }, /* @__PURE__ */ React.createElement(InlineText, { value: o.notes, placeholder: "A\xF1adir nota\u2026", onSave: (v) => D.updateOutreach(o.id, { notes: v }) }))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginTop: 12, paddingTop: 11, borderTop: "0.5px solid var(--border)" } }, !_DONE_ST.includes(o.status) && !o.convertedClientId && /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => D.outreachMarkContacted(o.id),
        style: { ...iconBtn, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--text-muted)", fontFamily: "inherit" }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "send", size: 14 }),
      " Contactado hoy"
    ), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }), o.convertedClientId ? /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 500, color: "var(--green)" } }, /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 13 }), " Cliente") : o.status === "cerrado" ? /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => D.convertOutreachToClient(o.id),
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          padding: "6px 12px",
          borderRadius: 8,
          cursor: "pointer",
          background: "var(--accent-soft)",
          color: "var(--accent)",
          border: "1px solid rgba(158,154,229,0.3)",
          fontFamily: "inherit",
          fontSize: 12.5,
          fontWeight: 500
        }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "arrow-up-right", size: 13 }),
      " Hacer cliente"
    ) : null));
  };
  const OutreachFilterHead = ({ filter, setFilter, counts, dueCount, clientCount, total }) => {
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState(null);
    const ref = React.useRef(null);
    const openMenu = () => {
      const r = ref.current.getBoundingClientRect();
      setPos({ left: r.left, top: r.bottom + 6 });
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
    const active = filter !== "all";
    const curLabel = filter === "all" ? "Estado" : filter === "due" ? "Seguimiento" : filter === "clients" ? "Clientes" : _stMeta(filter).label;
    const items = [
      { id: "all", label: "Todas", n: total },
      ...dueCount ? [{ id: "due", label: "Seguimiento", n: dueCount, color: "#e2b45c" }] : [],
      ...clientCount ? [{ id: "clients", label: "Clientes", n: clientCount, color: "#34d399" }] : [],
      ...OUTREACH_STATUS.map((s) => ({ id: s.id, label: s.label, n: counts[s.id] || 0, color: s.color }))
    ];
    return /* @__PURE__ */ React.createElement("span", { ref, style: { position: "relative", display: "inline-block" } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: (e) => {
          e.stopPropagation();
          open ? setOpen(false) : openMenu();
        },
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: 10.5,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: active ? "var(--accent)" : "var(--text-subtle)",
          padding: 0
        }
      },
      curLabel,
      /* @__PURE__ */ React.createElement(Icon, { name: active ? "filter" : "chevron", size: active ? 11 : 12, style: { opacity: 0.8 } })
    ), open && pos && ReactDOM.createPortal(
      /* @__PURE__ */ React.createElement("div", { onClick: (e) => e.stopPropagation(), style: {
        position: "fixed",
        left: pos.left,
        top: pos.top,
        zIndex: 400,
        minWidth: 200,
        background: "var(--bg-elev)",
        border: "0.5px solid var(--border-strong)",
        borderRadius: 12,
        padding: 5,
        boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
        maxHeight: 360,
        overflowY: "auto"
      } }, items.map((it) => {
        const on = filter === it.id;
        return /* @__PURE__ */ React.createElement(
          "button",
          {
            key: it.id,
            onClick: () => {
              setFilter(it.id);
              setOpen(false);
            },
            onMouseEnter: (e) => e.currentTarget.style.background = "var(--bg-hover)",
            onMouseLeave: (e) => e.currentTarget.style.background = on ? "var(--bg-elev-2)" : "transparent",
            style: {
              display: "flex",
              alignItems: "center",
              gap: 9,
              width: "100%",
              padding: "8px 10px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 13,
              textAlign: "left",
              border: "none",
              background: on ? "var(--bg-elev-2)" : "transparent",
              color: "var(--text)",
              fontFamily: "inherit"
            }
          },
          it.color ? /* @__PURE__ */ React.createElement("span", { style: { width: 8, height: 8, borderRadius: "50%", background: it.color, flexShrink: 0 } }) : /* @__PURE__ */ React.createElement("span", { style: { width: 8, flexShrink: 0 } }),
          /* @__PURE__ */ React.createElement("span", { style: { flex: 1 } }, it.label),
          /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11.5, color: "var(--text-subtle)" } }, it.n),
          on && /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 13, style: { color: "var(--accent)" } })
        );
      })),
      document.body
    ));
  };
  const AgencyOutreach = ({ navigate }) => {
    const D = window.Data;
    D.useStore();
    const all = D.OUTREACH || [];
    const [q, setQ] = useState("");
    const [sel, setSel] = useState(() => /* @__PURE__ */ new Set());
    const [showAdd, setShowAdd] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const today = _todayYmd();
    const doImport = (leads, campaign) => {
      D.addOutreachBulk(leads.map((l) => ({
        brand: l.brand,
        instagram: l.instagram || "",
        web: l.web || "",
        contact: l.contact || "",
        email: l.email || "",
        notes: l.notes || "",
        status: l.status || "guardado",
        message: l.message || "",
        niche: l.niche || "",
        campaign: (l.campaign || campaign || "").trim()
      })), (campaign || "").trim());
      setShowImport(false);
    };
    const _emptyF = { brand: "", instagram: "", contact: "", email: "", web: "", status: "guardado", notes: "", niche: "", campaign: "", message: "" };
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
        notes: f.notes.trim(),
        niche: (f.niche || "").trim(),
        campaign: (f.campaign || "").trim(),
        message: (f.message || "").trim()
      });
      setF(_emptyF);
      setShowAdd(false);
    };
    const [campFilter, setCampFilter] = useState("all");
    const campaigns = [...new Set(all.map((o) => (o.campaign || "").trim()).filter(Boolean))];
    const matchCamp = (o) => campFilter === "all" ? true : (o.campaign || "").trim() === campFilter;
    const scope = all.filter(matchCamp);
    const counts = {};
    OUTREACH_STATUS.forEach((s) => counts[s.id] = 0);
    scope.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    const dueCount = scope.filter(_isDue).length;
    const clientCount = scope.filter((o) => o.convertedClientId).length;
    const [filter, setFilter] = useState("all");
    const matchFilter = (o) => filter === "all" ? true : filter === "due" ? _isDue(o) : filter === "clients" ? !!o.convertedClientId : o.status === filter;
    const ql = q.trim().toLowerCase();
    let rows = all.filter((o) => matchFilter(o) && matchCamp(o) && (!ql || (o.brand || "").toLowerCase().includes(ql) || (o.instagram || "").toLowerCase().includes(ql) || (o.contact || "").toLowerCase().includes(ql) || (o.web || "").toLowerCase().includes(ql) || (o.notes || "").toLowerCase().includes(ql) || (o.niche || "").toLowerCase().includes(ql)));
    const _dueRank = (o) => _isDue(o) ? o.nextFollowup < today ? 0 : 1 : 2;
    rows = rows.slice().sort((a, b) => _dueRank(a) - _dueRank(b));
    const tabItems = [
      { id: "all", label: "Todas", count: scope.length },
      ...dueCount > 0 ? [{ id: "due", label: "Toca hoy", count: dueCount }] : [],
      ...OUTREACH_STATUS.map((s) => ({ id: s.id, label: s.label, count: counts[s.id] || 0 }))
    ];
    const tabsRef = React.useRef(null);
    const [indic, setIndic] = useState({ left: 0, width: 0 });
    const [, startTransition] = React.useTransition();
    const pickTab = (id, el) => {
      if (el) setIndic({ left: el.offsetLeft, width: el.offsetWidth });
      startTransition(() => setFilter(id));
    };
    React.useLayoutEffect(() => {
      const cont = tabsRef.current;
      if (!cont) return;
      const el = cont.querySelector(".tab.active");
      if (el) setIndic({ left: el.offsetLeft, width: el.offsetWidth });
    }, [filter, campFilter, dueCount, scope.length, JSON.stringify(counts)]);
    useEffect(() => {
      const onResize = () => {
        const cont = tabsRef.current;
        if (!cont) return;
        const el = cont.querySelector(".tab.active");
        if (el) setIndic({ left: el.offsetLeft, width: el.offsetWidth });
      };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }, []);
    const exportSel = () => {
      const chosen = sel.size ? all.filter((o) => sel.has(o.id)) : rows;
      if (!chosen.length) return;
      const esc = (v) => {
        const s = v == null ? "" : String(v);
        return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
      };
      const head = ["Marca", "Estado", "Seguimiento", "Contacto", "Instagram", "Web", "Notas", "Fecha"];
      const lines = [head.join(",")];
      chosen.forEach((o) => lines.push([
        o.brand,
        _stMeta(o.status).label,
        o.nextFollowup || "",
        o.contact || "",
        o.instagram || "",
        o.web || "",
        o.notes || "",
        _fmtDate(o.createdAt)
      ].map(esc).join(",")));
      const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `outreach-${_todayYmd()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1e3);
    };
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
    return /* @__PURE__ */ React.createElement("div", { className: "page" }, /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("div", { className: "hide-mobile" }, /* @__PURE__ */ React.createElement("h1", null, "Propuestas Outreach"), /* @__PURE__ */ React.createElement("div", { className: "sub" }, "Captaci\xF3n por Instagram \xB7 gestiona el embudo por estados")), /* @__PURE__ */ React.createElement("div", { className: "outreach-actions", style: { display: "flex", alignItems: "center", gap: 8 } }, campaigns.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { position: "relative", display: "inline-flex", alignItems: "center" } }, /* @__PURE__ */ React.createElement(
      "select",
      {
        value: campFilter,
        onChange: (e) => setCampFilter(e.target.value),
        title: "Filtrar por campa\xF1a / tanda",
        style: {
          height: 34,
          padding: "0 30px 0 12px",
          borderRadius: 9,
          background: campFilter === "all" ? "var(--bg-elev-2)" : "var(--accent-soft)",
          color: campFilter === "all" ? "var(--text-muted)" : "var(--accent)",
          border: "0.5px solid " + (campFilter === "all" ? "var(--border)" : "rgba(158,154,229,0.35)"),
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: 13,
          fontWeight: 500,
          appearance: "none",
          WebkitAppearance: "none",
          outline: "none"
        }
      },
      /* @__PURE__ */ React.createElement("option", { value: "all" }, "Todas las campa\xF1as"),
      campaigns.map((c) => /* @__PURE__ */ React.createElement("option", { key: c, value: c }, c))
    ), /* @__PURE__ */ React.createElement(Icon, { name: "chevron", size: 12, style: { position: "absolute", right: 10, pointerEvents: "none", color: "var(--text-subtle)" } })), /* @__PURE__ */ React.createElement("div", { className: "outreach-search", style: { display: "flex", alignItems: "center", gap: 8, height: 34, padding: "0 12px", borderRadius: 9, background: "var(--bg-elev-2)", border: "0.5px solid var(--border)" } }, /* @__PURE__ */ React.createElement(Icon, { name: "search", size: 14, style: { color: "var(--text-subtle)" } }), /* @__PURE__ */ React.createElement(
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
    ))), /* @__PURE__ */ React.createElement("div", { className: "tabs tabs-slide", ref: tabsRef }, tabItems.map((t) => /* @__PURE__ */ React.createElement("div", { key: t.id, className: "tab" + (filter === t.id ? " active" : ""), onClick: (e) => pickTab(t.id, e.currentTarget) }, t.label, t.count != null ? /* @__PURE__ */ React.createElement("span", { className: "count" }, t.count) : null)), /* @__PURE__ */ React.createElement("span", { className: "tab-underline", style: { width: indic.width, transform: `translateX(${indic.left}px)` } })), /* @__PURE__ */ React.createElement("div", { className: "outreach-table", style: { overflowX: "auto", marginTop: 4 } }, /* @__PURE__ */ React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", minWidth: 1160, tableLayout: "fixed" } }, /* @__PURE__ */ React.createElement("colgroup", null, /* @__PURE__ */ React.createElement("col", { style: { width: 40 } }), /* @__PURE__ */ React.createElement("col", { style: { width: 158 } }), /* @__PURE__ */ React.createElement("col", { style: { width: 150 } }), /* @__PURE__ */ React.createElement("col", { style: { width: 132 } }), /* @__PURE__ */ React.createElement("col", { style: { width: 118 } }), /* @__PURE__ */ React.createElement("col", { style: { width: 148 } }), /* @__PURE__ */ React.createElement("col", { style: { width: 132 } }), /* @__PURE__ */ React.createElement("col", { style: { width: 130 } }), /* @__PURE__ */ React.createElement("col", { style: { width: 70 } }), /* @__PURE__ */ React.createElement("col", { style: { width: 160 } })), /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { style: { borderBottom: "0.5px solid var(--border)" } }, /* @__PURE__ */ React.createElement("th", { style: { ...th, paddingLeft: 16, paddingRight: 4, width: 34 } }, /* @__PURE__ */ React.createElement(Check, { on: allSel, onToggle: toggleAll })), /* @__PURE__ */ React.createElement("th", { style: th }, "Marca"), /* @__PURE__ */ React.createElement("th", { style: th }, /* @__PURE__ */ React.createElement(OutreachFilterHead, { filter, setFilter, counts, dueCount, clientCount, total: all.length })), /* @__PURE__ */ React.createElement("th", { style: th }, "Seguimiento"), /* @__PURE__ */ React.createElement("th", { style: th }, "Contacto"), /* @__PURE__ */ React.createElement("th", { style: th }, "Instagram"), /* @__PURE__ */ React.createElement("th", { style: th }, "Web"), /* @__PURE__ */ React.createElement("th", { style: th }, "Notas"), /* @__PURE__ */ React.createElement("th", { style: th }, "A\xF1adido"), /* @__PURE__ */ React.createElement("th", { style: { ...th, textAlign: "right" } }))), /* @__PURE__ */ React.createElement("tbody", null, rows.map((o, i) => /* @__PURE__ */ React.createElement(OutreachRow, { key: o.id, o, D, sel: sel.has(o.id), onSel: () => toggle(o.id), first: i === 0 }))))), /* @__PURE__ */ React.createElement("div", { className: "outreach-cards" }, rows.map((o) => /* @__PURE__ */ React.createElement(OutreachCard, { key: o.id, o, D, sel: sel.has(o.id), onSel: () => toggle(o.id) }))), rows.length === 0 && /* @__PURE__ */ React.createElement("div", { style: { padding: "44px 0" } }, /* @__PURE__ */ React.createElement(
      Empty,
      {
        icon: "send",
        title: all.length === 0 ? "A\xFAn no tienes leads" : "Sin resultados",
        sub: all.length === 0 ? "A\xF1ade la primera cuenta con \xABNuevo lead\xBB." : "Prueba con otra b\xFAsqueda."
      }
    )), sel.size > 0 && /* @__PURE__ */ React.createElement("div", { style: {
      position: "fixed",
      left: 0,
      right: 0,
      bottom: 24,
      zIndex: 120,
      display: "flex",
      justifyContent: "center",
      pointerEvents: "none"
    } }, /* @__PURE__ */ React.createElement("div", { style: {
      pointerEvents: "auto",
      display: "flex",
      alignItems: "center",
      gap: 4,
      padding: "7px 7px 7px 16px",
      borderRadius: 99,
      background: "var(--bg-elev)",
      border: "0.5px solid var(--border-strong)",
      boxShadow: "0 14px 44px rgba(0,0,0,0.5)",
      animation: "pop .18s cubic-bezier(.2,.8,.2,1)"
    } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: "var(--text)", fontWeight: 500, whiteSpace: "nowrap" } }, sel.size, " seleccionada", sel.size === 1 ? "" : "s"), /* @__PURE__ */ React.createElement("span", { style: { width: 1, height: 20, background: "var(--border)", margin: "0 6px" } }), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: exportSel,
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          height: 32,
          padding: "0 13px",
          borderRadius: 99,
          cursor: "pointer",
          background: "var(--bg-elev-2)",
          color: "var(--text)",
          border: "0.5px solid var(--border)",
          fontFamily: "inherit",
          fontSize: 13,
          fontWeight: 500
        }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "download", size: 13 }),
      " Exportar"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          bulkDelete();
        },
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          height: 32,
          padding: "0 13px",
          borderRadius: 99,
          cursor: "pointer",
          background: "var(--red-soft)",
          color: "var(--red)",
          border: "0.5px solid rgba(220,91,93,0.35)",
          fontFamily: "inherit",
          fontSize: 13,
          fontWeight: 500
        }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "trash", size: 13 }),
      " Eliminar"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setSel(/* @__PURE__ */ new Set()),
        title: "Deseleccionar",
        style: {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          height: 32,
          borderRadius: 99,
          cursor: "pointer",
          background: "transparent",
          color: "var(--text-subtle)",
          border: "none"
        }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 15 })
    ))), showAdd && /* @__PURE__ */ React.createElement(NewLeadModal, { f, upd, setF, onClose: () => setShowAdd(false), onSave: saveNew }), showImport && /* @__PURE__ */ React.createElement(ImportLeadsModal, { onClose: () => setShowImport(false), onImport: doImport }));
  };
  const _fst = {
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
  const _lst = { fontSize: 12, color: "var(--text-muted)", marginBottom: 6, display: "block" };
  const Fld = ({ label, children }) => /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("label", { style: _lst }, label), children);
  const NewLeadModal = ({ f, upd, setF, onClose, onSave }) => {
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
    )), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, /* @__PURE__ */ React.createElement(Fld, { label: "Instagram" }, /* @__PURE__ */ React.createElement("input", { value: f.instagram, onChange: upd("instagram"), placeholder: "@usuario", style: _fst })), /* @__PURE__ */ React.createElement(Fld, { label: "Persona de contacto" }, /* @__PURE__ */ React.createElement("input", { value: f.contact, onChange: upd("contact"), placeholder: "Nombre", style: _fst }))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, /* @__PURE__ */ React.createElement(Fld, { label: "Correo" }, /* @__PURE__ */ React.createElement("input", { value: f.email, onChange: upd("email"), placeholder: "correo@marca.com", style: _fst })), /* @__PURE__ */ React.createElement(Fld, { label: "Web" }, /* @__PURE__ */ React.createElement("input", { value: f.web, onChange: upd("web"), placeholder: "marca.com", style: _fst }))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, /* @__PURE__ */ React.createElement(Fld, { label: "Estado" }, /* @__PURE__ */ React.createElement("select", { value: f.status, onChange: upd("status"), style: { ..._fst, cursor: "pointer" } }, OUTREACH_STATUS.map((s) => /* @__PURE__ */ React.createElement("option", { key: s.id, value: s.id }, s.label)))), /* @__PURE__ */ React.createElement(Fld, { label: "Nicho" }, /* @__PURE__ */ React.createElement("input", { value: f.niche, onChange: upd("niche"), placeholder: "Ej. Hogar / muebles", style: _fst }))), /* @__PURE__ */ React.createElement(Fld, { label: "Campa\xF1a / Tanda" }, /* @__PURE__ */ React.createElement("input", { value: f.campaign, onChange: upd("campaign"), placeholder: "Ej. Tanda 9", style: _fst })), /* @__PURE__ */ React.createElement(Fld, { label: "Mensaje (listo para copiar y enviar por DM)" }, /* @__PURE__ */ React.createElement(
      "textarea",
      {
        value: f.message,
        onChange: upd("message"),
        placeholder: "Escribe aqu\xED el mensaje que enviar\xE1s por Instagram\u2026",
        rows: 4,
        style: { ..._fst, height: "auto", padding: "10px 12px", resize: "vertical", lineHeight: 1.5 }
      }
    )), /* @__PURE__ */ React.createElement(Fld, { label: "Notas" }, /* @__PURE__ */ React.createElement(
      "textarea",
      {
        value: f.notes,
        onChange: upd("notes"),
        placeholder: "Contexto, por qu\xE9 encaja, siguiente paso\u2026",
        rows: 2,
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
  const ImportLeadsModal = ({ onClose, onImport }) => {
    const [file, setFile] = useState(null);
    const [drag, setDrag] = useState(false);
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);
    const [campaign, setCampaign] = useState("");
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
      setLoading(true);
      const isXlsx = /\.(xlsx|xls)$/i.test(f.name || "");
      const reader = new FileReader();
      reader.onerror = () => {
        setErr("No he podido leer el archivo.");
        setLoading(false);
      };
      if (isXlsx) {
        reader.onload = async () => {
          try {
            const { leads, sheetName } = await parseXlsx(reader.result);
            if (!leads.length) {
              setErr("No he encontrado filas v\xE1lidas en el Excel.");
              setFile(null);
              setLoading(false);
              return;
            }
            setFile({ name: f.name, leads });
            setCampaign((c) => c || _guessCampaign(sheetName) || _guessCampaign(f.name));
            setLoading(false);
          } catch (e) {
            setErr(e.message || "No he podido leer el Excel.");
            setFile(null);
            setLoading(false);
          }
        };
        reader.readAsArrayBuffer(f);
      } else {
        reader.onload = () => {
          try {
            const leads = parseCsv(String(reader.result || ""));
            if (!leads.length) {
              setErr("No he encontrado ninguna fila v\xE1lida en el archivo.");
              setFile(null);
              setLoading(false);
              return;
            }
            setFile({ name: f.name, leads });
            setCampaign((c) => c || _guessCampaign(f.name));
            setLoading(false);
          } catch (_) {
            setErr("No he podido leer el archivo. \xBFEs un CSV o Excel?");
            setFile(null);
            setLoading(false);
          }
        };
        reader.readAsText(f);
      }
    };
    const onDrop = (e) => {
      e.preventDefault();
      setDrag(false);
      const f = e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) loadFile(f);
    };
    const parsed = file ? file.leads : [];
    const withMsg = parsed.filter((l) => (l.message || "").trim()).length;
    return /* @__PURE__ */ React.createElement("div", { className: "modal-overlay", onClick: onClose }, /* @__PURE__ */ React.createElement("div", { className: "modal", style: { maxWidth: 580 }, onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("div", { style: { padding: "22px 24px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { style: { fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 500 } }, "Importar tanda de captaci\xF3n"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "var(--text-muted)", marginTop: 4 } }, "Sube tu ", /* @__PURE__ */ React.createElement("b", { style: { color: "var(--text)" } }, "Excel (.xlsx)"), " o un CSV. Se guardan tambi\xE9n el mensaje y el nicho.")), /* @__PURE__ */ React.createElement("button", { onClick: onClose, style: { background: "transparent", border: "none", cursor: "pointer", color: "var(--text-subtle)", padding: 4 } }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 18 }))), /* @__PURE__ */ React.createElement("div", { style: { padding: "18px 24px 4px" } }, /* @__PURE__ */ React.createElement(
      "input",
      {
        ref: inputRef,
        type: "file",
        accept: ".xlsx,.xls,.csv,text/csv,text/plain,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        style: { display: "none" },
        onChange: (e) => loadFile(e.target.files && e.target.files[0])
      }
    ), file ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 12, background: "var(--bg-elev-2)", border: "0.5px solid var(--border)" } }, /* @__PURE__ */ React.createElement(Icon, { name: "file-text", size: 18, style: { color: "var(--accent)" } }), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, file.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-muted)" } }, file.leads.length, " cuenta", file.leads.length > 1 ? "s" : "", withMsg ? ` \xB7 ${withMsg} con mensaje` : "")), /* @__PURE__ */ React.createElement(
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
    )), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 12 } }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 12, color: "var(--text-muted)", marginBottom: 6, display: "block" } }, "Campa\xF1a / Tanda ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-subtle)" } }, "(agrupa estas cuentas)")), /* @__PURE__ */ React.createElement(
      "input",
      {
        value: campaign,
        onChange: (e) => setCampaign(e.target.value),
        placeholder: "Ej. Tanda 9",
        style: { width: "100%", height: 40, background: "var(--bg-elev-2)", border: "0.5px solid var(--border)", borderRadius: 10, padding: "0 12px", color: "var(--text)", fontSize: 14, fontFamily: "inherit", outline: "none" }
      }
    ))) : /* @__PURE__ */ React.createElement(
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
      /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, fontWeight: 500 } }, loading ? "Leyendo el archivo\u2026" : "Arrastra tu Excel (.xlsx) o CSV, o haz clic"),
      /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-subtle)" } }, "Detecta: Marca \xB7 Usuario IG \xB7 Nicho \xB7 Web \xB7 Notas \xB7 Mensaje")
    ), err && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: "var(--red)", marginTop: 10 } }, err)), /* @__PURE__ */ React.createElement("div", { style: { padding: "16px 24px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: parsed.length ? "var(--accent)" : "var(--text-subtle)", fontWeight: 500 } }, parsed.length ? `${parsed.length} cuenta${parsed.length > 1 ? "s" : ""} para importar` : "Nada que importar todav\xEDa"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10 } }, /* @__PURE__ */ React.createElement("button", { onClick: onClose, className: "btn ghost" }, "Cancelar"), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => onImport(parsed, campaign),
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

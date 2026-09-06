// Propuestas Outreach — captación de leads por Instagram (tabla base de datos)
const { useState, useEffect } = React;

const OUTREACH_STATUS = [
  { id: "guardado",     label: "Guardado",         color: "#8b8b93" },
  { id: "contactado",   label: "Contactado",       color: "#60a5fa" },
  { id: "respondio",    label: "Respondió",        color: "#9e9ae5" },
  { id: "conversacion", label: "En conversación",  color: "#e2b45c" },
  { id: "propuesta",    label: "Propuesta enviada",color: "#d98cc0" },
  { id: "cerrado",      label: "Cerrado",          color: "#34d399" },
  { id: "descartado",   label: "Descartado",       color: "#dc5b5d" },
];
const _stMeta = (id) => OUTREACH_STATUS.find(s => s.id === id) || OUTREACH_STATUS[0];
const _igUrl  = (h) => { const u = (h || "").trim().replace(/^@/, ""); return u ? "https://instagram.com/" + u : null; };
const _webUrl = (w) => { const u = (w || "").trim(); if (!u) return null; return /^https?:\/\//.test(u) ? u : "https://" + u; };
const _OM = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
const _fmtDate = (iso) => { if (!iso) return ""; const d = new Date(iso); return isNaN(d) ? "" : `${d.getDate()} ${_OM[d.getMonth()]}`; };
const _todayYmd = () => new Date().toISOString().split("T")[0];
const _DONE_ST = ["cerrado", "descartado"];
// ¿Le toca seguimiento? (tiene fecha programada <= hoy y sigue activo)
const _isDue = (o) => !!o.nextFollowup && o.nextFollowup <= _todayYmd() && !_DONE_ST.includes(o.status) && !o.convertedClientId;
// Metadatos visuales del próximo seguimiento
const _followMeta = (o) => {
  if (o.convertedClientId || _DONE_ST.includes(o.status) || !o.nextFollowup) return null;
  const t = _todayYmd();
  if (o.nextFollowup < t)  return { color: "#dc5b5d", label: "Atrasado" };
  if (o.nextFollowup === t) return { color: "#e2b45c", label: "Hoy" };
  return { color: "var(--text-subtle)", label: _fmtDate(o.nextFollowup) };
};

// Parseo de importación: una línea por lead. Campos separados por coma / tab /
// punto y coma. Detecta @instagram y la web automáticamente; el resto es marca.
const _looksUrl = (s) => /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/\S*)?$/i.test(s) && !s.startsWith("@");
const parseImport = (text) => {
  const out = [];
  (text || "").split(/\r?\n/).forEach(line => {
    const raw = line.trim(); if (!raw) return;
    const parts = raw.split(/\s*[,;\t|]\s*/).map(p => p.trim()).filter(Boolean);
    let instagram = "", web = "";
    const leftover = [];
    parts.forEach(p => {
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

// Parseo de CSV (archivos): detecta delimitador (,/;/tab), respeta comillas y
// mapea columnas por cabecera si la hay (Marca, Instagram, Web, Contacto…).
const _norm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const _splitCsvLine = (line, delim) => {
  const out = []; let cur = "", inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else inQ = false; }
      else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === delim) { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out.map(s => s.trim());
};
const parseCsv = (text) => {
  let t = (text || "").replace(/^﻿/, "");
  const lines = t.split(/\r?\n/).filter(l => l.trim() !== "");
  if (!lines.length) return [];
  const first = lines[0];
  const cnt = (re) => (first.match(re) || []).length;
  const delim = cnt(/;/g) > cnt(/,/g) ? ";" : cnt(/\t/g) > cnt(/,/g) ? "\t" : ",";
  const rows = lines.map(l => _splitCsvLine(l, delim));
  const hdr = rows[0].map(_norm);
  const known = ["marca", "brand", "nombre", "empresa", "instagram", "ig", "usuario", "user", "web", "url", "sitio", "website", "contacto", "contact", "persona", "correo", "email", "mail", "notas", "notes", "nota", "estado", "status"];
  const hasHeader = hdr.some(h => known.includes(h));
  const colFor = (names) => hdr.findIndex(h => names.includes(h));
  const map = hasHeader ? {
    brand: colFor(["marca", "brand", "nombre", "empresa"]),
    instagram: colFor(["instagram", "ig", "usuario", "user"]),
    web: colFor(["web", "url", "sitio", "website"]),
    contact: colFor(["contacto", "contact", "persona"]),
    email: colFor(["correo", "email", "mail"]),
    notes: colFor(["notas", "notes", "nota"]),
    status: colFor(["estado", "status"]),
  } : null;
  const STATUS_IDS = OUTREACH_STATUS.map(s => s.id);
  const STATUS_BY_LABEL = {}; OUTREACH_STATUS.forEach(s => STATUS_BY_LABEL[_norm(s.label)] = s.id);
  const dataRows = hasHeader ? rows.slice(1) : rows;
  const out = [];
  dataRows.forEach(cols => {
    if (!cols.length || cols.every(c => !c)) return;
    if (hasHeader) {
      const g = (i) => (i >= 0 && i < cols.length ? cols[i] : "") || "";
      let brand = g(map.brand), instagram = g(map.instagram), web = g(map.web);
      const contact = g(map.contact), email = g(map.email), notes = g(map.notes);
      const sr = _norm(g(map.status));
      const status = STATUS_IDS.includes(sr) ? sr : (STATUS_BY_LABEL[sr] || "guardado");
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

// Casilla de selección
const Check = ({ on, onToggle, dim }) => (
  <span onClick={e => { e.stopPropagation(); onToggle(); }}
    style={{ width: 16, height: 16, borderRadius: 5, flexShrink: 0, display: "grid", placeItems: "center", cursor: "pointer",
      border: on ? "none" : "1.5px solid var(--border-strong)", background: on ? "var(--accent)" : "transparent", opacity: dim && !on ? 0.5 : 1 }}>
    {on && <Icon name="check" size={11} style={{ color: "#fff" }}/>}
  </span>
);

// Celda de texto editable en línea
const InlineText = ({ value, onSave, placeholder, mono }) => {
  const [edit, setEdit] = useState(false);
  const [d, setD] = useState(value || "");
  useEffect(() => { if (!edit) setD(value || ""); }, [value, edit]);
  if (edit) return (
    <input autoFocus value={d} onChange={e => setD(e.target.value)} onClick={e => e.stopPropagation()}
      onBlur={() => { setEdit(false); if (d !== (value || "")) onSave(d); }}
      onKeyDown={e => { if (e.key === "Enter") e.currentTarget.blur(); if (e.key === "Escape") { setD(value || ""); setEdit(false); } }}
      style={{ width: "100%", minWidth: 90, background: "rgba(255,255,255,0.05)", border: "0.5px solid var(--accent)", borderRadius: 6,
        color: "var(--text)", fontSize: 13, padding: "4px 7px", fontFamily: mono ? "var(--font-mono)" : "inherit", outline: "none" }}/>
  );
  return (
    <span onClick={e => { e.stopPropagation(); setD(value || ""); setEdit(true); }}
      style={{ fontSize: 13, color: value ? "var(--text-muted)" : "var(--text-subtle)", cursor: "text",
        fontFamily: mono ? "var(--font-mono)" : "inherit", whiteSpace: "nowrap" }}>{value || placeholder}</span>
  );
};

// Chip de estado con menú (el menú se renderiza en un portal para que no lo
// recorte el overflow de la tabla)
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
    return () => { window.removeEventListener("click", close); window.removeEventListener("scroll", close, true); window.removeEventListener("resize", close); };
  }, [open]);
  return (
    <span style={{ display: "inline-block" }} onClick={e => e.stopPropagation()}>
      <button ref={btnRef} onClick={() => open ? setOpen(false) : openMenu()}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 7, cursor: "pointer",
          border: "none", fontFamily: "inherit", fontSize: 11.5, fontWeight: 500, whiteSpace: "nowrap", background: m.color + "22", color: m.color }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.color }}/>{m.label}
        <Icon name="chevron-down" size={11} style={{ opacity: 0.7 }}/>
      </button>
      {open && pos && ReactDOM.createPortal(
        <div onClick={e => e.stopPropagation()}
          style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 3000, minWidth: 190,
            background: "var(--bg-elev)", border: "0.5px solid var(--border-strong)", borderRadius: 12, padding: 5, boxShadow: "0 16px 40px rgba(0,0,0,0.5)" }}>
          {OUTREACH_STATUS.map(s => (
            <div key={s.id} onClick={() => { onChange(s.id); setOpen(false); }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }}/>
              <span style={{ flex: 1 }}>{s.label}</span>
              {s.id === value && <Icon name="check" size={13} style={{ color: "var(--accent)" }}/>}
            </div>
          ))}
        </div>,
        document.body
      )}
    </span>
  );
};

const _cell = { padding: "0 14px", height: 48, verticalAlign: "middle", whiteSpace: "nowrap" };

const OutreachRow = ({ o, D, sel, onSel, last }) => {
  const ig = _igUrl(o.instagram), web = _webUrl(o.web);
  const fm = _followMeta(o);
  const cell = { ..._cell, borderTop: "0.5px solid var(--border)" };
  const iconBtn = { background: "transparent", border: "none", cursor: "pointer", color: "var(--text-subtle)", padding: 4, borderRadius: 6, display: "inline-flex" };
  return (
    <tr onMouseEnter={e => e.currentTarget.style.background = sel ? "var(--accent-soft)" : "rgba(255,255,255,0.02)"}
        onMouseLeave={e => e.currentTarget.style.background = sel ? "var(--accent-active)" : "transparent"}
        style={{ transition: "background .1s", background: sel ? "var(--accent-active)" : "transparent" }}>
      <td style={{ ...cell, paddingLeft: 16, paddingRight: 4 }}><Check on={sel} onToggle={onSel} dim/></td>
      <td style={{ ...cell, fontWeight: 500, fontSize: 14 }}>{o.brand}</td>
      <td style={cell}><StatusPill value={o.status} onChange={s => D.updateOutreach(o.id, { status: s })}/></td>
      <td style={cell}>
        {fm ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500, color: fm.color }}>
            <Icon name="bell" size={11}/> {fm.label}
          </span>
        ) : <span style={{ fontSize: 12, color: "var(--text-subtle)" }}>—</span>}
      </td>
      <td style={cell}><InlineText value={o.contact} placeholder="—" onSave={v => D.updateOutreach(o.id, { contact: v })}/></td>
      <td style={cell}>
        {ig ? <a href={ig} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
          style={{ color: "var(--accent)", textDecoration: "none", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 5 }}>
          {o.instagram.startsWith("@") ? o.instagram : "@" + o.instagram}</a>
          : <InlineText value="" placeholder="@instagram" onSave={v => D.updateOutreach(o.id, { instagram: v })}/>}
      </td>
      <td style={cell}>
        {web ? <a href={web} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} title={o.web}
          style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 12.5, display: "inline-block", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", verticalAlign: "middle" }}>
          {o.web.replace(/^https?:\/\//, "")}</a>
          : <InlineText value="" placeholder="URL" onSave={v => D.updateOutreach(o.id, { web: v })}/>}
      </td>
      <td style={{ ...cell, whiteSpace: "normal", minWidth: 180 }}><InlineText value={o.notes} placeholder="Añadir nota…" onSave={v => D.updateOutreach(o.id, { notes: v })}/></td>
      <td style={{ ...cell, fontSize: 12, color: "var(--text-subtle)" }}>{_fmtDate(o.createdAt)}</td>
      <td style={{ ...cell, textAlign: "right", paddingRight: 12 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
          {!_DONE_ST.includes(o.status) && !o.convertedClientId && (
            <button onClick={() => D.outreachMarkContacted(o.id)} title="Marcar contactado hoy (programa seguimiento en 3 días)"
              style={iconBtn} onMouseEnter={e => e.currentTarget.style.color = "var(--accent)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-subtle)"}>
              <Icon name="send" size={13}/>
            </button>
          )}
          {o.convertedClientId ? (
            <span title="Ya es cliente" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 500, color: "var(--green)", padding: "0 4px" }}>
              <Icon name="check" size={12}/> Cliente
            </span>
          ) : o.status === "cerrado" ? (
            <button onClick={() => D.convertOutreachToClient(o.id)} title="Convertir en cliente del CRM"
              style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 7, cursor: "pointer",
                background: "var(--accent-soft)", color: "var(--accent)", border: "1px solid rgba(158,154,229,0.3)", fontFamily: "inherit", fontSize: 11.5, fontWeight: 500, whiteSpace: "nowrap" }}>
              <Icon name="arrow-up-right" size={12}/> Cliente
            </button>
          ) : null}
          <button onClick={() => D.deleteOutreach(o.id)} title="Eliminar" style={iconBtn}
            onMouseEnter={e => e.currentTarget.style.color = "var(--red)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-subtle)"}>
            <Icon name="x" size={14}/>
          </button>
        </span>
      </td>
    </tr>
  );
};

const AgencyOutreach = ({ navigate }) => {
  const D = window.Data; D.useStore();
  const all = D.OUTREACH || [];
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(() => new Set());
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const today = _todayYmd();
  const doImport = (leads) => {
    leads.forEach(l => D.addOutreach({ brand: l.brand, instagram: l.instagram || "", web: l.web || "",
      contact: l.contact || "", email: l.email || "", notes: l.notes || "", status: l.status || "guardado" }));
    setShowImport(false);
  };
  const _emptyF = { brand: "", instagram: "", contact: "", email: "", web: "", status: "guardado", notes: "" };
  const [f, setF] = useState(_emptyF);
  const upd = (k) => (e) => setF(p => ({ ...p, [k]: e.target.value }));
  const saveNew = () => {
    if (!f.brand.trim()) return;
    D.addOutreach({ brand: f.brand.trim(), instagram: f.instagram.trim(), contact: f.contact.trim(),
      email: f.email.trim(), web: f.web.trim(), status: f.status, notes: f.notes.trim() });
    setF(_emptyF); setShowAdd(false);
  };

  const counts = {}; OUTREACH_STATUS.forEach(s => counts[s.id] = 0);
  all.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });

  const ql = q.trim().toLowerCase();
  let rows = all.filter(o => !ql || (o.brand || "").toLowerCase().includes(ql) || (o.instagram || "").toLowerCase().includes(ql) || (o.contact || "").toLowerCase().includes(ql));
  // Los que toca contactar suben arriba (atrasados primero, luego los de hoy).
  const _dueRank = (o) => _isDue(o) ? (o.nextFollowup < today ? 0 : 1) : 2;
  rows = rows.slice().sort((a, b) => _dueRank(a) - _dueRank(b));

  const toggle = (id) => setSel(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allSel = rows.length > 0 && rows.every(o => sel.has(o.id));
  const toggleAll = () => setSel(allSel ? new Set() : new Set(rows.map(o => o.id)));
  const bulkDelete = () => { sel.forEach(id => D.deleteOutreach(id)); setSel(new Set()); };

  const th = { textAlign: "left", padding: "0 14px", height: 38, fontSize: 10.5, fontWeight: 600, textTransform: "uppercase",
    letterSpacing: "0.05em", color: "var(--text-subtle)", whiteSpace: "nowrap", position: "sticky", top: 0 };

  return (
    <div className="page">
      {/* Cabecera — mismo formato .page-head que el resto de páginas */}
      <div className="page-head">
        <div>
          <h1>Propuestas Outreach</h1>
          <div className="sub" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span><b style={{ color: "var(--text)", fontWeight: 600 }}>{all.length}</b> marcas</span><span style={{ color: "var(--text-subtle)" }}>·</span>
            <span>{counts.contactado || 0} contactadas</span><span style={{ color: "var(--text-subtle)" }}>·</span>
            <span>{counts.respondio || 0} respuestas</span><span style={{ color: "var(--text-subtle)" }}>·</span>
            <span>{counts.propuesta || 0} propuestas</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {sel.size > 0 && (
            <button onClick={bulkDelete} className="btn ghost sm" style={{ color: "var(--red)" }}>
              <Icon name="x" size={13}/> Eliminar ({sel.size})
            </button>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8, height: 34, padding: "0 12px", borderRadius: 9, background: "var(--bg-elev-2)", border: "0.5px solid var(--border)" }}>
            <Icon name="search" size={14} style={{ color: "var(--text-subtle)" }}/>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar…"
              style={{ background: "transparent", border: "none", outline: "none", color: "var(--text)", fontSize: 13, fontFamily: "inherit", width: 150 }}/>
          </div>
          <button onClick={() => setShowImport(true)} title="Importar varios leads pegando una lista"
            onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 34, padding: "0 12px", borderRadius: 9,
              background: "var(--bg-elev-2)", color: "var(--text-muted)", border: "0.5px solid var(--border)",
              cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", transition: "color .15s" }}>
            <Icon name="file-text" size={14}/> Importar
          </button>
          <button onClick={() => setShowAdd(true)}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(158,154,229,0.28)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--accent-soft)"}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 34, padding: "0 14px", borderRadius: 9,
              background: "var(--accent-soft)", color: "var(--accent)", border: "1px solid rgba(158,154,229,0.3)",
              cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", transition: "background .15s" }}>
            <Icon name="plus" size={14}/> Nuevo lead
          </button>
        </div>
      </div>

      {/* Tabla dentro de cajita */}
      <div style={{ border: "0.5px solid var(--border)", borderRadius: 16, overflow: "hidden", background: "var(--bg-elev-2)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1120 }}>
            <thead>
              <tr style={{ background: "var(--bg-elev-2)" }}>
                <th style={{ ...th, paddingLeft: 16, paddingRight: 4, width: 34 }}><Check on={allSel} onToggle={toggleAll}/></th>
                <th style={th}>Marca</th>
                <th style={th}>Estado</th>
                <th style={th}>Seguimiento</th>
                <th style={th}>Contacto</th>
                <th style={th}>Instagram</th>
                <th style={th}>Web</th>
                <th style={th}>Notas</th>
                <th style={th}>Fecha</th>
                <th style={{ ...th, textAlign: "right" }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(o => <OutreachRow key={o.id} o={o} D={D} sel={sel.has(o.id)} onSel={() => toggle(o.id)} last={false}/>)}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <div style={{ padding: "44px 0" }}>
            <Empty icon="send" title={all.length === 0 ? "Aún no tienes leads" : "Sin resultados"}
              sub={all.length === 0 ? "Añade la primera cuenta con «Nuevo lead»." : "Prueba con otra búsqueda."}/>
          </div>
        )}
      </div>

      {showAdd && <NewLeadModal f={f} upd={upd} setF={setF} onClose={() => setShowAdd(false)} onSave={saveNew}/>}
      {showImport && <ImportLeadsModal onClose={() => setShowImport(false)} onImport={doImport}/>}
    </div>
  );
};

// Modal completo para dar de alta un lead
const _fst = { width: "100%", height: 40, background: "var(--bg-elev-2)", border: "0.5px solid var(--border)",
  borderRadius: 10, padding: "0 12px", color: "var(--text)", fontSize: 14, fontFamily: "inherit", outline: "none" };
const _lst = { fontSize: 12, color: "var(--text-muted)", marginBottom: 6, display: "block" };
const Fld = ({ label, children }) => (<div style={{ minWidth: 0 }}><label style={_lst}>{label}</label>{children}</div>);

const NewLeadModal = ({ f, upd, setF, onClose, onSave }) => {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "22px 24px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 500 }}>Nuevo lead</h3>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Guarda una cuenta que quieras contactar.</div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-subtle)", padding: 4 }}><Icon name="x" size={18}/></button>
        </div>

        <div style={{ padding: "20px 24px 4px", display: "grid", gap: 14 }}>
          <Fld label="Marca / cuenta *">
            <input autoFocus value={f.brand} onChange={upd("brand")} placeholder="Nombre de la marca"
              onKeyDown={e => { if (e.key === "Enter") onSave(); }} style={_fst}/>
          </Fld>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Fld label="Instagram">
              <input value={f.instagram} onChange={upd("instagram")} placeholder="@usuario" style={_fst}/>
            </Fld>
            <Fld label="Persona de contacto">
              <input value={f.contact} onChange={upd("contact")} placeholder="Nombre" style={_fst}/>
            </Fld>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Fld label="Correo">
              <input value={f.email} onChange={upd("email")} placeholder="correo@marca.com" style={_fst}/>
            </Fld>
            <Fld label="Web">
              <input value={f.web} onChange={upd("web")} placeholder="marca.com" style={_fst}/>
            </Fld>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Fld label="Estado">
              <select value={f.status} onChange={upd("status")} style={{ ..._fst, cursor: "pointer" }}>
                {OUTREACH_STATUS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </Fld>
          </div>
          <Fld label="Notas">
            <textarea value={f.notes} onChange={upd("notes")} placeholder="Contexto, por qué encaja, siguiente paso…"
              rows={3} style={{ ..._fst, height: "auto", padding: "10px 12px", resize: "vertical", lineHeight: 1.45 }}/>
          </Fld>
        </div>

        <div style={{ padding: "18px 24px 22px", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onClose} className="btn ghost">Cancelar</button>
          <button onClick={onSave} disabled={!f.brand.trim()} className="btn primary"
            style={{ opacity: f.brand.trim() ? 1 : 0.5, pointerEvents: f.brand.trim() ? "auto" : "none" }}>Guardar lead</button>
        </div>
      </div>
    </div>
  );
};

// Modal de importación masiva: sube un CSV o pega una lista
const ImportLeadsModal = ({ onClose, onImport }) => {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);      // { name, leads }
  const [drag, setDrag] = useState(false);
  const [err, setErr] = useState("");
  const inputRef = React.useRef(null);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
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
        if (!leads.length) { setErr("No he encontrado ninguna fila válida en el archivo."); setFile(null); return; }
        setFile({ name: f.name, leads });
      } catch (_) { setErr("No he podido leer el archivo. ¿Es un CSV?"); setFile(null); }
    };
    reader.onerror = () => setErr("No he podido leer el archivo.");
    reader.readAsText(f);
  };
  const onDrop = (e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files && e.dataTransfer.files[0]; if (f) loadFile(f); };

  const parsed = file ? file.leads : parseImport(text);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "22px 24px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 500 }}>Importar leads</h3>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Sube un <b style={{ color: "var(--text)" }}>CSV</b> o pega una lista.</div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-subtle)", padding: 4 }}><Icon name="x" size={18}/></button>
        </div>

        <div style={{ padding: "18px 24px 4px" }}>
          <input ref={inputRef} type="file" accept=".csv,text/csv,text/plain" style={{ display: "none" }}
            onChange={e => loadFile(e.target.files && e.target.files[0])}/>

          {file ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 12, background: "var(--bg-elev-2)", border: "0.5px solid var(--border)" }}>
              <Icon name="file-text" size={18} style={{ color: "var(--accent)" }}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{file.leads.length} lead{file.leads.length > 1 ? "s" : ""} detectados</div>
              </div>
              <button onClick={() => { setFile(null); if (inputRef.current) inputRef.current.value = ""; }}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-subtle)", padding: 4 }} title="Quitar archivo"><Icon name="x" size={16}/></button>
            </div>
          ) : (
            <div onClick={() => inputRef.current && inputRef.current.click()}
              onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={onDrop}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "26px 16px", borderRadius: 12, cursor: "pointer", textAlign: "center",
                border: "1px dashed " + (drag ? "var(--accent)" : "var(--border-strong)"), background: drag ? "var(--accent-soft)" : "var(--bg-elev-2)", transition: "all .15s" }}>
              <Icon name="file-text" size={22} style={{ color: drag ? "var(--accent)" : "var(--text-muted)" }}/>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>Arrastra un CSV aquí o haz clic para elegirlo</div>
              <div style={{ fontSize: 12, color: "var(--text-subtle)" }}>Columnas: Marca · Instagram · Web · Contacto · Correo · Notas · Estado</div>
            </div>
          )}

          {err && <div style={{ fontSize: 12.5, color: "var(--red)", marginTop: 10 }}>{err}</div>}

          {!file && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, color: "var(--text-subtle)", marginBottom: 6 }}>o pega una lista (un lead por línea):</div>
              <textarea value={text} onChange={e => setText(e.target.value)}
                placeholder={"Maktub, @maktub.wyt, maktub.store\n@solo_instagram\nMarca suelta"}
                rows={5} style={{ ..._fst, height: "auto", padding: "12px 14px", resize: "vertical", lineHeight: 1.5, fontSize: 13.5, whiteSpace: "pre", overflowX: "auto" }}/>
            </div>
          )}
        </div>

        <div style={{ padding: "16px 24px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <span style={{ fontSize: 13, color: parsed.length ? "var(--accent)" : "var(--text-subtle)", fontWeight: 500 }}>
            {parsed.length ? `${parsed.length} lead${parsed.length > 1 ? "s" : ""} para importar` : "Nada que importar todavía"}
          </span>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} className="btn ghost">Cancelar</button>
            <button onClick={() => onImport(parsed)} disabled={!parsed.length} className="btn primary"
              style={{ opacity: parsed.length ? 1 : 0.5, pointerEvents: parsed.length ? "auto" : "none" }}>
              Importar {parsed.length || ""}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

window.AgencyOutreach = AgencyOutreach;

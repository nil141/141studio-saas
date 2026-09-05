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

// Chip de estado con menú
const StatusPill = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const m = _stMeta(value);
  useEffect(() => { if (!open) return; const c = () => setOpen(false); window.addEventListener("click", c); return () => window.removeEventListener("click", c); }, [open]);
  return (
    <span style={{ position: "relative", display: "inline-block" }} onClick={e => e.stopPropagation()}>
      <button onClick={() => setOpen(o => !o)}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 7, cursor: "pointer",
          border: "none", fontFamily: "inherit", fontSize: 11.5, fontWeight: 500, whiteSpace: "nowrap", background: m.color + "22", color: m.color }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.color }}/>{m.label}
        <Icon name="chevron-down" size={11} style={{ opacity: 0.7 }}/>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 30, minWidth: 175,
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
        </div>
      )}
    </span>
  );
};

const _cell = { padding: "0 14px", height: 48, verticalAlign: "middle", whiteSpace: "nowrap" };

const OutreachRow = ({ o, D, sel, onSel, last }) => {
  const ig = _igUrl(o.instagram), web = _webUrl(o.web);
  const m = _stMeta(o.status);
  const cell = { ..._cell, borderTop: "0.5px solid var(--border)" };
  return (
    <tr onMouseEnter={e => e.currentTarget.style.background = sel ? "var(--accent-soft)" : "rgba(255,255,255,0.02)"}
        onMouseLeave={e => e.currentTarget.style.background = sel ? "var(--accent-active)" : "transparent"}
        style={{ transition: "background .1s", background: sel ? "var(--accent-active)" : "transparent" }}>
      <td style={{ ...cell, paddingLeft: 16, paddingRight: 4 }}><Check on={sel} onToggle={onSel} dim/></td>
      <td style={{ ...cell, fontWeight: 500, fontSize: 14 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: m.color, flexShrink: 0 }}/>{o.brand}
        </span>
      </td>
      <td style={cell}><StatusPill value={o.status} onChange={s => D.updateOutreach(o.id, { status: s })}/></td>
      <td style={cell}><InlineText value={o.contact} placeholder="—" onSave={v => D.updateOutreach(o.id, { contact: v })}/></td>
      <td style={cell}>
        {ig ? <a href={ig} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
          style={{ color: "var(--accent)", textDecoration: "none", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 5 }}>
          <SiIcon name="instagram" size={13}/> {o.instagram.startsWith("@") ? o.instagram : "@" + o.instagram}</a>
          : <InlineText value="" placeholder="@instagram" onSave={v => D.updateOutreach(o.id, { instagram: v })}/>}
      </td>
      <td style={cell}>
        {web ? <a href={web} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
          style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 12.5, display: "inline-flex", alignItems: "center", gap: 5 }}>
          <Icon name="link" size={12}/> Web</a>
          : <InlineText value="" placeholder="web" onSave={v => D.updateOutreach(o.id, { web: v })}/>}
      </td>
      <td style={cell}><InlineText value={o.email} placeholder="correo" mono onSave={v => D.updateOutreach(o.id, { email: v })}/></td>
      <td style={{ ...cell, whiteSpace: "normal", minWidth: 180 }}><InlineText value={o.notes} placeholder="Añadir nota…" onSave={v => D.updateOutreach(o.id, { notes: v })}/></td>
      <td style={{ ...cell, fontSize: 12, color: "var(--text-subtle)" }}>{_fmtDate(o.createdAt)}</td>
      <td style={{ ...cell, textAlign: "right", paddingRight: 12 }}>
        <button onClick={() => D.deleteOutreach(o.id)} title="Eliminar"
          style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-subtle)", padding: 4, borderRadius: 6 }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--red)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-subtle)"}>
          <Icon name="x" size={14}/>
        </button>
      </td>
    </tr>
  );
};

const AgencyOutreach = ({ navigate }) => {
  const D = window.Data; D.useStore();
  const all = D.OUTREACH || [];
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState("");
  const [ig, setIg] = useState("");
  const [sel, setSel] = useState(() => new Set());
  const [showAdd, setShowAdd] = useState(false);
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
  const rows = all.filter(o => !ql || (o.brand || "").toLowerCase().includes(ql) || (o.instagram || "").toLowerCase().includes(ql) || (o.contact || "").toLowerCase().includes(ql));

  const add = () => { if (!brand.trim()) return; D.addOutreach({ brand: brand.trim(), instagram: ig.trim(), status: "guardado" }); setBrand(""); setIg(""); };
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
          <button onClick={() => setShowAdd(true)} className="btn primary sm" style={{ height: 34, gap: 6 }}>
            <Icon name="plus" size={14}/> Nuevo lead
          </button>
        </div>
      </div>

      {/* Tabla dentro de cajita */}
      <div style={{ border: "0.5px solid var(--border)", borderRadius: 16, overflow: "hidden", background: "var(--bg-elev-2)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000 }}>
            <thead>
              <tr style={{ background: "var(--bg-elev-2)" }}>
                <th style={{ ...th, paddingLeft: 16, paddingRight: 4, width: 34 }}><Check on={allSel} onToggle={toggleAll}/></th>
                <th style={th}>Marca</th>
                <th style={th}>Estado</th>
                <th style={th}>Contacto</th>
                <th style={th}>Instagram</th>
                <th style={th}>Web</th>
                <th style={th}>Correo</th>
                <th style={th}>Notas</th>
                <th style={th}>Fecha</th>
                <th style={{ ...th, textAlign: "right" }}></th>
              </tr>
            </thead>
            <tbody>
              {/* Fila para añadir (estilo Notion) */}
              <tr style={{ borderTop: "0.5px solid var(--border)" }}>
                <td style={{ ..._cell, paddingLeft: 16, paddingRight: 4 }}><Icon name="plus" size={14} style={{ color: "var(--text-subtle)" }}/></td>
                <td style={_cell}>
                  <input value={brand} onChange={e => setBrand(e.target.value)} onKeyDown={e => { if (e.key === "Enter") add(); }} placeholder="Añadir cuenta…"
                    style={{ width: "100%", minWidth: 120, background: "transparent", border: "none", outline: "none", color: "var(--text)", fontSize: 14, fontWeight: 500, fontFamily: "inherit" }}/>
                </td>
                <td style={_cell}></td>
                <td style={_cell}></td>
                <td style={_cell}>
                  <input value={ig} onChange={e => setIg(e.target.value)} onKeyDown={e => { if (e.key === "Enter") add(); }} placeholder="@instagram"
                    style={{ width: "100%", minWidth: 90, background: "transparent", border: "none", outline: "none", color: "var(--text)", fontSize: 13, fontFamily: "inherit" }}/>
                </td>
                <td style={_cell}></td>
                <td style={_cell}></td>
                <td style={_cell}></td>
                <td style={_cell}></td>
                <td style={{ ..._cell, textAlign: "right", paddingRight: 12 }}>
                  {brand.trim() && <button onClick={add} className="btn primary sm" style={{ height: 28 }}>Añadir</button>}
                </td>
              </tr>
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

window.AgencyOutreach = AgencyOutreach;

// Propuestas Outreach — captación de leads por Instagram (tabla CRM ligera)
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
const _igUrl = (h) => { const u = (h || "").trim().replace(/^@/, ""); return u ? "https://instagram.com/" + u : null; };
const _webUrl = (w) => { const u = (w || "").trim(); if (!u) return null; return /^https?:\/\//.test(u) ? u : "https://" + u; };

// Chip de estado con menú para cambiarlo
const StatusPill = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const m = _stMeta(value);
  useEffect(() => { if (!open) return; const c = () => setOpen(false); window.addEventListener("click", c); return () => window.removeEventListener("click", c); }, [open]);
  return (
    <span style={{ position: "relative", display: "inline-block" }} onClick={e => e.stopPropagation()}>
      <button onClick={() => setOpen(o => !o)}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 7, cursor: "pointer",
          border: "none", fontFamily: "inherit", fontSize: 11.5, fontWeight: 500, letterSpacing: "-0.01em", whiteSpace: "nowrap",
          background: m.color + "22", color: m.color }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.color }}/>
        {m.label}
        <Icon name="chevron-down" size={11} style={{ opacity: 0.7 }}/>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 30, minWidth: 170,
          background: "var(--bg-elev)", border: "0.5px solid var(--border-strong)", borderRadius: 12, padding: 5,
          boxShadow: "0 16px 40px rgba(0,0,0,0.5)" }}>
          {OUTREACH_STATUS.map(s => (
            <div key={s.id} onClick={() => { onChange(s.id); setOpen(false); }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
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

const OutreachRow = ({ o, D, last }) => {
  const [editNotes, setEditNotes] = useState(false);
  const [draft, setDraft] = useState(o.notes || "");
  const ig = _igUrl(o.instagram), web = _webUrl(o.web);
  const m = _stMeta(o.status);
  const cell = { padding: "0 14px", height: 46, verticalAlign: "middle", borderBottom: last ? "none" : "0.5px solid var(--border)" };
  return (
    <tr onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        style={{ transition: "background .1s" }}>
      <td style={{ ...cell, fontWeight: 500, fontSize: 14 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: m.color, flexShrink: 0 }}/>
          {o.brand}
        </span>
      </td>
      <td style={cell}><StatusPill value={o.status} onChange={s => D.updateOutreach(o.id, { status: s })}/></td>
      <td style={cell}>
        {ig ? <a href={ig} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
          style={{ color: "var(--accent)", textDecoration: "none", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 5 }}>
          <SiIcon name="instagram" size={13}/> {o.instagram.startsWith("@") ? o.instagram : "@" + o.instagram}</a>
          : <span style={{ color: "var(--text-subtle)" }}>—</span>}
      </td>
      <td style={cell}>
        {web ? <a href={web} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
          style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 12.5, display: "inline-flex", alignItems: "center", gap: 5 }}>
          <Icon name="link" size={12}/> Web</a>
          : <span style={{ color: "var(--text-subtle)" }}>—</span>}
      </td>
      <td style={{ ...cell, minWidth: 200 }}>
        {editNotes ? (
          <input autoFocus value={draft} onChange={e => setDraft(e.target.value)}
            onBlur={() => { setEditNotes(false); if (draft !== o.notes) D.updateOutreach(o.id, { notes: draft }); }}
            onKeyDown={e => { if (e.key === "Enter") e.currentTarget.blur(); if (e.key === "Escape") { setDraft(o.notes || ""); setEditNotes(false); } }}
            style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "0.5px solid var(--accent)", borderRadius: 7,
              color: "var(--text)", fontSize: 13, padding: "5px 8px", fontFamily: "inherit", outline: "none" }}/>
        ) : (
          <span onClick={() => { setDraft(o.notes || ""); setEditNotes(true); }}
            style={{ fontSize: 13, color: o.notes ? "var(--text-muted)" : "var(--text-subtle)", cursor: "text" }}>
            {o.notes || "Añadir nota…"}</span>
        )}
      </td>
      <td style={{ ...cell, textAlign: "right" }}>
        <button onClick={() => D.deleteOutreach(o.id)} title="Eliminar"
          style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-subtle)", padding: 4, borderRadius: 6 }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--red)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--text-subtle)"}>
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
  const [filter, setFilter] = useState("todos");
  const [brand, setBrand] = useState("");
  const [ig, setIg] = useState("");

  const counts = {}; OUTREACH_STATUS.forEach(s => counts[s.id] = 0);
  all.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });

  const ql = q.trim().toLowerCase();
  const rows = all.filter(o =>
    (filter === "todos" || o.status === filter) &&
    (!ql || (o.brand || "").toLowerCase().includes(ql) || (o.instagram || "").toLowerCase().includes(ql))
  );

  const add = () => {
    if (!brand.trim()) return;
    D.addOutreach({ brand: brand.trim(), instagram: ig.trim(), status: "guardado" });
    setBrand(""); setIg("");
  };

  const th = { textAlign: "left", padding: "0 14px", height: 34, fontSize: 10.5, fontWeight: 600, textTransform: "uppercase",
    letterSpacing: "0.05em", color: "var(--text-subtle)", borderBottom: "0.5px solid var(--border)", whiteSpace: "nowrap", background: "var(--bg)" };

  return (
    <div className="page">
      {/* Cabecera: título + resumen en una línea (estilo base de datos) */}
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(22px,2.6vw,28px)", letterSpacing: "-0.7px" }}>Propuestas Outreach</h1>
        <div style={{ marginTop: 7, fontSize: 13, color: "var(--text-muted)", display: "flex", gap: 6, flexWrap: "wrap" }}>
          <span><b style={{ color: "var(--text)", fontWeight: 600 }}>{all.length}</b> marcas</span><span style={{ color: "var(--text-subtle)" }}>·</span>
          <span>{counts.contactado || 0} contactadas</span><span style={{ color: "var(--text-subtle)" }}>·</span>
          <span>{counts.respondio || 0} respuestas</span><span style={{ color: "var(--text-subtle)" }}>·</span>
          <span>{counts.propuesta || 0} propuestas</span>
        </div>
      </div>

      {/* Toolbar: filtros por estado + buscador */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        <button onClick={() => setFilter("todos")} style={_chip(filter === "todos", "var(--text)")}>Todos <span style={{ opacity: 0.55 }}>{all.length}</span></button>
        {OUTREACH_STATUS.map(s => (
          <button key={s.id} onClick={() => setFilter(s.id)} style={_chip(filter === s.id, s.color)}>
            {s.label} <span style={{ opacity: 0.55 }}>{counts[s.id] || 0}</span>
          </button>
        ))}
        <div style={{ flex: 1, minWidth: 12 }}/>
        <div style={{ display: "flex", alignItems: "center", gap: 8, height: 32, padding: "0 11px", borderRadius: 9, background: "var(--bg-elev-2)", border: "0.5px solid var(--border)" }}>
          <Icon name="search" size={14} style={{ color: "var(--text-subtle)" }}/>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar…"
            style={{ background: "transparent", border: "none", outline: "none", color: "var(--text)", fontSize: 13, fontFamily: "inherit", width: 130 }}/>
        </div>
      </div>

      {/* Tabla full-bleed (estilo base de datos) */}
      <div style={{ overflowX: "auto", borderTop: "0.5px solid var(--border)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
          <thead>
            <tr>
              <th style={th}>Marca</th>
              <th style={th}>Estado</th>
              <th style={th}>Instagram</th>
              <th style={th}>Web</th>
              <th style={th}>Notas</th>
              <th style={{ ...th, textAlign: "right" }}></th>
            </tr>
          </thead>
          <tbody>
            {/* Fila para añadir, siempre visible (estilo Notion) */}
            <tr style={{ borderBottom: "0.5px solid var(--border)" }}>
              <td style={{ padding: "0 14px", height: 46 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 10, width: "100%" }}>
                  <Icon name="plus" size={14} style={{ color: "var(--text-subtle)", flexShrink: 0 }}/>
                  <input value={brand} onChange={e => setBrand(e.target.value)} onKeyDown={e => { if (e.key === "Enter") add(); }}
                    placeholder="Añadir cuenta…"
                    style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none", color: "var(--text)",
                      fontSize: 14, fontFamily: "inherit", fontWeight: 500 }}/>
                </span>
              </td>
              <td style={{ padding: "0 14px" }}></td>
              <td style={{ padding: "0 14px" }}>
                <input value={ig} onChange={e => setIg(e.target.value)} onKeyDown={e => { if (e.key === "Enter") add(); }}
                  placeholder="@instagram"
                  style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: "var(--text)", fontSize: 13, fontFamily: "inherit" }}/>
              </td>
              <td style={{ padding: "0 14px" }}></td>
              <td style={{ padding: "0 14px" }}></td>
              <td style={{ padding: "0 14px", textAlign: "right" }}>
                {brand.trim() && (
                  <button onClick={add} className="btn primary sm" style={{ height: 28 }}>Añadir</button>
                )}
              </td>
            </tr>
            {rows.map((o, i) => <OutreachRow key={o.id} o={o} D={D} last={i === rows.length - 1}/>)}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div style={{ padding: "40px 0", textAlign: "center" }}>
            <Empty icon="megaphone-simple" title={all.length === 0 ? "Aún no tienes leads" : "Sin resultados"}
              sub={all.length === 0 ? "Escribe la primera cuenta en la fila de arriba." : "Prueba con otro filtro o búsqueda."}/>
          </div>
        )}
      </div>
    </div>
  );
};

function _chip(active, color) {
  return { display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 7, cursor: "pointer",
    fontFamily: "inherit", fontSize: 12, letterSpacing: "-0.01em", whiteSpace: "nowrap", border: "none",
    background: active ? (color === "var(--text)" ? "rgba(255,255,255,0.09)" : color + "22") : "transparent",
    color: active ? (color === "var(--text)" ? "var(--text)" : color) : "var(--text-muted)" };
}

window.AgencyOutreach = AgencyOutreach;

// Recursos — biblioteca personal de herramientas, referencias y estrategias
const { useState, useEffect } = React;

const RES_TYPES = [
  { id: "herramienta", label: "Herramienta", color: "#9e9ae5", icon: "palette" },
  { id: "referencia",  label: "Referencia",  color: "#60a5fa", icon: "star" },
  { id: "estrategia",  label: "Estrategia",  color: "#34d399", icon: "layers" },
  { id: "inspiracion", label: "Inspiración", color: "#e879a6", icon: "sparkles" },
  { id: "otro",        label: "Otro",        color: "#f6a15b", icon: "link" },
];
// Categorías libres: el usuario puede crear las suyas (p. ej. "Shopify").
// Sugerencias por defecto + colores fijos; el resto recibe un color estable.
const _DEFAULT_CATS = [
  { key: "Herramienta", color: "#9e9ae5" },
  { key: "Referencia",  color: "#60a5fa" },
  { key: "Estrategia",  color: "#34d399" },
  { key: "Inspiración", color: "#e879a6" },
  { key: "Shopify",     color: "#95bf47" },
  { key: "Otro",        color: "#f6a15b" },
];
const _ID2LABEL = { herramienta: "Herramienta", referencia: "Referencia", estrategia: "Estrategia", inspiracion: "Inspiración", otro: "Otro" };
const _CAT_PALETTE = ["#9e9ae5", "#60a5fa", "#34d399", "#e879a6", "#95bf47", "#f6a15b", "#22d3ee", "#fbbf24", "#f472b6", "#a78bfa"];
const _hashStr = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };
const _catLabel = (t) => { const s = (t || "").trim(); if (!s) return "Otro"; return _ID2LABEL[s.toLowerCase()] || s; };
const _catColor = (label) => { const d = _DEFAULT_CATS.find(c => c.key.toLowerCase() === (label || "").toLowerCase()); return d ? d.color : _CAT_PALETTE[_hashStr(label || "") % _CAT_PALETTE.length]; };
const _catMeta = (type) => { const label = _catLabel(type); return { label, color: _catColor(label) }; };
const _resUrl = (u) => { const s = (u || "").trim(); if (!s) return null; return /^https?:\/\//.test(s) ? s : "https://" + s; };
const _resDomain = (u) => {
  const full = _resUrl(u); if (!full) return "";
  try { return new URL(full).hostname.replace(/^www\./, ""); }
  catch { return (u || "").replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0]; }
};
const _favicon = (u) => { const d = _resDomain(u); return d ? `https://www.google.com/s2/favicons?domain=${d}&sz=64` : null; };

// Favicon con respaldo (si falla, muestra la inicial del dominio)
const Favicon = ({ url, size = 22 }) => {
  const [err, setErr] = useState(false);
  const src = _favicon(url);
  const d = _resDomain(url);
  if (err || !src) {
    return (
      <div style={{ width: size, height: size, borderRadius: 6, background: "var(--bg-elev-2)", border: "0.5px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.5, fontWeight: 600, color: "var(--text-muted)", flexShrink: 0 }}>
        {(d || "?").charAt(0).toUpperCase()}
      </div>
    );
  }
  return <img src={src} alt="" onError={() => setErr(true)} style={{ width: size, height: size, borderRadius: 6, flexShrink: 0, objectFit: "cover" }}/>;
};

// Tarjeta de recurso
const ResourceCard = ({ r, D, onEdit }) => {
  const [hover, setHover] = useState(false);
  const meta = _catMeta(r.type);
  const url = _resUrl(r.url);
  const domain = _resDomain(r.url);
  const open = () => { if (url) window.open(url, "_blank", "noopener"); };
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={open}
      style={{ position: "relative", display: "flex", flexDirection: "column", gap: 10, padding: "16px 16px 14px", borderRadius: 16, cursor: url ? "pointer" : "default",
        background: "var(--bg-elev)", border: "0.5px solid " + (hover ? "var(--border-strong)" : "var(--border)"),
        boxShadow: hover ? "0 10px 30px rgba(0,0,0,0.35)" : "none", transform: hover ? "translateY(-2px)" : "none", transition: "all .15s" }}>
      {/* Acciones al pasar el ratón */}
      <div style={{ position: "absolute", top: 10, right: 10, display: "flex", gap: 4, opacity: hover ? 1 : 0, transition: "opacity .12s" }}>
        <button onClick={e => { e.stopPropagation(); onEdit(r); }} title="Editar"
          style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            background: "var(--bg-elev-2)", border: "0.5px solid var(--border)", color: "var(--text-muted)" }}>
          <Icon name="edit" size={13}/>
        </button>
        <button onClick={e => { e.stopPropagation(); if (confirm("¿Eliminar este recurso?")) D.deleteResource(r.id); }} title="Eliminar"
          style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            background: "var(--bg-elev-2)", border: "0.5px solid var(--border)", color: "var(--text-subtle)" }}>
          <Icon name="trash" size={13}/>
        </button>
      </div>
      {/* Favicon + dominio */}
      <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0, paddingRight: hover ? 62 : 0, transition: "padding .12s" }}>
        <Favicon url={r.url} size={24}/>
        <span style={{ fontSize: 12, color: "var(--text-subtle)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{domain || "—"}</span>
        {url && <Icon name="external-link" size={12} style={{ color: "var(--text-subtle)", marginLeft: "auto", opacity: hover ? 1 : 0, transition: "opacity .12s", flexShrink: 0 }}/>}
      </div>
      {/* Título */}
      <div style={{ fontSize: 15, fontWeight: 500, color: "var(--text)", letterSpacing: "-0.2px", lineHeight: 1.3,
        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {r.title || domain || "Sin título"}
      </div>
      {/* Descripción */}
      {r.description && (
        <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5,
          display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {r.description}
        </div>
      )}
      {/* Pie: categoría + sector */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: "auto", paddingTop: 4, flexWrap: "wrap" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: meta.color, background: meta.color + "1f", borderRadius: 6, padding: "2px 8px" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.color }}/> {meta.label}
        </span>
        {r.sector && <span style={{ fontSize: 11.5, color: "var(--text-subtle)" }}>{r.sector}</span>}
      </div>
    </div>
  );
};

// Modal para añadir / editar un recurso
const _rfst = { width: "100%", height: 40, background: "var(--bg-elev-2)", border: "0.5px solid var(--border)",
  borderRadius: 10, padding: "0 12px", color: "var(--text)", fontSize: 14, fontFamily: "inherit", outline: "none" };
const ResourceModal = ({ initial, sectors, categories, onClose }) => {
  const D = window.Data;
  const editing = initial && initial.id;
  const [f, setF] = useState(() => ({
    title: (initial && initial.title) || "", url: (initial && initial.url) || "",
    type: (initial && initial.id) ? _catLabel(initial.type) : ((initial && initial.presetCat) || ""), sector: (initial && initial.sector) || "",
    description: (initial && initial.description) || "",
  }));
  const upd = (k) => (e) => setF(p => ({ ...p, [k]: e.target.value }));
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  // Al pegar una URL, si no hay título, propone el dominio
  const onUrlBlur = () => { if (!f.title.trim() && f.url.trim()) setF(p => ({ ...p, title: _resDomain(p.url) })); };
  const save = () => {
    if (!f.url.trim() && !f.title.trim()) return;
    const cat = (f.type || "").trim() || "Otro";
    if (editing) D.updateResource(initial.id, { title: f.title.trim(), url: f.url.trim(), type: cat, sector: f.sector.trim(), description: f.description.trim() });
    else D.addResource({ title: f.title.trim(), url: f.url.trim(), type: cat, sector: f.sector.trim(), description: f.description.trim() });
    onClose();
  };
  const catOptions = [...new Set([..._DEFAULT_CATS.map(c => c.key), ...(categories || [])])];
  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title" style={{ fontSize: 21 }}>{editing ? "Editar recurso" : "Añadir recurso"}</div>
            <div className="modal-sub" style={{ marginTop: 6 }}>Guarda un enlace en tu biblioteca</div>
          </div>
          <button onClick={onClose} className="btn ghost icon-only sm"><Icon name="x" size={16}/></button>
        </div>
        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>Enlace (URL)</div>
            <input autoFocus value={f.url} onChange={upd("url")} onBlur={onUrlBlur} placeholder="https://…" style={_rfst}/>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>Título</div>
            <input value={f.title} onChange={upd("title")} placeholder="Nombre de la herramienta / página" style={_rfst}/>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>Categoría <span style={{ color: "var(--text-subtle)" }}>(crea la tuya)</span></div>
              <input value={f.type} onChange={upd("type")} placeholder="Ej. Shopify, Herramienta…" list="res-cats" style={_rfst}/>
              <datalist id="res-cats">{catOptions.map(c => <option key={c} value={c}/>)}</datalist>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>Sector <span style={{ color: "var(--text-subtle)" }}>(opcional)</span></div>
              <input value={f.sector} onChange={upd("sector")} placeholder="Ej. Moda, Hogar, SaaS" list="res-sectors" style={_rfst}/>
              <datalist id="res-sectors">{(sectors || []).map(s => <option key={s} value={s}/>)}</datalist>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>Notas <span style={{ color: "var(--text-subtle)" }}>(qué es, para qué sirve…)</span></div>
            <textarea value={f.description} onChange={upd("description")} rows={3} placeholder="Descripción o por qué te sirve"
              style={{ ..._rfst, height: "auto", padding: "10px 12px", resize: "vertical", lineHeight: 1.5 }}/>
          </div>
        </div>
        <div className="modal-foot">
          <button onClick={onClose} className="btn ghost">Cancelar</button>
          <button onClick={save} disabled={!f.url.trim() && !f.title.trim()} className="btn primary"
            style={{ opacity: (f.url.trim() || f.title.trim()) ? 1 : 0.5, pointerEvents: (f.url.trim() || f.title.trim()) ? "auto" : "none" }}>
            {editing ? "Guardar" : "Añadir recurso"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const AgencyResources = ({ navigate }) => {
  const D = window.Data; D.useStore();
  const all = D.RESOURCES || [];
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [sectorF, setSectorF] = useState("all");
  const [modal, setModal] = useState(null);   // null | {} (nuevo) | recurso (editar)

  // Categorías presentes (creadas por el usuario) → pestañas
  const catCounts = {};
  all.forEach(r => { const c = _catLabel(r.type); catCounts[c] = (catCounts[c] || 0) + 1; });
  const categories = Object.keys(catCounts).sort((a, b) => a.localeCompare(b, "es"));
  const sectors = [...new Set(all.map(r => (r.sector || "").trim()).filter(Boolean))].sort();

  const ql = q.trim().toLowerCase();
  const rows = all.filter(r =>
    (type === "all" || _catLabel(r.type) === type) &&
    (sectorF === "all" || (r.sector || "").trim() === sectorF) &&
    (!ql || (r.title || "").toLowerCase().includes(ql) || (r.description || "").toLowerCase().includes(ql) || (r.url || "").toLowerCase().includes(ql) || (r.sector || "").toLowerCase().includes(ql) || (_catLabel(r.type)).toLowerCase().includes(ql))
  );

  // Subrayado deslizante de las pestañas
  const tabItems = [{ id: "all", label: "Todos", count: all.length }, ...categories.map(c => ({ id: c, label: c, count: catCounts[c] || 0 }))];
  const tabsRef = React.useRef(null);
  const [indic, setIndic] = useState({ left: 0, width: 0 });
  const [, startTransition] = React.useTransition();
  const pickTab = (id, el) => { if (el) setIndic({ left: el.offsetLeft, width: el.offsetWidth }); startTransition(() => setType(id)); };
  React.useLayoutEffect(() => {
    const cont = tabsRef.current; if (!cont) return;
    const el = cont.querySelector(".tab.active");
    if (el) setIndic({ left: el.offsetLeft, width: el.offsetWidth });
  }, [type, all.length, JSON.stringify(catCounts)]);

  const inputStyle = { background: "transparent", border: "none", outline: "none", color: "var(--text)", fontSize: 13, fontFamily: "inherit", width: 150 };
  return (
    <div className="page">
      <div className="page-head">
        <div className="hide-mobile">
          <h1>Recursos</h1>
          <div className="sub">Tu biblioteca de herramientas, referencias y estrategias</div>
        </div>
        <div className="outreach-actions" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {sectors.length > 0 && (
            <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
              <select value={sectorF} onChange={e => setSectorF(e.target.value)} title="Filtrar por sector"
                style={{ height: 34, padding: "0 30px 0 12px", borderRadius: 9, background: sectorF === "all" ? "var(--bg-elev-2)" : "var(--accent-soft)",
                  color: sectorF === "all" ? "var(--text-muted)" : "var(--accent)", border: "0.5px solid " + (sectorF === "all" ? "var(--border)" : "rgba(158,154,229,0.35)"),
                  cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 500, appearance: "none", WebkitAppearance: "none", outline: "none" }}>
                <option value="all">Todos los sectores</option>
                {sectors.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <Icon name="chevron" size={12} style={{ position: "absolute", right: 10, pointerEvents: "none", color: "var(--text-subtle)" }}/>
            </div>
          )}
          <div className="outreach-search" style={{ display: "flex", alignItems: "center", gap: 8, height: 34, padding: "0 12px", borderRadius: 9, background: "var(--bg-elev-2)", border: "0.5px solid var(--border)" }}>
            <Icon name="search" size={14} style={{ color: "var(--text-subtle)" }}/>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar…" style={inputStyle}/>
          </div>
          <button onClick={() => setModal({ presetCat: type !== "all" ? type : "" })}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(158,154,229,0.28)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--accent-soft)"}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 34, padding: "0 14px", borderRadius: 9,
              background: "var(--accent-soft)", color: "var(--accent)", border: "1px solid rgba(158,154,229,0.3)",
              cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", transition: "background .15s" }}>
            <Icon name="plus" size={14}/> Añadir recurso
          </button>
        </div>
      </div>

      {/* Pestañas de categoría con subrayado deslizante */}
      <div className="tabs tabs-slide" ref={tabsRef}>
        {tabItems.map(t => (
          <div key={t.id} className={"tab" + (type === t.id ? " active" : "")} onClick={e => pickTab(t.id, e.currentTarget)}>
            {t.label}{t.count != null ? <span className="count">{t.count}</span> : null}
          </div>
        ))}
        <span className="tab-underline" style={{ width: indic.width, transform: `translateX(${indic.left}px)` }}/>
      </div>

      {rows.length === 0 ? (
        <div style={{ padding: "48px 0" }}>
          <Empty icon="sparkles" title={all.length === 0 ? "Tu biblioteca está vacía" : "Sin resultados"}
            sub={all.length === 0 ? "Guarda tu primer enlace con «Añadir recurso»." : "Prueba con otra búsqueda o categoría."}/>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 14, marginTop: 6, alignItems: "stretch" }}>
          {rows.map(r => <ResourceCard key={r.id} r={r} D={D} onEdit={setModal}/>)}
        </div>
      )}

      {modal && <ResourceModal initial={modal} sectors={sectors} categories={categories} onClose={() => setModal(null)}/>}
    </div>
  );
};

window.AgencyResources = AgencyResources;

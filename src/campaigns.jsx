// Campañas v2 — 100% real (leads de Claude Cowork vía backend), diseño
// alineado con el resto de la app: header fijo, filas planas, mini-stats.

// ── Datos ─────────────────────────────────────────────────────────────
const useCampaigns = () => {
  const [camps, setCamps] = useState(null);   // null = cargando · [] = vacío
  const reload = async () => {
    try {
      const r = await window.apiFetch("/api/campaigns/data");
      const j = await r.json();
      setCamps(j && j.ok ? (j.campaigns || []) : []);
    } catch (e) { setCamps([]); }
  };
  useEffect(() => { reload(); }, []);
  return [camps, reload];
};

const LEAD_STATUS = {
  new:       { label:"Nuevo",      color:"var(--text-muted)", dot:"rgba(255,255,255,0.35)" },
  contacted: { label:"Contactado", color:"#60a5fa",           dot:"#60a5fa" },
  replied:   { label:"Respondió",  color:"var(--green)",      dot:"var(--green)" },
  won:       { label:"Ganado",     color:"var(--accent)",     dot:"var(--accent)" },
  discarded: { label:"Descartado", color:"var(--text-subtle)",dot:"rgba(255,255,255,0.18)" },
};
const STATUS_ORDER = ["new", "contacted", "replied", "won", "discarded"];

// Tipos de campaña — se eligen al crearla
const CTYPES = {
  email:  { label:"Correo",         icon:"mail",       hint:"Outreach por email" },
  meta:   { label:"Meta Ads",       icon:"megaphone",  hint:"Facebook / Instagram Ads" },
  google: { label:"Google Ads",     icon:"trending-up",hint:"Search / Performance Max" },
  cowork: { label:"Prospección IA", icon:"sparkles",   hint:"Leads diarios de Claude Cowork" },
  otro:   { label:"Otra",           icon:"tag",        hint:"Campaña genérica" },
};
const _ctype = (c) => CTYPES[c.ctype] || CTYPES.cowork;

// ── Parser CSV (delimitador , o ; con comillas) ──────────────────────
const parseCSV = (text) => {
  const firstLine = (text.split(/\r?\n/)[0] || "");
  const delim = firstLine.split(";").length > firstLine.split(",").length ? ";" : ",";
  const rows = []; let row = [], cur = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"') { if (text[i+1] === '"') { cur += '"'; i++; } else inQ = false; }
      else cur += ch;
    }
    else if (ch === '"') inQ = true;
    else if (ch === delim) { row.push(cur); cur = ""; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i+1] === '\n') i++;
      row.push(cur); cur = "";
      if (row.some(c => c.trim() !== "")) rows.push(row);
      row = [];
    }
    else cur += ch;
  }
  row.push(cur);
  if (row.some(c => c.trim() !== "")) rows.push(row);
  return rows;
};

// Mapea cabeceras del CSV a campos del lead (ES/EN)
const CSV_FIELDS = {
  name:    ["name","nombre","contacto","lead","persona"],
  company: ["company","empresa","negocio","marca","compañia","compañía"],
  email:   ["email","correo","e-mail","mail"],
  phone:   ["phone","telefono","teléfono","tel","movil","móvil"],
  website: ["website","web","url","dominio","sitio","pagina","página"],
  sector:  ["sector","industria","categoria","categoría","nicho","tipo"],
  audit:   ["audit","auditoria","auditoría","notas","nota","observaciones"],
  subject: ["subject","asunto"],
  draft:   ["draft","borrador","mensaje","cuerpo"],
};
const csvToLeads = (text) => {
  const rows = parseCSV(text);
  if (!rows.length) return [];
  const header = rows[0].map(h => h.trim().toLowerCase());
  const colMap = {};   // índice de columna → campo
  let matched = 0;
  header.forEach((h, i) => {
    for (const [field, aliases] of Object.entries(CSV_FIELDS)) {
      if (aliases.includes(h)) { colMap[i] = field; matched++; break; }
    }
  });
  // Sin cabecera reconocible: asumimos orden nombre,empresa,email,telefono,web
  const dataRows = matched >= 2 ? rows.slice(1) : rows;
  const defaultOrder = ["name","company","email","phone","website","sector"];
  return dataRows.map(r => {
    const lead = {};
    r.forEach((cell, i) => {
      const field = matched >= 2 ? colMap[i] : defaultOrder[i];
      if (field && cell && cell.trim()) lead[field] = cell.trim();
    });
    return lead;
  }).filter(l => l.name || l.company);
};

const _cToday = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;
};
const _cFmtDay = (ds) => {
  if (!ds) return "—";
  if (ds === _cToday()) return "Hoy";
  return new Date(ds + "T00:00:00").toLocaleDateString("es-ES", { day:"numeric", month:"short" });
};

// ── Piezas pequeñas ───────────────────────────────────────────────────
const CampMiniStat = ({ label, value, sub, color }) => (
  <div style={{ flex:1, minWidth:0 }}>
    <div style={{ fontSize:11, textTransform:"uppercase", letterSpacing:"0.07em", color:"var(--text-subtle)", marginBottom:6 }}>{label}</div>
    <div style={{ fontSize:24, fontWeight:600, fontFamily:"var(--font-display)", letterSpacing:"-0.5px", color: color || "var(--text)" }}>{value}</div>
    {sub && <div style={{ fontSize:11.5, color:"var(--text-muted)", marginTop:3, letterSpacing:"-0.2px" }}>{sub}</div>}
  </div>
);

// Selector de estado — pill con punto de color y menú propio (nada de <select> nativo)
const LeadStatusPill = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);
  const st = LEAD_STATUS[value] || LEAD_STATUS.new;
  return (
    <div style={{ position:"relative" }} onClick={e => e.stopPropagation()}>
      <button onClick={() => setOpen(o => !o)} style={{
        display:"inline-flex", alignItems:"center", gap:7,
        padding:"5px 12px", borderRadius:99, cursor:"pointer",
        background:"rgba(255,255,255,0.04)", border:"0.5px solid var(--border)",
        color: st.color, fontSize:12, letterSpacing:"-0.2px", fontFamily:"inherit",
        transition:"background .1s",
      }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}>
        <span style={{ width:6, height:6, borderRadius:"50%", background:st.dot, flexShrink:0 }}/>
        {st.label}
        <Icon name="chevron-down" size={11} style={{ opacity:0.5 }}/>
      </button>
      {open && (
        <div style={{
          position:"absolute", right:0, top:"calc(100% + 6px)", zIndex:60, minWidth:160,
          background:"#1a1a1c", border:"0.5px solid rgba(255,255,255,0.1)",
          borderRadius:12, padding:5, boxShadow:"0 8px 32px rgba(0,0,0,0.5)",
        }}>
          {STATUS_ORDER.map(k => {
            const s = LEAD_STATUS[k];
            return (
              <button key={k} onClick={() => { setOpen(false); onChange(k); }} style={{
                display:"flex", alignItems:"center", gap:9, width:"100%",
                padding:"8px 10px", borderRadius:8, cursor:"pointer", textAlign:"left",
                background: k === value ? "rgba(255,255,255,0.06)" : "transparent",
                border:0, color:s.color, fontSize:12.5, fontFamily:"inherit",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
                onMouseLeave={e => e.currentTarget.style.background = k === value ? "rgba(255,255,255,0.06)" : "transparent"}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:s.dot }}/>
                {s.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Gráfico de área estilo outdomode: curva suave con tangentes horizontales,
// borde morado 3px, degradado que se desvanece y referencias punteadas.
let _sparkGradSeq = 0;
const LeadsSpark = ({ leads, days: nDays = 14, height = 192 }) => {
  const gradId = useRef(null);
  if (!gradId.current) gradId.current = "leadsGrad" + (++_sparkGradSeq);

  const days = Array.from({ length: nDays }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (nDays - 1 - i));
    const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    return { ds, v: leads.filter(x => x.date === ds).length, lab: d.getDate() };
  });
  const max = Math.max(...days.map(d => d.v), 1);

  // Geometría (mismo layout que el original: 818×192, área de 5 a 137)
  const W = 818, H = height, padL = 20, padR = 20, top = 5, base = H - 55;
  const n = days.length;
  const X = (i) => padL + i * (W - padL - padR) / (n - 1);
  const Y = (v) => base - (v / max) * (base - top);

  // Curva con puntos de control en 1/3 y 2/3 del tramo (tangentes horizontales)
  let curve = `M${X(0).toFixed(1)},${Y(days[0].v).toFixed(1)}`;
  for (let i = 1; i < n; i++) {
    const x0 = X(i - 1), x1 = X(i), y0 = Y(days[i - 1].v), y1 = Y(days[i].v);
    const g = (x1 - x0) / 3;
    curve += `C${(x0 + g).toFixed(1)},${y0.toFixed(1)},${(x0 + 2 * g).toFixed(1)},${y1.toFixed(1)},${x1.toFixed(1)},${y1.toFixed(1)}`;
  }
  const area = curve + `L${X(n - 1).toFixed(1)},${base}L${X(0).toFixed(1)},${base}Z`;

  // 5 líneas de referencia + ~7 etiquetas del eje X
  const refYs = [0, 0.25, 0.5, 0.75, 1].map(t => base - t * (base - top));
  const tickEvery = Math.max(1, Math.round((n - 1) / 6));
  const ticks = days.map((d, i) => ({ ...d, i })).filter((d, i) => i % tickEvery === 0 || i === n - 1);

  const P = "#8277db";  // primary-600 de outdomode

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:"auto", display:"block" }}>
      <defs>
        <linearGradient id={gradId.current} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={P} stopOpacity="0.3"/>
          <stop offset="95%" stopColor={P} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {refYs.map((y, i) => (
        <line key={i} x1={padL} y1={y} x2={W - padR} y2={y}
          stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" strokeWidth="1"/>
      ))}
      <path d={area} fill={`url(#${gradId.current})`} stroke="none"/>
      <path d={curve} fill="none" stroke={P} strokeWidth="3"/>
      {ticks.map(t => (
        <text key={t.i} x={X(t.i)} y={base + 18} textAnchor="middle" fontSize="12"
          fill="var(--text-muted)" fontFamily="var(--font-sans)">{t.lab}</text>
      ))}
    </svg>
  );
};

// Barras horizontales genéricas (embudo, sectores, orígenes)
const HBars = ({ items, total }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
    {items.map((it, i) => (
      <div key={i} style={{ display:"flex", alignItems:"center", gap:12 }}>
        <span style={{ fontSize:12.5, color:"var(--text-muted)", width:110, flexShrink:0, letterSpacing:"-0.2px",
          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{it.label}</span>
        <div style={{ flex:1, height:6, borderRadius:99, background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
          <div style={{ width: total ? `${(it.v / total) * 100}%` : 0, height:"100%",
            background: it.color || "var(--accent)", borderRadius:99, transition:"width .25s" }}/>
        </div>
        <span style={{ fontSize:12.5, fontWeight:600, color:"var(--text)", width:34, textAlign:"right", flexShrink:0 }}>{it.v}</span>
        <span style={{ fontSize:11, color:"var(--text-subtle)", width:38, textAlign:"right", flexShrink:0 }}>
          {total ? Math.round((it.v / total) * 100) : 0}%
        </span>
      </div>
    ))}
  </div>
);

// Bloque de analíticas (sección propia, todo real)
const CampaignAnalytics = ({ c }) => {
  const leads = c.leads || [];
  const today = _cToday();
  const nStatus = (s) => leads.filter(l => l.status === s).length;
  const contacted = nStatus("contacted") + nStatus("replied") + nStatus("won");
  const replied   = nStatus("replied") + nStatus("won");
  const won       = nStatus("won");

  if (!leads.length) return (
    <div style={{ textAlign:"center", padding:"70px 0", color:"var(--text-subtle)", fontSize:13.5, letterSpacing:"-0.3px" }}>
      Sin datos todavía — las analíticas aparecen cuando la campaña tiene leads.
    </div>
  );

  // Días con actividad → media y mejor día
  const byDay = {};
  leads.forEach(l => { if (l.date) byDay[l.date] = (byDay[l.date] || 0) + 1; });
  const dayEntries = Object.entries(byDay).sort((a, b) => b[1] - a[1]);
  const bestDay = dayEntries[0];
  const activeDays = dayEntries.length || 1;
  const avg = (leads.length / activeDays).toFixed(1).replace(".0", "");

  // Sectores (top 6)
  const bySector = {};
  leads.forEach(l => { const s = (l.sector || "Sin sector").trim(); bySector[s] = (bySector[s] || 0) + 1; });
  const sectors = Object.entries(bySector).sort((a, b) => b[1] - a[1]).slice(0, 6)
    .map(([label, v]) => ({ label, v }));

  // Orígenes
  const SRC = { cowork:"Claude Cowork", csv:"CSV", manual:"A mano", api:"API" };
  const bySrc = {};
  leads.forEach(l => { const s = SRC[l.source] || "Claude Cowork"; bySrc[s] = (bySrc[s] || 0) + 1; });
  const sources = Object.entries(bySrc).sort((a, b) => b[1] - a[1])
    .map(([label, v]) => ({ label, v, color:"rgba(158,154,229,0.65)" }));

  const funnel = [
    { label:"Nuevos",       v:nStatus("new"),       color:"rgba(255,255,255,0.3)" },
    { label:"Contactados",  v:nStatus("contacted"), color:"#60a5fa" },
    { label:"Respondieron", v:nStatus("replied"),   color:"var(--green)" },
    { label:"Ganados",      v:won,                  color:"var(--accent)" },
    { label:"Descartados",  v:nStatus("discarded"), color:"rgba(255,255,255,0.14)" },
  ];

  const cardStyle = { background:"var(--bg-elev-1)", border:"0.5px solid var(--border)", borderRadius:16, padding:"18px 20px" };
  const cardTitle = { fontSize:11, textTransform:"uppercase", letterSpacing:"0.07em", color:"var(--text-subtle)", marginBottom:14 };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16, paddingBottom:24 }}>
      {/* KPIs */}
      <div style={{ display:"flex", gap:26, padding:"4px 2px 16px", borderBottom:"0.5px solid var(--border)" }}>
        <CampMiniStat label="Leads" value={leads.length} sub={`media ${avg}/día`}/>
        <CampMiniStat label="Contactados" value={contacted} sub={`${Math.round((contacted/leads.length)*100)}% del total`} color="#60a5fa"/>
        <CampMiniStat label="Respuestas" value={replied} sub={contacted ? `${Math.round((replied/contacted)*100)}% de contactados` : "—"} color="var(--green)"/>
        <CampMiniStat label="Ganados" value={won} sub={leads.length ? `${Math.round((won/leads.length)*100)}% de cierre` : "—"} color="var(--accent)"/>
        <CampMiniStat label="Mejor día" value={bestDay ? bestDay[1] : "—"}
          sub={bestDay ? new Date(bestDay[0] + "T00:00:00").toLocaleDateString("es-ES",{day:"numeric",month:"short"}) : ""}/>
      </div>

      {/* Objetivo de la campaña (si está definido) */}
      {c.goal > 0 && (
        <div style={cardStyle}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:12 }}>
            <div style={cardTitle}>Objetivo · clientes cerrados</div>
            <div style={{ fontSize:13, color:"var(--text-muted)" }}>
              <b style={{ color:"var(--accent)", fontSize:16 }}>{won}</b> / {c.goal}
              {won >= c.goal && <span style={{ color:"var(--green)", marginLeft:8 }}>¡Conseguido! 🎉</span>}
            </div>
          </div>
          <div style={{ height:8, borderRadius:99, background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
            <div style={{ width:`${Math.min(100, (won / c.goal) * 100)}%`, height:"100%",
              background: won >= c.goal ? "var(--green)" : "var(--accent)", borderRadius:99, transition:"width .3s" }}/>
          </div>
        </div>
      )}

      {/* Leads por día — 30 días */}
      <div style={cardStyle}>
        <div style={cardTitle}>Leads recibidos · últimos 30 días</div>
        <LeadsSpark leads={leads} days={30}/>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {/* Embudo */}
        <div style={cardStyle}>
          <div style={cardTitle}>Embudo</div>
          <HBars items={funnel} total={leads.length}/>
        </div>
        {/* Sectores */}
        <div style={cardStyle}>
          <div style={cardTitle}>Por sector</div>
          <HBars items={sectors} total={leads.length}/>
        </div>
      </div>

      {/* Orígenes */}
      <div style={cardStyle}>
        <div style={cardTitle}>Origen de los leads</div>
        <HBars items={sources} total={leads.length}/>
      </div>
    </div>
  );
};

// Bloque de ajustes de la campaña
const CampaignSettings = ({ c, reload, onRemove, onCSV, onManual, onCowork }) => {
  const toast = useToast();
  const [name, setName]   = useState(c.name);
  const [ctype, setCtype] = useState(c.ctype || "cowork");
  const [goal, setGoal]   = useState(String(c.goal || ""));
  useEffect(() => { setName(c.name); setCtype(c.ctype || "cowork"); setGoal(String(c.goal || "")); }, [c.id]);
  const dirty = name.trim() !== c.name || ctype !== (c.ctype || "cowork") || (parseInt(goal || 0, 10) || 0) !== (c.goal || 0);

  const save = async () => {
    if (!name.trim()) { toast("El nombre no puede quedar vacío", "warn"); return; }
    const r = await window.apiFetch("/api/campaigns/update", { campaignId: c.id, name: name.trim(), ctype, goal: parseInt(goal || 0, 10) || 0 });
    const j = await r.json();
    if (!j.ok) { toast(j.error || "No se pudo guardar", "warn"); return; }
    toast("Campaña actualizada", "success");
    reload();
  };

  const cardStyle = { background:"var(--bg-elev-1)", border:"0.5px solid var(--border)", borderRadius:16, padding:"20px 22px" };
  const cardTitle = { fontSize:11, textTransform:"uppercase", letterSpacing:"0.07em", color:"var(--text-subtle)", marginBottom:14 };
  const conns = [
    { icon:"upload",   label:"Importar CSV",        sub:"Sube una lista de leads.",        onClick:onCSV },
    { icon:"plus",     label:"Añadir lead a mano",  sub:"Un contacto suelto.",             onClick:onManual },
    { icon:"sparkles", label:"Conectar Claude Cowork", sub:"Leads automáticos cada día.",  onClick:onCowork },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16, maxWidth:640, paddingBottom:24 }}>
      {/* General */}
      <div style={cardStyle}>
        <div style={cardTitle}>General</div>
        <div className="label">Nombre de la campaña</div>
        <input className="input" value={name} onChange={e => setName(e.target.value)} style={{ marginBottom:14 }}/>
        <div className="label">Tipo</div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {Object.entries(CTYPES).map(([id, t]) => {
            const on = ctype === id;
            return (
              <button key={id} onClick={() => setCtype(id)} style={{
                display:"inline-flex", alignItems:"center", gap:6,
                padding:"7px 14px", borderRadius:99, cursor:"pointer", fontFamily:"inherit",
                background: on ? "rgba(158,154,229,0.14)" : "rgba(255,255,255,0.04)",
                border: on ? "0.5px solid rgba(158,154,229,0.45)" : "0.5px solid var(--border)",
                color: on ? "var(--accent)" : "var(--text-muted)",
                fontSize:12.5, letterSpacing:"-0.2px", transition:"all .12s",
              }}>
                <Icon name={t.icon} size={12} strokeWidth={1.7}/>
                {t.label}
              </button>
            );
          })}
        </div>
        <div className="label" style={{ marginTop:16 }}>Objetivo · clientes a cerrar <span style={{ color:"var(--text-subtle)" }}>(opcional)</span></div>
        <input className="input" type="number" min="0" placeholder="Ej. 10" value={goal}
          onChange={e => setGoal(e.target.value)} style={{ maxWidth:160 }}/>
        {dirty && (
          <div style={{ marginTop:16 }}>
            <button className="btn primary sm" onClick={save}><Icon name="check" size={12}/> Guardar cambios</button>
          </div>
        )}
      </div>

      {/* Fuentes de leads */}
      <div style={cardStyle}>
        <div style={cardTitle}>Fuentes de leads</div>
        <div style={{ display:"flex", flexDirection:"column" }}>
          {conns.map((cn, i) => (
            <div key={i} onClick={cn.onClick} className="task-row" style={{
              display:"flex", alignItems:"center", gap:12, padding:"11px 2px", cursor:"pointer",
              borderBottom: i === conns.length - 1 ? "none" : "0.5px solid var(--border)",
            }}>
              <div style={{ width:32, height:32, borderRadius:9, background:"rgba(255,255,255,0.05)",
                border:"0.5px solid var(--border)", display:"grid", placeItems:"center", color:"var(--text-muted)", flexShrink:0 }}>
                <Icon name={cn.icon} size={14} strokeWidth={1.7}/>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13.5, color:"var(--text)", letterSpacing:"-0.3px" }}>{cn.label}</div>
                <div style={{ fontSize:11.5, color:"var(--text-subtle)", marginTop:1 }}>{cn.sub}</div>
              </div>
              <Icon name="chevron-right" size={13} style={{ color:"rgba(255,255,255,0.18)" }}/>
            </div>
          ))}
        </div>
      </div>

      {/* Zona de peligro */}
      <div style={{ ...cardStyle, borderColor:"rgba(220,91,93,0.25)" }}>
        <div style={cardTitle}>Zona de peligro</div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:14 }}>
          <div style={{ fontSize:12.5, color:"var(--text-muted)", lineHeight:1.55 }}>
            Eliminar la campaña borra también todos sus leads. No se puede deshacer.
          </div>
          <button className="btn sm" onClick={onRemove}
            style={{ color:"var(--red)", borderColor:"rgba(220,91,93,0.4)", flexShrink:0 }}>
            <Icon name="trash" size={12}/> Eliminar campaña
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Fila de lead + panel expandible ──────────────────────────────────
const LeadRow = ({ l, last, open, onToggle, onStatus, onDelete, onCopy, onSave }) => {
  const st = LEAD_STATUS[l.status] || LEAD_STATUS.new;
  const KEYS = ["name","company","email","phone","website","sector","notes","followUp"];
  const [f, setF] = useState({});
  useEffect(() => {
    if (open) { const o = {}; KEYS.forEach(k => o[k] = l[k] || ""); setF(o); }
  }, [open, l.id]);
  const set = (k) => (e) => setF(prev => ({ ...prev, [k]: e.target.value }));
  const dirty = KEYS.some(k => (f[k] || "") !== (l[k] || ""));
  const hasCowork = l.audit || l.draft || l.subject;

  const followBadge = l.followUp && l.followUp >= _cToday();
  const field = (label, k, ph, type) => (
    <div>
      <div style={{ fontSize:10.5, textTransform:"uppercase", letterSpacing:"0.06em", color:"var(--text-subtle)", marginBottom:5 }}>{label}</div>
      <input className="input" type={type || "text"} placeholder={ph} value={f[k] || ""} onChange={set(k)}
        onClick={e => e.stopPropagation()}
        style={{ padding:"8px 11px", fontSize:12.5 }}/>
    </div>
  );

  return (
    <>
      <div onClick={onToggle} className="task-row" style={{
        display:"flex", alignItems:"center", gap:14,
        padding:"13px 4px", cursor:"pointer",
        borderBottom: (last && !open) ? "none" : "0.5px solid var(--border)",
      }}>
        <span style={{ width:7, height:7, borderRadius:"50%", background:st.dot, flexShrink:0 }}/>
        <div style={{ flex:"1.4 1 0", minWidth:0 }}>
          <div style={{ fontSize:14, letterSpacing:"-0.4px", color:"var(--text)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", display:"flex", alignItems:"center", gap:7 }}>
            {l.name}
            {followBadge && <Icon name="clock" size={11} style={{ color:"var(--accent)", flexShrink:0 }} data-tooltip={`Seguimiento ${_cFmtDay(l.followUp)}`}/>}
          </div>
          <div style={{ fontSize:11.5, color:"var(--text-subtle)", marginTop:2, letterSpacing:"-0.2px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            {l.company || "—"}{l.sector ? ` · ${l.sector}` : ""}
          </div>
        </div>
        <div style={{ flex:"1 1 0", minWidth:0, fontSize:12, color:"var(--text-muted)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
          {l.email || l.website || "—"}
        </div>
        <div style={{ width:52, fontSize:12, color:"var(--text-subtle)", textAlign:"right", flexShrink:0 }}>
          {_cFmtDay(l.date)}
        </div>
        <LeadStatusPill value={l.status} onChange={onStatus}/>
        <Icon name="chevron-down" size={13} style={{
          color:"rgba(255,255,255,0.2)", flexShrink:0,
          transform: open ? "rotate(180deg)" : "none", transition:"transform .15s",
        }}/>
      </div>

      {open && (
        <div onClick={e => e.stopPropagation()} style={{
          margin:"0 0 14px", padding:"18px 20px",
          background:"var(--bg-elev-1)", border:"0.5px solid var(--border)", borderRadius:14,
        }}>
          {/* Datos de contacto editables */}
          <div style={{ fontSize:11, textTransform:"uppercase", letterSpacing:"0.07em", color:"var(--text-subtle)", marginBottom:12, display:"flex", alignItems:"center", gap:6 }}>
            <Icon name="user-cog" size={12}/> Datos del lead
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:12 }}>
            {field("Nombre", "name", "Nombre")}
            {field("Empresa", "company", "Empresa")}
            {field("Sector", "sector", "Sector")}
            {field("Email", "email", "email@…", "email")}
            {field("Teléfono", "phone", "+34 …")}
            {field("Web", "website", "empresa.com")}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:12, marginBottom:6 }}>
            <div>
              <div style={{ fontSize:10.5, textTransform:"uppercase", letterSpacing:"0.06em", color:"var(--text-subtle)", marginBottom:5 }}>Notas</div>
              <textarea className="input" rows={2} placeholder="Notas internas, contexto de la llamada…"
                value={f.notes || ""} onChange={set("notes")} onClick={e => e.stopPropagation()}
                style={{ padding:"8px 11px", fontSize:12.5, resize:"vertical", lineHeight:1.5 }}/>
            </div>
            {field("Próximo seguimiento", "followUp", "", "date")}
          </div>
          {dirty && (
            <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:8 }}>
              <button className="btn primary sm" onClick={e => { e.stopPropagation(); onSave(f); }}>
                <Icon name="check" size={12}/> Guardar cambios
              </button>
            </div>
          )}

          {/* Auditoría + Borrador (de Cowork) */}
          {hasCowork && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:22, marginTop:8, paddingTop:16, borderTop:"0.5px solid var(--border)" }}>
              <div>
                <div style={{ fontSize:11, textTransform:"uppercase", letterSpacing:"0.07em", color:"var(--text-subtle)", marginBottom:10, display:"flex", alignItems:"center", gap:6 }}>
                  <Icon name="search" size={11}/> Auditoría
                </div>
                <div style={{ fontSize:13, lineHeight:1.65, color:"var(--text-muted)", whiteSpace:"pre-wrap" }}>
                  {l.audit || "Sin auditoría."}
                </div>
              </div>
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <div style={{ fontSize:11, textTransform:"uppercase", letterSpacing:"0.07em", color:"var(--text-subtle)", display:"flex", alignItems:"center", gap:6 }}>
                    <Icon name="mail" size={11}/> Borrador del mensaje
                  </div>
                  <button className="btn ghost sm" onClick={e => { e.stopPropagation(); onCopy(); }}>
                    <Icon name="file" size={11}/> Copiar
                  </button>
                </div>
                {l.subject && <div style={{ fontSize:13.5, fontWeight:600, color:"var(--text)", marginBottom:8, letterSpacing:"-0.3px" }}>{l.subject}</div>}
                <div style={{ fontSize:13, lineHeight:1.65, color:"var(--text-muted)", whiteSpace:"pre-wrap" }}>
                  {l.draft || "Sin borrador."}
                </div>
              </div>
            </div>
          )}

          {/* Pie: eliminar */}
          <div style={{ display:"flex", justifyContent:"flex-end", marginTop:14, paddingTop:12, borderTop:"0.5px solid var(--border)" }}>
            <button className="btn ghost sm" onClick={e => { e.stopPropagation(); onDelete(); }}
              style={{ color:"var(--red)" }}>
              <Icon name="trash" size={12}/> Eliminar lead
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// ── Importar CSV (hook: input file oculto + subida) ──────────────────
const useCSVImport = (campaignId, onDone) => {
  const toast = useToast();
  const inputRef = useRef(null);
  const pick = () => inputRef.current && inputRef.current.click();
  const onFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    const text = await file.text();
    const leads = csvToLeads(text);
    if (!leads.length) { toast("No se encontraron leads en el CSV", "warn"); return; }

    // Subida por lotes: el servidor acepta 500/petición (y 1 MB de payload),
    // así que troceamos y agregamos los resultados — CSVs de cualquier tamaño.
    const CHUNK = 200;
    let added = 0, skipped = 0;
    if (leads.length > CHUNK) toast(`Importando ${leads.length} leads…`, "info");
    for (let i = 0; i < leads.length; i += CHUNK) {
      const r = await window.apiFetch("/api/campaigns/import_leads",
        { campaignId, leads: leads.slice(i, i + CHUNK), source:"csv" });
      const j = await r.json();
      if (!j.ok) {
        toast(`${j.error || "Error al importar"}${added ? ` — ${added} ya importados` : ""}`, "warn");
        if (added) onDone && onDone();
        return;
      }
      added += j.added; skipped += j.skipped;
    }
    toast(`${added} leads importados${skipped ? ` · ${skipped} duplicados omitidos` : ""}`, "success");
    onDone && onDone();
  };
  const input = <input ref={inputRef} type="file" accept=".csv,text/csv" onChange={onFile} style={{ display:"none" }}/>;
  return [pick, input];
};

// ── Modal: añadir lead a mano ─────────────────────────────────────────
const AddLeadModal = ({ open, onClose, campaignId, onDone }) => {
  const toast = useToast();
  const empty = { name:"", company:"", email:"", phone:"", website:"", sector:"" };
  const [f, setF] = useState(empty);
  useEffect(() => { if (open) setF(empty); }, [open]);
  const set = (k) => (e) => setF(prev => ({ ...prev, [k]: e.target.value }));
  const submit = async () => {
    if (!f.name.trim() && !f.company.trim()) { toast("Pon al menos el nombre o la empresa", "warn"); return; }
    const r = await window.apiFetch("/api/campaigns/import_leads", { campaignId, leads:[f], source:"manual" });
    const j = await r.json();
    if (!j.ok) { toast(j.error || "No se pudo añadir", "warn"); return; }
    toast(j.added ? "Lead añadido" : "Ese lead ya existía", j.added ? "success" : "warn");
    onClose(); onDone && onDone();
  };
  // Función normal (no componente): evita remontar los inputs en cada tecla
  const field = (label, k, placeholder, type) => (
    <div>
      <div className="label">{label}</div>
      <input className="input" type={type || "text"} placeholder={placeholder}
        value={f[k]} onChange={set(k)}/>
    </div>
  );
  return (
    <Modal open={open} onClose={onClose} title="Añadir lead" sub="Un contacto suelto para esta campaña."
      footer={<>
        <button className="btn" onClick={onClose}>Cancelar</button>
        <button className="btn primary" onClick={submit}><Icon name="plus" size={12}/> Añadir lead</button>
      </>}>
      <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
        {field("Nombre", "name", "Ej. María López")}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {field("Empresa", "company", "Ej. Joyas Alba")}
          {field("Sector", "sector", "Ej. joyería")}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {field("Email", "email", "hola@empresa.com", "email")}
          {field("Teléfono", "phone", "+34 …")}
        </div>
        {field("Web", "website", "empresa.com")}
      </div>
    </Modal>
  );
};

// ── Modal: conectar con Claude Cowork ─────────────────────────────────
const CoworkConnectModal = ({ open, onClose, campaignName }) => {
  const toast = useToast();
  const copyName = () => navigator.clipboard.writeText(campaignName)
    .then(() => toast("Nombre copiado", "success")).catch(() => {});
  return (
    <Modal open={open} onClose={onClose} title="Conectar Claude Cowork"
      sub="Que tu tarea diaria de Cowork llene esta campaña sola.">
      <div style={{ display:"flex", flexDirection:"column", gap:16, fontSize:13, lineHeight:1.65, color:"var(--text-muted)" }}>
        <div>
          En tu tarea programada de Cowork ya tienes el paso final que envía los leads a
          <code style={{ color:"var(--text)", background:"rgba(255,255,255,0.06)", padding:"1px 7px", borderRadius:6, margin:"0 4px" }}>/api/campaigns/import</code>
          con tu clave API. Para que caigan <b style={{ color:"var(--text)" }}>en esta campaña</b>, usa exactamente este nombre en el campo <code style={{ color:"var(--accent)" }}>campaign</code>:
        </div>
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between", gap:12,
          background:"var(--bg-elev-2)", border:"0.5px solid var(--border)",
          borderRadius:12, padding:"12px 16px",
        }}>
          <code style={{ fontSize:14, color:"var(--accent)", letterSpacing:"-0.2px" }}>"{campaignName}"</code>
          <button className="btn ghost sm" onClick={copyName}><Icon name="file" size={11}/> Copiar</button>
        </div>
        <div style={{ fontSize:12, color:"var(--text-subtle)" }}>
          Si la campaña no existe cuando llegue la primera importación, se crea sola con ese nombre.
          Los duplicados (mismo email o nombre+empresa) se descartan automáticamente.
        </div>
      </div>
    </Modal>
  );
};

// ── Panel de conexión (campaña sin leads) ─────────────────────────────
const ConnectPanel = ({ onCSV, onManual, onCowork }) => {
  const cards = [
    { icon:"upload",   title:"Importar CSV",        sub:"Sube una lista con columnas como nombre, empresa, email, teléfono o web.", onClick:onCSV },
    { icon:"sparkles", title:"Conectar Claude Cowork", sub:"Tu tarea diaria de prospección llena esta campaña automáticamente.", onClick:onCowork, accent:true },
    { icon:"plus",     title:"Añadir a mano",       sub:"Mete un lead suelto con sus datos básicos.", onClick:onManual },
  ];
  return (
    <div style={{ paddingTop:34 }}>
      <div style={{ textAlign:"center", marginBottom:26 }}>
        <div style={{ fontSize:15.5, fontWeight:500, color:"var(--text)", letterSpacing:"-0.4px" }}>Conecta tus leads</div>
        <div style={{ fontSize:12.5, color:"var(--text-subtle)", marginTop:5, letterSpacing:"-0.2px" }}>
          La campaña está vacía — elige cómo quieres llenarla.
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:14, maxWidth:860, margin:"0 auto" }}>
        {cards.map((c, i) => (
          <div key={i} onClick={c.onClick} style={{
            background: c.accent ? "rgba(158,154,229,0.07)" : "var(--bg-elev-1)",
            border: c.accent ? "0.5px solid rgba(158,154,229,0.35)" : "0.5px solid var(--border)",
            borderRadius:16, padding:"22px 20px", cursor:"pointer", textAlign:"center",
            transition:"border-color .15s, background .15s",
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(158,154,229,0.5)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = c.accent ? "rgba(158,154,229,0.35)" : "var(--border)"}>
            <div style={{
              width:42, height:42, borderRadius:12, margin:"0 auto 12px",
              background: c.accent ? "rgba(158,154,229,0.14)" : "rgba(255,255,255,0.05)",
              border:"0.5px solid var(--border)", display:"grid", placeItems:"center",
              color: c.accent ? "var(--accent)" : "var(--text-muted)",
            }}>
              <Icon name={c.icon} size={17} strokeWidth={1.7}/>
            </div>
            <div style={{ fontSize:13.5, fontWeight:500, color:"var(--text)", letterSpacing:"-0.3px" }}>{c.title}</div>
            <div style={{ fontSize:11.5, color:"var(--text-subtle)", marginTop:6, lineHeight:1.55, letterSpacing:"-0.1px" }}>{c.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Detalle de campaña ────────────────────────────────────────────────
const CampaignDetail = ({ campaignId, navigate, initialAction }) => {
  const [camps, reload] = useCampaigns();
  const toast   = useToast();
  const confirm = useConfirm();
  const [view, setView]       = useState("leads");   // leads | stats | config
  const [filter, setFilter]   = useState("all");
  const [query, setQuery]     = useState("");
  const [openId, setOpenId]   = useState(null);
  const [addingLead, setAddingLead]   = useState(false);
  const [coworkOpen, setCoworkOpen]   = useState(false);
  const [pickCSV, csvInput] = useCSVImport(campaignId, () => reload());
  const actionRan = useRef(false);

  // Si venimos del wizard con una fuente elegida, la abrimos automáticamente
  useEffect(() => {
    if (actionRan.current || camps === null || !initialAction) return;
    if (!camps.find(x => x.id === campaignId)) return;
    actionRan.current = true;
    if (initialAction === "csv") pickCSV();
    else if (initialAction === "manual") setAddingLead(true);
    else if (initialAction === "cowork") setCoworkOpen(true);
  }, [camps, initialAction]);

  if (camps === null) return (
    <div style={{ padding:"60px 32px", textAlign:"center", color:"var(--text-subtle)", fontSize:13 }}>Cargando…</div>
  );
  const c = camps.find(x => x.id === campaignId);
  if (!c) return <Empty icon="megaphone" title="Campaña no encontrada" sub="Vuelve a la lista de campañas."/>;
  const ct = _ctype(c);

  const leads = [...(c.leads || [])].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const today = _cToday();
  const nStatus  = (s) => leads.filter(l => l.status === s).length;
  const newToday  = leads.filter(l => l.date === today).length;
  const contacted = nStatus("contacted") + nStatus("replied") + nStatus("won");
  const replied   = nStatus("replied") + nStatus("won");
  const replyPct  = contacted ? Math.round((replied / contacted) * 100) : 0;

  const visible = leads.filter(l => {
    if (filter !== "all" && l.status !== filter) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return [l.name, l.company, l.email, l.website, l.sector]
        .some(v => (v || "").toLowerCase().includes(q));
    }
    return true;
  });

  const setStatus = async (l, status) => {
    try {
      await window.apiFetch("/api/campaigns/update_lead", { campaignId: c.id, leadId: l.id, status });
      reload();
    } catch (e) { toast("Error al guardar", "warn"); }
  };
  const saveLead = async (l, fields) => {
    try {
      const r = await window.apiFetch("/api/campaigns/update_lead", { campaignId: c.id, leadId: l.id, fields });
      const j = await r.json();
      if (!j.ok) { toast(j.error || "No se pudo guardar", "warn"); return; }
      toast("Lead actualizado", "success");
      reload();
    } catch (e) { toast("Error al guardar", "warn"); }
  };
  const exportCSV = () => {
    if (!leads.length) { toast("No hay leads que exportar", "warn"); return; }
    const cols = ["name","company","email","phone","website","sector","status","date","followUp","notes","subject","draft","audit"];
    const head = ["Nombre","Empresa","Email","Teléfono","Web","Sector","Estado","Fecha","Seguimiento","Notas","Asunto","Borrador","Auditoría"];
    const esc = (v) => { const s = (v == null ? "" : String(v)); return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const rows = leads.map(l => cols.map(k => esc(k === "status" ? (LEAD_STATUS[l.status] || {}).label : l[k])).join(","));
    const csv = head.join(",") + "\n" + rows.join("\n");
    const blob = new Blob(["﻿" + csv], { type:"text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${c.name.replace(/[^\w\-]+/g, "_")}_leads.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast(`${leads.length} leads exportados`, "success");
  };
  const removeLead = async (l) => {
    const ok = await confirm({ title:"¿Eliminar este lead?", body:`${l.name}${l.company ? " · " + l.company : ""} se eliminará de la campaña.`, danger:true, confirmLabel:"Eliminar" });
    if (!ok) return;
    await window.apiFetch("/api/campaigns/delete_lead", { campaignId: c.id, leadId: l.id });
    toast("Lead eliminado", "success");
    reload();
  };
  const removeCampaign = async () => {
    const ok = await confirm({ title:"¿Eliminar la campaña?", body:`Se eliminará "${c.name}" con sus ${leads.length} leads. No se puede deshacer.`, danger:true, confirmLabel:"Eliminar campaña" });
    if (!ok) return;
    await window.apiFetch("/api/campaigns/delete_campaign", { campaignId: c.id });
    navigate("campaigns");
  };
  const copyDraft = (l) => {
    const text = (l.subject ? `Asunto: ${l.subject}\n\n` : "") + (l.draft || "");
    navigator.clipboard.writeText(text)
      .then(() => toast("Borrador copiado", "success"))
      .catch(() => toast("No se pudo copiar", "warn"));
  };

  const FILTERS = [
    { id:"all", label:"Todos", n: leads.length },
    ...STATUS_ORDER.map(s => ({ id:s, label:LEAD_STATUS[s].label, n:nStatus(s) })),
  ];

  return (
    <div style={{
      height:"100vh", display:"flex", flexDirection:"column",
      padding:"28px 32px 0", maxWidth:1400, margin:"0 auto", overflow:"hidden",
    }}>
      {/* Header */}
      <div style={{ flexShrink:0 }}>
        <button className="btn ghost sm" onClick={() => navigate("campaigns")} style={{ marginBottom:14, marginLeft:-8 }}>
          <Icon name="chevron-left" size={13}/> Campañas
        </button>
        <div className="page-head" style={{ marginBottom:22 }}>
          <div>
            <h1>{c.name}</h1>
            <div className="sub" style={{ display:"flex", alignItems:"center", gap:7 }}>
              <Icon name={ct.icon} size={12} style={{ color:"var(--accent)" }}/>
              {ct.label} · desde {new Date(c.createdAt + "T00:00:00").toLocaleDateString("es-ES", { day:"numeric", month:"long", year:"numeric" })}
            </div>
          </div>
          <ActionPill
            plusActions={[
              { icon:"upload",   label:"Importar CSV",   sub:"Sube una lista de leads.",              onClick: pickCSV },
              { icon:"plus",     label:"Añadir lead",    sub:"Un contacto suelto, a mano.",           accent:true, onClick: () => setAddingLead(true) },
              { icon:"sparkles", label:"Conectar Cowork", sub:"Que la llene tu tarea diaria de IA.",  onClick: () => setCoworkOpen(true) },
            ]}
            moreActions={[
              { icon:"download", label:"Exportar CSV", onClick: exportCSV },
              { icon:"trash", label:"Eliminar campaña", onClick: removeCampaign },
            ]}
          />
        </div>

        {/* Secciones: Leads · Analíticas · Ajustes */}
        <div style={{ display:"flex", alignItems:"center", gap:6, paddingBottom:16, borderBottom:"0.5px solid var(--border)", marginBottom:16 }}>
          {[
            { id:"leads",  label:"Leads",      icon:"users" },
            { id:"stats",  label:"Analíticas", icon:"bar-chart" },
            { id:"config", label:"Ajustes",    icon:"settings" },
          ].map(t => {
            const on = view === t.id;
            return (
              <button key={t.id} onClick={() => setView(t.id)} style={{
                display:"inline-flex", alignItems:"center", gap:7,
                padding:"7px 15px", borderRadius:99, cursor:"pointer", fontFamily:"inherit",
                background: on ? "rgba(255,255,255,0.08)" : "transparent",
                border: on ? "0.5px solid rgba(255,255,255,0.14)" : "0.5px solid transparent",
                color: on ? "var(--text)" : "var(--text-subtle)",
                fontSize:13, letterSpacing:"-0.3px", fontWeight: on ? 500 : 400,
                transition:"all .12s",
              }}>
                <Icon name={t.icon} size={13} strokeWidth={1.7}/>
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Filtros + buscador (solo en Leads, con leads) */}
        {view === "leads" && leads.length > 0 && (
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
          {FILTERS.map(f => {
            const on = filter === f.id;
            return (
              <button key={f.id} onClick={() => setFilter(f.id)} style={{
                display:"inline-flex", alignItems:"center", gap:6,
                padding:"6px 13px", borderRadius:99, cursor:"pointer", fontFamily:"inherit",
                background: on ? "rgba(158,154,229,0.14)" : "rgba(255,255,255,0.04)",
                border: on ? "0.5px solid rgba(158,154,229,0.4)" : "0.5px solid var(--border)",
                color: on ? "var(--accent)" : "var(--text-muted)",
                fontSize:12.5, letterSpacing:"-0.2px", transition:"all .12s",
              }}>
                {f.label}
                <span style={{ fontSize:10.5, opacity:0.65 }}>{f.n}</span>
              </button>
            );
          })}
          <div style={{ flex:1 }}/>
          <div style={{ position:"relative" }}>
            <Icon name="search" size={13} style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:"var(--text-subtle)" }}/>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar lead…"
              style={{
                background:"rgba(255,255,255,0.04)", border:"0.5px solid var(--border)",
                borderRadius:99, padding:"7px 14px 7px 32px", fontSize:12.5,
                color:"var(--text)", outline:"none", width:190, fontFamily:"inherit",
                letterSpacing:"-0.2px",
              }}/>
          </div>
        </div>
        )}
      </div>

      {/* Contenido por sección */}
      <div className="tasks-scroll" style={{
        flex:1, minHeight:0, overflowY:"auto", scrollbarGutter:"stable",
        paddingRight:10, paddingTop:14, paddingBottom:8,
        WebkitMaskImage:"linear-gradient(to bottom, transparent 0, #000 16px, #000 calc(100% - 24px), transparent 100%)",
        maskImage:"linear-gradient(to bottom, transparent 0, #000 16px, #000 calc(100% - 24px), transparent 100%)",
      }}>
        {view === "stats" ? (
          <CampaignAnalytics c={c}/>
        ) : view === "config" ? (
          <CampaignSettings c={c} reload={reload} onRemove={removeCampaign}
            onCSV={pickCSV} onManual={() => setAddingLead(true)} onCowork={() => setCoworkOpen(true)}/>
        ) : leads.length === 0 ? (
          <ConnectPanel onCSV={pickCSV} onManual={() => setAddingLead(true)} onCowork={() => setCoworkOpen(true)}/>
        ) : visible.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 0", color:"var(--text-subtle)", fontSize:13.5, letterSpacing:"-0.3px" }}>
            Ningún lead coincide con el filtro.
          </div>
        ) : visible.map((l, i) => (
          <LeadRow key={l.id} l={l} last={i === visible.length - 1}
            open={openId === l.id}
            onToggle={() => setOpenId(openId === l.id ? null : l.id)}
            onStatus={(s) => setStatus(l, s)}
            onDelete={() => removeLead(l)}
            onCopy={() => copyDraft(l)}
            onSave={(fields) => saveLead(l, fields)}/>
        ))}
      </div>

      {csvInput}
      <AddLeadModal open={addingLead} onClose={() => setAddingLead(false)} campaignId={c.id} onDone={reload}/>
      <CoworkConnectModal open={coworkOpen} onClose={() => setCoworkOpen(false)} campaignName={c.name}/>
    </div>
  );
};

// ── Lista de campañas ─────────────────────────────────────────────────
// ── Onboarding de creación de campaña (wizard por pasos) ─────────────
const CampaignSetup = ({ open, onClose, onCreated }) => {
  const toast = useToast();
  const [step, setStep] = useState(0);   // 0 tipo · 1 nombre · 2 fuente
  const [type, setType] = useState(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const nameRef = useRef(null);

  useEffect(() => { if (open) { setStep(0); setType(null); setName(""); setBusy(false); } }, [open]);
  useEffect(() => {
    if (!open) return;
    const fn = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open]);
  useEffect(() => { if (open && step === 1) setTimeout(() => nameRef.current && nameRef.current.focus(), 60); }, [step, open]);

  if (!open) return null;

  const create = async (source) => {
    if (busy || !name.trim()) return;
    setBusy(true);
    const r = await window.apiFetch("/api/campaigns/create", { name: name.trim(), ctype: type || "otro" });
    const j = await r.json();
    setBusy(false);
    if (!j.ok) { toast(j.error || "No se pudo crear", "warn"); return; }
    onClose();
    onCreated(j.campaign.id, source);
  };

  const TITLES = ["¿Qué tipo de campaña?", "Ponle un nombre", "¿De dónde vienen los leads?"];
  const SUBS = [
    "Elige el canal principal de esta campaña.",
    "Un nombre claro para reconocerla de un vistazo.",
    "Puedes conectar los leads ahora o hacerlo más tarde.",
  ];
  const sourceCards = [
    { id:"csv",    icon:"upload",   title:"Importar CSV",     sub:"Sube una lista de leads." },
    { id:"cowork", icon:"sparkles", title:"Claude Cowork",    sub:"Se llena sola cada día.", accent:true },
    { id:"manual", icon:"plus",     title:"Añadir a mano",    sub:"Un contacto suelto." },
    { id:null,     icon:"clock",    title:"Lo haré luego",    sub:"Entrar a la campaña vacía." },
  ];

  const card = (sel, onClick, icon, title, sub, accent) => (
    <div onClick={onClick} style={{
      background: accent ? "rgba(158,154,229,0.07)" : (sel ? "rgba(158,154,229,0.1)" : "var(--bg-elev-1)"),
      border: sel || accent ? "0.5px solid rgba(158,154,229,0.4)" : "0.5px solid var(--border)",
      borderRadius:16, padding:"18px 16px", cursor:"pointer", textAlign:"center",
      transition:"border-color .15s, background .15s",
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(158,154,229,0.5)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = (sel || accent) ? "rgba(158,154,229,0.4)" : "var(--border)"}>
      <div style={{ width:42, height:42, borderRadius:12, margin:"0 auto 11px",
        background: accent || sel ? "rgba(158,154,229,0.14)" : "rgba(255,255,255,0.05)",
        border:"0.5px solid var(--border)", display:"grid", placeItems:"center",
        color: accent || sel ? "var(--accent)" : "var(--text-muted)" }}>
        <Icon name={icon} size={18} strokeWidth={1.7}/>
      </div>
      <div style={{ fontSize:13.5, fontWeight:500, color:"var(--text)", letterSpacing:"-0.3px" }}>{title}</div>
      <div style={{ fontSize:11.5, color:"var(--text-subtle)", marginTop:5, lineHeight:1.5 }}>{sub}</div>
    </div>
  );

  return ReactDOM.createPortal(
    <div onClick={onClose} style={{
      position:"fixed", inset:0, zIndex:300, display:"flex", alignItems:"center", justifyContent:"center",
      background:"rgba(0,0,0,0.72)", backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)",
      padding:24, animation:"fade .15s ease-out",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width:"100%", maxWidth:560, minHeight:440,
        background:"rgba(255,255,255,0.05)", backdropFilter:"blur(40px)", WebkitBackdropFilter:"blur(40px)",
        border:"1px solid rgba(255,255,255,0.1)", borderRadius:32, overflow:"hidden",
        boxShadow:"0 25px 60px -20px rgba(0,0,0,0.6)",
        display:"flex", flexDirection:"column", animation:"pop .2s cubic-bezier(.2,.8,.2,1)",
      }}>
        {/* Barra superior: progreso + cerrar */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 20px 0" }}>
          <div style={{ display:"flex", gap:6 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width: i === step ? 22 : 7, height:7, borderRadius:99,
                background: i <= step ? "var(--accent)" : "rgba(255,255,255,0.14)", transition:"all .2s" }}/>
            ))}
          </div>
          <button onClick={onClose} style={{ width:34, height:34, borderRadius:"50%",
            background:"rgba(255,255,255,0.06)", border:"0.5px solid var(--border)", cursor:"pointer",
            display:"grid", placeItems:"center", color:"var(--text-muted)" }}>
            <Icon name="x" size={14}/>
          </button>
        </div>

        {/* Título del paso */}
        <div style={{ padding:"22px 28px 0", textAlign:"center" }}>
          <div style={{ fontSize:23, fontWeight:500, color:"var(--text)", letterSpacing:"-0.6px" }}>{TITLES[step]}</div>
          <div style={{ fontSize:13, color:"var(--text-subtle)", marginTop:7, letterSpacing:"-0.2px" }}>{SUBS[step]}</div>
        </div>

        {/* Cuerpo */}
        <div style={{ flex:1, padding:"26px 28px", display:"flex", flexDirection:"column", justifyContent:"center" }}>
          {step === 0 && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {["email","meta","google","otro"].map(id =>
                card(type === id, () => { setType(id); setStep(1); }, CTYPES[id].icon, CTYPES[id].label, CTYPES[id].hint, false)
              )}
            </div>
          )}
          {step === 1 && (
            <div>
              <input ref={nameRef} value={name} onChange={e => setName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && name.trim()) setStep(2); }}
                placeholder="Ej. Outreach ecommerce moda"
                style={{ width:"100%", background:"transparent", border:"none", outline:"none",
                  fontSize:26, fontWeight:400, letterSpacing:"-1px", textAlign:"center",
                  color: name ? "var(--text)" : "rgba(255,255,255,0.2)",
                  fontFamily:"var(--font-display)", caretColor:"var(--accent)" }}/>
              <div style={{ height:"0.5px", background:"rgba(255,255,255,0.12)", margin:"14px auto 0", maxWidth:360 }}/>
              <div style={{ textAlign:"center", marginTop:10, fontSize:12, color:"var(--text-subtle)" }}>
                Tipo: {CTYPES[type] ? CTYPES[type].label : "—"}
              </div>
            </div>
          )}
          {step === 2 && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {sourceCards.map((s, i) => card(false, () => create(s.id), s.icon, s.title, s.sub, s.accent))}
            </div>
          )}
        </div>

        {/* Pie: atrás / siguiente */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 24px 24px" }}>
          {step > 0 ? (
            <button className="btn ghost sm" onClick={() => setStep(s => s - 1)}>
              <Icon name="chevron-left" size={13}/> Atrás
            </button>
          ) : <span/>}
          {step === 1 && (
            <button className="btn primary sm" onClick={() => name.trim() && setStep(2)}
              style={{ opacity: name.trim() ? 1 : 0.4, pointerEvents: name.trim() ? "auto" : "none" }}>
              Continuar <Icon name="chevron-right" size={13}/>
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

const CampaignsPage = ({ navigate }) => {
  const [camps, reload] = useCampaigns();
  const [setupOpen, setSetupOpen] = useState(false);

  const today = _cToday();
  const list = camps || [];
  const totalLeads = list.reduce((s, c) => s + (c.leads || []).length, 0);
  const newToday   = list.reduce((s, c) => s + (c.leads || []).filter(l => l.date === today).length, 0);

  const onCreated = (id, source) => {
    reload();
    navigate("campaign", { campaignId: id, action: source || undefined });
  };

  return (
    <div style={{
      height:"100vh", display:"flex", flexDirection:"column",
      padding:"28px 32px 0", maxWidth:1400, margin:"0 auto", overflow:"hidden",
    }}>
      <div className="page-head" style={{ flexShrink:0 }}>
        <div>
          <h1>Campañas</h1>
          <div className="sub">
            {list.length === 0 ? "Sin campañas todavía"
              : `${list.length} ${list.length === 1 ? "campaña" : "campañas"} · ${totalLeads} leads${newToday ? ` · +${newToday} hoy` : ""}`}
          </div>
        </div>
        <ActionPill plusActions={() => setSetupOpen(true)}/>
      </div>

      <div className="tasks-scroll" style={{
        flex:1, minHeight:0, overflowY:"auto", scrollbarGutter:"stable",
        paddingRight:10, paddingTop:22, paddingBottom:8,
        WebkitMaskImage:"linear-gradient(to bottom, transparent 0, #000 16px, #000 calc(100% - 24px), transparent 100%)",
        maskImage:"linear-gradient(to bottom, transparent 0, #000 16px, #000 calc(100% - 24px), transparent 100%)",
      }}>
        {camps === null ? (
          <div style={{ textAlign:"center", padding:"60px 0", color:"var(--text-subtle)", fontSize:13 }}>Cargando…</div>
        ) : list.length === 0 ? (
          <div style={{ textAlign:"center", padding:"70px 0" }}>
            <div style={{ display:"inline-flex", padding:14, border:"0.5px solid var(--border)", borderRadius:14, marginBottom:14, color:"var(--text-muted)" }}>
              <Icon name="megaphone" size={22}/>
            </div>
            <div style={{ fontSize:14.5, fontWeight:500, color:"var(--text)", letterSpacing:"-0.3px" }}>Sin campañas</div>
            <div style={{ fontSize:12.5, color:"var(--text-subtle)", marginTop:6, maxWidth:340, margin:"6px auto 0", lineHeight:1.55 }}>
              Crea una con el botón + o deja que Claude Cowork cree la suya con la primera importación de leads.
            </div>
          </div>
        ) : list.map(c => {
          const leads = c.leads || [];
          const ct = _ctype(c);
          const nToday    = leads.filter(l => l.date === today).length;
          const contacted = leads.filter(l => ["contacted","replied","won"].includes(l.status)).length;
          const replied   = leads.filter(l => ["replied","won"].includes(l.status)).length;
          const won       = leads.filter(l => l.status === "won").length;
          const pct = leads.length ? (contacted / leads.length) * 100 : 0;
          return (
            <div key={c.id} onClick={() => navigate("campaign", { campaignId: c.id })}
              className="task-row"
              style={{
                display:"flex", alignItems:"center", gap:18,
                padding:"18px 4px", cursor:"pointer",
                borderBottom:"0.5px solid var(--border)",
              }}>
              <div style={{
                width:40, height:40, borderRadius:12, flexShrink:0,
                background:"rgba(158,154,229,0.1)", border:"0.5px solid var(--border)",
                display:"grid", placeItems:"center", color:"var(--accent)",
              }}>
                <Icon name={ct.icon} size={17} strokeWidth={1.7}/>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14.5, fontWeight:500, letterSpacing:"-0.4px", color:"var(--text)" }}>{c.name}</div>
                <div style={{ fontSize:11.5, color:"var(--text-subtle)", marginTop:3, letterSpacing:"-0.2px" }}>
                  {ct.label} · {leads.length} {leads.length === 1 ? "lead" : "leads"}
                  {nToday ? ` · +${nToday} hoy` : ""}
                </div>
                {/* Barra de progreso contactados */}
                <div style={{ width:220, maxWidth:"100%", height:4, borderRadius:99, background:"rgba(255,255,255,0.07)", overflow:"hidden", marginTop:9 }}>
                  <div style={{ width:`${pct}%`, height:"100%", background:"var(--accent)", borderRadius:99, transition:"width .2s" }}/>
                </div>
              </div>
              <div style={{ display:"flex", gap:26, alignItems:"center", flexShrink:0 }}>
                {[
                  { v: leads.length, l:"Leads",       c:"var(--text)" },
                  { v: contacted,    l:"Contactados", c:"#60a5fa" },
                  { v: replied,      l:"Respuestas",  c:"var(--green)" },
                  { v: won,          l:"Ganados",     c:"var(--accent)" },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign:"center", minWidth:56 }}>
                    <div style={{ fontSize:17, fontWeight:600, fontFamily:"var(--font-display)", letterSpacing:"-0.4px", color:s.c }}>{s.v}</div>
                    <div style={{ fontSize:10, color:"var(--text-subtle)", marginTop:1 }}>{s.l}</div>
                  </div>
                ))}
                <Icon name="chevron-right" size={14} style={{ color:"rgba(255,255,255,0.18)" }}/>
              </div>
            </div>
          );
        })}
      </div>

      {/* Crear campaña — onboarding por pasos */}
      <CampaignSetup open={setupOpen} onClose={() => setSetupOpen(false)} onCreated={onCreated}/>
    </div>
  );
};

window.CampaignsPage  = CampaignsPage;
window.CampaignDetail = CampaignDetail;

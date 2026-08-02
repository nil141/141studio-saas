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

// Mapea cabeceras del CSV a campos del lead (ES/EN, incluye exports de
// Apollo/HubSpot: First Name + Last Name, Company Name, Industry, Title…)
const CSV_FIELDS = {
  firstName: ["first name","firstname","nombre de pila"],
  lastName:  ["last name","lastname","surname","apellido","apellidos"],
  name:      ["name","nombre","contacto","lead","persona","full name","nombre completo","contact name"],
  company:   ["company","company name","empresa","negocio","marca","compañia","compañía","organization","account name"],
  email:     ["email","correo","e-mail","mail","email address","work email","correo electronico","correo electrónico","personal email"],
  phone:     ["phone","phone number","telefono","teléfono","tel","movil","móvil","mobile","mobile number","mobile phone","work direct phone","corporate phone","company phone number"],
  website:   ["website","web","url","dominio","sitio","pagina","página","company website","website url","site","domain","company domain"],
  linkedin:  ["linkedin","linkedin url","linkedin profile","perfil linkedin","linkedin person"],
  sector:    ["sector","industry","industria","categoria","categoría","nicho","tipo","vertical"],
  title:     ["title","cargo","puesto","job title","position","rol"],
  audit:     ["audit","auditoria","auditoría","observaciones"],
  notes:     ["notes","notas","nota","comentarios"],
  subject:   ["subject","asunto"],
  draft:     ["draft","borrador","mensaje","cuerpo"],
  // Campos que no tienen columna propia pero enriquecen las notas del lead
  _seniority:["seniority","nivel","seniority level"],
  _city:     ["city","ciudad","localidad"],
  _region:   ["state","provincia","región","region","estado"],
  _country:  ["country","país","pais"],
};
const csvToLeads = (text) => {
  const rows = parseCSV(text);
  if (!rows.length) return [];
  const header = rows[0].map(h => h.replace(/^﻿/, "").trim().toLowerCase());
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
      const v = (cell || "").trim();
      // La primera columna que llena un campo gana (Website antes que Domain,
      // Mobile antes que Company Phone…)
      if (field && v && !lead[field]) lead[field] = v;
    });
    // First + Last Name → nombre completo (prioridad sobre Full Name)
    if (lead.firstName || lead.lastName) {
      lead.name = [lead.firstName, lead.lastName].filter(Boolean).join(" ");
    }
    delete lead.firstName; delete lead.lastName;
    // Normaliza la URL de LinkedIn (Apollo la da a veces sin protocolo)
    if (lead.linkedin && !/^https?:\/\//i.test(lead.linkedin)) {
      lead.linkedin = "https://" + lead.linkedin.replace(/^\/+/, "");
    }
    // Cargo, seniority y ubicación se guardan en las notas (no tienen campo propio)
    const extra = [];
    if (lead.title) extra.push(`Cargo: ${lead.title}${lead._seniority ? ` · ${lead._seniority}` : ""}`);
    const loc = [lead._city, lead._region, lead._country].filter(Boolean).join(", ");
    if (loc) extra.push(`📍 ${loc}`);
    if (lead.notes) extra.push(lead.notes);
    const merged = extra.filter(Boolean).join(" · ");
    if (merged) lead.notes = merged;
    delete lead.title; delete lead._seniority;
    delete lead._city; delete lead._region; delete lead._country;
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
const _cAddDays = (n) => {
  const d = new Date(); d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};
// Enlaces de acción para escribir al lead
const _digits = (s) => (s || "").replace(/[^\d]/g, "");
const _waLink = (phone, text) => {
  const p = _digits(phone);
  if (!p) return null;
  return `https://wa.me/${p}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
};
const _mailtoLink = (email, subject, body) => {
  if (!email) return null;
  const q = [];
  if (subject) q.push(`subject=${encodeURIComponent(subject)}`);
  if (body)    q.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${email}${q.length ? "?" + q.join("&") : ""}`;
};
// Canales de un paso de seguimiento
const FU_CH = {
  email:    { label:"Email",    icon:"mail" },
  whatsapp: { label:"WhatsApp", icon:"msg-circle" },
  call:     { label:"Llamada",  icon:"phone" },
};
const FU_ORDER = ["email", "whatsapp", "call"];
const _leadNextDue = (l) => {
  const p = (Array.isArray(l.followUps) ? l.followUps : []).filter(s => !s.done && s.date).map(s => s.date).sort();
  return p.length ? p[0] : null;
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
  const [dailyGoal, setDailyGoal] = useState(String(c.dailyGoal || ""));
  useEffect(() => { setName(c.name); setCtype(c.ctype || "cowork"); setGoal(String(c.goal || "")); setDailyGoal(String(c.dailyGoal || "")); }, [c.id]);
  const dirty = name.trim() !== c.name || ctype !== (c.ctype || "cowork")
    || (parseInt(goal || 0, 10) || 0) !== (c.goal || 0)
    || (parseInt(dailyGoal || 0, 10) || 0) !== (c.dailyGoal || 0);

  const save = async () => {
    if (!name.trim()) { toast("El nombre no puede quedar vacío", "warn"); return; }
    const r = await window.apiFetch("/api/campaigns/update", { campaignId: c.id, name: name.trim(), ctype, goal: parseInt(goal || 0, 10) || 0, dailyGoal: parseInt(dailyGoal || 0, 10) || 0 });
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
        <div style={{ display:"flex", gap:20, flexWrap:"wrap", marginTop:16 }}>
          <div>
            <div className="label">Objetivo · clientes a cerrar <span style={{ color:"var(--text-subtle)" }}>(opcional)</span></div>
            <input className="input" type="number" min="0" placeholder="Ej. 10" value={goal}
              onChange={e => setGoal(e.target.value)} style={{ maxWidth:160 }}/>
          </div>
          <div>
            <div className="label">Meta diaria · leads a trabajar/día</div>
            <input className="input" type="number" min="0" placeholder="15" value={dailyGoal}
              onChange={e => setDailyGoal(e.target.value)} style={{ maxWidth:160 }}/>
          </div>
        </div>
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
// Cabecera de sección dentro de la ficha del lead
const _LeadSection = ({ icon, title, right, children }) => (
  <div style={{ marginTop:16, paddingTop:16, borderTop:"0.5px solid var(--border)" }}>
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
      <div style={{ fontSize:11, textTransform:"uppercase", letterSpacing:"0.07em", color:"var(--text-subtle)", display:"flex", alignItems:"center", gap:6 }}>
        <Icon name={icon} size={12}/> {title}
      </div>
      {right}
    </div>
    {children}
  </div>
);

const LeadRow = ({ l, last, open, onToggle, onStatus, onDelete, onCopy, onSave, today }) => {
  const toast = useToast();
  const st = LEAD_STATUS[l.status] || LEAD_STATUS.new;
  const TEXT_KEYS = ["name","company","email","phone","website","linkedin","instagram","sector","audit","subject","draft","whatsapp","notes"];
  const [f, setF]   = useState({});
  const [fu, setFu] = useState([]);
  useEffect(() => {
    if (open) {
      const o = {}; TEXT_KEYS.forEach(k => o[k] = l[k] || ""); setF(o);
      setFu(Array.isArray(l.followUps) ? l.followUps.map(x => ({ ...x })) : []);
    }
  }, [open, l.id]);
  const set = (k) => (e) => setF(prev => ({ ...prev, [k]: e.target.value }));

  const baseFu = Array.isArray(l.followUps) ? l.followUps : [];
  const fuChanged = JSON.stringify(fu) !== JSON.stringify(baseFu);
  const dirty = TEXT_KEYS.some(k => (f[k] || "") !== (l[k] || "")) || fuChanged;
  const save = () => onSave({ ...f, followUps: fu });

  // Seguimientos
  const addFU  = () => setFu(prev => [...prev, { id:"fu"+Math.random().toString(36).slice(2,8), date:_cAddDays(3), note:"", channel:"email", done:false }]);
  const updFU  = (i, patch) => setFu(prev => prev.map((s, j) => j === i ? { ...s, ...patch } : s));
  const rmFU   = (i) => setFu(prev => prev.filter((_, j) => j !== i));
  const cycleCh = (i) => { const idx = FU_ORDER.indexOf(fu[i].channel); updFU(i, { channel: FU_ORDER[(idx+1) % FU_ORDER.length] }); };

  // Indicadores de la fila plegada
  const done = { audit: !!l.audit, email: !!l.draft, whatsapp: !!l.whatsapp };
  const nextDue = _leadNextDue(l);
  const overdue = nextDue && nextDue < today;

  const copyText = (text, label) => navigator.clipboard.writeText(text || "")
    .then(() => toast(`${label} copiado`, "success")).catch(() => toast("No se pudo copiar", "warn"));

  const field = (label, k, ph, type) => (
    <div>
      <div style={{ fontSize:10.5, textTransform:"uppercase", letterSpacing:"0.06em", color:"var(--text-subtle)", marginBottom:5 }}>{label}</div>
      <input className="input" type={type || "text"} placeholder={ph} value={f[k] || ""} onChange={set(k)}
        onClick={e => e.stopPropagation()} style={{ padding:"8px 11px", fontSize:12.5 }}/>
    </div>
  );
  const miniBtn = { fontSize:11.5, padding:"5px 10px" };
  const emailHref = _mailtoLink(f.email, f.subject, f.draft);
  const waHref    = _waLink(f.phone, f.whatsapp);

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
            {l.linkedin && <a href={l.linkedin} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
              data-tooltip="Ver LinkedIn" style={{ color:"var(--text-subtle)", display:"inline-flex", flexShrink:0 }}>
              <Icon name="external-link" size={11}/></a>}
            {nextDue && <Icon name="clock" size={11} style={{ color: overdue ? "var(--red)" : "var(--accent)", flexShrink:0 }}
              data-tooltip={`${overdue ? "Seguimiento vencido" : "Próximo seguimiento"} · ${_cFmtDay(nextDue)}`}/>}
          </div>
          <div style={{ fontSize:11.5, color:"var(--text-subtle)", marginTop:2, letterSpacing:"-0.2px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            {l.company || "—"}{l.sector ? ` · ${l.sector}` : ""}
          </div>
        </div>
        {/* Acciones rápidas: Gmail · Instagram · WhatsApp (solo si hay dato) */}
        <div style={{ display:"flex", alignItems:"center", gap:14, flex:"1 1 0", minWidth:0 }}>
          {l.email && (
            <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(l.email)}`}
              target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
              className="lead-act" data-tooltip={`Escribir a ${l.email}`}>
              <SiIcon name="gmail" size={16}/>
            </a>
          )}
          {(l.instagram || "").trim() && (
            <a href={`https://ig.me/m/${(l.instagram || "").replace(/^@/, "").trim()}`}
              target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
              className="lead-act" data-tooltip="Mensaje de Instagram">
              <SiIcon name="instagram" size={16}/>
            </a>
          )}
          {(l.phone || "").replace(/[^\d]/g, "") && (
            <a href={`https://wa.me/${(l.phone || "").replace(/[^\d]/g, "")}`}
              target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
              className="lead-act" data-tooltip="WhatsApp">
              <SiIcon name="whatsapp" size={16}/>
            </a>
          )}
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
          {/* 1 · Datos del lead */}
          <div style={{ fontSize:11, textTransform:"uppercase", letterSpacing:"0.07em", color:"var(--text-subtle)", marginBottom:12, display:"flex", alignItems:"center", gap:6 }}>
            <Icon name="user-cog" size={12}/> Datos del lead
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
            {field("Nombre", "name", "Nombre")}
            {field("Empresa", "company", "Empresa")}
            {field("Sector", "sector", "Sector")}
            {field("Email", "email", "email@…", "email")}
            {field("Teléfono", "phone", "+34 …")}
            {field("Instagram", "instagram", "@usuario")}
            {field("Web", "website", "empresa.com")}
            {field("LinkedIn", "linkedin", "linkedin.com/in/…")}
          </div>

          {/* 2 · Auditoría */}
          <_LeadSection icon="search" title="Auditoría del ecommerce">
            <textarea className="input" rows={3} placeholder="Hallazgos: qué le falla a su tienda, oportunidades, ángulo para el mensaje…"
              value={f.audit || ""} onChange={set("audit")}
              style={{ padding:"9px 12px", fontSize:13, resize:"vertical", lineHeight:1.6, width:"100%" }}/>
          </_LeadSection>

          {/* 3 · Email */}
          <_LeadSection icon="mail" title="Email" right={
            <div style={{ display:"flex", gap:7 }}>
              <button className="btn ghost sm" style={miniBtn} onClick={() => copyText((f.subject ? `Asunto: ${f.subject}\n\n` : "") + (f.draft || ""), "Email")}>
                <Icon name="file" size={11}/> Copiar
              </button>
              <a className="btn sm" style={{ ...miniBtn, opacity: emailHref ? 1 : 0.4, pointerEvents: emailHref ? "auto":"none" }}
                href={emailHref || undefined} target="_blank" rel="noopener noreferrer">
                <Icon name="send" size={11}/> Abrir
              </a>
            </div>
          }>
            <input className="input" placeholder="Asunto" value={f.subject || ""} onChange={set("subject")}
              style={{ padding:"8px 11px", fontSize:12.5, marginBottom:8, width:"100%" }}/>
            <textarea className="input" rows={4} placeholder="Cuerpo del correo…"
              value={f.draft || ""} onChange={set("draft")}
              style={{ padding:"9px 12px", fontSize:13, resize:"vertical", lineHeight:1.6, width:"100%" }}/>
          </_LeadSection>

          {/* 4 · WhatsApp */}
          <_LeadSection icon="msg-circle" title="WhatsApp" right={
            <div style={{ display:"flex", gap:7 }}>
              <button className="btn ghost sm" style={miniBtn} onClick={() => copyText(f.whatsapp, "Mensaje")}>
                <Icon name="file" size={11}/> Copiar
              </button>
              <a className="btn sm" style={{ ...miniBtn, opacity: waHref ? 1 : 0.4, pointerEvents: waHref ? "auto":"none" }}
                href={waHref || undefined} target="_blank" rel="noopener noreferrer"
                data-tooltip={waHref ? "" : "Añade un teléfono"}>
                <Icon name="msg-circle" size={11}/> Abrir
              </a>
            </div>
          }>
            <textarea className="input" rows={3} placeholder="Mensaje de WhatsApp…"
              value={f.whatsapp || ""} onChange={set("whatsapp")}
              style={{ padding:"9px 12px", fontSize:13, resize:"vertical", lineHeight:1.6, width:"100%" }}/>
          </_LeadSection>

          {/* 5 · Seguimientos */}
          <_LeadSection icon="clock" title="Seguimientos" right={
            <button className="btn ghost sm" style={miniBtn} onClick={addFU}><Icon name="plus" size={11}/> Añadir</button>
          }>
            {fu.length === 0 ? (
              <div style={{ fontSize:12.5, color:"var(--text-subtle)", padding:"2px 0 2px" }}>Sin seguimientos programados.</div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {fu.map((s, i) => {
                  const ch = FU_CH[s.channel] || FU_CH.email;
                  const isOver = !s.done && s.date && s.date < today;
                  return (
                    <div key={s.id || i} style={{ display:"flex", alignItems:"center", gap:9 }}>
                      <button onClick={() => updFU(i, { done: !s.done })} data-tooltip={s.done ? "Hecho" : "Marcar hecho"}
                        style={{ width:18, height:18, borderRadius:6, flexShrink:0, cursor:"pointer",
                          background: s.done ? "var(--accent)" : "transparent",
                          border: `1.5px solid ${s.done ? "var(--accent)" : "var(--border)"}`,
                          display:"grid", placeItems:"center", color:"#fff" }}>
                        {s.done && <Icon name="check" size={11}/>}
                      </button>
                      <button onClick={() => cycleCh(i)} data-tooltip={`Canal: ${ch.label} (clic para cambiar)`}
                        style={{ width:30, height:30, borderRadius:8, flexShrink:0, cursor:"pointer",
                          background:"rgba(255,255,255,0.04)", border:"0.5px solid var(--border)",
                          display:"grid", placeItems:"center", color:"var(--text-muted)" }}>
                        <Icon name={ch.icon} size={13}/>
                      </button>
                      <input type="date" className="input" value={s.date || ""} onChange={e => updFU(i, { date: e.target.value })}
                        style={{ padding:"6px 9px", fontSize:12, width:140, flexShrink:0, color: isOver ? "var(--red)" : "var(--text)" }}/>
                      <input className="input" placeholder="Nota del seguimiento…" value={s.note || ""} onChange={e => updFU(i, { note: e.target.value })}
                        style={{ padding:"6px 10px", fontSize:12.5, flex:1, textDecoration: s.done ? "line-through" : "none", opacity: s.done ? 0.6 : 1 }}/>
                      <button className="btn ghost sm" style={{ padding:"5px 8px" }} onClick={() => rmFU(i)} data-tooltip="Quitar">
                        <Icon name="x" size={12}/>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </_LeadSection>

          {/* 6 · Notas */}
          <_LeadSection icon="edit" title="Notas internas">
            <textarea className="input" rows={2} placeholder="Contexto, cargo, ubicación, recordatorios…"
              value={f.notes || ""} onChange={set("notes")}
              style={{ padding:"8px 11px", fontSize:12.5, resize:"vertical", lineHeight:1.55, width:"100%" }}/>
          </_LeadSection>

          {/* Pie: guardar + eliminar */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:16, paddingTop:14, borderTop:"0.5px solid var(--border)" }}>
            <button className="btn ghost sm" onClick={onDelete} style={{ color:"var(--red)" }}>
              <Icon name="trash" size={12}/> Eliminar lead
            </button>
            <button className="btn primary sm" onClick={save} disabled={!dirty} style={{ opacity: dirty ? 1 : 0.45 }}>
              <Icon name="check" size={12}/> Guardar
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
  const empty = { name:"", company:"", email:"", phone:"", website:"", sector:"", instagram:"" };
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
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {field("Instagram", "instagram", "@usuario")}
          {field("Web", "website", "empresa.com")}
        </div>
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
  const dailyGoal = c.dailyGoal || 15;
  const workedToday = leads.filter(l => l.workedAt === today).length;

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
      // Avanzar un lead (contactado/respondió/ganado) cuenta como trabajo de hoy
      const fields = {};
      if (["contacted","replied","won"].includes(status) && l.workedAt !== today) fields.workedAt = today;
      await window.apiFetch("/api/campaigns/update_lead", { campaignId: c.id, leadId: l.id, status, fields });
      reload();
    } catch (e) { toast("Error al guardar", "warn"); }
  };
  const saveLead = async (l, fields) => {
    try {
      // Escribir la auditoría marca el lead como trabajado hoy (progreso diario)
      const payload = { ...fields };
      if ((payload.audit || "").trim() && l.workedAt !== today) payload.workedAt = today;
      const r = await window.apiFetch("/api/campaigns/update_lead", { campaignId: c.id, leadId: l.id, fields: payload });
      const j = await r.json();
      if (!j.ok) { toast(j.error || "No se pudo guardar", "warn"); return; }
      toast("Lead actualizado", "success");
      reload();
    } catch (e) { toast("Error al guardar", "warn"); }
  };
  // Abrir el siguiente lead sin trabajar (para la sesión diaria)
  const openNext = () => {
    const next = leads.slice().reverse().find(l => l.status === "new" && l.workedAt !== today);
    if (!next) { toast("No quedan leads nuevos por trabajar 🎉", "success"); return; }
    setFilter("all"); setQuery(""); setOpenId(next.id);
    setTimeout(() => document.getElementById("lead-" + next.id)?.scrollIntoView({ behavior:"smooth", block:"center" }), 60);
  };
  const exportCSV = () => {
    if (!leads.length) { toast("No hay leads que exportar", "warn"); return; }
    const cols = ["name","company","email","phone","website","linkedin","sector","status","date","notes","subject","draft","whatsapp","audit"];
    const head = ["Nombre","Empresa","Email","Teléfono","Web","LinkedIn","Sector","Estado","Fecha","Notas","Asunto","Email","WhatsApp","Auditoría"];
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

        {/* Progreso diario — auditar/contactar X leads al día */}
        {view === "leads" && leads.length > 0 && (() => {
          const pct = Math.min(100, Math.round((workedToday / dailyGoal) * 100));
          const doneDay = workedToday >= dailyGoal;
          return (
            <div style={{
              display:"flex", alignItems:"center", gap:16, marginBottom:12,
              background:"var(--bg-elev-1)", border:"0.5px solid var(--border)", borderRadius:12, padding:"12px 16px",
            }}>
              <div style={{ fontSize:11, textTransform:"uppercase", letterSpacing:"0.08em", color: doneDay ? "var(--green)" : "var(--accent)", fontWeight:600, flexShrink:0 }}>
                Hoy
              </div>
              <div style={{ flex:1, minWidth:80 }}>
                <div style={{ height:7, borderRadius:99, background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
                  <div style={{ width:`${pct}%`, height:"100%", borderRadius:99, transition:"width .3s",
                    background: doneDay ? "var(--green)" : "var(--accent)" }}/>
                </div>
              </div>
              <div style={{ fontSize:12.5, color:"var(--text-muted)", flexShrink:0, letterSpacing:"-0.2px" }}>
                <b style={{ color: doneDay ? "var(--green)" : "var(--text)", fontSize:14 }}>{workedToday}</b>
                <span style={{ opacity:0.6 }}> / {dailyGoal} trabajados</span>
                {doneDay && <span style={{ color:"var(--green)", marginLeft:8 }}>¡Objetivo del día! 🎉</span>}
              </div>
              <button className="btn primary sm" onClick={openNext} style={{ flexShrink:0 }}>
                <Icon name="arrow" size={12}/> Siguiente
              </button>
            </div>
          );
        })()}

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
          <div key={l.id} id={"lead-" + l.id}>
            <LeadRow l={l} last={i === visible.length - 1} today={today}
              open={openId === l.id}
              onToggle={() => setOpenId(openId === l.id ? null : l.id)}
              onStatus={(s) => setStatus(l, s)}
              onDelete={() => removeLead(l)}
              onCopy={() => copyDraft(l)}
              onSave={(fields) => saveLead(l, fields)}/>
          </div>
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
  const [hoverId, setHoverId] = useState(null);
  const confirm = useConfirm();
  const toast   = useToast();

  const removeCampaign = async (c, e) => {
    e?.stopPropagation();
    const n = (c.leads || []).length;
    const ok = await confirm({ title:"¿Eliminar la campaña?", body:`Se eliminará "${c.name}"${n ? ` con sus ${n} leads` : ""}. No se puede deshacer.`, danger:true, confirmLabel:"Eliminar campaña" });
    if (!ok) return;
    await window.apiFetch("/api/campaigns/delete_campaign", { campaignId: c.id });
    toast("Campaña eliminada", "success");
    reload();
  };

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
        paddingRight:10, paddingBottom:24,
      }}>
        {camps === null ? (
          <div style={{ textAlign:"center", padding:"60px 0", color:"var(--text-subtle)", fontSize:13 }}>Cargando…</div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", width:"100%" }}>
            {list.map(c => {
              const leads = c.leads || [];
              const ct = _ctype(c);
              const nToday    = leads.filter(l => l.date === today).length;
              const contacted = leads.filter(l => ["contacted","replied","won"].includes(l.status)).length;
              const won       = leads.filter(l => l.status === "won").length;
              const pct = leads.length ? Math.round((contacted / leads.length) * 100) : 0;
              const col = won > 0 ? "var(--green)" : "var(--accent)";
              const on = hoverId === c.id;
              return (
                <div key={c.id} onClick={() => navigate("campaign", { campaignId: c.id })}
                  onMouseEnter={() => setHoverId(c.id)} onMouseLeave={() => setHoverId(null)}
                  style={{ display:"flex", flexDirection:"column", gap:12, padding:"18px 6px", cursor:"pointer" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:14, minWidth:0 }}>
                      <Icon name={ct.icon} size={22} strokeWidth={1.6}
                        style={{ color:"var(--text)", flexShrink:0, transform: on ? "scale(1.06)" : "none", transition:"transform .3s" }}/>
                      <div style={{ minWidth:0 }}>
                        <div style={{ fontSize:17, color:"var(--text)", letterSpacing:"-0.4px", lineHeight:1.2,
                          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{c.name}</div>
                        <div style={{ fontSize:12.5, color:"var(--text-muted)", marginTop:3, display:"flex", alignItems:"center", gap:6, minWidth:0 }}>
                          <span style={{ flexShrink:0 }}>{leads.length} leads</span>
                          <span style={{ opacity:0.4, fontSize:10 }}>•</span>
                          <span style={{ flexShrink:0 }}>{contacted} contactados</span>
                          <span style={{ opacity:0.4, fontSize:10 }}>•</span>
                          <span style={{ whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{ct.label}{nToday ? ` · +${nToday} hoy` : ""}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
                      <button className="btn ghost icon-only sm" data-tooltip="Eliminar"
                        onClick={(e) => removeCampaign(c, e)}
                        style={{ opacity: on ? 0.65 : 0, transition:"opacity .15s", color:"var(--red)" }}>
                        <Icon name="trash" size={13}/>
                      </button>
                      <Icon name="chevron-right" size={18}
                        style={{ color: on ? "var(--text)" : "var(--text-muted)", transform: on ? "translateX(3px)" : "none",
                          transition:"all .2s", flexShrink:0 }}/>
                    </div>
                  </div>
                  <div style={{ position:"relative", width:"100%", height:3, background:"rgba(255,255,255,0.05)", borderRadius:99, overflow:"hidden" }}>
                    <div style={{ position:"absolute", height:"100%", borderRadius:99, background:col, width:`${pct}%`, transition:"width .3s" }}/>
                  </div>
                </div>
              );
            })}

            {/* Añadir campaña — botón discontinuo estilo outdomode */}
            <button onClick={() => setSetupOpen(true)} style={{
              marginTop:16, width:"100%", padding:"26px", borderRadius:22,
              border:"1px dashed var(--border)", background:"transparent", cursor:"pointer",
              color:"var(--text-muted)", fontSize:15, fontFamily:"inherit", opacity:0.5, transition:"opacity .2s",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8, letterSpacing:"-0.2px",
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = 0.85}
              onMouseLeave={e => e.currentTarget.style.opacity = 0.5}>
              {list.length === 0 ? "Crea tu primera campaña" : "Añadir campaña"} <Icon name="plus" size={16}/>
            </button>
          </div>
        )}
      </div>

      {/* Crear campaña — onboarding por pasos */}
      <CampaignSetup open={setupOpen} onClose={() => setSetupOpen(false)} onCreated={onCreated}/>
    </div>
  );
};

window.CampaignsPage  = CampaignsPage;
window.CampaignDetail = CampaignDetail;

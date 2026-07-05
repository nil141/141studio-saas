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

// Barras de leads/día (14 días) — minimal, sin ejes
const LeadsSpark = ({ leads }) => {
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    return { ds, v: leads.filter(x => x.date === ds).length,
             lab: d.getDate(), isToday: i === 13 };
  });
  const max = Math.max(...days.map(d => d.v), 1);
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:5, height:64 }}>
      {days.map((d, i) => (
        <div key={i} data-tooltip={`${d.v} lead${d.v === 1 ? "" : "s"} · día ${d.lab}`}
          style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:5, minWidth:0 }}>
          <div style={{
            width:"100%", maxWidth:22, borderRadius:5,
            height: d.v === 0 ? 3 : Math.max(6, (d.v / max) * 46),
            background: d.v === 0 ? "rgba(255,255,255,0.06)"
                       : d.isToday ? "var(--accent)" : "rgba(158,154,229,0.45)",
            transition:"height .2s",
          }}/>
          <span style={{ fontSize:9.5, color: d.isToday ? "var(--text)" : "var(--text-subtle)" }}>{d.lab}</span>
        </div>
      ))}
    </div>
  );
};

// ── Fila de lead + panel expandible ──────────────────────────────────
const LeadRow = ({ l, last, open, onToggle, onStatus, onDelete, onCopy }) => {
  const st = LEAD_STATUS[l.status] || LEAD_STATUS.new;
  return (
    <>
      <div onClick={onToggle} className="task-row" style={{
        display:"flex", alignItems:"center", gap:14,
        padding:"13px 4px", cursor:"pointer",
        borderBottom: (last && !open) ? "none" : "0.5px solid var(--border)",
      }}>
        {/* Punto de estado */}
        <span style={{ width:7, height:7, borderRadius:"50%", background:st.dot, flexShrink:0 }}/>
        {/* Nombre + empresa */}
        <div style={{ flex:"1.4 1 0", minWidth:0 }}>
          <div style={{ fontSize:14, letterSpacing:"-0.4px", color:"var(--text)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            {l.name}
          </div>
          <div style={{ fontSize:11.5, color:"var(--text-subtle)", marginTop:2, letterSpacing:"-0.2px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            {l.company || "—"}{l.sector ? ` · ${l.sector}` : ""}
          </div>
        </div>
        {/* Contacto */}
        <div style={{ flex:"1 1 0", minWidth:0, fontSize:12, color:"var(--text-muted)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
          {l.email || l.website || "—"}
        </div>
        {/* Fecha */}
        <div style={{ width:52, fontSize:12, color:"var(--text-subtle)", textAlign:"right", flexShrink:0 }}>
          {_cFmtDay(l.date)}
        </div>
        {/* Estado */}
        <LeadStatusPill value={l.status} onChange={onStatus}/>
        <Icon name="chevron-down" size={13} style={{
          color:"rgba(255,255,255,0.2)", flexShrink:0,
          transform: open ? "rotate(180deg)" : "none", transition:"transform .15s",
        }}/>
      </div>

      {open && (
        <div style={{
          margin:"0 0 14px", padding:"18px 20px",
          background:"var(--bg-elev-1)", border:"0.5px solid var(--border)", borderRadius:14,
        }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:22 }}>
            {/* Auditoría */}
            <div>
              <div style={{ fontSize:11, textTransform:"uppercase", letterSpacing:"0.07em", color:"var(--text-subtle)", marginBottom:10, display:"flex", alignItems:"center", gap:6 }}>
                <Icon name="search" size={11}/> Auditoría
              </div>
              <div style={{ fontSize:13, lineHeight:1.65, color:"var(--text-muted)", whiteSpace:"pre-wrap" }}>
                {l.audit || "Sin auditoría."}
              </div>
              <div style={{ display:"flex", gap:14, marginTop:12, fontSize:12 }}>
                {l.website && (
                  <a href={l.website.startsWith("http") ? l.website : "https://" + l.website}
                    target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                    style={{ color:"var(--accent)", display:"inline-flex", alignItems:"center", gap:5 }}>
                    <Icon name="external-link" size={11}/> {l.website}
                  </a>
                )}
                {l.phone && <span style={{ color:"var(--text-muted)", display:"inline-flex", alignItems:"center", gap:5 }}><Icon name="phone" size={11}/> {l.phone}</span>}
              </div>
            </div>
            {/* Borrador */}
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
    const r = await window.apiFetch("/api/campaigns/import_leads", { campaignId, leads, source:"csv" });
    const j = await r.json();
    if (!j.ok) { toast(j.error || "Error al importar", "warn"); return; }
    toast(`${j.added} leads importados${j.skipped ? ` · ${j.skipped} duplicados omitidos` : ""}`, "success");
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
const CampaignDetail = ({ campaignId, navigate }) => {
  const [camps, reload] = useCampaigns();
  const toast   = useToast();
  const confirm = useConfirm();
  const [filter, setFilter]   = useState("all");
  const [query, setQuery]     = useState("");
  const [openId, setOpenId]   = useState(null);
  const [addingLead, setAddingLead]   = useState(false);
  const [coworkOpen, setCoworkOpen]   = useState(false);
  const [pickCSV, csvInput] = useCSVImport(campaignId, () => reload());

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
              { icon:"trash", label:"Eliminar campaña", onClick: removeCampaign },
            ]}
          />
        </div>

        {/* Mini-stats + gráfico (solo con leads) */}
        {leads.length > 0 && (
        <div style={{
          display:"grid", gridTemplateColumns:"1fr 1.15fr", gap:28,
          paddingBottom:20, borderBottom:"0.5px solid var(--border)", marginBottom:18,
        }}>
          <div style={{ display:"flex", gap:26, alignItems:"flex-start" }}>
            <CampMiniStat label="Leads" value={leads.length} sub={newToday ? `+${newToday} hoy` : "sin nuevos hoy"}/>
            <CampMiniStat label="Contactados" value={contacted} sub={leads.length ? `${Math.round((contacted/leads.length)*100)}% del total` : "—"} color="#60a5fa"/>
            <CampMiniStat label="Respuestas" value={replied} sub={contacted ? `${replyPct}% de contactados` : "—"} color="var(--green)"/>
            <CampMiniStat label="Ganados" value={nStatus("won")} sub="clientes cerrados" color="var(--accent)"/>
          </div>
          <div>
            <div style={{ fontSize:11, textTransform:"uppercase", letterSpacing:"0.07em", color:"var(--text-subtle)", marginBottom:10 }}>
              Leads recibidos · últimos 14 días
            </div>
            <LeadsSpark leads={leads}/>
          </div>
        </div>
        )}

        {/* Filtros + buscador (solo con leads) */}
        {leads.length > 0 && (
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

      {/* Contenido: panel de conexión si está vacía; lista si hay leads */}
      {leads.length === 0 ? (
        <ConnectPanel onCSV={pickCSV} onManual={() => setAddingLead(true)} onCowork={() => setCoworkOpen(true)}/>
      ) : (
      <div className="tasks-scroll" style={{
        flex:1, minHeight:0, overflowY:"auto", scrollbarGutter:"stable",
        paddingRight:10, paddingTop:14, paddingBottom:8,
        WebkitMaskImage:"linear-gradient(to bottom, transparent 0, #000 16px, #000 calc(100% - 24px), transparent 100%)",
        maskImage:"linear-gradient(to bottom, transparent 0, #000 16px, #000 calc(100% - 24px), transparent 100%)",
      }}>
        {visible.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 0", color:"var(--text-subtle)", fontSize:13.5, letterSpacing:"-0.3px" }}>
            Ningún lead coincide con el filtro.
          </div>
        ) : visible.map((l, i) => (
          <LeadRow key={l.id} l={l} last={i === visible.length - 1}
            open={openId === l.id}
            onToggle={() => setOpenId(openId === l.id ? null : l.id)}
            onStatus={(s) => setStatus(l, s)}
            onDelete={() => removeLead(l)}
            onCopy={() => copyDraft(l)}/>
        ))}
      </div>
      )}

      {csvInput}
      <AddLeadModal open={addingLead} onClose={() => setAddingLead(false)} campaignId={c.id} onDone={reload}/>
      <CoworkConnectModal open={coworkOpen} onClose={() => setCoworkOpen(false)} campaignName={c.name}/>
    </div>
  );
};

// ── Lista de campañas ─────────────────────────────────────────────────
const CampaignsPage = ({ navigate }) => {
  const [camps, reload] = useCampaigns();
  const toast = useToast();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName]   = useState("");
  const [newType, setNewType]   = useState("email");

  const today = _cToday();
  const list = camps || [];
  const totalLeads = list.reduce((s, c) => s + (c.leads || []).length, 0);
  const newToday   = list.reduce((s, c) => s + (c.leads || []).filter(l => l.date === today).length, 0);

  const createCampaign = async () => {
    const name = newName.trim();
    if (!name) { toast("Ponle un nombre a la campaña", "warn"); return; }
    const r = await window.apiFetch("/api/campaigns/create", { name, ctype: newType });
    const j = await r.json();
    if (!j.ok) { toast(j.error || "No se pudo crear", "warn"); return; }
    toast("Campaña creada — ahora conéctale los leads", "success");
    setCreating(false); setNewName(""); setNewType("email");
    reload();
    // Entrar directo a la campaña recién creada (panel de conexión)
    if (j.campaign && j.campaign.id) navigate("campaign", { campaignId: j.campaign.id });
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
        <ActionPill plusActions={() => setCreating(true)}/>
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

      {/* Crear campaña — QuickModal (mismo estilo que el resto de "+") */}
      <QuickModal
        open={creating}
        onClose={() => { setCreating(false); setNewName(""); setNewType("email"); }}
        onSubmit={createCampaign}
        canSubmit={newName.trim().length > 0}
        titlePlaceholder="Nombre de la campaña..."
        titleValue={newName}
        onTitleChange={setNewName}
        types={["email","meta","google","otro"].map(id => ({ id, label:CTYPES[id].label, icon:CTYPES[id].icon }))}
        type={newType}
        onTypeChange={setNewType}
        tabs={[{ id:"next", label:"¿Y los leads?", icon:"users", hasVal:false }]}
        renderTab={() => (
          <div style={{ fontSize:13, lineHeight:1.7, color:"var(--text-muted)", maxWidth:390, textAlign:"center", letterSpacing:"-0.2px" }}>
            Al crearla entrarás directo a la campaña, donde podrás
            <b style={{ color:"var(--text)" }}> importar un CSV</b>, <b style={{ color:"var(--text)" }}>añadir leads a mano</b> o
            <b style={{ color:"var(--text)" }}> conectarla con Claude Cowork</b> para que se llene sola cada día.
          </div>
        )}
      />
    </div>
  );
};

window.CampaignsPage  = CampaignsPage;
window.CampaignDetail = CampaignDetail;

// ── Wizard helpers ────────────────────────────────────────────
const ChoiceCard = ({ label, sub, icon, selected, onClick, half }) => (
  <div onClick={onClick} style={{
    padding: "13px 14px", borderRadius: 10, cursor: "pointer", transition: "all .12s",
    border: `1.5px solid ${selected ? "var(--accent)" : "var(--border-strong)"}`,
    background: selected ? "var(--accent-soft)" : "var(--bg-elev-2)",
    display: "flex", flexDirection: half ? "row" : "column",
    alignItems: half ? "center" : "flex-start", gap: half ? 10 : 6,
  }}>
    {icon && <Icon name={icon} size={16} style={{color: selected ? "var(--accent)" : "var(--text-muted)", flexShrink:0}}/>}
    <div style={{flex:1, minWidth:0}}>
      <div style={{fontSize:13, fontWeight:500, color: selected ? "var(--accent)" : "var(--text)"}}>{label}</div>
      {sub && <div style={{fontSize:11, color:"var(--text-subtle)", marginTop:2}}>{sub}</div>}
    </div>
    {half && selected && <Icon name="check" size={13} style={{color:"var(--accent)", flexShrink:0}}/>}
  </div>
);

const WizardQuestion = ({ label, hint, children }) => (
  <div style={{marginBottom:20}}>
    <div style={{fontSize:14, fontWeight:600, color:"var(--text)", marginBottom: hint ? 2 : 10}}>{label}</div>
    {hint && <div style={{fontSize:12, color:"var(--text-subtle)", marginBottom:10}}>{hint}</div>}
    {children}
  </div>
);

// ── Project Wizard ────────────────────────────────────────────
const WIZARD_TYPES = [
  { id:"web",      label:"Web",           icon:"external-link", sub:"Web corporativa o landing" },
  { id:"brand",    label:"Branding",      icon:"sparkles",      sub:"Identidad y sistema de marca" },
  { id:"ecommerce",label:"E-commerce",    icon:"receipt",       sub:"Tienda online" },
  { id:"campaign", label:"Campaña",       icon:"trending-up",   sub:"Redes, email o ads" },
  { id:"app",      label:"App / Producto",icon:"folder",        sub:"App o producto digital" },
  { id:"other",    label:"Otro",          icon:"list-todo",     sub:"Proyecto personalizado" },
];

const TOTAL_STEPS = 2;

// Servicios que puede incluir un proyecto. Cada servicio marcado añade su fase
// con sus tareas al setup — sin IA, todo predefinido.
const PROJECT_SERVICES = [
  { id:"web-design",  label:"Diseño web",      icon:"image",       tasks:[
    "Recopilar referencias y briefing", "Arquitectura y wireframes", "Diseño UI en Figma",
    "Diseño responsive (móvil)", "Revisión con el cliente", "Ajustes finales de diseño" ] },
  { id:"web-dev",     label:"Desarrollo web",  icon:"list-todo",   tasks:[
    "Maquetación HTML/CSS", "Programación front-end", "Integración CMS/backend",
    "Formularios y contacto", "Pruebas en navegadores", "Puesta en producción" ] },
  { id:"branding",    label:"Branding",        icon:"sparkles",    tasks:[
    "Investigación de marca", "Propuestas de logo", "Paleta y tipografías",
    "Manual de marca", "Entrega de assets" ] },
  { id:"ecommerce",   label:"E-commerce",      icon:"package",     tasks:[
    "Configurar la tienda", "Cargar productos", "Métodos de pago",
    "Envíos e impuestos", "Pruebas de compra" ] },
  { id:"seo",         label:"SEO",             icon:"search",      tasks:[
    "Auditoría SEO inicial", "Estudio de palabras clave", "Optimización on-page",
    "Metadatos y sitemap", "Alta en Search Console" ] },
  { id:"content",     label:"Contenido",       icon:"edit",        tasks:[
    "Definir tono y mensajes", "Redactar textos de páginas", "Seleccionar imágenes",
    "Revisión ortográfica" ] },
  { id:"ads",         label:"Marketing / Ads", icon:"megaphone",   tasks:[
    "Estrategia de campaña", "Definir públicos", "Diseñar creatividades",
    "Configurar campañas", "Seguimiento y optimización" ] },
  { id:"social",      label:"Redes sociales",  icon:"users",       tasks:[
    "Plan de contenidos", "Diseño de plantillas", "Calendario mensual",
    "Programar publicaciones" ] },
  { id:"maintenance", label:"Mantenimiento",   icon:"refresh-cw",  tasks:[
    "Copias de seguridad", "Actualizaciones", "Monitorización", "Informe mensual" ] },
];
// Disponible globalmente para reconstruir las fases desde el campo service del
// proyecto (persistido en la nube), sin copias locales.
window.PROJECT_SERVICES = PROJECT_SERVICES;

const NewProjectModal = ({ open, onClose, onCreate, prefilledClientId }) => {
  const D = window.Data;
  D.useStore && D.useStore();
  const toast = useToast();

  const blank = () => ({ name: "", clientId: prefilledClientId || "", deadline: "", recurring: false });

  const [step, setStep]           = useState(0);
  const [a, setA]                 = useState(blank);
  const [searching, setSearching] = useState(false);
  const [cq, setCq]               = useState("");
  const [phases, setPhases]       = useState([]);   // nombres de fases (libres)
  const [phaseInput, setPhaseInput] = useState(""); // fase que se está escribiendo
  const [creating, setCreating]   = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep(0); setA(blank()); setSearching(false); setCq(""); setPhases([]); setPhaseInput(""); setCreating(false);
  }, [open]);

  const set = (k, v) => setA(p => ({ ...p, [k]: v }));
  const addPhase = (name) => {
    const v = (name || "").trim();
    if (!v) return;
    setPhases(ps => ps.includes(v) ? ps : [...ps, v]);
    setPhaseInput("");
  };
  const removePhase = (name) => setPhases(ps => ps.filter(x => x !== name));

  // Accesos rápidos: las 4 fases de la metodología de la agencia
  const SUGGESTED_PHASES = [
    "Onboarding y estrategia", "Auditoría y diagnóstico",
    "Diseño y producción", "Lanzamiento y optimización",
  ];

  const hasClients = D.CLIENTS.length > 0;
  const filtered = D.CLIENTS.filter(c =>
    (c.name || "").toLowerCase().includes(cq.toLowerCase()) ||
    (c.company || "").toLowerCase().includes(cq.toLowerCase())
  );
  const selClient = D.CLIENTS.find(c => c.id === a.clientId);

  const canNext = [
    // Cliente opcional (proyectos internos). Puntual necesita fecha; recurrente no.
    !!(a.name.trim() && (a.recurring || a.deadline)),
    true,   // las fases son opcionales: se puede crear un proyecto vacío
  ];

  const submit = async () => {
    if (creating) return;
    setCreating(true);
    // Crear el proyecto con sus fases (nombres libres). Sin tareas: las creas tú
    // dentro de cada fase. Las fases se guardan en el campo service del proyecto.
    const res = await D.addProjectAsync({
      name: a.name.trim(), clientId: a.clientId || null,
      deadline: a.recurring ? "" : a.deadline,
      recurring: a.recurring,
      template: phases.join(", ") || "libre",
    });
    const p = res && res.project;
    if (!p) {
      setCreating(false);
      toast((res && res.error) ? res.error : "No se pudo crear el proyecto", "error");
      return;
    }
    toast(
      phases.length
        ? `Proyecto "${p.name}" creado con ${phases.length} fase${phases.length === 1 ? "" : "s"}`
        : `Proyecto "${p.name}" creado`,
      "success"
    );
    setCreating(false);
    onClose(); onCreate && onCreate(p);
  };

  const STEP_LABELS = ["Básicos", "Fases"];

  // ── Paso 0: Básicos ──────────────────────────────────────────
  const renderStep0 = () => (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div>
        <div className="label">Tipo de proyecto</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {[
            { id:false, title:"Puntual", sub:"Trabajo con entrega", icon:"flag" },
            { id:true,  title:"Recurrente", sub:"Mensual (ej. redes)", icon:"refresh-cw" },
          ].map(opt => {
            const on = a.recurring === opt.id;
            return (
              <button key={String(opt.id)} onClick={() => set("recurring", opt.id)} style={{
                display:"flex", alignItems:"center", gap:10, textAlign:"left",
                padding:"11px 13px", borderRadius:12, cursor:"pointer", fontFamily:"inherit",
                background: on ? "rgba(158,154,229,0.14)" : "rgba(255,255,255,0.03)",
                border: on ? "0.5px solid rgba(158,154,229,0.5)" : "0.5px solid var(--border)",
                transition:"all .12s",
              }}>
                <div style={{ width:30, height:30, borderRadius:9, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center",
                  background: on ? "rgba(158,154,229,0.18)" : "rgba(255,255,255,0.05)", color: on ? "var(--accent)" : "var(--text-subtle)" }}>
                  <Icon name={opt.icon} size={15} strokeWidth={1.7}/>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13.5, letterSpacing:"-0.3px", color: on ? "var(--text)" : "var(--text-muted)" }}>{opt.title}</div>
                  <div style={{ fontSize:11, color:"var(--text-subtle)", marginTop:1 }}>{opt.sub}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <div className="label">Nombre del proyecto</div>
        <input className="input" placeholder="Ej. Rediseño web 2026" value={a.name} onChange={e => set("name", e.target.value)} autoFocus/>
      </div>
      <div style={{ position:"relative" }}>
        <div className="label">Cliente <span style={{ color:"var(--text-subtle)", fontWeight:400 }}>(opcional)</span></div>
        <button className="input row tight" style={{ textAlign:"left", height:38 }} onClick={() => setSearching(s => !s)}>
          {selClient ? (
            <><Avatar size="sm" name={selClient.name} initials={selClient.initials} color={selClient.color}/>
              <span className="grow" style={{ textAlign:"left" }}>{[selClient.name, selClient.company].filter(Boolean).join(" · ")}</span>
              <Icon name="chevron" size={12} style={{ transform:"rotate(90deg)" }}/></>
          ) : (
            <><span className="grow muted" style={{ textAlign:"left" }}>Sin cliente · proyecto interno</span>
              <Icon name="chevron" size={12} style={{ transform:"rotate(90deg)" }}/></>
          )}
        </button>
        {searching && (
          <div style={{ marginTop:6, background:"var(--bg-elev-2)", border:"0.5px solid var(--border-strong)", borderRadius:10, overflow:"hidden" }}>
            <div style={{ padding:8, borderBottom:"0.5px solid var(--border)" }}>
              <div className="search"><Icon name="search" size={13}/><input autoFocus placeholder="Buscar…" value={cq} onChange={e => setCq(e.target.value)}/></div>
            </div>
            <div style={{ maxHeight:200, overflowY:"auto" }}>
              {/* Opción sin cliente — proyecto interno */}
              <div onClick={() => { set("clientId", ""); setSearching(false); }}
                style={{ padding:"8px 12px", display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div style={{ width:26, height:26, borderRadius:8, flexShrink:0, display:"grid", placeItems:"center",
                  background:"rgba(255,255,255,0.05)", border:"0.5px solid var(--border)", color:"var(--text-muted)" }}>
                  <Icon name="folder" size={13}/>
                </div>
                <span className="grow small">Sin cliente · proyecto interno</span>
                {!a.clientId && <Icon name="check" size={13}/>}
              </div>
              {filtered.map(c => (
                <div key={c.id} onClick={() => { set("clientId", c.id); setSearching(false); }}
                  style={{ padding:"8px 12px", display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <Avatar size="sm" name={c.name} initials={c.initials} color={c.color}/>
                  <span className="grow small">{[c.name, c.company].filter(Boolean).join(" · ")}</span>
                  {c.id === a.clientId && <Icon name="check" size={13}/>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {a.recurring ? (
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 13px", borderRadius:10,
          background:"rgba(158,154,229,0.08)", border:"0.5px solid rgba(158,154,229,0.25)", fontSize:12.5, color:"var(--text-muted)" }}>
          <Icon name="refresh-cw" size={14} style={{ color:"var(--accent)" }}/>
          <span>Servicio mensual: se renueva cada mes, sin fecha de entrega fija.</span>
        </div>
      ) : (
        <div>
          <div className="label">Fecha de entrega</div>
          <input className="input" type="date" value={a.deadline} onChange={e => set("deadline", e.target.value)}/>
        </div>
      )}
    </div>
  );

  // ── Paso 1: Fases (nombres libres) ───────────────────────────
  const renderStep1 = () => {
    const available = SUGGESTED_PHASES.filter(s => !phases.includes(s));
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <div style={{ fontSize:12.5, color:"var(--text-muted)", letterSpacing:"-0.2px", lineHeight:1.5 }}>
          Añade las fases del proyecto. Las tareas de cada fase las creas tú luego dentro del proyecto.
          Puedes crearlo sin fases y organizarlo después.
        </div>

        {/* Input para escribir una fase */}
        <div className="row tight">
          <input className="input" placeholder="Nombre de la fase…" value={phaseInput}
            onChange={e => setPhaseInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addPhase(phaseInput); } }}
            style={{ flex:1 }}/>
          <button className="btn" disabled={!phaseInput.trim()} onClick={() => addPhase(phaseInput)}>
            <Icon name="plus" size={13}/> Añadir
          </button>
        </div>

        {/* Accesos rápidos a la metodología */}
        {available.length > 0 && (
          <div>
            <div style={{ fontSize:11.5, color:"var(--text-subtle)", marginBottom:7 }}>Tu metodología (toca para añadir)</div>
            <div className="row tight" style={{ flexWrap:"wrap", gap:6 }}>
              {available.map(s => (
                <button key={s} onClick={() => addPhase(s)} className="chip"
                  style={{ cursor:"pointer", fontSize:12, padding:"5px 11px" }}>
                  <Icon name="plus" size={11}/> {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Fases añadidas */}
        {phases.length > 0 && (
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {phases.map((n, i) => (
              <div key={n} style={{ display:"flex", alignItems:"center", gap:10,
                padding:"10px 13px", borderRadius:10, background:"rgba(255,255,255,0.03)", border:"0.5px solid var(--border)" }}>
                <span style={{ fontSize:11, color:"var(--text-subtle)", width:16, flexShrink:0 }}>{i + 1}</span>
                <span style={{ flex:1, fontSize:13.5 }}>{n}</span>
                <button className="btn ghost icon-only sm" onClick={() => removePhase(n)} style={{ color:"var(--text-subtle)" }}>
                  <Icon name="x" size={12}/>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const steps = [renderStep0, renderStep1];

  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal lg" style={{ maxWidth:600 }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">Nuevo proyecto</div>
            <div className="modal-sub">{STEP_LABELS[step]} · {step + 1} / {TOTAL_STEPS}</div>
          </div>
          <button className="btn ghost icon-only sm" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>
        <div style={{ padding:"0 24px" }}>
          <div style={{ height:3, background:"var(--border)", borderRadius:99, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${(step / (TOTAL_STEPS - 1)) * 100}%`, background:"var(--accent)", borderRadius:99, transition:"width .25s ease" }}/>
          </div>
        </div>
        <div className="modal-body" style={{ minHeight:200, maxHeight:"58vh", overflowY:"auto", scrollbarWidth:"none" }}>
          {steps[step]()}
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={() => step === 0 ? onClose() : setStep(s => s - 1)}>
            {step === 0 ? "Cancelar" : <><Icon name="chevron" size={12} style={{ transform:"rotate(180deg)" }}/> Atrás</>}
          </button>
          {step < TOTAL_STEPS - 1 ? (
            <button className="btn primary" disabled={!canNext[step]} onClick={() => setStep(s => s + 1)}>
              Siguiente <Icon name="chevron" size={12}/>
            </button>
          ) : (
            <button className="btn primary" disabled={!canNext[step] || creating} onClick={submit}>
              {creating ? "Creando…" : <><Icon name="check" size={12}/> Crear proyecto</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const NewClientModal = ({ open, onClose, onCreated, onCreateProject }) => {
  const D = window.Data;
  const [step, setStep] = useState("form");
  const [data, setData] = useState({ name: "", email: "", phone: "", company: "", sector: "" });
  const [createdId, setCreatedId] = useState(null);
  const [sectorOpen, setSectorOpen] = useState(false);
  const toast = useToast();

  // Cerrar el desplegable de sector al hacer clic fuera
  useEffect(() => {
    if (!sectorOpen) return;
    const close = () => setSectorOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [sectorOpen]);

  const submit = () => {
    if (!data.name.trim()) return toast("El nombre es obligatorio", "warn");
    const c = D.addClient(data);
    setCreatedId(c.id);
    toast(`${c.company} añadido a clientes`, "success");
    setStep("ask");
  };

  const reset = () => { setStep("form"); setData({ name:"", email:"", phone:"", company:"", sector:"" }); setCreatedId(null); };

  if (!open) return null;

  if (step === "ask") {
    return (
      <Modal open={true} onClose={() => { reset(); onClose(); }} title="Cliente creado" sub={`${data.company || data.name} ya está en tu lista de clientes`} footer={
        <>
          <button className="btn" onClick={() => { reset(); onClose(); }}>Más tarde</button>
          <button className="btn primary" onClick={() => { reset(); onClose(); onCreateProject && onCreateProject(createdId); }}>
            <Icon name="plus" size={12}/> Crear primer proyecto ahora
          </button>
        </>
      }>
        <div className="row" style={{gap: 14, alignItems:"center"}}>
          <div style={{width: 48, height: 48, borderRadius: 12, background:"var(--green-soft)", color:"var(--green)", display:"grid", placeItems:"center"}}>
            <Icon name="check" size={20}/>
          </div>
          <div>
            <div style={{fontWeight: 500}}>¿Quieres crear ya un proyecto para {(data.name || "este cliente").split(" ")[0]}?</div>
            <div className="muted small" style={{marginTop: 4}}>Te ahorramos el clic. Si no, podrás hacerlo desde su ficha.</div>
          </div>
        </div>
      </Modal>
    );
  }

  const SECTORES = ["Restauración","Moda / Retail","Salud / Bienestar","Tecnología","Educación","Inmobiliaria","Hostelería","Deporte / Fitness","ONG / Social","Consultoría","Arte / Cultura","Construcción","Alimentación","Otro"];

  // Base quick-create: × circular + etiqueta centrada + ↑ enviar, título gigante
  // editable y, debajo, las entradas en columnas (sin pestañas).
  const canSubmit = !!data.name.trim();
  const FIELD = {
    width:"100%", padding:"12px 16px", fontSize:14, borderRadius:14,
    background:"rgba(255,255,255,0.04)", border:"0.5px solid rgba(255,255,255,0.1)",
    color:"var(--text)", outline:"none", fontFamily:"inherit", letterSpacing:"-0.3px",
    transition:"border-color .2s, background .2s",
  };

  return (
    <div onClick={() => { reset(); onClose(); }} style={{
      position:"fixed", inset:0, zIndex:200, background:"rgba(0,0,0,0.6)",
      backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:24,
      animation:"fade .15s ease-out",
    }}>
      <style>{`.od-input:focus { border-color: rgba(158,154,229,0.5) !important; background: rgba(158,154,229,0.05) !important; }`}</style>
      <div onClick={e => e.stopPropagation()} style={{
        width:"100%", maxWidth:520, maxHeight:"90vh", overflowY:"auto",
        background:"#0e0e10", border:"1px solid #232324", borderRadius:32,
        boxShadow:"0 40px 90px rgba(0,0,0,0.6)",
        animation:"pop .2s cubic-bezier(.2,.8,.2,1)",
        display:"flex", flexDirection:"column",
      }}>
        {/* Barra superior: × · etiqueta · ↑ */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"22px 22px 0" }}>
          <button onClick={() => { reset(); onClose(); }} style={{
            width:40, height:40, borderRadius:"50%",
            background:"rgba(255,255,255,0.08)", border:"0.5px solid rgba(255,255,255,0.1)",
            cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
            color:"var(--text-muted)",
          }}>
            <Icon name="x" size={15}/>
          </button>
          <div style={{ fontSize:13, color:"var(--text-subtle)", letterSpacing:"-0.5px" }}>Nuevo cliente</div>
          <button onClick={submit} style={{
            width:40, height:40, borderRadius:"50%",
            background: canSubmit ? "var(--accent)" : "rgba(255,255,255,0.08)",
            border:"none", cursor: canSubmit ? "pointer" : "default",
            display:"flex", alignItems:"center", justifyContent:"center",
            color:"#fff", transition:"all .15s", opacity: canSubmit ? 1 : 0.4,
          }}>
            <Icon name="arrow-up" size={15}/>
          </button>
        </div>

        {/* Título gigante + empresa */}
        <div style={{ padding:"28px 28px 8px" }}>
          <input
            autoFocus
            placeholder="Nombre del cliente..."
            value={data.name}
            onChange={e => setData({ ...data, name: e.target.value })}
            onKeyDown={e => { if (e.key === "Enter" && canSubmit) submit(); }}
            style={{
              width:"100%", background:"transparent", border:"none", outline:"none",
              fontSize:28, fontWeight:400, letterSpacing:"-1.4px",
              color: data.name ? "var(--text)" : "rgba(255,255,255,0.15)",
              fontFamily:"var(--font-display)", caretColor:"var(--accent)",
            }}
          />
          <input
            placeholder="Empresa (opcional)"
            value={data.company}
            onChange={e => setData({ ...data, company: e.target.value })}
            style={{
              width:"100%", background:"transparent", border:"none", outline:"none",
              fontSize:14, letterSpacing:"-0.5px", marginTop:8,
              color: data.company ? "var(--text-muted)" : "rgba(255,255,255,0.13)",
              fontFamily:"var(--font-sans)", caretColor:"var(--accent)",
            }}
          />
        </div>

        {/* Entradas en columnas */}
        <div style={{ padding:"20px 28px 26px", display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <input className="od-input" style={FIELD} type="email" placeholder="ana@empresa.com" value={data.email}
              onChange={e => setData({ ...data, email: e.target.value })}/>
            <input className="od-input" style={FIELD} type="tel" placeholder="+34 600 000 000" value={data.phone}
              onChange={e => setData({ ...data, phone: e.target.value })}/>
          </div>
          {/* Sector — desplegable */}
          <div style={{ position:"relative" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setSectorOpen(o => !o)} style={{
              ...FIELD, cursor:"pointer", textAlign:"left",
              display:"flex", alignItems:"center", justifyContent:"space-between", gap:10,
              color: data.sector ? "var(--text)" : "var(--text-subtle)",
              borderColor: sectorOpen ? "rgba(158,154,229,0.5)" : "rgba(255,255,255,0.1)",
            }}>
              <span style={{ display:"flex", alignItems:"center", gap:8 }}>
                <Icon name="tag" size={13} style={{ color: data.sector ? "var(--accent)" : "var(--text-subtle)" }}/>
                {data.sector || "Sector (opcional)"}
              </span>
              <Icon name="chevron-down" size={13} style={{
                opacity:0.5, transform: sectorOpen ? "rotate(180deg)" : "none", transition:"transform .15s",
              }}/>
            </button>
            {sectorOpen && (
              <div style={{
                position:"absolute", left:0, right:0, bottom:"calc(100% + 8px)", zIndex:30,
                background:"#1a1a1c", border:"0.5px solid rgba(255,255,255,0.1)",
                borderRadius:14, padding:6, maxHeight:224, overflowY:"auto",
                boxShadow:"0 12px 40px rgba(0,0,0,0.55)",
              }}>
                {data.sector && (
                  <button onClick={() => { setData({ ...data, sector:"" }); setSectorOpen(false); }} style={{
                    display:"block", width:"100%", textAlign:"left", padding:"9px 12px",
                    borderRadius:9, border:0, background:"transparent", cursor:"pointer",
                    fontSize:13, fontFamily:"inherit", color:"var(--text-subtle)", letterSpacing:"-0.3px",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    Sin sector
                  </button>
                )}
                {SECTORES.map(s => {
                  const on = data.sector === s;
                  return (
                    <button key={s} onClick={() => { setData({ ...data, sector: s }); setSectorOpen(false); }} style={{
                      display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%",
                      textAlign:"left", padding:"9px 12px", borderRadius:9, border:0, cursor:"pointer",
                      background: on ? "rgba(158,154,229,0.1)" : "transparent",
                      fontSize:13, fontFamily:"inherit", letterSpacing:"-0.3px",
                      color: on ? "var(--accent)" : "var(--text)",
                    }}
                      onMouseEnter={e => { if (!on) e.currentTarget.style.background = "var(--bg-hover)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = on ? "rgba(158,154,229,0.1)" : "transparent"; }}>
                      {s}
                      {on && <Icon name="check" size={13}/>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ApproveDeliverableModal = ({ open, onClose, deliverable }) => {
  const [comment, setComment] = useState("");
  const toast = useToast();
  const d = deliverable || { title: "Mockups landing v3", type: "Diseño", thumb: "linear-gradient(135deg,#1f2937,#0f172a)", version: "v3", date: "7 may" };

  return (
    <Modal open={open} onClose={onClose} title="Revisar entregable" sub={d.title + " · " + d.version} size="lg" footer={
      <>
        <button className="btn" onClick={onClose}>Cancelar</button>
        <button className="btn" style={{borderColor:"var(--amber)", color:"var(--amber)"}} onClick={() => { toast("Cambios solicitados al equipo", "warn"); onClose(); }}>
          <Icon name="msg-circle" size={12}/> Pedir cambios
        </button>
        <button className="btn primary" onClick={() => { toast("¡Entregable aprobado! Gracias.", "success"); onClose(); }}>
          <Icon name="thumbs-up" size={12}/> Aprobar
        </button>
      </>
    }>
      <div style={{aspectRatio:"16/8", background: d.thumb, borderRadius: 10, marginBottom: 16, position:"relative", overflow:"hidden"}}>
        <div style={{position:"absolute", top: 12, left: 12, color:"#fff", fontSize: 11, opacity: 0.7}}>{d.type} · {d.version}</div>
        <div style={{position:"absolute", bottom: 12, right: 12}}>
          <button className="btn sm" style={{background:"rgba(0,0,0,0.4)", color:"#fff", borderColor:"rgba(255,255,255,0.2)"}}><Icon name="download" size={12}/> Descargar</button>
        </div>
      </div>

      <div className="row between" style={{marginBottom: 14}}>
        <div className="row tight muted small">
          <Icon name="paperclip" size={12}/> 4 archivos · 18.4 MB
          <span className="vdiv"/>
          <Icon name="calendar" size={12}/> Subido {d.date}
        </div>
        <div className="row tight">
          <button className="btn ghost sm"><Icon name="external-link" size={12}/> Pantalla completa</button>
        </div>
      </div>

      <div className="label">Comentario (opcional)</div>
      <textarea className="textarea" rows={3} placeholder="Cuéntale al equipo qué te ha parecido o qué cambiarías…" value={comment} onChange={e => setComment(e.target.value)}/>
      <div className="row tight" style={{marginTop: 10, color:"var(--text-muted)", fontSize: 12}}>
        <Icon name="info" size={12}/>
        <span>Si pides cambios, el comentario se enviará al equipo y volveremos a notificarte cuando haya nueva versión.</span>
      </div>
    </Modal>
  );
};

const NewTaskModal = ({ open, onClose }) => {
  const D = window.Data;
  D.useStore && D.useStore();
  const toast = useToast();
  const [title, setTitle]           = useState("");
  const [column, setColumn]         = useState("todo");
  const [assignee, setAssignee]     = useState("Tú");
  const [clientSearch, setClientSearch] = useState("");
  const [clientOpen, setClientOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [projectId, setProjectId]   = useState("__none__");

  const COLUMNS = [
    { id:"todo",   label:"Por hacer" },
    { id:"doing",  label:"En curso" },
    { id:"review", label:"Revisión" },
    { id:"done",   label:"Hecho" },
  ];

  const allClients = D.CLIENTS || [];
  const filteredClients = clientSearch.trim()
    ? allClients.filter(c =>
        c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
        (c.company || "").toLowerCase().includes(clientSearch.toLowerCase()))
    : allClients;

  const clientProjects = selectedClient
    ? (D.PROJECTS || []).filter(p => p.clientId === selectedClient.id)
    : [];

  const pickClient = (c) => {
    setSelectedClient(c);
    setClientSearch(c.name + (c.company ? ` — ${c.company}` : ""));
    setClientOpen(false);
    setProjectId("__none__");
  };

  const reset = () => {
    setTitle(""); setColumn("todo"); setAssignee("Tú");
    setClientSearch(""); setSelectedClient(null); setProjectId("__none__"); setClientOpen(false);
  };

  const submit = () => {
    if (!title.trim()) { toast("Escribe el nombre de la tarea", "warn"); return; }
    D.addTask({
      projectId,
      title: title.trim(),
      column,
      assignee,
      clientId:   selectedClient?.id   || null,
      clientName: selectedClient?.company || selectedClient?.name || null,
    });
    toast("Tarea añadida", "success");
    reset(); onClose();
  };

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }}
      title="Nueva tarea" sub="Asigna una tarea a un cliente o proyecto."
      footer={
        <>
          <button className="btn" onClick={() => { reset(); onClose(); }}>Cancelar</button>
          <button className="btn primary" onClick={submit}>
            <Icon name="plus" size={12}/> Crear tarea
          </button>
        </>
      }>
      <div style={{display:"flex", flexDirection:"column", gap:14}}>

        <div>
          <div className="label">Nombre de la tarea</div>
          <input className="input" autoFocus placeholder="Ej. Preparar propuesta de diseño"
            value={title} onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}/>
        </div>

        {/* Client combobox */}
        <div style={{position:"relative"}}>
          <div className="label">Cliente <span style={{color:"var(--text-subtle)"}}>(opcional)</span></div>
          <input className="input" placeholder="Buscar cliente…"
            value={clientSearch}
            onChange={e => { setClientSearch(e.target.value); setClientOpen(true); setSelectedClient(null); setProjectId("__none__"); }}
            onFocus={() => setClientOpen(true)}
            onBlur={() => setTimeout(() => setClientOpen(false), 150)}/>
          {clientOpen && filteredClients.length > 0 && (
            <div style={{position:"absolute", top:"100%", left:0, right:0, zIndex:50, marginTop:4,
              background:"var(--bg-elev-2)", border:"0.5px solid var(--border-strong)",
              borderRadius:10, overflow:"hidden", boxShadow:"0 8px 24px rgba(0,0,0,0.2)"}}>
              {filteredClients.slice(0,6).map(c => (
                <div key={c.id} onMouseDown={() => pickClient(c)}
                  style={{padding:"10px 14px", cursor:"pointer", display:"flex", alignItems:"center", gap:10,
                    fontSize:13, borderBottom:"0.5px solid var(--border)"}}
                  onMouseEnter={e => e.currentTarget.style.background="var(--bg-hover)"}
                  onMouseLeave={e => e.currentTarget.style.background=""}>
                  <div style={{width:28, height:28, borderRadius:8, background:c.color+"22",
                    color:c.color, display:"grid", placeItems:"center", fontSize:11, fontWeight:600, flexShrink:0}}>
                    {c.initials}
                  </div>
                  <div>
                    <div style={{fontWeight:500}}>{c.name}</div>
                    <div style={{fontSize:11, color:"var(--text-subtle)"}}>{c.company}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Project selector — only if client selected */}
        <div>
          <div className="label">Proyecto <span style={{color:"var(--text-subtle)"}}>(opcional)</span></div>
          <select className="select" value={projectId} onChange={e => setProjectId(e.target.value)}
            disabled={!selectedClient && clientProjects.length === 0}>
            <option value="__none__">Sin proyecto específico</option>
            {clientProjects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
            {!selectedClient && (D.PROJECTS || []).length > 0 && (
              (D.PROJECTS || []).map(p => (
                <option key={p.id} value={p.id}>{p.name} · {p.clientName}</option>
              ))
            )}
          </select>
        </div>


      </div>
    </Modal>
  );
};

Object.assign(window, { NewProjectModal, NewClientModal, ApproveDeliverableModal, NewTaskModal });

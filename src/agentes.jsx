// Agency Agentes — equipo de especialistas + ficha de agente (MOCKUP ESTÁTICO)
// Nada conectado: sin Supabase, sin API. Datos hardcodeados. Botones = console.log.

// Estados visuales de cada agente
const AGENT_STATUS = {
  working: { label: "Trabajando", dot: "var(--green)" },
  active:  { label: "Activo",     dot: "var(--accent)" },
  paused:  { label: "En pausa",   dot: "var(--text-subtle)" },
};

// Estados de un entregable
const DELIV_STATUS = {
  pending:  { label: "Pendiente de revisar", color: "var(--amber)", soft: "var(--amber-soft)" },
  approved: { label: "Aprobado",             color: "var(--green)", soft: "var(--green-soft)" },
  rejected: { label: "Rechazado",            color: "var(--red)",   soft: "var(--red-soft)" },
};

// Datos de ejemplo (mock). "Social Media" va poblado del todo.
const AGENTS = [
  {
    id:"social", icon:"msg-circle", name:"Social Media", role:"Contenido de redes", status:"working",
    skill:"Calendario, copys y briefs de imagen",
    task:"Contenido IG semana · Gust i Tradició", stat:"12 entregables este mes",
    lastActivity:"hace 2h",
    skills:["Calendario de contenido", "Copys de marca", "Briefs de imagen", "Stories"],
    chat:[
      { role:"user",  content:"Hazme el contenido de Instagram de esta semana para Gust i Tradició." },
      { role:"agent", content:"Hecho. He preparado 5 piezas para la semana del 23 al 29, en catalán y con el tono sobrio de Gust. Las tienes en Entregables para revisar." },
      { role:"user",  content:"La pieza 3 hazla más centrada en el producto de temporada." },
      { role:"agent", content:"Regenerada la pieza 3 con foco en producto de temporada. Lista para revisar." },
    ],
    deliverables:[
      { title:"Contenido IG · semana 23-29 jun", date:"hoy",          status:"pending" },
      { title:"Story horarios Sant Joan",        date:"hace 2 días",  status:"approved" },
      { title:"Post producto de temporada",      date:"hace 4 días",  status:"approved" },
      { title:"Reel inauguración",               date:"hace 1 semana", status:"rejected" },
    ],
  },
  { id:"copy", icon:"edit", name:"Copywriting", role:"Textos", status:"active",
    skill:"Copy de marca, anuncios, webs", task:null, stat:"8 entregables este mes", lastActivity:"ayer" },
  { id:"image", icon:"image", name:"Imagen IA", role:"Dirección visual", status:"active",
    skill:"Briefs y generación con Freepik", task:null, stat:"20 entregables este mes", lastActivity:"hace 3h" },
  { id:"web", icon:"command", name:"Web", role:"Desarrollo", status:"paused",
    skill:"Shopify, Framer, conversión", task:null, stat:"3 entregables este mes", lastActivity:"hace 5 días" },
  { id:"ads", icon:"megaphone", name:"Ads", role:"Campañas", status:"active",
    skill:"Meta y Google Ads", task:null, stat:"5 entregables este mes", lastActivity:"hace 1h" },
  { id:"email", icon:"mail", name:"Email/CRM", role:"Email marketing", status:"paused",
    skill:"Secuencias y campañas Klaviyo", task:null, stat:"4 entregables este mes", lastActivity:"hace 6 días" },
  { id:"outreach", icon:"send", name:"Outreach", role:"Captación", status:"active",
    skill:"Cold email, Apollo e Instantly", task:"Prospección streetwear", stat:"30 leads este mes", lastActivity:"hace 30 min" },
];

const agentesLog = (what) => console.log("[Agentes mock]", what);

// Pill de estado reutilizable (puntito + etiqueta)
const StatusPill = ({ status }) => {
  const s = AGENT_STATUS[status] || AGENT_STATUS.active;
  return (
    <div style={{
      display:"inline-flex", alignItems:"center", gap:6, flexShrink:0,
      padding:"3px 9px 3px 8px", borderRadius:99,
      background:"var(--bg-elev-2)", border:"0.5px solid var(--border)",
    }}>
      <span style={{width:6, height:6, borderRadius:"50%", background:s.dot, flexShrink:0}}/>
      <span style={{fontSize:11, color:"var(--text-muted)", letterSpacing:"-0.2px"}}>{s.label}</span>
    </div>
  );
};

// ── Página: lista de agentes ─────────────────────────────────────────────
const AgentesPage = ({ navigate }) => {

  const AgentCard = ({ a }) => (
    <div
      onClick={() => navigate("agente", { agentId: a.id })}
      style={{
        display:"flex", flexDirection:"column", gap:13,
        padding:"16px 17px", borderRadius:14,
        background:"var(--bg-elev)", border:"0.5px solid var(--border)",
        cursor:"pointer", transition:"border-color .15s, background .15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "var(--bg-elev-2)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg-elev)"; }}
    >
      <div style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10}}>
        <div style={{display:"flex", alignItems:"center", gap:11, minWidth:0}}>
          <div style={{
            width:38, height:38, borderRadius:10, flexShrink:0,
            display:"flex", alignItems:"center", justifyContent:"center",
            background:"var(--bg-elev-2)", border:"0.5px solid var(--border)", color:"var(--text)",
          }}>
            <Icon name={a.icon} size={17} strokeWidth={1.7}/>
          </div>
          <div style={{minWidth:0}}>
            <div style={{fontSize:14, fontWeight:500, color:"var(--text)", letterSpacing:"-0.4px",
              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{a.name}</div>
            <div style={{fontSize:12, color:"var(--text-muted)", marginTop:1, letterSpacing:"-0.2px"}}>{a.role}</div>
          </div>
        </div>
        <StatusPill status={a.status}/>
      </div>

      <div style={{fontSize:12.5, color:"var(--text-muted)", lineHeight:1.4, letterSpacing:"-0.2px"}}>
        {a.skill}
      </div>

      <div style={{fontSize:12.5, letterSpacing:"-0.2px", lineHeight:1.4}}>
        {a.task ? (
          <span>
            <span style={{color:"var(--text-subtle)"}}>Tarea actual: </span>
            <span style={{color:"var(--text)"}}>{a.task}</span>
          </span>
        ) : (
          <span style={{color:"var(--text-subtle)"}}>Sin tareas</span>
        )}
      </div>

      <div style={{
        borderTop:"0.5px solid var(--border)", paddingTop:11, marginTop:1,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        fontSize:11, color:"var(--text-subtle)", letterSpacing:"-0.1px",
      }}>
        <span>{a.stat}</span>
        <Icon name="chevron-right" size={14} style={{color:"var(--text-subtle)"}}/>
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Agentes</h1>
          <div className="sub">Tu equipo de especialistas</div>
        </div>
      </div>

      {/* Nora — orquestadora */}
      <div
        onClick={() => agentesLog("Abrir Nora")}
        style={{
          display:"flex", alignItems:"center", gap:18,
          padding:"22px 24px", borderRadius:16, marginBottom:22,
          background:"linear-gradient(135deg, var(--accent-soft), var(--bg-elev))",
          border:"0.5px solid var(--border-strong)",
          cursor:"pointer", transition:"border-color .15s",
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
        onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border-strong)"}
      >
        <div style={{
          width:54, height:54, borderRadius:14, flexShrink:0,
          display:"flex", alignItems:"center", justifyContent:"center",
          background:"var(--accent-soft)", border:"0.5px solid rgba(158,154,229,0.4)", color:"var(--accent)",
        }}>
          <Icon name="sparkles" size={26} strokeWidth={1.6}/>
        </div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{display:"flex", alignItems:"center", gap:10, flexWrap:"wrap"}}>
            <span style={{fontSize:20, fontWeight:500, color:"var(--text)", letterSpacing:"-0.8px"}}>Nora</span>
            <span style={{
              display:"inline-flex", alignItems:"center",
              fontSize:11, padding:"3px 10px", borderRadius:99,
              background:"var(--accent-soft)", color:"var(--accent)", letterSpacing:"-0.2px",
            }}>Orquestadora · reparte el trabajo</span>
          </div>
          <div style={{fontSize:13.5, color:"var(--text-muted)", marginTop:5, letterSpacing:"-0.3px", lineHeight:1.45}}>
            Recibe tus encargos y los delega al especialista correcto.
          </div>
        </div>
        <Icon name="chevron-right" size={18} style={{color:"var(--text-subtle)", flexShrink:0}}/>
      </div>

      {/* Rejilla de subagentes */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",
        gap:16,
      }}>
        {AGENTS.map(a => <AgentCard key={a.id} a={a}/>)}
      </div>
    </div>
  );
};

// Mensaje de chat — reutiliza el patrón visual del chat de Nora
const AgentChatMessage = ({ m, icon }) => {
  if (m.role === "user") {
    return (
      <div style={{alignSelf:"flex-end", maxWidth:"85%"}}>
        <div style={{
          background:"var(--accent)", color:"var(--accent-fg)",
          padding:"8px 12px", borderRadius:"12px 12px 4px 12px",
          fontSize:13.5, lineHeight:1.5, whiteSpace:"pre-wrap",
        }}>{m.content}</div>
      </div>
    );
  }
  return (
    <div style={{alignSelf:"flex-start", maxWidth:"92%", display:"flex", gap:8}}>
      <div style={{
        width:22, height:22, borderRadius:6, flexShrink:0,
        background:"linear-gradient(135deg,#a78bfa 0%,#60a5fa 100%)",
        display:"grid", placeItems:"center", color:"#fff", marginTop:2,
      }}>
        <Icon name={icon} size={11}/>
      </div>
      <div style={{flex:1, minWidth:0, fontSize:13.5, lineHeight:1.6, color:"var(--text)", whiteSpace:"pre-wrap"}}>
        {m.content}
      </div>
    </div>
  );
};

// ── Página: ficha de un agente ───────────────────────────────────────────
const AgenteDetail = ({ navigate, agentId }) => {
  const a = AGENTS.find(x => x.id === agentId) || AGENTS[0];
  const s = AGENT_STATUS[a.status] || AGENT_STATUS.active;
  const skills = a.skills || [a.skill];
  const chat = a.chat || [];
  const deliverables = a.deliverables || [];
  const stats = [
    a.stat,
    a.status === "working" ? "Trabajando ahora" : "Estado: " + s.label,
    "Última actividad: " + (a.lastActivity || "—"),
  ];

  return (
    <div className="page">
      {/* Volver */}
      <div style={{marginBottom:16}}>
        <button className="btn ghost sm" onClick={() => navigate("agentes")}>
          <Icon name="chevron" size={12} style={{transform:"rotate(180deg)"}}/> Volver
        </button>
      </div>

      {/* Cabecera */}
      <div className="page-head" style={{alignItems:"center"}}>
        <div style={{display:"flex", alignItems:"center", gap:14, minWidth:0}}>
          <div style={{
            width:48, height:48, borderRadius:12, flexShrink:0,
            display:"flex", alignItems:"center", justifyContent:"center",
            background:"var(--bg-elev-2)", border:"0.5px solid var(--border)", color:"var(--text)",
          }}>
            <Icon name={a.icon} size={22} strokeWidth={1.7}/>
          </div>
          <div style={{minWidth:0}}>
            <div style={{display:"flex", alignItems:"center", gap:12, flexWrap:"wrap"}}>
              <h1 style={{margin:0}}>{a.name}</h1>
              <StatusPill status={a.status}/>
            </div>
            <div className="sub">{a.role}</div>
          </div>
        </div>
      </div>

      {/* Fila de info: Skills + Stats */}
      <div className="agente-info" style={{marginBottom:16}}>
        <div className="card">
          <div className="card-header"><div className="card-title">Skills</div></div>
          <div className="card-body" style={{display:"flex", flexWrap:"wrap", gap:8}}>
            {skills.map(sk => (
              <span key={sk} style={{
                display:"inline-flex", alignItems:"center", gap:6,
                padding:"6px 11px", borderRadius:99,
                background:"var(--bg-elev-2)", border:"0.5px solid var(--border)",
                fontSize:12.5, color:"var(--text)", letterSpacing:"-0.2px",
              }}>
                <span style={{width:5, height:5, borderRadius:"50%", background:"var(--accent)"}}/>
                {sk}
              </span>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">Stats</div></div>
          <div className="card-body" style={{display:"flex", flexDirection:"column", gap:12}}>
            {stats.map((st, i) => (
              <div key={i} style={{display:"flex", alignItems:"center", gap:10, fontSize:13, color:"var(--text-muted)", letterSpacing:"-0.2px"}}>
                <span style={{width:6, height:6, borderRadius:"50%", background: i===1 ? s.dot : "var(--text-subtle)", flexShrink:0}}/>
                {st}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Zona principal: chat (izq) + entregables (der) */}
      <div className="agente-main">

        {/* Chat — reutiliza estilo del chat de Nora */}
        <div className="card" style={{display:"flex", flexDirection:"column", height:480, padding:0, overflow:"hidden"}}>
          <div className="card-header" style={{flexShrink:0}}>
            <div className="card-title">Chat con {a.name}</div>
          </div>
          <div style={{flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:16, padding:"20px 22px"}}>
            {chat.length === 0 ? (
              <div style={{margin:"auto", textAlign:"center", color:"var(--text-subtle)", fontSize:13}}>
                Aún no hay mensajes con este agente.
              </div>
            ) : chat.map((m, i) => <AgentChatMessage key={i} m={m} icon={a.icon}/>)}
          </div>
          {/* Input (no funcional) */}
          <div style={{flexShrink:0, padding:"12px 16px 16px", borderTop:"0.5px solid var(--border)"}}>
            <div style={{display:"flex", alignItems:"center", gap:10, background:"rgba(255,255,255,0.04)", border:"0.5px solid var(--border-strong)", borderRadius:16, padding:"10px 10px 10px 16px"}}>
              <textarea
                placeholder={"Escribe a " + a.name + "…"}
                rows={1}
                style={{flex:1, border:0, outline:0, background:"transparent", resize:"none", fontFamily:"inherit", fontSize:14, color:"var(--text)", letterSpacing:"-0.4px", lineHeight:1.5, maxHeight:120}}
                onKeyDown={e => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); agentesLog("enviar a " + a.name); } }}
              />
              <button onClick={() => agentesLog("enviar a " + a.name)}
                style={{width:34, height:34, borderRadius:"50%", background:"var(--accent)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", flexShrink:0}}>
                <Icon name="arrow-up" size={15}/>
              </button>
            </div>
          </div>
        </div>

        {/* Entregables recientes */}
        <div className="card" style={{padding:0, overflow:"hidden"}}>
          <div className="card-header">
            <div className="card-title">Entregables recientes</div>
          </div>
          <div>
            {deliverables.length === 0 ? (
              <div style={{padding:"28px 20px", textAlign:"center", color:"var(--text-subtle)", fontSize:13}}>
                Sin entregables todavía.
              </div>
            ) : deliverables.map((d, i) => {
              const ds = DELIV_STATUS[d.status] || DELIV_STATUS.pending;
              return (
                <div key={i}
                  onClick={() => d.status === "pending"
                    ? navigate("revisar", { agentId: a.id })
                    : agentesLog("Abrir entregable: " + d.title)}
                  style={{
                    display:"flex", alignItems:"center", justifyContent:"space-between", gap:12,
                    padding:"13px 18px", cursor:"pointer",
                    borderBottom: i < deliverables.length-1 ? "0.5px solid var(--border)" : "none",
                    transition:"background .12s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--bg-elev-2)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:13, fontWeight:500, color:"var(--text)", letterSpacing:"-0.3px",
                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{d.title}</div>
                    <div style={{fontSize:11, color:"var(--text-subtle)", marginTop:2}}>{d.date}</div>
                  </div>
                  <span style={{
                    flexShrink:0, fontSize:11, padding:"3px 9px", borderRadius:99,
                    background: ds.soft, color: ds.color, letterSpacing:"-0.2px",
                  }}>{ds.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

window.AgentesPage = AgentesPage;
window.AgenteDetail = AgenteDetail;

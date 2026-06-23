// Agency Agentes — equipo de especialistas (MOCKUP ESTÁTICO)
// Nada conectado: sin Supabase, sin API. Datos hardcodeados. Botones = console.log.

const AgentesPage = ({ navigate }) => {
  // Estados visuales de cada agente
  const STATUS = {
    working: { label: "Trabajando", dot: "var(--green)" },
    active:  { label: "Activo",     dot: "var(--accent)" },
    paused:  { label: "En pausa",   dot: "var(--text-subtle)" },
  };

  // Datos de ejemplo (mock)
  const AGENTS = [
    { icon:"msg-circle", name:"Social Media", role:"Contenido de redes", status:"working",
      skill:"Calendario, copys y briefs de imagen",
      task:"Contenido IG semana · Gust i Tradició", stat:"12 entregables este mes" },
    { icon:"edit", name:"Copywriting", role:"Textos", status:"active",
      skill:"Copy de marca, anuncios, webs",
      task:null, stat:"8 entregables este mes" },
    { icon:"image", name:"Imagen IA", role:"Dirección visual", status:"active",
      skill:"Briefs y generación con Freepik",
      task:null, stat:"20 entregables este mes" },
    { icon:"command", name:"Web", role:"Desarrollo", status:"paused",
      skill:"Shopify, Framer, conversión",
      task:null, stat:"3 entregables este mes" },
    { icon:"megaphone", name:"Ads", role:"Campañas", status:"active",
      skill:"Meta y Google Ads",
      task:null, stat:"5 entregables este mes" },
    { icon:"mail", name:"Email/CRM", role:"Email marketing", status:"paused",
      skill:"Secuencias y campañas Klaviyo",
      task:null, stat:"4 entregables este mes" },
    { icon:"send", name:"Outreach", role:"Captación", status:"active",
      skill:"Cold email, Apollo e Instantly",
      task:"Prospección streetwear", stat:"30 leads este mes" },
  ];

  const log = (what) => console.log("[Agentes mock]", what);

  // ── Tarjeta de subagente ──────────────────────────────────────────────
  const AgentCard = ({ a }) => {
    const s = STATUS[a.status] || STATUS.active;
    return (
      <div
        onClick={() => log("Abrir agente: " + a.name)}
        style={{
          display:"flex", flexDirection:"column", gap:13,
          padding:"16px 17px", borderRadius:14,
          background:"var(--bg-elev)", border:"0.5px solid var(--border)",
          cursor:"pointer", transition:"border-color .15s, background .15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "var(--bg-elev-2)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg-elev)"; }}
      >
        {/* Cabecera: icono + nombre/rol + estado */}
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
          <div style={{
            display:"inline-flex", alignItems:"center", gap:6, flexShrink:0,
            padding:"3px 9px 3px 8px", borderRadius:99,
            background:"var(--bg-elev-2)", border:"0.5px solid var(--border)",
          }}>
            <span style={{width:6, height:6, borderRadius:"50%", background:s.dot, flexShrink:0}}/>
            <span style={{fontSize:11, color:"var(--text-muted)", letterSpacing:"-0.2px"}}>{s.label}</span>
          </div>
        </div>

        {/* Skill */}
        <div style={{fontSize:12.5, color:"var(--text-muted)", lineHeight:1.4, letterSpacing:"-0.2px"}}>
          {a.skill}
        </div>

        {/* Tarea actual */}
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

        {/* Dato del mes */}
        <div style={{
          borderTop:"0.5px solid var(--border)", paddingTop:11, marginTop:1,
          fontSize:11, color:"var(--text-subtle)", letterSpacing:"-0.1px",
        }}>
          {a.stat}
        </div>
      </div>
    );
  };

  return (
    <div className="page">
      {/* Cabecera */}
      <div className="page-head">
        <div>
          <h1>Agentes</h1>
          <div className="sub">Tu equipo de especialistas</div>
        </div>
      </div>

      {/* ── Nora — orquestadora (tarjeta destacada) ── */}
      <div
        onClick={() => log("Abrir Nora")}
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

      {/* ── Rejilla de subagentes ── */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",
        gap:16,
      }}>
        {AGENTS.map(a => <AgentCard key={a.name} a={a}/>)}
      </div>
    </div>
  );
};

window.AgentesPage = AgentesPage;

// Agentes — lista los agentes reales creados en Claude Console (Managed Agents).
// Lee /api/agents/list (backend → GET /v1/agents). Solo lectura por ahora.

const AGENTS_CONSOLE_URL = "https://platform.claude.com/workspaces/default/agents";

const AgentesPage = ({ navigate }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [agents, setAgents]   = useState([]);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const r = await fetch("/api/agents/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const data = await r.json();
      if (!data.ok) throw new Error(data.error || "No se pudo cargar");
      setAgents(data.agents || []);
    } catch (e) {
      setError(e.message || "Error de conexión");
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const fmtDate = (iso) => {
    if (!iso) return "";
    try { return new Date(iso).toLocaleDateString("es-ES", { day:"numeric", month:"short", year:"numeric" }); }
    catch { return ""; }
  };

  const AgentCard = ({ a }) => (
    <div style={{
      display:"flex", flexDirection:"column", gap:12,
      padding:"16px 17px", borderRadius:14,
      background:"var(--bg-elev)", border:"0.5px solid var(--border)",
      transition:"border-color .15s, background .15s",
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "var(--bg-elev-2)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg-elev)"; }}
    >
      <div style={{display:"flex", alignItems:"center", gap:11, minWidth:0}}>
        <div style={{
          width:38, height:38, borderRadius:10, flexShrink:0,
          display:"flex", alignItems:"center", justifyContent:"center",
          background:"var(--accent-soft)", border:"0.5px solid var(--border)", color:"var(--accent)",
        }}>
          <Icon name="sparkles" size={18} strokeWidth={1.7}/>
        </div>
        <div style={{minWidth:0, flex:1}}>
          <div style={{fontSize:14, fontWeight:500, color:"var(--text)", letterSpacing:"-0.4px",
            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{a.name || "Agente"}</div>
          {a.model && (
            <span style={{
              display:"inline-block", marginTop:3, fontSize:10, padding:"1px 7px", borderRadius:99,
              background:"var(--bg-elev-2)", border:"0.5px solid var(--border)", color:"var(--text-muted)",
              fontFamily:"var(--font-mono)", letterSpacing:"-0.2px",
            }}>{a.model}</span>
          )}
        </div>
      </div>

      <div style={{fontSize:12.5, color:"var(--text-muted)", lineHeight:1.45, letterSpacing:"-0.2px",
        minHeight:18, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden"}}>
        {a.description || "Sin descripción."}
      </div>

      <div style={{
        borderTop:"0.5px solid var(--border)", paddingTop:10, marginTop:1,
        display:"flex", alignItems:"center", justifyContent:"space-between", gap:8,
        fontSize:11, color:"var(--text-subtle)", letterSpacing:"-0.1px",
      }}>
        <span style={{fontFamily:"var(--font-mono)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{a.id}</span>
        {a.created_at && <span style={{flexShrink:0}}>{fmtDate(a.created_at)}</span>}
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Agentes</h1>
          <div className="sub">Tu equipo de especialistas · creados en Claude Console</div>
        </div>
        <div className="row tight">
          <button className="btn" onClick={load}><Icon name="refresh-cw" size={14}/> Actualizar</button>
          <button className="btn primary" onClick={() => window.open(AGENTS_CONSOLE_URL, "_blank")}>
            <Icon name="plus" size={14}/> Nuevo agente
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{padding:"60px 0", textAlign:"center", color:"var(--text-subtle)", fontSize:14}}>Cargando agentes…</div>
      ) : error ? (
        <div className="card" style={{padding:"28px 24px", textAlign:"center"}}>
          <div style={{color:"var(--text)", fontSize:14, marginBottom:6}}>No se pudieron cargar los agentes</div>
          <div style={{color:"var(--text-muted)", fontSize:13, marginBottom:16}}>{error}</div>
          <button className="btn sm" onClick={load}><Icon name="refresh-cw" size={13}/> Reintentar</button>
        </div>
      ) : agents.length === 0 ? (
        <div className="card" style={{padding:"40px 24px", textAlign:"center"}}>
          <div style={{
            width:54, height:54, borderRadius:14, margin:"0 auto 16px",
            display:"flex", alignItems:"center", justifyContent:"center",
            background:"var(--accent-soft)", color:"var(--accent)",
          }}>
            <Icon name="sparkles" size={24} strokeWidth={1.6}/>
          </div>
          <div style={{fontSize:16, fontWeight:500, color:"var(--text)", letterSpacing:"-0.5px", marginBottom:6}}>
            Aún no tienes agentes
          </div>
          <div style={{fontSize:13.5, color:"var(--text-muted)", letterSpacing:"-0.3px", marginBottom:18, lineHeight:1.5}}>
            Crea tus agentes especialistas en la consola de Claude y aparecerán aquí automáticamente.
          </div>
          <button className="btn primary" onClick={() => window.open(AGENTS_CONSOLE_URL, "_blank")}>
            <Icon name="external-link" size={14}/> Crear en Claude Console
          </button>
        </div>
      ) : (
        <div style={{
          display:"grid",
          gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",
          gap:16,
        }}>
          {agents.map(a => <AgentCard key={a.id} a={a}/>)}
        </div>
      )}
    </div>
  );
};

window.AgentesPage = AgentesPage;

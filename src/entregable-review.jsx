// Pantalla de revisión de un entregable (varias piezas) — DATOS REALES (Supabase)
// Lee deliverables/pieces vía window.Data (getDeliverable / listDeliverables).
// Las acciones (Aprobar/Rechazar/Regenerar) todavía no funcionan.

// Estado de cada pieza — claves = valores reales de la columna 'status'
const PIECE_STATUS = {
  pendiente: { label: "Pendiente", dot: "var(--amber)" },
  aprobada:  { label: "Aprobada",  dot: "var(--green)" },
  rechazada: { label: "Rechazada", dot: "var(--red)" },
};

// Etiqueta legible del agente que generó el entregable
const AGENT_LABEL = { social_media: "Social Media" };

const reviewLog = (what) => console.log("[Revisión]", what);

// Pill de estado de pieza (puntito de color + etiqueta) — mismo patrón que StatusPill
const PiecePill = ({ status }) => {
  const s = PIECE_STATUS[status] || PIECE_STATUS.pendiente;
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

const EntregableReview = ({ navigate, agentId, deliverableId }) => {
  const D = window.Data;
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [deliverable, setDeliverable] = useState(null);
  const [pieces, setPieces]           = useState([]);

  // Cargar el deliverable real (+ sus piezas) al abrir
  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true); setError(null);
      try {
        let id = deliverableId;
        if (!id) {                                   // sin id → el más reciente
          const list = await D.listDeliverables();
          if (list.length) id = list[0].id;
        }
        if (!id) { if (!cancel) { setError("No hay entregables todavía."); setLoading(false); } return; }
        const res = await D.getDeliverable(id);
        if (cancel) return;
        if (!res || !res.deliverable) { setError("No se ha encontrado el entregable."); setLoading(false); return; }
        setDeliverable(res.deliverable);
        setPieces(res.pieces || []);
        setLoading(false);
      } catch (e) {
        if (!cancel) { setError(e.message || "Error cargando"); setLoading(false); }
      }
    })();
    return () => { cancel = true; };
  }, [deliverableId]);

  const approved = pieces.filter(p => p.status === "aprobada").length;
  const goBack   = () => agentId ? navigate("agente", { agentId }) : navigate("agentes");

  // Subtítulo a partir de datos reales: generado por X · fecha
  const subtitle = (() => {
    if (!deliverable) return "";
    const who  = AGENT_LABEL[deliverable.agent] || deliverable.agent || "—";
    const when = deliverable.created_at
      ? new Date(deliverable.created_at).toLocaleDateString("es-ES", { day:"numeric", month:"short" })
      : "";
    return `Generado por ${who}${when ? " · " + when : ""}`;
  })();

  return (
    <div className="page">
      {/* Volver */}
      <div style={{marginBottom:16}}>
        <button className="btn ghost sm" onClick={goBack}>
          <Icon name="chevron" size={12} style={{transform:"rotate(180deg)"}}/> Volver
        </button>
      </div>

      {/* Cabecera */}
      <div className="page-head">
        <div style={{minWidth:0}}>
          <h1>{deliverable ? deliverable.title : (loading ? "Cargando…" : "Entregable")}</h1>
          <div className="sub">{subtitle}</div>
        </div>
        <div style={{display:"flex", alignItems:"center", gap:14, flexWrap:"wrap"}}>
          <span style={{fontSize:13, color:"var(--text-muted)", letterSpacing:"-0.3px"}}>
            {approved} de {pieces.length} aprobadas
          </span>
          <button className="btn primary" onClick={() => reviewLog("Aprobar todo y marcar listo")}
            style={{height:38, padding:"0 16px"}}>
            <Icon name="check" size={14}/> Aprobar todo y marcar listo
          </button>
        </div>
      </div>

      {/* Estados de carga / error / vacío */}
      {loading ? (
        <div style={{padding:"48px 0", textAlign:"center", color:"var(--text-subtle)", fontSize:14}}>Cargando…</div>
      ) : error ? (
        <div style={{padding:"48px 0", textAlign:"center", color:"var(--text-subtle)", fontSize:14}}>{error}</div>
      ) : pieces.length === 0 ? (
        <div style={{padding:"48px 0", textAlign:"center", color:"var(--text-subtle)", fontSize:14}}>Este entregable no tiene piezas.</div>
      ) : (

      /* Lista de piezas */
      <div style={{display:"flex", flexDirection:"column", gap:16}}>
        {pieces.map((p, i) => {
          const hashtags = Array.isArray(p.hashtags) ? p.hashtags.join(" ") : (p.hashtags || "");
          return (
          <div key={p.id || i} className="card" style={{padding:0, overflow:"hidden"}}>

            {/* Cabecera de la pieza */}
            <div style={{
              display:"flex", alignItems:"center", justifyContent:"space-between", gap:12,
              padding:"13px 18px", borderBottom:"0.5px solid var(--border)", flexWrap:"wrap",
            }}>
              <div style={{display:"flex", alignItems:"center", gap:10, minWidth:0, flexWrap:"wrap"}}>
                <span style={{
                  fontSize:10, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase",
                  padding:"3px 9px", borderRadius:99,
                  background:"var(--accent-soft)", color:"var(--accent)",
                }}>{p.formato}</span>
                <span style={{fontSize:13.5, fontWeight:500, color:"var(--text)", letterSpacing:"-0.3px"}}>{p.dia}</span>
                <span style={{color:"var(--text-subtle)"}}>·</span>
                <span style={{fontSize:13.5, color:"var(--text-muted)", letterSpacing:"-0.3px"}}>{p.tema}</span>
              </div>
              <PiecePill status={p.status}/>
            </div>

            {/* Cuerpo: imagen + copy */}
            <div className="review-body">
              {/* Placeholder de imagen */}
              <div style={{
                aspectRatio:"1 / 1", borderRadius:12,
                border:"1px dashed var(--border-strong)", background:"var(--bg-elev-2)",
                display:"flex", alignItems:"center", justifyContent:"center",
                padding:"16px", textAlign:"center",
              }}>
                <div>
                  <div style={{fontSize:11, fontWeight:600, color:"var(--text-subtle)", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:7}}>
                    Brief de imagen
                  </div>
                  <div style={{fontSize:12.5, color:"var(--text-muted)", lineHeight:1.5, fontStyle:"italic", letterSpacing:"-0.2px"}}>
                    {p.brief_imagen}
                  </div>
                </div>
              </div>

              {/* Copy + hashtags */}
              <div style={{minWidth:0}}>
                <div style={{fontSize:14.5, color:"var(--text)", lineHeight:1.55, letterSpacing:"-0.3px", whiteSpace:"pre-wrap"}}>
                  {p.caption}
                </div>
                {hashtags && (
                  <div style={{fontSize:13, color:"var(--text-subtle)", marginTop:12, lineHeight:1.5, letterSpacing:"-0.2px"}}>
                    {hashtags}
                  </div>
                )}
              </div>
            </div>

            {/* Pie: acciones (todavía sin funcionar) */}
            <div style={{
              display:"flex", alignItems:"center", justifyContent:"space-between", gap:10,
              padding:"13px 18px", borderTop:"0.5px solid var(--border)", flexWrap:"wrap",
            }}>
              <div style={{display:"flex", gap:8}}>
                <button className="btn" style={{color:"var(--green)"}} onClick={() => reviewLog("Aprobar · " + p.dia)}>
                  <Icon name="check" size={13}/> Aprobar
                </button>
                <button className="btn" style={{color:"var(--red)"}} onClick={() => reviewLog("Rechazar · " + p.dia)}>
                  <Icon name="x" size={13}/> Rechazar
                </button>
              </div>
              <div style={{display:"flex", alignItems:"center", gap:8, flexWrap:"wrap"}}>
                <input
                  placeholder="Nota para regenerar…"
                  style={{
                    height:34, fontSize:13, padding:"0 12px", borderRadius:9,
                    background:"rgba(255,255,255,0.04)", border:"0.5px solid var(--border-strong)",
                    color:"var(--text)", outline:"none", width:190, fontFamily:"inherit", letterSpacing:"-0.2px",
                  }}
                  onKeyDown={e => { if (e.key === "Enter") reviewLog("Regenerar (con nota) · " + p.dia); }}
                />
                <button className="btn" onClick={() => reviewLog("Regenerar · " + p.dia)}>
                  <Icon name="refresh-cw" size={13}/> Regenerar
                </button>
              </div>
            </div>
          </div>
          );
        })}
      </div>
      )}
    </div>
  );
};

window.EntregableReview = EntregableReview;

// Pantalla de revisión de un entregable (varias piezas) — MOCKUP ESTÁTICO
// Nada conectado: sin Supabase, sin API. Datos hardcodeados. Botones = console.log.

// Estado de cada pieza (femenino: Aprobada / Rechazada)
const PIECE_STATUS = {
  pending:  { label: "Pendiente", dot: "var(--amber)" },
  approved: { label: "Aprobada",  dot: "var(--green)" },
  rejected: { label: "Rechazada", dot: "var(--red)" },
};

const reviewLog = (what) => console.log("[Revisión mock]", what);

// Pill de estado de pieza (puntito de color + etiqueta) — mismo patrón que StatusPill
const PiecePill = ({ status }) => {
  const s = PIECE_STATUS[status] || PIECE_STATUS.pending;
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

const EntregableReview = ({ navigate, agentId }) => {
  const PIECES = [
    { format:"POST", day:"Dilluns", theme:"Producte de temporada", status:"approved",
      copy:"Comencem la setmana amb el millor del mercat. Producte de proximitat, tractat amb respecte.",
      hashtags:"#gustitradicio #productedetemporada #cuinacatalana",
      brief:"Close-up of seasonal vegetables on dark slate, natural side light, moody, editorial." },
    { format:"STORY", day:"Dimarts", theme:"Horaris", status:"pending",
      copy:"Avui obrim de 13 a 16 i de 20 a 23. Us esperem.",
      hashtags:"#igualada #restaurant",
      brief:"Minimal story layout, dark background, elegant serif type, lots of negative space." },
    { format:"CARRUSEL", day:"Dimecres", theme:"El plat de la setmana", status:"pending",
      copy:"Aquesta setmana, un homenatge a l'origen. Tres passes, un sol producte.",
      hashtags:"#cuinadautor #slowfood",
      brief:"Three-step plated dish sequence, top-down, warm light, fine dining, clean composition." },
    { format:"REEL", day:"Dijous", theme:"Darrere la cuina", status:"pending",
      copy:"El que no es veu també compta. El ritme tranquil d'una cuina amb ofici.",
      hashtags:"#behindthescenes #cuina",
      brief:"Slow cinematic kitchen b-roll, hands plating, shallow depth of field, calm mood." },
    { format:"POST", day:"Divendres", theme:"Cap de setmana", status:"rejected",
      copy:"Reserva la teva taula per aquest cap de setmana.",
      hashtags:"#reserves",
      brief:"Cozy table setting at dusk, candle light, inviting, warm tones." },
  ];

  const approved = PIECES.filter(p => p.status === "approved").length;
  const goBack = () => agentId ? navigate("agente", { agentId }) : navigate("agentes");

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
          <h1>Contenido IG · semana 23-29 jun</h1>
          <div className="sub">Gust i Tradició · generado por Social Media · hoy</div>
        </div>
        <div style={{display:"flex", alignItems:"center", gap:14, flexWrap:"wrap"}}>
          <span style={{fontSize:13, color:"var(--text-muted)", letterSpacing:"-0.3px"}}>
            {approved} de {PIECES.length} aprobadas
          </span>
          <button className="btn primary" onClick={() => reviewLog("Aprobar todo y marcar listo")}
            style={{height:38, padding:"0 16px"}}>
            <Icon name="check" size={14}/> Aprobar todo y marcar listo
          </button>
        </div>
      </div>

      {/* Lista de piezas */}
      <div style={{display:"flex", flexDirection:"column", gap:16}}>
        {PIECES.map((p, i) => (
          <div key={i} className="card" style={{padding:0, overflow:"hidden"}}>

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
                }}>{p.format}</span>
                <span style={{fontSize:13.5, fontWeight:500, color:"var(--text)", letterSpacing:"-0.3px"}}>{p.day}</span>
                <span style={{color:"var(--text-subtle)"}}>·</span>
                <span style={{fontSize:13.5, color:"var(--text-muted)", letterSpacing:"-0.3px"}}>{p.theme}</span>
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
                    {p.brief}
                  </div>
                </div>
              </div>

              {/* Copy + hashtags */}
              <div style={{minWidth:0}}>
                <div style={{fontSize:14.5, color:"var(--text)", lineHeight:1.55, letterSpacing:"-0.3px"}}>
                  {p.copy}
                </div>
                <div style={{fontSize:13, color:"var(--text-subtle)", marginTop:12, lineHeight:1.5, letterSpacing:"-0.2px"}}>
                  {p.hashtags}
                </div>
              </div>
            </div>

            {/* Pie: acciones */}
            <div style={{
              display:"flex", alignItems:"center", justifyContent:"space-between", gap:10,
              padding:"13px 18px", borderTop:"0.5px solid var(--border)", flexWrap:"wrap",
            }}>
              <div style={{display:"flex", gap:8}}>
                <button className="btn" style={{color:"var(--green)"}} onClick={() => reviewLog("Aprobar · " + p.day)}>
                  <Icon name="check" size={13}/> Aprobar
                </button>
                <button className="btn" style={{color:"var(--red)"}} onClick={() => reviewLog("Rechazar · " + p.day)}>
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
                  onKeyDown={e => { if (e.key === "Enter") reviewLog("Regenerar (con nota) · " + p.day); }}
                />
                <button className="btn" onClick={() => reviewLog("Regenerar · " + p.day)}>
                  <Icon name="refresh-cw" size={13}/> Regenerar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

window.EntregableReview = EntregableReview;

// Agentes — lista los agentes reales creados en Claude Console (Managed Agents).
// Lee /api/agents/list (backend → GET /v1/agents). Solo lectura por ahora.

const AGENTS_CONSOLE_URL = "https://platform.claude.com/workspaces/default/agents";

// ── Estudio de imágenes (Magnific / Freepik · texto → imagen) ───────────────
const IMG_SIZES = [
  { id: "square_1_1",     label: "Cuadrado · 1:1" },
  { id: "social_story_9_16", label: "Story · 9:16" },
  { id: "widescreen_16_9", label: "Horizontal · 16:9" },
  { id: "portrait_2_3",   label: "Retrato · 2:3" },
];

const IMG_COUNTS = [1, 2, 4, 6, 8, 12];

const ImageStudio = () => {
  const [instruction, setInstruction] = useState("");
  const [size, setSize]       = useState("square_1_1");
  const [num, setNum]         = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [items, setItems]     = useState([]); // [{prompt, image, error}]

  const generate = async () => {
    if (!instruction.trim() || loading) return;
    setLoading(true); setError(null); setItems([]);
    try {
      const r = await fetch("/api/agents/studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction: instruction.trim(), size, num_variations: num }),
      });
      const data = await r.json();
      if (!data.ok) throw new Error(data.error || "No se pudo generar");
      setItems(data.items || []);
    } catch (e) {
      setError(e.message || "Error de conexión");
    }
    setLoading(false);
  };

  const download = (src, i) => {
    const a = document.createElement("a");
    a.href = src;
    a.download = `magnific-${Date.now()}-${i + 1}.png`;
    document.body.appendChild(a); a.click(); a.remove();
  };

  const ok = items.filter(it => it.image);

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 22 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 11,
        padding: "15px 18px", borderBottom: "0.5px solid var(--border)",
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "var(--accent-soft)", border: "0.5px solid var(--border)", color: "var(--accent)",
        }}>
          <Icon name="image" size={18} strokeWidth={1.7} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", letterSpacing: "-0.4px" }}>
            Agente de imágenes
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", letterSpacing: "-0.2px" }}>
            Pídeselo en lenguaje natural · él escribe los prompts y los genera en Magnific
          </div>
        </div>
      </div>

      <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 13 }}>
        <textarea
          value={instruction}
          onChange={e => setInstruction(e.target.value)}
          onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") generate(); }}
          placeholder="Pídele lo que quieras… p. ej. «20 variaciones premium de un plato de pasta para una carta de restaurante, estilo editorial gastronómico»"
          rows={3}
          style={{
            width: "100%", resize: "vertical", minHeight: 70,
            padding: "11px 13px", borderRadius: 11, fontSize: 13.5, lineHeight: 1.5,
            background: "var(--bg-elev)", border: "0.5px solid var(--border)", color: "var(--text)",
            fontFamily: "inherit", letterSpacing: "-0.2px", outline: "none",
          }}
        />

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
          <select value={size} onChange={e => setSize(e.target.value)}
            style={{
              padding: "8px 11px", borderRadius: 10, fontSize: 12.5,
              background: "var(--bg-elev)", border: "0.5px solid var(--border)", color: "var(--text)",
              fontFamily: "inherit", letterSpacing: "-0.2px", outline: "none", cursor: "pointer",
            }}>
            {IMG_SIZES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>

          <select value={num} onChange={e => setNum(Number(e.target.value))}
            style={{
              padding: "8px 11px", borderRadius: 10, fontSize: 12.5,
              background: "var(--bg-elev)", border: "0.5px solid var(--border)", color: "var(--text)",
              fontFamily: "inherit", letterSpacing: "-0.2px", outline: "none", cursor: "pointer",
            }}>
            {IMG_COUNTS.map(n => <option key={n} value={n}>{n} {n === 1 ? "variación" : "variaciones"}</option>)}
          </select>

          <div style={{ flex: 1 }} />

          <button className="btn primary" disabled={loading || !instruction.trim()}
            onClick={generate} style={{ opacity: loading || !instruction.trim() ? 0.6 : 1 }}>
            <Icon name="sparkles" size={14} />
            {loading ? "Trabajando…" : "Generar"}
          </button>
        </div>

        {loading && (
          <div style={{ fontSize: 12, color: "var(--text-muted)", letterSpacing: "-0.2px" }}>
            El agente está escribiendo los prompts y generando las imágenes… esto puede tardar un poco.
          </div>
        )}

        {error && (
          <div style={{
            padding: "10px 13px", borderRadius: 10, fontSize: 12.5, lineHeight: 1.45,
            background: "var(--red-soft, rgba(220,60,60,.1))", color: "var(--red, #d33)",
            border: "0.5px solid var(--red, #d33)", letterSpacing: "-0.2px",
          }}>{error}</div>
        )}

        {loading && (
          <div style={{
            display: "grid", gridTemplateColumns: `repeat(${Math.min(num, 3)}, 1fr)`, gap: 12,
          }}>
            {Array.from({ length: num }).map((_, i) => (
              <div key={i} style={{
                aspectRatio: "1 / 1", borderRadius: 12,
                background: "var(--bg-elev-2)", border: "0.5px solid var(--border)",
                animation: "pulse 1.4s ease-in-out infinite",
              }} />
            ))}
          </div>
        )}

        {!loading && items.length > 0 && (
          <>
            <div style={{ fontSize: 12, color: "var(--text-subtle)", letterSpacing: "-0.2px" }}>
              {ok.length} de {items.length} {items.length === 1 ? "imagen generada" : "imágenes generadas"}
            </div>
            <div style={{
              display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(220px, 1fr))`, gap: 12,
            }}>
              {items.map((it, i) => (
                <div key={i} style={{ borderRadius: 12, overflow: "hidden",
                  border: "0.5px solid var(--border)", background: "var(--bg-elev)",
                  display: "flex", flexDirection: "column" }}>
                  {it.image ? (
                    <div style={{ position: "relative" }}>
                      <img src={it.image} alt={`Variación ${i + 1}`}
                        style={{ display: "block", width: "100%", height: "auto" }} />
                      <button className="btn sm"
                        onClick={() => download(it.image, i)}
                        style={{
                          position: "absolute", top: 8, right: 8,
                          background: "rgba(0,0,0,.55)", color: "#fff", border: "0.5px solid rgba(255,255,255,.2)",
                          backdropFilter: "blur(6px)",
                        }}>
                        <Icon name="download" size={13} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ aspectRatio: "1 / 1", display: "flex", alignItems: "center",
                      justifyContent: "center", textAlign: "center", padding: 14,
                      fontSize: 11.5, color: "var(--red, #d33)", background: "var(--bg-elev-2)" }}>
                      {it.error || "No se pudo generar"}
                    </div>
                  )}
                  <div title={it.prompt} style={{
                    padding: "9px 11px", fontSize: 11, lineHeight: 1.4, color: "var(--text-muted)",
                    letterSpacing: "-0.1px", borderTop: "0.5px solid var(--border)",
                    display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}>{it.prompt}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const AgentesPage = ({ navigate }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [agents, setAgents]   = useState([]);
  const [setupBusy, setSetupBusy] = useState(false);
  const [setupMsg, setSetupMsg]   = useState(null);

  const setupAgent = async () => {
    if (setupBusy) return;
    setSetupBusy(true); setSetupMsg(null);
    try {
      const r = await fetch("/api/agents/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: "141setup2026" }),
      });
      const data = await r.json();
      if (!data.ok) throw new Error(data.error || "No se pudo crear");
      setSetupMsg({ ok: true, text: data.secured
        ? "Agente creado y conectado a Magnific (con token)."
        : "Agente creado. ⚠️ Sin MCP_BEARER_TOKEN: el puente queda abierto." });
      await load();
    } catch (e) {
      setSetupMsg({ ok: false, text: e.message || "Error de conexión" });
    }
    setSetupBusy(false);
  };

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
          <button className="btn" onClick={setupAgent} disabled={setupBusy}>
            <Icon name="sparkles" size={14}/> {setupBusy ? "Creando…" : "Crear mi agente de imágenes"}
          </button>
          <button className="btn primary" onClick={() => window.open(AGENTS_CONSOLE_URL, "_blank")}>
            <Icon name="plus" size={14}/> Nuevo agente
          </button>
        </div>
      </div>

      {setupMsg && (
        <div style={{
          padding: "10px 13px", borderRadius: 10, fontSize: 12.5, lineHeight: 1.45, marginBottom: 16,
          letterSpacing: "-0.2px",
          background: setupMsg.ok ? "var(--accent-soft)" : "var(--red-soft, rgba(220,60,60,.1))",
          color: setupMsg.ok ? "var(--accent)" : "var(--red, #d33)",
          border: "0.5px solid " + (setupMsg.ok ? "var(--accent)" : "var(--red, #d33)"),
        }}>{setupMsg.text}</div>
      )}

      <ImageStudio/>

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

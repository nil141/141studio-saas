// Campaigns page — list + detail view

// ── Sample data (local, Supabase later) ─────────────────────────────
const _loadCampaigns = () => {
  try { return JSON.parse(localStorage.getItem("141_campaigns") || "null") || []; }
  catch { return []; }
};
const _saveCampaigns = (data) => localStorage.setItem("141_campaigns", JSON.stringify(data));

// ── Tiny chart helpers ───────────────────────────────────────────────
const MiniBarChart = ({ data, color = "var(--accent)" }) => {
  const max = Math.max(...data.map(d => d.v), 1);
  return (
    <div style={{display:"flex", alignItems:"flex-end", gap:3, height:60}}>
      {data.map((d, i) => (
        <div key={i} style={{flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3}}>
          <div style={{
            width:"100%", borderRadius:3,
            height: Math.max(4, (d.v / max) * 50),
            background: color, opacity: 0.85,
          }}/>
          <span style={{fontSize:9, color:"var(--text-subtle)"}}>{d.l}</span>
        </div>
      ))}
    </div>
  );
};

const MiniLineChart = ({ data, color = "var(--accent)", height = 70 }) => {
  const vals = data.map(d => d.v);
  const max = Math.max(...vals, 1);
  const min = Math.min(...vals, 0);
  const range = max - min || 1;
  const W = 300, H = height;
  const pts = vals.map((v, i) => [
    (i / (vals.length - 1)) * W,
    H - ((v - min) / range) * (H - 10) - 5,
  ]);
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const fill = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ")
    + ` L${W},${H} L0,${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%", height}} preserveAspectRatio="none">
      <path d={fill} fill={color} fillOpacity={0.12}/>
      <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={3} fill={color}/>
      ))}
    </svg>
  );
};

const StatCard = ({ label, value, sub, color }) => (
  <div style={{
    padding:"16px 18px", background:"var(--bg-elev)", border:"0.5px solid var(--border)",
    borderRadius:12, display:"flex", flexDirection:"column", gap:4
  }}>
    <div style={{fontSize:11, color:"var(--text-subtle)", textTransform:"uppercase", letterSpacing:"0.06em"}}>{label}</div>
    <div style={{fontSize:26, fontWeight:600, color: color || "var(--text)", fontFamily:"var(--font-display)", letterSpacing:"-0.02em"}}>{value}</div>
    {sub && <div style={{fontSize:11, color:"var(--text-muted)"}}>{sub}</div>}
  </div>
);

// ── Tab views ────────────────────────────────────────────────────────
const TabAnalytics = ({ c }) => {
  const weekDays = ["L","M","X","J","V","S","D"];
  const sent  = weekDays.map((l,i) => ({ l, v: Math.round(c.emailsSent / 7 * (0.6 + Math.random() * 0.8)) }));
  const opens = weekDays.map((l,i) => ({ l, v: Math.round(sent[i].v * (c.openRate / 100)) }));
  const monthly = ["Ene","Feb","Mar","Abr","May","Jun"].map((l,i) => ({
    l, v: Math.round(c.emailsSent / 6 * (0.4 + i * 0.2))
  }));
  return (
    <div style={{display:"flex", flexDirection:"column", gap:20}}>
      <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12}}>
        <StatCard label="Emails enviados" value={c.emailsSent.toLocaleString()} sub="Total acumulado"/>
        <StatCard label="Tasa apertura" value={c.openRate + "%"} sub="Promedio campaña" color="var(--green)"/>
        <StatCard label="Tasa clic" value={c.clickRate + "%"} sub="Sobre emails abiertos" color="var(--accent)"/>
        <StatCard label="Respuestas" value={c.replyRate + "%"} sub="Reply rate" color="var(--amber)"/>
      </div>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16}}>
        <div className="card" style={{padding:18}}>
          <div className="card-title" style={{marginBottom:14}}>Emails enviados — últimos 7 días</div>
          <MiniBarChart data={sent} color="var(--accent)"/>
        </div>
        <div className="card" style={{padding:18}}>
          <div className="card-title" style={{marginBottom:14}}>Aperturas — últimos 7 días</div>
          <MiniBarChart data={opens} color="var(--green)"/>
        </div>
        <div className="card" style={{padding:18, gridColumn:"1 / -1"}}>
          <div className="card-title" style={{marginBottom:14}}>Evolución mensual</div>
          <MiniLineChart data={monthly} color="var(--accent)" height={80}/>
          <div style={{display:"flex", gap:16, marginTop:8}}>
            {monthly.map((d,i) => (
              <span key={i} style={{fontSize:10, color:"var(--text-subtle)", flex:1, textAlign:"center"}}>{d.l}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const TabSequence = ({ c }) => {
  const steps = [
    { day: 0,  subject: "{{firstName}}, ¿tienes 15 minutos esta semana?", type: "email", status: "sent" },
    { day: 3,  subject: "Seguimiento — proyecto de crecimiento",           type: "email", status: "sent" },
    { day: 7,  subject: "Última pregunta, {{firstName}}",                  type: "email", status: "scheduled" },
    { day: 14, subject: "Cerramos el hilo",                                type: "email", status: "draft" },
  ];
  return (
    <div style={{display:"flex", flexDirection:"column", gap:10}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4}}>
        <div className="card-title">Secuencia de emails</div>
        <button className="btn sm"><Icon name="plus" size={12}/> Añadir paso</button>
      </div>
      {steps.map((s, i) => (
        <div key={i} style={{
          display:"flex", alignItems:"center", gap:14,
          padding:"14px 16px", background:"var(--bg-elev)", border:"0.5px solid var(--border)",
          borderRadius:10
        }}>
          <div style={{
            width:36, height:36, borderRadius:10, flexShrink:0,
            background: s.status === "sent" ? "var(--green-soft)" : s.status === "scheduled" ? "rgba(96,165,250,0.1)" : "var(--bg-elev-2)",
            color: s.status === "sent" ? "var(--green)" : s.status === "scheduled" ? "var(--accent)" : "var(--text-muted)",
            display:"grid", placeItems:"center", fontSize:12, fontWeight:600,
          }}>{s.day === 0 ? "D1" : `+${s.day}d`}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:13, fontWeight:500, color:"var(--text)"}}>{s.subject}</div>
            <div style={{fontSize:11, color:"var(--text-muted)", marginTop:2}}>
              {s.status === "sent" ? "Enviado" : s.status === "scheduled" ? "Programado" : "Borrador"}
            </div>
          </div>
          <Icon name="mail" size={14} style={{color:"var(--text-subtle)"}}/>
          <Icon name="edit" size={13} style={{color:"var(--text-subtle)", cursor:"pointer"}}/>
        </div>
      ))}
    </div>
  );
};

const TabLeads = ({ c }) => {
  const leads = [
    { name:"Sarah Mitchell",  company:"SaaS Corp",     status:"replied",    email:"s.mitchell@saascorp.com" },
    { name:"James Thornton",  company:"TechVentures",  status:"opened",     email:"j.thornton@techv.io" },
    { name:"Laura García",    company:"DataFlow Ltd",  status:"sent",       email:"l.garcia@dataflow.co" },
    { name:"Mark Reynolds",   company:"CloudPeak",     status:"bounced",    email:"m.reynolds@cloudpeak.com" },
    { name:"Anna Kowalski",   company:"GrowthBase",    status:"replied",    email:"a.kowalski@growthbase.eu" },
    { name:"Tom Nielsen",     company:"NorthStar AB",  status:"opened",     email:"t.nielsen@northstar.se" },
  ];
  const statusMap = {
    replied: { label:"Respondió", chip:"green" },
    opened:  { label:"Abrió",     chip:"blue" },
    sent:    { label:"Enviado",   chip:"neutral" },
    bounced: { label:"Rebotó",    chip:"red" },
  };
  const _AV = ["#6366f1","#0ea5e9","#10b981","#f59e0b","#ec4899","#8b5cf6","#14b8a6","#ef4444"];
  const _initials = (n) => (n||"").trim().split(/\s+/).map(w=>w[0]).slice(0,2).join("").toUpperCase();
  return (
    <div>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14}}>
        <div className="card-title">Leads · {c.leads} en total</div>
        <div style={{display:"flex", gap:8}}>
          <button className="btn sm"><Icon name="upload" size={12}/> Importar CSV</button>
          <button className="btn sm primary"><Icon name="plus" size={12}/> Añadir lead</button>
        </div>
      </div>
      <div className="card">
        <div className="card-body flush">
          <table className="table">
            <thead>
              <tr>
                <th style={{width:"42%"}}>Contacto</th>
                <th>Empresa</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l, i) => {
                const st = statusMap[l.status] || { label:l.status, chip:"neutral" };
                return (
                  <tr key={i}>
                    <td>
                      <div className="row tight">
                        <Avatar name={l.name} initials={_initials(l.name)} color={_AV[i % _AV.length]}/>
                        <div>
                          <div style={{fontWeight:500, fontSize:13.5}}>{l.name}</div>
                          <div className="subtle xsmall">{l.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="muted">{l.company}</td>
                    <td><StatusChip status={st.chip} label={st.label}/></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const TabSchedule = ({ c }) => {
  const days = ["Lunes","Martes","Miércoles","Jueves","Viernes"];
  const active = [true, true, true, true, true];
  return (
    <div style={{display:"flex", flexDirection:"column", gap:20, maxWidth:560}}>
      <div className="card" style={{padding:20}}>
        <div className="card-title" style={{marginBottom:14}}>Horario de envío</div>
        <div style={{display:"flex", flexDirection:"column", gap:10}}>
          {days.map((d, i) => (
            <div key={i} style={{display:"flex", alignItems:"center", gap:12}}>
              <Switch on={active[i]} onChange={() => {}}/>
              <span style={{width:90, fontSize:13}}>{d}</span>
              <span style={{fontSize:12, color:"var(--text-muted)"}}>09:00 – 18:00</span>
            </div>
          ))}
        </div>
      </div>
      <div className="card" style={{padding:20}}>
        <div className="card-title" style={{marginBottom:14}}>Configuración</div>
        <div style={{display:"flex", flexDirection:"column", gap:12}}>
          <div>
            <div className="label">Zona horaria</div>
            <select className="select"><option>Europe/Madrid (CET)</option><option>Europe/London (GMT)</option></select>
          </div>
          <div>
            <div className="label">Máx. emails por día</div>
            <input className="input" type="number" defaultValue={50} style={{maxWidth:120}}/>
          </div>
          <div>
            <div className="label">Intervalo entre envíos</div>
            <select className="select" style={{maxWidth:200}}>
              <option>2 – 5 minutos (aleatorio)</option>
              <option>5 – 10 minutos</option>
              <option>10 – 20 minutos</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

const TabOptions = ({ c }) => (
  <div style={{display:"flex", flexDirection:"column", gap:16, maxWidth:560}}>
    <div className="card" style={{padding:20}}>
      <div className="card-title" style={{marginBottom:14}}>General</div>
      <div style={{display:"flex", flexDirection:"column", gap:12}}>
        <div>
          <div className="label">Nombre de la campaña</div>
          <input className="input" defaultValue={c.name}/>
        </div>
        <div>
          <div className="label">Cuenta de envío</div>
          <input className="input" defaultValue="nil@141agency.com"/>
        </div>
        <div>
          <div className="label">Nombre del remitente</div>
          <input className="input" defaultValue="141'STUDIO"/>
        </div>
      </div>
    </div>
    <div className="card" style={{padding:20}}>
      <div className="card-title" style={{marginBottom:14}}>Seguimiento</div>
      <div style={{display:"flex", flexDirection:"column", gap:10}}>
        {[
          { label:"Rastrear aperturas", on: true },
          { label:"Rastrear clics", on: true },
          { label:"Detener al responder", on: true },
          { label:"Detener al desuscribirse", on: true },
        ].map((item, i) => (
          <div key={i} style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
            <span style={{fontSize:13}}>{item.label}</span>
            <Switch on={item.on} onChange={() => {}}/>
          </div>
        ))}
      </div>
    </div>
    <button className="btn primary" style={{alignSelf:"flex-start"}}>Guardar cambios</button>
  </div>
);

const TabAIAgent = ({ c }) => (
  <div style={{display:"flex", flexDirection:"column", gap:16, maxWidth:560}}>
    <div className="card" style={{padding:20}}>
      <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:14}}>
        <div style={{width:36, height:36, borderRadius:10,
          background:"linear-gradient(135deg,rgba(167,139,250,0.15),rgba(96,165,250,0.15))",
          display:"grid", placeItems:"center"}}>
          <Icon name="sparkles" size={16} style={{color:"var(--accent)"}}/>
        </div>
        <div>
          <div className="card-title">Agente IA</div>
          <div style={{fontSize:11, color:"var(--text-muted)"}}>Personalización automática de emails</div>
        </div>
        <Switch on={false} onChange={() => {}} style={{marginLeft:"auto"}}/>
      </div>
      <div style={{display:"flex", flexDirection:"column", gap:12}}>
        <div>
          <div className="label">Prompt de personalización</div>
          <textarea className="textarea" rows={4} placeholder="Ej: Personaliza el saludo con el nombre de la empresa, menciona algo específico de su web y adapta el tono según el cargo..."/>
        </div>
        <div>
          <div className="label">Variables disponibles</div>
          <div style={{display:"flex", flexWrap:"wrap", gap:6, marginTop:4}}>
            {["{{firstName}}","{{lastName}}","{{company}}","{{role}}","{{industry}}"].map(v => (
              <span key={v} className="chip" style={{fontFamily:"var(--font-mono)", fontSize:11}}>{v}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
    <div className="card" style={{padding:20}}>
      <div className="card-title" style={{marginBottom:4}}>Detección de respuestas</div>
      <div style={{fontSize:12, color:"var(--text-muted)", marginBottom:14}}>El agente clasifica las respuestas automáticamente.</div>
      <div style={{display:"flex", flexDirection:"column", gap:8}}>
        {[
          { label:"Interesado → mover a pipeline", on: true },
          { label:"No interesado → marcar y pausar", on: true },
          { label:"Fuera de oficina → retrasar seguimiento", on: false },
        ].map((item, i) => (
          <div key={i} style={{display:"flex", alignItems:"center", justifyContent:"space-between", fontSize:13}}>
            <span>{item.label}</span>
            <Switch on={item.on} onChange={() => {}}/>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ── Campaign Detail ──────────────────────────────────────────────────
const CampaignDetail = ({ campaignId, navigate }) => {
  const [campaigns] = useState(_loadCampaigns);
  const [tab, setTab] = useState("analytics");
  const [status, setStatus] = useState(null);

  const c = campaigns.find(x => x.id === campaignId);
  if (!c) return <Empty icon="megaphone" title="Campaña no encontrada" sub="Vuelve a la lista de campañas."/>;

  const currentStatus = status || c.status;

  const menuItems = [
    { id: "analytics", label: "Analíticas",         icon: "bar-chart" },
    { id: "sequence",  label: "Secuencia de emails", icon: "mail" },
    { id: "leads",     label: "Leads",               icon: "users" },
    { id: "schedule",  label: "Horario",             icon: "clock" },
    { id: "options",   label: "Opciones",            icon: "settings" },
    { id: "ai",        label: "Agente IA",           icon: "sparkles" },
  ];

  const statusConfig = {
    active:    { label: "Activa",   cls: "green",  desc: "La campaña está enviando emails." },
    paused:    { label: "Pausada",  cls: "amber",  desc: "La campaña está pausada y no envía emails." },
    draft:     { label: "Borrador", cls: "",       desc: "Configura la campaña antes de lanzarla." },
    completed: { label: "Finalizada", cls: "blue", desc: "La campaña ha concluido." },
  };
  const st = statusConfig[currentStatus] || statusConfig.paused;

  const renderTab = () => {
    switch (tab) {
      case "analytics": return <TabAnalytics c={c}/>;
      case "sequence":  return <TabSequence c={c}/>;
      case "leads":     return <TabLeads c={c}/>;
      case "schedule":  return <TabSchedule c={c}/>;
      case "options":   return <TabOptions c={c}/>;
      case "ai":        return <TabAIAgent c={c}/>;
      default:          return <TabAnalytics c={c}/>;
    }
  };

  return (
    <div className="page" style={{padding:0}}>
      {/* Back */}
      <div style={{padding:"16px 24px 0"}}>
        <button className="btn ghost sm" onClick={() => navigate("campaigns")} style={{marginBottom:4}}>
          <Icon name="chevron" size={12} style={{transform:"rotate(180deg)"}}/> Campañas
        </button>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"280px 1fr", gap:0, height:"calc(100vh - 110px)", overflow:"hidden"}}>
        {/* LEFT PANEL */}
        <div style={{
          borderRight:"0.5px solid var(--border)", display:"flex", flexDirection:"column",
          overflow:"hidden", padding:"8px 0",
        }}>
          {/* Campaign title */}
          <div style={{padding:"12px 20px 16px", borderBottom:"0.5px solid var(--border)"}}>
            <div style={{fontSize:13, fontWeight:600, color:"var(--text)", lineHeight:1.4}}>{c.name}</div>
            <div style={{fontSize:11, color:"var(--text-subtle)", marginTop:4}}>{c.leads} leads · creada {new Date(c.createdAt).toLocaleDateString("es-ES",{day:"numeric",month:"short",year:"numeric"})}</div>
          </div>

          {/* Nav items */}
          <div style={{flex:1, padding:"8px 10px", overflowY:"auto"}}>
            {menuItems.map(item => (
              <div
                key={item.id}
                onClick={() => setTab(item.id)}
                style={{
                  display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:8,
                  cursor:"pointer", marginBottom:2, fontSize:13,
                  background: tab === item.id ? "var(--bg-elev-2)" : "transparent",
                  color: tab === item.id ? "var(--text)" : "var(--text-muted)",
                  fontWeight: tab === item.id ? 500 : 400,
                  border: tab === item.id ? "0.5px solid var(--border)" : "0.5px solid transparent",
                  transition: "all .12s",
                }}
              >
                <Icon name={item.icon} size={14}/>
                {item.label}
              </div>
            ))}
          </div>

          {/* Status + action */}
          <div style={{padding:"16px 16px", borderTop:"0.5px solid var(--border)"}}>
            <div style={{marginBottom:8}}>
              <span className={`chip ${st.cls}`} style={{marginBottom:6, display:"inline-block"}}>{st.label}</span>
              <div style={{fontSize:11, color:"var(--text-muted)", lineHeight:1.5}}>{st.desc}</div>
            </div>
            {currentStatus === "paused" || currentStatus === "draft" ? (
              <button className="btn primary full" style={{width:"100%", justifyContent:"center"}}
                onClick={() => setStatus("active")}>
                <Icon name="play" size={12}/> Iniciar campaña
              </button>
            ) : currentStatus === "active" ? (
              <button className="btn full" style={{width:"100%", justifyContent:"center"}}
                onClick={() => setStatus("paused")}>
                <Icon name="pause" size={12}/> Pausar campaña
              </button>
            ) : null}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{overflowY:"auto", padding:"24px"}}>
          {renderTab()}
        </div>
      </div>
    </div>
  );
};

// ── Campaign Card (list) ─────────────────────────────────────────────
const CampaignCard = ({ c, navigate }) => {
  const statusMap = {
    active:    { label:"Activa",    cls:"green" },
    paused:    { label:"Pausada",   cls:"amber" },
    draft:     { label:"Borrador",  cls:"" },
    completed: { label:"Finalizada",cls:"blue" },
  };
  const st = statusMap[c.status] || statusMap.paused;
  return (
    <div
      className="card"
      style={{padding:"18px 20px", cursor:"pointer", transition:"border-color .15s"}}
      onClick={() => navigate("campaign", { campaignId: c.id })}
    >
      <div style={{display:"flex", alignItems:"center", gap:16}}>
        <div style={{
          width:40, height:40, borderRadius:10, flexShrink:0,
          background:"linear-gradient(135deg,rgba(167,139,250,0.12),rgba(96,165,250,0.12))",
          display:"grid", placeItems:"center",
        }}>
          <Icon name="megaphone" size={18} style={{color:"var(--accent)"}}/>
        </div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontWeight:600, fontSize:14, color:"var(--text)", marginBottom:2}}>{c.name}</div>
          <div style={{fontSize:11, color:"var(--text-muted)"}}>
            {c.leads} leads · {c.emailsSent.toLocaleString()} emails enviados
          </div>
        </div>
        <div style={{display:"flex", gap:20, alignItems:"center"}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:18, fontWeight:600, color:"var(--green)", fontFamily:"var(--font-display)"}}>{c.openRate}%</div>
            <div style={{fontSize:10, color:"var(--text-subtle)"}}>Apertura</div>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:18, fontWeight:600, color:"var(--accent)", fontFamily:"var(--font-display)"}}>{c.clickRate}%</div>
            <div style={{fontSize:10, color:"var(--text-subtle)"}}>Clic</div>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:18, fontWeight:600, color:"var(--amber)", fontFamily:"var(--font-display)"}}>{c.replyRate}%</div>
            <div style={{fontSize:10, color:"var(--text-subtle)"}}>Respuesta</div>
          </div>
          <span className={`chip ${st.cls}`}>{st.label}</span>
          <Icon name="chevron" size={14} style={{color:"var(--text-subtle)"}}/>
        </div>
      </div>
    </div>
  );
};

// ── Campaigns list page ──────────────────────────────────────────────
const CampaignsPage = ({ navigate }) => {
  const [campaigns, setCampaigns] = useState(() => {
    const saved = _loadCampaigns();
    if (saved.length) return saved;
    // Demo data
    const demo = [
      {
        id: crypto.randomUUID(), name: "Marketing Executives · UK · Software",
        status: "paused", leads: 847, emailsSent: 2294,
        openRate: 38, clickRate: 12, replyRate: 4.2, createdAt: "2025-04-10",
      },
      {
        id: crypto.randomUUID(), name: "E-commerce Directors · España",
        status: "active", leads: 312, emailsSent: 891,
        openRate: 42, clickRate: 15, replyRate: 6.1, createdAt: "2025-04-28",
      },
    ];
    _saveCampaigns(demo);
    return demo;
  });

  const total    = campaigns.length;
  const active   = campaigns.filter(c => c.status === "active").length;
  const totalSent = campaigns.reduce((s, c) => s + c.emailsSent, 0);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Campañas</h1>
          <div className="sub">{total} campañas · {active} activas · {totalSent.toLocaleString()} emails enviados</div>
        </div>
        <ActionPill plusActions={() => {}} />
      </div>

      {campaigns.length === 0 ? (
        <Empty icon="megaphone" title="Sin campañas" sub="Crea tu primera campaña de outreach para empezar a generar leads."/>
      ) : (
        <div style={{display:"flex", flexDirection:"column", gap:10}}>
          {campaigns.map(c => (
            <CampaignCard key={c.id} c={c} navigate={navigate}/>
          ))}
        </div>
      )}
    </div>
  );
};

window.CampaignsPage   = CampaignsPage;
window.CampaignDetail  = CampaignDetail;

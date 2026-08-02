// Pipeline module — leads kanban + table with KPIs
const AgencyPipeline = ({ openModal }) => {
  const D = window.Data;
  D.useStore();
  const toast = useToast();
  const [view, setView] = useState("kanban");
  const [leads, setLeads] = useState(D.LEADS);
  const [dragId, setDragId] = useState(null);
  const [dropCol, setDropCol] = useState(null);
  const [openLead, setOpenLead] = useState(null);

  // Keep local state in sync with newly-added leads from store
  useEffect(() => {
    setLeads(prev => {
      const known = new Set(prev.map(l => l.id));
      const newOnes = D.LEADS.filter(l => !known.has(l.id));
      if (newOnes.length === 0) return prev;
      return [...newOnes, ...prev];
    });
  }, [D.LEADS.length]);

  const kpis = D.KPIS_WEEK;

  const onDrop = (stage) => {
    if (!dragId) return;
    setLeads(ls => ls.map(l => l.id === dragId ? {...l, stage} : l));
    setDragId(null); setDropCol(null);
    toast(`Lead movido a "${D.LEAD_STAGES.find(s=>s.id===stage).label}"`, "success");
  };

  return (
    <div className="page wide" style={{maxWidth: 1500}}>
      <div className="page-head">
        <div>
          <h1>Pipeline</h1>
          <div className="sub">Captación + cualificación. Objetivo semanal: 200 → 10 → 3 → 1.</div>
        </div>
        <div className="row tight">
          <button className="btn"><Icon name="external-link" size={13}/> Conectar Calendly</button>
          <button className="btn primary" onClick={() => openModal("newLead")}><Icon name="plus" size={13}/> Nuevo lead</button>
        </div>
      </div>

      {/* Weekly KPIs */}
      <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap: 14, marginBottom: 18}}>
        {Object.entries(kpis).map(([k, v]) => {
          const pct = Math.min(100, v.current / v.target * 100);
          const color = pct >= 100 ? "var(--green)" : pct >= 60 ? "var(--text)" : "var(--amber)";
          return (
            <div key={k} className="card"><div className="card-body">
              <div className="row between"><div className="metric-label">{v.label} esta semana</div><span className="muted xsmall">obj. {v.target}</span></div>
              <div className="metric-value" style={{marginTop: 6}}>{v.current}</div>
              <div className="progress" style={{marginTop: 8}}><i style={{width: pct+"%", background: color}}/></div>
            </div></div>
          );
        })}
      </div>

      <div className="row between" style={{marginBottom: 14}}>
        <div className="seg">
          <button className={view === "kanban" ? "active" : ""} onClick={() => setView("kanban")}><Icon name="layers" size={12}/> Kanban</button>
          <button className={view === "table" ? "active" : ""} onClick={() => setView("table")}><Icon name="grid" size={12}/> Tabla</button>
        </div>
        <div className="row tight">
          <div className="search" style={{maxWidth: 220}}>
            <Icon name="search" size={13}/><input placeholder="Buscar lead…"/>
          </div>
        </div>
      </div>

      {view === "kanban" && (
        <div style={{display:"grid", gridTemplateColumns:"repeat(6, minmax(0, 1fr))", gap: 12}}>
          {D.LEAD_STAGES.map(s => {
            const list = leads.filter(l => l.stage === s.id);
            return (
              <div key={s.id}
                className={"kanban-col" + (dropCol === s.id ? " drop" : "")}
                onDragOver={e => { e.preventDefault(); setDropCol(s.id); }}
                onDrop={() => onDrop(s.id)}
                onDragLeave={() => setDropCol(null)}>
                <div className="kanban-head">
                  <span>{s.label}</span>
                  <span className="muted xsmall">{list.length}</span>
                </div>
                <div className="kanban-body">
                  {list.map(l => {
                    const ch = D.CHANNELS[l.channel];
                    return (
                      <div key={l.id} className="kanban-card" draggable
                        onDragStart={() => setDragId(l.id)}
                        onClick={() => setOpenLead(l)}>
                        <div className="row between">
                          <div style={{fontWeight: 500, fontSize: 13}}>{l.name}</div>
                          <span className={"dot " + l.light}/>
                        </div>
                        <div className="muted xsmall">{l.company}</div>
                        <div className="row between" style={{marginTop: 2}}>
                          <span className="chip" style={{padding:"1px 7px", fontSize: 10.5}}><Icon name={ch.icon} size={10}/> {ch.label}</span>
                          <span className="xsmall muted">€{l.budget}</span>
                        </div>
                        {l.next && l.next !== "—" && (
                          <div className="xsmall" style={{color:"var(--text-muted)", borderTop:"0.5px solid var(--border)", paddingTop: 6, marginTop: 2}}>
                            <Icon name="clock" size={10}/> {l.next} · <span style={{color:"var(--text)"}}>{l.nextDate}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {list.length === 0 && <div className="subtle xsmall" style={{padding: 10, textAlign:"center"}}>—</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === "table" && (
        <div className="card"><div className="card-body flush">
          <table className="table">
            <thead><tr><th>Lead</th><th>Canal</th><th>Estado</th><th>Presupuesto</th><th>Próxima acción</th><th></th></tr></thead>
            <tbody>
              {leads.map(l => {
                const ch = D.CHANNELS[l.channel];
                const stage = D.LEAD_STAGES.find(s => s.id === l.stage);
                return (
                  <tr key={l.id} onClick={() => setOpenLead(l)}>
                    <td>
                      <div className="row tight"><span className={"dot " + l.light}/>
                        <div><div style={{fontWeight: 500}}>{l.name}</div><div className="subtle xsmall">{l.company}</div></div>
                      </div>
                    </td>
                    <td><span className="chip"><Icon name={ch.icon} size={10}/> {ch.label}</span></td>
                    <td><span className="chip">{stage.label}</span></td>
                    <td style={{fontVariantNumeric:"tabular-nums"}}>€{l.budget}</td>
                    <td><span className="muted">{l.next}</span> {l.nextDate !== "—" && <span className="xsmall" style={{marginLeft: 6}}>{l.nextDate}</span>}</td>
                    <td><button className="btn ghost icon-only sm" onClick={e=>e.stopPropagation()}><Icon name="more-h" size={13}/></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div></div>
      )}

      <LeadDetailModal lead={openLead} onClose={() => setOpenLead(null)}/>
    </div>
  );
};

const LeadDetailModal = ({ lead, onClose }) => {
  const D = window.Data;
  const [checked, setChecked] = useState({});
  if (!lead) return null;
  const ch = D.CHANNELS[lead.channel];

  return (
    <Modal open={true} onClose={onClose} title={lead.name} sub={lead.company + " · " + ch.label} size="lg" footer={
      <>
        <button className="btn" onClick={onClose}>Cerrar</button>
        <button className="btn"><Icon name="msg-circle" size={12}/> WhatsApp</button>
        <button className="btn primary">Marcar llamada hecha <Icon name="check" size={12}/></button>
      </>
    }>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap: 20}}>
        <div>
          <div className="card-title" style={{marginBottom: 10}}>Respuestas Calendly</div>
          <div style={{display:"flex", flexDirection:"column", gap: 12}}>
            <div>
              <div className="label">¿Qué necesita?</div>
              <div style={{padding: 10, background:"var(--bg-elev-2)", borderRadius: 8, fontSize: 13, border:"0.5px solid var(--border)"}}>{lead.needs}</div>
            </div>
            {lead.instagram && (
              <div>
                <div className="label">Instagram</div>
                <a href={`https://instagram.com/${String(lead.instagram).replace(/^@/, "")}`} target="_blank" rel="noreferrer"
                  style={{fontSize: 13, color:"var(--accent)", textDecoration:"none", display:"inline-flex", alignItems:"center", gap:6}}>
                  <Icon name="external-link" size={12}/> {lead.instagram.startsWith("@") ? lead.instagram : "@" + lead.instagram}
                </a>
              </div>
            )}
            <div className="row tight">
              <div className="grow">
                <div className="label">Presupuesto</div>
                <div className="row tight"><span className={"dot " + lead.light}/><span style={{fontWeight: 500}}>€{lead.budget}</span></div>
              </div>
              <div className="grow">
                <div className="label">Cuándo</div>
                <div style={{fontSize: 13}}>{lead.when}</div>
              </div>
            </div>
            <div>
              <div className="label">Entrada</div>
              <div className="muted small">{lead.enteredAt} · próxima acción <b style={{color:"var(--text)"}}>{lead.next}</b> {lead.nextDate !== "—" && "el " + lead.nextDate}</div>
            </div>
          </div>
        </div>
        <div>
          <div className="card-title" style={{marginBottom: 10}}>Antes de la llamada</div>
          <div style={{display:"flex", flexDirection:"column", gap: 6}}>
            {D.CALL_PREP.map((item, i) => (
              <label key={i} className="row tight" style={{padding: "8px 10px", background:"var(--bg-elev-2)", border:"0.5px solid var(--border)", borderRadius: 8, cursor:"pointer"}}>
                <input type="checkbox" checked={!!checked[i]} onChange={e => setChecked({...checked, [i]: e.target.checked})}/>
                <span style={{fontSize: 13, textDecoration: checked[i] ? "line-through" : "none", opacity: checked[i] ? 0.5 : 1}}>{item}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

window.AgencyPipeline = AgencyPipeline;

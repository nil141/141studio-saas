// Agency Clients list + detail (MVP — WhatsApp + Drive + service)
const AgencyClientsList = ({ navigate, openModal }) => {
  const D = window.Data;
  D.useStore();
  const confirm = useConfirm();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(null);

  const filtered = D.CLIENTS.filter(c =>
    !q || (c.name + c.company + c.email).toLowerCase().includes(q.toLowerCase())
  );

  const removeClient = async (c) => {
    setMenuOpen(null);
    const projectsCount = D.PROJECTS.filter(p => p.clientId === c.id).length;
    const ok = await confirm({
      title: `Eliminar a ${c.company}?`,
      body: projectsCount > 0
        ? `Se eliminarán también ${projectsCount} proyecto${projectsCount === 1 ? "" : "s"} y todas las facturas asociadas. Esta acción no se puede deshacer.`
        : "Se eliminarán también todas las facturas asociadas. Esta acción no se puede deshacer.",
      confirmLabel: "Sí, eliminar",
      danger: true,
    });
    if (ok) {
      D.deleteClient(c.id);
      toast(`${c.company} eliminado`, "success");
    }
  };

  return (
    <div className="page" onClick={() => setMenuOpen(null)}>
      <div className="page-head">
        <div>
          <h1>Clientes</h1>
          <div className="sub">{D.CLIENTS.length} en total · {D.CLIENTS.filter(c=>c.status==="active").length} activos</div>
        </div>
        <div className="row tight">
          <button className="btn" onClick={() => openModal("newClient")}><Icon name="plus" size={14}/> Nuevo cliente</button>
          <button className="btn primary" onClick={() => openModal("invite")}><Icon name="external-link" size={14}/> Invitar cliente</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search" style={{maxWidth: 380}}>
            <Icon name="search" size={14}/>
            <input placeholder="Buscar cliente…" value={q} onChange={e => setQ(e.target.value)}/>
          </div>
        </div>
        <div className="card-body flush">
          {filtered.length === 0 ? (
            <Empty icon="users" title="Sin clientes" sub="Añade tu primer cliente para empezar."/>
          ) : filtered.map((c, i) => (
            <div key={c.id}
              onClick={() => navigate("clientDetail", { clientId: c.id })}
              style={{
                display:"flex", alignItems:"center", gap:14,
                padding:"13px 18px", cursor:"pointer", transition:"background .1s",
                borderBottom: i === filtered.length - 1 ? "0" : "0.5px solid var(--border)",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <Avatar name={c.name} initials={c.initials} color={c.color}/>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontWeight:500, fontSize:14, color:"var(--text)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{c.company}</div>
                {(c.name || c.email) && (
                  <div className="subtle xsmall" style={{overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
                    {c.name}{c.email ? " · " + c.email : ""}
                  </div>
                )}
              </div>
              {c.service && c.service !== "—" && <span className="chip" style={{flexShrink:0}}>{c.service}</span>}
              <StatusChip status={c.status}/>
              <div style={{position:"relative", flexShrink:0}} onClick={e => e.stopPropagation()}>
                <button className="btn ghost icon-only sm" onClick={() => setMenuOpen(menuOpen === c.id ? null : c.id)}>
                  <Icon name="more-h" size={14}/>
                </button>
                {menuOpen === c.id && (
                  <div style={{position:"absolute", right: 0, top: "calc(100% - 2px)", zIndex: 10,
                    background:"var(--bg-elev)", border:"0.5px solid var(--border-strong)",
                    borderRadius: 10, padding: 4, minWidth: 180, boxShadow:"0 8px 24px rgba(0,0,0,0.3)"}}>
                    <MenuItem icon="edit" onClick={() => { setMenuOpen(null); navigate("clientDetail", { clientId: c.id }); }}>Ver detalle</MenuItem>
                    <MenuItem icon="archive" onClick={() => { setMenuOpen(null); toast("Cliente archivado"); }}>Archivar</MenuItem>
                    <div style={{height: 1, background: "var(--border)", margin: "4px 0"}}/>
                    <MenuItem icon="x" danger onClick={() => removeClient(c)}>Eliminar</MenuItem>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MenuItem = ({ icon, onClick, children, danger }) => (
  <button onClick={onClick} style={{
    display:"flex", alignItems:"center", gap: 8, width:"100%",
    padding:"7px 10px", border: 0, background:"transparent",
    color: danger ? "var(--red)" : "var(--text)",
    fontSize: 13, borderRadius: 6, cursor:"pointer", fontFamily:"inherit",
    textAlign:"left",
  }}
  onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
    <Icon name={icon} size={13}/> {children}
  </button>
);

const AgencyClientDetail = ({ clientId, navigate, openModal }) => {
  const D = window.Data;
  D.useStore();
  const confirm = useConfirm();
  const toast = useToast();
  const c = D.CLIENTS.find(x => x.id === clientId);
  useEffect(() => { if (!c) navigate("clients"); }, [c]);
  if (!c) return null;
  const projects = D.PROJECTS.filter(p => p.clientId === c.id);
  const invoices = D.INVOICES.filter(i => i.clientId === c.id);
  const [tab, setTab] = useState("projects");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  const startEdit = () => {
    setForm({ name: c.name, company: c.company, email: c.email, whatsapp: c.whatsapp, service: c.service, status: c.status });
    setEditing(true);
  };
  const saveEdit = () => {
    D.updateClient(c.id, form);
    setEditing(false);
    toast("Cliente actualizado", "success");
  };
  const cancelEdit = () => setEditing(false);
  const field = (key) => ({ value: form[key] || "", onChange: e => setForm(f => ({ ...f, [key]: e.target.value })) });

  const removeClient = async () => {
    const ok = await confirm({
      title: `Eliminar a ${c.company}?`,
      body: `Se eliminarán también ${projects.length} proyecto${projects.length === 1 ? "" : "s"} y ${invoices.length} factura${invoices.length === 1 ? "" : "s"}. Esta acción no se puede deshacer.`,
      confirmLabel: "Sí, eliminar",
      danger: true,
    });
    if (ok) {
      D.deleteClient(c.id);
      toast(`${c.company} eliminado`, "success");
      navigate("clients");
    }
  };

  const removeProject = async (p) => {
    const ok = await confirm({
      title: `Eliminar el proyecto "${p.name}"?`,
      body: "Se eliminarán también sus entregables. Esta acción no se puede deshacer.",
      confirmLabel: "Sí, eliminar",
      danger: true,
    });
    if (ok) { D.deleteProject(p.id); toast("Proyecto eliminado", "success"); }
  };

  const totalBilled = invoices.filter(i => i.status === "paid").reduce((a, b) => a + b.amount, 0);
  const pending     = invoices.filter(i => i.status === "pending").reduce((a, b) => a + b.amount, 0);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="page" onClick={() => setMenuOpen(false)}>
      {/* Back */}
      <button className="btn ghost sm" style={{marginBottom: 20}} onClick={() => navigate("clients")}>
        <Icon name="chevron" size={12} style={{transform:"rotate(180deg)"}}/> Clientes
      </button>

      {/* ── HERO CARD ── */}
      {editing ? (
        <div className="card" style={{marginBottom: 20}}>
          <div className="card-header">
            <div className="card-title">Editar cliente</div>
            <div className="row tight">
              <button className="btn sm" onClick={cancelEdit}>Cancelar</button>
              <button className="btn primary sm" onClick={saveEdit}><Icon name="check" size={12}/> Guardar cambios</button>
            </div>
          </div>
          <div className="card-body" style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap: 16}}>
            <div><label className="label">Nombre de contacto</label><input className="input" {...field("name")}/></div>
            <div><label className="label">Empresa</label><input className="input" {...field("company")}/></div>
            <div><label className="label">Email</label><input className="input" type="email" {...field("email")}/></div>
            <div><label className="label">WhatsApp</label><input className="input" {...field("whatsapp")}/></div>
            <div><label className="label">Servicio</label><input className="input" {...field("service")}/></div>
            <div><label className="label">Estado</label>
              <select className="select" {...field("status")}>
                <option value="active">Activo</option>
                <option value="review">En revisión</option>
                <option value="paused">Pausado</option>
              </select>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{marginBottom: 20, overflow:"hidden"}}>
          {/* Accent strip */}
          <div style={{height: 4, background: c.color, opacity: 0.7}}/>

          <div style={{padding: "28px 28px 24px", display:"flex", gap: 24, alignItems:"flex-start"}}>
            {/* Avatar */}
            <div style={{
              width: 72, height: 72, borderRadius: 16, flexShrink: 0,
              background: c.color + "22", border: "1.5px solid " + c.color + "44",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize: 24, fontWeight: 600, color: c.color,
              fontFamily:"var(--font-display)", letterSpacing:"-0.03em",
            }}>
              {c.initials}
            </div>

            {/* Info block */}
            <div style={{flex: 1, minWidth: 0}}>
              <div style={{display:"flex", alignItems:"center", gap: 10, marginBottom: 6}}>
                <h1 style={{fontSize: 22, margin: 0}}>{c.company}</h1>
                <StatusChip status={c.status}/>
                <span className="chip">{c.service}</span>
              </div>
              <div style={{display:"flex", gap: 20, color:"var(--text-muted)", fontSize: 13, flexWrap:"wrap"}}>
                <span style={{display:"flex", alignItems:"center", gap: 5}}>
                  <Icon name="users" size={12}/> {c.name}
                </span>
                <span style={{display:"flex", alignItems:"center", gap: 5}}>
                  <Icon name="mail" size={12}/> {c.email}
                </span>
                {c.whatsapp && (
                  <span style={{display:"flex", alignItems:"center", gap: 5}}>
                    <Icon name="phone" size={12}/> {c.whatsapp}
                  </span>
                )}
                <span style={{color:"var(--text-subtle)"}}>Cliente desde {c.since}</span>
              </div>

              {/* Stats row */}
              <div style={{display:"flex", gap: 12, marginTop: 20}}>
                {[
                  { label: "Facturado", value: "€" + totalBilled.toLocaleString("es-ES"), color: "var(--text)" },
                  { label: "Pendiente", value: pending > 0 ? "€" + pending.toLocaleString("es-ES") : "—", color: pending > 0 ? "var(--amber)" : "var(--text-subtle)" },
                  { label: "Proyectos activos", value: projects.length, color: "var(--text)" },
                  { label: "MRR", value: c.mrr ? "€" + c.mrr + "/m" : "—", color: c.mrr ? "var(--green)" : "var(--text-subtle)" },
                ].map(s => (
                  <div key={s.label} style={{
                    padding:"10px 16px", borderRadius: 10,
                    background:"var(--bg-elev-2)", border:"0.5px solid var(--border)",
                    minWidth: 100,
                  }}>
                    <div style={{fontSize: 11, color:"var(--text-subtle)", marginBottom: 4, fontWeight: 500}}>{s.label}</div>
                    <div style={{fontSize: 18, fontWeight: 600, color: s.color, fontFamily:"var(--font-display)", letterSpacing:"-0.02em"}}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions — single row, consistent height */}
            <div style={{display:"flex", gap: 6, alignItems:"center", flexShrink: 0, alignSelf:"flex-start"}}>
              <a className="btn" href={`https://wa.me/${(c.whatsapp||"").replace(/\D/g,"")}`} target="_blank"
                style={{color:"#25D366", borderColor:"#25D36655"}}>
                <Icon name="msg-circle" size={13}/> WhatsApp
              </a>
              <button className="btn" onClick={startEdit}>
                <Icon name="edit" size={13}/> Editar
              </button>
              <button className="btn primary" onClick={() => navigate("client-dashboard")}>
                <Icon name="external-link" size={13}/> Abrir portal
              </button>
              <div style={{position:"relative"}} onClick={e => e.stopPropagation()}>
                <button className="btn ghost icon-only" onClick={() => setMenuOpen(o => !o)}>
                  <Icon name="more-h" size={14}/>
                </button>
                {menuOpen && (
                  <div style={{
                    position:"absolute", right: 0, top:"calc(100% + 4px)", zIndex: 20,
                    background:"var(--bg-elev)", border:"0.5px solid var(--border-strong)",
                    borderRadius: 10, padding: 4, minWidth: 170,
                    boxShadow:"0 8px 24px rgba(0,0,0,0.25)"
                  }}>
                    <button onClick={() => { setMenuOpen(false); toast("Archivado"); }} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"7px 10px",border:0,background:"transparent",color:"var(--text)",fontSize:13,borderRadius:6,cursor:"pointer",fontFamily:"inherit"}}>
                      <Icon name="archive" size={13}/> Archivar cliente
                    </button>
                    <div style={{height:1, background:"var(--border)", margin:"4px 0"}}/>
                    <button onClick={() => { setMenuOpen(false); removeClient(); }} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"7px 10px",border:0,background:"transparent",color:"var(--red)",fontSize:13,borderRadius:6,cursor:"pointer",fontFamily:"inherit"}}>
                      <Icon name="x" size={13}/> Eliminar cliente
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        {[
          {id:"projects", label:"Proyectos", count:projects.length},
          {id:"billing",  label:"Facturación", count:invoices.length},
          {id:"files",    label:"Archivos (Drive)"},
          {id:"notas",    label:"Notas internas"},
        ].map(t => (
          <div key={t.id} className={"tab" + (tab === t.id ? " active" : "")} onClick={() => setTab(t.id)}>
            {t.label}{t.count != null ? <span className="count">{t.count}</span> : null}
          </div>
        ))}
      </div>

      {tab === "projects" && (
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap: 14}}>
          {projects.map(p => {
            const phase = D.PHASES[p.phase];
            return (
              <div key={p.id} className="card" style={{cursor:"pointer", position:"relative"}} onClick={() => navigate("project", { projectId: p.id })}>
                <div className="card-body">
                  <div className="row between">
                    <div className="row tight"><span className={"dot " + p.light}/><span style={{fontWeight: 500}}>{p.name}</span></div>
                    <span className="chip">{phase.label}</span>
                  </div>
                  <div className="muted small" style={{marginTop: 8}}>{p.description}</div>
                  <div style={{marginTop: 14, display:"flex", alignItems:"center", gap: 10}}>
                    <div className="progress grow"><i style={{width: p.progress + "%"}}/></div>
                    <span className="muted small">{p.progress}%</span>
                  </div>
                  <div className="row between" style={{marginTop: 10}}>
                    <div className="muted xsmall"><Icon name="calendar" size={11}/> Entrega {p.deadline}</div>
                    <button className="btn ghost icon-only sm danger" data-tooltip="Eliminar proyecto" onClick={(e) => { e.stopPropagation(); removeProject(p); }}>
                      <Icon name="x" size={12}/>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          <button className="card" style={{cursor:"pointer", border:"0.5px dashed var(--border-strong)", padding: 28, display:"flex", alignItems:"center", justifyContent:"center", gap: 8, color:"var(--text-muted)", background:"transparent"}}
            onClick={() => openModal && openModal("newProject", { clientId: c.id })}>
            <Icon name="plus" size={14}/> Nuevo proyecto para {c.company}
          </button>
        </div>
      )}

      {tab === "billing" && (
        <div className="card"><div className="card-body flush">
          {invoices.length === 0 ? <Empty icon="receipt" title="Sin facturas" sub="Este cliente todavía no tiene facturas."/> : (
          <table className="table">
            <thead><tr><th>Nº</th><th>Proyecto</th><th>Tipo</th><th>Emitida</th><th style={{textAlign:"right"}}>Importe</th><th>Estado</th></tr></thead>
            <tbody>{invoices.map(i => (
              <tr key={i.id}>
                <td style={{fontFamily:"var(--font-mono)", fontSize: 12}}>{i.id}</td>
                <td>{i.project}</td>
                <td><span className="chip">{i.type}</span></td>
                <td className="muted">{i.issued}</td>
                <td style={{textAlign:"right", fontWeight: 500}}>€{i.amount.toLocaleString("es-ES")}</td>
                <td><StatusChip status={i.status}/></td>
              </tr>
            ))}</tbody>
          </table>
          )}
        </div></div>
      )}

      {tab === "files" && (
        <div className="card">
          <div className="card-header">
            <div className="row tight">
              <div style={{width:24, height:24, borderRadius:6, background:"#fff", display:"grid", placeItems:"center"}}>
                <svg width="14" height="14" viewBox="0 0 24 24"><path fill="#1FA463" d="M7.71 3.5L1.15 15l3.27 5.5h13.16L21.85 15 14.29 3.5z"/><path fill="#FFD041" d="M7.71 3.5h6.58L21.85 15l-3.27 5.5z" opacity=".7"/></svg>
              </div>
              <div className="card-title">Sincronizado con Google Drive</div>
            </div>
            <button className="btn sm"><Icon name="external-link" size={12}/> Abrir en Drive</button>
          </div>
          <div className="card-body flush">
            {D.DRIVE_FOLDERS.map((f, i) => (
              <div key={f.name} style={{padding:"14px 18px", display:"flex", alignItems:"center", gap: 12, borderBottom: i === D.DRIVE_FOLDERS.length - 1 ? "0" : "0.5px solid var(--border)", cursor:"pointer"}}>
                <Icon name="folder" size={16} style={{color:"var(--text-muted)"}}/>
                <div className="grow">
                  <div style={{fontWeight: 500, fontSize: 13}}>/{f.name}</div>
                  <div className="subtle xsmall">{f.count} archivos · {f.size}</div>
                </div>
                <Icon name="chevron" size={13} style={{color:"var(--text-subtle)"}}/>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "notas" && (
        <div className="card"><div className="card-body">
          <textarea className="textarea" rows={6} defaultValue={`Cliente histórico, prefiere comunicación por WhatsApp.\nPrioridad: rediseño antes del Q3.\nPedido: factura siempre con CIF en cabecera.`}/>
          <div className="row" style={{marginTop: 12, justifyContent:"flex-end"}}>
            <button className="btn primary sm">Guardar nota</button>
          </div>
        </div></div>
      )}
    </div>
  );
};

Object.assign(window, { AgencyClientsList, AgencyClientDetail });

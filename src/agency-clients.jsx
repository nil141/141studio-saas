// Agency Clients list + detail (MVP — WhatsApp + Drive + service)
const AgencyClientsList = ({ navigate, openModal }) => {
  const D = window.Data;
  D.useStore();
  const toast = useToast();

  // Al abrir Clientes, re-cargar desde Supabase para ver altas recientes
  // (p. ej. clientes que se acaban de registrar por el enlace de invitación).
  useEffect(() => { D.reload && D.reload(); }, []);

  const clients = D.CLIENTS;
  const [hoverId, setHoverId] = useState(null);

  // ── Modal de enlace de portal generado ──
  const [inviteLink, setInviteLink] = useState("");
  const [inviteCopied, setInviteCopied] = useState(false);
  const [inviteBusy, setInviteBusy] = useState(false);

  const generateInvite = async () => {
    if (inviteBusy) return;
    setInviteBusy(true);
    const res = await D.createInvite({});  // sin clientId → la ficha se creará al completar el onboarding
    if (res && res.token) {
      setInviteLink(`${window.location.origin}/invite/${res.token}`);
    } else {
      toast(res?.error || "Error al generar el enlace", "error");
    }
    setInviteBusy(false);
  };
  const copyInvite = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setInviteCopied(true);
      toast("Enlace copiado", "success");
      setTimeout(() => setInviteCopied(false), 2000);
    });
  };

  return (
    <div style={{
      height:"100vh",
      display:"flex", flexDirection:"column",
      padding:"28px 32px 0",
      maxWidth:1400, margin:"0 auto",
      overflow:"hidden",
    }}>
      <div className="page-head" style={{ flexShrink:0 }}>
        <div>
          <h1>Clientes</h1>
          <div className="sub">{clients.length} en total</div>
        </div>
        <ActionPill
          plusActions={[
            { icon: "edit",          label: "Añadir ficha manualmente", sub: "Tú rellenas sus datos.",
              onClick: () => openModal("newClient") },
            { icon: "external-link", label: "Generar enlace de portal", sub: "Él rellena sus datos al registrarse.",
              accent: true, onClick: generateInvite },
          ]}
          moreActions={[
            { icon: "refresh-cw", label: "Actualizar lista",
              onClick: () => { D.reload && D.reload(); toast("Lista actualizada", "success"); } },
          ]}
        />
      </div>

      {/* Modal del enlace generado */}
      {inviteLink && (
        <div onClick={() => setInviteLink("")} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(6px)", zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "var(--bg-elev)", border: "0.5px solid var(--border-strong)",
            borderRadius: 16, padding: 24, maxWidth: 460, width: "100%",
            boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, marginBottom: 14,
              background: "var(--accent-soft)", color: "var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon name="external-link" size={20} strokeWidth={1.7}/>
            </div>
            <h2 style={{ fontSize: 19, fontWeight: 500, letterSpacing: "-0.5px", marginBottom: 6 }}>
              Enlace de portal generado
            </h2>
            <p style={{ fontSize: 13.5, color: "var(--text-muted)", marginBottom: 18, lineHeight: 1.5 }}>
              Comparte este enlace con el cliente. Cuando se registre, su ficha se creará automáticamente.
            </p>
            <input readOnly value={inviteLink} onClick={e => e.target.select()} style={{
              width: "100%", padding: "11px 14px", borderRadius: 10, marginBottom: 14,
              background: "var(--bg-elev-2)", border: "0.5px solid var(--border)",
              color: "var(--text)", fontFamily: "var(--font-mono)", fontSize: 12,
            }}/>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn" onClick={() => setInviteLink("")}>Cerrar</button>
              <button className="btn primary" onClick={copyInvite}>
                {inviteCopied ? <Icon name="check" size={13}/> : null}
                {inviteCopied ? "Copiado" : "Copiar enlace"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista — mismo formato de filas que Proyectos/Campañas */}
      <div className="tasks-scroll" style={{ flex:1, minHeight:0, overflowY:"auto", scrollbarGutter:"stable", paddingRight:10, paddingBottom:24 }}>
        <div style={{ display:"flex", flexDirection:"column", width:"100%" }}>
          {clients.map(c => {
            const projs = D.PROJECTS.filter(p => p.clientId === c.id);
            const pTasks = projs.flatMap(p => D.TASKS[p.id] || []);
            const doneN = pTasks.filter(t => t.column === "done").length;
            const pct = pTasks.length ? Math.round((doneN / pTasks.length) * 100) : 0;
            const col = pTasks.length && doneN === pTasks.length ? "var(--green)" : "var(--accent)";
            const on = hoverId === c.id;
            return (
              <div key={c.id} onClick={() => navigate("clientDetail", { clientId: c.id })}
                onMouseEnter={() => setHoverId(c.id)} onMouseLeave={() => setHoverId(null)}
                style={{ display:"flex", flexDirection:"column", gap:12, padding:"18px 6px", cursor:"pointer" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:14, minWidth:0 }}>
                    <Icon name="users" size={22} strokeWidth={1.6}
                      style={{ color:"var(--text)", flexShrink:0, transform: on ? "scale(1.06)" : "none", transition:"transform .3s" }}/>
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontSize:17, color:"var(--text)", letterSpacing:"-0.4px", lineHeight:1.2,
                        whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                        {c.company || c.name || "—"}
                      </div>
                      <div style={{ fontSize:12.5, color:"var(--text-muted)", marginTop:3, display:"flex", alignItems:"center", gap:6, minWidth:0 }}>
                        <span style={{ flexShrink:0 }}>{projs.length} {projs.length === 1 ? "proyecto" : "proyectos"}</span>
                        {c.name && c.company && <>
                          <span style={{ opacity:0.4, fontSize:10 }}>•</span>
                          <span style={{ flexShrink:0 }}>{c.name}</span>
                        </>}
                        {c.email && <>
                          <span style={{ opacity:0.4, fontSize:10 }}>•</span>
                          <span style={{ whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{c.email}</span>
                        </>}
                      </div>
                    </div>
                  </div>
                  <Icon name="chevron-right" size={18}
                    style={{ color: on ? "var(--text)" : "var(--text-muted)", transform: on ? "translateX(3px)" : "none",
                      transition:"all .2s", flexShrink:0 }}/>
                </div>
                <div style={{ position:"relative", width:"100%", height:3, background:"rgba(255,255,255,0.05)", borderRadius:99, overflow:"hidden" }}>
                  <div style={{ position:"absolute", height:"100%", borderRadius:99, background:col, width:`${pct}%`, transition:"width .3s" }}/>
                </div>
              </div>
            );
          })}

          {/* Añadir cliente — botón discontinuo estilo outdomode */}
          <button onClick={() => openModal("newClient")} style={{
            marginTop:16, width:"100%", padding:"26px", borderRadius:22,
            border:"1px dashed var(--border)", background:"transparent", cursor:"pointer",
            color:"var(--text-muted)", fontSize:15, fontFamily:"inherit", opacity:0.5, transition:"opacity .2s",
            display:"flex", alignItems:"center", justifyContent:"center", gap:8, letterSpacing:"-0.2px",
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = 0.85}
            onMouseLeave={e => e.currentTarget.style.opacity = 0.5}>
            {clients.length === 0 ? "Añade tu primer cliente" : "Añadir cliente"} <Icon name="plus" size={16}/>
          </button>
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
  const creds = D.credentialsForClient ? D.credentialsForClient(c.id) : [];
  const [tab, setTab] = useState("projects");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  // ── Portal de cliente ──
  const hasPortal = !!c.email && c.email.includes("@");  // existe acceso si tiene email vinculado por complete_invite
  const [portalBusy, setPortalBusy] = useState(false);
  const [portalLink, setPortalLink] = useState("");
  const [portalCopied, setPortalCopied] = useState(false);
  const createPortal = async () => {
    if (portalBusy) return;
    setPortalBusy(true);
    const res = await D.createInvite({ clientId: c.id, service: c.service || "" });
    if (res && res.token) {
      setPortalLink(`${window.location.origin}/invite/${res.token}`);
    } else {
      toast(res?.error || "Error al generar el portal", "error");
    }
    setPortalBusy(false);
  };
  const copyPortal = () => {
    navigator.clipboard.writeText(portalLink).then(() => {
      setPortalCopied(true);
      toast("Enlace copiado", "success");
      setTimeout(() => setPortalCopied(false), 2000);
    });
  };

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

      {/* Portal de cliente */}
      {!editing && (
        <div className="card" style={{ padding: "16px 20px", marginBottom: 16,
          display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: hasPortal ? "var(--green-soft)" : "var(--bg-elev-2)",
            color: hasPortal ? "var(--green)" : "var(--text-muted)",
            border: "0.5px solid var(--border)",
          }}>
            <Icon name={hasPortal ? "check" : "external-link"} size={16} strokeWidth={1.7}/>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 14, fontWeight: 500, letterSpacing: "-0.3px" }}>
              {hasPortal ? "Portal de cliente activo" : "Sin portal de cliente"}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              {hasPortal
                ? `${c.email} tiene acceso al portal.`
                : "Genera un enlace para que cree su acceso."}
            </div>
          </div>
          {portalLink ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <input readOnly value={portalLink} onClick={e => e.target.select()}
                style={{
                  fontSize: 12, padding: "8px 12px", borderRadius: 8,
                  background: "var(--bg-elev)", border: "0.5px solid var(--border)",
                  color: "var(--text-muted)", fontFamily: "var(--font-mono)",
                  width: 320, maxWidth: "100%",
                }}/>
              <button className="btn primary sm" onClick={copyPortal}>
                {portalCopied ? <Icon name="check" size={12}/> : null} {portalCopied ? "Copiado" : "Copiar enlace"}
              </button>
            </div>
          ) : !hasPortal && (
            <button className="btn primary" onClick={createPortal} disabled={portalBusy}>
              <Icon name="external-link" size={13}/> {portalBusy ? "Generando…" : "Crear portal"}
            </button>
          )}
        </div>
      )}

      {/* Datos de facturación / onboarding (lo que rellenó el cliente) */}
      {!editing && (c.fiscalName || c.nif || c.fiscalAddress || c.website || c.about) && (
        <div className="card" style={{ padding: "16px 20px", marginBottom: 16 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em",
            color: "var(--text-subtle)", marginBottom: 12 }}>Datos de facturación</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: "12px 24px" }}>
            {[
              ["Razón social", c.fiscalName],
              ["NIF / CIF", c.nif],
              ["Dirección fiscal", c.fiscalAddress],
              ["Web", c.website],
            ].filter(([, v]) => v).map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 11, color: "var(--text-subtle)", marginBottom: 3 }}>{k}</div>
                <div style={{ fontSize: 13.5, color: "var(--text)", letterSpacing: "-0.2px", wordBreak: "break-word" }}>{v}</div>
              </div>
            ))}
          </div>
          {c.about && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, color: "var(--text-subtle)", marginBottom: 3 }}>A qué se dedica</div>
              <div style={{ fontSize: 13.5, color: "var(--text-muted)", letterSpacing: "-0.2px", lineHeight: 1.5 }}>{c.about}</div>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        {[
          {id:"projects", label:"Proyectos", count:projects.length},
          {id:"billing",  label:"Facturación", count:invoices.length},
          {id:"credentials", label:"Credenciales", count:creds.length},
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

      {tab === "credentials" && <AgencyCredentials clientId={c.id}/>}

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

// ── Panel de credenciales del cliente (compartido con el portal) ────
const AgencyCredentials = ({ clientId }) => {
  const D = window.Data;
  D.useStore && D.useStore();
  const creds = D.credentialsForClient ? D.credentialsForClient(clientId) : [];
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [reveal, setReveal] = useState({});
  const [copied, setCopied] = useState("");
  const blank = { label:"", url:"", username:"", password:"", notes:"" };
  const [form, setForm] = useState(blank);

  const startAdd  = () => { setForm(blank); setEditing(null); setAdding(true); };
  const startEdit = (c) => { setForm({ label:c.label, url:c.url, username:c.username, password:c.password, notes:c.notes }); setEditing(c.id); setAdding(true); };
  const cancel = () => { setAdding(false); setEditing(null); setForm(blank); };
  const save = () => {
    if (!form.label.trim()) return;
    if (editing) D.updateCredential(editing, form); else D.addCredential(clientId, form);
    cancel();
  };
  const del = (c) => { if (confirm(`¿Eliminar el acceso "${c.label}"?`)) D.deleteCredential(c.id); };
  const copy = (val, key) => { try { navigator.clipboard.writeText(val); setCopied(key); setTimeout(() => setCopied(""), 1200); } catch {} };
  const set = (k, v) => setForm(s => ({ ...s, [k]: v }));
  const inp = { width:"100%", height:38, borderRadius:9, padding:"8px 12px", background:"var(--bg-elev)",
    border:"0.5px solid var(--border)", color:"var(--text)", fontFamily:"inherit", fontSize:13.5, marginBottom:9 };

  return (
    <div>
      <div className="row between" style={{marginBottom: 14}}>
        <div className="small muted">Accesos compartidos con este cliente. El cliente también los ve y edita desde su portal.</div>
        {!adding && <button className="btn primary sm" onClick={startAdd}><Icon name="plus" size={13}/> Añadir</button>}
      </div>

      {adding && (
        <div className="card" style={{marginBottom: 14}}><div className="card-body" style={{padding: 16}}>
          <input style={inp} placeholder="Nombre del acceso (Instagram, Hosting…)" value={form.label} onChange={e => set("label", e.target.value)} autoFocus/>
          <input style={inp} placeholder="URL" value={form.url} onChange={e => set("url", e.target.value)}/>
          <input style={inp} placeholder="Usuario / email" value={form.username} onChange={e => set("username", e.target.value)}/>
          <input style={inp} placeholder="Contraseña" value={form.password} onChange={e => set("password", e.target.value)}/>
          <input style={{...inp, marginBottom: 12}} placeholder="Notas (opcional)" value={form.notes} onChange={e => set("notes", e.target.value)}/>
          <div className="row tight">
            <button className="btn primary sm" disabled={!form.label.trim()} onClick={save}>Guardar</button>
            <button className="btn ghost sm" onClick={cancel}>Cancelar</button>
          </div>
        </div></div>
      )}

      {creds.length === 0 && !adding ? (
        <Empty icon="lock" title="Sin credenciales" sub="Añade los accesos del cliente o pídele que los rellene desde su portal."/>
      ) : (
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap: 12}}>
          {creds.map(c => (
            <div key={c.id} className="card"><div className="card-body" style={{padding: 15}}>
              <div className="row between" style={{alignItems:"flex-start"}}>
                <div className="row tight">
                  <div style={{width: 32, height: 32, borderRadius: 8, background:"var(--bg-elev-2)", display:"grid", placeItems:"center", color:"var(--text-muted)", border:"0.5px solid var(--border)"}}>
                    <Icon name="key" size={14}/>
                  </div>
                  <div style={{fontWeight: 500, fontSize: 14}}>{c.label}</div>
                </div>
                <div className="row tight">
                  <button className="btn ghost icon-only sm" onClick={() => startEdit(c)}><Icon name="edit" size={12}/></button>
                  <button className="btn ghost icon-only sm" onClick={() => del(c)}><Icon name="trash" size={12}/></button>
                </div>
              </div>
              {c.url && <div className="small" style={{marginTop: 8, wordBreak:"break-all"}}><span className="muted">Web: </span>{c.url}</div>}
              {c.username && <div className="small" style={{marginTop: 4, wordBreak:"break-all"}}><span className="muted">Usuario: </span>{c.username}
                <button className="btn ghost icon-only sm" style={{marginLeft:4}} onClick={() => copy(c.username, c.id+"u")}><Icon name={copied===c.id+"u"?"check":"copy"} size={11}/></button></div>}
              {c.password && (
                <div className="small" style={{marginTop: 4, display:"flex", alignItems:"center", gap:6, flexWrap:"wrap"}}>
                  <span className="muted">Clave: </span>
                  <span style={{fontFamily:"var(--font-mono)"}}>{reveal[c.id] ? c.password : "••••••••"}</span>
                  <button className="btn ghost icon-only sm" onClick={() => setReveal(r => ({ ...r, [c.id]: !r[c.id] }))}><Icon name={reveal[c.id]?"eye-off":"eye"} size={11}/></button>
                  <button className="btn ghost icon-only sm" onClick={() => copy(c.password, c.id+"p")}><Icon name={copied===c.id+"p"?"check":"copy"} size={11}/></button>
                </div>
              )}
              {c.notes && <div className="muted xsmall" style={{marginTop: 8, lineHeight: 1.5}}>{c.notes}</div>}
            </div></div>
          ))}
        </div>
      )}
    </div>
  );
};

Object.assign(window, { AgencyClientsList, AgencyClientDetail });

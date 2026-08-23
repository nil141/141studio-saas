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
  const ctasks = D.clientTasksFor ? D.clientTasksFor(c.id) : [];
  const pendingAvisos = D.pendingEmailsFor ? D.pendingEmailsFor(c.id) : [];
  const projectIdSet = new Set(projects.map(p => p.id));
  const clientDeliverables = (D.DELIVERABLES || []).filter(d => projectIdSet.has(d.projectId));
  const [tab, setTab] = useState("vista");
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

  // ── Compositor "Enviar aviso" ──
  const NOTIFY_SECTIONS = [
    { v:"client-dashboard",   label:"Inicio del portal" },
    { v:"client-status",      label:"Estado del proyecto" },
    { v:"client-docs",        label:"Documentación (subir archivos)" },
    { v:"client-credentials", label:"Credenciales (dar accesos)" },
  ];
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [outboxOpen, setOutboxOpen] = useState(false);
  const [nf, setNf] = useState({ title:"", body:"", route:"client-dashboard" });
  const openNotify = () => { setNf({ title:"", body:"", route:"client-dashboard" }); setNotifyOpen(true); };
  const sendNotify = () => {
    if (!nf.title.trim()) return;
    D.notify(c.id, { title: nf.title.trim(), body: nf.body.trim(), kind: "general", route: nf.route });
    setNotifyOpen(false);
    toast(c.email ? "Aviso añadido a la bandeja (revisa y envía abajo)" : "Aviso creado (el cliente no tiene email)", "success");
  };
  const _sectShort = { "client-dashboard":"Inicio", "client-status":"Estado", "client-docs":"Documentación", "client-credentials":"Credenciales" };
  const nInp = { width:"100%", borderRadius:9, padding:"9px 12px", background:"var(--bg-elev)",
    border:"0.5px solid var(--border)", color:"var(--text)", fontFamily:"inherit", fontSize:13.5, marginBottom:10 };

  return (
    <div className="page" onClick={() => setMenuOpen(false)}>
      <Modal open={notifyOpen} onClose={() => setNotifyOpen(false)} title="Enviar aviso al cliente"
        sub={c.email ? `Le llegará a su portal (campana) y por correo a ${c.email}` : "Le llegará a la campana de su portal (sin email, no se enviará correo)"}
        footer={<>
          <button className="btn" onClick={() => setNotifyOpen(false)}>Cancelar</button>
          <button className="btn primary" disabled={!nf.title.trim()} onClick={sendNotify}><Icon name="bell" size={13}/> Enviar aviso</button>
        </>}>
        <div style={{fontSize:12, color:"var(--text-subtle)", marginBottom:5}}>Asunto</div>
        <input style={nInp} placeholder="p. ej. Necesito tu logo en alta resolución" value={nf.title} onChange={e => setNf(s => ({...s, title:e.target.value}))} autoFocus/>
        <div style={{fontSize:12, color:"var(--text-subtle)", marginBottom:5}}>Mensaje (opcional)</div>
        <textarea style={{...nInp, height:90, resize:"vertical", lineHeight:1.5}} placeholder="Explica qué necesitas del cliente…" value={nf.body} onChange={e => setNf(s => ({...s, body:e.target.value}))}/>
        <div style={{fontSize:12, color:"var(--text-subtle)", marginBottom:5}}>El botón del aviso lleva a</div>
        <select style={{...nInp, appearance:"auto"}} value={nf.route} onChange={e => setNf(s => ({...s, route:e.target.value}))}>
          {NOTIFY_SECTIONS.map(s => <option key={s.v} value={s.v}>{s.label}</option>)}
        </select>
        <div style={{fontSize:11.5, color:"var(--text-subtle)", marginTop:2, lineHeight:1.5}}>El aviso se añade a la bandeja; se enviará junto con los demás cuando pulses «Enviar».</div>
      </Modal>

      <Modal open={outboxOpen} onClose={() => setOutboxOpen(false)} title="Avisos por enviar"
        sub={c.email ? `Se enviará UN correo a ${c.email} con todo lo de abajo` : "El cliente no tiene email; solo verá los avisos en su portal"}
        footer={<>
          <button className="btn" onClick={() => { D.discardPendingEmails(c.id); setOutboxOpen(false); }}>Descartar todo</button>
          <button className="btn primary" disabled={!pendingAvisos.length} onClick={() => { D.sendPendingEmails(c.id); setOutboxOpen(false); }}>
            <Icon name="mail" size={13}/> Enviar {pendingAvisos.length} en un correo
          </button>
        </>}>
        {pendingAvisos.length === 0 ? (
          <div className="muted small">No hay avisos pendientes.</div>
        ) : (
          <div style={{display:"flex", flexDirection:"column", gap:10}}>
            {pendingAvisos.map((it, i) => (
              <div key={i} style={{display:"flex", gap:10, alignItems:"flex-start", padding:"11px 13px", background:"var(--bg-elev)", border:"0.5px solid var(--border)", borderRadius:10}}>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontWeight:500, fontSize:13.5}}>{it.title}</div>
                  {it.body && <div className="muted small" style={{marginTop:2, lineHeight:1.4}}>{it.body}</div>}
                  {it.route && <div className="xsmall muted" style={{marginTop:4, display:"flex", alignItems:"center", gap:5}}><Icon name="arrow" size={10}/>{_sectShort[it.route] || "Portal"}</div>}
                </div>
                <button className="btn ghost icon-only sm" onClick={() => D.clearPendingEmail(c.id, i)}><Icon name="x" size={12}/></button>
              </div>
            ))}
          </div>
        )}
      </Modal>
      {/* Back */}
      <button className="btn ghost sm" style={{marginBottom: 20}} onClick={() => navigate("clients")}>
        <Icon name="chevron" size={12} style={{transform:"rotate(180deg)"}}/> Clientes
      </button>

      {/* Bandeja de avisos pendientes de enviar por correo */}
      {pendingAvisos.length > 0 && (
        <div style={{display:"flex", alignItems:"center", gap:12, flexWrap:"wrap", marginBottom:18, padding:"12px 16px",
          background:"var(--accent-soft)", border:"0.5px solid var(--accent)", borderRadius:12}}>
          <Icon name="mail" size={16} style={{color:"var(--accent)"}}/>
          <div style={{flex:1, minWidth:180}}>
            <div style={{fontWeight:500, fontSize:13.5}}>{pendingAvisos.length} aviso{pendingAvisos.length===1?"":"s"} sin enviar a {c.name || "este cliente"}</div>
            <div className="xsmall muted" style={{marginTop:1}}>Se agruparán en un solo correo. Revisa antes de enviar.</div>
          </div>
          <div className="row tight" style={{flexShrink:0}}>
            <button className="btn ghost sm" onClick={() => D.discardPendingEmails(c.id)}>Descartar</button>
            <button className="btn primary sm" onClick={() => setOutboxOpen(true)}>Revisar y enviar</button>
          </div>
        </div>
      )}

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
        <div style={{marginBottom: 30}}>
          <div style={{display:"flex", justifyContent:"space-between", gap: 20, alignItems:"flex-start", flexWrap:"wrap"}}>
            <div style={{minWidth: 0}}>
              <h1 style={{fontFamily:"var(--font-display)", fontSize:"clamp(32px,4.2vw,46px)", fontWeight:400, letterSpacing:"-1.6px", margin:"0 0 10px"}}>
                {c.company || c.name}
              </h1>
              <div style={{display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", color:"var(--text-muted)", fontSize:14}}>
                {c.name && <span>{c.name}</span>}
                {c.email && <><span style={{opacity:0.35}}>·</span><span>{c.email}</span></>}
                {c.whatsapp && <><span style={{opacity:0.35}}>·</span><span>{c.whatsapp}</span></>}
              </div>
            </div>

            <div style={{position:"relative", flexShrink: 0, display:"flex", alignItems:"center", gap:8}} onClick={e => e.stopPropagation()}>
              <button className="btn ghost sm" onClick={openNotify}><Icon name="bell" size={13}/> Enviar aviso</button>
              <button className="btn ghost icon-only" onClick={() => setMenuOpen(o => !o)}><Icon name="more-h" size={16}/></button>
              {menuOpen && (
                <div style={{position:"absolute", right: 0, top:"calc(100% + 4px)", zIndex: 20,
                  background:"var(--bg-elev)", border:"0.5px solid var(--border-strong)",
                  borderRadius: 10, padding: 4, minWidth: 180, boxShadow:"0 8px 24px rgba(0,0,0,0.25)"}}>
                  <button onClick={() => { setMenuOpen(false); startEdit(); }} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"7px 10px",border:0,background:"transparent",color:"var(--text)",fontSize:13,borderRadius:6,cursor:"pointer",fontFamily:"inherit"}}>
                    <Icon name="edit" size={13}/> Editar cliente
                  </button>
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
      )}

      {/* Tabs */}
      <div className="tabs">
        {[
          {id:"vista",       label:"Vista general"},
          {id:"projects",    label:"Proyectos", count:projects.length},
          {id:"clienttasks", label:"Intake", count:ctasks.length},
          {id:"deliverables",label:"Entregables", count:clientDeliverables.length || null},
          {id:"billing",     label:"Financiero", count:invoices.length || null},
          {id:"credentials", label:"Credenciales", count:creds.length || null},
          {id:"files",       label:"Documentación"},
          {id:"eventos",     label:"Eventos"},
        ].map(t => (
          <div key={t.id} className={"tab" + (tab === t.id ? " active" : "")} onClick={() => setTab(t.id)}>
            {t.label}{t.count != null ? <span className="count">{t.count}</span> : null}
          </div>
        ))}
      </div>

      {tab === "vista" && (
        <div style={{display:"flex", flexDirection:"column", gap: 16}}>
          {/* Portal de cliente */}
          <div className="card" onClick={hasPortal ? () => { try { sessionStorage.setItem("141_preview_client", c.id); } catch {} navigate("client-dashboard"); } : undefined}
            style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", cursor: hasPortal ? "pointer" : "default" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
              background: hasPortal ? "var(--green-soft)" : "var(--bg-elev-2)", color: hasPortal ? "var(--green)" : "var(--text-muted)", border: "0.5px solid var(--border)" }}>
              <Icon name={hasPortal ? "check" : "external-link"} size={16} strokeWidth={1.7}/>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 14, fontWeight: 500, letterSpacing: "-0.3px" }}>{hasPortal ? "Portal de cliente activo" : "Sin portal de cliente"}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{hasPortal ? `${c.email} tiene acceso · pulsa para verlo` : "Genera un enlace para que cree su acceso."}</div>
            </div>
            {portalLink ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }} onClick={e => e.stopPropagation()}>
                <input readOnly value={portalLink} onClick={e => e.target.select()}
                  style={{ fontSize: 12, padding: "8px 12px", borderRadius: 8, background: "var(--bg-elev)", border: "0.5px solid var(--border)", color: "var(--text-muted)", fontFamily: "var(--font-mono)", width: 320, maxWidth: "100%" }}/>
                <button className="btn primary sm" onClick={copyPortal}>{portalCopied ? <Icon name="check" size={12}/> : null} {portalCopied ? "Copiado" : "Copiar enlace"}</button>
              </div>
            ) : hasPortal ? (
              <div className="row tight" style={{color:"var(--text-muted)", fontSize:13, flexShrink:0}}>Abrir portal <Icon name="arrow" size={13}/></div>
            ) : (
              <button className="btn primary" onClick={(e) => { e.stopPropagation(); createPortal(); }} disabled={portalBusy}><Icon name="external-link" size={13}/> {portalBusy ? "Generando…" : "Crear portal"}</button>
            )}
          </div>

          {(c.fiscalName || c.nif || c.fiscalAddress || c.website || c.about) ? (
            <div className="card" style={{ padding: "18px 20px" }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-subtle)", marginBottom: 12 }}>Datos de facturación</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: "12px 24px" }}>
                {[["Razón social", c.fiscalName],["NIF / CIF", c.nif],["Dirección fiscal", c.fiscalAddress],["Web", c.website]].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: 11, color: "var(--text-subtle)", marginBottom: 3 }}>{k}</div>
                    <div style={{ fontSize: 13.5, color: "var(--text)", wordBreak: "break-word" }}>{v}</div>
                  </div>
                ))}
              </div>
              {c.about && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 11, color: "var(--text-subtle)", marginBottom: 3 }}>A qué se dedica</div>
                  <div style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.5 }}>{c.about}</div>
                </div>
              )}
            </div>
          ) : (
            <Empty icon="user-cog" title="Sin datos de onboarding" sub="Cuando el cliente complete su registro, aquí verás sus datos fiscales y a qué se dedica."/>
          )}
        </div>
      )}

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
        invoices.length === 0 ? (
          <Empty icon="receipt" title="Sin facturas" sub="Este cliente todavía no tiene facturas."/>
        ) : (
          <div className="card"><div className="card-body flush">
            <div style={{padding:"14px 18px", borderBottom:"0.5px solid var(--border)", fontSize:11, textTransform:"uppercase", letterSpacing:"0.06em", color:"var(--text-subtle)"}}>
              {invoices.length} factura{invoices.length===1?"":"s"} · Total €{totalBilled.toLocaleString("es-ES")}
            </div>
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
          </div></div>
        )
      )}

      {tab === "deliverables" && (
        clientDeliverables.length === 0 ? (
          <Empty icon="package" title="Sin entregables" sub="Los entregables de los proyectos de este cliente aparecerán aquí."/>
        ) : (
          <div className="rg-deliverables">
            {clientDeliverables.map(d => {
              const proj = projects.find(p => p.id === d.projectId);
              return (
                <div key={d.id} className="card">
                  <div style={{aspectRatio:"16/10", background: d.thumb || "linear-gradient(135deg,#1e3a8a,#0f172a)", borderTopLeftRadius:10, borderTopRightRadius:10}}/>
                  <div className="card-body">
                    <div className="row between"><div style={{fontWeight:500, fontSize:13.5}}>{d.title}</div>{d.version && <span className="chip">{d.version}</span>}</div>
                    <div className="subtle xsmall" style={{marginTop:6}}>{proj?.name || "—"}{d.date ? " · " + d.date : ""}</div>
                    <div style={{marginTop:12}}>
                      {d.status === "approved"
                        ? <span className="row tight" style={{color:"var(--green)", fontSize:12.5}}><Icon name="check" size={13}/> Aprobado</span>
                        : <span className="chip amber" style={{fontSize:11}}>Pendiente de aprobar</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {tab === "eventos" && (() => {
        const evs = [];
        projects.forEach(p => (p.phasesDone || []).forEach(name => evs.push({ type:"Fase", title:`Fase completada: ${name}`, sub:p.name })));
        projects.forEach(p => (D.TASKS[p.id] || []).forEach(t => { if (t.column === "done") evs.push({ type:"Hito", title:t.title, sub:p.name }); }));
        ctasks.forEach(t => { if (t.done) evs.push({ type:"Intake", title:`El cliente realizó: ${t.title}` }); });
        evs.push({ type:"Alta", title:"Cliente creado en la plataforma" });
        return (
          <div className="card"><div className="card-body" style={{padding:20}}>
            <div style={{fontFamily:"var(--font-display)", fontSize:16, fontWeight:500, marginBottom:4}}>Historial de eventos</div>
            <div className="muted xsmall" style={{marginBottom:16}}>Lo que ha pasado en el proyecto, en orden cronológico inverso.</div>
            <div style={{display:"flex", flexDirection:"column", gap:14}}>
              {evs.map((e, i) => (
                <div key={i} style={{display:"flex", gap:12}}>
                  <div style={{width:7, height:7, borderRadius:99, background:"var(--text-subtle)", marginTop:5, flexShrink:0}}/>
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:10, letterSpacing:"0.07em", textTransform:"uppercase", color:"var(--text-subtle)"}}>{e.type}{e.sub ? " · " + e.sub : ""}</div>
                    <div style={{fontSize:13, marginTop:2, lineHeight:1.4}}>{e.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div></div>
        );
      })()}

      {tab === "files" && <AgencyDriveFolder client={c}/>}

      {tab === "clienttasks" && <AgencyClientTasks clientId={c.id}/>}

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
  const cat = D.CRED_CATALOG || [];
  const agencyEmail = (D.SETTINGS && D.SETTINGS.email) || "tu correo";
  const [picking, setPicking] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ username:"", password:"", notes:"" });
  const [reveal, setReveal] = useState({});
  const [copied, setCopied] = useState("");
  const copy = (v, k) => { try { navigator.clipboard.writeText(v); setCopied(k); setTimeout(() => setCopied(""), 1200); } catch {} };
  const brand = { width:32, height:32, borderRadius:8, background:"var(--bg-elev-2)", display:"grid", placeItems:"center", color:"var(--text)", border:"0.5px solid var(--border)", flexShrink:0 };
  const inp = { width:"100%", height:38, borderRadius:9, padding:"8px 12px", background:"var(--bg-elev)", border:"0.5px solid var(--border)", color:"var(--text)", fontFamily:"inherit", fontSize:13.5, marginBottom:9 };
  const add = (p) => { D.addCredential(clientId, { platform:p.key, label:p.name }); setPicking(false); };
  const startEdit = (c) => { setForm({ username:c.username, password:c.password, notes:c.notes }); setEditId(c.id); };
  const saveEdit = () => { D.updateCredential(editId, form); setEditId(null); };
  const del = (c) => { if (confirm(`¿Eliminar "${c.label || ""}"?`)) D.deleteCredential(c.id); };

  return (
    <div>
      <div className="row between" style={{marginBottom: 14}}>
        <div className="small muted">Accesos del cliente. El cliente también los ve y edita desde su portal.</div>
        {!picking && <button className="btn primary sm" onClick={() => setPicking(true)}><Icon name="plus" size={13}/> Añadir</button>}
      </div>

      {picking && (
        <div className="card" style={{marginBottom: 14}}><div className="card-body" style={{padding: 16}}>
          <div className="muted small" style={{marginBottom:12}}>¿Qué acceso quieres añadir?</div>
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(150px,1fr))", gap:10}}>
            {cat.map(p => (
              <button key={p.key} onClick={() => add(p)}
                style={{display:"flex", alignItems:"center", gap:9, padding:"10px 12px", cursor:"pointer", background:"var(--bg-elev-2)", border:"0.5px solid var(--border)", borderRadius:10, textAlign:"left", fontFamily:"inherit"}}>
                <span style={brand}><Icon name={p.icon} size={16}/></span>
                <span style={{minWidth:0}}><span style={{display:"block", fontWeight:500, fontSize:13, color:"var(--text)"}}>{p.name}</span><span className="muted xsmall">{p.mode === "access" ? "Dar acceso" : "Usuario y clave"}</span></span>
              </button>
            ))}
          </div>
        </div></div>
      )}

      {creds.length === 0 && !picking ? (
        <Empty icon="lock" title="Sin credenciales" sub="Añade los accesos del cliente o pídele que los rellene desde su portal."/>
      ) : (
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px,1fr))", gap: 12}}>
          {creds.map(c => {
            const meta = D.credMeta(c.platform); const mode = meta.mode; const ed = editId === c.id;
            return (
              <div key={c.id} className="card"><div className="card-body" style={{padding: 15}}>
                <div className="row between" style={{alignItems:"flex-start"}}>
                  <div className="row tight"><span style={brand}><Icon name={meta.icon} size={15}/></span><div style={{fontWeight: 500, fontSize: 14}}>{c.label || meta.name}</div></div>
                  <div className="row tight">
                    {mode === "login" && !ed && <button className="btn ghost icon-only sm" onClick={() => startEdit(c)}><Icon name="edit" size={12}/></button>}
                    <button className="btn ghost icon-only sm" onClick={() => del(c)}><Icon name="trash" size={12}/></button>
                  </div>
                </div>
                {mode === "access" ? (
                  <div style={{marginTop: 10}}>
                    <div className="muted xsmall" style={{marginBottom:6}}>El cliente da acceso a:</div>
                    <div style={{display:"flex", alignItems:"center", gap:6}}>
                      <span style={{flex:1, fontFamily:"var(--font-mono)", fontSize:12.5, wordBreak:"break-all"}}>{agencyEmail}</span>
                      <button className="btn ghost icon-only sm" onClick={() => copy(agencyEmail, c.id+"m")}><Icon name={copied === c.id+"m" ? "check" : "copy"} size={11}/></button>
                    </div>
                    <div className="xsmall" style={{marginTop:8, color: c.granted ? "var(--green)" : "var(--text-subtle)"}}>{c.granted ? "✓ Acceso concedido" : "Pendiente de acceso"}</div>
                  </div>
                ) : ed ? (
                  <div style={{marginTop: 10}}>
                    <input style={inp} placeholder="Usuario / email" value={form.username} onChange={e => setForm(s => ({...s, username:e.target.value}))} autoFocus/>
                    <input style={inp} placeholder="Contraseña" value={form.password} onChange={e => setForm(s => ({...s, password:e.target.value}))}/>
                    <input style={{...inp, marginBottom:10}} placeholder="Notas" value={form.notes} onChange={e => setForm(s => ({...s, notes:e.target.value}))}/>
                    <div className="row tight"><button className="btn primary sm" onClick={saveEdit}>Guardar</button><button className="btn ghost sm" onClick={() => setEditId(null)}>Cancelar</button></div>
                  </div>
                ) : (
                  <div style={{marginTop: 8}}>
                    {c.username && <div className="small" style={{marginTop: 4, wordBreak:"break-all"}}><span className="muted">Usuario: </span>{c.username}<button className="btn ghost icon-only sm" style={{marginLeft:4}} onClick={() => copy(c.username, c.id+"u")}><Icon name={copied===c.id+"u"?"check":"copy"} size={11}/></button></div>}
                    {c.password && (
                      <div className="small" style={{marginTop: 4, display:"flex", alignItems:"center", gap:6, flexWrap:"wrap"}}>
                        <span className="muted">Clave: </span><span style={{fontFamily:"var(--font-mono)"}}>{reveal[c.id] ? c.password : "••••••••"}</span>
                        <button className="btn ghost icon-only sm" onClick={() => setReveal(r => ({ ...r, [c.id]: !r[c.id] }))}><Icon name={reveal[c.id]?"eye-off":"eye"} size={11}/></button>
                        <button className="btn ghost icon-only sm" onClick={() => copy(c.password, c.id+"p")}><Icon name={copied===c.id+"p"?"check":"copy"} size={11}/></button>
                      </div>
                    )}
                    {!c.username && !c.password && <div className="muted xsmall" style={{marginTop: 4}}>El cliente aún no lo ha rellenado.</div>}
                    {c.notes && <div className="muted xsmall" style={{marginTop: 8, lineHeight: 1.5}}>{c.notes}</div>}
                  </div>
                )}
              </div></div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Carpeta de Google Drive del cliente ─────────────────────────────
const AgencyDriveFolder = ({ client }) => {
  const D = window.Data;
  const [url, setUrl] = useState(client.driveUrl || "");
  const [saved, setSaved] = useState(false);
  const save = () => { D.updateClient(client.id, { driveUrl: url.trim() }); setSaved(true); setTimeout(() => setSaved(false), 1500); };
  const inp = { width:"100%", height:40, borderRadius:10, padding:"8px 12px", background:"var(--bg-elev)",
    border:"0.5px solid var(--border)", color:"var(--text)", fontFamily:"inherit", fontSize:13.5 };
  return (
    <div className="card"><div className="card-body" style={{padding: 20}}>
      <div className="row tight" style={{marginBottom: 6}}>
        <div style={{width:24, height:24, borderRadius:6, background:"#fff", display:"grid", placeItems:"center"}}>
          <svg width="14" height="14" viewBox="0 0 24 24"><path fill="#1FA463" d="M7.71 3.5L1.15 15l3.27 5.5h13.16L21.85 15 14.29 3.5z"/><path fill="#FFD041" d="M7.71 3.5h6.58L21.85 15l-3.27 5.5z" opacity=".7"/></svg>
        </div>
        <div className="card-title">Carpeta de Google Drive del cliente</div>
      </div>
      <div className="small muted" style={{marginBottom: 14, lineHeight: 1.5}}>
        Pega el enlace de la carpeta compartida. El cliente verá el botón «Abrir carpeta en Google Drive» en su portal → Documentación. Si lo dejas vacío, verá «Estamos preparando la carpeta».
      </div>
      <input style={inp} placeholder="https://drive.google.com/drive/folders/…" value={url} onChange={e => setUrl(e.target.value)}/>
      <div className="row tight" style={{marginTop: 10}}>
        <button className="btn primary sm" onClick={save}>Guardar enlace</button>
        {client.driveUrl && <a className="btn ghost sm" href={client.driveUrl} target="_blank" rel="noreferrer" style={{textDecoration:"none"}}><Icon name="external-link" size={12}/> Abrir</a>}
        {saved && <span className="small" style={{color:"var(--green)"}}>Guardado ✓</span>}
      </div>
    </div></div>
  );
};

// ── Panel "Qué le toca" — tareas de onboarding del cliente ──────────
const AgencyClientTasks = ({ clientId }) => {
  const D = window.Data;
  D.useStore && D.useStore();
  const tasks = D.clientTasksFor ? D.clientTasksFor(clientId) : [];
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const blank = { title:"", description:"", link:"" };
  const [form, setForm] = useState(blank);
  const set = (k, v) => setForm(s => ({ ...s, [k]: v }));
  const startAdd  = () => { setForm(blank); setEditing(null); setAdding(true); };
  const startEdit = (t) => { setForm({ title:t.title, description:t.description, link:t.link||"" }); setEditing(t.id); setAdding(true); };
  const SECTIONS = [
    { v:"", label:"Sin destino (solo marcar hecho)" },
    { v:"client-docs", label:"Documentación (subir archivos)" },
    { v:"client-credentials", label:"Credenciales (dar accesos)" },
    { v:"client-status", label:"Estado del proyecto" },
  ];
  const _sectLabel = (v) => (SECTIONS.find(s => s.v === v) || {}).label || "";
  const cancel = () => { setAdding(false); setEditing(null); setForm(blank); };
  const save = () => {
    if (!form.title.trim()) return;
    if (editing) D.updateClientTask(editing, form); else D.addClientTask(clientId, form);
    cancel();
  };
  const del = (t) => { if (confirm(`¿Eliminar la tarea "${t.title}"?`)) D.deleteClientTask(t.id); };
  const inp = { width:"100%", height:38, borderRadius:9, padding:"8px 12px", background:"var(--bg-elev)",
    border:"0.5px solid var(--border)", color:"var(--text)", fontFamily:"inherit", fontSize:13.5, marginBottom:9 };

  return (
    <div>
      <div className="row between" style={{marginBottom: 14}}>
        <div className="small muted">Acciones que el cliente verá en «Qué te toca ahora». Él las marca como realizadas desde su portal.</div>
        {!adding && <button className="btn primary sm" onClick={startAdd}><Icon name="plus" size={13}/> Añadir</button>}
      </div>

      {adding && (
        <div className="card" style={{marginBottom: 14}}><div className="card-body" style={{padding: 16}}>
          <input style={inp} placeholder="Título (p.ej. Rellenar el cuestionario)" value={form.title} onChange={e => set("title", e.target.value)} autoFocus/>
          <input style={inp} placeholder="Descripción (opcional)" value={form.description} onChange={e => set("description", e.target.value)}/>
          <div style={{fontSize:11.5, color:"var(--text-subtle)", margin:"2px 0 5px"}}>¿A qué sección lleva el botón del cliente?</div>
          <select style={{...inp, marginBottom: 12, appearance:"auto"}} value={form.link} onChange={e => set("link", e.target.value)}>
            {SECTIONS.map(s => <option key={s.v} value={s.v}>{s.label}</option>)}
          </select>
          <div className="row tight">
            <button className="btn primary sm" disabled={!form.title.trim()} onClick={save}>Guardar</button>
            <button className="btn ghost sm" onClick={cancel}>Cancelar</button>
          </div>
        </div></div>
      )}

      {tasks.length === 0 && !adding ? (
        <Empty icon="list-todo" title="Sin tareas para el cliente" sub="Añade las acciones de onboarding que el cliente debe completar."/>
      ) : (
        <div style={{display:"flex", flexDirection:"column", gap: 10}}>
          {tasks.map((t, i) => (
            <div key={t.id} className="card"><div className="card-body" style={{padding: 15, display:"flex", gap: 14, alignItems:"flex-start"}}>
              <div style={{fontFamily:"var(--font-display)", fontSize: 22, fontWeight: 300, color:"var(--text-subtle)", minWidth: 20}}>{i+1}</div>
              <div style={{flex:1, minWidth:0}}>
                <div className="row between" style={{alignItems:"flex-start", gap:10}}>
                  <div style={{fontWeight:500, fontSize:14}}>{t.title}</div>
                  <div className="row tight" style={{flexShrink:0}}>
                    {t.done && <span className="chip green" style={{fontSize:10, padding:"1px 7px"}}>Realizado</span>}
                    <button className="btn ghost icon-only sm" onClick={() => startEdit(t)}><Icon name="edit" size={12}/></button>
                    <button className="btn ghost icon-only sm" onClick={() => del(t)}><Icon name="trash" size={12}/></button>
                  </div>
                </div>
                {t.description && <div className="muted small" style={{marginTop:4, lineHeight:1.5}}>{t.description}</div>}
                {t.link && <div className="row tight" style={{marginTop:6}}><Icon name="arrow" size={11}/><span className="xsmall muted">{_sectLabel(t.link)}</span></div>}
              </div>
            </div></div>
          ))}
        </div>
      )}
    </div>
  );
};

Object.assign(window, { AgencyClientsList, AgencyClientDetail });

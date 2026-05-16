// MVP-only modals: newLead, newInvoice, invite client
const NewLeadModal = ({ open, onClose }) => {
  const D = window.Data;
  const toast = useToast();
  const [data, setData] = useState({ name: "", company: "", channel: "linkedin", calendly: "", message: "" });
  const [checked, setChecked] = useState({});

  const submit = () => {
    if (!data.name.trim()) { toast("Ponle un nombre al lead", "warn"); return; }
    const l = D.addLead(data);
    toast(`Lead "${l.name}" añadido al pipeline`, "success");
    onClose();
    setData({ name:"", company:"", channel:"linkedin", calendly:"", message:"" });
    setChecked({});
  };

  return (
    <Modal open={open} onClose={onClose} title="Nuevo lead" sub="Captación + cualificación" size="lg" footer={
      <>
        <button className="btn" onClick={onClose}>Cancelar</button>
        <button className="btn primary" onClick={submit}>
          Añadir al pipeline <Icon name="arrow" size={12}/>
        </button>
      </>
    }>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap: 20}}>
        <div>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap: 12}}>
            <div style={{gridColumn:"1 / -1"}}>
              <div className="label">Nombre</div>
              <input className="input" placeholder="Ej. Carla Esteban" value={data.name} onChange={e => setData({...data, name: e.target.value})} autoFocus/>
            </div>
            <div style={{gridColumn:"1 / -1"}}>
              <div className="label">Empresa</div>
              <input className="input" placeholder="Bruna Studio" value={data.company} onChange={e => setData({...data, company: e.target.value})}/>
            </div>
            <div style={{gridColumn:"1 / -1"}}>
              <div className="label">Canal de origen</div>
              <div className="row tight" style={{flexWrap:"wrap"}}>
                {Object.entries(D.CHANNELS).map(([k, v]) => (
                  <button key={k} className="chip" style={{cursor:"pointer", padding:"4px 10px", borderColor: data.channel === k ? "var(--text)" : "var(--border-strong)", color: data.channel === k ? "var(--text)" : "var(--text-muted)"}} onClick={() => setData({...data, channel: k})}>
                    <Icon name={v.icon} size={11}/> {v.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{gridColumn:"1 / -1"}}>
              <div className="label">Link Calendly (opcional)</div>
              <input className="input" placeholder="https://calendly.com/…" value={data.calendly} onChange={e => setData({...data, calendly: e.target.value})}/>
            </div>
            <div style={{gridColumn:"1 / -1"}}>
              <div className="label">Primer mensaje / contexto</div>
              <textarea className="textarea" rows={3} placeholder="¿Qué necesita? ¿Cómo te ha contactado?" value={data.message} onChange={e => setData({...data, message: e.target.value})}/>
            </div>
          </div>
        </div>
        <div>
          <div className="card-title" style={{marginBottom: 10}}>Antes de la llamada</div>
          <div className="muted xsmall" style={{marginBottom: 10}}>Tu checklist para no llegar a frío.</div>
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

const NewInvoiceModal = ({ open, onClose }) => {
  const D = window.Data;
  D.useStore && D.useStore();
  const toast = useToast();
  const hasClients = D.CLIENTS.length > 0;
  const hasProjects = D.PROJECTS.length > 0;
  const [data, setData] = useState({
    clientId: D.CLIENTS[0]?.id || "",
    projectId: D.PROJECTS[0]?.id || "",
    amount: "750",
    type: "50% inicial",
  });

  useEffect(() => {
    if (!open) return;
    if (hasClients && !D.CLIENTS.find(c => c.id === data.clientId)) {
      setData(d => ({ ...d, clientId: D.CLIENTS[0].id }));
    }
    const projForClient = D.PROJECTS.filter(p => p.clientId === data.clientId);
    if (projForClient.length && !projForClient.find(p => p.id === data.projectId)) {
      setData(d => ({ ...d, projectId: projForClient[0].id }));
    }
  }, [open, D.CLIENTS, D.PROJECTS, data.clientId, data.projectId, hasClients]);

  const submit = () => {
    if (!hasClients) { toast("Crea primero un cliente", "warn"); return; }
    if (!data.amount || Number(data.amount) <= 0) { toast("Importe no válido", "warn"); return; }
    const inv = D.addInvoice(data);
    toast(`Factura ${inv.id} · €${inv.amount} · link Stripe enviado`, "success");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Nueva factura" sub="Se generará link de pago Stripe automáticamente" footer={
      <>
        <button className="btn" onClick={onClose}>Cancelar</button>
        <button className="btn primary" disabled={!hasClients} onClick={submit}>
          Crear y enviar <Icon name="arrow" size={12}/>
        </button>
      </>
    }>
      {!hasClients && (
        <div style={{padding: 14, marginBottom: 14, background:"var(--amber-soft)", border:"0.5px solid var(--amber)", borderRadius: 10, color:"var(--amber)", fontSize: 13, display:"flex", alignItems:"center", gap: 10}}>
          <Icon name="info" size={14}/> No hay clientes. Crea uno antes de facturar.
        </div>
      )}
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap: 14}}>
        <div style={{gridColumn:"1 / -1"}}>
          <div className="label">Cliente</div>
          <select className="select" value={data.clientId} onChange={e => setData({...data, clientId: e.target.value})} disabled={!hasClients}>
            {hasClients ? D.CLIENTS.map(c => <option key={c.id} value={c.id}>{c.company}</option>) : <option value="">— Sin clientes —</option>}
          </select>
        </div>
        <div style={{gridColumn:"1 / -1"}}>
          <div className="label">Proyecto</div>
          <select className="select" value={data.projectId} onChange={e => setData({...data, projectId: e.target.value})} disabled={!hasProjects}>
            {hasProjects ? D.PROJECTS.filter(p => p.clientId === data.clientId).map(p => <option key={p.id} value={p.id}>{p.name}</option>) : <option value="">— Sin proyectos —</option>}
          </select>
        </div>
        <div>
          <div className="label">Importe (€)</div>
          <input className="input" type="number" value={data.amount} onChange={e => setData({...data, amount: e.target.value})}/>
        </div>
        <div>
          <div className="label">Tipo</div>
          <select className="select" value={data.type} onChange={e => setData({...data, type: e.target.value})}>
            <option>50% inicial</option>
            <option>50% final</option>
            <option>Mensual</option>
            <option>Extra</option>
          </select>
        </div>
        <div style={{gridColumn:"1 / -1", padding: 12, background:"var(--bg-elev-2)", border:"0.5px solid var(--border)", borderRadius: 10, display:"flex", alignItems:"center", gap: 10}}>
          <svg width="36" height="14" viewBox="0 0 60 25"><text x="0" y="20" fontFamily="Inter" fontWeight="700" fontSize="22" fill="#635bff">stripe</text></svg>
          <span className="muted small">Se generará automáticamente el link de pago y se enviará al cliente.</span>
        </div>
      </div>
    </Modal>
  );
};

const InviteClientModal = ({ open, onClose, session }) => {
  const toast = useToast();
  const [link, setLink]     = useState("");
  const [busy, setBusy]     = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => { if (!open) { setLink(""); setCopied(false); } }, [open]);

  const generate = async () => {
    setBusy(true);
    const token = await window.Data.createInvite();
    if (token) {
      setLink(`${window.location.origin}/invite/${token}`);
    } else {
      toast("Error al generar el enlace", "error");
    }
    setBusy(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      toast("Enlace copiado", "success");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Invitar nuevo cliente" sub="Genera un enlace para que el cliente cree su cuenta" footer={
      <>
        <button className="btn" onClick={onClose}>Cerrar</button>
        {!link && (
          <button className="btn primary" onClick={generate} disabled={busy}>
            <Icon name="external-link" size={12}/> {busy ? "Generando…" : "Generar enlace"}
          </button>
        )}
      </>
    }>
      <div style={{display:"flex", flexDirection:"column", gap:16}}>
        {!link ? (
          <div className="row tight" style={{padding:12, background:"var(--bg-elev-2)",
            border:"0.5px solid var(--border)", borderRadius:10, color:"var(--text-muted)", fontSize:12}}>
            <Icon name="info" size={13}/>
            <span>El cliente recibirá este enlace, rellenará su ficha y creará su acceso al portal.</span>
          </div>
        ) : (
          <div style={{display:"flex", flexDirection:"column", gap:10}}>
            <div className="label">Enlace generado — válido 7 días</div>
            <div style={{display:"flex", gap:8, alignItems:"center"}}>
              <div style={{flex:1, background:"var(--bg-elev-2)", border:"0.5px solid var(--border-strong)",
                borderRadius:8, padding:"10px 12px", fontSize:12, fontFamily:"var(--font-mono)",
                color:"var(--text-muted)", wordBreak:"break-all", lineHeight:1.5}}>
                {link}
              </div>
              <button className="btn" onClick={copy} style={{flexShrink:0}}>
                <Icon name={copied ? "check" : "copy"} size={13}/>
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>
            <div className="row tight" style={{padding:10, background:"var(--green-soft)",
              border:"0.5px solid var(--green)", borderRadius:8, color:"var(--green)", fontSize:12}}>
              <Icon name="check" size={12}/>
              <span>Comparte este enlace con tu cliente por WhatsApp, email o como prefieras.</span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

Object.assign(window, { NewLeadModal, NewInvoiceModal, InviteClientModal });

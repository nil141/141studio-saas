// Correo IMAP/SMTP — proxy local en /api/mail/*
// Requiere mail_server.py corriendo (reemplaza python3 -m http.server)

const MAIL_API  = "/api/mail";
const CREDS_KEY = "141_mail_creds";

const PRESETS = {
  gmail:   { label:"Gmail",        imap_host:"imap.gmail.com",         imap_port:993, smtp_host:"smtp.gmail.com",         smtp_port:587 },
  outlook: { label:"Outlook",      imap_host:"imap-mail.outlook.com",  imap_port:993, smtp_host:"smtp-mail.outlook.com",  smtp_port:587 },
  yahoo:   { label:"Yahoo",        imap_host:"imap.mail.yahoo.com",    imap_port:993, smtp_host:"smtp.mail.yahoo.com",    smtp_port:587 },
  custom:  { label:"Personalizado",imap_host:"",                        imap_port:993, smtp_host:"",                       smtp_port:587 },
};

const FOLDER_LABEL = {
  "INBOX":                "Recibidos",
  // inglés
  "Sent":                 "Enviados",
  "Sent Items":           "Enviados",
  "[Gmail]/Sent Mail":    "Enviados",
  "Drafts":               "Borradores",
  "[Gmail]/Drafts":       "Borradores",
  "Trash":                "Papelera",
  "Deleted Items":        "Papelera",
  "[Gmail]/Trash":        "Papelera",
  "Spam":                 "Spam",
  "Junk":                 "Spam",
  "[Gmail]/Spam":         "Spam",
  "[Gmail]/All Mail":     "Todo el correo",
  "[Gmail]/Starred":      "Destacados",
  "[Gmail]/Important":    "Importantes",
  // español (Google Workspace ES / Gmail ES)
  "[Gmail]/Enviados":     "Enviados",
  "[Gmail]/Borradores":   "Borradores",
  "[Gmail]/Papelera":     "Papelera",
  "[Gmail]/Destacados":   "Destacados",
  "[Gmail]/Todos":        "Todo el correo",
  "[Gmail]/Importantes":  "Importantes",
};

const FOLDER_ICON = {
  "INBOX":                "mail",
  "Starred":              "star",
  "[Gmail]/Starred":      "star",
  "Sent":                 "send",
  "Sent Items":           "send",
  "[Gmail]/Sent Mail":    "send",
  "Drafts":               "edit",
  "[Gmail]/Drafts":       "edit",
  "Trash":                "trash",
  "Deleted Items":        "trash",
  "[Gmail]/Trash":        "trash",
  "Spam":                 "alert-triangle",
  "Junk":                 "alert-triangle",
  "[Gmail]/Spam":         "alert-triangle",
  // español
  "[Gmail]/Destacados":   "star",
  "[Gmail]/Enviados":     "send",
  "[Gmail]/Borradores":   "edit",
  "[Gmail]/Papelera":     "trash",
  "[Gmail]/Todos":        "layers",
  "[Gmail]/Importantes":  "tag",
};

// Detecta carpetas especiales por atributo IMAP (\\Sent, \\Flagged, etc.)
// Los folders ahora son objetos {name, attrs} devueltos por el backend
const _findByAttr = (folders, ...attrs) =>
  folders.find(f => attrs.some(a => (f.attrs || []).some(fa => fa.toLowerCase() === a.toLowerCase())))?.name || null;

const _findByName = (folders, ...names) => {
  const ns = new Set(names.map(n => n.toLowerCase()));
  return folders.find(f => ns.has((f.name || f).toLowerCase()))?.name || null;
};

const _api = async (endpoint, body) => {
  const res = await window.apiFetch(`${MAIL_API}/${endpoint}`, body);
  if (!res.ok) throw new Error(res.status === 401 ? "Sesión caducada — vuelve a entrar" : `HTTP ${res.status}`);
  return res.json();
};

const _fmtDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    const d   = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const oneDay = 86400000;
    if (diffMs < oneDay && d.getDate() === now.getDate()) {
      return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
    }
    if (diffMs < 7 * oneDay) {
      return ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"][d.getDay()];
    }
    const M = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
    return `${d.getDate()} ${M[d.getMonth()]}`;
  } catch { return ""; }
};

const _fmtDateFull = (dateStr) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const dias = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
    const M    = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
    return `${dias[d.getDay()]} ${d.getDate()} de ${M[d.getMonth()]}, ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  } catch { return dateStr; }
};

const _sender = (from) => {
  if (!from) return "—";
  const m = from.match(/^"?([^"<]+)"?\s*<[^>]+>$/);
  if (m) return m[1].trim();
  return from;
};

// ── Formulario de configuración ────────────────────────────────────────────
const MailSetup = ({ onConnect }) => {
  const [preset,   setPreset]   = React.useState("gmail");
  const [emailVal, setEmailVal] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [advanced, setAdvanced] = React.useState(false);
  const [cfg,      setCfg]      = React.useState({ ...PRESETS.gmail });
  const [loading,  setLoading]  = React.useState(false);
  const [err,      setErr]      = React.useState("");
  const [showPw,   setShowPw]   = React.useState(false);

  const selectPreset = (key) => {
    setPreset(key);
    setCfg({ ...PRESETS[key] });
    setErr("");
  };

  const connect = async () => {
    if (!emailVal.trim() || !password) return;
    setLoading(true);
    setErr("");
    const creds = {
      email:     emailVal.trim(),
      password,
      imap_host: cfg.imap_host,
      imap_port: cfg.imap_port,
      smtp_host: cfg.smtp_host,
      smtp_port: cfg.smtp_port,
    };
    try {
      const res = await _api("connect", creds);
      if (res.ok) {
        localStorage.setItem(CREDS_KEY, JSON.stringify(creds));
        onConnect(creds);
      } else {
        setErr(res.error || "Credenciales incorrectas o servidor no disponible");
      }
    } catch {
      setErr("No se puede conectar. ¿Está mail_server.py en marcha en el puerto 8080?");
    }
    setLoading(false);
  };

  return (
    <div style={{minHeight:"calc(100vh - 56px)", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--bg)", padding:24}}>
      <div style={{width:460, background:"var(--bg-elev)", border:"0.5px solid var(--border-strong)", borderRadius:16, padding:32}}>

        <div style={{marginBottom:24}}>
          <div style={{width:42, height:42, borderRadius:11, background:"var(--accent-soft)", display:"grid", placeItems:"center", marginBottom:14}}>
            <Icon name="mail" size={18} style={{color:"var(--accent)"}}/>
          </div>
          <h2 style={{fontSize:20, fontWeight:500, marginBottom:6, fontFamily:"var(--font-display)"}}>Conectar correo</h2>
          <div className="muted small">Accede a tu bandeja vía IMAP y envía con SMTP.</div>
        </div>

        {/* Provider presets */}
        <div style={{display:"flex", gap:6, marginBottom:20}}>
          {Object.entries(PRESETS).map(([key, p]) => (
            <button key={key} onClick={() => selectPreset(key)}
              className={"btn sm" + (preset === key ? " primary" : "")}
              style={{flex:1, justifyContent:"center", fontSize:12}}>
              {p.label}
            </button>
          ))}
        </div>

        {/* Email */}
        <div style={{marginBottom:12}}>
          <label className="label">Email</label>
          <input className="input" type="email" value={emailVal} autoComplete="email"
            onChange={e => setEmailVal(e.target.value)}
            onKeyDown={e => e.key === "Enter" && connect()}
            placeholder="tu@correo.com" style={{height:40}}/>
        </div>

        {/* Password */}
        <div style={{marginBottom:4}}>
          <label className="label">
            {preset === "gmail" ? "Contraseña de aplicación" : "Contraseña"}
          </label>
          <div style={{position:"relative"}}>
            <input className="input" type={showPw ? "text" : "password"} value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && connect()}
              placeholder="••••••••••••" style={{height:40, paddingRight:42}}/>
            <button onClick={() => setShowPw(v => !v)}
              style={{position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
                border:0, background:"transparent", cursor:"pointer",
                color:"var(--text-subtle)", display:"flex", padding:4}}>
              <Icon name={showPw ? "eye-off" : "eye"} size={14}/>
            </button>
          </div>
        </div>

        {preset === "gmail" && (
          <div style={{fontSize:11, color:"var(--text-subtle)", marginBottom:16, lineHeight:1.6, marginTop:6}}>
            Gmail exige una <b style={{color:"var(--text-muted)"}}>contraseña de aplicación</b> (no tu contraseña normal).
            Actívala en myaccount.google.com → Seguridad → Contraseñas de aplicación.
          </div>
        )}
        {preset !== "gmail" && <div style={{marginBottom:16}}/>}

        {/* Advanced toggle */}
        <button className="btn ghost sm"
          style={{marginBottom: advanced ? 10 : 20, color:"var(--text-subtle)"}}
          onClick={() => setAdvanced(a => !a)}>
          <Icon name="chevron" size={11}
            style={{transform: advanced ? "rotate(90deg)" : "rotate(0deg)", transition:"transform .15s"}}/>
          {" "}Configuración avanzada (IMAP / SMTP)
        </button>

        {advanced && (
          <div style={{
            display:"grid", gridTemplateColumns:"1fr 90px", gap:8, marginBottom:20,
            padding:14, background:"var(--bg-elev-2)", borderRadius:10, border:"0.5px solid var(--border)",
          }}>
            <div>
              <label className="label" style={{fontSize:11}}>Servidor IMAP</label>
              <input className="input" value={cfg.imap_host}
                onChange={e => setCfg(c => ({...c, imap_host: e.target.value}))} style={{height:34, fontSize:12}}/>
            </div>
            <div>
              <label className="label" style={{fontSize:11}}>Puerto</label>
              <input className="input" type="number" value={cfg.imap_port}
                onChange={e => setCfg(c => ({...c, imap_port: parseInt(e.target.value)}))} style={{height:34, fontSize:12}}/>
            </div>
            <div>
              <label className="label" style={{fontSize:11}}>Servidor SMTP</label>
              <input className="input" value={cfg.smtp_host}
                onChange={e => setCfg(c => ({...c, smtp_host: e.target.value}))} style={{height:34, fontSize:12}}/>
            </div>
            <div>
              <label className="label" style={{fontSize:11}}>Puerto</label>
              <input className="input" type="number" value={cfg.smtp_port}
                onChange={e => setCfg(c => ({...c, smtp_port: parseInt(e.target.value)}))} style={{height:34, fontSize:12}}/>
            </div>
          </div>
        )}

        {err && (
          <div style={{
            display:"flex", gap:8, padding:"10px 12px",
            background:"var(--red-soft)", border:"0.5px solid var(--red)",
            borderRadius:8, marginBottom:14, fontSize:12, color:"var(--red)", lineHeight:1.5,
          }}>
            <Icon name="alert-triangle" size={13} style={{flexShrink:0, marginTop:1}}/>
            {err}
          </div>
        )}

        <button className="btn primary full" onClick={connect} style={{height:42}}
          disabled={loading || !emailVal || !password}>
          {loading ? "Conectando…" : "Conectar"}
        </button>
      </div>
    </div>
  );
};

// ── Menú de tres puntos flotante (portal fixed) ───────────────────────────
const RowMenu = ({ uid, x, y, msg, onClose, onDelete, onToggleFlag, onToggleRead }) => {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const close = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [onClose]);

  const item = (icon, label, color, action) => (
    <button onClick={() => { action(); onClose(); }}
      style={{
        display:"flex", alignItems:"center", gap:8,
        width:"100%", padding:"7px 12px", border:0, background:"transparent",
        cursor:"pointer", fontFamily:"inherit", fontSize:12.5, textAlign:"left",
        color: color || "var(--text-muted)", borderRadius:6,
      }}
      onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      <Icon name={icon} size={13} style={{flexShrink:0}}/>
      {label}
    </button>
  );

  return (
    <div ref={ref} style={{
      position:"fixed", left:x, top:y, zIndex:500,
      background:"var(--bg-elev)", border:"0.5px solid var(--border-strong)",
      borderRadius:10, padding:4, minWidth:180,
      boxShadow:"0 8px 30px rgba(0,0,0,0.35)",
    }}>
      {item("star",  msg.flagged ? "Quitar destacado" : "Destacar", msg.flagged ? "var(--amber)" : null, () => onToggleFlag(msg.uid, msg.flagged))}
      {item("mail",  msg.read    ? "Marcar sin leer"  : "Marcar leído", null, () => onToggleRead(msg.uid, msg.read))}
      <div style={{height:"0.5px", background:"var(--border)", margin:"3px 8px"}}/>
      {item("trash", "Eliminar", "var(--red)", () => onDelete(msg.uid))}
    </div>
  );
};

// ── Fila de mensaje con menú en hover ─────────────────────────────────────
const MailRow = ({ msg: m, isSelected, onClick, onDelete, onToggleFlag, onToggleRead, onMenuOpen }) => {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding:"11px 16px", cursor:"pointer",
        borderBottom:"0.5px solid var(--border)",
        borderLeft:`2px solid ${isSelected ? "var(--accent)" : "transparent"}`,
        background: isSelected ? "var(--accent-soft)" : hovered ? "var(--bg-hover)" : "transparent",
        transition:"background .08s",
      }}>
      {/* Línea superior: remitente + fecha/menú */}
      <div style={{display:"flex", alignItems:"center", gap:6, marginBottom:3}}>
        {!m.read && (
          <div style={{width:6, height:6, borderRadius:"50%", background:"var(--accent)", flexShrink:0}}/>
        )}
        <div style={{
          flex:1, fontSize:13, fontWeight: m.read ? 400 : 600,
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
          color: m.read ? "var(--text-muted)" : "var(--text)",
        }}>
          {_sender(m.from)}
        </div>
        {hovered ? (
          <div onClick={e => e.stopPropagation()} style={{flexShrink:0}}>
            <button
              onClick={e => {
                e.stopPropagation();
                const r = e.currentTarget.getBoundingClientRect();
                onMenuOpen(m, r.left - 160, r.bottom + 4);
              }}
              style={{
                border:0, background:"transparent", cursor:"pointer",
                padding:"3px 5px", borderRadius:5, display:"flex", alignItems:"center",
                color:"var(--text-subtle)",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-elev-2)"; e.currentTarget.style.color = "var(--text)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-subtle)"; }}>
              <Icon name="more-h" size={14}/>
            </button>
          </div>
        ) : (
          <div style={{fontSize:11, color: m.flagged ? "var(--amber)" : "var(--text-subtle)", flexShrink:0, display:"flex", alignItems:"center", gap:4}}>
            {m.flagged && <Icon name="star" size={10}/>}
            {_fmtDate(m.date)}
          </div>
        )}
      </div>
      {/* Línea inferior: asunto */}
      <div style={{
        fontSize:12, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
        color: m.read ? "var(--text-subtle)" : "var(--text-muted)",
        fontWeight: m.read ? 400 : 500,
        paddingLeft: m.read ? 0 : 10,
      }}>
        {m.subject}
      </div>
    </div>
  );
};

// ── Cliente de correo ──────────────────────────────────────────────────────
const GmailView = () => {
  const toast = useToast();

  const [creds,         setCreds]         = React.useState(() => {
    try { return JSON.parse(localStorage.getItem(CREDS_KEY)); } catch { return null; }
  });
  const [folder,        setFolder]        = React.useState("INBOX");
  const [folders,       setFolders]       = React.useState([]);
  const [messages,      setMessages]      = React.useState([]);
  const [total,         setTotal]         = React.useState(0);
  const [page,          setPage]          = React.useState(1);
  const [selected,      setSelected]      = React.useState(null);
  const [detail,        setDetail]        = React.useState(null);
  const [loading,       setLoading]       = React.useState(false);
  const [loadingDetail, setLoadingDetail] = React.useState(false);
  const [composing,     setComposing]     = React.useState(false);
  const [compTo,        setCompTo]        = React.useState("");
  const [compSubj,      setCompSubj]      = React.useState("");
  const [compBody,      setCompBody]      = React.useState("");
  const [sending,       setSending]       = React.useState(false);
  const [rowMenu,       setRowMenu]       = React.useState(null); // { msg, x, y }

  const fetchFolders = async (c) => {
    try {
      const res = await _api("folders", { creds: c });
      if (res.ok) setFolders(res.folders || []);
    } catch {}
  };

  const fetchMessages = async (c, f, p) => {
    if (!c) return;
    setLoading(true);
    try {
      const res = await _api("messages", { creds: c, folder: f, page: p });
      if (res.ok) {
        setMessages(res.messages || []);
        setTotal(res.total || 0);
      } else {
        toast(res.error || "Error al cargar mensajes", "error");
      }
    } catch {
      toast("Sin conexión con mail_server.py", "error");
    }
    setLoading(false);
  };

  const selectMessage = async (msg) => {
    if (selected === msg.uid) return;
    setSelected(msg.uid);
    setDetail(null);
    setLoadingDetail(true);
    setMessages(ms => ms.map(m => m.uid === msg.uid ? { ...m, read: true } : m));
    try {
      const res = await _api("message", { creds, uid: msg.uid, folder });
      if (res.ok) setDetail(res);
      else toast(res.error || "Error al cargar el mensaje", "error");
    } catch {
      toast("Error de conexión", "error");
    }
    setLoadingDetail(false);
  };

  const deleteMessage = async (uid) => {
    try {
      await _api("action", { creds, uid, folder, action: "delete" });
      setMessages(ms => ms.filter(m => m.uid !== uid));
      setTotal(t => t - 1);
      if (selected === uid) { setSelected(null); setDetail(null); }
      toast("Mensaje eliminado", "success");
    } catch {
      toast("Error al eliminar", "error");
    }
  };

  const toggleFlag = async (uid, isFlagged) => {
    const action = isFlagged ? "unflag" : "flag";
    await _api("action", { creds, uid, folder, action });
    setMessages(ms => ms.map(m => m.uid === uid ? { ...m, flagged: !isFlagged } : m));
    if (detail?.uid === uid) setDetail(d => ({ ...d, flagged: !isFlagged }));
  };

  const toggleRead = async (uid, isRead) => {
    const action = isRead ? "mark_unread" : "mark_read";
    await _api("action", { creds, uid, folder, action });
    setMessages(ms => ms.map(m => m.uid === uid ? { ...m, read: !isRead } : m));
    if (detail?.uid === uid) setDetail(d => ({ ...d, read: !isRead }));
  };

  const sendEmail = async () => {
    if (!compTo.trim() || !compSubj.trim()) return;
    setSending(true);
    try {
      const res = await _api("send", { creds, to: compTo.trim(), subject: compSubj, body: compBody });
      if (res.ok) {
        toast("Email enviado", "success");
        setComposing(false);
        setCompTo(""); setCompSubj(""); setCompBody("");
      } else {
        toast("Error al enviar: " + res.error, "error");
      }
    } catch {
      toast("Error de conexión al enviar", "error");
    }
    setSending(false);
  };

  const disconnect = () => {
    localStorage.removeItem(CREDS_KEY);
    setCreds(null);
    setMessages([]); setFolders([]); setDetail(null); setSelected(null);
  };

  const changeFolder = (f) => {
    setFolder(f);
    setPage(1);
    setSelected(null);
    setDetail(null);
    setMessages([]);
    fetchMessages(creds, f, 1);
  };

  const changePage = (p) => {
    setPage(p);
    setSelected(null);
    setDetail(null);
    fetchMessages(creds, folder, p);
  };

  React.useEffect(() => {
    if (creds) {
      fetchFolders(creds);
      fetchMessages(creds, "INBOX", 1);
    }
  }, []); // eslint-disable-line

  if (!creds) {
    return <MailSetup onConnect={(c) => {
      setCreds(c);
      fetchFolders(c);
      fetchMessages(c, "INBOX", 1);
    }}/>;
  }

  // Detecta por atributo IMAP real (\Sent, \Flagged, \Trash, \Drafts, \Junk)
  const starredFolder = _findByAttr(folders, "\\\\Flagged", "\\Flagged")
                     || _findByName(folders, "[Gmail]/Destacados","[Gmail]/Starred","Starred","Flagged");
  const sentFolder    = _findByAttr(folders, "\\\\Sent",    "\\Sent")
                     || _findByName(folders, "[Gmail]/Enviados","[Gmail]/Sent Mail","Sent","Sent Items");
  const trashFolder   = _findByAttr(folders, "\\\\Trash",   "\\Trash")
                     || _findByName(folders, "[Gmail]/Papelera","[Gmail]/Trash","Trash","Deleted Items");
  const draftFolder   = _findByAttr(folders, "\\\\Drafts",  "\\Drafts")
                     || _findByName(folders, "[Gmail]/Borradores","[Gmail]/Drafts","Drafts");
  const spamFolder    = _findByAttr(folders, "\\\\Junk",    "\\Junk")
                     || _findByName(folders, "[Gmail]/Spam","Spam","Junk");
  const navFolders    = ["INBOX", starredFolder, sentFolder, draftFolder, trashFolder, spamFolder].filter(Boolean);

  const unread     = messages.filter(m => !m.read).length;
  const totalPages = Math.ceil(total / 25);

  return (
    <div style={{display:"flex", height:"calc(100vh - 56px)", overflow:"hidden", background:"var(--bg)"}}>

      {/* ── Nav de carpetas ─────────────────────── */}
      <div style={{
        width:200, flexShrink:0,
        borderRight:"0.5px solid var(--border)",
        display:"flex", flexDirection:"column",
        padding:"12px 8px", gap:2,
        background:"var(--bg-elev)",
      }}>
        <button className="btn primary sm"
          style={{margin:"0 4px 14px", justifyContent:"center"}}
          onClick={() => setComposing(true)}>
          <Icon name="plus" size={12}/> Redactar
        </button>

        {navFolders.map(f => (
          <button key={f} onClick={() => changeFolder(f)}
            style={{
              display:"flex", alignItems:"center", gap:8, padding:"7px 10px",
              borderRadius:8, border:0, cursor:"pointer", fontFamily:"inherit",
              background: folder === f ? "var(--accent-soft)" : "transparent",
              color:      folder === f ? "var(--accent)"     : "var(--text-muted)",
              fontSize:13, fontWeight: folder === f ? 500 : 400, textAlign:"left",
              width:"100%", transition:"background .08s",
            }}
            onMouseEnter={e => { if (folder !== f) e.currentTarget.style.background = "var(--bg-hover)"; }}
            onMouseLeave={e => { if (folder !== f) e.currentTarget.style.background = "transparent"; }}>
            <Icon name={FOLDER_ICON[f] || "folder"} size={13}/>
            <span style={{flex:1}}>{FOLDER_LABEL[f] || f}</span>
            {f === "INBOX" && unread > 0 && (
              <span style={{
                fontSize:10, background:"var(--accent)", color:"var(--accent-fg)",
                borderRadius:99, padding:"1px 6px", minWidth:18, textAlign:"center",
              }}>{unread}</span>
            )}
          </button>
        ))}

        <div style={{flex:1}}/>
        <div style={{padding:"10px 10px 6px", borderTop:"0.5px solid var(--border)", marginTop:8}}>
          <div style={{fontSize:11, color:"var(--text-subtle)", marginBottom:8,
            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}} title={creds.email}>
            {creds.email}
          </div>
          <button className="btn ghost sm"
            style={{width:"100%", justifyContent:"center", fontSize:11}}
            onClick={disconnect}>
            Desconectar
          </button>
        </div>
      </div>

      {/* ── Lista de mensajes ────────────────────── */}
      <div style={{
        width:       selected ? 300 : undefined,
        flex:        selected ? "0 0 300px" : 1,
        flexShrink:  0,
        borderRight: selected ? "0.5px solid var(--border)" : "none",
        display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0,
      }}>
        <div style={{
          padding:"12px 16px", borderBottom:"0.5px solid var(--border)",
          display:"flex", alignItems:"center", gap:8, flexShrink:0,
        }}>
          <div style={{flex:1}}>
            <div style={{fontWeight:600, fontSize:14}}>{FOLDER_LABEL[folder] || folder}</div>
            <div style={{fontSize:11, color:"var(--text-subtle)", marginTop:1}}>
              {total} mensajes{unread > 0 ? ` · ${unread} sin leer` : ""}
            </div>
          </div>
          <button className="btn ghost icon-only sm" data-tooltip="Actualizar"
            onClick={() => fetchMessages(creds, folder, page)}>
            <Icon name="refresh-cw" size={13}/>
          </button>
        </div>

        <div style={{flex:1, overflowY:"auto"}}>
          {loading ? (
            <div style={{padding:40, textAlign:"center", color:"var(--text-subtle)", fontSize:13}}>
              Cargando mensajes…
            </div>
          ) : messages.length === 0 ? (
            <div style={{padding:60}}>
              <Empty icon="mail" title="Bandeja vacía" sub="No hay mensajes en esta carpeta"/>
            </div>
          ) : messages.map(m => (
            <MailRow key={m.uid} msg={m} isSelected={selected === m.uid}
              onClick={() => selectMessage(m)}
              onDelete={deleteMessage}
              onToggleFlag={toggleFlag}
              onToggleRead={toggleRead}
              onMenuOpen={(msg, x, y) => setRowMenu({ msg, x, y })}
            />
          ))}
        </div>

        {total > 25 && (
          <div style={{
            padding:"8px 16px", borderTop:"0.5px solid var(--border)",
            display:"flex", alignItems:"center", gap:8, justifyContent:"space-between", flexShrink:0,
          }}>
            <button className="btn ghost sm" disabled={page <= 1} onClick={() => changePage(page - 1)}>
              <Icon name="chevron" size={12} style={{transform:"rotate(180deg)"}}/> Anterior
            </button>
            <span style={{fontSize:11, color:"var(--text-subtle)"}}>{page} / {totalPages}</span>
            <button className="btn ghost sm" disabled={page >= totalPages} onClick={() => changePage(page + 1)}>
              Siguiente <Icon name="chevron" size={12}/>
            </button>
          </div>
        )}
      </div>

      {/* ── Detalle del mensaje ───────────────────── */}
      {selected && (
        <div style={{flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0}}>
          {loadingDetail ? (
            <div style={{flex:1, display:"flex", alignItems:"center", justifyContent:"center",
              color:"var(--text-subtle)", fontSize:13}}>
              Cargando mensaje…
            </div>
          ) : detail ? (
            <>
              <div style={{padding:"18px 24px 14px", borderBottom:"0.5px solid var(--border)", flexShrink:0}}>
                <div style={{display:"flex", alignItems:"flex-start", gap:12, marginBottom:10}}>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:17, fontWeight:600, lineHeight:1.3, marginBottom:10, color:"var(--text)"}}>
                      {detail.subject}
                    </div>
                    <div style={{fontSize:12, color:"var(--text-muted)", lineHeight:1.8}}>
                      <div>
                        <span style={{color:"var(--text-subtle)", display:"inline-block", minWidth:40}}>De:</span>
                        {detail.from}
                      </div>
                      <div>
                        <span style={{color:"var(--text-subtle)", display:"inline-block", minWidth:40}}>Para:</span>
                        {detail.to}
                      </div>
                      {detail.cc && (
                        <div>
                          <span style={{color:"var(--text-subtle)", display:"inline-block", minWidth:40}}>CC:</span>
                          {detail.cc}
                        </div>
                      )}
                    </div>
                    <div style={{fontSize:11, color:"var(--text-subtle)", marginTop:4}}>
                      {_fmtDateFull(detail.date)}
                    </div>
                  </div>
                  <div style={{display:"flex", gap:4, flexShrink:0}}>
                    <button className="btn ghost sm" data-tooltip="Responder"
                      onClick={() => {
                        setCompTo(detail.from);
                        setCompSubj("Re: " + detail.subject);
                        setComposing(true);
                      }}>
                      <Icon name="reply" size={13}/>
                    </button>
                    <button className="btn ghost sm"
                      data-tooltip={detail.flagged ? "Quitar destacado" : "Destacar"}
                      style={{color: detail.flagged ? "var(--amber)" : undefined}}
                      onClick={() => toggleFlag(detail.uid, detail.flagged)}>
                      <Icon name="star" size={13}/>
                    </button>
                    <button className="btn ghost sm danger" data-tooltip="Eliminar"
                      onClick={() => deleteMessage(detail.uid)}>
                      <Icon name="trash" size={13}/>
                    </button>
                    <button className="btn ghost sm" data-tooltip="Cerrar"
                      onClick={() => { setSelected(null); setDetail(null); }}>
                      <Icon name="x" size={13}/>
                    </button>
                  </div>
                </div>
              </div>

              <div style={{flex:1, overflow:"auto"}}>
                {detail.html ? (
                  <iframe
                    key={detail.uid}
                    srcDoc={detail.html}
                    sandbox="allow-same-origin"
                    style={{width:"100%", border:"none", display:"block", minHeight:400}}
                    onLoad={e => {
                      try {
                        const body = e.target.contentDocument?.body;
                        if (body) e.target.style.height = (body.scrollHeight + 40) + "px";
                      } catch {}
                    }}
                  />
                ) : (
                  <div style={{
                    padding:"24px", whiteSpace:"pre-wrap", wordBreak:"break-word",
                    fontFamily:"inherit", fontSize:13, lineHeight:1.7, color:"var(--text)",
                  }}>
                    {detail.text || "(sin contenido)"}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* ── Modal de redactar ─────────────────────── */}
      {composing && (
        <div style={{
          position:"fixed", bottom:24, right:24, width:500,
          background:"var(--bg-elev)",
          border:"0.5px solid var(--border-strong)",
          borderRadius:14,
          boxShadow:"0 20px 60px rgba(0,0,0,0.45)",
          display:"flex", flexDirection:"column",
          zIndex:200,
        }}>
          <div style={{
            padding:"12px 16px", borderBottom:"0.5px solid var(--border)",
            display:"flex", alignItems:"center", background:"var(--bg-elev-2)",
            borderRadius:"14px 14px 0 0",
          }}>
            <div style={{fontWeight:500, fontSize:13, flex:1}}>Nuevo mensaje</div>
            <button className="btn ghost icon-only sm"
              onClick={() => { setComposing(false); setCompTo(""); setCompSubj(""); setCompBody(""); }}>
              <Icon name="x" size={13}/>
            </button>
          </div>

          <div style={{padding:"14px 16px", display:"flex", flexDirection:"column", gap:0}}>
            <div style={{display:"flex", alignItems:"center", gap:8, borderBottom:"0.5px solid var(--border)", paddingBottom:10, marginBottom:10}}>
              <span style={{fontSize:12, color:"var(--text-subtle)", minWidth:44}}>Para</span>
              <input className="input" type="email" value={compTo}
                onChange={e => setCompTo(e.target.value)}
                placeholder="destinatario@email.com"
                style={{height:32, fontSize:13, border:0, padding:"0 4px", background:"transparent", flex:1, outline:"none"}}/>
            </div>
            <div style={{display:"flex", alignItems:"center", gap:8, borderBottom:"0.5px solid var(--border)", paddingBottom:10, marginBottom:10}}>
              <span style={{fontSize:12, color:"var(--text-subtle)", minWidth:44}}>Asunto</span>
              <input className="input" value={compSubj}
                onChange={e => setCompSubj(e.target.value)}
                placeholder="Asunto del mensaje"
                style={{height:32, fontSize:13, border:0, padding:"0 4px", background:"transparent", flex:1, outline:"none"}}/>
            </div>
            <textarea
              value={compBody}
              onChange={e => setCompBody(e.target.value)}
              placeholder="Escribe tu mensaje…"
              rows={7}
              style={{
                resize:"vertical", fontSize:13, lineHeight:1.6,
                background:"transparent", border:0, outline:"none",
                fontFamily:"inherit", color:"var(--text)", width:"100%",
                padding:"4px 0", marginBottom:12,
              }}
            />
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <div style={{fontSize:11, color:"var(--text-subtle)"}}>
                Enviando como {creds.email}
              </div>
              <div style={{display:"flex", gap:6}}>
                <button className="btn ghost sm"
                  onClick={() => { setComposing(false); setCompTo(""); setCompSubj(""); setCompBody(""); }}>
                  Cancelar
                </button>
                <button className="btn primary sm" onClick={sendEmail}
                  disabled={sending || !compTo.trim() || !compSubj.trim()}>
                  {sending ? "Enviando…" : <><Icon name="send" size={12}/> Enviar</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Menú contextual de fila ───────────────── */}
      {rowMenu && (
        <RowMenu
          uid={rowMenu.msg.uid}
          x={rowMenu.x}
          y={rowMenu.y}
          msg={rowMenu.msg}
          onClose={() => setRowMenu(null)}
          onDelete={deleteMessage}
          onToggleFlag={toggleFlag}
          onToggleRead={toggleRead}
        />
      )}
    </div>
  );
};

window.GmailView = GmailView;

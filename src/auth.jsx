// Unified login gate — email + password, routes to admin or client.
const DURATION_OPTIONS = [
  { days: 0,  label: "Solo esta sesión",  sub: "Se cerrará al cerrar el navegador" },
  { days: 7,  label: "7 días",            sub: "Una semana sin volver a entrar" },
  { days: 30, label: "30 días",           sub: "Comodidad máxima" },
];

const AuthGate = ({ onAuth }) => {
  const [email, setEmail] = useState("");
  const [pw, setPw]       = useState("");
  const [err, setErr]     = useState("");
  const [busy, setBusy]   = useState(false);
  const [step, setStep]   = useState("login"); // "login" | "remember"
  const [pendingAcc, setPendingAcc] = useState(null);
  const [days, setDays]   = useState(7);

  const submit = async (e) => {
    e?.preventDefault();
    setErr(""); setBusy(true);
    const { ok, error, session } = await window.Data.authLogin(email.trim(), pw);
    if (ok) { setPendingAcc(session); setStep("remember"); setBusy(false); return; }
    setErr(error || "Email o contraseña incorrectos.");
    setBusy(false);
  };

  if (step === "remember") return (
    <div style={{
      height:"100dvh", display:"flex", alignItems:"center", justifyContent:"center",
      background:"var(--bg)", padding:"24px 16px", overflow:"hidden",
    }}>
      <div style={{width:"100%", maxWidth:400, display:"flex", flexDirection:"column", gap:24}}>
        <div className="row tight">
          <div className="brand-mark">141</div>
          <div className="brand-name">141<span className="tick">'</span>STUDIO</div>
        </div>
        <div>
          <h1 style={{fontSize:24, fontWeight:500, lineHeight:1.2, marginBottom:6, fontFamily:"var(--font-display)"}}>
            ¿Mantener la sesión iniciada?
          </h1>
          <div className="muted" style={{fontSize:14}}>
            Elige cuánto tiempo quieres que el sistema recuerde tu acceso.
          </div>
        </div>
        <div style={{display:"flex", flexDirection:"column", gap:8}}>
          {DURATION_OPTIONS.map(opt => (
            <div key={opt.days} onClick={() => setDays(opt.days)}
              style={{
                padding:"12px 16px", borderRadius:10, cursor:"pointer",
                border:`1.5px solid ${days === opt.days ? "var(--accent)" : "var(--border-strong)"}`,
                background: days === opt.days ? "var(--accent-soft)" : "var(--bg-elev)",
                display:"flex", alignItems:"center", gap:12, transition:"all .1s",
              }}>
              <div style={{width:18, height:18, borderRadius:"50%",
                border:`2px solid ${days === opt.days ? "var(--accent)" : "var(--border-strong)"}`,
                display:"grid", placeItems:"center", flexShrink:0}}>
                {days === opt.days && <div style={{width:8, height:8, borderRadius:"50%", background:"var(--accent)"}}/>}
              </div>
              <div>
                <div style={{fontSize:13, fontWeight:500, color: days === opt.days ? "var(--accent)" : "var(--text)"}}>{opt.label}</div>
                <div style={{fontSize:11, color:"var(--text-subtle)", marginTop:1}}>{opt.sub}</div>
              </div>
            </div>
          ))}
        </div>
        <button className="btn primary full" style={{height:44, fontSize:14}}
          onClick={() => onAuth(pendingAcc, days)}>
          Entrar
        </button>
        <div className="subtle xsmall" style={{textAlign:"center"}}>© 141'STUDIO · nil@141agency.com</div>
      </div>
    </div>
  );

  return (
    <div style={{
      height:"100dvh", display:"flex", alignItems:"center", justifyContent:"center",
      background:"var(--bg)", padding:"24px 16px", overflow:"hidden",
    }}>
      <div style={{width:"100%", maxWidth:400, display:"flex", flexDirection:"column", gap:32}}>
        <div className="row tight">
          <div className="brand-mark">141</div>
          <div className="brand-name">141<span className="tick">'</span>STUDIO</div>
        </div>
        <form onSubmit={submit} style={{display:"flex", flexDirection:"column"}}>
          <h1 style={{fontSize:28, fontWeight:500, lineHeight:1.2, marginBottom:6, fontFamily:"var(--font-display)"}}>Inicia sesión.</h1>
          <div className="muted" style={{fontSize:14, marginBottom:28}}>Accede con tus credenciales.</div>

          <div className="label">Email</div>
          <input className="input" type="email" autoComplete="email" value={email}
            onChange={e => setEmail(e.target.value)} placeholder="tu@empresa.com"
            style={{height:44, marginBottom:14, fontSize:14}}/>

          <div className="label">Contraseña</div>
          <input className="input" type="password" autoComplete="current-password" value={pw}
            onChange={e => setPw(e.target.value)} placeholder="••••••••"
            style={{height:44, marginBottom:16, fontSize:14}}/>

          {err && <div className="chip red" style={{display:"flex", padding:"6px 10px", marginBottom:12, fontSize:12}}>
            <Icon name="alert-triangle" size={12}/> {err}
          </div>}

          <button type="submit" className="btn primary full" style={{height:44, fontSize:14}} disabled={busy}>
            {busy ? "Entrando…" : "Entrar"}
          </button>
        </form>
        <div className="subtle xsmall" style={{textAlign:"center"}}>© 141'STUDIO · nil@141agency.com</div>
      </div>
    </div>
  );
};

window.AuthGate = AuthGate;

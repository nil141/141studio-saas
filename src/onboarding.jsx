// Client onboarding page — shown at /invite/TOKEN (Supabase v8)

const OnboardingField = ({ label, id, type, ph, autoC, value, onChange, err }) => (
  <div>
    <div className="label">{label}</div>
    <input className="input" type={type || "text"} autoComplete={autoC} placeholder={ph}
      value={value} onChange={e => onChange(id, e.target.value)}
      style={{ height:44, fontSize:14, borderColor: err ? "var(--red)" : undefined }}/>
    {err && <div style={{color:"var(--red)", fontSize:11, marginTop:4}}>{err}</div>}
  </div>
);

const OnboardingPage = ({ token }) => {
  const { useState, useEffect } = React;
  const [status, setStatus]     = useState("checking");
  const [errMsg, setErrMsg]     = useState("");
  const [busy, setBusy]         = useState(false);
  const [form, setForm]         = useState({ name:"", company:"", email:"", pw:"", pw2:"", phone:"" });
  const [fieldErr, setFieldErr] = useState({});

  useEffect(() => {
    // Check invite token via Supabase
    const _sbInv = window.supabase.createClient(window.Data._SB_URL, window.Data._SB_KEY);
    _sbInv.from("invites").select("service,used").eq("token", token).single()
      .then(({ data, error }) => {
        if (!data || data.used || error) {
          setErrMsg("Enlace no válido o ya utilizado");
          setStatus("error");
        } else {
          setStatus("form");
        }
      })
      .catch(() => { setErrMsg("No se pudo conectar con el servidor."); setStatus("error"); });
  }, [token]);

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = "Obligatorio";
    if (!form.company.trim()) e.company = "Obligatorio";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Email no válido";
    if (form.pw.length < 6)   e.pw      = "Mínimo 6 caracteres";
    if (form.pw !== form.pw2) e.pw2     = "Las contraseñas no coinciden";
    setFieldErr(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setBusy(true);
    try {
      const _sbInv = window.supabase.createClient(window.Data._SB_URL, window.Data._SB_KEY);

      // 1. Create Supabase Auth account
      const { data: authData, error: authError } = await _sbInv.auth.signUp({
        email: form.email.trim(),
        password: form.pw,
        options: { data: { name: form.name.trim(), role: "client" } },
      });
      if (authError) {
        setFieldErr({ _: authError.message || "Error al crear la cuenta" });
        setBusy(false); return;
      }

      // 2. Complete invite via SECURITY DEFINER function (creates client record + updates profile)
      const { data: result, error: rpcError } = await _sbInv.rpc("complete_invite", {
        p_token:   token,
        p_name:    form.name.trim(),
        p_company: form.company.trim(),
        p_phone:   form.phone.trim(),
      });

      if (rpcError || !result?.ok) {
        setFieldErr({ _: result?.error || rpcError?.message || "Error al completar el registro" });
        setBusy(false); return;
      }

      // 3. Sign out so the client logs in fresh
      await _sbInv.auth.signOut();

      // Clear any existing UI session
      sessionStorage.removeItem("141_session");
      localStorage.removeItem("141_session");
      localStorage.removeItem("141_session_exp");

      setStatus("done");
    } catch (err) {
      setFieldErr({ _: "No se pudo conectar con el servidor" });
    }
    setBusy(false);
  };

  const wrap = (children) => (
    <div style={{ minHeight:"100dvh", display:"flex", alignItems:"center", justifyContent:"center",
      background:"var(--bg)", padding:"24px 16px" }}>
      <div style={{ width:"100%", maxWidth:440, display:"flex", flexDirection:"column", gap:28 }}>
        <img src="/logo.svg" alt="141'STUDIO" style={{height: 22, width: "auto"}}/>
        {children}
        <div className="subtle xsmall" style={{textAlign:"center"}}>© 141'STUDIO · nil@141agency.com</div>
      </div>
    </div>
  );

  if (status === "checking") return wrap(
    <div style={{color:"var(--text-muted)", fontSize:14}}>Verificando enlace…</div>
  );

  if (status === "error") return wrap(
    <div>
      <div style={{width:44, height:44, borderRadius:12, background:"var(--red-soft)", color:"var(--red)",
        display:"grid", placeItems:"center", marginBottom:20}}>
        <Icon name="alert-triangle" size={20}/>
      </div>
      <h1 style={{fontSize:22, fontWeight:500, marginBottom:8, fontFamily:"var(--font-display)"}}>Enlace no disponible</h1>
      <p style={{color:"var(--text-muted)", fontSize:14, marginBottom:24}}>{errMsg}</p>
      <a href="/" className="btn primary full" style={{height:44, fontSize:14, textDecoration:"none",
        display:"flex", alignItems:"center", justifyContent:"center", gap:8}}>
        Ir al acceso <Icon name="arrow" size={13}/>
      </a>
    </div>
  );

  if (status === "done") return wrap(
    <div>
      <div style={{width:44, height:44, borderRadius:12, background:"var(--green-soft)", color:"var(--green)",
        display:"grid", placeItems:"center", marginBottom:20}}>
        <Icon name="check" size={20}/>
      </div>
      <h1 style={{fontSize:22, fontWeight:500, marginBottom:8, fontFamily:"var(--font-display)"}}>¡Cuenta creada!</h1>
      <p style={{color:"var(--text-muted)", fontSize:14, marginBottom:24}}>
        Ya puedes iniciar sesión con tu email y contraseña.
      </p>
      <a href="/" className="btn primary full" style={{height:44, fontSize:14, textDecoration:"none",
        display:"flex", alignItems:"center", justifyContent:"center"}}>
        Ir al acceso <Icon name="arrow" size={13}/>
      </a>
    </div>
  );

  return wrap(
    <form onSubmit={submit} style={{display:"flex", flexDirection:"column", gap:16}}>
      <div>
        <h1 style={{fontSize:26, fontWeight:500, lineHeight:1.2, marginBottom:6, fontFamily:"var(--font-display)"}}>
          Crea tu cuenta.
        </h1>
        <div className="muted" style={{fontSize:14}}>
          Completa tu ficha de cliente para acceder al portal.
        </div>
      </div>

      <div style={{display:"flex", flexDirection:"column", gap:12}}>
        <OnboardingField label="Nombre completo" id="name" ph="Juan García" autoC="name"
          value={form.name} onChange={setField} err={fieldErr.name}/>
        <OnboardingField label="Empresa" id="company" ph="Mi Empresa S.L." autoC="organization"
          value={form.company} onChange={setField} err={fieldErr.company}/>
        <OnboardingField label="Teléfono / WhatsApp" id="phone" ph="+34 600 000 000" autoC="tel"
          value={form.phone} onChange={setField} err={fieldErr.phone}/>
        <OnboardingField label="Email de acceso" id="email" type="email" ph="tu@empresa.com" autoC="email"
          value={form.email} onChange={setField} err={fieldErr.email}/>
        <OnboardingField label="Contraseña" id="pw" type="password" ph="Mínimo 6 caracteres" autoC="new-password"
          value={form.pw} onChange={setField} err={fieldErr.pw}/>
        <OnboardingField label="Confirmar contraseña" id="pw2" type="password" ph="Repite la contraseña" autoC="new-password"
          value={form.pw2} onChange={setField} err={fieldErr.pw2}/>
      </div>

      {fieldErr._ && (
        <div className="chip red" style={{display:"flex", padding:"8px 12px", fontSize:12}}>
          <Icon name="alert-triangle" size={12}/> {fieldErr._}
        </div>
      )}

      <button type="submit" className="btn primary full" style={{height:44, fontSize:14}} disabled={busy}>
        {busy ? "Creando cuenta…" : "Crear mi cuenta"}
      </button>
    </form>
  );
};

window.OnboardingPage = OnboardingPage;

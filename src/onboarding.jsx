// Client onboarding page — shown at /invite/TOKEN (Supabase v8)
// Flujo guiado paso a paso + verificación por código de email.

const OnboardingPage = ({ token }) => {
  const { useState, useEffect } = React;
  const [status, setStatus] = useState("checking"); // checking | error | form | verify | done
  const [errMsg, setErrMsg] = useState("");
  const [busy, setBusy]     = useState(false);
  const [form, setForm]     = useState({ name:"", company:"", email:"", pw:"", pw2:"", phone:"" });
  const [step, setStep]     = useState(0);
  const [err, setErr]       = useState("");   // error del paso actual
  const [topErr, setTopErr] = useState("");   // error al crear la cuenta
  const [code, setCode]     = useState("");
  const [codeErr, setCodeErr]   = useState("");
  const [resendMsg, setResendMsg] = useState("");

  const _sb = () => window.supabase.createClient(window.Data._SB_URL, window.Data._SB_KEY);

  useEffect(() => {
    _sb().from("invites").select("service,used").eq("token", token).single()
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
  const first = (n) => (n || "").trim().split(/\s+/)[0] || "";

  const STEPS = [
    { key:"name",    title: () => "¿Cómo te llamas?",
      sub:"Tu nombre y apellidos.",
      fields:[{ id:"name", ph:"Juan García", autoC:"name" }] },
    { key:"company", title: (f) => first(f.name) ? `Encantado, ${first(f.name)}. ¿Tu empresa?` : "¿Cuál es tu empresa?",
      sub:"El nombre de tu empresa o marca.",
      fields:[{ id:"company", ph:"Mi Empresa S.L.", autoC:"organization" }] },
    { key:"phone",   title: () => "¿Cómo te contactamos?",
      sub:"Teléfono o WhatsApp (opcional).",
      fields:[{ id:"phone", ph:"+34 600 000 000", type:"tel", autoC:"tel" }] },
    { key:"email",   title: () => "Tu email de acceso",
      sub:"Te enviaremos un código para confirmarlo.",
      fields:[{ id:"email", ph:"tu@empresa.com", type:"email", autoC:"email" }] },
    { key:"pw",      title: () => "Crea una contraseña",
      sub:"Mínimo 6 caracteres.",
      fields:[
        { id:"pw",  ph:"Contraseña", type:"password", autoC:"new-password" },
        { id:"pw2", ph:"Repite la contraseña", type:"password", autoC:"new-password" },
      ] },
  ];
  const isLast = step === STEPS.length - 1;

  const validateStep = () => {
    const k = STEPS[step].key;
    if (k === "name"    && !form.name.trim())    return "Escribe tu nombre";
    if (k === "company" && !form.company.trim()) return "Escribe el nombre de tu empresa";
    if (k === "email"   && (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))) return "Email no válido";
    if (k === "pw") {
      if (form.pw.length < 6) return "Mínimo 6 caracteres";
      if (form.pw !== form.pw2) return "Las contraseñas no coinciden";
    }
    return "";
  };

  const next = () => {
    const e = validateStep();
    if (e) { setErr(e); return; }
    setErr("");
    if (!isLast) { setStep(step + 1); return; }
    startSignup();
  };
  const back = () => { setErr(""); setStep(s => Math.max(0, s - 1)); };

  // Completa el alta (crea cliente + perfil) y cierra sesión. Devuelve mensaje de error o null.
  const finishSignup = async (sb) => {
    const { data: result, error: rpcError } = await sb.rpc("complete_invite", {
      p_token:   token,
      p_name:    form.name.trim(),
      p_company: form.company.trim(),
      p_phone:   form.phone.trim(),
    });
    if (rpcError || !result?.ok) {
      return result?.error || rpcError?.message || "Error al completar el registro";
    }
    await sb.auth.signOut();
    sessionStorage.removeItem("141_session");
    localStorage.removeItem("141_session");
    localStorage.removeItem("141_session_exp");
    return null;
  };

  const startSignup = async () => {
    setBusy(true); setTopErr("");
    try {
      const sb = _sb();
      const { data, error } = await sb.auth.signUp({
        email: form.email.trim(),
        password: form.pw,
        options: { data: { name: form.name.trim(), role: "client" } },
      });
      if (error) { setTopErr(error.message || "Error al crear la cuenta"); setBusy(false); return; }

      if (data.session) {
        // "Confirm email" está desactivado en Supabase → ya hay sesión, completamos directo
        const e = await finishSignup(sb);
        if (e) { setTopErr(e); setBusy(false); return; }
        setStatus("done");
      } else {
        // Requiere verificación por código
        setCode(""); setCodeErr(""); setResendMsg("");
        setStatus("verify");
      }
    } catch (e) {
      setTopErr("No se pudo conectar con el servidor");
    }
    setBusy(false);
  };

  const verifyAndComplete = async () => {
    if (code.trim().length < 6) { setCodeErr("Introduce el código de 6 dígitos"); return; }
    setBusy(true); setCodeErr("");
    try {
      const sb = _sb();
      const { error: vErr } = await sb.auth.verifyOtp({
        email: form.email.trim(), token: code.trim(), type: "signup",
      });
      if (vErr) { setCodeErr(vErr.message || "Código incorrecto o caducado"); setBusy(false); return; }

      const e = await finishSignup(sb);
      if (e) { setCodeErr(e); setBusy(false); return; }
      setStatus("done");
    } catch (e) {
      setCodeErr("No se pudo conectar con el servidor");
    }
    setBusy(false);
  };

  const resendCode = async () => {
    setResendMsg("Enviando…"); setCodeErr("");
    try {
      const { error } = await _sb().auth.resend({ type: "signup", email: form.email.trim() });
      setResendMsg(error ? (error.message || "No se pudo reenviar") : "Código reenviado ✓");
    } catch { setResendMsg("No se pudo reenviar"); }
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
    <div style={{animation:"pop .3s ease"}}>
      <div style={{width:48, height:48, borderRadius:14, background:"var(--green-soft)", color:"var(--green)",
        display:"grid", placeItems:"center", marginBottom:20}}>
        <Icon name="check" size={22}/>
      </div>
      <h1 style={{fontSize:24, fontWeight:500, marginBottom:8, fontFamily:"var(--font-display)"}}>
        {first(form.name) ? `¡Listo, ${first(form.name)}!` : "¡Cuenta verificada!"}
      </h1>
      <p style={{color:"var(--text-muted)", fontSize:14, marginBottom:24}}>
        Tu cuenta está confirmada. Ya puedes entrar al portal con tu email y contraseña.
      </p>
      <a href="/" className="btn primary full" style={{height:46, fontSize:14, textDecoration:"none",
        display:"flex", alignItems:"center", justifyContent:"center", gap:8}}>
        Entrar al portal <Icon name="arrow" size={13}/>
      </a>
    </div>
  );

  // ── Paso de verificación por código ──
  if (status === "verify") return wrap(
    <div>
      <div style={{height:3, background:"var(--bg-elev-2)", borderRadius:99, overflow:"hidden", marginBottom:30}}>
        <div style={{height:"100%", width:"100%", background:"var(--accent)", borderRadius:99}}/>
      </div>
      <div style={{animation:"pop .25s ease", display:"flex", flexDirection:"column", gap:18}}>
        <div>
          <div style={{width:48, height:48, borderRadius:14, background:"var(--accent-soft)", color:"var(--accent)",
            display:"grid", placeItems:"center", marginBottom:16}}>
            <Icon name="mail" size={22}/>
          </div>
          <div className="subtle xsmall" style={{marginBottom:10, letterSpacing:"0.6px", textTransform:"uppercase"}}>
            Último paso · verificación
          </div>
          <h1 style={{fontSize:26, fontWeight:500, lineHeight:1.2, marginBottom:6, fontFamily:"var(--font-display)"}}>
            Confirma tu cuenta
          </h1>
          <div className="muted" style={{fontSize:14, lineHeight:1.5}}>
            Te hemos enviado un código de 6 dígitos a <b style={{color:"var(--text)"}}>{form.email}</b>. Introdúcelo para activar tu cuenta.
          </div>
        </div>

        <input className="input" inputMode="numeric" maxLength={6} autoFocus placeholder="••••••"
          value={code}
          onChange={e => { setCode(e.target.value.replace(/\D/g, "").slice(0, 6)); if (codeErr) setCodeErr(""); }}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); verifyAndComplete(); } }}
          style={{height:58, fontSize:26, letterSpacing:"10px", textAlign:"center",
            fontFamily:"var(--font-mono)", borderColor: codeErr ? "var(--red)" : undefined}}/>
        {codeErr && <div style={{color:"var(--red)", fontSize:12.5}}>{codeErr}</div>}

        <button type="button" className="btn primary full" onClick={verifyAndComplete} disabled={busy}
          style={{height:48, fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", gap:8}}>
          {busy ? "Verificando…" : "Verificar y entrar"} {!busy && <Icon name="check" size={13}/>}
        </button>

        <div style={{textAlign:"center"}}>
          <button type="button" onClick={resendCode} disabled={busy}
            style={{background:"transparent", border:0, color:"var(--text-muted)", fontSize:13,
              cursor:"pointer", fontFamily:"inherit", textDecoration:"underline"}}>
            ¿No te llega? Reenviar código
          </button>
          {resendMsg && <div className="subtle xsmall" style={{marginTop:6}}>{resendMsg}</div>}
        </div>
      </div>
    </div>
  );

  // ── Asistente paso a paso ──
  const s = STEPS[step];
  const title = typeof s.title === "function" ? s.title(form) : s.title;

  return wrap(
    <div>
      <div style={{height:3, background:"var(--bg-elev-2)", borderRadius:99, overflow:"hidden", marginBottom:30}}>
        <div style={{height:"100%", width:`${((step + 1) / (STEPS.length + 1)) * 100}%`,
          background:"var(--accent)", borderRadius:99, transition:"width .35s ease"}}/>
      </div>

      <div key={step} style={{animation:"pop .25s ease", display:"flex", flexDirection:"column", gap:18}}>
        <div>
          <div className="subtle xsmall" style={{marginBottom:10, letterSpacing:"0.6px", textTransform:"uppercase"}}>
            Paso {step + 1} de {STEPS.length + 1}
          </div>
          <h1 style={{fontSize:26, fontWeight:500, lineHeight:1.2, marginBottom:6, fontFamily:"var(--font-display)"}}>
            {title}
          </h1>
          <div className="muted" style={{fontSize:14}}>{s.sub}</div>
        </div>

        <div style={{display:"flex", flexDirection:"column", gap:10}}>
          {s.fields.map((fd, idx) => (
            <input key={fd.id} className="input" autoFocus={idx === 0}
              type={fd.type || "text"} autoComplete={fd.autoC} placeholder={fd.ph}
              value={form[fd.id]} onChange={e => { setField(fd.id, e.target.value); if (err) setErr(""); }}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); next(); } }}
              style={{height:52, fontSize:16, borderColor: err ? "var(--red)" : undefined}}/>
          ))}
          {err && <div style={{color:"var(--red)", fontSize:12.5}}>{err}</div>}
        </div>

        {topErr && (
          <div className="chip red" style={{display:"flex", alignItems:"center", gap:6, padding:"8px 12px", fontSize:12}}>
            <Icon name="alert-triangle" size={12}/> {topErr}
          </div>
        )}

        <div style={{display:"flex", gap:10, marginTop:4}}>
          {step > 0 && (
            <button type="button" className="btn" onClick={back} disabled={busy}
              style={{height:48, fontSize:14, padding:"0 16px"}}>
              <Icon name="chevron" size={13} style={{transform:"rotate(180deg)"}}/> Atrás
            </button>
          )}
          <button type="button" className="btn primary full" onClick={next} disabled={busy}
            style={{height:48, fontSize:14, flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8}}>
            {busy ? "Enviando código…" : isLast ? "Crear cuenta" : "Continuar"}
            {!busy && <Icon name={isLast ? "arrow" : "arrow"} size={13}/>}
          </button>
        </div>
      </div>
    </div>
  );
};

window.OnboardingPage = OnboardingPage;

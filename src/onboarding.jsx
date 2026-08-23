// Client onboarding page — shown at /invite/TOKEN (Supabase v8)
// Mismo estilo visual que la página de login (auth.jsx): contenedor auth-page,
// inputs .auth-input y botón morado .auth-btn. Flujo guiado + verificación.

const _PURP = "rgb(130,119,219)";
const _AUTH_INPUT = {
  width:"100%", fontFamily:"inherit", height:50, fontSize:16, borderRadius:16,
  padding:"12px 20px", background:"rgba(255,255,255,0.05)", color:"#ffffff",
};
const _AUTH_BTN = {
  height:49, fontSize:15, fontWeight:400, borderRadius:16,
  background:"rgba(130,119,219,0.25)", border:"1px solid rgb(130,119,219)",
  color:"rgb(130,119,219)", letterSpacing:"-0.96px",
  boxShadow:"rgba(130,119,219,0.267) 0px 0px 20px 0px",
  transition:"opacity 0.3s ease, box-shadow 0.5s cubic-bezier(0.4,0,0.2,1)",
};

const OnboardingPage = ({ token }) => {
  const { useState, useEffect } = React;
  const [status, setStatus] = useState("checking"); // checking | error | form | verify | done
  const [errMsg, setErrMsg] = useState("");
  const [busy, setBusy]     = useState(false);
  const [form, setForm]     = useState({ name:"", company:"", email:"", pw:"", pw2:"", phone:"",
    sector:"", website:"", fiscalName:"", nif:"", fiscalAddress:"", about:"" });
  const [step, setStep]     = useState(0);
  const [err, setErr]       = useState("");
  const [topErr, setTopErr] = useState("");
  const [code, setCode]     = useState("");
  const [codeErr, setCodeErr]     = useState("");
  const [resendMsg, setResendMsg] = useState("");

  const _sb = () => window.supabase.createClient(window.Data._SB_URL, window.Data._SB_KEY);

  useEffect(() => {
    const sb = _sb();
    sb.from("invites").select("service,used").eq("token", token).single()
      .then(({ data, error }) => {
        if (!data || data.used || error) { setErrMsg("Enlace no válido o ya utilizado"); setStatus("error"); return; }
        setStatus("form");
        // Pre-rellenar con los datos que la agencia ya tenga en la ficha (si los hay).
        sb.rpc("get_invite_prefill", { p_token: token }).then(({ data: pf }) => {
          const c = pf && pf.ok && pf.client;
          if (c) setForm(f => ({ ...f,
            name:          c.name          || f.name,
            company:       c.company       || f.company,
            phone:         c.phone         || f.phone,
            website:       c.website       || f.website,
            fiscalName:    c.fiscal_name   || f.fiscalName,
            nif:           c.nif           || f.nif,
            fiscalAddress: c.fiscal_address|| f.fiscalAddress,
            about:         c.about         || f.about,
          }));
        }).catch(() => {});
      })
      .catch(() => { setErrMsg("No se pudo conectar con el servidor."); setStatus("error"); });
  }, [token]);

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const first = (n) => (n || "").trim().split(/\s+/)[0] || "";

  const STEPS = [
    { key:"name",    title: () => "¿Cómo te llamas?", sub:"Tu nombre y apellidos.",
      fields:[{ id:"name", ph:"Juan García", autoC:"name" }] },
    { key:"company", title: (f) => first(f.name) ? `Encantado, ${first(f.name)}.` : "¿Cuál es tu empresa?",
      sub:"El nombre de tu empresa o marca.",
      fields:[{ id:"company", ph:"Mi Empresa S.L.", autoC:"organization" }] },
    { key:"about",   title: () => "¿A qué os dedicáis?", sub:"Cuéntanos brevemente tu negocio y tu web (opcional).",
      fields:[
        { id:"about",   ph:"Ej. Restaurante de cocina mediterránea" },
        { id:"website", ph:"tuweb.com", autoC:"url" },
      ] },
    { key:"fiscal",  title: () => "Datos de facturación", sub:"Para poder emitirte las facturas (opcional).",
      fields:[
        { id:"fiscalName",    ph:"Razón social (Mi Empresa S.L.)", autoC:"organization" },
        { id:"nif",           ph:"NIF / CIF" },
        { id:"fiscalAddress", ph:"Dirección fiscal" },
      ] },
    { key:"phone",   title: () => "¿Cómo te contactamos?", sub:"Teléfono o WhatsApp (opcional).",
      fields:[{ id:"phone", ph:"+34 600 000 000", type:"tel", autoC:"tel" }] },
    { key:"email",   title: () => "Tu email de acceso", sub:"Te enviaremos un código para confirmarlo.",
      fields:[{ id:"email", ph:"tu@empresa.com", type:"email", autoC:"email" }] },
    { key:"pw",      title: () => "Crea una contraseña", sub:"Mínimo 6 caracteres.",
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

  const finishSignup = async (sb) => {
    const base = { p_token: token, p_name: form.name.trim(), p_company: form.company.trim(), p_phone: form.phone.trim() };
    const extra = {
      nif: form.nif.trim(), fiscal_name: form.fiscalName.trim(), fiscal_address: form.fiscalAddress.trim(),
      website: form.website.trim(), about: form.about.trim(),
    };
    // Versión con datos fiscales; si aún no se ha corrido el SQL nuevo, se
    // cae a la versión antigua (la cuenta se crea igual, sin los datos extra).
    let { data: result, error: rpcError } = await sb.rpc("complete_invite", { ...base, p_extra: extra });
    if (rpcError && /function|does not exist|schema cache|p_extra/i.test(rpcError.message || "")) {
      ({ data: result, error: rpcError } = await sb.rpc("complete_invite", base));
    }
    if (rpcError || !result?.ok) return result?.error || rpcError?.message || "Error al completar el registro";
    // Avisar a la agencia (campana del CRM + correo) de que el cliente ya tiene portal.
    try {
      const clientName = form.company.trim() || form.name.trim() || "Un cliente";
      const { data: prof } = await sb.from("profiles").select("agency_id, client_db_id")
        .eq("id", (await sb.auth.getUser()).data.user.id).single();
      if (prof && prof.agency_id && prof.client_db_id) {
        const nid = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        sb.from("notifications").insert({
          id: nid, agency_id: prof.agency_id, client_id: prof.client_db_id,
          title: "Portal creado", body: clientName + " ha completado su registro y ya tiene acceso a su portal",
          kind: "client-portal", read: false, target: "agency",
        }).then(() => {}, () => {});
      }
      const token = (await sb.auth.getSession()).data.session?.access_token;
      if (token) {
        fetch("/api/portal/notify_agency", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
          body: JSON.stringify({ title: "Portal creado", body: clientName + " ha completado su registro y ya tiene acceso a su portal.", kind: "client-portal", client_name: clientName }),
        }).catch(() => {});
      }
    } catch {}
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
        email: form.email.trim(), password: form.pw,
        options: { data: { name: form.name.trim(), role: "client" } },
      });
      if (error) { setTopErr(error.message || "Error al crear la cuenta"); setBusy(false); return; }
      if (data.session) {
        const e = await finishSignup(sb);
        if (e) { setTopErr(e); setBusy(false); return; }
        setStatus("done");
      } else {
        setCode(""); setCodeErr(""); setResendMsg(""); setStatus("verify");
      }
    } catch (e) { setTopErr("No se pudo conectar con el servidor"); }
    setBusy(false);
  };

  const verifyAndComplete = async () => {
    const raw = code.trim();
    if (raw.length < 6) { setCodeErr("Introduce el código que te ha llegado por correo"); return; }
    setBusy(true); setCodeErr("");
    try {
      const sb = _sb();
      // Acepta tanto el código corto de 6 dígitos ({{ .Token }}) como el token largo
      // ({{ .TokenHash }}) que envían algunas plantillas de correo de Supabase.
      let vErr = null;
      if (/^\d{6}$/.test(raw)) {
        ({ error: vErr } = await sb.auth.verifyOtp({ email: form.email.trim(), token: raw, type: "signup" }));
      } else {
        ({ error: vErr } = await sb.auth.verifyOtp({ token_hash: raw, type: "signup" }));
        if (vErr) ({ error: vErr } = await sb.auth.verifyOtp({ token_hash: raw, type: "email" }));
      }
      if (vErr) { setCodeErr(vErr.message || "Código incorrecto o caducado"); setBusy(false); return; }
      const e = await finishSignup(sb);
      if (e) { setCodeErr(e); setBusy(false); return; }
      setStatus("done");
    } catch (e) { setCodeErr("No se pudo conectar con el servidor"); }
    setBusy(false);
  };

  const resendCode = async () => {
    setResendMsg("Enviando…"); setCodeErr("");
    try {
      const { error } = await _sb().auth.resend({ type: "signup", email: form.email.trim() });
      setResendMsg(error ? (error.message || "No se pudo reenviar") : "Código reenviado ✓");
    } catch { setResendMsg("No se pudo reenviar"); }
  };

  // ── Layout base (idéntico a la página de login) ──
  const wrap = (children) => (
    <div className="auth-page" style={{
      minHeight:"100dvh", display:"flex", alignItems:"center", justifyContent:"center",
      background:"var(--bg)", padding:"24px 16px", overflowY:"auto",
    }}>
      <div className="auth-container" style={{width:"100%", maxWidth:384}}>
        {children}
        <div className="subtle xsmall" style={{textAlign:"center", marginTop:32}}>
          © 141'DIGITAL · nil@141agency.com
        </div>
      </div>
    </div>
  );

  const Title = ({ children }) => (
    <h1 style={{fontSize:30, fontWeight:400, lineHeight:"36px", marginBottom:8,
      fontFamily:"var(--font-display)", textAlign:"center", letterSpacing:"-0.96px", color:"#ffffff"}}>{children}</h1>
  );
  const Sub = ({ children, mb=28 }) => (
    <div style={{fontSize:14, marginBottom:mb, textAlign:"center", color:"#999999"}}>{children}</div>
  );

  if (status === "checking") return wrap(
    <div style={{color:"#999999", fontSize:14, textAlign:"center"}}>Verificando enlace…</div>
  );

  if (status === "error") return wrap(
    <div style={{display:"flex", flexDirection:"column"}}>
      <Title>Enlace no disponible</Title>
      <Sub mb={28}>{errMsg}</Sub>
      <a href="/" className="btn full auth-btn" style={{..._AUTH_BTN, textDecoration:"none",
        display:"flex", alignItems:"center", justifyContent:"center", gap:8}}>Ir al acceso</a>
    </div>
  );

  if (status === "done") return wrap(
    <div style={{display:"flex", flexDirection:"column", animation:"pop .3s ease"}}>
      <Title>{first(form.name) ? `¡Listo, ${first(form.name)}!` : "¡Cuenta verificada!"}</Title>
      <Sub mb={28}>Tu cuenta está confirmada. Ya puedes entrar al portal con tu email y contraseña.</Sub>
      <a href="/" className="btn full auth-btn" style={{..._AUTH_BTN, textDecoration:"none",
        display:"flex", alignItems:"center", justifyContent:"center", gap:8}}>Entrar al portal</a>
    </div>
  );

  // Barra de progreso fina (morado del login)
  const Progress = ({ pct }) => (
    <div style={{height:3, background:"rgba(255,255,255,0.06)", borderRadius:99, overflow:"hidden", marginBottom:26}}>
      <div style={{height:"100%", width:`${pct}%`, background:_PURP, borderRadius:99, transition:"width .35s ease"}}/>
    </div>
  );

  if (status === "verify") return wrap(
    <div style={{animation:"pop .25s ease"}}>
      <Progress pct={100}/>
      <Title>Confirma tu cuenta</Title>
      <Sub mb={24}>
        Te hemos enviado un código de verificación a <b style={{color:"#fff"}}>{form.email}</b>.
      </Sub>
      <input className="auth-input" maxLength={128} autoFocus placeholder="Código del correo"
        value={code}
        onChange={e => { setCode(e.target.value.replace(/\s/g, "")); if (codeErr) setCodeErr(""); }}
        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); verifyAndComplete(); } }}
        style={{..._AUTH_INPUT, height:56, textAlign:"center",
          fontSize: code.length > 8 ? 15 : 26,
          letterSpacing: code.length > 8 ? "0.5px" : "10px",
          fontFamily:"var(--font-mono)", marginBottom:16, borderColor: codeErr ? "var(--red)" : undefined}}/>
      {codeErr && <div className="chip red" style={{display:"flex", padding:"6px 10px", marginBottom:12, fontSize:12}}>
        <Icon name="alert-triangle" size={12}/> {codeErr}
      </div>}
      <button type="button" className="btn full auth-btn" onClick={verifyAndComplete} disabled={busy}
        style={{..._AUTH_BTN, opacity: busy ? 0.5 : 1}}>
        {busy ? "Verificando…" : "Verificar y entrar"}
      </button>
      <div style={{textAlign:"center", marginTop:18}}>
        <button type="button" onClick={resendCode} disabled={busy}
          style={{background:"transparent", border:0, color:"#999999", fontSize:13, cursor:"pointer",
            fontFamily:"inherit", textDecoration:"underline"}}>
          ¿No te llega? Reenviar código
        </button>
        {resendMsg && <div className="subtle xsmall" style={{marginTop:6}}>{resendMsg}</div>}
      </div>
    </div>
  );

  // ── Asistente paso a paso ──
  const s = STEPS[step];
  const title = typeof s.title === "function" ? s.title(form) : s.title;
  const pct = ((step + 1) / (STEPS.length + 1)) * 100;

  return wrap(
    <div key={step} style={{animation:"pop .25s ease"}}>
      <Progress pct={pct}/>
      <Title>{title}</Title>
      <Sub mb={26}>{s.sub}</Sub>

      {s.fields.map((fd, idx) => (
        <input key={fd.id} className="auth-input" autoFocus={idx === 0}
          type={fd.type || "text"} autoComplete={fd.autoC} placeholder={fd.ph}
          value={form[fd.id]} onChange={e => { setField(fd.id, e.target.value); if (err) setErr(""); }}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); next(); } }}
          style={{..._AUTH_INPUT, marginBottom:16, borderColor: err ? "var(--red)" : undefined}}/>
      ))}

      {err && <div className="chip red" style={{display:"flex", padding:"6px 10px", marginBottom:12, fontSize:12}}>
        <Icon name="alert-triangle" size={12}/> {err}
      </div>}
      {topErr && <div className="chip red" style={{display:"flex", padding:"6px 10px", marginBottom:12, fontSize:12}}>
        <Icon name="alert-triangle" size={12}/> {topErr}
      </div>}

      <button type="button" className="btn full auth-btn" onClick={next} disabled={busy}
        style={{..._AUTH_BTN, opacity: busy ? 0.5 : 1}}>
        {busy ? "Enviando código…" : isLast ? "Crear cuenta" : "Continuar"}
      </button>

      {step > 0 && (
        <div style={{textAlign:"center", marginTop:16}}>
          <button type="button" onClick={back} disabled={busy}
            style={{background:"transparent", border:0, color:"#999999", fontSize:13, cursor:"pointer",
              fontFamily:"inherit"}}>
            ← Atrás
          </button>
        </div>
      )}
    </div>
  );
};

window.OnboardingPage = OnboardingPage;

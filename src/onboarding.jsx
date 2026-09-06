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
    { key:"welcome", name:"Bienvenida", head:"Bienvenido a tu portal",
      desc:"Antes de empezar vas a completar unos pasos rápidos para dejar tu portal de cliente listo. Solo te llevará un minuto." },
    { key:"about", name:"Déjanos conocerte", head:"Déjanos conocerte",
      desc:"Cuéntanos quién eres y a qué os dedicáis.",
      fields:[
        { id:"name",    label:"Nombre y apellidos", ph:"Juan García", autoC:"name" },
        { id:"company", label:"Empresa o marca",    ph:"Mi Empresa S.L.", autoC:"organization" },
        { id:"about",   label:"¿A qué os dedicáis?", ph:"Ej. Restaurante de cocina mediterránea" },
        { id:"website", label:"Web (opcional)",     ph:"tuweb.com", autoC:"url" },
      ] },
    { key:"fiscal", name:"Facturación", head:"Datos de facturación",
      desc:"Para poder emitirte las facturas. Puedes rellenarlo ahora o dejarlo para más tarde.",
      fields:[
        { id:"fiscalName",    label:"Razón social",       ph:"Mi Empresa S.L.", autoC:"organization" },
        { id:"nif",           label:"NIF / CIF",          ph:"B12345678" },
        { id:"fiscalAddress", label:"Dirección fiscal",   ph:"Calle, nº, ciudad, CP" },
        { id:"phone",         label:"Teléfono o WhatsApp", ph:"+34 600 000 000", type:"tel", autoC:"tel" },
      ] },
    { key:"access", name:"Crea tu acceso", head:"Crea tu acceso",
      desc:"Con esto entrarás a tu portal a partir de ahora. Te enviaremos un código para confirmar el correo.",
      fields:[
        { id:"email", label:"Email de acceso",      ph:"tu@empresa.com", type:"email", autoC:"email" },
        { id:"pw",    label:"Contraseña",           ph:"Mínimo 6 caracteres", type:"password", autoC:"new-password" },
        { id:"pw2",   label:"Repite la contraseña", ph:"Repite la contraseña", type:"password", autoC:"new-password" },
      ] },
    { key:"verify", name:"A por todas", head:"Confirma tu cuenta",
      desc:"Te hemos enviado un código de verificación a tu correo. Introdúcelo para activar tu portal." },
  ];
  const verifyIndex = STEPS.length - 1;

  const validateStep = () => {
    const k = STEPS[step].key;
    if (k === "about") {
      if (!form.name.trim())    return "Escribe tu nombre";
      if (!form.company.trim()) return "Escribe el nombre de tu empresa";
    }
    if (k === "access") {
      if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) return "Email no válido";
      if (form.pw.length < 6) return "Mínimo 6 caracteres";
      if (form.pw !== form.pw2) return "Las contraseñas no coinciden";
    }
    return "";
  };

  const next = () => {
    const k = STEPS[step].key;
    if (k === "verify") { verifyAndComplete(); return; }
    const e = validateStep();
    if (e) { setErr(e); return; }
    setErr("");
    if (k === "access") { startSignup(); return; }
    setStep(step + 1);
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
    // IMPORTANTE: esperamos (await) a que se cree el aviso y se envíe el correo
    // ANTES de cerrar sesión; si no, signOut() invalida el token a mitad y falla.
    try {
      const _person = form.name.trim(); const _company = form.company.trim();
      const clientName = _person ? (_company ? `${_person} (${_company})` : _person) : (_company || "Un cliente");
      const body = clientName + " ha completado su registro y ya tiene acceso a su portal";
      const token = (await sb.auth.getSession()).data.session?.access_token;
      const { data: prof } = await sb.from("profiles").select("agency_id, client_db_id")
        .eq("id", (await sb.auth.getUser()).data.user.id).single();
      if (prof && prof.agency_id && prof.client_db_id) {
        const nid = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        await sb.from("notifications").insert({
          id: nid, agency_id: prof.agency_id, client_id: prof.client_db_id,
          title: "Portal creado", body, kind: "client-portal", read: false, target: "agency",
        });
      }
      if (token) {
        await fetch("/api/portal/notify_agency", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
          body: JSON.stringify({ title: "Portal creado", body: body + ".", kind: "client-portal", client_name: clientName }),
        });
      }
    } catch (e) { /* no bloquear el registro si el aviso falla */ }
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
        setCode(""); setCodeErr(""); setResendMsg(""); setStep(verifyIndex);
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
      if (/^\d{6,8}$/.test(raw)) {
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

  // ── Onboarding en dos columnas (lista de pasos + panel del paso) ──
  const cur = STEPS[step];
  const pct = Math.max(6, (step / (STEPS.length - 1)) * 100);
  const fieldStyle = { ..._AUTH_INPUT, height:46, fontSize:15, marginBottom:0,
    background:"var(--bg-elev)", border:"0.5px solid var(--border)" };

  const btnLabel = busy
    ? (cur.key === "verify" ? "Verificando…" : cur.key === "access" ? "Creando cuenta…" : "Un momento…")
    : (cur.key === "verify" ? "Verificar y entrar" : cur.key === "access" ? "Crear cuenta" : "Ir al siguiente paso");

  return (
    <div style={{ minHeight:"100dvh", background:"var(--bg)", padding:"40px 24px", overflowY:"auto",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:"100%", maxWidth:1080, margin:"0 auto" }}>
        {/* Logo */}
        <div style={{ display:"flex", justifyContent:"center", marginBottom:34 }}>
          <img src="/wordmark.svg" alt="141'DIGITAL" style={{ height:22, width:"auto", opacity:0.95 }}/>
        </div>

        {/* Título + barra de progreso */}
        <div style={{ marginBottom:26 }}>
          <div style={{ fontSize:15, color:"var(--text-muted)", marginBottom:12, letterSpacing:"-0.2px" }}>
            ¡Hola{first(form.name) ? `, ${first(form.name)}` : ""}! Bienvenido al onboarding
          </div>
          <div style={{ height:3, background:"rgba(255,255,255,0.06)", borderRadius:99, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${pct}%`, background:"var(--accent)", borderRadius:99, transition:"width .4s ease" }}/>
          </div>
        </div>

        {/* Dos columnas */}
        <div className="onb-grid">
          {/* Lista de pasos */}
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {STEPS.map((st, i) => {
              const active = i === step;
              const done = i < step;
              return (
                <div key={st.key}
                  onClick={() => { if (i < step && !busy) { setErr(""); setStep(i); } }}
                  style={{ display:"flex", alignItems:"stretch", gap:12,
                    cursor: i < step ? "pointer" : "default" }}>
                  {/* Cuadrado del número (independiente) */}
                  <div style={{ width:56, flexShrink:0, borderRadius:14, display:"grid", placeItems:"center",
                    fontWeight:600, fontSize:18, fontFamily:"var(--font-display)", transition:"background .15s, color .15s",
                    background: active ? "var(--accent)" : "var(--bg-elev-2)",
                    border: active ? "none" : "0.5px solid var(--border)",
                    color: active ? "#fff" : (done ? "var(--accent)" : "var(--text-muted)") }}>
                    {done ? <Icon name="check" size={20}/> : String(i + 1).padStart(2, "0")}
                  </div>
                  {/* Tarjeta de la etiqueta (independiente) */}
                  <div style={{ flex:1, minWidth:0, display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"13px 16px", borderRadius:14, transition:"background .15s, border-color .15s",
                    background: "var(--bg-elev-2)",
                    border: active ? "1px solid rgba(158,154,229,0.4)" : "0.5px solid var(--border)" }}>
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontSize:11.5, color: active ? "var(--accent)" : "var(--text-subtle)" }}>Paso {i + 1}</div>
                      <div style={{ fontSize:15, fontWeight:500, color: active ? "#fff" : "var(--text)", letterSpacing:"-0.2px" }}>{st.name}</div>
                    </div>
                    {active && <Icon name="chevron-right" size={16} style={{ color:"var(--accent)", flexShrink:0 }}/>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Panel del paso */}
          <div key={step} style={{ animation:"pop .22s ease", display:"flex", flexDirection:"column" }}>
            <div style={{ background:"var(--bg-elev-2)", border:"0.5px solid var(--border)", borderRadius:18, padding:"26px 28px" }}>
              <h2 style={{ fontFamily:"var(--font-display)", fontSize:20, fontWeight:500, letterSpacing:"-0.5px", marginBottom:8, color:"#fff" }}>{cur.head}</h2>
              <p style={{ fontSize:14, color:"var(--text-muted)", lineHeight:1.55, marginBottom: (cur.fields || cur.key === "verify") ? 22 : 4 }}>{cur.desc}</p>

              {cur.fields && (
                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  {cur.fields.map((fd, idx) => (
                    <div key={fd.id}>
                      <label style={{ display:"block", fontSize:12.5, color:"var(--text-muted)", marginBottom:6 }}>{fd.label}</label>
                      <input className="auth-input" autoFocus={idx === 0}
                        type={fd.type || "text"} autoComplete={fd.autoC} placeholder={fd.ph}
                        value={form[fd.id]} onChange={e => { setField(fd.id, e.target.value); if (err) setErr(""); }}
                        onKeyDown={e => { if (e.key === "Enter" && cur.fields.length === 1) { e.preventDefault(); next(); } }}
                        style={{ ...fieldStyle, borderColor: err ? "var(--red)" : "var(--border)" }}/>
                    </div>
                  ))}
                </div>
              )}

              {cur.key === "verify" && (
                <div>
                  <input className="auth-input" maxLength={128} autoFocus placeholder="Código del correo"
                    value={code}
                    onChange={e => { setCode(e.target.value.replace(/\s/g, "")); if (codeErr) setCodeErr(""); }}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); verifyAndComplete(); } }}
                    style={{ ..._AUTH_INPUT, height:54, textAlign:"center",
                      fontSize: code.length > 8 ? 15 : 24, letterSpacing: code.length > 8 ? "0.5px" : "8px",
                      fontFamily:"var(--font-mono)", background:"var(--bg-elev)", border:"0.5px solid var(--border)",
                      borderColor: codeErr ? "var(--red)" : "var(--border)" }}/>
                  <button type="button" onClick={resendCode} disabled={busy}
                    style={{ marginTop:12, background:"transparent", border:0, color:"var(--text-muted)", fontSize:13, cursor:"pointer", fontFamily:"inherit", textDecoration:"underline" }}>
                    ¿No te llega? Reenviar código
                  </button>
                  {resendMsg && <div style={{ marginTop:6, fontSize:12, color:"var(--text-subtle)" }}>{resendMsg}</div>}
                </div>
              )}

              {(err || topErr || codeErr) && (
                <div style={{ display:"flex", alignItems:"center", gap:7, marginTop:16, padding:"8px 12px", borderRadius:10,
                  background:"var(--red-soft)", color:"var(--red)", fontSize:12.5 }}>
                  <Icon name="alert-triangle" size={13}/> {err || topErr || codeErr}
                </div>
              )}
            </div>

            {/* Botón + atrás (anclado abajo para que no salte entre pasos) */}
            <div style={{ display:"flex", alignItems:"center", gap:14, marginTop:"auto", paddingTop:18 }}>
              <button type="button" onClick={next} disabled={busy}
                onMouseEnter={e => { if (!busy) e.currentTarget.style.background = "rgba(158,154,229,0.28)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "var(--accent-soft)"; }}
                style={{ display:"inline-flex", alignItems:"center", gap:8, height:44, padding:"0 20px", borderRadius:12, cursor:"pointer",
                  background:"var(--accent-soft)", color:"var(--accent)", border:"1px solid rgba(158,154,229,0.35)",
                  fontFamily:"inherit", fontSize:14, fontWeight:500, opacity: busy ? 0.6 : 1, transition:"background .15s" }}>
                {btnLabel} {!busy && cur.key !== "verify" && <Icon name="arrow" size={15}/>}
              </button>
              {step > 0 && cur.key !== "verify" && (
                <button type="button" onClick={back} disabled={busy}
                  style={{ background:"transparent", border:0, color:"var(--text-muted)", fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
                  ← Atrás
                </button>
              )}
            </div>
          </div>
        </div>

        <div style={{ textAlign:"center", marginTop:40, fontSize:11, color:"var(--text-subtle)" }}>
          © 141'DIGITAL · nil@141agency.com
        </div>
      </div>
    </div>
  );
};

window.OnboardingPage = OnboardingPage;

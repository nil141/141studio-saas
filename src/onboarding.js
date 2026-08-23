const _PURP = "rgb(130,119,219)";
const _AUTH_INPUT = {
  width: "100%",
  fontFamily: "inherit",
  height: 50,
  fontSize: 16,
  borderRadius: 16,
  padding: "12px 20px",
  background: "rgba(255,255,255,0.05)",
  color: "#ffffff"
};
const _AUTH_BTN = {
  height: 49,
  fontSize: 15,
  fontWeight: 400,
  borderRadius: 16,
  background: "rgba(130,119,219,0.25)",
  border: "1px solid rgb(130,119,219)",
  color: "rgb(130,119,219)",
  letterSpacing: "-0.96px",
  boxShadow: "rgba(130,119,219,0.267) 0px 0px 20px 0px",
  transition: "opacity 0.3s ease, box-shadow 0.5s cubic-bezier(0.4,0,0.2,1)"
};
const OnboardingPage = ({ token }) => {
  const { useState, useEffect } = React;
  const [status, setStatus] = useState("checking");
  const [errMsg, setErrMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    pw: "",
    pw2: "",
    phone: "",
    sector: "",
    website: "",
    fiscalName: "",
    nif: "",
    fiscalAddress: "",
    about: ""
  });
  const [step, setStep] = useState(0);
  const [err, setErr] = useState("");
  const [topErr, setTopErr] = useState("");
  const [code, setCode] = useState("");
  const [codeErr, setCodeErr] = useState("");
  const [resendMsg, setResendMsg] = useState("");
  const _sb = () => window.supabase.createClient(window.Data._SB_URL, window.Data._SB_KEY);
  useEffect(() => {
    const sb = _sb();
    sb.from("invites").select("service,used").eq("token", token).single().then(({ data, error }) => {
      if (!data || data.used || error) {
        setErrMsg("Enlace no v\xE1lido o ya utilizado");
        setStatus("error");
        return;
      }
      setStatus("form");
      sb.rpc("get_invite_prefill", { p_token: token }).then(({ data: pf }) => {
        const c = pf && pf.ok && pf.client;
        if (c) setForm((f) => ({
          ...f,
          name: c.name || f.name,
          company: c.company || f.company,
          phone: c.phone || f.phone,
          website: c.website || f.website,
          fiscalName: c.fiscal_name || f.fiscalName,
          nif: c.nif || f.nif,
          fiscalAddress: c.fiscal_address || f.fiscalAddress,
          about: c.about || f.about
        }));
      }).catch(() => {
      });
    }).catch(() => {
      setErrMsg("No se pudo conectar con el servidor.");
      setStatus("error");
    });
  }, [token]);
  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const first = (n) => (n || "").trim().split(/\s+/)[0] || "";
  const STEPS = [
    {
      key: "name",
      title: () => "\xBFC\xF3mo te llamas?",
      sub: "Tu nombre y apellidos.",
      fields: [{ id: "name", ph: "Juan Garc\xEDa", autoC: "name" }]
    },
    {
      key: "company",
      title: (f) => first(f.name) ? `Encantado, ${first(f.name)}.` : "\xBFCu\xE1l es tu empresa?",
      sub: "El nombre de tu empresa o marca.",
      fields: [{ id: "company", ph: "Mi Empresa S.L.", autoC: "organization" }]
    },
    {
      key: "about",
      title: () => "\xBFA qu\xE9 os dedic\xE1is?",
      sub: "Cu\xE9ntanos brevemente tu negocio y tu web (opcional).",
      fields: [
        { id: "about", ph: "Ej. Restaurante de cocina mediterr\xE1nea" },
        { id: "website", ph: "tuweb.com", autoC: "url" }
      ]
    },
    {
      key: "fiscal",
      title: () => "Datos de facturaci\xF3n",
      sub: "Para poder emitirte las facturas (opcional).",
      fields: [
        { id: "fiscalName", ph: "Raz\xF3n social (Mi Empresa S.L.)", autoC: "organization" },
        { id: "nif", ph: "NIF / CIF" },
        { id: "fiscalAddress", ph: "Direcci\xF3n fiscal" }
      ]
    },
    {
      key: "phone",
      title: () => "\xBFC\xF3mo te contactamos?",
      sub: "Tel\xE9fono o WhatsApp (opcional).",
      fields: [{ id: "phone", ph: "+34 600 000 000", type: "tel", autoC: "tel" }]
    },
    {
      key: "email",
      title: () => "Tu email de acceso",
      sub: "Te enviaremos un c\xF3digo para confirmarlo.",
      fields: [{ id: "email", ph: "tu@empresa.com", type: "email", autoC: "email" }]
    },
    {
      key: "pw",
      title: () => "Crea una contrase\xF1a",
      sub: "M\xEDnimo 6 caracteres.",
      fields: [
        { id: "pw", ph: "Contrase\xF1a", type: "password", autoC: "new-password" },
        { id: "pw2", ph: "Repite la contrase\xF1a", type: "password", autoC: "new-password" }
      ]
    }
  ];
  const isLast = step === STEPS.length - 1;
  const validateStep = () => {
    const k = STEPS[step].key;
    if (k === "name" && !form.name.trim()) return "Escribe tu nombre";
    if (k === "company" && !form.company.trim()) return "Escribe el nombre de tu empresa";
    if (k === "email" && (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))) return "Email no v\xE1lido";
    if (k === "pw") {
      if (form.pw.length < 6) return "M\xEDnimo 6 caracteres";
      if (form.pw !== form.pw2) return "Las contrase\xF1as no coinciden";
    }
    return "";
  };
  const next = () => {
    const e = validateStep();
    if (e) {
      setErr(e);
      return;
    }
    setErr("");
    if (!isLast) {
      setStep(step + 1);
      return;
    }
    startSignup();
  };
  const back = () => {
    setErr("");
    setStep((s2) => Math.max(0, s2 - 1));
  };
  const finishSignup = async (sb) => {
    const base = { p_token: token, p_name: form.name.trim(), p_company: form.company.trim(), p_phone: form.phone.trim() };
    const extra = {
      nif: form.nif.trim(),
      fiscal_name: form.fiscalName.trim(),
      fiscal_address: form.fiscalAddress.trim(),
      website: form.website.trim(),
      about: form.about.trim()
    };
    let { data: result, error: rpcError } = await sb.rpc("complete_invite", { ...base, p_extra: extra });
    if (rpcError && /function|does not exist|schema cache|p_extra/i.test(rpcError.message || "")) {
      ({ data: result, error: rpcError } = await sb.rpc("complete_invite", base));
    }
    if (rpcError || !result?.ok) return result?.error || rpcError?.message || "Error al completar el registro";
    await sb.auth.signOut();
    sessionStorage.removeItem("141_session");
    localStorage.removeItem("141_session");
    localStorage.removeItem("141_session_exp");
    return null;
  };
  const startSignup = async () => {
    setBusy(true);
    setTopErr("");
    try {
      const sb = _sb();
      const { data, error } = await sb.auth.signUp({
        email: form.email.trim(),
        password: form.pw,
        options: { data: { name: form.name.trim(), role: "client" } }
      });
      if (error) {
        setTopErr(error.message || "Error al crear la cuenta");
        setBusy(false);
        return;
      }
      if (data.session) {
        const e = await finishSignup(sb);
        if (e) {
          setTopErr(e);
          setBusy(false);
          return;
        }
        setStatus("done");
      } else {
        setCode("");
        setCodeErr("");
        setResendMsg("");
        setStatus("verify");
      }
    } catch (e) {
      setTopErr("No se pudo conectar con el servidor");
    }
    setBusy(false);
  };
  const verifyAndComplete = async () => {
    const raw = code.trim();
    if (raw.length < 6) {
      setCodeErr("Introduce el c\xF3digo que te ha llegado por correo");
      return;
    }
    setBusy(true);
    setCodeErr("");
    try {
      const sb = _sb();
      let vErr = null;
      if (/^\d{6}$/.test(raw)) {
        ({ error: vErr } = await sb.auth.verifyOtp({ email: form.email.trim(), token: raw, type: "signup" }));
      } else {
        ({ error: vErr } = await sb.auth.verifyOtp({ token_hash: raw, type: "signup" }));
        if (vErr) ({ error: vErr } = await sb.auth.verifyOtp({ token_hash: raw, type: "email" }));
      }
      if (vErr) {
        setCodeErr(vErr.message || "C\xF3digo incorrecto o caducado");
        setBusy(false);
        return;
      }
      const e = await finishSignup(sb);
      if (e) {
        setCodeErr(e);
        setBusy(false);
        return;
      }
      setStatus("done");
    } catch (e) {
      setCodeErr("No se pudo conectar con el servidor");
    }
    setBusy(false);
  };
  const resendCode = async () => {
    setResendMsg("Enviando\u2026");
    setCodeErr("");
    try {
      const { error } = await _sb().auth.resend({ type: "signup", email: form.email.trim() });
      setResendMsg(error ? error.message || "No se pudo reenviar" : "C\xF3digo reenviado \u2713");
    } catch {
      setResendMsg("No se pudo reenviar");
    }
  };
  const wrap = (children) => /* @__PURE__ */ React.createElement("div", { className: "auth-page", style: {
    minHeight: "100dvh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg)",
    padding: "24px 16px",
    overflowY: "auto"
  } }, /* @__PURE__ */ React.createElement("div", { className: "auth-container", style: { width: "100%", maxWidth: 384 } }, children, /* @__PURE__ */ React.createElement("div", { className: "subtle xsmall", style: { textAlign: "center", marginTop: 32 } }, "\xA9 141'DIGITAL \xB7 nil@141agency.com")));
  const Title = ({ children }) => /* @__PURE__ */ React.createElement("h1", { style: {
    fontSize: 30,
    fontWeight: 400,
    lineHeight: "36px",
    marginBottom: 8,
    fontFamily: "var(--font-display)",
    textAlign: "center",
    letterSpacing: "-0.96px",
    color: "#ffffff"
  } }, children);
  const Sub = ({ children, mb = 28 }) => /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, marginBottom: mb, textAlign: "center", color: "#999999" } }, children);
  if (status === "checking") return wrap(
    /* @__PURE__ */ React.createElement("div", { style: { color: "#999999", fontSize: 14, textAlign: "center" } }, "Verificando enlace\u2026")
  );
  if (status === "error") return wrap(
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column" } }, /* @__PURE__ */ React.createElement(Title, null, "Enlace no disponible"), /* @__PURE__ */ React.createElement(Sub, { mb: 28 }, errMsg), /* @__PURE__ */ React.createElement("a", { href: "/", className: "btn full auth-btn", style: {
      ..._AUTH_BTN,
      textDecoration: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8
    } }, "Ir al acceso"))
  );
  if (status === "done") return wrap(
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", animation: "pop .3s ease" } }, /* @__PURE__ */ React.createElement(Title, null, first(form.name) ? `\xA1Listo, ${first(form.name)}!` : "\xA1Cuenta verificada!"), /* @__PURE__ */ React.createElement(Sub, { mb: 28 }, "Tu cuenta est\xE1 confirmada. Ya puedes entrar al portal con tu email y contrase\xF1a."), /* @__PURE__ */ React.createElement("a", { href: "/", className: "btn full auth-btn", style: {
      ..._AUTH_BTN,
      textDecoration: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8
    } }, "Entrar al portal"))
  );
  const Progress = ({ pct: pct2 }) => /* @__PURE__ */ React.createElement("div", { style: { height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden", marginBottom: 26 } }, /* @__PURE__ */ React.createElement("div", { style: { height: "100%", width: `${pct2}%`, background: _PURP, borderRadius: 99, transition: "width .35s ease" } }));
  if (status === "verify") return wrap(
    /* @__PURE__ */ React.createElement("div", { style: { animation: "pop .25s ease" } }, /* @__PURE__ */ React.createElement(Progress, { pct: 100 }), /* @__PURE__ */ React.createElement(Title, null, "Confirma tu cuenta"), /* @__PURE__ */ React.createElement(Sub, { mb: 24 }, "Te hemos enviado un c\xF3digo de verificaci\xF3n a ", /* @__PURE__ */ React.createElement("b", { style: { color: "#fff" } }, form.email), "."), /* @__PURE__ */ React.createElement(
      "input",
      {
        className: "auth-input",
        maxLength: 128,
        autoFocus: true,
        placeholder: "C\xF3digo del correo",
        value: code,
        onChange: (e) => {
          setCode(e.target.value.replace(/\s/g, ""));
          if (codeErr) setCodeErr("");
        },
        onKeyDown: (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            verifyAndComplete();
          }
        },
        style: {
          ..._AUTH_INPUT,
          height: 56,
          textAlign: "center",
          fontSize: code.length > 8 ? 15 : 26,
          letterSpacing: code.length > 8 ? "0.5px" : "10px",
          fontFamily: "var(--font-mono)",
          marginBottom: 16,
          borderColor: codeErr ? "var(--red)" : void 0
        }
      }
    ), codeErr && /* @__PURE__ */ React.createElement("div", { className: "chip red", style: { display: "flex", padding: "6px 10px", marginBottom: 12, fontSize: 12 } }, /* @__PURE__ */ React.createElement(Icon, { name: "alert-triangle", size: 12 }), " ", codeErr), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "btn full auth-btn",
        onClick: verifyAndComplete,
        disabled: busy,
        style: { ..._AUTH_BTN, opacity: busy ? 0.5 : 1 }
      },
      busy ? "Verificando\u2026" : "Verificar y entrar"
    ), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", marginTop: 18 } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: resendCode,
        disabled: busy,
        style: {
          background: "transparent",
          border: 0,
          color: "#999999",
          fontSize: 13,
          cursor: "pointer",
          fontFamily: "inherit",
          textDecoration: "underline"
        }
      },
      "\xBFNo te llega? Reenviar c\xF3digo"
    ), resendMsg && /* @__PURE__ */ React.createElement("div", { className: "subtle xsmall", style: { marginTop: 6 } }, resendMsg)))
  );
  const s = STEPS[step];
  const title = typeof s.title === "function" ? s.title(form) : s.title;
  const pct = (step + 1) / (STEPS.length + 1) * 100;
  return wrap(
    /* @__PURE__ */ React.createElement("div", { key: step, style: { animation: "pop .25s ease" } }, /* @__PURE__ */ React.createElement(Progress, { pct }), /* @__PURE__ */ React.createElement(Title, null, title), /* @__PURE__ */ React.createElement(Sub, { mb: 26 }, s.sub), s.fields.map((fd, idx) => /* @__PURE__ */ React.createElement(
      "input",
      {
        key: fd.id,
        className: "auth-input",
        autoFocus: idx === 0,
        type: fd.type || "text",
        autoComplete: fd.autoC,
        placeholder: fd.ph,
        value: form[fd.id],
        onChange: (e) => {
          setField(fd.id, e.target.value);
          if (err) setErr("");
        },
        onKeyDown: (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            next();
          }
        },
        style: { ..._AUTH_INPUT, marginBottom: 16, borderColor: err ? "var(--red)" : void 0 }
      }
    )), err && /* @__PURE__ */ React.createElement("div", { className: "chip red", style: { display: "flex", padding: "6px 10px", marginBottom: 12, fontSize: 12 } }, /* @__PURE__ */ React.createElement(Icon, { name: "alert-triangle", size: 12 }), " ", err), topErr && /* @__PURE__ */ React.createElement("div", { className: "chip red", style: { display: "flex", padding: "6px 10px", marginBottom: 12, fontSize: 12 } }, /* @__PURE__ */ React.createElement(Icon, { name: "alert-triangle", size: 12 }), " ", topErr), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "btn full auth-btn",
        onClick: next,
        disabled: busy,
        style: { ..._AUTH_BTN, opacity: busy ? 0.5 : 1 }
      },
      busy ? "Enviando c\xF3digo\u2026" : isLast ? "Crear cuenta" : "Continuar"
    ), step > 0 && /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", marginTop: 16 } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: back,
        disabled: busy,
        style: {
          background: "transparent",
          border: 0,
          color: "#999999",
          fontSize: 13,
          cursor: "pointer",
          fontFamily: "inherit"
        }
      },
      "\u2190 Atr\xE1s"
    )))
  );
};
window.OnboardingPage = OnboardingPage;

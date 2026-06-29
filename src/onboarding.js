const OnboardingPage = ({ token }) => {
  const { useState, useEffect } = React;
  const [status, setStatus] = useState("checking");
  const [errMsg, setErrMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", company: "", email: "", pw: "", pw2: "", phone: "" });
  const [step, setStep] = useState(0);
  const [err, setErr] = useState("");
  const [topErr, setTopErr] = useState("");
  const [code, setCode] = useState("");
  const [codeErr, setCodeErr] = useState("");
  const [resendMsg, setResendMsg] = useState("");
  const _sb = () => window.supabase.createClient(window.Data._SB_URL, window.Data._SB_KEY);
  useEffect(() => {
    _sb().from("invites").select("service,used").eq("token", token).single().then(({ data, error }) => {
      if (!data || data.used || error) {
        setErrMsg("Enlace no v\xE1lido o ya utilizado");
        setStatus("error");
      } else {
        setStatus("form");
      }
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
      title: (f) => first(f.name) ? `Encantado, ${first(f.name)}. \xBFTu empresa?` : "\xBFCu\xE1l es tu empresa?",
      sub: "El nombre de tu empresa o marca.",
      fields: [{ id: "company", ph: "Mi Empresa S.L.", autoC: "organization" }]
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
    const { data: result, error: rpcError } = await sb.rpc("complete_invite", {
      p_token: token,
      p_name: form.name.trim(),
      p_company: form.company.trim(),
      p_phone: form.phone.trim()
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
    if (code.trim().length < 6) {
      setCodeErr("Introduce el c\xF3digo de 6 d\xEDgitos");
      return;
    }
    setBusy(true);
    setCodeErr("");
    try {
      const sb = _sb();
      const { error: vErr } = await sb.auth.verifyOtp({
        email: form.email.trim(),
        token: code.trim(),
        type: "signup"
      });
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
  const wrap = (children) => /* @__PURE__ */ React.createElement("div", { style: {
    minHeight: "100dvh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg)",
    padding: "24px 16px"
  } }, /* @__PURE__ */ React.createElement("div", { style: { width: "100%", maxWidth: 440, display: "flex", flexDirection: "column", gap: 28 } }, /* @__PURE__ */ React.createElement("img", { src: "/logo.svg", alt: "141'STUDIO", style: { height: 22, width: "auto" } }), children, /* @__PURE__ */ React.createElement("div", { className: "subtle xsmall", style: { textAlign: "center" } }, "\xA9 141'STUDIO \xB7 nil@141agency.com")));
  if (status === "checking") return wrap(
    /* @__PURE__ */ React.createElement("div", { style: { color: "var(--text-muted)", fontSize: 14 } }, "Verificando enlace\u2026")
  );
  if (status === "error") return wrap(
    /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: {
      width: 44,
      height: 44,
      borderRadius: 12,
      background: "var(--red-soft)",
      color: "var(--red)",
      display: "grid",
      placeItems: "center",
      marginBottom: 20
    } }, /* @__PURE__ */ React.createElement(Icon, { name: "alert-triangle", size: 20 })), /* @__PURE__ */ React.createElement("h1", { style: { fontSize: 22, fontWeight: 500, marginBottom: 8, fontFamily: "var(--font-display)" } }, "Enlace no disponible"), /* @__PURE__ */ React.createElement("p", { style: { color: "var(--text-muted)", fontSize: 14, marginBottom: 24 } }, errMsg), /* @__PURE__ */ React.createElement("a", { href: "/", className: "btn primary full", style: {
      height: 44,
      fontSize: 14,
      textDecoration: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8
    } }, "Ir al acceso ", /* @__PURE__ */ React.createElement(Icon, { name: "arrow", size: 13 })))
  );
  if (status === "done") return wrap(
    /* @__PURE__ */ React.createElement("div", { style: { animation: "pop .3s ease" } }, /* @__PURE__ */ React.createElement("div", { style: {
      width: 48,
      height: 48,
      borderRadius: 14,
      background: "var(--green-soft)",
      color: "var(--green)",
      display: "grid",
      placeItems: "center",
      marginBottom: 20
    } }, /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 22 })), /* @__PURE__ */ React.createElement("h1", { style: { fontSize: 24, fontWeight: 500, marginBottom: 8, fontFamily: "var(--font-display)" } }, first(form.name) ? `\xA1Listo, ${first(form.name)}!` : "\xA1Cuenta verificada!"), /* @__PURE__ */ React.createElement("p", { style: { color: "var(--text-muted)", fontSize: 14, marginBottom: 24 } }, "Tu cuenta est\xE1 confirmada. Ya puedes entrar al portal con tu email y contrase\xF1a."), /* @__PURE__ */ React.createElement("a", { href: "/", className: "btn primary full", style: {
      height: 46,
      fontSize: 14,
      textDecoration: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8
    } }, "Entrar al portal ", /* @__PURE__ */ React.createElement(Icon, { name: "arrow", size: 13 })))
  );
  if (status === "verify") return wrap(
    /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { height: 3, background: "var(--bg-elev-2)", borderRadius: 99, overflow: "hidden", marginBottom: 30 } }, /* @__PURE__ */ React.createElement("div", { style: { height: "100%", width: "100%", background: "var(--accent)", borderRadius: 99 } })), /* @__PURE__ */ React.createElement("div", { style: { animation: "pop .25s ease", display: "flex", flexDirection: "column", gap: 18 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: {
      width: 48,
      height: 48,
      borderRadius: 14,
      background: "var(--accent-soft)",
      color: "var(--accent)",
      display: "grid",
      placeItems: "center",
      marginBottom: 16
    } }, /* @__PURE__ */ React.createElement(Icon, { name: "mail", size: 22 })), /* @__PURE__ */ React.createElement("div", { className: "subtle xsmall", style: { marginBottom: 10, letterSpacing: "0.6px", textTransform: "uppercase" } }, "\xDAltimo paso \xB7 verificaci\xF3n"), /* @__PURE__ */ React.createElement("h1", { style: { fontSize: 26, fontWeight: 500, lineHeight: 1.2, marginBottom: 6, fontFamily: "var(--font-display)" } }, "Confirma tu cuenta"), /* @__PURE__ */ React.createElement("div", { className: "muted", style: { fontSize: 14, lineHeight: 1.5 } }, "Te hemos enviado un c\xF3digo de 6 d\xEDgitos a ", /* @__PURE__ */ React.createElement("b", { style: { color: "var(--text)" } }, form.email), ". Introd\xFAcelo para activar tu cuenta.")), /* @__PURE__ */ React.createElement(
      "input",
      {
        className: "input",
        inputMode: "numeric",
        maxLength: 6,
        autoFocus: true,
        placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022",
        value: code,
        onChange: (e) => {
          setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
          if (codeErr) setCodeErr("");
        },
        onKeyDown: (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            verifyAndComplete();
          }
        },
        style: {
          height: 58,
          fontSize: 26,
          letterSpacing: "10px",
          textAlign: "center",
          fontFamily: "var(--font-mono)",
          borderColor: codeErr ? "var(--red)" : void 0
        }
      }
    ), codeErr && /* @__PURE__ */ React.createElement("div", { style: { color: "var(--red)", fontSize: 12.5 } }, codeErr), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "btn primary full",
        onClick: verifyAndComplete,
        disabled: busy,
        style: { height: 48, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }
      },
      busy ? "Verificando\u2026" : "Verificar y entrar",
      " ",
      !busy && /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 13 })
    ), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: resendCode,
        disabled: busy,
        style: {
          background: "transparent",
          border: 0,
          color: "var(--text-muted)",
          fontSize: 13,
          cursor: "pointer",
          fontFamily: "inherit",
          textDecoration: "underline"
        }
      },
      "\xBFNo te llega? Reenviar c\xF3digo"
    ), resendMsg && /* @__PURE__ */ React.createElement("div", { className: "subtle xsmall", style: { marginTop: 6 } }, resendMsg))))
  );
  const s = STEPS[step];
  const title = typeof s.title === "function" ? s.title(form) : s.title;
  return wrap(
    /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { height: 3, background: "var(--bg-elev-2)", borderRadius: 99, overflow: "hidden", marginBottom: 30 } }, /* @__PURE__ */ React.createElement("div", { style: {
      height: "100%",
      width: `${(step + 1) / (STEPS.length + 1) * 100}%`,
      background: "var(--accent)",
      borderRadius: 99,
      transition: "width .35s ease"
    } })), /* @__PURE__ */ React.createElement("div", { key: step, style: { animation: "pop .25s ease", display: "flex", flexDirection: "column", gap: 18 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "subtle xsmall", style: { marginBottom: 10, letterSpacing: "0.6px", textTransform: "uppercase" } }, "Paso ", step + 1, " de ", STEPS.length + 1), /* @__PURE__ */ React.createElement("h1", { style: { fontSize: 26, fontWeight: 500, lineHeight: 1.2, marginBottom: 6, fontFamily: "var(--font-display)" } }, title), /* @__PURE__ */ React.createElement("div", { className: "muted", style: { fontSize: 14 } }, s.sub)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, s.fields.map((fd, idx) => /* @__PURE__ */ React.createElement(
      "input",
      {
        key: fd.id,
        className: "input",
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
        style: { height: 52, fontSize: 16, borderColor: err ? "var(--red)" : void 0 }
      }
    )), err && /* @__PURE__ */ React.createElement("div", { style: { color: "var(--red)", fontSize: 12.5 } }, err)), topErr && /* @__PURE__ */ React.createElement("div", { className: "chip red", style: { display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", fontSize: 12 } }, /* @__PURE__ */ React.createElement(Icon, { name: "alert-triangle", size: 12 }), " ", topErr), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, marginTop: 4 } }, step > 0 && /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "btn",
        onClick: back,
        disabled: busy,
        style: { height: 48, fontSize: 14, padding: "0 16px" }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "chevron", size: 13, style: { transform: "rotate(180deg)" } }),
      " Atr\xE1s"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "btn primary full",
        onClick: next,
        disabled: busy,
        style: { height: 48, fontSize: 14, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }
      },
      busy ? "Enviando c\xF3digo\u2026" : isLast ? "Crear cuenta" : "Continuar",
      !busy && /* @__PURE__ */ React.createElement(Icon, { name: isLast ? "arrow" : "arrow", size: 13 })
    ))))
  );
};
window.OnboardingPage = OnboardingPage;

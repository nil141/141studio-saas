const OnboardingPage = ({ token }) => {
  const { useState, useEffect } = React;
  const [status, setStatus] = useState("checking");
  const [errMsg, setErrMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", company: "", email: "", pw: "", pw2: "", phone: "" });
  const [step, setStep] = useState(0);
  const [err, setErr] = useState("");
  const [topErr, setTopErr] = useState("");
  useEffect(() => {
    const _sbInv = window.supabase.createClient(window.Data._SB_URL, window.Data._SB_KEY);
    _sbInv.from("invites").select("service,used").eq("token", token).single().then(({ data, error }) => {
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
      sub: "Lo usar\xE1s para entrar al portal.",
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
    doSubmit();
  };
  const back = () => {
    setErr("");
    setStep((s2) => Math.max(0, s2 - 1));
  };
  const doSubmit = async () => {
    setBusy(true);
    setTopErr("");
    try {
      const _sbInv = window.supabase.createClient(window.Data._SB_URL, window.Data._SB_KEY);
      const { error: authError } = await _sbInv.auth.signUp({
        email: form.email.trim(),
        password: form.pw,
        options: { data: { name: form.name.trim(), role: "client" } }
      });
      if (authError) {
        setTopErr(authError.message || "Error al crear la cuenta");
        setBusy(false);
        return;
      }
      const { data: result, error: rpcError } = await _sbInv.rpc("complete_invite", {
        p_token: token,
        p_name: form.name.trim(),
        p_company: form.company.trim(),
        p_phone: form.phone.trim()
      });
      if (rpcError || !result?.ok) {
        setTopErr(result?.error || rpcError?.message || "Error al completar el registro");
        setBusy(false);
        return;
      }
      await _sbInv.auth.signOut();
      sessionStorage.removeItem("141_session");
      localStorage.removeItem("141_session");
      localStorage.removeItem("141_session_exp");
      setStatus("done");
    } catch (err2) {
      setTopErr("No se pudo conectar con el servidor");
    }
    setBusy(false);
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
    } }, /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 22 })), /* @__PURE__ */ React.createElement("h1", { style: { fontSize: 24, fontWeight: 500, marginBottom: 8, fontFamily: "var(--font-display)" } }, first(form.name) ? `\xA1Listo, ${first(form.name)}!` : "\xA1Cuenta creada!"), /* @__PURE__ */ React.createElement("p", { style: { color: "var(--text-muted)", fontSize: 14, marginBottom: 24 } }, "Tu cuenta est\xE1 creada. Ya puedes entrar al portal con tu email y contrase\xF1a."), /* @__PURE__ */ React.createElement("a", { href: "/", className: "btn primary full", style: {
      height: 46,
      fontSize: 14,
      textDecoration: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8
    } }, "Entrar al portal ", /* @__PURE__ */ React.createElement(Icon, { name: "arrow", size: 13 })))
  );
  const s = STEPS[step];
  const title = typeof s.title === "function" ? s.title(form) : s.title;
  return wrap(
    /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { height: 3, background: "var(--bg-elev-2)", borderRadius: 99, overflow: "hidden", marginBottom: 30 } }, /* @__PURE__ */ React.createElement("div", { style: {
      height: "100%",
      width: `${(step + 1) / STEPS.length * 100}%`,
      background: "var(--accent)",
      borderRadius: 99,
      transition: "width .35s ease"
    } })), /* @__PURE__ */ React.createElement("div", { key: step, style: { animation: "pop .25s ease", display: "flex", flexDirection: "column", gap: 18 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "subtle xsmall", style: { marginBottom: 10, letterSpacing: "0.6px", textTransform: "uppercase" } }, "Paso ", step + 1, " de ", STEPS.length), /* @__PURE__ */ React.createElement("h1", { style: { fontSize: 26, fontWeight: 500, lineHeight: 1.2, marginBottom: 6, fontFamily: "var(--font-display)" } }, title), /* @__PURE__ */ React.createElement("div", { className: "muted", style: { fontSize: 14 } }, s.sub)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, s.fields.map((fd, idx) => /* @__PURE__ */ React.createElement(
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
      busy ? "Creando cuenta\u2026" : isLast ? "Crear mi cuenta" : "Continuar",
      !busy && /* @__PURE__ */ React.createElement(Icon, { name: isLast ? "check" : "arrow", size: 13 })
    ))))
  );
};
window.OnboardingPage = OnboardingPage;

(function() {
const OnboardingField = ({ label, id, type, ph, autoC, value, onChange, err }) => /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, label), /* @__PURE__ */ React.createElement(
  "input",
  {
    className: "input",
    type: type || "text",
    autoComplete: autoC,
    placeholder: ph,
    value,
    onChange: (e) => onChange(id, e.target.value),
    style: { height: 44, fontSize: 14, borderColor: err ? "var(--red)" : void 0 }
  }
), err && /* @__PURE__ */ React.createElement("div", { style: { color: "var(--red)", fontSize: 11, marginTop: 4 } }, err));
const OnboardingPage = ({ token }) => {
  const { useState, useEffect } = React;
  const [status, setStatus] = useState("checking");
  const [errMsg, setErrMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", company: "", email: "", pw: "", pw2: "", phone: "" });
  const [fieldErr, setFieldErr] = useState({});
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
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Obligatorio";
    if (!form.company.trim()) e.company = "Obligatorio";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Email no v\xE1lido";
    if (form.pw.length < 6) e.pw = "M\xEDnimo 6 caracteres";
    if (form.pw !== form.pw2) e.pw2 = "Las contrase\xF1as no coinciden";
    setFieldErr(e);
    return Object.keys(e).length === 0;
  };
  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setBusy(true);
    try {
      const _sbInv = window.supabase.createClient(window.Data._SB_URL, window.Data._SB_KEY);
      const { data: authData, error: authError } = await _sbInv.auth.signUp({
        email: form.email.trim(),
        password: form.pw,
        options: { data: { name: form.name.trim(), role: "client" } }
      });
      if (authError) {
        setFieldErr({ _: authError.message || "Error al crear la cuenta" });
        setBusy(false);
        return;
      }
      const { data: result, error: rpcError } = await _sbInv.rpc("complete_invite", {
        p_token: token,
        p_name: form.name.trim(),
        p_company: form.company.trim(),
        p_phone: form.phone.trim()
      });
      if (rpcError || !(result == null ? void 0 : result.ok)) {
        setFieldErr({ _: (result == null ? void 0 : result.error) || (rpcError == null ? void 0 : rpcError.message) || "Error al completar el registro" });
        setBusy(false);
        return;
      }
      await _sbInv.auth.signOut();
      sessionStorage.removeItem("141_session");
      localStorage.removeItem("141_session");
      localStorage.removeItem("141_session_exp");
      setStatus("done");
    } catch (err) {
      setFieldErr({ _: "No se pudo conectar con el servidor" });
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
    /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: {
      width: 44,
      height: 44,
      borderRadius: 12,
      background: "var(--green-soft)",
      color: "var(--green)",
      display: "grid",
      placeItems: "center",
      marginBottom: 20
    } }, /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 20 })), /* @__PURE__ */ React.createElement("h1", { style: { fontSize: 22, fontWeight: 500, marginBottom: 8, fontFamily: "var(--font-display)" } }, "\xA1Cuenta creada!"), /* @__PURE__ */ React.createElement("p", { style: { color: "var(--text-muted)", fontSize: 14, marginBottom: 24 } }, "Ya puedes iniciar sesi\xF3n con tu email y contrase\xF1a."), /* @__PURE__ */ React.createElement("a", { href: "/", className: "btn primary full", style: {
      height: 44,
      fontSize: 14,
      textDecoration: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    } }, "Ir al acceso ", /* @__PURE__ */ React.createElement(Icon, { name: "arrow", size: 13 })))
  );
  return wrap(
    /* @__PURE__ */ React.createElement("form", { onSubmit: submit, style: { display: "flex", flexDirection: "column", gap: 16 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", { style: { fontSize: 26, fontWeight: 500, lineHeight: 1.2, marginBottom: 6, fontFamily: "var(--font-display)" } }, "Crea tu cuenta."), /* @__PURE__ */ React.createElement("div", { className: "muted", style: { fontSize: 14 } }, "Completa tu ficha de cliente para acceder al portal.")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ React.createElement(
      OnboardingField,
      {
        label: "Nombre completo",
        id: "name",
        ph: "Juan Garc\xEDa",
        autoC: "name",
        value: form.name,
        onChange: setField,
        err: fieldErr.name
      }
    ), /* @__PURE__ */ React.createElement(
      OnboardingField,
      {
        label: "Empresa",
        id: "company",
        ph: "Mi Empresa S.L.",
        autoC: "organization",
        value: form.company,
        onChange: setField,
        err: fieldErr.company
      }
    ), /* @__PURE__ */ React.createElement(
      OnboardingField,
      {
        label: "Tel\xE9fono / WhatsApp",
        id: "phone",
        ph: "+34 600 000 000",
        autoC: "tel",
        value: form.phone,
        onChange: setField,
        err: fieldErr.phone
      }
    ), /* @__PURE__ */ React.createElement(
      OnboardingField,
      {
        label: "Email de acceso",
        id: "email",
        type: "email",
        ph: "tu@empresa.com",
        autoC: "email",
        value: form.email,
        onChange: setField,
        err: fieldErr.email
      }
    ), /* @__PURE__ */ React.createElement(
      OnboardingField,
      {
        label: "Contrase\xF1a",
        id: "pw",
        type: "password",
        ph: "M\xEDnimo 6 caracteres",
        autoC: "new-password",
        value: form.pw,
        onChange: setField,
        err: fieldErr.pw
      }
    ), /* @__PURE__ */ React.createElement(
      OnboardingField,
      {
        label: "Confirmar contrase\xF1a",
        id: "pw2",
        type: "password",
        ph: "Repite la contrase\xF1a",
        autoC: "new-password",
        value: form.pw2,
        onChange: setField,
        err: fieldErr.pw2
      }
    )), fieldErr._ && /* @__PURE__ */ React.createElement("div", { className: "chip red", style: { display: "flex", padding: "8px 12px", fontSize: 12 } }, /* @__PURE__ */ React.createElement(Icon, { name: "alert-triangle", size: 12 }), " ", fieldErr._), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn primary full", style: { height: 44, fontSize: 14 }, disabled: busy }, busy ? "Creando cuenta\u2026" : "Crear mi cuenta"))
  );
};
window.OnboardingPage = OnboardingPage;

})();
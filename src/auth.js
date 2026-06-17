const DURATION_OPTIONS = [
  { days: 0, label: "Solo esta sesi\xF3n", sub: "Se cerrar\xE1 al cerrar el navegador" },
  { days: 7, label: "7 d\xEDas", sub: "Una semana sin volver a entrar" },
  { days: 30, label: "30 d\xEDas", sub: "Comodidad m\xE1xima" }
];
const AuthGate = ({ onAuth }) => {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState("login");
  const [pendingAcc, setPendingAcc] = useState(null);
  const [days, setDays] = useState(7);
  const submit = async (e) => {
    e == null ? void 0 : e.preventDefault();
    setErr("");
    setBusy(true);
    const { ok, error, session } = await window.Data.authLogin(email.trim(), pw);
    if (ok) {
      setPendingAcc(session);
      setStep("remember");
      setBusy(false);
      return;
    }
    setErr(error || "Email o contrase\xF1a incorrectos.");
    setBusy(false);
  };
  if (step === "remember") return /* @__PURE__ */ React.createElement("div", { className: "auth-page", style: {
    minHeight: "100dvh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg)",
    padding: "24px 16px",
    overflowY: "auto"
  } }, /* @__PURE__ */ React.createElement("div", { className: "auth-container", style: { width: "100%", maxWidth: 384 } }, /* @__PURE__ */ React.createElement("h1", { style: { fontSize: 30, fontWeight: 400, lineHeight: "36px", marginBottom: 8, fontFamily: "var(--font-display)", textAlign: "center", letterSpacing: "-0.96px", color: "#ffffff" } }, "\xBFMantener sesi\xF3n?"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, marginBottom: 32, textAlign: "center", color: "#999999" } }, "Elige cu\xE1nto tiempo recordar tu acceso."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 } }, DURATION_OPTIONS.map((opt) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: opt.days,
      onClick: () => setDays(opt.days),
      style: {
        padding: "14px 16px",
        borderRadius: 16,
        cursor: "pointer",
        border: `1px solid ${days === opt.days ? "rgb(130,119,219)" : "rgba(255,255,255,0.1)"}`,
        background: days === opt.days ? "rgba(130,119,219,0.12)" : "rgba(255,255,255,0.03)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        transition: "all .15s",
        boxShadow: days === opt.days ? "rgba(130,119,219,0.18) 0px 0px 16px 0px" : "none"
      }
    },
    /* @__PURE__ */ React.createElement("div", { style: {
      width: 18,
      height: 18,
      borderRadius: "50%",
      border: `2px solid ${days === opt.days ? "rgb(130,119,219)" : "rgba(255,255,255,0.25)"}`,
      display: "grid",
      placeItems: "center",
      flexShrink: 0
    } }, days === opt.days && /* @__PURE__ */ React.createElement("div", { style: { width: 8, height: 8, borderRadius: "50%", background: "rgb(130,119,219)" } })),
    /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontWeight: 400, color: days === opt.days ? "rgb(130,119,219)" : "#ffffff", letterSpacing: "-0.3px" } }, opt.label), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#666", marginTop: 2 } }, opt.sub))
  ))), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn full auth-btn",
      style: {
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
      },
      onClick: () => onAuth(pendingAcc, days)
    },
    "Entrar"
  ), /* @__PURE__ */ React.createElement("div", { className: "subtle xsmall", style: { textAlign: "center", marginTop: 32 } }, /* @__PURE__ */ React.createElement("a", { href: "https://141agency.com/", target: "_blank", rel: "noopener noreferrer", style: { color: "inherit", textDecoration: "none" } }, "\xA9 141'DIGITAL"), " \xB7 nil@141agency.com")));
  return /* @__PURE__ */ React.createElement("div", { className: "auth-page", style: {
    minHeight: "100dvh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg)",
    padding: "24px 16px",
    overflowY: "auto"
  } }, /* @__PURE__ */ React.createElement("div", { className: "auth-container", style: { width: "100%", maxWidth: 384 } }, /* @__PURE__ */ React.createElement("form", { onSubmit: submit, style: { display: "flex", flexDirection: "column" } }, /* @__PURE__ */ React.createElement("h1", { style: { fontSize: 30, fontWeight: 400, lineHeight: "36px", marginBottom: 8, fontFamily: "var(--font-display)", textAlign: "center", letterSpacing: "-0.96px", color: "#ffffff" } }, "Inicia sesi\xF3n."), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, marginBottom: 32, textAlign: "center", color: "#999999" } }, "Accede con tus credenciales."), /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "auth-input",
      type: "email",
      autoComplete: "email",
      value: email,
      onChange: (e) => setEmail(e.target.value),
      placeholder: "tu@empresa.com",
      style: {
        width: "100%",
        fontFamily: "inherit",
        height: 50,
        marginBottom: 16,
        fontSize: 16,
        borderRadius: 16,
        padding: "12px 20px",
        background: "rgba(255,255,255,0.05)",
        color: "#ffffff"
      }
    }
  ), /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "auth-input",
      type: "password",
      autoComplete: "current-password",
      value: pw,
      onChange: (e) => setPw(e.target.value),
      placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
      style: {
        width: "100%",
        fontFamily: "inherit",
        height: 50,
        marginBottom: 16,
        fontSize: 16,
        borderRadius: 16,
        padding: "12px 20px",
        background: "rgba(255,255,255,0.05)",
        color: "#ffffff"
      }
    }
  ), err && /* @__PURE__ */ React.createElement("div", { className: "chip red", style: { display: "flex", padding: "6px 10px", marginBottom: 12, fontSize: 12 } }, /* @__PURE__ */ React.createElement(Icon, { name: "alert-triangle", size: 12 }), " ", err), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "submit",
      className: "btn full auth-btn",
      style: {
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
      },
      disabled: !email || !pw || busy
    },
    busy ? "Entrando\u2026" : "Entrar"
  )), /* @__PURE__ */ React.createElement("div", { className: "subtle xsmall", style: { textAlign: "center", marginTop: 32 } }, /* @__PURE__ */ React.createElement("a", { href: "https://141agency.com/", target: "_blank", rel: "noopener noreferrer", style: { color: "inherit", textDecoration: "none" } }, "\xA9 141'DIGITAL"), " \xB7 nil@141agency.com")));
};
window.AuthGate = AuthGate;

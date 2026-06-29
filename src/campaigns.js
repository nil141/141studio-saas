const _loadCampaigns = () => {
  try {
    return JSON.parse(localStorage.getItem("141_campaigns") || "null") || [];
  } catch {
    return [];
  }
};
const _saveCampaigns = (data) => localStorage.setItem("141_campaigns", JSON.stringify(data));
const MiniBarChart = ({ data, color = "var(--accent)" }) => {
  const max = Math.max(...data.map((d) => d.v), 1);
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "flex-end", gap: 3, height: 60 } }, data.map((d, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 } }, /* @__PURE__ */ React.createElement("div", { style: {
    width: "100%",
    borderRadius: 3,
    height: Math.max(4, d.v / max * 50),
    background: color,
    opacity: 0.85
  } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 9, color: "var(--text-subtle)" } }, d.l))));
};
const MiniLineChart = ({ data, color = "var(--accent)", height = 70 }) => {
  const vals = data.map((d2) => d2.v);
  const max = Math.max(...vals, 1);
  const min = Math.min(...vals, 0);
  const range = max - min || 1;
  const W = 300, H = height;
  const pts = vals.map((v, i) => [
    i / (vals.length - 1) * W,
    H - (v - min) / range * (H - 10) - 5
  ]);
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const fill = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ") + ` L${W},${H} L0,${H} Z`;
  return /* @__PURE__ */ React.createElement("svg", { viewBox: `0 0 ${W} ${H}`, style: { width: "100%", height }, preserveAspectRatio: "none" }, /* @__PURE__ */ React.createElement("path", { d: fill, fill: color, fillOpacity: 0.12 }), /* @__PURE__ */ React.createElement("path", { d, fill: "none", stroke: color, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }), pts.map((p, i) => /* @__PURE__ */ React.createElement("circle", { key: i, cx: p[0], cy: p[1], r: 3, fill: color })));
};
const StatCard = ({ label, value, sub, color }) => /* @__PURE__ */ React.createElement("div", { style: {
  padding: "16px 18px",
  background: "var(--bg-elev)",
  border: "0.5px solid var(--border)",
  borderRadius: 12,
  display: "flex",
  flexDirection: "column",
  gap: 4
} }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.06em" } }, label), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 26, fontWeight: 600, color: color || "var(--text)", fontFamily: "var(--font-display)", letterSpacing: "-0.02em" } }, value), sub && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-muted)" } }, sub));
const TabAnalytics = ({ c }) => {
  const weekDays = ["L", "M", "X", "J", "V", "S", "D"];
  const sent = weekDays.map((l, i) => ({ l, v: Math.round(c.emailsSent / 7 * (0.6 + Math.random() * 0.8)) }));
  const opens = weekDays.map((l, i) => ({ l, v: Math.round(sent[i].v * (c.openRate / 100)) }));
  const monthly = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"].map((l, i) => ({
    l,
    v: Math.round(c.emailsSent / 6 * (0.4 + i * 0.2))
  }));
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 20 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 } }, /* @__PURE__ */ React.createElement(StatCard, { label: "Emails enviados", value: c.emailsSent.toLocaleString(), sub: "Total acumulado" }), /* @__PURE__ */ React.createElement(StatCard, { label: "Tasa apertura", value: c.openRate + "%", sub: "Promedio campa\xF1a", color: "var(--green)" }), /* @__PURE__ */ React.createElement(StatCard, { label: "Tasa clic", value: c.clickRate + "%", sub: "Sobre emails abiertos", color: "var(--accent)" }), /* @__PURE__ */ React.createElement(StatCard, { label: "Respuestas", value: c.replyRate + "%", sub: "Reply rate", color: "var(--amber)" })), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 } }, /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: 18 } }, /* @__PURE__ */ React.createElement("div", { className: "card-title", style: { marginBottom: 14 } }, "Emails enviados \u2014 \xFAltimos 7 d\xEDas"), /* @__PURE__ */ React.createElement(MiniBarChart, { data: sent, color: "var(--accent)" })), /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: 18 } }, /* @__PURE__ */ React.createElement("div", { className: "card-title", style: { marginBottom: 14 } }, "Aperturas \u2014 \xFAltimos 7 d\xEDas"), /* @__PURE__ */ React.createElement(MiniBarChart, { data: opens, color: "var(--green)" })), /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: 18, gridColumn: "1 / -1" } }, /* @__PURE__ */ React.createElement("div", { className: "card-title", style: { marginBottom: 14 } }, "Evoluci\xF3n mensual"), /* @__PURE__ */ React.createElement(MiniLineChart, { data: monthly, color: "var(--accent)", height: 80 }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 16, marginTop: 8 } }, monthly.map((d, i) => /* @__PURE__ */ React.createElement("span", { key: i, style: { fontSize: 10, color: "var(--text-subtle)", flex: 1, textAlign: "center" } }, d.l))))));
};
const TabSequence = ({ c }) => {
  const steps = [
    { day: 0, subject: "{{firstName}}, \xBFtienes 15 minutos esta semana?", type: "email", status: "sent" },
    { day: 3, subject: "Seguimiento \u2014 proyecto de crecimiento", type: "email", status: "sent" },
    { day: 7, subject: "\xDAltima pregunta, {{firstName}}", type: "email", status: "scheduled" },
    { day: 14, subject: "Cerramos el hilo", type: "email", status: "draft" }
  ];
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 } }, /* @__PURE__ */ React.createElement("div", { className: "card-title" }, "Secuencia de emails"), /* @__PURE__ */ React.createElement("button", { className: "btn sm" }, /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 12 }), " A\xF1adir paso")), steps.map((s, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "14px 16px",
    background: "var(--bg-elev)",
    border: "0.5px solid var(--border)",
    borderRadius: 10
  } }, /* @__PURE__ */ React.createElement("div", { style: {
    width: 36,
    height: 36,
    borderRadius: 10,
    flexShrink: 0,
    background: s.status === "sent" ? "var(--green-soft)" : s.status === "scheduled" ? "rgba(96,165,250,0.1)" : "var(--bg-elev-2)",
    color: s.status === "sent" ? "var(--green)" : s.status === "scheduled" ? "var(--accent)" : "var(--text-muted)",
    display: "grid",
    placeItems: "center",
    fontSize: 12,
    fontWeight: 600
  } }, s.day === 0 ? "D1" : `+${s.day}d`), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 500, color: "var(--text)" } }, s.subject), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-muted)", marginTop: 2 } }, s.status === "sent" ? "Enviado" : s.status === "scheduled" ? "Programado" : "Borrador")), /* @__PURE__ */ React.createElement(Icon, { name: "mail", size: 14, style: { color: "var(--text-subtle)" } }), /* @__PURE__ */ React.createElement(Icon, { name: "edit", size: 13, style: { color: "var(--text-subtle)", cursor: "pointer" } }))));
};
const TabLeads = ({ c }) => {
  const leads = [
    { name: "Sarah Mitchell", company: "SaaS Corp", status: "replied", email: "s.mitchell@saascorp.com" },
    { name: "James Thornton", company: "TechVentures", status: "opened", email: "j.thornton@techv.io" },
    { name: "Laura Garc\xEDa", company: "DataFlow Ltd", status: "sent", email: "l.garcia@dataflow.co" },
    { name: "Mark Reynolds", company: "CloudPeak", status: "bounced", email: "m.reynolds@cloudpeak.com" },
    { name: "Anna Kowalski", company: "GrowthBase", status: "replied", email: "a.kowalski@growthbase.eu" },
    { name: "Tom Nielsen", company: "NorthStar AB", status: "opened", email: "t.nielsen@northstar.se" }
  ];
  const statusMap = {
    replied: { label: "Respondi\xF3", color: "var(--green)" },
    opened: { label: "Abri\xF3", color: "var(--blue)" },
    sent: { label: "Enviado", color: "var(--text-subtle)" },
    bounced: { label: "Rebot\xF3", color: "var(--red)" }
  };
  const _AV = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#14b8a6", "#ef4444"];
  const _initials = (n) => (n || "").trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const COLS = "minmax(0,1.7fr) minmax(0,1.2fr) minmax(0,1.7fr) 120px";
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { className: "card-title" }, "Leads \xB7 ", c.leads, " en total"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { className: "btn sm" }, /* @__PURE__ */ React.createElement(Icon, { name: "upload", size: 12 }), " Importar CSV"), /* @__PURE__ */ React.createElement("button", { className: "btn sm primary" }, /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 12 }), " A\xF1adir lead"))), /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: 0, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: {
    display: "grid",
    gridTemplateColumns: COLS,
    gap: 18,
    padding: "13px 22px",
    borderBottom: "0.5px solid var(--border)"
  } }, ["Nombre", "Empresa", "Email", "Estado"].map((h, idx) => /* @__PURE__ */ React.createElement("div", { key: h, style: {
    fontSize: 10.5,
    fontWeight: 600,
    letterSpacing: "0.7px",
    textTransform: "uppercase",
    color: "var(--text-subtle)",
    textAlign: idx === 3 ? "right" : "left"
  } }, h))), leads.map((l, i) => {
    const st = statusMap[l.status] || { label: l.status, color: "var(--text-subtle)" };
    const col = _AV[i % _AV.length];
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: i,
        style: {
          display: "grid",
          gridTemplateColumns: COLS,
          gap: 18,
          alignItems: "center",
          padding: "13px 22px",
          transition: "background .12s",
          borderBottom: i === leads.length - 1 ? "0" : "0.5px solid var(--border)"
        },
        onMouseEnter: (e) => e.currentTarget.style.background = "var(--bg-elev-2)",
        onMouseLeave: (e) => e.currentTarget.style.background = "transparent"
      },
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: {
        width: 34,
        height: 34,
        borderRadius: "50%",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "-0.02em",
        background: col + "22",
        color: col,
        border: "0.5px solid " + col + "33"
      } }, _initials(l.name)), /* @__PURE__ */ React.createElement("span", { style: {
        fontSize: 13.5,
        fontWeight: 500,
        color: "var(--text)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      } }, l.name)),
      /* @__PURE__ */ React.createElement("div", { style: {
        fontSize: 13,
        color: "var(--text-muted)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      } }, l.company),
      /* @__PURE__ */ React.createElement("div", { style: {
        fontSize: 12.5,
        color: "var(--text-subtle)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      } }, l.email),
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("span", { style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 11px 4px 9px",
        borderRadius: 99,
        fontSize: 12,
        fontWeight: 500,
        background: "var(--bg-elev)",
        border: "0.5px solid var(--border)",
        color: "var(--text-muted)"
      } }, /* @__PURE__ */ React.createElement("span", { style: { width: 6, height: 6, borderRadius: "50%", background: st.color, flexShrink: 0 } }), st.label))
    );
  })));
};
const TabSchedule = ({ c }) => {
  const days = ["Lunes", "Martes", "Mi\xE9rcoles", "Jueves", "Viernes"];
  const active = [true, true, true, true, true];
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 20, maxWidth: 560 } }, /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: 20 } }, /* @__PURE__ */ React.createElement("div", { className: "card-title", style: { marginBottom: 14 } }, "Horario de env\xEDo"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, days.map((d, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", alignItems: "center", gap: 12 } }, /* @__PURE__ */ React.createElement(Switch, { on: active[i], onChange: () => {
  } }), /* @__PURE__ */ React.createElement("span", { style: { width: 90, fontSize: 13 } }, d), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "var(--text-muted)" } }, "09:00 \u2013 18:00"))))), /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: 20 } }, /* @__PURE__ */ React.createElement("div", { className: "card-title", style: { marginBottom: 14 } }, "Configuraci\xF3n"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Zona horaria"), /* @__PURE__ */ React.createElement("select", { className: "select" }, /* @__PURE__ */ React.createElement("option", null, "Europe/Madrid (CET)"), /* @__PURE__ */ React.createElement("option", null, "Europe/London (GMT)"))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, "M\xE1x. emails por d\xEDa"), /* @__PURE__ */ React.createElement("input", { className: "input", type: "number", defaultValue: 50, style: { maxWidth: 120 } })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Intervalo entre env\xEDos"), /* @__PURE__ */ React.createElement("select", { className: "select", style: { maxWidth: 200 } }, /* @__PURE__ */ React.createElement("option", null, "2 \u2013 5 minutos (aleatorio)"), /* @__PURE__ */ React.createElement("option", null, "5 \u2013 10 minutos"), /* @__PURE__ */ React.createElement("option", null, "10 \u2013 20 minutos"))))));
};
const TabOptions = ({ c }) => /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 16, maxWidth: 560 } }, /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: 20 } }, /* @__PURE__ */ React.createElement("div", { className: "card-title", style: { marginBottom: 14 } }, "General"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Nombre de la campa\xF1a"), /* @__PURE__ */ React.createElement("input", { className: "input", defaultValue: c.name })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Cuenta de env\xEDo"), /* @__PURE__ */ React.createElement("input", { className: "input", defaultValue: "nil@141agency.com" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Nombre del remitente"), /* @__PURE__ */ React.createElement("input", { className: "input", defaultValue: "141'STUDIO" })))), /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: 20 } }, /* @__PURE__ */ React.createElement("div", { className: "card-title", style: { marginBottom: 14 } }, "Seguimiento"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, [
  { label: "Rastrear aperturas", on: true },
  { label: "Rastrear clics", on: true },
  { label: "Detener al responder", on: true },
  { label: "Detener al desuscribirse", on: true }
].map((item, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", alignItems: "center", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13 } }, item.label), /* @__PURE__ */ React.createElement(Switch, { on: item.on, onChange: () => {
} }))))), /* @__PURE__ */ React.createElement("button", { className: "btn primary", style: { alignSelf: "flex-start" } }, "Guardar cambios"));
const TabAIAgent = ({ c }) => /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 16, maxWidth: 560 } }, /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: 20 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { style: {
  width: 36,
  height: 36,
  borderRadius: 10,
  background: "linear-gradient(135deg,rgba(167,139,250,0.15),rgba(96,165,250,0.15))",
  display: "grid",
  placeItems: "center"
} }, /* @__PURE__ */ React.createElement(Icon, { name: "sparkles", size: 16, style: { color: "var(--accent)" } })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "card-title" }, "Agente IA"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-muted)" } }, "Personalizaci\xF3n autom\xE1tica de emails")), /* @__PURE__ */ React.createElement(Switch, { on: false, onChange: () => {
}, style: { marginLeft: "auto" } })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Prompt de personalizaci\xF3n"), /* @__PURE__ */ React.createElement("textarea", { className: "textarea", rows: 4, placeholder: "Ej: Personaliza el saludo con el nombre de la empresa, menciona algo espec\xEDfico de su web y adapta el tono seg\xFAn el cargo..." })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Variables disponibles"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 } }, ["{{firstName}}", "{{lastName}}", "{{company}}", "{{role}}", "{{industry}}"].map((v) => /* @__PURE__ */ React.createElement("span", { key: v, className: "chip", style: { fontFamily: "var(--font-mono)", fontSize: 11 } }, v)))))), /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: 20 } }, /* @__PURE__ */ React.createElement("div", { className: "card-title", style: { marginBottom: 4 } }, "Detecci\xF3n de respuestas"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-muted)", marginBottom: 14 } }, "El agente clasifica las respuestas autom\xE1ticamente."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, [
  { label: "Interesado \u2192 mover a pipeline", on: true },
  { label: "No interesado \u2192 marcar y pausar", on: true },
  { label: "Fuera de oficina \u2192 retrasar seguimiento", on: false }
].map((item, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 } }, /* @__PURE__ */ React.createElement("span", null, item.label), /* @__PURE__ */ React.createElement(Switch, { on: item.on, onChange: () => {
} }))))));
const CampaignDetail = ({ campaignId, navigate }) => {
  const [campaigns] = useState(_loadCampaigns);
  const [tab, setTab] = useState("analytics");
  const [status, setStatus] = useState(null);
  const c = campaigns.find((x) => x.id === campaignId);
  if (!c) return /* @__PURE__ */ React.createElement(Empty, { icon: "megaphone", title: "Campa\xF1a no encontrada", sub: "Vuelve a la lista de campa\xF1as." });
  const currentStatus = status || c.status;
  const menuItems = [
    { id: "analytics", label: "Anal\xEDticas", icon: "bar-chart" },
    { id: "sequence", label: "Secuencia de emails", icon: "mail" },
    { id: "leads", label: "Leads", icon: "users" },
    { id: "schedule", label: "Horario", icon: "clock" },
    { id: "options", label: "Opciones", icon: "settings" },
    { id: "ai", label: "Agente IA", icon: "sparkles" }
  ];
  const statusConfig = {
    active: { label: "Activa", cls: "green", desc: "La campa\xF1a est\xE1 enviando emails." },
    paused: { label: "Pausada", cls: "amber", desc: "La campa\xF1a est\xE1 pausada y no env\xEDa emails." },
    draft: { label: "Borrador", cls: "", desc: "Configura la campa\xF1a antes de lanzarla." },
    completed: { label: "Finalizada", cls: "blue", desc: "La campa\xF1a ha concluido." }
  };
  const st = statusConfig[currentStatus] || statusConfig.paused;
  const renderTab = () => {
    switch (tab) {
      case "analytics":
        return /* @__PURE__ */ React.createElement(TabAnalytics, { c });
      case "sequence":
        return /* @__PURE__ */ React.createElement(TabSequence, { c });
      case "leads":
        return /* @__PURE__ */ React.createElement(TabLeads, { c });
      case "schedule":
        return /* @__PURE__ */ React.createElement(TabSchedule, { c });
      case "options":
        return /* @__PURE__ */ React.createElement(TabOptions, { c });
      case "ai":
        return /* @__PURE__ */ React.createElement(TabAIAgent, { c });
      default:
        return /* @__PURE__ */ React.createElement(TabAnalytics, { c });
    }
  };
  return /* @__PURE__ */ React.createElement("div", { className: "page", style: { padding: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "16px 24px 0" } }, /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: () => navigate("campaigns"), style: { marginBottom: 4 } }, /* @__PURE__ */ React.createElement(Icon, { name: "chevron", size: 12, style: { transform: "rotate(180deg)" } }), " Campa\xF1as")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "280px 1fr", gap: 0, height: "calc(100vh - 110px)", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: {
    borderRight: "0.5px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    padding: "8px 0"
  } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "12px 20px 16px", borderBottom: "0.5px solid var(--border)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 600, color: "var(--text)", lineHeight: 1.4 } }, c.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-subtle)", marginTop: 4 } }, c.leads, " leads \xB7 creada ", new Date(c.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }))), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, padding: "8px 10px", overflowY: "auto" } }, menuItems.map((item) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: item.id,
      onClick: () => setTab(item.id),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 12px",
        borderRadius: 8,
        cursor: "pointer",
        marginBottom: 2,
        fontSize: 13,
        background: tab === item.id ? "var(--bg-elev-2)" : "transparent",
        color: tab === item.id ? "var(--text)" : "var(--text-muted)",
        fontWeight: tab === item.id ? 500 : 400,
        border: tab === item.id ? "0.5px solid var(--border)" : "0.5px solid transparent",
        transition: "all .12s"
      }
    },
    /* @__PURE__ */ React.createElement(Icon, { name: item.icon, size: 14 }),
    item.label
  ))), /* @__PURE__ */ React.createElement("div", { style: { padding: "16px 16px", borderTop: "0.5px solid var(--border)" } }, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 8 } }, /* @__PURE__ */ React.createElement("span", { className: `chip ${st.cls}`, style: { marginBottom: 6, display: "inline-block" } }, st.label), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 } }, st.desc)), currentStatus === "paused" || currentStatus === "draft" ? /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn primary full",
      style: { width: "100%", justifyContent: "center" },
      onClick: () => setStatus("active")
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "play", size: 12 }),
    " Iniciar campa\xF1a"
  ) : currentStatus === "active" ? /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn full",
      style: { width: "100%", justifyContent: "center" },
      onClick: () => setStatus("paused")
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "pause", size: 12 }),
    " Pausar campa\xF1a"
  ) : null)), /* @__PURE__ */ React.createElement("div", { style: { overflowY: "auto", padding: "24px" } }, renderTab())));
};
const CampaignCard = ({ c, navigate }) => {
  const statusMap = {
    active: { label: "Activa", cls: "green" },
    paused: { label: "Pausada", cls: "amber" },
    draft: { label: "Borrador", cls: "" },
    completed: { label: "Finalizada", cls: "blue" }
  };
  const st = statusMap[c.status] || statusMap.paused;
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "card",
      style: { padding: "18px 20px", cursor: "pointer", transition: "border-color .15s" },
      onClick: () => navigate("campaign", { campaignId: c.id })
    },
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 16 } }, /* @__PURE__ */ React.createElement("div", { style: {
      width: 40,
      height: 40,
      borderRadius: 10,
      flexShrink: 0,
      background: "linear-gradient(135deg,rgba(167,139,250,0.12),rgba(96,165,250,0.12))",
      display: "grid",
      placeItems: "center"
    } }, /* @__PURE__ */ React.createElement(Icon, { name: "megaphone", size: 18, style: { color: "var(--accent)" } })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 600, fontSize: 14, color: "var(--text)", marginBottom: 2 } }, c.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-muted)" } }, c.leads, " leads \xB7 ", c.emailsSent.toLocaleString(), " emails enviados")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 20, alignItems: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: 600, color: "var(--green)", fontFamily: "var(--font-display)" } }, c.openRate, "%"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "var(--text-subtle)" } }, "Apertura")), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: 600, color: "var(--accent)", fontFamily: "var(--font-display)" } }, c.clickRate, "%"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "var(--text-subtle)" } }, "Clic")), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: 600, color: "var(--amber)", fontFamily: "var(--font-display)" } }, c.replyRate, "%"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "var(--text-subtle)" } }, "Respuesta")), /* @__PURE__ */ React.createElement("span", { className: `chip ${st.cls}` }, st.label), /* @__PURE__ */ React.createElement(Icon, { name: "chevron", size: 14, style: { color: "var(--text-subtle)" } })))
  );
};
const CampaignsPage = ({ navigate }) => {
  const [campaigns, setCampaigns] = useState(() => {
    const saved = _loadCampaigns();
    if (saved.length) return saved;
    const demo = [
      {
        id: crypto.randomUUID(),
        name: "Marketing Executives \xB7 UK \xB7 Software",
        status: "paused",
        leads: 847,
        emailsSent: 2294,
        openRate: 38,
        clickRate: 12,
        replyRate: 4.2,
        createdAt: "2025-04-10"
      },
      {
        id: crypto.randomUUID(),
        name: "E-commerce Directors \xB7 Espa\xF1a",
        status: "active",
        leads: 312,
        emailsSent: 891,
        openRate: 42,
        clickRate: 15,
        replyRate: 6.1,
        createdAt: "2025-04-28"
      }
    ];
    _saveCampaigns(demo);
    return demo;
  });
  const total = campaigns.length;
  const active = campaigns.filter((c) => c.status === "active").length;
  const totalSent = campaigns.reduce((s, c) => s + c.emailsSent, 0);
  return /* @__PURE__ */ React.createElement("div", { className: "page" }, /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", null, "Campa\xF1as"), /* @__PURE__ */ React.createElement("div", { className: "sub" }, total, " campa\xF1as \xB7 ", active, " activas \xB7 ", totalSent.toLocaleString(), " emails enviados")), /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: () => {
  } }, /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 14 }), " Nueva campa\xF1a")), campaigns.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { icon: "megaphone", title: "Sin campa\xF1as", sub: "Crea tu primera campa\xF1a de outreach para empezar a generar leads." }) : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, campaigns.map((c) => /* @__PURE__ */ React.createElement(CampaignCard, { key: c.id, c, navigate }))));
};
window.CampaignsPage = CampaignsPage;
window.CampaignDetail = CampaignDetail;

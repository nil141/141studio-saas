const _loadCampaigns = () => {
  try {
    return JSON.parse(localStorage.getItem("141_campaigns") || "null") || [];
  } catch (e) {
    return [];
  }
};
const _saveCampaigns = (data) => localStorage.setItem("141_campaigns", JSON.stringify(data));
const useCoworkCampaigns = () => {
  const [camps, setCamps] = useState(null);
  const reload = async () => {
    try {
      const r = await window.apiFetch("/api/campaigns/data");
      const j = await r.json();
      setCamps(j && j.ok ? j.campaigns || [] : []);
    } catch (e) {
      setCamps([]);
    }
  };
  useEffect(() => {
    reload();
  }, []);
  return [camps, reload];
};
const LEAD_STATUS = {
  new: { label: "Nuevo", chip: "neutral" },
  contacted: { label: "Contactado", chip: "blue" },
  replied: { label: "Respondi\xF3", chip: "green" },
  won: { label: "Ganado", chip: "green" },
  discarded: { label: "Descartado", chip: "red" }
};
const _todayStr2 = () => {
  const n = /* @__PURE__ */ new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
};
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
    replied: { label: "Respondi\xF3", chip: "green" },
    opened: { label: "Abri\xF3", chip: "blue" },
    sent: { label: "Enviado", chip: "neutral" },
    bounced: { label: "Rebot\xF3", chip: "red" }
  };
  const _AV = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#14b8a6", "#ef4444"];
  const _initials = (n) => (n || "").trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { className: "card-title" }, "Leads \xB7 ", c.leads, " en total"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { className: "btn sm" }, /* @__PURE__ */ React.createElement(Icon, { name: "upload", size: 12 }), " Importar CSV"), /* @__PURE__ */ React.createElement("button", { className: "btn sm primary" }, /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 12 }), " A\xF1adir lead"))), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body flush" }, /* @__PURE__ */ React.createElement("table", { className: "table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { style: { width: "42%" } }, "Contacto"), /* @__PURE__ */ React.createElement("th", null, "Empresa"), /* @__PURE__ */ React.createElement("th", null, "Estado"))), /* @__PURE__ */ React.createElement("tbody", null, leads.map((l, i) => {
    const st = statusMap[l.status] || { label: l.status, chip: "neutral" };
    return /* @__PURE__ */ React.createElement("tr", { key: i }, /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { className: "row tight" }, /* @__PURE__ */ React.createElement(Avatar, { name: l.name, initials: _initials(l.name), color: _AV[i % _AV.length] }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 500, fontSize: 13.5 } }, l.name), /* @__PURE__ */ React.createElement("div", { className: "subtle xsmall" }, l.email)))), /* @__PURE__ */ React.createElement("td", { className: "muted" }, l.company), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(StatusChip, { status: st.chip, label: st.label })));
  }))))));
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
const CoworkAnalytics = ({ c }) => {
  const leads = c.leads || [];
  const today = _todayStr2();
  const byStatus = (s) => leads.filter((l) => l.status === s).length;
  const newToday = leads.filter((l) => l.date === today).length;
  const contacted = byStatus("contacted") + byStatus("replied") + byStatus("won");
  const replied = byStatus("replied") + byStatus("won");
  const won = byStatus("won");
  const replyPct = contacted ? Math.round(replied / contacted * 100) : 0;
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = /* @__PURE__ */ new Date();
    d.setDate(d.getDate() - (6 - i));
    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return { l: ["D", "L", "M", "X", "J", "V", "S"][d.getDay()], v: leads.filter((x) => x.date === ds).length };
  });
  const funnel = [
    { id: "new", label: "Nuevos", v: byStatus("new"), color: "var(--text-muted)" },
    { id: "contacted", label: "Contactados", v: byStatus("contacted"), color: "#60a5fa" },
    { id: "replied", label: "Respondieron", v: byStatus("replied"), color: "var(--green)" },
    { id: "won", label: "Ganados", v: won, color: "var(--accent)" },
    { id: "discarded", label: "Descartados", v: byStatus("discarded"), color: "var(--red)" }
  ];
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 20 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 } }, /* @__PURE__ */ React.createElement(StatCard, { label: "Leads totales", value: leads.length, sub: newToday ? `+${newToday} hoy` : "Sin nuevos hoy" }), /* @__PURE__ */ React.createElement(StatCard, { label: "Contactados", value: contacted, sub: leads.length ? Math.round(contacted / leads.length * 100) + "% del total" : "\u2014", color: "#60a5fa" }), /* @__PURE__ */ React.createElement(StatCard, { label: "Respuestas", value: replied, sub: contacted ? replyPct + "% de contactados" : "\u2014", color: "var(--green)" }), /* @__PURE__ */ React.createElement(StatCard, { label: "Ganados", value: won, sub: "Clientes cerrados", color: "var(--accent)" })), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 } }, /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: 18 } }, /* @__PURE__ */ React.createElement("div", { className: "card-title", style: { marginBottom: 14 } }, "Leads recibidos \u2014 \xFAltimos 7 d\xEDas"), /* @__PURE__ */ React.createElement(MiniBarChart, { data: days, color: "var(--accent)" })), /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: 18 } }, /* @__PURE__ */ React.createElement("div", { className: "card-title", style: { marginBottom: 14 } }, "Embudo"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, funnel.map((f) => /* @__PURE__ */ React.createElement("div", { key: f.id, style: { display: "flex", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "var(--text-muted)", width: 96, flexShrink: 0 } }, f.label), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, height: 6, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { width: leads.length ? `${f.v / leads.length * 100}%` : 0, height: "100%", background: f.color, borderRadius: 99 } })), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, fontWeight: 600, color: "var(--text)", width: 26, textAlign: "right" } }, f.v)))))));
};
const CoworkLeads = ({ c, onUpdate }) => {
  const toast = useToast();
  const [openId, setOpenId] = useState(null);
  const leads = [...c.leads || []].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const _AV = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#14b8a6", "#ef4444"];
  const _initials = (n) => (n || "").trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const today = _todayStr2();
  const copyDraft = (l) => {
    const text = (l.subject ? `Asunto: ${l.subject}

` : "") + (l.draft || "");
    navigator.clipboard.writeText(text).then(() => toast("Borrador copiado", "success")).catch(() => toast("No se pudo copiar", "warn"));
  };
  const setStatus = async (l, status) => {
    try {
      await window.apiFetch("/api/campaigns/update_lead", { campaignId: c.id, leadId: l.id, status });
      onUpdate && onUpdate();
    } catch (e) {
      toast("Error al guardar", "warn");
    }
  };
  if (!leads.length) return /* @__PURE__ */ React.createElement(
    Empty,
    {
      icon: "users",
      title: "A\xFAn no hay leads",
      sub: "Cuando Claude Cowork haga la pr\xF3xima importaci\xF3n diaria, aparecer\xE1n aqu\xED."
    }
  );
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { className: "card-title" }, "Leads \xB7 ", leads.length, " en total"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-subtle)" } }, leads.filter((l) => l.date === today).length, " nuevos hoy \xB7 clic en un lead para ver auditor\xEDa y borrador")), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body flush" }, /* @__PURE__ */ React.createElement("table", { className: "table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { style: { width: "34%" } }, "Contacto"), /* @__PURE__ */ React.createElement("th", null, "Empresa"), /* @__PURE__ */ React.createElement("th", { style: { width: 90 } }, "Fecha"), /* @__PURE__ */ React.createElement("th", { style: { width: 150 } }, "Estado"), /* @__PURE__ */ React.createElement("th", { style: { width: 30 } }))), /* @__PURE__ */ React.createElement("tbody", null, leads.map((l, i) => {
    const st = LEAD_STATUS[l.status] || LEAD_STATUS.new;
    const open = openId === l.id;
    return /* @__PURE__ */ React.createElement(React.Fragment, { key: l.id }, /* @__PURE__ */ React.createElement("tr", { onClick: () => setOpenId(open ? null : l.id), style: { cursor: "pointer" } }, /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { className: "row tight" }, /* @__PURE__ */ React.createElement(Avatar, { name: l.name, initials: _initials(l.name), color: _AV[i % _AV.length] }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 500, fontSize: 13.5 } }, l.name), /* @__PURE__ */ React.createElement("div", { className: "subtle xsmall" }, l.email || l.website || "\u2014")))), /* @__PURE__ */ React.createElement("td", { className: "muted" }, l.company || "\u2014"), /* @__PURE__ */ React.createElement("td", { className: "muted", style: { fontSize: 12 } }, l.date === today ? "Hoy" : (/* @__PURE__ */ new Date((l.date || today) + "T00:00:00")).toLocaleDateString("es-ES", { day: "numeric", month: "short" })), /* @__PURE__ */ React.createElement("td", { onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement(
      "select",
      {
        className: "select sm",
        value: l.status,
        onChange: (e) => setStatus(l, e.target.value),
        style: { fontSize: 12, padding: "5px 8px" }
      },
      Object.entries(LEAD_STATUS).map(([k, v]) => /* @__PURE__ */ React.createElement("option", { key: k, value: k }, v.label))
    )), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(
      Icon,
      {
        name: "chevron-down",
        size: 13,
        style: { color: "var(--text-subtle)", transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }
      }
    ))), open && /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: 5, style: { background: "var(--bg-elev-2)", padding: "16px 18px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-subtle)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement(Icon, { name: "search", size: 11 }), " Auditor\xEDa"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, lineHeight: 1.6, color: "var(--text-muted)", whiteSpace: "pre-wrap" } }, l.audit || "Sin auditor\xEDa."), l.website && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 10, fontSize: 12 } }, /* @__PURE__ */ React.createElement(
      "a",
      {
        href: l.website.startsWith("http") ? l.website : "https://" + l.website,
        target: "_blank",
        rel: "noreferrer",
        style: { color: "var(--accent)" }
      },
      l.website,
      " \u2197"
    ))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-subtle)", display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement(Icon, { name: "mail", size: 11 }), " Borrador del mensaje"), /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: (e) => {
      e.stopPropagation();
      copyDraft(l);
    } }, /* @__PURE__ */ React.createElement(Icon, { name: "paperclip", size: 11 }), " Copiar")), l.subject && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 } }, l.subject), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, lineHeight: 1.6, color: "var(--text-muted)", whiteSpace: "pre-wrap" } }, l.draft || "Sin borrador."))))));
  }))))));
};
const CoworkCampaignDetail = ({ c, navigate, reload }) => {
  const [tab, setTab] = useState("leads");
  const menuItems = [
    { id: "leads", label: "Leads", icon: "users" },
    { id: "analytics", label: "Anal\xEDticas", icon: "bar-chart" }
  ];
  return /* @__PURE__ */ React.createElement("div", { className: "page", style: { padding: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "16px 24px 0" } }, /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: () => navigate("campaigns"), style: { marginBottom: 4 } }, /* @__PURE__ */ React.createElement(Icon, { name: "chevron", size: 12, style: { transform: "rotate(180deg)" } }), " Campa\xF1as")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "280px 1fr", gap: 0, height: "calc(100vh - 110px)", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { borderRight: "0.5px solid var(--border)", display: "flex", flexDirection: "column", overflow: "hidden", padding: "8px 0" } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "12px 20px 16px", borderBottom: "0.5px solid var(--border)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 600, color: "var(--text)", lineHeight: 1.4 } }, c.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-subtle)", marginTop: 4 } }, (c.leads || []).length, " leads \xB7 desde ", (/* @__PURE__ */ new Date(c.createdAt + "T00:00:00")).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }))), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, padding: "8px 10px", overflowY: "auto" } }, menuItems.map((item) => /* @__PURE__ */ React.createElement(
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
  ))), /* @__PURE__ */ React.createElement("div", { style: { padding: "16px", borderTop: "0.5px solid var(--border)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 } }, /* @__PURE__ */ React.createElement(Icon, { name: "sparkles", size: 13, style: { color: "var(--accent)" } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, fontWeight: 600, color: "var(--text)" } }, "Claude Cowork")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 } }, "Esta campa\xF1a se alimenta autom\xE1ticamente cada d\xEDa con los leads, auditor\xEDas y borradores que genera tu programaci\xF3n de Cowork."))), /* @__PURE__ */ React.createElement("div", { style: { overflowY: "auto", padding: "24px" } }, tab === "analytics" ? /* @__PURE__ */ React.createElement(CoworkAnalytics, { c }) : /* @__PURE__ */ React.createElement(CoworkLeads, { c, onUpdate: reload }))));
};
const CampaignDetail = ({ campaignId, navigate }) => {
  const [campaigns] = useState(_loadCampaigns);
  const [real, reloadReal] = useCoworkCampaigns();
  const [tab, setTab] = useState("analytics");
  const [status, setStatus] = useState(null);
  const rc = (real || []).find((x) => x.id === campaignId);
  if (rc) return /* @__PURE__ */ React.createElement(CoworkCampaignDetail, { c: rc, navigate, reload: reloadReal });
  const c = campaigns.find((x) => x.id === campaignId);
  if (!c && real === null) return /* @__PURE__ */ React.createElement("div", { style: { padding: 40, color: "var(--text-muted)", fontSize: 13 } }, "Cargando\u2026");
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
const CoworkCampaignCard = ({ c, navigate }) => {
  const leads = c.leads || [];
  const today = _todayStr2();
  const newToday = leads.filter((l) => l.date === today).length;
  const contacted = leads.filter((l) => ["contacted", "replied", "won"].includes(l.status)).length;
  const replied = leads.filter((l) => ["replied", "won"].includes(l.status)).length;
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
    } }, /* @__PURE__ */ React.createElement(Icon, { name: "sparkles", size: 18, style: { color: "var(--accent)" } })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 600, fontSize: 14, color: "var(--text)", marginBottom: 2 } }, c.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-muted)" } }, leads.length, " leads \xB7 alimentada por Claude Cowork", newToday ? ` \xB7 +${newToday} hoy` : "")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 20, alignItems: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: 600, color: "var(--text)", fontFamily: "var(--font-display)" } }, leads.length), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "var(--text-subtle)" } }, "Leads")), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: 600, color: "#60a5fa", fontFamily: "var(--font-display)" } }, contacted), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "var(--text-subtle)" } }, "Contactados")), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: 600, color: "var(--green)", fontFamily: "var(--font-display)" } }, replied), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "var(--text-subtle)" } }, "Respuestas")), /* @__PURE__ */ React.createElement("span", { className: "chip green" }, "Activa"), /* @__PURE__ */ React.createElement(Icon, { name: "chevron", size: 14, style: { color: "var(--text-subtle)" } })))
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
  const [real] = useCoworkCampaigns();
  const realList = real || [];
  const total = campaigns.length + realList.length;
  const active = campaigns.filter((c) => c.status === "active").length + realList.length;
  const realLeads = realList.reduce((s, c) => s + (c.leads || []).length, 0);
  return /* @__PURE__ */ React.createElement("div", { className: "page" }, /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", null, "Campa\xF1as"), /* @__PURE__ */ React.createElement("div", { className: "sub" }, total, " campa\xF1as \xB7 ", active, " activas", realLeads ? ` \xB7 ${realLeads} leads de Cowork` : "")), /* @__PURE__ */ React.createElement(ActionPill, { plusActions: () => {
  } })), total === 0 ? /* @__PURE__ */ React.createElement(Empty, { icon: "megaphone", title: "Sin campa\xF1as", sub: "Crea tu primera campa\xF1a de outreach para empezar a generar leads." }) : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, realList.map((c) => /* @__PURE__ */ React.createElement(CoworkCampaignCard, { key: c.id, c, navigate })), campaigns.map((c) => /* @__PURE__ */ React.createElement(CampaignCard, { key: c.id, c, navigate }))));
};
window.CampaignsPage = CampaignsPage;
window.CampaignDetail = CampaignDetail;

const useCampaigns = () => {
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
  new: { label: "Nuevo", color: "var(--text-muted)", dot: "rgba(255,255,255,0.35)" },
  contacted: { label: "Contactado", color: "#60a5fa", dot: "#60a5fa" },
  replied: { label: "Respondi\xF3", color: "var(--green)", dot: "var(--green)" },
  won: { label: "Ganado", color: "var(--accent)", dot: "var(--accent)" },
  discarded: { label: "Descartado", color: "var(--text-subtle)", dot: "rgba(255,255,255,0.18)" }
};
const STATUS_ORDER = ["new", "contacted", "replied", "won", "discarded"];
const CTYPES = {
  email: { label: "Correo", icon: "mail", hint: "Outreach por email" },
  meta: { label: "Meta Ads", icon: "megaphone", hint: "Facebook / Instagram Ads" },
  google: { label: "Google Ads", icon: "trending-up", hint: "Search / Performance Max" },
  cowork: { label: "Prospecci\xF3n IA", icon: "sparkles", hint: "Leads diarios de Claude Cowork" },
  otro: { label: "Otra", icon: "tag", hint: "Campa\xF1a gen\xE9rica" }
};
const _ctype = (c) => CTYPES[c.ctype] || CTYPES.cowork;
const parseCSV = (text) => {
  const firstLine = text.split(/\r?\n/)[0] || "";
  const delim = firstLine.split(";").length > firstLine.split(",").length ? ";" : ",";
  const rows = [];
  let row = [], cur = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQ = false;
      } else cur += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === delim) {
      row.push(cur);
      cur = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cur);
      cur = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
    } else cur += ch;
  }
  row.push(cur);
  if (row.some((c) => c.trim() !== "")) rows.push(row);
  return rows;
};
const CSV_FIELDS = {
  firstName: ["first name", "firstname", "nombre de pila"],
  lastName: ["last name", "lastname", "surname", "apellido", "apellidos"],
  name: ["name", "nombre", "contacto", "lead", "persona", "full name", "nombre completo", "contact name"],
  company: ["company", "company name", "empresa", "negocio", "marca", "compa\xF1ia", "compa\xF1\xEDa", "organization", "account name"],
  email: ["email", "correo", "e-mail", "mail", "email address", "work email", "correo electronico", "correo electr\xF3nico"],
  phone: ["phone", "phone number", "telefono", "tel\xE9fono", "tel", "movil", "m\xF3vil", "mobile", "mobile number", "mobile phone", "work direct phone", "corporate phone", "company phone number"],
  website: ["website", "web", "url", "dominio", "sitio", "pagina", "p\xE1gina", "company website", "website url", "site", "domain", "company domain"],
  sector: ["sector", "industry", "industria", "categoria", "categor\xEDa", "nicho", "tipo", "vertical"],
  title: ["title", "cargo", "puesto", "job title", "position", "rol"],
  audit: ["audit", "auditoria", "auditor\xEDa", "observaciones"],
  notes: ["notes", "notas", "nota", "comentarios"],
  subject: ["subject", "asunto"],
  draft: ["draft", "borrador", "mensaje", "cuerpo"]
};
const csvToLeads = (text) => {
  const rows = parseCSV(text);
  if (!rows.length) return [];
  const header = rows[0].map((h) => h.replace(/^﻿/, "").trim().toLowerCase());
  const colMap = {};
  let matched = 0;
  header.forEach((h, i) => {
    for (const [field, aliases] of Object.entries(CSV_FIELDS)) {
      if (aliases.includes(h)) {
        colMap[i] = field;
        matched++;
        break;
      }
    }
  });
  const dataRows = matched >= 2 ? rows.slice(1) : rows;
  const defaultOrder = ["name", "company", "email", "phone", "website", "sector"];
  return dataRows.map((r) => {
    const lead = {};
    r.forEach((cell, i) => {
      const field = matched >= 2 ? colMap[i] : defaultOrder[i];
      const v = (cell || "").trim();
      if (field && v && !lead[field]) lead[field] = v;
    });
    if (lead.firstName || lead.lastName) {
      lead.name = [lead.firstName, lead.lastName].filter(Boolean).join(" ");
    }
    delete lead.firstName;
    delete lead.lastName;
    if (lead.title) {
      lead.notes = [`Cargo: ${lead.title}`, lead.notes].filter(Boolean).join(" \xB7 ");
      delete lead.title;
    }
    return lead;
  }).filter((l) => l.name || l.company);
};
const _cToday = () => {
  const n = /* @__PURE__ */ new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
};
const _cFmtDay = (ds) => {
  if (!ds) return "\u2014";
  if (ds === _cToday()) return "Hoy";
  return (/* @__PURE__ */ new Date(ds + "T00:00:00")).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
};
const CampMiniStat = ({ label, value, sub, color }) => /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-subtle)", marginBottom: 6 } }, label), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 24, fontWeight: 600, fontFamily: "var(--font-display)", letterSpacing: "-0.5px", color: color || "var(--text)" } }, value), sub && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--text-muted)", marginTop: 3, letterSpacing: "-0.2px" } }, sub));
const LeadStatusPill = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);
  const st = LEAD_STATUS[value] || LEAD_STATUS.new;
  return /* @__PURE__ */ React.createElement("div", { style: { position: "relative" }, onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setOpen((o) => !o),
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "5px 12px",
        borderRadius: 99,
        cursor: "pointer",
        background: "rgba(255,255,255,0.04)",
        border: "0.5px solid var(--border)",
        color: st.color,
        fontSize: 12,
        letterSpacing: "-0.2px",
        fontFamily: "inherit",
        transition: "background .1s"
      },
      onMouseEnter: (e) => e.currentTarget.style.background = "rgba(255,255,255,0.08)",
      onMouseLeave: (e) => e.currentTarget.style.background = "rgba(255,255,255,0.04)"
    },
    /* @__PURE__ */ React.createElement("span", { style: { width: 6, height: 6, borderRadius: "50%", background: st.dot, flexShrink: 0 } }),
    st.label,
    /* @__PURE__ */ React.createElement(Icon, { name: "chevron-down", size: 11, style: { opacity: 0.5 } })
  ), open && /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    right: 0,
    top: "calc(100% + 6px)",
    zIndex: 60,
    minWidth: 160,
    background: "#1a1a1c",
    border: "0.5px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 5,
    boxShadow: "0 8px 32px rgba(0,0,0,0.5)"
  } }, STATUS_ORDER.map((k) => {
    const s = LEAD_STATUS[k];
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: k,
        onClick: () => {
          setOpen(false);
          onChange(k);
        },
        style: {
          display: "flex",
          alignItems: "center",
          gap: 9,
          width: "100%",
          padding: "8px 10px",
          borderRadius: 8,
          cursor: "pointer",
          textAlign: "left",
          background: k === value ? "rgba(255,255,255,0.06)" : "transparent",
          border: 0,
          color: s.color,
          fontSize: 12.5,
          fontFamily: "inherit"
        },
        onMouseEnter: (e) => e.currentTarget.style.background = "var(--bg-hover)",
        onMouseLeave: (e) => e.currentTarget.style.background = k === value ? "rgba(255,255,255,0.06)" : "transparent"
      },
      /* @__PURE__ */ React.createElement("span", { style: { width: 6, height: 6, borderRadius: "50%", background: s.dot } }),
      s.label
    );
  })));
};
let _sparkGradSeq = 0;
const LeadsSpark = ({ leads, days: nDays = 14, height = 192 }) => {
  const gradId = useRef(null);
  if (!gradId.current) gradId.current = "leadsGrad" + ++_sparkGradSeq;
  const days = Array.from({ length: nDays }, (_, i) => {
    const d = /* @__PURE__ */ new Date();
    d.setDate(d.getDate() - (nDays - 1 - i));
    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return { ds, v: leads.filter((x) => x.date === ds).length, lab: d.getDate() };
  });
  const max = Math.max(...days.map((d) => d.v), 1);
  const W = 818, H = height, padL = 20, padR = 20, top = 5, base = H - 55;
  const n = days.length;
  const X = (i) => padL + i * (W - padL - padR) / (n - 1);
  const Y = (v) => base - v / max * (base - top);
  let curve = `M${X(0).toFixed(1)},${Y(days[0].v).toFixed(1)}`;
  for (let i = 1; i < n; i++) {
    const x0 = X(i - 1), x1 = X(i), y0 = Y(days[i - 1].v), y1 = Y(days[i].v);
    const g = (x1 - x0) / 3;
    curve += `C${(x0 + g).toFixed(1)},${y0.toFixed(1)},${(x0 + 2 * g).toFixed(1)},${y1.toFixed(1)},${x1.toFixed(1)},${y1.toFixed(1)}`;
  }
  const area = curve + `L${X(n - 1).toFixed(1)},${base}L${X(0).toFixed(1)},${base}Z`;
  const refYs = [0, 0.25, 0.5, 0.75, 1].map((t) => base - t * (base - top));
  const tickEvery = Math.max(1, Math.round((n - 1) / 6));
  const ticks = days.map((d, i) => ({ ...d, i })).filter((d, i) => i % tickEvery === 0 || i === n - 1);
  const P = "#8277db";
  return /* @__PURE__ */ React.createElement("svg", { viewBox: `0 0 ${W} ${H}`, style: { width: "100%", height: "auto", display: "block" } }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("linearGradient", { id: gradId.current, x1: "0", y1: "0", x2: "0", y2: "1" }, /* @__PURE__ */ React.createElement("stop", { offset: "5%", stopColor: P, stopOpacity: "0.3" }), /* @__PURE__ */ React.createElement("stop", { offset: "95%", stopColor: P, stopOpacity: "0" }))), refYs.map((y, i) => /* @__PURE__ */ React.createElement(
    "line",
    {
      key: i,
      x1: padL,
      y1: y,
      x2: W - padR,
      y2: y,
      stroke: "rgba(255,255,255,0.05)",
      strokeDasharray: "3 3",
      strokeWidth: "1"
    }
  )), /* @__PURE__ */ React.createElement("path", { d: area, fill: `url(#${gradId.current})`, stroke: "none" }), /* @__PURE__ */ React.createElement("path", { d: curve, fill: "none", stroke: P, strokeWidth: "3" }), ticks.map((t) => /* @__PURE__ */ React.createElement(
    "text",
    {
      key: t.i,
      x: X(t.i),
      y: base + 18,
      textAnchor: "middle",
      fontSize: "12",
      fill: "var(--text-muted)",
      fontFamily: "var(--font-sans)"
    },
    t.lab
  )));
};
const HBars = ({ items, total }) => /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, items.map((it, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", alignItems: "center", gap: 12 } }, /* @__PURE__ */ React.createElement("span", { style: {
  fontSize: 12.5,
  color: "var(--text-muted)",
  width: 110,
  flexShrink: 0,
  letterSpacing: "-0.2px",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis"
} }, it.label), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, height: 6, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: {
  width: total ? `${it.v / total * 100}%` : 0,
  height: "100%",
  background: it.color || "var(--accent)",
  borderRadius: 99,
  transition: "width .25s"
} })), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12.5, fontWeight: 600, color: "var(--text)", width: 34, textAlign: "right", flexShrink: 0 } }, it.v), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: "var(--text-subtle)", width: 38, textAlign: "right", flexShrink: 0 } }, total ? Math.round(it.v / total * 100) : 0, "%"))));
const CampaignAnalytics = ({ c }) => {
  const leads = c.leads || [];
  const today = _cToday();
  const nStatus = (s) => leads.filter((l) => l.status === s).length;
  const contacted = nStatus("contacted") + nStatus("replied") + nStatus("won");
  const replied = nStatus("replied") + nStatus("won");
  const won = nStatus("won");
  if (!leads.length) return /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", padding: "70px 0", color: "var(--text-subtle)", fontSize: 13.5, letterSpacing: "-0.3px" } }, "Sin datos todav\xEDa \u2014 las anal\xEDticas aparecen cuando la campa\xF1a tiene leads.");
  const byDay = {};
  leads.forEach((l) => {
    if (l.date) byDay[l.date] = (byDay[l.date] || 0) + 1;
  });
  const dayEntries = Object.entries(byDay).sort((a, b) => b[1] - a[1]);
  const bestDay = dayEntries[0];
  const activeDays = dayEntries.length || 1;
  const avg = (leads.length / activeDays).toFixed(1).replace(".0", "");
  const bySector = {};
  leads.forEach((l) => {
    const s = (l.sector || "Sin sector").trim();
    bySector[s] = (bySector[s] || 0) + 1;
  });
  const sectors = Object.entries(bySector).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([label, v]) => ({ label, v }));
  const SRC = { cowork: "Claude Cowork", csv: "CSV", manual: "A mano", api: "API" };
  const bySrc = {};
  leads.forEach((l) => {
    const s = SRC[l.source] || "Claude Cowork";
    bySrc[s] = (bySrc[s] || 0) + 1;
  });
  const sources = Object.entries(bySrc).sort((a, b) => b[1] - a[1]).map(([label, v]) => ({ label, v, color: "rgba(158,154,229,0.65)" }));
  const funnel = [
    { label: "Nuevos", v: nStatus("new"), color: "rgba(255,255,255,0.3)" },
    { label: "Contactados", v: nStatus("contacted"), color: "#60a5fa" },
    { label: "Respondieron", v: nStatus("replied"), color: "var(--green)" },
    { label: "Ganados", v: won, color: "var(--accent)" },
    { label: "Descartados", v: nStatus("discarded"), color: "rgba(255,255,255,0.14)" }
  ];
  const cardStyle = { background: "var(--bg-elev-1)", border: "0.5px solid var(--border)", borderRadius: 16, padding: "18px 20px" };
  const cardTitle = { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-subtle)", marginBottom: 14 };
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 16, paddingBottom: 24 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 26, padding: "4px 2px 16px", borderBottom: "0.5px solid var(--border)" } }, /* @__PURE__ */ React.createElement(CampMiniStat, { label: "Leads", value: leads.length, sub: `media ${avg}/d\xEDa` }), /* @__PURE__ */ React.createElement(CampMiniStat, { label: "Contactados", value: contacted, sub: `${Math.round(contacted / leads.length * 100)}% del total`, color: "#60a5fa" }), /* @__PURE__ */ React.createElement(CampMiniStat, { label: "Respuestas", value: replied, sub: contacted ? `${Math.round(replied / contacted * 100)}% de contactados` : "\u2014", color: "var(--green)" }), /* @__PURE__ */ React.createElement(CampMiniStat, { label: "Ganados", value: won, sub: leads.length ? `${Math.round(won / leads.length * 100)}% de cierre` : "\u2014", color: "var(--accent)" }), /* @__PURE__ */ React.createElement(
    CampMiniStat,
    {
      label: "Mejor d\xEDa",
      value: bestDay ? bestDay[1] : "\u2014",
      sub: bestDay ? (/* @__PURE__ */ new Date(bestDay[0] + "T00:00:00")).toLocaleDateString("es-ES", { day: "numeric", month: "short" }) : ""
    }
  )), c.goal > 0 && /* @__PURE__ */ React.createElement("div", { style: cardStyle }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { style: cardTitle }, "Objetivo \xB7 clientes cerrados"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "var(--text-muted)" } }, /* @__PURE__ */ React.createElement("b", { style: { color: "var(--accent)", fontSize: 16 } }, won), " / ", c.goal, won >= c.goal && /* @__PURE__ */ React.createElement("span", { style: { color: "var(--green)", marginLeft: 8 } }, "\xA1Conseguido! \u{1F389}"))), /* @__PURE__ */ React.createElement("div", { style: { height: 8, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: {
    width: `${Math.min(100, won / c.goal * 100)}%`,
    height: "100%",
    background: won >= c.goal ? "var(--green)" : "var(--accent)",
    borderRadius: 99,
    transition: "width .3s"
  } }))), /* @__PURE__ */ React.createElement("div", { style: cardStyle }, /* @__PURE__ */ React.createElement("div", { style: cardTitle }, "Leads recibidos \xB7 \xFAltimos 30 d\xEDas"), /* @__PURE__ */ React.createElement(LeadsSpark, { leads, days: 30 })), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 } }, /* @__PURE__ */ React.createElement("div", { style: cardStyle }, /* @__PURE__ */ React.createElement("div", { style: cardTitle }, "Embudo"), /* @__PURE__ */ React.createElement(HBars, { items: funnel, total: leads.length })), /* @__PURE__ */ React.createElement("div", { style: cardStyle }, /* @__PURE__ */ React.createElement("div", { style: cardTitle }, "Por sector"), /* @__PURE__ */ React.createElement(HBars, { items: sectors, total: leads.length }))), /* @__PURE__ */ React.createElement("div", { style: cardStyle }, /* @__PURE__ */ React.createElement("div", { style: cardTitle }, "Origen de los leads"), /* @__PURE__ */ React.createElement(HBars, { items: sources, total: leads.length })));
};
const CampaignSettings = ({ c, reload, onRemove, onCSV, onManual, onCowork }) => {
  const toast = useToast();
  const [name, setName] = useState(c.name);
  const [ctype, setCtype] = useState(c.ctype || "cowork");
  const [goal, setGoal] = useState(String(c.goal || ""));
  useEffect(() => {
    setName(c.name);
    setCtype(c.ctype || "cowork");
    setGoal(String(c.goal || ""));
  }, [c.id]);
  const dirty = name.trim() !== c.name || ctype !== (c.ctype || "cowork") || (parseInt(goal || 0, 10) || 0) !== (c.goal || 0);
  const save = async () => {
    if (!name.trim()) {
      toast("El nombre no puede quedar vac\xEDo", "warn");
      return;
    }
    const r = await window.apiFetch("/api/campaigns/update", { campaignId: c.id, name: name.trim(), ctype, goal: parseInt(goal || 0, 10) || 0 });
    const j = await r.json();
    if (!j.ok) {
      toast(j.error || "No se pudo guardar", "warn");
      return;
    }
    toast("Campa\xF1a actualizada", "success");
    reload();
  };
  const cardStyle = { background: "var(--bg-elev-1)", border: "0.5px solid var(--border)", borderRadius: 16, padding: "20px 22px" };
  const cardTitle = { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-subtle)", marginBottom: 14 };
  const conns = [
    { icon: "upload", label: "Importar CSV", sub: "Sube una lista de leads.", onClick: onCSV },
    { icon: "plus", label: "A\xF1adir lead a mano", sub: "Un contacto suelto.", onClick: onManual },
    { icon: "sparkles", label: "Conectar Claude Cowork", sub: "Leads autom\xE1ticos cada d\xEDa.", onClick: onCowork }
  ];
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 16, maxWidth: 640, paddingBottom: 24 } }, /* @__PURE__ */ React.createElement("div", { style: cardStyle }, /* @__PURE__ */ React.createElement("div", { style: cardTitle }, "General"), /* @__PURE__ */ React.createElement("div", { className: "label" }, "Nombre de la campa\xF1a"), /* @__PURE__ */ React.createElement("input", { className: "input", value: name, onChange: (e) => setName(e.target.value), style: { marginBottom: 14 } }), /* @__PURE__ */ React.createElement("div", { className: "label" }, "Tipo"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } }, Object.entries(CTYPES).map(([id, t]) => {
    const on = ctype === id;
    return /* @__PURE__ */ React.createElement("button", { key: id, onClick: () => setCtype(id), style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "7px 14px",
      borderRadius: 99,
      cursor: "pointer",
      fontFamily: "inherit",
      background: on ? "rgba(158,154,229,0.14)" : "rgba(255,255,255,0.04)",
      border: on ? "0.5px solid rgba(158,154,229,0.45)" : "0.5px solid var(--border)",
      color: on ? "var(--accent)" : "var(--text-muted)",
      fontSize: 12.5,
      letterSpacing: "-0.2px",
      transition: "all .12s"
    } }, /* @__PURE__ */ React.createElement(Icon, { name: t.icon, size: 12, strokeWidth: 1.7 }), t.label);
  })), /* @__PURE__ */ React.createElement("div", { className: "label", style: { marginTop: 16 } }, "Objetivo \xB7 clientes a cerrar ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-subtle)" } }, "(opcional)")), /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "input",
      type: "number",
      min: "0",
      placeholder: "Ej. 10",
      value: goal,
      onChange: (e) => setGoal(e.target.value),
      style: { maxWidth: 160 }
    }
  ), dirty && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 16 } }, /* @__PURE__ */ React.createElement("button", { className: "btn primary sm", onClick: save }, /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 12 }), " Guardar cambios"))), /* @__PURE__ */ React.createElement("div", { style: cardStyle }, /* @__PURE__ */ React.createElement("div", { style: cardTitle }, "Fuentes de leads"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column" } }, conns.map((cn, i) => /* @__PURE__ */ React.createElement("div", { key: i, onClick: cn.onClick, className: "task-row", style: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "11px 2px",
    cursor: "pointer",
    borderBottom: i === conns.length - 1 ? "none" : "0.5px solid var(--border)"
  } }, /* @__PURE__ */ React.createElement("div", { style: {
    width: 32,
    height: 32,
    borderRadius: 9,
    background: "rgba(255,255,255,0.05)",
    border: "0.5px solid var(--border)",
    display: "grid",
    placeItems: "center",
    color: "var(--text-muted)",
    flexShrink: 0
  } }, /* @__PURE__ */ React.createElement(Icon, { name: cn.icon, size: 14, strokeWidth: 1.7 })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, color: "var(--text)", letterSpacing: "-0.3px" } }, cn.label), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--text-subtle)", marginTop: 1 } }, cn.sub)), /* @__PURE__ */ React.createElement(Icon, { name: "chevron-right", size: 13, style: { color: "rgba(255,255,255,0.18)" } }))))), /* @__PURE__ */ React.createElement("div", { style: { ...cardStyle, borderColor: "rgba(220,91,93,0.25)" } }, /* @__PURE__ */ React.createElement("div", { style: cardTitle }, "Zona de peligro"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.55 } }, "Eliminar la campa\xF1a borra tambi\xE9n todos sus leads. No se puede deshacer."), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn sm",
      onClick: onRemove,
      style: { color: "var(--red)", borderColor: "rgba(220,91,93,0.4)", flexShrink: 0 }
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "trash", size: 12 }),
    " Eliminar campa\xF1a"
  ))));
};
const LeadRow = ({ l, last, open, onToggle, onStatus, onDelete, onCopy, onSave }) => {
  const st = LEAD_STATUS[l.status] || LEAD_STATUS.new;
  const KEYS = ["name", "company", "email", "phone", "website", "sector", "notes", "followUp"];
  const [f, setF] = useState({});
  useEffect(() => {
    if (open) {
      const o = {};
      KEYS.forEach((k) => o[k] = l[k] || "");
      setF(o);
    }
  }, [open, l.id]);
  const set = (k) => (e) => setF((prev) => ({ ...prev, [k]: e.target.value }));
  const dirty = KEYS.some((k) => (f[k] || "") !== (l[k] || ""));
  const hasCowork = l.audit || l.draft || l.subject;
  const followBadge = l.followUp && l.followUp >= _cToday();
  const field = (label, k, ph, type) => /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-subtle)", marginBottom: 5 } }, label), /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "input",
      type: type || "text",
      placeholder: ph,
      value: f[k] || "",
      onChange: set(k),
      onClick: (e) => e.stopPropagation(),
      style: { padding: "8px 11px", fontSize: 12.5 }
    }
  ));
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { onClick: onToggle, className: "task-row", style: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "13px 4px",
    cursor: "pointer",
    borderBottom: last && !open ? "none" : "0.5px solid var(--border)"
  } }, /* @__PURE__ */ React.createElement("span", { style: { width: 7, height: 7, borderRadius: "50%", background: st.dot, flexShrink: 0 } }), /* @__PURE__ */ React.createElement("div", { style: { flex: "1.4 1 0", minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, letterSpacing: "-0.4px", color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "flex", alignItems: "center", gap: 7 } }, l.name, followBadge && /* @__PURE__ */ React.createElement(Icon, { name: "clock", size: 11, style: { color: "var(--accent)", flexShrink: 0 }, "data-tooltip": `Seguimiento ${_cFmtDay(l.followUp)}` })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--text-subtle)", marginTop: 2, letterSpacing: "-0.2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, l.company || "\u2014", l.sector ? ` \xB7 ${l.sector}` : "")), /* @__PURE__ */ React.createElement("div", { style: { flex: "1 1 0", minWidth: 0, fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, l.email || l.website || "\u2014"), /* @__PURE__ */ React.createElement("div", { style: { width: 52, fontSize: 12, color: "var(--text-subtle)", textAlign: "right", flexShrink: 0 } }, _cFmtDay(l.date)), /* @__PURE__ */ React.createElement(LeadStatusPill, { value: l.status, onChange: onStatus }), /* @__PURE__ */ React.createElement(Icon, { name: "chevron-down", size: 13, style: {
    color: "rgba(255,255,255,0.2)",
    flexShrink: 0,
    transform: open ? "rotate(180deg)" : "none",
    transition: "transform .15s"
  } })), open && /* @__PURE__ */ React.createElement("div", { onClick: (e) => e.stopPropagation(), style: {
    margin: "0 0 14px",
    padding: "18px 20px",
    background: "var(--bg-elev-1)",
    border: "0.5px solid var(--border)",
    borderRadius: 14
  } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-subtle)", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement(Icon, { name: "user-cog", size: 12 }), " Datos del lead"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 } }, field("Nombre", "name", "Nombre"), field("Empresa", "company", "Empresa"), field("Sector", "sector", "Sector"), field("Email", "email", "email@\u2026", "email"), field("Tel\xE9fono", "phone", "+34 \u2026"), field("Web", "website", "empresa.com")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginBottom: 6 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-subtle)", marginBottom: 5 } }, "Notas"), /* @__PURE__ */ React.createElement(
    "textarea",
    {
      className: "input",
      rows: 2,
      placeholder: "Notas internas, contexto de la llamada\u2026",
      value: f.notes || "",
      onChange: set("notes"),
      onClick: (e) => e.stopPropagation(),
      style: { padding: "8px 11px", fontSize: 12.5, resize: "vertical", lineHeight: 1.5 }
    }
  )), field("Pr\xF3ximo seguimiento", "followUp", "", "date")), dirty && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 8 } }, /* @__PURE__ */ React.createElement("button", { className: "btn primary sm", onClick: (e) => {
    e.stopPropagation();
    onSave(f);
  } }, /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 12 }), " Guardar cambios")), hasCowork && /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, marginTop: 8, paddingTop: 16, borderTop: "0.5px solid var(--border)" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-subtle)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement(Icon, { name: "search", size: 11 }), " Auditor\xEDa"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, lineHeight: 1.65, color: "var(--text-muted)", whiteSpace: "pre-wrap" } }, l.audit || "Sin auditor\xEDa.")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-subtle)", display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement(Icon, { name: "mail", size: 11 }), " Borrador del mensaje"), /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: (e) => {
    e.stopPropagation();
    onCopy();
  } }, /* @__PURE__ */ React.createElement(Icon, { name: "file", size: 11 }), " Copiar")), l.subject && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, fontWeight: 600, color: "var(--text)", marginBottom: 8, letterSpacing: "-0.3px" } }, l.subject), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, lineHeight: 1.65, color: "var(--text-muted)", whiteSpace: "pre-wrap" } }, l.draft || "Sin borrador."))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", marginTop: 14, paddingTop: 12, borderTop: "0.5px solid var(--border)" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn ghost sm",
      onClick: (e) => {
        e.stopPropagation();
        onDelete();
      },
      style: { color: "var(--red)" }
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "trash", size: 12 }),
    " Eliminar lead"
  ))));
};
const useCSVImport = (campaignId, onDone) => {
  const toast = useToast();
  const inputRef = useRef(null);
  const pick = () => inputRef.current && inputRef.current.click();
  const onFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    const text = await file.text();
    const leads = csvToLeads(text);
    if (!leads.length) {
      toast("No se encontraron leads en el CSV", "warn");
      return;
    }
    const CHUNK = 200;
    let added = 0, skipped = 0;
    if (leads.length > CHUNK) toast(`Importando ${leads.length} leads\u2026`, "info");
    for (let i = 0; i < leads.length; i += CHUNK) {
      const r = await window.apiFetch(
        "/api/campaigns/import_leads",
        { campaignId, leads: leads.slice(i, i + CHUNK), source: "csv" }
      );
      const j = await r.json();
      if (!j.ok) {
        toast(`${j.error || "Error al importar"}${added ? ` \u2014 ${added} ya importados` : ""}`, "warn");
        if (added) onDone && onDone();
        return;
      }
      added += j.added;
      skipped += j.skipped;
    }
    toast(`${added} leads importados${skipped ? ` \xB7 ${skipped} duplicados omitidos` : ""}`, "success");
    onDone && onDone();
  };
  const input = /* @__PURE__ */ React.createElement("input", { ref: inputRef, type: "file", accept: ".csv,text/csv", onChange: onFile, style: { display: "none" } });
  return [pick, input];
};
const AddLeadModal = ({ open, onClose, campaignId, onDone }) => {
  const toast = useToast();
  const empty = { name: "", company: "", email: "", phone: "", website: "", sector: "" };
  const [f, setF] = useState(empty);
  useEffect(() => {
    if (open) setF(empty);
  }, [open]);
  const set = (k) => (e) => setF((prev) => ({ ...prev, [k]: e.target.value }));
  const submit = async () => {
    if (!f.name.trim() && !f.company.trim()) {
      toast("Pon al menos el nombre o la empresa", "warn");
      return;
    }
    const r = await window.apiFetch("/api/campaigns/import_leads", { campaignId, leads: [f], source: "manual" });
    const j = await r.json();
    if (!j.ok) {
      toast(j.error || "No se pudo a\xF1adir", "warn");
      return;
    }
    toast(j.added ? "Lead a\xF1adido" : "Ese lead ya exist\xEDa", j.added ? "success" : "warn");
    onClose();
    onDone && onDone();
  };
  const field = (label, k, placeholder, type) => /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, label), /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "input",
      type: type || "text",
      placeholder,
      value: f[k],
      onChange: set(k)
    }
  ));
  return /* @__PURE__ */ React.createElement(
    Modal,
    {
      open,
      onClose,
      title: "A\xF1adir lead",
      sub: "Un contacto suelto para esta campa\xF1a.",
      footer: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: onClose }, "Cancelar"), /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: submit }, /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 12 }), " A\xF1adir lead"))
    },
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 13 } }, field("Nombre", "name", "Ej. Mar\xEDa L\xF3pez"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, field("Empresa", "company", "Ej. Joyas Alba"), field("Sector", "sector", "Ej. joyer\xEDa")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, field("Email", "email", "hola@empresa.com", "email"), field("Tel\xE9fono", "phone", "+34 \u2026")), field("Web", "website", "empresa.com"))
  );
};
const CoworkConnectModal = ({ open, onClose, campaignName }) => {
  const toast = useToast();
  const copyName = () => navigator.clipboard.writeText(campaignName).then(() => toast("Nombre copiado", "success")).catch(() => {
  });
  return /* @__PURE__ */ React.createElement(
    Modal,
    {
      open,
      onClose,
      title: "Conectar Claude Cowork",
      sub: "Que tu tarea diaria de Cowork llene esta campa\xF1a sola."
    },
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 16, fontSize: 13, lineHeight: 1.65, color: "var(--text-muted)" } }, /* @__PURE__ */ React.createElement("div", null, "En tu tarea programada de Cowork ya tienes el paso final que env\xEDa los leads a", /* @__PURE__ */ React.createElement("code", { style: { color: "var(--text)", background: "rgba(255,255,255,0.06)", padding: "1px 7px", borderRadius: 6, margin: "0 4px" } }, "/api/campaigns/import"), "con tu clave API. Para que caigan ", /* @__PURE__ */ React.createElement("b", { style: { color: "var(--text)" } }, "en esta campa\xF1a"), ", usa exactamente este nombre en el campo ", /* @__PURE__ */ React.createElement("code", { style: { color: "var(--accent)" } }, "campaign"), ":"), /* @__PURE__ */ React.createElement("div", { style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      background: "var(--bg-elev-2)",
      border: "0.5px solid var(--border)",
      borderRadius: 12,
      padding: "12px 16px"
    } }, /* @__PURE__ */ React.createElement("code", { style: { fontSize: 14, color: "var(--accent)", letterSpacing: "-0.2px" } }, '"', campaignName, '"'), /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: copyName }, /* @__PURE__ */ React.createElement(Icon, { name: "file", size: 11 }), " Copiar")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-subtle)" } }, "Si la campa\xF1a no existe cuando llegue la primera importaci\xF3n, se crea sola con ese nombre. Los duplicados (mismo email o nombre+empresa) se descartan autom\xE1ticamente."))
  );
};
const ConnectPanel = ({ onCSV, onManual, onCowork }) => {
  const cards = [
    { icon: "upload", title: "Importar CSV", sub: "Sube una lista con columnas como nombre, empresa, email, tel\xE9fono o web.", onClick: onCSV },
    { icon: "sparkles", title: "Conectar Claude Cowork", sub: "Tu tarea diaria de prospecci\xF3n llena esta campa\xF1a autom\xE1ticamente.", onClick: onCowork, accent: true },
    { icon: "plus", title: "A\xF1adir a mano", sub: "Mete un lead suelto con sus datos b\xE1sicos.", onClick: onManual }
  ];
  return /* @__PURE__ */ React.createElement("div", { style: { paddingTop: 34 } }, /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", marginBottom: 26 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15.5, fontWeight: 500, color: "var(--text)", letterSpacing: "-0.4px" } }, "Conecta tus leads"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: "var(--text-subtle)", marginTop: 5, letterSpacing: "-0.2px" } }, "La campa\xF1a est\xE1 vac\xEDa \u2014 elige c\xF3mo quieres llenarla.")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, maxWidth: 860, margin: "0 auto" } }, cards.map((c, i) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: i,
      onClick: c.onClick,
      style: {
        background: c.accent ? "rgba(158,154,229,0.07)" : "var(--bg-elev-1)",
        border: c.accent ? "0.5px solid rgba(158,154,229,0.35)" : "0.5px solid var(--border)",
        borderRadius: 16,
        padding: "22px 20px",
        cursor: "pointer",
        textAlign: "center",
        transition: "border-color .15s, background .15s"
      },
      onMouseEnter: (e) => e.currentTarget.style.borderColor = "rgba(158,154,229,0.5)",
      onMouseLeave: (e) => e.currentTarget.style.borderColor = c.accent ? "rgba(158,154,229,0.35)" : "var(--border)"
    },
    /* @__PURE__ */ React.createElement("div", { style: {
      width: 42,
      height: 42,
      borderRadius: 12,
      margin: "0 auto 12px",
      background: c.accent ? "rgba(158,154,229,0.14)" : "rgba(255,255,255,0.05)",
      border: "0.5px solid var(--border)",
      display: "grid",
      placeItems: "center",
      color: c.accent ? "var(--accent)" : "var(--text-muted)"
    } }, /* @__PURE__ */ React.createElement(Icon, { name: c.icon, size: 17, strokeWidth: 1.7 })),
    /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, fontWeight: 500, color: "var(--text)", letterSpacing: "-0.3px" } }, c.title),
    /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--text-subtle)", marginTop: 6, lineHeight: 1.55, letterSpacing: "-0.1px" } }, c.sub)
  ))));
};
const CampaignDetail = ({ campaignId, navigate, initialAction }) => {
  const [camps, reload] = useCampaigns();
  const toast = useToast();
  const confirm = useConfirm();
  const [view, setView] = useState("leads");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);
  const [addingLead, setAddingLead] = useState(false);
  const [coworkOpen, setCoworkOpen] = useState(false);
  const [pickCSV, csvInput] = useCSVImport(campaignId, () => reload());
  const actionRan = useRef(false);
  useEffect(() => {
    if (actionRan.current || camps === null || !initialAction) return;
    if (!camps.find((x) => x.id === campaignId)) return;
    actionRan.current = true;
    if (initialAction === "csv") pickCSV();
    else if (initialAction === "manual") setAddingLead(true);
    else if (initialAction === "cowork") setCoworkOpen(true);
  }, [camps, initialAction]);
  if (camps === null) return /* @__PURE__ */ React.createElement("div", { style: { padding: "60px 32px", textAlign: "center", color: "var(--text-subtle)", fontSize: 13 } }, "Cargando\u2026");
  const c = camps.find((x) => x.id === campaignId);
  if (!c) return /* @__PURE__ */ React.createElement(Empty, { icon: "megaphone", title: "Campa\xF1a no encontrada", sub: "Vuelve a la lista de campa\xF1as." });
  const ct = _ctype(c);
  const leads = [...c.leads || []].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const today = _cToday();
  const nStatus = (s) => leads.filter((l) => l.status === s).length;
  const newToday = leads.filter((l) => l.date === today).length;
  const contacted = nStatus("contacted") + nStatus("replied") + nStatus("won");
  const replied = nStatus("replied") + nStatus("won");
  const replyPct = contacted ? Math.round(replied / contacted * 100) : 0;
  const visible = leads.filter((l) => {
    if (filter !== "all" && l.status !== filter) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return [l.name, l.company, l.email, l.website, l.sector].some((v) => (v || "").toLowerCase().includes(q));
    }
    return true;
  });
  const setStatus = async (l, status) => {
    try {
      await window.apiFetch("/api/campaigns/update_lead", { campaignId: c.id, leadId: l.id, status });
      reload();
    } catch (e) {
      toast("Error al guardar", "warn");
    }
  };
  const saveLead = async (l, fields) => {
    try {
      const r = await window.apiFetch("/api/campaigns/update_lead", { campaignId: c.id, leadId: l.id, fields });
      const j = await r.json();
      if (!j.ok) {
        toast(j.error || "No se pudo guardar", "warn");
        return;
      }
      toast("Lead actualizado", "success");
      reload();
    } catch (e) {
      toast("Error al guardar", "warn");
    }
  };
  const exportCSV = () => {
    if (!leads.length) {
      toast("No hay leads que exportar", "warn");
      return;
    }
    const cols = ["name", "company", "email", "phone", "website", "sector", "status", "date", "followUp", "notes", "subject", "draft", "audit"];
    const head = ["Nombre", "Empresa", "Email", "Tel\xE9fono", "Web", "Sector", "Estado", "Fecha", "Seguimiento", "Notas", "Asunto", "Borrador", "Auditor\xEDa"];
    const esc = (v) => {
      const s = v == null ? "" : String(v);
      return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const rows = leads.map((l) => cols.map((k) => esc(k === "status" ? (LEAD_STATUS[l.status] || {}).label : l[k])).join(","));
    const csv = head.join(",") + "\n" + rows.join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${c.name.replace(/[^\w\-]+/g, "_")}_leads.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast(`${leads.length} leads exportados`, "success");
  };
  const removeLead = async (l) => {
    const ok = await confirm({ title: "\xBFEliminar este lead?", body: `${l.name}${l.company ? " \xB7 " + l.company : ""} se eliminar\xE1 de la campa\xF1a.`, danger: true, confirmLabel: "Eliminar" });
    if (!ok) return;
    await window.apiFetch("/api/campaigns/delete_lead", { campaignId: c.id, leadId: l.id });
    toast("Lead eliminado", "success");
    reload();
  };
  const removeCampaign = async () => {
    const ok = await confirm({ title: "\xBFEliminar la campa\xF1a?", body: `Se eliminar\xE1 "${c.name}" con sus ${leads.length} leads. No se puede deshacer.`, danger: true, confirmLabel: "Eliminar campa\xF1a" });
    if (!ok) return;
    await window.apiFetch("/api/campaigns/delete_campaign", { campaignId: c.id });
    navigate("campaigns");
  };
  const copyDraft = (l) => {
    const text = (l.subject ? `Asunto: ${l.subject}

` : "") + (l.draft || "");
    navigator.clipboard.writeText(text).then(() => toast("Borrador copiado", "success")).catch(() => toast("No se pudo copiar", "warn"));
  };
  const FILTERS = [
    { id: "all", label: "Todos", n: leads.length },
    ...STATUS_ORDER.map((s) => ({ id: s, label: LEAD_STATUS[s].label, n: nStatus(s) }))
  ];
  return /* @__PURE__ */ React.createElement("div", { style: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    padding: "28px 32px 0",
    maxWidth: 1400,
    margin: "0 auto",
    overflow: "hidden"
  } }, /* @__PURE__ */ React.createElement("div", { style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: () => navigate("campaigns"), style: { marginBottom: 14, marginLeft: -8 } }, /* @__PURE__ */ React.createElement(Icon, { name: "chevron-left", size: 13 }), " Campa\xF1as"), /* @__PURE__ */ React.createElement("div", { className: "page-head", style: { marginBottom: 22 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", null, c.name), /* @__PURE__ */ React.createElement("div", { className: "sub", style: { display: "flex", alignItems: "center", gap: 7 } }, /* @__PURE__ */ React.createElement(Icon, { name: ct.icon, size: 12, style: { color: "var(--accent)" } }), ct.label, " \xB7 desde ", (/* @__PURE__ */ new Date(c.createdAt + "T00:00:00")).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }))), /* @__PURE__ */ React.createElement(
    ActionPill,
    {
      plusActions: [
        { icon: "upload", label: "Importar CSV", sub: "Sube una lista de leads.", onClick: pickCSV },
        { icon: "plus", label: "A\xF1adir lead", sub: "Un contacto suelto, a mano.", accent: true, onClick: () => setAddingLead(true) },
        { icon: "sparkles", label: "Conectar Cowork", sub: "Que la llene tu tarea diaria de IA.", onClick: () => setCoworkOpen(true) }
      ],
      moreActions: [
        { icon: "download", label: "Exportar CSV", onClick: exportCSV },
        { icon: "trash", label: "Eliminar campa\xF1a", onClick: removeCampaign }
      ]
    }
  )), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, paddingBottom: 16, borderBottom: "0.5px solid var(--border)", marginBottom: 16 } }, [
    { id: "leads", label: "Leads", icon: "users" },
    { id: "stats", label: "Anal\xEDticas", icon: "bar-chart" },
    { id: "config", label: "Ajustes", icon: "settings" }
  ].map((t) => {
    const on = view === t.id;
    return /* @__PURE__ */ React.createElement("button", { key: t.id, onClick: () => setView(t.id), style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      padding: "7px 15px",
      borderRadius: 99,
      cursor: "pointer",
      fontFamily: "inherit",
      background: on ? "rgba(255,255,255,0.08)" : "transparent",
      border: on ? "0.5px solid rgba(255,255,255,0.14)" : "0.5px solid transparent",
      color: on ? "var(--text)" : "var(--text-subtle)",
      fontSize: 13,
      letterSpacing: "-0.3px",
      fontWeight: on ? 500 : 400,
      transition: "all .12s"
    } }, /* @__PURE__ */ React.createElement(Icon, { name: t.icon, size: 13, strokeWidth: 1.7 }), t.label);
  })), view === "leads" && leads.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" } }, FILTERS.map((f) => {
    const on = filter === f.id;
    return /* @__PURE__ */ React.createElement("button", { key: f.id, onClick: () => setFilter(f.id), style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "6px 13px",
      borderRadius: 99,
      cursor: "pointer",
      fontFamily: "inherit",
      background: on ? "rgba(158,154,229,0.14)" : "rgba(255,255,255,0.04)",
      border: on ? "0.5px solid rgba(158,154,229,0.4)" : "0.5px solid var(--border)",
      color: on ? "var(--accent)" : "var(--text-muted)",
      fontSize: 12.5,
      letterSpacing: "-0.2px",
      transition: "all .12s"
    } }, f.label, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10.5, opacity: 0.65 } }, f.n));
  }), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }), /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement(Icon, { name: "search", size: 13, style: { position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)" } }), /* @__PURE__ */ React.createElement(
    "input",
    {
      value: query,
      onChange: (e) => setQuery(e.target.value),
      placeholder: "Buscar lead\u2026",
      style: {
        background: "rgba(255,255,255,0.04)",
        border: "0.5px solid var(--border)",
        borderRadius: 99,
        padding: "7px 14px 7px 32px",
        fontSize: 12.5,
        color: "var(--text)",
        outline: "none",
        width: 190,
        fontFamily: "inherit",
        letterSpacing: "-0.2px"
      }
    }
  )))), /* @__PURE__ */ React.createElement("div", { className: "tasks-scroll", style: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    scrollbarGutter: "stable",
    paddingRight: 10,
    paddingTop: 14,
    paddingBottom: 8,
    WebkitMaskImage: "linear-gradient(to bottom, transparent 0, #000 16px, #000 calc(100% - 24px), transparent 100%)",
    maskImage: "linear-gradient(to bottom, transparent 0, #000 16px, #000 calc(100% - 24px), transparent 100%)"
  } }, view === "stats" ? /* @__PURE__ */ React.createElement(CampaignAnalytics, { c }) : view === "config" ? /* @__PURE__ */ React.createElement(
    CampaignSettings,
    {
      c,
      reload,
      onRemove: removeCampaign,
      onCSV: pickCSV,
      onManual: () => setAddingLead(true),
      onCowork: () => setCoworkOpen(true)
    }
  ) : leads.length === 0 ? /* @__PURE__ */ React.createElement(ConnectPanel, { onCSV: pickCSV, onManual: () => setAddingLead(true), onCowork: () => setCoworkOpen(true) }) : visible.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", padding: "60px 0", color: "var(--text-subtle)", fontSize: 13.5, letterSpacing: "-0.3px" } }, "Ning\xFAn lead coincide con el filtro.") : visible.map((l, i) => /* @__PURE__ */ React.createElement(
    LeadRow,
    {
      key: l.id,
      l,
      last: i === visible.length - 1,
      open: openId === l.id,
      onToggle: () => setOpenId(openId === l.id ? null : l.id),
      onStatus: (s) => setStatus(l, s),
      onDelete: () => removeLead(l),
      onCopy: () => copyDraft(l),
      onSave: (fields) => saveLead(l, fields)
    }
  ))), csvInput, /* @__PURE__ */ React.createElement(AddLeadModal, { open: addingLead, onClose: () => setAddingLead(false), campaignId: c.id, onDone: reload }), /* @__PURE__ */ React.createElement(CoworkConnectModal, { open: coworkOpen, onClose: () => setCoworkOpen(false), campaignName: c.name }));
};
const CampaignSetup = ({ open, onClose, onCreated }) => {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [type, setType] = useState(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const nameRef = useRef(null);
  useEffect(() => {
    if (open) {
      setStep(0);
      setType(null);
      setName("");
      setBusy(false);
    }
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const fn = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open]);
  useEffect(() => {
    if (open && step === 1) setTimeout(() => nameRef.current && nameRef.current.focus(), 60);
  }, [step, open]);
  if (!open) return null;
  const create = async (source) => {
    if (busy || !name.trim()) return;
    setBusy(true);
    const r = await window.apiFetch("/api/campaigns/create", { name: name.trim(), ctype: type || "otro" });
    const j = await r.json();
    setBusy(false);
    if (!j.ok) {
      toast(j.error || "No se pudo crear", "warn");
      return;
    }
    onClose();
    onCreated(j.campaign.id, source);
  };
  const TITLES = ["\xBFQu\xE9 tipo de campa\xF1a?", "Ponle un nombre", "\xBFDe d\xF3nde vienen los leads?"];
  const SUBS = [
    "Elige el canal principal de esta campa\xF1a.",
    "Un nombre claro para reconocerla de un vistazo.",
    "Puedes conectar los leads ahora o hacerlo m\xE1s tarde."
  ];
  const sourceCards = [
    { id: "csv", icon: "upload", title: "Importar CSV", sub: "Sube una lista de leads." },
    { id: "cowork", icon: "sparkles", title: "Claude Cowork", sub: "Se llena sola cada d\xEDa.", accent: true },
    { id: "manual", icon: "plus", title: "A\xF1adir a mano", sub: "Un contacto suelto." },
    { id: null, icon: "clock", title: "Lo har\xE9 luego", sub: "Entrar a la campa\xF1a vac\xEDa." }
  ];
  const card = (sel, onClick, icon, title, sub, accent) => /* @__PURE__ */ React.createElement(
    "div",
    {
      onClick,
      style: {
        background: accent ? "rgba(158,154,229,0.07)" : sel ? "rgba(158,154,229,0.1)" : "var(--bg-elev-1)",
        border: sel || accent ? "0.5px solid rgba(158,154,229,0.4)" : "0.5px solid var(--border)",
        borderRadius: 16,
        padding: "18px 16px",
        cursor: "pointer",
        textAlign: "center",
        transition: "border-color .15s, background .15s"
      },
      onMouseEnter: (e) => e.currentTarget.style.borderColor = "rgba(158,154,229,0.5)",
      onMouseLeave: (e) => e.currentTarget.style.borderColor = sel || accent ? "rgba(158,154,229,0.4)" : "var(--border)"
    },
    /* @__PURE__ */ React.createElement("div", { style: {
      width: 42,
      height: 42,
      borderRadius: 12,
      margin: "0 auto 11px",
      background: accent || sel ? "rgba(158,154,229,0.14)" : "rgba(255,255,255,0.05)",
      border: "0.5px solid var(--border)",
      display: "grid",
      placeItems: "center",
      color: accent || sel ? "var(--accent)" : "var(--text-muted)"
    } }, /* @__PURE__ */ React.createElement(Icon, { name: icon, size: 18, strokeWidth: 1.7 })),
    /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, fontWeight: 500, color: "var(--text)", letterSpacing: "-0.3px" } }, title),
    /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--text-subtle)", marginTop: 5, lineHeight: 1.5 } }, sub)
  );
  return ReactDOM.createPortal(
    /* @__PURE__ */ React.createElement("div", { onClick: onClose, style: {
      position: "fixed",
      inset: 0,
      zIndex: 300,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0,0,0,0.72)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      padding: 24,
      animation: "fade .15s ease-out"
    } }, /* @__PURE__ */ React.createElement("div", { onClick: (e) => e.stopPropagation(), style: {
      width: "100%",
      maxWidth: 560,
      minHeight: 440,
      background: "rgba(255,255,255,0.05)",
      backdropFilter: "blur(40px)",
      WebkitBackdropFilter: "blur(40px)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 32,
      overflow: "hidden",
      boxShadow: "0 25px 60px -20px rgba(0,0,0,0.6)",
      display: "flex",
      flexDirection: "column",
      animation: "pop .2s cubic-bezier(.2,.8,.2,1)"
    } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 0" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, [0, 1, 2].map((i) => /* @__PURE__ */ React.createElement("div", { key: i, style: {
      width: i === step ? 22 : 7,
      height: 7,
      borderRadius: 99,
      background: i <= step ? "var(--accent)" : "rgba(255,255,255,0.14)",
      transition: "all .2s"
    } }))), /* @__PURE__ */ React.createElement("button", { onClick: onClose, style: {
      width: 34,
      height: 34,
      borderRadius: "50%",
      background: "rgba(255,255,255,0.06)",
      border: "0.5px solid var(--border)",
      cursor: "pointer",
      display: "grid",
      placeItems: "center",
      color: "var(--text-muted)"
    } }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 14 }))), /* @__PURE__ */ React.createElement("div", { style: { padding: "22px 28px 0", textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 23, fontWeight: 500, color: "var(--text)", letterSpacing: "-0.6px" } }, TITLES[step]), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "var(--text-subtle)", marginTop: 7, letterSpacing: "-0.2px" } }, SUBS[step])), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, padding: "26px 28px", display: "flex", flexDirection: "column", justifyContent: "center" } }, step === 0 && /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, ["email", "meta", "google", "otro"].map(
      (id) => card(type === id, () => {
        setType(id);
        setStep(1);
      }, CTYPES[id].icon, CTYPES[id].label, CTYPES[id].hint, false)
    )), step === 1 && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(
      "input",
      {
        ref: nameRef,
        value: name,
        onChange: (e) => setName(e.target.value),
        onKeyDown: (e) => {
          if (e.key === "Enter" && name.trim()) setStep(2);
        },
        placeholder: "Ej. Outreach ecommerce moda",
        style: {
          width: "100%",
          background: "transparent",
          border: "none",
          outline: "none",
          fontSize: 26,
          fontWeight: 400,
          letterSpacing: "-1px",
          textAlign: "center",
          color: name ? "var(--text)" : "rgba(255,255,255,0.2)",
          fontFamily: "var(--font-display)",
          caretColor: "var(--accent)"
        }
      }
    ), /* @__PURE__ */ React.createElement("div", { style: { height: "0.5px", background: "rgba(255,255,255,0.12)", margin: "14px auto 0", maxWidth: 360 } }), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", marginTop: 10, fontSize: 12, color: "var(--text-subtle)" } }, "Tipo: ", CTYPES[type] ? CTYPES[type].label : "\u2014")), step === 2 && /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, sourceCards.map((s, i) => card(false, () => create(s.id), s.icon, s.title, s.sub, s.accent)))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px 24px" } }, step > 0 ? /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: () => setStep((s) => s - 1) }, /* @__PURE__ */ React.createElement(Icon, { name: "chevron-left", size: 13 }), " Atr\xE1s") : /* @__PURE__ */ React.createElement("span", null), step === 1 && /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "btn primary sm",
        onClick: () => name.trim() && setStep(2),
        style: { opacity: name.trim() ? 1 : 0.4, pointerEvents: name.trim() ? "auto" : "none" }
      },
      "Continuar ",
      /* @__PURE__ */ React.createElement(Icon, { name: "chevron-right", size: 13 })
    )))),
    document.body
  );
};
const CampaignsPage = ({ navigate }) => {
  const [camps, reload] = useCampaigns();
  const [setupOpen, setSetupOpen] = useState(false);
  const today = _cToday();
  const list = camps || [];
  const totalLeads = list.reduce((s, c) => s + (c.leads || []).length, 0);
  const newToday = list.reduce((s, c) => s + (c.leads || []).filter((l) => l.date === today).length, 0);
  const onCreated = (id, source) => {
    reload();
    navigate("campaign", { campaignId: id, action: source || void 0 });
  };
  return /* @__PURE__ */ React.createElement("div", { style: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    padding: "28px 32px 0",
    maxWidth: 1400,
    margin: "0 auto",
    overflow: "hidden"
  } }, /* @__PURE__ */ React.createElement("div", { className: "page-head", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", null, "Campa\xF1as"), /* @__PURE__ */ React.createElement("div", { className: "sub" }, list.length === 0 ? "Sin campa\xF1as todav\xEDa" : `${list.length} ${list.length === 1 ? "campa\xF1a" : "campa\xF1as"} \xB7 ${totalLeads} leads${newToday ? ` \xB7 +${newToday} hoy` : ""}`)), /* @__PURE__ */ React.createElement(ActionPill, { plusActions: () => setSetupOpen(true) })), /* @__PURE__ */ React.createElement("div", { className: "tasks-scroll", style: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    scrollbarGutter: "stable",
    paddingRight: 10,
    paddingTop: 22,
    paddingBottom: 8,
    WebkitMaskImage: "linear-gradient(to bottom, transparent 0, #000 16px, #000 calc(100% - 24px), transparent 100%)",
    maskImage: "linear-gradient(to bottom, transparent 0, #000 16px, #000 calc(100% - 24px), transparent 100%)"
  } }, camps === null ? /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", padding: "60px 0", color: "var(--text-subtle)", fontSize: 13 } }, "Cargando\u2026") : list.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", padding: "70px 0" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "inline-flex", padding: 14, border: "0.5px solid var(--border)", borderRadius: 14, marginBottom: 14, color: "var(--text-muted)" } }, /* @__PURE__ */ React.createElement(Icon, { name: "megaphone", size: 22 })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14.5, fontWeight: 500, color: "var(--text)", letterSpacing: "-0.3px" } }, "Sin campa\xF1as"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: "var(--text-subtle)", marginTop: 6, maxWidth: 340, margin: "6px auto 0", lineHeight: 1.55 } }, "Crea una con el bot\xF3n + o deja que Claude Cowork cree la suya con la primera importaci\xF3n de leads.")) : list.map((c) => {
    const leads = c.leads || [];
    const ct = _ctype(c);
    const nToday = leads.filter((l) => l.date === today).length;
    const contacted = leads.filter((l) => ["contacted", "replied", "won"].includes(l.status)).length;
    const replied = leads.filter((l) => ["replied", "won"].includes(l.status)).length;
    const won = leads.filter((l) => l.status === "won").length;
    const pct = leads.length ? contacted / leads.length * 100 : 0;
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: c.id,
        onClick: () => navigate("campaign", { campaignId: c.id }),
        className: "task-row",
        style: {
          display: "flex",
          alignItems: "center",
          gap: 18,
          padding: "18px 4px",
          cursor: "pointer",
          borderBottom: "0.5px solid var(--border)"
        }
      },
      /* @__PURE__ */ React.createElement("div", { style: {
        width: 40,
        height: 40,
        borderRadius: 12,
        flexShrink: 0,
        background: "rgba(158,154,229,0.1)",
        border: "0.5px solid var(--border)",
        display: "grid",
        placeItems: "center",
        color: "var(--accent)"
      } }, /* @__PURE__ */ React.createElement(Icon, { name: ct.icon, size: 17, strokeWidth: 1.7 })),
      /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14.5, fontWeight: 500, letterSpacing: "-0.4px", color: "var(--text)" } }, c.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--text-subtle)", marginTop: 3, letterSpacing: "-0.2px" } }, ct.label, " \xB7 ", leads.length, " ", leads.length === 1 ? "lead" : "leads", nToday ? ` \xB7 +${nToday} hoy` : ""), /* @__PURE__ */ React.createElement("div", { style: { width: 220, maxWidth: "100%", height: 4, borderRadius: 99, background: "rgba(255,255,255,0.07)", overflow: "hidden", marginTop: 9 } }, /* @__PURE__ */ React.createElement("div", { style: { width: `${pct}%`, height: "100%", background: "var(--accent)", borderRadius: 99, transition: "width .2s" } }))),
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 26, alignItems: "center", flexShrink: 0 } }, [
        { v: leads.length, l: "Leads", c: "var(--text)" },
        { v: contacted, l: "Contactados", c: "#60a5fa" },
        { v: replied, l: "Respuestas", c: "var(--green)" },
        { v: won, l: "Ganados", c: "var(--accent)" }
      ].map((s, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { textAlign: "center", minWidth: 56 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 17, fontWeight: 600, fontFamily: "var(--font-display)", letterSpacing: "-0.4px", color: s.c } }, s.v), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "var(--text-subtle)", marginTop: 1 } }, s.l))), /* @__PURE__ */ React.createElement(Icon, { name: "chevron-right", size: 14, style: { color: "rgba(255,255,255,0.18)" } }))
    );
  })), /* @__PURE__ */ React.createElement(CampaignSetup, { open: setupOpen, onClose: () => setSetupOpen(false), onCreated }));
};
window.CampaignsPage = CampaignsPage;
window.CampaignDetail = CampaignDetail;

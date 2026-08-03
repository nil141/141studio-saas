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
  scheduled: { label: "Programado", color: "#eec06a", dot: "#eec06a" },
  contacted: { label: "Contactado", color: "#60a5fa", dot: "#60a5fa" },
  replied: { label: "Respondi\xF3", color: "var(--green)", dot: "var(--green)" },
  won: { label: "Ganado", color: "var(--accent)", dot: "var(--accent)" },
  discarded: { label: "Descartado", color: "var(--text-subtle)", dot: "rgba(255,255,255,0.18)" }
};
const STATUS_ORDER = ["new", "scheduled", "contacted", "replied", "won", "discarded"];
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
  email: ["email", "correo", "e-mail", "mail", "email address", "work email", "correo electronico", "correo electr\xF3nico", "personal email"],
  phone: ["phone", "phone number", "telefono", "tel\xE9fono", "tel", "movil", "m\xF3vil", "mobile", "mobile number", "mobile phone", "work direct phone", "corporate phone", "company phone number"],
  website: ["website", "web", "url", "dominio", "sitio", "pagina", "p\xE1gina", "company website", "website url", "site", "domain", "company domain"],
  linkedin: ["linkedin", "linkedin url", "linkedin profile", "perfil linkedin", "linkedin person"],
  sector: ["sector", "industry", "industria", "categoria", "categor\xEDa", "nicho", "tipo", "vertical"],
  title: ["title", "cargo", "puesto", "job title", "position", "rol"],
  audit: ["audit", "auditoria", "auditor\xEDa", "observaciones"],
  notes: ["notes", "notas", "nota", "comentarios"],
  subject: ["subject", "asunto"],
  draft: ["draft", "borrador", "mensaje", "cuerpo"],
  // Campos que no tienen columna propia pero enriquecen las notas del lead
  _seniority: ["seniority", "nivel", "seniority level"],
  _city: ["city", "ciudad", "localidad"],
  _region: ["state", "provincia", "regi\xF3n", "region", "estado"],
  _country: ["country", "pa\xEDs", "pais"]
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
    if (lead.linkedin && !/^https?:\/\//i.test(lead.linkedin)) {
      lead.linkedin = "https://" + lead.linkedin.replace(/^\/+/, "");
    }
    const extra = [];
    if (lead.title) extra.push(`Cargo: ${lead.title}${lead._seniority ? ` \xB7 ${lead._seniority}` : ""}`);
    const loc = [lead._city, lead._region, lead._country].filter(Boolean).join(", ");
    if (loc) extra.push(`\u{1F4CD} ${loc}`);
    if (lead.notes) extra.push(lead.notes);
    const merged = extra.filter(Boolean).join(" \xB7 ");
    if (merged) lead.notes = merged;
    delete lead.title;
    delete lead._seniority;
    delete lead._city;
    delete lead._region;
    delete lead._country;
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
const _cNowLocal = () => {
  const n = /* @__PURE__ */ new Date();
  const p = (x) => String(x).padStart(2, "0");
  return `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())}T${p(n.getHours())}:${p(n.getMinutes())}`;
};
const _cFmtWhen = (s) => {
  if (!s) return "\u2014";
  const [d, t] = s.split("T");
  const day = _cFmtDay(d);
  return t ? `${day} ${t}` : day;
};
const _cAddDays = (n) => {
  const d = /* @__PURE__ */ new Date();
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const _digits = (s) => (s || "").replace(/[^\d]/g, "");
const _waLink = (phone, text) => {
  const p = _digits(phone);
  if (!p) return null;
  return `https://wa.me/${p}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
};
const _mailtoLink = (email, subject, body) => {
  if (!email) return null;
  const q = [];
  if (subject) q.push(`subject=${encodeURIComponent(subject)}`);
  if (body) q.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${email}${q.length ? "?" + q.join("&") : ""}`;
};
const FU_CH = {
  email: { label: "Email", icon: "mail" },
  whatsapp: { label: "WhatsApp", icon: "msg-circle" },
  call: { label: "Llamada", icon: "phone" }
};
const FU_ORDER = ["email", "whatsapp", "call"];
const _leadNextDue = (l) => {
  const p = (Array.isArray(l.followUps) ? l.followUps : []).filter((s) => !s.done && s.date).map((s) => s.date).sort();
  return p.length ? p[0] : null;
};
const CampMiniStat = ({ label, value, sub, color }) => /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-subtle)", marginBottom: 6 } }, label), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 24, fontWeight: 600, fontFamily: "var(--font-display)", letterSpacing: "-0.5px", color: color || "var(--text)" } }, value), sub && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--text-muted)", marginTop: 3, letterSpacing: "-0.2px" } }, sub));
const LeadStatusPill = ({ value, onChange, scheduledFor }) => {
  const [open, setOpen] = useState(false);
  const [picking, setPicking] = useState(false);
  const [schedVal, setSchedVal] = useState("");
  useEffect(() => {
    if (!open) {
      setPicking(false);
      return;
    }
    const close = () => {
      setOpen(false);
      setPicking(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);
  const st = LEAD_STATUS[value] || LEAD_STATUS.new;
  const label = value === "scheduled" && scheduledFor ? `${st.label} \xB7 ${_cFmtWhen(scheduledFor)}` : st.label;
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
        transition: "background .1s",
        whiteSpace: "nowrap"
      },
      onMouseEnter: (e) => e.currentTarget.style.background = "rgba(255,255,255,0.08)",
      onMouseLeave: (e) => e.currentTarget.style.background = "rgba(255,255,255,0.04)"
    },
    /* @__PURE__ */ React.createElement("span", { style: { width: 6, height: 6, borderRadius: "50%", background: st.dot, flexShrink: 0 } }),
    label,
    /* @__PURE__ */ React.createElement(Icon, { name: "chevron-down", size: 11, style: { opacity: 0.5 } })
  ), open && /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    right: 0,
    top: "calc(100% + 6px)",
    zIndex: 60,
    minWidth: 180,
    background: "#1a1a1c",
    border: "0.5px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 5,
    boxShadow: "0 8px 32px rgba(0,0,0,0.5)"
  } }, STATUS_ORDER.map((k) => {
    const s = LEAD_STATUS[k];
    if (k === "scheduled") {
      return /* @__PURE__ */ React.createElement("div", { key: k }, /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: (e) => {
            e.stopPropagation();
            if (!picking) setSchedVal(scheduledFor && scheduledFor.includes("T") ? scheduledFor : _cNowLocal());
            setPicking((p) => !p);
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
        s.label,
        /* @__PURE__ */ React.createElement(Icon, { name: "calendar", size: 12, style: { marginLeft: "auto", opacity: 0.6 } })
      ), picking && /* @__PURE__ */ React.createElement("div", { style: { padding: "4px 8px 8px", display: "flex", flexDirection: "column", gap: 6 }, onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "datetime-local",
          autoFocus: true,
          value: schedVal,
          onClick: (e) => e.stopPropagation(),
          onChange: (e) => setSchedVal(e.target.value),
          onKeyDown: (e) => {
            if (e.key === "Enter" && schedVal) {
              setOpen(false);
              setPicking(false);
              onChange("scheduled", schedVal);
            }
          },
          style: {
            width: "100%",
            background: "rgba(255,255,255,0.06)",
            border: "0.5px solid var(--border-strong)",
            borderRadius: 8,
            color: "var(--text)",
            fontSize: 12,
            padding: "6px 9px",
            fontFamily: "inherit",
            outline: "none"
          }
        }
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: (e) => {
            e.stopPropagation();
            if (schedVal) {
              setOpen(false);
              setPicking(false);
              onChange("scheduled", schedVal);
            }
          },
          style: {
            width: "100%",
            background: "rgba(238,192,106,0.14)",
            border: "0.5px solid rgba(238,192,106,0.4)",
            borderRadius: 8,
            color: "#eec06a",
            fontSize: 12,
            padding: "6px 9px",
            fontFamily: "inherit",
            cursor: "pointer",
            fontWeight: 500
          }
        },
        "Programar"
      )));
    }
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
const LeadsSpark = ({ leads, days: nDays = 14, height = 192, dateField = "date" }) => {
  const gradId = useRef(null);
  if (!gradId.current) gradId.current = "leadsGrad" + ++_sparkGradSeq;
  const days = Array.from({ length: nDays }, (_, i) => {
    const d = /* @__PURE__ */ new Date();
    d.setDate(d.getDate() - (nDays - 1 - i));
    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return { ds, v: leads.filter((x) => (x[dateField] || "").slice(0, 10) === ds).length, lab: d.getDate() };
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
const CampFunnel = ({ stages }) => {
  const top = stages[0] ? stages[0].v : 0;
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } }, stages.map((s, i) => {
    const prev = i > 0 ? stages[i - 1].v : null;
    const wOfTop = top ? s.v / top * 100 : 0;
    const stepPct = prev != null ? prev ? Math.round(s.v / prev * 100) : 0 : null;
    const op = 0.85 - i * 0.16;
    return /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", alignItems: "center", gap: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 104, flexShrink: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: "var(--text)", letterSpacing: "-0.2px" } }, s.label), stepPct != null && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10.5, color: "var(--text-subtle)", marginTop: 1 } }, stepPct, "% de ", stages[i - 1].label.toLowerCase())), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, height: 26, borderRadius: 7, background: "rgba(255,255,255,0.04)", overflow: "hidden", position: "relative" } }, /* @__PURE__ */ React.createElement("div", { style: {
      width: `${Math.max(wOfTop, s.v > 0 ? 2 : 0)}%`,
      height: "100%",
      borderRadius: 7,
      background: `rgba(158,154,229,${Math.max(op, 0.22)})`,
      transition: "width .3s"
    } })), /* @__PURE__ */ React.createElement("div", { style: { width: 44, textAlign: "right", flexShrink: 0 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14.5, fontWeight: 600, color: "var(--text)", fontFamily: "var(--font-display)" } }, s.v)));
  }));
};
const CampaignAnalytics = ({ c }) => {
  const leads = c.leads || [];
  const nStatus = (s) => leads.filter((l) => l.status === s).length;
  const total = leads.length;
  const nNew = nStatus("new");
  const nScheduled = nStatus("scheduled");
  const contacted = nStatus("contacted") + nStatus("replied") + nStatus("won");
  const replied = nStatus("replied") + nStatus("won");
  const won = nStatus("won");
  const discarded = nStatus("discarded");
  if (!leads.length) return /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", padding: "70px 0", color: "var(--text-subtle)", fontSize: 13.5, letterSpacing: "-0.3px" } }, "Sin datos todav\xEDa \u2014 las anal\xEDticas aparecen cuando la campa\xF1a tiene leads.");
  const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
  const contactRate = pct(contacted, total);
  const replyRate = pct(replied, contacted);
  const winRate = pct(won, contacted);
  const bySector = {};
  leads.forEach((l) => {
    const s = (l.sector || "Sin sector").trim() || "Sin sector";
    bySector[s] = (bySector[s] || 0) + 1;
  });
  const sectors = Object.entries(bySector).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([label, v]) => ({ label, v, color: "rgba(158,154,229,0.55)" }));
  const SRC = { cowork: "Claude Cowork", csv: "CSV", manual: "A mano", api: "API" };
  const bySrc = {};
  leads.forEach((l) => {
    const s = SRC[l.source] || "Claude Cowork";
    bySrc[s] = (bySrc[s] || 0) + 1;
  });
  const sources = Object.entries(bySrc).sort((a, b) => b[1] - a[1]).map(([label, v]) => ({ label, v, color: "rgba(158,154,229,0.35)" }));
  const worked = leads.filter((l) => l.workedAt);
  const funnelStages = [
    { label: "Leads", v: total },
    { label: "Contactados", v: contacted },
    { label: "Respondieron", v: replied },
    { label: "Ganados", v: won }
  ];
  const cardStyle = { background: "var(--bg-elev-1)", border: "0.5px solid var(--border)", borderRadius: 16, padding: "18px 20px" };
  const cardTitle = { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-subtle)", marginBottom: 14 };
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 16, paddingBottom: 24 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 26, padding: "4px 2px 16px", borderBottom: "0.5px solid var(--border)", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(CampMiniStat, { label: "Leads", value: total, sub: nNew ? `${nNew} sin contactar` : "todos trabajados" }), /* @__PURE__ */ React.createElement(CampMiniStat, { label: "Contactados", value: contacted, sub: `${contactRate}% del total` }), /* @__PURE__ */ React.createElement(CampMiniStat, { label: "Tasa de respuesta", value: contacted ? `${replyRate}%` : "\u2014", sub: `${replied} ${replied === 1 ? "respuesta" : "respuestas"}` }), /* @__PURE__ */ React.createElement(CampMiniStat, { label: "Tasa de cierre", value: contacted ? `${winRate}%` : "\u2014", sub: `${won} ${won === 1 ? "ganado" : "ganados"}` }), /* @__PURE__ */ React.createElement(CampMiniStat, { label: "Programados", value: nScheduled, sub: nScheduled ? "pr\xF3ximos contactos" : "\u2014" })), c.goal > 0 && /* @__PURE__ */ React.createElement("div", { style: cardStyle }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { style: cardTitle }, "Objetivo \xB7 clientes cerrados"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "var(--text-muted)" } }, /* @__PURE__ */ React.createElement("b", { style: { color: "var(--accent)", fontSize: 16 } }, won), " / ", c.goal, won >= c.goal && /* @__PURE__ */ React.createElement("span", { style: { color: "var(--accent)", marginLeft: 8 } }, "\xA1Conseguido!"))), /* @__PURE__ */ React.createElement("div", { style: { height: 8, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: {
    width: `${Math.min(100, won / c.goal * 100)}%`,
    height: "100%",
    background: "var(--accent)",
    borderRadius: 99,
    transition: "width .3s"
  } }))), /* @__PURE__ */ React.createElement("div", { style: cardStyle }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { ...cardTitle, marginBottom: 0 } }, "Embudo de conversi\xF3n"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--text-subtle)", letterSpacing: "-0.2px" } }, nNew, " nuevos \xB7 ", discarded, " descartados")), /* @__PURE__ */ React.createElement(CampFunnel, { stages: funnelStages })), /* @__PURE__ */ React.createElement("div", { style: cardStyle }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { ...cardTitle, marginBottom: 0 } }, "Actividad de contacto \xB7 \xFAltimos 30 d\xEDas"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--text-subtle)" } }, worked.length, " trabajados en total")), worked.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { padding: "40px 0", textAlign: "center", color: "var(--text-subtle)", fontSize: 12.5, letterSpacing: "-0.2px" } }, "A\xFAn no has trabajado ning\xFAn lead \u2014 la actividad aparecer\xE1 aqu\xED a medida que los contactes.") : /* @__PURE__ */ React.createElement(LeadsSpark, { leads, days: 30, dateField: "workedAt" })), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 } }, /* @__PURE__ */ React.createElement("div", { style: cardStyle }, /* @__PURE__ */ React.createElement("div", { style: cardTitle }, "Por sector"), /* @__PURE__ */ React.createElement(HBars, { items: sectors, total })), /* @__PURE__ */ React.createElement("div", { style: cardStyle }, /* @__PURE__ */ React.createElement("div", { style: cardTitle }, "Origen de los leads"), /* @__PURE__ */ React.createElement(HBars, { items: sources, total }))));
};
const CampaignSettings = ({ c, reload, onRemove, onCSV, onManual, onCowork }) => {
  const toast = useToast();
  const [name, setName] = useState(c.name);
  const [ctype, setCtype] = useState(c.ctype || "cowork");
  const [goal, setGoal] = useState(String(c.goal || ""));
  const [dailyGoal, setDailyGoal] = useState(String(c.dailyGoal || ""));
  useEffect(() => {
    setName(c.name);
    setCtype(c.ctype || "cowork");
    setGoal(String(c.goal || ""));
    setDailyGoal(String(c.dailyGoal || ""));
  }, [c.id]);
  const dirty = name.trim() !== c.name || ctype !== (c.ctype || "cowork") || (parseInt(goal || 0, 10) || 0) !== (c.goal || 0) || (parseInt(dailyGoal || 0, 10) || 0) !== (c.dailyGoal || 0);
  const save = async () => {
    if (!name.trim()) {
      toast("El nombre no puede quedar vac\xEDo", "warn");
      return;
    }
    const r = await window.apiFetch("/api/campaigns/update", { campaignId: c.id, name: name.trim(), ctype, goal: parseInt(goal || 0, 10) || 0, dailyGoal: parseInt(dailyGoal || 0, 10) || 0 });
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
  })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 20, flexWrap: "wrap", marginTop: 16 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Objetivo \xB7 clientes a cerrar ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-subtle)" } }, "(opcional)")), /* @__PURE__ */ React.createElement(
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
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Meta diaria \xB7 leads a trabajar/d\xEDa"), /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "input",
      type: "number",
      min: "0",
      placeholder: "15",
      value: dailyGoal,
      onChange: (e) => setDailyGoal(e.target.value),
      style: { maxWidth: 160 }
    }
  ))), dirty && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 16 } }, /* @__PURE__ */ React.createElement("button", { className: "btn primary sm", onClick: save }, /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 12 }), " Guardar cambios"))), /* @__PURE__ */ React.createElement("div", { style: cardStyle }, /* @__PURE__ */ React.createElement("div", { style: cardTitle }, "Fuentes de leads"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column" } }, conns.map((cn, i) => /* @__PURE__ */ React.createElement("div", { key: i, onClick: cn.onClick, className: "task-row", style: {
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
const _LeadSection = ({ icon, title, right, children }) => /* @__PURE__ */ React.createElement("div", { style: { marginTop: 16, paddingTop: 16, borderTop: "0.5px solid var(--border)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-subtle)", display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement(Icon, { name: icon, size: 12 }), " ", title), right), children);
const LeadRow = ({ l, last, open, onToggle, onStatus, onDelete, onCopy, onSave, today }) => {
  const toast = useToast();
  const st = LEAD_STATUS[l.status] || LEAD_STATUS.new;
  const TEXT_KEYS = ["name", "company", "email", "phone", "website", "linkedin", "instagram", "sector", "audit", "subject", "draft", "whatsapp", "notes"];
  const [f, setF] = useState({});
  const [fu, setFu] = useState([]);
  useEffect(() => {
    if (open) {
      const o = {};
      TEXT_KEYS.forEach((k) => o[k] = l[k] || "");
      setF(o);
      setFu(Array.isArray(l.followUps) ? l.followUps.map((x) => ({ ...x })) : []);
    }
  }, [open, l.id]);
  const set = (k) => (e) => setF((prev) => ({ ...prev, [k]: e.target.value }));
  const baseFu = Array.isArray(l.followUps) ? l.followUps : [];
  const fuChanged = JSON.stringify(fu) !== JSON.stringify(baseFu);
  const dirty = TEXT_KEYS.some((k) => (f[k] || "") !== (l[k] || "")) || fuChanged;
  const save = () => onSave({ ...f, followUps: fu });
  const addFU = () => setFu((prev) => [...prev, { id: "fu" + Math.random().toString(36).slice(2, 8), date: _cAddDays(3), note: "", channel: "email", done: false }]);
  const updFU = (i, patch) => setFu((prev) => prev.map((s, j) => j === i ? { ...s, ...patch } : s));
  const rmFU = (i) => setFu((prev) => prev.filter((_, j) => j !== i));
  const cycleCh = (i) => {
    const idx = FU_ORDER.indexOf(fu[i].channel);
    updFU(i, { channel: FU_ORDER[(idx + 1) % FU_ORDER.length] });
  };
  const done = { audit: !!l.audit, email: !!l.draft, whatsapp: !!l.whatsapp };
  const nextDue = _leadNextDue(l);
  const overdue = nextDue && nextDue < today;
  const copyText = (text, label) => navigator.clipboard.writeText(text || "").then(() => toast(`${label} copiado`, "success")).catch(() => toast("No se pudo copiar", "warn"));
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
  const miniBtn = { fontSize: 11.5, padding: "5px 10px" };
  const emailHref = _mailtoLink(f.email, f.subject, f.draft);
  const waHref = _waLink(f.phone, f.whatsapp);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { onClick: onToggle, className: "task-row", style: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "13px 4px",
    cursor: "pointer",
    borderBottom: last && !open ? "none" : "0.5px solid var(--border)"
  } }, /* @__PURE__ */ React.createElement("span", { style: { width: 7, height: 7, borderRadius: "50%", background: st.dot, flexShrink: 0 } }), /* @__PURE__ */ React.createElement("div", { style: { flex: "1.4 1 0", minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, letterSpacing: "-0.4px", color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "flex", alignItems: "center", gap: 7 } }, l.name, l.linkedin && /* @__PURE__ */ React.createElement(
    "a",
    {
      href: l.linkedin,
      target: "_blank",
      rel: "noopener noreferrer",
      onClick: (e) => e.stopPropagation(),
      "data-tooltip": "Ver LinkedIn",
      style: { color: "var(--text-subtle)", display: "inline-flex", flexShrink: 0 }
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "external-link", size: 11 })
  ), nextDue && /* @__PURE__ */ React.createElement(
    Icon,
    {
      name: "clock",
      size: 11,
      style: { color: overdue ? "var(--red)" : "var(--accent)", flexShrink: 0 },
      "data-tooltip": `${overdue ? "Seguimiento vencido" : "Pr\xF3ximo seguimiento"} \xB7 ${_cFmtDay(nextDue)}`
    }
  )), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--text-subtle)", marginTop: 2, letterSpacing: "-0.2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, l.company || "\u2014", l.sector ? ` \xB7 ${l.sector}` : "")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 14, flex: "1 1 0", minWidth: 0 } }, l.email && /* @__PURE__ */ React.createElement(
    "a",
    {
      href: `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(l.email)}`,
      target: "_blank",
      rel: "noopener noreferrer",
      onClick: (e) => e.stopPropagation(),
      className: "lead-act",
      "data-tooltip": `Escribir a ${l.email}`
    },
    /* @__PURE__ */ React.createElement(SiIcon, { name: "gmail", size: 16 })
  ), (l.instagram || "").trim() && /* @__PURE__ */ React.createElement(
    "a",
    {
      href: `https://ig.me/m/${(l.instagram || "").replace(/^@/, "").trim()}`,
      target: "_blank",
      rel: "noopener noreferrer",
      onClick: (e) => e.stopPropagation(),
      className: "lead-act",
      "data-tooltip": "Mensaje de Instagram"
    },
    /* @__PURE__ */ React.createElement(SiIcon, { name: "instagram", size: 16 })
  ), (l.phone || "").replace(/[^\d]/g, "") && /* @__PURE__ */ React.createElement(
    "a",
    {
      href: `https://wa.me/${(l.phone || "").replace(/[^\d]/g, "")}`,
      target: "_blank",
      rel: "noopener noreferrer",
      onClick: (e) => e.stopPropagation(),
      className: "lead-act",
      "data-tooltip": "WhatsApp"
    },
    /* @__PURE__ */ React.createElement(SiIcon, { name: "whatsapp", size: 16 })
  )), /* @__PURE__ */ React.createElement(LeadStatusPill, { value: l.status, scheduledFor: l.scheduledFor, onChange: onStatus }), /* @__PURE__ */ React.createElement(Icon, { name: "chevron-down", size: 13, style: {
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
  } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-subtle)", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement(Icon, { name: "user-cog", size: 12 }), " Datos del lead"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 } }, field("Nombre", "name", "Nombre"), field("Empresa", "company", "Empresa"), field("Sector", "sector", "Sector"), field("Email", "email", "email@\u2026", "email"), field("Tel\xE9fono", "phone", "+34 \u2026"), field("Instagram", "instagram", "@usuario"), field("Web", "website", "empresa.com"), field("LinkedIn", "linkedin", "linkedin.com/in/\u2026")), /* @__PURE__ */ React.createElement(_LeadSection, { icon: "search", title: "Auditor\xEDa del ecommerce" }, /* @__PURE__ */ React.createElement(
    "textarea",
    {
      className: "input",
      rows: 3,
      placeholder: "Hallazgos: qu\xE9 le falla a su tienda, oportunidades, \xE1ngulo para el mensaje\u2026",
      value: f.audit || "",
      onChange: set("audit"),
      style: { padding: "9px 12px", fontSize: 13, resize: "vertical", lineHeight: 1.6, width: "100%" }
    }
  )), /* @__PURE__ */ React.createElement(_LeadSection, { icon: "mail", title: "Email", right: /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 7 } }, /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", style: miniBtn, onClick: () => copyText((f.subject ? `Asunto: ${f.subject}

` : "") + (f.draft || ""), "Email") }, /* @__PURE__ */ React.createElement(Icon, { name: "file", size: 11 }), " Copiar"), /* @__PURE__ */ React.createElement(
    "a",
    {
      className: "btn sm",
      style: { ...miniBtn, opacity: emailHref ? 1 : 0.4, pointerEvents: emailHref ? "auto" : "none" },
      href: emailHref || void 0,
      target: "_blank",
      rel: "noopener noreferrer"
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "send", size: 11 }),
    " Abrir"
  )) }, /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "input",
      placeholder: "Asunto",
      value: f.subject || "",
      onChange: set("subject"),
      style: { padding: "8px 11px", fontSize: 12.5, marginBottom: 8, width: "100%" }
    }
  ), /* @__PURE__ */ React.createElement(
    "textarea",
    {
      className: "input",
      rows: 4,
      placeholder: "Cuerpo del correo\u2026",
      value: f.draft || "",
      onChange: set("draft"),
      style: { padding: "9px 12px", fontSize: 13, resize: "vertical", lineHeight: 1.6, width: "100%" }
    }
  )), /* @__PURE__ */ React.createElement(_LeadSection, { icon: "msg-circle", title: "WhatsApp", right: /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 7 } }, /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", style: miniBtn, onClick: () => copyText(f.whatsapp, "Mensaje") }, /* @__PURE__ */ React.createElement(Icon, { name: "file", size: 11 }), " Copiar"), /* @__PURE__ */ React.createElement(
    "a",
    {
      className: "btn sm",
      style: { ...miniBtn, opacity: waHref ? 1 : 0.4, pointerEvents: waHref ? "auto" : "none" },
      href: waHref || void 0,
      target: "_blank",
      rel: "noopener noreferrer",
      "data-tooltip": waHref ? "" : "A\xF1ade un tel\xE9fono"
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "msg-circle", size: 11 }),
    " Abrir"
  )) }, /* @__PURE__ */ React.createElement(
    "textarea",
    {
      className: "input",
      rows: 3,
      placeholder: "Mensaje de WhatsApp\u2026",
      value: f.whatsapp || "",
      onChange: set("whatsapp"),
      style: { padding: "9px 12px", fontSize: 13, resize: "vertical", lineHeight: 1.6, width: "100%" }
    }
  )), /* @__PURE__ */ React.createElement(_LeadSection, { icon: "clock", title: "Seguimientos", right: /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", style: miniBtn, onClick: addFU }, /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 11 }), " A\xF1adir") }, fu.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: "var(--text-subtle)", padding: "2px 0 2px" } }, "Sin seguimientos programados.") : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, fu.map((s, i) => {
    const ch = FU_CH[s.channel] || FU_CH.email;
    const isOver = !s.done && s.date && s.date < today;
    return /* @__PURE__ */ React.createElement("div", { key: s.id || i, style: { display: "flex", alignItems: "center", gap: 9 } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => updFU(i, { done: !s.done }),
        "data-tooltip": s.done ? "Hecho" : "Marcar hecho",
        style: {
          width: 18,
          height: 18,
          borderRadius: 6,
          flexShrink: 0,
          cursor: "pointer",
          background: s.done ? "var(--accent)" : "transparent",
          border: `1.5px solid ${s.done ? "var(--accent)" : "var(--border)"}`,
          display: "grid",
          placeItems: "center",
          color: "#fff"
        }
      },
      s.done && /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 11 })
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => cycleCh(i),
        "data-tooltip": `Canal: ${ch.label} (clic para cambiar)`,
        style: {
          width: 30,
          height: 30,
          borderRadius: 8,
          flexShrink: 0,
          cursor: "pointer",
          background: "rgba(255,255,255,0.04)",
          border: "0.5px solid var(--border)",
          display: "grid",
          placeItems: "center",
          color: "var(--text-muted)"
        }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: ch.icon, size: 13 })
    ), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "date",
        className: "input",
        value: s.date || "",
        onChange: (e) => updFU(i, { date: e.target.value }),
        style: { padding: "6px 9px", fontSize: 12, width: 140, flexShrink: 0, color: isOver ? "var(--red)" : "var(--text)" }
      }
    ), /* @__PURE__ */ React.createElement(
      "input",
      {
        className: "input",
        placeholder: "Nota del seguimiento\u2026",
        value: s.note || "",
        onChange: (e) => updFU(i, { note: e.target.value }),
        style: { padding: "6px 10px", fontSize: 12.5, flex: 1, textDecoration: s.done ? "line-through" : "none", opacity: s.done ? 0.6 : 1 }
      }
    ), /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", style: { padding: "5px 8px" }, onClick: () => rmFU(i), "data-tooltip": "Quitar" }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 12 })));
  }))), /* @__PURE__ */ React.createElement(_LeadSection, { icon: "edit", title: "Notas internas" }, /* @__PURE__ */ React.createElement(
    "textarea",
    {
      className: "input",
      rows: 2,
      placeholder: "Contexto, cargo, ubicaci\xF3n, recordatorios\u2026",
      value: f.notes || "",
      onChange: set("notes"),
      style: { padding: "8px 11px", fontSize: 12.5, resize: "vertical", lineHeight: 1.55, width: "100%" }
    }
  )), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, paddingTop: 14, borderTop: "0.5px solid var(--border)" } }, /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: onDelete, style: { color: "var(--red)" } }, /* @__PURE__ */ React.createElement(Icon, { name: "trash", size: 12 }), " Eliminar lead"), /* @__PURE__ */ React.createElement("button", { className: "btn primary sm", onClick: save, disabled: !dirty, style: { opacity: dirty ? 1 : 0.45 } }, /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 12 }), " Guardar"))));
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
  const empty = { name: "", company: "", email: "", phone: "", website: "", sector: "", instagram: "" };
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
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 13 } }, field("Nombre", "name", "Ej. Mar\xEDa L\xF3pez"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, field("Empresa", "company", "Ej. Joyas Alba"), field("Sector", "sector", "Ej. joyer\xEDa")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, field("Email", "email", "hola@empresa.com", "email"), field("Tel\xE9fono", "phone", "+34 \u2026")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, field("Instagram", "instagram", "@usuario"), field("Web", "website", "empresa.com")))
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
    if (!Array.isArray(camps)) return;
    const camp = camps.find((x) => x.id === campaignId);
    if (!camp) return;
    const now = _cNowLocal();
    const t = _cToday();
    const due = (camp.leads || []).filter((l) => l.status === "scheduled" && l.scheduledFor && l.scheduledFor <= now);
    if (!due.length) return;
    let cancelled = false;
    (async () => {
      for (const l of due) {
        try {
          await window.apiFetch("/api/campaigns/update_lead", {
            campaignId: camp.id,
            leadId: l.id,
            status: "contacted",
            fields: { scheduledFor: "", workedAt: l.workedAt !== t ? t : l.workedAt || "" }
          });
        } catch (e) {
        }
      }
      if (!cancelled) reload();
    })();
    return () => {
      cancelled = true;
    };
  }, [camps, campaignId]);
  useEffect(() => {
    if (!Array.isArray(camps)) return;
    const camp = camps.find((x) => x.id === campaignId);
    if (!camp) return;
    const pending = (camp.leads || []).some((l) => l.status === "scheduled" && l.scheduledFor);
    if (!pending) return;
    const id = setInterval(() => reload(), 6e4);
    return () => clearInterval(id);
  }, [camps, campaignId]);
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
  const dailyGoal = c.dailyGoal || 15;
  const workedToday = leads.filter((l) => l.workedAt === today).length;
  const visible = leads.filter((l) => {
    if (filter !== "all" && l.status !== filter) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return [l.name, l.company, l.email, l.website, l.sector].some((v) => (v || "").toLowerCase().includes(q));
    }
    return true;
  });
  const setStatus = async (l, status, scheduledFor) => {
    try {
      const fields = {};
      if (["contacted", "replied", "won"].includes(status) && l.workedAt !== today) fields.workedAt = today;
      fields.scheduledFor = status === "scheduled" ? scheduledFor || _cNowLocal() : "";
      await window.apiFetch("/api/campaigns/update_lead", { campaignId: c.id, leadId: l.id, status, fields });
      reload();
    } catch (e) {
      toast("Error al guardar", "warn");
    }
  };
  const saveLead = async (l, fields) => {
    try {
      const payload = { ...fields };
      if ((payload.audit || "").trim() && l.workedAt !== today) payload.workedAt = today;
      const r = await window.apiFetch("/api/campaigns/update_lead", { campaignId: c.id, leadId: l.id, fields: payload });
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
  const openNext = () => {
    const next = leads.slice().reverse().find((l) => l.status === "new" && l.workedAt !== today);
    if (!next) {
      toast("No quedan leads nuevos por trabajar \u{1F389}", "success");
      return;
    }
    setFilter("all");
    setQuery("");
    setOpenId(next.id);
    setTimeout(() => {
      var _a;
      return (_a = document.getElementById("lead-" + next.id)) == null ? void 0 : _a.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 60);
  };
  const exportCSV = () => {
    if (!leads.length) {
      toast("No hay leads que exportar", "warn");
      return;
    }
    const cols = ["name", "company", "email", "phone", "website", "linkedin", "sector", "status", "date", "notes", "subject", "draft", "whatsapp", "audit"];
    const head = ["Nombre", "Empresa", "Email", "Tel\xE9fono", "Web", "LinkedIn", "Sector", "Estado", "Fecha", "Notas", "Asunto", "Email", "WhatsApp", "Auditor\xEDa"];
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
  )), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 26, borderBottom: "0.5px solid var(--border)", marginBottom: 18 } }, [
    { id: "leads", label: "Leads", n: leads.length },
    { id: "stats", label: "Anal\xEDticas", n: null },
    { id: "config", label: "Ajustes", n: null }
  ].map((t) => {
    const on = view === t.id;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: t.id,
        onClick: () => setView(t.id),
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "0 1px 12px",
          cursor: "pointer",
          fontFamily: "inherit",
          background: "transparent",
          border: 0,
          borderBottom: on ? "1.5px solid var(--text)" : "1.5px solid transparent",
          marginBottom: "-0.5px",
          color: on ? "var(--text)" : "var(--text-subtle)",
          fontSize: 13.5,
          letterSpacing: "-0.3px",
          fontWeight: on ? 500 : 400,
          transition: "color .12s"
        },
        onMouseEnter: (e) => {
          if (!on) e.currentTarget.style.color = "var(--text-muted)";
        },
        onMouseLeave: (e) => {
          if (!on) e.currentTarget.style.color = "var(--text-subtle)";
        }
      },
      t.label,
      t.n != null && /* @__PURE__ */ React.createElement("span", { style: {
        fontSize: 11,
        minWidth: 18,
        textAlign: "center",
        padding: "1px 6px",
        borderRadius: 99,
        background: on ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)",
        color: on ? "var(--text-muted)" : "var(--text-subtle)"
      } }, t.n)
    );
  })), view === "leads" && leads.length > 0 && (() => {
    const pct = Math.min(100, Math.round(workedToday / dailyGoal * 100));
    const doneDay = workedToday >= dailyGoal;
    return /* @__PURE__ */ React.createElement("div", { style: {
      display: "flex",
      alignItems: "center",
      gap: 16,
      marginBottom: 12,
      background: "var(--bg-elev-1)",
      border: "0.5px solid var(--border)",
      borderRadius: 12,
      padding: "12px 16px"
    } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: doneDay ? "var(--green)" : "var(--accent)", fontWeight: 600, flexShrink: 0 } }, "Hoy"), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 80 } }, /* @__PURE__ */ React.createElement("div", { style: { height: 7, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: {
      width: `${pct}%`,
      height: "100%",
      borderRadius: 99,
      transition: "width .3s",
      background: doneDay ? "var(--green)" : "var(--accent)"
    } }))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: "var(--text-muted)", flexShrink: 0, letterSpacing: "-0.2px" } }, /* @__PURE__ */ React.createElement("b", { style: { color: doneDay ? "var(--green)" : "var(--text)", fontSize: 14 } }, workedToday), /* @__PURE__ */ React.createElement("span", { style: { opacity: 0.6 } }, " / ", dailyGoal, " trabajados"), doneDay && /* @__PURE__ */ React.createElement("span", { style: { color: "var(--green)", marginLeft: 8 } }, "\xA1Objetivo del d\xEDa! \u{1F389}")), /* @__PURE__ */ React.createElement("button", { className: "btn primary sm", onClick: openNext, style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement(Icon, { name: "arrow", size: 12 }), " Siguiente"));
  })(), view === "leads" && leads.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" } }, FILTERS.map((f) => {
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
  ) : leads.length === 0 ? /* @__PURE__ */ React.createElement(ConnectPanel, { onCSV: pickCSV, onManual: () => setAddingLead(true), onCowork: () => setCoworkOpen(true) }) : visible.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", padding: "60px 0", color: "var(--text-subtle)", fontSize: 13.5, letterSpacing: "-0.3px" } }, "Ning\xFAn lead coincide con el filtro.") : visible.map((l, i) => /* @__PURE__ */ React.createElement("div", { key: l.id, id: "lead-" + l.id }, /* @__PURE__ */ React.createElement(
    LeadRow,
    {
      l,
      last: i === visible.length - 1,
      today,
      open: openId === l.id,
      onToggle: () => setOpenId(openId === l.id ? null : l.id),
      onStatus: (s, d) => setStatus(l, s, d),
      onDelete: () => removeLead(l),
      onCopy: () => copyDraft(l),
      onSave: (fields) => saveLead(l, fields)
    }
  )))), csvInput, /* @__PURE__ */ React.createElement(AddLeadModal, { open: addingLead, onClose: () => setAddingLead(false), campaignId: c.id, onDone: reload }), /* @__PURE__ */ React.createElement(CoworkConnectModal, { open: coworkOpen, onClose: () => setCoworkOpen(false), campaignName: c.name }));
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
  const [hoverId, setHoverId] = useState(null);
  const confirm = useConfirm();
  const toast = useToast();
  const removeCampaign = async (c, e) => {
    e == null ? void 0 : e.stopPropagation();
    const n = (c.leads || []).length;
    const ok = await confirm({ title: "\xBFEliminar la campa\xF1a?", body: `Se eliminar\xE1 "${c.name}"${n ? ` con sus ${n} leads` : ""}. No se puede deshacer.`, danger: true, confirmLabel: "Eliminar campa\xF1a" });
    if (!ok) return;
    await window.apiFetch("/api/campaigns/delete_campaign", { campaignId: c.id });
    toast("Campa\xF1a eliminada", "success");
    reload();
  };
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
    paddingBottom: 24
  } }, camps === null ? /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", padding: "60px 0", color: "var(--text-subtle)", fontSize: 13 } }, "Cargando\u2026") : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", width: "100%" } }, list.map((c) => {
    const leads = c.leads || [];
    const ct = _ctype(c);
    const nToday = leads.filter((l) => l.date === today).length;
    const contacted = leads.filter((l) => ["contacted", "replied", "won"].includes(l.status)).length;
    const won = leads.filter((l) => l.status === "won").length;
    const pct = leads.length ? Math.round(contacted / leads.length * 100) : 0;
    const col = won > 0 ? "var(--green)" : "var(--accent)";
    const on = hoverId === c.id;
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: c.id,
        onClick: () => navigate("campaign", { campaignId: c.id }),
        onMouseEnter: () => setHoverId(c.id),
        onMouseLeave: () => setHoverId(null),
        style: { display: "flex", flexDirection: "column", gap: 12, padding: "18px 6px", cursor: "pointer" }
      },
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 14, minWidth: 0 } }, /* @__PURE__ */ React.createElement(
        Icon,
        {
          name: ct.icon,
          size: 22,
          strokeWidth: 1.6,
          style: { color: "var(--text)", flexShrink: 0, transform: on ? "scale(1.06)" : "none", transition: "transform .3s" }
        }
      ), /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: {
        fontSize: 17,
        color: "var(--text)",
        letterSpacing: "-0.4px",
        lineHeight: 1.2,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      } }, c.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: "var(--text-muted)", marginTop: 3, display: "flex", alignItems: "center", gap: 6, minWidth: 0 } }, /* @__PURE__ */ React.createElement("span", { style: { flexShrink: 0 } }, leads.length, " leads"), /* @__PURE__ */ React.createElement("span", { style: { opacity: 0.4, fontSize: 10 } }, "\u2022"), /* @__PURE__ */ React.createElement("span", { style: { flexShrink: 0 } }, contacted, " contactados"), /* @__PURE__ */ React.createElement("span", { style: { opacity: 0.4, fontSize: 10 } }, "\u2022"), /* @__PURE__ */ React.createElement("span", { style: { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, ct.label, nToday ? ` \xB7 +${nToday} hoy` : "")))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 4, flexShrink: 0 } }, /* @__PURE__ */ React.createElement(
        "button",
        {
          className: "btn ghost icon-only sm",
          "data-tooltip": "Eliminar",
          onClick: (e) => removeCampaign(c, e),
          style: { opacity: on ? 0.65 : 0, transition: "opacity .15s", color: "var(--red)" }
        },
        /* @__PURE__ */ React.createElement(Icon, { name: "trash", size: 13 })
      ), /* @__PURE__ */ React.createElement(
        Icon,
        {
          name: "chevron-right",
          size: 18,
          style: {
            color: on ? "var(--text)" : "var(--text-muted)",
            transform: on ? "translateX(3px)" : "none",
            transition: "all .2s",
            flexShrink: 0
          }
        }
      ))),
      /* @__PURE__ */ React.createElement("div", { style: { position: "relative", width: "100%", height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 99, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", height: "100%", borderRadius: 99, background: col, width: `${pct}%`, transition: "width .3s" } }))
    );
  }), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setSetupOpen(true),
      style: {
        marginTop: 16,
        width: "100%",
        padding: "26px",
        borderRadius: 22,
        border: "1px dashed var(--border)",
        background: "transparent",
        cursor: "pointer",
        color: "var(--text-muted)",
        fontSize: 15,
        fontFamily: "inherit",
        opacity: 0.5,
        transition: "opacity .2s",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        letterSpacing: "-0.2px"
      },
      onMouseEnter: (e) => e.currentTarget.style.opacity = 0.85,
      onMouseLeave: (e) => e.currentTarget.style.opacity = 0.5
    },
    list.length === 0 ? "Crea tu primera campa\xF1a" : "A\xF1adir campa\xF1a",
    " ",
    /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 16 })
  ))), /* @__PURE__ */ React.createElement(CampaignSetup, { open: setupOpen, onClose: () => setSetupOpen(false), onCreated }));
};
window.CampaignsPage = CampaignsPage;
window.CampaignDetail = CampaignDetail;

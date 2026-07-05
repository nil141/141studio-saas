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
  name: ["name", "nombre", "contacto", "lead", "persona"],
  company: ["company", "empresa", "negocio", "marca", "compa\xF1ia", "compa\xF1\xEDa"],
  email: ["email", "correo", "e-mail", "mail"],
  phone: ["phone", "telefono", "tel\xE9fono", "tel", "movil", "m\xF3vil"],
  website: ["website", "web", "url", "dominio", "sitio", "pagina", "p\xE1gina"],
  sector: ["sector", "industria", "categoria", "categor\xEDa", "nicho", "tipo"],
  audit: ["audit", "auditoria", "auditor\xEDa", "notas", "nota", "observaciones"],
  subject: ["subject", "asunto"],
  draft: ["draft", "borrador", "mensaje", "cuerpo"]
};
const csvToLeads = (text) => {
  const rows = parseCSV(text);
  if (!rows.length) return [];
  const header = rows[0].map((h) => h.trim().toLowerCase());
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
      if (field && cell && cell.trim()) lead[field] = cell.trim();
    });
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
const LeadsSpark = ({ leads }) => {
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = /* @__PURE__ */ new Date();
    d.setDate(d.getDate() - (13 - i));
    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return {
      ds,
      v: leads.filter((x) => x.date === ds).length,
      lab: d.getDate(),
      isToday: i === 13
    };
  });
  const max = Math.max(...days.map((d) => d.v), 1);
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "flex-end", gap: 5, height: 64 } }, days.map((d, i) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: i,
      "data-tooltip": `${d.v} lead${d.v === 1 ? "" : "s"} \xB7 d\xEDa ${d.lab}`,
      style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, minWidth: 0 }
    },
    /* @__PURE__ */ React.createElement("div", { style: {
      width: "100%",
      maxWidth: 22,
      borderRadius: 5,
      height: d.v === 0 ? 3 : Math.max(6, d.v / max * 46),
      background: d.v === 0 ? "rgba(255,255,255,0.06)" : d.isToday ? "var(--accent)" : "rgba(158,154,229,0.45)",
      transition: "height .2s"
    } }),
    /* @__PURE__ */ React.createElement("span", { style: { fontSize: 9.5, color: d.isToday ? "var(--text)" : "var(--text-subtle)" } }, d.lab)
  )));
};
const LeadRow = ({ l, last, open, onToggle, onStatus, onDelete, onCopy }) => {
  const st = LEAD_STATUS[l.status] || LEAD_STATUS.new;
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { onClick: onToggle, className: "task-row", style: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "13px 4px",
    cursor: "pointer",
    borderBottom: last && !open ? "none" : "0.5px solid var(--border)"
  } }, /* @__PURE__ */ React.createElement("span", { style: { width: 7, height: 7, borderRadius: "50%", background: st.dot, flexShrink: 0 } }), /* @__PURE__ */ React.createElement("div", { style: { flex: "1.4 1 0", minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, letterSpacing: "-0.4px", color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, l.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--text-subtle)", marginTop: 2, letterSpacing: "-0.2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, l.company || "\u2014", l.sector ? ` \xB7 ${l.sector}` : "")), /* @__PURE__ */ React.createElement("div", { style: { flex: "1 1 0", minWidth: 0, fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, l.email || l.website || "\u2014"), /* @__PURE__ */ React.createElement("div", { style: { width: 52, fontSize: 12, color: "var(--text-subtle)", textAlign: "right", flexShrink: 0 } }, _cFmtDay(l.date)), /* @__PURE__ */ React.createElement(LeadStatusPill, { value: l.status, onChange: onStatus }), /* @__PURE__ */ React.createElement(Icon, { name: "chevron-down", size: 13, style: {
    color: "rgba(255,255,255,0.2)",
    flexShrink: 0,
    transform: open ? "rotate(180deg)" : "none",
    transition: "transform .15s"
  } })), open && /* @__PURE__ */ React.createElement("div", { style: {
    margin: "0 0 14px",
    padding: "18px 20px",
    background: "var(--bg-elev-1)",
    border: "0.5px solid var(--border)",
    borderRadius: 14
  } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-subtle)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement(Icon, { name: "search", size: 11 }), " Auditor\xEDa"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, lineHeight: 1.65, color: "var(--text-muted)", whiteSpace: "pre-wrap" } }, l.audit || "Sin auditor\xEDa."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 14, marginTop: 12, fontSize: 12 } }, l.website && /* @__PURE__ */ React.createElement(
    "a",
    {
      href: l.website.startsWith("http") ? l.website : "https://" + l.website,
      target: "_blank",
      rel: "noreferrer",
      onClick: (e) => e.stopPropagation(),
      style: { color: "var(--accent)", display: "inline-flex", alignItems: "center", gap: 5 }
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "external-link", size: 11 }),
    " ",
    l.website
  ), l.phone && /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 5 } }, /* @__PURE__ */ React.createElement(Icon, { name: "phone", size: 11 }), " ", l.phone))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-subtle)", display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement(Icon, { name: "mail", size: 11 }), " Borrador del mensaje"), /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: (e) => {
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
    const r = await window.apiFetch("/api/campaigns/import_leads", { campaignId, leads, source: "csv" });
    const j = await r.json();
    if (!j.ok) {
      toast(j.error || "Error al importar", "warn");
      return;
    }
    toast(`${j.added} leads importados${j.skipped ? ` \xB7 ${j.skipped} duplicados omitidos` : ""}`, "success");
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
const CampaignDetail = ({ campaignId, navigate }) => {
  const [camps, reload] = useCampaigns();
  const toast = useToast();
  const confirm = useConfirm();
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);
  const [addingLead, setAddingLead] = useState(false);
  const [coworkOpen, setCoworkOpen] = useState(false);
  const [pickCSV, csvInput] = useCSVImport(campaignId, () => reload());
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
        { icon: "trash", label: "Eliminar campa\xF1a", onClick: removeCampaign }
      ]
    }
  )), leads.length > 0 && /* @__PURE__ */ React.createElement("div", { style: {
    display: "grid",
    gridTemplateColumns: "1fr 1.15fr",
    gap: 28,
    paddingBottom: 20,
    borderBottom: "0.5px solid var(--border)",
    marginBottom: 18
  } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 26, alignItems: "flex-start" } }, /* @__PURE__ */ React.createElement(CampMiniStat, { label: "Leads", value: leads.length, sub: newToday ? `+${newToday} hoy` : "sin nuevos hoy" }), /* @__PURE__ */ React.createElement(CampMiniStat, { label: "Contactados", value: contacted, sub: leads.length ? `${Math.round(contacted / leads.length * 100)}% del total` : "\u2014", color: "#60a5fa" }), /* @__PURE__ */ React.createElement(CampMiniStat, { label: "Respuestas", value: replied, sub: contacted ? `${replyPct}% de contactados` : "\u2014", color: "var(--green)" }), /* @__PURE__ */ React.createElement(CampMiniStat, { label: "Ganados", value: nStatus("won"), sub: "clientes cerrados", color: "var(--accent)" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-subtle)", marginBottom: 10 } }, "Leads recibidos \xB7 \xFAltimos 14 d\xEDas"), /* @__PURE__ */ React.createElement(LeadsSpark, { leads }))), leads.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" } }, FILTERS.map((f) => {
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
  )))), leads.length === 0 ? /* @__PURE__ */ React.createElement(ConnectPanel, { onCSV: pickCSV, onManual: () => setAddingLead(true), onCowork: () => setCoworkOpen(true) }) : /* @__PURE__ */ React.createElement("div", { className: "tasks-scroll", style: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    scrollbarGutter: "stable",
    paddingRight: 10,
    paddingTop: 14,
    paddingBottom: 8,
    WebkitMaskImage: "linear-gradient(to bottom, transparent 0, #000 16px, #000 calc(100% - 24px), transparent 100%)",
    maskImage: "linear-gradient(to bottom, transparent 0, #000 16px, #000 calc(100% - 24px), transparent 100%)"
  } }, visible.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", padding: "60px 0", color: "var(--text-subtle)", fontSize: 13.5, letterSpacing: "-0.3px" } }, "Ning\xFAn lead coincide con el filtro.") : visible.map((l, i) => /* @__PURE__ */ React.createElement(
    LeadRow,
    {
      key: l.id,
      l,
      last: i === visible.length - 1,
      open: openId === l.id,
      onToggle: () => setOpenId(openId === l.id ? null : l.id),
      onStatus: (s) => setStatus(l, s),
      onDelete: () => removeLead(l),
      onCopy: () => copyDraft(l)
    }
  ))), csvInput, /* @__PURE__ */ React.createElement(AddLeadModal, { open: addingLead, onClose: () => setAddingLead(false), campaignId: c.id, onDone: reload }), /* @__PURE__ */ React.createElement(CoworkConnectModal, { open: coworkOpen, onClose: () => setCoworkOpen(false), campaignName: c.name }));
};
const CampaignsPage = ({ navigate }) => {
  const [camps, reload] = useCampaigns();
  const toast = useToast();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("email");
  const today = _cToday();
  const list = camps || [];
  const totalLeads = list.reduce((s, c) => s + (c.leads || []).length, 0);
  const newToday = list.reduce((s, c) => s + (c.leads || []).filter((l) => l.date === today).length, 0);
  const createCampaign = async () => {
    const name = newName.trim();
    if (!name) {
      toast("Ponle un nombre a la campa\xF1a", "warn");
      return;
    }
    const r = await window.apiFetch("/api/campaigns/create", { name, ctype: newType });
    const j = await r.json();
    if (!j.ok) {
      toast(j.error || "No se pudo crear", "warn");
      return;
    }
    toast("Campa\xF1a creada \u2014 ahora con\xE9ctale los leads", "success");
    setCreating(false);
    setNewName("");
    setNewType("email");
    reload();
    if (j.campaign && j.campaign.id) navigate("campaign", { campaignId: j.campaign.id });
  };
  return /* @__PURE__ */ React.createElement("div", { style: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    padding: "28px 32px 0",
    maxWidth: 1400,
    margin: "0 auto",
    overflow: "hidden"
  } }, /* @__PURE__ */ React.createElement("div", { className: "page-head", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", null, "Campa\xF1as"), /* @__PURE__ */ React.createElement("div", { className: "sub" }, list.length === 0 ? "Sin campa\xF1as todav\xEDa" : `${list.length} ${list.length === 1 ? "campa\xF1a" : "campa\xF1as"} \xB7 ${totalLeads} leads${newToday ? ` \xB7 +${newToday} hoy` : ""}`)), /* @__PURE__ */ React.createElement(ActionPill, { plusActions: () => setCreating(true) })), /* @__PURE__ */ React.createElement("div", { className: "tasks-scroll", style: {
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
  })), /* @__PURE__ */ React.createElement(
    QuickModal,
    {
      open: creating,
      onClose: () => {
        setCreating(false);
        setNewName("");
        setNewType("email");
      },
      onSubmit: createCampaign,
      canSubmit: newName.trim().length > 0,
      titlePlaceholder: "Nombre de la campa\xF1a...",
      titleValue: newName,
      onTitleChange: setNewName,
      types: ["email", "meta", "google", "otro"].map((id) => ({ id, label: CTYPES[id].label, icon: CTYPES[id].icon })),
      type: newType,
      onTypeChange: setNewType,
      tabs: [{ id: "next", label: "\xBFY los leads?", icon: "users", hasVal: false }],
      renderTab: () => /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, lineHeight: 1.7, color: "var(--text-muted)", maxWidth: 390, textAlign: "center", letterSpacing: "-0.2px" } }, "Al crearla entrar\xE1s directo a la campa\xF1a, donde podr\xE1s", /* @__PURE__ */ React.createElement("b", { style: { color: "var(--text)" } }, " importar un CSV"), ", ", /* @__PURE__ */ React.createElement("b", { style: { color: "var(--text)" } }, "a\xF1adir leads a mano"), " o", /* @__PURE__ */ React.createElement("b", { style: { color: "var(--text)" } }, " conectarla con Claude Cowork"), " para que se llene sola cada d\xEDa.")
    }
  ));
};
window.CampaignsPage = CampaignsPage;
window.CampaignDetail = CampaignDetail;

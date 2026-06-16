const AgencyPipeline = ({ openModal }) => {
  const D = window.Data;
  D.useStore();
  const toast = useToast();
  const [view, setView] = useState("kanban");
  const [leads, setLeads] = useState(D.LEADS);
  const [dragId, setDragId] = useState(null);
  const [dropCol, setDropCol] = useState(null);
  const [openLead, setOpenLead] = useState(null);
  useEffect(() => {
    setLeads((prev) => {
      const known = new Set(prev.map((l) => l.id));
      const newOnes = D.LEADS.filter((l) => !known.has(l.id));
      if (newOnes.length === 0) return prev;
      return [...newOnes, ...prev];
    });
  }, [D.LEADS.length]);
  const kpis = D.KPIS_WEEK;
  const onDrop = (stage) => {
    if (!dragId) return;
    setLeads((ls) => ls.map((l) => l.id === dragId ? { ...l, stage } : l));
    setDragId(null);
    setDropCol(null);
    toast(`Lead movido a "${D.LEAD_STAGES.find((s) => s.id === stage).label}"`, "success");
  };
  return /* @__PURE__ */ React.createElement("div", { className: "page wide", style: { maxWidth: 1500 } }, /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", null, "Pipeline"), /* @__PURE__ */ React.createElement("div", { className: "sub" }, "Captaci\xF3n + cualificaci\xF3n. Objetivo semanal: 200 \u2192 10 \u2192 3 \u2192 1.")), /* @__PURE__ */ React.createElement("div", { className: "row tight" }, /* @__PURE__ */ React.createElement("button", { className: "btn" }, /* @__PURE__ */ React.createElement(Icon, { name: "external-link", size: 13 }), " Conectar Calendly"), /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: () => openModal("newLead") }, /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 13 }), " Nuevo lead"))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 18 } }, Object.entries(kpis).map(([k, v]) => {
    const pct = Math.min(100, v.current / v.target * 100);
    const color = pct >= 100 ? "var(--green)" : pct >= 60 ? "var(--text)" : "var(--amber)";
    return /* @__PURE__ */ React.createElement("div", { key: k, className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body" }, /* @__PURE__ */ React.createElement("div", { className: "row between" }, /* @__PURE__ */ React.createElement("div", { className: "metric-label" }, v.label, " esta semana"), /* @__PURE__ */ React.createElement("span", { className: "muted xsmall" }, "obj. ", v.target)), /* @__PURE__ */ React.createElement("div", { className: "metric-value", style: { marginTop: 6 } }, v.current), /* @__PURE__ */ React.createElement("div", { className: "progress", style: { marginTop: 8 } }, /* @__PURE__ */ React.createElement("i", { style: { width: pct + "%", background: color } }))));
  })), /* @__PURE__ */ React.createElement("div", { className: "row between", style: { marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { className: "seg" }, /* @__PURE__ */ React.createElement("button", { className: view === "kanban" ? "active" : "", onClick: () => setView("kanban") }, /* @__PURE__ */ React.createElement(Icon, { name: "layers", size: 12 }), " Kanban"), /* @__PURE__ */ React.createElement("button", { className: view === "table" ? "active" : "", onClick: () => setView("table") }, /* @__PURE__ */ React.createElement(Icon, { name: "grid", size: 12 }), " Tabla")), /* @__PURE__ */ React.createElement("div", { className: "row tight" }, /* @__PURE__ */ React.createElement("div", { className: "search", style: { maxWidth: 220 } }, /* @__PURE__ */ React.createElement(Icon, { name: "search", size: 13 }), /* @__PURE__ */ React.createElement("input", { placeholder: "Buscar lead\u2026" })))), view === "kanban" && /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 12 } }, D.LEAD_STAGES.map((s) => {
    const list = leads.filter((l) => l.stage === s.id);
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: s.id,
        className: "kanban-col" + (dropCol === s.id ? " drop" : ""),
        onDragOver: (e) => {
          e.preventDefault();
          setDropCol(s.id);
        },
        onDrop: () => onDrop(s.id),
        onDragLeave: () => setDropCol(null)
      },
      /* @__PURE__ */ React.createElement("div", { className: "kanban-head" }, /* @__PURE__ */ React.createElement("span", null, s.label), /* @__PURE__ */ React.createElement("span", { className: "muted xsmall" }, list.length)),
      /* @__PURE__ */ React.createElement("div", { className: "kanban-body" }, list.map((l) => {
        const ch = D.CHANNELS[l.channel];
        return /* @__PURE__ */ React.createElement(
          "div",
          {
            key: l.id,
            className: "kanban-card",
            draggable: true,
            onDragStart: () => setDragId(l.id),
            onClick: () => setOpenLead(l)
          },
          /* @__PURE__ */ React.createElement("div", { className: "row between" }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 500, fontSize: 13 } }, l.name), /* @__PURE__ */ React.createElement("span", { className: "dot " + l.light })),
          /* @__PURE__ */ React.createElement("div", { className: "muted xsmall" }, l.company),
          /* @__PURE__ */ React.createElement("div", { className: "row between", style: { marginTop: 2 } }, /* @__PURE__ */ React.createElement("span", { className: "chip", style: { padding: "1px 7px", fontSize: 10.5 } }, /* @__PURE__ */ React.createElement(Icon, { name: ch.icon, size: 10 }), " ", ch.label), /* @__PURE__ */ React.createElement("span", { className: "xsmall muted" }, "\u20AC", l.budget)),
          l.next && l.next !== "\u2014" && /* @__PURE__ */ React.createElement("div", { className: "xsmall", style: { color: "var(--text-muted)", borderTop: "0.5px solid var(--border)", paddingTop: 6, marginTop: 2 } }, /* @__PURE__ */ React.createElement(Icon, { name: "clock", size: 10 }), " ", l.next, " \xB7 ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text)" } }, l.nextDate))
        );
      }), list.length === 0 && /* @__PURE__ */ React.createElement("div", { className: "subtle xsmall", style: { padding: 10, textAlign: "center" } }, "\u2014"))
    );
  })), view === "table" && /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body flush" }, /* @__PURE__ */ React.createElement("table", { className: "table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Lead"), /* @__PURE__ */ React.createElement("th", null, "Canal"), /* @__PURE__ */ React.createElement("th", null, "Estado"), /* @__PURE__ */ React.createElement("th", null, "Presupuesto"), /* @__PURE__ */ React.createElement("th", null, "Pr\xF3xima acci\xF3n"), /* @__PURE__ */ React.createElement("th", null))), /* @__PURE__ */ React.createElement("tbody", null, leads.map((l) => {
    const ch = D.CHANNELS[l.channel];
    const stage = D.LEAD_STAGES.find((s) => s.id === l.stage);
    return /* @__PURE__ */ React.createElement("tr", { key: l.id, onClick: () => setOpenLead(l) }, /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { className: "row tight" }, /* @__PURE__ */ React.createElement("span", { className: "dot " + l.light }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 500 } }, l.name), /* @__PURE__ */ React.createElement("div", { className: "subtle xsmall" }, l.company)))), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: "chip" }, /* @__PURE__ */ React.createElement(Icon, { name: ch.icon, size: 10 }), " ", ch.label)), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: "chip" }, stage.label)), /* @__PURE__ */ React.createElement("td", { style: { fontVariantNumeric: "tabular-nums" } }, "\u20AC", l.budget), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: "muted" }, l.next), " ", l.nextDate !== "\u2014" && /* @__PURE__ */ React.createElement("span", { className: "xsmall", style: { marginLeft: 6 } }, l.nextDate)), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only sm", onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement(Icon, { name: "more-h", size: 13 }))));
  }))))), /* @__PURE__ */ React.createElement(LeadDetailModal, { lead: openLead, onClose: () => setOpenLead(null) }));
};
const LeadDetailModal = ({ lead, onClose }) => {
  const D = window.Data;
  const [checked, setChecked] = useState({});
  if (!lead) return null;
  const ch = D.CHANNELS[lead.channel];
  return /* @__PURE__ */ React.createElement(Modal, { open: true, onClose, title: lead.name, sub: lead.company + " \xB7 " + ch.label, size: "lg", footer: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: onClose }, "Cerrar"), /* @__PURE__ */ React.createElement("button", { className: "btn" }, /* @__PURE__ */ React.createElement(Icon, { name: "msg-circle", size: 12 }), " WhatsApp"), /* @__PURE__ */ React.createElement("button", { className: "btn primary" }, "Marcar llamada hecha ", /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 12 }))) }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "card-title", style: { marginBottom: 10 } }, "Respuestas Calendly"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, "\xBFQu\xE9 necesita?"), /* @__PURE__ */ React.createElement("div", { style: { padding: 10, background: "var(--bg-elev-2)", borderRadius: 8, fontSize: 13, border: "0.5px solid var(--border)" } }, lead.needs)), /* @__PURE__ */ React.createElement("div", { className: "row tight" }, /* @__PURE__ */ React.createElement("div", { className: "grow" }, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Presupuesto"), /* @__PURE__ */ React.createElement("div", { className: "row tight" }, /* @__PURE__ */ React.createElement("span", { className: "dot " + lead.light }), /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 500 } }, "\u20AC", lead.budget))), /* @__PURE__ */ React.createElement("div", { className: "grow" }, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Cu\xE1ndo"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13 } }, lead.when))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Entrada"), /* @__PURE__ */ React.createElement("div", { className: "muted small" }, lead.enteredAt, " \xB7 pr\xF3xima acci\xF3n ", /* @__PURE__ */ React.createElement("b", { style: { color: "var(--text)" } }, lead.next), " ", lead.nextDate !== "\u2014" && "el " + lead.nextDate)))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "card-title", style: { marginBottom: 10 } }, "Antes de la llamada"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, D.CALL_PREP.map((item, i) => /* @__PURE__ */ React.createElement("label", { key: i, className: "row tight", style: { padding: "8px 10px", background: "var(--bg-elev-2)", border: "0.5px solid var(--border)", borderRadius: 8, cursor: "pointer" } }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: !!checked[i], onChange: (e) => setChecked({ ...checked, [i]: e.target.checked }) }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, textDecoration: checked[i] ? "line-through" : "none", opacity: checked[i] ? 0.5 : 1 } }, item)))))));
};
window.AgencyPipeline = AgencyPipeline;

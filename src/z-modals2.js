(function() {
const NewLeadModal = ({ open, onClose }) => {
  const D = window.Data;
  const toast = useToast();
  const [data, setData] = useState({ name: "", company: "", channel: "linkedin", calendly: "", message: "" });
  const [checked, setChecked] = useState({});
  const submit = () => {
    if (!data.name.trim()) {
      toast("Ponle un nombre al lead", "warn");
      return;
    }
    const l = D.addLead(data);
    toast(`Lead "${l.name}" a\xF1adido al pipeline`, "success");
    onClose();
    setData({ name: "", company: "", channel: "linkedin", calendly: "", message: "" });
    setChecked({});
  };
  return /* @__PURE__ */ React.createElement(Modal, { open, onClose, title: "Nuevo lead", sub: "Captaci\xF3n + cualificaci\xF3n", size: "lg", footer: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: onClose }, "Cancelar"), /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: submit }, "A\xF1adir al pipeline ", /* @__PURE__ */ React.createElement(Icon, { name: "arrow", size: 12 }))) }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { gridColumn: "1 / -1" } }, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Nombre"), /* @__PURE__ */ React.createElement("input", { className: "input", placeholder: "Ej. Carla Esteban", value: data.name, onChange: (e) => setData({ ...data, name: e.target.value }), autoFocus: true })), /* @__PURE__ */ React.createElement("div", { style: { gridColumn: "1 / -1" } }, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Empresa"), /* @__PURE__ */ React.createElement("input", { className: "input", placeholder: "Bruna Studio", value: data.company, onChange: (e) => setData({ ...data, company: e.target.value }) })), /* @__PURE__ */ React.createElement("div", { style: { gridColumn: "1 / -1" } }, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Canal de origen"), /* @__PURE__ */ React.createElement("div", { className: "row tight", style: { flexWrap: "wrap" } }, Object.entries(D.CHANNELS).map(([k, v]) => /* @__PURE__ */ React.createElement("button", { key: k, className: "chip", style: { cursor: "pointer", padding: "4px 10px", borderColor: data.channel === k ? "var(--text)" : "var(--border-strong)", color: data.channel === k ? "var(--text)" : "var(--text-muted)" }, onClick: () => setData({ ...data, channel: k }) }, /* @__PURE__ */ React.createElement(Icon, { name: v.icon, size: 11 }), " ", v.label)))), /* @__PURE__ */ React.createElement("div", { style: { gridColumn: "1 / -1" } }, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Link Calendly (opcional)"), /* @__PURE__ */ React.createElement("input", { className: "input", placeholder: "https://calendly.com/\u2026", value: data.calendly, onChange: (e) => setData({ ...data, calendly: e.target.value }) })), /* @__PURE__ */ React.createElement("div", { style: { gridColumn: "1 / -1" } }, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Primer mensaje / contexto"), /* @__PURE__ */ React.createElement("textarea", { className: "textarea", rows: 3, placeholder: "\xBFQu\xE9 necesita? \xBFC\xF3mo te ha contactado?", value: data.message, onChange: (e) => setData({ ...data, message: e.target.value }) })))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "card-title", style: { marginBottom: 10 } }, "Antes de la llamada"), /* @__PURE__ */ React.createElement("div", { className: "muted xsmall", style: { marginBottom: 10 } }, "Tu checklist para no llegar a fr\xEDo."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, D.CALL_PREP.map((item, i) => /* @__PURE__ */ React.createElement("label", { key: i, className: "row tight", style: { padding: "8px 10px", background: "var(--bg-elev-2)", border: "0.5px solid var(--border)", borderRadius: 8, cursor: "pointer" } }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: !!checked[i], onChange: (e) => setChecked({ ...checked, [i]: e.target.checked }) }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, textDecoration: checked[i] ? "line-through" : "none", opacity: checked[i] ? 0.5 : 1 } }, item)))))));
};
const NewInvoiceModal = ({ open, onClose }) => {
  var _a, _b;
  const D = window.Data;
  D.useStore && D.useStore();
  const toast = useToast();
  const hasClients = D.CLIENTS.length > 0;
  const hasProjects = D.PROJECTS.length > 0;
  const [data, setData] = useState({
    clientId: ((_a = D.CLIENTS[0]) == null ? void 0 : _a.id) || "",
    projectId: ((_b = D.PROJECTS[0]) == null ? void 0 : _b.id) || "",
    amount: "750",
    type: "50% inicial"
  });
  useEffect(() => {
    if (!open) return;
    if (hasClients && !D.CLIENTS.find((c) => c.id === data.clientId)) {
      setData((d) => ({ ...d, clientId: D.CLIENTS[0].id }));
    }
    const projForClient = D.PROJECTS.filter((p) => p.clientId === data.clientId);
    if (projForClient.length && !projForClient.find((p) => p.id === data.projectId)) {
      setData((d) => ({ ...d, projectId: projForClient[0].id }));
    }
  }, [open, D.CLIENTS, D.PROJECTS, data.clientId, data.projectId, hasClients]);
  const submit = () => {
    if (!hasClients) {
      toast("Crea primero un cliente", "warn");
      return;
    }
    if (!data.amount || Number(data.amount) <= 0) {
      toast("Importe no v\xE1lido", "warn");
      return;
    }
    const inv = D.addInvoice(data);
    toast(`Factura ${inv.id} \xB7 \u20AC${inv.amount} \xB7 link Stripe enviado`, "success");
    onClose();
  };
  return /* @__PURE__ */ React.createElement(Modal, { open, onClose, title: "Nueva factura", sub: "Se generar\xE1 link de pago Stripe autom\xE1ticamente", footer: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: onClose }, "Cancelar"), /* @__PURE__ */ React.createElement("button", { className: "btn primary", disabled: !hasClients, onClick: submit }, "Crear y enviar ", /* @__PURE__ */ React.createElement(Icon, { name: "arrow", size: 12 }))) }, !hasClients && /* @__PURE__ */ React.createElement("div", { style: { padding: 14, marginBottom: 14, background: "var(--amber-soft)", border: "0.5px solid var(--amber)", borderRadius: 10, color: "var(--amber)", fontSize: 13, display: "flex", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement(Icon, { name: "info", size: 14 }), " No hay clientes. Crea uno antes de facturar."), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { gridColumn: "1 / -1" } }, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Cliente"), /* @__PURE__ */ React.createElement("select", { className: "select", value: data.clientId, onChange: (e) => setData({ ...data, clientId: e.target.value }), disabled: !hasClients }, hasClients ? D.CLIENTS.map((c) => /* @__PURE__ */ React.createElement("option", { key: c.id, value: c.id }, c.company)) : /* @__PURE__ */ React.createElement("option", { value: "" }, "\u2014 Sin clientes \u2014"))), /* @__PURE__ */ React.createElement("div", { style: { gridColumn: "1 / -1" } }, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Proyecto"), /* @__PURE__ */ React.createElement("select", { className: "select", value: data.projectId, onChange: (e) => setData({ ...data, projectId: e.target.value }), disabled: !hasProjects }, hasProjects ? D.PROJECTS.filter((p) => p.clientId === data.clientId).map((p) => /* @__PURE__ */ React.createElement("option", { key: p.id, value: p.id }, p.name)) : /* @__PURE__ */ React.createElement("option", { value: "" }, "\u2014 Sin proyectos \u2014"))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Importe (\u20AC)"), /* @__PURE__ */ React.createElement("input", { className: "input", type: "number", value: data.amount, onChange: (e) => setData({ ...data, amount: e.target.value }) })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Tipo"), /* @__PURE__ */ React.createElement("select", { className: "select", value: data.type, onChange: (e) => setData({ ...data, type: e.target.value }) }, /* @__PURE__ */ React.createElement("option", null, "50% inicial"), /* @__PURE__ */ React.createElement("option", null, "50% final"), /* @__PURE__ */ React.createElement("option", null, "Mensual"), /* @__PURE__ */ React.createElement("option", null, "Extra"))), /* @__PURE__ */ React.createElement("div", { style: { gridColumn: "1 / -1", padding: 12, background: "var(--bg-elev-2)", border: "0.5px solid var(--border)", borderRadius: 10, display: "flex", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement("svg", { width: "36", height: "14", viewBox: "0 0 60 25" }, /* @__PURE__ */ React.createElement("text", { x: "0", y: "20", fontFamily: "Inter", fontWeight: "700", fontSize: "22", fill: "#635bff" }, "stripe")), /* @__PURE__ */ React.createElement("span", { className: "muted small" }, "Se generar\xE1 autom\xE1ticamente el link de pago y se enviar\xE1 al cliente."))));
};
const InviteClientModal = ({ open, onClose, session }) => {
  const toast = useToast();
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!open) {
      setLink("");
      setCopied(false);
    }
  }, [open]);
  const generate = async () => {
    setBusy(true);
    const token = await window.Data.createInvite();
    if (token) {
      setLink(`${window.location.origin}/invite/${token}`);
    } else {
      toast("Error al generar el enlace", "error");
    }
    setBusy(false);
  };
  const copy = () => {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      toast("Enlace copiado", "success");
      setTimeout(() => setCopied(false), 2e3);
    });
  };
  return /* @__PURE__ */ React.createElement(Modal, { open, onClose, title: "Invitar nuevo cliente", sub: "Genera un enlace para que el cliente cree su cuenta", footer: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: onClose }, "Cerrar"), !link && /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: generate, disabled: busy }, /* @__PURE__ */ React.createElement(Icon, { name: "external-link", size: 12 }), " ", busy ? "Generando\u2026" : "Generar enlace")) }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 16 } }, !link ? /* @__PURE__ */ React.createElement("div", { className: "row tight", style: {
    padding: 12,
    background: "var(--bg-elev-2)",
    border: "0.5px solid var(--border)",
    borderRadius: 10,
    color: "var(--text-muted)",
    fontSize: 12
  } }, /* @__PURE__ */ React.createElement(Icon, { name: "info", size: 13 }), /* @__PURE__ */ React.createElement("span", null, "El cliente recibir\xE1 este enlace, rellenar\xE1 su ficha y crear\xE1 su acceso al portal.")) : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Enlace generado \u2014 v\xE1lido 7 d\xEDas"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center" } }, /* @__PURE__ */ React.createElement("div", { style: {
    flex: 1,
    background: "var(--bg-elev-2)",
    border: "0.5px solid var(--border-strong)",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 12,
    fontFamily: "var(--font-mono)",
    color: "var(--text-muted)",
    wordBreak: "break-all",
    lineHeight: 1.5
  } }, link), /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: copy, style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement(Icon, { name: copied ? "check" : "copy", size: 13 }), copied ? "Copiado" : "Copiar")), /* @__PURE__ */ React.createElement("div", { className: "row tight", style: {
    padding: 10,
    background: "var(--green-soft)",
    border: "0.5px solid var(--green)",
    borderRadius: 8,
    color: "var(--green)",
    fontSize: 12
  } }, /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 12 }), /* @__PURE__ */ React.createElement("span", null, "Comparte este enlace con tu cliente por WhatsApp, email o como prefieras.")))));
};
Object.assign(window, { NewLeadModal, NewInvoiceModal, InviteClientModal });

})();
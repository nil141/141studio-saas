const menuItem = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  width: "100%",
  padding: "10px 12px",
  borderRadius: 9,
  cursor: "pointer",
  background: "transparent",
  border: 0,
  fontFamily: "inherit",
  textAlign: "left",
  transition: "background .1s"
};
const menuIconBox = {
  width: 32,
  height: 32,
  borderRadius: 9,
  flexShrink: 0,
  background: "var(--bg-elev-2)",
  border: "0.5px solid var(--border)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--text-muted)"
};
const menuTitle = { fontSize: 13.5, fontWeight: 500, color: "var(--text)", letterSpacing: "-0.2px" };
const menuSub = { fontSize: 11.5, color: "var(--text-subtle)", marginTop: 2, letterSpacing: "-0.1px" };
const AgencyClientsList = ({ navigate, openModal }) => {
  const D = window.Data;
  D.useStore();
  const toast = useToast();
  useEffect(() => {
    D.reload && D.reload();
  }, []);
  const clients = D.CLIENTS;
  const COLS = "1.3fr 1.2fr 1.7fr 1fr";
  const cell = { fontSize: 14.5, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
  const [menuOpen, setMenuOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [inviteCopied, setInviteCopied] = useState(false);
  const [inviteBusy, setInviteBusy] = useState(false);
  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuOpen]);
  const generateInvite = async () => {
    setMenuOpen(false);
    if (inviteBusy) return;
    setInviteBusy(true);
    const res = await D.createInvite({});
    if (res && res.token) {
      setInviteLink(`${window.location.origin}/invite/${res.token}`);
    } else {
      toast(res?.error || "Error al generar el enlace", "error");
    }
    setInviteBusy(false);
  };
  const copyInvite = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setInviteCopied(true);
      toast("Enlace copiado", "success");
      setTimeout(() => setInviteCopied(false), 2e3);
    });
  };
  return /* @__PURE__ */ React.createElement("div", { className: "page" }, /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", null, "Clientes"), /* @__PURE__ */ React.createElement("div", { className: "sub" }, clients.length, " en total")), /* @__PURE__ */ React.createElement("div", { className: "row tight", style: { position: "relative" }, onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: () => setMenuOpen((v) => !v) }, /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 14 }), " Nuevo cliente"), menuOpen && /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    right: 0,
    top: "calc(100% + 6px)",
    zIndex: 20,
    background: "var(--bg-elev)",
    border: "0.5px solid var(--border-strong)",
    borderRadius: 12,
    padding: 5,
    minWidth: 280,
    boxShadow: "0 10px 30px rgba(0,0,0,0.35)"
  } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setMenuOpen(false);
        openModal("newClient");
      },
      style: menuItem,
      onMouseEnter: (e) => e.currentTarget.style.background = "var(--bg-hover)",
      onMouseLeave: (e) => e.currentTarget.style.background = "transparent"
    },
    /* @__PURE__ */ React.createElement("div", { style: menuIconBox }, /* @__PURE__ */ React.createElement(Icon, { name: "edit", size: 14, strokeWidth: 1.7 })),
    /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: menuTitle }, "A\xF1adir ficha manualmente"), /* @__PURE__ */ React.createElement("div", { style: menuSub }, "T\xFA rellenas sus datos."))
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: generateInvite,
      style: menuItem,
      onMouseEnter: (e) => e.currentTarget.style.background = "var(--bg-hover)",
      onMouseLeave: (e) => e.currentTarget.style.background = "transparent"
    },
    /* @__PURE__ */ React.createElement("div", { style: { ...menuIconBox, background: "var(--accent-soft)", color: "var(--accent)" } }, /* @__PURE__ */ React.createElement(Icon, { name: "external-link", size: 14, strokeWidth: 1.7 })),
    /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: menuTitle }, "Generar enlace de portal"), /* @__PURE__ */ React.createElement("div", { style: menuSub }, "\xC9l rellena sus datos al registrarse."))
  )))), inviteLink && /* @__PURE__ */ React.createElement("div", { onClick: () => setInviteLink(""), style: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    backdropFilter: "blur(6px)",
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  } }, /* @__PURE__ */ React.createElement("div", { onClick: (e) => e.stopPropagation(), style: {
    background: "var(--bg-elev)",
    border: "0.5px solid var(--border-strong)",
    borderRadius: 16,
    padding: 24,
    maxWidth: 460,
    width: "100%",
    boxShadow: "0 30px 60px rgba(0,0,0,0.5)"
  } }, /* @__PURE__ */ React.createElement("div", { style: {
    width: 44,
    height: 44,
    borderRadius: 12,
    marginBottom: 14,
    background: "var(--accent-soft)",
    color: "var(--accent)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  } }, /* @__PURE__ */ React.createElement(Icon, { name: "external-link", size: 20, strokeWidth: 1.7 })), /* @__PURE__ */ React.createElement("h2", { style: { fontSize: 19, fontWeight: 500, letterSpacing: "-0.5px", marginBottom: 6 } }, "Enlace de portal generado"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 13.5, color: "var(--text-muted)", marginBottom: 18, lineHeight: 1.5 } }, "Comparte este enlace con el cliente. Cuando se registre, su ficha se crear\xE1 autom\xE1ticamente."), /* @__PURE__ */ React.createElement("input", { readOnly: true, value: inviteLink, onClick: (e) => e.target.select(), style: {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 10,
    marginBottom: 14,
    background: "var(--bg-elev-2)",
    border: "0.5px solid var(--border)",
    color: "var(--text)",
    fontFamily: "var(--font-mono)",
    fontSize: 12
  } }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: () => setInviteLink("") }, "Cerrar"), /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: copyInvite }, inviteCopied ? /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 13 }) : null, inviteCopied ? "Copiado" : "Copiar enlace")))), clients.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body", style: { padding: 48 } }, /* @__PURE__ */ React.createElement(Empty, { icon: "users", title: "Sin clientes", sub: "A\xF1ade tu primer cliente para empezar." }))) : /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: 0, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: {
    display: "grid",
    gridTemplateColumns: COLS,
    gap: 24,
    padding: "16px 26px",
    borderBottom: "0.5px solid var(--border)"
  } }, ["Nombre", "Empresa", "Email", "Tel\xE9fono"].map((h) => /* @__PURE__ */ React.createElement("div", { key: h, style: { fontSize: 13.5, color: "var(--text-subtle)" } }, h))), clients.map((c, i) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: c.id,
      onClick: () => navigate("clientDetail", { clientId: c.id }),
      style: {
        display: "grid",
        gridTemplateColumns: COLS,
        gap: 24,
        alignItems: "center",
        padding: "18px 26px",
        cursor: "pointer",
        transition: "background .1s",
        borderBottom: i === clients.length - 1 ? "0" : "0.5px solid var(--border)"
      },
      onMouseEnter: (e) => e.currentTarget.style.background = "var(--bg-hover)",
      onMouseLeave: (e) => e.currentTarget.style.background = "transparent"
    },
    /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, c.name || c.company || "\u2014"),
    /* @__PURE__ */ React.createElement("div", { style: cell }, c.company || "\u2014"),
    /* @__PURE__ */ React.createElement("div", { style: cell }, c.email || "\u2014"),
    /* @__PURE__ */ React.createElement("div", { style: cell }, c.whatsapp || c.phone || "\u2014")
  ))));
};
const MenuItem = ({ icon, onClick, children, danger }) => /* @__PURE__ */ React.createElement(
  "button",
  {
    onClick,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      width: "100%",
      padding: "7px 10px",
      border: 0,
      background: "transparent",
      color: danger ? "var(--red)" : "var(--text)",
      fontSize: 13,
      borderRadius: 6,
      cursor: "pointer",
      fontFamily: "inherit",
      textAlign: "left"
    },
    onMouseEnter: (e) => e.currentTarget.style.background = "var(--bg-hover)",
    onMouseLeave: (e) => e.currentTarget.style.background = "transparent"
  },
  /* @__PURE__ */ React.createElement(Icon, { name: icon, size: 13 }),
  " ",
  children
);
const AgencyClientDetail = ({ clientId, navigate, openModal }) => {
  const D = window.Data;
  D.useStore();
  const confirm = useConfirm();
  const toast = useToast();
  const c = D.CLIENTS.find((x) => x.id === clientId);
  useEffect(() => {
    if (!c) navigate("clients");
  }, [c]);
  if (!c) return null;
  const projects = D.PROJECTS.filter((p) => p.clientId === c.id);
  const invoices = D.INVOICES.filter((i) => i.clientId === c.id);
  const [tab, setTab] = useState("projects");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const hasPortal = !!c.email && c.email.includes("@");
  const [portalBusy, setPortalBusy] = useState(false);
  const [portalLink, setPortalLink] = useState("");
  const [portalCopied, setPortalCopied] = useState(false);
  const createPortal = async () => {
    if (portalBusy) return;
    setPortalBusy(true);
    const res = await D.createInvite({ clientId: c.id, service: c.service || "" });
    if (res && res.token) {
      setPortalLink(`${window.location.origin}/invite/${res.token}`);
    } else {
      toast(res?.error || "Error al generar el portal", "error");
    }
    setPortalBusy(false);
  };
  const copyPortal = () => {
    navigator.clipboard.writeText(portalLink).then(() => {
      setPortalCopied(true);
      toast("Enlace copiado", "success");
      setTimeout(() => setPortalCopied(false), 2e3);
    });
  };
  const startEdit = () => {
    setForm({ name: c.name, company: c.company, email: c.email, whatsapp: c.whatsapp, service: c.service, status: c.status });
    setEditing(true);
  };
  const saveEdit = () => {
    D.updateClient(c.id, form);
    setEditing(false);
    toast("Cliente actualizado", "success");
  };
  const cancelEdit = () => setEditing(false);
  const field = (key) => ({ value: form[key] || "", onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })) });
  const removeClient = async () => {
    const ok = await confirm({
      title: `Eliminar a ${c.company}?`,
      body: `Se eliminar\xE1n tambi\xE9n ${projects.length} proyecto${projects.length === 1 ? "" : "s"} y ${invoices.length} factura${invoices.length === 1 ? "" : "s"}. Esta acci\xF3n no se puede deshacer.`,
      confirmLabel: "S\xED, eliminar",
      danger: true
    });
    if (ok) {
      D.deleteClient(c.id);
      toast(`${c.company} eliminado`, "success");
      navigate("clients");
    }
  };
  const removeProject = async (p) => {
    const ok = await confirm({
      title: `Eliminar el proyecto "${p.name}"?`,
      body: "Se eliminar\xE1n tambi\xE9n sus entregables. Esta acci\xF3n no se puede deshacer.",
      confirmLabel: "S\xED, eliminar",
      danger: true
    });
    if (ok) {
      D.deleteProject(p.id);
      toast("Proyecto eliminado", "success");
    }
  };
  const totalBilled = invoices.filter((i) => i.status === "paid").reduce((a, b) => a + b.amount, 0);
  const pending = invoices.filter((i) => i.status === "pending").reduce((a, b) => a + b.amount, 0);
  const [menuOpen, setMenuOpen] = useState(false);
  return /* @__PURE__ */ React.createElement("div", { className: "page", onClick: () => setMenuOpen(false) }, /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", style: { marginBottom: 20 }, onClick: () => navigate("clients") }, /* @__PURE__ */ React.createElement(Icon, { name: "chevron", size: 12, style: { transform: "rotate(180deg)" } }), " Clientes"), editing ? /* @__PURE__ */ React.createElement("div", { className: "card", style: { marginBottom: 20 } }, /* @__PURE__ */ React.createElement("div", { className: "card-header" }, /* @__PURE__ */ React.createElement("div", { className: "card-title" }, "Editar cliente"), /* @__PURE__ */ React.createElement("div", { className: "row tight" }, /* @__PURE__ */ React.createElement("button", { className: "btn sm", onClick: cancelEdit }, "Cancelar"), /* @__PURE__ */ React.createElement("button", { className: "btn primary sm", onClick: saveEdit }, /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 12 }), " Guardar cambios"))), /* @__PURE__ */ React.createElement("div", { className: "card-body", style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "label" }, "Nombre de contacto"), /* @__PURE__ */ React.createElement("input", { className: "input", ...field("name") })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "label" }, "Empresa"), /* @__PURE__ */ React.createElement("input", { className: "input", ...field("company") })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "label" }, "Email"), /* @__PURE__ */ React.createElement("input", { className: "input", type: "email", ...field("email") })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "label" }, "WhatsApp"), /* @__PURE__ */ React.createElement("input", { className: "input", ...field("whatsapp") })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "label" }, "Servicio"), /* @__PURE__ */ React.createElement("input", { className: "input", ...field("service") })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "label" }, "Estado"), /* @__PURE__ */ React.createElement("select", { className: "select", ...field("status") }, /* @__PURE__ */ React.createElement("option", { value: "active" }, "Activo"), /* @__PURE__ */ React.createElement("option", { value: "review" }, "En revisi\xF3n"), /* @__PURE__ */ React.createElement("option", { value: "paused" }, "Pausado"))))) : /* @__PURE__ */ React.createElement("div", { className: "card", style: { marginBottom: 20, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { height: 4, background: c.color, opacity: 0.7 } }), /* @__PURE__ */ React.createElement("div", { style: { padding: "28px 28px 24px", display: "flex", gap: 24, alignItems: "flex-start" } }, /* @__PURE__ */ React.createElement("div", { style: {
    width: 72,
    height: 72,
    borderRadius: 16,
    flexShrink: 0,
    background: c.color + "22",
    border: "1.5px solid " + c.color + "44",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
    fontWeight: 600,
    color: c.color,
    fontFamily: "var(--font-display)",
    letterSpacing: "-0.03em"
  } }, c.initials), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 6 } }, /* @__PURE__ */ React.createElement("h1", { style: { fontSize: 22, margin: 0 } }, c.company), /* @__PURE__ */ React.createElement(StatusChip, { status: c.status }), /* @__PURE__ */ React.createElement("span", { className: "chip" }, c.service)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 20, color: "var(--text-muted)", fontSize: 13, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 5 } }, /* @__PURE__ */ React.createElement(Icon, { name: "users", size: 12 }), " ", c.name), /* @__PURE__ */ React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 5 } }, /* @__PURE__ */ React.createElement(Icon, { name: "mail", size: 12 }), " ", c.email), c.whatsapp && /* @__PURE__ */ React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 5 } }, /* @__PURE__ */ React.createElement(Icon, { name: "phone", size: 12 }), " ", c.whatsapp), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-subtle)" } }, "Cliente desde ", c.since)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 12, marginTop: 20 } }, [
    { label: "Facturado", value: "\u20AC" + totalBilled.toLocaleString("es-ES"), color: "var(--text)" },
    { label: "Pendiente", value: pending > 0 ? "\u20AC" + pending.toLocaleString("es-ES") : "\u2014", color: pending > 0 ? "var(--amber)" : "var(--text-subtle)" },
    { label: "Proyectos activos", value: projects.length, color: "var(--text)" },
    { label: "MRR", value: c.mrr ? "\u20AC" + c.mrr + "/m" : "\u2014", color: c.mrr ? "var(--green)" : "var(--text-subtle)" }
  ].map((s) => /* @__PURE__ */ React.createElement("div", { key: s.label, style: {
    padding: "10px 16px",
    borderRadius: 10,
    background: "var(--bg-elev-2)",
    border: "0.5px solid var(--border)",
    minWidth: 100
  } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-subtle)", marginBottom: 4, fontWeight: 500 } }, s.label), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: 600, color: s.color, fontFamily: "var(--font-display)", letterSpacing: "-0.02em" } }, s.value))))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center", flexShrink: 0, alignSelf: "flex-start" } }, /* @__PURE__ */ React.createElement(
    "a",
    {
      className: "btn",
      href: `https://wa.me/${(c.whatsapp || "").replace(/\D/g, "")}`,
      target: "_blank",
      style: { color: "#25D366", borderColor: "#25D36655" }
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "msg-circle", size: 13 }),
    " WhatsApp"
  ), /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: startEdit }, /* @__PURE__ */ React.createElement(Icon, { name: "edit", size: 13 }), " Editar"), /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: () => navigate("client-dashboard") }, /* @__PURE__ */ React.createElement(Icon, { name: "external-link", size: 13 }), " Abrir portal"), /* @__PURE__ */ React.createElement("div", { style: { position: "relative" }, onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only", onClick: () => setMenuOpen((o) => !o) }, /* @__PURE__ */ React.createElement(Icon, { name: "more-h", size: 14 })), menuOpen && /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    right: 0,
    top: "calc(100% + 4px)",
    zIndex: 20,
    background: "var(--bg-elev)",
    border: "0.5px solid var(--border-strong)",
    borderRadius: 10,
    padding: 4,
    minWidth: 170,
    boxShadow: "0 8px 24px rgba(0,0,0,0.25)"
  } }, /* @__PURE__ */ React.createElement("button", { onClick: () => {
    setMenuOpen(false);
    toast("Archivado");
  }, style: { display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "7px 10px", border: 0, background: "transparent", color: "var(--text)", fontSize: 13, borderRadius: 6, cursor: "pointer", fontFamily: "inherit" } }, /* @__PURE__ */ React.createElement(Icon, { name: "archive", size: 13 }), " Archivar cliente"), /* @__PURE__ */ React.createElement("div", { style: { height: 1, background: "var(--border)", margin: "4px 0" } }), /* @__PURE__ */ React.createElement("button", { onClick: () => {
    setMenuOpen(false);
    removeClient();
  }, style: { display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "7px 10px", border: 0, background: "transparent", color: "var(--red)", fontSize: 13, borderRadius: 6, cursor: "pointer", fontFamily: "inherit" } }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 13 }), " Eliminar cliente")))))), !editing && /* @__PURE__ */ React.createElement("div", { className: "card", style: {
    padding: "16px 20px",
    marginBottom: 16,
    display: "flex",
    alignItems: "center",
    gap: 14,
    flexWrap: "wrap"
  } }, /* @__PURE__ */ React.createElement("div", { style: {
    width: 36,
    height: 36,
    borderRadius: 10,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: hasPortal ? "var(--green-soft)" : "var(--bg-elev-2)",
    color: hasPortal ? "var(--green)" : "var(--text-muted)",
    border: "0.5px solid var(--border)"
  } }, /* @__PURE__ */ React.createElement(Icon, { name: hasPortal ? "check" : "external-link", size: 16, strokeWidth: 1.7 })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 200 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontWeight: 500, letterSpacing: "-0.3px" } }, hasPortal ? "Portal de cliente activo" : "Sin portal de cliente"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-muted)", marginTop: 2 } }, hasPortal ? `${c.email} tiene acceso al portal.` : "Genera un enlace para que cree su acceso.")), portalLink ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(
    "input",
    {
      readOnly: true,
      value: portalLink,
      onClick: (e) => e.target.select(),
      style: {
        fontSize: 12,
        padding: "8px 12px",
        borderRadius: 8,
        background: "var(--bg-elev)",
        border: "0.5px solid var(--border)",
        color: "var(--text-muted)",
        fontFamily: "var(--font-mono)",
        width: 320,
        maxWidth: "100%"
      }
    }
  ), /* @__PURE__ */ React.createElement("button", { className: "btn primary sm", onClick: copyPortal }, portalCopied ? /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 12 }) : null, " ", portalCopied ? "Copiado" : "Copiar enlace")) : !hasPortal && /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: createPortal, disabled: portalBusy }, /* @__PURE__ */ React.createElement(Icon, { name: "external-link", size: 13 }), " ", portalBusy ? "Generando\u2026" : "Crear portal")), /* @__PURE__ */ React.createElement("div", { className: "tabs" }, [
    { id: "projects", label: "Proyectos", count: projects.length },
    { id: "billing", label: "Facturaci\xF3n", count: invoices.length },
    { id: "files", label: "Archivos (Drive)" },
    { id: "notas", label: "Notas internas" }
  ].map((t) => /* @__PURE__ */ React.createElement("div", { key: t.id, className: "tab" + (tab === t.id ? " active" : ""), onClick: () => setTab(t.id) }, t.label, t.count != null ? /* @__PURE__ */ React.createElement("span", { className: "count" }, t.count) : null))), tab === "projects" && /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 } }, projects.map((p) => {
    const phase = D.PHASES[p.phase];
    return /* @__PURE__ */ React.createElement("div", { key: p.id, className: "card", style: { cursor: "pointer", position: "relative" }, onClick: () => navigate("project", { projectId: p.id }) }, /* @__PURE__ */ React.createElement("div", { className: "card-body" }, /* @__PURE__ */ React.createElement("div", { className: "row between" }, /* @__PURE__ */ React.createElement("div", { className: "row tight" }, /* @__PURE__ */ React.createElement("span", { className: "dot " + p.light }), /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 500 } }, p.name)), /* @__PURE__ */ React.createElement("span", { className: "chip" }, phase.label)), /* @__PURE__ */ React.createElement("div", { className: "muted small", style: { marginTop: 8 } }, p.description), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 14, display: "flex", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { className: "progress grow" }, /* @__PURE__ */ React.createElement("i", { style: { width: p.progress + "%" } })), /* @__PURE__ */ React.createElement("span", { className: "muted small" }, p.progress, "%")), /* @__PURE__ */ React.createElement("div", { className: "row between", style: { marginTop: 10 } }, /* @__PURE__ */ React.createElement("div", { className: "muted xsmall" }, /* @__PURE__ */ React.createElement(Icon, { name: "calendar", size: 11 }), " Entrega ", p.deadline), /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only sm danger", "data-tooltip": "Eliminar proyecto", onClick: (e) => {
      e.stopPropagation();
      removeProject(p);
    } }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 12 })))));
  }), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "card",
      style: { cursor: "pointer", border: "0.5px dashed var(--border-strong)", padding: 28, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "var(--text-muted)", background: "transparent" },
      onClick: () => openModal && openModal("newProject", { clientId: c.id })
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 14 }),
    " Nuevo proyecto para ",
    c.company
  )), tab === "billing" && /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body flush" }, invoices.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { icon: "receipt", title: "Sin facturas", sub: "Este cliente todav\xEDa no tiene facturas." }) : /* @__PURE__ */ React.createElement("table", { className: "table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "N\xBA"), /* @__PURE__ */ React.createElement("th", null, "Proyecto"), /* @__PURE__ */ React.createElement("th", null, "Tipo"), /* @__PURE__ */ React.createElement("th", null, "Emitida"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "Importe"), /* @__PURE__ */ React.createElement("th", null, "Estado"))), /* @__PURE__ */ React.createElement("tbody", null, invoices.map((i) => /* @__PURE__ */ React.createElement("tr", { key: i.id }, /* @__PURE__ */ React.createElement("td", { style: { fontFamily: "var(--font-mono)", fontSize: 12 } }, i.id), /* @__PURE__ */ React.createElement("td", null, i.project), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: "chip" }, i.type)), /* @__PURE__ */ React.createElement("td", { className: "muted" }, i.issued), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", fontWeight: 500 } }, "\u20AC", i.amount.toLocaleString("es-ES")), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(StatusChip, { status: i.status })))))))), tab === "files" && /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-header" }, /* @__PURE__ */ React.createElement("div", { className: "row tight" }, /* @__PURE__ */ React.createElement("div", { style: { width: 24, height: 24, borderRadius: 6, background: "#fff", display: "grid", placeItems: "center" } }, /* @__PURE__ */ React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24" }, /* @__PURE__ */ React.createElement("path", { fill: "#1FA463", d: "M7.71 3.5L1.15 15l3.27 5.5h13.16L21.85 15 14.29 3.5z" }), /* @__PURE__ */ React.createElement("path", { fill: "#FFD041", d: "M7.71 3.5h6.58L21.85 15l-3.27 5.5z", opacity: ".7" }))), /* @__PURE__ */ React.createElement("div", { className: "card-title" }, "Sincronizado con Google Drive")), /* @__PURE__ */ React.createElement("button", { className: "btn sm" }, /* @__PURE__ */ React.createElement(Icon, { name: "external-link", size: 12 }), " Abrir en Drive")), /* @__PURE__ */ React.createElement("div", { className: "card-body flush" }, D.DRIVE_FOLDERS.map((f, i) => /* @__PURE__ */ React.createElement("div", { key: f.name, style: { padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, borderBottom: i === D.DRIVE_FOLDERS.length - 1 ? "0" : "0.5px solid var(--border)", cursor: "pointer" } }, /* @__PURE__ */ React.createElement(Icon, { name: "folder", size: 16, style: { color: "var(--text-muted)" } }), /* @__PURE__ */ React.createElement("div", { className: "grow" }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 500, fontSize: 13 } }, "/", f.name), /* @__PURE__ */ React.createElement("div", { className: "subtle xsmall" }, f.count, " archivos \xB7 ", f.size)), /* @__PURE__ */ React.createElement(Icon, { name: "chevron", size: 13, style: { color: "var(--text-subtle)" } }))))), tab === "notas" && /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body" }, /* @__PURE__ */ React.createElement("textarea", { className: "textarea", rows: 6, defaultValue: `Cliente hist\xF3rico, prefiere comunicaci\xF3n por WhatsApp.
Prioridad: redise\xF1o antes del Q3.
Pedido: factura siempre con CIF en cabecera.` }), /* @__PURE__ */ React.createElement("div", { className: "row", style: { marginTop: 12, justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("button", { className: "btn primary sm" }, "Guardar nota")))));
};
Object.assign(window, { AgencyClientsList, AgencyClientDetail });

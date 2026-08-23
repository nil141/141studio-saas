(() => {
  const AgencyClientsList = ({ navigate, openModal }) => {
    const D = window.Data;
    D.useStore();
    const toast = useToast();
    useEffect(() => {
      D.reload && D.reload();
    }, []);
    const clients = D.CLIENTS;
    const [hoverId, setHoverId] = useState(null);
    const [inviteLink, setInviteLink] = useState("");
    const [inviteCopied, setInviteCopied] = useState(false);
    const [inviteBusy, setInviteBusy] = useState(false);
    const generateInvite = async () => {
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
    return /* @__PURE__ */ React.createElement("div", { style: {
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      padding: "28px 32px 0",
      maxWidth: 1400,
      margin: "0 auto",
      overflow: "hidden"
    } }, /* @__PURE__ */ React.createElement("div", { className: "page-head", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", null, "Clientes"), /* @__PURE__ */ React.createElement("div", { className: "sub" }, clients.length, " en total")), /* @__PURE__ */ React.createElement(
      ActionPill,
      {
        plusActions: [
          {
            icon: "edit",
            label: "A\xF1adir ficha manualmente",
            sub: "T\xFA rellenas sus datos.",
            onClick: () => openModal("newClient")
          },
          {
            icon: "external-link",
            label: "Generar enlace de portal",
            sub: "\xC9l rellena sus datos al registrarse.",
            accent: true,
            onClick: generateInvite
          }
        ],
        moreActions: [
          {
            icon: "refresh-cw",
            label: "Actualizar lista",
            onClick: () => {
              D.reload && D.reload();
              toast("Lista actualizada", "success");
            }
          }
        ]
      }
    )), inviteLink && /* @__PURE__ */ React.createElement("div", { onClick: () => setInviteLink(""), style: {
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
    } }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: () => setInviteLink("") }, "Cerrar"), /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: copyInvite }, inviteCopied ? /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 13 }) : null, inviteCopied ? "Copiado" : "Copiar enlace")))), /* @__PURE__ */ React.createElement("div", { className: "tasks-scroll", style: { flex: 1, minHeight: 0, overflowY: "auto", scrollbarGutter: "stable", paddingRight: 10, paddingBottom: 24 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", width: "100%" } }, clients.map((c) => {
      const projs = D.PROJECTS.filter((p) => p.clientId === c.id);
      const pTasks = projs.flatMap((p) => D.TASKS[p.id] || []);
      const doneN = pTasks.filter((t) => t.column === "done").length;
      const pct = pTasks.length ? Math.round(doneN / pTasks.length * 100) : 0;
      const col = pTasks.length && doneN === pTasks.length ? "var(--green)" : "var(--accent)";
      const on = hoverId === c.id;
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          key: c.id,
          onClick: () => navigate("clientDetail", { clientId: c.id }),
          onMouseEnter: () => setHoverId(c.id),
          onMouseLeave: () => setHoverId(null),
          style: { display: "flex", flexDirection: "column", gap: 12, padding: "18px 6px", cursor: "pointer" }
        },
        /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 14, minWidth: 0 } }, /* @__PURE__ */ React.createElement(
          Icon,
          {
            name: "users",
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
        } }, c.company || c.name || "\u2014"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: "var(--text-muted)", marginTop: 3, display: "flex", alignItems: "center", gap: 6, minWidth: 0 } }, /* @__PURE__ */ React.createElement("span", { style: { flexShrink: 0 } }, projs.length, " ", projs.length === 1 ? "proyecto" : "proyectos"), c.name && c.company && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { style: { opacity: 0.4, fontSize: 10 } }, "\u2022"), /* @__PURE__ */ React.createElement("span", { style: { flexShrink: 0 } }, c.name)), c.email && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { style: { opacity: 0.4, fontSize: 10 } }, "\u2022"), /* @__PURE__ */ React.createElement("span", { style: { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, c.email))))), /* @__PURE__ */ React.createElement(
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
        )),
        /* @__PURE__ */ React.createElement("div", { style: { position: "relative", width: "100%", height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 99, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", height: "100%", borderRadius: 99, background: col, width: `${pct}%`, transition: "width .3s" } }))
      );
    }), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => openModal("newClient"),
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
      clients.length === 0 ? "A\xF1ade tu primer cliente" : "A\xF1adir cliente",
      " ",
      /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 16 })
    ))));
  };
  const AgencyClientDetail = ({ clientId, navigate, openModal }) => {
    const D = window.Data;
    D.useStore();
    const confirm2 = useConfirm();
    const toast = useToast();
    const c = D.CLIENTS.find((x) => x.id === clientId);
    useEffect(() => {
      if (!c) navigate("clients");
    }, [c]);
    if (!c) return null;
    const projects = D.PROJECTS.filter((p) => p.clientId === c.id);
    const invoices = D.INVOICES.filter((i) => i.clientId === c.id);
    const creds = D.credentialsForClient ? D.credentialsForClient(c.id) : [];
    const ctasks = D.clientTasksFor ? D.clientTasksFor(c.id) : [];
    const projectIdSet = new Set(projects.map((p) => p.id));
    const clientDeliverables = (D.DELIVERABLES || []).filter((d) => projectIdSet.has(d.projectId));
    const [tab, setTab] = useState("vista");
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
      const ok = await confirm2({
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
      const ok = await confirm2({
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
    const NOTIFY_SECTIONS = [
      { v: "client-dashboard", label: "Inicio del portal" },
      { v: "client-status", label: "Estado del proyecto" },
      { v: "client-docs", label: "Documentaci\xF3n (subir archivos)" },
      { v: "client-credentials", label: "Credenciales (dar accesos)" }
    ];
    const [notifyOpen, setNotifyOpen] = useState(false);
    const [nf, setNf] = useState({ title: "", body: "", route: "client-dashboard" });
    const openNotify = () => {
      setNf({ title: "", body: "", route: "client-dashboard" });
      setNotifyOpen(true);
    };
    const sendNotify = () => {
      if (!nf.title.trim()) return;
      D.notify(c.id, { title: nf.title.trim(), body: nf.body.trim(), kind: "general", route: nf.route });
      setNotifyOpen(false);
      toast(c.email ? "Aviso enviado al cliente" : "Aviso creado (el cliente no tiene email, no se envi\xF3 correo)", "success");
    };
    const nInp = {
      width: "100%",
      borderRadius: 9,
      padding: "9px 12px",
      background: "var(--bg-elev)",
      border: "0.5px solid var(--border)",
      color: "var(--text)",
      fontFamily: "inherit",
      fontSize: 13.5,
      marginBottom: 10
    };
    return /* @__PURE__ */ React.createElement("div", { className: "page", onClick: () => setMenuOpen(false) }, /* @__PURE__ */ React.createElement(
      Modal,
      {
        open: notifyOpen,
        onClose: () => setNotifyOpen(false),
        title: "Enviar aviso al cliente",
        sub: c.email ? `Le llegar\xE1 a su portal (campana) y por correo a ${c.email}` : "Le llegar\xE1 a la campana de su portal (sin email, no se enviar\xE1 correo)",
        footer: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: () => setNotifyOpen(false) }, "Cancelar"), /* @__PURE__ */ React.createElement("button", { className: "btn primary", disabled: !nf.title.trim(), onClick: sendNotify }, /* @__PURE__ */ React.createElement(Icon, { name: "bell", size: 13 }), " Enviar aviso"))
      },
      /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-subtle)", marginBottom: 5 } }, "Asunto"),
      /* @__PURE__ */ React.createElement("input", { style: nInp, placeholder: "p. ej. Necesito tu logo en alta resoluci\xF3n", value: nf.title, onChange: (e) => setNf((s) => ({ ...s, title: e.target.value })), autoFocus: true }),
      /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-subtle)", marginBottom: 5 } }, "Mensaje (opcional)"),
      /* @__PURE__ */ React.createElement("textarea", { style: { ...nInp, height: 90, resize: "vertical", lineHeight: 1.5 }, placeholder: "Explica qu\xE9 necesitas del cliente\u2026", value: nf.body, onChange: (e) => setNf((s) => ({ ...s, body: e.target.value })) }),
      /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-subtle)", marginBottom: 5 } }, "El bot\xF3n del aviso lleva a"),
      /* @__PURE__ */ React.createElement("select", { style: { ...nInp, appearance: "auto" }, value: nf.route, onChange: (e) => setNf((s) => ({ ...s, route: e.target.value })) }, NOTIFY_SECTIONS.map((s) => /* @__PURE__ */ React.createElement("option", { key: s.v, value: s.v }, s.label)))
    ), /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", style: { marginBottom: 20 }, onClick: () => navigate("clients") }, /* @__PURE__ */ React.createElement(Icon, { name: "chevron", size: 12, style: { transform: "rotate(180deg)" } }), " Clientes"), editing ? /* @__PURE__ */ React.createElement("div", { className: "card", style: { marginBottom: 20 } }, /* @__PURE__ */ React.createElement("div", { className: "card-header" }, /* @__PURE__ */ React.createElement("div", { className: "card-title" }, "Editar cliente"), /* @__PURE__ */ React.createElement("div", { className: "row tight" }, /* @__PURE__ */ React.createElement("button", { className: "btn sm", onClick: cancelEdit }, "Cancelar"), /* @__PURE__ */ React.createElement("button", { className: "btn primary sm", onClick: saveEdit }, /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 12 }), " Guardar cambios"))), /* @__PURE__ */ React.createElement("div", { className: "card-body", style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "label" }, "Nombre de contacto"), /* @__PURE__ */ React.createElement("input", { className: "input", ...field("name") })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "label" }, "Empresa"), /* @__PURE__ */ React.createElement("input", { className: "input", ...field("company") })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "label" }, "Email"), /* @__PURE__ */ React.createElement("input", { className: "input", type: "email", ...field("email") })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "label" }, "WhatsApp"), /* @__PURE__ */ React.createElement("input", { className: "input", ...field("whatsapp") })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "label" }, "Servicio"), /* @__PURE__ */ React.createElement("input", { className: "input", ...field("service") })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "label" }, "Estado"), /* @__PURE__ */ React.createElement("select", { className: "select", ...field("status") }, /* @__PURE__ */ React.createElement("option", { value: "active" }, "Activo"), /* @__PURE__ */ React.createElement("option", { value: "review" }, "En revisi\xF3n"), /* @__PURE__ */ React.createElement("option", { value: "paused" }, "Pausado"))))) : /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 30 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", gap: 20, alignItems: "flex-start", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("h1", { style: { fontFamily: "var(--font-display)", fontSize: "clamp(32px,4.2vw,46px)", fontWeight: 400, letterSpacing: "-1.6px", margin: "0 0 10px" } }, c.company || c.name), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", color: "var(--text-muted)", fontSize: 14 } }, c.name && /* @__PURE__ */ React.createElement("span", null, c.name), c.email && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { style: { opacity: 0.35 } }, "\xB7"), /* @__PURE__ */ React.createElement("span", null, c.email)), c.whatsapp && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { style: { opacity: 0.35 } }, "\xB7"), /* @__PURE__ */ React.createElement("span", null, c.whatsapp)))), /* @__PURE__ */ React.createElement("div", { style: { position: "relative", flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }, onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: openNotify }, /* @__PURE__ */ React.createElement(Icon, { name: "bell", size: 13 }), " Enviar aviso"), /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only", onClick: () => setMenuOpen((o) => !o) }, /* @__PURE__ */ React.createElement(Icon, { name: "more-h", size: 16 })), menuOpen && /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      right: 0,
      top: "calc(100% + 4px)",
      zIndex: 20,
      background: "var(--bg-elev)",
      border: "0.5px solid var(--border-strong)",
      borderRadius: 10,
      padding: 4,
      minWidth: 180,
      boxShadow: "0 8px 24px rgba(0,0,0,0.25)"
    } }, /* @__PURE__ */ React.createElement("button", { onClick: () => {
      setMenuOpen(false);
      startEdit();
    }, style: { display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "7px 10px", border: 0, background: "transparent", color: "var(--text)", fontSize: 13, borderRadius: 6, cursor: "pointer", fontFamily: "inherit" } }, /* @__PURE__ */ React.createElement(Icon, { name: "edit", size: 13 }), " Editar cliente"), /* @__PURE__ */ React.createElement("button", { onClick: () => {
      setMenuOpen(false);
      toast("Archivado");
    }, style: { display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "7px 10px", border: 0, background: "transparent", color: "var(--text)", fontSize: 13, borderRadius: 6, cursor: "pointer", fontFamily: "inherit" } }, /* @__PURE__ */ React.createElement(Icon, { name: "archive", size: 13 }), " Archivar cliente"), /* @__PURE__ */ React.createElement("div", { style: { height: 1, background: "var(--border)", margin: "4px 0" } }), /* @__PURE__ */ React.createElement("button", { onClick: () => {
      setMenuOpen(false);
      removeClient();
    }, style: { display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "7px 10px", border: 0, background: "transparent", color: "var(--red)", fontSize: 13, borderRadius: 6, cursor: "pointer", fontFamily: "inherit" } }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 13 }), " Eliminar cliente"))))), /* @__PURE__ */ React.createElement("div", { className: "tabs" }, [
      { id: "vista", label: "Vista general" },
      { id: "projects", label: "Proyectos", count: projects.length },
      { id: "clienttasks", label: "Intake", count: ctasks.length },
      { id: "deliverables", label: "Entregables", count: clientDeliverables.length || null },
      { id: "billing", label: "Financiero", count: invoices.length || null },
      { id: "credentials", label: "Credenciales", count: creds.length || null },
      { id: "files", label: "Documentaci\xF3n" },
      { id: "eventos", label: "Eventos" }
    ].map((t) => /* @__PURE__ */ React.createElement("div", { key: t.id, className: "tab" + (tab === t.id ? " active" : ""), onClick: () => setTab(t.id) }, t.label, t.count != null ? /* @__PURE__ */ React.createElement("span", { className: "count" }, t.count) : null))), tab === "vista" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 16 } }, /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "card",
        onClick: hasPortal ? () => {
          try {
            sessionStorage.setItem("141_preview_client", c.id);
          } catch {
          }
          navigate("client-dashboard");
        } : void 0,
        style: { padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", cursor: hasPortal ? "pointer" : "default" }
      },
      /* @__PURE__ */ React.createElement("div", { style: {
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
      } }, /* @__PURE__ */ React.createElement(Icon, { name: hasPortal ? "check" : "external-link", size: 16, strokeWidth: 1.7 })),
      /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 200 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontWeight: 500, letterSpacing: "-0.3px" } }, hasPortal ? "Portal de cliente activo" : "Sin portal de cliente"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-muted)", marginTop: 2 } }, hasPortal ? `${c.email} tiene acceso \xB7 pulsa para verlo` : "Genera un enlace para que cree su acceso.")),
      portalLink ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }, onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement(
        "input",
        {
          readOnly: true,
          value: portalLink,
          onClick: (e) => e.target.select(),
          style: { fontSize: 12, padding: "8px 12px", borderRadius: 8, background: "var(--bg-elev)", border: "0.5px solid var(--border)", color: "var(--text-muted)", fontFamily: "var(--font-mono)", width: 320, maxWidth: "100%" }
        }
      ), /* @__PURE__ */ React.createElement("button", { className: "btn primary sm", onClick: copyPortal }, portalCopied ? /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 12 }) : null, " ", portalCopied ? "Copiado" : "Copiar enlace")) : hasPortal ? /* @__PURE__ */ React.createElement("div", { className: "row tight", style: { color: "var(--text-muted)", fontSize: 13, flexShrink: 0 } }, "Abrir portal ", /* @__PURE__ */ React.createElement(Icon, { name: "arrow", size: 13 })) : /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: (e) => {
        e.stopPropagation();
        createPortal();
      }, disabled: portalBusy }, /* @__PURE__ */ React.createElement(Icon, { name: "external-link", size: 13 }), " ", portalBusy ? "Generando\u2026" : "Crear portal")
    ), c.fiscalName || c.nif || c.fiscalAddress || c.website || c.about ? /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "18px 20px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-subtle)", marginBottom: 12 } }, "Datos de facturaci\xF3n"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: "12px 24px" } }, [["Raz\xF3n social", c.fiscalName], ["NIF / CIF", c.nif], ["Direcci\xF3n fiscal", c.fiscalAddress], ["Web", c.website]].filter(([, v]) => v).map(([k, v]) => /* @__PURE__ */ React.createElement("div", { key: k }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-subtle)", marginBottom: 3 } }, k), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, color: "var(--text)", wordBreak: "break-word" } }, v)))), c.about && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-subtle)", marginBottom: 3 } }, "A qu\xE9 se dedica"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.5 } }, c.about))) : /* @__PURE__ */ React.createElement(Empty, { icon: "user-cog", title: "Sin datos de onboarding", sub: "Cuando el cliente complete su registro, aqu\xED ver\xE1s sus datos fiscales y a qu\xE9 se dedica." })), tab === "projects" && /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 } }, projects.map((p) => {
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
    )), tab === "billing" && (invoices.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { icon: "receipt", title: "Sin facturas", sub: "Este cliente todav\xEDa no tiene facturas." }) : /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body flush" }, /* @__PURE__ */ React.createElement("div", { style: { padding: "14px 18px", borderBottom: "0.5px solid var(--border)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-subtle)" } }, invoices.length, " factura", invoices.length === 1 ? "" : "s", " \xB7 Total \u20AC", totalBilled.toLocaleString("es-ES")), /* @__PURE__ */ React.createElement("table", { className: "table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "N\xBA"), /* @__PURE__ */ React.createElement("th", null, "Proyecto"), /* @__PURE__ */ React.createElement("th", null, "Tipo"), /* @__PURE__ */ React.createElement("th", null, "Emitida"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "Importe"), /* @__PURE__ */ React.createElement("th", null, "Estado"))), /* @__PURE__ */ React.createElement("tbody", null, invoices.map((i) => /* @__PURE__ */ React.createElement("tr", { key: i.id }, /* @__PURE__ */ React.createElement("td", { style: { fontFamily: "var(--font-mono)", fontSize: 12 } }, i.id), /* @__PURE__ */ React.createElement("td", null, i.project), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: "chip" }, i.type)), /* @__PURE__ */ React.createElement("td", { className: "muted" }, i.issued), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", fontWeight: 500 } }, "\u20AC", i.amount.toLocaleString("es-ES")), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(StatusChip, { status: i.status }))))))))), tab === "deliverables" && (clientDeliverables.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { icon: "package", title: "Sin entregables", sub: "Los entregables de los proyectos de este cliente aparecer\xE1n aqu\xED." }) : /* @__PURE__ */ React.createElement("div", { className: "rg-deliverables" }, clientDeliverables.map((d) => {
      const proj = projects.find((p) => p.id === d.projectId);
      return /* @__PURE__ */ React.createElement("div", { key: d.id, className: "card" }, /* @__PURE__ */ React.createElement("div", { style: { aspectRatio: "16/10", background: d.thumb || "linear-gradient(135deg,#1e3a8a,#0f172a)", borderTopLeftRadius: 10, borderTopRightRadius: 10 } }), /* @__PURE__ */ React.createElement("div", { className: "card-body" }, /* @__PURE__ */ React.createElement("div", { className: "row between" }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 500, fontSize: 13.5 } }, d.title), d.version && /* @__PURE__ */ React.createElement("span", { className: "chip" }, d.version)), /* @__PURE__ */ React.createElement("div", { className: "subtle xsmall", style: { marginTop: 6 } }, proj?.name || "\u2014", d.date ? " \xB7 " + d.date : ""), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 12 } }, d.status === "approved" ? /* @__PURE__ */ React.createElement("span", { className: "row tight", style: { color: "var(--green)", fontSize: 12.5 } }, /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 13 }), " Aprobado") : /* @__PURE__ */ React.createElement("span", { className: "chip amber", style: { fontSize: 11 } }, "Pendiente de aprobar"))));
    }))), tab === "eventos" && (() => {
      const evs = [];
      projects.forEach((p) => (p.phasesDone || []).forEach((name) => evs.push({ type: "Fase", title: `Fase completada: ${name}`, sub: p.name })));
      projects.forEach((p) => (D.TASKS[p.id] || []).forEach((t) => {
        if (t.column === "done") evs.push({ type: "Hito", title: t.title, sub: p.name });
      }));
      ctasks.forEach((t) => {
        if (t.done) evs.push({ type: "Intake", title: `El cliente realiz\xF3: ${t.title}` });
      });
      evs.push({ type: "Alta", title: "Cliente creado en la plataforma" });
      return /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body", style: { padding: 20 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 500, marginBottom: 4 } }, "Historial de eventos"), /* @__PURE__ */ React.createElement("div", { className: "muted xsmall", style: { marginBottom: 16 } }, "Lo que ha pasado en el proyecto, en orden cronol\xF3gico inverso."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } }, evs.map((e, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", gap: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 7, height: 7, borderRadius: 99, background: "var(--text-subtle)", marginTop: 5, flexShrink: 0 } }), /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-subtle)" } }, e.type, e.sub ? " \xB7 " + e.sub : ""), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, marginTop: 2, lineHeight: 1.4 } }, e.title)))))));
    })(), tab === "files" && /* @__PURE__ */ React.createElement(AgencyDriveFolder, { client: c }), tab === "clienttasks" && /* @__PURE__ */ React.createElement(AgencyClientTasks, { clientId: c.id }), tab === "credentials" && /* @__PURE__ */ React.createElement(AgencyCredentials, { clientId: c.id }), tab === "notas" && /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body" }, /* @__PURE__ */ React.createElement("textarea", { className: "textarea", rows: 6, defaultValue: `Cliente hist\xF3rico, prefiere comunicaci\xF3n por WhatsApp.
Prioridad: redise\xF1o antes del Q3.
Pedido: factura siempre con CIF en cabecera.` }), /* @__PURE__ */ React.createElement("div", { className: "row", style: { marginTop: 12, justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("button", { className: "btn primary sm" }, "Guardar nota")))));
  };
  const AgencyCredentials = ({ clientId }) => {
    const D = window.Data;
    D.useStore && D.useStore();
    const creds = D.credentialsForClient ? D.credentialsForClient(clientId) : [];
    const cat = D.CRED_CATALOG || [];
    const agencyEmail = D.SETTINGS && D.SETTINGS.email || "tu correo";
    const [picking, setPicking] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ username: "", password: "", notes: "" });
    const [reveal, setReveal] = useState({});
    const [copied, setCopied] = useState("");
    const copy = (v, k) => {
      try {
        navigator.clipboard.writeText(v);
        setCopied(k);
        setTimeout(() => setCopied(""), 1200);
      } catch {
      }
    };
    const brand = { width: 32, height: 32, borderRadius: 8, background: "var(--bg-elev-2)", display: "grid", placeItems: "center", color: "var(--text)", border: "0.5px solid var(--border)", flexShrink: 0 };
    const inp = { width: "100%", height: 38, borderRadius: 9, padding: "8px 12px", background: "var(--bg-elev)", border: "0.5px solid var(--border)", color: "var(--text)", fontFamily: "inherit", fontSize: 13.5, marginBottom: 9 };
    const add = (p) => {
      D.addCredential(clientId, { platform: p.key, label: p.name });
      setPicking(false);
    };
    const startEdit = (c) => {
      setForm({ username: c.username, password: c.password, notes: c.notes });
      setEditId(c.id);
    };
    const saveEdit = () => {
      D.updateCredential(editId, form);
      setEditId(null);
    };
    const del = (c) => {
      if (confirm(`\xBFEliminar "${c.label || ""}"?`)) D.deleteCredential(c.id);
    };
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "row between", style: { marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { className: "small muted" }, "Accesos del cliente. El cliente tambi\xE9n los ve y edita desde su portal."), !picking && /* @__PURE__ */ React.createElement("button", { className: "btn primary sm", onClick: () => setPicking(true) }, /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 13 }), " A\xF1adir")), picking && /* @__PURE__ */ React.createElement("div", { className: "card", style: { marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { className: "card-body", style: { padding: 16 } }, /* @__PURE__ */ React.createElement("div", { className: "muted small", style: { marginBottom: 12 } }, "\xBFQu\xE9 acceso quieres a\xF1adir?"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px,1fr))", gap: 10 } }, cat.map((p) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: p.key,
        onClick: () => add(p),
        style: { display: "flex", alignItems: "center", gap: 9, padding: "10px 12px", cursor: "pointer", background: "var(--bg-elev-2)", border: "0.5px solid var(--border)", borderRadius: 10, textAlign: "left", fontFamily: "inherit" }
      },
      /* @__PURE__ */ React.createElement("span", { style: brand }, /* @__PURE__ */ React.createElement(Icon, { name: p.icon, size: 16 })),
      /* @__PURE__ */ React.createElement("span", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("span", { style: { display: "block", fontWeight: 500, fontSize: 13, color: "var(--text)" } }, p.name), /* @__PURE__ */ React.createElement("span", { className: "muted xsmall" }, p.mode === "access" ? "Dar acceso" : "Usuario y clave"))
    ))))), creds.length === 0 && !picking ? /* @__PURE__ */ React.createElement(Empty, { icon: "lock", title: "Sin credenciales", sub: "A\xF1ade los accesos del cliente o p\xEDdele que los rellene desde su portal." }) : /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 12 } }, creds.map((c) => {
      const meta = D.credMeta(c.platform);
      const mode = meta.mode;
      const ed = editId === c.id;
      return /* @__PURE__ */ React.createElement("div", { key: c.id, className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body", style: { padding: 15 } }, /* @__PURE__ */ React.createElement("div", { className: "row between", style: { alignItems: "flex-start" } }, /* @__PURE__ */ React.createElement("div", { className: "row tight" }, /* @__PURE__ */ React.createElement("span", { style: brand }, /* @__PURE__ */ React.createElement(Icon, { name: meta.icon, size: 15 })), /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 500, fontSize: 14 } }, c.label || meta.name)), /* @__PURE__ */ React.createElement("div", { className: "row tight" }, mode === "login" && !ed && /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only sm", onClick: () => startEdit(c) }, /* @__PURE__ */ React.createElement(Icon, { name: "edit", size: 12 })), /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only sm", onClick: () => del(c) }, /* @__PURE__ */ React.createElement(Icon, { name: "trash", size: 12 })))), mode === "access" ? /* @__PURE__ */ React.createElement("div", { style: { marginTop: 10 } }, /* @__PURE__ */ React.createElement("div", { className: "muted xsmall", style: { marginBottom: 6 } }, "El cliente da acceso a:"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { flex: 1, fontFamily: "var(--font-mono)", fontSize: 12.5, wordBreak: "break-all" } }, agencyEmail), /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only sm", onClick: () => copy(agencyEmail, c.id + "m") }, /* @__PURE__ */ React.createElement(Icon, { name: copied === c.id + "m" ? "check" : "copy", size: 11 }))), /* @__PURE__ */ React.createElement("div", { className: "xsmall", style: { marginTop: 8, color: c.granted ? "var(--green)" : "var(--text-subtle)" } }, c.granted ? "\u2713 Acceso concedido" : "Pendiente de acceso")) : ed ? /* @__PURE__ */ React.createElement("div", { style: { marginTop: 10 } }, /* @__PURE__ */ React.createElement("input", { style: inp, placeholder: "Usuario / email", value: form.username, onChange: (e) => setForm((s) => ({ ...s, username: e.target.value })), autoFocus: true }), /* @__PURE__ */ React.createElement("input", { style: inp, placeholder: "Contrase\xF1a", value: form.password, onChange: (e) => setForm((s) => ({ ...s, password: e.target.value })) }), /* @__PURE__ */ React.createElement("input", { style: { ...inp, marginBottom: 10 }, placeholder: "Notas", value: form.notes, onChange: (e) => setForm((s) => ({ ...s, notes: e.target.value })) }), /* @__PURE__ */ React.createElement("div", { className: "row tight" }, /* @__PURE__ */ React.createElement("button", { className: "btn primary sm", onClick: saveEdit }, "Guardar"), /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: () => setEditId(null) }, "Cancelar"))) : /* @__PURE__ */ React.createElement("div", { style: { marginTop: 8 } }, c.username && /* @__PURE__ */ React.createElement("div", { className: "small", style: { marginTop: 4, wordBreak: "break-all" } }, /* @__PURE__ */ React.createElement("span", { className: "muted" }, "Usuario: "), c.username, /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only sm", style: { marginLeft: 4 }, onClick: () => copy(c.username, c.id + "u") }, /* @__PURE__ */ React.createElement(Icon, { name: copied === c.id + "u" ? "check" : "copy", size: 11 }))), c.password && /* @__PURE__ */ React.createElement("div", { className: "small", style: { marginTop: 4, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", { className: "muted" }, "Clave: "), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)" } }, reveal[c.id] ? c.password : "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"), /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only sm", onClick: () => setReveal((r) => ({ ...r, [c.id]: !r[c.id] })) }, /* @__PURE__ */ React.createElement(Icon, { name: reveal[c.id] ? "eye-off" : "eye", size: 11 })), /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only sm", onClick: () => copy(c.password, c.id + "p") }, /* @__PURE__ */ React.createElement(Icon, { name: copied === c.id + "p" ? "check" : "copy", size: 11 }))), !c.username && !c.password && /* @__PURE__ */ React.createElement("div", { className: "muted xsmall", style: { marginTop: 4 } }, "El cliente a\xFAn no lo ha rellenado."), c.notes && /* @__PURE__ */ React.createElement("div", { className: "muted xsmall", style: { marginTop: 8, lineHeight: 1.5 } }, c.notes))));
    })));
  };
  const AgencyDriveFolder = ({ client }) => {
    const D = window.Data;
    const [url, setUrl] = useState(client.driveUrl || "");
    const [saved, setSaved] = useState(false);
    const save = () => {
      D.updateClient(client.id, { driveUrl: url.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    };
    const inp = {
      width: "100%",
      height: 40,
      borderRadius: 10,
      padding: "8px 12px",
      background: "var(--bg-elev)",
      border: "0.5px solid var(--border)",
      color: "var(--text)",
      fontFamily: "inherit",
      fontSize: 13.5
    };
    return /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body", style: { padding: 20 } }, /* @__PURE__ */ React.createElement("div", { className: "row tight", style: { marginBottom: 6 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 24, height: 24, borderRadius: 6, background: "#fff", display: "grid", placeItems: "center" } }, /* @__PURE__ */ React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24" }, /* @__PURE__ */ React.createElement("path", { fill: "#1FA463", d: "M7.71 3.5L1.15 15l3.27 5.5h13.16L21.85 15 14.29 3.5z" }), /* @__PURE__ */ React.createElement("path", { fill: "#FFD041", d: "M7.71 3.5h6.58L21.85 15l-3.27 5.5z", opacity: ".7" }))), /* @__PURE__ */ React.createElement("div", { className: "card-title" }, "Carpeta de Google Drive del cliente")), /* @__PURE__ */ React.createElement("div", { className: "small muted", style: { marginBottom: 14, lineHeight: 1.5 } }, "Pega el enlace de la carpeta compartida. El cliente ver\xE1 el bot\xF3n \xABAbrir carpeta en Google Drive\xBB en su portal \u2192 Documentaci\xF3n. Si lo dejas vac\xEDo, ver\xE1 \xABEstamos preparando la carpeta\xBB."), /* @__PURE__ */ React.createElement("input", { style: inp, placeholder: "https://drive.google.com/drive/folders/\u2026", value: url, onChange: (e) => setUrl(e.target.value) }), /* @__PURE__ */ React.createElement("div", { className: "row tight", style: { marginTop: 10 } }, /* @__PURE__ */ React.createElement("button", { className: "btn primary sm", onClick: save }, "Guardar enlace"), client.driveUrl && /* @__PURE__ */ React.createElement("a", { className: "btn ghost sm", href: client.driveUrl, target: "_blank", rel: "noreferrer", style: { textDecoration: "none" } }, /* @__PURE__ */ React.createElement(Icon, { name: "external-link", size: 12 }), " Abrir"), saved && /* @__PURE__ */ React.createElement("span", { className: "small", style: { color: "var(--green)" } }, "Guardado \u2713"))));
  };
  const AgencyClientTasks = ({ clientId }) => {
    const D = window.Data;
    D.useStore && D.useStore();
    const tasks = D.clientTasksFor ? D.clientTasksFor(clientId) : [];
    const [adding, setAdding] = useState(false);
    const [editing, setEditing] = useState(null);
    const blank = { title: "", description: "", link: "" };
    const [form, setForm] = useState(blank);
    const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));
    const startAdd = () => {
      setForm(blank);
      setEditing(null);
      setAdding(true);
    };
    const startEdit = (t) => {
      setForm({ title: t.title, description: t.description, link: t.link || "" });
      setEditing(t.id);
      setAdding(true);
    };
    const SECTIONS = [
      { v: "", label: "Sin destino (solo marcar hecho)" },
      { v: "client-docs", label: "Documentaci\xF3n (subir archivos)" },
      { v: "client-credentials", label: "Credenciales (dar accesos)" },
      { v: "client-status", label: "Estado del proyecto" }
    ];
    const _sectLabel = (v) => (SECTIONS.find((s) => s.v === v) || {}).label || "";
    const cancel = () => {
      setAdding(false);
      setEditing(null);
      setForm(blank);
    };
    const save = () => {
      if (!form.title.trim()) return;
      if (editing) D.updateClientTask(editing, form);
      else D.addClientTask(clientId, form);
      cancel();
    };
    const del = (t) => {
      if (confirm(`\xBFEliminar la tarea "${t.title}"?`)) D.deleteClientTask(t.id);
    };
    const inp = {
      width: "100%",
      height: 38,
      borderRadius: 9,
      padding: "8px 12px",
      background: "var(--bg-elev)",
      border: "0.5px solid var(--border)",
      color: "var(--text)",
      fontFamily: "inherit",
      fontSize: 13.5,
      marginBottom: 9
    };
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "row between", style: { marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { className: "small muted" }, "Acciones que el cliente ver\xE1 en \xABQu\xE9 te toca ahora\xBB. \xC9l las marca como realizadas desde su portal."), !adding && /* @__PURE__ */ React.createElement("button", { className: "btn primary sm", onClick: startAdd }, /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 13 }), " A\xF1adir")), adding && /* @__PURE__ */ React.createElement("div", { className: "card", style: { marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { className: "card-body", style: { padding: 16 } }, /* @__PURE__ */ React.createElement("input", { style: inp, placeholder: "T\xEDtulo (p.ej. Rellenar el cuestionario)", value: form.title, onChange: (e) => set("title", e.target.value), autoFocus: true }), /* @__PURE__ */ React.createElement("input", { style: inp, placeholder: "Descripci\xF3n (opcional)", value: form.description, onChange: (e) => set("description", e.target.value) }), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--text-subtle)", margin: "2px 0 5px" } }, "\xBFA qu\xE9 secci\xF3n lleva el bot\xF3n del cliente?"), /* @__PURE__ */ React.createElement("select", { style: { ...inp, marginBottom: 12, appearance: "auto" }, value: form.link, onChange: (e) => set("link", e.target.value) }, SECTIONS.map((s) => /* @__PURE__ */ React.createElement("option", { key: s.v, value: s.v }, s.label))), /* @__PURE__ */ React.createElement("div", { className: "row tight" }, /* @__PURE__ */ React.createElement("button", { className: "btn primary sm", disabled: !form.title.trim(), onClick: save }, "Guardar"), /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: cancel }, "Cancelar")))), tasks.length === 0 && !adding ? /* @__PURE__ */ React.createElement(Empty, { icon: "list-todo", title: "Sin tareas para el cliente", sub: "A\xF1ade las acciones de onboarding que el cliente debe completar." }) : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, tasks.map((t, i) => /* @__PURE__ */ React.createElement("div", { key: t.id, className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body", style: { padding: 15, display: "flex", gap: 14, alignItems: "flex-start" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 300, color: "var(--text-subtle)", minWidth: 20 } }, i + 1), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { className: "row between", style: { alignItems: "flex-start", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 500, fontSize: 14 } }, t.title), /* @__PURE__ */ React.createElement("div", { className: "row tight", style: { flexShrink: 0 } }, t.done && /* @__PURE__ */ React.createElement("span", { className: "chip green", style: { fontSize: 10, padding: "1px 7px" } }, "Realizado"), /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only sm", onClick: () => startEdit(t) }, /* @__PURE__ */ React.createElement(Icon, { name: "edit", size: 12 })), /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only sm", onClick: () => del(t) }, /* @__PURE__ */ React.createElement(Icon, { name: "trash", size: 12 })))), t.description && /* @__PURE__ */ React.createElement("div", { className: "muted small", style: { marginTop: 4, lineHeight: 1.5 } }, t.description), t.link && /* @__PURE__ */ React.createElement("div", { className: "row tight", style: { marginTop: 6 } }, /* @__PURE__ */ React.createElement(Icon, { name: "arrow", size: 11 }), /* @__PURE__ */ React.createElement("span", { className: "xsmall muted" }, _sectLabel(t.link)))))))));
  };
  Object.assign(window, { AgencyClientsList, AgencyClientDetail });
})();

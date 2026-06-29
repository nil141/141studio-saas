const AGENT_STATUS = {
  working: { label: "Trabajando", dot: "var(--green)" },
  active: { label: "Activo", dot: "var(--accent)" },
  paused: { label: "En pausa", dot: "var(--text-subtle)" }
};
const DELIV_STATUS = {
  en_revision: { label: "En revisi\xF3n", color: "var(--amber)", soft: "var(--amber-soft)" },
  listo: { label: "Listo", color: "var(--green)", soft: "var(--green-soft)" },
  aprobado: { label: "Aprobado", color: "var(--green)", soft: "var(--green-soft)" },
  rechazado: { label: "Rechazado", color: "var(--red)", soft: "var(--red-soft)" }
};
const AGENT_COL = { social: "social_media" };
const AGENTS = [
  {
    id: "social",
    icon: "msg-circle",
    name: "Social Media",
    role: "Contenido de redes",
    status: "working",
    skill: "Calendario, copys y briefs de imagen",
    task: "Contenido IG semana \xB7 Gust i Tradici\xF3",
    stat: "12 entregables este mes",
    lastActivity: "hace 2h",
    skills: ["Calendario de contenido", "Copys de marca", "Briefs de imagen", "Stories"],
    chat: [
      { role: "user", content: "Hazme el contenido de Instagram de esta semana para Gust i Tradici\xF3." },
      { role: "agent", content: "Hecho. He preparado 5 piezas para la semana del 23 al 29, en catal\xE1n y con el tono sobrio de Gust. Las tienes en Entregables para revisar." },
      { role: "user", content: "La pieza 3 hazla m\xE1s centrada en el producto de temporada." },
      { role: "agent", content: "Regenerada la pieza 3 con foco en producto de temporada. Lista para revisar." }
    ],
    deliverables: [
      { title: "Contenido IG \xB7 semana 23-29 jun", date: "hoy", status: "pending" },
      { title: "Story horarios Sant Joan", date: "hace 2 d\xEDas", status: "approved" },
      { title: "Post producto de temporada", date: "hace 4 d\xEDas", status: "approved" },
      { title: "Reel inauguraci\xF3n", date: "hace 1 semana", status: "rejected" }
    ]
  },
  {
    id: "copy",
    icon: "edit",
    name: "Copywriting",
    role: "Textos",
    status: "active",
    skill: "Copy de marca, anuncios, webs",
    task: null,
    stat: "8 entregables este mes",
    lastActivity: "ayer"
  },
  {
    id: "image",
    icon: "image",
    name: "Imagen IA",
    role: "Direcci\xF3n visual",
    status: "active",
    skill: "Briefs y generaci\xF3n con Freepik",
    task: null,
    stat: "20 entregables este mes",
    lastActivity: "hace 3h"
  },
  {
    id: "web",
    icon: "command",
    name: "Web",
    role: "Desarrollo",
    status: "paused",
    skill: "Shopify, Framer, conversi\xF3n",
    task: null,
    stat: "3 entregables este mes",
    lastActivity: "hace 5 d\xEDas"
  },
  {
    id: "ads",
    icon: "megaphone",
    name: "Ads",
    role: "Campa\xF1as",
    status: "active",
    skill: "Meta y Google Ads",
    task: null,
    stat: "5 entregables este mes",
    lastActivity: "hace 1h"
  },
  {
    id: "email",
    icon: "mail",
    name: "Email/CRM",
    role: "Email marketing",
    status: "paused",
    skill: "Secuencias y campa\xF1as Klaviyo",
    task: null,
    stat: "4 entregables este mes",
    lastActivity: "hace 6 d\xEDas"
  },
  {
    id: "outreach",
    icon: "send",
    name: "Outreach",
    role: "Captaci\xF3n",
    status: "active",
    skill: "Cold email, Apollo e Instantly",
    task: "Prospecci\xF3n streetwear",
    stat: "30 leads este mes",
    lastActivity: "hace 30 min"
  }
];
const agentesLog = (what) => console.log("[Agentes mock]", what);
const StatusPill = ({ status }) => {
  const s = AGENT_STATUS[status] || AGENT_STATUS.active;
  return /* @__PURE__ */ React.createElement("div", { style: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
    padding: "3px 9px 3px 8px",
    borderRadius: 99,
    background: "var(--bg-elev-2)",
    border: "0.5px solid var(--border)"
  } }, /* @__PURE__ */ React.createElement("span", { style: { width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: "var(--text-muted)", letterSpacing: "-0.2px" } }, s.label));
};
const AgentesPage = ({ navigate }) => {
  const AgentCard = ({ a }) => /* @__PURE__ */ React.createElement(
    "div",
    {
      onClick: () => navigate("agente", { agentId: a.id }),
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 13,
        padding: "16px 17px",
        borderRadius: 14,
        background: "var(--bg-elev)",
        border: "0.5px solid var(--border)",
        cursor: "pointer",
        transition: "border-color .15s, background .15s"
      },
      onMouseEnter: (e) => {
        e.currentTarget.style.borderColor = "var(--accent)";
        e.currentTarget.style.background = "var(--bg-elev-2)";
      },
      onMouseLeave: (e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.background = "var(--bg-elev)";
      }
    },
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 11, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: {
      width: 38,
      height: 38,
      borderRadius: 10,
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg-elev-2)",
      border: "0.5px solid var(--border)",
      color: "var(--text)"
    } }, /* @__PURE__ */ React.createElement(Icon, { name: a.icon, size: 17, strokeWidth: 1.7 })), /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: {
      fontSize: 14,
      fontWeight: 500,
      color: "var(--text)",
      letterSpacing: "-0.4px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    } }, a.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-muted)", marginTop: 1, letterSpacing: "-0.2px" } }, a.role))), /* @__PURE__ */ React.createElement(StatusPill, { status: a.status })),
    /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.4, letterSpacing: "-0.2px" } }, a.skill),
    /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, letterSpacing: "-0.2px", lineHeight: 1.4 } }, a.task ? /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-subtle)" } }, "Tarea actual: "), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text)" } }, a.task)) : /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-subtle)" } }, "Sin tareas")),
    /* @__PURE__ */ React.createElement("div", { style: {
      borderTop: "0.5px solid var(--border)",
      paddingTop: 11,
      marginTop: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      fontSize: 11,
      color: "var(--text-subtle)",
      letterSpacing: "-0.1px"
    } }, /* @__PURE__ */ React.createElement("span", null, a.stat), /* @__PURE__ */ React.createElement(Icon, { name: "chevron-right", size: 14, style: { color: "var(--text-subtle)" } }))
  );
  return /* @__PURE__ */ React.createElement("div", { className: "page" }, /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", null, "Agentes"), /* @__PURE__ */ React.createElement("div", { className: "sub" }, "Tu equipo de especialistas"))), /* @__PURE__ */ React.createElement(
    "div",
    {
      onClick: () => agentesLog("Abrir Nora"),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "22px 24px",
        borderRadius: 16,
        marginBottom: 22,
        background: "linear-gradient(135deg, var(--accent-soft), var(--bg-elev))",
        border: "0.5px solid var(--border-strong)",
        cursor: "pointer",
        transition: "border-color .15s"
      },
      onMouseEnter: (e) => e.currentTarget.style.borderColor = "var(--accent)",
      onMouseLeave: (e) => e.currentTarget.style.borderColor = "var(--border-strong)"
    },
    /* @__PURE__ */ React.createElement("div", { style: {
      width: 54,
      height: 54,
      borderRadius: 14,
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--accent-soft)",
      border: "0.5px solid rgba(158,154,229,0.4)",
      color: "var(--accent)"
    } }, /* @__PURE__ */ React.createElement(Icon, { name: "sparkles", size: 26, strokeWidth: 1.6 })),
    /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 20, fontWeight: 500, color: "var(--text)", letterSpacing: "-0.8px" } }, "Nora"), /* @__PURE__ */ React.createElement("span", { style: {
      display: "inline-flex",
      alignItems: "center",
      fontSize: 11,
      padding: "3px 10px",
      borderRadius: 99,
      background: "var(--accent-soft)",
      color: "var(--accent)",
      letterSpacing: "-0.2px"
    } }, "Orquestadora \xB7 reparte el trabajo")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, color: "var(--text-muted)", marginTop: 5, letterSpacing: "-0.3px", lineHeight: 1.45 } }, "Recibe tus encargos y los delega al especialista correcto.")),
    /* @__PURE__ */ React.createElement(Icon, { name: "chevron-right", size: 18, style: { color: "var(--text-subtle)", flexShrink: 0 } })
  ), /* @__PURE__ */ React.createElement("div", { style: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 16
  } }, AGENTS.map((a) => /* @__PURE__ */ React.createElement(AgentCard, { key: a.id, a }))));
};
const AgentChatMessage = ({ m, icon }) => {
  if (m.role === "user") {
    return /* @__PURE__ */ React.createElement("div", { style: { alignSelf: "flex-end", maxWidth: "85%" } }, /* @__PURE__ */ React.createElement("div", { style: {
      background: "var(--accent)",
      color: "var(--accent-fg)",
      padding: "8px 12px",
      borderRadius: "12px 12px 4px 12px",
      fontSize: 13.5,
      lineHeight: 1.5,
      whiteSpace: "pre-wrap"
    } }, m.content));
  }
  return /* @__PURE__ */ React.createElement("div", { style: { alignSelf: "flex-start", maxWidth: "92%", display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("div", { style: {
    width: 22,
    height: 22,
    borderRadius: 6,
    flexShrink: 0,
    background: "linear-gradient(135deg,#a78bfa 0%,#60a5fa 100%)",
    display: "grid",
    placeItems: "center",
    color: "#fff",
    marginTop: 2
  } }, /* @__PURE__ */ React.createElement(Icon, { name: icon, size: 11 })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0, fontSize: 13.5, lineHeight: 1.6, color: "var(--text)", whiteSpace: "pre-wrap" } }, m.content));
};
const AgenteDetail = ({ navigate, agentId }) => {
  const a = AGENTS.find((x) => x.id === agentId) || AGENTS[0];
  const s = AGENT_STATUS[a.status] || AGENT_STATUS.active;
  const skills = a.skills || [a.skill];
  const chat = a.chat || [];
  const stats = [
    a.stat,
    a.status === "working" ? "Trabajando ahora" : "Estado: " + s.label,
    "\xDAltima actividad: " + (a.lastActivity || "\u2014")
  ];
  const [deliverables, setDeliverables] = useState([]);
  const [delivLoading, setDelivLoading] = useState(true);
  useEffect(() => {
    let cancel = false;
    (async () => {
      setDelivLoading(true);
      const col = AGENT_COL[a.id] || a.id;
      const list = await window.Data.listDeliverables();
      if (cancel) return;
      setDeliverables(list.filter((d) => d.agent === col));
      setDelivLoading(false);
    })();
    return () => {
      cancel = true;
    };
  }, [a.id]);
  return /* @__PURE__ */ React.createElement("div", { className: "page" }, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 16 } }, /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: () => navigate("agentes") }, /* @__PURE__ */ React.createElement(Icon, { name: "chevron", size: 12, style: { transform: "rotate(180deg)" } }), " Volver")), /* @__PURE__ */ React.createElement("div", { className: "page-head", style: { alignItems: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 14, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: {
    width: 48,
    height: 48,
    borderRadius: 12,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg-elev-2)",
    border: "0.5px solid var(--border)",
    color: "var(--text)"
  } }, /* @__PURE__ */ React.createElement(Icon, { name: a.icon, size: 22, strokeWidth: 1.7 })), /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("h1", { style: { margin: 0 } }, a.name), /* @__PURE__ */ React.createElement(StatusPill, { status: a.status })), /* @__PURE__ */ React.createElement("div", { className: "sub" }, a.role)))), /* @__PURE__ */ React.createElement("div", { className: "agente-info", style: { marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-header" }, /* @__PURE__ */ React.createElement("div", { className: "card-title" }, "Skills")), /* @__PURE__ */ React.createElement("div", { className: "card-body", style: { display: "flex", flexWrap: "wrap", gap: 8 } }, skills.map((sk) => /* @__PURE__ */ React.createElement("span", { key: sk, style: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 11px",
    borderRadius: 99,
    background: "var(--bg-elev-2)",
    border: "0.5px solid var(--border)",
    fontSize: 12.5,
    color: "var(--text)",
    letterSpacing: "-0.2px"
  } }, /* @__PURE__ */ React.createElement("span", { style: { width: 5, height: 5, borderRadius: "50%", background: "var(--accent)" } }), sk)))), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-header" }, /* @__PURE__ */ React.createElement("div", { className: "card-title" }, "Stats")), /* @__PURE__ */ React.createElement("div", { className: "card-body", style: { display: "flex", flexDirection: "column", gap: 12 } }, stats.map((st, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text-muted)", letterSpacing: "-0.2px" } }, /* @__PURE__ */ React.createElement("span", { style: { width: 6, height: 6, borderRadius: "50%", background: i === 1 ? s.dot : "var(--text-subtle)", flexShrink: 0 } }), st))))), /* @__PURE__ */ React.createElement("div", { className: "agente-main" }, /* @__PURE__ */ React.createElement("div", { className: "card", style: { display: "flex", flexDirection: "column", height: 480, padding: 0, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { className: "card-header", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("div", { className: "card-title" }, "Chat con ", a.name)), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16, padding: "20px 22px" } }, chat.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { margin: "auto", textAlign: "center", color: "var(--text-subtle)", fontSize: 13 } }, "A\xFAn no hay mensajes con este agente.") : chat.map((m, i) => /* @__PURE__ */ React.createElement(AgentChatMessage, { key: i, m, icon: a.icon }))), /* @__PURE__ */ React.createElement("div", { style: { flexShrink: 0, padding: "12px 16px 16px", borderTop: "0.5px solid var(--border)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.04)", border: "0.5px solid var(--border-strong)", borderRadius: 16, padding: "10px 10px 10px 16px" } }, /* @__PURE__ */ React.createElement(
    "textarea",
    {
      placeholder: "Escribe a " + a.name + "\u2026",
      rows: 1,
      style: { flex: 1, border: 0, outline: 0, background: "transparent", resize: "none", fontFamily: "inherit", fontSize: 14, color: "var(--text)", letterSpacing: "-0.4px", lineHeight: 1.5, maxHeight: 120 },
      onKeyDown: (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          agentesLog("enviar a " + a.name);
        }
      }
    }
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => agentesLog("enviar a " + a.name),
      style: { width: 34, height: 34, borderRadius: "50%", background: "var(--accent)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "arrow-up", size: 15 })
  )))), /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: 0, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { className: "card-header" }, /* @__PURE__ */ React.createElement("div", { className: "card-title" }, "Entregables recientes")), /* @__PURE__ */ React.createElement("div", null, delivLoading ? /* @__PURE__ */ React.createElement("div", { style: { padding: "28px 20px", textAlign: "center", color: "var(--text-subtle)", fontSize: 13 } }, "Cargando\u2026") : deliverables.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { padding: "28px 20px", textAlign: "center", color: "var(--text-subtle)", fontSize: 13 } }, "Sin entregables todav\xEDa.") : deliverables.map((d, i) => {
    const ds = DELIV_STATUS[d.status] || { label: d.status || "\u2014", color: "var(--text-muted)", soft: "var(--bg-elev-2)" };
    const fecha = d.created_at ? new Date(d.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short" }) : "";
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: d.id || i,
        onClick: () => navigate("revisar", { agentId: a.id, deliverableId: d.id }),
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "13px 18px",
          cursor: "pointer",
          borderBottom: i < deliverables.length - 1 ? "0.5px solid var(--border)" : "none",
          transition: "background .12s"
        },
        onMouseEnter: (e) => e.currentTarget.style.background = "var(--bg-elev-2)",
        onMouseLeave: (e) => e.currentTarget.style.background = "transparent"
      },
      /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: {
        fontSize: 13,
        fontWeight: 500,
        color: "var(--text)",
        letterSpacing: "-0.3px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      } }, d.title), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-subtle)", marginTop: 2 } }, fecha)),
      /* @__PURE__ */ React.createElement("span", { style: {
        flexShrink: 0,
        fontSize: 11,
        padding: "3px 9px",
        borderRadius: 99,
        background: ds.soft,
        color: ds.color,
        letterSpacing: "-0.2px"
      } }, ds.label)
    );
  })))));
};
window.AgentesPage = AgentesPage;
window.AgenteDetail = AgenteDetail;

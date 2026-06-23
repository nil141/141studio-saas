const AgentesPage = ({ navigate }) => {
  const STATUS = {
    working: { label: "Trabajando", dot: "var(--green)" },
    active: { label: "Activo", dot: "var(--accent)" },
    paused: { label: "En pausa", dot: "var(--text-subtle)" }
  };
  const AGENTS = [
    {
      icon: "msg-circle",
      name: "Social Media",
      role: "Contenido de redes",
      status: "working",
      skill: "Calendario, copys y briefs de imagen",
      task: "Contenido IG semana \xB7 Gust i Tradici\xF3",
      stat: "12 entregables este mes"
    },
    {
      icon: "edit",
      name: "Copywriting",
      role: "Textos",
      status: "active",
      skill: "Copy de marca, anuncios, webs",
      task: null,
      stat: "8 entregables este mes"
    },
    {
      icon: "image",
      name: "Imagen IA",
      role: "Direcci\xF3n visual",
      status: "active",
      skill: "Briefs y generaci\xF3n con Freepik",
      task: null,
      stat: "20 entregables este mes"
    },
    {
      icon: "command",
      name: "Web",
      role: "Desarrollo",
      status: "paused",
      skill: "Shopify, Framer, conversi\xF3n",
      task: null,
      stat: "3 entregables este mes"
    },
    {
      icon: "megaphone",
      name: "Ads",
      role: "Campa\xF1as",
      status: "active",
      skill: "Meta y Google Ads",
      task: null,
      stat: "5 entregables este mes"
    },
    {
      icon: "mail",
      name: "Email/CRM",
      role: "Email marketing",
      status: "paused",
      skill: "Secuencias y campa\xF1as Klaviyo",
      task: null,
      stat: "4 entregables este mes"
    },
    {
      icon: "send",
      name: "Outreach",
      role: "Captaci\xF3n",
      status: "active",
      skill: "Cold email, Apollo e Instantly",
      task: "Prospecci\xF3n streetwear",
      stat: "30 leads este mes"
    }
  ];
  const log = (what) => console.log("[Agentes mock]", what);
  const AgentCard = ({ a }) => {
    const s = STATUS[a.status] || STATUS.active;
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        onClick: () => log("Abrir agente: " + a.name),
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
      } }, a.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-muted)", marginTop: 1, letterSpacing: "-0.2px" } }, a.role))), /* @__PURE__ */ React.createElement("div", { style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        flexShrink: 0,
        padding: "3px 9px 3px 8px",
        borderRadius: 99,
        background: "var(--bg-elev-2)",
        border: "0.5px solid var(--border)"
      } }, /* @__PURE__ */ React.createElement("span", { style: { width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: "var(--text-muted)", letterSpacing: "-0.2px" } }, s.label))),
      /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.4, letterSpacing: "-0.2px" } }, a.skill),
      /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, letterSpacing: "-0.2px", lineHeight: 1.4 } }, a.task ? /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-subtle)" } }, "Tarea actual: "), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text)" } }, a.task)) : /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-subtle)" } }, "Sin tareas")),
      /* @__PURE__ */ React.createElement("div", { style: {
        borderTop: "0.5px solid var(--border)",
        paddingTop: 11,
        marginTop: 1,
        fontSize: 11,
        color: "var(--text-subtle)",
        letterSpacing: "-0.1px"
      } }, a.stat)
    );
  };
  return /* @__PURE__ */ React.createElement("div", { className: "page" }, /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", null, "Agentes"), /* @__PURE__ */ React.createElement("div", { className: "sub" }, "Tu equipo de especialistas"))), /* @__PURE__ */ React.createElement(
    "div",
    {
      onClick: () => log("Abrir Nora"),
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
  } }, AGENTS.map((a) => /* @__PURE__ */ React.createElement(AgentCard, { key: a.name, a }))));
};
window.AgentesPage = AgentesPage;

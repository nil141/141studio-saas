const AGENTS_CONSOLE_URL = "https://platform.claude.com/workspaces/default/agents";
const IMG_SIZES = [
  { id: "square_1_1", label: "Cuadrado \xB7 1:1" },
  { id: "social_story_9_16", label: "Story \xB7 9:16" },
  { id: "widescreen_16_9", label: "Horizontal \xB7 16:9" },
  { id: "portrait_2_3", label: "Retrato \xB7 2:3" }
];
const IMG_COUNTS = [1, 2, 4, 6, 8, 12];
const ImageStudio = () => {
  const [instruction, setInstruction] = useState("");
  const [size, setSize] = useState("square_1_1");
  const [num, setNum] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const generate = async () => {
    if (!instruction.trim() || loading) return;
    setLoading(true);
    setError(null);
    setItems([]);
    try {
      const r = await fetch("/api/agents/studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction: instruction.trim(), size, num_variations: num })
      });
      const data = await r.json();
      if (!data.ok) throw new Error(data.error || "No se pudo generar");
      setItems(data.items || []);
    } catch (e) {
      setError(e.message || "Error de conexi\xF3n");
    }
    setLoading(false);
  };
  const download = (src, i) => {
    const a = document.createElement("a");
    a.href = src;
    a.download = `magnific-${Date.now()}-${i + 1}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
  const ok = items.filter((it) => it.image);
  return /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: 0, overflow: "hidden", marginBottom: 22 } }, /* @__PURE__ */ React.createElement("div", { style: {
    display: "flex",
    alignItems: "center",
    gap: 11,
    padding: "15px 18px",
    borderBottom: "0.5px solid var(--border)"
  } }, /* @__PURE__ */ React.createElement("div", { style: {
    width: 36,
    height: 36,
    borderRadius: 10,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--accent-soft)",
    border: "0.5px solid var(--border)",
    color: "var(--accent)"
  } }, /* @__PURE__ */ React.createElement(Icon, { name: "image", size: 18, strokeWidth: 1.7 })), /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontWeight: 500, color: "var(--text)", letterSpacing: "-0.4px" } }, "Agente de im\xE1genes"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-muted)", letterSpacing: "-0.2px" } }, "P\xEDdeselo en lenguaje natural \xB7 \xE9l escribe los prompts y los genera en Magnific"))), /* @__PURE__ */ React.createElement("div", { style: { padding: 18, display: "flex", flexDirection: "column", gap: 13 } }, /* @__PURE__ */ React.createElement(
    "textarea",
    {
      value: instruction,
      onChange: (e) => setInstruction(e.target.value),
      onKeyDown: (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") generate();
      },
      placeholder: "P\xEDdele lo que quieras\u2026 p. ej. \xAB20 variaciones premium de un plato de pasta para una carta de restaurante, estilo editorial gastron\xF3mico\xBB",
      rows: 3,
      style: {
        width: "100%",
        resize: "vertical",
        minHeight: 70,
        padding: "11px 13px",
        borderRadius: 11,
        fontSize: 13.5,
        lineHeight: 1.5,
        background: "var(--bg-elev)",
        border: "0.5px solid var(--border)",
        color: "var(--text)",
        fontFamily: "inherit",
        letterSpacing: "-0.2px",
        outline: "none"
      }
    }
  ), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement(
    "select",
    {
      value: size,
      onChange: (e) => setSize(e.target.value),
      style: {
        padding: "8px 11px",
        borderRadius: 10,
        fontSize: 12.5,
        background: "var(--bg-elev)",
        border: "0.5px solid var(--border)",
        color: "var(--text)",
        fontFamily: "inherit",
        letterSpacing: "-0.2px",
        outline: "none",
        cursor: "pointer"
      }
    },
    IMG_SIZES.map((s) => /* @__PURE__ */ React.createElement("option", { key: s.id, value: s.id }, s.label))
  ), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: num,
      onChange: (e) => setNum(Number(e.target.value)),
      style: {
        padding: "8px 11px",
        borderRadius: 10,
        fontSize: 12.5,
        background: "var(--bg-elev)",
        border: "0.5px solid var(--border)",
        color: "var(--text)",
        fontFamily: "inherit",
        letterSpacing: "-0.2px",
        outline: "none",
        cursor: "pointer"
      }
    },
    IMG_COUNTS.map((n) => /* @__PURE__ */ React.createElement("option", { key: n, value: n }, n, " ", n === 1 ? "variaci\xF3n" : "variaciones"))
  ), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn primary",
      disabled: loading || !instruction.trim(),
      onClick: generate,
      style: { opacity: loading || !instruction.trim() ? 0.6 : 1 }
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "sparkles", size: 14 }),
    loading ? "Trabajando\u2026" : "Generar"
  )), loading && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-muted)", letterSpacing: "-0.2px" } }, "El agente est\xE1 escribiendo los prompts y generando las im\xE1genes\u2026 esto puede tardar un poco."), error && /* @__PURE__ */ React.createElement("div", { style: {
    padding: "10px 13px",
    borderRadius: 10,
    fontSize: 12.5,
    lineHeight: 1.45,
    background: "var(--red-soft, rgba(220,60,60,.1))",
    color: "var(--red, #d33)",
    border: "0.5px solid var(--red, #d33)",
    letterSpacing: "-0.2px"
  } }, error), loading && /* @__PURE__ */ React.createElement("div", { style: {
    display: "grid",
    gridTemplateColumns: `repeat(${Math.min(num, 3)}, 1fr)`,
    gap: 12
  } }, Array.from({ length: num }).map((_, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: {
    aspectRatio: "1 / 1",
    borderRadius: 12,
    background: "var(--bg-elev-2)",
    border: "0.5px solid var(--border)",
    animation: "pulse 1.4s ease-in-out infinite"
  } }))), !loading && items.length > 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-subtle)", letterSpacing: "-0.2px" } }, ok.length, " de ", items.length, " ", items.length === 1 ? "imagen generada" : "im\xE1genes generadas"), /* @__PURE__ */ React.createElement("div", { style: {
    display: "grid",
    gridTemplateColumns: `repeat(auto-fill, minmax(220px, 1fr))`,
    gap: 12
  } }, items.map((it, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: {
    borderRadius: 12,
    overflow: "hidden",
    border: "0.5px solid var(--border)",
    background: "var(--bg-elev)",
    display: "flex",
    flexDirection: "column"
  } }, it.image ? /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: it.image,
      alt: `Variaci\xF3n ${i + 1}`,
      style: { display: "block", width: "100%", height: "auto" }
    }
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn sm",
      onClick: () => download(it.image, i),
      style: {
        position: "absolute",
        top: 8,
        right: 8,
        background: "rgba(0,0,0,.55)",
        color: "#fff",
        border: "0.5px solid rgba(255,255,255,.2)",
        backdropFilter: "blur(6px)"
      }
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "download", size: 13 })
  )) : /* @__PURE__ */ React.createElement("div", { style: {
    aspectRatio: "1 / 1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: 14,
    fontSize: 11.5,
    color: "var(--red, #d33)",
    background: "var(--bg-elev-2)"
  } }, it.error || "No se pudo generar"), /* @__PURE__ */ React.createElement("div", { title: it.prompt, style: {
    padding: "9px 11px",
    fontSize: 11,
    lineHeight: 1.4,
    color: "var(--text-muted)",
    letterSpacing: "-0.1px",
    borderTop: "0.5px solid var(--border)",
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden"
  } }, it.prompt)))))));
};
const AgentesPage = ({ navigate }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [agents, setAgents] = useState([]);
  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/agents/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}"
      });
      const data = await r.json();
      if (!data.ok) throw new Error(data.error || "No se pudo cargar");
      setAgents(data.agents || []);
    } catch (e) {
      setError(e.message || "Error de conexi\xF3n");
    }
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);
  const fmtDate = (iso) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return "";
    }
  };
  const AgentCard = ({ a }) => /* @__PURE__ */ React.createElement(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: "16px 17px",
        borderRadius: 14,
        background: "var(--bg-elev)",
        border: "0.5px solid var(--border)",
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
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 11, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: {
      width: 38,
      height: 38,
      borderRadius: 10,
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--accent-soft)",
      border: "0.5px solid var(--border)",
      color: "var(--accent)"
    } }, /* @__PURE__ */ React.createElement(Icon, { name: "sparkles", size: 18, strokeWidth: 1.7 })), /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0, flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: {
      fontSize: 14,
      fontWeight: 500,
      color: "var(--text)",
      letterSpacing: "-0.4px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    } }, a.name || "Agente"), a.model && /* @__PURE__ */ React.createElement("span", { style: {
      display: "inline-block",
      marginTop: 3,
      fontSize: 10,
      padding: "1px 7px",
      borderRadius: 99,
      background: "var(--bg-elev-2)",
      border: "0.5px solid var(--border)",
      color: "var(--text-muted)",
      fontFamily: "var(--font-mono)",
      letterSpacing: "-0.2px"
    } }, a.model))),
    /* @__PURE__ */ React.createElement("div", { style: {
      fontSize: 12.5,
      color: "var(--text-muted)",
      lineHeight: 1.45,
      letterSpacing: "-0.2px",
      minHeight: 18,
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      overflow: "hidden"
    } }, a.description || "Sin descripci\xF3n."),
    /* @__PURE__ */ React.createElement("div", { style: {
      borderTop: "0.5px solid var(--border)",
      paddingTop: 10,
      marginTop: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      fontSize: 11,
      color: "var(--text-subtle)",
      letterSpacing: "-0.1px"
    } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, a.id), a.created_at && /* @__PURE__ */ React.createElement("span", { style: { flexShrink: 0 } }, fmtDate(a.created_at)))
  );
  return /* @__PURE__ */ React.createElement("div", { className: "page" }, /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", null, "Agentes"), /* @__PURE__ */ React.createElement("div", { className: "sub" }, "Tu equipo de especialistas \xB7 creados en Claude Console")), /* @__PURE__ */ React.createElement("div", { className: "row tight" }, /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: load }, /* @__PURE__ */ React.createElement(Icon, { name: "refresh-cw", size: 14 }), " Actualizar"), /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: () => window.open(AGENTS_CONSOLE_URL, "_blank") }, /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 14 }), " Nuevo agente"))), /* @__PURE__ */ React.createElement(ImageStudio, null), loading ? /* @__PURE__ */ React.createElement("div", { style: { padding: "60px 0", textAlign: "center", color: "var(--text-subtle)", fontSize: 14 } }, "Cargando agentes\u2026") : error ? /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "28px 24px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { color: "var(--text)", fontSize: 14, marginBottom: 6 } }, "No se pudieron cargar los agentes"), /* @__PURE__ */ React.createElement("div", { style: { color: "var(--text-muted)", fontSize: 13, marginBottom: 16 } }, error), /* @__PURE__ */ React.createElement("button", { className: "btn sm", onClick: load }, /* @__PURE__ */ React.createElement(Icon, { name: "refresh-cw", size: 13 }), " Reintentar")) : agents.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "40px 24px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: {
    width: 54,
    height: 54,
    borderRadius: 14,
    margin: "0 auto 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--accent-soft)",
    color: "var(--accent)"
  } }, /* @__PURE__ */ React.createElement(Icon, { name: "sparkles", size: 24, strokeWidth: 1.6 })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, fontWeight: 500, color: "var(--text)", letterSpacing: "-0.5px", marginBottom: 6 } }, "A\xFAn no tienes agentes"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, color: "var(--text-muted)", letterSpacing: "-0.3px", marginBottom: 18, lineHeight: 1.5 } }, "Crea tus agentes especialistas en la consola de Claude y aparecer\xE1n aqu\xED autom\xE1ticamente."), /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: () => window.open(AGENTS_CONSOLE_URL, "_blank") }, /* @__PURE__ */ React.createElement(Icon, { name: "external-link", size: 14 }), " Crear en Claude Console")) : /* @__PURE__ */ React.createElement("div", { style: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 16
  } }, agents.map((a) => /* @__PURE__ */ React.createElement(AgentCard, { key: a.id, a }))));
};
window.AgentesPage = AgentesPage;

const PIECE_STATUS = {
  pendiente: { label: "Pendiente", dot: "var(--amber)" },
  aprobada: { label: "Aprobada", dot: "var(--green)" },
  rechazada: { label: "Rechazada", dot: "var(--red)" }
};
const AGENT_LABEL = { social_media: "Social Media" };
const reviewLog = (what) => console.log("[Revisi\xF3n]", what);
const PiecePill = ({ status }) => {
  const s = PIECE_STATUS[status] || PIECE_STATUS.pendiente;
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
const EntregableReview = ({ navigate, agentId, deliverableId }) => {
  const D = window.Data;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deliverable, setDeliverable] = useState(null);
  const [pieces, setPieces] = useState([]);
  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        let id = deliverableId;
        if (!id) {
          const list = await D.listDeliverables();
          if (list.length) id = list[0].id;
        }
        if (!id) {
          if (!cancel) {
            setError("No hay entregables todav\xEDa.");
            setLoading(false);
          }
          return;
        }
        const res = await D.getDeliverable(id);
        if (cancel) return;
        if (!res || !res.deliverable) {
          setError("No se ha encontrado el entregable.");
          setLoading(false);
          return;
        }
        setDeliverable(res.deliverable);
        setPieces(res.pieces || []);
        setLoading(false);
      } catch (e) {
        if (!cancel) {
          setError(e.message || "Error cargando");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancel = true;
    };
  }, [deliverableId]);
  const approved = pieces.filter((p) => p.status === "aprobada").length;
  const goBack = () => agentId ? navigate("agente", { agentId }) : navigate("agentes");
  const subtitle = (() => {
    if (!deliverable) return "";
    const who = AGENT_LABEL[deliverable.agent] || deliverable.agent || "\u2014";
    const when = deliverable.created_at ? new Date(deliverable.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short" }) : "";
    return `Generado por ${who}${when ? " \xB7 " + when : ""}`;
  })();
  return /* @__PURE__ */ React.createElement("div", { className: "page" }, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 16 } }, /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: goBack }, /* @__PURE__ */ React.createElement(Icon, { name: "chevron", size: 12, style: { transform: "rotate(180deg)" } }), " Volver")), /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("h1", null, deliverable ? deliverable.title : loading ? "Cargando\u2026" : "Entregable"), /* @__PURE__ */ React.createElement("div", { className: "sub" }, subtitle)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: "var(--text-muted)", letterSpacing: "-0.3px" } }, approved, " de ", pieces.length, " aprobadas"), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn primary",
      onClick: () => reviewLog("Aprobar todo y marcar listo"),
      style: { height: 38, padding: "0 16px" }
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 14 }),
    " Aprobar todo y marcar listo"
  ))), loading ? /* @__PURE__ */ React.createElement("div", { style: { padding: "48px 0", textAlign: "center", color: "var(--text-subtle)", fontSize: 14 } }, "Cargando\u2026") : error ? /* @__PURE__ */ React.createElement("div", { style: { padding: "48px 0", textAlign: "center", color: "var(--text-subtle)", fontSize: 14 } }, error) : pieces.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { padding: "48px 0", textAlign: "center", color: "var(--text-subtle)", fontSize: 14 } }, "Este entregable no tiene piezas.") : (
    /* Lista de piezas */
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 16 } }, pieces.map((p, i) => {
      const hashtags = Array.isArray(p.hashtags) ? p.hashtags.join(" ") : p.hashtags || "";
      return /* @__PURE__ */ React.createElement("div", { key: p.id || i, className: "card", style: { padding: 0, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "13px 18px",
        borderBottom: "0.5px solid var(--border)",
        flexWrap: "wrap"
      } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, minWidth: 0, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", { style: {
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        padding: "3px 9px",
        borderRadius: 99,
        background: "var(--accent-soft)",
        color: "var(--accent)"
      } }, p.formato), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13.5, fontWeight: 500, color: "var(--text)", letterSpacing: "-0.3px" } }, p.dia), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-subtle)" } }, "\xB7"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13.5, color: "var(--text-muted)", letterSpacing: "-0.3px" } }, p.tema)), /* @__PURE__ */ React.createElement(PiecePill, { status: p.status })), /* @__PURE__ */ React.createElement("div", { className: "review-body" }, /* @__PURE__ */ React.createElement("div", { style: {
        aspectRatio: "1 / 1",
        borderRadius: 12,
        border: "1px dashed var(--border-strong)",
        background: "var(--bg-elev-2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        textAlign: "center"
      } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, fontWeight: 600, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 7 } }, "Brief de imagen"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5, fontStyle: "italic", letterSpacing: "-0.2px" } }, p.brief_imagen))), /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14.5, color: "var(--text)", lineHeight: 1.55, letterSpacing: "-0.3px", whiteSpace: "pre-wrap" } }, p.caption), hashtags && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "var(--text-subtle)", marginTop: 12, lineHeight: 1.5, letterSpacing: "-0.2px" } }, hashtags))), /* @__PURE__ */ React.createElement("div", { style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        padding: "13px 18px",
        borderTop: "0.5px solid var(--border)",
        flexWrap: "wrap"
      } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { className: "btn", style: { color: "var(--green)" }, onClick: () => reviewLog("Aprobar \xB7 " + p.dia) }, /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 13 }), " Aprobar"), /* @__PURE__ */ React.createElement("button", { className: "btn", style: { color: "var(--red)" }, onClick: () => reviewLog("Rechazar \xB7 " + p.dia) }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 13 }), " Rechazar")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(
        "input",
        {
          placeholder: "Nota para regenerar\u2026",
          style: {
            height: 34,
            fontSize: 13,
            padding: "0 12px",
            borderRadius: 9,
            background: "rgba(255,255,255,0.04)",
            border: "0.5px solid var(--border-strong)",
            color: "var(--text)",
            outline: "none",
            width: 190,
            fontFamily: "inherit",
            letterSpacing: "-0.2px"
          },
          onKeyDown: (e) => {
            if (e.key === "Enter") reviewLog("Regenerar (con nota) \xB7 " + p.dia);
          }
        }
      ), /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: () => reviewLog("Regenerar \xB7 " + p.dia) }, /* @__PURE__ */ React.createElement(Icon, { name: "refresh-cw", size: 13 }), " Regenerar"))));
    }))
  ));
};
window.EntregableReview = EntregableReview;

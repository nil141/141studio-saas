const PIECE_STATUS = {
  pending: { label: "Pendiente", dot: "var(--amber)" },
  approved: { label: "Aprobada", dot: "var(--green)" },
  rejected: { label: "Rechazada", dot: "var(--red)" }
};
const reviewLog = (what) => console.log("[Revisi\xF3n mock]", what);
const PiecePill = ({ status }) => {
  const s = PIECE_STATUS[status] || PIECE_STATUS.pending;
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
const EntregableReview = ({ navigate, agentId }) => {
  const PIECES = [
    {
      format: "POST",
      day: "Dilluns",
      theme: "Producte de temporada",
      status: "approved",
      copy: "Comencem la setmana amb el millor del mercat. Producte de proximitat, tractat amb respecte.",
      hashtags: "#gustitradicio #productedetemporada #cuinacatalana",
      brief: "Close-up of seasonal vegetables on dark slate, natural side light, moody, editorial."
    },
    {
      format: "STORY",
      day: "Dimarts",
      theme: "Horaris",
      status: "pending",
      copy: "Avui obrim de 13 a 16 i de 20 a 23. Us esperem.",
      hashtags: "#igualada #restaurant",
      brief: "Minimal story layout, dark background, elegant serif type, lots of negative space."
    },
    {
      format: "CARRUSEL",
      day: "Dimecres",
      theme: "El plat de la setmana",
      status: "pending",
      copy: "Aquesta setmana, un homenatge a l'origen. Tres passes, un sol producte.",
      hashtags: "#cuinadautor #slowfood",
      brief: "Three-step plated dish sequence, top-down, warm light, fine dining, clean composition."
    },
    {
      format: "REEL",
      day: "Dijous",
      theme: "Darrere la cuina",
      status: "pending",
      copy: "El que no es veu tamb\xE9 compta. El ritme tranquil d'una cuina amb ofici.",
      hashtags: "#behindthescenes #cuina",
      brief: "Slow cinematic kitchen b-roll, hands plating, shallow depth of field, calm mood."
    },
    {
      format: "POST",
      day: "Divendres",
      theme: "Cap de setmana",
      status: "rejected",
      copy: "Reserva la teva taula per aquest cap de setmana.",
      hashtags: "#reserves",
      brief: "Cozy table setting at dusk, candle light, inviting, warm tones."
    }
  ];
  const approved = PIECES.filter((p) => p.status === "approved").length;
  const goBack = () => agentId ? navigate("agente", { agentId }) : navigate("agentes");
  return /* @__PURE__ */ React.createElement("div", { className: "page" }, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 16 } }, /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: goBack }, /* @__PURE__ */ React.createElement(Icon, { name: "chevron", size: 12, style: { transform: "rotate(180deg)" } }), " Volver")), /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("h1", null, "Contenido IG \xB7 semana 23-29 jun"), /* @__PURE__ */ React.createElement("div", { className: "sub" }, "Gust i Tradici\xF3 \xB7 generado por Social Media \xB7 hoy")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: "var(--text-muted)", letterSpacing: "-0.3px" } }, approved, " de ", PIECES.length, " aprobadas"), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn primary",
      onClick: () => reviewLog("Aprobar todo y marcar listo"),
      style: { height: 38, padding: "0 16px" }
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 14 }),
    " Aprobar todo y marcar listo"
  ))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 16 } }, PIECES.map((p, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "card", style: { padding: 0, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: {
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
  } }, p.format), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13.5, fontWeight: 500, color: "var(--text)", letterSpacing: "-0.3px" } }, p.day), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-subtle)" } }, "\xB7"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13.5, color: "var(--text-muted)", letterSpacing: "-0.3px" } }, p.theme)), /* @__PURE__ */ React.createElement(PiecePill, { status: p.status })), /* @__PURE__ */ React.createElement("div", { className: "review-body" }, /* @__PURE__ */ React.createElement("div", { style: {
    aspectRatio: "1 / 1",
    borderRadius: 12,
    border: "1px dashed var(--border-strong)",
    background: "var(--bg-elev-2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    textAlign: "center"
  } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, fontWeight: 600, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 7 } }, "Brief de imagen"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5, fontStyle: "italic", letterSpacing: "-0.2px" } }, p.brief))), /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14.5, color: "var(--text)", lineHeight: 1.55, letterSpacing: "-0.3px" } }, p.copy), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "var(--text-subtle)", marginTop: 12, lineHeight: 1.5, letterSpacing: "-0.2px" } }, p.hashtags))), /* @__PURE__ */ React.createElement("div", { style: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    padding: "13px 18px",
    borderTop: "0.5px solid var(--border)",
    flexWrap: "wrap"
  } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { className: "btn", style: { color: "var(--green)" }, onClick: () => reviewLog("Aprobar \xB7 " + p.day) }, /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 13 }), " Aprobar"), /* @__PURE__ */ React.createElement("button", { className: "btn", style: { color: "var(--red)" }, onClick: () => reviewLog("Rechazar \xB7 " + p.day) }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 13 }), " Rechazar")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(
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
        if (e.key === "Enter") reviewLog("Regenerar (con nota) \xB7 " + p.day);
      }
    }
  ), /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: () => reviewLog("Regenerar \xB7 " + p.day) }, /* @__PURE__ */ React.createElement(Icon, { name: "refresh-cw", size: 13 }), " Regenerar")))))));
};
window.EntregableReview = EntregableReview;

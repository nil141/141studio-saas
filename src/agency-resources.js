(() => {
  const { useState, useEffect } = React;
  const RES_TYPES = [
    { id: "herramienta", label: "Herramienta", color: "#9e9ae5", icon: "palette" },
    { id: "referencia", label: "Referencia", color: "#60a5fa", icon: "star" },
    { id: "estrategia", label: "Estrategia", color: "#34d399", icon: "layers" },
    { id: "inspiracion", label: "Inspiraci\xF3n", color: "#e879a6", icon: "sparkles" },
    { id: "otro", label: "Otro", color: "#f6a15b", icon: "link" }
  ];
  const _rtMeta = (id) => RES_TYPES.find((t) => t.id === id) || RES_TYPES[0];
  const _resUrl = (u) => {
    const s = (u || "").trim();
    if (!s) return null;
    return /^https?:\/\//.test(s) ? s : "https://" + s;
  };
  const _resDomain = (u) => {
    const full = _resUrl(u);
    if (!full) return "";
    try {
      return new URL(full).hostname.replace(/^www\./, "");
    } catch {
      return (u || "").replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
    }
  };
  const _favicon = (u) => {
    const d = _resDomain(u);
    return d ? `https://www.google.com/s2/favicons?domain=${d}&sz=64` : null;
  };
  const Favicon = ({ url, size = 22 }) => {
    const [err, setErr] = useState(false);
    const src = _favicon(url);
    const d = _resDomain(url);
    if (err || !src) {
      return /* @__PURE__ */ React.createElement("div", { style: {
        width: size,
        height: size,
        borderRadius: 6,
        background: "var(--bg-elev-2)",
        border: "0.5px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.5,
        fontWeight: 600,
        color: "var(--text-muted)",
        flexShrink: 0
      } }, (d || "?").charAt(0).toUpperCase());
    }
    return /* @__PURE__ */ React.createElement("img", { src, alt: "", onError: () => setErr(true), style: { width: size, height: size, borderRadius: 6, flexShrink: 0, objectFit: "cover" } });
  };
  const ResourceCard = ({ r, D, onEdit }) => {
    const [hover, setHover] = useState(false);
    const meta = _rtMeta(r.type);
    const url = _resUrl(r.url);
    const domain = _resDomain(r.url);
    const open = () => {
      if (url) window.open(url, "_blank", "noopener");
    };
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        onMouseEnter: () => setHover(true),
        onMouseLeave: () => setHover(false),
        onClick: open,
        style: {
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          padding: "16px 16px 14px",
          borderRadius: 16,
          cursor: url ? "pointer" : "default",
          background: "var(--bg-elev)",
          border: "0.5px solid " + (hover ? "var(--border-strong)" : "var(--border)"),
          boxShadow: hover ? "0 10px 30px rgba(0,0,0,0.35)" : "none",
          transform: hover ? "translateY(-2px)" : "none",
          transition: "all .15s"
        }
      },
      /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: 10, right: 10, display: "flex", gap: 4, opacity: hover ? 1 : 0, transition: "opacity .12s" } }, /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: (e) => {
            e.stopPropagation();
            onEdit(r);
          },
          title: "Editar",
          style: {
            width: 28,
            height: 28,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            background: "var(--bg-elev-2)",
            border: "0.5px solid var(--border)",
            color: "var(--text-muted)"
          }
        },
        /* @__PURE__ */ React.createElement(Icon, { name: "edit", size: 13 })
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: (e) => {
            e.stopPropagation();
            if (confirm("\xBFEliminar este recurso?")) D.deleteResource(r.id);
          },
          title: "Eliminar",
          style: {
            width: 28,
            height: 28,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            background: "var(--bg-elev-2)",
            border: "0.5px solid var(--border)",
            color: "var(--text-subtle)"
          }
        },
        /* @__PURE__ */ React.createElement(Icon, { name: "trash", size: 13 })
      )),
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 9, minWidth: 0, paddingRight: hover ? 62 : 0, transition: "padding .12s" } }, /* @__PURE__ */ React.createElement(Favicon, { url: r.url, size: 24 }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "var(--text-subtle)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, domain || "\u2014"), url && /* @__PURE__ */ React.createElement(Icon, { name: "external-link", size: 12, style: { color: "var(--text-subtle)", marginLeft: "auto", opacity: hover ? 1 : 0, transition: "opacity .12s", flexShrink: 0 } })),
      /* @__PURE__ */ React.createElement("div", { style: {
        fontSize: 15,
        fontWeight: 500,
        color: "var(--text)",
        letterSpacing: "-0.2px",
        lineHeight: 1.3,
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden"
      } }, r.title || domain || "Sin t\xEDtulo"),
      r.description && /* @__PURE__ */ React.createElement("div", { style: {
        fontSize: 12.5,
        color: "var(--text-muted)",
        lineHeight: 1.5,
        display: "-webkit-box",
        WebkitLineClamp: 3,
        WebkitBoxOrient: "vertical",
        overflow: "hidden"
      } }, r.description),
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginTop: "auto", paddingTop: 4, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: meta.color, background: meta.color + "1f", borderRadius: 6, padding: "2px 8px" } }, /* @__PURE__ */ React.createElement("span", { style: { width: 6, height: 6, borderRadius: "50%", background: meta.color } }), " ", meta.label), r.sector && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11.5, color: "var(--text-subtle)" } }, r.sector))
    );
  };
  const _rfst = {
    width: "100%",
    height: 40,
    background: "var(--bg-elev-2)",
    border: "0.5px solid var(--border)",
    borderRadius: 10,
    padding: "0 12px",
    color: "var(--text)",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none"
  };
  const ResourceModal = ({ initial, sectors, onClose }) => {
    const D = window.Data;
    const editing = initial && initial.id;
    const [f, setF] = useState(() => ({
      title: initial && initial.title || "",
      url: initial && initial.url || "",
      type: initial && initial.type || "herramienta",
      sector: initial && initial.sector || "",
      description: initial && initial.description || ""
    }));
    const upd = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
    useEffect(() => {
      const onKey = (e) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, []);
    const onUrlBlur = () => {
      if (!f.title.trim() && f.url.trim()) setF((p) => ({ ...p, title: _resDomain(p.url) }));
    };
    const save = () => {
      if (!f.url.trim() && !f.title.trim()) return;
      if (editing) D.updateResource(initial.id, { title: f.title.trim(), url: f.url.trim(), type: f.type, sector: f.sector.trim(), description: f.description.trim() });
      else D.addResource({ title: f.title.trim(), url: f.url.trim(), type: f.type, sector: f.sector.trim(), description: f.description.trim() });
      onClose();
    };
    return ReactDOM.createPortal(
      /* @__PURE__ */ React.createElement("div", { className: "modal-overlay", onClick: onClose }, /* @__PURE__ */ React.createElement("div", { className: "modal", style: { maxWidth: 540 }, onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("div", { className: "modal-head" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "modal-title", style: { fontSize: 21 } }, editing ? "Editar recurso" : "A\xF1adir recurso"), /* @__PURE__ */ React.createElement("div", { className: "modal-sub", style: { marginTop: 6 } }, "Guarda un enlace en tu biblioteca")), /* @__PURE__ */ React.createElement("button", { onClick: onClose, className: "btn ghost icon-only sm" }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 16 }))), /* @__PURE__ */ React.createElement("div", { className: "modal-body", style: { display: "flex", flexDirection: "column", gap: 14 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-muted)", marginBottom: 6 } }, "Enlace (URL)"), /* @__PURE__ */ React.createElement("input", { autoFocus: true, value: f.url, onChange: upd("url"), onBlur: onUrlBlur, placeholder: "https://\u2026", style: _rfst })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-muted)", marginBottom: 6 } }, "T\xEDtulo"), /* @__PURE__ */ React.createElement("input", { value: f.title, onChange: upd("title"), placeholder: "Nombre de la herramienta / p\xE1gina", style: _rfst })), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-muted)", marginBottom: 6 } }, "Categor\xEDa"), /* @__PURE__ */ React.createElement("select", { value: f.type, onChange: upd("type"), style: { ..._rfst, cursor: "pointer" } }, RES_TYPES.map((t) => /* @__PURE__ */ React.createElement("option", { key: t.id, value: t.id }, t.label)))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-muted)", marginBottom: 6 } }, "Sector ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-subtle)" } }, "(opcional)")), /* @__PURE__ */ React.createElement("input", { value: f.sector, onChange: upd("sector"), placeholder: "Ej. Moda, Hogar, SaaS", list: "res-sectors", style: _rfst }), /* @__PURE__ */ React.createElement("datalist", { id: "res-sectors" }, (sectors || []).map((s) => /* @__PURE__ */ React.createElement("option", { key: s, value: s }))))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-muted)", marginBottom: 6 } }, "Notas ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-subtle)" } }, "(qu\xE9 es, para qu\xE9 sirve\u2026)")), /* @__PURE__ */ React.createElement(
        "textarea",
        {
          value: f.description,
          onChange: upd("description"),
          rows: 3,
          placeholder: "Descripci\xF3n o por qu\xE9 te sirve",
          style: { ..._rfst, height: "auto", padding: "10px 12px", resize: "vertical", lineHeight: 1.5 }
        }
      ))), /* @__PURE__ */ React.createElement("div", { className: "modal-foot" }, /* @__PURE__ */ React.createElement("button", { onClick: onClose, className: "btn ghost" }, "Cancelar"), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: save,
          disabled: !f.url.trim() && !f.title.trim(),
          className: "btn primary",
          style: { opacity: f.url.trim() || f.title.trim() ? 1 : 0.5, pointerEvents: f.url.trim() || f.title.trim() ? "auto" : "none" }
        },
        editing ? "Guardar" : "A\xF1adir recurso"
      )))),
      document.body
    );
  };
  const AgencyResources = ({ navigate }) => {
    const D = window.Data;
    D.useStore();
    const all = D.RESOURCES || [];
    const [q, setQ] = useState("");
    const [type, setType] = useState("all");
    const [sectorF, setSectorF] = useState("all");
    const [modal, setModal] = useState(null);
    const counts = {};
    RES_TYPES.forEach((t) => counts[t.id] = 0);
    all.forEach((r) => {
      counts[r.type] = (counts[r.type] || 0) + 1;
    });
    const sectors = [...new Set(all.map((r) => (r.sector || "").trim()).filter(Boolean))].sort();
    const ql = q.trim().toLowerCase();
    const rows = all.filter(
      (r) => (type === "all" || r.type === type) && (sectorF === "all" || (r.sector || "").trim() === sectorF) && (!ql || (r.title || "").toLowerCase().includes(ql) || (r.description || "").toLowerCase().includes(ql) || (r.url || "").toLowerCase().includes(ql) || (r.sector || "").toLowerCase().includes(ql))
    );
    const tabItems = [{ id: "all", label: "Todos", count: all.length }, ...RES_TYPES.map((t) => ({ id: t.id, label: t.label, count: counts[t.id] || 0 }))];
    const tabsRef = React.useRef(null);
    const [indic, setIndic] = useState({ left: 0, width: 0 });
    const [, startTransition] = React.useTransition();
    const pickTab = (id, el) => {
      if (el) setIndic({ left: el.offsetLeft, width: el.offsetWidth });
      startTransition(() => setType(id));
    };
    React.useLayoutEffect(() => {
      const cont = tabsRef.current;
      if (!cont) return;
      const el = cont.querySelector(".tab.active");
      if (el) setIndic({ left: el.offsetLeft, width: el.offsetWidth });
    }, [type, all.length, JSON.stringify(counts)]);
    const inputStyle = { background: "transparent", border: "none", outline: "none", color: "var(--text)", fontSize: 13, fontFamily: "inherit", width: 150 };
    return /* @__PURE__ */ React.createElement("div", { className: "page" }, /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("div", { className: "hide-mobile" }, /* @__PURE__ */ React.createElement("h1", null, "Recursos"), /* @__PURE__ */ React.createElement("div", { className: "sub" }, "Tu biblioteca de herramientas, referencias y estrategias")), /* @__PURE__ */ React.createElement("div", { className: "outreach-actions", style: { display: "flex", alignItems: "center", gap: 8 } }, sectors.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { position: "relative", display: "inline-flex", alignItems: "center" } }, /* @__PURE__ */ React.createElement(
      "select",
      {
        value: sectorF,
        onChange: (e) => setSectorF(e.target.value),
        title: "Filtrar por sector",
        style: {
          height: 34,
          padding: "0 30px 0 12px",
          borderRadius: 9,
          background: sectorF === "all" ? "var(--bg-elev-2)" : "var(--accent-soft)",
          color: sectorF === "all" ? "var(--text-muted)" : "var(--accent)",
          border: "0.5px solid " + (sectorF === "all" ? "var(--border)" : "rgba(158,154,229,0.35)"),
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: 13,
          fontWeight: 500,
          appearance: "none",
          WebkitAppearance: "none",
          outline: "none"
        }
      },
      /* @__PURE__ */ React.createElement("option", { value: "all" }, "Todos los sectores"),
      sectors.map((s) => /* @__PURE__ */ React.createElement("option", { key: s, value: s }, s))
    ), /* @__PURE__ */ React.createElement(Icon, { name: "chevron", size: 12, style: { position: "absolute", right: 10, pointerEvents: "none", color: "var(--text-subtle)" } })), /* @__PURE__ */ React.createElement("div", { className: "outreach-search", style: { display: "flex", alignItems: "center", gap: 8, height: 34, padding: "0 12px", borderRadius: 9, background: "var(--bg-elev-2)", border: "0.5px solid var(--border)" } }, /* @__PURE__ */ React.createElement(Icon, { name: "search", size: 14, style: { color: "var(--text-subtle)" } }), /* @__PURE__ */ React.createElement("input", { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Buscar\u2026", style: inputStyle })), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setModal({}),
        onMouseEnter: (e) => e.currentTarget.style.background = "rgba(158,154,229,0.28)",
        onMouseLeave: (e) => e.currentTarget.style.background = "var(--accent-soft)",
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          height: 34,
          padding: "0 14px",
          borderRadius: 9,
          background: "var(--accent-soft)",
          color: "var(--accent)",
          border: "1px solid rgba(158,154,229,0.3)",
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: 13,
          fontWeight: 500,
          whiteSpace: "nowrap",
          transition: "background .15s"
        }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 14 }),
      " A\xF1adir recurso"
    ))), /* @__PURE__ */ React.createElement("div", { className: "tabs tabs-slide", ref: tabsRef }, tabItems.map((t) => /* @__PURE__ */ React.createElement("div", { key: t.id, className: "tab" + (type === t.id ? " active" : ""), onClick: (e) => pickTab(t.id, e.currentTarget) }, t.label, t.count != null ? /* @__PURE__ */ React.createElement("span", { className: "count" }, t.count) : null)), /* @__PURE__ */ React.createElement("span", { className: "tab-underline", style: { width: indic.width, transform: `translateX(${indic.left}px)` } })), rows.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { padding: "48px 0" } }, /* @__PURE__ */ React.createElement(
      Empty,
      {
        icon: "sparkles",
        title: all.length === 0 ? "Tu biblioteca est\xE1 vac\xEDa" : "Sin resultados",
        sub: all.length === 0 ? "Guarda tu primer enlace con \xABA\xF1adir recurso\xBB." : "Prueba con otra b\xFAsqueda o categor\xEDa."
      }
    )) : /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 14, marginTop: 6, alignItems: "stretch" } }, rows.map((r) => /* @__PURE__ */ React.createElement(ResourceCard, { key: r.id, r, D, onEdit: setModal }))), modal && /* @__PURE__ */ React.createElement(ResourceModal, { initial: modal, sectors, onClose: () => setModal(null) }));
  };
  window.AgencyResources = AgencyResources;
})();

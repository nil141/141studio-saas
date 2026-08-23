const _SECTION_CTA = {
  "client-docs": "Ir a Documentaci\xF3n",
  "client-credentials": "Ir a Credenciales",
  "client-status": "Ver estado del proyecto",
  "client-dashboard": "Ir al inicio"
};
const _sectionCta = (route) => _SECTION_CTA[route] || "Abrir";
const ClientLogin = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return /* @__PURE__ */ React.createElement("div", { style: { minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr", background: "var(--bg)" } }, /* @__PURE__ */ React.createElement("div", { style: { padding: 60, display: "flex", flexDirection: "column" } }, /* @__PURE__ */ React.createElement("div", { className: "row tight", style: { marginBottom: "auto" } }, /* @__PURE__ */ React.createElement("div", { className: "brand-mark" }, "141"), /* @__PURE__ */ React.createElement("div", { className: "brand-name" }, "141", /* @__PURE__ */ React.createElement("span", { className: "tick" }, "'"), "STUDIO")), /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 360 } }, /* @__PURE__ */ React.createElement("h1", { style: { fontSize: 32, fontWeight: 500, lineHeight: 1.15, marginBottom: 8 } }, "Bienvenido al portal de tu proyecto."), /* @__PURE__ */ React.createElement("div", { className: "muted", style: { fontSize: 14, marginBottom: 32 } }, "Aqu\xED puedes ver el avance por fases, aprobar entregables y descargar tus facturas."), !sent ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Tu email"), /* @__PURE__ */ React.createElement("input", { className: "input", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "tu@empresa.com", style: { height: 40, marginBottom: 12 } }), /* @__PURE__ */ React.createElement("button", { className: "btn primary full", style: { height: 40 }, onClick: () => {
    setSent(true);
    setTimeout(onLogin, 900);
  } }, "Enviar enlace m\xE1gico"), /* @__PURE__ */ React.createElement("div", { className: "subtle xsmall", style: { marginTop: 16, lineHeight: 1.5 } }, "Te enviaremos un enlace seguro a tu email. Sin contrase\xF1as.")) : /* @__PURE__ */ React.createElement("div", { style: { padding: 20, border: "0.5px solid var(--border)", borderRadius: 12, background: "var(--bg-elev)" } }, /* @__PURE__ */ React.createElement("div", { className: "row tight", style: { marginBottom: 8 } }, /* @__PURE__ */ React.createElement(Icon, { name: "mail", size: 14 }), /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 500 } }, "Revisa tu correo")), /* @__PURE__ */ React.createElement("div", { className: "muted small" }, "Te hemos enviado un enlace a ", /* @__PURE__ */ React.createElement("b", null, email), ". Entrando\u2026"))), /* @__PURE__ */ React.createElement("div", { className: "subtle xsmall", style: { marginTop: "auto" } }, "\xA9 141'STUDIO \xB7 soporte@141.studio")), /* @__PURE__ */ React.createElement("div", { style: { background: "linear-gradient(160deg,#0f172a 0%,#020617 60%,#312e81 100%)", position: "relative", overflow: "hidden" } }));
};
const WhatsAppFloat = () => null;
const _previewClientId = (session) => {
  try {
    return session?.role === "admin" ? sessionStorage.getItem("141_preview_client") || null : null;
  } catch {
    return null;
  }
};
const _portalScope = (session) => {
  const D = window.Data;
  const pcid = _previewClientId(session);
  const projects = pcid ? (D.PROJECTS || []).filter((p) => p.clientId === pcid) : D.PROJECTS || [];
  const pids = new Set(projects.map((p) => p.id));
  const find = (id) => (D.CLIENTS || []).find((c) => c.id === id);
  return {
    pcid,
    projects,
    invoices: pcid ? (D.INVOICES || []).filter((i) => i.clientId === pcid) : D.INVOICES || [],
    credentials: pcid ? (D.CREDENTIALS || []).filter((c) => c.clientId === pcid) : D.CREDENTIALS || [],
    clientTasks: pcid ? (D.CLIENT_TASKS || []).filter((t) => t.clientId === pcid) : D.CLIENT_TASKS || [],
    deliverables: pcid ? (D.DELIVERABLES || []).filter((d) => pids.has(d.projectId)) : D.DELIVERABLES || [],
    me: pcid ? find(pcid) : (D.CLIENTS || [])[0],
    name: pcid ? find(pcid)?.name || "" : session?.name || "",
    clientId: pcid || session?.clientId,
    preview: !!pcid
  };
};
const _phaseStatus = (done, total) => total === 0 ? { label: "Sin tareas", cls: "" } : done === total ? { label: "Completada", cls: "green" } : done > 0 ? { label: "En curso", cls: "blue" } : { label: "Sin empezar", cls: "" };
const _planOf = (p) => {
  const D = window.Data;
  const names = (p.service || "").split(",").map((s) => s.trim()).filter((n) => n && n !== "libre" && n !== "\u2014");
  const tasks = D.TASKS[p.id] || [];
  const doneSet = new Set(p.phasesDone || []);
  const descMap = p.phasesDesc || {};
  const mk = (name, gt) => {
    const done2 = gt.filter((t) => t.column === "done").length;
    const complete = doneSet.has(name) || gt.length > 0 && done2 === gt.length;
    return {
      name,
      tasks: gt,
      done: done2,
      total: gt.length,
      complete,
      desc: descMap[name] || "",
      pct: gt.length ? Math.round(done2 / gt.length * 100) : complete ? 100 : 0
    };
  };
  const groups = names.map((name) => mk(name, tasks.filter((t) => (t.phase || null) === name)));
  const otras = tasks.filter((t) => !names.includes(t.phase || null));
  if (otras.length) groups.push(mk("Otras tareas", otras));
  const totalPhases = groups.length;
  const donePhases = groups.filter((g) => g.complete).length;
  const pct = totalPhases ? Math.round(donePhases / totalPhases * 100) : p.progress || 0;
  const activeIdx = (() => {
    const i = groups.findIndex((g) => !g.complete);
    return i === -1 ? groups.length - 1 : i;
  })();
  const active = groups[activeIdx] || null;
  const total = tasks.length;
  const done = tasks.filter((t) => t.column === "done").length;
  return { names, groups, total, done, pct, active, activeIdx, donePhases, totalPhases };
};
const HERO_BG = "";
const RingStat = ({ pct = 0, label }) => {
  const size = 58, sw = 4, r = (size - sw) / 2, c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, Math.round(pct)));
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { position: "relative", width: size, height: size, flexShrink: 0 } }, /* @__PURE__ */ React.createElement("svg", { width: size, height: size, style: { transform: "rotate(-90deg)" } }, /* @__PURE__ */ React.createElement("circle", { cx: size / 2, cy: size / 2, r, fill: "none", stroke: "rgba(255,255,255,0.18)", strokeWidth: sw }), /* @__PURE__ */ React.createElement(
    "circle",
    {
      cx: size / 2,
      cy: size / 2,
      r,
      fill: "none",
      stroke: "#fff",
      strokeWidth: sw,
      strokeLinecap: "round",
      strokeDasharray: c,
      strokeDashoffset: c * (1 - v / 100),
      style: { transition: "stroke-dashoffset .6s ease" }
    }
  )), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 13, fontWeight: 600, color: "#fff" } }, v, "%")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, color: "rgba(255,255,255,0.82)", lineHeight: 1.3, maxWidth: 130 } }, label));
};
const ClientDashboard = ({ navigate, session }) => {
  const D = window.Data;
  D.useStore && D.useStore();
  const S = _portalScope(session);
  const projects = S.projects;
  const [selId, setSelId] = useState(null);
  const primary = projects.find((p) => p.id === selId) || projects[0] || null;
  const name = S.name;
  const pending = S.deliverables.filter((d) => d.status && d.status !== "approved");
  const plan = primary ? _planOf(primary) : { groups: [], pct: 0, done: 0, total: 0, active: null };
  const clientTasks = S.clientTasks;
  const myDone = clientTasks.filter((t) => t.done).length;
  const myPct = clientTasks.length ? Math.round(myDone / clientTasks.length * 100) : 0;
  const heroFade = "linear-gradient(to bottom, rgba(0,0,0,0) 55%, var(--bg) 100%), linear-gradient(to right, var(--bg) 0%, rgba(0,0,0,0) 9%)";
  const heroBg = HERO_BG ? `${heroFade}, linear-gradient(90deg, rgba(8,8,10,0.94) 0%, rgba(8,8,10,0.75) 40%, rgba(8,8,10,0.3) 100%), url(${HERO_BG}) center/cover` : `${heroFade}, radial-gradient(130% 120% at 82% 0%, rgba(158,154,229,0.34) 0%, rgba(158,154,229,0) 55%), linear-gradient(120deg, #131019 0%, #0b0b0d 58%, #15121c 100%)`;
  const hero = /* @__PURE__ */ React.createElement("div", { className: "portal-hero", style: {
    position: "relative",
    overflow: "hidden",
    background: heroBg,
    minHeight: 420,
    padding: "clamp(32px, 5vw, 56px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end"
  } }, /* @__PURE__ */ React.createElement("div", { style: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    alignSelf: "flex-start",
    padding: "5px 12px",
    borderRadius: 99,
    background: "rgba(255,255,255,0.1)",
    border: "0.5px solid rgba(255,255,255,0.18)",
    color: "rgba(255,255,255,0.9)",
    fontSize: 11,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: 18
  } }, /* @__PURE__ */ React.createElement("span", { style: { width: 6, height: 6, borderRadius: 99, background: "var(--green)" } }), "Portal", primary ? " \xB7 " + primary.name : ""), /* @__PURE__ */ React.createElement("h1", { style: {
    fontFamily: "var(--font-display)",
    fontWeight: 300,
    fontSize: "clamp(38px, 6vw, 58px)",
    lineHeight: 1.02,
    letterSpacing: "-1.5px",
    color: "#fff",
    margin: 0
  } }, "Hola, ", name || "bienvenido"), /* @__PURE__ */ React.createElement("p", { style: { color: "rgba(255,255,255,0.72)", fontSize: 14.5, lineHeight: 1.6, maxWidth: 560, marginTop: 14 } }, "Esta es tu \xE1rea de cliente. Desde aqu\xED sigues el estado del proyecto, subes documentaci\xF3n, das acceso a tus herramientas y ves todo lo importante en un solo sitio."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 40, marginTop: 28, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(RingStat, { pct: plan.pct, label: "Progreso del proyecto" }), /* @__PURE__ */ React.createElement(RingStat, { pct: myPct, label: "Tus tareas completadas" })));
  if (!projects.length) return /* @__PURE__ */ React.createElement("div", { className: "page" }, hero, /* @__PURE__ */ React.createElement("div", { style: { marginTop: 24 } }, /* @__PURE__ */ React.createElement(Empty, { icon: "folder", title: "Sin proyecto activo", sub: "Cuando tu agencia cree tu proyecto, aqu\xED ver\xE1s su avance por fases." })), /* @__PURE__ */ React.createElement(WhatsAppFloat, null));
  return /* @__PURE__ */ React.createElement("div", { className: "page" }, hero, projects.length > 1 && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap" } }, projects.map((pr) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: pr.id,
      className: "btn sm" + (pr.id === primary.id ? " primary" : " ghost"),
      onClick: () => setSelId(pr.id)
    },
    pr.name
  ))), pending.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "card", style: { marginTop: 22, borderColor: "var(--amber)", background: "var(--amber-soft)" } }, /* @__PURE__ */ React.createElement("div", { className: "card-body", style: { padding: 16, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { style: { width: 36, height: 36, borderRadius: 10, background: "var(--amber-soft)", display: "grid", placeItems: "center", color: "var(--amber)", border: "0.5px solid var(--amber)" } }, /* @__PURE__ */ React.createElement(Icon, { name: "package", size: 16 })), /* @__PURE__ */ React.createElement("div", { className: "grow" }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 500 } }, "Tienes ", pending.length, " entregable", pending.length === 1 ? "" : "s", " pendiente", pending.length === 1 ? "" : "s", " de aprobar"), /* @__PURE__ */ React.createElement("div", { className: "small muted", style: { marginTop: 2 } }, pending.map((d) => d.title).slice(0, 3).join(" \xB7 "))), /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: () => navigate("client-status", { projectId: pending[0].projectId }) }, "Revisar ahora"))), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 30, marginBottom: 14, fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, letterSpacing: "-0.5px" } }, "El estado del proyecto"), plan.groups.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { icon: "list-todo", title: "Plan en preparaci\xF3n", sub: "Tu agencia est\xE1 organizando el proyecto en fases." }) : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 12, overflowX: "auto", paddingBottom: 6 } }, plan.groups.map((g, i) => {
    const isDone = g.complete;
    const isActive = i === plan.activeIdx && !isDone;
    const chip = {
      fontSize: 10,
      padding: "2px 8px",
      borderRadius: 99,
      whiteSpace: "nowrap",
      flexShrink: 0,
      background: "var(--bg-hover)",
      border: "0.5px solid var(--border)",
      color: "var(--text-muted)",
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      letterSpacing: "0.02em"
    };
    const desc = g.desc || (g.total ? `${g.done} de ${g.total} tareas` : "");
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: i,
        onClick: () => navigate("client-status", { projectId: primary.id }),
        style: {
          cursor: "pointer",
          flex: "0 0 auto",
          width: 214,
          minHeight: 104,
          borderRadius: 16,
          padding: "15px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 7,
          border: "0.5px solid var(--border)",
          background: isActive ? "var(--surface)" : "var(--bg-elev-2)",
          opacity: isDone ? 0.6 : 1
        }
      },
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 400, letterSpacing: "-0.6px", lineHeight: 1.1 } }, g.name), isDone && /* @__PURE__ */ React.createElement("span", { style: chip }, /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 9 }), " Completada"), isActive && /* @__PURE__ */ React.createElement("span", { style: chip }, /* @__PURE__ */ React.createElement("span", { style: { width: 5, height: 5, borderRadius: 99, background: "var(--text-muted)" } }), " En curso")),
      desc && /* @__PURE__ */ React.createElement("div", { style: {
        fontSize: 12.5,
        color: "var(--text-muted)",
        lineHeight: 1.45,
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden"
      } }, desc)
    );
  })), clientTasks.length > 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { marginTop: 34, marginBottom: 14, fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, letterSpacing: "-0.5px" } }, "Qu\xE9 te toca ahora"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 14 } }, clientTasks.map((t, i) => /* @__PURE__ */ React.createElement("div", { key: t.id, className: "card", style: { opacity: t.done ? 0.7 : 1 } }, /* @__PURE__ */ React.createElement("div", { className: "card-body", style: { padding: 20, display: "flex", gap: 18 } }, /* @__PURE__ */ React.createElement("div", { style: {
    fontFamily: "var(--font-display)",
    fontSize: 30,
    fontWeight: 300,
    lineHeight: 1,
    color: "var(--text-subtle)",
    flexShrink: 0,
    minWidth: 24
  } }, i + 1), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 500, fontSize: 14.5, lineHeight: 1.3 } }, t.title), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: t.done ? "btn sm" : "btn ghost sm",
      style: { flexShrink: 0, whiteSpace: "nowrap" },
      onClick: () => D.toggleClientTask(t.id)
    },
    t.done ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 12 }), " Realizado") : "Marcar como realizado"
  )), t.description && /* @__PURE__ */ React.createElement("div", { className: "muted small", style: { marginTop: 5, lineHeight: 1.5 } }, t.description), t.link && !t.done && /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", style: { marginTop: 12 }, onClick: () => navigate(t.link) }, _sectionCta(t.link), " ", /* @__PURE__ */ React.createElement(Icon, { name: "arrow", size: 12 })))))))), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 34, marginBottom: 14, fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, letterSpacing: "-0.5px" } }, "M\xF3dulos de tu portal"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 } }, [
    { id: "client-status", badge: "PROYECTO", title: "Estado del proyecto", desc: "Fases, avance y entregables.", status: plan.pct > 0 ? "En curso" : "Por empezar", pct: plan.pct, showPct: true },
    { id: "client-docs", badge: "DOCUMENTOS", title: "Documentaci\xF3n", desc: "Archivos y facturas del proyecto." },
    { id: "client-credentials", badge: "ACCESOS", title: "Credenciales", desc: "Accesos que compartes con el equipo." }
  ].map((m) => /* @__PURE__ */ React.createElement("div", { key: m.id, className: "card", style: { cursor: "pointer", overflow: "hidden" }, onClick: () => navigate(m.id) }, /* @__PURE__ */ React.createElement("div", { style: {
    height: 118,
    position: "relative",
    padding: 16,
    background: "radial-gradient(120% 130% at 85% 0%, rgba(150,105,70,0.22) 0%, rgba(20,16,14,0) 55%), linear-gradient(135deg, #17141140 0%, var(--bg-elev-2) 70%)",
    borderBottom: "0.5px solid var(--border)"
  } }, /* @__PURE__ */ React.createElement("span", { style: {
    fontSize: 10,
    letterSpacing: "0.08em",
    padding: "4px 10px",
    borderRadius: 99,
    background: "var(--bg-hover)",
    border: "0.5px solid var(--border)",
    color: "var(--text-muted)"
  } }, m.badge)), /* @__PURE__ */ React.createElement("div", { style: { padding: 18 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 400, letterSpacing: "-0.5px" } }, m.title), /* @__PURE__ */ React.createElement("div", { className: "muted small", style: { marginTop: 4 } }, m.desc), m.showPct && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, marginBottom: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10.5, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-subtle)" } }, m.status), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "var(--text-muted)" } }, m.pct, "%")), /* @__PURE__ */ React.createElement("div", { style: { height: 3, borderRadius: 99, background: "var(--border)", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { width: m.pct + "%", height: "100%", background: "var(--text-muted)", borderRadius: 99 } }))), /* @__PURE__ */ React.createElement("div", { style: { marginTop: m.showPct ? 14 : 18, fontSize: 13, color: "var(--text)" } }, "Entrar en el m\xF3dulo ", /* @__PURE__ */ React.createElement(Icon, { name: "arrow", size: 12 })))))), /* @__PURE__ */ React.createElement(WhatsAppFloat, null));
};
const ClientStatus = ({ navigate, openModal, projectId, initialTab, session }) => {
  const D = window.Data;
  D.useStore && D.useStore();
  const S = _portalScope(session);
  const projects = S.projects;
  const p = projectId && projects.find((x) => x.id === projectId) || projects[0];
  const [tab, setTab] = useState(initialTab || "plan");
  if (!p) return /* @__PURE__ */ React.createElement("div", { className: "page" }, /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", null, "Estado del proyecto"), /* @__PURE__ */ React.createElement("div", { className: "sub" }, "El avance de tu proyecto aparecer\xE1 aqu\xED."))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "40vh" } }, /* @__PURE__ */ React.createElement(Empty, { icon: "folder", title: "Sin proyecto", sub: "Cuando tu agencia cree un proyecto podr\xE1s seguir su avance aqu\xED." })), /* @__PURE__ */ React.createElement(WhatsAppFloat, null));
  const plan = _planOf(p);
  const deliverables = S.deliverables.filter((d) => d.projectId === p.id);
  const events = [];
  plan.groups.forEach((g) => {
    if (g.complete) events.push({ type: "Fase", title: `Fase completada: ${g.name}` });
  });
  plan.groups.forEach((g) => g.tasks.forEach((t) => {
    if (t.column === "done") events.push({ type: "Hito", title: `Hito completado: ${t.title}` });
  }));
  events.push({ type: "Portal", title: "Portal del cliente activado" });
  const secLabel = { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-subtle)", marginBottom: 10 };
  return /* @__PURE__ */ React.createElement("div", { className: "page" }, projects.length > 1 && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" } }, projects.map((pr) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: pr.id,
      className: "btn sm" + (pr.id === p.id ? " primary" : " ghost"),
      onClick: () => navigate("client-status", { projectId: pr.id })
    },
    pr.name
  ))), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 24 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.09em", color: "var(--text-subtle)", marginBottom: 8 } }, "Proyecto", p.name ? " \xB7 " + p.name : ""), /* @__PURE__ */ React.createElement("h1", { style: { fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(26px,3.5vw,34px)", letterSpacing: "-1px" } }, "Estado del proyecto"), /* @__PURE__ */ React.createElement("div", { className: "sub", style: { marginTop: 8, maxWidth: 640, color: "var(--text-muted)" } }, "Aqu\xED ves las fases del proyecto en detalle: qu\xE9 ocurre en cada una, en cu\xE1l est\xE1s ahora y los hitos que ha definido tu equipo.")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { style: { flex: "1 1 460px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 } }, plan.groups.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { icon: "list-todo", title: "Plan en preparaci\xF3n", sub: "Tu agencia est\xE1 organizando el proyecto en fases. Vuelve pronto." }) : plan.groups.map((g, i) => {
    const isComplete = g.complete;
    const isActive = i === plan.activeIdx && !isComplete;
    const nChip = {
      padding: "3px 9px",
      borderRadius: 99,
      fontSize: 10,
      letterSpacing: "0.05em",
      textTransform: "uppercase",
      whiteSpace: "nowrap",
      flexShrink: 0,
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      border: "0.5px solid var(--border)",
      background: "var(--bg-hover)",
      color: "var(--text-muted)"
    };
    const aChip = { ...nChip, border: "0.5px solid var(--amber)", background: "var(--amber-soft)", color: "var(--amber)" };
    return /* @__PURE__ */ React.createElement("div", { key: i, style: {
      borderRadius: 16,
      padding: "20px 22px",
      border: isActive ? "1px solid var(--amber)" : "0.5px solid var(--border)",
      background: isActive ? "var(--amber-soft)" : "var(--bg-elev-2)",
      opacity: isComplete ? 0.85 : 1
    } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 14, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: {
      width: 30,
      height: 30,
      borderRadius: 99,
      flexShrink: 0,
      display: "grid",
      placeItems: "center",
      fontSize: 13,
      fontWeight: 600,
      border: "1.5px solid " + (isComplete ? "var(--green)" : isActive ? "var(--amber)" : "var(--border-strong)"),
      color: isComplete ? "var(--green)" : isActive ? "var(--amber)" : "var(--text-muted)",
      background: isActive ? "var(--amber-soft)" : "transparent"
    } }, isComplete ? /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 14 }) : i + 1), /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 500, letterSpacing: "-0.4px" } }, g.name), g.desc && /* @__PURE__ */ React.createElement("div", { className: "muted small", style: { marginTop: 5, lineHeight: 1.5, maxWidth: 560 } }, g.desc))), /* @__PURE__ */ React.createElement("span", { style: isActive ? aChip : nChip }, isActive && /* @__PURE__ */ React.createElement("span", { style: { width: 5, height: 5, borderRadius: 99, background: "var(--amber)" } }), isComplete ? "Completada" : isActive ? "En curso" : "Pendiente")), g.tasks.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 18 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-subtle)", marginBottom: 4 } }, "Hitos de esta fase"), g.tasks.map((t, ti) => {
      const done = t.column === "done";
      return /* @__PURE__ */ React.createElement("div", { key: ti, style: { display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 0", borderTop: "0.5px solid var(--border)" } }, /* @__PURE__ */ React.createElement("div", { style: {
        width: 16,
        height: 16,
        borderRadius: 99,
        marginTop: 1,
        flexShrink: 0,
        display: "grid",
        placeItems: "center",
        background: done ? "var(--green)" : "transparent",
        border: done ? "none" : "1.5px solid var(--border-strong)"
      } }, done && /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 10, style: { color: "#000" } })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, color: done ? "var(--text-muted)" : "var(--text)" } }, t.title), t.notes && /* @__PURE__ */ React.createElement("div", { className: "muted xsmall", style: { marginTop: 2, lineHeight: 1.45 } }, t.notes)), /* @__PURE__ */ React.createElement("span", { style: { ...nChip, alignSelf: "center" } }, done ? "Hecho" : "Pendiente"));
    })));
  }), deliverables.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 10 } }, /* @__PURE__ */ React.createElement("div", { style: secLabel }, "Entregables"), /* @__PURE__ */ React.createElement("div", { className: "rg-deliverables" }, deliverables.map((d) => /* @__PURE__ */ React.createElement("div", { key: d.id, className: "card" }, /* @__PURE__ */ React.createElement("div", { style: { aspectRatio: "16/10", background: d.thumb || "linear-gradient(135deg,#1e3a8a,#0f172a)", borderTopLeftRadius: 10, borderTopRightRadius: 10 } }), /* @__PURE__ */ React.createElement("div", { className: "card-body" }, /* @__PURE__ */ React.createElement("div", { className: "row between" }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 500, fontSize: 13.5 } }, d.title), d.version && /* @__PURE__ */ React.createElement("span", { className: "chip" }, d.version)), /* @__PURE__ */ React.createElement("div", { className: "subtle xsmall", style: { marginTop: 6 } }, d.type, d.date ? " \xB7 subido " + d.date : ""), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 14 } }, d.status === "approved" ? /* @__PURE__ */ React.createElement("div", { className: "row tight", style: { color: "var(--green)", fontSize: 12.5 } }, /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 13 }), " Aprobado") : /* @__PURE__ */ React.createElement("div", { className: "row tight" }, /* @__PURE__ */ React.createElement("button", { className: "btn primary sm grow", onClick: () => openModal("approve", { deliverable: d }) }, /* @__PURE__ */ React.createElement(Icon, { name: "thumbs-up", size: 12 }), " Revisar"), /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only sm" }, /* @__PURE__ */ React.createElement(Icon, { name: "download", size: 12 })))))))))), /* @__PURE__ */ React.createElement("div", { style: { flex: "1 1 240px", minWidth: 0, maxWidth: 340 } }, /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body", style: { padding: 18 } }, /* @__PURE__ */ React.createElement("div", { className: "row between", style: { alignItems: "flex-start" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 500 } }, "Historial de eventos"), /* @__PURE__ */ React.createElement("span", { className: "muted xsmall" }, events.length)), /* @__PURE__ */ React.createElement("div", { className: "muted xsmall", style: { marginTop: 4, marginBottom: 16, lineHeight: 1.5 } }, "Lo que ha pasado en el proyecto, en orden cronol\xF3gico inverso."), events.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "muted small" }, "A\xFAn no hay eventos registrados.") : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } }, events.map((e, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 7, height: 7, borderRadius: 99, background: "var(--text-subtle)", marginTop: 5, flexShrink: 0 } }), /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-subtle)" } }, e.type), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, marginTop: 2, lineHeight: 1.4 } }, e.title))))))))), /* @__PURE__ */ React.createElement(WhatsAppFloat, null));
};
const DriveLogo = ({ size = 24 }) => /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 87.3 78", width: size, height: size }, /* @__PURE__ */ React.createElement("path", { d: "M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5z", fill: "#0066da" }), /* @__PURE__ */ React.createElement("path", { d: "M43.65 25L29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3L1.2 48.5c-.8 1.4-1.2 2.95-1.2 4.5h27.5z", fill: "#00ac47" }), /* @__PURE__ */ React.createElement("path", { d: "M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.85 11.5z", fill: "#ea4335" }), /* @__PURE__ */ React.createElement("path", { d: "M43.65 25L57.4 1.2C56.05.4 54.5 0 52.95 0H34.35c-1.55 0-3.1.45-4.45 1.2z", fill: "#00832d" }), /* @__PURE__ */ React.createElement("path", { d: "M59.8 52.9H27.5L13.75 76.7c1.35.8 2.9 1.2 4.45 1.2h50.9c1.55 0 3.1-.45 4.45-1.2z", fill: "#2684fc" }), /* @__PURE__ */ React.createElement("path", { d: "M73.4 26.5L60.75 4.5c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25l16.15 27.9h27.45c0-1.55-.4-3.1-1.2-4.5z", fill: "#ffba00" }));
const ClientDocs = ({ session }) => {
  const D = window.Data;
  D.useStore && D.useStore();
  const S = _portalScope(session);
  const invoices = S.invoices;
  const me = S.me || null;
  const driveUrl = me?.driveUrl || "";
  const p0 = S.projects[0];
  const plan0 = p0 ? _planOf(p0) : null;
  const eyebrow = plan0?.active ? plan0.active.name : "Documentaci\xF3n";
  const needs = [
    { t: "Activos de marca", d: "Logos, tipograf\xEDas, colores, manual de marca y cualquier recurso gr\xE1fico que tengas." },
    { t: "Contenido y materiales", d: "Fotos, v\xEDdeos, textos, cat\xE1logos, presentaciones\u2026 lo que uses en tu negocio." },
    { t: "Documentaci\xF3n y procesos", d: "C\xF3mo trabaj\xE1is por dentro: procedimientos, plantillas, mensajes tipo, exports de Notion, etc." }
  ];
  const numCircle = {
    width: 26,
    height: 26,
    borderRadius: 99,
    flexShrink: 0,
    display: "grid",
    placeItems: "center",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text-muted)",
    border: "1.5px solid var(--border-strong)"
  };
  return /* @__PURE__ */ React.createElement("div", { className: "page" }, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 24 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.09em", color: "var(--text-subtle)", marginBottom: 8 } }, eyebrow), /* @__PURE__ */ React.createElement("h1", { style: { fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(26px,3.5vw,34px)", letterSpacing: "-1px" } }, "Documentaci\xF3n y materiales"), /* @__PURE__ */ React.createElement("div", { className: "sub", style: { marginTop: 8, maxWidth: 620, color: "var(--text-muted)" } }, "Esta es tu carpeta compartida. Sube aqu\xED todo lo que creas que puede servir para tu proyecto: activos de marca, contenido, materiales y documentaci\xF3n de tu negocio.")), /* @__PURE__ */ React.createElement("div", { className: "card", style: { marginBottom: 18 } }, /* @__PURE__ */ React.createElement("div", { className: "card-body", style: { padding: 24, display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { style: { width: 46, height: 46, borderRadius: 12, background: "var(--bg-elev-2)", border: "0.5px solid var(--border)", display: "grid", placeItems: "center", flexShrink: 0 } }, /* @__PURE__ */ React.createElement(DriveLogo, { size: 24 })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 240 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 500, letterSpacing: "-0.4px", lineHeight: 1.25 } }, "Adjunta toda la documentaci\xF3n en tu carpeta de Google Drive"), /* @__PURE__ */ React.createElement("div", { className: "muted small", style: { marginTop: 8, lineHeight: 1.6, maxWidth: 560 } }, driveUrl ? "Sube aqu\xED todo tu material operativo. Puedes abrir la carpeta cuando quieras desde el bot\xF3n." : "Estamos preparando la carpeta compartida. En cuanto est\xE9 lista, el bot\xF3n se activar\xE1 y podr\xE1s abrirla desde aqu\xED. Te avisamos tambi\xE9n por WhatsApp."), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 16 } }, driveUrl ? /* @__PURE__ */ React.createElement("a", { className: "btn primary", href: driveUrl, target: "_blank", rel: "noreferrer", style: { textDecoration: "none" } }, "Abrir carpeta en Google Drive ", /* @__PURE__ */ React.createElement(Icon, { name: "external-link", size: 13 })) : /* @__PURE__ */ React.createElement("button", { className: "btn", disabled: true, style: { opacity: 0.45, cursor: "not-allowed" } }, "Abrir carpeta en Google Drive ", /* @__PURE__ */ React.createElement(Icon, { name: "external-link", size: 13 })))))), /* @__PURE__ */ React.createElement("div", { className: "card", style: { marginBottom: 24 } }, /* @__PURE__ */ React.createElement("div", { className: "card-body", style: { padding: 24 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 500, letterSpacing: "-0.4px" } }, "Qu\xE9 necesitamos que subas"), /* @__PURE__ */ React.createElement("div", { className: "muted small", style: { marginTop: 6 } }, "Estos son los tipos de material que nos interesan."), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 14 } }, needs.map((n, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", gap: 16, alignItems: "flex-start", padding: "14px 0", borderTop: i ? "0.5px solid var(--border)" : "none" } }, /* @__PURE__ */ React.createElement("div", { style: numCircle }, i + 1), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 500, fontSize: 14 } }, n.t), /* @__PURE__ */ React.createElement("div", { className: "muted small", style: { marginTop: 3, lineHeight: 1.5 } }, n.d))))), /* @__PURE__ */ React.createElement("div", { className: "muted small", style: { marginTop: 16, lineHeight: 1.6, paddingTop: 16, borderTop: "0.5px solid var(--border)" } }, "Sube todo lo que creas que puede servir, aunque no est\xE9s seguro. Cuanto m\xE1s completo, mejor \u2014 no hace falta que est\xE9 perfecto ni ordenado."))), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 10, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-subtle)" } }, "Facturas"), invoices.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { icon: "file-text", title: "Sin facturas todav\xEDa", sub: "Aqu\xED aparecer\xE1n tus facturas cuando tu agencia las emita." }) : /* @__PURE__ */ React.createElement("div", { className: "card", style: { marginBottom: 24 } }, /* @__PURE__ */ React.createElement("div", { className: "card-body flush" }, /* @__PURE__ */ React.createElement("table", { className: "table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "N\xBA"), /* @__PURE__ */ React.createElement("th", null, "Tipo"), /* @__PURE__ */ React.createElement("th", null, "Emitida"), /* @__PURE__ */ React.createElement("th", null, "Vencimiento"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "Importe"), /* @__PURE__ */ React.createElement("th", null, "Estado"), /* @__PURE__ */ React.createElement("th", null))), /* @__PURE__ */ React.createElement("tbody", null, invoices.map((i) => /* @__PURE__ */ React.createElement("tr", { key: i.id }, /* @__PURE__ */ React.createElement("td", { style: { fontFamily: "var(--font-mono)", fontSize: 12 } }, i.id), /* @__PURE__ */ React.createElement("td", null, i.type ? /* @__PURE__ */ React.createElement("span", { className: "chip" }, i.type) : "\u2014"), /* @__PURE__ */ React.createElement("td", { className: "muted" }, i.issued || "\u2014"), /* @__PURE__ */ React.createElement("td", { className: "muted" }, i.due || "\u2014"), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", fontWeight: 500 } }, "\u20AC", Number(i.amount || 0).toLocaleString("es-ES")), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(StatusChip, { status: i.status })), /* @__PURE__ */ React.createElement("td", null, i.status === "pending" || i.status === "overdue" ? /* @__PURE__ */ React.createElement("button", { className: "btn primary sm", style: { background: "#635bff", borderColor: "#635bff", color: "#fff" } }, "Pagar con Stripe") : /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm" }, /* @__PURE__ */ React.createElement(Icon, { name: "download", size: 12 }), " PDF")))))))), /* @__PURE__ */ React.createElement(WhatsAppFloat, null));
};
const _brandBox = (size = 40) => ({ width: size, height: size, borderRadius: 11, background: "var(--bg-elev-2)", display: "grid", placeItems: "center", color: "var(--text)", border: "0.5px solid var(--border)", flexShrink: 0 });
const _credComplete = (c, mode) => mode === "access" ? !!c.granted : !!(c.username && c.password);
const CredStatus = ({ ok, label }) => /* @__PURE__ */ React.createElement("span", { style: {
  fontSize: 10.5,
  letterSpacing: "0.03em",
  padding: "3px 9px",
  borderRadius: 99,
  whiteSpace: "nowrap",
  flexShrink: 0,
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  background: ok ? "var(--green-soft)" : "var(--amber-soft)",
  color: ok ? "var(--green)" : "var(--amber)",
  border: "0.5px solid " + (ok ? "var(--green)" : "var(--amber)")
} }, ok && /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 9 }), label);
const CredCatalog = ({ onPick, onCancel }) => {
  const D = window.Data;
  const cat = D.CRED_CATALOG || [];
  const groups = [
    { mode: "login", title: "Con usuario y contrase\xF1a", sub: "Nos das tus datos de acceso." },
    { mode: "access", title: "Dando acceso a nuestro correo", sub: "Nos a\xF1ades como colaborador; no compartes contrase\xF1as." }
  ];
  return /* @__PURE__ */ React.createElement("div", { className: "card", style: { marginBottom: 18 } }, /* @__PURE__ */ React.createElement("div", { className: "card-body", style: { padding: 22 } }, /* @__PURE__ */ React.createElement("div", { className: "row between", style: { alignItems: "flex-start", marginBottom: 4 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 500, letterSpacing: "-0.4px" } }, "A\xF1adir un acceso"), /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: onCancel }, "Cancelar")), /* @__PURE__ */ React.createElement("div", { className: "muted small", style: { marginBottom: 4 } }, "Elige la plataforma."), groups.map((g) => /* @__PURE__ */ React.createElement("div", { key: g.mode, style: { marginTop: 18 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-subtle)" } }, g.title), /* @__PURE__ */ React.createElement("div", { className: "muted xsmall", style: { marginTop: 2, marginBottom: 10 } }, g.sub), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(156px,1fr))", gap: 10 } }, cat.filter((p) => p.mode === g.mode).map((p) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: p.key,
      className: "cred-tile",
      onClick: () => onPick(p),
      style: { display: "flex", alignItems: "center", gap: 11, padding: "11px 13px", cursor: "pointer", background: "var(--bg-elev-2)", border: "0.5px solid var(--border)", borderRadius: 12, textAlign: "left", fontFamily: "inherit" }
    },
    /* @__PURE__ */ React.createElement("span", { style: _brandBox(34) }, /* @__PURE__ */ React.createElement(Icon, { name: p.icon, size: 17 })),
    /* @__PURE__ */ React.createElement("span", { style: { minWidth: 0, fontWeight: 500, fontSize: 13.5, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, p.name)
  )))))));
};
const CredItem = ({ c, agencyEmail, editable, onDelete }) => {
  const D = window.Data;
  const meta = D.credMeta(c.platform);
  const mode = meta.mode;
  const complete = _credComplete(c, mode);
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState("");
  const [editing, setEditing] = useState(editable && mode === "login" && !c.username && !c.password);
  const [f, setF] = useState({ username: c.username, password: c.password, notes: c.notes });
  const copy = (val, which) => {
    try {
      navigator.clipboard.writeText(val);
      setCopied(which);
      setTimeout(() => setCopied(""), 1200);
    } catch {
    }
  };
  const inp = { width: "100%", height: 38, borderRadius: 9, padding: "8px 12px", background: "var(--bg-elev)", border: "0.5px solid var(--border)", color: "var(--text)", fontFamily: "inherit", fontSize: 13.5, marginBottom: 9 };
  const saveEdit = () => {
    D.updateCredential(c.id, f);
    setEditing(false);
  };
  const field = (label, val, mono, which, extra) => /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginTop: 9 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 66, fontSize: 11.5, color: "var(--text-subtle)", flexShrink: 0 } }, label), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, fontSize: 13.5, fontFamily: mono ? "var(--font-mono)" : "inherit", wordBreak: "break-all" } }, val), extra, /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only sm", onClick: () => copy(typeof val === "string" ? val : "", which) }, /* @__PURE__ */ React.createElement(Icon, { name: copied === which ? "check" : "copy", size: 12 })));
  return /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body", style: { padding: 18 } }, /* @__PURE__ */ React.createElement("div", { className: "row between", style: { alignItems: "flex-start", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 12, minWidth: 0 } }, /* @__PURE__ */ React.createElement("span", { style: _brandBox(40) }, /* @__PURE__ */ React.createElement(Icon, { name: meta.icon, size: 19 })), /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 500, fontSize: 15 } }, c.label || meta.name), /* @__PURE__ */ React.createElement("div", { className: "muted xsmall", style: { marginTop: 2 } }, mode === "access" ? "Dar acceso" : "Usuario y contrase\xF1a"))), /* @__PURE__ */ React.createElement("div", { className: "row tight", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement(CredStatus, { ok: complete, label: mode === "access" ? complete ? "Concedido" : "Pendiente" : complete ? "Guardado" : "Pendiente" }), mode === "login" && editable && !editing && /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only sm", onClick: () => setEditing(true) }, /* @__PURE__ */ React.createElement(Icon, { name: "edit", size: 13 })), editable && /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only sm", onClick: () => onDelete(c) }, /* @__PURE__ */ React.createElement(Icon, { name: "trash", size: 13 })))), mode === "access" ? /* @__PURE__ */ React.createElement("div", { style: { marginTop: 14, paddingTop: 14, borderTop: "0.5px solid var(--border)" } }, /* @__PURE__ */ React.createElement("div", { className: "muted small", style: { lineHeight: 1.5, marginBottom: 8 } }, "A\xF1ade este correo como acceso en tu cuenta de ", /* @__PURE__ */ React.createElement("b", { style: { color: "var(--text)" } }, meta.name), ":"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1, fontSize: 13.5, fontFamily: "var(--font-mono)", wordBreak: "break-all", background: "var(--bg-elev)", border: "0.5px solid var(--border)", borderRadius: 9, padding: "9px 12px" } }, agencyEmail), /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only sm", onClick: () => copy(agencyEmail, "mail") }, /* @__PURE__ */ React.createElement(Icon, { name: copied === "mail" ? "check" : "copy", size: 13 }))), editable ? /* @__PURE__ */ React.createElement("button", { className: "btn sm" + (c.granted ? "" : " ghost"), style: { marginTop: 12 }, onClick: () => D.updateCredential(c.id, { granted: !c.granted }) }, c.granted ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 12 }), " Acceso concedido") : "Ya he dado el acceso") : null) : editing ? /* @__PURE__ */ React.createElement("div", { style: { marginTop: 14, paddingTop: 14, borderTop: "0.5px solid var(--border)" } }, /* @__PURE__ */ React.createElement("input", { style: inp, placeholder: "Usuario / email", value: f.username, onChange: (e) => setF((s) => ({ ...s, username: e.target.value })), autoFocus: true }), /* @__PURE__ */ React.createElement("input", { style: inp, placeholder: "Contrase\xF1a", value: f.password, onChange: (e) => setF((s) => ({ ...s, password: e.target.value })) }), /* @__PURE__ */ React.createElement("input", { style: { ...inp, marginBottom: 12 }, placeholder: "Notas (opcional)", value: f.notes, onChange: (e) => setF((s) => ({ ...s, notes: e.target.value })) }), /* @__PURE__ */ React.createElement("div", { className: "row tight" }, /* @__PURE__ */ React.createElement("button", { className: "btn primary sm", onClick: saveEdit }, "Guardar"), /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: () => setEditing(false) }, "Cancelar"))) : /* @__PURE__ */ React.createElement("div", { style: { marginTop: 14, paddingTop: 14, borderTop: "0.5px solid var(--border)" } }, c.username && field("Usuario", c.username, false, "u"), c.password && field(
    "Contrase\xF1a",
    show ? c.password : "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
    true,
    "p",
    /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only sm", onClick: () => setShow((s) => !s) }, /* @__PURE__ */ React.createElement(Icon, { name: show ? "eye-off" : "eye", size: 12 }))
  ), !c.username && !c.password && /* @__PURE__ */ React.createElement("div", { className: "muted small", style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 } }, /* @__PURE__ */ React.createElement("span", null, "A\xFAn no has rellenado este acceso."), editable && /* @__PURE__ */ React.createElement("button", { className: "btn primary sm", onClick: () => setEditing(true) }, "Rellenar")), c.notes ? /* @__PURE__ */ React.createElement("div", { className: "muted small", style: { marginTop: 10, lineHeight: 1.5 } }, c.notes) : null)));
};
const ClientCredentials = ({ session }) => {
  const D = window.Data;
  D.useStore && D.useStore();
  const S = _portalScope(session);
  const clientId = S.clientId;
  const creds = S.credentials;
  const agencyEmail = D.SETTINGS && D.SETTINGS.email || "tu agencia";
  const [picking, setPicking] = useState(false);
  const add = (p) => {
    D.addCredential(clientId, { platform: p.key, label: p.name });
    setPicking(false);
  };
  const del = (c) => {
    if (confirm(`\xBFEliminar "${c.label || ""}"?`)) D.deleteCredential(c.id);
  };
  const doneCount = creds.filter((c) => _credComplete(c, D.credMeta(c.platform).mode)).length;
  return /* @__PURE__ */ React.createElement("div", { className: "page" }, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 20 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.09em", color: "var(--text-subtle)", marginBottom: 8 } }, "Accesos"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("h1", { style: { fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(26px,3.5vw,34px)", letterSpacing: "-1px" } }, "Credenciales"), /* @__PURE__ */ React.createElement("div", { className: "sub", style: { marginTop: 8, maxWidth: 560, color: "var(--text-muted)" } }, "Guarda aqu\xED los accesos que tu equipo de 141 necesita para trabajar. Solo t\xFA y el equipo pod\xE9is verlos.")), !picking && /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: () => setPicking(true) }, /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 14 }), " A\xF1adir acceso")), creds.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "muted xsmall", style: { marginTop: 14, display: "inline-flex", alignItems: "center", gap: 7 } }, /* @__PURE__ */ React.createElement(Icon, { name: "lock", size: 12 }), " ", doneCount, " de ", creds.length, " accesos listos \xB7 cifrado y privado")), picking && /* @__PURE__ */ React.createElement(CredCatalog, { onPick: add, onCancel: () => setPicking(false) }), creds.length === 0 && !picking ? /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body", style: { padding: "40px 24px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { width: 52, height: 52, borderRadius: 14, margin: "0 auto 16px", display: "grid", placeItems: "center", background: "var(--bg-elev-2)", border: "0.5px solid var(--border)", color: "var(--text-muted)" } }, /* @__PURE__ */ React.createElement(Icon, { name: "lock", size: 22 })), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 500 } }, "Sin accesos todav\xEDa"), /* @__PURE__ */ React.createElement("div", { className: "muted small", style: { marginTop: 6, maxWidth: 380, marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 } }, "A\xF1ade los accesos que tu agencia necesita: redes sociales, web, hosting, analytics\u2026 Elige la plataforma y te decimos qu\xE9 necesitamos."), /* @__PURE__ */ React.createElement("button", { className: "btn primary", style: { marginTop: 18 }, onClick: () => setPicking(true) }, /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 14 }), " A\xF1adir acceso"))) : /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: 14 } }, creds.map((c) => /* @__PURE__ */ React.createElement(CredItem, { key: c.id, c, agencyEmail, editable: true, onDelete: del }))), /* @__PURE__ */ React.createElement(WhatsAppFloat, null));
};
const _notifAgoP = (iso) => {
  if (!iso) return "ahora";
  const d = new Date(iso);
  const s = Math.floor((Date.now() - d.getTime()) / 1e3);
  if (s < 60) return "ahora";
  const m = Math.floor(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  const dd = Math.floor(h / 24);
  if (dd < 7) return `hace ${dd} d`;
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
};
const ClientNotifications = ({ session }) => {
  const D = window.Data;
  D.useStore && D.useStore();
  const pcid = _previewClientId(session);
  let list = D.NOTIFICATIONS || [];
  if (pcid) list = list.filter((n) => n.clientId === pcid);
  const unread = list.filter((n) => !n.read).length;
  return /* @__PURE__ */ React.createElement("div", { className: "page" }, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 22 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.09em", color: "var(--text-subtle)", marginBottom: 8 } }, "Tu cuenta"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", { style: { fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(26px,3.5vw,34px)", letterSpacing: "-1px" } }, "Notificaciones"), /* @__PURE__ */ React.createElement("div", { className: "sub", style: { marginTop: 8, color: "var(--text-muted)" } }, "Novedades de tu proyecto y lo que tu agencia necesita de ti.")), unread > 0 && /* @__PURE__ */ React.createElement("button", { className: "btn ghost", onClick: () => D.markAllNotificationsRead() }, "Marcar todas le\xEDdas"))), list.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { icon: "bell", title: "Sin notificaciones", sub: "Aqu\xED ver\xE1s los avisos cuando tu agencia a\xF1ada proyectos o tareas." }) : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, list.map((n) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: n.id,
      className: "card",
      style: { cursor: n.read ? "default" : "pointer", borderColor: n.read ? "var(--border)" : "var(--accent)" },
      onClick: () => {
        if (!n.read) D.markNotificationRead(n.id);
      }
    },
    /* @__PURE__ */ React.createElement("div", { className: "card-body", style: { padding: 16, display: "flex", gap: 14, alignItems: "flex-start" } }, /* @__PURE__ */ React.createElement("div", { style: {
      width: 38,
      height: 38,
      borderRadius: 10,
      flexShrink: 0,
      display: "grid",
      placeItems: "center",
      background: n.read ? "var(--bg-elev-2)" : "var(--accent-soft)",
      color: n.read ? "var(--text-muted)" : "var(--accent)",
      border: "0.5px solid var(--border)"
    } }, /* @__PURE__ */ React.createElement(Icon, { name: n.kind === "task" ? "list-todo" : n.kind === "project" ? "folder" : "bell", size: 17 })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 500, fontSize: 14.5 } }, n.title), /* @__PURE__ */ React.createElement("div", { className: "muted xsmall", style: { flexShrink: 0 } }, _notifAgoP(n.createdAt))), n.body && /* @__PURE__ */ React.createElement("div", { className: "muted small", style: { marginTop: 3, lineHeight: 1.5 } }, n.body)), !n.read && /* @__PURE__ */ React.createElement("span", { style: { width: 8, height: 8, borderRadius: 99, background: "var(--accent)", flexShrink: 0, marginTop: 6 } }))
  ))), /* @__PURE__ */ React.createElement(WhatsAppFloat, null));
};
const ClientSettings = ({ session }) => {
  const D = window.Data;
  D.useStore && D.useStore();
  const S = _portalScope(session);
  const me = S.me;
  const clientId = S.clientId;
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(false);
  React.useEffect(() => {
    if (me) setForm({
      name: me.name || "",
      company: me.company || "",
      whatsapp: me.whatsapp || "",
      website: me.website || "",
      fiscalName: me.fiscalName || "",
      nif: me.nif || "",
      fiscalAddress: me.fiscalAddress || "",
      about: me.about || ""
    });
  }, [me && me.id]);
  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));
  const save = () => {
    D.updateClient(clientId, form);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };
  const inp = { width: "100%", height: 42, borderRadius: 10, padding: "10px 12px", background: "var(--bg-elev)", border: "0.5px solid var(--border)", color: "var(--text)", fontFamily: "inherit", fontSize: 14 };
  const field = (label, k, ph) => /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-subtle)", marginBottom: 5 } }, label), /* @__PURE__ */ React.createElement("input", { style: inp, value: form && form[k] || "", placeholder: ph || "", onChange: (e) => set(k, e.target.value) }));
  const head = /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 22 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.09em", color: "var(--text-subtle)", marginBottom: 8 } }, "Tu cuenta"), /* @__PURE__ */ React.createElement("h1", { style: { fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(26px,3.5vw,34px)", letterSpacing: "-1px" } }, "Ajustes"), /* @__PURE__ */ React.createElement("div", { className: "sub", style: { marginTop: 8, color: "var(--text-muted)" } }, "Revisa y actualiza tus datos. Puedes cambiar lo que rellenaste al principio."));
  if (!me || !form) return /* @__PURE__ */ React.createElement("div", { className: "page" }, head, /* @__PURE__ */ React.createElement(Empty, { icon: "user-cog", title: "Cargando tu cuenta\u2026" }), /* @__PURE__ */ React.createElement(WhatsAppFloat, null));
  return /* @__PURE__ */ React.createElement("div", { className: "page" }, head, /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body", style: { padding: 22 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 16 } }, field("Nombre de contacto", "name", "Tu nombre"), field("Empresa", "company", "Mi Empresa S.L."), field("Tel\xE9fono / WhatsApp", "whatsapp", "+34 600 000 000"), field("Web", "website", "tuweb.com"), field("Raz\xF3n social", "fiscalName", "Mi Empresa S.L."), field("NIF / CIF", "nif"), field("Direcci\xF3n fiscal", "fiscalAddress")), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-subtle)", marginBottom: 5 } }, "A qu\xE9 te dedicas"), /* @__PURE__ */ React.createElement("textarea", { style: { ...inp, height: 80, resize: "vertical", lineHeight: 1.5 }, value: form.about, placeholder: "Cu\xE9ntanos brevemente tu negocio", onChange: (e) => set("about", e.target.value) })), /* @__PURE__ */ React.createElement("div", { className: "row tight", style: { marginTop: 18 } }, /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: save }, "Guardar cambios"), saved && /* @__PURE__ */ React.createElement("span", { className: "small", style: { color: "var(--green)" } }, "Guardado \u2713")))), /* @__PURE__ */ React.createElement("div", { className: "muted xsmall", style: { marginTop: 14, display: "flex", alignItems: "center", gap: 7 } }, /* @__PURE__ */ React.createElement(Icon, { name: "mail", size: 12 }), " Tu correo de acceso es ", me.email || "\u2014", " (no se puede cambiar desde aqu\xED)."), /* @__PURE__ */ React.createElement(WhatsAppFloat, null));
};
Object.assign(window, { ClientLogin, ClientDashboard, ClientStatus, ClientDocs, ClientCredentials, ClientNotifications, ClientSettings });

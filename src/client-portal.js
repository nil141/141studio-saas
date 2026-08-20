const ClientLogin = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return /* @__PURE__ */ React.createElement("div", { style: { minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr", background: "var(--bg)" } }, /* @__PURE__ */ React.createElement("div", { style: { padding: 60, display: "flex", flexDirection: "column" } }, /* @__PURE__ */ React.createElement("div", { className: "row tight", style: { marginBottom: "auto" } }, /* @__PURE__ */ React.createElement("div", { className: "brand-mark" }, "141"), /* @__PURE__ */ React.createElement("div", { className: "brand-name" }, "141", /* @__PURE__ */ React.createElement("span", { className: "tick" }, "'"), "STUDIO")), /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 360 } }, /* @__PURE__ */ React.createElement("h1", { style: { fontSize: 32, fontWeight: 500, lineHeight: 1.15, marginBottom: 8 } }, "Bienvenido al portal de tu proyecto."), /* @__PURE__ */ React.createElement("div", { className: "muted", style: { fontSize: 14, marginBottom: 32 } }, "Aqu\xED puedes ver el avance por fases, aprobar entregables y descargar tus facturas."), !sent ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Tu email"), /* @__PURE__ */ React.createElement("input", { className: "input", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "tu@empresa.com", style: { height: 40, marginBottom: 12 } }), /* @__PURE__ */ React.createElement("button", { className: "btn primary full", style: { height: 40 }, onClick: () => {
    setSent(true);
    setTimeout(onLogin, 900);
  } }, "Enviar enlace m\xE1gico"), /* @__PURE__ */ React.createElement("div", { className: "subtle xsmall", style: { marginTop: 16, lineHeight: 1.5 } }, "Te enviaremos un enlace seguro a tu email. Sin contrase\xF1as.")) : /* @__PURE__ */ React.createElement("div", { style: { padding: 20, border: "0.5px solid var(--border)", borderRadius: 12, background: "var(--bg-elev)" } }, /* @__PURE__ */ React.createElement("div", { className: "row tight", style: { marginBottom: 8 } }, /* @__PURE__ */ React.createElement(Icon, { name: "mail", size: 14 }), /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 500 } }, "Revisa tu correo")), /* @__PURE__ */ React.createElement("div", { className: "muted small" }, "Te hemos enviado un enlace a ", /* @__PURE__ */ React.createElement("b", null, email), ". Entrando\u2026"))), /* @__PURE__ */ React.createElement("div", { className: "subtle xsmall", style: { marginTop: "auto" } }, "\xA9 141'STUDIO \xB7 soporte@141.studio")), /* @__PURE__ */ React.createElement("div", { style: { background: "linear-gradient(160deg,#0f172a 0%,#020617 60%,#312e81 100%)", position: "relative", overflow: "hidden" } }));
};
const WhatsAppFloat = () => /* @__PURE__ */ React.createElement(
  "a",
  {
    href: "https://wa.me/34611223344",
    target: "_blank",
    style: {
      position: "fixed",
      right: 24,
      bottom: 24,
      zIndex: 30,
      background: "#25D366",
      color: "#fff",
      borderRadius: 99,
      padding: "12px 18px",
      display: "flex",
      alignItems: "center",
      gap: 8,
      boxShadow: "0 6px 20px rgba(37,211,102,0.35)",
      fontSize: 13,
      fontWeight: 500,
      textDecoration: "none"
    }
  },
  /* @__PURE__ */ React.createElement(Icon, { name: "msg-circle", size: 15 }),
  " Hablar con el equipo"
);
const _phaseStatus = (done, total) => total === 0 ? { label: "Sin tareas", cls: "" } : done === total ? { label: "Completada", cls: "green" } : done > 0 ? { label: "En curso", cls: "blue" } : { label: "Sin empezar", cls: "" };
const _planOf = (p) => {
  const D = window.Data;
  const names = (p.service || "").split(",").map((s) => s.trim()).filter((n) => n && n !== "libre" && n !== "\u2014");
  const tasks = D.TASKS[p.id] || [];
  const mk = (name, gt) => {
    const done2 = gt.filter((t) => t.column === "done").length;
    return { name, tasks: gt, done: done2, total: gt.length, pct: gt.length ? Math.round(done2 / gt.length * 100) : 0 };
  };
  const groups = names.map((name) => mk(name, tasks.filter((t) => (t.phase || null) === name)));
  const otras = tasks.filter((t) => !names.includes(t.phase || null));
  if (otras.length) groups.push(mk("Otras tareas", otras));
  const total = tasks.length;
  const done = tasks.filter((t) => t.column === "done").length;
  const pct = total ? Math.round(done / total * 100) : p.progress || 0;
  const active = groups.find((g) => g.done > 0 && g.done < g.total) || groups.find((g) => g.total > 0 && g.done === 0) || groups[groups.length - 1] || null;
  return { names, groups, total, done, pct, active };
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
  const projects = D.PROJECTS || [];
  const [selId, setSelId] = useState(null);
  const primary = projects.find((p) => p.id === selId) || projects[0] || null;
  const name = (session == null ? void 0 : session.name) || "";
  const pending = (D.DELIVERABLES || []).filter((d) => d.status && d.status !== "approved");
  const plan = primary ? _planOf(primary) : { groups: [], pct: 0, done: 0, total: 0, active: null };
  const myTasks = [];
  projects.forEach((p) => (D.TASKS[p.id] || []).forEach((t) => {
    const who = (t.assignee || "").toLowerCase();
    if (t.forClient || who.includes("client") || who.includes("cliente")) myTasks.push(t);
  }));
  const myDone = myTasks.filter((t) => t.column === "done").length;
  const myPct = myTasks.length ? Math.round(myDone / myTasks.length * 100) : 0;
  const heroBg = HERO_BG ? `linear-gradient(90deg, rgba(8,8,10,0.94) 0%, rgba(8,8,10,0.75) 40%, rgba(8,8,10,0.3) 100%), url(${HERO_BG}) center/cover` : `radial-gradient(130% 120% at 82% 0%, rgba(150,105,70,0.38) 0%, rgba(20,16,14,0) 55%), linear-gradient(120deg, #16130f 0%, #0b0b0d 58%, #191410 100%)`;
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
    const st = _phaseStatus(g.done, g.total);
    const isActive = plan.active && g.name === plan.active.name && st.cls !== "green";
    const isDone = g.total > 0 && g.done === g.total;
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: i,
        onClick: () => navigate("client-status", { projectId: primary.id }),
        style: {
          cursor: "pointer",
          flex: "0 0 auto",
          width: 186,
          minHeight: 118,
          borderRadius: 16,
          padding: "16px 18px",
          display: "flex",
          flexDirection: "column",
          border: isActive ? "0.5px solid var(--accent)" : "0.5px solid var(--border)",
          background: isActive ? "var(--accent-soft)" : "var(--bg-elev-2)",
          opacity: isDone ? 0.72 : 1
        }
      },
      /* @__PURE__ */ React.createElement("div", { className: "row tight", style: { marginBottom: 8 } }, isDone && /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 13, style: { color: "var(--green)" } }), st.label && /* @__PURE__ */ React.createElement("span", { className: "chip " + st.cls, style: { fontSize: 10, padding: "1px 7px" } }, st.label)),
      /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 500, marginBottom: 6 } }, g.name),
      /* @__PURE__ */ React.createElement("div", { className: "muted xsmall", style: { marginTop: "auto" } }, g.total ? `${g.done}/${g.total} tareas` : "Sin tareas a\xFAn")
    );
  })), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 26 } }, [
    { id: "client-docs", icon: "file-text", title: "Documentaci\xF3n", sub: "Archivos y facturas" },
    { id: "client-credentials", icon: "lock", title: "Credenciales", sub: "Tus accesos compartidos" }
  ].map((q) => /* @__PURE__ */ React.createElement("div", { key: q.id, className: "card", style: { cursor: "pointer" }, onClick: () => navigate(q.id) }, /* @__PURE__ */ React.createElement("div", { className: "card-body", style: { padding: 18, display: "flex", alignItems: "center", gap: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 38, height: 38, borderRadius: 10, background: "var(--bg-elev-2)", display: "grid", placeItems: "center", color: "var(--text-muted)", border: "0.5px solid var(--border)", flexShrink: 0 } }, /* @__PURE__ */ React.createElement(Icon, { name: q.icon, size: 17 })), /* @__PURE__ */ React.createElement("div", { className: "grow" }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 500, fontSize: 14 } }, q.title), /* @__PURE__ */ React.createElement("div", { className: "muted xsmall", style: { marginTop: 2 } }, q.sub)), /* @__PURE__ */ React.createElement(Icon, { name: "chevron", size: 14, style: { color: "var(--text-subtle)" } }))))), /* @__PURE__ */ React.createElement(WhatsAppFloat, null));
};
const ClientStatus = ({ navigate, openModal, projectId, initialTab }) => {
  const D = window.Data;
  D.useStore && D.useStore();
  const projects = D.PROJECTS || [];
  const p = projectId && projects.find((x) => x.id === projectId) || projects[0];
  const [tab, setTab] = useState(initialTab || "plan");
  if (!p) return /* @__PURE__ */ React.createElement("div", { className: "page" }, /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", null, "Estado del proyecto"), /* @__PURE__ */ React.createElement("div", { className: "sub" }, "El avance de tu proyecto aparecer\xE1 aqu\xED."))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "40vh" } }, /* @__PURE__ */ React.createElement(Empty, { icon: "folder", title: "Sin proyecto", sub: "Cuando tu agencia cree un proyecto podr\xE1s seguir su avance aqu\xED." })), /* @__PURE__ */ React.createElement(WhatsAppFloat, null));
  const phase = D.PHASES[p.phase] || D.PHASES[0] || { label: "", weeks: "" };
  const plan = _planOf(p);
  const deliverables = (D.DELIVERABLES || []).filter((d) => d.projectId === p.id);
  const secLabel = { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-subtle)", marginBottom: 10 };
  return /* @__PURE__ */ React.createElement("div", { className: "page" }, projects.length > 1 && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" } }, projects.map((pr) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: pr.id,
      className: "btn sm" + (pr.id === p.id ? " primary" : " ghost"),
      onClick: () => navigate("client-status", { projectId: pr.id })
    },
    pr.name
  ))), /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", null, p.name), /* @__PURE__ */ React.createElement("div", { className: "row tight", style: { marginTop: 8, color: "var(--text-muted)", fontSize: 13, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(StatusChip, { status: p.light, label: phase.label + (phase.weeks ? " \xB7 " + phase.weeks : "") }), p.deadline && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { className: "vdiv hide-mobile" }), /* @__PURE__ */ React.createElement("span", { className: "hide-mobile" }, /* @__PURE__ */ React.createElement(Icon, { name: "calendar", size: 12 }), " Entrega estimada ", p.deadline)), /* @__PURE__ */ React.createElement("span", { className: "vdiv hide-mobile" }), /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 100 } }, /* @__PURE__ */ React.createElement("div", { className: "progress" }, /* @__PURE__ */ React.createElement("i", { style: { width: plan.pct + "%" } }))), plan.pct, "%")))), /* @__PURE__ */ React.createElement("div", { className: "tabs" }, [
    { id: "plan", label: "Plan y fases", count: plan.names.length || null },
    { id: "deliverables", label: "Entregables", count: deliverables.length || null }
  ].map((t) => /* @__PURE__ */ React.createElement("div", { key: t.id, className: "tab" + (tab === t.id ? " active" : ""), onClick: () => setTab(t.id) }, t.label, t.count != null ? /* @__PURE__ */ React.createElement("span", { className: "count" }, t.count) : null))), tab === "plan" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 24 } }, /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body", style: { padding: 22 } }, /* @__PURE__ */ React.createElement("div", { className: "row between", style: { alignItems: "flex-end", marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: secLabel }, "Avance del proyecto"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 30, fontFamily: "var(--font-display)", fontWeight: 500, lineHeight: 1 } }, plan.pct, "%")), /* @__PURE__ */ React.createElement("div", { className: "muted small", style: { textAlign: "right" } }, plan.total ? `${plan.done} de ${plan.total} tareas completadas` : "A\xFAn sin tareas", plan.active && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 4 } }, "Fase actual: ", /* @__PURE__ */ React.createElement("b", { style: { color: "var(--text)" } }, plan.active.name)))), /* @__PURE__ */ React.createElement("div", { style: { height: 6, borderRadius: 99, background: "var(--border)", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { width: plan.pct + "%", height: "100%", background: "var(--accent)", borderRadius: 99, transition: "width .4s" } })))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: secLabel }, "Fases del proyecto"), plan.groups.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { icon: "list-todo", title: "Plan en preparaci\xF3n", sub: "Tu agencia est\xE1 organizando el proyecto en fases. Vuelve pronto." }) : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } }, plan.groups.map((g, i) => {
    const st = _phaseStatus(g.done, g.total);
    const isActive = plan.active && g.name === plan.active.name && st.cls !== "green";
    const isDone = g.total > 0 && g.done === g.total;
    return /* @__PURE__ */ React.createElement("div", { key: i, style: {
      border: isActive ? "0.5px solid var(--accent)" : "0.5px solid var(--border)",
      borderRadius: 12,
      overflow: "hidden",
      background: isActive ? "var(--accent-soft)" : "var(--bg-elev-2)",
      opacity: isDone ? 0.7 : 1
    } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "14px 18px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: g.total ? 10 : 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 8 } }, isDone && /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 13, style: { color: "var(--green)" } }), g.name, st.label && /* @__PURE__ */ React.createElement("span", { className: "chip " + st.cls, style: { fontSize: 10, padding: "1px 7px" } }, st.label)), g.total > 0 && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, fontWeight: 600, color: isDone ? "var(--green)" : "var(--text-subtle)" } }, g.pct, "%")), g.total > 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { height: 4, borderRadius: 99, background: "var(--border)", overflow: "hidden", marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { width: g.pct + "%", height: "100%", background: isDone ? "var(--green)" : "var(--accent)", borderRadius: 99, transition: "width .4s" } })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, g.tasks.map((t, ti) => {
      const taskDone = t.column === "done";
      return /* @__PURE__ */ React.createElement("div", { key: ti, style: { display: "flex", alignItems: "center", gap: 9, fontSize: 12.5 } }, /* @__PURE__ */ React.createElement("div", { style: {
        width: 15,
        height: 15,
        borderRadius: 5,
        flexShrink: 0,
        display: "grid",
        placeItems: "center",
        background: taskDone ? "var(--green)" : "transparent",
        border: taskDone ? "none" : "1px solid var(--border-strong)"
      } }, taskDone && /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 10, style: { color: "#000" } })), /* @__PURE__ */ React.createElement("span", { style: { color: taskDone ? "var(--text-subtle)" : "var(--text)", textDecoration: taskDone ? "line-through" : "none" } }, t.title));
    })))));
  })))), tab === "deliverables" && (deliverables.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { icon: "package", title: "Sin entregables todav\xEDa", sub: "Aqu\xED ver\xE1s los entregables cuando tu agencia los suba para tu revisi\xF3n." }) : /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "card", style: { marginBottom: 14, padding: 12, display: "flex", alignItems: "center", gap: 12 } }, /* @__PURE__ */ React.createElement(Icon, { name: "info", size: 14, style: { color: "var(--text-muted)" } }), /* @__PURE__ */ React.createElement("div", { className: "small grow" }, "Revisa cada entregable y apru\xE9balo cuando est\xE9s conforme. Tu aprobaci\xF3n queda registrada.")), /* @__PURE__ */ React.createElement("div", { className: "rg-deliverables" }, deliverables.map((d) => /* @__PURE__ */ React.createElement("div", { key: d.id, className: "card" }, /* @__PURE__ */ React.createElement("div", { style: { aspectRatio: "16/10", background: d.thumb || "linear-gradient(135deg,#1e3a8a,#0f172a)", borderTopLeftRadius: 10, borderTopRightRadius: 10 } }), /* @__PURE__ */ React.createElement("div", { className: "card-body" }, /* @__PURE__ */ React.createElement("div", { className: "row between" }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 500, fontSize: 13.5 } }, d.title), d.version && /* @__PURE__ */ React.createElement("span", { className: "chip" }, d.version)), /* @__PURE__ */ React.createElement("div", { className: "subtle xsmall", style: { marginTop: 6 } }, d.type, d.date ? " \xB7 subido " + d.date : ""), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 14 } }, d.status === "approved" ? /* @__PURE__ */ React.createElement("div", { className: "row tight", style: { color: "var(--green)", fontSize: 12.5 } }, /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 13 }), " Aprobado") : /* @__PURE__ */ React.createElement("div", { className: "row tight" }, /* @__PURE__ */ React.createElement("button", { className: "btn primary sm grow", onClick: () => openModal("approve", { deliverable: d }) }, /* @__PURE__ */ React.createElement(Icon, { name: "thumbs-up", size: 12 }), " Revisar"), /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only sm" }, /* @__PURE__ */ React.createElement(Icon, { name: "download", size: 12 })))))))))), /* @__PURE__ */ React.createElement(WhatsAppFloat, null));
};
const ClientDocs = ({ session }) => {
  const D = window.Data;
  D.useStore && D.useStore();
  const invoices = D.INVOICES || [];
  return /* @__PURE__ */ React.createElement("div", { className: "page" }, /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", null, "Documentaci\xF3n"), /* @__PURE__ */ React.createElement("div", { className: "sub" }, "Tus facturas y archivos del proyecto."))), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 10, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-subtle)" } }, "Facturas"), invoices.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { icon: "file-text", title: "Sin facturas todav\xEDa", sub: "Aqu\xED aparecer\xE1n tus facturas cuando tu agencia las emita." }) : /* @__PURE__ */ React.createElement("div", { className: "card", style: { marginBottom: 24 } }, /* @__PURE__ */ React.createElement("div", { className: "card-body flush" }, /* @__PURE__ */ React.createElement("table", { className: "table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "N\xBA"), /* @__PURE__ */ React.createElement("th", null, "Tipo"), /* @__PURE__ */ React.createElement("th", null, "Emitida"), /* @__PURE__ */ React.createElement("th", null, "Vencimiento"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "Importe"), /* @__PURE__ */ React.createElement("th", null, "Estado"), /* @__PURE__ */ React.createElement("th", null))), /* @__PURE__ */ React.createElement("tbody", null, invoices.map((i) => /* @__PURE__ */ React.createElement("tr", { key: i.id }, /* @__PURE__ */ React.createElement("td", { style: { fontFamily: "var(--font-mono)", fontSize: 12 } }, i.id), /* @__PURE__ */ React.createElement("td", null, i.type ? /* @__PURE__ */ React.createElement("span", { className: "chip" }, i.type) : "\u2014"), /* @__PURE__ */ React.createElement("td", { className: "muted" }, i.issued || "\u2014"), /* @__PURE__ */ React.createElement("td", { className: "muted" }, i.due || "\u2014"), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", fontWeight: 500 } }, "\u20AC", Number(i.amount || 0).toLocaleString("es-ES")), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(StatusChip, { status: i.status })), /* @__PURE__ */ React.createElement("td", null, i.status === "pending" || i.status === "overdue" ? /* @__PURE__ */ React.createElement("button", { className: "btn primary sm", style: { background: "#635bff", borderColor: "#635bff", color: "#fff" } }, "Pagar con Stripe") : /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm" }, /* @__PURE__ */ React.createElement(Icon, { name: "download", size: 12 }), " PDF")))))))), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 10, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-subtle)" } }, "Archivos"), /* @__PURE__ */ React.createElement(Empty, { icon: "folder", title: "Sin archivos compartidos", sub: "Cuando tu agencia comparta archivos o entregables descargables, los ver\xE1s aqu\xED." }), /* @__PURE__ */ React.createElement(WhatsAppFloat, null));
};
const CredForm = ({ initial, onSave, onCancel }) => {
  const [f, setF] = useState(initial || { label: "", url: "", username: "", password: "", notes: "" });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const inp = {
    width: "100%",
    height: 40,
    borderRadius: 10,
    padding: "8px 12px",
    background: "var(--bg-elev)",
    border: "0.5px solid var(--border)",
    color: "var(--text)",
    fontFamily: "inherit",
    fontSize: 14,
    marginBottom: 10
  };
  return /* @__PURE__ */ React.createElement("div", { className: "card", style: { marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { className: "card-body", style: { padding: 16 } }, /* @__PURE__ */ React.createElement("input", { style: inp, placeholder: "Nombre del acceso (p.ej. Instagram, Hosting\u2026)", value: f.label, onChange: (e) => set("label", e.target.value), autoFocus: true }), /* @__PURE__ */ React.createElement("input", { style: inp, placeholder: "URL (p.ej. instagram.com)", value: f.url, onChange: (e) => set("url", e.target.value) }), /* @__PURE__ */ React.createElement("input", { style: inp, placeholder: "Usuario / email", value: f.username, onChange: (e) => set("username", e.target.value) }), /* @__PURE__ */ React.createElement("input", { style: inp, placeholder: "Contrase\xF1a", value: f.password, onChange: (e) => set("password", e.target.value) }), /* @__PURE__ */ React.createElement("input", { style: { ...inp, marginBottom: 14 }, placeholder: "Notas (opcional)", value: f.notes, onChange: (e) => set("notes", e.target.value) }), /* @__PURE__ */ React.createElement("div", { className: "row tight" }, /* @__PURE__ */ React.createElement("button", { className: "btn primary sm", disabled: !f.label.trim(), onClick: () => onSave(f) }, "Guardar"), /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: onCancel }, "Cancelar"))));
};
const CredCard = ({ c, onEdit, onDelete }) => {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState("");
  const copy = (val, which) => {
    try {
      navigator.clipboard.writeText(val);
      setCopied(which);
      setTimeout(() => setCopied(""), 1200);
    } catch (e) {
    }
  };
  const row = (label, val, which, mono) => val ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginTop: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 78, fontSize: 12, color: "var(--text-subtle)", flexShrink: 0 } }, label), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, fontSize: 13.5, fontFamily: mono ? "var(--font-mono)" : "inherit", wordBreak: "break-all" } }, val), /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only sm", onClick: () => copy(val, which), title: "Copiar" }, /* @__PURE__ */ React.createElement(Icon, { name: copied === which ? "check" : "copy", size: 13 }))) : null;
  return /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body", style: { padding: 16 } }, /* @__PURE__ */ React.createElement("div", { className: "row between", style: { alignItems: "flex-start" } }, /* @__PURE__ */ React.createElement("div", { className: "row tight" }, /* @__PURE__ */ React.createElement("div", { style: { width: 34, height: 34, borderRadius: 9, background: "var(--bg-elev-2)", display: "grid", placeItems: "center", color: "var(--text-muted)", border: "0.5px solid var(--border)" } }, /* @__PURE__ */ React.createElement(Icon, { name: "key", size: 15 })), /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 500, fontSize: 14.5 } }, c.label)), /* @__PURE__ */ React.createElement("div", { className: "row tight" }, /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only sm", onClick: () => onEdit(c), title: "Editar" }, /* @__PURE__ */ React.createElement(Icon, { name: "edit", size: 13 })), /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only sm", onClick: () => onDelete(c), title: "Eliminar" }, /* @__PURE__ */ React.createElement(Icon, { name: "trash", size: 13 })))), row("Web", c.url, "url"), row("Usuario", c.username, "user"), c.password ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginTop: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 78, fontSize: 12, color: "var(--text-subtle)", flexShrink: 0 } }, "Contrase\xF1a"), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, fontSize: 13.5, fontFamily: "var(--font-mono)", wordBreak: "break-all" } }, show ? c.password : "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"), /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only sm", onClick: () => setShow((s) => !s), title: show ? "Ocultar" : "Mostrar" }, /* @__PURE__ */ React.createElement(Icon, { name: show ? "eye-off" : "eye", size: 13 })), /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only sm", onClick: () => copy(c.password, "pw"), title: "Copiar" }, /* @__PURE__ */ React.createElement(Icon, { name: copied === "pw" ? "check" : "copy", size: 13 }))) : null, c.notes ? /* @__PURE__ */ React.createElement("div", { className: "muted small", style: { marginTop: 10, lineHeight: 1.5 } }, c.notes) : null));
};
const ClientCredentials = ({ session }) => {
  const D = window.Data;
  D.useStore && D.useStore();
  const clientId = session == null ? void 0 : session.clientId;
  const creds = D.CREDENTIALS || [];
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const save = (f) => {
    if (editing) D.updateCredential(editing.id, f);
    else D.addCredential(clientId, f);
    setAdding(false);
    setEditing(null);
  };
  const del = (c) => {
    if (confirm(`\xBFEliminar el acceso "${c.label}"?`)) D.deleteCredential(c.id);
  };
  return /* @__PURE__ */ React.createElement("div", { className: "page" }, /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("div", { className: "row between", style: { alignItems: "flex-start", width: "100%" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", null, "Credenciales"), /* @__PURE__ */ React.createElement("div", { className: "sub" }, "Accesos que compartes con tu agencia. Solo t\xFA y el equipo de 141 pod\xE9is verlos.")), !adding && !editing && /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: () => setAdding(true) }, /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 14 }), " A\xF1adir acceso"))), (adding || editing) && /* @__PURE__ */ React.createElement(CredForm, { initial: editing, onSave: save, onCancel: () => {
    setAdding(false);
    setEditing(null);
  } }), creds.length === 0 && !adding ? /* @__PURE__ */ React.createElement(Empty, { icon: "lock", title: "Sin accesos guardados", sub: "A\xF1ade aqu\xED los accesos (web, hosting, redes, dominio\u2026) que tu agencia necesita para trabajar." }) : /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 } }, creds.map((c) => /* @__PURE__ */ React.createElement(CredCard, { key: c.id, c, onEdit: (x) => {
    setEditing(x);
    setAdding(false);
  }, onDelete: del }))), /* @__PURE__ */ React.createElement(WhatsAppFloat, null));
};
Object.assign(window, { ClientLogin, ClientDashboard, ClientStatus, ClientDocs, ClientCredentials });

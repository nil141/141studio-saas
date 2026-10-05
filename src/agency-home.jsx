// Home v2 — estilo "Kinso": fondo ambiente, saludo, tarjetas por sección y caja Ask
const { useState } = React;

const _HOME_DONE = ["cerrado", "descartado"];
const _homeToday = (D) => D.today ? D.today() : new Date().toISOString().split("T")[0];
const _homeGreet = () => { const h = new Date().getHours(); return h < 12 ? "Buenos días" : h < 20 ? "Buenas tardes" : "Buenas noches"; };
const _HM = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
// Parse "22 oct" / "2026-10-22" → Date (aprox, para ordenar entregas)
const _homeParseDate = (s) => {
  if (!s) return null;
  const t = String(s).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return new Date(t + "T12:00:00");
  const m = t.toLowerCase().match(/^(\d{1,2})\s+([a-záéíóú]{3})/);
  if (m) { const mi = _HM.indexOf(m[2].slice(0, 3)); if (mi >= 0) { const now = new Date(); let y = now.getFullYear(); const d = new Date(y, mi, parseInt(m[1]), 12); if (d < new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2)) d.setFullYear(y + 1); return d; } }
  return null;
};
const _homeFmtDate = (s) => { const d = _homeParseDate(s); return d ? `${d.getDate()} ${_HM[d.getMonth()]}` : (s || ""); };

// Tarjeta tipo Kinso: icono + título + descripción, con chevron que despliega
const HomeCard = ({ icon, color, title, sub, items, onOpen, defaultOpen }) => {
  const [open, setOpen] = useState(!!defaultOpen);
  const expandable = items && items.length > 0;
  return (
    <div className="home-card" onClick={() => expandable ? setOpen(o => !o) : (onOpen && onOpen())}
      style={{ borderRadius: 16, background: "rgba(255,255,255,0.045)", border: "0.5px solid rgba(255,255,255,0.09)",
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", cursor: "pointer", overflow: "hidden",
        transition: "background .15s, transform .22s cubic-bezier(.22,1,.36,1)" }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.065)"}
      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.045)"; e.currentTarget.style.transform = "scale(1)"; }}
      onPointerDown={e => e.currentTarget.style.transform = "scale(0.987)"}
      onPointerUp={e => e.currentTarget.style.transform = "scale(1)"}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 13, padding: "15px 16px" }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
          background: color + "22", color }}>
          <Icon name={icon} size={16} strokeWidth={1.8}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text)", letterSpacing: "-0.2px", marginBottom: 3 }}>{title}</div>
          {sub && <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5,
            display: "-webkit-box", WebkitLineClamp: open ? 10 : 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{sub}</div>}
        </div>
        {expandable && <Icon name="chevron-down" size={15} style={{ color: "var(--text-subtle)", flexShrink: 0, marginTop: 3, transform: open ? "rotate(180deg)" : "none", transition: "transform .18s" }}/>}
      </div>
      {/* Despliegue con animación suave de altura (estilo notificaciones iOS) */}
      <div style={{ display: "grid", gridTemplateRows: (open && expandable) ? "1fr" : "0fr",
        transition: "grid-template-rows .36s cubic-bezier(.22,1,.36,1)" }}>
        <div style={{ overflow: "hidden", minHeight: 0 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ borderTop: "0.5px solid rgba(255,255,255,0.07)", padding: "6px 8px 8px",
              opacity: open ? 1 : 0, transform: open ? "translateY(0)" : "translateY(-6px)",
              transition: "opacity .28s ease .04s, transform .34s cubic-bezier(.22,1,.36,1) .04s" }}>
            {(items || []).map((it, i) => (
              <div key={i} onClick={it.onClick}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 10, cursor: it.onClick ? "pointer" : "default" }}
                onMouseEnter={e => it.onClick && (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                {it.dot && <span style={{ width: 7, height: 7, borderRadius: "50%", background: it.dot, flexShrink: 0 }}/>}
                <span style={{ flex: 1, minWidth: 0, fontSize: 13, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.label}</span>
                {it.right && <span style={{ fontSize: 11.5, color: "var(--text-subtle)", flexShrink: 0, whiteSpace: "nowrap" }}>{it.right}</span>}
              </div>
            ))}
            {onOpen && (
              <div onClick={onOpen} style={{ padding: "9px 10px", fontSize: 12.5, color: "var(--accent)", cursor: "pointer", fontWeight: 500 }}>
                Ver todo →
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AgencyHome = ({ navigate, openModal, session }) => {
  const D = window.Data; D.useStore();
  const today = _homeToday(D);
  const _base = (((session && session.name) || "").trim()) || ((D.SETTINGS && D.SETTINGS.email) || "nil@141agency.com");
  const name = _base.includes("@") ? (() => { const n = _base.split("@")[0]; return n.charAt(0).toUpperCase() + n.slice(1); })() : _base;
  const [ask, setAsk] = useState("");

  // ── Datos ───────────────────────────────────────────────────────────
  const projIds = new Set((D.PROJECTS || []).map(p => p.id));
  const liveTasks = Object.entries(D.TASKS || {})
    .filter(([pid]) => pid === "__none__" || projIds.has(pid))
    .flatMap(([pid, arr]) => (arr || []).map(t => ({ ...t, _pid: pid })));
  const todayTasks = liveTasks.filter(t => t.column !== "done" && t.deadline && t.deadline <= today)
    .sort((a, b) => (a.deadline < b.deadline ? -1 : 1));

  // Proyectos en marcha (no completados), ordenados por entrega
  const projs = (D.PROJECTS || []).map(p => {
    const tks = D.TASKS[p.id] || [];
    const pct = tks.length ? Math.round(tks.filter(t => t.column === "done").length / tks.length * 100) : (p.progress || 0);
    return { ...p, _pct: pct };
  });
  const activeProjs = projs.filter(p => p._pct < 100)
    .sort((a, b) => { const da = _homeParseDate(a.deadline), db = _homeParseDate(b.deadline); if (da && db) return da - db; if (da) return -1; if (db) return 1; return 0; });

  const dueFollowups = (D.OUTREACH || []).filter(o => o.nextFollowup && !_HOME_DONE.includes(o.status) && !o.convertedClientId && o.nextFollowup <= today)
    .sort((a, b) => (a.nextFollowup < b.nextFollowup ? -1 : 1));

  const submitAsk = () => {
    const q = ask.trim();
    try { if (q) sessionStorage.setItem("nora_prefill", q); } catch (_) {}
    navigate("nora");
  };

  const sec = (label, child) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 11.5, color: "var(--text-subtle)", marginBottom: 9, letterSpacing: "0.01em" }}>{label}</div>
      {child}
    </div>
  );

  return (
    <div style={{ position: "relative", minHeight: "100dvh", padding: "0 24px 60px", background: "transparent" }}>
      <div style={{ maxWidth: 620, margin: "0 auto", paddingTop: "15vh" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 27, fontWeight: 400, letterSpacing: "-0.04em", margin: "0 0 26px", color: "var(--text)" }}>
          {_homeGreet()}, {name}.
        </h1>

        {/* Hoy — tareas */}
        {sec("Hoy", todayTasks.length === 0 ? (
          <HomeCard icon="check" color="#34d399" title="Todo hecho por hoy 🎉" sub="No te queda ninguna tarea pendiente para hoy." onOpen={() => navigate("tasks")}/>
        ) : (
          <HomeCard icon="list-todo" color="#9e9ae5"
            title={`Tienes ${todayTasks.length} tarea${todayTasks.length === 1 ? "" : "s"} para hoy`}
            sub={todayTasks.slice(0, 3).map(t => t.title).join(" · ")}
            items={todayTasks.slice(0, 8).map(t => ({ label: t.title, right: t.deadline && t.deadline < today ? "Atrasada" : "Hoy", dot: t.deadline < today ? "var(--red)" : "var(--accent)", onClick: () => navigate("tasks") }))}
            onOpen={() => navigate("tasks")}/>
        ))}

        {/* Entregas — proyectos en marcha */}
        {sec("Entregas próximas", activeProjs.length === 0 ? (
          <HomeCard icon="package" color="#60a5fa" title="Sin entregas pendientes" sub="No tienes proyectos en marcha ahora mismo." onOpen={() => navigate("projects")}/>
        ) : (
          <HomeCard icon="package" color="#60a5fa"
            title={`${activeProjs.length} entrega${activeProjs.length === 1 ? "" : "s"} próxima${activeProjs.length === 1 ? "" : "s"}`}
            sub={activeProjs.slice(0, 2).map(p => `${p.clientName && !["—","-","Interno"].includes((p.clientName||"").trim()) ? p.clientName + " | " : ""}${p.name}`).join("  ·  ")}
            items={activeProjs.slice(0, 8).map(p => ({ label: `${p.clientName && !["—","-","Interno"].includes((p.clientName||"").trim()) ? p.clientName + " | " : ""}${p.name}`, right: _homeFmtDate(p.deadline), onClick: () => navigate("project", { projectId: p.id }) }))}
            onOpen={() => navigate("projects")}/>
        ))}

        {/* Seguimientos — outreach de hoy */}
        {sec("Seguimientos", dueFollowups.length === 0 ? (
          <HomeCard icon="send" color="#e2b45c" title="Sin seguimientos para hoy" sub="No tienes seguimientos de outreach que vencen hoy." onOpen={() => navigate("outreach")}/>
        ) : (
          <HomeCard icon="send" color="#e2b45c"
            title={`${dueFollowups.length} seguimiento${dueFollowups.length === 1 ? "" : "s"} para hoy`}
            sub={dueFollowups.slice(0, 3).map(o => o.brand).join(" · ")}
            items={dueFollowups.slice(0, 8).map(o => ({ label: o.brand, right: o.nextFollowup < today ? "Atrasado" : "Hoy", dot: o.nextFollowup < today ? "var(--red)" : "var(--amber)", onClick: () => navigate("outreach") }))}
            onOpen={() => navigate("outreach")}/>
        ))}

        {/* Caja Ask (Nora) */}
        <div style={{ marginTop: 26, borderRadius: 16, background: "rgba(0,0,0,0.35)", border: "0.5px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", padding: "14px 16px" }}>
          <input value={ask} onChange={e => setAsk(e.target.value)} onKeyDown={e => { if (e.key === "Enter") submitAsk(); }}
            placeholder="Pregúntale a Nora…"
            style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: "var(--text)", fontSize: 14, fontFamily: "inherit" }}/>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
            <span style={{ fontSize: 13, color: "var(--text-subtle)" }}>@</span>
            <button onClick={submitAsk} title="Preguntar a Nora"
              style={{ width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                background: ask.trim() ? "var(--accent)" : "rgba(255,255,255,0.1)", color: ask.trim() ? "#0a0a0a" : "var(--text-subtle)", border: "none", transition: "background .15s" }}>
              <Icon name="arrow-up" size={15}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

window.AgencyHome = AgencyHome;

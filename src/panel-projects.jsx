// Panel · Proyectos (Figma 141:27) y detalle de proyecto (165:2).
// Datos: proyectos, sus tareas y fases (campo service), entrega, cobros,
// carpeta de Drive / tablero de Figma — igual que la página anterior.
(() => {
const { useState, useEffect, useRef } = React;
const PN = window.PN;

PIcon.add({
  "chev6":  [16, `<path d="M6 4L10 8L6 12" stroke="currentColor" stroke-width="1.13333" stroke-linecap="round" stroke-linejoin="round"/>`],
  "check18":[18, `<path d="M4.5 9.375L7.5 12.375L13.5 5.625" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"/>`],
  "box28":  [28, `<path d="M14 3.5L4.66663 8.75V19.25L14 24.5L23.3333 19.25V8.75L14 3.5Z" stroke="currentColor" stroke-width="1.86667" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.66663 8.75L14 14M14 14L23.3333 8.75M14 14V24.5" stroke="currentColor" stroke-width="1.86667" stroke-linecap="round" stroke-linejoin="round"/>`],
  "link15": [15, `<path d="M6.25002 8.75002C6.48265 8.98624 6.75993 9.17382 7.06573 9.30186C7.37153 9.4299 7.69975 9.49584 8.03128 9.49584C8.3628 9.49584 8.69102 9.4299 8.99682 9.30186C9.30262 9.17382 9.5799 8.98624 9.81252 8.75002L11.6875 6.87502C12.1599 6.40261 12.4253 5.76187 12.4253 5.09377C12.4253 4.42568 12.1599 3.78494 11.6875 3.31252C11.2151 2.84011 10.5744 2.57471 9.90628 2.57471C9.23818 2.57471 8.59744 2.84011 8.12502 3.31252L7.50002 3.93752M8.75002 6.25002C8.5174 6.01381 8.24012 5.82623 7.93432 5.69819C7.62852 5.57014 7.3003 5.5042 6.96877 5.5042C6.63725 5.5042 6.30903 5.57014 6.00323 5.69819C5.69743 5.82623 5.42015 6.01381 5.18752 6.25002L3.31252 8.12502C2.84011 8.59744 2.57471 9.23818 2.57471 9.90628C2.57471 10.5744 2.84011 11.2151 3.31252 11.6875C3.78494 12.1599 4.42568 12.4253 5.09377 12.4253C5.76187 12.4253 6.40261 12.1599 6.87502 11.6875L7.50002 11.0625" stroke="currentColor" stroke-width="1.0625" stroke-linecap="round" stroke-linejoin="round"/>`],
  "more15": [15, `<path d="M3.75 7.5H3.75625M7.5 7.5H7.50625M11.25 7.5H11.2563" stroke="currentColor" stroke-width="1.0625" stroke-linecap="round" stroke-linejoin="round"/>`],
  "plus15": [15, `<path d="M7.5 3.125V11.875M3.125 7.5H11.875" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>`],
});

const _MES = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
const _noClient = (s) => !s || ["—", "-", "Interno"].includes(String(s).trim());
const _toYMD = (d) => {
  if (!d) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(d)) return String(d).slice(0, 10);
  const m = String(d).toLowerCase().match(/(\d{1,2})\s+([a-záéíóú]{3})(?:\s+(\d{4}))?/);
  if (!m) return null;
  const mi = _MES.indexOf(m[2].slice(0, 3)); if (mi < 0) return null;
  return `${m[3] || new Date().getFullYear()}-${String(mi + 1).padStart(2, "0")}-${m[1].padStart(2, "0")}`;
};
const _lc = (s) => s ? s.charAt(0).toLowerCase() + s.slice(1) : s;
const _phases = (p) => (p.service || "").split(",").map(s => s.trim()).filter(n => n && n !== "libre" && n !== "—");

// Resumen de un proyecto: progreso, siguiente tarea, riesgo
const summarize = (D, p) => {
  const tasks = (D.TASKS && D.TASKS[p.id]) || [];
  const done = tasks.filter(t => t.column === "done").length;
  const pct = tasks.length ? Math.round(done / tasks.length * 100) : (p.progress || 0);
  const pending = tasks.filter(t => t.column !== "done")
    .sort((a, b) => ((a.deadline || "9") < (b.deadline || "9") ? -1 : (a.deadline || "9") > (b.deadline || "9") ? 1 : 0));
  const next = pending[0] || null;
  const dl = p.recurring ? null : _toYMD(p.deadline);
  const days = dl ? PN.dayDiff(dl) : null;
  const complete = tasks.length ? done === tasks.length : pct >= 100;
  let risk = null;
  if (!complete) {
    if (!tasks.length) risk = "Sin tareas creadas todavía";
    else if (days !== null && days < 0) risk = `Entrega vencida ${PN.relDay(dl)}`;
  }
  return { tasks, done, pct, pending, next, dl, days, complete, risk };
};
const clientOf = (D, p) => (p.clientId ? (D.CLIENTS || []).find(c => c.id === p.clientId) : null);

// ── Lista de proyectos ────────────────────────────────────────────────
const PanelProjects = ({ navigate, openModal }) => {
  const D = window.Data; D.useStore();
  const [filter, setFilter] = useState("all");
  const [doneOpen, setDoneOpen] = useState(false);
  const projs = (D.PROJECTS || []).map(p => ({ p, s: summarize(D, p), c: clientOf(D, p) }));
  // Filtros: sector del cliente (si los clientes lo tienen) o tipo de proyecto
  const sectorOf = (x) => { const v = String((x.c && (x.c.sector || x.c.service)) || "").trim(); return v === "—" ? "" : v; };
  const sectors = Array.from(new Set(projs.map(sectorOf).filter(Boolean))).slice(0, 5);
  const chips = sectors.length ? sectors.map(s => [s, s]) : [["__p", "Puntuales"], ["__r", "Recurrentes"]];
  const pass = (x) => filter === "all" || (filter === "__p" ? !x.p.recurring : filter === "__r" ? !!x.p.recurring : sectorOf(x) === filter);
  const list = projs.filter(pass);
  const live = list.filter(x => !x.s.complete).sort((a, b) => ((a.s.dl || "9") < (b.s.dl || "9") ? -1 : 1));
  const done = list.filter(x => x.s.complete);
  const nLive = projs.filter(x => !x.s.complete).length;
  const who = (x) => _noClient(x.p.clientName) ? "" : x.p.clientName;
  // Iniciales: la marca del nombre ("Diseño web OSB" → OS) o, si no, el cliente
  const brandOf = (x) => { const w = String(x.p.name || "").trim().split(/\s+/); return w.length > 2 ? w.slice(2).join(" ") : (who(x) || x.p.name); };

  const Row = (x, extra) => (
    <button key={x.p.id} className="pn-proj" onClick={() => navigate("project", { projectId: x.p.id })}>
      <span className="ini">{x.s.complete ? <PIcon name="check18"/> : PN.initials(brandOf(x))}</span>
      <div className="txt">
        <div className="top">
          <p className="nm">{x.p.name}</p>
          {who(x) && <p className="t-small cl">{who(x)}</p>}
          <span style={{ flex: 1 }}/>
          {x.s.risk ? <span className="t-caption rk">Zona de riesgo</span>
            : <span className="t-caption ct">{x.s.done} de {x.s.tasks.length} tareas</span>}
        </div>
        <div className="bot">
          {extra ? <span className="t-caption nx">{extra}</span> : (
            <>
              <span className="bar"><i style={{ width: `${Math.min(100, x.s.pct)}%` }}/></span>
              {x.s.risk ? <span className="t-caption nx rk">{x.s.risk}</span>
                : <span className="t-caption nx">{x.s.next ? `Siguiente: ${_lc(x.s.next.title)}` : x.p.recurring ? "Proyecto mensual" : "Todo al día"}</span>}
            </>
          )}
        </div>
      </div>
      <span className="go"><PIcon name="chev6"/></span>
    </button>
  );

  return (
    <div className="pn-stage">
      <div className="pn-col">
        <div className="pn-head">
          <p className="t-small" style={{ color: "var(--gray-400)", lineHeight: "20px" }}>{PN.longDate(new Date())} · {nLive} en curso</p>
          <h1 className="t-h2" style={{ margin: "10px 0 0", color: "var(--ink-900)" }}>Proyectos en curso</h1>
          <div className="pn-chans">
            <button className={"pn-chan all" + (filter === "all" ? " on" : "")} onClick={() => setFilter("all")}>Todos</button>
            {chips.map(([k, l]) => <button key={k} className={"pn-chan all" + (filter === k ? " on" : "")} onClick={() => setFilter(k)}>{l}</button>)}
          </div>
        </div>
        <PN.ScrollArea top={257} bottom={229}>
          <div className="pn-inbox">
            {projs.length === 0 && (
              <div className="pn-empty">
                <p className="t-title-m" style={{ color: "var(--ink-900)" }}>Aún no hay proyectos</p>
                <p className="t-small" style={{ color: "var(--gray-300)" }}>Crea el primero con «Nuevo proyecto».</p>
              </div>
            )}
            {live.length > 0 && <><p className="t-small pn-isec pj">En curso</p><div className="pn-list">{live.map(x => Row(x))}</div></>}
            {done.length > 0 && (
              <>
                <p className="t-small pn-isec pj" style={{ marginTop: live.length ? 24 : 0 }}>Completados</p>
                {done.length === 1 || doneOpen ? (
                  <div className="pn-list">
                    {done.map(x => Row(x, `${x.s.tasks.length} tareas hechas`))}
                    {doneOpen && <div style={{ display: "flex", justifyContent: "center" }}><PN.Pill onClick={() => setDoneOpen(false)}>Mostrar menos</PN.Pill></div>}
                  </div>
                ) : (
                  <div className="pn-stack" onClickCapture={e => { e.stopPropagation(); e.preventDefault(); setDoneOpen(true); }}>
                    {Row(done[0], `También: ${PN.listMore(done.slice(1, 3).map(x => x.p.name + (who(x) ? " · " + who(x) : "")), done.length - 1)}`)}
                    <div className="pn-layers"><i/><i/></div>
                  </div>
                )}
              </>
            )}
          </div>
        </PN.ScrollArea>
        <PN.NoraBox navigate={navigate} placeholder="Crea un proyecto o pregúntale a Nora…"
          suggestions={["Nuevo proyecto", "¿Qué proyectos van con retraso?", "Resumen para el cliente"]}
          onSubmit={(t) => {
            if (t === "Nuevo proyecto") return openModal("newProject");
            const q = t === "¿Qué proyectos van con retraso?" ? "¿Qué proyectos van con retraso y qué les falta?"
              : t === "Resumen para el cliente" ? "Redacta un resumen del estado de mis proyectos para enviar a cada cliente" : (t || "Ayúdame con mis proyectos");
            try { sessionStorage.setItem("nora_prefill", q); } catch (_) {}
            navigate("nora");
          }}/>
      </div>
    </div>
  );
};

// ── Detalle de proyecto ───────────────────────────────────────────────
const PanelProject = ({ projectId, navigate, openModal }) => {
  const D = window.Data; D.useStore();
  const toast = (typeof useToast === "function") ? useToast() : null;
  const confirm = window.useConfirm ? window.useConfirm() : null;
  const p = (D.PROJECTS || []).find(x => x.id === projectId) || (D.PROJECTS || [])[0];
  const [tab, setTab] = useState("tasks");
  const [showDone, setShowDone] = useState(false);
  const [menu, setMenu] = useState(null);        // "link" | "more"
  const [editOpen, setEditOpen] = useState(false);
  const [taskModal, setTaskModal] = useState(null);
  const [notes, setNotes] = useState(p ? (p.description || "") : "");
  const [driveDraft, setDriveDraft] = useState(null);
  const boxRef = useRef(null);
  useEffect(() => { setNotes(p ? (p.description || "") : ""); setTab("tasks"); setShowDone(false); }, [p && p.id]);
  useEffect(() => {
    if (!menu) return;
    const c = () => setMenu(null);
    window.addEventListener("click", c);
    return () => window.removeEventListener("click", c);
  }, [menu]);

  if (!p) {
    return (
      <div className="pn-stage"><div className="pn-col"><div className="pn-head">
        <button className="pn-back t-small" onClick={() => navigate("projects")}><PIcon name="back"/><span>Proyectos</span></button>
        <div className="pn-empty" style={{ marginTop: 24 }}><p className="t-title-m" style={{ color: "var(--ink-900)" }}>No encuentro este proyecto</p></div>
      </div></div></div>
    );
  }

  const s = summarize(D, p);
  const c = clientOf(D, p);
  const phases = _phases(p);
  const phaseIdx = (() => {
    const i = phases.findIndex(ph => !(p.phasesDone || []).includes(ph) && (s.tasks.some(t => t.phase === ph && t.column !== "done") || !s.tasks.some(t => t.phase === ph)));
    return i < 0 ? phases.length - 1 : i;
  })();
  const firstName = c ? String(c.name || "").split(/\s+/)[0] : (_noClient(p.clientName) ? "" : String(p.clientName).split(/\s+/)[0]);
  const subLine = [_noClient(p.clientName) ? null : p.clientName, (p.description || "").split("\n")[0]].filter(Boolean).join(" · ");
  const dlDate = PN.parseYmd(s.dl);
  const whenTxt = p.recurring ? "Mensual" : dlDate ? `${PN.cap(PN.DIAS_C[dlDate.getDay()])} ${dlDate.getDate()} ${_MES[dlDate.getMonth()]}` : "Sin fecha";
  const relTxt = s.days === null ? "" : s.days === 0 ? "hoy" : s.days === 1 ? "mañana" : s.days > 1 ? `en ${s.days} días` : s.days === -1 ? "hace 1 día" : `hace ${-s.days} días`;
  const urgent = s.days !== null && s.days <= 3 && !s.complete;

  const r = 26.32, circ = 2 * Math.PI * r;
  const driveUrl = p.driveUrl || (() => { try { return localStorage.getItem("proj_drive_" + p.id) || ""; } catch (_) { return ""; } })();
  const pending = s.pending;
  const doneTasks = s.tasks.filter(t => t.column === "done");
  const taskSub = (t) => [t.phase, t.notes ? String(t.notes).split("\n")[0] : null].filter(Boolean).join(" · ") || (t.column === "doing" ? "En curso" : t.column === "review" ? "En revisión" : "Por hacer");
  const taskWhen = (t) => { const n = PN.dayDiff(t.deadline); if (n === null) return ""; return n < 0 ? `Venció ${PN.relDay(t.deadline)}` : PN.cap(PN.shortDay(t.deadline)); };

  const removeProject = async () => {
    const ok = confirm ? await confirm({ title: `¿Eliminar el proyecto "${p.name}"?`, body: "Se eliminarán también sus tareas y entregables. Esta acción no se puede deshacer.", confirmLabel: "Sí, eliminar", danger: true }) : false;
    if (ok) { D.deleteProject(p.id); toast && toast("Proyecto eliminado", "success"); navigate("projects"); }
  };
  const previewPortal = () => {
    if (!p.clientId) return;
    try { sessionStorage.setItem("141_preview_client", p.clientId); } catch (_) {}
    navigate("__switch");
  };
  const copy = (txt, msg) => { try { navigator.clipboard.writeText(txt); toast && toast(msg || "Enlace copiado", "success"); } catch (_) { toast && toast("No se pudo copiar", "error"); } };
  const addTask = (text) => {
    const t = (text || "").trim(); if (!t) return;
    D.addTask({ projectId: p.id, title: t, column: "todo", phase: phases[phaseIdx] || null });
    toast && toast("Tarea añadida", "success");
  };
  const ask = (q) => { try { sessionStorage.setItem("nora_prefill", q); } catch (_) {} navigate("nora"); };

  // Mensajes del cliente (WhatsApp / correo) para la pestaña Mensajes
  const K = window.PNInboxKit || {};
  const waMsgs = c ? (D.WHATSAPP || []).filter(m => K.waMatch && K.waMatch(c.whatsapp || c.phone, m.waId)).sort((a, b) => (a.ts < b.ts ? -1 : 1)) : [];

  const TaskRow = (t) => {
    const isDone = t.column === "done";
    const late = !isDone && t.deadline && PN.dayDiff(t.deadline) < 0;
    return (
      <div key={t.id} className={"pn-ptask" + (isDone ? " done" : "")} role="button" onClick={() => setTaskModal(t)}>
        <button className="chk" aria-label={isDone ? "Marcar como pendiente" : "Marcar como hecha"}
          onClick={e => { e.stopPropagation(); D.moveTask(p.id, t.id, isDone ? "todo" : "done"); }}>
          {isDone && <PIcon name="check18" size={14}/>}
        </button>
        <div className="txt"><p className="tt">{t.title}</p><p className="t-caption sb">{taskSub(t)}</p></div>
        {late && <span className="t-caption tag">Atrasada</span>}
        <span className="t-caption wh">{taskWhen(t)}</span>
      </div>
    );
  };

  const TABS = [["tasks", "Tareas"], ["files", "Archivos"], ["msgs", "Mensajes"], ["notes", "Notas"], ["pay", "Facturación"]];
  const Body = () => {
    if (tab === "tasks") return (
      <>
        <p className="t-small pn-isec pj">Pendientes · {pending.length}</p>
        <div className="pn-plist">
          {pending.length === 0 && <p className="t-small" style={{ color: "var(--gray-300)", padding: "4px 2px" }}>No quedan tareas pendientes. Añade una abajo.</p>}
          {pending.map(TaskRow)}
          {showDone && doneTasks.map(TaskRow)}
        </div>
        {doneTasks.length > 0 && (
          <button className="pn-more-done" onClick={() => setShowDone(v => !v)}>
            {showDone ? "Ocultar tareas completadas" : `Ver ${doneTasks.length} tarea${doneTasks.length === 1 ? "" : "s"} completada${doneTasks.length === 1 ? "" : "s"}`}
          </button>
        )}
      </>
    );
    if (tab === "files") return (
      <div className="pn-list">
        <div className="pn-filecard">
          <span className="ini"><PIcon name="folder"/></span>
          <div className="txt">
            <p className="tt">Carpeta de Drive</p>
            {driveDraft !== null ? (
              <input className="pn-inline" autoFocus value={driveDraft} placeholder="Pega el enlace de la carpeta…" onChange={e => setDriveDraft(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { D.updateProject(p.id, { driveUrl: driveDraft.trim() }); try { localStorage.removeItem("proj_drive_" + p.id); } catch (_) {} setDriveDraft(null); } if (e.key === "Escape") setDriveDraft(null); }}/>
            ) : <p className="t-caption sb">{driveUrl || (D.driveConfigured ? "Aún no hay carpeta. Puedes crearla en Drive o pegar un enlace." : "Pega el enlace de la carpeta para compartirla con el cliente.")}</p>}
          </div>
          {driveUrl && driveDraft === null && <><PN.Pill onClick={() => window.open(driveUrl, "_blank", "noopener")}>Abrir</PN.Pill><PN.Pill onClick={() => copy(driveUrl, "Enlace copiado para el cliente")}>Copiar enlace</PN.Pill></>}
          {!driveUrl && driveDraft === null && D.driveConfigured && <PN.Pill onClick={() => { D.driveCreateFolderForProject(p.id); toast && toast("Creando carpeta en Drive…", "success"); }}>Crear en Drive</PN.Pill>}
          {driveDraft === null && <PN.Pill onClick={() => setDriveDraft(driveUrl || "")}>{driveUrl ? "Cambiar" : "Pegar enlace"}</PN.Pill>}
        </div>
        <div className="pn-filecard">
          <span className="ini"><PIcon name="apps"/></span>
          <div className="txt"><p className="tt">Diseño en Figma</p><p className="t-caption sb">{p.figmaUrl || "Sin enlace de Figma todavía. Añádelo desde «Editar proyecto»."}</p></div>
          {p.figmaUrl && <PN.Pill onClick={() => window.open(p.figmaUrl, "_blank", "noopener")}>Abrir</PN.Pill>}
        </div>
      </div>
    );
    if (tab === "msgs") return (
      <div className="pn-list">
        {!c && <p className="t-small" style={{ color: "var(--gray-300)" }}>Este proyecto no tiene cliente asignado.</p>}
        {c && waMsgs.length === 0 && <p className="t-small" style={{ color: "var(--gray-300)" }}>Aún no hay mensajes de WhatsApp con {c.company || c.name}.</p>}
        {waMsgs.slice(-4).map(m => (
          <div key={m.id} className={"pn-msg" + (m.direction === "out" ? " out" : "")}>
            <div className="bub"><p className="t-small bd">{m.body}</p><p className="t-caption tm">{PN.ago(m.ts)}</p></div>
          </div>
        ))}
        {c && <div><PN.Pill onClick={() => navigate("unibox", waMsgs.length ? { open: "wa:" + waMsgs[0].waId } : {})}>Abrir en la Bandeja</PN.Pill></div>}
      </div>
    );
    if (tab === "notes") return (
      <div className="pn-notes">
        <textarea value={notes} onChange={e => setNotes(e.target.value)} onBlur={() => { if ((p.description || "") !== notes) { D.updateProject(p.id, { description: notes }); toast && toast("Notas guardadas", "success"); } }}
          placeholder="Notas internas del proyecto (solo las ves tú)…"/>
      </div>
    );
    if (tab === "pay") return window.ProjectPayments ? <div className="pn-legacy-block"><window.ProjectPayments project={p}/></div> : null;
    return null;
  };

  return (
    <div className="pn-stage">
      <div className="pn-col">
        <div className="pn-head">
          <button className="pn-back t-small" onClick={() => navigate("projects")}><PIcon name="back"/><span>Proyectos</span></button>
          <div className="pn-phead">
            <span className="ico"><PIcon name="box28"/></span>
            <div className="nm">
              <h1 className="t-h2">{p.name}</h1>
              {subLine && <p className="t-small sb">{subLine}</p>}
            </div>
            <div style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
              <button className="pn-rbtn" aria-label="Enlaces" onClick={() => setMenu(m => (m === "link" ? null : "link"))}><PIcon name="link15"/></button>
              {menu === "link" && (
                <div className="pn-menu" style={{ position: "absolute", right: 0, top: 40, minWidth: 230 }}>
                  {p.clientId && <button className="pn-menu-item t-small" onClick={() => { setMenu(null); previewPortal(); }}>Ver el portal del cliente</button>}
                  {driveUrl && <button className="pn-menu-item t-small" onClick={() => { setMenu(null); copy(driveUrl, "Enlace de Drive copiado"); }}>Copiar enlace de Drive</button>}
                  {p.figmaUrl && <button className="pn-menu-item t-small" onClick={() => { setMenu(null); window.open(p.figmaUrl, "_blank", "noopener"); }}>Abrir Figma</button>}
                  {!p.clientId && !driveUrl && !p.figmaUrl && <p className="t-small" style={{ color: "var(--gray-300)", padding: "8px 10px" }}>Sin enlaces todavía</p>}
                </div>
              )}
            </div>
            <div style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
              <button className="pn-rbtn" aria-label="Más opciones" onClick={() => setMenu(m => (m === "more" ? null : "more"))}><PIcon name="more15"/></button>
              {menu === "more" && (
                <div className="pn-menu" style={{ position: "absolute", right: 0, top: 40, minWidth: 200 }}>
                  <button className="pn-menu-item t-small" onClick={() => { setMenu(null); setEditOpen(true); }}>Editar proyecto</button>
                  {c && <button className="pn-menu-item t-small" onClick={() => { setMenu(null); navigate("clientDetail", { clientId: c.id }); }}>Ver cliente</button>}
                  <button className="pn-menu-item t-small danger" onClick={() => { setMenu(null); removeProject(); }}>Eliminar proyecto</button>
                </div>
              )}
            </div>
            <button className="pn-wbtn" onClick={() => { setTab("tasks"); setTimeout(() => { const i = document.querySelector(".pn-nora-box input"); i && i.focus(); }, 0); }}>
              <PIcon name="plus15"/><span>Tarea</span>
            </button>
          </div>
          <div className="pn-pcard">
            <span className="ring">
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <circle cx="28" cy="28" r={r} stroke="#2B2B2B" strokeWidth="3.36"/>
                {s.pct > 0 && <circle cx="28" cy="28" r={r} stroke="#F5F5F5" strokeWidth="3.36" strokeDasharray={`${(s.pct / 100) * circ} ${circ}`} transform="rotate(-90 28 28)"/>}
              </svg>
              <span className="v">{s.pct}%</span>
            </span>
            <div className="txt">
              <p className="tt">{phases.length ? `Fase ${phaseIdx + 1} de ${phases.length} · ${phases[phaseIdx]}` : s.complete ? "Proyecto completado" : "Progreso del proyecto"}</p>
              <p className="t-small sb">{s.done} de {s.tasks.length} tareas hechas{s.next ? ` · Siguiente: ${_lc(s.next.title)}` : ""}</p>
            </div>
            <i className="div"/>
            <div className="dl">
              <p className="t-caption l">Entrega</p>
              <p className="d">{whenTxt}</p>
              {relTxt && <p className={"t-caption r" + (urgent ? " red" : "")}>{relTxt}</p>}
            </div>
          </div>
          <div className="pn-chans pn-ptabs">
            {TABS.map(([k, l]) => <button key={k} className={"pn-chan all" + (tab === k ? " on" : "")} onClick={() => setTab(k)}>{l}</button>)}
          </div>
        </div>
        <PN.ScrollArea top={390} bottom={229}>
          <div className="pn-pbody">{Body()}</div>
        </PN.ScrollArea>
        <PN.NoraBox navigate={navigate} placeholder="Añade una tarea o pregúntale a Nora…"
          suggestions={["Nueva tarea", firstName ? `Enviar avance a ${firstName}` : "Enviar avance al cliente", "¿Qué falta para entregar?"]}
          onSubmit={(t) => {
            if (t === "Nueva tarea") { const i = document.querySelector(".pn-nora-box input"); i && i.focus(); return; }
            if (/^Enviar avance/.test(t)) return ask(`Redacta un mensaje de avance para ${c ? (c.company || c.name) : "el cliente"} sobre «${p.name}»: ${s.pct}% hecho${s.next ? ", siguiente: " + s.next.title : ""}.`);
            if (t === "¿Qué falta para entregar?") return ask(`¿Qué falta para entregar «${p.name}»? Quedan: ${pending.map(x => x.title).slice(0, 12).join(", ") || "nada"}.`);
            addTask(t);
          }}/>
      </div>
      {editOpen && window.EditProjectModal && <window.EditProjectModal project={p} onClose={() => setEditOpen(false)}/>}
      {taskModal && window.TaskProgressModal && (
        <window.TaskProgressModal task={(D.TASKS[p.id] || []).find(t => t.id === taskModal.id) || taskModal} projectId={p.id} open={true}
          onClose={() => setTaskModal(null)}
          onDelete={() => { D.deleteTask(p.id, taskModal.id); setTaskModal(null); }}
          onUpdate={ch => D.updateTask(p.id, taskModal.id, ch)}
          onEdit={() => openModal("editTask", { task: taskModal, pid: p.id })}/>
      )}
    </div>
  );
};

window.PanelProjects = PanelProjects;
window.PanelProject = PanelProject;
})();

// Panel interno — shell (menú lateral, acciones, columna) y componentes
// compartidos del rediseño (Figma "App · Panel"). Solo para la agencia:
// el portal de cliente sigue usando Sidebar/primitives sin cambios.
(() => {
const { useState, useEffect, useRef, useLayoutEffect } = React;

// ── Utilidades de texto/fecha ─────────────────────────────────────────
const _MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const _DIAS = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
const _DIAS_C = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parseYmd = (s) => (s && /^\d{4}-\d{2}-\d{2}/.test(s)) ? new Date(s.slice(0, 10) + "T12:00:00") : null;
const longDate = (d = new Date()) => `${cap(_DIAS[d.getDay()])}, ${d.getDate()} de ${_MESES[d.getMonth()]}`;
const greet = (d = new Date()) => { const h = d.getHours(); return h < 12 ? "Buenos días" : h < 20 ? "Buenas tardes" : "Buenas noches"; };
const dayDiff = (s) => { const d = parseYmd(s); if (!d) return null; const t = new Date(); t.setHours(12, 0, 0, 0); return Math.round((d - t) / 86400000); };
// "Hoy" · "Mañana" · "Lun 27" (para la esquina de los avisos)
const shortDay = (s) => { const n = dayDiff(s); if (n === null) return ""; if (n === 0) return "Hoy"; if (n === 1) return "Mañana"; const d = parseYmd(s); return `${_DIAS_C[d.getDay()]} ${d.getDate()}`; };
// "hoy" · "mañana" · "el lunes" · "el 3 de noviembre"
const relDay = (s) => { const n = dayDiff(s); if (n === null) return ""; if (n === 0) return "hoy"; if (n === 1) return "mañana"; if (n === -1) return "ayer"; const d = parseYmd(s); if (n > 1 && n < 7) return "el " + _DIAS[d.getDay()]; return `el ${d.getDate()} de ${_MESES[d.getMonth()]}`; };
const ago = (iso) => {
  if (!iso) return "";
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "Ahora";
  const m = Math.floor(s / 60); if (m < 60) return `Hace ${m} min`;
  const h = Math.floor(m / 60); if (h < 24) return `Hace ${h} h`;
  const d = new Date(iso); return `${d.getDate()} ${_MESES[d.getMonth()].slice(0, 3)}`;
};
// Iniciales: "Nuria Blazmir" → NB · "Slowdeco" → SL · "Nil 141′" → N1
const initials = (name) => {
  const w = String(name || "").replace(/[^\p{L}\p{N}\s]/gu, " ").trim().split(/\s+/).filter(Boolean);
  if (!w.length) return "·";
  if (w.length === 1) return w[0].slice(0, 2).toUpperCase();
  return (w[0][0] + w[1][0]).toUpperCase();
};
// "A, B y N más" / "A y B"
const listMore = (names, total) => {
  const n = names.filter(Boolean);
  const rest = (total || n.length) - n.length;
  if (rest > 0) return `${n.join(", ")} y ${rest} más`;
  if (n.length <= 1) return n.join("");
  return `${n.slice(0, -1).join(", ")} y ${n[n.length - 1]}`;
};

// ── Tooltip flotante del menú ─────────────────────────────────────────
const _tip = { set: null };
const Tip = () => {
  const [t, setT] = useState(null);
  useEffect(() => { _tip.set = setT; return () => { _tip.set = null; }; }, []);
  return t ? ReactDOM.createPortal(<div className="pn-tip" style={{ left: t.x, top: t.y }}>{t.label}</div>, document.body) : null;
};
const tipOn = (e, label) => { if (!_tip.set || !label) return; const r = e.currentTarget.getBoundingClientRect(); _tip.set({ label, x: 68, y: r.top + r.height / 2 - 1.5 }); };
const tipOff = () => _tip.set && _tip.set(null);

// ── Menú lateral ──────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard", icon: "home", label: "Inicio" },
  { id: "tasks", icon: "tasks", label: "Tareas" },
  { id: "agenda", icon: "calendar", label: "Calendario" },
  { id: "unibox", icon: "inbox", label: "Bandeja" },
];
const MORE = [
  { id: "projects", icon: "folder", label: "Proyectos" },
  { id: "clients", icon: "users", label: "Clientes" },
];
// Herramientas que no tienen sitio propio en el menú nuevo (botón "Apps")
const APPS = [
  { id: "outreach", label: "Propuestas Outreach" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "resources", label: "Recursos" },
  { id: "calculator", label: "Calculadora" },
  { id: "billing", label: "Gastos" },
  { id: "income", label: "Facturación", href: "https://afinity.geyce.es/Usuario/Login?ReturnUrl=%2faplicaciones" },
  { id: "coldemail", label: "Cold email", href: "https://email.141agency.com/" },
];
const _navOf = (v) => v === "project" ? "projects" : v === "clientDetail" ? "clients" : v === "notifications" ? "unibox" : v === "nora" ? "dashboard" : v;

const Rail = ({ view, navigate, session }) => {
  const D = window.Data;
  const cur = _navOf(view.name);
  const inMore = MORE.some(m => m.id === cur) || APPS.some(a => a.id === cur);
  const [hov, setHov] = useState(false);
  const [apps, setApps] = useState(false);
  const open = hov || inMore || apps;
  useEffect(() => {
    if (!apps) return;
    const c = () => setApps(false);
    window.addEventListener("click", c);
    return () => window.removeEventListener("click", c);
  }, [apps]);

  const me = (session && session.name) || "";
  // Espacio de trabajo: proyectos en desarrollo activo (inicial del cliente)
  const active = (D.PROJECTS || []).filter(p => {
    const tks = (D.TASKS && D.TASKS[p.id]) || [];
    const pct = tks.length ? Math.round(tks.filter(t => t.column === "done").length / tks.length * 100) : (p.progress || 0);
    return pct < 100;
  }).slice(0, 3);
  // Espacio activo: el proyecto abierto o, si no, el último que abriste
  const curProject = view.name === "project" ? view.params.projectId : (() => { try { return localStorage.getItem("pn_last_project"); } catch (_) { return null; } })();
  useEffect(() => { if (view.name === "project" && view.params.projectId) { try { localStorage.setItem("pn_last_project", view.params.projectId); } catch (_) {} } }, [view.name, view.params && view.params.projectId]);

  const Item = ({ it, sub }) => (
    <button className={"pn-nav" + (sub ? " sub" : "") + (cur === it.id ? " on" : "")} aria-label={it.label}
      onMouseEnter={e => tipOn(e, it.label)} onMouseLeave={tipOff}
      onClick={() => { tipOff(); navigate(it.id); }}>
      <PIcon name={it.icon}/>
    </button>
  );

  return (
    <nav className="pn-rail">
      <button className={"pn-avatar" + (view.name === "settings" ? " on" : "")} aria-label="Perfil" onMouseEnter={e => tipOn(e, "Perfil")} onMouseLeave={tipOff}
        onClick={() => { tipOff(); navigate("settings"); }}>{initials(me) || "·"}</button>
      <div className="pn-rail-gap" style={{ height: 36 }}/>
      {NAV.map(it => <Item key={it.id} it={it}/>)}
      <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <button className={"pn-nav" + (open && !inMore ? " on" : "")} aria-label="Más" onClick={() => setHov(v => !v)}>
          <PIcon name="more"/>
        </button>
        <div className={"pn-more-sub" + (open ? " open" : "")} style={{ marginTop: open ? 0 : -6 }}>
          <div>
            {MORE.map(it => <Item key={it.id} it={it} sub/>)}
            <div style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
              <button className={"pn-nav sub" + (APPS.some(a => a.id === cur) || apps ? " on" : "")} aria-label="Apps"
                onMouseEnter={e => tipOn(e, "Apps")} onMouseLeave={tipOff}
                onClick={() => { tipOff(); setApps(v => !v); }}>
                <PIcon name="apps"/>
              </button>
              {apps && (
                <div className="pn-menu" style={{ position: "absolute", left: 50, top: -4, minWidth: 210 }}>
                  {APPS.map(a => (
                    <button key={a.id} className="pn-menu-item" onClick={() => { setApps(false); if (a.href) window.open(a.href, "_blank", "noopener"); else navigate(a.id); }}>
                      <span className="t-small">{a.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="pn-rail-gap" style={{ height: 18 }}/>
      <div className="pn-sep"/>
      <div className="pn-rail-gap" style={{ height: 18 }}/>
      {active.map(p => {
        const label = p.clientName && !["—", "-", "Interno"].includes((p.clientName || "").trim()) ? p.clientName : p.name;
        return (
          <button key={p.id} className={"pn-space" + (curProject === p.id ? " on" : "")}
            onMouseEnter={e => tipOn(e, label)} onMouseLeave={tipOff}
            onClick={() => { tipOff(); navigate("project", { projectId: p.id }); }}>
            {(label || "?").trim().charAt(0).toUpperCase()}
          </button>
        );
      })}
    </nav>
  );
};

// ── Móvil (<768px): barra superior, pestañas inferiores y hojas ────────
// Cerrar una hoja inferior deslizándola hacia abajo (desde el asa o desde
// arriba del todo de su contenido).
const useSheetSwipe = (ref, onClose) => {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let y0 = null, dy = 0, scroller = null;
    const start = (e) => {
      if (!window.matchMedia("(max-width: 768px), (max-height: 500px) and (pointer: coarse)").matches) return;
      scroller = e.target.closest && e.target.closest(".pn-bs-scroll");
      if (scroller && scroller.scrollTop > 0) return;
      y0 = e.touches[0].clientY; dy = 0; el.style.transition = "none";
    };
    const move = (e) => {
      if (y0 === null) return;
      dy = Math.max(0, e.touches[0].clientY - y0);
      if (dy > 0) { el.style.transform = `translateY(${dy}px)`; if (e.cancelable) e.preventDefault(); }
    };
    const end = () => {
      if (y0 === null) return;
      y0 = null; el.style.transition = "transform .28s cubic-bezier(.32,.72,0,1)";
      if (dy > 90) { el.style.transform = "translateY(110%)"; setTimeout(onClose, 200); }
      else el.style.transform = "";
    };
    el.addEventListener("touchstart", start, { passive: true });
    el.addEventListener("touchmove", move, { passive: false });
    el.addEventListener("touchend", end); el.addEventListener("touchcancel", end);
    return () => { el.removeEventListener("touchstart", start); el.removeEventListener("touchmove", move); el.removeEventListener("touchend", end); el.removeEventListener("touchcancel", end); };
  }, []);
};

// "Más" en el móvil: Proyectos, Clientes, Perfil y las apps (hoja inferior)
const MoreSheet = ({ view, navigate, onClose, me }) => {
  const ref = useRef(null);
  const cur = _navOf(view.name);
  useSheetSwipe(ref, onClose);
  useEffect(() => {
    const down = (e) => { if (ref.current && !ref.current.contains(e.target) && !(e.target.closest && e.target.closest(".pn-tab"))) onClose(); };
    document.addEventListener("mousedown", down);
    return () => document.removeEventListener("mousedown", down);
  }, []);
  const go = (it) => { onClose(); if (it.href) window.open(it.href, "_blank", "noopener"); else navigate(it.id); };
  return (
    <div className="pn-cmenu pn-more-menu" ref={ref} role="menu">
      <div className="pn-bs-grab"/>
      <p className="t-caption ttl">Más</p>
      {MORE.map(it => (
        <button key={it.id} className={"it" + (cur === it.id ? " on" : "")} onClick={() => go(it)}>
          <PIcon name={it.icon} size={16}/>
          <span className="t-small lb">{it.label}</span>
        </button>
      ))}
      <button className={"it" + (view.name === "settings" ? " on" : "")} onClick={() => go({ id: "settings" })}>
        <span className="pn-more-me">{initials(me)}</span>
        <span className="t-small lb">Perfil</span>
      </button>
      <div className="sep"/>
      {APPS.map(a => (
        <button key={a.id} className={"it" + (cur === a.id ? " on" : "")} onClick={() => go(a)}>
          <PIcon name="apps" size={16}/>
          <span className="t-small lb">{a.label}</span>
        </button>
      ))}
    </div>
  );
};

const MobileTabs = ({ view, navigate, onMore, moreOpen }) => {
  const cur = _navOf(view.name);
  const inMore = !NAV.some(n => n.id === cur);
  return (
    <nav className="pn-tabs" aria-label="Secciones">
      {NAV.map(it => (
        <button key={it.id} className={"pn-tab" + (cur === it.id && !moreOpen ? " on" : "")} aria-label={it.label} onClick={() => navigate(it.id)}>
          <span className="ic"><PIcon name={it.icon}/></span>
          <span className="lb">{it.label}</span>
        </button>
      ))}
      <button className={"pn-tab" + (inMore || moreOpen ? " on" : "")} aria-label="Más" onClick={onMore}>
        <span className="ic"><PIcon name="more"/></span>
        <span className="lb">Más</span>
      </button>
    </nav>
  );
};

// ── Shell ─────────────────────────────────────────────────────────────
const PanelShell = ({ view, navigate, openModal, session, modalOpen, children }) => {
  const [pop, setPop] = useState(null);   // "create" | "notifs" | "more" | null
  const [scrolled, setScrolled] = useState(false);
  const blocked = useRef(false); blocked.current = !!modalOpen;
  const N = window.usePanelNotifs ? window.usePanelNotifs(navigate, openModal) : null;
  if (window.usePanelCreateShortcuts) window.usePanelCreateShortcuts(navigate, openModal, blocked);
  useEffect(() => { setPop(null); setScrolled(false); }, [view.name]);
  const toggle = (k) => setPop(p => (p === k ? null : k));
  // Barra superior del móvil: fondo solo cuando el contenido pasa por debajo
  const onScroll = (e) => { const t = e.target; if (t && t.scrollTop !== undefined && t.closest && t.closest(".pn-stage, .pn-legacy")) setScrolled(t.scrollTop > 4); };
  const me = (session && session.name) || "";
  return (
    <div className="pn app" data-screen-label={view.name} onScrollCapture={onScroll}>
      <div className="pn-glow"/>
      <Rail view={view} navigate={navigate} session={session}/>
      <div className={"pn-mtop" + (scrolled ? " scrolled" : "")}>
        <button className={"pn-avatar" + (view.name === "settings" ? " on" : "")} aria-label="Perfil" onClick={() => navigate("settings")}>{initials(me) || "·"}</button>
      </div>
      {/* En la Bandeja el diseño no lleva campana ni + (la campana lleva aquí) */}
      {!["unibox", "notifications"].includes(view.name) && <div className="pn-actions">
        <button className={"pn-act" + (pop === "notifs" ? " on" : "")} aria-label="Notificaciones" onClick={() => toggle("notifs")}>
          <PIcon name="bell"/>
          {N && N.unread ? <span className="pn-dot"/> : null}
        </button>
        <button className={"pn-act" + (pop === "create" ? " on" : "")} aria-label="Crear" onClick={() => toggle("create")}><PIcon name="plus"/></button>
      </div>}
      {children}
      <MobileTabs view={view} navigate={navigate} moreOpen={pop === "more"} onMore={() => toggle("more")}/>
      {pop === "more" && <MoreSheet view={view} navigate={navigate} me={me} onClose={() => setPop(null)}/>}
      {pop === "create" && window.PanelCreateMenu && <window.PanelCreateMenu navigate={navigate} openModal={openModal} onClose={() => setPop(null)}/>}
      {pop === "notifs" && N && window.PanelNotifs && <window.PanelNotifs navigate={navigate} openModal={openModal} N={N} onClose={() => setPop(null)}/>}
      <Tip/>
    </div>
  );
};

// ── Aviso (tarjeta tipo notificación de iPhone) ──────────────────────
// app: { initials } | { icon }   badge: "wa" | "box" | "send" | null
const Aviso = ({ title, time, from, body, app, badge, dim, onClick, onDismiss, xShow, style }) => {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag className={"pn-aviso" + (dim ? " dim" : "") + (onClick ? " click" : "")} onClick={onClick} style={style}>
      <div className={"pn-app" + (app && app.icon ? " ic" : "") + (dim ? " dim" : "")}>
        {app && app.icon ? <PIcon name={app.icon}/> : (app && app.initials)}
        {badge && (
          <span className={"pn-badge" + (badge === "wa" ? " wa" : "")}>
            <PIcon name={badge === "wa" ? "b-wa" : "b-" + badge}/>
          </span>
        )}
      </div>
      <div className="pn-aviso-txt">
        <div className="pn-aviso-title">
          <p className="t-card-title">{title}</p>
          {from ? <p className="t-small from">{from}</p> : null}
          <span className="sp"/>
          {time ? <p className="t-caption">{time}</p> : null}
        </div>
        {body ? <p className="t-small body">{body}</p> : null}
      </div>
      {onDismiss && (
        <span className={"pn-x" + (xShow ? " show" : "")} role="button" aria-label="Descartar" onClick={e => { e.stopPropagation(); onDismiss(); }}>
          <PIcon name="x11"/>
        </span>
      )}
    </Tag>
  );
};

// Grupo apilado (un aviso con las "capas" de detrás)
const Stack = ({ children }) => (
  <div className="pn-stack">
    {children}
    <div className="pn-layers"><i/><i/></div>
  </div>
);

// Sugerencia / filtro / acción
const Pill = ({ children, onClick, sug, style, className }) => (
  <button className={"pn-pill" + (sug ? " sug" : "") + (className ? " " + className : "")} onClick={onClick} style={style}>
    {sug && <PIcon name="spark"/>}
    {children}
  </button>
);

// Caja de Nora: sugerencias + caja con clip y botón de enviar. Siempre a la
// misma altura de pantalla (termina a 103px del borde inferior).
const NoraBox = ({ suggestions = [], placeholder = "Pregúntale a Nora…", navigate, onSubmit }) => {
  const [q, setQ] = useState("");
  const go = (text) => {
    const t = (text || "").trim();
    if (onSubmit) { onSubmit(t); setQ(""); return; }
    try { if (t) sessionStorage.setItem("nora_prefill", t); } catch (_) {}
    navigate && navigate("nora");
  };
  return (
    <div className="pn-nora">
      {suggestions.length > 0 && (
        <div className="pn-nora-sug">
          {suggestions.map(s => <Pill key={s} sug onClick={() => go(s)}>{s}</Pill>)}
        </div>
      )}
      <div className="pn-nora-box">
        <span className="clip"><PIcon name="clip"/></span>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder={placeholder}
          onKeyDown={e => { if (e.key === "Enter") go(q); }}/>
        <button className="pn-send" aria-label="Enviar" onClick={() => go(q)}><PIcon name="arrow-up"/></button>
      </div>
    </div>
  );
};

// Zona con scroll y fundido inferior (solo si hay contenido oculto)
const ScrollArea = ({ top, bottom, children, fade = true, innerRef }) => {
  const ref = useRef(null);
  const [more, setMore] = useState(false);
  const check = () => { const el = ref.current; if (!el) return; setMore(el.scrollHeight - el.scrollTop - el.clientHeight > 2); };
  useLayoutEffect(() => { check(); });
  useEffect(() => { const el = ref.current; if (!el) return; const ro = new ResizeObserver(check); ro.observe(el); if (el.firstChild) ro.observe(el.firstChild); return () => ro.disconnect(); }, []);
  return (
    <>
      <div className="pn-scroll" ref={el => { ref.current = el; if (innerRef) innerRef.current = el; }} style={{ top, bottom }} onScroll={check}>
        <div>{children}</div>
      </div>
      {fade && <div className="pn-fade" style={{ bottom, opacity: more ? 1 : 0 }}/>}
    </>
  );
};

window.PanelShell = PanelShell;
window.PN = { useSheetSwipe, Aviso, Stack, Pill, NoraBox, ScrollArea, initials, listMore, longDate, greet, shortDay, relDay, dayDiff, ago, ymd, parseYmd, cap, MESES: _MESES, DIAS: _DIAS, DIAS_C: _DIAS_C, tipOn, tipOff };
})();

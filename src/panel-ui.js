(() => {
  (() => {
    const { useState, useEffect, useRef, useLayoutEffect } = React;
    const _MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const _DIAS = ["domingo", "lunes", "martes", "mi\xE9rcoles", "jueves", "viernes", "s\xE1bado"];
    const _DIAS_C = ["Dom", "Lun", "Mar", "Mi\xE9", "Jue", "Vie", "S\xE1b"];
    const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
    const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const parseYmd = (s) => s && /^\d{4}-\d{2}-\d{2}/.test(s) ? /* @__PURE__ */ new Date(s.slice(0, 10) + "T12:00:00") : null;
    const longDate = (d = /* @__PURE__ */ new Date()) => `${cap(_DIAS[d.getDay()])}, ${d.getDate()} de ${_MESES[d.getMonth()]}`;
    const greet = (d = /* @__PURE__ */ new Date()) => {
      const h = d.getHours();
      return h < 12 ? "Buenos d\xEDas" : h < 20 ? "Buenas tardes" : "Buenas noches";
    };
    const dayDiff = (s) => {
      const d = parseYmd(s);
      if (!d) return null;
      const t = /* @__PURE__ */ new Date();
      t.setHours(12, 0, 0, 0);
      return Math.round((d - t) / 864e5);
    };
    const shortDay = (s) => {
      const n = dayDiff(s);
      if (n === null) return "";
      if (n === 0) return "Hoy";
      if (n === 1) return "Ma\xF1ana";
      const d = parseYmd(s);
      return `${_DIAS_C[d.getDay()]} ${d.getDate()}`;
    };
    const relDay = (s) => {
      const n = dayDiff(s);
      if (n === null) return "";
      if (n === 0) return "hoy";
      if (n === 1) return "ma\xF1ana";
      if (n === -1) return "ayer";
      const d = parseYmd(s);
      if (n > 1 && n < 7) return "el " + _DIAS[d.getDay()];
      return `el ${d.getDate()} de ${_MESES[d.getMonth()]}`;
    };
    const ago = (iso) => {
      if (!iso) return "";
      const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1e3));
      if (s < 60) return "Ahora";
      const m = Math.floor(s / 60);
      if (m < 60) return `Hace ${m} min`;
      const h = Math.floor(m / 60);
      if (h < 24) return `Hace ${h} h`;
      const d = new Date(iso);
      return `${d.getDate()} ${_MESES[d.getMonth()].slice(0, 3)}`;
    };
    const initials = (name) => {
      const w = String(name || "").replace(/[^\p{L}\p{N}\s]/gu, " ").trim().split(/\s+/).filter(Boolean);
      if (!w.length) return "\xB7";
      if (w.length === 1) return w[0].slice(0, 2).toUpperCase();
      return (w[0][0] + w[1][0]).toUpperCase();
    };
    const listMore = (names, total) => {
      const n = names.filter(Boolean);
      const rest = (total || n.length) - n.length;
      if (rest > 0) return `${n.join(", ")} y ${rest} m\xE1s`;
      if (n.length <= 1) return n.join("");
      return `${n.slice(0, -1).join(", ")} y ${n[n.length - 1]}`;
    };
    const _tip = { set: null };
    const Tip = () => {
      const [t, setT] = useState(null);
      useEffect(() => {
        _tip.set = setT;
        return () => {
          _tip.set = null;
        };
      }, []);
      return t ? ReactDOM.createPortal(/* @__PURE__ */ React.createElement("div", { className: "pn-tip", style: { left: t.x, top: t.y } }, t.label), document.body) : null;
    };
    const tipOn = (e, label) => {
      if (!_tip.set || !label) return;
      const r = e.currentTarget.getBoundingClientRect();
      _tip.set({ label, x: 68, y: r.top + r.height / 2 - 1.5 });
    };
    const tipOff = () => _tip.set && _tip.set(null);
    const NAV = [
      { id: "dashboard", icon: "home", label: "Inicio" },
      { id: "tasks", icon: "tasks", label: "Tareas" },
      { id: "agenda", icon: "calendar", label: "Calendario" },
      { id: "unibox", icon: "inbox", label: "Bandeja" }
    ];
    const MORE = [
      { id: "projects", icon: "folder", label: "Proyectos" },
      { id: "clients", icon: "users", label: "Clientes" }
    ];
    const APPS = [
      { id: "outreach", label: "Propuestas Outreach" },
      { id: "whatsapp", label: "WhatsApp" },
      { id: "resources", label: "Recursos" },
      { id: "calculator", label: "Calculadora" },
      { id: "billing", label: "Gastos" },
      { id: "income", label: "Facturaci\xF3n", href: "https://afinity.geyce.es/Usuario/Login?ReturnUrl=%2faplicaciones" },
      { id: "coldemail", label: "Cold email", href: "https://email.141agency.com/" }
    ];
    const _navOf = (v) => v === "project" ? "projects" : v === "clientDetail" ? "clients" : v === "notifications" ? "unibox" : v === "nora" ? "dashboard" : v;
    const Rail = ({ view, navigate, session }) => {
      const D = window.Data;
      const cur = _navOf(view.name);
      const inMore = MORE.some((m) => m.id === cur) || APPS.some((a) => a.id === cur);
      const [hov, setHov] = useState(false);
      const [apps, setApps] = useState(false);
      const open = hov || inMore || apps;
      useEffect(() => {
        if (!apps) return;
        const c = () => setApps(false);
        window.addEventListener("click", c);
        return () => window.removeEventListener("click", c);
      }, [apps]);
      const me = session && session.name || "";
      const active = (D.PROJECTS || []).filter((p) => {
        const tks = D.TASKS && D.TASKS[p.id] || [];
        const pct = tks.length ? Math.round(tks.filter((t) => t.column === "done").length / tks.length * 100) : p.progress || 0;
        return pct < 100;
      }).slice(0, 3);
      const curProject = view.name === "project" ? view.params.projectId : (() => {
        try {
          return localStorage.getItem("pn_last_project");
        } catch (_) {
          return null;
        }
      })();
      useEffect(() => {
        if (view.name === "project" && view.params.projectId) {
          try {
            localStorage.setItem("pn_last_project", view.params.projectId);
          } catch (_) {
          }
        }
      }, [view.name, view.params && view.params.projectId]);
      const Item = ({ it, sub }) => /* @__PURE__ */ React.createElement(
        "button",
        {
          className: "pn-nav" + (sub ? " sub" : "") + (cur === it.id ? " on" : ""),
          "aria-label": it.label,
          onMouseEnter: (e) => tipOn(e, it.label),
          onMouseLeave: tipOff,
          onClick: () => {
            tipOff();
            navigate(it.id);
          }
        },
        /* @__PURE__ */ React.createElement(PIcon, { name: it.icon })
      );
      return /* @__PURE__ */ React.createElement("nav", { className: "pn-rail" }, /* @__PURE__ */ React.createElement(
        "button",
        {
          className: "pn-avatar" + (view.name === "settings" ? " on" : ""),
          "aria-label": "Perfil",
          onMouseEnter: (e) => tipOn(e, "Perfil"),
          onMouseLeave: tipOff,
          onClick: () => {
            tipOff();
            navigate("settings");
          }
        },
        initials(me) || "\xB7"
      ), /* @__PURE__ */ React.createElement("div", { className: "pn-rail-gap", style: { height: 36 } }), NAV.map((it) => /* @__PURE__ */ React.createElement(Item, { key: it.id, it })), /* @__PURE__ */ React.createElement("div", { onMouseEnter: () => setHov(true), onMouseLeave: () => setHov(false), style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement("button", { className: "pn-nav" + (open && !inMore ? " on" : ""), "aria-label": "M\xE1s", onClick: () => setHov((v) => !v) }, /* @__PURE__ */ React.createElement(PIcon, { name: "more" })), /* @__PURE__ */ React.createElement("div", { className: "pn-more-sub" + (open ? " open" : ""), style: { marginTop: open ? 0 : -6 } }, /* @__PURE__ */ React.createElement("div", null, MORE.map((it) => /* @__PURE__ */ React.createElement(Item, { key: it.id, it, sub: true })), /* @__PURE__ */ React.createElement("div", { style: { position: "relative" }, onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement(
        "button",
        {
          className: "pn-nav sub" + (APPS.some((a) => a.id === cur) || apps ? " on" : ""),
          "aria-label": "Apps",
          onMouseEnter: (e) => tipOn(e, "Apps"),
          onMouseLeave: tipOff,
          onClick: () => {
            tipOff();
            setApps((v) => !v);
          }
        },
        /* @__PURE__ */ React.createElement(PIcon, { name: "apps" })
      ), apps && /* @__PURE__ */ React.createElement("div", { className: "pn-menu", style: { position: "absolute", left: 50, top: -4, minWidth: 210 } }, APPS.map((a) => /* @__PURE__ */ React.createElement("button", { key: a.id, className: "pn-menu-item", onClick: () => {
        setApps(false);
        if (a.href) window.open(a.href, "_blank", "noopener");
        else navigate(a.id);
      } }, /* @__PURE__ */ React.createElement("span", { className: "t-small" }, a.label)))))))), /* @__PURE__ */ React.createElement("div", { className: "pn-rail-gap", style: { height: 18 } }), /* @__PURE__ */ React.createElement("div", { className: "pn-sep" }), /* @__PURE__ */ React.createElement("div", { className: "pn-rail-gap", style: { height: 18 } }), active.map((p) => {
        const label = p.clientName && !["\u2014", "-", "Interno"].includes((p.clientName || "").trim()) ? p.clientName : p.name;
        return /* @__PURE__ */ React.createElement(
          "button",
          {
            key: p.id,
            className: "pn-space" + (curProject === p.id ? " on" : ""),
            onMouseEnter: (e) => tipOn(e, label),
            onMouseLeave: tipOff,
            onClick: () => {
              tipOff();
              navigate("project", { projectId: p.id });
            }
          },
          (label || "?").trim().charAt(0).toUpperCase()
        );
      }));
    };
    const PanelShell = ({ view, navigate, openModal, session, modalOpen, children }) => {
      const [pop, setPop] = useState(null);
      const blocked = useRef(false);
      blocked.current = !!modalOpen;
      const N = window.usePanelNotifs ? window.usePanelNotifs(navigate, openModal) : null;
      if (window.usePanelCreateShortcuts) window.usePanelCreateShortcuts(navigate, openModal, blocked);
      useEffect(() => {
        setPop(null);
      }, [view.name]);
      const toggle = (k) => setPop((p) => p === k ? null : k);
      return /* @__PURE__ */ React.createElement("div", { className: "pn app", "data-screen-label": view.name }, /* @__PURE__ */ React.createElement("div", { className: "pn-glow" }), /* @__PURE__ */ React.createElement(Rail, { view, navigate, session }), !["unibox", "notifications"].includes(view.name) && /* @__PURE__ */ React.createElement("div", { className: "pn-actions" }, /* @__PURE__ */ React.createElement("button", { className: "pn-act" + (pop === "notifs" ? " on" : ""), "aria-label": "Notificaciones", onClick: () => toggle("notifs") }, /* @__PURE__ */ React.createElement(PIcon, { name: "bell" }), N && N.unread ? /* @__PURE__ */ React.createElement("span", { className: "pn-dot" }) : null), /* @__PURE__ */ React.createElement("button", { className: "pn-act" + (pop === "create" ? " on" : ""), "aria-label": "Crear", onClick: () => toggle("create") }, /* @__PURE__ */ React.createElement(PIcon, { name: "plus" }))), children, pop === "create" && window.PanelCreateMenu && /* @__PURE__ */ React.createElement(window.PanelCreateMenu, { navigate, openModal, onClose: () => setPop(null) }), pop === "notifs" && N && window.PanelNotifs && /* @__PURE__ */ React.createElement(window.PanelNotifs, { navigate, openModal, N, onClose: () => setPop(null) }), /* @__PURE__ */ React.createElement(Tip, null));
    };
    const Aviso = ({ title, time, from, body, app, badge, dim, onClick, onDismiss, xShow, style }) => {
      const Tag = onClick ? "button" : "div";
      return /* @__PURE__ */ React.createElement(Tag, { className: "pn-aviso" + (dim ? " dim" : "") + (onClick ? " click" : ""), onClick, style }, /* @__PURE__ */ React.createElement("div", { className: "pn-app" + (app && app.icon ? " ic" : "") + (dim ? " dim" : "") }, app && app.icon ? /* @__PURE__ */ React.createElement(PIcon, { name: app.icon }) : app && app.initials, badge && /* @__PURE__ */ React.createElement("span", { className: "pn-badge" + (badge === "wa" ? " wa" : "") }, /* @__PURE__ */ React.createElement(PIcon, { name: badge === "wa" ? "b-wa" : "b-" + badge }))), /* @__PURE__ */ React.createElement("div", { className: "pn-aviso-txt" }, /* @__PURE__ */ React.createElement("div", { className: "pn-aviso-title" }, /* @__PURE__ */ React.createElement("p", { className: "t-card-title" }, title), from ? /* @__PURE__ */ React.createElement("p", { className: "t-small from" }, from) : null, /* @__PURE__ */ React.createElement("span", { className: "sp" }), time ? /* @__PURE__ */ React.createElement("p", { className: "t-caption" }, time) : null), body ? /* @__PURE__ */ React.createElement("p", { className: "t-small body" }, body) : null), onDismiss && /* @__PURE__ */ React.createElement("span", { className: "pn-x" + (xShow ? " show" : ""), role: "button", "aria-label": "Descartar", onClick: (e) => {
        e.stopPropagation();
        onDismiss();
      } }, /* @__PURE__ */ React.createElement(PIcon, { name: "x11" })));
    };
    const Stack = ({ children }) => /* @__PURE__ */ React.createElement("div", { className: "pn-stack" }, children, /* @__PURE__ */ React.createElement("div", { className: "pn-layers" }, /* @__PURE__ */ React.createElement("i", null), /* @__PURE__ */ React.createElement("i", null)));
    const Pill = ({ children, onClick, sug, style, className }) => /* @__PURE__ */ React.createElement("button", { className: "pn-pill" + (sug ? " sug" : "") + (className ? " " + className : ""), onClick, style }, sug && /* @__PURE__ */ React.createElement(PIcon, { name: "spark" }), children);
    const NoraBox = ({ suggestions = [], placeholder = "Preg\xFAntale a Nora\u2026", navigate, onSubmit }) => {
      const [q, setQ] = useState("");
      const go = (text) => {
        const t = (text || "").trim();
        if (onSubmit) {
          onSubmit(t);
          setQ("");
          return;
        }
        try {
          if (t) sessionStorage.setItem("nora_prefill", t);
        } catch (_) {
        }
        navigate && navigate("nora");
      };
      return /* @__PURE__ */ React.createElement("div", { className: "pn-nora" }, suggestions.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "pn-nora-sug" }, suggestions.map((s) => /* @__PURE__ */ React.createElement(Pill, { key: s, sug: true, onClick: () => go(s) }, s))), /* @__PURE__ */ React.createElement("div", { className: "pn-nora-box" }, /* @__PURE__ */ React.createElement("span", { className: "clip" }, /* @__PURE__ */ React.createElement(PIcon, { name: "clip" })), /* @__PURE__ */ React.createElement(
        "input",
        {
          value: q,
          onChange: (e) => setQ(e.target.value),
          placeholder,
          onKeyDown: (e) => {
            if (e.key === "Enter") go(q);
          }
        }
      ), /* @__PURE__ */ React.createElement("button", { className: "pn-send", "aria-label": "Enviar", onClick: () => go(q) }, /* @__PURE__ */ React.createElement(PIcon, { name: "arrow-up" }))));
    };
    const ScrollArea = ({ top, bottom, children, fade = true, innerRef }) => {
      const ref = useRef(null);
      const [more, setMore] = useState(false);
      const check = () => {
        const el = ref.current;
        if (!el) return;
        setMore(el.scrollHeight - el.scrollTop - el.clientHeight > 2);
      };
      useLayoutEffect(() => {
        check();
      });
      useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const ro = new ResizeObserver(check);
        ro.observe(el);
        if (el.firstChild) ro.observe(el.firstChild);
        return () => ro.disconnect();
      }, []);
      return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "pn-scroll", ref: (el) => {
        ref.current = el;
        if (innerRef) innerRef.current = el;
      }, style: { top, bottom }, onScroll: check }, /* @__PURE__ */ React.createElement("div", null, children)), fade && /* @__PURE__ */ React.createElement("div", { className: "pn-fade", style: { bottom, opacity: more ? 1 : 0 } }));
    };
    window.PanelShell = PanelShell;
    window.PN = { Aviso, Stack, Pill, NoraBox, ScrollArea, initials, listMore, longDate, greet, shortDay, relDay, dayDiff, ago, ymd, parseYmd, cap, MESES: _MESES, DIAS: _DIAS, DIAS_C: _DIAS_C, tipOn, tipOff };
  })();
})();

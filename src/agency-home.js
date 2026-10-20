(() => {
  const { useState } = React;
  const _HOME_DONE = ["cerrado", "descartado"];
  const _homeToday = (D) => D.today ? D.today() : (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const _homeGreet = () => {
    const h = (/* @__PURE__ */ new Date()).getHours();
    return h < 12 ? "Buenos d\xEDas" : h < 20 ? "Buenas tardes" : "Buenas noches";
  };
  const _HM = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const _homeParseDate = (s) => {
    if (!s) return null;
    const t = String(s).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return /* @__PURE__ */ new Date(t + "T12:00:00");
    const m = t.toLowerCase().match(/^(\d{1,2})\s+([a-záéíóú]{3})/);
    if (m) {
      const mi = _HM.indexOf(m[2].slice(0, 3));
      if (mi >= 0) {
        const now = /* @__PURE__ */ new Date();
        let y = now.getFullYear();
        const d = new Date(y, mi, parseInt(m[1]), 12);
        if (d < new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2)) d.setFullYear(y + 1);
        return d;
      }
    }
    return null;
  };
  const _homeFmtDate = (s) => {
    const d = _homeParseDate(s);
    return d ? `${d.getDate()} ${_HM[d.getMonth()]}` : s || "";
  };
  const _homeWaDigits = (s) => String(s || "").replace(/\D/g, "");
  const _homeWaMatch = (clientPhone, waId) => {
    const a = _homeWaDigits(clientPhone), b = _homeWaDigits(waId);
    if (!a || !b) return false;
    if (a === b) return true;
    const min = Math.min(a.length, b.length);
    return min >= 8 && (a.endsWith(b) || b.endsWith(a));
  };
  const _homeWaTime = (ts) => {
    try {
      const d = new Date(ts), now = /* @__PURE__ */ new Date();
      if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
      return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
    } catch {
      return "";
    }
  };
  const DonutIcon = ({ pct, size = 27, stroke = 2.2, color = "var(--accent)", xColor }) => {
    const r = (size - stroke) / 2 - 0.5, c = size / 2, circ = 2 * Math.PI * r;
    const p = Math.max(0, Math.min(100, Math.round(pct || 0)));
    const done = p >= 100;
    return /* @__PURE__ */ React.createElement("div", { style: { position: "relative", width: size, height: size, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement("svg", { width: size, height: size, style: { position: "absolute", top: 0, left: 0 } }, /* @__PURE__ */ React.createElement("circle", { cx: c, cy: c, r, fill: "none", stroke: done ? color : "rgba(255,255,255,0.12)", strokeWidth: stroke }), !done && p > 0 && /* @__PURE__ */ React.createElement(
      "circle",
      {
        cx: c,
        cy: c,
        r,
        fill: "none",
        stroke: color,
        strokeWidth: stroke,
        strokeLinecap: "round",
        strokeDasharray: `${p / 100 * circ} ${circ}`,
        transform: `rotate(-90 ${c} ${c})`,
        style: { transition: "stroke-dasharray .5s cubic-bezier(.4,0,.2,1)" }
      }
    )), done ? /* @__PURE__ */ React.createElement(Icon, { name: "check", size: Math.round(size * 0.55), style: { color, position: "relative" } }) : p > 0 ? /* @__PURE__ */ React.createElement("span", { style: { fontSize: Math.max(7.5, size * 0.33), fontWeight: 400, color: "var(--text-muted)", position: "relative", letterSpacing: "-0.7px" } }, p, "%") : /* @__PURE__ */ React.createElement(Icon, { name: "x", size: Math.round(size * 0.46), style: { color: xColor || "rgba(255,255,255,0.22)", position: "relative" } }));
  };
  const HomeCard = ({ icon, iconNode, color, title, sub, items, onOpen, defaultOpen }) => {
    const [open, setOpen] = useState(!!defaultOpen);
    const expandable = items && items.length > 0;
    const rowRefs = React.useRef({});
    const _order = (items || []).map((it) => it && it.id != null ? it.id : "\xB7").join(",");
    React.useLayoutEffect(() => {
      if (!open) {
        rowRefs.current.__prev = {};
        rowRefs.current.__order = _order;
        return;
      }
      const prev = rowRefs.current.__prev || {};
      const reordered = rowRefs.current.__order != null && rowRefs.current.__order !== _order;
      const next = {};
      Object.keys(rowRefs.current).forEach((id) => {
        if (id === "__prev" || id === "__order") return;
        const el = rowRefs.current[id];
        if (!el) return;
        const top = el.getBoundingClientRect().top;
        next[id] = top;
        if (reordered && prev[id] != null) {
          const dy = prev[id] - top;
          if (Math.abs(dy) > 1) {
            el.style.transition = "none";
            el.style.transform = "translateY(" + dy + "px)";
            void el.offsetHeight;
            requestAnimationFrame(() => {
              el.style.transition = "transform .5s cubic-bezier(.33,1,.68,1)";
              el.style.transform = "";
            });
          }
        }
      });
      rowRefs.current.__prev = next;
      rowRefs.current.__order = _order;
    });
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "home-card",
        onClick: () => expandable ? setOpen((o) => !o) : onOpen && onOpen(),
        style: {
          borderRadius: 16,
          background: "rgba(255,255,255,0.055)",
          border: "0.5px solid rgba(255,255,255,0.09)",
          cursor: "pointer",
          overflow: "hidden",
          transition: "background .15s"
        },
        onMouseEnter: (e) => e.currentTarget.style.background = "rgba(255,255,255,0.075)",
        onMouseLeave: (e) => e.currentTarget.style.background = "rgba(255,255,255,0.055)"
      },
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 13, padding: "15px 16px" } }, /* @__PURE__ */ React.createElement("div", { style: { flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" } }, iconNode || /* @__PURE__ */ React.createElement(Icon, { name: icon, size: 18, strokeWidth: 1.7 })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, fontWeight: 600, color: "var(--text)", letterSpacing: "-0.2px", marginBottom: 3 } }, title), sub && /* @__PURE__ */ React.createElement("div", { style: {
        fontSize: 12.5,
        color: "var(--text-muted)",
        lineHeight: 1.5,
        display: "-webkit-box",
        WebkitLineClamp: open ? 10 : 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden"
      } }, sub)), expandable && /* @__PURE__ */ React.createElement(Icon, { name: "chevron-down", size: 15, style: { color: "var(--text-subtle)", flexShrink: 0, marginTop: 3, transform: open ? "rotate(180deg)" : "none", transition: "transform .18s" } })),
      /* @__PURE__ */ React.createElement("div", { style: {
        display: "grid",
        gridTemplateRows: open && expandable ? "1fr" : "0fr",
        transition: "grid-template-rows .34s cubic-bezier(.4,0,.2,1)"
      } }, /* @__PURE__ */ React.createElement("div", { style: { overflow: "hidden", minHeight: 0 } }, /* @__PURE__ */ React.createElement(
        "div",
        {
          onClick: (e) => e.stopPropagation(),
          style: {
            borderTop: "0.5px solid rgba(255,255,255,0.07)",
            padding: "6px 8px 8px",
            opacity: open ? 1 : 0,
            transition: "opacity .22s ease"
          }
        },
        (items || []).map((it, i) => /* @__PURE__ */ React.createElement(
          "div",
          {
            key: it.id != null ? it.id : i,
            ref: (el) => {
              const k = it.id != null ? it.id : i;
              if (el) rowRefs.current[k] = el;
              else delete rowRefs.current[k];
            },
            onClick: it.onClick,
            style: { display: "flex", alignItems: "center", gap: 12, padding: "11px 11px", borderRadius: 11, cursor: it.onClick ? "pointer" : "default" },
            onMouseEnter: (e) => it.onClick && (e.currentTarget.style.background = "rgba(255,255,255,0.05)"),
            onMouseLeave: (e) => e.currentTarget.style.background = "transparent"
          },
          it.onComplete ? /* @__PURE__ */ React.createElement(
            "button",
            {
              onClick: (e) => {
                e.stopPropagation();
                it.onComplete();
              },
              title: it.completed ? "Marcar como pendiente" : "Marcar como hecha",
              style: { flexShrink: 0, padding: 0, border: "none", background: "transparent", cursor: "pointer", display: "flex", opacity: 0.92, transition: "opacity .12s" },
              onMouseEnter: (e) => e.currentTarget.style.opacity = 1,
              onMouseLeave: (e) => e.currentTarget.style.opacity = 0.92
            },
            /* @__PURE__ */ React.createElement(DonutIcon, { pct: it.completed ? 100 : it.prog || 0, size: 25, xColor: it.overdue ? "var(--red)" : void 0 })
          ) : it.dot && /* @__PURE__ */ React.createElement("span", { style: { width: 8, height: 8, borderRadius: "50%", background: it.dot, flexShrink: 0 } }),
          /* @__PURE__ */ React.createElement("span", { style: { flex: 1, minWidth: 0, fontSize: 14, color: it.completed ? "var(--text-subtle)" : "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, it.label),
          it.right && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12.5, color: "var(--text-subtle)", flexShrink: 0, whiteSpace: "nowrap" } }, it.right)
        )),
        onOpen && /* @__PURE__ */ React.createElement("div", { onClick: onOpen, style: { padding: "9px 10px", fontSize: 12.5, color: "var(--accent)", cursor: "pointer", fontWeight: 500 } }, "Ver todo \u2192")
      )))
    );
  };
  const AgencyHome = ({ navigate, openModal, session }) => {
    const D = window.Data;
    D.useStore();
    const today = _homeToday(D);
    const _base = (session && session.name || "").trim() || (D.SETTINGS && D.SETTINGS.email || "nil@141agency.com");
    const name = _base.includes("@") ? (() => {
      const n = _base.split("@")[0];
      return n.charAt(0).toUpperCase() + n.slice(1);
    })() : _base;
    const [ask, setAsk] = useState("");
    const projIds = new Set((D.PROJECTS || []).map((p) => p.id));
    const liveTasks = Object.entries(D.TASKS || {}).filter(([pid]) => pid === "__none__" || projIds.has(pid)).flatMap(([pid, arr]) => (arr || []).map((t) => ({ ...t, _pid: pid })));
    const _isToday = (t) => t.deadline && (t.deadline === today || t.deadline < today && t.column !== "done");
    const todayAll = liveTasks.filter(_isToday);
    const todayTasks = todayAll.filter((t) => t.column !== "done").sort((a, b) => a.deadline < b.deadline ? -1 : 1);
    const todayDoneCount = todayAll.filter((t) => t.column === "done").length;
    const todayPct = todayAll.length ? Math.round(todayDoneCount / todayAll.length * 100) : 0;
    const todayItems = todayAll.slice().sort((a, b) => {
      const ad = a.column === "done", bd = b.column === "done";
      if (ad !== bd) return ad ? 1 : -1;
      const da = a.deadline || "", db = b.deadline || "";
      if (da !== db) return da < db ? -1 : 1;
      return (a.id || "") < (b.id || "") ? -1 : (a.id || "") > (b.id || "") ? 1 : 0;
    });
    const todayMeetings = (D.AGENDA_EVENTS || []).filter((e) => e.date === today && (e.type === "meeting" || e.link)).sort((a, b) => (a.time || "99") < (b.time || "99") ? -1 : 1);
    const projs = (D.PROJECTS || []).map((p) => {
      const tks = D.TASKS[p.id] || [];
      const pct = tks.length ? Math.round(tks.filter((t) => t.column === "done").length / tks.length * 100) : p.progress || 0;
      return { ...p, _pct: pct };
    });
    const activeProjs = projs.filter((p) => p._pct < 100).sort((a, b) => {
      const da = _homeParseDate(a.deadline), db = _homeParseDate(b.deadline);
      if (da && db) return da - db;
      if (da) return -1;
      if (db) return 1;
      return 0;
    });
    const dueFollowups = (D.OUTREACH || []).filter((o) => o.nextFollowup && !_HOME_DONE.includes(o.status) && !o.convertedClientId && o.nextFollowup <= today).sort((a, b) => a.nextFollowup < b.nextFollowup ? -1 : 1);
    React.useEffect(() => {
      try {
        D.reloadWhatsapp && D.reloadWhatsapp();
      } catch (_) {
      }
      try {
        D.googleSync && D.googleSync();
      } catch (_) {
      }
    }, []);
    const _waBy = {};
    (D.WHATSAPP || []).forEach((m) => {
      (_waBy[m.waId] = _waBy[m.waId] || []).push(m);
    });
    const waPending = Object.keys(_waBy).map((waId) => {
      const arr = _waBy[waId].slice().sort((a, b) => a.ts < b.ts ? -1 : 1);
      const last = arr[arr.length - 1];
      const client = (D.CLIENTS || []).find((c) => _homeWaMatch(c.whatsapp, waId));
      const name2 = client ? client.company || client.name : arr.map((m) => m.contactName).filter(Boolean).pop() || "+" + waId;
      return { waId, last, name: name2 };
    }).filter((c) => c.last && c.last.direction === "in").sort((a, b) => a.last.ts < b.last.ts ? 1 : -1);
    const submitAsk = () => {
      const q = ask.trim();
      try {
        if (q) sessionStorage.setItem("nora_prefill", q);
      } catch (_) {
      }
      navigate("nora");
    };
    const sec = (label, child) => /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 20 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--text-subtle)", marginBottom: 9, letterSpacing: "0.01em" } }, label), child);
    return /* @__PURE__ */ React.createElement("div", { style: { position: "relative", minHeight: "100dvh", padding: "0 24px 60px", background: "transparent" } }, /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 620, margin: "0 auto", paddingTop: "15vh" } }, /* @__PURE__ */ React.createElement("h1", { style: { fontFamily: "var(--font-display)", fontSize: 27, fontWeight: 400, letterSpacing: "-0.04em", margin: "0 0 26px", color: "var(--text)" } }, _homeGreet(), ", ", name, "."), sec("Hoy", /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, todayAll.length === 0 ? /* @__PURE__ */ React.createElement(
      HomeCard,
      {
        icon: "sl-tasks",
        color: "var(--accent)",
        title: "Sin tareas para hoy",
        sub: "No tienes nada programado para hoy.",
        onOpen: () => navigate("tasks")
      }
    ) : /* @__PURE__ */ React.createElement(
      HomeCard,
      {
        icon: "sl-tasks",
        color: "#9e9ae5",
        iconNode: /* @__PURE__ */ React.createElement(DonutIcon, { pct: todayPct }),
        title: todayTasks.length === 0 ? "Todo hecho por hoy" : `Tienes ${todayTasks.length} tarea${todayTasks.length === 1 ? "" : "s"} para hoy`,
        sub: todayTasks.length === 0 ? `${todayDoneCount} tarea${todayDoneCount === 1 ? "" : "s"} completada${todayDoneCount === 1 ? "" : "s"}` : todayTasks.slice(0, 3).map((t) => t.title).join(" \xB7 "),
        items: todayItems.slice(0, 10).map((t) => {
          const done = t.column === "done";
          const overdue = !done && t.deadline && t.deadline < today;
          return {
            id: t.id,
            label: t.title,
            right: done ? "Hecha" : overdue ? "Atrasada" : "Hoy",
            overdue,
            completed: done,
            prog: t.progress || 0,
            onComplete: () => {
              try {
                D.moveTask(t._pid, t.id, done ? "todo" : "done");
              } catch (_) {
              }
            },
            onClick: () => navigate("tasks")
          };
        }),
        onOpen: () => navigate("tasks")
      }
    ), todayMeetings.length > 0 && /* @__PURE__ */ React.createElement(
      HomeCard,
      {
        icon: "video",
        color: "#34d399",
        title: `${todayMeetings.length} reuni${todayMeetings.length === 1 ? "\xF3n" : "ones"} hoy`,
        sub: todayMeetings.slice(0, 3).map((m) => m.title + (m.time ? ` \xB7 ${m.time}` : "")).join("  \xB7  "),
        items: todayMeetings.slice(0, 8).map((m) => ({
          label: m.title,
          right: m.time || (m.link ? "Abrir" : ""),
          dot: "#34d399",
          onClick: () => {
            if (m.link) window.open(m.link, "_blank");
            else navigate("agenda");
          }
        })),
        onOpen: () => navigate("agenda")
      }
    ))), sec("WhatsApp", waPending.length === 0 ? /* @__PURE__ */ React.createElement(HomeCard, { icon: "sl-chat", color: "#25D366", title: "Sin mensajes por responder", sub: "No tienes conversaciones de WhatsApp pendientes.", onOpen: () => navigate("whatsapp") }) : /* @__PURE__ */ React.createElement(
      HomeCard,
      {
        icon: "sl-chat",
        color: "#25D366",
        title: `${waPending.length} mensaje${waPending.length === 1 ? "" : "s"} de WhatsApp por responder`,
        sub: waPending.slice(0, 3).map((c) => c.name).join(" \xB7 "),
        items: waPending.slice(0, 8).map((c) => ({ label: c.name, right: _homeWaTime(c.last.ts), dot: "#25D366", onClick: () => navigate("whatsapp") })),
        onOpen: () => navigate("whatsapp")
      }
    )), sec("Entregas pr\xF3ximas", activeProjs.length === 0 ? /* @__PURE__ */ React.createElement(HomeCard, { icon: "sl-package", color: "#60a5fa", title: "Sin entregas pendientes", sub: "No tienes proyectos en marcha ahora mismo.", onOpen: () => navigate("projects") }) : /* @__PURE__ */ React.createElement(
      HomeCard,
      {
        icon: "sl-package",
        color: "#60a5fa",
        title: `${activeProjs.length} entrega${activeProjs.length === 1 ? "" : "s"} pr\xF3xima${activeProjs.length === 1 ? "" : "s"}`,
        sub: activeProjs.slice(0, 2).map((p) => `${p.clientName && !["\u2014", "-", "Interno"].includes((p.clientName || "").trim()) ? p.clientName + " | " : ""}${p.name}`).join("  \xB7  "),
        items: activeProjs.slice(0, 8).map((p) => ({ label: `${p.clientName && !["\u2014", "-", "Interno"].includes((p.clientName || "").trim()) ? p.clientName + " | " : ""}${p.name}`, right: _homeFmtDate(p.deadline), onClick: () => navigate("project", { projectId: p.id }) })),
        onOpen: () => navigate("projects")
      }
    )), sec("Seguimientos", dueFollowups.length === 0 ? /* @__PURE__ */ React.createElement(HomeCard, { icon: "sl-send", color: "#e2b45c", title: "Sin seguimientos para hoy", sub: "No tienes seguimientos de outreach que vencen hoy.", onOpen: () => navigate("outreach") }) : /* @__PURE__ */ React.createElement(
      HomeCard,
      {
        icon: "sl-send",
        color: "#e2b45c",
        title: `${dueFollowups.length} seguimiento${dueFollowups.length === 1 ? "" : "s"} para hoy`,
        sub: dueFollowups.slice(0, 3).map((o) => o.brand).join(" \xB7 "),
        items: dueFollowups.slice(0, 8).map((o) => ({ label: o.brand, right: o.nextFollowup < today ? "Atrasado" : "Hoy", dot: o.nextFollowup < today ? "var(--red)" : "var(--amber)", onClick: () => navigate("outreach") })),
        onOpen: () => navigate("outreach")
      }
    )), /* @__PURE__ */ React.createElement("div", { style: {
      marginTop: 26,
      borderRadius: 16,
      background: "rgba(0,0,0,0.3)",
      border: "0.5px solid rgba(255,255,255,0.1)",
      padding: "14px 16px"
    } }, /* @__PURE__ */ React.createElement(
      "input",
      {
        value: ask,
        onChange: (e) => setAsk(e.target.value),
        onKeyDown: (e) => {
          if (e.key === "Enter") submitAsk();
        },
        placeholder: "Preg\xFAntale a Nora\u2026",
        style: { width: "100%", background: "transparent", border: "none", outline: "none", color: "var(--text)", fontSize: 14, fontFamily: "inherit" }
      }
    ), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: "var(--text-subtle)" } }, "@"), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: submitAsk,
        title: "Preguntar a Nora",
        style: {
          width: 30,
          height: 30,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          background: ask.trim() ? "var(--accent)" : "rgba(255,255,255,0.1)",
          color: ask.trim() ? "#0a0a0a" : "var(--text-subtle)",
          border: "none",
          transition: "background .15s"
        }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "arrow-up", size: 15 })
    )))));
  };
  window.AgencyHome = AgencyHome;
})();

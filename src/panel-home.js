(() => {
  (() => {
    const { useState, useEffect } = React;
    const PN = window.PN;
    const _DONE = ["cerrado", "descartado"];
    const _noClient = (s) => !s || ["\u2014", "-", "Interno"].includes(String(s).trim());
    const _waDigits = (s) => String(s || "").replace(/\D/g, "");
    const _waMatch = (phone, waId) => {
      const a = _waDigits(phone), b = _waDigits(waId);
      if (!a || !b) return false;
      if (a === b) return true;
      return Math.min(a.length, b.length) >= 8 && (a.endsWith(b) || b.endsWith(a));
    };
    const _dkey = () => "pn_dismissed_" + PN.ymd(/* @__PURE__ */ new Date());
    const _readDismissed = () => {
      try {
        return JSON.parse(localStorage.getItem(_dkey()) || "[]");
      } catch (_) {
        return [];
      }
    };
    const PanelHome = ({ navigate, session }) => {
      const D = window.Data;
      D.useStore();
      const today = D.today ? D.today() : PN.ymd(/* @__PURE__ */ new Date());
      const [open, setOpen] = useState(null);
      const [dismissed, setDismissed] = useState(_readDismissed);
      const dismiss = (ids) => {
        const next = Array.from(new Set(dismissed.concat(ids)));
        setDismissed(next);
        try {
          localStorage.setItem(_dkey(), JSON.stringify(next));
        } catch (_) {
        }
      };
      const live = (k) => !dismissed.includes(k);
      useEffect(() => {
        try {
          D.reloadWhatsapp && D.reloadWhatsapp();
        } catch (_) {
        }
        try {
          D.googleSync && D.googleSync();
        } catch (_) {
        }
      }, []);
      const base = (session && session.name || "").trim() || (D.SETTINGS && D.SETTINGS.email || "");
      const first = base.includes("@") ? PN.cap(base.split("@")[0]) : base.split(/\s+/)[0];
      const projIds = new Set((D.PROJECTS || []).map((p) => p.id));
      const tasks = Object.entries(D.TASKS || {}).filter(([pid]) => pid === "__none__" || projIds.has(pid)).flatMap(([pid, arr]) => (arr || []).map((t) => ({ ...t, _pid: pid }))).filter((t) => t.deadline && t.column !== "done" && t.deadline <= today).sort((a, b) => a.deadline < b.deadline ? -1 : a.deadline > b.deadline ? 1 : (a.id || "") < (b.id || "") ? -1 : 1);
      const meetings = (D.AGENDA_EVENTS || []).filter((e) => e.date === today && (e.type === "meeting" || e.link)).sort((a, b) => (a.time || "99") < (b.time || "99") ? -1 : 1);
      const waBy = {};
      (D.WHATSAPP || []).forEach((m) => {
        (waBy[m.waId] = waBy[m.waId] || []).push(m);
      });
      const wa = Object.keys(waBy).map((waId) => {
        const arr = waBy[waId].slice().sort((a, b) => a.ts < b.ts ? -1 : 1);
        const last = arr[arr.length - 1];
        const client = (D.CLIENTS || []).find((c) => _waMatch(c.whatsapp || c.phone, waId));
        const name = client ? client.company || client.name : arr.map((m) => m.contactName).filter(Boolean).pop() || "+" + waId;
        return { waId, last, name };
      }).filter((c) => c.last && c.last.direction === "in").sort((a, b) => a.last.ts < b.last.ts ? 1 : -1);
      const projs = (D.PROJECTS || []).map((p) => {
        const tks = D.TASKS && D.TASKS[p.id] || [];
        const pct = tks.length ? Math.round(tks.filter((t) => t.column === "done").length / tks.length * 100) : p.progress || 0;
        return { ...p, _pct: pct };
      }).filter((p) => p._pct < 100 && PN.parseYmd(p.deadline)).sort((a, b) => PN.parseYmd(a.deadline) - PN.parseYmd(b.deadline));
      const projTitle = (p) => _noClient(p.clientName) ? p.name : `${p.clientName} \xB7 ${p.name}`;
      const projShort = (p) => _noClient(p.clientName) || String(p.name || "").toLowerCase().includes(String(p.clientName).toLowerCase()) ? p.name : p.clientName;
      const follow = (D.OUTREACH || []).filter((o) => o.nextFollowup && !_DONE.includes(o.status) && !o.convertedClientId && o.nextFollowup <= today).sort((a, b) => a.nextFollowup < b.nextFollowup ? -1 : a.nextFollowup > b.nextFollowup ? 1 : 0);
      const groups = [];
      const tItems = tasks.filter((t) => live("t:" + t.id)).map((t) => {
        const p = (D.PROJECTS || []).find((x) => x.id === t._pid);
        return {
          key: "t:" + t.id,
          title: t.title,
          time: t.deadline < today ? "Atrasada" : "Hoy",
          from: "de Tareas" + (p ? " \xB7 " + projTitle(p) : ""),
          body: t.description || (p ? "Proyecto " + p.name : "Tarea para hoy"),
          app: { icon: "app-tasks" },
          onClick: () => navigate("tasks")
        };
      });
      if (tItems.length === 0) {
        groups.push({ id: "tasks", empty: true, items: [{ key: "t:none", title: "Sin tareas para hoy", time: "Hoy", from: "de Tareas", body: "No tienes nada programado para hoy.", app: { icon: "app-tasks" }, dim: true, onClick: () => navigate("tasks") }] });
      } else {
        groups.push({
          id: "tasks",
          label: "Tareas",
          more: (n) => `Ver las ${n} tareas`,
          go: () => navigate("tasks"),
          items: tItems,
          summary: tItems.length > 1 ? { ...tItems[0], title: `${tItems.length} tareas para hoy`, from: "de Tareas", body: PN.listMore(tItems.slice(0, 2).map((t) => t.title), tItems.length) + "." } : null
        });
      }
      const mItems = meetings.filter((m) => live("m:" + m.id)).map((m) => ({
        key: "m:" + m.id,
        title: m.title,
        time: m.time || "Hoy",
        from: "de Calendario",
        body: (m.time ? `Hoy a las ${m.time}` : "Hoy") + (m.link ? " \xB7 Enlace de la reuni\xF3n" : ""),
        app: { icon: "calendar" },
        onClick: () => {
          if (m.link) window.open(m.link, "_blank", "noopener");
          else navigate("agenda");
        }
      }));
      if (mItems.length) groups.push({
        id: "meetings",
        label: "Reuniones",
        more: (n) => `Ver las ${n} reuniones`,
        go: () => navigate("agenda"),
        items: mItems,
        summary: mItems.length > 1 ? { ...mItems[0], from: `de Calendario \xB7 ${mItems.length} hoy`, body: `${mItems[0].body}. Tambi\xE9n: ${PN.listMore(mItems.slice(1, 3).map((m) => m.title), mItems.length - 1)}.` } : null
      });
      const wItems = wa.filter((c) => live("w:" + c.waId + ":" + c.last.ts)).map((c) => ({
        key: "w:" + c.waId + ":" + c.last.ts,
        title: c.name,
        time: PN.ago(c.last.ts),
        from: "de WhatsApp",
        body: c.last.body || "Mensaje",
        app: { initials: PN.initials(c.name) },
        badge: "wa",
        onClick: () => navigate("unibox")
      }));
      if (wItems.length) groups.push({
        id: "wa",
        label: "WhatsApp",
        more: (n) => `Ver las ${n} conversaciones`,
        go: () => navigate("unibox"),
        items: wItems,
        summary: wItems.length > 1 ? { ...wItems[0], from: `de WhatsApp \xB7 ${wItems.length} sin responder`, body: `${wItems[0].body}` } : null
      });
      const pLive = projs.filter((p) => live("p:" + p.id + ":" + p.deadline));
      const pItems = pLive.map((p) => ({
        key: "p:" + p.id + ":" + p.deadline,
        title: projTitle(p),
        time: PN.shortDay(p.deadline),
        from: "de Entregas",
        body: `Entrega ${PN.relDay(p.deadline)}.`,
        app: { initials: PN.initials(_noClient(p.clientName) ? p.name : p.clientName) },
        badge: "box",
        onClick: () => navigate("project", { projectId: p.id })
      }));
      if (pItems.length) groups.push({
        id: "deliveries",
        label: "Entregas",
        more: (n) => `Ver las ${n} entregas`,
        go: () => navigate("projects"),
        items: pItems,
        summary: pItems.length > 1 ? { ...pItems[0], body: `${pItems[0].body} Tambi\xE9n: ${PN.listMore(pLive.slice(1, 3).map(projShort), pLive.length - 1)}.` } : null
      });
      const fLive = follow.filter((o) => live("f:" + o.id + ":" + o.nextFollowup));
      const fItems = fLive.map((o) => ({
        key: "f:" + o.id + ":" + o.nextFollowup,
        title: o.brand || "Seguimiento",
        time: o.nextFollowup < today ? "Atrasado" : "Hoy",
        from: "de Seguimientos",
        body: o.notes || "Seguimiento pendiente.",
        app: { initials: PN.initials(o.brand) },
        badge: "send",
        onClick: () => navigate("outreach")
      }));
      if (fItems.length) groups.push({
        id: "followups",
        label: "Seguimientos",
        more: (n) => `Ver los ${n} seguimientos`,
        go: () => navigate("outreach"),
        items: fItems,
        summary: fItems.length > 1 ? { ...fItems[0], from: `de Seguimientos \xB7 ${fItems.length} para hoy`, body: `${String(fItems[0].body).split(/\.\s/)[0].replace(/\.$/, "")}. Tambi\xE9n: ${PN.listMore(fLive.slice(1, 3).map((o) => o.brand), fLive.length - 1)}.` } : null
      });
      const cur = groups.find((g) => g.id === open && g.items.length > 1);
      const rest = groups.filter((g) => g !== cur);
      const card = (it, extra) => /* @__PURE__ */ React.createElement(PN.Aviso, { key: it.key, ...it, ...extra });
      const collapsed = (g) => {
        if (g.items.length > 1) return /* @__PURE__ */ React.createElement(PN.Stack, { key: g.id }, card(g.summary, { key: void 0, onClick: () => setOpen(g.id) }));
        const it = g.items[0];
        return card(it, { onDismiss: g.empty ? void 0 : () => dismiss([it.key]) });
      };
      return /* @__PURE__ */ React.createElement("div", { className: "pn-stage" }, /* @__PURE__ */ React.createElement("div", { className: "pn-col" }, /* @__PURE__ */ React.createElement("div", { className: "pn-head" }, /* @__PURE__ */ React.createElement("p", { className: "t-small", style: { color: "var(--gray-300)", lineHeight: "20px" } }, PN.longDate(/* @__PURE__ */ new Date())), /* @__PURE__ */ React.createElement("h1", { className: "t-h2", style: { margin: "10px 0 0", color: "var(--ink-900)" } }, PN.greet(), first ? `, ${first}` : "", ".")), /* @__PURE__ */ React.createElement(PN.ScrollArea, { top: 212, bottom: 244 }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } }, cur && /* @__PURE__ */ React.createElement("div", { key: "open-" + cur.id, className: "pn-group-open", style: { display: "flex", flexDirection: "column", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { className: "pn-group-head" }, /* @__PURE__ */ React.createElement("p", { className: "t-title-l" }, cur.label), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }), /* @__PURE__ */ React.createElement(PN.Pill, { onClick: () => setOpen(null) }, "Mostrar menos"), /* @__PURE__ */ React.createElement("button", { className: "pn-round", "aria-label": "Descartar todo", onClick: () => {
        dismiss(cur.items.map((i) => i.key));
        setOpen(null);
      } }, /* @__PURE__ */ React.createElement(PIcon, { name: "x13" }))), cur.items.slice(0, 3).map((it, i) => card(it, { onDismiss: () => dismiss([it.key]), xShow: i === 0 })), cur.items.length > 3 && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "center", paddingBottom: 2 } }, /* @__PURE__ */ React.createElement(PN.Pill, { onClick: cur.go }, cur.more(cur.items.length)))), rest.map(collapsed))), /* @__PURE__ */ React.createElement(PN.NoraBox, { navigate, suggestions: ["Resumir mi d\xEDa", "\xBFQu\xE9 tengo pendiente hoy?", "Redactar seguimiento"] })));
    };
    window.PanelHome = PanelHome;
  })();
})();

(() => {
  (() => {
    const { useState, useEffect, useRef } = React;
    const PN = window.PN;
    const s = (d, w) => PIcon.st(d, w);
    PIcon.add({
      "c-task": [16, s("M7.99967 13.6667C11.1293 13.6667 13.6663 11.1296 13.6663 8C13.6663 4.87039 11.1293 2.33334 7.99967 2.33334C4.87006 2.33334 2.33301 4.87039 2.33301 8C2.33301 11.1296 4.87006 13.6667 7.99967 13.6667Z", 1.13333) + s("M5.66699 8.13333L7.26699 9.73333L10.467 6.4", 1.13333)],
      "c-proj": [16, s("M2.33301 5.00001C2.33301 4.64638 2.47348 4.30724 2.72353 4.0572C2.97358 3.80715 3.31272 3.66667 3.66634 3.66667H6.33301L7.66634 5.33334H12.333C12.6866 5.33334 13.0258 5.47381 13.2758 5.72386C13.5259 5.97391 13.6663 6.31305 13.6663 6.66667V12C13.6663 12.3536 13.5259 12.6928 13.2758 12.9428C13.0258 13.1929 12.6866 13.3333 12.333 13.3333H3.66634C3.31272 13.3333 2.97358 13.1929 2.72353 12.9428C2.47348 12.6928 2.33301 12.3536 2.33301 12V5.00001Z", 1.13333)],
      "c-cli": [16, s("M8.00013 8.2C9.39925 8.2 10.5335 7.06579 10.5335 5.66666C10.5335 4.26754 9.39925 3.13333 8.00013 3.13333C6.60101 3.13333 5.4668 4.26754 5.4668 5.66666C5.4668 7.06579 6.60101 8.2 8.00013 8.2Z", 1.13333) + s("M3 13.6667C3.53333 11.1333 5.53333 9.66667 8 9.66667C10.4667 9.66667 12.4667 11.1333 13 13.6667", 1.13333)],
      "c-ev": [16, s("M11.9997 3.33333H3.99967C3.0792 3.33333 2.33301 4.07952 2.33301 4.99999V12C2.33301 12.9205 3.0792 13.6667 3.99967 13.6667H11.9997C12.9201 13.6667 13.6663 12.9205 13.6663 12V4.99999C13.6663 4.07952 12.9201 3.33333 11.9997 3.33333Z", 1.13333) + s("M2.33301 6.66667H13.6663M5.33301 2V4.66667M10.6663 2V4.66667", 1.13333)],
      "c-mail": [16, s("M12 3.33334H4C2.89543 3.33334 2 4.22877 2 5.33334V10.6667C2 11.7712 2.89543 12.6667 4 12.6667H12C13.1046 12.6667 14 11.7712 14 10.6667V5.33334C14 4.22877 13.1046 3.33334 12 3.33334Z", 1.13333) + s("M2.66699 4.66666L8.00033 8.66666L13.3337 4.66666", 1.13333)],
      "c-prop": [16, s("M4 2H10L12.6667 4.66667V14H4V2Z", 1.13333) + s("M6 7.33334H10.6667M6 9.66668H10.6667M6 12H8.66667", 1.13333)],
      "c-inv": [16, s("M10.9997 2H4.99967C4.0792 2 3.33301 2.74619 3.33301 3.66667V12.3333C3.33301 13.2538 4.0792 14 4.99967 14H10.9997C11.9201 14 12.6663 13.2538 12.6663 12.3333V3.66667C12.6663 2.74619 11.9201 2 10.9997 2Z", 1.13333) + s("M5.66699 4.66666H10.3337M5.66699 7.33332H10.3337M5.66699 9.99999H8.33366", 1.13333)],
      "c-nora": [16, s("M8.00033 2.66666V5.33332M8.00033 10.6667V13.3333M2.66699 7.99999H5.33366M10.667 7.99999H13.3337M4.33366 4.33332L6.00033 5.99999M10.0003 9.99999L11.667 11.6667M11.667 4.33332L10.0003 5.99999M6.00033 9.99999L4.33366 11.6667", 1.13333)],
      "n-check": [13, s("M2.70801 6.77084L4.87467 8.9375L10.2913 3.52084", 1.08333)],
      "n-send": [9, s("M7.875 1.125L3.9375 5.0625M3.9375 5.0625L1.125 3.5625L7.875 1.125L5.4375 7.875L3.9375 5.0625Z", 0.9)],
      "n-box": [9, s("M3.75 4.6875H5.25M1.3125 3.1875H7.6875V7.3125C7.6875 7.46168 7.62824 7.60476 7.52275 7.71025C7.41726 7.81574 7.27418 7.875 7.125 7.875H1.875C1.72582 7.875 1.58274 7.81574 1.47725 7.71025C1.37176 7.60476 1.3125 7.46168 1.3125 7.3125V3.1875ZM1.125 1.6875H7.875V3.1875H1.125V1.6875Z", 0.9)],
      "n-doc": [17, s("M11.6878 2.125H5.31283C4.33482 2.125 3.54199 2.91783 3.54199 3.89583V13.1042C3.54199 14.0822 4.33482 14.875 5.31283 14.875H11.6878C12.6658 14.875 13.4587 14.0822 13.4587 13.1042V3.89583C13.4587 2.91783 12.6658 2.125 11.6878 2.125Z", 1.20417) + s("M6.02051 4.95834H10.9788M6.02051 7.79168H10.9788M6.02051 10.625H8.85384", 1.20417)],
      "n-spark": [17, s("M8.49967 2.83334V5.66668M8.49967 11.3333V14.1667M2.83301 8.50001H5.66634M11.333 8.50001H14.1663M4.60384 4.60418L6.37467 6.37501M10.6247 10.625L12.3955 12.3958M12.3955 4.60418L10.6247 6.37501M6.37467 10.625L4.60384 12.3958", 1.20417)],
      "n-folder": [17, s("M2.47949 5.31248C2.47949 4.93676 2.62875 4.57642 2.89442 4.31074C3.1601 4.04507 3.52044 3.89581 3.89616 3.89581H6.72949L8.14616 5.66665H13.1045C13.4802 5.66665 13.8405 5.8159 14.1062 6.08158C14.3719 6.34726 14.5212 6.70759 14.5212 7.08331V12.75C14.5212 13.1257 14.3719 13.486 14.1062 13.7517C13.8405 14.0174 13.4802 14.1666 13.1045 14.1666H3.89616C3.52044 14.1666 3.1601 14.0174 2.89442 13.7517C2.62875 13.486 2.47949 13.1257 2.47949 12.75V5.31248Z", 1.20417)],
      "n-gear": [15, s("M7.5 9.375C8.53553 9.375 9.375 8.53553 9.375 7.5C9.375 6.46447 8.53553 5.625 7.5 5.625C6.46447 5.625 5.625 6.46447 5.625 7.5C5.625 8.53553 6.46447 9.375 7.5 9.375Z", 1.0625) + s("M7.5 1.5625V3.4375M7.5 11.5625V13.4375M1.5625 7.5H3.4375M11.5625 7.5H13.4375M3.3125 3.3125L4.625 4.625M10.375 10.375L11.6875 11.6875M3.3125 11.6875L4.625 10.375M10.375 4.625L11.6875 3.3125", 1.0625)]
    });
    const _isMac = /Mac|iPhone|iPad/.test(navigator.platform || "");
    const _mod = _isMac ? "\u2318" : "Ctrl";
    const _mailCreds = () => {
      try {
        return JSON.parse(localStorage.getItem("141_mail_creds") || "null");
      } catch (_) {
        return null;
      }
    };
    const createItems = (navigate, openModal) => [
      { k: "task", icon: "c-task", label: "Tarea", key: "n", run: () => openModal("newTask") },
      { k: "project", icon: "c-proj", label: "Proyecto", key: "p", run: () => openModal("newProject") },
      { k: "client", icon: "c-cli", label: "Cliente", key: "k", run: () => openModal("newClient") },
      { k: "event", icon: "c-ev", label: "Evento", key: "e", run: () => openModal("newEvent") },
      { sep: true },
      { k: "msg", icon: "c-mail", label: "Email o mensaje", key: "m", run: () => navigate("unibox", { compose: _mailCreds() ? "mail" : "wa" }) },
      { k: "proposal", icon: "c-prop", label: "Propuesta", run: () => navigate("outreach") },
      { k: "invoice", icon: "c-inv", label: "Factura", key: "f", run: () => openModal("newInvoice") },
      { sep: true },
      { k: "nora", icon: "c-nora", label: "Ped\xEDrselo a Nora", key: "j", run: () => navigate("nora") }
    ];
    const useDismiss = (ref, onClose, ignore) => {
      useEffect(() => {
        const down = (e) => {
          if (ref.current && ref.current.contains(e.target)) return;
          if (ignore && e.target.closest && e.target.closest(ignore)) return;
          onClose();
        };
        const key = (e) => {
          if (e.key === "Escape") onClose();
        };
        document.addEventListener("mousedown", down);
        window.addEventListener("keydown", key);
        return () => {
          document.removeEventListener("mousedown", down);
          window.removeEventListener("keydown", key);
        };
      }, []);
    };
    const PanelCreateMenu = ({ navigate, openModal, onClose }) => {
      const ref = useRef(null);
      useDismiss(ref, onClose, ".pn-act");
      PN.useSheetSwipe(ref, onClose);
      const items = createItems(navigate, openModal);
      const acts = items.filter((i) => !i.sep);
      const [hi, setHi] = useState(0);
      const pick = (it) => {
        onClose();
        it.run();
      };
      useEffect(() => {
        const key = (e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHi((i) => (i + 1) % acts.length);
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setHi((i) => (i - 1 + acts.length) % acts.length);
          }
          if (e.key === "Enter") {
            e.preventDefault();
            setHi((i) => {
              pick(acts[i]);
              return i;
            });
          }
        };
        window.addEventListener("keydown", key);
        return () => window.removeEventListener("keydown", key);
      }, []);
      return /* @__PURE__ */ React.createElement("div", { className: "pn-cmenu", ref, role: "menu" }, /* @__PURE__ */ React.createElement("div", { className: "pn-bs-grab" }), /* @__PURE__ */ React.createElement("p", { className: "t-caption ttl" }, "Crear"), items.map((it, i) => it.sep ? /* @__PURE__ */ React.createElement("div", { key: "s" + i, className: "sep" }) : /* @__PURE__ */ React.createElement(
        "button",
        {
          key: it.k,
          role: "menuitem",
          className: "it" + (acts[hi] === it ? " on" : ""),
          onMouseEnter: () => setHi(acts.indexOf(it)),
          onClick: () => pick(it)
        },
        /* @__PURE__ */ React.createElement(PIcon, { name: it.icon }),
        /* @__PURE__ */ React.createElement("span", { className: "t-small lb" }, it.label),
        it.key && /* @__PURE__ */ React.createElement("span", { className: "t-caption kb" }, _mod, " ", it.key.toUpperCase())
      )));
    };
    const READ_KEY = "pn_nread";
    const _readSet = () => {
      try {
        return new Set(JSON.parse(localStorage.getItem(READ_KEY) || "[]"));
      } catch (_) {
        return /* @__PURE__ */ new Set();
      }
    };
    const _saveRead = (set) => {
      try {
        localStorage.setItem(READ_KEY, JSON.stringify(Array.from(set).slice(-400)));
      } catch (_) {
      }
    };
    const _waMatch = (a, b) => {
      const x = String(a || "").replace(/\D/g, ""), y = String(b || "").replace(/\D/g, "");
      return !!x && !!y && (x === y || x.slice(-9) === y.slice(-9));
    };
    const _noClient = (n) => !n || ["\u2014", "-", "Interno", "Sin cliente"].includes(String(n).trim());
    const _iso = (v) => {
      if (!v) return null;
      const s2 = String(v);
      return /^\d{4}-\d{2}-\d{2}$/.test(s2) ? s2 + "T09:00:00" : s2;
    };
    const _time = (iso) => {
      if (!iso) return "";
      const d = new Date(iso);
      if (isNaN(d.getTime())) return "";
      const n = PN.dayDiff(PN.ymd(d));
      if (n === 0) return /T\d/.test(String(iso)) && !/T09:00:00$/.test(String(iso)) ? d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) : "Hoy";
      if (n === -1) return "Ayer";
      return PN.shortDay(PN.ymd(d));
    };
    const useNotifs = (navigate, openModal) => {
      const D = window.Data;
      D.useStore();
      const [read, setRead] = useState(_readSet);
      const today = D.today ? D.today() : PN.ymd(/* @__PURE__ */ new Date());
      const items = [];
      (D.NOTIFICATIONS || []).filter((n) => n.target === "agency").forEach((n) => {
        const c = n.clientId ? (D.CLIENTS || []).find((x) => x.id === n.clientId) : null;
        const cn = c ? c.company || c.name : "";
        items.push({
          key: "n:" + n.id,
          db: n.id,
          at: n.createdAt,
          cat: c ? "client" : "system",
          title: cn ? `${n.title} \xB7 ${cn}` : n.title,
          body: n.body,
          av: c ? { initials: PN.initials(cn) } : { icon: "n-doc" },
          unread: !n.read,
          go: () => navigate(c ? "clientDetail" : "dashboard", c ? { clientId: c.id } : {})
        });
      });
      const waBy = {};
      (D.WHATSAPP || []).forEach((m) => {
        (waBy[m.waId] = waBy[m.waId] || []).push(m);
      });
      Object.keys(waBy).forEach((waId) => {
        const arr = waBy[waId].slice().sort((a, b) => a.ts < b.ts ? -1 : 1);
        const last = arr[arr.length - 1];
        if (!last || last.direction !== "in") return;
        const c = (D.CLIENTS || []).find((x) => _waMatch(x.whatsapp || x.phone, waId));
        const name = c ? c.company || c.name : arr.map((m) => m.contactName).filter(Boolean).pop() || "+" + waId;
        const key = "w:" + waId + ":" + last.ts;
        const open = () => navigate("unibox", { open: "wa:" + waId });
        items.push({
          key,
          at: last.ts,
          cat: "client",
          title: name,
          body: last.body || "Mensaje",
          av: { initials: PN.initials(name) },
          badge: "wa",
          unread: !read.has(key),
          go: open,
          acts: [["Responder", open, true]]
        });
      });
      (D.OUTREACH || []).filter((o) => o.status === "respondio" && !o.convertedClientId).forEach((o) => {
        const key = "o:" + o.id;
        const who = [o.contact, o.brand].filter(Boolean).join(" \xB7 ") || "Cold email";
        const open = () => navigate("unibox", o.email ? { open: "mail:" + String(o.email).toLowerCase() } : {});
        items.push({
          key,
          at: _iso(o.lastContacted),
          cat: "client",
          title: who,
          body: "Ha respondido a tu cold email.",
          av: { initials: o.contact && o.brand ? (o.contact.trim()[0] + o.brand.trim()[0]).toUpperCase() : PN.initials(o.brand || o.contact) },
          badge: "send",
          unread: !read.has(key),
          go: open,
          acts: [["Responder", open, true], ["Agendar", () => openModal("newEvent"), false]]
        });
      });
      (D.INVOICES || []).filter((i) => i.status === "paid" && i.paidAt && PN.dayDiff(String(i.paidAt).slice(0, 10)) >= -7).forEach((i) => {
        const key = "i:" + i.id;
        const who = i.clientName || ((D.CLIENTS || []).find((c) => c.id === i.clientId) || {}).company || "Un cliente";
        items.push({
          key,
          at: _iso(i.paidAt),
          cat: "client",
          title: "Factura pagada",
          body: `${who} ha pagado la factura${i.project ? " de " + String(i.project).toLowerCase() : ""}.`,
          av: { icon: "n-doc" },
          unread: !read.has(key),
          go: () => navigate("billing")
        });
      });
      (D.PROJECTS || []).forEach((p) => {
        const tks = D.TASKS && D.TASKS[p.id] || [];
        const done = tks.length && tks.every((t) => t.column === "done");
        if (done || (p.progress || 0) >= 100) return;
        const name = _noClient(p.clientName) ? p.name : `${p.clientName}`;
        const dd = p.deadline && PN.parseYmd(p.deadline) ? PN.dayDiff(p.deadline) : null;
        if (dd !== null && dd >= 0 && dd <= 3) {
          const key = "d:" + p.id + ":" + p.deadline;
          items.push({
            key,
            at: _iso(today),
            cat: "client",
            title: `Entrega \xB7 ${name}`,
            body: `${p.name} se entrega ${PN.relDay(p.deadline)}.`,
            av: { initials: PN.initials(name) },
            badge: "box",
            unread: !read.has(key),
            go: () => navigate("project", { projectId: p.id })
          });
        }
        if (!tks.length) {
          const key = "r:" + p.id;
          items.push({
            key,
            at: _iso(p.createdAt || p.created_at),
            cat: "system",
            title: name,
            body: "Proyecto en zona de riesgo: todav\xEDa no tiene tareas.",
            red: true,
            av: { icon: "n-folder" },
            unread: !read.has(key),
            go: () => navigate("project", { projectId: p.id })
          });
        }
      });
      items.sort((a, b) => String(b.at || "") > String(a.at || "") ? 1 : -1);
      const markRead = (it) => {
        if (it.db) {
          try {
            D.markNotificationRead(it.db);
          } catch (_) {
          }
          return;
        }
        setRead((prev) => {
          const n = new Set(prev);
          n.add(it.key);
          _saveRead(n);
          return n;
        });
      };
      const markAll = () => {
        try {
          D.markAllNotificationsRead && D.markAllNotificationsRead();
        } catch (_) {
        }
        setRead((prev) => {
          const n = new Set(prev);
          items.forEach((i) => {
            if (!i.db) n.add(i.key);
          });
          _saveRead(n);
          return n;
        });
      };
      return { items, unread: items.filter((i) => i.unread).length, markRead, markAll, today };
    };
    const FILTERS = [["all", "Todas"], ["unread", "Sin leer"], ["client", "Clientes"], ["nora", "Nora"]];
    const PanelNotifs = ({ navigate, openModal, onClose, N }) => {
      const ref = useRef(null);
      useDismiss(ref, onClose, ".pn-act");
      PN.useSheetSwipe(ref, onClose);
      const [f, setF] = useState("all");
      const list = N.items.filter((i) => f === "all" ? true : f === "unread" ? i.unread : f === "client" ? i.cat === "client" : i.cat === "nora");
      const sec = (it) => {
        const d = it.at ? PN.dayDiff(PN.ymd(new Date(it.at))) : -99;
        return d === 0 ? "Hoy" : d === -1 ? "Ayer" : "Anteriores";
      };
      const firstAct = list.find((i) => i.unread && i.acts);
      const open = (it) => {
        N.markRead(it);
        onClose();
        it.go();
      };
      let last = null;
      return /* @__PURE__ */ React.createElement("div", { className: "pn-npanel", ref }, /* @__PURE__ */ React.createElement("div", { className: "pn-bs-grab" }), /* @__PURE__ */ React.createElement("div", { className: "hd" }, /* @__PURE__ */ React.createElement("p", { className: "ttl" }, "Notificaciones"), N.unread > 0 && /* @__PURE__ */ React.createElement("span", { className: "ct" }, N.unread), /* @__PURE__ */ React.createElement("span", { style: { flex: 1 } }), N.unread > 0 && /* @__PURE__ */ React.createElement("button", { className: "all", onClick: N.markAll }, /* @__PURE__ */ React.createElement(PIcon, { name: "n-check" }), /* @__PURE__ */ React.createElement("span", null, "Marcar todo como le\xEDdo"))), /* @__PURE__ */ React.createElement("div", { className: "flt" }, FILTERS.map(([k, l]) => /* @__PURE__ */ React.createElement("button", { key: k, className: f === k ? "on" : "", onClick: () => setF(k) }, l))), /* @__PURE__ */ React.createElement("div", { className: "lst pn-bs-scroll" }, list.length === 0 && /* @__PURE__ */ React.createElement("div", { className: "emp" }, /* @__PURE__ */ React.createElement("p", { className: "tt" }, f === "nora" ? "Nora no te ha dejado avisos" : f === "unread" ? "Lo tienes todo le\xEDdo" : "Sin notificaciones"), /* @__PURE__ */ React.createElement("p", { className: "sb" }, f === "nora" ? "Cuando prepare algo para ti, aparecer\xE1 aqu\xED." : "Aqu\xED ver\xE1s mensajes de clientes, pagos y entregas.")), list.map((it) => {
        const s2 = sec(it);
        const head = s2 !== last ? (last = s2, /* @__PURE__ */ React.createElement("p", { key: "h" + s2, className: "sec" }, s2)) : null;
        const hl = it === firstAct;
        return /* @__PURE__ */ React.createElement(React.Fragment, { key: it.key }, head, /* @__PURE__ */ React.createElement(
          "div",
          {
            className: "it" + (hl ? " hl" : "") + (it.unread ? "" : " rd"),
            role: "button",
            tabIndex: 0,
            onClick: () => open(it),
            onKeyDown: (e) => {
              if (e.key === "Enter") open(it);
            }
          },
          /* @__PURE__ */ React.createElement("div", { className: "av" + (it.av.icon ? " ic" : "") }, it.av.icon ? /* @__PURE__ */ React.createElement(PIcon, { name: it.av.icon }) : it.av.initials, it.badge && /* @__PURE__ */ React.createElement("span", { className: "bd" + (it.badge === "wa" ? " wa" : "") }, /* @__PURE__ */ React.createElement(PIcon, { name: it.badge === "wa" ? "b-wa" : "n-" + it.badge, size: it.badge === "wa" ? 10 : 9 }))),
          /* @__PURE__ */ React.createElement("div", { className: "tx" }, /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("p", { className: "nm" }, it.title), /* @__PURE__ */ React.createElement("p", { className: "tm" }, _time(it.at)), it.unread && /* @__PURE__ */ React.createElement("i", { className: "dot" })), /* @__PURE__ */ React.createElement("p", { className: "bd2" + (it.red ? " red" : "") }, it.body), hl && /* @__PURE__ */ React.createElement("div", { className: "acts" }, it.acts.map(([l, fn, pri]) => /* @__PURE__ */ React.createElement("button", { key: l, className: pri ? "pri" : "", onClick: (e) => {
            e.stopPropagation();
            N.markRead(it);
            onClose();
            fn();
          } }, l))))
        ));
      })), /* @__PURE__ */ React.createElement("div", { className: "ft" }, /* @__PURE__ */ React.createElement("button", { className: "all2", onClick: () => {
        onClose();
        navigate("unibox");
      } }, "Ver todas"), /* @__PURE__ */ React.createElement("button", { className: "cfg", "aria-label": "Ajustes de avisos", onClick: () => {
        onClose();
        navigate("settings");
      } }, /* @__PURE__ */ React.createElement(PIcon, { name: "n-gear" }))));
    };
    const useCreateShortcuts = (navigate, openModal, blocked) => {
      useEffect(() => {
        const onKey = (e) => {
          if (!(e.metaKey || e.ctrlKey) || e.shiftKey || e.altKey) return;
          if (blocked && blocked.current || document.querySelector(".pn-win-bg, .pn-sheet-bg")) return;
          const k = (e.key || "").toLowerCase();
          if (k === "j") return;
          const it = createItems(navigate, openModal).find((i) => i.key === k);
          if (!it) return;
          e.preventDefault();
          it.run();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
      }, []);
    };
    Object.assign(window, { PanelCreateMenu, PanelNotifs, usePanelNotifs: useNotifs, usePanelCreateShortcuts: useCreateShortcuts });
  })();
})();

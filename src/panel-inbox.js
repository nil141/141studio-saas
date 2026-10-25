(() => {
  (() => {
    const { useState, useEffect, useRef, useMemo } = React;
    const PN = window.PN;
    PIcon.add({
      "b-mail": [10, `<path d="M7.5 2.08325H2.5C1.80964 2.08325 1.25 2.6429 1.25 3.33325V6.66658C1.25 7.35694 1.80964 7.91658 2.5 7.91658H7.5C8.19036 7.91658 8.75 7.35694 8.75 6.66658V3.33325C8.75 2.6429 8.19036 2.08325 7.5 2.08325Z" stroke="white" stroke-width="0.916667" stroke-linecap="round" stroke-linejoin="round"/><path d="M1.66666 2.91675L4.99999 5.41675L8.33332 2.91675" stroke="white" stroke-width="0.916667" stroke-linecap="round" stroke-linejoin="round"/>`],
      "b-ig": [10, `<path d="M6.45834 1.45825H3.54168C2.39108 1.45825 1.45834 2.39099 1.45834 3.54159V6.45825C1.45834 7.60885 2.39108 8.54158 3.54168 8.54158H6.45834C7.60894 8.54158 8.54168 7.60885 8.54168 6.45825V3.54159C8.54168 2.39099 7.60894 1.45825 6.45834 1.45825Z" stroke="white" stroke-width="0.916667" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.00001 6.66659C5.92048 6.66659 6.66668 5.92039 6.66668 4.99992C6.66668 4.07944 5.92048 3.33325 5.00001 3.33325C4.07954 3.33325 3.33334 4.07944 3.33334 4.99992C3.33334 5.92039 4.07954 6.66659 5.00001 6.66659Z" stroke="white" stroke-width="0.916667" stroke-linecap="round" stroke-linejoin="round"/>`],
      "c-mail": [9, `<path d="M6.75 1.875H2.25C1.62868 1.875 1.125 2.37868 1.125 3V6C1.125 6.62132 1.62868 7.125 2.25 7.125H6.75C7.37132 7.125 7.875 6.62132 7.875 6V3C7.875 2.37868 7.37132 1.875 6.75 1.875Z" stroke="white" stroke-width="0.7875" stroke-linecap="round" stroke-linejoin="round"/><path d="M1.5 2.625L4.5 4.875L7.5 2.625" stroke="white" stroke-width="0.7875" stroke-linecap="round" stroke-linejoin="round"/>`],
      "c-send": [9, `<path d="M7.875 1.125L3.9375 5.0625M3.9375 5.0625L1.125 3.5625L7.875 1.125L5.4375 7.875L3.9375 5.0625Z" stroke="white" stroke-width="0.7875" stroke-linecap="round" stroke-linejoin="round"/>`],
      "c-ig": [9, `<path d="M5.8125 1.3125H3.1875C2.15197 1.3125 1.3125 2.15197 1.3125 3.1875V5.8125C1.3125 6.84803 2.15197 7.6875 3.1875 7.6875H5.8125C6.84803 7.6875 7.6875 6.84803 7.6875 5.8125V3.1875C7.6875 2.15197 6.84803 1.3125 5.8125 1.3125Z" stroke="white" stroke-width="0.7875" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.5 6C5.32843 6 6 5.32843 6 4.5C6 3.67157 5.32843 3 4.5 3C3.67157 3 3 3.67157 3 4.5C3 5.32843 3.67157 6 4.5 6Z" stroke="white" stroke-width="0.7875" stroke-linecap="round" stroke-linejoin="round"/>`],
      "back": [16, `<path d="M10 3.33325L5.33337 7.99992L10 12.6666" stroke="currentColor" stroke-width="1.13333" stroke-linecap="round" stroke-linejoin="round"/>`],
      "cal16": [16, `<path d="M11.9999 3.33325H3.99992C3.07944 3.33325 2.33325 4.07944 2.33325 4.99992V11.9999C2.33325 12.9204 3.07944 13.6666 3.99992 13.6666H11.9999C12.9204 13.6666 13.6666 12.9204 13.6666 11.9999V4.99992C13.6666 4.07944 12.9204 3.33325 11.9999 3.33325Z" stroke="currentColor" stroke-width="1.13333" stroke-linecap="round" stroke-linejoin="round"/><path d="M2.33325 6.66667H13.6666M5.33325 2V4.66667M10.6666 2V4.66667" stroke="currentColor" stroke-width="1.13333" stroke-linecap="round" stroke-linejoin="round"/>`],
      "archive": [16, `<path d="M6.66667 8.33333H9.33333M2.33333 5.66667H13.6667V13C13.6667 13.2652 13.5613 13.5196 13.3738 13.7071C13.1862 13.8946 12.9319 14 12.6667 14H3.33333C3.06812 14 2.81376 13.8946 2.62623 13.7071C2.43869 13.5196 2.33333 13.2652 2.33333 13V5.66667ZM2 3H14V5.66667H2V3Z" stroke="currentColor" stroke-width="1.13333" stroke-linecap="round" stroke-linejoin="round"/>`],
      "attach": [13, `<path d="M8.39589 3.52095L4.55005 7.36678C4.39359 7.5754 4.31763 7.83346 4.33611 8.09358C4.3546 8.3537 4.46629 8.59842 4.65069 8.78282C4.83508 8.96721 5.07981 9.07891 5.33993 9.09739C5.60004 9.11588 5.8581 9.03992 6.06672 8.88345L10.0751 4.87512C10.388 4.45788 10.5399 3.94176 10.5029 3.42152C10.466 2.90129 10.2426 2.41184 9.87379 2.04305C9.505 1.67426 9.01555 1.45087 8.49531 1.4139C7.97508 1.37693 7.45896 1.52885 7.04172 1.84178L3.03339 5.85012C2.42284 6.46067 2.07983 7.28875 2.07983 8.1522C2.07983 9.01565 2.42284 9.84373 3.03339 10.4543C3.64394 11.0648 4.47202 11.4078 5.33547 11.4078C6.19892 11.4078 7.027 11.0648 7.63756 10.4543L11.3751 6.71678" stroke="currentColor" stroke-width="0.920833" stroke-linecap="round" stroke-linejoin="round"/>`],
      "b-send12": [12, `<path d="M10.5 1.5L5.25 6.75M5.25 6.75L1.5 4.75L10.5 1.5L7.25 10.5L5.25 6.75Z" stroke="white" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>`]
    });
    const CHANNELS = [
      { id: "mail", label: "Gmail", cls: "mail", icon: "c-mail", badge: "b-mail" },
      { id: "cold", label: "Cold email", cls: "cold", icon: "c-send", badge: "b-send" },
      { id: "wa", label: "WhatsApp", cls: "wa", icon: "b-wa", badge: "b-wa" },
      { id: "ig", label: "Instagram", cls: "ig", icon: "c-ig", badge: "b-ig" }
    ];
    const CH = Object.fromEntries(CHANNELS.map((c) => [c.id, c]));
    const _HOT = { respondio: "Respondi\xF3", propuesta: "Loom enviado", conversacion: "Reuni\xF3n / precio", cerrado: "Cerrado" };
    const _ARCH_KEY = "pn_inbox_archived";
    const _readArch = () => {
      try {
        return JSON.parse(localStorage.getItem(_ARCH_KEY) || "{}") || {};
      } catch (_) {
        return {};
      }
    };
    const _listTime = (iso) => {
      if (!iso) return "";
      const d = new Date(iso), now = /* @__PURE__ */ new Date();
      const day = (x) => {
        const y = new Date(x);
        y.setHours(0, 0, 0, 0);
        return y;
      };
      const diff = Math.round((day(now) - day(d)) / 864e5);
      if (diff <= 0) return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
      if (diff === 1) return "Ayer";
      if (diff < 7) return PN.DIAS_C[d.getDay()];
      return `${d.getDate()} ${PN.MESES[d.getMonth()].slice(0, 3)}`;
    };
    const _dayLabel = (iso) => {
      const d = new Date(iso), n = PN.dayDiff(PN.ymd(d));
      return n === 0 ? "Hoy" : n === -1 ? "Ayer" : PN.longDate(d);
    };
    const _hm = (iso) => {
      try {
        return new Date(iso).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
      } catch (_) {
        return "";
      }
    };
    const _first = (name) => String(name || "").replace(/\s*·.*$/, "").trim().split(/\s+/)[0] || "";
    const _plain = (html) => {
      try {
        const d = new DOMParser().parseFromString(html || "", "text/html");
        return (d.body.textContent || "").replace(/\n{3,}/g, "\n\n").trim();
      } catch (_) {
        return "";
      }
    };
    const Av = ({ name, ch, big }) => /* @__PURE__ */ React.createElement("div", { className: "pn-app" + (big ? " big" : "") }, PN.initials(name), /* @__PURE__ */ React.createElement("span", { className: "pn-badge ch-" + ch }, /* @__PURE__ */ React.createElement(PIcon, { name: big && ch === "cold" ? "b-send12" : CH[ch].badge })));
    const Tag = ({ children }) => /* @__PURE__ */ React.createElement("span", { className: "pn-tag t-caption" }, children);
    const Sheet = ({ title, onClose, children, width = 440 }) => ReactDOM.createPortal(
      /* @__PURE__ */ React.createElement("div", { className: "pn-sheet-bg", onClick: onClose }, /* @__PURE__ */ React.createElement("div", { className: "pn-sheet", style: { maxWidth: width }, onClick: (e) => e.stopPropagation() }, title && /* @__PURE__ */ React.createElement("p", { className: "t-title-m", style: { color: "var(--ink-900)", marginBottom: 14 } }, title), children)),
      document.body
    );
    const PanelInbox = ({ navigate, openModal, compose, open }) => {
      const D = window.Data;
      D.useStore();
      const K = window.PNInboxKit || {};
      const toast = typeof useToast === "function" ? useToast() : null;
      const mail = K.useMailInbox ? K.useMailInbox(true) : { creds: null, mails: [], reload() {
      }, markRead() {
      }, setCreds() {
      } };
      const [filter, setFilterS] = useState(() => {
        try {
          return localStorage.getItem("pn_inbox_filter") || "all";
        } catch (_) {
          return "all";
        }
      });
      const setFilter = (f) => {
        setFilterS(f);
        try {
          localStorage.setItem("pn_inbox_filter", f);
        } catch (_) {
        }
      };
      const [sel, setSel] = useState(open || null);
      const [olderOpen, setOlderOpen] = useState(false);
      const [arch, setArch] = useState(_readArch);
      const [sheet, setSheet] = useState(null);
      const [draftChat, setDraftChat] = useState(null);
      useEffect(() => {
        if (compose === "wa") setSheet("chat");
        else if (compose === "mail") setSheet(mail.creds ? "compose" : "mail");
      }, [compose]);
      useEffect(() => {
        const tick = () => {
          try {
            D.reloadWhatsapp && D.reloadWhatsapp();
          } catch (_) {
          }
        };
        tick();
        const id = setInterval(() => {
          if (!document.hidden) tick();
        }, 4e3);
        return () => clearInterval(id);
      }, []);
      const clients = D.CLIENTS || [];
      const outreach = D.OUTREACH || [];
      const leadFor = (name, addr) => {
        const n = String(name || "").toLowerCase().trim(), a = String(addr || "").toLowerCase().trim();
        return outreach.find((x) => a && x.email && x.email.toLowerCase() === a || n && x.brand && x.brand.toLowerCase() === n) || null;
      };
      const tagFor = (name, addr) => {
        const o = leadFor(name, addr);
        return o && _HOT[o.status] ? _HOT[o.status] : null;
      };
      const convs = useMemo(() => {
        const out = [];
        const by = {};
        (D.WHATSAPP || []).forEach((m) => {
          (by[m.waId] = by[m.waId] || []).push(m);
        });
        if (draftChat && !by[draftChat.waId]) by[draftChat.waId] = [];
        Object.keys(by).forEach((waId) => {
          const arr = by[waId].slice().sort((a, b) => a.ts < b.ts ? -1 : 1);
          const last = arr[arr.length - 1];
          const client = clients.find((c) => K.waMatch && K.waMatch(c.whatsapp || c.phone, waId)) || (draftChat && draftChat.waId === waId ? draftChat.client : null);
          const name = client ? client.company || client.name : arr.map((m) => m.contactName).filter(Boolean).pop() || (draftChat && draftChat.waId === waId ? draftChat.name : "+" + waId);
          out.push({
            key: "wa:" + waId,
            ch: "wa",
            waId,
            arr,
            client,
            name,
            ts: last ? last.ts : (/* @__PURE__ */ new Date()).toISOString(),
            preview: last ? (last.direction === "out" ? "T\xFA: " : "") + (last.body || "\u2014") : "Escribe el primer mensaje.",
            unread: !!(last && last.direction === "in"),
            tag: tagFor(name, null)
          });
        });
        const mby = {};
        (mail.mails || []).forEach((m) => {
          const a = (K.mailAddr ? K.mailAddr(m.from) : m.from).toLowerCase();
          (mby[a] = mby[a] || []).push(m);
        });
        Object.keys(mby).forEach((addr) => {
          const list = mby[addr].slice().sort((a, b) => K.mailIso(a.date) < K.mailIso(b.date) ? -1 : 1);
          const last = list[list.length - 1];
          const client = clients.find((c) => c.email && c.email.toLowerCase() === addr);
          const person = K.mailName(last.from);
          const lead = client ? null : leadFor(person, addr);
          const name = client ? client.company || client.name : lead ? lead.brand : person;
          const full = lead && person && person.toLowerCase() !== String(lead.brand).toLowerCase() && !/@/.test(person) ? `${person} \xB7 ${lead.brand}` : name;
          out.push({
            key: "mail:" + addr,
            ch: "mail",
            addr,
            mails: list,
            client,
            name,
            full,
            ts: K.mailIso(last.date),
            preview: last.subject || "(sin asunto)",
            unread: list.some((m) => !m.read),
            tag: tagFor(name, addr)
          });
        });
        return out.sort((a, b) => a.ts < b.ts ? 1 : a.ts > b.ts ? -1 : 0);
      }, [D.WHATSAPP, mail.mails, clients, outreach, draftChat]);
      const visible = convs.filter((c) => !(arch[c.key] && arch[c.key] >= c.ts) && (filter === "all" || c.ch === filter));
      const unread = visible.filter((c) => c.unread), older = visible.filter((c) => !c.unread);
      const nUnread = convs.filter((c) => c.unread && !(arch[c.key] && arch[c.key] >= c.ts)).length;
      const cur = sel ? convs.find((c) => c.key === sel) : null;
      const archive = (c) => {
        const next = { ...arch, [c.key]: c.ts };
        setArch(next);
        try {
          localStorage.setItem(_ARCH_KEY, JSON.stringify(next));
        } catch (_) {
        }
        setSel(null);
        toast && toast("Conversaci\xF3n archivada");
      };
      const Row = (c) => /* @__PURE__ */ React.createElement("button", { key: c.key, className: "pn-conv" + (c.unread ? "" : " read"), onClick: () => setSel(c.key) }, /* @__PURE__ */ React.createElement(Av, { name: c.name, ch: c.ch }), /* @__PURE__ */ React.createElement("div", { className: "txt" }, /* @__PURE__ */ React.createElement("div", { className: "top" }, /* @__PURE__ */ React.createElement("p", { className: "nm" }, c.name), c.tag && /* @__PURE__ */ React.createElement(Tag, null, c.tag), /* @__PURE__ */ React.createElement("span", { style: { flex: 1 } }), /* @__PURE__ */ React.createElement("span", { className: "t-caption tm" }, _listTime(c.ts)), c.unread && /* @__PURE__ */ React.createElement("i", { className: "dot" })), /* @__PURE__ */ React.createElement("p", { className: "t-small pv" }, c.preview)));
      const List = () => {
        const emptyCh = filter === "cold" || filter === "ig";
        const shownOlder = olderOpen || older.length <= 2 ? older : older.slice(0, 1);
        const stackRest = !olderOpen && older.length > 2 ? older.slice(1) : [];
        return /* @__PURE__ */ React.createElement("div", { className: "pn-stage" }, /* @__PURE__ */ React.createElement("div", { className: "pn-col" }, /* @__PURE__ */ React.createElement("div", { className: "pn-head" }, /* @__PURE__ */ React.createElement("p", { className: "t-small", style: { color: "var(--gray-400)", lineHeight: "20px" } }, PN.longDate(/* @__PURE__ */ new Date()), " \xB7 ", nUnread, " sin leer"), /* @__PURE__ */ React.createElement("h1", { className: "t-h2", style: { margin: "10px 0 0", color: "var(--ink-900)" } }, "Bandeja de entrada"), /* @__PURE__ */ React.createElement("div", { className: "pn-chans" }, /* @__PURE__ */ React.createElement("button", { className: "pn-chan all" + (filter === "all" ? " on" : ""), onClick: () => setFilter("all") }, "Todas"), CHANNELS.map((ch) => /* @__PURE__ */ React.createElement("button", { key: ch.id, className: "pn-chan" + (filter === ch.id ? " on" : ""), onClick: () => setFilter(ch.id) }, /* @__PURE__ */ React.createElement("span", { className: "ico ch-" + ch.cls }, /* @__PURE__ */ React.createElement(PIcon, { name: ch.icon, size: ch.id === "wa" ? 11 : 9 })), ch.id === "mail" && mail.creds && !/gmail|googlemail/i.test((mail.creds.email || "") + (mail.creds.imap_host || mail.creds.host || "")) ? "Correo" : ch.label)))), /* @__PURE__ */ React.createElement(PN.ScrollArea, { top: 261, bottom: 40 }, /* @__PURE__ */ React.createElement("div", { className: "pn-inbox" }, (filter === "all" || filter === "mail") && !mail.creds && /* @__PURE__ */ React.createElement("button", { className: "pn-conv setup", onClick: () => setSheet("mail") }, /* @__PURE__ */ React.createElement("div", { className: "pn-app ic" }, /* @__PURE__ */ React.createElement(PIcon, { name: "inbox" })), /* @__PURE__ */ React.createElement("div", { className: "txt" }, /* @__PURE__ */ React.createElement("div", { className: "top" }, /* @__PURE__ */ React.createElement("p", { className: "nm" }, "Conecta tu correo")), /* @__PURE__ */ React.createElement("p", { className: "t-small pv" }, "Gmail, Outlook o IMAP: tus emails llegar\xE1n a esta bandeja."))), emptyCh ? /* @__PURE__ */ React.createElement("div", { className: "pn-empty" }, /* @__PURE__ */ React.createElement("p", { className: "t-title-m", style: { color: "var(--ink-900)" } }, CH[filter].label, " a\xFAn no est\xE1 conectado"), /* @__PURE__ */ React.createElement("p", { className: "t-small", style: { color: "var(--gray-300)" } }, filter === "cold" ? "Las respuestas de la plataforma de cold email aparecer\xE1n aqu\xED cuando la conectemos." : "Los mensajes directos de Instagram aparecer\xE1n aqu\xED cuando lo conectemos."), filter === "cold" && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 8 } }, /* @__PURE__ */ React.createElement(PN.Pill, { onClick: () => window.open("https://email.141agency.com/", "_blank", "noopener") }, "Abrir cold email"))) : visible.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "pn-empty" }, /* @__PURE__ */ React.createElement("p", { className: "t-title-m", style: { color: "var(--ink-900)" } }, "No hay mensajes"), /* @__PURE__ */ React.createElement("p", { className: "t-small", style: { color: "var(--gray-300)" } }, "Cuando te escriban por WhatsApp o por correo aparecer\xE1 aqu\xED.")) : null, !emptyCh && unread.length > 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("p", { className: "t-small pn-isec" }, "Sin leer"), /* @__PURE__ */ React.createElement("div", { className: "pn-list" }, unread.map(Row))), !emptyCh && older.length > 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("p", { className: "t-small pn-isec", style: { marginTop: unread.length ? 32 : 0 } }, "Anteriores"), /* @__PURE__ */ React.createElement("div", { className: "pn-list" }, shownOlder.map(Row), stackRest.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "pn-stack" }, /* @__PURE__ */ React.createElement("button", { className: "pn-conv read", onClick: () => setOlderOpen(true) }, /* @__PURE__ */ React.createElement(Av, { name: stackRest[0].name, ch: stackRest[0].ch }), /* @__PURE__ */ React.createElement("div", { className: "txt" }, /* @__PURE__ */ React.createElement("div", { className: "top" }, /* @__PURE__ */ React.createElement("p", { className: "nm" }, stackRest[0].name), /* @__PURE__ */ React.createElement("span", { style: { flex: 1 } }), /* @__PURE__ */ React.createElement("span", { className: "t-caption tm" }, _listTime(stackRest[0].ts))), /* @__PURE__ */ React.createElement("p", { className: "t-small pv" }, stackRest[0].preview, stackRest.length > 1 ? ` +${stackRest.length - 1} conversaci${stackRest.length - 1 === 1 ? "\xF3n" : "ones"} m\xE1s` : ""))), /* @__PURE__ */ React.createElement("div", { className: "pn-layers" }, /* @__PURE__ */ React.createElement("i", null), /* @__PURE__ */ React.createElement("i", null))), olderOpen && older.length > 2 && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(PN.Pill, { onClick: () => setOlderOpen(false) }, "Mostrar menos"))))))));
      };
      return /* @__PURE__ */ React.createElement(React.Fragment, null, cur ? /* @__PURE__ */ React.createElement(
        Thread,
        {
          c: cur,
          navigate,
          openModal,
          mail,
          toast,
          K,
          onBack: () => setSel(null),
          onArchive: () => archive(cur),
          onSent: () => {
            if (draftChat && cur.waId === draftChat.waId) setDraftChat(null);
          }
        }
      ) : List(), sheet === "mail" && window.MailSetup && /* @__PURE__ */ React.createElement(Sheet, { onClose: () => setSheet(null), width: 480 }, /* @__PURE__ */ React.createElement(window.MailSetup, { embedded: true, onConnect: (c) => {
        mail.setCreds(c);
        setSheet(null);
      } })), sheet === "chat" && K.NewChatBody && /* @__PURE__ */ React.createElement(Sheet, { title: "Nuevo chat de WhatsApp", onClose: () => setSheet(null) }, /* @__PURE__ */ React.createElement(K.NewChatBody, { clients, onStart: (waId, name, client) => {
        const d = K.waDigits(waId);
        if (!d) return;
        setDraftChat({ waId: d, name: name || "+" + d, client: client || null });
        setSheet(null);
        setSel("wa:" + d);
      } })), sheet === "compose" && mail.creds && K.ComposeMail && /* @__PURE__ */ React.createElement(Sheet, { title: "Correo nuevo", width: 520, onClose: () => setSheet(null) }, /* @__PURE__ */ React.createElement(K.ComposeMail, { creds: mail.creds, toast, onDone: () => setSheet(null) })));
    };
    const Thread = ({ c, navigate, openModal, mail, toast, K, onBack, onArchive, onSent }) => {
      const D = window.Data;
      const [text, setText] = useState("");
      const [sending, setSending] = useState(false);
      const [pending, setPending] = useState([]);
      const [details, setDetails] = useState({});
      const ref = useRef(null);
      const inputRef = useRef(null);
      useEffect(() => {
        if (c.ch !== "mail") return;
        let alive = true;
        c.mails.slice(-5).forEach((m) => {
          if (details[m.uid]) return;
          K.mailApi("message", { creds: mail.creds, uid: m.uid, folder: "INBOX" }).then((r) => {
            if (!alive || !r || !r.ok) return;
            setDetails((d) => ({ ...d, [m.uid]: r }));
            mail.markRead(m.uid);
          }).catch(() => {
          });
        });
        return () => {
          alive = false;
        };
      }, [c.key, c.mails && c.mails.length]);
      const items = c.ch === "wa" ? c.arr.map((m) => ({ id: m.id, out: m.direction === "out", ts: m.ts, body: m.body, status: m.status })).concat(pending.map((p) => ({ id: p.key, out: true, ts: p.ts, body: p.body, sending: true }))) : c.mails.slice(-5).map((m) => {
        const d = details[m.uid];
        return { id: "m" + m.uid, out: false, ts: K.mailIso(m.date), title: d && d.subject || m.subject, body: d ? d.text || _plain(d.html) : "Cargando\u2026" };
      }).concat(pending.map((p) => ({ id: p.key, out: true, ts: p.ts, title: p.subject, body: p.body, sending: p.sending })));
      useEffect(() => {
        const el = ref.current;
        if (el) el.scrollTop = el.scrollHeight;
      }, [c.key, items.length, Object.keys(details).length]);
      const lastMail = c.ch === "mail" ? c.mails[c.mails.length - 1] : null;
      const send = async () => {
        const body = text.trim();
        if (!body || sending) return;
        const key = "tmp-" + Date.now();
        setText("");
        setSending(true);
        if (c.ch === "wa") {
          setPending((p) => [...p, { key, body, ts: (/* @__PURE__ */ new Date()).toISOString() }]);
          const res = await D.sendWhatsapp(c.waId, body, c.client ? c.client.id : null);
          setPending((p) => p.filter((x) => x.key !== key));
          if (res && res.ok) onSent && onSent();
          else toast ? toast(res && res.error || "No se pudo enviar", "error") : alert(res && res.error || "No se pudo enviar");
        } else {
          const d = lastMail && details[lastMail.uid];
          const subject = d && d.subject || lastMail && lastMail.subject || "";
          const subj = /^re:/i.test(subject) ? subject : "Re: " + subject;
          setPending((p) => [...p, { key, body, subject: subj, ts: (/* @__PURE__ */ new Date()).toISOString(), sending: true }]);
          try {
            const r = await K.mailApi("send", { creds: mail.creds, to: c.addr, body, subject: subj, in_reply_to: d && d.message_id || "" });
            if (r && r.ok) setPending((p) => p.map((x) => x.key === key ? { ...x, sending: false } : x));
            else {
              setPending((p) => p.filter((x) => x.key !== key));
              toast ? toast(r && r.error || "No se pudo enviar", "error") : alert("No se pudo enviar");
            }
          } catch (_) {
            setPending((p) => p.filter((x) => x.key !== key));
            toast ? toast("No se pudo enviar", "error") : alert("No se pudo enviar");
          }
        }
        setSending(false);
      };
      const lastIn = c.ch === "wa" ? c.arr.filter((m) => m.direction === "in").slice(-1)[0] : null;
      const outside24h = c.ch === "wa" && (!lastIn || Date.now() - new Date(lastIn.ts).getTime() > 24 * 3600 * 1e3);
      const first = _first(c.full || c.name);
      const nextWorkday = (() => {
        const d = /* @__PURE__ */ new Date();
        do {
          d.setDate(d.getDate() + 1);
        } while (d.getDay() === 0 || d.getDay() === 6);
        return d;
      })();
      const fill = (t) => {
        setText(t);
        setTimeout(() => inputRef.current && inputRef.current.focus(), 0);
      };
      const sub = c.ch === "wa" ? `WhatsApp \xB7 +${K.waDigits(c.waId)}` : `${c.addr}`;
      let lastDay = null;
      return /* @__PURE__ */ React.createElement("div", { className: "pn-stage" }, /* @__PURE__ */ React.createElement("div", { className: "pn-col" }, /* @__PURE__ */ React.createElement("div", { className: "pn-head" }, /* @__PURE__ */ React.createElement("button", { className: "pn-back t-small", onClick: onBack }, /* @__PURE__ */ React.createElement(PIcon, { name: "back" }), /* @__PURE__ */ React.createElement("span", null, "Bandeja")), /* @__PURE__ */ React.createElement("div", { className: "pn-thead" }, /* @__PURE__ */ React.createElement(Av, { name: c.full || c.name, ch: c.ch, big: true }), /* @__PURE__ */ React.createElement("div", { className: "lead" }, /* @__PURE__ */ React.createElement("div", { className: "nmrow" }, /* @__PURE__ */ React.createElement("p", { className: "nm" }, c.full || c.name), c.tag && /* @__PURE__ */ React.createElement(Tag, null, c.tag)), /* @__PURE__ */ React.createElement("p", { className: "t-small sb" }, c.client ? /* @__PURE__ */ React.createElement("button", { className: "lnk", onClick: () => navigate("clientDetail", { clientId: c.client.id }) }, sub, " \xB7 Ver cliente") : sub)), /* @__PURE__ */ React.createElement("button", { className: "pn-ibtn", "aria-label": "Agendar reuni\xF3n", onClick: () => openModal("newEvent", { date: PN.ymd(nextWorkday) }) }, /* @__PURE__ */ React.createElement(PIcon, { name: "cal16" })), /* @__PURE__ */ React.createElement("button", { className: "pn-ibtn", "aria-label": "Archivar", onClick: onArchive }, /* @__PURE__ */ React.createElement(PIcon, { name: "archive" })))), /* @__PURE__ */ React.createElement("div", { className: "pn-thread", ref }, items.length === 0 && /* @__PURE__ */ React.createElement("p", { className: "t-caption pn-tday" }, "Escribe el primer mensaje"), items.map((m) => {
        const dl = _dayLabel(m.ts);
        const showDay = dl !== lastDay;
        lastDay = dl;
        return /* @__PURE__ */ React.createElement(React.Fragment, { key: m.id }, showDay && /* @__PURE__ */ React.createElement("p", { className: "t-caption pn-tday" }, dl), /* @__PURE__ */ React.createElement("div", { className: "pn-msg" + (m.out ? " out" : "") + (m.sending ? " sending" : "") }, /* @__PURE__ */ React.createElement("div", { className: "bub" }, m.title && /* @__PURE__ */ React.createElement("p", { className: "tt" }, m.title), /* @__PURE__ */ React.createElement("p", { className: "t-small bd" }, m.body), /* @__PURE__ */ React.createElement("p", { className: "t-caption tm" }, m.sending ? "enviando\u2026" : _hm(m.ts), m.out && m.status ? " \xB7 " + ({ sent: "enviado", delivered: "entregado", read: "le\xEDdo", failed: "fall\xF3" }[m.status] || m.status) : ""))));
      })), /* @__PURE__ */ React.createElement("div", { className: "pn-nora" }, outside24h && /* @__PURE__ */ React.createElement("p", { className: "t-caption pn-warn" }, "Han pasado m\xE1s de 24 h desde su \xFAltimo mensaje: WhatsApp puede pedir una plantilla aprobada."), /* @__PURE__ */ React.createElement("div", { className: "pn-nora-sug" }, /* @__PURE__ */ React.createElement(PN.Pill, { sug: true, onClick: () => fill(`\xBFTe va bien el ${PN.DIAS[nextWorkday.getDay()]} a las 11:00?`) }, `Proponer ${PN.DIAS[nextWorkday.getDay()]} 11:00`), /* @__PURE__ */ React.createElement(PN.Pill, { sug: true, onClick: () => fill("Te paso el enlace de la reuni\xF3n: ") }, "Enviar enlace de reuni\xF3n")), /* @__PURE__ */ React.createElement("div", { className: "pn-nora-box" }, /* @__PURE__ */ React.createElement("span", { className: "clip" }, /* @__PURE__ */ React.createElement(PIcon, { name: "clip" })), /* @__PURE__ */ React.createElement(
        "input",
        {
          ref: inputRef,
          value: text,
          onChange: (e) => setText(e.target.value),
          placeholder: `Responder a ${first} por ${c.ch === "wa" ? "WhatsApp" : "email"}\u2026`,
          onKeyDown: (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }
        }
      ), /* @__PURE__ */ React.createElement("button", { className: "pn-send", "aria-label": "Enviar", onClick: send, disabled: sending }, /* @__PURE__ */ React.createElement(PIcon, { name: "arrow-up" }))))));
    };
    window.PanelInbox = PanelInbox;
  })();
})();

(() => {
  (() => {
    const { useState, useEffect } = React;
    const PN = window.PN;
    PIcon.add({
      "mail15": [15, `<path d="M11.25 3.125H3.75C2.71447 3.125 1.875 3.96447 1.875 5V10C1.875 11.0355 2.71447 11.875 3.75 11.875H11.25C12.2855 11.875 13.125 11.0355 13.125 10V5C13.125 3.96447 12.2855 3.125 11.25 3.125Z" stroke="currentColor" stroke-width="1.0625" stroke-linecap="round" stroke-linejoin="round"/><path d="M2.5 4.375L7.5 8.125L12.5 4.375" stroke="currentColor" stroke-width="1.0625" stroke-linecap="round" stroke-linejoin="round"/>`],
      "wa15": [15, `<path d="M10.92 8.98878C10.7344 8.89565 9.82127 8.4469 9.65127 8.3844C9.48064 8.32253 9.35689 8.2919 9.23252 8.47815C9.1094 8.66378 8.75314 9.0819 8.64502 9.20565C8.53689 9.33003 8.42814 9.34503 8.24252 9.25253C8.05689 9.15878 7.45814 8.96315 6.74877 8.33065C6.19689 7.83815 5.82377 7.23003 5.71564 7.04378C5.60752 6.85815 5.70439 6.75753 5.79689 6.66503C5.88064 6.5819 5.98314 6.44815 6.07564 6.34003C6.16877 6.23128 6.19939 6.15378 6.26189 6.0294C6.32377 5.90565 6.29314 5.79753 6.24627 5.7044C6.19939 5.61128 5.82814 4.6969 5.67377 4.32503C5.52252 3.96315 5.36939 4.01253 5.25564 4.00628C5.14752 4.00128 5.02377 4.00003 4.89939 4.00003C4.77564 4.00003 4.57439 4.04628 4.40439 4.23253C4.23439 4.41815 3.75439 4.86753 3.75439 5.7819C3.75439 6.69565 4.42002 7.57878 4.51252 7.70315C4.60564 7.8269 5.82252 9.70315 7.68564 10.5075C8.12877 10.6988 8.47439 10.8132 8.74439 10.8982C9.18939 11.04 9.59439 11.02 9.91377 10.9719C10.2706 10.9188 11.0125 10.5225 11.1675 10.0888C11.3225 9.65503 11.3225 9.28315 11.2756 9.20565C11.2294 9.12815 11.1063 9.0819 10.92 8.98878ZM7.53127 13.6157H7.52877C6.42237 13.6157 5.33632 13.3183 4.38439 12.7544L4.15877 12.6207L1.82064 13.2344L2.44439 10.9544L2.29752 10.7206C1.67904 9.73582 1.35186 8.59608 1.35377 7.43315C1.35439 4.0269 4.12627 1.25565 7.53377 1.25565C9.18377 1.25565 10.735 1.8994 11.9013 3.0669C12.4767 3.63979 12.9328 4.3211 13.2431 5.07143C13.5535 5.82175 13.712 6.62618 13.7094 7.43815C13.7075 10.8444 10.9363 13.6157 7.53127 13.6157ZM12.7894 2.18003C12.1008 1.48685 11.2814 0.937236 10.3788 0.563026C9.47623 0.188815 8.50835 -0.00254765 7.53127 2.5611e-05C3.43439 2.5611e-05 0.10002 3.3344 0.0981445 7.43253C0.0981445 8.74253 0.440019 10.0213 1.09064 11.1481L0.0356445 15L3.97627 13.9663C5.06601 14.56 6.28717 14.8711 7.52814 14.8713H7.53127C11.6275 14.8713 14.9625 11.5369 14.9644 7.43815C14.9674 6.46145 14.7767 5.49384 14.4034 4.5913C14.0301 3.68875 13.4815 2.86919 12.7894 2.18003Z" fill="currentColor"/>`],
      "box19": [19, `<path d="M9.49996 2.375L3.16663 5.9375V13.0625L9.49996 16.625L15.8333 13.0625V5.9375L9.49996 2.375Z" stroke="currentColor" stroke-width="1.425" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.16663 5.9375L9.49996 9.5M9.49996 9.5L15.8333 5.9375M9.49996 9.5V16.625" stroke="currentColor" stroke-width="1.425" stroke-linecap="round" stroke-linejoin="round"/>`],
      "a-wa": [14, `<path d="M10.192 8.38952C10.0187 8.30261 9.16645 7.88377 9.00779 7.82544C8.84854 7.76769 8.73304 7.73911 8.61695 7.91294C8.50204 8.08619 8.16954 8.47644 8.06862 8.59194C7.9677 8.70802 7.8662 8.72202 7.69295 8.63569C7.5197 8.54819 6.96087 8.36561 6.29879 7.77527C5.7837 7.31561 5.43545 6.74802 5.33454 6.57419C5.23362 6.40094 5.32404 6.30702 5.41037 6.22069C5.48854 6.14311 5.5842 6.01827 5.67054 5.91736C5.75745 5.81586 5.78604 5.74352 5.84437 5.62744C5.90212 5.51194 5.87354 5.41102 5.82979 5.32411C5.78604 5.23719 5.43954 4.38377 5.29545 4.03669C5.15429 3.69894 5.01137 3.74502 4.9052 3.73919C4.80429 3.73452 4.68879 3.73336 4.5727 3.73336C4.4572 3.73336 4.26937 3.77652 4.1107 3.95036C3.95204 4.12361 3.50404 4.54302 3.50404 5.39644C3.50404 6.24927 4.12529 7.07352 4.21162 7.18961C4.29854 7.30511 5.43429 9.05627 7.1732 9.80702C7.58679 9.98552 7.90937 10.0923 8.16137 10.1716C8.5767 10.304 8.9547 10.2854 9.25279 10.2404C9.58587 10.1909 10.2783 9.82102 10.423 9.41619C10.5676 9.01136 10.5676 8.66427 10.5239 8.59194C10.4807 8.51961 10.3658 8.47644 10.192 8.38952ZM7.02912 12.7079H7.02679C5.99415 12.708 4.9805 12.4304 4.09204 11.9041L3.88145 11.7793L1.6992 12.3521L2.28137 10.2241L2.14429 10.0059C1.56704 9.08676 1.26167 8.02301 1.26345 6.93761C1.26404 3.75844 3.85112 1.17194 7.03145 1.17194C8.57145 1.17194 10.0193 1.77277 11.1078 2.86244C11.6448 3.39713 12.0705 4.03303 12.3602 4.73333C12.6499 5.43363 12.7978 6.18443 12.7954 6.94227C12.7936 10.1214 10.2071 12.7079 7.02912 12.7079ZM11.9367 2.03469C11.294 1.38773 10.5293 0.874754 9.68684 0.525491C8.84442 0.176228 7.94107 -0.00237781 7.02912 2.39036e-05C3.20537 2.39036e-05 0.0932865 3.11211 0.0915365 6.93702C0.0915365 8.15969 0.41062 9.35319 1.01787 10.4049L0.0332031 14L3.71112 13.0352C4.72822 13.5893 5.86796 13.8797 7.0262 13.8799H7.02912C10.8523 13.8799 13.965 10.7678 13.9667 6.94227C13.9695 6.03068 13.7916 5.12758 13.4431 4.28521C13.0947 3.44284 12.5827 2.67791 11.9367 2.03469Z" fill="white"/>`],
      "a-done": [14, `<path d="M6.99996 11.9582C9.73837 11.9582 11.9583 9.73825 11.9583 6.99984C11.9583 4.26143 9.73837 2.0415 6.99996 2.0415C4.26155 2.0415 2.04163 4.26143 2.04163 6.99984C2.04163 9.73825 4.26155 11.9582 6.99996 11.9582Z" stroke="currentColor" stroke-width="0.991667" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.95837 7.11676L6.35837 8.51676L9.15837 5.6001" stroke="currentColor" stroke-width="0.991667" stroke-linecap="round" stroke-linejoin="round"/>`],
      "a-doc": [14, `<path d="M9.62496 1.75H4.37496C3.56954 1.75 2.91663 2.40292 2.91663 3.20833V10.7917C2.91663 11.5971 3.56954 12.25 4.37496 12.25H9.62496C10.4304 12.25 11.0833 11.5971 11.0833 10.7917V3.20833C11.0833 2.40292 10.4304 1.75 9.62496 1.75Z" stroke="currentColor" stroke-width="0.991667" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.95837 4.0835H9.04171M4.95837 6.41683H9.04171M4.95837 8.75016H7.29171" stroke="currentColor" stroke-width="0.991667" stroke-linecap="round" stroke-linejoin="round"/>`]
    });
    const _MES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    const _eur = (n) => String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " \u20AC";
    const _lc = (s) => s ? s.charAt(0).toLowerCase() + s.slice(1) : s;
    const _toYMD = (d) => {
      if (!d) return null;
      if (/^\d{4}-\d{2}-\d{2}/.test(d)) return String(d).slice(0, 10);
      const t = new Date(d);
      return isNaN(t.getTime()) ? null : PN.ymd(t);
    };
    const _when = (iso) => {
      if (!iso) return "";
      const d = new Date(iso);
      if (isNaN(d.getTime())) return "";
      const n = PN.dayDiff(PN.ymd(d));
      const hm = d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
      if (n === 0) return /T/.test(String(iso)) ? `Hoy, ${hm}` : "Hoy";
      if (n === -1) return /T/.test(String(iso)) ? `Ayer, ${hm}` : "Ayer";
      return `${d.getDate()} ${_MES[d.getMonth()]}`;
    };
    const _first = (s) => String(s || "").trim().split(/\s+/)[0] || "";
    const _cname = (c) => c.company || c.name || "Cliente";
    const _person = (c) => c.company && c.name && c.name !== c.company ? c.name : "";
    const _sector = (c) => {
      const v = String(c.service || "").trim();
      return v === "\u2014" ? "" : v;
    };
    const projectsOf = (D, c) => (D.PROJECTS || []).filter((p) => p.clientId === c.id).map((p) => {
      const tasks = D.TASKS && D.TASKS[p.id] || [];
      const done = tasks.filter((t) => t.column === "done").length;
      const complete = tasks.length ? done === tasks.length : (p.progress || 0) >= 100;
      return { p, tasks, done, complete };
    });
    const waOf = (D, c) => {
      const K = window.PNInboxKit || {};
      return (D.WHATSAPP || []).filter((m) => K.waMatch && K.waMatch(c.whatsapp || c.phone, m.waId)).sort((a, b) => a.ts < b.ts ? -1 : 1);
    };
    const PanelClients = ({ navigate, openModal }) => {
      const D = window.Data;
      D.useStore();
      const [filter, setFilter] = useState("all");
      const [restOpen, setRestOpen] = useState(false);
      const clients = D.CLIENTS || [];
      const sectors = Array.from(new Set(clients.map(_sector).filter(Boolean))).slice(0, 5);
      const list = clients.filter((c) => filter === "all" || _sector(c) === filter).map((c) => ({ c, ps: projectsOf(D, c) }));
      const active = list.filter((x) => x.ps.some((y) => !y.complete));
      const rest = list.filter((x) => !x.ps.some((y) => !y.complete));
      const subOf = (x) => {
        const y = x.ps.find((z) => !z.complete);
        if (!y) return x.ps.length ? `${x.ps.length} proyecto${x.ps.length === 1 ? "" : "s"} terminado${x.ps.length === 1 ? "" : "s"}` : _sector(x.c) || "Sin proyectos todav\xEDa";
        return `${y.p.name} \xB7 ${y.tasks.length ? `${y.done} de ${y.tasks.length} tareas${y.done === y.tasks.length ? " hechas" : ""}` : "sin tareas todav\xEDa"}`;
      };
      const Row = (x, sub) => /* @__PURE__ */ React.createElement("button", { key: x.c.id, className: "pn-cli", onClick: () => navigate("clientDetail", { clientId: x.c.id }) }, /* @__PURE__ */ React.createElement("div", { className: "pn-app" }, PN.initials(_cname(x.c))), /* @__PURE__ */ React.createElement("div", { className: "txt" }, /* @__PURE__ */ React.createElement("div", { className: "top" }, /* @__PURE__ */ React.createElement("p", { className: "nm" }, _cname(x.c)), _person(x.c) && /* @__PURE__ */ React.createElement("p", { className: "t-small cl" }, _person(x.c))), /* @__PURE__ */ React.createElement("p", { className: "t-small sb" }, sub || subOf(x))), /* @__PURE__ */ React.createElement("span", { className: "go" }, /* @__PURE__ */ React.createElement(PIcon, { name: "chev6" })));
      return /* @__PURE__ */ React.createElement("div", { className: "pn-stage" }, /* @__PURE__ */ React.createElement("div", { className: "pn-col" }, /* @__PURE__ */ React.createElement("div", { className: "pn-head" }, /* @__PURE__ */ React.createElement("p", { className: "t-small", style: { color: "var(--gray-400)", lineHeight: "20px" } }, PN.longDate(/* @__PURE__ */ new Date()), " \xB7 ", clients.length, " cliente", clients.length === 1 ? "" : "s"), /* @__PURE__ */ React.createElement("h1", { className: "t-h2", style: { margin: "10px 0 0", color: "var(--ink-900)" } }, "Clientes activos"), /* @__PURE__ */ React.createElement("div", { className: "pn-chans" }, /* @__PURE__ */ React.createElement("button", { className: "pn-chan all" + (filter === "all" ? " on" : ""), onClick: () => setFilter("all") }, "Todos"), sectors.map((s) => /* @__PURE__ */ React.createElement("button", { key: s, className: "pn-chan all" + (filter === s ? " on" : ""), onClick: () => setFilter(s) }, s)))), /* @__PURE__ */ React.createElement(PN.ScrollArea, { top: 257, bottom: 227 }, /* @__PURE__ */ React.createElement("div", { className: "pn-inbox" }, clients.length === 0 && /* @__PURE__ */ React.createElement("div", { className: "pn-empty" }, /* @__PURE__ */ React.createElement("p", { className: "t-title-m", style: { color: "var(--ink-900)" } }, "A\xFAn no hay clientes"), /* @__PURE__ */ React.createElement("p", { className: "t-small", style: { color: "var(--gray-300)" } }, "A\xF1ade el primero con \xABNuevo cliente\xBB.")), active.length > 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("p", { className: "t-small pn-isec pj" }, "Con proyecto en marcha"), /* @__PURE__ */ React.createElement("div", { className: "pn-list" }, active.map((x) => Row(x)))), rest.length > 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("p", { className: "t-small pn-isec pj", style: { marginTop: active.length ? 24 : 0 } }, active.length ? "Resto de clientes" : "Clientes"), rest.length <= 2 || restOpen ? /* @__PURE__ */ React.createElement("div", { className: "pn-list" }, rest.map((x) => Row(x)), restOpen && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(PN.Pill, { onClick: () => setRestOpen(false) }, "Mostrar menos"))) : /* @__PURE__ */ React.createElement("div", { className: "pn-stack", onClickCapture: (e) => {
        e.stopPropagation();
        e.preventDefault();
        setRestOpen(true);
      } }, Row(rest[0], `Tambi\xE9n: ${PN.listMore(rest.slice(1, 4).map((x) => _cname(x.c)), rest.length - 1)}`), /* @__PURE__ */ React.createElement("div", { className: "pn-layers" }, /* @__PURE__ */ React.createElement("i", null), /* @__PURE__ */ React.createElement("i", null)))))), /* @__PURE__ */ React.createElement(
        PN.NoraBox,
        {
          navigate,
          placeholder: "A\xF1ade un cliente o preg\xFAntale a Nora\u2026",
          suggestions: ["Nuevo cliente", "\xBFA qui\xE9n no he escrito este mes?", "Preparar factura"],
          onSubmit: (t) => {
            if (t === "Nuevo cliente") return openModal("newClient");
            if (t === "Preparar factura") return openModal("newInvoice");
            const q = t === "\xBFA qui\xE9n no he escrito este mes?" ? "\xBFA qu\xE9 clientes no he escrito este mes? Revisa WhatsApp y correo." : t || "Ay\xFAdame con mis clientes";
            try {
              sessionStorage.setItem("nora_prefill", q);
            } catch (_) {
            }
            navigate("nora");
          }
        }
      )));
    };
    const PanelClient = ({ clientId, navigate, openModal }) => {
      const D = window.Data;
      D.useStore();
      const toast = typeof useToast === "function" ? useToast() : null;
      const c = (D.CLIENTS || []).find((x) => x.id === clientId);
      const [tab, setTab] = useState("summary");
      const [menu, setMenu] = useState(false);
      const [full, setFull] = useState(false);
      const [about, setAbout] = useState(c ? c.about || "" : "");
      const [driveDraft, setDriveDraft] = useState(null);
      useEffect(() => {
        setAbout(c ? c.about || "" : "");
        setTab("summary");
        setFull(false);
      }, [clientId]);
      useEffect(() => {
        if (!menu) return;
        const cl = () => setMenu(false);
        window.addEventListener("click", cl);
        return () => window.removeEventListener("click", cl);
      }, [menu]);
      if (!c) {
        return /* @__PURE__ */ React.createElement("div", { className: "pn-stage" }, /* @__PURE__ */ React.createElement("div", { className: "pn-col" }, /* @__PURE__ */ React.createElement("div", { className: "pn-head" }, /* @__PURE__ */ React.createElement("button", { className: "pn-back t-small", onClick: () => navigate("clients") }, /* @__PURE__ */ React.createElement(PIcon, { name: "back" }), /* @__PURE__ */ React.createElement("span", null, "Clientes")), /* @__PURE__ */ React.createElement("div", { className: "pn-empty", style: { marginTop: 24 } }, /* @__PURE__ */ React.createElement("p", { className: "t-title-m", style: { color: "var(--ink-900)" } }, "No encuentro este cliente")))));
      }
      if (full && window.AgencyClientDetail) {
        return /* @__PURE__ */ React.createElement("div", { className: "pn-legacy-full" }, /* @__PURE__ */ React.createElement("div", { className: "pn-legacy-bar" }, /* @__PURE__ */ React.createElement("button", { className: "pn-back t-small", onClick: () => setFull(false) }, /* @__PURE__ */ React.createElement(PIcon, { name: "back" }), /* @__PURE__ */ React.createElement("span", null, "Volver a la ficha"))), /* @__PURE__ */ React.createElement(window.AgencyClientDetail, { clientId: c.id, navigate, openModal }));
      }
      const ps = projectsOf(D, c);
      const live = ps.filter((y) => !y.complete);
      const invoices = (D.INVOICES || []).filter((i) => i.clientId === c.id);
      const paid = invoices.filter((i) => i.status === "paid");
      const pendingInv = invoices.filter((i) => i.status !== "paid");
      const billed = paid.reduce((a, b) => a + (Number(b.amount) || 0), 0);
      const wa = waOf(D, c);
      const lastWa = wa[wa.length - 1];
      const person = _person(c) || c.name || "";
      const firstName = _first(person) || _first(_cname(c));
      const allTasks = ps.flatMap((y) => y.tasks), allDone = allTasks.filter((t) => t.column === "done").length;
      const sub = [person && person !== _cname(c) ? person : null, (c.about || "").split("\n")[0].slice(0, 60) || _sector(c), c.website ? c.website.replace(/^https?:\/\//, "").replace(/\/$/, "") : null].filter(Boolean).join(" \xB7 ");
      const digits = window.PNInboxKit && window.PNInboxKit.waDigits ? window.PNInboxKit.waDigits(c.whatsapp || "") : String(c.whatsapp || "").replace(/\D/g, "");
      const act = [];
      wa.filter((m) => m.direction === "in").slice(-3).forEach((m) => act.push({ k: "w" + m.id, ic: "wa", t: _first(m.contactName) || firstName, s: `\xAB${m.body}\xBB`, d: m.ts }));
      ps.forEach((y) => y.tasks.filter((t) => t.column === "done").forEach((t) => act.push({ k: "t" + t.id, ic: "done", t: "Tarea hecha", s: t.title, d: t.deadline })));
      invoices.forEach((i) => {
        const d = _toYMD(i.paidAt || i.issued);
        act.push({ k: "i" + i.id, ic: "doc", t: i.status === "paid" ? "Factura pagada" : "Factura enviada", s: [i.project, _eur(i.amount)].filter(Boolean).join(" \xB7 "), d });
      });
      const _key = (d) => {
        const s = String(d || "");
        return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s + "T12:00:00" : s;
      };
      act.sort((a, b) => _key(b.d) > _key(a.d) ? 1 : -1);
      const createInvite = async () => {
        const res = await D.createInvite({ clientId: c.id, service: c.service || "" });
        if (res && res.token) {
          const link = `${window.location.origin}/invite/${res.token}`;
          try {
            await navigator.clipboard.writeText(link);
            toast && toast("Enlace del portal copiado", "success");
          } catch (_) {
            toast && toast(link, "success");
          }
        } else toast && toast(res && res.error || "No se pudo generar el enlace", "error");
      };
      const previewPortal = () => {
        try {
          sessionStorage.setItem("141_preview_client", c.id);
        } catch (_) {
        }
        navigate("__switch");
      };
      const ask = (q) => {
        try {
          sessionStorage.setItem("nora_prefill", q);
        } catch (_) {
        }
        navigate("nora");
      };
      const ProjRow = (y) => /* @__PURE__ */ React.createElement("button", { key: y.p.id, className: "pn-proj", onClick: () => navigate("project", { projectId: y.p.id }) }, /* @__PURE__ */ React.createElement("span", { className: "ini" }, /* @__PURE__ */ React.createElement(PIcon, { name: "box19" })), /* @__PURE__ */ React.createElement("div", { className: "txt" }, /* @__PURE__ */ React.createElement("div", { className: "top" }, /* @__PURE__ */ React.createElement("p", { className: "nm" }, y.p.name), /* @__PURE__ */ React.createElement("span", { style: { flex: 1 } }), /* @__PURE__ */ React.createElement("span", { className: "t-caption ct" }, y.done, " de ", y.tasks.length, " tareas")), /* @__PURE__ */ React.createElement("div", { className: "bot" }, /* @__PURE__ */ React.createElement("span", { className: "bar" }, /* @__PURE__ */ React.createElement("i", { style: { width: `${y.tasks.length ? Math.round(y.done / y.tasks.length * 100) : y.complete ? 100 : 0}%` } })), /* @__PURE__ */ React.createElement("span", { className: "t-caption nx" }, y.complete ? "Completado \xB7 listo para cerrar" : (() => {
        const n = y.tasks.filter((t) => t.column !== "done").sort((a, b) => (a.deadline || "9") < (b.deadline || "9") ? -1 : 1)[0];
        return n ? `Siguiente: ${_lc(n.title)}` : "Sin tareas todav\xEDa";
      })()))), /* @__PURE__ */ React.createElement("span", { className: "go" }, /* @__PURE__ */ React.createElement(PIcon, { name: "chev6" })));
      const Body = () => {
        if (tab === "summary") return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "pn-stats" }, /* @__PURE__ */ React.createElement("div", { className: "st" }, /* @__PURE__ */ React.createElement("p", { className: "t-caption l" }, "Facturado"), /* @__PURE__ */ React.createElement("p", { className: "v" }, _eur(billed)), /* @__PURE__ */ React.createElement("p", { className: "t-caption s" }, invoices.length, " factura", invoices.length === 1 ? "" : "s", " \xB7 ", pendingInv.length, " pendiente", pendingInv.length === 1 ? "" : "s")), /* @__PURE__ */ React.createElement("div", { className: "st" }, /* @__PURE__ */ React.createElement("p", { className: "t-caption l" }, "Proyectos"), /* @__PURE__ */ React.createElement("p", { className: "v" }, live.length ? `${live.length} activo${live.length === 1 ? "" : "s"}` : ps.length ? "Ninguno activo" : "Sin proyectos"), /* @__PURE__ */ React.createElement("p", { className: "t-caption s" }, allTasks.length ? `${allDone} de ${allTasks.length} tareas hechas` : "Sin tareas")), /* @__PURE__ */ React.createElement("div", { className: "st" }, /* @__PURE__ */ React.createElement("p", { className: "t-caption l" }, "\xDAltimo contacto"), /* @__PURE__ */ React.createElement("p", { className: "v" }, lastWa ? _when(lastWa.ts) : "\u2014"), /* @__PURE__ */ React.createElement("p", { className: "t-caption s" }, lastWa ? `Por WhatsApp${lastWa.direction === "in" && firstName ? " con " + firstName : ""}` : "A\xFAn no hay mensajes"))), (live.length > 0 || ps.length > 0) && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("p", { className: "t-small pn-isec pj", style: { marginTop: 18 } }, (live.length || ps.length) === 1 ? "Proyecto" : "Proyectos"), /* @__PURE__ */ React.createElement("div", { className: "pn-list" }, (live.length ? live : ps.slice(0, 1)).map(ProjRow))), act.length > 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("p", { className: "t-small pn-isec", style: { marginTop: 18, marginBottom: 4 } }, "Actividad"), /* @__PURE__ */ React.createElement("div", { className: "pn-act-list" }, act.slice(0, 3).map((a) => /* @__PURE__ */ React.createElement("div", { key: a.k, className: "pn-actrow" }, /* @__PURE__ */ React.createElement("span", { className: "ic " + a.ic }, /* @__PURE__ */ React.createElement(PIcon, { name: "a-" + a.ic })), /* @__PURE__ */ React.createElement("div", { className: "txt" }, /* @__PURE__ */ React.createElement("span", { className: "tt" }, a.t), /* @__PURE__ */ React.createElement("span", { className: "t-small sb" }, a.s)), /* @__PURE__ */ React.createElement("span", { className: "t-caption dt" }, _when(a.d)))))));
        if (tab === "projects") return /* @__PURE__ */ React.createElement("div", { className: "pn-list" }, ps.length === 0 && /* @__PURE__ */ React.createElement("p", { className: "t-small", style: { color: "var(--gray-300)" } }, "Este cliente a\xFAn no tiene proyectos."), ps.map(ProjRow), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(PN.Pill, { onClick: () => openModal("newProject", { clientId: c.id }) }, "Nuevo proyecto")));
        if (tab === "invoices") return /* @__PURE__ */ React.createElement("div", { className: "pn-list" }, invoices.length === 0 && /* @__PURE__ */ React.createElement("p", { className: "t-small", style: { color: "var(--gray-300)" } }, "Sin facturas todav\xEDa."), invoices.map((i) => /* @__PURE__ */ React.createElement("div", { key: i.id, className: "pn-ptask", style: { cursor: "default" } }, /* @__PURE__ */ React.createElement("span", { className: "pn-filecard-ic" }, /* @__PURE__ */ React.createElement(PIcon, { name: "a-doc" })), /* @__PURE__ */ React.createElement("div", { className: "txt" }, /* @__PURE__ */ React.createElement("p", { className: "tt" }, _eur(i.amount)), /* @__PURE__ */ React.createElement("p", { className: "t-caption sb" }, [i.project, i.issued ? "Emitida " + (_when(_toYMD(i.issued)) || i.issued) : null].filter(Boolean).join(" \xB7 "))), /* @__PURE__ */ React.createElement("span", { className: "t-caption " + (i.status === "paid" ? "wh" : "tag") }, i.status === "paid" ? "Pagada" : "Pendiente"))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(PN.Pill, { onClick: () => openModal("newInvoice") }, "Nueva factura")));
        if (tab === "msgs") return /* @__PURE__ */ React.createElement("div", { className: "pn-list" }, wa.length === 0 && /* @__PURE__ */ React.createElement("p", { className: "t-small", style: { color: "var(--gray-300)" } }, "A\xFAn no hay mensajes de WhatsApp con ", _cname(c), "."), wa.slice(-5).map((m) => /* @__PURE__ */ React.createElement("div", { key: m.id, className: "pn-msg" + (m.direction === "out" ? " out" : "") }, /* @__PURE__ */ React.createElement("div", { className: "bub" }, /* @__PURE__ */ React.createElement("p", { className: "t-small bd" }, m.body), /* @__PURE__ */ React.createElement("p", { className: "t-caption tm" }, _when(m.ts))))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(PN.Pill, { onClick: () => navigate("unibox", wa.length ? { open: "wa:" + wa[0].waId } : {}) }, "Abrir en la Bandeja")));
        if (tab === "files") return /* @__PURE__ */ React.createElement("div", { className: "pn-list" }, /* @__PURE__ */ React.createElement("div", { className: "pn-filecard" }, /* @__PURE__ */ React.createElement("span", { className: "ini" }, /* @__PURE__ */ React.createElement(PIcon, { name: "folder" })), /* @__PURE__ */ React.createElement("div", { className: "txt" }, /* @__PURE__ */ React.createElement("p", { className: "tt" }, "Carpeta de Drive"), driveDraft !== null ? /* @__PURE__ */ React.createElement(
          "input",
          {
            className: "pn-inline",
            autoFocus: true,
            value: driveDraft,
            placeholder: "Pega el enlace de la carpeta\u2026",
            onChange: (e) => setDriveDraft(e.target.value),
            onKeyDown: (e) => {
              if (e.key === "Enter") {
                D.updateClient(c.id, { driveUrl: driveDraft.trim() });
                setDriveDraft(null);
              }
              if (e.key === "Escape") setDriveDraft(null);
            }
          }
        ) : /* @__PURE__ */ React.createElement("p", { className: "t-caption sb" }, c.driveUrl || "Sin carpeta todav\xEDa.")), c.driveUrl && driveDraft === null && /* @__PURE__ */ React.createElement(PN.Pill, { onClick: () => window.open(c.driveUrl, "_blank", "noopener") }, "Abrir"), !c.driveUrl && driveDraft === null && D.driveConfigured && /* @__PURE__ */ React.createElement(PN.Pill, { onClick: () => D.driveCreateFolderForClient(c.id) }, "Crear en Drive"), driveDraft === null && /* @__PURE__ */ React.createElement(PN.Pill, { onClick: () => setDriveDraft(c.driveUrl || "") }, c.driveUrl ? "Cambiar" : "Pegar enlace")), /* @__PURE__ */ React.createElement("div", { className: "pn-filecard" }, /* @__PURE__ */ React.createElement("span", { className: "ini" }, /* @__PURE__ */ React.createElement(PIcon, { name: "apps" })), /* @__PURE__ */ React.createElement("div", { className: "txt" }, /* @__PURE__ */ React.createElement("p", { className: "tt" }, "Credenciales y documentaci\xF3n"), /* @__PURE__ */ React.createElement("p", { className: "t-caption sb" }, D.credentialsForClient ? D.credentialsForClient(c.id).length : 0, " accesos guardados \xB7 documentaci\xF3n del portal")), /* @__PURE__ */ React.createElement(PN.Pill, { onClick: () => setFull(true) }, "Abrir")));
        if (tab === "notes") return /* @__PURE__ */ React.createElement("div", { className: "pn-notes" }, /* @__PURE__ */ React.createElement(
          "textarea",
          {
            value: about,
            onChange: (e) => setAbout(e.target.value),
            onBlur: () => {
              if ((c.about || "") !== about) {
                D.updateClient(c.id, { about });
                toast && toast("Notas guardadas", "success");
              }
            },
            placeholder: `Notas sobre ${_cname(c)}\u2026`
          }
        ));
        return null;
      };
      return /* @__PURE__ */ React.createElement("div", { className: "pn-stage" }, /* @__PURE__ */ React.createElement("div", { className: "pn-col" }, /* @__PURE__ */ React.createElement("div", { className: "pn-head" }, /* @__PURE__ */ React.createElement("button", { className: "pn-back t-small", onClick: () => navigate("clients") }, /* @__PURE__ */ React.createElement(PIcon, { name: "back" }), /* @__PURE__ */ React.createElement("span", null, "Clientes")), /* @__PURE__ */ React.createElement("div", { className: "pn-phead" }, /* @__PURE__ */ React.createElement("span", { className: "pn-bigav" }, PN.initials(_cname(c))), /* @__PURE__ */ React.createElement("div", { className: "nm" }, /* @__PURE__ */ React.createElement("h1", { className: "t-h2" }, _cname(c)), sub && /* @__PURE__ */ React.createElement("p", { className: "t-small sb" }, sub)), c.email && /* @__PURE__ */ React.createElement("button", { className: "pn-rbtn", "aria-label": "Escribir un correo", onClick: () => navigate("unibox", { compose: "mail" }) }, /* @__PURE__ */ React.createElement(PIcon, { name: "mail15" })), /* @__PURE__ */ React.createElement("div", { style: { position: "relative" }, onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("button", { className: "pn-rbtn", "aria-label": "M\xE1s opciones", onClick: () => setMenu((m) => !m) }, /* @__PURE__ */ React.createElement(PIcon, { name: "more15" })), menu && /* @__PURE__ */ React.createElement("div", { className: "pn-menu", style: { position: "absolute", right: 0, top: 40, minWidth: 250 } }, /* @__PURE__ */ React.createElement("button", { className: "pn-menu-item t-small", onClick: () => {
        setMenu(false);
        setFull(true);
      } }, "Editar ficha, intake y credenciales"), /* @__PURE__ */ React.createElement("button", { className: "pn-menu-item t-small", onClick: () => {
        setMenu(false);
        createInvite();
      } }, "Copiar enlace de invitaci\xF3n al portal"), /* @__PURE__ */ React.createElement("button", { className: "pn-menu-item t-small", onClick: () => {
        setMenu(false);
        previewPortal();
      } }, "Ver su portal"), /* @__PURE__ */ React.createElement("button", { className: "pn-menu-item t-small", onClick: () => {
        setMenu(false);
        openModal("newProject", { clientId: c.id });
      } }, "Nuevo proyecto"))), /* @__PURE__ */ React.createElement("button", { className: "pn-wbtn", onClick: () => navigate("unibox", digits ? { open: "wa:" + (wa[0] ? wa[0].waId : digits) } : { compose: "wa" }) }, /* @__PURE__ */ React.createElement(PIcon, { name: "wa15" }), /* @__PURE__ */ React.createElement("span", null, "WhatsApp"))), /* @__PURE__ */ React.createElement("div", { className: "pn-chans pn-ptabs" }, [["summary", "Resumen"], ["projects", "Proyectos"], ["invoices", "Facturas"], ["msgs", "Mensajes"], ["files", "Archivos"], ["notes", "Notas"]].map(([k, l]) => /* @__PURE__ */ React.createElement("button", { key: k, className: "pn-chan all" + (tab === k ? " on" : ""), onClick: () => setTab(k) }, l)))), /* @__PURE__ */ React.createElement(PN.ScrollArea, { top: 275, bottom: 215 }, /* @__PURE__ */ React.createElement("div", { className: "pn-pbody" }, Body())), /* @__PURE__ */ React.createElement(
        PN.NoraBox,
        {
          navigate,
          placeholder: `Preg\xFAntale a Nora sobre ${_cname(c)}\u2026`,
          suggestions: [firstName ? `Responder a ${firstName}` : "Escribir al cliente", `Preparar factura de ${PN.MESES[(/* @__PURE__ */ new Date()).getMonth()]}`, "Resumen del cliente"],
          onSubmit: (t) => {
            if (/^Preparar factura/.test(t)) return openModal("newInvoice");
            if (/^(Responder|Escribir)/.test(t)) return ask(`Redacta una respuesta para ${_cname(c)}${lastWa && lastWa.direction === "in" ? `. Su \xFAltimo mensaje: \xAB${lastWa.body}\xBB` : ""}.`);
            if (t === "Resumen del cliente") return ask(`Hazme un resumen de ${_cname(c)}: proyectos, tareas, facturas y \xFAltimo contacto.`);
            ask(`${t} (sobre el cliente ${_cname(c)})`);
          }
        }
      )));
    };
    window.PanelClients = PanelClients;
    window.PanelClient = PanelClient;
  })();
})();

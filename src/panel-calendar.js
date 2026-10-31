(() => {
  (() => {
    const { useState, useEffect, useRef } = React;
    const PN = window.PN;
    PIcon.add({
      "chev-l": [14, `<path d="M8.74996 2.91675L4.66663 7.00008L8.74996 11.0834" stroke="currentColor" stroke-width="0.991667" stroke-linecap="round" stroke-linejoin="round"/>`],
      "chev-r": [14, `<path d="M5.25 2.91675L9.33333 7.00008L5.25 11.0834" stroke="currentColor" stroke-width="0.991667" stroke-linecap="round" stroke-linejoin="round"/>`],
      "video": [13, `<path d="M7.04167 3.52075H2.97917C2.23128 3.52075 1.625 4.12703 1.625 4.87492V8.12492C1.625 8.8728 2.23128 9.47909 2.97917 9.47909H7.04167C7.78955 9.47909 8.39583 8.8728 8.39583 8.12492V4.87492C8.39583 4.12703 7.78955 3.52075 7.04167 3.52075Z" stroke="currentColor" stroke-width="1.08333" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.39587 5.6875L11.1042 4.0625V8.9375L8.39587 7.3125" stroke="currentColor" stroke-width="1.08333" stroke-linecap="round" stroke-linejoin="round"/>`]
    });
    const VIEW_KEY = "pn_cal_view";
    const HOUR = 34;
    const _toYMD = (d) => {
      if (!d) return null;
      if (/^\d{4}-\d{2}-\d{2}/.test(d)) return String(d).slice(0, 10);
      const months = { ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5, jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11 };
      const m = String(d).toLowerCase().match(/(\d{1,2})\s+([a-záéíóú]{3})\s+(\d{4})/);
      return m ? `${m[3]}-${String((months[m[2]] || 0) + 1).padStart(2, "0")}-${m[1].padStart(2, "0")}` : null;
    };
    const _min = (t) => {
      const m = /^(\d{1,2}):(\d{2})/.exec(t || "");
      return m ? +m[1] * 60 + +m[2] : null;
    };
    const _hhmm = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
    const _addDays = (d, n) => {
      const x = new Date(d);
      x.setDate(x.getDate() + n);
      return x;
    };
    const _uniq = (list) => new Set(list.map((e) => e.id)).size;
    const _MESC = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    const _monday = (d) => {
      const x = new Date(d);
      x.setHours(12, 0, 0, 0);
      x.setDate(x.getDate() - (x.getDay() + 6) % 7);
      return x;
    };
    const _noClient = (s) => !s || ["\u2014", "-", "Interno"].includes(String(s).trim());
    const _place = (link) => !link ? "" : /meet\.google/.test(link) ? "Google Meet" : /zoom\./.test(link) ? "Zoom" : /teams\./.test(link) ? "Teams" : "Videollamada";
    const _allEvents = (D) => {
      const out = [];
      (D.PROJECTS || []).forEach((p) => {
        const ymd = _toYMD(p.deadline);
        if (!ymd) return;
        out.push({
          id: "proj-" + p.id,
          date: ymd,
          title: "Entrega: " + p.name,
          kind: "project",
          who: _noClient(p.clientName) ? p.name : p.clientName,
          sub: "Entrega" + (_noClient(p.clientName) ? "" : " \xB7 " + p.clientName),
          go: ["project", { projectId: p.id }]
        });
      });
      (D.INVOICES || []).forEach((inv) => {
        const ymd = _toYMD(inv.due);
        if (!ymd) return;
        out.push({
          id: "inv-" + inv.id,
          date: ymd,
          title: "Factura \xB7 " + inv.client,
          kind: "invoice",
          who: inv.client,
          sub: "Vencimiento \xB7 " + (inv.amount || 0).toLocaleString("es-ES") + " \u20AC",
          go: ["billing", {}]
        });
      });
      (D.AGENDA_EVENTS || []).forEach((e) => {
        const parts = String(e.title || "").split(" \xB7 ");
        const base = { ...e, kind: "custom", who: parts.length > 1 ? parts[parts.length - 1] : e.title };
        if (e.dateEnd && e.dateEnd > e.date) {
          const a = PN.parseYmd(e.date), b = PN.parseYmd(e.dateEnd);
          const span = `${a.getDate()} ${_MESC[a.getMonth()]} \u2013 ${b.getDate()} ${_MESC[b.getMonth()]}`;
          for (let d = new Date(a), i = 0; d <= b && i < 366; d = _addDays(d, 1), i++)
            out.push({ ...base, date: PN.ymd(d), sub: [e.sub, span].filter(Boolean).join(" \xB7 ") });
          return;
        }
        out.push(base);
      });
      return out.map((e) => ({ ...e, s: _min(e.time), e2: _min(e.timeEnd) })).sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : (a.s ?? -1) - (b.s ?? -1));
    };
    const PanelCalendar = ({ navigate, openModal }) => {
      const D = window.Data;
      D.useStore();
      useEffect(() => {
        try {
          D.googleSync && D.googleSync();
        } catch (_) {
        }
      }, []);
      const now = /* @__PURE__ */ new Date();
      const todayStr = PN.ymd(now);
      const nowMin = now.getHours() * 60 + now.getMinutes();
      const [view, setViewS] = useState(() => {
        try {
          return localStorage.getItem(VIEW_KEY) || "day";
        } catch (_) {
          return "day";
        }
      });
      const setView = (v) => {
        setViewS(v);
        try {
          localStorage.setItem(VIEW_KEY, v);
        } catch (_) {
        }
      };
      const [sel, setSel] = useState(todayStr);
      const [tick, setTick] = useState(0);
      const confirm = window.useConfirm ? window.useConfirm() : null;
      const wRef = useRef(null), wH0 = useRef(9);
      useEffect(() => {
        const t = setInterval(() => setTick((x) => x + 1), 3e4);
        return () => clearInterval(t);
      }, []);
      const events = _allEvents(D);
      const byDate = {};
      events.forEach((e) => {
        (byDate[e.date] = byDate[e.date] || []).push(e);
      });
      const selD = PN.parseYmd(sel);
      const isPast = (e) => e.date < todayStr || e.date === todayStr && e.s != null && (e.e2 ?? e.s + 30) <= nowMin;
      const nextToday = (byDate[todayStr] || []).find((e) => e.s != null && !isPast(e));
      const shift = (n2) => {
        if (view === "day") setSel(PN.ymd(_addDays(selD, n2)));
        else if (view === "week") setSel(PN.ymd(_addDays(selD, 7 * n2)));
        else {
          const d = new Date(selD);
          d.setDate(1);
          d.setMonth(d.getMonth() + n2);
          setSel(PN.ymd(d));
        }
      };
      useEffect(() => {
        const k = (e) => {
          if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
          if (e.metaKey || e.ctrlKey || e.altKey) return;
          if (e.key === "ArrowLeft") shift(-1);
          else if (e.key === "ArrowRight") shift(1);
          else if (e.key === "t" || e.key === "T") setSel(todayStr);
        };
        window.addEventListener("keydown", k);
        return () => window.removeEventListener("keydown", k);
      });
      useEffect(() => {
        const el = wRef.current;
        if (view === "week" && el) el.scrollTop = Math.max(0, (9 - wH0.current) * HOUR);
      }, [view, PN.ymd(_monday(PN.parseYmd(sel)))]);
      const openEvent = (e) => {
        if (e.go) return navigate(e.go[0], e.go[1]);
        if (e.link) window.open(e.link, "_blank", "noopener");
      };
      const removeEvent = async (e) => {
        const ok = confirm ? await confirm({ title: "Eliminar evento", body: `Se eliminar\xE1 \xAB${e.title}\xBB del calendario.`, confirmLabel: "Eliminar", danger: true }) : window.confirm(`\xBFEliminar \xAB${e.title}\xBB?`);
        if (ok) D.deleteAgendaEvent(e.id);
      };
      const ask = (q) => {
        try {
          sessionStorage.setItem("nora_prefill", q);
        } catch (_) {
        }
        navigate("nora");
      };
      const n = PN.dayDiff(sel);
      const mon = _monday(selD), sun = _addDays(mon, 6);
      const weekEvents = events.filter((e) => e.date >= PN.ymd(mon) && e.date <= PN.ymd(sun));
      const monthKey = sel.slice(0, 7);
      const monthEvents = events.filter((e) => e.date.slice(0, 7) === monthKey);
      const thisMonth = monthKey === todayStr.slice(0, 7);
      const curWeek = PN.ymd(_monday(now)) === PN.ymd(mon);
      const wDiff = Math.round((mon - _monday(now)) / (7 * 864e5));
      const plural = (k, w) => `${k} ${w}${k === 1 ? "" : "s"}`;
      let sub, title;
      if (view === "day") {
        const k = (byDate[sel] || []).length;
        sub = `${PN.longDate(selD)} \xB7 ${plural(k, "evento")}${n === 0 ? " hoy" : ""}`;
        title = n === 0 ? "Hoy" : n === 1 ? "Ma\xF1ana" : n === -1 ? "Ayer" : `${PN.cap(PN.DIAS[selD.getDay()])} ${selD.getDate()}`;
      } else if (view === "week") {
        const sameM = mon.getMonth() === sun.getMonth();
        sub = `${mon.getDate()}${sameM ? "" : " de " + PN.MESES[mon.getMonth()]} \u2013 ${sun.getDate()} de ${PN.MESES[sun.getMonth()]} \xB7 ${plural(_uniq(weekEvents), "evento")}`;
        title = curWeek ? "Esta semana" : wDiff === 1 ? "Pr\xF3xima semana" : wDiff === -1 ? "Semana pasada" : `Semana del ${mon.getDate()} de ${PN.MESES[mon.getMonth()]}`;
      } else {
        sub = `${thisMonth ? PN.longDate(now) : PN.cap(PN.MESES[selD.getMonth()]) + " de " + selD.getFullYear()} \xB7 ${plural(_uniq(monthEvents), "evento")} este mes`;
        title = `${PN.cap(PN.MESES[selD.getMonth()])}${selD.getFullYear() !== now.getFullYear() ? " " + selD.getFullYear() : ""}`;
      }
      const DayView = () => {
        const week = Array.from({ length: 7 }, (_, i) => _addDays(mon, i));
        const list = byDate[sel] || [];
        const allDay = list.filter((e) => e.s == null), timed = list.filter((e) => e.s != null);
        const showNow = sel === todayStr;
        const before = showNow ? timed.filter((e) => e.s <= nowMin) : timed;
        const after = showNow ? timed.filter((e) => e.s > nowMin) : [];
        const Row = (e) => {
          const past = isPast(e);
          const starts = e.date === todayStr && e.s != null ? e.s - nowMin : null;
          const live = e.date === todayStr && e.s != null && e.s <= nowMin && !past;
          const subTxt = [
            e.kind === "custom" ? _place(e.link) || e.sub || "Evento" : e.sub,
            e.kind === "custom" && e.link && e.sub ? e.sub : null,
            live ? "en curso" : starts != null && starts > 0 && starts <= 60 ? `empieza en ${starts} min` : null
          ].filter(Boolean).join(" \xB7 ");
          const canJoin = e.link && !past && (live || starts != null && starts <= 60);
          return /* @__PURE__ */ React.createElement("div", { key: e.id, className: "pn-ev" + (past ? " past" : "") }, /* @__PURE__ */ React.createElement("div", { className: "pn-ev-time" }, e.s != null ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("p", { className: "st" }, _hhmm(e.s)), /* @__PURE__ */ React.createElement("p", { className: "t-caption en" }, e.e2 != null ? _hhmm(e.e2) : "\u200B")) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("p", { className: "st" }, "Todo"), /* @__PURE__ */ React.createElement("p", { className: "t-caption en" }, "el d\xEDa"))), /* @__PURE__ */ React.createElement("div", { className: "pn-ev-card", role: "button", onClick: () => openEvent(e) }, /* @__PURE__ */ React.createElement("i", { className: "mark" }), /* @__PURE__ */ React.createElement("div", { className: "txt" }, /* @__PURE__ */ React.createElement("p", { className: "tt" }, e.title), /* @__PURE__ */ React.createElement("p", { className: "t-caption sb" }, subTxt)), /* @__PURE__ */ React.createElement("span", { className: "av" }, PN.initials(e.who)), canJoin && /* @__PURE__ */ React.createElement("a", { className: "join", href: e.link, target: "_blank", rel: "noopener noreferrer", onClick: (ev) => ev.stopPropagation() }, /* @__PURE__ */ React.createElement(PIcon, { name: "video" }), /* @__PURE__ */ React.createElement("span", null, "Unirse")), e.kind === "custom" && /* @__PURE__ */ React.createElement("span", { className: "pn-x", role: "button", "aria-label": "Eliminar evento", onClick: (ev) => {
            ev.stopPropagation();
            removeEvent(e);
          } }, /* @__PURE__ */ React.createElement(PIcon, { name: "x11" }))));
        };
        return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "pn-cweek" }, week.map((d) => {
          const ds = PN.ymd(d), on = ds === sel, k = Math.min(3, (byDate[ds] || []).length);
          return /* @__PURE__ */ React.createElement("button", { key: ds, className: "pn-cday" + (on ? " on" : ""), onClick: () => setSel(ds), "aria-label": PN.longDate(d) }, /* @__PURE__ */ React.createElement("span", { className: "t-caption lbl" }, PN.DIAS_C[d.getDay()].toUpperCase()), /* @__PURE__ */ React.createElement("span", { className: "num" }, d.getDate()), /* @__PURE__ */ React.createElement("span", { className: "dots" }, Array.from({ length: k }, (_, i) => /* @__PURE__ */ React.createElement("i", { key: i }))));
        })), /* @__PURE__ */ React.createElement(PN.ScrollArea, { top: 309, bottom: 244 }, /* @__PURE__ */ React.createElement("div", { className: "pn-agenda" }, list.length === 0 && /* @__PURE__ */ React.createElement("div", { className: "pn-empty" }, /* @__PURE__ */ React.createElement("p", { className: "t-title-m", style: { color: "var(--ink-900)" } }, "Sin eventos ", n === 0 ? "hoy" : PN.relDay(sel)), /* @__PURE__ */ React.createElement("p", { className: "t-small", style: { color: "var(--gray-300)" } }, "Crea uno abajo o con el bot\xF3n +.")), allDay.map(Row), before.map(Row), showNow && list.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "pn-now" }, /* @__PURE__ */ React.createElement("span", null, _hhmm(nowMin)), /* @__PURE__ */ React.createElement("i", { className: "dot" }), /* @__PURE__ */ React.createElement("i", { className: "line" })), after.map(Row))));
      };
      const WeekView = () => {
        const days = Array.from({ length: 7 }, (_, i) => _addDays(mon, i));
        const timed = weekEvents.filter((e) => e.s != null);
        const allDay = weekEvents.filter((e) => e.s == null);
        let h0 = 9, h1 = 20;
        timed.forEach((e) => {
          h0 = Math.min(h0, Math.floor(e.s / 60));
          h1 = Math.max(h1, Math.ceil((e.e2 ?? e.s + 60) / 60));
        });
        wH0.current = h0;
        const gridH = (h1 - h0) * HOUR;
        const colL = (i) => 44 + i * 108;
        const todayIdx = days.findIndex((d) => PN.ymd(d) === todayStr);
        const boxes = [];
        days.forEach((d, i) => {
          const ds = PN.ymd(d);
          const evs = timed.filter((e) => e.date === ds).sort((a, b) => a.s - b.s);
          const lanes = [];
          evs.forEach((e) => {
            const end = Math.max(e.e2 ?? e.s + 60, e.s + 30);
            let li = lanes.findIndex((l) => l <= e.s);
            if (li < 0) {
              li = lanes.length;
              lanes.push(0);
            }
            lanes[li] = end;
            boxes.push({ e, i, li, end });
          });
          boxes.filter((b) => b.i === i).forEach((b) => {
            b.n = lanes.length;
          });
        });
        const adStrip = allDay.length > 0;
        return /* @__PURE__ */ React.createElement("div", { className: "pn-wscroll" }, /* @__PURE__ */ React.createElement("div", { className: "pn-wdays" }, days.map((d, i) => {
          const ds = PN.ymd(d);
          return /* @__PURE__ */ React.createElement(
            "button",
            {
              key: ds,
              className: "pn-wday" + (ds === todayStr ? " today" : ""),
              style: { left: colL(i), width: 108 },
              onClick: () => {
                setSel(ds);
                setView("day");
              },
              "aria-label": PN.longDate(d)
            },
            /* @__PURE__ */ React.createElement("span", { className: "lbl" }, PN.DIAS_C[d.getDay()].toUpperCase()),
            /* @__PURE__ */ React.createElement("span", { className: "num" }, d.getDate())
          );
        })), adStrip && /* @__PURE__ */ React.createElement("div", { className: "pn-wallday" }, days.map((d, i) => allDay.filter((e) => e.date === PN.ymd(d)).slice(0, 1).map((e) => /* @__PURE__ */ React.createElement("button", { key: e.id, className: "pn-wchip" + (isPast(e) ? " past" : ""), style: { left: colL(i) + 3, width: 102 }, onClick: () => openEvent(e), title: e.title }, e.title)))), /* @__PURE__ */ React.createElement("div", { className: "pn-wgrid", ref: wRef, style: { top: (adStrip ? 270 : 248) - 8, height: (adStrip ? 352 : 374) + 9 } }, /* @__PURE__ */ React.createElement("div", { style: { position: "relative", height: gridH + 1, marginTop: 8 } }, todayIdx >= 0 && /* @__PURE__ */ React.createElement("div", { className: "pn-wtoday", style: { left: colL(todayIdx), height: gridH } }), Array.from({ length: h1 - h0 + 1 }, (_, k) => /* @__PURE__ */ React.createElement(React.Fragment, { key: k }, /* @__PURE__ */ React.createElement("i", { className: "pn-whl", style: { top: k * HOUR } }), k < h1 - h0 && /* @__PURE__ */ React.createElement("span", { className: "pn-whr", style: { top: k * HOUR - 7 } }, _hhmm((h0 + k) * 60)))), [1, 2, 3, 4, 5, 6].map((i) => /* @__PURE__ */ React.createElement("i", { key: i, className: "pn-wvl", style: { left: colL(i), height: gridH } })), boxes.map(({ e, i, li, n: lanesN, end }) => {
          const w = (102 - (lanesN - 1) * 3) / lanesN;
          const top = (e.s / 60 - h0) * HOUR + 2;
          const h = Math.max(30, (end - e.s) / 60 * HOUR - 4);
          const cls = isPast(e) ? "past" : nextToday && nextToday.id === e.id ? "next" : "";
          return /* @__PURE__ */ React.createElement(
            "button",
            {
              key: e.id,
              className: "pn-wev " + cls,
              style: { left: colL(i) + 3 + li * (w + 3), width: w, top, height: h },
              onClick: () => openEvent(e),
              title: e.title
            },
            /* @__PURE__ */ React.createElement("span", { className: "tt" }, e.title),
            h >= 44 && /* @__PURE__ */ React.createElement("span", { className: "tm" }, _hhmm(e.s), e.e2 != null ? " \u2013 " + _hhmm(e.e2) : "")
          );
        }), todayIdx >= 0 && nowMin >= h0 * 60 && nowMin <= h1 * 60 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("i", { className: "pn-wnow", style: { left: colL(todayIdx), top: (nowMin / 60 - h0) * HOUR } }), /* @__PURE__ */ React.createElement("i", { className: "pn-wnowdot", style: { left: colL(todayIdx) - 4, top: (nowMin / 60 - h0) * HOUR - 3.25 } })))));
      };
      const MonthView = () => {
        const first = new Date(selD.getFullYear(), selD.getMonth(), 1, 12);
        const start = _monday(first);
        const last = new Date(selD.getFullYear(), selD.getMonth() + 1, 0, 12);
        const rows = Math.ceil(((first.getDay() + 6) % 7 + last.getDate()) / 7);
        const cells = Array.from({ length: rows * 7 }, (_, i) => _addDays(start, i));
        const pc = (k) => `${k * 100 / 7}%`;
        return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "pn-mhead" }, PN.DIAS_C.slice(1).concat(PN.DIAS_C[0]).map((d, i) => /* @__PURE__ */ React.createElement("span", { key: d, style: { left: `calc(${pc(i)} + var(--mh-off, 12px))` } }, d.toUpperCase()))), /* @__PURE__ */ React.createElement("div", { className: "pn-month", style: { height: rows * 76 } }, [1, 2, 3, 4, 5, 6].map((i) => /* @__PURE__ */ React.createElement("i", { key: "v" + i, className: "vl", style: { left: pc(i) } })), Array.from({ length: rows - 1 }, (_, i) => /* @__PURE__ */ React.createElement("i", { key: "h" + i, className: "hl", style: { top: (i + 1) * 76 } })), cells.map((d, i) => {
          const ds = PN.ymd(d), inM = d.getMonth() === selD.getMonth(), evs = byDate[ds] || [];
          const shown = evs.length > 2 ? evs.slice(0, 1) : evs;
          return /* @__PURE__ */ React.createElement(
            "button",
            {
              key: ds,
              className: "pn-mcell" + (inM ? "" : " out") + (ds === todayStr ? " today" : ""),
              style: { left: pc(i % 7), top: Math.floor(i / 7) * 76, width: pc(1) },
              onClick: () => {
                setSel(ds);
                setView("day");
              },
              "aria-label": PN.longDate(d)
            },
            /* @__PURE__ */ React.createElement("span", { className: "num" }, d.getDate()),
            shown.map((e) => /* @__PURE__ */ React.createElement("span", { key: e.id, className: "pn-mev" + (ds < todayStr ? " past" : "") }, /* @__PURE__ */ React.createElement("i", null), /* @__PURE__ */ React.createElement("span", null, e.title))),
            evs.length > 2 && /* @__PURE__ */ React.createElement("span", { className: "more" }, "+", evs.length - 1, " m\xE1s")
          );
        })));
      };
      const nextMonthName = PN.MESES[(selD.getMonth() + 1) % 12];
      const sug = view === "day" ? [["Nuevo evento", () => openModal("newEvent", { date: sel })], ["\xBFQu\xE9 tengo esta semana?", () => ask("\xBFQu\xE9 tengo esta semana en el calendario?")], ["Buscar hueco libre", () => ask(`Busca un hueco libre ${PN.relDay(sel)} para una reuni\xF3n`)]] : view === "week" ? [["Nuevo evento", () => openModal("newEvent", { date: sel })], ["Buscar hueco libre", () => ask(`Busca un hueco libre la semana del ${mon.getDate()} de ${PN.MESES[mon.getMonth()]}`)], ["Resumen de la semana", () => ask(`Hazme un resumen de mi semana del ${mon.getDate()} de ${PN.MESES[mon.getMonth()]}`)]] : [["Nuevo evento", () => openModal("newEvent", { date: sel })], ["\xBFQu\xE9 entregas hay este mes?", () => ask(`\xBFQu\xE9 entregas tengo en ${PN.MESES[selD.getMonth()]}?`)], [`Planificar ${nextMonthName}`, () => ask(`Ay\xFAdame a planificar ${nextMonthName}`)]];
      return /* @__PURE__ */ React.createElement("div", { className: "pn-stage" }, /* @__PURE__ */ React.createElement("div", { className: "pn-col" }, /* @__PURE__ */ React.createElement("div", { className: "pn-head pn-head-cal" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "t-small", style: { color: "var(--gray-400)", lineHeight: "20px" } }, sub), /* @__PURE__ */ React.createElement("h1", { className: "t-h2", style: { margin: "10px 0 0", color: "var(--ink-900)" } }, title)), /* @__PURE__ */ React.createElement("div", { className: "pn-cal-ctl" }, /* @__PURE__ */ React.createElement("div", { className: "pn-seg" }, [["day", "D\xEDa"], ["week", "Semana"], ["month", "Mes"]].map(([v, l]) => /* @__PURE__ */ React.createElement("button", { key: v, className: view === v ? "on" : "", onClick: () => setView(v) }, l))), /* @__PURE__ */ React.createElement("button", { className: "pn-arrow", "aria-label": "Anterior", onClick: () => shift(-1) }, /* @__PURE__ */ React.createElement(PIcon, { name: "chev-l" })), /* @__PURE__ */ React.createElement("button", { className: "pn-arrow", "aria-label": "Siguiente", onClick: () => shift(1) }, /* @__PURE__ */ React.createElement(PIcon, { name: "chev-r" })))), view === "day" ? DayView() : view === "week" ? WeekView() : MonthView(), /* @__PURE__ */ React.createElement(
        PN.NoraBox,
        {
          navigate,
          placeholder: "Crea un evento o preg\xFAntale a Nora\u2026",
          suggestions: sug.map((s) => s[0]),
          onSubmit: (t) => {
            const s = sug.find((x) => x[0] === t);
            if (s) s[1]();
            else ask(t || "Ay\xFAdame con mi calendario");
          }
        }
      )));
    };
    window.PanelCalendar = PanelCalendar;
  })();
})();

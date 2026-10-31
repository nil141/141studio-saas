// Panel · Calendario (Figma 166:68 Día, 167:2 Semana, 167:327 Mes).
// Mismas fuentes que la agenda anterior: eventos propios (y los de Google
// Calendar sincronizados), entregas de proyectos y vencimientos de facturas.
(() => {
const { useState, useEffect, useRef } = React;
const PN = window.PN;

PIcon.add({
  "chev-l": [14, `<path d="M8.74996 2.91675L4.66663 7.00008L8.74996 11.0834" stroke="currentColor" stroke-width="0.991667" stroke-linecap="round" stroke-linejoin="round"/>`],
  "chev-r": [14, `<path d="M5.25 2.91675L9.33333 7.00008L5.25 11.0834" stroke="currentColor" stroke-width="0.991667" stroke-linecap="round" stroke-linejoin="round"/>`],
  "video":  [13, `<path d="M7.04167 3.52075H2.97917C2.23128 3.52075 1.625 4.12703 1.625 4.87492V8.12492C1.625 8.8728 2.23128 9.47909 2.97917 9.47909H7.04167C7.78955 9.47909 8.39583 8.8728 8.39583 8.12492V4.87492C8.39583 4.12703 7.78955 3.52075 7.04167 3.52075Z" stroke="currentColor" stroke-width="1.08333" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.39587 5.6875L11.1042 4.0625V8.9375L8.39587 7.3125" stroke="currentColor" stroke-width="1.08333" stroke-linecap="round" stroke-linejoin="round"/>`],
});

const VIEW_KEY = "pn_cal_view";
const HOUR = 34;                  // alto de una hora en la vista semana
const _toYMD = (d) => {
  if (!d) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(d)) return String(d).slice(0, 10);
  const months = { ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5, jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11 };
  const m = String(d).toLowerCase().match(/(\d{1,2})\s+([a-záéíóú]{3})\s+(\d{4})/);
  return m ? `${m[3]}-${String((months[m[2]] || 0) + 1).padStart(2, "0")}-${m[1].padStart(2, "0")}` : null;
};
const _min = (t) => { const m = /^(\d{1,2}):(\d{2})/.exec(t || ""); return m ? +m[1] * 60 + +m[2] : null; };
const _hhmm = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const _addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
// Los eventos de varios días cuentan una vez
const _uniq = (list) => new Set(list.map(e => e.id)).size;
const _MESC = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const _monday = (d) => { const x = new Date(d); x.setHours(12, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
const _noClient = (s) => !s || ["—", "-", "Interno"].includes(String(s).trim());
const _place = (link) => !link ? "" : /meet\.google/.test(link) ? "Google Meet" : /zoom\./.test(link) ? "Zoom" : /teams\./.test(link) ? "Teams" : "Videollamada";

// Todos los eventos (mismo criterio que la agenda anterior)
const _allEvents = (D) => {
  const out = [];
  (D.PROJECTS || []).forEach(p => {
    const ymd = _toYMD(p.deadline); if (!ymd) return;
    out.push({ id: "proj-" + p.id, date: ymd, title: "Entrega: " + p.name, kind: "project", who: _noClient(p.clientName) ? p.name : p.clientName,
      sub: "Entrega" + (_noClient(p.clientName) ? "" : " · " + p.clientName), go: ["project", { projectId: p.id }] });
  });
  (D.INVOICES || []).forEach(inv => {
    const ymd = _toYMD(inv.due); if (!ymd) return;
    out.push({ id: "inv-" + inv.id, date: ymd, title: "Factura · " + inv.client, kind: "invoice", who: inv.client,
      sub: "Vencimiento · " + (inv.amount || 0).toLocaleString("es-ES") + " €", go: ["billing", {}] });
  });
  (D.AGENDA_EVENTS || []).forEach(e => {
    const parts = String(e.title || "").split(" · ");
    const base = { ...e, kind: "custom", who: parts.length > 1 ? parts[parts.length - 1] : e.title };
    // Evento de varios días: una copia por día (mismo id, para poder borrarlo entero)
    if (e.dateEnd && e.dateEnd > e.date) {
      const a = PN.parseYmd(e.date), b = PN.parseYmd(e.dateEnd);
      const span = `${a.getDate()} ${_MESC[a.getMonth()]} – ${b.getDate()} ${_MESC[b.getMonth()]}`;
      for (let d = new Date(a), i = 0; d <= b && i < 366; d = _addDays(d, 1), i++)
        out.push({ ...base, date: PN.ymd(d), sub: [e.sub, span].filter(Boolean).join(" · ") });
      return;
    }
    out.push(base);
  });
  return out.map(e => ({ ...e, s: _min(e.time), e2: _min(e.timeEnd) }))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : (a.s ?? -1) - (b.s ?? -1)));
};

const PanelCalendar = ({ navigate, openModal }) => {
  const D = window.Data; D.useStore();
  useEffect(() => { try { D.googleSync && D.googleSync(); } catch (_) {} }, []);
  const now = new Date();
  const todayStr = PN.ymd(now);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const [view, setViewS] = useState(() => { try { return localStorage.getItem(VIEW_KEY) || "day"; } catch (_) { return "day"; } });
  const setView = (v) => { setViewS(v); try { localStorage.setItem(VIEW_KEY, v); } catch (_) {} };
  const [sel, setSel] = useState(todayStr);
  const [tick, setTick] = useState(0);
  const confirm = window.useConfirm ? window.useConfirm() : null;
  const wRef = useRef(null), wH0 = useRef(9);
  useEffect(() => { const t = setInterval(() => setTick(x => x + 1), 30000); return () => clearInterval(t); }, []);

  const events = _allEvents(D);
  const byDate = {};
  events.forEach(e => { (byDate[e.date] = byDate[e.date] || []).push(e); });
  const selD = PN.parseYmd(sel);

  // Pasado / próximo (solo cuenta la hora en el día de hoy)
  const isPast = (e) => e.date < todayStr || (e.date === todayStr && e.s != null && (e.e2 ?? e.s + 30) <= nowMin);
  const nextToday = (byDate[todayStr] || []).find(e => e.s != null && !isPast(e));

  const shift = (n) => {
    if (view === "day") setSel(PN.ymd(_addDays(selD, n)));
    else if (view === "week") setSel(PN.ymd(_addDays(selD, 7 * n)));
    else { const d = new Date(selD); d.setDate(1); d.setMonth(d.getMonth() + n); setSel(PN.ymd(d)); }
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

  // Semana: al entrar o cambiar de semana, la rejilla empieza a las 09:00
  useEffect(() => { const el = wRef.current; if (view === "week" && el) el.scrollTop = Math.max(0, (9 - wH0.current) * HOUR); }, [view, PN.ymd(_monday(PN.parseYmd(sel)))]);

  const openEvent = (e) => {
    if (e.go) return navigate(e.go[0], e.go[1]);
    if (e.link) window.open(e.link, "_blank", "noopener");
  };
  const removeEvent = async (e) => {
    const ok = confirm ? await confirm({ title: "Eliminar evento", body: `Se eliminará «${e.title}» del calendario.`, confirmLabel: "Eliminar", danger: true }) : window.confirm(`¿Eliminar «${e.title}»?`);
    if (ok) D.deleteAgendaEvent(e.id);
  };
  const ask = (q) => { try { sessionStorage.setItem("nora_prefill", q); } catch (_) {} navigate("nora"); };

  // ── Cabecera ──
  const n = PN.dayDiff(sel);
  const mon = _monday(selD), sun = _addDays(mon, 6);
  const weekEvents = events.filter(e => e.date >= PN.ymd(mon) && e.date <= PN.ymd(sun));
  const monthKey = sel.slice(0, 7);
  const monthEvents = events.filter(e => e.date.slice(0, 7) === monthKey);
  const thisMonth = monthKey === todayStr.slice(0, 7);
  const curWeek = PN.ymd(_monday(now)) === PN.ymd(mon);
  const wDiff = Math.round((mon - _monday(now)) / (7 * 86400000));
  const plural = (k, w) => `${k} ${w}${k === 1 ? "" : "s"}`;
  let sub, title;
  if (view === "day") {
    const k = (byDate[sel] || []).length;
    sub = `${PN.longDate(selD)} · ${plural(k, "evento")}${n === 0 ? " hoy" : ""}`;
    title = n === 0 ? "de hoy" : n === 1 ? "de mañana" : n === -1 ? "de ayer" : `del ${PN.DIAS[selD.getDay()]} ${selD.getDate()}`;
  } else if (view === "week") {
    const sameM = mon.getMonth() === sun.getMonth();
    sub = `${mon.getDate()}${sameM ? "" : " de " + PN.MESES[mon.getMonth()]} – ${sun.getDate()} de ${PN.MESES[sun.getMonth()]} · ${plural(_uniq(weekEvents), "evento")}`;
    title = curWeek ? "de la semana" : wDiff === 1 ? "de la próxima semana" : wDiff === -1 ? "de la semana pasada" : `del ${mon.getDate()} de ${PN.MESES[mon.getMonth()]}`;
  } else {
    sub = `${thisMonth ? PN.longDate(now) : PN.cap(PN.MESES[selD.getMonth()]) + " de " + selD.getFullYear()} · ${plural(_uniq(monthEvents), "evento")} este mes`;
    title = `de ${PN.MESES[selD.getMonth()]}${selD.getFullYear() !== now.getFullYear() ? " " + selD.getFullYear() : ""}`;
  }

  // ── Vista día ──
  const DayView = () => {
    const week = Array.from({ length: 7 }, (_, i) => _addDays(mon, i));
    const list = byDate[sel] || [];
    const allDay = list.filter(e => e.s == null), timed = list.filter(e => e.s != null);
    const showNow = sel === todayStr;
    const before = showNow ? timed.filter(e => e.s <= nowMin) : timed;
    const after = showNow ? timed.filter(e => e.s > nowMin) : [];
    const Row = (e) => {
      const past = isPast(e);
      const starts = e.date === todayStr && e.s != null ? e.s - nowMin : null;
      const live = e.date === todayStr && e.s != null && e.s <= nowMin && !past;
      const subTxt = [e.kind === "custom" ? (_place(e.link) || e.sub || "Evento") : e.sub,
        e.kind === "custom" && e.link && e.sub ? e.sub : null,
        live ? "en curso" : starts != null && starts > 0 && starts <= 60 ? `empieza en ${starts} min` : null].filter(Boolean).join(" · ");
      const canJoin = e.link && !past && (live || (starts != null && starts <= 60));
      return (
        <div key={e.id} className={"pn-ev" + (past ? " past" : "")}>
          <div className="pn-ev-time">
            {e.s != null ? <><p className="st">{_hhmm(e.s)}</p><p className="t-caption en">{e.e2 != null ? _hhmm(e.e2) : "​"}</p></>
              : <><p className="st">Todo</p><p className="t-caption en">el día</p></>}
          </div>
          <div className="pn-ev-card" role="button" onClick={() => openEvent(e)}>
            <i className="mark"/>
            <div className="txt">
              <p className="tt">{e.title}</p>
              <p className="t-caption sb">{subTxt}</p>
            </div>
            <span className="av">{PN.initials(e.who)}</span>
            {canJoin && (
              <a className="join" href={e.link} target="_blank" rel="noopener noreferrer" onClick={ev => ev.stopPropagation()}>
                <PIcon name="video"/><span>Unirse</span>
              </a>
            )}
            {e.kind === "custom" && (
              <span className="pn-x" role="button" aria-label="Eliminar evento" onClick={ev => { ev.stopPropagation(); removeEvent(e); }}><PIcon name="x11"/></span>
            )}
          </div>
        </div>
      );
    };
    return (
      <>
        <div className="pn-cweek">
          {week.map(d => {
            const ds = PN.ymd(d), on = ds === sel, k = Math.min(3, (byDate[ds] || []).length);
            return (
              <button key={ds} className={"pn-cday" + (on ? " on" : "")} onClick={() => setSel(ds)} aria-label={PN.longDate(d)}>
                <span className="t-caption lbl">{PN.DIAS_C[d.getDay()].toUpperCase()}</span>
                <span className="num">{d.getDate()}</span>
                <span className="dots">{Array.from({ length: k }, (_, i) => <i key={i}/>)}</span>
              </button>
            );
          })}
        </div>
        <PN.ScrollArea top={309} bottom={244}>
          <div className="pn-agenda">
            {list.length === 0 && (
              <div className="pn-empty">
                <p className="t-title-m" style={{ color: "var(--ink-900)" }}>Sin eventos {n === 0 ? "hoy" : PN.relDay(sel)}</p>
                <p className="t-small" style={{ color: "var(--gray-300)" }}>Crea uno abajo o con el botón +.</p>
              </div>
            )}
            {allDay.map(Row)}
            {before.map(Row)}
            {showNow && list.length > 0 && (
              <div className="pn-now"><span>{_hhmm(nowMin)}</span><i className="dot"/><i className="line"/></div>
            )}
            {after.map(Row)}
          </div>
        </PN.ScrollArea>
      </>
    );
  };

  // ── Vista semana ──
  const WeekView = () => {
    const days = Array.from({ length: 7 }, (_, i) => _addDays(mon, i));
    const timed = weekEvents.filter(e => e.s != null);
    const allDay = weekEvents.filter(e => e.s == null);
    let h0 = 9, h1 = 20;
    timed.forEach(e => { h0 = Math.min(h0, Math.floor(e.s / 60)); h1 = Math.max(h1, Math.ceil((e.e2 ?? e.s + 60) / 60)); });
    wH0.current = h0;
    const gridH = (h1 - h0) * HOUR;
    const colL = (i) => 44 + i * 108;
    const todayIdx = days.findIndex(d => PN.ymd(d) === todayStr);
    // Carriles para eventos que se solapan en el mismo día
    const boxes = [];
    days.forEach((d, i) => {
      const ds = PN.ymd(d);
      const evs = timed.filter(e => e.date === ds).sort((a, b) => a.s - b.s);
      const lanes = [];
      evs.forEach(e => {
        const end = Math.max(e.e2 ?? e.s + 60, e.s + 30);
        let li = lanes.findIndex(l => l <= e.s); if (li < 0) { li = lanes.length; lanes.push(0); }
        lanes[li] = end; boxes.push({ e, i, li, end });
      });
      boxes.filter(b => b.i === i).forEach(b => { b.n = lanes.length; });
    });
    const adStrip = allDay.length > 0;
    return (
      <div className="pn-wscroll">
        <div className="pn-wdays">
          {days.map((d, i) => {
            const ds = PN.ymd(d);
            return (
              <button key={ds} className={"pn-wday" + (ds === todayStr ? " today" : "")} style={{ left: colL(i), width: 108 }}
                onClick={() => { setSel(ds); setView("day"); }} aria-label={PN.longDate(d)}>
                <span className="lbl">{PN.DIAS_C[d.getDay()].toUpperCase()}</span>
                <span className="num">{d.getDate()}</span>
              </button>
            );
          })}
        </div>
        {adStrip && (
          <div className="pn-wallday">
            {days.map((d, i) => (allDay.filter(e => e.date === PN.ymd(d)).slice(0, 1).map(e => (
              <button key={e.id} className={"pn-wchip" + (isPast(e) ? " past" : "")} style={{ left: colL(i) + 3, width: 102 }} onClick={() => openEvent(e)} title={e.title}>{e.title}</button>
            ))))}
          </div>
        )}
        {/* 8px de margen arriba para que la etiqueta de la primera hora no se corte */}
        <div className="pn-wgrid" ref={wRef} style={{ top: (adStrip ? 270 : 248) - 8, height: (adStrip ? 352 : 374) + 9 }}>
          <div style={{ position: "relative", height: gridH + 1, marginTop: 8 }}>
            {todayIdx >= 0 && <div className="pn-wtoday" style={{ left: colL(todayIdx), height: gridH }}/>}
            {Array.from({ length: h1 - h0 + 1 }, (_, k) => (
              <React.Fragment key={k}>
                <i className="pn-whl" style={{ top: k * HOUR }}/>
                {k < h1 - h0 && <span className="pn-whr" style={{ top: k * HOUR - 7 }}>{_hhmm((h0 + k) * 60)}</span>}
              </React.Fragment>
            ))}
            {[1, 2, 3, 4, 5, 6].map(i => <i key={i} className="pn-wvl" style={{ left: colL(i), height: gridH }}/>)}
            {boxes.map(({ e, i, li, n: lanesN, end }) => {
              const w = (102 - (lanesN - 1) * 3) / lanesN;
              const top = (e.s / 60 - h0) * HOUR + 2;
              const h = Math.max(30, ((end - e.s) / 60) * HOUR - 4);
              const cls = isPast(e) ? "past" : nextToday && nextToday.id === e.id ? "next" : "";
              return (
                <button key={e.id} className={"pn-wev " + cls} style={{ left: colL(i) + 3 + li * (w + 3), width: w, top, height: h }}
                  onClick={() => openEvent(e)} title={e.title}>
                  <span className="tt">{e.title}</span>
                  {h >= 44 && <span className="tm">{_hhmm(e.s)}{e.e2 != null ? " – " + _hhmm(e.e2) : ""}</span>}
                </button>
              );
            })}
            {todayIdx >= 0 && nowMin >= h0 * 60 && nowMin <= h1 * 60 && (
              <>
                <i className="pn-wnow" style={{ left: colL(todayIdx), top: (nowMin / 60 - h0) * HOUR }}/>
                <i className="pn-wnowdot" style={{ left: colL(todayIdx) - 4, top: (nowMin / 60 - h0) * HOUR - 3.25 }}/>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ── Vista mes ──
  const MonthView = () => {
    const first = new Date(selD.getFullYear(), selD.getMonth(), 1, 12);
    const start = _monday(first);
    const last = new Date(selD.getFullYear(), selD.getMonth() + 1, 0, 12);
    const rows = Math.ceil((((first.getDay() + 6) % 7) + last.getDate()) / 7);
    const cells = Array.from({ length: rows * 7 }, (_, i) => _addDays(start, i));
    const cw = 800 / 7;
    return (
      <>
        <div className="pn-mhead">
          {PN.DIAS_C.slice(1).concat(PN.DIAS_C[0]).map((d, i) => <span key={d} style={{ left: i * cw + 12 }}>{d.toUpperCase()}</span>)}
        </div>
        <div className="pn-month" style={{ height: rows * 76 }}>
          {[1, 2, 3, 4, 5, 6].map(i => <i key={"v" + i} className="vl" style={{ left: i * cw }}/>)}
          {Array.from({ length: rows - 1 }, (_, i) => <i key={"h" + i} className="hl" style={{ top: (i + 1) * 76 }}/>)}
          {cells.map((d, i) => {
            const ds = PN.ymd(d), inM = d.getMonth() === selD.getMonth(), evs = byDate[ds] || [];
            const shown = evs.length > 2 ? evs.slice(0, 1) : evs;
            return (
              <button key={ds} className={"pn-mcell" + (inM ? "" : " out") + (ds === todayStr ? " today" : "")}
                style={{ left: (i % 7) * cw, top: Math.floor(i / 7) * 76, width: cw }}
                onClick={() => { setSel(ds); setView("day"); }} aria-label={PN.longDate(d)}>
                <span className="num">{d.getDate()}</span>
                {shown.map(e => (
                  <span key={e.id} className={"pn-mev" + (ds < todayStr ? " past" : "")}><i/><span>{e.title}</span></span>
                ))}
                {evs.length > 2 && <span className="more">+{evs.length - 1} más</span>}
              </button>
            );
          })}
        </div>
      </>
    );
  };

  const nextMonthName = PN.MESES[(selD.getMonth() + 1) % 12];
  const sug = view === "day"
    ? [["Nuevo evento", () => openModal("newEvent", { date: sel })], ["¿Qué tengo esta semana?", () => ask("¿Qué tengo esta semana en el calendario?")], ["Buscar hueco libre", () => ask(`Busca un hueco libre ${PN.relDay(sel)} para una reunión`)]]
    : view === "week"
      ? [["Nuevo evento", () => openModal("newEvent", { date: sel })], ["Buscar hueco libre", () => ask(`Busca un hueco libre la semana del ${mon.getDate()} de ${PN.MESES[mon.getMonth()]}`)], ["Resumen de la semana", () => ask(`Hazme un resumen de mi semana del ${mon.getDate()} de ${PN.MESES[mon.getMonth()]}`)]]
      : [["Nuevo evento", () => openModal("newEvent", { date: sel })], ["¿Qué entregas hay este mes?", () => ask(`¿Qué entregas tengo en ${PN.MESES[selD.getMonth()]}?`)], [`Planificar ${nextMonthName}`, () => ask(`Ayúdame a planificar ${nextMonthName}`)]];

  return (
    <div className="pn-stage">
      <div className="pn-col">
        <div className="pn-head pn-head-cal">
          <div>
            <p className="t-small" style={{ color: "var(--gray-400)", lineHeight: "20px" }}>{sub}</p>
            <h1 className="t-h2" style={{ margin: "10px 0 0", color: "var(--ink-900)" }}>Calendario {title}</h1>
          </div>
          <div className="pn-cal-ctl">
            <div className="pn-seg">
              {[["day", "Día"], ["week", "Semana"], ["month", "Mes"]].map(([v, l]) => (
                <button key={v} className={view === v ? "on" : ""} onClick={() => setView(v)}>{l}</button>
              ))}
            </div>
            <button className="pn-arrow" aria-label="Anterior" onClick={() => shift(-1)}><PIcon name="chev-l"/></button>
            <button className="pn-arrow" aria-label="Siguiente" onClick={() => shift(1)}><PIcon name="chev-r"/></button>
          </div>
        </div>
        {view === "day" ? DayView() : view === "week" ? WeekView() : MonthView()}
        <PN.NoraBox navigate={navigate} placeholder="Crea un evento o pregúntale a Nora…"
          suggestions={sug.map(s => s[0])}
          onSubmit={(t) => { const s = sug.find(x => x[0] === t); if (s) s[1](); else ask(t || "Ayúdame con mi calendario"); }}/>
      </div>
    </div>
  );
};

window.PanelCalendar = PanelCalendar;
})();

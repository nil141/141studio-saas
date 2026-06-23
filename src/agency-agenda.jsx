// Agency Agenda — calendar view with tasks, project deadlines + custom events
const { useState, useEffect, useRef, useMemo } = React;

// ── helpers ──────────────────────────────────────────────────────────────────
const DAYS_ES  = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

const toYMD = d => {
  if (!d) return null;
  // already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  // "15 Jun 2026" or similar
  const months = {ene:0,feb:1,mar:2,abr:3,may:4,jun:5,jul:6,ago:7,sep:8,oct:9,nov:10,dic:11};
  const m = d.toLowerCase().match(/(\d{1,2})\s+([a-záéíóú]{3})\s+(\d{4})/);
  if (m) return `${m[3]}-${String(months[m[2]]+1||1).padStart(2,'0')}-${m[1].padStart(2,'0')}`;
  return null;
};

const todayYMD = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;
};

const EVENT_COLORS = {
  task:    { bg:"rgba(158,154,229,0.18)", text:"#c8c5f2", dot:"#9e9ae5" },
  project: { bg:"rgba(0,255,140,0.10)",  text:"#00cc70",  dot:"#00ff8c" },
  invoice: { bg:"rgba(238,229,134,0.12)",text:"#d4c940",  dot:"#eee586" },
  custom:  { bg:"rgba(96,165,250,0.14)", text:"#7db8f7",  dot:"#60a5fa" },
  meeting: { bg:"rgba(220,91,93,0.14)",  text:"#e07678",  dot:"#dc5b5d" },
};

const CUSTOM_KEY = "agenda_custom_events";
const loadCustom = () => { try { return JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]"); } catch{ return []; }};
const saveCustom = evts => localStorage.setItem(CUSTOM_KEY, JSON.stringify(evts));

const VIEW_KEY = "agenda_view";
const loadView = () => { try { return localStorage.getItem(VIEW_KEY) === "week" ? "week" : "month"; } catch{ return "month"; }};

const ymdOf = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

// ── AgendaPage ────────────────────────────────────────────────────────────────
const AgendaPage = ({ navigate }) => {
  const D = window.Data;
  D.useStore();

  const today = todayYMD();
  const [year,  setYear]  = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth()); // 0-indexed
  const [selected, setSelected] = useState(today);
  const [viewMode, setViewMode] = useState(loadView); // "month" | "week"
  const [customEvents, setCustomEvents] = useState(loadCustom);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title:"", date: today, type:"custom", time:"", timeEnd:"", notes:"" });
  const [pickerFor, setPickerFor] = useState(null); // null | "start" | "end"

  // ── build event list from all sources ──────────────────────────────────────
  const allEvents = useMemo(() => {
    const evts = [];

    // Tasks with deadline
    Object.entries(D.TASKS).forEach(([pid, tasks]) => {
      tasks.forEach(t => {
        const ymd = toYMD(t.deadline);
        if (!ymd) return;
        const proj = D.PROJECTS.find(p => p.id === pid);
        evts.push({
          id: "task-" + t.id,
          date: ymd,
          title: t.title,
          sub: proj ? proj.name : (t.clientName || ""),
          type: "task",
          source: t,
        });
      });
    });

    // Project deadlines
    D.PROJECTS.forEach(p => {
      const ymd = toYMD(p.deadline);
      if (!ymd || ymd === "—") return;
      evts.push({
        id: "proj-" + p.id,
        date: ymd,
        title: "Entrega: " + p.name,
        sub: p.clientName || "",
        type: "project",
        source: p,
      });
    });

    // Invoice due dates
    D.INVOICES.forEach(inv => {
      const ymd = toYMD(inv.due);
      if (!ymd) return;
      evts.push({
        id: "inv-" + inv.id,
        date: ymd,
        title: "Factura — " + inv.client,
        sub: "€" + (inv.amount || 0),
        type: "invoice",
        source: inv,
      });
    });

    // Custom events
    customEvents.forEach(e => evts.push(e));

    return evts;
  }, [D.TASKS, D.PROJECTS, D.INVOICES, customEvents]);

  const eventsByDate = useMemo(() => {
    const map = {};
    allEvents.forEach(e => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [allEvents]);

  // ── calendar grid ──────────────────────────────────────────────────────────
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  // Monday-first: getDay() returns 0=Sun, shift to Mon-first
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalCells  = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7;

  const cells = Array.from({ length: totalCells }, (_, i) => {
    const dayNum = i - startOffset + 1;
    if (dayNum < 1 || dayNum > lastDay.getDate()) return null;
    const ymd = `${year}-${String(month+1).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`;
    return { dayNum, ymd, events: eventsByDate[ymd] || [] };
  });

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y=>y-1); } else setMonth(m=>m-1); };
  const nextMonth = () => { if (month === 11) { setMonth(0);  setYear(y=>y+1); } else setMonth(m=>m+1); };

  const setView = (v) => { setViewMode(v); try { localStorage.setItem(VIEW_KEY, v); } catch{} };

  // ── week view: 7 days (Mon-first) of the week containing the selected day ────
  const weekDays = useMemo(() => {
    const base = new Date(selected + "T12:00:00");
    const dow  = (base.getDay() + 6) % 7; // Mon = 0
    const mon  = new Date(base); mon.setDate(base.getDate() - dow);
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); return d; });
  }, [selected]);

  const shiftWeek = (dir) => {
    const d = new Date(selected + "T12:00:00");
    d.setDate(d.getDate() + dir * 7);
    setSelected(ymdOf(d)); setYear(d.getFullYear()); setMonth(d.getMonth());
  };
  const goPrev = () => viewMode === "week" ? shiftWeek(-1) : prevMonth();
  const goNext = () => viewMode === "week" ? shiftWeek(1)  : nextMonth();
  const goToday = () => { const d = new Date(); setSelected(today); setYear(d.getFullYear()); setMonth(d.getMonth()); };

  const navTitle = viewMode === "week"
    ? (() => {
        const s = weekDays[0], e = weekDays[6];
        const sm = MONTHS_ES[s.getMonth()].slice(0,3);
        const em = MONTHS_ES[e.getMonth()].slice(0,3);
        return s.getMonth() === e.getMonth()
          ? `${s.getDate()} – ${e.getDate()} ${em} ${e.getFullYear()}`
          : `${s.getDate()} ${sm} – ${e.getDate()} ${em} ${e.getFullYear()}`;
      })()
    : `${MONTHS_ES[month]} ${year}`;

  const selectedEvents = eventsByDate[selected] || [];
  const selectedDate = selected ? new Date(selected + "T12:00:00") : null;

  // ── upcoming (next 14 days) ────────────────────────────────────────────────
  const upcoming = useMemo(() => {
    const todayDate = new Date(today + "T00:00:00");
    return allEvents
      .filter(e => {
        const d = new Date(e.date + "T00:00:00");
        const diff = (d - todayDate) / 86400000;
        return diff >= 0 && diff <= 14;
      })
      .sort((a,b) => a.date.localeCompare(b.date))
      .slice(0, 10);
  }, [allEvents, today]);

  // ── add custom event ───────────────────────────────────────────────────────
  const addEvent = () => {
    if (!form.title.trim() || !form.date) return;
    const evt = {
      id: "custom-" + Date.now(),
      date: form.date,
      title: form.title.trim(),
      sub: form.notes || "",
      time: form.time || null,
      timeEnd: form.timeEnd || null,
      type: form.type,
    };
    const updated = [...customEvents, evt];
    setCustomEvents(updated);
    saveCustom(updated);
    setShowForm(false);
    setPickerFor(null);
    setForm({ title:"", date: today, type:"custom", time:"", timeEnd:"", notes:"" });
    setSelected(evt.date);
  };

  const deleteCustom = (id) => {
    const updated = customEvents.filter(e => e.id !== id);
    setCustomEvents(updated);
    saveCustom(updated);
  };

  const typeLabel = { task:"Tarea", project:"Proyecto", invoice:"Factura", custom:"Evento", meeting:"Reunión" };

  const B = "var(--border)";
  const numWeeks = Math.ceil(cells.length / 7);
  const isCurrentPeriod = viewMode === "week"
    ? weekDays.some(d => ymdOf(d) === today)
    : (year === new Date().getFullYear() && month === new Date().getMonth());

  return (
    <div style={{display:"flex", flexDirection:"column", height:"100vh", overflow:"hidden"}}>

      {/* ── Toolbar ── */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 24px", height:64, flexShrink:0,
        borderBottom:`0.5px solid ${B}`,
      }}>
        <div style={{display:"flex", alignItems:"center", gap:18}}>
          <h1 style={{fontSize:23, fontWeight:600, letterSpacing:"-1px", margin:0, minWidth:viewMode==="week"?210:160}}>
            {navTitle}
          </h1>
          <div style={{display:"flex", alignItems:"center", gap:4}}>
            <button className="btn ghost icon-only sm" onClick={goPrev}><Icon name="chevron-left" size={15}/></button>
            <button className="btn ghost sm" onClick={goToday}
              style={{opacity: isCurrentPeriod ? 0.4 : 1, pointerEvents: isCurrentPeriod ? "none" : "auto"}}>
              Hoy
            </button>
            <button className="btn ghost icon-only sm" onClick={goNext}><Icon name="chevron-right" size={15}/></button>
          </div>
        </div>
        <div style={{display:"flex", alignItems:"center", gap:10}}>
          <div className="seg">
            <button className={viewMode==="month"?"active":""} onClick={()=>setView("month")}>Mes</button>
            <button className={viewMode==="week"?"active":""} onClick={()=>setView("week")}>Semana</button>
          </div>
          <button className="btn primary sm" onClick={() => { setForm(f=>({...f, date:selected})); setShowForm(true); }}>
            <Icon name="plus" size={13}/> Nuevo evento
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{flex:1, display:"flex", minHeight:0, overflow:"hidden"}}>

        {/* ── Calendar ── */}
        <div style={{flex:1, display:"flex", flexDirection:"column", minWidth:0}}>

          {/* Day-of-week header strip */}
          <div style={{
            display:"grid", gridTemplateColumns:"repeat(7,1fr)", flexShrink:0,
            background:"var(--bg-elev)", borderBottom:`0.5px solid ${B}`,
          }}>
            {(viewMode === "week" ? weekDays : DAYS_ES).map((item, idx) => {
              const label  = viewMode === "week" ? DAYS_ES[(item.getDay()+6)%7] : item;
              const dayNum = viewMode === "week" ? item.getDate() : null;
              const ymd    = viewMode === "week" ? ymdOf(item) : null;
              const isT = ymd === today;
              const isS = ymd === selected;
              return (
                <div key={idx}
                  onClick={viewMode === "week" ? () => { setSelected(ymd); setYear(item.getFullYear()); setMonth(item.getMonth()); } : undefined}
                  style={{
                    display:"flex",
                    flexDirection: viewMode === "week" ? "row" : "column",
                    alignItems:"center", justifyContent:"center", gap: viewMode === "week" ? 8 : 0,
                    padding: viewMode === "week" ? "11px 0" : "9px 0",
                    cursor: viewMode === "week" ? "pointer" : "default",
                  }}
                >
                  <span style={{
                    fontSize:11, fontWeight:600, letterSpacing:"0.05em", textTransform:"uppercase",
                    color: isT ? "var(--accent)" : "var(--text-subtle)",
                  }}>{label}</span>
                  {dayNum != null && (
                    <div style={{
                      minWidth:28, height:28, padding:"0 6px", borderRadius:8,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      background: isT ? "var(--accent)" : isS ? "var(--accent-soft)" : "transparent",
                      color: isT ? "#fff" : isS ? "var(--accent)" : "var(--text)",
                      fontSize:16, fontWeight:600, letterSpacing:"-0.5px",
                    }}>{dayNum}</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── MONTH grid — rows stretch to fill ── */}
          {viewMode === "month" && (
            <div style={{
              flex:1, display:"grid",
              gridTemplateColumns:"repeat(7,1fr)",
              gridTemplateRows:`repeat(${numWeeks}, 1fr)`,
            }}>
              {cells.map((cell, i) => {
                const col = i % 7;
                const row = Math.floor(i / 7);
                const borderStyle = {
                  borderRight: col < 6 ? `0.5px solid ${B}` : "none",
                  borderBottom: row < numWeeks-1 ? `0.5px solid ${B}` : "none",
                };
                if (!cell) return <div key={i} style={{...borderStyle, background:"rgba(255,255,255,0.012)"}}/>;
                const isToday    = cell.ymd === today;
                const isSelected = cell.ymd === selected;
                return (
                  <div key={i} onClick={() => setSelected(cell.ymd)} style={{
                    ...borderStyle, position:"relative",
                    padding:"6px 7px", cursor:"pointer", overflow:"hidden",
                    background: isToday ? "rgba(158,154,229,0.04)" : "transparent",
                    boxShadow: isSelected ? "inset 0 0 0 1.5px var(--accent)" : "none",
                    transition:"background .1s",
                  }}
                    onMouseEnter={e => { if (!isToday) e.currentTarget.style.background="var(--bg-hover)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = isToday ? "rgba(158,154,229,0.04)" : "transparent"; }}
                  >
                    <div style={{
                      width:24, height:24, borderRadius:"50%",
                      display:"inline-flex", alignItems:"center", justifyContent:"center",
                      background: isToday ? "var(--accent)" : "transparent",
                      color: isToday ? "#fff" : "var(--text-muted)",
                      fontSize:12, fontWeight: isToday ? 600 : 400, letterSpacing:"-0.3px",
                      marginBottom:4,
                    }}>{cell.dayNum}</div>
                    <div style={{display:"flex", flexDirection:"column", gap:2}}>
                      {cell.events.slice(0,3).map(ev => {
                        const c = EVENT_COLORS[ev.type] || EVENT_COLORS.custom;
                        return (
                          <div key={ev.id} style={{
                            background:c.bg, color:c.text, fontWeight:500,
                            fontSize:10, padding:"2px 7px", borderRadius:5,
                            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                            letterSpacing:"-0.2px",
                          }}>{ev.title}</div>
                        );
                      })}
                      {cell.events.length > 3 && (
                        <span style={{fontSize:9, color:"var(--text-subtle)", paddingLeft:6, fontWeight:500}}>
                          +{cell.events.length-3} más
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── WEEK grid — columns fill height ── */}
          {viewMode === "week" && (
            <div style={{flex:1, display:"grid", gridTemplateColumns:"repeat(7,1fr)", overflow:"hidden"}}>
              {weekDays.map((dayDate, col) => {
                const ymd  = ymdOf(dayDate);
                const isT  = ymd === today;
                const isSel = ymd === selected;
                const evts  = eventsByDate[ymd] || [];
                return (
                  <div key={ymd}
                    onClick={() => { setSelected(ymd); setYear(dayDate.getFullYear()); setMonth(dayDate.getMonth()); }}
                    style={{
                      borderRight: col < 6 ? `0.5px solid ${B}` : "none",
                      cursor:"pointer", display:"flex", flexDirection:"column", overflowY:"auto",
                      background: isT ? "rgba(158,154,229,0.04)" : "transparent",
                      boxShadow: isSel ? "inset 0 0 0 1.5px var(--accent)" : "none",
                      transition:"background .1s",
                    }}
                    onMouseEnter={e => { if (!isT) e.currentTarget.style.background="var(--bg-hover)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = isT ? "rgba(158,154,229,0.04)" : "transparent"; }}
                  >
                    <div style={{padding:"10px 7px", display:"flex", flexDirection:"column", gap:5}}>
                      {evts.length === 0 && (
                        <div style={{padding:"10px 0", textAlign:"center", fontSize:11, color:"var(--text-subtle)"}}>—</div>
                      )}
                      {evts.map(ev => {
                        const c = EVENT_COLORS[ev.type] || EVENT_COLORS.custom;
                        return (
                          <div key={ev.id} style={{
                            background:c.bg, borderRadius:7, padding:"7px 9px",
                          }}>
                            {ev.time && (
                              <div style={{fontSize:9, fontWeight:600, color:c.text, opacity:0.85, marginBottom:1, letterSpacing:"0.02em"}}>
                                {ev.time}
                              </div>
                            )}
                            <div style={{fontSize:11, fontWeight:500, letterSpacing:"-0.3px", color:c.text,
                              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{ev.title}</div>
                            {ev.sub && (
                              <div style={{fontSize:10, color:c.text, opacity:0.7, marginTop:1,
                                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{ev.sub}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Side panel ── */}
        <div className="agenda-side" style={{
          width:248, flexShrink:0, overflowY:"auto",
          borderLeft:`0.5px solid ${B}`, padding:"20px 16px",
        }}>

          {/* Selected day hero */}
          <div style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16}}>
            <div style={{minWidth:0}}>
              <div style={{fontSize:32, fontWeight:600, letterSpacing:"-1.5px", lineHeight:1, color:"var(--text)"}}>
                {selectedDate ? selectedDate.getDate() : "—"}
              </div>
              <div style={{fontSize:12, color:"var(--text-muted)", marginTop:4, letterSpacing:"-0.3px"}}>
                {selectedDate
                  ? selectedDate.toLocaleDateString("es-ES", {weekday:"long", month:"long"}).replace(/^\w/, c => c.toUpperCase())
                  : ""}
              </div>
            </div>
            <button className="btn ghost icon-only sm" onClick={() => { setForm(f=>({...f,date:selected})); setShowForm(true); }}>
              <Icon name="plus" size={13}/>
            </button>
          </div>

          {/* Selected day events */}
          {selectedEvents.length === 0 ? (
            <div style={{padding:"16px 0 22px", textAlign:"center", color:"var(--text-subtle)", fontSize:12}}>Sin eventos</div>
          ) : (
            <div style={{display:"flex", flexDirection:"column", gap:7, marginBottom:8}}>
              {selectedEvents.map(ev => {
                const c = EVENT_COLORS[ev.type] || EVENT_COLORS.custom;
                const isCustom = ev.id.startsWith("custom-");
                return (
                  <div key={ev.id} style={{
                    display:"flex", gap:9, padding:"9px 11px",
                    background:c.bg, borderRadius:9,
                  }}>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontSize:12, fontWeight:500, letterSpacing:"-0.4px", color:c.text}}>
                        {ev.title}
                      </div>
                      {(ev.time || ev.sub) && (
                        <div style={{fontSize:10, color:c.text, opacity:0.75, marginTop:2}}>
                          {ev.time ? `${ev.time}${ev.timeEnd?` – ${ev.timeEnd}`:""}${ev.sub?" · "+ev.sub:""}` : ev.sub}
                        </div>
                      )}
                    </div>
                    {isCustom && (
                      <button className="btn ghost icon-only sm" onClick={() => deleteCustom(ev.id)} style={{flexShrink:0, color:c.text, alignSelf:"flex-start"}}>
                        <Icon name="x" size={10}/>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Upcoming */}
          <div style={{marginTop:10, borderTop:`0.5px solid ${B}`, paddingTop:16}}>
            <div style={{fontSize:10, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", color:"var(--text-subtle)", marginBottom:12}}>
              Próximos 14 días
            </div>
            {upcoming.length === 0 ? (
              <div style={{padding:"12px 0", textAlign:"center", color:"var(--text-subtle)", fontSize:11}}>Sin eventos</div>
            ) : (
              <div style={{display:"flex", flexDirection:"column", gap:11}}>
                {upcoming.map(ev => {
                  const c = EVENT_COLORS[ev.type] || EVENT_COLORS.custom;
                  const d = new Date(ev.date + "T12:00:00");
                  const isToday2 = ev.date === today;
                  return (
                    <div key={ev.id}
                      onClick={() => { setSelected(ev.date); setYear(d.getFullYear()); setMonth(d.getMonth()); }}
                      style={{display:"flex", alignItems:"center", gap:11, cursor:"pointer"}}
                      onMouseEnter={e => e.currentTarget.style.opacity="0.6"}
                      onMouseLeave={e => e.currentTarget.style.opacity="1"}
                    >
                      <div style={{
                        width:38, height:38, borderRadius:10, flexShrink:0,
                        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                        background: isToday2 ? "var(--accent)" : "var(--bg-elev-2)",
                        border: isToday2 ? "none" : `0.5px solid ${B}`,
                      }}>
                        <div style={{fontSize:14, fontWeight:600, letterSpacing:"-0.5px", color: isToday2?"#fff":"var(--text)", lineHeight:1}}>
                          {d.getDate()}
                        </div>
                        <div style={{fontSize:8, textTransform:"uppercase", letterSpacing:"0.04em", marginTop:1, color: isToday2?"rgba(255,255,255,0.8)":"var(--text-subtle)"}}>
                          {DAYS_ES[(d.getDay()+6)%7]}
                        </div>
                      </div>
                      <div style={{flex:1, minWidth:0}}>
                        <div style={{fontSize:12, color:"var(--text)", letterSpacing:"-0.3px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
                          {ev.title}
                        </div>
                        {ev.sub && (
                          <div style={{fontSize:10, color:"var(--text-muted)", marginTop:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{ev.sub}</div>
                        )}
                      </div>
                      <span style={{width:5, height:5, borderRadius:"50%", background:c.dot, flexShrink:0}}/>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Add event modal ── */}
      {showForm && (
        <>
        <div
          style={{
            position:"fixed", inset:0,
            background:"rgba(0,0,0,0.7)",
            backdropFilter:"blur(12px)",
            zIndex:100,
            display:"flex", alignItems:"center", justifyContent:"center",
            padding:24,
            animation:"fade .15s ease-out",
          }}
          onClick={() => { setShowForm(false); setPickerFor(null); }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width:"100%", maxWidth:480,
              background:"#0f0f0f",
              border:"0.5px solid rgba(255,255,255,0.1)",
              borderRadius:28,
              overflow:"hidden",
              animation:"pop .2s cubic-bezier(.2,.8,.2,1)",
              display:"flex", flexDirection:"column",
            }}
          >
            {/* Top row: close + submit */}
            <div style={{
              display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"20px 20px 16px",
            }}>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  width:40, height:40, borderRadius:"50%",
                  background:"rgba(255,255,255,0.07)",
                  border:"0.5px solid rgba(255,255,255,0.1)",
                  cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                  color:"var(--text-muted)", transition:"background .1s",
                }}
                onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.12)"}
                onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.07)"}
              >
                <Icon name="x" size={16}/>
              </button>
              <button
                onClick={addEvent}
                disabled={!form.title.trim()}
                style={{
                  width:40, height:40, borderRadius:"50%",
                  background: form.title.trim() ? "var(--accent)" : "rgba(158,154,229,0.2)",
                  border:"none",
                  cursor: form.title.trim() ? "pointer" : "default",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  color:"#fff", transition:"all .1s",
                }}
                onMouseEnter={e => { if (form.title.trim()) e.currentTarget.style.filter="brightness(1.1)"; }}
                onMouseLeave={e => e.currentTarget.style.filter="none"}
              >
                <Icon name="arrow-up" size={16}/>
              </button>
            </div>

            {/* Title input */}
            <div style={{padding:"0 24px 4px"}}>
              <input
                autoFocus
                placeholder="Nombre del evento..."
                value={form.title}
                onChange={e => setForm(f=>({...f, title:e.target.value}))}
                onKeyDown={e => { if (e.key === "Enter" && form.title.trim()) addEvent(); }}
                style={{
                  width:"100%", background:"transparent", border:"none", outline:"none",
                  fontSize:26, fontWeight:400, letterSpacing:"-1.2px",
                  color: form.title ? "var(--text)" : "rgba(255,255,255,0.2)",
                  fontFamily:"var(--font-display)",
                  caretColor:"var(--accent)",
                }}
              />
            </div>

            {/* Description */}
            <div style={{padding:"0 24px 20px"}}>
              <input
                placeholder="Añadir descripción o ubicación..."
                value={form.notes}
                onChange={e => setForm(f=>({...f, notes:e.target.value}))}
                style={{
                  width:"100%", background:"transparent", border:"none", outline:"none",
                  fontSize:15, fontWeight:400, letterSpacing:"-0.96px",
                  color: form.notes ? "var(--text-muted)" : "rgba(255,255,255,0.15)",
                  fontFamily:"var(--font-sans)",
                  caretColor:"var(--accent)",
                }}
              />
            </div>

            {/* Divider */}
            <div style={{height:"0.5px", background:"rgba(255,255,255,0.07)", margin:"0 0"}}/>

            {/* Date + time display */}
            <div style={{
              display:"flex", alignItems:"center", justifyContent:"center",
              flexDirection:"column", padding:"32px 24px 24px", gap:12,
            }}>
              <div style={{
                fontSize:64, fontWeight:300, letterSpacing:"-3px",
                color: form.date ? "var(--text)" : "rgba(255,255,255,0.15)",
                lineHeight:1, fontFamily:"var(--font-display)",
              }}>
                {form.date
                  ? new Date(form.date + "T12:00:00").toLocaleDateString("es-ES", {day:"numeric", month:"short"})
                  : "—"}
              </div>
              {(form.time || form.timeEnd) && (
                <div style={{fontSize:20, color:"var(--text-muted)", letterSpacing:"-0.96px"}}>
                  {form.time || "?"}{form.timeEnd ? ` – ${form.timeEnd}` : ""}
                </div>
              )}
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(f=>({...f, date:e.target.value}))}
                style={{
                  background:"rgba(255,255,255,0.06)",
                  border:"0.5px solid rgba(255,255,255,0.1)",
                  borderRadius:99, color:"var(--text-muted)",
                  fontSize:13, padding:"6px 16px",
                  fontFamily:"var(--font-sans)", letterSpacing:"-0.5px",
                  cursor:"pointer",
                }}
              />
            </div>

            {/* Divider */}
            <div style={{height:"0.5px", background:"rgba(255,255,255,0.07)"}}/>

            {/* Bottom: tipo (izq) | separador | hora (der) */}
            <div style={{ display:"flex", alignItems:"center", gap:6, padding:"14px 20px 18px", justifyContent:"space-between" }}>
              {/* Tipo */}
              <div style={{ display:"flex", gap:6 }}>
                {[
                  { value:"custom",  label:"Evento",  icon:"calendar" },
                  { value:"meeting", label:"Reunión", icon:"users" },
                  { value:"task",    label:"Tarea",   icon:"list-todo" },
                ].map(t => (
                  <button
                    key={t.value}
                    onClick={() => setForm(f=>({...f, type:t.value}))}
                    style={{
                      display:"flex", alignItems:"center", gap:5,
                      padding:"6px 12px", borderRadius:99,
                      background: form.type === t.value ? "rgba(158,154,229,0.16)" : "rgba(255,255,255,0.06)",
                      border: form.type === t.value ? "0.5px solid rgba(158,154,229,0.35)" : "0.5px solid rgba(255,255,255,0.09)",
                      color: form.type === t.value ? "#c8c5f2" : "var(--text-subtle)",
                      fontSize:12, letterSpacing:"-0.5px", cursor:"pointer",
                      fontFamily:"var(--font-sans)", transition:"all .1s",
                    }}
                  >
                    <Icon name={t.icon} size={12} strokeWidth={1.6}/>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Separador */}
              <div style={{ width:"0.5px", height:20, background:"rgba(255,255,255,0.08)", flexShrink:0 }}/>

              {/* Hora inicio – fin */}
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <button
                  onClick={() => setPickerFor("start")}
                  style={{
                    display:"flex", alignItems:"center", gap:6,
                    padding:"6px 14px", borderRadius:99, cursor:"pointer",
                    background: form.time ? "rgba(96,165,250,0.10)" : "rgba(255,255,255,0.05)",
                    border: form.time ? "0.5px solid rgba(96,165,250,0.25)" : "0.5px solid rgba(255,255,255,0.09)",
                    color: form.time ? "#7db8f7" : "var(--text-subtle)",
                    fontSize:12, letterSpacing:"-0.5px",
                    fontFamily:"var(--font-sans)",
                  }}
                >
                  <Icon name="clock" size={12} strokeWidth={1.6}/>
                  {form.time || "Inicio"}
                </button>
                <span style={{ fontSize:11, color:"var(--text-subtle)" }}>–</span>
                <button
                  onClick={() => setPickerFor("end")}
                  style={{
                    padding:"6px 14px", borderRadius:99, cursor:"pointer",
                    background: form.timeEnd ? "rgba(96,165,250,0.10)" : "rgba(255,255,255,0.05)",
                    border: form.timeEnd ? "0.5px solid rgba(96,165,250,0.25)" : "0.5px solid rgba(255,255,255,0.09)",
                    color: form.timeEnd ? "#7db8f7" : "var(--text-subtle)",
                    fontSize:12, letterSpacing:"-0.5px",
                    fontFamily:"var(--font-sans)",
                  }}
                >
                  {form.timeEnd || "Fin"}
                </button>
              </div>
            </div>
            </div>
        </div>
        {pickerFor && (
          <TimePicker
            value={pickerFor === "start" ? form.time : form.timeEnd}
            onChange={v => setForm(f => pickerFor === "start" ? {...f, time:v} : {...f, timeEnd:v})}
            onClose={() => setPickerFor(null)}
          />
        )}
        </>
      )}
    </div>
  );
};

window.AgendaPage = AgendaPage;

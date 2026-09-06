// Agency Agenda — calendar view with tasks, project deadlines + custom events

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

const VIEW_KEY = "agenda_view";
const loadView = () => { try { return localStorage.getItem(VIEW_KEY) === "week" ? "week" : "month"; } catch{ return "month"; }};

const ymdOf = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

// Mini anillo de progreso para el resumen de tareas
const MiniRing = ({ pct, size = 13, stroke = 2 }) => {
  const r = (size - stroke) / 2, c = size / 2, circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{flexShrink:0, display:"block"}}>
      <circle cx={c} cy={c} r={r} fill="none" stroke="var(--border-strong)" strokeWidth={stroke}/>
      {pct > 0 && (
        <circle cx={c} cy={c} r={r} fill="none" stroke="var(--accent)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${(pct/100)*circ} ${circ}`} transform={`rotate(-90 ${c} ${c})`}/>
      )}
    </svg>
  );
};

// ── AgendaPage ────────────────────────────────────────────────────────────────
const AgendaPage = ({ navigate }) => {
  const D = window.Data;
  D.useStore();

  const today = todayYMD();
  const [year,  setYear]  = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth()); // 0-indexed
  const [selected, setSelected] = useState(today);
  const [viewMode, setViewMode] = useState(loadView); // "month" | "week"
  const [panelOpen, setPanelOpen] = useState(true);   // detalle del día (siempre visible)
  const customEvents = D.AGENDA_EVENTS || [];
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title:"", date: today, type:"custom", time:"", timeEnd:"", notes:"", link:"" });
  const [pickerFor, setPickerFor] = useState(null); // null | "start" | "end"
  const [calOpen, setCalOpen] = useState(false);

  // ── build event list from all sources ──────────────────────────────────────
  // NOTE: las tareas NO se listan como eventos sueltos (ensucia la agenda).
  // Se agregan por día en `taskStatsByDate` y enlazan con la página de Tareas.
  const allEvents = useMemo(() => {
    const evts = [];

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
  }, [D.PROJECTS, D.INVOICES, customEvents]);

  // Tareas agregadas por día → { ymd: { total, done, pct } }
  // Las vencidas sin completar también se arrastran a HOY (igual que en Tareas).
  const taskStatsByDate = useMemo(() => {
    const map = {};
    const add = (ymd, t) => {
      if (!map[ymd]) map[ymd] = { total:0, done:0, sum:0 };
      map[ymd].total++;
      if (t.column === "done") map[ymd].done++;
      map[ymd].sum += (t.column === "done" ? 100 : (t.progress || 0));
    };
    Object.values(D.TASKS).flat().forEach(t => {
      const ymd = toYMD(t.deadline);
      if (!ymd) return;
      add(ymd, t);
      if (ymd < today && t.column !== "done") add(today, t); // arrastre a hoy
    });
    Object.values(map).forEach(s => { s.pct = s.total ? Math.round(s.sum / s.total) : 0; });
    return map;
  }, [D.TASKS, today]);

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

  // Seleccionar un día abre el panel de detalle (drawer)
  const pickDay = (ymd, dateObj) => {
    setSelected(ymd);
    if (dateObj) { setYear(dateObj.getFullYear()); setMonth(dateObj.getMonth()); }
    setPanelOpen(true);
  };

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
    const date = form.date;
    D.addAgendaEvent({
      date,
      title: form.title.trim(),
      notes: form.notes || "",
      time: form.time || null,
      timeEnd: form.timeEnd || null,
      link: (form.link || "").trim() || null,
      type: form.type,
    });
    setShowForm(false);
    setPickerFor(null);
    setForm({ title:"", date: today, type:"custom", time:"", timeEnd:"", notes:"", link:"" });
    setSelected(date);
  };

  const deleteCustom = (id) => { D.deleteAgendaEvent(id); };

  const numWeeks = Math.ceil(cells.length / 7);
  const isCurrentPeriod = viewMode === "week"
    ? weekDays.some(d => ymdOf(d) === today)
    : (year === new Date().getFullYear() && month === new Date().getMonth());

  // Lista compacta de eventos de un día (punto + texto, sin bloques de color)
  const DayEventList = ({ events, max }) => {
    const shown = max ? events.slice(0, max) : events;
    return (
      <div style={{display:"flex", flexDirection:"column", gap:3}}>
        {shown.map(ev => (
          <div key={ev.id} style={{display:"flex", alignItems:"center", gap:6, minWidth:0}}>
            <span style={{width:5, height:5, borderRadius:"50%", background:"rgba(255,255,255,0.4)", flexShrink:0}}/>
            <span style={{
              fontSize:11, letterSpacing:"-0.2px", color:"var(--text)",
              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
            }}>{ev.title}</span>
          </div>
        ))}
        {max && events.length > max && (
          <span style={{fontSize:10, color:"var(--text-subtle)", paddingLeft:11}}>
            +{events.length - max} más
          </span>
        )}
      </div>
    );
  };

  // Chip compacto de resumen de tareas para una celda del calendario
  const TaskChip = ({ stats }) => (
    <div style={{
      display:"inline-flex", alignItems:"center", gap:5, maxWidth:"100%",
      padding:"2px 7px 2px 5px", borderRadius:99,
      background:"var(--bg-elev-2)", border:"0.5px solid var(--border)",
    }}>
      <MiniRing pct={stats.pct} size={12}/>
      <span style={{fontSize:10, fontWeight:500, color:"var(--text-muted)", letterSpacing:"-0.2px", whiteSpace:"nowrap"}}>
        {stats.done}/{stats.total} tareas
      </span>
    </div>
  );

  // Cajita de evento estilo calendario — color neutro (igual para todos los tipos)
  const EventCard = ({ ev, onDelete }) => (
    <div style={{
      position:"relative",
      background:"rgba(255,255,255,0.06)", borderRadius:8, padding:"7px 9px",
      borderLeft:"2px solid rgba(255,255,255,0.35)",
    }}>
      <div style={{
        fontSize:12, fontWeight:600, color:"var(--text)", letterSpacing:"-0.3px",
        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
        paddingRight: onDelete ? 16 : 0,
      }}>{ev.title}</div>
      {ev.time ? (
        <div style={{display:"flex", alignItems:"center", gap:4, fontSize:11, color:"var(--text-muted)", marginTop:2}}>
          <Icon name="clock" size={10} strokeWidth={2}/>
          <span>{ev.time}{ev.timeEnd ? ` – ${ev.timeEnd}` : ""}</span>
        </div>
      ) : ev.sub ? (
        <div style={{fontSize:11, color:"var(--text-muted)", marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
          {ev.sub}
        </div>
      ) : null}
      {ev.link && (
        <a href={ev.link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} title={ev.link}
          style={{
            display:"inline-flex", alignItems:"center", gap:5, marginTop:6, textDecoration:"none",
            fontSize:11, padding:"4px 10px", borderRadius:99,
            background:"var(--accent-soft)", color:"var(--accent)",
            border:"0.5px solid rgba(158,154,229,0.35)", fontWeight:500,
          }}>
          <Icon name="link" size={11}/> Unirse
        </a>
      )}
      {onDelete && (
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{
            position:"absolute", top:6, right:6, width:18, height:18,
            border:"none", background:"transparent", cursor:"pointer",
            color:"var(--text-subtle)", display:"flex", alignItems:"center", justifyContent:"center",
          }}
          onMouseEnter={e => e.currentTarget.style.color="var(--text)"}
          onMouseLeave={e => e.currentTarget.style.color="var(--text-subtle)"}
        >
          <Icon name="x" size={11}/>
        </button>
      )}
    </div>
  );

  return (
    <div className="pg-full" style={{display:"flex", flexDirection:"column", height:"100vh", overflow:"hidden"}}>

      {/* ── Toolbar ── */}
      <div className="agenda-toolbar" style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"18px 24px 14px", flexShrink:0,
      }}>
        <div style={{display:"flex", alignItems:"center", gap:16}}>
          <h1 className="agenda-title" style={{fontSize:24, fontWeight:400, letterSpacing:"-1px", margin:0, color:"var(--text)"}}>
            {navTitle}
          </h1>
          <div style={{display:"flex", alignItems:"center", gap:2}}>
            <button className="btn ghost icon-only sm" onClick={goPrev}><Icon name="chevron-left" size={15}/></button>
            <button className="btn ghost sm" onClick={goToday}
              style={{opacity: isCurrentPeriod ? 0.35 : 1, pointerEvents: isCurrentPeriod ? "none" : "auto"}}>
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
          <span className="agenda-add">
            <ActionPill
              plusActions={() => { setForm(f=>({...f, date:selected})); setShowForm(true); }}
              moreActions={[
                { icon: "calendar", label: "Ir a hoy", onClick: goToday },
                { icon: "link", label: "Conectar calendario", sub: "Suscríbete a la agenda desde tu calendario", onClick: () => setCalOpen(true) },
              ]}
            />
          </span>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{flex:1, display:"flex", minHeight:0, overflow:"hidden"}}>

        {/* ── Calendar ── */}
        <div style={{flex:1, display:"flex", flexDirection:"column", minWidth:0, padding:"0 10px 12px"}}>

          {/* MONTH: weekday header row */}
          {viewMode === "month" && (
            <div style={{display:"grid", gridTemplateColumns:"repeat(7,1fr)", columnGap:6, padding:"2px 4px 8px", flexShrink:0}}>
              {DAYS_ES.map(d => (
                <div key={d} style={{
                  textAlign:"center", fontSize:11, fontWeight:500,
                  letterSpacing:"0.04em", textTransform:"uppercase", color:"var(--text-subtle)",
                }}>{d}</div>
              ))}
            </div>
          )}

          {/* ── MONTH grid — rounded tiles, no inner lines ── */}
          {viewMode === "month" && (
            <div style={{
              flex:1, display:"grid",
              gridTemplateColumns:"repeat(7,1fr)",
              gridTemplateRows:`repeat(${numWeeks}, 1fr)`,
              gap:6,
            }}>
              {cells.map((cell, i) => {
                if (!cell) return <div key={i}/>;
                const isToday    = cell.ymd === today;
                const isSelected = cell.ymd === selected && panelOpen;
                const stats      = taskStatsByDate[cell.ymd];
                return (
                  <div key={i} onClick={() => pickDay(cell.ymd, new Date(cell.ymd + "T12:00:00"))} style={{
                    borderRadius:12, padding:"7px 9px", cursor:"pointer", overflow:"hidden",
                    background: isSelected ? "var(--accent-soft)" : "transparent",
                    transition:"background .12s",
                  }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background="var(--bg-hover)"; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background="transparent"; }}
                  >
                    <div style={{
                      width:25, height:25, borderRadius:"50%",
                      display:"inline-flex", alignItems:"center", justifyContent:"center",
                      background: isToday ? "var(--accent)" : "transparent",
                      color: isToday ? "#fff" : isSelected ? "var(--accent)" : "var(--text-muted)",
                      fontSize:13, fontWeight: isToday ? 600 : 400, letterSpacing:"-0.3px",
                      marginBottom:5,
                    }}>{cell.dayNum}</div>
                    <DayEventList events={cell.events} max={3}/>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── WEEK: day tiles fill height ── */}
          {viewMode === "week" && (
            <div style={{flex:1, display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:6, paddingTop:6, minHeight:0}}>
              {weekDays.map(dayDate => {
                const ymd  = ymdOf(dayDate);
                const isT  = ymd === today;
                const isSel = ymd === selected && panelOpen;
                const evts  = eventsByDate[ymd] || [];
                const stats = taskStatsByDate[ymd];
                const dayAbbr = DAYS_ES[(dayDate.getDay()+6)%7];
                return (
                  <div key={ymd}
                    onClick={() => pickDay(ymd, dayDate)}
                    style={{
                      display:"flex", flexDirection:"column", minHeight:0, cursor:"pointer",
                      borderRadius:14, overflow:"hidden",
                      background: isSel ? "var(--accent-soft)" : "var(--bg-elev-2)",
                      transition:"background .12s",
                    }}
                    onMouseEnter={e => { if (!isSel) e.currentTarget.style.background="var(--bg-hover)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = isSel ? "var(--accent-soft)" : "var(--bg-elev-2)"; }}
                  >
                    {/* Tile header — día + número en línea (estilo Tareas) */}
                    <div style={{display:"flex", alignItems:"center", gap:9, padding:"12px 11px 10px", flexShrink:0}}>
                      <span style={{fontSize:11, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase",
                        color: isT ? "var(--accent)" : "var(--text-subtle)"}}>{dayAbbr}</span>
                      <div style={{
                        width:26, height:26, borderRadius:"50%",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        background: isT ? "var(--accent)" : "transparent",
                        color: isT ? "#fff" : isSel ? "var(--accent)" : "var(--text)",
                        fontSize:16, fontWeight:600, letterSpacing:"-0.5px",
                      }}>{dayDate.getDate()}</div>
                    </div>
                    {/* Events — siempre muestra el resumen de tareas (0/0 incluido) */}
                    <div style={{flex:1, overflowY:"auto", padding:"0 11px 11px", display:"flex", flexDirection:"column", gap:6}}>
                      <div><TaskChip stats={stats || { total:0, done:0, pct:0 }}/></div>
                      {evts.map(ev => <EventCard key={ev.id} ev={ev}/>)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Detail drawer — siempre visible (ancho fijo, en .agenda-drawer) ── */}
        {panelOpen && (
          <div className="agenda-drawer" style={{
            width:280, flexShrink:0, overflowY:"auto",
            borderLeft:"0.5px solid var(--border)", background:"var(--bg)",
            padding:"20px 18px",
            animation:"slideRight .22s cubic-bezier(.2,.8,.2,1)",
          }}>

            {/* Hero: número del día */}
            <div style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:18}}>
              <div style={{minWidth:0}}>
                <div style={{fontSize:38, fontWeight:600, letterSpacing:"-2px", lineHeight:1, color:"var(--text)"}}>
                  {selectedDate ? selectedDate.getDate() : "—"}
                </div>
                <div style={{fontSize:13, color:"var(--text-muted)", marginTop:5, letterSpacing:"-0.3px"}}>
                  {selectedDate
                    ? selectedDate.toLocaleDateString("es-ES", {weekday:"long", month:"long"}).replace(/^\w/, c => c.toUpperCase())
                    : ""}
                </div>
              </div>
              <button className="btn ghost icon-only sm" data-tooltip="Añadir evento" onClick={() => { setForm(f=>({...f,date:selected})); setShowForm(true); }}>
                <Icon name="plus" size={13}/>
              </button>
            </div>

            {/* Resumen de tareas — enlaza con la página de Tareas */}
            {(() => {
              const stats = taskStatsByDate[selected];
              if (!stats) return null;
              return (
                <div
                  onClick={() => navigate("tasks", { date: selected })}
                  style={{
                    display:"flex", alignItems:"center", gap:12,
                    padding:"12px 14px", marginBottom:14, cursor:"pointer",
                    background:"var(--bg-elev-2)", border:"0.5px solid var(--border)", borderRadius:12,
                    transition:"background .12s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background="var(--bg-hover)"}
                  onMouseLeave={e => e.currentTarget.style.background="var(--bg-elev-2)"}
                >
                  <MiniRing pct={stats.pct} size={34} stroke={3}/>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:13, fontWeight:500, color:"var(--text)", letterSpacing:"-0.3px"}}>Tareas del día</div>
                    <div style={{fontSize:11, color:"var(--text-muted)", marginTop:2}}>
                      {stats.done}/{stats.total} completadas · {stats.pct}%
                    </div>
                  </div>
                  <Icon name="chevron-right" size={15} style={{color:"var(--text-subtle)", flexShrink:0}}/>
                </div>
              );
            })()}

            {/* Eventos del día */}
            {selectedEvents.length === 0 ? (
              !taskStatsByDate[selected] && (
                <div style={{padding:"24px 0 28px", textAlign:"center", color:"var(--text-subtle)", fontSize:13}}>
                  Sin eventos este día
                </div>
              )
            ) : (
              <div style={{display:"flex", flexDirection:"column", gap:8}}>
                {selectedEvents.map(ev => {
                  const isCustom = ev.id.startsWith("custom-");
                  return (
                    <EventCard key={ev.id} ev={ev} onDelete={isCustom ? () => deleteCustom(ev.id) : null}/>
                  );
                })}
              </div>
            )}

            {/* Próximos 14 días */}
            <div style={{marginTop:22, borderTop:"0.5px solid var(--border)", paddingTop:18}}>
              <div style={{fontSize:10, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", color:"var(--text-subtle)", marginBottom:14}}>
                Próximos 14 días
              </div>
              {upcoming.length === 0 ? (
                <div style={{padding:"12px 0", textAlign:"center", color:"var(--text-subtle)", fontSize:12}}>Sin eventos próximos</div>
              ) : (
                <div style={{display:"flex", flexDirection:"column", gap:12}}>
                  {upcoming.map(ev => {
                    const d = new Date(ev.date + "T12:00:00");
                    const isToday2 = ev.date === today;
                    return (
                      <div key={ev.id}
                        onClick={() => pickDay(ev.date, d)}
                        style={{display:"flex", alignItems:"center", gap:12, cursor:"pointer"}}
                        onMouseEnter={e => e.currentTarget.style.opacity="0.6"}
                        onMouseLeave={e => e.currentTarget.style.opacity="1"}
                      >
                        <div style={{
                          width:40, height:40, borderRadius:11, flexShrink:0,
                          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                          background: isToday2 ? "var(--accent)" : "var(--bg-elev-2)",
                        }}>
                          <div style={{fontSize:15, fontWeight:600, letterSpacing:"-0.5px", color: isToday2?"#fff":"var(--text)", lineHeight:1}}>
                            {d.getDate()}
                          </div>
                          <div style={{fontSize:8, textTransform:"uppercase", letterSpacing:"0.04em", marginTop:2, color: isToday2?"rgba(255,255,255,0.8)":"var(--text-subtle)"}}>
                            {DAYS_ES[(d.getDay()+6)%7]}
                          </div>
                        </div>
                        <div style={{flex:1, minWidth:0}}>
                          <div style={{fontSize:13, color:"var(--text)", letterSpacing:"-0.3px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
                            {ev.title}
                          </div>
                          {ev.sub && (
                            <div style={{fontSize:11, color:"var(--text-muted)", marginTop:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{ev.sub}</div>
                          )}
                        </div>
                        <span style={{width:5, height:5, borderRadius:"50%", background:"rgba(255,255,255,0.4)", flexShrink:0}}/>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
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
            <div style={{padding:"0 24px 14px"}}>
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

            {/* Enlace de la reunión */}
            <div style={{padding:"0 24px 20px", display:"flex", alignItems:"center", gap:10}}>
              <Icon name="link" size={15} strokeWidth={1.7} style={{color:"var(--text-subtle)", flexShrink:0}}/>
              <input
                type="url"
                placeholder="Enlace de la reunión (Meet, Zoom…)"
                value={form.link}
                onChange={e => setForm(f=>({...f, link:e.target.value}))}
                style={{
                  flex:1, background:"transparent", border:"none", outline:"none",
                  fontSize:13.5, fontWeight:400, letterSpacing:"-0.3px",
                  color: form.link ? "var(--text-muted)" : "rgba(255,255,255,0.15)",
                  fontFamily:"var(--font-sans)", caretColor:"var(--accent)",
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

      <CalendarConnect open={calOpen} onClose={() => setCalOpen(false)}/>
    </div>
  );
};

// ── Conectar con Apple Calendar (suscripción .ics) ──────────────────────────
const CalendarConnect = ({ open, onClose }) => {
  const [info, setInfo] = useState(null);
  const [err, setErr]   = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    setInfo(null); setErr(false); setCopied(false);
    window.Data.calendarSubscribeUrl()
      .then(r => { r ? setInfo(r) : setErr(true); })
      .catch(() => setErr(true));
  }, [open]);

  if (!open) return null;

  const copy = () => {
    if (!info) return;
    try { navigator.clipboard.writeText(info.httpUrl); } catch {}
    setCopied(true); setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(12px)",
      zIndex:120, display:"flex", alignItems:"center", justifyContent:"center", padding:24,
      animation:"fade .15s ease-out",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width:"100%", maxWidth:460, background:"#0f0f0f",
        border:"0.5px solid rgba(255,255,255,0.1)", borderRadius:24, overflow:"hidden",
        animation:"pop .2s cubic-bezier(.2,.8,.2,1)",
      }}>
        <div style={{padding:"22px 22px 6px", display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12}}>
          <div>
            <div style={{fontFamily:"var(--font-display)", fontSize:18, fontWeight:500, letterSpacing:"-0.5px"}}>Conectar con tu calendario</div>
            <div className="muted" style={{fontSize:13, marginTop:6, lineHeight:1.5, maxWidth:360}}>
              Suscríbete una vez y tus eventos, entregas de proyectos y facturas aparecerán en Apple Calendar (o Google Calendar) y se actualizarán solos.
            </div>
          </div>
          <button onClick={onClose} style={{
            width:34, height:34, borderRadius:"50%", flexShrink:0, cursor:"pointer",
            background:"rgba(255,255,255,0.07)", border:"0.5px solid rgba(255,255,255,0.1)",
            color:"var(--text-muted)", display:"flex", alignItems:"center", justifyContent:"center",
          }}><Icon name="x" size={15}/></button>
        </div>

        <div style={{padding:"14px 22px 22px"}}>
          {err && (
            <div style={{padding:"14px 16px", borderRadius:12, border:"0.5px solid var(--red-soft)", background:"var(--red-soft)", color:"var(--red)", fontSize:13, lineHeight:1.5}}>
              No se pudo generar el enlace. Asegúrate de haber ejecutado la SQL de agenda en Supabase e inténtalo de nuevo.
            </div>
          )}
          {!err && !info && (
            <div className="muted" style={{fontSize:13, padding:"10px 0"}}>Generando tu enlace…</div>
          )}
          {!err && info && (
            <>
              <a href={info.webcalUrl} className="btn primary" style={{width:"100%", justifyContent:"center", display:"inline-flex", alignItems:"center", gap:8, textDecoration:"none"}}>
                <Icon name="calendar" size={15}/> Añadir a Apple Calendar
              </a>
              <div className="muted xsmall" style={{textAlign:"center", margin:"10px 0 14px"}}>
                Se abrirá el Calendario de tu Mac/iPhone para confirmar la suscripción.
              </div>

              <div className="label" style={{marginBottom:6}}>O copia el enlace (Google Calendar, Outlook…)</div>
              <div style={{display:"flex", gap:8}}>
                <input readOnly value={info.httpUrl} onFocus={e => e.target.select()}
                  className="input" style={{flex:1, fontSize:12, fontFamily:"var(--font-mono)"}}/>
                <button className="btn ghost" onClick={copy} style={{flexShrink:0}}>
                  {copied ? "¡Copiado!" : "Copiar"}
                </button>
              </div>
              <div className="muted xsmall" style={{marginTop:14, lineHeight:1.6}}>
                <b>En Google Calendar:</b> Otros calendarios → «+» → Desde URL → pega el enlace.<br/>
                Es de solo lectura: lo que crees en la app aparece en tu calendario, pero no al revés.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

window.AgendaPage = AgendaPage;

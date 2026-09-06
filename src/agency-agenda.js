const DAYS_ES = ["Lun", "Mar", "Mi\xE9", "Jue", "Vie", "S\xE1b", "Dom"];
const MONTHS_ES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const toYMD = (d) => {
  if (!d) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const months = { ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5, jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11 };
  const m = d.toLowerCase().match(/(\d{1,2})\s+([a-záéíóú]{3})\s+(\d{4})/);
  if (m) return `${m[3]}-${String(months[m[2]] + 1 || 1).padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return null;
};
const todayYMD = () => {
  const n = /* @__PURE__ */ new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
};
const EVENT_COLORS = {
  task: { bg: "rgba(158,154,229,0.18)", text: "#c8c5f2", dot: "#9e9ae5" },
  project: { bg: "rgba(0,255,140,0.10)", text: "#00cc70", dot: "#00ff8c" },
  invoice: { bg: "rgba(238,229,134,0.12)", text: "#d4c940", dot: "#eee586" },
  custom: { bg: "rgba(96,165,250,0.14)", text: "#7db8f7", dot: "#60a5fa" },
  meeting: { bg: "rgba(220,91,93,0.14)", text: "#e07678", dot: "#dc5b5d" }
};
const VIEW_KEY = "agenda_view";
const loadView = () => {
  try {
    return localStorage.getItem(VIEW_KEY) === "week" ? "week" : "month";
  } catch {
    return "month";
  }
};
const ymdOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const MiniRing = ({ pct, size = 13, stroke = 2 }) => {
  const r = (size - stroke) / 2, c = size / 2, circ = 2 * Math.PI * r;
  return /* @__PURE__ */ React.createElement("svg", { width: size, height: size, style: { flexShrink: 0, display: "block" } }, /* @__PURE__ */ React.createElement("circle", { cx: c, cy: c, r, fill: "none", stroke: "var(--border-strong)", strokeWidth: stroke }), pct > 0 && /* @__PURE__ */ React.createElement(
    "circle",
    {
      cx: c,
      cy: c,
      r,
      fill: "none",
      stroke: "var(--accent)",
      strokeWidth: stroke,
      strokeLinecap: "round",
      strokeDasharray: `${pct / 100 * circ} ${circ}`,
      transform: `rotate(-90 ${c} ${c})`
    }
  ));
};
const AgendaPage = ({ navigate }) => {
  const D = window.Data;
  D.useStore();
  const today = todayYMD();
  const [year, setYear] = useState((/* @__PURE__ */ new Date()).getFullYear());
  const [month, setMonth] = useState((/* @__PURE__ */ new Date()).getMonth());
  const [selected, setSelected] = useState(today);
  const [viewMode, setViewMode] = useState(loadView);
  const [panelOpen, setPanelOpen] = useState(true);
  const customEvents = D.AGENDA_EVENTS || [];
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", date: today, type: "custom", time: "", timeEnd: "", notes: "", link: "" });
  const [pickerFor, setPickerFor] = useState(null);
  const [calOpen, setCalOpen] = useState(false);
  const allEvents = useMemo(() => {
    const evts = [];
    D.PROJECTS.forEach((p) => {
      const ymd = toYMD(p.deadline);
      if (!ymd || ymd === "\u2014") return;
      evts.push({
        id: "proj-" + p.id,
        date: ymd,
        title: "Entrega: " + p.name,
        sub: p.clientName || "",
        type: "project",
        source: p
      });
    });
    D.INVOICES.forEach((inv) => {
      const ymd = toYMD(inv.due);
      if (!ymd) return;
      evts.push({
        id: "inv-" + inv.id,
        date: ymd,
        title: "Factura \u2014 " + inv.client,
        sub: "\u20AC" + (inv.amount || 0),
        type: "invoice",
        source: inv
      });
    });
    customEvents.forEach((e) => evts.push(e));
    return evts;
  }, [D.PROJECTS, D.INVOICES, customEvents]);
  const taskStatsByDate = useMemo(() => {
    const map = {};
    const add = (ymd, t) => {
      if (!map[ymd]) map[ymd] = { total: 0, done: 0, sum: 0 };
      map[ymd].total++;
      if (t.column === "done") map[ymd].done++;
      map[ymd].sum += t.column === "done" ? 100 : t.progress || 0;
    };
    Object.values(D.TASKS).flat().forEach((t) => {
      const ymd = toYMD(t.deadline);
      if (!ymd) return;
      add(ymd, t);
      if (ymd < today && t.column !== "done") add(today, t);
    });
    Object.values(map).forEach((s) => {
      s.pct = s.total ? Math.round(s.sum / s.total) : 0;
    });
    return map;
  }, [D.TASKS, today]);
  const eventsByDate = useMemo(() => {
    const map = {};
    allEvents.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [allEvents]);
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7;
  const cells = Array.from({ length: totalCells }, (_, i) => {
    const dayNum = i - startOffset + 1;
    if (dayNum < 1 || dayNum > lastDay.getDate()) return null;
    const ymd = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    return { dayNum, ymd, events: eventsByDate[ymd] || [] };
  });
  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };
  const setView = (v) => {
    setViewMode(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {
    }
  };
  const weekDays = useMemo(() => {
    const base = /* @__PURE__ */ new Date(selected + "T12:00:00");
    const dow = (base.getDay() + 6) % 7;
    const mon = new Date(base);
    mon.setDate(base.getDate() - dow);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(mon);
      d.setDate(mon.getDate() + i);
      return d;
    });
  }, [selected]);
  const shiftWeek = (dir) => {
    const d = /* @__PURE__ */ new Date(selected + "T12:00:00");
    d.setDate(d.getDate() + dir * 7);
    setSelected(ymdOf(d));
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };
  const goPrev = () => viewMode === "week" ? shiftWeek(-1) : prevMonth();
  const goNext = () => viewMode === "week" ? shiftWeek(1) : nextMonth();
  const goToday = () => {
    const d = /* @__PURE__ */ new Date();
    setSelected(today);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };
  const pickDay = (ymd, dateObj) => {
    setSelected(ymd);
    if (dateObj) {
      setYear(dateObj.getFullYear());
      setMonth(dateObj.getMonth());
    }
    setPanelOpen(true);
  };
  const navTitle = viewMode === "week" ? (() => {
    const s = weekDays[0], e = weekDays[6];
    const sm = MONTHS_ES[s.getMonth()].slice(0, 3);
    const em = MONTHS_ES[e.getMonth()].slice(0, 3);
    return s.getMonth() === e.getMonth() ? `${s.getDate()} \u2013 ${e.getDate()} ${em} ${e.getFullYear()}` : `${s.getDate()} ${sm} \u2013 ${e.getDate()} ${em} ${e.getFullYear()}`;
  })() : `${MONTHS_ES[month]} ${year}`;
  const selectedEvents = eventsByDate[selected] || [];
  const selectedDate = selected ? /* @__PURE__ */ new Date(selected + "T12:00:00") : null;
  const upcoming = useMemo(() => {
    const todayDate = /* @__PURE__ */ new Date(today + "T00:00:00");
    return allEvents.filter((e) => {
      const d = /* @__PURE__ */ new Date(e.date + "T00:00:00");
      const diff = (d - todayDate) / 864e5;
      return diff >= 0 && diff <= 14;
    }).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 10);
  }, [allEvents, today]);
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
      type: form.type
    });
    setShowForm(false);
    setPickerFor(null);
    setForm({ title: "", date: today, type: "custom", time: "", timeEnd: "", notes: "", link: "" });
    setSelected(date);
  };
  const deleteCustom = (id) => {
    D.deleteAgendaEvent(id);
  };
  const numWeeks = Math.ceil(cells.length / 7);
  const isCurrentPeriod = viewMode === "week" ? weekDays.some((d) => ymdOf(d) === today) : year === (/* @__PURE__ */ new Date()).getFullYear() && month === (/* @__PURE__ */ new Date()).getMonth();
  const DayEventList = ({ events, max }) => {
    const shown = max ? events.slice(0, max) : events;
    return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 3 } }, shown.map((ev) => /* @__PURE__ */ React.createElement("div", { key: ev.id, style: { display: "flex", alignItems: "center", gap: 6, minWidth: 0 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.4)", flexShrink: 0 } }), /* @__PURE__ */ React.createElement("span", { style: {
      fontSize: 11,
      letterSpacing: "-0.2px",
      color: "var(--text)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    } }, ev.title))), max && events.length > max && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, color: "var(--text-subtle)", paddingLeft: 11 } }, "+", events.length - max, " m\xE1s"));
  };
  const TaskChip = ({ stats }) => /* @__PURE__ */ React.createElement("div", { style: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    maxWidth: "100%",
    padding: "2px 7px 2px 5px",
    borderRadius: 99,
    background: "var(--bg-elev-2)",
    border: "0.5px solid var(--border)"
  } }, /* @__PURE__ */ React.createElement(MiniRing, { pct: stats.pct, size: 12 }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, fontWeight: 500, color: "var(--text-muted)", letterSpacing: "-0.2px", whiteSpace: "nowrap" } }, stats.done, "/", stats.total, " tareas"));
  const EventCard = ({ ev, onDelete }) => /* @__PURE__ */ React.createElement("div", { style: {
    position: "relative",
    background: "rgba(255,255,255,0.06)",
    borderRadius: 8,
    padding: "7px 9px",
    borderLeft: "2px solid rgba(255,255,255,0.35)"
  } }, /* @__PURE__ */ React.createElement("div", { style: {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text)",
    letterSpacing: "-0.3px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    paddingRight: onDelete ? 16 : 0
  } }, ev.title), ev.time ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)", marginTop: 2 } }, /* @__PURE__ */ React.createElement(Icon, { name: "clock", size: 10, strokeWidth: 2 }), /* @__PURE__ */ React.createElement("span", null, ev.time, ev.timeEnd ? ` \u2013 ${ev.timeEnd}` : "")) : ev.sub ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-muted)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, ev.sub) : null, ev.link && /* @__PURE__ */ React.createElement(
    "a",
    {
      href: ev.link,
      target: "_blank",
      rel: "noopener noreferrer",
      onClick: (e) => e.stopPropagation(),
      title: ev.link,
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        marginTop: 6,
        textDecoration: "none",
        fontSize: 11,
        padding: "4px 10px",
        borderRadius: 99,
        background: "var(--accent-soft)",
        color: "var(--accent)",
        border: "0.5px solid rgba(158,154,229,0.35)",
        fontWeight: 500
      }
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "link", size: 11 }),
    " Unirse"
  ), onDelete && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: (e) => {
        e.stopPropagation();
        onDelete();
      },
      style: {
        position: "absolute",
        top: 6,
        right: 6,
        width: 18,
        height: 18,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        color: "var(--text-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      },
      onMouseEnter: (e) => e.currentTarget.style.color = "var(--text)",
      onMouseLeave: (e) => e.currentTarget.style.color = "var(--text-subtle)"
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 11 })
  ));
  return /* @__PURE__ */ React.createElement("div", { className: "pg-full", style: { display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { className: "agenda-toolbar", style: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 24px 14px",
    flexShrink: 0
  } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 16 } }, /* @__PURE__ */ React.createElement("h1", { className: "agenda-title", style: { fontSize: 24, fontWeight: 400, letterSpacing: "-1px", margin: 0, color: "var(--text)" } }, navTitle), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 2 } }, /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only sm", onClick: goPrev }, /* @__PURE__ */ React.createElement(Icon, { name: "chevron-left", size: 15 })), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn ghost sm",
      onClick: goToday,
      style: { opacity: isCurrentPeriod ? 0.35 : 1, pointerEvents: isCurrentPeriod ? "none" : "auto" }
    },
    "Hoy"
  ), /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only sm", onClick: goNext }, /* @__PURE__ */ React.createElement(Icon, { name: "chevron-right", size: 15 })))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { className: "seg" }, /* @__PURE__ */ React.createElement("button", { className: viewMode === "month" ? "active" : "", onClick: () => setView("month") }, "Mes"), /* @__PURE__ */ React.createElement("button", { className: viewMode === "week" ? "active" : "", onClick: () => setView("week") }, "Semana")), /* @__PURE__ */ React.createElement("span", { className: "agenda-add" }, /* @__PURE__ */ React.createElement(
    ActionPill,
    {
      plusActions: () => {
        setForm((f) => ({ ...f, date: selected }));
        setShowForm(true);
      },
      moreActions: [
        { icon: "calendar", label: "Ir a hoy", onClick: goToday },
        { icon: "link", label: "Conectar calendario", sub: "Suscr\xEDbete a la agenda desde tu calendario", onClick: () => setCalOpen(true) }
      ]
    }
  )))), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, display: "flex", minHeight: 0, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { className: "agenda-cal-col", style: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0, padding: "0 10px 12px" } }, viewMode === "month" && /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", columnGap: 6, padding: "2px 4px 8px", flexShrink: 0 } }, DAYS_ES.map((d) => /* @__PURE__ */ React.createElement("div", { key: d, style: {
    textAlign: "center",
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "var(--text-subtle)"
  } }, d))), viewMode === "month" && /* @__PURE__ */ React.createElement("div", { className: "agenda-month-grid", style: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "repeat(7,1fr)",
    gridTemplateRows: `repeat(${numWeeks}, 1fr)`,
    gap: 6
  } }, cells.map((cell, i) => {
    if (!cell) return /* @__PURE__ */ React.createElement("div", { key: i });
    const isToday = cell.ymd === today;
    const isSelected = cell.ymd === selected && panelOpen;
    const stats = taskStatsByDate[cell.ymd];
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: i,
        onClick: () => pickDay(cell.ymd, /* @__PURE__ */ new Date(cell.ymd + "T12:00:00")),
        style: {
          borderRadius: 12,
          padding: "7px 9px",
          cursor: "pointer",
          overflow: "hidden",
          background: isSelected ? "var(--accent-soft)" : "transparent",
          transition: "background .12s"
        },
        onMouseEnter: (e) => {
          if (!isSelected) e.currentTarget.style.background = "var(--bg-hover)";
        },
        onMouseLeave: (e) => {
          if (!isSelected) e.currentTarget.style.background = "transparent";
        }
      },
      /* @__PURE__ */ React.createElement("div", { style: {
        width: 25,
        height: 25,
        borderRadius: "50%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: isToday ? "var(--accent)" : "transparent",
        color: isToday ? "#fff" : isSelected ? "var(--accent)" : "var(--text-muted)",
        fontSize: 13,
        fontWeight: isToday ? 600 : 400,
        letterSpacing: "-0.3px",
        marginBottom: 5
      } }, cell.dayNum),
      /* @__PURE__ */ React.createElement(DayEventList, { events: cell.events, max: 3 })
    );
  })), viewMode === "week" && /* @__PURE__ */ React.createElement("div", { style: { flex: 1, display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6, paddingTop: 6, minHeight: 0 } }, weekDays.map((dayDate) => {
    const ymd = ymdOf(dayDate);
    const isT = ymd === today;
    const isSel = ymd === selected && panelOpen;
    const evts = eventsByDate[ymd] || [];
    const stats = taskStatsByDate[ymd];
    const dayAbbr = DAYS_ES[(dayDate.getDay() + 6) % 7];
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: ymd,
        onClick: () => pickDay(ymd, dayDate),
        style: {
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          cursor: "pointer",
          borderRadius: 14,
          overflow: "hidden",
          background: isSel ? "var(--accent-soft)" : "var(--bg-elev-2)",
          transition: "background .12s"
        },
        onMouseEnter: (e) => {
          if (!isSel) e.currentTarget.style.background = "var(--bg-hover)";
        },
        onMouseLeave: (e) => {
          e.currentTarget.style.background = isSel ? "var(--accent-soft)" : "var(--bg-elev-2)";
        }
      },
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 9, padding: "12px 11px 10px", flexShrink: 0 } }, /* @__PURE__ */ React.createElement("span", { style: {
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: isT ? "var(--accent)" : "var(--text-subtle)"
      } }, dayAbbr), /* @__PURE__ */ React.createElement("div", { style: {
        width: 26,
        height: 26,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: isT ? "var(--accent)" : "transparent",
        color: isT ? "#fff" : isSel ? "var(--accent)" : "var(--text)",
        fontSize: 16,
        fontWeight: 600,
        letterSpacing: "-0.5px"
      } }, dayDate.getDate())),
      /* @__PURE__ */ React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: "0 11px 11px", display: "flex", flexDirection: "column", gap: 6 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(TaskChip, { stats: stats || { total: 0, done: 0, pct: 0 } })), evts.map((ev) => /* @__PURE__ */ React.createElement(EventCard, { key: ev.id, ev })))
    );
  })), /* @__PURE__ */ React.createElement("div", { className: "agenda-mobile-day" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", margin: "4px 4px 10px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontWeight: 600, letterSpacing: "-0.3px", color: "var(--text)" } }, selectedDate ? selectedDate.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }).replace(/^\w/, (c) => c.toUpperCase()) : "Selecciona un d\xEDa"), /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only sm", onClick: () => {
    setForm((f) => ({ ...f, date: selected }));
    setShowForm(true);
  } }, /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 14 }))), taskStatsByDate[selected] && /* @__PURE__ */ React.createElement(
    "div",
    {
      onClick: () => navigate("tasks", { date: selected }),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "11px 13px",
        marginBottom: 10,
        background: "var(--bg-elev-2)",
        border: "0.5px solid var(--border)",
        borderRadius: 12
      }
    },
    /* @__PURE__ */ React.createElement(MiniRing, { pct: taskStatsByDate[selected].pct, size: 30, stroke: 3 }),
    /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 500 } }, "Tareas del d\xEDa"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-muted)", marginTop: 2 } }, taskStatsByDate[selected].done, "/", taskStatsByDate[selected].total, " \xB7 ", taskStatsByDate[selected].pct, "%")),
    /* @__PURE__ */ React.createElement(Icon, { name: "chevron-right", size: 15, style: { color: "var(--text-subtle)" } })
  ), selectedEvents.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { padding: "16px 0 8px", textAlign: "center", color: "var(--text-subtle)", fontSize: 13 } }, "Sin eventos este d\xEDa") : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, selectedEvents.map((ev) => {
    const isCustom = ev.id.startsWith("custom-");
    return /* @__PURE__ */ React.createElement(EventCard, { key: ev.id, ev, onDelete: isCustom ? () => deleteCustom(ev.id) : null });
  })))), panelOpen && /* @__PURE__ */ React.createElement("div", { className: "agenda-drawer", style: {
    width: 280,
    flexShrink: 0,
    overflowY: "auto",
    borderLeft: "0.5px solid var(--border)",
    background: "var(--bg)",
    padding: "20px 18px",
    animation: "slideRight .22s cubic-bezier(.2,.8,.2,1)"
  } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 } }, /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 38, fontWeight: 600, letterSpacing: "-2px", lineHeight: 1, color: "var(--text)" } }, selectedDate ? selectedDate.getDate() : "\u2014"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "var(--text-muted)", marginTop: 5, letterSpacing: "-0.3px" } }, selectedDate ? selectedDate.toLocaleDateString("es-ES", { weekday: "long", month: "long" }).replace(/^\w/, (c) => c.toUpperCase()) : "")), /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only sm", "data-tooltip": "A\xF1adir evento", onClick: () => {
    setForm((f) => ({ ...f, date: selected }));
    setShowForm(true);
  } }, /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 13 }))), (() => {
    const stats = taskStatsByDate[selected];
    if (!stats) return null;
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        onClick: () => navigate("tasks", { date: selected }),
        style: {
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 14px",
          marginBottom: 14,
          cursor: "pointer",
          background: "var(--bg-elev-2)",
          border: "0.5px solid var(--border)",
          borderRadius: 12,
          transition: "background .12s"
        },
        onMouseEnter: (e) => e.currentTarget.style.background = "var(--bg-hover)",
        onMouseLeave: (e) => e.currentTarget.style.background = "var(--bg-elev-2)"
      },
      /* @__PURE__ */ React.createElement(MiniRing, { pct: stats.pct, size: 34, stroke: 3 }),
      /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 500, color: "var(--text)", letterSpacing: "-0.3px" } }, "Tareas del d\xEDa"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-muted)", marginTop: 2 } }, stats.done, "/", stats.total, " completadas \xB7 ", stats.pct, "%")),
      /* @__PURE__ */ React.createElement(Icon, { name: "chevron-right", size: 15, style: { color: "var(--text-subtle)", flexShrink: 0 } })
    );
  })(), selectedEvents.length === 0 ? !taskStatsByDate[selected] && /* @__PURE__ */ React.createElement("div", { style: { padding: "24px 0 28px", textAlign: "center", color: "var(--text-subtle)", fontSize: 13 } }, "Sin eventos este d\xEDa") : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, selectedEvents.map((ev) => {
    const isCustom = ev.id.startsWith("custom-");
    return /* @__PURE__ */ React.createElement(EventCard, { key: ev.id, ev, onDelete: isCustom ? () => deleteCustom(ev.id) : null });
  })), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 22, borderTop: "0.5px solid var(--border)", paddingTop: 18 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-subtle)", marginBottom: 14 } }, "Pr\xF3ximos 14 d\xEDas"), upcoming.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { padding: "12px 0", textAlign: "center", color: "var(--text-subtle)", fontSize: 12 } }, "Sin eventos pr\xF3ximos") : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } }, upcoming.map((ev) => {
    const d = /* @__PURE__ */ new Date(ev.date + "T12:00:00");
    const isToday2 = ev.date === today;
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: ev.id,
        onClick: () => pickDay(ev.date, d),
        style: { display: "flex", alignItems: "center", gap: 12, cursor: "pointer" },
        onMouseEnter: (e) => e.currentTarget.style.opacity = "0.6",
        onMouseLeave: (e) => e.currentTarget.style.opacity = "1"
      },
      /* @__PURE__ */ React.createElement("div", { style: {
        width: 40,
        height: 40,
        borderRadius: 11,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: isToday2 ? "var(--accent)" : "var(--bg-elev-2)"
      } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 600, letterSpacing: "-0.5px", color: isToday2 ? "#fff" : "var(--text)", lineHeight: 1 } }, d.getDate()), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 8, textTransform: "uppercase", letterSpacing: "0.04em", marginTop: 2, color: isToday2 ? "rgba(255,255,255,0.8)" : "var(--text-subtle)" } }, DAYS_ES[(d.getDay() + 6) % 7])),
      /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "var(--text)", letterSpacing: "-0.3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, ev.title), ev.sub && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-muted)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, ev.sub)),
      /* @__PURE__ */ React.createElement("span", { style: { width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.4)", flexShrink: 0 } })
    );
  }))))), showForm && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
    "div",
    {
      style: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(12px)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        animation: "fade .15s ease-out"
      },
      onClick: () => {
        setShowForm(false);
        setPickerFor(null);
      }
    },
    /* @__PURE__ */ React.createElement(
      "div",
      {
        onClick: (e) => e.stopPropagation(),
        style: {
          width: "100%",
          maxWidth: 480,
          background: "#0f0f0f",
          border: "0.5px solid rgba(255,255,255,0.1)",
          borderRadius: 28,
          overflow: "hidden",
          animation: "pop .2s cubic-bezier(.2,.8,.2,1)",
          display: "flex",
          flexDirection: "column"
        }
      },
      /* @__PURE__ */ React.createElement("div", { style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 20px 16px"
      } }, /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => setShowForm(false),
          style: {
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.07)",
            border: "0.5px solid rgba(255,255,255,0.1)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-muted)",
            transition: "background .1s"
          },
          onMouseEnter: (e) => e.currentTarget.style.background = "rgba(255,255,255,0.12)",
          onMouseLeave: (e) => e.currentTarget.style.background = "rgba(255,255,255,0.07)"
        },
        /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 16 })
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: addEvent,
          disabled: !form.title.trim(),
          style: {
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: form.title.trim() ? "var(--accent)" : "rgba(158,154,229,0.2)",
            border: "none",
            cursor: form.title.trim() ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            transition: "all .1s"
          },
          onMouseEnter: (e) => {
            if (form.title.trim()) e.currentTarget.style.filter = "brightness(1.1)";
          },
          onMouseLeave: (e) => e.currentTarget.style.filter = "none"
        },
        /* @__PURE__ */ React.createElement(Icon, { name: "arrow-up", size: 16 })
      )),
      /* @__PURE__ */ React.createElement("div", { style: { padding: "0 24px 4px" } }, /* @__PURE__ */ React.createElement(
        "input",
        {
          autoFocus: true,
          placeholder: "Nombre del evento...",
          value: form.title,
          onChange: (e) => setForm((f) => ({ ...f, title: e.target.value })),
          onKeyDown: (e) => {
            if (e.key === "Enter" && form.title.trim()) addEvent();
          },
          style: {
            width: "100%",
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: 26,
            fontWeight: 400,
            letterSpacing: "-1.2px",
            color: form.title ? "var(--text)" : "rgba(255,255,255,0.2)",
            fontFamily: "var(--font-display)",
            caretColor: "var(--accent)"
          }
        }
      )),
      /* @__PURE__ */ React.createElement("div", { style: { padding: "0 24px 14px" } }, /* @__PURE__ */ React.createElement(
        "input",
        {
          placeholder: "A\xF1adir descripci\xF3n o ubicaci\xF3n...",
          value: form.notes,
          onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })),
          style: {
            width: "100%",
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: 15,
            fontWeight: 400,
            letterSpacing: "-0.96px",
            color: form.notes ? "var(--text-muted)" : "rgba(255,255,255,0.15)",
            fontFamily: "var(--font-sans)",
            caretColor: "var(--accent)"
          }
        }
      )),
      /* @__PURE__ */ React.createElement("div", { style: { padding: "0 24px 20px", display: "flex", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement(Icon, { name: "link", size: 15, strokeWidth: 1.7, style: { color: "var(--text-subtle)", flexShrink: 0 } }), /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "url",
          placeholder: "Enlace de la reuni\xF3n (Meet, Zoom\u2026)",
          value: form.link,
          onChange: (e) => setForm((f) => ({ ...f, link: e.target.value })),
          style: {
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: 13.5,
            fontWeight: 400,
            letterSpacing: "-0.3px",
            color: form.link ? "var(--text-muted)" : "rgba(255,255,255,0.15)",
            fontFamily: "var(--font-sans)",
            caretColor: "var(--accent)"
          }
        }
      )),
      /* @__PURE__ */ React.createElement("div", { style: { height: "0.5px", background: "rgba(255,255,255,0.07)", margin: "0 0" } }),
      /* @__PURE__ */ React.createElement("div", { style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "32px 24px 24px",
        gap: 12
      } }, /* @__PURE__ */ React.createElement("div", { style: {
        fontSize: 64,
        fontWeight: 300,
        letterSpacing: "-3px",
        color: form.date ? "var(--text)" : "rgba(255,255,255,0.15)",
        lineHeight: 1,
        fontFamily: "var(--font-display)"
      } }, form.date ? (/* @__PURE__ */ new Date(form.date + "T12:00:00")).toLocaleDateString("es-ES", { day: "numeric", month: "short" }) : "\u2014"), (form.time || form.timeEnd) && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, color: "var(--text-muted)", letterSpacing: "-0.96px" } }, form.time || "?", form.timeEnd ? ` \u2013 ${form.timeEnd}` : ""), /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "date",
          value: form.date,
          onChange: (e) => setForm((f) => ({ ...f, date: e.target.value })),
          style: {
            background: "rgba(255,255,255,0.06)",
            border: "0.5px solid rgba(255,255,255,0.1)",
            borderRadius: 99,
            color: "var(--text-muted)",
            fontSize: 13,
            padding: "6px 16px",
            fontFamily: "var(--font-sans)",
            letterSpacing: "-0.5px",
            cursor: "pointer"
          }
        }
      )),
      /* @__PURE__ */ React.createElement("div", { style: { height: "0.5px", background: "rgba(255,255,255,0.07)" } }),
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, padding: "14px 20px 18px", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, [
        { value: "custom", label: "Evento", icon: "calendar" },
        { value: "meeting", label: "Reuni\xF3n", icon: "users" },
        { value: "task", label: "Tarea", icon: "list-todo" }
      ].map((t) => /* @__PURE__ */ React.createElement(
        "button",
        {
          key: t.value,
          onClick: () => setForm((f) => ({ ...f, type: t.value })),
          style: {
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "6px 12px",
            borderRadius: 99,
            background: form.type === t.value ? "rgba(158,154,229,0.16)" : "rgba(255,255,255,0.06)",
            border: form.type === t.value ? "0.5px solid rgba(158,154,229,0.35)" : "0.5px solid rgba(255,255,255,0.09)",
            color: form.type === t.value ? "#c8c5f2" : "var(--text-subtle)",
            fontSize: 12,
            letterSpacing: "-0.5px",
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
            transition: "all .1s"
          }
        },
        /* @__PURE__ */ React.createElement(Icon, { name: t.icon, size: 12, strokeWidth: 1.6 }),
        t.label
      ))), /* @__PURE__ */ React.createElement("div", { style: { width: "0.5px", height: 20, background: "rgba(255,255,255,0.08)", flexShrink: 0 } }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => setPickerFor("start"),
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            borderRadius: 99,
            cursor: "pointer",
            background: form.time ? "rgba(96,165,250,0.10)" : "rgba(255,255,255,0.05)",
            border: form.time ? "0.5px solid rgba(96,165,250,0.25)" : "0.5px solid rgba(255,255,255,0.09)",
            color: form.time ? "#7db8f7" : "var(--text-subtle)",
            fontSize: 12,
            letterSpacing: "-0.5px",
            fontFamily: "var(--font-sans)"
          }
        },
        /* @__PURE__ */ React.createElement(Icon, { name: "clock", size: 12, strokeWidth: 1.6 }),
        form.time || "Inicio"
      ), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: "var(--text-subtle)" } }, "\u2013"), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => setPickerFor("end"),
          style: {
            padding: "6px 14px",
            borderRadius: 99,
            cursor: "pointer",
            background: form.timeEnd ? "rgba(96,165,250,0.10)" : "rgba(255,255,255,0.05)",
            border: form.timeEnd ? "0.5px solid rgba(96,165,250,0.25)" : "0.5px solid rgba(255,255,255,0.09)",
            color: form.timeEnd ? "#7db8f7" : "var(--text-subtle)",
            fontSize: 12,
            letterSpacing: "-0.5px",
            fontFamily: "var(--font-sans)"
          }
        },
        form.timeEnd || "Fin"
      )))
    )
  ), pickerFor && /* @__PURE__ */ React.createElement(
    TimePicker,
    {
      value: pickerFor === "start" ? form.time : form.timeEnd,
      onChange: (v) => setForm((f) => pickerFor === "start" ? { ...f, time: v } : { ...f, timeEnd: v }),
      onClose: () => setPickerFor(null)
    }
  )), /* @__PURE__ */ React.createElement(CalendarConnect, { open: calOpen, onClose: () => setCalOpen(false) }));
};
const CalendarConnect = ({ open, onClose }) => {
  const [info, setInfo] = useState(null);
  const [err, setErr] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!open) return;
    setInfo(null);
    setErr(false);
    setCopied(false);
    window.Data.calendarSubscribeUrl().then((r) => {
      r ? setInfo(r) : setErr(true);
    }).catch(() => setErr(true));
  }, [open]);
  if (!open) return null;
  const copy = () => {
    if (!info) return;
    try {
      navigator.clipboard.writeText(info.httpUrl);
    } catch {
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return /* @__PURE__ */ React.createElement("div", { onClick: onClose, style: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    backdropFilter: "blur(12px)",
    zIndex: 120,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    animation: "fade .15s ease-out"
  } }, /* @__PURE__ */ React.createElement("div", { onClick: (e) => e.stopPropagation(), style: {
    width: "100%",
    maxWidth: 460,
    background: "#0f0f0f",
    border: "0.5px solid rgba(255,255,255,0.1)",
    borderRadius: 24,
    overflow: "hidden",
    animation: "pop .2s cubic-bezier(.2,.8,.2,1)"
  } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "22px 22px 6px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 500, letterSpacing: "-0.5px" } }, "Conectar con tu calendario"), /* @__PURE__ */ React.createElement("div", { className: "muted", style: { fontSize: 13, marginTop: 6, lineHeight: 1.5, maxWidth: 360 } }, "Suscr\xEDbete una vez y tus eventos, entregas de proyectos y facturas aparecer\xE1n en Apple Calendar (o Google Calendar) y se actualizar\xE1n solos.")), /* @__PURE__ */ React.createElement("button", { onClick: onClose, style: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    flexShrink: 0,
    cursor: "pointer",
    background: "rgba(255,255,255,0.07)",
    border: "0.5px solid rgba(255,255,255,0.1)",
    color: "var(--text-muted)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  } }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 15 }))), /* @__PURE__ */ React.createElement("div", { style: { padding: "14px 22px 22px" } }, err && /* @__PURE__ */ React.createElement("div", { style: { padding: "14px 16px", borderRadius: 12, border: "0.5px solid var(--red-soft)", background: "var(--red-soft)", color: "var(--red)", fontSize: 13, lineHeight: 1.5 } }, "No se pudo generar el enlace. Aseg\xFArate de haber ejecutado la SQL de agenda en Supabase e int\xE9ntalo de nuevo."), !err && !info && /* @__PURE__ */ React.createElement("div", { className: "muted", style: { fontSize: 13, padding: "10px 0" } }, "Generando tu enlace\u2026"), !err && info && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("a", { href: info.webcalUrl, className: "btn primary", style: { width: "100%", justifyContent: "center", display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" } }, /* @__PURE__ */ React.createElement(Icon, { name: "calendar", size: 15 }), " A\xF1adir a Apple Calendar"), /* @__PURE__ */ React.createElement("div", { className: "muted xsmall", style: { textAlign: "center", margin: "10px 0 14px" } }, "Se abrir\xE1 el Calendario de tu Mac/iPhone para confirmar la suscripci\xF3n."), /* @__PURE__ */ React.createElement("div", { className: "label", style: { marginBottom: 6 } }, "O copia el enlace (Google Calendar, Outlook\u2026)"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement(
    "input",
    {
      readOnly: true,
      value: info.httpUrl,
      onFocus: (e) => e.target.select(),
      className: "input",
      style: { flex: 1, fontSize: 12, fontFamily: "var(--font-mono)" }
    }
  ), /* @__PURE__ */ React.createElement("button", { className: "btn ghost", onClick: copy, style: { flexShrink: 0 } }, copied ? "\xA1Copiado!" : "Copiar")), /* @__PURE__ */ React.createElement("div", { className: "muted xsmall", style: { marginTop: 14, lineHeight: 1.6 } }, /* @__PURE__ */ React.createElement("b", null, "En Google Calendar:"), " Otros calendarios \u2192 \xAB+\xBB \u2192 Desde URL \u2192 pega el enlace.", /* @__PURE__ */ React.createElement("br", null), "Es de solo lectura: lo que crees en la app aparece en tu calendario, pero no al rev\xE9s.")))));
};
window.AgendaPage = AgendaPage;

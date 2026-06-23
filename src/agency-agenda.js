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
const CUSTOM_KEY = "agenda_custom_events";
const loadCustom = () => {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]");
  } catch (e) {
    return [];
  }
};
const saveCustom = (evts) => localStorage.setItem(CUSTOM_KEY, JSON.stringify(evts));
const VIEW_KEY = "agenda_view";
const loadView = () => {
  try {
    return localStorage.getItem(VIEW_KEY) === "week" ? "week" : "month";
  } catch (e) {
    return "month";
  }
};
const ymdOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const AgendaPage = ({ navigate }) => {
  const D = window.Data;
  D.useStore();
  const today = todayYMD();
  const [year, setYear] = useState((/* @__PURE__ */ new Date()).getFullYear());
  const [month, setMonth] = useState((/* @__PURE__ */ new Date()).getMonth());
  const [selected, setSelected] = useState(today);
  const [viewMode, setViewMode] = useState(loadView);
  const [customEvents, setCustomEvents] = useState(loadCustom);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", date: today, type: "custom", time: "", timeEnd: "", notes: "" });
  const [pickerFor, setPickerFor] = useState(null);
  const allEvents = useMemo(() => {
    const evts = [];
    Object.entries(D.TASKS).forEach(([pid, tasks]) => {
      tasks.forEach((t) => {
        const ymd = toYMD(t.deadline);
        if (!ymd) return;
        const proj = D.PROJECTS.find((p) => p.id === pid);
        evts.push({
          id: "task-" + t.id,
          date: ymd,
          title: t.title,
          sub: proj ? proj.name : t.clientName || "",
          type: "task",
          source: t
        });
      });
    });
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
  }, [D.TASKS, D.PROJECTS, D.INVOICES, customEvents]);
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
    } catch (e) {
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
    const evt = {
      id: "custom-" + Date.now(),
      date: form.date,
      title: form.title.trim(),
      sub: form.notes || "",
      time: form.time || null,
      timeEnd: form.timeEnd || null,
      type: form.type
    };
    const updated = [...customEvents, evt];
    setCustomEvents(updated);
    saveCustom(updated);
    setShowForm(false);
    setPickerFor(null);
    setForm({ title: "", date: today, type: "custom", time: "", timeEnd: "", notes: "" });
    setSelected(evt.date);
  };
  const deleteCustom = (id) => {
    const updated = customEvents.filter((e) => e.id !== id);
    setCustomEvents(updated);
    saveCustom(updated);
  };
  const typeLabel = { task: "Tarea", project: "Proyecto", invoice: "Factura", custom: "Evento", meeting: "Reuni\xF3n" };
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 28px",
    height: 56,
    borderBottom: "0.5px solid var(--border)",
    flexShrink: 0
  } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 14 } }, /* @__PURE__ */ React.createElement("h1", { style: { fontSize: 20, fontWeight: 400, letterSpacing: "-0.96px", margin: 0 } }, "Agenda"), /* @__PURE__ */ React.createElement("div", { className: "seg" }, /* @__PURE__ */ React.createElement("button", { className: viewMode === "month" ? "active" : "", onClick: () => setView("month") }, /* @__PURE__ */ React.createElement(Icon, { name: "grid", size: 12, strokeWidth: 1.6 }), " Mes"), /* @__PURE__ */ React.createElement("button", { className: viewMode === "week" ? "active" : "", onClick: () => setView("week") }, /* @__PURE__ */ React.createElement(Icon, { name: "calendar", size: 12, strokeWidth: 1.6 }), " Semana"))), /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: () => {
    setForm((f) => ({ ...f, date: selected }));
    setShowForm(true);
  } }, /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 14 }), " Nuevo evento")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flex: 1, minHeight: 0, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0, borderRight: "0.5px solid var(--border)" } }, /* @__PURE__ */ React.createElement("div", { style: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 20px",
    borderBottom: "0.5px solid var(--border)",
    flexShrink: 0
  } }, /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only", onClick: goPrev }, /* @__PURE__ */ React.createElement(Icon, { name: "chevron-left", size: 16 })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: 400, letterSpacing: "-0.96px" } }, navTitle), /* @__PURE__ */ React.createElement("button", { className: "btn ghost icon-only", onClick: goNext }, /* @__PURE__ */ React.createElement(Icon, { name: "chevron-right", size: 16 }))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", borderBottom: "0.5px solid var(--border)", flexShrink: 0 } }, DAYS_ES.map((d) => /* @__PURE__ */ React.createElement("div", { key: d, style: {
    textAlign: "center",
    padding: "8px 4px",
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "var(--text-subtle)"
  } }, d))), viewMode === "month" && /* @__PURE__ */ React.createElement("div", { style: { flex: 1, overflowY: "auto", display: "grid", gridTemplateColumns: "repeat(7,1fr)", alignContent: "start" } }, cells.map((cell, i) => {
    if (!cell) return /* @__PURE__ */ React.createElement("div", { key: i, style: {
      minHeight: 88,
      padding: "8px 6px",
      borderRight: (i + 1) % 7 === 0 ? "none" : "0.5px solid var(--border)",
      borderBottom: i < cells.length - 7 ? "0.5px solid var(--border)" : "none",
      background: "rgba(0,0,0,0.15)"
    } });
    const isToday = cell.ymd === today;
    const isSelected = cell.ymd === selected;
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: i,
        onClick: () => setSelected(cell.ymd),
        style: {
          minHeight: 88,
          padding: "8px 6px",
          borderRight: (i + 1) % 7 === 0 ? "none" : "0.5px solid var(--border)",
          borderBottom: i < cells.length - 7 ? "0.5px solid var(--border)" : "none",
          cursor: "pointer",
          background: isSelected ? "rgba(158,154,229,0.10)" : "transparent",
          transition: "background .1s"
        },
        onMouseEnter: (e) => {
          if (!isSelected) e.currentTarget.style.background = "rgba(255,255,255,0.03)";
        },
        onMouseLeave: (e) => {
          if (!isSelected) e.currentTarget.style.background = "transparent";
        }
      },
      /* @__PURE__ */ React.createElement("div", { style: {
        width: 26,
        height: 26,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 4,
        background: isToday ? "var(--accent)" : "transparent",
        color: isToday ? "#fff" : isSelected ? "#c8c5f2" : "var(--text-muted)",
        fontSize: 13,
        fontWeight: isToday ? 600 : 400,
        letterSpacing: "-0.5px"
      } }, cell.dayNum),
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 2 } }, cell.events.slice(0, 3).map((ev) => {
        const c = EVENT_COLORS[ev.type] || EVENT_COLORS.custom;
        return /* @__PURE__ */ React.createElement("div", { key: ev.id, style: {
          background: c.bg,
          color: c.text,
          fontSize: 10,
          padding: "2px 5px",
          borderRadius: 5,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          letterSpacing: "-0.3px"
        } }, ev.title);
      }), cell.events.length > 3 && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "var(--text-subtle)", paddingLeft: 2 } }, "+", cell.events.length - 3, " m\xE1s"))
    );
  })), viewMode === "week" && /* @__PURE__ */ React.createElement("div", { style: { flex: 1, overflowY: "auto", display: "grid", gridTemplateColumns: "repeat(7,1fr)" } }, weekDays.map((dayDate, col) => {
    const ymd = ymdOf(dayDate);
    const isToday = ymd === today;
    const isSelected = ymd === selected;
    const evts = eventsByDate[ymd] || [];
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: ymd,
        onClick: () => {
          setSelected(ymd);
          setYear(dayDate.getFullYear());
          setMonth(dayDate.getMonth());
        },
        style: {
          borderRight: col < 6 ? "0.5px solid var(--border)" : "none",
          cursor: "pointer",
          background: isSelected ? "rgba(158,154,229,0.07)" : "transparent",
          transition: "background .1s",
          display: "flex",
          flexDirection: "column"
        },
        onMouseEnter: (e) => {
          if (!isSelected) e.currentTarget.style.background = "rgba(255,255,255,0.03)";
        },
        onMouseLeave: (e) => {
          e.currentTarget.style.background = isSelected ? "rgba(158,154,229,0.07)" : "transparent";
        }
      },
      /* @__PURE__ */ React.createElement("div", { style: { padding: "14px 10px 8px", display: "flex", justifyContent: "center" } }, /* @__PURE__ */ React.createElement("div", { style: {
        width: 34,
        height: 34,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: isToday ? "var(--accent)" : "transparent",
        color: isToday ? "#fff" : isSelected ? "#c8c5f2" : "var(--text-muted)",
        fontSize: 17,
        fontWeight: isToday ? 600 : 400,
        letterSpacing: "-0.5px"
      } }, dayDate.getDate())),
      /* @__PURE__ */ React.createElement("div", { style: { padding: "0 6px 10px", display: "flex", flexDirection: "column", gap: 3 } }, evts.map((ev) => {
        const c = EVENT_COLORS[ev.type] || EVENT_COLORS.custom;
        return /* @__PURE__ */ React.createElement("div", { key: ev.id, style: {
          background: c.bg,
          color: c.text,
          fontSize: 11,
          padding: "4px 7px",
          borderRadius: 6,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          letterSpacing: "-0.3px",
          lineHeight: "1.3"
        } }, ev.title);
      }))
    );
  }))), /* @__PURE__ */ React.createElement("div", { style: { width: 280, flexShrink: 0, display: "flex", flexDirection: "column", overflowY: "auto" } }, /* @__PURE__ */ React.createElement("div", { style: { borderBottom: "0.5px solid var(--border)" } }, /* @__PURE__ */ React.createElement("div", { className: "card-header" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "card-title" }, selectedDate ? selectedDate.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }).replace(/^\w/, (c) => c.toUpperCase()) : "Selecciona un d\xEDa"), selectedEvents.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "card-sub" }, selectedEvents.length, " evento", selectedEvents.length > 1 ? "s" : "")), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn ghost icon-only sm",
      onClick: () => {
        setForm((f) => ({ ...f, date: selected }));
        setShowForm(true);
      },
      "data-tooltip": "A\xF1adir evento"
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 13 })
  )), /* @__PURE__ */ React.createElement("div", { style: { padding: selectedEvents.length ? "0" : "32px 20px" } }, selectedEvents.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", color: "var(--text-subtle)", fontSize: 13 } }, "Sin eventos este d\xEDa") : /* @__PURE__ */ React.createElement("div", null, selectedEvents.map((ev, idx) => {
    const c = EVENT_COLORS[ev.type] || EVENT_COLORS.custom;
    const isCustom = ev.id.startsWith("custom-");
    return /* @__PURE__ */ React.createElement("div", { key: ev.id, style: {
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
      padding: "14px 18px",
      borderBottom: idx < selectedEvents.length - 1 ? "0.5px solid var(--border)" : "none"
    } }, /* @__PURE__ */ React.createElement("div", { style: { width: 8, height: 8, borderRadius: "50%", background: c.dot, flexShrink: 0, marginTop: 5 } }), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 500, letterSpacing: "-0.96px", color: "var(--text)" } }, ev.title), (ev.time || ev.sub) && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-muted)", marginTop: 2, letterSpacing: "-0.5px" } }, ev.time ? `${ev.time}${ev.timeEnd ? ` \u2013 ${ev.timeEnd}` : ""}${ev.sub ? " \xB7 " + ev.sub : ""}` : ev.sub), /* @__PURE__ */ React.createElement("div", { style: {
      display: "inline-block",
      marginTop: 5,
      fontSize: 10,
      padding: "1px 7px",
      borderRadius: 99,
      background: c.bg,
      color: c.text,
      letterSpacing: "0.02em"
    } }, typeLabel[ev.type] || ev.type)), isCustom && /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "btn ghost icon-only sm",
        onClick: () => deleteCustom(ev.id),
        style: { flexShrink: 0, color: "var(--text-subtle)" }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 12 })
    ));
  })))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "card-header" }, /* @__PURE__ */ React.createElement("div", { className: "card-title" }, "Pr\xF3ximos 14 d\xEDas")), upcoming.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { padding: "24px 20px", textAlign: "center", color: "var(--text-subtle)", fontSize: 13 } }, "Sin eventos pr\xF3ximos") : upcoming.map((ev, idx) => {
    const c = EVENT_COLORS[ev.type] || EVENT_COLORS.custom;
    const d = /* @__PURE__ */ new Date(ev.date + "T12:00:00");
    const isToday2 = ev.date === today;
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: ev.id,
        onClick: () => {
          setSelected(ev.date);
          setYear(d.getFullYear());
          setMonth(d.getMonth());
        },
        style: {
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "11px 18px",
          cursor: "pointer",
          borderBottom: idx < upcoming.length - 1 ? "0.5px solid var(--border)" : "none"
        },
        onMouseEnter: (e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)",
        onMouseLeave: (e) => e.currentTarget.style.background = "transparent"
      },
      /* @__PURE__ */ React.createElement("div", { style: { width: 36, textAlign: "center", flexShrink: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: 400, letterSpacing: "-1px", color: isToday2 ? "var(--accent)" : "var(--text)", lineHeight: 1 } }, d.getDate()), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em" } }, DAYS_ES[(d.getDay() + 6) % 7])),
      /* @__PURE__ */ React.createElement("div", { style: { width: "0.5px", height: 30, background: "var(--border)", flexShrink: 0 } }),
      /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "var(--text)", letterSpacing: "-0.96px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, ev.title), ev.sub && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-muted)", marginTop: 2 } }, ev.sub)),
      /* @__PURE__ */ React.createElement("div", { style: { width: 6, height: 6, borderRadius: "50%", background: c.dot, flexShrink: 0 } })
    );
  })))), showForm && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
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
      /* @__PURE__ */ React.createElement("div", { style: { padding: "0 24px 20px" } }, /* @__PURE__ */ React.createElement(
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
  )));
};
window.AgendaPage = AgendaPage;

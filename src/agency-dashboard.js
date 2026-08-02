(() => {
  // src/agency-dashboard.jsx
  var AnimatedValue = ({ num, fmt }) => {
    const [disp, setDisp] = React.useState(0);
    const raf = React.useRef();
    useEffect(() => {
      cancelAnimationFrame(raf.current);
      const to = Number(num) || 0;
      const dur = 700;
      const ease = (t) => 1 - Math.pow(1 - t, 3);
      let start = null;
      const step = (ts) => {
        if (start == null) start = ts;
        const p = Math.min(1, (ts - start) / dur);
        setDisp(to * ease(p));
        if (p < 1) raf.current = requestAnimationFrame(step);
        else setDisp(to);
      };
      raf.current = requestAnimationFrame(step);
      return () => cancelAnimationFrame(raf.current);
    }, [num]);
    return fmt ? fmt(disp) : Math.round(disp);
  };
  var parseSpanishDate = (str) => {
    if (!str || str === "\u2014") return null;
    const M = { ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5, jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11 };
    const parts = str.trim().toLowerCase().split(/[\s\/\-]+/);
    if (parts.length < 2) return null;
    const day = parseInt(parts[0]);
    const mon = M[parts[1].slice(0, 3)];
    if (isNaN(day) || mon === void 0) return null;
    return new Date((/* @__PURE__ */ new Date()).getFullYear(), mon, day);
  };
  var AgencyDashboard = ({ openModal, navigate, session }) => {
    const D = window.Data;
    D.useStore();
    const [now, setNow] = useState(/* @__PURE__ */ new Date());
    useEffect(() => {
      const id = setInterval(() => setNow(/* @__PURE__ */ new Date()), 1e3);
      return () => clearInterval(id);
    }, []);
    const greeting = (() => {
      const h = now.getHours();
      if (h < 6) return "Buenas noches";
      if (h < 13) return "Buenos d\xEDas";
      if (h < 21) return "Buenas tardes";
      return "Buenas noches";
    })();
    const todayStr = (() => {
      const dias = ["domingo", "lunes", "martes", "mi\xE9rcoles", "jueves", "viernes", "s\xE1bado"];
      const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
      return `${dias[now.getDay()]} ${now.getDate()} de ${meses[now.getMonth()]}`;
    })();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    const agencyName = D.SETTINGS.name || "141'STUDIO";
    const adminEmail = D.SETTINGS.email || "nil@141agency.com";
    const adminName = (() => {
      const n = adminEmail.split("@")[0];
      return n.charAt(0).toUpperCase() + n.slice(1);
    })();
    const activeProjects = D.PROJECTS.length;
    const _projIds = new Set(D.PROJECTS.map((p) => p.id));
    const _liveTasks = Object.entries(D.TASKS).filter(([pid]) => pid === "__none__" || _projIds.has(pid)).flatMap(([, arr]) => arr);
    const _todayStr = D.today ? D.today() : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const _pending = _liveTasks.filter((t) => t.column !== "done");
    const _pendingWithPid = Object.entries(D.TASKS).filter(([pid]) => pid === "__none__" || _projIds.has(pid)).flatMap(([pid, arr]) => arr.filter((t) => t.column !== "done").map((t) => ({ ...t, _pid: pid }))).sort((a, b) => {
      const da = a.deadline || "9999-99-99", db = b.deadline || "9999-99-99";
      return da < db ? -1 : da > db ? 1 : 0;
    });
    const _routinePending = (D.routinesForDay(_todayStr) || []).reduce(
      (n, r) => n + (r.items || []).filter((it) => !D.routineItemDone(r.id, _todayStr, it.id)).length,
      0
    );
    const pendingTasks = _pending.filter((t) => t.deadline && t.deadline <= _todayStr).length + _routinePending;
    const overdueTasks = _pending.filter((t) => t.deadline && t.deadline < _todayStr).length;
    const backlogTasks = _pending.length;
    const pendingInvoices = D.INVOICES.filter((i) => i.status !== "paid").length;
    const atRisk = D.PROJECTS.filter((p) => p.light === "red").length;
    const capacity = activeProjects <= 3 ? "green" : activeProjects <= 4 ? "amber" : "red";
    const capacityLabel = activeProjects === 0 ? "Sin proyectos" : activeProjects <= 3 ? "Capacidad c\xF3moda" : activeProjects <= 4 ? "Capacidad media" : "Al l\xEDmite";
    const dayMessage = `Hoy es ${todayStr} y son las ${timeStr}`;
    const [stripeMonth, setStripeMonth] = useState(null);
    const [stripePrev, setStripePrev] = useState(null);
    useEffect(() => {
      const now2 = /* @__PURE__ */ new Date();
      const monthStart = Math.floor(new Date(now2.getFullYear(), now2.getMonth(), 1).getTime() / 1e3);
      const prevStart = Math.floor(new Date(now2.getFullYear(), now2.getMonth() - 1, 1).getTime() / 1e3);
      window.apiFetch("/api/stripe/invoices", { limit: 100 }).then((r) => r.json()).then((res) => {
        if (!res.ok) {
          setStripeMonth(false);
          return;
        }
        const paid = (res.invoices || []).filter((i) => i.status === "paid");
        setStripeMonth(paid.filter((i) => i.created >= monthStart).reduce((a, b) => {
          var _a, _b;
          return a + ((_b = (_a = b.amount_paid) != null ? _a : b.amount) != null ? _b : 0);
        }, 0));
        setStripePrev(paid.filter((i) => i.created >= prevStart && i.created < monthStart).reduce((a, b) => {
          var _a, _b;
          return a + ((_b = (_a = b.amount_paid) != null ? _a : b.amount) != null ? _b : 0);
        }, 0));
      }).catch(() => setStripeMonth(false));
    }, []);
    const upcomingEvents = React.useMemo(() => {
      const ev = [];
      const todayMid = /* @__PURE__ */ new Date();
      todayMid.setHours(0, 0, 0, 0);
      D.PROJECTS.forEach((p) => {
        const d = parseSpanishDate(p.deadline);
        if (d) ev.push({
          date: d,
          label: p.name,
          sub: p.clientName,
          type: "Entrega",
          color: p.light === "red" ? "var(--red)" : p.light === "amber" ? "var(--amber)" : "var(--green)",
          icon: "folder"
        });
      });
      D.INVOICES.filter((i) => i.status !== "paid").forEach((i) => {
        const d = parseSpanishDate(i.due);
        if (d) ev.push({
          date: d,
          label: i.id,
          sub: `${i.client} \xB7 \u20AC${i.amount}`,
          type: "Factura",
          color: i.status === "overdue" ? "var(--red)" : "var(--amber)",
          icon: "receipt"
        });
      });
      try {
        const fin = window.Data && window.Data.FINANCE || {};
        (fin.subs || []).filter((s) => s.active !== false && s.nextRenewal).forEach((s) => {
          let d = /* @__PURE__ */ new Date(s.nextRenewal + "T00:00:00");
          if (isNaN(d)) return;
          let guard = 0;
          while (d < todayMid && guard < 60) {
            if (s.cycle === "yearly") d.setFullYear(d.getFullYear() + 1);
            else d.setMonth(d.getMonth() + 1);
            guard++;
          }
          const amount = Number(s.amount) || 0;
          ev.push({
            date: d,
            label: s.name,
            sub: `Cobro \xB7 \u20AC${amount.toLocaleString("es-ES")} \xB7 ${s.cycle === "yearly" ? "anual" : "mensual"}`,
            type: "Suscripci\xF3n",
            color: "var(--accent)",
            icon: "refresh-cw"
          });
        });
      } catch (err) {
      }
      try {
        const custom = JSON.parse(localStorage.getItem("agenda_custom_events") || "[]");
        custom.forEach((e) => {
          if (!e.date) return;
          const d = /* @__PURE__ */ new Date(e.date + "T00:00:00");
          if (isNaN(d)) return;
          const iconMap = { meeting: "users", task: "list-todo", custom: "calendar" };
          const colorMap = { meeting: "var(--red)", task: "var(--accent)", custom: "var(--blue)" };
          const typeLabel = { meeting: "Reuni\xF3n", task: "Tarea", custom: "Evento" };
          ev.push({
            date: d,
            label: e.title,
            time: e.time || null,
            timeEnd: e.timeEnd || null,
            type: typeLabel[e.type] || "Evento",
            color: colorMap[e.type] || "var(--blue)",
            icon: iconMap[e.type] || "calendar"
          });
        });
      } catch (err) {
      }
      return ev.filter((e) => {
        const dMid = new Date(e.date);
        dMid.setHours(0, 0, 0, 0);
        const diff = Math.round((dMid - todayMid) / 864e5);
        return diff >= 0 && diff <= 7;
      }).sort((a, b) => a.date - b.date).slice(0, 8);
    }, [D.PROJECTS, D.INVOICES, D.TASKS, D.FINANCE]);
    const upcomingBills = React.useMemo(() => {
      const out = [];
      const todayMid = /* @__PURE__ */ new Date();
      todayMid.setHours(0, 0, 0, 0);
      try {
        const fin = window.Data && window.Data.FINANCE || {};
        (fin.subs || []).filter((s) => s.active !== false && s.nextRenewal).forEach((s) => {
          let d = /* @__PURE__ */ new Date(s.nextRenewal + "T00:00:00");
          if (isNaN(d)) return;
          let guard = 0;
          while (d < todayMid && guard < 60) {
            if (s.cycle === "yearly") d.setFullYear(d.getFullYear() + 1);
            else d.setMonth(d.getMonth() + 1);
            guard++;
          }
          out.push({
            id: "sub:" + (s.id || s.name),
            name: s.name || "Suscripci\xF3n",
            date: new Date(d),
            amount: Number(s.amount) || 0,
            cycle: s.cycle === "yearly" ? "anual" : "mensual",
            kind: "sub"
          });
        });
      } catch (e) {
      }
      (D.INVOICES || []).filter((i) => i.status !== "paid").forEach((i) => {
        const d = parseSpanishDate(i.due);
        if (d) out.push({
          id: "inv:" + i.id,
          name: i.client || i.id,
          date: d,
          amount: Number(i.amount) || 0,
          kind: "invoice"
        });
      });
      return out.sort((a, b) => a.date - b.date).slice(0, 6);
    }, [D.INVOICES, D.FINANCE]);
    const formatEventDate = (d) => {
      const todayMid = /* @__PURE__ */ new Date();
      todayMid.setHours(0, 0, 0, 0);
      const dMid = new Date(d);
      dMid.setHours(0, 0, 0, 0);
      const diff = Math.round((dMid - todayMid) / 864e5);
      if (diff < 0) return `hace ${Math.abs(diff)}d`;
      if (diff === 0) return "Hoy";
      if (diff === 1) return "Ma\xF1ana";
      const dias = ["Dom", "Lun", "Mar", "Mi\xE9", "Jue", "Vie", "S\xE1b"];
      const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
      return `${dias[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]}`;
    };
    const _spendForMonth = (offset = 0) => {
      try {
        const fin = window.Data && window.Data.FINANCE || {};
        const base = /* @__PURE__ */ new Date(), today = base.getDate();
        const isCurrent = offset === 0;
        const rec = (fin.subs || []).filter((s) => s.active !== false).reduce((a, s) => {
          if (!isCurrent) return a + (s.cycle === "yearly" ? (Number(s.amount) || 0) / 12 : Number(s.amount) || 0);
          if (s.cycle === "yearly") {
            if (!s.nextRenewal) return a;
            const d = /* @__PURE__ */ new Date(s.nextRenewal + "T00:00:00");
            return a + (!isNaN(d) && d.getMonth() === base.getMonth() && d.getDate() <= today ? Number(s.amount) || 0 : 0);
          }
          const day = s.nextRenewal ? (/* @__PURE__ */ new Date(s.nextRenewal + "T00:00:00")).getDate() : 1;
          return a + (day <= today ? Number(s.amount) || 0 : 0);
        }, 0);
        const y = base.getFullYear(), m = base.getMonth() + offset;
        const ref = new Date(y, m, 1);
        const exp = (fin.expenses || []).filter((e) => {
          if (!e.date) return false;
          const d = new Date(e.date);
          return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
        }).reduce((a, e) => a + (Number(e.amount) || 0), 0);
        return rec + exp;
      } catch (e) {
        return 0;
      }
    };
    const monthSpend = _spendForMonth(0);
    const lastMonthSpend = _spendForMonth(-1);
    const prevMonthLabel = new Date(now.getFullYear(), now.getMonth() - 1, 1).toLocaleString("es-ES", { month: "short" });
    const _pctDelta = (cur, prev) => prev > 0 ? Math.round((cur - prev) / prev * 100) : null;
    const spendDelta = _pctDelta(monthSpend, lastMonthSpend);
    const _incMonth = (offset = 0) => {
      try {
        const d = JSON.parse(localStorage.getItem("141_income_v1")) || {};
        const vatOf = (x) => x.vat === void 0 || x.vat === null ? 21 : Number(x.vat);
        const irpfOf = (x) => x.irpf === void 0 || x.irpf === null ? 0 : Number(x.irpf);
        const withVat = (x) => (Number(x.amount) || 0) * (1 + vatOf(x) / 100 - irpfOf(x) / 100);
        const ref = new Date(now.getFullYear(), now.getMonth() + offset, 1);
        const key = `${ref.getFullYear()}-${String(ref.getMonth() + 1).padStart(2, "0")}`;
        const nowKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        const pun = (d.incomes || []).filter((i) => (i.date || "").startsWith(key)).reduce((a, i) => a + withVat(i), 0);
        const rec = (d.recs || []).filter((r) => r.active).filter((r) => {
          const start = r.nextCharge && r.nextCharge.slice(0, 7) < nowKey ? r.nextCharge.slice(0, 7) : nowKey;
          return start <= key;
        }).reduce((a, r) => a + (r.cycle === "yearly" ? withVat(r) / 12 : withVat(r)), 0);
        return pun + rec;
      } catch (e) {
        return 0;
      }
    };
    const facturadoCur = (stripeMonth === null || stripeMonth === false ? 0 : stripeMonth / 100) + _incMonth(0);
    const facturadoPrev = (stripePrev || 0) / 100 + _incMonth(-1);
    const _routToday = (D.routinesForDay ? D.routinesForDay(_todayStr) : []) || [];
    let _rSteps = 0, _rSum = 0, weightToday = null;
    _routToday.forEach((r) => (r.items || []).forEach((it) => {
      _rSteps++;
      _rSum += D.routineItemProgress ? D.routineItemProgress(r.id, _todayStr, it.id) : 0;
      if ((it.text || "").toLowerCase().includes("peso")) {
        const lg = D.routineItemLog ? D.routineItemLog(r.id, _todayStr, it.id) : null;
        if (lg && lg.weight != null) weightToday = lg.weight;
      }
    }));
    const routinePct = _rSteps ? Math.round(_rSum / _rSteps) : 0;
    const routineDone = _rSteps ? _routToday.reduce((n, r) => n + (r.items || []).filter((it) => D.routineItemDone(r.id, _todayStr, it.id)).length, 0) : 0;
    const routineStreak = _routToday[0] && D.routineStreak ? D.routineStreak(_routToday[0].id, _todayStr) : 0;
    const _MES3 = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    const finBars = [];
    for (let o = -5; o <= 0; o++) {
      const ref = new Date(now.getFullYear(), now.getMonth() + o, 1);
      finBars.push({
        label: _MES3[ref.getMonth()],
        gasto: _spendForMonth(o),
        ingreso: o === 0 ? facturadoCur : _incMonth(o)
      });
    }
    const finMax = Math.max(1, ...finBars.map((b) => Math.max(b.gasto, b.ingreso)));
    const _MESFULL = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const finTrend = finBars.map((b, i) => {
      const ref = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      return {
        key: `${ref.getFullYear()}-${ref.getMonth()}`,
        label: b.label,
        full: `${_MESFULL[ref.getMonth()]} ${ref.getFullYear()}`,
        total: b.ingreso
      };
    });
    const _countDelta = (n, word) => n > 0 ? { text: String(n), suffix: word, dir: "down", tone: "bad" } : { text: "0", suffix: word, dir: "flat", tone: "muted" };
    const _pctToDelta = (pct, goodUp, suffix) => {
      if (pct === null) return { text: "\u2014", suffix, dir: "flat", tone: "muted" };
      const up = pct > 0, down = pct < 0;
      const good = up === goodUp;
      return {
        text: `${up ? "+" : down ? "\u2212" : ""}${Math.abs(pct)}%`,
        suffix,
        dir: up ? "up" : down ? "down" : "flat",
        tone: up || down ? good ? "good" : "bad" : "muted"
      };
    };
    const _dayCompletion = (dateStr) => {
      const tks = _liveTasks.filter((t) => t.deadline === dateStr);
      let done = tks.filter((t) => t.column === "done").length;
      let total = tks.length;
      (D.routinesForDay ? D.routinesForDay(dateStr) : []).forEach((r) => (r.items || []).forEach((it) => {
        total += 1;
        if (D.routineItemDone(r.id, dateStr, it.id)) done += 1;
      }));
      return total ? Math.round(done / total * 100) : 0;
    };
    const _yestStr = (() => {
      const d = /* @__PURE__ */ new Date(_todayStr + "T12:00:00");
      d.setDate(d.getDate() - 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    })();
    const _tasksDayDelta = _dayCompletion(_todayStr) - _dayCompletion(_yestStr);
    const [hoverKpi, setHoverKpi] = useState(null);
    const [hideMoney, setHideMoney] = useState(() => {
      try {
        return localStorage.getItem("141_hide_money") === "1";
      } catch (e) {
        return false;
      }
    });
    const toggleMoney = () => setHideMoney((v) => {
      const n = !v;
      try {
        localStorage.setItem("141_hide_money", n ? "1" : "0");
      } catch (e) {
      }
      return n;
    });
    const [layout, setLayout] = useState(() => {
      try {
        return localStorage.getItem("141_home_layout") || "bento";
      } catch (e) {
        return "bento";
      }
    });
    const setLayoutSaved = (id) => {
      setLayout(id);
      try {
        localStorage.setItem("141_home_layout", id);
      } catch (e) {
      }
    };
    const LAYOUTS = [{ id: "bento", label: "Bento" }, { id: "minimal", label: "Minimal" }, { id: "focus", label: "Focus" }];
    const _eur = (n) => `\u20AC${(Number(n) || 0).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const _int = (n) => String(Math.round(Number(n) || 0));
    const kpis = [
      {
        label: "Proyectos activos",
        value: activeProjects,
        num: activeProjects,
        fmt: _int,
        delta: _countDelta(atRisk, "en riesgo"),
        nav: "projects"
      },
      {
        label: "Tareas pendientes",
        value: pendingTasks,
        num: pendingTasks,
        fmt: _int,
        delta: _pctToDelta(_tasksDayDelta, true, "vs ayer"),
        nav: "tasks"
      },
      {
        label: "Gastado este mes",
        value: `\u20AC${monthSpend.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        num: monthSpend,
        fmt: _eur,
        delta: _pctToDelta(spendDelta, false, `vs ${prevMonthLabel}`),
        nav: "billing",
        money: true
      },
      {
        label: "Facturado este mes",
        value: stripeMonth === null ? "\u2026" : `\u20AC${facturadoCur.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        num: stripeMonth === null ? null : facturadoCur,
        fmt: _eur,
        delta: stripeMonth === null ? { text: "\u2014", dir: "flat", tone: "muted" } : facturadoPrev > 0 ? _pctToDelta(_pctDelta(facturadoCur, facturadoPrev), true, `vs ${prevMonthLabel}`) : facturadoCur > 0 ? { text: "+100%", suffix: `vs ${prevMonthLabel}`, dir: "up", tone: "good" } : { text: "0%", suffix: `vs ${prevMonthLabel}`, dir: "flat", tone: "muted" },
        nav: "income",
        money: true
      }
    ];
    const queues = [
      { icon: "list-todo", label: "Tareas sin completar", count: backlogTasks, action: () => navigate("projects") },
      { icon: "clock", label: "Tareas vencidas", count: overdueTasks, action: () => navigate("projects") },
      { icon: "flag", label: "Proyectos en riesgo", count: atRisk, action: () => navigate("projects") },
      { icon: "receipt", label: "Facturas pendientes", count: pendingInvoices, action: () => navigate("invoices") }
    ];
    const APPLE_CARD = {
      background: "transparent",
      border: "none",
      borderRadius: 0,
      boxShadow: "none"
    };
    const APPLE_SECTION = {
      fontSize: 11,
      fontWeight: 600,
      color: "var(--text-subtle)",
      textTransform: "uppercase",
      letterSpacing: "0.08em"
    };
    const Header = /* @__PURE__ */ React.createElement("header", { style: {
      display: "flex",
      flexDirection: "column",
      gap: 20,
      flexShrink: 0,
      paddingBottom: 24
    } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement("h1", { style: {
      fontSize: 36,
      fontWeight: 400,
      letterSpacing: "-1.2px",
      lineHeight: 1.05,
      margin: 0,
      fontFamily: "var(--font-display)",
      color: "var(--text)"
    } }, greeting, ", ", adminName, "."), /* @__PURE__ */ React.createElement("p", { style: {
      margin: 0,
      fontSize: 14,
      color: "var(--text-muted)",
      letterSpacing: "-0.2px",
      lineHeight: 1.4
    } }, dayMessage)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement("div", { style: {
      display: "flex",
      alignItems: "center",
      padding: "3px 4px",
      background: "rgba(255,255,255,0.07)",
      border: "0.5px solid rgba(255,255,255,0.1)",
      borderRadius: 99
    } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: toggleMoney,
        title: hideMoney ? "Mostrar importes" : "Ocultar importes",
        style: {
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: hideMoney ? "var(--accent)" : "var(--text-muted)",
          transition: "background .12s"
        },
        onMouseEnter: (e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)",
        onMouseLeave: (e) => e.currentTarget.style.background = "transparent"
      },
      /* @__PURE__ */ React.createElement(Icon, { name: hideMoney ? "eye-off" : "eye", size: 16 })
    )), /* @__PURE__ */ React.createElement(
      ActionPill,
      {
        plusActions: [
          { icon: "plus", label: "Nueva tarea", sub: "A\xF1ade una tarea r\xE1pida.", accent: true, onClick: () => openModal("newTask") },
          { icon: "folder", label: "Nuevo proyecto", sub: "Crea un proyecto.", onClick: () => openModal("newProject") },
          { icon: "users", label: "Nuevo cliente", sub: "A\xF1ade una ficha o portal.", onClick: () => openModal("newClient") },
          { icon: "receipt", label: "Nueva factura", sub: "Se crea y env\xEDa desde Stripe.", onClick: () => openModal("newInvoice") }
        ]
      }
    ))));
    const EYEBROW = (txt) => /* @__PURE__ */ React.createElement("div", { style: APPLE_SECTION }, txt);
    const recentActivity = [
      ...D.PROJECTS.slice(0, 2).map((p) => ({ icon: "folder", text: p.name, sub: "Proyecto en curso" })),
      ...D.CLIENTS.slice(0, 2).map((c) => ({ icon: "users", text: c.company, sub: c.service || "Cliente" })),
      ...(D.INVOICES || []).slice(0, 1).map((i) => ({ icon: "receipt", text: i.client, sub: "Factura " + (i.status || "\u2014") }))
    ].slice(0, 5);
    const renderKpiTile = (k, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { ...APPLE_CARD, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("div", { style: {
      width: 32,
      height: 32,
      borderRadius: 9,
      background: "rgba(158,154,229,0.12)",
      border: "0.5px solid rgba(158,154,229,0.18)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--accent)"
    } }, /* @__PURE__ */ React.createElement(Icon, { name: k.icon, size: 15, strokeWidth: 1.7 }))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: {
      fontSize: typeof k.value === "string" && k.value.startsWith("\u20AC") ? 22 : 28,
      fontWeight: 400,
      lineHeight: 1,
      letterSpacing: "-1.1px",
      fontVariantNumeric: "tabular-nums",
      fontFamily: "var(--font-display)",
      color: "var(--text)"
    } }, k.num != null ? /* @__PURE__ */ React.createElement(AnimatedValue, { num: k.num, fmt: k.fmt }) : k.value), /* @__PURE__ */ React.createElement("div", { style: {
      marginTop: 8,
      fontSize: 12,
      color: "var(--text-muted)",
      fontWeight: 500,
      letterSpacing: "-0.3px"
    } }, k.label), /* @__PURE__ */ React.createElement("div", { style: {
      marginTop: 3,
      fontSize: 11,
      color: "var(--text-subtle)",
      letterSpacing: "-0.2px"
    } }, k.sub)));
    const renderMiniKpi = (k, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { ...APPLE_CARD, padding: "14px 16px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11.5, color: "var(--text-muted)", letterSpacing: "-0.2px" } }, k.label), /* @__PURE__ */ React.createElement(Icon, { name: k.icon, size: 12, strokeWidth: 1.7, style: { color: "var(--text-subtle)" } })), /* @__PURE__ */ React.createElement("div", { style: {
      fontSize: typeof k.value === "string" && k.value.startsWith("\u20AC") ? 18 : 22,
      fontWeight: 400,
      letterSpacing: "-0.8px",
      fontFamily: "var(--font-display)",
      fontVariantNumeric: "tabular-nums",
      lineHeight: 1
    } }, k.num != null ? /* @__PURE__ */ React.createElement(AnimatedValue, { num: k.num, fmt: k.fmt }) : k.value));
    const AgendaBlock = ({ height = 360, slice = 8 }) => /* @__PURE__ */ React.createElement("div", { style: { ...APPLE_CARD, display: "flex", flexDirection: "column", overflow: "hidden", height } }, /* @__PURE__ */ React.createElement("div", { style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "18px 22px 14px",
      borderBottom: "0.5px solid rgba(255,255,255,0.06)"
    } }, /* @__PURE__ */ React.createElement("div", null, EYEBROW("Pr\xF3ximamente"), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 4, fontSize: 15, fontWeight: 500, letterSpacing: "-0.5px" } }, "Agenda")), /* @__PURE__ */ React.createElement("button", { onClick: () => navigate("agenda"), style: LINK_BTN }, "Ver todo ", /* @__PURE__ */ React.createElement(Icon, { name: "arrow", size: 12 }))), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, overflowY: "auto" } }, upcomingEvents.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { padding: 40, textAlign: "center" } }, /* @__PURE__ */ React.createElement(Empty, { icon: "check", title: "Sin eventos pr\xF3ximos", sub: "Todo al d\xEDa por ahora." })) : upcomingEvents.slice(0, slice).map((ev, i) => /* @__PURE__ */ React.createElement(EventRow, { key: i, ev, last: i === Math.min(slice - 1, upcomingEvents.length - 1), formatEventDate }))));
    const fmtTaskDate = (ds) => {
      if (!ds) return "";
      const d = /* @__PURE__ */ new Date(ds + "T00:00:00");
      return isNaN(d) ? "" : formatEventDate(d);
    };
    const QueuesBlock = ({ height = 360 }) => /* @__PURE__ */ React.createElement("div", { style: { ...APPLE_CARD, display: "flex", flexDirection: "column", overflow: "hidden", height } }, /* @__PURE__ */ React.createElement("div", { style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "18px 22px 14px",
      borderBottom: "0.5px solid rgba(255,255,255,0.06)"
    } }, /* @__PURE__ */ React.createElement("div", null, EYEBROW("Pendiente"), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 4, fontSize: 15, fontWeight: 500, letterSpacing: "-0.5px" } }, "Tareas r\xE1pidas")), /* @__PURE__ */ React.createElement("button", { onClick: () => navigate("tasks"), style: LINK_BTN }, "Ver todo ", /* @__PURE__ */ React.createElement(Icon, { name: "arrow", size: 12 }))), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, overflowY: "auto" } }, _pendingWithPid.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { padding: 40, textAlign: "center" } }, /* @__PURE__ */ React.createElement(Empty, { icon: "check", title: "Todo hecho", sub: "No te queda nada pendiente." })) : _pendingWithPid.slice(0, 12).map((t, i) => /* @__PURE__ */ React.createElement(
      QuickTaskRow,
      {
        key: t.id,
        t,
        D,
        last: i === Math.min(11, _pendingWithPid.length - 1),
        projName: (D.PROJECTS.find((p) => p.id === t._pid) || {}).name || t.clientName || "General",
        dateLabel: fmtTaskDate(t.deadline),
        overdue: t.deadline && t.deadline < _todayStr
      }
    ))));
    const ProjectsBlock = ({ height = 360 }) => /* @__PURE__ */ React.createElement("div", { style: { ...APPLE_CARD, display: "flex", flexDirection: "column", overflow: "hidden", height } }, /* @__PURE__ */ React.createElement("div", { style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "18px 22px 14px",
      borderBottom: "0.5px solid rgba(255,255,255,0.06)"
    } }, /* @__PURE__ */ React.createElement("div", null, EYEBROW("Pr\xF3ximos"), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 4, fontSize: 15, fontWeight: 500, letterSpacing: "-0.5px" } }, "Pagos y suscripciones")), /* @__PURE__ */ React.createElement("button", { onClick: () => navigate("billing"), style: LINK_BTN }, "Ver todo ", /* @__PURE__ */ React.createElement(Icon, { name: "arrow", size: 12 }))), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: "6px 14px" } }, upcomingBills.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { padding: 30, textAlign: "center" } }, /* @__PURE__ */ React.createElement(Empty, { icon: "check", title: "Sin pagos pr\xF3ximos", sub: "No hay cobros ni facturas pendientes." })) : upcomingBills.map((b, i) => /* @__PURE__ */ React.createElement(
      BillRow,
      {
        key: b.id,
        b,
        hideMoney,
        eur: _eur,
        last: i === upcomingBills.length - 1,
        onClick: () => navigate("billing")
      }
    ))));
    const WidgetCard = ({ eyebrow, title, action, onAction, children, pad = "16px 20px" }) => /* @__PURE__ */ React.createElement("div", { style: { ...APPLE_CARD, display: "flex", flexDirection: "column", overflow: "hidden", height: "100%" } }, /* @__PURE__ */ React.createElement("div", { style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px 20px 12px",
      borderBottom: "0.5px solid rgba(255,255,255,0.06)"
    } }, /* @__PURE__ */ React.createElement("div", null, EYEBROW(eyebrow), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 4, fontSize: 15, fontWeight: 500, letterSpacing: "-0.5px" } }, title)), action && /* @__PURE__ */ React.createElement("button", { onClick: onAction, style: LINK_BTN }, action, " ", /* @__PURE__ */ React.createElement(Icon, { name: "arrow", size: 12 }))), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minHeight: 0, padding: pad, display: "flex" } }, children));
    const RoutineTodayBlock = () => {
      const r = 26, circ = 2 * Math.PI * r, off = circ * (1 - routinePct / 100);
      if (_routToday.length === 0) return /* @__PURE__ */ React.createElement(WidgetCard, { eyebrow: "H\xE1bitos", title: "Rutina de hoy", action: "Ver", onAction: () => navigate("tasks") }, /* @__PURE__ */ React.createElement("div", { style: { margin: "auto", textAlign: "center", color: "var(--text-subtle)", fontSize: 12.5 } }, "Sin rutina para hoy."));
      return /* @__PURE__ */ React.createElement(WidgetCard, { eyebrow: "H\xE1bitos", title: "Rutina de hoy", action: "Ver", onAction: () => navigate("tasks") }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 18, width: "100%" } }, /* @__PURE__ */ React.createElement("div", { style: { position: "relative", width: 68, height: 68, flexShrink: 0 } }, /* @__PURE__ */ React.createElement("svg", { width: "68", height: "68", style: { transform: "rotate(-90deg)" } }, /* @__PURE__ */ React.createElement("circle", { cx: "34", cy: "34", r, fill: "none", stroke: "rgba(255,255,255,0.08)", strokeWidth: "5" }), /* @__PURE__ */ React.createElement(
        "circle",
        {
          cx: "34",
          cy: "34",
          r,
          fill: "none",
          stroke: "var(--accent)",
          strokeWidth: "5",
          strokeLinecap: "round",
          strokeDasharray: circ,
          strokeDashoffset: off,
          style: { transition: "stroke-dashoffset .5s" }
        }
      )), /* @__PURE__ */ React.createElement("div", { style: {
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 16,
        fontWeight: 500,
        letterSpacing: "-0.5px",
        fontFamily: "var(--font-display)"
      } }, routinePct, "%")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: "var(--text-muted)", letterSpacing: "-0.2px" } }, routineDone, "/", _rSteps, " pasos hechos"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 16 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: 500, letterSpacing: "-0.6px", fontFamily: "var(--font-display)", color: "var(--text)" } }, routineStreak, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "var(--text-muted)", marginLeft: 3 } }, "d\xEDas")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-subtle)" } }, "Racha")), weightToday != null && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: 500, letterSpacing: "-0.6px", fontFamily: "var(--font-display)", color: "var(--text)" } }, String(weightToday).replace(".", ","), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "var(--text-muted)", marginLeft: 3 } }, "kg")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-subtle)" } }, "Peso hoy"))))));
    };
    const MiniFinanceBlock = () => {
      const FinTrend = window.FinTrendChart;
      return /* @__PURE__ */ React.createElement(WidgetCard, { eyebrow: "\xDAltimos 6 meses", title: "Facturado", action: "Ver", onAction: () => navigate("billing"), pad: "10px 18px 10px" }, hideMoney ? /* @__PURE__ */ React.createElement("div", { style: { margin: "auto", textAlign: "center", color: "var(--text-subtle)", fontSize: 12.5 } }, "Importes ocultos") : FinTrend ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", width: "100%", minHeight: 0 } }, /* @__PURE__ */ React.createElement(FinTrend, { trend: finTrend, single: true })) : /* @__PURE__ */ React.createElement("div", { style: { margin: "auto", color: "var(--text-subtle)", fontSize: 12.5 } }, "\u2026"));
    };
    const QueuesCountBlock = () => /* @__PURE__ */ React.createElement(WidgetCard, { eyebrow: "Pendiente", title: "Colas de trabajo", pad: "14px 16px" }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%" } }, queues.map((q, i) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key: i,
        onClick: q.action,
        onMouseEnter: (e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)",
        onMouseLeave: (e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)",
        style: {
          background: "rgba(255,255,255,0.03)",
          border: "0.5px solid rgba(255,255,255,0.06)",
          borderRadius: 12,
          padding: "10px 12px",
          cursor: "pointer",
          transition: "background .1s",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8
        }
      },
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 9, minWidth: 0 } }, /* @__PURE__ */ React.createElement(Icon, { name: q.icon, size: 14, strokeWidth: 1.7, style: { color: "var(--text-subtle)", flexShrink: 0 } }), /* @__PURE__ */ React.createElement("span", { style: {
        fontSize: 11.5,
        color: "var(--text-muted)",
        letterSpacing: "-0.2px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      } }, q.label)),
      /* @__PURE__ */ React.createElement("span", { style: {
        fontSize: 18,
        fontWeight: 400,
        fontFamily: "var(--font-display)",
        fontVariantNumeric: "tabular-nums",
        color: q.count > 0 ? "var(--text)" : "var(--text-subtle)",
        letterSpacing: "-0.5px"
      } }, q.count)
    ))));
    const StatsInline = () => /* @__PURE__ */ React.createElement("div", { style: { ...APPLE_CARD, display: "flex", flexWrap: "wrap", gap: 32, padding: "20px 24px" } }, kpis.map((k, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", flexDirection: "column", gap: 4, minWidth: 130 } }, /* @__PURE__ */ React.createElement("div", { style: {
      fontSize: 11,
      color: "var(--text-subtle)",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      fontWeight: 500
    } }, k.label), /* @__PURE__ */ React.createElement("div", { style: {
      fontSize: typeof k.value === "string" && k.value.startsWith("\u20AC") ? 22 : 26,
      fontWeight: 400,
      letterSpacing: "-0.9px",
      fontFamily: "var(--font-display)",
      fontVariantNumeric: "tabular-nums",
      lineHeight: 1.1
    } }, k.num != null ? /* @__PURE__ */ React.createElement(AnimatedValue, { num: k.num, fmt: k.fmt }) : k.value), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--text-muted)" } }, k.sub))));
    const KpiRow = /* @__PURE__ */ React.createElement("section", { style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 32,
      padding: "0 4px 6px",
      flexShrink: 0
    } }, kpis.map((k, i) => {
      const clickable = !!k.nav;
      const on = hoverKpi === i;
      const masked = k.money && hideMoney;
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          key: i,
          onClick: clickable ? () => navigate(k.nav) : void 0,
          onMouseEnter: clickable ? () => setHoverKpi(i) : void 0,
          onMouseLeave: clickable ? () => setHoverKpi(null) : void 0,
          style: { display: "flex", flexDirection: "column", gap: 14, cursor: clickable ? "pointer" : "default" }
        },
        /* @__PURE__ */ React.createElement("span", { style: { fontSize: 16, lineHeight: 1.3, color: on ? "var(--text)" : "var(--text-muted)", letterSpacing: "-0.2px", transition: "color .15s" } }, k.label),
        /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 7 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 4, height: 32 } }, masked ? /* @__PURE__ */ React.createElement("span", { style: {
          display: "inline-block",
          width: 116,
          height: 20,
          borderRadius: 999,
          background: "linear-gradient(90deg, rgba(255,255,255,0.11), rgba(255,255,255,0.05))",
          alignSelf: "center"
        } }) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { style: {
          fontSize: 32,
          color: on ? "var(--accent)" : "var(--text)",
          letterSpacing: "-0.08em",
          lineHeight: 1,
          fontFamily: "var(--font-display)",
          fontVariantNumeric: "tabular-nums",
          transition: "color .15s"
        } }, k.num != null ? /* @__PURE__ */ React.createElement(AnimatedValue, { num: k.num, fmt: k.fmt }) : k.value), k.unit && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 16, color: "var(--text-muted)" } }, k.unit))), k.delta && !masked && /* @__PURE__ */ React.createElement(MetricDelta, { ...k.delta }), masked && /* @__PURE__ */ React.createElement("span", { style: { display: "inline-block", width: 64, height: 11, borderRadius: 999, background: "rgba(255,255,255,0.06)" } }))
      );
    }));
    const LayoutBento = /* @__PURE__ */ React.createElement(React.Fragment, null, KpiRow, /* @__PURE__ */ React.createElement("section", { style: { display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: 16, height: 344, flexShrink: 0 } }, /* @__PURE__ */ React.createElement(QueuesBlock, { height: "100%" }), /* @__PURE__ */ React.createElement(AgendaBlock, { height: "100%", slice: 6 }), /* @__PURE__ */ React.createElement(ProjectsBlock, { height: "100%" })), /* @__PURE__ */ React.createElement("section", { style: { display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 16, height: 264, flexShrink: 0 } }, /* @__PURE__ */ React.createElement(MiniFinanceBlock, null), /* @__PURE__ */ React.createElement(GoalBlock, { billed: facturadoCur, eur: _eur, hideMoney })), /* @__PURE__ */ React.createElement("section", { style: { height: 176, flexShrink: 0 } }, /* @__PURE__ */ React.createElement(ProjectsProgressBlock, { D, navigate, openModal })));
    const _mHead = (title, action, onAction) => /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 } }, EYEBROW(title), action && /* @__PURE__ */ React.createElement("button", { onClick: onAction, style: { ...LINK_BTN, height: 22, padding: "0 6px" } }, action, " ", /* @__PURE__ */ React.createElement(Icon, { name: "arrow", size: 11 })));
    const _mDivider = /* @__PURE__ */ React.createElement("div", { style: { height: "0.5px", background: "rgba(255,255,255,0.07)" } });
    const LayoutMinimal = /* @__PURE__ */ React.createElement(React.Fragment, null, KpiRow, /* @__PURE__ */ React.createElement("div", { style: { height: "0.5px", background: "rgba(255,255,255,0.07)", margin: "10px 0 4px" } }), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 52, alignItems: "start", paddingTop: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 26 } }, /* @__PURE__ */ React.createElement("div", null, _mHead("Agenda", "Ver todo", () => navigate("agenda")), upcomingEvents.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: "var(--text-subtle)", padding: "8px 0" } }, "Sin eventos pr\xF3ximos.") : upcomingEvents.slice(0, 4).map((ev, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "10px 0",
      borderBottom: i === Math.min(3, upcomingEvents.length - 1) ? "none" : "0.5px solid rgba(255,255,255,0.05)"
    } }, /* @__PURE__ */ React.createElement("div", { style: { width: 8, height: 8, borderRadius: "50%", background: ev.color || "var(--accent)", flexShrink: 0 } }), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, fontWeight: 500, letterSpacing: "-0.3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, ev.label), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-subtle)", marginTop: 1 } }, formatEventDate(ev.date), ev.sub ? ` \xB7 ${ev.sub}` : "")), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10.5, color: "var(--text-subtle)" } }, ev.type)))), /* @__PURE__ */ React.createElement("div", null, _mHead("Tareas de hoy", "Ver todo", () => navigate("tasks")), _pendingWithPid.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: "var(--text-subtle)", padding: "8px 0" } }, "No te queda nada pendiente.") : _pendingWithPid.slice(0, 6).map((t, i) => /* @__PURE__ */ React.createElement("div", { key: t.id, style: { marginInline: -22 } }, /* @__PURE__ */ React.createElement(
      QuickTaskRow,
      {
        t,
        D,
        last: i === Math.min(5, _pendingWithPid.length - 1),
        projName: (D.PROJECTS.find((p) => p.id === t._pid) || {}).name || t.clientName || "General",
        dateLabel: fmtTaskDate(t.deadline),
        overdue: t.deadline && t.deadline < _todayStr
      }
    ))))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 24 } }, /* @__PURE__ */ React.createElement("div", null, _mHead("Rutina de hoy"), _routToday.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: "var(--text-subtle)", padding: "6px 0" } }, "Sin rutina para hoy.") : (() => {
      const r = 30, circ = 2 * Math.PI * r, off = circ * (1 - routinePct / 100);
      return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 20, paddingTop: 6 } }, /* @__PURE__ */ React.createElement("div", { style: { position: "relative", width: 76, height: 76, flexShrink: 0 } }, /* @__PURE__ */ React.createElement("svg", { width: "76", height: "76", style: { transform: "rotate(-90deg)" } }, /* @__PURE__ */ React.createElement("circle", { cx: "38", cy: "38", r, fill: "none", stroke: "rgba(255,255,255,0.08)", strokeWidth: "5" }), /* @__PURE__ */ React.createElement(
        "circle",
        {
          cx: "38",
          cy: "38",
          r,
          fill: "none",
          stroke: "var(--accent)",
          strokeWidth: "5",
          strokeLinecap: "round",
          strokeDasharray: circ,
          strokeDashoffset: off,
          style: { transition: "stroke-dashoffset .5s" }
        }
      )), /* @__PURE__ */ React.createElement("div", { style: {
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 18,
        fontWeight: 500,
        letterSpacing: "-0.6px",
        fontFamily: "var(--font-display)"
      } }, routinePct, "%")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: "var(--text-muted)" } }, routineDone, "/", _rSteps, " pasos hechos"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 18 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, fontWeight: 500, fontFamily: "var(--font-display)", letterSpacing: "-0.5px" } }, routineStreak, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: "var(--text-muted)", marginLeft: 3 } }, "d\xEDas")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10.5, color: "var(--text-subtle)" } }, "Racha")), weightToday != null && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, fontWeight: 500, fontFamily: "var(--font-display)", letterSpacing: "-0.5px" } }, String(weightToday).replace(".", ","), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: "var(--text-muted)", marginLeft: 3 } }, "kg")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10.5, color: "var(--text-subtle)" } }, "Peso")))));
    })()), _mDivider, /* @__PURE__ */ React.createElement("div", null, _mHead("Pr\xF3ximos pagos", "Ver todo", () => navigate("billing")), upcomingBills.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: "var(--text-subtle)", padding: "6px 0" } }, "Sin pagos pr\xF3ximos.") : upcomingBills.slice(0, 4).map((b, i) => /* @__PURE__ */ React.createElement("div", { key: b.id, style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "9px 0",
      borderBottom: i === Math.min(3, upcomingBills.length - 1) ? "none" : "0.5px solid rgba(255,255,255,0.05)"
    } }, /* @__PURE__ */ React.createElement("div", { style: {
      width: 30,
      height: 30,
      borderRadius: 9,
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(158,154,229,0.12)",
      border: "0.5px solid rgba(158,154,229,0.2)",
      color: "var(--accent)",
      fontSize: 13,
      fontWeight: 600,
      fontFamily: "var(--font-display)"
    } }, b.kind === "invoice" ? /* @__PURE__ */ React.createElement(Icon, { name: "receipt", size: 14 }) : (b.name || "?").trim().charAt(0).toUpperCase()), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 500, letterSpacing: "-0.3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, b.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--text-subtle)", marginTop: 1 } }, `${b.date.getDate()} ${_MES3[b.date.getMonth()]} ${b.date.getFullYear()}`)), hideMoney ? /* @__PURE__ */ React.createElement("span", { style: { display: "inline-block", width: 52, height: 13, borderRadius: 999, background: "rgba(255,255,255,0.08)" } }) : /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, fontWeight: 500, fontFamily: "var(--font-display)", letterSpacing: "-0.4px" } }, _eur(b.amount))))), _mDivider, /* @__PURE__ */ React.createElement("div", null, _mHead("Finanzas \xB7 \xFAltimos 6 meses", "Ver", () => navigate("billing")), hideMoney ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: "var(--text-subtle)", padding: "6px 0" } }, "Importes ocultos.") : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10, height: 70, paddingTop: 8 } }, finBars.map((b, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "flex-end", gap: 3, height: 52 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 8, borderRadius: 3, background: "var(--accent)", height: Math.max(3, b.ingreso / finMax * 52) } }), /* @__PURE__ */ React.createElement("div", { style: { width: 8, borderRadius: 3, background: "rgba(255,255,255,0.22)", height: Math.max(3, b.gasto / finMax * 52) } })), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, color: "var(--text-subtle)", textTransform: "capitalize" } }, b.label))))))));
    const _todayTasks = _liveTasks.filter((t) => t.deadline === _todayStr);
    const _doneToday = _todayTasks.filter((t) => t.column === "done").length;
    const _totalToday = _todayTasks.length;
    const _heroChips = [
      ...upcomingEvents.slice(0, 3).map((ev) => ({ icon: ev.icon, title: ev.label, when: formatEventDate(ev.date), tint: "rgba(96,165,250,0.14)", color: "var(--blue)" })),
      ...upcomingBills.slice(0, 3).map((b) => ({ icon: b.kind === "invoice" ? "receipt" : "refresh-cw", title: b.name, when: `${b.date.getDate()} ${_MES3[b.date.getMonth()]}`, tint: "rgba(158,154,229,0.14)", color: "var(--accent)" }))
    ];
    const HeroRing = ({ pct, size = 92, stroke = 7, label, value }) => {
      const r = (size - stroke) / 2, circ = 2 * Math.PI * r, off = circ * (1 - pct / 100);
      return /* @__PURE__ */ React.createElement("div", { style: { position: "relative", width: size, height: size, flexShrink: 0 } }, /* @__PURE__ */ React.createElement("svg", { width: size, height: size, style: { transform: "rotate(-90deg)" } }, /* @__PURE__ */ React.createElement("circle", { cx: size / 2, cy: size / 2, r, fill: "none", stroke: "rgba(255,255,255,0.1)", strokeWidth: stroke }), /* @__PURE__ */ React.createElement(
        "circle",
        {
          cx: size / 2,
          cy: size / 2,
          r,
          fill: "none",
          stroke: "var(--accent)",
          strokeWidth: stroke,
          strokeLinecap: "round",
          strokeDasharray: circ,
          strokeDashoffset: off,
          style: { transition: "stroke-dashoffset .5s" }
        }
      )), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 22, fontWeight: 500, letterSpacing: "-0.8px", fontFamily: "var(--font-display)", lineHeight: 1 } }, value), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9.5, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 3 } }, label)));
    };
    const LayoutFocus = /* @__PURE__ */ React.createElement(React.Fragment, null, KpiRow, /* @__PURE__ */ React.createElement("div", { style: {
      ...APPLE_CARD,
      borderRadius: 24,
      padding: 22,
      background: "linear-gradient(135deg, rgba(158,154,229,0.14) 0%, rgba(255,255,255,0.02) 55%)",
      display: "flex",
      alignItems: "center",
      gap: 30,
      flexShrink: 0
    } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 22, flexShrink: 0 } }, /* @__PURE__ */ React.createElement(
      HeroRing,
      {
        pct: _totalToday ? Math.round(_doneToday / _totalToday * 100) : 0,
        label: "Tareas",
        value: `${_doneToday}/${_totalToday || 0}`
      }
    ), /* @__PURE__ */ React.createElement(HeroRing, { pct: routinePct, label: "Rutina", value: `${routinePct}%` })), /* @__PURE__ */ React.createElement("div", { style: { width: "0.5px", alignSelf: "stretch", background: "rgba(255,255,255,0.08)" } }), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { ...APPLE_SECTION, marginBottom: 12 } }, "Pr\xF3ximo"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 } }, _heroChips.length === 0 ? /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12.5, color: "var(--text-subtle)" } }, "Nada pr\xF3ximo.") : _heroChips.map((c, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: {
      flexShrink: 0,
      minWidth: 150,
      display: "flex",
      alignItems: "center",
      gap: 10,
      background: "rgba(255,255,255,0.04)",
      border: "0.5px solid rgba(255,255,255,0.08)",
      borderRadius: 14,
      padding: "10px 12px"
    } }, /* @__PURE__ */ React.createElement("div", { style: {
      width: 30,
      height: 30,
      borderRadius: 9,
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: c.tint,
      color: c.color
    } }, /* @__PURE__ */ React.createElement(Icon, { name: c.icon, size: 14, strokeWidth: 1.7 })), /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, fontWeight: 500, letterSpacing: "-0.3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, c.title), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-subtle)", marginTop: 1 } }, c.when))))))), /* @__PURE__ */ React.createElement("section", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, height: 320, flexShrink: 0 } }, /* @__PURE__ */ React.createElement(QueuesBlock, { height: "100%" }), /* @__PURE__ */ React.createElement(ProjectsBlock, { height: "100%" })), /* @__PURE__ */ React.createElement("section", { style: { display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 16, height: 192, flexShrink: 0 } }, /* @__PURE__ */ React.createElement(MiniFinanceBlock, null), /* @__PURE__ */ React.createElement(QueuesCountBlock, null)));
    const renderLayout = () => LayoutBento;
    return /* @__PURE__ */ React.createElement("div", { style: {
      display: "flex",
      flexDirection: "column",
      gap: 16,
      minHeight: "100vh",
      overflowY: "auto",
      padding: "28px 32px 40px",
      maxWidth: 1400,
      margin: "0 auto"
    } }, Header, renderLayout());
  };
  var LINK_BTN = {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    height: 28,
    padding: "0 10px",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 500,
    color: "var(--accent)",
    background: "transparent",
    border: 0,
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: "-0.2px"
  };
  var DASH_CARD = {
    background: "transparent",
    border: "none",
    borderRadius: 0,
    boxShadow: "none"
  };
  var DASH_EYEBROW = { fontSize: 11, fontWeight: 600, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.08em" };
  var DashCardShell = ({ eyebrow, title, action, onAction, children, pad = "16px 20px" }) => /* @__PURE__ */ React.createElement("div", { style: { ...DASH_CARD, display: "flex", flexDirection: "column", overflow: "hidden", height: "100%" } }, /* @__PURE__ */ React.createElement("div", { style: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px 12px",
    borderBottom: "0.5px solid rgba(255,255,255,0.06)"
  } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: DASH_EYEBROW }, eyebrow), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 4, fontSize: 15, fontWeight: 500, letterSpacing: "-0.5px" } }, title)), action && /* @__PURE__ */ React.createElement("button", { onClick: onAction, style: LINK_BTN }, action, " ", /* @__PURE__ */ React.createElement(Icon, { name: "arrow", size: 12 }))), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minHeight: 0, padding: pad, display: "flex" } }, children));
  var _goalSkel = (w) => /* @__PURE__ */ React.createElement("span", { style: { display: "inline-block", width: w, height: 13, borderRadius: 999, background: "rgba(255,255,255,0.09)", verticalAlign: "middle" } });
  var GoalBlock = ({ billed, eur, hideMoney }) => {
    const [goal, setGoal] = useState(() => {
      try {
        return Number(localStorage.getItem("141_month_goal")) || 3e3;
      } catch (e) {
        return 3e3;
      }
    });
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState("");
    const pct = goal > 0 ? Math.min(100, Math.round(billed / goal * 100)) : 0;
    const remaining = Math.max(0, goal - billed);
    const startEdit = () => {
      setDraft(String(goal));
      setEditing(true);
    };
    const commit = () => {
      const n = Math.round(Number(String(draft).replace(/[^0-9.,]/g, "").replace(",", ".")) || 0);
      if (n > 0) {
        setGoal(n);
        try {
          localStorage.setItem("141_month_goal", String(n));
        } catch (e) {
        }
      }
      setEditing(false);
    };
    const done = pct >= 100;
    return /* @__PURE__ */ React.createElement(DashCardShell, { eyebrow: "Objetivo", title: "Meta del mes", action: editing ? null : "Editar", onAction: startEdit, pad: "18px 20px" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", width: "100%", justifyContent: "center", gap: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 10 } }, /* @__PURE__ */ React.createElement("span", { style: {
      fontSize: 40,
      fontWeight: 400,
      letterSpacing: "-1.6px",
      lineHeight: 1,
      fontFamily: "var(--font-display)",
      color: done ? "var(--accent)" : "var(--text)"
    } }, pct, "%"), done && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12.5, color: "var(--accent)", letterSpacing: "-0.3px" } }, "\xA1Superado!")), /* @__PURE__ */ React.createElement("div", { style: { height: 9, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { height: "100%", width: pct + "%", background: "var(--accent)", borderRadius: 99, transition: "width .6s cubic-bezier(.2,.8,.2,1)" } })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, letterSpacing: "-0.3px" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-muted)" } }, hideMoney ? _goalSkel(46) : eur(billed), " ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-subtle)", fontSize: 12 } }, "facturado")), editing ? /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 2, color: "var(--text-muted)" } }, "\u20AC", /* @__PURE__ */ React.createElement(
      "input",
      {
        autoFocus: true,
        value: draft,
        onChange: (e) => setDraft(e.target.value.replace(/[^0-9.,]/g, "")),
        onKeyDown: (e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") setEditing(false);
        },
        onBlur: commit,
        style: {
          width: 64,
          background: "rgba(255,255,255,0.06)",
          border: "0.5px solid var(--accent)",
          borderRadius: 8,
          color: "var(--text)",
          fontSize: 13,
          padding: "4px 8px",
          fontFamily: "var(--font-sans)",
          outline: "none",
          textAlign: "right"
        }
      }
    )) : /* @__PURE__ */ React.createElement("button", { onClick: startEdit, style: {
      background: "transparent",
      border: 0,
      cursor: "pointer",
      color: "var(--text-subtle)",
      fontFamily: "inherit",
      fontSize: 12.5,
      letterSpacing: "-0.3px",
      display: "inline-flex",
      alignItems: "center",
      gap: 5
    } }, "meta ", hideMoney ? _goalSkel(40) : eur(goal), " ", /* @__PURE__ */ React.createElement(Icon, { name: "edit-2", size: 11 }))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: done ? "var(--accent)" : "var(--text-subtle)", letterSpacing: "-0.2px" } }, done ? "Objetivo cumplido este mes \u{1F3AF}" : hideMoney ? "Progreso del mes" : `Faltan ${eur(remaining)} para la meta`)));
  };
  var ProjectsProgressBlock = ({ D, navigate, openModal }) => {
    const projs = D.PROJECTS || [];
    return /* @__PURE__ */ React.createElement(DashCardShell, { eyebrow: "En curso", title: "Proyectos", action: "Ver todo", onAction: () => navigate("projects"), pad: "14px 16px" }, projs.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { margin: "auto", fontSize: 12.5, color: "var(--text-subtle)" } }, "Sin proyectos. ", /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => openModal("newProject"),
        style: { background: "transparent", border: 0, color: "var(--accent)", cursor: "pointer", fontSize: 12.5, padding: 0, fontFamily: "inherit", textDecoration: "underline" }
      },
      "Crear uno"
    )) : /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 40, rowGap: 0, width: "100%", alignContent: "start" } }, projs.slice(0, 8).map((p) => {
      const tks = D.TASKS[p.id] || [];
      const live = tks.length ? Math.round(tks.filter((t) => t.column === "done").length / tks.length * 100) : 0;
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          key: p.id,
          onClick: () => navigate("project", { projectId: p.id }),
          onMouseEnter: (e) => e.currentTarget.style.background = "rgba(255,255,255,0.025)",
          onMouseLeave: (e) => e.currentTarget.style.background = "transparent",
          style: {
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "11px 8px",
            cursor: "pointer",
            borderRadius: 8,
            transition: "background .1s"
          }
        },
        /* @__PURE__ */ React.createElement("span", { className: "dot " + (p.light || ""), style: { flexShrink: 0 } }),
        /* @__PURE__ */ React.createElement("span", { style: {
          flex: 1,
          fontSize: 13.5,
          fontWeight: 500,
          letterSpacing: "-0.3px",
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        } }, p.name),
        /* @__PURE__ */ React.createElement("div", { style: { width: 96, height: 7, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden", flexShrink: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { height: "100%", width: live + "%", background: "var(--accent)", borderRadius: 99, transition: "width .5s" } })),
        /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "var(--text-muted)", fontVariantNumeric: "tabular-nums", width: 32, textAlign: "right", flexShrink: 0 } }, live, "%")
      );
    })));
  };
  var EventRow = ({ ev, last, formatEventDate }) => /* @__PURE__ */ React.createElement(
    "div",
    {
      onMouseEnter: (e) => e.currentTarget.style.background = "rgba(255,255,255,0.025)",
      onMouseLeave: (e) => e.currentTarget.style.background = "transparent",
      style: {
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 22px",
        transition: "background .1s",
        borderBottom: last ? "none" : "0.5px solid rgba(255,255,255,0.04)"
      }
    },
    /* @__PURE__ */ React.createElement("div", { style: {
      width: 36,
      height: 36,
      borderRadius: 10,
      flexShrink: 0,
      background: "rgba(255,255,255,0.04)",
      border: "0.5px solid rgba(255,255,255,0.06)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: ev.color || "var(--text-muted)"
    } }, /* @__PURE__ */ React.createElement(Icon, { name: ev.icon, size: 15, strokeWidth: 1.7 })),
    /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: {
      fontSize: 13.5,
      fontWeight: 500,
      letterSpacing: "-0.3px",
      color: "var(--text)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    } }, ev.label), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-subtle)", marginTop: 2, letterSpacing: "-0.2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-muted)" } }, formatEventDate(ev.date), ev.time ? `, ${ev.time}${ev.timeEnd ? ` \u2013 ${ev.timeEnd}` : ""}` : ""), ev.sub ? ` \xB7 ${ev.sub}` : "")),
    /* @__PURE__ */ React.createElement("span", { style: {
      fontSize: 10.5,
      padding: "3px 9px",
      borderRadius: 99,
      background: "rgba(255,255,255,0.05)",
      color: "var(--text-muted)",
      border: "0.5px solid rgba(255,255,255,0.08)",
      letterSpacing: "-0.1px",
      whiteSpace: "nowrap",
      fontWeight: 500
    } }, ev.type)
  );
  var QuickTaskRow = ({ t, D, projName, dateLabel, overdue, last }) => {
    const [checking, setChecking] = useState(false);
    const complete = (e) => {
      e.stopPropagation();
      if (checking) return;
      setChecking(true);
      setTimeout(() => {
        try {
          D.moveTask(t._pid, t.id, "done");
        } catch (err) {
        }
      }, 280);
    };
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        onMouseEnter: (e) => e.currentTarget.style.background = "rgba(255,255,255,0.025)",
        onMouseLeave: (e) => e.currentTarget.style.background = "transparent",
        style: {
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 22px",
          transition: "background .1s",
          borderBottom: last ? "none" : "0.5px solid rgba(255,255,255,0.04)"
        }
      },
      /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: complete,
          title: "Completar",
          style: {
            width: 26,
            height: 26,
            borderRadius: "50%",
            flexShrink: 0,
            padding: 0,
            cursor: "pointer",
            border: checking ? "1px solid var(--accent)" : "1.5px solid rgba(255,255,255,0.22)",
            background: checking ? "var(--accent)" : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all .15s"
          }
        },
        checking && /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 14, style: { color: "#fff" } })
      ),
      /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: {
        fontSize: 13.5,
        fontWeight: 500,
        letterSpacing: "-0.3px",
        color: checking ? "var(--text-subtle)" : "var(--text)",
        textDecoration: checking ? "line-through" : "none",
        transition: "color .15s",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      } }, t.title), /* @__PURE__ */ React.createElement("div", { style: {
        fontSize: 12,
        color: "var(--text-subtle)",
        marginTop: 2,
        letterSpacing: "-0.2px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      } }, projName, dateLabel ? /* @__PURE__ */ React.createElement("span", { style: { color: overdue ? "var(--red)" : "var(--text-muted)" } }, " \xB7 ", dateLabel) : ""))
    );
  };
  var _BILL_MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  var BillRow = ({ b, hideMoney, eur, onClick, last }) => {
    const d = b.date;
    const dateStr = `${d.getDate()} ${_BILL_MESES[d.getMonth()]} ${d.getFullYear()}`;
    const initial = (b.name || "?").trim().charAt(0).toUpperCase();
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        onClick,
        onMouseEnter: (e) => e.currentTarget.style.background = "rgba(255,255,255,0.025)",
        onMouseLeave: (e) => e.currentTarget.style.background = "transparent",
        style: {
          display: "flex",
          alignItems: "center",
          gap: 13,
          padding: "12px 8px",
          cursor: "pointer",
          transition: "background .1s",
          borderRadius: 8,
          borderBottom: last ? "none" : "0.5px solid rgba(255,255,255,0.05)"
        }
      },
      /* @__PURE__ */ React.createElement("div", { style: {
        width: 36,
        height: 36,
        borderRadius: 10,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(158,154,229,0.12)",
        border: "0.5px solid rgba(158,154,229,0.2)",
        color: "var(--accent)",
        fontSize: 14,
        fontWeight: 600,
        fontFamily: "var(--font-display)"
      } }, b.kind === "invoice" ? /* @__PURE__ */ React.createElement(Icon, { name: "receipt", size: 15, strokeWidth: 1.7 }) : initial),
      /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: {
        fontSize: 13.5,
        fontWeight: 500,
        letterSpacing: "-0.3px",
        color: "var(--text)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      } }, b.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-subtle)", marginTop: 2, letterSpacing: "-0.2px" } }, dateStr)),
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 } }, hideMoney ? /* @__PURE__ */ React.createElement("span", { style: { display: "inline-block", width: 56, height: 14, borderRadius: 999, background: "rgba(255,255,255,0.08)" } }) : /* @__PURE__ */ React.createElement("span", { style: {
        fontSize: 15,
        fontWeight: 500,
        letterSpacing: "-0.4px",
        color: "var(--text)",
        fontFamily: "var(--font-display)",
        fontVariantNumeric: "tabular-nums"
      } }, eur(b.amount)), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, color: "var(--text-subtle)", letterSpacing: "-0.1px", whiteSpace: "nowrap" } }, b.kind === "invoice" ? "Por cobrar" : "Programado"))
    );
  };
  window.AgencyDashboard = AgencyDashboard;
})();

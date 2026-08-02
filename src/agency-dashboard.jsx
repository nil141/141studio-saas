// Agency Dashboard — 141'STUDIO MVP

// ── Número con animación de conteo (0 → valor, easeOutCubic) ──
// A nivel de módulo para que no se reinicie en cada render del componente.
const AnimatedValue = ({ num, fmt }) => {
  const [disp, setDisp] = React.useState(0);
  const raf = React.useRef();
  useEffect(() => {
    cancelAnimationFrame(raf.current);
    const to = Number(num) || 0;
    const dur = 700;
    const ease = t => 1 - Math.pow(1 - t, 3);
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

// ── Date helpers ─────────────────────────────────────────────
const parseSpanishDate = (str) => {
  if (!str || str === "—") return null;
  const M = {ene:0,feb:1,mar:2,abr:3,may:4,jun:5,jul:6,ago:7,sep:8,oct:9,nov:10,dic:11};
  const parts = str.trim().toLowerCase().split(/[\s\/\-]+/);
  if (parts.length < 2) return null;
  const day = parseInt(parts[0]);
  const mon = M[parts[1].slice(0,3)];
  if (isNaN(day) || mon === undefined) return null;
  return new Date(new Date().getFullYear(), mon, day);
};

// ── Icon badge ────────────────────────────────────────────────
const IconBadge = ({ icon }) => (
  <div style={{
    width: 38, height: 38, borderRadius: 10,
    background: "var(--bg-elev-2)",
    border: "0.5px solid var(--border)",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
    color: "var(--text-muted)",
  }}>
    <Icon name={icon} size={18} strokeWidth={1.6}/>
  </div>
);

// ── Dashboard ────────────────────────────────────────────────
const AgencyDashboard = ({ openModal, navigate, session }) => {
  const D = window.Data;
  D.useStore();

  // Reloj en vivo — se actualiza cada segundo
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const greeting = (() => {
    const h = now.getHours();
    if (h < 6)  return "Buenas noches";
    if (h < 13) return "Buenos días";
    if (h < 21) return "Buenas tardes";
    return "Buenas noches";
  })();

  const todayStr = (() => {
    const dias  = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
    const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
    return `${dias[now.getDay()]} ${now.getDate()} de ${meses[now.getMonth()]}`;
  })();

  const timeStr = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}:${String(now.getSeconds()).padStart(2,"0")}`;

  const agencyName     = D.SETTINGS.name || "141'STUDIO";
  const adminEmail     = D.SETTINGS.email || "nil@141agency.com";
  const adminName      = (() => { const n = adminEmail.split("@")[0]; return n.charAt(0).toUpperCase() + n.slice(1); })();
  const activeProjects = D.PROJECTS.length;
  // Solo tareas "vivas": de proyectos existentes + sueltas (__none__). Excluye
  // huérfanas de proyectos borrados, que inflaban el contador de pendientes.
  const _projIds = new Set(D.PROJECTS.map(p => p.id));
  const _liveTasks = Object.entries(D.TASKS)
    .filter(([pid]) => pid === "__none__" || _projIds.has(pid))
    .flatMap(([, arr]) => arr);
  const _todayStr = D.today ? D.today()
    : `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
  const _pending  = _liveTasks.filter(t => t.column !== "done");
  // Pendientes conservando su projectId (para poder completarlas desde el panel)
  const _pendingWithPid = Object.entries(D.TASKS)
    .filter(([pid]) => pid === "__none__" || _projIds.has(pid))
    .flatMap(([pid, arr]) => arr.filter(t => t.column !== "done").map(t => ({ ...t, _pid: pid })))
    .sort((a, b) => {
      const da = a.deadline || "9999-99-99", db = b.deadline || "9999-99-99";
      return da < db ? -1 : da > db ? 1 : 0;
    });
  // "Tareas pendientes" del panel = las de HOY: vencen hoy o son atrasadas que
  // se arrastran (misma lógica que el tablero de Tareas) + pasos de rutina de
  // hoy que aún no están hechos.
  const _routinePending = (D.routinesForDay(_todayStr) || []).reduce(
    (n, r) => n + (r.items || []).filter(it => !D.routineItemDone(r.id, _todayStr, it.id)).length, 0
  );
  const pendingTasks = _pending.filter(t => t.deadline && t.deadline <= _todayStr).length + _routinePending;
  const overdueTasks = _pending.filter(t => t.deadline && t.deadline < _todayStr).length;
  const backlogTasks = _pending.length;   // todas las incompletas (para la cola de trabajo)
  const pendingInvoices = D.INVOICES.filter(i => i.status !== "paid").length;
  const atRisk = D.PROJECTS.filter(p => p.light === "red").length;
  const capacity = activeProjects <= 3 ? "green" : activeProjects <= 4 ? "amber" : "red";
  const capacityLabel = activeProjects === 0 ? "Sin proyectos"
    : activeProjects <= 3 ? "Capacidad cómoda"
    : activeProjects <= 4 ? "Capacidad media" : "Al límite";

  // ── Mensaje bajo el saludo: "Hoy es [fecha] y son las [hora]." ──
  const dayMessage = `Hoy es ${todayStr} y son las ${timeStr}`;

  // ── Stripe ──
  const [stripeMonth, setStripeMonth] = useState(null);
  const [stripePrev, setStripePrev]   = useState(null);   // mes anterior (para la comparativa)
  useEffect(() => {
    const now = new Date();
    const monthStart = Math.floor(new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000);
    const prevStart  = Math.floor(new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime() / 1000);
    window.apiFetch("/api/stripe/invoices", { limit: 100 })
      .then(r => r.json())
      .then(res => {
        if (!res.ok) { setStripeMonth(false); return; }
        const paid = (res.invoices || []).filter(i => i.status === "paid");
        setStripeMonth(paid.filter(i => i.created >= monthStart).reduce((a,b) => a+(b.amount_paid??b.amount??0), 0));
        setStripePrev(paid.filter(i => i.created >= prevStart && i.created < monthStart).reduce((a,b) => a+(b.amount_paid??b.amount??0), 0));
      })
      .catch(() => setStripeMonth(false));
  }, []);

  // ── Próximos eventos (solo lo que está por venir: reuniones, cobros, entregas, facturas) ──
  const upcomingEvents = React.useMemo(() => {
    const ev = [];
    const todayMid = new Date(); todayMid.setHours(0,0,0,0);

    // Entregas de proyectos (con deadline futuro)
    D.PROJECTS.forEach(p => {
      const d = parseSpanishDate(p.deadline);
      if (d) ev.push({ date: d, label: p.name, sub: p.clientName, type: "Entrega",
        color: p.light==="red"?"var(--red)":p.light==="amber"?"var(--amber)":"var(--green)",
        icon: "folder" });
    });

    // Facturas pendientes de cobro
    D.INVOICES.filter(i => i.status !== "paid").forEach(i => {
      const d = parseSpanishDate(i.due);
      if (d) ev.push({ date: d, label: i.id, sub: `${i.client} · €${i.amount}`, type: "Factura",
        color: i.status==="overdue"?"var(--red)":"var(--amber)", icon: "receipt" });
    });

    // Cobros de suscripciones (siguiente renovación desde Gastos)
    try {
      const fin = (window.Data && window.Data.FINANCE) || {};
      (fin.subs || []).filter(s => s.active !== false && s.nextRenewal).forEach(s => {
        let d = new Date(s.nextRenewal + "T00:00:00");
        if (isNaN(d)) return;
        // Si la fecha ya pasó, avanzamos al siguiente ciclo hasta que sea futura
        let guard = 0;
        while (d < todayMid && guard < 60) {
          if (s.cycle === "yearly") d.setFullYear(d.getFullYear() + 1);
          else d.setMonth(d.getMonth() + 1);
          guard++;
        }
        const amount = Number(s.amount) || 0;
        ev.push({
          date: d, label: s.name,
          sub: `Cobro · €${amount.toLocaleString("es-ES")} · ${s.cycle === "yearly" ? "anual" : "mensual"}`,
          type: "Suscripción", color: "var(--accent)", icon: "refresh-cw",
        });
      });
    } catch (err) {}

    // Eventos personalizados de Agenda (reuniones, etc.)
    try {
      const custom = JSON.parse(localStorage.getItem("agenda_custom_events") || "[]");
      custom.forEach(e => {
        if (!e.date) return;
        const d = new Date(e.date + "T00:00:00");
        if (isNaN(d)) return;
        const iconMap  = { meeting:"users", task:"list-todo", custom:"calendar" };
        const colorMap = { meeting:"var(--red)", task:"var(--accent)", custom:"var(--blue)" };
        const typeLabel= { meeting:"Reunión", task:"Tarea", custom:"Evento" };
        ev.push({
          date: d, label: e.title,
          time: e.time || null, timeEnd: e.timeEnd || null,
          type: typeLabel[e.type] || "Evento",
          color: colorMap[e.type] || "var(--blue)",
          icon: iconMap[e.type] || "calendar",
        });
      });
    } catch(err) {}

    // Solo los próximos 7 días (hoy incluido)
    return ev
      .filter(e => {
        const dMid = new Date(e.date); dMid.setHours(0,0,0,0);
        const diff = Math.round((dMid - todayMid) / 86400000);
        return diff >= 0 && diff <= 7;
      })
      .sort((a,b) => a.date - b.date)
      .slice(0, 8);
  }, [D.PROJECTS, D.INVOICES, D.TASKS, D.FINANCE]);

  // Próximos pagos: suscripciones (siguiente renovación) + facturas por cobrar
  const upcomingBills = React.useMemo(() => {
    const out = [];
    const todayMid = new Date(); todayMid.setHours(0, 0, 0, 0);
    try {
      const fin = (window.Data && window.Data.FINANCE) || {};
      (fin.subs || []).filter(s => s.active !== false && s.nextRenewal).forEach(s => {
        let d = new Date(s.nextRenewal + "T00:00:00");
        if (isNaN(d)) return;
        let guard = 0;
        while (d < todayMid && guard < 60) {
          if (s.cycle === "yearly") d.setFullYear(d.getFullYear() + 1); else d.setMonth(d.getMonth() + 1);
          guard++;
        }
        out.push({ id: "sub:" + (s.id || s.name), name: s.name || "Suscripción", date: new Date(d),
          amount: Number(s.amount) || 0, cycle: s.cycle === "yearly" ? "anual" : "mensual", kind: "sub" });
      });
    } catch (e) {}
    (D.INVOICES || []).filter(i => i.status !== "paid").forEach(i => {
      const d = parseSpanishDate(i.due);
      if (d) out.push({ id: "inv:" + i.id, name: i.client || i.id, date: d,
        amount: Number(i.amount) || 0, kind: "invoice" });
    });
    return out.sort((a, b) => a.date - b.date).slice(0, 6);
  }, [D.INVOICES, D.FINANCE]);

  const formatEventDate = (d) => {
    const todayMid = new Date(); todayMid.setHours(0,0,0,0);
    const dMid = new Date(d);   dMid.setHours(0,0,0,0);
    const diff = Math.round((dMid - todayMid) / 86400000);
    if (diff < 0)  return `hace ${Math.abs(diff)}d`;
    if (diff === 0) return "Hoy";
    if (diff === 1) return "Mañana";
    const dias  = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
    const meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
    return `${dias[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]}`;
  };

  // ── KPI config ──
  // "Gastado este mes" — igual que la página de Gastos: en el mes actual solo
  // cuentan las suscripciones ya cobradas (día de renovación ≤ hoy); en meses
  // pasados, el recurrente completo.
  const _spendForMonth = (offset = 0) => {
    try {
      const fin = (window.Data && window.Data.FINANCE) || {};
      const base = new Date(), today = base.getDate();
      const isCurrent = offset === 0;
      const rec = (fin.subs || []).filter(s => s.active !== false).reduce((a, s) => {
        if (!isCurrent) return a + (s.cycle === "yearly" ? (Number(s.amount) || 0) / 12 : (Number(s.amount) || 0));
        // mes actual: solo lo ya cobrado hasta hoy
        if (s.cycle === "yearly") {
          if (!s.nextRenewal) return a;
          const d = new Date(s.nextRenewal + "T00:00:00");
          return a + ((!isNaN(d) && d.getMonth() === base.getMonth() && d.getDate() <= today) ? (Number(s.amount) || 0) : 0);
        }
        const day = s.nextRenewal ? new Date(s.nextRenewal + "T00:00:00").getDate() : 1;
        return a + (day <= today ? (Number(s.amount) || 0) : 0);
      }, 0);
      const y = base.getFullYear(), m = base.getMonth() + offset;
      const ref = new Date(y, m, 1);
      const exp = (fin.expenses || []).filter(e => {
        if (!e.date) return false;
        const d = new Date(e.date);
        return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
      }).reduce((a, e) => a + (Number(e.amount) || 0), 0);
      return rec + exp;
    } catch { return 0; }
  };
  const monthSpend     = _spendForMonth(0);
  const lastMonthSpend = _spendForMonth(-1);
  const prevMonthLabel = new Date(now.getFullYear(), now.getMonth() - 1, 1).toLocaleString("es-ES", { month: "short" });
  const _pctDelta = (cur, prev) => (prev > 0 ? Math.round(((cur - prev) / prev) * 100) : null);
  const spendDelta   = _pctDelta(monthSpend, lastMonthSpend);

  // Facturado como en la página de Facturación: mensualidades activas + cobros
  // manuales (con IVA, de 141_income_v1) además de las facturas de Stripe.
  const _incMonth = (offset = 0) => {
    try {
      const d = JSON.parse(localStorage.getItem("141_income_v1")) || {};
      const vatOf   = (x) => (x.vat === undefined || x.vat === null ? 21 : Number(x.vat));
      const irpfOf  = (x) => (x.irpf === undefined || x.irpf === null ? 0 : Number(x.irpf));
      // Neto (base + IVA − IRPF), igual que la página de Facturación
      const withVat = (x) => (Number(x.amount) || 0) * (1 + vatOf(x) / 100 - irpfOf(x) / 100);
      const ref = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      const key    = `${ref.getFullYear()}-${String(ref.getMonth() + 1).padStart(2, "0")}`;
      const nowKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const pun = (d.incomes || []).filter(i => (i.date || "").startsWith(key)).reduce((a, i) => a + withVat(i), 0);
      const rec = (d.recs || []).filter(r => r.active).filter(r => {
        const start = r.nextCharge && r.nextCharge.slice(0, 7) < nowKey ? r.nextCharge.slice(0, 7) : nowKey;
        return start <= key;
      }).reduce((a, r) => a + (r.cycle === "yearly" ? withVat(r) / 12 : withVat(r)), 0);
      return pun + rec;
    } catch { return 0; }
  };
  const facturadoCur  = (stripeMonth === null || stripeMonth === false ? 0 : stripeMonth / 100) + _incMonth(0);
  const facturadoPrev = ((stripePrev || 0) / 100) + _incMonth(-1);

  // ── Datos de los widgets de la fila inferior ──────────────────────────────
  // Rutina de hoy: % medio de los pasos, racha y peso registrado
  const _routToday = (D.routinesForDay ? D.routinesForDay(_todayStr) : []) || [];
  let _rSteps = 0, _rSum = 0, weightToday = null;
  _routToday.forEach(r => (r.items || []).forEach(it => {
    _rSteps++;
    _rSum += (D.routineItemProgress ? D.routineItemProgress(r.id, _todayStr, it.id) : 0);
    if ((it.text || "").toLowerCase().includes("peso")) {
      const lg = D.routineItemLog ? D.routineItemLog(r.id, _todayStr, it.id) : null;
      if (lg && lg.weight != null) weightToday = lg.weight;
    }
  }));
  const routinePct    = _rSteps ? Math.round(_rSum / _rSteps) : 0;
  const routineDone   = _rSteps ? _routToday.reduce((n, r) => n + (r.items || []).filter(it => D.routineItemDone(r.id, _todayStr, it.id)).length, 0) : 0;
  const routineStreak = (_routToday[0] && D.routineStreak) ? D.routineStreak(_routToday[0].id, _todayStr) : 0;

  // Mini-finanzas: últimos 6 meses (facturado neto vs gastado)
  const _MES3 = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  const finBars = [];
  for (let o = -5; o <= 0; o++) {
    const ref = new Date(now.getFullYear(), now.getMonth() + o, 1);
    finBars.push({
      label:   _MES3[ref.getMonth()],
      gasto:   _spendForMonth(o),
      ingreso: o === 0 ? facturadoCur : _incMonth(o),
    });
  }
  const finMax = Math.max(1, ...finBars.map(b => Math.max(b.gasto, b.ingreso)));
  // Serie para el gráfico estilo Facturación (línea de facturado, últimos 6 meses)
  const _MESFULL = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  const finTrend = finBars.map((b, i) => {
    const ref = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return { key: `${ref.getFullYear()}-${ref.getMonth()}`, label: b.label,
      full: `${_MESFULL[ref.getMonth()]} ${ref.getFullYear()}`, total: b.ingreso };
  });

  // Comparativa: {text, suffix, dir, tone} para el indicador estilo outdomode
  const _countDelta = (n, word) => n > 0
    ? { text: String(n), suffix: word, dir: "down", tone: "bad" }
    : { text: "0", suffix: word, dir: "flat", tone: "muted" };
  const _pctToDelta = (pct, goodUp, suffix) => {
    if (pct === null) return { text: "—", suffix, dir: "flat", tone: "muted" };
    const up = pct > 0, down = pct < 0;
    const good = up === goodUp;
    return {
      text: `${up ? "+" : down ? "−" : ""}${Math.abs(pct)}%`,
      suffix, dir: up ? "up" : down ? "down" : "flat",
      tone: (up || down) ? (good ? "good" : "bad") : "muted",
    };
  };

  // % de completado de un día (tareas con fecha ese día + pasos de rutina)
  const _dayCompletion = (dateStr) => {
    const tks = _liveTasks.filter(t => t.deadline === dateStr);
    let done = tks.filter(t => t.column === "done").length;
    let total = tks.length;
    (D.routinesForDay ? D.routinesForDay(dateStr) : []).forEach(r => (r.items || []).forEach(it => {
      total += 1; if (D.routineItemDone(r.id, dateStr, it.id)) done += 1;
    }));
    return total ? Math.round((done / total) * 100) : 0;
  };
  const _yestStr = (() => {
    const d = new Date(_todayStr + "T12:00:00"); d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  })();
  const _tasksDayDelta = _dayCompletion(_todayStr) - _dayCompletion(_yestStr); // puntos %

  const [hoverKpi, setHoverKpi] = useState(null);
  const [hideMoney, setHideMoney] = useState(() => {
    try { return localStorage.getItem("141_hide_money") === "1"; } catch { return false; }
  });
  const toggleMoney = () => setHideMoney(v => {
    const n = !v;
    try { localStorage.setItem("141_hide_money", n ? "1" : "0"); } catch {}
    return n;
  });
  const [layout, setLayout] = useState(() => {
    try { return localStorage.getItem("141_home_layout") || "bento"; } catch { return "bento"; }
  });
  const setLayoutSaved = (id) => { setLayout(id); try { localStorage.setItem("141_home_layout", id); } catch {} };
  const LAYOUTS = [{ id: "bento", label: "Bento" }, { id: "minimal", label: "Minimal" }, { id: "focus", label: "Focus" }];
  const _eur = n => `€${(Number(n)||0).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const _int = n => String(Math.round(Number(n)||0));
  const kpis = [
    {
      label:  "Proyectos activos",
      value:  activeProjects,
      num:    activeProjects, fmt: _int,
      delta:  _countDelta(atRisk, "en riesgo"),
      nav:    "projects",
    },
    {
      label:  "Tareas pendientes",
      value:  pendingTasks,
      num:    pendingTasks, fmt: _int,
      delta:  _pctToDelta(_tasksDayDelta, true, "vs ayer"),
      nav:    "tasks",
    },
    {
      label:  "Gastado este mes",
      value:  `€${monthSpend.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      num:    monthSpend, fmt: _eur,
      delta:  _pctToDelta(spendDelta, false, `vs ${prevMonthLabel}`),
      nav:    "billing", money: true,
    },
    {
      label:  "Facturado este mes",
      value:  stripeMonth===null?"…":`€${facturadoCur.toLocaleString("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2})}`,
      num:    stripeMonth===null ? null : facturadoCur, fmt: _eur,
      delta:  stripeMonth===null ? { text:"—", dir:"flat", tone:"muted" }
                : facturadoPrev > 0
                  ? _pctToDelta(_pctDelta(facturadoCur, facturadoPrev), true, `vs ${prevMonthLabel}`)
                  : facturadoCur > 0
                    ? { text:"+100%", suffix:`vs ${prevMonthLabel}`, dir:"up", tone:"good" }
                    : { text:"0%", suffix:`vs ${prevMonthLabel}`, dir:"flat", tone:"muted" },
      nav:    "income", money: true,
    },
  ];

  // ── Queues ──
  const queues = [
    { icon:"list-todo", label:"Tareas sin completar",  count:backlogTasks,    action:()=>navigate("projects") },
    { icon:"clock",     label:"Tareas vencidas",        count:overdueTasks,    action:()=>navigate("projects") },
    { icon:"flag",      label:"Proyectos en riesgo",    count:atRisk,          action:()=>navigate("projects") },
    { icon:"receipt",   label:"Facturas pendientes",    count:pendingInvoices, action:()=>navigate("invoices") },
  ];

  // ───────────────────────────────────────────────────────────────────────────
  // Apple HIG style — tokens locales (vibrancy / continuous radius / SF system)
  // ───────────────────────────────────────────────────────────────────────────
  // Sin "cajitas": las secciones van directas sobre el fondo, como en las
  // páginas de Facturación/Proyectos/Tareas. Un separador fino bajo el título.
  const APPLE_CARD = {
    background: "transparent",
    border: "none",
    borderRadius: 0,
    boxShadow: "none",
  };
  const APPLE_SECTION = {
    fontSize: 11, fontWeight: 600, color: "var(--text-subtle)",
    textTransform: "uppercase", letterSpacing: "0.08em",
  };

  // ── Cabecera común (saludo + acción rápida) ──────────────────────────────
  const Header = (
    <header style={{ display: "flex", flexDirection: "column", gap: 20, flexShrink: 0,
      paddingBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h1 style={{
            fontSize: 36, fontWeight: 400, letterSpacing: "-1.2px", lineHeight: 1.05,
            margin: 0, fontFamily: "var(--font-display)", color: "var(--text)",
          }}>{greeting}, {adminName}.</h1>
          <p style={{
            margin: 0, fontSize: 14, color: "var(--text-muted)", letterSpacing: "-0.2px", lineHeight: 1.4,
          }}>
            {dayMessage}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Ocultar / mostrar importes */}
          <div style={{ display: "flex", alignItems: "center", padding: "3px 4px",
            background: "rgba(255,255,255,0.07)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 99 }}>
            <button
              onClick={toggleMoney}
              title={hideMoney ? "Mostrar importes" : "Ocultar importes"}
              style={{ width: 34, height: 34, borderRadius: "50%", background: "transparent", border: "none",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                color: hideMoney ? "var(--accent)" : "var(--text-muted)", transition: "background .12s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <Icon name={hideMoney ? "eye-off" : "eye"} size={16}/>
            </button>
          </div>

          <ActionPill
            plusActions={[
              { icon: "plus",    label: "Nueva tarea",    sub: "Añade una tarea rápida.",  accent: true, onClick: () => openModal("newTask") },
              { icon: "folder",  label: "Nuevo proyecto", sub: "Crea un proyecto.",        onClick: () => openModal("newProject") },
              { icon: "users",   label: "Nuevo cliente",  sub: "Añade una ficha o portal.", onClick: () => openModal("newClient") },
              { icon: "receipt", label: "Nueva factura",  sub: "Se crea y envía desde Stripe.", onClick: () => openModal("newInvoice") },
            ]}
          />
        </div>
      </div>
    </header>
  );

  const EYEBROW = (txt) => <div style={APPLE_SECTION}>{txt}</div>;

  // ── Activity reciente (datos compartidos para varias vistas) ─────────────
  const recentActivity = [
    ...D.PROJECTS.slice(0, 2).map(p => ({ icon: "folder", text: p.name, sub: "Proyecto en curso" })),
    ...D.CLIENTS.slice(0, 2).map(c => ({ icon: "users", text: c.company, sub: c.service || "Cliente" })),
    ...(D.INVOICES || []).slice(0, 1).map(i => ({ icon: "receipt", text: i.client, sub: "Factura " + (i.status || "—") })),
  ].slice(0, 5);

  // KPI tile compartido (estilo Apple)
  const renderKpiTile = (k, i) => (
    <div key={i} style={{ ...APPLE_CARD, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: "rgba(158,154,229,0.12)",
          border: "0.5px solid rgba(158,154,229,0.18)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--accent)",
        }}>
          <Icon name={k.icon} size={15} strokeWidth={1.7}/>
        </div>
      </div>
      <div>
        <div style={{
          fontSize: typeof k.value === "string" && k.value.startsWith("€") ? 22 : 28,
          fontWeight: 400, lineHeight: 1, letterSpacing: "-1.1px",
          fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-display)",
          color: "var(--text)",
        }}>{k.num != null ? <AnimatedValue num={k.num} fmt={k.fmt}/> : k.value}</div>
        <div style={{
          marginTop: 8, fontSize: 12, color: "var(--text-muted)",
          fontWeight: 500, letterSpacing: "-0.3px",
        }}>{k.label}</div>
        <div style={{
          marginTop: 3, fontSize: 11, color: "var(--text-subtle)", letterSpacing: "-0.2px",
        }}>{k.sub}</div>
      </div>
    </div>
  );

  // Mini KPI compacto (para variantes densas)
  const renderMiniKpi = (k, i) => (
    <div key={i} style={{ ...APPLE_CARD, padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 11.5, color: "var(--text-muted)", letterSpacing: "-0.2px" }}>{k.label}</span>
        <Icon name={k.icon} size={12} strokeWidth={1.7} style={{ color: "var(--text-subtle)" }}/>
      </div>
      <div style={{
        fontSize: typeof k.value === "string" && k.value.startsWith("€") ? 18 : 22,
        fontWeight: 400, letterSpacing: "-0.8px", fontFamily: "var(--font-display)",
        fontVariantNumeric: "tabular-nums", lineHeight: 1,
      }}>{k.num != null ? <AnimatedValue num={k.num} fmt={k.fmt}/> : k.value}</div>
    </div>
  );

  // Bloques reutilizables
  const AgendaBlock = ({ height = 360, slice = 8 }) => (
    <div style={{ ...APPLE_CARD, display: "flex", flexDirection: "column", overflow: "hidden", height }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "2px 4px 14px", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
        <div>
          {EYEBROW("Próximamente")}
          <div style={{ marginTop: 4, fontSize: 15, fontWeight: 500, letterSpacing: "-0.5px" }}>Agenda</div>
        </div>
        <button onClick={() => navigate("agenda")} className="go-btn" style={LINK_BTN} title="Ver todo"><Icon name="arrow" size={15}/></button>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {upcomingEvents.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center" }}>
            <Empty icon="check" title="Sin eventos próximos" sub="Todo al día por ahora."/>
          </div>
        ) : upcomingEvents.slice(0, slice).map((ev, i) => (
          <EventRow key={i} ev={ev} last={i === Math.min(slice - 1, upcomingEvents.length - 1)} formatEventDate={formatEventDate}/>
        ))}
      </div>
    </div>
  );

  const fmtTaskDate = (ds) => {
    if (!ds) return "";
    const d = new Date(ds + "T00:00:00");
    return isNaN(d) ? "" : formatEventDate(d);
  };
  const QueuesBlock = ({ height = 360 }) => (
    <div style={{ ...APPLE_CARD, display: "flex", flexDirection: "column", overflow: "hidden", height }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "2px 4px 14px", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
        <div>
          {EYEBROW("Pendiente")}
          <div style={{ marginTop: 4, fontSize: 15, fontWeight: 500, letterSpacing: "-0.5px" }}>Tareas rápidas</div>
        </div>
        <button onClick={() => navigate("tasks")} className="go-btn" style={LINK_BTN} title="Ver todo"><Icon name="arrow" size={15}/></button>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {_pendingWithPid.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center" }}>
            <Empty icon="check" title="Todo hecho" sub="No te queda nada pendiente."/>
          </div>
        ) : _pendingWithPid.slice(0, 12).map((t, i) => (
          <QuickTaskRow key={t.id} t={t} D={D}
            last={i === Math.min(11, _pendingWithPid.length - 1)}
            projName={(D.PROJECTS.find(p => p.id === t._pid) || {}).name || t.clientName || "General"}
            dateLabel={fmtTaskDate(t.deadline)}
            overdue={t.deadline && t.deadline < _todayStr}/>
        ))}
      </div>
    </div>
  );

  const ProjectsBlock = ({ height = 360 }) => (
    <div style={{ ...APPLE_CARD, display: "flex", flexDirection: "column", overflow: "hidden", height }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "2px 4px 14px", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
        <div>
          {EYEBROW("Próximos")}
          <div style={{ marginTop: 4, fontSize: 15, fontWeight: 500, letterSpacing: "-0.5px" }}>Pagos y suscripciones</div>
        </div>
        <button onClick={() => navigate("billing")} className="go-btn" style={LINK_BTN} title="Ver todo"><Icon name="arrow" size={15}/></button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "6px 4px" }}>
        {upcomingBills.length === 0 ? (
          <div style={{ padding: 30, textAlign: "center" }}>
            <Empty icon="check" title="Sin pagos próximos" sub="No hay cobros ni facturas pendientes."/>
          </div>
        ) : upcomingBills.map((b, i) => (
          <BillRow key={b.id} b={b} hideMoney={hideMoney} eur={_eur}
            last={i === upcomingBills.length - 1} onClick={() => navigate("billing")}/>
        ))}
      </div>
    </div>
  );

  // ── Widgets de la fila inferior ───────────────────────────────────────────
  const WidgetCard = ({ eyebrow, title, action, onAction, children, pad = "16px 20px" }) => (
    <div style={{ ...APPLE_CARD, display: "flex", flexDirection: "column", overflow: "hidden", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "2px 4px 12px", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
        <div>
          {EYEBROW(eyebrow)}
          <div style={{ marginTop: 4, fontSize: 15, fontWeight: 500, letterSpacing: "-0.5px" }}>{title}</div>
        </div>
        {action && <button onClick={onAction} className="go-btn" style={LINK_BTN} title={typeof action === "string" ? action : "Ver todo"}><Icon name="arrow" size={15}/></button>}
      </div>
      <div style={{ flex: 1, minHeight: 0, padding: pad, display: "flex" }}>{children}</div>
    </div>
  );

  // Rutina de hoy — anillo de progreso + racha + peso
  const RoutineTodayBlock = () => {
    const r = 26, circ = 2 * Math.PI * r, off = circ * (1 - routinePct / 100);
    if (_routToday.length === 0) return (
      <WidgetCard eyebrow="Hábitos" title="Rutina de hoy" action="Ver" onAction={() => navigate("tasks")}>
        <div style={{ margin: "auto", textAlign: "center", color: "var(--text-subtle)", fontSize: 12.5 }}>Sin rutina para hoy.</div>
      </WidgetCard>
    );
    return (
      <WidgetCard eyebrow="Hábitos" title="Rutina de hoy" action="Ver" onAction={() => navigate("tasks")}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, width: "100%" }}>
          <div style={{ position: "relative", width: 68, height: 68, flexShrink: 0 }}>
            <svg width="68" height="68" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="34" cy="34" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5"/>
              <circle cx="34" cy="34" r={r} fill="none" stroke="var(--accent)" strokeWidth="5" strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={off} style={{ transition: "stroke-dashoffset .5s" }}/>
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 500, letterSpacing: "-0.5px", fontFamily: "var(--font-display)" }}>{routinePct}%</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, color: "var(--text-muted)", letterSpacing: "-0.2px" }}>
              {routineDone}/{_rSteps} pasos hechos
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: "-0.6px", fontFamily: "var(--font-display)", color: "var(--text)" }}>
                  {routineStreak}<span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 3 }}>días</span>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-subtle)" }}>Racha</div>
              </div>
              {weightToday != null && (
                <div>
                  <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: "-0.6px", fontFamily: "var(--font-display)", color: "var(--text)" }}>
                    {String(weightToday).replace(".", ",")}<span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 3 }}>kg</span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-subtle)" }}>Peso hoy</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </WidgetCard>
    );
  };

  // Mini-finanzas — mismo gráfico (línea + área) que la página de Facturación
  const MiniFinanceBlock = () => {
    const FinTrend = window.FinTrendChart;
    return (
    <WidgetCard eyebrow="Últimos 6 meses" title="Facturado" action="Ver" onAction={() => navigate("billing")} pad="10px 4px 4px">
      {hideMoney ? (
        <div style={{ margin: "auto", textAlign: "center", color: "var(--text-subtle)", fontSize: 12.5 }}>Importes ocultos</div>
      ) : FinTrend ? (
        <div style={{ display: "flex", width: "100%", minHeight: 0 }}><FinTrend trend={finTrend} single/></div>
      ) : (
        <div style={{ margin: "auto", color: "var(--text-subtle)", fontSize: 12.5 }}>…</div>
      )}
    </WidgetCard>
    );
  };

  // Colas de trabajo — contadores compactos 2×2
  const QueuesCountBlock = () => (
    <WidgetCard eyebrow="Pendiente" title="Colas de trabajo" pad="14px 16px">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%" }}>
        {queues.map((q, i) => (
          <div key={i} onClick={q.action}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
            style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.06)",
              borderRadius: 12, padding: "10px 12px", cursor: "pointer", transition: "background .1s",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
              <Icon name={q.icon} size={14} strokeWidth={1.7} style={{ color: "var(--text-subtle)", flexShrink: 0 }}/>
              <span style={{ fontSize: 11.5, color: "var(--text-muted)", letterSpacing: "-0.2px",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.label}</span>
            </div>
            <span style={{ fontSize: 18, fontWeight: 400, fontFamily: "var(--font-display)", fontVariantNumeric: "tabular-nums",
              color: q.count > 0 ? "var(--text)" : "var(--text-subtle)", letterSpacing: "-0.5px" }}>{q.count}</span>
          </div>
        ))}
      </div>
    </WidgetCard>
  );

  // Stats inline (tira sin tiles)
  const StatsInline = () => (
    <div style={{ ...APPLE_CARD, display: "flex", flexWrap: "wrap", gap: 32, padding: "20px 24px" }}>
      {kpis.map((k, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 130 }}>
          <div style={{ fontSize: 11, color: "var(--text-subtle)", textTransform: "uppercase",
            letterSpacing: "0.08em", fontWeight: 500 }}>{k.label}</div>
          <div style={{
            fontSize: typeof k.value === "string" && k.value.startsWith("€") ? 22 : 26,
            fontWeight: 400, letterSpacing: "-0.9px", fontFamily: "var(--font-display)",
            fontVariantNumeric: "tabular-nums", lineHeight: 1.1,
          }}>{k.num != null ? <AnimatedValue num={k.num} fmt={k.fmt}/> : k.value}</div>
          <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{k.sub}</div>
        </div>
      ))}
    </div>
  );

  // ── Tira de KPIs (compartida por todos los diseños) ───────────────────────
  const KpiRow = (
    <section style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32,
      padding: "0 4px 6px", flexShrink: 0 }}>
      {kpis.map((k, i) => {
        const clickable = !!k.nav;
        const on = hoverKpi === i;
        const masked = k.money && hideMoney;
        return (
        <div key={i}
          onClick={clickable ? () => navigate(k.nav) : undefined}
          onMouseEnter={clickable ? () => setHoverKpi(i) : undefined}
          onMouseLeave={clickable ? () => setHoverKpi(null) : undefined}
          style={{ display: "flex", flexDirection: "column", gap: 14, cursor: clickable ? "pointer" : "default" }}>
          <span style={{ fontSize: 16, lineHeight: 1.3, color: on ? "var(--text)" : "var(--text-muted)", letterSpacing: "-0.2px", transition: "color .15s" }}>{k.label}</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, height: 32 }}>
              {masked
                ? <span style={{ display: "inline-block", width: 116, height: 20, borderRadius: 999,
                    background: "linear-gradient(90deg, rgba(255,255,255,0.11), rgba(255,255,255,0.05))", alignSelf: "center" }}/>
                : <>
                    <span style={{ fontSize: 32, color: on ? "var(--accent)" : "var(--text)", letterSpacing: "-0.08em", lineHeight: 1,
                      fontFamily: "var(--font-display)", fontVariantNumeric: "tabular-nums", transition: "color .15s" }}>{k.num != null ? <AnimatedValue num={k.num} fmt={k.fmt}/> : k.value}</span>
                    {k.unit && <span style={{ fontSize: 16, color: "var(--text-muted)" }}>{k.unit}</span>}
                  </>}
            </div>
            {k.delta && !masked && <MetricDelta {...k.delta}/>}
            {masked && <span style={{ display: "inline-block", width: 64, height: 11, borderRadius: 999, background: "rgba(255,255,255,0.06)" }}/>}
          </div>
        </div>
        );
      })}
    </section>
  );

  // ═══ Diseño 1 — Bento asimétrico ══════════════════════════════════════════
  const LayoutBento = (
    <>
      {KpiRow}
      <section style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: 48, height: 344, flexShrink: 0 }}>
        <QueuesBlock height="100%"/>
        <AgendaBlock height="100%" slice={6}/>
        <ProjectsBlock height="100%"/>
      </section>
      <section style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 48, height: 264, flexShrink: 0 }}>
        <FinanceChartBlock finTrend={finTrend} hideMoney={hideMoney} navigate={navigate}/>
        <GoalBlock billed={facturadoCur} eur={_eur} hideMoney={hideMoney}/>
      </section>
      <section style={{ height: 176, flexShrink: 0 }}>
        <ProjectsProgressBlock D={D} navigate={navigate} openModal={openModal}/>
      </section>
    </>
  );

  // ═══ Diseño 2 — Minimal (sin cajas, aireado) ══════════════════════════════
  const _mHead = (title, action, onAction) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
      {EYEBROW(title)}
      {action && <button onClick={onAction} style={{ ...LINK_BTN, height: 22, padding: "0 6px" }}>{action} <Icon name="arrow" size={11}/></button>}
    </div>
  );
  const _mDivider = <div style={{ height: "0.5px", background: "rgba(255,255,255,0.07)" }}/>;
  const LayoutMinimal = (
    <>
      {KpiRow}
      <div style={{ height: "0.5px", background: "rgba(255,255,255,0.07)", margin: "10px 0 4px" }}/>
      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 52, alignItems: "start", paddingTop: 8 }}>
        {/* Columna izquierda — Tu día */}
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div>
            {_mHead("Agenda", "Ver todo", () => navigate("agenda"))}
            {upcomingEvents.length === 0
              ? <div style={{ fontSize: 12.5, color: "var(--text-subtle)", padding: "8px 0" }}>Sin eventos próximos.</div>
              : upcomingEvents.slice(0, 4).map((ev, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
                  borderBottom: i === Math.min(3, upcomingEvents.length - 1) ? "none" : "0.5px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: ev.color || "var(--accent)", flexShrink: 0 }}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: "-0.3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.label}</div>
                    <div style={{ fontSize: 12, color: "var(--text-subtle)", marginTop: 1 }}>{formatEventDate(ev.date)}{ev.sub ? ` · ${ev.sub}` : ""}</div>
                  </div>
                  <span style={{ fontSize: 10.5, color: "var(--text-subtle)" }}>{ev.type}</span>
                </div>
              ))}
          </div>
          <div>
            {_mHead("Tareas de hoy", "Ver todo", () => navigate("tasks"))}
            {_pendingWithPid.length === 0
              ? <div style={{ fontSize: 12.5, color: "var(--text-subtle)", padding: "8px 0" }}>No te queda nada pendiente.</div>
              : _pendingWithPid.slice(0, 6).map((t, i) => (
                <div key={t.id} style={{ marginInline: -22 }}>
                  <QuickTaskRow t={t} D={D} last={i === Math.min(5, _pendingWithPid.length - 1)}
                    projName={(D.PROJECTS.find(p => p.id === t._pid) || {}).name || t.clientName || "General"}
                    dateLabel={fmtTaskDate(t.deadline)} overdue={t.deadline && t.deadline < _todayStr}/>
                </div>
              ))}
          </div>
        </div>
        {/* Columna derecha — Resumen */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Rutina */}
          <div>
            {_mHead("Rutina de hoy")}
            {_routToday.length === 0
              ? <div style={{ fontSize: 12.5, color: "var(--text-subtle)", padding: "6px 0" }}>Sin rutina para hoy.</div>
              : (() => {
                  const r = 30, circ = 2 * Math.PI * r, off = circ * (1 - routinePct / 100);
                  return (
                    <div style={{ display: "flex", alignItems: "center", gap: 20, paddingTop: 6 }}>
                      <div style={{ position: "relative", width: 76, height: 76, flexShrink: 0 }}>
                        <svg width="76" height="76" style={{ transform: "rotate(-90deg)" }}>
                          <circle cx="38" cy="38" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5"/>
                          <circle cx="38" cy="38" r={r} fill="none" stroke="var(--accent)" strokeWidth="5" strokeLinecap="round"
                            strokeDasharray={circ} strokeDashoffset={off} style={{ transition: "stroke-dashoffset .5s" }}/>
                        </svg>
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 18, fontWeight: 500, letterSpacing: "-0.6px", fontFamily: "var(--font-display)" }}>{routinePct}%</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{routineDone}/{_rSteps} pasos hechos</div>
                        <div style={{ display: "flex", gap: 18 }}>
                          <div><div style={{ fontSize: 16, fontWeight: 500, fontFamily: "var(--font-display)", letterSpacing: "-0.5px" }}>{routineStreak}<span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 3 }}>días</span></div><div style={{ fontSize: 10.5, color: "var(--text-subtle)" }}>Racha</div></div>
                          {weightToday != null && <div><div style={{ fontSize: 16, fontWeight: 500, fontFamily: "var(--font-display)", letterSpacing: "-0.5px" }}>{String(weightToday).replace(".", ",")}<span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 3 }}>kg</span></div><div style={{ fontSize: 10.5, color: "var(--text-subtle)" }}>Peso</div></div>}
                        </div>
                      </div>
                    </div>
                  );
                })()}
          </div>
          {_mDivider}
          {/* Próximos pagos */}
          <div>
            {_mHead("Próximos pagos", "Ver todo", () => navigate("billing"))}
            {upcomingBills.length === 0
              ? <div style={{ fontSize: 12.5, color: "var(--text-subtle)", padding: "6px 0" }}>Sin pagos próximos.</div>
              : upcomingBills.slice(0, 4).map((b, i) => (
                <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0",
                  borderBottom: i === Math.min(3, upcomingBills.length - 1) ? "none" : "0.5px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(158,154,229,0.12)", border: "0.5px solid rgba(158,154,229,0.2)", color: "var(--accent)", fontSize: 13, fontWeight: 600, fontFamily: "var(--font-display)" }}>
                    {b.kind === "invoice" ? <Icon name="receipt" size={14}/> : (b.name || "?").trim().charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, letterSpacing: "-0.3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.name}</div>
                    <div style={{ fontSize: 11.5, color: "var(--text-subtle)", marginTop: 1 }}>{`${b.date.getDate()} ${_MES3[b.date.getMonth()]} ${b.date.getFullYear()}`}</div>
                  </div>
                  {hideMoney
                    ? <span style={{ display: "inline-block", width: 52, height: 13, borderRadius: 999, background: "rgba(255,255,255,0.08)" }}/>
                    : <span style={{ fontSize: 14, fontWeight: 500, fontFamily: "var(--font-display)", letterSpacing: "-0.4px" }}>{_eur(b.amount)}</span>}
                </div>
              ))}
          </div>
          {_mDivider}
          {/* Finanzas sparkline */}
          <div>
            {_mHead("Finanzas · últimos 6 meses", "Ver", () => navigate("billing"))}
            {hideMoney
              ? <div style={{ fontSize: 12.5, color: "var(--text-subtle)", padding: "6px 0" }}>Importes ocultos.</div>
              : <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10, height: 70, paddingTop: 8 }}>
                  {finBars.map((b, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 52 }}>
                        <div style={{ width: 8, borderRadius: 3, background: "var(--accent)", height: Math.max(3, (b.ingreso / finMax) * 52) }}/>
                        <div style={{ width: 8, borderRadius: 3, background: "rgba(255,255,255,0.22)", height: Math.max(3, (b.gasto / finMax) * 52) }}/>
                      </div>
                      <span style={{ fontSize: 10, color: "var(--text-subtle)", textTransform: "capitalize" }}>{b.label}</span>
                    </div>
                  ))}
                </div>}
          </div>
        </div>
      </div>
    </>
  );

  // ═══ Diseño 3 — Focus (hero del día) ══════════════════════════════════════
  const _todayTasks = _liveTasks.filter(t => t.deadline === _todayStr);
  const _doneToday  = _todayTasks.filter(t => t.column === "done").length;
  const _totalToday = _todayTasks.length;
  const _heroChips = [
    ...upcomingEvents.slice(0, 3).map(ev => ({ icon: ev.icon, title: ev.label, when: formatEventDate(ev.date), tint: "rgba(96,165,250,0.14)", color: "var(--blue)" })),
    ...upcomingBills.slice(0, 3).map(b => ({ icon: b.kind === "invoice" ? "receipt" : "refresh-cw", title: b.name, when: `${b.date.getDate()} ${_MES3[b.date.getMonth()]}`, tint: "rgba(158,154,229,0.14)", color: "var(--accent)" })),
  ];
  const HeroRing = ({ pct, size = 92, stroke = 7, label, value }) => {
    const r = (size - stroke) / 2, circ = 2 * Math.PI * r, off = circ * (1 - pct / 100);
    return (
      <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={stroke}/>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--accent)" strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={off} style={{ transition: "stroke-dashoffset .5s" }}/>
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.8px", fontFamily: "var(--font-display)", lineHeight: 1 }}>{value}</div>
          <div style={{ fontSize: 9.5, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 3 }}>{label}</div>
        </div>
      </div>
    );
  };
  const LayoutFocus = (
    <>
      {KpiRow}
      <div style={{ ...APPLE_CARD, borderRadius: 24, padding: 22,
        background: "linear-gradient(135deg, rgba(158,154,229,0.14) 0%, rgba(255,255,255,0.02) 55%)",
        display: "flex", alignItems: "center", gap: 30, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22, flexShrink: 0 }}>
          <HeroRing pct={_totalToday ? Math.round(_doneToday / _totalToday * 100) : 0}
            label="Tareas" value={`${_doneToday}/${_totalToday || 0}`}/>
          <HeroRing pct={routinePct} label="Rutina" value={`${routinePct}%`}/>
        </div>
        <div style={{ width: "0.5px", alignSelf: "stretch", background: "rgba(255,255,255,0.08)" }}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ ...APPLE_SECTION, marginBottom: 12 }}>Próximo</div>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
            {_heroChips.length === 0
              ? <span style={{ fontSize: 12.5, color: "var(--text-subtle)" }}>Nada próximo.</span>
              : _heroChips.map((c, i) => (
                <div key={i} style={{ flexShrink: 0, minWidth: 150, display: "flex", alignItems: "center", gap: 10,
                  background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "10px 12px" }}>
                  <div style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                    background: c.tint, color: c.color }}><Icon name={c.icon} size={14} strokeWidth={1.7}/></div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500, letterSpacing: "-0.3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</div>
                    <div style={{ fontSize: 11, color: "var(--text-subtle)", marginTop: 1 }}>{c.when}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, height: 320, flexShrink: 0 }}>
        <QueuesBlock height="100%"/>
        <ProjectsBlock height="100%"/>
      </section>
      <section style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 16, height: 192, flexShrink: 0 }}>
        <MiniFinanceBlock/>
        <QueuesCountBlock/>
      </section>
    </>
  );

  const renderLayout = () => LayoutBento;

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 34,
      minHeight: "100vh", overflowY: "auto",
      padding: "28px 36px 48px",
      maxWidth: 1400, margin: "0 auto",
    }}>
      {Header}
      {renderLayout()}
    </div>
  );
};

// ─── Subcomponentes compartidos (fuera del cuerpo de AgencyDashboard) ──────
const LINK_BTN = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  width: 28, height: 28, borderRadius: 8, padding: 0,
  background: "transparent", border: 0, cursor: "pointer", fontFamily: "inherit",
};

// ── Estilos + shell de tarjeta a nivel de módulo (para widgets con estado
//    propio, que NO pueden vivir dentro del cuerpo del dashboard porque el
//    reloj lo re-renderiza cada segundo y perderían foco/estado) ────────────
const DASH_CARD = {
  background: "transparent", border: "none", borderRadius: 0, boxShadow: "none",
};
const DASH_EYEBROW = { fontSize: 11, fontWeight: 600, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.08em" };
const DashCardShell = ({ eyebrow, title, action, onAction, children, pad = "16px 20px" }) => (
  <div style={{ ...DASH_CARD, display: "flex", flexDirection: "column", overflow: "hidden", height: "100%" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "2px 4px 12px", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
      <div>
        <div style={DASH_EYEBROW}>{eyebrow}</div>
        <div style={{ marginTop: 4, fontSize: 15, fontWeight: 500, letterSpacing: "-0.5px" }}>{title}</div>
      </div>
      {action && <button onClick={onAction} style={LINK_BTN}>{action} <Icon name="arrow" size={12}/></button>}
    </div>
    <div style={{ flex: 1, minHeight: 0, padding: pad, display: "flex" }}>{children}</div>
  </div>
);

// Widget "Foco del día" — nota editable con la prioridad de hoy (por día)
const FocusBlock = ({ todayStr }) => {
  const key = "141_focus_" + todayStr;
  const [txt, setTxt] = useState(() => { try { return localStorage.getItem(key) || ""; } catch { return ""; } });
  useEffect(() => { try { setTxt(localStorage.getItem(key) || ""); } catch {} }, [key]);
  const save = (v) => { setTxt(v); try { localStorage.setItem(key, v); } catch {} };
  return (
    <DashCardShell eyebrow="Hoy" title="Foco del día" pad="14px 18px">
      <textarea
        value={txt}
        onChange={e => save(e.target.value)}
        placeholder="¿Cuál es tu prioridad de hoy?"
        style={{ width: "100%", height: "100%", resize: "none", background: "transparent", border: "none",
          outline: "none", color: "var(--text)", fontSize: 14, lineHeight: 1.55, letterSpacing: "-0.3px",
          fontFamily: "var(--font-sans)", caretColor: "var(--accent)" }}
      />
    </DashCardShell>
  );
};

// Widget "Clientes" — acceso rápido a las fichas de cliente
const ClientsBlock = ({ D, navigate }) => {
  const clients = D.CLIENTS || [];
  const _pal = ["#9e9ae5", "#60a5fa", "#34d399", "#f6a15b", "#e879a6", "#eee586"];
  return (
    <DashCardShell eyebrow="Cartera" title="Clientes" action="Ver todo" onAction={() => navigate("clients")} pad="14px 16px">
      {clients.length === 0 ? (
        <div style={{ margin: "auto", textAlign: "center", color: "var(--text-subtle)", fontSize: 12.5 }}>
          Aún no tienes clientes.
        </div>
      ) : (
        <div style={{ display: "flex", gap: 12, overflowX: "auto", width: "100%", paddingBottom: 2 }}>
          {clients.slice(0, 12).map((c, i) => {
            const name = c.company || c.name || "Cliente";
            const col = _pal[i % _pal.length];
            return (
              <div key={c.id || i} onClick={() => navigate("clientDetail", { clientId: c.id })}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                style={{ flexShrink: 0, width: 118, cursor: "pointer", borderRadius: 14, padding: "12px 12px",
                  background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.06)",
                  display: "flex", flexDirection: "column", gap: 9, transition: "background .1s" }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                  background: col + "22", border: `0.5px solid ${col}44`, color: col, fontSize: 14, fontWeight: 600, fontFamily: "var(--font-display)" }}>
                  {name.trim().charAt(0).toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500, letterSpacing: "-0.3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-subtle)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.service || "Cliente"}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashCardShell>
  );
};

// Widget "Meta del mes" — progreso hacia el objetivo de facturación (editable)
const _goalSkel = (w) => <span style={{ display: "inline-block", width: w, height: 13, borderRadius: 999, background: "rgba(255,255,255,0.09)", verticalAlign: "middle" }}/>;
const GoalBlock = ({ billed, eur, hideMoney }) => {
  const [goal, setGoal] = useState(() => { try { return Number(localStorage.getItem("141_month_goal")) || 3000; } catch { return 3000; } });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const pct = goal > 0 ? Math.min(100, Math.round((billed / goal) * 100)) : 0;
  const remaining = Math.max(0, goal - billed);
  const startEdit = () => { setDraft(String(goal)); setEditing(true); };
  const commit = () => {
    const n = Math.round(Number(String(draft).replace(/[^0-9.,]/g, "").replace(",", ".")) || 0);
    if (n > 0) { setGoal(n); try { localStorage.setItem("141_month_goal", String(n)); } catch {} }
    setEditing(false);
  };
  const done = pct >= 100;
  return (
    <DashCardShell eyebrow="Objetivo" title="Meta del mes" action={editing ? null : "Editar"} onAction={startEdit} pad="14px 4px">
      <div style={{ display: "flex", flexDirection: "column", width: "100%", justifyContent: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{ fontSize: 40, fontWeight: 400, letterSpacing: "-1.6px", lineHeight: 1, fontFamily: "var(--font-display)",
            color: done ? "var(--accent)" : "var(--text)" }}>{pct}%</span>
          {done && <span style={{ fontSize: 12.5, color: "var(--accent)", letterSpacing: "-0.3px" }}>¡Superado!</span>}
        </div>
        <div style={{ height: 9, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: pct + "%", background: "var(--accent)", borderRadius: 99, transition: "width .6s cubic-bezier(.2,.8,.2,1)" }}/>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, letterSpacing: "-0.3px" }}>
          <span style={{ color: "var(--text-muted)" }}>
            {hideMoney ? _goalSkel(46) : eur(billed)} <span style={{ color: "var(--text-subtle)", fontSize: 12 }}>facturado</span>
          </span>
          {editing ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 2, color: "var(--text-muted)" }}>
              €<input autoFocus value={draft} onChange={e => setDraft(e.target.value.replace(/[^0-9.,]/g, ""))}
                onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
                onBlur={commit}
                style={{ width: 64, background: "rgba(255,255,255,0.06)", border: "0.5px solid var(--accent)", borderRadius: 8,
                  color: "var(--text)", fontSize: 13, padding: "4px 8px", fontFamily: "var(--font-sans)", outline: "none", textAlign: "right" }}/>
            </span>
          ) : (
            <button onClick={startEdit} style={{ background: "transparent", border: 0, cursor: "pointer", color: "var(--text-subtle)",
              fontFamily: "inherit", fontSize: 12.5, letterSpacing: "-0.3px", display: "inline-flex", alignItems: "center", gap: 5 }}>
              meta {hideMoney ? _goalSkel(40) : eur(goal)} <Icon name="edit-2" size={11}/>
            </button>
          )}
        </div>
        <div style={{ fontSize: 12, color: done ? "var(--accent)" : "var(--text-subtle)", letterSpacing: "-0.2px" }}>
          {done ? "Objetivo cumplido este mes 🎯" : hideMoney ? "Progreso del mes" : `Faltan ${eur(remaining)} para la meta`}
        </div>
      </div>
    </DashCardShell>
  );
};

// Widget "Proyectos en curso" — barras de progreso por proyecto
const ProjectsProgressBlock = ({ D, navigate, openModal }) => {
  const projs = D.PROJECTS || [];
  return (
    <DashCardShell eyebrow="En curso" title="Proyectos" action="Ver todo" onAction={() => navigate("projects")} pad="8px 4px">
      {projs.length === 0 ? (
        <div style={{ margin: "auto", fontSize: 12.5, color: "var(--text-subtle)" }}>
          Sin proyectos. <button onClick={() => openModal("newProject")}
            style={{ background: "transparent", border: 0, color: "var(--accent)", cursor: "pointer", fontSize: 12.5, padding: 0, fontFamily: "inherit", textDecoration: "underline" }}>Crear uno</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 40, rowGap: 0, width: "100%", alignContent: "start" }}>
          {projs.slice(0, 8).map(p => {
            const tks = D.TASKS[p.id] || [];
            const live = tks.length ? Math.round(tks.filter(t => t.column === "done").length / tks.length * 100) : 0;
            return (
              <div key={p.id} onClick={() => navigate("project", { projectId: p.id })}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.025)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "11px 4px", cursor: "pointer",
                  borderRadius: 8, transition: "background .1s" }}>
                <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500, letterSpacing: "-0.3px", minWidth: 0,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                <div style={{ width: 96, height: 7, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden", flexShrink: 0 }}>
                  <div style={{ height: "100%", width: live + "%", background: "var(--accent)", borderRadius: 99, transition: "width .5s" }}/>
                </div>
                <span style={{ fontSize: 12, color: "var(--text-muted)", fontVariantNumeric: "tabular-nums", width: 32, textAlign: "right", flexShrink: 0 }}>{live}%</span>
              </div>
            );
          })}
        </div>
      )}
    </DashCardShell>
  );
};

// Bloque del gráfico de facturación — a nivel de módulo (identidad estable) para
// que NO se remonte con el reloj del Inicio; así la animación de dibujo de la
// línea sólo se reproduce al entrar a la página, no cada segundo.
const FinanceChartBlock = ({ finTrend, hideMoney, navigate }) => {
  const FinTrend = window.FinTrendChart;
  return (
    <DashCardShell eyebrow="Últimos 6 meses" title="Facturado" action="Ver" onAction={() => navigate("billing")} pad="10px 4px 4px">
      {hideMoney
        ? <div style={{ margin: "auto", textAlign: "center", color: "var(--text-subtle)", fontSize: 12.5 }}>Importes ocultos</div>
        : FinTrend
          ? <div style={{ display: "flex", width: "100%", minHeight: 0 }}><FinTrend trend={finTrend} single/></div>
          : <div style={{ margin: "auto", color: "var(--text-subtle)", fontSize: 12.5 }}>…</div>}
    </DashCardShell>
  );
};

const EventRow = ({ ev, last, formatEventDate }) => (
  <div
    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.025)"}
    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "13px 4px", transition: "background .1s", borderRadius: 8,
      borderBottom: last ? "none" : "0.5px solid rgba(255,255,255,0.04)",
    }}>
    <div style={{
      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
      background: "rgba(255,255,255,0.04)",
      border: "0.5px solid rgba(255,255,255,0.06)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: ev.color || "var(--text-muted)",
    }}>
      <Icon name={ev.icon} size={15} strokeWidth={1.7}/>
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        fontSize: 13.5, fontWeight: 500, letterSpacing: "-0.3px",
        color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>{ev.label}</div>
      <div style={{ fontSize: 12, color: "var(--text-subtle)", marginTop: 2, letterSpacing: "-0.2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        <span style={{ color: "var(--text-muted)" }}>{formatEventDate(ev.date)}{ev.time ? `, ${ev.time}${ev.timeEnd ? ` – ${ev.timeEnd}` : ""}` : ""}</span>
        {ev.sub ? ` · ${ev.sub}` : ""}
      </div>
    </div>
    <span style={{
      fontSize: 10.5, padding: "3px 9px", borderRadius: 99,
      background: "rgba(255,255,255,0.05)", color: "var(--text-muted)",
      border: "0.5px solid rgba(255,255,255,0.08)", letterSpacing: "-0.1px",
      whiteSpace: "nowrap", fontWeight: 500,
    }}>{ev.type}</span>
  </div>
);

const QueueRow = ({ q }) => (
  <div onClick={q.action}
    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.025)"}
    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 22px", cursor: "pointer", transition: "background .1s",
      borderBottom: "0.5px solid rgba(255,255,255,0.04)",
    }}>
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{
        width: 32, height: 32, borderRadius: 9, flexShrink: 0,
        background: "rgba(255,255,255,0.04)",
        border: "0.5px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "var(--text-muted)",
      }}>
        <Icon name={q.icon} size={14} strokeWidth={1.7}/>
      </div>
      <span style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: "-0.3px" }}>{q.label}</span>
    </div>
    <span style={{
      fontSize: 17, fontWeight: 400, fontVariantNumeric: "tabular-nums",
      color: q.count > 0 ? "var(--text)" : "var(--text-subtle)",
      letterSpacing: "-0.5px", fontFamily: "var(--font-display)",
    }}>{q.count}</span>
  </div>
);

// Fila de tarea completable (quick view del panel de Inicio)
const QuickTaskRow = ({ t, D, projName, dateLabel, overdue, last }) => {
  const [checking, setChecking] = useState(false);
  const complete = (e) => {
    e.stopPropagation();
    if (checking) return;
    setChecking(true);
    setTimeout(() => { try { D.moveTask(t._pid, t.id, "done"); } catch (err) {} }, 280);
  };
  return (
    <div
      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.025)"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 4px", borderRadius: 8,
        transition: "background .1s", borderBottom: last ? "none" : "0.5px solid rgba(255,255,255,0.04)" }}>
      <button onClick={complete} title="Completar"
        style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, padding: 0, cursor: "pointer",
          border: checking ? "1px solid var(--accent)" : "1.5px solid rgba(255,255,255,0.22)",
          background: checking ? "var(--accent)" : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}>
        {checking && <Icon name="check" size={14} style={{ color: "#fff" }}/>}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: "-0.3px",
          color: checking ? "var(--text-subtle)" : "var(--text)",
          textDecoration: checking ? "line-through" : "none", transition: "color .15s",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</div>
        <div style={{ fontSize: 12, color: "var(--text-subtle)", marginTop: 2, letterSpacing: "-0.2px",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {projName}{dateLabel ? <span style={{ color: overdue ? "var(--red)" : "var(--text-muted)" }}> · {dateLabel}</span> : ""}
        </div>
      </div>
    </div>
  );
};

// Fila de próximo pago / factura (estilo "upcoming bill & payment")
const _BILL_MESES = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
// Categoría de la suscripción → icono + color. Primer match gana; si nada
// coincide se usa una categoría genérica.
// Iconos de categoría = Phosphor Icons (via PhIcon)
const _CATS = [
  [/claude|anthropic|openai|chatgpt|\bgpt\b|magnific|midjourney|eleven\s?labs|perplexity|cursor|runway|\bia\b|\bai\b/, "sparkle", "#9e9ae5"], // IA
  [/figma|adobe|canva|dribbble|behance|photoshop|illustrat|dise[ñn]|design/, "palette", "#e879a6"],                                           // Diseño
  [/netflix|spotify|youtube|twitch|disney|\bhbo\b|prime|movistar|dazn|apple\s?music|music/, "monitor-play", "#dc5b5d"],                       // Entretenimiento
  [/mailchimp|hubspot|semrush|ahrefs|\bads\b|marketing|\bseo\b|meta|facebook|instagram|linkedin|tiktok|twitter|\bx\b/, "megaphone-simple", "#eec06a"], // Marketing / redes
  [/gmail|correo|zoho|proton|outlook/, "envelope-simple", "#60a5fa"],                                                                          // Email
  [/dropbox|icloud|drive|storage|backup|almacen/, "folder-simple", "#60a5fa"],                                                                 // Almacenamiento
  [/github|gitlab/, "code", "#9e9ae5"],                                                                                                         // Dev
  [/railway|ionos|vercel|\baws\b|amazon|cloudflare|hostinger|godaddy|namecheap|supabase|digitalocean|heroku|hosting|dominio|domain|\bvps\b|servidor|server/, "cloud", "#60a5fa"], // Hosting / infra
  [/notion|slack|workspace|gsuite|microsoft|office|365|airtable|linear|zapier|trello|asana|monday|google/, "squares-four", "#9e9ae5"],        // Productividad
  [/cuota|autonom|aut[oó]nom|irpf|gestor|stripe|paypal|impuesto|seguro|banco|\biva\b|n[oó]mina/, "receipt", "#9e9ae5"],                         // Finanzas / impuestos
];
const _catFor = (name) => { const t = (name || "").toLowerCase(); for (const [re, ic, co] of _CATS) if (re.test(t)) return { icon: ic, color: co }; return { icon: "package", color: "#9e9ae5" }; };
// Logo de marca (Simple Icons) por nombre → slug. Si no hay, cae al icono de
// categoría (Phosphor).
const _SLUGS = [
  [/claude|anthropic/, "claude"], [/magnific|freepik/, "freepik"], [/railway/, "railway"], [/ionos/, "ionos"],
  [/gmail/, "google"], [/google|workspace|gsuite/, "google"], [/netflix/, "netflix"],
  [/spotify/, "spotify"], [/figma/, "figma"], [/notion/, "notion"], [/vercel/, "vercel"],
  [/github/, "github"], [/gitlab/, "gitlab"], [/shopify/, "shopify"], [/stripe/, "stripe"],
  [/dropbox/, "dropbox"], [/discord/, "discord"], [/cloudflare/, "cloudflare"],
  [/hostinger/, "hostinger"], [/godaddy/, "godaddy"], [/namecheap/, "namecheap"],
  [/wordpress/, "wordpress"], [/mailchimp/, "mailchimp"], [/hubspot/, "hubspot"],
  [/zapier/, "zapier"], [/airtable/, "airtable"], [/linear/, "linear"], [/supabase/, "supabase"],
  [/digitalocean/, "digitalocean"], [/twitch/, "twitch"], [/youtube/, "youtube"],
  [/instagram/, "instagram"], [/meta|facebook/, "meta"], [/dribbble/, "dribbble"],
  [/behance/, "behance"], [/semrush/, "semrush"], [/eleven\s?labs/, "elevenlabs"],
  [/perplexity/, "perplexity"],
];
const _slugFor = (name) => { const t = (name || "").toLowerCase(); for (const [re, s] of _SLUGS) if (re.test(t)) return s; return null; };
const BillRow = ({ b, hideMoney, eur, onClick, last }) => {
  const d = b.date;
  const dateStr = `${d.getDate()} ${_BILL_MESES[d.getMonth()]} ${d.getFullYear()}`;
  const cat = b.kind === "invoice" ? { icon: "receipt", color: "#9e9ae5" } : _catFor(b.name);
  const slug = b.kind === "invoice" ? null : _slugFor(b.name);
  return (
    <div onClick={onClick}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.025)"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      style={{ display: "flex", alignItems: "center", gap: 13, padding: "12px 4px", cursor: "pointer",
        transition: "background .1s", borderRadius: 8,
        borderBottom: last ? "none" : "0.5px solid rgba(255,255,255,0.05)" }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.09)",
        color: "var(--text-muted)" }}>
        {slug ? <SiIcon name={slug} size={18}/> : <PhIcon name={cat.icon} size={19}/>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: "-0.3px", color: "var(--text)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.name}</div>
        <div style={{ fontSize: 12, color: "var(--text-subtle)", marginTop: 2, letterSpacing: "-0.2px" }}>{dateStr}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
        {hideMoney
          ? <span style={{ display: "inline-block", width: 56, height: 14, borderRadius: 999, background: "rgba(255,255,255,0.08)" }}/>
          : <span style={{ fontSize: 15, fontWeight: 500, letterSpacing: "-0.4px", color: "var(--text)",
              fontFamily: "var(--font-display)", fontVariantNumeric: "tabular-nums" }}>{eur(b.amount)}</span>}
        <span style={{ fontSize: 10, color: "var(--text-subtle)", letterSpacing: "-0.1px", whiteSpace: "nowrap" }}>
          {b.kind === "invoice" ? "Por cobrar" : "Programado"}
        </span>
      </div>
    </div>
  );
};

const ActiveProjects = ({ D, navigate, openModal, APPLE_SECTION }) => (
  <div style={{ padding: "18px 22px 14px" }}>
    <div style={{ ...APPLE_SECTION, marginBottom: 12 }}>Proyectos activos</div>
    {D.PROJECTS.length === 0 ? (
      <div style={{ fontSize: 12.5, color: "var(--text-subtle)", padding: "4px 0" }}>
        Sin proyectos. <button onClick={() => openModal("newProject")}
          style={{ background: "transparent", border: 0, color: "var(--accent)", cursor: "pointer",
            fontSize: 12.5, padding: 0, fontFamily: "inherit", textDecoration: "underline" }}>Crear uno</button>
      </div>
    ) : D.PROJECTS.slice(0, 5).map(p => {
      const pTasks = D.TASKS[p.id] || [];
      const live = pTasks.length ? Math.round(pTasks.filter(t => t.column === "done").length / pTasks.length * 100) : 0;
      return (
        <div key={p.id} onClick={() => navigate("project", { projectId: p.id })}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          style={{
            display: "flex", alignItems: "center", gap: 12, padding: "8px 8px",
            cursor: "pointer", borderRadius: 8, transition: "background .1s", marginInline: -8,
          }}>
          <span className={"dot " + p.light}/>
          <span style={{
            flex: 1, fontSize: 13, fontWeight: 500, minWidth: 0, letterSpacing: "-0.2px",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{p.name}</span>
          <div style={{ width: 78, display: "flex", alignItems: "center", gap: 8 }}>
            <div className="progress" style={{ flex: 1 }}><i style={{ width: live + "%" }}/></div>
            <span style={{
              fontSize: 11, color: "var(--text-muted)",
              fontVariantNumeric: "tabular-nums", width: 28, textAlign: "right",
            }}>{live}%</span>
          </div>
        </div>
      );
    })}
  </div>
);

window.AgencyDashboard = AgencyDashboard;

const _SB_URL = "https://ofnkazimemuiwovhxepq.supabase.co";
const _SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mbmthemltZW11aXdvdmh4ZXBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NTU5OTcsImV4cCI6MjA5NDUzMTk5N30.NVRoZb_Ie2ZgPELFkS7CxNWrLGZcgdOdWGEEkT_CNqo";
const _sb = window.supabase.createClient(_SB_URL, _SB_KEY, {
  auth: { persistSession: true, autoRefreshToken: true }
});
const TEAM = [
  { id: "u1", name: "Marta R.", role: "Founder", initials: "MR", color: "#fb7185" }
];
const ME = TEAM[0];
const LEAD_STAGES = [
  { id: "new", label: "Nuevo" },
  { id: "scheduled", label: "Llamada agendada" },
  { id: "called", label: "Llamada hecha" },
  { id: "proposal", label: "Propuesta enviada" },
  { id: "won", label: "Cerrado" },
  { id: "lost", label: "Descartado" }
];
const CHANNELS = {
  linkedin: { label: "LinkedIn", icon: "users" },
  referral: { label: "Referido", icon: "thumbs-up" },
  web: { label: "Web", icon: "external-link" },
  cold: { label: "Cold email", icon: "mail" },
  coldcall: { label: "Cold call", icon: "phone" },
  presencial: { label: "Presencial", icon: "map" }
};
const PHASES = [
  { id: "kickoff", label: "Arranque", weeks: "Sem 1" },
  { id: "exec1", label: "Ejecuci\xF3n", weeks: "Sem 2-4" },
  { id: "delivery", label: "Entrega", weeks: "Sem 5" },
  { id: "close", label: "Cierre", weeks: "Sem 6" }
];
const ROADMAP_P1 = [
  { week: 1, label: "Arranque", phase: "kickoff", state: "done", items: ["Onboarding completado", "Kickoff d\xEDa 3", "Primer entregable d\xEDa 7"] },
  { week: 2, label: "Ejecuci\xF3n", phase: "exec1", state: "done", items: ["Wireframes home", "Auditor\xEDa SEO", "Inventario contenidos"] },
  { week: 3, label: "Ejecuci\xF3n", phase: "exec1", state: "done", items: ["Mockups v1", "Mockups v2", "Check-in cliente"] },
  { week: 4, label: "Ejecuci\xF3n", phase: "exec1", state: "current", items: ["Mockups v3 (en curso)", "Animaci\xF3n hero", "Migraci\xF3n blog"] },
  { week: 5, label: "Entrega", phase: "delivery", state: "future", items: ["Revisi\xF3n 1", "Revisi\xF3n 2", "QA final"] },
  { week: 6, label: "Cierre", phase: "close", state: "future", items: ["Lanzamiento", "Onboarding cliente", "Check-in +7d"] }
];
const KPIS_WEEK = {
  impacts: { current: 0, target: 200, label: "Impactos" },
  leads: { current: 0, target: 10, label: "Leads" },
  calls: { current: 0, target: 3, label: "Llamadas" },
  closes: { current: 0, target: 1, label: "Cierres" }
};
const ACTIVITY = [];
const DRIVE_FOLDERS = [
  { name: "Activos marca", count: 0, size: "\u2014" },
  { name: "Textos", count: 0, size: "\u2014" },
  { name: "Fotos", count: 0, size: "\u2014" },
  { name: "Accesos", count: 0, size: "\u2014" },
  { name: "Entregas", count: 0, size: "\u2014" }
];
const INTAKE_SECTIONS = [
  { id: "biz", title: "Informaci\xF3n del negocio", icon: "info", items: 6, done: 0 },
  { id: "brand", title: "Identidad visual y marca", icon: "sparkles", items: 5, done: 0 },
  { id: "assets", title: "Materiales del proyecto", icon: "image", items: 4, done: 0 },
  { id: "access", title: "Accesos t\xE9cnicos", icon: "settings", items: 5, done: 0 },
  { id: "tone", title: "Preferencias y tono", icon: "quote", items: 4, done: 0 }
];
const CALL_PREP = [
  "Leer respuestas Calendly",
  "Revisar web del cliente",
  "Buscar LinkedIn de la persona",
  "Preparar 2 observaciones concretas",
  "Tener m\xEDnimo de precio claro"
];
const SETTINGS_DEFAULT = { name: "141'STUDIO", email: "nil@141agency.com", phone: "", website: "", tagline: "Agencia digital" };
const _store = {
  CLIENTS: [],
  PROJECTS: [],
  INVOICES: [],
  DELIVERABLES: [],
  LEADS: [],
  TASKS: {},
  CREDENTIALS: [],
  CLIENT_TASKS: [],
  NOTIFICATIONS: [],
  SETTINGS: { ...SETTINGS_DEFAULT },
  _user: null,
  _prof: null,
  _subs: /* @__PURE__ */ new Set()
};
const subscribe = (fn) => {
  _store._subs.add(fn);
  return () => _store._subs.delete(fn);
};
const _emit = () => _store._subs.forEach((fn) => fn());
const useStore = () => {
  const [, force] = React.useState(0);
  React.useEffect(() => subscribe(() => force((n) => n + 1)), []);
  return _store;
};
const _mc = (r) => r && {
  id: r.id,
  name: r.name,
  company: r.company,
  email: r.email,
  whatsapp: r.phone || "",
  // DB usa "phone"
  initials: r.initials,
  color: r.color,
  projects: 0,
  mrr: 0,
  // no existen en DB, valor por defecto
  lastContact: "\u2014",
  // no existe en DB
  status: "active",
  // no existe en DB
  service: r.sector || "\u2014",
  // DB usa "sector"
  since: "\u2014",
  // no existe en DB
  // Datos de onboarding / facturación
  nif: r.nif || "",
  fiscalName: r.fiscal_name || "",
  fiscalAddress: r.fiscal_address || "",
  website: r.website || "",
  about: r.about || "",
  driveUrl: r.drive_url || ""
  // carpeta de Google Drive del cliente
};
const _parseArr = (v) => {
  if (Array.isArray(v)) return v;
  if (!v) return [];
  try {
    const a = JSON.parse(v);
    return Array.isArray(a) ? a : [];
  } catch {
    return [];
  }
};
const _parseObj = (v) => {
  if (v && typeof v === "object") return v;
  if (!v) return {};
  try {
    const o = JSON.parse(v);
    return o && typeof o === "object" ? o : {};
  } catch {
    return {};
  }
};
const _mp = (r) => r && {
  id: r.id,
  name: r.name,
  clientId: r.client_id,
  clientName: r.client_name,
  service: r.service,
  light: r.light || "green",
  phase: r.phase ?? 0,
  week: r.week ?? 1,
  progress: r.progress ?? 0,
  budget: r.budget ?? 0,
  deadline: r.deadline,
  amount: r.budget ?? 0,
  // precio cerrado del proyecto
  payments: _projPayLocal[r.id] || [],
  // plan de cobro (respaldo local)
  nextMilestone: r.next_milestone,
  revisionsUsed: r.revisions_used ?? 0,
  description: r.description,
  recurring: r.recurring ?? false,
  phasesDone: _parseArr(r.phases_done),
  // fases marcadas como completadas
  phasesDesc: _parseObj(r.phases_desc)
  // { nombreFase: "descripción corta" }
};
const _TASK_NOTES_KEY = "task_notes_v1";
let _taskNotesLocal = {};
try {
  _taskNotesLocal = JSON.parse(localStorage.getItem(_TASK_NOTES_KEY) || "{}") || {};
} catch (e) {
  _taskNotesLocal = {};
}
const _setTaskNoteLocal = (id, notes) => {
  if (!id) return;
  if (notes) _taskNotesLocal[id] = notes;
  else delete _taskNotesLocal[id];
  try {
    localStorage.setItem(_TASK_NOTES_KEY, JSON.stringify(_taskNotesLocal));
  } catch (e) {
  }
};
const _mt = (r) => r && {
  id: r.id,
  title: r.title,
  column: r.col,
  assignee: r.assignee,
  clientId: r.client_id,
  clientName: r.client_name,
  done: r.done,
  deadline: r.deadline,
  phase: r.phase || null,
  notes: r.notes || _taskNotesLocal[r.id] || null,
  progress: r.progress ?? 0
};
const _PROJ_PAY_KEY = "project_payments_v1";
let _projPayLocal = {};
try {
  _projPayLocal = JSON.parse(localStorage.getItem(_PROJ_PAY_KEY) || "{}") || {};
} catch (e) {
  _projPayLocal = {};
}
const _setProjPayLocal = (id, payments) => {
  if (!id) return;
  if (payments && payments.length) _projPayLocal[id] = payments;
  else delete _projPayLocal[id];
  try {
    localStorage.setItem(_PROJ_PAY_KEY, JSON.stringify(_projPayLocal));
  } catch (e) {
  }
};
const _PAY_PLANS = {
  full: { label: "Un pago", desc: "100% del total", segs: [{ label: "Pago \xFAnico", pct: 100 }] },
  "5050": { label: "50 / 50", desc: "Mitad al empezar, mitad al entregar", segs: [{ label: "Al empezar", pct: 50 }, { label: "Al entregar", pct: 50 }] },
  "3070": { label: "30 / 70", desc: "30% al empezar, 70% al entregar", segs: [{ label: "Al empezar", pct: 30 }, { label: "Al entregar", pct: 70 }] },
  "333": { label: "3 pagos", desc: "Al empezar, a mitad y al entregar", segs: [{ label: "Al empezar", pct: 34 }, { label: "A mitad", pct: 33 }, { label: "Al entregar", pct: 33 }] }
};
const buildPayments = (amount, planId) => {
  const plan = _PAY_PLANS[planId] || _PAY_PLANS.full;
  const amt = Number(amount) || 0;
  let assigned = 0;
  return plan.segs.map((s, i) => {
    let val;
    if (i === plan.segs.length - 1) val = Math.round((amt - assigned) * 100) / 100;
    else {
      val = Math.round(amt * s.pct) / 100;
      assigned += val;
    }
    return { id: "pay" + i, label: s.label, pct: s.pct, amount: val, paid: false, paidDate: null };
  });
};
const _mi = (r) => r && {
  id: r.id,
  clientId: r.client_id,
  project: r.project_name,
  client: r.client_name,
  amount: r.amount,
  type: r.type,
  issued: r.issued,
  due: r.due,
  status: r.status,
  paidAt: r.paid_at
};
const _md = (r) => r && {
  id: r.id,
  projectId: r.project_id,
  title: r.title,
  type: r.type,
  thumb: r.thumb,
  status: r.status,
  date: r.date,
  version: r.version
};
const _mcr = (r) => r && {
  id: r.id,
  clientId: r.client_id,
  label: r.label || "",
  url: r.url || "",
  username: r.username || "",
  password: r.password || "",
  notes: r.notes || "",
  platform: r.platform || "",
  granted: !!r.granted
};
const CRED_CATALOG = [
  { key: "instagram", name: "Instagram", mode: "login", icon: "instagram" },
  { key: "meta", name: "Meta Business", mode: "access", icon: "meta" },
  { key: "google", name: "Google / Analytics", mode: "access", icon: "google" },
  { key: "shopify", name: "Shopify", mode: "access", icon: "shopify" },
  { key: "stripe", name: "Stripe", mode: "access", icon: "stripe" },
  { key: "wordpress", name: "WordPress", mode: "login", icon: "wordpress" },
  { key: "hosting", name: "Hosting", mode: "login", icon: "hostinger" },
  { key: "dominio", name: "Dominio", mode: "login", icon: "godaddy" },
  { key: "gmail", name: "Correo", mode: "login", icon: "gmail" },
  { key: "mailchimp", name: "Mailchimp", mode: "login", icon: "mailchimp" },
  { key: "otro", name: "Otro acceso", mode: "login", icon: "key" }
];
const _credMeta = (platform) => CRED_CATALOG.find((x) => x.key === platform) || { key: platform || "otro", name: platform || "Acceso", mode: "login", icon: "key" };
const credMode = (platform) => _credMeta(platform).mode;
const _mct = (r) => r && {
  id: r.id,
  clientId: r.client_id,
  title: r.title || "",
  description: r.description || "",
  done: !!r.done,
  sort: r.sort ?? 0
};
const _mn = (r) => r && {
  id: r.id,
  clientId: r.client_id,
  title: r.title || "",
  body: r.body || "",
  kind: r.kind || "",
  read: !!r.read,
  createdAt: r.created_at
};
const _ml = (r) => r && {
  id: r.id,
  name: r.name,
  company: r.company,
  channel: r.channel,
  stage: r.stage,
  budget: r.budget,
  light: r.light,
  enteredAt: r.entered_at,
  next: r.next,
  nextDate: r.next_date,
  needs: r.needs,
  when: r.when_field,
  instagram: r.instagram || ""
};
const _ms = (r) => r && {
  name: r.name,
  email: r.email,
  phone: r.phone,
  website: r.website,
  tagline: r.tagline
};
const _loadAll = async () => {
  const uid = _store._user?.id;
  if (!uid) return;
  const agencyEmail = _store._user?.email || "";
  const { error: agErr } = await _sb.from("agencies").upsert({ id: uid, name: "141'STUDIO", email: agencyEmail }, { onConflict: "id" });
  if (agErr) console.error("[agencies upsert]", agErr.message, agErr.code, agErr.details);
  const metaRole = _store._user?.user_metadata?.role;
  let prof = null;
  try {
    const { data: profData } = await _sb.from("profiles").select("*").eq("id", uid).maybeSingle();
    if (profData) prof = profData;
  } catch (e) {
  }
  if (!prof) {
    if (metaRole === "client") {
      prof = { role: "client", agency_id: null, client_db_id: null };
    } else {
      try {
        const { data: created } = await _sb.from("profiles").upsert({ id: uid, role: "admin", name: "", initials: "", agency_id: uid }).select().single();
        prof = created || { role: "admin", agency_id: uid };
      } catch (e) {
        prof = { role: "admin", agency_id: uid };
      }
    }
  }
  const agencyId = prof.agency_id || uid;
  const isClient = prof.role === "client";
  const clientDbId = prof.client_db_id;
  _store._prof = { agencyId, isClient, clientDbId };
  if (isClient) {
    const [proj, inv, cred, ctasks, me, sett] = await Promise.all([
      _sb.from("projects").select("*").eq("agency_id", agencyId).eq("client_id", clientDbId),
      _sb.from("invoices").select("*").eq("agency_id", agencyId).eq("client_id", clientDbId),
      _sb.from("credentials").select("*").eq("client_id", clientDbId),
      _sb.from("client_tasks").select("*").eq("client_id", clientDbId).order("sort", { ascending: true }),
      _sb.from("clients").select("*").eq("id", clientDbId).maybeSingle(),
      _sb.from("settings").select("*").eq("agency_id", agencyId).maybeSingle()
    ]);
    const notif = await _sb.from("notifications").select("*").eq("client_id", clientDbId).order("created_at", { ascending: false });
    _store.PROJECTS = (proj.data || []).map(_mp);
    _store.INVOICES = (inv.data || []).map(_mi);
    _store.CREDENTIALS = (cred.data || []).map(_mcr);
    _store.CLIENT_TASKS = (ctasks.data || []).map(_mct);
    _store.NOTIFICATIONS = (notif.data || []).map(_mn);
    _store.SETTINGS = _ms(sett.data) || { ...SETTINGS_DEFAULT };
    _store.CLIENTS = me.data ? [_mc(me.data)] : [];
    _store.LEADS = [];
    _store.TASKS = {};
    if (proj.data?.length) {
      const pids = proj.data.map((p) => p.id);
      const [dRes, tRes] = await Promise.all([
        _sb.from("deliverables").select("*").in("project_id", pids),
        _sb.from("tasks").select("*").in("project_id", pids)
      ]);
      _store.DELIVERABLES = (dRes.data || []).map(_md);
      for (const row of tRes.data || []) {
        const pid = row.project_id || "__none__";
        if (!_store.TASKS[pid]) _store.TASKS[pid] = [];
        _store.TASKS[pid].push(_mt(row));
      }
    } else {
      _store.DELIVERABLES = [];
    }
  } else {
    const [c, p, i, d, l, t, cr, s] = await Promise.all([
      _sb.from("clients").select("*").eq("agency_id", uid).order("created_at", { ascending: false }),
      _sb.from("projects").select("*").eq("agency_id", uid).order("created_at", { ascending: false }),
      _sb.from("invoices").select("*").eq("agency_id", uid).order("created_at", { ascending: false }),
      _sb.from("deliverables").select("*").eq("agency_id", uid).order("created_at", { ascending: false }),
      _sb.from("leads").select("*").eq("agency_id", uid).order("created_at", { ascending: false }),
      _sb.from("tasks").select("*").eq("agency_id", uid).order("created_at", { ascending: false }),
      _sb.from("credentials").select("*").eq("agency_id", uid).order("created_at", { ascending: false }),
      _sb.from("settings").select("*").eq("agency_id", uid).maybeSingle()
    ]);
    const ct = await _sb.from("client_tasks").select("*").eq("agency_id", uid).order("sort", { ascending: true });
    const nt = await _sb.from("notifications").select("*").eq("agency_id", uid).order("created_at", { ascending: false });
    _store.CLIENTS = (c.data || []).map(_mc);
    _store.PROJECTS = (p.data || []).map(_mp);
    _store.INVOICES = (i.data || []).map(_mi);
    _store.DELIVERABLES = (d.data || []).map(_md);
    _store.LEADS = (l.data || []).map(_ml);
    _store.CREDENTIALS = (cr.data || []).map(_mcr);
    _store.CLIENT_TASKS = (ct.data || []).map(_mct);
    _store.NOTIFICATIONS = (nt.data || []).map(_mn);
    _store.SETTINGS = _ms(s.data) || { ...SETTINGS_DEFAULT };
    _store.TASKS = {};
    for (const row of t.data || []) {
      const pid = row.project_id || "__none__";
      if (!_store.TASKS[pid]) _store.TASKS[pid] = [];
      _store.TASKS[pid].push(_mt(row));
    }
  }
  _emit();
};
let _channel = null;
const _setupRealtime = () => {
  const uid = _store._user?.id;
  if (!uid) return;
  if (_channel) {
    _sb.removeChannel(_channel);
    _channel = null;
  }
  _channel = _sb.channel("agency_rt_" + uid).on("postgres_changes", { event: "*", schema: "public", table: "clients", filter: "agency_id=eq." + uid }, _loadAll).on("postgres_changes", { event: "*", schema: "public", table: "projects", filter: "agency_id=eq." + uid }, _loadAll).on("postgres_changes", { event: "*", schema: "public", table: "tasks", filter: "agency_id=eq." + uid }, _loadAll).on("postgres_changes", { event: "*", schema: "public", table: "invoices", filter: "agency_id=eq." + uid }, _loadAll).on("postgres_changes", { event: "*", schema: "public", table: "leads", filter: "agency_id=eq." + uid }, _loadAll).on("postgres_changes", { event: "*", schema: "public", table: "deliverables", filter: "agency_id=eq." + uid }, _loadAll).on("postgres_changes", { event: "*", schema: "public", table: "credentials", filter: "agency_id=eq." + uid }, _loadAll).on("postgres_changes", { event: "*", schema: "public", table: "client_tasks", filter: "agency_id=eq." + uid }, _loadAll).on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: "agency_id=eq." + uid }, _loadAll).subscribe();
};
const authLogin = async (email, password) => {
  const { data, error } = await _sb.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };
  const uid = data.user.id;
  const metaRole = data.user.user_metadata?.role;
  let prof = null;
  try {
    const { data: profData } = await _sb.from("profiles").select("*").eq("id", uid).maybeSingle();
    if (profData) prof = profData;
  } catch (e) {
  }
  if (!prof) {
    if (metaRole === "client") {
      prof = { role: "client", agency_id: null, client_db_id: null };
    } else {
      try {
        const { data: created } = await _sb.from("profiles").upsert({ id: uid, role: "admin", name: "", initials: "", agency_id: uid }).select().single();
        prof = created || { role: "admin", agency_id: uid };
      } catch (e) {
        prof = { role: "admin", agency_id: uid };
      }
    }
  }
  return {
    ok: true,
    session: {
      email: data.user.email,
      role: prof?.role || "client",
      name: prof?.name || data.user.email,
      initials: prof?.initials || data.user.email[0]?.toUpperCase() || "?",
      agencyId: prof?.agency_id,
      clientId: prof?.client_db_id,
      adminEmail: data.user.email
      // backward compat with z-app
    }
  };
};
const authSignOut = async () => {
  if (_channel) {
    _sb.removeChannel(_channel);
    _channel = null;
  }
  await _sb.auth.signOut();
  _store._user = null;
  _store.CLIENTS = [];
  _store.PROJECTS = [];
  _store.INVOICES = [];
  _store.DELIVERABLES = [];
  _store.LEADS = [];
  _store.TASKS = {};
  _store.SETTINGS = { ...SETTINGS_DEFAULT };
  _emit();
};
const initAccount = async (_ignored) => {
  let { data: { session } } = await _sb.auth.getSession();
  if (!session?.user) {
    const { data: refreshed } = await _sb.auth.refreshSession();
    session = refreshed?.session;
  }
  if (session?.user) {
    _store._user = session.user;
    await _loadAll();
    _syncUserData();
    _cleanupOldTasks();
    _setupRealtime();
  } else {
    window.dispatchEvent(new CustomEvent("141-session-expired"));
  }
};
const _uid = () => _store._user?.id;
const _id = () => crypto.randomUUID();
const _palette = ["#fb7185", "#60a5fa", "#fbbf24", "#34d399", "#a78bfa", "#f472b6", "#22d3ee", "#f59e0b"];
const _initials = (name) => (name || "??").split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase() || "").join("") || "??";
const addClient = (input) => {
  const uid = _uid();
  if (!uid) return;
  const c = {
    id: _id(),
    name: input.name || "Sin nombre",
    company: input.company || input.name || "Sin empresa",
    email: input.email || "",
    whatsapp: input.phone || input.whatsapp || "",
    initials: _initials(input.company || input.name),
    color: _palette[_store.CLIENTS.length % _palette.length],
    projects: 0,
    mrr: 0,
    lastContact: "ahora",
    status: "active",
    service: input.sector || input.type || "\u2014",
    since: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
    // "2026-06-09" — válido para DATE o TEXT
  };
  _store.CLIENTS = [c, ..._store.CLIENTS];
  _emit();
  _sb.from("clients").insert({
    id: c.id,
    agency_id: uid,
    name: c.name,
    company: c.company,
    email: c.email,
    phone: c.whatsapp,
    initials: c.initials,
    color: c.color,
    sector: c.service
  }).then(({ error }) => {
    if (error) {
      console.error("[addClient] Supabase error:", error.message, "| code:", error.code, "| details:", error.details, "| hint:", error.hint);
      _store.CLIENTS = _store.CLIENTS.filter((x) => x.id !== c.id);
      _emit();
    }
  });
  return c;
};
const updateClient = (id, changes) => {
  const uid = _uid();
  if (!uid) return;
  _store.CLIENTS = _store.CLIENTS.map((c) => c.id === id ? { ...c, ...changes } : c);
  _emit();
  const dbChanges = {};
  if (changes.name !== void 0) dbChanges.name = changes.name;
  if (changes.company !== void 0) dbChanges.company = changes.company;
  if (changes.email !== void 0) dbChanges.email = changes.email;
  if (changes.whatsapp !== void 0) dbChanges.phone = changes.whatsapp;
  if (changes.service !== void 0) dbChanges.sector = changes.service;
  if (changes.nif !== void 0) dbChanges.nif = changes.nif || null;
  if (changes.fiscalName !== void 0) dbChanges.fiscal_name = changes.fiscalName || null;
  if (changes.fiscalAddress !== void 0) dbChanges.fiscal_address = changes.fiscalAddress || null;
  if (changes.website !== void 0) dbChanges.website = changes.website || null;
  if (changes.about !== void 0) dbChanges.about = changes.about || null;
  if (changes.driveUrl !== void 0) dbChanges.drive_url = changes.driveUrl || null;
  _updateAdaptive("clients", id, dbChanges);
};
const deleteClient = async (id) => {
  const uid = _uid();
  if (!uid) return;
  const prevClients = _store.CLIENTS;
  const prevProjects = _store.PROJECTS;
  const prevInvoices = _store.INVOICES;
  const prevTasks = { ..._store.TASKS };
  const projectIds = _store.PROJECTS.filter((p) => p.clientId === id).map((p) => p.id);
  _store.CLIENTS = _store.CLIENTS.filter((c) => c.id !== id);
  _store.PROJECTS = _store.PROJECTS.filter((p) => p.clientId !== id);
  _store.INVOICES = _store.INVOICES.filter((i) => i.clientId !== id);
  projectIds.forEach((pid) => {
    delete _store.TASKS[pid];
  });
  _emit();
  const { error } = await _sb.rpc("delete_client_full", {
    p_client_id: id,
    p_agency_id: uid
  });
  if (error) {
    _store.CLIENTS = prevClients;
    _store.PROJECTS = prevProjects;
    _store.INVOICES = prevInvoices;
    _store.TASKS = prevTasks;
    _emit();
    console.error("Error al eliminar cliente:", error.message);
  }
};
const addProject = (input) => {
  const uid = _uid();
  if (!uid) return;
  const client = _store.CLIENTS.find((c) => c.id === input.clientId);
  const deadline = (() => {
    if (!input.deadline || input.deadline === "\u2014") return "\u2014";
    if (/^\d{4}-\d{2}-\d{2}$/.test(input.deadline)) {
      const d = /* @__PURE__ */ new Date(input.deadline + "T12:00:00");
      const M = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
      return `${d.getDate()} ${M[d.getMonth()]}`;
    }
    return input.deadline;
  })();
  const p = {
    id: _id(),
    name: input.name || "Proyecto sin nombre",
    clientId: input.clientId || null,
    clientName: client ? client.company || client.name || "\u2014" : input.clientId ? "\u2014" : "Interno",
    service: input.template || "\u2014",
    light: "green",
    phase: 0,
    week: 1,
    progress: 0,
    budget: 0,
    deadline,
    nextMilestone: "Kickoff",
    revisionsUsed: 0,
    description: input.description || ""
  };
  _store.PROJECTS = [p, ..._store.PROJECTS];
  if (client) {
    _store.CLIENTS = _store.CLIENTS.map(
      (c) => c.id === client.id ? { ...c, projects: c.projects + 1 } : c
    );
  }
  _emit();
  _sb.from("projects").insert({
    id: p.id,
    agency_id: uid,
    client_id: p.clientId,
    client_name: p.clientName,
    name: p.name,
    service: p.service,
    light: p.light,
    phase: p.phase,
    week: p.week,
    progress: p.progress,
    budget: p.budget,
    deadline: p.deadline,
    next_milestone: p.nextMilestone,
    revisions_used: 0,
    description: p.description
  }).then(({ error }) => {
    if (error) {
      console.error("[addProject] Supabase error:", error.message, "| code:", error.code, "| hint:", error.hint);
      _store.PROJECTS = _store.PROJECTS.filter((x) => x.id !== p.id);
      _emit();
    }
  });
  if (client) {
    _sb.from("clients").update({ projects_count: client.projects + 1 }).eq("id", client.id).then();
  }
  if (p.clientId) notify(p.clientId, { title: "Nuevo proyecto", body: p.name, kind: "project" });
  return p;
};
const _insertAdaptive = async (table, rows) => {
  const isArr = Array.isArray(rows);
  let payload = isArr ? rows.map((r) => ({ ...r })) : { ...rows };
  for (let i = 0; i < 15; i++) {
    const { error } = await _sb.from(table).insert(payload);
    if (!error) return { error: null };
    const m = /Could not find the '(\w+)' column/.exec(error.message || "");
    if (m) {
      const col = m[1];
      if (isArr) payload = payload.map((r) => {
        const c = { ...r };
        delete c[col];
        return c;
      });
      else {
        if (!(col in payload)) return { error };
        delete payload[col];
      }
      continue;
    }
    return { error };
  }
  return { error: { message: "Esquema incompatible (demasiadas columnas ausentes)" } };
};
const _updateAdaptive = async (table, id, changes) => {
  let payload = { ...changes };
  for (let i = 0; i < 15; i++) {
    if (!Object.keys(payload).length) return { error: null };
    const { error } = await _sb.from(table).update(payload).eq("id", id);
    if (!error) return { error: null };
    const m = /Could not find the '(\w+)' column/.exec(error.message || "");
    if (m && m[1] in payload) {
      delete payload[m[1]];
      continue;
    }
    return { error };
  }
  return { error: { message: "Esquema incompatible (demasiadas columnas ausentes)" } };
};
const addProjectAsync = async (input) => {
  const uid = _uid();
  if (!uid) return null;
  const client = _store.CLIENTS.find((c) => c.id === input.clientId);
  const deadline = (() => {
    if (!input.deadline || input.deadline === "\u2014") return "\u2014";
    if (/^\d{4}-\d{2}-\d{2}$/.test(input.deadline)) {
      const d = /* @__PURE__ */ new Date(input.deadline + "T12:00:00");
      const M = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
      return `${d.getDate()} ${M[d.getMonth()]}`;
    }
    return input.deadline;
  })();
  const p = {
    id: _id(),
    name: input.name || "Proyecto sin nombre",
    clientId: input.clientId || null,
    clientName: client ? client.company || client.name || "\u2014" : input.clientId ? "\u2014" : "Interno",
    service: input.template || "\u2014",
    light: "green",
    phase: 0,
    week: 1,
    progress: 0,
    budget: Number(input.amount) || 0,
    deadline,
    amount: Number(input.amount) || 0,
    payments: input.payments || [],
    nextMilestone: "Kickoff",
    revisionsUsed: 0,
    description: input.description || "",
    recurring: !!input.recurring
  };
  _setProjPayLocal(p.id, input.payments || []);
  _store.PROJECTS = [p, ..._store.PROJECTS];
  if (client) _store.CLIENTS = _store.CLIENTS.map((c) => c.id === client.id ? { ...c, projects: c.projects + 1 } : c);
  _emit();
  const { error } = await _insertAdaptive("projects", {
    id: p.id,
    agency_id: uid,
    client_id: p.clientId,
    client_name: p.clientName,
    name: p.name,
    service: p.service,
    light: p.light,
    phase: p.phase,
    week: p.week,
    progress: p.progress,
    budget: p.budget,
    deadline: p.deadline,
    next_milestone: p.nextMilestone,
    revisions_used: 0,
    description: p.description,
    recurring: p.recurring
  });
  if (error) {
    console.error("[addProjectAsync] Supabase error:", error.message, "| code:", error.code, "| hint:", error.hint);
    _store.PROJECTS = _store.PROJECTS.filter((x) => x.id !== p.id);
    _emit();
    return { error: error.message || "Error desconocido de Supabase", code: error.code };
  }
  if (client) _sb.from("clients").update({ projects_count: client.projects + 1 }).eq("id", client.id).then();
  return { project: p };
};
const addTasksBulk = async (projectId, items) => {
  const uid = _uid();
  if (!uid || !items || !items.length) return;
  const pid = projectId || "__none__";
  if (!_store.TASKS[pid]) _store.TASKS[pid] = [];
  const tasks = items.map((it) => ({
    id: _id(),
    title: it.title || "Tarea",
    column: it.column || "todo",
    assignee: it.assignee || "T\xFA",
    clientId: null,
    clientName: null,
    phase: it.phase || null,
    done: false,
    deadline: null
  }));
  _store.TASKS[pid] = [...tasks, ..._store.TASKS[pid] || []];
  _emit();
  const { error } = await _insertAdaptive("tasks", tasks.map((t) => ({
    id: t.id,
    agency_id: uid,
    project_id: pid === "__none__" ? null : pid,
    title: t.title,
    col: t.column,
    assignee: t.assignee,
    client_id: null,
    client_name: null,
    deadline: null,
    done: false,
    phase: t.phase || null
  })));
  if (error) {
    console.error("[addTasksBulk] Supabase error:", error.message, "| code:", error.code, "| hint:", error.hint);
    const ids = new Set(tasks.map((t) => t.id));
    _store.TASKS[pid] = (_store.TASKS[pid] || []).filter((x) => !ids.has(x.id));
    _emit();
  }
};
const deleteProject = (id) => {
  const uid = _uid();
  if (!uid) return;
  _store.PROJECTS = _store.PROJECTS.filter((p) => p.id !== id);
  _store.DELIVERABLES = _store.DELIVERABLES.filter((d) => d.projectId !== id);
  delete _store.TASKS[id];
  _emit();
  _sb.from("tasks").delete().eq("project_id", id).then();
  _sb.from("projects").delete().eq("id", id).then();
};
const updateProject = (id, changes) => {
  const uid = _uid();
  if (!uid) return;
  if (changes.payments !== void 0) _setProjPayLocal(id, changes.payments);
  _store.PROJECTS = _store.PROJECTS.map((p) => p.id === id ? { ...p, ...changes } : p);
  _emit();
  const dbChanges = {};
  if (changes.amount !== void 0) dbChanges.budget = Number(changes.amount) || 0;
  if (changes.name !== void 0) dbChanges.name = changes.name;
  if (changes.service !== void 0) dbChanges.service = changes.service;
  if (changes.deadline !== void 0) dbChanges.deadline = changes.deadline;
  if (changes.description !== void 0) dbChanges.description = changes.description;
  if (changes.recurring !== void 0) dbChanges.recurring = changes.recurring;
  if (changes.clientId !== void 0) dbChanges.client_id = changes.clientId || null;
  if (changes.clientName !== void 0) dbChanges.client_name = changes.clientName || null;
  if (changes.phasesDone !== void 0) dbChanges.phases_done = JSON.stringify(changes.phasesDone || []);
  if (changes.phasesDesc !== void 0) dbChanges.phases_desc = JSON.stringify(changes.phasesDesc || {});
  if (Object.keys(dbChanges).length) {
    _updateAdaptive("projects", id, dbChanges).then(({ error }) => {
      if (error) console.error("[updateProject] Supabase error:", error.message);
    });
  }
};
const toggleProjectPhase = (id, name) => {
  const p = _store.PROJECTS.find((x) => x.id === id);
  if (!p) return;
  const done = new Set(p.phasesDone || []);
  if (done.has(name)) done.delete(name);
  else done.add(name);
  updateProject(id, { phasesDone: [...done] });
};
const setProjectPhaseDesc = (id, name, desc) => {
  const p = _store.PROJECTS.find((x) => x.id === id);
  if (!p) return;
  const map = { ...p.phasesDesc || {} };
  if (desc && desc.trim()) map[name] = desc.trim();
  else delete map[name];
  updateProject(id, { phasesDesc: map });
};
const addInvoice = (input) => {
  const uid = _uid();
  if (!uid) return;
  const client = _store.CLIENTS.find((c) => c.id === input.clientId);
  const project = _store.PROJECTS.find((p) => p.id === input.projectId);
  const num = "F-" + (/* @__PURE__ */ new Date()).getFullYear() + "-" + String(100 + _store.INVOICES.length).padStart(3, "0");
  const inv = {
    id: num,
    clientId: input.clientId,
    project: project?.name || "\u2014",
    client: client?.company || "\u2014",
    amount: Number(input.amount) || 0,
    type: input.type || "Extra",
    issued: "hoy",
    due: "+15 d",
    status: "pending"
  };
  _store.INVOICES = [inv, ..._store.INVOICES];
  _emit();
  _sb.from("invoices").insert({
    id: inv.id,
    agency_id: uid,
    client_id: inv.clientId,
    project_id: input.projectId || null,
    client_name: inv.client,
    project_name: inv.project,
    amount: inv.amount,
    type: inv.type,
    issued: inv.issued,
    due: inv.due,
    status: inv.status
  }).then(({ error }) => {
    if (error) {
      console.error("[addInvoice] Supabase error:", error.message, "| code:", error.code, "| hint:", error.hint);
      _store.INVOICES = _store.INVOICES.filter((x) => x.id !== inv.id);
      _emit();
    }
  });
  return inv;
};
const deleteInvoice = (id) => {
  const uid = _uid();
  if (!uid) return;
  _store.INVOICES = _store.INVOICES.filter((i) => i.id !== id);
  _emit();
  _sb.from("invoices").delete().eq("id", id).then();
};
const addDeliverable = (input) => {
  const uid = _uid();
  if (!uid) return;
  const d = {
    id: _id(),
    projectId: input.projectId,
    title: input.title || "Entregable",
    type: input.type || "Dise\xF1o",
    thumb: input.thumb || "linear-gradient(135deg,#1f2937,#0f172a)",
    status: "review",
    date: "hoy",
    version: input.version || "v1"
  };
  _store.DELIVERABLES = [d, ..._store.DELIVERABLES];
  _emit();
  _sb.from("deliverables").insert({
    id: d.id,
    agency_id: uid,
    project_id: d.projectId,
    title: d.title,
    type: d.type,
    thumb: d.thumb,
    status: d.status,
    date: d.date,
    version: d.version
  }).then();
  return d;
};
const deleteDeliverable = (id) => {
  const uid = _uid();
  if (!uid) return;
  _store.DELIVERABLES = _store.DELIVERABLES.filter((d) => d.id !== id);
  _emit();
  _sb.from("deliverables").delete().eq("id", id).then();
};
const credentialsForClient = (clientId) => (_store.CREDENTIALS || []).filter((c) => c.clientId === clientId);
const addCredential = (clientId, input) => {
  const uid = _uid();
  if (!uid) return;
  const prof = _store._prof || {};
  const cid = clientId || prof.clientDbId;
  if (!cid) return;
  const agencyId = prof.agencyId || uid;
  const cr = {
    id: _id(),
    clientId: cid,
    label: (input.label || "").trim(),
    url: (input.url || "").trim(),
    username: (input.username || "").trim(),
    password: input.password || "",
    notes: (input.notes || "").trim(),
    platform: input.platform || "",
    granted: false
  };
  _store.CREDENTIALS = [cr, ..._store.CREDENTIALS];
  _emit();
  _insertAdaptive("credentials", {
    id: cr.id,
    agency_id: agencyId,
    client_id: cid,
    label: cr.label,
    url: cr.url,
    username: cr.username,
    password: cr.password,
    notes: cr.notes,
    platform: cr.platform,
    granted: false
  }).then(({ error }) => {
    if (error) {
      console.error("[addCredential] Supabase error:", error.message);
      _store.CREDENTIALS = _store.CREDENTIALS.filter((x) => x.id !== cr.id);
      _emit();
    }
  });
  return cr;
};
const updateCredential = (id, changes) => {
  const uid = _uid();
  if (!uid) return;
  _store.CREDENTIALS = _store.CREDENTIALS.map((c) => c.id === id ? { ...c, ...changes } : c);
  _emit();
  const db = {};
  ["label", "url", "username", "password", "notes", "platform"].forEach((k) => {
    if (changes[k] !== void 0) db[k] = changes[k] || "";
  });
  if (changes.granted !== void 0) db.granted = !!changes.granted;
  _updateAdaptive("credentials", id, db);
};
const deleteCredential = (id) => {
  const uid = _uid();
  if (!uid) return;
  const prev = _store.CREDENTIALS;
  _store.CREDENTIALS = _store.CREDENTIALS.filter((c) => c.id !== id);
  _emit();
  _sb.from("credentials").delete().eq("id", id).then(({ error }) => {
    if (error) {
      _store.CREDENTIALS = prev;
      _emit();
    }
  });
};
const clientTasksFor = (clientId) => (_store.CLIENT_TASKS || []).filter((t) => t.clientId === clientId).sort((a, b) => a.sort - b.sort);
const addClientTask = (clientId, input) => {
  const uid = _uid();
  if (!uid) return;
  const prof = _store._prof || {};
  const cid = clientId || prof.clientDbId;
  if (!cid) return;
  const agencyId = prof.agencyId || uid;
  const sort = _store.CLIENT_TASKS.filter((t2) => t2.clientId === cid).length + 1;
  const t = {
    id: _id(),
    clientId: cid,
    title: (input.title || "").trim(),
    description: (input.description || "").trim(),
    done: false,
    sort
  };
  _store.CLIENT_TASKS = [..._store.CLIENT_TASKS, t];
  _emit();
  _insertAdaptive("client_tasks", {
    id: t.id,
    agency_id: agencyId,
    client_id: cid,
    title: t.title,
    description: t.description,
    done: false,
    sort
  }).then(({ error }) => {
    if (error) {
      console.error("[addClientTask] Supabase error:", error.message);
      _store.CLIENT_TASKS = _store.CLIENT_TASKS.filter((x) => x.id !== t.id);
      _emit();
    }
  });
  notify(cid, { title: "Nueva tarea para ti", body: t.title, kind: "task" });
  return t;
};
const updateClientTask = (id, changes) => {
  const uid = _uid();
  if (!uid) return;
  _store.CLIENT_TASKS = _store.CLIENT_TASKS.map((t) => t.id === id ? { ...t, ...changes } : t);
  _emit();
  const db = {};
  if (changes.title !== void 0) db.title = changes.title || "";
  if (changes.description !== void 0) db.description = changes.description || "";
  if (changes.done !== void 0) db.done = !!changes.done;
  _updateAdaptive("client_tasks", id, db);
};
const toggleClientTask = (id) => {
  const t = _store.CLIENT_TASKS.find((x) => x.id === id);
  if (!t) return;
  updateClientTask(id, { done: !t.done });
};
const deleteClientTask = (id) => {
  const uid = _uid();
  if (!uid) return;
  const prev = _store.CLIENT_TASKS;
  _store.CLIENT_TASKS = _store.CLIENT_TASKS.filter((t) => t.id !== id);
  _emit();
  _sb.from("client_tasks").delete().eq("id", id).then(({ error }) => {
    if (error) {
      _store.CLIENT_TASKS = prev;
      _emit();
    }
  });
};
const notify = (clientId, input) => {
  const uid = _uid();
  if (!uid || !clientId) return;
  const prof = _store._prof || {};
  const agencyId = prof.agencyId || uid;
  const n = { id: _id(), clientId, title: (input.title || "").trim(), body: (input.body || "").trim(), kind: input.kind || "", read: false, createdAt: null };
  _store.NOTIFICATIONS = [n, ..._store.NOTIFICATIONS];
  _emit();
  _insertAdaptive("notifications", { id: n.id, agency_id: agencyId, client_id: clientId, title: n.title, body: n.body, kind: n.kind, read: false }).then(({ error }) => {
    if (error) {
      _store.NOTIFICATIONS = _store.NOTIFICATIONS.filter((x) => x.id !== n.id);
      _emit();
    }
  });
  try {
    const cli = (_store.CLIENTS || []).find((c) => c.id === clientId);
    const to = cli && cli.email;
    if (to) {
      apiFetch("/api/mail/notify_client", {
        to,
        client_name: cli.name || "",
        title: n.title,
        body: n.body,
        kind: n.kind
      }).catch(() => {
      });
    }
  } catch {
  }
  return n;
};
const markNotificationRead = (id) => {
  _store.NOTIFICATIONS = _store.NOTIFICATIONS.map((n) => n.id === id ? { ...n, read: true } : n);
  _emit();
  _sb.from("notifications").update({ read: true }).eq("id", id).then();
};
const markAllNotificationsRead = () => {
  const ids = _store.NOTIFICATIONS.filter((n) => !n.read).map((n) => n.id);
  if (!ids.length) return;
  _store.NOTIFICATIONS = _store.NOTIFICATIONS.map((n) => ({ ...n, read: true }));
  _emit();
  _sb.from("notifications").update({ read: true }).in("id", ids).then();
};
const addLead = (input) => {
  const uid = _uid();
  if (!uid) return;
  const l = {
    id: _id(),
    name: input.name || "Sin nombre",
    company: input.company || "\u2014",
    channel: input.channel || "linkedin",
    stage: "new",
    budget: input.budget || 0,
    light: "green",
    enteredAt: "ahora",
    next: "Cualificar",
    nextDate: "\u2014",
    needs: input.message || "",
    when: "\u2014",
    instagram: input.instagram || ""
  };
  _store.LEADS = [l, ..._store.LEADS];
  _emit();
  _insertAdaptive("leads", {
    id: l.id,
    agency_id: uid,
    name: l.name,
    company: l.company,
    channel: l.channel,
    stage: l.stage,
    budget: l.budget,
    light: l.light,
    entered_at: l.enteredAt,
    next: l.next,
    next_date: l.nextDate,
    needs: l.needs,
    when_field: l.when,
    instagram: l.instagram || null
  }).then(({ error }) => {
    if (error) {
      console.error("[addLead] Supabase error:", error.message);
      _store.LEADS = _store.LEADS.filter((x) => x.id !== l.id);
      _emit();
    }
  });
  return l;
};
const addTask = (input) => {
  const uid = _uid();
  if (!uid) return;
  const pid = input.projectId || "__none__";
  if (!_store.TASKS[pid]) _store.TASKS[pid] = [];
  const t = {
    id: _id(),
    title: input.title || "Tarea",
    column: input.column || "todo",
    assignee: input.assignee || "T\xFA",
    clientId: input.clientId || null,
    clientName: input.clientName || null,
    phase: input.phase || null,
    notes: input.notes || null,
    done: false,
    deadline: input.deadline || null
  };
  _setTaskNoteLocal(t.id, t.notes);
  _store.TASKS[pid] = [t, ..._store.TASKS[pid]];
  _emit();
  _insertAdaptive("tasks", {
    id: t.id,
    agency_id: uid,
    project_id: pid === "__none__" ? null : pid,
    title: t.title,
    col: t.column,
    assignee: t.assignee,
    client_id: t.clientId || null,
    client_name: t.clientName || null,
    deadline: t.deadline || null,
    phase: t.phase || null,
    notes: t.notes || null,
    done: false
  }).then(({ error }) => {
    if (error) {
      console.error("[addTask] Supabase error:", error.message, "| code:", error.code, "| hint:", error.hint);
      _store.TASKS[pid] = (_store.TASKS[pid] || []).filter((x) => x.id !== t.id);
      _emit();
    }
  });
  return t;
};
const DAY_CUTOFF_HOUR = 3;
const _logicalNow = () => {
  const n = /* @__PURE__ */ new Date();
  if (n.getHours() < DAY_CUTOFF_HOUR) n.setDate(n.getDate() - 1);
  return n;
};
const _todayStr = () => {
  const n = _logicalNow();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
};
const _todayDate = () => {
  const n = _logicalNow();
  n.setHours(0, 0, 0, 0);
  return n;
};
const _RKEY = "141_routines";
const _RDKEY = "141_routine_done";
const _loadLS = (k, def) => {
  try {
    const v = JSON.parse(localStorage.getItem(k));
    return v == null ? def : v;
  } catch (e) {
    return def;
  }
};
const _saveLS = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch (e) {
  }
};
const _userdataGet = async () => {
  try {
    const r = await window.apiFetch("/api/userdata/get", {});
    const j = await r.json();
    return j && j.ok ? j.data || {} : {};
  } catch (e) {
    return {};
  }
};
const _udLatest = {};
const _udChain = {};
const _userdataSet = (key, value) => {
  _udLatest[key] = value;
  const send = async () => {
    try {
      await window.apiFetch("/api/userdata/set", { key, value: _udLatest[key] });
    } catch (e) {
    }
  };
  _udChain[key] = (_udChain[key] || Promise.resolve()).then(send);
};
window._userdataSet = _userdataSet;
_store.ROUTINES = [];
_store.ROUTINE_DONE = {};
_store.FINANCE = { subs: [], expenses: [] };
const _syncUserData = async () => {
  const blob = await _userdataGet();
  const _migrate = (lsKey, serverKey, hasData) => {
    if (blob[serverKey] !== void 0) return null;
    try {
      const v = JSON.parse(localStorage.getItem(lsKey) || "null");
      if (v != null && hasData(v)) {
        _userdataSet(serverKey, v);
        return v;
      }
    } catch (e) {
    }
    return null;
  };
  _store.ROUTINES = Array.isArray(blob.routines) ? blob.routines : _migrate("141_routines", "routines", (v) => Array.isArray(v) && v.length) || [];
  _store.ROUTINE_DONE = blob.routineDone && typeof blob.routineDone === "object" ? blob.routineDone : _migrate("141_routine_done", "routineDone", (v) => v && Object.keys(v).length) || {};
  _store.ROUTINE_LOGS = blob.routineLogs && typeof blob.routineLogs === "object" ? blob.routineLogs : {};
  if (blob.finance && typeof blob.finance === "object") {
    _store.FINANCE = { subs: blob.finance.subs || [], expenses: blob.finance.expenses || [] };
  } else {
    const m = _migrate("141_finance_v1", "finance", (v) => v && ((v.subs || []).length || (v.expenses || []).length));
    _store.FINANCE = m ? { subs: m.subs || [], expenses: m.expenses || [] } : { subs: [], expenses: [] };
  }
  try {
    ["141_routines", "141_routine_done", "141_finance_v1"].forEach((k) => localStorage.removeItem(k));
  } catch (e) {
  }
  _emit();
  window.dispatchEvent(new CustomEvent("141-userdata-synced"));
};
const saveFinance = (next) => {
  _store.FINANCE = { subs: next && next.subs || [], expenses: next && next.expenses || [] };
  _userdataSet("finance", _store.FINANCE);
  _emit();
};
const _cleanDays = (days) => Array.isArray(days) ? [...new Set(days.map((n) => Number(n)).filter((n) => n >= 0 && n <= 6))].sort() : [];
const stepAppliesOn = (item, dateStr) => {
  const days = item && item.days;
  if (!Array.isArray(days) || days.length === 0 || days.length === 7) return true;
  return days.includes((/* @__PURE__ */ new Date(dateStr + "T12:00:00")).getDay());
};
const _routineMatchesDay = (r, dateStr) => {
  const d = /* @__PURE__ */ new Date(dateStr + "T12:00:00");
  const start = /* @__PURE__ */ new Date((r.startDate || dateStr) + "T12:00:00");
  d.setHours(12, 0, 0, 0);
  start.setHours(12, 0, 0, 0);
  if (d < start) return false;
  const dow = d.getDay();
  if (r.frequency === "daily") return true;
  if (r.frequency === "weekdays") return dow >= 1 && dow <= 5;
  if (r.frequency === "weekly") return dow === start.getDay();
  if (r.frequency === "monthly") return d.getDate() === start.getDate();
  return true;
};
const routinesForDay = (dateStr) => (_store.ROUTINES || []).filter((r) => _routineMatchesDay(r, dateStr));
const addRoutine = (input) => {
  const r = {
    id: _id(),
    title: (input.title || "Rutina").trim(),
    frequency: input.frequency || "daily",
    startDate: input.startDate || _todayStr(),
    items: (input.items || []).map((it) => typeof it === "string" ? { text: it } : it).map((it) => ({ id: _id(), text: (it.text || "").trim(), days: _cleanDays(it.days) })).filter((it) => it.text),
    createdAt: Date.now()
  };
  _store.ROUTINES = [r, ..._store.ROUTINES || []];
  _userdataSet("routines", _store.ROUTINES);
  _emit();
  return r;
};
const updateRoutine = (id, changes) => {
  _store.ROUTINES = (_store.ROUTINES || []).map((r) => {
    if (r.id !== id) return r;
    const next = { ...r, ...changes };
    if (changes.items) {
      next.items = changes.items.map((it) => typeof it === "string" ? { id: _id(), text: it } : it).map((it) => ({ id: it.id || _id(), text: (it.text || "").trim(), days: _cleanDays(it.days) })).filter((it) => it.text);
    }
    return next;
  });
  _userdataSet("routines", _store.ROUTINES);
  _emit();
};
const deleteRoutine = (id) => {
  _store.ROUTINES = (_store.ROUTINES || []).filter((r) => r.id !== id);
  const done = { ..._store.ROUTINE_DONE };
  delete done[id];
  _store.ROUTINE_DONE = done;
  _userdataSet("routines", _store.ROUTINES);
  _userdataSet("routineDone", _store.ROUTINE_DONE);
  _emit();
};
const clearRoutines = () => {
  _store.ROUTINES = [];
  _store.ROUTINE_DONE = {};
  _userdataSet("routines", []);
  _userdataSet("routineDone", {});
  _emit();
};
const _routineVal = (routineId, dateStr, itemId) => {
  const v = _store.ROUTINE_DONE?.[routineId]?.[dateStr]?.[itemId];
  if (v === true) return 100;
  if (typeof v === "number") return Math.max(0, Math.min(100, v));
  return 0;
};
const _MACRO_GOALS = { kcal: 2500, protein: 140, fat: 70, carbs: 330 };
const _parseStepsGoal = (text) => {
  const m = (text || "").replace(/[.\s]/g, "").match(/(\d{3,7})/);
  return m ? parseInt(m[1], 10) : 1e4;
};
const _itemMetric = (routineId, itemId) => {
  const r = (_store.ROUTINES || []).find((x) => x.id === routineId);
  const it = r && (r.items || []).find((i) => i.id === itemId);
  const t = (it && it.text || "").toLowerCase();
  if (t.includes("peso")) return "weight";
  if (t.includes("macro")) return "macros";
  if (t.includes("paso")) return "steps";
  return null;
};
const routineItemProgress = (routineId, dateStr, itemId) => {
  const metric = _itemMetric(routineId, itemId);
  if (metric) {
    const log = routineItemLog(routineId, dateStr, itemId);
    if (!log) return 0;
    if (metric === "weight") return log.weight != null ? 100 : 0;
    if (metric === "steps") {
      const r = (_store.ROUTINES || []).find((x) => x.id === routineId);
      const it = r && (r.items || []).find((i) => i.id === itemId);
      const goal = _parseStepsGoal(it && it.text);
      const s = Number(log.steps) || 0;
      return goal ? Math.min(100, Math.round(s / goal * 100)) : s > 0 ? 100 : 0;
    }
    const keys = Object.keys(_MACRO_GOALS);
    let sum = 0;
    keys.forEach((k) => {
      const v = Number(log[k]) || 0;
      sum += Math.min(1, v / _MACRO_GOALS[k]);
    });
    return Math.round(sum / keys.length * 100);
  }
  return _routineVal(routineId, dateStr, itemId);
};
const routineItemDone = (routineId, dateStr, itemId) => routineItemProgress(routineId, dateStr, itemId) >= 100;
const setRoutineItemProgress = (routineId, dateStr, itemId, pct) => {
  const val = Math.max(0, Math.min(100, Math.round(Number(pct) || 0)));
  const done = { ..._store.ROUTINE_DONE };
  done[routineId] = { ...done[routineId] || {} };
  done[routineId][dateStr] = { ...done[routineId][dateStr] || {} };
  done[routineId][dateStr][itemId] = val;
  _store.ROUTINE_DONE = done;
  _userdataSet("routineDone", _store.ROUTINE_DONE);
  _emit();
};
const toggleRoutineItem = (routineId, dateStr, itemId) => {
  setRoutineItemProgress(routineId, dateStr, itemId, routineItemDone(routineId, dateStr, itemId) ? 0 : 100);
};
const routineItemLog = (routineId, dateStr, itemId) => {
  const v = _store.ROUTINE_LOGS?.[routineId]?.[dateStr]?.[itemId];
  return v && typeof v === "object" ? v : null;
};
const setRoutineItemLog = (routineId, dateStr, itemId, data) => {
  const logs = { ..._store.ROUTINE_LOGS };
  logs[routineId] = { ...logs[routineId] || {} };
  logs[routineId][dateStr] = { ...logs[routineId][dateStr] || {} };
  const empty = !data || Object.keys(data).length === 0;
  if (empty) delete logs[routineId][dateStr][itemId];
  else logs[routineId][dateStr][itemId] = data;
  _store.ROUTINE_LOGS = logs;
  _userdataSet("routineLogs", _store.ROUTINE_LOGS);
  _emit();
};
const routineDayComplete = (routineId, dateStr) => {
  const r = (_store.ROUTINES || []).find((x) => x.id === routineId);
  if (!r) return false;
  const items = (r.items || []).filter((it) => stepAppliesOn(it, dateStr));
  if (!items.length) return false;
  return items.every((it) => routineItemDone(routineId, dateStr, it.id));
};
const _ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const routineStreak = (routineId, dateStr) => {
  const r = (_store.ROUTINES || []).find((x) => x.id === routineId);
  if (!r) return 0;
  const start = /* @__PURE__ */ new Date((r.startDate || dateStr) + "T12:00:00");
  start.setHours(12, 0, 0, 0);
  let d = /* @__PURE__ */ new Date(dateStr + "T12:00:00");
  d.setHours(12, 0, 0, 0);
  let streak = 0, guard = 0;
  while (d >= start && guard++ < 730) {
    const ds = _ymd(d);
    if (_routineMatchesDay(r, ds)) {
      if (routineDayComplete(routineId, ds)) streak++;
      else break;
    }
    d.setDate(d.getDate() - 1);
  }
  return streak;
};
const moveTask = (projectId, taskId, newColumn) => {
  const uid = _uid();
  if (!uid) return;
  if (!_store.TASKS[projectId]) return;
  const today = _todayStr();
  let reDate = null;
  _store.TASKS[projectId] = _store.TASKS[projectId].map((t) => {
    if (t.id !== taskId) return t;
    if (newColumn === "done" && t.deadline && t.deadline < today) reDate = today;
    return { ...t, column: newColumn, ...reDate ? { deadline: reDate } : {} };
  });
  _emit();
  const upd = { col: newColumn };
  if (reDate) upd.deadline = reDate;
  _sb.from("tasks").update(upd).eq("id", taskId).then();
};
const updateTask = (projectId, taskId, changes) => {
  const uid = _uid();
  if (!uid) return;
  if (!_store.TASKS[projectId]) return;
  const eff = { ...changes };
  if (eff.notes !== void 0) _setTaskNoteLocal(taskId, eff.notes);
  if (changes.column === "done") {
    const cur = _store.TASKS[projectId].find((t) => t.id === taskId);
    const dl = changes.deadline !== void 0 ? changes.deadline : cur && cur.deadline;
    const today = _todayStr();
    if (dl && dl < today) eff.deadline = today;
  }
  _store.TASKS[projectId] = _store.TASKS[projectId].map(
    (t) => t.id === taskId ? { ...t, ...eff } : t
  );
  _emit();
  const dbChanges = {};
  if (eff.column !== void 0) dbChanges.col = eff.column;
  if (eff.done !== void 0) dbChanges.done = eff.done;
  if (eff.title !== void 0) dbChanges.title = eff.title;
  if (eff.deadline !== void 0) dbChanges.deadline = eff.deadline || null;
  if (eff.progress !== void 0) dbChanges.progress = eff.progress;
  if (eff.phase !== void 0) dbChanges.phase = eff.phase || null;
  if (eff.clientId !== void 0) dbChanges.client_id = eff.clientId || null;
  if (eff.clientName !== void 0) dbChanges.client_name = eff.clientName || null;
  if (eff.notes !== void 0) dbChanges.notes = eff.notes || null;
  _updateAdaptive("tasks", taskId, dbChanges).then(({ error }) => {
    if (error) console.error("[updateTask] Supabase error:", error.message);
  });
};
const deleteTask = (projectId, taskId) => {
  const uid = _uid();
  if (!uid) return;
  if (!_store.TASKS[projectId]) return;
  _store.TASKS[projectId] = _store.TASKS[projectId].filter((t) => t.id !== taskId);
  _emit();
  _sb.from("tasks").delete().eq("id", taskId).then();
};
const _cleanupOldTasks = () => {
  const uid = _uid();
  if (!uid) return;
  const cut = /* @__PURE__ */ new Date();
  cut.setHours(0, 0, 0, 0);
  cut.setDate(cut.getDate() - 30);
  const cutStr = `${cut.getFullYear()}-${String(cut.getMonth() + 1).padStart(2, "0")}-${String(cut.getDate()).padStart(2, "0")}`;
  const cutISO = cut.toISOString();
  _sb.from("tasks").delete().eq("agency_id", uid).is("project_id", null).lt("deadline", cutStr).then();
  _sb.from("tasks").delete().eq("agency_id", uid).is("project_id", null).is("deadline", null).lt("created_at", cutISO).then();
  if (_store.TASKS["__none__"]) {
    const before = _store.TASKS["__none__"].length;
    _store.TASKS["__none__"] = _store.TASKS["__none__"].filter((t) => !(t.deadline && t.deadline < cutStr));
    if (_store.TASKS["__none__"].length !== before) _emit();
  }
};
const updateSettings = (changes) => {
  const uid = _uid();
  if (!uid) return;
  _store.SETTINGS = { ..._store.SETTINGS, ...changes };
  _emit();
  _sb.from("settings").upsert({
    agency_id: uid,
    ..._store.SETTINGS,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }).then();
};
const createInvite = async (arg = {}) => {
  const opts = typeof arg === "string" ? { service: arg } : arg || {};
  const uid = _uid();
  if (!uid) return { error: "Sesi\xF3n no v\xE1lida \u2014 vuelve a iniciar sesi\xF3n" };
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  const token = [...Array(24)].map(() => chars[Math.floor(Math.random() * chars.length)]).join("");
  const payload = { token, agency_id: uid, service: opts.service || "", used: false };
  if (opts.clientId) payload.client_id = opts.clientId;
  const { error } = await _sb.from("invites").insert(payload);
  if (error) {
    console.error("createInvite error:", error);
    return { error: error.message || error.hint || "No se pudo crear la invitaci\xF3n" };
  }
  return { token };
};
const apiFetch = async (path, body = {}) => {
  let token = null;
  try {
    const { data: { session } } = await _sb.auth.getSession();
    token = session?.access_token || null;
  } catch {
  }
  return fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...token ? { "Authorization": `Bearer ${token}` } : {}
    },
    body: JSON.stringify(body)
  });
};
window.apiFetch = apiFetch;
window.Data = {
  // Static
  TEAM,
  ME,
  PHASES,
  ROADMAP_P1,
  LEAD_STAGES,
  CHANNELS,
  KPIS_WEEK,
  ACTIVITY,
  DRIVE_FOLDERS,
  INTAKE_SECTIONS,
  CALL_PREP,
  // Live getters
  get CLIENTS() {
    return _store.CLIENTS;
  },
  get PROJECTS() {
    return _store.PROJECTS;
  },
  get INVOICES() {
    return _store.INVOICES;
  },
  get DELIVERABLES() {
    return _store.DELIVERABLES;
  },
  get LEADS() {
    return _store.LEADS;
  },
  get TASKS() {
    return _store.TASKS;
  },
  get CREDENTIALS() {
    return _store.CREDENTIALS;
  },
  get CLIENT_TASKS() {
    return _store.CLIENT_TASKS;
  },
  get NOTIFICATIONS() {
    return _store.NOTIFICATIONS;
  },
  get ROUTINES() {
    return _store.ROUTINES;
  },
  get FINANCE() {
    return _store.FINANCE;
  },
  get SETTINGS() {
    return _store.SETTINGS;
  },
  // Auth
  authLogin,
  authSignOut,
  initAccount,
  // Re-fetch all data from Supabase (p. ej. al abrir una página)
  reload: () => _loadAll(),
  // Supabase client (for onboarding)
  _sb,
  _SB_URL,
  _SB_KEY,
  // Mutators
  addClient,
  updateClient,
  deleteClient,
  addProject,
  addProjectAsync,
  addTasksBulk,
  deleteProject,
  updateProject,
  toggleProjectPhase,
  setProjectPhaseDesc,
  PAY_PLANS: _PAY_PLANS,
  buildPayments,
  addInvoice,
  deleteInvoice,
  addDeliverable,
  deleteDeliverable,
  credentialsForClient,
  addCredential,
  updateCredential,
  deleteCredential,
  CRED_CATALOG,
  credMode,
  credMeta: _credMeta,
  clientTasksFor,
  addClientTask,
  updateClientTask,
  toggleClientTask,
  deleteClientTask,
  notify,
  markNotificationRead,
  markAllNotificationsRead,
  addLead,
  addTask,
  moveTask,
  updateTask,
  deleteTask,
  addRoutine,
  updateRoutine,
  deleteRoutine,
  clearRoutines,
  routinesForDay,
  routineItemDone,
  toggleRoutineItem,
  routineItemProgress,
  setRoutineItemProgress,
  stepAppliesOn,
  routineItemLog,
  setRoutineItemLog,
  parseStepsGoal: _parseStepsGoal,
  today: _todayStr,
  todayDate: _todayDate,
  routineDayComplete,
  routineStreak,
  saveFinance,
  updateSettings,
  createInvite,
  useStore
};

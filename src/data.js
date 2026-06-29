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
  SETTINGS: { ...SETTINGS_DEFAULT },
  _user: null,
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
  since: "\u2014"
  // no existe en DB
};
const _mp = (r) => r && {
  id: r.id,
  name: r.name,
  clientId: r.client_id,
  clientName: r.client_name,
  service: r.service,
  light: r.light,
  phase: r.phase,
  week: r.week,
  progress: r.progress,
  budget: r.budget,
  deadline: r.deadline,
  nextMilestone: r.next_milestone,
  revisionsUsed: r.revisions_used,
  description: r.description
};
const _mt = (r) => r && {
  id: r.id,
  title: r.title,
  column: r.col,
  assignee: r.assignee,
  clientId: r.client_id,
  clientName: r.client_name,
  done: r.done,
  deadline: r.deadline
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
  when: r.when_field
};
const _ms = (r) => r && {
  name: r.name,
  email: r.email,
  phone: r.phone,
  website: r.website,
  tagline: r.tagline
};
const _loadAll = async () => {
  var _a, _b, _c;
  const uid = (_a = _store._user) == null ? void 0 : _a.id;
  if (!uid) return;
  const agencyEmail = ((_b = _store._user) == null ? void 0 : _b.email) || "";
  const { error: agErr } = await _sb.from("agencies").upsert({ id: uid, name: "141'STUDIO", email: agencyEmail }, { onConflict: "id" });
  if (agErr) console.error("[agencies upsert]", agErr.message, agErr.code, agErr.details);
  let prof = null;
  try {
    const { data: profData, error: profErr } = await _sb.from("profiles").select("*").eq("id", uid).maybeSingle();
    if (profData) {
      prof = profData;
    } else if (!profErr || profErr.code === "PGRST116") {
      const { data: created } = await _sb.from("profiles").upsert({ id: uid, role: "admin", name: "", initials: "", agency_id: uid }).select().single();
      prof = created;
    }
  } catch (e) {
  }
  if (!prof) prof = { role: "admin", agency_id: uid };
  const agencyId = prof.agency_id || uid;
  const isClient = prof.role === "client";
  const clientDbId = prof.client_db_id;
  if (isClient) {
    const [proj, inv, sett] = await Promise.all([
      _sb.from("projects").select("*").eq("agency_id", agencyId).eq("client_id", clientDbId),
      _sb.from("invoices").select("*").eq("agency_id", agencyId).eq("client_id", clientDbId),
      _sb.from("settings").select("*").eq("agency_id", agencyId).maybeSingle()
    ]);
    _store.PROJECTS = (proj.data || []).map(_mp);
    _store.INVOICES = (inv.data || []).map(_mi);
    _store.SETTINGS = _ms(sett.data) || { ...SETTINGS_DEFAULT };
    _store.CLIENTS = [];
    _store.LEADS = [];
    _store.TASKS = {};
    if ((_c = proj.data) == null ? void 0 : _c.length) {
      const pids = proj.data.map((p) => p.id);
      const { data: dData } = await _sb.from("deliverables").select("*").in("project_id", pids);
      _store.DELIVERABLES = (dData || []).map(_md);
    } else {
      _store.DELIVERABLES = [];
    }
  } else {
    const [c, p, i, d, l, t, s] = await Promise.all([
      _sb.from("clients").select("*").eq("agency_id", uid).order("created_at", { ascending: false }),
      _sb.from("projects").select("*").eq("agency_id", uid).order("created_at", { ascending: false }),
      _sb.from("invoices").select("*").eq("agency_id", uid).order("created_at", { ascending: false }),
      _sb.from("deliverables").select("*").eq("agency_id", uid).order("created_at", { ascending: false }),
      _sb.from("leads").select("*").eq("agency_id", uid).order("created_at", { ascending: false }),
      _sb.from("tasks").select("*").eq("agency_id", uid).order("created_at", { ascending: false }),
      _sb.from("settings").select("*").eq("agency_id", uid).maybeSingle()
    ]);
    _store.CLIENTS = (c.data || []).map(_mc);
    _store.PROJECTS = (p.data || []).map(_mp);
    _store.INVOICES = (i.data || []).map(_mi);
    _store.DELIVERABLES = (d.data || []).map(_md);
    _store.LEADS = (l.data || []).map(_ml);
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
  var _a;
  const uid = (_a = _store._user) == null ? void 0 : _a.id;
  if (!uid) return;
  if (_channel) {
    _sb.removeChannel(_channel);
    _channel = null;
  }
  _channel = _sb.channel("agency_rt_" + uid).on("postgres_changes", { event: "*", schema: "public", table: "clients", filter: "agency_id=eq." + uid }, _loadAll).on("postgres_changes", { event: "*", schema: "public", table: "projects", filter: "agency_id=eq." + uid }, _loadAll).on("postgres_changes", { event: "*", schema: "public", table: "tasks", filter: "agency_id=eq." + uid }, _loadAll).on("postgres_changes", { event: "*", schema: "public", table: "invoices", filter: "agency_id=eq." + uid }, _loadAll).on("postgres_changes", { event: "*", schema: "public", table: "leads", filter: "agency_id=eq." + uid }, _loadAll).on("postgres_changes", { event: "*", schema: "public", table: "deliverables", filter: "agency_id=eq." + uid }, _loadAll).subscribe();
};
const authLogin = async (email, password) => {
  var _a;
  const { data, error } = await _sb.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };
  let prof = null;
  try {
    const { data: profData } = await _sb.from("profiles").select("*").eq("id", data.user.id).maybeSingle();
    if (profData) {
      prof = profData;
    } else {
      const uid = data.user.id;
      const { data: created } = await _sb.from("profiles").upsert({ id: uid, role: "admin", name: "", initials: "", agency_id: uid }).select().single();
      prof = created;
    }
  } catch (e) {
  }
  if (!prof) prof = { role: "admin", agency_id: data.user.id };
  return {
    ok: true,
    session: {
      email: data.user.email,
      role: (prof == null ? void 0 : prof.role) || "admin",
      name: (prof == null ? void 0 : prof.name) || data.user.email,
      initials: (prof == null ? void 0 : prof.initials) || ((_a = data.user.email[0]) == null ? void 0 : _a.toUpperCase()) || "?",
      agencyId: prof == null ? void 0 : prof.agency_id,
      clientId: prof == null ? void 0 : prof.client_db_id,
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
  if (!(session == null ? void 0 : session.user)) {
    const { data: refreshed } = await _sb.auth.refreshSession();
    session = refreshed == null ? void 0 : refreshed.session;
  }
  if (session == null ? void 0 : session.user) {
    _store._user = session.user;
    await _loadAll();
    _setupRealtime();
  } else {
    window.dispatchEvent(new CustomEvent("141-session-expired"));
  }
};
const _uid = () => {
  var _a;
  return (_a = _store._user) == null ? void 0 : _a.id;
};
const _id = () => crypto.randomUUID();
const _palette = ["#fb7185", "#60a5fa", "#fbbf24", "#34d399", "#a78bfa", "#f472b6", "#22d3ee", "#f59e0b"];
const _initials = (name) => (name || "??").split(/\s+/).filter(Boolean).slice(0, 2).map((s) => {
  var _a;
  return ((_a = s[0]) == null ? void 0 : _a.toUpperCase()) || "";
}).join("") || "??";
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
  _sb.from("clients").update(dbChanges).eq("id", id).then();
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
    clientId: input.clientId,
    clientName: (client == null ? void 0 : client.company) || "\u2014",
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
  return p;
};
const deleteProject = (id) => {
  const uid = _uid();
  if (!uid) return;
  _store.PROJECTS = _store.PROJECTS.filter((p) => p.id !== id);
  _store.DELIVERABLES = _store.DELIVERABLES.filter((d) => d.projectId !== id);
  delete _store.TASKS[id];
  _emit();
  _sb.from("projects").delete().eq("id", id).then();
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
    project: (project == null ? void 0 : project.name) || "\u2014",
    client: (client == null ? void 0 : client.company) || "\u2014",
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
    when: "\u2014"
  };
  _store.LEADS = [l, ..._store.LEADS];
  _emit();
  _sb.from("leads").insert({
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
    when_field: l.when
  }).then();
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
    done: false,
    deadline: input.deadline || null
  };
  _store.TASKS[pid] = [t, ..._store.TASKS[pid]];
  _emit();
  _sb.from("tasks").insert({
    id: t.id,
    agency_id: uid,
    project_id: pid === "__none__" ? null : pid,
    title: t.title,
    col: t.column,
    assignee: t.assignee,
    client_id: t.clientId || null,
    client_name: t.clientName || null,
    deadline: t.deadline || null,
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
const _todayStr = () => {
  const n = /* @__PURE__ */ new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
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
  _sb.from("tasks").update(dbChanges).eq("id", taskId).then();
};
const deleteTask = (projectId, taskId) => {
  const uid = _uid();
  if (!uid) return;
  if (!_store.TASKS[projectId]) return;
  _store.TASKS[projectId] = _store.TASKS[projectId].filter((t) => t.id !== taskId);
  _emit();
  _sb.from("tasks").delete().eq("id", taskId).then();
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
const createInvite = async (service = "") => {
  const uid = _uid();
  if (!uid) return null;
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  const token = [...Array(24)].map(() => chars[Math.floor(Math.random() * chars.length)]).join("");
  const { error } = await _sb.from("invites").insert({ token, agency_id: uid, service, used: false });
  if (error) return null;
  return token;
};
const generarContenidoSocial = async (clientId, encargo) => {
  const uid = _uid();
  if (!uid) throw new Error("No hay sesi\xF3n activa");
  const r = await fetch("/api/agents/social", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ encargo })
  });
  const data = await r.json();
  if (!data.ok) throw new Error(data.error || "fallo generando");
  const { data: deliv, error: dErr } = await _sb.from("deliverables").insert({
    agency_id: uid,
    client_id: clientId || null,
    agent: "social_media",
    title: encargo,
    status: "en_revision"
  }).select().single();
  if (dErr) throw dErr;
  const deliverableId = deliv.id;
  const rows = (data.piezas || []).map((p, i) => ({
    deliverable_id: deliverableId,
    agency_id: uid,
    orden: i,
    dia: p.dia,
    formato: p.formato,
    tema: p.tema,
    caption: p.copy,
    // el JSON trae "copy" pero la columna es "caption"
    hashtags: p.hashtags || [],
    brief_imagen: p.brief_imagen,
    status: "pendiente"
  }));
  if (rows.length) {
    const { error: pErr } = await _sb.from("pieces").insert(rows);
    if (pErr) throw pErr;
  }
  return deliverableId;
};
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
  get SETTINGS() {
    return _store.SETTINGS;
  },
  // Auth
  authLogin,
  authSignOut,
  initAccount,
  // Supabase client (for onboarding)
  _sb,
  _SB_URL,
  _SB_KEY,
  // Mutators
  addClient,
  updateClient,
  deleteClient,
  addProject,
  deleteProject,
  addInvoice,
  deleteInvoice,
  addDeliverable,
  deleteDeliverable,
  addLead,
  addTask,
  moveTask,
  updateTask,
  deleteTask,
  updateSettings,
  createInvite,
  generarContenidoSocial,
  useStore
};
window.generarContenidoSocial = generarContenidoSocial;

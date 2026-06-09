// 141'STUDIO — data layer v10 (Supabase)

// ── Supabase client ─────────────────────────────────────────────────
const _SB_URL = "https://ofnkazimemuiwovhxepq.supabase.co";
const _SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mbmthemltZW11aXdvdmh4ZXBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NTU5OTcsImV4cCI6MjA5NDUzMTk5N30.NVRoZb_Ie2ZgPELFkS7CxNWrLGZcgdOdWGEEkT_CNqo";
const _sb = window.supabase.createClient(_SB_URL, _SB_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});

// ── Static data (sin cambios respecto a v9) ─────────────────────────
const TEAM = [
  { id: "u1", name: "Marta R.", role: "Founder", initials: "MR", color: "#fb7185" },
];
const ME = TEAM[0];

const LEAD_STAGES = [
  { id: "new",       label: "Nuevo" },
  { id: "scheduled", label: "Llamada agendada" },
  { id: "called",    label: "Llamada hecha" },
  { id: "proposal",  label: "Propuesta enviada" },
  { id: "won",       label: "Cerrado" },
  { id: "lost",      label: "Descartado" },
];

const CHANNELS = {
  linkedin:   { label: "LinkedIn",   icon: "users" },
  referral:   { label: "Referido",   icon: "thumbs-up" },
  web:        { label: "Web",        icon: "external-link" },
  cold:       { label: "Cold email", icon: "mail" },
  coldcall:   { label: "Cold call",  icon: "phone" },
  presencial: { label: "Presencial", icon: "map" },
};

const PHASES = [
  { id: "kickoff",  label: "Arranque",  weeks: "Sem 1" },
  { id: "exec1",    label: "Ejecución", weeks: "Sem 2-4" },
  { id: "delivery", label: "Entrega",   weeks: "Sem 5" },
  { id: "close",    label: "Cierre",    weeks: "Sem 6" },
];

const ROADMAP_P1 = [
  { week: 1, label: "Arranque",  phase: "kickoff",  state: "done",    items: ["Onboarding completado","Kickoff día 3","Primer entregable día 7"] },
  { week: 2, label: "Ejecución", phase: "exec1",    state: "done",    items: ["Wireframes home","Auditoría SEO","Inventario contenidos"] },
  { week: 3, label: "Ejecución", phase: "exec1",    state: "done",    items: ["Mockups v1","Mockups v2","Check-in cliente"] },
  { week: 4, label: "Ejecución", phase: "exec1",    state: "current", items: ["Mockups v3 (en curso)","Animación hero","Migración blog"] },
  { week: 5, label: "Entrega",   phase: "delivery", state: "future",  items: ["Revisión 1","Revisión 2","QA final"] },
  { week: 6, label: "Cierre",    phase: "close",    state: "future",  items: ["Lanzamiento","Onboarding cliente","Check-in +7d"] },
];

const KPIS_WEEK = {
  impacts: { current: 0, target: 200, label: "Impactos" },
  leads:   { current: 0, target: 10,  label: "Leads" },
  calls:   { current: 0, target: 3,   label: "Llamadas" },
  closes:  { current: 0, target: 1,   label: "Cierres" },
};

const ACTIVITY = [];

const DRIVE_FOLDERS = [
  { name: "Activos marca", count: 0, size: "—" },
  { name: "Textos",        count: 0, size: "—" },
  { name: "Fotos",         count: 0, size: "—" },
  { name: "Accesos",       count: 0, size: "—" },
  { name: "Entregas",      count: 0, size: "—" },
];

const INTAKE_SECTIONS = [
  { id: "biz",    title: "Información del negocio",  icon: "info",     items: 6, done: 0 },
  { id: "brand",  title: "Identidad visual y marca", icon: "sparkles", items: 5, done: 0 },
  { id: "assets", title: "Materiales del proyecto",  icon: "image",    items: 4, done: 0 },
  { id: "access", title: "Accesos técnicos",         icon: "settings", items: 5, done: 0 },
  { id: "tone",   title: "Preferencias y tono",      icon: "quote",    items: 4, done: 0 },
];

const CALL_PREP = [
  "Leer respuestas Calendly",
  "Revisar web del cliente",
  "Buscar LinkedIn de la persona",
  "Preparar 2 observaciones concretas",
  "Tener mínimo de precio claro",
];

const SETTINGS_DEFAULT = { name: "141'STUDIO", email: "nil@141agency.com", phone: "", website: "", tagline: "Agencia digital" };

// ── Reactive store ──────────────────────────────────────────────────
const _store = {
  CLIENTS: [], PROJECTS: [], INVOICES: [], DELIVERABLES: [],
  LEADS: [], TASKS: {}, SETTINGS: { ...SETTINGS_DEFAULT },
  _user: null,
  _subs: new Set(),
};

const subscribe = (fn) => { _store._subs.add(fn); return () => _store._subs.delete(fn); };
const _emit = () => _store._subs.forEach(fn => fn());

const useStore = () => {
  const [, force] = React.useState(0);
  React.useEffect(() => subscribe(() => force(n => n + 1)), []);
  return _store;
};

// ── Row mappers (DB snake_case → UI camelCase) ──────────────────────
const _mc = r => r && ({
  id: r.id, name: r.name, company: r.company, email: r.email,
  whatsapp: r.whatsapp, initials: r.initials, color: r.color,
  projects: r.projects_count || 0, mrr: r.mrr || 0,
  lastContact: r.last_contact || "ahora", status: r.status,
  service: r.service,
  since: (() => {
    if (!r.since) return "—";
    // Si ya es texto legible (ej: "jun 2026"), lo devuelve tal cual
    if (!/^\d{4}-\d{2}/.test(r.since)) return r.since;
    try {
      const d = new Date(r.since.length === 7 ? r.since + "-01T12:00:00" : r.since + "T12:00:00");
      const M = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
      return M[d.getMonth()] + " " + d.getFullYear();
    } catch { return r.since; }
  })(),
});
const _mp = r => r && ({
  id: r.id, name: r.name, clientId: r.client_id, clientName: r.client_name,
  service: r.service, light: r.light, phase: r.phase, week: r.week,
  progress: r.progress, budget: r.budget, deadline: r.deadline,
  nextMilestone: r.next_milestone, revisionsUsed: r.revisions_used,
  description: r.description,
});
const _mt = r => r && ({
  id: r.id, title: r.title, column: r.col, assignee: r.assignee,
  clientId: r.client_id, clientName: r.client_name,
  done: r.done, deadline: r.deadline,
});
const _mi = r => r && ({
  id: r.id, clientId: r.client_id, project: r.project_name,
  client: r.client_name, amount: r.amount, type: r.type,
  issued: r.issued, due: r.due, status: r.status, paidAt: r.paid_at,
});
const _md = r => r && ({
  id: r.id, projectId: r.project_id, title: r.title, type: r.type,
  thumb: r.thumb, status: r.status, date: r.date, version: r.version,
});
const _ml = r => r && ({
  id: r.id, name: r.name, company: r.company, channel: r.channel,
  stage: r.stage, budget: r.budget, light: r.light,
  enteredAt: r.entered_at, next: r.next, nextDate: r.next_date,
  needs: r.needs, when: r.when_field,
});
const _ms = r => r && ({
  name: r.name, email: r.email, phone: r.phone,
  website: r.website, tagline: r.tagline,
});

// ── Load all data from Supabase ─────────────────────────────────────
const _loadAll = async () => {
  const uid = _store._user?.id;
  if (!uid) return;

  // Get profile to determine role and agency context
  let { data: prof } = await _sb.from("profiles").select("*").eq("id", uid).maybeSingle();
  if (!prof) {
    // Profile missing (admin created via dashboard before trigger) — auto-create
    const { data: created } = await _sb.from("profiles")
      .upsert({ id: uid, role: "admin", name: "", initials: "", agency_id: uid })
      .select().single();
    prof = created;
  }
  if (!prof) return;

  const agencyId   = prof.agency_id || uid;
  const isClient   = prof.role === "client";
  const clientDbId = prof.client_db_id;

  if (isClient) {
    const [proj, inv, sett] = await Promise.all([
      _sb.from("projects").select("*").eq("agency_id", agencyId).eq("client_id", clientDbId),
      _sb.from("invoices").select("*").eq("agency_id", agencyId).eq("client_id", clientDbId),
      _sb.from("settings").select("*").eq("agency_id", agencyId).maybeSingle(),
    ]);
    _store.PROJECTS     = (proj.data  || []).map(_mp);
    _store.INVOICES     = (inv.data   || []).map(_mi);
    _store.SETTINGS     = _ms(sett.data) || { ...SETTINGS_DEFAULT };
    _store.CLIENTS      = [];
    _store.LEADS        = [];
    _store.TASKS        = {};
    if (proj.data?.length) {
      const pids = proj.data.map(p => p.id);
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
      _sb.from("settings").select("*").eq("agency_id", uid).maybeSingle(),
    ]);
    _store.CLIENTS      = (c.data || []).map(_mc);
    _store.PROJECTS     = (p.data || []).map(_mp);
    _store.INVOICES     = (i.data || []).map(_mi);
    _store.DELIVERABLES = (d.data || []).map(_md);
    _store.LEADS        = (l.data || []).map(_ml);
    _store.SETTINGS     = _ms(s.data) || { ...SETTINGS_DEFAULT };
    // Tasks: flat array → { projectId: [tasks] }
    _store.TASKS = {};
    for (const row of (t.data || [])) {
      const pid = row.project_id || "__none__";
      if (!_store.TASKS[pid]) _store.TASKS[pid] = [];
      _store.TASKS[pid].push(_mt(row));
    }
  }
  _emit();
};

// ── Real-time ───────────────────────────────────────────────────────
let _channel = null;
const _setupRealtime = () => {
  const uid = _store._user?.id;
  if (!uid) return;
  if (_channel) { _sb.removeChannel(_channel); _channel = null; }
  _channel = _sb
    .channel("agency_rt_" + uid)
    .on("postgres_changes", { event: "*", schema: "public", table: "clients",      filter: "agency_id=eq." + uid }, _loadAll)
    .on("postgres_changes", { event: "*", schema: "public", table: "projects",     filter: "agency_id=eq." + uid }, _loadAll)
    .on("postgres_changes", { event: "*", schema: "public", table: "tasks",        filter: "agency_id=eq." + uid }, _loadAll)
    .on("postgres_changes", { event: "*", schema: "public", table: "invoices",     filter: "agency_id=eq." + uid }, _loadAll)
    .on("postgres_changes", { event: "*", schema: "public", table: "leads",        filter: "agency_id=eq." + uid }, _loadAll)
    .on("postgres_changes", { event: "*", schema: "public", table: "deliverables", filter: "agency_id=eq." + uid }, _loadAll)
    .subscribe();
};

// ── Auth ────────────────────────────────────────────────────────────
const authLogin = async (email, password) => {
  const { data, error } = await _sb.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };
  let { data: prof } = await _sb.from("profiles").select("*").eq("id", data.user.id).maybeSingle();
  if (!prof) {
    const uid = data.user.id;
    const { data: created } = await _sb.from("profiles")
      .upsert({ id: uid, role: "admin", name: "", initials: "", agency_id: uid })
      .select().single();
    prof = created;
  }
  return {
    ok: true,
    session: {
      email:      data.user.email,
      role:       prof?.role || "admin",
      name:       prof?.name || data.user.email,
      initials:   prof?.initials || data.user.email[0]?.toUpperCase() || "?",
      agencyId:   prof?.agency_id,
      clientId:   prof?.client_db_id,
      adminEmail: data.user.email, // backward compat with z-app
    },
  };
};

const authSignOut = async () => {
  if (_channel) { _sb.removeChannel(_channel); _channel = null; }
  await _sb.auth.signOut();
  _store._user = null;
  _store.CLIENTS = []; _store.PROJECTS = []; _store.INVOICES = [];
  _store.DELIVERABLES = []; _store.LEADS = []; _store.TASKS = {};
  _store.SETTINGS = { ...SETTINGS_DEFAULT };
  _emit();
};

// initAccount — called by z-app after session changes (ignores param, uses Supabase session)
const initAccount = async (_ignored) => {
  let { data: { session } } = await _sb.auth.getSession();
  // Si no hay sesión Supabase, intentar refrescar el token
  if (!session?.user) {
    const { data: refreshed } = await _sb.auth.refreshSession();
    session = refreshed?.session;
  }
  if (session?.user) {
    _store._user = session.user;
    await _loadAll();
    _setupRealtime();
  } else {
    // Sesión antigua sin Supabase válida → forzar re-login
    window.dispatchEvent(new CustomEvent("141-session-expired"));
  }
};

// ── Helpers ─────────────────────────────────────────────────────────
const _uid   = () => _store._user?.id;
const _id    = () => crypto.randomUUID();
const _palette = ["#fb7185","#60a5fa","#fbbf24","#34d399","#a78bfa","#f472b6","#22d3ee","#f59e0b"];
const _initials = name =>
  (name || "??").split(/\s+/).filter(Boolean).slice(0,2).map(s => s[0]?.toUpperCase() || "").join("") || "??";

// ── CLIENTS ─────────────────────────────────────────────────────────
const addClient = (input) => {
  const uid = _uid(); if (!uid) return;
  const c = {
    id: _id(),
    name:        input.name    || "Sin nombre",
    company:     input.company || input.name || "Sin empresa",
    email:       input.email   || "",
    whatsapp:    input.phone   || input.whatsapp || "",
    initials:    _initials(input.company || input.name),
    color:       _palette[_store.CLIENTS.length % _palette.length],
    projects:    0, mrr: 0, lastContact: "ahora",
    status:      "active",
    service:     input.sector || input.type || "—",
    since:       new Date().toISOString().split("T")[0],   // "2026-06-09" — válido para DATE o TEXT
  };
  _store.CLIENTS = [c, ..._store.CLIENTS]; _emit();
  _sb.from("clients").insert({
    id: c.id, agency_id: uid, name: c.name, company: c.company,
    email: c.email, whatsapp: c.whatsapp, initials: c.initials,
    color: c.color, projects_count: 0, mrr: 0, last_contact: null,
    status: c.status, service: c.service, since: c.since,
  }).then(({ error }) => {
    if (error) {
      console.error("[addClient] Supabase error:", error.message, "| code:", error.code, "| details:", error.details, "| hint:", error.hint);
      // Revert optimistic update so UI reflects reality
      _store.CLIENTS = _store.CLIENTS.filter(x => x.id !== c.id);
      _emit();
    }
  });
  return c;
};

const updateClient = (id, changes) => {
  const uid = _uid(); if (!uid) return;
  _store.CLIENTS = _store.CLIENTS.map(c => c.id === id ? { ...c, ...changes } : c); _emit();
  const dbChanges = {};
  if (changes.name        !== undefined) dbChanges.name         = changes.name;
  if (changes.company     !== undefined) dbChanges.company      = changes.company;
  if (changes.email       !== undefined) dbChanges.email        = changes.email;
  if (changes.whatsapp    !== undefined) dbChanges.whatsapp     = changes.whatsapp;
  if (changes.status      !== undefined) dbChanges.status       = changes.status;
  if (changes.mrr         !== undefined) dbChanges.mrr          = changes.mrr;
  if (changes.lastContact !== undefined) dbChanges.last_contact = changes.lastContact;
  if (changes.projects    !== undefined) dbChanges.projects_count = changes.projects;
  _sb.from("clients").update(dbChanges).eq("id", id).then();
};

const deleteClient = async (id) => {
  const uid = _uid(); if (!uid) return;
  // Guardar snapshot por si hay que revertir
  const prevClients  = _store.CLIENTS;
  const prevProjects = _store.PROJECTS;
  const prevInvoices = _store.INVOICES;
  const prevTasks    = { ..._store.TASKS };
  const projectIds   = _store.PROJECTS.filter(p => p.clientId === id).map(p => p.id);
  // Optimistic: eliminar de la UI al instante
  _store.CLIENTS  = _store.CLIENTS.filter(c => c.id !== id);
  _store.PROJECTS = _store.PROJECTS.filter(p => p.clientId !== id);
  _store.INVOICES = _store.INVOICES.filter(i => i.clientId !== id);
  projectIds.forEach(pid => { delete _store.TASKS[pid]; });
  _emit();
  // Persistir en Supabase: borra cliente + cuenta de login si tiene
  // CASCADE borra proyectos/tareas/facturas/entregables automáticamente
  const { error } = await _sb.rpc("delete_client_full", {
    p_client_id: id,
    p_agency_id: uid,
  });
  if (error) {
    // Revertir si Supabase rechaza el delete
    _store.CLIENTS  = prevClients;
    _store.PROJECTS = prevProjects;
    _store.INVOICES = prevInvoices;
    _store.TASKS    = prevTasks;
    _emit();
    console.error("Error al eliminar cliente:", error.message);
  }
};

// ── PROJECTS ─────────────────────────────────────────────────────────
const addProject = (input) => {
  const uid = _uid(); if (!uid) return;
  const client = _store.CLIENTS.find(c => c.id === input.clientId);
  const deadline = (() => {
    if (!input.deadline || input.deadline === "—") return "—";
    if (/^\d{4}-\d{2}-\d{2}$/.test(input.deadline)) {
      const d = new Date(input.deadline + "T12:00:00");
      const M = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
      return `${d.getDate()} ${M[d.getMonth()]}`;
    }
    return input.deadline;
  })();
  const p = {
    id: _id(), name: input.name || "Proyecto sin nombre",
    clientId: input.clientId, clientName: client?.company || "—",
    service: input.template || "—", light: "green", phase: 0, week: 1,
    progress: 0, budget: 0, deadline,
    nextMilestone: "Kickoff", revisionsUsed: 0, description: input.description || "",
  };
  _store.PROJECTS = [p, ..._store.PROJECTS];
  if (client) {
    _store.CLIENTS = _store.CLIENTS.map(c =>
      c.id === client.id ? { ...c, projects: c.projects + 1 } : c
    );
  }
  _emit();
  _sb.from("projects").insert({
    id: p.id, agency_id: uid, client_id: p.clientId, client_name: p.clientName,
    name: p.name, service: p.service, light: p.light, phase: p.phase, week: p.week,
    progress: p.progress, budget: p.budget, deadline: p.deadline,
    next_milestone: p.nextMilestone, revisions_used: 0, description: p.description,
  }).then(({ error }) => {
    if (error) {
      console.error("[addProject] Supabase error:", error.message, "| code:", error.code, "| hint:", error.hint);
      _store.PROJECTS = _store.PROJECTS.filter(x => x.id !== p.id);
      _emit();
    }
  });
  if (client) {
    _sb.from("clients").update({ projects_count: client.projects + 1 }).eq("id", client.id).then();
  }
  return p;
};

const deleteProject = (id) => {
  const uid = _uid(); if (!uid) return;
  _store.PROJECTS     = _store.PROJECTS.filter(p => p.id !== id);
  _store.DELIVERABLES = _store.DELIVERABLES.filter(d => d.projectId !== id);
  delete _store.TASKS[id]; _emit();
  _sb.from("projects").delete().eq("id", id).then();
};

// ── INVOICES ────────────────────────────────────────────────────────
const addInvoice = (input) => {
  const uid = _uid(); if (!uid) return;
  const client  = _store.CLIENTS.find(c => c.id === input.clientId);
  const project = _store.PROJECTS.find(p => p.id === input.projectId);
  const num     = "F-" + new Date().getFullYear() + "-" +
    String(100 + _store.INVOICES.length).padStart(3, "0");
  const inv = {
    id: num, clientId: input.clientId,
    project: project?.name || "—", client: client?.company || "—",
    amount: Number(input.amount) || 0, type: input.type || "Extra",
    issued: "hoy", due: "+15 d", status: "pending",
  };
  _store.INVOICES = [inv, ..._store.INVOICES]; _emit();
  _sb.from("invoices").insert({
    id: inv.id, agency_id: uid, client_id: inv.clientId,
    project_id: input.projectId || null,
    client_name: inv.client, project_name: inv.project,
    amount: inv.amount, type: inv.type,
    issued: inv.issued, due: inv.due, status: inv.status,
  }).then(({ error }) => {
    if (error) {
      console.error("[addInvoice] Supabase error:", error.message, "| code:", error.code, "| hint:", error.hint);
      _store.INVOICES = _store.INVOICES.filter(x => x.id !== inv.id);
      _emit();
    }
  });
  return inv;
};

const deleteInvoice = (id) => {
  const uid = _uid(); if (!uid) return;
  _store.INVOICES = _store.INVOICES.filter(i => i.id !== id); _emit();
  _sb.from("invoices").delete().eq("id", id).then();
};

// ── DELIVERABLES ────────────────────────────────────────────────────
const addDeliverable = (input) => {
  const uid = _uid(); if (!uid) return;
  const d = {
    id: _id(), projectId: input.projectId, title: input.title || "Entregable",
    type: input.type || "Diseño", thumb: input.thumb || "linear-gradient(135deg,#1f2937,#0f172a)",
    status: "review", date: "hoy", version: input.version || "v1",
  };
  _store.DELIVERABLES = [d, ..._store.DELIVERABLES]; _emit();
  _sb.from("deliverables").insert({
    id: d.id, agency_id: uid, project_id: d.projectId,
    title: d.title, type: d.type, thumb: d.thumb,
    status: d.status, date: d.date, version: d.version,
  }).then();
  return d;
};

const deleteDeliverable = (id) => {
  const uid = _uid(); if (!uid) return;
  _store.DELIVERABLES = _store.DELIVERABLES.filter(d => d.id !== id); _emit();
  _sb.from("deliverables").delete().eq("id", id).then();
};

// ── LEADS ────────────────────────────────────────────────────────────
const addLead = (input) => {
  const uid = _uid(); if (!uid) return;
  const l = {
    id: _id(), name: input.name || "Sin nombre",
    company: input.company || "—", channel: input.channel || "linkedin",
    stage: "new", budget: input.budget || 0, light: "green",
    enteredAt: "ahora", next: "Cualificar", nextDate: "—",
    needs: input.message || "", when: "—",
  };
  _store.LEADS = [l, ..._store.LEADS]; _emit();
  _sb.from("leads").insert({
    id: l.id, agency_id: uid, name: l.name, company: l.company,
    channel: l.channel, stage: l.stage, budget: l.budget, light: l.light,
    entered_at: l.enteredAt, next: l.next, next_date: l.nextDate,
    needs: l.needs, when_field: l.when,
  }).then();
  return l;
};

// ── TASKS ────────────────────────────────────────────────────────────
const addTask = (input) => {
  const uid = _uid(); if (!uid) return;
  const pid = input.projectId || "__none__";
  if (!_store.TASKS[pid]) _store.TASKS[pid] = [];
  const t = {
    id: _id(), title: input.title || "Tarea", column: input.column || "todo",
    assignee: input.assignee || "Tú",
    clientId: input.clientId || null, clientName: input.clientName || null,
    phase: input.phase || null,
    done: false, deadline: null,
  };
  _store.TASKS[pid] = [t, ..._store.TASKS[pid]]; _emit();
  _sb.from("tasks").insert({
    id: t.id, agency_id: uid,
    project_id: pid === "__none__" ? null : pid,
    title: t.title, col: t.column, assignee: t.assignee,
    client_id: t.clientId || null, client_name: t.clientName || null,
    done: false,
  }).then(({ error }) => {
    if (error) {
      console.error("[addTask] Supabase error:", error.message, "| code:", error.code, "| hint:", error.hint);
      _store.TASKS[pid] = (_store.TASKS[pid] || []).filter(x => x.id !== t.id);
      _emit();
    }
  });
  return t;
};

const moveTask = (projectId, taskId, newColumn) => {
  const uid = _uid(); if (!uid) return;
  if (!_store.TASKS[projectId]) return;
  _store.TASKS[projectId] = _store.TASKS[projectId].map(t =>
    t.id === taskId ? { ...t, column: newColumn } : t
  ); _emit();
  _sb.from("tasks").update({ col: newColumn }).eq("id", taskId).then();
};

const updateTask = (projectId, taskId, changes) => {
  const uid = _uid(); if (!uid) return;
  if (!_store.TASKS[projectId]) return;
  _store.TASKS[projectId] = _store.TASKS[projectId].map(t =>
    t.id === taskId ? { ...t, ...changes } : t
  ); _emit();
  const dbChanges = {};
  if (changes.column   !== undefined) dbChanges.col      = changes.column;
  if (changes.done     !== undefined) dbChanges.done     = changes.done;
  if (changes.title    !== undefined) dbChanges.title    = changes.title;
  if (changes.deadline !== undefined) dbChanges.deadline = changes.deadline || null;
  _sb.from("tasks").update(dbChanges).eq("id", taskId).then();
};

const deleteTask = (projectId, taskId) => {
  const uid = _uid(); if (!uid) return;
  if (!_store.TASKS[projectId]) return;
  _store.TASKS[projectId] = _store.TASKS[projectId].filter(t => t.id !== taskId); _emit();
  _sb.from("tasks").delete().eq("id", taskId).then();
};

// ── SETTINGS ─────────────────────────────────────────────────────────
const updateSettings = (changes) => {
  const uid = _uid(); if (!uid) return;
  _store.SETTINGS = { ..._store.SETTINGS, ...changes }; _emit();
  _sb.from("settings").upsert({
    agency_id: uid, ..._store.SETTINGS, updated_at: new Date().toISOString(),
  }).then();
};

// ── INVITES (create from admin) ──────────────────────────────────────
const createInvite = async (service = "") => {
  const uid = _uid(); if (!uid) return null;
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  const token = [...Array(24)].map(() => chars[Math.floor(Math.random() * chars.length)]).join("");
  const { error } = await _sb.from("invites").insert({ token, agency_id: uid, service, used: false });
  if (error) return null;
  return token;
};

// ── window.Data ──────────────────────────────────────────────────────
window.Data = {
  // Static
  TEAM, ME, PHASES, ROADMAP_P1, LEAD_STAGES, CHANNELS,
  KPIS_WEEK, ACTIVITY, DRIVE_FOLDERS, INTAKE_SECTIONS, CALL_PREP,
  // Live getters
  get CLIENTS()      { return _store.CLIENTS; },
  get PROJECTS()     { return _store.PROJECTS; },
  get INVOICES()     { return _store.INVOICES; },
  get DELIVERABLES() { return _store.DELIVERABLES; },
  get LEADS()        { return _store.LEADS; },
  get TASKS()        { return _store.TASKS; },
  get SETTINGS()     { return _store.SETTINGS; },
  // Auth
  authLogin, authSignOut, initAccount,
  // Supabase client (for onboarding)
  _sb, _SB_URL, _SB_KEY,
  // Mutators
  addClient, updateClient, deleteClient,
  addProject, deleteProject,
  addInvoice, deleteInvoice,
  addDeliverable, deleteDeliverable,
  addLead,
  addTask, moveTask, updateTask, deleteTask,
  updateSettings,
  createInvite,
  useStore,
};

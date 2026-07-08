// ── Wizard helpers ────────────────────────────────────────────
const ChoiceCard = ({ label, sub, icon, selected, onClick, half }) => (
  <div onClick={onClick} style={{
    padding: "13px 14px", borderRadius: 10, cursor: "pointer", transition: "all .12s",
    border: `1.5px solid ${selected ? "var(--accent)" : "var(--border-strong)"}`,
    background: selected ? "var(--accent-soft)" : "var(--bg-elev-2)",
    display: "flex", flexDirection: half ? "row" : "column",
    alignItems: half ? "center" : "flex-start", gap: half ? 10 : 6,
  }}>
    {icon && <Icon name={icon} size={16} style={{color: selected ? "var(--accent)" : "var(--text-muted)", flexShrink:0}}/>}
    <div style={{flex:1, minWidth:0}}>
      <div style={{fontSize:13, fontWeight:500, color: selected ? "var(--accent)" : "var(--text)"}}>{label}</div>
      {sub && <div style={{fontSize:11, color:"var(--text-subtle)", marginTop:2}}>{sub}</div>}
    </div>
    {half && selected && <Icon name="check" size={13} style={{color:"var(--accent)", flexShrink:0}}/>}
  </div>
);

const WizardQuestion = ({ label, hint, children }) => (
  <div style={{marginBottom:20}}>
    <div style={{fontSize:14, fontWeight:600, color:"var(--text)", marginBottom: hint ? 2 : 10}}>{label}</div>
    {hint && <div style={{fontSize:12, color:"var(--text-subtle)", marginBottom:10}}>{hint}</div>}
    {children}
  </div>
);

// ── Project Wizard ────────────────────────────────────────────
const WIZARD_TYPES = [
  { id:"web",      label:"Web",           icon:"external-link", sub:"Web corporativa o landing" },
  { id:"brand",    label:"Branding",      icon:"sparkles",      sub:"Identidad y sistema de marca" },
  { id:"ecommerce",label:"E-commerce",    icon:"receipt",       sub:"Tienda online" },
  { id:"campaign", label:"Campaña",       icon:"trending-up",   sub:"Redes, email o ads" },
  { id:"app",      label:"App / Producto",icon:"folder",        sub:"App o producto digital" },
  { id:"other",    label:"Otro",          icon:"list-todo",     sub:"Proyecto personalizado" },
];

const TOTAL_STEPS = 3;

const _AI_URL = "https://ofnkazimemuiwovhxepq.supabase.co/functions/v1/rapid-processor";
const _AI_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mbmthemltZW11aXdvdmh4ZXBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NTU5OTcsImV4cCI6MjA5NDUzMTk5N30.NVRoZb_Ie2ZgPELFkS7CxNWrLGZcgdOdWGEEkT_CNqo";

const _NORA_FIRST = "Cuéntame sobre este proyecto. ¿Qué quieres conseguir y qué tipo de trabajo implica?";

// Fallback questions used when Edge Function hasn't been updated yet
const _NORA_FALLBACKS = [
  "¿Quién es el público objetivo? ¿A quién va dirigido este proyecto?",
  "¿Tienes referencias de estilo, competidores o marcas que te inspiren o sirvan de guía?",
  "¿Qué entregables concretos esperas recibir al finalizar el proyecto?",
  "¿El cliente tiene materiales existentes —logo, fotos, textos— que vayamos a usar?",
  "¿Hay alguna restricción de presupuesto o fecha interna que deba tener en cuenta?",
  "¿En qué canales o plataformas se va a publicar o usar este trabajo?",
];

const NewProjectModal = ({ open, onClose, onCreate, prefilledClientId }) => {
  const D = window.Data;
  D.useStore && D.useStore();
  const toast = useToast();
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const blank = () => ({ name: "", clientId: prefilledClientId || D.CLIENTS[0]?.id || "", deadline: "" });

  const [step, setStep]         = useState(0);
  const [a, setA]               = useState(blank);
  const [searching, setSearching] = useState(false);
  const [cq, setCq]             = useState("");
  // Chat
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState("");
  const [typing, setTyping]     = useState(false);
  const [noraReady, setNoraReady] = useState(false);
  // Docs
  const [docs, setDocs]         = useState([]);
  const [urlInput, setUrlInput] = useState("");
  const [docsOpen, setDocsOpen] = useState(false);
  // AI
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError]   = useState(null);
  const [aiTab, setAiTab]       = useState("roadmap");

  useEffect(() => {
    if (!open) return;
    setStep(0); setA(blank()); setSearching(false); setCq("");
    setMessages([]); setInputVal(""); setTyping(false);
    setDocs([]); setUrlInput(""); setDocsOpen(false);
    setAiResult(null); setAiLoading(false); setAiError(null); setAiTab("roadmap");
  }, [open]);

  // Init chat when entering step 1
  useEffect(() => {
    if (step === 1) {
      setMessages([{ role:"nora", content: _NORA_FIRST }]);
      setInputVal("");
      setNoraReady(false);
    }
  }, [step]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages, typing]);

  // Auto-call AI on entering step 2
  useEffect(() => {
    if (step === 2 && !aiResult && !aiLoading && !aiError) callAI();
  }, [step]);

  const set = (k, v) => setA(p => ({...p, [k]: v}));

  // Call Nora AI for next dynamic question
  const callNora = async (history) => {
    setTyping(true);
    const userCount = history.filter(m => m.role === "user").length;
    try {
      const res = await fetch(_AI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${_AI_KEY}` },
        body: JSON.stringify({
          mode: "chat",
          projectName: a.name,
          clientName: selClient?.company || selClient?.name || "",
          history: history.map(m => ({ role: m.role === "nora" ? "assistant" : "user", content: m.content })),
        }),
      });
      const data = await res.json();
      setTyping(false);
      if (data.done) {
        setNoraReady(true);
        setMessages(prev => [...prev, { role:"nora", content: data.message || "¡Perfecto, tengo suficiente contexto! Puedes generar el plan." }]);
      } else if (data.message) {
        // Edge Function returned a real AI question
        setMessages(prev => [...prev, { role:"nora", content: data.message }]);
      } else {
        // Edge Function not updated yet — use smart local fallbacks
        noraLocalFallback(userCount);
      }
    } catch {
      setTyping(false);
      noraLocalFallback(userCount);
    }
  };

  const noraLocalFallback = (userCount) => {
    setTyping(false);
    if (userCount >= _NORA_FALLBACKS.length + 1) {
      setNoraReady(true);
      setMessages(prev => [...prev, { role:"nora", content: "¡Perfecto, tengo suficiente contexto para preparar el plan! Haz clic en «Generar plan» cuando quieras." }]);
    } else {
      const q = _NORA_FALLBACKS[userCount - 1] || "¿Hay algo más que quieras añadir antes de generar el plan?";
      setMessages(prev => [...prev, { role:"nora", content: q }]);
    }
  };

  // Send chat message
  const sendMessage = () => {
    const val = inputVal.trim();
    if (!val || typing || noraReady) return;
    const updated = [...messages, { role:"user", content: val }];
    setMessages(updated);
    setInputVal("");
    callNora(updated);
  };

  // File upload
  const handleFiles = (files) => {
    Array.from(files).forEach(file => {
      const isText = file.type.startsWith("text/") || /\.(txt|md|csv)$/i.test(file.name);
      if (isText) {
        const reader = new FileReader();
        reader.onload = ev => setDocs(prev => [...prev, { name: file.name, content: ev.target.result.slice(0, 4000), type:"text" }]);
        reader.readAsText(file);
      } else {
        setDocs(prev => [...prev, { name: file.name, content: null, type: file.type || "file" }]);
      }
    });
  };

  const addUrl = () => {
    const val = urlInput.trim();
    if (!val) return;
    setDocs(prev => [...prev, { name: val, content: null, type:"url" }]);
    setUrlInput("");
  };

  const removeDoc = (i) => setDocs(prev => prev.filter((_, idx) => idx !== i));

  const callAI = async () => {
    setAiLoading(true); setAiError(null);
    try {
      const pairs = [];
      let lastQ = null;
      for (const m of messages) {
        if (m.role === "nora") { lastQ = m.content; }
        else if (m.role === "user" && lastQ) { pairs.push(`${lastQ}\n${m.content}`); lastQ = null; }
      }
      const briefing = pairs.join("\n\n");
      const answers = { "Briefing del proyecto": briefing };
      if (docs.length) {
        answers["Documentos adjuntos"] = docs.map(d =>
          d.content ? `[${d.name}]: ${d.content.slice(0, 500)}` : d.name
        ).join("\n");
      }
      const res = await fetch(_AI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${_AI_KEY}` },
        body: JSON.stringify({
          projectType: "libre",
          clientName: selClient?.company || selClient?.name || "",
          projectName: a.name,
          answers,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAiResult(data); setAiTab("roadmap");
    } catch(e) {
      setAiError(e.message || "Error al conectar con Nora");
    } finally {
      setAiLoading(false);
    }
  };

  const hasClients = D.CLIENTS.length > 0;
  const filtered = D.CLIENTS.filter(c =>
    c.name.toLowerCase().includes(cq.toLowerCase()) ||
    c.company.toLowerCase().includes(cq.toLowerCase())
  );
  const selClient = D.CLIENTS.find(c => c.id === a.clientId);
  const userAnswers = messages.filter(m => m.role === "user").length;

  const canNext = [
    !!(a.name.trim() && a.clientId && a.deadline && hasClients),
    userAnswers >= 1,
    !!(aiResult && !aiLoading),
  ];

  const submit = () => {
    const p = D.addProject({ name: a.name.trim(), clientId: a.clientId, deadline: a.deadline, template: "IA" });
    if (aiResult?.phases) {
      // Persist AI phases to localStorage so the project page can use them
      localStorage.setItem("141_phases_" + p.id, JSON.stringify(aiResult.phases));
      // Create tasks with phase name attached
      aiResult.phases.forEach(phase =>
        (phase.tasks||[]).forEach(task =>
          D.addTask({ projectId: p.id, title: typeof task === "string" ? task : task.title, column:"todo", assignee:"Tú", phase: phase.name })
        )
      );
      const total = aiResult.phases.reduce((n, ph) => n + (ph.tasks?.length||0), 0);
      toast(`Proyecto "${p.name}" creado con ${total} tareas ✨`, "success");
    } else {
      toast(`Proyecto "${p.name}" creado`, "success");
    }
    onClose(); onCreate && onCreate(p);
  };

  // Nora avatar
  const NoraAvatar = () => (
    <div style={{
      width:28, height:28, borderRadius:8, flexShrink:0,
      background:"linear-gradient(135deg,rgba(167,139,250,0.3),rgba(96,165,250,0.3))",
      border:"0.5px solid var(--border-strong)",
      display:"flex", alignItems:"center", justifyContent:"center",
    }}>
      <Icon name="sparkles" size={13} style={{color:"var(--accent)"}}/>
    </div>
  );

  const STEP_LABELS = ["Básicos", "Cuéntale a Nora", "Plan IA"];

  // ── Step 0: Básicos ──────────────────────────────────────────
  const renderStep0 = () => (
    <div style={{display:"flex", flexDirection:"column", gap:14}}>
      {!hasClients && (
        <div style={{padding:12, background:"var(--amber-soft)", border:"0.5px solid var(--amber)", borderRadius:10, color:"var(--amber)", fontSize:13, display:"flex", gap:10, alignItems:"center"}}>
          <Icon name="info" size={14}/> <span>Crea primero un cliente antes de añadir proyectos.</span>
        </div>
      )}
      <div>
        <div className="label">Nombre del proyecto</div>
        <input className="input" placeholder="Ej. Rediseño web 2026" value={a.name} onChange={e => set("name", e.target.value)} autoFocus/>
      </div>
      <div style={{position:"relative"}}>
        <div className="label">Cliente</div>
        <button className="input row tight" style={{textAlign:"left", height:38}} onClick={() => setSearching(s => !s)}>
          {selClient ? (
            <><Avatar size="sm" name={selClient.name} initials={selClient.initials} color={selClient.color}/>
              <span className="grow" style={{textAlign:"left"}}>{selClient.name} · {selClient.company}</span>
              <Icon name="chevron" size={12} style={{transform:"rotate(90deg)"}}/></>
          ) : <span className="muted">Selecciona un cliente</span>}
        </button>
        {searching && (
          <div style={{position:"absolute", top:"100%", left:0, right:0, marginTop:4, background:"var(--bg-elev-2)", border:"0.5px solid var(--border-strong)", borderRadius:10, zIndex:10, overflow:"hidden", boxShadow:"0 8px 24px rgba(0,0,0,0.2)"}}>
            <div style={{padding:8, borderBottom:"0.5px solid var(--border)"}}>
              <div className="search"><Icon name="search" size={13}/><input autoFocus placeholder="Buscar…" value={cq} onChange={e => setCq(e.target.value)}/></div>
            </div>
            <div style={{maxHeight:160, overflowY:"auto"}}>
              {filtered.map(c => (
                <div key={c.id} onClick={() => { set("clientId", c.id); setSearching(false); }}
                  style={{padding:"8px 12px", display:"flex", alignItems:"center", gap:10, cursor:"pointer"}}
                  onMouseEnter={e => e.currentTarget.style.background="var(--bg-hover)"}
                  onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                  <Avatar size="sm" name={c.name} initials={c.initials} color={c.color}/>
                  <span className="grow small">{c.name} · {c.company}</span>
                  {c.id === a.clientId && <Icon name="check" size={13}/>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div>
        <div className="label">Fecha de entrega</div>
        <input className="input" type="date" value={a.deadline} onChange={e => set("deadline", e.target.value)}/>
      </div>
    </div>
  );

  // ── Step 1: Chat con Nora ─────────────────────────────────────
  const renderStep1 = () => (
    <div style={{display:"flex", flexDirection:"column", height:420}}>
      {/* Chat messages */}
      <div style={{flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:12, paddingBottom:8, scrollbarWidth:"none"}}>
        {messages.map((msg, i) => (
          <div key={i} style={{display:"flex", gap:8, alignItems:"flex-end",
            flexDirection: msg.role === "user" ? "row-reverse" : "row"}}>
            {msg.role === "nora" && <NoraAvatar/>}
            <div style={{
              maxWidth:"80%", padding:"10px 14px", fontSize:13, lineHeight:1.6,
              borderRadius: msg.role === "nora" ? "4px 12px 12px 12px" : "12px 4px 12px 12px",
              background: msg.role === "nora" ? "var(--bg-elev-2)" : "var(--accent)",
              color: msg.role === "nora" ? "var(--text)" : "var(--accent-fg)",
              border: msg.role === "nora" ? "0.5px solid var(--border-strong)" : "none",
            }}>{msg.content}</div>
          </div>
        ))}
        {typing && (
          <div style={{display:"flex", gap:8, alignItems:"flex-end"}}>
            <NoraAvatar/>
            <div style={{padding:"10px 16px", borderRadius:"4px 12px 12px 12px",
              background:"var(--bg-elev-2)", border:"0.5px solid var(--border-strong)",
              display:"flex", gap:4, alignItems:"center"}}>
              {[0,1,2].map(i => (
                <div key={i} style={{width:5, height:5, borderRadius:"50%",
                  background:"var(--text-subtle)", opacity: 0.5 + i*0.25}}/>
              ))}
            </div>
          </div>
        )}
        {noraReady && !typing && (
          <div style={{textAlign:"center", padding:"4px 0"}}>
            <span style={{fontSize:11, color:"var(--text-subtle)", padding:"4px 10px",
              borderRadius:20, background:"var(--bg-elev-2)", border:"0.5px solid var(--border)"}}>
              ✓ Nora tiene suficiente contexto · puedes generar el plan
            </span>
          </div>
        )}
        <div ref={chatEndRef}/>
      </div>

      {/* Input */}
      <div style={{borderTop:"0.5px solid var(--border)", paddingTop:10, display:"flex", flexDirection:"column", gap:8}}>
        <div style={{display:"flex", gap:8}}>
          <textarea className="textarea" rows={2}
            placeholder="Escribe tu respuesta…"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            style={{flex:1, resize:"none", fontSize:13}}
            disabled={typing || noraReady}
          />
          <button className="btn primary" onClick={sendMessage}
            disabled={!inputVal.trim() || typing || noraReady}
            style={{alignSelf:"flex-end", padding:"8px 12px"}}>
            <Icon name="arrow" size={14}/>
          </button>
        </div>

        {/* Docs */}
        <div>
          <button onClick={() => setDocsOpen(o => !o)} style={{
            display:"flex", alignItems:"center", gap:5, background:"none", border:"none",
            cursor:"pointer", color:"var(--text-subtle)", fontSize:11, padding:0,
          }}>
            <Icon name="chevron" size={10} style={{transform: docsOpen ? "rotate(90deg)" : "rotate(0deg)", transition:"transform .15s"}}/>
            <Icon name="paperclip" size={11}/>
            Adjuntar contexto
            {docs.length > 0 && <span style={{color:"var(--accent)", fontWeight:600}}>{docs.length} archivo{docs.length > 1 ? "s" : ""}</span>}
            <span style={{color:"var(--text-muted)"}}>(opcional)</span>
          </button>
          {docsOpen && (
            <div style={{marginTop:8, display:"flex", flexDirection:"column", gap:7}}>
              <div style={{display:"flex", gap:6}}>
                {/* File upload */}
                <input ref={fileInputRef} type="file" multiple
                  accept=".txt,.md,.csv,.pdf,.doc,.docx,.png,.jpg,.jpeg"
                  style={{display:"none"}}
                  onChange={e => { handleFiles(e.target.files); e.target.value = ""; }}/>
                <button className="btn sm" style={{flex:1}} onClick={() => fileInputRef.current?.click()}>
                  <Icon name="folder" size={12}/> Subir archivo
                </button>
                <input className="input" style={{flex:2, fontSize:12, height:32}}
                  placeholder="https://drive.google.com/…"
                  value={urlInput} onChange={e => setUrlInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addUrl()}/>
                <button className="btn sm" onClick={addUrl}><Icon name="plus" size={12}/></button>
              </div>
              {docs.map((d, i) => (
                <div key={i} style={{display:"flex", alignItems:"center", gap:7, padding:"5px 9px",
                  borderRadius:7, background:"var(--bg-elev-2)", border:"0.5px solid var(--border)", fontSize:11}}>
                  <Icon name={d.type === "url" ? "external-link" : d.content ? "list-todo" : "folder"}
                    size={11} style={{color:"var(--text-subtle)", flexShrink:0}}/>
                  <span style={{flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{d.name}</span>
                  {d.content && <span style={{color:"var(--text-muted)", flexShrink:0}}>leído</span>}
                  <button onClick={() => removeDoc(i)} style={{background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)", padding:0}}>
                    <Icon name="x" size={11}/>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ── Step 2: Plan IA (loading → tabs) ─────────────────────────
  const renderStep2 = () => {
    if (aiLoading) return (
      <div style={{display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"52px 0", gap:18}}>
        <div style={{width:48, height:48, borderRadius:14,
          background:"linear-gradient(135deg,rgba(167,139,250,0.18),rgba(96,165,250,0.18))",
          border:"0.5px solid var(--border-strong)",
          display:"flex", alignItems:"center", justifyContent:"center"}}>
          <Icon name="sparkles" size={22} style={{color:"var(--accent)"}}/>
        </div>
        <div style={{textAlign:"center"}}>
          <div style={{fontWeight:600, fontSize:14}}>Nora está analizando tu proyecto…</div>
          <div style={{color:"var(--text-subtle)", fontSize:12, marginTop:5}}>Generando roadmap, materiales y email de kickoff</div>
        </div>
        <div style={{display:"flex", gap:6}}>
          {[0,1,2].map(i => <div key={i} style={{width:6, height:6, borderRadius:"50%", background:"var(--accent)", opacity: 0.35 + i*0.3}}/>)}
        </div>
      </div>
    );

    if (aiError) return (
      <div style={{display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"48px 0", gap:14}}>
        <div style={{color:"var(--red)", fontSize:13, display:"flex", alignItems:"center", gap:8}}>
          <Icon name="info" size={14}/> {aiError}
        </div>
        <button className="btn" onClick={callAI}><Icon name="list-todo" size={13}/> Reintentar</button>
      </div>
    );

    if (!aiResult) return null;

    const TABS = [
      { id:"roadmap",   label:"Roadmap",      icon:"list-todo" },
      { id:"materials", label:"Materiales",   icon:"paperclip" },
      { id:"email",     label:"Email kickoff",icon:"mail"      },
    ];
    const total = (aiResult.phases||[]).reduce((n, ph) => n + (ph.tasks?.length||0), 0);

    return (
      <div>
        <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:12, padding:"9px 12px",
          background:"linear-gradient(135deg,rgba(167,139,250,0.08),rgba(96,165,250,0.08))",
          border:"0.5px solid var(--border-strong)", borderRadius:9}}>
          <Icon name="sparkles" size={13} style={{color:"var(--accent)"}}/>
          <span style={{fontSize:12, color:"var(--text-subtle)"}}>
            Plan generado · <strong style={{color:"var(--text)"}}>{total} tareas</strong> en <strong style={{color:"var(--text)"}}>{aiResult?.phases?.length||0} fases</strong>
          </span>
          <button className="btn ghost sm" style={{marginLeft:"auto", fontSize:11}} onClick={() => { setAiResult(null); callAI(); }}>
            <Icon name="list-todo" size={11}/> Regenerar
          </button>
        </div>

        <div style={{display:"flex", borderBottom:"0.5px solid var(--border)", marginBottom:12}}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setAiTab(t.id)} style={{
              padding:"7px 13px", fontSize:12, fontWeight: aiTab===t.id ? 600 : 400,
              color: aiTab===t.id ? "var(--text)" : "var(--text-subtle)",
              borderBottom: aiTab===t.id ? "2px solid var(--accent)" : "2px solid transparent",
              background:"none", border:"none", cursor:"pointer",
              display:"flex", alignItems:"center", gap:5, marginBottom:"-0.5px",
            }}>
              <Icon name={t.icon} size={12}/>{t.label}
            </button>
          ))}
        </div>

        {aiTab === "roadmap" && (
          <div style={{display:"flex", flexDirection:"column", gap:7}}>
            {(aiResult.phases||[]).map((phase, pi) => (
              <div key={pi} style={{border:"0.5px solid var(--border)", borderRadius:10, overflow:"hidden"}}>
                <div style={{padding:"9px 14px", background:"var(--bg-elev-2)", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                  <span style={{fontWeight:600, fontSize:13}}>{phase.name}</span>
                  {phase.description && <span style={{fontSize:11, color:"var(--text-subtle)", maxWidth:"60%", textAlign:"right"}}>{phase.description}</span>}
                </div>
                <div style={{padding:"7px 10px", display:"flex", flexDirection:"column", gap:3}}>
                  {(phase.tasks||[]).map((task, ti) => (
                    <div key={ti} style={{display:"flex", alignItems:"center", gap:8, padding:"5px 8px", borderRadius:7, fontSize:12}}>
                      <div style={{width:14, height:14, borderRadius:4, border:"1.5px solid var(--border-strong)", flexShrink:0}}/>
                      <span style={{flex:1}}>{typeof task === "string" ? task : task.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {aiTab === "materials" && (
          <div style={{display:"flex", flexDirection:"column", gap:7}}>
            <div style={{fontSize:12, color:"var(--text-subtle)", marginBottom:2}}>Pide esto al cliente antes del kickoff:</div>
            {(aiResult.materials||[]).map((m, i) => (
              <div key={i} style={{display:"flex", alignItems:"flex-start", gap:10, padding:"10px 12px", borderRadius:9, background:"var(--bg-elev-2)", border:"0.5px solid var(--border)", fontSize:13}}>
                <div style={{width:18, height:18, borderRadius:5, border:"1.5px solid var(--border-strong)", display:"grid", placeItems:"center", flexShrink:0, marginTop:1}}>
                  <span style={{fontSize:9, color:"var(--text-subtle)"}}>{i+1}</span>
                </div>
                {m}
              </div>
            ))}
          </div>
        )}

        {aiTab === "email" && (
          <div style={{display:"flex", flexDirection:"column", gap:9}}>
            <div style={{padding:"10px 14px", borderRadius:9, background:"var(--bg-elev-2)", border:"0.5px solid var(--border)"}}>
              <div style={{fontSize:11, color:"var(--text-subtle)", marginBottom:4}}>Asunto</div>
              <div style={{fontSize:13, fontWeight:500}}>{aiResult.kickoffEmail?.subject}</div>
            </div>
            <div style={{padding:"14px", borderRadius:9, background:"var(--bg-elev-2)", border:"0.5px solid var(--border)"}}>
              <div style={{fontSize:11, color:"var(--text-subtle)", marginBottom:8}}>Cuerpo</div>
              <div style={{fontSize:13, lineHeight:1.65, whiteSpace:"pre-wrap"}}>{aiResult.kickoffEmail?.body}</div>
            </div>
            <button className="btn sm" style={{alignSelf:"flex-start"}} onClick={() => {
              navigator.clipboard.writeText(`Asunto: ${aiResult.kickoffEmail?.subject}\n\n${aiResult.kickoffEmail?.body}`);
              toast("Email copiado al portapapeles", "success");
            }}>
              <Icon name="paperclip" size={12}/> Copiar al portapapeles
            </button>
          </div>
        )}
      </div>
    );
  };

  const steps = [renderStep0, renderStep1, renderStep2];

  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal lg" style={{maxWidth:600}} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">Nuevo proyecto</div>
            <div className="modal-sub">{STEP_LABELS[step]} · {step + 1} / {TOTAL_STEPS}</div>
          </div>
          <button className="btn ghost icon-only sm" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>
        <div style={{padding:"0 24px"}}>
          <div style={{height:3, background:"var(--border)", borderRadius:99, overflow:"hidden"}}>
            <div style={{height:"100%", width:`${(step / (TOTAL_STEPS - 1)) * 100}%`, background:"var(--accent)", borderRadius:99, transition:"width .25s ease"}}/>
          </div>
        </div>
        <div className="modal-body" style={{
          minHeight:200, maxHeight:"58vh", overflowY:"auto", scrollbarWidth:"none",
          ...(step === 1 ? {padding:"16px 24px 8px"} : {}),
        }}>
          {steps[step]()}
        </div>
        <div className="modal-foot">
          <button className="btn" disabled={step === 2 && aiLoading}
            onClick={() => step === 0 ? onClose() : setStep(s => s - 1)}>
            {step === 0 ? "Cancelar" : <><Icon name="chevron" size={12} style={{transform:"rotate(180deg)"}}/> Atrás</>}
          </button>
          {step < TOTAL_STEPS - 1 ? (
            <button className="btn primary" disabled={!canNext[step]} onClick={() => setStep(s => s + 1)}>
              {step === 1 ? <><Icon name="sparkles" size={12}/> Generar plan</> : <>Siguiente <Icon name="chevron" size={12}/></>}
            </button>
          ) : (
            <button className="btn primary" disabled={!canNext[step]} onClick={submit}>
              <Icon name="sparkles" size={12}/> Crear proyecto
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const NewClientModal = ({ open, onClose, onCreated, onCreateProject }) => {
  const D = window.Data;
  const [step, setStep] = useState("form");
  const [data, setData] = useState({ name: "", email: "", phone: "", company: "", sector: "" });
  const [createdId, setCreatedId] = useState(null);
  const toast = useToast();

  const submit = () => {
    if (!data.name.trim()) return toast("El nombre es obligatorio", "warn");
    const c = D.addClient(data);
    setCreatedId(c.id);
    toast(`${c.company} añadido a clientes`, "success");
    setStep("ask");
  };

  const reset = () => { setStep("form"); setData({ name:"", email:"", phone:"", company:"", sector:"" }); setCreatedId(null); };

  if (!open) return null;

  if (step === "ask") {
    return (
      <Modal open={true} onClose={() => { reset(); onClose(); }} title="Cliente creado" sub={`${data.company || data.name} ya está en tu lista de clientes`} footer={
        <>
          <button className="btn" onClick={() => { reset(); onClose(); }}>Más tarde</button>
          <button className="btn primary" onClick={() => { reset(); onClose(); onCreateProject && onCreateProject(createdId); }}>
            <Icon name="plus" size={12}/> Crear primer proyecto ahora
          </button>
        </>
      }>
        <div className="row" style={{gap: 14, alignItems:"center"}}>
          <div style={{width: 48, height: 48, borderRadius: 12, background:"var(--green-soft)", color:"var(--green)", display:"grid", placeItems:"center"}}>
            <Icon name="check" size={20}/>
          </div>
          <div>
            <div style={{fontWeight: 500}}>¿Quieres crear ya un proyecto para {(data.name || "este cliente").split(" ")[0]}?</div>
            <div className="muted small" style={{marginTop: 4}}>Te ahorramos el clic. Si no, podrás hacerlo desde su ficha.</div>
          </div>
        </div>
      </Modal>
    );
  }

  const SECTORES = ["Restauración","Moda / Retail","Salud / Bienestar","Tecnología","Educación","Inmobiliaria","Hostelería","Deporte / Fitness","ONG / Social","Consultoría","Arte / Cultura","Construcción","Alimentación","Otro"];

  // Base quick-create: × circular + etiqueta centrada + ↑ enviar, título gigante
  // editable y, debajo, las entradas en columnas (sin pestañas).
  const canSubmit = !!data.name.trim();
  const FIELD = {
    width:"100%", padding:"12px 16px", fontSize:14, borderRadius:14,
    background:"rgba(255,255,255,0.04)", border:"0.5px solid rgba(255,255,255,0.1)",
    color:"var(--text)", outline:"none", fontFamily:"inherit", letterSpacing:"-0.3px",
    transition:"border-color .2s, background .2s",
  };

  return (
    <div onClick={() => { reset(); onClose(); }} style={{
      position:"fixed", inset:0, zIndex:200, background:"rgba(0,0,0,0.6)",
      backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:24,
      animation:"fade .15s ease-out",
    }}>
      <style>{`.od-input:focus { border-color: rgba(158,154,229,0.5) !important; background: rgba(158,154,229,0.05) !important; }`}</style>
      <div onClick={e => e.stopPropagation()} style={{
        width:"100%", maxWidth:520, maxHeight:"90vh", overflowY:"auto",
        background:"#0e0e10", border:"1px solid #232324", borderRadius:32,
        boxShadow:"0 40px 90px rgba(0,0,0,0.6)",
        animation:"pop .2s cubic-bezier(.2,.8,.2,1)",
        display:"flex", flexDirection:"column",
      }}>
        {/* Barra superior: × · etiqueta · ↑ */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"22px 22px 0" }}>
          <button onClick={() => { reset(); onClose(); }} style={{
            width:40, height:40, borderRadius:"50%",
            background:"rgba(255,255,255,0.08)", border:"0.5px solid rgba(255,255,255,0.1)",
            cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
            color:"var(--text-muted)",
          }}>
            <Icon name="x" size={15}/>
          </button>
          <div style={{ fontSize:13, color:"var(--text-subtle)", letterSpacing:"-0.5px" }}>Nuevo cliente</div>
          <button onClick={submit} style={{
            width:40, height:40, borderRadius:"50%",
            background: canSubmit ? "var(--accent)" : "rgba(255,255,255,0.08)",
            border:"none", cursor: canSubmit ? "pointer" : "default",
            display:"flex", alignItems:"center", justifyContent:"center",
            color:"#fff", transition:"all .15s", opacity: canSubmit ? 1 : 0.4,
          }}>
            <Icon name="arrow-up" size={15}/>
          </button>
        </div>

        {/* Título gigante + empresa */}
        <div style={{ padding:"28px 28px 8px" }}>
          <input
            autoFocus
            placeholder="Nombre del cliente..."
            value={data.name}
            onChange={e => setData({ ...data, name: e.target.value })}
            onKeyDown={e => { if (e.key === "Enter" && canSubmit) submit(); }}
            style={{
              width:"100%", background:"transparent", border:"none", outline:"none",
              fontSize:28, fontWeight:400, letterSpacing:"-1.4px",
              color: data.name ? "var(--text)" : "rgba(255,255,255,0.15)",
              fontFamily:"var(--font-display)", caretColor:"var(--accent)",
            }}
          />
          <input
            placeholder="Empresa (opcional)"
            value={data.company}
            onChange={e => setData({ ...data, company: e.target.value })}
            style={{
              width:"100%", background:"transparent", border:"none", outline:"none",
              fontSize:14, letterSpacing:"-0.5px", marginTop:8,
              color: data.company ? "var(--text-muted)" : "rgba(255,255,255,0.13)",
              fontFamily:"var(--font-sans)", caretColor:"var(--accent)",
            }}
          />
        </div>

        {/* Entradas en columnas */}
        <div style={{ padding:"20px 28px 26px", display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <input className="od-input" style={FIELD} type="email" placeholder="ana@empresa.com" value={data.email}
              onChange={e => setData({ ...data, email: e.target.value })}/>
            <input className="od-input" style={FIELD} type="tel" placeholder="+34 600 000 000" value={data.phone}
              onChange={e => setData({ ...data, phone: e.target.value })}/>
          </div>
          {/* Sector — pastillas como las opciones del quick-create */}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", maxHeight:132, overflowY:"auto" }}>
            {SECTORES.map(s => {
              const on = data.sector === s;
              return (
                <button key={s} onClick={() => setData({ ...data, sector: on ? "" : s })} style={{
                  padding:"8px 16px", borderRadius:99, fontSize:13, letterSpacing:"-0.5px",
                  background: on ? "rgba(158,154,229,0.13)" : "rgba(255,255,255,0.05)",
                  border: on ? "0.5px solid rgba(158,154,229,0.55)" : "0.5px solid rgba(255,255,255,0.08)",
                  color: on ? "var(--accent)" : "var(--text-subtle)",
                  cursor:"pointer", fontFamily:"var(--font-sans)", transition:"all .12s",
                }}>
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const ApproveDeliverableModal = ({ open, onClose, deliverable }) => {
  const [comment, setComment] = useState("");
  const toast = useToast();
  const d = deliverable || { title: "Mockups landing v3", type: "Diseño", thumb: "linear-gradient(135deg,#1f2937,#0f172a)", version: "v3", date: "7 may" };

  return (
    <Modal open={open} onClose={onClose} title="Revisar entregable" sub={d.title + " · " + d.version} size="lg" footer={
      <>
        <button className="btn" onClick={onClose}>Cancelar</button>
        <button className="btn" style={{borderColor:"var(--amber)", color:"var(--amber)"}} onClick={() => { toast("Cambios solicitados al equipo", "warn"); onClose(); }}>
          <Icon name="msg-circle" size={12}/> Pedir cambios
        </button>
        <button className="btn primary" onClick={() => { toast("¡Entregable aprobado! Gracias.", "success"); onClose(); }}>
          <Icon name="thumbs-up" size={12}/> Aprobar
        </button>
      </>
    }>
      <div style={{aspectRatio:"16/8", background: d.thumb, borderRadius: 10, marginBottom: 16, position:"relative", overflow:"hidden"}}>
        <div style={{position:"absolute", top: 12, left: 12, color:"#fff", fontSize: 11, opacity: 0.7}}>{d.type} · {d.version}</div>
        <div style={{position:"absolute", bottom: 12, right: 12}}>
          <button className="btn sm" style={{background:"rgba(0,0,0,0.4)", color:"#fff", borderColor:"rgba(255,255,255,0.2)"}}><Icon name="download" size={12}/> Descargar</button>
        </div>
      </div>

      <div className="row between" style={{marginBottom: 14}}>
        <div className="row tight muted small">
          <Icon name="paperclip" size={12}/> 4 archivos · 18.4 MB
          <span className="vdiv"/>
          <Icon name="calendar" size={12}/> Subido {d.date}
        </div>
        <div className="row tight">
          <button className="btn ghost sm"><Icon name="external-link" size={12}/> Pantalla completa</button>
        </div>
      </div>

      <div className="label">Comentario (opcional)</div>
      <textarea className="textarea" rows={3} placeholder="Cuéntale al equipo qué te ha parecido o qué cambiarías…" value={comment} onChange={e => setComment(e.target.value)}/>
      <div className="row tight" style={{marginTop: 10, color:"var(--text-muted)", fontSize: 12}}>
        <Icon name="info" size={12}/>
        <span>Si pides cambios, el comentario se enviará al equipo y volveremos a notificarte cuando haya nueva versión.</span>
      </div>
    </Modal>
  );
};

const NewTaskModal = ({ open, onClose }) => {
  const D = window.Data;
  D.useStore && D.useStore();
  const toast = useToast();
  const [title, setTitle]           = useState("");
  const [column, setColumn]         = useState("todo");
  const [assignee, setAssignee]     = useState("Tú");
  const [clientSearch, setClientSearch] = useState("");
  const [clientOpen, setClientOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [projectId, setProjectId]   = useState("__none__");

  const COLUMNS = [
    { id:"todo",   label:"Por hacer" },
    { id:"doing",  label:"En curso" },
    { id:"review", label:"Revisión" },
    { id:"done",   label:"Hecho" },
  ];

  const allClients = D.CLIENTS || [];
  const filteredClients = clientSearch.trim()
    ? allClients.filter(c =>
        c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
        (c.company || "").toLowerCase().includes(clientSearch.toLowerCase()))
    : allClients;

  const clientProjects = selectedClient
    ? (D.PROJECTS || []).filter(p => p.clientId === selectedClient.id)
    : [];

  const pickClient = (c) => {
    setSelectedClient(c);
    setClientSearch(c.name + (c.company ? ` — ${c.company}` : ""));
    setClientOpen(false);
    setProjectId("__none__");
  };

  const reset = () => {
    setTitle(""); setColumn("todo"); setAssignee("Tú");
    setClientSearch(""); setSelectedClient(null); setProjectId("__none__"); setClientOpen(false);
  };

  const submit = () => {
    if (!title.trim()) { toast("Escribe el nombre de la tarea", "warn"); return; }
    D.addTask({
      projectId,
      title: title.trim(),
      column,
      assignee,
      clientId:   selectedClient?.id   || null,
      clientName: selectedClient?.company || selectedClient?.name || null,
    });
    toast("Tarea añadida", "success");
    reset(); onClose();
  };

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }}
      title="Nueva tarea" sub="Asigna una tarea a un cliente o proyecto."
      footer={
        <>
          <button className="btn" onClick={() => { reset(); onClose(); }}>Cancelar</button>
          <button className="btn primary" onClick={submit}>
            <Icon name="plus" size={12}/> Crear tarea
          </button>
        </>
      }>
      <div style={{display:"flex", flexDirection:"column", gap:14}}>

        <div>
          <div className="label">Nombre de la tarea</div>
          <input className="input" autoFocus placeholder="Ej. Preparar propuesta de diseño"
            value={title} onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}/>
        </div>

        {/* Client combobox */}
        <div style={{position:"relative"}}>
          <div className="label">Cliente <span style={{color:"var(--text-subtle)"}}>(opcional)</span></div>
          <input className="input" placeholder="Buscar cliente…"
            value={clientSearch}
            onChange={e => { setClientSearch(e.target.value); setClientOpen(true); setSelectedClient(null); setProjectId("__none__"); }}
            onFocus={() => setClientOpen(true)}
            onBlur={() => setTimeout(() => setClientOpen(false), 150)}/>
          {clientOpen && filteredClients.length > 0 && (
            <div style={{position:"absolute", top:"100%", left:0, right:0, zIndex:50, marginTop:4,
              background:"var(--bg-elev-2)", border:"0.5px solid var(--border-strong)",
              borderRadius:10, overflow:"hidden", boxShadow:"0 8px 24px rgba(0,0,0,0.2)"}}>
              {filteredClients.slice(0,6).map(c => (
                <div key={c.id} onMouseDown={() => pickClient(c)}
                  style={{padding:"10px 14px", cursor:"pointer", display:"flex", alignItems:"center", gap:10,
                    fontSize:13, borderBottom:"0.5px solid var(--border)"}}
                  onMouseEnter={e => e.currentTarget.style.background="var(--bg-hover)"}
                  onMouseLeave={e => e.currentTarget.style.background=""}>
                  <div style={{width:28, height:28, borderRadius:8, background:c.color+"22",
                    color:c.color, display:"grid", placeItems:"center", fontSize:11, fontWeight:600, flexShrink:0}}>
                    {c.initials}
                  </div>
                  <div>
                    <div style={{fontWeight:500}}>{c.name}</div>
                    <div style={{fontSize:11, color:"var(--text-subtle)"}}>{c.company}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Project selector — only if client selected */}
        <div>
          <div className="label">Proyecto <span style={{color:"var(--text-subtle)"}}>(opcional)</span></div>
          <select className="select" value={projectId} onChange={e => setProjectId(e.target.value)}
            disabled={!selectedClient && clientProjects.length === 0}>
            <option value="__none__">Sin proyecto específico</option>
            {clientProjects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
            {!selectedClient && (D.PROJECTS || []).length > 0 && (
              (D.PROJECTS || []).map(p => (
                <option key={p.id} value={p.id}>{p.name} · {p.clientName}</option>
              ))
            )}
          </select>
        </div>


      </div>
    </Modal>
  );
};

Object.assign(window, { NewProjectModal, NewClientModal, ApproveDeliverableModal, NewTaskModal });

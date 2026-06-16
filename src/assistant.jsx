// AI assistant chat — slide-out panel. Powered by window.claude.complete.
// Lets you chat with your assistant and assign tasks; assistant parses intent,
// proposes structured tasks, and adds them to a local task store.

const ASSISTANT_SYSTEM = `Eres "Nora", la asistente operativa de 141'STUDIO, una agencia digital. El usuario es Andrés, fundador. Hablas en español, tono cercano, directo, sin formalidades. Sin emojis salvo que él los use.

Tu trabajo: ayudar a Andrés a gestionar la agencia. Puedes:
- Crear y asignar tareas a ti misma o al equipo (Marta diseño, Diego dev, Lucía copy)
- Hacer seguimiento de proyectos y clientes
- Redactar emails, mensajes a clientes, briefings
- Recordar cosas, organizar la semana

Cuando Andrés te pida hacer algo accionable (una tarea), DEBES devolver un bloque JSON al final de tu respuesta con este formato exacto:
\`\`\`task
{"title":"...","assignee":"Nora|Marta|Diego|Lucía|Andrés","due":"hoy|mañana|YYYY-MM-DD","priority":"alta|media|baja","project":"opcional","notes":"opcional"}
\`\`\`
Puedes incluir varios bloques task si son varias tareas. Antes del JSON, una respuesta breve y natural (1-3 frases). No expliques el formato JSON.

Si solo es conversación o pregunta, no incluyas JSON.

Contexto agencia:
- Clientes activos: Acme Co. (rediseño web), Lumen Studio (branding), Norte Café (e-commerce)
- 2 entregables esperando aprobación de Acme
- Factura ACME-003 vencida hace 4 días`;

const AssistantPanel = ({ open, onClose }) => {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hey, ¿en qué te ayudo hoy? Puedo crear tareas, redactar mensajes a clientes o repasar lo de esta semana." }
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [tasks, setTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem("nora_tasks") || "[]"); }
    catch { return []; }
  });
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("nora_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, busy]);

  const send = async (text) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed || busy) return;
    const userMsg = { role: "user", content: trimmed };
    const next = [...messages, userMsg];
    setMessages([...next, { role: "assistant", content: "", thinking: true }]);
    setInput("");
    setBusy(true);

    try {
      const reply = await window.claude.complete({
        messages: [
          { role: "user", content: ASSISTANT_SYSTEM + "\n\n---\n\nConversación hasta ahora:\n" +
            next.map(m => (m.role === "user" ? "Andrés" : "Nora") + ": " + m.content).join("\n") +
            "\n\nNora:" }
        ]
      });

      const { text: cleanText, tasks: parsedTasks } = parseAssistantReply(reply);
      setMessages(m => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content: cleanText, tasks: parsedTasks };
        return copy;
      });
      if (parsedTasks.length) {
        setTasks(t => [
          ...parsedTasks.map(p => ({ ...p, id: "t" + Date.now() + Math.random().toString(36).slice(2,5), createdAt: new Date().toISOString(), status: "open" })),
          ...t,
        ]);
      }
    } catch (e) {
      setMessages(m => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content: "Vaya, no he podido conectar. ¿Lo intentamos de nuevo?" };
        return copy;
      });
    }
    setBusy(false);
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const quickPrompts = [
    "Recordatorio: llamar a Acme mañana 10:00",
    "Pídele a Marta que mande mockups v3 hoy",
    "Resume cómo va la semana",
    "Redacta email para Lumen sobre la factura",
  ];

  if (!open) return null;

  return (
    <>
      <div onClick={onClose} style={{
        position:"fixed", inset:0, background:"rgba(0,0,0,0.4)",
        zIndex: 90, animation:"fade .15s ease-out"
      }}/>
      <div style={{
        position:"fixed", top: 0, right: 0, bottom: 0, width: 440,
        background:"var(--bg-elev)", borderLeft:"0.5px solid var(--border)",
        zIndex: 91, display:"flex", flexDirection:"column",
        animation:"slidein .22s cubic-bezier(.2,.8,.2,1)",
      }}>
        <style>{`
          @keyframes slidein { from { transform: translateX(20px); opacity: 0; } to { transform: none; opacity: 1; } }
          @keyframes pulse { 0%,100% { opacity: .35; } 50% { opacity: 1; } }
          .nora-dot { animation: pulse 1.2s infinite; }
          .nora-dot:nth-child(2) { animation-delay: .15s; }
          .nora-dot:nth-child(3) { animation-delay: .3s; }
          .nora-msg { line-height: 1.55; font-size: 13.5px; white-space: pre-wrap; word-wrap: break-word; }
          .nora-msg b { font-weight: 500; }
        `}</style>

        {/* Header */}
        <div style={{padding:"14px 16px", borderBottom:"0.5px solid var(--border)", display:"flex", alignItems:"center", gap: 12}}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background:"linear-gradient(135deg,#a78bfa 0%,#60a5fa 100%)",
            display:"grid", placeItems:"center", color:"#fff",
          }}>
            <Icon name="sparkles" size={15}/>
          </div>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{fontWeight: 500, fontSize: 14, fontFamily:"var(--font-display)"}}>Nora</div>
            <div className="subtle xsmall" style={{display:"flex", alignItems:"center", gap: 5}}>
              <span className="dot green" style={{width:5, height: 5, boxShadow:"none"}}/> Tu asistente · {tasks.filter(t=>t.status==="open").length} tareas activas
            </div>
          </div>
          <button className="btn ghost icon-only sm" data-tooltip="Limpiar conversación" onClick={() => setMessages([{ role: "assistant", content: "Empezamos de cero. ¿Qué necesitas?" }])}>
            <Icon name="rotate-ccw" size={13}/>
          </button>
          <button className="btn ghost icon-only sm" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} style={{flex: 1, overflowY:"auto", padding:"18px 16px", display:"flex", flexDirection:"column", gap: 14}}>
          {messages.map((m, i) => (
            <NoraMessage key={i} m={m}/>
          ))}
          {busy && messages[messages.length-1]?.thinking && (
            <div style={{display:"flex", gap: 4, padding:"4px 8px"}}>
              <span className="dot muted nora-dot" style={{width: 5, height: 5, boxShadow:"none"}}/>
              <span className="dot muted nora-dot" style={{width: 5, height: 5, boxShadow:"none"}}/>
              <span className="dot muted nora-dot" style={{width: 5, height: 5, boxShadow:"none"}}/>
            </div>
          )}

          {messages.length <= 1 && (
            <div style={{marginTop: 8}}>
              <div className="subtle xsmall" style={{marginBottom: 8}}>Prueba preguntando…</div>
              <div style={{display:"flex", flexDirection:"column", gap: 6}}>
                {quickPrompts.map(q => (
                  <button key={q} onClick={() => send(q)} style={{
                    textAlign:"left", padding:"8px 12px",
                    background:"var(--bg-elev-2)", border:"0.5px solid var(--border)",
                    borderRadius: 8, fontSize: 12.5, color:"var(--text-muted)",
                    cursor:"pointer", fontFamily:"inherit",
                  }}>{q}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tasks summary strip */}
        {tasks.filter(t => t.status === "open").length > 0 && (
          <div style={{padding:"10px 16px", borderTop:"0.5px solid var(--border)", background:"var(--bg)"}}>
            <div className="row between" style={{marginBottom: 6}}>
              <div className="xsmall subtle" style={{fontWeight: 500}}>Tareas pendientes</div>
              <span className="xsmall subtle">{tasks.filter(t=>t.status==="open").length}</span>
            </div>
            <div style={{display:"flex", flexDirection:"column", gap: 4, maxHeight: 120, overflowY:"auto"}}>
              {tasks.filter(t => t.status === "open").slice(0, 4).map(t => (
                <div key={t.id} style={{display:"flex", alignItems:"center", gap: 8, padding:"4px 0", fontSize: 12.5}}>
                  <button onClick={() => setTasks(ts => ts.map(x => x.id === t.id ? {...x, status:"done"} : x))}
                    style={{width: 14, height: 14, borderRadius: 4, border:"0.5px solid var(--border-strong)", background:"transparent", cursor:"pointer", flexShrink: 0}}/>
                  <span className="grow truncate">{t.title}</span>
                  <span className="chip" style={{fontSize: 10, padding:"0 6px"}}>{t.assignee}</span>
                  {t.priority === "alta" && <span className="dot red" style={{width: 5, height: 5, boxShadow:"none"}}/>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div style={{padding: 12, borderTop:"0.5px solid var(--border)"}}>
          <div style={{
            display:"flex", alignItems:"flex-end", gap: 8,
            background:"var(--bg-elev-2)", border:"0.5px solid var(--border-strong)",
            borderRadius: 12, padding: 8,
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Escribe a Nora o pídele algo…"
              rows={1}
              style={{
                flex: 1, border: 0, outline: 0, background:"transparent",
                resize: "none", fontFamily:"inherit", fontSize: 13.5,
                color:"var(--text)", padding:"4px 6px", maxHeight: 120,
                lineHeight: 1.5,
              }}
            />
            <button className="btn primary icon-only sm" disabled={!input.trim() || busy} onClick={() => send()}
              style={{opacity: !input.trim() || busy ? 0.5 : 1}}>
              <Icon name="arrow" size={12}/>
            </button>
          </div>
          <div className="row between" style={{marginTop: 6, padding:"0 4px"}}>
            <span className="subtle xsmall">Enter para enviar · Shift+Enter nueva línea</span>
            <span className="subtle xsmall" style={{display:"flex", alignItems:"center", gap: 4}}>
              <Icon name="sparkles" size={10}/> Powered by Claude
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

const NoraMessage = ({ m }) => {
  if (m.role === "user") {
    return (
      <div style={{alignSelf:"flex-end", maxWidth:"85%"}}>
        <div style={{
          background:"var(--accent)", color:"var(--accent-fg)",
          padding:"8px 12px", borderRadius:"12px 12px 4px 12px",
          fontSize: 13.5, lineHeight: 1.5, whiteSpace:"pre-wrap",
        }}>{m.content}</div>
      </div>
    );
  }
  if (m.thinking) return null;
  return (
    <div style={{alignSelf:"flex-start", maxWidth:"92%", display:"flex", gap: 8}}>
      <div style={{
        width: 22, height: 22, borderRadius: 6, flexShrink: 0,
        background:"linear-gradient(135deg,#a78bfa 0%,#60a5fa 100%)",
        display:"grid", placeItems:"center", color:"#fff", marginTop: 2,
      }}>
        <Icon name="sparkles" size={11}/>
      </div>
      <div style={{flex: 1, minWidth: 0}}>
        <div className="nora-msg" dangerouslySetInnerHTML={{ __html: formatMarkdownish(m.content) }}/>
        {m.tasks && m.tasks.length > 0 && (
          <div style={{marginTop: 10, display:"flex", flexDirection:"column", gap: 6}}>
            {m.tasks.map((t, i) => (
              <div key={i} style={{
                background:"var(--bg-elev-2)",
                border:"0.5px solid var(--border)",
                borderRadius: 10, padding:"10px 12px",
                display:"flex", alignItems:"flex-start", gap: 10,
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                  background:"var(--green-soft)", color:"var(--green)",
                  display:"grid", placeItems:"center",
                }}>
                  <Icon name="check" size={13}/>
                </div>
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{fontWeight: 500, fontSize: 13, marginBottom: 4}}>{t.title}</div>
                  <div style={{display:"flex", flexWrap:"wrap", gap: 6}}>
                    <span className="chip">{t.assignee}</span>
                    {t.due && <span className="chip"><Icon name="calendar" size={10}/> {t.due}</span>}
                    {t.priority && <span className={"chip " + (t.priority === "alta" ? "red" : t.priority === "media" ? "amber" : "")}>
                      {t.priority}
                    </span>}
                    {t.project && <span className="chip blue">{t.project}</span>}
                  </div>
                  {t.notes && <div className="muted xsmall" style={{marginTop: 6, lineHeight: 1.5}}>{t.notes}</div>}
                </div>
              </div>
            ))}
            <div className="subtle xsmall" style={{display:"flex", alignItems:"center", gap: 5}}>
              <Icon name="check" size={10}/> Añadidas a tu lista
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ---- helpers ----

function parseAssistantReply(raw) {
  const tasks = [];
  let text = raw || "";
  const re = /```task\s*([\s\S]*?)```/g;
  let match;
  while ((match = re.exec(raw)) !== null) {
    try {
      const obj = JSON.parse(match[1].trim());
      tasks.push(obj);
    } catch {}
  }
  text = text.replace(re, "").trim();
  return { text, tasks };
}

function formatMarkdownish(s) {
  if (!s) return "";
  // escape
  let out = s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  // bold **x**
  out = out.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
  // inline code
  out = out.replace(/`([^`]+)`/g, '<code style="background:var(--bg-elev-2);padding:1px 5px;border-radius:4px;font-family:var(--font-mono);font-size:11.5px">$1</code>');
  return out;
}

// ── NoraPage — full-page AI chat (style: Outdomode AI Chat) ──────────────────
const NoraPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [busy, setBusy]         = useState(false);
  const scrollRef  = useRef(null);
  const inputRef   = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, busy]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const send = async (text) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed || busy) return;
    const userMsg = { role:"user", content: trimmed };
    const history = [...messages, userMsg];
    setMessages([...history, { role:"assistant", content:"", thinking:true }]);
    setInput("");
    setBusy(true);
    try {
      const reply = await window.claude.complete({
        messages: [{ role:"user", content: ASSISTANT_SYSTEM + "\n\n---\n\nConversación:\n" +
          history.map(m => (m.role==="user"?"Tú":"Nora") + ": " + m.content).join("\n") + "\n\nNora:" }]
      });
      const { text: cleanText, tasks: parsedTasks } = parseAssistantReply(reply);
      setMessages(m => { const c=[...m]; c[c.length-1]={role:"assistant",content:cleanText,tasks:parsedTasks}; return c; });
    } catch {
      setMessages(m => { const c=[...m]; c[c.length-1]={role:"assistant",content:"No he podido conectar. ¿Lo intentamos de nuevo?"}; return c; });
    }
    setBusy(false);
  };

  const quickPrompts = [
    "Mis puntos débiles",
    "¿Qué hacer hoy?",
    "Repaso semanal",
    "Analiza la carga de trabajo",
    "Necesito motivación",
  ];

  const isEmpty = messages.length === 0;

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:"var(--bg)" }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:.3}50%{opacity:1} }
        .nora-dot { animation: pulse 1.2s infinite; }
        .nora-dot:nth-child(2) { animation-delay:.15s; }
        .nora-dot:nth-child(3) { animation-delay:.3s; }
        .nora-msg { line-height:1.6; font-size:14px; white-space:pre-wrap; word-wrap:break-word; }
        .nora-msg b { font-weight:500; }
      `}</style>

      {/* Header */}
      <div style={{ height:56, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", flexShrink:0 }}>
        <span style={{ fontSize:15, fontWeight:500, letterSpacing:"-0.5px" }}>Nora IA</span>
        <button onClick={() => setMessages([])} style={{ position:"absolute", right:16, width:36, height:36, borderRadius:"50%", background:"rgba(255,255,255,0.06)", border:"0.5px solid var(--border)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--text-muted)" }}>
          <Icon name="rotate-ccw" size={14}/>
        </button>
      </div>

      {/* Messages / Empty state */}
      <div ref={scrollRef} style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column" }}>
        {isEmpty ? (
          <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"0 24px", gap:16 }}>
            <div style={{ width:72, height:72, borderRadius:"50%", background:"rgba(255,255,255,0.06)", border:"0.5px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Icon name="sparkles" size={28} strokeWidth={1.4} color="var(--text-muted)"/>
            </div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:28, fontWeight:400, letterSpacing:"-1.2px", marginBottom:8 }}>¿En qué te ayudo?</div>
              <div style={{ fontSize:14, color:"var(--text-muted)", letterSpacing:"-0.4px" }}>Gestiona tu agencia, crea tareas y redacta mensajes con tu asistente IA.</div>
            </div>
          </div>
        ) : (
          <div style={{ flex:1, display:"flex", flexDirection:"column", gap:16, padding:"24px 32px 8px", width:"100%", boxSizing:"border-box" }}>
            {messages.map((m, i) => (
              m.thinking ? null : <NoraMessage key={i} m={m}/>
            ))}
            {busy && (
              <div style={{ display:"flex", gap:4, padding:"4px 0" }}>
                <span className="dot muted nora-dot" style={{ width:5, height:5, boxShadow:"none" }}/>
                <span className="dot muted nora-dot" style={{ width:5, height:5, boxShadow:"none" }}/>
                <span className="dot muted nora-dot" style={{ width:5, height:5, boxShadow:"none" }}/>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom: quick chips + input */}
      <div style={{ flexShrink:0, padding:"12px 32px calc(12px + env(safe-area-inset-bottom))", borderTop:"0.5px solid var(--border)", width:"100%", boxSizing:"border-box" }}>
        {isEmpty && (
          <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:12, scrollbarWidth:"none" }}>
            {quickPrompts.map(q => (
              <button key={q} onClick={() => send(q)} style={{ flexShrink:0, padding:"8px 16px", borderRadius:99, background:"rgba(255,255,255,0.06)", border:"0.5px solid rgba(255,255,255,0.1)", color:"var(--text-muted)", fontSize:13, letterSpacing:"-0.4px", cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap", transition:"background .12s" }}
                onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.1)"}
                onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.06)"}
              >{q}</button>
            ))}
          </div>
        )}
        <div style={{ display:"flex", alignItems:"flex-end", gap:10, background:"rgba(255,255,255,0.04)", border:"0.5px solid var(--border-strong)", borderRadius:16, padding:"10px 10px 10px 16px" }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Escribe a Nora…"
            rows={1}
            style={{ flex:1, border:0, outline:0, background:"transparent", resize:"none", fontFamily:"inherit", fontSize:14, color:"var(--text)", letterSpacing:"-0.4px", lineHeight:1.5, maxHeight:120 }}
          />
          <button onClick={() => send()} disabled={!input.trim() || busy}
            style={{ width:34, height:34, borderRadius:"50%", background: input.trim() && !busy ? "var(--accent)" : "rgba(255,255,255,0.08)", border:"none", cursor: input.trim() && !busy ? "pointer":"default", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", flexShrink:0, opacity: input.trim() && !busy ? 1 : 0.4, transition:"all .15s" }}>
            <Icon name="arrow-up" size={15}/>
          </button>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { AssistantPanel, NoraPage });

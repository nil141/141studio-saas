// WhatsApp — bandeja de dos vías (Meta Cloud API). Lista de conversaciones
// a la izquierda, hilo + redacción a la derecha. En tiempo real vía Supabase.
const { useState, useEffect, useRef, useMemo } = React;

const _waDigits = (s) => String(s || "").replace(/\D/g, "");
const _waMatch = (clientPhone, waId) => {
  const a = _waDigits(clientPhone), b = _waDigits(waId);
  if (!a || !b) return false;
  if (a === b) return true;
  const min = Math.min(a.length, b.length);
  return min >= 8 && (a.endsWith(b) || b.endsWith(a));
};
const _waTime = (ts) => {
  try { return new Date(ts).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }); }
  catch { return ""; }
};
const _waDayLabel = (ts) => {
  try {
    const d = new Date(ts), now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    const yest = new Date(now); yest.setDate(now.getDate() - 1);
    if (sameDay) return "Hoy";
    if (d.toDateString() === yest.toDateString()) return "Ayer";
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  } catch { return ""; }
};
const _waListTime = (ts) => {
  try {
    const d = new Date(ts), now = new Date();
    if (d.toDateString() === now.toDateString()) return _waTime(ts);
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  } catch { return ""; }
};

const AgencyWhatsApp = ({ navigate }) => {
  const D = window.Data; D.useStore();
  const toast = (typeof useToast === "function") ? useToast() : null;

  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 769);
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(max-width: 768px)");
    const h = (e) => setIsMobile(e.matches);
    mq.addEventListener ? mq.addEventListener("change", h) : mq.addListener(h);
    return () => { mq.removeEventListener ? mq.removeEventListener("change", h) : mq.removeListener(h); };
  }, []);

  const [sel, setSel] = useState(null);      // waId seleccionado
  const [draft, setDraft] = useState(null);  // { waId, name, clientId } chat nuevo sin mensajes
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [pending, setPending] = useState([]); // mensajes salientes optimistas
  const [q, setQ] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  const threadRef = useRef(null);

  const clients = D.CLIENTS || [];
  const msgs = D.WHATSAPP || [];

  // Agrupar por contacto
  const convs = useMemo(() => {
    const by = {};
    msgs.forEach(m => { (by[m.waId] = by[m.waId] || []).push(m); });
    const list = Object.keys(by).map(waId => {
      const arr = by[waId].slice().sort((a, b) => (a.ts < b.ts ? -1 : 1));
      const last = arr[arr.length - 1];
      const client = clients.find(c => _waMatch(c.whatsapp, waId)) || null;
      const name = client ? (client.company || client.name) : (arr.map(m => m.contactName).filter(Boolean).pop() || ("+" + waId));
      return { waId, arr, last, client, name };
    });
    list.sort((a, b) => (a.last.ts < b.last.ts ? 1 : -1));
    return list;
  }, [msgs, clients]);

  // Incluir el chat nuevo (draft) si no tiene mensajes todavía
  const allConvs = useMemo(() => {
    if (draft && !convs.some(c => c.waId === draft.waId)) {
      return [{ waId: draft.waId, arr: [], last: { ts: new Date().toISOString(), body: "" }, client: draft.client || null, name: draft.name }, ...convs];
    }
    return convs;
  }, [convs, draft]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return allConvs;
    return allConvs.filter(c => (c.name || "").toLowerCase().includes(t) || _waDigits(c.waId).includes(_waDigits(t)));
  }, [allConvs, q]);

  const active = allConvs.find(c => c.waId === sel) || null;

  // Auto-scroll al final al abrir o al llegar mensajes
  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [active && active.arr.length, sel, pending.length]);

  // Ventana de 24h: solo se puede escribir libre dentro de las 24h del último entrante
  const lastInbound = active ? active.arr.filter(m => m.direction === "in").slice(-1)[0] : null;
  const outside24h = active && (!lastInbound || (Date.now() - new Date(lastInbound.ts).getTime() > 24 * 3600 * 1000));

  const send = async () => {
    if (!active) return;
    const body = text.trim();
    if (!body) return;
    const waId = active.waId;
    const clientId = active.client ? active.client.id : null;
    const key = "tmp-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6);
    // Optimista: se muestra al instante y se limpia el input
    setPending(p => [...p, { key, waId, body, ts: new Date().toISOString() }]);
    setText("");
    setSending(true);
    const res = await D.sendWhatsapp(waId, body, clientId);
    setSending(false);
    // El real ya está en el store (sendWhatsapp recarga antes de resolver)
    setPending(p => p.filter(x => x.key !== key));
    if (res && res.ok) {
      if (draft && draft.waId === waId) setDraft(null);
    } else {
      toast ? toast((res && res.error) || "No se pudo enviar", "error") : alert((res && res.error) || "No se pudo enviar");
    }
  };

  const openConv = (waId) => { setSel(waId); };

  // ── Chat nuevo ────────────────────────────────────────────────────────
  const startChat = (waId, name, client) => {
    const d = _waDigits(waId);
    if (!d) return;
    setDraft({ waId: d, name: name || ("+" + d), client: client || clients.find(c => _waMatch(c.whatsapp, d)) || null });
    setSel(d); setNewOpen(false);
  };

  const pal = ["#9e9ae5", "#60a5fa", "#34d399", "#f6a15b", "#e879a6", "#22d3ee"];
  const _av = (name, i) => (name || "?").trim().charAt(0).toUpperCase();

  // ── Render de la lista ────────────────────────────────────────────────
  const List = (
    <div className="wa-list" style={{ width: isMobile ? "100%" : 340, flexShrink: 0, display: "flex", flexDirection: "column",
      borderRight: isMobile ? "none" : "0.5px solid rgba(255,255,255,0.08)", height: "100%", minHeight: 0 }}>
      <div style={{ padding: "20px 18px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, letterSpacing: "-0.04em", color: "var(--text)" }}>WhatsApp</h1>
        <button onClick={() => setNewOpen(true)} title="Nuevo chat" aria-label="Nuevo chat"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 9,
            background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.12)", color: "var(--text)", cursor: "pointer" }}>
          <Icon name="plus" size={16}/>
        </button>
      </div>
      <div style={{ padding: "0 14px 10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, height: 36, padding: "0 11px", borderRadius: 10, background: "rgba(255,255,255,0.05)" }}>
          <Icon name="search" size={14} style={{ color: "var(--text-subtle)", flexShrink: 0 }}/>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar conversación…"
            style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none", color: "var(--text)", fontSize: 13, fontFamily: "inherit" }}/>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none", minHeight: 0, padding: "0 8px 12px" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-subtle)", fontSize: 13, lineHeight: 1.6 }}>
            Aún no hay conversaciones.<br/>Cuando te escriban (o escribas tú) aparecerán aquí.
          </div>
        ) : filtered.map((c, i) => (
          <div key={c.waId} onClick={() => openConv(c.waId)}
            style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 10px", borderRadius: 12, cursor: "pointer",
              background: sel === c.waId ? "rgba(255,255,255,0.07)" : "transparent", transition: "background .12s" }}
            onMouseEnter={e => { if (sel !== c.waId) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
            onMouseLeave={e => { if (sel !== c.waId) e.currentTarget.style.background = "transparent"; }}>
            <span style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, display: "grid", placeItems: "center",
              background: pal[i % pal.length] + "22", color: pal[i % pal.length], fontSize: 15, fontWeight: 600, fontFamily: "var(--font-display)" }}>
              {_av(c.name, i)}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                <span style={{ fontSize: 11, color: "var(--text-subtle)", flexShrink: 0 }}>{c.last && c.last.ts ? _waListTime(c.last.ts) : ""}</span>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>
                {c.last && c.last.direction === "out" ? "Tú: " : ""}{(c.last && c.last.body) || "—"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Render del hilo ───────────────────────────────────────────────────
  const Thread = active ? (
    <div className="wa-thread" style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      {/* Cabecera del contacto */}
      <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "14px 18px", borderBottom: "0.5px solid rgba(255,255,255,0.08)" }}>
        {isMobile && (
          <button onClick={() => setSel(null)} aria-label="Volver" style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", padding: 4 }}>
            <Icon name="chevron-left" size={20}/>
          </button>
        )}
        <span style={{ width: 36, height: 36, borderRadius: 11, flexShrink: 0, display: "grid", placeItems: "center",
          background: "rgba(158,154,229,0.18)", color: "var(--accent)", fontSize: 14, fontWeight: 600, fontFamily: "var(--font-display)" }}>
          {_av(active.name, 0)}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{active.name}</div>
          <div style={{ fontSize: 11.5, color: "var(--text-subtle)" }}>+{_waDigits(active.waId)}</div>
        </div>
        {active.client && (
          <button onClick={() => navigate && navigate("clientDetail", { clientId: active.client.id })}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 11px", borderRadius: 9, cursor: "pointer",
              background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)", color: "var(--text-muted)", fontSize: 12, fontFamily: "inherit" }}>
            <Icon name="users" size={13}/> Ver cliente
          </button>
        )}
      </div>

      {/* Mensajes */}
      <div ref={threadRef} style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none", minHeight: 0, padding: "18px 18px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        {active.arr.length === 0 && (
          <div style={{ margin: "auto", textAlign: "center", color: "var(--text-subtle)", fontSize: 13, lineHeight: 1.6, maxWidth: 320 }}>
            Escribe el primer mensaje.<br/>
            <span style={{ fontSize: 12 }}>Si el contacto no te ha escrito en las últimas 24h, WhatsApp solo permite plantillas aprobadas.</span>
          </div>
        )}
        {active.arr.map((m, i) => {
          const prev = active.arr[i - 1];
          const showDay = !prev || _waDayLabel(prev.ts) !== _waDayLabel(m.ts);
          const out = m.direction === "out";
          return (
            <React.Fragment key={m.id || i}>
              {showDay && (
                <div style={{ alignSelf: "center", margin: "12px 0 10px", fontSize: 11, color: "var(--text-subtle)", background: "rgba(255,255,255,0.05)", padding: "3px 10px", borderRadius: 99 }}>
                  {_waDayLabel(m.ts)}
                </div>
              )}
              <div style={{ alignSelf: out ? "flex-end" : "flex-start", maxWidth: "74%",
                background: out ? "rgba(158,154,229,0.22)" : "rgba(255,255,255,0.055)",
                border: "0.5px solid " + (out ? "rgba(158,154,229,0.28)" : "rgba(255,255,255,0.08)"),
                color: "var(--text)", padding: "8px 12px 6px", borderRadius: 14,
                borderBottomRightRadius: out ? 5 : 14, borderBottomLeftRadius: out ? 14 : 5, marginTop: 3 }}>
                <div style={{ fontSize: 13.5, lineHeight: 1.45, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{m.body}</div>
                <div style={{ fontSize: 10, color: "var(--text-subtle)", textAlign: "right", marginTop: 3, display: "flex", gap: 4, justifyContent: "flex-end", alignItems: "center" }}>
                  {_waTime(m.ts)}
                  {out && m.status && <span style={{ opacity: 0.8 }}>· {({ sent: "enviado", delivered: "entregado", read: "leído", failed: "falló" }[m.status] || m.status)}</span>}
                </div>
              </div>
            </React.Fragment>
          );
        })}
        {/* Mensajes optimistas (enviándose) */}
        {pending.filter(x => x.waId === active.waId).map(x => (
          <div key={x.key} style={{ alignSelf: "flex-end", maxWidth: "74%",
            background: "rgba(158,154,229,0.18)", border: "0.5px solid rgba(158,154,229,0.24)",
            color: "var(--text)", padding: "8px 12px 6px", borderRadius: 14,
            borderBottomRightRadius: 5, marginTop: 3, opacity: 0.75 }}>
            <div style={{ fontSize: 13.5, lineHeight: 1.45, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{x.body}</div>
            <div style={{ fontSize: 10, color: "var(--text-subtle)", textAlign: "right", marginTop: 3 }}>enviando…</div>
          </div>
        ))}
      </div>

      {/* Aviso ventana 24h */}
      {outside24h && (
        <div style={{ margin: "0 18px", padding: "7px 12px", background: "rgba(226,180,92,0.1)", border: "0.5px solid rgba(226,180,92,0.3)", borderRadius: 10, color: "var(--amber)", fontSize: 11.5, lineHeight: 1.4 }}>
          Fuera de la ventana de 24h. WhatsApp puede bloquear mensajes libres; quizá necesites una plantilla aprobada.
        </div>
      )}

      {/* Redacción */}
      <div style={{ padding: "12px 18px 16px", display: "flex", alignItems: "flex-end", gap: 10 }}>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={1}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Escribe un mensaje…"
          style={{ flex: 1, resize: "none", maxHeight: 120, minHeight: 42, padding: "11px 14px", borderRadius: 14,
            background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)", color: "var(--text)",
            fontSize: 14, fontFamily: "inherit", outline: "none", lineHeight: 1.4 }}/>
        <button onClick={send} disabled={sending || !text.trim()} title="Enviar"
          style={{ width: 42, height: 42, flexShrink: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            background: text.trim() ? "var(--accent)" : "rgba(255,255,255,0.08)", color: text.trim() ? "#0a0a0a" : "var(--text-subtle)",
            border: "none", cursor: text.trim() ? "pointer" : "default", transition: "background .14s" }}>
          <Icon name="arrow-up" size={17}/>
        </button>
      </div>
    </div>
  ) : (
    <div className="wa-thread" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-subtle)", gap: 14, padding: 24, textAlign: "center" }}>
      <span style={{ width: 56, height: 56, borderRadius: 16, display: "grid", placeItems: "center", background: "rgba(37,211,102,0.12)" }}>
        <SiIcon name="whatsapp" size={26} style={{ color: "#25D366" }}/>
      </span>
      <div style={{ fontSize: 15, color: "var(--text-muted)" }}>Elige una conversación</div>
      <div style={{ fontSize: 12.5, maxWidth: 360, lineHeight: 1.6 }}>
        O empieza una nueva con el botón <b style={{ color: "var(--text)" }}>+</b>. Los mensajes entrantes aparecen aquí en tiempo real.
      </div>
    </div>
  );

  return (
    <div className="wa-page" style={{ display: "flex", height: "100dvh", overflow: "hidden" }}>
      {isMobile ? (active ? Thread : List) : (<>{List}{Thread}</>)}

      {/* Modal nuevo chat */}
      {newOpen && ReactDOM.createPortal(
        <div onClick={() => setNewOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(8,8,10,0.5)", WebkitBackdropFilter: "blur(14px)", backdropFilter: "blur(14px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, animation: "fade .2s ease" }}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 420, background: "#141416", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 22, padding: 18, animation: "qcIn .3s cubic-bezier(.22,1,.36,1)", maxHeight: "80dvh", display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 16, fontWeight: 500, color: "var(--text)", marginBottom: 12, letterSpacing: "-0.02em" }}>Nuevo chat</div>
            <NewChatBody clients={clients} onStart={startChat}/>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

// Cuerpo del modal "nuevo chat": elegir cliente con teléfono o escribir número
const NewChatBody = ({ clients, onStart }) => {
  const [num, setNum] = useState("");
  const withPhone = (clients || []).filter(c => _waDigits(c.whatsapp).length >= 8);
  return (
    <>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <input value={num} onChange={e => setNum(e.target.value)} placeholder="Número con prefijo (ej. 34612345678)"
          onKeyDown={e => { if (e.key === "Enter" && _waDigits(num).length >= 8) onStart(num); }}
          style={{ flex: 1, height: 42, padding: "0 13px", borderRadius: 11, background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)", color: "var(--text)", fontSize: 14, fontFamily: "inherit", outline: "none" }}/>
        <button onClick={() => _waDigits(num).length >= 8 && onStart(num)} disabled={_waDigits(num).length < 8}
          style={{ padding: "0 16px", borderRadius: 11, background: _waDigits(num).length >= 8 ? "var(--accent)" : "rgba(255,255,255,0.08)", color: _waDigits(num).length >= 8 ? "#0a0a0a" : "var(--text-subtle)", border: "none", cursor: _waDigits(num).length >= 8 ? "pointer" : "default", fontSize: 14, fontWeight: 500, fontFamily: "inherit" }}>
          Abrir
        </button>
      </div>
      {withPhone.length > 0 && (
        <>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-subtle)", margin: "4px 0 6px" }}>Clientes con teléfono</div>
          <div style={{ overflowY: "auto", scrollbarWidth: "none", minHeight: 0 }}>
            {withPhone.map(c => (
              <div key={c.id} onClick={() => onStart(c.whatsapp, c.company || c.name, c)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 8px", borderRadius: 10, cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <span style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, display: "grid", placeItems: "center", background: "rgba(158,154,229,0.18)", color: "var(--accent)", fontSize: 13, fontWeight: 600, fontFamily: "var(--font-display)" }}>
                  {(c.company || c.name || "?").charAt(0).toUpperCase()}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.company || c.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-subtle)" }}>+{_waDigits(c.whatsapp)}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
};

window.AgencyWhatsApp = AgencyWhatsApp;

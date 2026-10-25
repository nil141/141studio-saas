(() => {
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
    try {
      return new Date(ts).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };
  const _waDayLabel = (ts) => {
    try {
      const d = new Date(ts), now = /* @__PURE__ */ new Date();
      const sameDay = d.toDateString() === now.toDateString();
      const yest = new Date(now);
      yest.setDate(now.getDate() - 1);
      if (sameDay) return "Hoy";
      if (d.toDateString() === yest.toDateString()) return "Ayer";
      return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
    } catch {
      return "";
    }
  };
  const _waListTime = (ts) => {
    try {
      const d = new Date(ts), now = /* @__PURE__ */ new Date();
      if (d.toDateString() === now.toDateString()) return _waTime(ts);
      return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
    } catch {
      return "";
    }
  };
  let _fbSdkPromise = null;
  const _waLoadFbSdk = () => {
    if (window.FB) return Promise.resolve(window.FB);
    if (_fbSdkPromise) return _fbSdkPromise;
    _fbSdkPromise = new Promise((resolve) => {
      window.fbAsyncInit = () => resolve(window.FB);
      const s = document.createElement("script");
      s.src = "https://connect.facebook.net/en_US/sdk.js";
      s.async = true;
      s.defer = true;
      s.crossOrigin = "anonymous";
      s.onerror = () => resolve(null);
      document.body.appendChild(s);
    });
    return _fbSdkPromise;
  };
  const _waLaunchES = (status) => new Promise(async (resolve) => {
    const FB = await _waLoadFbSdk();
    if (!FB) return resolve({ error: "No se pudo cargar el SDK de Facebook." });
    try {
      FB.init({ appId: status.appId, autoLogAppEvents: true, xfbml: false, version: status.apiVersion || "v22.0" });
    } catch (e) {
      return resolve({ error: "No se pudo iniciar el SDK." });
    }
    let session = {};
    const onMsg = (event) => {
      try {
        if (!/facebook\.com$/.test(new URL(event.origin).hostname)) return;
        const d = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (d && d.type === "WA_EMBEDDED_SIGNUP") session = d.data || {};
      } catch (_) {
      }
    };
    window.addEventListener("message", onMsg);
    FB.login((resp) => {
      window.removeEventListener("message", onMsg);
      const code = resp && resp.authResponse && resp.authResponse.code;
      if (!code) return resolve({ error: "Conexi\xF3n cancelada." });
      resolve({ code, phone_number_id: session.phone_number_id, waba_id: session.waba_id });
    }, {
      config_id: status.esConfigId,
      response_type: "code",
      override_default_response_type: true,
      extras: { setup: {}, featureType: "whatsapp_business_app_onboarding" }
    });
  });
  const WaConnectBanner = () => {
    const [st, setSt] = useState(null);
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState("");
    const D = window.Data;
    const refresh = async () => {
      try {
        setSt(await D.whatsappStatus());
      } catch (_) {
      }
    };
    useEffect(() => {
      refresh();
    }, []);
    if (!st) return null;
    if (st.connected) return null;
    const onConnect = async () => {
      setMsg("");
      setBusy(true);
      const r = await _waLaunchES(st);
      if (r.error || !r.code) {
        setBusy(false);
        setMsg(r.error || "No se recibi\xF3 el c\xF3digo.");
        return;
      }
      const out = await D.connectWhatsapp({ code: r.code, phone_number_id: r.phone_number_id, waba_id: r.waba_id });
      setBusy(false);
      if (out && out.ok) {
        setMsg("");
        refresh();
      } else setMsg(out && out.error || "No se pudo conectar.");
    };
    return /* @__PURE__ */ React.createElement("div", { style: {
      margin: "0",
      padding: "12px 16px",
      display: "flex",
      alignItems: "center",
      gap: 12,
      background: "rgba(37,211,102,0.08)",
      borderBottom: "0.5px solid rgba(37,211,102,0.22)"
    } }, /* @__PURE__ */ React.createElement("span", { style: { width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: "grid", placeItems: "center", background: "rgba(37,211,102,0.14)" } }, /* @__PURE__ */ React.createElement(SiIcon, { name: "whatsapp", size: 18, style: { color: "#25D366" } })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, fontWeight: 500, color: "var(--text)" } }, "Conecta tu n\xFAmero de WhatsApp Business"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4 } }, st.configured ? "Vincula tu n\xFAmero (coexistencia): se cargan tus chats y sigues usando el m\xF3vil." : "Conexi\xF3n pendiente de configurar en el servidor (Embedded Signup). En cuanto est\xE9, aqu\xED saldr\xE1 el bot\xF3n.", msg ? /* @__PURE__ */ React.createElement("span", { style: { color: "var(--red)" } }, " \xB7 ", msg) : null)), st.configured && /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: onConnect,
        disabled: busy,
        style: {
          flexShrink: 0,
          padding: "9px 16px",
          borderRadius: 10,
          border: "none",
          cursor: busy ? "default" : "pointer",
          background: "#25D366",
          color: "#07220f",
          fontSize: 13,
          fontWeight: 600,
          fontFamily: "inherit"
        }
      },
      busy ? "Conectando\u2026" : "Conectar WhatsApp"
    ));
  };
  const _MAIL_CREDS_KEY = "141_mail_creds";
  const _mailCreds = () => {
    try {
      return JSON.parse(localStorage.getItem(_MAIL_CREDS_KEY) || "null");
    } catch {
      return null;
    }
  };
  const _mailApi = async (ep, body) => {
    const res = await window.apiFetch("/api/mail/" + ep, body);
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.json();
  };
  const _mailAddr = (from) => {
    const m = /<([^>]+)>/.exec(from || "");
    return (m ? m[1] : from || "").trim();
  };
  const _mailName = (from) => {
    const m = String(from || "").match(/^"?([^"<]+?)"?\s*<[^>]+>$/);
    return m ? m[1].trim() : from || "\u2014";
  };
  const _mailIso = (d) => {
    const t = new Date(d);
    return isNaN(t.getTime()) ? (/* @__PURE__ */ new Date(0)).toISOString() : t.toISOString();
  };
  const _mailFull = (d) => {
    try {
      return new Date(d).toLocaleString("es-ES", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
    } catch {
      return d || "";
    }
  };
  let _mailCache = { key: null, list: [] };
  const useMailInbox = (enabled) => {
    const [creds, setCredsS] = useState(_mailCreds);
    const key = creds ? creds.email : null;
    const [mails, setMails] = useState(() => key && _mailCache.key === key ? _mailCache.list : []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const load = async () => {
      if (!creds) return;
      setLoading(true);
      try {
        const r = await _mailApi("messages", { creds, folder: "INBOX", page: 1 });
        if (r && r.ok) {
          const list = r.messages || [];
          _mailCache = { key, list };
          setMails(list);
          setError("");
        } else setError(r && r.error || "No se pudo cargar el correo");
      } catch (_) {
        setError("No se pudo cargar el correo");
      }
      setLoading(false);
    };
    useEffect(() => {
      if (!enabled || !creds) return;
      load();
      const id = setInterval(() => {
        if (!document.hidden) load();
      }, 6e4);
      return () => clearInterval(id);
    }, [enabled, key]);
    const setCreds = (c) => {
      setCredsS(c);
      try {
        c ? localStorage.setItem(_MAIL_CREDS_KEY, JSON.stringify(c)) : localStorage.removeItem(_MAIL_CREDS_KEY);
      } catch (_) {
      }
    };
    const markRead = (uid) => setMails((ms) => {
      const n = ms.map((x) => x.uid === uid ? { ...x, read: true } : x);
      _mailCache = { key, list: n };
      return n;
    });
    return { creds, setCreds, mails, loading, error, reload: load, markRead };
  };
  const MailThread = ({ m, creds, isMobile, onBack, onRead, toast }) => {
    const [detail, setDetail] = useState(null);
    const [err, setErr] = useState("");
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState([]);
    const scrollRef = useRef(null);
    useEffect(() => {
      let alive = true;
      setDetail(null);
      setErr("");
      setSent([]);
      setText("");
      _mailApi("message", { creds, uid: m.uid, folder: "INBOX" }).then((r) => {
        if (!alive) return;
        if (r && r.ok) {
          setDetail(r);
          onRead && onRead(m.uid);
        } else setErr(r && r.error || "No se pudo abrir el correo");
      }).catch(() => alive && setErr("Sin conexi\xF3n con el servidor de correo"));
      return () => {
        alive = false;
      };
    }, [m.uid]);
    useEffect(() => {
      const el = scrollRef.current;
      if (el && sent.length) el.scrollTop = el.scrollHeight;
    }, [sent.length]);
    const from = detail && detail.from || m.from;
    const name = _mailName(from);
    const subject = detail && detail.subject || m.subject || "(sin asunto)";
    const send = async () => {
      const body = text.trim();
      if (!body || sending) return;
      setSending(true);
      try {
        const r = await _mailApi("send", {
          creds,
          to: _mailAddr(from),
          body,
          subject: /^re:/i.test(subject) ? subject : "Re: " + subject,
          in_reply_to: detail && detail.message_id || ""
        });
        if (r && r.ok) {
          setSent((x) => [...x, { body, ts: (/* @__PURE__ */ new Date()).toISOString() }]);
          setText("");
        } else toast ? toast(r && r.error || "No se pudo enviar", "error") : alert(r && r.error || "No se pudo enviar");
      } catch (_) {
        toast ? toast("No se pudo enviar", "error") : alert("No se pudo enviar");
      }
      setSending(false);
    };
    const html = detail && detail.html ? '<base target="_blank">' + detail.html : null;
    return /* @__PURE__ */ React.createElement("div", { className: "wa-thread", style: { flex: 1, display: "flex", flexDirection: "column", height: "100%", minHeight: 0, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 11, padding: "14px 18px", borderBottom: "0.5px solid rgba(255,255,255,0.08)" } }, isMobile && /* @__PURE__ */ React.createElement("button", { onClick: onBack, "aria-label": "Volver", style: { background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", padding: 4 } }, /* @__PURE__ */ React.createElement(Icon, { name: "chevron-left", size: 20 })), /* @__PURE__ */ React.createElement("span", { style: {
      width: 36,
      height: 36,
      borderRadius: 11,
      flexShrink: 0,
      display: "grid",
      placeItems: "center",
      background: "rgba(158,154,229,0.18)",
      color: "var(--accent)",
      fontSize: 14,
      fontWeight: 600,
      fontFamily: "var(--font-display)"
    } }, (name || "?").trim().charAt(0).toUpperCase()), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontWeight: 500, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--text-subtle)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, _mailAddr(from)))), /* @__PURE__ */ React.createElement("div", { ref: scrollRef, style: { flex: 1, overflowY: "auto", scrollbarWidth: "none", minHeight: 0, padding: "18px 18px 8px", display: "flex", flexDirection: "column" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 17, fontWeight: 500, letterSpacing: "-0.02em", color: "var(--text)", lineHeight: 1.35 } }, subject), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--text-subtle)", margin: "4px 0 14px" } }, _mailFull(m.date)), !detail && !err && /* @__PURE__ */ React.createElement("div", { style: { color: "var(--text-subtle)", fontSize: 13, padding: "20px 0" } }, "Cargando\u2026"), err && /* @__PURE__ */ React.createElement("div", { style: { color: "var(--red)", fontSize: 13, padding: "20px 0" } }, err), detail && (html ? /* @__PURE__ */ React.createElement("div", { style: { background: "#fff", borderRadius: 12, overflow: "hidden", flexShrink: 0 } }, /* @__PURE__ */ React.createElement(
      "iframe",
      {
        key: m.uid,
        title: subject,
        srcDoc: html,
        sandbox: "allow-same-origin allow-popups allow-popups-to-escape-sandbox",
        style: { width: "100%", border: "none", display: "block", minHeight: 160 },
        onLoad: (e) => {
          try {
            const b = e.target.contentDocument && e.target.contentDocument.body;
            if (b) e.target.style.height = b.scrollHeight + 24 + "px";
          } catch (_) {
          }
        }
      }
    )) : /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, lineHeight: 1.6, color: "var(--text)", whiteSpace: "pre-wrap", wordBreak: "break-word" } }, detail.text || "(sin contenido)")), sent.map((x, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: {
      alignSelf: "flex-end",
      maxWidth: "80%",
      marginTop: 12,
      background: "rgba(158,154,229,0.22)",
      border: "0.5px solid rgba(158,154,229,0.28)",
      color: "var(--text)",
      padding: "8px 12px 6px",
      borderRadius: 14,
      borderBottomRightRadius: 5,
      transformOrigin: "bottom right",
      animation: "msgIn .26s cubic-bezier(.22,1,.36,1)"
    } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, lineHeight: 1.45, whiteSpace: "pre-wrap", wordBreak: "break-word" } }, x.body), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "var(--text-subtle)", textAlign: "right", marginTop: 3 } }, "Respuesta enviada \xB7 ", _waTime(x.ts))))), /* @__PURE__ */ React.createElement("div", { style: { padding: "12px 18px 16px", display: "flex", alignItems: "flex-end", gap: 10 } }, /* @__PURE__ */ React.createElement(
      "textarea",
      {
        value: text,
        onChange: (e) => setText(e.target.value),
        rows: 2,
        onKeyDown: (e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            send();
          }
        },
        placeholder: "Responder a " + name + "\u2026",
        style: {
          flex: 1,
          resize: "none",
          maxHeight: 180,
          minHeight: 42,
          padding: "11px 14px",
          borderRadius: 14,
          background: "rgba(255,255,255,0.05)",
          border: "0.5px solid rgba(255,255,255,0.1)",
          color: "var(--text)",
          fontSize: 14,
          fontFamily: "inherit",
          outline: "none",
          lineHeight: 1.4
        }
      }
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: send,
        disabled: sending || !text.trim(),
        title: "Enviar (\u2318 + Enter)",
        style: {
          width: 42,
          height: 42,
          flexShrink: 0,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: text.trim() ? "var(--accent)" : "rgba(255,255,255,0.08)",
          color: text.trim() ? "#0a0a0a" : "var(--text-subtle)",
          border: "none",
          cursor: text.trim() ? "pointer" : "default",
          transition: "background .14s",
          opacity: sending ? 0.6 : 1
        }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "arrow-up", size: 17 })
    )));
  };
  const InboxModal = ({ title, onClose, children, width = 420 }) => ReactDOM.createPortal(
    /* @__PURE__ */ React.createElement("div", { onClick: onClose, style: { position: "fixed", inset: 0, zIndex: 300, background: "rgba(8,8,10,0.5)", WebkitBackdropFilter: "blur(14px)", backdropFilter: "blur(14px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, animation: "fade .2s ease" } }, /* @__PURE__ */ React.createElement("div", { onClick: (e) => e.stopPropagation(), style: { width: "100%", maxWidth: width, background: "#141416", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 22, padding: 18, animation: "qcIn .3s cubic-bezier(.22,1,.36,1)", maxHeight: "86dvh", display: "flex", flexDirection: "column", overflowY: "auto", scrollbarWidth: "none" } }, title && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, fontWeight: 500, color: "var(--text)", marginBottom: 12, letterSpacing: "-0.02em" } }, title), children)),
    document.body
  );
  const _inField = { height: 42, padding: "0 13px", borderRadius: 11, background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)", color: "var(--text)", fontSize: 14, fontFamily: "inherit", outline: "none", width: "100%", boxSizing: "border-box" };
  const ComposeMail = ({ creds, onDone, toast }) => {
    const [to, setTo] = useState(""), [subject, setSubject] = useState(""), [body, setBody] = useState("");
    const [sending, setSending] = useState(false);
    const ok = /\S+@\S+\.\S+/.test(to.trim()) && body.trim();
    const send = async () => {
      if (!ok || sending) return;
      setSending(true);
      try {
        const r = await _mailApi("send", { creds, to: to.trim(), subject, body });
        if (r && r.ok) {
          toast && toast("Correo enviado");
          onDone();
        } else toast ? toast(r && r.error || "No se pudo enviar", "error") : alert(r && r.error || "No se pudo enviar");
      } catch (_) {
        toast ? toast("No se pudo enviar", "error") : alert("No se pudo enviar");
      }
      setSending(false);
    };
    return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement("input", { value: to, onChange: (e) => setTo(e.target.value), placeholder: "Para", style: _inField }), /* @__PURE__ */ React.createElement("input", { value: subject, onChange: (e) => setSubject(e.target.value), placeholder: "Asunto", style: _inField }), /* @__PURE__ */ React.createElement(
      "textarea",
      {
        value: body,
        onChange: (e) => setBody(e.target.value),
        placeholder: "Escribe tu mensaje\u2026",
        rows: 8,
        style: { ..._inField, height: "auto", padding: "11px 13px", resize: "vertical", lineHeight: 1.45 }
      }
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: send,
        disabled: !ok || sending,
        style: {
          marginTop: 4,
          height: 42,
          borderRadius: 11,
          border: "none",
          fontSize: 14,
          fontWeight: 500,
          fontFamily: "inherit",
          background: ok ? "var(--accent)" : "rgba(255,255,255,0.08)",
          color: ok ? "#0a0a0a" : "var(--text-subtle)",
          cursor: ok ? "pointer" : "default"
        }
      },
      sending ? "Enviando\u2026" : "Enviar"
    ));
  };
  const Inbox = ({ navigate, mode }) => {
    const uni = mode === "unibox";
    const D = window.Data;
    D.useStore();
    const toast = typeof useToast === "function" ? useToast() : null;
    const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 769);
    useEffect(() => {
      if (!window.matchMedia) return;
      const mq = window.matchMedia("(max-width: 768px)");
      const h = (e) => setIsMobile(e.matches);
      mq.addEventListener ? mq.addEventListener("change", h) : mq.addListener(h);
      return () => {
        mq.removeEventListener ? mq.removeEventListener("change", h) : mq.removeListener(h);
      };
    }, []);
    const [sel, setSel] = useState(null);
    const [draft, setDraft] = useState(null);
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const [pending, setPending] = useState([]);
    const [q, setQ] = useState("");
    const [newOpen, setNewOpen] = useState(false);
    const [newMenu, setNewMenu] = useState(false);
    const [composeOpen, setComposeOpen] = useState(false);
    const [mailSetup, setMailSetup] = useState(false);
    const [filter, setFilterS] = useState(() => {
      try {
        return uni && localStorage.getItem("141_unibox_filter") || "all";
      } catch {
        return "all";
      }
    });
    const setFilter = (f) => {
      setFilterS(f);
      try {
        localStorage.setItem("141_unibox_filter", f);
      } catch (_) {
      }
    };
    const chan = uni ? filter : "wa";
    const mail = useMailInbox(uni);
    const threadRef = useRef(null);
    useEffect(() => {
      if (!newMenu) return;
      const c = () => setNewMenu(false);
      window.addEventListener("click", c);
      return () => window.removeEventListener("click", c);
    }, [newMenu]);
    useEffect(() => {
      let alive = true;
      const tick = () => {
        if (alive && D.reloadWhatsapp) {
          try {
            D.reloadWhatsapp();
          } catch (_) {
          }
        }
      };
      tick();
      const id = setInterval(() => {
        if (!document.hidden) tick();
      }, 4e3);
      const onVis = () => {
        if (!document.hidden) tick();
      };
      document.addEventListener("visibilitychange", onVis);
      return () => {
        alive = false;
        clearInterval(id);
        document.removeEventListener("visibilitychange", onVis);
      };
    }, []);
    const clients = D.CLIENTS || [];
    const msgs = D.WHATSAPP || [];
    const convs = useMemo(() => {
      const by = {};
      msgs.forEach((m) => {
        (by[m.waId] = by[m.waId] || []).push(m);
      });
      const list = Object.keys(by).map((waId) => {
        const arr = by[waId].slice().sort((a, b) => a.ts < b.ts ? -1 : 1);
        const last = arr[arr.length - 1];
        const client = clients.find((c) => _waMatch(c.whatsapp, waId)) || null;
        const name = client ? client.company || client.name : arr.map((m) => m.contactName).filter(Boolean).pop() || "+" + waId;
        return { waId, arr, last, client, name };
      });
      list.sort((a, b) => a.last.ts < b.last.ts ? 1 : -1);
      return list;
    }, [msgs, clients]);
    const allConvs = useMemo(() => {
      if (draft && !convs.some((c) => c.waId === draft.waId)) {
        return [{ waId: draft.waId, arr: [], last: { ts: (/* @__PURE__ */ new Date()).toISOString(), body: "" }, client: draft.client || null, name: draft.name }, ...convs];
      }
      return convs;
    }, [convs, draft]);
    const items = useMemo(() => {
      const wa = chan === "mail" ? [] : allConvs.map((c) => ({
        key: "wa:" + c.waId,
        ch: "wa",
        name: c.name,
        ts: c.last && c.last.ts || "",
        waId: c.waId,
        preview: (c.last && c.last.direction === "out" ? "T\xFA: " : "") + (c.last && c.last.body || "\u2014"),
        unread: !!(c.last && c.last.direction === "in")
      }));
      const ml = chan === "wa" ? [] : mail.mails.map((m) => ({
        key: "mail:" + m.uid,
        ch: "mail",
        name: _mailName(m.from),
        ts: _mailIso(m.date),
        addr: _mailAddr(m.from),
        preview: m.subject || "(sin asunto)",
        unread: !m.read
      }));
      const all = wa.concat(ml);
      if (uni) all.sort((a, b) => a.ts < b.ts ? 1 : a.ts > b.ts ? -1 : 0);
      return all;
    }, [allConvs, mail.mails, chan, uni]);
    const filtered = useMemo(() => {
      const t = q.trim().toLowerCase();
      if (!t) return items;
      return items.filter((it) => (it.name || "").toLowerCase().includes(t) || (it.preview || "").toLowerCase().includes(t) || (it.addr || "").toLowerCase().includes(t) || it.waId && _waDigits(t) && _waDigits(it.waId).includes(_waDigits(t)));
    }, [items, q]);
    const active = sel && sel.indexOf("wa:") === 0 ? allConvs.find((c) => c.waId === sel.slice(3)) || null : null;
    const activeMail = sel && sel.indexOf("mail:") === 0 ? mail.mails.find((m) => "mail:" + m.uid === sel) || null : null;
    const seenRef = useRef(/* @__PURE__ */ new Set());
    const lastSelRef = useRef(void 0);
    if (lastSelRef.current !== sel) {
      const s = /* @__PURE__ */ new Set();
      (active ? active.arr : []).forEach((m) => m.id && s.add(m.id));
      seenRef.current = s;
      lastSelRef.current = sel;
    }
    useEffect(() => {
      (active ? active.arr : []).forEach((m) => m.id && seenRef.current.add(m.id));
    });
    useEffect(() => {
      const el = threadRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }, [active && active.arr.length, sel, pending.length]);
    const lastInbound = active ? active.arr.filter((m) => m.direction === "in").slice(-1)[0] : null;
    const outside24h = active && (!lastInbound || Date.now() - new Date(lastInbound.ts).getTime() > 24 * 3600 * 1e3);
    const send = async () => {
      if (!active) return;
      const body = text.trim();
      if (!body) return;
      const waId = active.waId;
      const clientId = active.client ? active.client.id : null;
      const key = "tmp-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6);
      setPending((p) => [...p, { key, waId, body, ts: (/* @__PURE__ */ new Date()).toISOString() }]);
      setText("");
      setSending(true);
      const res = await D.sendWhatsapp(waId, body, clientId);
      setSending(false);
      setPending((p) => p.filter((x) => x.key !== key));
      if (res && res.ok) {
        if (draft && draft.waId === waId) setDraft(null);
      } else {
        toast ? toast(res && res.error || "No se pudo enviar", "error") : alert(res && res.error || "No se pudo enviar");
      }
    };
    const startChat = (waId, name, client) => {
      const d = _waDigits(waId);
      if (!d) return;
      setDraft({ waId: d, name: name || "+" + d, client: client || clients.find((c) => _waMatch(c.whatsapp, d)) || null });
      setSel("wa:" + d);
      setNewOpen(false);
    };
    const newMail = () => {
      setNewMenu(false);
      if (mail.creds) setComposeOpen(true);
      else setMailSetup(true);
    };
    const pal = ["#9e9ae5", "#60a5fa", "#34d399", "#f6a15b", "#e879a6", "#22d3ee"];
    const _pc = (name) => {
      let h = 0;
      const s = String(name || "");
      for (let i = 0; i < s.length; i++) h = h * 31 + s.charCodeAt(i) >>> 0;
      return pal[h % pal.length];
    };
    const _av = (name) => (name || "?").trim().charAt(0).toUpperCase();
    const unreadOf = (ch) => items.length && chan === "all" ? items.filter((it) => it.ch === ch && it.unread).length : 0;
    const List = /* @__PURE__ */ React.createElement("div", { className: "wa-list", style: {
      width: isMobile ? "100%" : 340,
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
      borderRight: isMobile ? "none" : "0.5px solid rgba(255,255,255,0.08)",
      height: "100%",
      minHeight: 0
    } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "20px 18px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 } }, /* @__PURE__ */ React.createElement("h1", { style: { margin: 0, fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, letterSpacing: "-0.04em", color: "var(--text)" } }, uni ? "Unibox" : "WhatsApp"), /* @__PURE__ */ React.createElement("div", { style: { position: "relative" }, onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => uni ? setNewMenu((o) => !o) : setNewOpen(true),
        title: "Nuevo mensaje",
        "aria-label": "Nuevo mensaje",
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          height: 32,
          borderRadius: 9,
          background: "rgba(255,255,255,0.06)",
          border: "0.5px solid rgba(255,255,255,0.12)",
          color: "var(--text)",
          cursor: "pointer"
        }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 16 })
    ), newMenu && /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      top: 38,
      right: 0,
      zIndex: 20,
      width: 190,
      padding: 5,
      borderRadius: 13,
      background: "#161618",
      border: "0.5px solid rgba(255,255,255,0.1)",
      boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
      animation: "fade .14s ease"
    } }, [["wa", "Chat de WhatsApp", () => {
      setNewMenu(false);
      setNewOpen(true);
    }], ["mail", "Correo nuevo", newMail]].map(([k, l, fn]) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: k,
        onClick: fn,
        style: {
          display: "flex",
          alignItems: "center",
          gap: 10,
          width: "100%",
          padding: "9px 10px",
          borderRadius: 9,
          border: "none",
          background: "transparent",
          color: "var(--text)",
          fontSize: 13,
          fontFamily: "inherit",
          cursor: "pointer",
          textAlign: "left"
        },
        onMouseEnter: (e) => e.currentTarget.style.background = "rgba(255,255,255,0.06)",
        onMouseLeave: (e) => e.currentTarget.style.background = "transparent"
      },
      k === "wa" ? /* @__PURE__ */ React.createElement(SiIcon, { name: "whatsapp", size: 15, style: { color: "#25D366" } }) : /* @__PURE__ */ React.createElement(Icon, { name: "mail", size: 15, style: { color: "var(--accent)" } }),
      l
    ))))), uni && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, padding: "0 14px 10px" } }, [["all", "Todo"], ["wa", "WhatsApp"], ["mail", "Correo"]].map(([k, l]) => {
      const on = filter === k;
      const n = k === "all" ? 0 : unreadOf(k);
      return /* @__PURE__ */ React.createElement(
        "button",
        {
          key: k,
          onClick: () => setFilter(k),
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 12px",
            borderRadius: 99,
            fontSize: 12.5,
            fontFamily: "inherit",
            cursor: "pointer",
            border: "0.5px solid " + (on ? "rgba(158,154,229,0.4)" : "rgba(255,255,255,0.1)"),
            background: on ? "rgba(158,154,229,0.16)" : "transparent",
            color: on ? "var(--text)" : "var(--text-muted)",
            transition: "background .14s, color .14s"
          }
        },
        l,
        n > 0 && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: "var(--accent)" } }, n)
      );
    })), /* @__PURE__ */ React.createElement("div", { style: { padding: "0 14px 10px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, height: 36, padding: "0 11px", borderRadius: 10, background: "rgba(255,255,255,0.05)" } }, /* @__PURE__ */ React.createElement(Icon, { name: "search", size: 14, style: { color: "var(--text-subtle)", flexShrink: 0 } }), /* @__PURE__ */ React.createElement(
      "input",
      {
        value: q,
        onChange: (e) => setQ(e.target.value),
        placeholder: uni ? "Buscar mensajes\u2026" : "Buscar conversaci\xF3n\u2026",
        style: { flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none", color: "var(--text)", fontSize: 13, fontFamily: "inherit" }
      }
    ))), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, overflowY: "auto", scrollbarWidth: "none", minHeight: 0, padding: "0 8px 12px" } }, uni && chan !== "wa" && !mail.creds && /* @__PURE__ */ React.createElement(
      "div",
      {
        onClick: () => setMailSetup(true),
        style: {
          display: "flex",
          alignItems: "center",
          gap: 11,
          margin: "0 2px 8px",
          padding: "11px 10px",
          borderRadius: 12,
          cursor: "pointer",
          border: "0.5px dashed rgba(255,255,255,0.14)",
          transition: "background .12s"
        },
        onMouseEnter: (e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)",
        onMouseLeave: (e) => e.currentTarget.style.background = "transparent"
      },
      /* @__PURE__ */ React.createElement("span", { style: { width: 40, height: 40, borderRadius: 12, flexShrink: 0, display: "grid", placeItems: "center", background: "rgba(158,154,229,0.14)", color: "var(--accent)" } }, /* @__PURE__ */ React.createElement(Icon, { name: "mail", size: 18 })),
      /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, fontWeight: 500, color: "var(--text)" } }, "Conecta tu correo"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-muted)", marginTop: 2 } }, "Gmail, Outlook o IMAP \xB7 tus emails llegar\xE1n aqu\xED"))
    ), uni && chan !== "wa" && mail.creds && mail.error && /* @__PURE__ */ React.createElement("div", { style: { margin: "0 4px 8px", padding: "8px 10px", borderRadius: 10, background: "rgba(248,113,113,0.08)", color: "var(--red)", fontSize: 12, display: "flex", justifyContent: "space-between", gap: 8 } }, /* @__PURE__ */ React.createElement("span", null, mail.error), /* @__PURE__ */ React.createElement("span", { style: { display: "flex", gap: 10, flexShrink: 0 } }, /* @__PURE__ */ React.createElement("button", { onClick: mail.reload, style: { background: "none", border: "none", color: "var(--text)", fontSize: 12, cursor: "pointer", fontFamily: "inherit", padding: 0 } }, "Reintentar"), /* @__PURE__ */ React.createElement("button", { onClick: () => setMailSetup(true), style: { background: "none", border: "none", color: "var(--text-muted)", fontSize: 12, cursor: "pointer", fontFamily: "inherit", padding: 0 } }, "Reconectar"))), filtered.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { padding: "40px 20px", textAlign: "center", color: "var(--text-subtle)", fontSize: 13, lineHeight: 1.6 } }, mail.loading && chan === "mail" ? "Cargando correo\u2026" : q.trim() ? "Sin resultados." : /* @__PURE__ */ React.createElement(React.Fragment, null, "A\xFAn no hay mensajes.", /* @__PURE__ */ React.createElement("br", null), "Cuando te escriban aparecer\xE1n aqu\xED.")) : filtered.map((it) => {
      const on = sel === it.key;
      const col = it.ch === "mail" ? "#9e9ae5" : _pc(it.name);
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          key: it.key,
          onClick: () => setSel(it.key),
          style: {
            display: "flex",
            alignItems: "center",
            gap: 11,
            padding: "10px 10px",
            borderRadius: 12,
            cursor: "pointer",
            background: on ? "rgba(255,255,255,0.07)" : "transparent",
            transition: "background .12s"
          },
          onMouseEnter: (e) => {
            if (!on) e.currentTarget.style.background = "rgba(255,255,255,0.03)";
          },
          onMouseLeave: (e) => {
            if (!on) e.currentTarget.style.background = "transparent";
          }
        },
        /* @__PURE__ */ React.createElement("span", { style: { position: "relative", width: 40, height: 40, flexShrink: 0 } }, /* @__PURE__ */ React.createElement("span", { style: {
          width: 40,
          height: 40,
          borderRadius: 12,
          display: "grid",
          placeItems: "center",
          background: col + "22",
          color: col,
          fontSize: 15,
          fontWeight: 600,
          fontFamily: "var(--font-display)"
        } }, _av(it.name)), uni && /* @__PURE__ */ React.createElement("span", { style: {
          position: "absolute",
          right: -4,
          bottom: -4,
          width: 19,
          height: 19,
          borderRadius: 99,
          display: "grid",
          placeItems: "center",
          background: "#0e0e10",
          border: "1.5px solid #0e0e10"
        } }, it.ch === "wa" ? /* @__PURE__ */ React.createElement(SiIcon, { name: "whatsapp", size: 11, style: { color: "#25D366" } }) : /* @__PURE__ */ React.createElement(Icon, { name: "mail", size: 11, strokeWidth: 2, style: { color: "var(--accent)" } }))),
        /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13.5, fontWeight: uni && it.unread ? 600 : 500, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, it.name), /* @__PURE__ */ React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 6, flexShrink: 0 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: "var(--text-subtle)" } }, it.ts ? _waListTime(it.ts) : ""), uni && it.unread && /* @__PURE__ */ React.createElement("span", { style: { width: 7, height: 7, borderRadius: 99, background: "var(--accent)" } }))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: uni && it.unread ? "var(--text)" : "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 } }, it.preview))
      );
    })));
    const Thread = activeMail ? /* @__PURE__ */ React.createElement(MailThread, { m: activeMail, creds: mail.creds, isMobile, onBack: () => setSel(null), onRead: mail.markRead, toast }) : active ? /* @__PURE__ */ React.createElement("div", { className: "wa-thread", style: { flex: 1, display: "flex", flexDirection: "column", height: "100%", minHeight: 0, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 11, padding: "14px 18px", borderBottom: "0.5px solid rgba(255,255,255,0.08)" } }, isMobile && /* @__PURE__ */ React.createElement("button", { onClick: () => setSel(null), "aria-label": "Volver", style: { background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", padding: 4 } }, /* @__PURE__ */ React.createElement(Icon, { name: "chevron-left", size: 20 })), /* @__PURE__ */ React.createElement("span", { style: {
      width: 36,
      height: 36,
      borderRadius: 11,
      flexShrink: 0,
      display: "grid",
      placeItems: "center",
      background: "rgba(158,154,229,0.18)",
      color: "var(--accent)",
      fontSize: 14,
      fontWeight: 600,
      fontFamily: "var(--font-display)"
    } }, _av(active.name)), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontWeight: 500, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, active.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--text-subtle)" } }, "+", _waDigits(active.waId))), active.client && /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => navigate && navigate("clientDetail", { clientId: active.client.id }),
        style: {
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 11px",
          borderRadius: 9,
          cursor: "pointer",
          background: "rgba(255,255,255,0.05)",
          border: "0.5px solid rgba(255,255,255,0.1)",
          color: "var(--text-muted)",
          fontSize: 12,
          fontFamily: "inherit"
        }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "users", size: 13 }),
      " Ver cliente"
    )), /* @__PURE__ */ React.createElement("div", { ref: threadRef, style: { flex: 1, overflowY: "auto", scrollbarWidth: "none", minHeight: 0, padding: "18px 18px 8px", display: "flex", flexDirection: "column", gap: 2 } }, active.arr.length === 0 && /* @__PURE__ */ React.createElement("div", { style: { margin: "auto", textAlign: "center", color: "var(--text-subtle)", fontSize: 13, lineHeight: 1.6, maxWidth: 320 } }, "Escribe el primer mensaje.", /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12 } }, "Si el contacto no te ha escrito en las \xFAltimas 24h, WhatsApp solo permite plantillas aprobadas.")), active.arr.map((m, i) => {
      const prev = active.arr[i - 1];
      const showDay = !prev || _waDayLabel(prev.ts) !== _waDayLabel(m.ts);
      const out = m.direction === "out";
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: m.id || i }, showDay && /* @__PURE__ */ React.createElement("div", { style: { alignSelf: "center", margin: "12px 0 10px", fontSize: 11, color: "var(--text-subtle)", background: "rgba(255,255,255,0.05)", padding: "3px 10px", borderRadius: 99 } }, _waDayLabel(m.ts)), /* @__PURE__ */ React.createElement("div", { style: {
        alignSelf: out ? "flex-end" : "flex-start",
        maxWidth: "74%",
        background: out ? "rgba(158,154,229,0.22)" : "rgba(255,255,255,0.055)",
        border: "0.5px solid " + (out ? "rgba(158,154,229,0.28)" : "rgba(255,255,255,0.08)"),
        color: "var(--text)",
        padding: "8px 12px 6px",
        borderRadius: 14,
        borderBottomRightRadius: out ? 5 : 14,
        borderBottomLeftRadius: out ? 14 : 5,
        marginTop: 3,
        transformOrigin: out ? "bottom right" : "bottom left",
        animation: m.id && !seenRef.current.has(m.id) ? "msgIn .26s cubic-bezier(.22,1,.36,1)" : "none"
      } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, lineHeight: 1.45, whiteSpace: "pre-wrap", wordBreak: "break-word" } }, m.body), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "var(--text-subtle)", textAlign: "right", marginTop: 3, display: "flex", gap: 4, justifyContent: "flex-end", alignItems: "center" } }, _waTime(m.ts), out && m.status && /* @__PURE__ */ React.createElement("span", { style: { opacity: 0.8 } }, "\xB7 ", { sent: "enviado", delivered: "entregado", read: "le\xEDdo", failed: "fall\xF3" }[m.status] || m.status))));
    }), pending.filter((x) => x.waId === active.waId).map((x) => /* @__PURE__ */ React.createElement("div", { key: x.key, style: {
      alignSelf: "flex-end",
      maxWidth: "74%",
      background: "rgba(158,154,229,0.18)",
      border: "0.5px solid rgba(158,154,229,0.24)",
      color: "var(--text)",
      padding: "8px 12px 6px",
      borderRadius: 14,
      borderBottomRightRadius: 5,
      marginTop: 3,
      opacity: 0.75,
      transformOrigin: "bottom right",
      animation: "msgIn .26s cubic-bezier(.22,1,.36,1)"
    } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, lineHeight: 1.45, whiteSpace: "pre-wrap", wordBreak: "break-word" } }, x.body), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "var(--text-subtle)", textAlign: "right", marginTop: 3 } }, "enviando\u2026")))), outside24h && /* @__PURE__ */ React.createElement("div", { style: { margin: "0 18px", padding: "7px 12px", background: "rgba(226,180,92,0.1)", border: "0.5px solid rgba(226,180,92,0.3)", borderRadius: 10, color: "var(--amber)", fontSize: 11.5, lineHeight: 1.4 } }, "Fuera de la ventana de 24h. WhatsApp puede bloquear mensajes libres; quiz\xE1 necesites una plantilla aprobada."), /* @__PURE__ */ React.createElement("div", { style: { padding: "12px 18px 16px", display: "flex", alignItems: "flex-end", gap: 10 } }, /* @__PURE__ */ React.createElement(
      "textarea",
      {
        value: text,
        onChange: (e) => setText(e.target.value),
        rows: 1,
        onKeyDown: (e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
          }
        },
        placeholder: "Escribe un mensaje\u2026",
        style: {
          flex: 1,
          resize: "none",
          maxHeight: 120,
          minHeight: 42,
          padding: "11px 14px",
          borderRadius: 14,
          background: "rgba(255,255,255,0.05)",
          border: "0.5px solid rgba(255,255,255,0.1)",
          color: "var(--text)",
          fontSize: 14,
          fontFamily: "inherit",
          outline: "none",
          lineHeight: 1.4
        }
      }
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: send,
        disabled: sending || !text.trim(),
        title: "Enviar",
        style: {
          width: 42,
          height: 42,
          flexShrink: 0,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: text.trim() ? "var(--accent)" : "rgba(255,255,255,0.08)",
          color: text.trim() ? "#0a0a0a" : "var(--text-subtle)",
          border: "none",
          cursor: text.trim() ? "pointer" : "default",
          transition: "background .14s"
        }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "arrow-up", size: 17 })
    ))) : /* @__PURE__ */ React.createElement("div", { className: "wa-thread", style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-subtle)", gap: 14, padding: 24, textAlign: "center" } }, uni ? /* @__PURE__ */ React.createElement("span", { style: { width: 56, height: 56, borderRadius: 16, display: "grid", placeItems: "center", background: "rgba(158,154,229,0.14)", color: "var(--accent)" } }, /* @__PURE__ */ React.createElement(Icon, { name: "inbox", size: 26 })) : /* @__PURE__ */ React.createElement("span", { style: { width: 56, height: 56, borderRadius: 16, display: "grid", placeItems: "center", background: "rgba(37,211,102,0.12)" } }, /* @__PURE__ */ React.createElement(SiIcon, { name: "whatsapp", size: 26, style: { color: "#25D366" } })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, color: "var(--text-muted)" } }, "Elige una conversaci\xF3n"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, maxWidth: 360, lineHeight: 1.6 } }, uni ? "Aqu\xED llegan tus WhatsApp y tus correos." : /* @__PURE__ */ React.createElement(React.Fragment, null, "O empieza una nueva con el bot\xF3n ", /* @__PURE__ */ React.createElement("b", { style: { color: "var(--text)" } }, "+"), ". Los mensajes entrantes aparecen aqu\xED en tiempo real.")));
    const MailSetupC = window.MailSetup;
    return /* @__PURE__ */ React.createElement("div", { className: "wa-page", style: { display: "flex", flexDirection: "column", height: "100dvh", overflow: "hidden", maxWidth: 980, margin: "0 auto", width: "100%" } }, /* @__PURE__ */ React.createElement(WaConnectBanner, null), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, display: "flex", minHeight: 0 } }, isMobile ? active || activeMail ? Thread : List : /* @__PURE__ */ React.createElement(React.Fragment, null, List, Thread)), newOpen && /* @__PURE__ */ React.createElement(InboxModal, { title: "Nuevo chat", onClose: () => setNewOpen(false) }, /* @__PURE__ */ React.createElement(NewChatBody, { clients, onStart: startChat })), composeOpen && mail.creds && /* @__PURE__ */ React.createElement(InboxModal, { title: "Correo nuevo", width: 520, onClose: () => setComposeOpen(false) }, /* @__PURE__ */ React.createElement(ComposeMail, { creds: mail.creds, toast, onDone: () => setComposeOpen(false) })), mailSetup && /* @__PURE__ */ React.createElement(InboxModal, { onClose: () => setMailSetup(false), width: 480 }, MailSetupC ? /* @__PURE__ */ React.createElement(MailSetupC, { embedded: true, onConnect: (c) => {
      mail.setCreds(c);
      setMailSetup(false);
      setFilter("all");
    } }) : /* @__PURE__ */ React.createElement("div", { style: { color: "var(--text-muted)", fontSize: 13 } }, "No se pudo cargar el formulario de correo.")));
  };
  const AgencyWhatsApp = ({ navigate }) => /* @__PURE__ */ React.createElement(Inbox, { navigate, mode: "whatsapp" });
  const AgencyUnibox = ({ navigate }) => /* @__PURE__ */ React.createElement(Inbox, { navigate, mode: "unibox" });
  const NewChatBody = ({ clients, onStart }) => {
    const [num, setNum] = useState("");
    const withPhone = (clients || []).filter((c) => _waDigits(c.whatsapp).length >= 8);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 14 } }, /* @__PURE__ */ React.createElement(
      "input",
      {
        value: num,
        onChange: (e) => setNum(e.target.value),
        placeholder: "N\xFAmero con prefijo (ej. 34612345678)",
        onKeyDown: (e) => {
          if (e.key === "Enter" && _waDigits(num).length >= 8) onStart(num);
        },
        style: { flex: 1, height: 42, padding: "0 13px", borderRadius: 11, background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)", color: "var(--text)", fontSize: 14, fontFamily: "inherit", outline: "none" }
      }
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => _waDigits(num).length >= 8 && onStart(num),
        disabled: _waDigits(num).length < 8,
        style: { padding: "0 16px", borderRadius: 11, background: _waDigits(num).length >= 8 ? "var(--accent)" : "rgba(255,255,255,0.08)", color: _waDigits(num).length >= 8 ? "#0a0a0a" : "var(--text-subtle)", border: "none", cursor: _waDigits(num).length >= 8 ? "pointer" : "default", fontSize: 14, fontWeight: 500, fontFamily: "inherit" }
      },
      "Abrir"
    )), withPhone.length > 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-subtle)", margin: "4px 0 6px" } }, "Clientes con tel\xE9fono"), /* @__PURE__ */ React.createElement("div", { style: { overflowY: "auto", scrollbarWidth: "none", minHeight: 0 } }, withPhone.map((c) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key: c.id,
        onClick: () => onStart(c.whatsapp, c.company || c.name, c),
        style: { display: "flex", alignItems: "center", gap: 10, padding: "9px 8px", borderRadius: 10, cursor: "pointer" },
        onMouseEnter: (e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)",
        onMouseLeave: (e) => e.currentTarget.style.background = "transparent"
      },
      /* @__PURE__ */ React.createElement("span", { style: { width: 32, height: 32, borderRadius: 9, flexShrink: 0, display: "grid", placeItems: "center", background: "rgba(158,154,229,0.18)", color: "var(--accent)", fontSize: 13, fontWeight: 600, fontFamily: "var(--font-display)" } }, (c.company || c.name || "?").charAt(0).toUpperCase()),
      /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, c.company || c.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-subtle)" } }, "+", _waDigits(c.whatsapp)))
    )))));
  };
  window.PNInboxKit = {
    useMailInbox,
    mailApi: _mailApi,
    mailAddr: _mailAddr,
    mailName: _mailName,
    mailIso: _mailIso,
    waDigits: _waDigits,
    waMatch: _waMatch,
    NewChatBody,
    ComposeMail,
    waLaunch: _waLaunchES
  };
  window.AgencyWhatsApp = AgencyWhatsApp;
  window.AgencyUnibox = AgencyUnibox;
})();

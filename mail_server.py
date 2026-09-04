#!/usr/bin/env python3
"""
141'STUDIO — servidor combinado
  • Sirve archivos estáticos
  • Proxy IMAP/SMTP en /api/mail/*

Uso:  python3 mail_server.py
URL:  http://localhost:8080
"""
import os, sys, json, re, imaplib, smtplib, email, traceback, secrets, random, threading
import urllib.request, urllib.parse, urllib.error, base64, time, datetime
from http.server import HTTPServer, SimpleHTTPRequestHandler
from email.header  import decode_header as _dh
from email.mime.text      import MIMEText
from email.mime.multipart import MIMEMultipart

# Clave secreta de Stripe: acepta STRIPE_SK o STRIPE_SECRET_KEY (el nombre
# estándar de Stripe). Si falta, los endpoints fallan con error claro.
STRIPE_SK = os.environ.get("STRIPE_SK", "") or os.environ.get("STRIPE_SECRET_KEY", "")

# Supabase — para validar los JWT que envía el frontend (la anon key es pública por diseño)
SB_URL  = os.environ.get("SUPABASE_URL", "https://ofnkazimemuiwovhxepq.supabase.co")
SB_ANON = os.environ.get("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mbmthemltZW11aXdvdmh4ZXBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NTU5OTcsImV4cCI6MjA5NDUzMTk5N30.NVRoZb_Ie2ZgPELFkS7CxNWrLGZcgdOdWGEEkT_CNqo")

# Resend — correo transaccional (avisos a clientes). La API key vive SOLO aquí,
# en el servidor; nunca se expone al navegador. Si falta, el envío se omite sin
# romper nada (el aviso in-app sigue funcionando).
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
RESEND_FROM    = os.environ.get("RESEND_FROM", "141'DIGITAL | Portal de Cliente <no-reply@141agency.com>")
PORTAL_URL     = os.environ.get("PORTAL_URL", "https://app.141agency.com")
# A dónde llegan los avisos de actividad de clientes (tú/la agencia). El cliente
# NO decide el destinatario: siempre se envía aquí (evita relay de spam).
AGENCY_NOTIFY_EMAIL = os.environ.get("AGENCY_NOTIFY_EMAIL", "nil@141agency.com")

# Service role de Supabase (SECRETA, solo servidor). Necesaria para los
# recordatorios automáticos (leer/actualizar tareas de todos los clientes).
SB_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
# Recordatorios: días para el 1er aviso y entre repeticiones, máx. de avisos y
# cada cuántas horas revisa el servidor.
REMINDER_DAYS       = int(os.environ.get("REMINDER_DAYS", "3"))
REMINDER_MAX        = int(os.environ.get("REMINDER_MAX", "3"))
REMINDER_CHECK_HOURS= int(os.environ.get("REMINDER_CHECK_HOURS", "6"))

# Orígenes permitidos para CORS (coma-separados). Mismo origen no necesita CORS.
ALLOWED_ORIGINS = [o.strip() for o in os.environ.get(
    "ALLOWED_ORIGINS", "https://app.141agency.com,http://localhost:8080"
).split(",") if o.strip()]

PORT = int(os.environ.get("PORT", 8080))
BASE = os.path.dirname(os.path.abspath(__file__))
# Persistencia: los datos (campañas, etc.) se guardan en STORE_DIR. En Railway
# se debe montar un Volume; su ruta llega en RAILWAY_VOLUME_MOUNT_PATH, así que
# la usamos automáticamente si no se define STORE_DIR a mano. Si no hay volumen,
# cae en BASE (disco efímero) y los datos NO sobreviven a un redeploy.
_STORE_DIR = (os.environ.get("STORE_DIR")
              or os.environ.get("RAILWAY_VOLUME_MOUNT_PATH")
              or BASE)
try:
    os.makedirs(_STORE_DIR, exist_ok=True)
except OSError:
    _STORE_DIR = BASE
    os.makedirs(_STORE_DIR, exist_ok=True)
_STORE_EPHEMERAL = os.path.abspath(_STORE_DIR) == os.path.abspath(BASE)
if _STORE_EPHEMERAL:
    print("  ⚠️  STORE_DIR no persistente: monta un Volume en Railway "
          "(los datos se perderán en el próximo deploy).")
else:
    print(f"  💾 STORE_DIR persistente: {_STORE_DIR}")

# ── utilidades ─────────────────────────────────────────────────────────────

def _dstr(s):
    if not s: return ""
    parts = _dh(str(s))
    out = []
    for chunk, enc in parts:
        if isinstance(chunk, bytes):
            out.append(chunk.decode(enc or "utf-8", errors="replace"))
        else:
            out.append(chunk)
    return "".join(out)

def _get_imap(c):
    port = int(c.get("imap_port", 993))
    if port == 993:
        conn = imaplib.IMAP4_SSL(c["imap_host"], port)
    else:
        conn = imaplib.IMAP4(c["imap_host"], port)
        conn.starttls()
    conn.login(c["email"], c["password"])
    return conn

def _get_smtp(c):
    port = int(c.get("smtp_port", 587))
    if port == 465:
        smtp = smtplib.SMTP_SSL(c["smtp_host"], port)
    else:
        smtp = smtplib.SMTP(c["smtp_host"], port)
        smtp.ehlo(); smtp.starttls(); smtp.ehlo()
    smtp.login(c["email"], c["password"])
    return smtp

def _sel(imap, folder):
    """Selecciona carpeta. Prueba siempre con comillas primero (necesario para [Gmail]/*)."""
    for mbx in [f'"{folder}"', folder]:
        try:
            typ, dat = imap.select(mbx)
            print(f"  SELECT {mbx!r} → {typ} {dat}", flush=True)
            if typ == "OK": return True
        except Exception as e:
            print(f"  SELECT {mbx!r} → EXCEPTION: {e}", flush=True)
            continue
    return False

def _body(msg):
    html = text = None
    if msg.is_multipart():
        for part in msg.walk():
            ct  = part.get_content_type()
            cd  = str(part.get("Content-Disposition", ""))
            if "attachment" in cd: continue
            raw = part.get_payload(decode=True)
            if raw is None: continue
            cs  = part.get_content_charset() or "utf-8"
            dec = raw.decode(cs, errors="replace")
            if ct == "text/html"  and html is None: html = dec
            if ct == "text/plain" and text is None: text = dec
    else:
        raw = msg.get_payload(decode=True)
        if raw:
            cs  = msg.get_content_charset() or "utf-8"
            dec = raw.decode(cs, errors="replace")
            if msg.get_content_type() == "text/html": html = dec
            else:                                      text = dec
    return html, text

def _parse_fetch(data):
    msgs = []
    for item in data:
        if not isinstance(item, tuple) or len(item) < 2: continue
        try:
            info   = item[0].decode("utf-8", errors="replace") if isinstance(item[0], bytes) else str(item[0])
            hbytes = item[1]
            uid_m  = re.search(r'\bUID\s+(\d+)', info, re.I)
            seq_m  = re.match(r'^(\d+)', info.strip())
            uid    = uid_m.group(1) if uid_m else (seq_m.group(1) if seq_m else "?")
            flags_m   = re.search(r'FLAGS\s*\(([^)]*)\)', info, re.I)
            flags_str = flags_m.group(1) if flags_m else ""
            hdr = email.message_from_bytes(hbytes)
            msgs.append({
                "uid":     uid,
                "from":    _dstr(hdr.get("From",    "")),
                "to":      _dstr(hdr.get("To",      "")),
                "subject": _dstr(hdr.get("Subject", "(sin asunto)")),
                "date":    hdr.get("Date", ""),
                "read":    "\\Seen"    in flags_str,
                "flagged": "\\Flagged" in flags_str,
            })
        except Exception: continue
    return msgs

# ── auth: validación del JWT de Supabase ──────────────────────────────────
import hashlib as _hashlib
_token_cache = {}  # sha256(token) -> (caduca_en, user)

def _verify_supabase_token(token):
    """Valida un access token contra Supabase y devuelve el usuario (o None)."""
    if not token:
        return None
    key = _hashlib.sha256(token.encode()).hexdigest()
    hit = _token_cache.get(key)
    if hit and hit[0] > time.time():
        return hit[1]
    req = urllib.request.Request(SB_URL + "/auth/v1/user")
    req.add_header("Authorization", "Bearer " + token)
    req.add_header("apikey", SB_ANON)
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            user = json.loads(r.read().decode())
    except Exception:
        return None
    if not isinstance(user, dict) or not user.get("id"):
        return None
    if len(_token_cache) > 500:
        _token_cache.clear()
    _token_cache[key] = (time.time() + 300, user)
    return user

# ── endpoints ──────────────────────────────────────────────────────────────

def api_connect(body):
    c = body
    imap = _get_imap(c); imap.logout()
    smtp = _get_smtp(c); smtp.quit()
    return {"ok": True, "email": c["email"]}

def api_folders(body):
    c = body.get("creds", {})
    imap = _get_imap(c)
    try:
        _, raw = imap.list()
        folders = []
        for item in (raw or []):
            if not item: continue
            dec = item.decode("utf-8", errors="replace") if isinstance(item, bytes) else item
            # Extraer atributos:  (\HasNoChildren \Sent) → ["\\Sent", ...]
            attrs_m = re.match(r'\(([^)]*)\)', dec)
            attrs   = attrs_m.group(1).split() if attrs_m else []
            # Extraer nombre de carpeta
            m = re.search(r'\)\s+"[^"]+"\s+"([^"]+)"', dec)
            if not m:
                m = re.search(r'\)\s+"[^"]+"\s+(\S+)', dec)
            if m:
                name = m.group(1)
                folders.append({"name": name, "attrs": attrs})
        print(f"  Folders: {[f['name'] for f in folders]}", flush=True)
        return {"ok": True, "folders": folders}
    finally:
        try: imap.logout()
        except: pass

def api_messages(body):
    c      = body.get("creds", {})
    folder = body.get("folder", "INBOX")
    page   = int(body.get("page", 1))
    per    = 25

    imap = _get_imap(c)
    try:
        if not _sel(imap, folder):
            return {"ok": False, "error": f"No se puede abrir '{folder}'"}

        typ, data = imap.uid("SEARCH", None, "ALL")
        uids  = list(reversed(data[0].split())) if data[0] else []
        total = len(uids)

        page_uids = uids[(page-1)*per : page*per]
        msgs = []
        if page_uids:
            uid_set    = ",".join(u.decode() for u in page_uids)
            typ, fdata = imap.uid(
                "FETCH", uid_set,
                "(UID FLAGS BODY.PEEK[HEADER.FIELDS (FROM TO SUBJECT DATE)])"
            )
            msgs = _parse_fetch(fdata)
            msgs.sort(key=lambda m: int(m["uid"]) if str(m["uid"]).isdigit() else 0, reverse=True)

        return {"ok": True, "messages": msgs, "total": total}
    finally:
        try: imap.logout()
        except: pass

def api_message(body):
    c      = body.get("creds", {})
    uid    = str(body.get("uid", ""))
    folder = body.get("folder", "INBOX")

    imap = _get_imap(c)
    try:
        _sel(imap, folder)
        imap.uid("STORE", uid, "+FLAGS", "\\Seen")
        typ, data = imap.uid("FETCH", uid, "(RFC822)")
        if not data or data[0] is None:
            return {"ok": False, "error": "Mensaje no encontrado"}
        msg = email.message_from_bytes(data[0][1])
        html, text = _body(msg)
        return {
            "ok": True, "uid": uid,
            "from":    _dstr(msg.get("From",    "")),
            "to":      _dstr(msg.get("To",      "")),
            "cc":      _dstr(msg.get("Cc",      "")),
            "subject": _dstr(msg.get("Subject", "(sin asunto)")),
            "date":    msg.get("Date", ""),
            "html": html, "text": text,
        }
    finally:
        try: imap.logout()
        except: pass

def api_send(body):
    c       = body.get("creds", {})
    to      = body.get("to",      "")
    subject = body.get("subject", "")
    content = body.get("body",    "")
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = c["email"]
    msg["To"]      = to
    msg.attach(MIMEText(content, "plain", "utf-8"))
    smtp = _get_smtp(c)
    try:
        smtp.sendmail(c["email"], [to], msg.as_string())
        return {"ok": True}
    finally:
        try: smtp.quit()
        except: pass

# Contenido por tipo de aviso: encabezado, asunto, texto guía, botón y sección
# del portal a la que enlaza el botón (?goto=…).
_NOTIF_META = {
    "task":       {"subject": "Nueva tarea en tu portal", "subj_p": "tienes una nueva tarea", "pre": "Nueva tarea pendiente",
                   "lead": "Tienes una nueva tarea pendiente. Márcala como hecha cuando la completes.",
                   "cta": "Ver mis tareas", "route": "client-dashboard"},
    "project":    {"subject": "Novedades en tu proyecto", "subj_p": "novedades en tu proyecto", "pre": "Novedad en tu proyecto",
                   "lead": "Hemos actualizado el estado de tu proyecto.",
                   "cta": "Ver el estado", "route": "client-status"},
    "credential": {"subject": "Accesos pendientes en tu portal", "subj_p": "tienes accesos pendientes", "pre": "Accesos pendientes",
                   "lead": "Necesitamos que completes unos accesos para poder trabajar.",
                   "cta": "Ir a credenciales", "route": "client-credentials"},
    "document":   {"subject": "Novedad en tu documentación", "subj_p": "novedad en tu documentación", "pre": "Novedad en documentación",
                   "lead": "Hay una novedad en la documentación de tu proyecto.",
                   "cta": "Ir a documentación", "route": "client-docs"},
    "invoice":    {"subject": "Novedad en tu facturación", "subj_p": "novedad en tu facturación", "pre": "Novedad en facturación",
                   "lead": "Tienes una novedad en la facturación de tu proyecto.",
                   "cta": "Ver facturación", "route": "client-docs"},
}
_NOTIF_DEFAULT = {"subject": "Novedad en tu portal 141'DIGITAL", "subj_p": "tienes una novedad en tu portal", "pre": "Novedad en tu portal",
                  "lead": "", "cta": "Abrir mi portal", "route": "client-dashboard"}

def _notify_meta(kind):
    return _NOTIF_META.get((kind or "").strip(), _NOTIF_DEFAULT)

# Etiqueta del botón según la sección de destino del portal.
_CTA_FOR_ROUTE = {
    "client-docs":        "Ir a documentación",
    "client-credentials": "Ir a credenciales",
    "client-status":      "Ver el estado",
    "client-dashboard":   "Abrir mi portal",
}

def _notify_email_html(client_name, title, body_text, meta, cta_url):
    """Correo del aviso al cliente: fondo negro sin caja, tipografía Inter, directo."""
    safe = lambda s: (s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    first    = safe(client_name.split()[0]) if client_name and client_name.split() else ""
    logo     = f"{PORTAL_URL}/logo-141digital-white.png"
    accent   = "#9e9ae5"
    font     = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif"
    lead     = safe(meta.get("lead", ""))
    # Saludo + frase en una sola línea: "Hola Nil, tienes una nueva tarea…"
    if first and lead:
        intro = f"Hola {first}, {lead[0].lower() + lead[1:]}"
    elif first:
        intro = f"Hola {first}."
    else:
        intro = lead or "Hola,"
    lead_block = (
        f'<p style="margin:0 0 24px;color:#e4e4e7;font-size:15px;line-height:1.6;font-weight:400;font-family:{font}">'
        f'<span style="color:#f4f4f5">Hola {first},</span> {lead[0].lower() + lead[1:]}</p>'
        if first and lead else
        f'<p style="margin:0 0 24px;color:#e4e4e7;font-size:15px;line-height:1.6;font-weight:400;font-family:{font}">{intro}</p>'
    )
    item_block = (
        f'<div style="border-left:2px solid {accent};padding:2px 0 2px 16px;margin:0 0 30px">'
        f'<div style="color:#f4f4f5;font-size:18px;line-height:1.45;font-weight:400;font-family:{font}">{safe(body_text)}</div>'
        f'</div>'
    ) if body_text else ""
    # Vista previa (Gmail/iOS): una sola línea limpia + relleno oculto para que
    # NO arrastre el resto del cuerpo al snippet de la notificación.
    pre = safe(meta.get("pre", "Novedad en tu portal"))
    preheader = f"{pre}: {safe(body_text)}" if body_text else pre
    pad = "&#847;&zwnj;&nbsp;" * 60
    return f"""\
<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="color-scheme" content="dark"><style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');</style></head>
<body style="margin:0;background:#000000;padding:0;font-family:{font}">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;height:0;width:0;mso-hide:all">{preheader}{pad}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#000000">
    <tr><td align="center" style="padding:40px 22px 46px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px">
        <tr><td style="padding:0 0 34px">
          <img src="{logo}" alt="141'DIGITAL" height="18" style="height:18px;width:auto;display:block;border:0;outline:none;text-decoration:none">
        </td></tr>
        <tr><td>
          <h1 style="margin:0 0 22px;font-size:28px;line-height:1.2;color:#f4f4f5;font-weight:300;letter-spacing:-0.6px;font-family:{font}">{safe(title)}</h1>
          {lead_block}
          {item_block}
        </td></tr>
        <tr><td style="padding:0 0 40px">
          <a href="{cta_url}" style="display:inline-block;background:#f4f4f5;color:#0a0a0a;text-decoration:none;font-size:14px;font-weight:600;padding:13px 26px;border-radius:11px;font-family:{font}">{safe(meta['cta'])} &rarr;</a>
        </td></tr>
        <tr><td style="padding:22px 0 0;border-top:1px solid rgba(255,255,255,0.08)">
          <div style="font-size:12.5px;color:#8b8b93;line-height:1.6;font-weight:400;font-family:{font}">141'DIGITAL · <a href="{PORTAL_URL}" style="color:{accent};text-decoration:none">app.141agency.com</a></div>
          <div style="margin-top:8px;font-size:11.5px;color:#5c5c63;line-height:1.5;font-weight:400;font-family:{font}">Recibes este correo porque tienes un portal de cliente con 141'DIGITAL. Este buzón no admite respuestas.</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>"""

def _resend_send(to, subject, html):
    """Envía un correo por Resend. Devuelve {ok:...} y captura el error real."""
    if not RESEND_API_KEY:
        return {"ok": False, "skipped": "no_api_key"}
    if "@" not in (to or ""):
        return {"ok": False, "error": "destinatario no válido"}
    payload = json.dumps({
        "from": RESEND_FROM, "to": [to], "subject": subject, "html": html,
    }).encode("utf-8")
    req = urllib.request.Request("https://api.resend.com/emails", data=payload, method="POST")
    req.add_header("Authorization", f"Bearer {RESEND_API_KEY}")
    req.add_header("Content-Type", "application/json")
    # Cloudflare (delante de Resend) banea el User-Agent por defecto de urllib
    # (Python-urllib/…) devolviendo "error code: 1010". Con un UA normal pasa.
    req.add_header("User-Agent", "141studio-portal/1.0 (+https://app.141agency.com)")
    req.add_header("Accept", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            data = json.loads(r.read().decode())
            return {"ok": True, "id": data.get("id")}
    except urllib.error.HTTPError as e:
        raw = ""
        try: raw = e.read().decode()
        except Exception: pass
        msg = str(e)
        try:
            j = json.loads(raw)
            msg = j.get("message") or j.get("error") or raw or str(e)
        except Exception:
            if raw: msg = raw
        print(f"  [resend] {e.code} → {raw[:500]}")
        return {"ok": False, "error": msg, "status": e.code}
    except Exception as e:
        return {"ok": False, "error": str(e)}

def _digest_email_html(client_name, items):
    """Un solo correo con varios avisos (fondo negro, Inter, marca 141'DIGITAL)."""
    safe = lambda s: (s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    first  = safe(client_name.split()[0]) if client_name and client_name.split() else ""
    hello  = f"Hola {first}," if first else "Hola,"
    logo   = f"{PORTAL_URL}/logo-141digital-white.png"
    accent = "#9e9ae5"
    font   = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif"
    rows = ""
    for it in items:
        t = safe((it.get("title") or "").strip())
        b = safe((it.get("body") or "").strip())
        r = (it.get("route") or "").strip()
        link = ""
        if r:
            label = _CTA_FOR_ROUTE.get(r, "Abrir")
            link = (f'<div style="margin-top:8px"><a href="{PORTAL_URL}/?goto={r}" '
                    f'style="color:{accent};text-decoration:none;font-size:13px;font-weight:500;font-family:{font}">{label} &rarr;</a></div>')
        body_line = f'<div style="color:#a1a1aa;font-size:14px;line-height:1.5;margin-top:3px;font-family:{font}">{b}</div>' if b else ""
        rows += (f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 12px">'
                 f'<tr><td style="border-left:2px solid {accent};padding:2px 0 2px 16px">'
                 f'<div style="color:#f4f4f5;font-size:15.5px;font-weight:500;line-height:1.4;font-family:{font}">{t}</div>'
                 f'{body_line}{link}</td></tr></table>')
    n = len(items)
    preheader = f"Tienes {n} novedades en tu portal"
    pad = "&#847;&zwnj;&nbsp;" * 60
    return f"""\
<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="color-scheme" content="dark"><style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');</style></head>
<body style="margin:0;background:#000000;padding:0;font-family:{font}">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;height:0;width:0;mso-hide:all">{preheader}{pad}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#000000">
    <tr><td align="center" style="padding:40px 22px 46px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px">
        <tr><td style="padding:0 0 34px">
          <img src="{logo}" alt="141'DIGITAL" height="18" style="height:18px;width:auto;display:block;border:0;outline:none;text-decoration:none">
        </td></tr>
        <tr><td>
          <h1 style="margin:0 0 22px;font-size:28px;line-height:1.2;color:#f4f4f5;font-weight:300;letter-spacing:-0.6px;font-family:{font}">Tienes {n} novedades</h1>
          <p style="margin:0 0 24px;color:#e4e4e7;font-size:15px;line-height:1.6;font-weight:400;font-family:{font}"><span style="color:#f4f4f5">{hello}</span> esto es lo que necesitamos o hemos actualizado en tu portal:</p>
          {rows}
        </td></tr>
        <tr><td style="padding:14px 0 40px">
          <a href="{PORTAL_URL}" style="display:inline-block;background:#f4f4f5;color:#0a0a0a;text-decoration:none;font-size:14px;font-weight:600;padding:13px 26px;border-radius:11px;font-family:{font}">Abrir mi portal &rarr;</a>
        </td></tr>
        <tr><td style="padding:22px 0 0;border-top:1px solid rgba(255,255,255,0.08)">
          <div style="font-size:12.5px;color:#8b8b93;line-height:1.6;font-weight:400;font-family:{font}">141'DIGITAL · <a href="{PORTAL_URL}" style="color:{accent};text-decoration:none">app.141agency.com</a></div>
          <div style="margin-top:8px;font-size:11.5px;color:#5c5c63;line-height:1.5;font-weight:400;font-family:{font}">Recibes este correo porque tienes un portal de cliente con 141'DIGITAL. Este buzón no admite respuestas.</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>"""

def api_notify_client(body):
    """Envía por Resend el aviso al cliente. Protegido por _handle_api (solo
    usuarios de agencia autenticados). Si no hay API key, se omite en silencio.
    Si viene `digest` (lista), envía UN solo correo con todos los avisos."""
    to      = (body.get("to") or "").strip()
    cname   = (body.get("client_name") or "").strip()
    first   = cname.split()[0] if cname.split() else ""
    digest  = body.get("digest")
    if isinstance(digest, list) and digest:
        if len(digest) == 1:
            it = digest[0]
            body = {**body, "title": it.get("title", ""), "body": it.get("body", ""),
                    "kind": it.get("kind", ""), "route": it.get("route", "")}
            # cae al flujo normal de abajo (un solo aviso)
        else:
            n = len(digest)
            subject = f"{first}, tienes {n} novedades en tu portal" if first else f"Tienes {n} novedades en tu portal"
            html = _digest_email_html(cname, digest)
            return _resend_send(to, subject, html)
    title   = (body.get("title") or "").strip()
    text    = (body.get("body") or "").strip()
    kind    = (body.get("kind") or "").strip()
    route   = (body.get("route") or "").strip()
    meta    = _notify_meta(kind)
    first   = cname.split()[0] if cname.split() else ""
    # Aviso general (compositor del CRM): el asunto usa el título que escribió la agencia.
    if kind == "general" and title:
        subject = f"{first}, {title}" if first else title
    else:
        subject = f"{first}, {meta['subj_p']}" if first else (title or meta["subject"])
    # El destino del botón: ruta explícita si viene, si no la del tipo.
    target  = route or meta["route"]
    cta_url = f"{PORTAL_URL}/?goto={target}" if target else PORTAL_URL
    meta2   = dict(meta)
    if route:
        meta2["cta"] = _CTA_FOR_ROUTE.get(route, meta["cta"])
    html    = _notify_email_html(cname, title, text, meta2, cta_url)
    return _resend_send(to, subject, html)

def api_notify_agency(body):
    """Aviso del CLIENTE hacia la AGENCIA. Callable por cualquier usuario
    autenticado (incl. clientes). El destinatario NO lo decide el cliente: es
    siempre AGENCY_NOTIFY_EMAIL (evita que se use como relay de spam)."""
    to = (AGENCY_NOTIFY_EMAIL or "").strip()
    if not to or "@" not in to:
        return {"ok": False, "skipped": "no_agency_email"}
    title = (body.get("title") or "Novedad de un cliente").strip()
    text  = (body.get("body") or "").strip()
    cname = (body.get("client_name") or "Un cliente").strip()
    ameta = {"lead": f"{cname} ha realizado una acción en su portal.",
             "cta": "Abrir el CRM", "route": ""}
    subject = f"{cname} · {title}"
    html = _notify_email_html("", title, text, ameta, PORTAL_URL)
    return _resend_send(to, subject, html)

# ── Recordatorios automáticos de tareas pendientes ──────────────────────────
def _sb_service(method, path, body=None):
    """Petición a la REST de Supabase con la service role (bypassa RLS)."""
    req = urllib.request.Request(SB_URL + "/rest/v1/" + path, method=method,
                                 data=(json.dumps(body).encode() if body is not None else None))
    req.add_header("apikey", SB_SERVICE_KEY)
    req.add_header("Authorization", "Bearer " + SB_SERVICE_KEY)
    req.add_header("Content-Type", "application/json")
    req.add_header("Prefer", "return=representation")
    with urllib.request.urlopen(req, timeout=20) as r:
        raw = r.read().decode()
        return json.loads(raw) if raw else []

def _reminder_email_html(client_name, tasks):
    safe = lambda s: (s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    first = safe(client_name.split()[0]) if client_name and client_name.split() else ""
    hello = f"Hola {first}," if first else "Hola,"
    logo  = f"{PORTAL_URL}/logo-141digital-white.png"
    accent= "#9e9ae5"
    font  = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif"
    rows = ""
    for t in tasks:
        rows += (f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 10px">'
                 f'<tr><td style="border-left:2px solid {accent};padding:2px 0 2px 16px;color:#f4f4f5;font-size:15.5px;font-weight:500;line-height:1.4;font-family:{font}">{safe(t)}</td></tr></table>')
    n = len(tasks)
    pad = "&#847;&zwnj;&nbsp;" * 60
    return f"""\
<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="color-scheme" content="dark"><style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');</style></head>
<body style="margin:0;background:#000000;padding:0;font-family:{font}">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;height:0;width:0;mso-hide:all">Tienes {n} tarea(s) pendiente(s) en tu portal{pad}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#000000">
    <tr><td align="center" style="padding:40px 22px 46px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px">
        <tr><td style="padding:0 0 34px"><img src="{logo}" alt="141'DIGITAL" height="18" style="height:18px;width:auto;display:block;border:0"></td></tr>
        <tr><td>
          <h1 style="margin:0 0 22px;font-size:28px;line-height:1.2;color:#f4f4f5;font-weight:300;letter-spacing:-0.6px;font-family:{font}">Tienes cosas pendientes</h1>
          <p style="margin:0 0 24px;color:#e4e4e7;font-size:15px;line-height:1.6;font-family:{font}"><span style="color:#f4f4f5">{hello}</span> aún tienes {'esta tarea' if n==1 else 'estas tareas'} sin completar en tu portal:</p>
          {rows}
        </td></tr>
        <tr><td style="padding:14px 0 40px">
          <a href="{PORTAL_URL}/?goto=client-dashboard" style="display:inline-block;background:#f4f4f5;color:#0a0a0a;text-decoration:none;font-size:14px;font-weight:600;padding:13px 26px;border-radius:11px;font-family:{font}">Completar ahora &rarr;</a>
        </td></tr>
        <tr><td style="padding:22px 0 0;border-top:1px solid rgba(255,255,255,0.08)">
          <div style="font-size:12.5px;color:#8b8b93;font-family:{font}">141'DIGITAL · <a href="{PORTAL_URL}" style="color:{accent};text-decoration:none">app.141agency.com</a></div>
          <div style="margin-top:8px;font-size:11.5px;color:#5c5c63;line-height:1.5;font-family:{font}">Recibes este correo porque tienes tareas pendientes en tu portal de cliente. Este buzón no admite respuestas.</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>"""

def _run_reminders():
    """Busca tareas pendientes antiguas y manda un recordatorio por cliente."""
    if not (SB_SERVICE_KEY and RESEND_API_KEY):
        return
    try:
        now = datetime.datetime.now(datetime.timezone.utc)
        cutoff = (now - datetime.timedelta(days=REMINDER_DAYS)).isoformat()
        q = ("client_tasks?select=id,client_id,title,reminder_count"
             f"&done=eq.false&reminder_count=lt.{REMINDER_MAX}"
             f"&created_at=lt.{urllib.parse.quote(cutoff)}"
             f"&or=(reminded_at.is.null,reminded_at.lt.{urllib.parse.quote(cutoff)})")
        tasks = _sb_service("GET", q)
        if not tasks:
            return
        by_client = {}
        for t in tasks:
            by_client.setdefault(t["client_id"], []).append(t)
        ids = list(by_client.keys())
        id_list = ",".join('"' + str(i) + '"' for i in ids)
        clients = _sb_service("GET", f"clients?select=id,name,email&id=in.({id_list})")
        cmap = {c["id"]: c for c in clients}
        stamp = now.isoformat()
        for cid, ts in by_client.items():
            c = cmap.get(cid)
            if not c or not c.get("email") or "@" not in c["email"]:
                continue
            titles = [t.get("title") or "Tarea" for t in ts]
            res = _resend_send(c["email"], f"Tienes {len(titles)} cosa(s) pendiente(s) en tu portal",
                               _reminder_email_html(c.get("name") or "", titles))
            if res.get("ok"):
                for t in ts:
                    _sb_service("PATCH", f"client_tasks?id=eq.{t['id']}",
                                {"reminded_at": stamp, "reminder_count": (t.get("reminder_count") or 0) + 1})
                print(f"  [reminders] enviado a {c['email']} ({len(titles)} tareas)")
    except Exception as e:
        print(f"  [reminders] error: {e}")

def _reminder_loop():
    import time as _t
    _t.sleep(60)  # esperar a que el server arranque del todo
    while True:
        _run_reminders()
        _t.sleep(max(1, REMINDER_CHECK_HOURS) * 3600)

def api_action(body):
    c      = body.get("creds", {})
    uid    = str(body.get("uid",    ""))
    action = body.get("action",     "")
    folder = body.get("folder",     "INBOX")
    imap = _get_imap(c)
    try:
        _sel(imap, folder)
        if action == "delete":
            imap.uid("STORE", uid, "+FLAGS", "\\Deleted")
            imap.expunge()
        elif action == "mark_read":
            imap.uid("STORE", uid, "+FLAGS", "\\Seen")
        elif action == "mark_unread":
            imap.uid("STORE", uid, "-FLAGS", "\\Seen")
        elif action == "flag":
            imap.uid("STORE", uid, "+FLAGS", "\\Flagged")
        elif action == "unflag":
            imap.uid("STORE", uid, "-FLAGS", "\\Flagged")
        return {"ok": True}
    finally:
        try: imap.logout()
        except: pass

# ── Stripe helpers ─────────────────────────────────────────────────────────

def _stripe_auth():
    if not STRIPE_SK:
        raise Exception("Stripe no configurado (falta la variable STRIPE_SK)")
    return base64.b64encode(f"{STRIPE_SK}:".encode()).decode()

def _stripe_err(body, fallback):
    """Convierte errores de Stripe en mensajes claros (los de permisos, en español)."""
    msg = body.get("error", {}).get("message", fallback)
    if "Permission denied" in msg or "does not have the required permissions" in msg:
        return ("La clave de Stripe configurada es restringida y no tiene permisos "
                "suficientes. En Stripe → Desarrolladores → Claves API usa la clave "
                "secreta estándar (sk_live_...), o edita la clave restringida y activa "
                "escritura en Products, Prices, Payment Links, Customers e Invoices.")
    return msg

def _stripe(path, params=None):
    url = "https://api.stripe.com/v1/" + path
    if params:
        url += "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url)
    req.add_header("Authorization", f"Basic {_stripe_auth()}")
    req.add_header("Stripe-Version", "2023-10-16")
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        body = json.loads(e.read().decode())
        raise Exception(_stripe_err(body, str(e)))

def _stripe_post(path, data):
    url = "https://api.stripe.com/v1/" + path
    payload = urllib.parse.urlencode(data).encode()
    req = urllib.request.Request(url, data=payload)
    req.add_header("Authorization", f"Basic {_stripe_auth()}")
    req.add_header("Stripe-Version", "2023-10-16")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        body = json.loads(e.read().decode())
        raise Exception(_stripe_err(body, str(e)))

_TAX_RATE_CACHE = {}

def _ensure_tax_rate(pct, name):
    """Devuelve el id de un tipo impositivo exclusivo con ese % (lo crea si no
    existe). pct puede ser negativo: retenciones tipo IRPF en facturas."""
    key = f"{name}:{pct}"
    if key in _TAX_RATE_CACHE:
        return _TAX_RATE_CACHE[key]
    rates = _stripe("tax_rates", {"active": "true", "limit": "100"})
    for r in rates.get("data", []):
        try:
            if abs(float(r.get("percentage", 0)) - pct) < 0.001 and not r.get("inclusive"):
                _TAX_RATE_CACHE[key] = r["id"]
                return r["id"]
        except Exception:
            continue
    r = _stripe_post("tax_rates", {
        "display_name": name,
        "percentage": str(pct),
        "inclusive": "false",
        "country": "ES",
    })
    _TAX_RATE_CACHE[key] = r["id"]
    return r["id"]

def api_stripe_balance(_body):
    data = _stripe("balance")
    avail   = sum(f["amount"] for f in data.get("available", []) if f["currency"] == "eur")
    pending = sum(f["amount"] for f in data.get("pending",   []) if f["currency"] == "eur")
    return {"ok": True, "available": avail, "pending": pending}

def api_stripe_invoices(body):
    limit  = int(body.get("limit", 50))
    params = {"limit": limit, "expand[]": "data.customer"}
    raw    = _stripe("invoices", params)
    items  = []
    for inv in raw.get("data", []):
        cust = inv.get("customer") or {}
        cust_name = (cust.get("name") or cust.get("email") or inv.get("customer_email") or "—") if isinstance(cust, dict) else str(cust)
        items.append({
            "id":          inv.get("number") or inv.get("id"),
            "stripe_id":   inv.get("id"),
            "customer":    cust_name,
            "amount":      inv.get("amount_due", 0),
            "amount_paid": inv.get("amount_paid", 0),
            "currency":    inv.get("currency", "eur"),
            "status":      inv.get("status"),         # draft/open/paid/void/uncollectible
            "created":     inv.get("created"),
            "due_date":    inv.get("due_date"),
            "hosted_url":  inv.get("hosted_invoice_url"),
            "pdf_url":     inv.get("invoice_pdf"),
            "description": inv.get("description") or "",
        })
    return {"ok": True, "invoices": items, "has_more": raw.get("has_more", False)}

def api_stripe_charges(body):
    limit  = int(body.get("limit", 10))
    raw    = _stripe("charges", {"limit": limit})
    items  = []
    for ch in raw.get("data", []):
        items.append({
            "id":          ch.get("id"),
            "amount":      ch.get("amount", 0),
            "currency":    ch.get("currency", "eur"),
            "status":      ch.get("status"),
            "description": ch.get("description") or "",
            "customer":    ch.get("billing_details", {}).get("name") or ch.get("receipt_email") or "—",
            "created":     ch.get("created"),
        })
    return {"ok": True, "charges": items}

_MONTHS = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"]

def _fmt_ts(ts, fmt):
    d = datetime.datetime.utcfromtimestamp(ts)
    if fmt == "day":   return f"{d.day} {_MONTHS[d.month-1]}"
    if fmt == "week":  return f"{d.day} {_MONTHS[d.month-1]}"
    if fmt == "month": return f"{_MONTHS[d.month-1]} {str(d.year)[2:]}"
    return str(d.date())

def api_stripe_revenue(body):
    period = body.get("period", "30d")
    now    = int(time.time())
    if   period == "7d":  start, bucket_s, n, fmt = now - 7*86400,   86400,     7,  "day"
    elif period == "30d": start, bucket_s, n, fmt = now - 30*86400,  86400,    30,  "day"
    elif period == "3m":  start, bucket_s, n, fmt = now - 91*86400,  7*86400,  13,  "week"
    else:                 start, bucket_s, n, fmt = now - 365*86400, 30*86400, 12,  "month"

    buckets = [{"ts": start + i*bucket_s, "label": _fmt_ts(start + i*bucket_s, fmt), "amount": 0, "count": 0}
               for i in range(n)]

    params = {"limit": "100", "created[gte]": str(start)}
    raw    = _stripe("charges", params)
    for ch in raw.get("data", []):
        if ch.get("status") != "succeeded": continue
        idx = min(int((ch["created"] - start) / bucket_s), n - 1)
        if 0 <= idx < n:
            buckets[idx]["amount"] += ch.get("amount", 0)
            buckets[idx]["count"]  += 1

    total = sum(b["amount"] for b in buckets)
    return {"ok": True, "buckets": buckets, "total": total}

def api_stripe_create_payment_link(body):
    """Crea un enlace de pago de Stripe (producto + precio + payment link).
    Con interval=month|year el precio es recurrente: el cliente que pague por
    el enlace queda suscrito y Stripe le cobra automáticamente cada ciclo."""
    name       = (body.get("name") or "Servicio").strip()[:200]
    amount_eur = float(body.get("amount", 0))
    amount_cts = int(round(amount_eur * 100))
    currency   = (body.get("currency") or "eur").lower()
    interval   = (body.get("interval") or "").lower()
    if amount_cts <= 0:
        return {"ok": False, "error": "Importe no válido"}
    # El importe llega como base imponible: en enlaces el IVA va incluido en el
    # precio (los payment links no admiten tipos impositivos manuales).
    vat_pct = float(body.get("vat", 0) or 0)
    if vat_pct > 0:
        amount_cts = int(round(amount_cts * (1 + vat_pct / 100)))
    price_data = {
        "unit_amount": str(amount_cts),
        "currency": currency,
        "product_data[name]": name,
    }
    if interval in ("month", "year"):
        price_data["recurring[interval]"] = interval
    price = _stripe_post("prices", price_data)
    link_data = {
        "line_items[0][price]": price["id"],
        "line_items[0][quantity]": "1",
    }
    trial_days = int(body.get("trial_days", 0) or 0)
    if interval in ("month", "year") and trial_days > 0:
        link_data["subscription_data[trial_period_days]"] = str(trial_days)
    link = _stripe_post("payment_links", link_data)
    return {"ok": True, "url": link.get("url"), "id": link.get("id")}

def api_stripe_create_subscription(body):
    """Crea una suscripción real sobre un cliente, con facturas por email
    (collection_method=send_invoice): Stripe le manda la factura cada ciclo
    y el cliente la paga; no hace falta tarjeta guardada."""
    email_addr = body.get("email", "").strip()
    name       = body.get("name",  "").strip()
    concept    = (body.get("concept") or "Suscripción").strip()[:200]
    amount_eur = float(body.get("amount", 0))
    amount_cts = int(round(amount_eur * 100))
    currency   = (body.get("currency") or "eur").lower()
    interval   = (body.get("interval") or "month").lower()
    trial_days = int(body.get("trial_days", 0) or 0)
    due_days   = int(body.get("due_days", 15) or 15)
    if amount_cts <= 0:
        return {"ok": False, "error": "Importe no válido"}
    if not email_addr:
        return {"ok": False, "error": "Falta el email del cliente"}
    if interval not in ("month", "year"):
        interval = "month"

    # Cliente: buscar o crear
    custs = _stripe("customers", {"email": email_addr, "limit": "1"})
    if custs.get("data"):
        cid = custs["data"][0]["id"]
    else:
        cid = _stripe_post("customers", {"email": email_addr, "name": name})["id"]

    price = _stripe_post("prices", {
        "unit_amount": str(amount_cts),
        "currency": currency,
        "recurring[interval]": interval,
        "product_data[name]": concept,
    })
    sub_data = {
        "customer":           cid,
        "items[0][price]":    price["id"],
        "collection_method":  "send_invoice",
        "days_until_due":     str(due_days),
        "description":        concept,
    }
    if trial_days > 0:
        sub_data["trial_period_days"] = str(trial_days)
    # Base imponible + IVA en cada factura del ciclo. El IRPF no se aplica en
    # suscripciones: Stripe no admite líneas negativas recurrentes.
    vat_pct = float(body.get("vat", 0) or 0)
    if vat_pct > 0:
        sub_data["default_tax_rates[0]"] = _ensure_tax_rate(vat_pct, "IVA")
    sub = _stripe_post("subscriptions", sub_data)

    # Primera factura: finalizar y enviar ya (sin prueba, se genera al crear)
    hosted = None
    inv_id = sub.get("latest_invoice")
    if inv_id:
        try:
            _stripe_post(f"invoices/{inv_id}/finalize", {})
        except Exception:
            pass
        try:
            inv = _stripe_post(f"invoices/{inv_id}/send", {})
        except Exception:
            try: inv = _stripe(f"invoices/{inv_id}")
            except Exception: inv = {}
        hosted = inv.get("hosted_invoice_url")

    return {"ok": True, "id": sub.get("id"), "status": sub.get("status"), "hosted_url": hosted}

def api_stripe_create_invoice(body):
    email_addr  = body.get("email", "").strip()
    name        = body.get("name",  "").strip()
    amount_eur  = float(body.get("amount", 0))
    amount_cts  = int(round(amount_eur * 100))
    currency    = body.get("currency", "eur").lower()
    description = body.get("description", "Servicio")
    due_days    = int(body.get("due_days", 30))
    send_now    = bool(body.get("send_now", False))

    # Find or create customer
    custs = _stripe("customers", {"email": email_addr, "limit": "1"})
    if custs.get("data"):
        cid = custs["data"][0]["id"]
    else:
        c   = _stripe_post("customers", {"email": email_addr, "name": name})
        cid = c["id"]

    # 1. Create draft invoice first (auto_advance=false keeps it as draft)
    inv = _stripe_post("invoices", {
        "customer":           cid,
        "collection_method":  "send_invoice",
        "days_until_due":     str(due_days),
        "description":        description,
        "auto_advance":       "false",
    })
    inv_id = inv["id"]

    # 2. Add line item directly to this invoice (avoids any pending-item race)
    #    El importe es la base imponible. El IVA va como tipo impositivo; el
    #    IRPF como línea negativa (Stripe no admite porcentajes negativos).
    item_data = {
        "customer":    cid,
        "invoice":     inv_id,
        "amount":      str(amount_cts),
        "currency":    currency,
        "description": description,
    }
    vat_pct  = float(body.get("vat", 0) or 0)
    irpf_pct = float(body.get("irpf", 0) or 0)
    if vat_pct > 0:
        item_data["tax_rates[0]"] = _ensure_tax_rate(vat_pct, "IVA")
    _stripe_post("invoiceitems", item_data)
    if irpf_pct > 0:
        ret_cts = int(round(amount_cts * irpf_pct / 100))
        _stripe_post("invoiceitems", {
            "customer":    cid,
            "invoice":     inv_id,
            "amount":      str(-ret_cts),
            "currency":    currency,
            "description": f"Retención IRPF {irpf_pct:g}%",
        })

    # 3. Finalize
    inv = _stripe_post(f"invoices/{inv_id}/finalize", {})

    if send_now:
        inv = _stripe_post(f"invoices/{inv_id}/send", {})

    return {
        "ok":         True,
        "invoice_id": inv_id,
        "number":     inv.get("number"),
        "hosted_url": inv.get("hosted_invoice_url"),
        "pdf_url":    inv.get("invoice_pdf"),
        "status":     inv.get("status"),
    }

# ── Campañas: leads importados desde Claude Cowork ─────────────────────────
# Un proceso externo (la programación diaria de Claude Cowork) hace POST a
# /api/campaigns/import con una clave API estática (env LEADS_API_KEY) y los
# leads del día (nombre, empresa, email, auditoría, borrador del mensaje…).
# El SaaS los lee con el JWT del usuario en /api/campaigns/data y actualiza
# el estado de cada lead en /api/campaigns/update_lead.

LEADS_API_KEY  = os.environ.get("LEADS_API_KEY", "")
_CAMPAIGNS_FILE = os.path.join(_STORE_DIR, "campaign_leads.json")

LEAD_STATUSES = {"new", "scheduled", "contacted", "replied", "won", "discarded"}

def _campaigns_load():
    try:
        with open(_CAMPAIGNS_FILE, encoding="utf-8") as f:
            data = json.load(f)
        if isinstance(data, dict) and isinstance(data.get("campaigns"), list):
            return data
    except FileNotFoundError:
        pass
    except Exception:
        traceback.print_exc()
    return {"campaigns": []}

def _campaigns_save(data):
    tmp = _CAMPAIGNS_FILE + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    os.replace(tmp, _CAMPAIGNS_FILE)

# ── Datos por usuario (rutinas, finanzas…) ──────────────────────────────────
# Blob JSON por usuario (clave = id de Supabase). Antes vivían en localStorage
# (sólo en un dispositivo); ahora se guardan en el servidor para sincronizarse
# entre dispositivos. Se persiste en el volumen (STORE_DIR).
_USERDATA_FILE = os.path.join(_STORE_DIR, "userdata.json")
_USERDATA_KEYS = {"routines", "routineDone", "routineLogs", "finance"}
_USERDATA_MAX  = 600_000   # bytes por clave

def _userdata_load():
    try:
        with open(_USERDATA_FILE, encoding="utf-8") as f:
            d = json.load(f)
        if isinstance(d, dict):
            return d
    except FileNotFoundError:
        pass
    except Exception:
        traceback.print_exc()
    return {}

def _userdata_save(data):
    tmp = _USERDATA_FILE + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)
    os.replace(tmp, _USERDATA_FILE)

def api_userdata_get(uid, _body):
    return {"ok": True, "data": _userdata_load().get(uid, {})}

def api_userdata_set(uid, body):
    key = body.get("key")
    if key not in _USERDATA_KEYS:
        return {"ok": False, "error": "Clave no válida"}
    value = body.get("value")
    try:
        if len(json.dumps(value, ensure_ascii=False)) > _USERDATA_MAX:
            return {"ok": False, "error": "Datos demasiado grandes"}
    except (TypeError, ValueError):
        return {"ok": False, "error": "Datos no válidos"}
    data = _userdata_load()
    blob = data.get(uid) or {}
    blob[key] = value
    data[uid] = blob
    _userdata_save(data)
    return {"ok": True}

USERDATA_HANDLERS = {
    "get": api_userdata_get,
    "set": api_userdata_set,
}

def _today():
    return time.strftime("%Y-%m-%d")

def _lead_keys(l):
    """Claves de dedupe: email y, para leads sin email, nombre+empresa."""
    keys = []
    em = (l.get("email") or "").strip().lower()
    if em: keys.append("e:" + em)
    nc = ((l.get("name") or "").strip().lower(),
          (l.get("company") or "").strip().lower())
    if nc[0] or nc[1]: keys.append("n:" + nc[0] + "|" + nc[1])
    return keys

def _add_leads(camp, leads_in, source="api"):
    """Añade leads a una campaña con dedupe. Devuelve (added, skipped)."""
    existing = set()
    for l in camp["leads"]:
        existing.update(_lead_keys(l))
    added, skipped = 0, 0
    for l in leads_in:
        if not isinstance(l, dict):
            continue
        email_addr = (l.get("email") or "").strip()
        lead_name  = (l.get("name") or l.get("company") or "").strip()
        if not lead_name:
            skipped += 1
            continue
        keys = _lead_keys(l)
        if any(k in existing for k in keys):
            skipped += 1
            continue
        existing.update(keys)
        camp["leads"].append({
            "id":      secrets.token_hex(8),
            "date":    (l.get("date") or _today())[:10],
            "name":    lead_name[:200],
            "company": (l.get("company") or "")[:200],
            "email":   email_addr[:200],
            "phone":   (l.get("phone") or "")[:60],
            "website": (l.get("website") or "")[:300],
            "linkedin":(l.get("linkedin") or "")[:300],
            "instagram":(l.get("instagram") or "")[:200],
            "scheduledFor": (l.get("scheduledFor") or "")[:16],
            "sector":  (l.get("sector") or "")[:120],
            "audit":   (l.get("audit") or "")[:8000],
            "notes":   (l.get("notes") or "")[:8000],
            "subject": (l.get("subject") or "")[:300],
            "draft":   (l.get("draft") or "")[:8000],
            "whatsapp":(l.get("whatsapp") or "")[:8000],
            "followUps": [],
            "workedAt": "",
            "status":  "new",
            "source":  source,
        })
        added += 1
    return added, skipped

def api_campaigns_import(body):
    """Ingesta desde Cowork (clave API). Crea la campaña si no existe."""
    name = (body.get("campaign") or "").strip() or "Outreach Cowork"
    leads_in = body.get("leads") or []
    if not isinstance(leads_in, list) or not leads_in:
        return {"ok": False, "error": "Falta la lista 'leads'"}
    if len(leads_in) > 100:
        return {"ok": False, "error": "Máximo 100 leads por importación"}

    data = _campaigns_load()
    camp = next((c for c in data["campaigns"]
                 if c["name"].strip().lower() == name.lower()), None)
    if camp is None:
        camp = {"id": secrets.token_hex(8), "name": name, "ctype": "cowork",
                "createdAt": _today(), "leads": []}
        data["campaigns"].append(camp)

    added, skipped = _add_leads(camp, leads_in, source="cowork")
    _campaigns_save(data)
    return {"ok": True, "campaign": camp["name"], "added": added,
            "skipped": skipped, "total": len(camp["leads"])}

def api_campaigns_import_leads(body):
    """Importación desde el propio SaaS (CSV o manual), con el JWT del usuario."""
    cid = body.get("campaignId")
    leads_in = body.get("leads") or []
    if not isinstance(leads_in, list) or not leads_in:
        return {"ok": False, "error": "Falta la lista 'leads'"}
    if len(leads_in) > 500:
        return {"ok": False, "error": "Máximo 500 leads por importación"}
    data = _campaigns_load()
    camp = next((c for c in data["campaigns"] if c["id"] == cid), None)
    if camp is None:
        return {"ok": False, "error": "Campaña no encontrada"}
    added, skipped = _add_leads(camp, leads_in, source=body.get("source") or "csv")
    _campaigns_save(data)
    return {"ok": True, "added": added, "skipped": skipped, "total": len(camp["leads"])}

def api_campaigns_data(_body):
    return {"ok": True, **_campaigns_load()}

CAMPAIGN_TYPES = {"email", "meta", "google", "cowork", "otro"}

def api_campaigns_create(body):
    name = (body.get("name") or "").strip()
    if not name:
        return {"ok": False, "error": "Falta el nombre"}
    ctype = body.get("ctype") or "email"
    if ctype not in CAMPAIGN_TYPES:
        ctype = "otro"
    data = _campaigns_load()
    if any(c["name"].strip().lower() == name.lower() for c in data["campaigns"]):
        return {"ok": False, "error": "Ya existe una campaña con ese nombre"}
    camp = {"id": secrets.token_hex(8), "name": name[:120], "ctype": ctype,
            "createdAt": _today(), "leads": []}
    data["campaigns"].append(camp)
    _campaigns_save(data)
    return {"ok": True, "campaign": camp}

def api_campaigns_update(body):
    """Edita nombre y/o tipo de una campaña."""
    cid = body.get("campaignId")
    data = _campaigns_load()
    camp = next((c for c in data["campaigns"] if c["id"] == cid), None)
    if camp is None:
        return {"ok": False, "error": "Campaña no encontrada"}
    name = (body.get("name") or "").strip()
    if name:
        if any(c["id"] != cid and c["name"].strip().lower() == name.lower()
               for c in data["campaigns"]):
            return {"ok": False, "error": "Ya existe una campaña con ese nombre"}
        camp["name"] = name[:120]
    ctype = body.get("ctype")
    if ctype:
        camp["ctype"] = ctype if ctype in CAMPAIGN_TYPES else "otro"
    if "goal" in body:
        try:
            g = int(body.get("goal") or 0)
            camp["goal"] = max(0, min(100000, g))
        except (TypeError, ValueError):
            pass
    if "dailyGoal" in body:
        try:
            dg = int(body.get("dailyGoal") or 0)
            camp["dailyGoal"] = max(0, min(1000, dg))
        except (TypeError, ValueError):
            pass
    if "note" in body:
        camp["note"] = (body.get("note") or "")[:2000]
    _campaigns_save(data)
    return {"ok": True, "campaign": {k: camp[k] for k in ("id", "name", "ctype", "createdAt", "goal", "dailyGoal", "note") if k in camp}}

LEAD_EDIT_FIELDS = {
    "name": 200, "company": 200, "email": 200, "phone": 60, "website": 300,
    "linkedin": 300, "instagram": 200, "scheduledFor": 16, "sector": 120, "audit": 8000, "subject": 300, "draft": 8000,
    "whatsapp": 8000, "notes": 8000, "followUp": 10, "workedAt": 10,
}
_FU_CHANNELS = ("email", "whatsapp", "call")

def _sanitize_followups(v):
    """Normaliza la secuencia de seguimientos de un lead (lista de pasos)."""
    if not isinstance(v, list):
        return []
    out = []
    for it in v[:30]:
        if not isinstance(it, dict):
            continue
        out.append({
            "id":      str(it.get("id") or secrets.token_hex(4))[:32],
            "date":    str(it.get("date") or "")[:10],
            "note":    str(it.get("note") or "")[:300],
            "channel": it.get("channel") if it.get("channel") in _FU_CHANNELS else "email",
            "done":    bool(it.get("done")),
        })
    return out

def api_campaigns_update_lead(body):
    cid, lid = body.get("campaignId"), body.get("leadId")
    status   = body.get("status")
    fields   = body.get("fields") or {}
    if status is not None and status not in LEAD_STATUSES:
        return {"ok": False, "error": "Estado no válido"}
    data = _campaigns_load()
    for c in data["campaigns"]:
        if c["id"] != cid:
            continue
        for l in c["leads"]:
            if l["id"] == lid:
                if status is not None:
                    l["status"] = status
                for k, v in fields.items():
                    if k in LEAD_EDIT_FIELDS:
                        l[k] = ("" if v is None else str(v))[:LEAD_EDIT_FIELDS[k]]
                if "followUps" in fields:
                    l["followUps"] = _sanitize_followups(fields["followUps"])
                _campaigns_save(data)
                return {"ok": True}
    return {"ok": False, "error": "Lead no encontrado"}

def api_campaigns_delete_lead(body):
    cid, lid = body.get("campaignId"), body.get("leadId")
    data = _campaigns_load()
    for c in data["campaigns"]:
        if c["id"] == cid:
            before = len(c["leads"])
            c["leads"] = [l for l in c["leads"] if l["id"] != lid]
            if len(c["leads"]) != before:
                _campaigns_save(data)
                return {"ok": True}
    return {"ok": False, "error": "Lead no encontrado"}

def api_campaigns_delete_campaign(body):
    cid = body.get("campaignId")
    data = _campaigns_load()
    before = len(data["campaigns"])
    data["campaigns"] = [c for c in data["campaigns"] if c["id"] != cid]
    if len(data["campaigns"]) != before:
        _campaigns_save(data)
        return {"ok": True}
    return {"ok": False, "error": "Campaña no encontrada"}

# ── HTTP handler ───────────────────────────────────────────────────────────

# Los antiguos endpoints /api/store, /api/invite y /api/auth (con contraseñas en
# claro en store.json) se han eliminado: la app usa Supabase (RLS) para todo eso.

MAIL_HANDLERS = {
    "connect":       api_connect,
    "folders":       api_folders,
    "messages":      api_messages,
    "message":       api_message,
    "send":          api_send,
    "action":        api_action,
    "notify_client": api_notify_client,
}

STRIPE_HANDLERS = {
    "balance":         api_stripe_balance,
    "invoices":        api_stripe_invoices,
    "charges":         api_stripe_charges,
    "revenue":         api_stripe_revenue,
    "create_invoice":  api_stripe_create_invoice,
    "create_payment_link": api_stripe_create_payment_link,
    "create_subscription": api_stripe_create_subscription,
}

# Endpoints del PORTAL: los puede llamar cualquier usuario autenticado, INCLUIDO
# un cliente (rol "client"). El destinatario de los correos lo fija el servidor.
PORTAL_HANDLERS = {
    "notify_agency": api_notify_agency,
}

# Requieren JWT del usuario (mismo esquema que MAIL/STRIPE)
CAMPAIGN_HANDLERS = {
    "data":            api_campaigns_data,
    "create":          api_campaigns_create,
    "update":          api_campaigns_update,
    "import_leads":    api_campaigns_import_leads,
    "update_lead":     api_campaigns_update_lead,
    "delete_lead":     api_campaigns_delete_lead,
    "delete_campaign": api_campaigns_delete_campaign,
}

# ── Calendario (.ics) — suscripción de solo lectura para Apple/Google Calendar ─
_CAL_MONTHS = {"ene":1,"feb":2,"mar":3,"abr":4,"may":5,"jun":6,
               "jul":7,"ago":8,"sep":9,"oct":10,"nov":11,"dic":12}

def _cal_ymd(d):
    """Normaliza una fecha a (Y, M, D) enteros. Acepta ISO o '15 jun 2026'."""
    if not d:
        return None
    s = str(d).strip()
    m = re.match(r"^(\d{4})-(\d{1,2})-(\d{1,2})", s)
    if m:
        return (int(m.group(1)), int(m.group(2)), int(m.group(3)))
    m = re.search(r"(\d{1,2})\s+([a-záéíóú]{3})[a-záéíóú]*\.?\s+(\d{4})", s.lower())
    if m:
        return (int(m.group(3)), _CAL_MONTHS.get(m.group(2), 1), int(m.group(1)))
    return None

def _ics_esc(s):
    return (str(s or "").replace("\\", "\\\\").replace(";", "\\;")
            .replace(",", "\\,").replace("\r", "").replace("\n", "\\n"))

def _ics_feed(agency_id):
    """Genera el texto .ics con proyectos, facturas y eventos de la agencia."""
    now = datetime.datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    out = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//141DIGITAL//Agenda//ES",
           "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
           "X-WR-CALNAME:141'DIGITAL — Agenda", "X-WR-TIMEZONE:Europe/Madrid"]

    def all_day(uid, ymd, summary, desc=""):
        y, mo, da = ymd
        start = datetime.date(y, mo, da)
        end = start + datetime.timedelta(days=1)
        out.extend(["BEGIN:VEVENT", f"UID:{uid}@141agency.com", f"DTSTAMP:{now}",
                    f"DTSTART;VALUE=DATE:{start.strftime('%Y%m%d')}",
                    f"DTEND;VALUE=DATE:{end.strftime('%Y%m%d')}",
                    f"SUMMARY:{_ics_esc(summary)}"])
        if desc:
            out.append(f"DESCRIPTION:{_ics_esc(desc)}")
        out.append("END:VEVENT")

    def timed(uid, ymd, t_start, t_end, summary, desc=""):
        y, mo, da = ymd
        try:
            hh, mm = [int(x) for x in (t_start.split(":") + ["0"])[:2]]
        except Exception:
            return all_day(uid, ymd, summary, desc)
        base = f"{y:04d}{mo:02d}{da:02d}"
        dstart = f"{base}T{hh:02d}{mm:02d}00"
        if t_end:
            try:
                eh, em = [int(x) for x in (t_end.split(":") + ["0"])[:2]]
                dend = f"{base}T{eh:02d}{em:02d}00"
            except Exception:
                dend = f"{base}T{(hh+1)%24:02d}{mm:02d}00"
        else:
            dend = f"{base}T{(hh+1)%24:02d}{mm:02d}00"
        # Hora "flotante" (sin Z ni TZID): se muestra a esa hora local.
        out.extend(["BEGIN:VEVENT", f"UID:{uid}@141agency.com", f"DTSTAMP:{now}",
                    f"DTSTART:{dstart}", f"DTEND:{dend}", f"SUMMARY:{_ics_esc(summary)}"])
        if desc:
            out.append(f"DESCRIPTION:{_ics_esc(desc)}")
        out.append("END:VEVENT")

    try:
        projects = _sb_service("GET", f"projects?agency_id=eq.{agency_id}&select=id,name,deadline,client_name")
    except Exception:
        projects = []
    for p in projects or []:
        ymd = _cal_ymd(p.get("deadline"))
        if ymd:
            all_day("proj-" + str(p.get("id")), ymd, "Entrega: " + (p.get("name") or ""),
                    p.get("client_name") or "")

    try:
        invoices = _sb_service("GET", f"invoices?agency_id=eq.{agency_id}&select=id,client_name,amount,due")
    except Exception:
        invoices = []
    for inv in invoices or []:
        ymd = _cal_ymd(inv.get("due"))
        if ymd:
            all_day("inv-" + str(inv.get("id")), ymd,
                    "Factura — " + (inv.get("client_name") or ""),
                    f"Importe: €{inv.get('amount') or 0}")

    try:
        events = _sb_service("GET", f"agenda_events?agency_id=eq.{agency_id}&select=id,title,date,time,time_end,notes")
    except Exception:
        events = []
    for e in events or []:
        ymd = _cal_ymd(e.get("date"))
        if not ymd:
            continue
        uid = "evt-" + str(e.get("id"))
        if e.get("time"):
            timed(uid, ymd, e.get("time"), e.get("time_end"), e.get("title") or "", e.get("notes") or "")
        else:
            all_day(uid, ymd, e.get("title") or "", e.get("notes") or "")

    out.append("END:VCALENDAR")
    # RFC 5545: líneas separadas por CRLF.
    return "\r\n".join(out) + "\r\n"


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE, **kwargs)

    # Ficheros que el servidor estático nunca debe servir
    _BLOCKED_NAMES = {"store.json", "campaign_leads.json", "userdata.json", "mail_server.py",
                      "requirements.txt", "railway.toml", "procfile", "build.sh"}

    def _path_blocked(self):
        path = urllib.parse.urlparse(self.path).path.lower()
        if "/." in path:               # .git, .env y cualquier dotfile/dotdir
            return True
        name = path.rsplit("/", 1)[-1]
        return name in self._BLOCKED_NAMES or path.endswith(".py")

    def _cors(self):
        origin = self.headers.get("Origin", "")
        if origin in ALLOWED_ORIGINS:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def end_headers(self):
        # Cabeceras de seguridad en todas las respuestas
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204); self._cors(); super().end_headers()

    def do_GET(self):
        if self._path_blocked():
            self.send_error(404); return
        gpath = urllib.parse.urlparse(self.path).path
        # Suscripción de calendario: /api/calendar/<token>.ics
        if gpath.startswith("/api/calendar/") and gpath.endswith(".ics"):
            self._handle_calendar(gpath[len("/api/calendar/"):-len(".ics")]); return
        # SPA routing: serve index.html for /invite/* paths
        if self.path.startswith("/invite/"):
            self.path = "/index.html"
        super().do_GET()

    def _handle_calendar(self, token):
        """Sirve el feed .ics de una agencia identificada por su token secreto."""
        if not SB_SERVICE_KEY:
            self.send_error(503, "Calendar no configurado"); return
        if not re.fullmatch(r"[0-9a-f]{16,64}", token or ""):
            self.send_error(404); return
        try:
            rows = _sb_service("GET", f"agencies?calendar_token=eq.{token}&select=id")
        except Exception:
            traceback.print_exc(); self.send_error(502); return
        if not rows:
            self.send_error(404); return
        try:
            body = _ics_feed(rows[0]["id"]).encode("utf-8")
        except Exception:
            traceback.print_exc(); self.send_error(500); return
        self.send_response(200)
        self.send_header("Content-Type", "text/calendar; charset=utf-8")
        self.send_header("Content-Disposition", 'inline; filename="141digital.ics"')
        self.send_header("Cache-Control", "no-cache, max-age=60")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_HEAD(self):
        if self._path_blocked():
            self.send_error(404); return
        super().do_HEAD()

    def do_POST(self):
        if self.path.startswith("/api/mail/"):
            self._handle_api(self.path[len("/api/mail/"):], MAIL_HANDLERS)
        elif self.path.startswith("/api/stripe/"):
            self._handle_api(self.path[len("/api/stripe/"):], STRIPE_HANDLERS)
        elif self.path == "/api/campaigns/import":
            self._handle_import()
        elif self.path.startswith("/api/campaigns/"):
            self._handle_api(self.path[len("/api/campaigns/"):], CAMPAIGN_HANDLERS)
        elif self.path.startswith("/api/portal/"):
            self._handle_api_any(self.path[len("/api/portal/"):], PORTAL_HANDLERS)
        elif self.path.startswith("/api/userdata/"):
            self._handle_userdata(self.path[len("/api/userdata/"):])
        elif self.path.startswith(("/api/store/", "/api/invite/", "/api/auth/")):
            self._json(410, {"ok": False, "error": "Endpoint retirado — la app usa Supabase"})
        else:
            self.send_error(405)

    def _handle_import(self):
        """Ingesta de leads desde Cowork: clave API estática, no JWT."""
        if not LEADS_API_KEY:
            self._json(403, {"ok": False, "error": "LEADS_API_KEY no configurada en el servidor"})
            return
        auth = self.headers.get("Authorization", "")
        key  = self.headers.get("X-Api-Key", "") or (auth[7:] if auth.startswith("Bearer ") else "")
        if not secrets.compare_digest(key, LEADS_API_KEY):
            self._json(401, {"ok": False, "error": "Clave API no válida"})
            return
        try:
            length = int(self.headers.get("Content-Length", 0))
            if length > 1_000_000:
                self._json(413, {"ok": False, "error": "Payload demasiado grande"})
                return
            body = json.loads(self.rfile.read(length).decode("utf-8")) if length else {}
            result = api_campaigns_import(body)
        except Exception as e:
            traceback.print_exc()
            result = {"ok": False, "error": str(e)}
        self._json(200, result)

    def _json(self, status, obj):
        resp = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type",   "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(resp)))
        self._cors()
        self.end_headers()
        self.wfile.write(resp)

    def _handle_userdata(self, endpoint):
        """Datos por usuario (rutinas, finanzas). JWT válido; los datos se
        guardan bajo el id del usuario, así que se sincronizan entre dispositivos."""
        auth  = self.headers.get("Authorization", "")
        token = auth[7:] if auth.startswith("Bearer ") else ""
        user  = _verify_supabase_token(token)
        if not user or not user.get("id"):
            self._json(401, {"ok": False, "error": "No autorizado"})
            return
        uid = user["id"]
        try:
            length = int(self.headers.get("Content-Length", 0))
            if length > 1_000_000:
                self._json(413, {"ok": False, "error": "Payload demasiado grande"})
                return
            body = json.loads(self.rfile.read(length).decode("utf-8")) if length else {}
            fn   = USERDATA_HANDLERS.get(endpoint)
            result = fn(uid, body) if fn else {"ok": False, "error": f"Unknown: {endpoint}"}
        except Exception as e:
            traceback.print_exc()
            result = {"ok": False, "error": str(e)}
        self._json(200, result)

    def _handle_api(self, endpoint, handlers):
        # Autenticación obligatoria: JWT de Supabase válido y que no sea un cliente del portal
        auth  = self.headers.get("Authorization", "")
        token = auth[7:] if auth.startswith("Bearer ") else ""
        user  = _verify_supabase_token(token)
        role  = ((user or {}).get("user_metadata") or {}).get("role")
        if not user or role == "client":
            self._json(401, {"ok": False, "error": "No autorizado"})
            return
        try:
            length = int(self.headers.get("Content-Length", 0))
            if length > 1_000_000:
                self._json(413, {"ok": False, "error": "Payload demasiado grande"})
                return
            body = json.loads(self.rfile.read(length).decode("utf-8")) if length else {}
            fn   = handlers.get(endpoint)
            result = fn(body) if fn else {"ok": False, "error": f"Unknown: {endpoint}"}
        except Exception as e:
            traceback.print_exc()
            result = {"ok": False, "error": str(e)}
        self._json(200, result)

    def _handle_api_any(self, endpoint, handlers):
        # Como _handle_api pero permite cualquier usuario autenticado (incl. clientes).
        auth  = self.headers.get("Authorization", "")
        token = auth[7:] if auth.startswith("Bearer ") else ""
        user  = _verify_supabase_token(token)
        if not user:
            self._json(401, {"ok": False, "error": "No autorizado"})
            return
        try:
            length = int(self.headers.get("Content-Length", 0))
            if length > 1_000_000:
                self._json(413, {"ok": False, "error": "Payload demasiado grande"})
                return
            body = json.loads(self.rfile.read(length).decode("utf-8")) if length else {}
            fn   = handlers.get(endpoint)
            result = fn(body) if fn else {"ok": False, "error": f"Unknown: {endpoint}"}
        except Exception as e:
            traceback.print_exc()
            result = {"ok": False, "error": str(e)}
        self._json(200, result)

    def log_message(self, fmt, *args):
        if "/api/" in (self.path if hasattr(self, "path") else ""):
            print(f"  {self.address_string()} {fmt % args}")

if __name__ == "__main__":
    server = HTTPServer(("", PORT), Handler)
    print(f"\n  141'STUDIO  →  http://localhost:{PORT}\n  Ctrl+C para parar\n")
    if SB_SERVICE_KEY and RESEND_API_KEY:
        threading.Thread(target=_reminder_loop, daemon=True).start()
        print(f"  ⏰ Recordatorios activos (cada {REMINDER_CHECK_HOURS}h, {REMINDER_DAYS}d, máx {REMINDER_MAX}).")
    else:
        print("  ⏰ Recordatorios desactivados (falta SUPABASE_SERVICE_ROLE_KEY o RESEND_API_KEY).")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor parado.")

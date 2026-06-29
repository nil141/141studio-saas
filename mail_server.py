#!/usr/bin/env python3
"""
141'STUDIO — servidor combinado
  • Sirve archivos estáticos
  • Proxy IMAP/SMTP en /api/mail/*

Uso:  python3 mail_server.py
URL:  http://localhost:8080
"""
import os, sys, json, re, imaplib, smtplib, email, traceback, secrets, random
import urllib.request, urllib.parse, urllib.error, base64, time, datetime
from http.server import HTTPServer, SimpleHTTPRequestHandler
from email.header  import decode_header as _dh
from email.mime.text      import MIMEText
from email.mime.multipart import MIMEMultipart

STRIPE_SK = os.environ.get("STRIPE_SK", "sk_live_REDACTED")

PORT = int(os.environ.get("PORT", 8080))
BASE = os.path.dirname(os.path.abspath(__file__))
# Si se define STORE_DIR (ej. Railway Volume en /data), los datos se guardan ahí
_STORE_DIR = os.environ.get("STORE_DIR", BASE)
os.makedirs(_STORE_DIR, exist_ok=True)

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

# ── Agents (Claude Managed Agents) ──────────────────────────────────────────
ANTHROPIC_AGENTS_BETA = "managed-agents-2026-04-01"

def _anthropic_get(path):
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("Falta ANTHROPIC_API_KEY en el entorno del servidor")
    req = urllib.request.Request("https://api.anthropic.com/v1/" + path, method="GET")
    req.add_header("x-api-key", api_key)
    req.add_header("anthropic-version", "2023-06-01")
    req.add_header("anthropic-beta", ANTHROPIC_AGENTS_BETA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode("utf-8"))

def _anthropic_post(path, payload):
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("Falta ANTHROPIC_API_KEY en el entorno del servidor")
    req = urllib.request.Request("https://api.anthropic.com/v1/" + path,
        data=json.dumps(payload).encode("utf-8"), method="POST")
    req.add_header("x-api-key", api_key)
    req.add_header("anthropic-version", "2023-06-01")
    req.add_header("content-type", "application/json")
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode("utf-8"))

def _anthropic_post_beta(path, payload):
    """POST a la API de Anthropic con la cabecera beta de Managed Agents."""
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("Falta ANTHROPIC_API_KEY en el entorno del servidor")
    req = urllib.request.Request("https://api.anthropic.com/v1/" + path,
        data=json.dumps(payload).encode("utf-8"), method="POST")
    req.add_header("x-api-key", api_key)
    req.add_header("anthropic-version", "2023-06-01")
    req.add_header("anthropic-beta", ANTHROPIC_AGENTS_BETA)
    req.add_header("content-type", "application/json")
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode("utf-8"))

def api_agents_list(body):
    try:
        data = _anthropic_get("agents?limit=100")
    except urllib.error.HTTPError as e:
        try:    msg = json.loads(e.read().decode()).get("error", {}).get("message", str(e))
        except Exception: msg = str(e)
        return {"ok": False, "error": msg}
    except Exception as e:
        return {"ok": False, "error": str(e)}
    agents = []
    for a in data.get("data", []):
        m = a.get("model")
        agents.append({
            "id":          a.get("id"),
            "name":        a.get("name"),
            "model":       m if isinstance(m, str) else (m or {}).get("id"),
            "description": a.get("description") or "",
            "created_at":  a.get("created_at"),
        })
    return {"ok": True, "agents": agents}

# ── Magnific / Freepik (texto → imagen) ─────────────────────────────────────
# Usa el endpoint clásico síncrono: POST /v1/ai/text-to-image devuelve las
# imágenes en base64 directamente, sin polling. La API key se lee del entorno
# (Railway), nunca del repo. Soporta FREEPIK_API_KEY o MAGNIFIC_API_KEY.

def _freepik_key():
    return os.environ.get("FREEPIK_API_KEY") or os.environ.get("MAGNIFIC_API_KEY")

def _freepik_generate(prompt, size, num=1):
    """Llama al endpoint clásico de Freepik. Devuelve lista de data-URLs (base64)."""
    api_key = _freepik_key()
    payload = {
        "prompt": prompt,
        "num_images": max(1, min(4, num)),
        "image": {"size": size},
        "filter_nsfw": True,
    }
    req = urllib.request.Request(
        "https://api.freepik.com/v1/ai/text-to-image",
        data=json.dumps(payload).encode("utf-8"),
        method="POST",
    )
    req.add_header("Content-Type", "application/json")
    req.add_header("x-freepik-api-key", api_key)
    with urllib.request.urlopen(req, timeout=90) as r:
        data = json.loads(r.read().decode("utf-8"))
    images = []
    for item in data.get("data", []):
        b64 = item.get("base64")
        if b64:
            images.append("data:image/png;base64," + b64)
    return images

def _freepik_err(e):
    try:    return str(json.loads(e.read().decode()).get("message") or f"Error {e.code} de Freepik")
    except Exception: return f"Error {e.code} de Freepik"

def api_agents_image(body):
    """Generación directa: el usuario escribe el prompt tal cual."""
    if not _freepik_key():
        return {"ok": False, "error": "Falta FREEPIK_API_KEY en el entorno del servidor"}
    prompt = (body.get("prompt") or "").strip()
    if not prompt:
        return {"ok": False, "error": "Escribe una descripción para generar la imagen"}
    num = body.get("num_images")
    try:    num = max(1, min(4, int(num)))
    except Exception: num = 1
    size = body.get("size") or "square_1_1"
    try:
        images = _freepik_generate(prompt, size, num)
    except urllib.error.HTTPError as e:
        return {"ok": False, "error": _freepik_err(e)}
    except Exception as e:
        return {"ok": False, "error": str(e)}
    if not images:
        return {"ok": False, "error": "La API no devolvió ninguna imagen"}
    return {"ok": True, "images": images, "prompt": prompt}

# ── Agente de imágenes (Claude escribe los prompts + Magnific los ejecuta) ───
# Flujo: el usuario pide algo en lenguaje natural → Claude (con skills de
# prompt engineering) escribe N prompts optimizados → cada prompt se ejecuta
# en Magnific/Freepik → se devuelven las imágenes junto al prompt que las creó.

_STUDIO_SYSTEM = (
    "Eres un director de arte y experto en prompt engineering para generación de imágenes "
    "(Magnific / Freepik). El usuario te pedirá algo en lenguaje natural. Conviértelo en prompts "
    "de altísima calidad, en INGLÉS (el modelo rinde mejor en inglés), detallados y cinematográficos: "
    "cuida sujeto, composición, encuadre, iluminación, lente/cámara, materiales, paleta, estilo y nivel "
    "de detalle. Cada prompt debe ser una VARIACIÓN distinta y claramente mejorada de lo que pide el usuario "
    "(distintos ángulos, atmósferas o enfoques), no repeticiones. No incluyas texto dentro de la imagen salvo "
    "que lo pidan. Devuelve EXCLUSIVAMENTE un JSON válido con la forma "
    "{\"prompts\": [\"...\"]} con EXACTAMENTE el número de prompts solicitado, sin ningún texto adicional."
)

def _extract_prompts(text, n):
    try:
        start = text.index("{"); end = text.rindex("}") + 1
        obj = json.loads(text[start:end])
        ps = [str(p).strip() for p in (obj.get("prompts") or []) if str(p).strip()]
        if ps: return ps[:n]
    except Exception:
        pass
    lines = [l.strip(" -*0123456789.\t") for l in text.splitlines() if l.strip()]
    lines = [l for l in lines if len(l) > 8]
    return lines[:n]

def _studio_make_prompts(instruction, n):
    payload = {
        "model": "claude-haiku-4-5-20251001",
        "max_tokens": 2000,
        "system": _STUDIO_SYSTEM,
        "messages": [{"role": "user", "content":
            f"Petición del usuario: {instruction}\n\nGenera exactamente {n} prompts."}],
    }
    data = _anthropic_post("messages", payload)
    text = "".join(b.get("text", "") for b in data.get("content", []) if b.get("type") == "text")
    return _extract_prompts(text, n)

def api_agents_studio(body):
    if not _freepik_key():
        return {"ok": False, "error": "Falta FREEPIK_API_KEY en el entorno del servidor"}
    if not os.environ.get("ANTHROPIC_API_KEY"):
        return {"ok": False, "error": "Falta ANTHROPIC_API_KEY en el entorno del servidor"}
    instruction = (body.get("instruction") or "").strip()
    if not instruction:
        return {"ok": False, "error": "Escribe qué quieres que genere el agente"}
    n = body.get("num_variations")
    try:    n = max(1, min(12, int(n)))
    except Exception: n = 4
    size = body.get("size") or "square_1_1"

    # 1) Claude escribe los prompts
    try:
        prompts = _studio_make_prompts(instruction, n)
    except urllib.error.HTTPError as e:
        try:    msg = json.loads(e.read().decode()).get("error", {}).get("message", str(e))
        except Exception: msg = str(e)
        return {"ok": False, "error": "El agente no pudo escribir los prompts: " + str(msg)}
    except Exception as e:
        return {"ok": False, "error": "El agente no pudo escribir los prompts: " + str(e)}
    if not prompts:
        return {"ok": False, "error": "El agente no devolvió ningún prompt"}

    # 2) Magnific ejecuta cada prompt
    items = []
    for p in prompts:
        try:
            imgs = _freepik_generate(p, size, 1)
            items.append({"prompt": p, "image": imgs[0] if imgs else None,
                          "error": None if imgs else "Sin imagen"})
        except urllib.error.HTTPError as e:
            items.append({"prompt": p, "image": None, "error": _freepik_err(e)})
        except Exception as e:
            items.append({"prompt": p, "image": None, "error": str(e)})

    return {"ok": True, "instruction": instruction, "items": items}

# ── Setup del Managed Agent (crea el agente en Claude Console, idempotente) ──
MA_ENV_NAME      = "141-studio"
MA_AGENT_NAME    = "Experto en Imágenes"
MA_VAULT_NAME    = "141-magnific"
MA_MCP_NAME      = "magnific"
MA_DEFAULT_MCP_URL = "https://web-production-f9998.up.railway.app/mcp"
MA_SYSTEM = (
    "Eres un director de arte y experto en prompt engineering para generación de imágenes. "
    "Cuando el usuario te pida algo, conviértelo en prompts detallados y cinematográficos en INGLÉS "
    "(cuida sujeto, composición, encuadre, iluminación, lente, materiales, paleta, estilo y nivel de detalle) "
    "y úsalos con tu herramienta `generar_imagen` para crear las imágenes. Si pide varias variaciones, "
    "escribe prompts distintos entre sí y llama a la herramienta las veces necesarias. "
    "Después, describe brevemente en español lo que has generado. No inventes URLs ni identificadores."
)

def _ma_find(path, name_field, name):
    try:
        data = _anthropic_get(path)
    except Exception:
        return None
    for it in data.get("data", []):
        if it.get(name_field) == name and not it.get("archived_at"):
            return it
    return None

def api_agents_setup(body):
    if body.get("secret") != os.environ.get("AGENT_SETUP_SECRET", "141setup2026"):
        return {"ok": False, "error": "No autorizado"}
    if not os.environ.get("ANTHROPIC_API_KEY"):
        return {"ok": False, "error": "Falta ANTHROPIC_API_KEY en el entorno del servidor"}
    mcp_url = (body.get("mcp_url") or MA_DEFAULT_MCP_URL).strip()
    try:
        # 1) Entorno (reutiliza si ya existe; nombre único)
        env = _ma_find("environments?limit=100", "name", MA_ENV_NAME)
        if not env:
            env = _anthropic_post_beta("environments", {
                "name": MA_ENV_NAME,
                "config": {"type": "cloud", "networking": {"type": "unrestricted"}},
            })
        env_id = env.get("id")

        # 2) Agente (crea o actualiza → nueva versión)
        agent_payload = {
            "name": MA_AGENT_NAME,
            "model": "claude-opus-4-8",
            "system": MA_SYSTEM,
            "description": "Genera imágenes con Magnific a partir de tus peticiones en lenguaje natural.",
            "mcp_servers": [{"type": "url", "name": MA_MCP_NAME, "url": mcp_url}],
            "tools": [
                {"type": "agent_toolset_20260401"},
                {"type": "mcp_toolset", "mcp_server_name": MA_MCP_NAME},
            ],
        }
        existing = _ma_find("agents?limit=100", "name", MA_AGENT_NAME)
        agent = _anthropic_post_beta("agents/" + existing["id"], agent_payload) if existing \
                else _anthropic_post_beta("agents", agent_payload)
        agent_id = agent.get("id")

        # 3) Vault + credencial bearer (solo si hay token configurado)
        vault_id = None
        token = os.environ.get("MCP_BEARER_TOKEN")
        if token:
            vault = _ma_find("vaults?limit=100", "display_name", MA_VAULT_NAME)
            if not vault:
                vault = _anthropic_post_beta("vaults", {"display_name": MA_VAULT_NAME})
            vault_id = vault.get("id")
            try:
                _anthropic_post_beta("vaults/%s/credentials" % vault_id, {
                    "display_name": "141 MCP bearer",
                    "auth": {"type": "static_bearer", "mcp_server_url": mcp_url, "token": token},
                })
            except urllib.error.HTTPError as e:
                if e.code != 409:  # 409 = ya existe esa credencial
                    raise
    except urllib.error.HTTPError as e:
        try:    msg = json.loads(e.read().decode()).get("error", {}).get("message", str(e))
        except Exception: msg = f"Error {e.code} de Anthropic"
        return {"ok": False, "error": str(msg)}
    except Exception as e:
        return {"ok": False, "error": str(e)}

    return {"ok": True, "agent_id": agent_id, "environment_id": env_id,
            "vault_id": vault_id, "mcp_url": mcp_url,
            "secured": bool(os.environ.get("MCP_BEARER_TOKEN"))}

# ── Stripe helpers ─────────────────────────────────────────────────────────

def _stripe_auth():
    return base64.b64encode(f"{STRIPE_SK}:".encode()).decode()

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
        raise Exception(body.get("error", {}).get("message", str(e)))

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
        raise Exception(body.get("error", {}).get("message", str(e)))

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
    _stripe_post("invoiceitems", {
        "customer":    cid,
        "invoice":     inv_id,
        "amount":      str(amount_cts),
        "currency":    currency,
        "description": description,
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

# ── HTTP handler ───────────────────────────────────────────────────────────

# ── Store persistente ───────────────────────────────────────────────────────
STORE_FILE = os.path.join(_STORE_DIR, "store.json")
_store_lock = __import__("threading").Lock()

def _read_store():
    try:
        with open(STORE_FILE, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}

def _write_store(data):
    with _store_lock:
        with open(STORE_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

def _rebuild_clients_from_accounts(account, admin_data, all_data):
    """Ensure CLIENTS contains every client that registered under this admin account.
    Uses __accounts__ as the source of truth — entries are never deleted from there."""
    colors   = ["#fb7185","#60a5fa","#fbbf24","#34d399","#a78bfa","#f472b6"]
    existing = {c["id"]: c for c in admin_data.get("CLIENTS", [])}
    changed  = False
    for email_, acc in all_data.get("__accounts__", {}).items():
        if acc.get("role") != "client" or acc.get("adminEmail") != account:
            continue
        cid = acc.get("clientId")
        if not cid or cid in existing:
            continue
        # Reconstruct a minimal client entry from whatever we have stored
        name    = acc.get("name", "")
        company = acc.get("company") or name
        admin_data.setdefault("CLIENTS", []).append({
            "id":          cid,
            "name":        name,
            "company":     company,
            "email":       acc.get("email", email_),
            "whatsapp":    acc.get("phone", ""),
            "initials":    acc.get("initials", name[:2].upper()),
            "color":       acc.get("color", colors[hash(cid) % len(colors)]),
            "projects":    0,
            "mrr":         0,
            "lastContact": "Hoy",
            "status":      "active",
            "service":     acc.get("service", ""),
            "since":       acc.get("since", ""),
        })
        existing[cid] = True
        changed = True
    return changed

def api_store_get(body):
    account = body.get("account", "__default__")
    all_data = _read_store()
    return {"ok": True, "data": all_data.get(account, {})}

def api_store_set(body):
    account = body.get("account", "__default__")
    data = body.get("data")
    if not isinstance(data, dict):
        return {"ok": False, "error": "data must be an object"}
    all_data = _read_store()
    all_data[account] = data
    _write_store(all_data)
    return {"ok": True}

STORE_HANDLERS = {
    "get": api_store_get,
    "set": api_store_set,
}

# ── Invites ──────────────────────────────────────────────────────────────────

def api_invite_create(body):
    admin_email = body.get("account", "")
    service     = body.get("service", "")
    token = secrets.token_urlsafe(20)
    all_data = _read_store()
    all_data.setdefault("__invites__", {})[token] = {
        "adminEmail": admin_email,
        "createdAt":  time.time(),
        "used":       False,
        "service":    service,
    }
    _write_store(all_data)
    return {"ok": True, "token": token}

def api_invite_check(body):
    token    = body.get("token", "")
    all_data = _read_store()
    inv = all_data.get("__invites__", {}).get(token)
    if not inv:
        return {"ok": False, "error": "Enlace no válido"}
    if inv.get("used"):
        return {"ok": False, "error": "Este enlace ya fue utilizado", "used": True}
    return {"ok": True, "service": inv.get("service", "")}

def api_invite_complete(body):
    token   = body.get("token", "")
    name    = body.get("name", "").strip()
    company = body.get("company", "").strip()
    email_  = body.get("email", "").strip().lower()
    pw      = body.get("pw", "")
    phone   = body.get("phone", "").strip()

    if not all([token, name, company, email_, pw]):
        return {"ok": False, "error": "Rellena todos los campos obligatorios"}

    all_data = _read_store()
    inv = all_data.get("__invites__", {}).get(token)
    if not inv or inv.get("used"):
        return {"ok": False, "error": "Enlace no válido o ya utilizado"}
    if email_ in all_data.get("__accounts__", {}):
        return {"ok": False, "error": "Este email ya tiene una cuenta"}

    admin_email = inv["adminEmail"]
    colors    = ["#fb7185","#60a5fa","#fbbf24","#34d399","#a78bfa","#f472b6"]
    color     = random.choice(colors)
    initials  = (name[:1] + (company[:1] if company else name[1:2])).upper()
    client_id = "c" + secrets.token_hex(4)
    now_str   = datetime.datetime.now().strftime("%b %Y")

    admin_data = all_data.setdefault(admin_email, {})
    admin_data.setdefault("CLIENTS", []).append({
        "id": client_id, "name": name, "company": company,
        "email": email_, "whatsapp": phone,
        "initials": initials, "color": color,
        "projects": 0, "mrr": 0, "lastContact": "Hoy",
        "status": "active", "service": inv.get("service", ""),
        "since": now_str,
    })
    # Bump _ts so the admin's polling detects the new client automatically
    admin_data["_ts"] = int(time.time() * 1000)

    all_data.setdefault("__accounts__", {})[email_] = {
        "role": "client", "name": name, "pw": pw,
        "adminEmail": admin_email, "clientId": client_id, "initials": initials,
        # Store full profile so _rebuild_clients_from_accounts can reconstruct the entry
        "email": email_, "company": company, "phone": phone,
        "color": color, "since": now_str, "service": inv.get("service", ""),
    }
    all_data["__invites__"][token]["used"] = True
    _write_store(all_data)
    return {"ok": True}

INVITE_HANDLERS = {
    "create":   api_invite_create,
    "check":    api_invite_check,
    "complete": api_invite_complete,
}

# ── Auth ─────────────────────────────────────────────────────────────────────

def api_auth_login(body):
    email_ = body.get("email", "").strip().lower()
    pw     = body.get("pw", "")
    all_data = _read_store()
    acc = all_data.get("__accounts__", {}).get(email_)
    if not acc or acc.get("pw") != pw:
        return {"ok": False}
    return {"ok": True, "account": {
        "email":      email_,
        "role":       acc["role"],
        "name":       acc["name"],
        "initials":   acc.get("initials", ""),
        "adminEmail": acc.get("adminEmail"),
        "clientId":   acc.get("clientId"),
    }}

def api_auth_reset_clients(body):
    """Clear CLIENTS list and remove all client accounts for an admin store key."""
    email_ = body.get("email", "").strip().lower()
    secret = body.get("secret", "")
    if secret != "141reset2025":
        return {"ok": False, "error": "No autorizado"}
    all_data = _read_store()
    # Remove all client accounts under this admin
    accounts = all_data.get("__accounts__", {})
    to_delete = [e for e, a in accounts.items() if a.get("adminEmail") == email_ and a.get("role") == "client"]
    for e in to_delete:
        del accounts[e]
    # Clear CLIENTS array and bump _ts
    admin_data = all_data.get(email_, {})
    admin_data["CLIENTS"] = []
    admin_data["_ts"] = int(time.time() * 1000)
    all_data[email_] = admin_data
    _write_store(all_data)
    return {"ok": True, "deleted": len(to_delete)}

AUTH_HANDLERS = {"login": api_auth_login, "reset-clients": api_auth_reset_clients}

MAIL_HANDLERS = {
    "connect":  api_connect,
    "folders":  api_folders,
    "messages": api_messages,
    "message":  api_message,
    "send":     api_send,
    "action":   api_action,
}

STRIPE_HANDLERS = {
    "balance":         api_stripe_balance,
    "invoices":        api_stripe_invoices,
    "charges":         api_stripe_charges,
    "revenue":         api_stripe_revenue,
    "create_invoice":  api_stripe_create_invoice,
}

AGENTS_HANDLERS = {
    "list": api_agents_list,
    "image": api_agents_image,
    "studio": api_agents_studio,
    "setup": api_agents_setup,
}

# ── Servidor MCP (puente para que un agente de Claude Console llame a Magnific) ──
# Expone una sola herramienta `generar_imagen` por JSON-RPC (MCP Streamable HTTP).
# Por dentro llama a Freepik con FREEPIK_API_KEY (del entorno). Se protege con un
# token Bearer opcional (MCP_BEARER_TOKEN) que se guarda en un vault de Anthropic.

MCP_PROTOCOL_VERSION = "2025-06-18"

MCP_TOOLS = [{
    "name": "generar_imagen",
    "description": (
        "Genera imágenes a partir de un prompt usando Magnific/Freepik. "
        "Pásale un prompt detallado en inglés y devuelve la(s) imagen(es) generada(s). "
        "Úsalo cuando el usuario pida crear, generar o producir imágenes."
    ),
    "inputSchema": {
        "type": "object",
        "properties": {
            "prompt": {"type": "string", "description": "Prompt detallado de la imagen (en inglés rinde mejor)."},
            "num_images": {"type": "integer", "description": "Número de imágenes (1-4).", "default": 1},
            "size": {"type": "string", "description": "Tamaño: square_1_1, social_story_9_16, widescreen_16_9, portrait_2_3.", "default": "square_1_1"},
        },
        "required": ["prompt"],
    },
}]

# Almacén en memoria de imágenes generadas, servidas por URL (/img/<id>).
# Evita devolver el base64 al agente (que dispararía el coste en tokens).
PUBLIC_BASE = (os.environ.get("PUBLIC_BASE_URL") or "https://web-production-f9998.up.railway.app").rstrip("/")
_GENERATED = {}
_GENERATED_ORDER = []

def _store_generated(b64):
    img_id = os.urandom(6).hex()
    _GENERATED[img_id] = b64
    _GENERATED_ORDER.append(img_id)
    while len(_GENERATED_ORDER) > 60:  # conserva solo las últimas 60
        old = _GENERATED_ORDER.pop(0)
        _GENERATED.pop(old, None)
    return PUBLIC_BASE + "/img/" + img_id

def _mcp_generar_imagen(args):
    prompt = (args.get("prompt") or "").strip()
    if not prompt:
        return {"content": [{"type": "text", "text": "Falta el prompt."}], "isError": True}
    if not _freepik_key():
        return {"content": [{"type": "text", "text": "El servidor no tiene FREEPIK_API_KEY configurada."}], "isError": True}
    try:    num = max(1, min(4, int(args.get("num_images", 1))))
    except Exception: num = 1
    size = args.get("size") or "square_1_1"
    try:
        images = _freepik_generate(prompt, size, num)
    except urllib.error.HTTPError as e:
        return {"content": [{"type": "text", "text": _freepik_err(e)}], "isError": True}
    except Exception as e:
        return {"content": [{"type": "text", "text": str(e)}], "isError": True}
    if not images:
        return {"content": [{"type": "text", "text": "La API no devolvió ninguna imagen."}], "isError": True}
    # Guardamos cada imagen y devolvemos SOLO la URL (no el base64) para no inflar tokens.
    urls = [_store_generated(d.split(",", 1)[1] if "," in d else d) for d in images]
    txt = "%d imagen(es) generada(s). Comparte estas URLs con el usuario para que las vea:\n%s" % (
        len(urls), "\n".join(urls))
    return {"content": [{"type": "text", "text": txt}], "isError": False}

def _mcp_dispatch(req):
    """Procesa un mensaje JSON-RPC del protocolo MCP. Devuelve dict de respuesta o None (notificación)."""
    method = req.get("method")
    rid = req.get("id")
    if method == "initialize":
        return {"jsonrpc": "2.0", "id": rid, "result": {
            "protocolVersion": MCP_PROTOCOL_VERSION,
            "capabilities": {"tools": {}},
            "serverInfo": {"name": "141-magnific", "version": "1.0.0"},
        }}
    if method in ("notifications/initialized", "notifications/cancelled"):
        return None  # notificación: sin respuesta
    if method == "ping":
        return {"jsonrpc": "2.0", "id": rid, "result": {}}
    if method == "tools/list":
        return {"jsonrpc": "2.0", "id": rid, "result": {"tools": MCP_TOOLS}}
    if method == "tools/call":
        params = req.get("params") or {}
        name = params.get("name")
        args = params.get("arguments") or {}
        if name == "generar_imagen":
            return {"jsonrpc": "2.0", "id": rid, "result": _mcp_generar_imagen(args)}
        return {"jsonrpc": "2.0", "id": rid, "error": {"code": -32601, "message": f"Herramienta desconocida: {name}"}}
    return {"jsonrpc": "2.0", "id": rid, "error": {"code": -32601, "message": f"Método no soportado: {method}"}}

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE, **kwargs)

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin",  "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, Mcp-Session-Id, Mcp-Protocol-Version")

    def do_OPTIONS(self):
        self.send_response(200); self._cors(); self.end_headers()

    def do_GET(self):
        # Imágenes generadas por el puente MCP: /img/<id> sirve el PNG
        if self.path.startswith("/img/"):
            img_id = self.path[len("/img/"):].split("?")[0]
            b64 = _GENERATED.get(img_id)
            if not b64:
                self.send_response(404); self._cors(); self.end_headers()
                self.wfile.write(b"not found")
                return
            try:    data = base64.b64decode(b64)
            except Exception:
                self.send_response(500); self._cors(); self.end_headers(); return
            self.send_response(200)
            self.send_header("Content-Type", "image/png")
            self.send_header("Content-Length", str(len(data)))
            self.send_header("Cache-Control", "public, max-age=86400")
            self._cors()
            self.end_headers()
            self.wfile.write(data)
            return
        # MCP no usa el canal GET (SSE saliente): respondemos 405 como indica el spec
        if self.path.startswith("/mcp"):
            self.send_response(405); self._cors(); self.end_headers()
            return
        # SPA routing: serve index.html for /invite/* paths
        if self.path.startswith("/invite/"):
            self.path = "/index.html"
        super().do_GET()

    def _mcp_authorized(self):
        token = os.environ.get("MCP_BEARER_TOKEN")
        if not token:
            return True  # sin token configurado → abierto (recomendado configurarlo)
        auth = self.headers.get("Authorization", "")
        return auth == f"Bearer {token}"

    def _handle_mcp(self):
        if not self._mcp_authorized():
            self.send_response(401); self._cors(); self.end_headers()
            self.wfile.write(b'{"error":"no autorizado"}')
            return
        try:
            length = int(self.headers.get("Content-Length", 0))
            raw = self.rfile.read(length).decode("utf-8") if length else "{}"
            msg = json.loads(raw)
        except Exception as e:
            self.send_response(400); self._cors(); self.end_headers()
            self.wfile.write(json.dumps({"jsonrpc": "2.0", "id": None,
                "error": {"code": -32700, "message": f"Parse error: {e}"}}).encode())
            return
        # Soporta batch (lista) o mensaje único
        try:
            if isinstance(msg, list):
                out = [r for r in (_mcp_dispatch(m) for m in msg) if r is not None]
                resp = json.dumps(out, ensure_ascii=False).encode("utf-8") if out else b""
            else:
                r = _mcp_dispatch(msg)
                resp = json.dumps(r, ensure_ascii=False).encode("utf-8") if r is not None else b""
        except Exception as e:
            traceback.print_exc()
            resp = json.dumps({"jsonrpc": "2.0", "id": msg.get("id") if isinstance(msg, dict) else None,
                "error": {"code": -32603, "message": str(e)}}).encode()
        if not resp:
            self.send_response(202); self._cors(); self.end_headers()  # notificación
            return
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(resp)))
        self._cors()
        self.end_headers()
        self.wfile.write(resp)

    def do_POST(self):
        if self.path == "/mcp" or self.path.startswith("/mcp"):
            self._handle_mcp()
            return
        if self.path.startswith("/api/mail/"):
            self._handle_api(self.path[len("/api/mail/"):], MAIL_HANDLERS)
        elif self.path.startswith("/api/stripe/"):
            self._handle_api(self.path[len("/api/stripe/"):], STRIPE_HANDLERS)
        elif self.path.startswith("/api/store/"):
            self._handle_api(self.path[len("/api/store/"):], STORE_HANDLERS)
        elif self.path.startswith("/api/invite/"):
            self._handle_api(self.path[len("/api/invite/"):], INVITE_HANDLERS)
        elif self.path.startswith("/api/auth/"):
            self._handle_api(self.path[len("/api/auth/"):], AUTH_HANDLERS)
        elif self.path.startswith("/api/agents/"):
            self._handle_api(self.path[len("/api/agents/"):], AGENTS_HANDLERS)
        else:
            self.send_error(405)

    def _handle_api(self, endpoint, handlers):
        try:
            length = int(self.headers.get("Content-Length", 0))
            body   = json.loads(self.rfile.read(length).decode("utf-8")) if length else {}
            fn     = handlers.get(endpoint)
            result = fn(body) if fn else {"ok": False, "error": f"Unknown: {endpoint}"}
        except Exception as e:
            traceback.print_exc()
            result = {"ok": False, "error": str(e)}
        resp = json.dumps(result, ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type",   "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(resp)))
        self._cors()
        self.end_headers()
        self.wfile.write(resp)

    def log_message(self, fmt, *args):
        if "/api/" in (self.path if hasattr(self, "path") else ""):
            print(f"  {self.address_string()} {fmt % args}")

if __name__ == "__main__":
    server = HTTPServer(("", PORT), Handler)
    print(f"\n  141'STUDIO  →  http://localhost:{PORT}\n  Ctrl+C para parar\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor parado.")

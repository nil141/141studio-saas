# 141'STUDIO — SaaS

Aplicación SaaS (dashboard de agencia) de 141'STUDIO, servida en **app.141agency.com**.

> La **web pública** de [141agency.com](https://141agency.com) se separó a su propio
> repositorio: **`141agency-web`**. Este repo contiene únicamente el SaaS.

## Estructura

- `index.html` — punto de entrada de la SPA (React vía Babel standalone + CDN)
- `src/` — código de la aplicación (dashboard, clientes, pipeline, agenda, campañas, auth, etc.)
- `mail_server.py` — backend HTTP (stdlib de Python): sirve los estáticos + las APIs
  (`/api/mail`, `/api/stripe`, `/api/campaigns`, `/api/userdata`, `/api/store`,
  `/api/invite`, `/api/auth`)
- `supabase/` — SQL de base de datos / invitaciones
- `Procfile`, `railway.toml`, `requirements.txt` — despliegue en Railway

## Despliegue

Se despliega en **Railway** (`python3 mail_server.py`). Sin dependencias externas
(solo la librería estándar de Python).

Variables relevantes:
- `ALLOWED_ORIGINS` — orígenes permitidos para CORS (por defecto `https://app.141agency.com`)
- `STORE_DIR` / `RAILWAY_VOLUME_MOUNT_PATH` — carpeta persistente para los datos
  (monta un Volume en Railway; si no, los datos son efímeros)

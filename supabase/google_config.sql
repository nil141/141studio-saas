-- Conexión de Google Calendar (OAuth) para crear reuniones con enlace de Meet.
-- Guarda el refresh_token y el access_token. SOLO lo lee/escribe el backend
-- (service role); el frontend nunca ve los tokens.
-- Ejecuta este SQL en Supabase → SQL Editor (una vez).

create table if not exists google_config (
  agency_id      uuid primary key,
  email          text,              -- cuenta de Google conectada
  access_token   text,              -- token de acceso (corta vida, SECRETO)
  refresh_token  text,              -- token de refresco (duradero, SECRETO)
  token_expiry   timestamptz,       -- caducidad del access_token
  calendar_id    text default 'primary',
  connected_at   timestamptz,
  updated_at     timestamptz default now()
);

-- RLS activado SIN políticas para authenticated → nadie con el token de usuario
-- puede leer esta tabla. La service role del backend salta RLS.
alter table google_config enable row level security;

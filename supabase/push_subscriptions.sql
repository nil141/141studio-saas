-- ============================================================================
-- 141'DIGITAL — Notificaciones push (dispositivos donde se activan los avisos)
-- Ejecutar UNA vez en: Supabase → SQL Editor → New query → pegar → Run.
-- Solo la usa el servidor de Railway (con la service role key): sin políticas
-- RLS, nadie más puede leerla ni escribirla.
-- ============================================================================

create table if not exists public.push_subscriptions (
  endpoint     text primary key,               -- dirección del dispositivo en el servicio de push
  agency_id    uuid not null,
  subscription jsonb not null,                 -- { endpoint, keys: { p256dh, auth } }
  prefs        jsonb not null default '{"clients": true, "events": true, "tasks": true}',
  device       text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);
create index if not exists push_subscriptions_agency_idx on public.push_subscriptions (agency_id);
alter table public.push_subscriptions enable row level security;

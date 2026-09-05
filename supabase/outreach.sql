-- ============================================================================
-- 141'DIGITAL — Propuestas Outreach (captación por Instagram)
-- Ejecutar UNA vez en: Supabase → SQL Editor → New query → pegar → Run.
-- ============================================================================

create table if not exists public.outreach (
  id         text primary key,
  agency_id  uuid not null,
  brand      text not null,            -- marca / cuenta
  instagram  text,                     -- @handle
  web        text,
  status     text default 'guardado',  -- guardado|contactado|respondio|conversacion|propuesta|cerrado|descartado
  notes      text,
  created_at timestamptz default now()
);

-- Columnas extra (ejecuta también estas dos si ya creaste la tabla antes):
alter table public.outreach add column if not exists contact text;   -- persona de contacto
alter table public.outreach add column if not exists email   text;   -- correo

alter table public.outreach enable row level security;

drop policy if exists "agency manages own outreach" on public.outreach;
create policy "agency manages own outreach" on public.outreach
  for all
  using (agency_id = auth.uid())
  with check (agency_id = auth.uid());

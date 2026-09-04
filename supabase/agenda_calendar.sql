-- ============================================================================
-- 141'DIGITAL — Agenda en la nube + suscripción de calendario (Apple Calendar)
-- Ejecutar UNA vez en: Supabase → SQL Editor → New query → pegar → Run.
-- ============================================================================

-- 1) Eventos de agenda (antes vivían solo en el navegador / localStorage).
create table if not exists public.agenda_events (
  id         text primary key,
  agency_id  uuid not null,
  title      text not null,
  date       text not null,          -- YYYY-MM-DD
  time       text,                   -- HH:MM (opcional)
  time_end   text,                   -- HH:MM (opcional)
  type       text default 'custom',
  notes      text,
  link       text,
  created_at timestamptz default now()
);

alter table public.agenda_events enable row level security;

drop policy if exists "agency manages own agenda events" on public.agenda_events;
create policy "agency manages own agenda events" on public.agenda_events
  for all
  using (agency_id = auth.uid())
  with check (agency_id = auth.uid());

-- 2) Token secreto para la suscripción de calendario (.ics).
alter table public.agencies
  add column if not exists calendar_token text;

create index if not exists agencies_calendar_token_idx
  on public.agencies (calendar_token);

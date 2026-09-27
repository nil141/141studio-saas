-- Biblioteca de recursos (herramientas, referencias, estrategias…)
-- Ejecuta esto en Supabase → SQL Editor (una vez).
create table if not exists resources (
  id          text primary key,
  agency_id   uuid not null,
  title       text,
  url         text,
  description text,
  type        text default 'herramienta',
  sector      text,
  created_at  timestamptz default now()
);
create index if not exists resources_agency_idx on resources (agency_id, created_at desc);

alter table resources enable row level security;

-- Cada agencia solo ve y edita sus propios recursos
drop policy if exists resources_owner on resources;
create policy resources_owner on resources
  for all using (agency_id = auth.uid()) with check (agency_id = auth.uid());

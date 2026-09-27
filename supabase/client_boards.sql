-- Tablero por cliente (pizarra estilo Miro: notas, texto e imágenes)
-- Ejecuta esto en Supabase → SQL Editor (una vez).
create table if not exists client_boards (
  client_id  text primary key,
  agency_id  uuid not null,
  items      jsonb default '[]'::jsonb,
  updated_at timestamptz default now()
);
create index if not exists client_boards_agency_idx on client_boards (agency_id);

alter table client_boards enable row level security;
drop policy if exists client_boards_owner on client_boards;
create policy client_boards_owner on client_boards
  for all using (agency_id = auth.uid()) with check (agency_id = auth.uid());

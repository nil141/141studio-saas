-- ============================================================================
-- 141'STUDIO — Credenciales compartidas por cliente
-- Ejecutar UNA vez en: Supabase → SQL Editor → New query → pegar → Run.
--
-- Lista de accesos (web, hosting, dominio, redes, analytics…) por cliente.
-- La agencia (dueña) y el propio cliente pueden leer y escribir SUS credenciales.
-- ============================================================================

create table if not exists public.credentials (
  id         text primary key,
  agency_id  uuid not null,
  client_id  text not null references public.clients(id) on delete cascade,
  label      text not null default '',   -- p.ej. "Instagram", "Hosting", "Dominio"
  url        text default '',
  username   text default '',
  password   text default '',
  notes      text default '',
  created_at timestamptz not null default now()
);

create index if not exists credentials_client_idx on public.credentials(client_id);

alter table public.credentials enable row level security;

-- La agencia gestiona las credenciales de sus clientes
drop policy if exists "agency manages credentials" on public.credentials;
create policy "agency manages credentials" on public.credentials
  for all to authenticated
  using (agency_id = auth.uid())
  with check (agency_id = auth.uid());

-- El cliente gestiona las credenciales de SU ficha
drop policy if exists "client manages own credentials" on public.credentials;
create policy "client manages own credentials" on public.credentials
  for all to authenticated
  using (client_id = (select client_db_id from public.profiles where id = auth.uid()))
  with check (client_id = (select client_db_id from public.profiles where id = auth.uid()));

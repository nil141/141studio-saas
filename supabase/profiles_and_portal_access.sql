-- ============================================================================
-- 141'STUDIO — Base del portal de cliente: tabla profiles + accesos de lectura
-- Ejecutar UNA vez en: Supabase → SQL Editor → New query → pegar → Run.
--
-- Crea public.profiles (vincula usuario ↔ agencia ↔ ficha de cliente) y añade
-- políticas de SOLO LECTURA para que cada cliente vea SUS proyectos, tareas,
-- entregables y facturas. Las políticas de la agencia siguen intactas.
-- Sustituye al anterior portal_tasks_access.sql.
-- ============================================================================

-- 1) Tabla de perfiles ------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  role         text not null default 'client',   -- 'admin' | 'client'
  name         text default '',
  initials     text default '',
  agency_id    uuid,
  client_db_id uuid references public.clients(id) on delete set null,
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Cada usuario gestiona SU propio perfil
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles
  for select to authenticated using (id = auth.uid());

drop policy if exists "insert own profile" on public.profiles;
create policy "insert own profile" on public.profiles
  for insert to authenticated with check (id = auth.uid());

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- 2) Lectura del cliente sobre SUS datos ------------------------------------
-- (aditivas: se suman a las políticas de la agencia con OR)

-- Proyectos
drop policy if exists "client reads own projects" on public.projects;
create policy "client reads own projects" on public.projects
  for select to authenticated
  using (client_id = (select client_db_id from public.profiles where id = auth.uid()));

-- Tareas (de sus proyectos)
drop policy if exists "client reads own project tasks" on public.tasks;
drop policy if exists "client reads own tasks" on public.tasks;
create policy "client reads own tasks" on public.tasks
  for select to authenticated
  using (project_id in (
    select id from public.projects
    where client_id = (select client_db_id from public.profiles where id = auth.uid())
  ));

-- Entregables (de sus proyectos)
drop policy if exists "client reads own deliverables" on public.deliverables;
create policy "client reads own deliverables" on public.deliverables
  for select to authenticated
  using (project_id in (
    select id from public.projects
    where client_id = (select client_db_id from public.profiles where id = auth.uid())
  ));

-- Facturas
drop policy if exists "client reads own invoices" on public.invoices;
create policy "client reads own invoices" on public.invoices
  for select to authenticated
  using (client_id = (select client_db_id from public.profiles where id = auth.uid()));

-- Su propia ficha de cliente (por si el portal la necesita)
drop policy if exists "client reads own client row" on public.clients;
create policy "client reads own client row" on public.clients
  for select to authenticated
  using (id = (select client_db_id from public.profiles where id = auth.uid()));

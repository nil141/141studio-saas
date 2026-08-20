-- ============================================================================
-- 141'STUDIO — "Qué te toca ahora": tareas de onboarding del cliente
-- Ejecutar UNA vez en: Supabase → SQL Editor → New query → pegar → Run.
--
-- La agencia crea las acciones que el cliente tiene que hacer; el cliente las
-- marca como realizadas desde su portal. Alimenta el anillo "Tus tareas".
-- ============================================================================

create table if not exists public.client_tasks (
  id          text primary key,
  agency_id   uuid not null,
  client_id   text not null references public.clients(id) on delete cascade,
  title       text not null default '',
  description text default '',
  done        boolean not null default false,
  sort        int not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists client_tasks_client_idx on public.client_tasks(client_id);

alter table public.client_tasks enable row level security;

-- La agencia gestiona las tareas de sus clientes
drop policy if exists "agency manages client_tasks" on public.client_tasks;
create policy "agency manages client_tasks" on public.client_tasks
  for all to authenticated
  using (agency_id = auth.uid())
  with check (agency_id = auth.uid());

-- El cliente ve sus tareas
drop policy if exists "client reads own client_tasks" on public.client_tasks;
create policy "client reads own client_tasks" on public.client_tasks
  for select to authenticated
  using (client_id = (select client_db_id from public.profiles where id = auth.uid()));

-- El cliente puede marcarlas como realizadas
drop policy if exists "client updates own client_tasks" on public.client_tasks;
create policy "client updates own client_tasks" on public.client_tasks
  for update to authenticated
  using (client_id = (select client_db_id from public.profiles where id = auth.uid()))
  with check (client_id = (select client_db_id from public.profiles where id = auth.uid()));

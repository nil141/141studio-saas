-- ============================================================================
-- 141'STUDIO — Notificaciones para el cliente (campana del portal)
-- Ejecutar UNA vez en: Supabase → SQL Editor → New query → pegar → Run.
-- La agencia crea notificaciones al añadir proyecto/tarea; el cliente las lee
-- y las marca como leídas desde su portal.
-- ============================================================================

create table if not exists public.notifications (
  id         text primary key,
  agency_id  uuid not null,
  client_id  text not null references public.clients(id) on delete cascade,
  title      text not null default '',
  body       text default '',
  kind       text default '',
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_client_idx on public.notifications(client_id, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "agency manages notifications" on public.notifications;
create policy "agency manages notifications" on public.notifications
  for all to authenticated
  using (agency_id = auth.uid())
  with check (agency_id = auth.uid());

drop policy if exists "client reads own notifications" on public.notifications;
create policy "client reads own notifications" on public.notifications
  for select to authenticated
  using (client_id = (select client_db_id from public.profiles where id = auth.uid()));

drop policy if exists "client updates own notifications" on public.notifications;
create policy "client updates own notifications" on public.notifications
  for update to authenticated
  using (client_id = (select client_db_id from public.profiles where id = auth.uid()))
  with check (client_id = (select client_db_id from public.profiles where id = auth.uid()));

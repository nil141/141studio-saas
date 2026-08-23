-- ============================================================================
-- 141'DIGITAL — Avisos del CLIENTE hacia la AGENCIA (campana del CRM + correo)
-- Ejecutar UNA vez en: Supabase → SQL Editor → New query → pegar → Run.
--   • Añade la columna "target" para distinguir avisos: 'client' (portal del
--     cliente) vs 'agency' (campana del CRM).
--   • Permite que el cliente cree avisos sobre SU propia ficha (para la agencia).
-- ============================================================================

alter table public.notifications
  add column if not exists target text not null default 'client';

create index if not exists notifications_agency_target_idx
  on public.notifications(agency_id, target, created_at desc);

-- El cliente puede INSERTAR notificaciones referidas a su propia ficha
-- (avisos hacia la agencia: "he completado una tarea", etc.).
drop policy if exists "client inserts own notifications" on public.notifications;
create policy "client inserts own notifications" on public.notifications
  for insert to authenticated
  with check (client_id = (select client_db_id from public.profiles where id = auth.uid()));

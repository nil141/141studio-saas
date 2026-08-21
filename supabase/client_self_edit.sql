-- ============================================================================
-- 141'STUDIO — El cliente puede editar SU propia ficha (Ajustes del portal)
-- Ejecutar UNA vez en: Supabase → SQL Editor → New query → pegar → Run.
-- ============================================================================

drop policy if exists "client updates own client row" on public.clients;
create policy "client updates own client row" on public.clients
  for update to authenticated
  using (id = (select client_db_id from public.profiles where id = auth.uid()))
  with check (id = (select client_db_id from public.profiles where id = auth.uid()));

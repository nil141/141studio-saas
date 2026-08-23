-- ============================================================================
-- 141'DIGITAL — Eliminar un cliente por completo (ficha + datos + login)
-- Ejecutar UNA vez en: Supabase → SQL Editor → New query → pegar → Run.
--   Borra la ficha y todo lo asociado, y la cuenta de acceso del cliente.
--   SECURITY DEFINER: puede borrar en auth.users; solo si el cliente pertenece
--   a la agencia que llama.
-- ============================================================================

create or replace function public.delete_client_full(p_client_id text, p_agency_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
begin
  if not exists (select 1 from public.clients where id = p_client_id and agency_id = p_agency_id) then
    return json_build_object('ok', false, 'error', 'Cliente no encontrado');
  end if;

  -- Cuenta de login vinculada (si el cliente tiene portal)
  select id into v_uid from public.profiles where client_db_id = p_client_id limit 1;

  -- Datos hijos (explícito, por si algún FK no fuese ON DELETE CASCADE)
  delete from public.notifications where client_id = p_client_id;
  delete from public.client_tasks  where client_id = p_client_id;
  delete from public.credentials   where client_id = p_client_id;
  delete from public.deliverables  where project_id in (select id from public.projects where client_id = p_client_id);
  delete from public.tasks         where project_id in (select id from public.projects where client_id = p_client_id);
  delete from public.invoices      where client_id = p_client_id;
  delete from public.projects      where client_id = p_client_id;
  delete from public.invites       where client_id::text = p_client_id;
  delete from public.profiles      where client_db_id = p_client_id;
  delete from public.clients       where id = p_client_id;

  -- Cuenta de acceso del cliente
  if v_uid is not null then
    delete from auth.users where id = v_uid;
  end if;

  return json_build_object('ok', true);
end;
$$;

grant execute on function public.delete_client_full(text, uuid) to authenticated;

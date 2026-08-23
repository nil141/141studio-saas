-- ============================================================================
-- 141'DIGITAL — Pre-rellenar el onboarding con los datos que ya puso la agencia
-- Ejecutar UNA vez en: Supabase → SQL Editor → New query → pegar → Run.
--
-- La página de onboarding es pública (sin login). Con el token del enlace,
-- devuelve los datos de la ficha del cliente para pre-rellenar el formulario.
-- SECURITY DEFINER: salta RLS, pero solo expone los datos de ESE cliente y solo
-- si el token existe y no está usado (el token es el secreto del enlace).
-- ============================================================================

create or replace function public.get_invite_prefill(p_token text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite record;
  v_client record;
begin
  select * into v_invite from public.invites where token = p_token;
  if not found or v_invite.used then
    return json_build_object('ok', false);
  end if;
  if v_invite.client_id is null then
    return json_build_object('ok', true, 'client', null);
  end if;
  select name, company, phone, website, fiscal_name, nif, fiscal_address, about, sector
    into v_client
    from public.clients
   where id = v_invite.client_id::text;
  if not found then
    return json_build_object('ok', true, 'client', null);
  end if;
  return json_build_object('ok', true, 'client', row_to_json(v_client));
end;
$$;

grant execute on function public.get_invite_prefill(text) to anon, authenticated;

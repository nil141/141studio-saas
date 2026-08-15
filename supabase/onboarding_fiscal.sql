-- ============================================================================
-- 141'STUDIO — Onboarding: datos fiscales + "sobre el negocio" del cliente
-- Ejecutar UNA vez en: Supabase → SQL Editor → New query → pegar → Run.
-- Añade columnas a clients y una versión de complete_invite que las guarda.
-- (La versión antigua de 4 argumentos se mantiene, así que nada se rompe.)
-- ============================================================================

-- 1) Columnas nuevas en la ficha de cliente
alter table public.clients
  add column if not exists nif            text,   -- NIF / CIF
  add column if not exists fiscal_name    text,   -- Razón social
  add column if not exists fiscal_address text,   -- Dirección fiscal
  add column if not exists website        text,   -- Web del cliente
  add column if not exists about          text;   -- Notas del onboarding (a qué se dedica, etc.)

-- 2) complete_invite con datos extra (JSONB). Firma nueva → no pisa la anterior.
create or replace function public.complete_invite(
  p_token   text,
  p_name    text,
  p_company text,
  p_phone   text,
  p_extra   jsonb
) returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite public.invites%rowtype;
  v_uid    uuid := auth.uid();
  v_client uuid;
  v_email  text;
begin
  if v_uid is null then
    return json_build_object('ok', false, 'error', 'No autenticado');
  end if;

  select * into v_invite from public.invites where token = p_token;
  if not found then
    return json_build_object('ok', false, 'error', 'Invitación no encontrada');
  end if;
  if v_invite.used then
    return json_build_object('ok', false, 'error', 'Invitación ya utilizada');
  end if;

  select email into v_email from auth.users where id = v_uid;

  if v_invite.client_id is not null then
    -- Vincular a la ficha existente y completar sus datos
    v_client := v_invite.client_id;
    update public.clients
       set name           = coalesce(nullif(p_name, ''), name),
           company        = coalesce(nullif(p_company, ''), company),
           phone          = coalesce(nullif(p_phone, ''), phone),
           email          = v_email,
           nif            = coalesce(nullif(p_extra->>'nif', ''), nif),
           fiscal_name    = coalesce(nullif(p_extra->>'fiscal_name', ''), fiscal_name),
           fiscal_address = coalesce(nullif(p_extra->>'fiscal_address', ''), fiscal_address),
           website        = coalesce(nullif(p_extra->>'website', ''), website),
           sector         = coalesce(nullif(p_extra->>'sector', ''), sector),
           about          = coalesce(nullif(p_extra->>'about', ''), about)
     where id = v_client;
  else
    -- Sin client_id → crear ficha nueva
    v_client := gen_random_uuid();
    insert into public.clients (id, agency_id, name, company, email, phone, initials, color, sector,
                                nif, fiscal_name, fiscal_address, website, about)
    values (
      v_client, v_invite.agency_id, p_name, p_company, v_email, p_phone,
      upper(left(coalesce(nullif(p_company, ''), nullif(p_name, ''), 'C'), 2)),
      '#60a5fa',
      coalesce(nullif(p_extra->>'sector', ''), nullif(v_invite.service, ''), '—'),
      nullif(p_extra->>'nif', ''),
      nullif(p_extra->>'fiscal_name', ''),
      nullif(p_extra->>'fiscal_address', ''),
      nullif(p_extra->>'website', ''),
      nullif(p_extra->>'about', '')
    );
  end if;

  insert into public.profiles (id, role, name, initials, agency_id, client_db_id)
  values (
    v_uid, 'client', p_name,
    upper(left(coalesce(nullif(p_name, ''), 'C'), 2)),
    v_invite.agency_id, v_client
  )
  on conflict (id) do update set
    role         = 'client',
    name         = excluded.name,
    agency_id    = excluded.agency_id,
    client_db_id = excluded.client_db_id;

  update public.invites set used = true where token = p_token;

  return json_build_object('ok', true, 'client_id', v_client);
end;
$$;

grant execute on function public.complete_invite(text, text, text, text, jsonb) to authenticated;

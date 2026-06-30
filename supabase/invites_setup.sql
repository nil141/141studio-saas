-- ============================================================================
-- 141'STUDIO — Sistema de invitaciones de clientes (v2: vinculadas a ficha)
-- Ejecutar UNA vez en: Supabase → SQL Editor → New query → pegar → Run.
-- ============================================================================

-- 1) Tabla de invitaciones
create table if not exists public.invites (
  token      text primary key,
  agency_id  uuid not null references auth.users(id) on delete cascade,
  service    text default '',
  used       boolean not null default false,
  created_at timestamptz not null default now()
);

-- v2: vinculación con una ficha de cliente existente (puede ser NULL)
alter table public.invites
  add column if not exists client_id uuid references public.clients(id) on delete cascade;

alter table public.invites enable row level security;

-- 2) Políticas RLS
drop policy if exists "agency manage own invites" on public.invites;
create policy "agency manage own invites" on public.invites
  for all
  using (agency_id = auth.uid())
  with check (agency_id = auth.uid());

-- El invitado lee la invitación por su token (token = secreto)
drop policy if exists "read invite by token" on public.invites;
create policy "read invite by token" on public.invites
  for select
  using (true);

-- 3) Función complete_invite — vincula al cliente existente si hay client_id,
--    o crea ficha nueva si no (compatibilidad con flujo antiguo).
create or replace function public.complete_invite(
  p_token   text,
  p_name    text,
  p_company text,
  p_phone   text
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
    -- Vincular a la ficha de cliente existente: actualizar contacto
    v_client := v_invite.client_id;
    update public.clients
       set name  = coalesce(nullif(p_name, ''), name),
           phone = coalesce(nullif(p_phone, ''), phone),
           email = v_email
     where id = v_client;
  else
    -- Compat: sin client_id → crear ficha nueva (flujo antiguo)
    v_client := gen_random_uuid();
    insert into public.clients (id, agency_id, name, company, email, phone, initials, color, sector)
    values (
      v_client, v_invite.agency_id, p_name, p_company, v_email, p_phone,
      upper(left(coalesce(nullif(p_company, ''), nullif(p_name, ''), 'C'), 2)),
      '#60a5fa',
      coalesce(nullif(v_invite.service, ''), '—')
    );
  end if;

  -- Perfil del usuario como cliente
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

grant execute on function public.complete_invite(text, text, text, text) to authenticated;

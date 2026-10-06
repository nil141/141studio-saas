-- WhatsApp (Meta Cloud API) — historial de mensajes entrantes y salientes.
-- Ejecuta este SQL en el editor de Supabase (una sola vez).

create table if not exists whatsapp_messages (
  id             text primary key default gen_random_uuid()::text,
  agency_id      uuid not null,                 -- dueño (uid de la agencia)
  wa_id          text not null,                 -- teléfono del contacto (solo dígitos, E.164 sin '+')
  direction      text not null,                 -- 'in' | 'out'
  type           text default 'text',           -- text | image | audio | document | ...
  body           text,                          -- texto del mensaje (o marcador [image], etc.)
  media_url      text,                          -- opcional, futura descarga de media
  contact_name   text,                          -- nombre del perfil de WhatsApp del contacto
  wa_message_id  text unique,                   -- id de Meta (evita duplicados en reintentos)
  status         text,                          -- sent | delivered | read | received | failed
  client_id      text references clients(id) on delete set null,
  ts             timestamptz not null default now(),  -- hora real del mensaje
  created_at     timestamptz not null default now()
);

create index if not exists idx_wa_msgs_agency_wa on whatsapp_messages(agency_id, wa_id, ts);
create index if not exists idx_wa_msgs_agency_ts on whatsapp_messages(agency_id, ts desc);

alter table whatsapp_messages enable row level security;

-- Cada agencia solo ve y edita sus propios mensajes.
-- (El webhook del backend usa la service role y salta RLS.)
drop policy if exists whatsapp_owner on whatsapp_messages;
create policy whatsapp_owner on whatsapp_messages
  for all using (agency_id = auth.uid()) with check (agency_id = auth.uid());

-- Realtime (idempotente: no falla si ya está añadida)
do $$ begin
  alter publication supabase_realtime add table whatsapp_messages;
exception when others then null; end $$;

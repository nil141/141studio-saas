-- Conexión de WhatsApp por coexistencia (Embedded Signup): guarda el token y
-- los ids del número conectado. SOLO lo lee/escribe el backend (service role);
-- el frontend nunca ve el token.
-- Ejecuta este SQL en Supabase → SQL Editor (una vez).

create table if not exists whatsapp_config (
  agency_id        uuid primary key,
  waba_id          text,              -- WhatsApp Business Account ID
  phone_number_id  text,              -- Phone Number ID del número conectado
  access_token     text,              -- token duradero (SECRETO, solo servidor)
  display_phone    text,              -- número en formato legible
  verified_name    text,              -- nombre para mostrar aprobado
  coexistence      boolean default true,
  connected_at     timestamptz,
  updated_at       timestamptz default now()
);

-- RLS activado SIN políticas para authenticated → nadie con el token de usuario
-- puede leer esta tabla. La service role del backend salta RLS.
alter table whatsapp_config enable row level security;

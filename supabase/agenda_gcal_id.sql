-- Vincula los eventos de la agenda con su evento de Google Calendar, para
-- poder sincronizar cambios (si mueves/borras la reunión en Google, el CRM
-- se actualiza). Ejecuta este SQL en Supabase → SQL Editor (una vez).

alter table public.agenda_events add column if not exists gcal_id text;

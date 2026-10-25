-- ============================================================================
-- 141'DIGITAL — Eventos de agenda de varios días (fecha de fin)
-- Ejecutar UNA vez en: Supabase → SQL Editor → New query → pegar → Run.
-- Mientras no se ejecute, la app sigue funcionando: los eventos se guardan
-- solo con su primer día.
-- ============================================================================

alter table public.agenda_events add column if not exists date_end text;   -- YYYY-MM-DD (opcional, último día incluido)

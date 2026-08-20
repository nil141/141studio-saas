-- ============================================================================
-- 141'STUDIO — Fases del proyecto: completadas manualmente + descripciones
-- Ejecutar UNA vez en: Supabase → SQL Editor → New query → pegar → Run.
--   phases_done: JSON array con los nombres de fase marcados como completados.
--   phases_desc: JSON objeto { "Nombre de fase": "descripción corta" }.
-- ============================================================================

alter table public.projects
  add column if not exists phases_done text,
  add column if not exists phases_desc text;

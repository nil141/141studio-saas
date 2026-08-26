-- ============================================================================
-- 141'DIGITAL — Enlace de Figma por proyecto (diseño incrustado en el portal)
-- Ejecutar UNA vez en: Supabase → SQL Editor → New query → pegar → Run.
-- ============================================================================

alter table public.projects
  add column if not exists figma_url text;

-- Fase del proyecto donde se muestra el diseño ("" / null = automático).
alter table public.projects
  add column if not exists figma_phase text;

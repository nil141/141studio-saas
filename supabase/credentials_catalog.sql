-- ============================================================================
-- 141'STUDIO — Credenciales por catálogo: plataforma + acceso concedido
-- Ejecutar UNA vez en: Supabase → SQL Editor → New query → pegar → Run.
-- ============================================================================

alter table public.credentials
  add column if not exists platform text,
  add column if not exists granted  boolean not null default false;

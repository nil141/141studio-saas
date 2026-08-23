-- ============================================================================
-- 141'DIGITAL — Recordatorios automáticos de tareas pendientes del cliente
-- Ejecutar UNA vez en: Supabase → SQL Editor → New query → pegar → Run.
--   Dos columnas para controlar cuántas veces y cuándo se ha recordado cada
--   tarea (el servidor de Railway lee/actualiza esto con la service role key).
-- ============================================================================

alter table public.client_tasks
  add column if not exists reminded_at    timestamptz,
  add column if not exists reminder_count int not null default 0;

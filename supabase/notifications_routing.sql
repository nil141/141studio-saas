-- ============================================================================
-- 141'DIGITAL — Avisos funcionales: destino de tareas + ruta de notificaciones
-- Ejecutar UNA vez en: Supabase → SQL Editor → New query → pegar → Run.
--   • client_tasks.link  → a qué sección del portal lleva la tarea (botón).
--   • notifications.route → a qué sección lleva el aviso (campana + botón correo).
-- ============================================================================

alter table public.client_tasks
  add column if not exists link text;

alter table public.notifications
  add column if not exists route text;

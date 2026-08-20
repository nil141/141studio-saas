-- ============================================================================
-- 141'STUDIO — Portal de cliente: que el cliente vea las tareas de SUS proyectos
-- Ejecutar UNA vez en: Supabase → SQL Editor → New query → pegar → Run.
-- Añade una política RLS de solo-lectura sobre tasks para el cliente. Las
-- políticas de la agencia siguen intactas (RLS combina con OR).
-- ============================================================================

alter table public.tasks enable row level security;

drop policy if exists "client reads own project tasks" on public.tasks;
create policy "client reads own project tasks" on public.tasks
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.projects pr
      join public.profiles  pf on pf.id = auth.uid()
      where pr.id = tasks.project_id
        and pr.client_id = pf.client_db_id
    )
  );

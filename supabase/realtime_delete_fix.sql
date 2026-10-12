-- Realtime: hacer que los eventos DELETE lleguen a otras pestañas/dispositivos.
--
-- Problema: nuestras suscripciones realtime filtran por agency_id=eq.<uid>.
-- Con la "replica identity" por defecto (solo la clave primaria), el registro
-- viejo de un DELETE NO incluye agency_id, así que el filtro no casa y el
-- evento DELETE nunca se entrega. Resultado: borras una tarea en una pestaña y
-- en otra (p. ej. Inicio) sigue apareciendo hasta recargar.
--
-- Solución: REPLICA IDENTITY FULL incluye todas las columnas del registro viejo
-- en el payload del DELETE, el filtro agency_id casa y el evento sí se entrega.
-- Ejecuta este SQL en Supabase → SQL Editor (una vez).
--
-- Nota: solo altera las tablas que existan en tu base de datos; las que no
-- existan se ignoran sin dar error.

do $$
declare
  t text;
  tables text[] := array[
    'tasks', 'projects', 'clients', 'invoices', 'leads', 'deliverables',
    'credentials', 'client_tasks', 'notifications', 'agenda_events',
    'outreach', 'resources', 'whatsapp_messages'
  ];
begin
  foreach t in array tables loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I replica identity full', t);
      raise notice 'replica identity full -> public.%', t;
    else
      raise notice 'omitida (no existe) -> public.%', t;
    end if;
  end loop;
end $$;

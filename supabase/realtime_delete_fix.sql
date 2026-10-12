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

alter table public.tasks         replica identity full;
alter table public.projects      replica identity full;
alter table public.clients       replica identity full;
alter table public.invoices      replica identity full;
alter table public.leads         replica identity full;
alter table public.deliverables  replica identity full;
alter table public.credentials   replica identity full;
alter table public.client_tasks  replica identity full;
alter table public.notifications replica identity full;
alter table public.agenda_events replica identity full;
alter table public.outreach      replica identity full;
alter table public.resources     replica identity full;

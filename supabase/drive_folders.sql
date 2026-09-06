-- Carpetas de Google Drive creadas automáticamente (vía Apps Script Web App).
-- clients.drive_url ya existía; añadimos el id de la carpeta para poder anidar
-- los proyectos dentro de la carpeta del cliente, y las columnas del proyecto.
alter table public.clients  add column if not exists drive_folder_id text;
alter table public.projects add column if not exists drive_url        text;
alter table public.projects add column if not exists drive_folder_id  text;

-- Campaña de captación: mensaje listo, nicho y agrupación por tanda/campaña.
-- Ejecuta esto en Supabase → SQL Editor (una vez).
alter table outreach add column if not exists message  text;
alter table outreach add column if not exists niche    text;
alter table outreach add column if not exists campaign text;

-- Índice para filtrar rápido por campaña/tanda
create index if not exists outreach_campaign_idx on outreach (agency_id, campaign);

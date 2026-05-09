-- 041_meta_signups.sql
-- Registros aceptados por Meta (Creator Program). Fuente: Excel semanal del partner program.
-- Es la métrica L4 del funnel /funnel-meta — la conversión real de la operación cold.
--
-- Pipeline de carga: Excel -> scripts/_import_meta_signups.py -> upsert a esta tabla.
-- Cross-attribution con Smartlead vía email match (post-import join).

create table if not exists public.meta_signups (
  id              bigserial primary key,
  email           text not null,
  accepted_at     date not null,            -- fecha de aceptación reportada por Meta
  first_name      text,
  last_name       text,
  creator_handle  text,                      -- ej. '@daniel_mx'
  platform        text,                      -- tiktok|ig|fb|youtube|other
  meta_creator_id text,                      -- id interno Meta si lo trae
  referral_code   text,                      -- 'laneta' por default
  batch_label     text,                      -- 'week-2026-W19' o lo que diga el Excel
  source_file     text,                      -- nombre del Excel original
  imported_at     timestamptz not null default now(),
  raw             jsonb,                     -- row completa del Excel (para columnas no mapeadas)
  unique (email)                              -- 1 registro por email; re-import del mismo Excel = upsert
);

create index if not exists meta_signups_accepted_at_idx
  on public.meta_signups (accepted_at desc);

create index if not exists meta_signups_email_idx
  on public.meta_signups (lower(email));

create index if not exists meta_signups_imported_idx
  on public.meta_signups (imported_at desc);

alter table public.meta_signups enable row level security;

drop policy if exists meta_signups_read_anyone on public.meta_signups;
create policy meta_signups_read_anyone
  on public.meta_signups
  for select
  using (true);

-- Insert/update via service role (script de import). Anon NO escribe.
drop policy if exists meta_signups_write_service on public.meta_signups;
create policy meta_signups_write_service
  on public.meta_signups
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

comment on table public.meta_signups is
  'Aceptados por Meta Creator Program. Fuente: Excel semanal partner. Cargado vía scripts/_import_meta_signups.py.';

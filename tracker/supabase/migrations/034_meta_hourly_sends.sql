-- 034_meta_hourly_sends.sql
-- Reportes horarios descargados de Smartlead UI (CSV).
-- Source: scripts/_import_smartlead_hourly_csv.py procesa
--   plan-b/reporte-smartLead/campaign-<id>-send-forecast-hourly-*.csv

create table if not exists public.meta_hourly_sends (
  id              bigserial primary key,
  campaign_id     bigint not null,
  date            date not null,
  hour_start      smallint not null,           -- 0-23
  predicted       int default 0,
  actual_sent     int default 0,                -- "Sent" en CSV (delivered)
  opened          int default 0,
  clicked         int default 0,
  replied         int default 0,
  bounced         int default 0,
  disconnected_mailboxes int default 0,
  send_limit_reached     int default 0,
  imported_at     timestamptz not null default now(),
  source_file     text,
  unique (campaign_id, date, hour_start)
);

create index if not exists meta_hourly_sends_date_idx
  on public.meta_hourly_sends (date desc);

create index if not exists meta_hourly_sends_campaign_date_idx
  on public.meta_hourly_sends (campaign_id, date desc);

alter table public.meta_hourly_sends enable row level security;

drop policy if exists meta_hourly_sends_read_anyone on public.meta_hourly_sends;
create policy meta_hourly_sends_read_anyone
  on public.meta_hourly_sends
  for select
  using (true);

comment on table public.meta_hourly_sends is
  'Reportes horarios de Smartlead descargados como CSV e importados manualmente.';

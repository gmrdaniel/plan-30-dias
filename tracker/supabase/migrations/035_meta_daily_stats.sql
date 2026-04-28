-- 035_meta_daily_stats.sql
-- Daily aggregates derived from Smartlead's /campaigns/{id}/statistics endpoint.
-- Source of truth para cuántos emails se enviaron cada día (sin depender de
-- deltas calculados ni del CSV horario manual).
-- Poblado por scripts/_snapshot_meta.py en cada corrida.

create table if not exists public.meta_daily_stats (
  id            bigserial primary key,
  campaign_id   bigint not null,
  date          date not null,
  step          smallint,                 -- sequence_number 1..N · NULL = total agregado
  sent          int default 0,
  opens         int default 0,
  clicks        int default 0,
  replies       int default 0,
  bounces       int default 0,
  unsubscribes  int default 0,
  refreshed_at  timestamptz not null default now(),
  unique (campaign_id, date, step)
);

create index if not exists meta_daily_stats_date_idx
  on public.meta_daily_stats (date desc);

create index if not exists meta_daily_stats_campaign_date_idx
  on public.meta_daily_stats (campaign_id, date desc);

alter table public.meta_daily_stats enable row level security;

drop policy if exists meta_daily_stats_read_anyone on public.meta_daily_stats;
create policy meta_daily_stats_read_anyone
  on public.meta_daily_stats
  for select
  using (true);

comment on table public.meta_daily_stats is
  'Agregaciones diarias derivadas de /campaigns/{id}/statistics. Step NULL = total del día.';

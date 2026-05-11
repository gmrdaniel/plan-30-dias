-- 044_branch_clicks_dimensional.sql
-- Data dimensional de Branch.io: clicks por día y breakdowns por OS/browser/platform/referrer.
-- Source: Single Link Analytics export CSVs descargados por alias del dashboard Branch.io,
-- droppeados en `branch-csv/inbox/<alias>/*.csv`, importados por `_import_branch_csvs.py`.
--
-- branch_clicks_daily complementa branch_link_stats (que era snapshot cumulative):
--   - branch_link_stats: clicks acumulados a una fecha (snapshot puntual)
--   - branch_clicks_daily: clicks generados EN un día específico (time series)
-- Las dos coexisten — son lecturas diferentes de la misma data.

create table if not exists public.branch_clicks_daily (
  id           bigserial primary key,
  alias        text not null,
  click_date   date not null,
  clicks       int not null check (clicks >= 0),
  imported_at  timestamptz not null default now(),
  unique (alias, click_date)
);

create index if not exists branch_clicks_daily_alias_date_idx
  on public.branch_clicks_daily (alias, click_date desc);

alter table public.branch_clicks_daily enable row level security;

drop policy if exists branch_clicks_daily_read on public.branch_clicks_daily;
create policy branch_clicks_daily_read on public.branch_clicks_daily for select using (true);

drop policy if exists branch_clicks_daily_write on public.branch_clicks_daily;
create policy branch_clicks_daily_write on public.branch_clicks_daily for insert with check (true);

drop policy if exists branch_clicks_daily_update on public.branch_clicks_daily;
create policy branch_clicks_daily_update on public.branch_clicks_daily for update using (true) with check (true);

comment on table public.branch_clicks_daily is
  'Clicks por día por alias Branch.io (time series). Source: CSV "Click + Scans Count, Daily" descargado del dashboard Branch.';


create table if not exists public.branch_clicks_breakdown (
  id            bigserial primary key,
  alias         text not null,
  dimension     text not null check (dimension in ('os','browser','platform','referrer')),
  category      text not null,
  clicks        int not null check (clicks >= 0),
  window_start  date,
  window_end    date,
  imported_at   timestamptz not null default now(),
  unique (alias, dimension, category, window_start, window_end)
);

create index if not exists branch_clicks_breakdown_alias_dim_idx
  on public.branch_clicks_breakdown (alias, dimension, clicks desc);

alter table public.branch_clicks_breakdown enable row level security;

drop policy if exists branch_clicks_breakdown_read on public.branch_clicks_breakdown;
create policy branch_clicks_breakdown_read on public.branch_clicks_breakdown for select using (true);

drop policy if exists branch_clicks_breakdown_write on public.branch_clicks_breakdown;
create policy branch_clicks_breakdown_write on public.branch_clicks_breakdown for insert with check (true);

drop policy if exists branch_clicks_breakdown_update on public.branch_clicks_breakdown;
create policy branch_clicks_breakdown_update on public.branch_clicks_breakdown for update using (true) with check (true);

drop policy if exists branch_clicks_breakdown_delete on public.branch_clicks_breakdown;
create policy branch_clicks_breakdown_delete on public.branch_clicks_breakdown for delete using (true);

comment on table public.branch_clicks_breakdown is
  'Breakdowns dimensionales de clicks Branch (OS, browser, platform, referrer). Replace por (alias,dimension,window) en cada import.';

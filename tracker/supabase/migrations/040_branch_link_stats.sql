-- 040_branch_link_stats.sql
-- Conteos manuales de clicks por Branch link (alias).
-- Activation Basics ($17/mo) no expone Analytics API ni per-link CSV;
-- el operador entra al admin form en /meta-reporte y teclea los conteos
-- vistos en el dashboard de Branch (Single Link Analytics, link por link).
--
-- Append-only: una row por (alias, snapshot_date). Para refrescar el día
-- en curso, upsert con ON CONFLICT(alias, snapshot_date) DO UPDATE.
-- Histórico se preserva: cada día deja su row para reconstruir trayectorias.

create table if not exists public.branch_link_stats (
  id              bigserial primary key,
  imported_at     timestamptz not null default now(),
  snapshot_date   date not null,
  alias           text not null,           -- 'social-proof-ana', 'apply-fast-track', etc.
  campaign        text,                     -- ~campaign de Branch (ej. 'social_proof_ana')
  clicks          integer not null check (clicks >= 0),
  notes           text,                     -- libre, ej. "Step 2 perdió Branch en edición"
  recorded_by     text,                     -- email del operador que ingresó
  unique (alias, snapshot_date)
);

create index if not exists branch_link_stats_alias_date_idx
  on public.branch_link_stats (alias, snapshot_date desc);

create index if not exists branch_link_stats_date_idx
  on public.branch_link_stats (snapshot_date desc);

alter table public.branch_link_stats enable row level security;

drop policy if exists branch_link_stats_read_anyone on public.branch_link_stats;
create policy branch_link_stats_read_anyone
  on public.branch_link_stats
  for select
  using (true);

-- Write policy: anon allowed (hay form admin abierto en /meta-reporte sin auth fuerte).
-- Si después se mete behind auth, restrict a authenticated.
drop policy if exists branch_link_stats_write_anyone on public.branch_link_stats;
create policy branch_link_stats_write_anyone
  on public.branch_link_stats
  for insert
  with check (true);

drop policy if exists branch_link_stats_update_anyone on public.branch_link_stats;
create policy branch_link_stats_update_anyone
  on public.branch_link_stats
  for update
  using (true)
  with check (true);

comment on table public.branch_link_stats is
  'Snapshots manuales de clicks por Branch link. Operador teclea desde /meta-reporte admin form.';

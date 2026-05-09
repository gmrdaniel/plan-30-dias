-- 042_branch_device_snapshots.sql
-- Snapshots manuales del breakdown OS/device del PDF Branch Single Link Analytics.
-- Activation Basics solo muestra estos % en PDF agregado (no per-alias) — el operador
-- los lee del donut chart y los teclea en el form admin de /meta-reporte.
--
-- Schema flexible: device_breakdown jsonb permite agregar OS nuevos sin migración.
-- Convención de keys: 'Windows', 'macOS', 'Linux', 'iOS', 'Android', 'Other'.

create table if not exists public.branch_device_snapshots (
  id                bigserial primary key,
  snapshot_date     date not null,
  device_breakdown  jsonb not null,            -- {"Windows": 50, "macOS": 15, "Linux": 10, "iOS": 25}
  source_pdf        text,                       -- nombre del PDF si lo capturamos
  notes             text,
  recorded_by       text,
  imported_at       timestamptz not null default now(),
  unique (snapshot_date)
);

create index if not exists branch_device_snapshots_date_idx
  on public.branch_device_snapshots (snapshot_date desc);

alter table public.branch_device_snapshots enable row level security;

drop policy if exists branch_device_snapshots_read_anyone on public.branch_device_snapshots;
create policy branch_device_snapshots_read_anyone
  on public.branch_device_snapshots
  for select
  using (true);

drop policy if exists branch_device_snapshots_write_anyone on public.branch_device_snapshots;
create policy branch_device_snapshots_write_anyone
  on public.branch_device_snapshots
  for insert
  with check (true);

drop policy if exists branch_device_snapshots_update_anyone on public.branch_device_snapshots;
create policy branch_device_snapshots_update_anyone
  on public.branch_device_snapshots
  for update
  using (true)
  with check (true);

comment on table public.branch_device_snapshots is
  'Snapshots manuales del donut OS/device de Branch PDF. Operador teclea desde /meta-reporte admin form.';

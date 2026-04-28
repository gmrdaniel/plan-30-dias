-- 036_inbox_snapshots.sql
-- Estado actual de los buzones (inboxes) Smartlead — cap, reputación, warmup.
-- Source: scripts/_snapshot_inboxes.py corre on-demand junto con _snapshot_meta.py.
-- Consumer: prototipos/capacidad-envios/CapacidadEnviosPage.tsx

create table if not exists public.inbox_snapshots (
  id                    bigserial primary key,
  taken_at              timestamptz not null default now(),
  inbox_id              bigint not null,
  from_email            text,
  from_name             text,
  pool                  text not null,          -- 'meta' | 'forms' | 'unknown'
  message_per_day       int,                    -- cap SMTP actual
  warmup_status         text,                   -- ACTIVE | PAUSED | ...
  warmup_max_count      int,                    -- target diario del warmup
  warmup_min_count      int,
  warmup_reputation     int,                    -- 0-100
  warmup_started_at     timestamptz,
  warmup_days           int,                    -- días desde warmup_started_at al snapshot
  total_sent_count      int,
  total_spam_count      int,
  is_warmup_blocked     boolean default false,
  campaign_ids          bigint[]                 -- campañas en las que el inbox aparece
);

create index if not exists inbox_snapshots_taken_at_idx
  on public.inbox_snapshots (taken_at desc);

create index if not exists inbox_snapshots_inbox_taken_idx
  on public.inbox_snapshots (inbox_id, taken_at desc);

create index if not exists inbox_snapshots_pool_idx
  on public.inbox_snapshots (pool, taken_at desc);

alter table public.inbox_snapshots enable row level security;

drop policy if exists inbox_snapshots_read_anyone on public.inbox_snapshots;
create policy inbox_snapshots_read_anyone
  on public.inbox_snapshots
  for select
  using (true);

comment on table public.inbox_snapshots is
  'Snapshot del estado de los buzones SMTP en Smartlead (cap, warmup, rep). Refresh manual via _snapshot_inboxes.py.';

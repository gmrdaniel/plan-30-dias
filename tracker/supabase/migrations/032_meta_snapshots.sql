-- 032_meta_snapshots.sql
-- Histórico de snapshots de campañas Meta en Smartlead.
-- Source: scripts/_snapshot_meta.py (en proyecto brevo) corre 2x/día (07:00 y 19:00 MX).
-- Consumer: prototipos/meta-reporte/MetaReportePage.tsx

create table if not exists public.meta_snapshots (
  id                    bigserial primary key,
  taken_at              timestamptz not null default now(),
  campaign_id           bigint not null,
  campaign_name         text not null,
  status                text not null,
  inbox_count           int,
  inbox_caps            int[],            -- caps individuales por buzón [15,20,20,...]
  daily_cap_inboxes     int,              -- sum(inbox_caps)
  daily_cap_campaign    int,              -- max_leads_per_day del campaign
  daily_cap_efectivo    int,              -- min(daily_cap_inboxes, daily_cap_campaign)
  daily_cap_target      int,              -- 9*20 = 180 — target verde
  total_leads           int,
  sequence_count        int,
  sent_total            int,
  sent_unique           int,
  opens_total           int,
  opens_unique          int,
  clicks_total          int,
  clicks_unique         int,
  replies               int,
  bounces               int,
  drafted               int,              -- queue pendiente
  notes                 text               -- observaciones humanas opcionales
);

create index if not exists meta_snapshots_taken_at_idx
  on public.meta_snapshots (taken_at desc);

create index if not exists meta_snapshots_campaign_taken_idx
  on public.meta_snapshots (campaign_id, taken_at desc);

-- RLS: read público (la anon key del tracker puede leer dashboards).
-- INSERT solo con service_role (el script Python).
alter table public.meta_snapshots enable row level security;

drop policy if exists meta_snapshots_read_anyone on public.meta_snapshots;
create policy meta_snapshots_read_anyone
  on public.meta_snapshots
  for select
  using (true);

-- (No policy for INSERT/UPDATE/DELETE → solo service_role bypasea RLS)

comment on table public.meta_snapshots is
  'Snapshots históricos de campañas Meta (Smartlead). Poblado por scripts/_snapshot_meta.py 2x/día.';

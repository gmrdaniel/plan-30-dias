-- 033_branch_events.sql
-- Captura eventos de Branch.io vía webhook (Activation Basics no expone API,
-- pero Settings → Integrations → Webhooks sí está disponible).
-- Insert por: edge function branch-webhook (service_role).
-- Read por: dashboard /meta-reporte (anon key, RLS read público).

create table if not exists public.branch_events (
  id                bigserial primary key,
  received_at       timestamptz not null default now(),
  event_timestamp   timestamptz,                  -- timestamp del evento en Branch
  event_type        text not null,                -- click | open | install | pageview | web_session_start | ...
  feature           text,                          -- ej. email_text_link
  campaign          text,                          -- ej. social_proof_ana
  channel           text,                          -- ej. smartlead
  tags              text[],                        -- ej. [smartlead, variant_T, step_3, ana, campaign_3217790]
  branch_link       text,                          -- short link, si está
  link_id           text,                          -- branch link_id si Branch lo manda
  os                text,                          -- ios | android | desktop | web
  browser           text,
  country           text,
  region            text,
  city              text,
  referrer          text,
  raw               jsonb not null                 -- payload completo para análisis posterior
);

create index if not exists branch_events_received_idx
  on public.branch_events (received_at desc);

create index if not exists branch_events_type_received_idx
  on public.branch_events (event_type, received_at desc);

create index if not exists branch_events_campaign_idx
  on public.branch_events (campaign, received_at desc) where campaign is not null;

alter table public.branch_events enable row level security;

drop policy if exists branch_events_read_anyone on public.branch_events;
create policy branch_events_read_anyone
  on public.branch_events
  for select
  using (true);

comment on table public.branch_events is
  'Eventos de Branch.io recibidos vía webhook. Cada click/open/install se inserta aquí en real-time.';

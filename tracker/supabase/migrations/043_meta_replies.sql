-- 043_meta_replies.sql
-- Replies recibidas en campañas Meta. Una fila por (campaign, lead, replied_at).
-- Source: /campaigns/{id}/statistics (reply_time + sequence_number + lead_id/email)
-- + /campaigns/{id}/leads/{lead_id}/message-history (subject + body del reply).
-- Insertada por _snapshot_meta.py cada 15min.
--
-- Sentiment se llena vía _classify_replies_sentiment.py (Claude Haiku) o por override
-- humano desde la UI. sentiment_source rastrea origen ('auto_haiku' | 'human_override' | 'error').

create table if not exists public.meta_replies (
  id                bigserial primary key,
  campaign_id       bigint not null,
  lead_id           bigint not null,
  lead_email        text not null,
  lead_name         text,
  step              int,                          -- sequence_number del reply (Smartlead)
  replied_at        timestamptz not null,
  subject           text,
  body_text         text,                          -- best-effort, puede ser null si message-history falla
  sentiment         text check (sentiment in ('interested','decline','out_of_office','unsubscribe_req','other')),
  sentiment_source  text check (sentiment_source in ('auto_haiku','human_override','error')),
  sentiment_at      timestamptz,
  recorded_at       timestamptz not null default now(),
  unique (campaign_id, lead_id, replied_at)
);

create index if not exists meta_replies_campaign_date_idx
  on public.meta_replies (campaign_id, replied_at desc);

create index if not exists meta_replies_pending_sentiment_idx
  on public.meta_replies (sentiment_at)
  where sentiment is null and body_text is not null;

alter table public.meta_replies enable row level security;

drop policy if exists meta_replies_read_anyone on public.meta_replies;
create policy meta_replies_read_anyone
  on public.meta_replies
  for select
  using (true);

drop policy if exists meta_replies_write_anyone on public.meta_replies;
create policy meta_replies_write_anyone
  on public.meta_replies
  for insert
  with check (true);

drop policy if exists meta_replies_update_anyone on public.meta_replies;
create policy meta_replies_update_anyone
  on public.meta_replies
  for update
  using (true)
  with check (true);

comment on table public.meta_replies is
  'Replies recibidas en campañas Meta. Source: Smartlead /statistics + /message-history. Sentiment vía Haiku auto o override humano.';

-- Add lead pipeline breakdown columns to meta_snapshots
-- Captures notStarted/inprogress/completed/blocked from /campaigns/{id}/analytics.campaign_lead_stats

ALTER TABLE public.meta_snapshots
  ADD COLUMN IF NOT EXISTS leads_total       integer,
  ADD COLUMN IF NOT EXISTS leads_not_started integer,
  ADD COLUMN IF NOT EXISTS leads_in_progress integer,
  ADD COLUMN IF NOT EXISTS leads_completed   integer,
  ADD COLUMN IF NOT EXISTS leads_blocked     integer;

COMMENT ON COLUMN public.meta_snapshots.leads_total       IS 'Total unique leads in campaign (campaign_lead_stats.total)';
COMMENT ON COLUMN public.meta_snapshots.leads_not_started IS 'Leads that have NOT received Step 1 yet — fuel gauge for new sends';
COMMENT ON COLUMN public.meta_snapshots.leads_in_progress IS 'Leads that received Step 1+, waiting for follow-ups';
COMMENT ON COLUMN public.meta_snapshots.leads_completed   IS 'Leads that received the entire sequence';
COMMENT ON COLUMN public.meta_snapshots.leads_blocked     IS 'Leads blocked (bounce, dedup, etc)';

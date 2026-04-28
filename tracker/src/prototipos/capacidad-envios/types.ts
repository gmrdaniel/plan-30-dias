export interface InboxSnapshot {
  id: number
  taken_at: string
  inbox_id: number
  from_email: string | null
  from_name: string | null
  pool: 'meta' | 'forms' | 'unknown'
  message_per_day: number | null
  warmup_status: string | null
  warmup_max_count: number | null
  warmup_min_count: number | null
  warmup_reputation: number | null
  warmup_started_at: string | null
  warmup_days: number | null
  total_sent_count: number | null
  total_spam_count: number | null
  is_warmup_blocked: boolean
  campaign_ids: number[] | null
}

export interface PoolSummary {
  pool: 'meta' | 'forms'
  inboxCount: number
  capDaily: number               // sum(message_per_day)
  warmupMax: number              // sum(warmup_max_count)
  reputationAvg: number
  warmupDaysAvg: number
  inboxes: InboxSnapshot[]
}

export interface MetaSnapshot {
  id: number
  taken_at: string
  campaign_id: number
  campaign_name: string
  status: string
  inbox_count: number | null
  inbox_caps: number[] | null
  daily_cap_inboxes: number | null
  daily_cap_campaign: number | null
  daily_cap_efectivo: number | null
  daily_cap_target: number | null
  total_leads: number | null
  sequence_count: number | null
  sent_total: number | null
  sent_unique: number | null
  opens_total: number | null
  opens_unique: number | null
  clicks_total: number | null
  clicks_unique: number | null
  replies: number | null
  bounces: number | null
  drafted: number | null
  notes: string | null
}

export interface CampaignDelta {
  campaign_id: number
  campaign_name: string
  status: string
  current: MetaSnapshot
  previous: MetaSnapshot | null
  deltaSentSinceLast: number
  deltaOpensSinceLast: number
  hoursSinceLast: number | null
}

export interface DailyAggregate {
  date: string                         // YYYY-MM-DD
  campaign_id: number
  campaign_name: string
  sentDelta: number                     // sends ese día
  capTarget: number                     // target del día (180)
  capEfectivo: number                   // cap real ese día
  pctOfTarget: number                   // sentDelta / 180 * 100
}

export type ColorBand = 'green' | 'amber' | 'red' | 'idle'

export interface BranchEvent {
  id: number
  received_at: string
  event_timestamp: string | null
  event_type: string
  feature: string | null
  campaign: string | null
  channel: string | null
  tags: string[] | null
  branch_link: string | null
  os: string | null
  country: string | null
  raw: unknown
}

export interface BranchDailyAgg {
  date: string                 // YYYY-MM-DD
  clicks: number
  opens: number
  installs: number
  other: number
}

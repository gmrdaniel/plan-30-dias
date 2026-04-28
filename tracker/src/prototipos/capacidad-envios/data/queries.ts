import { supabase } from '../../../lib/supabase'
import type { InboxSnapshot, PoolSummary } from '../types'

/** Latest snapshot per inbox_id. */
export async function fetchLatestInboxSnapshots(): Promise<InboxSnapshot[]> {
  const { data, error } = await supabase
    .from('inbox_snapshots')
    .select('*')
    .order('taken_at', { ascending: false })
    .limit(500)
  if (error) throw error
  // Dedupe: keep first occurrence per inbox_id (already sorted desc)
  const seen = new Set<number>()
  const result: InboxSnapshot[] = []
  for (const row of (data ?? []) as InboxSnapshot[]) {
    if (seen.has(row.inbox_id)) continue
    seen.add(row.inbox_id)
    result.push(row)
  }
  return result
}

export function summarizePool(rows: InboxSnapshot[], pool: 'meta' | 'forms'): PoolSummary {
  const inboxes = rows.filter((r) => r.pool === pool).sort((a, b) => (a.from_name ?? '').localeCompare(b.from_name ?? ''))
  const capDaily = inboxes.reduce((acc, r) => acc + (r.message_per_day ?? 0), 0)
  const warmupMax = inboxes.reduce((acc, r) => acc + (r.warmup_max_count ?? 0), 0)
  const repValid = inboxes.filter((r) => r.warmup_reputation != null)
  const reputationAvg = repValid.length
    ? repValid.reduce((acc, r) => acc + (r.warmup_reputation ?? 0), 0) / repValid.length
    : 0
  const dayValid = inboxes.filter((r) => r.warmup_days != null)
  const warmupDaysAvg = dayValid.length
    ? dayValid.reduce((acc, r) => acc + (r.warmup_days ?? 0), 0) / dayValid.length
    : 0
  return {
    pool,
    inboxCount: inboxes.length,
    capDaily,
    warmupMax,
    reputationAvg,
    warmupDaysAvg,
    inboxes,
  }
}

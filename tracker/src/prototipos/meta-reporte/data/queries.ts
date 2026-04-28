import { supabase } from '../../../lib/supabase'
import type { MetaSnapshot, CampaignDelta, DailyAggregate, ColorBand, BranchEvent, BranchDailyAgg } from '../types'

const META_CAMPAIGN_IDS = [3212141, 3217790]

export async function fetchSnapshots(limit = 500): Promise<MetaSnapshot[]> {
  const { data, error } = await supabase
    .from('meta_snapshots')
    .select('*')
    .in('campaign_id', META_CAMPAIGN_IDS)
    .order('taken_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as MetaSnapshot[]
}

/**
 * For each campaign, return the latest snapshot + immediately previous,
 * so we can compute "delta since last snapshot" for the dashboard hero.
 */
export function computeDeltas(snapshots: MetaSnapshot[]): CampaignDelta[] {
  const byCampaign = new Map<number, MetaSnapshot[]>()
  for (const s of snapshots) {
    const arr = byCampaign.get(s.campaign_id) ?? []
    arr.push(s)
    byCampaign.set(s.campaign_id, arr)
  }
  const result: CampaignDelta[] = []
  for (const [cid, arr] of byCampaign) {
    arr.sort((a, b) => b.taken_at.localeCompare(a.taken_at))
    const current = arr[0]
    const previous = arr[1] ?? null
    const deltaSent = (current.sent_total ?? 0) - (previous?.sent_total ?? 0)
    const deltaOpens = (current.opens_total ?? 0) - (previous?.opens_total ?? 0)
    const hours = previous
      ? (new Date(current.taken_at).getTime() - new Date(previous.taken_at).getTime()) / 36e5
      : null
    result.push({
      campaign_id: cid,
      campaign_name: current.campaign_name,
      status: current.status,
      current,
      previous,
      deltaSentSinceLast: Math.max(0, deltaSent),
      deltaOpensSinceLast: Math.max(0, deltaOpens),
      hoursSinceLast: hours,
    })
  }
  return result.sort((a, b) => a.campaign_id - b.campaign_id)
}

/**
 * Aggregate snapshots into "sends per day per campaign" by computing
 * the delta between the first and last snapshot of each calendar day.
 * If only one snapshot exists for a day, falls back to delta vs the previous day's last snap.
 */
export function buildDailyAggregates(snapshots: MetaSnapshot[]): DailyAggregate[] {
  const byCampaign = new Map<number, MetaSnapshot[]>()
  for (const s of snapshots) {
    const arr = byCampaign.get(s.campaign_id) ?? []
    arr.push(s)
    byCampaign.set(s.campaign_id, arr)
  }
  const out: DailyAggregate[] = []
  for (const [cid, arrUnsorted] of byCampaign) {
    const arr = [...arrUnsorted].sort((a, b) => a.taken_at.localeCompare(b.taken_at))
    const byDay = new Map<string, MetaSnapshot[]>()
    for (const s of arr) {
      const day = s.taken_at.slice(0, 10)
      const list = byDay.get(day) ?? []
      list.push(s)
      byDay.set(day, list)
    }
    const days = [...byDay.keys()].sort()
    let prevDayLast: MetaSnapshot | null = null
    for (const day of days) {
      const list = byDay.get(day)!
      const first = list[0]
      const last = list[list.length - 1]
      // baseline = ultimo snap del día anterior, o el primer snap del mismo día si no hay anterior
      const baseline = prevDayLast ?? first
      const sentDelta = Math.max(0, (last.sent_total ?? 0) - (baseline.sent_total ?? 0))
      const capTarget = last.daily_cap_target ?? 180
      const capEfectivo = last.daily_cap_efectivo ?? 0
      const pct = capTarget > 0 ? (sentDelta / capTarget) * 100 : 0
      out.push({
        date: day,
        campaign_id: cid,
        campaign_name: last.campaign_name,
        sentDelta,
        capTarget,
        capEfectivo,
        pctOfTarget: pct,
      })
      prevDayLast = last
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date) || a.campaign_id - b.campaign_id)
}

export function colorBand(pctOfTarget: number, status: string): ColorBand {
  if (status !== 'ACTIVE') return 'idle'
  if (pctOfTarget >= 90) return 'green'
  if (pctOfTarget >= 60) return 'amber'
  return 'red'
}

export async function fetchBranchEvents(limit = 5000): Promise<BranchEvent[]> {
  const { data, error } = await supabase
    .from('branch_events')
    .select('id, received_at, event_timestamp, event_type, feature, campaign, channel, tags, branch_link, os, country, raw')
    .order('received_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as BranchEvent[]
}

export function buildBranchDaily(events: BranchEvent[]): BranchDailyAgg[] {
  const byDate = new Map<string, BranchDailyAgg>()
  for (const e of events) {
    const ts = e.event_timestamp ?? e.received_at
    const date = ts.slice(0, 10)
    const cur = byDate.get(date) ?? { date, clicks: 0, opens: 0, installs: 0, other: 0 }
    const t = e.event_type.toLowerCase()
    if (t === 'click') cur.clicks++
    else if (t === 'open') cur.opens++
    else if (t === 'install') cur.installs++
    else cur.other++
    byDate.set(date, cur)
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date))
}

export function colorForBand(b: ColorBand): { bg: string; text: string; border: string; hex: string } {
  switch (b) {
    case 'green': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300', hex: '#10b981' }
    case 'amber': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300', hex: '#f59e0b' }
    case 'red':   return { bg: 'bg-rose-50',   text: 'text-rose-700',   border: 'border-rose-300',   hex: '#ef4444' }
    case 'idle':  return { bg: 'bg-slate-50',  text: 'text-slate-500',  border: 'border-slate-200',  hex: '#94a3b8' }
  }
}

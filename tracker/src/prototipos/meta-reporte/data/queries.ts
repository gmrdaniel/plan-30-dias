import { supabase } from '../../../lib/supabase'
import type { MetaSnapshot, CampaignDelta, DailyAggregate, ColorBand, BranchEvent, BranchDailyAgg, HourlySend, DailyStat } from '../types'

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
 * Aggregate snapshots into "sends per day per campaign".
 *
 * Prioridad de fuentes (de más a menos precisa):
 *   1. dailyStats (meta_daily_stats) — desde /campaigns/{id}/statistics, autoridad
 *   2. hourly (meta_hourly_sends) — desde CSVs descargados de Smartlead UI
 *   3. delta vs ultimo snap del día anterior
 *   4. sent_total del primer día (sin baseline) — aproximación
 */
export function buildDailyAggregates(
  snapshots: MetaSnapshot[],
  hourly: HourlySend[] = [],
  dailyStats: DailyStat[] = [],
): DailyAggregate[] {
  // 1. Index dailyStats: key = `${date}::${campaign_id}` → sent
  const dailyByKey = new Map<string, number>()
  for (const d of dailyStats) {
    if (d.step !== null) continue                 // solo totales del día
    dailyByKey.set(`${d.date}::${d.campaign_id}`, d.sent)
  }
  // 2. Index hourly
  const hourlyByKey = new Map<string, number>()
  for (const h of hourly) {
    const k = `${h.date}::${h.campaign_id}`
    hourlyByKey.set(k, (hourlyByKey.get(k) ?? 0) + (h.actual_sent ?? 0))
  }

  // Map de snapshot último por campaña para metadata (cap, status, name)
  const lastSnapByCampaign = new Map<number, MetaSnapshot>()
  for (const s of snapshots) {
    const prev = lastSnapByCampaign.get(s.campaign_id)
    if (!prev || s.taken_at > prev.taken_at) lastSnapByCampaign.set(s.campaign_id, s)
  }

  // Conjunto de (date, campaign_id) que tenemos que cubrir — union de todas las fuentes
  const keys = new Set<string>()
  for (const k of dailyByKey.keys()) keys.add(k)
  for (const k of hourlyByKey.keys()) keys.add(k)
  // Snapshots fallback
  const byCampaign = new Map<number, MetaSnapshot[]>()
  for (const s of snapshots) {
    const arr = byCampaign.get(s.campaign_id) ?? []
    arr.push(s)
    byCampaign.set(s.campaign_id, arr)
  }
  for (const [cid, arr] of byCampaign) {
    const days = new Set(arr.map((s) => s.taken_at.slice(0, 10)))
    for (const d of days) keys.add(`${d}::${cid}`)
  }

  const out: DailyAggregate[] = []
  for (const key of keys) {
    const [date, cidStr] = key.split('::')
    const cid = Number(cidStr)
    const lastSnap = lastSnapByCampaign.get(cid)
    const capTarget = lastSnap?.daily_cap_target ?? 180
    const capEfectivo = lastSnap?.daily_cap_efectivo ?? 0
    const campaignName = lastSnap?.campaign_name ?? `Campaign ${cid}`

    let sentDelta: number
    if (dailyByKey.has(key)) {
      sentDelta = dailyByKey.get(key)!
    } else if (hourlyByKey.has(key)) {
      sentDelta = hourlyByKey.get(key)!
    } else {
      // Fallback: delta entre snapshots
      const arr = (byCampaign.get(cid) ?? []).sort((a, b) => a.taken_at.localeCompare(b.taken_at))
      const dayList = arr.filter((s) => s.taken_at.slice(0, 10) === date)
      const prevDayList = arr.filter((s) => s.taken_at.slice(0, 10) < date)
      const prevDayLast = prevDayList[prevDayList.length - 1]
      const last = dayList[dayList.length - 1]
      if (last && prevDayLast) {
        sentDelta = Math.max(0, (last.sent_total ?? 0) - (prevDayLast.sent_total ?? 0))
      } else if (last) {
        sentDelta = last.sent_total ?? 0
      } else {
        sentDelta = 0
      }
    }
    const pct = capTarget > 0 ? (sentDelta / capTarget) * 100 : 0
    out.push({
      date, campaign_id: cid, campaign_name: campaignName,
      sentDelta, capTarget, capEfectivo, pctOfTarget: pct,
    })
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

export async function fetchDailyStats(campaignIds: number[]): Promise<DailyStat[]> {
  if (campaignIds.length === 0) return []
  const { data, error } = await supabase
    .from('meta_daily_stats')
    .select('*')
    .in('campaign_id', campaignIds)
    .is('step', null)         // solo totales del día (step NULL)
    .order('date', { ascending: true })
  if (error) throw error
  return (data ?? []) as DailyStat[]
}

export async function fetchHourlySends(campaignIds: number[]): Promise<HourlySend[]> {
  if (campaignIds.length === 0) return []
  const { data, error } = await supabase
    .from('meta_hourly_sends')
    .select('*')
    .in('campaign_id', campaignIds)
    .order('date', { ascending: false })
    .order('hour_start', { ascending: true })
  if (error) throw error
  return (data ?? []) as HourlySend[]
}

export function colorForBand(b: ColorBand): { bg: string; text: string; border: string; hex: string } {
  switch (b) {
    case 'green': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300', hex: '#10b981' }
    case 'amber': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300', hex: '#f59e0b' }
    case 'red':   return { bg: 'bg-rose-50',   text: 'text-rose-700',   border: 'border-rose-300',   hex: '#ef4444' }
    case 'idle':  return { bg: 'bg-slate-50',  text: 'text-slate-500',  border: 'border-slate-200',  hex: '#94a3b8' }
  }
}

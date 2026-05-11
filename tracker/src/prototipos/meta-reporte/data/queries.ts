import { supabase } from '../../../lib/supabase'
import type { MetaSnapshot, CampaignDelta, DailyAggregate, ColorBand, BranchEvent, BranchDailyAgg, BranchDeviceSnapshot, BranchLinkStat, BranchClickDaily, BranchClickBreakdown, HourlySend, DailyStat, MetaSignup, MetaReply, ReplySentiment, SequenceVersion } from '../types'

/** TZ canónica para todas las agregaciones diarias del dashboard. */
export const LOCAL_TZ = 'America/Mexico_City'

const DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: LOCAL_TZ, year: 'numeric', month: '2-digit', day: '2-digit',
})

/** ISO timestamp → 'YYYY-MM-DD' en MX TZ (no UTC). */
export function localDate(iso: string): string {
  return DATE_FORMATTER.format(new Date(iso))
}

export const META_CAMPAIGN_IDS = [3212141, 3217790]
export const FORMULARIO_CAMPAIGN_IDS = [3213557, 3213796, 3224154, 3224156]

/**
 * Fetch snapshots for a specific set of campaign IDs.
 * @param campaignIds  IDs to filter to
 * @param limit  default 500
 */
export async function fetchSnapshots(
  campaignIds: number[] = META_CAMPAIGN_IDS,
  limit = 500,
): Promise<MetaSnapshot[]> {
  const { data, error } = await supabase
    .from('meta_snapshots')
    .select('*')
    .in('campaign_id', campaignIds)
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
    const days = new Set(arr.map((s) => localDate(s.taken_at)))
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

    let sentDelta: number | null
    if (dailyByKey.has(key)) {
      sentDelta = dailyByKey.get(key)!
    } else if (hourlyByKey.has(key)) {
      sentDelta = hourlyByKey.get(key)!
    } else {
      // Fallback: delta entre snapshots consecutivos del día.
      // SOLO confiable cuando tenemos baseline del día anterior — sin baseline,
      // antes este path usaba `last.sent_total` (cumulative desde origen de la
      // campaña) como si fuera el delta diario, lo que disparaba barras enormes
      // en el primer día del fetch (e.g. 3,111 en 5/10 con limit=200). Mejor saltar
      // la entry y dejar que la fuente autoritativa (meta_daily_stats) la llene cuando
      // el snapshot script corra.
      const arr = (byCampaign.get(cid) ?? []).sort((a, b) => a.taken_at.localeCompare(b.taken_at))
      const dayList = arr.filter((s) => localDate(s.taken_at) === date)
      const prevDayList = arr.filter((s) => localDate(s.taken_at) < date)
      const prevDayLast = prevDayList[prevDayList.length - 1]
      const last = dayList[dayList.length - 1]
      if (last && prevDayLast) {
        sentDelta = Math.max(0, (last.sent_total ?? 0) - (prevDayLast.sent_total ?? 0))
      } else {
        sentDelta = null
      }
    }
    if (sentDelta === null) continue
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
    const date = localDate(ts)
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

export async function fetchSequenceVersions(campaignIds: number[]): Promise<SequenceVersion[]> {
  if (campaignIds.length === 0) return []
  const { data, error } = await supabase
    .from('meta_sequence_versions')
    .select('*')
    .in('campaign_id', campaignIds)
    .order('smartlead_updated_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as SequenceVersion[]
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

/**
 * Trae todos los snapshots manuales de clicks por Branch link.
 * Se devuelven ordenados por (alias, snapshot_date desc) para que el caller
 * pueda quedarse con el primer match por alias = "último conocido".
 */
export async function fetchBranchLinkStats(): Promise<BranchLinkStat[]> {
  const { data, error } = await supabase
    .from('branch_link_stats')
    .select('*')
    .order('alias', { ascending: true })
    .order('snapshot_date', { ascending: false })
  if (error) throw error
  return (data ?? []) as BranchLinkStat[]
}

/**
 * Upsert de un snapshot manual (alias, snapshot_date) → clicks.
 * Re-corrida en el mismo día sobreescribe.
 */
export async function upsertBranchLinkStat(
  row: { alias: string; snapshot_date: string; clicks: number; campaign?: string | null; notes?: string | null; recorded_by?: string | null },
): Promise<void> {
  const { error } = await supabase
    .from('branch_link_stats')
    .upsert(
      {
        alias: row.alias,
        snapshot_date: row.snapshot_date,
        clicks: row.clicks,
        campaign: row.campaign ?? null,
        notes: row.notes ?? null,
        recorded_by: row.recorded_by ?? null,
      },
      { onConflict: 'alias,snapshot_date' },
    )
  if (error) throw error
}

/**
 * Snapshot más reciente del device breakdown (OS distribution) de Branch.
 * Devuelve null si tabla vacía.
 */
export async function fetchLatestBranchDeviceSnapshot(): Promise<BranchDeviceSnapshot | null> {
  const { data, error } = await supabase
    .from('branch_device_snapshots')
    .select('*')
    .order('snapshot_date', { ascending: false })
    .limit(1)
  if (error) throw error
  return (data?.[0] as BranchDeviceSnapshot) ?? null
}

export async function upsertBranchDeviceSnapshot(
  row: { snapshot_date: string; device_breakdown: Record<string, number>; source_pdf?: string | null; notes?: string | null; recorded_by?: string | null },
): Promise<void> {
  const { error } = await supabase
    .from('branch_device_snapshots')
    .upsert(
      {
        snapshot_date: row.snapshot_date,
        device_breakdown: row.device_breakdown,
        source_pdf: row.source_pdf ?? null,
        notes: row.notes ?? null,
        recorded_by: row.recorded_by ?? null,
      },
      { onConflict: 'snapshot_date' },
    )
  if (error) throw error
}

/**
 * Trae signups Meta con fecha de aceptación dentro del rango.
 * Si la tabla está vacía (Excel no cargado), devuelve [] sin error.
 */
export async function fetchMetaSignups(fromDate?: string, toDate?: string): Promise<MetaSignup[]> {
  let q = supabase
    .from('meta_signups')
    .select('*')
    .order('accepted_at', { ascending: false })
  if (fromDate) q = q.gte('accepted_at', fromDate)
  if (toDate)   q = q.lte('accepted_at', toDate)
  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as MetaSignup[]
}

/**
 * Trae replies recibidos en las campañas dadas, optionally desde una fecha.
 * Devuelve ordenados por replied_at desc (más recientes primero).
 */
export async function fetchReplies(
  campaignIds: number[],
  fromIso?: string,
): Promise<MetaReply[]> {
  if (campaignIds.length === 0) return []
  let q = supabase
    .from('meta_replies')
    .select('*')
    .in('campaign_id', campaignIds)
    .order('replied_at', { ascending: false })
  if (fromIso) q = q.gte('replied_at', fromIso)
  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as MetaReply[]
}

/**
 * Override humano del sentiment de un reply. Marca sentiment_source='human_override'
 * + sentiment_at=now para auditoría. La UI usa esto desde el modal de detalle.
 */
export async function updateReplySentiment(id: number, sentiment: ReplySentiment): Promise<void> {
  const { error } = await supabase
    .from('meta_replies')
    .update({
      sentiment,
      sentiment_source: 'human_override',
      sentiment_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) throw error
}

/** Time-series de clicks por día por alias Branch (source: Daily CSV importado). */
export async function fetchBranchClicksDaily(aliases?: string[]): Promise<BranchClickDaily[]> {
  let q = supabase
    .from('branch_clicks_daily')
    .select('*')
    .order('click_date', { ascending: true })
  if (aliases && aliases.length > 0) q = q.in('alias', aliases)
  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as BranchClickDaily[]
}

/** Breakdowns dimensionales (OS/browser/platform/referrer) por alias Branch. */
export async function fetchBranchClicksBreakdown(aliases?: string[]): Promise<BranchClickBreakdown[]> {
  let q = supabase
    .from('branch_clicks_breakdown')
    .select('*')
    .order('clicks', { ascending: false })
  if (aliases && aliases.length > 0) q = q.in('alias', aliases)
  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as BranchClickBreakdown[]
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

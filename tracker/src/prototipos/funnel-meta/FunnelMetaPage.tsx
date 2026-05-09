import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  buildDailyAggregates,
  computeDeltas,
  fetchBranchLinkStats,
  fetchDailyStats,
  fetchHourlySends,
  fetchMetaSignups,
  fetchSnapshots,
  META_CAMPAIGN_IDS,
  localDate,
} from '../meta-reporte/data/queries'
import type {
  BranchLinkStat,
  DailyStat,
  HourlySend,
  MetaSignup,
  MetaSnapshot,
} from '../meta-reporte/types'
import CapComplianceCard from '../meta-reporte/components/CapComplianceCard'
import DailySendsChart from '../meta-reporte/components/DailySendsChart'
import OpensChart from '../meta-reporte/components/OpensChart'
import HeroMetrics from './components/HeroMetrics'
import FunnelChart from './components/FunnelChart'
import DesktopFinding from './components/DesktopFinding'
import ConversionTrend from './components/ConversionTrend'
import DeviceBreakdown from './components/DeviceBreakdown'
import EmptySignupsBanner from './components/EmptySignupsBanner'

type Period = 7 | 30 | 90

function dateNDaysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

export default function FunnelMetaPage() {
  const [period, setPeriod] = useState<Period>(7)
  const [snapshots, setSnapshots] = useState<MetaSnapshot[]>([])
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([])
  const [linkStats, setLinkStats] = useState<BranchLinkStat[]>([])
  const [signups, setSignups] = useState<MetaSignup[]>([])
  const [hourly, setHourly] = useState<HourlySend[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load all data
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      fetchSnapshots(META_CAMPAIGN_IDS, 200),
      fetchDailyStats(META_CAMPAIGN_IDS),
      fetchBranchLinkStats(),
      fetchMetaSignups(dateNDaysAgo(period * 2)),  // pull doble del periodo para comparativa
      fetchHourlySends(META_CAMPAIGN_IDS),
    ])
      .then(([s, ds, ls, sg, h]) => {
        if (cancelled) return
        setSnapshots(s)
        setDailyStats(ds)
        setLinkStats(ls)
        setSignups(sg)
        setHourly(h)
      })
      .catch((e) => { if (!cancelled) setError(String(e?.message ?? e)) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [period])

  // Compute periods
  const fromCurrent = dateNDaysAgo(period)
  const fromPrevious = dateNDaysAgo(period * 2)

  // L1 + L2 + Smartlead clicks from daily stats
  const { sentCurrent, sentPrev, opensCurrent, opensPrev, clicksSmartleadCurrent, clicksSmartleadPrev } = useMemo(() => {
    let sc = 0, sp = 0, oc = 0, op = 0, csc = 0, csp = 0
    for (const d of dailyStats) {
      if (d.step !== null) continue
      if (d.date >= fromCurrent) {
        sc += d.sent; oc += d.opens; csc += d.clicks
      } else if (d.date >= fromPrevious) {
        sp += d.sent; op += d.opens; csp += d.clicks
      }
    }
    return { sentCurrent: sc, sentPrev: sp, opensCurrent: oc, opensPrev: op, clicksSmartleadCurrent: csc, clicksSmartleadPrev: csp }
  }, [dailyStats, fromCurrent, fromPrevious])

  // L3 — clicks: usamos el snapshot más reciente por alias y restamos el snapshot
  // de hace `period` días si existe. Cuando no hay snapshot previo, se reporta total acumulado.
  const { clicksCurrent, clicksPrev, totalClicksAccum } = useMemo(() => {
    const latestByAlias = new Map<string, BranchLinkStat>()
    const previousByAlias = new Map<string, BranchLinkStat>()
    const cutoffCurrent = fromCurrent  // 7d ago
    const cutoffPrevious = fromPrevious  // 14d ago

    for (const s of linkStats) {
      const key = s.alias
      if (!latestByAlias.has(key) || s.snapshot_date > latestByAlias.get(key)!.snapshot_date) {
        latestByAlias.set(key, s)
      }
      // baseline: el snapshot más antiguo dentro del cutoff de previous
      if (s.snapshot_date <= cutoffCurrent && s.snapshot_date >= cutoffPrevious) {
        if (!previousByAlias.has(key) || s.snapshot_date < previousByAlias.get(key)!.snapshot_date) {
          previousByAlias.set(key, s)
        }
      }
    }
    let cc = 0, cp = 0, total = 0
    for (const [alias, latest] of latestByAlias) {
      total += latest.clicks
      const baseline = previousByAlias.get(alias)
      if (baseline) {
        cc += Math.max(0, latest.clicks - baseline.clicks)
        cp += baseline.clicks   // proxy: clicks acumulados al inicio del periodo
      } else {
        // No hay baseline → fallback: asumir que TODO el clicks count cae en el periodo actual.
        cc += latest.clicks
      }
    }
    return { clicksCurrent: cc, clicksPrev: cp, totalClicksAccum: total }
  }, [linkStats, fromCurrent, fromPrevious])

  // L4 — signups
  const { signupsCurrent, signupsPrev } = useMemo(() => {
    let sc = 0, sp = 0
    for (const s of signups) {
      if (s.accepted_at >= fromCurrent) sc++
      else if (s.accepted_at >= fromPrevious) sp++
    }
    return { signupsCurrent: sc, signupsPrev: sp }
  }, [signups, fromCurrent, fromPrevious])

  // Trend lines per day (current period)
  const dailyTrend = useMemo(() => {
    const map = new Map<string, { date: string; sent: number; opens: number; signups: number }>()
    for (const d of dailyStats) {
      if (d.step !== null) continue
      if (d.date < fromCurrent) continue
      const cur = map.get(d.date) ?? { date: d.date, sent: 0, opens: 0, signups: 0 }
      cur.sent += d.sent
      cur.opens += d.opens
      map.set(d.date, cur)
    }
    for (const s of signups) {
      if (s.accepted_at < fromCurrent) continue
      const cur = map.get(s.accepted_at) ?? { date: s.accepted_at, sent: 0, opens: 0, signups: 0 }
      cur.signups++
      map.set(s.accepted_at, cur)
    }
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date))
  }, [dailyStats, signups, fromCurrent])

  // Aggregates + status para los 3 cards reutilizados de /meta-reporte.
  // Filtrados por el periodo seleccionado para coherencia con el header.
  const aggregates = useMemo(
    () => buildDailyAggregates(snapshots, hourly, dailyStats),
    [snapshots, hourly, dailyStats],
  )
  const filteredAggregates = useMemo(
    () => aggregates.filter((a) => a.date >= fromCurrent),
    [aggregates, fromCurrent],
  )
  const filteredDailyStats = useMemo(
    () => dailyStats.filter((d) => d.date >= fromCurrent),
    [dailyStats, fromCurrent],
  )
  const statusMap = useMemo(() => {
    const map: Record<number, string> = {}
    for (const d of computeDeltas(snapshots)) map[d.campaign_id] = d.status
    return map
  }, [snapshots])

  const lastSnapAt = snapshots[0]?.taken_at ? localDate(snapshots[0].taken_at) : null

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-slate-900">
      <nav className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 md:px-8 py-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="inline-block w-8 h-8 rounded-lg bg-[#10B981]" />
          <div>
            <p className="font-bold text-slate-900 text-sm leading-tight">Funnel Meta — conversión cold</p>
            <p className="text-xs text-slate-500 leading-tight">
              Sent → Opens → Clicks → Registros · {lastSnapAt ?? '—'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="flex rounded-lg bg-slate-100 p-1 gap-1">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setPeriod(d as Period)}
                className={`px-3 py-1 rounded font-semibold transition-colors ${
                  period === d ? 'bg-white text-[#10B981] shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
          <Link to="/meta-reporte" className="text-slate-500 hover:text-[#10B981] px-2">Operacional →</Link>
          <Link to="/" className="text-slate-500 hover:text-[#10B981] px-2">← Tracker</Link>
        </div>
      </nav>

      {error && (
        <div className="max-w-6xl mx-auto px-4 md:px-8 mt-6">
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <p className="font-bold">Error cargando data</p>
            <p className="font-mono text-xs mt-1">{error}</p>
          </div>
        </div>
      )}

      {loading && !error ? (
        <div className="max-w-6xl mx-auto px-4 md:px-8 mt-12 text-slate-400 text-sm">Cargando funnel…</div>
      ) : (
        <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-6">
          <HeroMetrics
            sentCurrent={sentCurrent}
            opensCurrent={opensCurrent}
            clicksCurrent={clicksCurrent + clicksSmartleadCurrent}
            signupsCurrent={signupsCurrent}
            sentPrev={sentPrev}
            opensPrev={opensPrev}
            clicksPrev={clicksPrev + clicksSmartleadPrev}
            signupsPrev={signupsPrev}
            period={period}
          />

          {signups.length === 0 && <EmptySignupsBanner />}

          <FunnelChart
            sent={sentCurrent}
            opens={opensCurrent}
            clicks={clicksCurrent + clicksSmartleadCurrent}
            clicksBranch={clicksCurrent}
            clicksSmartlead={clicksSmartleadCurrent}
            signups={signupsCurrent}
            period={period}
          />

          <DesktopFinding clicks={clicksCurrent + clicksSmartleadCurrent} signups={signupsCurrent} />

          {/* ---- Cards reutilizados de /meta-reporte ---- */}
          <CapComplianceCard aggregates={filteredAggregates} status={statusMap} />
          <DailySendsChart aggregates={filteredAggregates} status={statusMap} />
          <OpensChart dailyStats={filteredDailyStats} snapshots={snapshots} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ConversionTrend data={dailyTrend} />
            </div>
            <DeviceBreakdown />
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
            <p className="font-semibold text-slate-700 mb-1">Notas sobre la data</p>
            <ul className="list-disc list-inside space-y-1">
              <li><b>L1 (Sent) y L2 (Opens):</b> agregados desde <code className="bg-white px-1 rounded">meta_daily_stats</code> sumando todas las campañas Meta (3212141 + 3217790).</li>
              <li><b>L3 (Clicks Branch):</b> diferencial entre el snapshot más reciente y el del inicio del período en <code className="bg-white px-1 rounded">branch_link_stats</code>. Si no hay snapshot baseline, se asume que todo el acumulado cae en el período (sobreestima).</li>
              <li><b>L4 (Registros):</b> conteo desde <code className="bg-white px-1 rounded">meta_signups</code>. Para alimentar esta tabla: drop el Excel de Meta en <code className="bg-white px-1 rounded">meta-signups/inbox/</code> y corre <code className="bg-white px-1 rounded">python scripts/_import_meta_signups.py</code>.</li>
              <li><b>Total acumulado clicks:</b> {totalClicksAccum} (todas las campañas, todos los tiempos).</li>
            </ul>
          </div>
        </main>
      )}
    </div>
  )
}

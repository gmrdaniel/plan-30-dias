import { useEffect, useState } from 'react'
import { fetchBranchClicksBreakdown, fetchBranchClicksDaily } from '../data/queries'
import type { BranchClickBreakdown, BranchClickDaily, BranchEvent, DailyStat, MetaSnapshot } from '../types'
import BranchClicksOverview from './BranchClicksOverview'
import BranchClicksDailyChart from './BranchClicksDailyChart'
import BranchClicksOSChart from './BranchClicksOSChart'
import BranchClicksBreakdownTable from './BranchClicksBreakdownTable'
import BranchBotsCallout from './BranchBotsCallout'
import BranchEventsChart from './BranchEventsChart'
import BranchVsSmartleadCompare from './BranchVsSmartleadCompare'
import BranchClicksAdmin from './BranchClicksAdmin'

interface Props {
  branchEvents: BranchEvent[]
  branchDaily: { date: string; clicks: number; opens: number; installs: number; other: number }[]
  snapshots: MetaSnapshot[]
  dailyStats: DailyStat[]
  branchStatsRefreshKey: number
  onBranchStatsSaved: () => void
  refreshAt: number
}

const ANA_ALIASES = ['apply-fast-track-ana', 'friction-removal-ana', 'social-proof-ana', 'last-chance-meta']

export default function ClicksAnalysisTab({
  branchEvents,
  branchDaily,
  snapshots,
  dailyStats,
  branchStatsRefreshKey,
  onBranchStatsSaved,
  refreshAt,
}: Props) {
  const [daily, setDaily] = useState<BranchClickDaily[]>([])
  const [breakdowns, setBreakdowns] = useState<BranchClickBreakdown[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      fetchBranchClicksDaily(ANA_ALIASES),
      fetchBranchClicksBreakdown(ANA_ALIASES),
    ])
      .then(([d, b]) => {
        if (cancelled) return
        setDaily(d)
        setBreakdowns(b)
      })
      .catch((e) => { if (!cancelled) setError(String(e?.message ?? e)) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [refreshAt])

  if (loading) {
    return <div className="text-sm text-slate-400">Cargando análisis Branch…</div>
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <p className="font-bold">Error cargando data Branch</p>
          <p className="font-mono text-xs mt-1">{error}</p>
          <p className="text-xs mt-2">
            ¿Aplicaste la migración <code className="bg-white px-1 rounded">044_branch_clicks_dimensional.sql</code>?
            Después corre <code className="bg-white px-1 rounded">python scripts/_import_branch_csvs.py</code>.
          </p>
        </div>
      )}

      <BranchBotsCallout breakdowns={breakdowns} />
      <BranchClicksOverview daily={daily} breakdowns={breakdowns} />
      <BranchClicksDailyChart daily={daily} />
      <BranchClicksOSChart breakdowns={breakdowns} />
      <BranchClicksBreakdownTable breakdowns={breakdowns} />

      {/* Widgets Branch preexistentes — movidos aquí desde el tab Funnel */}
      <BranchEventsChart events={branchEvents} daily={branchDaily} />
      <BranchVsSmartleadCompare snapshots={snapshots} dailyStats={dailyStats} refreshKey={branchStatsRefreshKey} />
      <BranchClicksAdmin onSaved={onBranchStatsSaved} />
    </div>
  )
}

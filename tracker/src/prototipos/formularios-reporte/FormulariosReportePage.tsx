import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import FormulariosHero from './components/FormulariosHero'
import CampaignsComparison from './components/CampaignsComparison'
import CampaignFilter from '../meta-reporte/components/CampaignFilter'
import CapComplianceCard from '../meta-reporte/components/CapComplianceCard'
import DailySendsChart from '../meta-reporte/components/DailySendsChart'
import OpensChart from '../meta-reporte/components/OpensChart'
import HourlySendsChart from '../meta-reporte/components/HourlySendsChart'
import CumulativeSendsChart from '../meta-reporte/components/CumulativeSendsChart'
import BranchEventsChart from '../meta-reporte/components/BranchEventsChart'
import SnapshotsTable from '../meta-reporte/components/SnapshotsTable'
import {
  FORMULARIO_CAMPAIGN_IDS,
  buildBranchDaily, buildDailyAggregates, computeDeltas,
  fetchBranchEvents, fetchDailyStats, fetchHourlySends, fetchSnapshots,
} from '../meta-reporte/data/queries'
import type { BranchEvent, DailyStat, HourlySend, MetaSnapshot } from '../meta-reporte/types'

function fmtTs(ts: string | null): string | null {
  if (!ts) return null
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function FormulariosReportePage() {
  const [snapshots, setSnapshots] = useState<MetaSnapshot[] | null>(null)
  const [branchEvents, setBranchEvents] = useState<BranchEvent[]>([])
  const [hourly, setHourly] = useState<HourlySend[]>([])
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([])
  const [error, setError] = useState<string | null>(null)
  const [refreshAt, setRefreshAt] = useState(Date.now())
  const [selectedIds, setSelectedIds] = useState<number[] | null>(null)

  useEffect(() => {
    let cancelled = false
    setSnapshots(null)
    setError(null)
    fetchSnapshots(FORMULARIO_CAMPAIGN_IDS)
      .then((rows) => {
        if (cancelled) return
        setSnapshots(rows)
        const lastByCampaign = new Map<number, MetaSnapshot>()
        for (const s of rows) {
          const prev = lastByCampaign.get(s.campaign_id)
          if (!prev || s.taken_at > prev.taken_at) lastByCampaign.set(s.campaign_id, s)
        }
        const activeIds = [...lastByCampaign.values()]
          .filter((s) => s.status === 'ACTIVE')
          .map((s) => s.campaign_id)
          .sort((a, b) => a - b)
        const allIds = [...lastByCampaign.keys()].sort((a, b) => a - b)
        setSelectedIds(activeIds.length > 0 ? activeIds : allIds)
      })
      .catch((e) => { if (!cancelled) setError(String(e?.message ?? e)) })

    fetchBranchEvents()
      .then((rows) => { if (!cancelled) setBranchEvents(rows) })
      .catch((e) => console.warn('branch events fetch failed:', e))

    return () => { cancelled = true }
  }, [refreshAt])

  useEffect(() => {
    if (!selectedIds || selectedIds.length === 0) {
      setHourly([]); setDailyStats([])
      return
    }
    let cancelled = false
    fetchHourlySends(selectedIds)
      .then((rows) => { if (!cancelled) setHourly(rows) })
      .catch((e) => console.warn('hourly fetch failed:', e))
    fetchDailyStats(selectedIds)
      .then((rows) => { if (!cancelled) setDailyStats(rows) })
      .catch((e) => console.warn('daily stats fetch failed:', e))
    return () => { cancelled = true }
  }, [selectedIds, refreshAt])

  const branchDaily = useMemo(() => buildBranchDaily(branchEvents), [branchEvents])

  const filtered = useMemo(() => {
    if (!snapshots || !selectedIds) return []
    if (selectedIds.length === 0) return []
    return snapshots.filter((s) => selectedIds.includes(s.campaign_id))
  }, [snapshots, selectedIds])

  const deltas = useMemo(() => computeDeltas(filtered), [filtered])
  const aggregates = useMemo(
    () => buildDailyAggregates(filtered, hourly, dailyStats),
    [filtered, hourly, dailyStats],
  )
  const statusMap = useMemo(() => {
    const map: Record<number, string> = {}
    for (const d of deltas) map[d.campaign_id] = d.status
    return map
  }, [deltas])

  const lastTs = filtered.length > 0 ? fmtTs(filtered[0].taken_at) : null
  const noneSelected = selectedIds !== null && selectedIds.length === 0

  return (
    <div className="ma-root min-h-screen bg-[#F8F9FB] text-slate-900">
      <nav className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-block w-8 h-8 rounded-lg bg-emerald-600" />
          <div>
            <p className="font-bold text-slate-900 text-sm leading-tight">Formularios Reporte — campañas warm</p>
            <p className="text-xs text-slate-500 leading-tight">Audiencias que llenaron formulario · OR / Reply rate / Bounce</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/meta-reporte" className="text-xs text-slate-500 hover:text-[#0F52BA] inline-flex items-center gap-1 px-3 py-1.5 rounded border border-slate-200 hover:border-[#0F52BA] transition-colors">
            → Meta
          </Link>
          <button
            onClick={() => setRefreshAt(Date.now())}
            className="text-xs text-slate-500 hover:text-emerald-600 inline-flex items-center gap-1 px-3 py-1.5 rounded border border-slate-200 hover:border-emerald-500 transition-colors"
          >↻ Refresh</button>
          <Link to="/" className="text-xs text-slate-500 hover:text-emerald-600">← Tracker</Link>
        </div>
      </nav>

      {snapshots && snapshots.length > 0 && selectedIds !== null && (
        <CampaignFilter
          snapshots={snapshots}
          selected={selectedIds}
          onChange={setSelectedIds}
          storageKey="formularios-reporte-filter"
        />
      )}

      {error && (
        <div className="max-w-6xl mx-auto px-4 md:px-8 mt-6">
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <p className="font-bold">Error cargando snapshots</p>
            <p className="font-mono text-xs mt-1">{error}</p>
          </div>
        </div>
      )}

      {snapshots === null && !error ? (
        <div className="max-w-6xl mx-auto px-4 md:px-8 mt-12 text-slate-400 text-sm">Cargando snapshots…</div>
      ) : snapshots && snapshots.length === 0 ? (
        <div className="max-w-6xl mx-auto px-4 md:px-8 mt-12">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
            <p className="text-base font-bold text-amber-900">Sin snapshots para formularios todavía</p>
            <p className="text-sm text-amber-800 mt-2">Corre el script:</p>
            <code className="inline-block mt-3 bg-white px-3 py-2 rounded font-mono text-xs">
              python D:\CRM\brevo\plan-implementacion-abril-2026\scripts\_snapshot_meta.py
            </code>
          </div>
        </div>
      ) : noneSelected ? (
        <div className="max-w-6xl mx-auto px-4 md:px-8 mt-12">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
            <p className="text-base font-bold text-slate-700">Sin campañas seleccionadas</p>
            <p className="text-sm text-slate-500 mt-2">Activa al menos una en los chips de arriba.</p>
          </div>
        </div>
      ) : snapshots && (
        <>
          <FormulariosHero deltas={deltas} lastSnapshotAt={lastTs} />
          <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-6">
            <CapComplianceCard aggregates={aggregates} status={statusMap} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DailySendsChart aggregates={aggregates} status={statusMap} />
              <OpensChart dailyStats={dailyStats} snapshots={filtered} />
            </div>
            <HourlySendsChart rows={hourly} />
            <CampaignsComparison deltas={deltas} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BranchEventsChart events={branchEvents} daily={branchDaily} />
              <CumulativeSendsChart snapshots={filtered} />
            </div>
            <SnapshotsTable snapshots={filtered} />

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
              <p className="font-semibold text-slate-700 mb-1">Cómo se actualiza este dashboard</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Snapshots automáticos: 07:00 y 19:00 MX (cron pendiente)</li>
                <li>Manual: <code className="bg-white px-1 rounded">python _snapshot_meta.py</code> incluye Meta + las 4 forms</li>
                <li>Cap diario 180 es <strong>compartido</strong> con campañas Meta (mismos 9 inboxes)</li>
              </ul>
            </div>
          </main>
        </>
      )}
    </div>
  )
}

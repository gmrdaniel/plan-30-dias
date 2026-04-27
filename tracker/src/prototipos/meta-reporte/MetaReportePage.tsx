import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import HeaderHero from './components/HeaderHero'
import DailySendsChart from './components/DailySendsChart'
import BurndownChart from './components/BurndownChart'
import SnapshotsTable from './components/SnapshotsTable'
import CapComplianceCard from './components/CapComplianceCard'
import { buildDailyAggregates, computeDeltas, fetchSnapshots } from './data/queries'
import type { MetaSnapshot } from './types'

function fmtTs(ts: string | null): string | null {
  if (!ts) return null
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function MetaReportePage() {
  const [snapshots, setSnapshots] = useState<MetaSnapshot[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshAt, setRefreshAt] = useState(Date.now())

  useEffect(() => {
    let cancelled = false
    setSnapshots(null)
    setError(null)
    fetchSnapshots()
      .then((rows) => { if (!cancelled) setSnapshots(rows) })
      .catch((e) => { if (!cancelled) setError(String(e?.message ?? e)) })
    return () => { cancelled = true }
  }, [refreshAt])

  const deltas = useMemo(() => snapshots ? computeDeltas(snapshots) : [], [snapshots])
  const aggregates = useMemo(() => snapshots ? buildDailyAggregates(snapshots) : [], [snapshots])
  const statusMap = useMemo(() => {
    const map: Record<number, string> = {}
    for (const d of deltas) map[d.campaign_id] = d.status
    return map
  }, [deltas])

  const lastTs = snapshots && snapshots.length > 0 ? fmtTs(snapshots[0].taken_at) : null

  return (
    <div className="ma-root min-h-screen bg-[#F8F9FB] text-slate-900">
      <nav className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-block w-8 h-8 rounded-lg bg-[#0F52BA]" />
          <div>
            <p className="font-bold text-slate-900 text-sm leading-tight">Meta Reporte — campañas Smartlead</p>
            <p className="text-xs text-slate-500 leading-tight">Snapshots 07:00 / 19:00 MX · histórico + proyección</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setRefreshAt(Date.now())}
            className="text-xs text-slate-500 hover:text-[#0F52BA] inline-flex items-center gap-1 px-3 py-1.5 rounded border border-slate-200 hover:border-[#0F52BA] transition-colors"
          >
            ↻ Refresh
          </button>
          <Link to="/" className="text-xs text-slate-500 hover:text-[#0F52BA]">← Tracker</Link>
        </div>
      </nav>

      {error && (
        <div className="max-w-6xl mx-auto px-4 md:px-8 mt-6">
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <p className="font-bold">Error cargando snapshots</p>
            <p className="font-mono text-xs mt-1">{error}</p>
            <p className="mt-2 text-xs">¿Aplicaste la migración <code className="bg-white px-1 rounded">032_meta_snapshots.sql</code> en Supabase? ¿Hay al menos un snapshot insertado?</p>
          </div>
        </div>
      )}

      {snapshots === null && !error ? (
        <div className="max-w-6xl mx-auto px-4 md:px-8 mt-12 text-slate-400 text-sm">Cargando snapshots…</div>
      ) : snapshots && snapshots.length === 0 ? (
        <div className="max-w-6xl mx-auto px-4 md:px-8 mt-12">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
            <p className="text-base font-bold text-amber-900">Aún no hay snapshots</p>
            <p className="text-sm text-amber-800 mt-2">Corre el script para tomar el primero:</p>
            <code className="inline-block mt-3 bg-white px-3 py-2 rounded font-mono text-xs">
              python D:\CRM\brevo\plan-implementacion-abril-2026\scripts\_snapshot_meta.py
            </code>
          </div>
        </div>
      ) : snapshots && (
        <>
          <HeaderHero deltas={deltas} lastSnapshotAt={lastTs} />

          <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-6">
            <CapComplianceCard aggregates={aggregates} status={statusMap} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DailySendsChart aggregates={aggregates} status={statusMap} />
              <BurndownChart snapshots={snapshots} />
            </div>
            <SnapshotsTable snapshots={snapshots} />

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
              <p className="font-semibold text-slate-700 mb-1">Cómo se actualiza este dashboard</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Snapshots automáticos: 07:00 y 19:00 MX (cuando se configure cron)</li>
                <li>Snapshot manual: <code className="bg-white px-1 rounded">python _snapshot_meta.py</code></li>
                <li>Con nota: <code className="bg-white px-1 rounded">python _snapshot_meta.py --note "Subí cap inboxes a 20"</code></li>
                <li>Solo Ana: <code className="bg-white px-1 rounded">python _snapshot_meta.py --campaigns 3217790</code></li>
              </ul>
            </div>
          </main>
        </>
      )}
    </div>
  )
}

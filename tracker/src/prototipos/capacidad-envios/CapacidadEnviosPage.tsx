import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PoolCard from './components/PoolCard'
import RampUpPlan from './components/RampUpPlan'
import RampRules from './components/RampRules'
import MonitoringSources from './components/MonitoringSources'
import { fetchLatestInboxSnapshots, summarizePool } from './data/queries'
import type { InboxSnapshot } from './types'

export default function CapacidadEnviosPage() {
  const [rows, setRows] = useState<InboxSnapshot[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshAt, setRefreshAt] = useState(Date.now())

  useEffect(() => {
    let cancelled = false
    setRows(null)
    setError(null)
    fetchLatestInboxSnapshots()
      .then((data) => { if (!cancelled) setRows(data) })
      .catch((e) => { if (!cancelled) setError(String(e?.message ?? e)) })
    return () => { cancelled = true }
  }, [refreshAt])

  const meta = useMemo(() => rows ? summarizePool(rows, 'meta') : null, [rows])
  const forms = useMemo(() => rows ? summarizePool(rows, 'forms') : null, [rows])

  const totalCap = (meta?.capDaily ?? 0) + (forms?.capDaily ?? 0)
  const totalInboxes = (meta?.inboxCount ?? 0) + (forms?.inboxCount ?? 0)
  const lastTs = rows && rows.length > 0
    ? new Date(rows[0].taken_at).toLocaleString()
    : null

  return (
    <div className="ma-root min-h-screen bg-[#F8F9FB] text-slate-900">
      <nav className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-block w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-emerald-500" />
          <div>
            <p className="font-bold text-slate-900 text-sm leading-tight">Capacidad de envíos · Senders & Ramp-up</p>
            <p className="text-xs text-slate-500 leading-tight">{totalInboxes} buzones · cap diario {totalCap} · plan de crecimiento 8 semanas</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/meta-reporte" className="text-xs text-slate-500 hover:text-indigo-600 px-3 py-1.5 rounded border border-slate-200 hover:border-indigo-500">→ Meta</Link>
          <Link to="/formularios-reporte" className="text-xs text-slate-500 hover:text-emerald-600 px-3 py-1.5 rounded border border-slate-200 hover:border-emerald-500">→ Forms</Link>
          <button
            onClick={() => setRefreshAt(Date.now())}
            className="text-xs text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded border border-slate-200 hover:border-slate-400"
          >↻ Refresh</button>
          <Link to="/" className="text-xs text-slate-500 hover:text-slate-900">← Tracker</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0B1120] text-white">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1120] via-[#0B1120] to-indigo-900/40" />
        <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-10 md:py-14">
          <p className="text-slate-300 uppercase tracking-widest text-xs font-bold">Operación Smartlead · capacidad y plan</p>
          <h1 className="text-3xl md:text-5xl font-bold mt-2 leading-tight">
            <span className="text-indigo-400">{meta?.capDaily ?? '—'}</span> Meta + <span className="text-emerald-400">{forms?.capDaily ?? '—'}</span> Forms
            {' = '}<span>{totalCap}</span>/día
          </h1>
          <p className="text-slate-300 mt-3 text-sm">
            {totalInboxes} buzones distribuidos en 2 pools (elevn + laneta). Último refresh: <span className="font-mono text-white">{lastTs ?? '—'}</span>
          </p>
        </div>
      </section>

      {error && (
        <div className="max-w-6xl mx-auto px-4 md:px-8 mt-6">
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <p className="font-bold">Error cargando inboxes</p>
            <p className="font-mono text-xs mt-1">{error}</p>
            <p className="mt-2 text-xs">¿Aplicaste la migración 036_inbox_snapshots? ¿Corriste <code className="bg-white px-1 rounded">_snapshot_inboxes.py</code>?</p>
          </div>
        </div>
      )}

      {rows === null && !error ? (
        <div className="max-w-6xl mx-auto px-4 md:px-8 mt-12 text-slate-400 text-sm">Cargando inboxes…</div>
      ) : rows && rows.length === 0 ? (
        <div className="max-w-6xl mx-auto px-4 md:px-8 mt-12">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
            <p className="text-base font-bold text-amber-900">Sin snapshots de inboxes todavía</p>
            <p className="text-sm text-amber-800 mt-2">Corre el script:</p>
            <code className="inline-block mt-3 bg-white px-3 py-2 rounded font-mono text-xs">
              python D:\CRM\brevo\plan-implementacion-abril-2026\scripts\_snapshot_inboxes.py
            </code>
          </div>
        </div>
      ) : rows && (
        <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-6">
          {meta && (
            <PoolCard
              summary={meta}
              accent="meta"
              subtitle="Asignados a campañas Meta (Plan B paused, Ana active). Cold outreach Fast Track."
              domains={['elevngo.me', 'elevnhub.me', 'elevnpro.me']}
            />
          )}
          {forms && (
            <PoolCard
              summary={forms}
              accent="forms"
              subtitle="Asignados a las 4 campañas de formularios (audiencias warm que llenaron form)."
              domains={['lanetahub.com', 'lanetapro.com']}
            />
          )}

          <RampUpPlan />
          <RampRules />
          <MonitoringSources />

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
            <p className="font-semibold text-slate-700 mb-1">Cómo se actualiza este dashboard</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Datos vivos de los inboxes: <code className="bg-white px-1 rounded">python _snapshot_inboxes.py</code></li>
              <li>Recomendado: 1× por semana o cuando cambies caps en Smartlead</li>
              <li>El plan de ramp-up y reglas son estáticos (editables en <code className="bg-white px-1 rounded">data/rampPlan.ts</code>)</li>
            </ul>
          </div>
        </main>
      )}
    </div>
  )
}

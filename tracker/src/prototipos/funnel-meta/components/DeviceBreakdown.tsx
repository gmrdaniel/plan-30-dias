import { useEffect, useState } from 'react'
import type { BranchDeviceSnapshot } from '../../meta-reporte/types'
import { fetchLatestBranchDeviceSnapshot } from '../../meta-reporte/data/queries'

const COLORS: Record<string, string> = {
  Windows: 'bg-blue-500',
  macOS:   'bg-slate-500',
  Linux:   'bg-amber-500',
  iOS:     'bg-emerald-500',
  Android: 'bg-emerald-700',
  Other:   'bg-purple-500',
}

const DESKTOP_OS = new Set(['Windows', 'macOS', 'Linux'])
const MOBILE_OS  = new Set(['iOS', 'Android'])

interface Props {
  refreshKey?: number
}

export default function DeviceBreakdown({ refreshKey }: Props) {
  const [snap, setSnap] = useState<BranchDeviceSnapshot | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchLatestBranchDeviceSnapshot()
      .then((row) => { if (!cancelled) { setSnap(row); setLoading(false) } })
      .catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [refreshKey])

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-400">
        Cargando devices…
      </div>
    )
  }

  if (!snap) {
    return (
      <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-5">
        <h3 className="text-lg font-bold text-slate-900 mb-1">Devices que clickean</h3>
        <p className="text-sm text-slate-600">
          Sin snapshot todavía. Captura los % desde el editor "Editar conteos Branch.io" en <a href="/meta-reporte" className="text-[#0F52BA] underline">/meta-reporte</a> (sección Device breakdown).
        </p>
      </div>
    )
  }

  const entries = Object.entries(snap.device_breakdown).sort((a, b) => b[1] - a[1])
  const desktopTotal = entries.filter(([k]) => DESKTOP_OS.has(k)).reduce((s, [, v]) => s + v, 0)
  const mobileTotal = entries.filter(([k]) => MOBILE_OS.has(k)).reduce((s, [, v]) => s + v, 0)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-lg font-bold text-slate-900 mb-1">Devices que clickean</h3>
      <p className="text-xs text-slate-500 mb-4">
        Snapshot manual del PDF Branch · {snap.snapshot_date}
        {snap.recorded_by && <span className="ml-2 text-slate-400">por {snap.recorded_by}</span>}
      </p>

      <div className="space-y-2">
        {entries.map(([os, pct]) => (
          <div key={os}>
            <div className="flex justify-between text-xs mb-0.5">
              <span className="text-slate-700 font-semibold">{os}</span>
              <span className="text-slate-500 tabular-nums">{pct}%</span>
            </div>
            <div className="h-3 bg-slate-100 rounded overflow-hidden">
              <div className={`h-full ${COLORS[os] ?? 'bg-slate-400'}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
        <div className="flex justify-between">
          <span>Mobile total (iOS + Android)</span>
          <span className="font-bold text-emerald-700 tabular-nums">{mobileTotal.toFixed(0)}%</span>
        </div>
        <div className="flex justify-between">
          <span>Desktop total (Win + Mac + Linux)</span>
          <span className="font-bold text-rose-700 tabular-nums">{desktopTotal.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  )
}

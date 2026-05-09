import { useEffect, useState } from 'react'
import type { BranchDeviceSnapshot } from '../../meta-reporte/types'
import { fetchLatestBranchDeviceSnapshot } from '../../meta-reporte/data/queries'

interface Props {
  clicks: number
  signups: number
  refreshKey?: number
}

const DESKTOP_OS = new Set(['Windows', 'macOS', 'Linux'])

export default function DesktopFinding({ clicks, signups, refreshKey }: Props) {
  const [snap, setSnap] = useState<BranchDeviceSnapshot | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchLatestBranchDeviceSnapshot()
      .then((row) => { if (!cancelled) { setSnap(row); setLoading(false) } })
      .catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [refreshKey])

  if (loading || !snap) {
    return null  // No mostramos el callout hasta tener datos reales
  }

  const desktopPct = Object.entries(snap.device_breakdown)
    .filter(([k]) => DESKTOP_OS.has(k))
    .reduce((s, [, v]) => s + v, 0) / 100

  if (desktopPct === 0) return null

  const desktopClicks = Math.round(clicks * desktopPct)
  const mobileClicks = clicks - desktopClicks
  const lostDesktop = desktopClicks
  const conversionMobile = mobileClicks > 0 ? (signups / mobileClicks) * 100 : 0

  return (
    <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-5">
      <div className="flex items-start gap-3">
        <span className="text-2xl">⚠</span>
        <div className="flex-1">
          <h3 className="font-bold text-amber-900">
            Hallazgo crítico: ~{(desktopPct * 100).toFixed(0)}% de los clicks vienen de desktop, donde el deep-link de Meta NO permite registrar
          </h3>
          <p className="text-sm text-amber-800 mt-2">
            El destination URL <code className="bg-white px-1 rounded text-xs">facebook.com/creator_programs/signup</code> abre la app móvil de Meta. Desde desktop el flujo se rompe — el lead llega pero no puede aplicar. Estimación de impacto:
          </p>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="bg-white rounded-lg p-3 border border-amber-200">
              <p className="text-xs text-amber-700 uppercase tracking-wide">Clicks desktop perdidos</p>
              <p className="text-2xl font-bold text-amber-900 tabular-nums mt-1">{lostDesktop.toLocaleString()}</p>
              <p className="text-[11px] text-amber-700 mt-1">{(desktopPct * 100).toFixed(0)}% del total</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-amber-200">
              <p className="text-xs text-amber-700 uppercase tracking-wide">Clicks mobile (que sí pueden convertir)</p>
              <p className="text-2xl font-bold text-amber-900 tabular-nums mt-1">{mobileClicks.toLocaleString()}</p>
              <p className="text-[11px] text-amber-700 mt-1">{((1 - desktopPct) * 100).toFixed(0)}% del total</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-amber-200">
              <p className="text-xs text-amber-700 uppercase tracking-wide">Conv. real (mobile only)</p>
              <p className="text-2xl font-bold text-amber-900 tabular-nums mt-1">{conversionMobile.toFixed(1)}%</p>
              <p className="text-[11px] text-amber-700 mt-1">signups / mobile clicks</p>
            </div>
          </div>
          <p className="text-xs text-amber-700 mt-3">
            <b>Recomendación pendiente:</b> landing intermedia que detecte UA y muestre QR a usuarios desktop.
            Si recuperáramos el 30% de desktop perdido al QR, los registros subirían ~{Math.round(lostDesktop * 0.3 * (conversionMobile / 100))} en este período.
          </p>
          <p className="text-[11px] text-amber-600 mt-2">
            Fuente del % desktop: snapshot manual {snap.snapshot_date} — actualizable desde /meta-reporte → Editar conteos Branch.io → Device breakdown.
          </p>
        </div>
      </div>
    </div>
  )
}

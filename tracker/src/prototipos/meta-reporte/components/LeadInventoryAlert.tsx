import { useMemo } from 'react'
import type { CampaignDelta, DailyStat } from '../types'

interface Props {
  deltas: CampaignDelta[]
  dailyStats: DailyStat[]
  /** Threshold de días de combustible: <= ALERT_DAYS dispara alerta */
  alertDays?: number
}

interface InventoryRow {
  campaign_id: number
  campaign_name: string
  status: string
  notStarted: number | null
  totalLeads: number | null
  avgDailySends: number   // promedio últimos 3 días (sends totales, follow-ups + step 1)
  daysOfFuel: number | null    // notStarted / avgDailySends. null si no se puede calcular
  band: 'red' | 'amber' | 'green' | 'unknown'
  recommendedUpload: number   // sugerido subir hoy para mantener 5 días de fuel
}

const BANDS = {
  red:    { bg: 'bg-rose-50',   border: 'border-rose-300',   text: 'text-rose-900',   dot: 'bg-rose-500',   label: 'Crítico' },
  amber:  { bg: 'bg-amber-50',  border: 'border-amber-300',  text: 'text-amber-900',  dot: 'bg-amber-500',  label: 'Atención' },
  green:  { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-900', dot: 'bg-emerald-500', label: 'OK' },
  unknown:{ bg: 'bg-slate-50',  border: 'border-slate-200',  text: 'text-slate-600',  dot: 'bg-slate-400',  label: 's/d' },
} as const

/**
 * Alerta de inventario de leads "notStarted" por campaña.
 * Indica cuántos días de combustible (Step 1) quedan dado el ritmo reciente,
 * y sugiere cuántos subir hoy para mantener 5 días de runway.
 */
export default function LeadInventoryAlert({ deltas, dailyStats, alertDays = 2 }: Props) {
  const rows: InventoryRow[] = useMemo(() => {
    const TARGET_DAYS_FUEL = 5

    // avg daily sends por campaign — últimos 3 días con sends > 0 (excluye días en blanco)
    const sendsByCamp = new Map<number, number[]>()
    const sortedStats = [...dailyStats].sort((a, b) => b.date.localeCompare(a.date))
    for (const s of sortedStats) {
      if (s.step !== null) continue   // solo totales del día (step=null)
      if (s.sent <= 0) continue
      const arr = sendsByCamp.get(s.campaign_id) ?? []
      if (arr.length < 3) {
        arr.push(s.sent)
        sendsByCamp.set(s.campaign_id, arr)
      }
    }

    return deltas.map((d) => {
      const snap = d.current
      const notStarted = snap.leads_not_started
      const totalLeads = snap.leads_total
      const samples = sendsByCamp.get(d.campaign_id) ?? []
      const avg = samples.length > 0 ? Math.round(samples.reduce((a, b) => a + b, 0) / samples.length) : 0
      const daysOfFuel = (notStarted !== null && avg > 0) ? notStarted / avg : null

      let band: InventoryRow['band'] = 'unknown'
      if (notStarted === null) band = 'unknown'
      else if (daysOfFuel === null) {
        // sin data de envío reciente — si tiene leads ok, si no alerta
        band = (notStarted ?? 0) >= 100 ? 'green' : (notStarted >= 30 ? 'amber' : 'red')
      } else if (daysOfFuel < 1) band = 'red'
      else if (daysOfFuel <= alertDays) band = 'amber'
      else band = 'green'

      const recommendedUpload = (avg > 0 && notStarted !== null)
        ? Math.max(0, Math.round(avg * TARGET_DAYS_FUEL - notStarted))
        : 0

      return {
        campaign_id: d.campaign_id,
        campaign_name: d.campaign_name,
        status: d.status,
        notStarted,
        totalLeads,
        avgDailySends: avg,
        daysOfFuel,
        band,
        recommendedUpload,
      }
    })
  }, [deltas, dailyStats, alertDays])

  // Solo mostrar campañas ACTIVE para evitar ruido visual
  const visible = rows.filter((r) => r.status === 'ACTIVE')
  if (visible.length === 0) return null

  const anyAlert = visible.some((r) => r.band === 'red' || r.band === 'amber')

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span aria-hidden>📦</span> Inventario de leads (notStarted)
            {anyAlert && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 animate-pulse">
                ⚠️ Acción requerida
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Combustible Step 1 disponible vs ritmo reciente. Si llega a 0, la campaña deja de enviar nuevos.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {visible.map((r) => {
          const band = BANDS[r.band]
          return (
            <div
              key={r.campaign_id}
              className={`rounded border ${band.border} ${band.bg} p-4`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`inline-block w-2 h-2 rounded-full ${band.dot}`} aria-hidden />
                  <p className={`text-sm font-bold ${band.text} truncate`}>
                    {r.campaign_name}
                  </p>
                </div>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${band.bg} ${band.text} border ${band.border}`}>
                  {band.label}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">notStarted</p>
                  <p className={`text-lg font-bold ${band.text}`}>{r.notStarted ?? '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">~días fuel</p>
                  <p className={`text-lg font-bold ${band.text}`}>
                    {r.daysOfFuel !== null ? r.daysOfFuel.toFixed(1) : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">avg/día</p>
                  <p className={`text-lg font-bold ${band.text}`}>{r.avgDailySends || '—'}</p>
                </div>
              </div>

              {r.band === 'red' || r.band === 'amber' ? (
                <div className="text-xs text-slate-700 space-y-1 border-t border-slate-200 pt-2">
                  <p>
                    <strong>Sugerencia:</strong> subir{' '}
                    <strong className={band.text}>{r.recommendedUpload || 50}</strong> leads
                    nuevos hoy para 5 días de runway.
                  </p>
                  <p className="text-slate-500">
                    Batch listo:{' '}
                    <code className="bg-white px-1 py-0.5 rounded font-mono text-[11px]">
                      upload-3217790_weekly-batch-03_*.csv
                    </code>
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500 border-t border-slate-200 pt-2">
                  ✓ Inventario sano — sigue corriendo el snapshot 2x/día.
                </p>
              )}
            </div>
          )
        })}
      </div>

      <footer className="mt-4 text-[11px] text-slate-500 leading-relaxed">
        <p>
          <strong>Lectura:</strong> <code className="bg-slate-100 px-1 rounded">notStarted</code> = leads que aún no
          reciben Step 1. <code className="bg-slate-100 px-1 rounded">avg/día</code> = promedio de sends últimos 3 días.{' '}
          <code className="bg-slate-100 px-1 rounded">~días fuel</code> = notStarted ÷ avg/día. Bandas: Rojo &lt;1 día,
          Ámbar ≤{alertDays}d, Verde &gt;{alertDays}d.
        </p>
        <p className="mt-1">
          <strong>Cómo subir:</strong>{' '}
          <code className="bg-slate-100 px-1 rounded">
            python scripts/_upload_leads_to_smartlead.py --campaign 3217790 --csv upload-3217790_weekly-batch-03_*.csv
          </code>
          . Tras upload, ejecutar <em>pause/resume</em> según playbook.
        </p>
      </footer>
    </section>
  )
}

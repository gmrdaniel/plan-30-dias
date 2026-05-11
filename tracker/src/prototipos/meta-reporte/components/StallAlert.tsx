import { useEffect, useState } from 'react'
import type { CampaignDelta } from '../types'

interface Props {
  deltas: CampaignDelta[]
  /** Mínimo de sends esperados en la ventana de `windowHours` para no considerar stall */
  minSendsThreshold?: number
  /** Mínimo de horas desde el snapshot previo para evaluar (evita falso positivo justo tras el snapshot) */
  windowHours?: number
}

/**
 * Hora actual en TZ America/New_York como entero 0-23. La canónica de Ana 3217790
 * (per bitácora, schedule scheduler_cron_value.tz === 'America/New_York').
 */
function hourInNY(): number {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', hour: 'numeric', hour12: false,
  })
  return Number(fmt.format(new Date()))
}

function dayInNY(): number {
  // 0=Sun, 1=Mon, ..., 6=Sat
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short' })
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
  return map[fmt.format(new Date())] ?? 0
}

/**
 * Banner rojo cuando una campaña ACTIVE está en su ventana de envío pero el
 * scheduler dejó de despachar (típico stall observado el 28-abr y 8-9 may).
 *
 * Criterios:
 *   - status === 'ACTIVE'
 *   - ahora dentro de ventana 08:00-21:00 America/New_York
 *   - día en [1,2,3,4,6] (Lun-Jue + Sáb — schedule canónico)
 *   - deltaSentSinceLast < minSendsThreshold AND hoursSinceLast >= windowHours
 *
 * Click en el botón abre la UI de Smartlead directo a la campaign para pause/resume.
 */
export default function StallAlert({
  deltas,
  minSendsThreshold = 5,
  windowHours = 0.5,
}: Props) {
  const [, force] = useState(0)
  // Re-evalúa la condición de ventana cada 60s sin re-fetch de Supabase
  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 60_000)
    return () => clearInterval(t)
  }, [])

  const nowHour = hourInNY()
  const nowDay = dayInNY()
  const windowOpen = nowHour >= 8 && nowHour < 21
  const sendingDay = [1, 2, 3, 4, 6].includes(nowDay)

  if (!windowOpen || !sendingDay) return null

  const stalled = deltas.filter((d) => {
    if (d.status !== 'ACTIVE') return false
    if (d.hoursSinceLast === null) return false
    if (d.hoursSinceLast < windowHours) return false
    return d.deltaSentSinceLast < minSendsThreshold
  })

  if (stalled.length === 0) return null

  return (
    <section className="rounded-lg border-2 border-rose-400 bg-rose-50 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <span className="text-2xl" aria-hidden>🚨</span>
          <div>
            <h3 className="text-base font-bold text-rose-900">
              Stall detectado — la campaña no está enviando
            </h3>
            <p className="text-xs text-rose-700 mt-1 leading-relaxed">
              Ventana abierta ({nowHour}:00 NY) y status ACTIVE, pero 0 sends recientes.
              Patrón observado 28-abr y 8-9 may → pause/resume desde la UI de Smartlead.
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-rose-800">
              {stalled.map((d) => {
                const mins = Math.round((d.hoursSinceLast ?? 0) * 60)
                return (
                  <li key={d.campaign_id} className="flex items-center gap-3">
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-rose-200">
                      {d.campaign_id}
                    </span>
                    <span className="font-semibold">{d.campaign_name}</span>
                    <span className="text-rose-600">
                      {d.deltaSentSinceLast} sends en últimos {mins} min
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {stalled.map((d) => (
            <a
              key={d.campaign_id}
              href={`https://app.smartlead.ai/app/email-campaigns/${d.campaign_id}/analytics`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold whitespace-nowrap"
            >
              Abrir {d.campaign_id} en Smartlead →
            </a>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-rose-200 text-[11px] text-rose-700 leading-relaxed">
        <p>
          <strong>Recovery:</strong> en la UI de Smartlead, click <em>Pause</em>, espera ~5s, click <em>Resume</em>.
          El dispatcher per-inbox necesita warmup de ~3-40 min (depende de cuánto tiempo lleva stale).
          El API pause/resume <strong>NO</strong> desbloquea cuando counters están stuck — solo la UI.
        </p>
      </div>
    </section>
  )
}

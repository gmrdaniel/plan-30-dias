import type { DailyAggregate } from '../types'
import { colorBand, colorForBand } from '../data/queries'

interface Props {
  aggregates: DailyAggregate[]
  status: Record<number, string>
}

/**
 * Compliance summary: % del cap target que llegamos a usar cada día.
 * Útil para responder "¿estamos enviando lo más cercano al límite?".
 */
export default function CapComplianceCard({ aggregates, status }: Props) {
  // Aggregate per date across all ACTIVE campaigns (sum sends; max cap target)
  const byDate = new Map<string, { sent: number; cap: number }>()
  for (const a of aggregates) {
    const cur = byDate.get(a.date) ?? { sent: 0, cap: a.capTarget }
    if ((status[a.campaign_id] ?? 'IDLE') === 'ACTIVE') cur.sent += a.sentDelta
    cur.cap = Math.max(cur.cap, a.capTarget)
    byDate.set(a.date, cur)
  }

  const days = [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  const totalSent = days.reduce((acc, [, v]) => acc + v.sent, 0)
  const totalCap = days.reduce((acc, [, v]) => acc + v.cap, 0)
  const overallPct = totalCap ? (totalSent / totalCap) * 100 : 0
  const overallBand = colorBand(overallPct, 'ACTIVE')
  const overallColor = colorForBand(overallBand)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-start justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Compliance al cap diario</h3>
          <p className="text-sm text-slate-500">% del target {days[0]?.[1]?.cap ?? 180}/día que estamos usando · objetivo: ≥ 90%</p>
        </div>
        <div className={`text-right ${overallColor.text}`}>
          <p className="text-[11px] uppercase tracking-wider opacity-70">Acumulado</p>
          <p className="text-3xl font-bold">{overallPct.toFixed(0)}%</p>
          <p className="text-[11px]">{totalSent} / {totalCap}</p>
        </div>
      </div>

      <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5">
        {days.length === 0 && <p className="col-span-full text-sm text-slate-400 italic">Sin datos.</p>}
        {days.map(([date, v]) => {
          const pct = v.cap ? (v.sent / v.cap) * 100 : 0
          const band = colorBand(pct, 'ACTIVE')
          const c = colorForBand(band)
          // Day-of-month for compact label
          const dom = date.slice(8, 10)
          return (
            <div key={date} title={`${date} · ${v.sent}/${v.cap} (${pct.toFixed(0)}%)`}
                 className={`flex flex-col items-center justify-center rounded border ${c.border} ${c.bg} aspect-square text-center`}>
              <p className={`text-[10px] uppercase tracking-wider ${c.text} opacity-70`}>{date.slice(5, 7)}/{dom}</p>
              <p className={`text-base font-bold ${c.text}`}>{pct.toFixed(0)}%</p>
              <p className={`text-[9px] ${c.text} opacity-80`}>{v.sent}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

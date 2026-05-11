import { useMemo } from 'react'
import type { DailyStat, MetaReply } from '../types'

interface Props {
  replies: MetaReply[]
  dailyStats: DailyStat[]
}

interface StepRow {
  step: number
  replies: number
  sent: number
  rate: number   // replies / sent_unique de ese step
}

function bandColor(rate: number): { bg: string; text: string; border: string } {
  if (rate >= 0.01) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' }
  if (rate >= 0.005) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' }
  return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' }
}

/**
 * 4 mini-cards (Step 1, 2, 3, 4) con # de replies + reply rate.
 * Sirve para ver qué step convierte mejor → foco para iterar copy/timing.
 *
 * Reply rate = replies de ese step / sends totales de ese step (de meta_daily_stats con step!=null).
 */
export default function RepliesByStepCard({ replies, dailyStats }: Props) {
  const rows: StepRow[] = useMemo(() => {
    // Replies por step (1-4 fijos)
    const repliesByStep = new Map<number, number>()
    for (const r of replies) {
      if (r.step === null || r.step === undefined) continue
      repliesByStep.set(r.step, (repliesByStep.get(r.step) ?? 0) + 1)
    }
    // Sends por step desde dailyStats (step!=null = totales por step)
    const sendsByStep = new Map<number, number>()
    for (const d of dailyStats) {
      if (d.step === null) continue
      sendsByStep.set(d.step, (sendsByStep.get(d.step) ?? 0) + d.sent)
    }
    return [1, 2, 3, 4].map((step) => {
      const reps = repliesByStep.get(step) ?? 0
      const sent = sendsByStep.get(step) ?? 0
      return { step, replies: reps, sent, rate: sent > 0 ? reps / sent : 0 }
    })
  }, [replies, dailyStats])

  const totalReplies = rows.reduce((a, r) => a + r.replies, 0)

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <span aria-hidden>💬</span> Replies por step de la secuencia
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {totalReplies} respuesta{totalReplies === 1 ? '' : 's'} total · reply rate = replies / sends del mismo step
        </p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {rows.map((r) => {
          const c = bandColor(r.rate)
          const pct = (r.rate * 100).toFixed(2)
          return (
            <div key={r.step} className={`rounded border ${c.border} ${c.bg} p-3 text-center`}>
              <p className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">
                Step {r.step}
              </p>
              <p className={`text-3xl font-bold ${c.text} mt-1 tabular-nums`}>
                {r.replies}
              </p>
              <p className={`text-xs font-semibold ${c.text} tabular-nums mt-1`}>
                {pct}%
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5 tabular-nums">
                {r.sent.toLocaleString('en-US')} sends
              </p>
            </div>
          )
        })}
      </div>

      <p className="mt-3 text-[11px] text-slate-500">
        Bandas: <span className="text-emerald-700 font-semibold">≥1%</span>{' '}
        <span className="text-amber-700 font-semibold">0.5-1%</span>{' '}
        <span className="text-slate-500 font-semibold">&lt;0.5%</span>.
        Step con más replies (no rate) suele ser el de mayor volumen — mira la columna % para qualité.
      </p>
    </section>
  )
}

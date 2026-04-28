import type { PoolSummary } from '../types'

interface Props {
  summary: PoolSummary
  accent: 'meta' | 'forms'
  subtitle: string
  domains: string[]
}

const ACCENTS = {
  meta: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', dot: 'bg-indigo-500', barHex: '#6366f1' },
  forms: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500', barHex: '#10b981' },
}

function repColor(rep: number | null): string {
  if (rep == null) return 'text-slate-400'
  if (rep >= 99) return 'text-emerald-600'
  if (rep >= 95) return 'text-amber-600'
  return 'text-rose-600'
}

export default function PoolCard({ summary, accent, subtitle, domains }: Props) {
  const a = ACCENTS[accent]
  return (
    <div className={`rounded-xl border ${a.border} ${a.bg} p-5`}>
      <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
        <div>
          <p className={`text-[11px] uppercase tracking-wider font-bold ${a.text}`}>
            {accent === 'meta' ? 'Bloque Meta · elevn.*' : 'Bloque Formularios · laneta*'}
          </p>
          <h3 className="text-xl font-bold text-slate-900 mt-1">{summary.inboxCount} buzones · cap diario {summary.capDaily}</h3>
          <p className="text-sm text-slate-600 mt-1">{subtitle}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Reputación promedio</p>
          <p className={`text-2xl font-bold ${repColor(summary.reputationAvg)}`}>
            {summary.reputationAvg.toFixed(1)}%
          </p>
          <p className="text-[10px] text-slate-500">{summary.warmupDaysAvg.toFixed(0)} días warmup</p>
        </div>
      </div>

      <p className="text-[11px] text-slate-600 mb-3 font-mono">
        Dominios: {domains.join(' · ')}
      </p>

      <div className="rounded-lg bg-white border border-slate-200 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr>
              <th className="text-left font-semibold py-2 px-3">Sender</th>
              <th className="text-left font-semibold py-2 px-3">Inbox</th>
              <th className="text-right font-semibold py-2 px-3">Cap</th>
              <th className="text-right font-semibold py-2 px-3">Wm max</th>
              <th className="text-right font-semibold py-2 px-3">Rep</th>
              <th className="text-right font-semibold py-2 px-3">Días</th>
              <th className="text-center font-semibold py-2 px-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {summary.inboxes.map((inbox) => (
              <tr key={inbox.inbox_id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                <td className="py-2 px-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${a.dot}`} />
                    <span className="font-medium text-slate-900">{inbox.from_name ?? '—'}</span>
                  </div>
                </td>
                <td className="py-2 px-3 font-mono text-slate-600">{inbox.from_email}</td>
                <td className="py-2 px-3 text-right font-mono font-semibold">{inbox.message_per_day ?? '—'}</td>
                <td className="py-2 px-3 text-right font-mono text-slate-500">{inbox.warmup_max_count ?? '—'}</td>
                <td className={`py-2 px-3 text-right font-mono font-semibold ${repColor(inbox.warmup_reputation)}`}>
                  {inbox.warmup_reputation != null ? `${inbox.warmup_reputation}%` : '—'}
                </td>
                <td className="py-2 px-3 text-right font-mono text-slate-500">{inbox.warmup_days ?? '—'}</td>
                <td className="py-2 px-3 text-center">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    inbox.warmup_status === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {inbox.warmup_status ?? '—'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50 border-t-2 border-slate-200">
            <tr>
              <td className="py-2 px-3 font-bold text-slate-900">TOTAL</td>
              <td></td>
              <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{summary.capDaily}</td>
              <td className="py-2 px-3 text-right font-mono text-slate-500">{summary.warmupMax}</td>
              <td className={`py-2 px-3 text-right font-mono font-bold ${repColor(summary.reputationAvg)}`}>
                {summary.reputationAvg.toFixed(0)}%
              </td>
              <td className="py-2 px-3 text-right font-mono text-slate-500">{summary.warmupDaysAvg.toFixed(0)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

import { ANA_HYPOTHESES, type HypothesisStatus } from '../data/plan'

const STATUS_CONFIG: Record<HypothesisStatus, { label: string; bar: string; badge: string; icon: string }> = {
  confirmed: {
    label: 'Confirmado',
    bar: 'border-l-emerald-500',
    badge: 'bg-emerald-100 text-emerald-800',
    icon: '✓',
  },
  partial: {
    label: 'Parcial',
    bar: 'border-l-[#F59E0B]',
    badge: 'bg-amber-100 text-amber-800',
    icon: '≈',
  },
  insufficient: {
    label: 'Insuficiente',
    bar: 'border-l-rose-500',
    badge: 'bg-rose-100 text-rose-800',
    icon: '✗',
  },
  risky: {
    label: 'Riesgoso',
    bar: 'border-l-rose-500',
    badge: 'bg-rose-100 text-rose-800',
    icon: '!',
  },
}

export default function HypothesisValidation() {
  return (
    <div className="space-y-3">
      {ANA_HYPOTHESES.map((h, i) => {
        const cfg = STATUS_CONFIG[h.status]
        return (
          <div key={i} className={`rounded-lg border border-slate-200 bg-white p-4 border-l-4 ${cfg.bar}`}>
            <div className="flex items-start gap-3">
              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-md text-sm font-bold shrink-0 ${cfg.badge}`}>
                {cfg.icon}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <p className="font-semibold text-slate-900 text-sm">"{h.hypothesis}"</p>
                  <span className={`inline-block px-2 py-0.5 text-xs rounded-md font-semibold ${cfg.badge} shrink-0`}>
                    {cfg.label}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1.5 italic">{h.evidence}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

import { ACTIONS, type Verdict, HYBRID_WORKFLOW_ASCII, HYBRID_LOGIC, HYBRID_SYNC, HYBRID_TRADEOFF } from '../data/plan'
import Collapse from './Collapse'

const VERDICT_CONFIG: Record<Verdict, { label: string; bar: string; badge: string }> = {
  yes: { label: 'SÍ', bar: 'border-l-emerald-500', badge: 'bg-emerald-100 text-emerald-800' },
  no: { label: 'NO (condicional)', bar: 'border-l-rose-500', badge: 'bg-rose-100 text-rose-800' },
  conditional: { label: 'Depende del plan', bar: 'border-l-[#0F52BA]', badge: 'bg-[#0F52BA]/10 text-[#0F52BA]' },
  pause: { label: 'PAUSAR', bar: 'border-l-[#F59E0B]', badge: 'bg-amber-100 text-amber-800' },
  risky: { label: 'RIESGOSO', bar: 'border-l-rose-500', badge: 'bg-rose-100 text-rose-800' },
}

export default function ActionsMatrix() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {ACTIONS.map((a) => {
          const cfg = VERDICT_CONFIG[a.verdict]
          return (
            <div key={a.id} className={`rounded-lg border border-slate-200 bg-white p-4 border-l-4 ${cfg.bar}`}>
              <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                <div>
                  <span className="text-xs text-slate-500 font-mono">§{a.id}</span>
                  <h4 className="font-semibold text-slate-900 text-sm mt-0.5">{a.title}</h4>
                </div>
                <span className={`inline-block px-2 py-0.5 text-xs rounded-md font-semibold shrink-0 ${cfg.badge}`}>
                  {cfg.label}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-900">{a.short}</p>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{a.detail}</p>
            </div>
          )
        })}
      </div>

      {/* Hybrid workflow (referenciado en 3.4) */}
      <Collapse label="Ver diseño híbrido Smartlead → Brevo (§3.4)">
        <div className="space-y-4">
          <p className="text-sm text-slate-700 leading-relaxed">{HYBRID_LOGIC}</p>
          <pre className="bg-slate-900 text-slate-100 text-xs font-mono p-4 rounded-lg overflow-x-auto leading-relaxed">{HYBRID_WORKFLOW_ASCII}</pre>
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-2">Cómo se sincronizan</h4>
            <ul className="space-y-1 text-sm text-slate-700">
              {HYBRID_SYNC.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-[#0F52BA]">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <p className="text-xs uppercase text-slate-500 font-semibold">Trade-off</p>
            <p className="text-sm text-slate-700 mt-1">{HYBRID_TRADEOFF}</p>
          </div>
        </div>
      </Collapse>
    </div>
  )
}

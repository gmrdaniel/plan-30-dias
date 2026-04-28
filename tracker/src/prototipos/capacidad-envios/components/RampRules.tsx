import { RAMP_RULES } from '../data/rampPlan'

export default function RampRules() {
  const goRules = RAMP_RULES.filter((r) => r.type === 'go')
  const stopRules = RAMP_RULES.filter((r) => r.type === 'stop')

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900">Cuándo subir · cuándo NO subir</h3>
        <p className="text-sm text-slate-500">Reglas para decidir +5/buzón cada semana sin romper reputación</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4">
          <h4 className="font-bold text-emerald-700 text-sm mb-3 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12l5 5L20 7" />
            </svg>
            Sube si TODO esto se cumple
          </h4>
          <ul className="space-y-2">
            {goRules.map((r, i) => (
              <li key={i} className="text-sm text-emerald-900 flex items-start gap-2">
                <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                <span>{r.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-4">
          <h4 className="font-bold text-rose-700 text-sm mb-3 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
            </svg>
            NO subas si CUALQUIERA se cumple
          </h4>
          <ul className="space-y-2">
            {stopRules.map((r, i) => (
              <li key={i} className="text-sm text-rose-900 flex items-start gap-2">
                <span className="text-rose-500 font-bold mt-0.5">✗</span>
                <span>{r.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

import { MONITORING_SOURCES } from '../data/rampPlan'

const COST_BADGE = {
  free: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Gratis' },
  paid: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'De pago' },
  included: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Incluido' },
}

export default function MonitoringSources() {
  // Group by priority
  const byPri = new Map<number, typeof MONITORING_SOURCES>()
  for (const s of MONITORING_SOURCES) {
    const arr = byPri.get(s.priority) ?? []
    arr.push(s)
    byPri.set(s.priority, arr)
  }
  const priorities = [...byPri.keys()].sort((a, b) => a - b)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900">Fuentes de monitoreo</h3>
        <p className="text-sm text-slate-500">Dónde revisar deliverability, reputación y health de los buzones</p>
      </div>
      <div className="space-y-5">
        {priorities.map((p) => (
          <div key={p}>
            <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-2">
              Prioridad {p} · {p === 1 ? 'diaria' : p === 2 ? 'semanal' : p === 3 ? 'mensual' : 'opcional'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {byPri.get(p)!.map((s, i) => {
                const cost = COST_BADGE[s.cost]
                return (
                  <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-3 hover:bg-white transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1">
                        {s.url ? (
                          <a href={s.url} target="_blank" rel="noreferrer" className="font-semibold text-sm text-slate-900 hover:text-indigo-600 inline-flex items-center gap-1">
                            {s.title}
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 3h7v7M21 3l-9 9M5 5h6M5 13h6M5 21h14v-8" /></svg>
                          </a>
                        ) : (
                          <span className="font-semibold text-sm text-slate-900">{s.title}</span>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${cost.bg} ${cost.text}`}>{cost.label}</span>
                        {s.badge && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-mono">{s.badge}</span>}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{s.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

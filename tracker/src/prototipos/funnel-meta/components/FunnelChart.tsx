interface Props {
  sent: number
  opens: number
  clicks: number
  signups: number
  period: number
}

interface Stage {
  label: string
  count: number
  description: string
  color: string
}

function fmtNum(n: number): string {
  return n.toLocaleString('en-US')
}

function rate(num: number, denom: number): string {
  if (denom === 0) return '—'
  return ((num / denom) * 100).toFixed(num / denom < 0.01 ? 2 : 1) + '%'
}

function bandFor(stage: number, ratePct: number): { bg: string; label: string } {
  // bandas por etapa (basadas en benchmarks cold outreach)
  if (stage === 1) {
    if (ratePct >= 70) return { bg: 'bg-emerald-500', label: 'sobre benchmark (50-70%)' }
    if (ratePct >= 50) return { bg: 'bg-amber-500',   label: 'en benchmark (50-70%)' }
    return                    { bg: 'bg-rose-500',    label: 'bajo benchmark' }
  }
  if (stage === 2) {
    if (ratePct >= 2)   return { bg: 'bg-emerald-500', label: 'sobre benchmark (1-2%)' }
    if (ratePct >= 1)   return { bg: 'bg-amber-500',   label: 'en benchmark' }
    return                     { bg: 'bg-rose-500',    label: 'bajo benchmark' }
  }
  if (stage === 3) {
    if (ratePct >= 40)  return { bg: 'bg-emerald-500', label: 'sobre benchmark (25-40%)' }
    if (ratePct >= 25)  return { bg: 'bg-amber-500',   label: 'en benchmark' }
    return                     { bg: 'bg-rose-500',    label: 'bajo benchmark' }
  }
  return { bg: 'bg-slate-400', label: '' }
}

export default function FunnelChart({ sent, opens, clicks, signups, period }: Props) {
  const stages: Stage[] = [
    { label: 'L1 — Enviados', count: sent,    description: 'Universo entrante (cold)', color: 'bg-slate-700' },
    { label: 'L2 — Abrieron', count: opens,   description: 'Engagement pasivo',         color: 'bg-blue-500' },
    { label: 'L3 — Clicks',   count: clicks,  description: 'Intención activa (Branch)', color: 'bg-indigo-500' },
    { label: 'L4 — Registros',count: signups, description: 'Conversión real (Meta)',    color: 'bg-emerald-500' },
  ]
  const top = sent || 1

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900">Funnel — últimos {period} días</h3>
        <p className="text-sm text-slate-500">Cada barra es proporcional a su % del top of funnel (L1).</p>
      </div>

      <div className="space-y-3">
        {stages.map((s, i) => {
          const widthPct = top > 0 ? Math.max(2, (s.count / top) * 100) : 2
          const pctOfL1 = top > 0 ? (s.count / top) * 100 : 0
          const prevCount = i > 0 ? stages[i - 1].count : null
          const conversionFromPrev = prevCount && prevCount > 0 ? (s.count / prevCount) * 100 : null

          const bandKey = i === 1 ? 1 : i === 2 ? 2 : i === 3 ? 3 : 0
          const band = bandKey > 0 && conversionFromPrev !== null
            ? bandFor(bandKey, conversionFromPrev)
            : null

          return (
            <div key={s.label} className="relative">
              <div className="flex items-baseline justify-between mb-1">
                <div>
                  <span className="font-semibold text-slate-800 text-sm">{s.label}</span>
                  <span className="ml-2 text-xs text-slate-500">{s.description}</span>
                </div>
                <div className="text-sm">
                  <span className="font-bold tabular-nums text-slate-900">{fmtNum(s.count)}</span>
                  <span className="text-slate-400 ml-2">{pctOfL1.toFixed(1)}% de L1</span>
                </div>
              </div>
              <div className="relative h-9 bg-slate-100 rounded-md overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 ${band?.bg ?? s.color} transition-all flex items-center justify-end pr-3`}
                  style={{ width: `${widthPct}%` }}
                >
                  {widthPct > 15 && (
                    <span className="text-xs font-semibold text-white tabular-nums">
                      {fmtNum(s.count)}
                    </span>
                  )}
                </div>
              </div>
              {conversionFromPrev !== null && (
                <p className="text-xs text-slate-500 mt-1 ml-2">
                  ↳ Conversión desde {stages[i - 1].label.split(' — ')[0]}: <span className="font-bold tabular-nums text-slate-700">{conversionFromPrev.toFixed(1)}%</span>
                  {band && <span className="ml-2 text-slate-400">· {band.label}</span>}
                </p>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <p className="text-slate-500">Open rate (L2/L1)</p>
          <p className="font-bold text-slate-900 text-lg tabular-nums">{rate(opens, sent)}</p>
        </div>
        <div>
          <p className="text-slate-500">CTR sobre opens (L3/L2)</p>
          <p className="font-bold text-slate-900 text-lg tabular-nums">{rate(clicks, opens)}</p>
        </div>
        <div>
          <p className="text-slate-500">Click→Reg (L4/L3)</p>
          <p className="font-bold text-slate-900 text-lg tabular-nums">{rate(signups, clicks)}</p>
        </div>
        <div>
          <p className="text-slate-500">End-to-end (L4/L1)</p>
          <p className="font-bold text-emerald-700 text-lg tabular-nums">{rate(signups, sent)}</p>
        </div>
      </div>
    </div>
  )
}

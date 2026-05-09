interface Props {
  sentCurrent: number
  opensCurrent: number
  clicksCurrent: number
  signupsCurrent: number
  sentPrev: number
  opensPrev: number
  clicksPrev: number
  signupsPrev: number
  period: number
}

function pctChange(current: number, prev: number): number | null {
  if (prev === 0) return current > 0 ? 100 : null
  return ((current - prev) / prev) * 100
}

function fmtNum(n: number): string {
  return n.toLocaleString('en-US')
}

function Trend({ value }: { value: number | null }) {
  if (value === null) return <span className="text-slate-400">—</span>
  const sign = value >= 0 ? '↑' : '↓'
  const color = value >= 0 ? 'text-emerald-600' : 'text-rose-600'
  return <span className={`${color} font-semibold`}>{sign} {Math.abs(value).toFixed(1)}%</span>
}

export default function HeroMetrics(p: Props) {
  const conversionRate = p.sentCurrent > 0 ? (p.signupsCurrent / p.sentCurrent) * 100 : 0
  const conversionRatePrev = p.sentPrev > 0 ? (p.signupsPrev / p.sentPrev) * 100 : 0
  const conversionDelta = conversionRate - conversionRatePrev  // pp diff

  const openRate = p.sentCurrent > 0 ? (p.opensCurrent / p.sentCurrent) * 100 : 0
  const ctr = p.opensCurrent > 0 ? (p.clicksCurrent / p.opensCurrent) * 100 : 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Registros (HERO grande) */}
      <div className="rounded-xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-white p-6">
        <p className="text-xs uppercase tracking-wide text-emerald-700 font-bold">Registros</p>
        <p className="text-5xl font-extrabold text-emerald-900 mt-1 tabular-nums">{fmtNum(p.signupsCurrent)}</p>
        <p className="text-sm text-emerald-700 mt-2">
          últimos {p.period}d · <Trend value={pctChange(p.signupsCurrent, p.signupsPrev)} /> vs anteriores
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Conv. end-to-end</p>
        <p className="text-4xl font-bold text-slate-900 mt-1 tabular-nums">{conversionRate.toFixed(2)}%</p>
        <p className="text-sm text-slate-500 mt-2">
          Sent → Reg · {conversionDelta >= 0 ? '+' : ''}{conversionDelta.toFixed(2)}pp vs prev
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Salud del funnel</p>
        <div className="mt-2 space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-slate-600">Open rate</span><span className="font-bold tabular-nums">{openRate.toFixed(1)}%</span></div>
          <div className="flex justify-between"><span className="text-slate-600">CTR (sobre opens)</span><span className="font-bold tabular-nums">{ctr.toFixed(2)}%</span></div>
          <div className="flex justify-between"><span className="text-slate-600">Sends en periodo</span><span className="font-bold tabular-nums">{fmtNum(p.sentCurrent)}</span></div>
        </div>
      </div>
    </div>
  )
}

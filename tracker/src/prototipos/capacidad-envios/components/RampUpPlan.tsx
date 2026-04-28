import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { RAMP_PLAN } from '../data/rampPlan'

export default function RampUpPlan() {
  // Chart data — total daily capacity per period
  const chartData = RAMP_PLAN.map((p) => ({
    label: p.label.split(' (')[0],
    Meta: p.metaPerInbox * 9,
    Forms: p.formsPerInbox * 6,
    Total: p.metaPerInbox * 9 + p.formsPerInbox * 6,
  }))

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900">Plan de ramp-up · 8 semanas</h3>
        <p className="text-sm text-slate-500">
          +5/buzón cada 7 días mientras todo verde · objetivo: 50/buzón sostenible
        </p>
      </div>

      <div className="overflow-x-auto mb-6">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b-2 border-slate-200 text-slate-600">
            <tr>
              <th className="text-left font-semibold py-2 px-3">Periodo</th>
              <th className="text-right font-semibold py-2 px-3">Cap por buzón Meta</th>
              <th className="text-right font-semibold py-2 px-3">Total Meta (×9)</th>
              <th className="text-right font-semibold py-2 px-3">Cap por buzón Forms</th>
              <th className="text-right font-semibold py-2 px-3">Total Forms (×6)</th>
              <th className="text-right font-semibold py-2 px-3">Gran total</th>
            </tr>
          </thead>
          <tbody>
            {RAMP_PLAN.map((p, i) => {
              const totalMeta = p.metaPerInbox * 9
              const totalForms = p.formsPerInbox * 6
              const isToday = i === 0
              const isPeak = i === RAMP_PLAN.length - 1
              return (
                <tr key={p.label} className={`border-b border-slate-100 ${
                  isToday ? 'bg-amber-50' : isPeak ? 'bg-emerald-50' : ''
                }`}>
                  <td className="py-2 px-3 font-semibold text-slate-900">
                    {p.label}
                    {isToday && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-amber-200 text-amber-800 font-mono">HOY</span>}
                    {isPeak && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-800 font-mono">META</span>}
                  </td>
                  <td className="py-2 px-3 text-right font-mono">{p.metaPerInbox}/día</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-indigo-700">{totalMeta}/día</td>
                  <td className="py-2 px-3 text-right font-mono">{p.formsPerInbox}/día</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">{totalForms}/día</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{totalMeta + totalForms}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 18 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={50} />
            <YAxis tick={{ fontSize: 11 }} label={{ value: 'Sends/día', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#64748b' } }} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                return (
                  <div className="rounded-lg bg-white border border-slate-200 shadow-lg p-3 text-xs space-y-1">
                    <p className="font-bold text-slate-900">{label}</p>
                    {payload.map((p) => (
                      <p key={String(p.dataKey)} className="text-slate-700">
                        <span className="inline-block w-2 h-2 rounded mr-2" style={{ background: p.color }} />
                        {String(p.dataKey)}: <span className="font-bold">{p.value}/día</span>
                      </p>
                    ))}
                  </div>
                )
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="Meta" stackId="a" fill="#6366f1" />
            <Bar dataKey="Forms" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

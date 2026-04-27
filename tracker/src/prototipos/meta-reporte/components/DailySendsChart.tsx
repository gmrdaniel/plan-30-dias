import { Bar, BarChart, CartesianGrid, Cell, Legend, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { DailyAggregate } from '../types'
import { colorBand, colorForBand } from '../data/queries'

interface Props {
  aggregates: DailyAggregate[]
  status: Record<number, string>
}

export default function DailySendsChart({ aggregates, status }: Props) {
  // pivot: { date, '3212141': sends, '3217790': sends, capTarget }
  const dates = [...new Set(aggregates.map((a) => a.date))].sort()
  const campaigns = [...new Set(aggregates.map((a) => a.campaign_id))]
  const data = dates.map((date) => {
    const row: Record<string, number | string> = { date }
    let capTarget = 180
    for (const cid of campaigns) {
      const agg = aggregates.find((a) => a.date === date && a.campaign_id === cid)
      row[`c_${cid}`] = agg?.sentDelta ?? 0
      capTarget = agg?.capTarget ?? capTarget
    }
    row.capTarget = capTarget
    return row
  })

  const colorByCampaign: Record<number, string> = {
    3212141: '#94a3b8',  // Plan B (paused) — gris
    3217790: '#6366f1',  // Ana — indigo (color base, se sobreescribe por celda)
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-start justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Envíos diarios por campaña</h3>
          <p className="text-sm text-slate-500">
            Δ entre snapshots por día · color por % del cap target (verde ≥90, ámbar 60-90, rojo &lt;60)
          </p>
        </div>
        <div className="text-xs flex gap-3">
          <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500"></span>≥90%</span>
          <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500"></span>60–90%</span>
          <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-500"></span>&lt;60%</span>
          <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-400"></span>paused</span>
        </div>
      </div>
      {data.length === 0 ? (
        <p className="text-sm text-slate-400 italic">Aún no hay snapshots con histórico de días distintos.</p>
      ) : (
        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 18 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} label={{ value: 'Sends/día', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#64748b' } }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null
                  return (
                    <div className="rounded-lg bg-white border border-slate-200 shadow-lg p-3 text-xs space-y-1">
                      <p className="font-bold text-slate-900">{label}</p>
                      {payload.map((p) => (
                        <p key={p.dataKey as string} className="text-slate-700">
                          <span className="inline-block w-2 h-2 rounded mr-2" style={{ background: p.color }} />
                          {p.dataKey === 'capTarget'
                            ? `Cap target: ${p.value}`
                            : `${(p.dataKey as string).replace('c_', '')}: ${p.value} sends`}
                        </p>
                      ))}
                    </div>
                  )
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine y={180} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'Target 180', fill: '#10b981', fontSize: 10, position: 'right' }} />
              {campaigns.map((cid) => (
                <Bar key={cid} dataKey={`c_${cid}`} name={`Camp ${cid}`} stackId="day" radius={[4, 4, 0, 0]}>
                  {data.map((row, i) => {
                    const sent = (row[`c_${cid}`] as number) ?? 0
                    const cap = (row.capTarget as number) ?? 180
                    const pct = cap ? (sent / cap) * 100 : 0
                    const st = status[cid] ?? 'IDLE'
                    const band = colorBand(pct, st)
                    return <Cell key={i} fill={st === 'ACTIVE' ? colorForBand(band).hex : colorByCampaign[cid] ?? '#94a3b8'} />
                  })}
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

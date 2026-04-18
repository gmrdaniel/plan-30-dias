import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'
import { DAY_STATS, HOUR_STATS, TOP_SLOTS } from '../data/analysis'

function colorForOR(or: number) {
  if (or >= 30) return '#10b981'  // emerald
  if (or >= 20) return '#6366f1'  // indigo
  if (or >= 10) return '#f59e0b'  // amber
  return '#ef4444'                // rose
}

export default function DayHourChart() {
  return (
    <div className="space-y-6">
      {/* Día de la semana */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-900">Open Rate por día de la semana</h3>
          <p className="text-sm text-slate-500">Últimos 60 días · 100 campañas analizadas · Color por rango: verde ≥30%, azul ≥20%, amarillo ≥10%, rojo &lt;10%</p>
        </div>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={DAY_STATS} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const row = payload[0].payload
                  return (
                    <div className="rounded-lg bg-white border border-slate-200 shadow-lg p-3 text-xs">
                      <p className="font-bold text-slate-900 mb-2">{row.day}</p>
                      <p>Campañas: <span className="font-semibold text-slate-900">{row.camps}</span></p>
                      <p>Delivered: <span className="font-semibold text-slate-900">{row.delivered.toLocaleString()}</span></p>
                      <p>Opens: <span className="font-semibold text-slate-900">{row.opens}</span></p>
                      <p>OR: <span className="font-semibold text-indigo-600">{row.orPct}%</span></p>
                    </div>
                  )
                }}
              />
              <Bar dataKey="orPct" radius={[6, 6, 0, 0]}>
                {DAY_STATS.map((d, i) => (
                  <Cell key={i} fill={colorForOR(d.orPct)} />
                ))}
                <LabelList dataKey="orPct" position="top" style={{ fontSize: 11, fill: '#475569' }} formatter={(v: unknown) => `${v}%`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hora del día */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-900">Open Rate por hora del día (ET)</h3>
          <p className="text-sm text-slate-500">Las horas con muestra ≥5 campañas son las más confiables</p>
        </div>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={HOUR_STATS} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}h`} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const row = payload[0].payload
                  return (
                    <div className="rounded-lg bg-white border border-slate-200 shadow-lg p-3 text-xs">
                      <p className="font-bold text-slate-900 mb-2">{row.hour}:00 ET</p>
                      <p>Campañas: <span className="font-semibold text-slate-900">{row.camps}</span></p>
                      <p>Delivered: <span className="font-semibold text-slate-900">{row.delivered.toLocaleString()}</span></p>
                      <p>OR: <span className="font-semibold text-indigo-600">{row.orPct}%</span></p>
                    </div>
                  )
                }}
              />
              <Bar dataKey="orPct" radius={[6, 6, 0, 0]}>
                {HOUR_STATS.map((d, i) => (
                  <Cell key={i} fill={colorForOR(d.orPct)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top slots */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Top slots (día × hora)</h3>
        <div className="space-y-2">
          {TOP_SLOTS.map((s) => (
            <div
              key={s.slot}
              className={`flex items-center justify-between p-3 rounded-lg ${
                s.winner ? 'bg-emerald-50 border border-emerald-200' : s.avoid ? 'bg-rose-50 border border-rose-200' : 'bg-slate-50 border border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                  s.winner ? 'bg-emerald-500' : s.avoid ? 'bg-rose-500' : 'bg-slate-400'
                }`}>
                  {s.winner ? '🏆' : s.avoid ? '✗' : ''}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{s.slot}</p>
                  <p className="text-xs text-slate-500">{s.delivered} delivered · {s.camps} campañas</p>
                </div>
              </div>
              <div className={`text-2xl font-bold ${s.winner ? 'text-emerald-700' : s.avoid ? 'text-rose-700' : 'text-slate-700'}`}>
                {s.orPct}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

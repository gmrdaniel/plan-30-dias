import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'
import { MONTHLY_TIMELINE } from '../data/analysis'

export default function TimelineChart() {
  const maxCamps = Math.max(...MONTHLY_TIMELINE.map((m) => m.camps))
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900">📅 Campañas enviadas por mes</h3>
        <p className="text-sm text-slate-500">
          Evolución del volumen de envíos · el pico fue <strong>Marzo 2026</strong> con el lanzamiento del programa Meta Fast Track
        </p>
      </div>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={MONTHLY_TIMELINE} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11 }}
              label={{ value: 'Mes de envío', position: 'insideBottom', offset: -10, style: { fontSize: 12, fill: '#64748b' } }}
            />
            <YAxis tick={{ fontSize: 12 }} label={{ value: '# campañas', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#64748b' } }} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const row = payload[0].payload
                return (
                  <div className="rounded-lg bg-white border border-slate-200 shadow-lg p-3 text-xs">
                    <p className="font-bold text-slate-900">{row.label}</p>
                    <p className="mt-1 text-slate-700">Campañas: <span className="font-semibold">{row.camps}</span></p>
                    {row.delivered > 0 && <p>Delivered trackeados: <span className="font-semibold">{row.delivered.toLocaleString()}</span></p>}
                    {row.opens > 0 && <p>Opens: <span className="font-semibold">{row.opens}</span></p>}
                  </div>
                )
              }}
            />
            <Bar dataKey="camps" radius={[8, 8, 0, 0]}>
              {MONTHLY_TIMELINE.map((m, i) => (
                <Cell key={i} fill={m.camps === maxCamps ? '#f59e0b' : '#6366f1'} />
              ))}
              <LabelList dataKey="camps" position="top" style={{ fontSize: 11, fill: '#475569' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-xs text-slate-500 flex flex-wrap gap-4">
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 bg-indigo-500 rounded"></span> Meses regulares</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 bg-amber-500 rounded"></span> Pico (Meta Fast Track launch)</span>
        <span>· Abril es parcial (hasta 17-abr)</span>
      </div>
    </div>
  )
}

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'
import { SUBJECT_BUCKETS, TOP_SUBJECTS, COUNTER_SUBJECTS, SUBJECT_CONCLUSION } from '../data/plan'
import Collapse from './Collapse'

export default function SubjectAnalysis() {
  return (
    <div className="space-y-6">
      {/* Conclusión principal */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 border-l-4 border-l-[#F59E0B]">
        <p className="text-xs uppercase text-[#F59E0B] font-semibold">Validación empírica</p>
        <h3 className="text-base font-bold text-slate-900 mt-1">La hipótesis "subject repetido = OR bajo" NO se sostiene con la data</h3>
        <p className="text-sm text-slate-700 mt-2 leading-relaxed">{SUBJECT_CONCLUSION}</p>
      </div>

      {/* Bar chart por bucket */}
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-bold text-slate-900">OR promedio por bucket de reutilización</h3>
        <p className="text-sm text-slate-500">266 campañas · 45 subjects únicos · enero-abril 2026</p>
        <div style={{ width: '100%', height: 280 }} className="mt-4">
          <ResponsiveContainer>
            <BarChart data={SUBJECT_BUCKETS} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="bucket" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const d = payload[0].payload
                  return (
                    <div className="rounded-lg bg-white border border-slate-200 shadow-lg p-3 text-xs">
                      <p className="font-bold text-slate-900">{d.bucket}</p>
                      <p>Campañas (n): <span className="font-semibold">{d.n}</span></p>
                      <p>OR media: <span className="font-semibold text-[#0F52BA]">{d.orAvg}%</span></p>
                      <p>OR mediana: <span className="font-semibold">{d.orMedian}%</span></p>
                    </div>
                  )
                }}
              />
              <Bar dataKey="orAvg" radius={[6, 6, 0, 0]}>
                {SUBJECT_BUCKETS.map((b, i) => (
                  <Cell key={i} fill={b.highlight ? '#F59E0B' : '#6366f1'} />
                ))}
                <LabelList dataKey="orAvg" position="top" style={{ fontSize: 11, fill: '#475569' }} formatter={(v: unknown) => `${v}%`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top + counter subjects detrás de ver detalle */}
      <Collapse label="Ver top subjects y contraejemplos">
        <div className="space-y-5">
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-2">Top subjects reutilizados (OR más alto)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left uppercase text-slate-600 font-semibold">Subject</th>
                    <th className="px-3 py-2 text-right uppercase text-slate-600 font-semibold">Usos</th>
                    <th className="px-3 py-2 text-right uppercase text-slate-600 font-semibold">Sent</th>
                    <th className="px-3 py-2 text-right uppercase text-slate-600 font-semibold">OR%</th>
                    <th className="px-3 py-2 text-right uppercase text-slate-600 font-semibold">CTR%</th>
                    <th className="px-3 py-2 text-left uppercase text-slate-600 font-semibold">Periodo</th>
                  </tr>
                </thead>
                <tbody>
                  {TOP_SUBJECTS.map((s) => (
                    <tr key={s.subject} className="border-b border-slate-100">
                      <td className="px-3 py-2 text-slate-900">{s.subject}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{s.uses}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{s.sent.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right tabular-nums font-semibold text-emerald-600">{s.or}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{s.ctr}</td>
                      <td className="px-3 py-2 text-slate-500 whitespace-nowrap">{s.period}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-2">Contraejemplos (reutilizados con bajo OR)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left uppercase text-slate-600 font-semibold">Subject</th>
                    <th className="px-3 py-2 text-right uppercase text-slate-600 font-semibold">Usos</th>
                    <th className="px-3 py-2 text-right uppercase text-slate-600 font-semibold">Sent</th>
                    <th className="px-3 py-2 text-right uppercase text-slate-600 font-semibold">OR%</th>
                    <th className="px-3 py-2 text-right uppercase text-slate-600 font-semibold">CTR%</th>
                    <th className="px-3 py-2 text-left uppercase text-slate-600 font-semibold">Periodo</th>
                  </tr>
                </thead>
                <tbody>
                  {COUNTER_SUBJECTS.map((s) => (
                    <tr key={s.subject} className="border-b border-slate-100">
                      <td className="px-3 py-2 text-slate-900">{s.subject}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{s.uses}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{s.sent.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right tabular-nums font-semibold text-rose-600">{s.or}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{s.ctr}</td>
                      <td className="px-3 py-2 text-slate-500 whitespace-nowrap">{s.period}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Collapse>
    </div>
  )
}

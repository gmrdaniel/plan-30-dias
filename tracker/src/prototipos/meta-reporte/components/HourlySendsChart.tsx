import { useMemo, useState } from 'react'
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { HourlySend } from '../types'

interface Props {
  rows: HourlySend[]
}

function fmtHour(h: number): string {
  if (h === 0) return '12 AM'
  if (h < 12) return `${h} AM`
  if (h === 12) return '12 PM'
  return `${h - 12} PM`
}

export default function HourlySendsChart({ rows }: Props) {
  // dates available
  const dates = useMemo(() => [...new Set(rows.map((r) => r.date))].sort((a, b) => b.localeCompare(a)), [rows])
  const [selectedDate, setSelectedDate] = useState<string | null>(dates[0] ?? null)

  // Aggregate per hour for selected date (across selected campaigns — passed already filtered)
  const hourly = useMemo(() => {
    if (!selectedDate) return []
    const byHour = new Map<number, { hour: number; predicted: number; actual: number; opened: number; clicked: number; replied: number }>()
    for (let h = 0; h < 24; h++) byHour.set(h, { hour: h, predicted: 0, actual: 0, opened: 0, clicked: 0, replied: 0 })
    for (const r of rows.filter((x) => x.date === selectedDate)) {
      const cur = byHour.get(r.hour_start)!
      cur.predicted += r.predicted
      cur.actual += r.actual_sent
      cur.opened += r.opened
      cur.clicked += r.clicked
      cur.replied += r.replied
    }
    return [...byHour.values()].sort((a, b) => a.hour - b.hour).map((r) => ({ ...r, label: fmtHour(r.hour) }))
  }, [rows, selectedDate])

  const totalActual = hourly.reduce((acc, r) => acc + r.actual, 0)
  const totalPredicted = hourly.reduce((acc, r) => acc + r.predicted, 0)
  const totalOpened = hourly.reduce((acc, r) => acc + r.opened, 0)
  const peakHour = hourly.reduce<{ hour: number; actual: number }>(
    (best, r) => (r.actual > best.actual ? { hour: r.hour, actual: r.actual } : best),
    { hour: 0, actual: 0 },
  )

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-start justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Distribución horaria — Smartlead reporte</h3>
          <p className="text-sm text-slate-500">
            CSV importado · sends, opens y predicted por hora del día
          </p>
        </div>
        {dates.length > 1 && (
          <select
            value={selectedDate ?? ''}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs border border-slate-200 rounded px-2 py-1.5"
          >
            {dates.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        )}
      </div>

      {!selectedDate ? (
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-6 text-center">
          <p className="text-sm text-slate-600 font-semibold">Sin reportes horarios cargados</p>
          <p className="text-xs text-slate-500 mt-2">
            Descarga CSVs desde Smartlead → Campaign → Reports → "Send Forecast Hourly"
            a <code className="bg-white px-1 rounded">plan-b/reporte-smartLead/</code>
            y corre <code className="bg-white px-1 rounded">python _import_smartlead_hourly_csv.py</code>
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-xs">
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
              <p className="text-emerald-700 uppercase tracking-wider text-[10px] font-semibold">Real</p>
              <p className="text-2xl font-bold text-emerald-900">{totalActual}</p>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
              <p className="text-slate-600 uppercase tracking-wider text-[10px] font-semibold">Predicted</p>
              <p className="text-2xl font-bold text-slate-700">{totalPredicted}</p>
            </div>
            <div className="rounded-lg bg-indigo-50 border border-indigo-200 p-3">
              <p className="text-indigo-700 uppercase tracking-wider text-[10px] font-semibold">Opens</p>
              <p className="text-2xl font-bold text-indigo-900">{totalOpened}</p>
              <p className="text-[10px] text-indigo-600">
                {totalActual ? ((totalOpened / totalActual) * 100).toFixed(1) : '—'}% OR
              </p>
            </div>
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
              <p className="text-amber-700 uppercase tracking-wider text-[10px] font-semibold">Peak hour</p>
              <p className="text-2xl font-bold text-amber-900">{fmtHour(peakHour.hour)}</p>
              <p className="text-[10px] text-amber-600">{peakHour.actual} sends</p>
            </div>
          </div>

          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <ComposedChart data={hourly} margin={{ top: 12, right: 12, left: 0, bottom: 18 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={1} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    const row = payload[0].payload as { actual: number; predicted: number; opened: number; clicked: number; replied: number }
                    return (
                      <div className="rounded-lg bg-white border border-slate-200 shadow-lg p-3 text-xs space-y-0.5">
                        <p className="font-bold text-slate-900">{label}</p>
                        <p className="text-slate-700">Real: <span className="font-bold text-emerald-700">{row.actual}</span></p>
                        <p className="text-slate-700">Predicted: <span className="font-bold text-slate-500">{row.predicted}</span></p>
                        <p className="text-slate-700">Opens: <span className="font-bold text-indigo-600">{row.opened}</span></p>
                        {row.clicked > 0 && <p className="text-slate-700">Clicks: <span className="font-bold">{row.clicked}</span></p>}
                        {row.replied > 0 && <p className="text-slate-700">Replies: <span className="font-bold">{row.replied}</span></p>}
                      </div>
                    )
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="actual" name="Real (sent)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="opened" name="Opened" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Line dataKey="predicted" name="Predicted (Smartlead)" stroke="#94a3b8" strokeDasharray="4 4" dot={{ r: 2 }} strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}

import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { DailyAggregate } from '../types'
import { colorBand, colorForBand } from '../data/queries'
import HallazgosModal from './HallazgosModal'

interface Props {
  aggregates: DailyAggregate[]
  status: Record<number, string>
}

interface DayRow {
  date: string
  planeado: number
  real: number
  capEfectivo: number
  byCampaign: Record<number, number>
  pct: number
  band: 'green' | 'amber' | 'red' | 'idle'
}

export default function DailySendsChart({ aggregates, status }: Props) {
  const [showModal, setShowModal] = useState(false)

  // Pivot per date — sumamos todas las campañas seleccionadas (aggregates ya viene filtrado en raíz)
  const datesMap = new Map<string, DayRow>()
  for (const a of aggregates) {
    const cur = datesMap.get(a.date) ?? {
      date: a.date,
      planeado: a.capTarget,
      real: 0,
      capEfectivo: a.capEfectivo,
      byCampaign: {} as Record<number, number>,
      pct: 0,
      band: 'idle' as const,
    }
    cur.planeado = Math.max(cur.planeado, a.capTarget)
    cur.capEfectivo = Math.max(cur.capEfectivo, a.capEfectivo)
    cur.real += (status[a.campaign_id] ?? 'IDLE') === 'ACTIVE' ? a.sentDelta : 0
    cur.byCampaign[a.campaign_id] = a.sentDelta
    datesMap.set(a.date, cur)
  }
  const data = [...datesMap.values()]
    .map((r) => {
      const pct = r.planeado ? (r.real / r.planeado) * 100 : 0
      return { ...r, pct, band: colorBand(pct, 'ACTIVE') }
    })
    .sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-start justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Envíos diarios — Planeado vs Real</h3>
          <p className="text-sm text-slate-500">
            Cap target: <span className="font-mono">{data[data.length - 1]?.planeado ?? 180}</span>/día
            (9 buzones × 20) · color por % cumplimiento
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="text-xs px-3 py-1.5 rounded border border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-500 transition-colors font-medium"
          >
            Ver hallazgos clave →
          </button>
        </div>
      </div>

      <div className="text-xs flex gap-3 mb-3">
        <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-300"></span>Planeado (cap)</span>
        <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500"></span>Real ≥90%</span>
        <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500"></span>Real 60–90%</span>
        <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-500"></span>Real &lt;60%</span>
      </div>

      {data.length === 0 ? (
        <p className="text-sm text-slate-400 italic">Aún no hay snapshots con histórico de días distintos.</p>
      ) : (
        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 18 }} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} label={{ value: 'Sends', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#64748b' } }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null
                  const row = payload[0].payload as DayRow & { pct: number }
                  return (
                    <div className="rounded-lg bg-white border border-slate-200 shadow-lg p-3 text-xs space-y-1 min-w-[200px]">
                      <p className="font-bold text-slate-900">{label}</p>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                        <span className="text-slate-500">Planeado:</span>
                        <span className="font-mono text-right">{row.planeado}</span>
                        <span className="text-slate-500">Real:</span>
                        <span className="font-mono text-right font-bold">{row.real}</span>
                        <span className="text-slate-500">% cumplimiento:</span>
                        <span className="font-mono text-right font-bold">{row.pct.toFixed(0)}%</span>
                      </div>
                      {Object.keys(row.byCampaign).length > 0 && (
                        <div className="pt-1 mt-1 border-t border-slate-100">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Por campaña</p>
                          {Object.entries(row.byCampaign).map(([cid, n]) => (
                            <p key={cid} className="text-slate-600">
                              <span className="font-mono">{cid}</span>: {n}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="planeado" name="Planeado" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="real" name="Real" radius={[4, 4, 0, 0]}>
                {data.map((row, i) => (
                  <Cell key={i} fill={colorForBand(row.band).hex} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {showModal && <HallazgosModal onClose={() => setShowModal(false)} />}
    </div>
  )
}

import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import { CAMPAIGNS_APR_13_17, REOPENERS_CONTEXT } from '../data/plan'
import Collapse from './Collapse'

type Metric = 'or' | 'ctr' | 'hb' | 'sb'
const METRIC_CONFIG: Record<Metric, { label: string; color: string; threshold?: number }> = {
  or: { label: 'Open Rate %', color: '#6366f1' },
  ctr: { label: 'CTR %', color: '#10b981' },
  hb: { label: 'Hard Bounce %', color: '#ef4444', threshold: 2 },
  sb: { label: 'Soft Bounce %', color: '#f59e0b' },
}

function colorForHb(v: number) {
  if (v >= 5) return '#ef4444'
  if (v >= 2) return '#f59e0b'
  return '#10b981'
}

export default function CampaignsDetail() {
  const [metric, setMetric] = useState<Metric>('or')
  const cfg = METRIC_CONFIG[metric]

  // Summary stats
  const totalSent = CAMPAIGNS_APR_13_17.reduce((s, c) => s + c.sent, 0)
  const totalDeliv = CAMPAIGNS_APR_13_17.reduce((s, c) => s + c.deliv, 0)
  const avgOr = CAMPAIGNS_APR_13_17.reduce((s, c) => s + c.or, 0) / CAMPAIGNS_APR_13_17.length
  const maxHb = Math.max(...CAMPAIGNS_APR_13_17.map((c) => c.hb))
  const criticalHb = CAMPAIGNS_APR_13_17.filter((c) => c.hb >= 5).length

  return (
    <div className="space-y-6">
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500 font-semibold">Envíos totales</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalSent.toLocaleString()}</p>
          <p className="text-xs text-slate-500">en {CAMPAIGNS_APR_13_17.length} campañas</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500 font-semibold">Delivered</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalDeliv.toLocaleString()}</p>
          <p className="text-xs text-slate-500">{((totalDeliv / totalSent) * 100).toFixed(1)}% rate</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500 font-semibold">OR promedio</p>
          <p className="text-2xl font-bold text-[#0F52BA] mt-1">{avgOr.toFixed(1)}%</p>
          <p className="text-xs text-slate-500">rango 2.1% → 46.8%</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 border-l-4 border-l-rose-500">
          <p className="text-xs uppercase text-slate-500 font-semibold">HB crítico</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">{criticalHb}</p>
          <p className="text-xs text-slate-500">campañas con HB ≥ 5% · max {maxHb.toFixed(1)}%</p>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">21 campañas del 13 al 17 de abril</h3>
            <p className="text-sm text-slate-500">Click en las métricas para cambiar vista · umbral HB crítico en 2%</p>
          </div>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            {(Object.keys(METRIC_CONFIG) as Metric[]).map((m) => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  metric === m ? 'bg-white text-slate-900 shadow' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {METRIC_CONFIG[m].label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={CAMPAIGNS_APR_13_17} margin={{ top: 20, right: 20, left: 10, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="id"
                tick={{ fontSize: 10 }}
                label={{ value: 'Campaign ID', position: 'insideBottom', offset: -20, style: { fontSize: 12, fill: '#64748b' } }}
              />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
              {cfg.threshold && (
                <ReferenceLine y={cfg.threshold} stroke="#dc2626" strokeDasharray="3 3" label={{ value: `umbral ${cfg.threshold}%`, fontSize: 10, fill: '#dc2626', position: 'insideTopRight' }} />
              )}
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const c = payload[0].payload
                  return (
                    <div className="rounded-lg bg-white border border-slate-200 shadow-lg p-3 text-xs">
                      <p className="font-bold text-slate-900">#{c.id} · {c.date} {c.hour}</p>
                      <p className="text-slate-600">{c.domain}.me · {c.type}</p>
                      <div className="mt-2 space-y-0.5">
                        <p>Delivered: <span className="font-semibold">{c.deliv}/{c.sent}</span></p>
                        <p>OR: <span className="font-semibold text-[#0F52BA]">{c.or}%</span></p>
                        <p>CTR: <span className="font-semibold text-emerald-600">{c.ctr}%</span></p>
                        <p>HB: <span className={`font-semibold ${c.hb >= 5 ? 'text-rose-600' : c.hb >= 2 ? 'text-amber-600' : 'text-slate-700'}`}>{c.hb}%</span></p>
                        <p>SB: <span className="font-semibold">{c.sb}%</span></p>
                      </div>
                    </div>
                  )
                }}
              />
              <Bar dataKey={metric} radius={[4, 4, 0, 0]}>
                {CAMPAIGNS_APR_13_17.map((c, i) => (
                  <Cell key={i} fill={metric === 'hb' ? colorForHb(c.hb) : cfg.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ver detalle tabla completa */}
      <Collapse label="Ver tabla completa (21 filas × 11 columnas)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs uppercase text-slate-600 font-semibold">ID</th>
                <th className="px-3 py-2 text-left text-xs uppercase text-slate-600 font-semibold">Fecha</th>
                <th className="px-3 py-2 text-left text-xs uppercase text-slate-600 font-semibold">Hora</th>
                <th className="px-3 py-2 text-left text-xs uppercase text-slate-600 font-semibold">Dominio</th>
                <th className="px-3 py-2 text-left text-xs uppercase text-slate-600 font-semibold">Tipo</th>
                <th className="px-3 py-2 text-right text-xs uppercase text-slate-600 font-semibold">Sent</th>
                <th className="px-3 py-2 text-right text-xs uppercase text-slate-600 font-semibold">Deliv</th>
                <th className="px-3 py-2 text-right text-xs uppercase text-slate-600 font-semibold">OR%</th>
                <th className="px-3 py-2 text-right text-xs uppercase text-slate-600 font-semibold">CTR%</th>
                <th className="px-3 py-2 text-right text-xs uppercase text-slate-600 font-semibold">HB%</th>
                <th className="px-3 py-2 text-right text-xs uppercase text-slate-600 font-semibold">SB%</th>
              </tr>
            </thead>
            <tbody>
              {CAMPAIGNS_APR_13_17.map((c) => (
                <tr key={c.id} className={`border-b border-slate-100 hover:bg-slate-50 ${c.hb >= 5 ? 'bg-rose-50' : ''}`}>
                  <td className="px-3 py-2 font-bold text-slate-900">{c.id}</td>
                  <td className="px-3 py-2 text-slate-700">{c.date}</td>
                  <td className="px-3 py-2 text-slate-700 tabular-nums">{c.hour}</td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-700">{c.domain}</td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-600">{c.type}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{c.sent}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{c.deliv}</td>
                  <td className="px-3 py-2 text-right tabular-nums font-semibold text-[#0F52BA]">{c.or}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-emerald-600">{c.ctr}</td>
                  <td className={`px-3 py-2 text-right tabular-nums font-semibold ${c.hb >= 5 ? 'text-rose-600' : c.hb >= 2 ? 'text-amber-600' : 'text-slate-700'}`}>{c.hb}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-slate-700">{c.sb}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Collapse>

      {/* REOPENERS context callout */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 border-l-4 border-l-[#0F52BA]">
        <p className="text-xs uppercase text-[#0F52BA] font-semibold">Control experimental</p>
        <h3 className="text-base font-bold text-slate-900 mt-1">Los REOPENERS_10-04 nunca vieron estos dominios antes</h3>
        <p className="text-sm text-slate-700 mt-2 leading-relaxed">{REOPENERS_CONTEXT}</p>
      </div>
    </div>
  )
}

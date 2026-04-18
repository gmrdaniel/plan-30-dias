import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'
import type { BucketRow } from '../data/analysis'

type Props = {
  data: BucketRow[]
  title: string
  subtitle?: string
}

type Metric = 'orPct' | 'ctrPct' | 'delivered' | 'camps'

const METRIC_CONFIG = {
  orPct: { label: 'Open Rate %', color: '#6366f1', suffix: '%' },
  ctrPct: { label: 'CTR %', color: '#10b981', suffix: '%' },
  delivered: { label: 'Delivered', color: '#f59e0b', suffix: '' },
  camps: { label: '# Campañas', color: '#8b5cf6', suffix: '' },
}

export default function BucketChart({ data, title, subtitle }: Props) {
  const [metric, setMetric] = useState<Metric>('orPct')
  const cfg = METRIC_CONFIG[metric]

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
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
          <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="bucket" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const row = payload[0].payload as BucketRow
                return (
                  <div className="rounded-lg bg-white border border-slate-200 shadow-lg p-3 text-xs">
                    <p className="font-bold text-slate-900 mb-2">
                      {row.bucket} {row.isWinner && '🏆'}
                    </p>
                    <div className="space-y-1 text-slate-600">
                      <p>Campañas: <span className="font-semibold text-slate-900">{row.camps}</span></p>
                      <p>Delivered: <span className="font-semibold text-slate-900">{row.delivered.toLocaleString()}</span></p>
                      <p>Opens: <span className="font-semibold text-slate-900">{row.opens.toLocaleString()}</span></p>
                      <p>OR: <span className="font-semibold text-indigo-600">{row.orPct}%</span></p>
                      <p>CTR: <span className="font-semibold text-emerald-600">{row.ctrPct}%</span></p>
                    </div>
                  </div>
                )
              }}
            />
            <Bar dataKey={metric} fill={cfg.color} radius={[8, 8, 0, 0]}>
              {data.map((row, i) => (
                <Cell key={i} fill={row.isWinner ? '#f59e0b' : cfg.color} />
              ))}
              <LabelList
                dataKey={metric}
                position="top"
                style={{ fontSize: 11, fill: '#475569' }}
                formatter={(v: unknown) => {
                  const n = Number(v)
                  if (Number.isNaN(n)) return ''
                  return `${n.toLocaleString()}${cfg.suffix}`
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

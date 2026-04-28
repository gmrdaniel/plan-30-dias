import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { MetaSnapshot } from '../types'

interface Props {
  snapshots: MetaSnapshot[]   // ya filtrados por campaña
}

const COLORS: Record<number, string> = {
  3212141: '#94a3b8',
  3217790: '#6366f1',
}

function fmtTs(ts: string): string {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function CumulativeSendsChart({ snapshots }: Props) {
  // 1. Lista de campañas presentes
  const campaignNames = new Map<number, string>()
  for (const s of snapshots) campaignNames.set(s.campaign_id, s.campaign_name)
  const campaigns = [...campaignNames.entries()].sort((a, b) => a[0] - b[0])

  // 2. Construir filas: una por timestamp único, con cada campaña como columna
  const allTimestamps = [...new Set(snapshots.map((s) => s.taken_at))].sort()
  const data = allTimestamps.map((ts) => {
    const row: Record<string, string | number | null> = { ts, label: fmtTs(ts) }
    for (const [cid] of campaigns) {
      // Si no hay snapshot para esta campaña en este ts, dejar null para que la línea conecte el último valor conocido
      const snap = snapshots.find((s) => s.taken_at === ts && s.campaign_id === cid)
      row[`c_${cid}`] = snap ? (snap.sent_total ?? 0) : null
    }
    return row
  })

  // Forward-fill nulls para que la línea no se rompa
  for (const [cid] of campaigns) {
    let lastVal: number | null = null
    for (const row of data) {
      const k = `c_${cid}`
      if (row[k] != null) lastVal = row[k] as number
      else if (lastVal != null) row[k] = lastVal
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900">Sends acumulados</h3>
        <p className="text-sm text-slate-500">
          Total de envíos lifetime por campaña a lo largo del tiempo · cada punto es un snapshot
        </p>
      </div>
      {data.length === 0 ? (
        <p className="text-sm text-slate-400 italic">Sin snapshots aún.</p>
      ) : (
        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer>
            <AreaChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 18 }}>
              <defs>
                {campaigns.map(([cid]) => {
                  const c = COLORS[cid] ?? '#6366f1'
                  return (
                    <linearGradient key={cid} id={`grad_${cid}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={c} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={c} stopOpacity={0} />
                    </linearGradient>
                  )
                })}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} label={{ value: 'Sends acumulados', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#64748b' } }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null
                  return (
                    <div className="rounded-lg bg-white border border-slate-200 shadow-lg p-3 text-xs space-y-1">
                      <p className="font-bold text-slate-900">{label}</p>
                      {payload.map((p) => (
                        <p key={String(p.dataKey)} className="text-slate-700">
                          <span className="inline-block w-2 h-2 rounded mr-2" style={{ background: p.color }} />
                          {String(p.dataKey).replace('c_', '')}: <span className="font-bold">{p.value}</span>
                        </p>
                      ))}
                    </div>
                  )
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {campaigns.map(([cid, name]) => {
                const c = COLORS[cid] ?? '#6366f1'
                return (
                  <Area
                    key={cid}
                    type="monotone"
                    dataKey={`c_${cid}`}
                    name={name.replace(/^META-SmartLead-/i, '').slice(0, 28)}
                    stroke={c}
                    fill={`url(#grad_${cid})`}
                    strokeWidth={2.5}
                    dot={{ r: 2, fill: c }}
                    activeDot={{ r: 5 }}
                  />
                )
              })}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

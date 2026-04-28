import { useMemo, useState } from 'react'
import {
  Bar, BarChart, CartesianGrid, ComposedChart, Legend, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import type { DailyStat, MetaSnapshot } from '../types'

interface Props {
  dailyStats: DailyStat[]   // step=null only; filtered to selected campaigns
  snapshots: MetaSnapshot[] // for campaign names lookup
}

type Tab = 'combined' | 'opens' | 'rate'

const COLORS: Record<number, string> = {
  3212141: '#94a3b8',
  3217790: '#6366f1',
}

interface DayPivotRow {
  date: string
  campaigns: Map<number, { sent: number; opens: number }>
  totalOpens: number
  totalSent: number
  or: number
}

function pivot(daily: DailyStat[]): DayPivotRow[] {
  const byDate = new Map<string, DayPivotRow>()
  for (const d of daily) {
    if (d.step !== null) continue
    const cur = byDate.get(d.date) ?? {
      date: d.date,
      campaigns: new Map<number, { sent: number; opens: number }>(),
      totalOpens: 0,
      totalSent: 0,
      or: 0,
    }
    cur.campaigns.set(d.campaign_id, { sent: d.sent ?? 0, opens: d.opens ?? 0 })
    cur.totalOpens += d.opens ?? 0
    cur.totalSent += d.sent ?? 0
    byDate.set(d.date, cur)
  }
  return [...byDate.values()]
    .map((r) => ({ ...r, or: r.totalSent ? (r.totalOpens / r.totalSent) * 100 : 0 }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export default function OpensChart({ dailyStats, snapshots }: Props) {
  const [tab, setTab] = useState<Tab>('combined')

  const campaignNames = useMemo(() => {
    const m = new Map<number, string>()
    for (const s of snapshots) m.set(s.campaign_id, s.campaign_name)
    return m
  }, [snapshots])

  const rows = useMemo(() => pivot(dailyStats), [dailyStats])
  const cids = useMemo(() => {
    const set = new Set<number>()
    for (const r of rows) for (const cid of r.campaigns.keys()) set.add(cid)
    return [...set].sort((a, b) => a - b)
  }, [rows])

  // Recharts data shape — flatten campaigns into columns
  const data = useMemo(() => rows.map((r) => {
    const flat: Record<string, string | number> = { date: r.date, or: Number(r.or.toFixed(1)) }
    for (const cid of cids) {
      const c = r.campaigns.get(cid)
      flat[`opens_${cid}`] = c?.opens ?? 0
      flat[`sent_${cid}`] = c?.sent ?? 0
      flat[`or_${cid}`] = c && c.sent ? Number(((c.opens / c.sent) * 100).toFixed(1)) : 0
    }
    return flat
  }), [rows, cids])

  // KPIs
  const totalOpens = rows.reduce((acc, r) => acc + r.totalOpens, 0)
  const totalSent = rows.reduce((acc, r) => acc + r.totalSent, 0)
  const overallOR = totalSent ? (totalOpens / totalSent) * 100 : 0
  const peakDay = rows.reduce<DayPivotRow | null>(
    (best, r) => (!best || r.totalOpens > best.totalOpens ? r : best),
    null,
  )

  const tooltip = (
    <Tooltip
      content={({ active, payload, label }) => {
        if (!active || !payload?.length) return null
        return (
          <div className="rounded-lg bg-white border border-slate-200 shadow-lg p-3 text-xs space-y-1 min-w-[180px]">
            <p className="font-bold text-slate-900">{label}</p>
            {payload.map((p) => {
              const k = String(p.dataKey ?? '')
              if (!k) return null
              const isOR = k === 'or' || k.startsWith('or_')
              return (
                <p key={k} className="text-slate-700">
                  <span className="inline-block w-2 h-2 rounded mr-2" style={{ background: p.color }} />
                  {p.name as string}: <span className="font-bold">{p.value}{isOR ? '%' : ''}</span>
                </p>
              )
            })}
          </div>
        )
      }}
    />
  )

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-start justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Aperturas por día</h3>
          <p className="text-sm text-slate-500">Engagement de cada campaña a través del tiempo</p>
        </div>
        <div className="inline-flex border border-slate-200 rounded-lg overflow-hidden text-xs">
          {([
            ['combined', 'Combinado'],
            ['opens', 'Opens'],
            ['rate', 'Open Rate'],
          ] as [Tab, string][]).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 transition-colors ${
                tab === t
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'bg-white text-slate-500 hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
        <div className="rounded-lg bg-indigo-50 border border-indigo-200 p-3">
          <p className="text-indigo-700 uppercase tracking-wider text-[10px] font-semibold">Total opens</p>
          <p className="text-2xl font-bold text-indigo-900">{totalOpens.toLocaleString()}</p>
          <p className="text-[10px] text-indigo-600">de {totalSent.toLocaleString()} sends</p>
        </div>
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
          <p className="text-emerald-700 uppercase tracking-wider text-[10px] font-semibold">OR promedio</p>
          <p className="text-2xl font-bold text-emerald-900">{overallOR.toFixed(1)}%</p>
        </div>
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
          <p className="text-amber-700 uppercase tracking-wider text-[10px] font-semibold">Peak day</p>
          <p className="text-base font-bold text-amber-900">{peakDay?.date ?? '—'}</p>
          <p className="text-[10px] text-amber-600">{peakDay?.totalOpens ?? 0} opens</p>
        </div>
      </div>

      {data.length === 0 ? (
        <p className="text-sm text-slate-400 italic">Sin datos diarios todavía.</p>
      ) : (
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            {tab === 'opens' ? (
              <BarChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 18 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} label={{ value: 'Opens', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#64748b' } }} />
                {tooltip}
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {cids.map((cid) => (
                  <Bar
                    key={cid}
                    dataKey={`opens_${cid}`}
                    name={(campaignNames.get(cid) ?? `Camp ${cid}`).replace(/^META-SmartLead-/i, '').slice(0, 24)}
                    fill={COLORS[cid] ?? '#6366f1'}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            ) : tab === 'rate' ? (
              <LineChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 18 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} label={{ value: 'OR %', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#64748b' } }} />
                {tooltip}
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {cids.map((cid) => (
                  <Line
                    key={cid}
                    type="monotone"
                    dataKey={`or_${cid}`}
                    name={(campaignNames.get(cid) ?? `Camp ${cid}`).replace(/^META-SmartLead-/i, '').slice(0, 24)}
                    stroke={COLORS[cid] ?? '#6366f1'}
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            ) : (
              <ComposedChart data={data} margin={{ top: 12, right: 50, left: 0, bottom: 18 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} label={{ value: 'Opens', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#64748b' } }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 11 }} label={{ value: 'OR %', angle: 90, position: 'insideRight', style: { fontSize: 11, fill: '#64748b' } }} />
                {tooltip}
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {cids.map((cid) => (
                  <Bar
                    key={cid}
                    yAxisId="left"
                    dataKey={`opens_${cid}`}
                    name={`Opens · ${(campaignNames.get(cid) ?? cid).toString().replace(/^META-SmartLead-/i, '').slice(0, 18)}`}
                    fill={COLORS[cid] ?? '#6366f1'}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="or"
                  name="OR % (combinado)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  strokeDasharray="5 5"
                  dot={{ r: 4, fill: '#10b981' }}
                />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

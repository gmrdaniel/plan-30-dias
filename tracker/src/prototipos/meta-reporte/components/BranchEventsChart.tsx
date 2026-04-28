import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { BranchDailyAgg, BranchEvent } from '../types'

interface Props {
  events: BranchEvent[]
  daily: BranchDailyAgg[]
}

export default function BranchEventsChart({ events, daily }: Props) {
  const totalClicks = events.filter((e) => e.event_type === 'click').length
  const totalOpens = events.filter((e) => e.event_type === 'open').length
  const totalInstalls = events.filter((e) => e.event_type === 'install').length

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-start justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Branch.io · clicks/opens por día</h3>
          <p className="text-sm text-slate-500">
            Eventos recibidos vía webhook · {events.length} totales
          </p>
        </div>
        <div className="flex gap-3 text-xs">
          <span className="px-3 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
            Clicks: <span className="font-bold">{totalClicks}</span>
          </span>
          <span className="px-3 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            Opens: <span className="font-bold">{totalOpens}</span>
          </span>
          {totalInstalls > 0 && (
            <span className="px-3 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200">
              Installs: <span className="font-bold">{totalInstalls}</span>
            </span>
          )}
        </div>
      </div>
      {daily.length === 0 ? (
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-6 text-center">
          <p className="text-sm text-slate-600 font-semibold">Aún no hay eventos de Branch</p>
          <p className="text-xs text-slate-500 mt-2">
            Configura el webhook en Branch Dashboard → Settings → Integrations → Webhooks.
            URL del endpoint: <code className="bg-white px-1 rounded">https://&lt;project&gt;.functions.supabase.co/branch-webhook?secret=…</code>
          </p>
        </div>
      ) : (
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={daily} margin={{ top: 12, right: 12, left: 0, bottom: 18 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null
                  return (
                    <div className="rounded-lg bg-white border border-slate-200 shadow-lg p-3 text-xs space-y-1">
                      <p className="font-bold text-slate-900">{label}</p>
                      {payload.map((p) => (
                        <p key={String(p.dataKey)} className="text-slate-700">
                          <span className="inline-block w-2 h-2 rounded mr-2" style={{ background: p.color }} />
                          {String(p.dataKey)}: <span className="font-bold">{p.value}</span>
                        </p>
                      ))}
                    </div>
                  )
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="clicks" stackId="ev" fill="#6366f1" radius={[0, 0, 0, 0]} />
              <Bar dataKey="opens" stackId="ev" fill="#10b981" radius={[0, 0, 0, 0]} />
              <Bar dataKey="installs" stackId="ev" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

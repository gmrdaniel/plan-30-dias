import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts'

interface Row {
  date: string
  sent: number
  opens: number
  signups: number
}

interface Props {
  data: Row[]
}

export default function ConversionTrend({ data }: Props) {
  const enriched = data.map((d) => ({
    date: d.date.slice(5),
    'Open rate %': d.sent > 0 ? +((d.opens / d.sent) * 100).toFixed(1) : 0,
    'Conv. end-to-end %': d.sent > 0 ? +((d.signups / d.sent) * 100).toFixed(2) : 0,
    'Sends': d.sent,
    'Signups': d.signups,
  }))

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-lg font-bold text-slate-900 mb-1">Trend diario</h3>
      <p className="text-xs text-slate-500 mb-4">Open rate y conversion rate por día. Los volumenes (sends, signups) en el tooltip.</p>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={enriched} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis yAxisId="rate" tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={(v) => `${v}%`} />
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e2e8f0' }}
              formatter={(value, name) => {
                const v = typeof value === 'number' ? value : 0
                const n = String(name)
                if (n.includes('%')) return [`${v}%`, n]
                return [v.toLocaleString(), n]
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line yAxisId="rate" type="monotone" dataKey="Open rate %" stroke="#3b82f6" strokeWidth={2} dot={false} />
            <Line yAxisId="rate" type="monotone" dataKey="Conv. end-to-end %" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

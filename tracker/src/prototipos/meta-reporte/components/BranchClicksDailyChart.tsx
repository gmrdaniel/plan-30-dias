import { useMemo } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { BranchClickDaily } from '../types'

interface Props {
  daily: BranchClickDaily[]
}

const ALIAS_COLORS: Record<string, string> = {
  'apply-fast-track-ana': '#0F52BA',   // blue (Step 1)
  'friction-removal-ana': '#10B981',   // emerald (Step 2)
  'social-proof-ana':     '#F59E0B',   // amber (Step 3)
  'last-chance-meta':     '#EF4444',   // rose (Step 4)
}

const ALIAS_LABEL: Record<string, string> = {
  'apply-fast-track-ana': 'Step 1 · Intro',
  'friction-removal-ana': 'Step 2 · Friction',
  'social-proof-ana':     'Step 3 · Social Proof',
  'last-chance-meta':     'Step 4 · Last Chance',
}

export default function BranchClicksDailyChart({ daily }: Props) {
  const { data, aliases } = useMemo(() => {
    // Pivot por fecha → cada alias es una columna
    const byDate = new Map<string, Record<string, number | string>>()
    const seenAliases = new Set<string>()
    for (const d of daily) {
      seenAliases.add(d.alias)
      const cur = byDate.get(d.click_date) ?? { date: d.click_date }
      cur[d.alias] = ((cur[d.alias] as number) ?? 0) + d.clicks
      byDate.set(d.click_date, cur)
    }
    const sorted = Array.from(byDate.values()).sort((a, b) => String(a.date).localeCompare(String(b.date)))
    // Llenar 0s para fechas sin datos (líneas se ven más limpias)
    if (sorted.length > 0) {
      for (const row of sorted) {
        for (const a of seenAliases) {
          if (!(a in row)) row[a] = 0
        }
      }
    }
    return { data: sorted, aliases: Array.from(seenAliases).sort() }
  }, [daily])

  if (data.length === 0) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h3 className="text-base font-bold text-slate-900">Clicks por día — timeline</h3>
        <p className="text-xs text-slate-500 italic mt-2">Sin datos. Importa los CSVs Branch primero.</p>
      </section>
    )
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <span aria-hidden>📈</span> Clicks por día — todas las stages superpuestas
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Picos no siempre coinciden con día de envío — hay rebote de 24-48h sobre todo en steps tardíos.
        </p>
      </header>

      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 18 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} label={{ value: 'Clicks', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#64748b' } }} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                return (
                  <div className="rounded-lg bg-white border border-slate-200 shadow-lg p-3 text-xs space-y-0.5 min-w-[180px]">
                    <p className="font-bold text-slate-900 mb-1">{label}</p>
                    {payload
                      .filter((p) => (p.value as number) > 0)
                      .sort((a, b) => (b.value as number) - (a.value as number))
                      .map((p) => (
                        <div key={p.dataKey as string} className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-1">
                            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                            <span className="text-slate-700">{ALIAS_LABEL[p.dataKey as string] ?? p.dataKey}</span>
                          </span>
                          <span className="font-mono tabular-nums font-bold">{p.value as number}</span>
                        </div>
                      ))}
                  </div>
                )
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} formatter={(value) => ALIAS_LABEL[value] ?? value} />
            {aliases.map((a) => (
              <Line
                key={a}
                type="monotone"
                dataKey={a}
                stroke={ALIAS_COLORS[a] ?? '#64748b'}
                strokeWidth={2}
                dot={{ r: 2 }}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

import { useMemo, useState } from 'react'
import type { BranchClickBreakdown, BranchClickDimension } from '../types'

interface Props {
  breakdowns: BranchClickBreakdown[]
}

const DIMENSION_LABEL: Record<BranchClickDimension, string> = {
  os: 'OS',
  browser: 'Browser',
  platform: 'Platform',
  referrer: 'Referring domain',
}

const STEP_OF_ALIAS: Record<string, number> = {
  'apply-fast-track-ana': 1,
  'friction-removal-ana': 2,
  'social-proof-ana': 3,
  'last-chance-meta': 4,
}

/**
 * Tabla cross-tab: categoría × alias (steps) con totals.
 * Cambia dimensión con tabs internos.
 */
export default function BranchClicksBreakdownTable({ breakdowns }: Props) {
  const [dim, setDim] = useState<BranchClickDimension>('browser')

  const { categories, aliases, matrix, totals } = useMemo(() => {
    const filtered = breakdowns.filter((b) => b.dimension === dim)
    const cats = new Set<string>()
    const aliasSet = new Set<string>()
    const m = new Map<string, Map<string, number>>()
    for (const b of filtered) {
      cats.add(b.category)
      aliasSet.add(b.alias)
      const cm = m.get(b.category) ?? new Map()
      cm.set(b.alias, (cm.get(b.alias) ?? 0) + b.clicks)
      m.set(b.category, cm)
    }
    const aliasList = [...aliasSet].sort((a, b) => (STEP_OF_ALIAS[a] ?? 99) - (STEP_OF_ALIAS[b] ?? 99))
    const t = new Map<string, number>()
    for (const c of cats) {
      let sum = 0
      for (const a of aliasList) sum += m.get(c)?.get(a) ?? 0
      t.set(c, sum)
    }
    const catList = [...cats].sort((a, b) => (t.get(b) ?? 0) - (t.get(a) ?? 0))
    return { categories: catList, aliases: aliasList, matrix: m, totals: t }
  }, [breakdowns, dim])

  if (breakdowns.length === 0) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h3 className="text-base font-bold text-slate-900">Browser / Platform / Referrer breakdown</h3>
        <p className="text-xs text-slate-500 italic mt-2">Sin datos breakdown.</p>
      </section>
    )
  }

  const totalGrand = Array.from(totals.values()).reduce((a, b) => a + b, 0)

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <span aria-hidden>📊</span> Breakdown cruzado: {DIMENSION_LABEL[dim]} × step
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Sortado por total. Útil para detectar referrers raros, browsers extraños, OS dominantes.
        </p>
      </header>

      {/* Tabs de dimensión */}
      <div className="flex gap-1 mb-3">
        {(['browser', 'platform', 'referrer', 'os'] as BranchClickDimension[]).map((d) => (
          <button
            key={d}
            onClick={() => setDim(d)}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
              dim === d
                ? 'bg-[#0F52BA] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {DIMENSION_LABEL[d]}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-500">
              <th className="text-left py-2 pr-3">{DIMENSION_LABEL[dim]}</th>
              {aliases.map((a) => (
                <th key={a} className="text-right py-2 px-2">
                  Step {STEP_OF_ALIAS[a] ?? '?'}
                </th>
              ))}
              <th className="text-right py-2 pl-2 font-bold">Total</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => {
              const total = totals.get(c) ?? 0
              const pct = totalGrand > 0 ? (total / totalGrand) * 100 : 0
              return (
                <tr key={c} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                  <td className="py-1.5 pr-3 font-mono text-xs text-slate-800">{c}</td>
                  {aliases.map((a) => {
                    const v = matrix.get(c)?.get(a) ?? 0
                    return (
                      <td key={a} className="py-1.5 px-2 text-right tabular-nums text-slate-600">
                        {v > 0 ? v : <span className="text-slate-300">—</span>}
                      </td>
                    )
                  })}
                  <td className="py-1.5 pl-2 text-right tabular-nums font-bold text-slate-800">
                    {total}
                    <span className="block text-[10px] font-normal text-slate-400">{pct.toFixed(1)}%</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

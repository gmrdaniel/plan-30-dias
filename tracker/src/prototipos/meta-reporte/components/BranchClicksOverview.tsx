import { useMemo } from 'react'
import type { BranchClickBreakdown, BranchClickDaily } from '../types'

interface Props {
  daily: BranchClickDaily[]
  breakdowns: BranchClickBreakdown[]
}

// Mapeo alias → step de la secuencia (orden cronológico del email)
const STEP_OF_ALIAS: Record<string, number> = {
  'apply-fast-track-ana': 1,
  'friction-removal-ana': 2,
  'social-proof-ana': 3,
  'last-chance-meta': 4,
}

const STEP_LABEL: Record<number, string> = {
  1: 'Step 1 · Intro',
  2: 'Step 2 · Friction',
  3: 'Step 3 · Social Proof',
  4: 'Step 4 · Last Chance',
}

/** Heurística para identificar clicks de bots (no humanos):
 * - Linux OS: prefetch de email security scanners (Defender, Proofpoint, Mimecast)
 * - GSA browser: Google Search Appliance crawler
 */
function isBotClick(b: BranchClickBreakdown): boolean {
  if (b.dimension === 'os' && b.category.toUpperCase() === 'LINUX') return true
  if (b.dimension === 'browser' && b.category.toUpperCase() === 'GSA') return true
  return false
}

export default function BranchClicksOverview({ daily, breakdowns }: Props) {
  const stats = useMemo(() => {
    // Por alias: total daily + bots
    const byAlias = new Map<string, { total: number; bots: number; step: number }>()
    for (const d of daily) {
      const cur = byAlias.get(d.alias) ?? { total: 0, bots: 0, step: STEP_OF_ALIAS[d.alias] ?? 99 }
      cur.total += d.clicks
      byAlias.set(d.alias, cur)
    }
    // Para bots: usamos dimension=os category=LINUX como la mejor proxy
    // (no podemos restar bots de daily porque daily no tiene OS desglosado;
    // pero podemos reportar % estimado por alias)
    for (const b of breakdowns) {
      if (!isBotClick(b)) continue
      const cur = byAlias.get(b.alias)
      if (!cur) continue
      cur.bots += b.clicks
    }

    const rows = [...byAlias.entries()]
      .map(([alias, v]) => ({ alias, ...v, pctBots: v.total > 0 ? (v.bots / v.total) * 100 : 0 }))
      .sort((a, b) => a.step - b.step)

    const total = rows.reduce((a, r) => a + r.total, 0)
    const bots = rows.reduce((a, r) => a + r.bots, 0)
    const human = total - bots
    return { rows, total, bots, human, pctBots: total > 0 ? (bots / total) * 100 : 0 }
  }, [daily, breakdowns])

  if (stats.total === 0) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h3 className="text-base font-bold text-slate-900">Resumen Branch.io</h3>
        <p className="text-xs text-slate-500 mt-1">
          Sin data importada todavía. Corre <code className="bg-slate-100 px-1 rounded">python scripts/_import_branch_csvs.py</code> tras dropear los CSVs en <code className="bg-slate-100 px-1 rounded">branch-csv/inbox/&lt;alias&gt;/</code>.
        </p>
      </section>
    )
  }

  const maxBar = Math.max(...stats.rows.map((r) => r.total), 1)

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm space-y-5">
      <header>
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <span aria-hidden>🔗</span> Clicks Branch — resumen por step
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Total ventana: {stats.total.toLocaleString('en-US')} clicks · estimado <b className="text-amber-700">{stats.bots} bots</b> ({stats.pctBots.toFixed(1)}%) → <b className="text-emerald-700">{stats.human.toLocaleString('en-US')} humanos netos</b>
        </p>
      </header>

      {/* Funnel por step */}
      <div className="space-y-2">
        {stats.rows.map((r) => {
          const w = (r.total / maxBar) * 100
          const wHuman = ((r.total - r.bots) / maxBar) * 100
          return (
            <div key={r.alias}>
              <div className="flex items-baseline justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">{STEP_LABEL[r.step] ?? r.alias}</span>
                <span className="font-mono tabular-nums text-slate-500">
                  <code className="bg-slate-100 px-1 rounded text-[10px]">{r.alias}</code>
                  <span className="ml-2 text-slate-700 font-bold">{r.total}</span> clicks
                  {r.bots > 0 && <span className="ml-2 text-amber-700">-{r.bots} bots</span>}
                </span>
              </div>
              <div className="relative h-7 rounded bg-slate-100 overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-emerald-300" style={{ width: `${wHuman}%` }} />
                <div className="absolute inset-y-0 bg-amber-200" style={{ left: `${wHuman}%`, width: `${w - wHuman}%` }} />
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-[11px] text-slate-500 leading-relaxed">
        <span className="inline-block w-3 h-3 align-middle rounded bg-emerald-300 mr-1" /> Humanos
        <span className="inline-block w-3 h-3 align-middle rounded bg-amber-200 ml-3 mr-1" /> Bots (Linux/GSA — scanners de seguridad de email).
      </p>
    </section>
  )
}

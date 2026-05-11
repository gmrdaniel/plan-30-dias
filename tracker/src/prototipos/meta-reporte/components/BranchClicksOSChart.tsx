import { useMemo } from 'react'
import type { BranchClickBreakdown } from '../types'

interface Props {
  breakdowns: BranchClickBreakdown[]
}

const STEP_OF_ALIAS: Record<string, number> = {
  'apply-fast-track-ana': 1,
  'friction-removal-ana': 2,
  'social-proof-ana': 3,
  'last-chance-meta': 4,
}

const STEP_LABEL: Record<number, string> = {
  1: 'Step 1',
  2: 'Step 2',
  3: 'Step 3',
  4: 'Step 4',
}

// Colores por OS — Linux destacado en amber porque es proxy de bots
const OS_COLORS: Record<string, string> = {
  WINDOWS: '#0F52BA',
  MAC_OS:  '#94a3b8',
  IOS:     '#10B981',
  ANDROID: '#84cc16',
  LINUX:   '#F59E0B',
  OTHER:   '#cbd5e1',
}

const OS_LABELS: Record<string, string> = {
  WINDOWS: 'Windows',
  MAC_OS:  'macOS',
  IOS:     'iOS',
  ANDROID: 'Android',
  LINUX:   'Linux (bots)',
  OTHER:   'Otro',
}

const OS_ORDER = ['WINDOWS', 'IOS', 'MAC_OS', 'ANDROID', 'LINUX', 'OTHER']

export default function BranchClicksOSChart({ breakdowns }: Props) {
  const rows = useMemo(() => {
    // Por alias: { os → clicks, total }
    const byAlias = new Map<string, { os: Map<string, number>; total: number; step: number }>()
    for (const b of breakdowns) {
      if (b.dimension !== 'os') continue
      const cur = byAlias.get(b.alias) ?? { os: new Map(), total: 0, step: STEP_OF_ALIAS[b.alias] ?? 99 }
      cur.os.set(b.category, (cur.os.get(b.category) ?? 0) + b.clicks)
      cur.total += b.clicks
      byAlias.set(b.alias, cur)
    }
    return [...byAlias.entries()]
      .map(([alias, v]) => ({ alias, ...v }))
      .sort((a, b) => a.step - b.step)
  }, [breakdowns])

  if (rows.length === 0) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h3 className="text-base font-bold text-slate-900">Distribución OS por step</h3>
        <p className="text-xs text-slate-500 italic mt-2">Sin datos breakdown todavía.</p>
      </section>
    )
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <span aria-hidden>💻</span> Distribución OS por step de la secuencia
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Patrón: a más avanzado el step, más desktop-heavy. iOS engancha temprano; los desktop tardíos suelen ser managers/agencies/security scanners.
        </p>
      </header>

      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.alias}>
            <div className="flex items-baseline justify-between mb-1 text-xs">
              <span className="font-semibold text-slate-700">
                {STEP_LABEL[r.step]} · <code className="bg-slate-100 px-1 rounded text-[10px]">{r.alias}</code>
              </span>
              <span className="text-slate-500 font-mono tabular-nums">{r.total} clicks</span>
            </div>
            <div className="flex h-7 rounded overflow-hidden border border-slate-200">
              {OS_ORDER.map((os) => {
                const c = r.os.get(os) ?? 0
                if (c === 0) return null
                const w = (c / r.total) * 100
                return (
                  <div
                    key={os}
                    className="flex items-center justify-center text-[10px] font-bold text-white whitespace-nowrap overflow-hidden"
                    style={{ width: `${w}%`, background: OS_COLORS[os] ?? '#94a3b8' }}
                    title={`${OS_LABELS[os]}: ${c} (${w.toFixed(1)}%)`}
                  >
                    {w >= 8 && <span>{OS_LABELS[os]} {w.toFixed(0)}%</span>}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Leyenda */}
      <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-slate-600">
        {OS_ORDER.map((os) => (
          <span key={os} className="inline-flex items-center gap-1">
            <span className="w-3 h-3 rounded inline-block" style={{ background: OS_COLORS[os] }} />
            {OS_LABELS[os]}
          </span>
        ))}
      </div>
    </section>
  )
}

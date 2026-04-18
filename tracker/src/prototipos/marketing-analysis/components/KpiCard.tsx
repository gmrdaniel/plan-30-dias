import type { ReactNode } from 'react'

type Props = {
  label: string
  value: string | number
  sublabel?: string
  icon?: ReactNode
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate'
}

const COLOR_CLASSES = {
  indigo: 'bg-indigo-50 border-indigo-200 text-indigo-900',
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  amber: 'bg-amber-50 border-amber-200 text-amber-900',
  rose: 'bg-rose-50 border-rose-200 text-rose-900',
  slate: 'bg-slate-50 border-slate-200 text-slate-900',
}

const ICON_COLOR_CLASSES = {
  indigo: 'text-indigo-600',
  emerald: 'text-emerald-600',
  amber: 'text-amber-600',
  rose: 'text-rose-600',
  slate: 'text-slate-600',
}

export default function KpiCard({ label, value, sublabel, icon, color = 'slate' }: Props) {
  return (
    <div className={`rounded-xl border p-5 ${COLOR_CLASSES[color]} transition-transform hover:scale-[1.02]`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
          {sublabel && <p className="mt-1 text-sm opacity-70">{sublabel}</p>}
        </div>
        {icon && <div className={`${ICON_COLOR_CLASSES[color]} opacity-80`}>{icon}</div>}
      </div>
    </div>
  )
}

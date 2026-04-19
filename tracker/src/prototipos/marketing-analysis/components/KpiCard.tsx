import type { ReactNode } from 'react'

type Props = {
  label: string
  value: string | number
  sublabel?: string
  icon?: ReactNode
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate'
}

const COLOR_CLASSES = {
  indigo: 'bg-white border-slate-200 text-slate-900',
  emerald: 'bg-white border-slate-200 text-slate-900',
  amber: 'bg-white border-slate-200 text-slate-900',
  rose: 'bg-white border-slate-200 text-slate-900',
  slate: 'bg-white border-slate-200 text-slate-900',
}

const ACCENT_BAR = {
  indigo: 'before:bg-[#0F52BA]',
  emerald: 'before:bg-emerald-600',
  amber: 'before:bg-[#F59E0B]',
  rose: 'before:bg-rose-600',
  slate: 'before:bg-slate-400',
}

const ICON_COLOR_CLASSES = {
  indigo: 'text-[#0F52BA]',
  emerald: 'text-emerald-600',
  amber: 'text-[#F59E0B]',
  rose: 'text-rose-600',
  slate: 'text-slate-600',
}

export default function KpiCard({ label, value, sublabel, icon, color = 'slate' }: Props) {
  return (
    <div className={`relative rounded-lg border p-5 ${COLOR_CLASSES[color]} ${ACCENT_BAR[color]} overflow-hidden before:absolute before:left-0 before:top-0 before:h-full before:w-1 transition-shadow hover:shadow-md`}>
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

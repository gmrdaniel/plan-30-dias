import type { ReactNode } from 'react'

type Props = {
  number: string
  title: string
  subtitle?: string
  intro?: ReactNode
  children: ReactNode
  accentColor?: 'indigo' | 'rose' | 'amber' | 'emerald' | 'purple'
}

const ACCENTS = {
  indigo: { bg: 'bg-[#0F52BA]', text: 'text-[#0F52BA]', border: 'border-slate-200', light: 'bg-slate-50' },
  rose: { bg: 'bg-rose-600', text: 'text-rose-600', border: 'border-rose-200', light: 'bg-rose-50' },
  amber: { bg: 'bg-[#F59E0B]', text: 'text-[#F59E0B]', border: 'border-amber-200', light: 'bg-amber-50' },
  emerald: { bg: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-200', light: 'bg-emerald-50' },
  purple: { bg: 'bg-slate-800', text: 'text-slate-700', border: 'border-slate-200', light: 'bg-slate-50' },
}

export default function Chapter({ number, title, subtitle, intro, children, accentColor = 'indigo' }: Props) {
  const a = ACCENTS[accentColor]
  return (
    <section className="relative py-12 md:py-16">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        {/* Numbered badge + title in one row */}
        <div className="flex items-center gap-4 mb-2">
          <span className={`inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-lg ${a.bg} text-white font-bold text-lg shadow-sm shrink-0`}>
            {number}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">{title}</h2>
        </div>
        {subtitle && <p className={`text-lg ${a.text} font-medium mb-4 md:ml-[4.5rem]`}>{subtitle}</p>}
        {intro && <div className="text-slate-600 text-base md:text-lg leading-relaxed max-w-3xl mb-8 md:ml-[4.5rem]">{intro}</div>}

        <div className="mt-8">
          {children}
        </div>
      </div>
    </section>
  )
}

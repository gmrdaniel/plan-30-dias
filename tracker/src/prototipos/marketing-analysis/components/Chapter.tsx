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
  indigo: { bg: 'bg-indigo-600', text: 'text-indigo-600', border: 'border-indigo-200', light: 'bg-indigo-50' },
  rose: { bg: 'bg-rose-600', text: 'text-rose-600', border: 'border-rose-200', light: 'bg-rose-50' },
  amber: { bg: 'bg-amber-600', text: 'text-amber-600', border: 'border-amber-200', light: 'bg-amber-50' },
  emerald: { bg: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-200', light: 'bg-emerald-50' },
  purple: { bg: 'bg-purple-600', text: 'text-purple-600', border: 'border-purple-200', light: 'bg-purple-50' },
}

export default function Chapter({ number, title, subtitle, intro, children, accentColor = 'indigo' }: Props) {
  const a = ACCENTS[accentColor]
  return (
    <section className="relative py-12 md:py-16">
      {/* Numbered badge + title */}
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <div className="flex items-center gap-4 mb-3">
          <span className={`inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full ${a.bg} text-white font-bold text-lg shadow-lg`}>
            {number}
          </span>
          <div className="h-px bg-slate-200 flex-1" />
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">{title}</h2>
        {subtitle && <p className={`text-lg ${a.text} font-medium mb-4`}>{subtitle}</p>}
        {intro && <div className="text-slate-600 text-base md:text-lg leading-relaxed max-w-3xl mb-8">{intro}</div>}

        <div className="mt-8">
          {children}
        </div>
      </div>
    </section>
  )
}

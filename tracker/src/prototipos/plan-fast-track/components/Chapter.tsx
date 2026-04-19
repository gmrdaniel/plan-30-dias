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
  indigo: { bg: 'bg-[#0F52BA]', text: 'text-[#0F52BA]' },
  rose: { bg: 'bg-rose-600', text: 'text-rose-600' },
  amber: { bg: 'bg-[#F59E0B]', text: 'text-[#F59E0B]' },
  emerald: { bg: 'bg-emerald-600', text: 'text-emerald-600' },
  purple: { bg: 'bg-slate-800', text: 'text-slate-700' },
}

export default function Chapter({ number, title, subtitle, intro, children, accentColor = 'indigo' }: Props) {
  const a = ACCENTS[accentColor]
  return (
    <section className="relative py-12 md:py-16">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <div className="flex items-center gap-4 mb-2">
          <span className={`inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-lg ${a.bg} text-white font-bold text-lg shadow-sm shrink-0`}>
            {number}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">{title}</h2>
        </div>
        {subtitle && <p className={`text-lg ${a.text} font-medium mb-4 md:ml-[4.5rem]`}>{subtitle}</p>}
        {intro && <div className="text-slate-600 text-base md:text-lg leading-relaxed max-w-3xl mb-8 md:ml-[4.5rem]">{intro}</div>}

        <div className="mt-8">{children}</div>
      </div>
    </section>
  )
}

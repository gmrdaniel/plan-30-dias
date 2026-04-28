import { Link } from 'react-router-dom'

interface Card {
  to: string
  title: string
  subtitle: string
  description: string
  accent: 'meta' | 'forms' | 'capacity'
  icon: React.ReactNode
  bullets: string[]
}

const ICONS = {
  meta: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 6L12 13 2 6"/><rect x="2" y="4" width="20" height="16" rx="2"/>
    </svg>
  ),
  forms: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
    </svg>
  ),
  capacity: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  ),
}

const CARDS: Card[] = [
  {
    to: '/meta-reporte',
    title: 'Reporte Meta',
    subtitle: '2 campañas · cold outreach Fast Track',
    description: 'Performance day-by-day de Plan B y Ana. Sends · opens · OR · acumulado · burndown · tracking Branch.io.',
    accent: 'meta',
    icon: ICONS.meta,
    bullets: [
      'Cap diario 180 (9 buzones × 20)',
      'Snapshots 7 AM / 7 PM MX',
      'Cards: Daily, Hourly, Cumulative, Branch',
    ],
  },
  {
    to: '/formularios-reporte',
    title: 'Reporte Formularios',
    subtitle: '4 campañas · warm leads que llenaron form',
    description: 'KPIs específicos para warm: replies y reply rate destacados. Comparativa entre campañas con ranking visual.',
    accent: 'forms',
    icon: ICONS.forms,
    bullets: [
      'Cap diario 150 (6 buzones × 25)',
      'F1 21-04 (2 variantes) + F2 23-04 (EN/ES)',
      'Comparativa: Leads, Penetración, OR, Replies',
    ],
  },
  {
    to: '/capacidad-envios',
    title: 'Capacidad de envíos',
    subtitle: '15 buzones · ramp-up plan 8 semanas',
    description: 'Senders por pool (elevn / laneta), reputación, plan progresivo a 50/buzón sostenible, fuentes de monitoreo.',
    accent: 'capacity',
    icon: ICONS.capacity,
    bullets: [
      'Tabla detallada por inbox (cap, warmup, rep)',
      'Plan +5/buzón cada 7 días con go/no-go rules',
      'Fuentes: Postmaster, SNDS, MXToolbox, etc.',
    ],
  },
]

const ACCENTS = {
  meta: { bg: 'from-indigo-500 to-indigo-700', ring: 'hover:ring-indigo-400', icon: 'text-indigo-200', dot: 'bg-indigo-400' },
  forms: { bg: 'from-emerald-500 to-emerald-700', ring: 'hover:ring-emerald-400', icon: 'text-emerald-200', dot: 'bg-emerald-400' },
  capacity: { bg: 'from-amber-500 to-orange-600', ring: 'hover:ring-amber-400', icon: 'text-amber-200', dot: 'bg-amber-400' },
}

export default function SmartleadHubPage() {
  return (
    <div className="ma-root min-h-screen bg-[#F8F9FB] text-slate-900">
      {/* Top bar */}
      <nav className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-block w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-emerald-500 to-amber-500" />
          <div>
            <p className="font-bold text-slate-900 text-sm leading-tight">Smartlead · Operación</p>
            <p className="text-xs text-slate-500 leading-tight">Hub de dashboards · Meta · Formularios · Capacidad</p>
          </div>
        </div>
        <Link to="/" className="text-xs text-slate-500 hover:text-slate-900">← Tracker</Link>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0B1120] text-white">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1120] via-indigo-950/40 to-emerald-950/40" />
        <div className="relative max-w-5xl mx-auto px-4 md:px-8 py-14 md:py-20 text-center">
          <p className="text-slate-300 uppercase tracking-widest text-xs font-bold">Operación de envíos</p>
          <h1 className="text-4xl md:text-5xl font-bold mt-3 leading-tight">
            Tres dashboards. <span className="text-emerald-400">Una sola operación.</span>
          </h1>
          <p className="text-slate-300 mt-5 max-w-2xl mx-auto leading-relaxed">
            Performance por campaña, comparativa entre formularios y capacidad de los buzones —
            todo lo que necesitas para presentar y decidir cuándo subir caps de envío.
          </p>
        </div>
      </section>

      {/* Cards grid */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CARDS.map((card, i) => {
            const a = ACCENTS[card.accent]
            return (
              <Link
                key={card.to}
                to={card.to}
                className={`group block rounded-2xl overflow-hidden ring-1 ring-slate-200 bg-white shadow-sm hover:shadow-2xl transition-all duration-200 hover:-translate-y-1 hover:ring-2 ${a.ring}`}
              >
                <div className={`bg-gradient-to-br ${a.bg} p-6 text-white relative overflow-hidden`}>
                  <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
                  <div className={`relative ${a.icon} mb-4`}>{card.icon}</div>
                  <p className="relative text-[10px] uppercase tracking-widest font-bold text-white/70 mb-1">
                    {String(i + 1).padStart(2, '0')} · {card.subtitle}
                  </p>
                  <h2 className="relative text-2xl font-bold">{card.title}</h2>
                </div>
                <div className="p-6">
                  <p className="text-sm text-slate-700 leading-relaxed mb-4">{card.description}</p>
                  <ul className="space-y-2 mb-5">
                    {card.bullets.map((b, j) => (
                      <li key={j} className="text-xs text-slate-600 flex items-start gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${a.dot} mt-1.5 shrink-0`} />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="text-xs font-semibold text-slate-400 group-hover:text-slate-900 transition-colors flex items-center gap-1">
                    Abrir dashboard
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:translate-x-1">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Footer info */}
        <div className="mt-10 rounded-lg border border-slate-200 bg-white p-5 text-xs text-slate-500">
          <p className="font-semibold text-slate-700 mb-2">Cómo se actualizan los dashboards</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="font-semibold text-slate-600 mb-1">Snapshots automáticos</p>
              <p>Cron 7:00 / 19:00 MX (pendiente programar)</p>
            </div>
            <div>
              <p className="font-semibold text-slate-600 mb-1">Snapshots manuales</p>
              <code className="block bg-slate-50 px-2 py-1 rounded font-mono mt-1 text-[10px]">
                python _snapshot_meta.py<br/>python _snapshot_inboxes.py
              </code>
            </div>
            <div>
              <p className="font-semibold text-slate-600 mb-1">Hourly CSV</p>
              <p>Drop en <code className="bg-slate-50 px-1 rounded">plan-b/reporte-smartLead/</code> + <code className="bg-slate-50 px-1 rounded">_import_smartlead_hourly_csv.py</code></p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

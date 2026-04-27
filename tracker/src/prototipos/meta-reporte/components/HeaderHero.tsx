import type { CampaignDelta } from '../types'
import { colorBand, colorForBand } from '../data/queries'

interface Props {
  deltas: CampaignDelta[]
  lastSnapshotAt: string | null
}

export default function HeaderHero({ deltas, lastSnapshotAt }: Props) {
  const totalSent = deltas.reduce((acc, d) => acc + (d.current.sent_total ?? 0), 0)
  const totalUniqSent = deltas.reduce((acc, d) => acc + (d.current.sent_unique ?? 0), 0)
  const totalUniqOpens = deltas.reduce((acc, d) => acc + (d.current.opens_unique ?? 0), 0)
  const or = totalUniqSent ? (totalUniqOpens / totalUniqSent) * 100 : 0

  return (
    <section className="relative overflow-hidden bg-[#0B1120] text-white">
      <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B1120] via-[#0B1120] to-[#0F52BA]/30" />
      <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-10 md:py-14">
        <p className="text-slate-300 uppercase tracking-widest text-xs font-bold">Reporte Meta · histórico</p>
        <h1 className="text-3xl md:text-5xl font-bold mt-2 leading-tight">
          Campañas Meta — <span className="text-[#F59E0B]">{totalSent.toLocaleString()} sends</span>
          {' · '}<span className="text-emerald-400">{or.toFixed(1)}% OR</span>
        </h1>
        <p className="text-slate-300 mt-3 text-sm">
          Último snapshot: <span className="font-mono text-white">{lastSnapshotAt ?? '—'}</span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {deltas.map((d) => {
            const cap = d.current.daily_cap_target ?? 180
            const pct = cap ? (d.deltaSentSinceLast / cap) * 100 : 0
            const band = colorBand(pct, d.status)
            const c = colorForBand(band)
            return (
              <div key={d.campaign_id} className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-slate-400">{d.campaign_id}</p>
                    <p className="font-bold text-base">{d.campaign_name}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-md font-mono ${
                    d.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-500/20 text-slate-300'
                  }`}>{d.status}</span>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4 text-center">
                  <div>
                    <p className="text-[11px] text-slate-400 uppercase tracking-wide">Sends</p>
                    <p className="text-2xl font-bold">{(d.current.sent_total ?? 0).toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500">uniq {(d.current.sent_unique ?? 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 uppercase tracking-wide">Opens</p>
                    <p className="text-2xl font-bold">{(d.current.opens_total ?? 0).toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500">uniq {(d.current.opens_unique ?? 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 uppercase tracking-wide">OR</p>
                    <p className="text-2xl font-bold">
                      {(d.current.sent_unique ?? 0)
                        ? ((d.current.opens_unique ?? 0) / (d.current.sent_unique ?? 1) * 100).toFixed(1)
                        : '—'}%
                    </p>
                  </div>
                </div>
                <div className={`mt-4 rounded-lg border px-3 py-2 ${c.border} ${c.bg}`}>
                  <p className="text-[11px] uppercase tracking-wide font-semibold" style={{ color: c.hex }}>
                    Δ desde último snapshot
                    {d.hoursSinceLast != null && <span className="ml-1 opacity-60">({d.hoursSinceLast.toFixed(1)}h)</span>}
                  </p>
                  <p className={`text-xl font-bold ${c.text}`}>
                    +{d.deltaSentSinceLast} sends · +{d.deltaOpensSinceLast} opens
                  </p>
                  <p className={`text-[11px] ${c.text}`}>
                    {pct.toFixed(0)}% del cap target {cap} · cap efectivo hoy {d.current.daily_cap_efectivo ?? 0}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

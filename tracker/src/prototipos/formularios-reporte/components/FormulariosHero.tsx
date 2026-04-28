import type { CampaignDelta } from '../../meta-reporte/types'
import { colorBand, colorForBand } from '../../meta-reporte/data/queries'

interface Props {
  deltas: CampaignDelta[]
  lastSnapshotAt: string | null
}

export default function FormulariosHero({ deltas, lastSnapshotAt }: Props) {
  const totalSent = deltas.reduce((acc, d) => acc + (d.current.sent_total ?? 0), 0)
  const totalUniqSent = deltas.reduce((acc, d) => acc + (d.current.sent_unique ?? 0), 0)
  const totalUniqOpens = deltas.reduce((acc, d) => acc + (d.current.opens_unique ?? 0), 0)
  const totalReplies = deltas.reduce((acc, d) => acc + (d.current.replies ?? 0), 0)
  const totalBounces = deltas.reduce((acc, d) => acc + (d.current.bounces ?? 0), 0)
  const totalLeads = deltas.reduce((acc, d) => acc + (d.current.total_leads ?? 0), 0)
  const or = totalUniqSent ? (totalUniqOpens / totalUniqSent) * 100 : 0
  const replyRate = totalUniqSent ? (totalReplies / totalUniqSent) * 100 : 0
  const penetration = totalLeads ? (totalUniqSent / totalLeads) * 100 : 0

  return (
    <section className="relative overflow-hidden bg-[#0B1120] text-white">
      <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B1120] via-[#0B1120] to-[#10b981]/20" />
      <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-10 md:py-14">
        <p className="text-emerald-300 uppercase tracking-widest text-xs font-bold">Reporte Formularios · audiencias warm</p>
        <h1 className="text-3xl md:text-5xl font-bold mt-2 leading-tight">
          {deltas.length} {deltas.length === 1 ? 'campaña' : 'campañas'} · <span className="text-emerald-400">{or.toFixed(1)}% OR</span>
          {totalReplies > 0 && <> · <span className="text-amber-400">{totalReplies} replies</span></>}
        </h1>
        <p className="text-slate-300 mt-3 text-sm">
          Último snapshot: <span className="font-mono text-white">{lastSnapshotAt ?? '—'}</span>
        </p>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-8">
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 backdrop-blur">
            <p className="text-[11px] text-slate-400 uppercase tracking-wider">Leads</p>
            <p className="text-2xl font-bold mt-1">{totalLeads.toLocaleString()}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">en las {deltas.length} campañas</p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 backdrop-blur">
            <p className="text-[11px] text-slate-400 uppercase tracking-wider">Sends</p>
            <p className="text-2xl font-bold mt-1">{totalSent.toLocaleString()}</p>
            <p className="text-[10px] text-emerald-400 mt-0.5">{penetration.toFixed(1)}% penetración</p>
          </div>
          <div className="rounded-xl bg-indigo-500/10 border border-indigo-400/30 p-4 backdrop-blur">
            <p className="text-[11px] text-indigo-300 uppercase tracking-wider">Opens · OR</p>
            <p className="text-2xl font-bold mt-1 text-indigo-200">{totalUniqOpens.toLocaleString()}</p>
            <p className="text-[10px] text-indigo-300 mt-0.5">{or.toFixed(1)}% OR</p>
          </div>
          <div className="rounded-xl bg-amber-500/10 border border-amber-400/30 p-4 backdrop-blur">
            <p className="text-[11px] text-amber-300 uppercase tracking-wider">Replies · RR</p>
            <p className="text-2xl font-bold mt-1 text-amber-200">{totalReplies}</p>
            <p className="text-[10px] text-amber-300 mt-0.5">{replyRate.toFixed(2)}% reply rate</p>
          </div>
          <div className={`rounded-xl border p-4 backdrop-blur ${
            totalBounces > 0 ? 'bg-rose-500/10 border-rose-400/30' : 'bg-white/5 border-white/10'
          }`}>
            <p className={`text-[11px] uppercase tracking-wider ${totalBounces > 0 ? 'text-rose-300' : 'text-slate-400'}`}>Bounces</p>
            <p className={`text-2xl font-bold mt-1 ${totalBounces > 0 ? 'text-rose-200' : ''}`}>{totalBounces}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {totalUniqSent ? ((totalBounces / totalUniqSent) * 100).toFixed(2) : '0.00'}% bounce rate
            </p>
          </div>
        </div>

        {/* Per-campaign cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {deltas.map((d) => {
            const cap = d.current.daily_cap_target ?? 180
            const pct = cap ? (d.deltaSentSinceLast / cap) * 100 : 0
            const band = colorBand(pct, d.status)
            const c = colorForBand(band)
            const cor = (d.current.sent_unique ?? 0)
              ? ((d.current.opens_unique ?? 0) / (d.current.sent_unique ?? 1) * 100)
              : 0
            return (
              <div key={d.campaign_id} className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-mono">{d.campaign_id}</p>
                    <p className="font-bold text-sm truncate">{d.current.campaign_name?.replace(/^FORMULARIO CREATORS SERVICES /i, 'F·')}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono whitespace-nowrap ${
                    d.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-500/20 text-slate-300'
                  }`}>{d.status}</span>
                </div>
                <div className="grid grid-cols-4 gap-2 mt-3 text-center">
                  <div>
                    <p className="text-[10px] text-slate-400">Leads</p>
                    <p className="text-lg font-bold">{(d.current.total_leads ?? 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Sent</p>
                    <p className="text-lg font-bold">{(d.current.sent_unique ?? 0)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">OR</p>
                    <p className="text-lg font-bold">{cor.toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Repl</p>
                    <p className="text-lg font-bold text-amber-300">{d.current.replies ?? 0}</p>
                  </div>
                </div>
                <div className={`mt-3 rounded-lg border px-2 py-1.5 text-[10px] ${c.border} ${c.bg}`}>
                  <span className={c.text} style={{ color: c.hex }}>
                    Δ +{d.deltaSentSinceLast} sends · {pct.toFixed(0)}% del cap target
                    {d.hoursSinceLast != null && <span className="opacity-60"> ({d.hoursSinceLast.toFixed(1)}h)</span>}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

import { useMemo } from 'react'
import type { CampaignDelta } from '../../meta-reporte/types'

interface Props {
  deltas: CampaignDelta[]
}

interface MetricRow {
  cid: number
  shortName: string
  fullName: string
  status: string
  leads: number
  sent: number
  uniqueSent: number
  opens: number
  or: number
  replies: number
  replyRate: number
  bounces: number
  bounceRate: number
  penetration: number
}

function shortName(name: string | undefined): string {
  if (!name) return '—'
  return name
    .replace(/^FORMULARIO CREATORS SERVICES\s*/i, '')
    .replace(/^META-SmartLead-?\s*/i, 'META · ')
    .slice(0, 36)
}

function buildRows(deltas: CampaignDelta[]): MetricRow[] {
  return deltas
    .map((d) => {
      const c = d.current
      const sent = c.sent_total ?? 0
      const uniqueSent = c.sent_unique ?? 0
      const opens = c.opens_unique ?? 0
      const replies = c.replies ?? 0
      const bounces = c.bounces ?? 0
      const leads = c.total_leads ?? 0
      return {
        cid: d.campaign_id,
        shortName: shortName(c.campaign_name),
        fullName: c.campaign_name ?? `Campaign ${d.campaign_id}`,
        status: d.status,
        leads,
        sent,
        uniqueSent,
        opens,
        or: uniqueSent ? (opens / uniqueSent) * 100 : 0,
        replies,
        replyRate: uniqueSent ? (replies / uniqueSent) * 100 : 0,
        bounces,
        bounceRate: uniqueSent ? (bounces / uniqueSent) * 100 : 0,
        penetration: leads ? (uniqueSent / leads) * 100 : 0,
      }
    })
    .sort((a, b) => b.uniqueSent - a.uniqueSent)
}

interface BarProps { value: number; max: number; color: string; suffix?: string; format?: (v: number) => string }
function MiniBar({ value, max, color, suffix = '', format }: BarProps) {
  const w = max > 0 ? Math.min(100, (value / max) * 100) : 0
  const display = format ? format(value) : value.toLocaleString() + suffix
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-100 rounded h-2 overflow-hidden min-w-[40px]">
        <div className="h-full rounded" style={{ width: `${w}%`, background: color }} />
      </div>
      <span className="font-mono text-xs text-slate-700 min-w-[44px] text-right">{display}</span>
    </div>
  )
}

export default function CampaignsComparison({ deltas }: Props) {
  const rows = useMemo(() => buildRows(deltas), [deltas])

  const max = useMemo(() => ({
    leads: Math.max(...rows.map((r) => r.leads), 1),
    sent: Math.max(...rows.map((r) => r.uniqueSent), 1),
    opens: Math.max(...rows.map((r) => r.opens), 1),
    or: 100,
    replies: Math.max(...rows.map((r) => r.replies), 1),
    replyRate: Math.max(...rows.map((r) => r.replyRate), 1),
    penetration: Math.max(...rows.map((r) => r.penetration), 1),
  }), [rows])

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-5">
        <h3 className="text-lg font-bold text-slate-900">Comparativa entre campañas</h3>
        <p className="text-sm text-slate-500">Ranking por sends únicos · barras horizontales muestran la posición relativa</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="border-b-2 border-slate-200">
            <tr className="text-slate-600">
              <th className="text-left font-semibold py-2 px-2">Campaña</th>
              <th className="text-left font-semibold py-2 px-2 min-w-[120px]">Leads</th>
              <th className="text-left font-semibold py-2 px-2 min-w-[120px]">Penetración</th>
              <th className="text-left font-semibold py-2 px-2 min-w-[120px]">Sent (uniq)</th>
              <th className="text-left font-semibold py-2 px-2 min-w-[120px]">Opens</th>
              <th className="text-left font-semibold py-2 px-2 min-w-[110px]">OR</th>
              <th className="text-left font-semibold py-2 px-2 min-w-[110px]">Replies</th>
              <th className="text-left font-semibold py-2 px-2 min-w-[110px]">Reply Rate</th>
              <th className="text-right font-semibold py-2 px-2">Bounce</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.cid} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold w-6 text-center rounded ${
                      i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                    }`}>#{i + 1}</span>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 leading-tight">{r.shortName}</p>
                      <p className="text-[10px] font-mono text-slate-400">{r.cid} · {r.status}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2"><MiniBar value={r.leads} max={max.leads} color="#94a3b8" /></td>
                <td className="py-3 px-2"><MiniBar value={r.penetration} max={max.penetration} color="#0ea5e9" format={(v) => `${v.toFixed(1)}%`} /></td>
                <td className="py-3 px-2"><MiniBar value={r.uniqueSent} max={max.sent} color="#6366f1" /></td>
                <td className="py-3 px-2"><MiniBar value={r.opens} max={max.opens} color="#8b5cf6" /></td>
                <td className="py-3 px-2"><MiniBar value={r.or} max={max.or} color="#10b981" format={(v) => `${v.toFixed(1)}%`} /></td>
                <td className="py-3 px-2"><MiniBar value={r.replies} max={max.replies} color="#f59e0b" /></td>
                <td className="py-3 px-2"><MiniBar value={r.replyRate} max={max.replyRate} color="#f59e0b" format={(v) => `${v.toFixed(2)}%`} /></td>
                <td className="py-3 px-2 text-right">
                  <span className={`font-mono ${r.bounces > 0 ? 'text-rose-600 font-semibold' : 'text-slate-400'}`}>
                    {r.bounces} ({r.bounceRate.toFixed(2)}%)
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="text-center text-sm text-slate-400 italic py-8">Sin campañas con datos.</p>
        )}
      </div>
    </div>
  )
}

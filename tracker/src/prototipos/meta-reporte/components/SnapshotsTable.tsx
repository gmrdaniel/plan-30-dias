import { useMemo, useState } from 'react'
import type { MetaSnapshot } from '../types'
import { colorBand, colorForBand } from '../data/queries'

interface Props {
  snapshots: MetaSnapshot[]   // ordered desc
}

const PAGE_SIZE = 20

function fmtTs(ts: string): string {
  // Render local YYYY-MM-DD HH:MM
  const d = new Date(ts)
  const Y = d.getFullYear()
  const M = String(d.getMonth() + 1).padStart(2, '0')
  const D = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${Y}-${M}-${D} ${h}:${m}`
}

export default function SnapshotsTable({ snapshots }: Props) {
  const [page, setPage] = useState(0)
  const [filterCid, setFilterCid] = useState<number | 'all'>('all')

  const filtered = useMemo(() => {
    return filterCid === 'all' ? snapshots : snapshots.filter((s) => s.campaign_id === filterCid)
  }, [snapshots, filterCid])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const visible = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const cids = [...new Set(snapshots.map((s) => s.campaign_id))]

  // Compute prev sent_total per campaign, in chronological order, so we can show delta
  const indexInCampaignAsc = useMemo(() => {
    const map = new Map<number, number>()  // snapshot id -> prev sent_total
    const byCampaign = new Map<number, MetaSnapshot[]>()
    for (const s of snapshots) {
      const arr = byCampaign.get(s.campaign_id) ?? []
      arr.push(s)
      byCampaign.set(s.campaign_id, arr)
    }
    for (const arr of byCampaign.values()) {
      const asc = [...arr].sort((a, b) => a.taken_at.localeCompare(b.taken_at))
      for (let i = 1; i < asc.length; i++) map.set(asc[i].id, asc[i - 1].sent_total ?? 0)
    }
    return map
  }, [snapshots])

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between flex-wrap gap-2 mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Histórico — todos los snapshots</h3>
          <p className="text-sm text-slate-500">{filtered.length} filas · most recent first</p>
        </div>
        <div className="flex gap-2 text-xs">
          <button
            className={`px-3 py-1.5 rounded border ${filterCid === 'all' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600'}`}
            onClick={() => { setFilterCid('all'); setPage(0) }}
          >Todas</button>
          {cids.map((cid) => (
            <button
              key={cid}
              className={`px-3 py-1.5 rounded border ${filterCid === cid ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600'}`}
              onClick={() => { setFilterCid(cid); setPage(0) }}
            >{cid}</button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="border-b-2 border-slate-200 text-slate-600">
            <tr>
              <th className="text-left font-semibold py-2 px-2">Fecha/Hora</th>
              <th className="text-left font-semibold py-2 px-2">Campaña</th>
              <th className="text-left font-semibold py-2 px-2">Status</th>
              <th className="text-right font-semibold py-2 px-2">Buzones</th>
              <th className="text-right font-semibold py-2 px-2">Cap ef./target</th>
              <th className="text-right font-semibold py-2 px-2">Δ sends</th>
              <th className="text-right font-semibold py-2 px-2">Sends (tot/uniq)</th>
              <th className="text-right font-semibold py-2 px-2">Opens (tot/uniq)</th>
              <th className="text-right font-semibold py-2 px-2">OR</th>
              <th className="text-right font-semibold py-2 px-2">Bounces</th>
              <th className="text-right font-semibold py-2 px-2">Drafted</th>
              <th className="text-left font-semibold py-2 px-2">Notas</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((s) => {
              const prevSent = indexInCampaignAsc.get(s.id) ?? null
              const deltaSent = prevSent != null ? Math.max(0, (s.sent_total ?? 0) - prevSent) : null
              const cap = s.daily_cap_target ?? 180
              const pct = cap && deltaSent != null ? (deltaSent / cap) * 100 : 0
              const band = colorBand(pct, s.status)
              const c = colorForBand(band)
              const or = (s.sent_unique ?? 0) ? ((s.opens_unique ?? 0) / (s.sent_unique ?? 1)) * 100 : 0
              return (
                <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-2 px-2 font-mono text-slate-700">{fmtTs(s.taken_at)}</td>
                  <td className="py-2 px-2">
                    <span className="font-mono text-[10px] text-slate-500">{s.campaign_id}</span>
                    <p className="font-medium text-slate-900">{s.campaign_name?.replace(/^META-SmartLead-/i, '') ?? '—'}</p>
                  </td>
                  <td className="py-2 px-2">
                    <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${
                      s.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>{s.status}</span>
                  </td>
                  <td className="py-2 px-2 text-right">{s.inbox_count ?? '—'}</td>
                  <td className="py-2 px-2 text-right font-mono">
                    {s.daily_cap_efectivo ?? 0}/{s.daily_cap_target ?? 180}
                  </td>
                  <td className="py-2 px-2 text-right">
                    {deltaSent != null ? (
                      <span className={`px-1.5 py-0.5 rounded font-mono ${c.bg} ${c.text}`}>+{deltaSent}</span>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="py-2 px-2 text-right font-mono">{s.sent_total ?? 0} / {s.sent_unique ?? 0}</td>
                  <td className="py-2 px-2 text-right font-mono">{s.opens_total ?? 0} / {s.opens_unique ?? 0}</td>
                  <td className="py-2 px-2 text-right font-mono">{or.toFixed(1)}%</td>
                  <td className={`py-2 px-2 text-right font-mono ${(s.bounces ?? 0) > 0 ? 'text-rose-600' : 'text-slate-500'}`}>{s.bounces ?? 0}</td>
                  <td className="py-2 px-2 text-right font-mono text-slate-500">{s.drafted ?? 0}</td>
                  <td className="py-2 px-2 text-slate-600 max-w-[200px] truncate" title={s.notes ?? ''}>{s.notes ?? ''}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {visible.length === 0 && (
          <p className="text-center text-sm text-slate-400 italic py-8">Sin snapshots todavía. Corre <code className="bg-slate-100 px-1 rounded">python _snapshot_meta.py</code></p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 mt-4 text-xs">
          <button className="px-2 py-1 rounded border border-slate-200 disabled:opacity-30" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>← Prev</button>
          <span className="text-slate-500">Pág {page + 1} de {totalPages}</span>
          <button className="px-2 py-1 rounded border border-slate-200 disabled:opacity-30" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  )
}

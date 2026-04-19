import { useState } from 'react'
import type { BucketRow } from '../data/analysis'

type SortKey = keyof BucketRow

export default function BucketTable({ data }: { data: BucketRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('orPct')
  const [sortDesc, setSortDesc] = useState(true)

  const sorted = [...data].sort((a, b) => {
    const av = a[sortKey] as number
    const bv = b[sortKey] as number
    return sortDesc ? bv - av : av - bv
  })

  const toggleSort = (k: SortKey) => {
    if (k === sortKey) setSortDesc(!sortDesc)
    else { setSortKey(k); setSortDesc(true) }
  }

  const SortButton = ({ k, children }: { k: SortKey, children: string }) => (
    <button onClick={() => toggleSort(k)} className="flex items-center gap-1 text-left w-full font-semibold hover:text-[#0F52BA]">
      {children}
      {sortKey === k && <span className="text-xs">{sortDesc ? '↓' : '↑'}</span>}
    </button>
  )

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-slate-600"><SortButton k="bucket">Bucket</SortButton></th>
              <th className="px-4 py-3 text-center text-xs uppercase tracking-wide text-slate-600"><SortButton k="camps"># Camps</SortButton></th>
              <th className="px-4 py-3 text-center text-xs uppercase tracking-wide text-slate-600"><SortButton k="delivered">Delivered</SortButton></th>
              <th className="px-4 py-3 text-center text-xs uppercase tracking-wide text-slate-600"><SortButton k="opens">Opens</SortButton></th>
              <th className="px-4 py-3 text-center text-xs uppercase tracking-wide text-slate-600"><SortButton k="orPct">OR %</SortButton></th>
              <th className="px-4 py-3 text-center text-xs uppercase tracking-wide text-slate-600"><SortButton k="ctrPct">CTR %</SortButton></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr
                key={row.bucket}
                className={`border-b border-slate-100 hover:bg-slate-50 ${row.isWinner ? 'bg-amber-50 hover:bg-amber-100' : ''}`}
              >
                <td className="px-4 py-3 font-semibold text-slate-900">
                  {row.bucket} {row.isWinner && <span className="ml-1">🏆</span>}
                </td>
                <td className="px-4 py-3 text-center tabular-nums">{row.camps}</td>
                <td className="px-4 py-3 text-center tabular-nums">{row.delivered.toLocaleString()}</td>
                <td className="px-4 py-3 text-center tabular-nums">{row.opens.toLocaleString()}</td>
                <td className={`px-4 py-3 text-center tabular-nums font-semibold ${row.isWinner ? 'text-[#F59E0B]' : 'text-[#0F52BA]'}`}>{row.orPct}%</td>
                <td className="px-4 py-3 text-center tabular-nums text-emerald-600">{row.ctrPct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

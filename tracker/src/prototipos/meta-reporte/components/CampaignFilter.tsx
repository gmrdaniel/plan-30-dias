import type { MetaSnapshot } from '../types'

interface Props {
  snapshots: MetaSnapshot[]
  selected: number[]
  onChange: (ids: number[]) => void
}

interface CampaignSummary {
  id: number
  name: string
  status: string
  lastTakenAt: string
}

function getCampaigns(snapshots: MetaSnapshot[]): CampaignSummary[] {
  const map = new Map<number, CampaignSummary>()
  for (const s of snapshots) {
    const prev = map.get(s.campaign_id)
    if (!prev || s.taken_at > prev.lastTakenAt) {
      map.set(s.campaign_id, {
        id: s.campaign_id,
        name: s.campaign_name,
        status: s.status,
        lastTakenAt: s.taken_at,
      })
    }
  }
  return [...map.values()].sort((a, b) => a.id - b.id)
}

export default function CampaignFilter({ snapshots, selected, onChange }: Props) {
  const camps = getCampaigns(snapshots)

  function toggle(id: number) {
    if (selected.includes(id)) onChange(selected.filter((x) => x !== id))
    else onChange([...selected, id].sort((a, b) => a - b))
  }

  function setOnly(ids: number[]) { onChange([...ids].sort((a, b) => a - b)) }

  const allActive = camps.filter((c) => c.status === 'ACTIVE').map((c) => c.id)
  const allIds = camps.map((c) => c.id)
  const isOnlyActive = selected.length === allActive.length && allActive.every((id) => selected.includes(id))
  const isAll = selected.length === allIds.length

  return (
    <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-3 sticky top-[57px] z-10">
      <div className="max-w-6xl mx-auto flex items-center flex-wrap gap-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-2">Campañas</span>

        {camps.map((c) => {
          const active = selected.includes(c.id)
          const isPaused = c.status !== 'ACTIVE'
          return (
            <button
              key={c.id}
              onClick={() => toggle(c.id)}
              className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors flex items-center gap-2 ${
                active
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
              }`}
              title={`${c.id} · ${c.status}`}
            >
              <span className={`w-2 h-2 rounded-full ${
                isPaused ? 'bg-slate-400' : active ? 'bg-emerald-500' : 'bg-emerald-300'
              }`} />
              <span className={isPaused ? 'line-through opacity-70' : ''}>
                {c.name.replace(/^META-SmartLead-/i, '').slice(0, 26)}
              </span>
              <span className="font-mono text-[10px] opacity-50">{c.id}</span>
            </button>
          )
        })}

        <div className="ml-auto flex gap-1 text-[11px]">
          <button
            onClick={() => setOnly(allActive)}
            disabled={isOnlyActive}
            className="px-2 py-1 rounded border border-slate-200 text-slate-500 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >Solo ACTIVE</button>
          <button
            onClick={() => setOnly(allIds)}
            disabled={isAll}
            className="px-2 py-1 rounded border border-slate-200 text-slate-500 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >Todas</button>
        </div>
      </div>
    </div>
  )
}

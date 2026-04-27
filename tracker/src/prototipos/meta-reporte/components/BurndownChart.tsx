import { Area, AreaChart, CartesianGrid, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { MetaSnapshot } from '../types'

interface Props {
  snapshots: MetaSnapshot[]   // ordered desc; we'll reorder asc here
}

/**
 * Burndown del "primer toque": cuántos leads de cada campaña aún NO han recibido
 * Step 1. Es el mejor proxy de "cuándo se acaba el outreach fresco".
 *
 * pendientes = total_leads - sent_unique  (sent_unique ≈ Step 1 personas que recibieron al menos un envío)
 * proyección = línea recta desde el último punto, con pendiente = -capEfectivo/día
 */
export default function BurndownChart({ snapshots }: Props) {
  // Group by campaign
  const byCampaign = new Map<number, MetaSnapshot[]>()
  for (const s of snapshots) {
    const arr = byCampaign.get(s.campaign_id) ?? []
    arr.push(s)
    byCampaign.set(s.campaign_id, arr)
  }

  type RowData = { date: string; [key: string]: number | string | null }
  const allDates = new Set<string>()
  const seriesByCampaign: Record<number, { real: RowData[]; projection: RowData[]; name: string; status: string }> = {}
  const colors: Record<number, string> = { 3212141: '#94a3b8', 3217790: '#6366f1' }

  for (const [cid, arrUnsorted] of byCampaign) {
    const arr = [...arrUnsorted].sort((a, b) => a.taken_at.localeCompare(b.taken_at))
    if (arr.length === 0) continue

    // Real: one row per snapshot (use snapshot date YYYY-MM-DD; if multiple per day, last wins)
    const realByDate = new Map<string, number>()
    let lastSnap = arr[0]
    for (const s of arr) {
      const d = s.taken_at.slice(0, 10)
      const pendientes = Math.max(0, (s.total_leads ?? 0) - (s.sent_unique ?? 0))
      realByDate.set(d, pendientes)  // last write per day
      lastSnap = s
      allDates.add(d)
    }
    const realRows: RowData[] = [...realByDate.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, val]) => ({ date, [`real_${cid}`]: val }))

    // Projection: from lastSnap forward at -capEfectivo/day until 0
    const projRows: RowData[] = []
    const capEff = lastSnap.daily_cap_efectivo ?? 0
    const startPendientes = Math.max(0, (lastSnap.total_leads ?? 0) - (lastSnap.sent_unique ?? 0))
    if (capEff > 0 && startPendientes > 0 && lastSnap.status === 'ACTIVE') {
      const startDate = new Date(lastSnap.taken_at)
      let pend = startPendientes
      let day = 0
      while (pend > 0 && day < 60) {
        const d = new Date(startDate.getTime() + day * 86400000).toISOString().slice(0, 10)
        projRows.push({ date: d, [`proj_${cid}`]: Math.max(0, pend) })
        allDates.add(d)
        pend -= capEff
        day++
        if (pend <= 0) {
          // include the zero point
          const dz = new Date(startDate.getTime() + day * 86400000).toISOString().slice(0, 10)
          projRows.push({ date: dz, [`proj_${cid}`]: 0 })
          allDates.add(dz)
          break
        }
      }
    }
    seriesByCampaign[cid] = {
      real: realRows,
      projection: projRows,
      name: lastSnap.campaign_name,
      status: lastSnap.status,
    }
  }

  // Merge into single series indexed by date
  const dates = [...allDates].sort()
  const merged: RowData[] = dates.map((date) => {
    const row: RowData = { date }
    for (const [cidStr, ser] of Object.entries(seriesByCampaign)) {
      const cid = Number(cidStr)
      const real = ser.real.find((r) => r.date === date)
      const proj = ser.projection.find((r) => r.date === date)
      if (real) row[`real_${cid}`] = real[`real_${cid}`] as number
      if (proj) row[`proj_${cid}`] = proj[`proj_${cid}`] as number
    }
    return row
  })

  // Find zero day per campaign
  const zeroDays: { cid: number; name: string; date: string | null }[] = []
  for (const [cidStr, ser] of Object.entries(seriesByCampaign)) {
    const cid = Number(cidStr)
    const zero = ser.projection.find((r) => (r[`proj_${cid}`] as number) === 0)
    zeroDays.push({ cid, name: ser.name, date: zero ? (zero.date as string) : null })
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900">Burndown — leads pendientes (Step 1)</h3>
        <p className="text-sm text-slate-500">
          <code>pendientes = total_leads − sent_unique</code> · proyección lineal al cap efectivo actual
        </p>
        {zeroDays.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {zeroDays.map((z) => (
              <span key={z.cid} className={`px-2 py-1 rounded font-mono ${z.date ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}>
                {z.name.slice(0, 25)} → cero {z.date ?? '—'}
              </span>
            ))}
          </div>
        )}
      </div>
      {merged.length === 0 ? (
        <p className="text-sm text-slate-400 italic">Sin snapshots aún.</p>
      ) : (
        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer>
            <AreaChart data={merged} margin={{ top: 12, right: 12, left: 0, bottom: 18 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} label={{ value: 'Pendientes', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#64748b' } }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null
                  return (
                    <div className="rounded-lg bg-white border border-slate-200 shadow-lg p-3 text-xs space-y-1">
                      <p className="font-bold text-slate-900">{label}</p>
                      {payload.filter((p) => p.value != null).map((p) => (
                        <p key={p.dataKey as string} className="text-slate-700">
                          <span className="inline-block w-2 h-2 rounded mr-2" style={{ background: p.color }} />
                          {(p.dataKey as string).startsWith('real_') ? 'Real ' : 'Proyección '}
                          {(p.dataKey as string).replace(/^(real_|proj_)/, '')}: {p.value}
                        </p>
                      ))}
                    </div>
                  )
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {Object.keys(seriesByCampaign).map((cidStr) => {
                const cid = Number(cidStr)
                const c = colors[cid] ?? '#6366f1'
                return (
                  <>
                    <Area
                      key={`real_${cid}`}
                      type="stepAfter"
                      dataKey={`real_${cid}`}
                      name={`Real ${cid}`}
                      stroke={c}
                      fill={c}
                      fillOpacity={0.18}
                      strokeWidth={2}
                      connectNulls
                    />
                    <Line
                      key={`proj_${cid}`}
                      type="monotone"
                      dataKey={`proj_${cid}`}
                      name={`Proyección ${cid}`}
                      stroke={c}
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      dot={false}
                      connectNulls
                    />
                  </>
                )
              })}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

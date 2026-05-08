import { useEffect, useMemo, useState } from 'react'
import type { BranchLinkStat, DailyStat, MetaSnapshot } from '../types'
import { fetchBranchLinkStats } from '../data/queries'
import { ALIAS_CONFIG } from './BranchClicksAdmin'

interface Props {
  snapshots: MetaSnapshot[]
  dailyStats: DailyStat[]
  refreshKey?: number          // bump para forzar re-fetch tras editar
}

// Distribución estimada de sends por step (3217790 ANA) — sin endpoint Smartlead
// directo, se infiere de delays + lead funnel. Si cambia el sequence, ajustar.
const ANA_STEP_SHARE: Record<number, number> = { 1: 0.60, 2: 0.22, 3: 0.13, 4: 0.05 }

function fmtNum(n: number): string {
  return n.toLocaleString('en-US')
}

export default function BranchVsSmartleadCompare({ snapshots, dailyStats, refreshKey }: Props) {
  const [linkStats, setLinkStats] = useState<BranchLinkStat[]>([])
  const [snapshotDate, setSnapshotDate] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchBranchLinkStats()
      .then((rows) => {
        if (cancelled) return
        setLinkStats(rows)
        // El snapshot_date más reciente que aparezca en la tabla se considera
        // el corte vigente. Si hay aliases sin row, simplemente no aparecen.
        const dates = rows.map((r) => r.snapshot_date).sort().reverse()
        setSnapshotDate(dates[0] ?? null)
      })
      .catch((e) => console.warn('branch_link_stats fetch failed (ok si tabla vacía):', e))
    return () => { cancelled = true }
  }, [refreshKey])

  // Latest known clicks per alias
  const latestByAlias = useMemo(() => {
    const m = new Map<string, number>()
    // linkStats viene ordenado por (alias asc, snapshot_date desc) desde queries.ts
    for (const r of linkStats) {
      if (!m.has(r.alias)) m.set(r.alias, r.clicks)
    }
    return m
  }, [linkStats])

  // Sumar sends + clicks Smartlead por campaign_id (acumulado)
  const smartleadTotals = useMemo(() => {
    const sends = new Map<number, number>()
    const clicks = new Map<number, number>()
    for (const d of dailyStats) {
      if (d.step !== null) continue
      sends.set(d.campaign_id, (sends.get(d.campaign_id) ?? 0) + d.sent)
      clicks.set(d.campaign_id, (clicks.get(d.campaign_id) ?? 0) + d.clicks)
    }
    if (sends.size === 0 && snapshots.length > 0) {
      const lastByCamp = new Map<number, MetaSnapshot>()
      for (const s of snapshots) {
        const prev = lastByCamp.get(s.campaign_id)
        if (!prev || s.taken_at > prev.taken_at) lastByCamp.set(s.campaign_id, s)
      }
      for (const s of lastByCamp.values()) {
        if (s.sent_total !== null) sends.set(s.campaign_id, s.sent_total)
      }
    }
    return { sends, clicks }
  }, [dailyStats, snapshots])

  // Agrupación por campaña (Smartlead-side)
  const byCampaign = useMemo(() => {
    const map = new Map<string, { name: string; sends: number; clicksSmartlead: number; clicksBranch: number; smartleadId: number | null }>()
    for (const cfg of ALIAS_CONFIG) {
      const clicksBranch = latestByAlias.get(cfg.alias) ?? 0
      // Si nunca se ha guardado conteo para este alias, lo omitimos del rollup —
      // si lo dejaríamos en 0 distorsiona la tabla con aliases nuevos sin data.
      if (!latestByAlias.has(cfg.alias)) continue
      const key = cfg.smartleadId ? String(cfg.smartleadId) : cfg.smartleadName
      const cur = map.get(key) ?? {
        name: cfg.smartleadName,
        sends: cfg.smartleadId ? smartleadTotals.sends.get(cfg.smartleadId) ?? 0 : 0,
        clicksSmartlead: cfg.smartleadId ? smartleadTotals.clicks.get(cfg.smartleadId) ?? 0 : 0,
        clicksBranch: 0,
        smartleadId: cfg.smartleadId,
      }
      cur.clicksBranch += clicksBranch
      map.set(key, cur)
    }
    return Array.from(map.values()).sort((a, b) => b.clicksBranch - a.clicksBranch)
  }, [smartleadTotals, latestByAlias])

  const totals = useMemo(() => {
    return byCampaign.reduce(
      (acc, c) => ({
        sends: acc.sends + c.sends,
        clicksSmartlead: acc.clicksSmartlead + c.clicksSmartlead,
        clicksBranch: acc.clicksBranch + c.clicksBranch,
      }),
      { sends: 0, clicksSmartlead: 0, clicksBranch: 0 },
    )
  }, [byCampaign])

  // CTRs por step para ANA 3217790
  const anaTotalSends = smartleadTotals.sends.get(3217790) ?? 0
  const anaSteps = useMemo(() => {
    return ALIAS_CONFIG
      .filter((c) => c.smartleadId === 3217790 && latestByAlias.has(c.alias))
      .sort((a, b) => (a.step ?? 0) - (b.step ?? 0))
      .map((c) => {
        const share = c.step !== null ? ANA_STEP_SHARE[c.step] ?? 0 : 0
        const sendsEst = Math.round(anaTotalSends * share)
        const clicks = latestByAlias.get(c.alias) ?? 0
        const ctr = sendsEst > 0 ? (clicks / sendsEst) * 100 : 0
        return { ...c, sendsEst, ctr, clicks }
      })
  }, [anaTotalSends, latestByAlias])

  const empty = latestByAlias.size === 0

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-start justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Branch.io vs Smartlead — clicks acumulados</h3>
          <p className="text-sm text-slate-500">
            {snapshotDate
              ? <>Conteos manuales del dashboard Branch.io · último snapshot <span className="font-mono">{snapshotDate}</span></>
              : <span className="italic">Sin snapshots todavía — usa el editor de abajo para anotar el primer corte.</span>}
          </p>
        </div>
      </div>

      {empty ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
          No hay conteos guardados aún. Abre el editor en la sección "Editar conteos Branch.io" para ingresar el primer corte.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wide">
                  <th className="text-left py-2 pr-2">Campaña Smartlead</th>
                  <th className="text-right py-2 px-2">Sends</th>
                  <th className="text-right py-2 px-2">Clicks Smartlead</th>
                  <th className="text-right py-2 px-2">Clicks Branch</th>
                  <th className="text-right py-2 pl-2">Branch / Smartlead</th>
                </tr>
              </thead>
              <tbody>
                {byCampaign.map((c) => {
                  const ratio = c.clicksSmartlead > 0 ? c.clicksBranch / c.clicksSmartlead : null
                  return (
                    <tr key={c.name} className="border-b border-slate-100 last:border-b-0">
                      <td className="py-2 pr-2 text-slate-700">
                        {c.name}
                        {c.smartleadId && <span className="text-xs text-slate-400 ml-2">{c.smartleadId}</span>}
                      </td>
                      <td className="py-2 px-2 text-right tabular-nums">{c.sends > 0 ? fmtNum(c.sends) : '—'}</td>
                      <td className="py-2 px-2 text-right tabular-nums">{c.clicksSmartlead > 0 ? fmtNum(c.clicksSmartlead) : '—'}</td>
                      <td className="py-2 px-2 text-right tabular-nums font-bold text-indigo-700">{fmtNum(c.clicksBranch)}</td>
                      <td className="py-2 pl-2 text-right tabular-nums text-slate-600">
                        {ratio === null ? '—' : `${ratio.toFixed(1)}x`}
                      </td>
                    </tr>
                  )
                })}
                <tr className="border-t-2 border-slate-300 font-bold">
                  <td className="py-2 pr-2">Total tracked</td>
                  <td className="py-2 px-2 text-right tabular-nums">{fmtNum(totals.sends)}</td>
                  <td className="py-2 px-2 text-right tabular-nums">{fmtNum(totals.clicksSmartlead)}</td>
                  <td className="py-2 px-2 text-right tabular-nums text-indigo-700">{fmtNum(totals.clicksBranch)}</td>
                  <td className="py-2 pl-2 text-right tabular-nums">
                    {totals.clicksSmartlead > 0 ? `${(totals.clicksBranch / totals.clicksSmartlead).toFixed(1)}x` : '—'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {anaSteps.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-slate-800 text-sm mb-2">
                CTRs por step — ANA 3217790
                <span className="ml-2 text-xs font-normal text-slate-500">(sends estimados con distribución 60/22/13/5)</span>
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wide">
                      <th className="text-left py-2 pr-2">Step</th>
                      <th className="text-left py-2 px-2">Branch alias</th>
                      <th className="text-right py-2 px-2">Sends est.</th>
                      <th className="text-right py-2 px-2">Clicks Branch</th>
                      <th className="text-right py-2 pl-2">CTR Branch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {anaSteps.map((s) => (
                      <tr key={s.alias} className="border-b border-slate-100 last:border-b-0">
                        <td className="py-2 pr-2 font-semibold text-slate-700">{s.step}</td>
                        <td className="py-2 px-2 font-mono text-xs text-slate-600">
                          {s.alias}
                          {s.notes && <div className="text-amber-700 font-sans not-italic mt-0.5">⚠ {s.notes}</div>}
                        </td>
                        <td className="py-2 px-2 text-right tabular-nums">{fmtNum(s.sendsEst)}</td>
                        <td className="py-2 px-2 text-right tabular-nums font-bold text-indigo-700">{fmtNum(s.clicks)}</td>
                        <td className="py-2 pl-2 text-right tabular-nums">{s.ctr.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      <div className="mt-6 rounded-lg bg-slate-50 border border-slate-200 p-4 text-xs text-slate-600 space-y-2">
        <p className="font-semibold text-slate-700">Por qué Branch &gt; Smartlead</p>
        <ul className="list-disc list-inside space-y-1">
          <li><b>QR scans</b> — la cámara va directo al short link, no pasa por el redirect Smartlead.</li>
          <li><b>Bot prefetch</b> — Smartlead deduplica por lead, Branch cuenta cada hit (Microsoft ATP / Mimecast / Proofpoint).</li>
          <li><b>Re-clicks</b> — clicks repetidos del mismo lead días después suman en Branch.</li>
          <li><b>Compartidos</b> — forwards del email aparecen en Branch sin estar en Smartlead.</li>
        </ul>
      </div>
    </div>
  )
}

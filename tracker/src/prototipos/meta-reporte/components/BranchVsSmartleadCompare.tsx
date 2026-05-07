import { useMemo } from 'react'
import type { DailyStat, MetaSnapshot } from '../types'

interface Props {
  snapshots: MetaSnapshot[]
  dailyStats: DailyStat[]
}

// ---------------------------------------------------------------------------
// Snapshot manual del dashboard Branch.io
// ---------------------------------------------------------------------------
// El plan Activation Basics ($17/mes) NO incluye Analytics API → toca pulsar
// el dashboard a mano. Para refrescar:
//   1. app.branch.io → Analytics
//   2. Rango: desde 2026-04-21 (creación primer link)
//   3. Quitar todos los filtros, agrupar por ~campaign
//   4. Copiar el conteo de cada link a la tabla BRANCH_LINKS de abajo
//   5. Actualizar BRANCH_SNAPSHOT_DATE
// ---------------------------------------------------------------------------
const BRANCH_SNAPSHOT_DATE = '2026-05-07'

interface BranchLink {
  alias: string
  branchCampaign: string
  smartleadId: number | null
  smartleadName: string
  step: number | null
  clicks: number
  notes?: string
}

const BRANCH_LINKS: BranchLink[] = [
  // Plan B (3212141 — PAUSED)
  { alias: 'apply-fast-track',     branchCampaign: 'intro_ft_v1',          smartleadId: 3212141, smartleadName: 'Plan B',  step: 1,    clicks: 27 },
  { alias: 'friction-removal',     branchCampaign: 'friction_removal',     smartleadId: 3212141, smartleadName: 'Plan B',  step: 2,    clicks: 4 },
  { alias: 'intro_ft_v2',          branchCampaign: 'intro_ft_v2',          smartleadId: 3212141, smartleadName: 'Plan B',  step: 2,    clicks: 0, notes: 'No se llegó a usar en producción' },
  { alias: 'Kb6lnRgTw2b',          branchCampaign: 'social_proof',         smartleadId: 3212141, smartleadName: 'Plan B',  step: 3,    clicks: 3 },
  // ANA (3217790 — ACTIVE)
  { alias: 'apply-fast-track-ana', branchCampaign: 'intro_ft_ana',         smartleadId: 3217790, smartleadName: 'ANA',     step: 1,    clicks: 114 },
  { alias: 'friction-removal-ana', branchCampaign: 'friction_removal_ana', smartleadId: 3217790, smartleadName: 'ANA',     step: 2,    clicks: 71, notes: 'Step 2 perdió Branch en edición 5-may 18:02 → no acumula desde entonces' },
  { alias: 'social-proof-ana',     branchCampaign: 'social_proof_ana',     smartleadId: 3217790, smartleadName: 'ANA',     step: 3,    clicks: 94 },
  { alias: 'last-chance-meta',     branchCampaign: 'last_chance_ana',      smartleadId: 3217790, smartleadName: 'ANA',     step: 4,    clicks: 18 },
  // B2B (3236431)
  { alias: 'meet-adfactory',       branchCampaign: 'ad-factory-latam-3236431', smartleadId: 3236431, smartleadName: 'B2B Ads Factory', step: null, clicks: 2 },
  // Web / Brevo histórico (sin campaña Smartlead asociada)
  { alias: 'auditoria-creadores',  branchCampaign: 'audit_creadores',      smartleadId: null,    smartleadName: 'Web (auditoría)', step: null, clicks: 6 },
  { alias: 'gMMTLRC6p2b',          branchCampaign: 'intro_ft_v1 (brevo)',  smartleadId: null,    smartleadName: 'Brevo histórico', step: null, clicks: 8 },
]

// Estimación aproximada de distribución de sends por step para 3217790 ANA
// (no hay endpoint Smartlead directo, se infiere de delays + total leads)
const ANA_STEP_SHARE: Record<number, number> = { 1: 0.60, 2: 0.22, 3: 0.13, 4: 0.05 }

function fmtNum(n: number): string {
  return n.toLocaleString('en-US')
}

export default function BranchVsSmartleadCompare({ snapshots, dailyStats }: Props) {
  // Sumar sends + clicks Smartlead por campaign_id (acumulado)
  const smartleadTotals = useMemo(() => {
    const sends = new Map<number, number>()
    const clicks = new Map<number, number>()
    for (const d of dailyStats) {
      if (d.step !== null) continue // sólo filas "total del día"
      sends.set(d.campaign_id, (sends.get(d.campaign_id) ?? 0) + d.sent)
      clicks.set(d.campaign_id, (clicks.get(d.campaign_id) ?? 0) + d.clicks)
    }
    // Fallback al snapshot más reciente si no hay daily stats
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
    for (const link of BRANCH_LINKS) {
      const key = link.smartleadId ? String(link.smartleadId) : link.smartleadName
      const cur = map.get(key) ?? {
        name: link.smartleadName,
        sends: link.smartleadId ? smartleadTotals.sends.get(link.smartleadId) ?? 0 : 0,
        clicksSmartlead: link.smartleadId ? smartleadTotals.clicks.get(link.smartleadId) ?? 0 : 0,
        clicksBranch: 0,
        smartleadId: link.smartleadId,
      }
      cur.clicksBranch += link.clicks
      map.set(key, cur)
    }
    return Array.from(map.values()).sort((a, b) => b.clicksBranch - a.clicksBranch)
  }, [smartleadTotals])

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
    return BRANCH_LINKS.filter((l) => l.smartleadId === 3217790)
      .sort((a, b) => (a.step ?? 0) - (b.step ?? 0))
      .map((l) => {
        const share = l.step !== null ? ANA_STEP_SHARE[l.step] ?? 0 : 0
        const sendsEst = Math.round(anaTotalSends * share)
        const ctr = sendsEst > 0 ? (l.clicks / sendsEst) * 100 : 0
        return { ...l, sendsEst, ctr }
      })
  }, [anaTotalSends])

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-start justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Branch.io vs Smartlead — clicks acumulados</h3>
          <p className="text-sm text-slate-500">
            Snapshot manual del dashboard Branch.io · {BRANCH_SNAPSHOT_DATE} ·
            <span className="ml-1 italic">El plan Activation Basics no expone Analytics API, actualizar a mano.</span>
          </p>
        </div>
      </div>

      {/* ---------- Tabla 1: por campaña ---------- */}
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

      {/* ---------- Tabla 2: CTRs por step (ANA) ---------- */}
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

      {/* ---------- Notas ---------- */}
      <div className="mt-6 rounded-lg bg-slate-50 border border-slate-200 p-4 text-xs text-slate-600 space-y-2">
        <p className="font-semibold text-slate-700">Por qué Branch &gt; Smartlead</p>
        <ul className="list-disc list-inside space-y-1">
          <li><b>QR scans</b> — la cámara va directo al short link, no pasa por el redirect Smartlead.</li>
          <li><b>Bot prefetch</b> — Smartlead deduplica por lead, Branch cuenta cada hit (Microsoft ATP / Mimecast / Proofpoint).</li>
          <li><b>Re-clicks</b> — clicks repetidos del mismo lead días después suman en Branch.</li>
          <li><b>Compartidos</b> — forwards del email aparecen en Branch sin estar en Smartlead.</li>
        </ul>
        <p className="font-semibold text-slate-700 mt-3">Decisiones de tracking (mkt — 2026-05-07)</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Step 1 ANA mantiene Branch + FB directo intencionalmente (decisión mkt).</li>
          <li>Step 2 ANA sin Branch desde 5-may 18:02 — los clicks de friction no se capturan más (mkt decidió dejarlo así).</li>
          <li>Las 4 campañas FORMULARIO CREATORS no usan Branch — sus clicks Smartlead no aparecen aquí.</li>
        </ul>
      </div>
    </div>
  )
}

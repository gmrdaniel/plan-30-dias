// ---------------------------------------------------------------------------
// Historial de cambios de sequences en Smartlead — leído de Supabase
// ---------------------------------------------------------------------------
// Datos vienen de la tabla `meta_sequence_versions`, que se llena cada run de
// _snapshot_meta.py (cada 4h via Task Scheduler). Una fila por edición detectada.
// Si la tabla está vacía o no existe aún, el componente lo dice.
// ---------------------------------------------------------------------------
import { useMemo } from 'react'
import type { SequenceVersion } from '../types'

interface Props {
  versions: SequenceVersion[]
  campaignId?: number   // si se pasa, filtra solo esa campaña
  campaignLabel?: string
}

const FOCUS_CAMPAIGN_ID = 3217790
const FOCUS_CAMPAIGN_LABEL = 'ANA 3217790'

interface StepCurrent {
  seq_number: number
  subject: string | null
  branch_aliases: string[]
  has_branch: boolean
  has_fb_direct: boolean
  fb_direct_count: number
  smartlead_updated_at: string
  detected_at: string
  body_chars: number | null
}

function fmtTs(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function StatusPill({ hasBranch, hasFbDirect }: { hasBranch: boolean; hasFbDirect: boolean }) {
  if (hasBranch && !hasFbDirect) {
    return <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded border bg-emerald-50 text-emerald-700 border-emerald-200">✓ Tracked</span>
  }
  if (hasBranch && hasFbDirect) {
    return <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded border bg-amber-50 text-amber-700 border-amber-200">⚠ Branch + FB</span>
  }
  return <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded border bg-rose-50 text-rose-700 border-rose-200">✗ Sin tracking</span>
}

export default function SequenceVersionTimeline({ versions, campaignId = FOCUS_CAMPAIGN_ID, campaignLabel = FOCUS_CAMPAIGN_LABEL }: Props) {
  // Filtrar a la campaña en foco
  const scoped = useMemo(
    () => versions.filter((v) => v.campaign_id === campaignId),
    [versions, campaignId],
  )

  // Estado actual: última versión por step
  const currentByStep = useMemo(() => {
    const by = new Map<number, StepCurrent>()
    for (const v of scoped) {
      const prev = by.get(v.seq_number)
      if (!prev || v.smartlead_updated_at > prev.smartlead_updated_at) {
        by.set(v.seq_number, {
          seq_number: v.seq_number,
          subject: v.subject,
          branch_aliases: v.branch_aliases ?? [],
          has_branch: v.has_branch,
          has_fb_direct: v.has_fb_direct,
          fb_direct_count: v.fb_direct_count ?? 0,
          smartlead_updated_at: v.smartlead_updated_at,
          detected_at: v.detected_at,
          body_chars: v.body_chars,
        })
      }
    }
    return Array.from(by.values()).sort((a, b) => a.seq_number - b.seq_number)
  }, [scoped])

  // Eventos del timeline: cada cambio detectado, ordenado de viejo a nuevo
  const events = useMemo(() => {
    // dedupe ediciones: si los 4 steps cambian en la misma operación atómica
    // tienen el mismo updated_at — agrupar
    const grouped = new Map<string, { ts: string; steps: SequenceVersion[]; first: SequenceVersion }>()
    for (const v of scoped) {
      const key = v.smartlead_updated_at
      const cur = grouped.get(key) ?? { ts: v.smartlead_updated_at, steps: [], first: v }
      cur.steps.push(v)
      grouped.set(key, cur)
    }
    return Array.from(grouped.values()).sort((a, b) => a.ts.localeCompare(b.ts))
  }, [scoped])

  if (versions.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Historial de plantillas — {campaignLabel}</h3>
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
          <p className="font-semibold">Aún no hay versiones registradas.</p>
          <p className="text-xs mt-1">
            La tabla <code className="bg-white px-1 rounded">meta_sequence_versions</code> se llena automáticamente
            cada vez que <code className="bg-white px-1 rounded">_snapshot_meta.py</code> detecta un cambio.
            Aplica la migración <code className="bg-white px-1 rounded">039_meta_sequence_versions.sql</code> y corre
            el script una vez para sembrar el estado actual.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900">Historial de plantillas — {campaignLabel}</h3>
        <p className="text-sm text-slate-500">
          {events.length} edición{events.length === 1 ? '' : 'es'} detectada{events.length === 1 ? '' : 's'} ·
          poll cada 4h vía <code className="bg-slate-100 px-1 rounded text-xs">_snapshot_meta.py</code>
        </p>
      </div>

      {/* ---------- Timeline de eventos ---------- */}
      <div className="mb-6">
        <h4 className="font-semibold text-slate-800 text-sm mb-2">Ediciones detectadas</h4>
        <ol className="relative border-l-2 border-slate-200 ml-2 space-y-3">
          {events.map((ev, idx) => {
            const aliases = new Set<string>()
            ev.steps.forEach((s) => (s.branch_aliases ?? []).forEach((a) => aliases.add(a)))
            const fbTotal = ev.steps.reduce((s, x) => s + (x.fb_direct_count ?? 0), 0)
            const isFirst = idx === 0
            return (
              <li key={ev.ts} className="ml-4">
                <span className="absolute -left-2 flex items-center justify-center w-4 h-4 bg-white">
                  {isFirst ? '🟢' : '🟦'}
                </span>
                <div className="text-xs font-mono text-slate-500">{fmtTs(ev.ts)}</div>
                <div className="text-sm text-slate-800">
                  {isFirst ? 'Versión inicial detectada' : 'Re-upload de sequences'} ·
                  <span className="ml-1">{ev.steps.length} step{ev.steps.length === 1 ? '' : 's'} afectado{ev.steps.length === 1 ? '' : 's'}</span>
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  Branch: {aliases.size > 0 ? Array.from(aliases).join(', ') : <span className="text-rose-600">ninguno</span>} ·
                  FB directo: {fbTotal} link{fbTotal === 1 ? '' : 's'}
                </div>
              </li>
            )
          })}
        </ol>
      </div>

      {/* ---------- Estado actual por step ---------- */}
      <div>
        <h4 className="font-semibold text-slate-800 text-sm mb-2">Estado actual por step</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wide">
                <th className="text-left py-2 pr-2">Step</th>
                <th className="text-left py-2 px-2">Subject</th>
                <th className="text-left py-2 px-2">Branch alias</th>
                <th className="text-center py-2 px-2">FB directo</th>
                <th className="text-left py-2 px-2">Última edición</th>
                <th className="text-left py-2 pl-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {currentByStep.map((s) => (
                <tr key={s.seq_number} className="border-b border-slate-100 last:border-b-0 align-top">
                  <td className="py-2 pr-2 font-semibold text-slate-700">{s.seq_number}</td>
                  <td className="py-2 px-2 text-slate-700 text-xs max-w-xs truncate" title={s.subject ?? ''}>
                    {s.subject ?? '—'}
                  </td>
                  <td className="py-2 px-2 font-mono text-xs">
                    {s.branch_aliases.length > 0 ? (
                      <span className="text-indigo-700">{s.branch_aliases.join(', ')}</span>
                    ) : (
                      <span className="text-rose-700">—</span>
                    )}
                  </td>
                  <td className="py-2 px-2 text-center">
                    {s.fb_direct_count > 0 ? <span className="text-amber-600">{s.fb_direct_count}</span> : <span className="text-slate-300">·</span>}
                  </td>
                  <td className="py-2 px-2 text-xs text-slate-600 font-mono">{fmtTs(s.smartlead_updated_at)}</td>
                  <td className="py-2 pl-2 text-xs">
                    <StatusPill hasBranch={s.has_branch} hasFbDirect={s.has_fb_direct} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

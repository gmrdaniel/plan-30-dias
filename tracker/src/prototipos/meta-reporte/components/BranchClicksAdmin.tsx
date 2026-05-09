import { useEffect, useMemo, useState } from 'react'
import { fetchBranchLinkStats, fetchLatestBranchDeviceSnapshot, upsertBranchDeviceSnapshot, upsertBranchLinkStat } from '../data/queries'
import type { BranchDeviceSnapshot, BranchLinkStat } from '../types'

const DEVICE_KEYS = ['Windows', 'macOS', 'Linux', 'iOS', 'Android', 'Other'] as const
type DeviceKey = typeof DEVICE_KEYS[number]

// Catálogo canónico de aliases bajo tracking — agregar aquí cuando se cree
// un nuevo Branch link que se quiera medir. La data (clicks) vive en Supabase;
// esto solo es la lista de "qué aliases existen" + su mapping a campaña/step
// para mostrar contexto al operador.
//
// Ojo: no es FK contra branch_link_stats; la tabla acepta cualquier alias.
// Esta lista es para el form; si ingresas un alias nuevo, agrégalo aquí también.
export interface BranchAliasConfig {
  alias: string
  branchCampaign: string
  smartleadId: number | null
  smartleadName: string
  step: number | null
  notes?: string
}

export const ALIAS_CONFIG: BranchAliasConfig[] = [
  // Plan B (3212141)
  { alias: 'apply-fast-track',     branchCampaign: 'intro_ft_v1',          smartleadId: 3212141, smartleadName: 'Plan B', step: 1 },
  { alias: 'friction-removal',     branchCampaign: 'friction_removal',     smartleadId: 3212141, smartleadName: 'Plan B', step: 2 },
  { alias: 'intro_ft_v2',          branchCampaign: 'intro_ft_v2',          smartleadId: 3212141, smartleadName: 'Plan B', step: 2, notes: 'No se usó en producción' },
  { alias: 'Kb6lnRgTw2b',          branchCampaign: 'social_proof',         smartleadId: 3212141, smartleadName: 'Plan B', step: 3 },
  // ANA (3217790)
  { alias: 'apply-fast-track-ana', branchCampaign: 'intro_ft_ana',         smartleadId: 3217790, smartleadName: 'ANA',    step: 1 },
  { alias: 'friction-removal-ana', branchCampaign: 'friction_removal_ana', smartleadId: 3217790, smartleadName: 'ANA',    step: 2, notes: 'Step 2 perdió Branch en edición 5-may 18:02' },
  { alias: 'social-proof-ana',     branchCampaign: 'social_proof_ana',     smartleadId: 3217790, smartleadName: 'ANA',    step: 3 },
  { alias: 'last-chance-meta',     branchCampaign: 'last_chance_ana',      smartleadId: 3217790, smartleadName: 'ANA',    step: 4 },
  // B2B (3236431)
  { alias: 'meet-adfactory',       branchCampaign: 'ad-factory-latam-3236431', smartleadId: 3236431, smartleadName: 'B2B Ads Factory', step: null },
  // Tier B Creators Meta (creados 2026-05-08)
  { alias: 'tierbcreatorsmetaen1', branchCampaign: 'tier_b_creators_en',   smartleadId: null, smartleadName: 'Tier B Creators EN', step: 1 },
  { alias: 'tierbcreatorsmetaen2', branchCampaign: 'tier_b_creators_en',   smartleadId: null, smartleadName: 'Tier B Creators EN', step: 2 },
  { alias: 'tierbcreatorsmetaen3', branchCampaign: 'tier_b_creators_en',   smartleadId: null, smartleadName: 'Tier B Creators EN', step: 3 },
  { alias: 'tierbcreatorsmetaen4', branchCampaign: 'tier_b_creators_en',   smartleadId: null, smartleadName: 'Tier B Creators EN', step: 4 },
  // Web / Brevo histórico
  { alias: 'auditoria-creadores',  branchCampaign: 'audit_creadores',      smartleadId: null, smartleadName: 'Web (auditoría)', step: null },
  { alias: 'gMMTLRC6p2b',          branchCampaign: 'intro_ft_v1 (brevo)',  smartleadId: null, smartleadName: 'Brevo histórico', step: null },
]

function todayLocal(): string {
  // YYYY-MM-DD en hora MX (no UTC) — coherente con el resto del dashboard.
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City',
    year: 'numeric', month: '2-digit', day: '2-digit',
  })
  return fmt.format(new Date())
}

export default function BranchClicksAdmin({ onSaved }: { onSaved?: () => void }) {
  const [open, setOpen] = useState(false)
  const [snapshotDate, setSnapshotDate] = useState(todayLocal())
  const [recordedBy, setRecordedBy] = useState('')
  const [stats, setStats] = useState<BranchLinkStat[]>([])
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [savingAlias, setSavingAlias] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<string | null>(null)

  // Device breakdown
  const [latestDevices, setLatestDevices] = useState<BranchDeviceSnapshot | null>(null)
  const [deviceDrafts, setDeviceDrafts] = useState<Record<DeviceKey, string>>({
    Windows: '', macOS: '', Linux: '', iOS: '', Android: '', Other: '',
  })
  const [savingDevices, setSavingDevices] = useState(false)

  // Cargar últimos conocidos
  useEffect(() => {
    if (!open) return
    let cancelled = false
    fetchBranchLinkStats()
      .then((rows) => { if (!cancelled) setStats(rows) })
      .catch((e) => { if (!cancelled) setError(String(e?.message ?? e)) })
    fetchLatestBranchDeviceSnapshot()
      .then((row) => { if (!cancelled) setLatestDevices(row) })
      .catch((e) => console.warn('device snapshot fetch failed:', e))
    return () => { cancelled = true }
  }, [open, savedAt])

  // Latest known click count per alias
  const latestByAlias = useMemo(() => {
    const m = new Map<string, BranchLinkStat>()
    for (const s of stats) {
      // Cuando ya hay uno, queda el primero (queries devuelve order by alias asc, date desc → primero = latest)
      if (!m.has(s.alias)) m.set(s.alias, s)
    }
    return m
  }, [stats])

  // Today's row (si ya se guardó)
  const todayByAlias = useMemo(() => {
    const m = new Map<string, BranchLinkStat>()
    for (const s of stats) {
      if (s.snapshot_date === snapshotDate) m.set(s.alias, s)
    }
    return m
  }, [stats, snapshotDate])

  async function saveAlias(cfg: BranchAliasConfig) {
    const raw = drafts[cfg.alias]
    if (raw === undefined || raw === '') return
    const n = Number(raw)
    if (!Number.isFinite(n) || n < 0) {
      setError(`Valor inválido para ${cfg.alias}: ${raw}`)
      return
    }
    setSavingAlias(cfg.alias)
    setError(null)
    try {
      await upsertBranchLinkStat({
        alias: cfg.alias,
        snapshot_date: snapshotDate,
        clicks: Math.floor(n),
        campaign: cfg.branchCampaign,
        notes: cfg.notes ?? null,
        recorded_by: recordedBy.trim() || null,
      })
      setDrafts((d) => { const c = { ...d }; delete c[cfg.alias]; return c })
      setSavedAt(new Date().toISOString())
      onSaved?.()
    } catch (e) {
      setError(`Error guardando ${cfg.alias}: ${String((e as Error)?.message ?? e)}`)
    } finally {
      setSavingAlias(null)
    }
  }

  const deviceTotalDraft = useMemo(() => {
    return DEVICE_KEYS.reduce((sum, k) => {
      const v = Number(deviceDrafts[k])
      return Number.isFinite(v) ? sum + v : sum
    }, 0)
  }, [deviceDrafts])

  async function saveDevices() {
    const breakdown: Record<string, number> = {}
    let hasAny = false
    for (const k of DEVICE_KEYS) {
      const raw = deviceDrafts[k]
      if (raw === '' || raw === undefined) continue
      const n = Number(raw)
      if (!Number.isFinite(n) || n < 0 || n > 100) {
        setError(`Valor inválido para ${k}: ${raw} (0-100)`)
        return
      }
      breakdown[k] = n
      hasAny = true
    }
    if (!hasAny) {
      setError('Captura al menos un %.')
      return
    }
    if (Math.abs(deviceTotalDraft - 100) > 5) {
      setError(`Los % suman ${deviceTotalDraft.toFixed(1)} (esperado ~100). Corrige antes de guardar.`)
      return
    }
    setSavingDevices(true)
    setError(null)
    try {
      await upsertBranchDeviceSnapshot({
        snapshot_date: snapshotDate,
        device_breakdown: breakdown,
        recorded_by: recordedBy.trim() || null,
      })
      setDeviceDrafts({ Windows: '', macOS: '', Linux: '', iOS: '', Android: '', Other: '' })
      setSavedAt(new Date().toISOString())
      onSaved?.()
    } catch (e) {
      setError(`Error guardando devices: ${String((e as Error)?.message ?? e)}`)
    } finally {
      setSavingDevices(false)
    }
  }

  async function saveAll() {
    setError(null)
    let savedCount = 0
    for (const cfg of ALIAS_CONFIG) {
      const raw = drafts[cfg.alias]
      if (raw === undefined || raw === '') continue
      const n = Number(raw)
      if (!Number.isFinite(n) || n < 0) continue
      setSavingAlias(cfg.alias)
      try {
        await upsertBranchLinkStat({
          alias: cfg.alias,
          snapshot_date: snapshotDate,
          clicks: Math.floor(n),
          campaign: cfg.branchCampaign,
          notes: cfg.notes ?? null,
          recorded_by: recordedBy.trim() || null,
        })
        savedCount++
      } catch (e) {
        setError(`Error en ${cfg.alias}: ${String((e as Error)?.message ?? e)}`)
        setSavingAlias(null)
        return
      }
    }
    setSavingAlias(null)
    setDrafts({})
    setSavedAt(new Date().toISOString())
    onSaved?.()
    if (savedCount === 0) setError('Nada para guardar — todos los campos vacíos.')
  }

  if (!open) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Editar conteos Branch.io</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Snapshot manual desde el dashboard de Branch (Single Link Analytics).
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="px-3 py-1.5 rounded bg-[#0F52BA] text-white text-xs font-semibold hover:bg-[#0a3d8f]"
        >
          Abrir editor →
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-300 bg-white p-5">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Editar conteos Branch.io</h3>
          <p className="text-xs text-slate-500 mt-1">
            Anota el clicks acumulado por link como aparece en el Branch dashboard.
            Re-guardar en el mismo <code className="bg-slate-100 px-1 rounded">snapshot_date</code> sobreescribe la row del día.
          </p>
        </div>
        <button
          onClick={() => { setOpen(false); setDrafts({}); setError(null) }}
          className="text-xs text-slate-500 hover:text-slate-900"
        >
          Cerrar ✕
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 pb-4 border-b border-slate-200">
        <label className="text-xs">
          <span className="block text-slate-500 mb-1">Snapshot date</span>
          <input
            type="date"
            value={snapshotDate}
            onChange={(e) => setSnapshotDate(e.target.value)}
            className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
          />
        </label>
        <label className="text-xs md:col-span-2">
          <span className="block text-slate-500 mb-1">Tu email (opcional, para auditoría)</span>
          <input
            type="email"
            value={recordedBy}
            placeholder="ej. administracion@laneta.com"
            onChange={(e) => setRecordedBy(e.target.value)}
            className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
          />
        </label>
      </div>

      {error && (
        <div className="mb-3 rounded border border-rose-200 bg-rose-50 p-2 text-xs text-rose-700">{error}</div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wide">
              <th className="text-left py-2 pr-2">Alias / Campaña</th>
              <th className="text-right py-2 px-2">Último guardado</th>
              <th className="text-right py-2 px-2">Hoy ({snapshotDate})</th>
              <th className="text-right py-2 pl-2">Nuevo valor</th>
              <th className="py-2 pl-2 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {ALIAS_CONFIG.map((cfg) => {
              const latest = latestByAlias.get(cfg.alias)
              const today = todayByAlias.get(cfg.alias)
              const draft = drafts[cfg.alias] ?? ''
              const stepBadge = cfg.step !== null ? `Step ${cfg.step}` : '—'
              return (
                <tr key={cfg.alias} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50">
                  <td className="py-2 pr-2 align-top">
                    <div className="font-mono text-xs text-slate-800">{cfg.alias}</div>
                    <div className="text-[11px] text-slate-500">
                      {cfg.smartleadName} · {stepBadge}
                      {cfg.notes && <span className="text-amber-700 ml-1">⚠ {cfg.notes}</span>}
                    </div>
                  </td>
                  <td className="py-2 px-2 text-right tabular-nums text-slate-600">
                    {latest ? (
                      <span title={`${latest.snapshot_date} · ${latest.recorded_by ?? '—'}`}>
                        {latest.clicks.toLocaleString('en-US')}
                        <span className="block text-[10px] text-slate-400">{latest.snapshot_date}</span>
                      </span>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="py-2 px-2 text-right tabular-nums">
                    {today ? (
                      <span className="text-emerald-700 font-semibold">{today.clicks.toLocaleString('en-US')}</span>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="py-2 pl-2 text-right">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={draft}
                      onChange={(e) => setDrafts((d) => ({ ...d, [cfg.alias]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveAlias(cfg) }}
                      placeholder={today ? String(today.clicks) : (latest ? String(latest.clicks) : '0')}
                      className="w-24 px-2 py-1 border border-slate-300 rounded text-sm tabular-nums text-right"
                    />
                  </td>
                  <td className="py-2 pl-2">
                    <button
                      onClick={() => saveAlias(cfg)}
                      disabled={savingAlias === cfg.alias || draft === ''}
                      className="px-2 py-1 text-xs rounded bg-slate-700 text-white hover:bg-slate-900 disabled:bg-slate-300 disabled:cursor-not-allowed"
                    >
                      {savingAlias === cfg.alias ? '...' : 'Save'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          {savedAt && <span className="text-emerald-700">✓ Guardado {new Date(savedAt).toLocaleTimeString()}</span>}
        </p>
        <button
          onClick={saveAll}
          disabled={savingAlias !== null || Object.keys(drafts).length === 0}
          className="px-4 py-2 rounded bg-[#0F52BA] text-white text-sm font-semibold hover:bg-[#0a3d8f] disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          Guardar todos los modificados
        </button>
      </div>

      {/* ============ DEVICES SECTION ============ */}
      <div className="mt-8 pt-6 border-t-2 border-slate-200">
        <h4 className="text-base font-bold text-slate-900 mb-1">Device breakdown (% por OS)</h4>
        <p className="text-xs text-slate-500 mb-4">
          Capturado del donut chart "Clicks + Scans by Operating System" del PDF Branch Single Link Analytics.
          La suma debe ser ~100%. Re-guardar en el mismo <code className="bg-slate-100 px-1 rounded">snapshot_date</code> sobreescribe.
        </p>

        {latestDevices && (
          <div className="mb-3 rounded bg-slate-50 border border-slate-200 p-3 text-xs">
            <p className="text-slate-700 font-semibold mb-1">Último guardado: {latestDevices.snapshot_date}</p>
            <div className="flex gap-3 flex-wrap text-slate-600">
              {Object.entries(latestDevices.device_breakdown).map(([k, v]) => (
                <span key={k} className="font-mono">{k}: <b>{v}%</b></span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-3">
          {DEVICE_KEYS.map((k) => (
            <label key={k} className="text-xs">
              <span className="block text-slate-500 mb-1">{k}</span>
              <input
                type="number"
                min={0} max={100} step={0.1}
                value={deviceDrafts[k]}
                onChange={(e) => setDeviceDrafts((d) => ({ ...d, [k]: e.target.value }))}
                placeholder={String(latestDevices?.device_breakdown?.[k] ?? '0')}
                className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm tabular-nums text-right"
              />
            </label>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs">
            Suma actual: <span className={`font-bold tabular-nums ${Math.abs(deviceTotalDraft - 100) <= 1 ? 'text-emerald-700' : Math.abs(deviceTotalDraft - 100) <= 5 ? 'text-amber-700' : 'text-rose-700'}`}>
              {deviceTotalDraft.toFixed(1)}%
            </span>
            {' '}(esperado ~100%)
          </p>
          <button
            onClick={saveDevices}
            disabled={savingDevices || deviceTotalDraft === 0}
            className="px-4 py-2 rounded bg-[#10B981] text-white text-sm font-semibold hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            {savingDevices ? 'Guardando...' : 'Guardar device %'}
          </button>
        </div>
      </div>
    </div>
  )
}

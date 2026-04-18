import { useState } from 'react'
import { UserPlus, RotateCcw, Trash2, Play } from 'lucide-react'
import { storage, uid } from '../storage'
import { enrollProspect, resetRun } from '../enroll'
import { resolveTierByData } from '../templates'
import type { ProspectData, SequenceRun, Tier } from '../types'

interface Props {
  onEnrolled: (runId: string) => void
  activeRunId: string | null
  runs: SequenceRun[]
  onSelectRun: (runId: string) => void
  onChanged: () => void
}

const DEMO: Omit<ProspectData, 'id'>[] = [
  {
    first_name: 'Ana',
    last_name: 'Ramírez (Tier A)',
    email: 'ana@ejemplo-b2b.com',
    linkedin_url: 'https://www.linkedin.com/in/ana-ejemplo',
    phone: '+525555123456',
    country: 'MX',
  },
  {
    first_name: 'Luis',
    last_name: 'Torres (Tier B)',
    email: 'luis@ejemplo-b2b.com',
    linkedin_url: 'https://www.linkedin.com/in/luis-ejemplo',
    country: 'MX',
  },
  {
    first_name: 'Carla',
    last_name: 'Gómez (Tier C)',
    email: 'carla@ejemplo-b2b.com',
    country: 'CO',
  },
  {
    first_name: 'Jorge',
    last_name: 'López (sin datos)',
    country: 'AR',
  },
]

export default function LeadSimulator({
  onEnrolled,
  activeRunId,
  runs,
  onSelectRun,
  onChanged,
}: Props) {
  const [form, setForm] = useState<Omit<ProspectData, 'id'>>({
    first_name: '',
    last_name: '',
    email: '',
    linkedin_url: '',
    phone: '',
    country: 'MX',
  })
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10),
  )
  const [msg, setMsg] = useState<string | null>(null)
  const [msgKind, setMsgKind] = useState<'ok' | 'err' | null>(null)

  const tierPreview: Tier = resolveTierByData({
    email: form.email?.trim() || undefined,
    linkedin_url: form.linkedin_url?.trim() || undefined,
    phone: form.phone?.trim() || undefined,
  })

  function loadDemo(i: number) {
    const d = DEMO[i]
    setForm({
      first_name: d.first_name,
      last_name: d.last_name,
      email: d.email ?? '',
      linkedin_url: d.linkedin_url ?? '',
      phone: d.phone ?? '',
      country: d.country ?? '',
    })
  }

  function enroll() {
    setMsg(null)
    if (!form.first_name) {
      setMsg('Nombre requerido')
      setMsgKind('err')
      return
    }
    const prospect: ProspectData = {
      id: uid(),
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email?.trim() || undefined,
      linkedin_url: form.linkedin_url?.trim() || undefined,
      phone: form.phone?.trim() || undefined,
      country: form.country?.trim() || undefined,
    }
    const result = enrollProspect(prospect, startDate)
    if (!result.ok) {
      setMsg(result.error ?? 'No se pudo enrolar')
      setMsgKind('err')
      return
    }
    setMsg(
      `Enrolado en ${result.run!.sequence_name} (Tier ${result.tier}). ${result.tasks!.length} tasks creadas.`,
    )
    setMsgKind('ok')
    onChanged()
    if (result.run) onEnrolled(result.run.id)
  }

  function deleteRun(runId: string) {
    resetRun(runId)
    onChanged()
  }

  function clearAll() {
    if (!confirm('¿Borrar todos los leads, runs y tasks del simulador?')) return
    storage.resetAll()
    setMsg('Simulador reseteado')
    setMsgKind('ok')
    onChanged()
  }

  const prospects = storage.listProspects()

  return (
    <div className="p-4 text-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <UserPlus size={16} />
          Simulador de Leads
        </h3>
        <button
          onClick={clearAll}
          className="text-xs text-gray-500 hover:text-rose-600 flex items-center gap-1"
          title="Resetear todo"
        >
          <RotateCcw size={12} />
          Reset
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Input
          label="Nombre"
          value={form.first_name}
          onChange={(v) => setForm((f) => ({ ...f, first_name: v }))}
        />
        <Input
          label="Apellido"
          value={form.last_name}
          onChange={(v) => setForm((f) => ({ ...f, last_name: v }))}
        />
        <Input
          label="Email"
          value={form.email ?? ''}
          onChange={(v) => setForm((f) => ({ ...f, email: v }))}
          className="col-span-2"
        />
        <Input
          label="LinkedIn URL"
          value={form.linkedin_url ?? ''}
          onChange={(v) => setForm((f) => ({ ...f, linkedin_url: v }))}
          className="col-span-2"
        />
        <Input
          label="Teléfono"
          value={form.phone ?? ''}
          onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
        />
        <Input
          label="País (ISO)"
          value={form.country ?? ''}
          onChange={(v) => setForm((f) => ({ ...f, country: v }))}
        />
        <Input
          label="Fecha inicio"
          type="date"
          value={startDate}
          onChange={setStartDate}
          className="col-span-2"
        />
      </div>

      <div className="flex flex-wrap gap-1">
        {DEMO.map((d, i) => (
          <button
            key={i}
            onClick={() => loadDemo(i)}
            className="text-[11px] px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
          >
            {d.first_name} {d.last_name}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs">
        <span>
          Tier calculado:{' '}
          <span
            className={`font-semibold ${
              tierPreview === 'none'
                ? 'text-rose-600'
                : tierPreview === 'A'
                ? 'text-emerald-600'
                : tierPreview === 'B'
                ? 'text-amber-600'
                : 'text-indigo-600'
            }`}
          >
            {tierPreview === 'none' ? 'Sin datos (no enrolable)' : `Tier ${tierPreview}`}
          </span>
        </span>
        <button
          onClick={enroll}
          disabled={tierPreview === 'none'}
          className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-300"
        >
          <Play size={14} />
          Inscribir
        </button>
      </div>

      {msg && (
        <div
          className={`text-xs rounded px-2 py-1 ${
            msgKind === 'ok'
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-rose-50 text-rose-700'
          }`}
        >
          {msg}
        </div>
      )}

      <div className="pt-4 border-t">
        <h4 className="font-semibold text-gray-900 mb-2">Runs activos ({runs.length})</h4>
        {runs.length === 0 ? (
          <div className="text-xs text-gray-500 italic">
            Inscribe un lead para empezar a simular.
          </div>
        ) : (
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {runs.map((run) => {
              const p = prospects.find((x) => x.id === run.prospect_id)
              const isActive = run.id === activeRunId
              return (
                <div
                  key={run.id}
                  className={`flex items-start gap-2 px-2 py-1.5 rounded border ${
                    isActive ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200'
                  }`}
                >
                  <button
                    onClick={() => onSelectRun(run.id)}
                    className="flex-1 text-left"
                  >
                    <div className="font-medium text-gray-900 text-xs">
                      {p ? `${p.first_name} ${p.last_name}` : '(prospect eliminado)'}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      Tier {run.tier} · {run.sequence_name}
                    </div>
                    <div className="text-[11px]">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          run.status === 'active'
                            ? 'bg-indigo-100 text-indigo-700'
                            : run.status === 'won'
                            ? 'bg-emerald-100 text-emerald-700'
                            : run.status === 'exhausted'
                            ? 'bg-gray-100 text-gray-600'
                            : run.status === 'cancelled'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {run.status}
                      </span>
                      {run.ended_reason && (
                        <span className="ml-1 text-gray-500">
                          · {run.ended_reason}
                        </span>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={() => deleteRun(run.id)}
                    className="text-gray-400 hover:text-rose-600"
                    title="Eliminar run"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  className = '',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  className?: string
}) {
  return (
    <label className={`flex flex-col gap-0.5 ${className}`}>
      <span className="text-[11px] uppercase tracking-wider text-gray-500">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 text-sm"
      />
    </label>
  )
}

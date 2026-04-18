import { useState, useEffect } from 'react'
import { storage } from '../storage'
import { ALL_TEMPLATES } from '../templates'
import type { TemplateStep } from '../types'
import type { TreeSelection } from './TreeView'

interface Props {
  selection: TreeSelection | null
}

function findStep(sel: TreeSelection | null): TemplateStep | null {
  if (!sel) return null
  const tpl = ALL_TEMPLATES.find((t) => t.sequence_name === sel.sequence_name)
  if (!tpl) return null
  return tpl.steps.find((s) => s.step_number === sel.step_number) ?? null
}

export default function StepDetail({ selection }: Props) {
  const step = findStep(selection)
  const overrideKey = selection
    ? `${selection.sequence_name}:${selection.step_number}:template_id`
    : null

  const [overrideValue, setOverrideValue] = useState('')

  useEffect(() => {
    if (!overrideKey) return
    const overrides = storage.getOverrides()
    setOverrideValue(overrides[overrideKey] ?? '')
  }, [overrideKey])

  if (!step || !selection) {
    return (
      <div className="text-sm text-gray-500 italic p-6">
        Selecciona un step del árbol para ver su configuración.
      </div>
    )
  }

  const effectiveTemplateId =
    overrideValue || step.template_id || '(sin template)'

  function saveOverride() {
    if (!overrideKey) return
    storage.setOverride(overrideKey, overrideValue)
  }

  return (
    <div className="p-4 text-sm space-y-4">
      <header>
        <div className="text-xs uppercase tracking-wider text-gray-500">
          {step.sequence_name} · step {step.step_number}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mt-1">
          Día {step.offset_days} · {step.action_type}
        </h3>
      </header>

      <KV label="Canal" value={step.channel} />
      <KV label="Provider" value={step.provider} />
      <KV label="Delivery mode" value={step.delivery_mode} />

      <div>
        <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
          Template / Campaign ID
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={overrideValue}
            onChange={(e) => setOverrideValue(e.target.value)}
            placeholder={step.template_id ?? '(sin default)'}
            className="flex-1 border border-gray-300 rounded px-2 py-1 font-mono text-xs"
          />
          <button
            onClick={saveOverride}
            className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
          >
            Guardar
          </button>
        </div>
        <div className="text-[11px] text-gray-500 mt-1">
          Actual: <code className="font-mono">{effectiveTemplateId}</code>
        </div>
      </div>

      {step.signal_depends_on != null && (
        <div>
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
            Señal que evalúa
          </div>
          <div className="text-gray-700">
            {step.signal_depends_on === 'accumulated'
              ? 'Acumulado de señales B en todo el run (para decidir script hot/mixed/cold)'
              : `Respuesta del step ${step.signal_depends_on} → variante B / C / D`}
          </div>
        </div>
      )}

      {step.required_fields.length > 0 && (
        <KVList label="Campos requeridos" items={step.required_fields} mono />
      )}
      {step.required_assets.length > 0 && (
        <KVList label="Assets requeridos" items={step.required_assets} mono />
      )}

      {step.notes && (
        <div>
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
            Notas
          </div>
          <p className="text-gray-700">{step.notes}</p>
        </div>
      )}

      <div className="text-[11px] text-gray-400 pt-4 border-t">
        Persistido en <code>localStorage.configurador-flujo:template-overrides</code>
      </div>
    </div>
  )
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-gray-500">
        {label}
      </div>
      <div className="text-gray-900">{value}</div>
    </div>
  )
}

function KVList({
  label,
  items,
  mono,
}: {
  label: string
  items: string[]
  mono?: boolean
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
        {label}
      </div>
      <div className="flex flex-wrap gap-1">
        {items.map((x) => (
          <span
            key={x}
            className={`inline-block bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs ${
              mono ? 'font-mono' : ''
            }`}
          >
            {x}
          </span>
        ))}
      </div>
    </div>
  )
}

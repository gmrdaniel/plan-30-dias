import { useState } from 'react'
import { TEMPLATES } from '../data/plan'
import Modal from './Modal'

type Props = {
  open: boolean
  onClose: () => void
  /** Opcional: filtrar por canal (Plan A tiene ambos, Plan B solo Smartlead) */
  channelFilter?: 'Smartlead' | 'Brevo'
}

export default function TemplatesModal({ open, onClose, channelFilter }: Props) {
  const visible = channelFilter ? TEMPLATES.filter((t) => t.channel === channelFilter) : TEMPLATES
  const [activeId, setActiveId] = useState<string>(visible[0]?.id ?? '')
  const active = visible.find((t) => t.id === activeId) ?? visible[0]

  const copy = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Plantillas de correo"
      subtitle={channelFilter ? `Canal: ${channelFilter}` : 'Smartlead + Brevo · copy y notas de configuración'}
      maxWidth="max-w-5xl"
    >
      {!active ? (
        <p className="text-slate-600 text-sm">No hay plantillas para este canal.</p>
      ) : (
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 flex-wrap border-b border-slate-200 pb-3">
            {visible.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveId(t.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeId === t.id
                    ? 'bg-[#0F52BA] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span className="opacity-70 mr-1">{t.channel}</span>
                {t.name}
              </button>
            ))}
          </div>

          {/* Active template */}
          <div className="space-y-4">
            {/* Header info */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs uppercase text-slate-500 font-semibold">{active.channel} · {active.bodyType === 'plain' ? 'Texto plano' : 'HTML'}</p>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">{active.name}</p>
              <p className="text-xs text-slate-600 mt-1">{active.step}</p>
            </div>

            {/* Subject */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs uppercase text-slate-500 font-semibold">Subject</h4>
                <button
                  onClick={() => copy(active.subject)}
                  className="text-xs text-[#0F52BA] hover:underline"
                >
                  Copiar
                </button>
              </div>
              <pre className="bg-slate-900 text-slate-100 text-sm font-mono p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">{active.subject}</pre>
              {active.subjectAlt && (
                <p className="text-xs text-slate-500 mt-1 italic">Alternativa: {active.subjectAlt}</p>
              )}
            </div>

            {/* Body */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs uppercase text-slate-500 font-semibold">Body ({active.bodyType})</h4>
                <button
                  onClick={() => copy(active.body)}
                  className="text-xs text-[#0F52BA] hover:underline"
                >
                  Copiar
                </button>
              </div>
              <pre className="bg-slate-900 text-slate-100 text-xs font-mono p-3 rounded-lg overflow-x-auto whitespace-pre leading-relaxed max-h-[400px]">{active.body}</pre>
            </div>

            {/* Variables + Branch link */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <h4 className="text-xs uppercase text-slate-500 font-semibold mb-2">Variables usadas</h4>
                <ul className="space-y-1.5 text-xs">
                  {active.variables.map((v, i) => (
                    <li key={i} className="flex gap-2">
                      <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700 shrink-0">{v.var}</code>
                      <span className="text-slate-600">{v.meaning}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3 border-l-4 border-l-[#0F52BA]">
                <h4 className="text-xs uppercase text-[#0F52BA] font-semibold mb-1">Branch link</h4>
                <p className="text-xs font-mono text-slate-700">{active.branchLink}</p>
              </div>
            </div>

            {/* Config */}
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <h4 className="text-xs uppercase text-slate-500 font-semibold mb-2">Configuración</h4>
              <ul className="space-y-1 text-xs text-slate-700">
                {active.config.map((c, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-[#0F52BA] shrink-0">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Notes */}
            <div className="rounded-lg border border-slate-200 bg-white p-3 border-l-4 border-l-[#F59E0B]">
              <h4 className="text-xs uppercase text-[#F59E0B] font-semibold mb-2">Notas importantes</h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {active.notes.map((n, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="shrink-0 text-[#F59E0B]">{i + 1}.</span>
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}

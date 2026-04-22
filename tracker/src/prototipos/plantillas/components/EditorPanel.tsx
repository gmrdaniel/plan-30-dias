import type { PreviewPersona, Warning } from '../types'
import HighlightedTextarea from './HighlightedTextarea'
import WarningsList from './WarningsList'

interface Props {
  subject: string
  bodyPlain: string
  onSubjectChange: (v: string) => void
  onBodyChange: (v: string) => void
  personas: PreviewPersona[]
  activePersonaId: string | null
  onPersonaChange: (id: string) => void
  warnings?: Warning[]
}

export default function EditorPanel({
  subject,
  bodyPlain,
  onSubjectChange,
  onBodyChange,
  personas,
  activePersonaId,
  onPersonaChange,
  warnings = [],
}: Props) {
  const subjectLen = subject.length
  const subjectOver = subjectLen > 60

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 space-y-3">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Subject</label>
          <div className="flex items-center gap-2">
            <input
              value={subject}
              onChange={(e) => onSubjectChange(e.target.value)}
              className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="Asunto del email…"
            />
            <span
              className={`text-xs font-mono w-14 text-right ${subjectOver ? 'text-red-600' : 'text-slate-400'}`}
              title="Caracteres / límite recomendado"
            >
              {subjectLen}/60
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500">Persona preview:</label>
          <select
            value={activePersonaId ?? ''}
            onChange={(e) => onPersonaChange(e.target.value)}
            className="text-sm rounded border border-slate-300 px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {personas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.is_default ? ' (default)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 min-h-0 p-4 pt-0 flex flex-col gap-3 overflow-y-auto">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Body (plain text)</label>
          <HighlightedTextarea
            value={bodyPlain}
            onChange={onBodyChange}
            placeholder="Hey {{first_name}},&#10;&#10;..."
            minHeight={340}
            ariaLabel="Body plain text"
          />
          <p className="text-[11px] text-slate-400 mt-2">
            Variables como <code>{'{{first_name}}'}</code> en azul ·
            Placeholders <code>{'{{link}}'}</code> y <code>{'{{qr}}'}</code> en violeta ·
            Pipe fallback <code>{'{{x|y}}'}</code> en rojo (no soportado por Smartlead)
          </p>
        </div>

        <div className="border-t pt-3">
          <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Warnings</div>
          <WarningsList warnings={warnings} />
        </div>
      </div>
    </div>
  )
}

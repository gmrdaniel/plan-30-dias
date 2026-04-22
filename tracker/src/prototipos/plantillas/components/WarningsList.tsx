import type { Warning } from '../types'

interface Props {
  warnings: Warning[]
  onJump?: (w: Warning) => void
}

const ICON: Record<Warning['severity'], string> = {
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
}

const COLOR: Record<Warning['severity'], string> = {
  error: 'bg-red-50 border-red-200 text-red-900',
  warning: 'bg-amber-50 border-amber-200 text-amber-900',
  info: 'bg-blue-50 border-blue-200 text-blue-900',
}

const LOCATION_LABEL: Record<Warning['location'], string> = {
  subject: 'subject',
  body: 'body',
  global: 'global',
}

export default function WarningsList({ warnings, onJump }: Props) {
  if (warnings.length === 0) {
    return (
      <div className="text-xs text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2 flex items-center gap-2">
        <span>✅</span>
        <span>Sin warnings — plantilla lista para guardar.</span>
      </div>
    )
  }

  const errors = warnings.filter((w) => w.severity === 'error').length
  const warns = warnings.filter((w) => w.severity === 'warning').length
  const infos = warnings.filter((w) => w.severity === 'info').length

  return (
    <div className="space-y-2">
      <div className="text-xs text-slate-600 flex items-center gap-3">
        <span>
          <strong>{warnings.length}</strong> {warnings.length === 1 ? 'warning' : 'warnings'}
        </span>
        {errors > 0 && <span className="text-red-600">{errors} error{errors !== 1 && 'es'}</span>}
        {warns > 0 && <span className="text-amber-700">{warns} warning{warns !== 1 && 's'}</span>}
        {infos > 0 && <span className="text-blue-700">{infos} info</span>}
      </div>
      <ul className="space-y-1">
        {warnings.map((w, i) => (
          <li
            key={`${w.code}-${w.location}-${i}`}
            className={`border rounded px-3 py-2 text-xs ${COLOR[w.severity]}`}
          >
            <button
              onClick={() => onJump?.(w)}
              className="w-full text-left flex items-start gap-2 hover:opacity-80"
            >
              <span className="shrink-0 mt-0.5">{ICON[w.severity]}</span>
              <div className="flex-1 min-w-0">
                <div>
                  <span className="font-mono text-[10px] opacity-70 mr-2">
                    {w.code} · {LOCATION_LABEL[w.location]}
                  </span>
                </div>
                <div>{w.message}</div>
                {w.suggestedFix && (
                  <div className="mt-1 text-[11px] opacity-80">
                    <strong>Fix:</strong> {w.suggestedFix}
                  </div>
                )}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

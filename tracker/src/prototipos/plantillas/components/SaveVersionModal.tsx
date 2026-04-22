import { useEffect, useRef, useState } from 'react'
import type { Warning } from '../types'

interface Props {
  nextVersion: number
  warnings: Warning[]
  blocked: boolean
  saving: boolean
  onCancel: () => void
  onConfirm: (commitMessage: string) => void
}

export default function SaveVersionModal({
  nextVersion,
  warnings,
  blocked,
  saving,
  onCancel,
  onConfirm,
}: Props) {
  const [commitMessage, setCommitMessage] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  const errorCount = warnings.filter((w) => w.severity === 'error').length
  const warnCount = warnings.filter((w) => w.severity === 'warning').length

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-3">Guardar nueva versión (v{nextVersion})</h2>

        <label className="block text-xs text-slate-500 mb-1">Commit message</label>
        <input
          ref={inputRef}
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          placeholder='ej: "ajusté subject, quité emoji"'
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !blocked) onConfirm(commitMessage.trim())
          }}
        />

        <div className="mt-3 text-xs space-y-0.5">
          {errorCount > 0 && (
            <div className="text-red-700">❌ {errorCount} error{errorCount !== 1 && 'es'} · bloquea guardar</div>
          )}
          {warnCount > 0 && (
            <div className="text-amber-700">⚠️ {warnCount} warning{warnCount !== 1 && 's'} · se guardan como metadata</div>
          )}
          {warnings.length === 0 && <div className="text-green-700">✅ Sin warnings</div>}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={saving}
            className="px-3 py-1.5 text-sm rounded border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(commitMessage.trim())}
            disabled={blocked || saving}
            className="px-3 py-1.5 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            {saving ? 'Guardando…' : 'Guardar draft'}
          </button>
        </div>
      </div>
    </div>
  )
}

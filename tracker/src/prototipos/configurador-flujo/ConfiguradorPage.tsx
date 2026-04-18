import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Info, XOctagon, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import TreeView, { type TreeSelection } from './components/TreeView'
import StepDetail from './components/StepDetail'
import LeadSimulator from './components/LeadSimulator'
import LeadTimeline, { getHighlightedStepsForRun } from './components/LeadTimeline'
import { validateTemplates } from './validate'
import { storage } from './storage'
import type { SequenceRun } from './types'

export default function ConfiguradorPage() {
  const [selection, setSelection] = useState<TreeSelection | null>({
    sequence_name: 'b2b-21d-full',
    step_number: 1,
  })
  const [activeRunId, setActiveRunId] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const refresh = () => setTick((t) => t + 1)

  const runs = useMemo<SequenceRun[]>(() => {
    return storage
      .listRuns()
      .sort(
        (a, b) =>
          new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
      )
  }, [tick])

  useEffect(() => {
    if (!activeRunId && runs.length > 0) setActiveRunId(runs[0].id)
    if (activeRunId && !runs.find((r) => r.id === activeRunId)) {
      setActiveRunId(runs[0]?.id ?? null)
    }
  }, [runs, activeRunId])

  const activeRun = runs.find((r) => r.id === activeRunId) ?? null

  const highlightedSteps = useMemo(
    () => getHighlightedStepsForRun(activeRun),
    [activeRun, tick],
  )

  const validationIssues = useMemo(() => validateTemplates(), [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-gray-500 hover:text-gray-900 flex items-center gap-1 text-sm"
            >
              <ArrowLeft size={14} />
              Volver
            </Link>
            <div className="h-5 w-px bg-gray-200"></div>
            <h1 className="text-lg font-semibold text-gray-900">
              Configurador de Flujo B2B
            </h1>
            <span className="text-xs text-gray-500">
              Prototipo de secuencias + simulador de avance
            </span>
          </div>
          <ValidationBadge
            issues={validationIssues.length}
            errors={validationIssues.filter((i) => i.severity === 'error').length}
            warnings={
              validationIssues.filter((i) => i.severity === 'warning').length
            }
          />
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 py-4 grid grid-cols-12 gap-4">
        <section className="col-span-4 bg-white rounded-lg border p-4 max-h-[calc(100vh-7rem)] overflow-y-auto">
          <h2 className="text-xs uppercase tracking-wider text-gray-500 mb-3 font-semibold">
            Árbol de plantillas
          </h2>
          <TreeView
            selection={selection}
            onSelect={setSelection}
            highlightedSteps={highlightedSteps}
          />

          {validationIssues.length > 0 && (
            <details className="mt-4 text-xs">
              <summary className="cursor-pointer text-gray-600 hover:text-gray-900">
                {validationIssues.length} issues de validación
              </summary>
              <ul className="mt-2 space-y-1">
                {validationIssues.map((i, idx) => (
                  <li
                    key={idx}
                    className={`flex items-start gap-1 rounded px-2 py-1 ${
                      i.severity === 'error'
                        ? 'bg-rose-50 text-rose-700'
                        : i.severity === 'warning'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-sky-50 text-sky-700'
                    }`}
                  >
                    {i.severity === 'error' ? (
                      <XOctagon size={12} className="mt-0.5" />
                    ) : i.severity === 'warning' ? (
                      <AlertTriangle size={12} className="mt-0.5" />
                    ) : (
                      <Info size={12} className="mt-0.5" />
                    )}
                    <span>
                      <b>{i.sequence_name}</b>
                      {i.step_number != null && ` · step ${i.step_number}`}:{' '}
                      {i.message}
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>

        <section className="col-span-4 bg-white rounded-lg border max-h-[calc(100vh-7rem)] overflow-y-auto">
          <StepDetail selection={selection} />
        </section>

        <section className="col-span-4 space-y-4">
          <div className="bg-white rounded-lg border max-h-[calc(50vh-4rem)] overflow-y-auto">
            <LeadSimulator
              onEnrolled={setActiveRunId}
              activeRunId={activeRunId}
              runs={runs}
              onSelectRun={setActiveRunId}
              onChanged={refresh}
            />
          </div>
          <div className="bg-white rounded-lg border max-h-[calc(50vh-4rem)] overflow-y-auto">
            <LeadTimeline runId={activeRunId} onChanged={refresh} />
          </div>
        </section>
      </main>
    </div>
  )
}

function ValidationBadge({
  issues,
  errors,
  warnings,
}: {
  issues: number
  errors: number
  warnings: number
}) {
  if (issues === 0) {
    return (
      <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded">
        ✓ 0 issues
      </span>
    )
  }
  return (
    <div className="flex items-center gap-1 text-xs">
      {errors > 0 && (
        <span className="bg-rose-100 text-rose-700 px-2 py-1 rounded flex items-center gap-1">
          <XOctagon size={12} /> {errors}
        </span>
      )}
      {warnings > 0 && (
        <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded flex items-center gap-1">
          <AlertTriangle size={12} /> {warnings}
        </span>
      )}
    </div>
  )
}

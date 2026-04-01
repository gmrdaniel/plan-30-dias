import { Link, useSearchParams } from 'react-router-dom'
import { ArrowDown, CheckCircle2, Zap, Mail, XCircle, Database, Search, BarChart3, Bot, UserRound, Unplug, RefreshCw } from 'lucide-react'
import { B2B_PHASES, CREATOR_PHASES, type PhaseData } from '../lib/pipeline-data'

const ICONS = { Search, Database, Zap, Mail, CheckCircle2, XCircle }

type PipelineTab = 'b2b' | 'creators'

function PipelineTimeline({ phases }: { phases: PhaseData[] }) {
  return (
    <div className="space-y-4">
      {phases.map((phase, pi) => {
        const Icon = ICONS[phase.iconName]
        return (
          <div key={phase.id}>
            <div className={`border-2 rounded-xl p-4 ${phase.bgColor}`}>
              <div className="flex items-start gap-3">
                <Icon size={22} className={`${phase.color} shrink-0 mt-0.5`} />
                <div className="flex-1">
                  <h2 className={`text-lg font-bold ${phase.color}`}>{phase.title}</h2>
                  <p className="text-sm text-gray-600">{phase.subtitle}</p>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                    <span><strong>Cuándo:</strong> {phase.when}</span>
                    <span><strong>Ejecuta:</strong> {phase.who}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {phase.steps.map((step) => (
                  <div key={step.id} className="bg-white rounded-lg border p-3">
                    <div className="flex items-start gap-2">
                      {step.dayRange && (
                        <span className="text-xs font-mono font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded shrink-0">
                          {step.dayRange}
                        </span>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{step.label}</div>
                        <p className="text-xs text-gray-500 mt-0.5">{step.detail}</p>

                        <div className="flex flex-wrap gap-2 mt-2">
                          {step.tools.map((t, i) => (
                            <span key={i} className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${
                              t.auto ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {t.auto ? <Bot size={12} /> : <UserRound size={12} />}
                              {t.name}: {t.role}
                            </span>
                          ))}
                          {step.syncs.map((s, i) => (
                            <span key={`s${i}`} className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${
                              s.auto ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-600 border-gray-200'
                            }`}>
                              <RefreshCw size={12} />
                              {s.target} ({s.method})
                            </span>
                          ))}
                        </div>

                        {step.gaps && step.gaps.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {step.gaps.map((g) => (
                              <Link key={g} to="/blockers" className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full border border-red-200 hover:bg-red-200">
                                <Unplug size={12} /> {g}
                              </Link>
                            ))}
                          </div>
                        )}

                        <div className="mt-1">
                          <Link to={`/task/${step.task}`} className="text-xs text-indigo-500 hover:text-indigo-700 underline">
                            {step.task}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {pi < phases.length - 1 && (
              <div className="flex justify-center py-2">
                <ArrowDown size={20} className="text-gray-300" />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function Pipeline() {
  const [params, setParams] = useSearchParams()
  const activeTab = (params.get('tab') as PipelineTab) || 'b2b'

  const setTab = (tab: PipelineTab) => {
    setParams({ tab }, { replace: true })
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <div className="mb-2">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 size={24} /> Pipeline: Vida de un prospecto
        </h1>
        <p className="text-gray-500 text-sm">Flujo completo desde la búsqueda hasta el cierre o nurture</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setTab('b2b')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'b2b' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          B2B (Marcas) — 21 días
        </button>
        <button
          onClick={() => setTab('creators')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'creators' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Creadores — 7 días
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-5 text-xs bg-white border rounded-lg p-3">
        <span className="flex items-center gap-1.5"><Bot size={14} className="text-green-600" /> Automático</span>
        <span className="flex items-center gap-1.5"><UserRound size={14} className="text-amber-600" /> Manual</span>
        <span className="flex items-center gap-1.5"><Unplug size={14} className="text-red-500" /> Gap / No conectado</span>
        <span className="flex items-center gap-1.5"><RefreshCw size={14} className="text-blue-500" /> Sync a otro sistema</span>
      </div>

      {/* Timeline */}
      <PipelineTimeline phases={activeTab === 'b2b' ? B2B_PHASES : CREATOR_PHASES} />
    </div>
  )
}

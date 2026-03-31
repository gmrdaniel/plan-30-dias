import { useSearchParams } from 'react-router-dom'
import { useTasks } from '../hooks/use-tasks'
import { useAuth } from '../hooks/use-auth'
import TaskCard from '../components/TaskCard'
import { PHASE_LABELS, type TaskPhase } from '../lib/types'

const PHASES: TaskPhase[] = ['pre_sprint', 'semana_1', 'semana_2', 'semana_3_4', 'cierre']

export default function Board() {
  const { tasks, loading } = useTasks()
  const { members } = useAuth()
  const [params, setParams] = useSearchParams()

  const filterPerson = params.get('person') || 'all'
  const filterPriority = params.get('priority') || 'all'
  const filterStatus = params.get('status') || 'all'

  const setFilter = (key: string, value: string) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value === 'all') {
        next.delete(key)
      } else {
        next.set(key, value)
      }
      return next
    }, { replace: true })
  }

  if (loading) return <div className="p-8 text-gray-400">Cargando...</div>

  const filtered = tasks.filter((t) => {
    if (filterPerson !== 'all' && !t.assignments.some((a) => a.member_id === filterPerson)) return false
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false
    if (filterStatus !== 'all' && t.status !== filterStatus) return false
    return true
  })

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Board</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterPerson}
          onChange={(e) => setFilter('person', e.target.value)}
          className="px-3 py-1.5 border rounded-lg text-sm bg-white"
        >
          <option value="all">Todos</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.short_name}</option>
          ))}
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilter('priority', e.target.value)}
          className="px-3 py-1.5 border rounded-lg text-sm bg-white"
        >
          <option value="all">Todas las prioridades</option>
          <option value="CRITICA">Critica</option>
          <option value="ALTA">Alta</option>
          <option value="MEDIA">Media</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilter('status', e.target.value)}
          className="px-3 py-1.5 border rounded-lg text-sm bg-white"
        >
          <option value="all">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_progreso">En Progreso</option>
          <option value="bloqueada">Bloqueada</option>
          <option value="completada">Completada</option>
        </select>
        {(filterPerson !== 'all' || filterPriority !== 'all' || filterStatus !== 'all') && (
          <button
            onClick={() => setParams({}, { replace: true })}
            className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Phase columns */}
      <div className="space-y-6">
        {PHASES.map((phase) => {
          const phaseTasks = filtered.filter((t) => t.phase === phase)
          if (phaseTasks.length === 0) return null
          return (
            <div key={phase}>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {PHASE_LABELS[phase]} ({phaseTasks.length})
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {phaseTasks.map((t) => (
                  <TaskCard key={t.task_id} task={t} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useTasks } from '../hooks/use-tasks'
import { useAuth } from '../hooks/use-auth'
import TaskCard from '../components/TaskCard'

export default function MyView() {
  const { tasks, loading } = useTasks()
  const { user, members } = useAuth()
  const [showAll, setShowAll] = useState(false)
  const [viewAs, setViewAs] = useState<string>(user?.id || '')

  if (loading || !user) return <div className="p-8 text-gray-400">Cargando...</div>

  const targetId = showAll ? null : viewAs || user.id
  const filtered = targetId
    ? tasks.filter((t) => t.assignments.some((a) => a.member_id === targetId))
    : tasks

  const targetMember = members.find((m) => m.id === targetId) || user

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            {showAll ? 'Todas las tareas' : `Tareas de ${targetMember.short_name}`}
          </h1>
          <p className="text-gray-500 text-sm">{filtered.length} tareas</p>
        </div>
        <div className="flex gap-2">
          {!showAll && (
            <select
              value={viewAs}
              onChange={(e) => setViewAs(e.target.value)}
              className="px-3 py-1.5 border rounded-lg text-sm bg-white"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.short_name}</option>
              ))}
            </select>
          )}
          <button
            onClick={() => setShowAll(!showAll)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              showAll ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {showAll ? 'Ver mis tareas' : 'Ver todas'}
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t) => (
          <TaskCard key={t.task_id} task={t} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-gray-400 text-center py-8">No hay tareas</p>
      )}
    </div>
  )
}

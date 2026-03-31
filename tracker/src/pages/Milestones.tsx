import { useMilestones } from '../hooks/use-tasks'
import { useAuth } from '../hooks/use-auth'
import { CheckCircle2, Circle } from 'lucide-react'

export default function Milestones() {
  const { milestones, toggleMilestone } = useMilestones()
  const { user } = useAuth()
  const completed = milestones.filter((m) => m.is_completed).length

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hitos del Sprint</h1>
        <p className="text-gray-500 text-sm">{completed}/{milestones.length} completados</p>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-3">
        <div
          className="h-3 rounded-full bg-green-500 transition-all"
          style={{ width: `${milestones.length > 0 ? (completed / milestones.length) * 100 : 0}%` }}
        />
      </div>

      <div className="space-y-2">
        {milestones.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 p-4 bg-white border rounded-xl transition-colors ${
              m.is_completed ? 'bg-green-50 border-green-200' : ''
            }`}
          >
            <button
              onClick={() => user?.is_leader && toggleMilestone(m.id, !m.is_completed)}
              disabled={!user?.is_leader}
              className={user?.is_leader ? 'cursor-pointer' : 'cursor-default'}
            >
              {m.is_completed ? (
                <CheckCircle2 size={22} className="text-green-500 mt-0.5" />
              ) : (
                <Circle size={22} className="text-gray-300 mt-0.5" />
              )}
            </button>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-xs font-bold text-gray-400">{m.milestone_id}</span>
                <span className={`font-medium ${m.is_completed ? 'line-through text-gray-400' : ''}`}>{m.title}</span>
              </div>
              <div className="text-sm text-gray-500 mt-1">{m.success_criteria}</div>
              <div className="text-xs text-gray-400 mt-1">Fecha objetivo: {m.target_date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

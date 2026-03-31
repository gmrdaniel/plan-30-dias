import { Link } from 'react-router-dom'
import type { TaskFull } from '../hooks/use-tasks'
import { PRIORITY_CONFIG, STATUS_CONFIG } from '../lib/types'

export default function TaskCard({ task }: { task: TaskFull }) {
  const pri = PRIORITY_CONFIG[task.priority]
  const st = STATUS_CONFIG[task.status]
  const responsables = task.assignments.filter((a) => a.assignment_role === 'responsable' || a.assignment_role === 'co-ejecuta')
  const apoyo = task.assignments.filter((a) => a.assignment_role === 'apoyo')

  return (
    <Link
      to={`/task/${task.task_id}`}
      className="block bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-gray-400">{task.task_id}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pri.bg} ${pri.color}`}>
            {pri.label}
          </span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${st.bg} ${st.color}`}>
          {st.label}
        </span>
      </div>

      <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">{task.title}</h3>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progreso</span>
          <span>{task.progress_pct}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${task.progress_pct === 100 ? 'bg-green-500' : 'bg-indigo-500'}`}
            style={{ width: `${task.progress_pct}%` }}
          />
        </div>
      </div>

      {/* Assignees */}
      <div className="flex items-center gap-1">
        {responsables.map((a) => (
          <div
            key={a.id}
            title={`${a.team_members?.name} (${a.assignment_role})`}
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-white"
            style={{ backgroundColor: a.team_members?.avatar_color }}
          >
            {a.team_members?.short_name?.[0]}
          </div>
        ))}
        {apoyo.length > 0 && (
          <>
            <span className="text-gray-300 text-xs mx-0.5">|</span>
            {apoyo.map((a) => (
              <div
                key={a.id}
                title={`${a.team_members?.name} (apoyo)`}
                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold opacity-50 ring-1 ring-white"
                style={{ backgroundColor: a.team_members?.avatar_color }}
              >
                {a.team_members?.short_name?.[0]}
              </div>
            ))}
          </>
        )}
        <span className="text-xs text-gray-400 ml-auto">
          {task.due_date ? new Date(task.due_date + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) : ''}
        </span>
      </div>
    </Link>
  )
}

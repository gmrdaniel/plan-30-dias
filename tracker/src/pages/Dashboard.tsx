import { useTasks } from '../hooks/use-tasks'
import { useMilestones } from '../hooks/use-tasks'
import { useAuth } from '../hooks/use-auth'
import { PHASE_LABELS, type TaskPhase } from '../lib/types'
import { CheckCircle2, Circle, AlertTriangle, Clock } from 'lucide-react'

export default function Dashboard() {
  const { tasks, loading } = useTasks()
  const { milestones, toggleMilestone } = useMilestones()
  const { members, user } = useAuth()

  if (loading) return <div className="p-8 text-gray-400">Cargando...</div>

  const total = tasks.length
  const completed = tasks.filter((t) => t.status === 'completada').length
  const inProgress = tasks.filter((t) => t.status === 'en_progreso').length
  const blocked = tasks.filter((t) => t.status === 'bloqueada').length
  const avgProgress = total > 0 ? Math.round(tasks.reduce((s, t) => s + t.progress_pct, 0) / total) : 0

  // Per person stats
  const personStats = members.map((m) => {
    const myTasks = tasks.filter((t) =>
      t.assignments.some((a) => a.member_id === m.id && (a.assignment_role === 'responsable' || a.assignment_role === 'co-ejecuta'))
    )
    const done = myTasks.filter((t) => t.status === 'completada').length
    const avg = myTasks.length > 0 ? Math.round(myTasks.reduce((s, t) => s + t.progress_pct, 0) / myTasks.length) : 0
    return { member: m, total: myTasks.length, done, avg }
  })

  // Tasks due today or overdue
  const today = new Date().toISOString().split('T')[0]
  const overdue = tasks.filter((t) => t.due_date < today && t.status !== 'completada')
  const dueToday = tasks.filter((t) => t.due_date === today && t.status !== 'completada')

  // Phase breakdown
  const phases: TaskPhase[] = ['pre_sprint', 'semana_1', 'semana_2', 'semana_3_4', 'cierre']

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500 text-sm">Sprint 6 Abr - 8 May 2026</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total tareas" value={total} />
        <StatCard label="Completadas" value={completed} accent="text-green-600" />
        <StatCard label="En progreso" value={inProgress} accent="text-blue-600" />
        <StatCard label="Bloqueadas" value={blocked} accent="text-red-600" />
        <StatCard label="Avance global" value={`${avgProgress}%`} accent="text-indigo-600" />
      </div>

      {/* Alerts */}
      {(overdue.length > 0 || dueToday.length > 0) && (
        <div className="space-y-2">
          {overdue.map((t) => (
            <div key={t.task_id} className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">
              <AlertTriangle size={16} />
              <span className="font-mono font-bold">{t.task_id}</span> {t.title} — vencida {t.due_date}
            </div>
          ))}
          {dueToday.map((t) => (
            <div key={t.task_id} className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-lg text-sm">
              <Clock size={16} />
              <span className="font-mono font-bold">{t.task_id}</span> {t.title} — vence hoy
            </div>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Per person */}
        <div className="bg-white rounded-xl border p-4">
          <h2 className="font-semibold mb-3">Avance por persona</h2>
          <div className="space-y-3">
            {personStats.map((ps) => (
              <div key={ps.member.id} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: ps.member.avatar_color }}
                >
                  {ps.member.short_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{ps.member.short_name}</span>
                    <span className="text-gray-500">{ps.done}/{ps.total} tareas — {ps.avg}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                    <div
                      className={`h-2 rounded-full ${ps.avg === 100 ? 'bg-green-500' : 'bg-indigo-500'}`}
                      style={{ width: `${ps.avg}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Milestones */}
        <div className="bg-white rounded-xl border p-4">
          <h2 className="font-semibold mb-3">Hitos</h2>
          <div className="space-y-2">
            {milestones.map((m) => (
              <button
                key={m.id}
                onClick={() => user?.is_leader && toggleMilestone(m.id, !m.is_completed)}
                className={`w-full flex items-start gap-2 p-2 rounded-lg text-left text-sm transition-colors ${
                  m.is_completed ? 'bg-green-50' : 'hover:bg-gray-50'
                } ${user?.is_leader ? 'cursor-pointer' : 'cursor-default'}`}
              >
                {m.is_completed ? (
                  <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
                ) : (
                  <Circle size={18} className="text-gray-300 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-mono text-xs text-gray-400 mr-1">{m.milestone_id}</span>
                  <span className={m.is_completed ? 'line-through text-gray-400' : ''}>{m.title}</span>
                  <div className="text-xs text-gray-400">{m.target_date} — {m.success_criteria}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Phase breakdown */}
      <div className="bg-white rounded-xl border p-4">
        <h2 className="font-semibold mb-3">Avance por fase</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {phases.map((phase) => {
            const phaseTasks = tasks.filter((t) => t.phase === phase)
            const phaseCompleted = phaseTasks.filter((t) => t.status === 'completada').length
            const pct = phaseTasks.length > 0 ? Math.round((phaseCompleted / phaseTasks.length) * 100) : 0
            return (
              <div key={phase} className="text-center p-3 rounded-lg bg-gray-50">
                <div className="text-2xl font-bold text-indigo-600">{pct}%</div>
                <div className="text-xs text-gray-500 mt-1">{PHASE_LABELS[phase]}</div>
                <div className="text-xs text-gray-400">{phaseCompleted}/{phaseTasks.length}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="bg-white rounded-xl border p-4 text-center">
      <div className={`text-2xl font-bold ${accent || 'text-gray-900'}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  )
}

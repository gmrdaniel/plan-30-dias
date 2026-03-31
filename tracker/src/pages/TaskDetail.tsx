import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTasks, useChecklist, useComments } from '../hooks/use-tasks'
import { useAuth } from '../hooks/use-auth'
import { PRIORITY_CONFIG, STATUS_CONFIG, type TaskStatus } from '../lib/types'
import { ArrowLeft, CheckSquare, Square, MessageCircle, Send, ArrowDownLeft, ArrowUpRight, FileText } from 'lucide-react'
import { isDto, getDtoInfo } from '../lib/dtos'
import { getTaskTools } from '../lib/tools'
import { ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

const STATUSES: TaskStatus[] = ['pendiente', 'en_progreso', 'bloqueada', 'completada']

export default function TaskDetail() {
  const { taskId } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const { tasks, updateStatus } = useTasks()
  const { items: checklist, toggleItem } = useChecklist(taskId || '')
  const { comments, addComment } = useComments(taskId || '')
  const { user, members } = useAuth()
  const [newComment, setNewComment] = useState('')

  const task = tasks.find((t) => t.task_id === taskId)
  if (!task) return <div className="p-8 text-gray-400">Tarea no encontrada</div>

  const pri = PRIORITY_CONFIG[task.priority]
  const entregables = checklist.filter((c) => c.category === 'entregable')
  const criterios = checklist.filter((c) => c.category === 'criterio')
  const responsables = task.assignments.filter((a) => a.assignment_role === 'responsable' || a.assignment_role === 'co-ejecuta')
  const apoyo = task.assignments.filter((a) => a.assignment_role === 'apoyo')

  const handleComment = async () => {
    if (!newComment.trim() || !user) return
    await addComment(user.id, newComment.trim())
    setNewComment('')
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft size={16} /> Volver
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono font-bold text-gray-400">{task.task_id}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pri.bg} ${pri.color}`}>{pri.label}</span>
            </div>
            <h1 className="text-xl font-bold">{task.title}</h1>
          </div>
          <select
            value={task.status}
            onChange={(e) => updateStatus(task.task_id, e.target.value as TaskStatus)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${STATUS_CONFIG[task.status].bg} ${STATUS_CONFIG[task.status].color}`}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white border rounded-xl p-4">
        <div>
          <div className="text-xs text-gray-500 mb-1">Inicio</div>
          <div className="text-sm font-medium">{task.start_date}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Entrega</div>
          <div className="text-sm font-medium">{task.due_date}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Progreso</div>
          <div className="text-sm font-medium">{task.progress_pct}%</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Bloquea a</div>
          <div className="flex flex-wrap gap-1">
            {task.blocks.length > 0 ? task.blocks.map((b) => (
              isDto(b) ? (
                <Link key={b} to="/docs/dtos-dependencias" className="text-xs font-mono bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded hover:bg-purple-200">{b}</Link>
              ) : (
                <Link key={b} to={`/task/${b}`} className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded hover:bg-gray-200">{b}</Link>
              )
            )) : <span className="text-xs text-gray-400">Ninguna</span>}
          </div>
        </div>
      </div>

      {/* Assignees */}
      <div className="bg-white border rounded-xl p-4">
        <h2 className="text-sm font-semibold mb-2">Equipo</h2>
        <div className="flex flex-wrap gap-3">
          {responsables.map((a) => (
            <div key={a.id} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: a.team_members?.avatar_color }}>
                {a.team_members?.short_name?.[0]}
              </div>
              <div>
                <div className="text-sm font-medium">{a.team_members?.short_name}</div>
                <div className="text-xs text-indigo-600">{a.assignment_role}</div>
              </div>
            </div>
          ))}
          {apoyo.map((a) => (
            <div key={a.id} className="flex items-center gap-2 opacity-60">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: a.team_members?.avatar_color }}>
                {a.team_members?.short_name?.[0]}
              </div>
              <div>
                <div className="text-sm font-medium">{a.team_members?.short_name}</div>
                <div className="text-xs text-gray-500">apoyo</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Objective */}
      {task.objective && (
        <div className="bg-white border rounded-xl p-4">
          <h2 className="text-sm font-semibold mb-2">Objetivo</h2>
          <p className="text-sm text-gray-700">{task.objective}</p>
        </div>
      )}

      {/* Tools */}
      {(() => {
        const tools = getTaskTools(task.task_id)
        if (tools.length === 0) return null
        return (
          <div className="bg-white border rounded-xl p-4">
            <h2 className="text-sm font-semibold mb-3">Herramientas</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {tools.map((tool) => (
                <a
                  key={tool.url}
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 transition-colors group"
                >
                  <ExternalLink size={14} className="text-gray-400 group-hover:text-indigo-500 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{tool.name}</div>
                    {tool.cost && <div className="text-xs text-gray-400">{tool.cost}</div>}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )
      })()}

      {/* Blocked by */}
      {task.blocked_by.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-amber-700 mb-2">Bloqueada por</h2>
          <div className="flex flex-col gap-2">
            {task.blocked_by.map((b) => {
              if (isDto(b)) {
                const dto = getDtoInfo(b)
                return (
                  <Link key={b} to="/docs/dtos-dependencias" className="flex items-start gap-3 bg-white rounded-lg px-4 py-3 border border-purple-200 hover:shadow transition-shadow">
                    {dto?.direction === 'IN' ? (
                      <ArrowDownLeft size={18} className="text-purple-500 shrink-0 mt-0.5" />
                    ) : (
                      <ArrowUpRight size={18} className="text-blue-500 shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-purple-600">{b}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                          {dto?.direction === 'IN' ? 'Entrada' : 'Salida'}
                        </span>
                      </div>
                      {dto && (
                        <>
                          <div className="text-sm font-medium text-gray-900 mt-0.5">{dto.title}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {dto.from} → {dto.to} | Deadline: {dto.deadline}
                          </div>
                        </>
                      )}
                    </div>
                    <FileText size={14} className="text-gray-400 shrink-0 mt-1 ml-auto" />
                  </Link>
                )
              }
              const dep = tasks.find((t) => t.task_id === b)
              return (
                <Link key={b} to={`/task/${b}`} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border text-sm hover:shadow">
                  <span className="font-mono font-bold text-gray-400">{b}</span>
                  {dep && (
                    <>
                      <span className="text-gray-600">{dep.title}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${STATUS_CONFIG[dep.status].bg} ${STATUS_CONFIG[dep.status].color}`}>
                        {dep.progress_pct}%
                      </span>
                    </>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Entregables */}
      <ChecklistSection
        title="Entregables"
        items={entregables}
        user={user}
        members={members}
        onToggle={toggleItem}
      />

      {/* Criterios */}
      <ChecklistSection
        title="Criterios de Aceptacion"
        items={criterios}
        user={user}
        members={members}
        onToggle={toggleItem}
      />

      {/* Comments */}
      <div className="bg-white border rounded-xl p-4">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <MessageCircle size={16} /> Comentarios ({comments.length})
        </h2>
        <div className="space-y-3 mb-4">
          {comments.map((c: any) => (
            <div key={c.id} className="flex gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ backgroundColor: c.team_members?.avatar_color }}>
                {c.team_members?.short_name?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium">{c.team_members?.short_name}</span>
                  <span className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: es })}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-0.5">{c.content}</p>
              </div>
            </div>
          ))}
          {comments.length === 0 && <p className="text-sm text-gray-400">Sin comentarios</p>}
        </div>
        <div className="flex gap-2">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleComment()}
            placeholder="Escribe un comentario..."
            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button onClick={handleComment} className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

function ChecklistSection({ title, items, user, members, onToggle }: any) {
  if (items.length === 0) return null
  const checked = items.filter((i: any) => i.is_checked).length
  return (
    <div className="bg-white border rounded-xl p-4">
      <h2 className="text-sm font-semibold mb-3 flex items-center justify-between">
        <span>{title}</span>
        <span className="text-xs text-gray-400 font-normal">{checked}/{items.length}</span>
      </h2>
      <div className="space-y-2">
        {items.map((item: any) => (
          <button
            key={item.id}
            onClick={() => user && onToggle(item.id, !item.is_checked, user.id)}
            className="w-full flex items-start gap-2 text-left p-1.5 rounded hover:bg-gray-50 transition-colors"
          >
            {item.is_checked ? (
              <CheckSquare size={18} className="text-green-500 shrink-0 mt-0.5" />
            ) : (
              <Square size={18} className="text-gray-300 shrink-0 mt-0.5" />
            )}
            <span className={`text-sm ${item.is_checked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
              {item.description}
            </span>
            {item.is_checked && item.checked_by && (
              <span className="text-xs text-gray-400 ml-auto shrink-0">
                {members.find((m: any) => m.id === item.checked_by)?.short_name}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

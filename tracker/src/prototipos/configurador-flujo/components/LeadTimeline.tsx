import { useMemo, useState } from 'react'
import { CheckCircle2, XCircle, Clock, Reply, MousePointer2, Eye, Ban, SkipForward, Mail, Briefcase, Phone, MessageCircle, Smartphone } from 'lucide-react'
import { storage } from '../storage'
import { executeTask, skipTask, computeCallScript } from '../execute'
import type { Channel, SequenceRun, SequenceTask, Signal, TaskStatus } from '../types'

interface Props {
  runId: string | null
  onChanged: () => void
}

const CHANNEL_ICON: Record<Channel, typeof Mail> = {
  email: Mail,
  whatsapp: MessageCircle,
  linkedin: Briefcase,
  voice: Phone,
  sms: Smartphone,
}

const STATUS_COLOR: Record<TaskStatus, string> = {
  pending: 'text-gray-500 bg-gray-50',
  sent: 'text-emerald-700 bg-emerald-50',
  skipped: 'text-amber-700 bg-amber-50',
  cancelled: 'text-gray-500 bg-gray-100 line-through',
  failed: 'text-rose-700 bg-rose-50',
}

export default function LeadTimeline({ runId, onChanged }: Props) {
  const [actionMsg, setActionMsg] = useState<string | null>(null)

  const { run, tasks, prospect } = useMemo(() => {
    if (!runId) return { run: null, tasks: [] as SequenceTask[], prospect: null }
    const r = storage.listRuns().find((x) => x.id === runId) ?? null
    const t = storage.listTasksByRun(runId)
    const p = r
      ? storage.listProspects().find((x) => x.id === r.prospect_id) ?? null
      : null
    return { run: r, tasks: t, prospect: p }
  }, [runId, actionMsg])

  if (!runId || !run) {
    return (
      <div className="text-sm text-gray-500 italic p-6">
        Inscribe un lead desde el simulador para ver su timeline.
      </div>
    )
  }

  function doExecute(task: SequenceTask, signal: Signal) {
    const result = executeTask(task.id, signal)
    setActionMsg(result.message)
    onChanged()
  }

  function doSkip(task: SequenceTask) {
    const reason = prompt('Motivo del skip:', 'datos_faltantes')
    if (!reason) return
    skipTask(task.id, reason)
    setActionMsg(`Task step ${task.step_number} marcada como skipped: ${reason}`)
    onChanged()
  }

  const callScript =
    run.status === 'active' ? computeCallScript(run.id) : null

  return (
    <div className="p-4 space-y-3">
      <header className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">
              {prospect ? `${prospect.first_name} ${prospect.last_name}` : 'Lead'}
            </h3>
            <div className="text-xs text-gray-500">
              Tier {run.tier} · {run.sequence_name} · iniciado{' '}
              {new Date(run.started_at).toLocaleDateString()}
            </div>
          </div>
          <div className="text-right">
            <span
              className={`inline-block px-2 py-1 rounded text-xs font-semibold uppercase ${
                run.status === 'active'
                  ? 'bg-indigo-100 text-indigo-700'
                  : run.status === 'won'
                  ? 'bg-emerald-100 text-emerald-700'
                  : run.status === 'exhausted'
                  ? 'bg-gray-100 text-gray-600'
                  : run.status === 'cancelled'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-rose-100 text-rose-700'
              }`}
            >
              {run.status}
            </span>
            {run.ended_reason && (
              <div className="text-[11px] text-gray-500 mt-1">{run.ended_reason}</div>
            )}
            {callScript && (
              <div className="text-[11px] text-amber-600 mt-1">
                Script llamada: <b>{callScript}</b>
              </div>
            )}
          </div>
        </div>
      </header>

      {actionMsg && (
        <div className="text-xs bg-indigo-50 text-indigo-700 rounded px-2 py-1">
          {actionMsg}
        </div>
      )}

      <div className="space-y-2">
        {tasks.map((task, idx) => (
          <TaskRow
            key={task.id}
            task={task}
            idx={idx}
            total={tasks.length}
            runActive={run.status === 'active'}
            onExecute={doExecute}
            onSkip={doSkip}
          />
        ))}
      </div>
    </div>
  )
}

function TaskRow({
  task,
  idx,
  total,
  runActive,
  onExecute,
  onSkip,
}: {
  task: SequenceTask
  idx: number
  total: number
  runActive: boolean
  onExecute: (t: SequenceTask, s: Signal) => void
  onSkip: (t: SequenceTask) => void
}) {
  const Icon = CHANNEL_ICON[task.channel] ?? Mail
  const canAct = runActive && task.status === 'pending'

  return (
    <div
      className={`flex gap-3 p-2 rounded border ${
        task.status === 'pending' ? 'border-gray-200' : 'border-gray-100'
      }`}
    >
      <div className="flex flex-col items-center">
        <div className="text-[11px] font-mono text-gray-500">S{task.step_number}</div>
        <div className="text-xs font-semibold text-gray-900">D+{
          Math.round(
            (new Date(task.scheduled_date).getTime() -
              new Date(Date.now()).setHours(0, 0, 0, 0)) /
              86400000,
          )
        }</div>
        {idx < total - 1 && <div className="w-px flex-1 bg-gray-200 mt-1"></div>}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Icon size={14} className="text-indigo-600" />
          <span className="font-medium text-sm text-gray-900">{task.action_type}</span>
          <span className="text-xs text-gray-500">· {task.provider}</span>
          <span
            className={`ml-auto inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
              STATUS_COLOR[task.status]
            }`}
          >
            {task.status}
          </span>
        </div>
        <div className="text-[11px] text-gray-500 mt-0.5">
          {new Date(task.scheduled_date).toLocaleDateString()} ·{' '}
          {task.delivery_mode}
          {task.signal_variant && (
            <span className="ml-1 text-amber-600 font-mono">
              · variante {task.signal_variant}
            </span>
          )}
          {task.executed_at && (
            <span className="ml-1">
              · ejecutado {new Date(task.executed_at).toLocaleString()}
            </span>
          )}
        </div>

        {canAct && (
          <div className="mt-2 flex flex-wrap gap-1">
            <ActionBtn
              onClick={() => onExecute(task, 'replied')}
              icon={<Reply size={12} />}
              label="Respondió (A)"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              title="Prospect respondió → Run WON, cancela todo"
            />
            <ActionBtn
              onClick={() => onExecute(task, 'clicked')}
              icon={<MousePointer2 size={12} />}
              label="Clickeó (B)"
              className="bg-sky-600 hover:bg-sky-700 text-white"
              title="Señal B: variante caliente en próximo touch"
            />
            <ActionBtn
              onClick={() => onExecute(task, 'opened')}
              icon={<Eye size={12} />}
              label="Abrió (C)"
              className="bg-amber-500 hover:bg-amber-600 text-white"
              title="Señal C: variante media"
            />
            <ActionBtn
              onClick={() => onExecute(task, 'none')}
              icon={<Clock size={12} />}
              label="Sin contacto (D)"
              className="bg-gray-500 hover:bg-gray-600 text-white"
              title="Señal D: variante fría, seguir en flujo"
            />
            <ActionBtn
              onClick={() => onExecute(task, 'manual_exit')}
              icon={<Ban size={12} />}
              label="Salida manual"
              className="bg-rose-600 hover:bg-rose-700 text-white"
              title="Cierre explícito del flujo"
            />
            <ActionBtn
              onClick={() => onSkip(task)}
              icon={<SkipForward size={12} />}
              label="Skip"
              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              title="Marcar como skipped (p.ej. datos faltantes)"
            />
          </div>
        )}

        {task.response && !canAct && (
          <div className="mt-1 text-[11px] text-gray-600 flex items-center gap-1">
            {task.response === 'replied' ? (
              <>
                <CheckCircle2 size={12} className="text-emerald-600" />
                <span>Respondió</span>
              </>
            ) : task.status === 'cancelled' ? (
              <>
                <XCircle size={12} className="text-gray-400" />
                <span>Cancelada por reply previo</span>
              </>
            ) : (
              <>
                <span className="font-mono">{task.response}</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ActionBtn({
  onClick,
  icon,
  label,
  className,
  title,
}: {
  onClick: () => void
  icon: React.ReactNode
  label: string
  className: string
  title?: string
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium ${className}`}
    >
      {icon}
      {label}
    </button>
  )
}

export function getHighlightedStepsForRun(run: SequenceRun | null): Set<string> {
  if (!run) return new Set()
  const tasks = storage.listTasksByRun(run.id)
  const executed = tasks.filter(
    (t) => t.status === 'sent' || t.status === 'skipped',
  )
  return new Set(
    executed.map((t) => `${run.sequence_name}:${t.step_number}`),
  )
}

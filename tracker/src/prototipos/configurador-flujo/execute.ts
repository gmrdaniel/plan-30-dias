import { storage, uid } from './storage'
import type {
  SequenceRun,
  SequenceTask,
  Signal,
} from './types'

export interface ExecuteResult {
  ok: boolean
  task: SequenceTask
  runStatus: SequenceRun['status']
  message: string
}

function signalToVariant(signal: Signal): 'B' | 'C' | 'D' | null {
  if (signal === 'clicked') return 'B'
  if (signal === 'opened') return 'C'
  if (signal === 'none' || signal === 'manual_no_answer') return 'D'
  return null
}

export function executeTask(taskId: string, signal: Signal): ExecuteResult {
  const task = storage.listTasks().find((t) => t.id === taskId)
  if (!task) {
    throw new Error(`Task ${taskId} no existe`)
  }

  const run = storage.listRuns().find((r) => r.id === task.run_id)
  if (!run) {
    throw new Error(`Run ${task.run_id} no existe`)
  }
  if (run.status !== 'active') {
    return {
      ok: false,
      task,
      runStatus: run.status,
      message: `Run ya está ${run.status}, no se puede ejecutar esta task.`,
    }
  }

  if (task.status !== 'pending') {
    return {
      ok: false,
      task,
      runStatus: run.status,
      message: `Task ya está ${task.status}.`,
    }
  }

  task.status = 'sent'
  task.executed_at = new Date().toISOString()
  task.response = signal
  task.signal_variant = signalToVariant(signal)
  storage.saveTask(task)

  storage.addEvent({
    id: uid(),
    run_id: run.id,
    task_id: task.id,
    event_type: signal === 'replied' ? 'replied' : 'executed',
    channel: task.channel,
    source: 'simulator',
    occurred_at: new Date().toISOString(),
    payload: { step: task.step_number, signal, variant: task.signal_variant },
  })

  if (signal === 'replied') {
    const pending = storage
      .listTasksByRun(run.id)
      .filter((t) => t.status === 'pending')
    for (const t of pending) {
      t.status = 'cancelled'
      storage.saveTask(t)
    }
    run.status = 'won'
    run.ended_reason = `replied_${task.channel}`
    run.ended_at = new Date().toISOString()
    storage.saveRun(run)
    storage.addEvent({
      id: uid(),
      run_id: run.id,
      event_type: 'run_won',
      source: 'simulator',
      occurred_at: new Date().toISOString(),
      payload: { ended_reason: run.ended_reason, cancelled: pending.length },
    })
    return {
      ok: true,
      task,
      runStatus: run.status,
      message: `Prospect respondió en ${task.channel}. Run marcado como WON. ${pending.length} tasks pendientes canceladas.`,
    }
  }

  if (signal === 'manual_exit') {
    const pending = storage
      .listTasksByRun(run.id)
      .filter((t) => t.status === 'pending')
    for (const t of pending) {
      t.status = 'cancelled'
      storage.saveTask(t)
    }
    run.status = 'cancelled'
    run.ended_reason = 'manual_exit'
    run.ended_at = new Date().toISOString()
    storage.saveRun(run)
    return {
      ok: true,
      task,
      runStatus: run.status,
      message: `Salida manual. Run cancelado. ${pending.length} tasks pendientes canceladas.`,
    }
  }

  const remaining = storage
    .listTasksByRun(run.id)
    .filter((t) => t.status === 'pending')
  if (remaining.length === 0) {
    run.status = 'exhausted'
    run.ended_reason = 'all_steps_done_no_reply'
    run.ended_at = new Date().toISOString()
    storage.saveRun(run)
    storage.addEvent({
      id: uid(),
      run_id: run.id,
      event_type: 'run_exhausted',
      source: 'simulator',
      occurred_at: new Date().toISOString(),
    })
    return {
      ok: true,
      task,
      runStatus: run.status,
      message: `Ejecutado. No hay más tasks. Run → EXHAUSTED (a nurturing).`,
    }
  }

  return {
    ok: true,
    task,
    runStatus: run.status,
    message: `Ejecutado con señal ${signal}. Variante: ${task.signal_variant ?? 'N/A'}. Siguientes ${remaining.length} tasks pendientes.`,
  }
}

export function skipTask(taskId: string, reason: string): SequenceTask {
  const task = storage.listTasks().find((t) => t.id === taskId)
  if (!task) throw new Error('Task no existe')
  if (task.status !== 'pending') return task
  task.status = 'skipped'
  task.executed_at = new Date().toISOString()
  task.error = reason
  storage.saveTask(task)
  storage.addEvent({
    id: uid(),
    run_id: task.run_id,
    task_id: task.id,
    event_type: 'skipped',
    source: 'simulator',
    occurred_at: new Date().toISOString(),
    payload: { reason },
  })
  return task
}

export function computeCallScript(runId: string): 'hot' | 'mixed' | 'cold' {
  const tasks = storage.listTasksByRun(runId)
  const bSignals = tasks.filter((t) => t.signal_variant === 'B').length
  if (bSignals >= 2) return 'hot'
  if (bSignals >= 1) return 'mixed'
  return 'cold'
}

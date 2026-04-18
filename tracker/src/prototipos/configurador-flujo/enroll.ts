import { getTemplateByTier, resolveTierByData } from './templates'
import { storage, uid } from './storage'
import type {
  ProspectData,
  SequenceRun,
  SequenceTask,
  Tier,
} from './types'

export interface EnrollmentResult {
  ok: boolean
  run?: SequenceRun
  tasks?: SequenceTask[]
  tier?: Tier
  error?: string
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function enrollProspect(
  prospect: ProspectData,
  startDate: string = new Date().toISOString().slice(0, 10),
): EnrollmentResult {
  const tier = resolveTierByData(prospect)
  if (tier === 'none') {
    return { ok: false, tier, error: 'Sin email válido — no enrolable en B2B.' }
  }

  const template = getTemplateByTier(tier)
  if (!template) {
    return { ok: false, tier, error: `No hay plantilla para tier ${tier}.` }
  }

  const existing = storage
    .listRuns()
    .find(
      (r) =>
        r.prospect_id === prospect.id &&
        r.sequence_name === template.sequence_name &&
        r.status === 'active',
    )
  if (existing) {
    return {
      ok: false,
      tier,
      error: `Ya existe un run activo de ${template.sequence_name} para este prospect.`,
    }
  }

  storage.saveProspect(prospect)

  const run: SequenceRun = {
    id: uid(),
    prospect_id: prospect.id,
    sequence_name: template.sequence_name,
    program: template.program,
    tier,
    status: 'active',
    started_at: new Date().toISOString(),
  }

  const tasks: SequenceTask[] = template.steps.map((step) => ({
    id: uid(),
    run_id: run.id,
    step_number: step.step_number,
    scheduled_date: addDays(startDate, step.offset_days),
    channel: step.channel,
    action_type: step.action_type,
    provider: step.provider,
    template_id: step.template_id,
    delivery_mode: step.delivery_mode,
    status: 'pending',
    response: null,
    signal_variant: null,
  }))

  storage.saveRun(run)
  storage.saveTasks(tasks)
  storage.addEvent({
    id: uid(),
    run_id: run.id,
    event_type: 'enrolled',
    source: 'simulator',
    occurred_at: new Date().toISOString(),
    payload: { tier, sequence_name: template.sequence_name, touches: tasks.length },
  })

  return { ok: true, run, tasks, tier }
}

export function cancelRun(runId: string, reason: string) {
  const run = storage.listRuns().find((r) => r.id === runId)
  if (!run) return
  if (run.status !== 'active') return

  run.status = 'cancelled'
  run.ended_reason = reason
  run.ended_at = new Date().toISOString()
  storage.saveRun(run)

  const tasks = storage
    .listTasksByRun(runId)
    .filter((t) => t.status === 'pending')
  for (const t of tasks) {
    t.status = 'cancelled'
    storage.saveTask(t)
  }

  storage.addEvent({
    id: uid(),
    run_id: runId,
    event_type: 'run_cancelled',
    source: 'simulator',
    occurred_at: new Date().toISOString(),
    payload: { reason },
  })
}

export function resetRun(runId: string) {
  storage.deleteTasksByRun(runId)
  storage.clearEventsByRun(runId)
  storage.deleteRun(runId)
}

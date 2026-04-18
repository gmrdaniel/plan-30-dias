import type {
  ProspectData,
  SequenceEvent,
  SequenceRun,
  SequenceTask,
} from './types'

const KEYS = {
  prospects: 'configurador-flujo:prospects',
  runs: 'configurador-flujo:runs',
  tasks: 'configurador-flujo:tasks',
  events: 'configurador-flujo:events',
  overrides: 'configurador-flujo:template-overrides',
}

function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T[]) : []
  } catch {
    return []
  }
}

function write<T>(key: string, items: T[]) {
  localStorage.setItem(key, JSON.stringify(items))
}

export const storage = {
  listProspects: () => read<ProspectData>(KEYS.prospects),
  saveProspect: (p: ProspectData) => {
    const all = read<ProspectData>(KEYS.prospects).filter((x) => x.id !== p.id)
    all.push(p)
    write(KEYS.prospects, all)
  },
  deleteProspect: (id: string) => {
    write(
      KEYS.prospects,
      read<ProspectData>(KEYS.prospects).filter((x) => x.id !== id),
    )
  },

  listRuns: () => read<SequenceRun>(KEYS.runs),
  saveRun: (r: SequenceRun) => {
    const all = read<SequenceRun>(KEYS.runs).filter((x) => x.id !== r.id)
    all.push(r)
    write(KEYS.runs, all)
  },
  deleteRun: (id: string) => {
    write(KEYS.runs, read<SequenceRun>(KEYS.runs).filter((x) => x.id !== id))
  },

  listTasks: () => read<SequenceTask>(KEYS.tasks),
  listTasksByRun: (runId: string) =>
    read<SequenceTask>(KEYS.tasks)
      .filter((t) => t.run_id === runId)
      .sort((a, b) => a.step_number - b.step_number),
  saveTask: (t: SequenceTask) => {
    const all = read<SequenceTask>(KEYS.tasks).filter((x) => x.id !== t.id)
    all.push(t)
    write(KEYS.tasks, all)
  },
  saveTasks: (tasks: SequenceTask[]) => {
    const ids = new Set(tasks.map((t) => t.id))
    const rest = read<SequenceTask>(KEYS.tasks).filter((t) => !ids.has(t.id))
    write(KEYS.tasks, [...rest, ...tasks])
  },
  deleteTasksByRun: (runId: string) => {
    write(
      KEYS.tasks,
      read<SequenceTask>(KEYS.tasks).filter((t) => t.run_id !== runId),
    )
  },

  listEvents: () => read<SequenceEvent>(KEYS.events),
  listEventsByRun: (runId: string) =>
    read<SequenceEvent>(KEYS.events)
      .filter((e) => e.run_id === runId)
      .sort(
        (a, b) =>
          new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime(),
      ),
  addEvent: (e: SequenceEvent) => {
    const all = read<SequenceEvent>(KEYS.events)
    all.push(e)
    write(KEYS.events, all)
  },
  clearEventsByRun: (runId: string) => {
    write(
      KEYS.events,
      read<SequenceEvent>(KEYS.events).filter((e) => e.run_id !== runId),
    )
  },

  getOverrides: (): Record<string, string> => {
    try {
      const raw = localStorage.getItem(KEYS.overrides)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  },
  setOverride: (key: string, value: string) => {
    const current = storage.getOverrides()
    current[key] = value
    localStorage.setItem(KEYS.overrides, JSON.stringify(current))
  },

  resetAll: () => {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k))
  },
}

export function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

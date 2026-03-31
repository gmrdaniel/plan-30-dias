export interface TeamMember {
  id: string
  name: string
  short_name: string
  role: string
  avatar_color: string
  is_leader: boolean
}

export type TaskPriority = 'CRITICA' | 'ALTA' | 'MEDIA'
export type TaskStatus = 'pendiente' | 'en_progreso' | 'bloqueada' | 'completada'
export type TaskPhase = 'pre_sprint' | 'semana_1' | 'semana_2' | 'semana_3_4' | 'cierre'
export type AssignmentRole = 'responsable' | 'apoyo' | 'co-ejecuta'
export type ChecklistCategory = 'entregable' | 'criterio'

export interface Task {
  id: string
  task_id: string
  title: string
  objective: string | null
  priority: TaskPriority
  status: TaskStatus
  phase: TaskPhase
  start_date: string
  due_date: string
  blocked_by: string[]
  blocks: string[]
  detail_md: string | null
  progress_pct: number
}

export interface TaskAssignment {
  id: string
  task_id: string
  member_id: string
  assignment_role: AssignmentRole
  team_members?: TeamMember
}

export interface ChecklistItem {
  id: string
  task_id: string
  category: ChecklistCategory
  description: string
  is_checked: boolean
  checked_by: string | null
  checked_at: string | null
  sort_order: number
}

export interface TaskComment {
  id: string
  task_id: string
  author_id: string
  content: string
  created_at: string
  team_members?: TeamMember
}

export interface Milestone {
  id: string
  milestone_id: string
  title: string
  target_date: string
  success_criteria: string
  is_completed: boolean
}

export interface TaskWithAssignments extends Task {
  assignments: (TaskAssignment & { member: TeamMember })[]
}

export const PHASE_LABELS: Record<TaskPhase, string> = {
  pre_sprint: 'Pre-Sprint (6-7 Abr)',
  semana_1: 'Semana 1 (8-14 Abr)',
  semana_2: 'Semana 2 (15-21 Abr)',
  semana_3_4: 'Semana 3-4 (22 Abr - 8 May)',
  cierre: 'Cierre (8 May)',
}

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; bg: string }> = {
  CRITICA: { label: 'Critica', color: 'text-red-700', bg: 'bg-red-100' },
  ALTA: { label: 'Alta', color: 'text-orange-700', bg: 'bg-orange-100' },
  MEDIA: { label: 'Media', color: 'text-blue-700', bg: 'bg-blue-100' },
}

export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  pendiente: { label: 'Pendiente', color: 'text-gray-700', bg: 'bg-gray-100' },
  en_progreso: { label: 'En Progreso', color: 'text-blue-700', bg: 'bg-blue-100' },
  bloqueada: { label: 'Bloqueada', color: 'text-red-700', bg: 'bg-red-100' },
  completada: { label: 'Completada', color: 'text-green-700', bg: 'bg-green-100' },
}

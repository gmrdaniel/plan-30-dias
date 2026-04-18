export type Program = 'b2b' | 'creator'
export type Channel = 'email' | 'whatsapp' | 'linkedin' | 'sms' | 'voice'
export type DeliveryMode = 'task_driven' | 'external_sequence' | 'manual'
export type Provider =
  | 'smartlead'
  | 'brevo'
  | 'sendspark'
  | 'waalaxy'
  | 'respondio'
  | 'manual'
  | 'pendiente'

export type Tier = 'A' | 'B' | 'C' | 'none'
export type Signal = 'replied' | 'clicked' | 'opened' | 'none' | 'manual_no_answer' | 'manual_exit'

export type RunStatus = 'active' | 'won' | 'exhausted' | 'cancelled' | 'failed'
export type TaskStatus = 'pending' | 'sent' | 'skipped' | 'cancelled' | 'failed'

export interface TemplateStep {
  sequence_name: string
  step_number: number
  offset_days: number
  channel: Channel
  action_type: string
  provider: Provider
  template_id: string | null
  required_assets: string[]
  required_fields: string[]
  delivery_mode: DeliveryMode
  signal_depends_on?: number | 'accumulated' | null
  notes?: string
}

export interface SequenceTemplate {
  sequence_name: string
  program: Program
  tier: Tier
  label: string
  description: string
  duration_days: number
  touches: number
  required_fields: string[]
  steps: TemplateStep[]
}

export interface ProspectData {
  id: string
  first_name: string
  last_name: string
  email?: string
  linkedin_url?: string
  phone?: string
  country?: string
}

export interface SequenceRun {
  id: string
  prospect_id: string
  sequence_name: string
  program: Program
  tier: Tier
  status: RunStatus
  ended_reason?: string
  started_at: string
  ended_at?: string
}

export interface SequenceTask {
  id: string
  run_id: string
  step_number: number
  scheduled_date: string
  channel: Channel
  action_type: string
  provider: Provider
  template_id: string | null
  delivery_mode: DeliveryMode
  status: TaskStatus
  executed_at?: string
  response?: Signal | null
  error?: string
  signal_variant?: 'B' | 'C' | 'D' | null
}

export interface SequenceEvent {
  id: string
  run_id: string
  task_id?: string
  event_type: string
  channel?: Channel
  source?: string
  payload?: Record<string, unknown>
  occurred_at: string
}

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info'
  sequence_name: string
  step_number?: number
  message: string
}

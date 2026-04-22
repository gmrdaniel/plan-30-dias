export type TemplateStatus = 'draft' | 'approved' | 'in_production' | 'archived'

export interface Template {
  id: string
  name: string
  display_name: string
  description: string | null
  step_number: number | null
  branch_link_url: string | null
  qr_image_url: string | null
  cta_label: string
  smartlead_campaign_id: number
  created_at: string
  created_by: string | null
  archived: boolean
}

export interface TemplateVersion {
  id: string
  template_id: string
  version: number
  subject: string
  body_plain: string
  body_html: string | null
  body_html_hash: string | null
  commit_message: string | null
  status: TemplateStatus
  validation_warnings: Warning[] | null
  created_at: string
  created_by: string | null
}

export type VarKind = 'native' | 'custom_field' | 'unsupported'

export interface VariableRegistryEntry {
  id: string
  platform: string
  name: string
  kind: VarKind
  description: string | null
  example_value: string | null
  supports_pipe_fallback: boolean
  warning_message: string | null
}

export interface PreviewPersona {
  id: string
  name: string
  variables: Record<string, string>
  is_default: boolean
}

export type PlantillaRole = 'editor' | 'operator' | 'viewer'

export interface PlantillaUserRole {
  user_id: string
  role: PlantillaRole
}

export type Severity = 'error' | 'warning' | 'info'

export interface Warning {
  code: string
  severity: Severity
  message: string
  location: 'subject' | 'body' | 'global'
  lineNumber?: number
  columnStart?: number
  columnEnd?: number
  suggestedFix?: string
}

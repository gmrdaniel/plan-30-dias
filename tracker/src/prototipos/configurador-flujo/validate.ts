import { ALL_TEMPLATES } from './templates'
import type { ValidationIssue } from './types'

export function validateTemplates(): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  for (const tpl of ALL_TEMPLATES) {
    if (tpl.steps.length === 0) {
      issues.push({
        severity: 'error',
        sequence_name: tpl.sequence_name,
        message: 'Plantilla sin steps.',
      })
      continue
    }

    if (tpl.steps.length !== tpl.touches) {
      issues.push({
        severity: 'warning',
        sequence_name: tpl.sequence_name,
        message: `Declara ${tpl.touches} touches pero tiene ${tpl.steps.length} steps.`,
      })
    }

    const seen = new Set<number>()
    for (const step of tpl.steps) {
      if (seen.has(step.step_number)) {
        issues.push({
          severity: 'error',
          sequence_name: tpl.sequence_name,
          step_number: step.step_number,
          message: `step_number duplicado.`,
        })
      }
      seen.add(step.step_number)

      if (
        step.signal_depends_on !== undefined &&
        step.signal_depends_on !== null &&
        step.signal_depends_on !== 'accumulated'
      ) {
        const dep = step.signal_depends_on
        if (!tpl.steps.find((s) => s.step_number === dep)) {
          issues.push({
            severity: 'error',
            sequence_name: tpl.sequence_name,
            step_number: step.step_number,
            message: `signal_depends_on=${dep} pero ese step no existe.`,
          })
        } else if (dep >= step.step_number) {
          issues.push({
            severity: 'error',
            sequence_name: tpl.sequence_name,
            step_number: step.step_number,
            message: `signal_depends_on=${dep} apunta a un step posterior o al mismo.`,
          })
        }
      }

      if (step.delivery_mode === 'task_driven' && step.provider === 'pendiente') {
        issues.push({
          severity: 'warning',
          sequence_name: tpl.sequence_name,
          step_number: step.step_number,
          message: `Provider pendiente. No podrá ejecutar en producción.`,
        })
      }

      if (step.template_id === null && step.delivery_mode !== 'manual') {
        if (step.provider !== 'pendiente') {
          issues.push({
            severity: 'warning',
            sequence_name: tpl.sequence_name,
            step_number: step.step_number,
            message: `Sin template_id.`,
          })
        }
      }

      for (const field of step.required_fields) {
        if (!tpl.required_fields.includes(field)) {
          issues.push({
            severity: 'warning',
            sequence_name: tpl.sequence_name,
            step_number: step.step_number,
            message: `Step requiere "${field}" pero plantilla no lo declara como required.`,
          })
        }
      }
    }

    const offsets = tpl.steps.map((s) => s.offset_days)
    for (let i = 1; i < offsets.length; i++) {
      if (offsets[i] < offsets[i - 1]) {
        issues.push({
          severity: 'warning',
          sequence_name: tpl.sequence_name,
          step_number: tpl.steps[i].step_number,
          message: `offset_days (${offsets[i]}) menor que step anterior (${offsets[i - 1]}).`,
        })
      }
    }

    const maxOffset = Math.max(...offsets)
    if (maxOffset > tpl.duration_days) {
      issues.push({
        severity: 'error',
        sequence_name: tpl.sequence_name,
        message: `offset_days máximo (${maxOffset}) excede duration_days (${tpl.duration_days}).`,
      })
    }
  }

  return issues
}

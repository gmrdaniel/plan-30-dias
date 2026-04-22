import type { Template, TemplateVersion, VariableRegistryEntry } from '../types'
import { extractVarNames } from './substituteVars'

// Genera un .txt con header metadata + body plain. Lo consume el script
// Python _upload_template_from_export.py (pendiente de implementar) para subir
// a Smartlead — el parser de ese script lee las líneas que empiezan con "# ".

export function buildExportText(
  template: Template,
  version: TemplateVersion,
  registry: VariableRegistryEntry[],
  exportedBy: string = 'unknown',
): string {
  const varsUsed = [
    ...extractVarNames(version.subject),
    ...extractVarNames(version.body_plain),
  ]
  const uniqueVars = [...new Set(varsUsed)]
  const registryByName = new Map(
    registry.filter((r) => r.platform === 'smartlead').map((r) => [r.name, r]),
  )

  const varLines = uniqueVars.map((v) => {
    if (v === 'link' || v === 'qr') return `#   - {{${v}}} (placeholder — resuelto al upload)`
    const entry = registryByName.get(v)
    if (!entry) return `#   - {{${v}}} (UNKNOWN — verificar CSV)`
    if (entry.kind === 'unsupported') return `#   - {{${v}}} (UNSUPPORTED — ${entry.warning_message ?? 'no usar'})`
    return `#   - {{${v}}} (${entry.kind})`
  })

  const header = [
    '---',
    `# Template: ${template.name}`,
    `# Version: ${version.version}`,
    `# Status: ${version.status}`,
    `# Subject: ${version.subject}`,
    `# Branch link: ${template.branch_link_url ?? '(none)'}`,
    `# QR image: ${template.qr_image_url ?? '(none)'}`,
    `# Smartlead campaign: ${template.smartlead_campaign_id}`,
    `# Platform: smartlead`,
    `# Exported: ${new Date().toISOString()}`,
    `# Exported by: ${exportedBy}`,
    '#',
    '# VARIABLES USED:',
    ...(varLines.length > 0 ? varLines : ['#   (none)']),
    '---',
    '',
  ].join('\n')

  return header + version.body_plain
}

export function downloadTxt(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

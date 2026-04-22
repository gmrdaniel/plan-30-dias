// Converter plain-text → HTML minimal para Smartlead.
// Port del algoritmo Python en _daily_snapshot.py — referencia: §4 de
// REQUIREMENTS-editor-app.md. Cualquier cambio aquí debe replicarse en el
// script Python para mantener paridad entre web y pipeline.

const WRAPPER_STYLE =
  'max-width:600px;margin:0;padding:0 16px;font-family:Arial,Helvetica,sans-serif;' +
  'font-size:15px;color:#222;line-height:1.5;'
const P_STYLE = 'margin:0 0 14px 0;'
const UL_STYLE = `${P_STYLE}margin:0 0 14px 20px;padding:0;`
const LI_STYLE = 'margin:0 0 4px 0;'

export function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function plainToHtml(plain: string): string {
  const paragraphs = plain.trim().split(/\n\s*\n/)
  const parts: string[] = []

  for (const p of paragraphs) {
    const lines = p.split('\n').map((l) => l.trim()).filter(Boolean)
    if (lines.length === 0) continue

    if (lines.every((l) => l.startsWith('- '))) {
      const items = lines
        .map((l) => `<li style="${LI_STYLE}">${escapeHtml(l.slice(2))}</li>`)
        .join('')
      parts.push(`<ul style="${UL_STYLE}">${items}</ul>`)
      continue
    }

    const inner = lines.map(escapeHtml).join('<br>')
    parts.push(`<p style="${P_STYLE}">${inner}</p>`)
  }

  const innerHtml = parts.join('\n')

  return (
    '<!DOCTYPE html><html><head><meta charset="UTF-8"></head>' +
    '<body style="margin:0;padding:0;background:#ffffff;">' +
    `<div style="${WRAPPER_STYLE}">\n${innerHtml}\n</div>` +
    '</body></html>'
  )
}

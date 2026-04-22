import type { Template } from '../types'

// Reemplaza los placeholders especiales {{link}} y {{qr}} en el HTML generado
// con el CTA button + imagen QR configurados al nivel del template. Ana los
// escribe como variables normales; el converter los transforma en preview.
// Ver §4.5 de REQUIREMENTS-editor-app.md.

export function renderPlaceholders(html: string, template: Template): string {
  const linkHtml = template.branch_link_url
    ? `<div style="text-align:center;margin:6px 0 10px 0;">
         <a href="${escapeAttr(template.branch_link_url)}" target="_blank" rel="noopener noreferrer"
            style="display:inline-block;padding:12px 28px;background:#4F46E5;
                   color:#ffffff;text-decoration:none;border-radius:6px;
                   font-family:Arial;font-size:14px;font-weight:700;">
           ${escapeHtmlInline(template.cta_label)} &rarr;
         </a>
       </div>`
    : '<div style="padding:8px;background:#fef3c7;border:1px dashed #f59e0b;color:#92400e;font-size:12px;">⚠️ Link no configurado (configurar en template settings)</div>'

  const qrHtml = template.qr_image_url
    ? `<div style="text-align:center;margin:10px 0 14px 0;">
         <a href="${escapeAttr(template.branch_link_url ?? '#')}" target="_blank">
           <img src="${escapeAttr(template.qr_image_url)}" alt="Scan to apply" width="140"
                style="display:block;border:0;width:140px;height:auto;margin:0 auto;">
         </a>
         <p style="margin:6px 0 0 0;font-size:12px;color:#64748b;">Scan from your phone</p>
       </div>`
    : '<div style="padding:8px;background:#fef3c7;border:1px dashed #f59e0b;color:#92400e;font-size:12px;">⚠️ QR no configurado</div>'

  return html
    .replace(/\{\{\s*link\s*\}\}/g, linkHtml)
    .replace(/\{\{\s*qr\s*\}\}/g, qrHtml)
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

function escapeHtmlInline(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

import type { VariableRegistryEntry, Warning } from '../types'
import { plainToHtml } from './plainToHtml'

// Validador de plantilla Smartlead. Reglas documentadas en §5 de
// REQUIREMENTS-editor-app.md. Retorna array de Warning ordenado por severity
// (error → warning → info) y por location (subject primero).

const SPAMMY_WORDS = ['FREE', 'ACT NOW', 'URGENT', 'WINNER', 'CONGRATS']
const SPAMMY_SYMBOLS = ['!!!', '$$$', '???']
const EMOJI_RE = /\p{Extended_Pictographic}/gu

const SPECIAL_PLACEHOLDERS = new Set(['link', 'qr'])

export interface ValidateInput {
  subject: string
  bodyPlain: string
  registry: VariableRegistryEntry[]
  branchLinkConfigured: boolean
  qrConfigured: boolean
  platform?: string
}

export function validate(input: ValidateInput): Warning[] {
  const { subject, bodyPlain, registry, branchLinkConfigured, qrConfigured } = input
  const platform = input.platform ?? 'smartlead'
  const warnings: Warning[] = []
  const registryByName = new Map(registry.filter((r) => r.platform === platform).map((r) => [r.name, r]))

  // ── V5 — subject/body presencia (correr primero; bloquea todo) ──
  if (!subject.trim()) {
    warnings.push({
      code: 'SUBJECT_EMPTY',
      severity: 'error',
      message: 'Subject vacío. Smartlead rechaza envíos sin asunto.',
      location: 'subject',
    })
  }
  if (!bodyPlain.trim()) {
    warnings.push({
      code: 'BODY_EMPTY',
      severity: 'error',
      message: 'Body vacío. No se puede enviar una plantilla sin cuerpo.',
      location: 'body',
    })
  }

  // ── V1 — Variables en subject + body ──
  warnings.push(...validateVariables(subject, 'subject', registryByName, { branchLinkConfigured, qrConfigured }))
  warnings.push(...validateVariables(bodyPlain, 'body', registryByName, { branchLinkConfigured, qrConfigured }))

  // ── V2 — Subject ──
  if (subject) {
    if (subject.length > 60) {
      warnings.push({
        code: 'SUBJECT_TOO_LONG',
        severity: 'warning',
        message: `Subject de ${subject.length} caracteres. Gmail corta a ~60 en móvil.`,
        location: 'subject',
      })
    }
    if (isAllCaps(subject)) {
      warnings.push({
        code: 'SUBJECT_ALL_CAPS',
        severity: 'warning',
        message: 'Subject en mayúsculas dispara filtros de spam en Gmail/Outlook.',
        location: 'subject',
      })
    }
    const spammy = findSpammyTokens(subject)
    if (spammy.length > 0) {
      warnings.push({
        code: 'SUBJECT_SPAMMY',
        severity: 'warning',
        message: `Subject contiene términos con alto spam score: ${spammy.join(', ')}.`,
        location: 'subject',
      })
    }
    const emojiCount = countEmojis(subject)
    if (emojiCount > 1) {
      warnings.push({
        code: 'SUBJECT_EMOJI_OVER',
        severity: 'warning',
        message: `Subject tiene ${emojiCount} emojis. Gmail Promotions suele filtrar ≥2.`,
        location: 'subject',
      })
    }
    if (/\{\{/.test(subject)) {
      warnings.push({
        code: 'SUBJECT_HAS_VAR',
        severity: 'info',
        message: 'Personalización en subject detectada. Verifica que la variable siempre resuelva.',
        location: 'subject',
      })
    }
  }

  // ── V3 — Body anti-patterns ──
  if (bodyPlain) {
    const metaPartnerCount = (bodyPlain.match(/Meta Official Partner/gi) ?? []).length
    if (metaPartnerCount >= 2) {
      warnings.push({
        code: 'PHRASE_OVERUSE',
        severity: 'warning',
        message: `"Meta Official Partner" aparece ${metaPartnerCount} veces. Phrase overuse baja deliverability.`,
        location: 'body',
      })
    }
    const payoutCount = (bodyPlain.match(/\$\s*\d+K?\s*[-–—]\s*\$?\s*\d+K?/gi) ?? []).length
    if (payoutCount >= 5) {
      warnings.push({
        code: 'KEYWORD_STUFFING',
        severity: 'warning',
        message: `Rangos de pago ("$3K-$9K" o similar) aparecen ${payoutCount} veces. Posible keyword stuffing.`,
        location: 'body',
      })
    }
    if (/display\s*:\s*none/i.test(bodyPlain)) {
      warnings.push({
        code: 'HIDDEN_TEXT',
        severity: 'error',
        message: '"display:none" es trigger fuerte de spam. No incluyas texto oculto.',
        location: 'body',
      })
    }
  }

  // ── V4 — Body estructura ──
  if (bodyPlain) {
    if (/\n\s*\n\s*\n/.test(bodyPlain)) {
      warnings.push({
        code: 'EXCESS_BLANK_LINES',
        severity: 'warning',
        message: '3+ líneas en blanco consecutivas. El converter las colapsa, pero revisa intención.',
        location: 'body',
      })
    }
    const wordCount = bodyPlain.trim().split(/\s+/).filter(Boolean).length
    if (wordCount > 3000) {
      warnings.push({
        code: 'BODY_TOO_LONG',
        severity: 'warning',
        message: `Body tiene ${wordCount} palabras. Emails largos >2000 palabras suelen bajar replies.`,
        location: 'body',
      })
    }
    const rawUrlCount = (bodyPlain.match(/https?:\/\/[^\s{}<>"']+/g) ?? []).length
    if (rawUrlCount >= 3) {
      warnings.push({
        code: 'RAW_URLS',
        severity: 'info',
        message: `${rawUrlCount} URLs crudas en el body. Considera usar {{link}} para el CTA principal.`,
        location: 'body',
      })
    }
  }

  // ── V5.3 — HTML total size ──
  if (bodyPlain) {
    const htmlSize = new Blob([plainToHtml(bodyPlain)]).size
    if (htmlSize > 20 * 1024) {
      warnings.push({
        code: 'HTML_TOO_LARGE',
        severity: 'warning',
        message: `HTML generado pesa ${(htmlSize / 1024).toFixed(1)} KB. Gmail trunca a 102 KB pero ≥20 KB ya impacta render en móvil.`,
        location: 'global',
      })
    }
  }

  return sortWarnings(warnings)
}

function validateVariables(
  text: string,
  location: 'subject' | 'body',
  registry: Map<string, VariableRegistryEntry>,
  { branchLinkConfigured, qrConfigured }: { branchLinkConfigured: boolean; qrConfigured: boolean },
): Warning[] {
  const out: Warning[] = []
  const re = /\{\{\s*([^}]+?)\s*\}\}/g
  for (const m of text.matchAll(re)) {
    const raw = m[1].trim()

    // V1.1 — pipe fallback (ERROR)
    if (raw.includes('|')) {
      const before = raw.split('|')[0].trim()
      out.push({
        code: 'PIPE_FALLBACK',
        severity: 'error',
        message: `"${m[0]}" usa pipe fallback, no soportado por Smartlead — resolverá VACÍO en producción.`,
        location,
        suggestedFix: `Cambiar a {{${before}}} y garantizar que todos los leads tengan ${before} poblado.`,
      })
      continue
    }

    // Placeholders especiales link/qr — validan contra config del template, no registry
    if (SPECIAL_PLACEHOLDERS.has(raw)) {
      if (raw === 'link' && !branchLinkConfigured) {
        out.push({
          code: 'LINK_NOT_CONFIGURED',
          severity: 'error',
          message: '{{link}} usado pero el template no tiene branch_link_url configurado.',
          location,
          suggestedFix: 'Configurar branch_link_url en los settings del template.',
        })
      }
      if (raw === 'qr' && !qrConfigured) {
        out.push({
          code: 'QR_NOT_CONFIGURED',
          severity: 'warning',
          message: '{{qr}} usado pero el template no tiene qr_image_url configurado.',
          location,
          suggestedFix: 'Subir un QR al bucket Supabase y setear qr_image_url.',
        })
      }
      continue
    }

    const entry = registry.get(raw)
    if (!entry) {
      out.push({
        code: 'VAR_UNKNOWN',
        severity: 'warning',
        message: `{{${raw}}} no está en el registry. Verifica que exista como columna en el CSV de leads.`,
        location,
      })
      continue
    }

    if (entry.kind === 'unsupported') {
      out.push({
        code: 'VAR_UNSUPPORTED',
        severity: 'error',
        message: entry.warning_message ?? `{{${raw}}} no está soportado por Smartlead.`,
        location,
      })
    }
  }
  return out
}

function isAllCaps(s: string): boolean {
  const letters = s.match(/\p{L}/gu) ?? []
  if (letters.length < 4) return false
  return letters.every((c) => c === c.toUpperCase()) && /[A-Z]/.test(s)
}

function findSpammyTokens(s: string): string[] {
  const found: string[] = []
  for (const w of SPAMMY_WORDS) {
    if (new RegExp(`\\b${w}\\b`, 'i').test(s)) found.push(w)
  }
  for (const sym of SPAMMY_SYMBOLS) {
    if (s.includes(sym)) found.push(sym)
  }
  return found
}

function countEmojis(s: string): number {
  return (s.match(EMOJI_RE) ?? []).length
}

function sortWarnings(ws: Warning[]): Warning[] {
  const severityRank: Record<string, number> = { error: 0, warning: 1, info: 2 }
  const locationRank: Record<string, number> = { subject: 0, body: 1, global: 2 }
  return [...ws].sort((a, b) => {
    const s = severityRank[a.severity] - severityRank[b.severity]
    if (s !== 0) return s
    return locationRank[a.location] - locationRank[b.location]
  })
}

export function hasErrors(warnings: Warning[]): boolean {
  return warnings.some((w) => w.severity === 'error')
}

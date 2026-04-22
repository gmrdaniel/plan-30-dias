import { useLayoutEffect, useRef, type ChangeEvent } from 'react'
import { escapeHtml } from '../lib/plainToHtml'

// Técnica de overlay: un <pre> detrás con syntax-highlight de {{variables}} y
// un <textarea> transparente encima. Ambos comparten font-metrics exactas para
// que el highlight quede alineado con el texto del input. El textarea scrollea
// y el overlay lo sigue.

interface Props {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  minHeight?: number
  rows?: number
  className?: string
  ariaLabel?: string
}

const SHARED_STYLE =
  'font:14px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace;' +
  'padding:12px;margin:0;border:0;white-space:pre-wrap;word-break:break-word;'

export default function HighlightedTextarea({
  value,
  onChange,
  placeholder,
  minHeight = 280,
  rows,
  className = '',
  ariaLabel,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const overlayRef = useRef<HTMLPreElement>(null)

  // Sincroniza scroll del overlay con el textarea para que el highlight no se
  // desalinee cuando el texto excede la altura visible.
  useLayoutEffect(() => {
    const ta = textareaRef.current
    const ov = overlayRef.current
    if (!ta || !ov) return
    const sync = () => {
      ov.scrollTop = ta.scrollTop
      ov.scrollLeft = ta.scrollLeft
    }
    ta.addEventListener('scroll', sync)
    sync()
    return () => ta.removeEventListener('scroll', sync)
  }, [])

  const highlighted = highlightVariables(value)

  const shared = `${SHARED_STYLE}min-height:${minHeight}px;`

  return (
    <div
      className={`relative rounded border border-slate-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 ${className}`}
      style={{ minHeight }}
    >
      <pre
        ref={overlayRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none overflow-auto text-slate-800"
        style={{ ...parseStyle(shared) }}
        // Añadimos un espacio final para que una línea vacía al final mida
        // altura (evita salto visual al tipear un \n).
        dangerouslySetInnerHTML={{ __html: highlighted + '\n' }}
      />
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        aria-label={ariaLabel}
        spellCheck={false}
        className="relative block w-full bg-transparent resize-y outline-none"
        style={{ ...parseStyle(shared), color: 'transparent', caretColor: '#0f172a' }}
      />
    </div>
  )
}

// Resalta {{variable}} en azul y {{var|fallback}} en rojo como señal de pipe
// no soportado. Escapa todo el resto del HTML para seguridad.
function highlightVariables(text: string): string {
  if (!text) return ''
  const re = /(\{\{\s*[^}]+?\s*\}\})/g
  const out: string[] = []
  let last = 0
  for (const m of text.matchAll(re)) {
    const idx = m.index ?? 0
    if (idx > last) out.push(escapeHtml(text.slice(last, idx)))
    const raw = m[0]
    const inner = raw.replace(/^\{\{\s*|\s*\}\}$/g, '')
    const isPipe = inner.includes('|')
    const isSpecial = /^(link|qr)$/.test(inner.trim())
    const color = isPipe
      ? '#dc2626' // red-600 — error
      : isSpecial
      ? '#7c3aed' // violet-600 — placeholder especial (link/qr)
      : '#2563eb' // blue-600 — variable normal
    const bg = isPipe ? '#fee2e2' : isSpecial ? '#ede9fe' : '#dbeafe'
    out.push(
      `<span style="color:${color};background:${bg};border-radius:3px;padding:0 2px;">${escapeHtml(
        raw,
      )}</span>`,
    )
    last = idx + raw.length
  }
  if (last < text.length) out.push(escapeHtml(text.slice(last)))
  return out.join('')
}

// Convierte "a:b;c:d;" en un objeto para React style.
function parseStyle(css: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const rule of css.split(';')) {
    const [k, v] = rule.split(':').map((s) => s?.trim())
    if (!k || !v) continue
    const camel = k.replace(/-([a-z])/g, (_m, c: string) => c.toUpperCase())
    out[camel] = v
  }
  return out
}

import { useMemo } from 'react'
import type { Template, PreviewPersona } from '../types'
import { plainToHtml } from '../lib/plainToHtml'
import { renderPlaceholders } from '../lib/renderPlaceholders'
import { substituteVars } from '../lib/substituteVars'

interface Props {
  subject: string
  bodyPlain: string
  template: Template
  persona: PreviewPersona | null
}

export default function PreviewPanel({ subject, bodyPlain, template, persona }: Props) {
  const html = useMemo(() => {
    const vars = persona?.variables ?? {}
    const substitutedBody = substituteVars(bodyPlain, vars)
    const rawHtml = plainToHtml(substitutedBody)
    return renderPlaceholders(rawHtml, template)
  }, [bodyPlain, template, persona])

  const displaySubject = useMemo(
    () => substituteVars(subject, persona?.variables ?? {}),
    [subject, persona],
  )

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="border-b bg-white px-4 py-3 text-sm">
        <div className="text-slate-500 text-xs">From: Dan &lt;dan@laneta.com&gt;</div>
        <div className="font-medium mt-0.5 text-slate-900">
          {displaySubject || <span className="text-slate-400 italic">(subject vacío)</span>}
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <iframe
          title="preview"
          className="w-full h-full bg-white"
          sandbox="allow-same-origin"
          srcDoc={html}
        />
      </div>
    </div>
  )
}

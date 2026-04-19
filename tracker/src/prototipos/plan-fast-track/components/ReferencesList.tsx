import { INTERNAL_FILES, RELATED_DOCS, EXTERNAL_REFS } from '../data/plan'
import Collapse from './Collapse'

export default function ReferencesList() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Collapse label={`Archivos internos de la sesión (${INTERNAL_FILES.length})`} defaultOpen>
          <ul className="space-y-2">
            {INTERNAL_FILES.map((f) => (
              <li key={f.file} className="text-sm">
                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-slate-700">{f.file}</code>
                <p className="text-slate-600 text-xs mt-0.5 ml-1">{f.content}</p>
              </li>
            ))}
          </ul>
        </Collapse>

        <Collapse label={`Documentos relacionados (${RELATED_DOCS.length})`} defaultOpen>
          <ul className="space-y-2">
            {RELATED_DOCS.map((d) => (
              <li key={d.path} className="text-sm">
                <p className="font-semibold text-slate-900">{d.title}</p>
                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-slate-600">{d.path}</code>
              </li>
            ))}
          </ul>
        </Collapse>
      </div>

      <Collapse label={`Best practices externas (${EXTERNAL_REFS.length})`} defaultOpen>
        <ul className="space-y-3">
          {EXTERNAL_REFS.map((r, i) => (
            <li key={i} className="border-l-2 border-[#0F52BA] pl-3">
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0F52BA] hover:underline font-semibold text-sm"
              >
                {r.title} ↗
              </a>
              <p className="text-xs text-slate-600 mt-0.5 italic">{r.note}</p>
            </li>
          ))}
        </ul>
      </Collapse>
    </div>
  )
}

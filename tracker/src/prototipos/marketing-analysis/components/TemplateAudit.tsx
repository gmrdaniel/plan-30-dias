import { TEMPLATE_AUDIT, TEMPLATE_ISSUES } from '../data/analysis'

const SEVERITY_STYLES = {
  critical: 'bg-rose-100 text-rose-800 border-rose-300',
  medium: 'bg-amber-100 text-amber-800 border-amber-300',
  low: 'bg-slate-100 text-slate-700 border-slate-300',
}

export default function TemplateAudit() {
  const m = TEMPLATE_AUDIT.metrics
  const criticalIssues = TEMPLATE_ISSUES.filter((i) => i.severity === 'critical').length
  const mediumIssues = TEMPLATE_ISSUES.filter((i) => i.severity === 'medium').length
  const lowIssues = TEMPLATE_ISSUES.filter((i) => i.severity === 'low').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-white p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-indigo-600 font-semibold">Template ID {TEMPLATE_AUDIT.templateId}</p>
            <h2 className="text-xl font-bold text-slate-900 mt-1">{TEMPLATE_AUDIT.templateName}</h2>
            <p className="text-sm text-slate-600 mt-1">Auditoría aplicada el 2026-04-17 · 12 issues detectados · 12 fixed ✅</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500 uppercase tracking-wide">Reducción tamaño</div>
            <div className="text-4xl font-bold text-emerald-600">-{m.reductionPct}%</div>
          </div>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500 font-semibold">Tamaño HTML</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-slate-400 line-through text-sm">{(m.sizeBefore / 1024).toFixed(1)}KB</span>
            <span className="text-2xl font-bold text-emerald-600">{(m.sizeAfter / 1024).toFixed(1)}KB</span>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500 font-semibold">Text/HTML ratio</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-slate-400 line-through text-sm">{m.textHtmlRatioBefore}%</span>
            <span className="text-2xl font-bold text-emerald-600">{m.textHtmlRatioAfter}%</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Target ≥25%</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500 font-semibold">Issues críticos</p>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            <span className="text-rose-600">{criticalIssues}</span> → <span className="text-emerald-600">0</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Todos fixed ✅</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500 font-semibold">Total fixes</p>
          <div className="mt-2 text-2xl font-bold text-emerald-600">12 / 12</div>
          <p className="text-xs text-slate-500 mt-1">{criticalIssues} crit · {mediumIssues} med · {lowIssues} low</p>
        </div>
      </div>

      {/* Subject + Preheader before/after */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase text-slate-500 font-semibold mb-3">Subject line</p>
          <div className="space-y-3">
            <div className="bg-rose-50 border-l-4 border-rose-400 p-3 rounded">
              <p className="text-xs text-rose-700 font-semibold mb-1">ANTES (geo mismatch)</p>
              <p className="text-sm text-slate-700">"{TEMPLATE_AUDIT.subjectBefore}"</p>
            </div>
            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded">
              <p className="text-xs text-emerald-700 font-semibold mb-1">DESPUÉS (geo-neutral)</p>
              <p className="text-sm text-slate-700">"{TEMPLATE_AUDIT.subjectAfter}"</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase text-slate-500 font-semibold mb-3">Preheader</p>
          <div className="space-y-3">
            <div className="bg-rose-50 border-l-4 border-rose-400 p-3 rounded">
              <p className="text-xs text-rose-700 font-semibold mb-1">ANTES</p>
              <p className="text-sm text-slate-700">"{TEMPLATE_AUDIT.preheaderBefore}"</p>
            </div>
            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded">
              <p className="text-xs text-emerald-700 font-semibold mb-1">DESPUÉS</p>
              <p className="text-sm text-slate-700">"{TEMPLATE_AUDIT.preheaderAfter}"</p>
            </div>
          </div>
        </div>
      </div>

      {/* Issues list */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-bold text-slate-900">12 Issues detectados y corregidos</h3>
          <p className="text-sm text-slate-500">Cada fila muestra antes → después del cleanup</p>
        </div>
        <div className="divide-y divide-slate-100">
          {TEMPLATE_ISSUES.map((issue) => (
            <div key={issue.id} className="px-5 py-4 hover:bg-slate-50 flex items-center gap-4">
              <div className="flex-shrink-0">
                <span className={`inline-block px-2 py-0.5 text-xs rounded-full border ${SEVERITY_STYLES[issue.severity]}`}>
                  {issue.severity}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm">{issue.title}</p>
                <p className="text-xs text-slate-500 truncate">{issue.description}</p>
              </div>
              <div className="flex items-center gap-3 text-sm tabular-nums">
                <span className="text-rose-600 font-semibold">{issue.before}</span>
                <span className="text-slate-400">→</span>
                <span className="text-emerald-600 font-bold">{issue.after}</span>
                <span className="text-lg">{issue.fixed ? '✅' : '❌'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

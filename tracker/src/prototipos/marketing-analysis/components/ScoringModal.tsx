import { useEffect } from 'react'
import { PIPELINE_RULES } from '../data/analysis'

type Props = { open: boolean; onClose: () => void }

export default function ScoringModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const scoringRule = PIPELINE_RULES.find((r) => r.id === 'scoring')!
  const handleRule = PIPELINE_RULES.find((r) => r.id === 'handle-match')!
  const fbRule = PIPELINE_RULES.find((r) => r.id === 'fb-check')!

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-br from-indigo-600 to-purple-700 text-white px-6 py-5 rounded-t-2xl flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide opacity-80">Cómo se califica cada contacto</p>
            <h2 className="text-2xl font-bold mt-1">Sistema de scoring 0-17 pts</h2>
            <p className="text-indigo-100 text-sm mt-1">Por qué un tier A (13 pts) es "perfil ideal Meta"</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-2xl leading-none"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Intro */}
          <p className="text-slate-700 leading-relaxed">
            A cada creador se le asigna un puntaje del <strong>0 al 17</strong> basado en 9 criterios. Mayor puntaje = mejor candidato
            para el programa Meta Creator Fast Track. Este sistema nos permite priorizar automáticamente: los tier A se contactan
            primero, los D se descartan.
          </p>

          {/* Criterios */}
          <div>
            <h3 className="font-bold text-slate-900 mb-3">📊 Los 9 criterios</h3>
            <div className="space-y-2">
              {scoringRule.criteria!.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-sm text-slate-800">{c.criterion}</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold text-xs">
                    +{c.pts} {c.pts === 1 ? 'pt' : 'pts'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tiers */}
          <div>
            <h3 className="font-bold text-slate-900 mb-3">🏆 Clasificación por tier</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {scoringRule.tiers!.map((t) => {
                const colors = {
                  A: 'bg-emerald-50 border-emerald-300 text-emerald-700',
                  B: 'bg-indigo-50 border-indigo-300 text-indigo-700',
                  C: 'bg-amber-50 border-amber-300 text-amber-700',
                  D: 'bg-slate-50 border-slate-300 text-slate-600',
                }
                return (
                  <div key={t.tier} className={`rounded-lg border-2 p-4 text-center ${colors[t.tier as keyof typeof colors]}`}>
                    <p className="text-3xl font-bold">{t.tier}</p>
                    <p className="text-xs font-semibold mt-1">{t.range}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Handle match detail */}
          <div>
            <h3 className="font-bold text-slate-900 mb-2">🔗 Regla: Handle Match (IG = TikTok)</h3>
            <p className="text-sm text-slate-600 mb-3">{handleRule.description}</p>
            <div className="grid grid-cols-2 gap-2">
              {handleRule.classes!.map((c) => (
                <div key={c.label} className="p-3 bg-slate-50 rounded border border-slate-200">
                  <p className="font-mono text-sm font-semibold text-slate-800">{c.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{c.description}</p>
                  <p className="text-xs text-indigo-600 font-semibold mt-1">+{c.pts} pts</p>
                </div>
              ))}
            </div>
          </div>

          {/* FB check detail */}
          <div>
            <h3 className="font-bold text-slate-900 mb-2">📘 Regla: Facebook Page Status</h3>
            <p className="text-sm text-slate-600 mb-3">{fbRule.description}</p>
            <div className="space-y-2">
              {fbRule.classes!.map((c) => (
                <div
                  key={c.label}
                  className={`p-3 rounded border-2 flex items-center justify-between ${
                    (c as { good?: boolean }).good === true ? 'bg-emerald-50 border-emerald-300' : (c as { good?: boolean }).good === false ? 'bg-rose-50 border-rose-300' : 'bg-slate-50 border-slate-300'
                  }`}
                >
                  <div>
                    <p className="font-mono text-sm font-semibold text-slate-800">{c.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{c.description}</p>
                  </div>
                  <span className={`text-sm font-bold ${(c as { good?: boolean }).good === true ? 'text-emerald-700' : 'text-rose-700'}`}>+{c.pts} pts</span>
                </div>
              ))}
            </div>
          </div>

          {/* Por qué es relevante el 13 */}
          <div className="rounded-lg bg-gradient-to-br from-emerald-50 to-white border-2 border-emerald-300 p-4">
            <h3 className="font-bold text-emerald-900">💡 ¿Por qué los Tier A tienen score 13?</h3>
            <p className="text-sm text-slate-700 mt-2 leading-relaxed">
              Un score de 13 significa que el creador cumple con:
            </p>
            <ul className="text-sm text-slate-700 mt-2 space-y-1 ml-5 list-disc">
              <li><strong>Ambas redes activas</strong> (+3)</li>
              <li><strong>Handle exacto</strong> IG = TikTok (+3)</li>
              <li><strong>IG en sweet spot</strong> 110K-200K seguidores (+2)</li>
              <li><strong>Nicho alineado</strong> con el programa Meta (+2)</li>
              <li><strong>Sin FB Page comercial</strong> (+2)</li>
              <li><strong>Nombre válido</strong> (+1)</li>
            </ul>
            <p className="text-sm text-emerald-800 mt-3 font-medium">
              Total = 13/17 pts. Es el "perfil ideal" para Meta porque tiene cross-platform consistente, tamaño manejable y cumple los filtros de elegibilidad.
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 bg-slate-50 px-6 py-4 rounded-b-2xl border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Template, TemplateVersion } from './types'

// Shell de Fase 1 — solo verifica que las migraciones cargaron y lista las
// plantillas seed. El editor real (split pane + validador + preview) llega en
// Fase 2.

export default function PlantillasPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [versions, setVersions] = useState<Record<string, TemplateVersion[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data: tpls, error: tErr } = await supabase
        .from('templates')
        .select('*')
        .eq('archived', false)
        .order('step_number', { ascending: true, nullsFirst: false })
      if (cancelled) return
      if (tErr) {
        setError(tErr.message)
        setLoading(false)
        return
      }
      setTemplates(tpls ?? [])

      if (tpls && tpls.length > 0) {
        const ids = tpls.map((t) => t.id)
        const { data: vers } = await supabase
          .from('template_versions')
          .select('*')
          .in('template_id', ids)
          .order('version', { ascending: false })
        if (!cancelled && vers) {
          const byTemplate: Record<string, TemplateVersion[]> = {}
          for (const v of vers) {
            ;(byTemplate[v.template_id] ??= []).push(v)
          }
          setVersions(byTemplate)
        }
      }
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const activeTemplate = templates.find((t) => t.id === selected) ?? templates[0]
  const activeVersions = activeTemplate ? versions[activeTemplate.id] ?? [] : []
  const latestVersion = activeVersions[0]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-slate-400 hover:text-slate-600 text-sm">← Tracker</Link>
          <h1 className="text-lg font-semibold">Plantillas Smartlead</h1>
          <span className="rounded bg-amber-100 text-amber-800 text-xs px-2 py-0.5">Fase 1 · shell</span>
        </div>
        <div className="text-xs text-slate-500">Plan B · campaign 3212141</div>
      </header>

      {loading && <div className="p-10 text-slate-400">Cargando plantillas…</div>}
      {error && (
        <div className="p-6">
          <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <strong>Error al consultar Supabase:</strong> {error}
            <p className="mt-2 text-red-600">
              Verifica que la migración <code>030_plantillas_editor.sql</code> haya corrido en el proyecto Supabase conectado.
            </p>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-[260px_1fr] min-h-[calc(100vh-53px)]">
          <aside className="border-r bg-white px-2 py-4">
            <div className="px-3 pb-2 text-xs uppercase tracking-wide text-slate-500">Plantillas</div>
            <ul className="space-y-0.5">
              {templates.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => setSelected(t.id)}
                    className={`w-full text-left px-3 py-2 rounded text-sm ${
                      (selected ?? templates[0]?.id) === t.id
                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{t.display_name}</span>
                      {t.step_number && <span className="text-xs text-slate-400">#{t.step_number}</span>}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{t.name}</div>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <main className="p-6">
            {!activeTemplate ? (
              <div className="text-slate-500">No hay plantillas seed cargadas.</div>
            ) : (
              <div className="max-w-3xl space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">{activeTemplate.display_name}</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {activeTemplate.name} · {activeVersions.length} versión{activeVersions.length === 1 ? '' : 'es'}
                  </p>
                </div>

                <section className="rounded border bg-white p-4">
                  <h3 className="text-sm font-semibold mb-2 text-slate-700">Configuración</h3>
                  <dl className="grid grid-cols-[140px_1fr] gap-y-1 text-sm">
                    <dt className="text-slate-500">Step</dt>
                    <dd>{activeTemplate.step_number ?? '—'}</dd>
                    <dt className="text-slate-500">Branch link</dt>
                    <dd className="truncate">{activeTemplate.branch_link_url ?? <em className="text-slate-400">sin link</em>}</dd>
                    <dt className="text-slate-500">QR image</dt>
                    <dd className="truncate">{activeTemplate.qr_image_url ?? <em className="text-slate-400">sin QR</em>}</dd>
                    <dt className="text-slate-500">CTA label</dt>
                    <dd>{activeTemplate.cta_label}</dd>
                    <dt className="text-slate-500">Campaign ID</dt>
                    <dd>{activeTemplate.smartlead_campaign_id}</dd>
                  </dl>
                </section>

                {latestVersion && (
                  <section className="rounded border bg-white p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-slate-700">
                        Última versión (v{latestVersion.version})
                      </h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          latestVersion.status === 'in_production'
                            ? 'bg-green-100 text-green-700'
                            : latestVersion.status === 'approved'
                            ? 'bg-blue-100 text-blue-700'
                            : latestVersion.status === 'draft'
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {latestVersion.status}
                      </span>
                    </div>
                    <div className="text-sm">
                      <div className="mb-2">
                        <span className="text-slate-500">Subject: </span>
                        {latestVersion.subject || <em className="text-slate-400">(vacío)</em>}
                      </div>
                      <pre className="whitespace-pre-wrap text-[13px] leading-relaxed bg-slate-50 border rounded p-3 font-mono">
{latestVersion.body_plain}
                      </pre>
                    </div>
                  </section>
                )}

                <section className="rounded border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                  <strong>Próxima fase (2):</strong> editor split-pane con preview live + validador de variables
                  + placeholders <code>{'{{link}}'}</code> / <code>{'{{qr}}'}</code>.
                </section>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  )
}

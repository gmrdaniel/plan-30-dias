import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Template, TemplateVersion, PreviewPersona } from './types'
import EditorPanel from './components/EditorPanel'
import PreviewPanel from './components/PreviewPanel'
import SplitPane from './components/SplitPane'
import { useDebounced } from './lib/useDebounce'

const SIDEBAR_STATE_KEY = 'plantillas:sidebar:templates:collapsed'

export default function PlantillasPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [versions, setVersions] = useState<Record<string, TemplateVersion[]>>({})
  const [personas, setPersonas] = useState<PreviewPersona[]>([])
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null)
  const [activePersonaId, setActivePersonaId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [templatesCollapsed, setTemplatesCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(SIDEBAR_STATE_KEY) === '1'
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SIDEBAR_STATE_KEY, templatesCollapsed ? '1' : '0')
    }
  }, [templatesCollapsed])

  // Estado editable (draft en memoria hasta que el save real llegue en Fase 4)
  const [subject, setSubject] = useState('')
  const [bodyPlain, setBodyPlain] = useState('')
  const debouncedSubject = useDebounced(subject, 300)
  const debouncedBody = useDebounced(bodyPlain, 300)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const [tplRes, personaRes] = await Promise.all([
          supabase.from('templates').select('*').eq('archived', false).order('step_number', { ascending: true, nullsFirst: false }),
          supabase.from('preview_personas').select('*').order('is_default', { ascending: false }),
        ])
        if (cancelled) return
        if (tplRes.error) throw tplRes.error
        if (personaRes.error) throw personaRes.error

        const tpls = tplRes.data ?? []
        const ppl = personaRes.data ?? []
        setTemplates(tpls)
        setPersonas(ppl)
        setActivePersonaId(ppl.find((p) => p.is_default)?.id ?? ppl[0]?.id ?? null)

        if (tpls.length > 0) {
          const ids = tpls.map((t) => t.id)
          const { data: vers, error: vErr } = await supabase
            .from('template_versions')
            .select('*')
            .in('template_id', ids)
            .order('version', { ascending: false })
          if (cancelled) return
          if (vErr) throw vErr
          const byTemplate: Record<string, TemplateVersion[]> = {}
          for (const v of vers ?? []) (byTemplate[v.template_id] ??= []).push(v)
          setVersions(byTemplate)
          setActiveTemplateId(tpls[0].id)
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const activeTemplate = useMemo(
    () => templates.find((t) => t.id === activeTemplateId) ?? null,
    [templates, activeTemplateId],
  )
  const activeVersions = activeTemplate ? versions[activeTemplate.id] ?? [] : []
  const latestVersion = activeVersions[0] ?? null
  const activePersona = useMemo(
    () => personas.find((p) => p.id === activePersonaId) ?? null,
    [personas, activePersonaId],
  )

  // Cuando cambia el template activo, carga su subject/body para edición
  useEffect(() => {
    if (latestVersion) {
      setSubject(latestVersion.subject)
      setBodyPlain(latestVersion.body_plain)
    } else {
      setSubject('')
      setBodyPlain('')
    }
  }, [latestVersion?.id])

  if (loading) return <div className="p-10 text-slate-400">Cargando plantillas…</div>
  if (error)
    return (
      <div className="p-6">
        <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <strong>Error al consultar Supabase:</strong> {error}
          <p className="mt-2 text-red-600">
            Verifica que la migración <code>030_plantillas_editor.sql</code> haya corrido.
          </p>
        </div>
      </div>
    )

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-slate-400 hover:text-slate-600 text-sm">← Tracker</Link>
          <h1 className="text-lg font-semibold">Plantillas Smartlead</h1>
          <span className="rounded bg-amber-100 text-amber-800 text-xs px-2 py-0.5">
            Fase 2 · editor live · sin save aún
          </span>
        </div>
        <div className="text-xs text-slate-500">
          {activeTemplate?.display_name} · v{latestVersion?.version ?? '—'} · status {latestVersion?.status ?? '—'}
        </div>
      </header>

      <div
        className="flex-1 min-h-0 grid transition-[grid-template-columns] duration-200"
        style={{
          gridTemplateColumns: templatesCollapsed ? '40px 1fr' : '240px 1fr',
        }}
      >
        <aside className="border-r bg-white overflow-y-auto relative">
          {templatesCollapsed ? (
            <button
              onClick={() => setTemplatesCollapsed(false)}
              className="w-full h-full flex flex-col items-center py-3 gap-3 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
              aria-label="Expandir sidebar"
              title="Expandir"
            >
              <span className="text-lg leading-none">»</span>
              <span
                className="text-[10px] uppercase tracking-wider text-slate-400"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              >
                Plantillas · {templates.length}
              </span>
            </button>
          ) : (
            <>
              <button
                onClick={() => setTemplatesCollapsed(true)}
                className="w-full flex items-center justify-between px-3 pt-4 pb-2 text-xs uppercase tracking-wide text-slate-500 hover:text-slate-700 transition-colors"
                aria-label="Colapsar sidebar"
                title="Colapsar"
              >
                <span>Plantillas ({templates.length})</span>
                <span className="text-slate-400">«</span>
              </button>
              <ul className="px-2 space-y-0.5">
                {templates.map((t) => (
                  <li key={t.id}>
                    <button
                      onClick={() => setActiveTemplateId(t.id)}
                      className={`w-full text-left px-3 py-2 rounded text-sm ${
                        activeTemplateId === t.id
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

              {activeTemplate && activeVersions.length > 0 && (
                <>
                  <div className="mt-6 px-3 pb-2 text-xs uppercase tracking-wide text-slate-500">Versiones</div>
                  <ul className="px-2 space-y-0.5 pb-6">
                    {activeVersions.map((v) => (
                      <li
                        key={v.id}
                        className={`px-3 py-1.5 rounded text-xs flex items-center justify-between ${
                          latestVersion?.id === v.id ? 'bg-slate-100' : ''
                        }`}
                  >
                    <span>v{v.version}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        v.status === 'in_production'
                          ? 'bg-green-100 text-green-700'
                          : v.status === 'approved'
                          ? 'bg-blue-100 text-blue-700'
                          : v.status === 'draft'
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {v.status}
                    </span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}
        </aside>

        <main className="min-h-0">
          {activeTemplate ? (
            <SplitPane
              left={
                <EditorPanel
                  subject={subject}
                  bodyPlain={bodyPlain}
                  onSubjectChange={setSubject}
                  onBodyChange={setBodyPlain}
                  personas={personas}
                  activePersonaId={activePersonaId}
                  onPersonaChange={setActivePersonaId}
                />
              }
              right={
                <PreviewPanel
                  subject={debouncedSubject}
                  bodyPlain={debouncedBody}
                  template={activeTemplate}
                  persona={activePersona}
                />
              }
            />
          ) : (
            <div className="p-10 text-slate-500">No hay plantillas seed cargadas.</div>
          )}
        </main>
      </div>
    </div>
  )
}

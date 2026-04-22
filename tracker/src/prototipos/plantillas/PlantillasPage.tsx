import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Template, TemplateVersion, PreviewPersona, VariableRegistryEntry } from './types'
import EditorPanel from './components/EditorPanel'
import PreviewPanel from './components/PreviewPanel'
import SplitPane from './components/SplitPane'
import SaveVersionModal from './components/SaveVersionModal'
import { useDebounced } from './lib/useDebounce'
import { hasErrors, validate } from './lib/validator'
import { buildExportText, downloadTxt } from './lib/exportTxt'
import { plainToHtml } from './lib/plainToHtml'

const SIDEBAR_STATE_KEY = 'plantillas:sidebar:templates:collapsed'

export default function PlantillasPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [versions, setVersions] = useState<Record<string, TemplateVersion[]>>({})
  const [personas, setPersonas] = useState<PreviewPersona[]>([])
  const [registry, setRegistry] = useState<VariableRegistryEntry[]>([])
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

  // Estado editable del draft en memoria. Al Save se persiste como nueva versión.
  const [subject, setSubject] = useState('')
  const [bodyPlain, setBodyPlain] = useState('')
  const [loadedVersionId, setLoadedVersionId] = useState<string | null>(null)
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const debouncedSubject = useDebounced(subject, 300)
  const debouncedBody = useDebounced(bodyPlain, 300)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const [tplRes, personaRes, regRes] = await Promise.all([
          supabase.from('templates').select('*').eq('archived', false).order('step_number', { ascending: true, nullsFirst: false }),
          supabase.from('preview_personas').select('*').order('is_default', { ascending: false }),
          supabase.from('variable_registry').select('*').eq('platform', 'smartlead'),
        ])
        if (cancelled) return
        if (tplRes.error) throw tplRes.error
        if (personaRes.error) throw personaRes.error
        if (regRes.error) throw regRes.error

        const tpls = tplRes.data ?? []
        const ppl = personaRes.data ?? []
        setTemplates(tpls)
        setPersonas(ppl)
        setRegistry(regRes.data ?? [])
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

  // Cuando cambia el template activo, carga la última versión para edición
  useEffect(() => {
    if (latestVersion) {
      setSubject(latestVersion.subject)
      setBodyPlain(latestVersion.body_plain)
      setLoadedVersionId(latestVersion.id)
    } else {
      setSubject('')
      setBodyPlain('')
      setLoadedVersionId(null)
    }
  }, [activeTemplateId, latestVersion?.id])

  // Dirty: el buffer difiere de la versión cargada como base
  const loadedVersion = useMemo(
    () => (activeTemplate ? versions[activeTemplate.id]?.find((v) => v.id === loadedVersionId) ?? null : null),
    [versions, activeTemplate, loadedVersionId],
  )
  const isDirty = !!loadedVersion && (subject !== loadedVersion.subject || bodyPlain !== loadedVersion.body_plain)

  const loadVersion = (v: TemplateVersion) => {
    if (isDirty) {
      const ok = window.confirm('Tienes cambios sin guardar. ¿Descartarlos y cargar esta versión?')
      if (!ok) return
    }
    setSubject(v.subject)
    setBodyPlain(v.body_plain)
    setLoadedVersionId(v.id)
  }

  // Validación en tiempo real (sobre el valor debounced, no cada keystroke)
  const warnings = useMemo(() => {
    if (!activeTemplate) return []
    return validate({
      subject: debouncedSubject,
      bodyPlain: debouncedBody,
      registry,
      branchLinkConfigured: !!activeTemplate.branch_link_url,
      qrConfigured: !!activeTemplate.qr_image_url,
    })
  }, [debouncedSubject, debouncedBody, registry, activeTemplate])

  const blocked = hasErrors(warnings)

  const nextVersionNumber = useMemo(() => {
    if (!activeTemplate) return 1
    const all = versions[activeTemplate.id] ?? []
    if (all.length === 0) return 1
    return Math.max(...all.map((v) => v.version)) + 1
  }, [activeTemplate, versions])

  async function saveDraft(commitMessage: string) {
    if (!activeTemplate) return
    setSaving(true)
    setSaveError(null)
    try {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData.user?.id ?? null

      const html = plainToHtml(bodyPlain)
      const hash = await sha256(html)

      const { data: inserted, error } = await supabase
        .from('template_versions')
        .insert({
          template_id: activeTemplate.id,
          version: nextVersionNumber,
          subject,
          body_plain: bodyPlain,
          body_html: html,
          body_html_hash: hash,
          commit_message: commitMessage || null,
          status: 'draft',
          validation_warnings: warnings,
          created_by: userId,
        })
        .select('*')
        .single()

      if (error) throw error
      if (!inserted) throw new Error('No data returned from insert')

      // Actualiza estado local: prepend la nueva versión
      setVersions((prev) => ({
        ...prev,
        [activeTemplate.id]: [inserted as TemplateVersion, ...(prev[activeTemplate.id] ?? [])],
      }))
      setLoadedVersionId((inserted as TemplateVersion).id)
      setSaveModalOpen(false)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : String(e))
    } finally {
      setSaving(false)
    }
  }

  async function handleExport() {
    if (!activeTemplate || !loadedVersion) return
    const { data: userData } = await supabase.auth.getUser()
    const exportedBy = userData.user?.email ?? 'anonymous'
    const content = buildExportText(activeTemplate, loadedVersion, registry, exportedBy)
    const filename = `${activeTemplate.name}_v${loadedVersion.version}.txt`
    downloadTxt(filename, content)
  }

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
          <span className="rounded bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5">
            Fase 4 · save + export
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span
            className={`px-2 py-0.5 rounded font-medium ${
              blocked
                ? 'bg-red-100 text-red-700'
                : warnings.length > 0
                ? 'bg-amber-100 text-amber-800'
                : 'bg-green-100 text-green-700'
            }`}
            title={blocked ? 'Hay errores que bloquean save' : `${warnings.length} warnings`}
          >
            {blocked ? '❌ Bloqueado' : warnings.length > 0 ? `⚠️ ${warnings.length} avisos` : '✅ OK'}
          </span>
          {isDirty && (
            <span className="px-2 py-0.5 rounded font-medium bg-amber-100 text-amber-900" title="Hay cambios sin guardar">
              ● Sin guardar
            </span>
          )}
          <button
            onClick={handleExport}
            disabled={!loadedVersion}
            className="px-3 py-1 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Exporta la versión cargada como .txt"
          >
            Export .txt
          </button>
          <button
            onClick={() => setSaveModalOpen(true)}
            disabled={blocked || !isDirty || !activeTemplate}
            className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
            title={
              !isDirty ? 'Sin cambios que guardar' : blocked ? 'Resuelve los errores antes de guardar' : 'Guardar nueva versión'
            }
          >
            Guardar draft
          </button>
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
                    {activeVersions.map((v) => {
                      const isLoaded = loadedVersionId === v.id
                      return (
                        <li key={v.id}>
                          <button
                            onClick={() => loadVersion(v)}
                            className={`w-full px-3 py-1.5 rounded text-xs flex items-center justify-between hover:bg-slate-50 ${
                              isLoaded ? 'bg-indigo-50 ring-1 ring-indigo-200' : ''
                            }`}
                            title={v.commit_message ?? 'sin commit message'}
                          >
                            <span className={isLoaded ? 'font-medium text-indigo-700' : ''}>v{v.version}</span>
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
                          </button>
                        </li>
                      )
                    })}
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
                  warnings={warnings}
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

      {saveError && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded shadow-lg px-4 py-3 max-w-md">
          <div className="font-semibold mb-1">Error al guardar</div>
          <div className="text-xs">{saveError}</div>
          <button
            onClick={() => setSaveError(null)}
            className="mt-2 text-xs underline hover:no-underline"
          >
            Cerrar
          </button>
        </div>
      )}

      {saveModalOpen && activeTemplate && (
        <SaveVersionModal
          nextVersion={nextVersionNumber}
          warnings={warnings}
          blocked={blocked}
          saving={saving}
          onCancel={() => setSaveModalOpen(false)}
          onConfirm={saveDraft}
        />
      )}
    </div>
  )
}

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

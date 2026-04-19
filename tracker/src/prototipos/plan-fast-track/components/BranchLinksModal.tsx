import { useState } from 'react'
import {
  BRANCH_CONTEXT,
  BRANCH_LINKS,
  BRANCH_UI_STEPS,
  BRANCH_API_SNIPPET,
  BRANCH_VERIFY_SNIPPET,
  BRANCH_TEMPLATE_UPDATES,
  BRANCH_DASHBOARD_VIEWS,
} from '../data/plan'
import Modal from './Modal'

type Props = { open: boolean; onClose: () => void }
type TabId = 'links' | 'create' | 'verify' | 'update'

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'links', label: 'Links a crear' },
  { id: 'create', label: 'Cómo crearlos' },
  { id: 'verify', label: 'Verificar' },
  { id: 'update', label: 'Actualizar plantillas + dashboard' },
]

export default function BranchLinksModal({ open, onClose }: Props) {
  const [tab, setTab] = useState<TabId>('links')
  const [activeLinkId, setActiveLinkId] = useState<string>(BRANCH_LINKS[0].id)
  const activeLink = BRANCH_LINKS.find((l) => l.id === activeLinkId) ?? BRANCH_LINKS[0]

  const copy = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Branch.io — Specs de links" subtitle={BRANCH_CONTEXT.plan} maxWidth="max-w-5xl">
      {/* Context banner */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 mb-4 border-l-4 border-l-[#0F52BA]">
        <p className="text-xs uppercase text-[#0F52BA] font-semibold">Contexto</p>
        <p className="text-sm text-slate-700 mt-1">{BRANCH_CONTEXT.why}</p>
        <p className="text-xs text-slate-600 mt-2">
          <span className="font-semibold">App ID:</span> <code className="bg-white px-1 rounded font-mono">{BRANCH_CONTEXT.appId}</code>
        </p>
        <p className="text-xs text-slate-600 mt-1">
          <span className="font-semibold">Link actual:</span> <code className="bg-white px-1 rounded font-mono">{BRANCH_CONTEXT.currentLink}</code>
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap border-b border-slate-200 pb-3 mb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              tab === t.id ? 'bg-[#0F52BA] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Links */}
      {tab === 'links' && (
        <div className="space-y-4">
          {/* Link selector */}
          <div className="flex gap-2 flex-wrap">
            {BRANCH_LINKS.map((l) => (
              <button
                key={l.id}
                onClick={() => setActiveLinkId(l.id)}
                className={`px-3 py-2 text-xs rounded-md border text-left transition-colors ${
                  activeLinkId === l.id
                    ? 'border-[#0F52BA] bg-white shadow-sm'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                }`}
              >
                <span className="font-mono font-semibold text-slate-900 block">{l.name}</span>
                <span className="text-slate-500">{l.step}</span>
                {l.optional && <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold">OPCIONAL</span>}
              </button>
            ))}
          </div>

          {/* Active link detail */}
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase text-slate-500 font-semibold">Link</p>
                <p className="font-mono font-bold text-slate-900">{activeLink.name}</p>
                <p className="text-xs text-slate-600 mt-0.5">{activeLink.step}</p>
              </div>
              <button
                onClick={() => copy(JSON.stringify(activeLink.fields.reduce((acc, f) => ({ ...acc, [f.field]: f.value }), {}), null, 2))}
                className="text-xs text-[#0F52BA] hover:underline"
              >
                Copiar JSON
              </button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs uppercase text-slate-600 font-semibold w-40">Campo Branch</th>
                  <th className="px-4 py-2 text-left text-xs uppercase text-slate-600 font-semibold">Valor</th>
                </tr>
              </thead>
              <tbody>
                {activeLink.fields.map((f) => (
                  <tr key={f.field} className="border-b border-slate-100">
                    <td className="px-4 py-2 font-mono text-xs text-[#0F52BA] font-semibold">{f.field}</td>
                    <td className={`px-4 py-2 text-xs text-slate-700 ${f.mono ? 'font-mono break-all' : ''}`}>{f.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <h4 className="text-xs uppercase text-slate-500 font-semibold mb-2">UTMs en la URL final</h4>
            <ul className="space-y-1 text-xs font-mono">
              {activeLink.utms.map((u, i) => (
                <li key={i} className="text-slate-700 flex gap-2">
                  <span className="text-emerald-600 shrink-0">•</span>
                  <span>{u}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tab: Create */}
      {tab === 'create' && (
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h4 className="text-sm font-bold text-slate-900 mb-2">Opción A — UI Branch.io (recomendada)</h4>
            <p className="text-xs text-slate-500 mb-3">Más confiable que la API, que históricamente ha sido intermitente.</p>
            <ol className="space-y-2 text-sm text-slate-700">
              {BRANCH_UI_STEPS.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[#0F52BA] text-white font-bold text-xs shrink-0">
                    {i + 1}
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Opción B — API</h4>
                <p className="text-xs text-slate-500">Si funciona (históricamente intermitente)</p>
              </div>
              <button
                onClick={() => copy(BRANCH_API_SNIPPET)}
                className="text-xs text-[#0F52BA] hover:underline"
              >
                Copiar
              </button>
            </div>
            <pre className="bg-slate-900 text-slate-100 text-xs font-mono p-4 overflow-x-auto leading-relaxed whitespace-pre">{BRANCH_API_SNIPPET}</pre>
          </div>
        </div>
      )}

      {/* Tab: Verify */}
      {tab === 'verify' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-700">Después de crear cada link, verificar que los campos quedaron correctos:</p>
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">Snippet Python</h4>
              <button
                onClick={() => copy(BRANCH_VERIFY_SNIPPET)}
                className="text-xs text-[#0F52BA] hover:underline"
              >
                Copiar
              </button>
            </div>
            <pre className="bg-slate-900 text-slate-100 text-xs font-mono p-4 overflow-x-auto leading-relaxed whitespace-pre">{BRANCH_VERIFY_SNIPPET}</pre>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 border-l-4 border-l-emerald-500">
            <h4 className="text-sm font-bold text-slate-900">Dashboard Branch.io — vistas clave</h4>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-700">
              {BRANCH_DASHBOARD_VIEWS.map((v, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-emerald-600 shrink-0">→</span>
                  <span><span className="font-semibold">{v.view}:</span> {v.action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tab: Update templates */}
      {tab === 'update' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-700">Una vez creados los links, reemplazar los placeholders en cada plantilla:</p>
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs uppercase text-slate-600 font-semibold">Plantilla</th>
                  <th className="px-4 py-2 text-left text-xs uppercase text-slate-600 font-semibold">Placeholder</th>
                  <th className="px-4 py-2 text-left text-xs uppercase text-slate-600 font-semibold">Link real (ejemplo)</th>
                </tr>
              </thead>
              <tbody>
                {BRANCH_TEMPLATE_UPDATES.map((u) => (
                  <tr key={u.template} className="border-b border-slate-100">
                    <td className="px-4 py-2 font-mono text-xs text-slate-700">{u.template}</td>
                    <td className="px-4 py-2"><code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-xs text-[#F59E0B]">{u.placeholder}</code></td>
                    <td className="px-4 py-2 font-mono text-xs text-emerald-700">{u.link}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Modal>
  )
}

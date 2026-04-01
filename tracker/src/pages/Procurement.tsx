import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/use-auth'
import { CheckSquare, Square, ShoppingCart } from 'lucide-react'
import { PROCUREMENT_ANALYSIS, COST_SCENARIOS } from '../lib/procurement-analysis'

interface ProcurementItem {
  id: string
  tool_key: string
  tool_name: string
  category: string | null
  cost_monthly: string | null
  cost_onetime: string | null
  priority: string
  priority_order: number
  deadline: string | null
  needed_by_task: string | null
  needed_by_date: string | null
  is_contracted: boolean
  contracted_at: string | null
  notes: string | null
}

type Tab = 'seguimiento' | 'analisis'

function TrackingTab({ items, toggleContracted }: { items: ProcurementItem[]; toggleContracted: (item: ProcurementItem) => void }) {
  const contracted = items.filter((i) => i.is_contracted).length
  const total = items.length

  const groups = items.reduce<Record<string, ProcurementItem[]>>((acc, item) => {
    if (!acc[item.priority]) acc[item.priority] = []
    acc[item.priority].push(item)
    return acc
  }, {})

  const priorityColors: Record<string, string> = {
    'P0 — ADELANTAR': 'bg-red-100 text-red-700 border-red-200',
    'P1 — DIA 1': 'bg-orange-100 text-orange-700 border-orange-200',
    'P2 — DIAS 2-4': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'P3 — DIAS 5-7': 'bg-blue-100 text-blue-700 border-blue-200',
    'P4 — SEMANA 2': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'P5 — SEMANA 3+': 'bg-gray-100 text-gray-700 border-gray-200',
    'OPCIONAL': 'bg-gray-50 text-gray-500 border-gray-200',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-right">
          <span className="text-2xl font-bold text-indigo-600">{contracted}/{total}</span>
          <span className="text-xs text-gray-500 ml-2">contratadas</span>
        </div>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-3">
        <div className="h-3 rounded-full bg-green-500 transition-all" style={{ width: `${total > 0 ? (contracted / total) * 100 : 0}%` }} />
      </div>
      {Object.entries(groups).map(([priority, groupItems]) => {
        const groupDone = groupItems.filter((i) => i.is_contracted).length
        return (
          <div key={priority}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${priorityColors[priority] || 'bg-gray-100 text-gray-600'}`}>{priority}</span>
              <span className="text-xs text-gray-400">{groupDone}/{groupItems.length}</span>
            </div>
            <div className="space-y-1">
              {groupItems.map((item) => (
                <button key={item.id} onClick={() => toggleContracted(item)}
                  className={`w-full flex items-start gap-3 px-4 py-3 rounded-lg border text-left transition-colors ${item.is_contracted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                  {item.is_contracted ? <CheckSquare size={18} className="text-green-500 shrink-0 mt-0.5" /> : <Square size={18} className="text-gray-300 shrink-0 mt-0.5" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${item.is_contracted ? 'line-through text-gray-400' : 'text-gray-900'}`}>{item.tool_name}</span>
                      {item.category && <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full">{item.category}</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      {item.cost_monthly && <span className="text-xs text-gray-500">{item.cost_monthly}/mes</span>}
                      {item.cost_onetime && <span className="text-xs text-gray-500">{item.cost_onetime} unico</span>}
                      {item.needed_by_task && (
                        <span className="text-xs text-indigo-600">
                          Tarea: {item.needed_by_task.split(', ').map((t: string, i: number) => (
                            <span key={t}>{i > 0 && ', '}<Link to={`/task/${t}`} className="underline hover:text-indigo-800" onClick={(e) => e.stopPropagation()}>{t}</Link></span>
                          ))}
                        </span>
                      )}
                      {item.needed_by_date && <span className="text-xs text-red-500">Necesaria: {item.needed_by_date}</span>}
                    </div>
                    {item.is_contracted && item.contracted_at && (
                      <div className="text-xs text-green-600 mt-0.5">Contratada {new Date(item.contracted_at).toLocaleDateString('es-MX')}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function AnalysisTab() {
  const subscriptions = PROCUREMENT_ANALYSIS.filter((r) => r.category === 'subscription')
  const free = PROCUREMENT_ANALYSIS.filter((r) => r.category === 'free')
  const optional = PROCUREMENT_ANALYSIS.filter((r) => r.category === 'optional')
  const removed = PROCUREMENT_ANALYSIS.filter((r) => r.category === 'removed')

  const scenarioA = COST_SCENARIOS.growth
  const scenarioB = COST_SCENARIOS.launch

  return (
    <div className="space-y-8">
      {/* Scenarios */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-indigo-50 border-2 border-indigo-300 rounded-xl p-4">
          <h3 className="font-bold text-indigo-700 text-sm mb-2">{scenarioA.name}</h3>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between"><span>Clay Growth</span><span className="font-mono">${scenarioA.clay}</span></div>
            <div className="flex justify-between"><span>HubSpot Sem 1-2 (Starter ×3)</span><span className="font-mono">${scenarioA.hubspot_sem12}</span></div>
            <div className="flex justify-between"><span>HubSpot Sem 3-4 (Pro ×3)</span><span className="font-mono">${scenarioA.hubspot_sem34}</span></div>
            <div className="flex justify-between"><span>Otras herramientas</span><span className="font-mono">${scenarioA.otherMonthly}</span></div>
            <div className="flex justify-between border-t pt-1 font-bold text-indigo-700"><span>Total Sem 1-2</span><span className="font-mono">${scenarioA.totalSem12}/mes</span></div>
            <div className="flex justify-between font-bold text-indigo-700"><span>Total Sem 3-4</span><span className="font-mono">${scenarioA.totalSem34}/mes</span></div>
            <div className="flex justify-between text-gray-400"><span>Costos únicos</span><span className="font-mono">${scenarioA.unique}</span></div>
          </div>
          <p className="text-xs text-indigo-600 mt-2">Todo automático. Sin intervención manual de Gabriel.</p>
        </div>
        <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-4">
          <h3 className="font-bold text-gray-700 text-sm mb-2">{scenarioB.name}</h3>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between"><span>Clay Launch</span><span className="font-mono">${scenarioB.clay}</span></div>
            <div className="flex justify-between"><span>HubSpot Sem 1-2 (Starter ×3)</span><span className="font-mono">${scenarioB.hubspot_sem12}</span></div>
            <div className="flex justify-between"><span>HubSpot Sem 3-4 (Pro ×3)</span><span className="font-mono">${scenarioB.hubspot_sem34}</span></div>
            <div className="flex justify-between"><span>Otras herramientas</span><span className="font-mono">${scenarioB.otherMonthly}</span></div>
            <div className="flex justify-between border-t pt-1 font-bold text-gray-700"><span>Total Sem 1-2</span><span className="font-mono">${scenarioB.totalSem12}/mes</span></div>
            <div className="flex justify-between font-bold text-gray-700"><span>Total Sem 3-4</span><span className="font-mono">${scenarioB.totalSem34}/mes</span></div>
            <div className="flex justify-between text-gray-400"><span>Costos únicos</span><span className="font-mono">${scenarioB.unique}</span></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Smartlead auto. Expandi y Supabase manual (~30-60 min/batch Gabriel).</p>
        </div>
      </div>

      {/* Subscriptions table */}
      <div>
        <h2 className="font-bold text-sm mb-3">Suscripciones — detalle por herramienta</h2>
        <div className="space-y-3">
          {subscriptions.map((row) => (
            <div key={row.tool} className="bg-white border rounded-xl p-4">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    {row.url ? (
                      <a href={row.url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 underline decoration-dotted underline-offset-2">{row.tool}</a>
                    ) : row.tool}
                  </h3>
                  <span className="text-xs text-gray-400">Actual: {row.currentPlan}</span>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-indigo-600">{row.recommendedCost}</div>
                  <div className="text-[10px] text-gray-400">recomendado</div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-2">{row.discovered}</p>
              {row.options.length > 1 && (
                <div className="space-y-1 mb-2">
                  {row.options.map((opt, i) => (
                    <div key={i} className={`text-xs px-3 py-1.5 rounded border ${
                      row.recommended.includes(opt.label.split(')')[0] + ')') ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-gray-50 border-gray-100 text-gray-600'
                    }`}>
                      <span className="font-medium">{opt.label}</span> — {opt.cost}
                      {opt.note && <span className="text-gray-400 ml-1">({opt.note})</span>}
                    </div>
                  ))}
                </div>
              )}
              <div className="text-xs text-indigo-600 font-medium">Recomendación: {row.recommended}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Removed */}
      {removed.length > 0 && (
        <div>
          <h2 className="font-bold text-sm mb-3 text-red-600">Eliminadas (ahorro)</h2>
          {removed.map((row) => (
            <div key={row.tool} className="bg-red-50 border border-red-200 rounded-xl p-3">
              <span className="text-sm font-medium line-through text-red-400">
                {row.url ? (
                  <a href={row.url} target="_blank" rel="noopener noreferrer" className="hover:text-red-600">{row.tool}</a>
                ) : row.tool}
              </span>
              <span className="text-xs text-red-600 ml-2">— {row.currentPlan} → {row.discovered}</span>
            </div>
          ))}
        </div>
      )}

      {/* Free */}
      <div>
        <h2 className="font-bold text-sm mb-3 text-green-600">Herramientas gratuitas</h2>
        <div className="flex flex-wrap gap-2">
          {free.map((row) => (
            <span key={row.tool} className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-full">
              {row.url ? (
                <a href={row.url} target="_blank" rel="noopener noreferrer" className="hover:text-green-900 underline decoration-dotted underline-offset-2">{row.tool}</a>
              ) : row.tool} — Free
            </span>
          ))}
        </div>
      </div>

      {/* Optional */}
      <div>
        <h2 className="font-bold text-sm mb-3 text-gray-500">Opcionales (evaluar durante sprint)</h2>
        <div className="space-y-1">
          {optional.map((row) => (
            <div key={row.tool} className="flex items-center justify-between text-xs bg-gray-50 border rounded-lg px-3 py-2">
              <span className="text-gray-700">
                {row.url ? (
                  <a href={row.url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 underline decoration-dotted underline-offset-2">{row.tool}</a>
                ) : row.tool}
              </span>
              <span className="text-gray-400">{row.options[0]?.cost}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Procurement() {
  const { user } = useAuth()
  const [items, setItems] = useState<ProcurementItem[]>([])
  const [loading, setLoading] = useState(true)
  const [params, setParams] = useSearchParams()
  const activeTab = (params.get('tab') as Tab) || 'seguimiento'

  const fetchItems = useCallback(async () => {
    const { data } = await supabase.from('procurement').select('*').order('priority_order').order('tool_name')
    if (data) setItems(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  const toggleContracted = async (item: ProcurementItem) => {
    const now = new Date().toISOString()
    await supabase.from('procurement').update({
      is_contracted: !item.is_contracted,
      contracted_at: !item.is_contracted ? now : null,
      contracted_by: !item.is_contracted ? user?.id : null,
    }).eq('id', item.id)
    await fetchItems()
  }

  if (loading) return <div className="p-8 text-gray-400">Cargando...</div>

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingCart size={24} /> Contratación de Herramientas
        </h1>
        <p className="text-gray-500 text-sm">Control de compras — Daniel Ramírez</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setParams({ tab: 'seguimiento' }, { replace: true })}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'seguimiento' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Seguimiento
        </button>
        <button
          onClick={() => setParams({ tab: 'analisis' }, { replace: true })}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'analisis' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Análisis y costos
        </button>
      </div>

      {activeTab === 'seguimiento' && <TrackingTab items={items} toggleContracted={toggleContracted} />}
      {activeTab === 'analisis' && <AnalysisTab />}
    </div>
  )
}

import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/use-auth'
import { CheckSquare, Square, ShoppingCart } from 'lucide-react'

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

export default function Procurement() {
  const { user } = useAuth()
  const [items, setItems] = useState<ProcurementItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchItems = useCallback(async () => {
    const { data } = await supabase
      .from('procurement')
      .select('*')
      .order('priority_order')
      .order('tool_name')
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

  const contracted = items.filter((i) => i.is_contracted).length
  const total = items.length

  // Group by priority
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
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart size={24} /> Contratacion de Herramientas
          </h1>
          <p className="text-gray-500 text-sm">Control de compras — Daniel Ramirez</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-indigo-600">{contracted}/{total}</div>
          <div className="text-xs text-gray-500">contratadas</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-3">
        <div
          className="h-3 rounded-full bg-green-500 transition-all"
          style={{ width: `${total > 0 ? (contracted / total) * 100 : 0}%` }}
        />
      </div>

      {/* Groups */}
      {Object.entries(groups).map(([priority, groupItems]) => {
        const groupDone = groupItems.filter((i) => i.is_contracted).length
        return (
          <div key={priority}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${priorityColors[priority] || 'bg-gray-100 text-gray-600'}`}>
                {priority}
              </span>
              <span className="text-xs text-gray-400">{groupDone}/{groupItems.length}</span>
            </div>
            <div className="space-y-1">
              {groupItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleContracted(item)}
                  className={`w-full flex items-start gap-3 px-4 py-3 rounded-lg border text-left transition-colors ${
                    item.is_contracted
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {item.is_contracted ? (
                    <CheckSquare size={18} className="text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <Square size={18} className="text-gray-300 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${item.is_contracted ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                        {item.tool_name}
                      </span>
                      {item.category && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full">{item.category}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      {item.cost_monthly && <span className="text-xs text-gray-500">{item.cost_monthly}/mes</span>}
                      {item.cost_onetime && <span className="text-xs text-gray-500">{item.cost_onetime} unico</span>}
                      {item.needed_by_task && (
                        <span className="text-xs text-indigo-600">
                          Tarea: {item.needed_by_task.split(', ').map((t, i) => (
                            <span key={t}>
                              {i > 0 && ', '}
                              <Link to={`/task/${t}`} className="underline hover:text-indigo-800" onClick={(e) => e.stopPropagation()}>{t}</Link>
                            </span>
                          ))}
                        </span>
                      )}
                      {item.needed_by_date && <span className="text-xs text-red-500">Necesaria: {item.needed_by_date}</span>}
                    </div>
                    {item.is_contracted && item.contracted_at && (
                      <div className="text-xs text-green-600 mt-0.5">
                        Contratada {new Date(item.contracted_at).toLocaleDateString('es-MX')}
                      </div>
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

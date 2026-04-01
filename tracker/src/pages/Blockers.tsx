import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { AlertTriangle, CheckCircle2, MessageCircle, Clock } from 'lucide-react'

interface BlockerItem {
  id: string
  code: string
  category: string
  question: string
  context: string
  owner: string
  asks_to: string
  needed_by: string
  related_tasks: string
  status: string
  answer: string | null
  answered_at: string | null
}

const WEEK_LABELS: Record<string, string> = {
  'pre': 'Pre-Sprint (antes del 6 Abr)',
  'sem1': 'Semana 1 — 6 al 12 Abr',
  'sem2': 'Semana 2 — 13 al 19 Abr',
  'sem3': 'Semana 3 — 20 al 26 Abr',
  'sem4': 'Semana 4 — 27 al 30 Abr',
  'other': 'Sin fecha definida',
}

const WEEK_ORDER = ['pre', 'sem1', 'sem2', 'sem3', 'sem4', 'other']

function parseWeek(neededBy: string): string {
  const lower = neededBy.toLowerCase()
  const diaMatch = lower.match(/d[ií]a\s*(\d+)/)
  if (diaMatch) {
    const dia = parseInt(diaMatch[1])
    if (dia <= 0) return 'pre'
    if (dia <= 7) return 'sem1'
    if (dia <= 14) return 'sem2'
    if (dia <= 21) return 'sem3'
    return 'sem4'
  }
  const dateMatch = lower.match(/(\d+)\s*(abr|abril)/)
  if (dateMatch) {
    const day = parseInt(dateMatch[1])
    if (day < 6) return 'pre'
    if (day <= 12) return 'sem1'
    if (day <= 19) return 'sem2'
    if (day <= 26) return 'sem3'
    return 'sem4'
  }
  if (lower.includes('pre-sprint') || lower.includes('pre sprint')) return 'pre'
  return 'other'
}

function parseDayNumber(neededBy: string): number {
  const diaMatch = neededBy.toLowerCase().match(/d[ií]a\s*(\d+)/)
  if (diaMatch) return parseInt(diaMatch[1])
  const dateMatch = neededBy.toLowerCase().match(/(\d+)\s*(abr|abril)/)
  if (dateMatch) return Math.max(0, parseInt(dateMatch[1]) - 5)
  if (neededBy.toLowerCase().includes('pre')) return -1
  return 99
}

const categoryColors: Record<string, string> = {
  'Infraestructura': 'bg-blue-100 text-blue-700',
  'Contenido': 'bg-purple-100 text-purple-700',
  'Dependencia': 'bg-orange-100 text-orange-700',
  'Definicion': 'bg-green-100 text-green-700',
}

export default function Blockers() {
  const [items, setItems] = useState<BlockerItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editAnswer, setEditAnswer] = useState('')

  const fetchItems = useCallback(async () => {
    const { data } = await supabase
      .from('blockers')
      .select('*')
      .order('needed_by')
    if (data) setItems(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  const saveAnswer = async (item: BlockerItem) => {
    await supabase.from('blockers').update({
      answer: editAnswer,
      answered_at: new Date().toISOString(),
      status: editAnswer.trim() ? 'respondida' : 'pendiente',
    }).eq('id', item.id)
    setEditingId(null)
    setEditAnswer('')
    await fetchItems()
  }

  const toggleStatus = async (item: BlockerItem, newStatus: string) => {
    await supabase.from('blockers').update({ status: newStatus }).eq('id', item.id)
    await fetchItems()
  }

  const grouped = useMemo(() => {
    const sorted = [...items].sort((a, b) => parseDayNumber(a.needed_by) - parseDayNumber(b.needed_by))
    const groups: Record<string, BlockerItem[]> = {}
    for (const w of WEEK_ORDER) groups[w] = []
    for (const item of sorted) {
      groups[parseWeek(item.needed_by)].push(item)
    }
    return Object.entries(groups).filter(([, v]) => v.length > 0)
  }, [items])

  if (loading) return <div className="p-8 text-gray-400">Cargando...</div>

  const pending = items.filter((i) => i.status === 'pendiente').length
  const answered = items.filter((i) => i.status === 'respondida').length
  const approved = items.filter((i) => i.status === 'aprobada').length

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <AlertTriangle size={24} /> Preguntas y Bloqueantes
        </h1>
        <p className="text-gray-500 text-sm">Ordenados por fecha — los mas urgentes primero</p>
      </div>

      <div className="flex gap-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-center">
          <div className="text-xl font-bold text-amber-600">{pending}</div>
          <div className="text-xs text-amber-600">Pendientes</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-center">
          <div className="text-xl font-bold text-blue-600">{answered}</div>
          <div className="text-xs text-blue-600">Respondidas</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-center">
          <div className="text-xl font-bold text-green-600">{approved}</div>
          <div className="text-xs text-green-600">Aprobadas</div>
        </div>
      </div>

      {grouped.map(([weekKey, weekItems]) => {
        const weekPending = weekItems.filter((i) => i.status === 'pendiente').length
        return (
          <div key={weekKey}>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-bold text-gray-700">{WEEK_LABELS[weekKey]}</h2>
              {weekPending > 0 && (
                <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">
                  {weekPending} pendiente{weekPending > 1 ? 's' : ''}
                </span>
              )}
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="space-y-3">
              {weekItems.map((item) => {
                const StatusIcon = item.status === 'aprobada' ? CheckCircle2 : item.status === 'respondida' ? MessageCircle : Clock
                const isEditing = editingId === item.id
                return (
                  <div key={item.id} className={`bg-white border rounded-xl p-4 ${item.status === 'aprobada' ? 'border-green-200 bg-green-50/50' : ''}`}>
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => {
                          const next = item.status === 'pendiente' ? 'respondida' : item.status === 'respondida' ? 'aprobada' : 'pendiente'
                          toggleStatus(item, next)
                        }}
                        title={`Estado: ${item.status}. Click para cambiar.`}
                        className="mt-0.5"
                      >
                        <StatusIcon size={20} className={
                          item.status === 'aprobada' ? 'text-green-500' :
                          item.status === 'respondida' ? 'text-blue-500' : 'text-amber-400'
                        } />
                      </button>
                      <div className="flex-1 min-w-0">
                        {/* Header: code + category + deadline */}
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-mono text-xs font-bold text-gray-400">{item.code}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${categoryColors[item.category] || 'bg-gray-100 text-gray-600'}`}>
                            {item.category}
                          </span>
                          <span className="text-xs text-red-500 ml-auto shrink-0">{item.needed_by}</span>
                        </div>

                        {/* Question */}
                        <h3 className={`text-sm font-medium ${item.status === 'aprobada' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                          {item.question}
                        </h3>

                        {/* Who to ask — prominent */}
                        <div className="mt-1.5 flex items-center gap-3 text-xs">
                          <span className="text-gray-500">Responsable: <span className="font-medium text-gray-700">{item.owner}</span></span>
                          <span className="text-gray-300">|</span>
                          <span className="text-gray-500">Preguntar a: <span className="font-medium text-indigo-600">{item.asks_to}</span></span>
                        </div>

                        {/* Context */}
                        <p className="text-xs text-gray-500 mt-1.5">{item.context}</p>

                        {/* Related tasks */}
                        <div className="text-xs text-indigo-500 mt-1.5">
                          Tareas: {item.related_tasks.split(', ').map((t: string, i: number) => (
                            <span key={t}>
                              {i > 0 && ', '}
                              <Link to={`/task/${t.trim()}`} className="underline hover:text-indigo-700" onClick={(e) => e.stopPropagation()}>{t.trim()}</Link>
                            </span>
                          ))}
                        </div>

                        {/* Template download for B16 */}
                        {item.code === 'B16' && (
                          <a
                            href="/templates/empleados-internos-swap-test.csv"
                            download
                            onClick={(e) => e.stopPropagation()}
                            className="mt-2 inline-flex items-center gap-1 text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200"
                          >
                            Descargar template CSV (22 empleados)
                          </a>
                        )}

                        {/* Answer */}
                        {item.answer && !isEditing && (
                          <div className="mt-2 p-2 bg-blue-50 rounded-lg text-sm text-blue-800">
                            <span className="font-medium">Respuesta:</span> {item.answer}
                          </div>
                        )}

                        {/* Edit answer */}
                        {isEditing ? (
                          <div className="mt-2 flex gap-2">
                            <input
                              value={editAnswer}
                              onChange={(e) => setEditAnswer(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && saveAnswer(item)}
                              placeholder="Escribir respuesta o visto bueno..."
                              className="flex-1 px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              autoFocus
                            />
                            <button onClick={() => saveAnswer(item)} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm">Guardar</button>
                            <button onClick={() => setEditingId(null)} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm">Cancelar</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditingId(item.id); setEditAnswer(item.answer || '') }}
                            className="mt-2 text-xs text-indigo-500 hover:text-indigo-700"
                          >
                            {item.answer ? 'Editar respuesta' : 'Agregar respuesta'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

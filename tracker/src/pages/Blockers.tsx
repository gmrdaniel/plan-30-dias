import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { AlertTriangle, CheckCircle2, Circle, MessageCircle, Clock } from 'lucide-react'

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

  if (loading) return <div className="p-8 text-gray-400">Cargando...</div>

  const pending = items.filter((i) => i.status === 'pendiente').length
  const answered = items.filter((i) => i.status === 'respondida').length
  const approved = items.filter((i) => i.status === 'aprobada').length

  const categoryColors: Record<string, string> = {
    'Infraestructura': 'bg-blue-100 text-blue-700',
    'Contenido': 'bg-purple-100 text-purple-700',
    'Dependencia': 'bg-orange-100 text-orange-700',
    'Definicion': 'bg-green-100 text-green-700',
  }

  const statusIcons: Record<string, typeof Circle> = {
    pendiente: Clock,
    respondida: MessageCircle,
    aprobada: CheckCircle2,
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <AlertTriangle size={24} /> Preguntas y Bloqueantes
        </h1>
        <p className="text-gray-500 text-sm">Temas pendientes de definicion o visto bueno</p>
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

      <div className="space-y-3">
        {items.map((item) => {
          const StatusIcon = statusIcons[item.status] || Circle
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
                >
                  <StatusIcon size={20} className={
                    item.status === 'aprobada' ? 'text-green-500' :
                    item.status === 'respondida' ? 'text-blue-500' : 'text-amber-400'
                  } />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-xs font-bold text-gray-400">{item.code}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${categoryColors[item.category] || 'bg-gray-100 text-gray-600'}`}>
                      {item.category}
                    </span>
                    <span className="text-xs text-gray-400">→ {item.asks_to}</span>
                    <span className="text-xs text-red-500 ml-auto">Necesaria: {item.needed_by}</span>
                  </div>
                  <h3 className={`text-sm font-medium ${item.status === 'aprobada' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                    {item.question}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{item.context}</p>
                  <div className="text-xs text-indigo-500 mt-1">Tareas: {item.related_tasks}</div>

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
}

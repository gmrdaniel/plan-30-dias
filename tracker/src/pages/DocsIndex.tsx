import { Link } from 'react-router-dom'
import { DOCS } from '../docs'
import { FileText, ArrowLeft } from 'lucide-react'

export default function DocsIndex() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={16} /> Volver al inicio
        </Link>
        <h1 className="text-2xl font-bold mb-1">Documentos del Sprint</h1>
        <p className="text-gray-500 text-sm mb-6">Equipo 3: Infraestructura — 6 Abr a 8 May 2026</p>

        <div className="space-y-3">
          {DOCS.map((doc) => (
            <Link
              key={doc.slug}
              to={`/docs/${doc.slug}`}
              className="block bg-white border rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <FileText size={20} className="text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <h2 className="font-medium text-gray-900">{doc.title}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{doc.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

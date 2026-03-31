import { useParams, Link, useNavigate } from 'react-router-dom'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { DOCS } from '../docs'
import { ArrowLeft } from 'lucide-react'

export default function DocView() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const doc = DOCS.find((d) => d.slug === slug)

  if (!doc) return (
    <div className="p-8 text-center">
      <p className="text-gray-500">Documento no encontrado</p>
      <Link to="/docs" className="text-indigo-600 text-sm mt-2 inline-block">Volver a documentos</Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white border-b px-6 py-3 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft size={16} /> Volver
          </button>
          <span className="text-sm font-medium text-gray-700">{doc.title}</span>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white border rounded-xl shadow-sm p-8">
        <article className="prose prose-sm prose-gray max-w-none
          prose-headings:font-bold
          prose-h1:text-2xl prose-h1:mb-4
          prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3
          prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2
          prose-table:w-full prose-table:text-sm prose-table:border-collapse
          prose-thead:bg-gray-50 prose-thead:border-b-2 prose-thead:border-gray-200
          prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:font-semibold prose-th:text-gray-700
          prose-td:px-3 prose-td:py-2 prose-td:border-t prose-td:border-gray-100
          prose-tr:border-b prose-tr:border-gray-100
          prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
          prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:p-4
          [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-gray-100 [&_pre_code]:text-xs
          prose-a:text-indigo-600
          prose-li:my-0.5
          prose-strong:text-gray-900
        ">
          <Markdown remarkPlugins={[remarkGfm]}>{doc.content}</Markdown>
        </article>
        </div>
      </div>
    </div>
  )
}

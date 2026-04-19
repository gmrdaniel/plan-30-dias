import { OPEN_QUESTIONS } from '../data/plan'

export default function OpenQuestions() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 border-l-4 border-l-[#F59E0B]">
        <h3 className="font-bold text-slate-900">{OPEN_QUESTIONS.length} preguntas pendientes para alineación</h3>
      </div>
      <ol className="divide-y divide-slate-100">
        {OPEN_QUESTIONS.map((q, i) => (
          <li key={i} className="px-5 py-3 flex gap-3">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-[#F59E0B] text-white font-bold text-sm shrink-0">
              {i + 1}
            </span>
            <p className="text-sm text-slate-700 leading-relaxed">{q}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}

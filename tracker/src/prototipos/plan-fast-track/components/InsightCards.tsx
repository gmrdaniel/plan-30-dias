import { OWN_INSIGHTS } from '../data/plan'

export default function InsightCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {OWN_INSIGHTS.map((item) => (
        <div key={item.n} className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-slate-900 text-white font-bold text-sm shrink-0">
              {item.n}
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm leading-tight">{item.title}</h3>
              <p className="text-sm text-slate-700 mt-2 leading-relaxed">{item.body}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

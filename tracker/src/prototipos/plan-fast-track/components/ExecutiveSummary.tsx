import { TL_DR } from '../data/plan'

export default function ExecutiveSummary() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {TL_DR.map((item) => (
        <div key={item.n} className="rounded-lg border border-slate-200 bg-white p-5 border-l-4 border-l-[#0F52BA]">
          <div className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#0F52BA] text-white font-bold text-sm shrink-0">
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

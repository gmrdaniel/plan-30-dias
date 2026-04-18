import { AUDIENCE_SEARCH, LISTS_AVAILABLE } from '../data/analysis'

export default function AudienceSearch() {
  const freshLists = LISTS_AVAILABLE.filter((l) => l.tipo === 'Fresh')
  const warmLists = LISTS_AVAILABLE.filter((l) => l.tipo === 'Warm')
  const totalAvail = LISTS_AVAILABLE.reduce((s, l) => s + l.contactos, 0)

  return (
    <div className="space-y-6">
      {/* Source */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-xs uppercase text-slate-500 font-semibold">Fuente</p>
        <p className="text-lg font-semibold text-slate-900 mt-1">{AUDIENCE_SEARCH.universeSource}</p>
      </div>

      {/* Funnel de filtros */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-bold text-slate-900 mb-4">🔻 Funnel de filtrado</h3>
        <div className="space-y-2">
          {AUDIENCE_SEARCH.filters.map((f, i) => {
            const widthPct = (f.kept / 35723) * 100
            const isLast = i === AUDIENCE_SEARCH.filters.length - 1
            return (
              <div key={f.rule} className="relative">
                <div className="flex items-center gap-3">
                  <div className="text-xs text-slate-500 w-6 text-right font-semibold">{i + 1}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-slate-900">{f.rule}</span>
                      <span className="tabular-nums text-slate-600">
                        <span className="font-bold text-slate-900">{f.kept.toLocaleString()}</span>
                        {f.eliminated > 0 && <span className="text-rose-500 text-xs"> (−{f.eliminated.toLocaleString()})</span>}
                      </span>
                    </div>
                    <div className="bg-slate-100 rounded-full h-6 overflow-hidden relative">
                      <div
                        className={`h-full ${isLast ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-indigo-500 to-indigo-600'} transition-all duration-700`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-5 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p className="text-sm text-emerald-900">
            <span className="font-semibold">Resultado:</span>{' '}
            <span className="font-bold text-2xl text-emerald-700">{AUDIENCE_SEARCH.totalAvailable.toLocaleString()}</span>
            {' '}creadores TikTok US post-filtros — listos para enriquecer y enviar.
          </p>
        </div>
      </div>

      {/* Totals table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-white">
          <h3 className="text-lg font-bold text-slate-900">📊 Tabla de totales — 6 listas generadas</h3>
          <p className="text-sm text-slate-500">Organizadas por prioridad (basado en OR histórico del bucket)</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs uppercase text-slate-600 font-semibold">Lista</th>
                <th className="px-4 py-3 text-left text-xs uppercase text-slate-600 font-semibold">Tipo</th>
                <th className="px-4 py-3 text-center text-xs uppercase text-slate-600 font-semibold">Prioridad</th>
                <th className="px-4 py-3 text-right text-xs uppercase text-slate-600 font-semibold">Contactos</th>
              </tr>
            </thead>
            <tbody>
              {LISTS_AVAILABLE.map((l) => (
                <tr key={l.name} className={`border-b border-slate-100 hover:bg-slate-50 ${l.emoji ? 'bg-amber-50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs text-slate-700">{l.name}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${l.tipo === 'Fresh' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {l.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-block w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-xs font-bold leading-7">#{l.priority}</span>
                    {' '}{l.emoji}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900 tabular-nums">
                    {l.contactos.toLocaleString()}
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-900 text-white">
                <td colSpan={3} className="px-4 py-3 font-bold">TOTAL disponible</td>
                <td className="px-4 py-3 text-right font-bold text-xl tabular-nums">{totalAvail.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
          <p className="text-xs uppercase text-indigo-600 font-semibold">Fresh (TikTok nunca contactados)</p>
          <p className="text-3xl font-bold text-indigo-900 mt-1">{freshLists.reduce((s, l) => s + l.contactos, 0).toLocaleString()}</p>
          <p className="text-xs text-slate-600 mt-1">{freshLists.length} listas por bucket</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs uppercase text-emerald-600 font-semibold">Warm (ya abrieron antes)</p>
          <p className="text-3xl font-bold text-emerald-900 mt-1">{warmLists.reduce((s, l) => s + l.contactos, 0).toLocaleString()}</p>
          <p className="text-xs text-slate-600 mt-1">{warmLists.length} listas re-engage</p>
        </div>
      </div>
    </div>
  )
}

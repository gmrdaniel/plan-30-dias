import KpiCard from './KpiCard'
import { OVERVIEW, SAMPLE_CAMPAIGNS } from '../data/analysis'

export default function Overview() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 p-6 md:p-8 text-white">
        <p className="text-indigo-200 text-sm font-semibold uppercase tracking-wide">Decisión ejecutiva</p>
        <h2 className="text-2xl md:text-4xl font-bold mt-2">
          Bucket ganador: <span className="text-amber-300">{OVERVIEW.winnerBucket} followers</span>
        </h2>
        <p className="text-indigo-100 mt-3 max-w-2xl">
          Con base en <span className="font-bold text-white">{OVERVIEW.campaignsAnalyzed}</span> campañas y{' '}
          <span className="font-bold text-white">{OVERVIEW.statsRows.toLocaleString()}</span> registros de stats,
          el segmento {OVERVIEW.winnerBucket} logra <span className="font-bold text-amber-300">{OVERVIEW.winnerOrPct}% OR</span>{' '}
          sobre <span className="font-bold text-white">{OVERVIEW.winnerSampleSize.toLocaleString()}</span> emails entregados
          en <span className="font-bold text-white">{OVERVIEW.winnerCamps}</span> campañas distintas.
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          <span className="bg-white/20 px-3 py-1 rounded-full">Periodo: {OVERVIEW.periodStart} → {OVERVIEW.periodEnd}</span>
          <span className="bg-white/20 px-3 py-1 rounded-full">Match rate: {OVERVIEW.matchRatePct}%</span>
          <span className="bg-amber-400/30 px-3 py-1 rounded-full">Slot óptimo: Lunes 17h (46.2%)</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Campañas analizadas" value={OVERVIEW.campaignsAnalyzed} color="indigo" />
        <KpiCard label="Stats rows" value={OVERVIEW.statsRows.toLocaleString()} color="indigo" />
        <KpiCard label="Creadores únicos" value={OVERVIEW.uniqueCreators.toLocaleString()} color="emerald" />
        <KpiCard label="Match universe" value={`${OVERVIEW.matchRatePct}%`} color="emerald" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Bucket ganador" value={OVERVIEW.winnerBucket} sublabel={`${OVERVIEW.winnerOrPct}% OR histórico`} color="amber" />
        <KpiCard label="Muestra ganadora" value={OVERVIEW.winnerSampleSize.toLocaleString()} sublabel={`${OVERVIEW.winnerCamps} campañas`} color="amber" />
        <KpiCard label="Costo enriquecer universo" value={`$${OVERVIEW.enrichmentCostTotal}`} sublabel="Clay + Apify" color="slate" />
        <KpiCard label="Evitar" value="Jueves · Viernes" sublabel="OR 2-4% histórico" color="rose" />
      </div>

      {/* Key finding */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <div className="text-4xl">🏆</div>
            <div>
              <h3 className="text-lg font-bold text-amber-900">Por qué {OVERVIEW.winnerBucket}</h3>
              <ul className="mt-2 space-y-1.5 text-sm text-slate-800">
                <li className="flex gap-2"><span>✓</span><span>OR <strong>{OVERVIEW.winnerOrPct}%</strong> consistente en {OVERVIEW.winnerCamps} campañas distintas</span></li>
                <li className="flex gap-2"><span>✓</span><span>Muestra sólida: <strong>{OVERVIEW.winnerSampleSize.toLocaleString()}</strong> emails entregados</span></li>
                <li className="flex gap-2"><span>✓</span><span>CTR <strong>0.59%</strong> (tied con buckets mayores)</span></li>
                <li className="flex gap-2"><span>✓</span><span>En campañas individuales: <strong>9.3%, 10.0%, 8.9%, 9.9%</strong></span></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-xl border-2 border-rose-300 bg-rose-50 p-5">
          <div className="flex items-start gap-3">
            <div className="text-4xl">🚫</div>
            <div>
              <h3 className="text-lg font-bold text-rose-900">Segmentos descartados</h3>
              <ul className="mt-2 space-y-1.5 text-sm text-slate-800">
                <li className="flex gap-2"><span>✗</span><span><strong>10M+</strong>: OR alto pero muestra chica (704) + CTR 0.28%</span></li>
                <li className="flex gap-2"><span>✗</span><span><strong>5M-10M</strong>: solo 13 campañas, no confiable</span></li>
                <li className="flex gap-2"><span>✗</span><span><strong>100k-250k</strong>: OR 4.9% a pesar de mayor volumen</span></li>
                <li className="flex gap-2"><span>✗</span><span><strong>&lt;100k</strong>: no alineado con objetivo B2B</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Sample campaigns */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-bold text-slate-900">Muestra de 3 campañas individuales</h3>
          <p className="text-sm text-slate-500">Demostrando que 500k-1M gana consistentemente en distintos senders/fechas</p>
        </div>
        <div className="divide-y divide-slate-100">
          {SAMPLE_CAMPAIGNS.map((c) => (
            <div key={c.name} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">{c.date} · {c.sender}</p>
                  <p className="font-semibold text-slate-900">{c.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">OR total</p>
                  <p className="text-2xl font-bold text-indigo-600">{c.totalOr}%</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-slate-500">
                      <th className="text-left py-1">Bucket</th>
                      <th className="text-right py-1">Creators</th>
                      <th className="text-right py-1">Delivered</th>
                      <th className="text-right py-1">Opens</th>
                      <th className="text-right py-1">OR%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {c.breakdown.map((b) => (
                      <tr key={b.bucket} className={b.highlight ? 'bg-amber-50' : ''}>
                        <td className="py-1 font-semibold">{b.bucket} {b.highlight && '⭐'}</td>
                        <td className="py-1 text-right tabular-nums">{b.creators.toLocaleString()}</td>
                        <td className="py-1 text-right tabular-nums">{b.delivered.toLocaleString()}</td>
                        <td className="py-1 text-right tabular-nums">{b.opens}</td>
                        <td className={`py-1 text-right tabular-nums font-semibold ${b.highlight ? 'text-amber-700' : 'text-slate-700'}`}>{b.orPct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

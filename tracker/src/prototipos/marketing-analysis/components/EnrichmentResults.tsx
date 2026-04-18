import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { ENRICHMENT_RESULTS } from '../data/analysis'
import ScoringModal from './ScoringModal'

const TIER_COLORS = { A: '#10b981', B: '#6366f1', C: '#f59e0b', D: '#94a3b8' }

export default function EnrichmentResults() {
  const { tiers, fbStatus, handleMatch, topRanked, projection } = ENRICHMENT_RESULTS
  const pieData = tiers.map((t) => ({ name: `Tier ${t.tier}`, value: t.count, tier: t.tier }))
  const [scoringOpen, setScoringOpen] = useState(false)

  return (
    <div className="space-y-6">
      <ScoringModal open={scoringOpen} onClose={() => setScoringOpen(false)} />

      {/* Context intro */}
      <div className="rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-5">
        <p className="text-xs uppercase text-indigo-600 font-semibold">Qué hicimos</p>
        <h3 className="text-lg font-bold text-slate-900 mt-1">Muestra de 999 contactos de TikTok enriquecidos con datos completos</h3>
        <p className="text-slate-700 mt-3 leading-relaxed text-sm">
          De la base TikTok (27k candidatos US con 100k+ seguidores), tomamos una <strong>muestra de 999 contactos</strong> del bucket 100k-500k
          y los procesamos con Clay (para obtener nombre completo + handles de Instagram/YouTube) y Apify (para validar seguidores reales de IG,
          bio, categoría, verificación y si tienen página de Facebook). Con esa data enriquecida aplicamos
          {' '}
          <button
            onClick={() => setScoringOpen(true)}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-600 text-white text-xs font-semibold rounded hover:bg-indigo-700 transition-colors"
          >
            📊 sistema de scoring 0-17 pts
          </button>
          {' '}
          y los clasificamos en tiers A/B/C/D para priorizar los envíos.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500 font-semibold">Records procesados</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{ENRICHMENT_RESULTS.totalRecords}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500 font-semibold">IG enriquecidos</p>
          <p className="text-3xl font-bold text-indigo-600 mt-1">{ENRICHMENT_RESULTS.igEnriched}</p>
          <p className="text-xs text-slate-500">{ENRICHMENT_RESULTS.igEnrichedPct}%</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500 font-semibold">IG verificados ✓</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">{ENRICHMENT_RESULTS.igVerified}</p>
          <p className="text-xs text-slate-500">{ENRICHMENT_RESULTS.igVerifiedPct}%</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500 font-semibold">Handle match exact</p>
          <p className="text-3xl font-bold text-amber-600 mt-1">{handleMatch[0].count}</p>
          <p className="text-xs text-slate-500">{handleMatch[0].pct}%</p>
        </div>
      </div>

      {/* Tier pie + FB status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-bold text-slate-900 mb-3">Distribución por Tier</h3>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {pieData.map((entry) => (
                    <Cell key={entry.tier} fill={TIER_COLORS[entry.tier as keyof typeof TIER_COLORS]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 space-y-2">
            {tiers.map((t) => (
              <div key={t.tier} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded" style={{ background: TIER_COLORS[t.tier as keyof typeof TIER_COLORS] }} />
                  <span className="font-semibold">Tier {t.tier}</span>
                  <span className="text-slate-500 text-xs">{t.description}</span>
                </div>
                <span className="tabular-nums font-semibold">{t.count} ({t.pct}%)</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-bold text-slate-900 mb-3">FB Status (regla filtro Meta)</h3>
          <div className="space-y-3">
            {fbStatus.map((f) => (
              <div key={f.status} className={`p-4 rounded-lg border-2 ${f.good ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{f.status}</span>
                  <span className={`text-2xl font-bold ${f.good ? 'text-emerald-700' : 'text-rose-700'}`}>{f.count}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{f.pct}% del sample</p>
              </div>
            ))}
          </div>
          <h4 className="text-sm font-bold text-slate-700 mt-5 mb-2">Handle match (IG = TikTok)</h4>
          <div className="space-y-2">
            {handleMatch.map((h) => (
              <div key={h.type} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-semibold text-slate-900">{h.type}</span>
                  <span className="text-xs text-slate-500 ml-2">{h.description}</span>
                </div>
                <span className="tabular-nums text-slate-700">{h.count} <span className="text-slate-400">({h.pct}%)</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top ranked */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-white">
          <h3 className="text-lg font-bold text-slate-900">🏆 Top contactos tier A (score 13)</h3>
          <p className="text-sm text-slate-500">Perfil ideal Meta — todas las reglas ✅</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs uppercase text-slate-600 font-semibold">Tier</th>
                <th className="px-4 py-2 text-left text-xs uppercase text-slate-600 font-semibold">Email</th>
                <th className="px-4 py-2 text-right text-xs uppercase text-slate-600 font-semibold">TT followers</th>
                <th className="px-4 py-2 text-right text-xs uppercase text-slate-600 font-semibold">IG followers</th>
                <th className="px-4 py-2 text-center text-xs uppercase text-slate-600 font-semibold">Verif</th>
                <th className="px-4 py-2 text-left text-xs uppercase text-slate-600 font-semibold">FB</th>
                <th className="px-4 py-2 text-left text-xs uppercase text-slate-600 font-semibold">Match</th>
              </tr>
            </thead>
            <tbody>
              {topRanked.map((r) => (
                <tr key={r.email} className="border-b border-slate-100 hover:bg-emerald-50">
                  <td className="px-4 py-2">
                    <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-xs">{r.tier} · {r.score}</span>
                  </td>
                  <td className="px-4 py-2 text-slate-900 font-medium">{r.email}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{r.ttFollowers.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{r.igFollowers.toLocaleString()}</td>
                  <td className="px-4 py-2 text-center">{r.verified ? '✅' : '—'}</td>
                  <td className="px-4 py-2 text-slate-600">{r.fb}</td>
                  <td className="px-4 py-2"><span className="text-xs font-mono text-amber-700">{r.match}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Projection */}
      <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-5">
        <h3 className="text-lg font-bold text-slate-900 mb-2">📈 Proyección al bucket 100k-500k completo</h3>
        <p className="text-sm text-slate-600 mb-4">Aplicando las proporciones observadas a los {projection.fullBucketRecords.toLocaleString()} contactos del bucket</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg p-4 border border-amber-200">
            <p className="text-xs text-slate-500 uppercase font-semibold">Tier A esperado</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">~{projection.projectedTierA}</p>
            <p className="text-xs text-slate-600 mt-2">Perfil ideal Meta — <strong>enviar primeros</strong>, probabilidad más alta de respuesta.</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-amber-200">
            <p className="text-xs text-slate-500 uppercase font-semibold">Tier A + B</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">~{projection.projectedTierAB.toLocaleString()}</p>
            <p className="text-xs text-slate-600 mt-2">Candidatos fuertes — <strong>grupo principal</strong> para las primeras cohortes del envío.</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-amber-200">
            <p className="text-xs text-slate-500 uppercase font-semibold">A + B + C</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">~{projection.projectedTierABC.toLocaleString()}</p>
            <p className="text-xs text-slate-600 mt-2">Universo contactable total — incluye también candidatos viables para <strong>segunda ronda</strong> con follow-up.</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-amber-200">
            <p className="text-xs text-slate-500 uppercase font-semibold">Tier D descartar</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">~{projection.projectedDiscarded.toLocaleString()}</p>
            <p className="text-xs text-slate-600 mt-2"><strong>No enviar</strong> — sin IG, o con FB Page que los descalifica para Meta. Ahorra volumen y protege reputación del dominio.</p>
          </div>
        </div>
      </div>

      {/* Próximos pasos */}
      <div className="rounded-xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-white p-5">
        <h3 className="text-lg font-bold text-emerald-900 mb-3">🚀 Próximos pasos</h3>
        <ol className="space-y-3 text-sm text-slate-800">
          <li className="flex gap-3">
            <span className="flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-white font-bold text-xs">1</span>
            <div>
              <p className="font-semibold">Escalar enriquecimiento al bucket completo 100k-500k</p>
              <p className="text-slate-600 text-xs mt-0.5">Correr Clay + Apify en los 18,907 contactos restantes (~$100 USD, ~2-3h de ejecución)</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-white font-bold text-xs">2</span>
            <div>
              <p className="font-semibold">Validar emails con MillionVerifier</p>
              <p className="text-slate-600 text-xs mt-0.5">Chequeo final de deliverability antes de importar a Brevo — elimina inbox inactivos</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-white font-bold text-xs">3</span>
            <div>
              <p className="font-semibold">Importar tiers A + B a Brevo como listas priorizadas</p>
              <p className="text-slate-600 text-xs mt-0.5">Crear lista <code className="text-xs bg-slate-100 px-1 rounded">FT_TIER_A_100k-500k</code> y <code className="text-xs bg-slate-100 px-1 rounded">FT_TIER_B_100k-500k</code></p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-white font-bold text-xs">4</span>
            <div>
              <p className="font-semibold">Lanzar cohorte 1 (ver Plan de ejecución abajo)</p>
              <p className="text-slate-600 text-xs mt-0.5">Lunes 20-abr 15:00 CT (17:00 ET) · 500 contactos del tier A+B · plantilla 559 + QR Branch</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-white font-bold text-xs">5</span>
            <div>
              <p className="font-semibold">Medir OR a las 48h y decidir escalado</p>
              <p className="text-slate-600 text-xs mt-0.5">Target: ≥10% OR para proceder con 2,000/semana. Si &lt;7%, revisar plantilla/sender.</p>
            </div>
          </li>
        </ol>
      </div>
    </div>
  )
}

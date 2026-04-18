import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { DAILY_DROP } from '../data/analysis'

export default function DiagnosisRecent() {
  return (
    <div className="space-y-6">
      {/* Chart — dramatic drop */}
      <div className="rounded-xl border border-rose-200 bg-gradient-to-br from-white to-rose-50 p-5">
        <h3 className="text-lg font-bold text-slate-900">Open Rate del 13 al 17 de abril</h3>
        <p className="text-sm text-rose-700 font-medium mt-1">🔻 Caída de 46.6% → 2.6% en 5 días</p>
        <div style={{ width: '100%', height: 300 }} className="mt-5">
          <ResponsiveContainer>
            <LineChart data={DAILY_DROP} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="orGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#fecdd3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
              <ReferenceLine y={10} stroke="#dc2626" strokeDasharray="3 3" label={{ value: 'Umbral crítico', fontSize: 10, fill: '#dc2626' }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const d = payload[0].payload
                  return (
                    <div className="rounded-lg bg-white border border-slate-200 shadow-lg p-3 text-xs">
                      <p className="font-bold text-slate-900">{d.date} · {d.label}</p>
                      <p className="text-slate-600 mt-1">Campañas: <span className="font-semibold text-slate-900">{d.camps}</span></p>
                      <p className="text-slate-600">Delivered: <span className="font-semibold text-slate-900">{d.delivered.toLocaleString()}</span></p>
                      <p className="text-slate-600">Opens: <span className="font-semibold text-slate-900">{d.opens}</span></p>
                      <p className="font-semibold mt-1" style={{ color: d.orPct < 10 ? '#dc2626' : d.orPct < 20 ? '#f59e0b' : '#10b981' }}>OR: {d.orPct}%</p>
                    </div>
                  )
                }}
              />
              <Line type="monotone" dataKey="orPct" stroke="#ef4444" strokeWidth={3} dot={{ r: 6, fill: '#ef4444' }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Timeline con labels */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {DAILY_DROP.map((d) => {
          const color = d.orPct >= 30 ? 'emerald' : d.orPct >= 15 ? 'amber' : 'rose'
          const bg = color === 'emerald' ? 'bg-emerald-50 border-emerald-300' : color === 'amber' ? 'bg-amber-50 border-amber-300' : 'bg-rose-50 border-rose-300'
          const txt = color === 'emerald' ? 'text-emerald-700' : color === 'amber' ? 'text-amber-700' : 'text-rose-700'
          return (
            <div key={d.date} className={`rounded-lg border-2 ${bg} p-3`}>
              <p className="text-xs text-slate-500 font-semibold">{d.date.slice(5)}</p>
              <p className={`text-3xl font-bold ${txt} mt-1`}>{d.orPct}%</p>
              <p className="text-xs text-slate-600 mt-1">{d.label}</p>
              <p className="text-xs text-slate-500 mt-1">{d.delivered.toLocaleString()} deliv</p>
            </div>
          )
        })}
      </div>

      {/* Diagnóstico */}
      <div className="rounded-xl border border-rose-300 bg-rose-50 p-5">
        <h3 className="font-bold text-rose-900 mb-3">🔎 Causas del problema identificadas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="bg-white rounded-lg p-3 border border-rose-200">
            <p className="font-semibold text-slate-900">1. Subject line idéntico en 11 campañas</p>
            <p className="text-xs text-slate-600 mt-1">Gmail detecta patrón repetido = sneaky evasion flag</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-rose-200">
            <p className="font-semibold text-slate-900">2. Preheader literal [DEFAULT_HEADER]</p>
            <p className="text-xs text-slate-600 mt-1">Placeholder sin reemplazar enviado a 2,484 contactos</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-rose-200">
            <p className="font-semibold text-slate-900">3. Rotación multi-dominio con mismo mensaje</p>
            <p className="text-xs text-slate-600 mt-1">Penaliza los 3 dominios juntos (elevn.me, elevnhub, elevnpro)</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-rose-200">
            <p className="font-semibold text-slate-900">4. Grammarly tags en body HTML</p>
            <p className="text-xs text-slate-600 mt-1">data-gr-* = flag directo de spam filter</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-rose-200">
            <p className="font-semibold text-slate-900">5. Hard bounce 2.5% (umbral crítico 2%)</p>
            <p className="text-xs text-slate-600 mt-1">Listas sucias penalizadas por ISPs</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-rose-200">
            <p className="font-semibold text-slate-900">6. Horario sub-óptimo (14h-18h)</p>
            <p className="text-xs text-slate-600 mt-1">Mejor slot histórico: Lunes 17h (46.2%) — no usado</p>
          </div>
        </div>
      </div>
    </div>
  )
}

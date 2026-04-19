import { COMPARISON_CRITERIA, ESTIMATE_ASSUMPTIONS, ESTIMATES_BY_PLAN, SCENARIOS, FAST_READ } from '../data/plan'
import Collapse from './Collapse'

export default function PlanComparison() {
  return (
    <div className="space-y-6">
      {/* Fast read */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 border-l-4 border-l-[#0F52BA]">
        <p className="text-xs uppercase text-[#0F52BA] font-semibold">Lectura rápida</p>
        <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
          {FAST_READ.map((r, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-[#0F52BA] shrink-0">→</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Criterios comparativos */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-slate-900">Matriz comparativa</h3>
          <p className="text-xs text-slate-500">15 criterios × 3 planes</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs uppercase text-slate-600 font-semibold">Criterio</th>
                <th className="px-4 py-3 text-left text-xs uppercase text-slate-600 font-semibold">
                  <span className="inline-block px-2 py-0.5 rounded-md bg-[#0F52BA] text-white">Plan A</span>
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase text-slate-600 font-semibold">
                  <span className="inline-block px-2 py-0.5 rounded-md bg-[#F59E0B] text-white">Plan B</span>
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase text-slate-600 font-semibold">
                  <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-600 text-white">Plan C</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_CRITERIA.map((c, i) => {
                const isLast = i === COMPARISON_CRITERIA.length - 1
                return (
                  <tr key={c.criterion} className={`border-b border-slate-100 ${isLast ? 'bg-amber-50 font-semibold' : ''}`}>
                    <td className="px-4 py-2.5 text-slate-900 text-sm font-medium">{c.criterion}</td>
                    <td className="px-4 py-2.5 text-slate-700 text-sm">{c.A}</td>
                    <td className="px-4 py-2.5 text-slate-700 text-sm">{c.B}</td>
                    <td className="px-4 py-2.5 text-slate-700 text-sm">{c.C}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Estimates by plan */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-slate-900">Estimados por plan</h3>
          <p className="text-xs text-slate-500">Envíos, opens, clicks, signups proyectados</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs uppercase text-slate-600 font-semibold">Métrica</th>
                <th className="px-4 py-2 text-right text-xs uppercase text-slate-600 font-semibold">Plan A</th>
                <th className="px-4 py-2 text-right text-xs uppercase text-slate-600 font-semibold">Plan B</th>
                <th className="px-4 py-2 text-right text-xs uppercase text-slate-600 font-semibold">Plan C</th>
              </tr>
            </thead>
            <tbody>
              {ESTIMATES_BY_PLAN.map((e, i) => (
                <tr key={i} className={`border-b border-slate-100 ${e.highlight ? 'bg-amber-50 font-semibold' : ''}`}>
                  <td className="px-4 py-2 text-slate-900">{e.metric}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-slate-800">{e.A.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-slate-800">{e.B.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-slate-800">{e.C.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scenarios */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-slate-900">Escenarios pesimista / base / optimista</h3>
          <p className="text-xs text-slate-500">Total clicks estimados por plan</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs uppercase text-slate-600 font-semibold">Escenario</th>
                <th className="px-4 py-2 text-right text-xs uppercase text-slate-600 font-semibold">Plan A</th>
                <th className="px-4 py-2 text-right text-xs uppercase text-slate-600 font-semibold">Plan B</th>
                <th className="px-4 py-2 text-right text-xs uppercase text-slate-600 font-semibold">Plan C</th>
              </tr>
            </thead>
            <tbody>
              {SCENARIOS.map((s, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="px-4 py-2 text-slate-900 font-medium">{s.scenario}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-[#0F52BA] font-semibold">{s.A}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-[#F59E0B] font-semibold">{s.B}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-emerald-600 font-semibold">{s.C}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assumptions - ver detalle */}
      <Collapse label="Ver supuestos del modelo de estimación">
        <div className="space-y-2">
          {ESTIMATE_ASSUMPTIONS.map((a, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_2fr] gap-2 p-3 bg-slate-50 rounded-md text-sm">
              <p className="font-semibold text-slate-900">{a.param}</p>
              <p className="text-[#0F52BA] font-semibold">{a.value}</p>
              <p className="text-slate-600 text-xs">{a.source}</p>
            </div>
          ))}
        </div>
      </Collapse>
    </div>
  )
}

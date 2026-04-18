import { useState } from 'react'
import { COST_CONFIG, COST_SCENARIOS } from '../data/analysis'

export default function CostCalculator() {
  const [volume, setVolume] = useState(500)

  const clayCost = (volume * COST_CONFIG.clayCreditsPerRecord * COST_CONFIG.clayCreditPrice)
  const apifyIg = (volume * 0.625 / 1000) * COST_CONFIG.apifyIgPer1000 // 62.5% hit rate
  const apifyFb = (volume / 1000) * COST_CONFIG.apifyFbPer1000
  const total = clayCost + apifyIg + apifyFb

  return (
    <div className="space-y-6">
      {/* Calculator */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">💰 Calculadora de costos</h3>
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Volumen de records: <span className="text-indigo-600 font-bold">{volume.toLocaleString()}</span>
          </label>
          <input
            type="range"
            min={100}
            max={30000}
            step={100}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>100</span>
            <span>15K</span>
            <span>30K</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-lg bg-indigo-50 border border-indigo-200 p-4">
            <p className="text-xs uppercase text-indigo-700 font-semibold">Clay</p>
            <p className="text-2xl font-bold text-indigo-900 mt-1">${clayCost.toFixed(2)}</p>
            <p className="text-xs text-indigo-600 mt-1">{(volume * COST_CONFIG.clayCreditsPerRecord).toLocaleString()} credits</p>
          </div>
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4">
            <p className="text-xs uppercase text-emerald-700 font-semibold">Apify IG</p>
            <p className="text-2xl font-bold text-emerald-900 mt-1">${apifyIg.toFixed(2)}</p>
            <p className="text-xs text-emerald-600 mt-1">profile scraper</p>
          </div>
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
            <p className="text-xs uppercase text-amber-700 font-semibold">Apify FB</p>
            <p className="text-2xl font-bold text-amber-900 mt-1">${apifyFb.toFixed(2)}</p>
            <p className="text-xs text-amber-600 mt-1">pages scraper</p>
          </div>
          <div className="rounded-lg bg-slate-900 p-4 text-white">
            <p className="text-xs uppercase opacity-80 font-semibold">Total</p>
            <p className="text-2xl font-bold mt-1">${total.toFixed(2)}</p>
            <p className="text-xs opacity-80 mt-1">por {volume.toLocaleString()} records</p>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
          <p className="font-semibold mb-1">Supuestos:</p>
          <ul className="list-disc ml-5 space-y-0.5">
            <li>Clay: {COST_CONFIG.clayCreditsPerRecord} créditos/record × ${COST_CONFIG.clayCreditPrice}/crédito</li>
            <li>Apify IG: $2.30 por 1,000 (hit rate asumido 62.5% = IG handle presente)</li>
            <li>Apify FB: $3.00 por 1,000 (chequea todos)</li>
          </ul>
        </div>
      </div>

      {/* Scenarios */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-bold text-slate-900">Escenarios pre-calculados</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs uppercase text-slate-600 font-semibold">Escenario</th>
                <th className="px-4 py-3 text-right text-xs uppercase text-slate-600 font-semibold">Records</th>
                <th className="px-4 py-3 text-right text-xs uppercase text-slate-600 font-semibold">Clay</th>
                <th className="px-4 py-3 text-right text-xs uppercase text-slate-600 font-semibold">Apify</th>
                <th className="px-4 py-3 text-right text-xs uppercase text-slate-600 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {COST_SCENARIOS.map((s, i) => (
                <tr key={s.name} className={`border-b border-slate-100 hover:bg-slate-50 ${i === COST_SCENARIOS.length - 1 ? 'font-semibold bg-amber-50' : ''}`}>
                  <td className="px-4 py-3 text-slate-900">{s.name}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{s.records.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-indigo-600">${s.clayCost.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-emerald-600">${s.apifyCost.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-bold text-slate-900">${s.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

import { COHORT_PLAN, LISTS_AVAILABLE } from '../data/analysis'

const STATUS_STYLES = {
  planned: 'bg-[#0F52BA]/10 text-[#0F52BA] border-[#0F52BA]/30',
  'pending-template': 'bg-amber-100 text-amber-800 border-amber-300',
  sending: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  done: 'bg-slate-100 text-slate-700 border-slate-300',
}

export default function ExecutionPlan() {
  const totalVolume = COHORT_PLAN.reduce((s, c) => s + c.volume, 0)
  const freshLists = LISTS_AVAILABLE.filter((l) => l.tipo === 'Fresh')
  const warmLists = LISTS_AVAILABLE.filter((l) => l.tipo === 'Warm')
  const totalAvail = LISTS_AVAILABLE.reduce((s, l) => s + l.contactos, 0)

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500 font-semibold">Cohortes S1</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{COHORT_PLAN.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500 font-semibold">Volumen S1</p>
          <p className="text-3xl font-bold text-[#0F52BA] mt-1">{totalVolume.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500 font-semibold">Disponible total</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">{totalAvail.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500 font-semibold">Semanas runway</p>
          <p className="text-3xl font-bold text-[#F59E0B] mt-1">{Math.floor(totalAvail / totalVolume)}</p>
          <p className="text-xs text-slate-500">a volumen actual</p>
        </div>
      </div>

      {/* Cohortes timeline */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-bold text-slate-900">Plan Semana 1 (20-26 abr 2026)</h3>
          <p className="text-sm text-slate-500">Volumen conservador post-crisis dominio · priorizando slot ganador Lunes 15:00 CDMX / 17:00 ET</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs uppercase text-slate-600 font-semibold">ID</th>
                <th className="px-4 py-3 text-left text-xs uppercase text-slate-600 font-semibold">Fecha · Hora</th>
                <th className="px-4 py-3 text-left text-xs uppercase text-slate-600 font-semibold">Audiencia</th>
                <th className="px-4 py-3 text-right text-xs uppercase text-slate-600 font-semibold">Vol</th>
                <th className="px-4 py-3 text-left text-xs uppercase text-slate-600 font-semibold">Sender</th>
                <th className="px-4 py-3 text-left text-xs uppercase text-slate-600 font-semibold">Template</th>
                <th className="px-4 py-3 text-right text-xs uppercase text-slate-600 font-semibold">OR esperado</th>
                <th className="px-4 py-3 text-center text-xs uppercase text-slate-600 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {COHORT_PLAN.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-slate-900">{c.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{c.dayOfWeek} {c.date.slice(8)} abr</div>
                    <div className="text-xs text-slate-500">
                      <span className="font-semibold">{c.hour} CDMX</span>
                      <span className="text-slate-400"> · {c.hourEt}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700 text-xs">{c.audience}</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900 tabular-nums">{c.volume}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{c.sender}</td>
                  <td className="px-4 py-3">
                    <div className="text-slate-900 text-xs">#{c.template}</div>
                    <div className="text-xs text-slate-500">{c.templateName}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-[#0F52BA] tabular-nums">{c.expectedOr}%</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full border ${STATUS_STYLES[c.status as keyof typeof STATUS_STYLES]}`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Listas disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 border-l-4 border-l-[#0F52BA]">
            <h4 className="font-bold text-slate-900">Listas Fresh (TikTok)</h4>
            <p className="text-xs text-slate-600">Nunca contactados — requieren enriquecimiento</p>
          </div>
          <div className="divide-y divide-slate-100">
            {freshLists.map((l) => (
              <div key={l.name} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-slate-700">{l.name}</span>
                  <span className="text-xs">{l.emoji}</span>
                </div>
                <span className="text-sm font-bold text-slate-900 tabular-nums">{l.contactos.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 border-l-4 border-l-emerald-500">
            <h4 className="font-bold text-slate-900">Listas Warm (Reopeners)</h4>
            <p className="text-xs text-slate-600">Ya abrieron algún email histórico</p>
          </div>
          <div className="divide-y divide-slate-100">
            {warmLists.map((l) => (
              <div key={l.name} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50">
                <span className="text-sm font-mono text-slate-700">{l.name}</span>
                <span className="text-sm font-bold text-slate-900 tabular-nums">{l.contactos.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dependencies */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 border-l-4 border-l-[#F59E0B]">
        <h3 className="text-lg font-bold text-slate-900 mb-3">Dependencias antes de C1</h3>
        <ul className="space-y-2 text-sm text-slate-800">
          <li>• Correr pipeline Clay + Apify sobre bucket 500k-1M (~$25, ~30-60 min)</li>
          <li>• Validar resultado en Brevo preview template 559</li>
          <li>• Crear Template <strong>561 Follow-up</strong> (duplicar 559, ajustar subject/copy)</li>
          <li>• Setup MillionVerifier para deliverability check</li>
          <li>• Subir listas enriquecidas a Brevo como <code className="text-xs bg-white px-1 rounded">FT_C1_TT_500k-1M_fresh</code></li>
          <li>• Programar campaña con schedule Lunes 21-abr 17:00 ET</li>
        </ul>
      </div>
    </div>
  )
}

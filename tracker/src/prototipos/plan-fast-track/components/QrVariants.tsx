import { QR_PRINCIPLE, QR_PARADOX, QR_TEMPLATE_T, QR_VARIANTS, QR_BY_PLAN, BRANCH_BY_PLAN, OPEN_TRACKING_NOTE } from '../data/plan'
import Collapse from './Collapse'

export default function QrVariants() {
  return (
    <div className="space-y-6">
      {/* Principle + paradox */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5 border-l-4 border-l-[#0F52BA]">
          <p className="text-xs uppercase text-[#0F52BA] font-semibold">Principio</p>
          <p className="text-sm text-slate-700 mt-2 leading-relaxed">{QR_PRINCIPLE}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 border-l-4 border-l-[#F59E0B]">
          <p className="text-xs uppercase text-[#F59E0B] font-semibold">Paradoja del QR en cold email</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {QR_PARADOX.map((p, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-[#F59E0B] shrink-0">•</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 3 variants */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {QR_VARIANTS.map((v) => (
          <div
            key={v.id}
            className={`rounded-lg border p-5 ${
              v.recommended
                ? 'bg-white border-emerald-400 border-l-4 border-l-emerald-500'
                : v.discarded
                  ? 'bg-slate-50 border-slate-200 opacity-70'
                  : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-slate-900 text-white font-bold text-lg">
                {v.id}
              </span>
              <span
                className={`inline-block px-2 py-0.5 text-xs rounded-md font-semibold ${
                  v.recommended
                    ? 'bg-emerald-100 text-emerald-800'
                    : v.discarded
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-[#0F52BA]/10 text-[#0F52BA]'
                }`}
              >
                {v.badge}
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 mt-3">{v.name}</h4>
            <ul className="mt-2 space-y-1 text-xs text-slate-700">
              {v.bullets.map((b, i) => (
                <li key={i} className="flex gap-2">
                  <span className={v.discarded ? 'text-rose-600' : 'text-emerald-600'}>{v.discarded ? '✗' : '✓'}</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Template T — plain text example */}
      <Collapse label="Ver ejemplo de Variante T (texto plano)">
        <pre className="bg-slate-900 text-slate-100 text-xs font-mono p-4 rounded-lg overflow-x-auto leading-relaxed whitespace-pre">
{QR_TEMPLATE_T}
        </pre>
      </Collapse>

      {/* QR by plan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm">Variante por plan y semana</h4>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs uppercase text-slate-600 font-semibold">Plan</th>
                <th className="px-3 py-2 text-left text-xs uppercase text-slate-600 font-semibold">S1</th>
                <th className="px-3 py-2 text-left text-xs uppercase text-slate-600 font-semibold">S2</th>
                <th className="px-3 py-2 text-left text-xs uppercase text-slate-600 font-semibold">S3</th>
              </tr>
            </thead>
            <tbody>
              {QR_BY_PLAN.map((q) => (
                <tr key={q.plan} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-semibold text-slate-900">{q.plan}</td>
                  <td className="px-3 py-2 text-slate-700">{q.s1}</td>
                  <td className="px-3 py-2 text-slate-700">{q.s2}</td>
                  <td className="px-3 py-2 text-slate-700">{q.s3}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm">Branch.io links por plan</h4>
          </div>
          <div className="divide-y divide-slate-100">
            {BRANCH_BY_PLAN.map((b) => (
              <div key={b.plan} className="p-3">
                <p className="font-semibold text-slate-900 text-sm">{b.plan}</p>
                <p className="text-xs font-mono text-slate-600 mt-1">{b.links}</p>
                <p className="text-xs text-slate-500 mt-0.5">Tags: <span className="font-mono">{b.tags}</span></p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Open tracking note */}
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h4 className="font-bold text-slate-900 text-sm">Desactivar open tracking de Smartlead</h4>
        <ul className="mt-2 space-y-1 text-sm text-slate-700">
          {OPEN_TRACKING_NOTE.map((n, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-[#0F52BA] shrink-0">•</span>
              <span>{n}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

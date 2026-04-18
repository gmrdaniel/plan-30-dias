import { BRANCH_INTEGRATION } from '../data/analysis'

export default function BranchIntegration() {
  const { problem, infrastructure, e2eValidation } = BRANCH_INTEGRATION

  return (
    <div className="space-y-6">
      {/* Problem */}
      <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <div className="text-3xl">❓</div>
          <div>
            <h3 className="font-bold text-amber-900">El problema</h3>
            <p className="text-sm text-slate-800 mt-1">{problem}</p>
          </div>
        </div>
      </div>

      {/* Architecture */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-bold text-slate-900 mb-4">🏗️ Arquitectura implementada</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl p-4 text-center">
            <p className="text-xs uppercase opacity-80">Envío</p>
            <p className="text-2xl font-bold mt-1">Brevo</p>
            <p className="text-xs opacity-80 mt-1">Template con QR Supabase + Branch link</p>
          </div>
          <div className="text-center text-slate-400 text-3xl">→</div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-4 text-center">
            <p className="text-xs uppercase opacity-80">Tracker</p>
            <p className="text-2xl font-bold mt-1">Branch.io</p>
            <p className="text-xs opacity-80 mt-1">Short link registra scan/click</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mt-4">
          <div className="hidden md:block"></div>
          <div className="text-center text-slate-400 text-3xl">↓</div>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-4 text-center">
            <p className="text-xs uppercase opacity-80">Destino</p>
            <p className="text-2xl font-bold mt-1">FB Signup</p>
            <p className="text-xs opacity-80 mt-1">UTMs + contact_id preservados</p>
          </div>
        </div>
      </div>

      {/* Infrastructure checklist */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-bold text-slate-900">Componentes implementados</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {infrastructure.map((item) => (
            <div key={item.name} className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50">
              <div className="text-2xl">{item.status}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm">{item.name}</p>
                <p className="text-xs text-slate-500 truncate">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* E2E validation */}
      <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-5">
        <h3 className="text-lg font-bold text-emerald-900 mb-3">✅ Validación End-to-End</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="bg-white rounded-lg p-3 border border-emerald-200">
            <p className="text-xs text-slate-500 uppercase">Tests ejecutados</p>
            <p className="text-2xl font-bold text-emerald-700">{e2eValidation.testsRun}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-emerald-200">
            <p className="text-xs text-slate-500 uppercase">Exitosos</p>
            <p className="text-2xl font-bold text-emerald-700">{e2eValidation.successful}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-emerald-200">
            <p className="text-xs text-slate-500 uppercase">Clicks antes scan</p>
            <p className="text-2xl font-bold text-slate-700">{e2eValidation.clicksBeforeTest}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-emerald-200">
            <p className="text-xs text-slate-500 uppercase">Clicks post scan</p>
            <p className="text-2xl font-bold text-emerald-700">{e2eValidation.clicksAfterMobileScan}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-emerald-200">
          <p className="text-sm text-slate-700">
            <span className="font-semibold text-emerald-800">Hallazgo crítico:</span> {e2eValidation.note}
          </p>
        </div>
      </div>
    </div>
  )
}

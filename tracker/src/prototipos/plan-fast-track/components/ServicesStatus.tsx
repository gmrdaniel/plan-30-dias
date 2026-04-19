import { SERVICES, SYNC_GAP, DNS_CHECK } from '../data/plan'

const STATUS_STYLES = {
  ok: 'bg-emerald-100 text-emerald-800',
  warn: 'bg-amber-100 text-amber-800',
  error: 'bg-rose-100 text-rose-800',
}
const STATUS_LABEL = { ok: 'OK', warn: 'Atención', error: 'Error' }

export default function ServicesStatus() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-slate-900">Conexiones verificadas</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {SERVICES.map((s) => (
            <div key={s.name} className="px-5 py-3 flex items-center gap-4">
              <span className={`inline-block px-2 py-0.5 text-xs rounded-md font-semibold ${STATUS_STYLES[s.status]}`}>
                {STATUS_LABEL[s.status]}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm">{s.name}</p>
                <p className="text-xs text-slate-500 truncate">{s.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5 border-l-4 border-l-[#F59E0B]">
          <p className="text-xs uppercase text-[#F59E0B] font-semibold">Gap detectado en sync CRM</p>
          <p className="text-slate-900 text-sm mt-1">
            <span className="text-2xl font-bold text-slate-900">{SYNC_GAP.missingCampaigns}</span> campañas del {SYNC_GAP.range} NO están sincronizadas
          </p>
          <p className="text-xs text-slate-500 mt-1">Lista guardada en <code className="bg-slate-100 px-1 rounded">{SYNC_GAP.file}</code> para re-sync posterior</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 border-l-4 border-l-emerald-500">
          <p className="text-xs uppercase text-emerald-700 font-semibold">DNS check</p>
          <p className="text-slate-900 text-sm mt-1">
            <span className="text-2xl font-bold text-slate-900">{DNS_CHECK.domainsChecked}</span> dominios · MX/SPF/DKIM/DMARC OK ·
            <span className="font-bold"> {DNS_CHECK.strictDmarc}</span> con DMARC p=reject
          </p>
          <p className="text-xs text-slate-500 mt-1">{DNS_CHECK.note}</p>
        </div>
      </div>
    </div>
  )
}

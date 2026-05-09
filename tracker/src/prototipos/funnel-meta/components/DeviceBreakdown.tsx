// Distribución observada en el PDF de Branch Single Link Analytics
// del 2026-05-08 (último 30 días). Activation Basics no expone esto vía API.
// Refrescar manualmente cuando bajen un nuevo PDF.
const DEVICE_DATA = [
  { os: 'Windows', pct: 50, color: 'bg-blue-500' },
  { os: 'iOS',     pct: 25, color: 'bg-emerald-500' },
  { os: 'macOS',   pct: 15, color: 'bg-slate-500' },
  { os: 'Linux',   pct: 10, color: 'bg-amber-500' },
]

const SOURCE_DATE = '2026-05-08'

export default function DeviceBreakdown() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-lg font-bold text-slate-900 mb-1">Devices que clickean</h3>
      <p className="text-xs text-slate-500 mb-4">
        Snapshot manual del PDF Branch · {SOURCE_DATE}
      </p>

      <div className="space-y-2">
        {DEVICE_DATA.map((d) => (
          <div key={d.os}>
            <div className="flex justify-between text-xs mb-0.5">
              <span className="text-slate-700 font-semibold">{d.os}</span>
              <span className="text-slate-500 tabular-nums">{d.pct}%</span>
            </div>
            <div className="h-3 bg-slate-100 rounded overflow-hidden">
              <div className={`h-full ${d.color}`} style={{ width: `${d.pct}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
        <div className="flex justify-between">
          <span>Mobile total</span>
          <span className="font-bold text-emerald-700 tabular-nums">25%</span>
        </div>
        <div className="flex justify-between">
          <span>Desktop total</span>
          <span className="font-bold text-rose-700 tabular-nums">75%</span>
        </div>
      </div>
    </div>
  )
}

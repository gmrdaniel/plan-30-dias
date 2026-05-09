interface Props {
  clicks: number
  signups: number
}

// Distribución desktop/mobile observada en el PDF de Branch (Single Link Analytics)
// del 2026-05-08 sobre los últimos 30 días. Hardcoded por ahora — Activation Basics
// no expone esto vía API ni per-link, hay que actualizar este número manualmente
// cuando saquen el siguiente PDF. Ver bitácora 2026-05-08 para fuente.
const DESKTOP_PCT = 0.75   // Windows + Mac + Linux ≈ 75%
const MOBILE_PCT = 0.25    // iOS + Android Mobile Safari

export default function DesktopFinding({ clicks, signups }: Props) {
  const desktopClicks = Math.round(clicks * DESKTOP_PCT)
  const mobileClicks = clicks - desktopClicks

  // Si tuvieramos device-tagging real en signups, calcularíamos esto.
  // Por ahora asumimos que TODOS los signups vienen de mobile (deep-link app-only),
  // lo cual hace que los desktop clicks sean clicks "perdidos".
  const lostDesktop = desktopClicks
  const conversionMobile = mobileClicks > 0 ? (signups / mobileClicks) * 100 : 0

  return (
    <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-5">
      <div className="flex items-start gap-3">
        <span className="text-2xl">⚠</span>
        <div className="flex-1">
          <h3 className="font-bold text-amber-900">
            Hallazgo crítico: ~75% de los clicks vienen de desktop, donde el deep-link de Meta NO permite registrar
          </h3>
          <p className="text-sm text-amber-800 mt-2">
            El destination URL <code className="bg-white px-1 rounded text-xs">facebook.com/creator_programs/signup</code> abre la app móvil de Meta. Desde desktop el flujo se rompe — el lead llega pero no puede aplicar. Estimación de impacto:
          </p>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="bg-white rounded-lg p-3 border border-amber-200">
              <p className="text-xs text-amber-700 uppercase tracking-wide">Clicks desktop perdidos</p>
              <p className="text-2xl font-bold text-amber-900 tabular-nums mt-1">{lostDesktop.toLocaleString()}</p>
              <p className="text-[11px] text-amber-700 mt-1">{(DESKTOP_PCT * 100).toFixed(0)}% del total</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-amber-200">
              <p className="text-xs text-amber-700 uppercase tracking-wide">Clicks mobile (que sí pueden convertir)</p>
              <p className="text-2xl font-bold text-amber-900 tabular-nums mt-1">{mobileClicks.toLocaleString()}</p>
              <p className="text-[11px] text-amber-700 mt-1">{(MOBILE_PCT * 100).toFixed(0)}% del total</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-amber-200">
              <p className="text-xs text-amber-700 uppercase tracking-wide">Conv. real (mobile only)</p>
              <p className="text-2xl font-bold text-amber-900 tabular-nums mt-1">{conversionMobile.toFixed(1)}%</p>
              <p className="text-[11px] text-amber-700 mt-1">signups / mobile clicks</p>
            </div>
          </div>
          <p className="text-xs text-amber-700 mt-3">
            <b>Recomendación pendiente:</b> landing intermedia que detecte UA y muestre QR a usuarios desktop.
            Si recuperáramos el 30% de desktop perdido al QR, los registros subirían ~{Math.round(lostDesktop * 0.3 * (conversionMobile / 100))} en este período.
          </p>
        </div>
      </div>
    </div>
  )
}

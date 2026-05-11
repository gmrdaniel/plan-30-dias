import { useMemo } from 'react'
import type { BranchClickBreakdown } from '../types'

interface Props {
  breakdowns: BranchClickBreakdown[]
}

/**
 * Callout amber explicando que un % de los clicks NO son humanos.
 * Cuenta Linux (OS) + GSA (browser) + bing/google referrer crawlers.
 */
export default function BranchBotsCallout({ breakdowns }: Props) {
  const stats = useMemo(() => {
    let linux = 0
    let gsa = 0
    let searchEngineReferrer = 0
    let totalOS = 0
    let totalBrowser = 0

    for (const b of breakdowns) {
      if (b.dimension === 'os') {
        totalOS += b.clicks
        if (b.category.toUpperCase() === 'LINUX') linux += b.clicks
      }
      if (b.dimension === 'browser') {
        totalBrowser += b.clicks
        if (b.category.toUpperCase() === 'GSA') gsa += b.clicks
      }
      if (b.dimension === 'referrer') {
        const cat = b.category.toLowerCase()
        if (cat.includes('bing.com') || cat.includes('google.com')) {
          searchEngineReferrer += b.clicks
        }
      }
    }

    const estimatedBots = linux + gsa  // referrer search-engine no se suma (puede duplicar)
    const baseTotal = totalOS || totalBrowser
    return {
      linux,
      gsa,
      searchEngineReferrer,
      estimatedBots,
      baseTotal,
      pct: baseTotal > 0 ? (estimatedBots / baseTotal) * 100 : 0,
    }
  }, [breakdowns])

  if (stats.baseTotal === 0 || stats.estimatedBots === 0) return null

  return (
    <section className="rounded-lg border-2 border-amber-300 bg-amber-50 p-5">
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden>🤖</span>
        <div className="flex-1">
          <h3 className="text-base font-bold text-amber-900">
            Estimado: {stats.pct.toFixed(1)}% de los clicks NO son humanos
          </h3>
          <p className="text-xs text-amber-800 mt-1 leading-relaxed">
            Los CTR reportados por Branch.io incluyen prefetch de seguridad de email (Microsoft Defender for Office 365,
            Proofpoint, Mimecast) y crawlers de Google. Descontar esto antes de reportar a dirección.
          </p>

          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
            <div className="rounded bg-white border border-amber-200 p-2">
              <p className="text-[10px] uppercase tracking-wide text-amber-700">Linux clicks</p>
              <p className="text-lg font-bold text-amber-900">{stats.linux}</p>
              <p className="text-[10px] text-amber-700">scanners email security</p>
            </div>
            <div className="rounded bg-white border border-amber-200 p-2">
              <p className="text-[10px] uppercase tracking-wide text-amber-700">GSA browser</p>
              <p className="text-lg font-bold text-amber-900">{stats.gsa}</p>
              <p className="text-[10px] text-amber-700">Google Search Appliance bot</p>
            </div>
            <div className="rounded bg-white border border-amber-200 p-2">
              <p className="text-[10px] uppercase tracking-wide text-amber-700">SE referrer</p>
              <p className="text-lg font-bold text-amber-900">{stats.searchEngineReferrer}</p>
              <p className="text-[10px] text-amber-700">bing/google crawling (no descontado)</p>
            </div>
          </div>

          <p className="text-[11px] text-amber-700 mt-3 leading-relaxed">
            <b>Fórmula sugerida:</b> CTR_real = (total_clicks − Linux − GSA) / sent_unique.
            iOS y Mobile Safari son señal "creador real" — son los engaged genuinos.
          </p>
        </div>
      </div>
    </section>
  )
}

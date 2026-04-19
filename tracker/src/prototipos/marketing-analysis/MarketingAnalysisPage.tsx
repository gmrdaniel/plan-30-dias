import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { OVERVIEW } from './data/analysis'
import Chapter from './components/Chapter'
import KpiCard from './components/KpiCard'
import DiagnosisRecent from './components/DiagnosisRecent'
import TemplateAudit from './components/TemplateAudit'
import BranchIntegration from './components/BranchIntegration'
import AudienceSearch from './components/AudienceSearch'
import BucketChart from './components/BucketChart'
import BucketTable from './components/BucketTable'
import DayHourChart from './components/DayHourChart'
import EnrichmentResults from './components/EnrichmentResults'
import ExecutionPlan from './components/ExecutionPlan'
import CostCalculator from './components/CostCalculator'
import TimelineChart from './components/TimelineChart'
import { BUCKETS_MAX_FOLLOWERS, BUCKETS_TIKTOK } from './data/analysis'

export default function MarketingAnalysisPage() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('ma-theme') === 'dark'
  })

  useEffect(() => {
    localStorage.setItem('ma-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  return (
    <div className="ma-root min-h-screen bg-[#F8F9FB] text-slate-900" data-theme={isDark ? 'dark' : 'light'}>
      {/* Top bar */}
      <nav className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-block w-8 h-8 rounded-lg bg-[#0F52BA]" />
          <div>
            <p className="font-bold text-slate-900 text-sm leading-tight">Análisis Fast Track — Abril 2026</p>
            <p className="text-xs text-slate-500 leading-tight">De la crisis a la estrategia validada con data</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsDark((v) => !v)}
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            title={isDark ? 'Modo claro' : 'Modo oscuro'}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 text-slate-600 hover:text-[#0F52BA] hover:border-[#0F52BA] transition-colors"
          >
            {isDark ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>
          <Link to="/" className="text-xs text-slate-500 hover:text-[#0F52BA]">← Tracker</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#0B1120] text-white">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1120] via-[#0B1120] to-[#0F52BA]/30" />
        <div className="relative max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <p className="text-slate-300 uppercase tracking-widest text-xs font-bold">Reporte ejecutivo · 2026-04-18</p>
          <h1 className="text-4xl md:text-6xl font-bold mt-4 leading-tight">
            De la <span className="text-[#F59E0B]">caída del open rate</span> a una estrategia de envíos validada con data
          </h1>
          <p className="text-slate-200 mt-6 text-lg md:text-xl max-w-3xl leading-relaxed">
            En 4 días detectamos una caída de 46% → 2.6% en open rate. Este documento reconstruye todo el trabajo hecho:
            diagnóstico de la plantilla, integración de tracking Branch.io, búsqueda de nueva audiencia en TikTok, y análisis
            histórico de {OVERVIEW.campaignsAnalyzed} campañas para decidir el plan de ejecución.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <span className="bg-white/5 backdrop-blur px-4 py-2 rounded-lg border border-white/10">{OVERVIEW.statsRows.toLocaleString()} registros de stats</span>
            <span className="bg-white/5 backdrop-blur px-4 py-2 rounded-lg border border-white/10">{OVERVIEW.uniqueCreators.toLocaleString()} creadores únicos</span>
            <span className="bg-[#F59E0B]/15 backdrop-blur px-4 py-2 rounded-lg border border-[#F59E0B]/40 text-[#F59E0B]">Bucket ganador: {OVERVIEW.winnerBucket} · {OVERVIEW.winnerOrPct}% OR</span>
          </div>
        </div>
      </section>

      {/* Capítulo 1 — Diagnóstico reciente */}
      <Chapter
        number="01"
        title="El diagnóstico"
        subtitle="Las últimas campañas del 13-17 de abril"
        accentColor="rose"
        intro={<>Arrancamos porque algo estaba pasando. En solo 4 días el open rate cayó de <strong>46.6% → 2.6%</strong>.
          Había que entender qué estaba fallando antes de mandar más correos. Analizamos las 20 campañas enviadas en esa
          ventana y encontramos 6 causas claras.</>}
      >
        <DiagnosisRecent />
      </Chapter>

      {/* Capítulo 2 — Auditoría de plantilla */}
      <Chapter
        number="02"
        title="Auditoría de la plantilla"
        subtitle="Qué estaba mal en el HTML y qué se corrigió"
        accentColor="amber"
        intro={<>La plantilla 559 del Fast Track tenía <strong>12 issues técnicos</strong> — desde basura del editor Froala
          hasta texto oculto con keywords. Los limpiamos, reducimos el peso 30% y corregimos copy con triggers de spam como
          "100%" y "Meta Official Partner".</>}
      >
        <TemplateAudit />
      </Chapter>

      {/* Capítulo 3 — Branch integration */}
      <Chapter
        number="03"
        title="Tracking de QR con Branch.io"
        subtitle="Para saber quién escanea, no solo quién clickea"
        accentColor="purple"
        intro={<>La plantilla lleva un QR pero Brevo no puede trackear un QR escaneado desde la cámara del teléfono —
          ese evento ocurre fuera del email. Montamos la infraestructura para registrar cada scan usando Branch.io + Supabase
          Storage. Ya validamos end-to-end que funciona.</>}
      >
        <BranchIntegration />
      </Chapter>

      {/* Capítulo 4 — Histórico 325 campañas */}
      <Chapter
        number="04"
        title="El histórico habla"
        subtitle={`Lo que dicen ${OVERVIEW.campaignsAnalyzed} campañas y ${OVERVIEW.statsRows.toLocaleString()} registros de stats`}
        accentColor="emerald"
        intro={<>Antes de decidir qué bucket y qué horario usar para los envíos nuevos, analizamos todo el histórico
          de Brevo. <strong>{OVERVIEW.winnerBucket}</strong> sale como ganador consistente con <strong>{OVERVIEW.winnerOrPct}% OR</strong>,
          y el slot óptimo es <strong>Lunes 17h ET</strong> con 46.2%.</>}
      >
        <div className="space-y-6">
          <TimelineChart />
          <BucketChart data={BUCKETS_MAX_FOLLOWERS} title="Open Rate por bucket (max_followers)" subtitle={`${OVERVIEW.campaignsAnalyzed} campañas · agregado histórico · click en las barras para métricas`} />
          <BucketTable data={BUCKETS_MAX_FOLLOWERS} />
          <BucketChart data={BUCKETS_TIKTOK} title="TikTok puro — por bucket de tiktok_followers" subtitle="Solo creadores con TikTok activo" />
          <DayHourChart />
        </div>
      </Chapter>

      {/* Capítulo 5 — Audience search */}
      <Chapter
        number="05"
        title="Búsqueda de audiencia fresca"
        subtitle="27 mil creadores TikTok US listos para enriquecer"
        accentColor="indigo"
        intro={<>Paralelamente buscamos audiencia nueva en TikTok. Del universo crudo (35k), aplicamos filtros hasta
          llegar a los <strong>27,073 contactos</strong> con email válido, US, 100k+ followers, sin role-based, y cruzados
          con la blocklist. Los organizamos en 6 listas por bucket.</>}
      >
        <AudienceSearch />
      </Chapter>

      {/* Capítulo 6 — Enrichment pipeline */}
      <Chapter
        number="06"
        title="Enriquecimiento del pilot"
        subtitle="Clay + Apify aplicados a 499 records de prueba"
        accentColor="indigo"
        intro={<>Con el bucket ganador en mente, corrimos el pipeline Clay (email → handles) + Apify
          (IG profile + FB page check) sobre una muestra de 499. Aplicamos las reglas de scoring 0-17 y rankeamos por tier.
          Resultado: <strong>38% (190 contactos) son tier A+B</strong> — candidatos fuertes para enviar.</>}
      >
        <EnrichmentResults />
      </Chapter>

      {/* Capítulo 7 — Plan de ejecución */}
      <Chapter
        number="07"
        title="Plan de ejecución"
        subtitle="Cohortes Semana 1 con audiencia fresca + warm reopeners"
        accentColor="emerald"
        intro={<>Con toda la data validada armamos un plan de ejecución conservador para la semana del 21 al 27 de abril:
          <strong> 4 cohortes de 500 contactos cada una</strong>, distribuidas en el slot ganador (Lunes 17h), segundo mejor
          (Martes 22h) y Domingo 19h.</>}
      >
        <ExecutionPlan />
      </Chapter>

      {/* Capítulo 8 — Costos */}
      <Chapter
        number="08"
        title="Costos del enriquecimiento"
        subtitle="Calculadora interactiva de Clay + Apify"
        accentColor="amber"
        intro={<>Enriquecer el universo completo de 27 mil contactos sale en <strong>~$170</strong> (Clay $24 + Apify $145).
          La calculadora abajo permite ajustar volumen y ver los costos desglosados por herramienta.</>}
      >
        <CostCalculator />
      </Chapter>

      {/* Conclusión */}
      <section className="py-16 bg-[#0B1120] text-white relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1120] via-[#0B1120] to-[#0F52BA]/20" />
        <div className="relative max-w-5xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold">Conclusiones</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <KpiCard label="Plantilla corregida" value="12 / 12" sublabel="Issues fixed" color="slate" />
            <KpiCard label="Tracking QR montado" value="E2E" sublabel="Branch + Supabase" color="slate" />
            <KpiCard label="Listas listas" value="6" sublabel="29,880 contactos disponibles" color="slate" />
          </div>
          <div className="mt-8 bg-white/5 backdrop-blur rounded-lg p-6 border-l-4 border-[#F59E0B] border-t border-r border-b border-white/10">
            <p className="text-lg leading-relaxed text-slate-200">
              <strong className="text-white">Decisión tomada:</strong> priorizar bucket <strong className="text-[#F59E0B]">500k-1M</strong>{' '}
              en slot <strong className="text-[#F59E0B]">Lunes 17h ET</strong>, con plantilla limpia 559 + Branch QR integrado.
              La primera cohorte sale <strong className="text-white">Lunes 21 de abril</strong> con 500 contactos enriquecidos.
              Si OR ≥ 7%, escalamos a 2,000/semana.
            </p>
          </div>
          <p className="text-sm text-slate-400 mt-8">
            Fuentes: Brevo API · Supabase CRM (brevo_creator_stats + creator_inventory + brevo_campaigns) · UNIVERSO_meta_100k.csv · MASTER_gabriel_SIN_DUPLICADOS.csv · Clay sample + Apify pipeline
          </p>
        </div>
      </section>
    </div>
  )
}

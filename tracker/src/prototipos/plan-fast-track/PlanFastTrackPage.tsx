import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { META } from './data/plan'
import Chapter from './components/Chapter'
import ExecutiveSummary from './components/ExecutiveSummary'
import ServicesStatus from './components/ServicesStatus'
import CampaignsDetail from './components/CampaignsDetail'
import HypothesisValidation from './components/HypothesisValidation'
import InsightCards from './components/InsightCards'
import SubjectAnalysis from './components/SubjectAnalysis'
import ActionsMatrix from './components/ActionsMatrix'
import PlanTabs from './components/PlanTabs'
import PlanComparison from './components/PlanComparison'
import QrVariants from './components/QrVariants'
import OpenQuestions from './components/OpenQuestions'
import ReferencesList from './components/ReferencesList'

export default function PlanFastTrackPage() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('ft-theme') === 'dark'
  })

  useEffect(() => {
    localStorage.setItem('ft-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  return (
    <div className="ma-root min-h-screen bg-[#F8F9FB] text-slate-900" data-theme={isDark ? 'dark' : 'light'}>
      {/* Top bar */}
      <nav className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-block w-8 h-8 rounded-lg bg-[#0F52BA]" />
          <div>
            <p className="font-bold text-slate-900 text-sm leading-tight">Plan Fast Track — Abril 2026</p>
            <p className="text-xs text-slate-500 leading-tight">Diagnóstico + 3 planes de acción</p>
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
          <p className="text-slate-300 uppercase tracking-widest text-xs font-bold">Diagnóstico + plan de acción · {META.date} (actualizado {META.updated})</p>
          <h1 className="text-4xl md:text-6xl font-bold mt-4 leading-tight">
            De la <span className="text-[#F59E0B]">crisis de deliverability</span> a 3 caminos con data dura
          </h1>
          <p className="text-slate-200 mt-6 text-lg md:text-xl max-w-3xl leading-relaxed">
            {META.businessObjective}
          </p>
          <p className="text-slate-300 mt-4 text-sm md:text-base max-w-3xl leading-relaxed">
            {META.methodology}
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <span className="bg-white/5 backdrop-blur px-4 py-2 rounded-lg border border-white/10">21 campañas analizadas (Apr 13-17)</span>
            <span className="bg-white/5 backdrop-blur px-4 py-2 rounded-lg border border-white/10">266 campañas histórico (45 subjects únicos)</span>
            <span className="bg-[#F59E0B]/15 backdrop-blur px-4 py-2 rounded-lg border border-[#F59E0B]/40 text-[#F59E0B]">3 planes de acción con estimados</span>
          </div>
        </div>
      </section>

      {/* TL;DR */}
      <Chapter
        number="TL;DR"
        title="3 conclusiones ejecutivas"
        subtitle="Lectura de 30 segundos antes de bajar al detalle"
        accentColor="indigo"
      >
        <ExecutiveSummary />
      </Chapter>

      {/* Capítulo 1 — Conexiones */}
      <Chapter
        number="01"
        title="Conexiones verificadas"
        subtitle="Infraestructura: servicios externos y DNS"
        accentColor="emerald"
        intro={<>Antes de cualquier diagnóstico se validaron las 6 integraciones operativas y los 13 dominios con DNS completo. <strong>La config técnica no es el problema</strong> — la reputación acumulada sí.</>}
      >
        <ServicesStatus />
      </Chapter>

      {/* Capítulo 2 — Diagnóstico */}
      <Chapter
        number="02"
        title="El diagnóstico validado contra Brevo"
        subtitle="21 campañas del 13-17 abr con data directa de la API"
        accentColor="rose"
        intro={<>
          Brevo API guarda stats reales en <code className="bg-slate-100 px-1 rounded text-sm">statistics.campaignStats[]</code>, no en <code className="bg-slate-100 px-1 rounded text-sm">globalStats</code>. Los scripts originales del CRM leían el endpoint equivocado — por eso todo estaba en 0. Data real recuperada y reconstruida aquí.
        </>}
      >
        <CampaignsDetail />
      </Chapter>

      {/* Capítulo 3 — Hipótesis Ana */}
      <Chapter
        number="03"
        title="Hipótesis de Ana — validación punto por punto"
        subtitle="9 afirmaciones contrastadas con data directa"
        accentColor="amber"
        intro={<>Ana identificó correctamente el detonador de HB, pero su solución propuesta ("batches 25-50 desde los mismos dominios") <strong>no resuelve el problema de fondo</strong>. Aquí la matriz de validación.</>}
      >
        <HypothesisValidation />
      </Chapter>

      {/* Capítulo 4 — Hallazgos propios */}
      <Chapter
        number="04"
        title="Hallazgos propios"
        subtitle="5 insights no mencionados por Ana"
        accentColor="indigo"
        intro={<>El análisis descubrió patrones que cambian el diagnóstico completo: <strong>el click es el KPI real</strong>, los soft bounces eran early warning, y Brevo no es el canal correcto para cold outreach según su propia documentación.</>}
      >
        <InsightCards />
      </Chapter>

      {/* Capítulo 5 — Análisis subjects */}
      <Chapter
        number="05"
        title="¿El subject repetido mata el OR?"
        subtitle="Validación empírica contra 266 campañas históricas"
        accentColor="emerald"
        intro={<>La hipótesis original del equipo sugería que reutilizar subjects dañaba el OR. El análisis de los últimos 4 meses <strong>muestra lo contrario</strong>: los subjects más reutilizados tienen el OR promedio más alto (selection bias positivo).</>}
      >
        <SubjectAnalysis />
      </Chapter>

      {/* Capítulo 6 — Evaluación acciones */}
      <Chapter
        number="06"
        title="Evaluación de acciones propuestas"
        subtitle="8 acciones con veredicto y racional"
        accentColor="purple"
        intro={<>Cada acción propuesta por el equipo fue evaluada contra data + best practices 2026. El veredicto se resume como <strong>SÍ / NO / Pausar / Riesgoso / Depende del plan</strong>.</>}
      >
        <ActionsMatrix />
      </Chapter>

      {/* Capítulo 7 — 3 Planes */}
      <Chapter
        number="07"
        title="3 planes de acción — detalle completo"
        subtitle="Dominios, cronograma, métricas, workflow y fuentes"
        accentColor="indigo"
        intro={<>Cada plan incluye: recomendación, objetivo, senders, fecha inicio, volumen día a día, métricas de éxito, trade-offs, plantillas, Branch links, subjects, workflow y referencias. Selecciona el plan con las pestañas.</>}
      >
        <PlanTabs />
      </Chapter>

      {/* Capítulo 8 — Comparativa */}
      <Chapter
        number="08"
        title="Comparativa ejecutiva"
        subtitle="Matriz + estimados pesimista / base / optimista"
        accentColor="amber"
        intro={<>La diferencia entre Plan A y Plan B es <strong>tiempo, riesgo y data preservada</strong>, no volumen total. Plan C entrega poca aguja de negocio pero valida el canal por $50.</>}
      >
        <PlanComparison />
      </Chapter>

      {/* Capítulo 9 — QR variantes */}
      <Chapter
        number="09"
        title="QR en Smartlead — 3 variantes"
        subtitle="La plantilla 559 (Brevo) no se porta tal cual"
        accentColor="emerald"
        intro={<>El Branch link y el QR apuntan al mismo destino: ambos cuentan como "click" en Branch. <strong>El QR NO es obligatorio</strong> para medir clicks. 3 variantes propuestas: T (texto plano, recomendada), H (HTML + QR mini) y Q (solo QR, descartada).</>}
      >
        <QrVariants />
      </Chapter>

      {/* Capítulo 10 — Preguntas abiertas */}
      <Chapter
        number="10"
        title="Preguntas abiertas"
        subtitle="Pendientes para alineación con el equipo"
        accentColor="amber"
      >
        <OpenQuestions />
      </Chapter>

      {/* Capítulo 11 — Referencias */}
      <Chapter
        number="11"
        title="Referencias"
        subtitle="Archivos internos · docs relacionados · best practices 2026"
        accentColor="purple"
      >
        <ReferencesList />
      </Chapter>

      {/* Conclusión */}
      <section className="py-16 bg-[#0B1120] text-white relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1120] via-[#0B1120] to-[#0F52BA]/20" />
        <div className="relative max-w-5xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold">Decisión sugerida</h2>
          <div className="mt-8 bg-white/5 backdrop-blur rounded-lg p-6 border-l-4 border-[#F59E0B] border-t border-r border-b border-white/10">
            <p className="text-lg leading-relaxed text-slate-200">
              <strong className="text-white">Ruta recomendada:</strong> ejecutar <strong className="text-[#F59E0B]">Plan C primero</strong> (4 días, $50, baseline con 4 inboxes × 50 envíos).
              Con data Día 4: <strong className="text-[#F59E0B]">GO → Plan B</strong> si el objetivo es maximizar clicks en abril, o <strong className="text-[#F59E0B]">GO → Plan A</strong> si se prioriza sostenibilidad + data comparativa Brevo vs Smartlead para mayo.
              Los dominios Brevo (elevn.me, elevnpro.me) deben pausarse <strong className="text-white">4-6 semanas mínimo</strong> y regresar solo con warm opt-in.
            </p>
          </div>
          <p className="text-sm text-slate-400 mt-8">
            Documento fuente: <code className="bg-white/5 px-1 rounded">diagnostico-y-planes_2026-04-18.md</code> · Actualizado: {META.updated} · Próxima revisión: después de Plan C (24-abr) o decisión de plan.
          </p>
        </div>
      </section>
    </div>
  )
}

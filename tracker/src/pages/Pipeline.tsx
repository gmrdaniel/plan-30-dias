import { Link } from 'react-router-dom'
import { ArrowDown, CheckCircle2, Zap, Mail, XCircle, Database, Search, BarChart3, Bot, UserRound, Unplug, RefreshCw } from 'lucide-react'

interface PipelineStep {
  id: string
  label: string
  detail: string
  tools: { name: string; role: string; auto: boolean }[]
  syncs: { target: string; method: string; auto: boolean }[]
  task: string
  gaps?: string[]
  dayRange?: string
}

interface PhaseData {
  id: string
  title: string
  subtitle: string
  icon: typeof Search
  color: string
  bgColor: string
  when: string
  who: string
  steps: PipelineStep[]
}

const PHASES: PhaseData[] = [
  {
    id: 'fase0',
    title: 'Fase 0: Búsqueda',
    subtitle: 'Encontrar marcas que encajan con el ICP',
    icon: Search,
    color: 'text-gray-700',
    bgColor: 'bg-gray-100 border-gray-300',
    when: 'Semana 1 (T06) — se configura una vez',
    who: 'Gabriel (SmartScout / Apify)',
    steps: [
      {
        id: 'f0s1',
        label: 'Buscar vendedores Amazon sin video ads',
        detail: 'SmartScout UI: filtrar por categoría, revenue >$500K/año, Sponsored Video Win Rate = 0%',
        tools: [{ name: 'SmartScout', role: 'Filtrar marcas Amazon', auto: false }],
        syncs: [{ target: 'CSV', method: 'Export manual', auto: false }],
        task: 'T06',
      },
      {
        id: 'f0s2',
        label: 'Scraping marcas Shopify / Meta Ads',
        detail: 'Apify actors: Meta Ads Library (marcas con ads sin video) + Shopify store scraper (DTC no-Amazon)',
        tools: [{ name: 'Apify', role: 'Scraping web', auto: true }],
        syncs: [{ target: 'CSV', method: 'Export', auto: true }],
        task: 'T06',
      },
      {
        id: 'f0s3',
        label: 'Importar CSVs a Clay',
        detail: 'Upload manual de CSVs de SmartScout + Apify. Deduplicar por dominio/empresa. ~1,200 rows raw.',
        tools: [{ name: 'Clay', role: 'Hub de enriquecimiento', auto: false }],
        syncs: [],
        task: 'T06',
      },
    ],
  },
  {
    id: 'fase1',
    title: 'Fase 1: Enriquecimiento',
    subtitle: 'Conseguir email, LinkedIn y score de cada marca',
    icon: Database,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-300',
    when: 'Semana 1 (T11) — batches de 200',
    who: 'Clay (automático)',
    steps: [
      {
        id: 'f1s1',
        label: 'Email cascade: Prospeo → Hunter → LeadIQ',
        detail: 'Waterfall nativo de Clay. Prueba 3 providers en orden. Target: 80% fill rate. ~1-3 créditos/fila.',
        tools: [{ name: 'Clay', role: 'Cascade email', auto: true }],
        syncs: [],
        task: 'T11',
      },
      {
        id: 'f1s2',
        label: 'Email validation: ZeroBounce',
        detail: 'Verificar que el email encontrado es válido. Target: <5% bounce rate.',
        tools: [{ name: 'Clay', role: 'Validación', auto: true }],
        syncs: [],
        task: 'T11',
      },
      {
        id: 'f1s3',
        label: 'LinkedIn lookup',
        detail: 'Buscar perfil LinkedIn + cargo del tomador de decisión. Target: 70% fill rate.',
        tools: [{ name: 'Clay', role: 'LinkedIn enrichment', auto: true }],
        syncs: [],
        task: 'T11',
      },
      {
        id: 'f1s4',
        label: 'AI Score + Video Gap Score',
        detail: 'Sculptor genera icp_score (1-10). Video gap se calcula de datos SmartScout (fórmula, 0 créditos).',
        tools: [{ name: 'Clay Sculptor', role: 'Scoring IA', auto: true }],
        syncs: [],
        task: 'T11',
      },
    ],
  },
  {
    id: 'fase2',
    title: 'Fase 2: Distribución',
    subtitle: 'Mandar prospectos a las herramientas de outreach',
    icon: Zap,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50 border-purple-300',
    when: 'Semana 1-2 (T06/T07) — automático o manual según plan Clay',
    who: 'Clay exports + Gabriel/Dayana config',
    steps: [
      {
        id: 'f2s1',
        label: 'Clay → Smartlead (prospectos con email válido)',
        detail: 'Con Launch ($185): export nativo. Con Starter ($149): CSV manual. Campaña pre-creada en Smartlead.',
        tools: [
          { name: 'Clay', role: 'Export', auto: true },
          { name: 'Smartlead', role: 'Secuencia email', auto: true },
        ],
        syncs: [{ target: 'HubSpot', method: 'Smartlead webhook', auto: true }],
        task: 'T07',
      },
      {
        id: 'f2s2',
        label: 'HubSpot ↔ Expandi (prospectos con LinkedIn)',
        detail: 'Expandi syncea desde HubSpot (integración nativa bidireccional). Dayana importa a campaña Expandi en batches de 10.',
        tools: [
          { name: 'HubSpot', role: 'Hub central', auto: true },
          { name: 'Expandi', role: 'Secuencia LinkedIn', auto: false },
        ],
        syncs: [{ target: 'HubSpot', method: 'Expandi sync nativo', auto: true }],
        task: 'T07',
      },
      {
        id: 'f2s3',
        label: 'Clay → Supabase (respaldo)',
        detail: 'Con Growth ($495): webhook automático. Con Launch/Starter: script Python de Gabriel.',
        tools: [{ name: 'Clay', role: 'Fuente', auto: false }],
        syncs: [{ target: 'Supabase', method: 'Script Python o webhook', auto: false }],
        task: 'T11-B',
      },
    ],
  },
  {
    id: 'fase3',
    title: 'Fase 3: Secuencia 21 días',
    subtitle: 'Contactar al prospecto por múltiples canales',
    icon: Mail,
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50 border-indigo-300',
    when: 'Semana 3+ (Día 17 en adelante) — corre sola',
    who: 'Smartlead / Expandi / Twilio / ManyChat (automático)',
    steps: [
      {
        id: 'f3d1',
        label: 'Día 1: Email #1 — Auditoría de video',
        detail: 'Smartlead envía. Tracking: open, click. Si responde → Fase 4.',
        tools: [{ name: 'Smartlead', role: 'Envío email', auto: true }],
        syncs: [{ target: 'HubSpot', method: 'Webhook (open/click/reply)', auto: true }],
        task: 'T07',
        dayRange: 'Día 1',
      },
      {
        id: 'f3d4',
        label: 'Día 4: LinkedIn — Solicitud de conexión',
        detail: 'Expandi envía conexión + nota mencionando el email. Si acepta y responde → Fase 4.',
        tools: [{ name: 'Expandi', role: 'LinkedIn outreach', auto: true }],
        syncs: [{ target: 'HubSpot', method: 'Expandi sync nativo', auto: true }],
        task: 'T07',
        dayRange: 'Día 4',
        gaps: ['G2'],
      },
      {
        id: 'f3d5',
        label: 'Día 5: Email #2 — Seguimiento corto',
        detail: 'Smartlead envía follow-up directo. Si responde → Fase 4.',
        tools: [{ name: 'Smartlead', role: 'Envío email', auto: true }],
        syncs: [{ target: 'HubSpot', method: 'Webhook', auto: true }],
        task: 'T07',
        dayRange: 'Día 5',
      },
      {
        id: 'f3d7',
        label: 'Día 7: Voicemail + SMS',
        detail: 'Slybroadcast: buzón de voz sin timbre. Twilio: SMS con link a auditoría.',
        tools: [
          { name: 'Slybroadcast', role: 'Voicemail', auto: true },
          { name: 'Twilio', role: 'SMS', auto: true },
        ],
        syncs: [{ target: 'HubSpot', method: 'Twilio sí, Slybroadcast NO', auto: false }],
        task: 'T10',
        dayRange: 'Día 7',
        gaps: ['G1'],
      },
      {
        id: 'f3d10',
        label: 'Día 10: LinkedIn — Engagement',
        detail: 'Expandi: like/comment en post del prospecto. Solo engagement, no mensaje directo.',
        tools: [{ name: 'Expandi', role: 'Engagement', auto: true }],
        syncs: [{ target: 'HubSpot', method: 'Log actividad', auto: true }],
        task: 'T07',
        dayRange: 'Día 10',
      },
      {
        id: 'f3d12',
        label: 'Día 12: Email #3 — Caso de estudio + competidor',
        detail: 'Smartlead envía con datos de competidor (de SmartScout/Clay). FOMO competitivo.',
        tools: [{ name: 'Smartlead', role: 'Envío email', auto: true }],
        syncs: [{ target: 'HubSpot', method: 'Webhook', auto: true }],
        task: 'T07',
        dayRange: 'Día 12',
      },
      {
        id: 'f3d15',
        label: 'Día 15: WhatsApp nota de voz (solo LatAm)',
        detail: 'ManyChat + ElevenLabs: nota de voz IA <60s. SOLO prospectos en México/LATAM.',
        tools: [
          { name: 'ManyChat', role: 'WhatsApp', auto: true },
          { name: 'ElevenLabs', role: 'Voz IA', auto: true },
        ],
        syncs: [{ target: 'HubSpot', method: 'ManyChat → HubSpot', auto: true }],
        task: 'T08',
        dayRange: 'Día 15',
        gaps: ['G6'],
      },
      {
        id: 'f3d18',
        label: 'Día 18: Llamada directa',
        detail: 'JustCall: llamada 4-5 PM hora del prospecto. Solo prospectos que abrieron emails o vieron video.',
        tools: [{ name: 'JustCall', role: 'Llamada', auto: false }],
        syncs: [{ target: 'HubSpot', method: 'JustCall nativo', auto: true }],
        task: 'T07',
        dayRange: 'Día 18',
      },
      {
        id: 'f3d21',
        label: 'Día 21: Email #4 — Breakup',
        detail: 'Smartlead envía último email. Baja presión. Si responde → Fase 4. Si no → Fase 5.',
        tools: [{ name: 'Smartlead', role: 'Envío email', auto: true }],
        syncs: [{ target: 'HubSpot', method: 'Webhook', auto: true }],
        task: 'T07',
        dayRange: 'Día 21',
        gaps: ['G3', 'G5'],
      },
    ],
  },
  {
    id: 'fase4',
    title: 'Fase 4: Respuesta positiva',
    subtitle: 'El prospecto contestó — ventas actúa',
    icon: CheckCircle2,
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-300',
    when: 'Cualquier momento durante los 21 días',
    who: 'Vendedor (Equipo 1) — acción manual',
    steps: [
      {
        id: 'f4s1',
        label: 'Herramienta detecta reply → HubSpot actualiza',
        detail: 'Smartlead/Expandi/ManyChat/Twilio reportan el reply a HubSpot. Pipeline cambia a "Respondido".',
        tools: [{ name: 'HubSpot', role: 'Actualiza status', auto: true }],
        syncs: [{ target: 'Telegram', method: 'Relay.app detecta cambio → notifica', auto: true }],
        task: 'T03',
      },
      {
        id: 'f4s2',
        label: 'Secuencias se cancelan',
        detail: 'Smartlead pausa emails. Expandi debería pausar LinkedIn (verificar G2/G3).',
        tools: [
          { name: 'Smartlead', role: 'Pausa secuencia', auto: true },
          { name: 'Expandi', role: 'Pausa secuencia', auto: false },
        ],
        syncs: [],
        task: 'T07',
        gaps: ['G2', 'G3'],
      },
      {
        id: 'f4s3',
        label: 'Vendedor responde en <1 hora',
        detail: 'Usa Sendspark (video personalizado) + micrositio Unbounce. Agenda Sprint Estratégico 15 min.',
        tools: [
          { name: 'Sendspark', role: 'Video personalizado', auto: false },
          { name: 'Unbounce', role: 'Micrositio', auto: false },
        ],
        syncs: [{ target: 'HubSpot', method: 'Etapa → Reunión', auto: false }],
        task: 'T16',
      },
    ],
  },
  {
    id: 'fase5',
    title: 'Fase 5: Sin respuesta → Nurture',
    subtitle: 'No contestó en 21 días — lista pasiva',
    icon: XCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 border-gray-300',
    when: 'Día 21+ sin respuesta',
    who: 'Automático (HubSpot workflow)',
    steps: [
      {
        id: 'f5s1',
        label: 'Smartlead marca como "Unresponsive"',
        detail: 'Después del Email #4 breakup sin respuesta. Status → Sin respuesta.',
        tools: [{ name: 'Smartlead', role: 'Marca status', auto: true }],
        syncs: [{ target: 'HubSpot', method: 'Webhook status change', auto: true }],
        task: 'T18',
        gaps: ['G5'],
      },
      {
        id: 'f5s2',
        label: 'Mover a lista Nurture',
        detail: 'HubSpot workflow: si status = "Sin respuesta" → mover a lista Nurture. Solo boletines mensuales.',
        tools: [{ name: 'HubSpot', role: 'Workflow automático', auto: true }],
        syncs: [{ target: 'Supabase', method: 'Actualizar status', auto: false }],
        task: 'T18',
      },
    ],
  },
]

export default function Pipeline() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 size={24} /> Pipeline B2B: Vida de un prospecto
        </h1>
        <p className="text-gray-500 text-sm">Desde la búsqueda hasta el cierre o nurture — flujo completo con herramientas</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-5 text-xs bg-white border rounded-lg p-3 mb-4">
        <span className="flex items-center gap-1.5"><Bot size={14} className="text-green-600" /> Automático</span>
        <span className="flex items-center gap-1.5"><UserRound size={14} className="text-amber-600" /> Manual</span>
        <span className="flex items-center gap-1.5"><Unplug size={14} className="text-red-500" /> No conectado / Gap</span>
        <span className="flex items-center gap-1.5"><RefreshCw size={14} className="text-blue-500" /> Sync a otro sistema</span>
      </div>

      {PHASES.map((phase, pi) => (
        <div key={phase.id}>
          {/* Phase header */}
          <div className={`border-2 rounded-xl p-4 ${phase.bgColor}`}>
            <div className="flex items-start gap-3">
              <phase.icon size={22} className={`${phase.color} shrink-0 mt-0.5`} />
              <div className="flex-1">
                <h2 className={`text-lg font-bold ${phase.color}`}>{phase.title}</h2>
                <p className="text-sm text-gray-600">{phase.subtitle}</p>
                <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                  <span><strong>Cuándo:</strong> {phase.when}</span>
                  <span><strong>Ejecuta:</strong> {phase.who}</span>
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="mt-4 space-y-2">
              {phase.steps.map((step) => (
                <div key={step.id} className="bg-white rounded-lg border p-3">
                  <div className="flex items-start gap-2">
                    {step.dayRange && (
                      <span className="text-xs font-mono font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded shrink-0">
                        {step.dayRange}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{step.label}</div>
                      <p className="text-xs text-gray-500 mt-0.5">{step.detail}</p>

                      {/* Tools */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {step.tools.map((t, i) => (
                          <span key={i} className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${
                            t.auto ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {t.auto ? <Bot size={12} /> : <UserRound size={12} />}
                            {t.name}: {t.role}
                          </span>
                        ))}
                        {step.syncs.map((s, i) => (
                          <span key={`s${i}`} className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${
                            s.auto ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-600 border-gray-200'
                          }`}>
                            <RefreshCw size={12} />
                            {s.target} ({s.method})
                          </span>
                        ))}
                      </div>

                      {/* Gaps */}
                      {step.gaps && step.gaps.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {step.gaps.map((g) => (
                            <Link key={g} to="/blockers" className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full border border-red-200 hover:bg-red-200">
                              <Unplug size={12} /> {g}
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Task link */}
                      <div className="mt-1">
                        <Link to={`/task/${step.task}`} className="text-xs text-indigo-500 hover:text-indigo-700 underline">
                          {step.task}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Arrow between phases */}
          {pi < PHASES.length - 1 && (
            <div className="flex justify-center py-2">
              <ArrowDown size={20} className="text-gray-300" />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

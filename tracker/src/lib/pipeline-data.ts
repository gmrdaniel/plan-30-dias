export interface PipelineStep {
  id: string
  label: string
  detail: string
  tools: { name: string; role: string; auto: boolean }[]
  syncs: { target: string; method: string; auto: boolean }[]
  task: string
  gaps?: string[]
  dayRange?: string
}

export interface PhaseData {
  id: string
  title: string
  subtitle: string
  iconName: 'Search' | 'Database' | 'Zap' | 'Mail' | 'CheckCircle2' | 'XCircle'
  color: string
  bgColor: string
  when: string
  who: string
  steps: PipelineStep[]
}

export const B2B_PHASES: PhaseData[] = [
  {
    id: 'fase0',
    title: 'Fase 0: Búsqueda',
    subtitle: 'Encontrar marcas que encajan con el ICP',
    iconName: 'Search',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100 border-gray-300',
    when: 'Semana 1 (T06) — se configura una vez',
    who: 'Gabriel (SmartScout / Apify)',
    steps: [
      {
        id: 'f0s1', label: 'Buscar vendedores Amazon sin video ads',
        detail: 'SmartScout UI: filtrar por categoría, revenue >$500K/año, Sponsored Video Win Rate = 0%',
        tools: [{ name: 'SmartScout', role: 'Filtrar marcas Amazon', auto: false }],
        syncs: [{ target: 'CSV', method: 'Export manual', auto: false }],
        task: 'T06',
      },
      {
        id: 'f0s2', label: 'Scraping marcas Shopify / Meta Ads',
        detail: 'Apify actors: Meta Ads Library + Shopify store scraper',
        tools: [{ name: 'Apify', role: 'Scraping web', auto: true }],
        syncs: [{ target: 'CSV', method: 'Export', auto: true }],
        task: 'T06',
      },
      {
        id: 'f0s3', label: 'Importar CSVs a Clay',
        detail: 'Upload manual. Deduplicar por dominio/empresa. ~1,200 rows raw.',
        tools: [{ name: 'Clay', role: 'Hub de enriquecimiento', auto: false }],
        syncs: [], task: 'T06',
      },
    ],
  },
  {
    id: 'fase1',
    title: 'Fase 1: Enriquecimiento',
    subtitle: 'Conseguir email, LinkedIn y score de cada marca',
    iconName: 'Database',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-300',
    when: 'Semana 1 (T11) — batches de 200',
    who: 'Clay (automático)',
    steps: [
      { id: 'f1s1', label: 'Email cascade: Prospeo → Hunter → LeadIQ', detail: 'Waterfall nativo. Target: 80% fill rate. ~1-3 créditos/fila.', tools: [{ name: 'Clay', role: 'Cascade email', auto: true }], syncs: [], task: 'T11' },
      { id: 'f1s2', label: 'Email validation: ZeroBounce', detail: 'Verificar email válido. Target: <5% bounce.', tools: [{ name: 'Clay', role: 'Validación', auto: true }], syncs: [], task: 'T11' },
      { id: 'f1s3', label: 'LinkedIn lookup', detail: 'Perfil LinkedIn + cargo. Target: 70% fill rate.', tools: [{ name: 'Clay', role: 'LinkedIn enrichment', auto: true }], syncs: [], task: 'T11' },
      { id: 'f1s4', label: 'AI Score + Video Gap Score', detail: 'Sculptor: icp_score (1-10). Video gap de SmartScout (fórmula, 0 créditos).', tools: [{ name: 'Clay Sculptor', role: 'Scoring IA', auto: true }], syncs: [], task: 'T11' },
    ],
  },
  {
    id: 'fase2',
    title: 'Fase 2: Distribución',
    subtitle: 'Mandar prospectos a herramientas de outreach',
    iconName: 'Zap',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50 border-purple-300',
    when: 'Semana 1-2 (T06/T07)',
    who: 'Clay exports + Gabriel/Dayana config',
    steps: [
      { id: 'f2s1', label: 'Clay → Smartlead (email válido)', detail: 'Launch ($185): nativo. Starter ($149): CSV manual.', tools: [{ name: 'Clay', role: 'Export', auto: true }, { name: 'Smartlead', role: 'Secuencia email', auto: true }], syncs: [{ target: 'HubSpot', method: 'Smartlead webhook', auto: true }], task: 'T07' },
      { id: 'f2s2', label: 'HubSpot ↔ Expandi (LinkedIn)', detail: 'Expandi syncea desde HubSpot (nativo bidireccional). Dayana importa en batches de 10.', tools: [{ name: 'HubSpot', role: 'Hub central', auto: true }, { name: 'Expandi', role: 'Secuencia LinkedIn', auto: false }], syncs: [{ target: 'HubSpot', method: 'Expandi sync nativo', auto: true }], task: 'T07' },
      { id: 'f2s3', label: 'Clay → Supabase (respaldo)', detail: 'Growth ($495): webhook. Otros: script Python.', tools: [{ name: 'Clay', role: 'Fuente', auto: false }], syncs: [{ target: 'Supabase', method: 'Script Python o webhook', auto: false }], task: 'T11-B' },
    ],
  },
  {
    id: 'fase3',
    title: 'Fase 3: Secuencia 21 días',
    subtitle: 'Contactar al prospecto por múltiples canales',
    iconName: 'Mail',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50 border-indigo-300',
    when: 'Semana 3+ (Día 17 en adelante) — corre sola',
    who: 'Smartlead / Expandi / Twilio / ManyChat (automático)',
    steps: [
      { id: 'f3d1', label: 'Día 1: Email #1 — Auditoría de video', detail: 'Smartlead envía. Tracking: open, click. Si responde → Fase 4.', tools: [{ name: 'Smartlead', role: 'Envío email', auto: true }], syncs: [{ target: 'HubSpot', method: 'Webhook (open/click/reply)', auto: true }], task: 'T07', dayRange: 'Día 1' },
      { id: 'f3d4', label: 'Día 4: LinkedIn — Solicitud de conexión', detail: 'Expandi envía conexión + nota. Si acepta y responde → Fase 4.', tools: [{ name: 'Expandi', role: 'LinkedIn outreach', auto: true }], syncs: [{ target: 'HubSpot', method: 'Expandi sync nativo', auto: true }], task: 'T07', dayRange: 'Día 4', gaps: ['G2'] },
      { id: 'f3d5', label: 'Día 5: Email #2 — Seguimiento corto', detail: 'Smartlead follow-up. Si responde → Fase 4.', tools: [{ name: 'Smartlead', role: 'Envío email', auto: true }], syncs: [{ target: 'HubSpot', method: 'Webhook', auto: true }], task: 'T07', dayRange: 'Día 5' },
      { id: 'f3d7', label: 'Día 7: Voicemail + SMS', detail: 'Slybroadcast: buzón de voz. Twilio: SMS con link.', tools: [{ name: 'Slybroadcast', role: 'Voicemail', auto: true }, { name: 'Twilio', role: 'SMS', auto: true }], syncs: [{ target: 'HubSpot', method: 'Twilio sí, Slybroadcast NO', auto: false }], task: 'T10', dayRange: 'Día 7', gaps: ['G1'] },
      { id: 'f3d10', label: 'Día 10: LinkedIn — Engagement', detail: 'Like/comment en post del prospecto.', tools: [{ name: 'Expandi', role: 'Engagement', auto: true }], syncs: [{ target: 'HubSpot', method: 'Log actividad', auto: true }], task: 'T07', dayRange: 'Día 10' },
      { id: 'f3d12', label: 'Día 12: Email #3 — Caso de estudio', detail: 'Smartlead con datos de competidor. FOMO competitivo.', tools: [{ name: 'Smartlead', role: 'Envío email', auto: true }], syncs: [{ target: 'HubSpot', method: 'Webhook', auto: true }], task: 'T07', dayRange: 'Día 12' },
      { id: 'f3d15', label: 'Día 15: WhatsApp nota de voz (solo LatAm)', detail: 'ManyChat + ElevenLabs: voz IA <60s. SOLO México/LATAM.', tools: [{ name: 'ManyChat', role: 'WhatsApp', auto: true }, { name: 'ElevenLabs', role: 'Voz IA', auto: true }], syncs: [{ target: 'HubSpot', method: 'ManyChat → HubSpot', auto: true }], task: 'T08', dayRange: 'Día 15', gaps: ['G6'] },
      { id: 'f3d18', label: 'Día 18: Llamada directa', detail: 'JustCall 4-5 PM. Solo prospectos que abrieron emails.', tools: [{ name: 'JustCall', role: 'Llamada', auto: false }], syncs: [{ target: 'HubSpot', method: 'JustCall nativo', auto: true }], task: 'T07', dayRange: 'Día 18' },
      { id: 'f3d21', label: 'Día 21: Email #4 — Breakup', detail: 'Último email. Si responde → Fase 4. Si no → Fase 5.', tools: [{ name: 'Smartlead', role: 'Envío email', auto: true }], syncs: [{ target: 'HubSpot', method: 'Webhook', auto: true }], task: 'T07', dayRange: 'Día 21', gaps: ['G3', 'G5'] },
    ],
  },
  {
    id: 'fase4',
    title: 'Fase 4: Respuesta positiva',
    subtitle: 'El prospecto contestó — ventas actúa',
    iconName: 'CheckCircle2',
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-300',
    when: 'Cualquier momento durante los 21 días',
    who: 'Vendedor (Equipo 1) — acción manual',
    steps: [
      { id: 'f4s1', label: 'Herramienta detecta reply → HubSpot actualiza', detail: 'Pipeline cambia a "Respondido". Relay.app → Telegram.', tools: [{ name: 'HubSpot', role: 'Actualiza status', auto: true }], syncs: [{ target: 'Telegram', method: 'Relay.app detecta cambio', auto: true }], task: 'T03' },
      { id: 'f4s2', label: 'Secuencias se cancelan', detail: 'Smartlead pausa emails. Expandi debería pausar (verificar G2/G3).', tools: [{ name: 'Smartlead', role: 'Pausa', auto: true }, { name: 'Expandi', role: 'Pausa', auto: false }], syncs: [], task: 'T07', gaps: ['G2', 'G3'] },
      { id: 'f4s3', label: 'Vendedor responde en <1 hora', detail: 'Sendspark (video) + Unbounce (micrositio). Agenda Sprint 15 min.', tools: [{ name: 'Sendspark', role: 'Video personalizado', auto: false }, { name: 'Unbounce', role: 'Micrositio', auto: false }], syncs: [{ target: 'HubSpot', method: 'Etapa → Reunión', auto: false }], task: 'T16' },
    ],
  },
  {
    id: 'fase5',
    title: 'Fase 5: Sin respuesta → Nurture',
    subtitle: 'No contestó en 21 días — lista pasiva',
    iconName: 'XCircle',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 border-gray-300',
    when: 'Día 21+ sin respuesta',
    who: 'Automático (HubSpot workflow)',
    steps: [
      { id: 'f5s1', label: 'Smartlead marca "Unresponsive"', detail: 'Status → Sin respuesta. Webhook a HubSpot.', tools: [{ name: 'Smartlead', role: 'Marca status', auto: true }], syncs: [{ target: 'HubSpot', method: 'Webhook status change', auto: true }], task: 'T18', gaps: ['G5'] },
      { id: 'f5s2', label: 'Mover a lista Nurture', detail: 'HubSpot workflow: status = Sin respuesta → lista Nurture. Solo boletines.', tools: [{ name: 'HubSpot', role: 'Workflow automático', auto: true }], syncs: [{ target: 'Supabase', method: 'Actualizar status', auto: false }], task: 'T18' },
    ],
  },
]

export const CREATOR_PHASES: PhaseData[] = [
  {
    id: 'cfase0',
    title: 'Fase 0: Búsqueda',
    subtitle: 'Identificar creadores que encajan con el ICP',
    iconName: 'Search',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100 border-gray-300',
    when: 'Semana 1 (T06/T10) — se configura una vez',
    who: 'Gabriel (Social Blade) + Dayana (Instagram)',
    steps: [
      { id: 'cf0s1', label: 'Buscar creadores YouTube/TikTok', detail: 'Social Blade API: filtrar por suscriptores >10K, idioma español/inglés, categorías del ICP (Gaming, Lifestyle, Tech).', tools: [{ name: 'Social Blade', role: 'Analytics creadores', auto: true }], syncs: [{ target: 'CSV', method: 'Export', auto: true }], task: 'T10' },
      { id: 'cf0s2', label: 'Lead magnets inbound', detail: 'Calculadora de ingresos (Outgrow) + micrositio Leadpages capturan creadores autoidentificados.', tools: [{ name: 'Outgrow', role: 'Calculadora interactiva', auto: true }, { name: 'Leadpages', role: 'Micrositio creadores', auto: true }], syncs: [{ target: 'HubSpot', method: 'Form submission', auto: true }], task: 'T16' },
      { id: 'cf0s3', label: 'Importar a Clay + enriquecer', detail: 'CSV de Social Blade → Clay. Enriquecer con datos de IG/TT (followers, engagement, bio).', tools: [{ name: 'Clay', role: 'Enriquecimiento', auto: true }], syncs: [], task: 'T06' },
    ],
  },
  {
    id: 'cfase1',
    title: 'Fase 1: Enriquecimiento',
    subtitle: 'Completar perfil del creador con datos sociales',
    iconName: 'Database',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-300',
    when: 'Semana 1-2 — automático en Clay',
    who: 'Clay (automático)',
    steps: [
      { id: 'cf1s1', label: 'Enrichment IG/TT: followers, engagement, bio', detail: 'Clay enrichment con datos de Instagram y TikTok via API o scraping.', tools: [{ name: 'Clay', role: 'Enrichment social', auto: true }], syncs: [], task: 'T11' },
      { id: 'cf1s2', label: 'Email discovery', detail: 'Buscar email del creador (bio de IG, sitio web, cascade).', tools: [{ name: 'Clay', role: 'Email cascade', auto: true }], syncs: [], task: 'T11' },
      { id: 'cf1s3', label: 'Scoring de creador', detail: 'Score basado en: suscriptores, engagement, idioma, categoría. Target: cualificados >10K subs y >$500/mes.', tools: [{ name: 'Clay Sculptor', role: 'Scoring IA', auto: true }], syncs: [], task: 'T11' },
    ],
  },
  {
    id: 'cfase2',
    title: 'Fase 2: Distribución',
    subtitle: 'Enviar creadores a ManyChat y registrar en HubSpot',
    iconName: 'Zap',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50 border-purple-300',
    when: 'Semana 2 (T08/T12)',
    who: 'Dayana (ManyChat) + Gabriel (Supabase)',
    steps: [
      { id: 'cf2s1', label: 'Instagram DM → ManyChat trigger', detail: 'Creador interactúa con hashtag/contenido → ManyChat dispara DM automático con video 15s.', tools: [{ name: 'ManyChat', role: 'DM automático', auto: true }, { name: 'Instagram', role: 'Trigger', auto: true }], syncs: [], task: 'T08' },
      { id: 'cf2s2', label: 'ManyChat → HubSpot (pipeline Creadores)', detail: 'Creador que entra al flujo se registra en HubSpot pipeline Creadores.', tools: [{ name: 'ManyChat', role: 'Webhook', auto: true }], syncs: [{ target: 'HubSpot', method: 'Relay/Zapier', auto: true }], task: 'T12' },
      { id: 'cf2s3', label: 'ManyChat → Supabase (registro)', detail: 'Webhook ManyChat → Edge Function. Crea registro en creator_inventory + creator_lists.', tools: [{ name: 'ManyChat', role: 'Webhook', auto: true }], syncs: [{ target: 'Supabase', method: 'Edge Function', auto: true }], task: 'T12' },
    ],
  },
  {
    id: 'cfase3',
    title: 'Fase 3: Secuencia 7 días',
    subtitle: 'Cualificar creador por canales móviles',
    iconName: 'Mail',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50 border-indigo-300',
    when: 'Semana 3+ — corre sola por creador',
    who: 'ManyChat / Twilio / ElevenLabs (automático)',
    steps: [
      { id: 'cf3d1', label: 'Día 1: Instagram DM — Video 15s', detail: 'ManyChat envía DM con video personalizado mostrando cuánto dinero pierde el creador. Branch.io deep link → WhatsApp.', tools: [{ name: 'ManyChat', role: 'IG DM', auto: true }, { name: 'Branch.io', role: 'Deep link', auto: true }], syncs: [{ target: 'HubSpot', method: 'Log', auto: true }], task: 'T12', dayRange: 'Día 1' },
      { id: 'cf3d2', label: 'Día 2: WhatsApp — Cualificación IA (5 preguntas)', detail: 'Bot ManyChat: plataforma, suscriptores, ingresos, idioma. Si cualifica (>10K, >$500) → Fase 4. Si no → mensaje amable + link calculadora.', tools: [{ name: 'ManyChat', role: 'Bot WhatsApp', auto: true }], syncs: [{ target: 'HubSpot', method: 'Status cualificado/no', auto: true }], task: 'T12', dayRange: 'Día 2' },
      { id: 'cf3d3', label: 'Día 3: SMS — Prueba social (si no respondió WhatsApp)', detail: 'Twilio SMS con link a video testimonial 60s de creador exitoso (FOMO).', tools: [{ name: 'Twilio', role: 'SMS', auto: true }], syncs: [{ target: 'HubSpot', method: 'Log', auto: true }], task: 'T08', dayRange: 'Día 3' },
      { id: 'cf3d5', label: 'Día 5: WhatsApp — Nota de voz IA 30s', detail: 'ElevenLabs genera nota de voz personalizada. ManyChat envía por WhatsApp. Explica qué servicio le conviene.', tools: [{ name: 'ElevenLabs', role: 'Voz IA', auto: true }, { name: 'ManyChat', role: 'WhatsApp', auto: true }], syncs: [{ target: 'HubSpot', method: 'Log', auto: true }], task: 'T09', dayRange: 'Día 5' },
      { id: 'cf3d7', label: 'Día 7: Email — Proyección de ganancias + contrato', detail: 'Email HTML con proyecciones personalizadas + botón firma contrato (DocuSign/EasyLex).', tools: [{ name: 'Klaviyo', role: 'Email', auto: true }], syncs: [{ target: 'HubSpot', method: 'Email tracking', auto: true }], task: 'T09', dayRange: 'Día 7' },
    ],
  },
  {
    id: 'cfase4',
    title: 'Fase 4: Creador cualificado → Onboarding',
    subtitle: 'Creador firmó o mostró interés — asignar servicios',
    iconName: 'CheckCircle2',
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-300',
    when: 'Cualquier momento durante los 7 días',
    who: 'Equipo 2 (Creadores) — Account Manager',
    steps: [
      { id: 'cf4s1', label: 'ManyChat detecta cualificación → alerta Telegram', detail: 'Creador cumple criterios (>10K subs, >$500). HubSpot: etapa → Cualificado. Telegram #creadores-nuevos.', tools: [{ name: 'ManyChat', role: 'Detecta', auto: true }, { name: 'HubSpot', role: 'Pipeline update', auto: true }], syncs: [{ target: 'Telegram', method: 'Relay.app', auto: true }, { target: 'Supabase', method: 'creator_inventory actualizado', auto: true }], task: 'T03' },
      { id: 'cf4s2', label: 'Creador firma contrato', detail: 'Micrositio Leadpages con DocuSign. Entra a portal Elevn + Discord + WhatsApp Community.', tools: [{ name: 'Leadpages', role: 'Micrositio', auto: false }, { name: 'Discord', role: 'Comunidad', auto: false }], syncs: [{ target: 'HubSpot', method: 'Etapa → Firmado', auto: false }], task: 'T13' },
      { id: 'cf4s3', label: 'Equipo 2 recibe perfil completo', detail: 'HubSpot tiene todo el historial. Equipo 2 asigna servicios: Gyre (streaming), doblaje MLA, expansión.', tools: [{ name: 'HubSpot', role: 'Perfil completo', auto: true }], syncs: [], task: 'T02' },
    ],
  },
  {
    id: 'cfase5',
    title: 'Fase 5: Sin respuesta → Recuperación',
    subtitle: 'No respondió en 7 días — SMS de recuperación',
    iconName: 'XCircle',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 border-gray-300',
    when: 'Día 7+ sin respuesta',
    who: 'Klaviyo/Twilio (automático)',
    steps: [
      { id: 'cf5s1', label: 'SMS recuperación abandono (Klaviyo)', detail: 'Si el creador empezó onboarding en Elevn pero no completó → SMS de recuperación a las 24h.', tools: [{ name: 'Klaviyo', role: 'SMS recuperación', auto: true }], syncs: [{ target: 'HubSpot', method: 'Log', auto: true }], task: 'T09' },
      { id: 'cf5s2', label: 'Mover a lista Nurture creadores', detail: 'Si no responde después de recuperación → lista Nurture. Comunidad WhatsApp + Discord como canal pasivo.', tools: [{ name: 'HubSpot', role: 'Workflow', auto: true }], syncs: [{ target: 'Supabase', method: 'Status update', auto: false }], task: 'T18' },
    ],
  },
]

// Data extraída de: diagnostico-y-planes_2026-04-18.md
// Fuente: D:\CRM\brevo\plan-implementacion-abril-2026\hallazgos-grupo-envio\

export const META = {
  date: '2026-04-18',
  updated: '2026-04-19',
  businessObjective: 'Maximizar clicks en Branch.io (→ registros en Meta Creator Program) durante lo que resta del mes.',
  methodology: 'Validar la opinión del equipo de envíos (Ana) contra la data real de Brevo + best practices 2026 + análisis empírico.',
}

export const TL_DR = [
  {
    n: 1,
    title: 'Ana tiene razón en el diagnóstico de HB, pero NO en la solución completa',
    body: 'El colapso 15-17 abr es daño de reputación de dominio, confirmado con data Brevo directa. PERO "batches 25-50 desde los mismos dominios" no resuelve el problema de fondo: Brevo no es para cold outreach — su política suspende cuentas que hacen cold. Recovery real tarda 30-90 días, no 1-2 semanas.',
  },
  {
    n: 2,
    title: 'Tu problema de clicks NO es el QR ni la plantilla',
    body: 'El único día con clicks útiles fue Apr 13 (elevnpro.me, 2.79% CTR, 13 clicks reales). Después del daño de reputación, el CTR colapsa a ~0% porque los emails van a spam. Arreglar QR/Branch/plantilla sin arreglar deliverability es inútil.',
  },
  {
    n: 3,
    title: '9 subdominios calentados en Smartlead que no estás aprovechando',
    body: 'Smartlead es purpose-built para cold outreach (rotación automática, warmup nativo, sin suspensión por volumen). El camino de mayor retorno es correr Brevo + Smartlead en paralelo, no reemplazar uno por el otro.',
  },
]

export type ServiceStatus = 'ok' | 'warn' | 'error'
export const SERVICES: Array<{ name: string; status: ServiceStatus; detail: string }> = [
  { name: 'Brevo', status: 'ok', detail: 'daniel@laneta.com, plan activo hasta 2026-04-28, 54,082 créditos restantes' },
  { name: 'Supabase (brevo-assets)', status: 'ok', detail: 'Bucket público accesible; QRs hosteados correctamente' },
  { name: 'Supabase CRM', status: 'ok', detail: 'brevo_campaigns, brevo_creator_stats, creator_inventory — sync hasta Apr 7' },
  { name: 'Apify', status: 'ok', detail: 'User LaNeta, plan SCALE $199/mo, 128 concurrent runs, residential proxies' },
  { name: 'Branch.io', status: 'ok', detail: 'Link 3c7t6.app.link/gMMTLRC6p2b con campaign=intro_ft_v1, channel=brevo, UTMs completos' },
  { name: 'Smartlead', status: 'ok', detail: '4 campañas detectadas; API key disponible en .env.local' },
]

export const SYNC_GAP = {
  missingCampaigns: 21,
  range: 'Apr 13-17',
  file: '_campaigns_no_sincronizadas.json',
}

export const DNS_CHECK = {
  domainsChecked: 13,
  allConfigured: true,
  strictDmarc: 4,
  note: 'Todos los dominios activos + los 9 en Smartlead tienen MX, SPF, DKIM y DMARC configurados. Los 4 activos tienen DMARC p=reject (strict). La config técnica no es el problema.',
}

export type Campaign = {
  id: number
  date: string
  hour: string
  domain: string
  type: string
  sent: number
  deliv: number
  or: number
  ctr: number
  hb: number
  sb: number
  unsub: number
}

export const CAMPAIGNS_APR_13_17: Campaign[] = [
  { id: 532, date: '04-13', hour: '17:21', domain: 'elevnpro', type: 'LISTOS_10-04', sent: 500, deliv: 466, or: 46.8, ctr: 2.79, hb: 4.80, sb: 2.4, unsub: 1.07 },
  { id: 536, date: '04-14', hour: '22:03', domain: 'elevnpro', type: 'LISTOS_009', sent: 62, deliv: 33, or: 36.4, ctr: 0.00, hb: 38.71, sb: 14.5, unsub: 0.00 },
  { id: 537, date: '04-14', hour: '22:18', domain: 'elevn', type: 'LISTOS_008', sent: 250, deliv: 212, or: 43.9, ctr: 0.00, hb: 7.20, sb: 8.0, unsub: 0.00 },
  { id: 538, date: '04-14', hour: '22:37', domain: 'elevnhub', type: 'LISTOS_007', sent: 250, deliv: 219, or: 22.4, ctr: 0.00, hb: 8.40, sb: 4.8, unsub: 0.00 },
  { id: 539, date: '04-15', hour: '17:30', domain: 'elevnhub', type: 'REOPENERS_003', sent: 250, deliv: 245, or: 5.7, ctr: 0.00, hb: 0.00, sb: 2.0, unsub: 0.00 },
  { id: 540, date: '04-15', hour: '16:36', domain: 'elevnpro', type: 'LISTOS_002', sent: 250, deliv: 234, or: 13.7, ctr: 0.43, hb: 6.00, sb: 1.2, unsub: 0.43 },
  { id: 541, date: '04-15', hour: '18:49', domain: 'elevnpro', type: 'LISTOS_003', sent: 160, deliv: 153, or: 8.5, ctr: 0.00, hb: 3.75, sb: 0.6, unsub: 0.00 },
  { id: 542, date: '04-15', hour: '16:48', domain: 'elevnhub', type: 'LISTOS_004', sent: 250, deliv: 236, or: 10.2, ctr: 0.00, hb: 4.80, sb: 1.2, unsub: 0.42 },
  { id: 544, date: '04-15', hour: '18:49', domain: 'elevnhub', type: 'LISTOS_005', sent: 193, deliv: 177, or: 6.2, ctr: 1.13, hb: 7.25, sb: 1.0, unsub: 0.00 },
  { id: 548, date: '04-15', hour: '16:36', domain: 'elevn', type: 'LISTOS_006', sent: 250, deliv: 234, or: 17.1, ctr: 0.00, hb: 3.60, sb: 3.2, unsub: 0.00 },
  { id: 545, date: '04-16', hour: '14:31', domain: 'elevnpro', type: 'REOPENERS_001', sent: 226, deliv: 220, or: 5.0, ctr: 0.00, hb: 0.88, sb: 2.2, unsub: 0.00 },
  { id: 546, date: '04-16', hour: '17:30', domain: 'elevnpro', type: 'REOPENERS_002', sent: 225, deliv: 221, or: 3.2, ctr: 0.00, hb: 0.89, sb: 0.9, unsub: 0.00 },
  { id: 547, date: '04-16', hour: '14:31', domain: 'elevnhub', type: 'REOPENERS_004', sent: 227, deliv: 225, or: 3.1, ctr: 0.00, hb: 0.00, sb: 0.9, unsub: 0.00 },
  { id: 549, date: '04-16', hour: '15:01', domain: 'elevn', type: 'REOPENERS_005', sent: 221, deliv: 221, or: 5.4, ctr: 0.45, hb: 0.00, sb: 0.0, unsub: 0.00 },
  { id: 550, date: '04-16', hour: '17:30', domain: 'elevn', type: 'REOPENERS_006', sent: 232, deliv: 230, or: 5.2, ctr: 0.00, hb: 0.43, sb: 0.4, unsub: 0.00 },
  { id: 551, date: '04-17', hour: '14:03', domain: 'elevn', type: 'REOPENERS_011', sent: 244, deliv: 239, or: 2.9, ctr: 0.00, hb: 1.23, sb: 0.8, unsub: 0.00 },
  { id: 552, date: '04-17', hour: '18:04', domain: 'elevnhub', type: 'REOPENERS_010', sent: 220, deliv: 217, or: 4.1, ctr: 0.00, hb: 0.91, sb: 0.5, unsub: 0.00 },
  { id: 553, date: '04-17', hour: '14:07', domain: 'elevnhub', type: 'REOPENERS_009', sent: 228, deliv: 227, or: 3.5, ctr: 0.00, hb: 0.00, sb: 0.4, unsub: 0.00 },
  { id: 554, date: '04-17', hour: '18:04', domain: 'elevn', type: 'REOPENERS_012', sent: 150, deliv: 149, or: 2.7, ctr: 0.00, hb: 0.67, sb: 0.0, unsub: 0.00 },
  { id: 555, date: '04-17', hour: '14:09', domain: 'elevnpro', type: 'REOPENERS_007', sent: 214, deliv: 213, or: 4.2, ctr: 0.00, hb: 0.00, sb: 0.5, unsub: 0.00 },
  { id: 556, date: '04-17', hour: '18:06', domain: 'elevnpro', type: 'REOPENERS_008', sent: 240, deliv: 240, or: 2.1, ctr: 0.42, hb: 0.00, sb: 0.4, unsub: 0.00 },
]

export type HypothesisStatus = 'confirmed' | 'partial' | 'insufficient' | 'risky'
export const ANA_HYPOTHESES: Array<{ hypothesis: string; status: HypothesisStatus; evidence: string }> = [
  { hypothesis: 'Batch 62 del 14 abr (elevnpro) fue el detonador con 38.71% HB', status: 'confirmed', evidence: 'cid 536: 24/62 = 38.71% HB, 9 SB adicionales' },
  { hypothesis: 'Apr 13 elevnpro tuvo OR excelente con 500 envíos', status: 'confirmed', evidence: '46.8% OR real sobre delivered (Ana reportó 39.4% — usó opens/sent)' },
  { hypothesis: 'Caída del 15 abr es reputación, no audiencia', status: 'confirmed', evidence: 'Audiencia fresca: elevn 43.9%→17.1%, elevnpro 46.8%→13.7%, elevnhub 22.4%→10.2% en 1 día. Única variable cambiada: HB acumulado del dominio' },
  { hypothesis: 'elevnhub.me es débil históricamente', status: 'confirmed', evidence: 'Apr 14 tuvo 22.4% OR vs 43.9% de elevn.me el mismo día con misma template' },
  { hypothesis: 'Lista META_LISTOS_10-04 trae emails inválidos', status: 'confirmed', evidence: 'HB acumulado 2.38-3.89% por dominio — significativamente sobre el umbral 2%' },
  { hypothesis: 'REOPENERS_10-04 son creadores que nunca vieron estos dominios', status: 'confirmed', evidence: 'OR 2-5% confirma enrutamiento a spam, no fatiga' },
  { hypothesis: 'lanetahub.com tiene OR bajo histórico (13%)', status: 'partial', evidence: 'No se envió esta semana. Baseline Mar 18-31 del CRM DB: 8.4% OR sobre 948 sent — debajo de elevn/elevnpro pero sobre elevnhub.me' },
  { hypothesis: 'Pausar 1-2 semanas y regresar', status: 'insufficient', evidence: 'Best practices 2026: recovery de dominio con HB >3% toma 30-90 días. Mailcleanup.com y Instantly.ai coinciden' },
  { hypothesis: 'Batches 25-50 desde los mismos dominios', status: 'risky', evidence: 'Brevo suspende cuentas que hacen cold outreach. Incluso a 25/día, sigue siendo cold + shared IP = sin ventaja real vs Smartlead' },
]

export const OWN_INSIGHTS = [
  {
    n: 1,
    title: 'El click es el KPI real y se perdió con la reputación',
    body: 'Apr 13 con dominio limpio: 13 clicks en 466 delivered = 2.79% CTR (cerca del benchmark promedio 3.67% para cold). Después del daño: 0-2 clicks por campaña. La plantilla funciona. El QR funciona. Branch.io está bien configurado. El problema es 100% deliverability.',
  },
  {
    n: 2,
    title: 'Soft bounces hablan tanto como los hard',
    body: 'Apr 14 elevn cid 537: 8.0% SB. SB alto = ISP está "ablandando" la entrega antes de rechazar — señal temprana de reputación deteriorándose. Es el early warning que se ignoró.',
  },
  {
    n: 3,
    title: 'Brevo NO es el canal correcto para cold outreach',
    body: 'Documentación oficial y benchmarks 2026: "Brevo runs on shared sending infrastructure with strict anti-spam policies, where sending a cold outreach campaign through it usually results in account suspension within hours". El daño vino de dos fuentes: HB cascade y shared IP siendo flaggeada por otros clientes.',
  },
  {
    n: 4,
    title: 'DMARC p=reject amplifica el daño, no lo mitiga',
    body: 'Con HB alto y p=reject, los ISPs no tienen alternativa ("quarantine" o "none") — aplican la pena máxima. Este es un riesgo técnico que Ana no mencionó.',
  },
  {
    n: 5,
    title: 'El "warming" en Smartlead ya hecho es tu mayor activo no aprovechado',
    body: '9 subdominios con DNS correcto — listos para rotar volumen sin depender de los dominios quemados.',
  },
]

export const REOPENERS_CONTEXT = 'Los REOPENERS_10-04 provienen de la base creators.laneta.com (campañas de enero sobre Breakthrough Bonus). Nunca recibieron contacto desde elevn/elevnpro/elevnhub.me antes del 15-17 abr. Esto convierte el 15-17 abr en un experimento con variable de control casi perfecta: audiencia nueva, dominios nuevos, único factor que cambió día a día fue el historial de HB acumulado.'

export const SUBJECT_BUCKETS = [
  { bucket: 'Usado 1 sola vez', n: 16, orAvg: 16.0, orMedian: 4.7, highlight: false },
  { bucket: 'Usado 2-3 veces', n: 36, orAvg: 5.0, orMedian: 4.5, highlight: false },
  { bucket: 'Usado 4-7 veces', n: 23, orAvg: 8.4, orMedian: 8.7, highlight: false },
  { bucket: 'Usado 8-15 veces', n: 50, orAvg: 6.7, orMedian: 4.8, highlight: false },
  { bucket: 'Usado 16+ veces', n: 141, orAvg: 13.2, orMedian: 13.3, highlight: true },
]

export const TOP_SUBJECTS = [
  { subject: "Canada: your invitation to Meta's new creator program + live Q&A", uses: 50, sent: 1187, or: 16.7, ctr: 2.98, period: '2026-03-19 a 03-22' },
  { subject: "Get paid by Meta for content you've already made", uses: 24, sent: 567, or: 16.2, ctr: 0.71, period: '2026-03-29 a 04-07' },
  { subject: 'Hear it directly from Meta — live Q&A this Wednesday', uses: 18, sent: 528, or: 16.0, ctr: 1.34, period: '2026-03-23 a 03-24' },
  { subject: 'Hear it directly from Meta. Tomorrow: live Q&A.', uses: 25, sent: 750, or: 11.8, ctr: 2.44, period: '2026-03-24 a 03-25' },
  { subject: "Canada: get paid by Meta for content you've already made", uses: 10, sent: 265, or: 11.0, ctr: 1.57, period: '2026-03-31' },
  { subject: 'Hear it directly from Meta — live Q&A this Wednesday ', uses: 7, sent: 158, or: 11.0, ctr: 1.94, period: '2026-03-23' },
]

export const COUNTER_SUBJECTS = [
  { subject: "New for Canada — Meta's Fast Track creator program is here", uses: 24, sent: 2300, or: 2.3, ctr: 0.53, period: '2026-03-07 a 03-10' },
  { subject: 'Meta just launched a new creator program: $3K–$9K for your Reels', uses: 12, sent: 1493, or: 3.3, ctr: 0.41, period: '2026-03-08' },
]

export const SUBJECT_CONCLUSION = 'La hipótesis "subject repetido = OR bajo" NO se sostiene con la data. Los subjects más reutilizados (16+ veces) tienen el OR promedio más alto (13.2%). Esto sugiere selection bias positivo: los subjects que funcionan se reutilizan más. Lo que sí importa: el framing del subject ("New for Canada" 2.3% vs "Canada: your invitation" 16.7% — mismo país, distinto mensaje) y el tratamiento de placeholders sin resolver.'

export type Verdict = 'yes' | 'no' | 'conditional' | 'pause' | 'risky'
export const ACTIONS: Array<{ id: string; title: string; verdict: Verdict; short: string; detail: string }> = [
  {
    id: '3.1',
    title: 'Batches de 500 fresh (bucket 500k-1M validado)',
    verdict: 'no',
    short: 'NO desde Brevo. SÍ desde Smartlead con warmup previo.',
    detail: 'En Brevo: los dominios están quemados. Enviar 500 fresh desde elevn.me hoy = otro batch de OR <15% y sigue dañando reputación. En Smartlead: viable solo si las listas están re-verificadas (pipeline waterfall ZB+NB).',
  },
  {
    id: '3.2',
    title: 'Envío de REOPENERS',
    verdict: 'pause',
    short: 'PAUSAR 2-4 semanas; replantear el concepto.',
    detail: 'REOPENERS_10-04 vienen de un programa DIFERENTE (Breakthrough Bonus, enero). No son "warm" para Fast Track — son cold con contexto ajeno. Si se revive: sender nuevo (Smartlead) + copy que reconozca el contexto previo.',
  },
  {
    id: '3.3',
    title: 'Cambiar dirección del sender',
    verdict: 'yes',
    short: 'SÍ. Usar los 9 subdominios Smartlead.',
    detail: 'lanetahub.com: retirar (8-13% OR). elevnhub.me: pausar mínimo 6 semanas + auditar MXToolbox. elevn.me y elevnpro.me: pausar 4-6 semanas; cuando vuelvan, solo warm opt-in. Para cold activo: rotar entre los 9 subdominios Smartlead.',
  },
  {
    id: '3.4',
    title: 'Test comparativo Brevo vs Smartlead + hybrid workflow',
    verdict: 'yes',
    short: 'SÍ en paralelo, no exclusivo. Diseño híbrido disponible.',
    detail: 'Smartlead hace el cold (Brevo no puede). Brevo se usa con los que ya abrieron (audiencia auto-seleccionada = warm). Cada tool en su fortaleza.',
  },
  {
    id: '3.5',
    title: 'Ajustar plantilla para Smartlead',
    verdict: 'yes',
    short: 'SÍ, no-negociable.',
    detail: 'La plantilla 559 de Brevo (37KB HTML con Froala) no se puede portar tal cual. 3 variantes propuestas (Sección QR).',
  },
  {
    id: '3.6',
    title: 'Branch.io está bien configurado',
    verdict: 'yes',
    short: 'SÍ, con 2 ajustes menores.',
    detail: 'Ajuste 1: agregar tags por dominio/sender ([smartlead, elevngo.me, ft_c1]) para desagregar clicks por fuente. Ajuste 2: crear 3-4 Branch links separados uno por workflow step — sin esto, todos los clicks se colapsan.',
  },
  {
    id: '3.7',
    title: 'Verificador contra HBs (pipeline existente)',
    verdict: 'yes',
    short: 'SÍ. Waterfall ZeroBounce + NeverBounce.',
    detail: 'Se integra como PASO 2.5 del pipeline existente: ZB primero (granular catch-all), NB segundo (conservador). Catch-alls → 50% volumen con monitoreo 24h. Costo ~$0.012/email. No usar NB solo (accuracy real 93-97%).',
  },
  {
    id: '3.8',
    title: 'Workflow automatizado',
    verdict: 'conditional',
    short: 'Depende del plan.',
    detail: 'Plan A: workflow simple en S1, completo en S2-S3. Plan B: completo desde día 1. Plan C: sin workflow — 4 single-touch para baseline.',
  },
]

// ===== 3 PLANES =====

export type Sender = { email: string; domain: string; channel: 'Smartlead' | 'Brevo' | '—'; use: string }
export type VolumeDay = { day: string; date: string; inboxes: string; sends: number; accum: number }

export const PLAN_A = {
  id: 'A',
  name: 'Plan A — Conservador + paralelo',
  tag: 'Recomendado como default',
  recommendation: 'Ejecutar después de Plan C si el pilot sale GO. Plan A se inclina hacia la seguridad y data comparativa para mayo. Default si el objetivo es aprender qué canal funciona mejor sin arriesgar el stack.',
  objective: 'Aprovechar los dominios Smartlead ya calentados para no perder volumen durante la recuperación de Brevo. Medir con data propia cuál canal convierte mejor (clicks Branch). Recuperar elevn.me y elevnpro.me para audiencias warm en mayo.',
  senders: [
    { email: 'apply@creators.elevngo.me', domain: 'elevngo.me', channel: 'Smartlead', use: 'S1-S3 (primario)' },
    { email: 'apply@hello.elevngo.me', domain: 'elevngo.me', channel: 'Smartlead', use: 'S1-S3 (primario)' },
    { email: 'apply@hello.elevnhub.me', domain: 'elevnhub.me', channel: 'Smartlead', use: 'S1-S3' },
    { email: 'apply@go.elevnpro.me', domain: 'elevnpro.me', channel: 'Smartlead', use: 'S1-S3' },
    { email: 'join@we.elevnhub.me', domain: 'elevnhub.me', channel: 'Smartlead', use: 'S2-S3 (agregar)' },
    { email: 'join@hello.elevnpro.me', domain: 'elevnpro.me', channel: 'Smartlead', use: 'S2-S3 (agregar)' },
    { email: 'join@go.elevnhub.me', domain: 'elevnhub.me', channel: 'Smartlead', use: 'S3 (agregar)' },
    { email: 'hello@we.elevnpro.me', domain: 'elevnpro.me', channel: 'Smartlead', use: 'S3 (agregar)' },
    { email: 'join@app.elevnhub.me', domain: 'elevnhub.me', channel: 'Smartlead', use: 'reserva contingencia' },
    { email: 'apply@creators.elevn.me', domain: 'elevn.me', channel: 'Brevo', use: 'S2-S3 warm test' },
    { email: 'apply@creators.elevnpro.me', domain: 'elevnpro.me', channel: 'Brevo', use: 'S3 warm test' },
    { email: 'apply@creators.elevnhub.me', domain: 'elevnhub.me', channel: '—', use: 'PAUSADO 6 semanas' },
    { email: 'apply@creators.lanetahub.com', domain: 'lanetahub.com', channel: '—', use: 'RETIRADO (bajo OR histórico)' },
  ] satisfies Sender[],
  startDate: '2026-04-20',
  startNote: 'Lunes 20-abr (mejor día histórico — OR 41.1% promedio)',
  volume: [
    { day: 'Lun', date: '20-abr', inboxes: '4 Smartlead × 30', sends: 120, accum: 120 },
    { day: 'Mar', date: '21-abr', inboxes: '4 × 40', sends: 160, accum: 280 },
    { day: 'Mié', date: '22-abr', inboxes: '4 × 50', sends: 200, accum: 480 },
    { day: 'Jue', date: '23-abr', inboxes: '4 × 60', sends: 240, accum: 720 },
    { day: 'Vie', date: '24-abr', inboxes: '4 × 75', sends: 300, accum: 1020 },
    { day: 'Sáb-Dom', date: '25-26', inboxes: 'pausa', sends: 0, accum: 1020 },
    { day: 'Lun', date: '27-abr', inboxes: '6 × 100', sends: 600, accum: 1620 },
    { day: 'Mar', date: '28-abr', inboxes: '6 × 100 + Brevo warm 30', sends: 630, accum: 2250 },
    { day: 'Mié', date: '29-abr', inboxes: '6 × 100', sends: 600, accum: 2850 },
    { day: 'Jue', date: '30-abr', inboxes: '6 × 100', sends: 600, accum: 3450 },
    { day: 'Vie', date: '01-may', inboxes: '6 × 100', sends: 600, accum: 4050 },
    { day: 'Sáb-Dom', date: '02-03', inboxes: 'pausa', sends: 0, accum: 4050 },
    { day: 'Lun', date: '04-may', inboxes: '8 × 150 + Brevo 100', sends: 1300, accum: 5350 },
    { day: 'Mar', date: '05-may', inboxes: '8 × 150 + Brevo 100', sends: 1300, accum: 6650 },
    { day: 'Mié', date: '06-may', inboxes: '8 × 150 + Brevo 100', sends: 1300, accum: 7950 },
    { day: 'Jue', date: '07-may', inboxes: '8 × 150 + Brevo 100', sends: 1300, accum: 9250 },
    { day: 'Vie', date: '08-may', inboxes: '8 × 150 + Brevo 100', sends: 1300, accum: 10550 },
  ] satisfies VolumeDay[],
  successMetrics: [
    'CTR sostenido ≥ 2% en Smartlead (benchmark cold)',
    'Branch clicks/día ≥ 10 (vs ~1 actual)',
    'HB < 2% por dominio',
    'OR Brevo warm test ≥ 20% (validar retorno a warm)',
    'Al menos 1 conversión Meta signup atribuible a Smartlead',
  ],
  pros: [
    'Preserva data comparativa Brevo vs Smartlead',
    'Recupera Brevo para audiencia warm en mayo',
    'Riesgo bajo (hay fallback entre canales)',
  ],
  cons: [
    'Ramp lento S1 → clicks tempranos reducidos',
    'Menor volumen total vs Plan B si S3 se retrasa',
  ],
  templates: {
    smartlead: 'Variante T (texto plano) en S1. Introducir Variante H (HTML+QR) en S2 A/B test',
    brevo: 'Plantilla 559 (Brevo, ya cleaned up)',
    branchLinks: 'intro_ft_v1_smartlead_T, intro_ft_v1_smartlead_H, intro_ft_v2, friction_removal',
    subjectPrimary: "Get paid by Meta for content you've already made (OR 16.2% histórico)",
    subjectSecondary: "Your invitation to Meta's new creator program | Meta is paying creators to repost content they already have",
    workflow: 'S1: single-send baseline. S2-S3: Intro → wait 3d → ¿abrió? → Friction Removal (openers, pipeable a Brevo) / Intro v2 (non-openers)',
  },
  workflowAscii: `SEMANA 1 (baseline, sin automatización):
  Intro Fast Track Variante T → mediar OR + CTR por inbox

SEMANA 2 (workflow simple):
  Intro (T o H) → wait 3d
  → si abrió → Friction Removal (misma inbox Smartlead)
  → si no abrió → Intro v2 (otra inbox Smartlead)
  Opcional: exportar openers a Brevo FT_03_Warm_Openers

SEMANA 3 (workflow completo + hybrid):
  Smartlead: Intro (ganadora S2) → wait 3d
  → si abrió → EXPORT a Brevo FT_03_Warm_Openers
  → Brevo envía Friction Removal (plantilla 559)
  → si no abrió Smartlead → Intro v2 Smartlead

  Adicional Brevo warm: elevn.me envía a creadores ya registrados en CRM`,
  advantages: [
    'Prioriza sostenibilidad: clicks más bajos en S1 pero escalado seguro → clicks acumulados en S3 deberían alcanzar 300-400',
    'Hybrid Smartlead→Brevo maximiza CTR en openers warm (Brevo tiene mejor infra para nurturing)',
    'Reuse de subjects ganadores históricos (OR 16%+) maximiza OR → más opens → más clicks',
  ],
  sources: [
    { title: 'Landbase — Domain Reputation Warmup Guide', url: 'https://www.landbase.com/blog/domain-reputation-email-warmup-revops-guide' },
    { title: 'Instantly.ai — 2026 Benchmark', url: 'https://instantly.ai/cold-email-benchmark-report-2026' },
  ],
}

export const PLAN_B = {
  id: 'B',
  name: 'Plan B — Agresivo Smartlead-first',
  tag: 'Máximo volumen',
  recommendation: 'Ejecutar si el objetivo primario es maximizar clicks antes del cierre de abril y estás dispuesto a no usar Brevo en esta ventana. Requiere alta confianza en los 9 inboxes Smartlead. Ejecutar después de Plan C pilot si todos los inboxes pasaron el GO.',
  objective: 'Volumen máximo sobre el canal correcto (Smartlead) para llegar a la mayor cantidad de clicks Branch.io posible en las 2 semanas que quedan del mes. Brevo queda en pausa larga (4-6 semanas). Sin data comparativa con Brevo en esta ventana.',
  senders: [
    { email: 'apply@creators.elevngo.me', domain: 'elevngo.me', channel: 'Smartlead', use: 'Desde día 1' },
    { email: 'apply@hello.elevngo.me', domain: 'elevngo.me', channel: 'Smartlead', use: 'Desde día 1' },
    { email: 'apply@hello.elevnhub.me', domain: 'elevnhub.me', channel: 'Smartlead', use: 'Desde día 1' },
    { email: 'join@go.elevnhub.me', domain: 'elevnhub.me', channel: 'Smartlead', use: 'Desde día 1' },
    { email: 'join@we.elevnhub.me', domain: 'elevnhub.me', channel: 'Smartlead', use: 'Desde día 1' },
    { email: 'join@app.elevnhub.me', domain: 'elevnhub.me', channel: 'Smartlead', use: 'Desde día 1' },
    { email: 'apply@go.elevnpro.me', domain: 'elevnpro.me', channel: 'Smartlead', use: 'Desde día 1' },
    { email: 'join@hello.elevnpro.me', domain: 'elevnpro.me', channel: 'Smartlead', use: 'Desde día 1' },
    { email: 'hello@we.elevnpro.me', domain: 'elevnpro.me', channel: 'Smartlead', use: 'Desde día 1' },
    { email: 'elevn.me + elevnpro.me', domain: 'Brevo', channel: '—', use: 'PAUSADO Recovery mode' },
    { email: 'elevnhub.me + lanetahub.com', domain: 'Brevo', channel: '—', use: 'PAUSADO 6 semanas+' },
  ] satisfies Sender[],
  startDate: '2026-04-20',
  startNote: 'Lunes 20-abr-2026',
  volume: [
    { day: 'Lun', date: '20-abr', inboxes: '9 × 40', sends: 360, accum: 360 },
    { day: 'Mar', date: '21-abr', inboxes: '9 × 60', sends: 540, accum: 900 },
    { day: 'Mié', date: '22-abr', inboxes: '9 × 80', sends: 720, accum: 1620 },
    { day: 'Jue', date: '23-abr', inboxes: '9 × 100', sends: 900, accum: 2520 },
    { day: 'Vie', date: '24-abr', inboxes: '9 × 120', sends: 1080, accum: 3600 },
    { day: 'Sáb-Dom', date: '25-26', inboxes: 'pausa', sends: 0, accum: 3600 },
    { day: 'Lun', date: '27-abr', inboxes: '9 × 150', sends: 1350, accum: 4950 },
    { day: 'Mar', date: '28-abr', inboxes: '9 × 150', sends: 1350, accum: 6300 },
    { day: 'Mié', date: '29-abr', inboxes: '9 × 150', sends: 1350, accum: 7650 },
    { day: 'Jue', date: '30-abr', inboxes: '9 × 150', sends: 1350, accum: 9000 },
    { day: 'Vie', date: '01-may', inboxes: '9 × 150', sends: 1350, accum: 10350 },
  ] satisfies VolumeDay[],
  successMetrics: [
    'Clicks Branch ≥ 150 al cierre de abril',
    'HB < 1.5% promedio',
    'Pipeline de Meta signups con atribución UTM',
    'Kill switch: si cualquier inbox pasa HB >2% en Día 3 → pausar ese inbox + mantener los otros 8',
  ],
  pros: [
    'Más volumen temprano (3,600 en S1 vs 1,020 en A)',
    'Más clicks en abril (objetivo principal)',
  ],
  cons: [
    'Sin data comparativa para decidir Brevo vs Smartlead en mayo',
    'Riesgo concentrado: sin fallback Brevo',
    'No aprovecha dominios Brevo recuperables para warm',
    'Concentración en elevnhub.me (4 inboxes) = riesgo contaminación apex',
  ],
  templates: {
    smartlead: 'Solo Variante T (texto plano). Sin A/B — no hay tiempo',
    brevo: 'No aplica en ventana',
    branchLinks: 'intro_ft_v1_smartlead_T, intro_ft_v2, friction_removal',
    subjectPrimary: "Get paid by Meta for content you've already made (OR 16.2%)",
    subjectSecondary: "Your invitation to Meta's new creator program",
    workflow: 'Full 3-step desde día 1',
  },
  workflowAscii: `TRIGGER: contacto verificado (waterfall ZB+NB) entra a lista FT_00_Audiencia
   ↓
SEND: Intro Fast Track Variante T (Branch intro_ft_v1)
→ add: FT_01_Enviados
   ↓
WAIT 3 días
   ↓
¿Abrió Intro?
  NO  → SEND Intro v2 (Branch intro_ft_v2) — desde inbox distinto
        → add: FT_02a_NoOpen
  SÍ  → SEND Friction Removal (Branch friction_removal) — mismo inbox
        → add: FT_02b_Open_Intro
   ↓
WAIT 3 días
   ↓
¿Click en Branch?
  NO → FT_03_NoClick (nurture)
  SÍ → FT_03_Click_HOT (notify equipo ventas + retarget)`,
  advantages: [
    'Volumen máximo posible en la ventana = máximo techo de clicks',
    'Workflow completo desde día 1 = follow-up automático suma clicks de Friction Removal',
    'Re-targeting de clickers con retarget email suma segunda capa de clicks',
  ],
  sources: [
    { title: 'Smartlead — Improve Cold CTR', url: 'https://www.smartlead.ai/blog/cold-email-click-through-rates' },
    { title: 'Instantly.ai — Benchmarks 2026', url: 'https://instantly.ai/cold-email-benchmark-report-2026' },
  ],
}

export const PLAN_C = {
  id: 'C',
  name: 'Plan C — Mini-pilot 4 días',
  tag: 'SIEMPRE primero',
  recommendation: 'Ejecutar primero, SIEMPRE. Antes de comprometer el presupuesto y volumen de A o B, 4 días y $50 dan data dura para decidir con hechos. Debería ejecutarse la semana del 20-abr.',
  objective: 'Validar con data propia si los subdominios Smartlead rinden lo esperado antes de escalar. Detectar tempranamente contaminación apex-level (elevnhub.me) si existe. Decidir GO/NO-GO para Plan A o B.',
  senders: [
    { email: 'apply@creators.elevngo.me', domain: 'elevngo.me', channel: 'Smartlead', use: 'Lun 20' },
    { email: 'apply@go.elevnpro.me', domain: 'elevnpro.me', channel: 'Smartlead', use: 'Mar 21' },
    { email: 'apply@hello.elevngo.me', domain: 'elevngo.me', channel: 'Smartlead', use: 'Mié 22' },
    { email: 'apply@hello.elevnhub.me', domain: 'elevnhub.me', channel: 'Smartlead', use: 'Jue 23' },
  ] satisfies Sender[],
  startDate: '2026-04-20',
  startNote: 'Lunes 20-abr-2026',
  volume: [
    { day: 'Sáb-Dom', date: '18-19', inboxes: 'prep: verificación waterfall 500 contactos', sends: 0, accum: 0 },
    { day: 'Lun', date: '20-abr', inboxes: 'apply@creators.elevngo.me', sends: 50, accum: 50 },
    { day: 'Mar', date: '21-abr', inboxes: 'apply@go.elevnpro.me', sends: 50, accum: 100 },
    { day: 'Mié', date: '22-abr', inboxes: 'apply@hello.elevngo.me', sends: 50, accum: 150 },
    { day: 'Jue', date: '23-abr', inboxes: 'apply@hello.elevnhub.me', sends: 50, accum: 200 },
    { day: 'Vie', date: '24-abr', inboxes: 'análisis + decisión GO/NO-GO', sends: 0, accum: 200 },
  ] satisfies VolumeDay[],
  successMetrics: [
    'HB < 1% por inbox (validar verificación)',
    'Al menos 3-4 clicks Branch totales atribuibles al tag pilot_c',
    'OR ≥ 15% en al menos 3 de los 4 inboxes',
    'elevnhub.me inbox ≥ OR de los otros 3 (descarta contaminación apex)',
  ],
  decisionMatrix: [
    { observed: 'Los 4 inboxes HB <1% + ≥3 clicks Branch totales', decision: 'GO → Plan B (agresivo)' },
    { observed: '2-3 inboxes OK + 1 con HB alto', decision: 'GO → Plan A (con ese inbox retirado)' },
    { observed: '<2 clicks totales o HB >2% en ≥2 inboxes', decision: 'NO-GO → investigar lista o plantilla' },
    { observed: 'elevnhub inbox rinde mucho peor que elevngo/elevnpro', decision: 'Confirma contaminación apex — Plan A ajustado (elevnhub 1 inbox máximo)' },
  ],
  pros: [
    'Mínima inversión ($50)',
    'Máxima seguridad antes de escalar',
    'Identifica contaminación apex elevnhub en 4 días',
  ],
  cons: [
    '4 días de "delay" antes de volumen real',
    'Solo ~5 clicks esperados (no mueve aguja de negocio)',
  ],
  templates: {
    smartlead: 'Solo Variante T',
    brevo: 'No aplica',
    branchLinks: '1 único: pilot_c con tags {inbox_name} para diferenciar',
    subjectPrimary: "Get paid by Meta for content you've already made (OR 16.2%)",
    subjectSecondary: '',
    workflow: 'Ninguno — single-touch baseline por inbox',
  },
  workflowAscii: 'Single-touch baseline por inbox — sin automatización.',
  advantages: [
    'Pocos clicks esperados pero salva la inversión de A o B si hay problema de lista/canal',
    'Mide apex contamination (riesgo más serio no mencionado por Ana)',
    'Permite ajustar Plan A/B con data propia, no asunciones',
  ],
  sources: [
    { title: 'MailCleanup — Recovery Playbook', url: 'https://mailcleanup.com/acceptable-email-bounce-rate/' },
    { title: 'Landbase — Warmup Guide', url: 'https://www.landbase.com/blog/domain-reputation-email-warmup-revops-guide' },
  ],
}

export const PLANS = [PLAN_A, PLAN_B, PLAN_C]

// ===== COMPARATIVA EJECUTIVA =====

export const COMPARISON_CRITERIA = [
  { criterion: 'Objetivo primario', A: 'Volumen + data comparativa', B: 'Max clicks en abril', C: 'Validar antes de escalar' },
  { criterion: 'Duración', A: '3 semanas (20 abr - 9 may)', B: '2 semanas (20 abr - 2 may)', C: '4 días (20-23 abr)' },
  { criterion: 'Inversión', A: '$200-350', B: '$300-500', C: '$50' },
  { criterion: 'Velocidad a volumen pico', A: 'Lenta (S3)', B: 'Rápida (fin S1)', C: 'N/A' },
  { criterion: 'Beneficio clave', A: 'Hedge Brevo+Smartlead', B: 'Máximo volumen rápido', C: 'Data dura mínimo gasto' },
  { criterion: 'Riesgo clave', A: 'Poco volumen temprano', B: 'Sin fallback si SL falla', C: 'Aplaza 4 días' },
  { criterion: 'Daño adicional si falla', A: 'Bajo', B: 'Medio', C: 'Muy bajo' },
  { criterion: 'Learn-by-doing', A: 'Medio', B: 'Bajo', C: 'Máximo' },
  { criterion: 'Alinea con "clicks en abril"', A: 'Parcial', B: 'Máximo', C: 'Aplaza' },
  { criterion: 'Recupera Brevo para mayo', A: 'Sí (warm test)', B: 'No', C: 'Implícito' },
  { criterion: 'Manejo apex-contamination elevnhub', A: 'Volumen bajo', B: '4 inboxes concentra riesgo', C: 'Lo detecta Día 4' },
  { criterion: 'Preserva data Brevo vs Smartlead', A: 'Sí', B: 'No', C: 'Parcial' },
  { criterion: 'Hybrid Smartlead→Brevo workflow', A: 'S3', B: '—', C: '—' },
  { criterion: 'Subject reuse (best practice)', A: 'Ganadores 16% OR', B: 'Ganador', C: 'Ganador' },
  { criterion: 'Recomendación', A: 'Default post-pilot', B: 'Max urgencia post-pilot', C: 'SIEMPRE primero' },
]

export const ESTIMATE_ASSUMPTIONS = [
  { param: 'Delivery rate post-verificación', value: '99%', source: 'Sparkle 2026 benchmark' },
  { param: 'OR Smartlead inboxes frescos cold', value: '20-30%', source: 'Instantly.ai 2026' },
  { param: 'CTR intro cold', value: '2-3%', source: 'Apr 13 tu data (2.79%), benchmark 3.67%' },
  { param: 'CTR follow-up Friction (a openers)', value: '4-6%', source: 'Audiencia auto-seleccionada' },
  { param: 'CTR Intro v2 (a non-openers)', value: '0.5-1%', source: 'Benchmark segundo touch cold' },
  { param: 'Scans QR vs clicks directos', value: '0/100 en T, 15/85 en H', source: 'Con QR: 15% scans; sin QR: 0%' },
  { param: 'Conversion click → Meta signup', value: '15-20%', source: 'Asumido; depende de landing Branch' },
]

export const ESTIMATES_BY_PLAN = [
  { metric: 'Envíos iniciales (intro)', A: 10550, B: 10350, C: 200 },
  { metric: 'Envíos follow-up workflow', A: 7500, B: 9500, C: 0 },
  { metric: 'Envíos totales (touches)', A: 18000, B: 19850, C: 200, highlight: true },
  { metric: 'Delivered estimados (99%)', A: 17820, B: 19650, C: 198 },
  { metric: 'Opens estimados (25% OR)', A: 4455, B: 4910, C: 49 },
  { metric: 'Clicks Branch intro (2.5% CTR)', A: 250, B: 260, C: 5 },
  { metric: 'Clicks Branch follow-up combinado', A: 120, B: 140, C: 0 },
  { metric: 'Clicks Brevo warm (si aplica)', A: 15, B: 0, C: 0 },
  { metric: 'Total clicks estimados (base)', A: 385, B: 400, C: 5, highlight: true },
  { metric: 'Scans QR (Variante H A/B, Plan A S2-S3)', A: 40, B: 0, C: 0 },
  { metric: 'Total clicks + scans', A: 425, B: 400, C: 5, highlight: true },
  { metric: 'Signups Meta estimados (15-20% conv)', A: 75, B: 70, C: 1, highlight: true },
]

export const SCENARIOS = [
  { scenario: 'Pesimista (HB alto, OR 15%, CTR 1.5%)', A: 220, B: 210, C: 3 },
  { scenario: 'Base (estimado tabla)', A: 425, B: 400, C: 5 },
  { scenario: 'Optimista (HB <1%, OR 30%, CTR 3.5%)', A: 670, B: 650, C: 8 },
]

export const FAST_READ = [
  'Plan A y B tienen clicks similares (~400) — la diferencia real es tiempo, riesgo y data preservada, no volumen',
  'Plan C entrega ~5 clicks — no mueve aguja de negocio, pero valida el canal por $50',
  'Camino recomendado: C → B si GO agresivo / C → A si GO conservador',
]

// ===== QR VARIANTES =====

export const QR_PRINCIPLE = 'El Branch link y el QR apuntan al mismo destino. Ambos caminos cuentan como "click" en Branch. El QR NO es obligatorio para medir clicks.'

export const QR_PARADOX = [
  '~60-70% de emails se abren en mobile (Gmail app)',
  'En mobile, tener que sacar otro teléfono para escanear = fricción, no conveniencia',
  'QR aporta solo para usuarios desktop que quieran transferir a mobile',
]

export const QR_TEMPLATE_T = `Hi {{first_name}},

I'm reaching out from Laneta, a Meta-partnered agency
running the Creator Fast Track program in the US.

Based on your TikTok work, you qualify for a paid
content program through Meta — they're paying creators
$3K-$9K/month to repost existing content on Facebook.

Interested? Apply here (takes 60 seconds):
https://3c7t6.app.link/gMMTLRC6p2b

Happy to answer questions,
Dan @ Laneta`

export const QR_VARIANTS = [
  {
    id: 'T',
    name: 'Variante T — Texto plano',
    badge: 'Recomendada primaria',
    recommended: true,
    discarded: false,
    bullets: [
      'Parece email personal, no campaña',
      'Branch link clickable → en mobile abre app FB directo vía deep linking',
      'Deliverability: ~3-4KB, sin imágenes, sin CSS = mejor OR esperable',
    ],
  },
  {
    id: 'H',
    name: 'Variante H — HTML mínimo + QR pequeño',
    badge: 'A/B en Plan A S2',
    recommended: false,
    discarded: false,
    bullets: [
      '1 imagen (QR desde Supabase) + 1 link',
      '~5KB total',
      'Para A/B contra T en Plan A S2 (no cabe en Plan B/C)',
    ],
  },
  {
    id: 'Q',
    name: 'Variante Q — Solo QR',
    badge: 'Descartada',
    recommended: false,
    discarded: true,
    bullets: [
      'Quita el camino más rápido (click mobile)',
      'Trade-off peor',
    ],
  },
]

export const QR_BY_PLAN = [
  { plan: 'Plan A', s1: 'T (100%)', s2: 'T vs H 50/50', s3: 'Ganadora 100%' },
  { plan: 'Plan B', s1: 'T (100%)', s2: 'T (100%)', s3: '—' },
  { plan: 'Plan C', s1: 'T (100%)', s2: '—', s3: '—' },
]

export const BRANCH_BY_PLAN = [
  { plan: 'Plan A', links: 'intro_ft_v1_SL_T, intro_ft_v1_SL_H, intro_ft_v2, friction_removal, intro_ft_v1_brevo_warm', tags: '[sender_inbox, week, variant]' },
  { plan: 'Plan B', links: 'intro_ft_v1_SL_T, intro_ft_v2, friction_removal', tags: '[sender_inbox, week]' },
  { plan: 'Plan C', links: 'pilot_c (único)', tags: '[sender_inbox]' },
]

export const OPEN_TRACKING_NOTE = [
  'Apple MPP: OR ya no es métrica útil',
  'Pixel tracking en texto plano = sospechoso para ISPs',
  'Tu KPI real es Branch click, no OR — Branch mide eso directamente',
  'Mantener click tracking Smartlead activo (te da atribución por inbox sin depender solo de Branch dashboard)',
]

// ===== PREGUNTAS ABIERTAS =====

export const OPEN_QUESTIONS = [
  'META_LISTOS_10-04: ¿cuál fue la fuente de estos emails? (scraping / compra / plataforma tercera). Si es scraping sin verificación previa, cualquier plan requiere re-verificación (waterfall del pipeline).',
  '¿Cuántos registros Meta signup confirmados tuvimos en abril? El KPI "clicks" es proxy — lo que importa es signups. Necesitamos acceso al dashboard de FB Creator Program o al Airtable/CRM que trackee conversiones.',
  '¿Los 9 subdominios Smartlead están en qué etapa de warmup? Días acumulados, volumen diario actual, reply rate en warmup — si algunos <15 días, no están listos para cold real.',
  'Plan Brevo expira 2026-04-28. ¿Renovar (válido para warm en mayo) o downgrade durante el recovery?',
  'Branch.io Activation Basics: cap 150k clicks/mes. Si Plan B convierte ≥1%, podría acercarse. ¿Pre-escalar o aceptar cap?',
  'Smartlead API: ¿quién maneja la integración hoy? Si nadie, ejecución por UI hasta asignar owner técnico.',
  'Hybrid workflow (Plan A): ¿quién toma el compromiso de exportar openers Smartlead → importar Brevo en S3? Manual cada 3 días o construir integración?',
]

// ===== REFERENCIAS =====

export const INTERNAL_FILES = [
  { file: '_stats_brevo_13-17abr.json', content: 'Stats reales (campaignStats) de los 21 envíos Apr 13-17' },
  { file: '_subjects_analysis.json', content: 'Análisis empírico 266 campañas × 45 subjects únicos — validación hipótesis subject' },
  { file: '_campaigns_no_sincronizadas.json', content: '21 campañas para re-sync en CRM DB' },
  { file: '_dns_check.json', content: 'MX/SPF/DKIM/DMARC de 13 dominios (todos OK)' },
  { file: '_campaigns_13-17abr_stats.json', content: 'Backup de stats per-campaña (globalStats, todos 0 — bug sync CRM)' },
]

export const RELATED_DOCS = [
  { title: 'Reporte Ana original', path: 'hallazgos-grupo-envio/fast_track_report.docx.md' },
  { title: 'Inventario dominios', path: 'hallazgos-grupo-envio/Estructura Dominios...csv' },
  { title: 'Decisión bucket ganador 500k-1M', path: 'DECISION-EJECUTIVA-bucket-ganador_2026-04-17.md' },
  { title: 'Pipeline enriquecimiento + validación emails', path: 'Proceso/PLAN_PIPELINE_ENRIQUECIMIENTO.md' },
  { title: 'README del plan abril', path: 'README.md' },
  { title: 'Bitácora acumulada', path: 'bitacora.md' },
]

export const EXTERNAL_REFS = [
  { title: 'Brevo blog — 13 Best Cold Email Software for 2026', url: 'https://www.brevo.com/blog/best-cold-email-software/', note: 'el propio Brevo recomienda otras tools para cold' },
  { title: 'EmailToolTester — 7 Best Email Outreach Tools (2026)', url: 'https://www.emailtooltester.com/en/blog/best-email-outreach-tools/', note: '"Brevo runs on shared sending infrastructure... account suspension within hours" para cold' },
  { title: 'Instantly.ai — 2026 Email Verification Benchmark', url: 'https://instantly.ai/blog/2026-email-verification-benchmark-accuracy-scores-for-8-top-tools/', note: 'waterfall ZB+NB' },
  { title: 'Instantly.ai — Cold Email Benchmark Report 2026', url: 'https://instantly.ai/cold-email-benchmark-report-2026', note: 'CTR avg 3.67%, 5%+ bueno' },
  { title: 'MailCleanup — Bounce Rate Benchmarks 2026', url: 'https://mailcleanup.com/acceptable-email-bounce-rate/', note: 'recovery 30-90 días con HB>3%' },
  { title: 'Sparkle — ZB vs NB 2026', url: 'https://sparkle.io/blog/zerobounce-vs-neverbounce/', note: 'accuracy real vs claimed' },
  { title: 'Landbase — Domain Reputation Warmup', url: 'https://www.landbase.com/blog/domain-reputation-email-warmup-revops-guide', note: 'protocolo post-daño' },
  { title: 'Smartlead — Cold Email CTR', url: 'https://www.smartlead.ai/blog/cold-email-click-through-rates', note: 'tácticas CTR' },
]

// Hybrid workflow ASCII
export const HYBRID_WORKFLOW_ASCII = `┌─────────────────────────────────────────────────────────┐
│ COLD (Smartlead) — canal correcto para primer contacto  │
│  ↓                                                       │
│ Intro Fast Track → wait 3d → check opens                 │
│  │                                                       │
│  ├─ NO abrió → Intro v2 (Smartlead) → wait 3d → dropout  │
│  └─ SÍ abrió → marcado como "warm"                       │
│              ↓                                            │
│         EXPORT a Brevo lista FT_03_Warm_Openers          │
│              ↓                                            │
│ WARM (Brevo) — canal con buena reputación histórica      │
│  ↓                                                       │
│ Friction Removal (Brevo) → wait 3d → re-engagement       │
│  ↓                                                       │
│ Branch click → hot lead → equipo ventas                  │
└─────────────────────────────────────────────────────────┘`

export const HYBRID_LOGIC = 'Smartlead hace el trabajo sucio de cold (lo que Brevo no puede). Brevo se usa con los que ya abrieron (audiencia auto-seleccionada = warm = Brevo se porta bien). Usa cada tool para su fortaleza.'

export const HYBRID_SYNC = [
  'Manual día 3-4: export de openers Smartlead → CSV → import en lista Brevo FT_03_Warm_Openers',
  'Automatizado (fase 2): webhook Smartlead email_opened → Edge Function Supabase → API Brevo addContacts',
]

export const HYBRID_TRADEOFF = 'Agrega complejidad de integración. Vale la pena solo si Plan A tiene tiempo (3 semanas). En Plan B no se justifica.'

// ===== EMAIL TEMPLATES (contenido real de los archivos) =====
// Fuente: D:\CRM\brevo\plan-implementacion-abril-2026\templates\

export type EmailTemplate = {
  id: string
  name: string
  channel: 'Smartlead' | 'Brevo'
  step: string
  subject: string
  subjectAlt?: string
  body: string
  bodyType: 'plain' | 'html'
  variables: Array<{ var: string; meaning: string }>
  branchLink: string
  config: string[]
  notes: string[]
}

export const TEMPLATES: EmailTemplate[] = [
  {
    id: 'smartlead_T_intro',
    name: 'Step 1 — Intro Fast Track',
    channel: 'Smartlead',
    step: 'Sequence step 1 · Day 0 · Primer contacto',
    subject: "Get paid by Meta for content you've already made",
    body: `Hi {{first_name|there}},

I'm reaching out from Laneta, a Meta-partnered agency running the Creator Fast Track program in the US.

Based on your TikTok work, you qualify for a paid content program through Meta — they're paying creators $3K-$9K/month to repost existing content on Facebook.

Interested? Apply here (takes 60 seconds):
{{branch_link_v1}}

Happy to answer questions,
Dan @ Laneta`,
    bodyType: 'plain',
    variables: [
      { var: '{{first_name}}', meaning: 'Nombre del contacto (fallback "there")' },
      { var: '{{branch_link_v1}}', meaning: 'Link de Branch para este step (intro_ft_v1)' },
    ],
    branchLink: 'intro_ft_v1_smartlead_T (actual: https://3c7t6.app.link/gMMTLRC6p2b)',
    config: [
      'Body type: Plain text (IMPORTANTE: no HTML)',
      'Tracking: DESACTIVAR open tracking · MANTENER click tracking',
      'Send interval: respetando cap del inbox',
      'Subject ganador histórico: 16.2% OR',
    ],
    notes: [
      'El sign-off "Dan @ Laneta" se puede personalizar por inbox (ej: "Apply @ La Neta")',
      'NO agregar imágenes, CSS, unsubscribe link (Smartlead lo agrega automático)',
      'NO agregar "Sent from my iPhone" ni footers de empresa — tono persona-a-persona',
      'Si {{first_name}} no existe, el fallback "there" se activa',
      'Volumen inicial: 30-40/día Semana 1, subir a 150/día en Semana 2 si HB <1%',
    ],
  },
  {
    id: 'smartlead_T_intro_v2',
    name: 'Step 2a — Intro v2 (non-openers)',
    channel: 'Smartlead',
    step: 'Sequence step 2a · Day 3 · Condicional: NO abrió step 1',
    subject: "{{first_name|}} — quick bump about Meta's creator program",
    subjectAlt: 'Quick bump: Meta is paying creators for content they already have',
    body: `Hi {{first_name|there}},

Quick bump on my last email about Meta's Creator Fast Track.

Short version: Meta is paying creators to repost TikTok/Instagram content on Facebook — $3K-$9K/month for content you've already made.

Takes 60 seconds to apply:
{{branch_link_v2}}

Let me know if I can answer anything,
Dan @ Laneta`,
    bodyType: 'plain',
    variables: [
      { var: '{{first_name}}', meaning: 'Nombre (fallback "there")' },
      { var: '{{branch_link_v2}}', meaning: 'Link Branch específico intro_ft_v2' },
    ],
    branchLink: 'intro_ft_v2 (debe diferenciarse de v1 para medir conversion por step)',
    config: [
      'Body type: Plain text',
      'Tracking: DESACTIVAR open tracking · MANTENER click tracking',
      'Recommended: enviar desde inbox DIFERENTE al step 1 (rotación ayuda a deliverability)',
    ],
    notes: [
      'Mensaje MÁS CORTO intencionalmente — follow-up eficiente',
      '"Quick bump on my last email" asume que recibieron algo; subject distinto + contexto renovado = segunda oportunidad de atención',
      'Cambio de subject es CRÍTICO: mismo subject al step 1 → Gmail colapsa en thread y marca como repetido',
      'Usar inbox diferente: step 1 apply@creators.elevngo.me → step 2a apply@go.elevnpro.me',
      'Volumen: ~70% del volumen de step 1 (60-70% de audiencia no abre primer touch)',
    ],
  },
  {
    id: 'smartlead_T_friction',
    name: 'Step 2b — Friction Removal (openers)',
    channel: 'Smartlead',
    step: 'Sequence step 2b · Day 3 · Condicional: SÍ abrió step 1 pero NO clickeó',
    subject: "{{first_name|}}, one more detail about Meta's creator program",
    subjectAlt: 'Removing friction: the 3 most common questions about Meta Fast Track',
    body: `Hi {{first_name|there}},

Saw you opened my last email — wanted to remove any hesitation before you decide.

The 3 most common questions I get:

1. "Do I need to create new content?"
No. You just repost TikTok/Instagram videos you already have.

2. "How much time per week?"
About 2 hours. Posting existing content to Facebook.

3. "Is it really paid?"
Yes. $3K-$9K/mo direct from Meta, based on performance.

Apply here in 60 seconds:
{{branch_link_friction}}

Happy to answer anything else,
Dan @ Laneta`,
    bodyType: 'plain',
    variables: [
      { var: '{{first_name}}', meaning: 'Nombre (fallback "there")' },
      { var: '{{branch_link_friction}}', meaning: 'Link Branch específico friction_removal' },
    ],
    branchLink: 'friction_removal (tags incluyen "hot_lead" para priorizar en dashboard)',
    config: [
      'Body type: Plain text',
      'Tracking: DESACTIVAR open tracking · MANTENER click tracking',
      'Recommended: MISMO inbox del step 1 (continuidad de conversación)',
    ],
    notes: [
      '"Saw you opened my last email" es honesto pero NO alarmante — no decir "I noticed you didn\'t click" (suena stalker)',
      'Los 3 puntos son las objeciones reales de los creadores en testing previo',
      'NO REPETIR el monto $3K-$9K en el body — ya se dio en step 1. Aquí se resuelven dudas, no re-vender',
      'CTR más alto históricamente (openers son self-selected warm) — estimado 4-6% CTR vs 2-3% del step 1',
      'Workflow debe marcarlos como "hot lead" si clickean aquí',
    ],
  },
  {
    id: 'brevo_warm_html',
    name: 'Brevo warm opener follow-up (HTML)',
    channel: 'Brevo',
    step: 'Opcional · openers históricos sin click en 90 días',
    subject: 'Quick follow-up, {{ contact.FNAME }} — did you see this from Meta?',
    subjectAlt: '{{ contact.FNAME }}, checking back on that creator program | Still interested? Meta Fast Track has new slots',
    body: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meta Creator Fast Track — follow-up</title>
</head>
<body style="margin:0; padding:0; background:#f5f5f5; font-family: Arial, Helvetica, sans-serif; color:#222;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f5f5;">
    <tr>
      <td align="center" style="padding: 32px 16px;">

        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px; background:#ffffff; border-radius:8px;">
          <tr>
            <td style="padding: 32px;">

              <p style="font-size:16px; line-height:24px; margin:0 0 16px 0; color:#222;">
                Hi {{ contact.FNAME | default:"there" }},
              </p>

              <p style="font-size:16px; line-height:24px; margin:0 0 16px 0; color:#222;">
                Checking back on the Meta Creator Fast Track email I sent you a while ago — I noticed you opened it, but wasn't sure if the timing was off or something else.
              </p>

              <p style="font-size:16px; line-height:24px; margin:0 0 16px 0; color:#222;">
                Since then, <strong>Meta has opened new slots</strong> for creators at your follower range. If the program still interests you, the short version is:
              </p>

              <ul style="font-size:16px; line-height:24px; margin:0 0 16px 20px; padding:0; color:#222;">
                <li>Repost content you already made (TikTok/IG → Facebook).</li>
                <li>Meta pays $3K-$9K/mo based on performance.</li>
                <li>Takes about 2 hours a week of posting time.</li>
              </ul>

              <p style="text-align:center; margin: 24px 0;">
                <a href="https://3c7t6.app.link/friction_removal?contact_id={{ contact.ID | default:'' }}"
                   style="display:inline-block; background:#0F52BA; color:#ffffff; padding:14px 28px; text-decoration:none; border-radius:6px; font-weight:bold; font-size:16px;">
                  Apply in 60 seconds
                </a>
              </p>

              <p style="font-size:14px; line-height:20px; margin:16px 0 0 0; color:#555;">
                Happy to answer anything — just reply here.
              </p>

              <p style="font-size:14px; line-height:20px; margin:8px 0 0 0; color:#555;">
                Dan @ Laneta<br>
                <span style="color:#888; font-size:12px;">Meta-partnered agency running the Creator Fast Track program</span>
              </p>

            </td>
          </tr>
        </table>

        <p style="font-size:12px; line-height:18px; color:#888; margin:16px 0 0 0; max-width:560px;">
          If this isn't relevant, <a href="{{ unsubscribe }}" style="color:#888;">unsubscribe here</a>. Meta is a partner of Laneta Agency — we help creators apply to their programs.
        </p>

      </td>
    </tr>
  </table>

</body>
</html>`,
    bodyType: 'html',
    variables: [
      { var: '{{ contact.FNAME }}', meaning: 'Nombre del contacto (fallback "there")' },
      { var: '{{ contact.ID }}', meaning: 'ID Brevo para atribución Branch (?contact_id=)' },
      { var: '{{ unsubscribe }}', meaning: 'URL unsubscribe manejada por Brevo' },
    ],
    branchLink: 'friction_removal con ?contact_id={{ contact.ID }}',
    config: [
      'Template type: transactional (marketing campaign)',
      'Plain text version: usar el body TEXT (tab siguiente)',
      'Open tracking: ON (Brevo lo maneja bien)',
      'Click tracking: ON (Brevo + Branch double-tracking)',
      'Sender sugerido: apply@creators.elevn.me',
    ],
    notes: [
      'Elegibilidad: abrieron campaña FT anterior + 0 clicks históricos + último open en 90 días',
      'Excluir: blocklist_hard_bounces.csv, _exclusion_master.txt, unsubscribed en Brevo',
      'Preheader sugerido: "Meta opened new slots for creators at your follower range."',
    ],
  },
  {
    id: 'brevo_warm_text',
    name: 'Brevo warm follow-up (plain text version)',
    channel: 'Brevo',
    step: 'Plain text fallback del template HTML anterior',
    subject: '(mismo subject que la versión HTML)',
    body: `Hi {{ contact.FNAME | default:"there" }},

Checking back on the Meta Creator Fast Track email I sent you a while ago — I noticed you opened it, but wasn't sure if the timing was off or something else.

Since then, Meta has opened new slots for creators at your follower range. If the program still interests you, the short version is:

- Repost content you already made (TikTok/IG to Facebook).
- Meta pays $3K-$9K/mo based on performance.
- Takes about 2 hours a week of posting time.

Apply in 60 seconds:
https://3c7t6.app.link/friction_removal?contact_id={{ contact.ID | default:'' }}

Happy to answer anything — just reply here.

Dan @ Laneta
Meta-partnered agency running the Creator Fast Track program

----------------------------------------------------------------

If this isn't relevant, you can unsubscribe: {{ unsubscribe }}`,
    bodyType: 'plain',
    variables: [
      { var: '{{ contact.FNAME }}', meaning: 'Nombre (fallback "there")' },
      { var: '{{ contact.ID }}', meaning: 'ID Brevo para atribución' },
      { var: '{{ unsubscribe }}', meaning: 'URL unsubscribe Brevo' },
    ],
    branchLink: 'friction_removal con ?contact_id={{ contact.ID }}',
    config: [
      'Este es el fallback para clientes que no renderizan HTML',
      'Brevo lo pide al crear templates — copiar tal cual en "Plain text version"',
    ],
    notes: ['Misma regla de elegibilidad que la versión HTML'],
  },
]

// ===== BRANCH.IO LINKS SPECS =====
// Fuente: D:\CRM\brevo\plan-implementacion-abril-2026\branch-io\links_specs.md

export const BRANCH_CONTEXT = {
  plan: 'Activation Basics ($17/mes · 10k links / 150k clicks)',
  appId: '1570143202843840673',
  currentLink: 'https://3c7t6.app.link/gMMTLRC6p2b (campaign=intro_ft_v1, channel=brevo)',
  why: 'Actualmente existe 1 solo link funcional. Para medir qué step del workflow convierte, necesitamos links separados por step + campaign + canal.',
}

export type BranchField = { field: string; value: string; mono?: boolean }
export type BranchLinkSpec = {
  id: string
  name: string
  step: string
  optional?: boolean
  fields: BranchField[]
  utms: string[]
}

export const BRANCH_LINKS: BranchLinkSpec[] = [
  {
    id: 'intro_ft_v1_smartlead_T',
    name: 'intro_ft_v1_smartlead_T',
    step: 'Step 1 del workflow Smartlead',
    fields: [
      { field: '$og_title', value: 'Creator Fast Track' },
      { field: '$og_description', value: 'Apply to Meta Creator Fast Track' },
      { field: '$desktop_url', value: 'https://www.facebook.com/creator_programs/signup?referral_code=laneta&utm_source=smartlead&utm_medium=email&utm_campaign=intro_ft_v1', mono: true },
      { field: '$fallback_url', value: '(mismo que desktop_url)' },
      { field: '~campaign', value: 'intro_ft_v1', mono: true },
      { field: '~channel', value: 'smartlead', mono: true },
      { field: '~feature', value: 'email_text_link', mono: true },
      { field: '~tags', value: '["smartlead","variant_T","step_1"]', mono: true },
    ],
    utms: ['utm_source=smartlead', 'utm_medium=email', 'utm_campaign=intro_ft_v1'],
  },
  {
    id: 'intro_ft_v2',
    name: 'intro_ft_v2',
    step: 'Step 2a del workflow — follow-up non-openers',
    fields: [
      { field: '$og_title', value: 'Creator Fast Track' },
      { field: '$og_description', value: 'Meta is paying creators — 60 sec to apply' },
      { field: '$desktop_url', value: 'https://www.facebook.com/creator_programs/signup?referral_code=laneta&utm_source=smartlead&utm_medium=email&utm_campaign=intro_ft_v2', mono: true },
      { field: '$fallback_url', value: '(mismo que desktop_url)' },
      { field: '~campaign', value: 'intro_ft_v2', mono: true },
      { field: '~channel', value: 'smartlead', mono: true },
      { field: '~feature', value: 'email_text_link', mono: true },
      { field: '~tags', value: '["smartlead","variant_T","step_2a","follow_up_non_openers"]', mono: true },
    ],
    utms: ['utm_source=smartlead', 'utm_medium=email', 'utm_campaign=intro_ft_v2'],
  },
  {
    id: 'friction_removal',
    name: 'friction_removal',
    step: 'Step 2b del workflow — openers sin click',
    fields: [
      { field: '$og_title', value: 'Creator Fast Track — Your Questions Answered' },
      { field: '$og_description', value: '3 most common questions about Meta Fast Track' },
      { field: '$desktop_url', value: 'https://www.facebook.com/creator_programs/signup?referral_code=laneta&utm_source=smartlead&utm_medium=email&utm_campaign=friction_removal', mono: true },
      { field: '$fallback_url', value: '(mismo que desktop_url)' },
      { field: '~campaign', value: 'friction_removal', mono: true },
      { field: '~channel', value: 'smartlead', mono: true },
      { field: '~feature', value: 'email_text_link', mono: true },
      { field: '~tags', value: '["smartlead","variant_T","step_2b","friction_removal","hot_lead"]', mono: true },
    ],
    utms: ['utm_source=smartlead', 'utm_medium=email', 'utm_campaign=friction_removal'],
  },
  {
    id: 'friction_removal_brevo',
    name: 'friction_removal_brevo',
    step: 'Opcional — Step Brevo para openers históricos sin click',
    optional: true,
    fields: [
      { field: '$og_title', value: 'Creator Fast Track — Your Questions Answered' },
      { field: '$og_description', value: 'Meta opened new slots — apply in 60 sec' },
      { field: '$desktop_url', value: 'https://www.facebook.com/creator_programs/signup?referral_code=laneta&utm_source=brevo&utm_medium=email&utm_campaign=friction_removal_warm', mono: true },
      { field: '$fallback_url', value: '(mismo)' },
      { field: '~campaign', value: 'friction_removal_warm', mono: true },
      { field: '~channel', value: 'brevo', mono: true },
      { field: '~feature', value: 'email_warm_openers', mono: true },
      { field: '~tags', value: '["brevo","warm_openers","opener_no_click","step_retarget"]', mono: true },
    ],
    utms: ['utm_source=brevo', 'utm_medium=email', 'utm_campaign=friction_removal_warm'],
  },
]

export const BRANCH_UI_STEPS = [
  'Entrar a app.branch.io',
  'Click en "Quick Links" → "+ Quick Link"',
  'Tab "Analytics": Campaign/Channel/Feature/Tags según tabla',
  'Tab "Configure Options": Desktop URL + Fallback URL',
  'Tab "Social Media": OG Title + OG Description',
  'Save → obtener short link (ej: https://3c7t6.app.link/XXXXXXX)',
]

export const BRANCH_API_SNIPPET = `curl -X POST https://api.branch.io/v1/url \\
  -H "Content-Type: application/json" \\
  -d '{
    "branch_key": "key_live_hqBt6hMPyeuj2O7eNl9oamlautmkTJhy",
    "channel": "smartlead",
    "feature": "email_text_link",
    "campaign": "intro_ft_v1",
    "tags": ["smartlead","variant_T","step_1"],
    "data": {
      "$og_title": "Creator Fast Track",
      "$og_description": "Apply to Meta Creator Fast Track",
      "$desktop_url": "https://www.facebook.com/creator_programs/signup?referral_code=laneta&utm_source=smartlead&utm_medium=email&utm_campaign=intro_ft_v1",
      "$fallback_url": "https://www.facebook.com/creator_programs/signup?referral_code=laneta&utm_source=smartlead&utm_medium=email&utm_campaign=intro_ft_v1"
    }
  }'

# Respuesta: {"url": "https://3c7t6.app.link/XXXXXXX"}`

export const BRANCH_VERIFY_SNIPPET = `import requests
r = requests.get(
    'https://api2.branch.io/v1/url',
    params={'branch_key': 'key_live_hqBt6hMPyeuj2O7eNl9oamlautmkTJhy',
            'url': 'https://3c7t6.app.link/XXXXXXX'},
    timeout=10)
print(r.json())
# Debe devolver ~campaign, ~channel, $desktop_url configurados`

export const BRANCH_TEMPLATE_UPDATES = [
  { template: 'smartlead_T_intro.txt', placeholder: '{{branch_link_v1}}', link: 'https://3c7t6.app.link/XXX1' },
  { template: 'smartlead_T_intro_v2.txt', placeholder: '{{branch_link_v2}}', link: 'https://3c7t6.app.link/XXX2' },
  { template: 'smartlead_T_friction.txt', placeholder: '{{branch_link_friction}}', link: 'https://3c7t6.app.link/XXX3' },
  { template: 'brevo_warm_opener_followup.html', placeholder: 'friction_removal', link: 'https://3c7t6.app.link/XXX4' },
]

export const BRANCH_DASHBOARD_VIEWS = [
  { view: 'Por campaign', action: 'agrupar por ~campaign — ver qué step convierte más (v1 vs v2 vs friction)' },
  { view: 'Por channel', action: 'agrupar por ~channel — ver smartlead vs brevo' },
  { view: 'Por tags', action: 'filtrar variant_T vs otros, hot_lead para priorizar leads' },
  { view: 'Geography', action: 'confirmar mayoría US (filtra bots fuera de US)' },
]

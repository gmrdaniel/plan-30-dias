// Data histórica del análisis — 2026-04-17
// Fuente: brevo_creator_stats (96,348 rows) + creator_inventory (29,538) + universe local

export type BucketRow = {
  bucket: string
  camps: number
  creators: number
  sent: number
  delivered: number
  opens: number
  clicks: number
  orPct: number
  ctrPct: number
  isWinner?: boolean
}

export const OVERVIEW = {
  campaignsAnalyzed: 325,
  statsRows: 96348,
  uniqueCreators: 29538,
  matchRatePct: 98.3,
  winnerBucket: '500k-1M',
  winnerOrPct: 7.3,
  winnerSampleSize: 18462,
  winnerCamps: 103,
  enrichmentCostTotal: 170,
  periodStart: '2026-02-17',
  periodEnd: '2026-04-17',
}

// Agregado por bucket max_followers (desde campaign_x_max_followers_bucket.csv)
export const BUCKETS_MAX_FOLLOWERS: BucketRow[] = [
  { bucket: '<100k', camps: 44, creators: 2734, sent: 2734, delivered: 2731, opens: 136, clicks: 13, orPct: 5.0, ctrPct: 0.48 },
  { bucket: '100k-250k', camps: 155, creators: 36206, sent: 36205, delivered: 36044, opens: 1762, clicks: 184, orPct: 4.9, ctrPct: 0.51 },
  { bucket: '250k-500k', camps: 117, creators: 28433, sent: 28429, delivered: 28402, opens: 1730, clicks: 129, orPct: 6.1, ctrPct: 0.45 },
  { bucket: '500k-1M', camps: 103, creators: 18481, sent: 18479, delivered: 18462, opens: 1346, clicks: 109, orPct: 7.3, ctrPct: 0.59, isWinner: true },
  { bucket: '1M-2M', camps: 34, creators: 3579, sent: 3579, delivered: 3573, opens: 182, clicks: 21, orPct: 5.1, ctrPct: 0.59 },
  { bucket: '2M-5M', camps: 26, creators: 2739, sent: 2739, delivered: 2734, opens: 144, clicks: 16, orPct: 5.3, ctrPct: 0.59 },
  { bucket: '5M-10M', camps: 13, creators: 1196, sent: 1196, delivered: 1196, opens: 108, clicks: 10, orPct: 9.0, ctrPct: 0.84 },
  { bucket: '10M+', camps: 7, creators: 704, sent: 704, delivered: 704, opens: 77, clicks: 2, orPct: 10.9, ctrPct: 0.28 },
]

// Agregado por bucket TikTok followers específicamente
export const BUCKETS_TIKTOK: BucketRow[] = [
  { bucket: '<100k', camps: 20, creators: 1873, sent: 4796, delivered: 4779, opens: 340, clicks: 46, orPct: 7.1, ctrPct: 1.0 },
  { bucket: '100k-500k', camps: 16, creators: 904, sent: 1785, delivered: 1772, opens: 130, clicks: 16, orPct: 7.3, ctrPct: 0.9 },
  { bucket: '500k-1M', camps: 3, creators: 154, sent: 314, delivered: 313, opens: 33, clicks: 8, orPct: 10.5, ctrPct: 2.6, isWinner: true },
  { bucket: '1M-5M', camps: 1, creators: 137, sent: 259, delivered: 256, opens: 23, clicks: 5, orPct: 9.0, ctrPct: 2.0 },
]

// Días de la semana
export const DAY_STATS = [
  { day: 'Lunes', camps: 8, delivered: 666, opens: 274, orPct: 41.1 },
  { day: 'Martes', camps: 32, delivered: 1289, opens: 347, orPct: 26.9 },
  { day: 'Miércoles', camps: 24, delivered: 2052, opens: 272, orPct: 13.3 },
  { day: 'Jueves', camps: 5, delivered: 1117, opens: 45, orPct: 4.0 },
  { day: 'Viernes', camps: 6, delivered: 1285, opens: 26, orPct: 2.0 },
  { day: 'Sábado', camps: 3, delivered: 88, opens: 10, orPct: 11.4 },
  { day: 'Domingo', camps: 8, delivered: 236, opens: 75, orPct: 31.8 },
]

// Horas del día (ET)
export const HOUR_STATS = [
  { hour: 0, camps: 5, delivered: 222, orPct: 20.7 },
  { hour: 7, camps: 1, delivered: 49, orPct: 4.1 },
  { hour: 8, camps: 3, delivered: 121, orPct: 14.9 },
  { hour: 10, camps: 4, delivered: 111, orPct: 24.3 },
  { hour: 11, camps: 3, delivered: 88, orPct: 31.8 },
  { hour: 13, camps: 1, delivered: 58, orPct: 15.5 },
  { hour: 14, camps: 18, delivered: 1576, orPct: 7.9 },
  { hour: 15, camps: 2, delivered: 255, orPct: 6.3 },
  { hour: 16, camps: 6, delivered: 790, orPct: 14.7 },
  { hour: 17, camps: 10, delivered: 1340, orPct: 21.6 },
  { hour: 18, camps: 10, delivered: 1074, orPct: 8.2 },
  { hour: 19, camps: 8, delivered: 234, orPct: 17.5 },
  { hour: 20, camps: 4, delivered: 123, orPct: 18.7 },
  { hour: 22, camps: 4, delivered: 493, orPct: 32.3 },
  { hour: 23, camps: 7, delivered: 199, orPct: 31.2 },
]

// Top slots (día × hora)
export const TOP_SLOTS = [
  { slot: 'Lunes 17h', orPct: 46.2, delivered: 496, camps: 2, winner: true },
  { slot: 'Martes 22h', orPct: 33.0, delivered: 464, camps: 3 },
  { slot: 'Miércoles 14h', orPct: 20.3, delivered: 403, camps: 11 },
  { slot: 'Miércoles 16h', orPct: 13.5, delivered: 704, camps: 3 },
  { slot: 'Jueves 17h', orPct: 3.8, delivered: 451, camps: 2 },
  { slot: 'Viernes 14h', orPct: 2.7, delivered: 679, camps: 3, avoid: true },
]

// Sample campañas individuales
export const SAMPLE_CAMPAIGNS = [
  {
    name: 'End of Jan - P. 250-750k (4000) thursday 29',
    date: '2026-01-29',
    sender: 'nicole@laneta.com',
    totalOr: 11.0,
    breakdown: [
      { bucket: '<100k', creators: 32, delivered: 32, opens: 5, orPct: 15.6 },
      { bucket: '250k-500k', creators: 2034, delivered: 2034, opens: 228, orPct: 11.2 },
      { bucket: '500k-1M', creators: 501, delivered: 501, opens: 50, orPct: 10.0, highlight: true },
    ],
  },
  {
    name: 'friction removal - P. 250-750k (3880) sunday 25',
    date: '2026-01-25',
    sender: 'nicole@laneta.com',
    totalOr: 8.6,
    breakdown: [
      { bucket: '<100k', creators: 12, delivered: 12, opens: 4, orPct: 33.3 },
      { bucket: '250k-500k', creators: 880, delivered: 880, opens: 46, orPct: 5.2 },
      { bucket: '500k-1M', creators: 1833, delivered: 1833, opens: 183, orPct: 10.0, highlight: true },
    ],
  },
  {
    name: 'Creator Fast Track - PP. 3K 1M - Template B',
    date: '2026-02-27',
    sender: 'leo@creators.laneta.com',
    totalOr: 5.0,
    breakdown: [
      { bucket: '<100k', creators: 160, delivered: 160, opens: 6, orPct: 3.8 },
      { bucket: '1M-2M', creators: 1060, delivered: 1060, opens: 49, orPct: 4.6 },
      { bucket: '2M-5M', creators: 677, delivered: 677, opens: 38, orPct: 5.6 },
      { bucket: '5M-10M', creators: 47, delivered: 47, opens: 5, orPct: 10.6, highlight: true },
      { bucket: '10M+', creators: 10, delivered: 10, opens: 0, orPct: 0.0 },
    ],
  },
]

// Template 559 audit
export type TemplateIssue = {
  id: string
  title: string
  before: number | string
  after: number | string
  severity: 'critical' | 'medium' | 'low'
  description: string
  fixed: boolean
}

export const TEMPLATE_AUDIT = {
  templateId: 559,
  templateName: '17-04 Branch QR Fast Track Canada-US',
  metrics: {
    sizeBefore: 53600,
    sizeAfter: 37545,
    reductionPct: 30,
    textHtmlRatioBefore: 10.0,
    textHtmlRatioAfter: 14.2,
  },
  subjectBefore: "Canada: your invitation to Meta's new creator program",
  subjectAfter: "Your invitation to Meta's new creator program",
  preheaderBefore: "Apply to Meta's Creator Fast Track in Canada. Join the live webinar and check your eligibility today.",
  preheaderAfter: "You qualify for Meta's Creator Fast Track. Join the live webinar and check your eligibility today.",
  replyToBefore: '',
  replyToAfter: 'apply@creators.elevnpro.me',
}

export const TEMPLATE_ISSUES: (TemplateIssue & { marketing: string })[] = [
  { id: 'fr-original', title: 'fr-original-* attrs (Froala editor garbage)', before: 161, after: 0, severity: 'critical', description: 'Atributos duplicados del editor que añaden ~8 KB de peso muerto', marketing: 'El correo traía código basura del editor. Como mandar un PDF con 8 hojas en blanco: pesa más y se ve mal profesional.', fixed: true },
  { id: 'data-gr', title: 'data-gr-* attrs (Grammarly injection)', before: 0, after: 0, severity: 'critical', description: 'Ya limpios en 559 (flag directo de spam filter)', marketing: 'Ya estaba limpio. Si tuviéramos estas marcas, Gmail las detecta y manda el correo a spam automáticamente.', fixed: true },
  { id: 'ispasted', title: 'isPasted attrs (duplicate IDs)', before: 8, after: 0, severity: 'medium', description: 'IDs duplicados de paste Word/Docs — HTML inválido', marketing: 'Rastros de cuando alguien copió y pegó texto desde Word. No se ven pero ensucian el código.', fixed: true },
  { id: 'aria-disabled', title: 'aria-disabled en body', before: 1, after: 0, severity: 'medium', description: 'Residuo de editor browser — flag spam', marketing: 'Residuo técnico del editor web. Pequeña señal para Gmail de que el correo fue tocado por herramientas raras.', fixed: true },
  { id: 'google-fonts', title: 'Google Fonts <link> externo', before: 1, after: 0, severity: 'medium', description: 'No funciona en email clients, añade peso', marketing: 'Tipografía que se intentaba cargar desde internet pero Gmail/Outlook bloquean eso. Era código muerto.', fixed: true },
  { id: 'empty-spans', title: 'Empty <span></span> tags', before: 51, after: 0, severity: 'low', description: 'Basura de WYSIWYG', marketing: '51 "cajitas vacías" quedaron en el código cada vez que alguien editó el correo. No dañan visualmente pero ensucian.', fixed: true },
  { id: 'empty-strongs', title: 'Empty <strong></strong> tags', before: 3, after: 0, severity: 'low', description: 'Tags inútiles', marketing: 'Instrucciones de "poner en negritas" que no tenían texto. Código sin función.', fixed: true },
  { id: 'display-none', title: 'display:none elements (keyword stuffing)', before: 7, after: 1, severity: 'critical', description: 'Solo preheader debe tenerlo (1). Más = flag spam', marketing: 'Texto oculto dentro del correo. Es una técnica que usan los spammers, así que Gmail lo penaliza cuando la ve.', fixed: true },
  { id: '100-percent', title: '"100%" en copy visible', before: 7, after: 0, severity: 'critical', description: 'Super spam trigger — reemplazado por "fully"', marketing: 'Decía "100%" siete veces ("100% guaranteed", "100% free"). Es una palabra clásica de spam — Gmail la detecta al instante.', fixed: true },
  { id: 'meta-partner', title: '"Meta Official Partner"', before: 2, after: 0, severity: 'critical', description: 'Claim legal + spam trigger — cambiado a "Creator programs by La Neta"', marketing: 'Decíamos "Meta Official Partner" sin tener un acuerdo formal. Riesgo legal + bandera roja para los filtros de spam.', fixed: true },
  { id: 'in-canada', title: '"in Canada" en copy', before: 3, after: 0, severity: 'medium', description: 'Geo mismatch — audiencia era US pero copy decía Canada', marketing: 'El correo decía "in Canada" pero lo mandábamos a creadores de Estados Unidos. Lectores confundidos = cierran y no responden.', fixed: true },
  { id: 'preheader', title: 'Preheader literal [DEFAULT_HEADER]', before: 1, after: 0, severity: 'critical', description: 'Placeholder sin reemplazar que se enviaba a inbox', marketing: 'El preview que se ve en la bandeja decía literalmente "[DEFAULT_HEADER]" en vez de un texto real. Imagen horrible antes de abrir.', fixed: true },
]

// Costos
export const COST_CONFIG = {
  clayCreditPrice: 0.0005, // USD per credit
  clayCreditsPerRecord: 1.76,
  apifyIgPer1000: 2.30, // USD
  apifyFbPer1000: 3.00, // USD
}

export const COST_SCENARIOS = [
  { name: 'Test 500 records', records: 500, clayCost: 0.44, apifyCost: 2.65, total: 3.09 },
  { name: 'Bucket 500k-1M', records: 4084, clayCost: 3.59, apifyCost: 21.65, total: 25.24 },
  { name: 'Bucket 1M-5M', records: 4443, clayCost: 3.91, apifyCost: 23.55, total: 27.46 },
  { name: 'Bucket 100k-500k', records: 18907, clayCost: 16.64, apifyCost: 100.20, total: 116.84 },
  { name: 'TOTAL universo fresh', records: 27434, clayCost: 24.14, apifyCost: 145.40, total: 169.54 },
]

// Enriquecimiento resultados 999 sample (actualizado 2026-04-18)
export const ENRICHMENT_RESULTS = {
  totalRecords: 999,
  igEnriched: 623,
  igEnrichedPct: 62.4,
  igVerified: 212,
  igVerifiedPct: 21.2,
  tiers: [
    { tier: 'A', count: 14, pct: 1.4, description: 'Perfil ideal Meta: ambas redes activas, handles coinciden, sweet spot de seguidores, sin página de FB comercial' },
    { tier: 'B', count: 370, pct: 37.0, description: 'Muy buen candidato: cumple la mayoría de reglas, solo falta 1-2 criterios menores' },
    { tier: 'C', count: 246, pct: 24.6, description: 'Candidato viable para segunda ronda: cumple lo básico pero no es perfil premium' },
    { tier: 'D', count: 369, pct: 36.9, description: 'No califica: le falta info clave (sin Instagram, o tiene página de Facebook comercial que descalifica para Meta)' },
  ],
  fbStatus: [
    { status: 'fb_profile (califica)', count: 808, pct: 80.9, good: true },
    { status: 'con_fb_page (no califica)', count: 191, pct: 19.1, good: false },
  ],
  handleMatch: [
    { type: 'exact', count: 342, pct: 34.2, description: 'IG y TT normalizados son iguales' },
    { type: 'similar', count: 86, pct: 8.6, description: 'Uno contiene al otro' },
    { type: 'different', count: 202, pct: 20.2, description: 'No coinciden' },
    { type: 'no_data', count: 369, pct: 36.9, description: 'Falta uno de los dos handles' },
  ],
  topRanked: [
    { email: 'raquelamdal@gmail.com', tier: 'A', score: 13, ttFollowers: 494256, igFollowers: 131741, verified: false, fb: 'fb_profile', match: 'exact' },
    { email: 'beccaingleblog@gmail.com', tier: 'A', score: 13, ttFollowers: 491321, igFollowers: 147223, verified: true, fb: 'fb_profile', match: 'exact' },
    { email: 'rachelraysocials@gmail.com', tier: 'A', score: 13, ttFollowers: 489740, igFollowers: 122663, verified: true, fb: 'fb_profile', match: 'exact' },
    { email: 'cauaobeidusa@gmail.com', tier: 'A', score: 13, ttFollowers: 487770, igFollowers: 141551, verified: true, fb: 'fb_profile', match: 'exact' },
    { email: 'contactmesnarky@gmail.com', tier: 'A', score: 13, ttFollowers: 487080, igFollowers: 139689, verified: true, fb: 'fb_profile', match: 'exact' },
    { email: 'kvngdeonmgmt@gmail.com', tier: 'A', score: 13, ttFollowers: 477814, igFollowers: 182164, verified: false, fb: 'fb_profile', match: 'exact' },
    { email: 'obi.skyfashion@gmail.com', tier: 'A', score: 13, ttFollowers: 465692, igFollowers: 134385, verified: false, fb: 'fb_profile', match: 'exact' },
    { email: 'blaine@viralnationtalent.com', tier: 'A', score: 13, ttFollowers: 462883, igFollowers: 114518, verified: false, fb: 'fb_profile', match: 'exact' },
    { email: 'relatablelaura@gmail.com', tier: 'A', score: 13, ttFollowers: 462177, igFollowers: 172951, verified: false, fb: 'fb_profile', match: 'exact' },
    { email: 'shay@vitalinfluence.com', tier: 'A', score: 13, ttFollowers: 453364, igFollowers: 132045, verified: false, fb: 'fb_profile', match: 'exact' },
  ],
  projection: {
    samplePct: 999 / 18907,
    fullBucketRecords: 18907,
    projectedTierA: 265,
    projectedTierAB: 7272,
    projectedTierABC: 11929,
    projectedDiscarded: 6984,
  },
}

// Plan de cohortes (horario CDMX — Mexico Central Time UTC-6)
export const COHORT_PLAN = [
  {
    id: 'C1-A',
    date: '2026-04-20',
    dayOfWeek: 'Lunes',
    hour: '15:00',
    hourEt: '17:00 ET',
    timezone: 'CDMX',
    audience: 'TT_500k-1M_fresh (sample)',
    volume: 500,
    sender: 'apply@creators.elevn.me',
    template: 559,
    templateName: 'Intro Fast Track V1',
    expectedOr: 7.3,
    status: 'planned',
  },
  {
    id: 'C1-B',
    date: '2026-04-20',
    dayOfWeek: 'Lunes',
    hour: '15:05',
    hourEt: '17:05 ET',
    timezone: 'CDMX',
    audience: 'WARM_REOPENERS_500k-1M',
    volume: 500,
    sender: 'apply@creators.elevn.me',
    template: 561,
    templateName: 'Follow-up (pending)',
    expectedOr: 18.0,
    status: 'pending-template',
  },
  {
    id: 'C2',
    date: '2026-04-21',
    dayOfWeek: 'Martes',
    hour: '20:00',
    hourEt: '22:00 ET',
    timezone: 'CDMX',
    audience: 'TT_1M-5M_fresh (sample)',
    volume: 500,
    sender: 'apply@creators.elevnhub.me',
    template: 559,
    templateName: 'Intro Fast Track V1',
    expectedOr: 5.7,
    status: 'planned',
  },
  {
    id: 'C3',
    date: '2026-04-26',
    dayOfWeek: 'Domingo',
    hour: '17:00',
    hourEt: '19:00 ET',
    timezone: 'CDMX',
    audience: 'TT_500k-1M_fresh batch 2',
    volume: 500,
    sender: 'apply@creators.elevn.me',
    template: 559,
    templateName: 'Intro Fast Track V1',
    expectedOr: 7.3,
    status: 'planned',
  },
]

// Listas disponibles
export const LISTS_AVAILABLE = [
  { name: 'TT_500k-1M_fresh', tipo: 'Fresh', contactos: 4084, priority: 1, emoji: '⭐' },
  { name: 'TT_1M-5M_fresh', tipo: 'Fresh', contactos: 4443, priority: 2, emoji: '' },
  { name: 'TT_100k-500k_fresh', tipo: 'Fresh', contactos: 18907, priority: 3, emoji: '' },
  { name: 'WARM_REOPENERS_500k-1M', tipo: 'Warm', contactos: 537, priority: 1, emoji: '' },
  { name: 'WARM_REOPENERS_1M-5M', tipo: 'Warm', contactos: 237, priority: 2, emoji: '' },
  { name: 'WARM_REOPENERS_100k-500k', tipo: 'Warm', contactos: 1672, priority: 3, emoji: '' },
]

// Daily OR drop 14-17 abr (la crisis que detonó el análisis)
export const DAILY_DROP = [
  { date: '2026-04-13', camps: 1, sent: 500, delivered: 466, opens: 217, orPct: 46.6, label: 'Pre-crisis' },
  { date: '2026-04-14', camps: 3, sent: 562, delivered: 464, opens: 153, orPct: 33.0, label: 'Buen día' },
  { date: '2026-04-15', camps: 6, sent: 1353, delivered: 1279, opens: 133, orPct: 10.4, label: 'Empieza caída' },
  { date: '2026-04-16', camps: 5, sent: 1131, delivered: 1117, opens: 46, orPct: 4.1, label: 'Quemado' },
  { date: '2026-04-17', camps: 6, sent: 1296, delivered: 1285, opens: 34, orPct: 2.6, label: 'Crítico' },
]

// Branch integration
export const BRANCH_INTEGRATION = {
  problem: 'QR estático en emails no trackeado por Brevo — 0 clicks reportados pese a scans reales',
  solution: 'Branch.io short links + Supabase Storage CDN para QR hosting',
  infrastructure: [
    { name: 'Branch.io plan', detail: 'Activation Basics ($17/mes · 10k links · 150k clicks)', status: '✅' },
    { name: 'Branch link activo', detail: 'https://3c7t6.app.link/gMMTLRC6p2b → FB Creator signup', status: '✅' },
    { name: 'Supabase bucket público', detail: 'brevo-assets/qr/intro_fast_track_v1.png', status: '✅' },
    { name: 'Template 557 (test)', detail: 'QR + Branch link + botón Apply Now — validación E2E', status: '✅' },
    { name: 'Template 559 (producción)', detail: 'QR Branch integrado + contact_id query param', status: '✅' },
    { name: 'Webhook → Supabase (pendiente)', detail: 'Persistir cada scan en tabla branch_events', status: '⏳' },
  ],
  e2eValidation: {
    testsRun: 7,
    successful: 7,
    mobileScansRegistered: true,
    clicksBeforeTest: 2,
    clicksAfterMobileScan: 5,
    note: 'Confirmado: scans móviles de QR estático SÍ se registran en Branch (cualquier hit al short link = click)',
  },
}

// Timeline mensual de campañas (fuente: brevo_campaigns + brevo_creator_stats)
export const MONTHLY_TIMELINE = [
  { month: '2025-11', label: 'Nov 2025', camps: 1, delivered: 0, opens: 0 },
  { month: '2025-12', label: 'Dic 2025', camps: 45, delivered: 0, opens: 12 },
  { month: '2026-01', label: 'Ene 2026', camps: 35, delivered: 9828, opens: 448 },
  { month: '2026-02', label: 'Feb 2026', camps: 17, delivered: 5513, opens: 188 },
  { month: '2026-03', label: 'Mar 2026', camps: 215, delivered: 10455, opens: 498 },
  { month: '2026-04', label: 'Abr 2026 (parcial)', camps: 20, delivered: 2484, opens: 174 },
]

// Universo TikTok — contexto global
export const UNIVERSE_CONTEXT = {
  totalRecords: 3948092,
  usCreators: 2515232,
  caCreators: 74639,
  usWithEmail: 305026,
  caWithEmail: 12832,
  usPlus100k: 100556,
  caPlus100k: null,
  description: 'Base de datos global de TikTok con casi 4 millones de registros. De ahí filtramos solo Estados Unidos y Canadá (~2.6M), luego solo los que tienen email público, luego los de 100k+ seguidores. Es el pipeline que nos llevó a los 27 mil candidatos reales.',
}

// Audience search — TikTok universe
export const AUDIENCE_SEARCH = {
  universeSource: 'usca_clean_emails.csv (35,723 TikTok creators con email limpio)',
  filters: [
    { rule: 'region = US', kept: 33155, eliminated: 2568 },
    { rule: '+ follower_count ≥ 100k', kept: 29283, eliminated: 3872 },
    { rule: '+ sin role-based (admin@, sales@, info@, ...)', kept: 28776, eliminated: 507 },
    { rule: '+ email sintácticamente válido RFC', kept: 28776, eliminated: 0 },
    { rule: '+ dedup por email', kept: 27509, eliminated: 1267 },
    { rule: '+ exclusión master (HBs + listas_x_excluir)', kept: 27073, eliminated: 436 },
  ],
  totalAvailable: 27073,
  excludedFromMaster: 3004,
}

// Reglas del pipeline
export const PIPELINE_RULES = [
  {
    id: 'handle-match',
    name: 'Handle Match (IG = TikTok)',
    description: 'Normalizar ambos handles (lower, quitar @, ., _) y comparar',
    classes: [
      { label: 'exact', pts: 3, description: 'Son idénticos normalizados' },
      { label: 'similar', pts: 1, description: 'Uno contiene al otro' },
      { label: 'different', pts: 0, description: 'No coinciden' },
      { label: 'no_data', pts: 0, description: 'Falta uno' },
    ],
  },
  {
    id: 'fb-check',
    name: 'Facebook Page Status',
    description: 'Construir facebook.com/{handle}, consultar Apify facebook-pages-scraper',
    classes: [
      { label: 'sin_fb', pts: 2, description: 'No tiene página — CALIFICA para Meta', good: true },
      { label: 'fb_profile', pts: 2, description: 'Solo perfil personal — CALIFICA', good: true },
      { label: 'con_fb_page', pts: 0, description: 'Página real — NO califica', good: false },
    ],
  },
  {
    id: 'scoring',
    name: 'Scoring Perfil Ideal Meta (0-17 pts)',
    description: 'Suma ponderada de criterios',
    criteria: [
      { criterion: 'Ambas redes activas (IG+TT)', pts: 3 },
      { criterion: 'Handle exacto', pts: 3 },
      { criterion: 'Handle similar', pts: 1 },
      { criterion: 'IG sweet spot (110K-200K)', pts: 2 },
      { criterion: 'TT sweet spot (110K-200K)', pts: 2 },
      { criterion: 'Nicho alineado', pts: 2 },
      { criterion: 'Sin FB Page', pts: 2 },
      { criterion: 'Nombre válido', pts: 1 },
      { criterion: 'TT Avg Plays ≥ 30K', pts: 1 },
    ],
    tiers: [
      { tier: 'A', range: '12-17 pts' },
      { tier: 'B', range: '8-11 pts' },
      { tier: 'C', range: '4-7 pts' },
      { tier: 'D', range: '0-3 pts' },
    ],
  },
]

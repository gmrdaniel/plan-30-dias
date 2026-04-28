/**
 * Plan de ramp-up estándar para buzones con warmup ≥21 días, rep ≥99%, 0 bounces.
 * Cadencia: +5/buzón cada 7 días.
 */
export interface RampPeriod {
  label: string
  daysFromNow: number
  metaPerInbox: number
  formsPerInbox: number
}

export const RAMP_PLAN: RampPeriod[] = [
  { label: 'Hoy (día 21 warmup)', daysFromNow: 0, metaPerInbox: 20, formsPerInbox: 25 },
  { label: 'Día 28 (+7)',          daysFromNow: 7, metaPerInbox: 25, formsPerInbox: 30 },
  { label: 'Día 35 (+14)',         daysFromNow: 14, metaPerInbox: 30, formsPerInbox: 35 },
  { label: 'Día 42 (+21)',         daysFromNow: 21, metaPerInbox: 35, formsPerInbox: 40 },
  { label: 'Día 49 (+28)',         daysFromNow: 28, metaPerInbox: 40, formsPerInbox: 45 },
  { label: 'Día 56 (+35)',         daysFromNow: 35, metaPerInbox: 45, formsPerInbox: 50 },
  { label: 'Tope sano',            daysFromNow: 42, metaPerInbox: 50, formsPerInbox: 50 },
]

export interface RampRule {
  type: 'go' | 'stop'
  text: string
}

export const RAMP_RULES: RampRule[] = [
  { type: 'go', text: 'Reputación ≥99% últimos 7 días' },
  { type: 'go', text: 'Bounce rate <2% acumulado' },
  { type: 'go', text: 'Spam complaints = 0' },
  { type: 'go', text: '0 inboxes "blocked" o "disconnected"' },
  { type: 'go', text: 'Reply rate ≥0.5%' },
  { type: 'stop', text: 'Reputación cayó <95%' },
  { type: 'stop', text: 'Bounce rate >5% últimos 7 días' },
  { type: 'stop', text: 'Cualquier complaint reportado' },
  { type: 'stop', text: 'Algún inbox marca warning' },
  { type: 'stop', text: 'Reply rate cayó a ~0% (señal de spam folder)' },
]

export interface MonitoringSource {
  priority: number
  title: string
  url?: string
  description: string
  cost: 'free' | 'paid' | 'included'
  badge?: string
}

export const MONITORING_SOURCES: MonitoringSource[] = [
  {
    priority: 1,
    title: 'Smartlead Dashboard · Email Accounts',
    url: 'https://app.smartlead.ai/app/email-accounts',
    description: 'Por cada inbox: warmup status, reputation %, total sent, bounces. La fuente más directa para gestión diaria.',
    cost: 'included',
    badge: 'PRIMARY',
  },
  {
    priority: 1,
    title: 'Smartlead · Master Inbox',
    url: 'https://app.smartlead.ai/app/master-inbox',
    description: 'Bounces y replies en tiempo real. Filtrar por campaña para ver pendientes.',
    cost: 'included',
  },
  {
    priority: 1,
    title: 'Smartlead · Send Forecast (campaign reports)',
    description: 'Por campaña → Reports → Send Forecast Hourly. Exportar CSV para alimentar tabla meta_hourly_sends.',
    cost: 'included',
  },
  {
    priority: 2,
    title: 'Google Postmaster Tools',
    url: 'https://postmaster.google.com',
    description: 'Spam Rate, Domain Reputation, IP Reputation, Authentication Status, Encryption. Requiere verificación DNS TXT por dominio.',
    cost: 'free',
    badge: 'SETUP PENDIENTE',
  },
  {
    priority: 2,
    title: 'Microsoft SNDS',
    url: 'https://sendersupport.olc.protection.outlook.com/snds/',
    description: 'Visibilidad de reputación e volumen visto por Microsoft (Outlook/Hotmail). Requiere registro.',
    cost: 'free',
  },
  {
    priority: 3,
    title: 'MXToolbox · Blacklist Check',
    url: 'https://mxtoolbox.com/blacklists.aspx',
    description: 'Chequea si los IPs/dominios están en alguna blacklist pública. Revisar 1× por mes mínimo.',
    cost: 'free',
  },
  {
    priority: 3,
    title: 'Mail-Tester',
    url: 'https://www.mail-tester.com',
    description: 'Manda un email de prueba y devuelve score 0-10 + diagnóstico SPF/DKIM/DMARC + spam triggers.',
    cost: 'free',
  },
  {
    priority: 3,
    title: 'DMARC Analyzer (Dmarcian)',
    url: 'https://dmarcian.com/dmarc-tools/',
    description: 'Revisa políticas DMARC de cada dominio. Útil para confirmar p=quarantine/reject.',
    cost: 'free',
  },
  {
    priority: 4,
    title: 'Postmark Activity / Sendforensics',
    description: 'Reportes DMARC agregados, alertas de spoofing, dashboards históricos. Vale la pena para volúmenes >1000/día.',
    cost: 'paid',
    badge: '$50-200/mes',
  },
  {
    priority: 4,
    title: 'Dashboard interno · /meta-reporte y /formularios-reporte',
    description: 'Cap compliance, OR trends, cap reached signals en hourly chart. Refresca con snapshot.',
    cost: 'included',
  },
]

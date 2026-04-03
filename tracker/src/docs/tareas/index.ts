import T01 from './T01-dominios-email-dns-warmup.md?raw'
import T02 from './T02-hubspot-crm.md?raw'
import T03 from './T03-telegram-relay-alertas.md?raw'
import T04 from './T04-documentos-icp.md?raw'
import T05 from './T05-linkedin-instagram-outreach.md?raw'
import T06 from './T06-clay-smartscout-apify.md?raw'
import T02_LIC from './T02-hubspot-licencias.md?raw'
import T06_API from './T06-clay-smartscout-apify-api.md?raw'
import T06_IMPL from './T06-implementacion-crm-orquestador.md?raw'
import T07 from './T07-smartlead-expandi-justcall.md?raw'
import T08 from './T08-manychat-whatsapp-branch-twilio.md?raw'
import T09 from './T09-sendspark-elevenlabs-klaviyo.md?raw'
import T10 from './T10-slybroadcast-socialblade-outgrow.md?raw'
import T11 from './T11-clay-cascade-1000-prospectos.md?raw'
import T12 from './T12-flujos-manychat-completos.md?raw'
import T13 from './T13-discord-whatsapp-communities.md?raw'
import T14 from './T14-testing-e2e-integraciones.md?raw'
import T15 from './T15-documentacion-arquitectura-loom.md?raw'
import T16 from './T16-micrositios-leadmagnets.md?raw'
import T17 from './T17-monitoreo-competitivo-routable.md?raw'
import T18 from './T18-monitoreo-diario-mantenimiento.md?raw'
import T19 from './T19-evaluacion-escalamiento.md?raw'
import T20 from './T20-retrospectiva-sprint.md?raw'

export const TASK_EXTRA_TABS: Record<string, { label: string; content: string }[]> = {
  'T02': [{ label: 'Licencias', content: T02_LIC }],
  'T06': [{ label: 'Detalle API', content: T06_API }],
}

export const TASK_ANNEXES: Record<string, { label: string; filename: string; content: string }[]> = {
  'T06': [{ label: 'Implementación CRM Orquestador', filename: 'T06-implementacion-crm-orquestador.md', content: T06_IMPL }],
}

export const TASK_DETAIL_MD: Record<string, string> = {
  'T01': T01,
  'T02': T02,
  'T03': T03,
  'T04': T04,
  'T05': T05,
  'T06': T06,
  'T07': T07,
  'T08': T08,
  'T09': T09,
  'T10': T10,
  'T11': T11,
  'T12': T12,
  'T13': T13,
  'T14': T14,
  'T15': T15,
  'T16': T16,
  'T17': T17,
  'T18': T18,
  'T19': T19,
  'T20': T20,
}

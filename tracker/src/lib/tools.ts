export interface ToolInfo {
  name: string
  url: string
  description: string
  cost?: string
  category?: string
}

const TOOL_CATALOG: Record<string, ToolInfo> = {
  smartlead: { name: 'Smartlead', url: 'https://smartlead.ai', description: 'Cold Email con calentamiento de cuentas y rotacion.', cost: '$94/mes', category: 'Email Masivo' },
  namecheap: { name: 'Namecheap', url: 'https://www.namecheap.com', description: 'Registro de dominios secundarios para outreach.', cost: '~$12/dominio', category: 'Infraestructura' },
  google_workspace: { name: 'Google Workspace', url: 'https://admin.google.com', description: 'Cuentas de email corporativo (SMTP/IMAP).', cost: '~$7.20/usuario/mes', category: 'Infraestructura' },
  google_postmaster: { name: 'Google Postmaster Tools', url: 'https://postmaster.google.com', description: 'Monitoreo de reputacion de dominios de email.', category: 'Monitoreo' },
  mxtoolbox: { name: 'MxToolbox', url: 'https://mxtoolbox.com', description: 'Verificacion de DNS: SPF, DKIM, DMARC.', category: 'Monitoreo' },
  mail_tester: { name: 'Mail-Tester', url: 'https://www.mail-tester.com', description: 'Score de calidad de email (objetivo: 9/10+).', category: 'Monitoreo' },
  hubspot: { name: 'HubSpot CRM', url: 'https://app.hubspot.com', description: 'CRM central. Pipelines B2B y Creadores, contactos, automatizacion.', cost: 'Free', category: 'CRM' },
  telegram: { name: 'Telegram', url: 'https://telegram.org', description: 'Comunicacion interna y alertas en tiempo real entre equipos.', cost: 'Free', category: 'Comunicacion' },
  relay: { name: 'Relay.app', url: 'https://www.relay.app', description: 'Automatizacion visual de flujos. Conecta HubSpot → Telegram.', cost: '$9/mes', category: 'Automatizacion' },
  clay: { name: 'Clay', url: 'https://www.clay.com', description: 'Hub de enriquecimiento B2B en cascada con IA. Logica de calificacion de prospectos.', cost: '$149-495/mes', category: 'Extraccion / Enriquecimiento' },
  smartscout: { name: 'SmartScout', url: 'https://www.smartscout.com', description: 'Inteligencia de vendedores de Amazon. Ingresos, anuncios, brechas de video.', cost: '$97/mes', category: 'Extraccion / Enriquecimiento' },
  apify: { name: 'Apify', url: 'https://www.apify.com', description: 'Web Scraping: Meta Ads Library, tiendas Shopify, Instagram, LinkedIn.', cost: '$49/mes', category: 'Extraccion / Enriquecimiento' },
  expandi: { name: 'Expandi', url: 'https://expandi.io', description: 'Automatizacion segura de LinkedIn. Conexiones, DMs, engagement con IP residencial.', cost: '$99/mes', category: 'Mensajeria y RRSS' },
  justcall: { name: 'JustCall', url: 'https://justcall.io', description: 'Telefonia en la nube y SMS integrado a CRM. Marcador para ventas.', cost: '$30/mes', category: 'Audio y Llamadas' },
  manychat: { name: 'ManyChat', url: 'https://manychat.com', description: 'Chatbots para Instagram DM y WhatsApp. Cualificacion y onboarding automatizado.', cost: '$65/mes', category: 'Mensajeria y RRSS' },
  branch: { name: 'Branch.io', url: 'https://branch.io', description: 'Deep linking y atribucion. Traspaso escritorio-a-movil sin fricccion.', cost: 'Free', category: 'Infraestructura' },
  twilio: { name: 'Twilio', url: 'https://www.twilio.com', description: 'API de SMS/RCS para EE.UU. y Mexico. Registro A2P 10DLC.', cost: '~$30/mes', category: 'Mensajeria y RRSS' },
  sendspark: { name: 'Sendspark', url: 'https://www.sendspark.com', description: 'Videos personalizados con IA para alcance B2B. Variables dinamicas por prospecto.', cost: '$129/mes', category: 'Video e IA Visual' },
  elevenlabs: { name: 'ElevenLabs', url: 'https://elevenlabs.io', description: 'Clonacion de voz con IA para notas de voz de WhatsApp personalizadas.', cost: '$99/mes', category: 'Video e IA Visual' },
  klaviyo: { name: 'Klaviyo', url: 'https://www.klaviyo.com', description: 'Automatizacion de Email/SMS. Recuperacion de abandono de onboarding Elevn.', cost: '$20/mes', category: 'Email Masivo' },
  slybroadcast: { name: 'Slybroadcast', url: 'https://www.slybroadcast.com', description: 'Entrega de buzon de voz sin timbre (ringless voicemail).', cost: '$175 paquete', category: 'Audio y Llamadas' },
  socialblade: { name: 'Social Blade', url: 'https://socialblade.com', description: 'Estadisticas y seguimiento de creadores. Suscriptores, ingresos, idioma.', cost: '$4/mes', category: 'Extraccion / Enriquecimiento' },
  outgrow: { name: 'Outgrow', url: 'https://outgrow.co', description: 'Contenido interactivo: calculadoras de ROI, quizzes, herramientas de evaluacion.', cost: '$22/mes', category: 'Ventas y Cierre' },
  unbounce: { name: 'Unbounce', url: 'https://unbounce.com', description: 'Landing pages B2B con reemplazo dinamico de texto (DTR) por prospecto.', cost: '$99/mes', category: 'Infraestructura' },
  leadpages: { name: 'Leadpages', url: 'https://www.leadpages.com', description: 'Micrositios de creadores con calculadoras de ganancias y campos dinamicos.', cost: '$49/mes', category: 'Infraestructura' },
  google_alerts: { name: 'Google Alerts', url: 'https://www.google.com/alerts', description: 'Monitoreo automatico de competidores y keywords de la industria.', cost: 'Free', category: 'Monitoreo' },
  visualping: { name: 'Visualping', url: 'https://visualping.io', description: 'Monitoreo de cambios en sitios web de competidores y precios.', cost: '$25/mes', category: 'Monitoreo' },
  routable: { name: 'Routable', url: 'https://routable.com', description: 'Automatizacion de pagos masivos a creadores. W-8/W-9, 1099.', cost: '~$500/mes', category: 'Infraestructura / Ops' },
  discord: { name: 'Discord', url: 'https://discord.com', description: 'Comunidad de creadores. Canales de voz, AMAs, masterclasses.', cost: 'Free', category: 'Comunicacion' },
  whatsapp_business: { name: 'WhatsApp Business', url: 'https://business.whatsapp.com', description: 'API oficial de WhatsApp para mensajeria automatizada y templates.', category: 'Mensajeria y RRSS' },
  linkedin: { name: 'LinkedIn', url: 'https://www.linkedin.com', description: 'Red profesional. Cuentas de outreach para conexiones y DMs B2B.', category: 'Mensajeria y RRSS' },
  instagram: { name: 'Instagram', url: 'https://www.instagram.com', description: 'Cuenta de outreach para reclutamiento de creadores via DM.', category: 'Mensajeria y RRSS' },
  supabase: { name: 'Supabase', url: 'https://supabase.com/dashboard', description: 'Base de datos PostgreSQL. Sync de prospectos Clay y creadores ManyChat.', cost: 'Free tier', category: 'Infraestructura' },
  loom: { name: 'Loom', url: 'https://www.loom.com', description: 'Grabacion de video para documentar arquitectura de pipelines.', cost: 'Free', category: 'Comunicacion' },
  guidde: { name: 'Guidde', url: 'https://www.guidde.com', description: 'Generacion de guias y documentacion visual con IA. Videos paso a paso automaticos.', cost: 'Free / $16/mes', category: 'Comunicacion' },
}

// Map task_id → tool keys
const TASK_TOOLS: Record<string, string[]> = {
  'T01': ['namecheap', 'google_workspace', 'smartlead', 'google_postmaster', 'mxtoolbox', 'mail_tester'],
  'T02': ['hubspot'],
  'T03': ['telegram', 'relay'],
  'T04': [],
  'T05': ['linkedin', 'instagram'],
  'T06': ['clay', 'smartscout', 'apify'],
  'T07': ['smartlead', 'expandi', 'justcall'],
  'T08': ['manychat', 'whatsapp_business', 'branch', 'twilio'],
  'T09': ['sendspark', 'elevenlabs', 'klaviyo'],
  'T10': ['slybroadcast', 'socialblade', 'outgrow'],
  'T11': ['clay', 'smartscout', 'apify'],
  'T11-B': ['clay', 'supabase'],
  'T12': ['manychat', 'branch', 'whatsapp_business'],
  'T13': ['discord', 'whatsapp_business'],
  'T14': ['hubspot', 'telegram', 'smartlead', 'expandi', 'manychat', 'branch'],
  'T15': ['loom', 'guidde'],
  'T16': ['unbounce', 'leadpages', 'outgrow'],
  'T17': ['google_alerts', 'visualping', 'routable'],
  'T18': ['google_postmaster', 'mxtoolbox', 'mail_tester', 'smartlead', 'expandi', 'linkedin', 'instagram'],
  'T19': [],
  'T20': [],
}

export function getTaskTools(taskId: string): ToolInfo[] {
  const keys = TASK_TOOLS[taskId] || []
  return keys.map((k) => TOOL_CATALOG[k]).filter(Boolean)
}

export interface ToolInfo {
  name: string
  url: string
  cost?: string
}

const TOOL_CATALOG: Record<string, ToolInfo> = {
  smartlead: { name: 'Smartlead', url: 'https://smartlead.ai', cost: '$94/mes' },
  namecheap: { name: 'Namecheap', url: 'https://www.namecheap.com', cost: '~$12/dominio' },
  google_workspace: { name: 'Google Workspace', url: 'https://admin.google.com', cost: '~$7.20/usuario/mes' },
  google_postmaster: { name: 'Google Postmaster Tools', url: 'https://postmaster.google.com' },
  mxtoolbox: { name: 'MxToolbox', url: 'https://mxtoolbox.com' },
  mail_tester: { name: 'Mail-Tester', url: 'https://www.mail-tester.com' },
  hubspot: { name: 'HubSpot CRM', url: 'https://app.hubspot.com', cost: 'Free' },
  slack: { name: 'Slack', url: 'https://slack.com', cost: 'Free' },
  relay: { name: 'Relay.app', url: 'https://www.relay.app', cost: '$9/mes' },
  clay: { name: 'Clay', url: 'https://www.clay.com', cost: '$149-495/mes' },
  smartscout: { name: 'SmartScout', url: 'https://www.smartscout.com', cost: '$97/mes' },
  apify: { name: 'Apify', url: 'https://www.apify.com', cost: '$49/mes' },
  expandi: { name: 'Expandi', url: 'https://expandi.io', cost: '$99/mes' },
  justcall: { name: 'JustCall', url: 'https://justcall.io', cost: '$30/mes' },
  manychat: { name: 'ManyChat', url: 'https://manychat.com', cost: '$65/mes' },
  branch: { name: 'Branch.io', url: 'https://branch.io', cost: 'Free' },
  twilio: { name: 'Twilio', url: 'https://www.twilio.com', cost: '~$30/mes' },
  sendspark: { name: 'Sendspark', url: 'https://www.sendspark.com', cost: '$129/mes' },
  elevenlabs: { name: 'ElevenLabs', url: 'https://elevenlabs.io', cost: '$99/mes' },
  klaviyo: { name: 'Klaviyo', url: 'https://www.klaviyo.com', cost: '$20/mes' },
  slybroadcast: { name: 'Slybroadcast', url: 'https://www.slybroadcast.com', cost: '$175 paquete' },
  socialblade: { name: 'Social Blade', url: 'https://socialblade.com', cost: '$4/mes' },
  outgrow: { name: 'Outgrow', url: 'https://outgrow.co', cost: '$22/mes' },
  unbounce: { name: 'Unbounce', url: 'https://unbounce.com', cost: '$99/mes' },
  leadpages: { name: 'Leadpages', url: 'https://www.leadpages.com', cost: '$49/mes' },
  google_alerts: { name: 'Google Alerts', url: 'https://www.google.com/alerts', cost: 'Free' },
  visualping: { name: 'Visualping', url: 'https://visualping.io', cost: '$25/mes' },
  routable: { name: 'Routable', url: 'https://routable.com', cost: '~$500/mes' },
  discord: { name: 'Discord', url: 'https://discord.com', cost: 'Free' },
  whatsapp_business: { name: 'WhatsApp Business', url: 'https://business.whatsapp.com' },
  linkedin: { name: 'LinkedIn', url: 'https://www.linkedin.com' },
  instagram: { name: 'Instagram', url: 'https://www.instagram.com' },
  supabase: { name: 'Supabase', url: 'https://supabase.com/dashboard', cost: 'Free tier' },
  loom: { name: 'Loom', url: 'https://www.loom.com', cost: 'Free' },
}

// Map task_id → tool keys
const TASK_TOOLS: Record<string, string[]> = {
  'T01': ['namecheap', 'google_workspace', 'smartlead', 'google_postmaster', 'mxtoolbox', 'mail_tester'],
  'T02': ['hubspot'],
  'T03': ['slack', 'relay'],
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
  'T14': ['hubspot', 'slack', 'smartlead', 'expandi', 'manychat', 'branch'],
  'T15': ['loom'],
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

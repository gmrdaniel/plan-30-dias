// Branch.io webhook receiver.
//
// Branch Dashboard → Settings → Integrations → Webhooks → "Add webhook":
//   URL:  https://<project-ref>.functions.supabase.co/branch-webhook?secret=<SHARED_SECRET>
//   Method: POST
//   Events: Click, Open, Install (all you need)
//
// La función:
//   1. Valida ?secret=... contra BRANCH_WEBHOOK_SECRET (env var en Supabase)
//   2. Acepta JSON o JSON envuelto en form-encoded
//   3. Extrae campos clave + guarda payload completo en `raw` (jsonb)
//   4. INSERT a public.branch_events
//
// Logs en Supabase Dashboard → Edge Functions → branch-webhook → Logs.
//
// Para obtener el ID interno de Branch link, dejarlo en el payload `raw`.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SHARED_SECRET = Deno.env.get('BRANCH_WEBHOOK_SECRET') ?? ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface BranchPayload {
  // Branch event schema (varía por versión)
  name?: string                                 // 'CLICK' | 'OPEN' | 'INSTALL' | 'PAGEVIEW'
  event?: string                                // alternativa al campo `name`
  timestamp?: number | string                   // epoch ms o ISO
  last_attributed_touch_data?: Record<string, unknown>
  user_data?: Record<string, unknown>
  custom_data?: Record<string, unknown>
  click_id?: string
  link_id?: string
  link?: string
  url?: string
  // Cualquier otro key se preserva en raw
  [key: string]: unknown
}

function pickStr(...vals: unknown[]): string | null {
  for (const v of vals) {
    if (typeof v === 'string' && v.length > 0) return v
    if (typeof v === 'number') return String(v)
  }
  return null
}

function pickArr(v: unknown): string[] | null {
  if (Array.isArray(v) && v.every((x) => typeof x === 'string')) return v as string[]
  if (typeof v === 'string') {
    // tags vienen a veces como CSV
    return v.split(',').map((s) => s.trim()).filter(Boolean)
  }
  return null
}

function parseTimestamp(v: unknown): string | null {
  if (typeof v === 'number') {
    // epoch ms o seconds
    const ms = v > 1e12 ? v : v * 1000
    return new Date(ms).toISOString()
  }
  if (typeof v === 'string') {
    const d = new Date(v)
    if (!isNaN(d.getTime())) return d.toISOString()
  }
  return null
}

function extractFields(payload: BranchPayload) {
  const lat = (payload.last_attributed_touch_data as Record<string, unknown>) ?? {}
  const ud = (payload.user_data as Record<string, unknown>) ?? {}

  const eventType =
    pickStr(payload.name, payload.event, payload.event_type)?.toLowerCase() ?? 'unknown'

  return {
    event_timestamp: parseTimestamp(payload.timestamp ?? lat.timestamp),
    event_type: eventType,
    feature: pickStr(lat['~feature'], lat.feature, payload.feature),
    campaign: pickStr(lat['~campaign'], lat.campaign, payload.campaign),
    channel: pickStr(lat['~channel'], lat.channel, payload.channel),
    tags: pickArr(lat['~tags'] ?? lat.tags ?? payload.tags),
    branch_link: pickStr(payload.link, payload.url, lat['~referring_link']),
    link_id: pickStr(payload.link_id, lat['~id'], lat.link_id),
    os: pickStr(ud.os, payload.os),
    browser: pickStr(ud.browser, payload.browser),
    country: pickStr(ud.country, ud.geo_country_code, payload.country),
    region: pickStr(ud.region, payload.region),
    city: pickStr(ud.city, payload.city),
    referrer: pickStr(ud.http_referrer, payload.referrer),
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  // Validate shared secret
  const url = new URL(req.url)
  const provided = url.searchParams.get('secret') ?? req.headers.get('x-branch-secret') ?? ''
  if (SHARED_SECRET && provided !== SHARED_SECRET) {
    console.warn('branch-webhook: secret mismatch')
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Parse body — Branch puede mandar JSON o form-encoded
  let payloads: BranchPayload[] = []
  try {
    const ct = req.headers.get('content-type') ?? ''
    const text = await req.text()
    if (!text) {
      return new Response(JSON.stringify({ error: 'empty body' }), { status: 400, headers: corsHeaders })
    }
    let parsed: unknown
    if (ct.includes('application/x-www-form-urlencoded')) {
      const params = new URLSearchParams(text)
      const eventStr = params.get('event') ?? params.get('payload')
      parsed = eventStr ? JSON.parse(eventStr) : Object.fromEntries(params.entries())
    } else {
      parsed = JSON.parse(text)
    }
    // Branch a veces manda array de eventos
    payloads = Array.isArray(parsed) ? (parsed as BranchPayload[]) : [parsed as BranchPayload]
  } catch (e) {
    console.error('branch-webhook parse error:', e)
    return new Response(JSON.stringify({ error: 'invalid payload', detail: String(e) }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
  const rows = payloads.map((p) => ({ ...extractFields(p), raw: p }))

  const { error, data } = await supabase.from('branch_events').insert(rows).select('id')
  if (error) {
    console.error('insert error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  console.log(`branch-webhook: inserted ${rows.length} events`,
    rows.map((r) => `${r.event_type}/${r.campaign ?? '-'}`).join(', '))

  return new Response(JSON.stringify({ ok: true, inserted: rows.length, ids: data }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})

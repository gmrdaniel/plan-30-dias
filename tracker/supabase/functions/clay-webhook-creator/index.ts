// clay-webhook-creator
// =====================
// Recibe payload de Clay (workbook "Creators TT Enrichment") y persiste en
// creator_inventory + creator_social_profiles + enrichment_flags.
//
// Auth: Authorization: Bearer <CLAY_WEBHOOK_SECRET>
//
// Payload esperado (Clay outputs):
// {
//   "external_ref": { "creator_inventory_id": "uuid", "import_batch": "TT_500k-1M_..." },
//   "person":   { "first_name": "Jessica", "last_name": "Luke" },
//   "instagram": { "handle": "mrslukeslab", "followers": 250000, "bio": "...",
//                  "profile_pic_url": "...", "is_verified": false },
//   "tiktok":   { "handle": "mrslukeslab", "followers": 999625 },
//   "youtube":  { "handle": "UCyYG...", "subscribers": 50000 },
//   "enriched_at": "2026-05-02T..."
// }
//
// Idempotencia: clay_webhook_log tiene UNIQUE INDEX (creator_inventory_id, enriched_at).
// Si Clay reintenta → response 200 con status='duplicate'.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? Deno.env.get('PROJECT_URL') ?? '';
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_KEY') ?? '';
const CLAY_WEBHOOK_SECRET = Deno.env.get('CLAY_WEBHOOK_SECRET') ?? '';

interface ClayPayload {
  external_ref?: { creator_inventory_id?: string; import_batch?: string };
  person?: { first_name?: string; last_name?: string };
  instagram?: { handle?: string; followers?: number; bio?: string;
                 profile_pic_url?: string; is_verified?: boolean };
  tiktok?: { handle?: string; followers?: number };
  youtube?: { handle?: string; subscribers?: number };
  enriched_at?: string;
}

function jsonResponse(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return jsonResponse(405, { error: 'Method not allowed' });

  // Auth
  const auth = req.headers.get('authorization') || '';
  const expected = `Bearer ${CLAY_WEBHOOK_SECRET}`;
  if (!CLAY_WEBHOOK_SECRET || auth !== expected) {
    return jsonResponse(401, { error: 'Unauthorized' });
  }

  // Parse payload
  let payload: ClayPayload;
  try {
    payload = await req.json();
  } catch (_e) {
    return jsonResponse(400, { error: 'Invalid JSON body' });
  }

  const creatorId = payload.external_ref?.creator_inventory_id;
  if (!creatorId) {
    return jsonResponse(400, { error: 'Missing external_ref.creator_inventory_id' });
  }

  const enrichedAt = payload.enriched_at || new Date().toISOString();
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // 1. Insert clay_webhook_log (idempotency check)
  const { error: logErr } = await supabase
    .from('clay_webhook_log')
    .insert({
      external_ref: payload.external_ref,
      payload: payload,
      inventory_id: creatorId,
      status: 'received',
    });

  if (logErr) {
    // 23505 = unique violation → ya procesado
    if ((logErr as { code?: string }).code === '23505') {
      return jsonResponse(200, { status: 'duplicate', creator_id: creatorId });
    }
    console.error('[clay-webhook-creator] log insert failed:', logErr);
    return jsonResponse(500, { error: 'log_insert_failed', details: logErr.message });
  }

  try {
    // 2. UPDATE creator_inventory (only with non-null values)
    const ciUpdate: Record<string, unknown> = { clay_enriched_at: enrichedAt };
    if (payload.person?.first_name) ciUpdate.first_name = payload.person.first_name;
    if (payload.person?.last_name) ciUpdate.last_name = payload.person.last_name;
    if (payload.instagram?.bio) ciUpdate.bio = payload.instagram.bio;
    if (payload.instagram?.profile_pic_url) ciUpdate.cached_photo_url = payload.instagram.profile_pic_url;

    if (Object.keys(ciUpdate).length > 1) {
      const { error: ciErr } = await supabase
        .from('creator_inventory')
        .update(ciUpdate)
        .eq('id', creatorId);
      if (ciErr) console.warn('[clay-webhook-creator] CI update warn:', ciErr);
    }

    // 3. UPSERT creator_social_profiles per platform
    const profilesToUpsert: Record<string, unknown>[] = [];

    if (payload.instagram?.handle) {
      const handle = payload.instagram.handle.replace(/^@/, '').trim().toLowerCase();
      profilesToUpsert.push({
        creator_id: creatorId,
        platform: 'instagram',
        username: handle,
        account_url: `https://www.instagram.com/${handle}`,
        followers: payload.instagram.followers ?? 0,
        bio: payload.instagram.bio ?? null,
        profile_pic_url: payload.instagram.profile_pic_url ?? null,
        is_verified: payload.instagram.is_verified ?? false,
      });
    }
    if (payload.tiktok?.handle) {
      const handle = payload.tiktok.handle.replace(/^@/, '').trim().toLowerCase();
      profilesToUpsert.push({
        creator_id: creatorId,
        platform: 'tiktok',
        username: handle,
        account_url: `https://www.tiktok.com/@${handle}`,
        followers: payload.tiktok.followers ?? 0,
      });
    }
    if (payload.youtube?.handle) {
      const handle = payload.youtube.handle.replace(/^@/, '').trim();
      const isChannelId = handle.startsWith('UC');
      profilesToUpsert.push({
        creator_id: creatorId,
        platform: 'youtube',
        username: handle,
        account_url: isChannelId
          ? `https://www.youtube.com/channel/${handle}`
          : `https://www.youtube.com/@${handle}`,
        followers: payload.youtube.subscribers ?? 0,
      });
    }

    let upsertedProfiles = 0;
    for (const p of profilesToUpsert) {
      const { error: pErr } = await supabase
        .from('creator_social_profiles')
        .upsert(p, { onConflict: 'creator_id,platform' });
      if (pErr) {
        console.warn(`[clay-webhook-creator] upsert ${p.platform} fail:`, pErr);
      } else {
        upsertedProfiles++;
      }
    }

    // 4. UPSERT enrichment_flags (success)
    const expiresAt = new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString(); // 60d TTL
    await supabase
      .from('enrichment_flags')
      .upsert({
        entity_type: 'creator',
        entity_id: creatorId,
        service_code: 'enrich_via_clay_creator',
        last_run_at: new Date().toISOString(),
        result: 'success',
        expires_at: expiresAt,
        result_data: { profiles_upserted: upsertedProfiles, enriched_at: enrichedAt },
      }, { onConflict: 'entity_type,entity_id,service_code' });

    // 5. Mark log as processed
    await supabase
      .from('clay_webhook_log')
      .update({ status: 'processed', processed_at: new Date().toISOString() })
      .eq('inventory_id', creatorId)
      .eq('status', 'received');

    return jsonResponse(200, {
      status: 'processed',
      creator_id: creatorId,
      profiles_upserted: upsertedProfiles,
      ci_fields_updated: Object.keys(ciUpdate).filter((k) => k !== 'clay_enriched_at'),
    });
  } catch (e) {
    console.error('[clay-webhook-creator] processing failed:', e);
    await supabase
      .from('clay_webhook_log')
      .update({
        status: 'error',
        error_message: (e as Error).message?.slice(0, 500),
        processed_at: new Date().toISOString(),
      })
      .eq('inventory_id', creatorId)
      .eq('status', 'received');
    return jsonResponse(500, { error: 'processing_failed', message: (e as Error).message });
  }
});

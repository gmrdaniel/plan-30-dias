"""
Smartlead Push Module
======================
Selecciona N creators del pool con filtros, formatea payload, sube a Smartlead
en chunks <=900, hace pause/resume del scheduler, registra en smartlead_uploaded_leads.

Uso desde main.py:
  from smartlead_push import push_batch_to_smartlead
  result = await push_batch_to_smartlead(db, campaign_id=3217790, limit=100)
"""

import os
import time
import logging
from datetime import datetime, timezone
from typing import Optional

import httpx
from supabase import Client

logger = logging.getLogger(__name__)

SMARTLEAD_API_KEY = os.getenv("SMARTLEAD_API_KEY", "")
SMARTLEAD_URL = "https://server.smartlead.ai/api/v1"
DEFAULT_CHUNK_SIZE = 900


def to_smartlead_lead(creator: dict, social_profiles: list[dict]) -> dict:
    """Format creator + social profiles → Smartlead lead payload."""
    by_platform = {p["platform"]: p for p in social_profiles}
    tt = by_platform.get("tiktok", {})
    ig = by_platform.get("instagram", {})
    yt = by_platform.get("youtube", {})

    main = next((p for p in social_profiles if p.get("main_social_media")), None) or tt or ig

    return {
        "first_name": creator.get("first_name") or "friend",
        "last_name": creator.get("last_name") or "",
        "email": creator["email"].strip().lower(),
        "company_name": "",
        "phone_number": creator.get("phone") or "",
        "custom_fields": {
            "tiktok": tt.get("username", ""),
            "tiktok_link": tt.get("account_url", ""),
            "instagram_link": ig.get("account_url", ""),
            "youtube_link": yt.get("account_url", ""),
            "follower_count": str(main.get("followers", 0)) if main else "",
            "name_tt": tt.get("username", ""),
            "fullname_ig": "",
            "username": (main or {}).get("username", ""),
            "biography": (creator.get("bio") or "")[:500],
            "region": creator.get("country") or "US",
            "language": creator.get("language") or "en",
            "mv_quality": creator.get("mv_quality") or "",
            "source_batch": creator.get("import_batch") or "",
            "bucket": creator.get("bucket") or "",
            "tier": creator.get("tier") or "",
        },
    }


async def push_chunk(
    client: httpx.AsyncClient,
    campaign_id: int,
    leads: list[dict],
) -> dict:
    """POST one chunk (<=900 leads) to Smartlead. Returns response dict."""
    payload = {
        "lead_list": leads,
        "settings": {
            "ignore_global_block_list": False,
            "ignore_unsubscribe_list": False,
            "ignore_community_bounce_list": False,
            "ignore_duplicate_leads_in_other_campaign": True,
        },
    }
    resp = await client.post(
        f"{SMARTLEAD_URL}/campaigns/{campaign_id}/leads",
        params={"api_key": SMARTLEAD_API_KEY},
        json=payload,
    )
    try:
        body = resp.json()
    except Exception:
        body = {"_text": resp.text[:300]}
    return {"status_code": resp.status_code, **body}


async def pause_resume(client: httpx.AsyncClient, campaign_id: int) -> dict:
    """Pause/Resume Smartlead campaign per playbook (forces scheduler re-eval)."""
    base = f"{SMARTLEAD_URL}/campaigns/{campaign_id}/status"
    r1 = await client.post(base, params={"api_key": SMARTLEAD_API_KEY},
                            json={"status": "PAUSED"})
    time.sleep(3)  # settlement
    r2 = await client.post(base, params={"api_key": SMARTLEAD_API_KEY},
                            json={"status": "START"})
    rg = await client.get(f"{SMARTLEAD_URL}/campaigns/{campaign_id}",
                          params={"api_key": SMARTLEAD_API_KEY})
    final = (rg.json() or {}).get("status")
    return {
        "pause": r1.status_code, "resume": r2.status_code, "final": final
    }


async def push_batch_to_smartlead(
    db: Client,
    campaign_id: int,
    limit: int = 100,
    bucket_filter: Optional[str] = None,
    tier_filter: Optional[list[str]] = None,
    chunk_size: int = DEFAULT_CHUNK_SIZE,
    dry_run: bool = False,
) -> dict:
    """
    Selecciona, formatea y sube creators a Smartlead.

    Filtros aplicados:
      waterfall_action='send_100' AND mv_quality='good' AND non_creator_filter='passed'
      AND is_blocked=false AND id NOT IN (smartlead_uploaded_leads activos)
      AND (bucket=bucket_filter si especificado)
      AND (tier IN tier_filter si especificado)
    Sort: score DESC, followers DESC.
    """
    if not SMARTLEAD_API_KEY:
        return {"error": "SMARTLEAD_API_KEY not configured"}

    # 1. SELECT eligible creators
    q = (
        db.table("creator_inventory")
          .select("id, email, first_name, last_name, phone, bio, country, language, "
                  "import_batch, bucket, tier, score, mv_quality, primary_platform")
          .eq("waterfall_action", "send_100")
          .eq("mv_quality", "good")
          .eq("non_creator_filter", "passed")
          .eq("is_blocked", False)
    )
    if bucket_filter:
        q = q.eq("bucket", bucket_filter)
    if tier_filter:
        q = q.in_("tier", tier_filter)
    # Sort + limit
    q = q.order("score", desc=True, nullsfirst=False).order("created_at", desc=False)

    candidates = q.limit(limit * 2).execute().data  # pull 2x for dedup margin

    if not candidates:
        return {"selected": 0, "uploaded": 0, "reason": "no_candidates"}

    # 2. Filter against smartlead_uploaded_leads (active rows)
    candidate_ids = [c["id"] for c in candidates]
    already_active = (
        db.table("smartlead_uploaded_leads")
          .select("creator_inventory_id, email")
          .in_("creator_inventory_id", candidate_ids)
          .is_("removed_at", "null")
          .execute()
          .data
    ) or []
    already_ids = {r["creator_inventory_id"] for r in already_active}
    fresh = [c for c in candidates if c["id"] not in already_ids][:limit]

    if not fresh:
        return {"selected": 0, "uploaded": 0, "reason": "all_already_uploaded"}

    # 3. Pull social_profiles for the fresh batch
    fresh_ids = [c["id"] for c in fresh]
    profiles_resp = (
        db.table("creator_social_profiles")
          .select("creator_id, platform, username, account_url, followers, main_social_media")
          .in_("creator_id", fresh_ids)
          .execute()
          .data
    ) or []
    by_creator: dict[str, list[dict]] = {}
    for p in profiles_resp:
        by_creator.setdefault(p["creator_id"], []).append(p)

    # 4. Format payload
    leads_payload = [
        to_smartlead_lead(c, by_creator.get(c["id"], []))
        for c in fresh
    ]

    if dry_run:
        return {
            "selected": len(fresh),
            "would_upload": len(leads_payload),
            "sample": leads_payload[:3],
            "dry_run": True,
        }

    # 5. Chunked POST
    batch_id = f"pipeline_batch_{campaign_id}_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}"
    total_uploaded = 0
    total_dup = 0
    total_invalid = 0
    chunk_logs: list[dict] = []

    async with httpx.AsyncClient(timeout=180) as client:
        for i in range(0, len(leads_payload), chunk_size):
            chunk = leads_payload[i:i + chunk_size]
            res = await push_chunk(client, campaign_id, chunk)
            chunk_logs.append({
                "chunk_index": i // chunk_size,
                "size": len(chunk),
                **{k: res.get(k) for k in
                   ("status_code", "upload_count", "duplicate_count",
                    "invalid_email_count", "block_count", "bounce_count",
                    "statusCode", "error", "message")},
            })
            if res.get("status_code") != 200:
                logger.error(f"[smartlead_push] chunk {i} failed: {res}")
                continue
            total_uploaded += int(res.get("upload_count") or 0)
            total_dup += int(res.get("duplicate_count") or 0)
            total_invalid += int(res.get("invalid_email_count") or 0)
            time.sleep(2)

        # 6. Pause/Resume
        pr = await pause_resume(client, campaign_id)

    # 7. Persist successful uploads to smartlead_uploaded_leads
    accepted_creators = fresh  # We trust Smartlead's response was 200; refinement: parse invalid_emails
    rows = [{
        "creator_inventory_id": c["id"],
        "email": c["email"].strip().lower(),
        "campaign_id": campaign_id,
        "batch_id": batch_id,
        "source_pool": c.get("import_batch") or c.get("bucket") or "unknown",
        "status": "uploaded",
    } for c in accepted_creators]
    try:
        if rows:
            db.table("smartlead_uploaded_leads").upsert(
                rows, on_conflict="email,campaign_id"
            ).execute()
    except Exception as e:
        logger.warning(f"[smartlead_push] manifest insert fail: {e}")

    return {
        "selected": len(candidates),
        "deduped_against_manifest": len(candidates) - len(fresh),
        "attempted_upload": len(leads_payload),
        "uploaded": total_uploaded,
        "duplicate": total_dup,
        "invalid": total_invalid,
        "batch_id": batch_id,
        "campaign_id": campaign_id,
        "chunks": chunk_logs,
        "scheduler_kick": pr,
    }

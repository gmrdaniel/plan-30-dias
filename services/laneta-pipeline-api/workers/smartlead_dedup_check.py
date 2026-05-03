"""
Smartlead Cross-Campaign Dedup Check
=====================================
Pulls leads from all 6 active Meta campaigns y verifica si el email del creator
ya existe en alguna. Cache in-memory de 5min.

Returns result_label:
  'new'                  → no está en ninguna campaña
  'in_campaign:{cid}'    → ya está en esa campaña
  'in_manifest:{cid}'    → está en smartlead_uploaded_leads

Side effects:
  Si encuentra lead en una campaña pero NO en smartlead_uploaded_leads,
  hace UPSERT (backfill).

Required env: SMARTLEAD_API_KEY
"""

import os
import time
import logging
import httpx

from workers.db_helpers import safe_maybe_single

logger = logging.getLogger(__name__)

SMARTLEAD_API_KEY = os.getenv("SMARTLEAD_API_KEY", "")
SMARTLEAD_URL = "https://server.smartlead.ai/api/v1"

DEFAULT_CAMPAIGNS = [
    int(c) for c in os.getenv(
        "SMARTLEAD_META_CAMPAIGNS",
        "3212141,3217790,3213557,3213796,3224154,3224156"
    ).split(",")
    if c.strip().isdigit()
]

_CACHE = {"emails_by_campaign": {}, "fetched_at": 0}
CACHE_TTL_SECONDS = 300


async def fetch_campaign_leads(client: httpx.AsyncClient, campaign_id: int) -> set[str]:
    emails: set[str] = set()
    offset = 0
    while True:
        try:
            resp = await client.get(
                f"{SMARTLEAD_URL}/campaigns/{campaign_id}/leads",
                params={"api_key": SMARTLEAD_API_KEY, "limit": 100, "offset": offset},
            )
            resp.raise_for_status()
            data = resp.json()
            arr = data.get("data", [])
            if not arr:
                break
            for item in arr:
                em = (item.get("lead", {}).get("email") or "").strip().lower()
                if em:
                    emails.add(em)
            offset += len(arr)
            if len(arr) < 100:
                break
        except Exception as e:
            logger.warning(f"[smartlead_dedup] fetch campaign {campaign_id} fail: {e}")
            break
    return emails


async def get_smartlead_universe(force: bool = False) -> dict[int, set[str]]:
    now = time.time()
    if not force and (now - _CACHE["fetched_at"]) < CACHE_TTL_SECONDS and _CACHE["emails_by_campaign"]:
        return _CACHE["emails_by_campaign"]

    if not SMARTLEAD_API_KEY:
        raise RuntimeError("SMARTLEAD_API_KEY not configured")

    by_camp: dict[int, set[str]] = {}
    async with httpx.AsyncClient(timeout=60) as client:
        for cid in DEFAULT_CAMPAIGNS:
            by_camp[cid] = await fetch_campaign_leads(client, cid)
            logger.info(f"[smartlead_dedup] campaign {cid}: {len(by_camp[cid])} leads")

    _CACHE["emails_by_campaign"] = by_camp
    _CACHE["fetched_at"] = now
    return by_camp


async def run(db, entity_type: str, entity_id: str, config: dict) -> dict:
    if entity_type != "creator":
        return {"success": False, "error": f"Unsupported entity_type: {entity_type}"}
    if not SMARTLEAD_API_KEY:
        return {"success": False, "error": "SMARTLEAD_API_KEY not configured"}

    creator = safe_maybe_single(
        db.table("creator_inventory").select("email").eq("id", entity_id)
    )
    if not creator or not creator.get("email"):
        return {"success": False, "error": "Creator not found or no email"}

    email = creator["email"].strip().lower()

    existing = (
        db.table("smartlead_uploaded_leads")
          .select("campaign_id, status")
          .eq("email", email)
          .is_("removed_at", "null")
          .execute()
          .data
    )
    if existing:
        cids = sorted({r["campaign_id"] for r in existing})
        return {
            "success": True,
            "new_value": {"campaigns_in_manifest": cids},
            "result_label": f"in_manifest:{cids[0]}",
        }

    try:
        universe = await get_smartlead_universe(force=config.get("force_refresh", False))
    except Exception as e:
        logger.exception("[smartlead_dedup] universe fetch failed")
        return {"success": False, "error": f"smartlead_fetch:{str(e)[:100]}"}

    found_in: list[int] = [cid for cid, emails in universe.items() if email in emails]

    if not found_in:
        return {
            "success": True,
            "new_value": {"in_smartlead": False},
            "result_label": "new",
        }

    rows = [{
        "creator_inventory_id": entity_id,
        "email": email,
        "campaign_id": cid,
        "batch_id": "backfill_dedup_check",
        "source_pool": "backfill",
        "status": "uploaded",
        "notes": "Discovered via smartlead_dedup_check worker",
    } for cid in found_in]

    try:
        db.table("smartlead_uploaded_leads").upsert(
            rows, on_conflict="email,campaign_id"
        ).execute()
    except Exception as e:
        logger.warning(f"[smartlead_dedup] backfill upsert failed: {e}")

    return {
        "success": True,
        "new_value": {"in_smartlead": True, "campaigns": found_in, "backfilled": len(rows)},
        "result_label": f"in_campaign:{found_in[0]}",
    }

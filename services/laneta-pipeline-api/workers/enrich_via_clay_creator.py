"""
Enrich Via Clay (Creator) Worker — outbound
=============================================
POST a Clay HTTP-in URL del workbook "Creators TT Enrichment".
La respuesta llega async vía edge function clay-webhook-creator.

Skipeable:
  - config.skip_clay = true
  - env PIPELINE_SKIP_CLAY = 'true'
  - pipeline_config.skip_clay = true

Required env: CLAY_HTTP_IN_URL_CREATORS, CLAY_API_KEY
"""

import os
import logging
import httpx

from workers.db_helpers import safe_maybe_single

logger = logging.getLogger(__name__)

CLAY_HTTP_IN_URL = os.getenv("CLAY_HTTP_IN_URL_CREATORS", "") or os.getenv("CLAY_HTTP_IN_URL", "")
CLAY_API_KEY = os.getenv("CLAY_API_KEY", "")
CLAY_TIMEOUT = 20


def is_skip_enabled(db, config: dict) -> bool:
    if config.get("skip_clay") is True:
        return True
    if os.getenv("PIPELINE_SKIP_CLAY", "").lower() in ("true", "1", "yes"):
        return True
    try:
        row = safe_maybe_single(
            db.table("pipeline_config").select("value").eq("key", "skip_clay")
        )
        if row and row.get("value") in (True, "true", 1, "1"):
            return True
    except Exception as e:
        logger.debug(f"[clay_creator] skip_clay lookup fail: {e}")
    return False


async def run(db, entity_type: str, entity_id: str, config: dict) -> dict:
    if entity_type != "creator":
        return {"success": False, "error": f"Unsupported entity_type: {entity_type}"}

    if is_skip_enabled(db, config):
        return {"success": True, "result_label": "skipped_by_config", "new_value": {"skipped": True}}

    if not CLAY_HTTP_IN_URL or not CLAY_API_KEY:
        return {"success": False, "error": "CLAY_HTTP_IN_URL or CLAY_API_KEY not configured"}

    creator = safe_maybe_single(
        db.table("creator_inventory")
          .select("email, first_name, last_name, country, language, import_batch, bucket")
          .eq("id", entity_id)
    )
    if not creator or not creator.get("email"):
        return {"success": False, "error": "Creator not found or no email"}

    tt = (
        db.table("creator_social_profiles")
          .select("username")
          .eq("creator_id", entity_id)
          .eq("platform", "tiktok")
          .limit(1)
          .execute()
          .data
    )
    tiktok_handle = tt[0]["username"] if tt else None

    payload = {
        "external_ref": {
            "creator_inventory_id": entity_id,
            "import_batch": creator.get("import_batch"),
        },
        "creator": {
            "email": creator["email"].strip().lower(),
            "first_name": creator.get("first_name") or None,
            "last_name": creator.get("last_name") or None,
            "country": creator.get("country") or "US",
            "language": creator.get("language") or "en",
            "bucket": creator.get("bucket"),
        },
    }
    if tiktok_handle:
        payload["tiktok"] = {"handle": tiktok_handle}

    try:
        async with httpx.AsyncClient(timeout=CLAY_TIMEOUT) as client:
            resp = await client.post(
                CLAY_HTTP_IN_URL,
                json=payload,
                headers={"x-clay-webhook-auth": CLAY_API_KEY},
            )
        if resp.status_code >= 300:
            return {
                "success": False,
                "error": f"clay_http_{resp.status_code}: {resp.text[:200]}",
            }
    except httpx.TimeoutException:
        return {"success": False, "error": "clay_timeout"}
    except Exception as e:
        logger.exception(f"[clay_creator] outbound failed for {entity_id}")
        return {"success": False, "error": f"clay_outbound:{str(e)[:120]}"}

    return {
        "success": True,
        "new_value": {
            "queued_at": "now",
            "tiktok_handle": tiktok_handle,
            "clay_status_code": resp.status_code,
        },
        "result_label": "queued",
    }

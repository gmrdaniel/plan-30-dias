"""
Validate Email Worker — MillionVerifier
========================================
Replaces Hunter.io with MillionVerifier API for email deliverability validation.
- 13× cheaper than Hunter ($0.0075 vs $0.099 per email)
- Better catch-all detection
- Refunds catch-all/error credits automatically

Writes to creator_inventory:
  email_status      ('valid' | 'invalid' | 'risky' | 'catchall' | 'unknown')
  email_valid       (bool — True only if result=ok AND quality=good)
  email_validated   (true)
  mv_quality        ('good' | 'risky' | 'bad')
  mv_resultcode     (1-6)
  mv_verified_at    (timestamp)
  mv_free           (bool — gmail/yahoo/outlook personal domain)
  mv_role           (bool — info@/sales@/etc role-based per MV)
  waterfall_action  ('send_100' | 'send_50' | 'discard')

Required env: MILLIONVERIFIER_API_KEY (mandatory — fails fast if missing)
"""

import os
import re
import logging
from datetime import datetime, timezone

import httpx

from workers.db_helpers import safe_maybe_single

logger = logging.getLogger(__name__)

MV_API_KEY = os.getenv("MILLIONVERIFIER_API_KEY", "")
MV_VERIFY_URL = "https://api.millionverifier.com/api/v3/"
MV_TIMEOUT = 10
HTTP_TIMEOUT = 15

EMAIL_FORMAT_RE = re.compile(r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$")


def is_valid_format(email: str) -> bool:
    return bool(EMAIL_FORMAT_RE.match(email))


def map_result_to_email_status(result: str, quality: str) -> str:
    r = (result or "").lower()
    q = (quality or "").lower()
    if r == "ok":
        return "valid" if q == "good" else "risky"
    if r in ("invalid", "disposable"):
        return "invalid"
    if r == "catch_all":
        return "catchall"
    return "unknown"


def classify_waterfall(mv: dict) -> str:
    if mv.get("error"):
        return "discard"
    result = (mv.get("result") or "").lower()
    quality = (mv.get("quality") or "").lower()
    if result in ("invalid", "disposable") or quality == "bad":
        return "discard"
    if result == "catch_all":
        return "send_50"
    if result == "unknown":
        return "send_50"
    if result == "ok" and quality == "risky":
        return "send_50"
    if result == "ok" and quality == "good":
        return "send_100"
    return "discard"


async def verify_with_mv(email: str) -> dict:
    async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
        try:
            resp = await client.get(MV_VERIFY_URL, params={
                "api": MV_API_KEY,
                "email": email,
                "timeout": MV_TIMEOUT,
            })
        except httpx.TimeoutException:
            return {"error": "http_timeout"}
        except Exception as e:
            return {"error": f"http_{type(e).__name__}"}
        if resp.status_code != 200:
            return {"error": f"http_{resp.status_code}"}
        try:
            data = resp.json()
        except Exception:
            return {"error": "invalid_json"}
        if data.get("error"):
            return {"error": data["error"]}
        return data


async def run(db, entity_type: str, entity_id: str, config: dict) -> dict:
    if entity_type == "creator":
        table = "creator_inventory"
    elif entity_type == "client_contact":
        table = "client_contacts"
    else:
        return {"success": False, "error": f"Unsupported entity_type: {entity_type}"}

    if not MV_API_KEY:
        return {"success": False, "error": "MILLIONVERIFIER_API_KEY not configured"}

    entity = safe_maybe_single(
        db.table(table).select("email, email_status, email_valid").eq("id", entity_id)
    )
    if not entity or not entity.get("email"):
        return {"success": False, "error": "Entity not found or no email"}

    email = entity["email"].strip().lower()

    if not is_valid_format(email):
        update = {
            "email_status": "invalid",
            "email_valid": False,
            "email_validated": True,
            "waterfall_action": "discard",
            "mv_quality": "bad",
            "mv_verified_at": datetime.now(timezone.utc).isoformat(),
        }
        db.table(table).update(update).eq("id", entity_id).execute()
        return {
            "success": True,
            "old_value": {"email_status": entity.get("email_status")},
            "new_value": update,
            "result_label": "invalid_format",
        }

    mv = await verify_with_mv(email)
    if mv.get("error"):
        logger.warning(f"[validate_email_mv] MV error for {email}: {mv['error']}")
        return {
            "success": False,
            "error": f"mv_error:{mv['error']}",
            "result_label": "mv_unavailable",
        }

    result = (mv.get("result") or "").lower()
    quality = (mv.get("quality") or "").lower()
    resultcode = mv.get("resultcode")
    waterfall = classify_waterfall(mv)
    email_status = map_result_to_email_status(result, quality)
    is_valid = (result == "ok" and quality == "good")

    update = {
        "email_status": email_status,
        "email_valid": is_valid,
        "email_validated": True,
        "mv_quality": quality if quality in ("good", "risky", "bad") else None,
        "mv_resultcode": int(resultcode) if isinstance(resultcode, (int, str)) and str(resultcode).isdigit() else None,
        "mv_verified_at": datetime.now(timezone.utc).isoformat(),
        "mv_free": bool(mv.get("free")) if mv.get("free") is not None else None,
        "mv_role": bool(mv.get("role")) if mv.get("role") is not None else None,
        "waterfall_action": waterfall,
    }
    update_clean = {k: v for k, v in update.items() if v is not None}
    db.table(table).update(update_clean).eq("id", entity_id).execute()

    return {
        "success": True,
        "old_value": {
            "email_status": entity.get("email_status"),
            "email_valid": entity.get("email_valid"),
        },
        "new_value": {
            **update_clean,
            "_raw_mv": {
                "result": result, "quality": quality,
                "resultcode": resultcode, "credits": mv.get("credits"),
            },
        },
        "result_label": waterfall,
    }

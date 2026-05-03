"""
Assign Bucket Worker
=====================
Lee creator_social_profiles.followers de todas las plataformas del creator,
calcula max → bucket (100k-500k / 500k-1M / 1M-5M / 5M+).

Side effects:
  creator_inventory.bucket            (string)
  creator_inventory.primary_platform  (platform con max followers)
  creator_social_profiles.main_social_media = true en la fila top

Local worker — no API externa, no costo.
"""

import logging
from workers.db_helpers import safe_maybe_single

logger = logging.getLogger(__name__)


def followers_to_bucket(followers: int) -> str | None:
    if followers >= 5_000_000:
        return "5M+"
    if followers >= 1_000_000:
        return "1M-5M"
    if followers >= 500_000:
        return "500k-1M"
    if followers >= 100_000:
        return "100k-500k"
    return None


async def run(db, entity_type: str, entity_id: str, config: dict) -> dict:
    if entity_type != "creator":
        return {"success": False, "error": f"Unsupported entity_type: {entity_type}"}

    creator = safe_maybe_single(
        db.table("creator_inventory")
          .select("bucket, primary_platform")
          .eq("id", entity_id)
    )
    if not creator:
        return {"success": False, "error": "Creator not found"}

    profiles_resp = (
        db.table("creator_social_profiles")
          .select("id, platform, followers, main_social_media")
          .eq("creator_id", entity_id)
          .execute()
    )
    profiles = profiles_resp.data or []
    if not profiles:
        return {
            "success": True,
            "old_value": {"bucket": creator.get("bucket")},
            "new_value": None,
            "result_label": "no_social_profiles",
        }

    valid = [p for p in profiles if (p.get("followers") or 0) > 0]
    if not valid:
        return {
            "success": True,
            "old_value": {"bucket": creator.get("bucket")},
            "new_value": None,
            "result_label": "no_followers_data",
        }

    top = max(valid, key=lambda p: p["followers"])
    new_bucket = followers_to_bucket(top["followers"])
    new_primary = top["platform"]

    if new_bucket is None:
        return {
            "success": True,
            "old_value": {"bucket": creator.get("bucket")},
            "new_value": {"bucket": None, "max_followers": top["followers"]},
            "result_label": f"below_100k:{top['followers']}",
        }

    old_value = {
        "bucket": creator.get("bucket"),
        "primary_platform": creator.get("primary_platform"),
    }

    db.table("creator_inventory").update({
        "bucket": new_bucket,
        "primary_platform": new_primary,
    }).eq("id", entity_id).execute()

    db.table("creator_social_profiles").update({
        "main_social_media": False,
    }).eq("creator_id", entity_id).neq("id", top["id"]).execute()

    db.table("creator_social_profiles").update({
        "main_social_media": True,
    }).eq("id", top["id"]).execute()

    return {
        "success": True,
        "old_value": old_value,
        "new_value": {
            "bucket": new_bucket,
            "primary_platform": new_primary,
            "main_followers": top["followers"],
        },
        "result_label": new_bucket,
    }

"""
Trigger Module — cron + manual
================================
Lógica del trigger que orquesta:
  1. Pull N creators con status='inventory' AND falta validación
  2. Run pipeline (exclude_non_creator → validate_email_mv → assign_bucket
     → enrich_via_clay_creator opt → smartlead_dedup_check)
  3. Push a Smartlead los que pasaron filtros

Usado por:
  - POST /trigger/run-now {batch_size, ...}  (manual, app)
  - POST /trigger/cron-tick                  (cron Railway, sin args)

Lee config desde tabla pipeline_config.
"""

import logging
from typing import Optional

from supabase import Client

from pipeline_runner import run_simple_pipeline
from smartlead_push import push_batch_to_smartlead

logger = logging.getLogger(__name__)


# Order canónico de workers cuando viene del cron (Clay opcional)
DEFAULT_PIPELINE_STEPS = [
    "exclude_non_creator",
    "validate_email_mv",
    "assign_bucket",
    "enrich_via_clay_creator",  # se salta solo si pipeline_config.skip_clay=true
    "smartlead_dedup_check",
]


def get_config(db: Client, key: str, default=None):
    rows = (db.table("pipeline_config")
              .select("value")
              .eq("key", key)
              .limit(1)
              .execute()
              .data) or []
    if not rows:
        return default
    return rows[0]["value"]


def select_creators_for_processing(
    db: Client, limit: int, bucket_filter: Optional[str] = None,
) -> list[str]:
    """
    Pull creators que NO han sido validados todavía:
      - non_creator_filter IS NULL  (todavía no corrió el filtro role-based)
      - is_blocked=false
      - status='inventory'
      - Optional: bucket=bucket_filter
    Sort: created_at ASC (FIFO).
    """
    q = (db.table("creator_inventory")
           .select("id")
           .eq("status", "inventory")
           .eq("is_blocked", False)
           .is_("non_creator_filter", "null"))
    if bucket_filter:
        q = q.eq("bucket", bucket_filter)
    rows = q.order("created_at", desc=False).limit(limit).execute().data or []
    return [r["id"] for r in rows]


async def trigger_run(
    db: Client,
    batch_size: Optional[int] = None,
    bucket_filter: Optional[str] = None,
    push_to_smartlead: bool = True,
    dry_run: bool = False,
) -> dict:
    """
    Run del pipeline orquestado: pull → validate → push.
    """
    # 1. Resolve config defaults
    daily_avg = batch_size or int(get_config(db, "daily_avg_send", 240) or 240)
    skip_clay = bool(get_config(db, "skip_clay", False))
    active_campaign = int(get_config(db, "active_smartlead_campaign", 3217790) or 3217790)
    buckets_priority = get_config(
        db, "active_buckets_priority", ["500k-1M", "1M-5M", "100k-500k"]
    ) or ["500k-1M", "1M-5M", "100k-500k"]

    # 2. Pick creators a procesar
    target_bucket = bucket_filter or buckets_priority[0]
    creator_ids = select_creators_for_processing(db, daily_avg, target_bucket)

    # Si el primer bucket no tiene leads, prueba el siguiente
    if not creator_ids and not bucket_filter:
        for b in buckets_priority[1:]:
            creator_ids = select_creators_for_processing(db, daily_avg, b)
            if creator_ids:
                target_bucket = b
                break

    if not creator_ids:
        return {
            "status": "no_creators_to_process",
            "buckets_tried": buckets_priority if not bucket_filter else [bucket_filter],
        }

    if dry_run:
        return {
            "status": "dry_run",
            "would_process": len(creator_ids),
            "target_bucket": target_bucket,
            "active_campaign": active_campaign,
            "skip_clay": skip_clay,
            "sample_ids": creator_ids[:5],
        }

    # 3. Run pipeline (smart_skip = true: no re-procesa workers ya frescos)
    pipeline_result = await run_simple_pipeline(
        db,
        creator_ids=creator_ids,
        service_codes=DEFAULT_PIPELINE_STEPS,
        smart_skip=True,
        config_per_step={"enrich_via_clay_creator": {"skip_clay": skip_clay}},
    )

    # 4. Push a Smartlead (solo los que pasaron todo)
    push_result = None
    if push_to_smartlead:
        push_result = await push_batch_to_smartlead(
            db,
            campaign_id=active_campaign,
            limit=daily_avg,
            bucket_filter=target_bucket,
            dry_run=False,
        )

    return {
        "status": "completed",
        "target_bucket": target_bucket,
        "active_campaign": active_campaign,
        "skip_clay": skip_clay,
        "creators_processed": len(creator_ids),
        "pipeline": pipeline_result,
        "push": push_result,
    }

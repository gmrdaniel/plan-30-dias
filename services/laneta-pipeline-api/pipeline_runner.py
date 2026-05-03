"""
Pipeline Runner (simplified)
=============================
Versión mínima para probar end-to-end. Toma una lista de service_codes y los
ejecuta sobre un set de creator_ids. NO usa enrichment_pipelines table todavía
(eso queda para Fase 6 - production runner).

Uso:
  result = await run_simple_pipeline(
      db,
      creator_ids=['uuid1', 'uuid2'],
      service_codes=['exclude_non_creator', 'validate_email_mv', 'assign_bucket'],
  )
"""

import logging
from datetime import datetime, timezone, timedelta
from typing import Optional

from supabase import Client

from workers.registry import WORKER_REGISTRY

logger = logging.getLogger(__name__)


async def has_fresh_flag(db: Client, entity_type: str, entity_id: str,
                         service_code: str) -> bool:
    """Check if enrichment_flags has a non-expired row for this triple."""
    rows = (
        db.table("enrichment_flags")
          .select("expires_at, result")
          .eq("entity_type", entity_type)
          .eq("entity_id", entity_id)
          .eq("service_code", service_code)
          .limit(1)
          .execute()
          .data
    )
    if not rows:
        return False
    row = rows[0]
    if row.get("result") not in ("success", "queued"):
        return False
    exp = row.get("expires_at")
    if not exp:
        return True  # success without expiry = always fresh
    try:
        exp_dt = datetime.fromisoformat(exp.replace("Z", "+00:00"))
    except Exception:
        return False
    return exp_dt > datetime.now(timezone.utc)


async def upsert_flag(db: Client, entity_type: str, entity_id: str,
                      service_code: str, result: dict, ttl_days: int = 30) -> None:
    """UPSERT enrichment_flags after a worker runs."""
    expires = (datetime.now(timezone.utc) + timedelta(days=ttl_days)).isoformat()
    success = bool(result.get("success"))
    flag_result = "success" if success else "error"
    if result.get("result_label") == "queued":
        flag_result = "queued"
    payload = {
        "entity_type": entity_type,
        "entity_id": entity_id,
        "service_code": service_code,
        "last_run_at": datetime.now(timezone.utc).isoformat(),
        "result": flag_result,
        "expires_at": expires,
        "result_data": {
            "result_label": result.get("result_label"),
            "error": result.get("error"),
        },
    }
    try:
        db.table("enrichment_flags").upsert(
            payload, on_conflict="entity_type,entity_id,service_code"
        ).execute()
    except Exception as e:
        logger.warning(f"[runner] flag upsert fail: {e}")


async def run_simple_pipeline(
    db: Client,
    creator_ids: list[str],
    service_codes: list[str],
    smart_skip: bool = True,
    config_per_step: Optional[dict[str, dict]] = None,
) -> dict:
    """
    Run sequence of workers over a list of creators.
    Returns counters + per-creator results summary.
    """
    config_per_step = config_per_step or {}
    summary = {
        "creator_count": len(creator_ids),
        "steps": [],
        "errors_by_step": {},
    }

    for code in service_codes:
        worker = WORKER_REGISTRY.get(code)
        if not worker:
            summary["steps"].append({
                "service_code": code, "status": "skipped",
                "reason": "no_worker_registered",
            })
            continue

        success_n = 0
        error_n = 0
        skipped_n = 0
        first_error: Optional[str] = None

        # TTL lookup from enrichment_services (default 30)
        svc_row = (
            db.table("enrichment_services")
              .select("result_ttl_days")
              .eq("code", code)
              .limit(1)
              .execute()
              .data
        )
        ttl = (svc_row[0].get("result_ttl_days") if svc_row else 30) or 30

        for cid in creator_ids:
            if smart_skip and await has_fresh_flag(db, "creator", cid, code):
                skipped_n += 1
                continue
            try:
                result = await worker(db, "creator", cid, config_per_step.get(code, {}))
            except Exception as e:
                logger.exception(f"[runner] {code} crashed on {cid}")
                result = {"success": False, "error": f"crash:{e}"}

            # Persist enrichment_step_results — using a synthetic step? Skip for simplified runner.
            # Just upsert flag.
            await upsert_flag(db, "creator", cid, code, result, ttl_days=ttl)

            if result.get("success"):
                success_n += 1
            else:
                error_n += 1
                if first_error is None:
                    first_error = result.get("error") or result.get("result_label")

        summary["steps"].append({
            "service_code": code,
            "success": success_n,
            "error": error_n,
            "skipped": skipped_n,
            "first_error": first_error,
        })

    return summary

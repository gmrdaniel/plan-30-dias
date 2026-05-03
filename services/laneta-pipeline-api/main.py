"""
laneta-pipeline-api
====================
FastAPI service para el pipeline cold outreach de creators TT.
Orquesta: import CSV → MV verify → exclude non-creator → bucket → Clay (opt) →
score → smartlead dedup → push to campaign.

Deployment: Railway (CPU-only, sin GPU).
Supabase: nvbanvwibmghxroybjxp (tracker / plan_30_dias dedicated DB).
"""
from __future__ import annotations

import csv
import io
import logging
import os
from typing import Optional

from fastapi import (
    Depends, FastAPI, File, Form,
    Header, HTTPException, UploadFile,
)
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from supabase import Client, create_client

from workers.registry import WORKER_REGISTRY
from smartlead_push import push_batch_to_smartlead
from pipeline_runner import run_simple_pipeline
from trigger import trigger_run

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

API_SECRET = os.getenv("API_SECRET", "")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")
PORT = int(os.getenv("PORT", 8000))

_supabase: Optional[Client] = None


def get_supabase() -> Client:
    global _supabase
    if _supabase is None:
        if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
            raise HTTPException(500, "Supabase credentials not configured")
        _supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    return _supabase


async def verify_api_secret(x_api_secret: Optional[str] = Header(None)) -> None:
    if not API_SECRET:
        return
    if x_api_secret != API_SECRET:
        raise HTTPException(401, "Invalid API secret")


app = FastAPI(
    title="La Neta Pipeline API",
    description="Cold outreach pipeline: TT scrape → MV → Clay → Smartlead",
    version="0.1.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict:
    db_ok = False
    try:
        db = get_supabase()
        db.table("creator_inventory").select("id", count="exact").limit(0).execute()
        db_ok = True
    except Exception as e:
        logger.warning(f"[health] supabase fail: {e}")
    return {
        "status": "ok" if db_ok else "degraded",
        "supabase_connected": db_ok,
        "workers_registered": len(WORKER_REGISTRY),
        "service_codes": sorted(WORKER_REGISTRY.keys()),
    }


class TestWorkerRequest(BaseModel):
    service_code: str = Field(..., description="Worker key from WORKER_REGISTRY")
    entity_type: str = Field("creator", description="creator | client_contact")
    entity_id: str = Field(..., description="UUID of the entity")
    config: dict = Field(default_factory=dict)


@app.post("/admin/test-worker", dependencies=[Depends(verify_api_secret)])
async def test_worker(req: TestWorkerRequest) -> dict:
    worker = WORKER_REGISTRY.get(req.service_code)
    if not worker:
        raise HTTPException(
            404,
            f"Unknown service_code '{req.service_code}'. Available: {sorted(WORKER_REGISTRY.keys())}",
        )
    db = get_supabase()
    try:
        result = await worker(db, req.entity_type, req.entity_id, req.config)
    except Exception as e:
        logger.exception(f"[test-worker] {req.service_code} crashed for {req.entity_id}")
        raise HTTPException(500, f"Worker crashed: {e}")
    return {
        "service_code": req.service_code,
        "entity_type": req.entity_type,
        "entity_id": req.entity_id,
        "result": result,
    }


class ImportResult(BaseModel):
    inserted_creators: int
    inserted_social_profiles: int
    skipped_existing: int
    errors: int
    sample_ids: list[str]


@app.post("/import-tiktok-pool", dependencies=[Depends(verify_api_secret)],
          response_model=ImportResult)
async def import_tiktok_pool(
    csv_file: UploadFile = File(...),
    bucket: str = Form(...),
    source_batch: str = Form(...),
    country: str = Form("US"),
    language: str = Form("en"),
) -> ImportResult:
    if bucket not in ("100k-500k", "500k-1M", "1M-5M", "5M+"):
        raise HTTPException(400, f"Invalid bucket: {bucket}")

    db = get_supabase()
    content = await csv_file.read()
    text = content.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))

    inserted_c = 0
    inserted_sp = 0
    skipped = 0
    errors = 0
    sample_ids: list[str] = []

    def pick(row, *keys):
        for k in keys:
            v = row.get(k)
            if v and str(v).strip():
                return str(v).strip()
        return None

    for row in reader:
        try:
            email = (pick(row, "email", "Email", "EMAIL") or "").lower()
            if "@" not in email:
                errors += 1
                continue

            first_name = pick(row, "first_name", "First Name", "nickname", "Name") or "friend"
            first_name = first_name.split()[0] if first_name.split() else "friend"
            first_name = "".join(c for c in first_name if c.isalnum() or c in "-'") or "friend"

            tiktok_handle = pick(row, "tiktok_handle", "TikTok", "Username", "username")
            try:
                followers = int(pick(row, "follower_count", "followers", "Followers") or 0)
            except (ValueError, TypeError):
                followers = 0

            existing = (
                db.table("creator_inventory")
                  .select("id")
                  .eq("email", email)
                  .limit(1)
                  .execute()
                  .data
            )
            if existing:
                creator_id = existing[0]["id"]
                skipped += 1
            else:
                ins = db.table("creator_inventory").insert({
                    "email": email,
                    "first_name": first_name,
                    "country": country,
                    "language": language,
                    "status": "inventory",
                    "bucket": bucket,
                    "import_batch": source_batch,
                    "primary_platform": "tiktok",
                }).execute().data
                if not ins:
                    errors += 1
                    continue
                creator_id = ins[0]["id"]
                inserted_c += 1
                if len(sample_ids) < 5:
                    sample_ids.append(creator_id)

            if tiktok_handle:
                handle_clean = tiktok_handle.replace("@", "").strip().lower()
                try:
                    db.table("creator_social_profiles").upsert({
                        "creator_id": creator_id,
                        "platform": "tiktok",
                        "username": handle_clean,
                        "account_url": f"https://www.tiktok.com/@{handle_clean}",
                        "followers": followers,
                    }, on_conflict="creator_id,platform").execute()
                    inserted_sp += 1
                except Exception as e:
                    logger.warning(f"[import] upsert social profile fail: {e}")
        except Exception as e:
            logger.exception(f"[import] row failed: {e}")
            errors += 1

    return ImportResult(
        inserted_creators=inserted_c,
        inserted_social_profiles=inserted_sp,
        skipped_existing=skipped,
        errors=errors,
        sample_ids=sample_ids,
    )


class RunPipelineRequest(BaseModel):
    creator_ids: list[str] = Field(..., min_length=1)
    service_codes: list[str] = Field(
        default_factory=lambda: [
            "exclude_non_creator",
            "validate_email_mv",
            "assign_bucket",
            "smartlead_dedup_check",
        ],
        description="Workers en orden de ejecucion",
    )
    smart_skip: bool = Field(True, description="Use enrichment_flags TTL cache")
    config_per_step: dict = Field(default_factory=dict)


@app.post("/run-pipeline", dependencies=[Depends(verify_api_secret)])
async def run_pipeline(req: RunPipelineRequest) -> dict:
    db = get_supabase()
    return await run_simple_pipeline(
        db,
        creator_ids=req.creator_ids,
        service_codes=req.service_codes,
        smart_skip=req.smart_skip,
        config_per_step=req.config_per_step,
    )


class SmartleadPushRequest(BaseModel):
    campaign_id: int = Field(..., description="Smartlead campaign ID destino")
    limit: int = Field(100, ge=1, le=2000)
    bucket_filter: Optional[str] = None
    tier_filter: Optional[list[str]] = None
    dry_run: bool = False


@app.post("/smartlead/push-batch", dependencies=[Depends(verify_api_secret)])
async def smartlead_push_batch(req: SmartleadPushRequest) -> dict:
    db = get_supabase()
    return await push_batch_to_smartlead(
        db,
        campaign_id=req.campaign_id,
        limit=req.limit,
        bucket_filter=req.bucket_filter,
        tier_filter=req.tier_filter,
        dry_run=req.dry_run,
    )


class TriggerRunRequest(BaseModel):
    batch_size: Optional[int] = Field(None, ge=1, le=2000,
        description="Override daily_avg_send. Default: pipeline_config.daily_avg_send (240)")
    bucket_filter: Optional[str] = Field(None,
        description="Override active_buckets_priority. Ej: '500k-1M'")
    push_to_smartlead: bool = Field(True,
        description="Si false, solo corre pipeline sin push (útil para validar)")
    dry_run: bool = Field(False)


@app.post("/trigger/run-now", dependencies=[Depends(verify_api_secret)])
async def trigger_run_now(req: TriggerRunRequest) -> dict:
    """
    Trigger manual desde la app. Ejecuta el pipeline + push.
    Útil para ramp-up bajo demanda cuando se necesita más fuel en Smartlead.
    """
    db = get_supabase()
    return await trigger_run(
        db,
        batch_size=req.batch_size,
        bucket_filter=req.bucket_filter,
        push_to_smartlead=req.push_to_smartlead,
        dry_run=req.dry_run,
    )


@app.post("/trigger/cron-tick", dependencies=[Depends(verify_api_secret)])
async def trigger_cron_tick() -> dict:
    """
    Trigger del cron Railway. Sin args — usa pipeline_config defaults.
    Llamado por Railway cron job ej. cada noche 09:00 MX.
    """
    db = get_supabase()
    logger.info("[cron-tick] starting")
    result = await trigger_run(db, push_to_smartlead=True, dry_run=False)
    logger.info(f"[cron-tick] done: status={result.get('status')}")
    return result


@app.get("/admin/pipeline-config", dependencies=[Depends(verify_api_secret)])
async def get_pipeline_config() -> dict:
    db = get_supabase()
    rows = db.table("pipeline_config").select("key, value, description").execute().data
    return {r["key"]: r for r in rows}


@app.get("/admin/stats", dependencies=[Depends(verify_api_secret)])
async def admin_stats() -> dict:
    """Counts agregados para debugging."""
    db = get_supabase()
    out = {}
    for table in ("creator_inventory", "creator_social_profiles",
                  "smartlead_uploaded_leads", "enrichment_flags"):
        try:
            r = db.table(table).select("id", count="exact").limit(0).execute()
            out[table] = r.count
        except Exception as e:
            out[table] = f"err:{str(e)[:80]}"
    # Pipeline-specific counters
    try:
        res = (db.table("creator_inventory")
                 .select("waterfall_action", count="exact")
                 .eq("waterfall_action", "send_100")
                 .limit(0).execute())
        out["creator_inventory_send_100"] = res.count
    except Exception:
        pass
    return out


@app.get("/")
async def root() -> dict:
    return {"service": "laneta-pipeline-api", "version": "0.1.0", "docs": "/docs"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=False)

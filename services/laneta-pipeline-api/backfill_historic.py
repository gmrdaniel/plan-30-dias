"""
Backfill Histórico — one-shot script
======================================
Importa al Supabase del tracker:
  1. Manifest CSV local _uploaded_leads_manifest.csv (~400 entries) →
     smartlead_uploaded_leads.
  2. Pull las 6 campañas Smartlead activas → INSERT/UPDATE creator_inventory
     + smartlead_uploaded_leads (los leads ya cargados en producción).
  3. Optionally: cross-reference con MV-verified CSVs locales para hidratar
     creator_inventory con datos enriquecidos.

Idempotente: usa UPSERT en (email, campaign_id) y (email) según el caso.

Uso:
  python -m backfill_historic --manifest-only         # Solo paso 1
  python -m backfill_historic --smartlead-only        # Solo paso 2
  python -m backfill_historic --all                   # Todo (default)
  python -m backfill_historic --dry-run               # No escribe
"""

from __future__ import annotations

import argparse
import csv
import logging
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import httpx
from supabase import Client, create_client

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("backfill")

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")
SMARTLEAD_API_KEY = os.getenv("SMARTLEAD_API_KEY", "")
SMARTLEAD_URL = "https://server.smartlead.ai/api/v1"

# Paths a archivos locales (ajustar para Railway: subir al repo o pasar como arg)
DEFAULT_MANIFEST_CSV = Path("D:/CRM/brevo/plan-implementacion-abril-2026/plan-b/uploads/_uploaded_leads_manifest.csv")
ACTIVE_CAMPAIGNS = [3212141, 3217790, 3213557, 3213796, 3224154, 3224156]
CAMPAIGN_NAMES = {
    3212141: "META Plan B",
    3217790: "META Ana",
    3213557: "Form Creators 21-04a",
    3213796: "Form Creators 21-04b",
    3224154: "Form Creators 23-04a",
    3224156: "Form Creators 23-04b",
}


def get_db() -> Client:
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        sys.exit("FATAL: SUPABASE_URL or SUPABASE_SERVICE_KEY missing")
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


# ── Step 1: Import CSV manifest → smartlead_uploaded_leads ──────────────────
def import_manifest_csv(db: Client, csv_path: Path, dry_run: bool = False) -> dict:
    if not csv_path.exists():
        return {"error": f"manifest not found: {csv_path}"}

    rows = list(csv.DictReader(csv_path.open(encoding="utf-8")))
    logger.info(f"Manifest CSV: {len(rows)} rows")

    upserts = []
    for r in rows:
        email = (r.get("email") or "").strip().lower()
        if not email:
            continue
        try:
            campaign_id = int(r.get("campaign_id") or 0)
        except (ValueError, TypeError):
            continue
        if not campaign_id:
            continue
        upserts.append({
            "email": email,
            "campaign_id": campaign_id,
            "campaign_name": CAMPAIGN_NAMES.get(campaign_id, ""),
            "batch_id": r.get("batch_id") or "manifest_backfill",
            "uploaded_at": r.get("uploaded_at") or datetime.now(timezone.utc).isoformat(),
            "source_pool": r.get("source_pool") or "manifest_csv",
            "status": r.get("status") or "uploaded",
            "notes": "Imported from local _uploaded_leads_manifest.csv",
        })

    logger.info(f"  → {len(upserts)} valid rows ready to upsert")

    if dry_run:
        return {"dry_run": True, "would_upsert": len(upserts), "sample": upserts[:3]}

    if not upserts:
        return {"upserted": 0}

    # Batch upsert in chunks of 500
    total = 0
    for i in range(0, len(upserts), 500):
        chunk = upserts[i:i + 500]
        try:
            db.table("smartlead_uploaded_leads").upsert(
                chunk, on_conflict="email,campaign_id"
            ).execute()
            total += len(chunk)
            logger.info(f"  upserted chunk {i // 500 + 1}: {len(chunk)}")
        except Exception as e:
            logger.error(f"chunk {i} failed: {e}")

    return {"upserted": total, "total_rows": len(rows)}


# ── Step 2: Pull Smartlead campaigns → smartlead_uploaded_leads + creator_inv ──
def pull_smartlead_campaign(client: httpx.Client, campaign_id: int) -> list[dict]:
    leads = []
    offset = 0
    while True:
        try:
            r = client.get(
                f"{SMARTLEAD_URL}/campaigns/{campaign_id}/leads",
                params={"api_key": SMARTLEAD_API_KEY, "limit": 100, "offset": offset},
                timeout=60,
            )
            r.raise_for_status()
            arr = r.json().get("data", [])
            if not arr:
                break
            leads.extend(arr)
            offset += len(arr)
            if len(arr) < 100:
                break
        except Exception as e:
            logger.warning(f"  pull camp {campaign_id} fail at offset {offset}: {e}")
            break
    return leads


def import_smartlead_campaigns(db: Client, dry_run: bool = False) -> dict:
    if not SMARTLEAD_API_KEY:
        return {"error": "SMARTLEAD_API_KEY missing"}

    result = {"campaigns": {}, "totals": {"creators": 0, "uploaded_leads": 0}}

    with httpx.Client() as client:
        for cid in ACTIVE_CAMPAIGNS:
            logger.info(f"Pulling campaign {cid} ({CAMPAIGN_NAMES.get(cid)})")
            leads = pull_smartlead_campaign(client, cid)
            logger.info(f"  → {len(leads)} leads")

            creators_to_upsert = []
            sul_to_upsert = []
            for item in leads:
                lead = item.get("lead", {}) or {}
                email = (lead.get("email") or "").strip().lower()
                if not email:
                    continue
                fname = (lead.get("first_name") or "").strip() or "friend"
                fname = fname.split()[0] if fname.split() else "friend"

                creators_to_upsert.append({
                    "email": email,
                    "first_name": fname,
                    "last_name": (lead.get("last_name") or "").strip() or None,
                    "country": "US",
                    "language": "en",
                    "status": "inventory",
                    "import_batch": f"smartlead_backfill_{cid}",
                    "primary_platform": "tiktok",
                })

                custom = lead.get("custom_fields") or {}
                sul_to_upsert.append({
                    "email": email,
                    "campaign_id": cid,
                    "campaign_name": CAMPAIGN_NAMES.get(cid),
                    "smartlead_lead_id": str(lead.get("id") or ""),
                    "batch_id": custom.get("source_batch") or f"smartlead_backfill_{cid}",
                    "source_pool": custom.get("source_batch") or "smartlead_existing",
                    "uploaded_at": (lead.get("created_at") or
                                    datetime.now(timezone.utc).isoformat()),
                    "status": "uploaded",
                    "notes": "Backfilled from Smartlead pull",
                })

            cdata = {"leads_pulled": len(leads), "creators_upsert": 0, "sul_upsert": 0}

            if dry_run:
                cdata["dry_run"] = True
                cdata["sample_creator"] = creators_to_upsert[0] if creators_to_upsert else None
                cdata["sample_sul"] = sul_to_upsert[0] if sul_to_upsert else None
            else:
                # Upsert creator_inventory in chunks (idempotent vía email)
                for i in range(0, len(creators_to_upsert), 500):
                    chunk = creators_to_upsert[i:i + 500]
                    try:
                        db.table("creator_inventory").upsert(
                            chunk, on_conflict="email", ignore_duplicates=True
                        ).execute()
                        cdata["creators_upsert"] += len(chunk)
                    except Exception as e:
                        logger.error(f"  creator upsert chunk fail: {e}")

                # Upsert smartlead_uploaded_leads
                # NOTE: tabla tiene UNIQUE(email, campaign_id) WHERE removed_at IS NULL
                # Necesitamos resolver creator_inventory_id post-upsert (link manual con SQL después)
                for i in range(0, len(sul_to_upsert), 500):
                    chunk = sul_to_upsert[i:i + 500]
                    try:
                        db.table("smartlead_uploaded_leads").upsert(
                            chunk, on_conflict="email,campaign_id"
                        ).execute()
                        cdata["sul_upsert"] += len(chunk)
                    except Exception as e:
                        logger.error(f"  sul upsert chunk fail: {e}")

            result["campaigns"][cid] = cdata
            result["totals"]["creators"] += cdata.get("creators_upsert", 0)
            result["totals"]["uploaded_leads"] += cdata.get("sul_upsert", 0)

    # 3. Link smartlead_uploaded_leads.creator_inventory_id (post-pass)
    if not dry_run:
        logger.info("Linking smartlead_uploaded_leads.creator_inventory_id...")
        # SQL: update where creator_inventory_id IS NULL
        try:
            db.rpc("exec_sql", {  # generic helper if exists
                "sql": """
                    UPDATE smartlead_uploaded_leads sul
                    SET creator_inventory_id = ci.id
                    FROM creator_inventory ci
                    WHERE sul.creator_inventory_id IS NULL
                      AND sul.email = ci.email;
                """,
            }).execute()
            logger.info("  link done via RPC")
        except Exception as e:
            logger.warning(f"  RPC exec_sql not available: {e}")
            logger.warning("  Skipping FK link — apply manually:")
            logger.warning("    UPDATE smartlead_uploaded_leads SET creator_inventory_id = ci.id")
            logger.warning("      FROM creator_inventory ci WHERE creator_inventory_id IS NULL AND email = ci.email")

    return result


# ── Main ─────────────────────────────────────────────────────────────────────
def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--manifest-only", action="store_true",
                    help="Solo paso 1: importar CSV manifest")
    ap.add_argument("--smartlead-only", action="store_true",
                    help="Solo paso 2: pull campañas Smartlead")
    ap.add_argument("--all", action="store_true",
                    help="Ambos pasos (default si no se especifica)")
    ap.add_argument("--manifest-path", type=Path, default=DEFAULT_MANIFEST_CSV)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    do_manifest = args.manifest_only or args.all or (not args.smartlead_only)
    do_smartlead = args.smartlead_only or args.all or (not args.manifest_only)

    db = get_db()

    if do_manifest:
        logger.info(f"=== Step 1: Import manifest CSV ({args.manifest_path}) ===")
        r = import_manifest_csv(db, args.manifest_path, dry_run=args.dry_run)
        logger.info(f"Manifest result: {r}")

    if do_smartlead:
        logger.info("=== Step 2: Pull Smartlead campaigns ===")
        r = import_smartlead_campaigns(db, dry_run=args.dry_run)
        logger.info(f"Smartlead result: {r}")

    return 0


if __name__ == "__main__":
    sys.exit(main())

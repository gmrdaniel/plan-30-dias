"""
Worker Registry — laneta-pipeline-api
======================================
Maps service_code → async run(db, entity_type, entity_id, config) -> dict.
"""

from workers.validate_email_mv import run as validate_email_mv_worker
from workers.exclude_non_creator import run as exclude_non_creator_worker
from workers.assign_bucket import run as assign_bucket_worker
from workers.smartlead_dedup_check import run as smartlead_dedup_check_worker
from workers.enrich_via_clay_creator import run as enrich_via_clay_creator_worker
from workers.noop import run as noop_worker

WORKER_REGISTRY = {
    # === Pipeline cold outreach (este servicio) ===
    "validate_email_mv":       validate_email_mv_worker,
    "exclude_non_creator":     exclude_non_creator_worker,
    "assign_bucket":           assign_bucket_worker,
    "smartlead_dedup_check":   smartlead_dedup_check_worker,
    "enrich_via_clay_creator": enrich_via_clay_creator_worker,

    # === Placeholders (pendiente de implementación) ===
    "score_creator":       noop_worker,
    "compute_data_tier":   noop_worker,
    "update_followers_ig": noop_worker,
    "update_followers_tt": noop_worker,
    "brevo_history":       noop_worker,
    "fb_page_check":       noop_worker,
}

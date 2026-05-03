"""
Noop Worker
===========
Placeholder for services that don't have an API integration yet.
Returns skipped status so the pipeline continues without failing.
"""


async def run(db, entity_type: str, entity_id: str, config: dict) -> dict:
    return {
        "success": False,
        "error": "Worker not implemented yet",
        "result_label": "not_implemented",
        "old_value": None,
        "new_value": None,
    }

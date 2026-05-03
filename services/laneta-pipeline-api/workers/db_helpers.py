"""
Database Helpers
================
Safe wrappers for supabase-py 2.x quirks.
"""


def safe_maybe_single(query):
    """
    Execute a .maybe_single() query safely.
    supabase-py 2.x raises on 406 (no rows) instead of returning None.
    Returns the data dict or None.
    """
    try:
        resp = query.maybe_single().execute()
        return resp.data if resp else None
    except Exception:
        return None

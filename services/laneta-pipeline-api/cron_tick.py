"""
Cron tick entrypoint
====================
Llamado por Railway cron schedule (o external cron). Hace HTTP self-call al
endpoint /trigger/cron-tick del propio servicio. Esto es más simple que
re-importar todo el pipeline runner en un proceso separado.

Uso:
  python -m cron_tick

Env vars necesarias (mismas del servicio):
  PIPELINE_API_URL  → ej. https://laneta-pipeline-api-production.up.railway.app
                     fallback: http://localhost:8000
  API_SECRET        → mismo secret del servicio
"""

import os
import sys
import logging
import json

import httpx

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("cron_tick")


def main() -> int:
    base_url = os.getenv("PIPELINE_API_URL", "http://localhost:8000").rstrip("/")
    api_secret = os.getenv("API_SECRET", "")

    headers = {"X-Api-Secret": api_secret} if api_secret else {}
    url = f"{base_url}/trigger/cron-tick"

    logger.info(f"POST {url}")
    try:
        with httpx.Client(timeout=300) as client:
            resp = client.post(url, headers=headers)
        logger.info(f"status={resp.status_code}")
        try:
            body = resp.json()
            logger.info(f"response: {json.dumps(body, indent=2, default=str)}")
        except Exception:
            logger.info(f"raw response: {resp.text[:500]}")
        return 0 if resp.status_code == 200 else 1
    except Exception as e:
        logger.exception(f"cron tick failed: {e}")
        return 2


if __name__ == "__main__":
    sys.exit(main())

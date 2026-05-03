# laneta-pipeline-api

FastAPI service dedicado al pipeline cold outreach de creators (TikTok scraping → MV → Clay → Smartlead).

## Diseño

```
CSV crudo TT → /import-tiktok-pool → creator_inventory + creator_social_profiles
                          ↓
                /run-pipeline (sequence of workers):
                  1. exclude_non_creator    (role-based, typos, dummies)
                  2. validate_email_mv ⭐    (MillionVerifier, obligatorio)
                  3. assign_bucket           (max followers → bucket)
                  4. enrich_via_clay_creator (outbound, optional)
                       ↓ async (Clay procesa ~minutos)
                  5. ← clay-webhook-creator (edge function recibe respuesta)
                  6. smartlead_dedup_check
                          ↓
                /smartlead/push-batch → Ana 3217790 ✉️
```

## Stack

- **Runtime**: Python 3.11 + FastAPI + uvicorn
- **DB**: Supabase (`nvbanvwibmghxroybjxp` — proyecto tracker)
- **Deploy**: Railway con Dockerfile
- **APIs externas**: MillionVerifier, Smartlead, Clay HTTP-in

## Workers registrados (11)

| service_code | Externo | Status |
|---|---|---|
| `validate_email_mv` ⭐ | MillionVerifier | implementado |
| `exclude_non_creator` ⭐ | local | implementado |
| `assign_bucket` ⭐ | local | implementado |
| `smartlead_dedup_check` ⭐ | Smartlead API | implementado |
| `enrich_via_clay_creator` ⭐ | Clay HTTP-in | implementado (skipeable) |
| `validate_name` | local | noop (pendiente porteo) |
| `score_creator` | local | noop (pendiente porteo) |
| `compute_data_tier` | local | noop |
| `update_followers_ig/tt` | RapidAPI | noop |
| `brevo_history` | Brevo | noop |
| `fb_page_check` | Apify | noop |

⭐ = implementado en este servicio. Los demás son placeholders que se pueden portear desde `crm-laneta-v2-02/services/laneta-enrichment-api/` cuando se necesiten.

## Endpoints

| Endpoint | Método | Auth | Descripción |
|---|---|---|---|
| `/health` | GET | — | Status + workers count + Supabase ping |
| `/admin/test-worker` | POST | X-Api-Secret | Run un worker contra una entity |
| `/admin/stats` | GET | X-Api-Secret | Counts por tabla + send_100 count |
| `/admin/pipeline-config` | GET | X-Api-Secret | Lee tabla pipeline_config |
| `/import-tiktok-pool` | POST | X-Api-Secret | CSV multipart → INSERT creator_inventory |
| `/run-pipeline` | POST | X-Api-Secret | Ejecuta secuencia de workers sobre N creators |
| `/smartlead/push-batch` | POST | X-Api-Secret | Selecciona + sube a Smartlead chunked |

## Env vars (Railway)

```
API_SECRET=<generar uuid o random string>
SUPABASE_URL=https://nvbanvwibmghxroybjxp.supabase.co
SUPABASE_SERVICE_KEY=<service_role key del proyecto tracker>
MILLIONVERIFIER_API_KEY=<key, ver D:/CRM/brevo/.env>
SMARTLEAD_API_KEY=<key, ver D:/CRM/plan_30_dias/tracker/.env>
CLAY_HTTP_IN_URL_CREATORS=<url del workbook Clay creators>
CLAY_API_KEY=<header x-clay-webhook-auth>
SMARTLEAD_META_CAMPAIGNS=3212141,3217790,3213557,3213796,3224154,3224156
PIPELINE_SKIP_CLAY=false
```

## Setup local (dev)

```bash
cd services/laneta-pipeline-api
python -m venv venv
. venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # ajustar valores
uvicorn main:app --reload
# → http://localhost:8000/docs (Swagger UI)
```

## Deploy a Railway

1. New project → Deploy from GitHub repo `plan_30_dias`
2. Settings → Root Directory: `services/laneta-pipeline-api`
3. Variables → agregar las del bloque ENV vars arriba
4. Deploy
5. Validar: `curl https://<your-app>.up.railway.app/health`

## Migración Supabase

El schema completo se aplica con la migration:
`tracker/supabase/migrations/038_pipeline_cold_outreach_full_schema.sql`

GH Actions (`.github/workflows/main.yaml`) la aplica automáticamente al hacer push a `master`.

## Testing

Ver [TESTING.md](./TESTING.md) para guía paso a paso.

## Edge function relacionada

`tracker/supabase/functions/clay-webhook-creator/` — recibe respuesta async de Clay y persiste en `creator_inventory + creator_social_profiles`.

# Plan de testing — laneta-pipeline-api

> Pruebas paso a paso desde consola para validar end-to-end.
> Se asume migration 038 aplicada y service desplegado en Railway.

## Pre-requisitos

| Item | Cómo validar |
|---|---|
| Migration 038 aplicada | `SELECT bucket FROM creator_inventory LIMIT 1` (si no hay error → cols nuevas existen) |
| Railway service up | `curl $URL/health` → `{"status":"ok","supabase_connected":true}` |
| Workers registrados | `/health` debe mostrar `workers_registered:11` |
| Env vars en Railway | `API_SECRET, SUPABASE_URL, SUPABASE_SERVICE_KEY, MILLIONVERIFIER_API_KEY, SMARTLEAD_API_KEY` |

```bash
# Variables que vamos a usar en este testing (ajustar)
export PIPELINE_URL="https://laneta-pipeline-api-production.up.railway.app"
export API_SECRET="<el secret que pusiste en Railway>"
export H="-H X-Api-Secret: $API_SECRET -H Content-Type: application/json"
```

---

## Step 0 — Health + admin stats

```bash
curl -s "$PIPELINE_URL/health" | jq
# Esperado:
# {
#   "status": "ok",
#   "supabase_connected": true,
#   "workers_registered": 11,
#   "service_codes": ["assign_bucket","brevo_history",...,"validate_email_mv"]
# }

curl -s "$PIPELINE_URL/admin/stats" $H | jq
# Esperado: counts en 0 al inicio
# {
#   "creator_inventory": 0,
#   "creator_social_profiles": 0,
#   "smartlead_uploaded_leads": 0,
#   "enrichment_flags": 0
# }

curl -s "$PIPELINE_URL/admin/pipeline-config" $H | jq
# Esperado: 7 keys (daily_avg_send=240, skip_clay=false, etc.)
```

---

## Step 1 — Insertar 1 creator de prueba (vía SQL directo)

Desde Supabase SQL editor o `psql`:

```sql
-- Creator que SÍ pasa el filtro (gmail real)
INSERT INTO creator_inventory(email, first_name, country, language, status, bucket, import_batch, primary_platform)
VALUES ('jatvbuisness@gmail.com', 'jatv', 'US', 'en', 'inventory', '500k-1M', 'TEST_BATCH_2026-05-02', 'tiktok')
RETURNING id;
-- → guardar el UUID, ej. 'aaaaaaaa-1111-...'

-- Su perfil TikTok
INSERT INTO creator_social_profiles(creator_id, platform, username, followers, account_url)
VALUES ('<UUID>', 'tiktok', 'jatvyoutube', 815282, 'https://www.tiktok.com/@jatvyoutube');

-- Creator role-based (debe ser EXCLUIDO)
INSERT INTO creator_inventory(email, first_name, country, status)
VALUES ('sales@elevn.me', 'Sales', 'US', 'inventory') RETURNING id;
-- → guardar como UUID_BAD
```

---

## Step 2 — Test workers individuales

### 2a. exclude_non_creator (gratis, no API)

```bash
# Test creator legítimo
curl -X POST "$PIPELINE_URL/admin/test-worker" $H -d '{
  "service_code": "exclude_non_creator",
  "entity_type": "creator",
  "entity_id": "<UUID>"
}' | jq
# Esperado: result.success=true, result.result_label="passed"

# Test creator role-based
curl -X POST "$PIPELINE_URL/admin/test-worker" $H -d '{
  "service_code": "exclude_non_creator",
  "entity_type": "creator",
  "entity_id": "<UUID_BAD>"
}' | jq
# Esperado: result.success=true, result_label="excluded:role_based:sales"
# Y en BD: creator_inventory.non_creator_filter='excluded'
```

### 2b. validate_email_mv ⭐ (consume créditos MV)

```bash
curl -X POST "$PIPELINE_URL/admin/test-worker" $H -d '{
  "service_code": "validate_email_mv",
  "entity_type": "creator",
  "entity_id": "<UUID>"
}' | jq
# Esperado: result.success=true
# result.new_value debe tener: email_status, mv_quality, waterfall_action, mv_resultcode, mv_verified_at
# result_label debe ser "send_100" si email es válido

# Validar en BD:
# SELECT email, email_status, mv_quality, waterfall_action, mv_verified_at
#   FROM creator_inventory WHERE id = '<UUID>';
```

### 2c. assign_bucket (gratis)

```bash
curl -X POST "$PIPELINE_URL/admin/test-worker" $H -d '{
  "service_code": "assign_bucket",
  "entity_type": "creator",
  "entity_id": "<UUID>"
}' | jq
# Esperado: result.result_label="500k-1M" (porque followers=815k)
# En BD: creator_inventory.bucket='500k-1M', primary_platform='tiktok'
# creator_social_profiles.main_social_media=true en la fila TikTok
```

### 2d. smartlead_dedup_check (consume API call Smartlead)

```bash
curl -X POST "$PIPELINE_URL/admin/test-worker" $H -d '{
  "service_code": "smartlead_dedup_check",
  "entity_type": "creator",
  "entity_id": "<UUID>"
}' | jq
# Esperado: result_label="new" (si no está) o "in_campaign:3217790" si ya estaba
```

### 2e. enrich_via_clay_creator (skip-test sin Clay aún)

```bash
# Test SKIP mode (Clay no requerido)
curl -X POST "$PIPELINE_URL/admin/test-worker" $H -d '{
  "service_code": "enrich_via_clay_creator",
  "entity_type": "creator",
  "entity_id": "<UUID>",
  "config": {"skip_clay": true}
}' | jq
# Esperado: result_label="skipped_by_config"
```

---

## Step 3 — Pipeline encadenado

```bash
curl -X POST "$PIPELINE_URL/run-pipeline" $H -d '{
  "creator_ids": ["<UUID>", "<UUID_BAD>"],
  "service_codes": [
    "exclude_non_creator",
    "validate_email_mv",
    "assign_bucket",
    "smartlead_dedup_check"
  ]
}' | jq
# Esperado:
# {
#   "creator_count": 2,
#   "steps": [
#     {"service_code": "exclude_non_creator", "success": 2, "error": 0, "skipped": 0},
#     {"service_code": "validate_email_mv", "success": 1, "error": 1, ...},
#     {"service_code": "assign_bucket", "success": 1, "error": 0, ...},
#     {"service_code": "smartlead_dedup_check", "success": 2, "error": 0, ...}
#   ]
# }
# Re-running same call → success=0, skipped=N (smart_skip activado)
```

---

## Step 4 — Importer CSV (10 creators reales)

```bash
# Crear CSV de prueba
cat > /tmp/test_import.csv <<EOF
email,tiktok_handle,nickname,follower_count
test1@gmail.com,test1,Test One,150000
test2@gmail.com,test2,Test Two,750000
sales@bad.com,salesbad,Sales Bad,500000
EOF

curl -X POST "$PIPELINE_URL/import-tiktok-pool" \
  -H "X-Api-Secret: $API_SECRET" \
  -F csv_file=@/tmp/test_import.csv \
  -F bucket=500k-1M \
  -F source_batch=TEST_2026-05-02 \
  -F country=US \
  -F language=en | jq
# Esperado: inserted_creators >= 1, sample_ids con UUIDs nuevos
```

---

## Step 5 — Smartlead push (DRY-RUN primero)

```bash
# DRY-RUN: nada se sube, solo previsualiza
curl -X POST "$PIPELINE_URL/smartlead/push-batch" $H -d '{
  "campaign_id": 3217790,
  "limit": 5,
  "bucket_filter": "500k-1M",
  "dry_run": true
}' | jq
# Esperado: would_upload=N, sample con 3 leads formateados

# Real (cuando estés seguro)
curl -X POST "$PIPELINE_URL/smartlead/push-batch" $H -d '{
  "campaign_id": 3217790,
  "limit": 5,
  "bucket_filter": "500k-1M",
  "dry_run": false
}' | jq
# Esperado:
# {
#   "uploaded": N,
#   "duplicate": 0,
#   "batch_id": "pipeline_batch_3217790_...",
#   "scheduler_kick": {"pause": 200, "resume": 200, "final": "ACTIVE"}
# }
```

---

## Step 6 — Trigger orquestado (Fase 5)

```bash
# DRY-RUN: ver qué creators procesaría (sin ejecutar)
curl -X POST "$PIPELINE_URL/trigger/run-now" $H -d '{
  "batch_size": 50,
  "bucket_filter": "500k-1M",
  "dry_run": true
}' | jq
# Esperado: status='dry_run', would_process=N, sample_ids=[...]

# Real: ejecutar pipeline + push (manual)
curl -X POST "$PIPELINE_URL/trigger/run-now" $H -d '{
  "batch_size": 50,
  "bucket_filter": "500k-1M"
}' | jq
# Esperado: status='completed', creators_processed, pipeline.{steps}, push.{uploaded}

# Cron tick (lo que llama Railway cron schedule)
curl -X POST "$PIPELINE_URL/trigger/cron-tick" $H | jq
# Equivalente a /trigger/run-now sin args (usa pipeline_config)
```

## Step 7 — Backfill histórico (Fase 6, one-shot)

```bash
# Ver qué se importaría sin escribir nada
python -m backfill_historic --dry-run

# Solo el manifest CSV local (~400 entries)
python -m backfill_historic --manifest-only

# Solo pull de Smartlead (las 6 campañas activas)
python -m backfill_historic --smartlead-only

# Todo
python -m backfill_historic --all
```

## Step 8 — Verificación end-to-end

```sql
-- Cuántos creators tenemos por estado
SELECT
  bucket,
  waterfall_action,
  non_creator_filter,
  COUNT(*) as n
FROM creator_inventory
GROUP BY bucket, waterfall_action, non_creator_filter
ORDER BY n DESC;

-- Creators ya subidos a Smartlead
SELECT campaign_id, status, COUNT(*) as n
FROM smartlead_uploaded_leads
WHERE removed_at IS NULL
GROUP BY campaign_id, status;

-- Smart-skip status (qué workers ya corrieron y siguen frescos)
SELECT service_code, result, COUNT(*) as n
FROM enrichment_flags
WHERE expires_at > now()
GROUP BY service_code, result;
```

---

## Troubleshooting

| Error | Causa | Fix |
|---|---|---|
| `401 Invalid API secret` | Falta header `X-Api-Secret` | Verificar Railway env var `API_SECRET` |
| `MILLIONVERIFIER_API_KEY not configured` | Env var faltante | Set en Railway |
| Worker `crashed: ...` | Excepción no atrapada | Ver Railway logs `Live` |
| MV `mv_unavailable` | Sin créditos o timeout | Check balance: `GET https://api.millionverifier.com/api/v3/credits?api=KEY` |
| Smartlead `400 ... must contain less than or equal to 1000 items` | Chunk muy grande | `chunk_size_smartlead` en pipeline_config (default 900) |
| Clay outbound 401 | `CLAY_API_KEY` incorrecta | Verificar header `x-clay-webhook-auth` |
| Webhook clay-webhook-creator nunca dispara | Workbook Clay mal configurado | Validar destination URL + `Authorization: Bearer` header en Clay HTTP-out |

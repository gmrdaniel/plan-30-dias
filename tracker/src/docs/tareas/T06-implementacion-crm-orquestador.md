# T06 — Documento de Implementación: CRM Laneta como Orquestador

> **Proyecto destino:** github.com/gmrdaniel/crm-laneta-v2-02 (branch develop)
> **Supabase:** nvbanvwibmghxroybjxp.supabase.co
> **Fecha:** 2 Abril 2026
> **Responsable:** Gabriel Piñero
> **Apoyo:** Daniel Ramírez

---

## Arquitectura completa

```
┌─────────────────────────────────────────────────────────────────┐
│                     CRM LANETA (Supabase)                       │
│                                                                 │
│  ① IMPORT (/admin/leads/import)                                 │
│  CSV (SmartScout/Apify/Manual)                                  │
│  Seleccionar: ○ B2B  ○ Creadores                                │
│       ↓                                                         │
│  client_inventory + client_contacts (datos crudos)              │
│  lead_source: 'outbound_research'                               │
│  pipeline_type: 'b2b' | 'creators'                              │
│                                                                 │
│  ② ENRIQUECER (/admin/leads/enrich)                             │
│  Seleccionar batch → Elegir servicios → Ejecutar                │
│       ↓                                                         │
│  Edge Function: enrich-via-clay                                 │
│       ↓ POST Clay API (add rows to table)                       │
│     Clay (cascade: email, LinkedIn, score)                      │
│       ↓ CRM poll o webhook (Growth)                             │
│  client_contacts ACTUALIZADO                                    │
│  enrichment_flags + enrichment_step_results                     │
│                                                                 │
│  ③ ACTIVAR OUTREACH                                             │
│  Filtro: email_valid=true AND icp_score>=7                      │
│       ↓                                                         │
│  Edge Function: push-to-smartlead                               │
│       ↓ POST Smartlead API                                      │
│     Smartlead (secuencia cold email)                            │
│                                                                 │
│  ④ TRACKING (automático)                                        │
│       ↓ webhook POST                                            │
│  Edge Function: smartlead-webhook                               │
│       ↓                                                         │
│  client_outreach_log (sent, opened, replied, bounced)           │
│  client_inventory.status actualizado                            │
│                                                                 │
│  ⑤ SYNC A HUBSPOT (solo leads calientes)                        │
│  Filtro: status IN ('interested','contacted','proposal_sent')   │
│       ↓                                                         │
│  Edge Function: sync-to-hubspot                                 │
│       ↓ POST HubSpot API                                        │
│     HubSpot (pipeline vendedores)                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Migración de base de datos

### 1.1 Tabla nueva: smartlead_webhook_log

```sql
CREATE TABLE smartlead_webhook_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  lead_email TEXT,
  campaign_id TEXT,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_smartlead_webhook_idempotency
  ON smartlead_webhook_log (event_type, lead_email, campaign_id, created_at);

-- RLS
ALTER TABLE smartlead_webhook_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON smartlead_webhook_log FOR ALL USING (true);
GRANT ALL ON smartlead_webhook_log TO service_role;
GRANT SELECT ON smartlead_webhook_log TO authenticated;
```

### 1.2 Campos nuevos en client_inventory

```sql
ALTER TABLE client_inventory
  ADD COLUMN IF NOT EXISTS icp_score SMALLINT,
  ADD COLUMN IF NOT EXISTS video_gap_score SMALLINT,
  ADD COLUMN IF NOT EXISTS pipeline_type TEXT DEFAULT 'b2b'
    CHECK (pipeline_type IN ('b2b', 'creators')),
  ADD COLUMN IF NOT EXISTS smartlead_lead_id TEXT,
  ADD COLUMN IF NOT EXISTS smartlead_campaign_id TEXT,
  ADD COLUMN IF NOT EXISTS hubspot_contact_id TEXT,
  ADD COLUMN IF NOT EXISTS hubspot_deal_id TEXT,
  ADD COLUMN IF NOT EXISTS clay_row_id TEXT,
  ADD COLUMN IF NOT EXISTS enriched_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_client_inventory_pipeline_type
  ON client_inventory (pipeline_type);
CREATE INDEX IF NOT EXISTS idx_client_inventory_icp_score
  ON client_inventory (icp_score);
CREATE INDEX IF NOT EXISTS idx_client_inventory_enriched
  ON client_inventory (enriched_at) WHERE enriched_at IS NOT NULL;
```

### 1.3 Nuevo enrichment_service

```sql
INSERT INTO enrichment_services (code, name, description, category, entity_types, input_fields, output_fields, active, sort_order)
VALUES (
  'clay_enrich',
  'Clay Full Enrichment',
  'Email cascade + validation + LinkedIn + ICP Score via Clay API. Pushea filas a tabla Clay, cascade automática, poll resultados.',
  'data',
  ARRAY['client_contact', 'client_inventory'],
  '{"fields": ["company_name", "website", "country", "contact_name", "job_title"]}'::JSONB,
  '{"fields": ["email", "email_valid", "linkedin_url", "phone", "icp_score", "video_gap_score"]}'::JSONB,
  true,
  1
);
```

---

## 2. Edge Function: import-leads

### Endpoint

```
POST /functions/v1/import-leads
Headers:
  Authorization: Bearer {USER_JWT}
  Content-Type: application/json
```

### Request body

```json
{
  "pipeline_type": "b2b",
  "source": "smartscout",
  "leads": [
    {
      "company_name": "TechBrand LLC",
      "website": "techbrand.com",
      "industry": "E-commerce / Amazon",
      "country": "US",
      "city": "Miami",
      "estimated_revenue": 2500000,
      "contact_first_name": "María",
      "contact_last_name": "García",
      "contact_email": null,
      "contact_phone": null,
      "contact_linkedin": null,
      "contact_job_title": "Marketing Director",
      "extra_data": {
        "smartscout_brand_score": 85,
        "monthly_revenue": 208000,
        "total_products": 12,
        "sponsored_video_win_rate": 0,
        "storefront_url": "amazon.com/stores/techbrand"
      }
    }
  ]
}
```

### Lógica

```
Para cada lead en el array:

1. UPSERT client_inventory:
   - key: website_url (dedup por website)
   - status: 'lead'
   - lead_source: mapear source → enum
     smartscout → 'outbound_research'
     apify → 'outbound_research'
     social_blade → 'outbound_research'
     manual → 'other'
   - priority: 'medium'
   - pipeline_type: del request

2. UPSERT client_contacts:
   - key: email (si existe) o client_inventory_id + last_name
   - status: 'active'
   - role_type: mapear job_title → enum
     'CMO' → 'cmo'
     'VP Marketing' → 'marketing_director'
     'Head of E-commerce' → 'head_of_ecommerce'
   - is_primary_contact: true

3. Retornar:
   { total_imported, total_updated, total_skipped, inventory_ids }
```

### Mapeo source → lead_source

| source (request) | lead_source (BD) |
|---|---|
| smartscout | outbound_research |
| apify | outbound_research |
| social_blade | outbound_research |
| manual | other |
| referral | referral |
| inbound | inbound_web |

### Mapeo job_title → role_type

| job_title (contiene) | role_type |
|---|---|
| CMO, Chief Marketing | cmo |
| VP Marketing, VP Mkt | marketing_director |
| Head of E-commerce | head_of_ecommerce |
| Brand Manager | brand_manager |
| Director Comercial | director_comercial |
| Marketing Manager | marketing_manager |
| Social Media | social_media_manager |
| CEO, Founder, Owner | ceo |
| (otro) | other |

### config.toml

```toml
[functions.import-leads]
verify_jwt = true
```

---

## 3. Edge Function: enrich-via-clay

### Endpoint

```
POST /functions/v1/enrich-via-clay
Headers:
  Authorization: Bearer {USER_JWT}
  Content-Type: application/json
Body:
{
  "inventory_ids": ["uuid1", "uuid2"],
  "pipeline_type": "b2b",
  "clay_table_id": "tbl_abc123"
}
```

### Lógica

```
1. Leer client_inventory + client_contacts para los IDs

2. Crear enrichment_pipeline:
   entity_type: 'client_inventory_filter'
   status: 'running'
   total_items: N

3. Push filas a Clay:
   POST https://api.clay.com/v1/tables/{clay_table_id}/rows
   Headers:
     Authorization: Bearer {CLAY_API_KEY}
   Body: {
     "rows": [
       {
         "Company Name": inventory.name,
         "Website": inventory.website_url,
         "Country": inventory.country,
         "Contact Name": contact.first_name + " " + contact.last_name,
         "Job Title": contact.job_title,
         "crm_inventory_id": inventory.id,
         "crm_contact_id": contact.id
       }
     ]
   }

4. Retornar: { pipeline_id, rows_pushed }
```

### config.toml

```toml
[functions.enrich-via-clay]
verify_jwt = true
```

---

## 4. Edge Function: poll-clay-results

### Trigger

Cron cada 5 minutos (para plan Launch $185). Con Growth $495 se reemplaza por webhook.

### Lógica

```
1. Buscar enrichment_pipelines con status = 'running'

2. Para cada pipeline:
   GET https://api.clay.com/v1/tables/{table_id}/rows
   Filtrar filas con status = 'enriched' y no procesadas

3. Para cada fila con resultados:
   UPDATE client_contacts SET
     email = row.email,
     email_validated = true,
     email_valid = (row.email_status == 'valid'),
     linkedin_url = row.linkedin_url,
     job_title = row.job_title,
     phone = row.phone

   UPDATE client_inventory SET
     icp_score = row.icp_score,
     video_gap_score = row.video_gap_score,
     enriched_at = now(),
     priority = CASE
       WHEN row.icp_score >= 7 THEN 'high'
       WHEN row.icp_score >= 4 THEN 'medium'
       ELSE 'low'
     END

   INSERT enrichment_step_results (old_value, new_value)
   UPDATE enrichment_flags (last_run_at, result, expires_at)

4. Actualizar enrichment_pipeline:
   progress_pct = (processed / total) * 100
   status = 'completed' si todas procesadas
```

### config.toml

```toml
[functions.poll-clay-results]
verify_jwt = false
```

---

## 5. Edge Function: push-to-smartlead

### Endpoint

```
POST /functions/v1/push-to-smartlead
Headers:
  Authorization: Bearer {USER_JWT}
  Content-Type: application/json
Body:
{
  "inventory_ids": ["uuid1", "uuid2"],
  "campaign_id": "smartlead_campaign_id",
  "pipeline_type": "b2b"
}
```

### Lógica

```
1. Leer client_contacts WHERE:
   client_inventory_id IN (inventory_ids)
   AND email_valid = true
   AND status = 'active'

2. POST https://server.smartlead.ai/api/v1/leads?api_key={KEY}
   Body: {
     "campaign_id": campaign_id,
     "lead_list": [
       {
         "email": contact.email,
         "first_name": contact.first_name,
         "last_name": contact.last_name,
         "company_name": inventory.name,
         "linkedin_url": contact.linkedin_url,
         "phone_number": contact.phone,
         "website": inventory.website_url,
         "custom_fields": {
           "crm_inventory_id": inventory.id,
           "crm_contact_id": contact.id,
           "icp_score": inventory.icp_score,
           "pipeline_type": pipeline_type
         }
       }
     ]
   }

3. INSERT client_outreach_log:
   outreach_type: 'cold_email'
   status: 'sent'
   sent_at: now()

4. UPDATE client_inventory:
   status → 'contacted'
   smartlead_campaign_id = campaign_id

5. UPDATE client_contacts:
   last_contacted_at = now()

6. Retornar: { total_pushed, total_rejected }
```

### config.toml

```toml
[functions.push-to-smartlead]
verify_jwt = true
```

---

## 6. Edge Function: smartlead-webhook

### Endpoint

```
POST /functions/v1/smartlead-webhook
Content-Type: application/json
(verify_jwt: false — webhook externo)
```

### Configurar en Smartlead

```
Settings → Webhooks → Add:
URL: https://nvbanvwibmghxroybjxp.supabase.co/functions/v1/smartlead-webhook
Events: ALL (sent, opened, clicked, replied, bounced, unsubscribed)
```

### Payload de Smartlead

```json
{
  "event_type": "EMAIL_OPENED",
  "lead_email": "maria@techbrand.com",
  "campaign_id": "abc123",
  "campaign_name": "Sprint Abr B2B",
  "timestamp": "2026-04-15T10:30:00Z",
  "sequence_number": 2,
  "custom_fields": {
    "crm_inventory_id": "uuid1",
    "crm_contact_id": "uuid2"
  }
}
```

### Lógica

```
1. INSERT smartlead_webhook_log (payload, event_type, lead_email)
   — Idempotencia por unique index

2. Buscar contacto:
   — Primero por custom_fields.crm_contact_id
   — Fallback por lead_email en client_contacts

3. Mapear evento:
   EMAIL_SENT → 'sent'
   EMAIL_OPENED → 'opened'
   EMAIL_CLICKED → 'clicked'
   EMAIL_REPLIED → 'replied'
   EMAIL_BOUNCED → 'bounced'
   EMAIL_UNSUBSCRIBED → 'no_answer'

4. UPSERT client_outreach_log:
   outreach_type: 'cold_email'
   status: mapped_status
   opened_at / replied_at: según evento

5. UPDATE client_inventory:
   replied → status: 'interested'
   bounced → status: 'disqualified'
   unsubscribed → status: 'lost'

6. UPDATE client_contacts:
   bounced → status: 'bounced'
   unsubscribed → status: 'do_not_contact'
   replied → last_contacted_at: now()

7. Si replied → invocar sync-to-hubspot para ese lead
```

### config.toml

```toml
[functions.smartlead-webhook]
verify_jwt = false
```

---

## 7. Edge Function: sync-to-hubspot

### Endpoint

```
POST /functions/v1/sync-to-hubspot
Headers:
  Authorization: Bearer {USER_JWT}
  Content-Type: application/json
Body:
{
  "inventory_ids": ["uuid1"],
  "trigger": "auto_reply"
}
```

### Triggers

| Trigger | Cuándo | Qué syncea |
|---|---|---|
| auto_reply | Smartlead webhook detecta reply | Ese lead específico |
| manual | Vendedor clickea "Enviar a HubSpot" | Leads seleccionados |
| batch | Cron diario 8 AM | Todos con status 'interested' no synceados |

### Lógica

```
1. Leer client_inventory + client_contacts WHERE:
   id IN (inventory_ids)
   AND status IN ('interested', 'contacted', 'proposal_sent')
   AND hubspot_contact_id IS NULL

2. Crear contacto en HubSpot:
   POST https://api.hubapi.com/crm/v3/objects/contacts
   Headers: Authorization: Bearer {HUBSPOT_ACCESS_TOKEN}
   Body: {
     "properties": {
       "email": contact.email,
       "firstname": contact.first_name,
       "lastname": contact.last_name,
       "company": inventory.name,
       "jobtitle": contact.job_title,
       "phone": contact.phone,
       "website": inventory.website_url,
       "source": "Clay",
       "icp_score": inventory.icp_score,
       "video_gap_score": inventory.video_gap_score,
       "canal_primer_contacto": "Email",
       "equipo_responsable": pipeline_type == 'b2b'
         ? 'Marketing Influencers' : 'Creadores'
     }
   }

3. Crear deal en pipeline:
   POST https://api.hubapi.com/crm/v3/objects/deals
   Body: {
     "properties": {
       "dealname": inventory.name + " - " + pipeline_type,
       "pipeline": pipeline_type == 'b2b'
         ? 'pipeline_b2b_ventas'
         : 'pipeline_creadores_onboarding',
       "dealstage": mapear_status(inventory.status)
     }
   }

4. Asociar contacto ↔ deal:
   PUT /crm/v3/objects/deals/{dealId}/associations/contacts/{contactId}

5. UPDATE client_inventory:
   hubspot_contact_id = response.id
   hubspot_deal_id = deal_response.id

6. INSERT client_outreach_log:
   outreach_type: 'other'
   subject: 'Synced to HubSpot'
```

### config.toml

```toml
[functions.sync-to-hubspot]
verify_jwt = true
```

---

## 8. Variables de entorno necesarias

```env
# Clay
CLAY_API_KEY=00a5bb13f996417927a0
CLAY_TABLE_B2B_ID=tbl_xxx
CLAY_TABLE_CREATORS_ID=tbl_xxx

# Smartlead
SMARTLEAD_API_KEY=xxx

# HubSpot
HUBSPOT_ACCESS_TOKEN=xxx
```

---

## 9. UI: Página Import CSV

### Ruta: `/admin/leads/import`

```
┌──────────────────────────────────────────────────┐
│  Importar Leads                                   │
│                                                   │
│  Pipeline:  (●) B2B (Marcas)  (○) Creadores      │
│                                                   │
│  Fuente:    [▼ SmartScout]                        │
│                                                   │
│  Archivo:   [Seleccionar CSV]  datos.csv ✓        │
│                                                   │
│  Preview (primeras 5 filas):                      │
│  ┌──────────────┬─────────┬──────────┐            │
│  │ Empresa       │ Website │ Revenue  │            │
│  ├──────────────┼─────────┼──────────┤            │
│  │ TechBrand LLC│ tech... │ $208K/mo │            │
│  └──────────────┴─────────┴──────────┘            │
│                                                   │
│  Mapeo de columnas:                               │
│  CSV "Brand Name"  →  [▼ company_name]            │
│  CSV "Revenue"     →  [▼ estimated_revenue]       │
│  CSV "Category"    →  [▼ industry]                │
│                                                   │
│  [Importar 847 leads]                             │
│                                                   │
│  Resultado: ✓ 820 importados, 15 actualizados,   │
│             12 omitidos (sin empresa)              │
└──────────────────────────────────────────────────┘
```

---

## 10. UI: Página Enriquecimiento

### Ruta: `/admin/leads/enrich`

```
┌──────────────────────────────────────────────────┐
│  Enriquecer Leads                                 │
│                                                   │
│  Filtros:                                         │
│  Pipeline: [▼ B2B]  Status: [▼ lead]             │
│  Sin email: [✓]  Sin LinkedIn: [✓]               │
│                                                   │
│  Leads sin enriquecer: 820                        │
│                                                   │
│  Servicios a ejecutar:                            │
│  ☑ Clay Full Enrichment (email+LinkedIn+score)    │
│  ☑ Validar email (Hunter/ZeroBounce)              │
│  ☐ Buscar LinkedIn (Apollo)                       │
│  ☐ Buscar teléfono (Lusha)                        │
│  ☐ Scrape website (Apify)                         │
│                                                   │
│  Batch: [200] leads    Clay table: [Sprint-B2B]   │
│                                                   │
│  [Enriquecer batch]                               │
│                                                   │
│  Progreso: ████████░░░░ 65% (130/200)             │
│  ✓ Email encontrado: 168/200 (84%)               │
│  ✓ Email válido: 142/168 (85%)                   │
│  ✓ LinkedIn: 155/200 (78%)                       │
│  ✓ ICP Score promedio: 6.8                       │
└──────────────────────────────────────────────────┘
```

---

## 11. Estimación de esfuerzo

| # | Componente | Horas | Quién |
|---|---|---|---|
| 1 | Migración BD (tabla + campos + service) | 1h | Gabriel |
| 2 | Edge Function: import-leads | 3h | Gabriel |
| 3 | Edge Function: enrich-via-clay | 4h | Gabriel |
| 4 | Edge Function: poll-clay-results | 2h | Gabriel |
| 5 | Edge Function: push-to-smartlead | 3h | Gabriel |
| 6 | Edge Function: smartlead-webhook | 3h | Gabriel |
| 7 | Edge Function: sync-to-hubspot | 3h | Gabriel |
| 8 | UI: página import CSV | 4h | Lillian + Gabriel |
| 9 | UI: página enriquecimiento | 4h | Lillian + Gabriel |
| 10 | Testing E2E | 3h | Gabriel |
| | **Total** | **~30h** | **Semana 1-2** |

### Orden de implementación

```
Semana 1 (Día 3-5):
  1. Migración BD
  2. import-leads
  3. enrich-via-clay + poll-clay-results

Semana 1 (Día 5-7):
  4. push-to-smartlead
  5. smartlead-webhook

Semana 2 (Día 8-10):
  6. sync-to-hubspot
  7. UI de import y enriquecimiento

Semana 2+:
  8. Agregar más servicios de enriquecimiento
```

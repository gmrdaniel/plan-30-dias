# T06 — Detalle API: CRM Laneta como Orquestador

## Visión general

El CRM Laneta es el hub central. Todo entra y sale de ahí.

```
① Importar leads (CSV) → CRM
② Enriquecer (Clay, Hunter, ZeroBounce, etc.) → CRM actualizado
③ Activar outreach → Smartlead
④ Tracking automático → CRM (client_outreach_log)
⑤ Sync leads calientes → HubSpot (vendedores)
```

**HubSpot** = herramienta de vendedores (solo leads con actividad real)
**CRM Laneta** = fuente de verdad (todos los datos, historial completo)

---

## Paso ①: Importar leads al CRM

**Qué:** Subir CSV de SmartScout/Apify/Social Blade/Manual al CRM.

**Dónde:** Nueva página `/admin/leads/import` en el CRM.

**Flujo:**
1. Gabriel selecciona pipeline: **B2B** o **Creadores**
2. Selecciona fuente: SmartScout, Apify, Social Blade, Manual
3. Sube CSV
4. Mapea columnas del CSV → campos del CRM
5. Click "Importar"

**Resultado:**
- Empresa → `client_inventory` (status: 'lead', lead_source: 'outbound_research')
- Contacto → `client_contacts` (datos crudos, lo que venga en el CSV)
- Dedup automático por `website_url`

**Edge Function:** `import-leads` (verify_jwt: true)

**Ya existe en el CRM:**
- ✓ Tablas `client_inventory` + `client_contacts`
- ✓ Campos de status, lead_source, priority
- ✗ Falta: UI de import + Edge Function

---

## Paso ②: Enriquecer datos

**Qué:** Tomar leads crudos del CRM y enriquecerlos con servicios externos.

**Dónde:** Nueva sección `/admin/leads/enrich` en el CRM.

### Arquitectura de enriquecimiento (pluggable)

El CRM ya tiene un sistema de `enrichment_services` con catálogo de proveedores. Cada proveedor es un servicio independiente que se puede activar/desactivar:

```
┌─────────────────────────────────────────────┐
│         enrichment_services (catálogo)       │
│                                              │
│  ┌─────────────┐  ┌──────────────────────┐  │
│  │ clay_enrich  │  │ validate_email       │  │
│  │ (Clay API)   │  │ (Hunter/ZeroBounce)  │  │
│  │ Full cascade │  │ Solo validar email   │  │
│  └─────────────┘  └──────────────────────┘  │
│                                              │
│  ┌─────────────┐  ┌──────────────────────┐  │
│  │ find_linkedin│  │ score_qualification  │  │
│  │ (Apollo/     │  │ (AI scoring local)   │  │
│  │  Sales Nav)  │  │                      │  │
│  └─────────────┘  └──────────────────────┘  │
│                                              │
│  ┌─────────────┐  ┌──────────────────────┐  │
│  │ scrape_web   │  │ find_phone           │  │
│  │ (Apify)      │  │ (Lusha/RocketReach)  │  │
│  └─────────────┘  └──────────────────────┘  │
│                                              │
│  + Agregar nuevo servicio...                 │
└─────────────────────────────────────────────┘
```

**Ya existe en el CRM:**
- ✓ `enrichment_services` — catálogo con 9 servicios seed
- ✓ `enrichment_pipelines` — ejecución con pasos, progreso, status
- ✓ `enrichment_step_results` — resultados por entidad
- ✓ `enrichment_flags` — cache para no re-enriquecer
- ✓ `start-enrichment-pipeline` — Edge Function que dispara pipelines

### Flujo de enriquecimiento

```
Gabriel selecciona batch de leads sin enriquecer
    ↓
Elige servicios a ejecutar (uno o varios):
    ☑ Clay Full Enrichment (email + LinkedIn + score)
    ☑ Validar email (Hunter)
    ☐ Buscar LinkedIn (Apollo)
    ☐ Buscar teléfono (Lusha)
    ☐ Scrape website (Apify)
    ↓
CRM crea enrichment_pipeline con los pasos seleccionados
    ↓
Cada paso llama al servicio correspondiente
    ↓
Resultados se guardan en client_contacts + client_inventory
    ↓
Progreso visible en UI: ████████░░ 80% (160/200)
```

### Clay como servicio de enriquecimiento

Con **Launch $185:**
1. CRM pushea filas a tabla Clay vía API
2. Clay cascade corre (email, LinkedIn, score)
3. CRM hace polling cada 5 min para leer resultados
4. Actualiza client_contacts con datos enriquecidos

Con **Growth $495:**
1. Igual pero Clay manda webhook de vuelta al CRM (sin polling)

### Agregar un servicio nuevo (ejemplo: Lusha para teléfonos)

```sql
INSERT INTO enrichment_services (code, name, category, entity_types, active)
VALUES ('find_phone', 'Lusha Phone Finder', 'data', ARRAY['client_contact'], true);
```

Crear Edge Function que llame la API del nuevo servicio. El CRM lo muestra automáticamente como opción en la UI de enriquecimiento.

**Principio:** Cada servicio es independiente. Se pueden combinar, ejecutar en orden, o uno solo. Clay no es obligatorio — es uno más del catálogo.

---

## Paso ③: Activar outreach → Smartlead

**Qué:** Enviar contactos enriquecidos (con email válido) a una campaña de Smartlead.

**Cuándo:** Después de enriquecer. Solo contactos con `email_valid = true`.

**Flujo:**
1. Gabriel filtra leads enriquecidos: email válido + icp_score >= umbral
2. Selecciona campaña Smartlead (B2B o Creadores)
3. Click "Activar outreach"
4. CRM pushea a Smartlead API
5. Registra en `client_outreach_log` (type: 'cold_email', status: 'sent')
6. Actualiza `client_inventory.status` → 'contacted'

**Edge Function:** `push-to-smartlead` (verify_jwt: true)

**Ya existe en el CRM:**
- ✓ `client_outreach_log` con tipos cold_email, status sent/opened/replied
- ✗ Falta: Edge Function + botón en UI

---

## Paso ④: Tracking automático (Smartlead → CRM)

**Qué:** Smartlead reporta eventos de email al CRM automáticamente.

**Cómo:** Webhook. Smartlead hace POST al CRM cada vez que un email se abre, clickea, responde o rebota.

**Configurar en Smartlead:**
```
Settings → Webhooks → Add:
URL: https://nvbanvwibmghxroybjxp.supabase.co/functions/v1/smartlead-webhook
Events: ALL
```

**Qué pasa en el CRM cuando llega un evento:**

| Evento Smartlead | client_outreach_log | client_inventory | client_contacts |
|---|---|---|---|
| EMAIL_SENT | status → 'sent' | — | — |
| EMAIL_OPENED | status → 'opened', opened_at | — | — |
| EMAIL_CLICKED | status → 'clicked' | — | — |
| EMAIL_REPLIED | status → 'replied', replied_at | status → 'interested' | last_contacted_at |
| EMAIL_BOUNCED | status → 'bounced' | status → 'disqualified' | status → 'bounced' |
| UNSUBSCRIBED | status → 'no_answer' | — | status → 'do_not_contact' |

**Si el evento es REPLIED → dispara automáticamente el Paso ⑤**

**Edge Function:** `smartlead-webhook` (verify_jwt: false — webhook externo)

**Ya existe en el CRM:**
- ✓ `client_outreach_log` con todos los status necesarios
- ✓ Patrón de webhook log (igual que `brevo_webhook_log`)
- ✗ Falta: Edge Function + tabla `smartlead_webhook_log`

---

## Paso ⑤: Sync a HubSpot (solo leads calientes)

**Qué:** Enviar a HubSpot solo los leads que tienen actividad real (replied, interesado, reunión).

**Por qué:** Los vendedores no quieren ver 1,000 prospectos fríos. Solo los que respondieron o mostraron interés.

**Cuándo se dispara:**

| Trigger | Cuándo | Qué syncea |
|---|---|---|
| Automático | Smartlead detecta reply | Ese lead específico |
| Manual | Vendedor clickea "Enviar a HubSpot" | Leads seleccionados |
| Batch diario | Cron 8 AM | Todos con status 'interested' no synceados |

**Qué se crea en HubSpot:**
- Contacto con: email, nombre, empresa, cargo, teléfono, icp_score, canal
- Deal en pipeline correspondiente (B2B Ventas o Creadores Onboarding)
- Asociación contacto ↔ deal

**Edge Function:** `sync-to-hubspot` (verify_jwt: true)

---

## Resumen para Gabriel

| Paso | Qué hacer | Edge Function | Existe | Esfuerzo |
|---|---|---|---|---|
| ① Import CSV | Subir leads crudos al CRM | `import-leads` | Parcial (tablas sí, UI no) | 4h |
| ② Enriquecer | Seleccionar servicios, ejecutar | `enrich-via-clay` + `poll-clay-results` | Parcial (pipeline sí, Clay no) | 6h |
| ③ Smartlead | Push contactos validados | `push-to-smartlead` | No | 3h |
| ④ Tracking | Recibir webhooks Smartlead | `smartlead-webhook` | Patrón sí (Brevo) | 3h |
| ⑤ HubSpot | Sync leads calientes | `sync-to-hubspot` | No | 3h |
| UI Import | Página upload CSV | — | No | 4h |
| UI Enrich | Página selección servicios | — | No | 4h |
| Migración | Tabla webhook + campos nuevos | — | — | 1h |
| **Total** | | | | **~28h** |

### Orden de implementación recomendado

```
Semana 1 (Día 3-5):
  1. Migración BD
  2. import-leads (para poder cargar datos desde día 3)
  3. enrich-via-clay + poll-clay-results

Semana 1 (Día 5-7):
  4. push-to-smartlead
  5. smartlead-webhook

Semana 2 (Día 8-10):
  6. sync-to-hubspot
  7. UI de import y enriquecimiento

Semana 2+:
  8. Agregar más servicios de enriquecimiento al catálogo
```

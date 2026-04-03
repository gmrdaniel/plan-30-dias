# T02 — HubSpot CRM Setup

## Información General
| Campo | Valor |
|-------|-------|
| **ID** | T02 |
| **Prioridad** | 🔴 CRITICA |
| **Responsable** | Daniel Ramírez |
| **Fecha Inicio** | Martes 7 Abril |
| **Fecha Entrega** | Martes 7 Abril |
| **Bloqueada por** | — |
| **Bloquea a** | T14, T17, DTO-OUT-01 |

## Objetivo
CRM central operativo con pipelines, propiedades y accesos para los 4 equipos.

## Estado actual (2 Abril 2026)

> HubSpot portal ID: `6554518`
> Plan: Starter (legacy con pipelines heredados)
> Service Token: `VITE_HUBSPOT_SERVICE_TOKEN` en `.env.local`

### Paso 1: Cuenta HubSpot — COMPLETADO
- Portal existente con plan Starter
- Service token (Private App) creado con scopes: contacts, companies, deals, schemas (read/write)

### Paso 2: Pipeline B2B Ventas — COMPLETADO
Pipeline **01-B2B Ventas** (id: `default`) con 9 etapas:

| # | Etapa | isClosed |
|---|-------|----------|
| 0 | Prospecto Nuevo | No |
| 1 | Contactado | No |
| 2 | Cualificado | No |
| 3 | Reunion Agendada | No |
| 4 | Propuesta Enviada | No |
| 5 | Negociacion | No |
| 6 | Cerrado Ganado | Si |
| 7 | Cerrado Perdido | Si |
| 8 | Nurture | No |

### Paso 3: Pipeline Creadores Onboarding — COMPLETADO
Pipeline **02-Creadores Onboarding** (id: `2384881`) con 9 etapas:

| # | Etapa | isClosed |
|---|-------|----------|
| 0 | Lead | No |
| 1 | Contactado | No |
| 2 | Cualificado | No |
| 3 | Demo/Pitch Realizado | No |
| 4 | Contrato Enviado | No |
| 5 | Firmado | Si |
| 6 | Onboarding Elevn | No |
| 7 | Activo | Si |
| 8 | No Interesado | Si |

### Pipelines legacy (renombrados, no tocar)

| Pipeline | Negocios | ID |
|----------|-------:|---|
| 03-VIP La Neta | 139 | 1030599 |
| 04-AIR | 47 | 1043775 |
| 05-INK | 29 | 1044125 |
| 06-Meanflock | 23 | 1036980 |
| 07-Oportunidades Negocio legacy | 356 | 1173755 |
| 08-Popstar Ventures | 363 | 75e28846-ad0d-4be2-a027-5e1da6590b98 |
| 09-NAS | 21 | 1064451 |

> Pipeline "Pinterest campañas" fue eliminado accidentalmente (0 negocios, no se puede recrear por límite de plan).

### Paso 4: Propiedades Custom — COMPLETADO

Grupo **"Outreach Pipeline"** (17 propiedades custom + 2 nativas):

#### Propiedades compartidas (ambos pipelines)

| Propiedad | Tipo | Opciones/Notas | Mapeo herramientas |
|-----------|------|----------------|-------------------|
| `lead_source` | dropdown | Clay, SmartScout, Apify, ManyChat, Referral, Inbound, Manual | Clay: custom field |
| `icp_score` | number | 1-10 | Clay Sculptor (col.4) |
| `first_contact_channel` | dropdown | Email, LinkedIn, Instagram, WhatsApp, Phone, SMS | Smartlead/Expandi/ManyChat evento |
| `team_owner` | dropdown | Marketing Influencers, Creators, Infrastructure, Content | Manual / routing |
| `pipeline_type` | dropdown | b2b, creators | Según pipeline destino |
| `outreach_status` | dropdown | new, sequence_active, replied, no_response, nurture, converted | Smartlead `status` + Expandi events |
| `contact_country` | text | — | Clay `/Country`. Segmentación WhatsApp LatAm vs US |
| `email_valid` | dropdown | true, false, pending | Clay ZeroBounce (col.2) |
| `program` | text | Ej: "Ads Factory" | Programa/servicio activo que se ofrece |
| `batch_list` | text | Ej: "Meta 3 abril" | Lista/batch de procesamiento actual |
| `crm_contact_id` | text | UUID | `creator_inventory.id` o `client_contacts.id` en Supabase |
| `crm_list_id` | text | UUID | `creator_lists.id` o `client_contact_lists.id` en Supabase |

#### Propiedades solo B2B

| Propiedad | Tipo | Opciones/Notas | Mapeo herramientas |
|-----------|------|----------------|-------------------|
| `video_gap_score` | number | 1-10 | Clay formula (col.5) desde SmartScout |
| `classification` | dropdown | private_label, manufacturer, distributor, reseller, brand, agency, other | Clay/SmartScout |

#### Propiedades solo Creadores

| Propiedad | Tipo | Opciones/Notas | Mapeo herramientas |
|-----------|------|----------------|-------------------|
| `creator_platform` | dropdown | youtube, tiktok, instagram, twitch | ManyChat / Social Blade |
| `creator_followers` | number | — | Social Blade / ManyChat |
| `creator_language` | dropdown | en, es, pt, other | ManyChat / Manual |

#### Propiedades nativas de HubSpot (no crear, solo mapear)

| Propiedad nativa | Para qué | Mapeo |
|------------------|----------|-------|
| `hs_linkedin_url` | LinkedIn profile URL | Clay `/LinkedIn URL`, Expandi `linkedin_profile_link` |
| `jobtitle` | Job title | Clay `/Job Title`, Expandi `job_title` |

#### Propiedades legacy (121 props movidas a grupo "Legacy")
Todas las propiedades custom anteriores fueron movidas al grupo "Legacy" para mantener orden. No se eliminaron.

### Paso 5: Limpieza de datos — COMPLETADO

| Acción | Resultado |
|--------|----------|
| Contactos eliminados | 17,418 (conservados 463 vinculados a deals) |
| Empresas eliminadas | 3,540 (conservadas 36 vinculadas a deals) |
| Deals 07-FIRMAR VIP | 25 eliminados (pipeline reutilizado como 02-Creadores) |
| Deals 01-B2B Ventas (huérfanos) | 5 eliminados (etapas fantasma) |
| Deals 07-Oportunidades legacy | 356 movidos a etapas restauradas |

> Todos los registros eliminados van a la papelera de HubSpot (90 días para restaurar).

### Paso 6: Accesos — PENDIENTE
Invitar a cada líder de equipo:
- Pepe (Equipo 1 - Marketing): acceso pipeline B2B
- Mery (Equipo 2 - Creadores): acceso pipeline Creadores
- Líder Equipo 4 (Contenido): acceso ambos pipelines (lectura)
- Gabriel, Dayana, Eugenia, Lillian: acceso completo Equipo 3

### Paso 7: Verificación — PENDIENTE
- Crear 1 contacto de prueba en cada pipeline
- Mover por todas las etapas
- Verificar que las propiedades custom se guardan correctamente
- Confirmar que cada equipo tiene acceso (pedir confirmación por Telegram)

## Entregables
- [x] Cuenta HubSpot activa con service token
- [x] Pipeline 01-B2B Ventas con 9 etapas
- [x] Pipeline 02-Creadores Onboarding con 9 etapas
- [x] 17 propiedades custom creadas (grupo Outreach Pipeline)
- [x] 121 propiedades legacy organizadas (grupo Legacy)
- [x] Datos legacy limpiados (solo contactos/empresas vinculados a deals)
- [ ] Accesos dados a los 4 equipos
- [ ] Contacto de prueba en cada pipeline

## Criterios de Aceptación
- [x] Pipelines con etapas correctas y visibles en HubSpot
- [x] Propiedades custom visibles al editar un contacto (grupo Outreach Pipeline)
- [ ] Los 4 líderes de equipo confirman acceso por Telegram
- [ ] Un contacto puede moverse por todas las etapas sin error

## Costo
| Item | Costo |
|------|-------|
| HubSpot Sales Hub Starter (1 licencia) | $20/mes |
| Upgrade a Sales Pro (Semana 3, 2 licencias) | $180-200/mes (pendiente cotización Natalia) |

## Notas
- El plan actual tiene límite de 2 pipelines nuevos. Los 7 legacy son heredados y no se pueden recrear si se eliminan.
- La API usa el service token (`pat-na1-...`) almacenado en `VITE_HUBSPOT_SERVICE_TOKEN`.
- Smartlead/Expandi/Clay mapean a las propiedades custom durante su configuración de integración (T06, T07).
- HubSpot es temporal para el sprint. El CRM propio (Supabase) es el destino final. El campo `crm_contact_id` mantiene el vínculo bidireccional.

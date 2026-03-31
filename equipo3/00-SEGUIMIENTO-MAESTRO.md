# SEGUIMIENTO MAESTRO — Equipo 3: Infraestructura

**Sprint:** 6 Abril – 8 Mayo 2026 (24 días hábiles, 1 mayo feriado)
**Misión:** Construir toda la base técnica. 80% de entregables para el Día 16 (Tue 21 Abr). Luego monitorear, resolver y escalar.

---

## Equipo

| Nombre | Rol | Ubicación | Fortaleza clave | Riesgo personal |
|--------|-----|-----------|-----------------|-----------------|
| **Daniel Ramírez** | Líder / Director General México | México | Programación, Excel, compras, opera, autoridad de decisión | Le cuesta delegar, necesita estructura de seguimiento |
| **Gabriel Piñero** | Analista Creativo de Datos y Automatización | Venezuela | Python, email config, APIs, resuelve solo | Internet inestable, no pregunta — necesita tareas explícitas |
| **Lillian Lucio** | Diseñadora UX/UI Junior | México | Figma, VS Code, extracción/organización de info | Recién egresada, puede necesitar guía en herramientas nuevas |
| **Dayana Vizcaya** | Directora Creativa | Colombia | Diseño, redacción, visual, itera, dirección creativa | No muy analítica, puede necesitar varias iteraciones |
| **Eugenia García** | Estratega de MKT Digital y Narrativa | Venezuela | Números, análisis, Brevo/email, narrativa, comprometida | Puede perder foco — tareas puntuales con fuentes claras |

---

## Calendario de Días Hábiles

| DH# | Fecha | Día | Fase |
|-----|-------|-----|------|
| 1 | 6 Abr | Lun | Pre-Sprint |
| 2 | 7 Abr | Mar | Pre-Sprint |
| 3 | 8 Abr | Mié | Semana 1 |
| 4 | 9 Abr | Jue | Semana 1 |
| 5 | 10 Abr | Vie | Semana 1 |
| 6 | 13 Abr | Lun | Semana 1 |
| 7 | 14 Abr | Mar | Semana 1 |
| 8 | 15 Abr | Mié | Semana 2 |
| 9 | 16 Abr | Jue | Semana 2 |
| 10 | 17 Abr | Vie | Semana 2 |
| 11 | 20 Abr | Lun | Semana 2 |
| 12 | 21 Abr | Mar | Semana 2 |
| 13 | 22 Abr | Mié | Semana 3 |
| 14 | 23 Abr | Jue | Semana 3 |
| 15 | 24 Abr | Vie | Semana 3 |
| 16 | 27 Abr | Lun | Semana 3 |
| 17 | 28 Abr | Mar | Semana 3 |
| 18 | 29 Abr | Mié | Semana 4 |
| 19 | 30 Abr | Jue | Semana 4 |
| -- | 1 May | Vie | **FERIADO** |
| 20 | 4 May | Lun | Semana 4 |
| 21 | 5 May | Mar | Semana 4 |
| 22 | 6 May | Mié | Semana 4 |
| 23 | 7 May | Jue | Semana 4 |
| 24 | 8 May | Vie | Cierre Sprint |

---

## Tracker de Tareas

| ID | Tarea | Responsable | Apoyo | Inicio | Entrega | Prioridad | Status | Bloqueada por | Bloquea a |
|----|-------|-------------|-------|--------|---------|-----------|--------|---------------|-----------|
| T01 | Dominios + Email + DNS + Warmup Smartlead | Gabriel | Daniel (compra) | 6 Abr | 6 Abr | CRITICA | ☐ Pendiente | — | T06, T07, T11 |
| T02 | HubSpot CRM Setup | Daniel | — | 7 Abr | 7 Abr | CRITICA | ☐ Pendiente | — | T14, T17 |
| T03 | Telegram + Relay.app Alertas | Eugenia | — | 7 Abr | 7 Abr | CRITICA | ☐ Pendiente | — | T14, T18 |
| T04 | Documentos ICP (B2B + Creadores) | Eugenia | Mery, Pepe (ext) | 6 Abr | 7 Abr | CRITICA | ☐ Pendiente | DTO-01, DTO-02 | T06, T11 |
| T05 | Cuentas LinkedIn + Instagram Outreach | Dayana | — | 7 Abr | 7 Abr | CRITICA | ☐ Pendiente | — | T07 |
| T06 | Clay Cascade + SmartScout + Apify Config | Gabriel | — | 8 Abr | 9 Abr | CRITICA | ☐ Pendiente | T04 | T07, T11 |
| T07 | Smartlead + Expandi + JustCall + Conexiones | Gabriel, Dayana | Daniel (conexiones) | 9 Abr | 10 Abr | CRITICA | ☐ Pendiente | T01, T05, T06 | T14, DTO-09, DTO-10 |
| T08 | ManyChat + WhatsApp + Branch.io + Twilio | Dayana | Gabriel (Twilio), Lillian (Branch) | 10 Abr | 13 Abr | CRITICA | ☐ Pendiente | — | T12, DTO-07 |
| T09 | Sendspark + ElevenLabs + Klaviyo/SMS | Dayana, Eugenia | Gabriel (API) | 13 Abr | 13 Abr | CRITICA | ☐ Pendiente | DTO-03 | DTO-08, DTO-12 |
| T10 | Slybroadcast + Social Blade + Outgrow | Eugenia | Daniel (compra), Lillian | 14 Abr | 14 Abr | ALTA | ☐ Pendiente | — | T16 |
| T11 | Clay Cascade 1,000 Prospectos | Gabriel | — | 8 Abr | 14 Abr | CRITICA | ☐ Pendiente | T04, T06 | DTO-06, T11-B, T14 |
| T11-B | Sync Clay → Supabase (client_inventory + contacts + lists) | Gabriel | Daniel (Supabase) | 17 Abr | 17 Abr | CRITICA | ☐ Pendiente | T11 | T14 |
| T12 | Flujos ManyChat WhatsApp + IG Completos + Webhook → Supabase | Dayana (flujos), Gabriel/Daniel (webhook Supabase) | Lillian (UX review) | 14 Abr | 15 Abr | CRITICA | ☐ Pendiente | T08 | T14, DTO-07 |
| T13 | Discord + WhatsApp Communities | Lillian | Eugenia | 15 Abr | 15 Abr | ALTA | ☐ Pendiente | — | — |
| T14 | Testing E2E + Verificación Integraciones | Gabriel, Daniel | Dayana, Lillian, Eugenia | 16 Abr | 16 Abr | CRITICA | ☐ Pendiente | T07, T11, T12 | T15, Lanzamiento Sem 3 |
| T15 | Documentación Arquitectura + Loom | Daniel | Dayana, Lillian | 16 Abr | 16 Abr | CRITICA | ☐ Pendiente | T14 | DTO-05 |
| T16 | Micrositios B2B + Creadores + Lead Magnets | Lillian (reporta) | Eugenia (calculadoras), Dayana (co-ejecuta: assets, copy, dirección creativa) | 17 Abr | 21 Abr | CRITICA | ☐ Pendiente | T10 (Outgrow) | DTO-11 |
| T17 | Monitoreo Competitivo + Routable | Daniel | — | 22 Abr | 23 Abr | ALTA | ☐ Pendiente | T02 | — |
| T18 | Monitoreo Diario + Resolución Integraciones | Gabriel, Dayana | Todo el equipo | 22 Abr | 8 May | ALTA | ☐ Pendiente | T14 | T19 |
| T19 | Evaluacion Escalamiento Mes 2 | Daniel | — | 4 May | 6 May | ALTA | ☐ Pendiente | T18 | T20 |
| T20 | Retrospectiva Sprint | Todo el equipo | — | 8 May | 8 May | MEDIA | ☐ Pendiente | T19 | — |

---

## Hitos Clave (Milestones)

| Hito | Fecha | Criterio de Éxito | Status |
|------|-------|--------------------|--------|
| **M1: Warmup iniciado** | 6 Abr | 15 cuentas email en Smartlead calentando | ☐ |
| **M2: CRM + Comms operativos** | 7 Abr | HubSpot + Telegram + Relay.app funcionando | ☐ |
| **M3: Stack de datos activo** | 9 Abr | Clay + SmartScout + Apify cascada construyéndose | ☐ |
| **M4: Outreach tools ready** | 10 Abr | Smartlead + Expandi + JustCall configurados | ☐ |
| **M5: Messaging infra live** | 13 Abr | ManyChat + Twilio + Branch.io + ElevenLabs activos | ☐ |
| **M6: 1,000 prospectos** | 14 Abr | Clay cascade completa, prospectos enriquecidos | ☐ |
| **M6b: Datos en Supabase** | 17 Abr | 1,000 prospectos sincronizados a client_inventory + client_contacts | ☐ |
| **M7: Pipelines E2E probados** | 16 Abr | B2B + Creadores pipelines funcionando end-to-end | ☐ |
| **M8: Micrositios + Lead Magnets** | 21 Abr | 2 micrositios + 2 calculadoras activas | ☐ |
| **M9: Fase de monitoreo estable** | 28 Abr | 5 días sin incidentes críticos | ☐ |
| **M10: Sprint completado** | 8 May | Retrospectiva + evaluación escalamiento entregados | ☐ |

---

## Standup Diario — 9:00 AM (15 min)

Cada persona responde: **"¿Qué entregué ayer? ¿Qué haré hoy? ¿Qué me bloquea?"**

| Persona | Reporta sobre |
|---------|--------------|
| Daniel (Líder / DG) | Estado general, bloqueos, compras pendientes, HubSpot, coordinación con otros equipos |
| Gabriel (Datos y Automatización) | Clay, Smartlead, datos, APIs, salud de dominios, sync Supabase |
| Lillian (UX/UI Junior) | Branch.io, Discord, micrositios, UX reviews |
| Dayana (Directora Creativa) | ManyChat, Expandi, LinkedIn/IG, flujos, dirección creativa micrositios |
| Eugenia (Estratega MKT Digital) | Telegram/alertas, ICP, Klaviyo, Outgrow, presupuesto, narrativa |

**Daniel es Director General México.** Tiene autoridad de decisión para compras individuales y operación del equipo. Para decisiones de presupuesto total o que impacten a otros equipos, Daniel coordina y comunica con los líderes de los otros equipos. Resumen semanal los viernes (10 Abr, 17 Abr, 24 Abr, 8 May).

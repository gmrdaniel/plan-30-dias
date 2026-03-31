# T04 — Documentos ICP (B2B + Creadores)

## Información General
| Campo | Valor |
|-------|-------|
| **ID** | T04 |
| **Prioridad** | 🔴 CRITICA |
| **Responsable** | Eugenia García |
| **Apoyo** | Daniel (escalación), Pepe (Eq1), Mery (Eq2) |
| **Fecha Inicio** | Lunes 6 Abril (enviar templates) |
| **Fecha Entrega** | Martes 7 Abril (docs compilados) |
| **Bloqueada por** | DTO-IN-01 (Pepe), DTO-IN-02 (Mery) |
| **Bloquea a** | T06, T11 (Clay no puede filtrar sin ICP) |

## Objetivo
Tener 2 documentos ICP finalizados (B2B y Creadores) que definan exactamente a quién buscar. Gabriel necesita estos criterios para construir la cascada de Clay. Los documentos incluyen criterios de filtrado + mapping de campos a la base de datos (Supabase).

## Plantillas descargables

| Plantilla | Archivo | Quién llena | Para qué |
|---|---|---|---|
| **A1** Criterios ICP B2B | [T04-A1-criterios-icp-b2b.csv](/templates/T04-A1-criterios-icp-b2b.csv) | Pepe (Eq1) | Gabriel configura filtros Clay/SmartScout |
| **A2** Empresa prospecto B2B | [T04-A2-empresa-prospecto-b2b.csv](/templates/T04-A2-empresa-prospecto-b2b.csv) | Gabriel genera desde Clay | Pepe valida que campos son correctos |
| **A3** Contacto empresa B2B | [T04-A3-contacto-empresa-b2b.csv](/templates/T04-A3-contacto-empresa-b2b.csv) | Gabriel genera desde Clay | Pepe valida mapping a client_contacts |
| **B1** Criterios ICP Creadores | [T04-B1-criterios-icp-creadores.csv](/templates/T04-B1-criterios-icp-creadores.csv) | Mery (Eq2) | Gabriel configura Social Blade |
| **B2** Creador prospecto | [T04-B2-creador-prospecto.csv](/templates/T04-B2-creador-prospecto.csv) | Pipeline ManyChat genera | Mery valida mapping a creator_inventory |
| **B3** Perfil social creador | [T04-B3-perfil-social-creador.csv](/templates/T04-B3-perfil-social-creador.csv) | Pipeline Social Blade genera | Mery valida mapping a creator_social_profiles |

**Pepe y Mery solo llenan A1 y B1** (criterios, ~15-20 campos cada uno). A2, A3, B2, B3 son la estructura que Clay/pipeline va a generar — ellos solo validan.

## Detalle de Implementación

### Pre-trabajo: Lunes 6 Abril (mañana)
1. Descargar las 6 plantillas CSV del tracker
2. Enviar a Pepe (Equipo 1) las plantillas A1 + A2 + A3 por email con mensaje:
   > "Pepe, necesitamos que llenes A1 (criterios) para el martes 7 Abr. A2 y A3 son para que valides que los campos que Clay va a extraer son los correctos. Es la base para configurar la prospección automática."
3. Enviar a Mery (Equipo 2) las plantillas B1 + B2 + B3 con el mismo enfoque.
4. Poner recordatorio para seguimiento a las 4 PM del lunes.

### Template A1: ICP B2B — Campos obligatorios que Pepe debe llenar

| Campo | Obligatorio | Usado por | Impacto si falta |
|---|---|---|---|
| industrias_objetivo | **SI** | Clay (filtros SmartScout/Apify) | Gabriel no sabe qué industrias buscar |
| tamano_acuerdo_min/max_usd | **SI** | Clay (scoring) | No se puede calificar prospectos |
| titulos_decision (job titles) | **SI** | Clay (filtro LinkedIn) + Smartlead | Emails llegan a personas equivocadas |
| tamano_empresa_min | **SI** | Clay (filtro) | Prospectos muy chicos o muy grandes |
| geolocalizacion | **SI** | Clay (filtro geo) | Prospectos fuera de mercado |
| keywords_exclusion | **SI** | Clay (exclusión) | Prospectos de industrias no deseadas |
| clasificacion_leads (A/B/C) | **SI** | Clay (qualification_score) | No hay priorización de prospectos |
| objeciones (mínimo 3) | **SI** | Templates email + guiones | Copy genérico, baja conversión |
| que_hace_prospecto_caliente | **SI** | Alertas Telegram + HubSpot | No se sabe cuándo intervenir |

### Template B1: ICP Creadores — Campos obligatorios que Mery debe llenar

| Campo | Obligatorio | Usado por | Impacto si falta |
|---|---|---|---|
| plataformas_objetivo | **SI** | Social Blade + ManyChat | No se sabe dónde buscar |
| suscriptores_minimo | **SI** | Social Blade + ManyChat (umbral) | Cualificación incorrecta |
| idiomas_contenido | **SI** | Social Blade + ManyChat | Creadores en idiomas no objetivo |
| categorias_contenido | **SI** | Social Blade (filtro) | Nichos equivocados |
| ingreso_mensual_minimo_usd | **SI** | ManyChat (umbral >$500) | Se cualifican creadores no rentables |
| razones_desercion (mínimo 3) | **SI** | Messaging retención | Copy genérico |
| tiempo_a_monetizacion | **SI** | Calculadora Outgrow | Proyecciones incorrectas |
| tasas_adopcion_servicios | **SI** | Calculadora Outgrow + micrositio | Proyecciones de ganancias incorrectas |
| pain_points (mínimo 3) | **SI** | Copy ManyChat + micrositio | Messaging no resuena |

### Mapping a Base de Datos (referencia para Gabriel)

**A2: Empresa prospecto → `client_inventory`**

| Campo CSV (Pepe ya tiene) | → Columna Supabase | Obligatorio Supabase | Obligatorio Clay |
|---|---|---|---|
| Empresa | `name` | SI | SI |
| Industria | `industry` | NO | SI |
| Categoria | `primary_category` | NO | NO |
| Clasificacion | `classification` | NO | NO |
| Country | `country` | NO | SI |
| Ubicacion | `city` | NO | NO |
| Ingresos Estimados | `estimated_marketplace_revenue` | NO | SI |
| Pagina Web | `website_url` | NO | SI |
| Tienda online | `online_store_url` | NO | NO |
| Pagina De Instagram | `instagram_handle` | NO | NO |
| Pagina De Tiktok | `tiktok_handle` | NO | NO |
| Canal De Youtube | `youtube_url` | NO | NO |
| Pagina De Linkedin | `linkedin_url` | NO | NO |
| Email De Contacto | `corporate_email` | NO | NO |
| Telefono De Contacto | `phone` | NO | NO |
| *(auto)* | `status` = 'lead' | SI | — |
| *(auto)* | `lead_source` = 'cold_email' | NO | — |
| *(auto)* | `qualification_score` (0-100) | NO | SI |
| *(auto)* | `qualification_criteria` (JSONB) | NO | SI |

**A3: Contacto empresa → `client_contacts`**

| Campo CSV (Pepe ya tiene) | → Columna Supabase | Obligatorio Supabase | Obligatorio Clay |
|---|---|---|---|
| Empleado (nombre completo) | `first_name` + `last_name` | SI (first_name) | SI |
| Cargo | `job_title` | NO | SI |
| Email Empleado | `email` | NO | SI |
| Telefono Empleado | `phone` | NO | NO |
| Linkedin Account | `linkedin_url` | NO | SI |
| Ubicacion Empleado | `country` + `city` | NO | NO |
| Email Disponible | `email_valid` | NO | NO |
| Telefono Disponible | `phone_valid` | NO | NO |
| *(derivar de cargo)* | `is_decision_maker` | NO | NO |
| *(primer contacto)* | `is_primary_contact` | NO | NO |
| *(auto)* | `status` = 'active' | SI | — |

**B2: Creador prospecto → `creator_inventory`**

| Campo | → Columna Supabase | Obligatorio Supabase | Obligatorio Pipeline |
|---|---|---|---|
| nombre | `first_name` | SI | SI |
| email | `email` | SI | SI |
| telefono | `phone` | NO | NO |
| country | `country` | NO | NO |
| language | `language` | NO | SI (ManyChat pregunta) |
| categories | `categories` | NO | NO |
| *(auto)* | `status` = 'inventory' | SI | — |

**B3: Perfil social → `creator_social_profiles`**

| Campo | → Columna Supabase | Obligatorio Supabase | Obligatorio Pipeline |
|---|---|---|---|
| platform | `platform` | SI | SI |
| username | `username` | SI | SI |
| followers | `followers` | NO | SI (Social Blade) |
| engagement_rate | `engagement_rate` | NO | NO |
| average_views | `average_views` | NO | NO |

### Martes 7 Abril: Compilación
1. Recibir respuestas de Pepe (A1) y Mery (B1)
2. Compilar en 2 documentos formales con los campos + mapping
3. Enviar A2/A3 a Pepe para validación de estructura ("¿estos son los datos que necesitas por prospecto?")
4. Enviar B2/B3 a Mery para validación de estructura
5. Enviar a Daniel para revisión rápida
6. Compartir link en Telegram #general-infra
7. Gabriel toma los criterios para T06 (Clay)

### Si no llega a tiempo:
- Si Pepe no responde: Daniel lo llama directamente
- Si Mery no responde: Daniel la llama directamente
- Si ninguno responde antes de las 2 PM del martes: Gabriel empieza Clay con criterios genéricos temporales:
  - B2B: E-commerce/Amazon sellers, >$1M revenue, US/LATAM, sin video profesional, cargos CMO/VP Marketing
  - Creadores: YouTube/TikTok, >10K subs, español/inglés, Gaming/Lifestyle
  - Se actualizan cuando lleguen los criterios reales

## Entregables
- [ ] 6 plantillas CSV descargadas y listas para enviar
- [ ] Plantillas A1 + A2 + A3 enviadas a Pepe (Lunes 6 Abr AM)
- [ ] Plantillas B1 + B2 + B3 enviadas a Mery (Lunes 6 Abr AM)
- [ ] Seguimiento hecho (Lunes 4 PM)
- [ ] ICP B2B compilado (A1 llena + A2/A3 validados)
- [ ] ICP Creadores compilado (B1 llena + B2/B3 validados)
- [ ] Daniel revisó y aprobó ambos documentos
- [ ] Gabriel confirma que los criterios son suficientes para Clay
- [ ] Links compartidos en Telegram

## Criterios de Aceptación
- [ ] A1: todos los campos obligatorios llenos (9 de 9)
- [ ] B1: todos los campos obligatorios llenos (9 de 9)
- [ ] A2/A3: Pepe valida que la estructura de campos es correcta para su pipeline
- [ ] B2/B3: Mery valida que la estructura de campos es correcta para creadores
- [ ] Gabriel confirma que puede configurar Clay con los datos de A1
- [ ] Gabriel confirma que puede configurar Social Blade con los datos de B1
- [ ] Documentos firmados por Pepe y Mery (aprobación por email o Telegram)

## Costo
| Item | Costo |
|------|-------|
| — | $0 |

## Notas para Eugenia
- Esta es la tarea MÁS importante del Día 1-2. Sin ICP, todo lo de Clay se hace "a ciegas".
- Sé insistente con Pepe y Mery. Si no contestan el email, escríbeles por WhatsApp.
- **Las plantillas A1 y B1 son lo URGENTE — Pepe y Mery solo llenan esas.** A2/A3/B2/B3 son validación de estructura.
- Los CSVs tienen una columna "obligatorio" — resáltaselo a Pepe y Mery para que prioricen.
- NO inventes datos. Si algo no llega, marca como "PENDIENTE" y escala a Daniel.
- Guarda los docs en Google Drive en una carpeta compartida del sprint.
- Los datos de prueba del equipo de Pepe (60 empresas, 867 empleados) ya están en la carpeta `Implementación/datos-prueba/` — úsalos como referencia para validar que el mapping es correcto.

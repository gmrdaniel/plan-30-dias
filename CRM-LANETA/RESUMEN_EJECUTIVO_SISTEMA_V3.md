# CRM LANETA V2 — Resumen Ejecutivo

> **Sistema de Gestion de Influencer Marketing + Prospeccion B2B**
> Version 4.0 | Actualizado: 30 de Marzo, 2026

---

## Numeros clave

| Base de Datos | Frontend | Commits | Servicios Railway | Edge Functions | Integraciones |
|:---:|:---:|:---:|:---:|:---:|:---:|
| **606** | **70+** | **1,300+** | **5** | **20+** | **12** |
| Migraciones | Paginas | Total | Microservicios | Funciones serverless | APIs externas |

---

## Como esta construido

### Arquitectura general

```
                    ┌──────────────────────────┐
                    │     Frontend (React)      │
                    │   Vercel — develop/main   │
                    └──────────┬───────────────┘
                               │
                    ┌──────────▼───────────────┐
                    │    Supabase (Backend)      │
                    │  PostgreSQL + Auth + RLS   │
                    │  Edge Functions (Deno)     │
                    │  Storage (S3-compatible)   │
                    │  Realtime (WebSockets)     │
                    └──────────┬───────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
    ┌─────────▼──────┐ ┌──────▼───────┐ ┌──────▼───────┐
    │  Railway        │ │  APIs REST   │ │  Webhooks    │
    │  /services      │ │  externas    │ │  entrantes   │
    │                 │ │              │ │              │
    │ enrichment-api  │ │ RapidAPI     │ │ MUX          │
    │ ffmpeg-api      │ │ Brevo        │ │ Brevo        │
    │ gate2-visual    │ │ Hunter.io    │ │ WhatsApp     │
    │ gate3-audio     │ │ Respond.io   │ │ Stripe       │
    │ gate4-logo      │ │ Deepgram     │ │              │
    └─────────────────┘ │ OpenRouter   │ └──────────────┘
                        │ Stripe       │
                        │ Resend       │
                        └──────────────┘
```

### Stack tecnologico

| Capa | Tecnologia | Para que |
|---|---|---|
| **Frontend** | React 18 + TypeScript + Vite | Aplicacion SPA |
| **UI** | Tailwind CSS + shadcn/ui | Componentes |
| **State** | TanStack Query (React Query) | Cache y fetch de datos |
| **Routing** | React Router v6 | Rutas protegidas por rol |
| **i18n** | i18next | Espanol, Ingles, Portugues |
| **Database** | PostgreSQL 15 (Supabase) | 606 migraciones, RLS, triggers |
| **API** | PostgREST (auto-generada) | REST API desde el schema |
| **Auth** | Supabase Auth (GoTrue) | Magic links, roles, JWT |
| **Functions** | Edge Functions (Deno) | Logica ligera server-side |
| **Storage** | Supabase Storage (S3) | Videos, PDFs, imagenes |
| **Background Jobs** | Railway (Python/FastAPI) | Tareas pesadas y async |
| **Deploy** | Vercel (frontend) + GitHub Actions (migrations) | CI/CD |

### Servicios en Railway (/services)

> Para tareas que necesitan mas de 60 segundos (limite de Edge Functions) o procesamiento pesado.

| Servicio | Stack | Proposito |
|---|---|---|
| `laneta-enrichment-api` | Python + FastAPI | Enrichment pipelines, Brevo sync, followers IG/TT |
| `ffmpeg-api` | Node.js + FFmpeg | Clips de video, deteccion de escenas, audio |
| `gate2-visual-quality` | Python + OpenCV | Analisis de calidad visual de videos |
| `gate3-audio-copyright` | Python + ACRCloud | Deteccion de copyright en audio |
| `gate4-logo-detection` | Python + Google Vision | Deteccion de logos en frames de video |

### Integraciones externas

| Servicio | Proposito | Donde se usa |
|---|---|---|
| **Supabase** | Base de datos, auth, storage, realtime | Todo el sistema |
| **Brevo** | Campanas de email masivo + tracking | Sync campanas, eventos, stats por creator |
| **RapidAPI** | APIs de redes sociales (instagram360, tiktok381) | Enrichment: followers, bio, verificado |
| **Hunter.io** | Validacion de emails | Enrichment: email_valid, hunter_status |
| **Respond.io** | WhatsApp Business (notificaciones) | Notificaciones, firma electronica |
| **Resend** | Email transaccional | Notificaciones, magic links, firma PDF |
| **MUX** | Procesamiento de video | Thumbnails, rendiciones, streaming |
| **Deepgram** | Transcripcion de audio | AI Video Labeling |
| **OpenRouter** | ML/AI (Llama, GPT) | Analisis ML de videos |
| **Stripe** | Pagos (US + MX) | Suscripciones, checkout |
| **Label Studio** | Etiquetado de datos | Sync bidireccional con AI Labeling |
| **WhatsApp Cloud API** | Bot de videos | Ingestion de videos para labeling |

---

## Modulos del sistema

### 1. Gestion de Campanas

> Ciclo completo de campanas de influencer marketing con 18 tipos de tareas, 6 fases, y flujo de aprobacion multi-rol.

| Funcionalidad | Estado |
|---|---|
| Creacion y edicion de campanas con audit trail | Operativo |
| Workflow de 18 tareas (6 fases) | Operativo |
| Aprobacion multi-nivel (admin → cliente → creador) | Operativo |
| Briefs enriquecidos (rich text, PDF, archivos) | Operativo |
| Drafts con versionamiento y revision | Operativo |
| Programacion y registro de publicaciones | Operativo |
| Notificaciones (email, WhatsApp, realtime) | Operativo |

### 2. Inventario de Creadores

> Base de datos de creadores con perfiles de redes sociales, importacion masiva, y busqueda avanzada.

| Funcionalidad | Estado |
|---|---|
| CRUD completo con busqueda y filtros avanzados | Operativo |
| Importacion CSV con mapeo configurable de columnas | Operativo |
| Importacion Upfluence (Excel especifico) | Operativo |
| Perfiles de redes sociales (IG, TikTok, YT, X, etc.) | Operativo |
| Listas segmentadas (manual, CSV, sub-lista, programa) | Operativo |
| Vista expandible de creators por lista | Operativo |
| Filtros: pais, plataforma, followers, bloqueado, email valido | Operativo |
| Asignacion a lista y programa al importar | Operativo |

### 3. Inventario de Clientes (B2B)

> Pipeline de prospeccion para marcas/empresas con contactos, productos, y presencia en marketplaces.

| Funcionalidad | Estado |
|---|---|
| CRUD empresas con pipeline CRM (lead → converted) | Operativo |
| Contactos por empresa con roles y jerarquia | Operativo |
| Productos y listings en marketplaces (Amazon, MercadoLibre, etc.) | Operativo |
| Competidores por empresa | Operativo |
| Scoring automatico de prospeccion (0-100) | Operativo |
| Listas de contactos para outreach masivo | Operativo |
| Importacion CSV de empresas y contactos | Operativo |
| Seleccion multiple + agregar a lista desde busqueda | Operativo |

### 4. Programas

> Agrupacion de creadores por programa (ej: Meta Breakthrough Bonus) con datos especificos y metricas.

| Funcionalidad | Estado |
|---|---|
| CRUD de programas con color, plataforma, status | Operativo |
| Enrollments de creadores por programa | Operativo |
| Importacion CSV con datos de programa (meta_data + metrics) | Operativo |
| Detalle con stats por status, tabla de enrollments paginada | Operativo |

### 5. Pipeline de Enrichment

> Sistema de procesamiento batch para validar y enriquecer datos de creadores y contactos.

| Funcionalidad | Estado |
|---|---|
| Catalogo de 9+ servicios de enrichment | Operativo |
| Crear pipeline sobre una lista (N pasos configurables) | Operativo |
| Ejecucion en Railway con progress tracking | Operativo |
| Pagina de detalle con steps + resultados paginados | Operativo |
| Smart skip (cache TTL para no re-procesar) | Operativo |
| Retry de pipeline (reset + re-ejecutar) | Operativo |
| Generar sub-lista desde resultados (encadenar pipelines) | Operativo |
| Rate limiting para APIs externas (4s entre requests) | Operativo |

**Workers activos:**

| Worker | API | Que hace |
|---|---|---|
| `validate_email` | Hunter.io | Valida emails (valid/invalid/accept_all) |
| `validate_name` | Interno | Normaliza nombres a Proper Case |
| `update_followers_ig` | RapidAPI instagram360 | Followers, bio, email, categoria, verificado |
| `update_followers_tt` | RapidAPI tiktok381 | Followers, likes, bio, website, verificado |
| `score_qualification` | Interno | Score 0-100 para prospeccion B2B |
| `update_followers_yt` | Pendiente | YouTube (pendiente API) |

### 6. Brevo Email Tracking

> Sincronizacion de campanas de Brevo con tracking de eventos por creator.

| Funcionalidad | Estado |
|---|---|
| Sync de campanas desde Brevo (293+ campanas) | Operativo |
| Asignacion de programa por campana (dropdown inline) | Operativo |
| Sync hibrido de eventos: Export Recipients + eventos detallados | Operativo |
| Progress tracking en UI (polling cada 3s) | Operativo |
| Stats por creator: opens, clicks, bounces, timestamps | Operativo |
| Auto-block en spam/unsubscribed | Operativo |
| Detalle de campana con senders y stats | Operativo |

### 7. Video Processing & Filters

> Pipeline de 7 gates para filtrar y clasificar videos automaticamente.

| Funcionalidad | Estado |
|---|---|
| Gate 1: Analisis tecnico (FFmpeg) — duracion, resolucion, FPS | Operativo |
| Gate 2: Calidad visual (OpenCV) — blur, brillo, contraste | Operativo |
| Gate 3: Copyright audio (ACRCloud) — musica con derechos | Operativo |
| Gate 4: Deteccion de logos (Google Vision) — marcas visibles | Operativo |
| Gate 5: Deteccion de caras (face detection) | Operativo |
| Gates 6-7: Contenido inapropiado y duplicados | Pendiente |
| Dashboard de filtros con resultados por gate | Operativo |

### 8. AI Video Labeling

> Modulo de ingestion, procesamiento y etiquetado de videos para entrenamiento de AI.

| Funcionalidad | Estado |
|---|---|
| Ingestion via WhatsApp Bot | Operativo |
| Procesamiento MUX (thumbnails, rendiciones) | Operativo |
| FFmpeg (clips, escenas, audio) | Operativo |
| Transcripcion (Deepgram) | Operativo |
| Analisis ML (OpenRouter) | Operativo |
| Label Studio sync bidireccional | Operativo |
| Pipeline Orchestrator automatizado | Operativo |
| Firma electronica via WhatsApp con PDF | Operativo |

### 9. Administracion

> Panel de administracion reorganizado en 6 categorias con hubs visuales.

| Categoria | Contenido |
|---|---|
| **Directory** | Usuarios, Empresas, Agencias, Creadores |
| **Sales & Revenue** | Client Inventory, Paquetes, Suscripciones, Descuentos, Email Tracking |
| **Marketplace** | Oportunidades, Workflows, Delivery Packages |
| **Operations** | Video Filters, Processing, AI Labels, Executive KPIs |
| **Pipelines** | Programas, Creator Search, Client Inventory, Listas, Enrichment, Brevo, Reportes |
| **System** | Configuracion |

Hub de Pipelines organizado en 3 grupos logicos:
1. **Fuentes de datos** — Programas, Creator Search, Client Inventory, Products
2. **Organizar** — Creator Lists, Contact Lists
3. **Procesar y medir** — Enrichment, Brevo Campaigns, Reports

---

## Roles del sistema

| Rol | Acceso principal |
|---|---|
| `administrator` | Acceso completo a todo el sistema |
| `creator` | Sus campanas, drafts, publicaciones |
| `client` | Sus campanas, aprobaciones de creadores y contenido |
| `marketing` | Inventarios de creadores y clientes, listas, enrichment |
| `operations` | Inventarios, pipelines, video processing |
| `sales` | Client inventory, paquetes, suscripciones |
| `agency` | Gestion de usuarios de su agencia |
| `finance` | Pagos y facturacion |

---

## Ambientes

| Ambiente | Branch | Frontend | Base de datos | CI/CD |
|---|---|---|---|---|
| **Develop** | `develop` | Vercel (preview) | Supabase develop | GitHub Actions → migrations + Edge Functions |
| **Produccion** | `main` | Vercel (production) | Supabase produccion | GitHub Actions → migrations + Edge Functions |

Cada push a `develop` dispara:
1. Vercel build del frontend
2. GitHub Actions: `supabase db push` (migraciones)
3. GitHub Actions: `supabase functions deploy` (Edge Functions)
4. GitHub Actions: `supabase gen types` → auto-commit `types.ts`
5. Railway: redeploy automatico de servicios

---

## Documentacion relacionada

| Documento | Ubicacion |
|---|---|
| Diccionario de datos (Creator + Client) | `requirements/inventory-entities-data-dictionary.md` |
| Plan de accion V5 (12 fases) | `requirements/17-03 BD Creadores/PLAN_DE_ACCION.md` |
| Bitacora de implementacion | `requirements/17-03 BD Creadores/BITACORA.md` |
| Casos de uso V5 | `requirements/17-03 BD Creadores/CASOS_DE_USO.md` |
| Infraestructura Enrichment API | `services/laneta-enrichment-api/ENRICHMENT-SERVICE-INFRASTRUCTURE.md` |
| Memoria tecnica Enrichment | `docs/MEMORIA_TECNICA_ENRICHMENT.md` |
| Manual de usuario Enrichment | `docs/MANUAL_ENRICHMENT.md` |
| Secrets de Supabase | `docs/deployment/SUPABASE_SECRETS_FEATURE_DEVELOP.md` |

---

**Ultima actualizacion:** 30 de Marzo, 2026
**Version:** 4.0

# Contexto del Proyecto — Plan 30 Días

> **Fecha de inicio:** 6 Abril 2026
> **Última actualización:** 1 Abril 2026
> **Repo:** github.com/gmrdaniel/plan-30-dias
> **Tracker:** plan-30-dias.vercel.app
> **Supabase:** nvbanvwibmghxroybjxp.supabase.co

---

## Qué es este proyecto

La Neta / Global Media Review es una agencia de influencer marketing con 50,000+ creadores. Este proyecto es un **sprint de 30 días** para escalar la adquisición de clientes B2B y creadores mediante automatización de prospección multicanal.

Hay 4 equipos. Nosotros somos el **Equipo 3: Infraestructura** — construimos toda la base técnica.

## Equipo 3

| Nombre | Rol real | Fortaleza | Riesgo |
|---|---|---|---|
| Daniel Ramírez | Director General México (líder) | Programación, Excel, compras, opera | Le cuesta delegar |
| Gabriel Piñero | Analista Creativo de Datos y Automatización | Python, APIs, email config, resuelve solo | Internet inestable, no pregunta |
| Lillian Lucio | Diseñadora UX/UI Junior | Figma, VS Code | Recién egresada, ramp-up |
| Dayana Vizcaya | Directora Creativa | Diseño, redacción, visual, itera | No muy analítica |
| Eugenia García | Estratega de MKT Digital y Narrativa | Números, análisis, Brevo, narrativa | Puede perder foco |

## Otros equipos (dependencias)

- **Equipo 1 (Pepe):** Marketing de Influencers — ventas B2B, definen ICP B2B
- **Equipo 2 (Mery):** Creadores — gestión de roster, definen ICP Creadores
- **Equipo 4:** Contenido + Campañas — escriben copy, templates email, activos

## Estructura del repo

```
plan_30_dias/
├── equipo3/                    # Documentos fuente del plan
│   ├── 00-SEGUIMIENTO-MAESTRO.md
│   ├── 00-CALENDARIO-SEMANAL-POR-PERSONA.md
│   ├── 00-DTOs-DEPENDENCIAS-ENTRE-EQUIPOS.md
│   ├── 00-LISTA-CONTRATACION-HERRAMIENTAS.md
│   ├── 00-MAPA-RIESGOS.md
│   ├── 00-PRESUPUESTO-HERRAMIENTAS.md
│   ├── 00-DATOS-PRUEBA-TEMPLATES.md
│   └── tareas/                 # 20 fichas de tareas + T11-B
│       ├── T01-dominios-email-dns-warmup.md
│       ├── T02-hubspot-crm.md
│       ├── T03-telegram-relay-alertas.md  (era Slack, cambiado a Telegram)
│       ├── T04-documentos-icp.md          (con 6 CSV templates + mapping BD)
│       ├── T05-linkedin-instagram-outreach.md
│       ├── T06-clay-smartscout-apify.md   (DETALLADA: 2 fases, pipeline enrichment, exports por plan)
│       ├── T07-smartlead-expandi-justcall.md (REESCRITA: flujo via HubSpot, Expandi↔HubSpot nativo)
│       ├── T08-manychat-whatsapp-branch-twilio.md
│       ├── T09-sendspark-elevenlabs-klaviyo.md
│       ├── T10-slybroadcast-socialblade-outgrow.md
│       ├── T11-clay-cascade-1000-prospectos.md (incluye T11-B: sync Clay→Supabase)
│       ├── T12-flujos-manychat-completos.md (incluye webhook ManyChat→Supabase)
│       ├── T13-discord-whatsapp-communities.md
│       ├── T14-testing-e2e-integraciones.md (referencia datos de prueba)
│       ├── T15-documentacion-arquitectura-loom.md
│       ├── T16-micrositios-leadmagnets.md (Unbounce cubre B2B + Creadores, Leadpages descartada)
│       ├── T17-monitoreo-competitivo-routable.md
│       ├── T18-monitoreo-diario-mantenimiento.md
│       ├── T19-evaluacion-escalamiento.md
│       └── T20-retrospectiva-sprint.md
├── Implementación/             # Documentos fuente originales
│   ├── 01-La_Neta_Plan_Implementacion_Equipos_FINAL_ES.docx.md
│   ├── datos-prueba/           # CSVs reales de Pepe (60 empresas, 867 empleados)
│   └── inventory-entities-data-dictionary.md
├── Planeación-contexto/        # Plan estratégico original
├── tracker/                    # App React + Supabase (desplegada en Vercel)
│   ├── src/
│   │   ├── pages/              # Dashboard, Board, MyView, TaskDetail, Pipeline, Procurement, Blockers, Milestones, Docs
│   │   ├── lib/                # types, supabase, tools, dtos, pipeline-data, procurement-analysis
│   │   ├── hooks/              # use-auth, use-tasks
│   │   ├── components/         # Layout, Login, TaskCard
│   │   └── docs/               # 7 docs sprint + 20 tareas como markdown renderizado
│   └── supabase/migrations/    # 018 migraciones
└── .github/workflows/          # GitHub Actions para deploy migraciones
```

## Tracker App (plan-30-dias.vercel.app)

**Stack:** React 19 + TypeScript + Vite + Supabase + Tailwind CSS
**Auth:** Supabase Auth (5 usuarios, email+password)
**Deploy:** Vercel (root: tracker/), GitHub Actions para migraciones

### Vistas

| Ruta | Qué hace |
|---|---|
| `/` | Dashboard: avance global, por persona, por fase, alertas |
| `/board` | Cards por fase con filtros persistentes en URL |
| `/my` | Mis tareas (default) con toggle para ver todas |
| `/task/:id` | 3 tabs: Resumen (checklist, tools, comments) + Detalle completo (markdown) + API (si aplica) |
| `/milestones` | 11 hitos del sprint |
| `/procurement` | 2 tabs: Seguimiento (checklist contratación) + Análisis (opciones, costos, escenarios) |
| `/blockers` | ~20 bloqueantes con estados pendiente/respondida/aprobada, agrupables por fecha/categoría |
| `/pipeline` | 2 tabs: B2B (21 días) + Creadores (7 días). Timeline visual con herramientas, syncs, gaps |
| `/docs` | 7 documentos del sprint como HTML |
| `/docs/:slug` | Documento individual renderizado con react-markdown + remark-gfm |

### BD Supabase (tablas)

- `team_members` — 5 integrantes
- `tasks` — 21 tareas con status, progress_pct (auto-calculado)
- `task_assignments` — responsable/apoyo/co-ejecuta
- `task_checklist` — ~198 items (entregables + criterios). Trigger auto-update progress
- `task_comments` — comentarios por tarea
- `milestones` — 11 hitos
- `procurement` — 25 herramientas con check contratada
- `blockers` — ~20 preguntas/dependencias con status

## Decisiones clave tomadas

### Herramientas

| Herramienta | Decisión | Por qué |
|---|---|---|
| **Slack → Telegram** | Cambiado en todos los docs | El equipo usa Telegram |
| **Namecheap → GoDaddy** | Cambiado | Preferencia del equipo |
| **Leadpages → eliminada** | Unbounce Build cubre B2B + Creadores | Ahorro $49/mes |
| **Clay** | Starter $149 actual. Necesita Launch $185 (Smartlead) o Growth $495 (todo auto). Bloqueante B11 | Legacy pricing terminó |
| **HubSpot** | Free → Starter $20 → Pro $90. 3 cuentas. Total ~$330/Mes 1 | Workflows necesarios Sem 3+ |

### Dominios y email

- **5 dominios para cold outreach:** 4 ya comprados (elevnhub.me, elevnpro.me, lanetahub.com, lanetapro.com) + 1 por comprar (B01)
- **laneta.com y elevn.me:** EXCLUIDOS de cold outreach (principal/operación)
- **15 cuentas nuevas** a crear (3 por dominio). Nombres de sender los definen Pepe y Mery (B13)
- **Cuentas existentes** (apply@creators.*) NO se tocan
- **Warmup:** Smartlead 14-21 días + 22 empleados como semilla

### Flujo de datos (Pipeline B2B)

```
SmartScout/Apify → CSV → Clay (enriquece)
  → Smartlead (email, nativo con Launch+)
  → HubSpot (via Smartlead webhook)
  ↔ Expandi (via HubSpot integración nativa bidireccional)
  → Supabase (script/webhook según plan Clay)
```

Expandi NO recibe datos de Clay directo (excepto con Growth $495). Obtiene prospectos de HubSpot via integración nativa.

### Flujo de datos (Pipeline Creadores)

```
Social Blade → Clay (enriquece) → ManyChat (IG DM → WhatsApp)
  → HubSpot (pipeline Creadores)
  → Supabase (creator_inventory + creator_lists)
```

### DTOs (contratos entre equipos)

15 DTOs definidos: 5 entradas (lo que Eq3 recibe) + 10 salidas (lo que Eq3 entrega). Cada uno con interfaces tipo código, mapping a Supabase, y deadlines.

### Bloqueantes activos (~20)

Los más críticos:
- **B01:** 1 dominio por comprar (nombre por definir)
- **B11:** Clay plan: Launch $185 vs Growth $495
- **B13:** Nombres sender + subdominios (Pepe y Mery definen)
- **B15:** Job titles ICP B2B (CMO, VP Marketing, etc.)
- **G2/G3:** Cross-channel pause (Expandi↔Smartlead cuando prospecto responde en otro canal)

## Base de datos existente (Supabase CRM)

El CRM ya tiene datos de 50K+ creadores en:
- `creator_inventory` — perfil maestro del creador
- `creator_social_profiles` — métricas por plataforma
- `client_inventory` — marcas/empresas prospecto
- `client_contacts` — personas dentro de empresas
- `client_outreach_log` — historial de comunicaciones
- `client_competitors` — competidores por empresa

Ver `inventory-entities-data-dictionary.md` para el schema completo.

## Datos de prueba disponibles

En `Implementación/datos-prueba/`:
- 60 empresas reales (CSV) con industria, revenue, redes sociales
- 867 empleados/contactos con cargo, email, LinkedIn
- 154 registros de métricas sociales (IG/TT/YT)
- 86 registros de competidores

Estos datos se usan para: validar Clay cascade, probar sync a Supabase, probar Smartlead/Expandi con datos swapped (empleados internos).

## Cómo trabajar con este repo

1. **No modificar archivos sin leer primero** — hay interdependencias entre tareas, DTOs, bloqueantes y pipeline
2. **Los docs en `equipo3/` son la fuente de verdad** — los docs en `tracker/src/docs/` son copias para renderizar
3. **Después de modificar una tarea**, copiar el .md a `tracker/src/docs/tareas/`
4. **Migraciones Supabase** van en `tracker/supabase/migrations/` — numeradas secuencialmente
5. **Commits descriptivos** — cada commit explica qué cambió y por qué
6. **No hacer push sin verificar build** — `cd tracker && npm run build`

## Credenciales

En `tracker/.env.local` (NO en git):
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- SUPABASE_ACCESS_TOKEN
- SUPABASE_SERVICE_ROLE_KEY
- VITE_CLAY_API_KEY

Passwords del tracker:
- daniel@laneta.com / daniel2026
- gabriel@laneta.com / gabriel2026
- lillian@laneta.com / lillian2026
- dayana@laneta.com / dayana2026
- eugenia@laneta.com / eugenia2026

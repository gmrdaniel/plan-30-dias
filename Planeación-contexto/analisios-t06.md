  Análisis T06: Clay — Lo que se espera vs lo que el API ofrece

  Lo que T06 espera de Clay

  ┌──────┬──────────────────────────┬────────────────────────────────────────────────────────────────────┬──────────────────────────────────────────────┐
  │ Paso │          Acción          │                               Input                                │               Output esperado                │
  ├──────┼──────────────────────────┼────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ 1    │ Importar prospectos base │ CSV de SmartScout (vendedores Amazon) + CSV de Apify (Shopify/Meta │ Tabla Clay con ~1,200 rows raw               │
  │      │                          │  Ads)                                                              │                                              │
  ├──────┼──────────────────────────┼────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ 2    │ Enriquecer email         │ nombre + empresa + website                                         │ email verificado (Prospeo → Findymail →      │
  │      │ (cascade)                │                                                                    │ Hunter)                                      │
  ├──────┼──────────────────────────┼────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ 3    │ Enriquecer LinkedIn      │ nombre + empresa                                                   │ linkedin_url + job_title                     │
  ├──────┼──────────────────────────┼────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ 4    │ Scoring IA               │ revenue + video_presence + industry_fit                            │ icp_score (1-10)                             │
  ├──────┼──────────────────────────┼────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ 5    │ Video Gap Score          │ datos SmartScout                                                   │ video_gap_score (1-10)                       │
  ├──────┼──────────────────────────┼────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ 6    │ Push a Smartlead         │ email + nombre + empresa                                           │ Prospecto en secuencia de email              │
  ├──────┼──────────────────────────┼────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ 7    │ Push a Expandi           │ linkedin_url                                                       │ Prospecto en secuencia LinkedIn              │
  ├──────┼──────────────────────────┼────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ 8    │ Sync a Supabase          │ todos los campos                                                   │ Registro en client_inventory +               │
  │      │                          │                                                                    │ client_contacts                              │
  └──────┴──────────────────────────┴────────────────────────────────────────────────────────────────────┴──────────────────────────────────────────────┘

  Lo que Clay realmente ofrece (de la documentación)

  Importar datos (Source):
  - HTTP API como fuente → puede jalar de SmartScout API y Apify API directamente
  - CSV import manual → alternativa simple
  - Limitación: API source solo trae primera página (sin paginación automática). Para datasets grandes, CSV es más confiable.

  Enriquecimiento (80+ providers nativos):
  - Email discovery: Hunter, Prospeo, Swordfish, SignalHire, LeadIQ — cascade/waterfall nativo
  - Email validation: ZeroBounce, NeverBounce, Debounce, Listmint
  - Company intelligence: ZoomInfo, Crunchbase, PitchBook
  - Phone: Upcell, Sureconnect, Forager
  - AI/Scoring: Clay AI (Sculptor) — genera scores con prompts personalizados

  HTTP API Integration (para servicios no nativos):
  - GET/POST/PUT/DELETE a cualquier API externa
  - Authentication: Bearer token, API key en header
  - Referencia dinámica a columnas de la tabla: "email": "/Email Column"
  - Rate limiting configurable (ej: 10 req/s)
  - Conditional execution (solo enriquecer si campo no está vacío)
  - Esto es clave para SmartScout y Apify si no tienen integración nativa

  Export (destinos confirmados):
  - Smartlead: Integración NATIVA directa — no necesita HTTP API manual
  - HubSpot: Integración nativa
  - Slack/Telegram: Via Zapier webhook
  - Google Sheets: Nativo
  - Postgres (Supabase): Via Fivetran o HTTP API webhook
  - CSV export: Manual

  Cómo queda el flujo técnico real

  FUENTES (importar a Clay)
  ├── SmartScout → Export CSV → Import a Clay tabla (más confiable que API por paginación)
  ├── Apify → Export CSV → Import a Clay tabla
  └── O usar HTTP API source si el volumen es pequeño (<100 rows por call)

  ENRIQUECIMIENTO (dentro de Clay, row by row)
  ├── Columna 1: Datos base (ya importados)
  ├── Columna 2: Email cascade (NATIVO)
  │   └── Prospeo → Hunter → LeadIQ (waterfall automático de Clay)
  ├── Columna 3: Email validation (NATIVO)
  │   └── ZeroBounce o NeverBounce
  ├── Columna 4: LinkedIn lookup (NATIVO o HTTP API a LinkedIn Sales Nav)
  ├── Columna 5: ICP Score (Clay AI / Sculptor)
  │   └── Prompt: "Score 1-10 based on {revenue}, {has_video}, {industry}"
  └── Columna 6: Video Gap (dato de SmartScout, ya viene en el CSV)

  EXPORT (push desde Clay)
  ├── Clay → Smartlead (NATIVO, integración directa)
  ├── Clay → Expandi (HTTP API POST, no hay integración nativa)
  ├── Clay → HubSpot (NATIVO)
  ├── Clay → Supabase (HTTP API POST a Edge Function, o webhook)
  └── Clay → CSV backup (manual export)

  Hallazgos clave para la implementación

  1. Smartlead tiene integración nativa con Clay. No necesitas HTTP API custom. Gabriel solo configura el destino en Clay y los prospectos se pushean
  automáticamente. Esto simplifica T07.

  2. Expandi NO tiene integración nativa. Se necesita HTTP API dentro de Clay para hacer POST a Expandi. Gabriel necesita:
  - Expandi API endpoint y API key
  - Configurar HTTP API enrichment en Clay con los campos correctos

  3. Supabase tampoco tiene integración nativa, pero hay dos caminos:
  - Opción A (recomendada): Clay webhook → Supabase Edge Function (ya definido en T11-B)
  - Opción B: Clay → CSV export → script Python de Gabriel → Supabase

  4. El cascade de email es nativo de Clay. No hay que programarlo — Clay tiene waterfall built-in. Gabriel solo selecciona los providers en orden de
  prioridad y Clay los ejecuta automáticamente.

  5. Clay AI (Sculptor) puede generar el ICP score. Se configura con un prompt en lenguaje natural. Gabriel no necesita programar nada — solo escribir:
  "Score this prospect 1-10 where 10 = perfect fit for a video marketing agency targeting Amazon sellers without professional video content."

  6. SmartScout/Apify → Clay es mejor por CSV que por API. La limitación de paginación de Clay API source hace que para datasets grandes sea más confiable
  exportar CSV y luego importar.

  7. Créditos: Cada enrichment consume créditos diferentes. Email cascade con 3 providers puede consumir 1-3 créditos. AI scoring consume 1. LinkedIn lookup
   consume 1-2. Total por prospecto: 3-6 créditos estimados.

  Pasos concretos para Gabriel

  ┌─────┬─────────────────────────────────────────────┬─────────────────────────────────────┬───────────────┬────────────┐
  │  #  │                   Acción                    │             Herramienta             │     Tipo      │ Dificultad │
  ├─────┼─────────────────────────────────────────────┼─────────────────────────────────────┼───────────────┼────────────┤
  │ 1   │ Login Clay, verificar créditos y plan       │ Clay UI                             │ Manual        │ Baja       │
  ├─────┼─────────────────────────────────────────────┼─────────────────────────────────────┼───────────────┼────────────┤
  │ 2   │ Export vendedores Amazon desde SmartScout   │ SmartScout → CSV                    │ Manual        │ Baja       │
  ├─────┼─────────────────────────────────────────────┼─────────────────────────────────────┼───────────────┼────────────┤
  │ 3   │ Export marcas Shopify/Meta Ads desde Apify  │ Apify → CSV                         │ Config actors │ Media      │
  ├─────┼─────────────────────────────────────────────┼─────────────────────────────────────┼───────────────┼────────────┤
  │ 4   │ Importar CSVs a Clay como tabla             │ Clay UI (upload)                    │ Manual        │ Baja       │
  ├─────┼─────────────────────────────────────────────┼─────────────────────────────────────┼───────────────┼────────────┤
  │ 5   │ Deduplicar por dominio/empresa              │ Clay (fórmula)                      │ Config        │ Baja       │
  ├─────┼─────────────────────────────────────────────┼─────────────────────────────────────┼───────────────┼────────────┤
  │ 6   │ Agregar enrichment: email cascade           │ Clay UI (Prospeo → Hunter → LeadIQ) │ Config nativo │ Baja       │
  ├─────┼─────────────────────────────────────────────┼─────────────────────────────────────┼───────────────┼────────────┤
  │ 7   │ Agregar enrichment: email validation        │ Clay UI (ZeroBounce)                │ Config nativo │ Baja       │
  ├─────┼─────────────────────────────────────────────┼─────────────────────────────────────┼───────────────┼────────────┤
  │ 8   │ Agregar enrichment: LinkedIn lookup         │ Clay UI o HTTP API                  │ Config        │ Media      │
  ├─────┼─────────────────────────────────────────────┼─────────────────────────────────────┼───────────────┼────────────┤
  │ 9   │ Agregar enrichment: AI scoring (Sculptor)   │ Clay UI + prompt                    │ Config        │ Baja       │
  ├─────┼─────────────────────────────────────────────┼─────────────────────────────────────┼───────────────┼────────────┤
  │ 10  │ Video gap score: ya viene de SmartScout CSV │ —                                   │ Ya está       │ —          │
  ├─────┼─────────────────────────────────────────────┼─────────────────────────────────────┼───────────────┼────────────┤
  │ 11  │ Configurar export → Smartlead               │ Clay UI (integración nativa)        │ Config nativo │ Baja       │
  ├─────┼─────────────────────────────────────────────┼─────────────────────────────────────┼───────────────┼────────────┤
  │ 12  │ Configurar export → Expandi                 │ Clay HTTP API (POST)                │ Config API    │ Media      │
  ├─────┼─────────────────────────────────────────────┼─────────────────────────────────────┼───────────────┼────────────┤
  │ 13  │ Test con 50 prospectos (batch 1)            │ Clay UI (run enrichments)           │ Ejecución     │ Baja       │
  ├─────┼─────────────────────────────────────────────┼─────────────────────────────────────┼───────────────┼────────────┤
  │ 14  │ Medir créditos consumidos                   │ Clay dashboard                      │ Verificar     │ Baja       │
  └─────┴─────────────────────────────────────────────┴─────────────────────────────────────┴───────────────┴────────────┘

  Lo que hay que actualizar en T06

  1. Smartlead es integración nativa — simplificar paso de push
  2. Expandi necesita HTTP API — agregar detalle de configuración
  3. Cascade de email es nativo — no es "configurar 3 APIs", es seleccionar providers en el UI
  4. AI scoring via Sculptor — agregar el prompt sugerido
  5. Agregar que SmartScout ya trae video_gap como dato — no es un enrichment separado
  6. Agregar Supabase sync via webhook como paso de export (ya está en T11-B pero referenciar aquí)
  7. Agregar los providers específicos confirmados: Prospeo, Hunter, LeadIQ, ZeroBounce
# T06 — Clay Cascade + SmartScout + Apify Config

## Información General
| Campo | Valor |
|-------|-------|
| **ID** | T06 |
| **Prioridad** | 🔴 CRITICA |
| **Responsable** | Gabriel Piñero |
| **Apoyo** | Daniel (upgrade Clay si necesario) |
| **Fecha Inicio** | Miércoles 8 Abril |
| **Fecha Entrega** | Jueves 9 Abril (estructura lista, enriquecimiento continúa hasta T11) |
| **Bloqueada por** | T04 (ICP docs — necesita criterios de filtrado) |
| **Bloquea a** | T07, T11 |

## Objetivo
Configurar Clay como hub central de enriquecimiento con pipeline automático: importar prospectos → enriquecer (email, LinkedIn, score) → exportar a Smartlead + Expandi + Supabase. Todo en una sola tabla con enrichments encadenados.

## Contexto
- Clay (plan base $149, ~2,000 créditos): CSV import SI, HTTP API enrichment SI, Smartlead export nativo SI
- SmartScout ($97): Export CSV desde UI SI, API propia NO (requiere plan superior — bloqueante para Fase 2)
- Apify ($49): API SI, actors configurables

---

## FASE 1: Import manual CSV + pipeline de enrichment (Día 3-7)

Esta fase usa CSV manuales para alimentar Clay. Es la más rápida de implementar y la que se usa para los primeros 1,000 prospectos del sprint.

### Paso 1.1: Preparar fuentes de datos

**SmartScout (manual via UI):**
1. Login SmartScout (herramientas@laneta.com)
2. Ir a Brands → aplicar filtros del ICP (T04):
   - Categoría: las definidas por Pepe
   - Revenue mensual: >$41,666 (~$500K/año)
   - Sponsored Video Win Rate: 0% (proxy para "sin video")
   - Total products: >= 3
3. Export CSV (~500-1,000 marcas)

**Apify (scrapers):**
1. Login Apify
2. Ejecutar actor Meta Ads Library: marcas con ads activos sin video
3. Ejecutar actor Shopify store scraper: marcas DTC no-Amazon
4. Export resultados como CSV

### Paso 1.2: Importar a Clay

1. Login Clay (herramientas@laneta.com)
2. Crear tabla nueva: "Sprint-Abr-B2B-Prospectos"
3. Upload CSV de SmartScout
4. Upload CSV de Apify (merge en misma tabla o tabla separada)
5. **Resultado:** ~1,200 rows de empresas raw

### Paso 1.3: Deduplicar

1. Agregar fórmula de dedup por `website_url` o `empresa`
2. Marcar duplicados → eliminar
3. **Assert:** count_after < count_before. Warning si 0 duplicados (posible error en fórmula)

### Paso 1.4: Configurar pipeline de enrichments (columnas encadenadas)

Cada enrichment es una columna en la tabla Clay. Se ejecutan en orden, row by row:

```
COLUMNA 1: Email cascade (NATIVO Clay — waterfall automático)
  Config: Prospeo → Hunter → LeadIQ
  Conditional run: solo si columna "email" está vacía
  Resultado: email_encontrado
  Créditos: 1-3 por fila
      ↓
COLUMNA 2: Email validation (NATIVO Clay)
  Config: ZeroBounce
  Conditional run: solo si email_encontrado tiene valor
  Resultado: email_valid (true/false), email_status
  Créditos: 1 por fila
      ↓
COLUMNA 3: LinkedIn lookup (NATIVO Clay)
  Config: LinkedIn Sales Navigator enrichment
  Input: nombre_empresa + nombre_contacto
  Conditional run: solo si empresa tiene valor
  Resultado: linkedin_url, job_title, location
  Créditos: 1-2 por fila
      ↓
COLUMNA 4: AI Score — ICP (NATIVO Clay Sculptor)
  Prompt: "Score this prospect 1-10 where 10 = perfect fit.
    Criteria: Amazon seller in {industry} vertical,
    monthly revenue ${revenue}, {video_presence} video ads,
    {employee_count} employees. We target brands WITHOUT
    professional video content that have >$500K annual revenue."
  Conditional run: solo si revenue tiene valor
  Resultado: icp_score (1-10)
  Créditos: 1 por fila
      ↓
COLUMNA 5: Video Gap Score
  Fuente: ya viene del CSV de SmartScout (sponsored_video_win_rate)
  Si = 0% → video_gap_score = 8-10 (no tiene video ads)
  Si > 0% y < 5% → video_gap_score = 5-7 (poco video)
  Si > 5% → video_gap_score = 1-4 (ya invierte en video)
  Config: Fórmula Clay (no enrichment, no gasta créditos)
      ↓
COLUMNA 6: Export a Smartlead (NATIVO — integración directa)
  Config: Enrichment tipo "Smartlead: Add lead to campaign"
  API Key: desde app.smartlead.ai/app/settings/profile
  Campaña: seleccionar campaña pre-creada en Smartlead
  Campos mapeados:
    email → Email Address (requerido)
    first_name → First Name
    last_name → Last Name
    empresa → Company Name
    linkedin_url → Personal LinkedIn URL
    phone → Phone Number
    website → Company URL
  Conditional run: solo si email_valid = true
  Duplicados: Smartlead rechaza automáticamente emails ya existentes en campaña
      ↓
COLUMNA 7: Export a Expandi (HTTP API POST — no hay integración nativa)
  URL: https://api.expandi.io/api/v1/leads (verificar endpoint exacto)
  Header: Authorization: Bearer {EXPANDI_API_KEY}
  Body: {
    "linkedin_url": "/LinkedIn URL",
    "first_name": "/First Name",
    "last_name": "/Last Name",
    "company": "/Company Name"
  }
  Conditional run: solo si linkedin_url tiene valor
  Rate limit: 10 requests/segundo
      ↓
COLUMNA 8: Sync a Supabase (HTTP API POST — webhook a Edge Function)
  URL: https://nvbanvwibmghxroybjxp.supabase.co/functions/v1/sync-clay-prospect
  Header: Authorization: Bearer {SUPABASE_ANON_KEY}
  Content-Type: application/json
  Body: {
    "empresa": "/Company Name",
    "website": "/Website",
    "industria": "/Industry",
    "country": "/Country",
    "email": "/Email",
    "email_valid": "/Email Valid",
    "linkedin_url": "/LinkedIn URL",
    "job_title": "/Job Title",
    "first_name": "/First Name",
    "last_name": "/Last Name",
    "icp_score": /ICP Score,
    "video_gap_score": /Video Gap Score,
    "revenue": /Revenue,
    "classification": "/Classification"
  }
  Conditional run: solo si icp_score tiene valor AND email tiene valor
  Resultado: registro en client_inventory + client_contacts + lista "Sprint-Abr-B2B"
```

### Paso 1.5: Test con 20 prospectos (datos de prueba)

Usar las 20 empresas seleccionadas del CSV de prueba (B17). Swapear emails/teléfonos por datos de empleados internos (B16).

**Ejecutar y medir:**

| # | Assert | Target | Warning si falla |
|---|---|---|---|
| CP01 | Rows importadas | 20 | "Import falló — verificar formato CSV" |
| CP02 | Dedup funciona | 20 después de re-import (no 40) | "Dedup no funciona — revisar fórmula" |
| CP03 | Email fill rate | >=80% (16/20) | "Tasa <80% — ajustar orden de cascade" |
| CP04 | Email valid rate | >=75% de los encontrados | "Bounce rate >25% — verificar calidad fuente" |
| CP05 | LinkedIn fill rate | >=70% (14/20) | "LinkedIn bajo — verificar Sales Nav acceso" |
| CP06 | ICP score generado | 100% (20/20) | "Sculptor no generó score — revisar prompt" |
| CP07 | Push a Smartlead | == rows con email válido | "Push falló — verificar API key y campaña" |
| CP08 | Push a Expandi | == rows con linkedin_url | "HTTP API falló — verificar endpoint Expandi" |
| CP09 | Sync Supabase | == rows con icp_score + email | "Edge Function falló — verificar webhook URL" |
| CP10 | Créditos consumidos | Registrar en spreadsheet | "Si >4 créditos/prospecto → alertar Daniel upgrade" |

### Paso 1.6: Batch de 200 prospectos (medir créditos reales)

Después de que los tests pasan con las 20 empresas:
1. Importar batch de 200 prospectos reales
2. Dejar que el pipeline corra automáticamente
3. **Medir créditos:** anotar créditos antes y después
4. Si consume <= 2 créditos/prospecto → plan Base alcanza para 1,000
5. Si consume > 2 → notificar a Daniel INMEDIATAMENTE para upgrade

**Gabriel: spreadsheet de tracking.** Columnas: batch_num, prospectos, creditos_inicio, creditos_fin, creditos_por_prospecto, email_fill_rate, linkedin_fill_rate, smartlead_pushed, expandi_pushed, supabase_synced.

---

## FASE 2: Import vía API para alimentar Clay automáticamente (Mes 2+)

Una vez validado el pipeline con CSV, se automatiza la entrada de datos via API para que Clay reciba prospectos de múltiples fuentes sin intervención manual.

### Fuentes automáticas

**SmartScout (requiere upgrade de licencia — bloqueante):**
- Plan actual Pro ($97) NO incluye API
- Necesario: solicitar acceso API a SmartScout (ver template en tab "Detalle API")
- Una vez habilitado: configurar HTTP API source en Clay que llame `POST /api/v2/brands/search`
- Frecuencia: semanal (cron o manual trigger)
- Limitación: Clay API source solo trae primera página — para >100 resultados, usar script Python intermediario

**Apify (API disponible — sin bloqueante):**
- Apify tiene API completa incluida en plan actual ($49)
- Configurar HTTP API source en Clay:
  - URL: `https://api.apify.com/v2/actor-runs/{actorId}/dataset/items`
  - Header: `Authorization: Bearer {APIFY_API_KEY}`
- Actor Meta Ads Library: programar ejecución semanal
- Actor Shopify scraper: programar ejecución semanal
- Resultado: nuevas marcas se importan automáticamente a la tabla Clay

**Otras fuentes futuras (Mes 2):**
- Store Leads API ($49/mes) → tiendas e-commerce
- Apollo.io API → contactos B2B directos
- Webhooks inbound → CRM/HubSpot puede pushear leads a Clay

### Cómo funciona el auto-run

Cuando se agregan rows nuevas a una tabla que ya tiene enrichments configurados:
1. Clay detecta las filas nuevas automáticamente
2. Ejecuta los enrichments **SOLO en las filas nuevas** (no re-procesa las existentes)
3. Los conditional runs aplican: si el email ya viene lleno, no gasta créditos re-enriqueciendo
4. Export a Smartlead/Expandi/Supabase se ejecuta automáticamente para las filas nuevas enriquecidas

**Resultado:** Importar datos (manual o vía API) es el único trigger necesario. Todo lo demás es automático.

### Datos históricos en Clay

- **Clay mantiene histórico.** Las filas NO se borran al importar nuevas. La tabla crece.
- **No hay sobre-escritura.** Si importas un CSV con empresas que ya están, quedan duplicadas → la fórmula de dedup las filtra.
- **Smartlead filtra duplicados:** Si un email ya fue agregado a una campaña, no lo agrega de nuevo (protección nativa).
- **Supabase hace upsert:** La Edge Function usa `website_url` como key — si ya existe, actualiza en vez de duplicar.
- **Recomendación:** Una tabla "master" en Clay que crece con cada batch. El pipeline automático solo procesa filas nuevas.

---

## Estrategia de créditos Clay

### Plan actual: Base ($149/mes, ~2,000 créditos)

| Enrichment | Créditos/fila | Para 1,000 prospectos |
|---|---|---|
| Email cascade (3 providers) | 1-3 | 1,000-3,000 |
| Email validation | 1 | 1,000 |
| LinkedIn lookup | 1-2 | 1,000-2,000 |
| AI Score (Sculptor) | 1 | 1,000 |
| Video Gap (fórmula) | 0 | 0 |
| Export Smartlead | 0 | 0 |
| Export Expandi (HTTP) | 0 | 0 |
| Sync Supabase (HTTP) | 0 | 0 |
| **Total estimado** | **4-7** | **4,000-7,000** |

**Conclusión:** El plan Base ($149) probablemente NO alcanza para 1,000 prospectos con pipeline completo. El batch de 200 (Paso 1.6) confirma esto con datos reales.

### Plan de acción
1. Batch de 20 (test) → medir créditos
2. Batch de 200 → confirmar métrica
3. Si >2 créditos/prospecto → Daniel aprueba upgrade a Pro ($495, ~50,000 créditos) el mismo día
4. Continuar batches hasta completar 1,000

---

## Entregables
- [ ] Tabla Clay "Sprint-Abr-B2B-Prospectos" creada
- [ ] CSV SmartScout importado con filtros ICP
- [ ] CSV Apify importado (Meta Ads + Shopify)
- [ ] Dedup configurado y funcionando
- [ ] Email cascade configurado (Prospeo → Hunter → LeadIQ)
- [ ] Email validation configurado (ZeroBounce)
- [ ] LinkedIn lookup configurado
- [ ] AI Score (Sculptor) configurado con prompt
- [ ] Video Gap Score fórmula configurada
- [ ] Export a Smartlead configurado (nativo) con campaña vinculada
- [ ] Export a Expandi configurado (HTTP API)
- [ ] Sync a Supabase configurado (HTTP API → Edge Function)
- [ ] Test con 20 prospectos ejecutado y asserts pasando
- [ ] Spreadsheet de tracking de créditos iniciado
- [ ] Documento técnico de la lógica del pipeline

## Criterios de Aceptación
- [ ] 20 prospectos de prueba pasan los 10 asserts (CP01-CP10)
- [ ] Email fill rate >=80%
- [ ] LinkedIn fill rate >=70%
- [ ] ICP score generado para 100% de las filas
- [ ] Prospectos con email válido aparecen en campaña de Smartlead
- [ ] Prospectos con LinkedIn aparecen en Expandi
- [ ] Prospectos enriquecidos aparecen en Supabase (client_inventory + client_contacts)
- [ ] Créditos consumidos medidos y documentados
- [ ] Pipeline corre automáticamente al agregar filas nuevas (auto-run verificado)

## Costo
| Item | Costo |
|------|-------|
| Clay (plan actual Base) | $149/mes |
| Clay upgrade a Pro (si necesario) | +$346/mes |
| SmartScout | Ya contratado ($97/mes) |
| SmartScout API (Fase 2) | Por cotizar |
| Apify | Ya contratado ($49/mes) |

## Notas para Gabriel
- **La tabla Clay con sus columnas de enrichment ES el pipeline.** No hay que programar nada extra — cada columna es un paso.
- Configurar **conditional runs** en cada columna: no gastar créditos en datos que ya existen.
- **Exports (Smartlead, Expandi, Supabase) son columnas de enrichment más**, no pasos separados. Se ejecutan automáticamente.
- Guardar la tabla como template — se reutiliza en Mes 2 para 2,500+.
- Los criterios de ICP vienen de T04. Si no los tienes para las 10 AM del miércoles, usa temporales:
  - B2B: E-commerce/Amazon sellers, >$500K revenue/año, US/LATAM, sin video ads
  - Cargos: CMO, VP Marketing, Head of E-commerce
- **Medir créditos en CADA batch** — esta métrica decide todo.
- **Fase 2 (API) es para Mes 2.** No intentar automatizar SmartScout API ahora — el bloqueante de licencia lo impide. CSV manual es suficiente para los primeros 1,000.

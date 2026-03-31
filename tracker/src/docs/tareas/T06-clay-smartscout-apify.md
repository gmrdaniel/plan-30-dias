# T06 — Clay Cascade + SmartScout + Apify Config

## Información General
| Campo | Valor |
|-------|-------|
| **ID** | T06 |
| **Prioridad** | 🔴 CRITICA |
| **Responsable** | Gabriel Piñero |
| **Apoyo** | Daniel (upgrade Clay — como DG puede aprobar directamente; coordina con otros equipos si impacta presupuesto global) |
| **Fecha Inicio** | Miércoles 8 Abril |
| **Fecha Entrega** | Jueves 9 Abril (estructura lista, enriquecimiento continúa hasta T11) |
| **Bloqueada por** | T04 (ICP docs — necesita criterios de filtrado) |
| **Bloquea a** | T07, T11 |

## Objetivo
Tener Clay configurado con tabla de enriquecimiento en cascada, conectado a SmartScout y Apify, listo para procesar 1,000 prospectos B2B.

## Contexto
Ya tienen: Clay (base $149), SmartScout (base $97), Apify (base $49).
**Posible upgrade necesario:** Clay Pro ($495/mes) para suficientes créditos de enriquecimiento. Daniel (DG) aprueba y coordina con otros equipos.

## Detalle de Implementación

### Paso 1: Verificar plan Clay y créditos
- Login en Clay (herramientas@laneta.com)
- Verificar créditos disponibles en plan base
- Si insuficientes para 1,000 prospectos: notificar a Daniel para upgrade

### Paso 2: Configurar SmartScout → Clay (proceso manual via UI)

> **Nota:** El plan Pro ($97/mes) NO incluye acceso al API. Para automatizar este paso via API, es necesario solicitar una demo de ventas a SmartScout. Ver tab "Detalle API" para los endpoints necesarios y el template de solicitud.

1. Login SmartScout (herramientas@laneta.com)
2. Ir a **Brands** > filtrar vendedores Amazon que coincidan con ICP B2B (criterios de T04):
   - **Filtros disponibles en UI:**
     - Categoria/subcategoria de Amazon
     - Revenue mensual estimado (min $41,666 = ~$500K/ano)
     - Brand Score
     - Numero de productos
     - Has Storefront (si/no)
   - **Filtro de video (limitacion):** La UI de SmartScout no tiene un filtro directo de "sin video en listing". Para identificar marcas sin video:
     - Opcion A: Filtrar por **Sponsored Video Win Rate = 0%** (disponible en filtros de Ad Spy) — detecta marcas sin video ADS pagados
     - Opcion B: Exportar lista amplia y revisar manualmente los listings top de cada marca en Amazon
     - Opcion C (recomendada): Combinar con Apify para scrape de paginas de producto y detectar presencia de video
3. Exportar lista CSV (max ~1,000 marcas por export en UI)
4. Importar a Clay como tabla fuente

**Campos clave a incluir en el export:** brand_name, monthly_revenue, category, subcategory, total_products, has_storefront, brand_score

### Paso 3: Configurar Apify scrapers
1. Login Apify
2. Configurar actors:
   - **Meta Ads Library scraper:** Buscar marcas con ads activos en vertical target
   - **Shopify store scraper:** Identificar marcas DTC no-Amazon
3. Ejecutar scrapers y exportar resultados
4. Importar a Clay como tablas adicionales

### Paso 4: Construir tabla de enriquecimiento en cascada en Clay
La cascada enriquece cada prospecto con múltiples fuentes en orden de prioridad:

```
Columna 1: Datos base (de SmartScout/Apify)
  → nombre_empresa, sitio_web, categoría, revenue_estimado

Columna 2: Enriquecimiento email (cascada)
  → Fuente 1: Prospeo (LinkedIn profile → email)
  → Fuente 2: Findymail (si Prospeo falla)
  → Fuente 3: Hunter.io (si Findymail falla)
  → Resultado: email_verificado

Columna 3: Enriquecimiento LinkedIn
  → LinkedIn Sales Navigator lookup por nombre + empresa
  → Resultado: linkedin_url, titulo_cargo

Columna 4: Calificación con IA
  → Prompt Clay AI: "Score this prospect 1-10 based on: {video_presence}, {revenue}, {industry_fit}"
  → Resultado: icp_score

Columna 5: Video Gap Score
  → SmartScout: sponsored_video_win_rate (0% = no pauta video ads)
  → Apify: scrape de pagina de producto para detectar video organico en listing
  → Combinacion de ambos: video_gap_score (1-10)
  → NOTA: SmartScout NO tiene campo "video en listing", solo "video ads pagados"
```

### Paso 5: Ejecutar prueba con 50 prospectos
- Correr cascada con 50 registros
- Verificar que email, LinkedIn, empresa, score se llenan correctamente
- Tasa de éxito mínima: >80% de campos completos
- Si <80%: ajustar orden de cascada o agregar fuentes

## Entregables
- [ ] SmartScout exportando con filtros de ICP
- [ ] Apify scrapers configurados y ejecutando
- [ ] Tabla de cascada Clay construida con 5 columnas de enriquecimiento
- [ ] Prueba de 50 prospectos ejecutada exitosamente
- [ ] Tasa de enriquecimiento >80% verificada
- [ ] Documento técnico de la lógica de cascada (para referencia)

## Criterios de Aceptación
- [ ] 50 prospectos de prueba tienen: email verificado, LinkedIn URL, empresa, score
- [ ] Tasa de campos completos >80%
- [ ] Cascada corre sin errores de API
- [ ] Datos de SmartScout + Apify fluyen a Clay sin intervención manual

## Estrategia de creditos Clay: empezar con $149, escalar si necesario

El plan actual de Clay es Base ($149/mes, ~2,000 creditos). El Pro ($495/mes) tiene ~50,000 creditos. La decision de upgrade se toma con datos reales.

### Comparacion de planes

| Aspecto | Base ($149/mes) | Pro ($495/mes) |
|---|---|---|
| Creditos | ~2,000/mes | ~50,000/mes |
| Cascada/waterfall | SI | SI |
| Filas por tabla | ~1,000 | ~25,000-50,000 |
| Webhooks | SI | SI |
| API completa | Limitada | Completa |

### Consumo estimado de creditos por prospecto

| Tipo de enriquecimiento | Creditos x prospecto | Total 1,000 | Cabe en $149? |
|---|---|---|---|
| Solo email (1 provider) | 1 | 1,000 | SI |
| Email cascade (3 providers) | 1-3 | 1,000-3,000 | JUSTO |
| Email + LinkedIn + empresa + scoring | 4-6 | 4,000-6,000 | NO |
| Pipeline completo | 5-8 | 5,000-8,000 | NO |

### Plan de accion (Opcion A: empezar con base, escalar con datos)

1. **Batch 1 (200 prospectos):** Correr cascada completa y medir creditos consumidos
2. **Evaluar:** Si cada prospecto consume <= 2 creditos → los 2,000 alcanzan para 1,000
3. **Si consume > 2 creditos:** Notificar a Daniel INMEDIATAMENTE para upgrade a Pro
4. **Upgrade rapido:** Daniel aprueba el mismo dia (es DG, no necesita escalacion)
5. **Continuar batches 2-5** con el plan adecuado

### Ventajas de esta estrategia
- No gasta $495/mes por adelantado sin datos
- El primer batch de 200 da metricas reales de consumo
- Si alcanza con Base, se ahorra $346/mes
- Si no alcanza, el upgrade es inmediato (mismo dia)

**Gabriel: registra en un spreadsheet los creditos consumidos por batch.** Columnas: batch_num, prospectos, creditos_inicio, creditos_fin, creditos_por_prospecto.

## Costo
| Item | Costo |
|------|-------|
| Clay (plan actual Base) | $149/mes |
| Clay upgrade a Pro (si necesario) | +$346/mes |
| SmartScout | Ya contratado ($97/mes) |
| Apify | Ya contratado ($49/mes) |

## Notas para Gabriel
- La cascada es el CORAZÓN del sistema de prospección. Tómate el tiempo necesario para que funcione bien.
- Si un proveedor de email (Prospeo, Findymail) no está en Clay nativo, usa la integración HTTP/API de Clay.
- Guarda la lógica de la cascada como template en Clay — se reutilizará para escalar a 2,500+ en Mes 2.
- Los criterios de ICP vienen de T04 (Eugenia). Si no los tienes para las 10 AM del miércoles, usa estos temporales:
  - B2B: E-commerce/Amazon sellers, >$1M revenue, US/LATAM, sin video profesional
  - Ajustar cuando lleguen los criterios reales
- **Medir creditos en el primer batch de 200** — esta metrica decide si se necesita upgrade

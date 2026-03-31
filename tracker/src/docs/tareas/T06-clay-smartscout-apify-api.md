# T06 — Detalle API SmartScout

## Bloqueante: Acceso al API requiere demo de ventas

El plan actual de SmartScout Pro ($97/mes) **NO incluye acceso al API**. La documentacion del API existe en `api.smartscout.com` pero para habilitarla es necesario:

1. Solicitar una demo de ventas a SmartScout
2. Contratar un plan con API habilitada (precio por confirmar)
3. Obtener el `X-Api-Key`

**Accion recomendada:** Escribir a SmartScout solicitando acceso al API con los endpoints especificos que necesitamos (listados abajo). Esto permite negociar solo lo que se usara.

---

## Endpoints necesarios para el ICP de La Neta

Basado en el analisis del Swagger (`api.smartscout.com/swagger/api/swagger.json`), estos son los endpoints que cubren el flujo de prospeccion:

### Endpoint 1: Buscar marcas por categoria + ingresos

```
POST /api/v2/brands/search
Header: X-Api-Key: {api_key}
Query: marketplace=US

Body:
{
  "categoryName": { "filter": "Beauty & Personal Care", "type": "contains" },
  "monthlyRevenue": { "min": 41666 },
  "sponsoredVideoWinRate": { "min": 0, "max": 0 },
  "totalProducts": { "min": 3 }
}
```

**Que filtra:**
- `categoryName` — Categoria de Amazon (ej. Beauty, Health, Electronics)
- `monthlyRevenue.min: 41666` — Equivale a ~$500K/ano
- `sponsoredVideoWinRate: 0` — Marcas que NO pagan Sponsored Video ads
- `totalProducts.min: 3` — Marcas con al menos 3 productos (no vendedores triviales)

**Que retorna (modelo `Brand`):**

| Campo | Tipo | Uso para La Neta |
|---|---|---|
| `brandName` | string | Nombre de la marca prospecto |
| `monthlyRevenue` | double | Ingreso mensual estimado |
| `categoryName` | string | Categoria principal |
| `subcategoryName` | string | Subcategoria |
| `totalProducts` | int | Cantidad de ASINs |
| `hasStorefront` | bool | Si tiene Amazon Storefront |
| `storefrontUrl` | string | URL del storefront |
| `brandScore` | double | Score de fortaleza de marca |
| `monthGrowth` | double | Crecimiento mes a mes |
| `trailing12Months` | double | Revenue trailing 12 meses |
| `avgPrice` | double | Precio promedio |
| `totalReviews` | int | Total reviews |

**Limitacion importante:** `sponsoredVideoWinRate = 0` detecta marcas sin video ADS pagados, NO marcas sin video organico en sus listings. Es un proxy razonable (~70% de precision) pero no exacto.

---

### Endpoint 2: Obtener ASINs top de cada marca

```
POST /api/v1/products/search
Header: X-Api-Key: {api_key}
Query: marketplace=US&sort[by]=monthlyRevenueEstimate&sort[order]=desc&page[size]=10

Body:
{
  "brandName": { "filter": "NOMBRE_MARCA", "type": "equals" }
}
```

**Que retorna (modelo `Product`):**

| Campo | Tipo | Uso para La Neta |
|---|---|---|
| `asin` | string | ASIN del producto |
| `title` | string | Titulo del listing |
| `monthlyRevenueEstimate` | double | Revenue mensual estimado |
| `rank` | int | Ranking en categoria |
| `buyBoxPrice` | double | Precio actual |
| `productPageScore` | double | Score de calidad del listing |
| `imageCount` | int | Numero de imagenes (si es bajo, oportunidad de contenido) |
| `reviewCount` | int | Cantidad de reviews |
| `reviewRating` | double | Rating promedio |
| `listedSince` | datetime | Fecha de publicacion |

---

### Endpoint 3: Ad Spy — actividad publicitaria de la marca

```
GET /api/v2/brands/ad-spy
Header: X-Api-Key: {api_key}
Query: brandName=NOMBRE_MARCA&marketplace=US
```

**Que retorna (modelo `BrandSearchTerm`):**

| Campo | Tipo | Uso para La Neta |
|---|---|---|
| `sponsoredVideoWinRate` | double | % de veces que gana slot de video ad |
| `sponsoredVideoSpend` | double | Gasto en video ads |
| `sponsoredBrandWinRate` | double | % de veces que gana Sponsored Brand |
| `totalAdSpend` | double | Gasto total en ads |
| `searchTermValue` | string | Termino de busqueda donde aparece |
| `estimateSearches` | int | Volumen de busquedas del termino |

**Uso:** Confirmar que la marca realmente NO invierte en video ads. Si `sponsoredVideoSpend = 0` y `totalAdSpend > 0`, significa que SI pautan pero NO en video — candidato ideal.

---

### Endpoint 4: Market share y competidores

```
GET /api/v2/brands/market-share
Header: X-Api-Key: {api_key}
Query: brandName=NOMBRE_MARCA&marketplace=US
```

**Que retorna (modelo `SubcategoryBrand`):**

| Campo | Tipo | Uso para La Neta |
|---|---|---|
| `marketshare` | double | % de market share en subcategoria |
| `moMMktShareChange` | double | Cambio de market share mes a mes |
| `moMMonthlyRevChange` | double | Cambio en revenue mes a mes |
| `revenue` | double | Revenue en esa subcategoria |
| `adSpendShare` | double | % del gasto publicitario en la subcategoria |

**Uso:** Para la auditoría — mostrar al prospecto cuanto market share esta perdiendo vs competidores que SI tienen video.

---

### Endpoint 5: Estimacion de ventas por ranking

```
GET /api/v1/sales/estimate
Header: X-Api-Key: {api_key}
Query: categoryNode=CATEGORY_ID&salesRank=RANK&marketplace=US
```

**Que retorna:** `SalesEstimate` — ventas unitarias estimadas para un ranking dado.

**Uso:** Calcular "si tu ranking mejorara de #X a #Y con video, vendrias Z unidades mas/mes = $W mas en revenue". Esto alimenta el calculo de perdida de ingresos en la auditoria de Sendspark.

---

## Flujo automatizado completo con API

```
Paso 1: POST /api/v2/brands/search
  Input:  categoria + monthlyRevenue > $41,666 + sponsoredVideoWinRate = 0
  Output: Lista de ~200-500 marcas
         ↓
Paso 2: POST /api/v1/products/search (por cada marca)
  Input:  brandName
  Output: Top 10 ASINs + productPageScore + imageCount
         ↓
Paso 3: GET /api/v2/brands/ad-spy (por cada marca)
  Input:  brandName
  Output: Confirmar $0 en video spend + total ad spend
         ↓
Paso 4: GET /api/v2/brands/market-share (por cada marca)
  Input:  brandName
  Output: marketshare + cambio MoM (para la auditoria)
         ↓
Paso 5: Exportar CSV → Importar a Clay
  Campos: brand_name, monthly_revenue, category, top_asins,
          product_page_score, video_spend, total_ad_spend,
          market_share, storefront_url
         ↓
Paso 6: Clay enriquece con email + LinkedIn (cascada normal)
```

### Ventajas vs proceso manual

| Aspecto | Manual (UI SmartScout) | Via API |
|---|---|---|
| Filtrar marcas sin video | Visual, pagina por pagina | Automatico: `sponsoredVideoWinRate = 0` |
| Exportar >1,000 marcas | Limitado por UI (paginacion manual) | Paginado automatico `page[size]` |
| Datos de ad spend | No disponible en export CSV basico | Incluido via `/brands/ad-spy` |
| Market share por marca | Requiere buscar marca por marca | Batch automatizable |
| Frecuencia | Una vez (manual) | Repetible: cronjob semanal |
| Integracion con Clay | CSV manual | API → Clay HTTP integration directa |

### Lo que la API NO cubre (se mantiene manual)

- **Video organico en listings:** La API no tiene campo "tiene video en imagenes del producto". Solo detecta video ADS pagados.
- **Verificacion visual de calidad:** Revisar si el listing tiene video de baja calidad requiere inspeccion humana o scraping con Apify.
- **Datos de contacto:** SmartScout no provee emails ni contactos — eso lo resuelve Clay con su cascada de enriquecimiento.

---

## Template para solicitar acceso al API

Asunto: **API Access Request — SmartScout Pro**

```
Hi SmartScout team,

We're currently on the Pro plan ($97/mo) and would like to enable API access
for our account.

Our use case: We're building an automated prospecting pipeline that identifies
Amazon brands lacking video ad creative. We need programmatic access to:

1. POST /api/v2/brands/search (brand filtering by category + revenue + video win rate)
2. POST /api/v1/products/search (top ASINs per brand)
3. GET /api/v2/brands/ad-spy (advertising spend data)
4. GET /api/v2/brands/market-share (competitive positioning)
5. GET /api/v1/sales/estimate (revenue estimation)

Expected volume: ~2,000-5,000 API calls/month.

Could you share pricing for API access and schedule a quick demo?

Best regards,
[Nombre]
La Neta
```

---

## Cobertura del API vs necesidades del plan

| Necesidad | Cobertura API | Nota |
|---|---|---|
| Buscar marcas por categoria + ingresos | 100% | `monthlyRevenue` filter |
| Filtrar "sin video" | ~70% | Solo video ads pagados, no organico |
| Datos de ASINs top | 100% | `products/search` con sort por revenue |
| Actividad publicitaria | 100% | `brands/ad-spy` endpoint |
| Competidores + market share | 100% | `brands/market-share` endpoint |
| Cuantificar perdida de ingresos | 80% | `sales/estimate` + benchmarks, calculo propio |
| Datos de contacto (email, decisor) | 0% | Lo cubre Clay, no SmartScout |

**Score general: la API cubre ~80% de lo que T06 necesita de SmartScout.**

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

### Paso 2: Configurar SmartScout → Clay
1. Login SmartScout
2. Exportar vendedores Amazon que coincidan con ICP B2B (criterios de T04):
   - Filtros: categoría, revenue estimado, presencia de video (o falta de), geografía
3. Exportar lista CSV
4. Importar a Clay como tabla fuente

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
  → SmartScout data: ¿tiene video en listings? ¿calidad?
  → Resultado: video_gap_score (1-10)
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

## Costo
| Item | Costo |
|------|-------|
| Clay upgrade (si necesario) | +$346/mes (base → pro) |
| SmartScout | Ya contratado ($97/mes) |
| Apify | Ya contratado ($49/mes) |

## Notas para Gabriel
- La cascada es el CORAZÓN del sistema de prospección. Tómate el tiempo necesario para que funcione bien.
- Si un proveedor de email (Prospeo, Findymail) no está en Clay nativo, usa la integración HTTP/API de Clay.
- Guarda la lógica de la cascada como template en Clay — se reutilizará para escalar a 2,500+ en Mes 2.
- Los criterios de ICP vienen de T04 (Eugenia). Si no los tienes para las 10 AM del miércoles, usa estos temporales:
  - B2B: E-commerce/Amazon sellers, >$1M revenue, US/LATAM, sin video profesional
  - Ajustar cuando lleguen los criterios reales

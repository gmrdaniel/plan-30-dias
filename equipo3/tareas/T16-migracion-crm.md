# T16 — Migración a CRM propio (Mes 2)

> **Objetivo:** Reemplazar Unbounce con landing pages dinámicas 100% propias en el CRM Laneta
> **Cuándo:** Mes 2 (Mayo 2026), después de validar con Unbounce
> **Responsable:** Gabriel (backend + Edge Functions) + Lillian (frontend React)
> **Ahorro:** $99/mes (cancelar Unbounce)

---

## Por qué migrar

| Aspecto | Unbounce (Sprint) | CRM propio (Mes 2) |
|---|---|---|
| Texto dinámico | Si (DTR por URL params) | Si (100% control) |
| Imágenes dinámicas | No | **Si** (logos, screenshots, fotos creador) |
| Secciones condicionales | No | **Si** (mostrar/ocultar según datos) |
| Video personalizado | Embed estático | **Embed dinámico** (Sendspark por prospecto) |
| Datos del CRM | Via URL params (limitado) | **Consulta directa** a client_inventory |
| Costo | $99/mes | $0 (Supabase ya pagado) |
| Editor visual | Si (drag & drop) | No (código React) |
| A/B testing | Nativo | Manual (por URL param) |

**Resumen:** Unbounce sirve para lanzar rápido en el sprint. El CRM propio da más poder, más personalización y cuesta $0.

---

## Arquitectura: Landing pages en el CRM

### 3 plantillas React, datos dinámicos del CRM

```
┌──────────────────────────────────────────────┐
│  CRM Laneta (React + Supabase)               │
│                                               │
│  /landing/b2b/:slug                           │
│    → Consulta client_inventory por slug       │
│    → Renderiza plantilla B2B con datos        │
│    → Embed Sendspark + Outgrow + Calendly     │
│                                               │
│  /landing/linguana/:handle                    │
│    → Consulta creator_inventory por handle    │
│    → Renderiza plantilla Linguana con datos   │
│    → Variante A o B por ?variant=a|b          │
│                                               │
│  /landing/meta/:handle                        │
│    → Consulta creator_inventory por handle    │
│    → Renderiza plantilla Meta con datos       │
│    → Variante A o B por ?variant=a|b          │
│                                               │
└──────────────────────────────────────────────┘
```

### URLs limpias (sin parámetros largos)

**Unbounce (sprint):**
```
landing.com/b2b?empresa=TechBrand+LLC&contacto=María+García&revenue=707000&competidor=CeraVe
```

**CRM propio (mes 2):**
```
landing.laneta.com/b2b/techbrand-llc
landing.laneta.com/linguana/juanperez
landing.laneta.com/meta/analopez
```

El slug o handle identifica al prospecto/creador. La página consulta **todos** los datos del CRM — no hay límite de campos.

---

## Qué gana cada sitio con la migración

### Sitio 1: B2B — The Ads Factory

**Con Unbounce:** Texto dinámico (empresa, revenue, competidor)

**Con CRM propio:**
- Todo lo de Unbounce +
- Logo de la empresa (scrapeado por Apify, guardado en client_inventory)
- Screenshots de sus listings de Amazon (del scraping)
- Datos reales de competidores de `client_competitors` (no solo 1, sino la tabla completa)
- Video Sendspark con URL dinámica por prospecto
- Gráfico de market share personalizado (datos de SmartScout)
- "Empresas similares a ti que ya trabajan con nosotros" (query al CRM)

### Sitios 2-5: Creadores Linguana/Meta

**Con Unbounce:** Texto dinámico (nombre, suscriptores, proyección)

**Con CRM propio:**
- Foto del creador (de `creator_social_profiles`)
- Métricas reales de su canal (followers, views, engagement de Social Blade)
- Gráfico: "Tu crecimiento actual vs con La Neta" (datos de `creator_inventory`)
- Testimonial de creadores similares (query por plataforma + idioma + rango de subs)
- Contrato pre-llenado con datos del creador
- Tracking de visita: saber si el creador vio la página y cuánto tiempo

---

## Plan de implementación

### Semana 1 Mes 2 (5-9 Mayo)

**Gabriel — Backend:**
1. Crear rutas públicas en el CRM:
   - `/landing/b2b/:slug` — busca en client_inventory por slug
   - `/landing/linguana/:handle` — busca en creator_inventory
   - `/landing/meta/:handle` — busca en creator_inventory
2. Edge Function o RPC que genera slug/handle únicos por prospecto
3. Tracking de visitas: log cuando alguien abre la landing
4. Form submission → `client_outreach_log` + `sync-to-hubspot`

**Lillian — Frontend:**
1. Crear componente `LandingB2B.tsx` basado en el wireframe de Unbounce
2. Crear componente `LandingCreators.tsx` con prop `product: 'linguana' | 'meta'` y `variant: 'a' | 'b'`
3. Responsive (mobile-first)
4. Integrar embeds: Outgrow, Sendspark, Calendly

### Semana 2 Mes 2 (12-16 Mayo)

**Gabriel:**
1. A/B testing: middleware que asigna variante y trackea conversión
2. Generar URLs masivas desde el CRM (script que genera landing URL por cada prospecto/creador)
3. Actualizar `push-to-smartlead` para incluir landing URL personalizada en el email

**Lillian:**
1. Iterar diseño con feedback de Dayana
2. Optimizar performance (lazy load imágenes, etc.)
3. QA en dispositivos móviles

### Semana 3 Mes 2 (19-21 Mayo)

1. Migrar tráfico de Unbounce → CRM (redirect 301)
2. Verificar que forms siguen llegando a HubSpot
3. Cancelar Unbounce ($99/mes ahorro)

---

## Estimación de esfuerzo

| Componente | Horas | Quién |
|---|---|---|
| Rutas públicas + queries | 4h | Gabriel |
| Slug/handle generator | 2h | Gabriel |
| Visit tracking | 2h | Gabriel |
| Form → outreach_log + HubSpot | 2h | Gabriel |
| LandingB2B.tsx | 6h | Lillian |
| LandingCreators.tsx (2 productos × 2 variantes) | 8h | Lillian |
| A/B testing middleware | 3h | Gabriel |
| URL generation script | 2h | Gabriel |
| QA + mobile | 3h | Lillian |
| Migración + redirect | 2h | Gabriel |
| **Total** | **~34h** | **2-3 semanas** |

---

## Decisión: cuándo migrar

| Señal | Acción |
|---|---|
| Sprint termina (8 Mayo) y Unbounce funcionó bien | Iniciar migración Semana 1 Mes 2 |
| A/B test en Unbounce dio ganador claro | Migrar solo la variante ganadora |
| Unbounce tiene problemas de DTR o performance | Acelerar migración |
| El equipo no tiene bandwidth | Mantener Unbounce otro mes |

**La migración no es urgente.** Unbounce funciona bien para el sprint. La migración se hace cuando hay tiempo y el ahorro de $99/mes lo justifica.

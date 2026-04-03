# T16 — Micrositios B2B + Creadores + Lead Magnets Outgrow

## Información General
| Campo | Valor |
|-------|-------|
| **ID** | T16 |
| **Prioridad** | 🔴 CRITICA |
| **Responsable** | Lillian Lucio (micrositios — reporta avance a Daniel), Eugenia García (calculadoras Outgrow) |
| **Co-ejecuta** | Dayana Vizcaya (Directora Creativa: assets visuales, copy, dirección de diseño) |
| **Apoyo** | Daniel (compra Landingi) |
| **Fecha Inicio** | Viernes 17 Abril |
| **Fecha Entrega** | Martes 21 Abril |
| **Bloqueada por** | T10 (Outgrow adquirido), B21 (definir micrositios con Mery) |
| **Bloquea a** | DTO-OUT-10 (→ Equipos 1+2 para aprobación) |

## Objetivo
5 micrositios dinámicos (1 B2B + 4 Creadores) y 2 herramientas interactivas (auditoría video + calculadora ingresos) activas y capturando leads a HubSpot. Todos los micrositios usan Dynamic Text Replacement (DTR) para personalizar contenido por prospecto/creador.

## Decisión: Landingi Professional ($69/mes)

**Unbounce y Leadpages descartadas.** Landingi Professional ($69/mes) cubre los 5 sitios con más funcionalidad y menor costo:

- **DTR nativo** para texto dinámico (igual que Unbounce)
- **Imágenes dinámicas** — puede cambiar logos, fotos del creador por URL (Unbounce no puede)
- **Smart Sections** — secciones condicionales por datos del visitante (Unbounce no puede)
- **Programmatic Landing Pages** — crear páginas programáticamente
- **API con CRUD** — el CRM Laneta puede crear/modificar páginas (Unbounce API es solo lectura)
- **Landing pages ilimitadas + conversiones ilimitadas**
- **50,000 visitas/mes + 10 dominios custom**
- **HubSpot nativo** + webhooks
- **Embeds** (Outgrow, Sendspark, Calendly) via Custom HTML — sin restricciones
- **Trial 14 días gratis**
- **Ahorro:** $30/mes vs Unbounce ($69 vs $99)

**Migración a CRM propio planeada para Mes 2** (ver tab "Migración CRM").

---

## Los 5 micrositios a crear

> **NOTA:** Los 5 micrositios son preliminares. Los nombres de productos, estructura y contenido están **por definir con el equipo de Mery (Equipo 2)**. Ver bloqueante B21.

| # | Sitio | Producto | Audiencia | URL ejemplo |
|---|---|---|---|---|
| 1 | B2B — The Ads Factory | Auditoría video Amazon | Marcas B2B | `landing.com/b2b?empresa=TechBrand&revenue=707000&contacto=María` |
| 2 | Creadores Plantilla A — Linguana | Doblaje + Expansión | Creadores YouTube/TikTok | `landing.com/linguana-a?nombre=Juan&subs=500000&idioma=Español` |
| 3 | Creadores Plantilla B — Linguana | Doblaje + Expansión | Creadores YouTube/TikTok | `landing.com/linguana-b?nombre=Juan&subs=500000&idioma=Español` |
| 4 | Creadores Plantilla A — Meta | Streaming 24/7 | Creadores YouTube/Twitch | `landing.com/meta-a?nombre=Ana&subs=200000&plataforma=YouTube` |
| 5 | Creadores Plantilla B — Meta | Streaming 24/7 | Creadores YouTube/Twitch | `landing.com/meta-b?nombre=Ana&subs=200000&plataforma=YouTube` |

Las plantillas A y B de cada producto sirven para A/B testing en Landingi.

---

## Lillian: Sitio 1 — B2B The Ads Factory (Vie 17 - Sáb 18 Abr)

### Wireframe
```
[Header] Logo La Neta + Nombre dinámico de la empresa
[Hero] "{{empresa}}, estás perdiendo $X en video" + CTA
[Sección 1] El problema: stats de la industria
[Sección 2] Video de auditoría Sendspark (embed dinámico)
[Sección 3] Comparación con competidores (datos de SmartScout)
[Sección 4] Calculadora ROI (embed Outgrow)
[CTA Final] "Agenda tu Sprint Estratégico de 15 minutos" → Calendly
[Footer] La Neta / Global Media Review
```

### DTR — Campos dinámicos (texto)

| Texto default en la página | Parámetro URL | Ejemplo |
|---|---|---|
| "Tu empresa" | `empresa` | TechBrand LLC |
| "Tu contacto" | `contacto` | María García |
| "$X" (revenue) | `revenue` | $707,000 |
| "Tu competidor" | `competidor` | CeraVe |
| "Tu categoría" | `categoria` | Health & Wellness |

### Imágenes dinámicas (ventaja Landingi)

| Imagen default | Parámetro URL | Ejemplo |
|---|---|---|
| Logo genérico | `logo_url` | URL del logo de la empresa (scrapeado por Apify) |
| Screenshot genérico | `listing_img` | Screenshot del listing de Amazon del prospecto |

### Embeds
- **Outgrow:** Calculadora ROI — embed via bloque HTML (`<iframe src="https://app.outgrow.co/calculadora-roi">`)
- **Sendspark:** Video personalizado — embed via bloque HTML
- **Calendly:** Agendamiento — embed o link directo

URL completa:
```
landing.com/b2b?empresa=TechBrand+LLC&contacto=María+García&revenue=707000&competidor=CeraVe&categoria=Health&logo_url=https://...
```

### Configuración técnica
1. Login Landingi (herramientas@laneta.com — Daniel compra Día 11)
2. Crear landing page desde template o custom
3. Configurar DTR en cada texto dinámico:
   - Click en texto → activar Dynamic Content → URL Parameter: `empresa`
4. Configurar imágenes dinámicas:
   - Click en imagen → Dynamic Content → URL Parameter: `logo_url`
5. Agregar bloques HTML para embeds (Outgrow, Sendspark, Calendly)
6. Form → HubSpot:
   - Integración nativa Landingi → HubSpot
   - Campos: email, nombre, empresa, teléfono
   - Pipeline: B2B Ventas, etapa: "Prospecto Nuevo"
7. Responsive: verificar desktop + tablet + mobile

### Entregable: Micrositio B2B live con DTR texto + imágenes, form → HubSpot, embeds funcionando

---

## Lillian: Sitios 2-3 — Creadores Linguana (Sáb 18 - Dom 19 Abr)

### Wireframe (ambas plantillas)
```
[Header] Logo Elevn / Linguana
[Hero] "{{nombre}}, tus {{suscriptores}} suscriptores podrían llegar a {{proyeccion}} con doblaje"
[Sección 1] Qué es Linguana: doblaje IA + expansión a nuevos idiomas
[Sección 2] Caso de éxito video (embed — placeholder)
[Sección 3] Calculadora de ingresos (embed Outgrow)
[Sección 4] "Únete a {{num_creadores}}+ creadores que ya expanden su audiencia"
[CTA] "Comienza tu expansión" → formulario
[Footer] Elevn / La Neta
```

### DTR — Campos dinámicos

| Texto default | Parámetro URL | Ejemplo |
|---|---|---|
| "Creador" | `nombre` | Juan Pérez |
| "tus suscriptores" | `subs` | 500,000 |
| "tu canal" | `canal` | @juanperez |
| "tu idioma" | `idioma` | Español |
| "X nuevos mercados" | `mercados` | 3 |
| "$X/mes proyectado" | `proyeccion` | $8,500 |

### Imágenes dinámicas

| Imagen default | Parámetro URL | Ejemplo |
|---|---|---|
| Foto genérica creador | `foto_url` | Foto de perfil del creador |
| Logo plataforma | `plataforma_logo` | Logo YouTube/TikTok según plataforma |

**Plantilla A:** Enfoque en datos y números (revenue, CPM, proyección)
**Plantilla B:** Enfoque en storytelling y testimoniales (casos de éxito, comunidad)

### Configuración
- Mismos pasos que Sitio 1 (DTR texto + imágenes + embeds)
- Form → HubSpot pipeline: Creadores Onboarding, etapa: "Lead"
- A/B test en Landingi: 50/50 tráfico entre plantilla A y B
- Embed Outgrow: calculadora de ingresos creadores

### Entregable: 2 micrositios Linguana live con DTR, A/B test activo

---

## Lillian: Sitios 4-5 — Creadores Meta (Dom 19 - Lun 20 Abr)

### Wireframe (ambas plantillas)
```
[Header] Logo Elevn / Meta Streaming
[Hero] "{{nombre}}, tu contenido podría generar {{proyeccion}}/mes en streaming 24/7"
[Sección 1] Qué es Meta Streaming: tu canal transmite 24/7 sin esfuerzo
[Sección 2] Demo/preview (embed video — placeholder)
[Sección 3] Calculadora de ingresos streaming (embed Outgrow)
[Sección 4] "{{subs}}+ suscriptores × 24h = ingresos que no estás capturando"
[CTA] "Activa tu streaming 24/7" → formulario
[Footer] Elevn / La Neta
```

### DTR — Campos dinámicos

| Texto default | Parámetro URL | Ejemplo |
|---|---|---|
| "Creador" | `nombre` | Ana López |
| "tus suscriptores" | `subs` | 200,000 |
| "tu canal" | `canal` | @analopez |
| "tu plataforma" | `plataforma` | YouTube |
| "$X/mes" | `proyeccion` | $3,200 |

**Plantilla A:** Enfoque en ingresos pasivos (streaming 24/7 = dinero mientras duermes)
**Plantilla B:** Enfoque en alcance y comunidad (llega a fans en otras zonas horarias)

### Configuración
- Mismos pasos técnicos
- Form → HubSpot pipeline: Creadores Onboarding
- A/B test 50/50
- Embed Outgrow: calculadora de ingresos streaming

### Entregable: 2 micrositios Meta live con DTR, A/B test activo

---

## Cómo el CRM genera las URLs personalizadas

El CRM Laneta genera la URL con DTR para cada prospecto/creador:

```
Para B2B (desde client_inventory + client_contacts):
  landing.com/b2b?empresa={name}&contacto={first_name}+{last_name}&revenue={estimated_budget_usd}&competidor={competitor_name}&categoria={industry}&logo_url={logo_url}

Para Creadores (desde creator_inventory):
  landing.com/linguana-a?nombre={display_name}&subs={subscribers}&canal={handle}&idioma={language}&proyeccion={projected_revenue}&foto_url={avatar_url}
```

Estas URLs se incluyen en:
- Emails de Smartlead (como link personalizado en la secuencia)
- DMs de ManyChat/Expandi
- Cualquier punto de contacto del pipeline

### Ventaja Landingi API (futuro)

Con la API CRUD de Landingi, el CRM también podría:
- Crear variaciones de páginas programáticamente
- Modificar contenido sin entrar al editor
- Generar landing pages por lote para cada prospecto

Esto no es necesario para el sprint (DTR por URL es suficiente) pero es una opción para escalar.

---

## Eugenia: Herramienta Auditoría Video B2B en Outgrow (Vie 17 - Lun 20 Abr)

### Especificación
- **Tipo:** Assessment/Calculator
- **Inputs del usuario:**
  1. URL de su listing de Amazon o sitio web
  2. Categoría de producto
  3. ¿Tiene video en sus listings? (Sí/No/Algunos)
  4. Presupuesto mensual de marketing
- **Outputs (calculados):**
  1. "Video Gap Score": 1-10 basado en respuestas
  2. "Revenue potencial con video optimizado": fórmula basada en categoría + presupuesto
  3. Recomendaciones (3 bullets)
  4. CTA: "Agenda tu auditoría completa gratuita"
- **Captura de lead:** Antes de mostrar resultados, pedir email + nombre + empresa
- **Integración:** Form submission → HubSpot vía webhook
- **Embed:** `<iframe>` en bloque HTML de Landingi

### Dónde buscar fórmulas:
- Los datos de benchmark por categoría están en el ICP B2B (T04)
- Si no hay datos específicos, usar: "empresas con video profesional ven 30-50% más conversiones" (dato de Amazon)

### Entregable: Auditoría activa en Outgrow, embed code generado para Lillian

---

## Eugenia: Calculadora Ingresos Creadores en Outgrow (Lun 20 - Mar 21 Abr)

### Especificación
- **Tipo:** Calculator
- **Inputs:**
  1. Plataforma (YouTube/TikTok/Instagram/Twitch)
  2. Número de suscriptores
  3. Vistas mensuales promedio
  4. Idioma principal del contenido
  5. ¿Ya hace streaming? (Sí/No)
  6. ¿Contenido disponible para doblaje? (Sí/No)
- **Outputs:**
  1. "Ingreso estimado actual": basado en CPM por plataforma
  2. "Ingreso potencial con La Neta": actual + streaming 24/7 + doblaje
  3. "Diferencia": cuánto más podría ganar
  4. Gráfico visual: actual vs potencial
- **Captura de lead:** email + nombre + handle de la plataforma
- **Integración:** → HubSpot
- **Embed:** `<iframe>` en bloque HTML de Landingi

### Fórmulas sugeridas:
- YouTube CPM español: ~$1.50-3.00
- YouTube CPM inglés: ~$4.00-8.00
- Streaming 24/7 uplift: +40-60% de ad revenue
- Doblaje (nuevo idioma): +80-150% de audiencia potencial

### Dónde buscar: ICP Creadores (T04) + datos de Social Blade

### Entregable: Calculadora activa en Outgrow, embed code generado para Lillian

---

## QA Final (Mar 21 Abr — todo el equipo)

- [ ] Sitio 1 B2B: DTR texto + imágenes funciona, responsive, form → HubSpot, embeds (Outgrow + Sendspark + Calendly)
- [ ] Sitio 2 Linguana A: DTR funciona, responsive, form → HubSpot, embed Outgrow
- [ ] Sitio 3 Linguana B: DTR funciona, A/B test activo con Sitio 2
- [ ] Sitio 4 Meta A: DTR funciona, responsive, form → HubSpot, embed Outgrow
- [ ] Sitio 5 Meta B: DTR funciona, A/B test activo con Sitio 4
- [ ] Auditoría video Outgrow: inputs → outputs correctos, captura leads
- [ ] Calculadora ingresos Outgrow: fórmulas correctas, captura leads
- [ ] Todos los embeds (Outgrow, Sendspark, Calendly) funcionan dentro de Landingi
- [ ] Probado en mobile (iOS y/o Android)
- [ ] URLs de prueba generadas desde el CRM con datos reales de las 10 empresas test

## Costo
| Item | Costo |
|------|-------|
| Landingi (Professional — cubre los 5 sitios) | $69/mes | herramientas@laneta.com |
| ~~Unbounce~~ | ~~$99/mes~~ | **DESCARTADA** — Landingi cubre todo con más features y menor costo |
| ~~Leadpages~~ | ~~$49/mes~~ | **DESCARTADA** — sin DTR nativo |
| Outgrow | Ya comprado ($22/mes) | herramientas@laneta.com |

---

## Por qué Landingi y no Unbounce o Instapage — Comparativa para Lillian

Se evaluaron 3 plataformas para los 5 micrositios dinámicos. Landingi ganó en precio, funcionalidad y flexibilidad:

### Precios

- **Landingi Professional:** $69/mes (trial 14 días gratis)
- **Unbounce Build:** $99/mes (anual: $74/mes)
- **Instapage Optimize:** $159/mes (anual: $119/mes)

### Funcionalidades clave

| Feature | Landingi $69 | Unbounce $99 | Instapage $159 |
|---|---|---|---|
| Landing pages | Ilimitadas | Ilimitadas | Ilimitadas |
| Visitas/mes | 50,000 | — | Ilimitadas |
| Conversiones/mes | Ilimitadas | 1,000 | Ilimitadas |
| Dominios custom | 10 | 1 | — |
| DTR texto dinámico | **Si** | **Si** | **Si** |
| Imágenes dinámicas por URL | **Si** | No | No |
| Secciones condicionales | **Si** (Smart Sections) | No | **Si** |
| API para crear/modificar páginas | **Si (CRUD)** | No (solo lectura) | No |
| A/B testing | Si | Si | Si |
| HubSpot nativo | Si | Si | Si |
| Webhooks | Si | Si | Si |
| Embed custom HTML (Outgrow, Sendspark, Calendly) | Si | Si | Si |
| Personalización por audiencia/firmographics | No | No | **Si** |
| AI copy variations | No | No | **Si** |

### Por qué Landingi

1. **$30/mes más barato** que Unbounce con más funcionalidad
2. **Imágenes dinámicas** — podemos cambiar logos y fotos del creador por URL parameter. Unbounce solo cambia texto.
3. **Smart Sections** — podemos mostrar/ocultar secciones según datos del visitante. Unbounce no puede.
4. **Programmatic Landing Pages** — crear páginas programáticamente desde el CRM via API.
5. **API con CRUD** — el CRM Laneta puede crear y modificar páginas. Unbounce e Instapage solo permiten leer datos.
6. **Conversiones ilimitadas** vs 1,000 de Unbounce.
7. **10 dominios custom** vs 1 de Unbounce.
8. **50,000 visitas/mes** — suficiente para el sprint.
9. **Trial 14 días gratis** — podemos probar antes de comprometernos.
6. **Embeds** — Outgrow, Sendspark y Calendly funcionan igual en las 3 plataformas via Custom HTML/iframe.

### Qué NO tiene Landingi vs competidores

- **vs Unbounce:** Editor visual ligeramente menos pulido (pero funcional)
- **vs Instapage:** Sin personalización por audiencia/firmographics ni AI copy (features de $159/mes que no necesitamos para el sprint)

### Conclusión

Landingi cubre todo lo que necesitamos para los 5 sitios dinámicos a $30/mes menos que Unbounce, con más features. Las features extra de Instapage ($159/mes) son overkill para el sprint. Si en Mes 2 migramos al CRM propio, Landingi es aún mejor puente porque su API CRUD facilita la transición.

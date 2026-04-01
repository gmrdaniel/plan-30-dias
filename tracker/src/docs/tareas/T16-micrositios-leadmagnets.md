# T16 — Micrositios B2B + Creadores + Lead Magnets Outgrow

## Informacion General
| Campo | Valor |
|-------|-------|
| **ID** | T16 |
| **Prioridad** | 🔴 CRITICA |
| **Responsable** | Lillian Lucio (micrositios — reporta avance a Daniel), Eugenia Garcia (calculadoras Outgrow) |
| **Co-ejecuta** | Dayana Vizcaya (Directora Creativa: assets visuales, copy, direccion de diseno) |
| **Apoyo** | Daniel (compra Unbounce), Gabriel (middleware webhook → HubSpot API) |
| **Fecha Inicio** | Viernes 17 Abril |
| **Fecha Entrega** | Martes 21 Abril |
| **Bloqueada por** | T10 (Outgrow adquirido), T02 (HubSpot con API key y propiedades custom) |
| **Bloquea a** | DTO-OUT-10 (→ Equipos 1+2 para aprobacion) |

## Objetivo
2 micrositios personalizados (B2B + Creadores) en **Unbounce** y 2 herramientas interactivas (auditoria video + calculadora ingresos) en **Outgrow**, todas conectadas a HubSpot via webhook directo.

---

## Por que Unbounce para ambos micrositios (no Leadpages)

Basado en el analisis tecnico y considerando que Lillian tiene perfil no tecnico:

1. **Paginas ilimitadas desde plan base ($99).** Leadpages Standard ($49) limita a 5 paginas. Para tener ilimitadas en Leadpages hay que subir a un plan que no tiene precio publico.

2. **DTR nativo y visual.** Unbounce tiene Dynamic Text Replacement integrado: seleccionas texto en el editor, le asignas un parametro de URL, listo. Leadpages requiere JavaScript custom para lo mismo.

3. **Integracion HubSpot one-click.** Unbounce conecta con HubSpot CRM directo (mapeas campos del form a propiedades de contacto, incluyendo hidden fields). Leadpages Standard NO tiene integracion nativa con HubSpot.

4. **Webhooks nativos.** Unbounce puede enviar form data como JSON a cualquier endpoint. Leadpages no tiene webhooks — solo Zapier.

5. **Ahorro:** Unbounce $99/mes reemplaza Unbounce $99 + Leadpages $49 = **ahorro de $49/mes**.

---

## REQUISITOS PREVIOS (antes de que Lillian empiece)

### En HubSpot (Daniel — T02 Paso 7-8):
- [ ] API key generada con scopes: `crm.objects.contacts.write`, `crm.objects.contacts.read`
- [ ] Propiedades custom creadas:
  - `utm_source` (text)
  - `utm_campaign` (text)
  - `landing_page` (dropdown: B2B, Creadores)
  - `video_gap_score_outgrow` (number)
  - `revenue_potential` (number)
  - `creator_income_estimate` (number)
  - `social_handle` (text)
  - `micrositio_url` (text) — URL personalizada generada por Clay

### En Clay (Gabriel — T06/T11):
- [ ] Columna `micrositio_url` en la tabla de enriquecimiento que genere el URL con params:
  ```
  https://laneta-b2b.unbounce.com?empresa={empresa}&nombre={nombre}&revenue={revenue}&competidor={competidor}&rank_change={rank_change}&video_audit={sendspark_url}
  ```
- [ ] Columna equivalente para creadores:
  ```
  https://laneta-creadores.unbounce.com?nombre={nombre}&suscriptores={subs}&plataforma={platform}&proyeccion={income_estimate}
  ```

### Middleware webhook (Gabriel — antes de T16):
- [ ] Edge Function en Supabase que reciba JSON de Unbounce/Outgrow y haga POST a HubSpot API
- Unbounce envia valores en arrays (`"email": ["test@test.com"]`) — el middleware los desempaca
- Outgrow envia JSON plano — el middleware mapea campos a propiedades de HubSpot
- Endpoint: `https://nvbanvwibmghxroybjxp.supabase.co/functions/v1/webhook-to-hubspot`

---

## Lillian: Micrositio B2B en Unbounce (Vie 17 - Lun 20 Abr)

### Wireframe
```
[Header] Logo La Neta + Nombre dinamico de la empresa
[Hero] "{{empresa}}, estas perdiendo ${{revenue_perdido}} en video" + CTA
[Seccion 1] El problema: stats de la industria
[Seccion 2] Video de auditoria Sendspark (embed con URL dinamica)
[Seccion 3] Comparacion con competidores (datos pre-calculados en URL)
[Seccion 4] Calculadora ROI (embed Outgrow)
[CTA Final] "Agenda tu Sprint Estrategico de 15 minutos" → Calendly
[Footer] La Neta / Global Media Review
```

### Configuracion paso a paso

**1. Crear cuenta Unbounce (Daniel compra Plan Build $99/mes)**
- Ir a unbounce.com → Sign up → Plan Build
- Email: herramientas@laneta.com

**2. Crear landing page B2B**
- New Page → elegir template o empezar en blanco
- Nombre: "Micrositio B2B - Sprint Abril"
- Dominio: usar subdominio de Unbounce (laneta-b2b.unbounce.com) o dominio custom

**3. Configurar Dynamic Text Replacement (DTR)**

Para cada texto dinamico en la pagina:
1. Seleccionar el texto en el editor (ej. "Acme Inc")
2. Click en **Properties → Action → Dynamic Text**
3. Configurar:

| Texto default (lo que ve Google/trafico directo) | URL Parameter | Ejemplo |
|---|---|---|
| "Tu empresa" | `empresa` | ?empresa=Acme+Inc |
| "Juan" | `nombre` | &nombre=Juan |
| "$50,000" | `revenue` | &revenue=50000 |
| "CompetidorX" | `competidor` | &competidor=BrandX |
| "8 posiciones" | `rank_change` | &rank_change=8 |

**4. Configurar Hidden Fields en el formulario**

En el formulario de contacto, agregar campos ocultos:
1. Click en formulario → Add Field → Hidden Field
2. Crear estos hidden fields (el ID debe coincidir EXACTO con el URL param, case-sensitive):

| Hidden Field ID | URL Parameter | Para que |
|---|---|---|
| `empresa` | `empresa` | Se captura al enviar form |
| `revenue` | `revenue` | Revenue del prospecto |
| `utm_source` | `utm_source` | Fuente de trafico |
| `utm_campaign` | `utm_campaign` | Campana |
| `landing_page` | — | Valor fijo: "B2B" |

**5. Configurar webhook → HubSpot**

En el form:
1. Click en **Form Confirmation → Integrations → Webhook**
2. URL: `https://nvbanvwibmghxroybjxp.supabase.co/functions/v1/webhook-to-hubspot`
3. Content type: JSON
4. **Nota:** El webhook de Unbounce envia valores como arrays. El middleware de Gabriel los reshape antes de enviar a HubSpot.

**Alternativa sin middleware:** Usar la integracion nativa de Unbounce con HubSpot:
1. Form → Integrations → HubSpot
2. Conectar cuenta HubSpot
3. Mapear campos del form a propiedades de contacto de HubSpot
4. Incluir hidden fields en el mapeo

> **Para Lillian:** Si la integracion nativa con HubSpot funciona (probar primero), usarla. Es mas simple que el webhook. Solo si falla o no mapea los hidden fields, usar el webhook.

**6. Embeds**
- Video Sendspark: usar `<iframe>` con URL que incluye params del prospecto. El URL viene pre-armado en el param `video_audit` de la URL.
  ```html
  <!-- El src se personaliza con DTR o con JavaScript simple -->
  <iframe src="https://www.sendspark.com/share/VIDEO_ID" width="100%" height="400"></iframe>
  ```
  > **Nota:** DTR solo reemplaza texto, no atributos de iframe. Para el video dinamico, Lillian puede usar un boton/link en vez de embed: "Ver tu auditoria personalizada →" con href dinamico.

- Calculadora Outgrow: embed code que Eugenia genera (ver seccion Outgrow abajo)

**7. Responsive**
- Unbounce tiene preview mobile integrado en el editor
- Verificar que el texto DTR no desborde en pantallas chicas
- Verificar que embeds se redimensionan

### Entregable: Micrositio B2B live en Unbounce con DTR funcionando

---

## Lillian: Micrositio Creadores en Unbounce (Lun 20 - Mar 21 Abr)

### Estructura
```
[Header] Logo Elevn/La Neta
[Hero] "{{nombre}}, tus {{suscriptores}} suscriptores podrian generarte ${{proyeccion}}/mes"
[Seccion 1] Servicios: Streaming 24/7, Doblaje, Expansion
[Seccion 2] Testimonial video (embed - placeholder)
[Seccion 3] Calculadora de ingresos (embed Outgrow)
[Seccion 4] "Unete a {{num_creadores}}+ creadores que ya ganan mas"
[CTA] "Firma tu contrato ahora" → DocuSign o formulario
[Footer] Elevn / La Neta
```

### Configuracion
1. **Misma cuenta Unbounce** (paginas ilimitadas en plan Build)
2. Crear nueva landing page: "Micrositio Creadores - Sprint Abril"
3. **DTR:** misma mecanica que B2B

| Texto default | URL Parameter | Ejemplo |
|---|---|---|
| "Creador" | `nombre` | ?nombre=Maria |
| "10,000" | `suscriptores` | &suscriptores=50000 |
| "$2,500" | `proyeccion` | &proyeccion=4200 |
| "YouTube" | `plataforma` | &plataforma=YouTube |

4. **Hidden fields:** `nombre`, `suscriptores`, `plataforma`, `utm_source`, con `landing_page` fijo = "Creadores"
5. **Webhook/integracion:** igual que B2B (probar nativa HubSpot primero)
6. **Embed calculadora Outgrow** (Eugenia genera el code)
7. **Responsive check**

### Entregable: Micrositio Creadores live en Unbounce

---

## Eugenia: Herramienta Auditoria Video B2B en Outgrow (Vie 17 - Lun 20 Abr)

### Especificacion
- **Tipo:** Assessment/Calculator
- **Inputs del usuario:**
  1. URL de su listing de Amazon o sitio web
  2. Categoria de producto
  3. Tiene video en sus listings? (Si/No/Algunos)
  4. Presupuesto mensual de marketing
- **Pre-fill desde URL:** Si el prospecto llega desde el micrositio con `?email=x&empresa=y`, Outgrow pre-llena esos campos para reducir friccion.
  - Configurar en: Configure → Integrations → Outgoing Data → activar keys `email` y `empresa`
- **Outputs (calculados):**
  1. "Video Gap Score": 1-10 basado en respuestas
  2. "Revenue potencial con video optimizado": formula basada en categoria + presupuesto
  3. Recomendaciones (3 bullets)
  4. CTA: "Agenda tu auditoria completa gratuita"
- **Captura de lead:** Antes de mostrar resultados, pedir email + nombre + empresa
- **Integracion → HubSpot:**
  - **Opcion A (simple):** Integracion nativa Outgrow → HubSpot. Mapear campos en Configure → Integrations → HubSpot. Con plan Essentials ($22/mes) solo llegan lead form fields (email, nombre, empresa).
  - **Opcion B (completa):** Webhook de Outgrow → middleware Gabriel → HubSpot API. El webhook SI envia los resultados calculados (video_gap_score, revenue_potential) en todos los planes. Configurar en: Configure → Integrations → Webhooks → URL del middleware.
  - **Recomendacion:** Usar **ambos** — nativa para el contacto, webhook para los scores.

### Donde buscar formulas:
- Los datos de benchmark por categoria estan en el ICP B2B (T04)
- Si no hay datos especificos, usar: "empresas con video profesional ven 30-50% mas conversiones" (dato de Amazon)

### Entregable: Auditoria activa en Outgrow, embed code generado para Lillian

---

## Eugenia: Calculadora Ingresos Creadores en Outgrow (Lun 20 - Mar 21 Abr)

### Especificacion
- **Tipo:** Calculator
- **Inputs:**
  1. Plataforma (YouTube/TikTok/Instagram/Twitch)
  2. Numero de suscriptores
  3. Vistas mensuales promedio
  4. Idioma principal del contenido
  5. Ya hace streaming? (Si/No)
  6. Contenido disponible para doblaje? (Si/No)
- **Pre-fill desde URL:** `?plataforma=YouTube&suscriptores=50000` pre-llena los primeros campos
- **Outputs:**
  1. "Ingreso estimado actual": basado en CPM por plataforma
  2. "Ingreso potencial con La Neta": actual + streaming 24/7 + doblaje
  3. "Diferencia": cuanto mas podria ganar
  4. Grafico visual: actual vs potencial
- **Captura de lead:** email + nombre + handle de la plataforma
  - Crear propiedad `social_handle` en HubSpot antes (Daniel, T02)
- **Integracion:** Nativa para contacto + webhook para resultados (misma logica que auditoria)

### Formulas sugeridas:
- YouTube CPM espanol: ~$1.50-3.00
- YouTube CPM ingles: ~$4.00-8.00
- Streaming 24/7 uplift: +40-60% de ad revenue
- Doblaje (nuevo idioma): +80-150% de audiencia potencial

### Donde buscar: ICP Creadores (T04) + datos de Social Blade

### Entregable: Calculadora activa en Outgrow, embed code generado para Lillian

---

## Flujo completo de datos: Clay → Micrositio → HubSpot

```
PROSPECTO B2B:
  Clay enriquece prospecto
    → Genera columna micrositio_url con todos los params
    → Push contacto a HubSpot (con micrositio_url como propiedad)
    → Smartlead usa micrositio_url en el email
      → Prospecto hace click → llega a Unbounce con params
        → DTR personaliza la pagina
        → Prospecto llena form / completa calculadora Outgrow
          → Datos van a HubSpot (integracion nativa o webhook)
            → Si icp_score >= 7: alerta Telegram via Relay.app

CREADOR:
  ManyChat cualifica creador en WhatsApp
    → Datos van a HubSpot
    → Secuencia incluye link al micrositio con params
      → Creador llega a Unbounce → ve proyeccion personalizada
        → Completa calculadora Outgrow
          → Datos van a HubSpot
```

---

## QA Final (Mar 21 Abr — todo el equipo)

- [ ] Micrositio B2B: DTR funciona con URL de prueba, responsive, datos llegan a HubSpot
- [ ] Micrositio Creadores: DTR funciona, responsive, datos llegan a HubSpot
- [ ] Auditoria video Outgrow: inputs → outputs correctos, captura leads, webhook envia scores
- [ ] Calculadora ingresos Outgrow: formulas correctas, captura leads, webhook envia resultados
- [ ] Todos los embeds de Outgrow funcionan dentro de los micrositios Unbounce
- [ ] Probado en mobile (iOS y/o Android)
- [ ] Hidden fields capturan params del URL correctamente
- [ ] Integracion nativa HubSpot O webhook funcionan (al menos uno)

## Costo
| Item | Costo | Nota |
|------|-------|------|
| Unbounce (Plan Build) | $99/mes | Ambos micrositios (B2B + Creadores) |
| ~~Leadpages~~ | ~~$49/mes~~ | Eliminado — Unbounce cubre ambos |
| Outgrow | Ya comprado ($22/mes) | Webhook para enviar resultados completos |
| Zapier | Free (solo si se necesita) | Solo como backup si integracion nativa falla |
| **Total** | **$99/mes** (antes $148) | **Ahorro: $49/mes** |

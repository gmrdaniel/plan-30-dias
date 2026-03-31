# T16 — Micrositios B2B + Creadores + Lead Magnets Outgrow

## Información General
| Campo | Valor |
|-------|-------|
| **ID** | T16 |
| **Prioridad** | 🔴 CRITICA |
| **Responsable** | Lillian Lucio (micrositios — reporta avance a Daniel), Eugenia García (calculadoras Outgrow) |
| **Co-ejecuta** | Dayana Vizcaya (Directora Creativa: assets visuales, copy, dirección de diseño) |
| **Apoyo** | Daniel (compra Unbounce + Leadpages) |
| **Fecha Inicio** | Viernes 17 Abril |
| **Fecha Entrega** | Martes 21 Abril |
| **Bloqueada por** | T10 (Outgrow adquirido) |
| **Bloquea a** | DTO-OUT-10 (→ Equipos 1+2 para aprobación) |

## Objetivo
2 micrositios personalizados (B2B + Creadores) y 2 herramientas interactivas (auditoría video + calculadora ingresos) activas y capturando leads a HubSpot.

---

## Lillian: Micrositio B2B en Unbounce (Vie 17 - Lun 20 Abr)

### Wireframe (ya preparado en Días 1-4)
Estructura de la página:
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

### Configuración técnica
1. Login Unbounce (Daniel compra $99/mes el Día 11)
2. Crear landing page desde template o custom
3. **Dynamic Text Replacement (DTR):**
   - URL: micrositio.com?empresa=Acme&nombre=Juan&revenue=500000
   - El texto se reemplaza dinámicamente con los datos del prospecto
   - Campos: `{{empresa}}`, `{{nombre}}`, `{{dato_competidor}}`, `{{revenue}}`
4. **Embeds:**
   - Video Sendspark (placeholder hasta que Eq4 grabe el video)
   - Calculadora Outgrow (Eugenia la construye, Lillian la embebe)
5. **Form → HubSpot:**
   - Formulario de contacto conectado a HubSpot vía webhook o integración nativa
6. **Responsive:** Verificar que funciona en desktop + tablet + mobile

### Entregable: Micrositio B2B live en Unbounce con DTR funcionando

---

## Lillian: Micrositio Creadores en Leadpages (Lun 20 - Mar 21 Abr)

### Estructura de la página:
```
[Header] Logo Elevn/La Neta
[Hero] "{{nombre}}, tus {{suscriptores}} suscriptores podrían generarte {{proyeccion}}/mes"
[Sección 1] Servicios: Streaming 24/7, Doblaje, Expansión
[Sección 2] Testimonial video (embed - placeholder)
[Sección 3] Calculadora de ingresos (embed Outgrow)
[Sección 4] "Únete a {{num_creadores}}+ creadores que ya ganan más"
[CTA] "Firma tu contrato ahora" → DocuSign o formulario
[Footer] Elevn / La Neta
```

### Configuración técnica
1. Login Leadpages (Daniel compra $49/mes)
2. Crear landing page
3. **Campos dinámicos:** similar a Unbounce pero con URL parameters de Leadpages
4. **Embed calculadora Outgrow**
5. **Form → HubSpot**
6. **Responsive**

### Entregable: Micrositio Creadores live en Leadpages

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

### Fórmulas sugeridas:
- YouTube CPM español: ~$1.50-3.00
- YouTube CPM inglés: ~$4.00-8.00
- Streaming 24/7 uplift: +40-60% de ad revenue
- Doblaje (nuevo idioma): +80-150% de audiencia potencial

### Dónde buscar: ICP Creadores (T04) + datos de Social Blade

### Entregable: Calculadora activa en Outgrow, embed code generado para Lillian

---

## QA Final (Mar 21 Abr — todo el equipo)

- [ ] Micrositio B2B: DTR funciona, responsive, form → HubSpot
- [ ] Micrositio Creadores: campos dinámicos, responsive, form → HubSpot
- [ ] Auditoría video Outgrow: inputs → outputs correctos, captura leads
- [ ] Calculadora ingresos Outgrow: fórmulas correctas, captura leads
- [ ] Todos los embeds funcionan dentro de los micrositios
- [ ] Probado en mobile (iOS y/o Android)

## Costo
| Item | Costo |
|------|-------|
| Unbounce | $99/mes |
| Leadpages | $49/mes |
| Outgrow | Ya comprado ($22/mes) |

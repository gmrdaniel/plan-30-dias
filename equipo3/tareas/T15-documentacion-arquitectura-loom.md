# T15 — Documentación de Arquitectura + Loom

## Información General
| Campo | Valor |
|-------|-------|
| **ID** | T15 |
| **Prioridad** | 🔴 CRITICA |
| **Responsable** | Daniel Ramírez |
| **Apoyo** | Dayana (visual), Lillian (diagramas) |
| **Fecha Inicio** | Jueves 16 Abril (después de T14) |
| **Fecha Entrega** | Viernes 17 Abril |
| **Bloqueada por** | T14 (testing E2E exitoso) |
| **Bloquea a** | DTO-OUT-09 (Equipo 4 necesita el Loom para saber dónde cargar assets) |

## Objetivo
Documentar toda la arquitectura técnica y grabar un Loom de 15 minutos para que el Equipo 4 (Contenido+Campañas) entienda el sistema y sepa dónde cargar sus activos.

## Detalle de Implementación

### Paso 1: Lillian — Diagrama de Arquitectura (Jue 16 Abr)
Crear en Figma un diagrama que muestre:

```
Pipeline B2B:
SmartScout ──→ Clay ──→ Smartlead (email)
Apify     ──↗         ├→ Expandi (LinkedIn)
                       ├→ JustCall (teléfono)
                       ├→ Slybroadcast (voicemail)
                       └→ HubSpot CRM

Pipeline Creadores:
Social Blade ──→ Clay ──→ ManyChat (WhatsApp/IG)
Inbound     ──↗         ├→ Twilio (SMS)
                         ├→ ElevenLabs (notas de voz)
                         ├→ Branch.io (deep links)
                         └→ HubSpot CRM

Alertas: HubSpot → Relay.app → Slack
```

### Paso 2: Dayana — Assets de documentación (Jue 16 Abr)
- Screenshots de cada herramienta (dashboard principal)
- Tabla de "dónde cargar qué":

| Asset | Herramienta | Dónde subir | Quién sube |
|-------|-------------|-------------|------------|
| Plantillas email B2B | Smartlead | Campaigns > Sequences | Equipo 4 |
| Video auditoría | Sendspark | Videos > Upload | Equipo 4 |
| Secuencia LinkedIn | Expandi | Campaigns > Messages | Equipo 4 |
| Flujo WhatsApp copy | ManyChat | Flows > Edit text | Equipo 4 |
| Guión llamada | JustCall | Scripts | Equipo 1 |
| Guión voicemail | Slybroadcast | Campaigns > Upload audio | Equipo 4 |

### Paso 3: Daniel — Grabar Loom (Vie 17 Abr)

**Guión del Loom (15 minutos):**

| Min | Contenido |
|-----|-----------|
| 0-2 | Intro: "Este es el sistema completo. Voy a mostrarles cada pieza." |
| 2-5 | Pipeline B2B: mostrar Clay → Smartlead → Expandi. Cómo fluyen los datos. |
| 5-8 | Pipeline Creadores: mostrar ManyChat → WhatsApp → HubSpot. Deep links. |
| 8-10 | HubSpot CRM: pipelines, cómo ver contactos, propiedades custom. |
| 10-12 | Dónde cargar activos: email templates en Smartlead, videos en Sendspark, etc. |
| 12-14 | Monitoreo: Slack channels, alertas, dashboard de salud de dominios. |
| 14-15 | Cierre: "Si tienen dudas, pregunten en #general-sprint" |

**Tips para grabar:**
- Usa Loom (gratis) — pantalla completa + cámara
- Habla como si le explicas a alguien que NO conoce las herramientas
- Comparte el link en Slack #general-sprint

## Entregables
- [ ] Diagrama de arquitectura en Figma (Lillian)
- [ ] Screenshots de dashboards de cada herramienta (Dayana)
- [ ] Tabla "dónde cargar qué" (Dayana)
- [ ] Loom de 15 minutos grabado y compartido (Daniel)
- [ ] Link del Loom enviado a líder de Equipo 4 por Slack

## Criterios de Aceptación
- [ ] Líder de Equipo 4 confirma que entiende dónde cargar cada tipo de contenido
- [ ] Diagrama cubre ambos pipelines y todas las herramientas
- [ ] Loom dura entre 12 y 18 minutos (no más, no menos)

## Notas para Daniel
- Este Loom es TU entregable como líder. NO lo delegues.
- Es tu oportunidad de demostrar dominio del sistema completo.
- Si algún pipeline no quedó perfecto en T14, mencionalo en el Loom: "esto está en proceso de fix"
- Guarda el Loom — también lo puedes usar para reportar avance a dirección.

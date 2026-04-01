# Respuesta a Natalia — HubSpot Sales Hub

> **Fecha:** 1 Abril 2026
> **De:** Daniel Ramírez — La Neta / Global Media Review
> **Para:** Natalia (Ejecutiva HubSpot)
> **Contexto:** Respuesta al correo inicial de Natalia con propuesta de módulos

---

**Asunto:** RE: Evaluación Sales Hub — La Neta / Global Media Review

---

Hola Natalia,

Gracias por el resumen tan completo. Me queda claro cómo encaja cada
módulo. Voy directo a lo que necesitamos para arrancar la semana que
viene y las preguntas que me quedaron.

---

## 1. Módulos que nos interesan

Para este primer mes solo necesitamos:

- ✓ **Sales Hub Pro** — es el corazón de la operación como bien dices.
  Pipelines, automatización de etapas, secuencias y reporting.

Los siguientes módulos NO los necesitamos en esta fase:

- ✗ **Content Hub** — ya tenemos Unbounce para landings y micrositios,
  con webhooks y conexión nativa a HubSpot.
- ✗ **Marketing Hub** — el email outreach lo maneja Smartlead, que es
  nuestra herramienta de cold email. No enviamos campañas desde
  HubSpot por ahora.
- ✗ **Service Hub** — muy interesante lo de WhatsApp centralizado y
  la bandeja unificada. Lo evaluamos para una segunda fase, pero
  hoy ManyChat ya cubre ese canal para nosotros.

---

## 2. Usuarios y tipo de acceso

Somos 8 personas en 4 equipos. Pero NO todos necesitan las
funcionalidades Pro (secuencias, workflows, automatizaciones).

La realidad de uso es:

- **2 usuarios operativos que SÍ necesitan Sales Pro:**
  - Ejecutan secuencias de email y LinkedIn follow-up
  - Configuran workflows de nurture (21 días sin respuesta)
  - Crean automatizaciones de etapas en pipeline
  - Necesitan reporting avanzado por etapa

- **6 usuarios que solo necesitan consultar y actualizar:**
  - Ver pipelines y mover deals entre etapas
  - Editar contactos y propiedades
  - Ver dashboards
  - NO usan secuencias, workflows ni automatizaciones

Preguntas:

a) ¿Los 6 usuarios de consulta pueden tener seats gratuitos o
   de menor costo? ¿Qué tipo de seat sería (free, view-only,
   Starter)?

b) ¿Qué funcionalidades exactas tienen los seats gratuitos
   dentro de un portal con Sales Pro activo?

c) ¿Los seats gratuitos pueden mover deals en el pipeline y
   editar propiedades de contactos, o solo lectura?

---

## 3. Herramientas a integrar vía API

Estas son las herramientas que necesitamos conectar a HubSpot.
Necesito tu confirmación de compatibilidad:

- **Clay** (enriquecimiento de datos)
  Push de prospectos vía API (POST /crm/v3/objects/contacts).
  ¿Funciona sin necesidad de workflow? ¿Hay límite diario de
  contactos creados vía API además del rate limit por segundo?

- **Smartlead** (cold email)
  Sync de status (enviado, abierto, respondido) a contactos.
  ¿Existe app en el Marketplace de HubSpot? Si no, nuestro
  plan es webhook → API de contactos.

- **Expandi** (LinkedIn automation)
  Sync de status LinkedIn (conectado, respondido) a contactos.
  ¿Existe app en el Marketplace? Expandi dice tener integración
  nativa bidireccional — ¿funciona con cualquier plan de Sales
  Hub o requiere Pro?

- **ManyChat** (WhatsApp/Instagram chatbot)
  Envía datos de calificación de creadores.
  ¿Existe integración nativa? Nuestro workaround es Zapier.

- **JustCall** (llamadas) — entiendo que es nativa en Marketplace ✓
- **Calendly** (agendamiento) — entiendo que es nativa ✓
- **Relay.app** (alertas → Telegram) — vía webhooks de workflows
- **Sendspark** (video personalizado) — vía webhook a contactos

---

## 4. Datos para la cotización

| Dato | Valor |
|---|---|
| Usuarios Sales Pro | 2 |
| Usuarios consulta/edición (free o menor costo) | 6 |
| Pipelines | 2 (B2B Ventas + Creadores Onboarding) |
| Propiedades custom | 8 |
| Contactos estimados mes 1 | ~1,500 (1,000 B2B + 500 creadores) |
| Integraciones vía API | Clay, Smartlead, Expandi, ManyChat |
| Integraciones nativas Marketplace | JustCall, Calendly |
| Volumen API | ~1,000 contactos/batch (sync desde Clay) |

---

## 5. Sobre pricing

Mencionas que según el alcance pueden estructurar condiciones
económicas más favorables. Nos interesa explorar eso.

Con solo 2 seats Pro y 6 usuarios de consulta, ¿qué descuento
o condición especial pueden ofrecernos? Estamos listos para
arrancar la próxima semana y comprometernos con el plan correcto
desde el día 1 si las condiciones son competitivas.

También quisiera saber:

- ¿El upgrade de Starter a Pro es inmediato y conserva toda la
  configuración existente (pipelines, propiedades, contactos)?
- ¿Hay pricing anual con descuento vs. mensual?

---

Quedo atento para la cotización. Si necesitas una llamada rápida
para alinear detalles técnicos de las integraciones, con gusto
la agendamos.

Saludos,
Daniel Ramírez
Director General México
La Neta / Global Media Review

# Correo para HubSpot — Evaluación Sales Hub

> **Fecha:** 1 Abril 2026
> **De:** Daniel Ramírez — La Neta / Global Media Review
> **Para:** Equipo de ventas HubSpot

---

**Asunto:** Evaluación Sales Hub — agencia de influencer marketing, 3 cuentas, integraciones con herramientas de prospección

---

Hola equipo HubSpot,

Soy Daniel Ramírez, Director General México de La Neta / Global Media Review,
una agencia de influencer marketing con +50,000 creadores.

Estamos arrancando un sprint de 30 días para escalar nuestra operación de
prospección B2B y onboarding de creadores. Queremos usar HubSpot como CRM
central y tengo algunas preguntas para definir el plan correcto.

---

## 1. Licencias que estamos evaluando

Necesitamos 3 cuentas (3 equipos internos). Lo que necesitamos cubrir:

| Funcionalidad                          | Starter ($20) | Sales Pro ($90) |
|----------------------------------------|:-:|:-:|
| 2 pipelines (B2B Ventas + Creadores)   | ✓ | ✓ |
| 8+ propiedades custom por objeto       | ✓ | ✓ |
| 8 usuarios con accesos diferenciados   | ✓ | ✓ |
| API completa (recibir/enviar datos)    | ✓ | ✓ |
| Dashboards múltiples                   | ✓ (30) | ✓ (75) |
| Workflows automáticos (nurture 21d)    | ✗ | ✓ |
| Secuencias de email                    | ✗ | ✓ |
| Informes custom de conversión          | ✗ | ✓ |
| Equipos formales (vistas por rol)      | ✗ | ✓ |

Preguntas:

a) ¿Tienen pricing por volumen para 3 cuentas Sales Pro?

b) ¿Existe trial de 14 días para Sales Pro antes de comprometernos?

c) Planeamos arrancar con Starter las primeras 2 semanas y escalar a
   Sales Pro en semana 3. ¿El upgrade es inmediato y conserva toda la
   configuración (pipelines, propiedades, contactos)?

---

## 2. Herramientas que queremos conectar a HubSpot

Nuestro stack de prospección incluye estas herramientas que necesitan
sincronizar datos con HubSpot:

- **Clay** (enriquecimiento de datos)
  → Envía prospectos enriquecidos a HubSpot vía API
    (POST /crm/v3/objects/contacts)

- **Smartlead** (email outreach)
  → Necesita sincronizar status de emails (enviado, abierto, respondido)
    a contactos en HubSpot

- **Expandi** (LinkedIn automation)
  → Necesita sincronizar status de LinkedIn (invitación enviada,
    conectado, respondido) a contactos en HubSpot

- **ManyChat** (chatbot WhatsApp/Instagram)
  → Necesita enviar datos de calificación de creadores a HubSpot

- **JustCall** (llamadas telefónicas)
  → Integración nativa para logging de llamadas

- **Calendly** (agendamiento)
  → Integración nativa para reuniones agendadas

- **Relay.app** (alertas)
  → Recibir webhooks desde HubSpot workflows para disparar
    alertas a Telegram

- **Sendspark** (video personalizado)
  → Sync de métricas de video a contactos en HubSpot

---

## 3. Integraciones sin solución nativa — necesito su orientación

Estas son las integraciones que NO hemos encontrado como apps nativas
en el Marketplace de HubSpot. Necesito su confirmación y recomendación:

### 3.1 Smartlead → HubSpot

Smartlead tiene webhooks outbound. Nuestro workaround sería
webhook → HubSpot API /contacts.

**Pregunta:** ¿Existe app de Smartlead en el Marketplace? ¿O el
approach vía API es la forma correcta?

### 3.2 Expandi → HubSpot

Misma situación. Expandi tiene webhooks outbound.

**Pregunta:** ¿Existe app de Expandi en el Marketplace?
¿La integración nativa bidireccional que menciona Expandi en su
sitio web funciona con Starter o requiere Pro?

### 3.3 Clay → HubSpot (webhook entrante)

Clay puede hacer push de prospectos enriquecidos. Nuestro plan es
usar la API directamente (POST /crm/v3/objects/contacts).

**Pregunta:** ¿Esto funciona en Starter sin necesidad de workflows?
¿Hay algún límite diario de creación de contactos vía API además
del rate limit de 100 calls/10 seg?

### 3.4 ManyChat → HubSpot

Nuestro workaround es Zapier (Free tier, 100 tasks/mes).

**Pregunta:** ¿Existe integración nativa de ManyChat? ¿O recomiendan
Operations Hub para este tipo de sync?

### 3.5 Rate limits en Starter

Necesitamos hacer batch sync de ~1,000 contactos desde Clay.
Con 100 calls/10 seg estimamos ~2 min para el lote completo.

**Pregunta:** ¿Starter tiene algún cap diario de contactos creados
vía API? ¿O solo aplica el rate limit por segundo?

---

## Contexto adicional

| Dato | Valor |
|---|---|
| Industria | Influencer Marketing / Agencia digital |
| Volumen estimado mes 1 | ~1,000 prospectos B2B + ~500 creadores |
| Usuarios totales | 8 (4 equipos internos) |
| Cuentas | 3 (una por equipo operativo) |
| Plazo | Sprint de 30 días, inicio 6 de abril 2026 |
| Plan a futuro | HubSpot será puente mientras construimos CRM propio (2-3 meses) |

Agradezco su orientación para elegir el plan correcto y confirmar
la viabilidad de estas integraciones.

Saludos,
Daniel Ramírez
Director General México
La Neta / Global Media Review

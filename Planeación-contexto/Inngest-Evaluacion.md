# Inngest — Evaluación y Licenciamiento para La Neta

**Fecha:** 2026-04-15
**Contexto:** Decisión de herramienta orquestadora para los flujos de prospección B2B (21 días) y Creadores (7 días), integrada con Supabase, Smartlead, Brevo y ManyChat.

---

## 1. ¿Qué es Inngest?

Inngest es una **plataforma de orquestación de workflows durables** diseñada para ejecutar lógica de negocio multi-paso de forma confiable. Permite escribir funciones en TypeScript o Python que se disparan por eventos (webhooks, cron, APIs) y se ejecutan con reintentos automáticos, pausas de días o semanas, y observabilidad completa.

A diferencia de un cron job tradicional o de herramientas no-code como Zapier/Make, Inngest está pensado para equipos con desarrolladores que necesitan **confiabilidad de producción** en flujos complejos: reintentos inteligentes por step, recuperación ante caídas, control de concurrencia por usuario/cuenta, y replays masivos de ejecuciones fallidas.

### Conceptos clave

- **Functions**: el workflow completo (ej: "Secuencia B2B 21 días").
- **Steps**: cada bloque atómico dentro de la función (`step.run`, `step.sleep`, `step.waitForEvent`). Cada step se reintenta por separado si falla.
- **Events**: disparadores que inician o reanudan funciones (ej: `contact.created`, `email.replied`).
- **Durable execution**: si el servidor se cae a mitad del flujo, Inngest retoma exactamente desde el último step completado.

---

## 2. ¿Para qué lo vamos a usar en La Neta?

### 2.1 Orquestar la secuencia B2B 21 días (Fábrica de Anuncios)

Cada prospecto ingresado en Supabase dispara un workflow Inngest que ejecuta los 9 touches multicanal (Email, LinkedIn, SMS, Voicemail, WhatsApp, Llamada) con las pausas exactas del plan estratégico (3d, 1d, 2d, 3d, 2d, 3d, 3d, 3d). Las reglas de salida (responder en cualquier canal cancela el flujo) se implementan con `step.waitForEvent`.

### 2.2 Orquestar la secuencia Creadores 7 días

Flujo mobile-native (IG DM → WhatsApp AI → SMS → Nota de voz → Email legal) con la misma lógica durable, permitiendo miles de creadores en paralelo sin saturar APIs de ManyChat/Brevo gracias al control de concurrencia.

---

## 2.A Detalle del Flujo Creadores (7 días, Mobile-Native)

**Objetivo:** Captar creadores de contenido para servicios de doblaje multilingüe, streaming 24/7 y expansión multiplataforma.
**ARPU:** $50–$400 por creador
**Canales:** Instagram DM → WhatsApp AI → SMS → Nota de voz WhatsApp → Email

| Día | Canal | Acción | Herramienta |
|---|---|---|---|
| 1 | 📱 Instagram DM | Video personalizado 15s ("dinero que pierdes por no doblar/streamear 24/7"). Trigger: interacción con hashtag/contenido ICP | ManyChat + deep link Branch.io |
| 2 | 💬 WhatsApp AI | Bot califica: suscriptores, ingresos mensuales, idioma de contenido | ManyChat + WhatsApp Business API |
| 3 | 📲 SMS | Prueba social: link a video testimonial 60s (Javier, Exi) | Twilio / SimpleTexting |
| 5 | 🎙️ Nota voz WhatsApp | 30s de Account Manager o IA, recomendación personalizada de servicio | ManyChat + ElevenLabs |
| 7 | ✉️ Email cierre | HTML con proyección de ganancias + botón firma contrato 1-clic | Brevo + firma digital |

**Salida exitosa:** creador responde/califica → pasa a cierre con Account Manager.
**Salida sin éxito:** se mueve a lista de nurturing con contenido mensual.

---

## 2.B Detalle del Flujo B2B Fábrica de Anuncios (21 días, Multicanal)

**Objetivo:** Marcas empresariales para suscripciones de UGC con IA y producción de contenido.
**ARPU:** $1,950–$12,000/mes
**Canales:** Email + LinkedIn + SMS + Voicemail + WhatsApp + Llamada

| Día | Canal | Acción | Herramienta |
|---|---|---|---|
| 1 | ✉️ Email #1 | Auditoría de video personalizada con IA (sitio web del prospecto como fondo dinámico) | Smartlead + Sendspark/Tavus |
| 4 | 💼 LinkedIn | Solicitud de conexión con nota referenciando el email | Waalaxy / HeyReach |
| 5 | ✉️ Email #2 | Seguimiento corto y directo | Smartlead |
| 7 | 📞 Voicemail + 📲 SMS | Buzón automático + SMS con link a auditoría | Orum + Twilio |
| 10 | 💼 LinkedIn | Engagement pasivo (like/comentario en publicación del prospecto) | PhantomBuster / Salesflow |
| 12 | ✉️ Email #3 | Caso de estudio o comparativa de competencia | Smartlead |
| 15 | 🎙️ WhatsApp voz (LatAm) | Nota <60s resumiendo valor | ManyChat + ElevenLabs |
| 18 | 📞 Llamada directa | 4–5 PM, humano o agente IA | Bland AI / Synthflow |
| 21 | ✉️ Email #4 (Breakup) | Último mensaje baja presión, puerta abierta | Brevo |

**Salida exitosa:** cualquier respuesta positiva (reply email, aceptar LinkedIn, contestar SMS, tomar llamada) cancela el flujo y asigna al vendedor.
**Salida sin éxito:** tras Email #4 sin respuesta, pasa a lista de nurturing (boletines mensuales, remarketing).

---

## 2.C Reglas de Salida (aplica a ambos flujos)

Listener global en Inngest que escucha eventos de respuesta en cualquier canal:

- `email.replied` (webhook Smartlead/Brevo)
- `linkedin.accepted` / `linkedin.messaged` (webhook Waalaxy)
- `sms.replied` (webhook Twilio)
- `whatsapp.replied` (webhook ManyChat)
- `call.answered` (webhook Bland AI)
- `meeting.booked` (webhook Calendly)

**Al dispararse cualquiera:**
1. Cancela todos los steps futuros del run activo
2. Marca `sequence_runs.status = 'won'` con `ended_reason`
3. Asigna a vendedor y notifica en Slack
4. Registra evento en `sequence_events` para auditoría

**Sin respuesta al terminar el flujo:**
- `status = 'exhausted'` → mueve a lista de nurturing
- Se le envían solo boletines mensuales o remarketing

---

## 2.D Modelo de Datos Mínimo en Supabase

Cuatro tablas que soportan ambos flujos con un solo motor Inngest:

| Tabla | Propósito | Filas esperadas |
|---|---|---|
| `sequences` | Plantillas de flujo | 2 (B2B-21d, Creator-7d) |
| `sequence_steps` | Definición de cada paso | 9 B2B + 5 Creadores = 14 |
| `sequence_runs` | Un prospecto ejecutando un flujo | Miles |
| `sequence_events` | Bitácora de envíos y respuestas | Cientos de miles |

Se integran con las tablas existentes `creator_inventory` y `creator_lists` (ya presentes en el ERD actual).

---

## 2.E Ejemplo de Código Inngest (Flujo Creadores)

```typescript
inngest.createFunction(
  { id: "creator-7day-hook", concurrency: { limit: 50, key: "event.data.creatorId" } },
  { event: "creator.enrolled" },
  async ({ event, step }) => {
    // Día 1 — Instagram DM
    await step.run("day-1-ig-dm", () =>
      manychat.sendIGDM(event.data.creatorId, "video_15s_hook")
    );

    // Listener de respuesta (cancela flujo si responde)
    const replied = await step.waitForEvent("wait-reply", {
      event: "manychat.replied",
      timeout: "1d",
      if: `async.data.creatorId == event.data.creatorId`,
    });
    if (replied) return handleWin(event.data.creatorId);

    // Día 2 — WhatsApp AI Bot
    await step.run("day-2-wa-bot", () =>
      manychat.startWhatsAppBot(event.data.creatorId)
    );
    await step.sleep("sleep-to-day-3", "1d");

    // Día 3 — SMS con testimonial
    await step.run("day-3-sms", () =>
      twilio.sendSMS(event.data.phone, TESTIMONIAL_URL)
    );
    await step.sleep("sleep-to-day-5", "2d");

    // Día 5 — Nota de voz WhatsApp
    await step.run("day-5-voice-note", () =>
      manychat.sendVoiceNote(event.data.creatorId, ELEVENLABS_VOICE_URL)
    );
    await step.sleep("sleep-to-day-7", "2d");

    // Día 7 — Email de cierre legal
    await step.run("day-7-email-contract", () =>
      brevo.sendContractEmail(event.data.email)
    );
  }
);
```

La misma estructura aplica al flujo B2B, extendida a 9 steps con pausas más largas.

### 2.3 Pegamento entre sistemas

Inngest actúa como el **hub central** que conecta:
- Supabase (base de datos y trigger de eventos)
- Clay (enriquecimiento de prospectos)
- Smartlead (cold email B2B)
- Brevo (email transaccional/breakup)
- ManyChat (WhatsApp/Instagram DMs creadores)
- Waalaxy (LinkedIn invitaciones y mensajes)
- Twilio (SMS y voicemail)
- Bland AI / Synthflow (llamadas IA)

### 2.4 Base futura para Elevn y Modelo B

Cuando se construya el portal Elevn para creadores (ingesta de video, pagos masivos con Routable, revenue share) y el pivote de Data Brokerage IA, Inngest orquesta esos pipelines largos (procesamiento de video, anotación, generación de hashes SHA-256, desembolsos programados).

---

## 3. Integración con Claude vía MCP

Inngest expone un servidor **MCP (Model Context Protocol)** oficial que permite que Claude Code:

- Liste todas las funciones registradas
- Dispare eventos de prueba
- Invoque funciones directamente
- Monitoree ejecuciones en tiempo real
- Consulte la documentación desde el propio Claude

**Instalación:**
```bash
claude mcp add --transport http inngest-dev http://127.0.0.1:8288/mcp
```

Con esto, el desarrollo de workflows se hace conversacionalmente desde Claude: "crea el flujo 21 días", "dispara un evento de prueba", "revisa por qué falló el step 3 del prospecto X". Acelera el desarrollo y reduce la curva de aprendizaje.

---

## 4. Licenciamiento y Planes

Inngest opera bajo un modelo **SaaS con tier gratuito generoso** y escalado pay-as-you-go. No requiere licencia perpetua ni self-hosting (aunque existe versión open source para self-host).

### 4.1 Tabla comparativa de planes

| Característica | Free (Hobby) | Pro | Enterprise |
|---|---|---|---|
| **Costo mensual** | $0 | Desde $75 | Custom |
| **Ejecuciones incluidas** | 50,000 | 1,000,000 (hasta 20M con add-ons) | Custom |
| **Steps concurrentes** | 5 | 100+ | 500 – 50,000 |
| **Conexiones Realtime** | 50 | 1,000+ | 1,000+ |
| **Usuarios del equipo** | 3 | 15+ | Custom |
| **Retención de trazas** | 24 horas | 7 días | 90 días |
| **Ambientes (branch/staging)** | Ilimitados | Ilimitados | Ilimitados |
| **Alertas** | Básicas | Granulares | Granulares + dedicadas |
| **SAML / RBAC / Audit logs** | ❌ | ❌ | ✅ |
| **Soporte** | Comunidad | Email | Slack dedicado |

### 4.2 Pay-as-you-go (excedentes en plan Pro)

- $0.00005 por ejecución en el rango 1M–5M
- Baja a $0.000015 por ejecución en 50M–100M

---

## 5. Recomendación de licencia para La Neta

### Fase MVP (Meses 1–2)
**Plan: Free (Hobby) — $0/mes**

Razones:
- 50,000 ejecuciones/mes cubren ampliamente la prospección inicial. Un prospecto en flujo 21 días consume ~15-20 ejecuciones (9 steps de envío + sleeps + eventos de respuesta). Capacidad para ~2,500 prospectos nuevos/mes.
- 3 usuarios alcanza para el equipo técnico inicial.
- Ambientes de staging ilimitados para probar sin tocar producción.
- Retención de 24h es suficiente mientras se depuran los flujos.

### Fase Escalamiento (Mes 3 en adelante)
**Plan: Pro — $75/mes**

Activar cuando se cumpla **cualquiera** de estas condiciones:
- Se superen las 50,000 ejecuciones/mes (≈2,500 prospectos activos)
- Necesidad de retención mayor a 24h para auditoría de campañas
- Concurrencia mayor a 5 steps (fan-out masivo a creadores)
- Más de 3 usuarios requieren acceso

### Fase Empresarial (Año 2+, cuando Elevn opere a escala)
**Plan: Enterprise — precio custom**

Necesario cuando:
- Se alcance compliance SOC 2 / HIPAA (Modelo B Data Brokerage requiere auditoría)
- Operación con >5M ejecuciones/mes
- Requerimiento de SAML/SSO para equipo >15 personas
- Audit trails exigidos por clientes empresariales (NVIDIA, OpenAI, Meta FAIR)

---

## 6. Costo Total Estimado vs Alternativas

| Stack | Mes 1-2 | Mes 3-6 | Año 2 |
|---|---|---|---|
| **Inngest + Supabase + APIs** | $0 | $75 | $500–2,000 |
| **GoHighLevel** | $97 | $297 | $297 + add-ons |
| **Make + n8n self-host** | $20 | $50 | $100–300 |

Inngest tiene el **mejor tier gratuito** para arrancar y el escalamiento más predecible cuando el volumen crece, además de ser la única opción que soporta la visión completa (B2B + Creadores + Elevn + Modelo B).

---

## 7. Requisitos Técnicos

- Node.js 18+ o Python 3.10+
- Servidor HTTP público (Railway, Vercel, Supabase Edge Functions)
- Cliente Inngest SDK instalado (`npm install inngest`)
- Endpoint `/api/inngest` expuesto en la app
- Variables de entorno: `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`

**Infraestructura actual de La Neta:** Railway (ya contratado) cumple todos los requisitos sin costo adicional.

---

## 8. Alternativa Viable: Supabase + Cron + Webhooks (sin Inngest)

Antes de adoptar Inngest, es importante documentar la alternativa **100% nativa al stack actual** que no requiere nuevas dependencias: Supabase (Postgres + Edge Functions + pg_cron) + Webhooks de los proveedores. Esta alternativa está detallada en el documento `Arquitectura-Cron-Supabase.md` y se resume así:

### 8.1 Patrón central: pre-materialización

- **Día 0 (enrolamiento):** se crean todas las filas de tareas futuras en `sequence_tasks` con fechas calculadas, y se **pre-generan todos los assets** (video Sendspark, audio ElevenLabs, URL micrositio, HTML emails) guardándose en `sequence_task_assets`. También se hace upsert del contacto enriquecido a HubSpot.
- **Día N (cron diario 9 AM):** un Edge Function lee las tareas con `scheduled_date = today AND status = 'pending'`, verifica que los assets estén `ready`, ejecuta la entrega por el canal correspondiente y actualiza HubSpot.
- **Webhooks:** Smartlead, Evolution API y HubSpot notifican respuestas y cancelan las tasks pendientes del prospecto.

### 8.2 Cuándo elegir esta alternativa en lugar de Inngest

| Condición | Elegir Cron+Supabase | Elegir Inngest |
|---|---|---|
| Volumen <500 prospectos nuevos/día | ✅ | |
| Granularidad diaria es suficiente | ✅ | |
| Equipo sin experiencia en durable execution | ✅ | |
| Cambios de flujo poco frecuentes (<1/mes) | ✅ | |
| Necesitas horarios específicos (ej: llamadas 4–5 PM) | | ✅ |
| Pipelines largos con múltiples pasos condicionales | | ✅ |
| Reintentos automáticos y replays masivos | | ✅ |
| Modelo B Data Brokerage (procesamiento video) | | ✅ |

### 8.3 Ruta de migración Cron → Inngest

El esquema `sequence_tasks` + `sequence_task_assets` se traduce limpiamente a Inngest:
- `scheduled_date` → `step.sleepUntil()`
- Generación de assets → `step.run()` en paralelo al inicio
- Webhooks de respuesta → `step.waitForEvent()`
- Toda la data histórica se preserva

No hay lock-in en ninguna dirección.

---

## 9. Decisión Recomendada

**Estrategia de dos fases:**

### Fase 1 (Mes 1 — MVP)
Implementar **Supabase + Cron + Webhooks** con pre-materialización de assets. Cero costo adicional, aprovecha el stack existente (Railway, Supabase, HubSpot, Smartlead, Brevo, ManyChat, Evolution API, ElevenLabs, Sendspark). Tiempo estimado: 1–2 semanas.

### Fase 2 (Mes 3 en adelante)
Evaluar migración a **Inngest plan Free** si se cumple cualquiera de estos disparadores:
- Volumen supera 500 prospectos nuevos por día
- Se requiere granularidad horaria (llamadas IA, horarios locales por timezone)
- Se inicia Modelo B (Data Brokerage IA) que requiere pipelines largos de procesamiento de video
- Flujos cambian con frecuencia y la regeneración manual de tasks se vuelve tediosa

### Fase 3 (Mes 6+)
Plan **Inngest Pro ($75)** + MCP integrado a Claude Code para desarrollo asistido, cuando se superen los límites del plan Free.

Esta estrategia **evita sobre-ingeniería temprana**, preserva el presupuesto para generación de assets (ElevenLabs, Sendspark, HubSpot) y construye la infraestructura correcta de manera incremental, alineada con la visión de Elevn y el Modelo B del plan estratégico.

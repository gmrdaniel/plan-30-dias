# DATOS DE PRUEBA PARA VALIDACION DE FLUJOS — Equipo 3

**Objetivo:** Tener personas reales de la empresa (o cercanas) como testers para validar cada pipeline end-to-end ANTES de lanzar con prospectos reales.
**Cuando se usa:** T14 — Testing E2E (Jue 16 Abr), pero los datos deben estar listos para el **Lun 13 Abr** (Dia 6).
**Quien llena:** Daniel coordina. Cada persona del equipo se puede ofrecer como tester + invitar a 1-2 personas de confianza.

---

## Reglas de prueba

1. **Marcar SIEMPRE como TEST** — en HubSpot usar tag `TEST`, en Clay usar columna `is_test = true`, en Smartlead usar lista "TEST - NO ENVIAR EN PRODUCCION"
2. **NO usar las cuentas de warmup reales para enviar emails de prueba** — eso arruina el warmup. Usar una cuenta de email personal o la de herramientas@laneta.com para las pruebas de envio
3. **Avisar a todos los testers** que van a recibir: emails, mensajes LinkedIn, DMs de Instagram, mensajes WhatsApp, SMS, y posiblemente una llamada/voicemail
4. **Minimo 5 testers por pipeline** para validar variaciones (diferentes dispositivos, paises, idiomas, respuestas)
5. **Documentar resultado de cada prueba** en la columna "Resultado" de las plantillas

---

## PLANTILLA A: Testers para Pipeline B2B

> Simula prospectos B2B que recibirian la secuencia completa: Email → LinkedIn → SMS → Voicemail → WhatsApp → Llamada

### Datos a llenar (minimo 5 testers)

| # | Nombre completo | Email personal (NO corporativo) | LinkedIn URL | Telefono (con codigo pais) | WhatsApp (si diferente) | Pais | Empresa ficticia para prueba | Cargo ficticio | Dispositivo (iOS/Android) | Idioma | Notas |
|---|----------------|-------------------------------|-------------|--------------------------|------------------------|------|-------|----------------|--------------------------|--------|-------|
| B1 | | | | | | | | | | | |
| B2 | | | | | | | | | | | |
| B3 | | | | | | | | | | | |
| B4 | | | | | | | | | | | |
| B5 | | | | | | | | | | | |
| B6 | | | | | | | | | | | |
| B7 | | | | | | | | | | | |

### Criterios para seleccionar testers B2B
- **Al menos 1 persona en US** y **1 en LATAM** (para probar timezone, formato telefono, WhatsApp LatAm)
- **Al menos 1 iOS y 1 Android** (deep links, SMS rendering)
- **Al menos 1 que NO responda a nada** (para probar la secuencia completa de 21 dias en modo acelerado)
- **Al menos 1 que responda al Email 1** (para probar salida temprana de la secuencia)
- Ideal: incluir a alguien externo a la empresa que no sepa nada del proyecto (simula prospecto real)

### Que se prueba con cada tester B2B

| Paso | Canal | Herramienta | Que validar | Tester responde? |
|------|-------|-------------|-------------|-----------------|
| 1 | Email #1 (auditoria) | Smartlead | Email llega a inbox (no spam), variables reemplazadas, links funcionan | Tester B1: SI responde → validar salida. Resto: NO |
| 2 | LinkedIn solicitud | Expandi | Solicitud llega, nota personalizada visible, link al micrositio | Tester B2: acepta y responde → validar salida. Resto: ignoran |
| 3 | Email #2 (seguimiento) | Smartlead | Llega a inbox, threading correcto con Email 1 | Todos: NO responden |
| 4 | Voicemail + SMS | Slybroadcast + Twilio | Audio llega, SMS llega con link correcto | Tester B3: responde SMS → validar salida |
| 5 | LinkedIn engagement | Expandi | Like/comment aparece en feed del tester | Todos: observan |
| 6 | Email #3 (caso estudio) | Smartlead | Llega con datos de competidor, link a micrositio | Todos: NO responden |
| 7 | WhatsApp nota de voz (LatAm) | ManyChat + ElevenLabs | Audio suena natural, link funciona | Tester B4 (LatAm): responde → validar salida |
| 8 | Llamada directa | JustCall | Llamada conecta, guion funciona | Tester B5: contesta → validar guion |
| 9 | Email #4 (breakup) | Smartlead | Llega, tono correcto, link final | Tester B6: NO responde → validar paso a Nurture |
| 10 | HubSpot | — | Todas las interacciones registradas, etapas actualizadas | Verificar en dashboard |
| 11 | Telegram alertas | Relay.app | Alertas disparadas para respuestas de B1, B2, B3, B4 | Verificar en #leads-b2b-calientes |

### Resultado esperado por tester

| Tester | Comportamiento simulado | Resultado esperado en HubSpot |
|--------|------------------------|------------------------------|
| B1 | Responde Email 1 | Secuencia se cancela → Status: "Respondido" → Alerta Telegram |
| B2 | Acepta LinkedIn y responde | Secuencia se cancela → Status: "Respondido LinkedIn" → Alerta Telegram |
| B3 | Responde SMS dia 7 | Secuencia se cancela → Status: "Respondido SMS" → Alerta Telegram |
| B4 | Responde WhatsApp dia 15 | Secuencia se cancela → Status: "Respondido WhatsApp" → Alerta Telegram |
| B5 | Contesta llamada dia 18 | Se registra en JustCall → HubSpot actualiza → Alerta Telegram |
| B6 | NO responde a nada | Completa 21 dias → Status: "Unresponsive" → Mover a lista Nurture |
| B7 | Email bounces (email invalido a proposito) | Detectar bounce → Alertar en #salud-dominios |

---

## PLANTILLA B: Testers para Pipeline Creadores

> Simula creadores que entran por Instagram DM → WhatsApp → cualificacion → firma

### Datos a llenar (minimo 5 testers)

| # | Nombre completo | Instagram handle | WhatsApp (con codigo pais) | Email personal | Telefono SMS | Plataforma principal (YT/TT/IG/Twitch) | Suscriptores reales o ficticios | Dispositivo (iOS/Android) | Idioma | Notas |
|---|----------------|-----------------|--------------------------|----------------|-------------|--------------------------------------|-------------------------------|--------------------------|--------|-------|
| C1 | | | | | | | | | | |
| C2 | | | | | | | | | | |
| C3 | | | | | | | | | | |
| C4 | | | | | | | | | | |
| C5 | | | | | | | | | | |
| C6 | | | | | | | | | | |

### Criterios para seleccionar testers Creadores
- **Al menos 1 con cuenta de Instagram real** (para probar el DM trigger de ManyChat)
- **Todos deben tener WhatsApp** (es el canal principal del flujo)
- **Al menos 1 iOS y 1 Android** (Branch.io deep links se comportan diferente)
- **Al menos 1 que "cualifique"** (>10K subs, >$500 ingresos) y **1 que NO cualifique** (<10K subs)
- **Al menos 1 que abandone** a mitad del flujo WhatsApp (para probar SMS de recuperacion Klaviyo)
- **Al menos 1 en espanol** y **1 en ingles** (probar idiomas del flujo)

### Que se prueba con cada tester Creadores

| Paso | Canal | Herramienta | Que validar | Tester |
|------|-------|-------------|-------------|--------|
| 1 | Instagram DM | ManyChat | DM automatico llega, video de 15s visible, botones funcionan | C1 interactua con hashtag/keyword trigger |
| 2 | Redirect IG → WhatsApp | Branch.io | Deep link abre WhatsApp correctamente (iOS + Android) | C1 hace clic en "Saber mas" |
| 3 | WhatsApp cualificacion P1 | ManyChat | Pregunta plataforma: botones funcionan | C1, C2 |
| 4 | WhatsApp cualificacion P2 | ManyChat | Pregunta suscriptores: rangos correctos | C1 (selecciona >10K), C2 (selecciona <10K) |
| 5 | WhatsApp cualificacion P3 | ManyChat | Pregunta ingresos | C1, C2 |
| 6 | WhatsApp cualificacion P4 | ManyChat | Pregunta idioma | C1, C2 |
| 7a | Resultado: CUALIFICADO | ManyChat → HubSpot | C1 recibe mensaje de exito + proyeccion. HubSpot: etapa "Cualificado". Telegram alerta. | C1 |
| 7b | Resultado: NO CUALIFICADO | ManyChat | C2 recibe mensaje amable + link a calculadora. Tag "nurture". | C2 |
| 8 | Abandono mid-flow | Klaviyo/SMS | C3 empieza flujo WhatsApp pero NO responde P3. Despues de 24h recibe SMS de recuperacion. | C3 |
| 9 | Nota de voz IA | ElevenLabs + ManyChat | C4 recibe nota de voz clonada por WhatsApp. Suena natural? Acento correcto? | C4 |
| 10 | Micrositio creadores | Leadpages | C5 recibe link al micrositio. Campos dinamicos reemplazados? Calculadora funciona? Mobile ok? | C5 |
| 11 | Supabase sync | Edge Function | Datos de C1 (cualificado) aparecen en creator_inventory + creator_lists "Sprint-Abr-Nuevos-Pipeline" | Verificar en BD |
| 12 | HubSpot pipeline | — | Todos los testers aparecen en pipeline Creadores con etapa correcta | Verificar dashboard |
| 13 | Telegram alertas | Relay.app | Alerta en #creadores-nuevos para C1 (cualificado) | Verificar canal |

### Resultado esperado por tester

| Tester | Comportamiento simulado | Resultado esperado |
|--------|------------------------|-------------------|
| C1 | Cualifica (>10K, >$500, espanol) | HubSpot: "Cualificado" → Telegram alerta → Supabase: creator_inventory nuevo |
| C2 | NO cualifica (<10K subs) | ManyChat: tag "nurture" → recibe link calculadora → HubSpot: "No cualificado" |
| C3 | Abandona flujo WhatsApp en P3 | 24h despues: SMS Klaviyo de recuperacion → si regresa: continua flujo |
| C4 | Recibe nota de voz IA | Evalua: suena natural? acento correcto? entendible? (feedback cualitativo) |
| C5 | Visita micrositio | Verifica: campos dinamicos, calculadora, responsive mobile, form → HubSpot |
| C6 | Email bounce + telefono invalido | Detectar bounce → no crashea el flujo → manejo de error graceful |

---

## PLANTILLA C: Datos para prueba de Clay Cascade (B2B)

> Gabriel necesita alimentar Clay con datos de prueba antes de correr la cascada completa de 1,000. Estos 10 registros simulan prospectos reales.

| # | Empresa | Website | Pais | Industria | Contacto nombre | Contacto email | Contacto LinkedIn | Revenue estimado USD | Tiene video? | Notas |
|---|---------|---------|------|-----------|----------------|---------------|-------------------|---------------------|-------------|-------|
| CL1 | | | | | | | | | | Prospecto ideal — todos los datos |
| CL2 | | | | | | | | | | Sin LinkedIn — probar cascade fallback |
| CL3 | | | | | | | | | | Email invalido — probar bounce handling |
| CL4 | | | | | | | | | | Revenue bajo — probar score < 6 |
| CL5 | | | | | | | | | | Empresa grande — probar score alto |
| CL6 | | | | | | | | | | Sin website — probar enrichment limitado |
| CL7 | | | | | | | | | | Competidor directo — probar exclusion |
| CL8 | | | | | | | | | | LATAM — probar geo + idioma |
| CL9 | | | | | | | | | | Solo telefono — probar canal SMS/llamada |
| CL10 | | | | | | | | | | Datos minimos — probar edge case |

**Sugerencia:** Usar empresas reales de Amazon/Shopify que conozcan (no competidores). Gabriel puede encontrar 10 en SmartScout en 15 minutos para llenar esto.

---

## PLANTILLA D: Datos para prueba de integraciones HubSpot + Telegram

> Para validar que los datos fluyen correctamente entre sistemas.

| # | Test | Accion | Resultado esperado en HubSpot | Resultado esperado en Telegram | Resultado esperado en Supabase | Quien ejecuta |
|---|------|--------|------------------------------|---------------------------|-------------------------------|---------------|
| I1 | Nuevo prospecto B2B | Crear contacto manual en HubSpot con tag TEST | Contacto visible en pipeline B2B | Alerta en #leads-b2b-calientes | — | Daniel |
| I2 | Prospecto responde email | Marcar como "replied" en Smartlead | HubSpot: etapa actualiza a "Respondido" | Alerta en #leads-b2b-calientes | — | Gabriel |
| I3 | Prospecto agenda reunion | Crear deal en HubSpot etapa "Reunion" | Pipeline avanza | Alerta con link al deal | — | Daniel |
| I4 | Creador cualificado ManyChat | Tester C1 completa flujo WhatsApp | Contacto en pipeline Creadores etapa "Cualificado" | Alerta en #creadores-nuevos | Registro en creator_inventory | Dayana |
| I5 | Email bounce | Enviar a email invalido desde Smartlead | Contacto marcado como bounced | Alerta en #salud-dominios | — | Gabriel |
| I6 | Dominio degradado | Simular alerta MxToolbox (o esperar una real) | — | Alerta en #salud-dominios | — | Gabriel |
| I7 | Clay → Supabase sync | Ejecutar sync con 10 prospectos de prueba (CL1-CL10) | — | — | 10 registros en client_inventory + client_contacts + lista "TEST" | Gabriel |

---

## Cronograma de pruebas

| Fecha | Que se prueba | Datos necesarios | Quien ejecuta |
|-------|--------------|-----------------|---------------|
| 13 Abr (Dia 6) | **Datos de prueba deben estar listos** | Plantillas A, B, C llenas | Daniel coordina |
| 14 Abr (Dia 7) | Clay cascade con 10 prospectos test (Plantilla C) | CL1-CL10 | Gabriel |
| 15 Abr (Dia 8) | Flujos ManyChat con testers (Plantilla B) | C1-C6 | Dayana |
| 16 Abr (Dia 9) | **Testing E2E completo (T14)** | Plantillas A + B + D | Gabriel + Daniel + todo el equipo |
| 16 Abr (Dia 9) | Integraciones HubSpot + Telegram (Plantilla D) | I1-I7 | Daniel + Gabriel |

---

## Notas importantes

1. **Los testers deben dar su consentimiento** — avisarles que van a recibir emails, DMs, SMS, llamadas y voicemails de prueba durante 1-2 dias.
2. **Usar tag "TEST" en TODAS las herramientas** (HubSpot, Clay, Smartlead, ManyChat) para poder filtrar y eliminar despues.
3. **NO ejecutar pruebas desde las cuentas de warmup** de Smartlead — usar cuentas separadas o la cuenta de herramientas@laneta.com.
4. **Documentar TODOS los bugs** encontrados durante las pruebas en un doc compartido o directamente en Telegram #general-infra.
5. **Para la prueba de secuencia completa (21 dias):** no esperar 21 dias reales. Comprimir la secuencia a intervalos de 1-2 horas en modo test (Smartlead y Expandi tienen modos de prueba acelerados).
6. **Minimo de testers recomendado:** 5 B2B + 5 Creadores + 10 datos Clay = 20 registros de prueba total. Con 3-4 personas de la empresa + 1-2 externos se cubre.

# T09 — Sendspark + ElevenLabs + Klaviyo/SimpleTexting

## Información General
| Campo | Valor |
|-------|-------|
| **ID** | T09 |
| **Prioridad** | 🔴 CRITICA |
| **Responsable** | Dayana (Sendspark + ElevenLabs), Eugenia (Klaviyo), Gabriel (API) |
| **Fecha Inicio** | Lunes 13 Abril |
| **Fecha Entrega** | Lunes 13 Abril |
| **Bloqueada por** | DTO-IN-03 (audio de Equipo 2 para ElevenLabs) |
| **Bloquea a** | DTO-OUT-07 (Sendspark → Eq4), DTO-OUT-08 (ElevenLabs → Eq2 aprobación) |

## Objetivo
Video personalizado (Sendspark), clonación de voz (ElevenLabs) y recuperación SMS (Klaviyo) configurados.

---

## Dayana: Sendspark ($129/mes)

### Pasos
1. Daniel compra Sendspark ($129/mes)
2. Login y configurar cuenta
3. **Configurar variables dinámicas:**
   - `{{nombre}}` — nombre del prospecto
   - `{{empresa}}` — empresa del prospecto
   - `{{dato_custom}}` — dato personalizado (ej: revenue estimado, gap de video)
4. **Verificar que las variables se rendericen correctamente:**
   - Crear video de prueba (puede ser un placeholder de 10 segundos)
   - Generar 3 links con variables diferentes
   - Verificar que cada link muestra los datos correctos
5. **Integrar con HubSpot** (si la integración nativa existe)

### Entregable: Sendspark activo, variables dinámicas configuradas, 3 links de prueba generados

---

## Dayana: ElevenLabs ($99/mes)

### Pasos
1. Daniel compra ElevenLabs ($99/mes)
2. Login y configurar cuenta
3. **Subir audio del Equipo 2 (DTO-IN-03):**
   - Si Mery envió el audio: subirlo a ElevenLabs > Voice Cloning > Add Voice
   - Formato preferido: WAV, mínimo 5 minutos, un solo hablante
   - Si Mery NO envió el audio: escalar a Daniel inmediatamente
4. **Iniciar entrenamiento de clon de voz:**
   - Nombre del clon: "La Neta - Account Manager"
   - Idioma: Español
   - El entrenamiento tarda unas horas
5. **Generar 10 muestras de prueba** una vez entrenado:
   - Texto variado: saludos, explicaciones de servicios, follow-ups
   - Guardar las 10 muestras como MP3
   - Enviar a Mery (Equipo 2) para aprobación (DTO-OUT-08)

### Entregable: Clon de voz entrenado, 10 muestras generadas, enviadas a Eq2 para aprobación

---

## Gabriel: API ElevenLabs → ManyChat

### Pasos
1. Obtener API key de ElevenLabs (Settings > API Key)
2. En ManyChat, crear una acción custom (External Request):
   - **Trigger:** Cuando un creador cualificado necesita nota de voz
   - **Request:** POST a ElevenLabs API `/v1/text-to-speech/{voice_id}`
   - **Body:** JSON con el texto personalizado
   - **Response:** Audio file URL
   - **Siguiente paso en ManyChat:** Enviar audio como nota de voz por WhatsApp
3. **Probar end-to-end:**
   - Ejecutar flujo de prueba
   - Verificar que el audio se genera y se envía por WhatsApp
   - Verificar calidad del audio recibido en móvil

### Entregable: API conectada, flujo de prueba ejecutado, audio recibido en WhatsApp

---

## Eugenia: Klaviyo/SimpleTexting

### Pasos
1. Daniel compra Klaviyo ($20/mes) o SimpleTexting ($29/mes)
   - **Recomendación:** Klaviyo si van a usar SMS + email; SimpleTexting si solo SMS
2. **Configurar cuenta:**
   - Importar lista de emails/teléfonos de prueba
   - Configurar sender identity
3. **Configurar trigger de abandono Elevn:**
   - **Trigger:** Creador inicia onboarding en Elevn pero no completa en 24h
   - **Acción:** Enviar SMS: "Hey {{nombre}}, vimos que empezaste tu registro en Elevn. ¿Necesitas ayuda? Responde aquí o continúa: {{link}}"
   - **Necesitas:** URL del webhook de Elevn o acceso a la BD para detectar abandonos
   - **Pide a Daniel:** El endpoint o forma de detectar abandonos en Elevn
4. **Probar:**
   - Simular un abandono de onboarding
   - Verificar que el SMS llega al número de prueba

### Entregable: Klaviyo configurado, trigger de abandono activo, SMS de prueba enviado

**Dónde buscar info:**
- Klaviyo docs: help.klaviyo.com
- SimpleTexting docs: simpletexting.com/docs
- Para el trigger de abandono: preguntar a Daniel por la API/webhook de Elevn

---

## Criterios de Aceptación
- [ ] Sendspark: variables dinámicas renderizan correctamente en 3 links de prueba
- [ ] ElevenLabs: clon de voz entrenado (si audio llegó)
- [ ] ElevenLabs: 10 muestras enviadas a Equipo 2
- [ ] API ElevenLabs → ManyChat: nota de voz generada y enviada por WhatsApp en prueba
- [ ] Klaviyo: SMS de recuperación de abandono enviado exitosamente en prueba

## Costo
| Item | Costo |
|------|-------|
| Sendspark | $129/mes |
| ElevenLabs | $99/mes |
| Klaviyo | $20/mes |

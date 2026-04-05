# T09 — Sendspark + ElevenLabs + Klaviyo/SimpleTexting

## Información General
| Campo | Valor |
|-------|-------|
| **ID** | T09 |
| **Prioridad** | 🔴 CRITICA |
| **Responsable** | Dayana (Sendspark + ElevenLabs), Eugenia (Klaviyo), Gabriel (API + workflows) |
| **Fecha Inicio** | Lunes 13 Abril |
| **Fecha Entrega** | Lunes 13 Abril |
| **Bloqueada por** | DTO-IN-03 (audio de Equipo 2 para ElevenLabs) |
| **Bloquea a** | DTO-OUT-07 (Sendspark → Eq4), DTO-OUT-08 (ElevenLabs → Eq2 aprobación) |

## Objetivo
Video personalizado (Sendspark), clonación de voz (ElevenLabs) y recuperación SMS (Klaviyo) configurados. Sendspark es la herramienta clave para **comprimir el ciclo de ventas B2B de 60 días a 14 días** mediante auditorías de video personalizadas con IA.

---

## Contexto estratégico: Por qué Sendspark es crítico

El plan estratégico establece que:
- Los compradores aceleran decisiones cuando el **costo de la inacción se cuantifica visualmente**
- Las auditorías de video personalizadas logran **tasas de respuesta de 15-25%** (vs 3.43% promedio de cold email texto)
- Los **fondos dinámicos** (screenshot del listing real del prospecto) aumentan CTR en **4.5x**
- El formato de 60-90 segundos es óptimo para el segundo contacto B2B

### Dónde aparece Sendspark en la secuencia B2B

```
Día 1:  Email texto plano (punto de dolor + link auditoría Sendspark)
Día 5:  Follow-up LinkedIn + reafirmar link auditoría
Día 8:  Email con prueba social + enlace auditoría
Día 14: Breakup email
```

### Dónde se entrega el video

```
1. Email Smartlead → thumbnail + link (en secuencia cold email)
2. Micrositio Landingi → embed iframe (en landing B2B personalizada)
3. WhatsApp ManyChat → link directo (en flujo creadores)
4. DM LinkedIn Expandi → link (en secuencia LinkedIn)
```

---

## Dayana: Sendspark — Configuración ($129/mes Growth)

### Plan Growth ($129/mes): 200 videos personalizados/mes
- Suficiente para sprint (1,000 prospectos, no todos reciben video)
- Variables dinámicas ilimitadas
- Fondos dinámicos (screenshot del sitio/listing del prospecto)
- Integraciones: HubSpot, Smartlead, Calendly

### Paso 1: Configurar cuenta
1. Login Sendspark (herramientas@laneta.com — ya comprado, credenciales en .env)
2. Verificar plan Growth activo

### Paso 2: Conectar HubSpot (ya hecho)
- ✅ Integración conectada via HubSpot Marketplace
- Video views se loguean como actividad en el contacto de HubSpot automáticamente
- No requiere Relay.app ni middleware

### Paso 3: Configurar variables dinámicas
Variables para el video de auditoría B2B:

| Variable | Descripción | Fuente |
|---|---|---|
| `{{nombre}}` | Nombre del prospecto | client_contacts.first_name |
| `{{empresa}}` | Nombre de la empresa | client_inventory.name |
| `{{revenue}}` | Revenue estimado | client_inventory.estimated_budget_usd |
| `{{categoria}}` | Categoría/industria | client_inventory.industry |
| `{{competidor}}` | Competidor principal | client_competitors.competitor_name |
| `{{video_gap}}` | Score de brecha de video (1-10) | client_inventory.video_gap_score |

### Paso 4: Configurar fondo dinámico
- El fondo del video muestra el **sitio web o listing real** del prospecto
- Configurar en Sendspark: Dynamic Background → URL parameter `{{website}}`
- Esto hace que cada prospecto vea SU listing/sitio en el video

### Paso 5: Video maestro de auditoría (Equipo 4 graba)
- **Duración:** 60-90 segundos
- **Formato:** Screen share revisando un listing de ejemplo
- **Guión:** El representante señala los activos de video faltantes y explica el impacto en revenue
- **Quién graba:** Líder de Contenido (Equipo 4) — Día 6 del sprint
- **Mientras tanto:** Dayana configura todo con un video placeholder de 15 seg
- El video maestro se personaliza dinámicamente por cada prospecto via las variables

### Paso 6: Generar links de prueba
Crear 5 links de prueba con datos de las 10 empresas test (T06):

```
https://sendspark.com/share/video?nombre=María+García&empresa=TechBrand+LLC&revenue=707000&categoria=Health&competidor=CeraVe&website=goodmolecules.com
https://sendspark.com/share/video?nombre=Kimberly+Nieves&empresa=Black+Girl+Sunscreen&revenue=354995&categoria=Personal+Care&competidor=Supergoop&website=blackgirlsunscreen.com
https://sendspark.com/share/video?nombre=Hayes+Nabozny&empresa=Wavytalk&revenue=0&categoria=Hair+Styling&competidor=&website=wavytalk.com
https://sendspark.com/share/video?nombre=Becky+Xiong&empresa=SONGMICS+HOME&revenue=22500000&categoria=Furniture&competidor=&website=songmicshome.com
https://sendspark.com/share/video?nombre=Pamela+Pan&empresa=MakarttPro&revenue=157999&categoria=Nail+Art&competidor=&website=makarttpro.com
```

Verificar que cada link muestra:
- Nombre correcto en el video
- Empresa correcta
- Fondo con el sitio web del prospecto (o placeholder si aún no está configurado)

### Entregable: Sendspark activo, variables + fondo dinámico configurados, HubSpot conectado, 5 links de prueba verificados

---

## Gabriel: Workflows automatizados de Sendspark

### Workflow 1: Smartlead → Sendspark (automático)

Sendspark tiene integración nativa con Smartlead. Cuando un prospecto entra a una campaña de Smartlead, se puede generar video personalizado automáticamente.

**Configurar en Sendspark:**
1. Ir a Workflows → New Workflow
2. Trigger: "Lead added to Smartlead campaign"
3. Action: Generate personalized video con variables del lead
4. Output: URL del video generado

**Resultado:** El link de video se puede incluir como variable en la secuencia de Smartlead:
```
Email 1: "{{nombre}}, encontramos una brecha de video en {{empresa}}. 
         Mira este análisis de 60 segundos: {{sendspark_video_url}}"
```

### Workflow 2: Calendly → Sendspark (automático)

Cuando un prospecto agenda reunión (CTA del micrositio o email), generar video de preparación.

**Configurar en Sendspark:**
1. Trigger: "Meeting booked on Calendly"
2. Action: Generate video de bienvenida/preparación
3. Delivery: Email automático con el video

**Resultado:** El prospecto recibe un video personalizado antes de la reunión reforzando la propuesta de valor.

### Workflow 3: HubSpot → Sendspark (engagement tracking)

Ya conectado. Los eventos de video se loguean automáticamente:
- Video view → actividad en contacto HubSpot
- Tiempo de visualización → métrica en HubSpot
- Disponible para dashboards y reportes de conversión

### Entregable: Workflows Smartlead + Calendly configurados y probados con 1 prospecto test

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

### Uso de notas de voz clonadas

Las notas de voz se usan en WhatsApp via ManyChat para creadores:
- Se siente personal e íntimo (audio > texto en LatAm)
- Rompe barreras formales de ventas
- Engagement dramáticamente mayor que texto en México y Centroamérica

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
- [ ] Sendspark: HubSpot conectado y logueando video views
- [ ] Sendspark: variables dinámicas (6 campos) renderizan correctamente en 5 links de prueba
- [ ] Sendspark: fondo dinámico muestra sitio web del prospecto
- [ ] Sendspark: workflow Smartlead → Sendspark configurado y probado
- [ ] Sendspark: workflow Calendly → Sendspark configurado y probado
- [ ] ElevenLabs: clon de voz entrenado (si audio llegó)
- [ ] ElevenLabs: 10 muestras enviadas a Equipo 2
- [ ] API ElevenLabs → ManyChat: nota de voz generada y enviada por WhatsApp en prueba
- [ ] Klaviyo: SMS de recuperación de abandono enviado exitosamente en prueba

## Costo
| Item | Costo | Acceso |
|------|-------|--------|
| Sendspark | $129/mes (Growth — 200 videos/mes) | herramientas@laneta.com |
| ElevenLabs | $99/mes | herramientas@laneta.com |
| Klaviyo | $20/mes | herramientas@laneta.com |

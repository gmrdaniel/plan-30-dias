# Secuencias de Prospección — Detalle de Días, Condiciones y Responsable

**Fecha:** 2026-04-16
**Propósito:** Definir exactamente qué pasa cada día, quién lo ejecuta (HubSpot vs Supabase), qué condiciones se evalúan, y qué datos se necesitan. Base para implementación.

---

## Aclaraciones Previas

| Tema | Decisión |
|---|---|
| **Sendspark (video auditoría)** | Se ejecuta desde HubSpot (workflow). No se integra vía API por ahora. |
| **ManyChat (IG/WA)** | Es **reactivo**: el creador nos escribe primero. No forma parte de la secuencia outbound. |
| **SMS** | Pendiente seleccionar herramienta. Se deja como placeholder en la secuencia. |
| **Waalaxy (LinkedIn)** | Se integra vía API desde Supabase (import a campaña). Waalaxy ejecuta invite+DM internamente. |
| **Smartlead** | Maneja sus propias secuencias de email (external_sequence). Supabase solo inscribe y escucha webhooks. |
| **Brevo** | Emails transaccionales puntuales disparados por Supabase (task_driven). |
| **respond.io / Evolution** | WhatsApp texto y audio disparados por Supabase (task_driven). |
| **ElevenLabs** | Genera audio al Día 0 (enrollment). Se almacena en Supabase Storage. |

---

## Nomenclatura

- **HubSpot** = HubSpot ejecuta la acción (workflow, Sendspark, secuencia interna)
- **Supabase** = Edge Function `execute-due-tasks` ejecuta la acción vía API
- **Waalaxy** = Waalaxy ejecuta internamente después de import vía API
- **Smartlead** = Smartlead ejecuta internamente después de inscribir al prospecto
- **Manual** = Requiere intervención humana
- **Condición previa** = qué se evalúa antes de ejecutar este paso

---

## FLUJO 1: Creadores (variable según datos disponibles)

### Variante 1A: Tengo Email + WhatsApp (caso más común)

**Duración:** 14 días, 6 touches
**Fuente de prospectos:** Base de datos comprada, Clay enrichment, referidos

| Día | Canal | Acción | Quién ejecuta | Condición previa | Datos requeridos | Asset pre-generado |
|---|---|---|---|---|---|---|
| 1 | ✉️ Email | Email #1 — Hook "oportunidad de monetización" + link video Sendspark | **Smartlead** (external_sequence) | Prospecto inscrito en Smartlead campaign | `email` | Video Sendspark (hecho desde HubSpot) |
| 3 | 💬 WhatsApp texto | Follow-up casual: "¿Viste el email que te mandé?" | **Supabase** → respond.io | `status = active` AND step 1 no tiene `response = replied` | `phone` | — |
| 5 | 🎙️ WhatsApp voz | Nota de voz 30s personalizada (Account Manager IA) | **Supabase** → respond.io | `status = active` AND no hay reply en ningún canal | `phone` | Audio ElevenLabs (generado Día 0) |
| 7 | ✉️ Email | Email #2 — Caso de éxito (Javier/Exi) + testimonial video | **Supabase** → Brevo | `status = active` | `email` | email_html (renderizado Día 0) |
| 10 | 💬 WhatsApp texto | Propuesta directa + link micrositio con proyección de ganancias | **Supabase** → respond.io | `status = active` | `phone` | URL micrositio (construido Día 0) |
| 14 | ✉️ Email | Email breakup — "Si no es el momento, entiendo" | **Supabase** → Brevo | `status = active` | `email` | email_html (renderizado Día 0) |

**Si responde en cualquier momento** → cancelar todo, marcar `won`, asignar a Account Manager.
**Si no responde tras Día 14** → `status = exhausted`, mover a lista nurturing.

### Variante 1B: Solo tengo Email (sin WhatsApp)

**Duración:** 14 días, 4 touches (solo email)

| Día | Canal | Acción | Quién ejecuta | Condición |
|---|---|---|---|---|
| 1 | ✉️ Email | Email #1 — Hook monetización + video Sendspark | **Smartlead** | `email` disponible |
| 5 | ✉️ Email | Email #2 — Caso de éxito + testimonial | **Supabase** → Brevo | `status = active` |
| 10 | ✉️ Email | Email #3 — Propuesta directa + micrositio | **Supabase** → Brevo | `status = active` |
| 14 | ✉️ Email | Email breakup | **Supabase** → Brevo | `status = active` |

### Variante 1C: Solo tengo WhatsApp (sin Email)

**Duración:** 10 días, 4 touches (solo WhatsApp)

| Día | Canal | Acción | Quién ejecuta | Condición |
|---|---|---|---|---|
| 1 | 💬 WhatsApp texto | Saludo + propuesta de valor corta | **Supabase** → respond.io | `phone` disponible |
| 3 | 🎙️ WhatsApp voz | Nota de voz 30s personalizada | **Supabase** → respond.io | `status = active` |
| 6 | 💬 WhatsApp texto | Link a video testimonial + proyección ganancias | **Supabase** → respond.io | `status = active` |
| 10 | 💬 WhatsApp texto | Último mensaje: "dejo la puerta abierta" | **Supabase** → respond.io | `status = active` |

### Selección automática de variante al enrolar

```
Si tiene email Y tiene phone → Variante 1A (creator-14d-full)
Si tiene email Y NO tiene phone → Variante 1B (creator-14d-email)
Si NO tiene email Y tiene phone → Variante 1C (creator-10d-wa)
Si NO tiene email Y NO tiene phone → ❌ No se puede enrolar (error)
```

---

## FLUJO 2: B2B Fábrica de Anuncios (variable según datos disponibles)

### Variante 2A: Tengo Email + LinkedIn URL (caso más común desde Clay/SmartScout)

**Duración:** 21 días, 9 touches
**Fuente de prospectos:** Clay enrichment desde SmartScout/Apify
**Referencia:** Simulador CC-000 (`simulador_secuencia_cc000.html`)

#### Sistema de señales (evalúa comportamiento del prospecto)

Después de cada touch con tracking, se evalúa qué hizo el prospecto. La señal determina la **variante del siguiente mensaje**:

| Señal | Email | WhatsApp | Acción |
|---|---|---|---|
| **A** — Respondió + agendó | Respondió al email | Respondió positivo | **Fast Track**: sale del flujo, asignar a vendedor |
| **B** — Engajó sin agendar | Abrió + hizo click, no agendó | Doble azul (leyó), sin respuesta | Siguiente mensaje: **variante caliente** |
| **C** — Interés bajo | Abrió, sin click ni respuesta | Entregado, sin lectura | Siguiente mensaje: **variante media** |
| **D** — Sin contacto | No abrió / rebotó | Un tick / no entregado | Siguiente mensaje: **variante fría** |

**Fuente de señales:**
- Señal Email: webhook de **Smartlead** (`email_opened`, `email_clicked`, `email_replied`) ✅ ya configurado
- Señal WhatsApp: webhook de **respond.io** (delivery status, read receipt) ⚠️ pendiente validar
- Señal LinkedIn: **Waalaxy → HubSpot** CRM Sync (`accepted`, `replied`)

#### Secuencia día a día

| Día | Canal | Acción | Quién ejecuta | Señal evaluada | Variante mensaje |
|---|---|---|---|---|---|
| 1-3 | ✉️ Email | Email #1 — "{{marca}} pierde visibilidad sin video" + link auditoría Sendspark | **Smartlead** | — | Fijo |
| 4 | 💼 LinkedIn | Solicitud de conexión + nota: "Te mandé una auditoría de {{marca}}, conecto por aquí por si preferís verlo desde LinkedIn." | **Supabase** → Waalaxy | — | Fijo |
| 5 | ✉️ Email | Email #2 — Follow-up **adaptado según señal D1** | **Smartlead** | Señal D1 | **B**: "Vi que revisaste la auditoría, ¿algo te llamó la atención?" / **C**: "Solo quería asegurarme de que el correo llegó bien" / **D**: Nuevo asunto, re-enviar propuesta de valor |
| 7 | 💬 WhatsApp | WhatsApp texto/audio **adaptado según señal D5** | **Supabase** → respond.io | Señal D5 | **B**: "Vi que revisaste la auditoría, ¿tienes una pregunta puntual?" / **C**: "Te mandé un correo, ¿lo pudiste ver?" / **D**: "Te escribí por correo, puede que no haya llegado. Tu producto no tiene video y eso te está costando ventas." |
| 10 | 💼 LinkedIn | Engagement orgánico: like/comentario en publicación del prospecto. **CERO mención comercial.** | **Manual** (tarea en dashboard) | — | Instrucción operativa |
| 12 | ✉️ Email | Email #3 — FOMO competitivo **adaptado según señal D7** | **Supabase** → Brevo | Señal D7 | **B**: "Vi que te llegó el audio. {{competidor}} lleva ventaja en video. Ver caso estudio." / **C**: "Cada vez más marcas producen video a escala. Caso real:" / **D**: "{{competidor}} lanzó video hace 90 días y su ranking subió. {{marca}} todavía no tiene." |
| 15 | 🎙️ WhatsApp | Nota de voz **adaptada según señal D12** | **Supabase** → respond.io | Señal D12 | **B**: "¿Qué es lo que te frena para dar el siguiente paso?" / **C**: "Te mandé un caso real de una marca como la tuya. Sin video estás dejando ventas." / **D**: "Te he escrito varias veces por correo. Te mando este audio directo. Tu producto no tiene video." |
| 18 | 📞 Llamada | Llamada de conversión con script **según acumulado de señales** | **Manual** (tarea en dashboard) | Acumulado | **Hot** (2+ señales B): "Tengo abierto tu listing, vi que revisaste la auditoría. ¿20 min ahora?" / **Mixed** (B+C): "Encontré algo específico para {{marca}}, ¿2 min?" / **Cold** (C/D): "Te escribí varias veces, puede que no hayan llegado. ¿60 seg para explicarte?" |
| 21 | ✉️ Email | Email breakup — "¿Cierro tu archivo, {{nombre}}? Auditoría activa 30 días. Nos quedan {{Y}} espacios este trimestre." | **Supabase** → Brevo | — | Fijo |

#### Assets pre-generados Día 0

| Asset | Proveedor | Steps que lo usan |
|---|---|---|
| Video auditoría | Sendspark (vía HubSpot) | D1 |
| Audio nota de voz variante B | ElevenLabs | D15 |
| Audio nota de voz variante C | ElevenLabs | D15 |
| Audio nota de voz variante D | ElevenLabs | D15 |
| Email HTML caso estudio variante B | Interno | D12 |
| Email HTML caso estudio variante C | Interno | D12 |
| Email HTML caso estudio variante D | Interno | D12 |
| Email HTML breakup | Interno | D21 |
| URL micrositio | Interno (parámetros URL) | D12 |

**Nota:** Para D15 se pre-generan 3 audios distintos. El cron elige cuál enviar según la señal de D12.

#### Lógica de señales en el cron

```
Al ejecutar un step adaptativo (D5, D7, D12, D15):

1. Leer señal del step anterior:
   - D5 depende de → señal de D1 (campo response en sequence_tasks step 1)
   - D7 depende de → señal de D5
   - D12 depende de → señal de D7
   - D15 depende de → señal de D12

2. Mapear señal a variante:
   response = 'replied'  → señal A → Fast Track (no debería llegar aquí, ya cancelado)
   response = 'clicked'  → señal B → variante caliente
   response = 'opened'   → señal C → variante media
   response = NULL        → señal D → variante fría

3. Para D18 (llamada), calcular acumulado:
   Contar cuántas señales B tiene en [D1, D5, D7, D12, D15]
   >= 2 señales B → script "hot"
   >= 1 señal B   → script "mixed"
   0 señales B    → script "cold"

4. Seleccionar asset correspondiente:
   asset_key = 'voice_B', 'voice_C', 'voice_D' para D15
   asset_key = 'email_html_B', 'email_html_C', 'email_html_D' para D12
```

#### Estado de webhooks requeridos para señales

| Webhook | Señal que provee | Estado |
|---|---|---|
| Smartlead `email_sent` | Confirma envío D1/D5 | ✅ Configurado |
| Smartlead `email_opened` | Señal C (abrió) | ✅ Probándose |
| Smartlead `email_clicked` | Señal B (click) | ✅ Probándose |
| Smartlead `email_replied` | Señal A (Fast Track) | ✅ Configurado |
| respond.io delivery status | Señal D (no entregado) | ⚠️ Pendiente validar |
| respond.io read receipt | Señal B/C (doble azul / entregado) | ⚠️ Pendiente validar |
| Waalaxy → HubSpot CRM Sync | LinkedIn accepted / replied | ✅ Documentado |

### Variante 2B: Solo Email (sin LinkedIn, sin teléfono)

**Duración:** 18 días, 5 touches
**Señales:** solo las de Smartlead (opened/clicked)

| Día | Canal | Acción | Quién ejecuta | Señal evaluada |
|---|---|---|---|---|
| 1 | ✉️ Email | Email #1 — Auditoría + Sendspark | **Smartlead** | — |
| 5 | ✉️ Email | Email #2 — Follow-up **adaptado** | **Smartlead** | Señal D1 (B/C/D) |
| 10 | ✉️ Email | Email #3 — FOMO competitivo **adaptado** | **Supabase** → Brevo | Señal D5 (B/C/D) |
| 14 | ✉️ Email | Email #4 — Caso estudio **adaptado** | **Supabase** → Brevo | Señal D10 (B/C/D) |
| 18 | ✉️ Email | Email breakup | **Supabase** → Brevo | Fijo |

### Variante 2C: Email + LinkedIn + Teléfono (datos completos)

Es la Variante 2A (9 touches) + se agregan:

| Día | Canal | Acción | Quién ejecuta | Señal |
|---|---|---|---|---|
| 7 | 📞 Voicemail + 📲 SMS | Buzón de voz 45s + SMS con link auditoría | **Pendiente** (Orum + SMS) | — |
| 8 | 💬 WhatsApp voz | Nota <60s (solo LatAm) **adaptada** | **Supabase** → respond.io | Señal D5 (B/C/D) |

Total: **11 touches** en 21 días.

### Selección automática de variante al enrolar

```
Si tiene email Y tiene linkedin_url Y tiene phone → Variante 2C (b2b-21d-full)
Si tiene email Y tiene linkedin_url Y NO tiene phone → Variante 2A (b2b-21d-standard)
Si tiene email Y NO tiene linkedin_url → Variante 2B (b2b-18d-email)
Si NO tiene email → ❌ No se puede enrolar en B2B (email es obligatorio)
```

---

## Resumen de Responsabilidades

### ¿Qué hace cada sistema?

```
SMARTLEAD
├── Email #1 (hook/auditoría) → cold email optimizado con warmup
├── Email #2 (follow-up) → parte de la misma secuencia
└── Webhook → avisa a Supabase: sent, opened, clicked, replied, bounced

HUBSPOT
├── Sendspark video → workflow genera video personalizado al enrollar
├── CRM Sync Waalaxy → recibe notificación de invite accepted / replied
├── Workflows → reenvía eventos a Supabase vía webhook
└── Properties → refleja estado actual del prospecto para ventas

WAALAXY
├── LinkedIn invite → ejecuta internamente tras import vía API
├── LinkedIn DM → ejecuta internamente tras aceptar invite
└── CRM Sync → notifica a HubSpot cuando aceptan/responden

SUPABASE (nuestro orquestador)
├── Enrolamiento Día 0 → crea run + tasks + genera assets + push HubSpot
├── Cron diario 9AM → ejecuta tasks task_driven (WA texto, WA voz, emails Brevo)
├── Cron retry cada hora → reintenta tasks fallidas
├── Webhooks → recibe notificaciones de todos los canales
├── Reglas de salida → cancela tasks pendientes cuando hay reply
└── Dashboard → visibilidad para el equipo

RESPOND.IO / EVOLUTION API
├── WhatsApp texto → enviado por Supabase cron
└── WhatsApp audio → enviado por Supabase cron (audio de Storage)

ELEVENLABS
└── Genera audio → llamado una vez al Día 0, resultado en Storage
```

### Mapa visual de quién dispara qué (B2B 21d standard — 9 touches)

```
Día 0 (Enrollment)
    Supabase: crear run + 9 tasks + assets (3 audios, 3 email_html, micrositio)
    Supabase → HubSpot: upsert contacto con properties
    HubSpot → Sendspark: workflow genera video auditoría
    Supabase → Smartlead: inscribir en campaign (emails D1 y D5)
    Supabase → Waalaxy: import a lista (NO a campaña todavía)

Día 1-3
    Smartlead: envía Email #1 (automático, su secuencia interna)
    Smartlead webhook → Supabase: registra opened/clicked/bounced

Día 4
    Supabase cron → Waalaxy API: import a campaña con invite+DM
    Waalaxy: envía invitación LinkedIn (Chrome debe estar abierto)

Día 5
    Smartlead: envía Email #2 (automático)
    ⚡ Smartlead elige variante B/C/D según señal de D1
       (esto se configura como variantes dentro de Smartlead)

Día 7
    Supabase cron → leer señal D5 de sequence_tasks → elegir variante
    Supabase cron → respond.io: WA texto (variante B, C o D)

Día 10
    Dashboard muestra tarea manual: "LinkedIn engagement para {{nombre}}"
    Equipo: like/comentario en publicación. CERO mención comercial.

Día 12
    Supabase cron → leer señal D7 → elegir variante email_html
    Supabase cron → Brevo: Email #3 FOMO competitivo (variante B, C o D)

Día 15
    Supabase cron → leer señal D12 → elegir variante audio
    Supabase cron → respond.io: Nota de voz (variante B, C o D)

Día 18
    Dashboard muestra tarea manual: "Llamada {{nombre}} — script hot/mixed/cold"
    Supabase calcula: contar señales B en [D1,D5,D7,D12,D15]
    ≥2 B → hot / ≥1 B → mixed / 0 B → cold

Día 21
    Supabase cron → Brevo: Email breakup (fijo)

CUALQUIER MOMENTO (listeners paralelos):
    Smartlead webhook "replied"          → cancel run → status='won'
    respond.io webhook "incoming message" → cancel run → status='won'
    HubSpot webhook (Waalaxy "replied")  → cancel run → status='won'
    HubSpot webhook "meeting.creation"   → cancel run → status='won'
```

### Mapa visual Creadores 14d (para comparación)

```
Día 0 (Enrollment)
    Supabase: crear run + 6 tasks + assets (1 audio, email_html, micrositio)
    Supabase → HubSpot: upsert contacto
    HubSpot → Sendspark: video (si aplica)
    Supabase → Smartlead: inscribir en campaign (email D1)

Día 1
    Smartlead: Email #1 hook monetización

Día 3
    Supabase cron → respond.io: WA texto follow-up

Día 5
    Supabase cron → respond.io: WA nota de voz 30s

Día 7
    Supabase cron → Brevo: Email caso de éxito

Día 10
    Supabase cron → respond.io: WA propuesta + micrositio

Día 14
    Supabase cron → Brevo: Email breakup

LISTENERS (mismos que B2B)
```

---

## Condiciones Evaluadas en Cada Step

### Antes de ejecutar cualquier task (cron diario)

```
1. ¿La fecha de hoy = scheduled_date? → Si no, skip
2. ¿El run está active? → Si no (won/exhausted/cancelled), skip
3. ¿La task está pending? → Si no, skip
4. ¿Los assets requeridos están ready? → Si no, marcar failed
5. ¿Los datos del canal existen? (email para email, phone para WA) → Si no, skip
```

### Condiciones especiales por canal

| Canal | Condición extra |
|---|---|
| WhatsApp voz (B2B) | `country` debe ser LatAm (MX, CO, AR, CL, PE, BR, EC, VE, GT, DO) |
| LinkedIn invite | `linkedin_url` debe existir Y ser URL válida |
| LinkedIn engagement (Día 18 B2B) | Solo si la invitación fue aceptada (`response = accepted` en task de linkedin_invite) |
| SMS | `phone` debe existir — **pendiente herramienta** |
| Llamada directa | Solo manual — no automatizado en MVP |

### Condiciones de salida (cancel run)

| Evento | Fuente | Acción |
|---|---|---|
| Responde email | Smartlead webhook `email_replied` | Cancel all pending → `status = won` |
| Responde WhatsApp | respond.io webhook `message.created` incoming | Cancel all pending → `status = won` |
| Acepta invite LinkedIn Y responde DM | HubSpot webhook (Waalaxy CRM Sync `replied`) | Cancel all pending → `status = won` |
| Agenda reunión | HubSpot webhook `meeting.creation` | Cancel all pending → `status = won` |
| Último step ejecutado sin respuesta | Cron detecta 0 tasks pending | `status = exhausted` → nurturing |
| Cancelación manual | Dashboard admin | Cancel all pending → `status = cancelled` |

---

## Templates de Secuencia para la DB

### Resumen de templates necesarios (6 variantes)

| Template name | Steps | Canales usados |
|---|---|---|
| `creator-14d-full` | 6 | email + whatsapp |
| `creator-14d-email` | 4 | email only |
| `creator-10d-wa` | 4 | whatsapp only |
| `b2b-21d-standard` | 9 | email + linkedin + whatsapp + llamada (manual) |
| `b2b-18d-email` | 5 | email only |
| `b2b-21d-full` | 11 | email + linkedin + whatsapp + sms + voicemail + llamada |

### `creator-14d-full` (6 steps)

| step | offset_days | channel | action_type | provider | delivery_mode | required_assets | required_fields |
|---|---|---|---|---|---|---|---|
| 1 | 0 | email | email_hook | smartlead | external_sequence | [video] | [email] |
| 2 | 2 | whatsapp | wa_followup | respondio | task_driven | [] | [phone] |
| 3 | 4 | whatsapp | wa_voice_note | respondio | task_driven | [voice] | [phone] |
| 4 | 6 | email | email_case | brevo | task_driven | [email_html] | [email] |
| 5 | 9 | whatsapp | wa_close | respondio | task_driven | [microsite] | [phone] |
| 6 | 13 | email | email_breakup | brevo | task_driven | [email_html] | [email] |

### `creator-14d-email` (4 steps)

| step | offset_days | channel | action_type | provider | delivery_mode | required_assets | required_fields |
|---|---|---|---|---|---|---|---|
| 1 | 0 | email | email_hook | smartlead | external_sequence | [video] | [email] |
| 2 | 4 | email | email_case | brevo | task_driven | [email_html] | [email] |
| 3 | 9 | email | email_proposal | brevo | task_driven | [email_html, microsite] | [email] |
| 4 | 13 | email | email_breakup | brevo | task_driven | [email_html] | [email] |

### `creator-10d-wa` (4 steps)

| step | offset_days | channel | action_type | provider | delivery_mode | required_assets | required_fields |
|---|---|---|---|---|---|---|---|
| 1 | 0 | whatsapp | wa_intro | respondio | task_driven | [] | [phone] |
| 2 | 2 | whatsapp | wa_voice_note | respondio | task_driven | [voice] | [phone] |
| 3 | 5 | whatsapp | wa_testimonial | respondio | task_driven | [] | [phone] |
| 4 | 9 | whatsapp | wa_breakup | respondio | task_driven | [] | [phone] |

### `b2b-21d-standard` (9 steps) — Alineado al Simulador CC-000

| step | offset_days | channel | action_type | provider | delivery_mode | señal_depende_de | required_assets | required_fields |
|---|---|---|---|---|---|---|---|---|
| 1 | 0 | email | email_audit | smartlead | external_sequence | — | [video] | [email] |
| 2 | 3 | linkedin | linkedin_invite | waalaxy | task_driven | — | [] | [linkedin_url] |
| 3 | 4 | email | email_followup | smartlead | external_sequence | step 1 (B/C/D) | [email_html_B, email_html_C, email_html_D] | [email] |
| 4 | 6 | whatsapp | wa_followup | respondio | task_driven | step 3 (B/C/D) | [] | [phone] |
| 5 | 9 | linkedin | linkedin_engagement | manual | task_driven | — | [] | [linkedin_url] |
| 6 | 11 | email | email_fomo | brevo | task_driven | step 4 (B/C/D) | [email_html_B, email_html_C, email_html_D, microsite] | [email] |
| 7 | 14 | whatsapp | wa_voice_note | respondio | task_driven | step 6 (B/C/D) | [voice_B, voice_C, voice_D] | [phone] |
| 8 | 17 | voice | call_conversion | manual | task_driven | acumulado (hot/mixed/cold) | [] | [phone] |
| 9 | 20 | email | email_breakup | brevo | task_driven | — | [email_html] | [email] |

**Notas:**
- **Step 3 (email_followup):** Smartlead elige variante internamente si se configuran variantes A/B/C en la campaña. Alternativa: Supabase envía vía Brevo si se quiere control total de la variante.
- **Step 4 (wa_followup):** Si `phone` no existe, se marca `skipped`. El texto varía según señal: B="Vi que revisaste...", C="Te mandé un correo...", D="Te escribí por correo, puede que no haya llegado...".
- **Step 5 (linkedin_engagement):** Tarea manual en Dashboard. Instrucción: like/comentario orgánico, CERO mención comercial.
- **Step 7 (wa_voice_note):** Se pre-generan 3 audios al Día 0. El cron elige `voice_B`, `voice_C` o `voice_D` según señal de step 6.
- **Step 8 (call_conversion):** Tarea manual en Dashboard con script calculado: ≥2 señales B → hot, ≥1 B → mixed, 0 B → cold.

### `b2b-18d-email` (5 steps)

| step | offset_days | channel | action_type | provider | delivery_mode | required_assets | required_fields |
|---|---|---|---|---|---|---|---|
| 1 | 0 | email | email_audit | smartlead | external_sequence | [video] | [email] |
| 2 | 4 | email | email_followup | smartlead | external_sequence | [] | [email] |
| 3 | 9 | email | email_casestudy | brevo | task_driven | [email_html, microsite] | [email] |
| 4 | 13 | email | email_value | brevo | task_driven | [email_html] | [email] |
| 5 | 17 | email | email_breakup | brevo | task_driven | [email_html] | [email] |

### `b2b-21d-full` (11 steps) — Standard + Voicemail/SMS/Llamada

| step | offset_days | channel | action_type | provider | delivery_mode | señal_depende_de | required_assets | required_fields |
|---|---|---|---|---|---|---|---|---|
| 1 | 0 | email | email_audit | smartlead | external_sequence | — | [video] | [email] |
| 2 | 3 | linkedin | linkedin_invite | waalaxy | task_driven | — | [] | [linkedin_url] |
| 3 | 4 | email | email_followup | smartlead | external_sequence | step 1 (B/C/D) | [email_html_B, email_html_C, email_html_D] | [email] |
| 4 | 6 | voice | voicemail_audit | pendiente | task_driven | — | [voice] | [phone] |
| 5 | 6 | sms | sms_audit_link | pendiente | task_driven | — | [] | [phone] |
| 6 | 7 | whatsapp | wa_followup | respondio | task_driven | step 3 (B/C/D) | [] | [phone] |
| 7 | 9 | linkedin | linkedin_engagement | manual | task_driven | — | [] | [linkedin_url] |
| 8 | 11 | email | email_fomo | brevo | task_driven | step 6 (B/C/D) | [email_html_B, email_html_C, email_html_D, microsite] | [email] |
| 9 | 14 | whatsapp | wa_voice_note | respondio | task_driven | step 8 (B/C/D) | [voice_B, voice_C, voice_D] | [phone] |
| 10 | 17 | voice | call_conversion | manual | task_driven | acumulado (hot/mixed/cold) | [] | [phone] |
| 11 | 20 | email | email_breakup | brevo | task_driven | — | [email_html] | [email] |

**Notas:**
- Steps 4+5 (voicemail+SMS) se ejecutan el mismo día. SMS se envía inmediatamente después del voicemail.
- Ambos están pendientes de herramienta (Orum + Twilio/SimpleTexting).

---

## Relación Smartlead ↔ Supabase

Smartlead maneja sus propias secuencias internamente (warmup, rotación de dominios, timing). Supabase NO le dice a Smartlead "manda el email #2 hoy" — Smartlead lo hace solo.

```
ENROLLMENT (Día 0):
    Supabase inscribe prospecto en Smartlead campaign
    → Smartlead maneja emails #1 y #2 según su lógica interna

TRACKING (continuo):
    Smartlead → webhook → Supabase
    Eventos: email_sent, email_opened, email_clicked, email_replied, email_bounced

IMPLICACIÓN PARA TASKS:
    Los steps con delivery_mode='external_sequence' se crean en sequence_tasks
    pero NO se ejecutan por el cron. Solo sirven para:
    1. Tracking visual en el dashboard (timeline)
    2. Registrar el estado vía webhook de Smartlead
    3. Saber que los emails 1 y 2 son "propiedad de Smartlead"
```

---

## Relación Waalaxy ↔ Supabase ↔ HubSpot

```
STEP linkedin_invite (Día 4 B2B):
    Supabase cron ejecuta:
    → POST /prospects/addProspectFromIntegration (import a campaña activa)
    → Waalaxy ejecuta invite + DM internamente

RESPONSE TRACKING:
    Waalaxy → CRM Sync → HubSpot (properties actualizadas)
    HubSpot → Workflow → webhook → Supabase Edge Function
    → Si replied: cancel run

NOTA: Waalaxy necesita Chrome abierto para ejecutar acciones.
      Si Chrome está cerrado, las acciones se acumulan y ejecutan al abrir.
```

---

## Lo que queda pendiente (no implementar ahora)

| Feature | Estado | Cuándo |
|---|---|---|
| SMS (Twilio/SimpleTexting) | Buscando herramienta | Cuando se seleccione |
| Voicemail (Orum) | No integrado | Fase 2 |
| Llamada directa (Bland AI) | No integrado | Fase 2 |
| LinkedIn engagement automático | Manual en MVP | PhantomBuster fase 2 |
| ManyChat (reactivo) | No es outbound | Flujo separado de inbound |
| Sendspark vía API | HubSpot lo maneja | Si se necesita volumen alto |
| Exhausted → Nurturing automático | Pendiente | Después del MVP |

# Arquitectura Cron + Supabase + Pre-Materialización de Assets

**Fecha:** 2026-04-15
**Autor:** Equipo Técnico La Neta
**Propósito:** Documento técnico de implementación para orquestar los flujos de prospección B2B (14–21 días) y Creadores (7 días) utilizando exclusivamente el stack existente, sin dependencias nuevas como Inngest.

---

## 1. Principio Arquitectónico

> **"Bake at enrollment, deliver on schedule."**

Separar la **preparación de contenido** (generación de video, audio, URLs, emails HTML, enriquecimiento HubSpot) del momento de **entrega** (envío por canal). Toda la generación costosa y propensa a fallos ocurre el **Día 0**, cuando el prospecto se inscribe; el cron diario solo entrega contenido ya horneado.

### Beneficios

- **Fail fast:** si ElevenLabs o Sendspark fallan, te enteras el Día 0, no el Día 5.
- **Auditoría visual:** todos los assets pueden revisarse antes de enviar.
- **Previsibilidad de costo:** sabes inmediatamente cuántos assets se generaron.
- **Idempotencia:** el cron puede reintentarse sin regenerar assets.
- **HubSpot siempre al día:** ventas ve el progreso del prospecto en tiempo real.

---

## 2. Stack Implicado

| Componente | Rol | Ya contratado |
|---|---|---|
| **Supabase (Postgres)** | Base de datos y fuente de verdad | ✅ |
| **Supabase Edge Functions** | Enrolamiento, cron, webhooks | ✅ |
| **Supabase Storage** | Almacenar audio ElevenLabs | ✅ |
| **pg_cron** | Disparador diario de entrega | ✅ |
| **Railway** | Host para Evolution API (WhatsApp) | ✅ |
| **HubSpot** | CRM, enriquecimiento, workflows delegados | ✅ |
| **Smartlead** | Cold email B2B | ✅ |
| **Brevo** | Email transaccional / breakup | ✅ |
| **ManyChat** | IG DM / WhatsApp conversacional | ✅ |
| **Evolution API** | WhatsApp directo (texto + audio) | ✅ |
| **ElevenLabs** | Generación de notas de voz IA | ✅ |
| **Sendspark** | Video auditoría personalizada | ✅ |

---

## 3. Flujos a Implementar

### 3.1 Flujo Creadores — 7 días (datos reales: email + WhatsApp)

| Día | Offset | Canal | Action Type | Asset requerido | API |
|---|---|---|---|---|---|
| 1 | +0d | ✉️ Email | `email_hook` | `video` (Sendspark) | Smartlead |
| 3 | +2d | 💬 WA texto | `wa_followup` | — | Evolution |
| 5 | +4d | 🎙️ WA voz | `wa_voice_note` | `voice` (ElevenLabs) | Evolution |
| 7 | +6d | ✉️ Email | `email_case` | `email_html` | Brevo |
| 10 | +9d | 💬 WA texto | `wa_close` | `microsite` | Evolution |
| 14 | +13d | ✉️ Email | `email_breakup` | `email_html` | Brevo |

### 3.2 Flujo B2B — 14 días (MVP sin voicemail/llamadas)

| Día | Offset | Canal | Action Type | Asset requerido | API |
|---|---|---|---|---|---|
| 1 | +0d | ✉️ Email #1 | `email_audit` | `video` (Sendspark) | Smartlead |
| 4 | +3d | 💼 LinkedIn | `linkedin_invite` | — | Waalaxy (fase 2) |
| 5 | +4d | ✉️ Email #2 | `email_followup` | `email_html` | Smartlead |
| 8 | +7d | 💬 WhatsApp | `wa_summary` | `voice` (ElevenLabs) | Evolution |
| 12 | +11d | ✉️ Email #3 | `email_casestudy` | `microsite` | Brevo |
| 14 | +13d | ✉️ Email #4 | `email_breakup` | — | Brevo |

---

## 4. Esquema SQL Completo

### 4.1 Tabla catálogo — plantillas de flujo

```sql
CREATE TABLE sequence_template (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_name   text NOT NULL,          -- 'creator-7d' | 'b2b-14d'
  step_number     int  NOT NULL,
  offset_days     int  NOT NULL,          -- días desde el Día 0
  channel         text NOT NULL,          -- 'email' | 'whatsapp_text' | 'whatsapp_voice' | 'linkedin'
  action_type     text NOT NULL,          -- 'email_hook' | 'wa_voice_note' | ...
  provider        text NOT NULL,          -- 'smartlead' | 'brevo' | 'evolution' | 'manychat'
  template_id     text,                   -- id de plantilla en el proveedor
  required_assets text[],                 -- ['video', 'voice', 'microsite']
  required_fields text[],                 -- ['email', 'whatsapp']
  created_at      timestamptz DEFAULT now(),

  UNIQUE(sequence_name, step_number)
);
```

### 4.2 Tabla de runs — un prospecto en un flujo

```sql
CREATE TABLE sequence_runs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id     uuid NOT NULL REFERENCES creator_inventory(id),
  sequence_name   text NOT NULL,
  program         text NOT NULL,          -- 'meta' | 'creator-onboard' | 'b2b-saas'
  tier            text,                   -- 'A' | 'B' | 'C'
  status          text DEFAULT 'active',  -- active | won | exhausted | cancelled
  ended_reason    text,                   -- 'replied_email' | 'no_response' | 'manual_cancel'
  started_at      timestamptz DEFAULT now(),
  ended_at        timestamptz,
  hubspot_contact_id text,

  UNIQUE(prospect_id, sequence_name)
);

CREATE INDEX idx_runs_prospect ON sequence_runs(prospect_id, status);
```

### 4.3 Tabla de tareas pre-materializadas

```sql
CREATE TABLE sequence_tasks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id          uuid NOT NULL REFERENCES sequence_runs(id) ON DELETE CASCADE,
  step_number     int  NOT NULL,
  scheduled_date  date NOT NULL,
  channel         text NOT NULL,
  action_type     text NOT NULL,
  provider        text NOT NULL,
  template_id     text,
  status          text DEFAULT 'pending', -- pending | sent | skipped | cancelled | failed
  executed_at     timestamptz,
  response        text,                   -- opened | clicked | replied
  error           text,
  retry_count     int DEFAULT 0,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_tasks_due ON sequence_tasks(scheduled_date, status)
  WHERE status = 'pending';
CREATE INDEX idx_tasks_run ON sequence_tasks(run_id);
```

### 4.4 Tabla de assets pre-generados

```sql
CREATE TABLE sequence_task_assets (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id         uuid NOT NULL REFERENCES sequence_tasks(id) ON DELETE CASCADE,
  asset_key       text NOT NULL,          -- 'video' | 'voice' | 'microsite' | 'email_html'
  status          text DEFAULT 'pending', -- pending | generating | ready | failed
  provider        text NOT NULL,          -- 'sendspark' | 'elevenlabs' | 'internal'
  external_id     text,
  url             text,
  request_payload jsonb,
  response_raw    jsonb,
  error           text,
  retry_count     int DEFAULT 0,
  generated_at    timestamptz,
  created_at      timestamptz DEFAULT now(),

  UNIQUE(task_id, asset_key)
);

CREATE INDEX idx_assets_status ON sequence_task_assets(status, retry_count);
```

### 4.5 Bitácora de eventos

```sql
CREATE TABLE sequence_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id          uuid REFERENCES sequence_runs(id),
  task_id         uuid REFERENCES sequence_tasks(id),
  event_type      text NOT NULL,          -- 'enrolled' | 'sent' | 'opened' | 'replied' | 'failed'
  channel         text,
  source          text,                   -- 'smartlead' | 'brevo' | 'evolution' | 'hubspot'
  payload         jsonb,
  occurred_at     timestamptz DEFAULT now()
);

CREATE INDEX idx_events_run ON sequence_events(run_id, occurred_at DESC);
```

---

## 5. Pipeline de Enrolamiento (Día 0)

### 5.1 Edge Function `enroll-prospect`

```typescript
// supabase/functions/enroll-prospect/index.ts
export async function enrollProspect(
  prospectId: string,
  sequenceName: string,
  startDate: Date = new Date()
) {
  // 1. Validar datos mínimos del prospecto
  const prospect = await getProspect(prospectId);
  const template = await getSequenceTemplate(sequenceName);
  validateRequiredFields(prospect, template); // lanza error si falta email/WA

  // 2. Crear sequence_run
  const run = await createRun(prospectId, sequenceName, prospect.program, prospect.tier);

  // 3. Construir dossier completo del prospecto
  const dossier = buildDossier(prospect);

  // 4. Materializar las tareas
  const tasks = await createTasks(run.id, template, startDate);

  // 5. Pre-generar assets en paralelo (fail fast)
  await Promise.all([
    ...tasks.filter(t => t.required_assets?.includes('video'))
           .map(t => generateVideoAsset(t, dossier)),
    ...tasks.filter(t => t.required_assets?.includes('voice'))
           .map(t => generateVoiceAsset(t, dossier)),
    ...tasks.filter(t => t.required_assets?.includes('microsite'))
           .map(t => buildMicrositeUrl(t, dossier)),
    ...tasks.filter(t => t.required_assets?.includes('email_html'))
           .map(t => renderEmailHtml(t, dossier)),
  ]);

  // 6. Upsert a HubSpot con enriquecimiento completo
  const hubspotContactId = await hubspot.upsertContact({
    email: dossier.email,
    properties: {
      ...dossier,
      laneta_sequence_name: sequenceName,
      laneta_program: prospect.program,
      laneta_tier: prospect.tier,
      laneta_enrollment_date: startDate.toISOString(),
      laneta_video_url: getAssetUrl(tasks, 'video'),
      laneta_voice_url: getAssetUrl(tasks, 'voice'),
      laneta_microsite_url: getAssetUrl(tasks, 'microsite'),
      laneta_current_step: 0,
    }
  });

  await updateRun(run.id, { hubspot_contact_id: hubspotContactId });
  await logEvent(run.id, null, 'enrolled', { sequenceName, assetsReady: true });

  return { runId: run.id, tasksCreated: tasks.length };
}
```

### 5.2 Generadores de Asset

#### Video auditoría (Sendspark)

```typescript
async function generateVideoAsset(task, dossier) {
  await markAssetGenerating(task.id, 'video');
  try {
    const response = await sendspark.createPersonalizedVideo({
      template_id: TEMPLATES.video_audit,
      variables: {
        first_name: dossier.firstName,
        company: dossier.company,
        website_url: dossier.websiteUrl,
      }
    });
    await saveAsset({
      task_id: task.id,
      asset_key: 'video',
      provider: 'sendspark',
      external_id: response.id,
      url: response.share_url,
      request_payload: { template_id: TEMPLATES.video_audit, vars: dossier },
      response_raw: response,
      status: 'ready',
    });
  } catch (err) {
    await saveAsset({ task_id: task.id, asset_key: 'video', status: 'failed', error: err.message });
    throw err;
  }
}
```

#### Nota de voz (ElevenLabs)

```typescript
async function generateVoiceAsset(task, dossier) {
  await markAssetGenerating(task.id, 'voice');
  try {
    const script = renderVoiceScript(dossier);
    const audioBlob = await elevenlabs.textToSpeech({
      voice_id: VOICES.account_manager,
      text: script,
    });
    const filename = `voice-${task.id}.mp3`;
    const { data } = await supabase.storage
      .from('voice-notes')
      .upload(filename, audioBlob, { contentType: 'audio/mpeg' });
    const publicUrl = supabase.storage.from('voice-notes').getPublicUrl(data.path).data.publicUrl;

    await saveAsset({
      task_id: task.id,
      asset_key: 'voice',
      provider: 'elevenlabs',
      url: publicUrl,
      request_payload: { voice_id: VOICES.account_manager, script },
      status: 'ready',
    });
  } catch (err) {
    await saveAsset({ task_id: task.id, asset_key: 'voice', status: 'failed', error: err.message });
    throw err;
  }
}
```

#### Micrositio (URL con parámetros)

```typescript
async function buildMicrositeUrl(task, dossier) {
  const url = new URL('https://micrositios.laneta.com/prospect-landing');
  url.searchParams.set('name', dossier.firstName);
  url.searchParams.set('company', dossier.company);
  url.searchParams.set('tier', dossier.tier);
  url.searchParams.set('ref', task.id);

  await saveAsset({
    task_id: task.id,
    asset_key: 'microsite',
    provider: 'internal',
    url: url.toString(),
    status: 'ready',
  });
}
```

#### Email HTML (Handlebars/MJML)

```typescript
async function renderEmailHtml(task, dossier) {
  const tmpl = await loadTemplate(task.template_id);
  const html = handlebars.compile(tmpl.body)(dossier);
  await saveAsset({
    task_id: task.id,
    asset_key: 'email_html',
    provider: 'internal',
    url: null,
    response_raw: { html, subject: handlebars.compile(tmpl.subject)(dossier) },
    status: 'ready',
  });
}
```

---

## 6. Cron Diario de Entrega (Día N)

### 6.1 pg_cron

```sql
SELECT cron.schedule(
  'deliver-due-tasks',
  '0 9 * * *',  -- 9:00 AM todos los días
  $$ SELECT net.http_post(
       url := 'https://tu-proyecto.supabase.co/functions/v1/execute-due-tasks',
       headers := '{"Authorization": "Bearer SERVICE_ROLE_KEY"}'::jsonb
     ) $$
);
```

### 6.2 Edge Function `execute-due-tasks`

```typescript
export async function executeDueTasks() {
  const today = new Date().toISOString().split('T')[0];

  const { data: tasks } = await supabase
    .from('sequence_tasks')
    .select(`
      *,
      run:sequence_runs!inner(status, prospect:creator_inventory(*)),
      assets:sequence_task_assets(*)
    `)
    .eq('scheduled_date', today)
    .eq('status', 'pending')
    .eq('run.status', 'active');

  for (const task of tasks) {
    // Validar que todos los assets requeridos estén ready
    const missing = task.assets.filter(a => a.status !== 'ready');
    if (missing.length > 0) {
      await markTaskFailed(task.id, `Assets no listos: ${missing.map(a => a.asset_key).join(',')}`);
      await notifyOps(task, 'asset_not_ready');
      continue;
    }

    try {
      await deliverTask(task);
      await markTaskSent(task.id);
      await logEvent(task.run_id, task.id, 'sent', { channel: task.channel });
      await updateHubSpotStep(task.run.prospect.email, task.step_number, task.channel);
    } catch (err) {
      await incrementRetry(task.id, err.message);
      if (task.retry_count >= 2) {
        await markTaskFailed(task.id, err.message);
        await notifyOps(task, 'delivery_failed');
      }
    }
  }
}

async function deliverTask(task) {
  const assets = Object.fromEntries(task.assets.map(a => [a.asset_key, a]));
  const prospect = task.run.prospect;

  switch (task.action_type) {
    case 'email_hook':
    case 'email_audit':
      return smartlead.send({
        to: prospect.email,
        template_id: task.template_id,
        variables: { video_url: assets.video?.url }
      });

    case 'wa_followup':
    case 'wa_close':
      return evolution.sendText({
        to: prospect.phone,
        text: renderWaText(task, prospect, assets)
      });

    case 'wa_voice_note':
    case 'wa_summary':
      return evolution.sendAudio({
        to: prospect.phone,
        audioUrl: assets.voice.url
      });

    case 'email_case':
    case 'email_casestudy':
    case 'email_breakup':
      return brevo.send({
        to: prospect.email,
        subject: assets.email_html.response_raw.subject,
        htmlContent: assets.email_html.response_raw.html,
        variables: { microsite_url: assets.microsite?.url }
      });

    case 'hubspot_workflow':
      return hubspot.enrollInWorkflow(task.template_id, prospect.email);

    default:
      throw new Error(`Unknown action_type: ${task.action_type}`);
  }
}
```

---

## 7. Webhooks de Respuesta (Reglas de Salida)

### 7.1 Smartlead webhook — `POST /functions/v1/smartlead-webhook`

```typescript
export async function smartleadWebhook(req: Request) {
  const payload = await req.json();
  if (payload.event !== 'reply') return new Response('ignored');

  const prospect = await findByEmail(payload.recipient_email);
  const run = await findActiveRun(prospect.id);

  await supabase.from('sequence_tasks')
    .update({ status: 'cancelled', response: 'replied' })
    .eq('run_id', run.id)
    .eq('status', 'pending');

  await supabase.from('sequence_runs')
    .update({ status: 'won', ended_reason: 'replied_email', ended_at: new Date() })
    .eq('id', run.id);

  await logEvent(run.id, null, 'replied', { source: 'smartlead', payload });
  await hubspot.updateContact(prospect.email, { laneta_status: 'won' });
  await notifySalesSlack(prospect, 'email');

  return new Response('ok');
}
```

### 7.2 Evolution API webhook — `POST /functions/v1/whatsapp-webhook`

```typescript
export async function whatsappWebhook(req: Request) {
  const payload = await req.json();
  if (payload.event !== 'messages.upsert' || payload.fromMe) return new Response('ignored');

  const prospect = await findByPhone(payload.from);
  if (!prospect) return new Response('not_found');

  const run = await findActiveRun(prospect.id);
  await cancelPendingTasks(run.id);
  await markRunWon(run.id, 'replied_whatsapp');
  await notifySalesSlack(prospect, 'whatsapp');

  return new Response('ok');
}
```

### 7.3 HubSpot webhook (meeting booked)

```typescript
export async function hubspotWebhook(req: Request) {
  const events = await req.json();
  for (const event of events) {
    if (event.subscriptionType === 'meeting.creation') {
      const contact = await hubspot.getContact(event.objectId);
      const prospect = await findByEmail(contact.email);
      const run = await findActiveRun(prospect.id);
      await cancelPendingTasks(run.id);
      await markRunWon(run.id, 'meeting_booked');
    }
  }
  return new Response('ok');
}
```

---

## 8. Rol de HubSpot (Modelo Híbrido)

```
Supabase = motor de orquestación + fuente de verdad
HubSpot  = CRM + enriquecimiento + automaciones delegadas
```

### 8.1 Qué vive en Supabase
- Definición de flujos (`sequence_template`)
- Estado de cada run (`sequence_runs`, `sequence_tasks`)
- Assets generados (`sequence_task_assets`)
- Historial completo (`sequence_events`)

### 8.2 Qué vive en HubSpot
- Contacto como entidad CRM única
- Properties con estado actual del flujo (`laneta_current_step`, `laneta_last_touch_at`)
- Workflows delegados para nurturing a largo plazo
- Vista del equipo de ventas y scoring

### 8.3 Sincronización bidireccional
- **Supabase → HubSpot:** cada step ejecutado actualiza properties del contacto
- **HubSpot → Supabase:** webhook cuando se agenda reunión, o cuando ventas marca manualmente un prospecto como "won"

---

## 9. Manejo de Errores y Reintentos

### 9.1 Generación de assets (Día 0)
Si falla la generación, el enrolamiento completo falla y se notifica al equipo. No se crea el run hasta que todos los assets estén `ready`.

### 9.2 Entrega de tareas (Día N)
- **Retry interno:** hasta 3 intentos, `retry_count` incrementa en cada fallo
- **Backoff:** segundo intento en +1 hora, tercero en +4 horas (cron suplementario cada hora escanea `status = 'pending' AND retry_count > 0`)
- **Escalamiento:** tras 3 fallos, `status = 'failed'` y notificación a Slack del equipo ops

### 9.3 Regeneración selectiva de assets
```sql
-- Marcar un asset para regenerar
UPDATE sequence_task_assets
SET status = 'pending', retry_count = 0, error = NULL
WHERE task_id = 'xxx' AND asset_key = 'voice';
```
Una función auxiliar `regenerate-failed-assets` corre cada hora y reintenta.

---

## 10. Plan de Implementación (30 días)

### Semana 1 — Infraestructura base
- [ ] Crear migrations SQL (5 tablas)
- [ ] Seedear `sequence_template` con flujo Creadores y B2B
- [ ] Configurar buckets en Supabase Storage (`voice-notes`, `videos`)
- [ ] Habilitar `pg_cron` y `pg_net`

### Semana 2 — Edge Functions de enrolamiento
- [ ] `enroll-prospect` con validación
- [ ] Generadores de asset (Sendspark, ElevenLabs, micrositio, email HTML)
- [ ] Integración con HubSpot (upsert contacto)
- [ ] Tests end-to-end con un prospecto de prueba

### Semana 3 — Cron y entrega
- [ ] `execute-due-tasks` con switch por `action_type`
- [ ] Integración Smartlead, Brevo, Evolution API
- [ ] pg_cron programado 9 AM
- [ ] Cron suplementario de reintentos cada hora

### Semana 4 — Webhooks y operación
- [ ] Webhook Smartlead (replies)
- [ ] Webhook Evolution (respuestas WA)
- [ ] Webhook HubSpot (meetings)
- [ ] Dashboard interno Supabase (vistas SQL + Retool/Metabase)
- [ ] Notificaciones Slack para ops
- [ ] Documentación interna para el equipo

---

## 11. Criterios para Migrar a Inngest en el Futuro

Revisar trimestralmente. Migrar cuando se cumpla **cualquiera** de estos disparadores:

- Volumen supera 500 prospectos nuevos por día
- Se requiere granularidad horaria (llamadas IA, timezones)
- Flujos cambian >2 veces por mes (regeneración manual se vuelve tediosa)
- Se inicia Modelo B (Data Brokerage IA) con pipelines largos de video
- Operaciones requieren replays masivos o observabilidad avanzada

La migración preserva toda la data histórica; solo se reescriben las Edge Functions de enrolamiento y cron como Inngest functions.

---

## 12. Resumen

Esta arquitectura permite arrancar **en 30 días, con $0 de costo adicional**, aprovechando 100% el stack ya contratado. El patrón de pre-materialización de assets y la separación entre preparación/entrega hacen que el sistema sea **predecible, auditable y resistente a fallos** sin necesidad de un orquestador externo.

Cuando el volumen y la complejidad justifiquen Inngest, la migración es directa gracias a que el esquema SQL y los webhooks ya hablan el mismo modelo de "tasks + events + assets" que Inngest utiliza internamente.

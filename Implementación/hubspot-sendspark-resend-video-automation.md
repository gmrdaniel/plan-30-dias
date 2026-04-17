# Automatización: HubSpot → Sendspark → Resend

**Objetivo:** Cuando un contacto de HubSpot cambia la propiedad `send_video_b2b = true`, generar automáticamente un video personalizado en Sendspark y enviarlo por email vía Resend, sin depender de HubSpot Workflows (tier pagado $800/mes).

---

## 1. Arquitectura

```
[HubSpot Contact update: send_video_b2b = true]
            │
            ▼ (webhook)
[Supabase Edge Function: video-webhook-receiver]
            │
            ├─► Valida firma del webhook de HubSpot
            ├─► Lee contacto completo (HubSpot API)
            │
            ├─► [PASO CLAVE] Crea PROSPECT en Sendspark Dynamic Campaign
            │       POST /dynamics/{id}/prospect con datos del contacto
            │       → Sendspark RENDERIZA video personalizado (nombre en overlay,
            │         voz IA diciendo el nombre, screenshot del sitio web del
            │         prospecto como background, merge tags custom)
            │
            ├─► Pollea status del render (5-60s) hasta recibir video_url final
            ├─► Llama Resend API → envía email con URL del video + thumbnail
            ├─► Actualiza HubSpot: send_video_b2b_enviado = true, send_video_b2b = false
            └─► Log en tabla Supabase: video_sends
```

**Costo total mensual estimado:** $0 (todos dentro de free tiers hasta cierto volumen)

---

## 1.1 Pre-requisito CRÍTICO: Dynamic Campaign en Sendspark

⚠️ **La API de Sendspark NO crea videos desde cero.** Personaliza un **video base pre-grabado** que debes tener listo en Sendspark ANTES de implementar esto.

### Cómo funciona la personalización en Sendspark Dynamic:

1. **Grabas 1 video base** en Sendspark (pitch genérico, 30-90s)
2. En ese video defines **elementos dinámicos**:
   - **Text overlay**: ej. "Hola {first_name}" aparece en pantalla
   - **Voz IA clonada**: Sendspark pronuncia el nombre/empresa con tu voz (si activaste voice cloning)
   - **Background dinámico**: screenshot automático del sitio web del prospecto (param `background_url` o `website_url`)
   - **Merge tags custom**: cualquier campo que quieras insertar
3. **Publicas la campaña** → obtienes `dynamic_id`
4. Por cada POST de un prospect con sus datos → Sendspark **renderiza un video único** y devuelve URL + thumbnail

### Qué tienes que verificar/hacer en Sendspark HOY:

- [ ] Video base grabado y publicado como **Dynamic Campaign**
- [ ] Variables dinámicas definidas: `first_name`, `company`, `website_url` mínimo
- [ ] Si usas voice cloning: voz entrenada y asignada a la campaña
- [ ] Copiar el `dynamic_id` (lo usaremos en la edge function)
- [ ] Probar manualmente en la UI de Sendspark: agregar 1 prospect de prueba → verificar que el video sale bien personalizado

### Payload real a Sendspark para generar el video (VERIFICADO vía pruebas API el 2026-04-16):

```http
POST https://api-gw.sendspark.com/v1/workspaces/{WORKSPACE_ID}/dynamics/{DYNAMIC_ID}/prospect
Headers:
  x-api-key: {SENDSPARK_API_KEY}
  x-api-secret: {SENDSPARK_SECRET_KEY}
  Content-Type: application/json
  Accept: application/json

Body:
{
  "processAndAuthorizeCharge": true,
  "prospectDepurationConfig": {
    "forceCreation": true,
    "payloadDepurationStrategy": "keep-last-valid"
  },
  "prospect": {
    "contactName": "Juan Pérez",
    "contactEmail": "juan@empresa.com",
    "company": "Empresa SA",
    "jobTitle": "CEO",
    "backgroundUrl": "https://empresa.com"
  }
}
```

⚠️ **Notas críticas del payload:**
- Los campos del prospect van **anidados dentro de `prospect`** (NO son top-level).
- Usa **camelCase**: `contactName`, `contactEmail`, `backgroundUrl`, `jobTitle`.
- **NO existe `first_name` / `last_name` por separado** → se unen en `contactName`.
- **NO uses `website_url`** → el campo correcto es `backgroundUrl` (y sí, Sendspark toma screenshot de esa URL para usarla como fondo dinámico del video).
- Si NO vas a usar `backgroundUrl`, **omite el campo** (no lo mandes vacío — causa 400).
- El flag `processAndAuthorizeCharge: true` autoriza el cargo por el video generado.
- `prospectDepurationConfig.forceCreation: true` permite crear aunque haya duplicados.

### Respuesta de Sendspark al POST (prospect recién creado):

La respuesta devuelve **todo el objeto de la campaña** (nombre, videoProperties, sharePage con Calendly/CTA, etc.) y dentro de `prospectList` el nuevo prospect con:

```json
{
  "prospectList": [{
    "_id": "md7b5vaqjqrpuji0rgn94jsyymsfrzbl",
    "contactName": "Juan Pérez",
    "contactEmail": "juan@empresa.com",
    "company": "Empresa SA",
    "jobTitle": "CEO",
    "backgroundUrl": "https://empresa.com/",
    "status": "saved",
    "resourcesStatus": {
      "video": { "status": "pending" },
      "campaign": { "status": "pending" },
      "lipSync": { "enable": false, "status": "pending" },
      "audioCloning": { "enable": false, "status": "pending" },
      "screenshot": { "enable": false, "status": "pending" }
    }
  }]
}
```

⚠️ **Al crear, NO recibes aún el `shareUrl`** — se genera al completarse el render.

### Polling del render (GET por email):

```http
GET https://api-gw.sendspark.com/v1/workspaces/{WORKSPACE_ID}/dynamics/{DYNAMIC_ID}/prospects/{email}
Headers:
  x-api-key: ...
  x-api-secret: ...
```

Respuesta típica durante el polling:
```json
{
  "contactEmail": "juan@empresa.com",
  "contactName": "Juan Pérez",
  "company": "Empresa SA",
  "jobTitle": "CEO",
  "backgroundUrl": "https://empresa.com/",
  "status": "queued",
  "shareUrl": null,
  "embedUrl": null,
  "id": "md7b5vaqjqrpuji0rgn94jsyymsfrzbl"
}
```

Cuando termina:
```json
{
  "status": "processing",
  "shareUrl": "https://sendspark.com/share/xxxxxxxx",
  "embedUrl": "https://sendspark.com/embed/xxxxxxxx",
  ...
}
```

### Progresión real de estados (observada en pruebas):

```
saved → queued → videotrimmed → lipsynced → processing (+ shareUrl poblado)
```

⚠️ **El status NUNCA llega a "ready"** — la señal de "video listo para enviar" es **`shareUrl != null`**, no el campo `status`.

### Timing observado en pruebas reales:

| Prueba | Prospect | Background URL | Tiempo total |
|---|---|---|---|
| 1 | Pepe Prueba / Laneta | `laneta.com` | ~40 seg |
| 2 | Juan / Laneta | `amazon.com/dp/B005IXQLDE` | ~120 seg |

**Recomendación de polling:**
- Intervalo: 10s entre polls
- Timeout: 180s (3 min) máximo
- Condición de éxito: `shareUrl` presente y no null
- Si timeout sin shareUrl → marcar `failed` y NO enviar email

### Ejemplo cURL funcional (probado):

```bash
# 1. Crear prospect (dispara el render)
curl -X POST "https://api-gw.sendspark.com/v1/workspaces/$WORKSPACE_ID/dynamics/$DYNAMIC_ID/prospect" \
  -H "x-api-key: $SENDSPARK_API_KEY" \
  -H "x-api-secret: $SENDSPARK_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "processAndAuthorizeCharge": true,
    "prospectDepurationConfig": {
      "forceCreation": true,
      "payloadDepurationStrategy": "keep-last-valid"
    },
    "prospect": {
      "contactName": "Juan Pérez",
      "contactEmail": "juan@empresa.com",
      "company": "Empresa SA",
      "jobTitle": "CEO",
      "backgroundUrl": "https://empresa.com"
    }
  }'

# 2. Pollear status hasta que shareUrl esté disponible
curl "https://api-gw.sendspark.com/v1/workspaces/$WORKSPACE_ID/dynamics/$DYNAMIC_ID/prospects/juan@empresa.com" \
  -H "x-api-key: $SENDSPARK_API_KEY" \
  -H "x-api-secret: $SENDSPARK_SECRET_KEY" \
  -H "Accept: application/json"
```

### Otros endpoints útiles confirmados:

| Método | Endpoint | Uso |
|---|---|---|
| `GET` | `/v1/auth/health` | Health check (devuelve `{"message":"everything is ok!"}`) |
| `GET` | `/v1/workspaces/{ws}/dynamics` | Lista todas las dynamic campaigns (paginado, limit 10 default) |
| `GET` | `/v1/workspaces/{ws}/dynamics/{id}` | Detalle de una campaña |
| `POST` | `/v1/workspaces/{ws}/dynamics/{id}/prospect` | Crear prospect (dispara render) |
| `GET` | `/v1/workspaces/{ws}/dynamics/{id}/prospects/{email}` | Consultar prospect por email (poll render) |
| `POST` | `/v1/workspaces/{ws}/dynamics/{id}/prospects/bulk` | Crear múltiples prospects (rate limit 1 req/min) |

### Rate limits confirmados

- Endpoints estándar: **30 req/min**
- Endpoint `/prospects/bulk`: **1 req/min**

### IDs de referencia del workspace actual (Laneta):

```
WORKSPACE_ID=kew5zq51wbt2gp37klzbdmsdk41rqpm9
```

Dynamic campaigns disponibles al 2026-04-16 (total 15):

| Nombre | Dynamic ID | Videos activos |
|---|---|---|
| pruebatiempo | `ioueuwepzdhoyknqpc3gehuo7div5w6v` | 19 |
| pepe ingles | `9nsbdrdd4ba92re6a8it0v3cpz9pt6zg` | 7 |
| PEPE | `k8cqv2xwilg9amuw2p4nh8hja2t9j0re` | 4 (probada OK) |
| ss3bwxc4q68l2ev6emnkk3qy77hyqjso | pepe ingles v2 | 2 |
| pruebaa | `orn4vbd5c8qz3drcadb6fqyb2gqav9as` | 2 |
| nugget | `he5h0clcb4qf0wnq30mqutpbt6fh7tt2` | 1 |
| creadores | `gdjzz35vb46r8xd1ien8s133gf67v7fy` | 1 |

---

## 2. Cuentas y credenciales necesarias

### 2.1 HubSpot (Free tier OK)
- [ ] **Acceso admin** al portal de HubSpot
- [ ] **Private App** creada en *Settings → Integrations → Private Apps → Create*
  - Scopes requeridos:
    - `crm.objects.contacts.read`
    - `crm.objects.contacts.write`
    - `crm.schemas.contacts.read`
  - Generar **Access Token** (empieza con `pat-na1-...`)
- [ ] **Webhook subscription** configurado en la Private App:
  - Evento: `contact.propertyChange`
  - Propiedad filtrada: `send_video_b2b`
  - Target URL: URL pública de la edge function (se llena al desplegar)

### 2.2 Sendspark ✅ (ya disponible)
- [x] **API Key** (workspace-level) — en `D:\CRM\plan_30_dias\tracker\.env.local` como `SENDSPARK_API_KEY`
- [x] **API Secret** (user-level) — en `.env.local` como `SENDSPARK_SECRET_KEY`
- [x] **Workspace ID** — en `.env.local` como `SENDSPARK_WORKSPACE_ID` (`kew5zq51wbt2gp37klzbdmsdk41rqpm9`)
- [x] **Dynamic Campaign ID** — elegir según propósito (ver tabla sección 1.1)
- [x] Rate limit: 30 req/min estándar, 1 req/min en `/prospects/bulk`
- [x] Auth y creación de prospect probados OK (Pepe: 40s, Juan: 120s)

### 2.3 Resend
- [ ] **API Key** de Resend
- [ ] **Dominio verificado** en Resend (DNS records: SPF, DKIM, DMARC)
- [ ] **Email remitente** (ej. `ventas@laneta.com`)

### 2.4 Supabase
- [ ] Proyecto existente (el del CRM)
- [ ] **Service Role Key** (para edge function)
- [ ] CLI de Supabase instalada localmente (`npm install -g supabase`)
- [ ] `supabase login` hecho

---

## 3. Propiedades custom en HubSpot

Crear en *Settings → Properties → Contact properties*:

| Label | Internal name | Field type | Uso |
|---|---|---|---|
| Send Video B2B | `send_video_b2b` | Single checkbox | Trigger: marcar = true para disparar envío |
| Video B2B Enviado | `send_video_b2b_enviado` | Single checkbox | Flag anti-duplicados (se marca automático) |
| Video B2B URL | `send_video_b2b_url` | Single-line text | URL del video generado (histórico) |
| Video B2B Fecha Envío | `send_video_b2b_fecha` | Date picker | Timestamp del envío |
| Video B2B Error | `send_video_b2b_error` | Multi-line text | Error si falló |

---

## 4. Schema Supabase

Tabla de logs para auditoría y debugging:

```sql
create table video_sends (
  id uuid primary key default gen_random_uuid(),
  hubspot_contact_id text not null,
  email text not null,
  first_name text,
  company text,
  sendspark_dynamic_id text not null,
  sendspark_prospect_id text,
  video_url text,
  status text not null check (status in ('pending','video_created','sent','failed')),
  error_message text,
  resend_email_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_video_sends_contact on video_sends(hubspot_contact_id);
create index idx_video_sends_status on video_sends(status);
```

---

## 5. Variables de entorno (Edge Function secrets)

Configurar con `supabase secrets set KEY=value`:

```
HUBSPOT_ACCESS_TOKEN=pat-na1-xxxxxxxx
HUBSPOT_WEBHOOK_SECRET=xxxxxxxx              # para validar firma
SENDSPARK_API_KEY=xxxxxxxx
SENDSPARK_API_SECRET=xxxxxxxx
SENDSPARK_WORKSPACE_ID=xxxxxxxx
SENDSPARK_DYNAMIC_ID=xxxxxxxx                # ID de tu campaña de video
RESEND_API_KEY=re_xxxxxxxx
RESEND_FROM_EMAIL=ventas@laneta.com
RESEND_FROM_NAME=Laneta
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxxxxx        # ya lo tienes en el CRM
```

---

## 6. Flujo técnico detallado

### 6.1 Webhook receiver (Edge Function)

**Endpoint:** `POST https://<project>.supabase.co/functions/v1/video-webhook`

**Lógica:**
1. Validar firma `X-HubSpot-Signature-v3` con `HUBSPOT_WEBHOOK_SECRET`
2. Parsear payload (puede traer batch de eventos)
3. Para cada evento con `propertyName == "send_video_b2b"` y `propertyValue == "true"`:
   - Llamar `GET /crm/v3/objects/contacts/{contactId}?properties=email,firstname,lastname,company`
   - Insertar row en `video_sends` con status `pending`
   - **Crear prospect en Sendspark (dispara render del video personalizado):**
     ```
     POST /v1/workspaces/{workspace_id}/dynamics/{dynamic_id}/prospect
     ```
     ```json
     {
       "processAndAuthorizeCharge": true,
       "prospectDepurationConfig": {
         "forceCreation": true,
         "payloadDepurationStrategy": "keep-last-valid"
       },
       "prospect": {
         "contactName": "Juan Pérez",
         "contactEmail": "juan@empresa.com",
         "company": "Empresa SA",
         "jobTitle": "CEO",
         "backgroundUrl": "https://empresa.com"
       }
     }
     ```
     ⚠️ En HubSpot usamos `firstname + lastname` → concatenar en `contactName`. Como `backgroundUrl` usar `website` del contacto o una URL específica (ej. la página de producto si es un e-commerce).
   - Recibe objeto con `prospectList[0]._id` (NO llega shareUrl aún).
   - **Polling del render:**
     - `GET /v1/workspaces/{workspace_id}/dynamics/{dynamic_id}/prospects/{email}`
     - Intervalo: 10s, máximo 18 intentos (~180s total)
     - Condición de éxito: **`shareUrl` presente y no null** (el campo `status` nunca llega a "ready", se queda en `processing` una vez listo)
     - Si timeout → status `failed` en Supabase, NO enviar email, escribir error en HubSpot
   - Actualizar row Supabase → status `video_created`, guardar `shareUrl` y `embedUrl`
   - Llamar Resend: `POST /emails` con template HTML que incluye URL + thumbnail
   - Actualizar row → status `sent`, guardar `resend_email_id`
   - Actualizar contacto HubSpot: `PATCH /crm/v3/objects/contacts/{contactId}`
     ```json
     {
       "properties": {
         "send_video_b2b": "false",
         "send_video_b2b_enviado": "true",
         "send_video_b2b_url": "<url>",
         "send_video_b2b_fecha": "<ISO>"
       }
     }
     ```
4. Si cualquier paso falla → status `failed`, guardar `error_message`, escribir en `send_video_b2b_error` en HubSpot

### 6.2 Template de email (Resend)

HTML simple con merge tags (hacer como template reutilizable):

```html
<p>Hola {{first_name}},</p>
<p>Grabé este video pensando en {{company}}:</p>
<p>
  <a href="{{video_url}}">
    <img src="{{video_thumbnail}}" alt="Ver video" style="max-width:500px;" />
  </a>
</p>
<p>Me encantaría tu feedback. ¿Tienes 15 min esta semana?</p>
<p>Saludos,<br/>— Laneta</p>
```

---

## 7. Consideraciones técnicas

### 7.1 Manejo de errores y retries
- Edge function debe responder `200` rápido (antes de 5s) al webhook de HubSpot
- El trabajo pesado (Sendspark + Resend) debería ir a **Supabase Queue** o background task
- Implementar retries exponenciales para llamadas a Sendspark/Resend (3 intentos)

### 7.2 Rate limits a respetar
| API | Límite |
|---|---|
| HubSpot | 100 req / 10s (Free tier) |
| Sendspark | 30 req/min |
| Resend | 10 req/s (plan free: 100 emails/día, 3,000/mes) |

### 7.3 Prevención de duplicados
- Antes de procesar, consultar `video_sends` por `hubspot_contact_id` con status `sent` en las últimas 24h → skip
- El flag `send_video_b2b_enviado` también sirve como guard

### 7.4 Seguridad
- Validar firma HubSpot (HMAC SHA-256)
- Secrets solo en Supabase secrets, nunca en código/repo
- CORS: endpoint no necesita CORS (webhook servidor-servidor)

---

## 8. Plan de implementación

**Fase 1 — Setup (30 min)**
- [ ] Crear las 5 propiedades custom en HubSpot
- [ ] Crear Private App en HubSpot con los scopes → obtener access token
- [ ] Verificar que Sendspark tenga la campaña y anotar IDs
- [ ] Verificar dominio Resend y crear API key

**Fase 2 — Supabase (45 min)**
- [ ] Crear tabla `video_sends` (migration)
- [ ] Crear edge function `video-webhook` esqueleto
- [ ] Configurar todos los secrets
- [ ] Deploy inicial para obtener URL pública

**Fase 3 — Integración (1.5 h)**
- [ ] Implementar validación de firma HubSpot
- [ ] Implementar llamada a Sendspark (crear prospect/video)
- [ ] Implementar llamada a Resend (send email)
- [ ] Implementar update de HubSpot post-envío
- [ ] Manejo de errores

**Fase 4 — Configurar webhook HubSpot (15 min)**
- [ ] En Private App → Webhooks → suscribirse a `contact.propertyChange` para `send_video_b2b`
- [ ] Apuntar a la URL de la edge function

**Fase 5 — Testing (30 min)**
- [ ] Contacto de prueba: marcar checkbox → verificar log en `video_sends`
- [ ] Revisar video generado en Sendspark dashboard
- [ ] Confirmar recepción del email
- [ ] Confirmar update de propiedades en HubSpot
- [ ] Probar caso error (Sendspark API caído, email inválido, etc.)

**Fase 6 — Producción**
- [ ] Documentar en README del CRM cómo usar la propiedad
- [ ] Entrenar al equipo: "para mandar video, marca el checkbox"
- [ ] Dashboard de monitoreo (opcional): vista en CRM con tabla `video_sends`

---

## 9. Alternativas consideradas (descartadas)

| Opción | Por qué se descartó |
|---|---|
| HubSpot Workflows nativo | Requiere Marketing Hub Pro ($800/mes) |
| Sendspark-HubSpot native integration | También depende de Workflows |
| Zapier / Make.com | Costo adicional + tier gratis muy limitado |
| Polling HubSpot cada X min | Latencia + más consumo de API |
| Albato | Solo 2 triggers y 2 actions, muy limitado |

---

## 10. Datos pendientes por entregar

Para que Claude pueda implementar esto necesito que me pases:

1. **HubSpot Access Token** (Private App)
2. **HubSpot Portal ID** (aparece en URL)
3. **Sendspark API Key + Secret**
4. **Sendspark Workspace ID + Dynamic Campaign ID**
5. **Resend API Key**
6. **Dominio verificado en Resend** y email remitente deseado
7. **Referencia Supabase project** (URL + confirmación de acceso)
8. **Texto/diseño final del email** (actualmente es placeholder)

---

## 11. Referencias

- Sendspark API: https://help.sendspark.com/en/articles/9051823-api-automatically-create-dynamic-videos-via-api
- HubSpot Webhooks: https://developers.hubspot.com/docs/api/webhooks
- HubSpot Private Apps: https://developers.hubspot.com/docs/api/private-apps
- Resend API: https://resend.com/docs/api-reference/emails/send-email
- Supabase Edge Functions: https://supabase.com/docs/guides/functions

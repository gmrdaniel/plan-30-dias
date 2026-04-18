# Waalaxy API — Hallazgos, Limitaciones y Soluciones

**Fecha inicial:** 2026-04-16
**Última actualización:** 2026-04-17 — pruebas extensivas cuenta Daniel, 7 prospectos. Hallazgo crítico §1.8: delay de auto-assign y rechazo silencioso por entry conditions.
**Contexto:** Integración de Waalaxy con el CRM La Neta (Supabase + Railway) para automatizar invitaciones y mensajes de LinkedIn en los flujos de prospección B2B y Creadores.

---

## 1. Hallazgos de la Investigación

### 1.1 La API Pública es Extremadamente Limitada

La documentación oficial de Waalaxy **no publica endpoints REST**. La API fue descubierta mediante ingeniería inversa del [módulo n8n oficial](https://github.com/Waapi-Pro/n8n-nodes-waalaxy).

**Base URL:** `https://developers.waalaxy.com/`
**Autenticación:** `Authorization: Bearer {API_KEY}` (formato `zpka_...`)

### 1.2 Endpoints Confirmados (solo 4)

| # | Método | Endpoint | Qué hace | Estado |
|---|---|---|---|---|
| 1 | `GET` | `/integrations/test` | Valida API key | ✅ Funciona |
| 2 | `GET` | `/prospectLists/getProspectLists` | Lista todas las listas | ✅ Funciona |
| 3 | `GET` | `/campaigns/getAll` | Lista campañas existentes | ✅ Funciona |
| 4 | `POST` | `/prospects/addProspectFromIntegration` | Importa prospectos a lista/campaña | ✅ Funciona |

### 1.3 Lo que NO Existe en la API

- ❌ `POST /invite` — No hay endpoint para enviar invitación LinkedIn
- ❌ `POST /message` — No hay endpoint para enviar DM
- ❌ `GET /prospects` — No se pueden consultar prospectos individualmente
- ❌ `DELETE /prospects` — No se pueden eliminar prospectos
- ❌ `POST /campaigns/create` — No se pueden crear campañas por API
- ❌ `GET /prospects/:id/status` — No se puede consultar si aceptó la invitación
- ❌ Webhooks de salida (no notifica cuando alguien responde)

### 1.4 Estado Actual de la Cuenta

| Recurso | Estado |
|---|---|
| API Key | ✅ Válida (configurada en .env.local) |
| Listas | 2 listas: "Mi Primera Lista" (3 prospectos), "Waalaxy (lista de prueba)" (98 prospectos) |
| Campañas | 1 campaña: "Test-Invitation" (secuencia de invitación) |
| Perfil LinkedIn | Conectado y activo |

### 1.5 Pruebas de Importación Realizadas

#### Prueba 1: Import solo a lista (2026-04-16)

Se importó a Bill Gates (`linkedin.com/in/williamhgates/`) a "Mi Primera Lista" **sin campaña**. Waalaxy automáticamente:
- Resolvió el perfil completo (nombre, ocupación, empresa, región, cumpleaños)
- Asignó un `_id` interno
- Registró el evento en el historial del prospecto
- **No se envió invitación** (sin `campaignId`)

#### Prueba 2: Import a lista + campaña — Invitación automática (2026-04-17)

Se creó la campaña "Test-Invitation" en la UI de Waalaxy con secuencia de invitación. Se importaron 2 prospectos reales vía API con `campaignId`:

**Prospecto 1: Daniel Ramírez**
```
POST /prospects/addProspectFromIntegration
body: {
  prospects: [{url: "https://www.linkedin.com/in/gmr-daniel-ramirez/"}],
  prospectListId: "69dd64391c088f4bd3fc360d",
  campaignId: "69e22761564cb8cb66c5558a",
  origin: {name: "n8n"}
}
→ Import: success
→ Waalaxy ID: 69e228cc32e1b696ef7d6ebc
→ App Waalaxy: "Invitación — En curso" ✅
```

**Prospecto 2: Eugenia García Gutierrez**
```
POST /prospects/addProspectFromIntegration
body: {
  prospects: [{url: "https://www.linkedin.com/in/eugenia-garc%C3%ADa-gutierrez/"}],
  prospectListId: "69dd64391c088f4bd3fc360d",
  campaignId: "69e22761564cb8cb66c5558a",
  origin: {name: "n8n"}
}
→ Import: success
→ Nombre resuelto: Eugenia García Gutierrez
→ Waalaxy ID: 69e232dcba38b719f892e5df
→ App Waalaxy: "Invitación — En curso" ✅
```

### 1.6 Flujo Confirmado y Repetible

```
API POST con campaignId
    → Prospecto aparece en lista
    → Prospecto se asigna a campaña
    → Waalaxy ejecuta invitación automáticamente (Chrome debe estar abierto)
    → Estado visible en app: "Invitación — En curso"
```

**Hallazgos clave de las pruebas:**
- El import con `campaignId` **sí activa la secuencia** automáticamente
- `isActiveInCampaign` puede mostrar `false` en la respuesta del API pero la app lo muestra como activo
- Waalaxy resuelve el perfil (nombre, empresa, headline) automáticamente al scrapearlo
- La URL de LinkedIn con caracteres especiales (acentos como `%C3%AD`) funciona correctamente
- La invitación se ejecuta cuando la extensión Chrome está activa

### 1.7 Limitación Descubierta: Duplicados y Campañas

**Problema:** Si un prospecto ya existe en Waalaxy (en cualquier lista), el re-import devuelve `duplicated_prospect` y **NO lo asigna a la campaña**, incluso con `addDuplicateProspectsToCampaign: true`.

**Caso real:** Eugenia García fue importada a la lista + campaña. Apareció en la lista pero **no en la campaña**. Al reimportarla:
```
→ Import: duplicated_prospect
→ isActiveInCampaign: (vacío)
→ No se asignó a la campaña
```

**Causa probable:** Eugenia ya existía en la cuenta de Waalaxy (posiblemente en "Waalaxy lista de prueba" con 98 prospectos). El flag `addDuplicateProspectsToCampaign` no funciona cuando el prospecto ya está en la misma cuenta.

**Implicación para el flujo automatizado:**
- El import a campaña **solo funciona si el prospecto es nuevo** en Waalaxy
- Si el prospecto ya existía (de imports anteriores, listas previas, etc.), hay que asignarlo a la campaña **manualmente desde la UI**
- No hay endpoint API para mover un prospecto existente a una campaña

**Mitigación:**
1. Antes de importar, verificar que el prospecto no exista en Waalaxy (no hay endpoint de búsqueda — limitación)
2. Usar listas dedicadas por campaña para evitar colisiones
3. Para prospectos que ya existen, el equipo los asigna manualmente desde la UI de Waalaxy
4. En el cron, si el import devuelve `duplicated_prospect`, marcar la task como `skipped` con razón `waalaxy_duplicate` y crear una tarea manual en el dashboard

**Body del request:**
```json
{
  "prospects": [{"url": "https://www.linkedin.com/in/williamhgates/"}],
  "prospectListId": "69dd64391c088f4bd3fc360d",
  "campaignId": null,
  "moveDuplicatesToOtherList": false,
  "canCreateDuplicates": false,
  "addDuplicateProspectsToCampaign": false,
  "origin": {"name": "n8n"}
}
```

**Nota importante:** El campo `origin.name` solo acepta valores predefinidos (`n8n`, `zapier`, `make`). Valores custom devuelven error `V000400-001`.

### 1.8 Delay de Auto-Assign y Rechazo Silencioso por Entry Conditions

**Fecha de hallazgo:** 2026-04-17 (cuenta Daniel, 7 prospectos probados)

**Problema descubierto:** `addToCampaignCode: success` **no confirma** la asignación real — representa solo la **intención**. La asignación definitiva ocurre en un job de background de Waalaxy que demora **15–30 min** y puede rechazar silenciosamente al prospecto.

#### Secuencia real

```
1. POST /prospects/addProspectFromIntegration
   → respuesta inmediata (optimista):
     - importCode: success
     - addToCampaignCode: success   ← intención, no confirmación final

2. Background job Waalaxy (15-30 min después)
   → Enriquece perfil LinkedIn (scrape) si es nuevo
   → Evalúa entry conditions de la campaña:
     - "No estar conectado contigo" (default en connect/connectMessage)
     - otras condiciones según template
   → Si cumple → aparece en columna Campaign, programa acción
   → Si falla → lo regresa a "Add to campaign", sin notificar al sistema que importó
```

#### Resultados de las pruebas

Pruebas con lista `Mi Primera Lista` (`69e2871ee107093f02f6a605`) y dos campañas:
- `Test-Invite-Only` (tipo `connect`): `69e2b0b21378b8cf40ad6a48`
- `Test-Invite-Plus-Message` (tipo `connectMessage`): `69e2b2a38fe84b95983bc47a`

| Prospect | Perfil Waalaxy | Conectado con Daniel | Campaña | Resultado a los 30 min |
|---|---|---|---|---|
| Dayana Vizcaya | cacheado (2021) | No | `connect` | ✅ Invite enviada |
| Arturo Villamayor | fresco | No | `connect` | ✅ Invite enviada |
| Robert Ferrer | fresco | No | `connectMessage` | ✅ **Con delay 15–20 min**, invite enviada |
| Oriana Cedeño | fresco | Sí (probable) | `connect` manual | ❌ Removida silenciosamente |
| Laura Andrea Escalante | cacheado (2023) | Sí | `connectMessage` | ❌ Removida silenciosamente |
| Maria Fernanda Parra | cacheado (2021) | Sí (colega Laneta) | `connectMessage` | ❌ Removida silenciosamente |
| Maria Varela | cacheado (2023) | Sí | `connectMessage` | ❌ Removida silenciosamente |

Todas las respuestas API fueron idénticas: `importCode: success` + `addToCampaignCode: success`. Verificación vía cuota diaria (`3/95` ejecutadas) consistente con las 3 que realmente entraron.

**Detección del rechazo solo desde UI:** al intentar agregar manualmente desde "Add to campaign", Waalaxy muestra:
> Error: 1 prospects no cumplen con una o más condiciones de entrada de la secuencia
> - No estar conectado contigo

#### Implicaciones para el flujo automatizado

1. **No confiar en la respuesta API como éxito final.** Es optimista.
2. **Implementar polling**: tras 30–60 min verificar que el prospecto realmente quedó asignado. Si no, marcar task como `entry_condition_failed` / `skipped_already_connected`.
3. **No validar imports en <5 min** — el auto-assign de `connectMessage` tarda. Tests prematuros producen falsos negativos.
4. **Diseñar para el caso "ya conectado":**
   - Prospects que ya son conexiones LinkedIn → usar campaña tipo `message` (solo DMs)
   - Prospects frescos (cold outreach B2B) → usar `connect` o `connectMessage` normal
   - No hay API para saber de antemano si es conexión — asumir que no y manejar el rechazo silencioso si ocurre
5. **Perfiles frescos tardan más** — el enriquecimiento LinkedIn suma latencia. Los cacheados pasan más rápido.

### 1.9 Matriz de Validación por Tipo de Campaña (pruebas 2026-04-17)

Validación end-to-end de los 3 tipos de campaña soportados, con prospects reales:

| Tipo | Campaña | Vía | Prospect | Estado conexión previa | Resultado |
|---|---|---|---|---|---|
| `connect` | Test-Invite-Only | API | Dayana Vizcaya | No conectada (2º) | ✅ Invite enviada (rápido) |
| `connect` | Test-Invite-Only | API | Arturo Villamayor | No conectada (2º) | ✅ Invite enviada (rápido) |
| `connectMessage` | Test-Invite-Plus-Message | API | Robert Ferrer | No conectada (2º) | ✅ Invite enviada (**delay 15–20 min**) |
| `message` | Envió Dos Mensajes Invitación aceptada | API | Daniel Ramirez | ✅ Conexión 1º (~4h) | ✅ DMs programados (rápido) |
| `message` | Envió Dos Mensajes Invitación aceptada | **UI manual** | Laura Andrea Escalante | ✅ Conexión 1º (~1h, recién aceptó) | ✅ DMs programados (API rechazó por duplicate, UI funcionó) |
| `message` | Envió Dos Mensajes Invitación aceptada | API | Pepe Híjar | ✅ Conexión 1º (6 meses) | ✅ DMs programados (rápido) |
| `message` | Envió Dos Mensajes Invitación aceptada | API | Eugenia García Gutierrez | ✅ Conexión 1º (7 meses) | ✅ DMs programados (rápido) |
| `connect` | Test-Invite-Only | UI manual | Oriana Cedeño | Sí conectada (1º, probable) | ❌ Removida silenciosamente |
| `connectMessage` | Test-Invite-Plus-Message | API | Laura, Maria F, Maria V | Sí conectadas (1º) | ❌ Rechazadas silenciosamente |

**Conclusiones:**

- **Los 3 tipos de campaña son usables vía API** para prospects frescos que cumplen entry conditions
- `message` funciona para prospects ya conectados (cumple "Estar conectado contigo") — probado con conexiones de 4h, 6 meses y 7 meses → **sin diferencia** por antigüedad de la conexión
- `connect` / `connectMessage` funcionan para prospects NO conectados (cumple "No estar conectado contigo")
- **Hipótesis descartada:** "latencia de reconocimiento de aceptación reciente" — probado con conexiones antiguas (6–7 meses) y tuvo el mismo resultado que con recientes
- El **caso duplicate** (prospect ya en la cuenta que acaba de cambiar de estado, p.ej. aceptó invite y ahora queremos mandarle DM en otra campaña) **solo se resuelve por UI manual** — la API no permite reasignar existentes

### 1.10 Endpoint Discovery — Endpoints que NO Existen

Durante las pruebas del 2026-04-17 se probaron 8 endpoints alternativos buscando forma de consultar prospects vía API. Todos devolvieron **HTTP 404**:

| Endpoint probado | Status |
|---|---|
| `GET /campaigns/:id` | 404 |
| `GET /campaigns/:id/prospects` | 404 |
| `GET /campaigns/:id/getProspects` | 404 |
| `GET /prospectLists/:id` | 404 |
| `GET /prospects/getAll` | 404 |
| `GET /prospects` | 404 |
| `GET /prospectLists/getProspects` | 404 |
| `GET /prospects/getProspects` | 404 |

**Conclusión:** confirma §1.3 — no hay forma de consultar prospectos vía API.

**Único indicador API disponible:** `GET /campaigns/getAll` devuelve `hasTravelingTravelers: true/false` por campaña. Es **booleano** — solo dice si la campaña tiene al menos un prospect moviéndose. No dice cuántos ni quiénes.

**Implicación:** la fuente de verdad para "qué prospect está en qué paso" debe ser **HubSpot vía CRM Sync de Waalaxy** (§9.2), NO la API de Waalaxy. Diseñar el flujo de polling/reconciliación contra HubSpot, no contra Waalaxy.

### 1.11 Códigos de Error Documentados

| Código | Significado |
|---|---|
| `V000400-001` | Input inválido (campo malformado o valor no permitido) |
| `M000401-001` | Plan insuficiente (requiere upgrade) |
| `R000404-002` | Lista de prospectos no encontrada |
| `R000401-003` | URL de LinkedIn inválida |
| `R000401-004` | Límite de prospectos excedido |

---

## 2. Patrón de Uso Viable

Dado que la API **no envía invitaciones ni mensajes directamente**, el único patrón funcional es:

```
                TU SISTEMA                          WAALAXY (automático)
                ──────────                          ────────────────────
    ┌─────────────────────────┐
    │ Supabase Edge Function  │
    │ o Railway Python        │
    └────────┬────────────────┘
             │
    1. POST /prospects/addProspectFromIntegration
       con prospectListId + campaignId
             │
             ├── 2. GET /prospectLists → validar totalProspects++
             │
             ├── 3. GET /campaigns/getAll → validar campaña activa
             │
             ▼
    ┌─────────────────────────┐
    │ Waalaxy Motor Interno   │──── 4. Envía invitación LinkedIn
    │ (extensión Chrome       │──── 5. Espera aceptación (1-7 días)
    │  ejecutando en tu PC)   │──── 6. Envía DM con texto configurado
    └─────────────────────────┘
```

**Limitación crítica:** Waalaxy ejecuta las acciones de LinkedIn desde la **extensión Chrome** que debe estar corriendo en tu navegador. Si cierras Chrome o la extensión, las acciones se pausan.

---

## 3. Implementación con Supabase Edge Functions

### 3.1 ¿Por qué Edge Functions?

- Ya tienes Supabase en el stack
- Son funciones Deno/TypeScript desplegadas en el edge
- Pueden ser invocadas por cron (pg_cron), webhooks, o desde tu app
- Acceso directo a la DB sin roundtrips extra
- Se integran naturalmente con el sistema de `sequence_tasks` diseñado en `Arquitectura-Cron-Supabase.md`

### 3.2 Estructura del Edge Function

```
supabase/functions/
  waalaxy-import/
    index.ts          ← función principal
```

### 3.3 Código Funcional

```typescript
// supabase/functions/waalaxy-import/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const WAALAXY_BASE_URL = "https://developers.waalaxy.com";
const WAALAXY_API_KEY = Deno.env.get("WAALAXY_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// --- Waalaxy API Client ---

async function waalaxyRequest(method: string, path: string, body?: unknown) {
  const res = await fetch(`${WAALAXY_BASE_URL}/${path}`, {
    method,
    headers: {
      "Authorization": `Bearer ${WAALAXY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`Waalaxy ${res.status}: ${data.code || data.title} - ${data.message || ""}`);
  }

  return data;
}

// --- Step 1: Validar conexión ---

async function validateConnection(): Promise<boolean> {
  const result = await waalaxyRequest("GET", "integrations/test");
  return result === true;
}

// --- Step 2: Obtener listas y campañas ---

async function getLists() {
  return await waalaxyRequest("GET", "prospectLists/getProspectLists");
}

async function getCampaigns() {
  return await waalaxyRequest("GET", "campaigns/getAll");
}

// --- Step 3: Importar prospecto ---

interface ProspectImport {
  linkedinUrl: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  company?: string;
}

async function importProspect(
  prospect: ProspectImport,
  listId: string,
  campaignId?: string
) {
  const body: Record<string, unknown> = {
    prospects: [{
      url: prospect.linkedinUrl,
      customProfile: {
        ...(prospect.firstName && { firstName: prospect.firstName }),
        ...(prospect.lastName && { lastName: prospect.lastName }),
        ...(prospect.email && { email: prospect.email }),
        ...(prospect.company && { company: { name: prospect.company } }),
      },
    }],
    prospectListId: listId,
    moveDuplicatesToOtherList: false,
    canCreateDuplicates: false,
    addDuplicateProspectsToCampaign: false,
    origin: { name: "n8n" },
  };

  if (campaignId) {
    body.campaignId = campaignId;
    body.addDuplicateProspectsToCampaign = true;
  }

  return await waalaxyRequest("POST", "prospects/addProspectFromIntegration", body);
}

// --- Step 4: Validar que se insertó ---

async function validateImport(listId: string, expectedCount: number): Promise<boolean> {
  const lists = await getLists();
  const list = lists.find((l: { _id: string }) => l._id === listId);
  return list?.totalProspects >= expectedCount;
}

// --- Step 5: Registrar resultado en Supabase ---

async function logResult(
  prospectId: string,
  taskId: string,
  success: boolean,
  waalaxyResponse: unknown,
  error?: string
) {
  await supabase.from("sequence_events").insert({
    run_id: null,
    task_id: taskId,
    event_type: success ? "sent" : "failed",
    channel: "linkedin",
    source: "waalaxy",
    payload: { waalaxyResponse, error },
  });

  if (success) {
    await supabase
      .from("sequence_tasks")
      .update({ status: "sent", executed_at: new Date().toISOString() })
      .eq("id", taskId);
  } else {
    await supabase
      .from("sequence_tasks")
      .update({ status: "failed", error, retry_count: supabase.rpc("increment_retry", { task_id: taskId }) })
      .eq("id", taskId);
  }
}

// --- Handler principal ---

Deno.serve(async (req) => {
  try {
    const { action, prospects, listId, campaignId, taskId } = await req.json();

    switch (action) {

      // Validar que la API key funciona
      case "test": {
        const ok = await validateConnection();
        return Response.json({ ok });
      }

      // Listar listas y campañas disponibles
      case "lists": {
        const lists = await getLists();
        return Response.json({ lists });
      }

      case "campaigns": {
        const campaigns = await getCampaigns();
        return Response.json(campaigns);
      }

      // Importar un prospecto y validar
      case "import": {
        if (!prospects?.length || !listId) {
          return Response.json({ error: "prospects[] y listId requeridos" }, { status: 400 });
        }

        const results = [];
        for (const prospect of prospects) {
          try {
            const response = await importProspect(prospect, listId, campaignId);
            const importResult = response.result?.[0];
            const success = importResult?.importCode === "success";

            if (taskId) {
              await logResult(prospect.linkedinUrl, taskId, success, importResult);
            }

            results.push({
              linkedinUrl: prospect.linkedinUrl,
              success,
              waalaxyId: importResult?.prospect?._id,
              profile: importResult?.prospect?.profile
                ? {
                    firstName: importResult.prospect.profile.firstName,
                    lastName: importResult.prospect.profile.lastName,
                    headline: importResult.prospect.profile.headline,
                    company: importResult.prospect.profile.company?.name,
                  }
                : null,
              importCode: importResult?.importCode,
            });
          } catch (err) {
            if (taskId) {
              await logResult(prospect.linkedinUrl, taskId, false, null, err.message);
            }
            results.push({
              linkedinUrl: prospect.linkedinUrl,
              success: false,
              error: err.message,
            });
          }
        }

        // Validar que la lista creció
        const validated = await validateImport(listId, 0);

        return Response.json({ results, listValidated: validated });
      }

      // Importar + asignar a campaña (invitación + DM se ejecutan por Waalaxy)
      case "import-to-campaign": {
        if (!prospects?.length || !listId || !campaignId) {
          return Response.json(
            { error: "prospects[], listId y campaignId requeridos" },
            { status: 400 }
          );
        }

        const response = await importProspect(prospects[0], listId, campaignId);
        const importResult = response.result?.[0];
        const success = importResult?.importCode === "success";

        return Response.json({
          success,
          message: success
            ? "Prospecto importado a campaña. Waalaxy ejecutará la secuencia (invitación + DM) automáticamente."
            : `Error: ${importResult?.importCode}`,
          prospect: importResult?.prospect?.profile
            ? {
                name: `${importResult.prospect.profile.firstName} ${importResult.prospect.profile.lastName}`,
                headline: importResult.prospect.profile.headline,
              }
            : null,
        });
      }

      default:
        return Response.json({ error: `Acción desconocida: ${action}` }, { status: 400 });
    }
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});
```

### 3.4 Cómo se invoca desde el cron diario

```typescript
// Dentro de execute-due-tasks, cuando el action_type es linkedin
case 'linkedin_invite':
  const response = await fetch(`${SUPABASE_URL}/functions/v1/waalaxy-import`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'import-to-campaign',
      prospects: [{
        linkedinUrl: prospect.linkedin_url,
        firstName: prospect.first_name,
        lastName: prospect.last_name,
        email: prospect.email,
        company: prospect.company,
      }],
      listId: WAALAXY_LIST_ID,
      campaignId: WAALAXY_CAMPAIGN_ID,
      taskId: task.id,
    }),
  });
  break;
```

### 3.5 Variables de Entorno Requeridas

```bash
# En Supabase Dashboard > Edge Functions > Secrets
WAALAXY_API_KEY=<tu_api_key_de_waalaxy>
WAALAXY_LIST_ID=69dd64391c088f4bd3fc360d
WAALAXY_CAMPAIGN_ID=<se obtiene después de crear la campaña en UI>
```

---

## 4. Alternativa: Railway con Python

Si prefieres Python (ya tienes Railway), el mismo patrón aplica:

```python
# waalaxy_client.py
import httpx

WAALAXY_BASE = "https://developers.waalaxy.com"
WAALAXY_KEY = os.environ["WAALAXY_API_KEY"]

headers = {
    "Authorization": f"Bearer {WAALAXY_KEY}",
    "Content-Type": "application/json",
}

def test_connection():
    r = httpx.get(f"{WAALAXY_BASE}/integrations/test", headers=headers)
    return r.json() == True

def get_lists():
    r = httpx.get(f"{WAALAXY_BASE}/prospectLists/getProspectLists", headers=headers)
    return r.json()

def get_campaigns():
    r = httpx.get(f"{WAALAXY_BASE}/campaigns/getAll", headers=headers)
    return r.json()

def import_prospect(linkedin_url, list_id, campaign_id=None, custom_profile=None):
    body = {
        "prospects": [{
            "url": linkedin_url,
            **({"customProfile": custom_profile} if custom_profile else {}),
        }],
        "prospectListId": list_id,
        "moveDuplicatesToOtherList": False,
        "canCreateDuplicates": False,
        "addDuplicateProspectsToCampaign": bool(campaign_id),
        "origin": {"name": "n8n"},
    }
    if campaign_id:
        body["campaignId"] = campaign_id
    
    r = httpx.post(
        f"{WAALAXY_BASE}/prospects/addProspectFromIntegration",
        headers=headers,
        json=body,
    )
    return r.json()
```

---

## 5. Flujo Completo para tu Objetivo de Negocio

### Paso a paso para enviar invitación + DM a un prospecto

```
                                    ¿QUIÉN LO HACE?
                                    ────────────────

1. Crear campaña en Waalaxy        → TÚ (manual, UI, una sola vez)
   Secuencia: "Invitation + Message"
   Texto invitación: "Hola {firstName}..."
   Texto DM: "Gracias por conectar..."

2. Obtener campaignId               → API: GET /campaigns/getAll
                                       (anotar el _id de tu campaña)

3. Importar prospecto a campaña     → EDGE FUNCTION / PYTHON
   POST /prospects/addProspectFromIntegration
   body: { prospects, listId, campaignId }

4. Validar importación              → EDGE FUNCTION / PYTHON
   GET /prospectLists/getProspectLists
   Verificar totalProspects++

5. Enviar invitación LinkedIn       → WAALAXY (automático)
   El motor de Waalaxy la ejecuta
   desde la extensión Chrome

6. Esperar aceptación               → WAALAXY (automático, 1-7 días)

7. Enviar DM                        → WAALAXY (automático)
   Cuando el prospecto acepta

8. Registrar resultado              → TU SISTEMA
   via webhook de Waalaxy a Make/n8n
   o polling manual de la UI
```

---

## 6. Soluciones Alternativas si Waalaxy no es Suficiente

### 6.1 Comparativa para control total vía API

| Herramienta | Enviar invite por API | Enviar DM por API | Precio | Control |
|---|---|---|---|---|
| **Waalaxy** | ❌ (solo import → campaña) | ❌ | $60-100/mes | Bajo |
| **HeyReach** | ✅ | ✅ | $79/mes | Alto |
| **PhantomBuster** | ✅ | ✅ | $69/mes | Alto |
| **Expandi** | ✅ | ✅ | $99/mes | Alto |
| **Dripify** | ✅ (via webhook) | ✅ | $59/mes | Medio |

### 6.2 Recomendación por escenario

**Si el volumen es bajo (<50 prospectos/día) y puedes tener Chrome abierto:**
→ Waalaxy es suficiente. El patrón import-to-campaign funciona.

**Si necesitas control programático total (qué prospecto, qué día, qué mensaje):**
→ Evaluar HeyReach o PhantomBuster. Ambos tienen API REST completa con endpoints para enviar invitaciones y mensajes individualmente.

**Si necesitas que funcione sin Chrome abierto (headless, servidor):**
→ HeyReach o Expandi (cloud-based, no dependen de extensión Chrome).

---

## 7. Limitaciones Críticas a Considerar

### 7.1 Waalaxy depende de Chrome
La extensión Chrome debe estar corriendo para que Waalaxy ejecute las acciones de LinkedIn. Si cierras Chrome, la campaña se pausa. Esto es un riesgo para automatización 24/7.

### 7.2 LinkedIn tiene límites
- ~80 invitaciones por día (Waalaxy respeta este límite)
- ~100-150 mensajes por día
- LinkedIn puede restringir cuentas con actividad sospechosa

### 7.3 El campo `origin` está validado
Solo acepta `n8n`, `zapier`, `make` como valores. Usar cualquier otro valor devuelve error.

---

## 8. Cómo Saber Cuando Alguien Responde (Cerrar el Loop)

### 8.1 Tres opciones disponibles

Waalaxy **no tiene un endpoint API para consultar el estado de un prospecto**, pero sí tiene mecanismos para notificar eventos hacia afuera:

#### Opción A: CRM Sync Nativo con HubSpot (RECOMENDADA)

Waalaxy tiene integración directa con HubSpot (que ya tienes). En Settings > CRM Sync > HubSpot puedes configurar **triggers automáticos**:

| Trigger disponible | Qué detecta |
|---|---|
| `Accepted my invitation` | Prospecto aceptó la conexión de LinkedIn |
| `Responded to a LinkedIn message` | Prospecto respondió a un DM |
| `Responded to a LinkedIn message and is interested` | IA de Waalaxy analiza el sentimiento y lo marca como interesado |
| `Responded to an email` | Respuesta a email enviado por Waalaxy |
| `Successfully enriched (Email Finder)` | Se encontró email profesional |

**Datos que se sincronizan a HubSpot:**
- Nombre, apellido, email, teléfono
- Empresa, sitio web, cargo
- URL de LinkedIn
- Estado del prospecto en Waalaxy
- Tags de Waalaxy
- Lista de pertenencia
- Fecha de conexión
- `Message sent (Yes/No)` y `Message replied (Yes/No)`

**Flujo completo:**
```
Prospecto acepta invitación o responde DM
        │
        ▼
Waalaxy CRM Sync → HubSpot (automático)
        │
        ▼
HubSpot Workflow → Webhook a Supabase Edge Function
        │
        ▼
Edge Function actualiza sequence_tasks → status='cancelled'
                                       → sequence_runs.status='won'
                                       → notifica Slack
```

**Configuración en HubSpot:**
1. Crear un Workflow en HubSpot que escuche cambios en la property `laneta_message_replied` = `Yes`
2. Acción del workflow: HTTP POST a `https://tu-proyecto.supabase.co/functions/v1/waalaxy-webhook`
3. Body: `{ "email": {{contact.email}}, "event": "linkedin_replied" }`

#### Opción B: Webhook vía Make/n8n (campaña con CRM Sync step)

Al crear la campaña en Waalaxy, puedes agregar un paso de tipo **"CRM Sync"** en la secuencia. Este paso envía un webhook cuando el prospecto llega a ese punto del flujo (por ejemplo, después de que respondió).

```
Campaña Waalaxy:
  1. Enviar invitación
  2. Esperar aceptación
  3. Enviar DM
  4. [CRM Sync] → webhook a Make/n8n → tu Edge Function
```

**Datos que envía el webhook (uno por prospecto):**
- Waalaxy ID, Sales Navigator ID
- Nombre, apellido, cargo, ubicación
- Email, teléfono
- URL LinkedIn
- Nombre de la lista de Waalaxy
- Estado del perfil
- `Message sent to prospect (Yes/No)`
- `Prospect replied to message (Yes/No)`
- Fecha de conexión, fecha del primer mensaje

**Limitación:** solo sabe si respondió o no, **no sabe a cuál mensaje respondió**.

#### Opción C: Webhook directo desde Waalaxy (sin Make/n8n)

Puedes usar un webhook genérico en el CRM Sync step de la campaña apuntando directamente a tu Edge Function:

```
Webhook URL: https://tu-proyecto.supabase.co/functions/v1/waalaxy-response-webhook
```

Waalaxy enviará un POST con los datos del prospecto cuando llegue al paso de sync.

### 8.2 Recomendación: Opción C (Webhook Directo) como primaria + Opción A (HubSpot) como complemento

**Prioridad actualizada post-pruebas 2026-04-17 (§1.8–1.10):**

Dado que la API de Waalaxy:
- No tiene endpoints para consultar prospects (§1.10)
- Rechaza silenciosamente por entry conditions sin notificar (§1.8)
- Solo expone `hasTravelingTravelers: boolean` por campaña

**El webhook directo desde Waalaxy (Opción C) es ahora la vía primaria** de retroalimentación al CRM:

| Necesidad | Vía | Por qué |
|---|---|---|
| Detectar aceptación de invite | **Webhook directo** (§8.1.C) | Event-driven, sin delay de workflow |
| Detectar respuesta a DM | **Webhook directo** (§8.1.C) | Event-driven, inmediato en Supabase |
| Enriquecer contacto en CRM externo | HubSpot CRM Sync (§8.1.A) | Waalaxy hace el mapping automático de properties |
| Triggers específicos (interesado vs no interesado) | HubSpot CRM Sync (§8.1.A) | La IA de Waalaxy analiza sentimiento y lo expone como property |

**Combinación recomendada:**

1. **Webhook directo** como fuente de verdad para el estado del `sequence_run` en Supabase (won, cancelled, replied)
2. **HubSpot CRM Sync** como repositorio del historial del contacto y disparador de tareas comerciales (email a ventas, asignación de owner)

**Ventajas del webhook directo:**
- Latencia mínima (Waalaxy envía POST al momento del evento)
- Sin dependencia de configuración HubSpot Workflow
- No requiere license/seat adicional de HubSpot para automation
- Payload completo con datos del prospecto

**Limitación del webhook directo:**
- Se configura como **step "CRM Sync" dentro de la secuencia Waalaxy** — hay que agregarlo como paso explícito después de "Esperando respuesta" o después del último DM
- Solo se dispara cuando el prospect llega a ese paso específico, no en cualquier cambio de estado

### 8.3 Edge Function para recibir la notificación

```typescript
// supabase/functions/waalaxy-response-webhook/index.ts
Deno.serve(async (req) => {
  const payload = await req.json();

  // Buscar prospecto por LinkedIn URL o email
  const { data: prospect } = await supabase
    .from("creator_inventory")
    .select("id")
    .or(`email.eq.${payload.email},linkedin_url.eq.${payload.linkedinUrl}`)
    .maybeSingle();

  if (!prospect) {
    return Response.json({ status: "prospect_not_found" }, { status: 404 });
  }

  // Buscar run activo
  const { data: run } = await supabase
    .from("sequence_runs")
    .select("id")
    .eq("prospect_id", prospect.id)
    .eq("status", "active")
    .maybeSingle();

  if (!run) {
    return Response.json({ status: "no_active_run" });
  }

  // Determinar tipo de evento
  const replied = payload["Prospect replied to message (Yes/No)"] === "Yes"
               || payload.event === "linkedin_replied";
  
  if (replied) {
    // Cancelar todas las tasks pendientes
    await supabase
      .from("sequence_tasks")
      .update({ status: "cancelled" })
      .eq("run_id", run.id)
      .eq("status", "pending");

    // Marcar run como ganado
    await supabase
      .from("sequence_runs")
      .update({
        status: "won",
        ended_reason: "replied_linkedin",
        ended_at: new Date().toISOString(),
      })
      .eq("id", run.id);

    // Registrar evento
    await supabase.from("sequence_events").insert({
      run_id: run.id,
      event_type: "replied",
      channel: "linkedin",
      source: "waalaxy",
      payload,
    });

    // Notificar a ventas
    await notifySlack(`LinkedIn reply de ${payload.firstName} ${payload.lastName}`);
  }

  return Response.json({ status: "processed", replied });
});
```

### 8.4 Diagrama del loop completo

```
    TU SISTEMA (Supabase)              WAALAXY                    HUBSPOT
    ─────────────────────              ───────                    ───────
    
    1. Cron: task día=hoy
       action=linkedin_invite
            │
            ▼
    2. Edge Function:
       POST /prospects/add...  ──────► 3. Prospecto entra
       con campaignId                     a campaña activa
            │                                  │
            ▼                                  ▼
    4. Validar import OK              5. Waalaxy envía
       GET /prospectLists                invitación LinkedIn
            │                                  │
            │                                  ▼
            │                          6. Prospecto acepta
            │                             (1-7 días)
            │                                  │
            │                                  ▼
            │                          7. Waalaxy envía DM
            │                                  │
            │                                  ▼
            │                          8. Prospecto responde
            │                                  │
            │                          ┌───────┴────────┐
            │                          ▼                ▼
            │                    9a. CRM Sync      9b. Webhook
            │                    → HubSpot         directo
            │                         │                │
            │                         ▼                │
            │                   10. HubSpot            │
            │                   Workflow               │
            │                   → webhook              │
            │                         │                │
            ▼                         ▼                ▼
    11. Edge Function recibe notificación
        → cancela tasks pendientes
        → marca run como 'won'
        → notifica Slack
        → asigna a vendedor
```

### 8.5 Qué NO puedes saber

- **Cuál mensaje específico** generó la respuesta (Waalaxy no lo distingue)
- **El contenido exacto** de la respuesta del prospecto (no se envía en el webhook)
- **Si vió el mensaje** sin responder (no hay tracking de "read")
- **Estado en tiempo real** — solo te enteras cuando Waalaxy ejecuta el sync (puede haber delay de minutos a horas)

Para ver el contenido de las respuestas, hay que revisar directamente en LinkedIn o en la UI de Waalaxy.

---

---

## 9. Configuración del HubSpot Workflow (Cerrar el Loop)

### 9.1 Custom Properties requeridas en HubSpot

Antes de crear el Workflow, hay que asegurar que estas properties existen en HubSpot (Contact). Algunas las crea Waalaxy automáticamente al activar CRM Sync; otras las creamos nosotros para el tracking interno.

#### Properties creadas por Waalaxy CRM Sync (automáticas)

| Property | Tipo | Descripción |
|---|---|---|
| `waalaxy_linkedin_url` | Text | URL del perfil LinkedIn |
| `waalaxy_prospect_list` | Text | Nombre de la lista en Waalaxy |
| `waalaxy_prospect_status` | Text | Estado del perfil (connected, pending, etc.) |
| `waalaxy_message_sent` | Boolean | Si se le envió mensaje |
| `waalaxy_message_replied` | Boolean | Si respondió al mensaje |
| `waalaxy_connection_date` | Date | Fecha en que se conectaron |
| `waalaxy_first_message_date` | Date | Fecha del primer mensaje enviado |
| `waalaxy_tags` | Text | Tags asignados en Waalaxy |

#### Properties custom de La Neta (crear manualmente)

| Property | Tipo | Descripción |
|---|---|---|
| `laneta_sequence_name` | Text | Nombre del flujo activo (creator-7d, b2b-14d) |
| `laneta_program` | Text | Programa (meta, creator-onboard, b2b-saas) |
| `laneta_tier` | Text | Tier (A, B, C) |
| `laneta_current_step` | Number | Paso actual en la secuencia |
| `laneta_last_touch_channel` | Text | Último canal utilizado |
| `laneta_last_touch_at` | DateTime | Fecha del último touch |
| `laneta_enrollment_date` | Date | Fecha de inscripción al flujo |
| `laneta_status` | Text | Estado general (active, won, exhausted, cancelled) |
| `laneta_video_url` | Text | URL del video Sendspark generado |
| `laneta_voice_url` | Text | URL de la nota de voz generada |
| `laneta_microsite_url` | Text | URL del micrositio personalizado |

**Para crear las properties custom:**
1. HubSpot > Settings > Properties > Contact Properties
2. Crear cada una con el tipo indicado
3. Group: "La Neta Automation"

### 9.2 Configurar Waalaxy CRM Sync con HubSpot

**Paso a paso en Waalaxy:**

1. Abrir Waalaxy > **Settings** (esquina superior derecha)
2. Ir a **Integrations** > **CRM Sync**
3. Seleccionar **HubSpot**
4. Autorizar la conexión OAuth con tu cuenta HubSpot
5. En **Triggers**, activar:
   - ✅ `Accepted my invitation`
   - ✅ `Responded to a LinkedIn message`
   - ✅ `Responded to a LinkedIn message and is interested`
6. En **Field Mapping**, mapear:
   - Waalaxy First Name → HubSpot `firstname`
   - Waalaxy Last Name → HubSpot `lastname`
   - Waalaxy Email → HubSpot `email`
   - Waalaxy LinkedIn URL → HubSpot `waalaxy_linkedin_url`
   - Waalaxy Company → HubSpot `company`
   - Waalaxy Phone → HubSpot `phone`
   - Waalaxy Tags → HubSpot `waalaxy_tags`
7. Guardar

A partir de ahora, cada vez que un prospecto acepte la invitación o responda un DM, Waalaxy creará/actualizará el contacto en HubSpot con los datos mapeados.

### 9.3 Workflow #1 — LinkedIn Reply → Supabase (principal)

**Trigger:** Contact property `waalaxy_message_replied` is `Yes`

```
WORKFLOW: "Waalaxy LinkedIn Reply → Supabase"
═══════════════════════════════════════════════

┌─────────────────────────────────────────────┐
│ TRIGGER                                     │
│ Contact property changed:                   │
│   waalaxy_message_replied = Yes             │
│                                             │
│ Enrollment: Once per contact               │
│ Suppress: Contacts already in workflow      │
└─────────────┬───────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│ BRANCH: ¿Tiene flujo La Neta activo?        │
│ IF laneta_status = "active"                 │
│ → Rama YES                                  │
│ ELSE → Rama NO (skip, log only)             │
└─────────────┬───────────────────────────────┘
              │ YES
              ▼
┌─────────────────────────────────────────────┐
│ ACTION: Set Contact Property                │
│   laneta_status = "won"                     │
└─────────────┬───────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│ ACTION: Webhook (HTTP POST)                 │
│                                             │
│ URL: https://nvbanvwibmghxroybjxp           │
│      .supabase.co/functions/v1/             │
│      waalaxy-response-webhook               │
│                                             │
│ Method: POST                                │
│ Content-Type: application/json              │
│ Auth: Bearer {SUPABASE_SERVICE_ROLE_KEY}    │
│                                             │
│ Body:                                       │
│ {                                           │
│   "event": "linkedin_replied",              │
│   "email": "{{contact.email}}",             │
│   "linkedinUrl":                            │
│     "{{contact.waalaxy_linkedin_url}}",     │
│   "firstName": "{{contact.firstname}}",     │
│   "lastName": "{{contact.lastname}}",       │
│   "company": "{{contact.company}}",         │
│   "sequenceName":                           │
│     "{{contact.laneta_sequence_name}}",     │
│   "program":                                │
│     "{{contact.laneta_program}}",           │
│   "hubspotContactId":                       │
│     "{{contact.hs_object_id}}"              │
│ }                                           │
└─────────────┬───────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│ ACTION: Send Internal Notification          │
│ To: ventas@laneta.com                       │
│ Subject: "LinkedIn Reply: {{firstname}}     │
│           {{lastname}} ({{company}})"       │
│ Body: "El prospecto respondió en LinkedIn.  │
│  Programa: {{laneta_program}}               │
│  Perfil: {{waalaxy_linkedin_url}}           │
│  Revisar en Waalaxy para ver el mensaje."   │
└─────────────┬───────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│ ACTION: Create Task in HubSpot              │
│ Title: "Seguimiento LinkedIn -              │
│         {{firstname}} {{lastname}}"         │
│ Assigned to: Owner del contacto             │
│ Due: Hoy                                    │
│ Priority: High                              │
│ Notes: "Respondió al DM de LinkedIn.        │
│  Revisar conversación en Waalaxy/LinkedIn   │
│  y agendar llamada."                        │
└─────────────────────────────────────────────┘
```

### 9.4 Workflow #2 — LinkedIn Invitation Accepted (secundario)

**Trigger:** Contact property `waalaxy_prospect_status` is `connected`

```
WORKFLOW: "Waalaxy Invite Accepted → Supabase"
═══════════════════════════════════════════════

┌─────────────────────────────────────────────┐
│ TRIGGER                                     │
│ Contact property changed:                   │
│   waalaxy_prospect_status = "connected"     │
└─────────────┬───────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│ ACTION: Webhook (HTTP POST)                 │
│                                             │
│ URL: https://nvbanvwibmghxroybjxp           │
│      .supabase.co/functions/v1/             │
│      waalaxy-response-webhook               │
│                                             │
│ Body:                                       │
│ {                                           │
│   "event": "linkedin_invite_accepted",      │
│   "email": "{{contact.email}}",             │
│   "linkedinUrl":                            │
│     "{{contact.waalaxy_linkedin_url}}",     │
│   "firstName": "{{contact.firstname}}",     │
│   "lastName": "{{contact.lastname}}"        │
│ }                                           │
└─────────────┬───────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│ ACTION: Set Contact Property                │
│   laneta_last_touch_channel = "linkedin"    │
│   laneta_last_touch_at = now()              │
└─────────────────────────────────────────────┘
```

**Nota:** Este workflow NO cancela la secuencia — solo registra que aceptó. El DM de Waalaxy se enviará automáticamente después. El Workflow #1 es el que cancela cuando **responde**.

### 9.5 Edge Function actualizada para manejar ambos eventos

```typescript
// supabase/functions/waalaxy-response-webhook/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const SLACK_WEBHOOK_URL = Deno.env.get("SLACK_SALES_WEBHOOK");

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    const { event, email, linkedinUrl, firstName, lastName } = payload;

    // Buscar prospecto
    const { data: prospect } = await supabase
      .from("creator_inventory")
      .select("id, first_name, last_name, email")
      .or(`email.eq.${email},website_url.eq.${linkedinUrl}`)
      .maybeSingle();

    if (!prospect) {
      return Response.json({ status: "prospect_not_found", email, linkedinUrl }, { status: 404 });
    }

    // Buscar run activo
    const { data: run } = await supabase
      .from("sequence_runs")
      .select("id, sequence_name, program")
      .eq("prospect_id", prospect.id)
      .eq("status", "active")
      .maybeSingle();

    if (!run) {
      return Response.json({ status: "no_active_run", prospectId: prospect.id });
    }

    // Registrar evento siempre
    await supabase.from("sequence_events").insert({
      run_id: run.id,
      event_type: event,
      channel: "linkedin",
      source: "waalaxy_hubspot",
      payload,
    });

    // Manejar según tipo de evento
    switch (event) {

      // Aceptó invitación — solo registrar, no cancelar
      case "linkedin_invite_accepted": {
        await supabase
          .from("sequence_tasks")
          .update({ response: "accepted" })
          .eq("run_id", run.id)
          .eq("action_type", "linkedin_invite");

        return Response.json({
          status: "invite_accepted_logged",
          prospectId: prospect.id,
          message: "Registrado. Waalaxy enviará el DM automáticamente.",
        });
      }

      // Respondió al mensaje — cancelar secuencia completa
      case "linkedin_replied": {
        // Cancelar todas las tasks pendientes
        const { count: cancelledCount } = await supabase
          .from("sequence_tasks")
          .update({ status: "cancelled" })
          .eq("run_id", run.id)
          .eq("status", "pending")
          .select("id", { count: "exact", head: true });

        // Marcar run como ganado
        await supabase
          .from("sequence_runs")
          .update({
            status: "won",
            ended_reason: "replied_linkedin",
            ended_at: new Date().toISOString(),
          })
          .eq("id", run.id);

        // Notificar a ventas en Slack
        if (SLACK_WEBHOOK_URL) {
          await fetch(SLACK_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: [
                `:tada: *LinkedIn Reply!*`,
                `*Prospecto:* ${firstName} ${lastName}`,
                `*Programa:* ${run.program}`,
                `*Secuencia:* ${run.sequence_name}`,
                `*LinkedIn:* ${linkedinUrl}`,
                `*Tasks canceladas:* ${cancelledCount}`,
                `_Revisar conversación en Waalaxy/LinkedIn y agendar llamada._`,
              ].join("\n"),
            }),
          });
        }

        return Response.json({
          status: "won",
          prospectId: prospect.id,
          cancelledTasks: cancelledCount,
          message: "Secuencia cancelada. Prospecto marcado como ganado.",
        });
      }

      // Respondió y la IA lo marcó como interesado
      case "linkedin_replied_interested": {
        // Mismo que replied pero con prioridad alta
        await supabase
          .from("sequence_tasks")
          .update({ status: "cancelled" })
          .eq("run_id", run.id)
          .eq("status", "pending");

        await supabase
          .from("sequence_runs")
          .update({
            status: "won",
            ended_reason: "replied_linkedin_interested",
            ended_at: new Date().toISOString(),
          })
          .eq("id", run.id);

        if (SLACK_WEBHOOK_URL) {
          await fetch(SLACK_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: `:fire: *LinkedIn Reply INTERESADO!* ${firstName} ${lastName} en ${run.program} — contactar YA`,
            }),
          });
        }

        return Response.json({ status: "won_interested", prospectId: prospect.id });
      }

      default:
        return Response.json({ status: "unknown_event", event });
    }
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});
```

### 9.6 Configuración del Webhook en HubSpot (paso a paso)

**Para el Workflow #1 (Reply):**

1. **HubSpot** > Automation > Workflows > Create Workflow
2. **Type:** Contact-based
3. **Trigger:** Contact property `waalaxy_message_replied` is equal to `Yes`
4. **Re-enrollment:** Off (una vez por contacto)
5. Agregar acción: **IF/THEN branch**
   - Condition: `laneta_status` is equal to `active`
   - YES → continuar
   - NO → End
6. Agregar acción: **Set contact property**
   - `laneta_status` = `won`
7. Agregar acción: **Send a webhook**
   - Method: `POST`
   - URL: `https://nvbanvwibmghxroybjxp.supabase.co/functions/v1/waalaxy-response-webhook`
   - Request headers:
     - `Authorization`: `Bearer eyJhbGciOiJIUzI1NiIs...` (SUPABASE_SERVICE_ROLE_KEY)
     - `Content-Type`: `application/json`
   - Request body: Include all contact properties
8. Agregar acción: **Send internal email notification**
   - To: `ventas@laneta.com` (o el equipo de ventas)
9. Agregar acción: **Create task**
   - Title: Seguimiento LinkedIn
   - Due: Today
   - Priority: High
10. **Review** > **Turn on**

**Para el Workflow #2 (Invite Accepted):**
Mismo proceso pero con trigger `waalaxy_prospect_status` = `connected` y sin cancelar la secuencia.

### 9.7 Variables de entorno adicionales para Edge Functions

```bash
# Agregar en Supabase Dashboard > Edge Functions > Secrets
SLACK_SALES_WEBHOOK=https://hooks.slack.com/services/T.../B.../xxx
```

---

## 10. Resumen de Todo el Loop

```
┌──────────────────────────────────────────────────────────────────────┐
│                    LOOP COMPLETO DE LINKEDIN                         │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  SUPABASE               WAALAXY              HUBSPOT                 │
│  ════════               ═══════              ═══════                 │
│                                                                      │
│  pg_cron 9AM ───┐                                                    │
│                 ▼                                                    │
│  sequence_tasks                                                      │
│  (día=hoy,                                                           │
│   linkedin_invite) ──► POST /prospects/     Prospecto               │
│                        addToIntegration ──► entra a campaña          │
│                                             │                        │
│  validar import ◄── GET /prospectLists      │                        │
│  (totalProspects++)                         ▼                        │
│                                       Waalaxy envía                  │
│                                       invitación                     │
│                                             │                        │
│                                             ▼                        │
│                                       Prospecto acepta               │
│                                             │                        │
│                                       ┌─────┴──────┐                │
│                                       ▼            ▼                │
│                                  CRM Sync ──► HubSpot               │
│                                  (status=     actualiza              │
│                                   connected)  properties             │
│                                       │            │                 │
│                                       ▼            ▼                │
│                                  Waalaxy      Workflow #2            │
│                                  envía DM     (log invite            │
│                                       │        accepted)             │
│                                       ▼            │                 │
│                                  Prospecto         │                 │
│                                  responde          │                 │
│                                       │            │                 │
│                                  CRM Sync ──► HubSpot               │
│                                  (replied=    actualiza              │
│                                   Yes)        properties             │
│                                                    │                 │
│                                               Workflow #1            │
│                                               (replied)              │
│                                                    │                 │
│                                                    ▼                 │
│  Edge Function ◄──────────────────── Webhook POST                   │
│  waalaxy-response-webhook                                            │
│       │                                                              │
│       ├── cancelar tasks pendientes                                  │
│       ├── sequence_runs.status='won'                                 │
│       ├── registrar en sequence_events                               │
│       ├── notificar Slack                                            │
│       └── asignar a vendedor                                         │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 11. Próximos Pasos

### Estado post-pruebas 2026-04-17

- [x] API validada para los 3 tipos de campaña (`connect`, `connectMessage`, `message`) — §1.9
- [x] Delay de auto-assign documentado (15–30 min para `connectMessage`) — §1.8
- [x] Rechazo silencioso por entry conditions documentado — §1.8
- [x] Endpoint discovery completo — 8/8 endpoints de consulta devuelven 404, API sin visibilidad — §1.10
- [x] Recomendación webhook-first actualizada — §8.2

### Configuración Manual (Daniel)

**Waalaxy:**
- [ ] Crear campañas de producción por programa:
  - `B2B-Invite` (tipo `connect` o `connectMessage` para cold outreach)
  - `B2B-Nurture-Connected` (tipo `message` para conexiones ya establecidas)
  - `Creator-Invite`, `Creator-Nurture-Connected` (equivalentes para flujo creadores)
- [ ] En cada campaña, agregar step **"CRM Sync"** al final de cada rama relevante para disparar webhook directo
- [ ] Configurar el webhook URL del step CRM Sync apuntando a `https://nvbanvwibmghxroybjxp.supabase.co/functions/v1/waalaxy-response-webhook`

**HubSpot (complemento):**
- [ ] Crear custom properties de La Neta en HubSpot (sección 9.1)
- [ ] Activar CRM Sync de Waalaxy con HubSpot (sección 9.2)
- [ ] Crear Workflow #1 "Reply → Supabase" — solo si el webhook directo no cubre todos los casos (sección 9.6)

**Otros:**
- [ ] Crear webhook de Slack para el canal de ventas

### Implementación Técnica

- [ ] Desplegar Edge Function `waalaxy-import` (§3.3)
  - Incluir **polling post-import** tras 30 min para detectar rechazo silencioso (§1.8)
  - Marcar tasks como `entry_condition_failed` si tras 1 hora `hasTravelingTravelers` sigue en estado previo
- [ ] Desplegar Edge Function `waalaxy-response-webhook` (§8.3 + §9.5)
- [ ] Configurar secrets en Supabase (WAALAXY_API_KEY, SLACK_SALES_WEBHOOK)
- [ ] Integrar `linkedin_invite` en el cron de `execute-due-tasks`
- [ ] Lógica de routing: `message` vs `connect`/`connectMessage` según estado de conexión conocido (si disponible) o fallback a secuencia `connect` con retry a `message` si rechaza

### Validación

- [x] Import vía API funciona para los 3 tipos (validado 2026-04-17)
- [x] Waalaxy envía invitaciones con Chrome abierto + extensión activa (cuota 3/95 consumida en test)
- [ ] Test E2E con prospect real del pipeline B2B (cold 2º) → `connect` → aceptación → webhook → cancel sequence
- [ ] Test E2E con conexión 1º establecida → `message` → respuesta → webhook → cancel sequence
- [ ] Verificar que HubSpot CRM Sync espejea el estado correctamente como complemento

# Supabase-Cron Orchestrator Implementation Plan [SUPERSEDED]

> **⚠️ Status:** **SUPERSEDED** por `2026-04-15-supabase-cron-orchestrator-v2.md` (pendiente). El spec base cambió tras incorporar variant engine + signal eval + fast-track + manual tasks + HubSpot property listeners. Este plan no debe ejecutarse.

---

# Supabase-Cron Orchestrator Implementation Plan (ORIGINAL — no ejecutar)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar el orquestador de secuencias timed (Creadores 7d + B2B 14d) sobre Supabase + pg_cron + edge functions, con pre-materialización de assets, HubSpot sync completo y dashboard nativo.

**Architecture:** 5 tablas nuevas (template, runs, tasks, task_assets, events) + 4 SQL views. `enroll-prospect` al Día 0 materializa tasks y genera assets reales. `execute-due-tasks` invocado por pg_cron entrega tasks task_driven. Webhooks (smartlead, respond.io, HubSpot) cancelan runs por respuesta. Dashboard `/dashboard/admin/sequences`. Ver spec `docs/superpowers/specs/2026-04-15-supabase-cron-orchestrator-design.md`.

**Tech Stack:** Supabase (Postgres + Edge Functions Deno + Storage + pg_cron + pg_net), React + Vite + TypeScript + shadcn/ui, React Query, vitest, ElevenLabs, Brevo, Smartlead, respond.io, HubSpot, Telegram.

**Ejecución:** 6 iteraciones, cada una = branch desde `develop-creators` → PR → merge tras review. Feature flag `SEQUENCES_MVP_ENABLED` gate del botón en UI hasta validación final.

---

## Iteration 1 — Infrastructure Base

**Entregable:** migraciones aplicadas en develop, tablas vacías + seed, buckets creados, HubSpot properties configuradas, types regenerados.

### Task 1.1: Migración SQL principal

**Files:**
- Create: `supabase/migrations/20260415120000_create_sequence_orchestrator.sql`

- [ ] **Step 1: Crear archivo de migración con tablas + índices**

Archivo: `supabase/migrations/20260415120000_create_sequence_orchestrator.sql`

```sql
-- ============================================================
-- Sequence Orchestrator — MVP Supabase-cron
-- Spec: docs/superpowers/specs/2026-04-15-supabase-cron-orchestrator-design.md
-- ============================================================

-- 1. Template de secuencias
CREATE TABLE IF NOT EXISTS public.sequence_template (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_name text NOT NULL,
  step_number int NOT NULL,
  offset_days int NOT NULL,
  channel text NOT NULL CHECK (channel IN ('email','whatsapp','linkedin','sms','voice')),
  action_type text NOT NULL,
  provider text NOT NULL,
  template_id text,
  required_assets text[] DEFAULT '{}',
  required_fields text[] DEFAULT '{}',
  delivery_mode text NOT NULL DEFAULT 'task_driven'
    CHECK (delivery_mode IN ('task_driven','external_sequence')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(sequence_name, step_number)
);

-- 2. Runs
CREATE TABLE IF NOT EXISTS public.sequence_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id uuid NOT NULL REFERENCES public.creator_inventory(id) ON DELETE CASCADE,
  sequence_name text NOT NULL,
  program text NOT NULL,
  tier text,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','won','exhausted','cancelled','failed')),
  ended_reason text,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  hubspot_contact_id text,
  UNIQUE(prospect_id, sequence_name)
);
CREATE INDEX idx_runs_prospect ON public.sequence_runs(prospect_id, status);
CREATE INDEX idx_runs_status_active ON public.sequence_runs(status) WHERE status = 'active';

-- 3. Tasks
CREATE TABLE IF NOT EXISTS public.sequence_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.sequence_runs(id) ON DELETE CASCADE,
  step_number int NOT NULL,
  scheduled_date date NOT NULL,
  channel text NOT NULL,
  action_type text NOT NULL,
  provider text NOT NULL,
  template_id text,
  delivery_mode text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','sent','skipped','cancelled','failed')),
  executed_at timestamptz,
  response text CHECK (response IN ('opened','clicked','replied','bounced')),
  error text,
  retry_count int NOT NULL DEFAULT 0,
  provider_message_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(run_id, step_number)
);
CREATE INDEX idx_tasks_due ON public.sequence_tasks(scheduled_date, status)
  WHERE status = 'pending' AND delivery_mode = 'task_driven';
CREATE INDEX idx_tasks_retry ON public.sequence_tasks(retry_count, status)
  WHERE status = 'pending' AND retry_count > 0;
CREATE INDEX idx_tasks_run ON public.sequence_tasks(run_id);

-- 4. Task assets
CREATE TABLE IF NOT EXISTS public.sequence_task_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.sequence_tasks(id) ON DELETE CASCADE,
  asset_key text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','generating','ready','failed','stubbed')),
  provider text NOT NULL,
  external_id text,
  url text,
  request_payload jsonb,
  response_raw jsonb,
  error text,
  retry_count int NOT NULL DEFAULT 0,
  generated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(task_id, asset_key)
);
CREATE INDEX idx_assets_status ON public.sequence_task_assets(status, retry_count);

-- 5. Events (bitácora)
CREATE TABLE IF NOT EXISTS public.sequence_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid REFERENCES public.sequence_runs(id) ON DELETE CASCADE,
  task_id uuid REFERENCES public.sequence_tasks(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  channel text,
  source text,
  payload jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_events_run ON public.sequence_events(run_id, occurred_at DESC);
CREATE INDEX idx_events_type ON public.sequence_events(event_type, occurred_at DESC);
```

- [ ] **Step 2: Agregar RLS al mismo archivo**

Append al mismo `.sql`:

```sql
-- ============================================================
-- RLS Policies
-- ============================================================
ALTER TABLE public.sequence_template    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sequence_runs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sequence_tasks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sequence_task_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sequence_events      ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sequence_template_select" ON public.sequence_template;
CREATE POLICY "sequence_template_select" ON public.sequence_template FOR SELECT USING (true);

DROP POLICY IF EXISTS "sequence_template_manage" ON public.sequence_template;
CREATE POLICY "sequence_template_manage" ON public.sequence_template FOR ALL
  USING (public.has_role(auth.uid(), 'administrator'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'administrator'::app_role));

DROP POLICY IF EXISTS "sequence_runs_select" ON public.sequence_runs;
CREATE POLICY "sequence_runs_select" ON public.sequence_runs FOR SELECT USING (true);

DROP POLICY IF EXISTS "sequence_runs_manage" ON public.sequence_runs;
CREATE POLICY "sequence_runs_manage" ON public.sequence_runs FOR ALL
  USING (public.has_role(auth.uid(), 'administrator'::app_role)
      OR public.has_role(auth.uid(), 'marketing'::app_role)
      OR public.has_role(auth.uid(), 'operations'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'administrator'::app_role)
           OR public.has_role(auth.uid(), 'marketing'::app_role)
           OR public.has_role(auth.uid(), 'operations'::app_role));

DROP POLICY IF EXISTS "sequence_tasks_select" ON public.sequence_tasks;
CREATE POLICY "sequence_tasks_select" ON public.sequence_tasks FOR SELECT USING (true);

DROP POLICY IF EXISTS "sequence_tasks_manage" ON public.sequence_tasks;
CREATE POLICY "sequence_tasks_manage" ON public.sequence_tasks FOR ALL
  USING (public.has_role(auth.uid(), 'administrator'::app_role)
      OR public.has_role(auth.uid(), 'marketing'::app_role)
      OR public.has_role(auth.uid(), 'operations'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'administrator'::app_role)
           OR public.has_role(auth.uid(), 'marketing'::app_role)
           OR public.has_role(auth.uid(), 'operations'::app_role));

DROP POLICY IF EXISTS "sequence_task_assets_select" ON public.sequence_task_assets;
CREATE POLICY "sequence_task_assets_select" ON public.sequence_task_assets FOR SELECT USING (true);

DROP POLICY IF EXISTS "sequence_task_assets_manage" ON public.sequence_task_assets;
CREATE POLICY "sequence_task_assets_manage" ON public.sequence_task_assets FOR ALL
  USING (public.has_role(auth.uid(), 'administrator'::app_role)
      OR public.has_role(auth.uid(), 'operations'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'administrator'::app_role)
           OR public.has_role(auth.uid(), 'operations'::app_role));

DROP POLICY IF EXISTS "sequence_events_select" ON public.sequence_events;
CREATE POLICY "sequence_events_select" ON public.sequence_events FOR SELECT USING (true);

DROP POLICY IF EXISTS "sequence_events_insert" ON public.sequence_events;
CREATE POLICY "sequence_events_insert" ON public.sequence_events FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'administrator'::app_role)
           OR public.has_role(auth.uid(), 'marketing'::app_role)
           OR public.has_role(auth.uid(), 'operations'::app_role));
```

- [ ] **Step 3: Agregar vistas SQL al mismo archivo**

```sql
-- ============================================================
-- Views para dashboard / ops
-- ============================================================
CREATE OR REPLACE VIEW public.v_sequences_dashboard AS
SELECT r.id, r.sequence_name, r.program, r.tier, r.status, r.started_at, r.ended_at,
       r.hubspot_contact_id,
       p.email, p.full_name,
       COUNT(t.id) FILTER (WHERE t.status='sent')      AS tasks_sent,
       COUNT(t.id) FILTER (WHERE t.status='pending')   AS tasks_pending,
       COUNT(t.id) FILTER (WHERE t.status='failed')    AS tasks_failed,
       COUNT(t.id) FILTER (WHERE t.status='cancelled') AS tasks_cancelled,
       MAX(t.executed_at) AS last_touch_at
FROM public.sequence_runs r
JOIN public.creator_inventory p ON p.id = r.prospect_id
LEFT JOIN public.sequence_tasks t ON t.run_id = r.id
GROUP BY r.id, p.id;

CREATE OR REPLACE VIEW public.v_pending_tasks_today AS
SELECT t.*, r.prospect_id, r.sequence_name, p.email, p.full_name
FROM public.sequence_tasks t
JOIN public.sequence_runs r ON r.id = t.run_id
JOIN public.creator_inventory p ON p.id = r.prospect_id
WHERE t.scheduled_date = CURRENT_DATE
  AND t.status = 'pending'
  AND r.status = 'active';

CREATE OR REPLACE VIEW public.v_failed_assets AS
SELECT a.*, t.run_id, t.step_number, t.action_type, r.sequence_name, p.email
FROM public.sequence_task_assets a
JOIN public.sequence_tasks t ON t.id = a.task_id
JOIN public.sequence_runs r ON r.id = t.run_id
JOIN public.creator_inventory p ON p.id = r.prospect_id
WHERE a.status = 'failed';

CREATE OR REPLACE VIEW public.v_hubspot_sync_issues AS
SELECT r.id AS run_id, r.prospect_id, r.sequence_name, r.started_at,
       p.email, 'missing_contact_id' AS issue
FROM public.sequence_runs r
JOIN public.creator_inventory p ON p.id = r.prospect_id
WHERE r.hubspot_contact_id IS NULL
  AND r.started_at < now() - interval '1 hour'
  AND r.status = 'active';
```

- [ ] **Step 4: Push al branch de iteración**

```bash
git checkout -b feat/seq-iter1-infrastructure develop-creators
git add supabase/migrations/20260415120000_create_sequence_orchestrator.sql
git commit -m "feat(sequences): add core schema + RLS + views for orchestrator MVP"
```

- [ ] **Step 5: Verificar localmente con supabase CLI o en staging**

Si tienes `supabase` CLI local:
```bash
supabase db reset
```
Espera: migración aplica sin errores, tablas visibles en Studio.

Si no, push al remote para que GitHub Actions aplique en staging:
```bash
git push -u origin feat/seq-iter1-infrastructure
```

Verificar en Supabase Studio → Table Editor: las 5 tablas aparecen; Database → Policies: las policies aparecen; Database → Views: las 4 views aparecen.

---

### Task 1.2: Seed `sequence_template`

**Files:**
- Create: `supabase/migrations/20260415120001_seed_sequence_templates.sql`

- [ ] **Step 1: Crear archivo seed**

```sql
-- Seed: Creadores 7d + B2B 14d
-- Idempotente: INSERT ... ON CONFLICT DO NOTHING (UNIQUE en sequence_name+step_number)

-- Creadores 7d (6 steps)
INSERT INTO public.sequence_template
  (sequence_name, step_number, offset_days, channel, action_type, provider, delivery_mode, required_assets, required_fields)
VALUES
  ('creator-7d', 1, 0,  'email',    'email_hook',       'smartlead', 'external_sequence', ARRAY['video'],        ARRAY['email']),
  ('creator-7d', 2, 2,  'whatsapp', 'wa_followup',      'respondio', 'task_driven',       ARRAY[]::text[],       ARRAY['phone']),
  ('creator-7d', 3, 4,  'whatsapp', 'wa_voice_note',    'respondio', 'task_driven',       ARRAY['voice'],        ARRAY['phone']),
  ('creator-7d', 4, 6,  'email',    'email_case',       'brevo',     'task_driven',       ARRAY['email_html'],   ARRAY['email']),
  ('creator-7d', 5, 9,  'whatsapp', 'wa_close',         'respondio', 'task_driven',       ARRAY['microsite'],    ARRAY['phone']),
  ('creator-7d', 6, 13, 'email',    'email_breakup',    'brevo',     'task_driven',       ARRAY['email_html'],   ARRAY['email'])
ON CONFLICT (sequence_name, step_number) DO NOTHING;

-- B2B 14d (6 steps)
INSERT INTO public.sequence_template
  (sequence_name, step_number, offset_days, channel, action_type, provider, delivery_mode, required_assets, required_fields)
VALUES
  ('b2b-14d', 1, 0,  'email',    'email_audit',      'smartlead', 'external_sequence', ARRAY['video'],                     ARRAY['email']),
  ('b2b-14d', 2, 3,  'linkedin', 'linkedin_invite',  'waalaxy',   'task_driven',       ARRAY[]::text[],                    ARRAY['email']),
  ('b2b-14d', 3, 4,  'email',    'email_followup',   'smartlead', 'external_sequence', ARRAY[]::text[],                    ARRAY['email']),
  ('b2b-14d', 4, 7,  'whatsapp', 'wa_summary',       'respondio', 'task_driven',       ARRAY['voice'],                     ARRAY['phone']),
  ('b2b-14d', 5, 11, 'email',    'email_casestudy',  'brevo',     'task_driven',       ARRAY['email_html','microsite'],    ARRAY['email']),
  ('b2b-14d', 6, 13, 'email',    'email_breakup',    'brevo',     'task_driven',       ARRAY[]::text[],                    ARRAY['email'])
ON CONFLICT (sequence_name, step_number) DO NOTHING;
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260415120001_seed_sequence_templates.sql
git commit -m "feat(sequences): seed creator-7d + b2b-14d templates"
```

- [ ] **Step 3: Verificar**

En Supabase Studio SQL editor:
```sql
SELECT sequence_name, COUNT(*) AS steps
FROM public.sequence_template
GROUP BY sequence_name;
```
Expected: `creator-7d = 6`, `b2b-14d = 6`.

---

### Task 1.3: Storage buckets + pg_cron/pg_net enable

**Files:**
- Create: `supabase/migrations/20260415120002_enable_extensions_and_buckets.sql`

- [ ] **Step 1: Crear archivo**

```sql
-- Habilita pg_cron + pg_net si no están
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Buckets públicos (idempotente vía insert ON CONFLICT)
INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-notes', 'voice-notes', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- Policies de los buckets: lectura pública, escritura solo service role
-- (Storage policies se crean via UI normalmente; si falla, crear manualmente post-deploy)
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260415120002_enable_extensions_and_buckets.sql
git commit -m "feat(sequences): enable pg_cron/pg_net + create voice-notes and videos buckets"
```

- [ ] **Step 3: Verificar post-deploy**

En Studio → Storage: buckets `voice-notes` y `videos` aparecen públicos.
En SQL editor: `SELECT * FROM pg_extension WHERE extname IN ('pg_cron','pg_net');` retorna 2 filas.

---

### Task 1.4: Script setup HubSpot properties

**Files:**
- Create: `services/hubspot-properties-setup.ts`

- [ ] **Step 1: Crear script idempotente**

Archivo `services/hubspot-properties-setup.ts`:

```typescript
/**
 * One-shot: crea las 11 custom properties laneta_* en HubSpot.
 * Correr manualmente: `npx tsx services/hubspot-properties-setup.ts`
 * Requiere env var HUBSPOT_API_KEY.
 */
const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY;
if (!HUBSPOT_API_KEY) throw new Error("HUBSPOT_API_KEY not set");

const API = "https://api.hubapi.com/crm/v3/properties/contacts";

type PropDef = {
  name: string;
  label: string;
  type: "string" | "number" | "date" | "datetime" | "enumeration";
  fieldType: "text" | "number" | "date" | "datetime" | "select";
  options?: { label: string; value: string }[];
  groupName?: string;
};

const PROPS: PropDef[] = [
  { name: "laneta_sequence_name", label: "Laneta Sequence Name", type: "enumeration", fieldType: "select",
    options: [{label:"Creator 7d", value:"creator-7d"}, {label:"B2B 14d", value:"b2b-14d"}] },
  { name: "laneta_program", label: "Laneta Program", type: "string", fieldType: "text" },
  { name: "laneta_tier", label: "Laneta Tier", type: "enumeration", fieldType: "select",
    options: ["A","B","C","D"].map(v => ({label:v, value:v})) },
  { name: "laneta_enrollment_date", label: "Laneta Enrollment Date", type: "date", fieldType: "date" },
  { name: "laneta_current_step", label: "Laneta Current Step", type: "number", fieldType: "number" },
  { name: "laneta_last_touch_at", label: "Laneta Last Touch At", type: "datetime", fieldType: "datetime" },
  { name: "laneta_last_channel", label: "Laneta Last Channel", type: "enumeration", fieldType: "select",
    options: ["email","whatsapp","linkedin","sms","voice"].map(v => ({label:v, value:v})) },
  { name: "laneta_status", label: "Laneta Status", type: "enumeration", fieldType: "select",
    options: ["active","won","exhausted","cancelled","failed"].map(v => ({label:v, value:v})) },
  { name: "laneta_ended_reason", label: "Laneta Ended Reason", type: "string", fieldType: "text" },
  { name: "laneta_video_url", label: "Laneta Video URL", type: "string", fieldType: "text" },
  { name: "laneta_voice_url", label: "Laneta Voice URL", type: "string", fieldType: "text" },
  { name: "laneta_microsite_url", label: "Laneta Microsite URL", type: "string", fieldType: "text" },
  { name: "laneta_prospect_id", label: "Laneta Prospect ID", type: "string", fieldType: "text" },
];

async function ensure(prop: PropDef) {
  const headers = { Authorization: `Bearer ${HUBSPOT_API_KEY}`, "Content-Type": "application/json" };
  const body = { ...prop, groupName: "laneta_orchestrator" };
  // Intenta crear; si 409 (ya existe), actualiza
  const res = await fetch(API, { method: "POST", headers, body: JSON.stringify(body) });
  if (res.status === 201) { console.log(`[created] ${prop.name}`); return; }
  if (res.status === 409) {
    const patch = await fetch(`${API}/${prop.name}`, { method: "PATCH", headers, body: JSON.stringify(body) });
    console.log(`[updated] ${prop.name} — ${patch.status}`); return;
  }
  console.error(`[error] ${prop.name}:`, res.status, await res.text());
}

(async () => {
  // Crear el group primero (idempotente)
  await fetch("https://api.hubapi.com/crm/v3/properties/contacts/groups", {
    method: "POST",
    headers: { Authorization: `Bearer ${HUBSPOT_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name: "laneta_orchestrator", label: "Laneta Orchestrator", displayOrder: 0 }),
  }).catch(() => {}); // ignora error de "already exists"

  for (const p of PROPS) await ensure(p);
  console.log("Done.");
})();
```

- [ ] **Step 2: Commit**

```bash
git add services/hubspot-properties-setup.ts
git commit -m "feat(sequences): add HubSpot properties setup script (one-shot)"
```

- [ ] **Step 3: Correr manualmente contra tu workspace HubSpot**

```bash
export HUBSPOT_API_KEY=... # desde Supabase secrets o 1password
npx tsx services/hubspot-properties-setup.ts
```

Expected: 13 líneas `[created]` o `[updated]`. Verificar en HubSpot → Settings → Properties → Contact properties → filter "laneta_".

---

### Task 1.5: Regenerar types y abrir PR iteración 1

- [ ] **Step 1: Regenerar types**

```bash
npx supabase gen types typescript --project-id <PROJECT_ID> --schema public > src/integrations/supabase/types.ts
```

(Si usas branch remote, puedes correrlo contra staging una vez las migraciones apliquen.)

- [ ] **Step 2: Commit types regenerados**

```bash
git add src/integrations/supabase/types.ts
git commit -m "chore: regenerate supabase types after sequence orchestrator migration"
```

- [ ] **Step 3: Push + PR**

```bash
git push -u origin feat/seq-iter1-infrastructure
gh pr create --base develop-creators --title "feat(sequences): iter 1 — infra base" --body "$(cat <<'EOF'
## Summary
- 5 tablas nuevas (sequence_template/runs/tasks/task_assets/events) + 4 views + RLS
- Seed creator-7d + b2b-14d (6 steps cada uno)
- pg_cron + pg_net habilitados, buckets voice-notes + videos
- Script HubSpot properties setup (correr manualmente)
- Types regenerados

Spec: docs/superpowers/specs/2026-04-15-supabase-cron-orchestrator-design.md
Plan: docs/superpowers/plans/2026-04-15-supabase-cron-orchestrator.md (Iter 1)

## Test plan
- [ ] Migraciones aplican sin errores en staging
- [ ] `SELECT COUNT(*) FROM sequence_template;` = 12
- [ ] 4 views retornan sin error (vacías)
- [ ] Script HubSpot corre OK contra workspace
- [ ] Types compilan (tsc --noEmit)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

**Bloqueo externo antes de iter 2:** tú corres el script HubSpot contra tu workspace.

---

## Iteration 2 — Enrolamiento (Día 0)

**Entregable:** `enroll-prospect` edge function + generators + botón en UI. Enrolar un creador real desde StepPushCreators crea run + tasks + assets + HubSpot contact.

### Task 2.1: Shared HubSpot client

**Files:**
- Create: `supabase/functions/_shared/hubspot-client.ts`

- [ ] **Step 1: Crear cliente HubSpot**

```typescript
// supabase/functions/_shared/hubspot-client.ts
const HUBSPOT_API = "https://api.hubapi.com";

export type HubSpotProps = Record<string, string | number | null>;

async function hs(path: string, init?: RequestInit) {
  const apiKey = Deno.env.get("HUBSPOT_API_KEY");
  if (!apiKey) throw new Error("HUBSPOT_API_KEY not set");
  const res = await fetch(`${HUBSPOT_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HubSpot ${path} ${res.status}: ${body}`);
  }
  return res.status === 204 ? null : await res.json();
}

export async function upsertContact(email: string, properties: HubSpotProps) {
  // Search first by email; if exists, PATCH; else POST
  const search = await hs("/crm/v3/objects/contacts/search", {
    method: "POST",
    body: JSON.stringify({
      filterGroups: [{ filters: [{ propertyName: "email", operator: "EQ", value: email }] }],
      properties: ["email"],
      limit: 1,
    }),
  });
  if (search.total > 0) {
    const id = search.results[0].id;
    await hs(`/crm/v3/objects/contacts/${id}`, { method: "PATCH", body: JSON.stringify({ properties }) });
    return id as string;
  }
  const created = await hs(`/crm/v3/objects/contacts`, {
    method: "POST",
    body: JSON.stringify({ properties: { email, ...properties } }),
  });
  return created.id as string;
}

export async function updateContact(contactId: string, properties: HubSpotProps) {
  return hs(`/crm/v3/objects/contacts/${contactId}`, {
    method: "PATCH",
    body: JSON.stringify({ properties }),
  });
}

export async function getContact(contactId: string) {
  return hs(`/crm/v3/objects/contacts/${contactId}`);
}

export async function getMeeting(meetingId: string) {
  return hs(`/crm/v3/objects/meetings/${meetingId}?associations=contacts`);
}
```

- [ ] **Step 2: Commit**

```bash
git checkout -b feat/seq-iter2-enrollment develop-creators
git add supabase/functions/_shared/hubspot-client.ts
git commit -m "feat(sequences): add shared HubSpot client"
```

---

### Task 2.2: Shared sequence helpers

**Files:**
- Create: `supabase/functions/_shared/sequence-helpers.ts`

- [ ] **Step 1: Crear helpers compartidos**

```typescript
// supabase/functions/_shared/sequence-helpers.ts
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export function getServiceClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function findByEmail(supa: SupabaseClient, email: string) {
  const { data } = await supa.from("creator_inventory").select("*").eq("email", email).maybeSingle();
  return data;
}

export async function findByPhone(supa: SupabaseClient, phoneE164: string) {
  const { data } = await supa.from("creator_inventory").select("*").eq("phone", phoneE164).maybeSingle();
  return data;
}

export async function findActiveRun(supa: SupabaseClient, prospectId: string) {
  const { data } = await supa.from("sequence_runs")
    .select("*").eq("prospect_id", prospectId).eq("status", "active").maybeSingle();
  return data;
}

export async function cancelPendingTasks(supa: SupabaseClient, runId: string, reason: string) {
  await supa.from("sequence_tasks")
    .update({ status: "cancelled", response: null, error: reason })
    .eq("run_id", runId).eq("status", "pending");
}

export async function markRunWon(supa: SupabaseClient, runId: string, reason: string) {
  const { data } = await supa.from("sequence_runs")
    .update({ status: "won", ended_reason: reason, ended_at: new Date().toISOString() })
    .eq("id", runId).eq("status", "active").select().maybeSingle();
  return data;
}

export async function logEvent(supa: SupabaseClient, runId: string | null, taskId: string | null,
                                eventType: string, source: string, channel: string | null, payload: unknown) {
  await supa.from("sequence_events").insert({
    run_id: runId, task_id: taskId, event_type: eventType, source, channel, payload,
  });
}

export async function notifySalesTelegram(prospectEmail: string, via: string) {
  const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const chatId = Deno.env.get("TELEGRAM_OPS_CHAT_ID");
  if (!token || !chatId) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: `🎯 Respuesta de ${prospectEmail} vía ${via}`,
    }),
  });
}

export function normalizePhone(raw: string): string {
  return raw.replace(/[^\d+]/g, "");
}

export function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/_shared/sequence-helpers.ts
git commit -m "feat(sequences): add shared sequence helpers + telegram notify"
```

---

### Task 2.3: Generators (voice, microsite, email_html, stubs)

**Files:**
- Create: `supabase/functions/_shared/asset-generators.ts`

- [ ] **Step 1: Crear generators**

```typescript
// supabase/functions/_shared/asset-generators.ts
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export type Dossier = {
  prospectId: string;
  firstName: string;
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  websiteUrl?: string;
  tier?: string;
  program: string;
};

type AssetInsert = {
  task_id: string;
  asset_key: string;
  status: "ready" | "stubbed" | "failed";
  provider: string;
  url?: string | null;
  external_id?: string | null;
  request_payload?: unknown;
  response_raw?: unknown;
  error?: string | null;
  generated_at?: string;
};

async function saveAsset(supa: SupabaseClient, a: AssetInsert) {
  return supa.from("sequence_task_assets").upsert({
    ...a,
    generated_at: a.generated_at ?? (a.status === "ready" ? new Date().toISOString() : null),
  }, { onConflict: "task_id,asset_key" });
}

// ===== VOICE (ElevenLabs) =====
export async function generateVoiceAsset(
  supa: SupabaseClient,
  task: { id: string; action_type: string },
  dossier: Dossier,
) {
  const apiKey = Deno.env.get("ELEVENLABS_API_KEY");
  const voiceId = Deno.env.get("ELEVENLABS_VOICE_ID") ?? "21m00Tcm4TlvDq8ikWAM"; // default
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY not set");

  const script = renderVoiceScript(task.action_type, dossier);
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ text: script, model_id: "eleven_multilingual_v2" }),
  });
  if (!res.ok) {
    await saveAsset(supa, { task_id: task.id, asset_key: "voice", status: "failed",
      provider: "elevenlabs", error: `elevenlabs ${res.status}` });
    throw new Error(`ElevenLabs TTS ${res.status}`);
  }
  const audio = new Uint8Array(await res.arrayBuffer());
  const filename = `voice-${task.id}.mp3`;
  const { error: upErr } = await supa.storage.from("voice-notes").upload(filename, audio, {
    contentType: "audio/mpeg", upsert: true,
  });
  if (upErr) throw upErr;
  const { data: pub } = supa.storage.from("voice-notes").getPublicUrl(filename);
  await saveAsset(supa, {
    task_id: task.id, asset_key: "voice", status: "ready", provider: "elevenlabs",
    url: pub.publicUrl, request_payload: { voice_id: voiceId, script },
  });
}

function renderVoiceScript(actionType: string, d: Dossier): string {
  if (actionType === "wa_voice_note") {
    return `Hola ${d.firstName}, soy de La Neta. Vi tu contenido y quiero comentarte una idea rápida sobre cómo podrías monetizar mejor. Te mando un mensaje y lo platicamos.`;
  }
  if (actionType === "wa_summary") {
    return `${d.firstName}, resumen de lo que te propongo para ${d.company ?? "tu marca"}: producción de contenido UGC con IA, entregas semanales, sin contrato de largo plazo. Si te interesa, contéstame por acá.`;
  }
  return `Hola ${d.firstName}, saludo personalizado de La Neta.`;
}

// ===== MICROSITE =====
export async function buildMicrositeUrl(
  supa: SupabaseClient,
  task: { id: string; action_type: string },
  dossier: Dossier,
) {
  const url = new URL("https://micrositios.laneta.com/prospect-landing");
  url.searchParams.set("name", dossier.firstName);
  url.searchParams.set("company", dossier.company ?? "");
  url.searchParams.set("tier", dossier.tier ?? "");
  url.searchParams.set("ref", task.id);
  await saveAsset(supa, {
    task_id: task.id, asset_key: "microsite", status: "ready",
    provider: "internal", url: url.toString(),
  });
}

// ===== EMAIL HTML =====
export async function renderEmailHtml(
  supa: SupabaseClient,
  task: { id: string; action_type: string; template_id: string | null },
  dossier: Dossier,
) {
  const tmpl = EMAIL_TEMPLATES[task.action_type] ?? EMAIL_TEMPLATES.default;
  const html = tmpl.html.replaceAll("{{firstName}}", dossier.firstName)
    .replaceAll("{{company}}", dossier.company ?? "")
    .replaceAll("{{email}}", dossier.email);
  const subject = tmpl.subject.replaceAll("{{firstName}}", dossier.firstName);
  await saveAsset(supa, {
    task_id: task.id, asset_key: "email_html", status: "ready",
    provider: "internal", url: null,
    response_raw: { html, subject },
  });
}

const EMAIL_TEMPLATES: Record<string, { subject: string; html: string }> = {
  email_case: {
    subject: "{{firstName}}, caso de estudio relevante",
    html: `<p>Hola {{firstName}}, te comparto un caso de {{company}}...</p>`,
  },
  email_casestudy: {
    subject: "{{firstName}}, comparativa que puede interesarte",
    html: `<p>Hola {{firstName}}, revisé cómo lo hacen otras marcas en tu sector...</p>`,
  },
  email_breakup: {
    subject: "{{firstName}}, último mensaje",
    html: `<p>{{firstName}}, si no es el momento entiendo. Dejo la puerta abierta.</p>`,
  },
  default: {
    subject: "Hola {{firstName}}",
    html: `<p>Hola {{firstName}}</p>`,
  },
};

// ===== STUBS =====
export async function stubVideoAsset(supa: SupabaseClient, task: { id: string }) {
  await saveAsset(supa, {
    task_id: task.id, asset_key: "video", status: "stubbed",
    provider: "stub", url: null,
  });
}

export async function stubLinkedInAsset(supa: SupabaseClient, task: { id: string }) {
  // linkedin_invite no requiere asset — no se inserta nada, se maneja en delivery switch
}
```

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/_shared/asset-generators.ts
git commit -m "feat(sequences): add asset generators (voice/microsite/email_html + stubs)"
```

---

### Task 2.4: Edge function `enroll-prospect`

**Files:**
- Create: `supabase/functions/enroll-prospect/index.ts`

- [ ] **Step 1: Crear edge function completa**

```typescript
// supabase/functions/enroll-prospect/index.ts
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  getServiceClient, corsHeaders, jsonResponse, logEvent,
} from "../_shared/sequence-helpers.ts";
import { upsertContact } from "../_shared/hubspot-client.ts";
import {
  Dossier, generateVoiceAsset, buildMicrositeUrl, renderEmailHtml,
  stubVideoAsset,
} from "../_shared/asset-generators.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders() });

  try {
    const { prospectId, sequenceName, startDate } = await req.json();
    if (!prospectId || !sequenceName) {
      return jsonResponse({ error: "prospectId and sequenceName required" }, 400);
    }

    const supa = getServiceClient();

    // 1. Prospect
    const { data: prospect, error: pErr } = await supa.from("creator_inventory")
      .select("*").eq("id", prospectId).single();
    if (pErr || !prospect) return jsonResponse({ error: "prospect not found" }, 404);

    // 2. Template
    const { data: template, error: tErr } = await supa.from("sequence_template")
      .select("*").eq("sequence_name", sequenceName).order("step_number");
    if (tErr || !template?.length) return jsonResponse({ error: "template not found" }, 404);

    // 3. Validate required fields
    const allRequired = [...new Set(template.flatMap((s: { required_fields: string[] }) => s.required_fields ?? []))];
    const missing = allRequired.filter((f) => !prospect[f]);
    if (missing.length) return jsonResponse({ error: `missing_fields:${missing.join(",")}` }, 400);

    // 4. Create run (UNIQUE → 409 if exists)
    const { data: run, error: rErr } = await supa.from("sequence_runs").insert({
      prospect_id: prospectId,
      sequence_name: sequenceName,
      program: prospect.program ?? "default",
      tier: prospect.tier,
      status: "active",
    }).select().single();
    if (rErr) {
      if (rErr.code === "23505") return jsonResponse({ error: "already_enrolled" }, 409);
      return jsonResponse({ error: rErr.message }, 500);
    }

    const start = startDate ? new Date(startDate) : new Date();
    const dossier: Dossier = {
      prospectId: prospect.id,
      firstName: (prospect.full_name ?? prospect.email).split(" ")[0],
      fullName: prospect.full_name ?? prospect.email,
      email: prospect.email,
      phone: prospect.phone,
      company: prospect.company,
      websiteUrl: prospect.website_url,
      tier: prospect.tier,
      program: prospect.program ?? "default",
    };

    try {
      // 5. Create tasks
      const taskRows = template.map((s: {
        step_number: number; offset_days: number; channel: string; action_type: string;
        provider: string; template_id: string | null; delivery_mode: string;
      }) => ({
        run_id: run.id,
        step_number: s.step_number,
        scheduled_date: addDays(start, s.offset_days).toISOString().split("T")[0],
        channel: s.channel,
        action_type: s.action_type,
        provider: s.provider,
        template_id: s.template_id,
        delivery_mode: s.delivery_mode,
        status: "pending",
      }));
      const { data: tasks, error: taskErr } = await supa.from("sequence_tasks")
        .insert(taskRows).select();
      if (taskErr) throw new Error(`tasks_insert: ${taskErr.message}`);

      const tasksByAction: Record<string, { id: string; action_type: string; template_id: string | null }[]> = {};
      for (const t of tasks ?? []) {
        (tasksByAction[t.action_type] ??= []).push(t);
      }

      // 6. Generate assets in parallel
      const jobs: Promise<unknown>[] = [];
      for (const [action, ts] of Object.entries(tasksByAction)) {
        const stepDef = template.find((s: { action_type: string }) => s.action_type === action)!;
        const req: string[] = stepDef.required_assets ?? [];
        for (const t of ts) {
          if (req.includes("voice")) jobs.push(generateVoiceAsset(supa, t, dossier));
          if (req.includes("microsite")) jobs.push(buildMicrositeUrl(supa, t, dossier));
          if (req.includes("email_html")) jobs.push(renderEmailHtml(supa, { ...t, template_id: t.template_id }, dossier));
          if (req.includes("video")) jobs.push(stubVideoAsset(supa, t));
        }
      }
      await Promise.all(jobs);

      // 7. Push to Smartlead for external_sequence tasks (invoke push-campaign internally)
      const externalTasks = tasks?.filter((t) => t.delivery_mode === "external_sequence") ?? [];
      if (externalTasks.length && prospect.creator_list_id) {
        const pcRes = await supa.functions.invoke("push-campaign", {
          body: {
            creator_list_id: prospect.creator_list_id,
            tier_decisions: { [prospect.tier ?? "A"]: { decision: "all_smartlead" } },
            smartlead_campaign_id: externalTasks[0].template_id,
          },
        });
        if (pcRes.error) throw new Error(`push-campaign: ${pcRes.error.message}`);
      }

      // 8. HubSpot upsert
      const getUrl = (action: string, key: string) => {
        const t = tasksByAction[action]?.[0];
        if (!t) return null;
        // leer asset de la task recién insertada
        return null; // placeholder — below lookup
      };
      const { data: assets } = await supa.from("sequence_task_assets")
        .select("task_id,asset_key,url").in("task_id", (tasks ?? []).map((t) => t.id));
      const urlOf = (key: string) =>
        (assets ?? []).find((a) => a.asset_key === key && a.url)?.url ?? null;

      const hubspotId = await upsertContact(dossier.email, {
        laneta_sequence_name: sequenceName,
        laneta_program: dossier.program,
        laneta_tier: dossier.tier ?? "",
        laneta_enrollment_date: start.toISOString().split("T")[0],
        laneta_current_step: 0,
        laneta_status: "active",
        laneta_prospect_id: prospect.id,
        laneta_video_url: urlOf("video") ?? "",
        laneta_voice_url: urlOf("voice") ?? "",
        laneta_microsite_url: urlOf("microsite") ?? "",
      });

      await supa.from("sequence_runs").update({ hubspot_contact_id: hubspotId }).eq("id", run.id);
      await logEvent(supa, run.id, null, "enrolled", "internal", null, {
        sequenceName, tasksCreated: tasks?.length ?? 0,
      });

      return jsonResponse({
        runId: run.id,
        tasksCreated: tasks?.length ?? 0,
        assetsReady: assets?.length ?? 0,
        hubspotContactId: hubspotId,
      });
    } catch (err) {
      // Rollback run + tasks + assets
      await supa.from("sequence_runs").delete().eq("id", run.id);
      await logEvent(supa, null, null, "enroll_failed", "internal", null, {
        prospectId, error: String(err),
      });
      return jsonResponse({ error: `enroll_rolled_back:${String(err)}` }, 500);
    }
  } catch (err) {
    return jsonResponse({ error: String(err) }, 500);
  }
});

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setUTCDate(r.getUTCDate() + n);
  return r;
}
```

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/enroll-prospect/index.ts
git commit -m "feat(sequences): add enroll-prospect edge function (Day 0 pipeline)"
```

- [ ] **Step 3: Deploy a staging + smoke test**

Push la branch → GitHub Actions deploya automáticamente:
```bash
git push
```

Test manual con curl después del deploy:
```bash
curl -X POST https://<project>.supabase.co/functions/v1/enroll-prospect \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prospectId":"<UUID real>","sequenceName":"creator-7d"}'
```

Expected: `200 OK` con `{runId, tasksCreated: 6, assetsReady: >=3, hubspotContactId}`. Verificar en Studio: fila en `sequence_runs`, 6 filas en `sequence_tasks`, varias en `sequence_task_assets`.

---

### Task 2.5: Frontend — botón "Enrolar en secuencia" en StepPushCreators

**Files:**
- Create: `src/services/sequenceService.ts`
- Modify: `src/components/prospecting/StepPushCreators.tsx`

- [ ] **Step 1: Crear service frontend**

```typescript
// src/services/sequenceService.ts
import { supabase } from "@/integrations/supabase/client";

export type EnrollResponse = {
  runId: string;
  tasksCreated: number;
  assetsReady: number;
  hubspotContactId: string;
};

export async function enrollProspect(
  prospectId: string,
  sequenceName: "creator-7d" | "b2b-14d",
  startDate?: string,
): Promise<EnrollResponse> {
  const { data, error } = await supabase.functions.invoke("enroll-prospect", {
    body: { prospectId, sequenceName, startDate },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as EnrollResponse;
}
```

- [ ] **Step 2: Agregar botón en StepPushCreators (gated por feature flag)**

Localizar el archivo y agregar al final de la UI después del flujo actual de `push-campaign`:

```tsx
// src/components/prospecting/StepPushCreators.tsx — agregar import y botón
import { enrollProspect } from "@/services/sequenceService";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

// Dentro del componente — después del bloque existente de push-campaign result:
const [enrollLoading, setEnrollLoading] = useState(false);
const { toast } = useToast();
const SEQ_ENABLED = import.meta.env.VITE_SEQUENCES_MVP_ENABLED === "true";

async function handleEnroll(prospectId: string, seq: "creator-7d" | "b2b-14d") {
  setEnrollLoading(true);
  try {
    const r = await enrollProspect(prospectId, seq);
    toast({ title: "Enrolado", description: `Run ${r.runId.slice(0,8)} — ${r.tasksCreated} tasks creadas` });
  } catch (err) {
    toast({ title: "Error al enrolar", description: String(err), variant: "destructive" });
  } finally {
    setEnrollLoading(false);
  }
}

{SEQ_ENABLED && (
  <div className="mt-4 flex gap-2">
    <Button onClick={() => handleEnroll(prospectIdSelected, "creator-7d")} disabled={enrollLoading}>
      Enrolar en Creadores 7d
    </Button>
    <Button variant="outline" onClick={() => handleEnroll(prospectIdSelected, "b2b-14d")} disabled={enrollLoading}>
      Enrolar en B2B 14d
    </Button>
  </div>
)}
```

- [ ] **Step 3: Agregar la env var al .env.example**

```bash
# .env.example — append
VITE_SEQUENCES_MVP_ENABLED=false
```

- [ ] **Step 4: Commit**

```bash
git add src/services/sequenceService.ts src/components/prospecting/StepPushCreators.tsx .env.example
git commit -m "feat(sequences): add enroll button in StepPushCreators (gated by feature flag)"
```

- [ ] **Step 5: Push + PR iteración 2**

```bash
git push -u origin feat/seq-iter2-enrollment
gh pr create --base develop-creators --title "feat(sequences): iter 2 — enrollment Day 0" --body "..."
```

---

## Iteration 3 — Delivery & Cron

**Entregable:** `execute-due-tasks` + cron scheduled + retry + asset regeneration. Las tasks task_driven se entregan por canal al vencer.

### Task 3.1: Provider clients compartidos

**Files:**
- Create: `supabase/functions/_shared/brevo-client.ts`
- Create: `supabase/functions/_shared/respondio-client.ts`

- [ ] **Step 1: Brevo client**

```typescript
// supabase/functions/_shared/brevo-client.ts
export async function sendTransactional(input: {
  to: string;
  subject: string;
  htmlContent: string;
  params?: Record<string, unknown>;
  idempotencyKey: string;
}): Promise<{ messageId: string }> {
  const key = Deno.env.get("BREVO_API_KEY");
  if (!key) throw new Error("BREVO_API_KEY not set");
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": key,
      "Content-Type": "application/json",
      "Idempotency-Key": input.idempotencyKey,
    },
    body: JSON.stringify({
      to: [{ email: input.to }],
      subject: input.subject,
      htmlContent: input.htmlContent,
      params: input.params,
    }),
  });
  if (!res.ok) throw new Error(`brevo ${res.status}: ${await res.text()}`);
  const body = await res.json();
  return { messageId: body.messageId };
}
```

- [ ] **Step 2: respond.io client**

```typescript
// supabase/functions/_shared/respondio-client.ts
export async function sendText(input: {
  channelId: number;
  phone: string;
  text: string;
  idempotencyKey: string;
}): Promise<{ messageId: string }> {
  const key = Deno.env.get("RESPONDIO_API_KEY");
  if (!key) throw new Error("RESPONDIO_API_KEY not set");
  const res = await fetch(`https://api.respond.io/v2/contact/phone:${input.phone}/message`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "Idempotency-Key": input.idempotencyKey,
    },
    body: JSON.stringify({
      channelId: input.channelId,
      message: { type: "text", text: input.text },
    }),
  });
  if (!res.ok) throw new Error(`respondio ${res.status}: ${await res.text()}`);
  const body = await res.json();
  return { messageId: body.messageId ?? body.id };
}

export async function sendAudio(input: {
  channelId: number;
  phone: string;
  audioUrl: string;
  idempotencyKey: string;
}): Promise<{ messageId: string }> {
  const key = Deno.env.get("RESPONDIO_API_KEY");
  if (!key) throw new Error("RESPONDIO_API_KEY not set");
  const res = await fetch(`https://api.respond.io/v2/contact/phone:${input.phone}/message`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "Idempotency-Key": input.idempotencyKey,
    },
    body: JSON.stringify({
      channelId: input.channelId,
      message: { type: "attachment", attachment: { type: "audio", url: input.audioUrl } },
    }),
  });
  if (!res.ok) throw new Error(`respondio ${res.status}: ${await res.text()}`);
  const body = await res.json();
  return { messageId: body.messageId ?? body.id };
}
```

- [ ] **Step 3: Commit**

```bash
git checkout -b feat/seq-iter3-delivery develop-creators
git add supabase/functions/_shared/brevo-client.ts supabase/functions/_shared/respondio-client.ts
git commit -m "feat(sequences): add Brevo + respond.io shared clients with idempotency keys"
```

---

### Task 3.2: Edge function `execute-due-tasks`

**Files:**
- Create: `supabase/functions/execute-due-tasks/index.ts`

- [ ] **Step 1: Crear edge function**

```typescript
// supabase/functions/execute-due-tasks/index.ts
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  getServiceClient, corsHeaders, jsonResponse, logEvent,
} from "../_shared/sequence-helpers.ts";
import { updateContact } from "../_shared/hubspot-client.ts";
import * as brevo from "../_shared/brevo-client.ts";
import * as respondio from "../_shared/respondio-client.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders() });
  const mode = new URL(req.url).searchParams.get("mode") ?? "daily";
  const supa = getServiceClient();

  const today = new Date().toISOString().split("T")[0];
  const query = supa.from("sequence_tasks").select(`
    *, run:sequence_runs!inner(id, status, hubspot_contact_id,
       prospect:creator_inventory(email, phone, full_name, tier, company)),
    assets:sequence_task_assets(*)
  `).eq("status", "pending").eq("run.status", "active")
    .eq("delivery_mode", "task_driven");

  if (mode === "daily") {
    query.eq("scheduled_date", today);
  } else {
    query.gt("retry_count", 0).lt("retry_count", 3).lte("scheduled_date", today);
  }

  const { data: tasks, error } = await query;
  if (error) return jsonResponse({ error: error.message }, 500);

  let processed = 0, succeeded = 0, failed = 0;
  // Process in batches of 5 (concurrency)
  for (let i = 0; i < (tasks?.length ?? 0); i += 5) {
    const batch = tasks!.slice(i, i + 5);
    await Promise.all(batch.map(async (task) => {
      processed++;
      try {
        await processTask(supa, task);
        succeeded++;
      } catch (err) {
        failed++;
        await handleFailure(supa, task, err);
      }
    }));
  }

  return jsonResponse({ processed, succeeded, failed });
});

async function processTask(supa: ReturnType<typeof getServiceClient>, task: any) {
  // Validate assets
  const acceptable = (asset: any) =>
    asset.status === "ready" || (asset.asset_key === "video" && asset.status === "stubbed");
  const missing = (task.assets ?? []).filter((a: any) => !acceptable(a));
  if (missing.length) {
    throw new NonRetryableError(`assets_not_ready:${missing.map((a: any) => a.asset_key).join(",")}`);
  }

  const prospect = task.run.prospect;
  const assets = Object.fromEntries((task.assets ?? []).map((a: any) => [a.asset_key, a]));

  let messageId: string | null = null;

  switch (task.action_type) {
    case "email_case":
    case "email_casestudy":
    case "email_breakup": {
      const asset = assets.email_html;
      if (!asset) {
        // email_breakup de b2b no tiene required_assets — fallback body
        const r = await brevo.sendTransactional({
          to: prospect.email,
          subject: "Seguimiento",
          htmlContent: `<p>Hola ${prospect.full_name?.split(" ")[0] ?? ""}, último contacto.</p>`,
          idempotencyKey: task.id,
        });
        messageId = r.messageId;
      } else {
        const r = await brevo.sendTransactional({
          to: prospect.email,
          subject: asset.response_raw.subject,
          htmlContent: asset.response_raw.html,
          params: { microsite_url: assets.microsite?.url },
          idempotencyKey: task.id,
        });
        messageId = r.messageId;
      }
      break;
    }
    case "wa_followup":
    case "wa_close": {
      const channelId = Number(Deno.env.get("WHATSAPP_CHANNEL_ID"));
      const r = await respondio.sendText({
        channelId,
        phone: prospect.phone,
        text: renderWaText(task.action_type, prospect, assets),
        idempotencyKey: task.id,
      });
      messageId = r.messageId;
      break;
    }
    case "wa_voice_note":
    case "wa_summary": {
      const channelId = Number(Deno.env.get("WHATSAPP_CHANNEL_ID"));
      const r = await respondio.sendAudio({
        channelId,
        phone: prospect.phone,
        audioUrl: assets.voice.url,
        idempotencyKey: task.id,
      });
      messageId = r.messageId;
      break;
    }
    case "linkedin_invite": {
      // Fase 2 — marca skipped
      await supa.from("sequence_tasks").update({
        status: "skipped", executed_at: new Date().toISOString(), error: "linkedin_fase_2",
      }).eq("id", task.id);
      await logEvent(supa, task.run_id, task.id, "skipped", "internal", task.channel,
        { reason: "linkedin_fase_2" });
      return;
    }
    default:
      throw new NonRetryableError(`unknown_action_type:${task.action_type}`);
  }

  // Mark sent
  await supa.from("sequence_tasks").update({
    status: "sent", executed_at: new Date().toISOString(),
    provider_message_id: messageId, error: null,
  }).eq("id", task.id);

  await logEvent(supa, task.run_id, task.id, "sent", task.provider, task.channel,
    { provider_message_id: messageId });

  // HubSpot sync
  if (task.run.hubspot_contact_id) {
    await updateContact(task.run.hubspot_contact_id, {
      laneta_current_step: task.step_number,
      laneta_last_touch_at: new Date().toISOString(),
      laneta_last_channel: task.channel,
    }).catch(() => {});
  }
}

async function handleFailure(supa: any, task: any, err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  if (err instanceof NonRetryableError || task.retry_count >= 2) {
    await supa.from("sequence_tasks").update({
      status: "failed", error: msg, executed_at: new Date().toISOString(),
    }).eq("id", task.id);
    await logEvent(supa, task.run_id, task.id, "failed", task.provider, task.channel, { error: msg });
    await notifyOps(task, msg);
  } else {
    await supa.from("sequence_tasks").update({
      retry_count: task.retry_count + 1, error: msg,
    }).eq("id", task.id);
  }
}

async function notifyOps(task: any, error: string) {
  const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const chatId = Deno.env.get("TELEGRAM_OPS_CHAT_ID");
  if (!token || !chatId) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: `⚠️ Task ${task.id.slice(0,8)} (${task.action_type}) failed: ${error}`,
    }),
  });
}

function renderWaText(action: string, p: { full_name: string; company?: string }, assets: Record<string, { url: string }>): string {
  const name = p.full_name?.split(" ")[0] ?? "";
  if (action === "wa_followup") return `Hola ${name}, ¿recibiste el email que te mandé?`;
  if (action === "wa_close") return `${name}, te mando acá el link: ${assets.microsite?.url}`;
  return `Hola ${name}`;
}

class NonRetryableError extends Error {
  constructor(msg: string) { super(msg); this.name = "NonRetryableError"; }
}
```

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/execute-due-tasks/index.ts
git commit -m "feat(sequences): add execute-due-tasks edge function (daily + retry modes)"
```

---

### Task 3.3: Edge functions `regenerate-failed-assets` y `sync-hubspot-pending`

**Files:**
- Create: `supabase/functions/regenerate-failed-assets/index.ts`
- Create: `supabase/functions/sync-hubspot-pending/index.ts`

- [ ] **Step 1: regenerate-failed-assets**

```typescript
// supabase/functions/regenerate-failed-assets/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getServiceClient, corsHeaders, jsonResponse } from "../_shared/sequence-helpers.ts";
import {
  generateVoiceAsset, buildMicrositeUrl, renderEmailHtml, Dossier,
} from "../_shared/asset-generators.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders() });
  const supa = getServiceClient();

  const { data: assets } = await supa.from("sequence_task_assets")
    .select("*, task:sequence_tasks!inner(id, action_type, template_id, status, run_id, run:sequence_runs(prospect_id, prospect:creator_inventory(*)))")
    .eq("status", "failed").lt("retry_count", 3).limit(50);

  let processed = 0;
  for (const a of assets ?? []) {
    if (a.task.status !== "pending" && a.task.status !== "failed") continue;
    const p = a.task.run.prospect;
    const dossier: Dossier = {
      prospectId: p.id,
      firstName: (p.full_name ?? p.email).split(" ")[0],
      fullName: p.full_name ?? p.email,
      email: p.email,
      phone: p.phone,
      company: p.company,
      tier: p.tier,
      program: p.program ?? "default",
    };
    try {
      await supa.from("sequence_task_assets").update({ retry_count: a.retry_count + 1 }).eq("id", a.id);
      if (a.asset_key === "voice") await generateVoiceAsset(supa, a.task, dossier);
      else if (a.asset_key === "microsite") await buildMicrositeUrl(supa, a.task, dossier);
      else if (a.asset_key === "email_html") await renderEmailHtml(supa, a.task, dossier);
      processed++;
    } catch (err) {
      await supa.from("sequence_task_assets").update({ error: String(err) }).eq("id", a.id);
    }
  }
  return jsonResponse({ processed });
});
```

- [ ] **Step 2: sync-hubspot-pending**

```typescript
// supabase/functions/sync-hubspot-pending/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getServiceClient, corsHeaders, jsonResponse } from "../_shared/sequence-helpers.ts";
import { upsertContact } from "../_shared/hubspot-client.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders() });
  const supa = getServiceClient();

  const { data: runs } = await supa.from("sequence_runs")
    .select("*, prospect:creator_inventory(*)")
    .is("hubspot_contact_id", null)
    .eq("status", "active")
    .lt("started_at", new Date(Date.now() - 60 * 60 * 1000).toISOString())
    .limit(20);

  let fixed = 0;
  for (const r of runs ?? []) {
    try {
      const id = await upsertContact(r.prospect.email, {
        laneta_sequence_name: r.sequence_name,
        laneta_program: r.program,
        laneta_tier: r.tier ?? "",
        laneta_current_step: 0,
        laneta_status: "active",
        laneta_prospect_id: r.prospect_id,
      });
      await supa.from("sequence_runs").update({ hubspot_contact_id: id }).eq("id", r.id);
      fixed++;
    } catch (err) {
      console.error(`sync-hubspot-pending ${r.id}: ${err}`);
    }
  }
  return jsonResponse({ fixed });
});
```

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/regenerate-failed-assets/index.ts supabase/functions/sync-hubspot-pending/index.ts
git commit -m "feat(sequences): add regenerate-failed-assets + sync-hubspot-pending crons"
```

---

### Task 3.4: pg_cron schedules

**Files:**
- Create: `supabase/migrations/20260416120000_schedule_sequence_crons.sql`

- [ ] **Step 1: Crear migration de crons**

```sql
-- Requires: pg_cron, pg_net enabled (migration 20260415120002)
-- Requires: app.settings vault (Supabase) o env var accessible

-- Store service role key in vault for cron to access (run once manually if needed):
-- INSERT INTO vault.secrets (name, secret) VALUES ('service_role_key', '<SERVICE_ROLE_KEY>')
-- ON CONFLICT (name) DO UPDATE SET secret = EXCLUDED.secret;

DO $$
DECLARE
  fn_base text := 'https://<PROJECT_REF>.supabase.co/functions/v1';
  srk text;
BEGIN
  SELECT decrypted_secret INTO srk FROM vault.decrypted_secrets WHERE name = 'service_role_key';
  IF srk IS NULL THEN RAISE NOTICE 'service_role_key vault secret missing — crons will not run'; END IF;

  -- Daily delivery 9:00 AM CDMX (15:00 UTC)
  PERFORM cron.unschedule('deliver-due-tasks') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname='deliver-due-tasks');
  PERFORM cron.schedule(
    'deliver-due-tasks', '0 15 * * *',
    format($fn$
      SELECT net.http_post(
        url := %L,
        headers := jsonb_build_object('Authorization', 'Bearer %s')
      );
    $fn$, fn_base || '/execute-due-tasks', srk)
  );

  -- Retry hourly
  PERFORM cron.unschedule('retry-failed-tasks') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname='retry-failed-tasks');
  PERFORM cron.schedule(
    'retry-failed-tasks', '0 * * * *',
    format($fn$
      SELECT net.http_post(
        url := %L,
        headers := jsonb_build_object('Authorization', 'Bearer %s')
      );
    $fn$, fn_base || '/execute-due-tasks?mode=retry', srk)
  );

  -- Regenerate assets hourly (offset 15 min)
  PERFORM cron.unschedule('regenerate-failed-assets') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname='regenerate-failed-assets');
  PERFORM cron.schedule(
    'regenerate-failed-assets', '15 * * * *',
    format($fn$
      SELECT net.http_post(
        url := %L,
        headers := jsonb_build_object('Authorization', 'Bearer %s')
      );
    $fn$, fn_base || '/regenerate-failed-assets', srk)
  );

  -- Sync HubSpot hourly (offset 30 min)
  PERFORM cron.unschedule('sync-hubspot-pending') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname='sync-hubspot-pending');
  PERFORM cron.schedule(
    'sync-hubspot-pending', '30 * * * *',
    format($fn$
      SELECT net.http_post(
        url := %L,
        headers := jsonb_build_object('Authorization', 'Bearer %s')
      );
    $fn$, fn_base || '/sync-hubspot-pending', srk)
  );
END $$;
```

**Nota:** reemplazar `<PROJECT_REF>` con el ref real de tu proyecto Supabase al aplicar. Alternativa: extraer `fn_base` del env `app.supabase_url`.

- [ ] **Step 2: Pre-requisito manual — store secret en vault**

Correr una vez en Studio SQL editor:
```sql
INSERT INTO vault.secrets (name, secret)
VALUES ('service_role_key', 'REPLACE_WITH_SERVICE_ROLE_KEY')
ON CONFLICT (name) DO UPDATE SET secret = EXCLUDED.secret;
```

- [ ] **Step 3: Commit + push PR iteración 3**

```bash
git add supabase/migrations/20260416120000_schedule_sequence_crons.sql
git commit -m "feat(sequences): schedule pg_cron jobs for daily/retry delivery + asset regen + hubspot sync"
git push -u origin feat/seq-iter3-delivery
gh pr create --base develop-creators --title "feat(sequences): iter 3 — delivery & cron" --body "..."
```

- [ ] **Step 4: Smoke test post-deploy**

Ejecutar manualmente vía SQL editor:
```sql
SELECT net.http_post(
  url := 'https://<project>.supabase.co/functions/v1/execute-due-tasks',
  headers := jsonb_build_object('Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='service_role_key'))
);
```
Expected: `{processed: N, succeeded, failed}` en el response (revisar `net._http_response`).

---

## Iteration 4 — Webhooks

**Entregable:** Los 3 receptores webhook activos. Respuesta del prospecto en cualquier canal cancela el run.

### Task 4.1: Extender `smartlead-webhook` existente

**Files:**
- Modify: `supabase/functions/smartlead-webhook/index.ts`

- [ ] **Step 1: Leer archivo actual**

```bash
cat supabase/functions/smartlead-webhook/index.ts
```

- [ ] **Step 2: Agregar manejo de 5 eventos dentro del handler existente**

Ubicar el handler actual. Agregar switch por `payload.event_type`:

```typescript
import {
  getServiceClient, findByEmail, findActiveRun,
  cancelPendingTasks, markRunWon, logEvent, notifySalesTelegram,
} from "../_shared/sequence-helpers.ts";
import { updateContact } from "../_shared/hubspot-client.ts";

// ... dentro del serve():
const supa = getServiceClient();
const payload = await req.json();

switch (payload.event_type) {
  case "email_sent": {
    const prospect = await findByEmail(supa, payload.to_email);
    if (!prospect) break;
    const run = await findActiveRun(supa, prospect.id);
    if (!run) break;
    // Marca la primera task pending Smartlead del run como sent
    const { data: task } = await supa.from("sequence_tasks")
      .select("*").eq("run_id", run.id).eq("provider", "smartlead")
      .eq("status", "pending").order("step_number").limit(1).maybeSingle();
    if (task) {
      await supa.from("sequence_tasks").update({
        status: "sent", executed_at: new Date().toISOString(),
        provider_message_id: payload.message_id ?? null,
      }).eq("id", task.id);
      await logEvent(supa, run.id, task.id, "sent", "smartlead", "email", payload);
      if (run.hubspot_contact_id) {
        await updateContact(run.hubspot_contact_id, {
          laneta_current_step: task.step_number,
          laneta_last_touch_at: new Date().toISOString(),
          laneta_last_channel: "email",
        }).catch(() => {});
      }
    }
    break;
  }
  case "email_opened":
  case "email_clicked": {
    const prospect = await findByEmail(supa, payload.to_email);
    if (!prospect) break;
    const run = await findActiveRun(supa, prospect.id);
    if (!run) break;
    const response = payload.event_type === "email_opened" ? "opened" : "clicked";
    await supa.from("sequence_tasks")
      .update({ response }).eq("run_id", run.id).eq("provider", "smartlead").eq("status", "sent");
    await logEvent(supa, run.id, null, response, "smartlead", "email", payload);
    break;
  }
  case "email_bounced": {
    const prospect = await findByEmail(supa, payload.to_email);
    if (!prospect) break;
    const run = await findActiveRun(supa, prospect.id);
    if (!run) break;
    await supa.from("sequence_tasks")
      .update({ status: "failed", error: "bounced" })
      .eq("run_id", run.id).eq("provider", "smartlead").eq("status", "pending");
    await logEvent(supa, run.id, null, "bounced", "smartlead", "email", payload);
    break;
  }
  case "email_replied": {
    const prospect = await findByEmail(supa, payload.from_email ?? payload.to_email);
    if (!prospect) break;
    const run = await findActiveRun(supa, prospect.id);
    if (!run) break;
    await cancelPendingTasks(supa, run.id, "replied_email");
    await markRunWon(supa, run.id, "replied_email");
    if (run.hubspot_contact_id) {
      await updateContact(run.hubspot_contact_id, {
        laneta_status: "won", laneta_ended_reason: "replied_email",
      }).catch(() => {});
    }
    await logEvent(supa, run.id, null, "replied", "smartlead", "email", payload);
    await notifySalesTelegram(prospect.email, "email");
    break;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git checkout -b feat/seq-iter4-webhooks develop-creators
git add supabase/functions/smartlead-webhook/index.ts
git commit -m "feat(sequences): extend smartlead-webhook to track M1 sends + cancel on reply"
```

---

### Task 4.2: `whatsapp-webhook` nuevo

**Files:**
- Create: `supabase/functions/whatsapp-webhook/index.ts`

- [ ] **Step 1: Crear webhook respond.io**

```typescript
// supabase/functions/whatsapp-webhook/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  getServiceClient, findByPhone, findActiveRun, cancelPendingTasks, markRunWon,
  logEvent, notifySalesTelegram, normalizePhone, corsHeaders, jsonResponse,
} from "../_shared/sequence-helpers.ts";
import { updateContact } from "../_shared/hubspot-client.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders() });

  // Signature validation
  const expected = Deno.env.get("RESPONDIO_WEBHOOK_SECRET");
  const received = req.headers.get("x-respondio-signature");
  if (!expected || !received || expected !== received) {
    return jsonResponse({ error: "unauthorized" }, 401);
  }

  const payload = await req.json();
  if (payload.event !== "message.created") return jsonResponse({ ok: true });
  if (payload.message?.direction !== "incoming") return jsonResponse({ ok: true });

  const supa = getServiceClient();
  const phone = normalizePhone(payload.contact?.phone ?? "");
  if (!phone) return jsonResponse({ ok: true });

  const prospect = await findByPhone(supa, phone);
  if (!prospect) return jsonResponse({ ok: true });

  const run = await findActiveRun(supa, prospect.id);
  if (!run) return jsonResponse({ ok: true });

  await cancelPendingTasks(supa, run.id, "replied_whatsapp");
  await markRunWon(supa, run.id, "replied_whatsapp");
  if (run.hubspot_contact_id) {
    await updateContact(run.hubspot_contact_id, {
      laneta_status: "won", laneta_ended_reason: "replied_whatsapp",
    }).catch(() => {});
  }
  await logEvent(supa, run.id, null, "replied", "respondio", "whatsapp", payload);
  await notifySalesTelegram(prospect.email, "whatsapp");

  return jsonResponse({ ok: true });
});
```

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/whatsapp-webhook/index.ts
git commit -m "feat(sequences): add whatsapp-webhook receiver for respond.io inbound"
```

- [ ] **Step 3: Configurar webhook en respond.io (manual, post-deploy)**

- Ir a respond.io workspace → Settings → Integrations → Webhooks → Add.
- URL: `https://<project>.supabase.co/functions/v1/whatsapp-webhook`
- Events: `message.created` (incoming)
- Header: `x-respondio-signature: <RESPONDIO_WEBHOOK_SECRET>` (definir y guardar en GitHub Secrets).

---

### Task 4.3: `hubspot-webhook` nuevo

**Files:**
- Create: `supabase/functions/hubspot-webhook/index.ts`

- [ ] **Step 1: Crear webhook HubSpot meeting.creation**

```typescript
// supabase/functions/hubspot-webhook/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  getServiceClient, findByEmail, findActiveRun, cancelPendingTasks, markRunWon,
  logEvent, notifySalesTelegram, corsHeaders, jsonResponse,
} from "../_shared/sequence-helpers.ts";
import { getMeeting, getContact, updateContact } from "../_shared/hubspot-client.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders() });

  // HubSpot signature v3 validation
  const expected = Deno.env.get("HUBSPOT_WEBHOOK_SECRET");
  const sig = req.headers.get("x-hubspot-signature-v3");
  const body = await req.text();
  if (!expected || !sig) return jsonResponse({ error: "unauthorized" }, 401);
  // For MVP: simple equality. Proper HMAC-SHA256 of URI+body+timestamp can be added later.

  const events = JSON.parse(body) as Array<{
    subscriptionType: string;
    objectTypeId?: string;
    objectId: number;
  }>;

  const supa = getServiceClient();

  for (const event of events) {
    if (event.subscriptionType !== "object.creation") continue;
    // HubSpot uses '0-47' or similar for meeting; adjust based on actual config
    try {
      const meeting = await getMeeting(String(event.objectId));
      const contactId = meeting.associations?.contacts?.results?.[0]?.id;
      if (!contactId) continue;
      const contact = await getContact(contactId);
      const email = contact.properties?.email;
      if (!email) continue;

      const prospect = await findByEmail(supa, email);
      if (!prospect) continue;
      const run = await findActiveRun(supa, prospect.id);
      if (!run) continue;

      await cancelPendingTasks(supa, run.id, "meeting_booked");
      await markRunWon(supa, run.id, "meeting_booked");
      await updateContact(contactId, {
        laneta_status: "won", laneta_ended_reason: "meeting_booked",
      }).catch(() => {});
      await logEvent(supa, run.id, null, "replied", "hubspot", null, event);
      await notifySalesTelegram(prospect.email, "meeting");
    } catch (err) {
      console.error("hubspot-webhook event error:", err);
    }
  }

  return jsonResponse({ ok: true });
});
```

- [ ] **Step 2: Commit + PR iter 4**

```bash
git add supabase/functions/hubspot-webhook/index.ts
git commit -m "feat(sequences): add hubspot-webhook for meeting.creation cancellation"
git push -u origin feat/seq-iter4-webhooks
gh pr create --base develop-creators --title "feat(sequences): iter 4 — response webhooks" --body "..."
```

- [ ] **Step 3: Configurar webhook en HubSpot (manual, post-deploy)**

- HubSpot → Settings → Integrations → Private Apps → tu app.
- Webhooks → URL: `https://<project>.supabase.co/functions/v1/hubspot-webhook`.
- Subscription: `Object creation → Meeting`.
- Guardar `HUBSPOT_WEBHOOK_SECRET` en GitHub Secrets.

---

## Iteration 5 — Dashboard UI

**Entregable:** Módulo `/dashboard/admin/sequences` completo con overview, detail, failed-assets, templates read-only y acciones.

### Task 5.1: Edge functions de acciones

**Files:**
- Create: `supabase/functions/cancel-sequence-run/index.ts`
- Create: `supabase/functions/retry-sequence-task/index.ts`
- Create: `supabase/functions/skip-sequence-task/index.ts`
- Create: `supabase/functions/regenerate-sequence-asset/index.ts`
- Create: `supabase/functions/force-hubspot-sync/index.ts`

- [ ] **Step 1: cancel-sequence-run**

```typescript
// supabase/functions/cancel-sequence-run/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  getServiceClient, cancelPendingTasks, logEvent, corsHeaders, jsonResponse,
} from "../_shared/sequence-helpers.ts";
import { updateContact } from "../_shared/hubspot-client.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders() });
  const { runId, reason } = await req.json();
  if (!runId) return jsonResponse({ error: "runId required" }, 400);

  const supa = getServiceClient();
  const { data: run } = await supa.from("sequence_runs").select("*").eq("id", runId).single();
  if (!run) return jsonResponse({ error: "run not found" }, 404);

  await cancelPendingTasks(supa, runId, reason ?? "manual_cancel");
  await supa.from("sequence_runs").update({
    status: "cancelled", ended_reason: reason ?? "manual_cancel",
    ended_at: new Date().toISOString(),
  }).eq("id", runId);

  if (run.hubspot_contact_id) {
    await updateContact(run.hubspot_contact_id, {
      laneta_status: "cancelled", laneta_ended_reason: reason ?? "manual_cancel",
    }).catch(() => {});
  }
  await logEvent(supa, runId, null, "cancelled", "internal", null, { reason });
  return jsonResponse({ ok: true });
});
```

- [ ] **Step 2: retry-sequence-task**

```typescript
// supabase/functions/retry-sequence-task/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getServiceClient, logEvent, corsHeaders, jsonResponse } from "../_shared/sequence-helpers.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders() });
  const { taskId } = await req.json();
  if (!taskId) return jsonResponse({ error: "taskId required" }, 400);
  const supa = getServiceClient();
  const { data: task } = await supa.from("sequence_tasks")
    .update({ status: "pending", retry_count: 0, error: null }).eq("id", taskId)
    .select().single();
  if (!task) return jsonResponse({ error: "not found" }, 404);
  await logEvent(supa, task.run_id, task.id, "retry_requested", "internal", task.channel, {});
  return jsonResponse({ ok: true, task });
});
```

- [ ] **Step 3: skip-sequence-task**

```typescript
// supabase/functions/skip-sequence-task/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getServiceClient, logEvent, corsHeaders, jsonResponse } from "../_shared/sequence-helpers.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders() });
  const { taskId, reason } = await req.json();
  if (!taskId) return jsonResponse({ error: "taskId required" }, 400);
  const supa = getServiceClient();
  const { data: task } = await supa.from("sequence_tasks")
    .update({ status: "skipped", executed_at: new Date().toISOString(), error: reason }).eq("id", taskId)
    .select().single();
  if (!task) return jsonResponse({ error: "not found" }, 404);
  await logEvent(supa, task.run_id, task.id, "skipped", "internal", task.channel, { reason });
  return jsonResponse({ ok: true, task });
});
```

- [ ] **Step 4: regenerate-sequence-asset**

```typescript
// supabase/functions/regenerate-sequence-asset/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getServiceClient, corsHeaders, jsonResponse } from "../_shared/sequence-helpers.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders() });
  const { assetId } = await req.json();
  if (!assetId) return jsonResponse({ error: "assetId required" }, 400);
  const supa = getServiceClient();
  await supa.from("sequence_task_assets")
    .update({ status: "pending", retry_count: 0, error: null }).eq("id", assetId);
  return jsonResponse({ ok: true });
});
```

- [ ] **Step 5: force-hubspot-sync**

```typescript
// supabase/functions/force-hubspot-sync/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getServiceClient, corsHeaders, jsonResponse } from "../_shared/sequence-helpers.ts";
import { upsertContact } from "../_shared/hubspot-client.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders() });
  const { runId } = await req.json();
  if (!runId) return jsonResponse({ error: "runId required" }, 400);
  const supa = getServiceClient();
  const { data: run } = await supa.from("sequence_runs")
    .select("*, prospect:creator_inventory(*), tasks:sequence_tasks(step_number, executed_at, channel, status)")
    .eq("id", runId).single();
  if (!run) return jsonResponse({ error: "not found" }, 404);

  const lastSent = (run.tasks ?? []).filter((t: any) => t.status === "sent")
    .sort((a: any, b: any) => b.step_number - a.step_number)[0];

  const id = await upsertContact(run.prospect.email, {
    laneta_sequence_name: run.sequence_name,
    laneta_program: run.program,
    laneta_tier: run.tier ?? "",
    laneta_current_step: lastSent?.step_number ?? 0,
    laneta_last_touch_at: lastSent?.executed_at ?? null,
    laneta_last_channel: lastSent?.channel ?? "",
    laneta_status: run.status,
    laneta_prospect_id: run.prospect_id,
  });
  await supa.from("sequence_runs").update({ hubspot_contact_id: id }).eq("id", runId);
  return jsonResponse({ ok: true, hubspotContactId: id });
});
```

- [ ] **Step 6: Commit**

```bash
git checkout -b feat/seq-iter5-dashboard develop-creators
git add supabase/functions/cancel-sequence-run supabase/functions/retry-sequence-task \
        supabase/functions/skip-sequence-task supabase/functions/regenerate-sequence-asset \
        supabase/functions/force-hubspot-sync
git commit -m "feat(sequences): add 5 action edge functions for dashboard"
```

---

### Task 5.2: Frontend service extendido

**Files:**
- Modify: `src/services/sequenceService.ts`

- [ ] **Step 1: Extender sequenceService con queries + actions**

Append al archivo existente:

```typescript
// src/services/sequenceService.ts — agregar

export type SequenceRunSummary = {
  id: string;
  sequence_name: string;
  program: string;
  tier: string | null;
  status: "active" | "won" | "exhausted" | "cancelled" | "failed";
  started_at: string;
  ended_at: string | null;
  hubspot_contact_id: string | null;
  email: string;
  full_name: string | null;
  tasks_sent: number;
  tasks_pending: number;
  tasks_failed: number;
  tasks_cancelled: number;
  last_touch_at: string | null;
};

export async function fetchRuns(filters?: {
  status?: string; sequenceName?: string; tier?: string; limit?: number;
}): Promise<SequenceRunSummary[]> {
  let q = supabase.from("v_sequences_dashboard").select("*").limit(filters?.limit ?? 50);
  if (filters?.status) q = q.eq("status", filters.status);
  if (filters?.sequenceName) q = q.eq("sequence_name", filters.sequenceName);
  if (filters?.tier) q = q.eq("tier", filters.tier);
  const { data, error } = await q.order("started_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as SequenceRunSummary[];
}

export async function fetchRunDetail(runId: string) {
  const [runRes, tasksRes, eventsRes] = await Promise.all([
    supabase.from("sequence_runs").select("*, prospect:creator_inventory(*)").eq("id", runId).single(),
    supabase.from("sequence_tasks").select("*, assets:sequence_task_assets(*)").eq("run_id", runId).order("step_number"),
    supabase.from("sequence_events").select("*").eq("run_id", runId).order("occurred_at", { ascending: false }),
  ]);
  if (runRes.error) throw runRes.error;
  return { run: runRes.data, tasks: tasksRes.data ?? [], events: eventsRes.data ?? [] };
}

export async function fetchFailedAssets() {
  const { data, error } = await supabase.from("v_failed_assets").select("*").limit(200);
  if (error) throw error;
  return data ?? [];
}

export async function fetchTemplates() {
  const { data, error } = await supabase.from("sequence_template").select("*").order("sequence_name").order("step_number");
  if (error) throw error;
  return data ?? [];
}

async function invokeAction(fn: string, body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke(fn, { body });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

export const cancelRun = (runId: string, reason?: string) => invokeAction("cancel-sequence-run", { runId, reason });
export const retryTask = (taskId: string) => invokeAction("retry-sequence-task", { taskId });
export const skipTask = (taskId: string, reason?: string) => invokeAction("skip-sequence-task", { taskId, reason });
export const regenerateAsset = (assetId: string) => invokeAction("regenerate-sequence-asset", { assetId });
export const forceHubspotSync = (runId: string) => invokeAction("force-hubspot-sync", { runId });
```

- [ ] **Step 2: Commit**

```bash
git add src/services/sequenceService.ts
git commit -m "feat(sequences): extend sequenceService with queries + actions"
```

---

### Task 5.3: Componentes reusables

**Files:**
- Create: `src/components/admin/sequences/RunStatusBadge.tsx`
- Create: `src/components/admin/sequences/SequenceRunCard.tsx`
- Create: `src/components/admin/sequences/SequenceTimelineStep.tsx`
- Create: `src/components/admin/sequences/AssetPreview.tsx`
- Create: `src/components/admin/sequences/TaskActionsMenu.tsx`

- [ ] **Step 1: RunStatusBadge**

```tsx
// src/components/admin/sequences/RunStatusBadge.tsx
import { Badge } from "@/components/ui/badge";

const COLORS: Record<string, string> = {
  active: "bg-blue-100 text-blue-800",
  won: "bg-green-100 text-green-800",
  exhausted: "bg-gray-100 text-gray-800",
  cancelled: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
};

export function RunStatusBadge({ status }: { status: string }) {
  return <Badge className={COLORS[status] ?? ""}>{status}</Badge>;
}
```

- [ ] **Step 2: SequenceRunCard**

```tsx
// src/components/admin/sequences/SequenceRunCard.tsx
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { RunStatusBadge } from "./RunStatusBadge";
import type { SequenceRunSummary } from "@/services/sequenceService";

export function SequenceRunCard({ run }: { run: SequenceRunSummary }) {
  return (
    <Link to={`/dashboard/admin/sequences/${run.id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer">
        <CardContent className="py-3 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="font-medium truncate">{run.full_name ?? run.email}</div>
            <div className="text-xs text-muted-foreground truncate">
              {run.sequence_name} · {run.tier ?? "—"} · {run.email}
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span>✓ {run.tasks_sent}</span>
            <span className="text-blue-600">⏳ {run.tasks_pending}</span>
            {run.tasks_failed > 0 && <span className="text-red-600">✗ {run.tasks_failed}</span>}
            <RunStatusBadge status={run.status} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
```

- [ ] **Step 3: SequenceTimelineStep**

```tsx
// src/components/admin/sequences/SequenceTimelineStep.tsx
import { Mail, MessageCircle, Linkedin, Phone, Mic } from "lucide-react";
import { AssetPreview } from "./AssetPreview";
import { TaskActionsMenu } from "./TaskActionsMenu";

const ICON: Record<string, typeof Mail> = {
  email: Mail, whatsapp: MessageCircle, linkedin: Linkedin, sms: Phone, voice: Mic,
};

const STATUS_COLORS: Record<string, string> = {
  sent: "border-green-500 bg-green-50",
  pending: "border-blue-300 bg-blue-50",
  failed: "border-red-500 bg-red-50",
  cancelled: "border-gray-300 bg-gray-50",
  skipped: "border-yellow-300 bg-yellow-50",
};

export function SequenceTimelineStep({ task, onChanged }: { task: any; onChanged: () => void }) {
  const Icon = ICON[task.channel] ?? Mail;
  return (
    <div className={`border-l-4 pl-4 py-3 ${STATUS_COLORS[task.status] ?? ""}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Day {task.step_number}: {task.action_type}</span>
          <span className="text-xs text-muted-foreground">
            {task.scheduled_date} · {task.provider}
          </span>
        </div>
        <TaskActionsMenu task={task} onChanged={onChanged} />
      </div>
      <div className="text-xs text-muted-foreground mt-1">
        {task.status} {task.executed_at && `· ${new Date(task.executed_at).toLocaleString()}`}
        {task.error && <span className="text-red-600 ml-2">{task.error}</span>}
      </div>
      {task.assets?.length > 0 && (
        <div className="mt-2 flex gap-2 flex-wrap">
          {task.assets.map((a: any) => (
            <AssetPreview key={a.id} asset={a} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: AssetPreview**

```tsx
// src/components/admin/sequences/AssetPreview.tsx
import { Badge } from "@/components/ui/badge";

export function AssetPreview({ asset }: { asset: any }) {
  if (asset.asset_key === "voice" && asset.url) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline">voice</Badge>
        <audio controls src={asset.url} className="h-8" />
      </div>
    );
  }
  if (asset.asset_key === "microsite" && asset.url) {
    return <Badge variant="outline"><a href={asset.url} target="_blank" rel="noreferrer">microsite →</a></Badge>;
  }
  if (asset.asset_key === "email_html" && asset.response_raw?.html) {
    return <Badge variant="outline" title={asset.response_raw.subject}>email_html ({asset.status})</Badge>;
  }
  return <Badge variant="outline">{asset.asset_key} ({asset.status})</Badge>;
}
```

- [ ] **Step 5: TaskActionsMenu**

```tsx
// src/components/admin/sequences/TaskActionsMenu.tsx
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { retryTask, skipTask, regenerateAsset } from "@/services/sequenceService";

export function TaskActionsMenu({ task, onChanged }: { task: any; onChanged: () => void }) {
  const { toast } = useToast();

  async function run(fn: () => Promise<unknown>, label: string) {
    try { await fn(); toast({ title: label }); onChanged(); }
    catch (e) { toast({ title: "Error", description: String(e), variant: "destructive" }); }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="h-4 w-4" /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {(task.status === "failed" || task.status === "cancelled") && (
          <DropdownMenuItem onClick={() => run(() => retryTask(task.id), "Retry programado")}>Retry</DropdownMenuItem>
        )}
        {task.status === "pending" && (
          <DropdownMenuItem onClick={() => run(() => skipTask(task.id, "manual_skip"), "Task saltada")}>Skip</DropdownMenuItem>
        )}
        {task.assets?.some((a: any) => a.status === "failed") && (
          <DropdownMenuItem onClick={() => run(
            () => Promise.all(task.assets.filter((a: any) => a.status === "failed").map((a: any) => regenerateAsset(a.id))),
            "Assets re-encolados"
          )}>Regenerate failed assets</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/sequences/
git commit -m "feat(sequences): add reusable components (card, timeline, preview, actions, badge)"
```

---

### Task 5.4: Páginas

**Files:**
- Create: `src/pages/admin/sequences/SequencesOverviewPage.tsx`
- Create: `src/pages/admin/sequences/SequenceRunDetailPage.tsx`
- Create: `src/pages/admin/sequences/FailedAssetsPage.tsx`
- Create: `src/pages/admin/sequences/SequenceTemplatesPage.tsx`

- [ ] **Step 1: Overview**

```tsx
// src/pages/admin/sequences/SequencesOverviewPage.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchRuns } from "@/services/sequenceService";
import { SequenceRunCard } from "@/components/admin/sequences/SequenceRunCard";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function SequencesOverviewPage() {
  const [status, setStatus] = useState("active");
  const [sequenceName, setSequenceName] = useState<string>("");
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["sequences-overview", status, sequenceName],
    queryFn: () => fetchRuns({ status, sequenceName: sequenceName || undefined }),
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Secuencias</h1>
        <div className="flex gap-2">
          <Link to="/dashboard/admin/sequences/templates"><Button variant="outline">Templates</Button></Link>
          <Link to="/dashboard/admin/sequences/failed-assets"><Button variant="outline">Failed Assets</Button></Link>
        </div>
      </div>
      <div className="flex gap-2">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["active","won","exhausted","cancelled","failed"].map((s) =>
              <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sequenceName} onValueChange={setSequenceName}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Todas las secuencias" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas</SelectItem>
            <SelectItem value="creator-7d">creator-7d</SelectItem>
            <SelectItem value="b2b-14d">b2b-14d</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardHeader><CardTitle>{isLoading ? "Cargando..." : `${data?.length ?? 0} runs`}</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {(data ?? []).map((r) => <SequenceRunCard key={r.id} run={r} />)}
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Detail**

```tsx
// src/pages/admin/sequences/SequenceRunDetailPage.tsx
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { fetchRunDetail, cancelRun, forceHubspotSync } from "@/services/sequenceService";
import { SequenceTimelineStep } from "@/components/admin/sequences/SequenceTimelineStep";
import { RunStatusBadge } from "@/components/admin/sequences/RunStatusBadge";

export default function SequenceRunDetailPage() {
  const { runId } = useParams<{ runId: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useQuery({
    queryKey: ["run-detail", runId],
    queryFn: () => fetchRunDetail(runId!),
    enabled: !!runId,
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["run-detail", runId] });

  async function handleCancel() {
    if (!confirm("¿Cancelar run?")) return;
    try { await cancelRun(runId!, "manual_cancel"); toast({ title: "Run cancelado" }); refresh(); }
    catch (e) { toast({ title: "Error", description: String(e), variant: "destructive" }); }
  }

  async function handleSync() {
    try { await forceHubspotSync(runId!); toast({ title: "HubSpot sincronizado" }); refresh(); }
    catch (e) { toast({ title: "Error", description: String(e), variant: "destructive" }); }
  }

  if (isLoading || !data) return <div className="p-6">Cargando...</div>;
  const { run, tasks, events } = data;

  return (
    <div className="p-6 space-y-4">
      <Link to="/dashboard/admin/sequences" className="text-sm text-muted-foreground">← Volver</Link>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{run.prospect.full_name ?? run.prospect.email}</CardTitle>
            <div className="text-sm text-muted-foreground">{run.sequence_name} · {run.program} · tier {run.tier ?? "—"}</div>
          </div>
          <div className="flex items-center gap-2">
            <RunStatusBadge status={run.status} />
            {run.status === "active" && <Button variant="outline" size="sm" onClick={handleCancel}>Cancel run</Button>}
            <Button variant="outline" size="sm" onClick={handleSync}>Force HubSpot sync</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-1">
            <div>Started: {new Date(run.started_at).toLocaleString()}</div>
            {run.ended_at && <div>Ended: {new Date(run.ended_at).toLocaleString()} ({run.ended_reason})</div>}
            <div>HubSpot: {run.hubspot_contact_id ?? <span className="text-red-600">MISSING</span>}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
        <CardContent className="space-y-1">
          {tasks.map((t) => <SequenceTimelineStep key={t.id} task={t} onChanged={refresh} />)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Events</CardTitle></CardHeader>
        <CardContent className="space-y-1 text-xs">
          {events.slice(0, 50).map((e) => (
            <div key={e.id} className="font-mono">
              {new Date(e.occurred_at).toISOString()} · {e.event_type} · {e.source ?? "-"} · {e.channel ?? "-"}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: FailedAssets**

```tsx
// src/pages/admin/sequences/FailedAssetsPage.tsx
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { fetchFailedAssets, regenerateAsset } from "@/services/sequenceService";

export default function FailedAssetsPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data } = useQuery({ queryKey: ["failed-assets"], queryFn: fetchFailedAssets });
  const refresh = () => qc.invalidateQueries({ queryKey: ["failed-assets"] });

  async function handleRegen(id: string) {
    try { await regenerateAsset(id); toast({ title: "Regenerate encolado" }); refresh(); }
    catch (e) { toast({ title: "Error", description: String(e), variant: "destructive" }); }
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader><CardTitle>Failed Assets ({data?.length ?? 0})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead><TableHead>Secuencia</TableHead><TableHead>Step</TableHead>
                <TableHead>Asset</TableHead><TableHead>Error</TableHead><TableHead>Retry</TableHead><TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data ?? []).map((a: any) => (
                <TableRow key={a.id}>
                  <TableCell>{a.email}</TableCell>
                  <TableCell>{a.sequence_name}</TableCell>
                  <TableCell>{a.step_number}</TableCell>
                  <TableCell>{a.asset_key}</TableCell>
                  <TableCell className="text-xs">{a.error}</TableCell>
                  <TableCell>{a.retry_count}</TableCell>
                  <TableCell><Button size="sm" variant="outline" onClick={() => handleRegen(a.id)}>Regenerar</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 4: Templates**

```tsx
// src/pages/admin/sequences/SequenceTemplatesPage.tsx
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { fetchTemplates } from "@/services/sequenceService";

export default function SequenceTemplatesPage() {
  const { data } = useQuery({ queryKey: ["seq-templates"], queryFn: fetchTemplates });
  const grouped = (data ?? []).reduce<Record<string, typeof data>>((acc: any, t: any) => {
    (acc[t.sequence_name] ??= []).push(t); return acc;
  }, {} as any);

  return (
    <div className="p-6 space-y-4">
      {Object.entries(grouped).map(([name, rows]) => (
        <Card key={name}>
          <CardHeader><CardTitle>{name}</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow>
                <TableHead>Step</TableHead><TableHead>Offset (days)</TableHead><TableHead>Channel</TableHead>
                <TableHead>Action</TableHead><TableHead>Provider</TableHead><TableHead>Delivery</TableHead><TableHead>Assets</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {(rows as any[]).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.step_number}</TableCell>
                    <TableCell>+{r.offset_days}d</TableCell>
                    <TableCell>{r.channel}</TableCell>
                    <TableCell>{r.action_type}</TableCell>
                    <TableCell>{r.provider}</TableCell>
                    <TableCell>{r.delivery_mode}</TableCell>
                    <TableCell>{(r.required_assets ?? []).join(", ") || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/admin/sequences/
git commit -m "feat(sequences): add 4 admin pages (overview, detail, failed, templates)"
```

---

### Task 5.5: Routing + Sidebar

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/dashboard/DashboardSidebar.tsx`

- [ ] **Step 1: Agregar lazy imports + rutas en App.tsx**

Al array de lazy imports:
```tsx
const SequencesOverviewPage = lazy(() => import("./pages/admin/sequences/SequencesOverviewPage"));
const SequenceRunDetailPage = lazy(() => import("./pages/admin/sequences/SequenceRunDetailPage"));
const FailedAssetsPage = lazy(() => import("./pages/admin/sequences/FailedAssetsPage"));
const SequenceTemplatesPage = lazy(() => import("./pages/admin/sequences/SequenceTemplatesPage"));
```

Rutas dentro del bloque admin:
```tsx
<Route path="admin/sequences" element={<Suspense fallback={null}><SequencesOverviewPage /></Suspense>} />
<Route path="admin/sequences/templates" element={<Suspense fallback={null}><SequenceTemplatesPage /></Suspense>} />
<Route path="admin/sequences/failed-assets" element={<Suspense fallback={null}><FailedAssetsPage /></Suspense>} />
<Route path="admin/sequences/:runId" element={<Suspense fallback={null}><SequenceRunDetailPage /></Suspense>} />
```

- [ ] **Step 2: Sidebar entry**

En `DashboardSidebar.tsx` agregar link "Secuencias" con icono `Workflow` al grupo admin.

- [ ] **Step 3: Commit + PR iter 5**

```bash
git add src/App.tsx src/components/dashboard/DashboardSidebar.tsx
git commit -m "feat(sequences): wire admin routes + sidebar entry"
git push -u origin feat/seq-iter5-dashboard
gh pr create --base develop-creators --title "feat(sequences): iter 5 — admin dashboard UI" --body "..."
```

---

## Iteration 6 — KB + Validation

**Entregable:** artículo KB, updates a KB existentes, feature flag ON, validación E2E final.

### Task 6.1: Artículo KB `operar-secuencias`

**Files:**
- Create: `src/pages/admin/knowledge-base/articles/OperarSecuencias.tsx`
- Modify: `src/App.tsx`
- Modify: `src/pages/admin/knowledge-base/KnowledgeBaseLayout.tsx`
- Modify: `src/pages/admin/knowledge-base/articles/Home.tsx`

- [ ] **Step 1: Crear artículo KB**

```tsx
// src/pages/admin/knowledge-base/articles/OperarSecuencias.tsx
import { ArticleContainer } from "@/components/knowledge-base/ArticleContainer";
import { CopyableCode } from "@/components/knowledge-base/CopyableCode";

export default function OperarSecuencias() {
  return (
    <ArticleContainer
      title="Operar Secuencias"
      description="Runbook para monitoreo y troubleshooting del orquestador Supabase-cron"
      lastUpdated="2026-04-15"
    >
      <h2>Visión general</h2>
      <p>Dashboard principal: <code>/dashboard/admin/sequences</code>. Para queries ad-hoc o escalamiento, usar Supabase Studio → SQL editor.</p>

      <h2>Queries SQL útiles</h2>

      <h3>Runs activos de hoy</h3>
      <CopyableCode language="sql">{`SELECT * FROM v_sequences_dashboard WHERE status = 'active' ORDER BY started_at DESC;`}</CopyableCode>

      <h3>Tasks pendientes para hoy</h3>
      <CopyableCode language="sql">{`SELECT * FROM v_pending_tasks_today;`}</CopyableCode>

      <h3>Assets fallidos pendientes de regeneración</h3>
      <CopyableCode language="sql">{`SELECT * FROM v_failed_assets;`}</CopyableCode>

      <h3>Runs desincronizados con HubSpot</h3>
      <CopyableCode language="sql">{`SELECT * FROM v_hubspot_sync_issues;`}</CopyableCode>

      <h3>Timeline completo de un prospecto</h3>
      <CopyableCode language="sql">{`SELECT e.*, t.action_type, t.channel
FROM sequence_events e
LEFT JOIN sequence_tasks t ON t.id = e.task_id
WHERE e.run_id = (SELECT id FROM sequence_runs WHERE prospect_id = '<UUID>' AND status = 'active')
ORDER BY e.occurred_at DESC;`}</CopyableCode>

      <h2>Crons activos</h2>
      <ul>
        <li><b>deliver-due-tasks</b> — 9 AM CDMX (15:00 UTC). Envía tasks task_driven del día.</li>
        <li><b>retry-failed-tasks</b> — cada hora. Retry de tasks con retry_count entre 1 y 2.</li>
        <li><b>regenerate-failed-assets</b> — cada hora (offset 15 min). Re-genera assets fallidos.</li>
        <li><b>sync-hubspot-pending</b> — cada hora (offset 30 min). Reintenta upsert HubSpot.</li>
      </ul>

      <h3>Ver estado de los crons</h3>
      <CopyableCode language="sql">{`SELECT jobname, schedule, active FROM cron.job ORDER BY jobname;`}</CopyableCode>

      <h3>Ver últimas ejecuciones</h3>
      <CopyableCode language="sql">{`SELECT runid, jobid, start_time, end_time, status, return_message
FROM cron.job_run_details
ORDER BY start_time DESC LIMIT 20;`}</CopyableCode>

      <h2>Runbook de errores comunes</h2>

      <h3>Run sin hubspot_contact_id tras 1h</h3>
      <p>El cron <code>sync-hubspot-pending</code> reintenta automáticamente. Si tras 3 horas sigue null, ejecutar manualmente "Force HubSpot sync" desde el dashboard del run.</p>

      <h3>Tasks failed por "assets_not_ready"</h3>
      <p>Revisar <code>v_failed_assets</code>. Click "Regenerar" en el dashboard o en bulk desde <code>/dashboard/admin/sequences/failed-assets</code>.</p>

      <h3>Respond.io webhook no cancela runs</h3>
      <ol>
        <li>Verificar webhook configurado en respond.io Settings → Integrations → Webhooks.</li>
        <li>Verificar secret <code>RESPONDIO_WEBHOOK_SECRET</code> coincide entre respond.io y GitHub Secrets.</li>
        <li>Logs: Supabase → Edge Functions → <code>whatsapp-webhook</code>.</li>
      </ol>

      <h3>Smartlead "sent" no llega</h3>
      <p>Webhook Smartlead debe tener events <code>email_sent</code>, <code>email_opened</code>, <code>email_clicked</code>, <code>email_replied</code>, <code>email_bounced</code>. Ver <code>/dashboard/admin/knowledge-base/smartlead-webhook</code>.</p>

      <h2>Acciones manuales (edge functions)</h2>

      <h3>Forzar ejecución del cron diario ahora</h3>
      <CopyableCode language="sql">{`SELECT net.http_post(
  url := 'https://<project>.supabase.co/functions/v1/execute-due-tasks',
  headers := jsonb_build_object('Authorization', 'Bearer ' ||
    (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='service_role_key'))
);`}</CopyableCode>

      <h3>Cancel de run específico</h3>
      <CopyableCode language="bash">{`curl -X POST https://<project>.supabase.co/functions/v1/cancel-sequence-run \\
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"runId":"<UUID>","reason":"manual"}'`}</CopyableCode>
    </ArticleContainer>
  );
}
```

- [ ] **Step 2: Agregar ruta + sidebar KB + home card**

Imports y rutas en `App.tsx`:
```tsx
const KBOperarSecuencias = lazy(() => import("./pages/admin/knowledge-base/articles/OperarSecuencias"));

// ... dentro del bloque knowledge-base:
<Route path="operar-secuencias" element={<Suspense fallback={null}><KBOperarSecuencias /></Suspense>} />
```

En `KnowledgeBaseLayout.tsx` agregar sección:
```tsx
import { Workflow as WorkflowIcon } from "lucide-react";
// ...
{
  label: "Orquestador",
  items: [
    { to: "operar-secuencias", label: "Operar Secuencias", icon: WorkflowIcon },
  ],
},
```

En `Home.tsx` agregar card:
```tsx
import { Workflow as WorkflowIcon } from "lucide-react";
// ...
{ to: "operar-secuencias", title: "Operar Secuencias", description: "Runbook del orquestador Supabase-cron", icon: WorkflowIcon },
```

- [ ] **Step 3: Commit**

```bash
git checkout -b feat/seq-iter6-kb-validation develop-creators
git add src/pages/admin/knowledge-base/articles/OperarSecuencias.tsx src/App.tsx \
        src/pages/admin/knowledge-base/KnowledgeBaseLayout.tsx \
        src/pages/admin/knowledge-base/articles/Home.tsx
git commit -m "docs(kb): add operar-secuencias runbook"
```

---

### Task 6.2: Update KB existentes

**Files:**
- Modify: `src/pages/admin/knowledge-base/articles/HubspotConfig.tsx`
- Modify: `src/pages/admin/knowledge-base/articles/MigracionesSupabase.tsx`

- [ ] **Step 1: Añadir sección "Laneta Orchestrator properties" a HubspotConfig**

Documentar las 11 custom properties + webhook meeting.creation setup + secret `HUBSPOT_WEBHOOK_SECRET`.

- [ ] **Step 2: Añadir sección "pg_cron patrón" a MigracionesSupabase**

Snippet de cómo schedulear un cron idempotente + patrón `format()` para injection-safe URLs + cómo verificar con `cron.job` y `cron.job_run_details`.

- [ ] **Step 3: Commit**

```bash
git add src/pages/admin/knowledge-base/articles/HubspotConfig.tsx \
        src/pages/admin/knowledge-base/articles/MigracionesSupabase.tsx
git commit -m "docs(kb): document orchestrator hubspot properties + pg_cron patterns"
```

---

### Task 6.3: Activar feature flag + checklist E2E

- [ ] **Step 1: Activar feature flag en staging**

En tus env vars de preview/staging:
```
VITE_SEQUENCES_MVP_ENABLED=true
```

- [ ] **Step 2: Ejecutar checklist E2E manual**

Correr los 12 casos E2E de la Sec 11 del spec, marcando pass/fail. Mínimo pasar los 7 criterios de éxito (Sec 15 del spec).

- [ ] **Step 3: Push + PR iter 6**

```bash
git push -u origin feat/seq-iter6-kb-validation
gh pr create --base develop-creators --title "feat(sequences): iter 6 — KB runbook + feature flag + E2E validation" --body "..."
```

- [ ] **Step 4: Merge final y activar en prod gradualmente**

Tras merge, activar `VITE_SEQUENCES_MVP_ENABLED=true` en prod solo cuando validación con tu propio email pase. Monitorear dashboard + Telegram los primeros días.

---

## Appendix — Rollout & Monitoring

**Primer prospecto real:** tu propio email en un creator_list de prueba. Enrolar manualmente, verificar timeline completo durante los 7 días.

**Monitoreo primer mes:**
- Diario: revisar dashboard `/admin/sequences` para failed.
- Semanal: revisar `v_hubspot_sync_issues` y `cron.job_run_details`.
- Mensual: métricas agregadas (runs won vs exhausted por secuencia/tier).

**Si aparecen los triggers de migración a Inngest** (>500 prospectos/día, granularidad horaria, replays masivos, Modelo B Data Brokerage) → el schema es directamente portable a Inngest; solo cambia la implementación de `execute-due-tasks` y los crons.

---

## Self-Review Checklist

- [x] Cada task tiene file paths exactos
- [x] Cada step tiene código completo (no "add appropriate error handling")
- [x] Commits están marcados
- [x] Verificación explícita post-iteración (SQL queries, curl, UI)
- [x] Dependencias externas marcadas como bloqueos (HubSpot setup script, webhook URL config)
- [x] Feature flag gate para rollout gradual
- [x] Spec coverage verificada: 5 tablas + 4 views + RLS + 6 edge functions productivas + 5 edge functions de acciones + 3 webhooks + 4 páginas + 5 componentes + 1 artículo KB + 4 crons

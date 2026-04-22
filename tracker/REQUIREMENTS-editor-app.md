# REQUIREMENTS — App editor colaborativo de plantillas Smartlead (Plan B)

**Audiencia:** desarrollador (humano o AI tipo Claude) que implementará la app
**Stack objetivo:** React + Vite + TypeScript + Tailwind + Supabase
**Fuentes:** este doc + `plan-b/guia-creacion-plantillas.md` + ejemplos en `templates/_review-package/`

---

## ⚙️ Decisiones finales de scope (2026-04-22)

| # | Pregunta | Decisión |
|---|---|---|
| 1 | Scope multi-campaña vs solo Plan B | **Solo Plan B** — sin `platform`, sin `campaign_type`, sin `step_number` obligatorio |
| 2 | Ana edita HTML o solo plain text | **Solo plain text.** Ana nunca ve ni toca HTML. El converter corre transparente |
| 3 | Auth magic link o SSO existente | **Usar auth del proyecto existente** (user/pass). Asumir que `auth.users` ya está |
| 4 | Branch link & QR: campo separado o inline | **Placeholders `{{link}}` y `{{qr}}`** en el body. Configurados a nivel template, no Ana los edita. Se renderizan como preview visual |
| 5 | Export también HTML | **No, solo .txt** |
| 6 | Plantillas seed | **Las 3 actuales + 1 extra** (total 4 pre-cargadas) |

Estas decisiones simplifican el scope — ver sección "MVP simplificado" abajo.

---

## 0. Contexto y problema

### Situación actual

El equipo tiene 2 roles con fricción:

1. **Marketing (Ana):** escribe copy de emails cold outreach. Hoy usa Google Docs / Notion. No ve cómo se renderiza hasta el primer test send.
2. **Operador técnico:** recibe copy, aplica fixes de variables + conversión HTML + sube a Smartlead. Al probar descubre bugs → re-itera con Marketing → ciclo consume horas.

### Data dura del problema

- **9 iteraciones de plantillas el 2026-04-21** (~10 horas) para llegar a un render aceptable en Gmail
- Cada iteración requería: edit local → convert → upload Smartlead API → test send manual → feedback → repeat
- **Pipe fallback `{{first_name|there}}` rompe silenciosamente** — variable resuelve vacío en producción, imposible detectar sin test real
- **`\n\n` entre tags HTML** genera whitespace visible en Gmail (bug descubierto por iteración)

### Lo que resuelve esta app

1. Marketing edita **plain text** (comfortable, sin HTML) + ve preview live con render casi idéntico a Gmail
2. Warnings automáticos de variables inválidas / anti-patterns conocidos
3. Una sola fuente de verdad versionada (Supabase) — reemplaza `AUTHORIZED_*.txt` en disco
4. Operador hace 1 click "Export .txt" → pipeline existente `_upload_template_from_export.py` lo sube a Smartlead
5. Historial de versiones por plantilla → rollback fácil
6. Separa roles con RLS: Marketing edita drafts, operador aprueba

---

## 1. User personas + stories

### Persona A — Marketing Editor (Ana)
- Escribe copy cold outreach
- No técnica, no toca HTML
- Necesita feedback visual inmediato sin tener que pedir tests
- Trabaja en Google Docs hoy → curva de aprendizaje baja

**Stories:**
- Como editora, abro la plantilla "intro_fast_track" y veo el copy + preview lado a lado
- Edito el subject y el body en plain text
- Veo el preview actualizarse en tiempo real (debounced 300ms)
- Si escribo `{{first_name|there}}` recibo warning inline: "Pipe fallback no soportado en Smartlead"
- Cambio el persona de preview (Leslie / Daniel / Bri) para ver render con datos distintos
- Presiono Save con un commit message: "ajusté hook del subject"
- Veo el historial de mis versiones anteriores

### Persona B — Operador técnico (dueño del API)
- Descarga copy aprobado, sube a Smartlead
- Aprueba versiones para producción
- Puede editar HTML directo si necesita un tweak que Marketing no puede hacer

**Stories:**
- Reviewo diff entre v4 (producción) y v5 (draft de Marketing)
- Marco v5 como "approved" → aparece badge verde
- Click "Export .txt" → bajo archivo y corro `_upload_template_from_export.py intro_fast_track_v5.txt --campaign 3212141 --step 1`
- Recibo notificación cuando Marketing guarda draft

### Persona C — Stakeholder (read-only)
- Ve plantillas sin tocar
- Consulta métricas (futuro, no MVP)

---

## 2. Arquitectura

### Stack

| Capa | Tool | Razón |
|---|---|---|
| Frontend | React 18 + Vite + TypeScript | Match patrón existente |
| Styling | Tailwind CSS | Match patrón existente |
| Editor | `<textarea>` simple con line numbers custom O Monaco | Monaco es overkill para plain text pero da highlight gratis |
| Preview | `<iframe srcDoc>` sandboxed | Aísla CSS, previene scripts |
| State server | Supabase client + React Query | Sync automática + optimistic |
| State local | Zustand | Ligero para UI state |
| Auth | Supabase Auth con magic link | Ana no quiere password |
| Routing | react-router-dom | Simple |

### Deploy

- Frontend: Vercel o Netlify (Supabase URL + anon key en env)
- Backend: Supabase managed (ya tienes cuenta)
- Custom domain: opcional

---

## 3. Data model (Supabase / Postgres)

### Tabla `templates`

**Simplificada para solo Plan B** (sin platform, sin campaign_type, sin step_number obligatorio):

```sql
CREATE TABLE templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,                    -- 'intro_fast_track', 'friction_removal', 'social_proof'
  display_name text NOT NULL,                   -- 'Intro Fast Track'
  description text,
  step_number int,                              -- 1, 2, 3 (opcional, solo informativo)

  -- Config del link + QR (operador técnico configura, Ana NO edita)
  branch_link_url text,                         -- 'https://3c7t6.app.link/apply-fast-track'
  qr_image_url text,                            -- Supabase public URL de la PNG
  cta_label text DEFAULT 'Apply here',          -- texto del botón en preview

  smartlead_campaign_id bigint DEFAULT 3212141, -- Plan B campaign
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users,
  archived boolean DEFAULT false
);
```

**Nota:** `branch_link_url` y `qr_image_url` se sustituyen en el preview cuando Ana escribe `{{link}}` o `{{qr}}` en el body. Ver sección 4.5 (Placeholders de link/QR).

### Tabla `template_versions`

```sql
CREATE TABLE template_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES templates ON DELETE CASCADE,
  version int NOT NULL,                         -- 1, 2, 3... auto-increment per template
  subject text NOT NULL,
  body_plain text NOT NULL,                     -- source de marketing (editable)
  body_html text,                               -- auto-generado (read-only para Ana)
  body_html_hash text,                          -- md5 para detectar cambios
  commit_message text,                          -- "ajusté hook"
  status text DEFAULT 'draft'                   -- 'draft' | 'approved' | 'in_production' | 'archived'
    CHECK (status IN ('draft','approved','in_production','archived')),
  validation_warnings jsonb,                    -- [{code, severity, message, location}]
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users,
  UNIQUE(template_id, version)
);

-- Only one in_production per template at a time
CREATE UNIQUE INDEX idx_one_production_per_template
  ON template_versions(template_id) WHERE status = 'in_production';
```

### Tabla `variable_registry`

Seed data crítica — define qué variables son válidas:

```sql
CREATE TABLE variable_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,                       -- 'smartlead' | 'brevo'
  name text NOT NULL,                           -- 'first_name', 'tiktok'
  kind text NOT NULL                            -- 'native' | 'custom_field' | 'unsupported'
    CHECK (kind IN ('native','custom_field','unsupported')),
  description text,
  example_value text,                           -- para preview cuando no hay persona
  supports_pipe_fallback boolean DEFAULT false,
  warning_message text,                         -- mensaje custom si se detecta
  UNIQUE(platform, name)
);
```

**Seed inicial obligatorio (Smartlead):**

```sql
-- NATIVE (Smartlead resuelve automáticamente)
INSERT INTO variable_registry (platform, name, kind, description, example_value) VALUES
  ('smartlead','first_name','native','Nombre del lead','Leslie'),
  ('smartlead','last_name','native','Apellido','Garcia'),
  ('smartlead','email','native','Email','lesliegcrespo@gmail.com'),
  ('smartlead','company_name','native','Empresa','Laneta'),
  ('smartlead','website','native','Sitio web',NULL);

-- CUSTOM_FIELD (vienen del CSV de upload)
INSERT INTO variable_registry (platform, name, kind, description, example_value) VALUES
  ('smartlead','tiktok','custom_field','Handle TikTok (del CSV)','leslie.gloria'),
  ('smartlead','follower_count','custom_field','Número seguidores','983469'),
  ('smartlead','region','custom_field','Región','US'),
  ('smartlead','language','custom_field','Idioma','en'),
  ('smartlead','instagram_link','custom_field','URL IG',NULL),
  ('smartlead','tiktok_link','custom_field','URL TikTok',NULL),
  ('smartlead','youtube_link','custom_field','URL YT',NULL);

-- UNSUPPORTED (warnings)
INSERT INTO variable_registry (platform, name, kind, warning_message) VALUES
  ('smartlead','sender_name','unsupported','Smartlead NO mapea from_name a {{sender_name}}. Queda literal.'),
  ('smartlead','unsubscribe','unsupported','Smartlead inyecta unsubscribe automáticamente al final. No usar.'),
  ('smartlead','contact.NOMBRE','unsupported','Sintaxis Brevo, no Smartlead'),
  ('smartlead','main_platforme','unsupported','No es campo nativo ni está en CSV. Hardcodear "TikTok".'),
  ('smartlead','max_followers','unsupported','Brevo-only. Usar {{follower_count}} del CSV.'),
  ('smartlead','username','unsupported','Brevo-only. Usar {{tiktok}} del CSV.'),
  ('smartlead','vertical','unsupported','No existe en CSV. Eliminar.');
```

### Tabla `preview_personas`

Datos fake para preview (Marketing selecciona cuál usar):

```sql
CREATE TABLE preview_personas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,                           -- "Leslie (TikTok 983K)"
  variables jsonb NOT NULL,                     -- {"first_name":"Leslie","tiktok":"leslie.gloria",...}
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Seed:
INSERT INTO preview_personas (name, variables, is_default) VALUES
  ('Leslie (TikTok 983K)',
   '{"first_name":"Leslie","last_name":"Garcia","email":"lesliegcrespo@gmail.com","tiktok":"leslie.gloria","follower_count":"983469","region":"US","language":"en"}',
   true),
  ('Daniel (test)',
   '{"first_name":"Daniel","email":"daniel@laneta.com","tiktok":"danielsample","follower_count":"750000","region":"US","language":"en"}',
   false),
  ('Bri (sin IG)',
   '{"first_name":"Bri","email":"brcamp1ac@gmail.com","tiktok":"bri.veronica","follower_count":"995829","region":"US","language":"en"}',
   false),
  ('Lead sin nombre (edge case)',
   '{"first_name":"","tiktok":"xyz","follower_count":"500000"}',
   false);
```

### Tabla `plain_to_html_rules` (opcional, para hacer configurable la conversión)

```sql
CREATE TABLE plain_to_html_rules (
  id serial PRIMARY KEY,
  rule_order int NOT NULL,
  pattern text NOT NULL,                        -- regex
  replacement text NOT NULL,                    -- HTML
  description text,
  enabled boolean DEFAULT true
);
```

Recomendación: hard-codear en código por simplicidad del MVP. Mover a tabla solo si hay iteración frecuente.

---

## 4. Conversor plain → HTML (CRÍTICO)

Esta es la lógica central. **Debe replicar exactamente el algoritmo de `_daily_snapshot.py` y `guia-creacion-plantillas.md` §3.**

### Input

Plain text multi-línea con `{{variables}}`, párrafos separados por `\n\n`, líneas con `\n` simple, bullets con `- `.

### Output

HTML minimal con envelope completo.

### Algoritmo (TypeScript)

```typescript
const WRAPPER_STYLE =
  'max-width:600px;margin:0;padding:0 16px;font-family:Arial,Helvetica,sans-serif;' +
  'font-size:15px;color:#222;line-height:1.5;';
const P_STYLE = 'margin:0 0 14px 0;';
const UL_STYLE = `${P_STYLE}margin:0 0 14px 20px;padding:0;`;
const LI_STYLE = 'margin:0 0 4px 0;';

function plainToHtml(plain: string): string {
  const paragraphs = plain.trim().split(/\n\s*\n/);
  const parts: string[] = [];

  for (const p of paragraphs) {
    const lines = p.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    // All lines start with "- " → render as <ul>
    if (lines.every(l => l.startsWith('- '))) {
      const items = lines
        .map(l => `<li style="${LI_STYLE}">${escapeHtml(l.slice(2))}</li>`)
        .join('');
      parts.push(`<ul style="${UL_STYLE}">${items}</ul>`);
      continue;
    }

    // Regular paragraph: \n within → <br>
    const inner = lines.map(escapeHtml).join('<br>');
    parts.push(`<p style="${P_STYLE}">${inner}</p>`);
  }

  // Join parts with SINGLE \n (never \n\n between HTML tags — regla §3.2)
  const innerHtml = parts.join('\n');

  return (
    '<!DOCTYPE html><html><head><meta charset="UTF-8"></head>' +
    '<body style="margin:0;padding:0;background:#ffffff;">' +
    `<div style="${WRAPPER_STYLE}">\n${innerHtml}\n</div>` +
    '</body></html>'
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
```

### 4.5 Placeholders `{{link}}` y `{{qr}}` (CRÍTICO — decisión scope)

Ana escribe estos marcadores en el body como si fueran variables normales. El converter los reemplaza con el link/QR configurado al nivel del template.

#### En el plain text que Ana escribe:

```
Apply here:
{{link}}

{{qr}}

Important: Apply through your mobile device.
```

#### En el preview (que Ana ve en la derecha):

```
Apply here:
[Apply Fast Track Now →]   ← botón azul clickable apuntando a template.branch_link_url

[QR code 140×140]           ← imagen de template.qr_image_url (o placeholder si null)

Important: Apply through your mobile device.
```

#### En el .txt exportado:

El `{{link}}` y `{{qr}}` se reemplazan con el URL real antes de exportar:

```
Apply here:
https://3c7t6.app.link/apply-fast-track

[QR image: https://emrbhjosdqhsmnprggkf.supabase.co/storage/v1/object/public/brevo-assets/qr/step1_apply_fast_track.png]

Important: Apply through your mobile device.
```

**El script de upload `_upload_template_from_export.py` procesa estos marcadores y genera el HTML minimal final con `<a>` + `<img>`.**

#### Converter logic (TypeScript, para preview en cliente):

```typescript
function renderPlaceholders(html: string, template: Template): string {
  // {{link}} → botón azul estilizado
  const linkHtml = template.branch_link_url
    ? `<div style="text-align:center;margin:6px 0 10px 0;">
         <a href="${template.branch_link_url}" target="_blank" rel="noopener noreferrer"
            style="display:inline-block;padding:12px 28px;background:#4F46E5;
                   color:#ffffff;text-decoration:none;border-radius:6px;
                   font-family:Arial;font-size:14px;font-weight:700;">
           ${template.cta_label} &rarr;
         </a>
       </div>`
    : '<div style="padding:8px;background:#fef3c7;border:1px dashed #f59e0b;color:#92400e;font-size:12px;">⚠️ Link no configurado (configurar en template settings)</div>';

  // {{qr}} → imagen QR o placeholder
  const qrHtml = template.qr_image_url
    ? `<div style="text-align:center;margin:10px 0 14px 0;">
         <a href="${template.branch_link_url}" target="_blank">
           <img src="${template.qr_image_url}" alt="Scan to apply" width="140"
                style="display:block;border:0;width:140px;height:auto;margin:0 auto;">
         </a>
         <p style="margin:6px 0 0 0;font-size:12px;color:#64748b;">Scan from your phone</p>
       </div>`
    : '<div style="padding:8px;background:#fef3c7;border:1px dashed #f59e0b;color:#92400e;font-size:12px;">⚠️ QR no configurado</div>';

  return html
    .replace(/\{\{\s*link\s*\}\}/g, linkHtml)
    .replace(/\{\{\s*qr\s*\}\}/g, qrHtml);
}
```

#### Validación

- Si Ana escribe `{{link}}` pero `template.branch_link_url` es null → warning: "⚠️ Configurar branch_link_url en settings del template"
- Si Ana escribe `{{qr}}` sin `qr_image_url` → warning similar
- Si body NO contiene `{{link}}` → info: "Template sin CTA detectable, revisar que esté intencional"
- `{{link}}` y `{{qr}}` NO son variables de lead — no chequear contra `variable_registry`

### Casos especiales (futuro, no MVP)

- Detectar "Apply here:\nhttps://..." → wrapping automático en `<a>`
- Botón CTA con texto custom por step

---

## 5. Validador (CRÍTICO)

Corre en cada keystroke (debounced 300ms). Devuelve array de warnings:

```typescript
type Severity = 'error' | 'warning' | 'info';

interface Warning {
  code: string;                 // 'VAR_UNSUPPORTED', 'PIPE_FALLBACK', etc.
  severity: Severity;
  message: string;
  location: 'subject' | 'body' | 'global';
  lineNumber?: number;
  columnStart?: number;
  columnEnd?: number;
  suggestedFix?: string;
}
```

### Reglas a implementar (basadas en `guia-creacion-plantillas.md`)

#### V1 — Variables

```typescript
// Extraer todas las {{...}} del subject + body
const varRegex = /\{\{\s*([^}]+?)\s*\}\}/g;
const found = [...text.matchAll(varRegex)];

for (const match of found) {
  const raw = match[1];

  // V1.1 — Pipe fallback (siempre ERROR)
  if (raw.includes('|')) {
    warnings.push({
      code: 'PIPE_FALLBACK',
      severity: 'error',
      message: `Pipe fallback no soportado en Smartlead. "${match[0]}" resolverá VACÍO en producción.`,
      suggestedFix: `Cambiar a {{${raw.split('|')[0].trim()}}} y garantizar que todos los leads tengan el campo poblado.`,
    });
    continue;
  }

  // V1.2 — Variable desconocida
  const registry = await getRegistryForPlatform('smartlead');
  const entry = registry.find(r => r.name === raw.trim());
  if (!entry) {
    warnings.push({
      code: 'VAR_UNKNOWN',
      severity: 'warning',
      message: `Variable {{${raw}}} no está en el registry. Verificar que exista en el CSV de leads.`,
    });
    continue;
  }

  // V1.3 — Variable unsupported
  if (entry.kind === 'unsupported') {
    warnings.push({
      code: 'VAR_UNSUPPORTED',
      severity: 'error',
      message: entry.warning_message,
    });
  }
}
```

#### V2 — Subject

- V2.1 — Length > 60 chars → warning
- V2.2 — ALL CAPS → warning
- V2.3 — Contiene `!!!`, `$$$`, "FREE", "ACT NOW", "URGENT" → warning
- V2.4 — Más de 1 emoji → warning (Gmail Promotions)
- V2.5 — Contiene `{{` → info: "personalización en subject detectada, verificar que resuelva"

#### V3 — Body — anti-patterns de deliverability

- V3.1 — "Meta Official Partner" aparece 2+ veces → warning (trigger phrase)
- V3.2 — "$3K-$9K" o similar aparece 5+ veces → warning (keyword stuffing)
- V3.3 — Body contiene `display:none` → error (spam trigger)
- V3.4 — Ratio texto/HTML del output < 40% → warning

#### V4 — Body — estructura

- V4.1 — `\n\n\n` (3 o más newlines) → warning: "Múltiples líneas en blanco consecutivas. El converter las colapsa, pero verificar intención."
- V4.2 — Body longer than 3000 words → warning
- V4.3 — URL cruda sin enlace (ok en plain text pero flag info)
- V4.4 — Body vacío → error

#### V5 — Subject + Body combinados

- V5.1 — Subject vacío → error (no se puede guardar)
- V5.2 — Body vacío → error
- V5.3 — Total HTML size > 20KB → warning

---

## 6. UX / Pantallas

### Layout

```
┌────────────────────────────────────────────────────────────────────────┐
│ TOPBAR: [Logo] Plantillas > intro_fast_track (v5 draft)  [Save] [⋮]   │
├──────────────┬─────────────────────────────────┬───────────────────────┤
│ SIDEBAR      │ EDITOR                          │ PREVIEW               │
│              │                                 │                       │
│ Plantillas   │ Subject: [_______________ 45/60]│ ┌─────────────────┐   │
│ ├ Plan B     │                                 │ │ From: Dan       │   │
│ │ ├ intro ●  │ [Persona: Leslie ▾]            │ │ Subject: ...    │   │
│ │ ├ friction │                                 │ ├─────────────────┤   │
│ │ └ social   │ Hey {{first_name}},             │ │                 │   │
│ │            │                                 │ │ Hey Leslie,     │   │
│ ├ Archivo    │ Based on your content on        │ │                 │   │
│ └ Nueva+     │ @{{tiktok}}, you qualify...     │ │ Based on your   │   │
│              │                                 │ │ content on      │   │
│ ───────      │ [... body textarea ...]         │ │ @leslie.gloria  │   │
│ Versiones    │                                 │ │                 │   │
│ v5 ● draft   │                                 │ │ [... render ...]│   │
│ v4 approved  │ ────────────────────────────    │ │                 │   │
│ v3 archived  │ WARNINGS (3)                    │ └─────────────────┘   │
│ v2           │ ⚠️ Subject 62/60 chars          │                       │
│ v1           │ ❌ {{sender_name}} no soportada │ [Gmail Desktop ▾]     │
│              │ ℹ️ Variable en subject          │ [Scroll to top]       │
└──────────────┴─────────────────────────────────┴───────────────────────┘
```

### Comportamientos clave

- **Split 50/50** con divider draggable (mín 30%, máx 70%)
- **Debounce 300ms** en el editor → actualiza preview + validaciones
- **Variables highlight** en editor (color azul `{{variable}}`)
- **Cursor en body:** si sobre una variable, el tooltip muestra: "tipo: native, ejemplo: Leslie"
- **Sidebar colapsable** en mobile
- **Persona selector** arriba del editor → cambia datos del preview
- **Warnings inline** con click para saltar a la línea problemática
- **Auto-save draft** cada 30 segundos (opcional, con toggle)

### Save modal

```
┌─────────────────────────────────────┐
│ Guardar nueva versión (v6)          │
├─────────────────────────────────────┤
│ Commit message:                     │
│ [_______________________________]   │
│ ej: "ajusté subject, quité emoji"  │
│                                     │
│ ⚠️ 3 warnings activos                │
│ 1 error — no se puede guardar       │
│                                     │
│         [Cancelar] [Guardar draft]  │
└─────────────────────────────────────┘
```

- Si hay errors (severity=error), botón **deshabilitado**
- Warnings no bloquean pero se almacenan en `validation_warnings` del row

### Export flow

Click "Export .txt":

1. Genera archivo con formato:

```
---
# Template: intro_fast_track
# Version: 5
# Status: approved
# Subject: Get paid by Meta for content you've already made
# Branch link: https://3c7t6.app.link/apply-fast-track
# Platform: smartlead
# Exported: 2026-04-22T14:30:00Z
# Exported by: ana@laneta.com
#
# VARIABLES USED:
#   - {{first_name}} (native)
#   - {{tiktok}} (custom_field)
#   - {{follower_count}} (custom_field)
---

Hey {{first_name}},

Based on your content on @{{tiktok}}, you qualify for...

...
```

2. Descarga como `intro_fast_track_v5.txt`
3. El parser del script `_upload_template_from_export.py` (futuro) lee los metadatos del header

---

## 7. Permisos (Supabase RLS)

### Roles

| Role | Descripción | Permisos |
|---|---|---|
| `editor` | Marketing (Ana) | Crear/editar drafts. NO approve, NO export, NO delete |
| `operator` | Técnico | Todo: edit + approve + export + delete |
| `viewer` | Stakeholder | Read-only |

### Policies básicas

```sql
-- Todos pueden leer templates no archivados
CREATE POLICY "read templates" ON templates FOR SELECT
  USING (NOT archived OR auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'operator'));

-- Solo editores y operators crean templates
CREATE POLICY "create templates" ON templates FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('editor','operator')));

-- Editors pueden crear drafts; operators pueden crear cualquier versión
CREATE POLICY "create versions" ON template_versions FOR INSERT
  WITH CHECK (
    (auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'editor')
      AND status = 'draft')
    OR auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'operator')
  );

-- Solo operator puede cambiar status a approved/in_production
CREATE POLICY "update status" ON template_versions FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'operator'));
```

### Tabla auxiliar

```sql
CREATE TABLE user_roles (
  user_id uuid REFERENCES auth.users PRIMARY KEY,
  role text CHECK (role IN ('editor','operator','viewer')) NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

---

## 8. MVP simplificado (ajustado a decisiones del 2026-04-22)

### Incluido ✅

- [ ] Auth con **user/pass existente** del proyecto (no magic link)
- [ ] Sidebar con lista de 4 plantillas pre-cargadas
- [ ] Editor split-pane (subject + body **plain text**, Ana NUNCA ve HTML)
- [ ] Converter plain → HTML corre en segundo plano (solo para preview)
- [ ] Placeholders `{{link}}` y `{{qr}}` renderizan en preview con CTA + QR visual
- [ ] Preview iframe con persona selector (3-4 personas seed)
- [ ] Validador live con reglas V1-V5 + validación de `{{link}}`/`{{qr}}`
- [ ] Variable registry seed (solo Smartlead — Plan B)
- [ ] Save draft con commit message (opcional)
- [ ] Lista de versiones en sidebar con rollback
- [ ] **Export solo .txt** (sin HTML export)
- [ ] **4 plantillas seed** (Step 1, 2, 3 actuales + 1 extra)
- [ ] RLS básico (editor = Marketing, operator = técnico)

### NO incluido (v2 future)

- Colaboración real-time multi-usuario
- Comments inline
- Test send directo desde app
- Sync bidireccional con Smartlead API (upload + pull)
- A/B variants side-by-side
- Analytics de qué versión convierte mejor
- Mobile app
- Comparador diff visual entre versiones (solo texto por ahora)

---

## 9. Integración con pipeline existente

### Post-export script (a crear en `scripts/_upload_template_from_export.py`)

```bash
python _upload_template_from_export.py intro_fast_track_v5.txt \
  --campaign 3212141 --step 1 --dry-run
```

Lógica:

1. Lee el `.txt` exportado
2. Parsea el header (subject, version, branch_link, variables used)
3. Aplica el mismo converter plain → HTML que la app web
4. Compara hash con versión actual en Smartlead
5. Si difiere y no `--dry-run`: POST a Smartlead sequences
6. Guarda backup pre-change en `plan-b/_backup_sequences_<campaign>_<hash>.json`
7. Verifica post-upload (GET sequences, compara hash)

Esto mantiene la app desacoplada de Smartlead (la app es solo editor + preview + storage). El operador técnico hace el upload.

---

## 10. Seed data inicial (4 plantillas pre-cargadas)

### Plantillas como versión 1 `in_production` cada una

| # | name | display_name | step | source file | branch_link | qr_image |
|---|---|---|---|---|---|---|
| 1 | `intro_fast_track` | Intro Fast Track | 1 | `AUTHORIZED_intro_fast_track.txt` | `https://3c7t6.app.link/apply-fast-track` | `step1_apply_fast_track.png` |
| 2 | `friction_removal` | Friction Removal | 2 | `AUTHORIZED_friction_removal.txt` | `https://3c7t6.app.link/friction-removal` | `step2_friction_removal.png` |
| 3 | `social_proof` | Social Proof | 3 | `AUTHORIZED_social_proof.txt` | `https://3c7t6.app.link/Kb6lnRgTw2b` | `step3_social_proof.png` |
| 4 | `plantilla_extra` | Plantilla extra (placeholder) | null | (vacía / edit desde cero) | null | null |

**Subjects seed (pre-cargados):**

- Step 1: `Get paid by Meta for content you've already made`
- Step 2: `Clearing up one misconception about this program`
- Step 3: `TikTok is paying less. Facebook is paying more.`
- Extra: (vacío — Marketing lo llena)

**QR URLs completos (Supabase):**

```
https://emrbhjosdqhsmnprggkf.supabase.co/storage/v1/object/public/brevo-assets/qr/step1_apply_fast_track.png
https://emrbhjosdqhsmnprggkf.supabase.co/storage/v1/object/public/brevo-assets/qr/step2_friction_removal.png
https://emrbhjosdqhsmnprggkf.supabase.co/storage/v1/object/public/brevo-assets/qr/step3_social_proof.png
```

**Procesamiento del body seed:**

Los `AUTHORIZED_*.txt` tienen URLs hardcoded de Facebook. Al cargar como seed en Supabase, hacer replace:

```python
body = body.replace(
    'https://www.facebook.com/creator_programs/signup?referral_code=laneta',
    '{{link}}'
)
# Si detecta patrón "imagen QR" en el txt original, reemplazar por {{qr}}
```

Así Ana ve el body con `{{link}}` y `{{qr}}` como placeholders, no con URLs hardcoded.

---

## 11. Testing checklist (dev debe validar)

### Funcionales

- [ ] Crear nueva plantilla → aparece en sidebar
- [ ] Editar body → preview actualiza en <500ms
- [ ] Escribir `{{first_name|fallback}}` → error rojo inline
- [ ] Escribir `{{sender_name}}` → error rojo + link a doc
- [ ] Escribir `{{tiktok}}` → ok, resuelve en preview
- [ ] Cambiar persona → preview cambia datos
- [ ] Save draft → versión +1, aparece en sidebar
- [ ] Operator cambia status → badge verde + versión anterior queda
- [ ] Export .txt → bajada con metadatos correctos
- [ ] Ana (editor) NO puede marcar approved → UI esconde el botón
- [ ] Ver versión antigua → read-only, botón "Restore" crea nueva

### Edge cases

- [ ] Subject vacío → save deshabilitado
- [ ] Body vacío → save deshabilitado
- [ ] Variable no en registry → warning amber
- [ ] HTML output > 20KB → warning
- [ ] `\n\n\n` múltiples → collapse en converter + warning
- [ ] Persona sin la variable usada → muestra literal `{{x}}` en preview + info inline

### Integración

- [ ] Export .txt parseable por `_upload_template_from_export.py` (mock)
- [ ] 3 plantillas seed importadas correctamente
- [ ] Variable registry completo (7 native + 7 custom + 7 unsupported)

---

## 12. Referencias a archivos existentes

Para que el implementador entienda el contexto:

| Archivo | Qué contiene | Relevancia |
|---|---|---|
| `plan-b/guia-creacion-plantillas.md` | **Reglas HTML, variables, anti-patterns** | ⭐ CRÍTICO — leer completo |
| `plan-b/razones-html-vs-plain-cold.md` | Por qué plain text sobre HTML marketing en cold | Contexto de producto |
| `plan-b/resumen-ejecutivo-2026-04-21.md` | Timeline de iteraciones + learnings | Contexto |
| `templates/AUTHORIZED_*.txt` | 3 plantillas seed (source of truth actual) | Data inicial |
| `templates/smartlead_step*_*.html` | Versiones HTML en producción | Output esperado del converter |
| `templates/_review-package/_preview-all.html` | Referencia de UX de preview con tabs | Inspiración visual |
| `scripts/_daily_snapshot.py` | Script Python que corre contra Smartlead | Patrón para el script de upload |
| `envios/500k-1M/listas-diarias/2026-04-21/_consolidated_day01_360.csv` | Ejemplo del CSV de leads — columnas = variables disponibles | Validar registry |

---

## 13. Métricas de éxito (medir post-launch)

- **Tiempo hasta primera plantilla aprobada** por Marketing sin asistencia técnica (target: <30 min)
- **Número de iteraciones** antes de aprobación (baseline 9 → target 2-3)
- **Horas operador técnico** por plantilla (baseline ~5h → target <30 min)
- **Warnings ignorados que rompieron en producción** (target: 0)

---

## 14. Preguntas abiertas para el implementador

1. ¿Usar Monaco Editor o textarea nativo? (Monaco = highlight gratis + más peso)
2. ¿Auto-save draft cada 30 seg o solo manual? (recomiendo manual para MVP)
3. ¿Preview Gmail/Outlook toggle o solo Gmail? (Gmail suficiente para MVP)
4. ¿Diff visual entre versiones en MVP o v2?

### Ya resueltas (no volver a preguntar)

5. ~~Branch link como campo separado o inline~~ → **Placeholder `{{link}}` en body + URL en `templates.branch_link_url`**
6. ~~Multi-plataforma vs solo Smartlead~~ → **Solo Plan B / Smartlead**
7. ~~Ana edita HTML~~ → **No, solo plain text**
8. ~~Auth~~ → **User/pass del proyecto existente**
9. ~~Export HTML también~~ → **No, solo .txt**
10. ~~Número de plantillas seed~~ → **4 (3 actuales + 1 extra)**

---

## 15. Riesgos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Converter plain→HTML diverge del script Python existente | Plantillas renderizan distinto en prod | Extraer el converter a librería compartida O tests de regresión con 10 casos |
| Smartlead cambia variables nativas | Registry queda desactualizado | UI admin para editar `variable_registry` sin deploy |
| Ana escribe HTML accidental | Converter puede escape o preservar | Decisión MVP: escape todo HTML del input (Ana solo escribe plain) |
| Iframe preview rompe CSP | Preview no renderiza | Usar `srcDoc` + `sandbox="allow-same-origin"` sin allow-scripts |

---

*Documento generado 2026-04-22 basado en `guia-creacion-plantillas.md` + iteraciones reales del 2026-04-21. Entregable para desarrollo con Claude en proyecto separado.*

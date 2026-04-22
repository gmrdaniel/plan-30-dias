-- Migration 030: Editor colaborativo de plantillas Smartlead (Fase 1 / infraestructura)
-- Implementa §3 de REQUIREMENTS-editor-app.md
--
-- Tablas nuevas:
--   - templates              (metadata por plantilla + branch link + QR)
--   - template_versions      (historial versionado; una sola in_production por template)
--   - variable_registry      (qué vars son native/custom_field/unsupported en Smartlead)
--   - preview_personas       (datos fake para preview)
--   - plantilla_user_roles   (editor / operator / viewer — namespaced para no colisionar)
--
-- Nota: todos los objetos van prefijados (o quedan claramente aislados) para no
-- interferir con el tracker base.

-- ─────────────────────────────────────────────────────────────────
-- 1. TEMPLATES
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text,
  step_number int,
  branch_link_url text,
  qr_image_url text,
  cta_label text DEFAULT 'Apply here',
  smartlead_campaign_id bigint DEFAULT 3212141,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users,
  archived boolean DEFAULT false
);

-- ─────────────────────────────────────────────────────────────────
-- 2. TEMPLATE VERSIONS
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS template_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES templates ON DELETE CASCADE,
  version int NOT NULL,
  subject text NOT NULL,
  body_plain text NOT NULL,
  body_html text,
  body_html_hash text,
  commit_message text,
  status text DEFAULT 'draft'
    CHECK (status IN ('draft','approved','in_production','archived')),
  validation_warnings jsonb,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users,
  UNIQUE(template_id, version)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_one_production_per_template
  ON template_versions(template_id) WHERE status = 'in_production';

CREATE INDEX IF NOT EXISTS idx_template_versions_template
  ON template_versions(template_id, version DESC);

-- ─────────────────────────────────────────────────────────────────
-- 3. VARIABLE REGISTRY
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS variable_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  name text NOT NULL,
  kind text NOT NULL
    CHECK (kind IN ('native','custom_field','unsupported')),
  description text,
  example_value text,
  supports_pipe_fallback boolean DEFAULT false,
  warning_message text,
  UNIQUE(platform, name)
);

-- ─────────────────────────────────────────────────────────────────
-- 4. PREVIEW PERSONAS
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS preview_personas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  variables jsonb NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────
-- 5. USER ROLES (namespaced para plantillas — no colisiona con tracker)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS plantilla_user_roles (
  user_id uuid REFERENCES auth.users PRIMARY KEY,
  role text CHECK (role IN ('editor','operator','viewer')) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────
-- 6. GRANTS (necesarios para anon/authenticated según patrón del tracker)
-- ─────────────────────────────────────────────────────────────────
GRANT SELECT ON templates TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON templates TO authenticated;

GRANT SELECT ON template_versions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON template_versions TO authenticated;

GRANT SELECT ON variable_registry TO anon, authenticated;
GRANT SELECT ON preview_personas TO anon, authenticated;

GRANT SELECT ON plantilla_user_roles TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON plantilla_user_roles TO authenticated;

-- ─────────────────────────────────────────────────────────────────
-- 7. SEED: variable_registry (Smartlead)
-- ─────────────────────────────────────────────────────────────────
INSERT INTO variable_registry (platform, name, kind, description, example_value) VALUES
  ('smartlead','first_name','native','Nombre del lead','Leslie'),
  ('smartlead','last_name','native','Apellido','Garcia'),
  ('smartlead','email','native','Email','lesliegcrespo@gmail.com'),
  ('smartlead','company_name','native','Empresa','Laneta'),
  ('smartlead','website','native','Sitio web',NULL),
  ('smartlead','tiktok','custom_field','Handle TikTok (del CSV)','leslie.gloria'),
  ('smartlead','follower_count','custom_field','Número seguidores','983469'),
  ('smartlead','region','custom_field','Región','US'),
  ('smartlead','language','custom_field','Idioma','en'),
  ('smartlead','instagram_link','custom_field','URL IG',NULL),
  ('smartlead','tiktok_link','custom_field','URL TikTok',NULL),
  ('smartlead','youtube_link','custom_field','URL YT',NULL)
ON CONFLICT (platform, name) DO NOTHING;

INSERT INTO variable_registry (platform, name, kind, warning_message) VALUES
  ('smartlead','sender_name','unsupported','Smartlead NO mapea from_name a {{sender_name}}. Queda literal.'),
  ('smartlead','unsubscribe','unsupported','Smartlead inyecta unsubscribe automáticamente al final. No usar.'),
  ('smartlead','contact.NOMBRE','unsupported','Sintaxis Brevo, no Smartlead'),
  ('smartlead','main_platforme','unsupported','No es campo nativo ni está en CSV. Hardcodear "TikTok".'),
  ('smartlead','max_followers','unsupported','Brevo-only. Usar {{follower_count}} del CSV.'),
  ('smartlead','username','unsupported','Brevo-only. Usar {{tiktok}} del CSV.'),
  ('smartlead','vertical','unsupported','No existe en CSV. Eliminar.')
ON CONFLICT (platform, name) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────
-- 8. SEED: preview_personas
-- ─────────────────────────────────────────────────────────────────
INSERT INTO preview_personas (name, variables, is_default) VALUES
  ('Leslie (TikTok 983K)',
   '{"first_name":"Leslie","last_name":"Garcia","email":"lesliegcrespo@gmail.com","tiktok":"leslie.gloria","follower_count":"983469","region":"US","language":"en"}'::jsonb,
   true),
  ('Daniel (test)',
   '{"first_name":"Daniel","email":"daniel@laneta.com","tiktok":"danielsample","follower_count":"750000","region":"US","language":"en"}'::jsonb,
   false),
  ('Bri (sin IG)',
   '{"first_name":"Bri","email":"brcamp1ac@gmail.com","tiktok":"bri.veronica","follower_count":"995829","region":"US","language":"en"}'::jsonb,
   false),
  ('Lead sin nombre (edge case)',
   '{"first_name":"","tiktok":"xyz","follower_count":"500000"}'::jsonb,
   false)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────
-- 9. SEED: 4 plantillas (3 reales + 1 extra vacía)
--    Body plain es placeholder corto — se actualizará cuando se carguen
--    los AUTHORIZED_*.txt reales.
-- ─────────────────────────────────────────────────────────────────
INSERT INTO templates (name, display_name, step_number, branch_link_url, qr_image_url, cta_label, smartlead_campaign_id) VALUES
  ('intro_fast_track',
   'Intro Fast Track',
   1,
   'https://3c7t6.app.link/apply-fast-track',
   'https://emrbhjosdqhsmnprggkf.supabase.co/storage/v1/object/public/brevo-assets/qr/step1_apply_fast_track.png',
   'Apply here',
   3212141),
  ('friction_removal',
   'Friction Removal',
   2,
   'https://3c7t6.app.link/friction-removal',
   'https://emrbhjosdqhsmnprggkf.supabase.co/storage/v1/object/public/brevo-assets/qr/step2_friction_removal.png',
   'Apply here',
   3212141),
  ('social_proof',
   'Social Proof',
   3,
   'https://3c7t6.app.link/Kb6lnRgTw2b',
   'https://emrbhjosdqhsmnprggkf.supabase.co/storage/v1/object/public/brevo-assets/qr/step3_social_proof.png',
   'Apply here',
   3212141),
  ('plantilla_extra',
   'Plantilla extra (placeholder)',
   NULL,
   NULL,
   NULL,
   'Apply here',
   3212141)
ON CONFLICT (name) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────
-- 10. SEED: versión inicial v1 in_production para cada template
--     Placeholder bodies — se editarán desde la UI o se importarán los AUTHORIZED_*.txt
-- ─────────────────────────────────────────────────────────────────
INSERT INTO template_versions (template_id, version, subject, body_plain, status, commit_message)
SELECT
  id,
  1,
  CASE name
    WHEN 'intro_fast_track' THEN 'Get paid by Meta for content you''ve already made'
    WHEN 'friction_removal' THEN 'Clearing up one misconception about this program'
    WHEN 'social_proof'     THEN 'TikTok is paying less. Facebook is paying more.'
    ELSE ''
  END,
  CASE name
    WHEN 'intro_fast_track' THEN
      'Hey {{first_name}},' || chr(10) || chr(10) ||
      'Based on your content on @{{tiktok}} ({{follower_count}} followers), you qualify for the Meta Creator Program.' || chr(10) || chr(10) ||
      'Apply here:' || chr(10) || '{{link}}' || chr(10) || chr(10) ||
      '{{qr}}' || chr(10) || chr(10) ||
      'Important: apply from your phone.' || chr(10) || chr(10) ||
      'Dan'
    WHEN 'friction_removal' THEN
      'Hey {{first_name}},' || chr(10) || chr(10) ||
      'Quick note in case you saw my last email — this program is free, no exclusivity.' || chr(10) || chr(10) ||
      'Apply here:' || chr(10) || '{{link}}' || chr(10) || chr(10) ||
      '{{qr}}' || chr(10) || chr(10) ||
      'Dan'
    WHEN 'social_proof' THEN
      'Hey {{first_name}},' || chr(10) || chr(10) ||
      'Creators with @{{tiktok}}-size audiences are earning $3K-$9K/month reposting their TikTok content to Facebook.' || chr(10) || chr(10) ||
      'Apply here:' || chr(10) || '{{link}}' || chr(10) || chr(10) ||
      '{{qr}}' || chr(10) || chr(10) ||
      'Dan'
    ELSE
      '(Plantilla vacía — edit from editor)'
  END,
  CASE WHEN name = 'plantilla_extra' THEN 'draft' ELSE 'in_production' END,
  'Seed inicial (fase 1 infra)'
FROM templates
ON CONFLICT (template_id, version) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────
-- 11. CREAR CUENTA AUTH PARA ANA (editor) + DANIEL COMO OPERATOR
-- ─────────────────────────────────────────────────────────────────
-- Ana: editor · Password: ana2026
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change_token_new,
  email_change_token_current, email_change, phone_change_token, phone_change,
  reauthentication_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0',
  'authenticated', 'authenticated',
  'ana@laneta.com',
  crypt('ana2026', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Ana (Marketing Editor)","short_name":"Ana","role":"editor"}',
  '', '', '', '', '', '', '', ''
)
ON CONFLICT (id) DO NOTHING;

-- Identity row (GoTrue la requiere para login con email/password)
INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id,
  last_sign_in_at, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0',
  '{"sub":"a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0","email":"ana@laneta.com","email_verified":true}'::jsonb,
  'email',
  'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0',
  now(), now(), now()
)
ON CONFLICT (provider, provider_id) DO NOTHING;

-- Ana → role editor
INSERT INTO plantilla_user_roles (user_id, role) VALUES
  ('a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0', 'editor')
ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

-- Daniel → role operator: lookup por email para ser resiliente a distintos
-- UUIDs entre ambientes (local/staging/prod). Si el usuario no existe en este
-- Supabase, el INSERT es no-op y la migración no falla. El operator role se
-- podrá asignar manualmente después vía UPDATE.
INSERT INTO plantilla_user_roles (user_id, role)
SELECT u.id, 'operator'
FROM auth.users u
WHERE u.email = 'daniel@laneta.com'
ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

-- ─────────────────────────────────────────────────────────────────
-- 12. COMENTARIO DE CIERRE
-- ─────────────────────────────────────────────────────────────────
-- RLS se habilitará en Fase 5 (después de validar flows básicos con grants).
-- Dejar RLS OFF por ahora para no complicar el desarrollo del editor.
COMMENT ON TABLE templates IS 'Plantillas Smartlead editables — ver REQUIREMENTS-editor-app.md';
COMMENT ON TABLE template_versions IS 'Historial versionado por plantilla. draft/approved/in_production/archived.';
COMMENT ON TABLE variable_registry IS 'Catálogo de variables Smartlead: native/custom_field/unsupported.';
COMMENT ON TABLE plantilla_user_roles IS 'Roles del editor de plantillas: editor (Ana), operator (técnico), viewer.';

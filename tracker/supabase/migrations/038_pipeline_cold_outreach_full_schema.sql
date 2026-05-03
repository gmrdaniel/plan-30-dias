-- ============================================================
-- Pipeline Cold Outreach — Full Schema
-- ============================================================
-- Crea desde cero las tablas para el pipeline de creators TT scraping
-- (MV verify → exclude non-creator → bucket → Clay → Smartlead push).
--
-- Tablas creadas:
--   creator_inventory          — entity master de creators
--   creator_social_profiles    — handles sociales por plataforma
--   enrichment_services        — catálogo de workers
--   enrichment_pipelines       — runs de pipeline
--   enrichment_pipeline_steps  — pasos por pipeline
--   enrichment_step_results    — resultado por (step, entity)
--   enrichment_flags           — smart-skip cache TTL
--   clay_webhook_log           — log idempotente del webhook Clay
--   smartlead_uploaded_leads   — manifest persistente de uploads
--   pipeline_config            — config key-value
--
-- Service codes seeded (12):
--   - validate_email_mv ⭐ MV verify (reemplaza Hunter para nuestro pipeline)
--   - exclude_non_creator ⭐ filtro role-based + typos + dummies
--   - assign_bucket ⭐ max(followers) → bucket
--   - smartlead_dedup_check ⭐ cross 6 campañas
--   - enrich_via_clay_creator ⭐ outbound a Clay
--   + 7 placeholders: validate_name, score_creator, compute_data_tier,
--     update_followers_ig/tt, brevo_history, fb_page_check (para futuro)
-- ============================================================

BEGIN;

-- ── 0. Helper: trigger function for updated_at ──────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ── 1. creator_inventory ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.creator_inventory (
  -- Identidad
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID UNIQUE,             -- soft FK a auth/users (sin enforce)
  created_by              UUID,

  first_name              TEXT NOT NULL,
  last_name               TEXT,
  email                   TEXT NOT NULL,
  secondary_email         TEXT,

  -- Contacto / ubicación
  phone                   TEXT,
  phone_country_code      TEXT,
  country                 TEXT,
  city                    TEXT,
  timezone                TEXT,
  language                TEXT DEFAULT 'en',

  -- Perfil
  gender                  TEXT,
  birthdate               DATE,
  bio                     TEXT,
  website_url             TEXT,
  categories              TEXT[],
  notes                   TEXT,
  avatar_url              TEXT,
  cached_photo_url        TEXT,

  -- Estado del registro
  status                  TEXT NOT NULL DEFAULT 'inventory'
    CHECK (status IN ('inventory', 'user', 'pending_registration')),
  is_profile_complete     BOOLEAN,

  -- Pipeline de validación
  email_status            TEXT
    CHECK (email_status IN ('valid', 'invalid', 'risky', 'catchall', 'unknown')),
  email_valid             BOOLEAN,
  email_validated         BOOLEAN,
  hunter_status           TEXT,                    -- legacy del worker Hunter
  name_validated          BOOLEAN,

  non_creator_filter      TEXT
    CHECK (non_creator_filter IN ('passed', 'excluded', 'needs_review')),
  non_creator_reason      TEXT,

  handle_match            TEXT
    CHECK (handle_match IN ('exact', 'similar', 'different', 'no_data')),
  matched_category        TEXT,

  has_facebook            BOOLEAN,
  fb_page_url             TEXT,
  fb_status               TEXT
    CHECK (fb_status IN ('sin_fb', 'fb_profile', 'con_fb_page', 'pendiente')),
  fb_likes                INTEGER,

  brevo_history_status    TEXT
    CHECK (brevo_history_status IN ('never_contacted', 'contacted_no_response',
                                    'opener_no_click', 'clicker', 'converter')),
  brevo_contact_id        BIGINT,
  brevo_synced_at         TIMESTAMPTZ,
  email_engage_score      NUMERIC,

  -- Score / Tier
  score                   INTEGER,
  tier                    TEXT CHECK (tier IN ('A', 'B', 'C', 'D')),
  data_tier               TEXT,
  warm_level              TEXT,

  -- Pipeline cold outreach (NEW)
  bucket                  TEXT
    CHECK (bucket IN ('100k-500k', '500k-1M', '1M-5M', '5M+')),
  waterfall_action        TEXT
    CHECK (waterfall_action IN ('send_100', 'send_50', 'discard')),
  mv_quality              TEXT
    CHECK (mv_quality IN ('good', 'risky', 'bad')),
  mv_resultcode           SMALLINT,
  mv_verified_at          TIMESTAMPTZ,
  mv_free                 BOOLEAN,
  mv_role                 BOOLEAN,
  clay_enriched_at        TIMESTAMPTZ,

  -- Outreach
  primary_platform        TEXT,
  outreach_intro          TEXT,
  assigned_sender         TEXT,
  import_batch            TEXT,
  audit_landing_page_slug TEXT,

  -- Block list
  is_blocked              BOOLEAN NOT NULL DEFAULT false,
  blocked_at              TIMESTAMPTZ,
  blocked_reason          TEXT,
  sms_blocked             BOOLEAN DEFAULT false,
  email_blacklisted       BOOLEAN DEFAULT false,
  email_blacklist_reason  TEXT,

  -- HubSpot (optional)
  hubspot_contact_id      TEXT,
  hubspot_deal_id         TEXT,

  -- Timestamps
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ci_email          ON public.creator_inventory(email);
CREATE INDEX IF NOT EXISTS idx_ci_user_id        ON public.creator_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_ci_status         ON public.creator_inventory(status);
CREATE INDEX IF NOT EXISTS idx_ci_tier           ON public.creator_inventory(tier) WHERE tier IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ci_score          ON public.creator_inventory(score DESC) WHERE score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ci_email_valid    ON public.creator_inventory(email_valid);
CREATE INDEX IF NOT EXISTS idx_ci_is_blocked     ON public.creator_inventory(is_blocked);
CREATE INDEX IF NOT EXISTS idx_ci_brevo_id       ON public.creator_inventory(brevo_contact_id);
CREATE INDEX IF NOT EXISTS idx_ci_fb_status      ON public.creator_inventory(fb_status) WHERE fb_status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ci_email_status   ON public.creator_inventory(email_status) WHERE email_status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ci_bucket         ON public.creator_inventory(bucket) WHERE bucket IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ci_waterfall      ON public.creator_inventory(waterfall_action) WHERE waterfall_action IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ci_import_batch   ON public.creator_inventory(import_batch) WHERE import_batch IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ci_mv_verified    ON public.creator_inventory(mv_verified_at DESC) WHERE mv_verified_at IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_ci_secondary_email_lower
  ON public.creator_inventory (LOWER(secondary_email)) WHERE secondary_email IS NOT NULL;

DROP TRIGGER IF EXISTS update_creator_inventory_updated_at ON public.creator_inventory;
CREATE TRIGGER update_creator_inventory_updated_at
  BEFORE UPDATE ON public.creator_inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ── 2. creator_social_profiles ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.creator_social_profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id          UUID NOT NULL REFERENCES public.creator_inventory(id) ON DELETE CASCADE,

  platform            TEXT NOT NULL
    CHECK (platform IN ('instagram', 'tiktok', 'youtube', 'x', 'twitch',
                        'pinterest', 'blog', 'facebook', 'snapchat', 'threads')),
  platform_id         UUID,
  username            TEXT NOT NULL,
  account_url         TEXT,
  platform_user_id    TEXT,
  external_account_id TEXT,

  followers           INTEGER DEFAULT 0,
  following_count     INTEGER DEFAULT 0,
  media_count         INTEGER DEFAULT 0,
  average_likes       INTEGER DEFAULT 0,
  average_comments    INTEGER DEFAULT 0,
  average_views       INTEGER DEFAULT 0,
  engagement_rate     NUMERIC CHECK (engagement_rate >= 0 AND engagement_rate <= 100),
  growth_rate         NUMERIC,

  bio                 TEXT,
  profile_pic_url     TEXT,
  is_verified         BOOLEAN DEFAULT false,
  is_business         BOOLEAN,
  is_private          BOOLEAN,

  account_status      TEXT DEFAULT 'active'
    CHECK (account_status IN ('active', 'suspended', 'deleted', 'unknown')),
  main_social_media   BOOLEAN DEFAULT false,

  recommended_price   NUMERIC(10, 2),
  price_min           NUMERIC(10, 2),
  price_max           NUMERIC(10, 2),

  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT csp_creator_platform_unique UNIQUE (creator_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_csp_creator_id   ON public.creator_social_profiles(creator_id);
CREATE INDEX IF NOT EXISTS idx_csp_platform     ON public.creator_social_profiles(platform);
CREATE INDEX IF NOT EXISTS idx_csp_username     ON public.creator_social_profiles(username);
CREATE INDEX IF NOT EXISTS idx_csp_external_id  ON public.creator_social_profiles(external_account_id) WHERE external_account_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_csp_verified     ON public.creator_social_profiles(is_verified) WHERE is_verified = true;
CREATE UNIQUE INDEX IF NOT EXISTS only_one_main_social_media_per_creator
  ON public.creator_social_profiles (creator_id) WHERE main_social_media IS TRUE;

DROP TRIGGER IF EXISTS update_creator_social_profiles_updated_at ON public.creator_social_profiles;
CREATE TRIGGER update_creator_social_profiles_updated_at
  BEFORE UPDATE ON public.creator_social_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ── 3. enrichment_services ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.enrichment_services (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code                  TEXT NOT NULL UNIQUE,
  name                  TEXT NOT NULL,
  description           TEXT,
  category              TEXT CHECK (category IN ('validation', 'social', 'data', 'scoring', 'other')),
  icon                  TEXT,
  entity_types          TEXT[] NOT NULL DEFAULT '{creator,client_contact}',
  input_fields          JSONB,
  output_fields         JSONB,
  target_field          TEXT,
  skip_when             JSONB,
  result_ttl_days       INTEGER DEFAULT 30,
  estimated_ms_per_item INTEGER,
  requires_api_key      TEXT,
  active                BOOLEAN NOT NULL DEFAULT true,
  sort_order            INTEGER NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_es_code     ON public.enrichment_services(code);
CREATE INDEX IF NOT EXISTS idx_es_category ON public.enrichment_services(category);
CREATE INDEX IF NOT EXISTS idx_es_active   ON public.enrichment_services(active) WHERE active = true;


-- ── 4. enrichment_pipelines + steps + results ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.enrichment_pipelines (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type     TEXT NOT NULL
    CHECK (entity_type IN ('creator_list', 'client_contact_list', 'client_inventory_filter')),
  list_id         UUID,
  filter_criteria JSONB,
  name            TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'paused', 'completed', 'failed', 'cancelled')),
  total_items     INTEGER NOT NULL DEFAULT 0,
  current_step    INTEGER,
  progress_pct    NUMERIC DEFAULT 0,
  skip_blocked    BOOLEAN DEFAULT true,
  smart_skip      BOOLEAN DEFAULT true,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_by      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ep_entity_type ON public.enrichment_pipelines(entity_type);
CREATE INDEX IF NOT EXISTS idx_ep_list_id     ON public.enrichment_pipelines(list_id) WHERE list_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ep_status      ON public.enrichment_pipelines(status);

DROP TRIGGER IF EXISTS update_enrichment_pipelines_updated_at ON public.enrichment_pipelines;
CREATE TRIGGER update_enrichment_pipelines_updated_at
  BEFORE UPDATE ON public.enrichment_pipelines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


CREATE TABLE IF NOT EXISTS public.enrichment_pipeline_steps (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id         UUID NOT NULL REFERENCES public.enrichment_pipelines(id) ON DELETE CASCADE,
  service_id          UUID NOT NULL REFERENCES public.enrichment_services(id),
  step_order          INTEGER NOT NULL,
  status              TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped',
                      'completed_with_errors')),
  config              JSONB,
  depends_on_step_id  UUID REFERENCES public.enrichment_pipeline_steps(id) ON DELETE SET NULL,
  depends_on_result   TEXT,
  total_items         INTEGER NOT NULL DEFAULT 0,
  processed_items     INTEGER NOT NULL DEFAULT 0,
  success_count       INTEGER NOT NULL DEFAULT 0,
  error_count         INTEGER NOT NULL DEFAULT 0,
  skipped_count       INTEGER NOT NULL DEFAULT 0,
  started_at          TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  error_message       TEXT,
  result_summary      JSONB
);
CREATE INDEX IF NOT EXISTS idx_eps_pipeline_id ON public.enrichment_pipeline_steps(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_eps_service_id  ON public.enrichment_pipeline_steps(service_id);
CREATE INDEX IF NOT EXISTS idx_eps_status      ON public.enrichment_pipeline_steps(status);


CREATE TABLE IF NOT EXISTS public.enrichment_step_results (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id       UUID NOT NULL REFERENCES public.enrichment_pipeline_steps(id) ON DELETE CASCADE,
  entity_type   TEXT NOT NULL
    CHECK (entity_type IN ('creator', 'client_contact', 'client_inventory')),
  entity_id     UUID NOT NULL,
  status        TEXT NOT NULL CHECK (status IN ('success', 'error', 'skipped')),
  old_value     JSONB,
  new_value     JSONB,
  error_message TEXT,
  processed_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_esr_step_id ON public.enrichment_step_results(step_id);
CREATE INDEX IF NOT EXISTS idx_esr_entity  ON public.enrichment_step_results(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_esr_status  ON public.enrichment_step_results(status);


CREATE TABLE IF NOT EXISTS public.enrichment_flags (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type  TEXT NOT NULL
    CHECK (entity_type IN ('creator', 'client_contact', 'client_inventory')),
  entity_id    UUID NOT NULL,
  service_code TEXT NOT NULL,
  last_run_at  TIMESTAMPTZ,
  result       TEXT,
  expires_at   TIMESTAMPTZ,
  result_data  JSONB,
  UNIQUE(entity_type, entity_id, service_code)
);
CREATE INDEX IF NOT EXISTS idx_ef_entity  ON public.enrichment_flags(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_ef_service ON public.enrichment_flags(service_code);
CREATE INDEX IF NOT EXISTS idx_ef_expires ON public.enrichment_flags(expires_at) WHERE expires_at IS NOT NULL;


-- ── 5. clay_webhook_log ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.clay_webhook_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_ref    JSONB,
  payload         JSONB,
  inventory_id    UUID,
  status          TEXT CHECK (status IN ('received', 'processed', 'duplicate', 'error')),
  error_message   TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  processed_at    TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_clay_webhook_log_dedup
  ON public.clay_webhook_log (
    (external_ref->>'creator_inventory_id'),
    (payload->>'enriched_at')
  );


-- ── 6. smartlead_uploaded_leads (replaces local CSV manifest) ───────────────
CREATE TABLE IF NOT EXISTS public.smartlead_uploaded_leads (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_inventory_id  UUID REFERENCES public.creator_inventory(id) ON DELETE SET NULL,
  email                 TEXT NOT NULL,
  campaign_id           BIGINT NOT NULL,
  campaign_name         TEXT,
  smartlead_lead_id     TEXT,
  batch_id              TEXT,
  source_pool           TEXT,
  uploaded_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  removed_at            TIMESTAMPTZ,
  status                TEXT NOT NULL DEFAULT 'uploaded'
    CHECK (status IN ('uploaded', 'removed', 'blocked', 'duplicate', 'invalid', 'bounced')),
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_sul_email_campaign_active
  ON public.smartlead_uploaded_leads(email, campaign_id) WHERE removed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_sul_creator_id ON public.smartlead_uploaded_leads(creator_inventory_id);
CREATE INDEX IF NOT EXISTS idx_sul_campaign   ON public.smartlead_uploaded_leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_sul_uploaded   ON public.smartlead_uploaded_leads(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_sul_email      ON public.smartlead_uploaded_leads(email);

COMMENT ON TABLE public.smartlead_uploaded_leads IS
  'Manifest persistente de leads subidos a campañas Smartlead. Reemplaza CSV manifest local.';


-- ── 7. pipeline_config ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pipeline_config (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  description TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by  UUID
);

INSERT INTO public.pipeline_config(key, value, description) VALUES
  ('daily_avg_send', '240'::jsonb,
   'Promedio de sends diarios objetivo. Cron y push-batch lo usan como N.'),
  ('skip_clay', 'false'::jsonb,
   'Si true, el worker enrich_via_clay_creator retorna skipped sin POST a Clay.'),
  ('active_smartlead_campaign', '3217790'::jsonb,
   'Campaign ID Smartlead a la que push-batch sube por default (Ana).'),
  ('active_buckets_priority', '["500k-1M","1M-5M","100k-500k"]'::jsonb,
   'Orden de prioridad para push-batch.'),
  ('mv_min_quality', '"good"'::jsonb,
   'Filtro mínimo MV para push: solo good (también permite risky si se cambia).'),
  ('chunk_size_smartlead', '900'::jsonb,
   'Tamaño max chunk para POST /campaigns/{id}/leads. Smartlead limita 1000.'),
  ('non_creator_role_extra_keywords', '["ventas","contacto","facturas","gerencia"]'::jsonb,
   'Keywords adicionales (ES) para exclude_non_creator más allá del set EN base.')
ON CONFLICT (key) DO NOTHING;

COMMENT ON TABLE public.pipeline_config IS
  'Configuración runtime del pipeline cold outreach. Editable desde UI/API.';


-- ── 8. RLS — enable + permissive policies ───────────────────────────────────
-- Service role bypasses RLS naturally. Authenticated users can read all.
-- Modificaciones de schema futuras pueden agregar policies más estrictas.
ALTER TABLE public.creator_inventory          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_social_profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrichment_services        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrichment_pipelines       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrichment_pipeline_steps  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrichment_step_results    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrichment_flags           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clay_webhook_log           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smartlead_uploaded_leads   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_config            ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'creator_inventory', 'creator_social_profiles',
    'enrichment_services', 'enrichment_pipelines', 'enrichment_pipeline_steps',
    'enrichment_step_results', 'enrichment_flags',
    'clay_webhook_log', 'smartlead_uploaded_leads', 'pipeline_config'
  ])
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS "%s_select_authenticated" ON public.%I',
      tbl, tbl
    );
    EXECUTE format(
      'CREATE POLICY "%s_select_authenticated" ON public.%I
        FOR SELECT TO authenticated USING (true)',
      tbl, tbl
    );
  END LOOP;
END$$;


-- ── 9. Seed enrichment_services ──────────────────────────────────────────────
INSERT INTO public.enrichment_services (
  code, name, description, category, entity_types,
  result_ttl_days, requires_api_key, active, sort_order
) VALUES
  -- Pipeline cold outreach (workers nuevos del laneta-pipeline-api)
  (
    'validate_email_mv',
    'Validar Email (MillionVerifier)',
    'Validación deliverability vía MillionVerifier API. 13× más barato que Hunter, mejor catch-all detection. Escribe email_status, mv_quality, waterfall_action.',
    'validation', ARRAY['creator', 'client_contact'], 14, 'MILLIONVERIFIER_API_KEY', true, 5
  ),
  (
    'exclude_non_creator',
    'Filtro No-Creator (extendido)',
    'Lógica de _filtro_prevalidacion.py: typos dominio (gamil→gmail), Gmail placeholder ≤5 letras, role-based extendido (sales@, ventas@, info@), dummies, blocklist HB.',
    'validation', ARRAY['creator'], 365, NULL, true, 10
  ),
  (
    'assign_bucket',
    'Asignar Bucket Followers',
    'Lee creator_social_profiles.followers todas las plataformas, calcula max → bucket (100k-500k/500k-1M/1M-5M/5M+) + setea primary_platform + main_social_media flag.',
    'data', ARRAY['creator'], 30, NULL, true, 15
  ),
  (
    'smartlead_dedup_check',
    'Smartlead Cross-Campaign Dedup',
    'Verifica si email ya está en alguna de las 6 campañas Meta activas. Cache 5min. Backfill smartlead_uploaded_leads si encuentra leads no registrados.',
    'validation', ARRAY['creator'], 1, 'SMARTLEAD_API_KEY', true, 70
  ),
  (
    'enrich_via_clay_creator',
    'Enriquecer Creator via Clay',
    'POST a Clay HTTP-in URL (workbook creators TT). Respuesta async vía webhook clay-webhook-creator. Skipeable con pipeline_config.skip_clay=true.',
    'data', ARRAY['creator'], 60, 'CLAY_API_KEY', true, 30
  ),

  -- Placeholders (workers del CRM que se pueden portear cuando se necesiten)
  ('validate_name',      'Validar Nombre',           'Normaliza first_name/last_name a Title Case (ej: Mr/Mrs/De handling).', 'validation', ARRAY['creator','client_contact'], 90, NULL, true, 6),
  ('score_creator',      'Score Creator',            'Scoring 0-17 según rubric del program. Tier A/B/C/D.', 'scoring', ARRAY['creator'], 30, NULL, true, 80),
  ('compute_data_tier',  'Computar Data Tier',       'Calcula data_tier (A/B/C) según completitud de canales.', 'scoring', ARRAY['creator'], 30, NULL, true, 75),
  ('update_followers_ig','Actualizar Followers IG',  'RapidAPI instagram360. followers, bio, profile_pic_url, is_verified.', 'social', ARRAY['creator'], 7, 'RAPIDAPI_KEY', true, 20),
  ('update_followers_tt','Actualizar Followers TT',  'RapidAPI tiktok381. followers, bio, average_likes.', 'social', ARRAY['creator'], 7, 'RAPIDAPI_KEY', true, 25),
  ('brevo_history',      'Brevo Warm History',       'GET /contacts/{email}/campaignStats → warm_level (cold/opener/clicker/replier/converter).', 'data', ARRAY['creator'], 14, 'BREVO_API_KEY', true, 60),
  ('fb_page_check',      'FB Page Eligibility',      'Apify facebook-pages-scraper → fb_status (sin_fb / fb_profile / con_fb_page) — eligibilidad Meta.', 'social', ARRAY['creator'], 60, 'APIFY_API_TOKEN', true, 65)
ON CONFLICT (code) DO NOTHING;


-- ── 10. Comentarios ──────────────────────────────────────────────────────────
COMMENT ON TABLE public.creator_inventory IS
  'Master entity de creators. Universo cold outreach (TT scraping → enrichment → Smartlead push).';
COMMENT ON TABLE public.creator_social_profiles IS
  'Handles sociales por plataforma. UNIQUE(creator_id, platform). Solo 1 main_social_media=true por creator.';
COMMENT ON TABLE public.enrichment_services IS
  'Catálogo de workers. service_code mapea a WORKER_REGISTRY en laneta-pipeline-api.';
COMMENT ON TABLE public.enrichment_flags IS
  'Smart-skip cache. Si row fresh (TTL no expirado) → runner skipea worker.';
COMMENT ON TABLE public.clay_webhook_log IS
  'Log idempotente del webhook clay-webhook-creator. Dedup vía (creator_inventory_id, enriched_at).';

COMMIT;

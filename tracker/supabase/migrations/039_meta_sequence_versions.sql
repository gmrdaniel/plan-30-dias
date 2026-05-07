-- Histórico de versiones de las sequences en Smartlead (campañas Meta)
-- Una fila por (campaign_id, step_id, updated_at). Solo se inserta cuando
-- cambia el updated_at o el body_hash (detecta ediciones silenciosas).

CREATE TABLE IF NOT EXISTS public.meta_sequence_versions (
  id              bigserial PRIMARY KEY,
  campaign_id     integer NOT NULL,
  step_id         integer NOT NULL,        -- Smartlead seq id
  seq_number      integer NOT NULL,        -- 1, 2, 3, 4, ...
  subject         text,
  body_chars      integer,
  body_hash       text NOT NULL,           -- sha256 del email_body, detecta cambios silenciosos
  branch_aliases  text[],                  -- aliases Branch encontrados (ej: ['apply-fast-track-ana'])
  fb_direct_count integer DEFAULT 0,       -- cuántos links FB directos hay
  has_branch      boolean GENERATED ALWAYS AS (array_length(branch_aliases, 1) > 0) STORED,
  has_fb_direct   boolean GENERATED ALWAYS AS (fb_direct_count > 0) STORED,
  smartlead_created_at timestamptz NOT NULL,  -- created_at del API Smartlead
  smartlead_updated_at timestamptz NOT NULL,  -- updated_at del API Smartlead
  detected_at     timestamptz NOT NULL DEFAULT now()  -- cuándo lo vio nuestro script
);

-- Una sola fila por (campaign, step, updated_at) — si Smartlead bumpea updated_at
-- sin cambiar contenido seguimos teniendo trazabilidad
CREATE UNIQUE INDEX IF NOT EXISTS meta_sequence_versions_key
  ON public.meta_sequence_versions (campaign_id, step_id, smartlead_updated_at);

-- Index for "give me the latest version per (campaign, step)"
CREATE INDEX IF NOT EXISTS meta_sequence_versions_lookup
  ON public.meta_sequence_versions (campaign_id, step_id, smartlead_updated_at DESC);

COMMENT ON TABLE public.meta_sequence_versions IS
  'Histórico de versiones de sequences de Smartlead. Poll cada snapshot via _snapshot_meta.py. Una fila por edición detectada (no por snapshot — solo cuando hay cambio).';
COMMENT ON COLUMN public.meta_sequence_versions.body_hash IS
  'sha256 del email_body para detectar cambios silenciosos donde updated_at no se bumpea.';
COMMENT ON COLUMN public.meta_sequence_versions.branch_aliases IS
  'Lista de aliases 3c7t6.app.link/<alias> encontrados en el body. Vacío si Branch tracking se perdió.';

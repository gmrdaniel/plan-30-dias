# CLAUDE.md — Clay Integration Context

> **Audience:** AI agents (Claude Code) picking up work on the Clay enrichment pipeline for Laneta CRM.
> **Purpose:** Self-contained handoff document. After reading this file, an agent should understand the full state of the Clay integration without needing the user to explain anything.
> **Last updated:** 2026-04-08
> **Author:** Previous Claude Code session (Opus 4.6) working with the user to set up Clay Process 1 end-to-end.

---

## 0. TL;DR for the next agent

**What's done:**
- Process 1 (companies enrichment) is fully configured in Clay and validated end-to-end with 5 test companies. 3/5 qualified, 2/5 rejected as expected. Data flows: Airtable `companies` → Clay enrichment → Google Sheets `companies-buffer`.
- Airtable `companies` table has 26 fields, 19 of which were added via Metadata API in this session (17 in batch 1, 2 in batch 2 for the 2-level category taxonomy).
- 3 AI prompts written and tested: `find-company-social-profiles` (with TikTok customization), `ai-category` (10-category taxonomy + subcategory + confidence), `ai-icp-score` (T04-A1 6-criterion rubric, 0–100).

**What's next (immediate):**
- Process 2 (contacts enrichment): create new Clay table `contacts` standalone, configure Apollo Find People at Company on the 3 qualified companies (Mad Hippie, Black Girl Sunscreen, ArtNaturals), then email cascade (Icypeas → Enrow → LeadMagic → Hunter → Findymail) + ZeroBounce, then Sheets export to `contacts-buffer`. Architecture decision was Option B (separate Clay table, not same table with explosive columns) — see section 10.

**What's deferred / blocked:**
- `classification` AI column (deferred to post-SmartScout phase — for the 5 test companies all would classify as `brand`, zero variance).
- Adding `syncing` and `error` options to Airtable `status` singleSelect (Metadata API doesn't support PATCH on singleSelect options — manual UI action required).
- Creating `clay-pending` filtered view in Airtable (Metadata API doesn't support view creation — manual UI action required).
- Apps Script + Supabase upsert (next phase after Process 2 validates).
- SmartScout integration (later phase, replaces manual CSV push).
- Webhook from real CRM source (replaces Airtable as source — user has authorization to buy Clay license that enables HTTP webhooks).

**Critical rules learned the hard way:**
1. Always mark Clay AI prompt inputs as **OPTIONAL** for any column that could be missing (like Apollo `industry` and `description` which were empty for Good Molecules). Otherwise Clay refuses to run the row with error "Industry is blank, Description is blank".
2. Airtable Metadata API does NOT support: (a) PATCHing options on existing singleSelect fields, (b) creating views. Both must be done manually in UI.
3. The Airtable `companies` table uses **English field names** (`company_name`, `website`, `industry`), NOT Spanish like template `T04-A2-empresa-prospecto-b2b.csv`. The Apps Script layer (future) will translate English Airtable fields to Spanish/Supabase column names.
4. Always source the Airtable PAT from `tracker/.env.local` → `AIRTABLE_PAT`. The `.env.local` file labels were corrected this session — earlier versions had `AIRTABLE_PAT` mislabeled as base ID. `tracker/.gitignore` was updated to ensure `.env*` is never committed.
5. Clay automatically splits JSON outputs from AI columns into separate columns — no need to write formula columns to extract `category`, `subcategory`, `confidence` etc. They appear as auto-detected sub-columns in Clay's UI.

---

## 1. Project Context

### 1.1 What is Laneta

Laneta is a Mexico-based agency that operates two distinct business lines:

**Line 1 — Brands (B2B):** Produces UGC and influencer video content for e-commerce brands selling on Amazon and DTC. Target market: small-to-mid US/LATAM beauty, supplements, home, and pet brands without strong video presence on their Amazon listings.

**Line 2 — Creators:** Helps YouTube/TikTok creators (mainly LATAM, Spanish-speaking gamers/lifestyle) monetize beyond AdSense via streaming 24/7, dubbing into English, and audience expansion services.

**This document is about Line 1 (Brands).** The Clay enrichment pipeline is being built to find, qualify, and enrich brand prospects. The Creators line uses Social Blade + ManyChat + Outgrow instead of Clay (different tooling, different flow).

### 1.2 Why Clay (vs alternatives)

The Brands line needs:
- Cold lead enrichment at scale (start from a domain or company name → get employees, revenue, social, decision-maker contacts)
- Multi-provider waterfalls (Apollo, Clearbit, Hunter, Crunchbase, etc.) with cost optimization
- AI-driven scoring against a custom ICP (T04-A1)
- Bidirectional sync with the CRM source

Clay was chosen over:
- Apollo standalone (single-provider, no waterfalls, weaker AI)
- ZoomInfo (enterprise pricing, B2B SaaS focus, weak D2C beauty coverage)
- Custom-built scrapers (higher maintenance, no aggregated provider catalog)

### 1.3 Where this fits in the broader CRM project

The Laneta CRM monorepo (`D:\CRM`) contains two apps:
- `crm-laneta-v2-02` — primary CRM with Supabase backend, multi-role auth, campaigns, creators, clients
- `laneta-ai-influence` — AI-powered influence marketing platform

The Clay pipeline feeds **`crm-laneta-v2-02`** specifically, into the Supabase tables `client_inventory` (companies) and `client_contacts` (people at companies). The future webhook source will likely be Supabase Laneta v2 itself (CRM) → webhook → Clay → enrichment → write back to Supabase.

For now (test phase), the source is Airtable acting as a stand-in for the CRM, and the destination is Google Sheets acting as a buffer before Apps Script + Supabase are built.

### 1.4 Plan 30 días context

The project lives under `D:\CRM\plan_30_dias\` (a 30-day implementation plan). All Clay work is in `Implementación/Clay/`. Templates that define the data dictionary live in `tracker/public/templates/`. The Supabase migrations and edge functions live in `tracker/supabase/`.

---

## 2. Architecture

### 2.1 Current architecture (test phase)

```
test-5-companies.csv
   ↓ (push via Airtable API — Python script using PAT from tracker/.env.local)
Airtable: companies table (tbljOLeUz5jh3nHz6 in base appMuVbSxyIyvudhi)
   ↓ (sync — Clay polls Airtable view)
Clay table: companies (Process 1 — 7 enrichment columns + 1 Sheets export)
   ↓ (filter: icp_score >= 70 → passes_filter = true)
Clay table: contacts (Process 2 — IN PROGRESS, separate Clay table)
   ↓ (export)
Google Sheets: "Laneta CRM - Clay Buffer"
   ├── tab: companies-buffer (DONE — Process 1 output)
   └── tab: contacts-buffer (PENDING — Process 2 output)
   ↓ (PENDING: Apps Script trigger)
Supabase: client_inventory + client_contacts
   ↑
Airtable: companies (write-back — DEFERRED in favor of Sheets buffer pattern)
```

### 2.2 Future architecture (after Clay license upgrade)

The user has authorization to buy the Clay license tier that enables HTTP webhooks. Once active, the architecture flips to:

```
[Real CRM source — likely Supabase Laneta v2]
   ↓ (HTTP webhook on lead creation)
Clay: HTTP-in endpoint
   ↓ (Process 1 enrichment)
Clay: Process 2 (contacts)
   ↓
Google Sheets buffer (still — for debug + audit trail)
   ↓
Supabase: client_inventory + client_contacts (via Apps Script or direct webhook)
```

In the future architecture, **Airtable disappears as source**. It may stay around as a manual QA layer or be removed entirely. The Clay tables themselves stay the same — only the source mechanism changes.

### 2.3 Why Google Sheets as buffer (vs direct Airtable/Supabase write)

Decision made mid-session. Alternatives considered:
- **Direct Clay → Airtable update** (rejected because: requires field-by-field mapping in Clay, transformations in Clay formulas, loses columns that don't have Airtable fields, harder to audit)
- **Direct Clay → Supabase** (rejected because: Clay doesn't have native Supabase integration, would need HTTP API custom config, Supabase upsert logic is complex)
- **Google Sheets as central buffer** (CHOSEN because: captures ALL Clay columns including ones without Airtable fields, easy to debug, append-mode preserves history, single point of integration for downstream — Apps Script can read from Sheets and push to both Airtable and Supabase)

Sheets buffer is the **source of truth for an enrichment run**. Both Airtable (current) and Supabase (future) get updated FROM Sheets, not directly from Clay.

---

## 3. Entity Catalog

The Clay pipeline manages 4 core entities. Understanding their schemas is essential — every prompt, every column mapping, every export depends on knowing what fields exist where.

### 3.1 `companies` (B2B brands — Process 1)

**Current locations:**
- Airtable table `companies` (`tbljOLeUz5jh3nHz6`) in base `appMuVbSxyIyvudhi` — English field names, 26 fields
- Clay table `companies` — synced from Airtable, with enrichment columns added
- Google Sheets tab `companies-buffer` — append-only output of Process 1
- Supabase table `client_inventory` — destination, not yet wired up

**Source-of-truth template:** `tracker/public/templates/T04-A2-empresa-prospecto-b2b.csv` (Spanish field names, defines what should map to Supabase `client_inventory`)

**Naming convention divergence:**
- T04-A2 uses **Spanish** column names (`empresa`, `pagina_web`, `industria`)
- Airtable `companies` table uses **English** column names (`company_name`, `website`, `industry`)
- Mapping happens in the Apps Script layer (future). See section 8.5 for the full mapping table.

### 3.2 `contacts` (B2B people at companies — Process 2)

**Current locations:**
- Airtable table `Contacts` (`tblmJg8HvCE3sizWw`) — **EXISTING but undersized**, only has: `name`, `company`, `email`, `website`, `synced_at`. Missing ~12 fields per T04-A3. **Decision: do NOT extend, keep as-is** (Airtable is temporary, will be replaced by webhook source).
- Clay table `contacts` — TO BE CREATED in Process 2 setup
- Google Sheets tab `contacts-buffer` — TO BE CREATED
- Supabase table `client_contacts` — destination, not yet wired up

**Source-of-truth template:** `tracker/public/templates/T04-A3-contacto-empresa-b2b.csv` (Spanish field names)

### 3.3 `creator_inventory` (creators — NOT in Clay scope)

**Current locations:**
- Supabase table `creator_inventory` — destination
- NOT in Airtable, NOT in Clay
- Sourced from ManyChat (chat funnel) and Social Blade (enrichment)

**Source-of-truth template:** `tracker/public/templates/T04-B2-creador-prospecto.csv`

**Why not in Clay:** Creators are a different funnel. ManyChat handles intake (creators DM the brand on IG, ManyChat captures email + language + niche), Social Blade enriches with follower counts and engagement. Clay is **only** used for the brands B2B side. If a future agent is asked to "configure Clay for creators", flag this as incorrect — the creator funnel is intentionally separate.

### 3.4 `creator_social_profiles` (creator's social handles — NOT in Clay scope)

Same as 3.3 — handled by ManyChat + Social Blade, not Clay.

**Source-of-truth template:** `tracker/public/templates/T04-B3-perfil-social-creador.csv`

---

## 4. Templates Reference (`tracker/public/templates/`)

There are 7 CSV files in the templates folder. Each defines either ICP criteria or a data schema with explicit Supabase column mappings. These are the **data dictionary source of truth** for the entire prospecting pipeline.

### 4.1 `T04-A1-criterios-icp-b2b.csv` — ICP for brands

Defines what makes a "good" brand prospect. Confirmed by user as the ideal ICP. Used as the source for the `ai-icp-score` prompt rubric.

**Key fields (column `valor` is empty in the file — these are the defaults the user confirmed):**
- `industrias_objetivo`: Health & Wellness, Beauty, CPG, E-commerce
- `tamano_acuerdo_min_usd`: 2000
- `tamano_acuerdo_max_usd`: 12000
- `titulos_decision`: CMO, VP Marketing, Head of E-commerce, Brand Manager, Marketing Director
- `tamano_empresa_min`: 10 employees
- `tamano_empresa_max`: 500 employees
- `geolocalizacion`: US, Mexico, LATAM
- `keywords_exclusion`: pharma, tobacco, gambling, crypto
- `clasificacion_leads`: Lead A (>$1M revenue + video gap), Lead B ($500K–1M), Lead C (<$500K)
- `marketplace_principal`: Amazon
- `categorias_producto`: Skincare, Supplements, Home, Pet
- `tiene_video_en_listings`: NO (we look for brands that DON'T have product videos — that's the gap Laneta fills)
- `objecion_1`: "Ya tenemos agencia interna"
- `objecion_2`: "No tenemos presupuesto para influencers"
- `objecion_3`: "No vemos ROI en video/UGC"

### 4.2 `T04-A2-empresa-prospecto-b2b.csv` — companies schema

Defines the canonical schema for company prospects with explicit mapping to Supabase `client_inventory`. Each row has: `campo_csv` (Spanish field name in CSV/Airtable), `columna_supabase` (target Supabase column), `tabla` (Supabase table), `tipo` (data type), `obligatorio_clay` (required for Clay enrichment), `obligatorio_supabase` (required for DB), `fuente` (source), `ejemplo`.

**Critical mappings (Spanish CSV → Supabase column):**

| Spanish | Supabase column | Type |
|---|---|---|
| `empresa` | `name` | TEXT (req) |
| `industria` | `industry` | TEXT |
| `categoria` | `primary_category` | TEXT |
| `clasificacion` | `classification` | TEXT |
| `country` | `country` | TEXT |
| `ubicacion` | `city` | TEXT |
| `ingresos_estimados` | `estimated_marketplace_revenue` | NUMERIC(12,2) |
| `pagina_web` | `website_url` | TEXT |
| `tienda_online` | `online_store_url` | TEXT |
| `instagram_handle` | `instagram_handle` | TEXT |
| `tiktok_handle` | `tiktok_handle` | TEXT |
| `youtube_url` | `youtube_url` | TEXT |
| `linkedin_url` | `linkedin_url` | TEXT |
| `facebook_url` | `facebook_url` | TEXT |
| `email_corporativo` | `corporate_email` | TEXT |
| `telefono` | `phone` | TEXT |
| `num_empleados` | (qualification_criteria JSONB) | INTEGER |
| `icp_score` | `qualification_score` | INTEGER (0-100) |
| `video_gap_score` | (qualification_criteria JSONB) | JSONB |

**Source column values:** Clay AI, Apollo, SmartScout, Clay cascade. SmartScout is referenced for `tienda_online`, `ingresos_estimados`, `video_gap_score`, `categoria` — but SmartScout is currently OUT OF SCOPE for the test phase.

### 4.3 `T04-A3-contacto-empresa-b2b.csv` — contacts schema

Defines schema for people inside companies, mapping to Supabase `client_contacts`.

**Critical mappings:**

| Spanish | Supabase column | Type |
|---|---|---|
| `empresa_ref` | (lookup → client_inventory_id) | UUID FK |
| `nombre` | `first_name` | TEXT (req) |
| `apellido` | `last_name` | TEXT |
| `cargo` | `job_title` | TEXT |
| `role_type` | `role_type` | TEXT (derived: CMO→cmo, VP→marketing_director, etc.) |
| `email` | `email` | TEXT |
| `telefono` | `phone` | TEXT |
| `codigo_pais` | `phone_country_code` | TEXT |
| `linkedin_url` | `linkedin_url` | TEXT |
| `ubicacion_pais` | `country` | TEXT |
| `ubicacion_ciudad` | `city` | TEXT |
| `es_tomador_decision` | `is_decision_maker` | BOOLEAN |
| `es_contacto_principal` | `is_primary_contact` | BOOLEAN |
| `email_disponible` | `email_valid` | BOOLEAN |
| `telefono_disponible` | `phone_valid` | BOOLEAN |

**Note on email cascade:** Template says "Prospeo → Findymail → Hunter". In this session we discovered Clay has cheaper providers — see section 10 for the actual cascade we'll configure (Icypeas → Enrow → LeadMagic → Hunter → Findymail, ordered by cost).

### 4.4 `T04-B1-criterios-icp-creadores.csv` — ICP for creators

NOT used by Clay (creators are not in Clay scope). Documented here only for context, in case a future agent encounters confusion about why Clay doesn't enrich creators.

**Key fields:**
- `plataformas_objetivo`: YouTube, TikTok, Instagram
- `suscriptores_minimo`: 10000
- `idiomas_contenido`: Español, Inglés, Portugués
- `categorias_contenido`: Gaming, Lifestyle, Tech, Beauty
- `ingreso_mensual_minimo_usd`: 500
- `tiempo_a_monetizacion_promedio`: 45 días
- `servicio_streaming_tasa`: 60 (% take rate on streaming 24/7 service)
- `servicio_doblaje_tasa`: 35 (% on dubbing service)
- `pain_point_1`: "No saben monetizar más allá de AdSense"

**Tools used (NOT Clay):** Social Blade (filter + enrichment), ManyChat (chat funnel), Outgrow (calculator), Leadpages (microsite).

### 4.5 `T04-B2-creador-prospecto.csv` — creator schema

NOT in Clay. Maps to Supabase `creator_inventory`. Source: ManyChat (chat input) + Social Blade (enrichment).

### 4.6 `T04-B3-perfil-social-creador.csv` — creator social profile schema

NOT in Clay. Maps to Supabase `creator_social_profiles`. One row per (creator × platform) tuple. Source: Social Blade.

### 4.7 `empleados-internos-swap-test.csv` — internal team swap test

Empty template (21 numbered rows). Used for an unrelated internal exercise. Not relevant to Clay.

---

## 5. Clay Setup

### 5.1 Authentication / access

- **Account:** the user has a Clay account (no programmatic API key shared in this project — Clay is operated via UI for now, with future webhook integration planned).
- **Future:** when the user buys the higher tier license, HTTP webhooks become available. At that point, a Clay webhook endpoint URL will be set up and the user's CRM source will POST to it.

### 5.2 Clay column types used in Process 1

| Type | Used for | Cost |
|---|---|---|
| **Enrichment** | Apollo Enrich Company, Company Revenue waterfall, Find Company Social Profiles | Variable per provider |
| **AI** | Custom prompts (category, ICP score) using GPT-4o, GPT-4o mini, or Claude | ~0.1–0.5 cr/row |
| **Formula** | (Not actually used — Clay auto-extracted JSON sub-fields) | Free |
| **Action: Add Row to Google Sheets** | Sheets export at end of Process 1 | Free |

### 5.3 Enrichment costs (observed in this session)

| Enrichment | Provider | Cost per row |
|---|---|---|
| Enrich Company | Apollo | ~0.8 |
| Find Company Social Profiles | Clay native (with custom prompt) | 3 |
| Company Revenue (waterfall) | Clearbit (3) → HG Insights (2) → SMARTe (6) → Crunchbase (15) → CB Insights (excluded) | Stops at first hit, typical 3-9 cr |
| AI prompt (mini model) | OpenAI/Anthropic via Clay | ~0.1–0.3 |
| AI prompt (full model) | OpenAI/Anthropic via Clay | ~0.3–0.5 |
| Add Row to Google Sheets | Clay native | 0 |
| Find Work Email (person-level) | Icypeas (0.2) / Enrow (0.2) / LeadMagic (0.3) / Hunter (0.4) / Findymail (0.5) / Kitt (1.0) / SMARTe (6) | Cheapest first |
| ZeroBounce email validation | Pending Process 2 | ~0.5 |

### 5.4 Patterns and gotchas (lessons learned)

#### 5.4.1 Mark inputs as OPTIONAL

When configuring an AI column with input variables like `{{industry}}` or `{{description}}`, Clay defaults to marking them as **required**. If any row has those fields empty (e.g., Apollo didn't index the company well), Clay refuses to run that row and shows an error like "Industry is blank, Description is blank".

**Fix:** in the column config, find the toggle for each input and switch from required to optional. Then add fallback rules in the prompt itself (e.g., "if industry is missing, use neutral default").

**Confirmed working:** Good Molecules row in this session — Apollo returned `Employee Count = 1` and missing description. After marking inputs as optional and adding fallback rules to the prompt, the row processed correctly with `category: Beauty & Personal Care, confidence: high` (the model inferred from name + domain).

#### 5.4.2 Clay auto-splits JSON output

When an AI column returns a JSON object like:
```json
{"category": "Beauty & Personal Care", "subcategory": "Skincare", "confidence": "high"}
```

Clay automatically detects the JSON and creates child columns — visible as separate cells in the table view. **No formula columns needed** to extract sub-fields.

#### 5.4.3 Apollo nests phone in `Locations`

The Apollo Enrich Company response has a top-level `phone` field for some companies, but for others the phone lives inside `Locations[0].phone_numbers`. To get phone reliably, expand the Locations subfield in the Clay column's "Add more data" panel.

#### 5.4.4 Industry naming sensitivity (Apollo)

Apollo returns industries with very specific wording. For example:
- `"Personal Care Product Manufacturing"` → exact match for "Personal Care" → full points in ICP scoring
- `"Manufacturing"` → only partial match → penalty in ICP scoring

This caused MakarttPro (a US D2C nail care brand, clearly within ICP) to score 67 instead of ~85 — failing the 70 threshold.

#### 5.4.5 "Find Company Social Profiles" prompt is customizable

The default Clay prompt for Find Company Social Profiles covers Instagram, LinkedIn, X, YouTube — but NOT TikTok. We customized the prompt to add TikTok. The model selected for this enrichment must have **web browsing** enabled (Perplexity recommended).

---

## 6. Process 1 — Companies enrichment (DONE)

### 6.1 Status

**Completed end-to-end on 2026-04-08.** All 7 enrichment columns + 1 export configured. Validated with 5 test companies. 3/5 qualified per the ICP threshold (≥70), 2/5 rejected.

### 6.2 Test data

File: `D:\CRM\plan_30_dias\test-5-companies.csv`

| company_name | website | country |
|---|---|---|
| Good Molecules | https://goodmolecules.com | United States |
| Mad Hippie | https://madhippie.com | United States |
| Black Girl Sunscreen | https://blackgirlsunscreen.com | United States |
| ArtNaturals | https://artnaturals.com | United States |
| MakarttPro | https://makarttpro.com | United States |

**Airtable record IDs (after re-push to clean duplicates):**

| Record ID | Company |
|---|---|
| `rec2AQ9LSDL1vjG1d` | Good Molecules |
| `rechS09ffo0vTL6Q8` | Mad Hippie |
| `recqz5GRoKIuIN2C2` | Black Girl Sunscreen |
| `recYw6dcwpWr9ukNu` | ArtNaturals |
| `recoEc3u8EucklSjd` | MakarttPro |

### 6.3 Process 1 columns (in order)

| # | Clay column | Type | Provider/Config | Status |
|---|---|---|---|---|
| 1 | Enrich Company | Enrichment | Apollo | ✅ |
| 2 | Company Revenue | Waterfall enrichment | Clearbit → HG → SMARTe → Crunchbase | ✅ |
| 3 | Find Company Social Profiles | Enrichment with custom TikTok prompt | Clay native | ✅ |
| 4 | (skipped) Email cascade at company level | — | All enrichments are person-level, deferred to Process 2 | ⏸️ |
| 5 | AI: category | AI column | GPT-4o mini, custom 10-bucket prompt | ✅ |
| 6 | (deferred) AI: classification | AI column | Deferred to post-SmartScout | ⏸️ |
| 7 | AI: ICP Score | AI column | Claude Sonnet 4.6 or GPT-4o, T04-A1 rubric | ✅ |
| 8 | Add Row to Google Sheets | Action | Sheet `companies-buffer`, append, all columns | ✅ |

### 6.4 Test results

| Company | Subcategory (AI) | Category Confidence | ICP Score | Pass | Reason |
|---|---|---|---|---|---|
| Good Molecules | Facial Serums | high | **60** | ❌ | Apollo undersized (employees=1, no description) — fallback defaults gave neutral scores |
| Mad Hippie | Skincare | high | **100** | ✅ | Strong fit |
| Black Girl Sunscreen | Sunscreen | high | **100** | ✅ | Strong fit |
| ArtNaturals | Vitamin C Serum | high | **100** | ✅ | Strong fit |
| MakarttPro | Poly Gel Kits | high | **67** | ❌ | Apollo industry "Manufacturing" → 13-point penalty |

---

## 7. AI Prompts (full text)

### 7.1 Find Company Social Profiles (custom, with TikTok)

**File:** `02-prompt-find-company-social-profiles.md`
**Used in:** Process 1, column 3
**Model requirement:** Web browsing enabled (Perplexity recommended)

```
#CONTEXT#

You are tasked with finding social media profiles for companies, given the company's domain name.

#OBJECTIVE#

Retrieve the Instagram, TikTok, LinkedIn, X (Twitter), and YouTube urls for the company with the domain .

#INSTRUCTIONS#

1. Perform a detailed search using the company domain  to locate its official social media profiles.

2. Specifically, look for the following platforms:
   - instagram.com
   - tiktok.com
   - linkedin.com
   - x.com
   - youtube.com

3. If a profile for a specific platform is not found, mark it as "Not Found".

4. Ensure that retrieved urls are valid and lead to the company's official page on each platform.

5. Provide the full url for each social media profile found.

6. For TikTok, the official profile url format is "https://www.tiktok.com/@username" — make sure to include the @ symbol in the handle.

Only provide links where you are extremely confident they are the right fit. Do not provide incorrect information.

#EXAMPLES#

If given the domain example.com, a successful output would have:
   - Instagram: "https://www.instagram.com/example"
   - TikTok: "https://www.tiktok.com/@example"
   - LinkedIn: "https://www.linkedin.com/company/example"
   - X (Twitter): "https://www.x.com/example"
   - YouTube: "https://www.youtube.com/user/example"

If a link is not found, return "Not Found" for that platform.
```

### 7.2 AI Category (10-bucket macro + subcategory + confidence)

**File:** `03-prompt-ai-category.md`
**Used in:** Process 1, column 5
**Model:** GPT-4o mini or Claude Haiku 4.5

```
You are categorizing an e-commerce company into a TWO-LEVEL taxonomy.

OUTPUT FORMAT (JSON only, no prose):
{
  "category": "<one of the 10 macro categories>",
  "subcategory": "<specific niche, 1-3 words>",
  "confidence": "<high|medium|low>"
}

VALID MACRO CATEGORIES (pick exactly one):
1. Beauty & Personal Care    → skincare, makeup, hair, fragrance, nails, men's grooming, oral care
2. Health & Wellness         → supplements, vitamins, sports nutrition, sleep, sexual wellness, OTC
3. Home & Living             → home goods, decor, kitchen, cleaning, organization, furniture
4. Pet                       → pet food, pet care, pet accessories, vet products
5. Food & Beverage           → snacks, beverages, specialty food, coffee, tea, alcohol
6. Apparel & Accessories     → clothing, footwear, jewelry, bags, watches, eyewear
7. Sports & Outdoors         → fitness equipment, outdoor gear, athleisure
8. Baby & Kids               → baby care, toys, kids apparel, maternity
9. Electronics & Tech        → consumer electronics, smart home, wearables, gadgets, gaming
10. Other                    → B2B, services, industrial, or anything that doesn't fit cleanly

SUBCATEGORY RULES:
- 1 to 3 words maximum
- Be specific: "Sunscreen" not "Skincare"; "Pet Food" not "Pet"
- Use Title Case

CONFIDENCE RULES:
- "high"   → description clearly indicates the category and a specific product line
- "medium" → category is clear but subcategory is inferred from limited data
- "low"    → had to guess based on company name only

TIE-BREAKING RULES:
1. If a company sells multiple products, pick the category of its FLAGSHIP/dominant line.
2. Skincare brands that also sell makeup → "Beauty & Personal Care".
3. Multivitamin brands → "Health & Wellness", subcategory "Vitamin Supplements".
4. Pet food brands → "Pet", subcategory "Pet Food".
5. If the company is a marketplace, manufacturer, or B2B service → "Other".
6. NEVER return null, empty, or "Not Found" for category. If you cannot
   determine, return: {"category": "Other", "subcategory": "Unknown", "confidence": "low"}

INPUT DATA:
- Company name: {{company_name}}
- Industry (Apollo): {{industry}}
- Description: {{description}}
- Website: {{website}}

OUTPUT:
```

**Variable mapping:**
| Variable | Clay column | Required? |
|---|---|---|
| `{{company_name}}` | `Name` (Apollo) | ✅ |
| `{{industry}}` | `Industry` (Apollo) | ⬜ Optional |
| `{{description}}` | `Description` (Apollo) | ⬜ Optional |
| `{{website}}` | `Website (2)` or `Domain` | ⬜ Optional |

### 7.3 AI ICP Score (T04-A1 6-criterion rubric, 0–100)

**File:** `04-prompt-ai-icp-score.md`
**Used in:** Process 1, column 7
**Model:** Claude Sonnet 4.6 or GPT-4o (NOT mini)
**Threshold:** `icp_score >= 70` → `passes_filter = true` → row qualifies for Process 2

```
You are scoring whether a company is an Ideal Customer Profile (ICP) match for
Laneta, an agency that produces UGC/influencer video content for e-commerce
brands selling on Amazon and DTC.

OUTPUT FORMAT (JSON only, no prose, no markdown code block):
{
  "icp_score": <integer 0-100>,
  "icp_reason": "<one sentence explaining the score>",
  "passes_filter": <true if icp_score >= 70, else false>,
  "criteria_breakdown": {
    "industry": <0-25>,
    "company_size": <0-20>,
    "geography": <0-15>,
    "category_fit": <0-15>,
    "revenue_signal": <0-15>,
    "digital_presence": <0-10>
  }
}

SCORING RUBRIC (total 100 points):

1. INDUSTRY (25 pts)
   - Award 25 if industry is: Health & Wellness, Beauty, CPG, E-commerce, Personal Care
   - Award 12 if adjacent: Wellness, Lifestyle, Consumer Goods
   - Award 0 if in: pharma, tobacco, gambling, crypto, weapons, adult, B2B SaaS
   - Award 5 if industry data is missing but company name suggests consumer goods

2. COMPANY SIZE (20 pts)
   - Award 20 if employees_count is between 10 and 500
   - Award 10 if 5-9 or 501-1000
   - Award 5 if 1-4 or 1001-2000
   - Award 0 if >2000 or 0
   - Award 8 if employees data is missing

3. GEOGRAPHY (15 pts)
   - Award 15 if HQ country is: US, USA, United States, Mexico, MX, or any LATAM country
   - Award 0 otherwise
   - Award 7 if country data is missing

4. CATEGORY FIT (15 pts)
   - Award 15 if category is: Beauty & Personal Care, Health & Wellness, Home & Living, Pet
   - Award 10 if Food & Beverage, Sports & Outdoors, Baby & Kids
   - Award 5 if Apparel & Accessories, Electronics & Tech
   - Award 0 if Other

5. REVENUE SIGNAL (15 pts)
   - Award 15 if estimated_revenue is between $500,000 and $50,000,000 USD
   - Award 8 if $100,000 - $500,000 OR $50M - $100M
   - Award 0 if <$100,000 or >$100M
   - Award 7 if revenue data is missing

6. DIGITAL PRESENCE (10 pts)
   - Award 10 if at least 2 of: instagram_url, tiktok_url, youtube_url
   - Award 5 if exactly 1
   - Award 0 if none
   - Do NOT count linkedin or facebook

FALLBACK RULES:
- NEVER return null, empty, "Not Found", or omit any field
- If data is sparse, use the missing-data defaults above
- The icp_score is the SUM of the 6 criteria_breakdown values

INPUT DATA:
- Company name: {{company_name}}
- Website: {{website}}
- Industry (Apollo): {{industry}}
- Description: {{description}}
- Country: {{country}}
- City: {{city}}
- Employees count: {{employees_count}}
- Estimated revenue: {{estimated_revenue}}
- Category (macro): {{category}}
- Subcategory: {{subcategory}}
- Instagram URL: {{instagram_url}}
- TikTok URL: {{tiktok_url}}
- YouTube URL: {{youtube_url}}
- LinkedIn URL: {{linkedin_url}}

OUTPUT:
```

**Variable mapping:** all 14 inputs marked as Optional except `{{company_name}}` and `{{website}}`.

### 7.4 The "no Not Found" pattern

For both `ai-category` and `ai-icp-score`, the prompts explicitly forbid returning `null`, empty, or `"Not Found"`. This is a deliberate pattern (different from `find-company-social-profiles` where "Not Found" is a valid outcome because a brand may legitimately not have a TikTok).

**Rationale:** every company has SOME category and SOME ICP score — the question is just confidence. The 2-axis system (`category` × `confidence`, or `icp_score` × `criteria_breakdown`) captures uncertainty more cleanly than a single "unknown" value.

This pattern should apply to **all future** AI classification columns in this pipeline.

---

## 8. Airtable Integration

### 8.1 Credentials

**Location:** `D:\CRM\plan_30_dias\tracker\.env.local` (gitignored)

```
AIRTABLE_PAT=patvxa...<rest of token>
AIRTABLE_BASE_ID=appMuVbSxyIyvudhi
AIRTABLE_TABLE_NAME=companies
VITE_AIRTABLE_API_KEY=<same as AIRTABLE_PAT>
```

**PAT permissions verified in this session:**
- `data.records:write` ✅
- `data.records:read` ✅
- `schema.bases:read` ✅
- `schema.bases:write` ✅

### 8.2 Base and table IDs

| Resource | ID |
|---|---|
| Base | `appMuVbSxyIyvudhi` |
| Table `companies` | `tbljOLeUz5jh3nHz6` |
| Table `Contacts` (existing, undersized) | `tblmJg8HvCE3sizWw` |
| View "Grid view" of `companies` | `viwzlLGfioLCE7AT4` |
| Direct URL to companies | https://airtable.com/appMuVbSxyIyvudhi/tbljOLeUz5jh3nHz6 |

### 8.3 `companies` table schema (final state — 26 fields)

#### Pre-existing (7 fields)

| # | Field name | Type | Notes |
|---|---|---|---|
| 1 | `company_name` | singleLineText (primary) | Required |
| 2 | `website` | url | Required |
| 3 | `industry` | singleLineText | |
| 4 | `country` | singleLineText | |
| 5 | `supabase_id` | singleLineText | Empty in test |
| 6 | `status` | singleSelect | Options: `pending`, `enriched`, `qualified`, `rejected`. **MISSING** `syncing` and `error` |
| 7 | `synced_at` | dateTime | |

#### Added in this session via Metadata API (17 fields, batch 1)

| # | Field name | Type | Field ID |
|---|---|---|---|
| 8 | `category` | singleLineText | `fldqRPk9oXoZzixyM` |
| 9 | `classification` | singleSelect | `fldpq9yMH3NDvJtOk` |
| 10 | `city` | singleLineText | `flddznPsJEIZBr3N0` |
| 11 | `estimated_revenue` | number | `fldUnMlVbjGcAGm9S` |
| 12 | `online_store_url` | url | `fldd5fBM6xNokTHpY` |
| 13 | `instagram_handle` | singleLineText | `fldt1sm0y6DI3k9Wz` |
| 14 | `tiktok_handle` | singleLineText | `fldErXGu1xWH9pttD` |
| 15 | `youtube_url` | url | `fldiMrE5zehKS0I7x` |
| 16 | `linkedin_url` | url | `fldKtPoAQGC1beVEi` |
| 17 | `facebook_url` | url | `fld1DGsGHS01LRucP` |
| 18 | `corporate_email` | email | `fldRBLdGXBuIvjMSy` |
| 19 | `phone` | phoneNumber | `fldXAAShLQCOjAxc1` |
| 20 | `employees_count` | number | `fld3y1OBhYUpPI938` |
| 21 | `icp_score` | number | `fldHvu1kDkyPtpSv9` |
| 22 | `icp_reason` | multilineText | `fldK4027HOeLyr2wj` |
| 23 | `video_gap_score` | number | `fldNWe500PU77IK0A` |
| 24 | `enrichment_status` | singleSelect | `fldTwZzqn00NO5VRz` |

#### Added in this session via Metadata API (2 fields, batch 2)

| # | Field name | Type | Field ID |
|---|---|---|---|
| 25 | `subcategory` | singleLineText | `fldYIOuX9d4UnnRNo` |
| 26 | `category_confidence` | singleSelect (high/medium/low) | `fldT5FhK71k2NVNRl` |

### 8.4 `Contacts` table schema (existing — undersized, do NOT extend)

| Field | Type |
|---|---|
| `name` | singleLineText (primary) |
| `company` | singleLineText |
| `email` | email |
| `website` | url |
| `synced_at` | dateTime |

**Decision: do NOT extend.** Airtable is being phased out. Process 2 will write contacts to Google Sheets (`contacts-buffer`) directly, bypassing Airtable.

### 8.5 Mapping: Airtable English → Supabase Spanish (`client_inventory`)

| Airtable field | Supabase column |
|---|---|
| `company_name` | `name` |
| `website` | `website_url` |
| `industry` | `industry` |
| `country` | `country` |
| `city` | `city` |
| `category` | `primary_category` |
| `subcategory` | (extension — JSONB) |
| `category_confidence` | (extension — JSONB) |
| `classification` | `classification` |
| `estimated_revenue` | `estimated_marketplace_revenue` |
| `online_store_url` | `online_store_url` |
| `instagram_handle` | `instagram_handle` |
| `tiktok_handle` | `tiktok_handle` |
| `youtube_url` | `youtube_url` |
| `linkedin_url` | `linkedin_url` |
| `facebook_url` | `facebook_url` |
| `corporate_email` | `corporate_email` |
| `phone` | `phone` |
| `employees_count` | → `qualification_criteria` JSONB |
| `icp_score` | `qualification_score` |
| `icp_reason` | → `qualification_criteria` JSONB |
| `video_gap_score` | → `qualification_criteria` JSONB |
| `supabase_id` | `id` (FK loop-back) |

### 8.6 Metadata API limitations (HARD CONSTRAINTS)

The following operations **cannot** be done via API and require manual UI action:

1. **PATCH options on existing singleSelect fields.** Returns 422. Tested 3 different shapes — all failed.
2. **Create views.** No endpoint exists.
3. **Delete fields.** Theoretically possible but risky — not attempted.

### 8.7 Reusable Python snippets

**Add a field:**
```python
import json, urllib.request
url = 'https://api.airtable.com/v0/meta/bases/appMuVbSxyIyvudhi/tables/tbljOLeUz5jh3nHz6/fields'
field = {'name': 'category', 'type': 'singleLineText'}
req = urllib.request.Request(
    url, data=json.dumps(field).encode(),
    headers={'Authorization': f'Bearer {pat}', 'Content-Type': 'application/json'},
    method='POST'
)
print(json.loads(urllib.request.urlopen(req).read()))
```

**Push records from CSV:**
```python
import json, urllib.request, csv
records = []
with open('test-5-companies.csv', encoding='utf-8') as f:
    for row in csv.DictReader(f):
        records.append({'fields': {
            'company_name': row['company_name'],
            'website': row['website'],
            'country': row['country'],
            'status': 'pending'
        }})
url = 'https://api.airtable.com/v0/appMuVbSxyIyvudhi/tbljOLeUz5jh3nHz6'
body = json.dumps({'records': records, 'typecast': True}).encode()
req = urllib.request.Request(
    url, data=body,
    headers={'Authorization': f'Bearer {pat}', 'Content-Type': 'application/json'},
    method='POST'
)
print(json.loads(urllib.request.urlopen(req).read()))
```

**Delete records (batch of 10):**
```python
ids_to_delete = ['recXXX', 'recYYY']
qs = '&'.join(f'records[]={rid}' for rid in ids_to_delete[:10])
req = urllib.request.Request(
    f'https://api.airtable.com/v0/appMuVbSxyIyvudhi/tbljOLeUz5jh3nHz6?{qs}',
    headers={'Authorization': f'Bearer {pat}'},
    method='DELETE'
)
urllib.request.urlopen(req)
```

---

## 9. Google Sheets Buffer

### 9.1 Sheet info

- **Name:** "Laneta CRM - Clay Buffer"
- **Tabs:**
  - `companies-buffer` — populated by Process 1 ✅
  - `contacts-buffer` — to be created in Process 2 ⏳

### 9.2 Configuration in Clay

- **Enrichment type:** "Add Row to Google Sheets" (Clay native action)
- **Mode:** Append (preserves history)
- **Columns selected:** ALL Clay columns
- **Cost:** 0 credits

### 9.3 Future Apps Script integration

When the Apps Script layer is built:
1. On-edit trigger reads new rows from `companies-buffer`
2. Maps English Airtable-style fields → Spanish/Supabase column names
3. Upserts to Supabase `client_inventory` via REST API
4. Optionally writes back the resulting `id` to the row's `supabase_id` field

This is **not yet built**.

---

## 10. Process 2 — Contacts enrichment (IN PROGRESS)

### 10.1 Status

**Architecture decided. Configuration not yet started.**

### 10.2 Architecture: Option B (separate Clay table)

**Option B (CHOSEN):** Create a separate Clay table called `contacts` that takes the qualified companies as input. Each person found by Apollo Find People becomes its own row.

**Webhook-friendly variant:** the new `contacts` table is configured as **standalone**. Today the input is manually pushed (3 qualified companies). Tomorrow, when the Clay license enables HTTP webhooks, the same table receives input from the real CRM webhook. Zero refactor.

### 10.3 Source data for the test

Only the **3 qualified companies** from Process 1:

| Airtable record_id | Company | Domain |
|---|---|---|
| `rechS09ffo0vTL6Q8` | Mad Hippie | madhippie.com |
| `recqz5GRoKIuIN2C2` | Black Girl Sunscreen | blackgirlsunscreen.com |
| `recYw6dcwpWr9ukNu` | ArtNaturals | artnaturals.com |

### 10.4 Pipeline (planned)

| # | Step | Provider/Config | Status |
|---|---|---|---|
| 1 | Create Clay table `contacts` (standalone) with 3 manual rows | Manual or small push script | ⏳ Next |
| 2 | Apollo "Find People at Company" — limit 3, title filters from T04-A1 | Filters: CMO, VP Marketing, Head of E-commerce, Brand Manager, Marketing Director, Head of Content | ⏳ |
| 3 | Verify ~9 rows created (3 people × 3 companies) | Clay UI inspection | ⏳ |
| 4 | Email cascade (waterfall) | Order: Icypeas (0.2) → Enrow (0.2) → LeadMagic (0.3) → Hunter (0.4) → Findymail (0.5) | ⏳ |
| 5 | Email validation | ZeroBounce (~0.5 cr/row) | ⏳ |
| 6 | Phone (Apollo, optional for test) | Apollo Find Person phone | ⏳ |
| 7 | Add Row to Google Sheets — new tab `contacts-buffer` | Clay native action | ⏳ |
| 8 | Run end-to-end on 3 source rows → expect 6–9 contact rows | — | ⏳ |

**Estimated cost:** ~35–50 credits total for Process 2 test.

### 10.5 Title filter for Apollo Find People

Per T04-A1 (`titulos_decision`):
- CMO
- VP Marketing
- Head of E-commerce
- Brand Manager
- Marketing Director
- Head of Content

Apollo uses fuzzy title matching. Configure with **OR** logic.

### 10.6 Expected output schema (per row in `contacts-buffer`)

| Field | Source |
|---|---|
| `company_name` | propagated from input row |
| `company_domain` | propagated |
| `airtable_company_record_id` | propagated (FK for upsert) |
| `first_name` | Apollo |
| `last_name` | Apollo |
| `full_name` | Apollo |
| `job_title` | Apollo |
| `seniority` | Apollo |
| `linkedin_url` | Apollo Find People |
| `email` | Email cascade output |
| `email_provider` | Which provider in cascade returned the hit |
| `email_status` | ZeroBounce: valid/catch-all/invalid/unknown |
| `phone` | Apollo (optional) |
| `country` | Apollo |
| `city` | Apollo |
| `is_decision_maker` | Derived: title matches T04-A1 senior list → true |

---

## 11. Tasks Status (handoff list)

### Completed (12)

| # | Task | Result |
|---|---|---|
| 1 | Fix .env.local Airtable variable labels | Done |
| 2 | Add 17 missing fields to Airtable companies table via API | Done |
| 5 | Push 5 test companies via Airtable API | Done (after deleting 5 duplicates) |
| 6 | Update 01-airtable-companies-setup.md to English convention | Done |
| 7 | Configure Clay column: Email Cascade (or skip) | Skipped — deferred to Process 2 |
| 8 | Configure Clay AI column: category | Done — 5/5 high confidence |
| 10 | Configure Clay AI column: icp_score + icp_reason | Done — 3/5 qualified |
| 11 | Configure Clay export to Google Sheets buffer | Done |
| 12 | Validate Process 1 end-to-end on 5 test companies | Done |
| 13 | Decide Process 2 architecture | Option B selected |
| 19 | Generate comprehensive CLAUDE.md context document | THIS FILE |

### In progress (1)

| # | Task | Notes |
|---|---|---|
| 15 | Configure Apollo Find People at Company in Clay | Next concrete action |

### Pending (5)

| # | Task | Notes |
|---|---|---|
| 14 | Create Airtable contacts table with T04-A3 schema | DEFERRED — Airtable temporary |
| 16 | Configure email cascade for contacts | Order: Icypeas → Enrow → LeadMagic → Hunter → Findymail |
| 17 | Configure email validation | ZeroBounce |
| 18 | Configure contacts-buffer Sheets export | New tab |

### Blocked / manual UI actions (2)

| # | Task | Why blocked |
|---|---|---|
| 3 | Add `syncing` and `error` options to status singleSelect | Metadata API limitation |
| 4 | Create `clay-pending` filtered view | Metadata API limitation |

### Deferred (1)

| # | Task | Why deferred |
|---|---|---|
| 9 | Configure Clay AI column: classification | Post-SmartScout phase |

---

## 12. Decisions Log

### 12.1 English field names in Airtable
Pre-existing convention. Don't break it. Mapping to Spanish/Supabase happens in Apps Script.

### 12.2 Skip Process 1 email cascade
All Clay email enrichments are person-level. T04-A1 doesn't use email as criterion.

### 12.3 Defer `classification` AI column
Zero variance for 5 test companies. Wait for SmartScout diversity.

### 12.4 Google Sheets as buffer
Captures ALL Clay columns. Single integration point. Append mode preserves history.

### 12.5 Process 2 — Option B (separate Clay table)
1:N modeling clean. Standalone for webhook compatibility.

### 12.6 Don't extend Airtable Contacts table
Airtable temporary. Process 2 → Sheets directly.

### 12.7 Accept Process 1 test results without tuning
5 datapoints insufficient for tuning. Wait for real volume.

---

## 13. Test Data

### 13.1 The 5 companies

All US-based D2C beauty/skincare brands chosen because they match T04-A1 ICP, have public web presence, and cover a range of Apollo data quality.

| Company | Why chosen |
|---|---|
| Good Molecules | Deliberately weak Apollo data — tests fallback rules |
| Mad Hippie | Strong Apollo data, well-known indie skincare |
| Black Girl Sunscreen | Brand awareness signal, PR coverage |
| ArtNaturals | Multi-product line — tests category disambiguation |
| MakarttPro | Different niche (nail care), Apollo industry "Manufacturing" — caught the industry naming bug |

### 13.2 How to re-run the test

1. Push records via Python snippet in section 8.7
2. Verify in Airtable UI
3. Trigger Clay sync
4. Run all enrichment columns
5. Validate output in Sheets `companies-buffer`

---

## 14. Known Issues & Gotchas

### 14.1 Apollo "Manufacturing" industry penalty
MakarttPro scored 67 instead of ~85 because Apollo returned generic "Manufacturing" instead of specific "Personal Care Product Manufacturing". 13-point penalty in industry criterion.

### 14.2 Good Molecules Apollo undersized
Apollo returned `Employee Count = 1`, missing description. Possibly a sub-brand confusion. Fallback rules handled correctly.

### 14.3 Apollo nests phone in Locations
Phone not at top level. Drill into `Locations[0].phone_numbers`.

### 14.4 Metadata API can't PATCH singleSelect options
Hard limitation. Manual UI required.

### 14.5 Metadata API can't create views
Hard limitation. Manual UI required.

### 14.6 .env.local labels were swapped (fixed)
Originally `AIRTABLE_PAT` held the base ID. Fixed in this session.

### 14.7 .env not in tracker/.gitignore (fixed)
Added `.env*` to gitignore in this session.

### 14.8 Duplicate records when both UI import + API push
User imported CSV manually + I pushed via API → 10 records. Cleaned up via delete script.

### 14.9 Confidence warning on MakarttPro TikTok
Yellow warning icon. Accepted in test.

---

## 15. External References

### 15.1 Files in this folder (`Implementación/Clay/`)

| File | Purpose |
|---|---|
| `CLAUDE.md` | THIS FILE |
| `01-airtable-companies-setup.md` | Setup history and schema for Airtable `companies` |
| `02-prompt-find-company-social-profiles.md` | TikTok-customized social profiles prompt |
| `03-prompt-ai-category.md` | 10-category macro + subcategory + confidence prompt |
| `04-prompt-ai-icp-score.md` | T04-A1 6-criterion ICP scoring prompt |
| `IDEA - ESTRUCTURA DEL CLAY CASCADE.md` | Earlier brainstorming |
| `Minera Smart Scout .docx.pdf` | SmartScout reference (deferred) |
| `inventory-entities-data-dictionary.md` | Data dictionary for Supabase entities |
| `datos-prueba/` | Earlier test CSVs |

### 15.2 Templates folder (`tracker/public/templates/`)

| File | Purpose |
|---|---|
| `T04-A1-criterios-icp-b2b.csv` | ICP criteria for brands |
| `T04-A2-empresa-prospecto-b2b.csv` | Companies schema → Supabase mapping |
| `T04-A3-contacto-empresa-b2b.csv` | Contacts schema → Supabase mapping |
| `T04-B1-criterios-icp-creadores.csv` | Creator ICP (NOT used by Clay) |
| `T04-B2-creador-prospecto.csv` | Creator schema (NOT used by Clay) |
| `T04-B3-perfil-social-creador.csv` | Creator social profile schema |
| `empleados-internos-swap-test.csv` | Unrelated internal test |

### 15.3 Test data

| File | Purpose |
|---|---|
| `D:\CRM\plan_30_dias\test-5-companies.csv` | 5 US D2C beauty brands for Process 1 |

### 15.4 Credentials

| File | Contains |
|---|---|
| `D:\CRM\plan_30_dias\tracker\.env.local` | `AIRTABLE_PAT`, `AIRTABLE_BASE_ID`, etc. |

### 15.5 External URLs

| Resource | URL |
|---|---|
| Airtable base UI | https://airtable.com/appMuVbSxyIyvudhi/tbljOLeUz5jh3nHz6 |
| Airtable API base | https://api.airtable.com/v0/appMuVbSxyIyvudhi/tbljOLeUz5jh3nHz6 |
| Airtable Metadata API | https://api.airtable.com/v0/meta/bases/appMuVbSxyIyvudhi |
| Clay (operated via UI) | https://app.clay.com |

---

## 16. For the next agent: how to resume Process 2

**Concrete next action (Task #15):** Configure Apollo Find People at Company in Clay.

### Step-by-step

1. **In Clay**, create a new table called `contacts`.
2. **Source:** standalone (NOT auto-import from companies table). Webhook-friendly.
3. **Add 3 manual rows** with these columns:
   - `company_name`: Mad Hippie / Black Girl Sunscreen / ArtNaturals
   - `company_domain`: madhippie.com / blackgirlsunscreen.com / artnaturals.com
   - `airtable_company_record_id`: rechS09ffo0vTL6Q8 / recqz5GRoKIuIN2C2 / recYw6dcwpWr9ukNu
4. **Add column "Find People at Company"** (Apollo enrichment):
   - Input: `company_domain`
   - Filters: title contains any of `CMO`, `VP Marketing`, `Head of E-commerce`, `Brand Manager`, `Marketing Director`, `Head of Content`
   - Limit: 3 people per company
   - Configure to **explode results** so each person becomes its own row in the table
5. **Validate:** the table should now have ~9 rows (3 people × 3 companies)
6. **Continue with section 10.4 steps 4–8** (email cascade, ZeroBounce, phone, Sheets export, end-to-end run)

### What to ask the user before proceeding

1. Has the Clay license upgrade been purchased yet?
2. Which is the future webhook source CRM? (Supabase Laneta v2 or other?)
3. Should I create `contacts-buffer` tab in the existing sheet, or a new sheet?

### What NOT to do

- Don't extend the Airtable Contacts table
- Don't add more fields to Airtable companies via API without user confirmation
- Don't tune ICP score prompt based on the 5-row test results
- Don't try to PATCH singleSelect options or create views via Metadata API
- Don't run Process 1 again on the same 5 companies unless explicitly asked

---

## End of CLAUDE.md

If you reached this point, you have full context to continue any work in the Clay folder. Welcome.

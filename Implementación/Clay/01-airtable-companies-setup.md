# Setup Airtable — `companies` table (Process 1)

> **Session scope:** Configure Clay enrichment and pass the 5-company test. SmartScout is out of scope (later phase). Input: `D:\CRM\plan_30_dias\test-5-companies.csv`.

> **Naming convention:** **English** field names in Airtable. The Spanish T04-A2 template (`campo_csv`) maps to Supabase `client_inventory` column names — the Apps Script layer (later phase) translates English Airtable fields to Supabase column names. Airtable schema is the source of truth for the Clay pipeline.

---

## Pipeline architecture

```
test-5-companies.csv
   ↓ (push via Airtable API)
Airtable: companies (table)
   ↓ (sync via clay-pending view)
Clay: Process 1 (company enrichment)
   ↓ filter icp_score >= 70
Clay: Process 2 (contacts enrichment) ← phase 2
   ↓
Google Sheets buffer ← phase 2
   ↓
Apps Script → Supabase ← phase 3
```

---

## Airtable references

- **Base ID:** `appMuVbSxyIyvudhi`
- **Table `companies` ID:** `tbljOLeUz5jh3nHz6`
- **URL:** https://airtable.com/appMuVbSxyIyvudhi/tbljOLeUz5jh3nHz6
- **Credentials:** `tracker/.env.local` → `AIRTABLE_PAT`, `AIRTABLE_BASE_ID`, `AIRTABLE_TABLE_NAME`

---

## Final schema (24 fields)

| # | Field name | Type | Origin | Notes |
|---|---|---|---|---|
| 1 | `company_name` | singleLineText (primary) | CSV / SmartScout | Required |
| 2 | `website` | url | CSV / SmartScout | Required |
| 3 | `country` | singleLineText | CSV | Required |
| 4 | `supabase_id` | singleLineText | System | Empty in test, set on upsert |
| 5 | `status` | singleSelect | System | `pending`, `enriched`, `qualified`, `rejected`, (manual: `syncing`, `error`) |
| 6 | `synced_at` | dateTime | System | Last sync timestamp |
| 7 | `industry` | singleLineText | Clay AI | |
| 8 | `category` | singleLineText | Clay AI | Skincare/Supplements/Home/Pet |
| 9 | `classification` | singleSelect | Clay AI | `brand`, `private_label`, `manufacturer` |
| 10 | `city` | singleLineText | Apollo | |
| 11 | `estimated_revenue` | number (integer) | Apollo | NOT Amazon-specific in test |
| 12 | `online_store_url` | url | TBD SmartScout | Skip in test |
| 13 | `instagram_handle` | singleLineText | Clay Find Social Profiles | |
| 14 | `tiktok_handle` | singleLineText | Clay Find Social Profiles | |
| 15 | `youtube_url` | url | Clay HTTP / scrape | |
| 16 | `linkedin_url` | url | Clay Find Company LinkedIn | |
| 17 | `facebook_url` | url | Clay Find Social Profiles | |
| 18 | `corporate_email` | email | Clay cascade Prospeo→Findymail→Hunter | |
| 19 | `phone` | phoneNumber | Apollo | |
| 20 | `employees_count` | number (integer) | Apollo | |
| 21 | `icp_score` | number (integer 0–100) | Clay AI prompt | |
| 22 | `icp_reason` | multilineText | Clay AI | |
| 23 | `video_gap_score` | number (integer) | TBD SmartScout | Skip in test |
| 24 | `enrichment_status` | singleSelect | Clay | `pending`, `done`, `failed` |

### Mapping Airtable → Supabase (`client_inventory`)

When the Apps Script layer is built (phase 3), the translation will be:

| Airtable | Supabase column |
|---|---|
| `company_name` | `name` |
| `website` | `website_url` |
| `industry` | `industry` |
| `country` | `country` |
| `city` | `city` |
| `category` | `primary_category` |
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
| `supabase_id` | `id` (FK) |

---

## Status of this setup

| Task | Status | Notes |
|---|---|---|
| Base + table exist | ✅ | Pre-existing |
| 17 missing fields added via Metadata API | ✅ | Done — see below |
| 5 test records pushed via API | ✅ | Done — see below |
| `.env.local` credentials fixed | ✅ | `AIRTABLE_PAT` and `AIRTABLE_BASE_ID` reordered |
| `.env*` added to `tracker/.gitignore` | ✅ | |
| Add `syncing` and `error` to `status` field | ⏳ MANUAL | API doesn't support PATCH on singleSelect options |
| Create `clay-pending` filtered view | ⏳ MANUAL | API doesn't support view creation |
| Connect Airtable → Clay | ⏳ Next | |
| Configure Clay Process 1 columns | ⏳ Next | |

### 5 records pushed (record IDs)

| Record ID | company_name |
|---|---|
| `recP3Fed9wWvpFgCe` | Good Molecules |
| `recTmqPVvcRUeebDL` | Mad Hippie |
| `rec60uz6PRDFnGuTT` | Black Girl Sunscreen |
| `recMhHuWPhHDGsXgP` | ArtNaturals |
| `recZSUg7TQ6QJj68f` | MakarttPro |

---

## Manual actions you need to do in Airtable UI

**1. Add `syncing` and `error` options to the `status` field**
   - Open `companies` table → click `status` column header → Customize field type → Add option
   - Add: `syncing` (color: blue), `error` (color: orange)

**2. Create `clay-pending` view**
   - In `companies` table → Create → Grid view → name it `clay-pending`
   - Filter: `status` is `pending` AND `enrichment_status` is empty
   - This is what Clay will sync from

---

## Next: Connect Airtable to Clay

1. In Clay: **New Table → Import from Airtable**
2. Authorize the base `appMuVbSxyIyvudhi`
3. Select table `companies`, view `clay-pending`
4. Sync mode: **Sync new rows automatically**
5. Verify the 5 rows appear in Clay

---

## Process 1 — Clay column-by-column plan

Order of columns to add in Clay:

| # | Clay column | Enrichment | Input | Write-back to Airtable |
|---|---|---|---|---|
| 1 | `domain` | Formula: extract domain from `website` | `website` | — |
| 2 | `apollo_company` | Apollo "Enrich Company" | `domain` | — |
| 3 | `employees_count` | Map from `apollo_company.employees` | | ✅ `employees_count` |
| 4 | `estimated_revenue` | Map from `apollo_company.annual_revenue` | | ✅ `estimated_revenue` |
| 5 | `city` | Map from `apollo_company.city` | | ✅ `city` |
| 6 | `phone` | Map from `apollo_company.phone` | | ✅ `phone` |
| 7 | `linkedin_url` | Clay "Find Company LinkedIn URL" | `domain` | ✅ `linkedin_url` |
| 8 | `social_profiles` | Clay "Find Social Profiles" | `domain` | — (split into 3 cols) |
| 9 | `instagram_handle` | Map from `social_profiles.instagram` | | ✅ `instagram_handle` |
| 10 | `tiktok_handle` | Map from `social_profiles.tiktok` | | ✅ `tiktok_handle` |
| 11 | `facebook_url` | Map from `social_profiles.facebook` | | ✅ `facebook_url` |
| 12 | `youtube_url` | Clay HTTP / scrape (optional in test) | `domain` | ✅ `youtube_url` |
| 13 | `corporate_email` | Email cascade: Prospeo → Findymail → Hunter | `domain` | ✅ `corporate_email` |
| 14 | `industry` | AI prompt (Claude/GPT) on website description | `apollo_company.description` | ✅ `industry` |
| 15 | `category` | AI prompt (Skincare/Supplements/Home/Pet/Other) | `industry` + description | ✅ `category` |
| 16 | `classification` | AI prompt (brand/private_label/manufacturer) | description | ✅ `classification` |
| 17 | `icp_score` + `icp_reason` | AI prompt (T04-A1, see below) | all of the above | ✅ `icp_score`, ✅ `icp_reason` |
| 18 | `enrichment_status` | Formula: `done` if OK, `failed` if error | | ✅ `enrichment_status` |
| 19 | `synced_at` | Formula: NOW() | | ✅ `synced_at` |
| 20 | `status` (update) | Formula: `qualified` if `icp_score >= 70`, else `rejected` | | ✅ `status` |

---

## ICP scoring AI prompt (Clay AI column)

**Recommended model:** Claude Sonnet 4.6 or GPT-4o
**Output format:** JSON
**Based on:** `tracker/public/templates/T04-A1-criterios-icp-b2b.csv`

```
You are scoring whether a company is an Ideal Customer Profile (ICP) match for
Laneta, an agency that produces UGC/influencer video content for e-commerce
brands selling on Amazon and DTC.

Score from 0 to 100 based on these weighted criteria:

1. INDUSTRY (25 pts) — Award full points if the company is in:
   Health & Wellness, Beauty, CPG, or E-commerce.
   Award 0 if in: pharma, tobacco, gambling, crypto.
   Half points for adjacent industries.

2. COMPANY SIZE (20 pts) — Sweet spot is 10–500 employees.
   Award 20 if within range, 10 if 5–10 or 500–1000, 0 if outside.

3. GEOGRAPHY (15 pts) — Award full points if HQ is in US, Mexico, or LATAM.
   Award 0 otherwise.

4. CATEGORY FIT (15 pts) — Award full points if product category matches:
   Skincare, Supplements, Home, Pet.
   Half points for adjacent (Beauty tools, Wellness, Food).

5. REVENUE SIGNAL (15 pts) — Award full points if estimated revenue is
   between $500K and $50M (sweet spot for $2k–$12k deals).
   Award half points outside that range but >$100K.

6. DIGITAL PRESENCE (10 pts) — Award full points if the company has at least
   one of: active Instagram, TikTok, or YouTube channel. Half if only website.

INPUT DATA:
- Company name: {{company_name}}
- Website: {{website}}
- Industry: {{industry}}
- Category: {{category}}
- Country: {{country}}
- Employees: {{employees_count}}
- Revenue estimate: {{estimated_revenue}}
- Instagram: {{instagram_handle}}
- TikTok: {{tiktok_handle}}
- YouTube: {{youtube_url}}

OUTPUT (JSON only, no prose):
{
  "icp_score": <int 0-100>,
  "icp_reason": "<one sentence explaining the score>",
  "passes_filter": <true if icp_score >= 70, else false>
}
```

**Filter:** `icp_score >= 70` triggers Process 2 (contacts).

---

## Test validation checklist

After running Process 1 on the 5 companies:

- [ ] All 5 rows have `enrichment_status = done`
- [ ] `employees_count`, `city`, `industry`, `category` populated
- [ ] `linkedin_url` valid for at least 4 of 5
- [ ] At least one social handle captured per company
- [ ] `corporate_email` captured for at least 3 of 5
- [ ] `icp_score` between 0–100, `icp_reason` coherent
- [ ] All 5 (US Beauty/Skincare brands) should score `>= 70` per T04-A1
- [ ] `status` updated to `qualified` or `rejected`

If any score is incoherent, adjust the prompt and re-run.

---

## Pending phases (after Process 1 validation)

- **Phase 2:** Process 2 — Contacts enrichment (Apollo Find People + email cascade)
- **Phase 2:** Output to Google Sheets buffer (`companies-buffer`, `contacts-buffer`)
- **Phase 3:** Apps Script for upsert to Supabase
- **Phase 4:** SmartScout integration (replaces manual push from step 1b)
- **Phase 4:** Webhook Airtable → trigger Clay instead of polling

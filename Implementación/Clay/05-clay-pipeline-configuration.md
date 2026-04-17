# Clay Pipeline Configuration — Companies + Contacts (Process 1 + Process 2)

> **Purpose:** Step-by-step configuration recipe for the complete Clay pipeline. Anyone (including a future Claude Code session or a teammate) can use this document to **rebuild** or **replicate** the entire pipeline from scratch.

> **Scope:** Both Process 1 (companies enrichment) and Process 2 (contacts enrichment), end-to-end, configured in this session on 2026-04-08 / 2026-04-09.

> **Status:** Both processes validated end-to-end with 5 test companies → 5 enriched contacts. All emails 100% valid via ZeroBounce.

---

## 0. Architecture overview

```
Airtable (companies table)
   ↓ daily sync
┌─────────────────────────────────────────────────────┐
│  Workspace: All Files                               │
│  Workbook: Laneta Prospecting                       │
│                                                      │
│  ┌─────────────────────────────────────┐            │
│  │ Tabla 1: companies (Process 1)      │            │
│  │ • Source: Airtable                  │            │
│  │ • 7 enrichment columns              │            │
│  │ • Output: Sheets companies-buffer   │            │
│  └─────────────────────────────────────┘            │
│                ↓ Find people                         │
│  ┌─────────────────────────────────────┐            │
│  │ Tabla 2: Marketing Leadership US MX │            │
│  │ • Source: downstream from companies │            │
│  │ • 4 enrichment columns              │            │
│  │ • Output: Sheets contacts-buffer    │            │
│  └─────────────────────────────────────┘            │
└─────────────────────────────────────────────────────┘
   ↓
Google Sheets: "Laneta CRM - Clay Buffer"
├── companies-buffer (5 rows, 45+ columns)
└── contacts-buffer (5 rows, 31+ columns)
```

---

## 1. Workspace and workbook setup

### 1.1 Workspace level

- **Workspace name:** All Files (default Clay folder)
- **Account:** Jorge de los Santos / La Neta

### 1.2 Workbook

- **Name:** `Laneta Prospecting`
- **Path:** All Files / Laneta Prospecting
- **Contains:** 2 tables connected via downstream flow

### 1.3 Integrations authorized in this workbook

| Integration | Used by | Notes |
|---|---|---|
| Airtable | Source for Tabla 1 | Base `appMuVbSxyIyvudhi` table `tbljOLeUz5jh3nHz6` |
| Google Sheets | Output for both tables | Sheet "Laneta CRM - Clay Buffer" |
| Apollo | Enrichment columns in both tables | Native Clay |
| ZeroBounce | Email validation in Tabla 2 | Native Clay enrichment |

---

## 2. Tabla 1: companies (Process 1)

### 2.1 Source configuration

| Setting | Value |
|---|---|
| **Source type** | Airtable |
| **Base** | `appMuVbSxyIyvudhi` |
| **Table** | `companies` (`tbljOLeUz5jh3nHz6`) |
| **View** | Grid view (no filtered view yet) |
| **Sync frequency** | Daily |
| **Initial rows** | 5 (test companies) |

### 2.2 Columns inherited from Airtable source

| Column | Type | Notes |
|---|---|---|
| `company_name` | text | Primary field |
| `website` | url | |
| `industry` | text | (empty initially) |
| `country` | text | |
| `supabase_id` | text | (empty in test) |
| `status` | singleSelect | |
| `synced_at` | datetime | Auto-managed |

### 2.3 Enrichment columns added (in order)

#### Column 1 — Apollo: Enrich Company

| Setting | Value |
|---|---|
| **Enrichment** | "Enrich Company" |
| **Provider** | Apollo |
| **Input** | `website` (or `Domain` if you prefer extracted) |
| **Cost** | ~0.8 credits per row |

**Sub-fields toggled ON in "Add more data" panel:**
- Name
- Website (creates `Website (2)` to avoid conflict with source)
- Domain
- Country (creates `Country (2)`)
- Founded
- Locality (city + state combined, e.g., "Austin, Texas")
- Logo Url
- Size (text bucket like "51-200 employees")
- Employee Count (numeric)
- Industry
- Description
- Url (Apollo's LinkedIn URL)
- Type (e.g., "Privately Held")

**NOT toggled (skip for now):**
- Locations.Phone Numbers (would give phone but nested deeper)
- Slug
- Org Id
- Company ID

#### Column 2 — Company Revenue (waterfall)

| Setting | Value |
|---|---|
| **Enrichment** | "Company Revenue" |
| **Type** | Waterfall (stops at first hit) |
| **Input** | `Domain` |

**Provider order (drag-and-drop in this exact sequence):**

| # | Provider | Cost | Notes |
|---|---|---|---|
| 1 | Clearbit | 3 cr | Best D2C coverage |
| 2 | HG Insights | 2 cr | Cheap fallback |
| 3 | SMARTe | 6 cr | Mid-tier |
| 4 | Crunchbase | 15 cr | Premium fallback |
| 5 | CB Insights | toggle OFF | Redundant with Crunchbase, skip |

**Estimated cost for 5 rows:** 15-30 credits depending on cascade depth.

#### Column 3 — Find Company Social Profiles (with TikTok custom prompt)

| Setting | Value |
|---|---|
| **Enrichment** | "Find Company Social Profiles" |
| **Type** | AI-powered web search |
| **Model requirement** | Web browsing enabled (Perplexity recommended) |
| **Input** | `Domain` |
| **Cost** | ~3 credits per row |

**Custom prompt** (replaces Clay default to add TikTok — see `02-prompt-find-company-social-profiles.md` for full text and rationale):

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

**Output sub-columns auto-created by Clay:**
- `Instagram Url`
- `Tiktok Url`
- `Youtube Url`
- `Linkedin Url`
- `X Url`
- `Confidence` (high/medium/low)
- `Reasoning` (explanation, useful for debug)
- `Steps Taken` (URLs the model visited)

#### Column 4 — Email Cascade at company level (SKIPPED)

**Decision: skip in Process 1.** All Clay email enrichments are person-level (require first_name + last_name + domain). T04-A1 ICP scoring doesn't use email as criterion. Deferred to Process 2.

#### Column 5 — AI: Category (10-bucket macro + subcategory + confidence)

| Setting | Value |
|---|---|
| **Enrichment** | "Use AI" / "AI column" |
| **Model** | GPT-4o mini or Claude Haiku 4.5 |
| **Output format** | JSON (Clay auto-splits into sub-columns) |
| **Cost** | ~0.1-0.3 credits per row |

**Variable mapping (mark Industry, Description, Website as OPTIONAL):**

| Variable | Clay column |
|---|---|
| `{{company_name}}` | `Name` (from Apollo) — Required |
| `{{industry}}` | `Industry` — Optional |
| `{{description}}` | `Description` — Optional |
| `{{website}}` | `Website (2)` or `Domain` — Optional |

**Prompt** (full text in `03-prompt-ai-category.md`):

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
- "high"   → description clearly indicates the category
- "medium" → category is clear but subcategory is inferred
- "low"    → had to guess based on company name only

TIE-BREAKING RULES:
1. Pick the FLAGSHIP/dominant product line.
2. Skincare brands that also sell makeup → "Beauty & Personal Care".
3. Multivitamin brands → "Health & Wellness", subcategory "Vitamin Supplements".
4. Pet food brands → "Pet", subcategory "Pet Food".
5. Marketplaces, manufacturers, or B2B services → "Other".
6. NEVER return null, empty, or "Not Found". If you cannot determine,
   return: {"category": "Other", "subcategory": "Unknown", "confidence": "low"}

INPUT DATA:
- Company name: {{company_name}}
- Industry (Apollo): {{industry}}
- Description: {{description}}
- Website: {{website}}

OUTPUT:
```

**Output sub-columns:** `Category`, `Subcategory`, `Confidence` (Clay auto-splits the JSON).

#### Column 6 — AI: Classification (DEFERRED)

**Decision: skip.** For 5 test companies all would classify as "brand" (zero variance). T04-A1 ICP scoring doesn't use this. Deferred until SmartScout brings diverse leads.

#### Column 7 — AI: ICP Score (T04-A1 6-criterion rubric)

| Setting | Value |
|---|---|
| **Enrichment** | "Use AI" / "AI column" |
| **Model** | Claude Sonnet 4.6 or GPT-4o (NOT mini — reasoning required) |
| **Output format** | JSON (Clay auto-splits) |
| **Cost** | ~0.3-0.5 credits per row |
| **Threshold** | `icp_score >= 70` → `passes_filter = true` |

**Variable mapping (ALL inputs Optional except company_name and website):**

| Variable | Clay column | Required? |
|---|---|---|
| `{{company_name}}` | `Name` | ✅ |
| `{{website}}` | `Website (2)` or `Domain` | ✅ |
| `{{industry}}` | `Industry` (Apollo) | ⬜ |
| `{{description}}` | `Description` (Apollo) | ⬜ |
| `{{country}}` | `Country (2)` | ⬜ |
| `{{city}}` | `Locality` (Apollo) | ⬜ |
| `{{employees_count}}` | `Employee Count` (Apollo) | ⬜ |
| `{{estimated_revenue}}` | output of Company Revenue cascade | ⬜ |
| `{{category}}` | `Category` (from AI category JSON split) | ⬜ |
| `{{subcategory}}` | `Subcategory` (from AI category JSON split) | ⬜ |
| `{{instagram_url}}` | `Instagram Url` (Find Social Profiles) | ⬜ |
| `{{tiktok_url}}` | `Tiktok Url` | ⬜ |
| `{{youtube_url}}` | `Youtube Url` | ⬜ |
| `{{linkedin_url}}` | `Linkedin Url` | ⬜ |

**Prompt** (full text in `04-prompt-ai-icp-score.md`):

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

**Output sub-columns:** `icp_score`, `icp_reason`, `passes_filter`, `criteria_breakdown` (Clay auto-splits).

#### Column 8 — Add Row to Google Sheets (companies-buffer)

| Setting | Value |
|---|---|
| **Action** | "Add Row to Google Sheets" (Clay native) |
| **Spreadsheet** | "Laneta CRM - Clay Buffer" |
| **Tab** | `companies-buffer` |
| **Mode** | Append (preserves history) |
| **Columns to send** | ALL Clay columns (select all) |
| **Cost** | 0 credits |

### 2.4 Process 1 cost summary (per 5 rows)

| Step | Cost |
|---|---|
| Apollo Enrich Company | ~4 cr |
| Company Revenue waterfall | ~15-30 cr |
| Find Company Social Profiles | ~15 cr |
| AI Category | ~1 cr |
| AI ICP Score | ~2 cr |
| Sheets export | 0 |
| **Total** | **~37-52 cr** |

### 2.5 Process 1 test results (5 companies)

| Company | Subcategory | Category Confidence | ICP Score | Passes |
|---|---|---|---|---|
| Good Molecules | Facial Serums | high | 60 | ❌ |
| Mad Hippie | Skincare | high | 100 | ✅ |
| Black Girl Sunscreen | Sunscreen | high | 100 | ✅ |
| ArtNaturals | Vitamin C Serum | high | 100 | ✅ |
| MakarttPro | Poly Gel Kits | high | 67 | ❌ |

---

## 3. Tabla 2: Marketing Leadership US Mexico (Process 2)

### 3.1 Source configuration

| Setting | Value |
|---|---|
| **Source type** | Downstream from another Clay table |
| **Source table** | `companies` (Tabla 1 in same workbook) |
| **Created via** | Right-click on Tabla 1 → "Find people at these companies" template |
| **Filter on source** | NONE (decision: keep all 5 rows for data reuse value) |

### 3.2 Find People at Company configuration

This is the core enrichment of Process 2. It "explodes" each company row into 1 row per person found.

| Setting | Value |
|---|---|
| **Enrichment** | "Find People at Company" (Apollo) |
| **Identifier** | Domain (set in Companies > Show details) |

**Job title filters (10 titles, mode "is similar to" — fuzzy matching):**

```
CMO
Chief Marketing Officer
VP Marketing
VP of Marketing
Head of E-commerce
Head of Marketing
Head of Content
Brand Manager
Marketing Director
Director of Marketing
```

**Location filters (Countries to include):**
- United States
- Mexico
- (LATAM countries can be added: Argentina, Brazil, Chile, Colombia, Peru, etc.)

**Limit results:**
- **Max per company:** 3
- (Total table row limit: default 50,000)

**Other sections:**
- Experience: not configured
- Professional bio: not configured
- Network & reach: not configured
- Languages: not configured
- Education: not configured
- Exclude people: empty
- Past experiences: empty

**Sculptor AI helped configure these filters.** Prompt used in the Sculptor chat panel:

```
Find marketing decision makers at the qualified companies in my source table.

Job titles to include (any of these): CMO, Chief Marketing Officer, VP Marketing,
VP of Marketing, Head of E-commerce, Head of Marketing, Head of Content,
Brand Manager, Marketing Director, Director of Marketing.

Limit: 3 people per company.

Location: US, Mexico, or LATAM countries.

Use the company Domain as the identifier.
```

### 3.3 Enrichment columns added (in order)

#### Column A — Enrich person (auto-added during Create table)

| Setting | Value |
|---|---|
| **Enrichment** | "Enrich person" |
| **Provider** | Apollo |
| **Cost** | 0.5 credits per row |
| **Output** | Phone, seniority, refined location, department, years of experience, etc. |

#### Column B — Work Email (waterfall, auto-added during Create table)

| Setting | Value |
|---|---|
| **Enrichment** | "Work Email" |
| **Type** | Waterfall (built-in, +6 providers) |
| **Cost** | 0.7 credits per row (average — varies by cascade depth) |

This is Clay's pre-built email cascade — equivalent to manually configuring Icypeas → Enrow → LeadMagic → Hunter → Findymail → Prospeo, but as a single enrichment.

#### Column C — Validate Email (ZeroBounce)

| Setting | Value |
|---|---|
| **Enrichment** | "Validate Email" by ZeroBounce |
| **Input** | The email column from Work Email waterfall |
| **Cost** | 0.1 credits per row |

**Output statuses:**
- `valid` → email exists and accepts mail
- `catch-all` → domain accepts everything (cannot verify per-person)
- `invalid` → bounces
- `unknown` → timeout
- `abuse` → reported as spam
- `disposable` → temporary inbox

#### Column D — Add Row to Google Sheets (contacts-buffer)

| Setting | Value |
|---|---|
| **Action** | "Add Row to Google Sheets" |
| **Spreadsheet** | "Laneta CRM - Clay Buffer" (same as Process 1) |
| **Tab** | `contacts-buffer` (NEW tab — create when prompted) |
| **Mode** | Append |
| **Columns to send** | ALL Clay columns |
| **Cost** | 0 credits |

### 3.4 Process 2 cost summary (per 5 rows)

| Step | Cost |
|---|---|
| Find People at Company (Apollo) | ~5 cr |
| Enrich person | ~2.5 cr |
| Work Email waterfall | ~3.5 cr |
| ZeroBounce validation | ~0.5 cr |
| Sheets export | 0 |
| **Total** | **~11.5 cr** |

### 3.5 Process 2 test results (5 contacts)

| # | Person | Company | Job Title | Email | ZeroBounce |
|---|---|---|---|---|---|
| 1 | Kimberly Nieves | Black Girl Sunscreen | Director of Marketing | kimberly@blackgirlsunscreen... | ✅ valid |
| 2 | Candace Bullock | Black Girl Sunscreen | Senior Marketing Manager | candace@blackgirlsunscreen... | ✅ valid |
| 3 | Jazmine Nash | Black Girl Sunscreen | Brand Manager | jazmine@blackgirlsunscreen... | ✅ valid |
| 4 | Elijah Hoffman | Mad Hippie | VP of Marketing | elijah@madhippie.com | ✅ valid |
| 5 | Hannah Halliwell | MakarttPro | Senior E-commerce Manager | hannah.halliwell@makartt.com | ✅ valid |

**Metrics:**
- 5/5 emails found (100% Work Email cascade hit rate)
- 5/5 emails validated (100% ZeroBounce valid)
- 0 catch-all, 0 invalid, 0 disposable
- ArtNaturals returned 0 contacts (Apollo gap, not a config issue)

---

## 4. Output destinations

### 4.1 Google Sheets

| Sheet | Tab | Rows | Columns | Status |
|---|---|---|---|---|
| Laneta CRM - Clay Buffer | `companies-buffer` | 5 | 45+ | ✅ Active |
| Laneta CRM - Clay Buffer | `contacts-buffer` | 5 | 31+ | ✅ Active |

Both tabs use **append mode** — preserves history of every Clay run.

### 4.2 Future destinations (not yet configured)

| Destination | Purpose | Status |
|---|---|---|
| Apps Script → Supabase `client_inventory` | Final destination for companies | ⏳ Pending |
| Apps Script → Supabase `client_contacts` | Final destination for contacts | ⏳ Pending |
| Airtable companies (write-back) | Update source table with enrichments | ⏳ Optional |
| HubSpot / outreach tool | Direct push to CRM/outreach | ⏳ Decision pending |

---

## 5. Total cost summary (full pipeline, 5 test rows)

| Process | Cost |
|---|---|
| Process 1 (companies enrichment) | ~37-52 cr |
| Process 2 (contacts enrichment) | ~11.5 cr |
| **Total per 5 rows** | **~50-65 cr** |
| **Per row average** | **~10-13 cr** |

### Projected costs at scale

| Volume | Estimated cost |
|---|---|
| 50 companies → ~150-250 contacts | ~500-650 cr |
| 100 companies → ~300-500 contacts | ~1000-1300 cr |
| 500 companies → ~1500-2500 contacts | ~5000-6500 cr |

---

## 6. Replication checklist

If you need to rebuild this pipeline from scratch:

### Workbook setup
- [ ] Create workbook `Laneta Prospecting`
- [ ] Authorize Airtable, Google Sheets, Apollo, ZeroBounce integrations

### Tabla 1: companies
- [ ] Add Airtable source pointing to base `appMuVbSxyIyvudhi` table `tbljOLeUz5jh3nHz6`
- [ ] Add column 1: Apollo Enrich Company (input: website)
- [ ] Toggle ON sub-fields: Name, Domain, Country, Locality, Employee Count, Industry, Description, Url, Type, Founded, Logo Url, Size
- [ ] Add column 2: Company Revenue waterfall (Clearbit → HG → SMARTe → Crunchbase, skip CB Insights)
- [ ] Add column 3: Find Company Social Profiles with custom TikTok prompt (model: Perplexity)
- [ ] Add column 4: AI Category with prompt from `03-prompt-ai-category.md` (mark inputs Optional)
- [ ] Add column 5: AI ICP Score with prompt from `04-prompt-ai-icp-score.md` (mark inputs Optional)
- [ ] Add column 6: Add Row to Google Sheets → tab `companies-buffer`, append, all columns

### Tabla 2: Marketing Leadership US Mexico
- [ ] Right-click on Tabla 1 in canvas → "Find people at these companies"
- [ ] In Companies section, set identifier to Domain via Show details
- [ ] In Job Title section, add 10 marketing decision-maker titles (mode: is similar to)
- [ ] In Location section, set countries: United States, Mexico, (LATAM)
- [ ] In Limit results section, set Max per company = 3
- [ ] (Optional) Add row filter `passes_filter = true` if you want to skip rejected companies
- [ ] On Create table, check ✅ Work Email and ✅ Enrich person
- [ ] Add column: Validate Email (ZeroBounce)
- [ ] Add column: Add Row to Google Sheets → tab `contacts-buffer`, append, all columns

### Validation
- [ ] Run Process 1 on test data, verify 5 rows with valid scores in companies-buffer
- [ ] Run Process 2, verify 5 rows in contacts-buffer with valid emails
- [ ] Confirm ZeroBounce status = valid for all rows

---

## 7. Related documents

| File | Purpose |
|---|---|
| `CLAUDE.md` | Comprehensive context for AI agents |
| `01-airtable-companies-setup.md` | Airtable schema setup history |
| `02-prompt-find-company-social-profiles.md` | Full TikTok prompt with rationale |
| `03-prompt-ai-category.md` | Full category prompt with rationale |
| `04-prompt-ai-icp-score.md` | Full ICP score prompt with rationale |
| `05-clay-pipeline-configuration.md` | THIS FILE — replication recipe |

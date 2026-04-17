# Prompt — AI ICP Score (T04-A1)

> **Where it's used:** Clay AI column in Process 1 (companies enrichment), step 7 of 8. Computes the final ICP score (0–100) that decides whether a company moves to Process 2 (contacts enrichment) or gets rejected.

> **Why this matters:** This is the **most important AI column** in the whole pipeline. Every column before this one (Apollo, Company Revenue, Find Company Social Profiles, AI category) exists to feed this prompt. The output `icp_score >= 70` is the **filter that triggers Process 2**, so it directly controls Clay credit spend at scale.

---

## Source of truth

The 6 scoring criteria are derived from `tracker/public/templates/T04-A1-criterios-icp-b2b.csv`, which the user confirmed as the ideal ICP definition:

- **Industries:** Health & Wellness, Beauty, CPG, E-commerce
- **Company size:** 10–500 employees
- **Geo:** US, Mexico, LATAM
- **Exclusions:** pharma, tobacco, gambling, crypto
- **Deal size:** $2k–$12k USD
- **Categories:** Skincare, Supplements, Home, Pet
- **Marketplace signal:** Amazon brands with video gap (TBD SmartScout phase)

---

## Context

**Pipeline position:** Process 1, after all data enrichment columns are populated.

**Output:** JSON with `icp_score` (0–100), `icp_reason` (sentence), `passes_filter` (boolean true if score ≥ 70).

**Filter threshold:** `icp_score >= 70` triggers Process 2. Below 70 → row marked `rejected`, no Process 2.

**Cost:** ~0.3–0.5 credits per row (longer prompt, JSON output). 5 test rows ≈ 2–3 credits.

**Recommended model:** Claude Sonnet 4.6 or GPT-4o (NOT mini). The scoring requires reasoning across 6 weighted criteria — a stronger model is worth the extra cost here.

---

## Scoring rubric (100 points total)

| # | Criterion | Weight | Notes |
|---|---|---|---|
| 1 | INDUSTRY fit | 25 pts | Beauty / Health & Wellness / CPG / E-commerce = full. Exclusion list = 0. |
| 2 | COMPANY SIZE | 20 pts | 10–500 employees = full. Outside = partial or 0. |
| 3 | GEOGRAPHY | 15 pts | US / Mexico / LATAM = full. Other = 0. |
| 4 | CATEGORY FIT | 15 pts | Skincare / Supplements / Home / Pet = full. Adjacent = half. |
| 5 | REVENUE SIGNAL | 15 pts | $500K–$50M = full. <$100K or >$100M = 0. |
| 6 | DIGITAL PRESENCE | 10 pts | Active IG / TikTok / YouTube = full. Only website = half. |

**Threshold:** ≥ 70 = qualified, < 70 = rejected.

---

## The prompt (full text — copy-paste into Clay)

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
   - Award 20 if employees_count is between 10 and 500 (sweet spot)
   - Award 10 if 5-9 or 501-1000
   - Award 5 if 1-4 or 1001-2000
   - Award 0 if >2000 or 0
   - Award 8 if employees data is missing (neutral default)

3. GEOGRAPHY (15 pts)
   - Award 15 if HQ country is: US, USA, United States, Mexico, MX, or any LATAM country
     (Argentina, Brazil, Chile, Colombia, Peru, etc.)
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
   - Award 7 if revenue data is missing (neutral default)

6. DIGITAL PRESENCE (10 pts)
   - Award 10 if at least 2 of these are present and non-empty:
     instagram_url, tiktok_url, youtube_url
   - Award 5 if exactly 1 of the above
   - Award 0 if none
   - Bonus: do NOT count linkedin or facebook (B2B/legacy, not video-first)

FALLBACK RULES:
- NEVER return null, empty, "Not Found", or omit any field
- If data is sparse, use the missing-data defaults above and reflect that
  uncertainty in the icp_reason ("limited data, neutral score for X")
- The icp_score is the SUM of the 6 criteria_breakdown values — they MUST add up

ICP REASON RULES:
- One sentence, max 25 words
- Mention the strongest signal (positive or negative)
- Examples:
  * "Strong fit: US D2C beauty brand with 51-200 employees and active social presence on Instagram and TikTok."
  * "Marginal fit: small skincare brand in correct geo but very low employee count and weak revenue signal."
  * "Rejected: pharma industry is in exclusion list, automatic disqualification."

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

---

## Variable mapping (Clay column → prompt variable)

When pasting into Clay, all of these inputs should be marked as **OPTIONAL** (Apollo and Company Revenue can have gaps for any row):

| Prompt variable | Clay column | Required? |
|---|---|---|
| `{{company_name}}` | `Name` (Apollo) or `company_name` (Airtable source) | ✅ Required |
| `{{website}}` | `Website (2)` or `Domain` | ✅ Required |
| `{{industry}}` | `Industry` (Apollo) | ⬜ Optional |
| `{{description}}` | `Description` (Apollo) | ⬜ Optional |
| `{{country}}` | `Country (2)` or `country` (Airtable) | ⬜ Optional |
| `{{city}}` | `Locality` (Apollo) | ⬜ Optional |
| `{{employees_count}}` | `Employee Count` (Apollo) | ⬜ Optional |
| `{{estimated_revenue}}` | output of Company Revenue cascade | ⬜ Optional |
| `{{category}}` | `Category` (from AI category column) | ⬜ Optional |
| `{{subcategory}}` | `Subcategory` (from AI category column) | ⬜ Optional |
| `{{instagram_url}}` | `Instagram Url` (Find Social Profiles) | ⬜ Optional |
| `{{tiktok_url}}` | `Tiktok Url` (Find Social Profiles) | ⬜ Optional |
| `{{youtube_url}}` | `Youtube Url` (Find Social Profiles) | ⬜ Optional |
| `{{linkedin_url}}` | `Linkedin Url` (Find Social Profiles) | ⬜ Optional |

---

## Output → Airtable mapping

The Clay AI column returns a JSON. Clay will likely auto-split it into separate columns (as it did for the category prompt). The mapping is:

| JSON field | Clay column | Airtable field | Field type |
|---|---|---|---|
| `icp_score` | `icp_score_value` | `icp_score` | number (integer 0-100) |
| `icp_reason` | `icp_reason_text` | `icp_reason` | multilineText |
| `passes_filter` | `icp_passes` | (used for status update) | boolean → triggers status |
| `criteria_breakdown` | (kept as JSON for debug) | (optional: store in `qualification_criteria` JSONB on Supabase later) | — |

The `passes_filter` boolean drives the `status` update in the write-back step:
- `passes_filter: true` → Airtable `status` = `qualified`
- `passes_filter: false` → Airtable `status` = `rejected`

---

## Validation expectations (5-company test)

All 5 are US D2C beauty brands matching T04-A1 ICP criteria. Expected scores:

| Company | Expected score | Why |
|---|---|---|
| Mad Hippie | 85–95 | All criteria green: 51-200 employees, US, Skincare, strong social, decent revenue |
| Black Girl Sunscreen | 85–95 | Same plus brand awareness (PR, funding) |
| ArtNaturals | 80–90 | 51-200 employees, US, Skincare, good social presence |
| MakarttPro | 70–85 | 11-50 employees, US, Beauty (nail care), social presence |
| Good Molecules | 60–80 | Apollo data was weak (employees=1, missing description). Will use neutral defaults → ~70 |

**Expected outcome:** at least 4/5 should pass the `>= 70` threshold and trigger Process 2. Good Molecules is the watch case — it might land at 65–75 depending on how the fallbacks add up.

If everything is below 70, the prompt is too strict — need to recalibrate weights.
If everything is above 90, the prompt is too lenient — need stricter exclusions.

---

## Known failure modes

1. **AI returns prose around the JSON.** Mitigation: prompt explicitly says "JSON only, no prose, no markdown code block". If still fails, switch model.
2. **Score doesn't match the breakdown sum.** The model adds the 6 criteria to a different total than `icp_score`. Mitigation: the rule "icp_score is the SUM" is explicit; if it persists, add a Clay formula column that re-computes the sum and overrides.
3. **All scores cluster at 75–80.** AI is being uniform/safe. Mitigation: lower the missing-data defaults to push uncertain rows down.
4. **Good Molecules scores high despite missing data.** That's actually OK — it means the model is leaning on `category=Beauty & Personal Care` and `country=US` which are strong signals. Confidence is implicit in the sparse `criteria_breakdown` values.

---

## Tuning guide

If after the test the scores don't feel right, here's where to adjust:

| Symptom | Knob to turn |
|---|---|
| Too many qualify | Lower the "missing data" defaults (5/8/7 → 0/0/0) |
| Too few qualify | Raise the threshold below 70 (try 65) instead of changing the prompt |
| Wrong industry rejections | Add more synonyms to the INDUSTRY criterion list |
| Geo bias | Expand LATAM list or add specific countries |
| Revenue too punishing | Widen the sweet spot range (e.g., $250K–$100M instead of $500K–$50M) |

---

## Why no `classification` input

The prompt does NOT use `classification` (brand/private_label/manufacturer) because that AI column was deferred to post-SmartScout phase. When SmartScout adds the column, you can add this 7th criterion:

```
7. BUSINESS MODEL (10 pts) — extra
   - Award 10 if classification = "brand"
   - Award 5 if "private_label"
   - Award 0 if "manufacturer", "reseller", or "other"
```

And re-balance the other criteria to total 100. For now, the 6-criterion version is sufficient for the test.

---

## Status

| Item | Status |
|---|---|
| Prompt drafted | ✅ |
| Variable mapping documented | ✅ |
| Pasted into Clay AI column | ⏳ User action |
| Variables marked optional (except company_name and website) | ⏳ |
| Run on 5 test rows | ⏳ |
| Score distribution validated (4/5 ≥ 70) | ⏳ |
| Write-back to Airtable (icp_score, icp_reason, status) | ⏳ Phase: write-back |

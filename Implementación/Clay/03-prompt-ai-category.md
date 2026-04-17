# Prompt — AI Category & Subcategory Classification

> **Where it's used:** Clay AI column in Process 1 (companies enrichment), step 5 of 8. Classifies a company into a 2-level taxonomy: macro `category` + specific `subcategory` + `confidence` rating.

> **Why this design:** A single flat category list either becomes too narrow (only beauty) or too long (50+ values, hard to maintain). A 2-level taxonomy gives clean filtering by macro category AND fine-grained analytics by subcategory niche, while keeping the ICP scoring logic simple (it only evaluates the macro level).

---

## Context

**Pipeline position:** Process 1, after Apollo Enrich Company, Company Revenue cascade, and Find Company Social Profiles.

**Why AI for this:** Apollo returns an `industry` like "Personal Care Product Manufacturing" which is too generic for ICP scoring. We need to classify into business-relevant buckets that align with T04-A1 ICP definition.

**Cost:** ~0.1–0.3 credits per row depending on the model. For 5 test rows: < 2 credits total.

**Recommended model:** GPT-4o mini or Claude Haiku 4.5. This is a deterministic classification with clear rules — no need for the most expensive model.

---

## The 10 macro categories

| # | Category | Covers (subcategory examples) |
|---|---|---|
| 1 | **Beauty & Personal Care** | Skincare, Makeup, Hair Care, Fragrance, Nail Care, Men's Grooming, Oral Care |
| 2 | **Health & Wellness** | Vitamin Supplements, Sports Nutrition, Sleep Aids, Sexual Wellness, OTC |
| 3 | **Home & Living** | Home Decor, Kitchen, Cleaning Products, Organization, Furniture |
| 4 | **Pet** | Pet Food, Pet Care, Pet Accessories, Vet Products |
| 5 | **Food & Beverage** | Snacks, Beverages, Specialty Food, Coffee, Tea, Alcohol |
| 6 | **Apparel & Accessories** | Clothing, Footwear, Jewelry, Bags, Watches, Eyewear |
| 7 | **Sports & Outdoors** | Fitness Equipment, Outdoor Gear, Athleisure |
| 8 | **Baby & Kids** | Baby Care, Toys, Kids Apparel, Maternity |
| 9 | **Electronics & Tech** | Consumer Electronics, Smart Home, Wearables, Gadgets, Gaming |
| 10 | **Other** | B2B, services, industrial, anything that doesn't fit |

### Coverage vs T04-A1 ICP

| T04-A1 ideal category | Maps to macro |
|---|---|
| Skincare | Beauty & Personal Care |
| Supplements | Health & Wellness |
| Home | Home & Living |
| Pet | Pet |

The first 4 macro categories are the **core ICP fit**. The other 6 can still score well if they have strong video gap signal (e.g., a DTC athleisure brand without product videos on Amazon).

---

## The prompt (full text — copy-paste into Clay)

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
7. Sports & Outdoors         → fitness equipment, outdoor gear, athleisure, sports nutrition (if performance-focused)
8. Baby & Kids               → baby care, toys, kids apparel, maternity
9. Electronics & Tech        → consumer electronics, smart home, wearables, gadgets, gaming
10. Other                    → B2B, services, industrial, or anything that doesn't fit cleanly

SUBCATEGORY RULES:
- 1 to 3 words maximum
- Be specific: "Sunscreen" not "Skincare"; "Pet Food" not "Pet"
- Use Title Case
- Examples: "Sunscreen", "Vitamin Supplements", "Smart Watches", "Athleisure", "Coffee Beans"

CONFIDENCE RULES:
- "high"   → description clearly indicates the category and a specific product line
- "medium" → category is clear but subcategory is inferred from limited data
- "low"    → had to guess based on company name only

TIE-BREAKING RULES:
1. If a company sells multiple products, pick the category of its FLAGSHIP/dominant line based on the description.
2. Skincare brands that also sell makeup → "Beauty & Personal Care", subcategory based on flagship.
3. Multivitamin brands → "Health & Wellness", subcategory "Vitamin Supplements".
4. Pet food brands → "Pet", subcategory "Pet Food".
5. If the company is a marketplace, manufacturer, or B2B service → "Other".
6. NEVER return null, empty, or "Not Found" for category. If you cannot
   determine the category from the available data, return:
   {"category": "Other", "subcategory": "Unknown", "confidence": "low"}
   This signals downstream that the row needs manual review or re-enrichment.

INPUT DATA:
- Company name: {{company_name}}
- Industry (Apollo): {{industry}}
- Description: {{description}}
- Website: {{website}}

OUTPUT:
```

---

## Variable mapping (when pasting into Clay)

| Prompt variable | Clay column |
|---|---|
| `{{company_name}}` | `Name` (from Apollo Enrich Company) |
| `{{industry}}` | `Industry` (from Apollo) |
| `{{description}}` | `Description` (from Apollo) |
| `{{website}}` | `Website (2)` or `Domain` |

---

## Output → Airtable mapping

The Clay AI column returns a JSON object. We need to parse it and write 3 separate Clay columns that then map to 3 Airtable fields:

| JSON path | Clay column to add | Airtable field | Field type |
|---|---|---|---|
| `category` | `category_macro` | `category` | singleLineText |
| `subcategory` | `category_subniche` | `subcategory` | singleLineText (NEW) |
| `confidence` | `category_confidence_value` | `category_confidence` | singleSelect: high/medium/low (NEW) |

### How to extract the JSON fields in Clay

After the AI column runs, add 3 **Formula columns** to extract each field:

| Column name | Formula |
|---|---|
| `category_macro` | `JSON.parse({{ai_category_output}}).category` |
| `category_subniche` | `JSON.parse({{ai_category_output}}).subcategory` |
| `category_confidence_value` | `JSON.parse({{ai_category_output}}).confidence` |

(Or use Clay's native "Extract from JSON" / "Parse JSON" enrichment if available.)

---

## Validation expectations (5-company test)

| Company | Expected category | Expected subcategory | Expected confidence |
|---|---|---|---|
| Good Molecules | Beauty & Personal Care | Skincare | high |
| Mad Hippie | Beauty & Personal Care | Skincare | high |
| Black Girl Sunscreen | Beauty & Personal Care | Sunscreen | high |
| ArtNaturals | Beauty & Personal Care | Skincare | high |
| MakarttPro | Beauty & Personal Care | Nail Care | high or medium |

All 5 should land in the same macro bucket (`Beauty & Personal Care`) but with **distinct subcategories**, which is exactly the granularity needed for downstream analytics.

If MakarttPro lands as `Other` or with `low` confidence, the description from Apollo wasn't enough — that's a data quality issue, not a prompt issue.

---

## Known failure modes

1. **AI returns prose around the JSON** — happens with weaker models. Symptom: `Here's the JSON: { ... }`. Mitigation: add an explicit "Output JSON only, no prose, no markdown code block" at the end of the prompt.
2. **JSON parsing fails on Clay side** — happens if the AI uses single quotes instead of double. Mitigation: use Claude or GPT-4o which are reliable with JSON; avoid Llama/Mixtral for this column.
3. **Wrong macro category for cross-category brands** — e.g., a brand that sells both supplements AND skincare. The tie-breaking rules handle this but may pick the "wrong" flagship. Mitigation: review `confidence: medium` rows manually.
4. **Subcategory too generic** — e.g., returns "Skincare" instead of "Sunscreen". This happens when description is vague. Acceptable for now; can be refined later by giving more input data (website scrape, product titles).

## Why no "Not Found" fallback (design note)

Unlike `Find Company Social Profiles` (where a brand may legitimately not have a TikTok), every company has SOME category — there is no such thing as a company that sells nothing. Returning "Not Found" would conflate two different situations:

- **Insufficient input data** (Apollo description was empty) → re-enrich
- **Genuinely cross-category or ambiguous** (e.g., a holding company) → manual review

The 2-axis system `category × confidence` handles both more cleanly:

| State | Meaning | Action |
|---|---|---|
| `category: Beauty & Personal Care, confidence: high` | Clear classification | Use as-is |
| `category: Beauty & Personal Care, confidence: medium` | Macro is right, niche guessed | Use, audit periodically |
| `category: Other, confidence: low` | Could not determine | Re-enrich (scrape website) or manual review |

Tie-breaking rule #6 enforces this: the model is forbidden from returning null/empty/"Not Found" and must always fall back to `Other` + `Unknown` + `low`.

This same pattern applies to the next two AI columns (`classification`, `icp_score`) — none of them should ever return "Not Found":

| Prompt | Fallback strategy |
|---|---|
| `category` | `Other` + `Unknown` + `low` confidence |
| `classification` | `brand` (default) + low confidence flag |
| `icp_score` | Low score (~20-30) with reason explaining lack of data |

---

## Maintenance notes

- **Adding a new macro category:** if a new business line appears (e.g., "Cannabis & CBD"), add it as #11 and update the ICP scoring rules in `01-airtable-companies-setup.md` to know how to weight it.
- **Refining subcategories:** instead of editing the prompt, consider running a clustering job over the `subcategory` column quarterly to find emerging niches.
- **Source of truth:** this file. The prompt in Clay is a copy.

---

## Status

| Item | Status |
|---|---|
| Prompt drafted | ✅ |
| Airtable fields added: `subcategory`, `category_confidence` | ✅ |
| Pasted into Clay AI column | ⏳ User action |
| Variable mapping configured | ⏳ |
| Run on 5 test rows | ⏳ |
| JSON parse columns added | ⏳ |
| Write-back to Airtable | ⏳ Phase: write-back step |

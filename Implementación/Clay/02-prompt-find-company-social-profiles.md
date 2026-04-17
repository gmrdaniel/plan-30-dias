# Prompt — Find Company Social Profiles (with TikTok)

> **Where it's used:** Clay enrichment **`Find Company Social Profiles`** column in Process 1 (companies enrichment). Replaces the default Clay prompt to add TikTok coverage.

> **Why customize:** The default Clay prompt for `Find Company Social Profiles` only covers Instagram, LinkedIn, X (Twitter), and YouTube — it does NOT include TikTok. For Laneta's ICP (Beauty/CPG D2C brands), TikTok is a critical signal because most modern D2C brands have stronger TikTok presence than X/Twitter.

---

## Context

**Pipeline position:** Process 1, after Apollo Enrich Company and Domain extraction.

**Input column:** `Domain` (clean domain like `goodmolecules.com`, NOT the full URL).

**Output columns (5 expected):**
- `instagram_url`
- `tiktok_url` ← **added**
- `linkedin_url`
- `x_url` (Twitter)
- `youtube_url`

**Cost:** ~3 credits per row (depends on the AI model used internally by Clay).

**Model requirement:** ⚠️ The prompt instructs the AI to perform a **real-time web search**. The selected model in Clay must have web browsing enabled. Recommended models, in priority order:

1. **Perplexity** (best live search coverage)
2. **GPT-4o with browsing**
3. **Claude with web search**

If the model has no web access, it will hallucinate URLs that look plausible but don't exist.

---

## Mapping to Airtable fields

After running this enrichment, the output columns map to the Airtable `companies` table as follows:

| Clay output | Airtable field | Transformation |
|---|---|---|
| `instagram_url` | `instagram_handle` | Extract handle from URL: `instagram.com/example` → `example` |
| `tiktok_url` | `tiktok_handle` | Extract handle: `tiktok.com/@example` → `@example` (keep `@`) |
| `linkedin_url` | `linkedin_url` | Direct write (overrides Apollo's value if Apollo also returned it) |
| `x_url` | _no Airtable field_ | Skip — not used in ICP scoring |
| `youtube_url` | `youtube_url` | Direct write |

> **Decision:** X (Twitter) is collected but NOT written to Airtable in the current schema. If we ever decide to track it, add an `x_url` field to the Airtable table.

---

## The prompt (full text — copy-paste into Clay)

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

---

## Diff vs the original Clay default prompt

| Section | Change |
|---|---|
| `#OBJECTIVE#` | Added "TikTok" to the platform list |
| `#INSTRUCTIONS#` step 2 | Added `tiktok.com` to the platform enumeration |
| `#INSTRUCTIONS#` step 6 | **NEW** — explicit format rule for TikTok URLs (`@username` requirement) |
| `#EXAMPLES#` | Added a TikTok line in the example output block |

---

## Validation expectations (5-company test)

Running this prompt on the 5 test companies (Good Molecules, Mad Hippie, Black Girl Sunscreen, ArtNaturals, MakarttPro):

| Platform | Expected hit rate | Notes |
|---|---|---|
| Instagram | 5 / 5 | All US D2C beauty brands have IG |
| TikTok | 4 / 5 | Mad Hippie and Black Girl Sunscreen confirmed active. MakarttPro likely has one. |
| LinkedIn | 5 / 5 | Apollo also returns this — check for consistency |
| X (Twitter) | 2-3 / 5 | Many D2C brands deprioritize X |
| YouTube | 3-4 / 5 | Most have at least a brand channel |

If TikTok hit rate is below 3/5, the prompt may need a stricter instruction to search for `@brandname` directly on tiktok.com instead of relying on Google indexing.

---

## Known failure modes

1. **Hallucinated URLs** — happens when the model has no web access. Symptom: URLs look valid but return 404. Fix: switch to Perplexity or enable browsing on the chosen model.
2. **TikTok URL without `@`** — older models forget the `@` symbol despite the instruction. Symptom: `tiktok.com/example` instead of `tiktok.com/@example`. Fix: add a post-processing formula column that prepends `@` if missing, OR strengthen step 6 of the prompt with "MUST include @".
3. **Returns personal/founder profiles instead of company** — happens for small brands where the founder's IG is more active than the brand's. Symptom: profile name doesn't match brand name. Mitigation: instruction "official company profile" is already present; if it persists, add a check column comparing handle to company name.

---

## Maintenance notes

- **When to update this prompt:** if Clay launches a native TikTok-aware version of `Find Company Social Profiles`, deprecate this customization.
- **When to swap providers:** if cost becomes a problem at scale (>1000 companies/month), consider replacing with a dedicated TikTok scraper enrichment + lighter Clay native enrichment for the other 4 platforms.
- **Source of truth:** this file. The prompt in Clay is a copy — if you edit Clay directly, also update this file.

---

## Status

| Item | Status |
|---|---|
| Prompt drafted | ✅ |
| Pasted into Clay enrichment | ⏳ User action |
| Re-run on 5 test rows | ⏳ |
| TikTok hit rate validated | ⏳ |
| Mapping to Airtable handles configured | ⏳ Phase: write-back |

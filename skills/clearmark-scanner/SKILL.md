# SKILL: clearmark-scanner

**Role:** Scanner — the eyes of ClearMark.
**Mission:** Browse Shopee, Tokopedia, TikTok Shop, Facebook, Instagram, Twitter for listings that match a project's applied patterns. Log each candidate as a `finding`.

## When to use this skill

Activate this role when:

- An `inbox/` request asks for a scan, OR
- Intake creates a task at `clearmark/agents/scanner/tasks/<task-id>.json`, OR
- A user explicitly invokes Scanner.

## Inputs you read

- `clearmark/projects/<slug>/project.json` — the brief: products, NIE, watch platforms, applied patterns.
- `clearmark/memory/patterns/<slug>.md` — every pattern listed in `applied_patterns`. Read frontmatter `detection_signals`, `keywords`, `regex_hints`.

## Outputs you write

### 1. Update your state at start

`clearmark/agents/scanner/state.json`:

```json
{
  "status": "busy",
  "current_task_id": "<task-id>",
  "last_heartbeat": "<iso8601>",
  "last_action": "Scanning Shopee for project pfizer-indonesia, pattern impossible-dosage"
}
```

Heartbeat at least every 30 seconds while running.

### 2. Append events to today's log

`clearmark/agents/scanner/log/YYYY-MM-DD.jsonl` (one JSON per line):

```json
{"ts":"<iso8601>","event":"platform_open","platform":"shopee","query":"viagra 100mg"}
{"ts":"<iso8601>","event":"candidate_found","platform":"shopee","listing_url":"...","matched_patterns":["impossible-dosage"]}
```

### 3. Write each finding

`clearmark/projects/<slug>/findings/<YYYY-MM-DD>-<short-uuid>.json`:

```json
{
  "id": "2026-05-15-a1b2c3",
  "project_slug": "pfizer-indonesia",
  "discovered_at": "<iso8601>",
  "discovered_by": "scanner",
  "platform": "shopee",
  "listing_url": "https://shopee.co.id/...",
  "seller_name": "...",
  "seller_url": "...",
  "title": "V14gr4 100mg ORIGINAL TANPA EFEK SAMPING",
  "price_idr": 35000,
  "claimed_dosage": "100mg",
  "matched_patterns": ["disguised-names","non-psef-sellers"],
  "confidence": 0.86,
  "evidence_files": ["evidence/screens/2026-05-15-a1b2c3.png"],
  "status": "new",
  "notes": "Title uses leetspeak; seller has no PSEF marker."
}
```

`status` lifecycle: `new` → `confirmed` (by Analyst) → `reported` (Intake filed it) → `resolved` (takedown confirmed) | `dismissed`.

### 4. Reset state when done

Back to `idle`, `current_task_id: null`, summary in `last_action`.

## Rules

- **Never invent findings.** If you can't actually visit the platform, mark the task `blocked` in your state and stop. Mock listings violate Sofyan's "no mock data" rule.
- **One finding per unique listing URL.** Dedupe before writing.
- **Cite patterns honestly.** Only put a pattern in `matched_patterns` if the listing's text/image actually matches that pattern's signals.
- **Evidence files go under** `clearmark/projects/<slug>/evidence/` and are referenced by relative path from project root.

## Default starter task (if no task file but Intake says go)

For `pfizer-indonesia`: search Shopee + Tokopedia for queries `["viagra", "v14gra", "obat kuat sildenafil"]`, filter results that match any of the 4 applied patterns, log up to 20 candidate findings, hand off to Analyst for confidence review.

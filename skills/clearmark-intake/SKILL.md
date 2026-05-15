# SKILL: clearmark-intake

**Role:** Intake & Chief of Staff — the front door of ClearMark.
**Mission:** Receive client requests (product images + details + payment), open or update a project, distribute work to Scanner and Analyst, and ship the final report back to the client.

## When to use this skill

Activate this role when:

- A new file lands in `clearmark/inbox/` (a client request), OR
- A finding reaches `status: confirmed` and needs to be packaged into a report, OR
- A user explicitly invokes Intake.

## Inputs you read

- `clearmark/inbox/<id>.json` — raw client requests.
- All `clearmark/projects/<slug>/project.json` — known clients.
- `clearmark/projects/<slug>/findings/*.json` — pending work.
- `clearmark/memory/patterns/*.md` — to assign applied patterns to new projects.

## Outputs you write

### 1. State

`clearmark/agents/intake/state.json` — same shape as Scanner. Heartbeat while working.

### 2. Open or update a project

If the inbox request matches no existing client, create `clearmark/projects/<new-slug>/project.json` from this template:

```json
{
  "slug": "<kebab-case>",
  "client_name": "...",
  "industry": "pharmaceutical | cosmetic",
  "category": "obat-keras | obat-bebas | kosmetik",
  "status": "active",
  "created_at": "<iso8601>",
  "products": [],
  "watch_platforms": ["shopee","tokopedia","tiktokshop","facebook","instagram","twitter"],
  "applied_patterns": [],
  "stats": {"findings_total":0,"reports_filed":0,"last_scan_started_at":null,"last_scan_completed_at":null},
  "next_step": {"action":"initial-scan","owner":"scanner","due":null,"note":""},
  "sources": []
}
```

Then assign relevant patterns (e.g. pharma → `non-psef-sellers`, `disguised-names`; cosmetics → different set).

### 3. Dispatch tasks

Write a task file for Scanner:

`clearmark/agents/scanner/tasks/<task-id>.json`:

```json
{
  "task_id": "<task-id>",
  "project_slug": "...",
  "created_at": "<iso8601>",
  "created_by": "intake",
  "type": "initial-scan | targeted-scan | re-scan",
  "instructions": "...",
  "deadline": null
}
```

Same shape for Analyst tasks (`clearmark/agents/analyst/tasks/`) when needing pattern review or new pattern extraction.

### 4. Compose the client report

After Scanner+Analyst finish: write `clearmark/projects/<slug>/reports/<YYYY-MM-DD>-<short-uuid>.md`:

```markdown
---
report_id: ...
project_slug: ...
filed_at: <iso8601>
findings_count: 12
high_confidence_count: 8
legal_basis: [UU 17/2023 Pasal 435, ...]
---

# Laporan Temuan Produk Tiruan — <Client Name>

## Ringkasan
...

## Temuan
... (table or list with listing URL, platform, matched patterns, evidence)

## Rekomendasi Tindakan
...
```

### 5. Update project.json stats

Increment `stats.reports_filed`, `stats.findings_total`. Update `next_step`. Bump `last_scan_completed_at`.

## Rules

- **No mock client requests.** Inbox starts empty. The first real request will come from a real brand.
- **Always link findings to a project.** Orphan findings are not allowed.
- **Idempotency.** Re-running an intake on the same inbox file must not duplicate findings or reports — check before writing.

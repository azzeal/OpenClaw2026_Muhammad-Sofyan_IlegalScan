# SKILL: clearmark-analyst

**Role:** Analyst — the brain of ClearMark.
**Mission:** Extract reusable patterns of counterfeit modus operandi from public sources (BPOM publications, news, takedown notices) and review Scanner's findings to confirm or down-rate confidence.

## When to use this skill

Activate this role when:

- Intake creates a task at `clearmark/agents/analyst/tasks/<task-id>.json`, OR
- A new source document lands in any project's `evidence/`, OR
- Scanner produces findings that need confidence review (status `new` → `confirmed`).

## Inputs you read

- New source documents (PDFs, articles, BPOM siaran pers).
- `clearmark/projects/<slug>/findings/*.json` with `status: new`.
- Existing `clearmark/memory/patterns/*.md` to avoid duplication and to extend `brands_affected` when patterns generalize.

## Outputs you write

### 1. State

`clearmark/agents/analyst/state.json` — same shape as Scanner. Heartbeat while working.

### 2. New pattern entries

`clearmark/memory/patterns/<slug>.md` with this frontmatter (and a body explaining the pattern + heuristics):

```yaml
---
slug: <kebab-case>
title: <human-readable>
category: naming | seller-legitimacy | product-spec | offline-signal | packaging | claims
severity: low | medium | high | critical
brands_affected: [<list>]
platforms_seen: [<list>]
detection_signals: [...]
keywords: [...]
regex_hints: [...]
source:
  type: bpom_publication | news | takedown_notice | internal_observation
  title: ...
  ref: ...
  date: <YYYY-MM-DD>
  file: <relative path if any>
learned_at: <iso8601>
learned_by: analyst
confidence: low | medium | high | certain
---
```

Body should include: the pattern, verified examples, detection heuristics for Scanner, edge cases, generalization notes.

### 3. Confidence review of findings

For each new finding, update its JSON in place:

```json
{
  "...": "...",
  "confidence": 0.86,
  "confidence_review": {
    "by": "analyst",
    "at": "<iso8601>",
    "verdict": "confirmed | downgrade | dismiss",
    "notes": "Listing claims 500mg → impossible-dosage hit; non-PSEF seller confirmed. Confidence 0.95."
  },
  "status": "confirmed | new | dismissed"
}
```

### 4. Journal entries

Append to `clearmark/memory/journal/YYYY-MM-DD.md` whenever a notable pattern is learned or a notable finding is confirmed.

## Rules

- **One source = at least one citation in frontmatter.** No floating patterns.
- **Don't merge patterns sloppily.** If two patterns share signals but are conceptually distinct (e.g. `disguised-names` vs. `non-psef-sellers`), keep them separate. Cross-reference in body if helpful.
- **Generalize cautiously.** A pattern learned from Viagra (`brands_affected: [viagra]`) only graduates to `[all-prescription-drugs]` after a second confirming source.

## Seeded knowledge (2026-05-15)

Four patterns already live, all sourced from BPOM Siaran Pers HM.01.1.2.12.25.19 (Viagra Palsu, 29 Dec 2025):

1. `disguised-names`
2. `non-psef-sellers`
3. `impossible-dosage`
4. `kios-labels`

When a new pharma project is intake'd, default to applying patterns 1, 2, and 3 immediately; 4 is contextual.

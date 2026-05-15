# clearmark-runner

OpenClaw runtime for ClearMark. Three agents — Scanner, Intake, Analyst — each implemented as a deterministic tick function that reads from and writes to the `clearmark/` filesystem contract the dashboard observes.

No LLM calls. No mock data. Real HTTP, real regex, real file IO.

## Install

```bash
cd runner
npm install
```

## Use

Per-agent, single tick:

```bash
npm run run:intake     # process clearmark/inbox/*.json → create/update projects + dispatch scan tasks
npm run run:scanner    # take next task → fetch URLs → write findings
npm run run:analyst    # review every status:new finding → confidence + verdict
```

All three in order:

```bash
npm run run:all
```

Loop forever (Ctrl+C to stop):

```bash
npx tsx src/cli.ts scanner --loop 30   # tick every 30 s
```

## How a client request flows

1. **Drop a JSON file in `clearmark/inbox/`** with the shape below.
2. **`run:intake`** picks it up, creates/updates `clearmark/projects/<slug>/project.json`, dispatches a `targeted-scan` task to Scanner at `clearmark/agents/scanner/tasks/<task-id>.json`, archives the inbox file to `clearmark/inbox/processed/`.
3. **`run:scanner`** claims the next task, HTTP-fetches every `target_urls[i]`, extracts title + meta + stripped body, runs each project-applied pattern's keywords + `regex_hints` against that haystack. Hits become `clearmark/projects/<slug>/findings/<id>.json` with `status:new` and `confidence:0.5`. Project stats updated, `next_step` advanced to `analyst-review`. Task file deleted.
4. **`run:analyst`** walks every `status:new` finding across all projects, applies deterministic rules (impossible-dosage → 0.95 / non-psef-sellers → 0.8 / disguised-names → 0.7 alone, 0.85 with corroborator / kios-labels → +0.05), writes back `confidence`, `status` (`confirmed | dismissed | new`), and a `confidence_review` block. Updates project `findings_high_confidence` and, if any confirmed, advances `next_step` to `compose-report`.

Every state transition heartbeats `clearmark/agents/<id>/state.json` and appends a JSONL event to `clearmark/agents/<id>/log/YYYY-MM-DD.jsonl`. The dashboard polls those files every 3 seconds and reflects the run in real time.

## Inbox request shape

`clearmark/inbox/<request_id>.json`:

```json
{
  "request_id": "client-pfizer-2026-05-15-001",
  "received_at": "2026-05-15T16:32:00+07:00",
  "client_name": "Pfizer Indonesia",
  "project_slug": "pfizer-indonesia",
  "target_urls": [
    "https://example.com/listing/123",
    "https://example.com/listing/456"
  ],
  "instructions": "Optional human-readable note that goes to Scanner."
}
```

`client_legal_name`, `industry`, `category`, `products`, `watch_platforms`, `applied_patterns`, `deadline`, `sources` are all optional. If `project_slug` is omitted, it's slugified from `client_name`. If a project with that slug already exists, the inbox request is matched onto it rather than creating a duplicate.

If `target_urls` is empty or omitted, no scan task is dispatched (Intake just registers the request).

## Layout

```
runner/
  src/
    cli.ts                # entry: pick agent, run once or loop
    paths.ts              # workspace + clearmark/ path resolver
    state.ts              # read/write state.json + JSONL log + heartbeat + metrics
    tasks.ts              # task queue (list / next / write / complete)
    patterns.ts           # gray-matter loader for clearmark/memory/patterns/*.md
    matching.ts           # keyword + regex_hints matcher
    fetch.ts              # native fetch with timeout + UA
    text.ts               # title, og:description, strip tags, platform detect
    ids.ts                # short-id, date slug, ISO now, slugify
    agents/
      intake.ts           # inbox sweep + project create + scan dispatch
      scanner.ts          # URL fetch + pattern match + finding write
      analyst.ts          # finding review via deterministic rules
```

## Operational notes

- **Single instance per agent assumed.** The runner doesn't use file locks; running two `scanner` ticks concurrently would race on the task queue.
- **Failure mode is `status:blocked`.** When a tick throws, the agent's `state.json` is left at `blocked` with the error in `last_action` and `agent_blocked` in the log. The operator must clear it.
- **Heartbeat between URLs.** Scanner heartbeats `state.json` before each fetch so the dashboard stays live during long scans.
- **No findings invented.** If a URL returns nothing matching, no finding file is written — the page still records `no_match` in the log for audit. Fetch failures are logged as `fetch_failed` and don't abort the rest of the URL list.
- **Patterns are operator-authored.** The runner does not synthesize new patterns. The Analyst's "extract patterns from a source" mode is intentionally out of scope here — that work happens in a separate review step.
- **TLS surprise:** the BPOM share host (`simpan.pom.go.id`) uses a DigiCert Global G2 chain that some container CA bundles don't ship. If you see `TypeError: fetch failed` on a `pom.go.id` URL, set `NODE_EXTRA_CA_CERTS` or run the runner outside the container. The sample inbox uses Wikipedia and example.com to avoid this on first run.

## Environment

`CLEARMARK_WORKSPACE` — optional; absolute path to the workspace root that contains `clearmark/` and `skills/`. Defaults to the parent directory of `runner/`.

## Wiring to OpenClaw cron / heartbeat

Add to `openclaw.json` (or whichever scheduler config OpenClaw uses):

```
* * * * *      cd runner && npx tsx src/cli.ts intake     # sweep inbox every minute
*/5 * * * *    cd runner && npx tsx src/cli.ts scanner    # tick scanner every 5 minutes
*/15 * * * *   cd runner && npx tsx src/cli.ts analyst    # review findings every 15 minutes
```

Or invoke a single `all` tick from the OpenClaw heartbeat with `cd runner && npm run run:all`.

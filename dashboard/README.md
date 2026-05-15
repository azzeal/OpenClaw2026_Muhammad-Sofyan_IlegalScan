# ClearMark Mission Control — Dashboard

Next.js (App Router) + Tailwind + better-sqlite3. Reads and writes to the sibling `clearmark/` data folder in the OpenClaw workspace.

## Run

```bash
cd dashboard
npm install
npm run index   # build the search index from filesystem
npm run dev     # http://localhost:3000
```

## Scripts

- `npm run dev` — Next.js dev server
- `npm run build` — production build (verifies type-correctness + bundling)
- `npm run lint` — ESLint
- `npm run typecheck` — `tsc --noEmit`
- `npm run index` — rebuild `clearmark/.index.db` (FTS5) from filesystem
- `npm run index:watch` — keep rebuilding on filesystem changes

## Data contract

Source of truth: filesystem under `../clearmark/`. SQLite (`../clearmark/.index.db`) is a derived FTS5 index — safe to delete and rebuild any time.

See:
- `../skills/clearmark-scanner/SKILL.md`
- `../skills/clearmark-intake/SKILL.md`
- `../skills/clearmark-analyst/SKILL.md`

for the per-agent contract on which files they read and write.

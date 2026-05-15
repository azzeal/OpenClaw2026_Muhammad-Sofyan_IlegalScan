# ClearMark Platform

Multi-tenant SaaS that lets brands register their products and get automatic counterfeit-detection reports from Shopee, Tokopedia, and TikTok Shop. Companion to the OpenClaw internal mission control (`../dashboard/`).

**Stack**: Next.js 15 (App Router) + React 19 + TypeScript 5 strict + Tailwind 3.4 + Drizzle ORM + Postgres + Auth.js (NextAuth v5). Deployable to Vercel + any Postgres (Vercel Postgres, Supabase, Neon, self-host).

**Theme**: light, Linear/Notion-clean, emerald accent. Intentionally distinct from the dark internal mission control.

## Run locally

### Prereqs

- Node 22+
- A Postgres database. Either:
  - Local Postgres (Linux: `sudo apt install postgresql && sudo pg_ctlcluster 16 main start`)
  - Or any hosted Postgres (Supabase, Neon, Vercel Postgres) — get a connection string.

### Setup

```bash
cd platform
cp .env.example .env.local
# Edit .env.local: DATABASE_URL + AUTH_SECRET (openssl rand -base64 32)
npm install
npm run db:push       # creates all tables in the target DB
npm run db:seed       # creates Demo Brand tenant + 3 sample products
npm run dev           # http://localhost:3001
```

Seed credentials: `demo@clearmark.local` / `demo12345`.

### Scripts

- `npm run dev` — Next.js dev (port **3001** — port 3000 is reserved for `../dashboard/`)
- `npm run build` — production build
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — ESLint
- `npm run db:generate` — generate Drizzle migrations from schema changes
- `npm run db:push` — apply schema to DB (dev)
- `npm run db:studio` — Drizzle Studio (GUI)
- `npm run db:seed` — insert Demo Brand seed

## Data model

Source of truth: PostgreSQL. Tenant-scoped tables, isolated at app layer (every query filters by `tenant_id` from the authenticated session).

```
users                  — auth identities (email + bcrypt hash + Auth.js session)
tenants                — one per subscriber brand (slug-keyed, with trial window)
tenant_members         — users ↔ tenants, role (owner|admin|member)
products               — what each tenant wants monitored (name, brand, NIE, keywords, ref image)
scans                  — one row per cron run per product per platform
findings               — each detected listing (URL, seller, price, similarity, status)
subscriptions          — one per tenant; tier is single Rp 100K/month; integrates with DOKU MCP
notification_prefs     — per-tenant Telegram chat_id + toggles
event_log              — audit trail for support
```

All tables that have `tenant_id` are filtered in code before every query — see `lib/auth.ts` and `app/(app)/*` for the pattern (`session.user.tenantId` is pinned to the JWT at login).

## Auth flow

1. `POST /api/register` — creates `users` row + `tenants` row + `tenant_members` (role=`owner`) + `subscriptions` (`trialing`, 14d) + `notification_prefs`, all in one transaction.
2. Client-side, immediately call `next-auth` `signIn('credentials', …)` with the new email/password.
3. Auth.js issues a JWT with `userId` + `tenantId` + `tenantSlug` baked in (see `lib/auth.ts` callbacks).
4. `middleware.ts` redirects unauthenticated requests to `/dashboard*` → `/login?next=…`, and authenticated visitors to `/login` → `/dashboard`.

Passwords hashed via `bcryptjs` (cost 10).

## Routes

| Route | Auth | Notes |
| --- | --- | --- |
| `/` | public | Marketing landing |
| `/pricing` | public | Single tier, Rp 100K/bln, 8 included items |
| `/login` | public | Credentials sign-in |
| `/register` | public | Creates user + tenant + trial subscription |
| `/onboarding` | auth | One-step product wizard, runs once after register |
| `/dashboard` | auth | 4 stat cards + recent findings |
| `/dashboard/products` | auth | Table of monitored products |
| `/dashboard/findings` | auth | All findings (filter + search ships in next update) |
| `/dashboard/trends` | auth | Weekly chart (needs ≥1 week scan data first) |
| `/dashboard/settings` | auth | Brand, billing, Telegram, sign-out |
| `/api/register` | public | Tenant + user creation |
| `/api/products` | auth | Add monitored product |
| `/api/auth/[...nextauth]` | mixed | Auth.js handlers |

## Theme tokens

Tailwind config defines a tight semantic palette:

- `background` (white) / `foreground` (slate-900) / `muted` (slate-100)
- `primary` (emerald-600) — only used for CTAs and confirmed-OK states
- `destructive` (rose-600) — high-severity findings
- `warn` (amber-500) — trial-ending banners, dismissable warnings
- `border` (slate-200) — subtle borders, no thick lines
- `accent` (emerald-50 / emerald-900 fg) — soft fills around CTAs

Typography stays light: mono only for labels (`.label-eyebrow`) and small data, sans for body and headings.

## Multi-tenancy guarantees

- **Every query touching tenant-owned tables filters by `session.user.tenantId`** before reading or writing.
- **Auth.js JWT pins the tenant** at login — switching tenant requires re-auth (one user → one tenant in v1; multi-tenant per user comes later if needed).
- **Foreign-key cascades** on `tenant_id` so deleting a tenant cleans up products, findings, scans, subscriptions, and notification prefs.
- Database-level RLS is **not** used in v1 (chose Drizzle + raw Postgres for portability across hosts). RLS can be layered on for defense-in-depth when deploying to Supabase.

## Deploy to Vercel

1. Push the repo. Vercel auto-detects Next.js.
2. Set the project's **Root Directory** to `platform/`.
3. Set env vars in Vercel project settings:
   - `DATABASE_URL` — your Postgres URL
   - `AUTH_SECRET` — `openssl rand -base64 32`
   - `NEXTAUTH_URL` — `https://your-domain.vercel.app`
   - (later) `DOKU_*`, `TELEGRAM_BOT_TOKEN`
4. After first deploy, run migrations against production:
   ```bash
   DATABASE_URL=… npx drizzle-kit push
   ```
5. (Optional) seed Demo Brand for QA: `DATABASE_URL=… npm run db:seed`

`vercel.json` reserves the cron slots for the scraper (Fase B) — kept disabled until the cron handlers are implemented.

## Roadmap (this PR is **Fase A only**)

Phase | Scope | Status
--- | --- | ---
A | Foundation: auth, schema, marketing, dashboard skeleton, onboarding | ✅ this PR
B | Scraper core: Vercel Cron, HTTP scrapers per platform, findings persistence, pHash similarity | next
C | Findings UI: filters, search, expand-row, tren charts, CSV/PDF export | after B
D | DOKU MCP payment: Checkout for trial→paid conversion, Direct QRIS for renewal, webhook handler | after C
E | Telegram notifications: per-tenant chat_id linking, new-finding push, weekly digest | after D
F | Polish: E2E Playwright, production migrations, real Vercel deploy | last

## Integration with internal mission control

The internal `../dashboard/` (dark, ops cyberpunk) and this platform are **two apps, one Postgres** (eventually).

- Right now: this platform writes to Postgres exclusively. The internal dashboard still reads filesystem `../clearmark/`.
- Next step (Fase B): runner gains a Postgres write target so findings produced via OpenClaw also land in this DB.
- Eventually: internal dashboard reads Postgres for client / project / finding data; filesystem stays for memory/patterns (curated operator knowledge).

Convention: **operator workspace data** (patterns, journal) is filesystem under `../clearmark/memory/`. **Client SaaS data** (tenants, products, findings) is Postgres. Sources never duplicate.

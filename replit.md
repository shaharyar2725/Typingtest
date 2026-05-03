# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only, local DB only)
- `pnpm --filter @workspace/db run generate` — generate SQL migration files from schema changes
- `pnpm --filter @workspace/db run migrate` — apply generated migrations to production DB (uses DIRECT_URL)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Vercel Deployment

Two separate Vercel projects, one for each artifact. See `.env.example` for all required environment variables.

### Project 1 — Frontend (`artifacts/typing`)
- **Root Directory**: `artifacts/typing`
- **Install Command**: `cd ../.. && pnpm install --frozen-lockfile`
- **Build Command**: `cd ../.. && BASE_PATH=/ pnpm --filter @workspace/typing run build`
- **Output Directory**: `dist/public`
- **Framework Preset**: Other
- **Environment variables**: `VITE_API_BASE_URL` → your API project URL

### Project 2 — API Server (`artifacts/api-server`)
- **Root Directory**: `artifacts/api-server`
- **Install Command**: `cd ../.. && pnpm install --frozen-lockfile` (auto-set by vercel.json)
- **Framework Preset**: Other
- **Environment variables**: `DATABASE_URL` (pooled), `DIRECT_URL` (direct), `ALLOWED_ORIGINS`

### Database Setup (Neon)
1. Create a project at neon.tech
2. Copy the **Pooled** connection string → `DATABASE_URL` in Vercel API project env
3. Copy the **Direct** connection string → `DIRECT_URL` in Vercel API project env
4. Run schema migrations: `DIRECT_URL=<direct_url> pnpm --filter @workspace/db run generate && pnpm --filter @workspace/db run migrate`

### Security measures implemented
- `helmet` — security headers on all API responses
- `express-rate-limit` — 200 req/15 min general; 20 req/15 min on auth endpoints
- CORS allowlist via `ALLOWED_ORIGINS` env var
- `trust proxy 1` — accurate IP detection behind Vercel's edge
- Neon HTTP driver — stateless connections, no pool exhaustion in serverless
- `DIRECT_URL` bypasses PgBouncer for safe DDL migrations

## TypeFlow (artifacts/typing)

English-only typing test app with two-line scrolling display, results dashboard, and a single global leaderboard. Email+password auth + a shared predefined avatar set.

Pages (canonical URLs and primary SEO targets):
- `/` — **Home / Practice page**. Primary keyword: **"typing practice"**. Open-ended test where users freely change mode, duration, word source. Personal best stored locally only — runs from this page do **NOT** submit to the leaderboard. Has H1 "Free Typing Practice", long-form content, FAQ, and `WebApplication` + `BreadcrumbList` + `FAQPage` JSON-LD.
- `/competition` — **Competition / Test page**. Primary keyword: **"typing test"**. Locked 60-second time mode using `TypingHeader` (with `lockSettings`). Only signed-in users' scores submit to the global leaderboard. H1 "Free Typing Test — 60 Seconds", long-form content, FAQ, same three JSON-LD blocks.
- `/typing-speed-test`, `/1-minute-typing-test`, `/5-minute-typing-test` — long-tail SEO landing pages with their own variants.
- `/typing-test` → 301-style SPA redirect to `/competition` (consolidates "typing test" link equity).
- `/typing-practice` → 301-style SPA redirect to `/` (consolidates "typing practice" link equity, prevents cannibalization).
- `Redirect` component (`src/components/Redirect.tsx`) implements the SPA redirects via `useLocation().setLocation(to, { replace: true })`.

SEO infrastructure:
- `hooks/useSEO.ts` — sets `<title>`, description, keywords, canonical (defaults to `origin + pathname`), OG tags (with `og:site_name=TypeFlow`, `og:locale=en_US`, absolute OG image URL), Twitter Card defaults, and injects an arbitrary number of JSON-LD blocks (tagged with `data-seo-jsonld` for cleanup on unmount).
- `index.html` — SPA fallback shell carries comprehensive defaults: title, description, keywords, canonical, OG, Twitter Card, theme-color, robots directive, plus a global `WebSite` + `Organization` `@graph` JSON-LD that's always present.
- `public/robots.txt` — allows all bots and explicitly whitelists Googlebot, Bingbot, DuckDuckBot, OAI-SearchBot, PerplexityBot.
- `public/sitemap.xml` — lists all canonical URLs including all 10 lesson pages (`/lessons/home-row-basics`, etc.) with appropriate priorities.
- `index.html` — fonts loaded asynchronously (`rel="preload"` + `media="print" onload` + noscript fallback) to eliminate render-blocking font requests.
- Header nav anchor text uses keyword-rich labels: **Practice** → `/`, **Typing Test** → `/competition`.
- Footer "Practice & Test" column links to canonicals first, with descriptive anchors for the variants.

Key frontend components:
- `components/typing/TypingTest.tsx` — two-line viewport, accepts `fontSize`. Has `saveToHistory` prop (default true; competition passes `false` to keep personal best clean).
- `components/typing/TypingHeader.tsx` — clean responsive bar: mode pills (Time/Words/Quote), live mm:ss timer, restart, settings gear, avatar/sign-in. Stacks vertically on mobile. Supports `lockSettings` + `lockedLabel` for competition mode (hides mode pills, settings gear, and duration chips).
- `components/typing/SettingsSheet.tsx` — slide-over panel: theme, font size (sm/md/lg/xl), sound, strict mode, live stats toggle, word source, sign-out
- `components/typing/Leaderboard.tsx` — global top-20 by WPM, shows avatars
- `components/auth/AuthDialog.tsx` — sign in / sign up tabs with avatar picker grid
- `contexts/AuthContext.tsx` — token + user state via localStorage
- `lib/auth-api.ts` — fetch helpers (auth + scores + leaderboard)
- `lib/words.ts` — English WORDS, QUOTES, CODE_SNIPPETS, PUNCTUATION_NUMBERS

Auth model: email + password (bcryptjs), shared avatar set referenced by `avatarId`. Server issues an opaque session token stored in localStorage; required for score submission. Default avatars are seeded on API server startup (`api-server/src/lib/seed.ts`).

API routes:
- `routes/auth.ts` — POST /signup, /login, /logout; GET /me; PUT /avatar
- `routes/avatars.ts` — GET /api/avatars (predefined shared set)
- `routes/leaderboard.ts` — POST /scores (Bearer auth); GET /api/leaderboard (top 20 English scores). Frontend always submits `language: "en"`.

DB tables (`lib/db/src/schema/leaderboard.ts`): `tf_avatars`, `tf_users` (email/passwordHash/username/avatarId), `tf_sessions` (token PK), `tf_scores` (with `language` column, always "en").

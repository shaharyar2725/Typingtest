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

### Pages & Routes

| URL | Primary Keyword | Notes |
|-----|----------------|-------|
| `/` | typing practice | Home / open practice. Does NOT submit to leaderboard. |
| `/typing-speed-test` | typing speed test | Main test page, adjustable duration, leaderboard eligible. |
| `/1-minute-typing-test` | 1 minute typing test | Locked to 60s. Angle: peak speed / daily benchmark. |
| `/3-minute-typing-test` | 3 minute typing test | Locked to 180s. Angle: daily practice sweet spot / office & govt standard. |
| `/5-minute-typing-test` | 5 minute typing test | Locked to 300s. Angle: endurance / employer standard / WPM endurance ratio. |
| `/10-minute-typing-test` | 10 minute typing test | Locked to 600s. Angle: professional certification / transcription / civil service. |
| `/20-minute-typing-test` | 20 minute typing test | Locked to 1200s. Angle: elite marathon / court reporter training. |
| `/learn-typing` | learn touch typing | Course overview + all lesson links. |
| `/lessons/:slug` | (per lesson) | 10 structured lessons. |
| `/about` | — | About page. |
| `/results/:id` | — | Per-result detail page. |
| `/typing-test` | — | SPA redirect → `/typing-speed-test` |
| `/typing-practice` | — | SPA redirect → `/` |
| `/competition` | — | SPA redirect → `/typing-speed-test` |

### SEO Infrastructure

- `hooks/useSEO.ts` — sets `<title>`, description, keywords, canonical, all OG tags (`og:site_name=TypeFlow`, `og:locale=en_US`, absolute image URL), Twitter Card, and injects JSON-LD blocks tagged with `data-seo-jsonld` (cleaned up on unmount).
- `index.html` — SPA shell carries full fallback defaults: title, description, keywords, canonical, OG, Twitter Card, `theme-color`, `robots` directive, and a permanent `WebSite` + `Organization` `@graph` JSON-LD block.
- `public/robots.txt` — allows all bots; explicitly whitelists Googlebot, Bingbot, DuckDuckBot, OAI-SearchBot, PerplexityBot. References sitemap.
- `public/sitemap.xml` — all 7 timed-test/practice pages + learn-typing + 10 lesson pages + about. Priorities set correctly.
- Fonts: loaded async via `rel="preload"` + `media="print" onload` + noscript fallback (eliminates render-blocking).
- Each timed-test page has `WebApplication` + `FAQPage` + `BreadcrumbList` JSON-LD.
- Each timed-test page cross-links to all other duration pages in article prose.
- Footer "Practice & Test" column links to all 7 test pages.

### Key Frontend Components

- `components/typing/TypingTest.tsx` — two-line viewport, accepts `fontSize`, `durationSec`, `mode`, etc.
- `components/typing/TypingHeader.tsx` — responsive header bar: mode pills, live mm:ss timer, restart, settings gear. Supports `lockSettings` prop (hides mode pills, duration chips, settings gear) for all timed-test landing pages.
- `components/typing/SettingsPopover.tsx` — popover panel: theme, font size (sm/md/lg/xl), sound, strict mode, live stats toggle, word source.
- `components/typing/ResultCard.tsx` — post-test result display with WPM percentile widget.
- `components/WpmPercentile.tsx` — "Faster than X% of typists" widget shown after every test.
- `components/ProfessionSpeedTable.tsx` — filterable table of 14 job roles with WPM requirements; highlights qualifying roles based on your last score.
- `components/layout/AppShell.tsx` — wraps all pages with Header + Footer, scrolls to top on route change.
- `components/layout/Header.tsx` — nav: Practice → `/`, Typing Test → `/typing-speed-test`, Course → `/learn-typing`, About → `/about`.
- `components/layout/Footer.tsx` — links to all 7 test pages, first 4 lessons, About, Touch Typing Guide.
- `components/Redirect.tsx` — SPA redirect via `useLocation().setLocation(to, { replace: true })`.

### Lib Files

- `lib/words.ts` — WORDS, QUOTES, CODE_SNIPPETS, PUNCTUATION_NUMBERS arrays.
- `lib/wpm-data.ts` — WPM percentile lookup table, profession speed data, improvement timeline.
- `lib/storage.ts` — localStorage state (settings, history, personal best).
- `lib/lessons.ts` — LESSONS array (10 lessons with slugs, titles, drills).
- `lib/sounds.ts` — Web Audio API sound effects (key click, error, success).

### Auth Model

Email + password (bcryptjs). Server issues an opaque session token stored in `localStorage`. Required for leaderboard score submission. Avatars are a shared predefined set seeded on API startup.

### API Routes

- `routes/auth.ts` — POST /signup, /login, /logout; GET /me; PUT /avatar
- `routes/avatars.ts` — GET /api/avatars
- `routes/leaderboard.ts` — POST /scores (Bearer auth); GET /api/leaderboard (top 20, `language: "en"`)

### DB Tables (`lib/db/src/schema/leaderboard.ts`)

`tf_avatars`, `tf_users` (email/passwordHash/username/avatarId), `tf_sessions` (token PK), `tf_scores` (with `language` column, always "en").

### SPA SEO Limitation

This is a Vite SPA — Googlebot must render JavaScript to see per-page `<title>` and meta tags set by `useSEO`. The `index.html` shell contains comprehensive fallback defaults for the home page. Googlebot does render SPAs (via its Web Rendering Service), but with potential delay. For full SSR, migration to a Vite SSR or Next.js setup would be required.

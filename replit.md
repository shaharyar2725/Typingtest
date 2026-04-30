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
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## TypeFlow (artifacts/typing)

English-only typing test app with two-line scrolling display, results dashboard, and a single global leaderboard. Email+password auth + a shared predefined avatar set.

Pages:
- `/` — **Home / Test page**: open-ended test where users freely change mode, duration, word source. Personal best (WPM, accuracy, total runs) is stored locally only — runs from this page do **NOT** submit to the leaderboard.
- `/competition` — **Competition page**: locked 60-second time mode using the same `TypingHeader` (with `lockSettings`). Only signed-in users' scores are submitted to the global leaderboard. Includes the leaderboard and rules.
- `/typing-speed-test`, `/1-minute-typing-test`, `/5-minute-typing-test`, `/typing-practice` — SEO landing pages with their own variants.
- `/typing-test` is a legacy route kept as a redirect to `/` (the old duplicate page was removed).

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

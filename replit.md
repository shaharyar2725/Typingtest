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

Typing test app with two-line scrolling display, results dashboard with WPM/Errors chart (recharts), and a leaderboard backed by `tf_users` and `tf_scores` Postgres tables.

Key components:
- `components/typing/TypingTest.tsx` — two-line viewport that scrolls completed lines off-screen
- `components/typing/Controls.tsx` — header with language dropdown, mm:ss timer, restart, and settings popover
- `components/typing/ResultCard.tsx` — large WPM/Acc stats and WPM-over-time chart
- `components/typing/Leaderboard.tsx` — top-20 leaderboard with username claim flow
- `lib/leaderboard-api.ts` — fetch helpers + localStorage token persistence

Leaderboard "sign up": user claims a username, gets a random server-issued token stored in localStorage. The token is required to submit scores. No password — lightweight by design.

API routes (in `artifacts/api-server/src/routes/leaderboard.ts`):
- `POST /api/leaderboard/claim` — claim a username
- `POST /api/leaderboard/scores` — submit a score (requires token)
- `GET  /api/leaderboard` — top 20 by best WPM per user

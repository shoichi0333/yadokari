# AGENTS.md

This file provides guidance to Codex when working in this repository.

## Project Overview

YADOKARI is a Japanese real estate and minpaku research portal. It helps users:

- check whether an address or property can be used for 民泊
- search mock/seeded minpaku-friendly rental properties
- compare 住宅宿泊事業, 国家戦略特区民泊, and 旅館業許可 options
- view government minpaku listing data on a competition map
- simulate revenue and yield
- manage favorites, leads, property submissions, and paid-plan flows

The main Next.js app lives at `YADOKARI/yadokari-app/`. Run app commands from that directory.

## Commands

```powershell
cd YADOKARI\yadokari-app

npm run dev          # Start dev server, normally http://localhost:3000
npm run lint         # ESLint
npm run typecheck    # TypeScript check
npm run build        # prisma generate && next build
npm run predeploy    # lint + typecheck + production readiness check + build
npm run smoke        # HTTP smoke test against localhost or SMOKE_BASE_URL
npm run start        # Serve production build

npm run db:generate  # Prisma generate
npm run db:migrate   # Prisma migrate deploy
npm run db:seed      # Seed Property rows from lib/data/properties.ts
npm run db:studio    # Prisma Studio
```

There is no formal test suite yet. Use `npm run predeploy` as the strongest pre-release verification path. Use `npm run smoke` after a local or production server is running. For faster iteration, use `npm run lint`, `npm run typecheck`, and `npm run build`.

On Windows, `npm run build` can fail during `prisma generate` with an `EPERM ... query_engine-windows.dll.node` rename error if `next dev` is still running. Stop this app's dev server, then rerun the build.

## Current Architecture

The app has moved beyond the original static Phase 1. It now supports a hybrid mode:

- Without `DATABASE_URL`, property search falls back to the local mock dataset.
- With `DATABASE_URL`, API/service code reads from Prisma/PostgreSQL.
- The scraper-produced public JSON powers the minpaku competition map.

### Core Data Flow

```text
lib/data/properties.ts
  mock Property[] array, searchProperties(), getPropertyById()
        ↓
lib/properties-service.ts
  DB/mock abstraction for property list/detail access
        ↓
app/api/properties/*
  API routes for future DB-backed clients

lib/minpaku.ts
  getMinpakuInfo(zoning, isTokkuArea) -> MinpakuInfo
  getMinpakuBadgeType(info) -> MinpakuType

lib/simulator.ts
  simulate(SimulatorInput) -> SimulatorOutput
```

`MinpakuType` is the core domain enum: `JUUTAKU | TOKKU | RYOKAN | NG`. Badge labels and colors live in `lib/minpaku.ts`.

## Important Routes

| Route | File | Notes |
| --- | --- | --- |
| `/` | `app/page.tsx` | Main product surface with checker/search/SEO sections |
| `/check` | `app/check/page.tsx` + `CheckerClient.tsx` | Address/URL minpaku checker |
| `/report` | `app/report/page.tsx` + `ReportClient.tsx` | Address-based detailed minpaku report |
| `/properties` | `app/properties/page.tsx` | Property search grid with tag filters |
| `/search` | `app/search/page.tsx` | Area search and investment-area comparison |
| `/property/[id]` | `app/property/[id]/page.tsx` | Static property detail pages from `PROPERTIES` |
| `/map` | `app/map/page.tsx` | Competition map from `public/data/minpaku_listings.json` |
| `/listings` | `app/listings/page.tsx` | Redirects to `/map` |
| `/area` | `app/area/*` | Prefecture/ward SEO pages from zoning data |
| `/blog` | `app/blog/*` | Static minpaku SEO articles |
| `/pricing` | `app/pricing/*` | Plan selection and checkout entry |
| `/dashboard` | `app/dashboard/page.tsx` | User dashboard mock/plan surface |
| `/submit-property` | `app/submit-property/*` | Property listing submission |
| `/contact` | `app/contact/*` | Contact form |
| `/api/health` | `app/api/health/route.ts` | Deployment/runtime health check |

## Key Components

- `SearchForm` - shared property search form; submits to `/properties` unless an `onSearch` handler is supplied.
- `PropertyCard` - card grid item linking to property detail.
- `MinpakuBadge` - color-coded badge using `MINPAKU_TYPE_COLORS`.
- `RevenueSimulator` - client-side slider UI calling `simulate()`.
- `FavoriteButton` - local/auth-aware favorite interaction.
- `Header` and `BottomNav` - primary desktop/mobile navigation.
- `MapEmbed`, `SearchResultsMap`, `CompetitionMap`, `ListingsMap`, `CheckerMap` - Leaflet maps loaded client-side to avoid SSR issues.

## Database and Services

Prisma schema is in `YADOKARI/yadokari-app/prisma/schema.prisma`.

Current models include:

- `Property`
- `User`
- `Subscription`
- `Favorite`
- `CheckHistory`
- `SavedReport`
- `Inquiry`
- `PropertyListing`

The app is designed to keep working without a database. Check `lib/properties-service.ts` before changing data access behavior.

Environment variable template: `YADOKARI/yadokari-app/.env.local.example`.

Required for full production-like behavior:

- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Stripe variables for paid plans
- Resend variables for contact/leads email

Operational helpers:

- `scripts/predeploy-check.ts` validates critical files, listing data, and production environment readiness.
- `scripts/smoke-test.ts` checks the live HTTP routes for the main conversion path.
- `/api/health` reports runtime configuration and listing-data status. `status: "degraded"` means the app is serving but one or more production integrations are missing.
- `YADOKARI/docs/deploy-readiness-runbook.md` is the deploy checklist/runbook.
- `YADOKARI/docs/production-integrations.md` lists the Vercel, Supabase, Stripe, and Resend setup values.

## Minpaku Eligibility Logic

`lib/minpaku.ts` maps Japanese zoning categories (`用途地域`) to a `ZoningRule`.

The three eligibility flags are:

- `juutaku` - 住宅宿泊事業法, normally max 180 days/year
- `tokku` - 国家戦略特区, unlimited days in special zones
- `ryokan` - 旅館業許可, unlimited days with permit

Industrial zones (`工業地域`, `工業専用地域`) are always `NG`.

## Data Pipeline

The scraper lives at `YADOKARI/scraper/` and writes to:

```text
YADOKARI/yadokari-app/public/data/minpaku_listings.json
```

Useful commands:

```bash
cd YADOKARI/scraper
pip install -r requirements.txt
python main.py
python main.py --prefecture 大阪府
python main.py --dry-run
python test_geocoder.py
```

Pipeline:

1. `prefectures.py` defines prefecture data sources.
2. `fetcher.py` downloads and normalizes CSV/Excel/CKAN sources.
3. `geocoder.py` calls the 国土地理院住所検索API with caching.
4. `main.py` orchestrates and protects against suspiciously small overwrites.

GitHub Actions scraper workflow runs monthly and commits updated JSON when counts change.

## Working Notes

- Preserve user or generated changes. This repository often has many modified and untracked files.
- Prefer small, focused fixes and verify with lint/typecheck/build.
- When editing frontend surfaces, check both desktop header and mobile bottom navigation.
- Keep `/properties` for property search and `/search` for area search; avoid sending tag filters to `/search`.
- Avoid introducing backend-only assumptions into static/DB-fallback code paths.

## Codex Operations Ownership

The intended operating model is that, after deployment, Codex will be the primary maintainer/operator for this site. Changes should therefore optimize for:

- clear runbooks and checklists under `YADOKARI/docs/`
- safe fallback behavior when external services are not configured
- repeatable verification commands
- explicit environment-variable requirements
- small, auditable changes that future Codex sessions can understand quickly

When adding operationally important behavior, update the relevant docs in the same change.

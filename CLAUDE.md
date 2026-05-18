# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

YADOKARI is a Japanese real estate search portal specializing in properties eligible for **民泊 (minpaku / short-term rental)** operation under Japan's Housing Accommodation Business Act (住宅宿泊事業法) and Inn Business Act (旅館業法). It auto-classifies properties by rental type and provides a revenue simulator.

The Next.js app lives at `YADOKARI/yadokari-app/`. All commands below should be run from that directory.

## Commands

```powershell
cd YADOKARI\yadokari-app

npm run dev       # Start dev server at http://localhost:3000
npm run build     # Production build
npm run start     # Serve production build
npm run lint      # ESLint
```

No test suite exists yet (Phase 1). First-time setup on Windows requires deleting a broken `node_modules` folder with `rmdir /s /q node_modules` before running `npm install`.

## Architecture

The app is **entirely static in Phase 1** — there is no backend, database, or API calls. All data comes from a 10-property mock dataset.

### Data flow

```
lib/data/properties.ts   ← mock Property[] array, searchProperties(), getPropertyById()
        ↓ calls
lib/minpaku.ts           ← getMinpakuInfo(zoning, isTokkuArea) → MinpakuInfo
                            getMinpakuBadgeType(info) → MinpakuType (JUUTAKU|TOKKU|RYOKAN|NG)
lib/simulator.ts         ← simulate(SimulatorInput) → SimulatorOutput (yield, profit, etc.)
```

`MinpakuType` is the core domain enum. The badge/color maps (`MINPAKU_TYPE_LABELS`, `MINPAKU_TYPE_COLORS`) are co-located in `lib/minpaku.ts`.

### Pages (Next.js App Router)

| Route | File | Notes |
|-------|------|-------|
| `/` | `app/page.tsx` | Hero + `SearchForm` |
| `/search` | `app/search/page.tsx` | Server shell wrapping `SearchResultsClient` in `<Suspense>` |
| `/search` (client) | `app/search/SearchResultsClient.tsx` | URL search params → `searchProperties()` → sorted `PropertyCard` grid |
| `/property/[id]` | `app/property/[id]/page.tsx` | Static params from `PROPERTIES`; `generateStaticParams` pre-renders all 10 |

### Key components

- `SearchForm` — submits to `/search` via URL query params (keyword, prefecture, layout, minpakuType, maxRent)
- `PropertyCard` — card grid item linking to property detail
- `MinpakuBadge` — color-coded badge using `MINPAKU_TYPE_COLORS`
- `RevenueSimulator` — slider UI calling `simulate()` client-side; takes `propertyRent` and `maxDays` as props
- `MapEmbed` (`app/property/[id]/MapEmbed.tsx`) — Leaflet.js map, client component loaded dynamically to avoid SSR issues

### Minpaku eligibility logic

`lib/minpaku.ts` maps each Japanese zoning category (`用途地域`) to a `ZoningRule`. The three eligibility flags are:
- `juutaku` — 住宅宿泊事業法 (max 180 days/year)
- `tokku` — 国家戦略特区 (unlimited days, special zones only; requires `isTokkuArea=true` unless zoning is already "possible")
- `ryokan` — 旅館業許可 (unlimited days, requires permit)

Industrial zones (`工業地域`, `工業専用地域`) are always `NG`.

## Data pipeline (scraper)

The scraper lives at `YADOKARI/scraper/` and outputs to `YADOKARI/yadokari-app/public/data/minpaku_listings.json`.

```bash
cd YADOKARI/scraper
pip install -r requirements.txt

# Run for all prefectures
python main.py

# Run for one prefecture only (fast test)
python main.py --prefecture 大阪府

# Dry run (no file output)
python main.py --dry-run

# Test geocoder against live API
python test_geocoder.py
```

**How it works:**
1. `prefectures.py` — list of 14 prefecture data sources (CSV/Excel/CKAN API)
2. `fetcher.py` — downloads + normalises each source into `{address, permit_number, permit_date, name}`
3. `geocoder.py` — calls 国土地理院住所検索API (free, no key) in serial with 300ms delay; results cached in `.cache/`
4. `main.py` — orchestrates + writes JSON; skips overwrite if new data < 50% of previous (safety guard)

**GitHub Actions:** `.github/workflows/scraper.yml` runs on the 1st of every month at 09:00 JST and commits the updated JSON if counts change.

**Adding new prefectures:** add an entry to `PREFECTURE_SOURCES` in `prefectures.py`. Use `type: "csv_url"` for direct CSV links, `type: "excel_url"` for Excel, or `type: "api"` for CKAN-based open data portals.

## Phase 2 migration plan

The next phase adds a real database. The planned stack:
- **Supabase** (PostgreSQL + PostGIS) with a `properties` table using `GEOGRAPHY(POINT, 4326)` for geo queries
- **Prisma** ORM (`prisma/schema.prisma` — not yet created)
- **Vercel** deployment with `buildCommand: "prisma generate && next build"`
- External data: 国土交通省 不動産情報ライブラリ API (free, needs API key), 国土数値情報 用途地域GIS (free shapefiles for zoning lookup)

See `docs/api-integration-guide.md` for the full Prisma schema, PostGIS index setup, and Python scraper architecture.

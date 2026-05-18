# YADOKARI

YADOKARI is a Japanese minpaku research and property search portal. It supports address-based minpaku eligibility checks, property search, competition mapping from public minpaku listing data, revenue simulation, area SEO pages, contact/leads, property submission, and paid-plan flows.

## App

The Next.js app is in `yadokari-app/`.

```powershell
cd YADOKARI\yadokari-app

npm install
npm run dev
```

Open `http://localhost:3000`.

## Verification

Use these commands before handing off changes:

```powershell
npm run lint
npx tsc --noEmit
npm run build
```

`npm run build` runs `prisma generate && next build`. On Windows, if Prisma fails with an `EPERM` rename error for `query_engine-windows.dll.node`, stop the running `next dev` process and rerun the build.

## Environment

Copy `yadokari-app/.env.local.example` to `.env.local` when using database, auth, payment, or email integrations.

Main variables:

- `DATABASE_URL` for Prisma/PostgreSQL
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_STANDARD_PRICE_ID`
- `STRIPE_PRO_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `CONTACT_EMAIL`
- `NEXT_PUBLIC_SITE_URL`

The app still works without `DATABASE_URL` by falling back to the local mock property dataset.

## Structure

```text
YADOKARI/
├── docs/
│   ├── api-integration-guide.md
│   ├── design.md
│   ├── log.md
│   ├── progress.md
│   └── ux-review.md
├── scraper/
│   ├── fetcher.py
│   ├── geocoder.py
│   ├── main.py
│   └── prefectures.py
└── yadokari-app/
    ├── app/
    ├── components/
    ├── lib/
    ├── prisma/
    └── public/data/minpaku_listings.json
```

## Main Routes

| Route | Purpose |
| --- | --- |
| `/` | Main landing and product surface |
| `/check` | Address/URL minpaku eligibility checker |
| `/properties` | Property search and tag filtering |
| `/search` | Area search and investment-area comparison |
| `/property/[id]` | Property detail, map, simulator, related properties |
| `/map` | Competition map from public minpaku listing data |
| `/area` and `/area/[prefecture]/[ward]` | Area SEO pages |
| `/blog` | Minpaku guide articles |
| `/pricing` | Plan selection |
| `/dashboard` | User dashboard |
| `/submit-property` | Property listing submission |
| `/contact` | Contact form |

`/listings` redirects to `/map`.

## Core Data Flow

```text
lib/data/properties.ts
  local Property[] dataset and search helpers
        ↓
lib/properties-service.ts
  Prisma-backed access when DATABASE_URL exists,
  mock fallback when it does not
        ↓
app/api/properties/*
  API routes for property list/detail access

lib/minpaku.ts
  zoning-based eligibility rules

lib/simulator.ts
  revenue and yield calculations
```

## Prisma

Schema: `yadokari-app/prisma/schema.prisma`

Useful commands:

```powershell
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:studio
```

The seed script loads `lib/data/properties.ts` into the `Property` table.

## Scraper

The scraper updates `yadokari-app/public/data/minpaku_listings.json`.

```bash
cd YADOKARI/scraper
pip install -r requirements.txt

python main.py
python main.py --prefecture 大阪府
python main.py --dry-run
python test_geocoder.py
```

Pipeline:

1. `prefectures.py` defines public data sources.
2. `fetcher.py` downloads and normalizes CSV/Excel/CKAN data.
3. `geocoder.py` geocodes addresses with the 国土地理院住所検索API and cache.
4. `main.py` writes JSON and avoids overwriting existing data when the new count is suspiciously small.

## Domain Notes

`lib/minpaku.ts` is the source of truth for minpaku eligibility:

- `JUUTAKU`: 住宅宿泊事業法, usually max 180 days/year
- `TOKKU`: 国家戦略特区民泊, special-zone unlimited operation
- `RYOKAN`: 旅館業許可
- `NG`: not suitable by current zoning rule

Industrial zones are treated as `NG`.

# YADOKARI Deploy Readiness Runbook

Last updated: 2026-05-23

## Goal

Bring the app to a deployable state with repeatable checks, safe fallbacks, and post-deploy visibility.

## 2026-05-23 Production Snapshot

Verified production:

```text
https://yadokari-minpaku.jp
```

Checks completed:

- Production `/api/health` returned `ok: true` and `status: "ok"`.
- Production smoke test passed against `https://yadokari-minpaku.jp`.
- Search Console ownership is verified with DNS TXT.
- Search Console URL inspection showed the top page is indexed and served over HTTPS.
- Resend domain authentication and production contact email delivery are configured.
- The mock property marketplace is gated with `NEXT_PUBLIC_PROPERTY_MARKETPLACE_ENABLED=false`.
- `/properties` and individual `/property/*` mock URLs are omitted from the sitemap while the marketplace is gated.
- Daily Codex health monitoring is scheduled for 09:00 JST and should notify only on failures.
- GA4 code support is deployed, but tracking stays disabled until `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set.

Remaining launch tasks:

- Submit `https://yadokari-minpaku.jp/sitemap.xml` in Google Search Console if it has not been submitted from the UI.
- Create or confirm a GA4 web data stream, then set `NEXT_PUBLIC_GA_MEASUREMENT_ID` in Vercel Production and redeploy.
- Run a small live Stripe purchase/refund check before actively selling paid reports.
- Rotate any secrets that were ever pasted into files, docs, screenshots, or chat.
- Keep the mock marketplace gated until real listings are reviewed and ready for publication.
- Confirm Supabase backup/PITR settings for the production database.

## 2026-05-20 Post-Deploy Snapshot

Verified deployment:

```text
https://yadokari-app.vercel.app
```

Checks completed:

- `npm run predeploy` passed locally.
- Production smoke test passed against `https://yadokari-app.vercel.app`.
- `/api/health` returned `ok: true` and `status: "degraded"`.
- Health details: `email: false`; site URL, Supabase, database, Stripe, and listings were configured.
- Latest Vercel deployment was `Ready`.
- `NEXT_PUBLIC_SITE_URL` is set to `https://yadokari-minpaku.jp` in Vercel production.
- Sitemap, robots, OGP, and JSON-LD URLs are generated from `NEXT_PUBLIC_SITE_URL`.

Remaining launch tasks:

- Configure `RESEND_API_KEY` in Vercel so lead/contact email delivery is active.
- Confirm `CONTACT_EMAIL` is set in Vercel production.
- Configure DNS for `yadokari-minpaku.jp`; Vercel recommends `A yadokari-minpaku.jp 76.76.21.21` and `A www.yadokari-minpaku.jp 76.76.21.21`.
- Re-run production smoke after DNS propagation and email setup.

## Predeploy Command

Run from `YADOKARI/yadokari-app`:

```powershell
npm run predeploy
```

This runs:

1. `npm run lint`
2. `npm run typecheck`
3. `tsx scripts/predeploy-check.ts`
4. `npm run build`

Local runs warn on missing production integrations. Vercel/CI runs fail when required production environment is missing.

To enforce production environment locally:

```powershell
$env:ENFORCE_DEPLOY_ENV="true"
npm run predeploy
```

## Required Before Public Launch

- `NEXT_PUBLIC_SITE_URL`
- Supabase project and auth settings
- `DATABASE_URL`
- Stripe live keys and price IDs
- Stripe webhook secret
- Resend API key
- `CONTACT_EMAIL`

See `docs/production-integrations.md` for service-by-service setup.

The app can still build without optional integrations, but paid checkout and email delivery stay in fallback/preparation mode.

## Health Check

After deploy:

```text
https://yadokari-minpaku.jp/api/health
```

Expected shape:

```json
{
  "ok": true,
  "status": "ok",
  "checks": {
    "siteUrl": true,
    "supabase": true,
    "database": true,
    "stripe": true,
    "email": true,
    "listings": true
  }
}
```

`status: "degraded"` means the app is serving but at least one production integration is not configured.

## Smoke Test

Against local dev server:

```powershell
cd YADOKARI\yadokari-app
npm run dev
npm run smoke
```

Against production:

```powershell
$env:SMOKE_BASE_URL="https://yadokari-minpaku.jp"
npm run smoke
```

The smoke test checks:

- top page
- property search
- checker
- address report
- report-context pricing page
- address-prefilled contact page
- health API
- OpenGraph image

## Launch Smoke Test

1. `/` loads and header/footer are clean.
2. `/check` can check `東京都港区六本木`.
3. Result page links to `/report?address=...`.
4. `/report` shows free preview.
5. `/pricing?source=report&address=...` shows report-context upsell.
6. `/contact?address=...` pre-fills the address and message.
7. `/api/health` returns `ok: true`.
8. `/opengraph-image` renders a 1200x630 image.

## Codex Operations

Codex should own:

- Monthly listing data verification after scraper runs.
- Health check review after deploys.
- Pricing and checkout smoke tests when Stripe keys change.
- Report conversion copy and UI iteration.
- Build/lint/typecheck before any deploy.

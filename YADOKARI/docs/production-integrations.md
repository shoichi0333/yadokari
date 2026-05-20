# Production Integrations

Last updated: 2026-05-20

This document lists the external services required for a full YADOKARI production launch.

## Vercel

Set the project root to:

```text
YADOKARI/yadokari-app
```

Build command:

```text
npm run predeploy
```

Output directory:

```text
.next
```

Current production alias:

```text
https://yadokari-app.vercel.app
```

Post-deploy status on 2026-05-20:

- Vercel production deployment is `Ready`.
- `npm run smoke` passes against `https://yadokari-app.vercel.app`.
- `/api/health` returns `status: "degraded"` because email delivery is not configured.
- `NEXT_PUBLIC_SITE_URL` is set to `https://yadokari-minpaku.jp`.
- Sitemap, robots, OGP, and JSON-LD canonical URLs point to `https://yadokari-minpaku.jp`.
- `yadokari-minpaku.jp` and `www.yadokari-minpaku.jp` are attached to the Vercel project but DNS is not configured yet.

To activate `yadokari-minpaku.jp`, set these DNS provider records:

```text
A yadokari-minpaku.jp 76.76.21.21
A www.yadokari-minpaku.jp 76.76.21.21
```

Alternatively, change nameservers to:

```text
ns1.vercel-dns.com
ns2.vercel-dns.com
```

## Environment Variables

Required for public production:

```text
NEXT_PUBLIC_SITE_URL=https://yadokari-minpaku.jp
```

Recommended for full product behavior:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=
STRIPE_SECRET_KEY=
STRIPE_STANDARD_PRICE_ID=
STRIPE_PRO_PRICE_ID=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
CONTACT_EMAIL=
```

## Supabase

Purpose:

- authentication
- Prisma/PostgreSQL production data
- saved reports, check history, favorites, subscriptions, and property listings persistence

Required values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL`

Use Supabase's Transaction pooler / IPv4 compatible connection string for `DATABASE_URL` when deploying to Vercel.

After setting `DATABASE_URL`, run:

```powershell
npm run db:migrate
npm run db:seed
```

Current Prisma-backed user data:

- `User`
- `Subscription`
- `Favorite`
- `CheckHistory`
- `SavedReport`
- `Inquiry`
- `PropertyListing`

Client fallback behavior:

- Check history and saved reports still work through localStorage when DB is not configured.
- Logged-in users sync check history to `/api/check-history`.
- Logged-in paid users sync saved reports to `/api/reports`.

## Stripe

Products:

- Standard: `2,980円 / month`
- Pro: `9,800円 / month`

Required values:

- `STRIPE_SECRET_KEY`
- `STRIPE_STANDARD_PRICE_ID`
- `STRIPE_PRO_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET`

Webhook endpoint:

```text
https://yadokari-minpaku.jp/api/webhook/stripe
```

Required webhook events:

```text
checkout.session.completed
customer.subscription.updated
customer.subscription.deleted
```

Security notes:

- `/api/checkout` only accepts price IDs matching the configured plan.
- checkout `successUrl` and `cancelUrl` must match `NEXT_PUBLIC_SITE_URL`.
- checkout sessions and subscriptions both receive `planType` metadata.

## Resend

Purpose:

- contact form delivery
- lead capture notifications

Required values:

- `RESEND_API_KEY`
- `CONTACT_EMAIL`

Without these values, the app returns success for local/demo flows and logs fallback messages.

## Post-Setup Verification

After all variables are set:

```powershell
npm run predeploy
$env:SMOKE_BASE_URL="https://yadokari-minpaku.jp"
npm run smoke
```

Then open:

```text
https://yadokari-minpaku.jp/api/health
```

Expected production status:

```text
status: ok
```

# YADOKARI Monetization Gates - 2026-05-25

This note records the production paywall boundaries introduced for the first paid-plan launch.

## Plan Limits

| Feature | Free | Standard | Pro |
| --- | --- | --- | --- |
| Minpaku checks | 3 per day | 100 per day | Unlimited |
| Check history | 3 items | 50 items | Unlimited |
| Saved reports | Not available | 50 reports | Unlimited |
| Favorites | 3 items | Unlimited | Unlimited |
| Property listings | Not available | Not available | 5 listings |
| Revenue simulator | Basic | Detailed | Detailed |
| Property analysis | Locked | Available | Available |
| Map advanced tools | Locked | Available | Available |

## Route Rules

- `/check`: free users can run 3 checks per day. Paid users get higher or unlimited daily usage.
- `/report`: free users see the preview. Detailed revenue, competition, and practical checklists are paid.
- `/properties`: external property links stay free. YADOKARI analysis actions are paid.
- `/map`: map viewing stays free. Advanced filters, area comparison, and PDF/print export are paid.
- `/dashboard`: login is required for saved user data. Saved reports are paid-only.
- `/favorites`: login is required for saved check/history surfaces.
- `/submit-property`: property listing submissions require a logged-in Pro user. Submitted listings are stored as `PENDING` and are not public until reviewed and marked `ACTIVE`.
- `/admin/listings`: admin-only review surface for `PropertyListing` submissions. Admin access is controlled by `ADMIN_EMAILS`, falling back to `CONTACT_EMAIL` when `ADMIN_EMAILS` is omitted.

## Current Enforcement Level

The first launch now enforces daily check usage in `/api/check-minpaku`.

- Logged-in Supabase users are identified by the request Bearer token and limited by their stored plan.
- Anonymous users are limited by a hashed IP + user-agent fingerprint.
- Production with `DATABASE_URL` records usage in the `CheckUsage` table.
- Local or degraded environments without `DATABASE_URL` fall back to an in-memory limiter.
- The browser localStorage counter remains only for immediate UX feedback.

The DB-backed limiter is the production source of truth. The in-memory fallback is intentionally best-effort and should not be treated as durable abuse protection.

## Verification Checklist

- `npm run lint`
- `npm run typecheck`
- `npm run predeploy`
- `SMOKE_BASE_URL=<target> npm run smoke`
- Browser-check `/check`, `/report`, `/properties`, `/map`, `/dashboard`, `/favorites`, and `/pricing?source=check`.

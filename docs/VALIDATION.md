# Workspace 2.0 validation

Validated on 13 September 2026 using fictional local data. Production Neon, hosted services, real merchant transactions and physical printers were not accessed.

## Automated checks

- Backend: 19 passing API, migration and payment tests. Includes roles/tenant isolation, server prices, idempotent daily order numbers, legacy schema upgrades, tax/discount/KOT, reservations crossing midnight, table release, request reassignment, captured-payment verification and signed webhook retries.
- Frontend: 7 passing tests. Covers protected deep links, URL-based order loading, receipt rendering, discount writes, explicit payment confirmation and visible API failure messages.
- Production React build: successful.
- Chromium browser workflow against the built frontend and demo API: passed, with no uncaught browser exceptions or unexpected server 500s.

## Browser acceptance completed

| Flow | Result |
|---|---|
| Admin sign-in; all dashboard URLs load directly | Passed |
| Failed order save preserves the cart; retry creates one order | Passed |
| Orders → POS order UUID; reload and Back/Forward | Passed |
| Additional KOT appears on the saved bill | Passed |
| Kitchen queued → preparing → ready | Passed |
| Waiter availability, payment verification and completion | Passed |
| Guest menu/cart; cart reload; own-order tracking | Passed |
| Guest payment request and waiter assistance request | Passed |
| Waiter completes the guest request | Passed |
| Mobile viewport width and navigation closing | Passed |
| Restaurant registration → account setup URL | Passed |
| Super-admin restaurant dashboard | Passed |

Screenshots in `previews/` are actual renders of this demo, not design mockups. Stock menu images are included for the fictional demo so it can be shown without an external image connection. Production menus retain their configured image URLs.

## Owner setup remaining

Configure the real backend environment, back up/preflight the database and run `npm run db:migrate` / `npm run db:check`. Sign in again after updating. Set the frontend API origin and backend CORS origins for your host. Verify the actual printer and, if desired, Razorpay test credentials/webhook delivery.

The automated payment-provider responses are mocked. Test-mode checkout is implemented but has not been exercised with your merchant account. Live marketplace settlement, refunds, historical payment reconciliation and expired guest-session recovery remain outside this release.

# Stripe Integration — TODO

Implements **TODO.md → Phase 5.5 (Stripe Payment Integration)**. Task IDs S0–S12 match TODO.md.
Architecture: conforms to master `architecture.md` → **"Payments: Stripe"** — plain `fetch` to the
Stripe REST API (no SDK), secret key server-only, publishable key as a Workers Builds **build**
variable, webhook signature verified via Web Crypto, and **the webhook (not the redirect) is the
source of truth for fulfilment**.

Each task is ONE gate cycle: plan → approval → build → test → commit+push approval.

---

## The pricing model — CANONICAL (S0 resolved)

> **S0 decision:** pricing and feature tiers are **as built in the code**
> (`src/components/add-service/MembershipStep.tsx`, `src/app/dashboard/plans/page.tsx`).
> TODO.md's old Standard $100 / Premium $200 / "Premium = 10 listings" spec values are dead.

| Tier | Monthly | Annual ("2 months free") | Stripe objects |
|---|---|---|---|
| Basic | Free | Free | **None** — bypasses Stripe |
| Professional | $25/mo | $250/yr | 1 product, 2 recurring prices |
| Premier | $50/mo | $500/yr | 1 product, 2 recurring prices |
| Verified Badge | $100 one-time | — | 1 product, 1 one-time price |

**Feature/entitlement tiers (as built):**

| Entitlement | Basic | Professional | Premier |
|---|---|---|---|
| Service categories | 1 | up to 3 | unlimited |
| Service areas | HQ city & state only | up to 3 (cities/states/countries) | unlimited (incl. ZIP codes) |
| Company description / bio | — | ✓ | ✓ |
| Company logo | — | ✓ | ✓ |
| Contact details on public profile | — | ✓ | ✓ |
| Self-service profile editing | — | ✓ | ✓ |
| Verified Badge | not available | **$100 one-time purchase** | **included free** |
| Star ratings & reviews | — | — | ✓ |
| Preferred search placement | — | — | ✓ |
| Thought leadership posting | — | — | ✓ |
| Media gallery (photos & docs) | — | — | ✓ |

Totals: **3 products, 5 prices, 1 webhook endpoint, 2 API keys + 1 signing secret → 8 env vars.**

---

## Phase A — Decisions

- [x] **Task S0 — Finalize canonical price/tier table.** ✅ **Resolved: use the as-built
      pricing and feature tiers** (tables above). Tier names Basic/Professional/Premier;
      $25/$250 and $50/$500; badge $100 one-time (Professional only — included with Premier);
      category/area limits 1 / 3 / unlimited.

## Phase B — Stripe Dashboard setup (manual, user-performed)

> Do everything in **Test mode** first (toggle top-right at dashboard.stripe.com). Test and live
> modes have completely separate keys, products, prices, and webhooks — Phase F repeats this in
> live mode.

- [ ] **B1 — API keys:** Developers → API keys. Copy **Publishable key** (`pk_test_*`) and reveal
      **Secret key** (`sk_test_*`).
- [ ] **B2 — Products + prices:** Product catalog → + Add product, three times:
  - [ ] **Professional** — Recurring $25.00/month; + Add another price: Recurring $250.00/year.
        Copy both Price IDs (`price_*`).
  - [ ] **Premier** — Recurring $50.00/month; + Add another price: Recurring $500.00/year.
        Copy both Price IDs.
  - [ ] **Verified Badge** — One-off $100.00. Copy Price ID.
  - No coupon needed for "2 months free" — the discount is baked into the annual amounts.
- [ ] **B3 — Webhook endpoint:** Developers → Webhooks → + Add endpoint.
  - URL: `https://partnerportal.gmaadmin001.workers.dev/api/stripe-webhook`
  - Events: `checkout.session.completed`, `customer.subscription.updated`,
    `customer.subscription.deleted`, `invoice.payment_failed`
  - After saving: Reveal **Signing secret** → copy `whsec_*`.
- [ ] **B4 — Billing settings (drives Suspended state, S11):** Settings → Billing →
      Subscriptions and emails → Manage failed payments: keep **Smart Retries** on; set
      end-of-retries action to **Cancel the subscription** (fires
      `customer.subscription.deleted` → our handler marks the account Suspended).
- [ ] **B5 — Branding + statement descriptor:** Settings → Business → Branding (logo, brand
      color — shown on hosted Checkout). Settings → Business → Public details → statement
      descriptor (e.g. `GLOBALMOBILITY` or `RELOCENTRA`).

## Phase C — Environment variables (Task S1)

- [ ] **C1 — Local `.dev.vars`:**

  ```
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
  STRIPE_SECRET_KEY=sk_test_...
  STRIPE_WEBHOOK_SECRET=whsec_...   # from `stripe listen`, not the dashboard endpoint
  STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID=price_...
  STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID=price_...
  STRIPE_PREMIER_MONTHLY_PRICE_ID=price_...
  STRIPE_PREMIER_ANNUAL_PRICE_ID=price_...
  STRIPE_VERIFIED_BADGE_PRICE_ID=price_...
  ```

- [ ] **C2 — Cloudflare production vars:** Workers & Pages → `partnerportal` → Settings →
      Variables & Secrets:

  | Variable | Type |
  |---|---|
  | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | **Plain-text build variable** (inlined into browser bundle at build time — the `NEXT_PUBLIC_*` footgun) |
  | `STRIPE_SECRET_KEY` | Encrypted secret |
  | `STRIPE_WEBHOOK_SECRET` | Encrypted secret (the **dashboard** endpoint's `whsec_*`) |
  | 5 × `*_PRICE_ID` | Encrypted secrets |

- [ ] **C3 — Local webhook forwarding:** install Stripe CLI; `stripe listen --forward-to
      localhost:3000/api/stripe-webhook` (prints the local `whsec_*` for `.dev.vars`).

## Phase D — Code

> **Flow reconciliation (2026-06-16):** the old `/add-service` multi-step flow + `MembershipStep`/
> `FinishStep` components were **deleted** (commit `25d337c`) and replaced by a single 4-step
> **`/register`** page (`src/app/register/page.tsx`): (1) Service Type + Category, (2) Company
> Details, (3) Membership (plan + monthly/annual toggle), (4) Create Account. Same Basic/
> Professional/Premier tiers and $25/$250/$50/$500 pricing.
>
> **Chosen model: PAY FIRST — the webhook creates the account.** For paid (Professional/Premier)
> tiers the Supabase account does **not** exist until Stripe confirms payment. This conforms to
> `architecture.md` → "session created ≠ paid; the webhook is the source of truth for fulfilment"
> and avoids unpaid ghost accounts. Because the full registration (arrays of countries/categories,
> etc.) can't ride safely in Stripe metadata, it is stashed server-side in a **`pending_registrations`**
> table and referenced by a single `pending_id` in session metadata.
>
> **Password handling:** paid tiers do **not** collect a password at step 4 (no plaintext carried
> across Checkout). The webhook creates the account and triggers a Supabase **set-password / invite
> email** (reuses the Phase 9 email infrastructure). Step 4 for paid plans becomes a "Review & Pay"
> summary. **Basic (free)** is unchanged: account created directly at step 4 with a password, no Stripe.

- [ ] **Task S2 — `pending_registrations` table + `src/app/api/stripe-checkout/route.ts`:**
  - Migration: `pending_registrations` (all `service_registrations` form fields + chosen
    tier/billing, a generated `id`, `created_at`; service-role/RLS-locked; short-lived). No password.
  - Route: **Basic** → `{ skip: true }` (client runs the current free signup at step 4).
    **Paid** → insert the pending row, then `fetch` `https://api.stripe.com/v1/checkout/sessions`
    (form-encoded, `Authorization: Bearer $STRIPE_SECRET_KEY`), `mode=subscription`, price chosen
    from tier + billing interval, `metadata[pending_id]`. Return the hosted Checkout URL.
  - `success_url` → `/register?status=success&session_id={CHECKOUT_SESSION_ID}`;
    `cancel_url` → `/register?status=cancelled` (returns to the plan step).
- [ ] **Task S3 — `src/app/api/stripe-webhook/route.ts`:** Handles `checkout.session.completed`.
  - Verify `Stripe-Signature` (HMAC-SHA256 via `crypto.subtle`, constant-time compare,
    timestamp tolerance). Failure contract: missing config → warn + return; bad signature → 400.
  - Read `metadata.pending_id` → load the pending row → create the auth user (no password) +
    `service_registrations` row (the finish-registration logic) → persist Stripe customer/
    subscription IDs + status → send the Supabase set-password/invite email → delete the pending row.
  - Idempotent on Stripe event id (Stripe retries); webhook = source of truth, **not** the redirect.
  - Testable locally via `stripe listen` before the production endpoint exists.
- [ ] **Task S11 — Subscription-status model + `Suspended` state:** Persist Stripe
      customer/subscription IDs + status on the registration; handle
      `customer.subscription.updated` / `.deleted` and `invoice.payment_failed` → set
      `Suspended` on lapse/cancel; reactivate on recovery. **Before S7/S8, which key off it.**
- [ ] **Task S7 — Plan entitlement / feature-gating:** Enforce per-tier category/area limits
      (Basic = 1 category + HQ-only area; Professional = 3 categories + 3 areas;
      Premier = unlimited) in dashboard + APIs, not just at checkout.
- [ ] **Task S8 — Field-level tier gating:** Wire the existing plan-gated profile fields
      (logo, bio, core services, photo gallery, etc.) to the **active subscription status**
      instead of the raw `membership_plan` column.
- [ ] **Task S9 — Annual billing wiring:** Route the existing `/register` step-3 Monthly/Annual
      toggle (and `/dashboard/plans`) to the annual Price IDs ($250/yr, $500/yr).
- [ ] **Task S10 — Verified Badge one-time fee:** $100 one-time Checkout line item (or separate
      session) + fulfilment (set badge flag on the listing via webhook). **Professional tier
      only** — Basic can't buy it; Premier gets it included (set the flag automatically on
      Premier activation). Note: the badge *flag* is separate from `is_verified`
      (email-verification, Phase 9) — both gate the public VERIFIED display.
- [ ] **Task S4 — Wire `/register` step 4 (paid path):** Paid plan → call `stripe-checkout` →
      redirect to hosted Checkout. Convert step 4 for paid tiers into a "Review & Pay" summary
      (drop the password field); Basic keeps the current password + direct-signup path.
- [ ] **Task S5 — `/register?status=success` confirmation:** Post-payment landing — "Payment
      confirmed, check your email to set your password." Optionally verify `session_id`
      server-side. (Cancelled returns to the plan step.)
- [ ] **Task S12 — Claim-then-pay model:** Pre-loaded listings must convert to a paid
      subscription before the vendor can edit — claim → checkout → unlock-edit flow
      (distinct from new self-registration checkout; see `VENDOR_CLAIM.md`).

> **Known pre-existing inconsistency to reconcile (not introduced by Stripe):** `/register`
> currently calls `/api/finish-registration` with `userId` (client-side `supabase.auth.signUp`),
> but `finish-registration/route.ts` still expects `email`+`password` and uses
> `auth.admin.createUser`. The S2/S3 work will share/realign this account-creation logic.

## Phase E — QA

- [ ] **Task S6 — End-to-end QA (test mode, card `4242 4242 4242 4242`):**
  - [ ] Basic (free) plan bypasses Stripe entirely — account created at step 4 with password
  - [ ] Professional monthly + annual checkout → account created via webhook + set-password email
  - [ ] Premier monthly + annual checkout → account created via webhook + set-password email
  - [ ] Verified Badge one-time purchase + fulfilment
  - [ ] Failed/cancelled payment → **no account created**, pending row left/expired; returns to plan step
  - [ ] Subscription cancel / payment failure → `Suspended`; gating kicks in (S7/S8)
  - [ ] Claim-then-pay flow unlocks editing only after payment
  - [ ] Bad / replayed / expired webhook signatures rejected; duplicate events idempotent

## Phase F — Go live

- [ ] **F1 —** Repeat Phase B in **Live mode** (new keys, products, prices, webhook endpoint).
- [ ] **F2 —** Swap Cloudflare vars to `pk_live_*` / `sk_live_*` / live `whsec_*` / live
      `price_*` IDs; redeploy (publishable key is build-time — requires a rebuild).
- [ ] **F3 —** One real-card smoke test on the lowest-priced tier; refund via dashboard.

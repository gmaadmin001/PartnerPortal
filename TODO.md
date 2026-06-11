# PartnerPortal — Build Plan

Recreating 3 WordPress pages in React/Tailwind (Next.js 16, Cloudflare Workers, Supabase).
Priority order: /register → /add-service → /services-page.

Each task below is ONE gate cycle: plan → approval → build → test → commit+push approval.
Do NOT start the next task until the previous Gate 2 is approved and committed.

**Current status:** Phase 1 ✅ Phase 2 ✅ Phase 3 ✅ Phase 3.5 ✅ Phase 4 ✅ Phase 5 ✅ Phase 6 ✅ Phase 8 ✅ complete. Next up: Phase 5.5 — Stripe payment integration (blocked: waiting on Stripe account details). Phase 9 (production email) also pending.

---

## PHASE 1 — Project Scaffolding ✅

### Task 1: Initialize Next.js project ✅

> **Actual:** Next.js 16.2.7 / React 19.2.4 installed (not 15 as originally planned — 16 was latest stable).
> Tailwind v4 used — no `tailwind.config.ts`; CSS uses `@import "tailwindcss"` in `globals.css`.
> `create-next-app` can't init in a directory with capital letters; was scaffolded in `partner-portal/` subdirectory then moved to root.

- [x] Run `npx create-next-app@latest` with TypeScript, ESLint, Tailwind, `src/`, App Router, `@/*` alias
- [x] Confirm generated files: `package.json`, `tsconfig.json`, `src/app/layout.tsx`, `src/app/page.tsx`
- [x] Remove boilerplate — `src/app/page.tsx` now redirects `/` → `/register`; `globals.css` cleaned
- [x] Update `layout.tsx` metadata to GMA branding
- [x] AGENTS.md retained at root (Next.js 16 auto-generated — contains breaking-change notes)

---

### Task 2: Configure Cloudflare Workers via @opennextjs/cloudflare ✅

> **Actual:** `@opennextjs/cloudflare` 1.19.11, `wrangler` 4.98.0 installed.
> `open-next.config.ts` required (separate from `next.config.ts`).
> Deploy script uses `opennextjs-cloudflare deploy` not `wrangler deploy`.
> **Known issue:** Next.js 16 deprecated `middleware.ts` in favour of `proxy.ts`, but OpenNext 1.19.11
> doesn't support `proxy.ts` (proxy runs on Node.js runtime; OpenNext requires Edge). Keeping
> `middleware.ts` until OpenNext ships compatibility. Deprecation warning in build is non-blocking.

- [x] Install `@opennextjs/cloudflare` and `wrangler` as dev dependencies
- [x] Create `wrangler.jsonc` — worker name `partner-portal`, `compatibility_date: 2026-06-06`, flags `nodejs_compat` + `global_fetch_strictly_public`, assets binding
- [x] Create `open-next.config.ts` with `defineCloudflareConfig({})`
- [x] Add scripts to `package.json`: `preview`, `deploy`, `cf-typegen`
- [x] Add `.dev.vars`, `.open-next/`, `.wrangler/` to `.gitignore`
- [x] Create `.dev.vars.example` with three placeholder keys
- [x] Build verified: `opennextjs-cloudflare build` passes, worker saved to `.open-next/worker.js`

---

### Task 3: Connect GitHub repo to Cloudflare Workers Builds ✅ (pre-existing)

> **Actual:** GitHub → Cloudflare connection was already set up before this project started.
> Workers URL: `partnerportal.gmaadmin001.workers.dev`
> Task 3 was skipped entirely.

- [x] Cloudflare Workers project exists and is connected to `gmaadmin001/PartnerPortal`
- [x] Deploy branch: `main` — every push to main triggers a build and deploy

---

## PHASE 2 — Supabase Setup ✅

### Task 4: Create and connect Supabase project ✅

> **Actual:** Supabase project already existed (`PartnerPortal`, `fwiudagfnntuwqhglkdi`, `us-west-1`).
> New Supabase key format introduced: `sb_publishable_*` (anon) and `sb_secret_*` (service role).
> URL: `https://fwiudagfnntuwqhglkdi.supabase.co`

- [x] Supabase project confirmed via MCP (`list_projects`, `get_project_url`)
- [x] `.dev.vars` populated with all three keys for local development
- [x] **MANUAL — DONE:** Cloudflare Dashboard → `partnerportal` → Build → Variables and secrets:
  - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` → plain text build variables ✅
  - `SUPABASE_SERVICE_ROLE_KEY` → encrypted secret (runtime only) ✅

---

### Task 5: Supabase client setup (three roles) ✅

> **Actual:** `server-only` package also installed to guard the service-role client from accidental
> client-side imports. `@supabase/ssr` 0.10.3, `@supabase/supabase-js` 2.107.0.
> Route protection (Task 19) was implemented here in `middleware.ts` — Task 19 can be skipped.

- [x] Install `@supabase/supabase-js`, `@supabase/ssr`, `server-only`
- [x] `src/lib/supabase/client.ts` — browser anon client (`createBrowserClient`)
- [x] `src/lib/supabase/server.ts` — SSR cookie client (`createServerClient`, async, reads `cookies()`)
- [x] `src/lib/supabase/service.ts` — service-role client (guarded with `import "server-only"`)
- [x] `src/middleware.ts` — session refresh + `/add-service` route protection (redirects unauthenticated → `/register`)
- [x] Build verified clean (TypeScript passes, no errors)

---

### Task 6: Supabase Auth configuration ✅

- [x] Site URL set: `https://partnerportal.gmaadmin001.workers.dev`
- [x] Redirect URL added: `https://partnerportal.gmaadmin001.workers.dev/auth/callback`
- [x] Email provider confirmed enabled
- [x] Email confirmation: **ON** — users must confirm email before first sign-in; register form will show "Check your email" on sign-up

---

### Task 7: Auth callback route ✅

- [x] `src/app/auth/callback/route.ts` — exchanges Supabase code for session, redirects to `/add-service` on success, `/register?error=auth_callback_error` on failure

---

## PHASE 3.5 — Navbar & Footer Polish (pixel-close to WordPress)

### Navbar ✅
- [x] Logo: replaced text wordmark with `GMA-1.png` via `next/image` (remote pattern added to `next.config.ts`)
- [x] Top accent border: 4px `gma-navy` strip at very top of header
- [x] Nav links right-aligned; ALL CAPS; `gma-navy` default, `gma-primary` on hover
- [x] Left-to-right underline sweep animation on hover (`.nav-link` CSS class in globals.css)
- [x] All nav links → WordPress site URLs; Sign In → WP login page
- [x] Sign In button: `gma-primary` blue (not navy), person icon, hover `gma-blue-mid`
- [x] Note: Sign In will be updated to `/register` (internal) when Phase 4 is built

### Footer ✅
- [x] Polish footer to match WordPress version

---

## PHASE 3 — Shared Shell & Brand

### Task 8: Tailwind brand configuration ✅

> Tailwind v4 — configuration is done in `globals.css` via CSS custom properties and `@theme inline` block.
> Colors extracted from live Elementor kit CSS (`post-10758.css`). Lato weight 800 doesn't exist in
> Google Fonts (available: 100, 300, 400, 700, 900) — using 900 as closest bold.
> Also fixed Cloudflare CI build error in this commit: added `build.command` to `wrangler.jsonc` so
> `wrangler deploy` runs `opennextjs-cloudflare build` first.

- [x] Extract exact GMA brand colors from live site Elementor kit CSS
- [x] Fonts: **Lato** (headings, weights 400/700/900), **Open Sans** (body, 400/500/600/700), **Space Grotesk** (display, 400/500/700)
- [x] Updated `src/app/layout.tsx`: removed Geist, added Lato/Open Sans/Space Grotesk via `next/font/google`
- [x] Updated `src/app/globals.css`: `@theme inline` with 8 GMA color tokens + 3 font tokens; body uses Open Sans 18px; headings use Lato
- [x] Fixed `wrangler.jsonc`: added `build.command` to resolve Cloudflare CI "did you run the build command?" error
- [x] Build verified: `npm run build` ✅, `opennextjs-cloudflare build` ✅

---

### Task 9: Global layout — Navbar and Footer components ✅

- [x] `src/components/layout/Navbar.tsx` — sticky white navbar; wordmark left; nav links center; Sign In pill (gma-navy, rounded-full) right; hamburger + mobile drawer with useState
- [x] `src/components/layout/Footer.tsx` — dark gma-sidebar bg; 3-column grid (brand+contact / sitemap / policies); newsletter form row; bottom bar with copyright + LinkedIn SVG
- [x] `src/app/layout.tsx` — Navbar above `<main>`, Footer below; body bg set to gma-surface
- [x] Build verified: `npm run build` ✅, TypeScript ✅

---

## PHASE 4 — Page 1: /register ✅

### Task 10: Register page — layout and login form ✅

> Architecture: member auth surface (`architecture.md` — Two auth surfaces section).
> Register button → `/add-service` (no separate RegisterForm needed).
> Navbar Sign In now routes to `/register` internally.

- [x] `src/app/register/page.tsx` — centered single-column card, white bg, `force-dynamic`
- [x] `src/components/auth/LoginForm.tsx` — email + password + show/hide toggle, Remember Me, Login button (`gma-primary`), Lost Password? (gray section, `resetPasswordForEmail`), OR divider, Register link → `/add-service`
- [x] Navbar Sign In updated to `/register`
- [x] Visual QA: pixel-matched to WordPress `/login/` page

---

## PHASE 5 — Page 2: /add-service ✅

### Task 11: Service step ✅

> Vendor/Realtor toggle, Primary + Sub Category dropdowns (10 categories, full subcategory map).
> Card: `rounded-3xl shadow-xl max-w-6xl`. StepIndicator full-width with fixed line connection.
> All data held in React state — no per-step Supabase writes.

- [x] `src/app/add-service/page.tsx` — 4-step state manager, all data accumulated, single DB write at Finish
- [x] `src/components/add-service/StepIndicator.tsx` — w-14 circles, 4px line, full-width protrusion, blue overlay extends past active circle
- [x] `src/components/add-service/ServiceStep.tsx` — Vendor/Realtor toggle (hover fill), Primary + Sub Category dropdowns, NEXT gated on all 3 fields

---

### Task 12: Details step ✅

> Company info + contact fields. Countries Served uses custom tag-picker (chips + scrollable list).
> Delivery Model: Direct/Aggregator/Mixed/Franchise/Unknown. Company Size: 1–50/51–500/500+.

- [x] `src/components/add-service/DetailsStep.tsx` — all 12 fields, required validation, PREVIOUS + NEXT

---

### Task 13: Membership Plans step ✅

> Three plan cards: Free ($0), Standard ($100/mo), Premium ($200/mo). Select Plan advances to Finish.

- [x] `src/components/add-service/MembershipStep.tsx` — 3-column card grid, full feature lists, PREVIOUS button

---

### Task 14–16: Finish step + Supabase write ✅

> Password creation with strength bar (red→yellow→green) + 5-item requirements checklist.
> On submit: service-role API creates Supabase Auth user (email_confirm: true, no email loop),
> then inserts full `service_registrations` row. Auth user deleted on DB failure (rollback safety).
> `membership_plan` column added to `service_registrations` via migration.

- [x] `src/components/add-service/FinishStep.tsx` — summary card, email (read-only), password strength meter, Create Account button
- [x] `src/app/api/finish-registration/route.ts` — service-role client, `auth.admin.createUser` + DB insert
- [x] `src/app/dashboard/page.tsx` — full partner dashboard (overview, profile view, profile edit, plans, reviews, settings panels)
- [x] `src/app/dashboard/DashboardClient.tsx` — client shell with sidebar nav, completion meter, edit panel with all fields, plans panel with upgrade/downgrade logic, reviews panel
- [x] Login redirects to `/dashboard` on success
- [x] Dead legacy route `src/app/api/add-service/route.ts` removed (replaced by `finish-registration`)

---

## PHASE 5.5 — Stripe Payment Integration 🔜 BLOCKED

> **Blocked on:** Stripe account credentials + Price IDs for Standard and Premium plans.
> The original WordPress site used Stripe via Shopify for paid plan checkout — that flow is being
> rebuilt natively here.

### Approach: Stripe Checkout (hosted payment page)

- Free plan → skip Stripe entirely, go straight to Finish step (current behaviour)
- Standard / Premium → server creates a Stripe Checkout Session → redirect user to Stripe's hosted page
- After payment: Stripe fires a webhook → our API verifies signature → creates auth account + saves registration
- Webhook verification: HMAC-SHA256 via Web Crypto (Edge-compatible, no Node SDK)

### Tasks — execution order (Gate 1 required for each before building)

> Ordered by dependency: decide prices → create all Stripe objects → checkout/webhook
> plumbing → subscription-status model → entitlement/feature gating → feature slices →
> wire UI → QA last. Task IDs (S0–S12) are stable identifiers; follow the numbered steps
> below for execution order.

1. [ ] **Task S0 — Finalize canonical price/tier table:** Reconcile the stale TODO
   numbers (Standard $100 / Premium $200) against the built UI (Basic free /
   Professional $25 / Premier $50). Lock tier names, monthly + annual amounts, and the
   Verified Badge price. **Prerequisite for everything below** — Stripe products and
   Price IDs depend on it.
2. [ ] **Task S1 — Stripe env vars + create all Stripe objects:** Add env vars to
   Cloudflare (build + runtime) and `.dev.vars`. In one pass, create monthly + annual
   prices per tier, the one-time badge price, and register the webhook endpoint URL to
   obtain `whsec_*` (the URL is known up front, so this works before S3's code exists).

   **Credentials to gather first** — Price IDs only after **S0** finalizes the price table;
   gather every ID in one pass to avoid repeat dashboard trips:
   - [ ] Stripe **Publishable Key** (`pk_live_*` or `pk_test_*`)
   - [ ] Stripe **Secret Key** (`sk_live_*` or `sk_test_*`)
   - [ ] **Monthly** recurring Price ID for each paid tier (`price_*`)
   - [ ] **Annual** recurring Price ID for each paid tier (`price_*`) — feeds the Annual toggle (S9)
   - [ ] **One-time** Price ID for the Verified Badge (`price_*`) — feeds S10
   - [ ] Stripe **Webhook Signing Secret** (`whsec_*`) — from registering the endpoint URL

   **Where to find each key in the Stripe Dashboard:**
   1. **Publishable + Secret Key** — Log in to [dashboard.stripe.com](https://dashboard.stripe.com)
      → **Developers → API keys**. Copy **Publishable key** (`pk_live_*`) and **Secret key**
      (`sk_live_*`). ⚠️ Use **test mode** keys (`pk_test_*` / `sk_test_*`) first — toggle top-left.
   2. **Price IDs** — **Product catalog** (left sidebar). For each paid tier, create/open the
      product and copy the **Price ID** (`price_*`) for **both** its monthly and annual prices;
      also create the **one-time Verified Badge** price. Tier names + amounts come from **S0**
      (don't use the old $100/$200). New product: **+ Add product** → add a **Recurring / Monthly**
      and a **Recurring / Yearly** price per tier; badge = **One-time**.
   3. **Webhook Signing Secret** — **Developers → Webhooks** → **+ Add endpoint**. URL:
      `https://partnerportal.gmaadmin001.workers.dev/api/stripe-webhook`; events:
      `checkout.session.completed` (+ `customer.subscription.*` for S11). After saving, **Reveal**
      the signing secret → copy `whsec_*`. Local dev: `stripe listen --forward-to
      localhost:3000/api/stripe-webhook` prints its own local `whsec_*`.

   **Add to `.dev.vars` (local development):**
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   # One monthly + one annual price ID per paid tier, plus the badge — final names follow S0:
   STRIPE_<TIER>_MONTHLY_PRICE_ID=price_...
   STRIPE_<TIER>_ANNUAL_PRICE_ID=price_...
   STRIPE_VERIFIED_BADGE_PRICE_ID=price_...
   ```

   **Add to Cloudflare Dashboard (production):** Workers & Pages → `partnerportal` → Settings →
   Variables and Secrets.

   | Variable | Type | Value |
   |---|---|---|
   | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | **Plain text build variable** | `pk_live_*` |
   | `STRIPE_SECRET_KEY` | **Encrypted secret** | `sk_live_*` |
   | `STRIPE_WEBHOOK_SECRET` | **Encrypted secret** | `whsec_*` |
   | `STRIPE_<TIER>_MONTHLY_PRICE_ID` (per tier) | **Encrypted secret** | `price_*` |
   | `STRIPE_<TIER>_ANNUAL_PRICE_ID` (per tier) | **Encrypted secret** | `price_*` |
   | `STRIPE_VERIFIED_BADGE_PRICE_ID` | **Encrypted secret** | `price_*` |

   > ⚠️ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` **must** be a build variable (not a runtime secret) —
   > it is inlined into the browser bundle at build time.

3. [ ] **Task S2 — `src/app/api/stripe-checkout/route.ts`:** Creates Checkout Session,
   returns redirect URL.
   - Free plan: returns `{ skip: true }` → client proceeds to Finish
   - Paid plan: `fetch` to `https://api.stripe.com/v1/checkout/sessions` (plain fetch, no SDK)
   - `success_url` → `/add-service?step=finish&session_id={CHECKOUT_SESSION_ID}`
   - `cancel_url` → `/add-service?step=plans`
4. [ ] **Task S3 — `src/app/api/stripe-webhook/route.ts`:** Receives `checkout.session.completed`.
   - Verify Stripe-Signature header (HMAC-SHA256, Web Crypto)
   - Extract metadata (all form data passed as Checkout Session metadata)
   - Call same account-creation logic as current `/api/finish-registration`
   - Build/test locally via `stripe listen` before the production endpoint (S1) is live —
     the handler code and the dashboard registration are independent.
5. [ ] **Task S11 — `Suspended` subscription state:** Add the subscription-status model
   (incl. `Suspended` for lapsed/canceled) and the lifecycle webhooks that drive it
   (`customer.subscription.*`, not just `checkout.session.completed`). **Before** the
   gating tasks, which key off this status.
6. [ ] **Task S7 — Plan entitlement / feature-gating logic:** Enforce per-tier
   service-count limits (Basic = 1, Professional = 3, Premier = unlimited; spec said
   Premium = 10) in the dashboard + APIs, not just at checkout.
7. [ ] **Task S8 — Field-level tier gating:** Gate which profile fields are
   editable/visible per tier (Logo, Company Statement, Reviews, Media Gallery = top tier;
   Contact, Certifications, Countries Served = mid tier). Wire to the active subscription.
8. [ ] **Task S9 — Annual billing wiring:** Route the existing Monthly/Annual toggle
   ($250/yr, $500/yr "2 months free") to the annual Price IDs created in S1.
9. [ ] **Task S10 — Verified Badge one-time fee:** Add the "$100 one-time Verified Badge"
   as a one-time Checkout line item (or separate session) + fulfilment.
10. [ ] **Task S4 — Wire `MembershipStep` + `add-service/page.tsx`:** Route paid plans
    through Stripe Checkout before advancing to Finish.
11. [ ] **Task S5 — Update `FinishStep`:** For paid plans, show "Payment confirmed via
    Stripe" badge; for Free, current flow unchanged.
12. [ ] **Task S12 — Claim-then-pay model:** Pre-loaded/pre-populated listings must
    convert to a paid subscription before the vendor can edit. Plan the claim → checkout
    → unlock-edit flow (distinct from new self-registration checkout).
13. [ ] **Task S6 — Final end-to-end QA:** Test Free (bypass), each paid tier monthly +
    annual (Stripe test card), badge purchase, suspension, and claim-then-pay.

---

## PHASE 6 — Page 3: /services ✅

> **Actual:** Built at `/services` (not `/services-page`). Server-rendered with URL-param driven filters.
> Full provider profile pages at `/services/[slug]`. Review system with edit/delete built here too.

### Task 17: Services page — filter panel ✅

- [x] `src/app/services/page.tsx` + `src/app/services/ServicesClient.tsx`
- [x] `src/components/services/FilterPanel.tsx` — Primary Service (10-category Relocentra taxonomy), Sub-service (dependent dropdown), Country, US State, City, Zip, Industry, Service Scope, Company Size, Company Name, Diversity badges
- [x] Filters encoded as URL params (pipe-separated for values with commas); server-renders results on each navigation
- [x] "Apply Filters" + "Clear All" buttons; compact sidebar mode for results view

---

### Task 18: Services page — results area and provider cards ✅

- [x] `src/components/services/ProviderCard.tsx` — company name, plan badge, verified badge, category, description, HQ, website CTA
- [x] `src/components/services/PhotoCarousel.tsx` — photo gallery component used on profile pages
- [x] `src/components/services/ReviewForm.tsx` — star picker, profanity filter, edit + delete own review
- [x] `src/app/services/[slug]/page.tsx` — full public provider profile: hero, contact sidebar, bio, photo gallery, core services, reviews, review form (non-owners), owner preview banner for pending listings
- [x] `src/app/api/services/route.ts` + `src/app/api/services/[slug]/route.ts` — GET endpoints
- [x] Filter → server query → results wired end-to-end; sub-service filter searches both `sub_category` and `core_services` array

---

## PHASE 7 — Cross-cutting / Cleanup

### Task 19: Auth protection middleware ✅ (completed as part of Task 5)

> `/add-service` protection and session refresh are already implemented in `src/middleware.ts`.
> This task is complete — no further action needed.

- [x] Protect `/add-service` — redirect unauthenticated → `/register`
- [x] Session refresh on every request

---

### Task 20: Environment variable audit + production readiness ✅

- [x] `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` confirmed as Cloudflare **build variables**
- [x] `SUPABASE_SERVICE_ROLE_KEY` confirmed as Cloudflare **encrypted secret** (runtime only)
- [x] Site live and functional at `partnerportal.gmaadmin001.workers.dev`

---

## Context & Decisions Log

| Topic | Decision / Finding |
|---|---|
| Next.js version | 16.2.7 (not 15 — 16 was latest stable at build time) |
| Tailwind version | v4 — config in `globals.css` `@theme` block, no `tailwind.config.ts` |
| React version | 19.2.4 |
| Cloudflare Workers URL | `partnerportal.gmaadmin001.workers.dev` |
| Supabase project | `PartnerPortal`, ID `fwiudagfnntuwqhglkdi`, region `us-west-1` |
| Supabase URL | `https://fwiudagfnntuwqhglkdi.supabase.co` |
| Supabase key format | New format: `sb_publishable_*` (anon) and `sb_secret_*` (service role) |
| middleware.ts vs proxy.ts | Keeping `middleware.ts` — OpenNext 1.19.11 doesn't support Next.js 16's `proxy.ts` (Node.js runtime incompatible with Cloudflare Edge). Deprecation warning is non-blocking. Revisit when OpenNext updates. |
| Cloudflare CI build fix | Added `build.command: npx opennextjs-cloudflare build` to `wrangler.jsonc` — was failing with "did you run the build command?" because CI ran `wrangler deploy` without the build step. |
| Lato weight 800 | Lato on Google Fonts only has 100/300/400/700/900. Using 900 instead of 800. |
| Task 3 | Skipped — GitHub ↔ Cloudflare pipeline was pre-existing |
| Task 19 | Completed early inside Task 5 |
| Portal branding | "Partner Portal" name unresolved — using neutral labels in code |
| Step 2 Details content | Blocked — content not visible on live WordPress site |
| Realtor Service Areas | Defaulting to country-level per live site; confirm before Task 13 |
| Email confirmation | Disabled at account creation — `auth.admin.createUser` with `email_confirm: true` skips email loop; users can sign in immediately after registration |
| wrangler.jsonc name | Changed `partner-portal` → `partnerportal` (no hyphen) — Cloudflare was complaining about the hyphenated name |
| /add-service auth | Guard removed from middleware — unauthenticated users can fill the form; auth enforced at API layer (`finish-registration`) |
| Stripe payments | Planned for Phase 5.5 — using Stripe Checkout (hosted), plain fetch (no SDK), webhook verification via Web Crypto. Blocked on Stripe account details. |
| Dashboard | `/dashboard` is a temporary test/verification page — will evolve into the full partner portal in later phases |

---

## PHASE 8 — Vendor Claim Process ✅

> Allow an existing user (or new registrant) to claim an already-listed vendor profile —
> e.g. a company that was added to the directory by an admin but not yet owned by a portal account.
> See `VENDOR_CLAIM.md` for full operating guide.

### Task 21: Claim a vendor listing ✅

- [x] **DB:** `claimed_by`, `claimed_at`, `claim_status` columns added to `service_registrations`; RLS SELECT policy for users to read their own claim status
- [x] **Claim request flow:** `POST /api/claim` — validates session, checks no active claim, writes via service-role; shown as "Is this your company?" section on ownerless profile pages
- [x] **Admin approval:** `POST /api/admin/approve-claim` transfers `user_id` ownership; `POST /api/admin/reject-claim` clears claim fields
- [x] **Admin UI:** `/admin/claims` — gated to `ADMIN_EMAIL` env var; lists pending claims with approve/reject buttons
- [x] **Unauthenticated claim:** "Claim Listing" links to `/register?claim=<slug>`; LoginForm redirects back to listing after sign-in
- [x] **`ADMIN_EMAIL`** env var documented in `.dev.vars.example` and `VENDOR_CLAIM.md`

---

## PHASE 9 — Production Email (domain auth + app-owned auth emails)

> Currently the portal uses Resend's SMTP with `onboarding@resend.dev` as the sender address.
> This is Resend's sandbox address and can **only** send to the Resend account owner's email
> (`gmaadmin001@gmail.com`). All other recipients are blocked with a `550` error.
> This must be resolved before the portal goes live with real users.
>
> **Two parts:** (A) **Task 22** — authenticate a sending domain so mail is deliverable
> (interim fix; keeps Supabase's built-in mailer). (B) **Tasks E1–E7** — conform to the master
> architecture by moving auth emails into an app-owned Send Email hook + branded EmailJS template,
> per `architecture.md` → "Auth emails delegated to the app." The end state runs (B); (A)'s
> domain authentication is reused by (B).

### Task 22: Verify a custom domain in Resend and update Supabase sender address

**Why it's needed:**
Supabase's built-in email service is hard-capped at 2 emails/hour and cannot be raised.
Resend is configured as the custom SMTP provider, but until a real domain is verified,
password reset and any future auth emails can only reach `gmaadmin001@gmail.com`.

**Prerequisites:**
- A custom domain you own (e.g. `globalmobilityadviser.com`) with DNS managed in Cloudflare or similar
- Access to the Resend dashboard ([resend.com](https://resend.com))
- Access to Supabase → Authentication → SMTP Settings

**Steps:**

1. **Resend — Add and verify the domain**
   - Go to Resend Dashboard → **Domains** → **Add Domain**
   - Enter your domain (e.g. `globalmobilityadviser.com`)
   - Resend will give you DNS records to add (typically 1× TXT for SPF, 1× CNAME for DKIM, optionally 1× MX)
   - In **Cloudflare DNS** (or wherever the domain's DNS is managed), add each record exactly as shown
   - Back in Resend, click **Verify** — green checkmarks confirm SPF and DKIM are live
   - DNS propagation usually takes a few minutes to 1 hour

2. **Supabase — Update the sender email**
   - Supabase Dashboard → **PartnerPortal** → **Authentication** → **SMTP Settings**
   - Change **Sender email address** from `onboarding@resend.dev` to `noreply@yourdomain.com`
     (or `portal@yourdomain.com`, `auth@yourdomain.com` — any address on the verified domain)
   - Leave all other SMTP fields (host, port, username, password/API key) unchanged
   - Click **Save**

3. **Test**
   - Go to `/register` → enter any email → click **Lost Password?**
   - Confirm the reset email arrives in the target inbox (check Spam too)
   - A `200 OK` in Supabase Auth logs with no error = fully working

**Code changes required:** None — the SMTP credentials and `request-reset` API route are already
in place. This is a dashboard-only configuration step.

> **Interim vs. end state:** Task 22's **domain authentication** (SPF/DKIM/DMARC) is permanent —
> the ESP backing EmailJS in Task E1 reuses it. Its **"Update Supabase sender email"** step
> (built-in mailer) is an *interim* deliverability fix and is **superseded** by Task E4: once the
> Send Email hook is active, Supabase delegates auth mail to our route instead of sending it.

### Conform to architecture: app-owned auth emails (tasks E1–E7)

> Implements `architecture.md` → **"Email & messaging" → "Auth emails delegated to the app"**:
> Supabase Auth fires a Send Email hook → an Edge route in our app verifies the signature, maps
> the action type to a branded template, and sends via a shared EmailJS helper. This replaces
> Supabase's built-in templated mailer for auth mail. The same helper later serves claim
> notifications and the dashboard notification toggles. Each task runs its own Gate 1 before building.

- [ ] **Task E1 — Shared EmailJS send helper:** One helper POSTs to a single reusable EmailJS
      template (`https://api.emailjs.com/api/v1.0/email/send`) parameterized by `template_params`
      (subject, greeting, headline, `message_html`, button label/url, footnote). **Fails soft** —
      logs a warning and returns (never throws) if env vars are missing, so a misconfigured
      environment never crashes a request. Point EmailJS's underlying SMTP at the domain
      authenticated in Task 22 so SPF/DKIM/DMARC align.
      Env: `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`, `EMAILJS_PRIVATE_KEY`.
- [ ] **Task E2 — Auth-email webhook Edge route** (`src/app/api/auth-email-hook/route.ts`, Edge
      runtime): verify the Standard Webhooks signature before trusting the payload — HMAC-SHA256
      via Web Crypto (`crypto.subtle`), **constant-time** comparison, **±5-min** timestamp
      tolerance, **multi-signature** support (space-separated `v1,<sig>` for key rotation).
      Secret `SUPABASE_AUTH_HOOK_SECRET` (format `v1,whsec_<base64>`).
- [ ] **Task E3 — Action-type → branded templates:** Map `email_action_type` (`signup`,
      `recovery`, `magiclink`, `email_change`, `invite`) to branded copy; build the provider's
      `/auth/v1/verify?token=…&type=…&redirect_to=…` confirmation URL; send via the E1 helper.
- [ ] **Task E4 — Configure the Supabase Send Email hook:** Dashboard → **Authentication → Hooks**
      → **Send Email Hook** → point to the deployed Edge route URL and set the signing secret.
      Once active, Supabase delegates these emails to our route instead of its built-in mailer.
- [ ] **Task E5 — Env wiring:** Add `EMAILJS_*` and `SUPABASE_AUTH_HOOK_SECRET` to `.dev.vars`
      and Cloudflare (build var vs. encrypted secret as appropriate — keys/secrets stay encrypted).
- [ ] **Task E6 — Reconcile the existing recovery flow:** The current `/api/request-reset` +
      `resetPasswordForEmail` still triggers Supabase, which now fires the hook → our route.
      Confirm the recovery email comes from our branded template; keep the `clear_user_recovery`
      RPC that clears stale tokens first.
- [ ] **Task E7 — QA:** Trigger `recovery` (signup is disabled via `email_confirm: true`, so it's
      lower priority); confirm the branded email arrives from the authenticated domain and lands in
      the inbox (check Spam/Promotions); confirm bad/replayed/expired signatures are rejected.
      A `200` from EmailJS means *accepted for sending*, **not** delivered — verify inbox placement.

## Feedback

- [~] **Plan-gated profile fields:** Public listing now fully gated by plan tier (Basic/Pro/Premier).
      Dashboard profile *editor* fields still need the grey-out + upgrade icon + hover tooltip
      treatment described below — that part is not yet done.
      - **Grey out** the field (disabled/muted styling) rather than showing the real data.
      - Place an **upgrade icon** next to fields that *would* become available if the user
        upgraded, signaling the upgrade path.
      - On **mouse-over** of an upgrade icon, show an **advertisement** (tooltip/popover
        promoting the plan that unlocks that field).
      - Hide outright anything that isn't unlockable via upgrade (don't grey it — just omit).
- [x] **Upgrade button is broken:** Fixed — plans page (`/dashboard/plans`) calls Supabase to
      update `membership_plan` on upgrade/downgrade; slug rotation logic also wired.
- [ ] **Company logo → file upload:** Change the company logo field from a logo **link/URL**
      input to a **file upload** (upload the logo image instead of pasting a URL).
- [x] **Profile Preview URL hardcodes "WORDPRESS":** Fixed — dashboard sidebar "Preview Page"
      link now derives URL from `reg.slug` via `${MAIN_APP}/services/${reg.slug}` and updates
      when the slug changes.
- [ ] **Cloudflare URL → Relocentra:** `Relocentra` will be the URL/domain for the Cloudflare
      deployment.
- [ ] **Menu items → marketing site:** Adjust the menu items to point back to the
      `globalmobilityadviser.com` marketing site.
- [ ] **Recommended icon logic — verify:** Confirm whether the "recommended" icon logic is in
      place (does it exist and work as intended?). Investigate and wire it up if missing.
- [ ] **Discuss with Michael — searcher registration & gating:** Decide on registration for the
      searcher role. Put **search** behind a **Searcher Login**, and gate **Reviews** behind it
      as well.
- [x] **Client Reviews → Release 2 (feature flag):** Done — removed from public listings and
      "Client Reviews" removed from the dashboard sidebar nav entirely. Deferred to R2.
- [ ] **Updated supplier taxonomy (from Michael):** Michael to provide the updated supplier
      taxonomy; apply it once received.
- [ ] **Load suppliers:** Load the supplier data into the system.
- [ ] **Administration Dashboard:** Build an admin/administration dashboard.
- [ ] **Supplier search-appearance count:** Track and surface the number of times a supplier
      came up in a search (search-impression count per supplier).
- [ ] **Monthly metric summary (marketing services):** Provide a monthly metric summary to
      suppliers as a marketing service. Two core metrics:
      - **Search surfacing count** — how many times they surfaced in search results.
      - **Page views** — how many times someone viewed their page.

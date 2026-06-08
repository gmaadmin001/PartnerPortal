# PartnerPortal — Build Plan

Recreating 3 WordPress pages in React/Tailwind (Next.js 16, Cloudflare Workers, Supabase).
Priority order: /register → /add-service → /services-page.

Each task below is ONE gate cycle: plan → approval → build → test → commit+push approval.
Do NOT start the next task until the previous Gate 2 is approved and committed.

**Current status:** Phase 1 ✅ Phase 2 ✅ Phase 3 ✅ Phase 3.5 ✅ Phase 4 ✅ Phase 5 ✅ complete. Next up: Phase 5.5 — Stripe payment integration (blocked: waiting on Stripe account details from boss).

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
- [ ] **MANUAL — STILL NEEDED:** Add to Cloudflare Dashboard → `partner-portal` → Settings → Variables and Secrets:
  - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` → **plain text build variables**
  - `SUPABASE_SERVICE_ROLE_KEY` → **encrypted secret (runtime only)**

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
- [x] `src/app/dashboard/page.tsx` — post-login test page; shows full registration record from DB; Sign Out button
- [x] Login redirects to `/dashboard` on success

---

## PHASE 5.5 — Stripe Payment Integration 🔜 BLOCKED

> **Blocked on:** Stripe account credentials from boss + Price IDs for Standard and Premium plans.
> The original WordPress site used Stripe via Shopify for paid plan checkout — that flow is being
> rebuilt natively here.

### Approach: Stripe Checkout (hosted payment page)

- Free plan → skip Stripe entirely, go straight to Finish step (current behaviour)
- Standard / Premium → server creates a Stripe Checkout Session → redirect user to Stripe's hosted page
- After payment: Stripe fires a webhook → our API verifies signature → creates auth account + saves registration
- Webhook verification: HMAC-SHA256 via Web Crypto (Edge-compatible, no Node SDK)

### What we need from boss before starting

- [ ] Stripe **Publishable Key** (`pk_live_*` or `pk_test_*`)
- [ ] Stripe **Secret Key** (`sk_live_*` or `sk_test_*`)
- [ ] Stripe **Price ID** for Standard plan (`price_*`) — $100/mo recurring
- [ ] Stripe **Price ID** for Premium plan (`price_*`) — $200/mo recurring
- [ ] Stripe **Webhook Signing Secret** (`whsec_*`) — generated when registering webhook endpoint

### Tasks (Gate 1 required for each before building)

- [ ] **Task S1:** Add Stripe env vars to Cloudflare (build + runtime) and `.dev.vars`
- [ ] **Task S2:** `src/app/api/stripe-checkout/route.ts` — creates Checkout Session, returns redirect URL
  - Free plan: returns `{ skip: true }` → client proceeds to Finish
  - Paid plan: `fetch` to `https://api.stripe.com/v1/checkout/sessions` (plain fetch, no SDK)
  - `success_url` → `/add-service?step=finish&session_id={CHECKOUT_SESSION_ID}`
  - `cancel_url` → `/add-service?step=plans`
- [ ] **Task S3:** `src/app/api/stripe-webhook/route.ts` — receives `checkout.session.completed`
  - Verify Stripe-Signature header (HMAC-SHA256, Web Crypto)
  - Extract metadata (all form data passed as Checkout Session metadata)
  - Call same account-creation logic as current `/api/finish-registration`
- [ ] **Task S4:** Update `MembershipStep` + `add-service/page.tsx` — wire paid plans through Stripe Checkout before advancing to Finish
- [ ] **Task S5:** Update `FinishStep` — for paid plans, show "Payment confirmed via Stripe" badge; for Free, current flow unchanged
- [ ] **Task S6:** End-to-end QA — test Free (bypass), Standard (Stripe test card), Premium (Stripe test card)

### Environment variables needed

| Variable | Where | Value |
|---|---|---|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Cloudflare **build variable** | `pk_live_*` |
| `STRIPE_SECRET_KEY` | Cloudflare **runtime secret** | `sk_live_*` |
| `STRIPE_WEBHOOK_SECRET` | Cloudflare **runtime secret** | `whsec_*` |
| `STRIPE_STANDARD_PRICE_ID` | Cloudflare **runtime secret** | `price_*` |
| `STRIPE_PREMIUM_PRICE_ID` | Cloudflare **runtime secret** | `price_*` |

---

## PHASE 6 — Page 3: /services-page

### Task 17: Services page — filter panel

- [ ] Create `src/app/services-page/page.tsx`
- [ ] Create `src/components/services/FilterPanel.tsx`:
  - Service Type, Sub-service, Country, State/Region, Industry, Integration Scope
  - Company Size, Company Name, Zip Code, Certifications, Diversity badges
- [ ] "Search / Apply Filters" + "Clear All" buttons

---

### Task 18: Services page — results area and provider cards

- [ ] Create `src/components/services/ResultsArea.tsx` (count, loading skeleton, empty state)
- [ ] Create `src/components/services/ProviderCard.tsx`:
  - Company Name, Category badges, Short Description, HQ, Website CTA, Premium badge
- [ ] Create `src/app/api/services/route.ts` — GET, anon Supabase client, filter + paginate
- [ ] Wire filter → API → results
- [ ] Pagination (next/prev or load-more)

---

## PHASE 7 — Cross-cutting / Cleanup

### Task 19: Auth protection middleware ✅ (completed as part of Task 5)

> `/add-service` protection and session refresh are already implemented in `src/middleware.ts`.
> This task is complete — no further action needed.

- [x] Protect `/add-service` — redirect unauthenticated → `/register`
- [x] Session refresh on every request

---

### Task 20: Environment variable audit + production readiness

- [ ] Confirm `NEXT_PUBLIC_*` vars set as Cloudflare **build variables** (see Task 4 manual step)
- [ ] Confirm `SUPABASE_SERVICE_ROLE_KEY` is Cloudflare **runtime secret** only
- [ ] Run `npm run preview` locally — verify all three pages load
- [ ] Push to main → confirm Cloudflare build green → smoke test on `partnerportal.gmaadmin001.workers.dev`

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
| Stripe payments | Planned for Phase 5.5 — using Stripe Checkout (hosted), plain fetch (no SDK), webhook verification via Web Crypto. Blocked on Stripe account details from boss. |
| Dashboard | `/dashboard` is a temporary test/verification page — will evolve into the full partner portal in later phases |

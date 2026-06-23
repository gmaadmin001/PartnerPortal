# PartnerPortal — Build Plan

Recreating 3 WordPress pages in React/Tailwind (Next.js 16, Cloudflare Workers, Supabase).
Priority order: /register → /add-service → /services-page.

Each task below is ONE gate cycle: plan → approval → build → test → commit+push approval.
Do NOT start the next task until the previous Gate 2 is approved and committed.

**Current status:** Phase 1 ✅ Phase 2 ✅ Phase 3 ✅ Phase 3.5 ✅ Phase 4 ✅ Phase 5 ✅ Phase 5.5 ✅ Phase 6 ✅ Phase 8 ✅ Phase 9 ✅ complete. S7 ✅ S8 ✅ S12 ✅ Taxonomy ✅ Suppliers loaded ✅. **Admin magic-link auth ✅.** Rebrand (Relocentra) pending post-meeting. S6 + Domain moved to GOLIVETODO.md.

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

1. [x] **Task S0 — Finalize canonical price/tier table:** ✅ **Resolved — use the as-built
   pricing and feature tiers** (Basic free / Professional $25/mo $250/yr / Premier $50/mo
   $500/yr; Verified Badge $100 one-time, Professional only — included with Premier;
   category/area limits 1 / 3 / unlimited). Canonical table lives in `StripeTODO.md`,
   which now tracks the full Phase 5.5 execution plan.
2. [x] **Task S1 — Stripe env vars + create all Stripe objects:** ✅ All price IDs created in Stripe test mode; all env vars added to `.dev.vars` and Cloudflare Worker secrets. Webhook endpoint registered at `/api/stripe-webhook`; `checkout.session.completed`, `customer.subscription.*`, and `invoice.payment_failed` events subscribed.
3. [x] **Task S2 — `src/app/api/stripe-checkout/route.ts`:** ✅ Creates Checkout Session for new paid registrations (`pending_registrations` table) and `dashboard_upgrade` mode (in-place Stripe subscription update for existing subscribers, new Checkout session for Basic→paid).
4. [x] **Task S3 — `src/app/api/stripe-webhook/route.ts`:** ✅ HMAC-SHA256 signature verification (Web Crypto, ±5 min tolerance). Handles `checkout.session.completed` (new registration fulfilment + `dashboard_upgrade` + `verified_badge`), `customer.subscription.updated/deleted`, `invoice.payment_failed`. Orphaned subscription cleanup on upgrade. Sends invite/recovery link email via EmailJS on new registration. Sends admin notification emails (to all rows in `admins` table) on badge purchase.
5. [x] **Task S11 — `Suspended` subscription state:** ✅ `subscription_status` column mapped from Stripe lifecycle events. `customer.subscription.deleted` → `Suspended`; `updated` → mapped status; `invoice.payment_failed` → `past_due`.
6. [x] **Task S7 — Plan entitlement / feature-gating logic:** Enforce per-tier service-count limits in dashboard + APIs.
7. [x] **Task S8 — Field-level tier gating:** Gate profile fields per tier. Wire to active subscription.
8. [x] **Task S9 — Annual billing wiring:** ✅ Monthly/Annual toggle routes to correct annual Price IDs. `isCurrent` checks both plan name AND billing cycle. Same-plan billing switches (monthly↔annual) go through Case A (Stripe in-place update with proration).
9. [x] **Task S10 — Verified Badge one-time fee:** ✅ `src/app/api/stripe-badge/route.ts` — one-time Stripe Checkout session using `STRIPE_VERIFIED_BADGE_PRICE_ID`. Webhook sets `is_verified = true` and emails all admins. Plans page shows "Verified Badge Active / OWNED" chip when already purchased (blocks re-purchase). Dashboard shows gold "✦ GMA Verified" pill in banner and gold stat card.
10. [x] **Task S4 — Wire `register/page.tsx` to Stripe:** ✅ Paid plan → POSTs to `/api/stripe-checkout` (pending_registrations flow). Basic → POSTs to `/api/finish-registration` directly. Password set after payment via invite email link to `/auth/reset-password`.
11. [x] **Task S5 — `/auth/reset-password` page:** ✅ Full UI redesign (dark navy gradient, branded card). Session bootstrap via `useEffect` — exchanges `#access_token`+`#refresh_token` hash tokens from invite/recovery links into a live Supabase session before form is usable. Loading spinner while exchange runs. Fixes "Auth session missing!" error for new users completing account setup.
12. [x] **Task S12 — Claim-then-pay model:** Pre-loaded listings must convert to paid subscription before vendor can edit.
13. [ ] **Task S6 — Final end-to-end QA:** *(moved to GOLIVETODO.md → §1b)* Test Free (bypass), each paid tier monthly + annual (Stripe test card), badge purchase, suspension, and claim-then-pay. Then swap to live Stripe keys.

**Also completed (admin dashboard — today):**
- [x] Admin dashboard (`/admin`) — full registration table with inline edit, stat cards, search/filter, role-based access
- [x] Badge purchase queue: `pendingVerified` stat card (amber); verified-badge-pending rows sorted first, amber left border + "⭐ Badge Paid" pill
- [x] Admin notification email on badge purchase — fans out to every email in `admins` table

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
> **Email stack (confirmed):**
> - **EmailJS** — handles all email sending and template management. Email verification and
>   password reset both go through EmailJS using a single reusable branded template.
> - **Resend** — acts as the underlying SMTP server that EmailJS routes through. Resend provides
>   domain authentication (SPF/DKIM/DMARC) and delivery. EmailJS is the app-facing layer;
>   Resend is the deliverability layer underneath it.
>
> **Two parts:** (A) **Task 22** — authenticate a sending domain in Resend so mail is deliverable
> (interim fix; keeps Supabase's built-in mailer). (B) **Tasks E1–E8** — conform to the master
> architecture by moving auth emails into an app-owned Send Email hook + branded EmailJS template
> backed by Resend SMTP, per `architecture.md` → "Auth emails delegated to the app." The end
> state runs (B); (A)'s domain authentication is reused by (B).

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

### Conform to architecture: app-owned auth emails (tasks E1–E8)

> Implements `architecture.md` → **"Email & messaging" → "Auth emails delegated to the app"**:
> Supabase Auth fires a Send Email hook → an Edge route in our app verifies the signature, maps
> the action type to a branded template, and sends via a shared EmailJS helper. This replaces
> Supabase's built-in templated mailer for auth mail. The same helper later serves claim
> notifications and the dashboard notification toggles. Each task runs its own Gate 1 before building.

- [x] **Task E1 — Shared EmailJS send helper:** One helper POSTs to a single reusable EmailJS
      template (`https://api.emailjs.com/api/v1.0/email/send`) parameterized by `template_params`
      (subject, greeting, headline, `message_html`, button label/url, footnote). **Fails soft** —
      logs a warning and returns (never throws) if env vars are missing, so a misconfigured
      environment never crashes a request. In the EmailJS dashboard, configure the email service
      to use **Resend as the SMTP provider** (host: `smtp.resend.com`, port 465, API key as
      password) pointing at the domain verified in Task 22 — this is what gives SPF/DKIM/DMARC
      alignment. EmailJS is the template + send API layer; Resend is the SMTP/deliverability layer.
      Env: `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`, `EMAILJS_PRIVATE_KEY`.
- [x] **Task E2 — Auth-email webhook Edge route** (`src/app/api/auth-email-hook/route.ts`, Edge
      runtime): verify the Standard Webhooks signature before trusting the payload — HMAC-SHA256
      via Web Crypto (`crypto.subtle`), **constant-time** comparison, **±5-min** timestamp
      tolerance, **multi-signature** support (space-separated `v1,<sig>` for key rotation).
      Secret `SUPABASE_AUTH_HOOK_SECRET` (format `v1,whsec_<base64>`).
- [x] **Task E3 — Action-type → branded templates:** Map `email_action_type` (`signup`,
      `recovery`, `magiclink`, `email_change`, `invite`) to branded copy; build the provider's
      `/auth/v1/verify?token=…&type=…&redirect_to=…` confirmation URL; send via the E1 helper.
- [x] **Task E4 — Configure the Supabase Send Email hook:** Dashboard → **Authentication → Hooks**
      → **Send Email Hook** → point to the deployed Edge route URL and set the signing secret.
      Once active, Supabase delegates these emails to our route instead of its built-in mailer.
- [x] **Task E5 — Env wiring:** Add `EMAILJS_*` and `SUPABASE_AUTH_HOOK_SECRET` to `.dev.vars`
      and Cloudflare (build var vs. encrypted secret as appropriate — keys/secrets stay encrypted).
- [x] **Task E6 — Reconcile the existing recovery flow:** The current `/api/request-reset` +
      `resetPasswordForEmail` still triggers Supabase, which now fires the hook → our route.
      Confirm the recovery email comes from our branded template; keep the `clear_user_recovery`
      RPC that clears stale tokens first.
- [x] **Task E8 — Supabase custom SMTP + raise email rate limit (dashboard):**
      Supabase Dashboard → **PartnerPortal** → **Authentication → SMTP Settings**: confirm
      **Enable Custom SMTP** is on and pointed at Resend (host `smtp.resend.com`, port `465`,
      username `resend`, password = Resend API key, sender = address on the Task 22 verified
      domain). Then **Authentication → Rate Limits** → raise **"Rate limit for sending emails"**
      (per hour) above the default — the built-in mailer is hard-capped at 2/hour and the limit
      only becomes editable once custom SMTP is enabled; set it to a value sized for production
      sign-up volume (e.g. 100+/hour). Note: this rate limit still applies when the E4 Send
      Email hook is active, so it must be raised even though SMTP itself is superseded by the hook.
- [x] **Task E7 — QA:** ✅ Complete. Resend domain DNS verified (SPF/DKIM/DMARC on `globalmobilityadviser.com`). SMTP transport working through EmailJS. Branded dynamic template delivering correctly to inboxes. Password reset (recovery) email working end-to-end. Account creation via invite link (pay → invite email → `/auth/reset-password` → set password) working. Signature rejection verified in code: expired timestamp (±5 min window), bad HMAC, and missing `webhook-id`/`webhook-timestamp`/`webhook-signature` headers all return 401.

## Feedback

### Blocked

- [ ] **Domain setup — Relocentra + GMA redirect:** *(moved to GOLIVETODO.md → §1)* `relocentra.com` primary domain; `GlobalMobilityAdvisor.net` redirects to it. Needs DNS pointed at Cloudflare first.
- [x] **Updated supplier taxonomy (from Michael):** Taxonomy received (`Supplier_Taxonomy_Detailed_Summary.md`, 2026-06-17). 11-category / 41-subcategory structure confirmed. See task below.
- [x] **Apply taxonomy update across codebase:** Verified all 5 files against `Supplier_Taxonomy_Detailed_Summary.md` (2026-06-17) — all 11 categories and 41 subcategories correctly applied across:
  - `src/app/register/page.tsx` — fix CATEGORIES + SUBCATS
  - `src/app/dashboard/DashboardClient.tsx` — fix CATEGORY_MAP
  - `src/components/services/FilterPanel.tsx` — fix SUBCATS
  - `src/app/services/page.tsx` — replace wrong residential PRIMARY_CATEGORIES with correct 11
  - `src/app/admin/AdminDashboardClient.tsx` — same replacement
  - Changes: rename "Getting Established at the Destination" → "…at Destination"; "Benchmarking & Data Service" → "…Services"; "Title," → "Title /"; "Household Goods Movers" → "…(Domestic & International)"; add Storage Providers + Relocation Mortgage & Lending Services subcategories; add Category 11 Real Estate Professionals (Realtors)
- [x] **Load suppliers:** ~420 supplier entries loaded from Michael's spreadsheet.
- [ ] **Administration Dashboard:** Paul building (possibly modeled on Navigator admin).
      Must handle: account management, supplier verification (approve/reject), toggling
      `is_recommended` per supplier, viewing metrics (search impressions + page views),
      editing records, and admin notifications for new account signups.

### Design decisions needed

- [x] **Admin authentication — magic link via email/username:** Admins log in via magic link
      rather than password. Flow: on the login screen, if the user submits only an email or
      username (no password), check whether that identity is an admin. If yes, send a magic
      link to their email and redirect them into the admin dashboard on click. If no, fall
      through to the normal password login flow.
      - Admin identity check: look up the email/username against a dedicated `admins` table.
        The table has a `role` column — a single-value enum with three options:
        - `list` — access to supplier/listing management
        - `search` — access to search/directory data
        - `admin` — full access
        No UI exists yet for managing this table; rows will be inserted manually or via
        a future admin management screen.
      - Magic link: use Supabase Auth `signInWithOtp` (email OTP) so the link is
        short-lived and revocable.
      - On successful magic-link login, redirect to `/admin` (not `/dashboard`).
      - Login screen UI change: password field becomes optional — submitting with only
        email/username triggers the admin check + OTP flow.

- [x] **`is_recommended` toggle:** Admin-controlled flag — implemented as `is_featured` (existing column). Toggle added to admin dashboard inline edit panel. `is_verified` is set by admin after reviewing a badge purchase (`badge_purchased → admin approves → is_verified = true`). Both flows complete.
- [ ] **Searcher registration & gating:** *(V2 — deferred)* Put search behind a Searcher Login and gate Reviews behind it.

- [ ] **Rebrand navbar + footer → Relocentra powered by Global Mobility Adviser:** *(pending post-meeting 2026-06-19)*
      - New color scheme (TBD from meeting)
      - New logo — wait for asset from marketing team
      - Navbar links: existing portal links + Legal + link back to globalmobilityadviser.com
      - Footer: new Relocentra marketing copy, updated information
      - Wait for meeting outcome before starting Gate 1

### Completed

- [x] **Plan-gated profile fields:** Public listing gated by plan tier (Basic/Pro/Premier).
      Dashboard profile editor also done: logo, bio (Pro), core services, photo gallery
      (Premier) are greyed-out with disabled inputs, an ★ upgrade icon next to the label,
      and a tooltip on hover. Nothing is hidden — all locked fields show the upgrade path.
- [x] **Upgrade button is broken:** Fixed — plans page (`/dashboard/plans`) calls Supabase to
      update `membership_plan` on upgrade/downgrade; slug rotation logic also wired.
- [x] **Company logo → file upload:** Done — file upload to Supabase Storage (`logos` bucket,
      RLS-scoped per userId). Thumbnail preview + remove button. URL stored in `logo_url`.
- [x] **Photo gallery → file upload:** Done — upload from PC in both main app (Edit Profile
      panel) and Wireframe (Profile page). Uploads to `logos` bucket under `{userId}/gallery/`
      prefix. URL paste kept as fallback.
- [x] **Profile Preview URL hardcodes "WORDPRESS":** Fixed — dashboard sidebar "Preview Page"
      link now derives URL from `reg.slug` via `${MAIN_APP}/services/${reg.slug}` and updates
      when the slug changes.
- [x] **Menu items → marketing site:** Done — all nav and footer links now point to
      `globalmobilityadviser.com`. Logo image CDN stays on Hostinger until assets migrate.
- [x] **Client Reviews → Release 2 (feature flag):** Done — removed from public listings and
      "Client Reviews" removed from the dashboard sidebar nav entirely. Deferred to R2.
- [x] **Upgrade ad banner in dashboard:** Done — amber banner for Basic, blue for Professional,
      hidden for Premier. Shows locked feature chips, links to plans panel, dismissible
      per-session via sessionStorage.
- [x] **Wireframe dashboard features ported to main app:** Plan-aware profile completion with
      lock icons, real upgrade/downgrade Supabase logic with downgrade modal, slug rotation,
      and removal of reviews from nav/stat cards.
- [x] **Metrics tracking — search impressions + page views:** Two counters on
      `service_registrations` (`search_impressions`, `profile_views`). Search API increments
      impressions for every supplier returned in results; listing page increments profile views
      for every non-owner visit. Both use the service-role client + Postgres RPCs for atomic
      increments. Displayed in the dashboard Overview panel as two new stat cards. Admin
      dashboard (Paul) can read the same columns directly from the table.
      **Note:** Not wired to the Wireframe — the Wireframe has its own separate routes and
      dashboard. Wireframe is the prototype; metrics are intentionally main-app only.

Admin Dashboard:
- [x] Number of new registrations
- [x] Total of new registrations, broken down by Realtor and Vendor
- [x] New registrations would be the last week
- [x] Search for a registration (A vendor or a Realtor)
- [x] Add the ability to edit their record (Not an automatic edit, force the admin to click edit)
- [x] Role-based access (list / search / admin differentiation)
- [x] Set up three values first, create template, then connect EmailJS
- [x] Configure Supabase


Make it a standalone application and send it back to global mobility advisor
All the content we brought over is going to get super simplified (IN THE FUTURE, BRANCED AS RELOCENTRA POWERED AS GMA)

---

## PHASE 9 — Email Setup: Manual Prerequisites (complete before E1–E8 code tasks)

> EmailJS is the send layer (our app calls its API). Resend is the SMTP transport plugged into
> EmailJS (never called directly from our code). The Resend API key lives only in the EmailJS
> dashboard as the SMTP password — it does not appear anywhere in our codebase.
>
> **Flow:** Our app → EmailJS API → Resend SMTP → Inbox
>
> Env vars our code needs (4 total): `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`,
> `EMAILJS_PUBLIC_KEY`, `EMAILJS_PRIVATE_KEY`.

---

### Task 22 (expanded): Resend — verify sending domain + create SMTP API key

> **Why:** EmailJS sends through Resend's SMTP. Without domain verification, Resend will not
> deliver to arbitrary inboxes (only to the Resend account owner's email). Verification adds
> SPF/DKIM/DMARC records so emails land in inboxes instead of spam.

#### Step 1a — Log into Resend and add domain ✅

- [x] Domain `globalmobilityadviser.com` added and verified in Resend

#### Step 1b — Add DNS records in Cloudflare ✅

- [x] SPF/DKIM/DMARC records added in Cloudflare DNS

#### Step 1c — Verify in Resend ✅

- [x] All checkmarks green — domain verified (confirmed in E7 QA)

#### Step 1d — Create SMTP API key

- [x] Resend left sidebar → **API Keys** → **Create API Key**
- [x] Name: `EmailJS SMTP`
- [x] Permission: **Sending access** (not full access)
- [x] Click **Add**
- [x] Copy the key immediately — starts with `re_`, shown only once
- [x] Store it securely — it goes into the EmailJS dashboard next, NOT into our codebase

---

### Task M1: EmailJS — create account and add Resend as email service

> EmailJS is the template + API layer. We configure Resend SMTP inside EmailJS so it uses
> Resend as the delivery transport. Our code only ever calls the EmailJS API.

#### Step 2a — Create EmailJS account

- [x] Go to [emailjs.com](https://emailjs.com) → **Sign Up**
- [x] Free tier: 200 emails/month — sufficient for dev; upgrade when volume warrants

#### Step 2b — Add Email Service (Resend as Custom SMTP)

- [x] Dashboard → **Email Services** → **Add New Service**
- [x] Select **Custom SMTP** (not Gmail, Outlook, etc.)
- [x] Fill in the following fields exactly:

  | Field | Value |
  |-------|-------|
  | Service Name | `GMA Partner Portal` |
  | SMTP Host | `smtp.resend.com` |
  | SMTP Port | `465` |
  | Username | `resend` |
  | Password | *(the `re_...` API key from Step 1d — never goes in code)* |
  | From Name | `Global Mobility Adviser` |
  | From Email | `noreply@globalmobilityadviser.com` |

  > **From Email** must be on the verified domain from Task 22. No mailbox needs to exist
  > for `noreply@` — domain verification is sufficient for delivery.

- [x] Click **Connect Service** — EmailJS sends a test email to your EmailJS account email to confirm
- [x] Copy the **Service ID** (format: `service_xxxxxxx`) — this is `EMAILJS_SERVICE_ID`

---

### Task M2: EmailJS — create master template

> One reusable template parameterized by `template_params`. All auth emails (verification,
> password reset, magic link, invite, email change) use this single template with different
> param values — no separate templates per email type.

#### Step 3a — Create the template

- [x] Dashboard → **Email Templates** → **Create New Template**
- [x] Name: `GMA Master Template`
- [x] Switch editor to **HTML mode**

#### Step 3b — Paste template HTML

Paste the following into the HTML body. All `{{variable}}` placeholders are filled by our
send helper at call time. Use `{{{message_html}}}` (triple braces) for the body so HTML
renders instead of being escaped.

```html
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f6f8fc;font-family:'Open Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:32px 16px 0">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0c1428,#1E2E61);border-radius:12px 12px 0 0;padding:28px 40px">
              <p style="margin:0;font-size:20px;font-weight:800;color:#ffffff;letter-spacing:0.03em">
                Global Mobility Adviser
              </p>
              <p style="margin:4px 0 0;font-size:11px;color:rgba(255,255,255,0.5);letter-spacing:0.1em;text-transform:uppercase">
                Partner Portal
              </p>
            </td>
          </tr>

          <!-- Body card -->
          <tr>
            <td style="background:#ffffff;padding:36px 40px">
              <p style="margin:0 0 6px;font-size:15px;color:#374151">{{greeting}}</p>
              <h1 style="margin:0 0 20px;font-size:26px;font-weight:800;color:#0a1628;line-height:1.2">{{headline}}</h1>
              <div style="font-size:15px;color:#374151;line-height:1.75">
                {{{message_html}}}
              </div>

              <!-- CTA button -->
              <table cellpadding="0" cellspacing="0" style="margin:32px 0">
                <tr>
                  <td style="border-radius:10px;background:linear-gradient(135deg,#1E2E61,#1C66AD)">
                    <a href="{{button_url}}"
                       style="display:inline-block;padding:14px 36px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;border-radius:10px;letter-spacing:0.02em">
                      {{button_label}}
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;padding-top:20px;border-top:1px solid #f3f4f6;font-size:12px;color:#9ca3af;line-height:1.6">
                {{footnote}}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f6f8fc;border-radius:0 0 12px 12px;padding:20px 40px;text-align:center">
              <p style="margin:0 0 4px;font-size:12px;color:#9ca3af">
                © 2025 Global Mobility Adviser &nbsp;·&nbsp; Partner Portal
              </p>
              <p style="margin:0;font-size:12px">
                <a href="https://globalmobilityadviser.com" style="color:#1C66AD;text-decoration:none">
                  globalmobilityadviser.com
                </a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

#### Step 3c — Configure template fields

- [x] **Subject** field: `{{subject}}`
- [x] **To Email** field: `{{to_email}}`
- [x] **To Name** field: `{{to_name}}` (optional — used to personalize greeting)
- [x] Click **Save**

#### Step 3d — Copy Template ID

- [x] Copy the **Template ID** shown after saving (format: `template_xxxxxxx`) — this is `EMAILJS_TEMPLATE_ID`

#### Step 3e — Get API keys

- [x] Dashboard → **Account** → **General** → copy **Public Key** — this is `EMAILJS_PUBLIC_KEY`
- [x] Dashboard → **Account** → **Security** → generate if not present → copy **Private Key** — this is `EMAILJS_PRIVATE_KEY`
  > The private key is used for server-side API calls only — never expose it in client-side code.

#### Step 3f — Confirm all four values are in hand

```
EMAILJS_SERVICE_ID=service_...
EMAILJS_TEMPLATE_ID=template_...
EMAILJS_PUBLIC_KEY=...
EMAILJS_PRIVATE_KEY=...
```

Paste these to Claude → they go into `.dev.vars` (local) and Cloudflare encrypted secrets (production).
These are the only four values our code needs. The Resend API key stays in EmailJS only.

---

### Template parameter reference

All emails are sent by passing these params to the single master template:

| Param | Type | Example value |
|-------|------|---------------|
| `to_email` | string | `user@example.com` |
| `to_name` | string | `Michael` |
| `subject` | string | `Verify your email address` |
| `greeting` | string | `Hi Michael,` |
| `headline` | string | `Verify Your Email Address` |
| `message_html` | HTML string | `<p>Click the button below to verify…</p>` |
| `button_label` | string | `Verify Email` |
| `button_url` | string | `https://…/auth/v1/verify?token=…` |
| `footnote` | string | `If you didn't create an account, ignore this email.` |

#### Email type → param mapping

| Auth action | subject | headline | button_label | footnote |
|-------------|---------|----------|--------------|---------|
| `signup` | Verify your email address | Verify Your Email Address | Verify Email | If you didn't create an account, you can safely ignore this. |
| `recovery` | Reset your password | Reset Your Password | Reset Password | If you didn't request a reset, you can safely ignore this. |
| `magiclink` | Your sign-in link | Your Sign-In Link | Sign In | This link expires in 1 hour. If you didn't request it, ignore this. |
| `email_change` | Confirm your new email | Confirm Email Change | Confirm New Email | If you didn't request this change, contact support immediately. |
| `invite` | You've been invited | You've Been Invited to Partner Portal | Accept Invitation | This invitation expires in 7 days. |

---

### Code tasks (E1–E8) — run after manual prerequisites above are complete

> These are the same tasks already listed in Phase 9 above. Repeated here for sequencing clarity.
> Each runs its own Gate 1 before building.

- [x] **E1** — Shared EmailJS send helper (`src/lib/email.ts`)
- [x] **E2** — Auth-email webhook Edge route (`src/app/api/auth-email-hook/route.ts`)
- [x] **E3** — Action-type → param mapping (signup / recovery / magiclink / email_change / invite)
- [x] **E4** — Configure Supabase Send Email hook in dashboard (point to deployed E2 route)
- [x] **E5** — Env wiring: add all four `EMAILJS_*` vars + `SUPABASE_AUTH_HOOK_SECRET` to `.dev.vars` and Cloudflare
- [x] **E6** — Reconcile existing `/api/request-reset` + `resetPasswordForEmail` flow with new hook
- [x] **E8** — Supabase dashboard: confirm custom SMTP on, raise email rate limit above 2/hour
- [x] **E7** — QA complete: ✅ Resend DNS verified, ✅ SMTP via EmailJS working, ✅ branded dynamic template delivering, ✅ password reset working, ✅ invite link account creation working. Signature rejection (bad HMAC, expired timestamp, missing headers) returns 401 — verified in `auth-email-hook/route.ts`.
# PartnerPortal — Build Plan

Recreating 3 WordPress pages in React/Tailwind (Next.js 16, Cloudflare Workers, Supabase).
Priority order: /register → /add-service → /services-page.

Each task below is ONE gate cycle: plan → approval → build → test → commit+push approval.
Do NOT start the next task until the previous Gate 2 is approved and committed.

**Current status:** Phase 1 ✅ complete, Phase 2 ✅ complete (pending one manual Supabase step — see Task 6), Task 8 ✅ complete. Next up: Phase 3, Task 9.

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

### Task 6: Supabase Auth configuration ⏳ (manual step — user action required)

**User must complete before Phase 4 (register page) will work end-to-end:**

1. Go to **Supabase Dashboard → Authentication → URL Configuration**
   - **Site URL:** `https://partnerportal.gmaadmin001.workers.dev`
   - **Redirect URLs:** add `https://partnerportal.gmaadmin001.workers.dev/auth/callback`
2. Go to **Authentication → Providers** → confirm **Email** provider is enabled
3. Decide on email confirmation behaviour (require confirmation on sign-up? yes/no) — confirm with user before Task 10

- [ ] Site URL set in Supabase dashboard
- [ ] Redirect URL added
- [ ] Email provider confirmed enabled
- [ ] Email confirmation preference decided

---

### Task 7: Auth callback route ✅

- [x] `src/app/auth/callback/route.ts` — exchanges Supabase code for session, redirects to `/add-service` on success, `/register?error=auth_callback_error` on failure

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

### Task 9: Global layout — Navbar and Footer components

- [ ] Create `src/components/layout/Navbar.tsx`:
  - GMA logo (text wordmark for now; swap for image asset when provided)
  - Nav links: Home / Solutions / Courses / About Us / Resources / Contact Us
  - "Sign In" link top-right
  - Mobile responsive: hamburger menu / collapsible
- [ ] Create `src/components/layout/Footer.tsx`:
  - Logo + tagline: "At Global Mobility Adviser, we deliver results you can trust..."
  - "Subscribe now" CTA
  - Contact block: (623)-290-1143 · contactus@honeydew-capybara-608687.hostingersite.com
  - Sitemap: Solutions / Education / About Us / Resources / Contact Us
  - Policy links: Privacy Policy / Copyright Policy / Terms of Service
  - © 2025 Global Mobility Adviser All Rights Reserved
  - LinkedIn icon
- [ ] Update `src/app/layout.tsx` to wrap all pages with `<Navbar />` and `<Footer />`

---

## PHASE 4 — Page 1: /register

### Task 10: Register page — layout and login form

> Architecture: touches the **member auth surface** (`architecture.md` — Two auth surfaces section).
> Supabase Task 6 manual step must be complete before end-to-end auth testing works.

- [ ] Create `src/app/register/page.tsx` — two-panel layout (form left, GMA info right; stacked mobile)
- [ ] Build `src/components/auth/LoginForm.tsx`:
  - Email/Username field
  - Password field with show/hide toggle
  - Remember Me checkbox
  - Lost Password link → `supabase.auth.resetPasswordForEmail(email)`
  - Log In button → `supabase.auth.signInWithPassword({ email, password })` → redirect `/add-service`
  - OR divider + Register link
  - Inline error states, loading state on button
- [ ] Build `src/components/auth/RegisterForm.tsx`:
  - Email, Password, Confirm Password fields
  - Create Account → `supabase.auth.signUp({ email, password })`
  - Success: "Check your email to confirm your account"
- [ ] **Confirm with user:** Register as separate tab within same page, or separate URL `/register/signup`?
- [ ] Build `src/components/auth/InfoPanel.tsx` (right panel):
  - GMA tagline + Michael Ray description
  - Contact details
- [ ] Visual QA: compare with live `/register/` page

---

## PHASE 5 — Page 2: /add-service

### Task 11: Add Service page — step indicator and state management

- [ ] Create `src/app/add-service/page.tsx` — step state manager
- [ ] Create `src/components/add-service/StepIndicator.tsx` (Service → Details → Membership Plans → Finish)
- [ ] Install `react-hook-form`: `npm install react-hook-form`
- [ ] Define TypeScript types: `VendorFormData`, `RealtorFormData`

---

### Task 12: Add Service — Step 1: Vendor form

- [ ] Create `src/components/add-service/VendorRealtorToggle.tsx` (Vendor | Realtor toggle)
- [ ] Create `src/components/add-service/VendorForm.tsx`:
  - Primary Category (single dropdown — 10 Relocentra categories)
  - Sub Category (multi-select, dependent on Primary)
  - Company Name, Website URL, Short Description (255 chars + counter)
  - HQ Country (ISO dropdown), HQ City
  - Countries Served (multi-select)
  - Delivery Model (radio: Direct / Aggregator / Mixed / Franchise / Unknown)
  - Company Size (radio: 1–50 / 51–500 / 500+)
  - Certifications (text)
  - Contact Name, Email, Phone
- [ ] Required field validation + Next button

---

### Task 13: Add Service — Step 1: Realtor form

- [ ] Create `src/components/add-service/RealtorForm.tsx`:
  - Brokerage/Agent Name, Website URL
  - HQ Country (dropdown), HQ City
  - License Number
  - Service Areas (multi-select — country-level per live site; confirm before building)
  - Property Type (dropdown)
  - Short Bio (255 chars + counter)
  - Contact Name, Email, Phone
- [ ] Required field validation + Next button

---

### Task 14: Add Service — Step 2: Details

> **Blocked:** Step 2 content is not visible on the live WordPress site. Build a placeholder step
> with Back/Next buttons. Confirm content with user before populating.

- [ ] Confirm with user what Step 2 ("Details") contains
- [ ] Build `src/components/add-service/DetailsStep.tsx` (placeholder with Back/Next)
- [ ] Populate with real fields once confirmed

---

### Task 15: Add Service — Step 3: Membership Plans

- [ ] Create `src/components/add-service/MembershipPlans.tsx`:
  - Free ($0), Standard ($100/mo), Premium ($200/mo) cards
  - Each card: price, feature list, "Select Plan" button
  - Selected card highlighted
- [ ] Wire selection to form state; Next button enabled once plan selected

---

### Task 16: Add Service — Step 4: Finish + Supabase write

> **Note:** Supabase DB schema (vendor/realtor tables) needs to be created before this task.
> Schema will be designed and applied via Supabase MCP `apply_migration` with Gate 1 plan approval.

- [ ] Create `src/components/add-service/FinishStep.tsx` (summary + Submit button)
- [ ] Create `src/app/api/add-service/route.ts` — POST handler:
  - Validate session via SSR Supabase client
  - Insert vendor/realtor record
  - Failure contract per `architecture.md`: missing config → fail soft; real error → throw
- [ ] Visual QA: walk all 4 steps end-to-end

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
| Email confirmation | Not yet decided — confirm before Task 10 |

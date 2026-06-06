# PartnerPortal — Build Plan

Recreating 3 WordPress pages in React/Tailwind (Next.js 15, Cloudflare Workers, Supabase).
Priority order: /register → /add-service → /services-page.

Each task below is ONE gate cycle: plan → approval → build → test → commit+push approval.
Do NOT start the next task until the previous Gate 2 is approved and committed.

---

## PHASE 1 — Project Scaffolding

### Task 1: Initialize Next.js 15 project

- [ ] Run `npx create-next-app@latest` with the following options:
  - TypeScript: yes
  - ESLint: yes
  - Tailwind CSS: yes
  - `src/` directory: yes
  - App Router: yes
  - Import alias `@/*`: yes
- [ ] Confirm generated files: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`
- [ ] Remove boilerplate content from `src/app/page.tsx` and `src/app/globals.css`
- [ ] Verify dev server starts: `npm run dev`

---

### Task 2: Configure Cloudflare Workers via @opennextjs/cloudflare

- [ ] Install dependencies:
  - `npm install -D @opennextjs/cloudflare wrangler`
- [ ] Create `wrangler.jsonc` at project root with:
  - `name`: `partner-portal`
  - `compatibility_date`: current date
  - `compatibility_flags`: `["nodejs_compat"]`
  - `main`: `.open-next/worker.js`
  - `assets` bucket pointing to `.open-next/assets`
- [ ] Update `next.config.ts` to use the `@opennextjs/cloudflare` adapter
- [ ] Add scripts to `package.json`:
  - `"build": "next build"`
  - `"deploy": "opennextjs-cloudflare build && wrangler deploy"`
  - `"preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview"`
  - `"cf-typegen": "wrangler types"`
- [ ] Run `npm run preview` locally to confirm the build compiles and serves without error
- [ ] Add `.dev.vars` to `.gitignore` (this file holds local secrets — must never be committed)
- [ ] Create `.dev.vars.example` with empty placeholder keys for documentation

---

### Task 3: Connect GitHub repo to Cloudflare Workers Builds (manual step — user action)

**User must complete these steps in the Cloudflare dashboard:**

1. Go to **Cloudflare Dashboard → Workers & Pages → Create application**
2. Select **Pages** (or Workers depending on adapter output — confirm with build output)
3. Click **Connect to Git** → authorize GitHub → select the `PartnerPortal` repository
4. Configure build settings:
   - **Framework preset:** None (custom)
   - **Build command:** `npm run build` (opennextjs-cloudflare wraps next build)
   - **Build output directory:** `.open-next/assets`
   - **Root directory:** `/` (repo root)
5. Under **Environment Variables (Build)** add:
   - `NEXT_PUBLIC_SUPABASE_URL` = *(will fill in Task 4)*
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = *(will fill in Task 4)*
   - `NODE_VERSION` = `20`
6. Click **Save and Deploy** — confirm the first build completes (even if pages are empty)
7. Note the assigned `*.workers.dev` or `*.pages.dev` URL for testing

> Wait for confirmation that the Cloudflare build pipeline is green before proceeding.

---

## PHASE 2 — Supabase Setup

### Task 4: Create and connect Supabase project

- [ ] Use Supabase MCP (`list_projects`) to check if a project already exists; create one if not:
  - Project name: `partner-portal`
  - Region: closest to expected user base (e.g. `us-east-1`)
- [ ] Use MCP `get_project_url` and `get_publishable_keys` to retrieve:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Retrieve the service role key from Supabase dashboard (Settings → API → service_role key)
- [ ] Populate `.dev.vars` with all three keys for local development
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as **build variables** in Cloudflare dashboard (build-time, not just runtime — required for browser bundle)
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` as a **runtime secret** in Cloudflare (wrangler secret put)

---

### Task 5: Supabase client setup (three roles)

Following `architecture.md` — Supabase client roles section:

- [ ] Install: `npm install @supabase/supabase-js @supabase/ssr`
- [ ] Create `src/lib/supabase/client.ts` — browser/anon client (safe in client components, RLS-bound)
- [ ] Create `src/lib/supabase/server.ts` — SSR/server client (acts as the logged-in user, RLS applies; reads cookies)
- [ ] Create `src/lib/supabase/service.ts` — service-role client (server-only, bypasses RLS; throws at import if accidentally bundled for client)
- [ ] Create `src/middleware.ts` — Supabase auth session refresh middleware (required for SSR cookie-based sessions to stay alive across navigations)
- [ ] Verify types: run `npm run cf-typegen` and confirm no TypeScript errors

---

### Task 6: Supabase Auth configuration (manual step — user action in Supabase dashboard)

**User must complete these steps:**

1. Go to **Supabase Dashboard → Authentication → Providers**
2. Confirm **Email** provider is enabled
3. Under **Auth → Email Templates** — leave as default for now (custom email routing comes later)
4. Under **Auth → URL Configuration**:
   - **Site URL:** set to the Cloudflare `*.workers.dev` URL from Task 3
   - **Redirect URLs:** add `<cloudflare-url>/auth/callback`
5. Under **Auth → Settings**:
   - Confirm email confirmations behavior (enable or disable based on project preference — confirm with user)

> Wait for user confirmation before proceeding.

---

### Task 7: Auth callback route

- [ ] Create `src/app/auth/callback/route.ts` — handles the OAuth/magic-link redirect from Supabase, exchanges the code for a session, and redirects to `/add-service` (or `/` as appropriate)
- [ ] Test the callback route URL resolves without 404

---

## PHASE 3 — Shared Shell & Brand

### Task 8: Tailwind brand configuration

- [ ] Update `tailwind.config.ts` with GMA brand tokens:
  - Primary blue (extracted from live site — `#1a5f9e` approximate, confirm with live site inspection)
  - Neutral/text grays
  - White background
  - Error red, success green for form states
- [ ] Update `src/app/globals.css`:
  - Import Google Font (confirm with live site — appears to use a sans-serif; extract exact font from live site CSS)
  - Set base font family on `body`
  - Remove all create-next-app boilerplate CSS

---

### Task 9: Global layout — Navbar and Footer components

- [ ] Create `src/components/layout/Navbar.tsx`:
  - GMA logo (text wordmark for now; swap for image asset when provided)
  - Nav links: Home / Solutions / Courses / About Us / Resources / Contact Us
  - "Sign In" link top-right
  - Mobile responsive: hamburger menu / collapsible
- [ ] Create `src/components/layout/Footer.tsx`:
  - Logo + tagline
  - "Subscribe now" CTA
  - Contact block: phone + email
  - Sitemap links: Solutions / Education / About Us / Resources / Contact Us
  - Policy links: Privacy Policy / Copyright Policy / Terms of Service
  - © 2025 Global Mobility Adviser All Rights Reserved
  - LinkedIn social icon
- [ ] Update `src/app/layout.tsx` to wrap all pages with `<Navbar />` and `<Footer />`
- [ ] Create `src/app/page.tsx` to redirect from `/` → `/register` (this lets the Cloudflare URL land directly on the register page during development; update later as more pages are built)

---

## PHASE 4 — Page 1: /register

### Task 10: Register page — layout and login form

Architecture note: touches the **member auth surface** from `architecture.md`.

- [ ] Create `src/app/register/page.tsx` — two-panel layout:
  - Left panel: login/auth form
  - Right panel: GMA info (tagline, Michael Ray description, contact details)
  - Stacks vertically on mobile
- [ ] Build `src/components/auth/LoginForm.tsx`:
  - **Username or Email Address** field (text input)
  - **Password** field with show/hide toggle button (eye icon)
  - **Remember Me** checkbox
  - **Lost Password?** link (routes to Supabase password reset flow)
  - **Log In** primary button
  - **OR** divider
  - **Register** link below (routes to account creation — Supabase sign-up form or separate tab)
- [ ] Wire Log In button to `supabase.auth.signInWithPassword({ email, password })`
  - On success: redirect to `/add-service`
  - On error: display inline error message below the form
- [ ] Wire Lost Password link to `supabase.auth.resetPasswordForEmail(email)`
  - Show confirmation message: "Check your email for a reset link"
- [ ] Add form validation:
  - Required field indicators
  - Email format validation on blur
  - Disable submit button while request is in-flight
- [ ] Build `src/components/auth/RegisterForm.tsx` (shown when user clicks "Register"):
  - **Email** field
  - **Password** field (with show/hide toggle)
  - **Confirm Password** field
  - **Create Account** button → `supabase.auth.signUp({ email, password })`
  - On success: show "Check your email to confirm your account" message
  - On error: inline error
- [ ] Decide and confirm with user: is Register a separate tab/view within the same page, or a different URL (`/register/signup`)? Implement accordingly.
- [ ] Build `src/components/auth/InfoPanel.tsx` (right panel):
  - GMA description text
  - Contact details (phone + email)
- [ ] Visual QA: compare side-by-side with live `/register/` page

---

## PHASE 5 — Page 2: /add-service

### Task 11: Add Service page — step indicator and state management

- [ ] Create `src/app/add-service/page.tsx` — top-level page component managing step state
- [ ] Create `src/components/add-service/StepIndicator.tsx`:
  - Four steps: **Service → Details → Membership Plans → Finish**
  - Active step highlighted, completed steps marked, future steps muted
  - Props: `currentStep: 1 | 2 | 3 | 4`
- [ ] Set up form state management using React `useState` or React Hook Form:
  - Install React Hook Form: `npm install react-hook-form`
  - Shared form context so data persists across step transitions
  - Define TypeScript types for VendorFormData and RealtorFormData

---

### Task 12: Add Service — Step 1: Vendor/Realtor toggle and Vendor form

- [ ] Create `src/components/add-service/VendorRealtorToggle.tsx`:
  - Two-button toggle: **Vendor** | **Realtor**
  - Instruction text: "Please select Vendor or Realtor"
  - Active state styling (selected button filled/highlighted)
- [ ] Create `src/components/add-service/VendorForm.tsx` with all fields:
  - **Primary Category** — single-select dropdown (10 Relocentra categories)
  - **Sub Category** — dependent dropdown, populates based on Primary Category selection (multi-select per design doc; implement as multi-select checkboxes or a multi-select dropdown)
  - **Company Name** — text input (required)
  - **Website URL** — text/URL input (required)
  - **Short Description** — textarea, max 255 chars with character counter (required)
  - **Headquarters Country** — dropdown, full ISO country list (required)
  - **Headquarters City** — text input (required)
  - **Countries Served** — multi-select dropdown (optional)
  - **Delivery Model** — radio buttons: Direct / Aggregator / Mixed / Franchise / Unknown
  - **Company Size** — radio buttons: 1–50 / 51–500 / 500+
  - **Certifications** — text input (comma-separated)
  - **Contact Name** — text input
  - **Contact Email** — email input
  - **Contact Phone** — tel input
- [ ] Add required field validation on all required fields
- [ ] "Next" button advances to Step 2 only if all required fields pass validation

---

### Task 13: Add Service — Step 1: Realtor form

- [ ] Create `src/components/add-service/RealtorForm.tsx` with all fields:
  - **Brokerage/Agent Name** — text input (required)
  - **Website URL** — URL input (required)
  - **Headquarters Country** — dropdown, ISO country list (required)
  - **Headquarters City** — text input (required)
  - **License Number** — text input (optional)
  - **Service Areas** — multi-select dropdown (required) — NOTE: resolve country vs. state/region question before building; default to country-level per live site
  - **Property Type** — single-select dropdown (optional)
  - **Short Bio** — textarea, max 255 chars with character counter (required)
  - **Contact Name** — text input
  - **Contact Email** — email input
  - **Contact Phone** — tel input
- [ ] Required field validation + "Next" button advancement

---

### Task 14: Add Service — Step 2: Details

- [ ] Confirm with user what Step 2 ("Details") contains — not fully visible on the live site
- [ ] Placeholder: build `src/components/add-service/DetailsStep.tsx` as a holding step with a "Next" / "Back" button until content is confirmed
- [ ] Once confirmed, populate with actual fields

---

### Task 15: Add Service — Step 3: Membership Plans

- [ ] Create `src/components/add-service/MembershipPlans.tsx`:
  - Three plan cards side-by-side (stacked on mobile):
    - **Free** — $0/mo — feature list
    - **Standard** — $100/mo — feature list
    - **Premium** — $200/mo — feature list
  - Each card has a **"Select Plan"** button
  - Selected plan is visually highlighted (border/bg change)
- [ ] Wire plan selection to form state
- [ ] "Next" button advances to Step 4 once a plan is selected

---

### Task 16: Add Service — Step 4: Finish / Confirmation

- [ ] Create `src/components/add-service/FinishStep.tsx`:
  - Summary of submitted data (company name, type, selected plan)
  - **Submit** button — fires the Supabase write (server action or API route)
  - On success: success message / confirmation UI
  - On error: inline error with retry option
- [ ] Create `src/app/api/add-service/route.ts` — POST handler:
  - Validates session (user must be logged in — redirect to `/register` if not)
  - Uses **SSR Supabase client** to insert vendor/realtor record into the appropriate table
  - Returns 200 on success, appropriate error codes on failure
- [ ] Apply architecture failure contract (per `architecture.md` external provider integrations section): missing config → fail soft; real error → throw
- [ ] Visual QA: walk through all 4 steps and confirm data flows correctly end-to-end

---

## PHASE 6 — Page 3: /services-page (build after /register and /add-service are approved)

### Task 17: Services page — filter panel

- [ ] Create `src/app/services-page/page.tsx`
- [ ] Create `src/components/services/FilterPanel.tsx` with all filter controls:
  - Service Type (dropdown)
  - Sub-service (dependent dropdown)
  - Country (global dropdown)
  - State/Region (North America / EMEA / APAC / Global)
  - Industry (Technology / Energy / Financial Services / etc.)
  - Integration Scope (Domestic / International / Hybrid + SAP / Workday checkboxes)
  - Company Size (Small / Medium / Large)
  - Company Name (text search input)
  - Zip Code (text input)
  - Certifications (multi-select)
  - Diversity badges (multi-select)
- [ ] "Search / Apply Filters" button triggers results fetch
- [ ] "Clear All" resets all filters

---

### Task 18: Services page — results area and provider cards

- [ ] Create `src/components/services/ResultsArea.tsx`:
  - Results count label ("X providers found")
  - Loading skeleton state while fetching
  - Empty state ("No providers match your filters")
- [ ] Create `src/components/services/ProviderCard.tsx`:
  - Company Name
  - Category / Subcategory badges
  - Short Description
  - HQ location
  - Website link / CTA button
  - Premium badge for upgraded listings (if applicable)
- [ ] Create `src/app/api/services/route.ts` — GET handler:
  - Accepts filter params from query string
  - Uses **anon Supabase client** (public directory, no auth required)
  - Queries providers table with filters applied
  - Returns paginated results
- [ ] Wire filter panel → API call → results render
- [ ] Implement basic pagination (next/previous page or load-more)

---

## PHASE 7 — Cross-cutting / Cleanup

### Task 19: Auth protection middleware

- [ ] Update `src/middleware.ts` to:
  - Protect `/add-service` route — redirect unauthenticated users to `/register`
  - Allow `/register`, `/services-page`, and all public routes without a session
  - Refresh Supabase session on every request (required for SSR cookie sessions)

---

### Task 20: Environment variable audit + production readiness

- [ ] Confirm all `NEXT_PUBLIC_*` vars are set as Cloudflare **build variables** (not just runtime secrets)
- [ ] Confirm `SUPABASE_SERVICE_ROLE_KEY` is set as a Cloudflare **runtime secret** only (never in build vars)
- [ ] Run `npm run preview` locally against `.dev.vars` — verify all three pages load without errors
- [ ] Push to GitHub deploy branch → confirm Cloudflare build completes → smoke test all three pages on the live Workers URL

---

## Notes

- **Branch:** confirm deploy branch name before any `git push` (Gate 2 check)
- **Supabase DB schema:** vendor/realtor tables and auth are not yet migrated — Task 16 will surface the exact schema needed; apply via Supabase MCP `apply_migration` with Gate 1 plan approval
- **Portal branding name:** "Partner Portal" naming concern from design docs is unresolved — using neutral labels in code until decided
- **Step 2 ("Details") content:** blocked on user clarification before Task 14 can be fully built
- **Realtor Service Areas field type:** country vs. state/region — defaulting to country per live site; confirm before Task 13

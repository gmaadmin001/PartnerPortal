# Go-Live Checklist — PartnerPortal

Everything that must be configured **when the app goes live with real users**, consolidated in
one place. Most of these are dashboard/console steps (Stripe, Cloudflare, Supabase, Resend, DNS) —
not code. Detailed sub-steps live in the referenced files; this is the master gate.

> **Definition of "live":** real customers, real money (Stripe live mode), real auth emails, and
> the production domain (`relocentra.com`). Until then everything runs on
> `partnerportal.gmaadmin001.workers.dev` in test/sandbox mode.

Each item is a gate cycle: plan → approval → do → verify → commit/push approval (where code is
involved). Dashboard-only steps still get walked through click-by-click.

---

## 1. Domain & DNS

> Source: TODO.md → "Blocked → Domain setup — Relocentra + GMA redirect".

- [ ] **1.1 — Point `relocentra.com` DNS at Cloudflare.** Primary product domain (purchased ~2025).
      Add the zone in Cloudflare, update registrar nameservers.
- [ ] **1.2 — Redirect `GlobalMobilityAdvisor.net` → `relocentra.com`** (Cloudflare redirect rule /
      bulk redirect). Both domains managed in Cloudflare.
- [ ] **1.3 — Map the Worker to the custom domain.** Workers & Pages → `partnerportal` → Settings →
      **Domains & Routes** → add `relocentra.com` (and/or `www`) as a custom domain. Confirm the
      Worker serves on the real domain over HTTPS.
- [ ] **1.4 — Decide the canonical app origin** (apex vs `www`, and whether the app lives at the
      root or a subdomain like `portal.relocentra.com`). This origin feeds every URL below
      (Supabase Site URL, Stripe webhook, success/cancel URLs, auth redirects).

> ⚠️ **Every "production URL" item below depends on 1.4.** Lock the canonical origin first, then
> propagate it everywhere.

## 1b. Stripe — End-to-end QA + live key swap (S6)

- [ ] **S6.1 — Test-card QA:** Basic bypass, Professional monthly, Professional annual, Premier
      monthly, Premier annual, Verified Badge one-time, subscription suspension, claim-then-pay
      (Basic and paid). Use Stripe test card `4242 4242 4242 4242`.
- [ ] **S6.2 — Swap to live Stripe keys** per §2 above once QA passes.

## 2. Stripe — Live mode (StripeTODO.md → Phase F)

> Test mode and live mode share **nothing** — new keys, products, prices, webhook, settings.
> Repeat all of StripeTODO.md Phase B in **live mode**.

- [ ] **2.1 — Toggle to Live mode** and complete Stripe **business activation** (legal entity, bank
      account for payouts, tax details). Required before live charges work.
- [ ] **2.2 — Recreate the 3 products / 5 prices** in live mode (Professional $25/$250, Premier
      $50/$500, Verified Badge $100 one-time). Collect the 5 live `price_...` IDs.
- [ ] **2.3 — Live API keys:** copy `pk_live_*` and `sk_live_*`.
- [ ] **2.4 — Live webhook endpoint:** URL = `https://<canonical-origin>/api/stripe-webhook` (from
      1.4 — **not** the workers.dev URL). Same 4 events: `checkout.session.completed`,
      `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`.
      Copy the live `whsec_*`.
- [ ] **2.5 — Failed-payment behavior (the toggle hidden in sandbox):** Settings → Billing → Manage
      failed payments → set the after-all-retries action to **Cancel the subscription**. (Our S11
      handler is resilient either way, but set this for correct lifecycle.)
- [ ] **2.6 — Branding + statement descriptor** (Settings → Business): logo, brand color, and the
      card-statement descriptor (e.g. `RELOCENTRA`). Cosmetic but customer-facing — was deferred
      from test mode.
- [ ] **2.7 — Swap Cloudflare vars to live values** (see §4) and **redeploy** — the publishable key
      is a build-time variable, so it requires a rebuild to take effect.
- [ ] **2.8 — Real-card smoke test** on the lowest-priced tier; confirm the account is created via
      the live webhook; **refund** via the dashboard.

## 3. Production email (TODO.md → Phase 9: Task 22 + E1–E8)

> Auth/transactional email must be deliverable from an authenticated domain before real users sign
> up or reset passwords. Conforms to `architecture.md` → "Auth emails delegated to the app."

- [ ] **3.1 — Authenticate the sending domain in Resend** (Task 22): add the domain (likely a
      `relocentra.com` / `globalmobilityadviser.com` subdomain), add the SPF/DKIM (and optional MX)
      DNS records in Cloudflare, verify green in Resend.
- [ ] **3.2 — Supabase custom SMTP** (Task E8): Authentication → SMTP Settings → enable, host
      `smtp.resend.com`, port `465`, user `resend`, password = Resend API key, sender = address on
      the verified domain.
- [ ] **3.3 — Raise the email rate limit** (Task E8): Authentication → Rate Limits → raise "Rate
      limit for sending emails" above the 2/hour default (e.g. 100+/hour) — only editable once
      custom SMTP is on; still applies even with the E4 Send Email hook active.
- [ ] **3.4 — App-owned branded auth emails** (Tasks E1–E7): Send Email hook → Edge route →
      branded EmailJS template backed by Resend SMTP, signature-verified. End state that supersedes
      the interim built-in mailer.
- [ ] **3.5 — Email deliverability QA** (Task E7/E6): trigger recovery + (if enabled) signup;
      confirm branded mail arrives from the authenticated domain and lands in the inbox (not
      Spam/Promotions). A 200 from EmailJS = accepted, **not** delivered.

## 4. Cloudflare production environment variables

> Workers & Pages → `partnerportal` → Settings → **Variables & Secrets**. Set for production and
> **rebuild** (any `NEXT_PUBLIC_*` change requires a rebuild — it's inlined into the browser bundle).

**Stripe (from §2 — swap test → live):**

| Variable | Type | Value |
|---|---|---|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | **Plain-text build variable** | `pk_live_*` |
| `STRIPE_SECRET_KEY` | Encrypted secret | `sk_live_*` |
| `STRIPE_WEBHOOK_SECRET` | Encrypted secret | live `whsec_*` (the §2.4 endpoint) |
| `STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID` | Encrypted secret | live `price_*` |
| `STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID` | Encrypted secret | live `price_*` |
| `STRIPE_PREMIER_MONTHLY_PRICE_ID` | Encrypted secret | live `price_*` |
| `STRIPE_PREMIER_ANNUAL_PRICE_ID` | Encrypted secret | live `price_*` |
| `STRIPE_VERIFIED_BADGE_PRICE_ID` | Encrypted secret | live `price_*` |

**Existing app vars (confirm present in production, not just `.dev.vars`):**

| Variable | Type | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Build variable | already set |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Build variable | already set |
| `SUPABASE_SERVICE_ROLE_KEY` | Encrypted secret | server-only; never client |
| `ADMIN_EMAIL` | Encrypted secret | gates admin claim-approval routes |
| Email vars (Resend/EmailJS) | Encrypted secrets | added during §3 (E1–E8) |

- [ ] **4.1 — All Stripe live vars set** and a rebuild/redeploy done.
- [ ] **4.2 — Confirm `SUPABASE_SERVICE_ROLE_KEY` is a runtime secret in prod** (it's the
      god-mode key — must never be a `NEXT_PUBLIC_*` or build var).
- [ ] **4.3 — Confirm `.dev.vars` is gitignored** and no real secrets are committed anywhere in
      the repo history.

## 5. Supabase — production auth config

> Supabase Dashboard → project `fwiudagfnntuwqhglkdi` → Authentication.

- [ ] **5.1 — Site URL** → set to the canonical production origin (§1.4), replacing
      `https://partnerportal.gmaadmin001.workers.dev`.
- [ ] **5.2 — Redirect URLs** → add `https://<canonical-origin>/auth/callback` (and any
      reset-password return URL). Keep workers.dev only if still needed for staging.
- [ ] **5.3 — Decide email confirmation policy.** Today accounts are created with
      `email_confirm: true` (no verification loop) so users sign in immediately. Confirm this is
      the intended production behavior, **or** enable the verification loop. Note the linkage:
      Phase 9 email verification is what sets `is_verified = true`, which gates the public VERIFIED
      badge (§6).
- [ ] **5.4 — Run Supabase advisors** (`get_advisors`) and resolve any RLS / security warnings
      before exposing the DB to real traffic.

## 6. Verified badge gating (two separate gates — don't conflate)

> Source: TODO.md → "Verified + Recommended badge logic". The public VERIFIED display is gated by
> **two** independent flags:

- [ ] **6.1 — `is_verified`** — set by Phase 9 **email verification** (§3 / §5.3).
- [ ] **6.2 — Stripe Verified Badge flag** — set by the **$100 one-time purchase** (StripeTODO.md
      S10), Professional-only; auto-set for Premier on activation.
- [ ] **6.3 — Confirm the public listing requires the intended combination** of these before
      showing the badge in production.

## 7. Security & hardening

- [ ] **7.1 — Admin access** (TODO.md): the admin claim-approval surface is currently gated by
      `ADMIN_EMAIL`. Decide the production admin auth model (magic-link / restricted) before go-live.
- [ ] **7.2 — Rotate any secrets** that were pasted into chat/test during setup if they are ever
      promoted toward live (test keys are low-risk, but never reuse a leaked live secret).
- [ ] **7.3 — Bot protection (optional):** consider Cloudflare Turnstile on the registration form
      before opening public signup (skill: `turnstile-spin`).
- [ ] **7.4 — Final production smoke test on the real domain:** register (Free), upgrade to a paid
      tier with a real card, receive auth email, claim-then-pay flow, and confirm the VERIFIED
      badge logic — then refund the test charge.

---

## Cross-references

- **Stripe details:** `StripeTODO.md` (Phases B–F)
- **Email details:** `TODO.md` → Phase 9 (Task 22, E1–E8)
- **Domain:** `TODO.md` → Blocked → Domain setup
- **Architecture invariants:** `architecture.md` (Payments, Email & messaging, auth surfaces)

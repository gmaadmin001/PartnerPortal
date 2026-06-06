# Reusable architecture patterns

A personal playbook of cross-project architecture patterns. Each section names
the concrete tools so the pattern can be lifted into a new project. This file is
**read on-demand** — consult the relevant section when standing up that part of a
new project; it is not auto-loaded into every session.

---

## Email & messaging

### Two-provider email split

- **In-app transactional email → EmailJS** (`https://api.emailjs.com/api/v1.0/email/send`).
  One shared send helper POSTs to a **single reusable template** parameterized by
  `template_params`: subject, greeting, headline, `message_html`, button label/url,
  footnote. The helper **fails soft** — if env vars are missing it logs a warning
  and returns instead of throwing, so a misconfigured environment never crashes a
  request flow.
  - Env: `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`,
    `EMAILJS_PRIVATE_KEY`.
- **Background / worker / bulk email → Resend** (`https://api.resend.com/emails`)
  with hand-built branded HTML, sent from a standalone worker rather than the
  request path. Gate the send behind an env flag (e.g. a `SEND_*` boolean) and
  stamp a `*_sent_at` column on success for idempotency.
  - Env: `RESEND_API_KEY`.

Rule of thumb: one template-driven helper for user-facing transactional mail in
the app; raw-HTML Resend for batch/onboarding jobs in workers.

### Deliverability: send from an authenticated domain (NON-NEGOTIABLE)

The EmailJS template/helper is only the *rendering+send* layer — it does not by
itself get mail to the inbox. What lands transactional mail (especially auth /
magic-link mail, where a spam-filed message = the user literally cannot log in)
is **domain authentication on the sending identity**:

- **Never ship auth/transactional mail from a personal mailbox** (e.g. a
  personal Gmail wired into EmailJS). It has no SPF/DKIM/DMARC alignment with the
  product domain and gets filtered to spam — and mail sent *from* a Gmail account
  *to* that same account (incl. `+aliases`) is a near-worst-case for Gmail's spam
  filter, so it's also a misleading way to test.
- Point the sender at the **product domain** (`noreply@<domain>`) backed by a real
  ESP (Resend / Mailgun / SendGrid / Postmark), and verify the domain so **SPF,
  DKIM, and DMARC** all align. With DNS on Cloudflare the records are quick to add.
- This keeps the architecture intact: the Send-Email-hook → EmailJS template flow
  is unchanged; only EmailJS's underlying **email service** swaps from a personal
  mailbox to the authenticated-domain ESP/SMTP.
- A `200 OK` from the EmailJS API means *accepted for sending*, NOT *delivered to
  inbox*. Verify actual inbox placement (and check Spam/Promotions) before calling
  an email flow done.

### Auth emails delegated to the app (not the auth provider's built-in mailer)

Instead of letting the auth provider send its own templated emails, route them
through the app so branding and copy live in one place:

- Supabase Auth fires a **Standard Webhooks** hook → an **Edge API route** in the app.
- The route **verifies the webhook signature** before trusting the payload:
  - HMAC-SHA256 via Web Crypto (`crypto.subtle`) — no Node-only APIs, so it runs on
    the Edge runtime and is Cloudflare Workers-compatible.
  - **Constant-time** signature comparison.
  - **±5-minute timestamp tolerance** to reject stale/replayed deliveries.
  - **Multi-signature support** (space-separated `v1,<sig>` entries) for key rotation.
  - Secret in `SUPABASE_AUTH_HOOK_SECRET`, format `v1,whsec_<base64>`.
- The route maps `email_action_type` (`signup`, `recovery`, `magiclink`,
  `email_change`, `invite`) → branded templates, builds the provider's
  `/auth/v1/verify?token=...&type=...&redirect_to=...` confirmation URL, and sends
  via the email helper above.

### Typical call sites

All routed through the one email helper:

- The auth webhook (above).
- User / team invite + invite-resend flows.
- The public contact form.

### Multi-channel messaging (intended pattern)

A unified **in-app inbox** where each message carries a **delivery-type badge**
(Email / SMS) and threads link to domain records (jobs, clients, etc.):

- Email via the providers above.
- **SMS via a provider (e.g. Twilio)** — wire it as a second channel behind the
  same compose + inbox surface, with per-message "send via" channel selection.
- **Gate any unbuilt channel behind a feature flag** until it is fully wired.

#### SMS via Twilio (concrete)

- **Plain `fetch`, no Twilio Node SDK** (Worker/Edge-compatible): POST to
  `https://api.twilio.com/2010-04-01/Accounts/<sid>/Messages.json` with
  `Authorization: Basic <btoa(sid:token)>` and a form-encoded `To`/`From`/`Body`.
- All numbers in **E.164** (`+15551234567`). Server-only creds:
  `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`.
- Follows the **failure contract** (see *External provider integrations*): missing
  env → fail soft (warn + return); creds present but Twilio rejects → throw.

#### SMS deliverability: A2P 10DLC registration (NON-NEGOTIABLE gate)

The SMS parallel to "send from an authenticated domain." US application-to-person
SMS over a standard 10-digit long code **will not deliver** until the Twilio
**A2P 10DLC brand + campaign registration** clears (symptom: error `30034`,
messages accepted by the API but never arrive). A `201 Created` from Twilio means
*queued*, NOT *delivered*. **Budget for 10DLC registration up front** — it's an
external approval with lead time, so start it early; the send code can be built
and merged behind a flag while it pends.

---

## Multi-tenant data isolation (RLS is the boundary)

For any app where many unrelated orgs share one database, this is the single most
reusable decision:

- **Every domain row carries a `tenant_id`** (a `family_id`, `org_id`, `account_id`
  — whatever the tenant is). No domain table is exempt.
- **Postgres Row-Level Security is the security boundary, NOT app code.** Policies
  enforce isolation at the database; the app never hand-filters by tenant as the
  primary defense. A missing `WHERE tenant_id = ...` in app code must not be able
  to leak another tenant's data, because RLS already forbids it.
- **Back every policy with helper SQL functions** — e.g. `is_member_of(tenant)` and
  `has_role(tenant, role)` — so policies stay short, consistent, and auditable
  instead of copy-pasting the same subquery into dozens of policies.
- **Membership is a join table**, `memberships(user_id, tenant_id, role)`. A user can
  belong to many tenants with a different role in each — no special-casing, no
  "primary org" column. Role lives on the edge, not on the user.
- **The only code path that bypasses RLS is the service-role client** (see below),
  used deliberately in a small number of server-only routes — never in the app's
  normal request path.

## Two auth surfaces: members vs. token-scoped external actors

Many products have two populations: people who should hold a real account, and
occasional/external actors who must act on exactly one thing without ever logging
in. Model them as two distinct surfaces:

- **Internal users → the auth provider (Supabase Auth) + the memberships table.**
  RLS applies to everything they do; their session acts as themselves.
- **External actors → a signed, revocable magic-link token scoped to ONE entity.**
  They never get an account. Their reads/writes go **only** through dedicated API
  routes (`api/<external>/*`) that (a) validate the token, then (b) use the
  **service-role** client to do the write. A leaked link exposes exactly one
  entity's surface, nothing else, and the token can be revoked without touching
  any account.
- Keep the two surfaces physically separate in the codebase (separate route
  groups) so it's obvious which trust model a given handler is in.

## Stack: Next.js on Cloudflare Workers + Supabase

The baseline for a new full-stack app on this account:

- **Next.js 15** (App Router, TypeScript, `src/`) deployed to **Cloudflare Workers**
  via **`@opennextjs/cloudflare`**.
- **Supabase** (Postgres + RLS + Storage) as the backend.
- **Git-connected deploy: push == deploy.** Cloudflare Workers Builds builds and
  deploys on every push to the deploy branch; it's the only deploy path (no parallel
  GitHub Actions deploy). Confirm the branch before pushing.

Two footguns that cost real time — encode them from day one:

- **`NEXT_PUBLIC_*` must be set as Workers Builds *build* variables, not just
  runtime secrets.** They're inlined into the browser bundle at build time; if they
  only exist as runtime secrets, the client ships `undefined`.
- **Local dev reads server secrets from `.dev.vars`, not `.env.local`.** Prod
  runtime secrets are set with `wrangler secret put`. When you add a new server
  secret, add it in **both** places (`.dev.vars` for local, `wrangler secret` for
  prod) or it'll work in exactly one environment.

## Supabase client roles — one per trust level

Three clients, never interchangeable, chosen by who is acting:

- **anon / browser client** — public, RLS-bound, safe to use from client components.
- **SSR / server client** — acts as the *logged-in member*; RLS applies as that user.
  Used in server components and member-facing route handlers.
- **service-role client** — **server-only, bypasses RLS.** Used only in the
  controlled external-actor routes (see *Two auth surfaces*) and trusted
  server/cron jobs. **Must never be importable from a client component**; keep the
  key out of any browser bundle. A lint/structure convention (e.g. a `service.ts`
  that throws if bundled for the client) is worth it.

## External provider integrations (Workers/Edge)

Conventions every third-party integration on this stack follows — Anthropic,
ElevenLabs, Deepgram, Twilio, EmailJS/Resend all conform:

- **Plain `fetch` + the provider's own auth header — never the vendor's Node SDK.**
  This is what lets the call run on Cloudflare Workers/Edge at all. Examples:
  Basic auth via `btoa` (Twilio), `xi-api-key` (ElevenLabs), `Token` (Deepgram),
  `Authorization: Bearer` / `x-api-key` (most others). No Node-only APIs (use
  `FormData`/`Blob`/Web Crypto, not `Buffer`/`crypto` Node builtins).
- **Keys are server-only.** Sensitive calls run *behind a validated route* (e.g.
  STT/TTS behind the token-checked external-actor routes), never from the client.
- **A consistent failure-contract taxonomy** (the reusable gem — apply it to every
  provider helper):
  - **Missing config → fail soft** (warn + return). A half-configured environment
    must never crash a request flow.
  - **Real API error with creds present → throw**, so the caller can log/surface or
    deliberately swallow it.
  - **Best-effort cleanup → never throws** (e.g. deleting an orphaned remote
    resource). A cleanup miss must not block the primary write.
- **An HTTP 2xx means *accepted*, not *delivered/done*.** Verify the real end state
  (inbox placement, SMS arrival, job completion) before calling a flow done.
- **Privacy: persist provider IDs, not the sensitive source media.** Send the
  sensitive input straight to the provider and store only the returned identifier
  (e.g. a voice/clone id), so you don't warehouse biometric or regulated data the
  provider can hold for you.

### Server-side-only AI calls

All model/provider calls (Anthropic, etc.) live behind `api/ai/*` — no API key ever
reaches the client bundle. Same rule as any provider above; called out separately
because it's easy to leak an LLM key into a client component "just to prototype."

## Voice: TTS & STT

Proven choices for a voice-first, bilingual product (both conform to the provider
conventions above):

- **TTS / voice cloning → ElevenLabs**, model `eleven_multilingual_v2`. One cloned
  voice per speaker; **language is chosen at *synthesis* time, not clone time**, so a
  single cloned voice speaks multiple languages. Multipart clone upload via
  `FormData`; persist only the returned `voice_id` (see the privacy rule).
- **STT → Deepgram** `nova-3` with `language=multi` for **code-switching** (speakers
  mixing languages mid-sentence) — returns one transcript with the languages
  interleaved as spoken. `smart_format` + `punctuate` for readability.
- **Principle:** for bilingual/multilingual products, pick models that handle
  code-switching natively, and keep **capture, transcription, and translation as
  separate stages** — don't translate or "correct" language at capture time; defer
  translation to its own later feature.

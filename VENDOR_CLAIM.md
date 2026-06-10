# Vendor Claim Process — How It Works & How to Operate

## What it is

The claim flow lets a company "claim" a listing that was added to the directory by an admin
(rather than by the company itself). When a listing has no owner (`user_id = NULL` in the DB),
any signed-in user can submit a claim. An admin reviews and either approves or rejects it.
Approval transfers full ownership of the listing to the claimant.

This supports the pre-population strategy: an admin bulk-inserts company profiles with basic
public data, then companies discover and claim their own listings.

---

## Environment variable required

| Variable | Type | Value |
|---|---|---|
| `ADMIN_EMAIL` | Plain text variable | The email address of the admin account |

**Local dev:** add to `.dev.vars`:
```
ADMIN_EMAIL=you@example.com
```

**Production:** Cloudflare Dashboard → Workers & Pages → `partnerportal` → Settings →
Variables and Secrets → **+ Add** → Type: Variable, Name: `ADMIN_EMAIL`, Value: your email.

> After adding to Cloudflare, push any commit to trigger a redeploy so the value is picked up.

---

## How a user claims a listing

1. A user visits any provider profile page (`/services/<slug>`) for a listing with no owner.
2. At the bottom of the page, a **"Is this your company?"** section appears.
3. **If not signed in:** a "Claim Listing" button links to `/register?claim=<slug>`.
   After login, they are automatically redirected back to the listing page.
4. **If signed in:** clicking "Claim Listing" submits a claim request immediately.
5. The claim section updates to an amber **"Your claim is under review"** banner.
6. If a previous claim was rejected, the user sees a message and can re-submit.

---

## How an admin reviews claims

1. Go to **`/admin/claims`** (only accessible when signed in as `ADMIN_EMAIL`).
2. All pending claims are listed with:
   - Company name and a link to the public listing
   - Claimant's email address
   - Date the claim was submitted
3. **Approve** — transfers `user_id` ownership to the claimant. The claimant can now
   sign in, access their dashboard, and edit the listing. Listing status is set to `pending`
   (not immediately public — admin still controls when it goes live by setting `status = 'active'`
   via Supabase directly or a future admin panel).
4. **Reject** — clears the claim. The claimant can submit a new request if needed.

---

## How to create ownerless listings (for pre-population)

Insert rows into `service_registrations` with `user_id = NULL`. These listings will show the
claim section to visitors. Example via Supabase SQL editor:

```sql
INSERT INTO service_registrations (
  company_name, slug, website_url, short_description,
  primary_category, sub_category,
  headquarters_country, headquarters_city,
  status, membership_plan
) VALUES (
  'Acme Relocation',
  'acme-relocation',
  'https://acmerelocation.com',
  'Full-service relocation management company.',
  'Program Management & Outsourcing',
  'Relocation Management Companies (RMCs)',
  'United States',
  'Chicago',
  'active',
  'Basic'
);
-- user_id intentionally omitted (NULL) so the listing is claimable
```

Set `status = 'active'` if you want the listing visible publicly before it is claimed.
Set `status = 'pending'` to keep it hidden until claimed and reviewed.

---

## Database columns added (migration)

On `service_registrations`:

| Column | Type | Description |
|---|---|---|
| `claimed_by` | `uuid` (FK → `auth.users`) | User ID of whoever submitted the claim |
| `claimed_at` | `timestamptz` | When the claim was submitted |
| `claim_status` | `text` | `pending` / `approved` / `rejected` — NULL means unclaimed |

---

## File map

| File | Purpose |
|---|---|
| `src/app/api/claim/route.ts` | POST — submit a claim (authenticated user, service-role write) |
| `src/app/api/admin/approve-claim/route.ts` | POST — approve a claim (admin only) |
| `src/app/api/admin/reject-claim/route.ts` | POST — reject a claim (admin only) |
| `src/app/admin/claims/page.tsx` | Server page — fetches pending claims, gates to ADMIN_EMAIL |
| `src/app/admin/claims/AdminClaimsClient.tsx` | Client component — approve/reject buttons + live state |
| `src/components/services/ClaimSection.tsx` | UI component shown on ownerless listing profile pages |
| `src/app/services/[slug]/page.tsx` | Profile page — renders ClaimSection when `user_id` is NULL |
| `src/components/auth/LoginForm.tsx` | Redirects to listing after login when `?claim=<slug>` param is present |

---

## Security notes

- The `/api/claim` route validates the user's session and confirms they don't already own
  the listing before writing. The write uses the service-role client because the user doesn't
  own the row (RLS would block a direct update).
- `/api/admin/approve-claim` and `/api/admin/reject-claim` both check that the caller's
  email matches `ADMIN_EMAIL` before doing anything. A non-admin gets a 403.
- `/admin/claims` redirects to `/` if the signed-in user is not the admin email.
- Approving a claim sets the listing's `user_id` — from that point on, normal RLS applies
  and only the new owner can edit their listing.

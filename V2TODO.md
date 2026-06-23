# V2TODO — PartnerPortal / ReloCentra

Last updated: 2026-06-23

> **Prerequisites: complete [GOLIVETODO.md](GOLIVETODO.md) first.** V2 features do not start until the site is live at relocentra.com with real Stripe keys and production email.

---

## Phase 1 — Current (Complete or Near-Complete)

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Stripe integration (checkout, webhooks, cancel, resume) | ✅ Done | |
| 2 | Admin dashboard — improved UI | ✅ Done | |
| 3 | 410+ listings imported | ✅ Done | |
| 4 | New taxonomy (primary/sub-category) | ✅ Done | |
| 5 | Pagination — admin 50/page, search 25/page | ✅ Done | |
| 6 | Media persistence on plan downgrade | ✅ Done | Photos stay in DB; hidden until re-upgrade |
| 7 | Plan feature gates fixed (suffixed plan names) | ✅ Done | "Premier – Monthly" now correctly resolves |
| 8 | Add Michael as admin | ✅ Done | michael@globalmobilityadvisor.com |
| 9 | Add Steven as admin | ⏳ Waiting | Email address TBD — Michael to send |
| 10 | Plan switch UX — Stripe confirmation page (paid→paid) | ⏳ Waiting | Code deployed; Paul needs to configure Stripe Customer Portal |
| 11 | Relocentra rebrand | ⏳ Waiting | Michael to provide wording + color scheme |
| 12 | relocentra.com domain pointed to site | ⏳ Waiting | Paul's task |
| 13 | AI project — Tidio replacement | ⏳ Next | Alan to start; Paul to review requirements first |

---

## Phase 1 — Small Remaining Fixes

- [ ] Annual ↔ Monthly switch clarification — better in-product messaging about proration/credits (Paul to check Stripe credit policy first)
- [ ] Test accounts — create 5–10 accounts to verify all flows before launch
- [ ] Stripe: switch from test mode to live when ready

---

## Version 2 Feature List

> Michael to compile and send full list. Items below captured from the meeting.

### User & Auth
- [ ] Normal user registration — buyers/hirers/HR professionals can create accounts without a vendor or realtor listing; allows saving favourites, leaving reviews, and receiving matched recommendations
- [ ] Magic link admin access already in place — maintain for V2

### Directory & Search
- [ ] AI-enabled search (natural language, trains on taxonomy + descriptions)
  - Paul has a working version on Notary Navigator — demo planned
  - More complex than a standard search bar; needs real-time term training
- [ ] Expand supplier base — up to ~1,000 additional listings

### Messaging & Email
- [ ] Email functionality on company profiles (contact form or direct email link)
- [ ] Mailing list / marketing emails
  - **Use Brivo (or similar), NOT EmailJS** — EmailJS is not for mass sends
  - Paul flagged this explicitly

### Engagement
- [ ] AI chat / assistant (Tidio replacement)
  - Should be encouraging, supportive, sales-oriented
  - Needs to replicate a previous survey-based assessment tool
  - Michael to send requirements → Paul reviews → Alan builds

### Reviews & Ratings
- [ ] Bring back star ratings & written reviews on listing pages
- [ ] Reviews tied to normal user accounts (requires normal user registration above)
- [ ] Admin moderation queue for submitted reviews
- [ ] Premier listings surface reviews prominently; lower plans show count only or lock

### Other V2 Ideas (to be confirmed by Michael's list)
- [ ] Thought leadership / blog posts for Premier users

---

## Waiting On

| Person | Item |
|--------|------|
| Michael | Steven's admin email address |
| Michael | Relocentra rebrand details (wording, colors) |
| Michael | Full Version 2 feature list |
| Michael | AI project (Tidio) requirements → send to Paul |
| Paul | Stripe Customer Portal configuration (plan switch UX) |
| Paul | relocentra.com domain → point to Cloudflare Worker |
| Paul | Review AI requirements before Alan starts |
| Paul | Stripe credit policy check for annual ↔ monthly switches |

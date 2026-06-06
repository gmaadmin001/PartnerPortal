# Overarching Spec — Global Mobility Adviser (GMA) React/Tailwind Recreation

---

## Brand & Shared Shell

**Brand name:** Global Mobility Adviser
**Color palette:** Professional blue + white, corporate tone (no loud accent colors observed)
**Logo:** "Global Mobility Adviser" wordmark, top-left
**Global nav:** Home / Solutions / Courses / About Us / Resources / Contact Us + Sign In (top-right)

**Footer (shared across all pages):**
- Logo + tagline: *"At Global Mobility Adviser, we deliver results you can trust, led by Michael Ray, an expert in Talent Mobility, Relocation, and Remote Work strategies."*
- Newsletter "Subscribe now" CTA
- Contact: (623)-290-1143 · contactus@honeydew-capybara-608687.hostingersite.com
- Sitemap links: Solutions / Education / About Us / Resources / Contact Us
- Policy links: Privacy Policy / Copyright Policy / Terms of Service
- © 2025 Global Mobility Adviser All Rights Reserved
- LinkedIn social icon

---

## Page 1 — `/register/` (Login + Register)

**Layout:** Two-panel — form panel left, company info panel right (or stacked on mobile)

**Login Form:**

| Field | Type | Notes |
|---|---|---|
| Username or Email Address | text/email | — |
| Password | password | "Show Password" toggle |
| Remember Me | checkbox | — |
| Lost Password? | link | password recovery |

**CTAs:** Primary "Log In" button · "Register" link to account creation
**Social auth:** OR divider present (at least one social login option implied)

**Info panel:** Brief GMA description mentioning Michael Ray + contact details (phone/email)

---

## Page 2 — `/add-service/` (Provider Registration — Multi-step)

**Step indicator:** 4 steps: **Service → Details → Membership Plans → Finish**

### Step 1 — Registration Type

Toggle/radio: **Vendor** | **Realtor**

### Vendor Fields

| Field | Type | Required |
|---|---|---|
| Primary Category | dropdown | yes |
| Sub Category | dependent dropdown | yes |
| Company Name | text | yes |
| Website URL | text | yes |
| Short Description | textarea | yes |
| Headquarters Country | dropdown (100+ countries) | yes |
| Headquarters City | text | yes |
| Countries Served | multi-select dropdown | — |
| Delivery Model | radio: Direct / Aggregator / Mixed / Franchise / Unknown | — |
| Company Size | radio: 1–50 / 51–500 / 500+ | — |
| Certifications | text/tag input | — |
| Contact Name | text | — |
| Contact Email | email | — |
| Contact Phone | tel | — |

### Realtor Fields

| Field | Type | Required |
|---|---|---|
| Brokerage/Agent Name | text | yes |
| Website URL | text | yes |
| Headquarters Country | dropdown | yes |
| Headquarters City | text | yes |
| License Number | text | — |
| Service Areas | multi-select dropdown | — |
| Property Type | select | — |
| Short Bio | textarea | yes |
| Contact Name | text | — |
| Contact Email | email | — |
| Contact Phone | tel | — |

### Step 3 — Membership Plans (3 tiers)

| Plan | Price | Notable Features |
|---|---|---|
| Free | $0/mo | Hosted listing, basic visibility |
| Standard | $100/mo | Priority support, directory membership, payment plans |
| Premium | $200/mo | Premium support, affiliate tracking, membership cards, analytics |

Each tier has a "Select Plan" button.

### Step 4 — Finish

Confirmation/success state (details TBD from design docs)

---

## Page 3 — `/services-page/` (Services Directory & Search)

**Layout:** Filter panel + results area (likely sidebar filters or top filter bar)

### Filters

| Filter | Type |
|---|---|
| Service Type | dropdown (Program Management, Strategy & Advisory, Moving Belongings, Housing, Immigration, Tax/Payroll, etc.) |
| Sub-service | dependent dropdown |
| Country | dropdown (global, A–Z) |
| State/Region | dropdown (North America, EMEA, APAC, Global) |
| Industry | dropdown (Technology, Energy, Financial Services, etc.) |
| Integration Scope | checkbox/radio: Domestic / International / Hybrid + SAP / Workday |
| Company Size | radio/checkbox: Small / Medium / Large |
| Company Name | text input |
| Zip Code | text input |
| Certifications | multi-select (Certified Relocation Professional, Global Mobility Specialist, etc.) |
| Diversity badges | multi-select |

### Results Area

Service provider cards (fields TBD — likely name, category, location, brief description, contact/CTA)

---

## Open Questions (to align on once design docs are reviewed)

1. **Color tokens** — exact hex values for primary blue, secondary, text, border, error states
2. **Typography** — font family, weight hierarchy (H1–H4, body, label, caption)
3. **Register page** — does it include a "Register" tab alongside login, or is registration a separate page flow?
4. **Results card layout** — fields shown per card, card vs. list view, pagination vs. infinite scroll
5. **Step 2 ("Details")** on Add Service — distinct layout beyond vendor/realtor fields not confirmed from live site
6. **Empty / error / success states** — specified in old design docs?

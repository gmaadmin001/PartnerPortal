# Design Doc vs. Live Site — Discrepancies

Comparing: "Relocation Provider Hub Open Questions.pdf" against the live WordPress pages at
`/register/`, `/add-service/`, and `/services-page/`.

Color key from PDF: **green = concluded/decided**, **orange = open question/unresolved**.

---

## 1. Vendor Type Terminology

| Source | Term used |
|---|---|
| Design doc (concluded, green) | "Simple" and "Realtor" |
| Live site (`/add-service/`) | "Vendor" and "Realtor" |

**Discrepancy:** The design doc's confirmed term for the non-realtor vendor type is "Simple." The live site uses "Vendor." These need to be reconciled — which term is canonical going forward in the React build?

---

## 2. Realtor Placement in Taxonomy

| Source | Where Realtor lives |
|---|---|
| Design doc (taxonomy section) | A subcategory under **Housing & Accommodation → Real Estate Brokers & Agents** |
| Live site (`/add-service/`) | A top-level toggle alongside Vendor — parallel, not nested under any category |

**Discrepancy:** The design doc explicitly notes *"This is where the Realtor segment lives — under Real Estate Brokers & Agents."* The live site treats Realtor as a separate peer vendor type at the top of registration, with its own completely separate field set. This is a structural difference.

---

## 3. Category Taxonomy — Number and Names

| Source | Structure |
|---|---|
| Design doc — **current Relocentra taxonomy** (pages 1–7) | **10 categories**, 38 subcategories |
| Design doc — **Appendix A / Original Plan** (marked old/prior) | **7 categories** |
| Live site (`/add-service/` Primary Category dropdown) | Partial list visible — includes "Getting Established at the Destination," "Health, Safety & Security," "Housing & Accommodation," "Immigration & Work Authorization" — full list not confirmed |

**Discrepancy:** It is unclear whether the live site's dropdown reflects the current 10-category Relocentra taxonomy or the older 7-category structure. The React build should target the 10-category taxonomy (the concluded green section), but this needs to be confirmed against the actual WordPress data.

The 10 categories (authoritative per design doc):
1. Program Management & Outsourcing
2. Strategy, Policy & Advisory
3. Moving Belongings
4. Housing & Accommodation
5. Immigration & Work Authorization
6. Tax, Payroll & Compensation
7. Getting Established at the Destination
8. Supporting Employees & Families
9. Health, Safety & Security
10. Technology & Data

---

## 4. Sub-categories Field Type

| Source | Field behavior |
|---|---|
| Design doc (field matrix, Subscriber tier) | **Multi-select**, required |
| Live site (`/add-service/`) | Single dependent **dropdown** (not multi-select) |

**Discrepancy:** The design doc is explicit that a vendor can belong to multiple subcategories (e.g., a Big 4 firm appearing in Expatriate Tax, Compensation Consulting, and Mobility Consulting). The live site only allows one sub-category selection. This is a meaningful functional gap.

---

## 5. Subscription Tier Names and Pricing

| Design doc tiers | Live site tiers |
|---|---|
| Standard — free, 1 service, not editable | Free — $0/mo |
| Subscriber — paid Tier 1, up to 3 services | Standard — $100/mo |
| Premium — paid Tier 2, up to 10 services | Premium — $200/mo |

**Discrepancy — names:** Design doc's free tier is called "Standard"; live site's free tier is called "Free." The design doc's paid Tier 1 is "Subscriber"; live site calls it "Standard." This naming inversion will cause confusion.

**Discrepancy — pricing:** Design doc mentions $25/month as a suggested starter price (noted as a question, orange). Live site shows $100/mo for Standard and $200/mo for Premium. The $25 figure is unresolved/different.

**Discrepancy — feature descriptions:** The live site's plan feature bullets describe infrastructure/hosting features ("Premium PMPro-optimized hosting," "80GB storage," "Redis caching," "CDN integration," "dedicated virtual server"). The design doc's tiers are defined by marketplace capabilities (number of services, editability, profile pages, premium fields). The live site descriptions appear to be generic WordPress/PMPro plan copy, not the business-specific tier logic from the design doc.

---

## 6. Fields Gated by Tier vs. Shown at Registration

The design doc defines a clear tier-gating model for vendor fields:

| Tier | Fields |
|---|---|
| Standard (free) | Company Name, Website URL, Short Description, Primary Category, Sub-categories, HQ Country, HQ City, Delivery Model |
| Subscriber (paid T1) | + Countries Served, Company Size, Certifications, Services Detail (checkbox), Contact Name/Email/Phone |
| Premium (paid T2) | + Logo, Company Statement, Office Locations, Reviews, Media Gallery |

**Discrepancy:** The live `/add-service/` form shows Subscriber-tier fields (Countries Served, Company Size, Certifications, Contact info) presented upfront to all users during initial registration, with no tier gate visible. Premium fields (Logo, Company Statement, Office Locations, Reviews, Media Gallery) are absent from the form entirely.

This may be an intentional design choice (collect all data at registration, gate editing/display later by tier), but it conflicts with the design doc's model and needs clarification.

---

## 7. "Services Detail" Field — Missing from Live Site

| Source | Status |
|---|---|
| Design doc (field matrix, Subscriber tier) | "Services Detail — Checkbox list — granular service flags" |
| Live site (`/add-service/`) | Not present |

**Discrepancy:** The Services Detail checkbox field (meant to capture granular service flags per category/subcategory) does not appear in the live site's registration form at all.

---

## 8. Realtor — "Service Areas" Field Type

| Source | Field type |
|---|---|
| Design doc | **State/region** multi-select |
| Live site | **Country** multi-select |

**Discrepancy:** For Realtors, the design doc specifies Service Areas as a state/region selector (implying primarily US-focused geographic coverage). The live site implements it as a country dropdown. These serve different geographic granularities and affect how search/filtering works for Realtor listings.

---

## 9. Realtor — "ZIP Codes Served" Field Missing

| Source | Status |
|---|---|
| Design doc (Premium tier, Realtor) | ZIP Codes Served — up to 500 — premium field |
| Live site | Not shown anywhere in the registration form |

**Discrepancy:** The ZIP Codes Served field (a premium Realtor field) is absent from the live site. This could be intentional (post-registration edit only), but it is not visible.

---

## 10. Delivery Model — Field Control Type

| Source | Control |
|---|---|
| Design doc (field matrix) | Dropdown |
| Live site | Radio buttons (Direct / Aggregator / Mixed / Franchise / Unknown) |

Minor discrepancy — same options, different UI control. Worth standardizing in the React build.

---

## 11. Services Page — Filter Set Gaps

| Filter | Design doc | Live site |
|---|---|---|
| Platform integration options | Topia, Equus, SAP, Workday | SAP and Workday only |
| Languages Supported | Listed in core info / filter candidates | Not visible as a filter |
| Zip Code search | Not mentioned as a search filter | Present as a filter field |
| Listing Type / Verification badge | Mentioned (Pre-Populated / Verified / Premium) | Not visible as a filter |
| Service Scope | Domestic / International / Hybrid (confirmed filter tag) | Listed as "Integration scope: Domestic / International / Hybrid" — overlapping but labeled differently |

**Discrepancy:** Topia and Equus are listed in the design doc as platform integrations alongside SAP and Workday, but the live site only exposes SAP and Workday as filter options.

**Discrepancy:** Zip Code appears as a search filter on the live site but is not listed as a filter tag in the design doc's Filter Tags table. It is a Realtor profile field (ZIP Codes Served), not a search filter dimension.

**Discrepancy:** Languages Supported is mentioned in the design doc as especially helpful for DSPs, legal, and tech tools — it does not appear as a filter on the live site.

---

## 12. Pre-Populated / "Claim Your Listing" Flow — Missing from Live Site

| Source | Feature |
|---|---|
| Design doc (concluded, green) | Companies pre-loaded with basic data; companies must purchase a subscription to edit or modify their information; initial outreach = "verify the data we have" |
| Live site | Only self-service registration visible; no claim/verify flow present |

**Discrepancy:** The design doc's concluded strategy is to pre-populate ~400–650 suppliers and then reach out for verification/upsell. The live site only shows a self-service add-service registration form. No "claim your existing listing" path is visible.

---

## 13. Portal / Product Branding — Unresolved

| Source | Status |
|---|---|
| Design doc (orange — open question) | Concern about the name "Partner Portal" — want to avoid implying vendors are GMA's partners. Alternatives listed: Directory, Source, Marketspace, Resource, Navigator, Gateway, Connect, Hub |
| Live site | No distinct portal brand name visible; it lives as part of the main GMA site |

**Not a code discrepancy**, but an unresolved product decision that will affect page titles, nav labels, and copy in the React build. Needs a decision before implementation.

---

## 14. AI Chatbot

| Source | Status |
|---|---|
| Design doc (concluded, green) | "We will build the chatbot **after** the registration process is 100% complete." |
| Live site | No chatbot visible |

**Not a discrepancy** — the design doc explicitly defers chatbot to a later phase. Confirmed out of scope for the current 3-page build.

---

## Summary Table

| # | Area | Design Doc Says | Live Site Shows | Severity |
|---|---|---|---|---|
| 1 | Vendor type name | "Simple" | "Vendor" | Medium — naming |
| 2 | Realtor placement | Subcategory under Housing | Top-level peer type | High — structural |
| 3 | Category count | 10 (Relocentra) | Unclear / partial | High — data model |
| 4 | Sub-categories field | Multi-select, required | Single dropdown | High — functional |
| 5 | Tier names & pricing | Standard / Subscriber / Premium, ~$25 starter | Free / Standard / Premium, $0/$100/$200 | High — UX + business |
| 6 | Tier field gating | Fields gated by subscription level | Subscriber fields shown to all at registration | Medium — functional |
| 7 | Services Detail field | Checkbox list, Subscriber tier | Absent | Medium |
| 8 | Realtor Service Areas type | State/region multi-select | Country multi-select | High — geographic scope |
| 9 | Realtor ZIP Codes Served | Premium field (up to 500) | Absent from form | Low — premium only |
| 10 | Delivery Model control | Dropdown | Radio buttons | Low — UI only |
| 11 | Services page filters | Topia/Equus/SAP/Workday, Languages | SAP/Workday, Zip Code (extra) | Medium |
| 12 | Pre-populated listing claim | Core strategy (concluded green) | Not visible on live site | High — product flow |
| 13 | Portal branding | Open question, unresolved | No distinct portal name | Medium — product decision |
| 14 | AI chatbot | Deferred until post-registration | Absent (expected) | N/A |

# Detailed Summary: Updated Supplier Taxonomy and Supplier List (June 17, 2026)

*Prepared for comparison against the prior/old taxonomy version. Source file: `Updated_Supplier_Taxonomy_and_Supplier_List_June_17_2026.xlsx`*

---

## 1. Workbook Structure (6 sheets)

| Sheet | Dimensions | Purpose |
|---|---|---|
| `Supplier List — Cleaned` | A1:Z412 (411 data rows) | Master supplier list, both OLD and NEW category fields side-by-side |
| `Step Zero — Deletions` | A1:C94 (93 data rows) | Log of records removed from the original 497-record list |
| `Summary` | A1:B15 | High-level cleaning stats |
| `Remap Summary` | A1:B23 | Stats on remapping records to new taxonomy |
| `Relocentra Taxonomy` | A1:D55 | **The canonical NEW taxonomy definition** (categories + subcategories + notes) |
| `Change Log` | A1:C11 | Explicit list of structural changes from old → new |

---

## 2. The NEW Canonical Taxonomy ("Relocentra by Global Mobility Adviser")

Header text on the taxonomy sheet: **"Updated June 2026 \| 10 Categories + Realtors \| 40 Subcategories \| Buyer-Centric Structure"**

This is an **11-category, 41-subcategory** structure (10 numbered categories with 40 subcategories total, plus an 11th standalone "Realtors" category with 1 subcategory — matching the header's "10 Categories + Realtors").

### Full new taxonomy tree:

**1. Program Management & Outsourcing**
- Relocation Management Companies (RMCs) — *Full-service third-party program administrators*
- Move Coordination Specialists — *Unbundled move management; not full RMCs*
- Lump Sum / Flex Program Administrators — *Tech-enabled lump sum and flex benefit platforms*

**2. Strategy, Policy & Advisory**
- Mobility Consulting Firms — *Independent advisory; policy design; program strategy — includes GMA (Global Mobility Adviser, the platform owner)*
- Benchmarking & Data Services — *Policy benchmarking, compensation surveys, industry data*

**3. Moving Belongings**
- Household Goods Movers (Domestic & International) — *HHG van lines, agents, and origin/destination movers*
- Freight Forwarders — *International freight and customs coordination*
- Pet Relocation Specialists — *Door-to-door pet transport and documentation services*
- Vehicle Transport Specialists — *Auto transport; domestic and international*
- Storage Providers — *(no note; restored as standalone — see Change Log)*

**4. Housing & Accommodation**
- Corporate Housing / Temporary Accommodations — *Furnished short-term apartments and serviced residences*
- Real Estate Brokers & Agents — *Corporate-oriented real estate brokerage networks*
- Home Sale Program Administrators — *BVO, GBO, and home sale program management*
- Property Management Services — *Rental property management for expat and mobile workforce*
- Title / Appraisal & Closing Services — *Title insurance, closing attorneys, appraisal firms*
- Furniture & Appliance Rental — *FF&E rental for temporary housing or assignment setup*
- Relocation Mortgage & Lending Services — *(NEW subcategory — see Change Log)*

**5. Immigration & Work Authorization**
- Immigration Law Firms — *Attorney-led immigration and visa legal services*
- Corporate Immigration Service Providers — *Non-attorney corporate immigration processing and compliance*
- Document & Credential Services — *(no note)*

**6. Tax, Payroll & Compensation**
- Expatriate Tax Services — *Individual and corporate expat tax preparation and equalization*
- Global Payroll Providers — *Multi-country payroll processing and shadow payroll*
- Employer of Record / PEO Services — *EOR/PEO for global employment without entity setup*
- Compensation & Benefits Consulting — *(no note)*

**7. Getting Established at Destination**
- Destination Services Providers (DSPs) — *Area orientation, home finding, settling-in services*
- School Search & Education Consultants — *(no note)*

**8. Supporting Employees & Families**
- Intercultural & Cross-Cultural Training — *Cultural orientation, intercultural coaching, culture shock support*
- Language Training Providers — *Corporate and individual language instruction*
- Spouse & Partner Career Services — *Career coaching, job search support, professional networks for partners*
- Mental Health & Wellbeing Services — *EAP, counseling, and mental health support for mobile employees*
- Executive Coaching — *(no note)*

**9. Health, Safety & Security**
- Travel Risk & Security Services — *Duty of care, travel risk management, crisis response*
- International Health Insurance — *Expat and global health insurance plans*
- Travel Health & Medical Services — *(no note)*

**10. Technology & Data**
- Mobility Management Platforms — *Assignment management software, workflow automation, tracking*
- Immigration Technology — *Tech-enabled immigration case management platforms*
- Cost of Living & Hardship Data — *COL indices, hardship ratings, location allowance data*
- Tax Technology Platforms — *Software for tax equalization calculation and compliance*
- Expense Management Software — *Relocation expense tracking, reimbursement processing*
- Compliance & Tracking Tools — *(no note)*

**11. Real Estate Professionals (Realtors)**
- Realtors Serving the Mobility Market — *Licensed agents/brokers with corporate relocation experience; ~1,000 profiles; distinct schema (license #, ZIP codes served, property types, bio)*

---

## 3. The OLD Taxonomy (as reconstructed from the "Primary Category" / "Subcategories" columns still present in the supplier list)

The old structure appears to have been a **7-category** scheme (per the Change Log: *"7-category structure retired; 10+1 canonical structure locked"*). The 7 distinct named values found in the `Primary Category` column are:

1. Logistics & Travel Support (98 records)
2. Housing & Accommodation (69 records)
3. Employee Benefits & Support Services (28 records)
4. Program Management & Administration (25 records)
5. Legal, Tax & Compliance (14 records)
6. Technology & Data (4 records)
7. *(Unclear or Unknown — 150 records; likely a placeholder/uncategorized bucket rather than a true 7th category)*
8. *(blank/null — 23 records)*

**Old `Subcategories` field — 24 unique values found in the data** (this seems to have been a flatter, less formal list than the new structure's nested subcategories):
- Relocation Management Companies (RMCs) — 92
- Temporary Housing / Corporate Apartments — 44 (+1 lowercase-typo variant "temporary Housing / Corporate Apartments" — 1, indicating a data entry inconsistency)
- Household Goods Movers (Domestic & International) — 33
- Storage Providers — 30
- School Search & Education Consulting — 29
- Destination Services — 27
- Global Mobility & Assignment Management — 23
- Auto Transport — 16
- Immigration Services — 16
- Real Estate Broker Networks — 13
- Language Training — 11
- Rental Assistance — 11
- Property Management — 8
- Pet Relocation — 8
- Home Sale / Purchase Support — 6
- Mobility Consulting & Advisory — 5
- Training & Certification Providers — 4
- Spouse/Partner Career Support — 4
- Freight Forwarders — 3
- Legalization / Apostille — 1
- Mental Health & Adjustment Services — 1
- Global Tax / Equalization — 1
- (blank) — 24

**Notably**, 150 of 411 records (36.5%) carry "Unclear or Unknown" as their old Primary Category despite having a specific old Subcategory — suggesting the old taxonomy's top-level/sub-level mapping was inconsistent or that "Primary Category" wasn't reliably populated even though a subcategory was known. Of those 150 "Unclear" records, the most common old subcategories were RMCs (50), School Search & Education Consulting (15), and Destination Services (13).

---

## 4. Explicit Changes Documented in the "Change Log" Sheet

| Change | Detail | Rationale |
|---|---|---|
| OLD → NEW taxonomy | 7-category structure retired; 10+1 canonical structure locked | Buyer-centric redesign |
| Category 11 added | Real Estate Professionals (Realtors) — distinct profile schema | ~1,000 realtors; different data fields (license #, ZIP codes, property types, bio) |
| New subcategory added | Cat 4: Relocation Mortgage & Lending Services | Covers relocation lending banks; not previously represented |
| Subcategory retired (then reversed) | Old "Storage Providers" as standalone — folded into HHG Movers | Storage is ancillary to moving, not buyer-searched independently |
| Subcategory retired | "Remote Work Enablement" — removed entirely | Freelance platforms (Fiverr, Upwork) are not mobility suppliers |
| Subcategory retired | Generic "Training & Certification Providers" — replaced | Too broad; split into Intercultural, Language, Spouse/Partner, Mental Health, Executive Coaching (all under new Cat 8) |
| Step Zero removals | ~40 non-qualifying records flagged for deletion | Consumer apps, civic orgs, blank records, wrong industry |
| GMA retained | Global Mobility Adviser listed in Cat 2 — Mobility Consulting Firms | Platform owner; Premier listing; not a conflict |
| Banks retained | Relocation lending banks retained; re-categorized to new Cat 4 | POC narrowing required before outreach |
| **2026-06-09 reversal** | "Storage Providers" **restored** as standalone subcategory under Cat 3 — Moving Belongings | **Michael Ray decision — reverses the prior elimination noted above** |

**⚠️ Important nuance for comparison purposes:** The Change Log contains an internal contradiction/timeline: it first states Storage Providers was *folded into* HHG Movers, then a later-dated entry says it was *restored* as standalone. The final taxonomy sheet (`Relocentra Taxonomy`) **does** list Storage Providers as a standalone subcategory under Category 3 — so the restoration is the final/current state. However, in the actual remapped supplier data, only **2 records** carry "Storage Providers" as their New Subcategory, while **99 records** carry "Household Goods Movers" — implying most former Storage Providers entries were remapped into HHG Movers anyway, and the standalone subcategory exists in the taxonomy but is very sparsely populated in current data. This is worth flagging when comparing to the old taxonomy, which had 30 records tagged "Storage Providers."

---

## 5. Supplier List Statistics (411 working records, post-Step-Zero)

### Record counts
- **Original record count:** 497
- **Records removed (Step Zero):** stated as 86 in the `Summary` sheet, **but the `Step Zero — Deletions` sheet actually lists 93 distinct named records** (497 − 93 = 404, not 411). **This is a numerical discrepancy between sheets that should be checked against the old taxonomy file** — possibly 7 records were added to the deletions log after the Summary sheet was last calculated, or the Summary stat is stale.
- **Working record count after Step Zero:** 411 (matches actual row count in `Supplier List — Cleaned`)
- **No duplicate company names** found in the final 411-record working list.

### Step Zero deletion reasons (93 records, grouped)
| Reason Group | Count |
|---|---|
| Blank / Dead / No Data | 40 |
| Borderline | 18 |
| Consumer / General Public Tools | 14 |
| Wrong Industry | 8 |
| Membership Orgs / Nonprofits | 7 |
| Freelance / Remote Work Platforms | 3 |
| Duplicate | 3 |

Examples of "Consumer / General Public Tools" removed: Babbel, Booking.com, Canva, Coursera, Duolingo, Fiverr, Glassdoor, Hotels.com, Instant Immersion, Resume.io, Spotahome, TopCV, Udemy, Zety Resume Builder.

### New Category distribution (411 records remapped)
| # | New Category | Count |
|---|---|---|
| 3 | Moving Belongings | 125 |
| 4 | Housing & Accommodation | 89 |
| 7 | Getting Established at Destination | 70 |
| 1 | Program Management & Outsourcing | 61 |
| 8 | Supporting Employees & Families | 23 |
| 5 | Immigration & Work Authorization | 19 |
| 2 | Strategy, Policy & Advisory | 11 |
| 10 | Technology & Data | 8 |
| 6 | Tax, Payroll & Compensation | 3 |
| 9 | Health, Safety & Security | 1 |
| 11 | Real Estate Professionals (Realtors) | 1 |

(Sums to 411 ✓)

### New Subcategory distribution (top entries)
Household Goods Movers (99), Relocation Management Companies (60), Corporate Housing/Temp Accommodations (60), Destination Services Providers/DSPs (46), School Search & Education Consultants (24), Vehicle Transport Specialists (13), Corporate Immigration Service Providers (10), Real Estate Brokers & Agents (10), Language Training Providers (10), Mobility Consulting Firms (9), Title/Appraisal & Closing Services (9), Immigration Law Firms (7), Spouse & Partner Career Services (7), Pet Relocation Specialists (6), Relocation Mortgage & Lending Services (5), Freight Forwarders (5), Mobility Management Platforms (5), Intercultural & Cross-Cultural Training (3), and 14 other subcategories with 1–2 records each (long tail — e.g., Executive Coaching: 1, Realtors Serving the Mobility Market: 1, Move Coordination Specialists: 1, Immigration Technology: 1, International Health Insurance: 1).

**Note:** Not all 41 defined subcategories currently have any records assigned (a few of the new subcategories may be 0-count placeholders for future supplier sourcing — worth diffing against the old file to see if this is new white-space or carried-over white-space).

### Remap Confidence levels
- HIGH: 256 records (62%)
- MEDIUM: 116 records (28%)
- LOW: 39 records (9%)

### DB Status field
- Active: 395
- FLAG — Verify URL: 12 (dead/suspect URLs at data collection time)
- RETAIN — Reclassify: 3 (relocation lending institutions, reassigned to new Cat 4 mortgage/lending subcategory, POC needs narrowing)
- RETAIN — Premier: 1 (Global Mobility Adviser itself — platform owner, Premier listing)

### Remap Flag column (free-text reviewer notes)
234 of 411 records have no flag. The remaining 177 carry one of ~60 distinct free-text caution notes, generally falling into these patterns:
- **"Not a search consultant / is a school"** — recurring concern that several "School Search & Education Consulting" entries are actually schools themselves (online K-12, international schools, tutoring/test-prep centers), not consultants — flagged for fit review or removal.
- **"Verify RMC vs DSP positioning"** — many vague/thin company descriptions made it hard to tell if a company is a full RMC, a DSP, or a hybrid.
- **"Consider removal"** — weak mobility relevance (e.g., commercial real estate developer, trade association, generic e-learning platform, nonprofit/membership network).
- **URL verification pending** — overlaps with the 12 "FLAG — Verify URL" DB Status records.
- **Description mismatch** — one explicit data integrity flag: a record's description text describes "AmCham Taiwan" but the company name is a different mover, indicating a copy-paste data error.
- **Reclassification candidates** — currency/FX services (no FX subcategory exists), au pair/childcare platforms (no childcare subcategory), vehicle leasing programs (no leasing subcategory) — i.e., known taxonomy gaps surfaced during remapping.

### Geographic distribution (Country field)
United States dominates with 254 of 411 records (~62%), followed by United Kingdom (31), Canada (10), UAE (8), India (7), Singapore (7), Germany (7), Mexico (5), plus smaller counts across ~25 other countries. 16 records have no country populated.

### Verification dates
Records carry verification dates spanning July 2025 through (at least) the most recent entries; 178 of 411 records have no verified date populated at all — a gap worth comparing against the old file's data-freshness tracking.

---

## 6. Key Structural Differences to Highlight When Diffing Against the Old Taxonomy

1. **Category count:** Old = 7 categories (one of which, "Unclear or Unknown," functioned as a junk-drawer bucket covering 36% of records) → New = 11 categories (10 numbered + Realtors), with no junk-drawer bucket — every record was force-mapped to a real category.
2. **Subcategory count:** Old ≈ 24 flat subcategory labels (with at least one casing typo) → New = 41 subcategories organized hierarchically under the 11 categories, each with a standardized definition/note.
3. **New category added wholesale:** "Real Estate Professionals (Realtors)" (Category 11) is entirely new, with a different data schema (license #, ZIP codes served, property types, bio) and ~1,000 anticipated profiles — far more than currently loaded (only 1 in this file).
4. **New subcategory added:** "Relocation Mortgage & Lending Services" (Cat 4) — did not exist in the old taxonomy; created specifically to house relocation lending banks that were previously miscategorized.
5. **Subcategory eliminated:** "Remote Work Enablement" (and freelance platforms like Fiverr/Upwork) removed entirely — no equivalent exists in the new structure.
6. **Subcategory restructured:** Old generic "Training & Certification Providers" (4 records) was dissolved and redistributed into five new, more specific Category 8 subcategories (Intercultural & Cross-Cultural Training, Language Training Providers, Spouse & Partner Career Services, Mental Health & Wellbeing Services, Executive Coaching).
7. **Storage Providers status is ambiguous/contested:** eliminated, then restored at the taxonomy level, but the supplier data itself mostly migrated those records into "Household Goods Movers" rather than the standalone subcategory (99 vs. 2 records) — flag this for the old-taxonomy comparison since the old list had 30 "Storage Providers" records.
8. **Data quality/process gaps surfaced during remapping** that did not seem to exist as fields in the old taxonomy: a `Confidence` rating (HIGH/MEDIUM/LOW) and a `Remap Flag` free-text review-note field were added — these are net-new QA columns, not previously tracked.
9. **Discrepancy between Summary sheet (86 removed) and the actual Step Zero Deletions log (93 removed)** — worth resolving when reconciling total record counts against the old file's original count.
10. **"Unclear or Unknown" old Primary Category records weren't randomly distributed** — they concentrated heavily in RMC-like, School Search, and Destination Services subcategories, suggesting those old subcategory labels were the most likely to lack a clean top-level category assignment.

---

## 7. Columns Present in the Working Supplier List (for schema comparison)

`Verified Date, Company Name, Website URL, Category Checked by (blank for all 411 records), Primary Category (OLD), Subcategories (OLD), Street Address or PO Box, City, State or Province, Postal Code, Country, HQ Phone, Countries Served (If listed), Countries Located in, Short Description, Contact Name (if listed), Contact Email, Contact Phone, Notes / Red Flags, DB Status, DB Notes, New Cat # (NEW), New Category (NEW), New Subcategory (NEW), Confidence, Remap Flag`

Note the file retains both old and new category fields side-by-side per record, which makes it straightforward to build a row-level old→new mapping table directly from this file if needed for the diff.

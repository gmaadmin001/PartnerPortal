# Bugs & Feature Tasks — Relocentra

From Michael & Alan meeting review. Work through one task at a time.

---

## Registration Form

- [x] Rename "vendor" → "mobility service provider" throughout registration form
- [x] Show additional service dropdowns only when user selects "mobility service provider" — hide for "realtor"
- [x] Reword delivery model options to: "Company provides service directly to customer" / "Company provides service using suppliers" / "Mixed"
- [x] Remove "franchise" option from delivery model dropdown
- [x] Add phone number formatting/validation (format: `+[country code][number]`)
- [x] Fix inconsistency in "company size" and "delivery model" fields between registration and profile edit pages

## Dashboard

- [x] Add "Upgrade your plan" call-to-action on user dashboard showing what features are gained per tier

## Search / Filters

- [x] Investigate and fix search bar bug — currently only searches name/certain keywords, not all fields
- [x] Fix category filters not returning results (e.g. "Health and Safety" returns nothing despite listings existing with that category)

## Email / Admin

- [x] Implement email notification when a listing is rejected by an admin
- [x] Customize listing activation email to include GMA logo and a link
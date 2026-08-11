# GMA Design Theme Reference

Source of truth extracted from the live WordPress site:
`https://honeydew-capybara-608687.hostingersite.com`

**Read this file at the start of every phase before building a page or component.**
Where a value here conflicts with what you see in the live site, the live site wins — update this file.

---

## 1. Color Palette

| Token | Hex | Usage |
|---|---|---|
| `gma-primary` | `#1C66AD` | Links, accents, footer background, alternate CTA buttons |
| `gma-navy` | `#1E2E61` | Primary buttons, navbar Sign In, top accent border |
| `gma-blue-mid` | `#157ABE` | Hover states on primary/navy elements |
| `gma-blue-light` | `#43B4E3` | Highlights, hover color on footer white elements |
| `gma-blue-pale` | `#D5E1EC` | Card/section backgrounds, subtle borders |
| `gma-surface` | `#F4F5F7` | Page background (default body bg) |
| `gma-border` | `#cccccc` | Input borders, card dividers |
| `gma-sidebar` | `#1e1e2d` | Reserved — dashboard sidebar only, not public pages |
| Black | `#000000` | Body text, navbar link default |
| White | `#FFFFFF` | Button text, footer text, card backgrounds |

**Unused palette entries** (defined in Elementor kit, not visible in current UI):
- Purple `#610AB1`, Coral `#F3624A`, Pink-red `#F22655`, Orange `#FFBC7D`

---

## 2. Typography

### Font Families

| Role | Family | Weights | CSS var |
|---|---|---|---|
| Headings | Lato | 400, 700, 900 | `--font-heading` |
| Body / UI | Open Sans | 400, 500, 600, 700 | `--font-sans` |
| Display / Hero | Space Grotesk | 400, 500, 700 | `--font-display` |

> Google Fonts note: Lato has no weight 800 — use 900 as the nearest heavy weight.

### Heading Scale

| Level | Desktop | Tablet (≤1024px) | Mobile (≤767px) | Weight | Transform |
|---|---|---|---|---|---|
| H1 | 56px | 44px | 38px | 900 (Lato) | uppercase |
| H2 | 44px | 34px | 28px | 400 (Lato) | uppercase |
| H3 | 34px | 28px | 24px | 400 (Lato) | — |
| H4 | 28px | 22px | 20px | 400 (Lato) | — |
| H5 | 20px | 18px | 18px | 400 (Lato) | — |
| H6 | 18px | 16px | 16px | 400 (Lato) | — |

### Body / UI Text

| Role | Size | Weight | Family | Color |
|---|---|---|---|---|
| Body paragraph | 18px | 400 | Open Sans | #000 |
| Small / caption | 15–16px | 400 | Open Sans | #000 |
| Nav links | 16px | 700 | Lato | #000 (hover: #1C66AD) |
| Button text | 16px | 500 | Lato | white |
| Form labels | 16px | 400–600 | Open Sans | #000 |
| Footer body | 16–18px | 400 | Open Sans | white |

### Letter Spacing & Line Height

| Context | Letter spacing | Line height |
|---|---|---|
| Nav links / buttons / section headers | 1px (`tracking-widest`) | — |
| H1 / hero text | -0.6px or default | 1.2em |
| Headings H2–H4 | default | 1.3em |
| Body | default | ~1.6 |

---

## 3. Buttons

### Primary Button (default across site)

| Property | Value |
|---|---|
| Background | `#1E2E61` (navy) |
| Text color | white |
| Font | Lato, 16px, weight 500, uppercase |
| Letter spacing | 1px |
| Padding | 15px 30px |
| Border-radius | 100px (fully rounded pill) |
| Hover bg | `#1C66AD` (primary blue) |

### Alternate / Secondary Button

- Same pill shape, same font
- Background: `#1C66AD` (primary blue), hover: `#157ABE`
- Used for Register, Subscribe Now, and accent CTAs

### Sign In Navbar Button

- Background: `#1E2E61`, hover: `#1C66AD`
- Padding: 16px 24px (slightly taller than standard)
- Includes outline person SVG icon to the right of text

### Outline / Ghost Button

- Border: 2px solid `#1E2E61`, background transparent
- Text: `#1E2E61`, hover: bg `#1E2E61`, text white

---

## 4. Form Inputs

| Property | Value |
|---|---|
| Background | white |
| Border | 1px solid `#cccccc` |
| Border-radius | 6–8px (subtle, NOT pill) |
| Focus border | `#1C66AD` |
| Padding | 10–12px 15px |
| Font | Open Sans, 16–18px, weight 400 |
| Placeholder color | `#999` / gray-400 |
| Text color | `#000` |

### Subscribe Form (footer)

- Input: `rounded-lg` left side, white bg
- Button: `rounded-full` detached pill, `#1E2E61` bg
- Separated by a small `gap-2` (not joined half-pills)

### Select / Dropdown

- Same border and radius as text inputs
- Native `<select>` or custom styled to match

### Radio & Checkbox

- Label: Open Sans 16px
- Custom styled with `gma-primary` accent color on checked state

---

## 5. Layout & Spacing

### Container

| Breakpoint | Max-width |
|---|---|
| Desktop | 1140px |
| Tablet (≤1024px) | 1024px |
| Mobile (≤767px) | 767px / full width |

Footer uses `max-w-6xl mx-auto` (1152px) — slightly wider than content sections.

### Section Vertical Padding

| Breakpoint | Padding |
|---|---|
| Desktop | 80px top/bottom |
| Tablet | 60px |
| Mobile | 40px |

### Widget / Card Spacing

- Gap between widgets / grid items: 20px default
- Card inner padding: 20–30px

---

## 6. Navigation (Navbar)

| Property | Value |
|---|---|
| Position | Sticky, `z-50` |
| Background | White |
| Top accent border | 4px, `#1E2E61` (navy) |
| Height | ~96px (h-24) |
| Logo | GMA-1.png, h-7 (≈28px tall) |
| Link font | Lato, 16px, weight 700, uppercase, 1px letter-spacing |
| Link color default | `#000` |
| Link color hover | `#1C66AD` + left-to-right underline sweep animation |
| Active link | `#1C66AD` + full underline |
| Sign In button | Navy pill, outline person icon, `py-4 px-6` |
| Mobile | Hamburger toggle → vertical drawer |

---

## 7. Footer

| Property | Value |
|---|---|
| Background | `#1C66AD` (primary blue) |
| Text color | White throughout |
| Container | `max-w-6xl mx-auto px-6 lg:px-8` |
| Grid | 4 columns: `[1.6fr_1.8fr_1.2fr_1.2fr]`, gap-14 |
| Logo | GMA-1.png with `filter: brightness(0) invert(1)` (renders white) |
| Section headers | Lato, 16–18px, weight 700, uppercase, tracking-widest |
| Body text | Open Sans, 16–18px |
| Link hover | `#43B4E3` (gma-blue-light) |
| Phone link | `tel:6232901143` — hover: gma-blue-light group style |
| Email link | `mailto:...` — hover: gma-blue-light group style |
| LinkedIn badge | `w-9 h-9 rounded-full border-2 border-white`, hover: bg white / text gma-primary |
| Bottom bar | Divider `border-white/30`, copyright left, LinkedIn right |

### Footer Columns

1. **Brand** — Logo + tagline + subscribe form
2. **Contact** — CONTACT header, phone (PhoneIcon), email (EmailIcon)
3. **Site Map** — Solutions, Education, About Us, Resources, Contact Us
4. **Policies** — Privacy Policy, Copyright Policy, Terms of Service

---

## 8. Page: /login (Register)

### Layout

- Centered single-column card, max-width ~760px, white bg, subtle border/shadow
- Page background: `gma-surface` (#F4F5F7)
- Form card has no accent border

### Login Form

| Element | Detail |
|---|---|
| Heading | "LOG IN", Lato, bold, ~24–28px |
| Username/Email field | Standard text input |
| Password field | Text input + "Show Password" toggle (eye icon, right-aligned) |
| Remember Me | Checkbox with label |
| Log In button | Full-width, navy pill (`#1C66AD`/`#1E2E61`), white text |
| Lost Password? | Link below form card, `gma-primary` blue |
| OR divider | Centered text between form and register |
| Register button | Full-width, same pill style |

### Right Info Panel (if two-column layout is used)

- GMA image (Mask Group graphic)
- Company tagline / Michael Ray description
- "Subscribe now" CTA button

---

## 9. Page: /add-service

### Step Indicator

- 4 steps: **Service → Details → Membership Plans → Finish**
- Active step: `gma-primary` or `gma-navy` accent
- Inactive: gray
- Connected by horizontal line

### Vendor / Realtor Toggle

- Two-option toggle at top of step 1
- Selected: `gma-navy` or `gma-primary` bg, white text
- Unselected: outlined or gray

### Vendor Form Fields

| Field | Type |
|---|---|
| Primary Category | Single select dropdown |
| Sub Category | Dependent dropdown (required) |
| Company Name | Text input |
| Website URL | URL input |
| Short Description | Textarea (255 char limit) |
| HQ Country | Dropdown |
| HQ City | Text input |
| Countries Served | Multi-select checkbox list |
| Delivery Model | Radio (Direct / Aggregator / Mixed / Franchise / Unknown) |
| Company Size | Radio (1–50 / 51–500 / 500+) |
| Certifications | Text input |
| Contact Name | Text input |
| Contact Email | Email input |
| Contact Phone | Tel input |

### Realtor Form Fields

| Field | Type |
|---|---|
| Brokerage/Agent Name | Text input |
| Website URL | URL input |
| HQ Country | Dropdown |
| HQ City | Text input |
| License Number | Text input |
| Service Areas | Multi-select checkbox list |
| Property Type | Dropdown |
| Short Bio | Textarea (255 char limit) |
| Contact Name/Email/Phone | Text inputs |

### Membership Plan Cards

Three-column card grid:

| Plan | Price | Style |
|---|---|---|
| Free | $0.00 | Default |
| Standard | $100.00/mo | Featured |
| Premium | $200.00/mo | Premium accent |

Each card: plan name, price, feature list, "Select Plan" button (pill, navy).

---

## 10. Page: /services-page

### Filter Panel (top of page, horizontal)

Dropdowns / inputs: Service Type, Sub-service, Country, State/Region, Regional Scope, Industry, Integration Scope, Company Size, Company Name, Zip Code, Certifications (checkbox), Diversity/Ownership badges (checkbox).

"Search / Apply Filters" button + "Clear All" link.

### Provider Cards

- Grid layout (2–3 columns desktop, 1 mobile)
- White card, subtle border/shadow
- Fields: Company Name (heading), Category badges, Short Description, HQ location, Website CTA button, Premium badge (if applicable)
- CTA: navy pill button "View Profile" or "Visit Website"

---

## 11. Tailwind Token Mapping

These CSS variables are already defined in `src/app/globals.css`:

```css
--color-gma-primary:    #1C66AD
--color-gma-navy:       #1E2E61
--color-gma-blue-mid:   #157ABE
--color-gma-blue-light: #43B4E3
--color-gma-blue-pale:  #D5E1EC
--color-gma-surface:    #F4F5F7
--color-gma-sidebar:    #1e1e2d
--color-gma-border:     #cccccc
```

Use `bg-gma-navy`, `text-gma-primary`, etc. in all components. Never hardcode hex values in JSX — always use the token.

---

## 12. Common Patterns (copy-paste starting points)

### Primary pill button
```tsx
<button className="px-8 py-4 rounded-full bg-gma-navy text-white text-base font-bold uppercase tracking-widest hover:bg-gma-primary transition-colors">
  Label
</button>
```

### Full-width form button
```tsx
<button className="w-full py-4 rounded-full bg-gma-navy text-white text-base font-bold uppercase tracking-widest hover:bg-gma-primary transition-colors">
  Log In
</button>
```

### Standard text input
```tsx
<input
  type="text"
  className="w-full px-4 py-3 rounded-lg border border-gma-border bg-white text-base text-black placeholder-gray-400 focus:outline-none focus:border-gma-primary"
/>
```

### Section heading
```tsx
<h2 className="font-heading text-4xl font-normal uppercase tracking-wide text-gma-navy">
  Heading
</h2>
```

### Card container
```tsx
<div className="bg-white rounded-xl border border-gma-blue-pale shadow-sm p-6">
  {/* content */}
</div>
```

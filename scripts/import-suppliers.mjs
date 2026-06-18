/**
 * Reads the supplier CSV, parses it, and prints SQL INSERT statements
 * to stdout. Pipe to a file or review, then apply via Supabase MCP.
 *
 * Usage:  node scripts/import-suppliers.mjs > /tmp/suppliers.sql
 */

import { readFileSync, writeFileSync } from "fs";

const CSV_PATH =
  "C:\\Users\\derpnerd\\Downloads\\Updated Supplier Taxonomy and Supplier List June 17 2026.csv";

// Columns (0-indexed) in the CSV header row:
// 0  Verified Date
// 1  Company Name
// 2  Website URL
// 3  Category Checked by
// 4  Primary Category  (old — ignored)
// 5  Subcategories     (old — ignored)
// 6  Street Address or PO Box
// 7  City
// 8  State or Province
// 9  Postal Code
// 10 Country
// 11 HQ Phone
// 12 Countries Served (If listed)
// 13 Countries Located in
// 14 Short Description
// 15 Contact Name (if listed)
// 16 Contact Email
// 17 Contact Phone
// 18 Notes / Red Flags
// 19 DB Status
// 20 DB Notes
// 21 New Cat #
// 22 New Category      ← use this
// 23 New Subcategory   ← use this
// 24 Confidence
// 25 Remap Flag

function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function dedup(slugs, base) {
  if (!slugs.has(base)) { slugs.add(base); return base; }
  let i = 2;
  while (slugs.has(`${base}-${i}`)) i++;
  const s = `${base}-${i}`;
  slugs.add(s);
  return s;
}

function parseCSV(text) {
  const rows = [];
  let i = 0;
  while (i < text.length) {
    const row = [];
    while (i < text.length && text[i] !== "\n" && text[i] !== "\r") {
      if (text[i] === '"') {
        i++;
        let cell = "";
        while (i < text.length) {
          if (text[i] === '"' && text[i + 1] === '"') {
            cell += '"'; i += 2;
          } else if (text[i] === '"') {
            i++; break;
          } else {
            cell += text[i++];
          }
        }
        row.push(cell);
        if (text[i] === ",") i++;
      } else {
        let cell = "";
        while (i < text.length && text[i] !== "," && text[i] !== "\n" && text[i] !== "\r") {
          cell += text[i++];
        }
        row.push(cell.trim());
        if (text[i] === ",") i++;
      }
    }
    if (text[i] === "\r") i++;
    if (text[i] === "\n") i++;
    if (row.some(c => c !== "")) rows.push(row);
  }
  return rows;
}

function esc(val) {
  if (!val) return "NULL";
  return `'${val.replace(/'/g, "''").trim()}'`;
}

function escArr(val) {
  if (!val) return "'{}'";
  const items = val
    .split(/[\n,]+/)
    .map(s => s.trim())
    .filter(Boolean);
  if (items.length === 0) return "'{}'";
  const escaped = items.map(s => `"${s.replace(/"/g, '\\"')}"`).join(",");
  return `'{${escaped}}'`;
}

const raw = readFileSync(CSV_PATH, "utf-8");
const rows = parseCSV(raw);

// Skip header row
const header = rows[0];
const data = rows.slice(1);

const slugs = new Set();
const inserts = [];

for (const row of data) {
  const dbStatus = (row[19] || "").trim();
  // Only import Active records
  if (!dbStatus.toLowerCase().startsWith("active")) continue;

  const companyName = (row[1] || "").trim();
  if (!companyName) continue;

  const websiteUrl    = (row[2] || "").trim() || null;
  const city          = (row[7] || "").trim() || null;
  const country       = (row[10] || "").trim() || null;
  const hqPhone       = (row[11] || "").trim() || null;
  const countriesServed = (row[12] || "").trim() || null;
  const shortDesc     = (row[14] || "").trim() || null;
  const contactName   = (row[15] || "").trim() || null;
  const contactEmail  = (row[16] || "").trim() || null;
  const contactPhone  = (row[17] || "").trim() || hqPhone;
  const newCategory   = (row[22] || "").trim() || null;
  const newSubcat     = (row[23] || "").trim() || null;

  const slug = dedup(slugs, toSlug(companyName));

  inserts.push(
    `INSERT INTO service_registrations ` +
    `(slug, company_name, website_url, short_description, primary_category, sub_category, ` +
    `headquarters_country, headquarters_city, countries_served, ` +
    `primary_contact_name, primary_contact_email, primary_contact_phone, ` +
    `status, membership_plan, user_id, created_at) ` +
    `VALUES (` +
    `${esc(slug)}, ${esc(companyName)}, ${esc(websiteUrl)}, ${esc(shortDesc)}, ` +
    `${esc(newCategory)}, ${esc(newSubcat)}, ` +
    `${esc(country)}, ${esc(city)}, ${escArr(countriesServed)}, ` +
    `${esc(contactName)}, ${esc(contactEmail)}, ${esc(contactPhone)}, ` +
    `'active', 'Basic', NULL, NOW()` +
    `) ON CONFLICT (slug) DO NOTHING;`
  );
}

const outPath = process.argv[2] || "C:\\Users\\derpnerd\\AppData\\Local\\Temp\\suppliers_utf8.sql";
const content = `-- Supplier import — ${inserts.length} rows\n-- Generated ${new Date().toISOString()}\n\n` + inserts.join("\n") + "\n";
writeFileSync(outPath, content, "utf8");
process.stderr.write(`Done: ${inserts.length} INSERT statements → ${outPath}\n`);

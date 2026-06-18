/**
 * Applies supplier import using Supabase JS client.
 * Reads suppliers_utf8.sql, extracts slugs already inserted
 * from batch_1, then upserts the remaining 345 rows.
 *
 * Usage: node scripts/run-supplier-import.mjs
 */

import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

// Set SUPABASE_SERVICE_ROLE_KEY in your environment before running.
// The value lives in .dev.vars (gitignored) — copy it from there.
const SUPABASE_URL = "https://fwiudagfnntuwqhglkdi.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SERVICE_KEY) {
  console.error("SUPABASE_SERVICE_ROLE_KEY env var is required");
  process.exit(1);
}

const CSV_PATH =
  "C:\\Users\\derpnerd\\Downloads\\Updated Supplier Taxonomy and Supplier List June 17 2026.csv";

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

function parseCountries(val) {
  if (!val) return [];
  return val.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
}

const raw = readFileSync(CSV_PATH, "utf-8");
const rows = parseCSV(raw);
const data = rows.slice(1);

const slugs = new Set();
const records = [];

for (const row of data) {
  const dbStatus = (row[19] || "").trim();
  if (!dbStatus.toLowerCase().startsWith("active")) continue;

  const companyName = (row[1] || "").trim();
  if (!companyName) continue;

  const slug = dedup(slugs, toSlug(companyName));
  const websiteUrl = (row[2] || "").trim() || null;
  const city = (row[7] || "").trim() || null;
  const country = (row[10] || "").trim() || null;
  const hqPhone = (row[11] || "").trim() || null;
  const countriesServed = parseCountries((row[12] || "").trim());
  const shortDesc = (row[14] || "").trim() || null;
  const contactName = (row[15] || "").trim() || null;
  const contactEmail = (row[16] || "").trim() || null;
  const contactPhone = (row[17] || "").trim() || hqPhone;
  const newCategory = (row[22] || "").trim() || null;
  const newSubcat = (row[23] || "").trim() || null;

  records.push({
    slug,
    company_name: companyName,
    website_url: websiteUrl,
    short_description: shortDesc,
    primary_category: newCategory,
    sub_category: newSubcat,
    headquarters_country: country,
    headquarters_city: city,
    countries_served: countriesServed,
    primary_contact_name: contactName,
    primary_contact_email: contactEmail,
    primary_contact_phone: contactPhone,
    status: "active",
    membership_plan: "Basic",
    user_id: null,
  });
}

console.log(`Total active records to upsert: ${records.length}`);

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const BATCH = 50;
let inserted = 0;
let skipped = 0;

for (let i = 0; i < records.length; i += BATCH) {
  const batch = records.slice(i, i + BATCH);
  const { data: result, error } = await supabase
    .from("service_registrations")
    .upsert(batch, { onConflict: "slug", ignoreDuplicates: true });

  if (error) {
    console.error(`Batch ${Math.floor(i/BATCH)+1} error:`, error.message);
    process.exit(1);
  }

  inserted += batch.length;
  process.stdout.write(`\rProgress: ${inserted}/${records.length}`);
}

console.log(`\nDone. Upserted ${inserted} records (duplicates silently skipped).`);

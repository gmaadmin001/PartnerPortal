import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const SELECTED_COLUMNS = [
  "id",
  "slug",
  "company_name",
  "website_url",
  "short_description",
  "logo_url",
  "primary_category",
  "sub_category",
  "headquarters_country",
  "headquarters_city",
  "countries_served",
  "states_served",
  "industry_focus",
  "service_scope",
  "company_size",
  "certifications",
  "diversity_flags",
  "core_services",
  "membership_plan",
  "is_verified",
  "is_featured",
  "created_at",
].join(", ");

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const primaryService  = (sp.get("primaryService") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const subService      = (sp.get("subService")     ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const country         = (sp.get("country")        ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const state           = (sp.get("state")          ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const city            = sp.get("city")             ?? "";
  const zip             = sp.get("zip")              ?? "";
  const industry        = sp.get("industry")         ?? "";
  const serviceScope    = sp.get("serviceScope")     ?? "";
  const companySize     = sp.get("companySize")      ?? "";
  const companyName     = sp.get("companyName")      ?? "";
  const diversityFlags  = (sp.get("diversityFlags") ?? "")
    .split(",").map((s) => s.trim()).filter(Boolean);

  const page  = Math.max(1, parseInt(sp.get("page")  ?? "1"));
  const limit = Math.min(50, Math.max(1, parseInt(sp.get("limit") ?? "20")));
  const from  = (page - 1) * limit;
  const to    = from + limit - 1;

  const supabase = await createClient();

  let query = supabase
    .from("service_registrations")
    .select(SELECTED_COLUMNS, { count: "exact" })
    .eq("status", "active");

  if (primaryService.length > 0) query = query.in("primary_category", primaryService);
  if (subService.length > 0)    query = query.in("sub_category", subService);
  if (country.length > 0)       query = query.overlaps("countries_served", country);
  if (state.length > 0)         query = query.overlaps("states_served", state);
  if (city)           query = query.ilike("headquarters_city", `%${city}%`);
  if (zip)            query = query.eq("zip_code", zip);
  if (industry)       query = query.ilike("industry_focus", `%${industry}%`);
  if (serviceScope)   query = query.eq("service_scope", serviceScope);
  if (companySize)    query = query.eq("company_size", companySize);
  if (companyName)    query = query.ilike("company_name", `%${companyName}%`);
  if (diversityFlags.length > 0) query = query.overlaps("diversity_flags", diversityFlags);

  query = query
    .order("is_featured",  { ascending: false })
    .order("is_verified",  { ascending: false })
    .order("created_at",   { ascending: false })
    .range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("GET /api/services error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [], total: count ?? 0, page, limit });
}

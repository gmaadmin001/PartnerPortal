import { createClient } from "@/lib/supabase/server";
import ServicesClient from "./ServicesClient";
import { FilterValues, EMPTY_FILTERS } from "@/components/services/FilterPanel";
import type { Provider } from "@/components/services/ProviderCard";

const SELECTED_COLUMNS = [
  "id", "slug", "company_name", "website_url", "short_description", "logo_url",
  "primary_category", "sub_category", "headquarters_country", "headquarters_city",
  "countries_served", "states_served", "industry_focus", "service_scope",
  "company_size", "certifications", "diversity_flags", "core_services",
  "membership_plan", "is_verified", "is_featured", "created_at",
].join(", ");

function paramsToFilters(sp: Record<string, string>): FilterValues {
  return {
    primaryServices: (sp.primaryService ?? "").split(",").filter(Boolean),
    subServices:     (sp.subService     ?? "").split(",").filter(Boolean),
    countries:       (sp.country        ?? "").split(",").filter(Boolean),
    states:          (sp.state          ?? "").split(",").filter(Boolean),
    city:            sp.city         ?? "",
    zip:             sp.zip          ?? "",
    industry:        sp.industry     ?? "",
    serviceScope:    sp.serviceScope ?? "",
    companySize:     sp.companySize  ?? "",
    companyName:     sp.companyName  ?? "",
    diversityFlags:  (sp.diversityFlags ?? "").split(",").filter(Boolean),
  };
}

async function queryProviders(f: FilterValues): Promise<{ data: Provider[]; total: number }> {
  const supabase = await createClient();

  let query = supabase
    .from("service_registrations")
    .select(SELECTED_COLUMNS, { count: "exact" })
    .eq("status", "active");

  if (f.primaryServices.length) query = query.in("primary_category", f.primaryServices);
  if (f.subServices.length)     query = query.in("sub_category",      f.subServices);
  if (f.countries.length)       query = query.overlaps("countries_served", f.countries);
  if (f.states.length)          query = query.overlaps("states_served",    f.states);
  if (f.city)                   query = query.ilike("headquarters_city",   `%${f.city}%`);
  if (f.zip)                    query = query.eq("zip_code",               f.zip);
  if (f.industry)               query = query.ilike("industry_focus",      `%${f.industry}%`);
  if (f.serviceScope)           query = query.eq("service_scope",          f.serviceScope);
  if (f.companySize)            query = query.eq("company_size",           f.companySize);
  if (f.companyName)            query = query.ilike("company_name",        `%${f.companyName}%`);
  if (f.diversityFlags.length)  query = query.overlaps("diversity_flags",  f.diversityFlags);

  query = query
    .order("is_featured", { ascending: false })
    .order("is_verified", { ascending: false })
    .order("created_at",  { ascending: false })
    .range(0, 49);

  const { data, count } = await query;
  return { data: (data ?? []) as unknown as Provider[], total: count ?? 0 };
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const hasFilters = Object.values(sp).some((v) => v.trim() !== "");

  const filters = hasFilters ? paramsToFilters(sp) : EMPTY_FILTERS;
  const { data: results, total } = hasFilters
    ? await queryProviders(filters)
    : { data: [], total: 0 };

  return (
    <ServicesClient
      initialFilters={filters}
      results={results}
      total={total}
      hasFilters={hasFilters}
    />
  );
}

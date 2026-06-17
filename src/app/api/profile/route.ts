import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const AREA_LIMITS: Record<string, number> = {
  Basic: 1,
  Professional: 3,
  Premier: Infinity,
};

function areaLimit(plan: string | null): number {
  if (!plan) return 1;
  for (const [key, limit] of Object.entries(AREA_LIMITS)) {
    if (plan.startsWith(key)) return limit;
  }
  return 1;
}

export async function POST(req: NextRequest) {
  const supabaseSSR = await createServerClient();
  const { data: { user }, error: authErr } = await supabaseSSR.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    company_name, website_url, short_description, company_bio,
    company_size, delivery_model, certifications,
    primary_contact_name, primary_contact_email, primary_contact_phone,
    primary_category, sub_category,
    headquarters_country, headquarters_city,
    countries_served, states_served,
    logo_url,
  } = body;

  const supabase = createServiceClient();

  const { data: reg } = await supabase
    .from("service_registrations")
    .select("membership_plan")
    .eq("user_id", user.id)
    .single();

  const limit = areaLimit((reg?.membership_plan as string | null) ?? null);
  const planLabel = (reg?.membership_plan as string | null) ?? "current plan";

  const countriesArr: string[] = Array.isArray(countries_served) ? countries_served : [];
  const statesArr: string[] = Array.isArray(states_served) ? states_served : [];

  if (isFinite(limit) && countriesArr.length > limit) {
    return NextResponse.json(
      { error: `Your ${planLabel} allows up to ${limit} ${limit === 1 ? "country" : "countries"}. Please remove some before saving.` },
      { status: 422 }
    );
  }
  if (isFinite(limit) && statesArr.length > limit) {
    return NextResponse.json(
      { error: `Your ${planLabel} allows up to ${limit} state/province${limit === 1 ? "" : "s"}. Please remove some before saving.` },
      { status: 422 }
    );
  }

  const { error } = await supabase
    .from("service_registrations")
    .update({
      company_name,
      website_url,
      short_description,
      company_bio,
      company_size,
      delivery_model,
      certifications,
      primary_contact_name,
      primary_contact_email,
      primary_contact_phone,
      primary_category,
      sub_category,
      headquarters_country,
      headquarters_city,
      countries_served: countriesArr,
      states_served: statesArr,
      logo_url,
    })
    .eq("user_id", user.id);

  if (error) {
    console.error("[api/profile] update failed:", error);
    return NextResponse.json({ error: "Save failed: " + error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

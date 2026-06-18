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

  const supabase = createServiceClient();

  const { data: reg } = await supabase
    .from("service_registrations")
    .select("membership_plan")
    .eq("user_id", user.id)
    .single();

  const plan = (reg?.membership_plan as string | null) ?? null;
  const planLabel = plan ?? "current plan";

  if (!plan || plan.startsWith("Basic")) {
    return NextResponse.json(
      { error: "Profile editing requires a Professional or Premier plan. Visit your Plans page to upgrade." },
      { status: 403 }
    );
  }

  const body = await req.json();
  const {
    company_name, website_url, short_description, company_bio,
    company_size, delivery_model, certifications,
    primary_contact_name, primary_contact_email, primary_contact_phone,
    primary_category, sub_category,
    headquarters_country, headquarters_city, company_address,
    countries_served, states_served,
    logo_url,
    industry_focus, service_scope,
    diversity_flags, core_services,
    social_linkedin, social_discord,
  } = body;

  const limit = areaLimit(plan);
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

  const socialProfiles: Record<string, string> = {};
  if (social_linkedin) socialProfiles.linkedin = social_linkedin;
  if (social_discord) socialProfiles.discord = social_discord;

  const { error } = await supabase
    .from("service_registrations")
    .update({
      company_name:          company_name          || null,
      website_url:           website_url           || null,
      short_description:     short_description     || null,
      company_bio:           company_bio           || null,
      company_size:          company_size          || null,
      delivery_model:        delivery_model        || null,
      certifications:        certifications        || null,
      primary_contact_name:  primary_contact_name  || null,
      primary_contact_email: primary_contact_email || null,
      primary_contact_phone: primary_contact_phone || null,
      primary_category:      primary_category      || null,
      sub_category:          sub_category          || null,
      headquarters_country:  headquarters_country  || null,
      headquarters_city:     headquarters_city     || null,
      company_address:       company_address       || null,
      countries_served:      countriesArr,
      states_served:         statesArr,
      logo_url:              logo_url              || null,
      industry_focus:        industry_focus        || null,
      service_scope:         service_scope         || null,
      diversity_flags:       Array.isArray(diversity_flags) ? diversity_flags : [],
      core_services:         Array.isArray(core_services)   ? core_services   : [],
      social_profiles:       Object.keys(socialProfiles).length > 0 ? socialProfiles : null,
    })
    .eq("user_id", user.id);

  if (error) {
    console.error("[api/profile] update failed:", error);
    return NextResponse.json({ error: "Save failed: " + error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

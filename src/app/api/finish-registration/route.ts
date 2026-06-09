import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

const PREMIUM_PLANS = ["Professional", "Premier"];

function toNameSlug(name: string): string {
  return (name ?? "provider")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 60) || "provider";
}

function randomHex(bytes = 6): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function buildSlug(supabase: ReturnType<typeof createServiceClient>, companyName: string, plan: string): Promise<string> {
  if (!PREMIUM_PLANS.some((p) => plan.startsWith(p))) return randomHex(6);

  const base = toNameSlug(companyName);
  const { data: existing } = await supabase
    .from("service_registrations")
    .select("slug")
    .like("slug", `${base}%`);

  const taken = new Set((existing ?? []).map((r: { slug: string }) => r.slug));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      registerAs,
      primaryCategory,
      subCategory,
      companyName,
      websiteUrl,
      shortDescription,
      headquartersCountry,
      headquartersCity,
      countriesServed,
      deliveryModel,
      companySize,
      certifications,
      primaryContactName,
      primaryContactEmail,
      primaryContactPhone,
      membershipPlan,
      membershipBilling,
    } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Create the auth user (confirmed immediately — no email loop)
    const { data: userData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      if (authError.message.toLowerCase().includes("already registered")) {
        return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
      }
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = userData.user.id;

    const slug = await buildSlug(supabase, companyName ?? "", membershipPlan ?? "");

    // Save all registration data
    const { error: insertError } = await supabase.from("service_registrations").insert({
      slug,
      user_id: userId,
      register_as: registerAs,
      primary_category: primaryCategory,
      sub_category: subCategory,
      company_name: companyName,
      website_url: websiteUrl,
      short_description: shortDescription,
      headquarters_country: headquartersCountry,
      headquarters_city: headquartersCity,
      countries_served: countriesServed,
      delivery_model: deliveryModel,
      company_size: companySize,
      certifications: certifications,
      primary_contact_name: primaryContactName,
      primary_contact_email: primaryContactEmail,
      primary_contact_phone: primaryContactPhone,
      membership_plan: membershipPlan,
      membership_billing: membershipBilling ?? null,
      status: "pending",
      current_step: 4,
    });

    if (insertError) {
      // Roll back: delete the auth user we just created so they can retry
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("finish-registration error:", err);
    return NextResponse.json({ error: "Unexpected error. Please try again." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

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

async function buildSlug(
  supabase: ReturnType<typeof createServiceClient>,
  companyName: string,
): Promise<string> {
  const base = toNameSlug(companyName);
  if (!base || base === "provider") return randomHex(6);
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
    } = body as Record<string, unknown>;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const supabase = createServiceClient();

    const { data: userData, error: authError } = await supabase.auth.admin.createUser({
      email: email as string,
      password: password as string,
      email_confirm: true,
    });

    if (authError) {
      if (authError.message.toLowerCase().includes("already registered")) {
        return NextResponse.json(
          { error: "An account with this email already exists." },
          { status: 409 },
        );
      }
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = userData.user.id;
    const slug = await buildSlug(supabase, (companyName as string) ?? "");

    const { error: insertError } = await supabase.from("service_registrations").insert({
      slug,
      user_id: userId,
      register_as:
        typeof registerAs === "string" ? (registerAs as string).toLowerCase() : null,
      primary_category: primaryCategory ?? null,
      sub_category: subCategory ?? null,
      company_name: companyName ?? null,
      website_url: websiteUrl ?? null,
      short_description: shortDescription ?? null,
      headquarters_country: headquartersCountry ?? null,
      headquarters_city: headquartersCity ?? null,
      countries_served: countriesServed ?? null,
      delivery_model: deliveryModel ?? null,
      company_size: companySize ?? null,
      certifications: certifications ?? null,
      primary_contact_name: primaryContactName ?? null,
      primary_contact_email: primaryContactEmail ?? null,
      primary_contact_phone: primaryContactPhone ?? null,
      membership_plan: membershipPlan ?? "Basic",
      membership_billing: null,
      status: "pending",
      current_step: 4,
    });

    if (insertError) {
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[finish-registration] Unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error. Please try again." }, { status: 500 });
  }
}

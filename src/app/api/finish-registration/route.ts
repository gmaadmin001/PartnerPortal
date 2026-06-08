import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

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

    // Save all registration data
    const { error: insertError } = await supabase.from("service_registrations").insert({
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

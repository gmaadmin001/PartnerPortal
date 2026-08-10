import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 403 });

  const service = createServiceClient();
  const { data: admin } = await service.from("admins").select("role").eq("email", user.email).maybeSingle();
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 403 });

  const { provider_id } = await req.json();
  if (!provider_id) return NextResponse.json({ error: "Missing provider_id." }, { status: 400 });

  const { data: listing } = await service
    .from("service_registrations")
    .select("company_name, primary_contact_email, primary_contact_name, status, slug")
    .eq("id", provider_id)
    .single();

  if (!listing || listing.status !== "pending") {
    return NextResponse.json({ error: "Listing not found or not pending." }, { status: 404 });
  }

  const { error } = await service
    .from("service_registrations")
    .update({ status: "active" })
    .eq("id", provider_id);

  if (error) return NextResponse.json({ error: "Failed to activate listing." }, { status: 500 });

  const origin = process.env.NEXT_PUBLIC_MAIN_APP_URL || req.nextUrl.origin;
  const listingUrl = listing.slug ? `${origin}/services/${listing.slug}` : `${origin}/services`;
  if (listing.primary_contact_email) {
    await sendEmail({
      to_email: listing.primary_contact_email as string,
      to_name: (listing.primary_contact_name as string) || (listing.primary_contact_email as string),
      greeting: listing.primary_contact_name ? `Hi ${listing.primary_contact_name},` : "Hi there,",
      subject: "Your listing is now live",
      headline: "Your Listing Has Been Approved",
      message_html: `<p style="text-align:center;margin-bottom:20px;"><img src="https://globalmobilityadviser.com/wp-content/uploads/2025/11/GMA-1.png" alt="Global Mobility Adviser" style="max-width:180px;height:auto;" /></p><p>Great news — your listing for <strong>${listing.company_name}</strong> has been reviewed and is now live in the ReloCentra directory.</p><p>You can <a href="${listingUrl}" style="color:#1a3c5e;font-weight:bold;">view your live listing here</a>, or sign in to your dashboard to update your profile, add photos, and manage your listing.</p>`,
      button_label: "View Your Listing",
      button_url: listingUrl,
      footnote: "If you have any questions, please contact our support team.",
    });
  }

  return NextResponse.json({ ok: true });
}

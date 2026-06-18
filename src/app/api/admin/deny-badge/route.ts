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
    .select("company_name, primary_contact_email, primary_contact_name, badge_purchased")
    .eq("id", provider_id)
    .single();

  if (!listing || !listing.badge_purchased) {
    return NextResponse.json({ error: "No pending badge found." }, { status: 404 });
  }

  const { error } = await service
    .from("service_registrations")
    .update({ badge_purchased: false })
    .eq("id", provider_id);

  if (error) return NextResponse.json({ error: "Failed to deny badge." }, { status: 500 });

  const origin = process.env.NEXT_PUBLIC_MAIN_APP_URL || req.nextUrl.origin;
  if (listing.primary_contact_email) {
    await sendEmail({
      to_email: listing.primary_contact_email as string,
      to_name: (listing.primary_contact_name as string) || (listing.primary_contact_email as string),
      greeting: listing.primary_contact_name ? `Hi ${listing.primary_contact_name},` : "Hi there,",
      subject: "Update on your Verified Badge request",
      headline: "Badge Verification Could Not Be Completed",
      message_html: `<p>Thank you for your interest in the Verified Badge for <strong>${listing.company_name}</strong>. After review, we were unable to approve verification at this time.</p><p>Please contact our support team for more information. If a charge was made, we will process a refund.</p>`,
      button_label: "Contact Support",
      button_url: `${origin}/dashboard`,
      footnote: "We apologize for any inconvenience.",
    });
  }

  return NextResponse.json({ ok: true });
}

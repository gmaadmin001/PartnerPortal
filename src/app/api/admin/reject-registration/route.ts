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
    .select("company_name, primary_contact_email, primary_contact_name, user_id, status")
    .eq("id", provider_id)
    .single();

  if (!listing || listing.status !== "pending") {
    return NextResponse.json({ error: "Listing not found or not pending." }, { status: 404 });
  }

  const { error } = await service
    .from("service_registrations")
    .delete()
    .eq("id", provider_id);

  if (error) return NextResponse.json({ error: "Failed to reject registration." }, { status: 500 });

  if (listing.user_id) {
    await service.auth.admin.deleteUser(listing.user_id as string).catch(err => {
      console.warn("[reject-registration] could not delete user:", err);
    });
  }

  const origin = process.env.NEXT_PUBLIC_MAIN_APP_URL || req.nextUrl.origin;
  if (listing.primary_contact_email) {
    await sendEmail({
      to_email: listing.primary_contact_email as string,
      to_name: (listing.primary_contact_name as string) || (listing.primary_contact_email as string),
      greeting: listing.primary_contact_name ? `Hi ${listing.primary_contact_name},` : "Hi there,",
      subject: "Update on your listing submission",
      headline: "Listing Could Not Be Approved",
      message_html: `<p>Thank you for submitting your listing for <strong>${listing.company_name}</strong>. After review, we were unable to approve it at this time.</p><p>If you believe this is an error or would like more information, please contact us and we'll be happy to assist.</p>`,
      button_label: "Contact Support",
      button_url: `${origin}/services`,
      footnote: "If you didn't submit this listing, no action is needed.",
    });
  }

  return NextResponse.json({ ok: true });
}

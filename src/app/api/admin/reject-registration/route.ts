import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { escapeHtml, sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 403 });

  const service = createServiceClient();
  const { data: admin } = await service.from("admins").select("role").eq("email", user.email).maybeSingle();
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 403 });

  const { provider_id, reason } = await req.json();
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
    // Listing is already rejected — a send failure must not fail the admin action.
    try {
      await sendEmail({
        to: listing.primary_contact_email as string,
        toName: (listing.primary_contact_name as string) || undefined,
        greeting: listing.primary_contact_name ? `Hi ${listing.primary_contact_name},` : "Hi there,",
        subject: "Update on your listing submission",
        headline: "Listing Could Not Be Approved",
        bodyHtml: `<p>Thank you for submitting your listing for <strong>${escapeHtml(listing.company_name as string)}</strong>. After review, we were unable to approve it at this time.</p>${reason ? `<p><strong>Reason:</strong> ${escapeHtml(String(reason))}</p>` : ""}<p>If you believe this is an error or would like more information, please contact us and we'll be happy to assist.</p>`,
        buttonLabel: "Contact Support",
        buttonUrl: `${origin}/services`,
        footnote: "If you didn't submit this listing, no action is needed.",
      });
    } catch (err) {
      console.error("[reject-registration] Email send failed:", err);
    }
  }

  return NextResponse.json({ ok: true });
}

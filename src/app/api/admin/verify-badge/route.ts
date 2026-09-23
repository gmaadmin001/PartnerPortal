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
    .update({ is_verified: true, badge_purchased: false })
    .eq("id", provider_id);

  if (error) return NextResponse.json({ error: "Failed to verify badge." }, { status: 500 });

  const origin = process.env.NEXT_PUBLIC_MAIN_APP_URL || req.nextUrl.origin;
  if (listing.primary_contact_email) {
    // Badge is already active — a send failure must not fail the admin action.
    try {
      await sendEmail({
        to: listing.primary_contact_email as string,
        toName: (listing.primary_contact_name as string) || undefined,
        greeting: listing.primary_contact_name ? `Hi ${listing.primary_contact_name},` : "Hi there,",
        subject: "Your Verified Badge is now active",
        headline: "You're Now ReloCentra Verified ✦",
        bodyHtml: `<p>Your Verified Badge for <strong>${escapeHtml(listing.company_name as string)}</strong> has been reviewed and is now active on your listing.</p><p>The gold "ReloCentra Verified" badge will now appear on your public profile, helping you stand out in search results.</p>`,
        buttonLabel: "View Your Listing",
        buttonUrl: `${origin}/dashboard`,
        footnote: "Thank you for being a verified partner.",
      });
    } catch (err) {
      console.error("[verify-badge] Email send failed:", err);
    }
  }

  return NextResponse.json({ ok: true });
}

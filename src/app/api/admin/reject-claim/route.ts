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

  // Fetch before clearing so we can delete the user and send email
  const { data: listing } = await service
    .from("service_registrations")
    .select("claimed_by, claim_email, claim_name, claim_status")
    .eq("id", provider_id)
    .single();

  if (!listing || listing.claim_status !== "pending") {
    return NextResponse.json({ error: "No pending claim found." }, { status: 404 });
  }

  // Clear all claim fields
  const { error } = await service
    .from("service_registrations")
    .update({
      claim_status: "rejected",
      claimed_by: null,
      claimed_at: null,
      claim_name: null,
      claim_email: null,
      claim_affiliation: null,
      claim_plan: null,
      claim_billing: null,
    })
    .eq("id", provider_id);

  if (error) return NextResponse.json({ error: "Failed to reject claim." }, { status: 500 });

  // Delete the orphaned auth account so the email is free to try again
  if (listing.claimed_by) {
    await service.auth.admin.deleteUser(listing.claimed_by as string).catch(err => {
      console.warn("[reject-claim] could not delete user:", err);
    });
  }

  // Send rejection email
  const origin = process.env.NEXT_PUBLIC_MAIN_APP_URL || req.nextUrl.origin;
  if (listing.claim_email) {
    await sendEmail({
      to_email: listing.claim_email as string,
      to_name: (listing.claim_name as string) || (listing.claim_email as string),
      greeting: listing.claim_name ? `Hi ${listing.claim_name},` : "Hi there,",
      subject: "Update on your listing claim",
      headline: "Claim Could Not Be Verified",
      message_html: `<p>Thank you for submitting a claim for a listing in our directory. After review, we were unable to verify your ownership of this listing.</p><p>If you believe this is an error, please contact us with supporting documentation and we'll be happy to review it again.</p>`,
      button_label: "Contact Support",
      button_url: `${origin}/services`,
      footnote: "If you didn't submit this claim, no action is needed.",
    });
  }

  return NextResponse.json({ ok: true });
}

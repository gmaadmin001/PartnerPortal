import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendEmail } from "@/lib/email";

function randomHex(bytes = 6): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
}

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
    .select("claimed_by, claim_status, claim_plan, claim_billing, claim_name, claim_email, slug")
    .eq("id", provider_id)
    .single();

  if (!listing?.claimed_by || listing.claim_status !== "pending") {
    return NextResponse.json({ error: "No pending claim found." }, { status: 404 });
  }

  // Basic plan → randomize slug (no custom URLs on free tier)
  const isBasic = !listing.claim_plan || listing.claim_plan === "Basic";
  let newSlug = listing.slug as string;
  if (isBasic) {
    newSlug = randomHex(6);
    const { data: collision } = await service.from("service_registrations").select("id").eq("slug", newSlug).maybeSingle();
    if (collision) newSlug = randomHex(6);
  }

  const updates: Record<string, unknown> = {
    user_id: listing.claimed_by,
    claim_status: "approved",
    status: "active",
    slug: newSlug,
    claimed_by: null,
    claimed_at: null,
    claim_name: null,
    claim_email: null,
    claim_affiliation: null,
    claim_plan: null,
    claim_billing: null,
    membership_plan: isBasic ? "Basic" : listing.claim_plan,
    membership_billing: isBasic ? null : listing.claim_billing,
    subscription_status: isBasic ? null : "active",
  };

  const { error } = await service.from("service_registrations").update(updates).eq("id", provider_id);
  if (error) return NextResponse.json({ error: "Failed to approve claim." }, { status: 500 });

  const origin = process.env.NEXT_PUBLIC_MAIN_APP_URL || req.nextUrl.origin;
  if (listing.claim_email) {
    await sendEmail({
      to_email: listing.claim_email as string,
      to_name: (listing.claim_name as string) || (listing.claim_email as string),
      greeting: listing.claim_name ? `Hi ${listing.claim_name},` : "Hi there,",
      subject: "Your listing claim has been approved",
      headline: "Claim Approved — Welcome to the Directory",
      message_html: `<p>Great news! Your claim has been reviewed and approved. Your listing is now active and linked to your account.</p><p>Sign in to your dashboard to manage your profile and update your details.</p>`,
      button_label: "Go to Dashboard",
      button_url: `${origin}/dashboard`,
      footnote: "If you have any questions, please contact our support team.",
    });
  }

  return NextResponse.json({ ok: true });
}

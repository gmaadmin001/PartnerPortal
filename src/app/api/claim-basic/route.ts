import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      name?: string; email?: string; password?: string;
      slug?: string; affiliation?: string;
    };
    const { name, email, password, slug, affiliation } = body;

    if (!name?.trim())  return NextResponse.json({ error: "Name is required." }, { status: 400 });
    if (!email?.trim()) return NextResponse.json({ error: "Email is required." }, { status: 400 });
    if (!slug)          return NextResponse.json({ error: "Listing slug is required." }, { status: 400 });
    if (!password || password.length < 8)
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });

    const supabase = createServiceClient();

    // Verify listing exists, is unclaimed, and has no pending claim
    const { data: listing } = await supabase
      .from("service_registrations")
      .select("id, user_id, claim_status")
      .eq("slug", slug)
      .maybeSingle();

    if (!listing) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    if (listing.user_id) return NextResponse.json({ error: "This listing has already been claimed." }, { status: 409 });
    if (listing.claim_status === "pending") return NextResponse.json({ error: "This listing already has a pending claim under review." }, { status: 409 });

    // Create the user account upfront so they can sign in and check status
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true,
      user_metadata: { full_name: name.trim() },
    });

    if (createErr) {
      if (createErr.message?.toLowerCase().includes("already")) {
        return NextResponse.json({
          error: "An account with this email already exists. Please sign in at /login.",
        }, { status: 409 });
      }
      console.error("[claim-basic] createUser error:", createErr);
      return NextResponse.json({ error: "Could not create account. Please try again." }, { status: 500 });
    }

    const userId = created.user.id;

    // Set pending claim — do NOT set user_id or change slug yet (admin approves first)
    const { error: updateErr } = await supabase
      .from("service_registrations")
      .update({
        claimed_by: userId,
        claimed_at: new Date().toISOString(),
        claim_status: "pending",
        claim_name: name.trim(),
        claim_email: email.trim(),
        claim_affiliation: affiliation?.trim() ?? null,
        claim_plan: "Basic",
        claim_billing: null,
      })
      .eq("id", listing.id)
      .is("user_id", null);

    if (updateErr) {
      console.error("[claim-basic] pending update error:", updateErr);
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: "Could not submit claim. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[claim-basic] unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error. Please try again." }, { status: 500 });
  }
}

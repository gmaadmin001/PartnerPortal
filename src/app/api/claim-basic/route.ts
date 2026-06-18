import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

function randomHex(bytes = 6): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { name?: string; email?: string; password?: string; slug?: string };
    const { name, email, password, slug } = body;

    if (!name?.trim())        return NextResponse.json({ error: "Name is required." }, { status: 400 });
    if (!email?.trim())       return NextResponse.json({ error: "Email is required." }, { status: 400 });
    if (!slug)                return NextResponse.json({ error: "Listing slug is required." }, { status: 400 });
    if (!password || password.length < 8)
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });

    const supabase = createServiceClient();

    // Verify listing exists and is unclaimed
    const { data: listing } = await supabase
      .from("service_registrations")
      .select("id, user_id")
      .eq("slug", slug)
      .maybeSingle();

    if (!listing)       return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    if (listing.user_id) return NextResponse.json({ error: "This listing has already been claimed." }, { status: 409 });

    // Create the user
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true,
      user_metadata: { full_name: name.trim() },
    });

    if (createErr) {
      if (createErr.message?.toLowerCase().includes("already")) {
        return NextResponse.json({
          error: "An account with this email already exists. Please sign in at /login to claim your listing.",
        }, { status: 409 });
      }
      console.error("[claim-basic] createUser error:", createErr);
      return NextResponse.json({ error: "Could not create account. Please try again." }, { status: 500 });
    }

    const userId = created.user.id;

    // Generate unique random hex slug — Basic plan has no custom URL
    let newSlug = randomHex(6);
    const { data: collision } = await supabase
      .from("service_registrations")
      .select("id")
      .eq("slug", newSlug)
      .maybeSingle();
    if (collision) newSlug = randomHex(6);

    // Link listing to user, randomize slug, set Basic
    const { error: updateErr } = await supabase
      .from("service_registrations")
      .update({
        user_id: userId,
        slug: newSlug,
        membership_plan: "Basic",
        membership_billing: null,
        status: "active",
      })
      .eq("id", listing.id)
      .is("user_id", null);

    if (updateErr) {
      console.error("[claim-basic] update error:", updateErr);
      // Clean up orphaned account
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: "Could not link listing. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[claim-basic] unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error. Please try again." }, { status: 500 });
  }
}

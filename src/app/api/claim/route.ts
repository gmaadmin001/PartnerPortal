import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to claim a listing." }, { status: 401 });

  const { provider_id } = await req.json();
  if (!provider_id) return NextResponse.json({ error: "Missing provider_id." }, { status: 400 });

  // Fetch the listing (public read — anon client is fine here)
  const { data: listing, error: fetchErr } = await supabase
    .from("service_registrations")
    .select("id, user_id, claimed_by, claim_status")
    .eq("id", provider_id)
    .single();

  if (fetchErr || !listing) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  if (listing.user_id === user.id) return NextResponse.json({ error: "You already own this listing." }, { status: 409 });
  if (listing.claimed_by && listing.claim_status === "pending") {
    return NextResponse.json({ error: "This listing already has a pending claim." }, { status: 409 });
  }

  // Write via service-role — user doesn't own the row so RLS would block a direct update
  const service = createServiceClient();
  const { error: updateErr } = await service
    .from("service_registrations")
    .update({ claimed_by: user.id, claimed_at: new Date().toISOString(), claim_status: "pending" })
    .eq("id", provider_id);

  if (updateErr) return NextResponse.json({ error: "Failed to submit claim." }, { status: 500 });
  return NextResponse.json({ ok: true });
}

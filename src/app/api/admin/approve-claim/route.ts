import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  const { provider_id } = await req.json();
  if (!provider_id) return NextResponse.json({ error: "Missing provider_id." }, { status: 400 });

  const service = createServiceClient();

  // Fetch the claim to get claimed_by
  const { data: listing } = await service
    .from("service_registrations")
    .select("claimed_by, claim_status")
    .eq("id", provider_id)
    .single();

  if (!listing?.claimed_by || listing.claim_status !== "pending") {
    return NextResponse.json({ error: "No pending claim found." }, { status: 404 });
  }

  const { error } = await service
    .from("service_registrations")
    .update({ user_id: listing.claimed_by, claim_status: "approved", status: "pending" })
    .eq("id", provider_id);

  if (error) return NextResponse.json({ error: "Failed to approve claim." }, { status: 500 });
  return NextResponse.json({ ok: true });
}

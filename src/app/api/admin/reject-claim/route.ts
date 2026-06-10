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
  const { error } = await service
    .from("service_registrations")
    .update({ claim_status: "rejected", claimed_by: null, claimed_at: null })
    .eq("id", provider_id);

  if (error) return NextResponse.json({ error: "Failed to reject claim." }, { status: 500 });
  return NextResponse.json({ ok: true });
}

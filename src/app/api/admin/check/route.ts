import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

// GET — post-login check (requires active session)
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ isAdmin: false });

  const service = createServiceClient();
  const { data } = await service
    .from("admins")
    .select("role")
    .eq("email", user.email)
    .single();

  return NextResponse.json({ isAdmin: !!data });
}

// POST — pre-auth email lookup for magic-link flow (no session required)
export async function POST(req: NextRequest) {
  const { email } = await req.json() as { email?: string };
  if (!email) return NextResponse.json({ isAdmin: false });

  const service = createServiceClient();
  const { data } = await service
    .from("admins")
    .select("role")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();

  return NextResponse.json({ isAdmin: !!data });
}

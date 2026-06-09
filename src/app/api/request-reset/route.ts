import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Clear any existing recovery token so Supabase allows a fresh email
  await supabase.rpc("clear_user_recovery", { user_email: email });

  return NextResponse.json({ success: true });
}

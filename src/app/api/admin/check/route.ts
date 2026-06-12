import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

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

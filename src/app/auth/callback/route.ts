import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/auth/reset-password`);
      }

      // Check if the logged-in user is an admin and redirect accordingly
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        const service = createServiceClient();
        const { data: admin } = await service
          .from("admins")
          .select("role")
          .eq("email", user.email)
          .maybeSingle();
        if (admin) {
          return NextResponse.redirect(`${origin}/admin`);
        }
      }

      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}

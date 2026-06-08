import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { step, registrationId, ...fields } = body;

  if (step === 1) {
    const { register_as, primary_category, sub_category } = fields;
    if (!register_as || !primary_category || !sub_category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("service_registrations")
      .insert({
        user_id: user.id,
        register_as,
        primary_category,
        sub_category,
        current_step: 1,
        status: "draft",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Failed to save. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ registrationId: data.id });
  }

  return NextResponse.json({ error: "Unknown step" }, { status: 400 });
}

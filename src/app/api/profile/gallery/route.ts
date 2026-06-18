import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(req: NextRequest) {
  const supabaseSSR = await createServerClient();
  const { data: { user }, error: authErr } = await supabaseSSR.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  const { data: reg } = await supabase
    .from("service_registrations")
    .select("membership_plan")
    .eq("user_id", user.id)
    .single();

  const plan = (reg?.membership_plan as string | null) ?? null;

  if (!plan || !plan.startsWith("Premier")) {
    return NextResponse.json(
      { error: "Photo gallery requires a Premier plan." },
      { status: 403 }
    );
  }

  const { photos } = await req.json();
  const photosArr: string[] = Array.isArray(photos) ? photos : [];

  const { error } = await supabase
    .from("service_registrations")
    .update({ photos: photosArr })
    .eq("user_id", user.id);

  if (error) {
    console.error("[api/profile/gallery] update failed:", error);
    return NextResponse.json({ error: "Save failed: " + error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

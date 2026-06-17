import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createPortalSession } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const supabaseAuth = await createClient();
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceClient();
    const { data: reg } = await supabase
      .from("service_registrations")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    if (!reg?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No billing account found. Please contact support." },
        { status: 400 },
      );
    }

    const origin =
      req.headers.get("origin") ?? "https://partnerportal.gmaadmin001.workers.dev";
    const session = (await createPortalSession(
      reg.stripe_customer_id as string,
      `${origin}/dashboard/plans`,
    )) as { url: string };

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe-portal] Error:", err);
    return NextResponse.json(
      { error: "Failed to open billing portal. Please try again." },
      { status: 500 },
    );
  }
}

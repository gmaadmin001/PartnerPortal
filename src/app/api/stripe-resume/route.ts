import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(_req: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "Payments are not configured." }, { status: 503 });
  }

  try {
    const supabaseAuth = await createClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceClient();
    const { data: reg } = await supabase
      .from("service_registrations")
      .select("stripe_subscription_id")
      .eq("user_id", user.id)
      .single();

    if (!reg?.stripe_subscription_id) {
      return NextResponse.json({ error: "No active subscription found." }, { status: 400 });
    }

    const stripeRes = await fetch(
      `https://api.stripe.com/v1/subscriptions/${reg.stripe_subscription_id}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ cancel_at_period_end: "false" }).toString(),
      },
    );

    if (!stripeRes.ok) {
      const err = await stripeRes.json() as { error?: { message?: string } };
      return NextResponse.json({ error: err.error?.message ?? "Stripe error." }, { status: 502 });
    }

    await supabase
      .from("service_registrations")
      .update({ subscription_status: "active" })
      .eq("user_id", user.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[stripe-resume] Error:", err);
    return NextResponse.json({ error: "Failed to resume subscription. Please try again." }, { status: 500 });
  }
}

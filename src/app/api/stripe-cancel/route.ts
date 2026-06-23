import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { cancelSubscriptionAtPeriodEnd } from "@/lib/stripe";

export async function POST(_req: NextRequest) {
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
      .select("stripe_subscription_id")
      .eq("user_id", user.id)
      .single();

    if (!reg?.stripe_subscription_id) {
      return NextResponse.json(
        { error: "No active subscription found." },
        { status: 400 },
      );
    }

    const sub = await cancelSubscriptionAtPeriodEnd(reg.stripe_subscription_id as string) as { current_period_end?: number };
    const periodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null;
    return NextResponse.json({ success: true, period_end: periodEnd });
  } catch (err) {
    console.error("[stripe-cancel] Error:", err);
    return NextResponse.json(
      { error: "Failed to cancel subscription. Please try again." },
      { status: 500 },
    );
  }
}

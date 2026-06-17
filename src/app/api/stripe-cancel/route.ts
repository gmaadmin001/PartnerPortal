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

    await cancelSubscriptionAtPeriodEnd(reg.stripe_subscription_id as string);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[stripe-cancel] Error:", err);
    return NextResponse.json(
      { error: "Failed to cancel subscription. Please try again." },
      { status: 500 },
    );
  }
}

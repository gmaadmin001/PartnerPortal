import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

function buildPriceMap(): Record<string, { plan: string; billing: "monthly" | "annual" }> {
  return {
    [process.env.STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID ?? ""]: { plan: "Professional", billing: "monthly" },
    [process.env.STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID ?? ""]:  { plan: "Professional", billing: "annual" },
    [process.env.STRIPE_PREMIER_MONTHLY_PRICE_ID ?? ""]:      { plan: "Premier",       billing: "monthly" },
    [process.env.STRIPE_PREMIER_ANNUAL_PRICE_ID ?? ""]:       { plan: "Premier",       billing: "annual" },
  };
}

export async function POST() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return NextResponse.json({ synced: false });

  const supabaseAuth = await createClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  const { data: reg } = await supabase
    .from("service_registrations")
    .select("stripe_subscription_id, membership_plan, membership_billing, subscription_status")
    .eq("user_id", user.id)
    .single();

  if (!reg?.stripe_subscription_id) return NextResponse.json({ synced: false });

  const subRes = await fetch(
    `https://api.stripe.com/v1/subscriptions/${reg.stripe_subscription_id}`,
    { headers: { Authorization: `Bearer ${secretKey}` } },
  );
  if (!subRes.ok) return NextResponse.json({ synced: false });

  const sub = await subRes.json() as {
    status?: string;
    cancel_at_period_end?: boolean;
    items?: { data?: Array<{ price?: { id: string } }> };
  };

  const priceId = sub.items?.data?.[0]?.price?.id;
  if (!priceId) return NextResponse.json({ synced: false });

  const planInfo = buildPriceMap()[priceId];
  if (!planInfo) return NextResponse.json({ synced: false });

  const planFull = planInfo.billing === "annual"
    ? `${planInfo.plan} – Annual`
    : `${planInfo.plan} – Monthly`;

  const correctStatus =
    sub.cancel_at_period_end ? "cancelling"
    : sub.status === "past_due" ? "past_due"
    : sub.status === "active" || sub.status === "trialing" ? "active"
    : (reg.subscription_status ?? "active");

  const planChanged   = planFull !== reg.membership_plan || planInfo.billing !== reg.membership_billing;
  const statusChanged = correctStatus !== reg.subscription_status;

  if (planChanged || statusChanged) {
    await supabase.from("service_registrations").update({
      membership_plan:    planFull,
      membership_billing: planInfo.billing,
      subscription_status: correctStatus,
    }).eq("user_id", user.id);
    return NextResponse.json({ synced: true, corrected: true, plan: planFull });
  }

  return NextResponse.json({ synced: true, corrected: false });
}

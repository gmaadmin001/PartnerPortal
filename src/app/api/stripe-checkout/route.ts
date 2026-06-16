import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

// (plan, billing) → Stripe Price ID. Populated from server-only env vars.
const PRICE_IDS: Record<string, Record<string, string | undefined>> = {
  Professional: {
    monthly: process.env.STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID,
    annual: process.env.STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID,
  },
  Premier: {
    monthly: process.env.STRIPE_PREMIER_MONTHLY_PRICE_ID,
    annual: process.env.STRIPE_PREMIER_ANNUAL_PRICE_ID,
  },
};

function appOrigin(req: NextRequest): string {
  return process.env.NEXT_PUBLIC_MAIN_APP_URL || req.nextUrl.origin;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, membershipPlan, membershipBilling, registration } = body;

    // Free tier never touches Stripe — client runs the existing free signup at step 4.
    if (membershipPlan === "Basic") {
      return NextResponse.json({ skip: true });
    }

    // Validate inputs.
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "A login email is required." }, { status: 400 });
    }
    const billing = membershipBilling === "annual" ? "annual" : "monthly";
    const priceId = PRICE_IDS[membershipPlan]?.[billing];
    if (!priceId) {
      return NextResponse.json(
        { error: `Unknown plan/billing combination: ${membershipPlan} / ${billing}.` },
        { status: 400 }
      );
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      console.warn("stripe-checkout: STRIPE_SECRET_KEY is not configured.");
      return NextResponse.json(
        { error: "Payments are not configured. Please try again later." },
        { status: 503 }
      );
    }

    // Stash the registration so the webhook can create the account *after* payment.
    const supabase = createServiceClient();
    const { data: pending, error: insertError } = await supabase
      .from("pending_registrations")
      .insert({
        email,
        membership_plan: membershipPlan,
        membership_billing: billing,
        registration: registration ?? {},
      })
      .select("id")
      .single();

    if (insertError || !pending) {
      console.error("stripe-checkout: failed to stash pending registration:", insertError);
      return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status: 500 });
    }

    const origin = appOrigin(req);

    // Create the Checkout Session via the Stripe REST API (no SDK — Edge/Workers-safe).
    const form = new URLSearchParams();
    form.set("mode", "subscription");
    form.set("line_items[0][price]", priceId);
    form.set("line_items[0][quantity]", "1");
    form.set("customer_email", email);
    form.set("client_reference_id", pending.id);
    form.set("metadata[pending_id]", pending.id);
    // Also tag the subscription itself so S11 lifecycle webhooks can correlate it.
    form.set("subscription_data[metadata][pending_id]", pending.id);
    form.set("success_url", `${origin}/register?status=success&session_id={CHECKOUT_SESSION_ID}`);
    form.set("cancel_url", `${origin}/register?status=cancelled`);

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    });

    const session = await stripeRes.json();

    if (!stripeRes.ok) {
      console.error("stripe-checkout: Stripe API error:", session?.error ?? session);
      // Clean up the orphaned pending row so it isn't left dangling.
      await supabase.from("pending_registrations").delete().eq("id", pending.id);
      return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status: 502 });
    }

    // Record the session id on the pending row for reconciliation.
    await supabase
      .from("pending_registrations")
      .update({ stripe_session_id: session.id })
      .eq("id", pending.id);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("stripe-checkout error:", err);
    return NextResponse.json({ error: "Unexpected error. Please try again." }, { status: 500 });
  }
}

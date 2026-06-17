import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(req: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "Payments are not configured." }, { status: 503 });
  }

  const priceId = process.env.STRIPE_VERIFIED_BADGE_PRICE_ID;
  if (!priceId) {
    return NextResponse.json({ error: "Badge price not configured." }, { status: 503 });
  }

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
      .select("stripe_customer_id, primary_contact_email")
      .eq("user_id", user.id)
      .single();

    const origin =
      process.env.NEXT_PUBLIC_MAIN_APP_URL || req.headers.get("origin") || "";

    const form = new URLSearchParams({
      mode: "payment",
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      "metadata[user_id]": user.id,
      "metadata[type]": "verified_badge",
      success_url: `${origin}/dashboard/plans?badge=1`,
      cancel_url: `${origin}/dashboard/plans`,
    });

    // Attach existing Stripe customer if we have one, otherwise use email
    if (reg?.stripe_customer_id) {
      form.set("customer", reg.stripe_customer_id as string);
    } else {
      const email = user.email ?? ((reg?.primary_contact_email as string | undefined) ?? "");
      if (email) form.set("customer_email", email);
    }

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    });

    const session = (await res.json()) as { url?: string; error?: { message?: string } };

    if (!res.ok) {
      return NextResponse.json(
        { error: session.error?.message ?? "Failed to start checkout." },
        { status: 502 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe-badge] error:", err);
    return NextResponse.json({ error: "Unexpected error. Please try again." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createClient } from "@/lib/supabase/server";

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
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "Payments are not configured." }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // ── Claim checkout (vendor claiming a pre-loaded listing) ───────────────────
  if (body.mode === "claim") {
    try {
      const { name, email, password, slug, membershipPlan, membershipBilling } = body as {
        name: string; email: string; password: string; slug: string; membershipPlan: string; membershipBilling: string;
      };

      if (!email || !slug) {
        return NextResponse.json({ error: "Email and listing slug are required." }, { status: 400 });
      }
      if (!password || password.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
      }

      const billing = membershipBilling === "annual" ? "annual" : "monthly";
      const priceId = PRICE_IDS[membershipPlan]?.[billing];
      if (!priceId) {
        return NextResponse.json({ error: `Unknown plan: ${membershipPlan} / ${billing}` }, { status: 400 });
      }

      const supabase = createServiceClient();
      const { data: pending, error: insertErr } = await supabase
        .from("pending_registrations")
        .insert({
          email,
          membership_plan: membershipPlan,
          membership_billing: billing,
          registration: { claimSlug: slug, name: name?.trim() ?? "", password },
        })
        .select("id")
        .single();

      if (insertErr || !pending) {
        console.error("[stripe-checkout] claim: failed to stash pending:", insertErr);
        return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status: 500 });
      }

      const origin = appOrigin(req);
      const form = new URLSearchParams({
        mode: "subscription",
        "line_items[0][price]": priceId,
        "line_items[0][quantity]": "1",
        customer_email: email,
        client_reference_id: pending.id as string,
        "metadata[mode]": "claim",
        "metadata[pending_id]": pending.id as string,
        "metadata[slug]": slug,
        success_url: `${origin}/claim/${slug}?status=success&email=${encodeURIComponent(email)}`,
        cancel_url: `${origin}/claim/${slug}`,
      });

      const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString(),
      });
      const session = await stripeRes.json() as { url?: string; id?: string; error?: { message?: string } };

      if (!stripeRes.ok) {
        console.error("[stripe-checkout] claim Stripe error:", session.error);
        await supabase.from("pending_registrations").delete().eq("id", pending.id);
        return NextResponse.json({ error: session.error?.message ?? "Could not start checkout." }, { status: 502 });
      }

      await supabase.from("pending_registrations").update({ stripe_session_id: session.id }).eq("id", pending.id);
      return NextResponse.json({ url: session.url });
    } catch (err) {
      console.error("[stripe-checkout] claim error:", err);
      return NextResponse.json({ error: "Unexpected error. Please try again." }, { status: 500 });
    }
  }

  // ── Dashboard upgrade (existing logged-in users changing plans) ──────────────
  if (body.mode === "dashboard_upgrade") {
    try {
      const supabaseAuth = await createClient();
      const {
        data: { user: authUser },
      } = await supabaseAuth.auth.getUser();
      if (!authUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const planName = body.plan as string;
      const billing = (body.billing === "annual" ? "annual" : "monthly") as "monthly" | "annual";
      const priceId = PRICE_IDS[planName]?.[billing];

      if (!priceId) {
        return NextResponse.json(
          { error: `Unknown plan: ${planName} / ${billing}` },
          { status: 400 },
        );
      }

      const supabase = createServiceClient();
      const { data: reg } = await supabase
        .from("service_registrations")
        .select("stripe_customer_id, stripe_subscription_id, primary_contact_email")
        .eq("user_id", authUser.id)
        .single();

      // ── Case A: Existing subscription — update price in Stripe ────────────────
      if (reg?.stripe_subscription_id) {
        const subRes = await fetch(
          `https://api.stripe.com/v1/subscriptions/${reg.stripe_subscription_id}`,
          { headers: { Authorization: `Bearer ${secretKey}` } },
        );
        const sub = await subRes.json();
        const itemId = (sub as { items?: { data?: Array<{ id: string }> } }).items?.data?.[0]?.id;

        if (!itemId) {
          return NextResponse.json(
            { error: "Subscription item not found." },
            { status: 500 },
          );
        }

        const updateForm = new URLSearchParams({
          "items[0][id]": itemId,
          "items[0][price]": priceId,
          proration_behavior: "create_prorations",
        });
        const updateRes = await fetch(
          `https://api.stripe.com/v1/subscriptions/${reg.stripe_subscription_id}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${secretKey}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: updateForm.toString(),
          },
        );

        if (!updateRes.ok) {
          const err = (await updateRes.json()) as { error?: { message?: string } };
          return NextResponse.json(
            { error: err.error?.message ?? "Stripe error updating subscription." },
            { status: 502 },
          );
        }

        const planFull = billing === "annual" ? `${planName} – Annual` : `${planName} – Monthly`;
        await supabase
          .from("service_registrations")
          .update({ membership_plan: planFull, membership_billing: billing })
          .eq("user_id", authUser.id);

        return NextResponse.json({ success: true });
      }

      // ── Case B: No subscription (upgrading from Basic) — new Checkout session ─
      let customerId = reg?.stripe_customer_id as string | undefined;
      const email =
        authUser.email ?? ((reg?.primary_contact_email as string | undefined) ?? "");

      if (!customerId) {
        const custForm = new URLSearchParams({
          email,
          "metadata[user_id]": authUser.id,
        });
        const custRes = await fetch("https://api.stripe.com/v1/customers", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: custForm.toString(),
        });
        const customer = (await custRes.json()) as { id?: string; error?: { message?: string } };
        if (!custRes.ok) {
          return NextResponse.json(
            { error: customer.error?.message ?? "Failed to create Stripe customer." },
            { status: 502 },
          );
        }
        customerId = customer.id!;
        await supabase
          .from("service_registrations")
          .update({ stripe_customer_id: customerId })
          .eq("user_id", authUser.id);
      }

      const form = new URLSearchParams({
        mode: "subscription",
        customer: customerId,
        "line_items[0][price]": priceId,
        "line_items[0][quantity]": "1",
        "metadata[mode]": "dashboard_upgrade",
        "metadata[user_id]": authUser.id,
        "metadata[plan]": planName,
        "metadata[billing]": billing,
        success_url: `${appOrigin(req)}/dashboard/plans?upgraded=1`,
        cancel_url: `${appOrigin(req)}/dashboard/plans`,
      });

      const checkoutRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: form.toString(),
      });
      const session = (await checkoutRes.json()) as { url?: string; error?: { message?: string } };

      if (!checkoutRes.ok) {
        return NextResponse.json(
          { error: session.error?.message ?? "Stripe checkout error." },
          { status: 502 },
        );
      }

      return NextResponse.json({ url: session.url });
    } catch (err) {
      console.error("[stripe-checkout] dashboard_upgrade error:", err);
      return NextResponse.json({ error: "Unexpected error. Please try again." }, { status: 500 });
    }
  }

  // ── New registration checkout ─────────────────────────────────────────────────
  try {
    const { email, membershipPlan, membershipBilling, registration } = body;

    if (membershipPlan === "Basic") {
      return NextResponse.json({ skip: true });
    }

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "A login email is required." }, { status: 400 });
    }
    const billing = membershipBilling === "annual" ? "annual" : "monthly";
    const priceId = PRICE_IDS[membershipPlan as string]?.[billing];
    if (!priceId) {
      return NextResponse.json(
        { error: `Unknown plan/billing: ${membershipPlan} / ${billing}.` },
        { status: 400 },
      );
    }

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
      return NextResponse.json(
        { error: "Could not start checkout. Please try again." },
        { status: 500 },
      );
    }

    const origin = appOrigin(req);

    const form = new URLSearchParams({
      mode: "subscription",
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      customer_email: email,
      client_reference_id: pending.id as string,
      "metadata[pending_id]": pending.id as string,
      "subscription_data[metadata][pending_id]": pending.id as string,
      success_url: `${origin}/register?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/register?status=cancelled`,
    });

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
      await supabase.from("pending_registrations").delete().eq("id", pending.id);
      return NextResponse.json(
        { error: "Could not start checkout. Please try again." },
        { status: 502 },
      );
    }

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

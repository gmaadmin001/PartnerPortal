import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendEmail } from "@/lib/email";

const SIGNATURE_TOLERANCE_SECONDS = 300;

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// Verify a Stripe-Signature header: `t=<ts>,v1=<sig>[,v1=<sig2>]`.
// signed_payload = `${t}.${rawBody}`; HMAC-SHA256 keyed by the whsec_ secret (UTF-8); hex compare.
async function verifyStripeSignature(secret: string, sigHeader: string, rawBody: string): Promise<boolean> {
  const parts = Object.fromEntries(
    sigHeader.split(",").map((kv) => {
      const i = kv.indexOf("=");
      return [kv.slice(0, i).trim(), kv.slice(i + 1).trim()];
    })
  );
  const t = parts["t"];
  if (!t) return false;
  const ts = parseInt(t, 10);
  if (isNaN(ts) || Math.abs(Math.floor(Date.now() / 1000) - ts) > SIGNATURE_TOLERANCE_SECONDS) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBytes = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${t}.${rawBody}`));
  const computed = Array.from(new Uint8Array(sigBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Header may carry multiple v1 signatures (key rotation) — accept if any matches.
  const provided = sigHeader
    .split(",")
    .map((kv) => kv.split("="))
    .filter(([k]) => k.trim() === "v1")
    .map(([, v]) => v.trim());
  return provided.some((sig) => constantTimeEqual(sig, computed));
}

function toNameSlug(name: string): string {
  return (name ?? "provider")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 60) || "provider";
}

function randomHex(bytes = 6): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
}

const PREMIUM_PLANS = ["Professional", "Premier"];

async function buildSlug(
  supabase: ReturnType<typeof createServiceClient>,
  companyName: string,
  plan: string
): Promise<string> {
  if (!PREMIUM_PLANS.some((p) => plan.startsWith(p))) return randomHex(6);
  const base = toNameSlug(companyName);
  const { data: existing } = await supabase
    .from("service_registrations")
    .select("slug")
    .like("slug", `${base}%`);
  const taken = new Set((existing ?? []).map((r: { slug: string }) => r.slug));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

// Map a Stripe subscription status onto our app-level subscription_status.
// Returns null for transient/unknown states so we never clobber a good value.
function mapSubscriptionStatus(stripeStatus?: string): string | null {
  switch (stripeStatus) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
    case "unpaid":
    case "incomplete_expired":
    case "paused":
      return "Suspended";
    default:
      return null; // incomplete / unknown → leave as-is
  }
}

// Reverse-map a Stripe price ID to plan name + billing cycle.
function planFromPriceId(priceId: string): { plan: string; billing: "monthly" | "annual" } | null {
  const map: Record<string, { plan: string; billing: "monthly" | "annual" }> = {
    [process.env.STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID ?? ""]: { plan: "Professional", billing: "monthly" },
    [process.env.STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID ?? ""]:  { plan: "Professional", billing: "annual" },
    [process.env.STRIPE_PREMIER_MONTHLY_PRICE_ID ?? ""]:      { plan: "Premier", billing: "monthly" },
    [process.env.STRIPE_PREMIER_ANNUAL_PRICE_ID ?? ""]:       { plan: "Premier", billing: "annual" },
  };
  return map[priceId] ?? null;
}

async function setStatusBySubscription(
  supabase: ReturnType<typeof createServiceClient>,
  subscriptionId: string | undefined,
  status: string
): Promise<void> {
  if (!subscriptionId) return;
  const { error } = await supabase
    .from("service_registrations")
    .update({ subscription_status: status })
    .eq("stripe_subscription_id", subscriptionId);
  if (error) console.error("[stripe-webhook] setStatusBySubscription failed:", error);
}

const INVITE_COPY = {
  subject: "Payment confirmed — set up your Partner Portal account",
  headline: "You're all set — finish your account",
  message_html:
    "<p>Your payment was received and your Global Mobility Adviser Partner listing has been created. Click below to set your password and access your dashboard.</p>",
  button_label: "Set Your Password",
  footnote: "If you didn't sign up for the Partner Portal, you can safely ignore this email.",
};

export async function POST(req: NextRequest) {
  // Raw body is required for signature verification — read it before any parsing.
  const rawBody = await req.text();

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("[stripe-webhook] STRIPE_WEBHOOK_SECRET not configured — ignoring event.");
    return NextResponse.json({ received: true });
  }

  const sigHeader = req.headers.get("stripe-signature") ?? "";
  const valid = await verifyStripeSignature(secret, sigHeader, rawBody);
  if (!valid) {
    console.error("[stripe-webhook] Invalid signature.");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { type?: string; data?: { object?: Record<string, unknown> } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Subscription lifecycle (S11): map Stripe state onto subscription_status, keyed by the
  // stripe_subscription_id persisted at fulfilment. Idempotent (set-to-value); no-op if untracked.
  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted" ||
    event.type === "invoice.payment_failed"
  ) {
    try {
      const supabase = createServiceClient();
      const obj = (event.data?.object ?? {}) as {
        id?: string; status?: string; subscription?: string;
        items?: { data?: Array<{ price?: { id?: string } }> };
      };
      const prev = (event.data as Record<string, unknown>)?.previous_attributes as Record<string, unknown> | undefined;

      if (event.type === "customer.subscription.deleted") {
        // Full downgrade: set plan to Basic, clear Stripe fields, change slug
        const { data: reg } = await supabase
          .from("service_registrations")
          .select("id, user_id, slug")
          .eq("stripe_subscription_id", obj.id ?? "")
          .maybeSingle();
        if (reg) {
          const basicSlug = "basic-" + (reg.user_id as string).replace(/-/g, "").substring(0, 8);
          await supabase.from("service_registrations").update({
            membership_plan: "Basic",
            membership_billing: null,
            subscription_status: null,
            stripe_subscription_id: null,
            premium_slug: reg.slug,
            slug: basicSlug,
          }).eq("id", reg.id);
        }
      } else if (event.type === "customer.subscription.updated") {
        if (prev?.items) {
          // Price changed — update plan name in DB
          const newPriceId = obj.items?.data?.[0]?.price?.id;
          const planInfo = newPriceId ? planFromPriceId(newPriceId) : null;
          if (planInfo) {
            const planFull = planInfo.billing === "annual" ? `${planInfo.plan} – Annual` : `${planInfo.plan} – Monthly`;
            await supabase.from("service_registrations").update({
              membership_plan: planFull,
              membership_billing: planInfo.billing,
              subscription_status: "active",
            }).eq("stripe_subscription_id", obj.id ?? "");
          }
        } else {
          // Status change only (e.g. cancel_at_period_end toggled, payment status, etc.)
          const mapped = mapSubscriptionStatus(obj.status);
          if (mapped) await setStatusBySubscription(supabase, obj.id, mapped);
        }
      } else {
        // invoice.payment_failed — early "retrying" signal
        await setStatusBySubscription(supabase, obj.subscription, "past_due");
      }
      return NextResponse.json({ received: true });
    } catch (err) {
      console.error("[stripe-webhook] subscription lifecycle error:", err);
      return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
  }

  // Only checkout.session.completed creates accounts; any other event type is acked.
  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  try {
    const session = (event.data?.object ?? {}) as {
      metadata?: {
        pending_id?: string;
        mode?: string;
        user_id?: string;
        plan?: string;
        billing?: string;
        type?: string;
      };
      customer?: string;
      subscription?: string;
      customer_email?: string;
      customer_details?: { email?: string };
    };

    const pendingId = session.metadata?.pending_id;
    const mode = session.metadata?.mode;

    // Dashboard upgrade: update the existing user's plan and stripe fields.
    if (mode === "dashboard_upgrade") {
      const userId = session.metadata?.user_id;
      const plan = session.metadata?.plan;
      const billing = session.metadata?.billing;
      const newSubId = session.subscription;
      const customerId = session.customer;

      if (userId && plan) {
        const supabase = createServiceClient();
        const planFull = billing === "annual" ? `${plan} – Annual` : `${plan} – Monthly`;
        const { error } = await supabase
          .from("service_registrations")
          .update({
            membership_plan: planFull,
            membership_billing: billing ?? "monthly",
            stripe_customer_id: customerId ?? null,
            stripe_subscription_id: newSubId ?? null,
            subscription_status: "active",
          })
          .eq("user_id", userId);
        if (error) console.error("[stripe-webhook] dashboard_upgrade update failed:", error);
      }

      // Cancel any other active subscriptions for this customer so they aren't double-billed.
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (stripeKey && customerId && newSubId) {
        try {
          const listRes = await fetch(
            `https://api.stripe.com/v1/subscriptions?customer=${customerId}&status=active&limit=100`,
            { headers: { Authorization: `Bearer ${stripeKey}` } },
          );
          const list = (await listRes.json()) as { data?: Array<{ id: string }> };
          for (const sub of list.data ?? []) {
            if (sub.id !== newSubId) {
              await fetch(`https://api.stripe.com/v1/subscriptions/${sub.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${stripeKey}` },
              });
            }
          }
        } catch (err) {
          console.error("[stripe-webhook] failed to cancel old subscriptions:", err);
        }
      }

      return NextResponse.json({ received: true });
    }

    // Verified Badge one-time purchase: mark badge_purchased (admin reviews before is_verified is set).
    if (session.metadata?.type === "verified_badge") {
      const userId = session.metadata?.user_id;
      if (userId) {
        const supabase = createServiceClient();
        const { error } = await supabase
          .from("service_registrations")
          .update({ badge_purchased: true })
          .eq("user_id", userId);
        if (error) {
          console.error("[stripe-webhook] verified_badge update failed:", error);
        } else {
          // Fetch company details + all admin emails for the notification.
          const [{ data: reg }, { data: admins }] = await Promise.all([
            supabase
              .from("service_registrations")
              .select("company_name")
              .eq("user_id", userId)
              .single(),
            supabase
              .from("admins")
              .select("email, name"),
          ]);
          const companyLabel = (reg?.company_name as string | null) ?? "A new partner";
          const adminOrigin = process.env.NEXT_PUBLIC_MAIN_APP_URL || req.nextUrl.origin;
          await Promise.all(
            (admins ?? []).map((admin: { email: string; name: string | null }) =>
              sendEmail({
                to_email: admin.email,
                to_name: admin.name ?? "Admin",
                subject: `Action required: Verified Badge purchase — ${companyLabel}`,
                greeting: `Hi ${admin.name ?? "Admin"},`,
                headline: "A partner purchased the Verified Badge",
                message_html: `<p><strong>${companyLabel}</strong> has purchased the Verified Badge and is awaiting your approval in the admin dashboard. Please review and set their listing to <em>active</em> when ready.</p>`,
                button_label: "Review in Admin Dashboard",
                button_url: `${adminOrigin}/admin`,
                footnote: "This is an automated notification from the GMA Partner Portal.",
              })
            )
          );
        }
      }
      return NextResponse.json({ received: true });
    }

    // Claim checkout: link an existing unclaimed listing to a new auth user.
    if (session.metadata?.mode === "claim") {
      const claimSlug = session.metadata?.slug;
      const claimPendingId = session.metadata?.pending_id;
      if (claimSlug && claimPendingId) {
        const supabase = createServiceClient();

        const { data: pending, error: pendingErr } = await supabase
          .from("pending_registrations")
          .select("*")
          .eq("id", claimPendingId)
          .maybeSingle();

        if (pendingErr || !pending || pending.consumed_at) {
          return NextResponse.json({ received: true });
        }

        const email = pending.email as string;
        const plan = pending.membership_plan as string;
        const billingCycle = pending.membership_billing as string;
        const reg = (pending.registration ?? {}) as Record<string, unknown>;
        const claimName = (reg.name as string) ?? "";
        const claimPassword = (reg.password as string) ?? "";

        let userId: string | null = null;
        let createdUser = false;

        // Attempt to create a new user with the password they chose at checkout.
        const { data: createData, error: createError } = await supabase.auth.admin.createUser({
          email,
          password: claimPassword,
          email_confirm: true,
          user_metadata: { full_name: claimName },
        });

        if (!createError && createData?.user) {
          userId = createData.user.id;
          createdUser = true;
        } else {
          // Email already exists — link the listing to the existing account.
          const recovery = await supabase.auth.admin.generateLink({
            type: "recovery",
            email,
            options: { redirectTo: `${process.env.NEXT_PUBLIC_MAIN_APP_URL || req.nextUrl.origin}/dashboard` },
          });
          if (recovery.error || !recovery.data?.user) {
            console.error("[stripe-webhook] claim: could not resolve user:", createError, recovery.error);
            return NextResponse.json({ error: "Account creation failed" }, { status: 500 });
          }
          userId = recovery.data.user.id;
        }

        if (!userId) {
          return NextResponse.json({ error: "Account creation failed" }, { status: 500 });
        }

        const planFull = billingCycle === "annual" ? `${plan} – Annual` : `${plan} – Monthly`;
        const claimAffiliation = (reg.affiliation as string | undefined) ?? null;

        // Set pending claim — do NOT set user_id yet (admin approves first)
        const { error: updateErr } = await supabase
          .from("service_registrations")
          .update({
            claimed_by: userId,
            claimed_at: new Date().toISOString(),
            claim_status: "pending",
            claim_name: claimName || null,
            claim_email: email,
            claim_affiliation: claimAffiliation,
            claim_plan: planFull,
            claim_billing: billingCycle,
            // Store Stripe fields now so they're ready to activate on approval
            stripe_customer_id: session.customer ?? null,
            stripe_subscription_id: session.subscription ?? null,
          })
          .eq("slug", claimSlug)
          .is("user_id", null);

        if (updateErr) {
          if (createdUser) await supabase.auth.admin.deleteUser(userId);
          console.error("[stripe-webhook] claim: update failed:", updateErr);
          return NextResponse.json({ error: "Claim update failed" }, { status: 500 });
        }

        const origin = process.env.NEXT_PUBLIC_MAIN_APP_URL || req.nextUrl.origin;
        await sendEmail({
          to_email: email,
          to_name: claimName || email,
          greeting: claimName ? `Hi ${claimName},` : "Hi there,",
          button_url: `${origin}/dashboard`,
          subject: "Claim submitted — under review",
          headline: "Your Claim is Under Review",
          message_html: `<p>Your payment was received and your claim for <strong>${claimSlug}</strong> has been submitted for review. Our team will verify your ownership and activate your listing within 1–2 business days.</p><p>You can sign in at any time to check your claim status.</p>`,
          button_label: "Check Claim Status",
          footnote: "If you didn't submit this claim, please contact us immediately.",
        });

        await supabase
          .from("pending_registrations")
          .update({ consumed_at: new Date().toISOString() })
          .eq("id", claimPendingId);
      }
      return NextResponse.json({ received: true });
    }

    if (!pendingId) {
      // Not one of our registration checkouts.
      return NextResponse.json({ received: true });
    }

    const supabase = createServiceClient();

    const { data: pending, error: loadErr } = await supabase
      .from("pending_registrations")
      .select("*")
      .eq("id", pendingId)
      .maybeSingle();

    if (loadErr) {
      console.error("[stripe-webhook] Failed to load pending registration:", loadErr);
      return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
    }
    // Already consumed (Stripe retry/replay) or gone → idempotent no-op.
    if (!pending || pending.consumed_at) {
      return NextResponse.json({ received: true });
    }

    const reg = (pending.registration ?? {}) as Record<string, unknown>;
    const email = pending.email as string;
    const name = (reg.primaryContactName as string) || "";
    const companyName = (reg.companyName as string) || "";
    const origin = process.env.NEXT_PUBLIC_MAIN_APP_URL || req.nextUrl.origin;

    // Create the auth user (no password) and get a set-password link to email ourselves.
    let userId: string | null = null;
    let actionLink = "";
    let createdUser = false;

    const invite = await supabase.auth.admin.generateLink({
      type: "invite",
      email,
      options: { redirectTo: `${origin}/auth/reset-password`, data: { name } },
    });

    if (invite.error) {
      // User likely already exists (a prior partial run) — fall back to a recovery link.
      const recovery = await supabase.auth.admin.generateLink({
        type: "recovery",
        email,
        options: { redirectTo: `${origin}/auth/reset-password` },
      });
      if (recovery.error || !recovery.data?.user) {
        console.error("[stripe-webhook] Could not generate auth link:", invite.error, recovery.error);
        return NextResponse.json({ error: "Account creation failed" }, { status: 500 });
      }
      userId = recovery.data.user.id;
      actionLink = recovery.data.properties?.action_link ?? "";
    } else {
      userId = invite.data.user?.id ?? null;
      actionLink = invite.data.properties?.action_link ?? "";
      createdUser = true;
    }

    if (!userId) {
      return NextResponse.json({ error: "Account creation failed" }, { status: 500 });
    }

    const slug = await buildSlug(supabase, companyName, (pending.membership_plan as string) ?? "");
    const registerAs =
      typeof reg.registerAs === "string" ? (reg.registerAs as string).toLowerCase() : null;

    const { error: insertErr } = await supabase.from("service_registrations").insert({
      slug,
      user_id: userId,
      register_as: registerAs,
      primary_category: reg.primaryCategory ?? null,
      sub_category: reg.subCategory ?? null,
      company_name: companyName || null,
      website_url: reg.websiteUrl ?? null,
      short_description: reg.shortDescription ?? null,
      headquarters_country: reg.headquartersCountry ?? null,
      headquarters_city: reg.headquartersCity ?? null,
      countries_served: reg.countriesServed ?? null,
      delivery_model: reg.deliveryModel ?? null,
      company_size: reg.companySize ?? null,
      certifications: reg.certifications ?? null,
      primary_contact_name: reg.primaryContactName ?? null,
      primary_contact_email: reg.primaryContactEmail ?? null,
      primary_contact_phone: reg.primaryContactPhone ?? null,
      membership_plan: pending.membership_plan,
      membership_billing: pending.membership_billing,
      stripe_customer_id: session.customer ?? null,
      stripe_subscription_id: session.subscription ?? null,
      subscription_status: "active",
      status: "pending",
      current_step: 4,
    });

    if (insertErr) {
      // Roll back the auth user we just created so the buyer can be retried cleanly.
      if (createdUser) await supabase.auth.admin.deleteUser(userId);
      console.error("[stripe-webhook] Failed to insert registration:", insertErr);
      return NextResponse.json({ error: "Registration insert failed" }, { status: 500 });
    }

    // Send the branded set-password email via our own helper (fails soft if EmailJS unconfigured).
    if (actionLink) {
      await sendEmail({
        to_email: email,
        to_name: name || email,
        greeting: name ? `Hi ${name},` : "Hi there,",
        button_url: actionLink,
        ...INVITE_COPY,
      });
    }

    // Mark consumed → idempotent against Stripe retries.
    await supabase
      .from("pending_registrations")
      .update({ consumed_at: new Date().toISOString() })
      .eq("id", pendingId);

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[stripe-webhook] Unhandled error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

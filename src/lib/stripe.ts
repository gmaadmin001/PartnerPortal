const STRIPE_BASE = "https://api.stripe.com/v1";

export function getPriceId(plan: string, billing: "monthly" | "annual"): string {
  const map: Record<string, string | undefined> = {
    "Professional_monthly": process.env.STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID,
    "Professional_annual":  process.env.STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID,
    "Premier_monthly":      process.env.STRIPE_PREMIER_MONTHLY_PRICE_ID,
    "Premier_annual":       process.env.STRIPE_PREMIER_ANNUAL_PRICE_ID,
  };
  const id = map[`${plan}_${billing}`];
  if (!id) throw new Error(`No price ID configured for ${plan} ${billing}`);
  return id;
}

function authHeader(): HeadersInit {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not set");
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };
}

// Encodes including bracket-notation keys without double-encoding the brackets
function formEncode(params: Record<string, string>): string {
  return Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
}

async function stripePost(path: string, params: Record<string, string>) {
  const res = await fetch(`${STRIPE_BASE}${path}`, {
    method: "POST",
    headers: authHeader(),
    body: formEncode(params),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new Error(err.error?.message ?? `Stripe ${res.status}`);
  }
  return res.json();
}

async function stripeGet(path: string) {
  const res = await fetch(`${STRIPE_BASE}${path}`, { headers: authHeader() });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new Error(err.error?.message ?? `Stripe ${res.status}`);
  }
  return res.json();
}

export async function createCustomer(email: string, userId: string) {
  return stripePost("/customers", { email, "metadata[user_id]": userId });
}

export async function createCheckoutSession(params: {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
}) {
  return stripePost("/checkout/sessions", {
    customer: params.customerId,
    "line_items[0][price]": params.priceId,
    "line_items[0][quantity]": "1",
    mode: "subscription",
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    ...Object.fromEntries(
      Object.entries(params.metadata).map(([k, v]) => [`metadata[${k}]`, v]),
    ),
  });
}

export async function updateSubscriptionPrice(subscriptionId: string, newPriceId: string) {
  const sub = (await stripeGet(`/subscriptions/${subscriptionId}`)) as {
    items: { data: Array<{ id: string }> };
  };
  const itemId = sub.items.data[0].id;
  return stripePost(`/subscriptions/${subscriptionId}`, {
    "items[0][id]": itemId,
    "items[0][price]": newPriceId,
    proration_behavior: "create_prorations",
  });
}

export async function cancelSubscriptionAtPeriodEnd(subscriptionId: string) {
  return stripePost(`/subscriptions/${subscriptionId}`, {
    cancel_at_period_end: "true",
  });
}

export async function createPortalSession(customerId: string, returnUrl: string) {
  return stripePost("/billing_portal/sessions", {
    customer: customerId,
    return_url: returnUrl,
  });
}

// Stripe signs webhooks with HMAC-SHA256 over "timestamp.rawBody", hex-encoded
export async function verifyWebhookSignature(
  rawBody: string,
  sigHeader: string,
  secret: string,
): Promise<boolean> {
  const parts = sigHeader.split(",");
  const t = parts.find((p) => p.startsWith("t="))?.slice(2);
  const sigs = parts.filter((p) => p.startsWith("v1=")).map((p) => p.slice(3));
  if (!t || sigs.length === 0) return false;

  const ts = parseInt(t, 10);
  if (isNaN(ts) || Math.abs(Math.floor(Date.now() / 1000) - ts) > 300) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${t}.${rawBody}`),
  );
  const hex = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return sigs.some((sig) => {
    if (sig.length !== hex.length) return false;
    let diff = 0;
    for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ hex.charCodeAt(i);
    return diff === 0;
  });
}

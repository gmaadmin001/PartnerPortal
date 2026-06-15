import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

const EMAIL_COPY: Record<string, {
  subject: string;
  headline: string;
  message_html: string;
  button_label: string;
  footnote: string;
}> = {
  signup: {
    subject: "Verify your email address",
    headline: "Verify Your Email Address",
    message_html: "<p>Thanks for registering with the Global Mobility Adviser Partner Portal. Click the button below to verify your email address and activate your account.</p>",
    button_label: "Verify Email",
    footnote: "If you didn't create an account, you can safely ignore this email.",
  },
  recovery: {
    subject: "Reset your password",
    headline: "Reset Your Password",
    message_html: "<p>We received a request to reset your password. Click the button below to choose a new one. This link expires in 1 hour.</p>",
    button_label: "Reset Password",
    footnote: "If you didn't request a password reset, you can safely ignore this email.",
  },
  magiclink: {
    subject: "Your sign-in link",
    headline: "Your Sign-In Link",
    message_html: "<p>Click the button below to sign in to the Global Mobility Adviser Partner Portal. This link expires in 1 hour.</p>",
    button_label: "Sign In",
    footnote: "If you didn't request this link, you can safely ignore this email.",
  },
  email_change: {
    subject: "Confirm your new email",
    headline: "Confirm Email Change",
    message_html: "<p>You requested to change your email address. Click the button below to confirm your new email address.</p>",
    button_label: "Confirm New Email",
    footnote: "If you didn't request this change, contact support immediately.",
  },
  invite: {
    subject: "You've been invited",
    headline: "You've Been Invited to Partner Portal",
    message_html: "<p>You've been invited to join the Global Mobility Adviser Partner Portal. Click the button below to accept your invitation and set up your account.</p>",
    button_label: "Accept Invitation",
    footnote: "This invitation expires in 7 days.",
  },
};

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function verifyWebhook(
  secret: string,
  webhookId: string,
  webhookTimestamp: string,
  body: string,
  sigHeader: string,
): Promise<boolean> {
  const ts = parseInt(webhookTimestamp, 10);
  if (isNaN(ts) || Math.abs(Math.floor(Date.now() / 1000) - ts) > 300) return false;

  const base64Secret = secret.replace(/^v1,whsec_/, "");
  const keyBytes = Uint8Array.from(atob(base64Secret), c => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    "raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );

  const toSign = `${webhookId}.${webhookTimestamp}.${body}`;
  const sigBytes = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(toSign));
  const computed = btoa(String.fromCharCode(...new Uint8Array(sigBytes)));

  // Header may contain multiple space-separated "v1,<sig>" entries for key rotation
  const sigs = sigHeader.split(" ").map(s => s.replace(/^v1,/, ""));
  return sigs.some(sig => constantTimeEqual(sig, computed));
}

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.SUPABASE_AUTH_HOOK_SECRET;
    if (!secret) {
      console.error("[auth-email-hook] SUPABASE_AUTH_HOOK_SECRET not set");
      return NextResponse.json({ error: "Misconfigured" }, { status: 500 });
    }

    const webhookId = req.headers.get("webhook-id") ?? "";
    const webhookTimestamp = req.headers.get("webhook-timestamp") ?? "";
    const webhookSig = req.headers.get("webhook-signature") ?? "";
    const body = await req.text();

    const valid = await verifyWebhook(secret, webhookId, webhookTimestamp, body, webhookSig);
    if (!valid) {
      console.error("[auth-email-hook] Invalid signature — webhookId:", webhookId, "timestamp:", webhookTimestamp);
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    type HookPayload = {
      user?: { email?: string; user_metadata?: { name?: string } };
      email_data?: {
        token_hash?: string;
        redirect_to?: string;
        email_action_type?: string;
      };
    };

    let payload: HookPayload;
    try {
      payload = JSON.parse(body) as HookPayload;
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const email = payload.user?.email;
    const name = payload.user?.user_metadata?.name ?? "";
    const actionType = payload.email_data?.email_action_type ?? "";
    const tokenHash = payload.email_data?.token_hash ?? "";
    const redirectTo = payload.email_data?.redirect_to ?? "";

    if (!email || !actionType || !tokenHash) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const copy = EMAIL_COPY[actionType];
    if (!copy) {
      return NextResponse.json({ success: true });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const buttonUrl = `${supabaseUrl}/auth/v1/verify?token=${tokenHash}&type=${actionType}${redirectTo ? `&redirect_to=${encodeURIComponent(redirectTo)}` : ""}`;

    await sendEmail({
      to_email: email,
      to_name: name || email,
      greeting: name ? `Hi ${name},` : "Hi there,",
      button_url: buttonUrl,
      ...copy,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[auth-email-hook] Unhandled error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

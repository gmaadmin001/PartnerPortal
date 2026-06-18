"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const PLANS = [
  {
    name: "Basic",
    monthly: 0,
    annual: 0,
    features: [
      "Public directory listing",
      "Contact info visible",
      "Basic profile",
    ],
    note: "No custom URL — listing assigned a random link",
  },
  {
    name: "Professional",
    monthly: 25,
    annual: 250,
    features: [
      "Custom profile URL",
      "Full profile editing",
      "Logo & contact details",
      "Up to 3 service categories",
      "Up to 3 service areas",
    ],
    note: null,
  },
  {
    name: "Premier",
    monthly: 50,
    annual: 500,
    features: [
      "Custom profile URL",
      "Everything in Professional",
      "Unlimited categories & areas",
      "Photo gallery",
      "Preferred search placement",
    ],
    note: null,
  },
];

function passwordScore(pw: string): number {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8)  s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const score = passwordScore(password);
  const label = score <= 1 ? "Weak" : score <= 3 ? "Fair" : "Strong";
  const color = score <= 1 ? "#dc2626" : score <= 3 ? "#f59e0b" : "#16a34a";
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ height: 4, background: "#e5e7eb", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: 4, width: `${(score / 5) * 100}%`, background: color, borderRadius: 99, transition: "width 0.2s, background 0.2s" }} />
      </div>
      <p style={{ fontSize: 11, color, marginTop: 4, fontWeight: 600 }}>{label}</p>
    </div>
  );
}

export default function ClaimPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [company, setCompany] = useState<{ name: string; description: string | null; category: string | null } | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [plan, setPlan] = useState("Professional");
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);
  const [paidEmail, setPaidEmail] = useState("");

  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    if (qs.get("status") === "success") {
      setPaidEmail(qs.get("email") ?? "");
      setPaid(true);
      return;
    }

    const supabase = createClient();
    supabase
      .from("service_registrations")
      .select("company_name, short_description, primary_category, user_id")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data, error }) => {
        setLoading(false);
        if (error || !data) { setLoadErr("Listing not found."); return; }
        if (data.user_id) { setLoadErr("This listing has already been claimed."); return; }
        setCompany({ name: data.company_name ?? slug, description: data.short_description, category: data.primary_category });
      });
  }, [slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setSubmitErr("Please enter your name."); return; }
    if (!email.trim()) { setSubmitErr("Please enter your email address."); return; }
    if (password.length < 8) { setSubmitErr("Password must be at least 8 characters."); return; }
    setSubmitting(true);
    setSubmitErr(null);

    // Basic — no Stripe, create account directly
    if (plan === "Basic") {
      const res = await fetch("/api/claim-basic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password, slug }),
      });
      const json = await res.json() as { success?: boolean; error?: string };
      setSubmitting(false);
      if (!res.ok || !json.success) { setSubmitErr(json.error ?? "Could not claim listing. Please try again."); return; }
      window.location.href = `/claim/${slug}?status=success&email=${encodeURIComponent(email.trim())}`;
      return;
    }

    // Paid plans — Stripe checkout
    const res = await fetch("/api/stripe-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "claim",
        slug,
        name: name.trim(),
        email: email.trim(),
        password,
        membershipPlan: plan,
        membershipBilling: billing,
      }),
    });
    const json = await res.json() as { url?: string; error?: string };
    setSubmitting(false);
    if (!res.ok || !json.url) { setSubmitErr(json.error ?? "Could not start checkout. Please try again."); return; }
    window.location.href = json.url;
  }

  // ── Success screen ─────────────────────────────────────────────────────────
  if (paid) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f3f6fb" }}>
        <div style={{ textAlign: "center", maxWidth: 480, padding: "64px 24px" }}>
          <div style={{ width: 76, height: 76, borderRadius: "50%", background: "linear-gradient(135deg,#1E2E61,#1C66AD)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px", boxShadow: "0 12px 32px rgba(28,102,173,0.35)" }}>
            <svg width="32" height="32" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="dsp" style={{ fontSize: 28, fontWeight: 800, color: "#0a1628", marginBottom: 8 }}>You&apos;re all set!</h2>
          <p style={{ fontSize: 14.5, color: "#6b7280", marginBottom: 8, lineHeight: 1.5 }}>
            Your listing has been claimed and your account is ready.
          </p>
          <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 32, lineHeight: 1.5 }}>
            {paidEmail
              ? <>Sign in with <strong style={{ color: "#374151" }}>{paidEmail}</strong> and the password you just created.</>
              : "Sign in with your email and the password you just created."}
          </p>
          <Link
            href="/login"
            style={{ display: "inline-block", background: "linear-gradient(135deg,#1E2E61,#1C66AD)", color: "#fff", fontWeight: 800, fontSize: 14, padding: "13px 32px", borderRadius: 12, textDecoration: "none", marginBottom: 16 }}
          >
            Sign In to Your Dashboard →
          </Link>
          <br />
          <Link href="/" style={{ fontSize: 13, color: "#9ca3af" }}>Return to main site</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f3f6fb" }}>
        <div style={{ width: 36, height: 36, border: "3px solid #dde3ee", borderTopColor: "#1C66AD", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (loadErr) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f3f6fb" }}>
        <div style={{ textAlign: "center", maxWidth: 400, padding: "48px 24px" }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#dc2626", marginBottom: 16 }}>{loadErr}</p>
          <Link href="/services" style={{ fontSize: 13, color: "#1C66AD" }}>← Browse listings</Link>
        </div>
      </div>
    );
  }

  const selectedPlan = PLANS.find(p => p.name === plan)!;
  const isPaid = plan !== "Basic";

  return (
    <div style={{ minHeight: "100vh", background: "#f3f6fb", padding: "40px 24px" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        {/* Back link */}
        <Link href={`/services/${slug}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "#6b7280", textDecoration: "none", marginBottom: 28 }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to listing
        </Link>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(28,102,173,0.08)", border: "1px solid rgba(28,102,173,0.2)", borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 700, color: "#1C66AD", marginBottom: 14 }}>
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            Claim Your Listing
          </div>
          <h1 className="dsp" style={{ fontSize: 28, fontWeight: 800, color: "#0a1628", marginBottom: 6 }}>{company!.name}</h1>
          {company!.description && <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6 }}>{company!.description}</p>}
          {company!.category && <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 6 }}>{company!.category}</p>}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Account details */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #dde3ee", padding: "24px", marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#5b6a7e", textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: 16 }}>
              Create Your Account
            </p>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#5b6a7e", textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: 6 }}>
                Your Name
              </label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" required className="reg-inp" />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#5b6a7e", textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: 6 }}>
                Business Email
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required className="reg-inp" />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#5b6a7e", textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: 6 }}>
                Password
              </label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" minLength={8} required className="reg-inp" />
              <PasswordStrength password={password} />
              <p style={{ fontSize: 11.5, color: "#9ca3af", marginTop: 6 }}>You&apos;ll use this to sign in to your dashboard.</p>
            </div>
          </div>

          {/* Plan selection */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #dde3ee", padding: "24px", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#5b6a7e", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>Select Plan</span>
              {isPaid && (
                <div style={{ display: "flex", background: "#f3f6fb", borderRadius: 10, padding: 3 }}>
                  {(["monthly", "annual"] as const).map(b => (
                    <button key={b} type="button" onClick={() => setBilling(b)}
                      style={{ padding: "5px 14px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", background: billing === b ? "#fff" : "transparent", color: billing === b ? "#0a1628" : "#9ca3af", boxShadow: billing === b ? "0 1px 4px rgba(0,0,0,0.08)" : "none", transition: "all 0.15s" }}>
                      {b === "annual" ? "Annual (save 17%)" : "Monthly"}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {PLANS.map(p => {
                const selected = plan === p.name;
                const price = p.monthly === 0 ? "Free" : billing === "annual" ? `$${(p.annual / 12).toFixed(2)}` : `$${p.monthly}`;
                return (
                  <button key={p.name} type="button" onClick={() => setPlan(p.name)}
                    style={{ textAlign: "left", padding: "16px", borderRadius: 12, border: selected ? "2px solid #1C66AD" : "1.5px solid #e5e7eb", background: selected ? "#eff6ff" : "#fff", cursor: "pointer", transition: "all 0.15s" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontWeight: 800, fontSize: 13.5, color: "#0a1628" }}>{p.name}</span>
                      {selected && <svg width="14" height="14" fill="#1C66AD" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: p.monthly === 0 ? "#16a34a" : "#1C66AD", marginBottom: 8 }}>
                      {price}
                      {p.monthly > 0 && <span style={{ fontSize: 11, fontWeight: 500, color: "#9ca3af" }}>/mo</span>}
                    </div>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {p.features.map(f => (
                        <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 5, fontSize: 11, color: "#374151", marginBottom: 3 }}>
                          <svg width="10" height="10" fill="none" stroke={p.name === "Basic" ? "#9ca3af" : "#16a34a"} viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1.5 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                    {p.note && (
                      <p style={{ fontSize: 10, color: "#f59e0b", fontWeight: 600, marginTop: 8, lineHeight: 1.4 }}>⚠ {p.note}</p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {submitErr && (
            <p style={{ fontSize: 13, color: "#dc2626", fontWeight: 600, marginBottom: 12, textAlign: "center" }}>{submitErr}</p>
          )}

          <button type="submit" disabled={submitting}
            style={{ width: "100%", padding: "14px", background: submitting ? "#93c5fd" : "linear-gradient(135deg,#1E2E61,#1C66AD)", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: submitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {submitting
              ? (plan === "Basic" ? "Creating account…" : "Redirecting to payment…")
              : plan === "Basic"
                ? "Claim Listing — Free"
                : `Subscribe & Claim — $${billing === "annual" ? selectedPlan.annual + "/yr" : selectedPlan.monthly + "/mo"}`}
          </button>
          <p style={{ textAlign: "center", fontSize: 11.5, color: "#9ca3af", marginTop: 10 }}>
            {plan === "Basic" ? "Free forever. Upgrade anytime from your dashboard." : "Secure checkout via Stripe. Cancel anytime."}
          </p>
        </form>
      </div>
    </div>
  );
}

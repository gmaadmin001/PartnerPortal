"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const PLANS = [
  {
    name: "Professional",
    monthly: 25,
    annual: 250,
    features: ["Full profile editing", "Logo & contact details", "Up to 3 service categories", "Up to 3 service areas"],
  },
  {
    name: "Premier",
    monthly: 50,
    annual: 500,
    features: ["Everything in Professional", "Unlimited categories & areas", "Photo gallery", "Preferred search placement"],
  },
];

export default function ClaimPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [company, setCompany] = useState<{ name: string; description: string | null; category: string | null } | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState("Professional");
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("status") === "success") { setPaid(true); return; }

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
    if (!email.trim()) { setSubmitErr("Please enter your email address."); return; }
    setSubmitting(true);
    setSubmitErr(null);

    const res = await fetch("/api/stripe-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "claim", slug, email: email.trim(), membershipPlan: plan, membershipBilling: billing }),
    });
    const json = await res.json() as { url?: string; error?: string };
    setSubmitting(false);
    if (!res.ok || !json.url) { setSubmitErr(json.error ?? "Could not start checkout. Please try again."); return; }
    window.location.href = json.url;
  }

  if (paid) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f3f6fb" }}>
        <div style={{ textAlign: "center", maxWidth: 460, padding: "64px 24px" }}>
          <div style={{ width: 76, height: 76, borderRadius: "50%", background: "linear-gradient(135deg,#1E2E61,#1C66AD)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px", boxShadow: "0 12px 32px rgba(28,102,173,0.35)" }}>
            <svg width="32" height="32" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="dsp" style={{ fontSize: 28, fontWeight: 800, color: "#0a1628", marginBottom: 8 }}>Payment confirmed!</h2>
          <p style={{ fontSize: 14.5, color: "#6b7280", marginBottom: 8, lineHeight: 1.5 }}>Your claim is being processed.</p>
          <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 32, lineHeight: 1.5 }}>Check your inbox for an email with a link to set your password and access your dashboard.</p>
          <Link href="/" style={{ fontSize: 13, color: "#1C66AD" }}>Return to main site →</Link>
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
  const price = billing === "annual" ? selectedPlan.annual : selectedPlan.monthly * 12;
  const monthly = billing === "annual" ? (selectedPlan.annual / 12).toFixed(2) : selectedPlan.monthly;

  return (
    <div style={{ minHeight: "100vh", background: "#f3f6fb", padding: "40px 24px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
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
          {/* Email */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #dde3ee", padding: "24px", marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#5b6a7e", textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: 8 }}>
              Your Business Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="reg-inp"
            />
            <p style={{ fontSize: 11.5, color: "#9ca3af", marginTop: 6 }}>You'll receive a password setup link at this address.</p>
          </div>

          {/* Plan selection */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #dde3ee", padding: "24px", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#5b6a7e", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>Select Plan</span>
              <div style={{ display: "flex", background: "#f3f6fb", borderRadius: 10, padding: 3 }}>
                {(["monthly", "annual"] as const).map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBilling(b)}
                    style={{ padding: "5px 14px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", background: billing === b ? "#fff" : "transparent", color: billing === b ? "#0a1628" : "#9ca3af", boxShadow: billing === b ? "0 1px 4px rgba(0,0,0,0.08)" : "none", transition: "all 0.15s" }}
                  >
                    {b === "annual" ? "Annual (save 17%)" : "Monthly"}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {PLANS.map(p => {
                const selected = plan === p.name;
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setPlan(p.name)}
                    style={{ textAlign: "left", padding: "18px 20px", borderRadius: 12, border: selected ? "2px solid #1C66AD" : "1.5px solid #e5e7eb", background: selected ? "#eff6ff" : "#fff", cursor: "pointer", transition: "all 0.15s" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontWeight: 800, fontSize: 15, color: "#0a1628" }}>{p.name}</span>
                      {selected && <svg width="16" height="16" fill="#1C66AD" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#1C66AD", marginBottom: 10 }}>
                      ${billing === "annual" ? (p.annual / 12).toFixed(2) : p.monthly}
                      <span style={{ fontSize: 12, fontWeight: 500, color: "#9ca3af" }}>/mo</span>
                    </div>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {p.features.map(f => (
                        <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 11.5, color: "#374151", marginBottom: 4 }}>
                          <svg width="11" height="11" fill="none" stroke="#16a34a" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 2 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>
          </div>

          {submitErr && (
            <p style={{ fontSize: 13, color: "#dc2626", fontWeight: 600, marginBottom: 12, textAlign: "center" }}>{submitErr}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{ width: "100%", padding: "14px", background: submitting ? "#93c5fd" : "linear-gradient(135deg,#1E2E61,#1C66AD)", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: submitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            {submitting ? "Redirecting to payment…" : `Subscribe & Claim — $${billing === "annual" ? price + "/yr" : (selectedPlan.monthly) + "/mo"}`}
          </button>
          <p style={{ textAlign: "center", fontSize: 11.5, color: "#9ca3af", marginTop: 10 }}>Secure checkout via Stripe. Cancel anytime.</p>
        </form>
      </div>
    </div>
  );
}

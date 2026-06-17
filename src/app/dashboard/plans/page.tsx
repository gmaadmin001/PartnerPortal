"use client";

import { useEffect, useState } from "react";
import { useDashboard } from "../layout";
import { createClient } from "@/lib/supabase/client";

const PLAN_RANK: Record<string, number> = { Basic: 0, Professional: 1, Premier: 2 };

const PLANS = [
  {
    id: "Basic",
    features: ["Company name & website", "1 service category", "HQ city listing", "Standard search placement"],
    featLabel: "What's included",
    monthlyPrice: null as number | null,
    yearlyPrice: null as number | null,
  },
  {
    id: "Professional",
    features: ["Company logo & description", "Contact details shown", "Up to 3 service categories", "Up to 3 service areas", "Self-service profile editing"],
    featLabel: "Everything in Basic, plus",
    monthlyPrice: 25,
    yearlyPrice: 250,
    extra: true,
  },
  {
    id: "Premier",
    features: ["Unlimited categories & areas", "Verified Badge — included", "Star ratings & reviews", "Preferred search placement*", "Thought leadership posts", "Media gallery"],
    featLabel: "Everything in Professional, plus",
    monthlyPrice: 50,
    yearlyPrice: 500,
  },
];

const GATED_FEATURES: { label: string; minPlan: "Professional" | "Premier" }[] = [
  { label: "Company bio & description", minPlan: "Professional" },
  { label: "Company logo display", minPlan: "Professional" },
  { label: "Contact details on public profile", minPlan: "Professional" },
  { label: "Up to 3 service categories", minPlan: "Professional" },
  { label: "Up to 3 service areas", minPlan: "Professional" },
  { label: "Self-service profile editing", minPlan: "Professional" },
  { label: "Unlimited categories & areas", minPlan: "Premier" },
  { label: "Verified Badge — included", minPlan: "Premier" },
  { label: "Star ratings & reviews", minPlan: "Premier" },
  { label: "Preferred search placement", minPlan: "Premier" },
  { label: "Thought leadership posts", minPlan: "Premier" },
  { label: "Media gallery (photos)", minPlan: "Premier" },
];

function getLostFeatures(fromPlan: string, toPlan: string) {
  const fromRank = PLAN_RANK[fromPlan] ?? 0;
  const toRank = PLAN_RANK[toPlan] ?? 0;
  return GATED_FEATURES.filter(f => {
    const r = PLAN_RANK[f.minPlan] ?? 0;
    return r > toRank && r <= fromRank;
  });
}

function Toast({ msg, type }: { msg: string; type: "info" | "success" | "error" }) {
  const bg = type === "error" ? "#dc2626" : type === "success" ? "#16a34a" : "#1E2E61";
  return (
    <div style={{ position: "fixed", bottom: 28, right: 28, background: bg, color: "#fff", padding: "12px 22px", borderRadius: 12, fontSize: 14, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", zIndex: 9999 }}>
      {msg}
    </div>
  );
}

export default function PlansPage() {
  const { reg, loading, user } = useDashboard();
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [toast, setToast] = useState<{ msg: string; type: "info" | "success" | "error" } | null>(null);
  const [downgradeTarget, setDowngradeTarget] = useState<typeof PLANS[0] | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [badgeLoading, setBadgeLoading] = useState(false);

  // Detect ?upgraded=1 or ?badge=1 from Stripe Checkout redirects
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("upgraded") === "1") {
      showToast("Plan upgraded successfully!", "success");
      window.history.replaceState({}, "", "/dashboard/plans");
    } else if (params.get("badge") === "1") {
      showToast("Verified Badge purchased! Our team will review and apply it shortly.", "success");
      window.history.replaceState({}, "", "/dashboard/plans");
    }
  }, []);

  function showToast(msg: string, type: "info" | "success" | "error" = "info") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }

  // Upgrade: for existing subscription (paid→paid) the API updates Stripe in-place and returns { success: true }.
  // For Basic→paid the API creates a Checkout session and returns { url }.
  async function handleUpgrade(targetPlan: typeof PLANS[0]) {
    if (!user) return;
    setConfirming(true);
    try {
      const res = await fetch("/api/stripe-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "dashboard_upgrade", plan: targetPlan.id, billing }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "Failed to upgrade. Please try again.", "error");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      // Case A: direct Stripe subscription update — DB already updated by API
      showToast(`Upgraded to ${targetPlan.id} successfully.`, "success");
      setTimeout(() => window.location.reload(), 1400);
    } catch {
      showToast("Unexpected error. Please try again.", "error");
    } finally {
      setConfirming(false);
    }
  }

  async function confirmDowngrade() {
    if (!downgradeTarget || !user) return;
    setConfirming(true);

    try {
      // Downgrade to Basic: cancel recurring subscription; update DB locally for slug + plan.
      if (downgradeTarget.id === "Basic") {
        // Stop the Stripe subscription
        if (reg?.stripe_subscription_id) {
          const cancelRes = await fetch("/api/stripe-cancel", { method: "POST" });
          if (!cancelRes.ok) {
            const d = await cancelRes.json();
            showToast(d.error ?? "Failed to cancel subscription. Please try again.", "error");
            setConfirming(false);
            return;
          }
        }

        // Update the local DB record immediately (plan change, slug housekeeping)
        const supabase = createClient();
        const updateData: Record<string, unknown> = {
          membership_plan: "Basic",
          membership_billing: null,
          subscription_status: reg?.stripe_subscription_id ? "cancelled" : null,
        };
        if (reg?.slug) {
          updateData.premium_slug = reg.slug;
          updateData.slug = "basic-" + user.id.replace(/-/g, "").substring(0, 8);
        }
        const { error } = await supabase
          .from("service_registrations")
          .update(updateData)
          .eq("user_id", user.id);

        setConfirming(false);
        if (error) {
          showToast("Failed to update plan. Please try again.", "error");
        } else {
          showToast("Downgraded to Basic. Your subscription will not renew.", "success");
          setDowngradeTarget(null);
          setTimeout(() => window.location.reload(), 1400);
        }
        return;
      }

      // Downgrade to a lower paid plan (e.g. Premier → Professional): update Stripe subscription in-place.
      const res = await fetch("/api/stripe-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "dashboard_upgrade", plan: downgradeTarget.id, billing }),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error ?? "Failed to change plan. Please try again.", "error");
        setConfirming(false);
        return;
      }
      if (data.url) {
        // Shouldn't happen for an existing subscriber downgrading, but handle gracefully
        window.location.href = data.url;
        return;
      }
      showToast(`Downgraded to ${downgradeTarget.id} successfully.`, "success");
      setDowngradeTarget(null);
      setTimeout(() => window.location.reload(), 1400);
    } catch {
      showToast("Unexpected error. Please try again.", "error");
    } finally {
      setConfirming(false);
    }
  }

  async function openBadgeCheckout() {
    setBadgeLoading(true);
    try {
      const res = await fetch("/api/stripe-badge", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) {
        showToast(data.error ?? "Could not start checkout. Please try again.", "error");
        return;
      }
      window.location.href = data.url;
    } catch {
      showToast("Unexpected error. Please try again.", "error");
    } finally {
      setBadgeLoading(false);
    }
  }

  async function openBillingPortal() {
    try {
      const res = await fetch("/api/stripe-portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) {
        showToast(data.error ?? "Could not open billing portal.", "error");
        return;
      }
      window.location.href = data.url;
    } catch {
      showToast("Unexpected error. Please try again.", "error");
    }
  }

  if (loading) {
    return (
      <div className="dash-content">
        <div className="skel" style={{ height: 200, borderRadius: 14, marginBottom: 20 }} />
      </div>
    );
  }

  const currentPlanName = (reg?.membership_plan || "Basic").split(/\s*[–—]\s*/)[0].trim();
  const currentRank = PLAN_RANK[currentPlanName] ?? 0;
  const currentBilling = (reg?.membership_billing ?? "monthly") as "monthly" | "annual";
  const hasPaidSubscription = !!(reg?.stripe_subscription_id);
  const lostFeatures = downgradeTarget ? getLostFeatures(currentPlanName, downgradeTarget.id) : [];

  return (
    <div className="dash-content">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Downgrade confirmation modal */}
      {downgradeTarget && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          onClick={e => { if (e.target === e.currentTarget) setDowngradeTarget(null); }}
        >
          <div style={{ background: "#fff", borderRadius: 18, padding: "32px 36px", maxWidth: 480, width: "100%", boxShadow: "0 24px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
              <div>
                <p style={{ fontSize: 10.5, fontWeight: 700, color: "#ef4444", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Confirm Downgrade</p>
                <h2 className="dsp" style={{ fontSize: 22, fontWeight: 800, color: "#0a1628" }}>
                  Switch to {downgradeTarget.id}
                </h2>
              </div>
              <button onClick={() => setDowngradeTarget(null)} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "#6b7280", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
            </div>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 24 }}>
              {downgradeTarget.id === "Basic"
                ? "Your subscription will be cancelled and won't renew. You'll keep access until the end of the current billing period."
                : `${downgradeTarget.id} is $${billing === "annual" ? downgradeTarget.yearlyPrice + "/yr" : downgradeTarget.monthlyPrice + "/mo"}. A prorated credit will be applied immediately.`}
            </p>

            {lostFeatures.length > 0 && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "16px 18px", marginBottom: 20 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#b91c1c", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  You will lose these features
                </p>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 9 }}>
                  {lostFeatures.map(f => (
                    <li key={f.label} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, color: "#374151" }}>
                      <span style={{ color: "#ef4444", fontSize: 15, fontWeight: 700, flexShrink: 0 }}>✕</span>
                      <span>{f.label}</span>
                      <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, color: "#6b7280", background: "#f3f4f6", borderRadius: 20, padding: "2px 8px", flexShrink: 0 }}>
                        {f.minPlan === "Premier" ? "PREMIER" : "PROFESSIONAL"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setDowngradeTarget(null)}
                style={{ flex: 1, padding: "11px 0", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDowngrade}
                disabled={confirming}
                style={{ flex: 1, padding: "11px 0", background: confirming ? "#fca5a5" : "#ef4444", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: confirming ? "not-allowed" : "pointer", transition: "background 0.2s" }}
              >
                {confirming ? "Updating…" : "Confirm Downgrade"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 24, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="dsp" style={{ fontSize: 22, fontWeight: 800, color: "#0a1628" }}>Membership Plans</h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 3 }}>Your current plan and available upgrades</p>
        </div>
        {hasPaidSubscription && (
          <button
            onClick={openBillingPortal}
            style={{ padding: "8px 16px", background: "#f3f4f6", color: "#374151", border: "1.5px solid #e5e7eb", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
          >
            Manage Billing →
          </button>
        )}
      </div>

      {/* Current plan banner */}
      {reg && (
        <div style={{ background: "linear-gradient(135deg,#1E2E61,#1C66AD)", borderRadius: 14, padding: "20px 28px", marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ fontSize: 10.5, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Current Plan</p>
            <p className="dsp" style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{currentPlanName}</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 3 }}>
              {reg.membership_billing === "annual" ? "Billed annually" : currentPlanName === "Basic" ? "Free tier" : "Billed monthly"}
            </p>
          </div>
          <span style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 700 }}>Active</span>
        </div>
      )}

      {/* Billing toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28, background: "#fff", border: "1px solid #dde3ee", borderRadius: 12, padding: "12px 18px", maxWidth: 360, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: billing === "monthly" ? "#0a1628" : "#9ca3af" }}>Monthly</span>
        <button
          onClick={() => setBilling(b => b === "monthly" ? "annual" : "monthly")}
          style={{ width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", position: "relative", background: billing === "annual" ? "#1C66AD" : "#d1d5db", flexShrink: 0, transition: "background 0.25s" }}
        >
          <span style={{ position: "absolute", top: 2, left: 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.2)", transition: "transform 0.25s", transform: billing === "annual" ? "translateX(20px)" : "translateX(0)" }} />
        </button>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: billing === "annual" ? "#0a1628" : "#9ca3af" }}>Annual</span>
        {billing === "annual" && <span style={{ fontSize: 10.5, fontWeight: 800, color: "#15803d", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 20, padding: "3px 10px" }}>2 MONTHS FREE</span>}
      </div>

      {/* Plan cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22 }}>
        {PLANS.map(p => {
          const isSamePlan = p.id === currentPlanName;
          const targetRank = PLAN_RANK[p.id] ?? 0;
          // "Current" only when plan name AND billing cycle both match
          const isCurrent = isSamePlan && (p.monthlyPrice === null || billing === currentBilling);
          // Downgrade = lower-rank plan (not same plan; billing switches go through handleUpgrade)
          const isDowngrade = !isCurrent && !isSamePlan && targetRank < currentRank;
          const price = p.monthlyPrice === null ? "Free" : billing === "annual" ? `$${p.yearlyPrice}` : `$${p.monthlyPrice}`;
          const priceSuffix = p.monthlyPrice === null ? "" : billing === "annual" ? "/yr" : "/mo";
          const saving = billing === "annual" && p.monthlyPrice ? `Save $${p.monthlyPrice * 12 - (p.yearlyPrice ?? 0)} vs monthly` : null;

          let btnLabel: string;
          if (isCurrent) btnLabel = "Current Plan";
          else if (isSamePlan && billing === "annual") btnLabel = "Switch to Annual";
          else if (isSamePlan && billing === "monthly") btnLabel = "Switch to Monthly";
          else if (isDowngrade) btnLabel = `Downgrade to ${p.id}`;
          else btnLabel = `Upgrade to ${p.id}`;

          const isBillingSwitch = isSamePlan && !isCurrent;
          let btnBg: string;
          if (isCurrent) btnBg = "#1E2E61";
          else if (isDowngrade) btnBg = "#f3f4f6";
          else if (isBillingSwitch && billing === "monthly") btnBg = "#f3f4f6";
          else if (p.id === "Professional") btnBg = "#1C66AD";
          else btnBg = "#1E2E61";

          const btnColor = isCurrent || (!isDowngrade && !isBillingSwitch) || (isBillingSwitch && billing === "annual") ? "#fff" : "#374151";

          return (
            <div key={p.id} className="crd" style={{
              borderTop: `3px solid ${isCurrent ? "#1E2E61" : isDowngrade ? "#e5e7eb" : "#1C66AD"}`,
              background: isCurrent ? "linear-gradient(180deg,#f0f4ff 0%,#fff 100%)" : "#fff",
              position: "relative",
            }}>
              {isCurrent && (
                <div style={{ position: "absolute", top: 14, right: 14, background: "#1E2E61", color: "#fff", fontSize: 9, fontWeight: 800, padding: "4px 10px", borderRadius: 20, letterSpacing: "0.07em" }}>
                  CURRENT
                </div>
              )}
              <div style={{ textAlign: "center", paddingBottom: 20, borderBottom: "1px solid #f3f4f6", marginBottom: 20 }}>
                <p className="dsp" style={{ fontSize: 15, fontWeight: 700, color: "#0a1628", marginBottom: 10 }}>{p.id}</p>
                <p className="dsp" style={{ fontSize: 36, fontWeight: 300, color: "#0a1628", lineHeight: 1 }}>
                  {price}{priceSuffix && <span style={{ fontSize: 13, fontWeight: 400, color: "#9ca3af" }}>{priceSuffix}</span>}
                </p>
                {saving && <p style={{ fontSize: 12, color: "#15803d", marginTop: 6, fontWeight: 600 }}>{saving}</p>}
              </div>

              <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>{p.featLabel}</p>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {p.features.map(f => (
                  <li key={f} style={{ display: "flex", gap: 10, color: "#374151", fontSize: 13, lineHeight: 1.4 }}>
                    <span style={{ color: "#1C66AD", fontWeight: 900, flexShrink: 0, fontSize: 14 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {"extra" in p && p.extra && (
                reg?.is_verified ? (
                  <div style={{ width: "100%", marginBottom: 12, background: "#fffbeb", border: "1.5px solid #fcd34d", borderRadius: 9, padding: "11px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 15 }}>✦</span>
                    <span style={{ fontWeight: 700, color: "#92400e" }}>Verified Badge Active</span>
                    <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 800, color: "#15803d", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 20, padding: "2px 8px" }}>OWNED</span>
                  </div>
                ) : (
                  <button
                    onClick={e => { e.stopPropagation(); openBadgeCheckout(); }}
                    disabled={badgeLoading}
                    style={{ width: "100%", marginBottom: 12, background: badgeLoading ? "#f3f4f6" : "#f7f9ff", border: "1.5px solid #c7d7ff", borderRadius: 9, padding: "11px 14px", fontSize: 12, color: "#1C66AD", lineHeight: 1.5, cursor: badgeLoading ? "not-allowed" : "pointer", textAlign: "left", transition: "all 0.2s" }}
                    onMouseEnter={e => { if (!badgeLoading) (e.currentTarget.style.background = "#eef3ff"); }}
                    onMouseLeave={e => { (e.currentTarget.style.background = badgeLoading ? "#f3f4f6" : "#f7f9ff"); }}
                  >
                    <span style={{ fontWeight: 700, color: "#0a1628" }}>
                      {badgeLoading ? "Starting checkout…" : "✦ Get Verified Badge"}
                    </span>
                    {!badgeLoading && <span style={{ color: "#1C66AD", fontWeight: 700 }}> — $100 one-time →</span>}
                  </button>
                )
              )}

              <button
                onClick={() => {
                  if (isCurrent) return;
                  if (isDowngrade) {
                    setDowngradeTarget(p);
                  } else {
                    // Upgrade OR same-plan billing switch — both go through stripe-checkout Case A
                    handleUpgrade(p);
                  }
                }}
                disabled={isCurrent || confirming}
                style={{
                  width: "100%", padding: 11, borderRadius: 9, fontSize: 13, fontWeight: 700,
                  cursor: isCurrent ? "default" : confirming ? "not-allowed" : "pointer",
                  border: isDowngrade && !isCurrent ? "1.5px solid #e5e7eb" : "none",
                  transition: "all 0.2s",
                  background: btnBg,
                  color: btnColor,
                  opacity: isCurrent ? 0.9 : confirming && !isCurrent ? 0.7 : 1,
                }}
              >
                {confirming && !isCurrent ? "Working…" : btnLabel}
              </button>
            </div>
          );
        })}
      </div>

      <p style={{ fontSize: 11, color: "#9ca3af", maxWidth: 700, marginTop: 20 }}>
        * Preferred placement applies only as a tiebreaker among equally relevant results.
      </p>
    </div>
  );
}

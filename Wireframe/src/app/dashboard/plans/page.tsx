"use client";

import { useState } from "react";
import { useDashboard } from "../layout";

const PLANS = [
  {
    id: "Basic",
    features: ["Company name & website","1 service category","HQ city listing","Standard search placement"],
    featLabel: "What's included",
    monthlyPrice: null,
    yearlyPrice: null,
  },
  {
    id: "Professional",
    features: ["Company logo & description","Contact details shown","Up to 3 service categories","Up to 3 service areas","Self-service profile editing"],
    featLabel: "Everything in Basic, plus",
    monthlyPrice: 25,
    yearlyPrice: 250,
    popular: true,
    extra: "Verified Badge available — $100 one-time",
  },
  {
    id: "Premier",
    features: ["Unlimited categories & areas","Verified Badge — included","Star ratings & reviews","Preferred search placement*","Thought leadership posts","Media gallery"],
    featLabel: "Everything in Professional, plus",
    monthlyPrice: 50,
    yearlyPrice: 500,
  },
];

function Toast({ msg }: { msg: string }) {
  return (
    <div style={{ position: "fixed", bottom: 28, right: 28, background: "#1E2E61", color: "#fff", padding: "12px 22px", borderRadius: 12, fontSize: 14, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", zIndex: 9999 }}>
      {msg}
    </div>
  );
}

export default function PlansPage() {
  const { reg, loading } = useDashboard();
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [toast, setToast] = useState("");

  function showToast(m: string) { setToast(m); setTimeout(() => setToast(""), 3000); }

  if (loading) {
    return (
      <div className="dash-content">
        <div className="skel" style={{ height: 200, borderRadius: 14, marginBottom: 20 }} />
      </div>
    );
  }

  const currentPlanName = (reg?.membership_plan || "Basic").split(/\s*[–—]\s*/)[0].trim();

  return (
    <div className="dash-content">
      {toast && <Toast msg={toast} />}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 className="dsp" style={{ fontSize: 22, fontWeight: 800, color: "#0a1628" }}>Membership Plans</h1>
        <p style={{ fontSize: 13, color: "#6b7280", marginTop: 3 }}>Your current plan and available upgrades</p>
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
          const isCurrent = p.id === currentPlanName;
          const price = p.monthlyPrice === null ? "Free" : billing === "annual" ? `$${p.yearlyPrice}` : `$${p.monthlyPrice}`;
          const priceSuffix = p.monthlyPrice === null ? "" : billing === "annual" ? "/yr" : "/mo";
          const saving = billing === "annual" && p.monthlyPrice ? `Save $${p.monthlyPrice * 12 - (p.yearlyPrice ?? 0)} vs monthly` : null;

          return (
            <div key={p.id} className="crd" style={{
              borderTop: `3px solid ${isCurrent ? "#1E2E61" : "#dde3ee"}`,
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

              {p.extra && (
                <div style={{ marginBottom: 20, background: "#f7f9ff", borderRadius: 9, padding: "11px 14px", fontSize: 12, color: "#4b5563", lineHeight: 1.5, border: "1px solid #e8edff" }}>
                  <span style={{ fontWeight: 700, color: "#0a1628" }}>Verified Badge</span> available — <span style={{ color: "#1C66AD", fontWeight: 700 }}>$100 one-time</span>
                </div>
              )}

              <button
                onClick={() => isCurrent ? null : showToast(`Switching to ${p.id} — billing management coming soon`)}
                disabled={isCurrent}
                style={{
                  width: "100%", padding: 11, borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: isCurrent ? "default" : "pointer",
                  border: "none", transition: "all 0.2s",
                  background: isCurrent ? "#1E2E61" : p.id === "Basic" ? "#f3f4f6" : p.id === "Professional" ? "#1C66AD" : "#1E2E61",
                  color: isCurrent ? "#fff" : p.id === "Basic" ? "#374151" : "#fff",
                  opacity: isCurrent ? 0.9 : 1,
                }}
              >
                {isCurrent ? "Current Plan" : p.id === "Basic" ? "Downgrade to Basic" : `Upgrade to ${p.id}`}
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

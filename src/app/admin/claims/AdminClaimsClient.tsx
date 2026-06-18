"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Claim } from "./page";

export default function AdminClaimsClient({ claims: initial }: { claims: Claim[] }) {
  const router = useRouter();
  const [claims, setClaims] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }

  async function act(id: string, action: "approve" | "reject") {
    setBusy(id);
    setError(null);
    const res = await fetch(`/api/admin/${action}-claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider_id: id }),
    });
    setBusy(null);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Something went wrong.");
      showToast(j.error ?? "Something went wrong.", "error");
    } else {
      setClaims(c => c.filter(r => r.id !== id));
      showToast(action === "approve" ? "Claim approved — listing activated" : "Claim rejected — user account removed", "success");
      router.refresh();
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f0f2f7", fontFamily: "'Open Sans', Arial, sans-serif" }}>

      {/* Sidebar */}
      <aside style={{ width: 220, background: "linear-gradient(180deg,#0c1428 0%,#1E2E61 100%)", display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ padding: "28px 20px 20px" }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 4 }}>Partner Portal</p>
          <p style={{ fontSize: 15, fontWeight: 800, color: "#fff", margin: 0 }}>Admin Panel</p>
        </div>
        <div style={{ padding: "0 12px", marginBottom: 8 }}>
          <div style={{ height: 1, background: "rgba(255,255,255,0.08)" }} />
        </div>
        <nav style={{ padding: "8px 12px", flex: 1 }}>
          {[
            { label: "Dashboard", href: "/admin", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", active: false },
            { label: "Pending Claims", href: "/admin/claims", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", active: true },
          ].map(item => (
            <a key={item.href} href={item.href}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 9, textDecoration: "none", color: item.active ? "#fff" : "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: 600, marginBottom: 2, background: item.active ? "rgba(255,255,255,0.12)" : "transparent" }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.label}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0, padding: "32px 32px 60px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0a1628", margin: 0 }}>Pending Claims</h1>
            <p style={{ fontSize: 13, color: "#8a96a8", marginTop: 4 }}>
              {claims.length} claim{claims.length !== 1 ? "s" : ""} awaiting review
            </p>
          </div>
          <a href="/admin"
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", background: "#fff", border: "1.5px solid #dde3ee", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#374151", textDecoration: "none" }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </a>
        </div>

        {error && (
          <div style={{ marginBottom: 16, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#dc2626" }}>
            {error}
          </div>
        )}

        {claims.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e8edf5", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", padding: "64px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 42, marginBottom: 14 }}>✅</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0a1628", marginBottom: 6 }}>No pending claims</h3>
            <p style={{ fontSize: 14, color: "#8a96a8" }}>All caught up.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {claims.map(claim => {
              const domainSignal = claim.domain_match === true
                ? { label: "✅ Email domain matches website", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" }
                : claim.domain_match === false
                  ? { label: "⚠️ Email domain mismatch — verify manually", color: "#b45309", bg: "#fffbeb", border: "#fde68a" }
                  : { label: "— Domain could not be determined", color: "#9ca3af", bg: "#f9fafb", border: "#e5e7eb" };

              return (
                <div key={claim.id} style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8edf5", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", padding: "22px 24px" }}>
                  {/* Header row */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: 16, fontWeight: 800, color: "#0a1628", margin: "0 0 4px" }}>
                        {claim.company_name ?? "(Unnamed listing)"}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        {claim.slug && (
                          <a href={`/services/${claim.slug}`} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: 12, color: "#1C66AD", fontWeight: 600, textDecoration: "none" }}>
                            View listing ↗
                          </a>
                        )}
                        {claim.website_url && (
                          <>
                            <span style={{ color: "#d1d5db", fontSize: 12 }}>·</span>
                            <a href={claim.website_url} target="_blank" rel="noopener noreferrer"
                              style={{ fontSize: 12, color: "#6b7280", textDecoration: "none" }}>
                              {claim.website_url.replace(/^https?:\/\//, "")}
                            </a>
                          </>
                        )}
                        {claim.claimed_at && (
                          <>
                            <span style={{ color: "#d1d5db", fontSize: 12 }}>·</span>
                            <span style={{ fontSize: 12, color: "#9ca3af" }}>
                              Submitted {new Date(claim.claimed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <button onClick={() => act(claim.id, "approve")} disabled={busy === claim.id}
                        style={{ padding: "9px 20px", background: busy === claim.id ? "#86efac" : "#16a34a", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: busy === claim.id ? "not-allowed" : "pointer" }}>
                        {busy === claim.id ? "…" : "Approve"}
                      </button>
                      <button onClick={() => act(claim.id, "reject")} disabled={busy === claim.id}
                        style={{ padding: "9px 20px", background: busy === claim.id ? "#fca5a5" : "#dc2626", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: busy === claim.id ? "not-allowed" : "pointer" }}>
                        {busy === claim.id ? "…" : "Reject"}
                      </button>
                    </div>
                  </div>

                  {/* Detail grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 10 }}>
                    <div style={{ background: "#f9fafb", borderRadius: 10, padding: "12px 14px" }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Claimant</p>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#0a1628", margin: "0 0 2px" }}>{claim.claim_name ?? "—"}</p>
                      <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>{claim.claim_email ?? "—"}</p>
                    </div>

                    <div style={{ background: "#f9fafb", borderRadius: 10, padding: "12px 14px" }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Role / Affiliation</p>
                      <p style={{ fontSize: 13, color: "#374151", margin: 0 }}>
                        {claim.claim_affiliation || <span style={{ color: "#9ca3af", fontStyle: "italic" }}>Not provided</span>}
                      </p>
                    </div>

                    <div style={{ background: "#f9fafb", borderRadius: 10, padding: "12px 14px" }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Plan Selected</p>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#1C66AD", margin: 0 }}>{claim.claim_plan ?? "Basic"}</p>
                    </div>

                    <div style={{ background: domainSignal.bg, border: `1px solid ${domainSignal.border}`, borderRadius: 10, padding: "12px 14px" }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Ownership Signal</p>
                      <p style={{ fontSize: 12.5, fontWeight: 700, color: domainSignal.color, margin: 0 }}>{domainSignal.label}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {toast && (
        <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 9999, background: toast.type === "success" ? "#16a34a" : "#dc2626", color: "#fff", padding: "13px 22px", borderRadius: 12, fontSize: 14, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

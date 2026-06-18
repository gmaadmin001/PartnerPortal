"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import type { AdminUser } from "@/lib/admin-auth";
import type { Claim } from "./page";

interface Props {
  admin: AdminUser;
  claims: Claim[];
  counts: { registrations: number; claims: number; badges: number };
}

export default function PendingClaimsClient({ admin, claims: initial, counts }: Props) {
  const router = useRouter();
  const [claims, setClaims] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }

  async function act(id: string, action: "approve" | "reject") {
    setBusy(id);
    const res = await fetch(`/api/admin/${action}-claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider_id: id }),
    });
    setBusy(null);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      showToast(j.error ?? "Something went wrong.", "error");
    } else {
      setClaims(c => c.filter(r => r.id !== id));
      showToast(
        action === "approve" ? "Claim approved — listing activated" : "Claim rejected — user account removed",
        "success"
      );
      router.refresh();
    }
  }

  return (
    <AdminShell role={admin.role} name={admin.name} email={admin.email} activePage="claims" counts={counts}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0a1628", margin: 0 }}>Pending Claims</h1>
          <p style={{ fontSize: 13, color: "#8a96a8", marginTop: 4 }}>
            {claims.length} claim{claims.length !== 1 ? "s" : ""} awaiting review
          </p>
        </div>
      </div>

      {claims.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e8edf5", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", padding: "64px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 14 }}>✓</div>
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

      {toast && (
        <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 9999, background: toast.type === "success" ? "#16a34a" : "#dc2626", color: "#fff", padding: "13px 22px", borderRadius: 12, fontSize: 14, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
          {toast.msg}
        </div>
      )}
    </AdminShell>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import type { AdminUser } from "@/lib/admin-auth";

interface Listing {
  id: string;
  company_name: string | null;
  primary_contact_name: string | null;
  primary_contact_email: string | null;
  slug: string;
  website_url: string | null;
  membership_plan: string | null;
  headquarters_country: string | null;
  headquarters_city: string | null;
  created_at: string;
}

interface Props {
  admin: AdminUser;
  listings: Listing[];
  counts: { registrations: number; claims: number; badges: number };
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function PendingBadgesClient({ admin, listings: initial, counts }: Props) {
  const router = useRouter();
  const [listings, setListings] = useState(initial);
  const [loading, setLoading] = useState<Record<string, "verifying" | "denying">>({});
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }

  async function verify(id: string) {
    setLoading(l => ({ ...l, [id]: "verifying" }));
    try {
      const res = await fetch("/api/admin/verify-badge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider_id: id }),
      });
      if (res.ok) {
        setListings(l => l.filter(r => r.id !== id));
        showToast("Badge verified. Email sent to provider.", "success");
        setTimeout(() => router.refresh(), 1000);
      } else {
        const d = await res.json().catch(() => ({}));
        showToast(d.error ?? "Failed to verify", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
    setLoading(l => { const n = { ...l }; delete n[id]; return n; });
  }

  async function deny(id: string) {
    if (!confirm("Deny this badge purchase? The provider will be notified and a refund should be issued manually.")) return;
    setLoading(l => ({ ...l, [id]: "denying" }));
    try {
      const res = await fetch("/api/admin/deny-badge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider_id: id }),
      });
      if (res.ok) {
        setListings(l => l.filter(r => r.id !== id));
        showToast("Badge denied. Provider notified.", "success");
        setTimeout(() => router.refresh(), 1000);
      } else {
        const d = await res.json().catch(() => ({}));
        showToast(d.error ?? "Failed to deny", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
    setLoading(l => { const n = { ...l }; delete n[id]; return n; });
  }

  return (
    <AdminShell role={admin.role} name={admin.name} email={admin.email} activePage="badges" counts={counts}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0a1628", margin: 0 }}>Pending Badge Verifications</h1>
        <p style={{ fontSize: 13, color: "#8a96a8", marginTop: 4 }}>Providers who purchased a Verified Badge, awaiting manual verification</p>
      </div>

      <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "14px 18px", marginBottom: 24, display: "flex", alignItems: "flex-start", gap: 10 }}>
        <svg width="16" height="16" fill="none" stroke="#d97706" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <p style={{ fontSize: 13, color: "#92400e", margin: 0 }}>
          Verify that the company is legitimate before approving. If you deny a badge, you must manually issue a refund via Stripe.
        </p>
      </div>

      {listings.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 16, padding: "60px 32px", textAlign: "center", border: "1px solid #e8edf5" }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>✓</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: "#0a1628" }}>All clear</p>
          <p style={{ fontSize: 13, color: "#8a96a8" }}>No badge verifications pending.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {listings.map(r => (
            <div key={r.id} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #fde68a", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: "22px 24px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0a1628", margin: 0 }}>{r.company_name ?? "—"}</h2>
                    <span style={{ fontSize: 12, fontWeight: 700, background: "#fef3c7", color: "#92400e", borderRadius: 20, padding: "3px 10px" }}>
                      ✦ Badge Purchased
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "6px 24px" }}>
                    {[
                      { label: "Contact", value: r.primary_contact_name ?? "—" },
                      { label: "Email", value: r.primary_contact_email ?? "—" },
                      { label: "Plan", value: r.membership_plan ?? "—" },
                      { label: "Location", value: [r.headquarters_city, r.headquarters_country].filter(Boolean).join(", ") || "—" },
                      { label: "Website", value: r.website_url ?? "—" },
                      { label: "Purchased", value: fmtDate(r.created_at) },
                    ].map(f => (
                      <div key={f.label}>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#8a96a8" }}>{f.label} </span>
                        <span style={{ fontSize: 13, color: "#374151" }}>{f.value}</span>
                      </div>
                    ))}
                  </div>

                  {r.slug && (
                    <a href={`/services/${r.slug}`} target="_blank" rel="noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 12, fontSize: 12.5, color: "#1C66AD", textDecoration: "none", fontWeight: 600 }}>
                      View listing ↗
                    </a>
                  )}
                </div>

                <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                  <button onClick={() => deny(r.id)} disabled={!!loading[r.id]}
                    style={{ padding: "10px 20px", background: "#fff", border: "1.5px solid #fca5a5", borderRadius: 10, fontSize: 13, fontWeight: 700, color: "#dc2626", cursor: loading[r.id] ? "not-allowed" : "pointer", opacity: loading[r.id] ? 0.6 : 1 }}>
                    {loading[r.id] === "denying" ? "Denying…" : "Deny"}
                  </button>
                  <button onClick={() => verify(r.id)} disabled={!!loading[r.id]}
                    style={{ padding: "10px 24px", background: loading[r.id] ? "#94a3b8" : "linear-gradient(135deg,#b45309,#92400e)", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, color: "#fff", cursor: loading[r.id] ? "not-allowed" : "pointer" }}>
                    {loading[r.id] === "verifying" ? "Verifying…" : "✦ Verify Badge"}
                  </button>
                </div>
              </div>
            </div>
          ))}
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

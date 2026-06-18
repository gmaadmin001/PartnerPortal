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
  register_as: string | null;
  membership_plan: string | null;
  headquarters_country: string | null;
  headquarters_city: string | null;
  website_url: string | null;
  primary_category: string | null;
  short_description: string | null;
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

export default function PendingRegistrationsClient({ admin, listings: initial, counts }: Props) {
  const router = useRouter();
  const [listings, setListings] = useState(initial);
  const [loading, setLoading] = useState<Record<string, "activating" | "rejecting">>({});
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }

  async function activate(id: string) {
    setLoading(l => ({ ...l, [id]: "activating" }));
    try {
      const res = await fetch("/api/admin/activate-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider_id: id }),
      });
      if (res.ok) {
        setListings(l => l.filter(r => r.id !== id));
        showToast("Listing activated. Email sent to provider.", "success");
        setTimeout(() => router.refresh(), 1000);
      } else {
        const d = await res.json().catch(() => ({}));
        showToast(d.error ?? "Failed to activate", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
    setLoading(l => { const n = { ...l }; delete n[id]; return n; });
  }

  async function reject(id: string) {
    if (!confirm("Reject and delete this registration? This will also remove the user account.")) return;
    setLoading(l => ({ ...l, [id]: "rejecting" }));
    try {
      const res = await fetch("/api/admin/reject-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider_id: id }),
      });
      if (res.ok) {
        setListings(l => l.filter(r => r.id !== id));
        showToast("Registration rejected and deleted.", "success");
        setTimeout(() => router.refresh(), 1000);
      } else {
        const d = await res.json().catch(() => ({}));
        showToast(d.error ?? "Failed to reject", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
    setLoading(l => { const n = { ...l }; delete n[id]; return n; });
  }

  return (
    <AdminShell role={admin.role} name={admin.name} email={admin.email} activePage="registrations" counts={counts}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0a1628", margin: 0 }}>Pending Registrations</h1>
        <p style={{ fontSize: 13, color: "#8a96a8", marginTop: 4 }}>New user-created listings waiting to be made active</p>
      </div>

      {listings.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 16, padding: "60px 32px", textAlign: "center", border: "1px solid #e8edf5" }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>✓</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: "#0a1628" }}>All clear</p>
          <p style={{ fontSize: 13, color: "#8a96a8" }}>No pending registrations right now.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {listings.map(r => (
            <div key={r.id} style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8edf5", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: "22px 24px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0a1628", margin: 0 }}>{r.company_name ?? "—"}</h2>
                    {r.register_as && (
                      <span style={{ fontSize: 11, fontWeight: 700, background: "#e0e7ff", color: "#3730a3", borderRadius: 20, padding: "3px 10px", textTransform: "capitalize" }}>
                        {r.register_as}
                      </span>
                    )}
                    {r.membership_plan && (
                      <span style={{ fontSize: 11, fontWeight: 700, background: "#f0fdf4", color: "#15803d", borderRadius: 20, padding: "3px 10px" }}>
                        {r.membership_plan}
                      </span>
                    )}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "6px 24px", marginBottom: 12 }}>
                    {[
                      { label: "Contact", value: r.primary_contact_name ?? "—" },
                      { label: "Email", value: r.primary_contact_email ?? "—" },
                      { label: "Location", value: [r.headquarters_city, r.headquarters_country].filter(Boolean).join(", ") || "—" },
                      { label: "Website", value: r.website_url ?? "—" },
                      { label: "Category", value: r.primary_category ?? "—" },
                      { label: "Submitted", value: fmtDate(r.created_at) },
                    ].map(f => (
                      <div key={f.label}>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#8a96a8" }}>{f.label} </span>
                        <span style={{ fontSize: 13, color: "#374151" }}>{f.value}</span>
                      </div>
                    ))}
                  </div>

                  {r.short_description && (
                    <p style={{ fontSize: 13, color: "#6b7280", margin: 0, lineHeight: 1.5, maxWidth: 700 }}>{r.short_description}</p>
                  )}
                </div>

                <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                  <button onClick={() => reject(r.id)} disabled={!!loading[r.id]}
                    style={{ padding: "10px 20px", background: "#fff", border: "1.5px solid #fca5a5", borderRadius: 10, fontSize: 13, fontWeight: 700, color: "#dc2626", cursor: loading[r.id] ? "not-allowed" : "pointer", opacity: loading[r.id] ? 0.6 : 1 }}>
                    {loading[r.id] === "rejecting" ? "Rejecting…" : "Reject"}
                  </button>
                  <button onClick={() => activate(r.id)} disabled={!!loading[r.id]}
                    style={{ padding: "10px 24px", background: loading[r.id] ? "#94a3b8" : "linear-gradient(135deg,#16a34a,#15803d)", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, color: "#fff", cursor: loading[r.id] ? "not-allowed" : "pointer" }}>
                    {loading[r.id] === "activating" ? "Activating…" : "Activate"}
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

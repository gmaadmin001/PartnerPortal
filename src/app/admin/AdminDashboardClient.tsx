"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { AdminUser } from "@/lib/admin-auth";

interface Registration {
  id: string;
  company_name: string | null;
  register_as: string | null;
  membership_plan: string | null;
  status: string;
  is_verified: boolean;
  created_at: string;
  primary_contact_email: string | null;
  primary_contact_name: string | null;
  primary_category: string | null;
  sub_category: string | null;
  delivery_model: string | null;
  company_size: string | null;
  headquarters_country: string | null;
  headquarters_city: string | null;
  short_description: string | null;
  website_url: string | null;
  slug: string;
  logo_url: string | null;
}

interface Stats {
  total: number;
  newThisWeek: number;
  pendingClaims: number;
  byType: Record<string, number>;
}

interface Props {
  admin: AdminUser;
  registrations: Registration[];
  stats: Stats;
}

const PRIMARY_CATEGORIES = [
  "Mortgage & Finance","Title & Escrow","Home Inspection","Insurance","Real Estate Law",
  "Property Management","Home Warranty","Moving & Relocation","Home Renovation","Landscaping",
  "Interior Design","Photography","Staging","Cleaning","Pest Control","Health, Safety & Security","Other",
];

const TYPE_COLOR: Record<string, string> = {
  supplier: "#1C66AD", realtor: "#7c3aed", consultant: "#16a34a", broker: "#d97706",
};
const PLAN_COLOR: Record<string, string> = {
  Basic: "#6b7280", Professional: "#0891b2", Premier: "#7c3aed",
};
const STATUS_COLOR: Record<string, string> = {
  active: "#16a34a", pending: "#d97706", suspended: "#dc2626",
};

function cap(s: string | null) {
  if (!s) return "—";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function StatCard({ label, value, sub, color }: { label: string; value: number | string; sub?: string; color?: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "22px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", border: "1px solid #e8edf5", flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#8a96a8", marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: 32, fontWeight: 900, color: color ?? "#0a1628", lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: "#8a96a8", marginTop: 6 }}>{sub}</p>}
    </div>
  );
}

function Badge({ value, colorMap }: { value: string | null; colorMap: Record<string, string> }) {
  if (!value) return <span style={{ color: "#9ca3af", fontSize: 12 }}>—</span>;
  const color = colorMap[value] ?? "#6b7280";
  return (
    <span style={{ fontSize: 11.5, fontWeight: 700, color, background: color + "15", border: `1px solid ${color}30`, borderRadius: 20, padding: "3px 10px", textTransform: "capitalize" as const }}>
      {value}
    </span>
  );
}

export default function AdminDashboardClient({ admin, registrations, stats }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<Partial<Registration>>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return registrations.filter(r => {
      if (q && !r.company_name?.toLowerCase().includes(q) && !r.primary_contact_email?.toLowerCase().includes(q)) return false;
      if (typeFilter && r.register_as !== typeFilter) return false;
      if (planFilter && r.membership_plan !== planFilter) return false;
      if (statusFilter && r.status !== statusFilter) return false;
      return true;
    });
  }, [registrations, search, typeFilter, planFilter, statusFilter]);

  function startEdit(r: Registration) {
    setEditingId(r.id);
    setEditFields({
      company_name: r.company_name,
      register_as: r.register_as,
      membership_plan: r.membership_plan,
      status: r.status,
      is_verified: r.is_verified,
      primary_category: r.primary_category,
      sub_category: r.sub_category,
      delivery_model: r.delivery_model,
      company_size: r.company_size,
      headquarters_country: r.headquarters_country,
      headquarters_city: r.headquarters_city,
      primary_contact_name: r.primary_contact_name,
      primary_contact_email: r.primary_contact_email,
      short_description: r.short_description,
      website_url: r.website_url,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditFields({});
  }

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }

  async function saveEdit() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/update-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...editFields }),
      });
      if (res.ok) {
        showToast("Saved successfully", "success");
        setEditingId(null);
        setTimeout(() => router.refresh(), 600);
      } else {
        showToast("Save failed — please try again", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
    setSaving(false);
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  const byTypeEntries = Object.entries(stats.byType).sort((a, b) => b[1] - a[1]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f0f2f7", fontFamily: "'Open Sans', Arial, sans-serif" }}>

      {/* ── Sidebar ── */}
      <aside style={{ width: 220, background: "linear-gradient(180deg,#0c1428 0%,#1E2E61 100%)", display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
        <div style={{ padding: "28px 20px 20px" }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 4 }}>Partner Portal</p>
          <p style={{ fontSize: 15, fontWeight: 800, color: "#fff", margin: 0 }}>Admin Panel</p>
        </div>

        <div style={{ padding: "0 12px", marginBottom: 8 }}>
          <div style={{ height: 1, background: "rgba(255,255,255,0.08)" }} />
        </div>

        <nav style={{ padding: "8px 12px", flex: 1 }}>
          {[
            { label: "Dashboard", href: "/admin", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
            { label: "Pending Claims", href: "/admin/claims", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
          ].map(item => (
            <a key={item.href} href={item.href}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 9, textDecoration: "none", color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: 600, marginBottom: 2, transition: "background 0.15s" }}
              onMouseOver={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
              onMouseOut={e => (e.currentTarget.style.background = "transparent")}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.label}
            </a>
          ))}
        </nav>

        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>{admin.name ?? admin.email}</p>
          <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.3)", marginBottom: 12, letterSpacing: "0.04em", textTransform: "uppercase" }}>{admin.role}</p>
          <button onClick={signOut}
            style={{ width: "100%", padding: "9px 0", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 9, color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, minWidth: 0, padding: "32px 32px 60px" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0a1628", margin: 0 }}>Dashboard</h1>
          <p style={{ fontSize: 13, color: "#8a96a8", marginTop: 4 }}>All registrations and activity across the Partner Portal</p>
        </div>

        {/* Stat cards */}
        <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
          <StatCard label="Total Registrations" value={stats.total} />
          <StatCard label="New This Week" value={stats.newThisWeek} sub="Last 7 days" color="#1C66AD" />
          <StatCard label="Pending Claims" value={stats.pendingClaims} color={stats.pendingClaims > 0 ? "#d97706" : "#0a1628"} />
          <div style={{ background: "#fff", borderRadius: 14, padding: "22px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", border: "1px solid #e8edf5", flex: 1, minWidth: 180 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#8a96a8", marginBottom: 10 }}>By Type</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
              {byTypeEntries.map(([type, count]) => (
                <div key={type} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: TYPE_COLOR[type] ?? "#6b7280", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#0a1628" }}>{count}</span>
                  <span style={{ fontSize: 12, color: "#8a96a8", textTransform: "capitalize" }}>{type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Search + Filters */}
        <div style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", border: "1px solid #e8edf5", marginBottom: 16, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", gap: 10, background: "#f6f8fc", border: "1.5px solid #dde3ee", borderRadius: 10, padding: "9px 14px" }}>
            <svg width="15" height="15" fill="none" stroke="#8a96a8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by company name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ border: "none", background: "none", outline: "none", fontSize: 13.5, color: "#0a1628", width: "100%" }}
            />
          </div>
          {([
            { label: "All Types", key: "typeFilter", setter: setTypeFilter, value: typeFilter, opts: ["supplier","realtor","consultant","broker"] },
            { label: "All Plans", key: "planFilter", setter: setPlanFilter, value: planFilter, opts: ["Basic","Professional","Premier"] },
            { label: "All Statuses", key: "statusFilter", setter: setStatusFilter, value: statusFilter, opts: ["active","pending","suspended"] },
          ] as const).map(f => (
            <select key={f.key} value={f.value} onChange={e => f.setter(e.target.value)}
              style={{ padding: "9px 12px", border: "1.5px solid #dde3ee", borderRadius: 10, fontSize: 13, color: f.value ? "#0a1628" : "#8a96a8", background: "#fff", outline: "none", cursor: "pointer" }}
            >
              <option value="">{f.label}</option>
              {f.opts.map(o => <option key={o} value={o}>{cap(o)}</option>)}
            </select>
          ))}
          <span style={{ fontSize: 12.5, color: "#8a96a8", whiteSpace: "nowrap" }}>
            {filtered.length} of {registrations.length}
          </span>
        </div>

        {/* Table */}
        <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", border: "1px solid #e8edf5", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f6f8fc" }}>
                {["Company", "Type", "Plan", "Status", "Verified", "Registered", ""].map(h => (
                  <th key={h} style={{ padding: "13px 16px", textAlign: "left" as const, fontSize: 11, fontWeight: 700, color: "#8a96a8", letterSpacing: "0.07em", textTransform: "uppercase" as const, borderBottom: "1px solid #e8edf5", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: "48px 16px", textAlign: "center" as const, color: "#8a96a8", fontSize: 14 }}>
                    No registrations match your filters.
                  </td>
                </tr>
              )}
              {filtered.map(r => (
                <>
                  <tr key={r.id}
                    style={{ borderBottom: editingId === r.id ? "none" : "1px solid #f3f4f6", transition: "background 0.1s" }}
                    onMouseOver={e => { if (editingId !== r.id) (e.currentTarget as HTMLTableRowElement).style.background = "#fafbfe"; }}
                    onMouseOut={e => { (e.currentTarget as HTMLTableRowElement).style.background = ""; }}
                  >
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {r.logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={r.logo_url} alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover", flexShrink: 0, border: "1px solid #e5e7eb" }} />
                        ) : (
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#1E2E61", color: "#fff", fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {(r.company_name || "?")[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p style={{ fontSize: 13.5, fontWeight: 700, color: "#0a1628", margin: 0 }}>{r.company_name || "—"}</p>
                          <p style={{ fontSize: 11.5, color: "#8a96a8", margin: 0 }}>{r.primary_contact_email || ""}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px" }}><Badge value={r.register_as} colorMap={TYPE_COLOR} /></td>
                    <td style={{ padding: "14px 16px" }}><Badge value={r.membership_plan} colorMap={PLAN_COLOR} /></td>
                    <td style={{ padding: "14px 16px" }}><Badge value={r.status} colorMap={STATUS_COLOR} /></td>
                    <td style={{ padding: "14px 16px", textAlign: "center" as const }}>
                      {r.is_verified
                        ? <span style={{ fontSize: 14, color: "#16a34a" }}>✓</span>
                        : <span style={{ fontSize: 13, color: "#e5e7eb" }}>—</span>}
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 12.5, color: "#6b7280", whiteSpace: "nowrap" }}>
                      {fmtDate(r.created_at)}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      {editingId === r.id ? (
                        <button onClick={cancelEdit}
                          style={{ padding: "6px 14px", background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#374151", cursor: "pointer" }}>
                          Cancel
                        </button>
                      ) : (
                        <button onClick={() => startEdit(r)}
                          style={{ padding: "6px 14px", background: "#1E2E61", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer" }}>
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* Inline edit panel */}
                  {editingId === r.id && (
                    <tr key={`${r.id}-edit`}>
                      <td colSpan={7} style={{ padding: 0, borderBottom: "1px solid #e8edf5" }}>
                        <div style={{ background: "#f6f8fc", borderTop: "2px solid #1C66AD", padding: "24px 24px 20px" }}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: "#1C66AD", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 18 }}>
                            Editing: {r.company_name}
                          </p>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14, marginBottom: 20 }}>
                            {([
                              { label: "Company Name", key: "company_name", type: "text" },
                              { label: "Contact Name", key: "primary_contact_name", type: "text" },
                              { label: "Contact Email", key: "primary_contact_email", type: "email" },
                              { label: "Website", key: "website_url", type: "url" },
                              { label: "HQ Country", key: "headquarters_country", type: "text" },
                              { label: "HQ City", key: "headquarters_city", type: "text" },
                            ] as const).map(f => (
                              <div key={f.key}>
                                <label style={{ fontSize: 10.5, fontWeight: 700, color: "#5b6a7e", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>
                                  {f.label}
                                </label>
                                <input
                                  type={f.type}
                                  value={(editFields[f.key] as string) ?? ""}
                                  onChange={e => setEditFields(p => ({ ...p, [f.key]: e.target.value }))}
                                  style={{ width: "100%", padding: "9px 11px", border: "1.5px solid #dde3ee", borderRadius: 8, fontSize: 13, color: "#0a1628", background: "#fff", outline: "none", boxSizing: "border-box" }}
                                />
                              </div>
                            ))}

                            {/* Select fields */}
                            {([
                              { label: "Type", key: "register_as", opts: ["supplier","realtor","consultant","broker"] },
                              { label: "Plan", key: "membership_plan", opts: ["Basic","Professional","Premier"] },
                              { label: "Status", key: "status", opts: ["active","pending","suspended"] },
                              { label: "Delivery Model", key: "delivery_model", opts: ["remote","on-site","hybrid","franchise"] },
                              { label: "Company Size", key: "company_size", opts: ["1–10","11–50","51–200","201–500","500+"] },
                              { label: "Primary Category", key: "primary_category", opts: PRIMARY_CATEGORIES },
                            ] as const).map(f => (
                              <div key={f.key}>
                                <label style={{ fontSize: 10.5, fontWeight: 700, color: "#5b6a7e", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>
                                  {f.label}
                                </label>
                                <select
                                  value={(editFields[f.key] as string) ?? ""}
                                  onChange={e => setEditFields(p => ({ ...p, [f.key]: e.target.value }))}
                                  style={{ width: "100%", padding: "9px 11px", border: "1.5px solid #dde3ee", borderRadius: 8, fontSize: 13, color: "#0a1628", background: "#fff", outline: "none", boxSizing: "border-box" }}
                                >
                                  <option value="">— select —</option>
                                  {f.opts.map(o => <option key={o} value={o}>{cap(o)}</option>)}
                                </select>
                              </div>
                            ))}

                            {/* Verified toggle */}
                            <div>
                              <label style={{ fontSize: 10.5, fontWeight: 700, color: "#5b6a7e", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>
                                Verified
                              </label>
                              <button
                                onClick={() => setEditFields(p => ({ ...p, is_verified: !p.is_verified }))}
                                style={{
                                  padding: "9px 18px", borderRadius: 8, border: "1.5px solid", fontSize: 13, fontWeight: 700, cursor: "pointer",
                                  background: editFields.is_verified ? "#f0fdf4" : "#f9fafb",
                                  color: editFields.is_verified ? "#16a34a" : "#6b7280",
                                  borderColor: editFields.is_verified ? "#86efac" : "#dde3ee",
                                }}
                              >
                                {editFields.is_verified ? "✓ Verified" : "Not Verified"}
                              </button>
                            </div>
                          </div>

                          {/* Short description */}
                          <div style={{ marginBottom: 20 }}>
                            <label style={{ fontSize: 10.5, fontWeight: 700, color: "#5b6a7e", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>
                              Short Description
                            </label>
                            <textarea
                              rows={3}
                              value={(editFields.short_description as string) ?? ""}
                              onChange={e => setEditFields(p => ({ ...p, short_description: e.target.value }))}
                              style={{ width: "100%", padding: "9px 11px", border: "1.5px solid #dde3ee", borderRadius: 8, fontSize: 13, color: "#0a1628", background: "#fff", outline: "none", resize: "vertical", boxSizing: "border-box" }}
                            />
                          </div>

                          <div style={{ display: "flex", gap: 10 }}>
                            <button
                              onClick={saveEdit}
                              disabled={saving}
                              style={{ padding: "10px 28px", background: saving ? "#94a3b8" : "linear-gradient(135deg,#1E2E61,#1C66AD)", color: "#fff", border: "none", borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}
                            >
                              {saving ? "Saving…" : "Save Changes"}
                            </button>
                            <button onClick={cancelEdit}
                              style={{ padding: "10px 20px", background: "#fff", border: "1.5px solid #dde3ee", borderRadius: 10, fontSize: 13.5, fontWeight: 600, color: "#374151", cursor: "pointer" }}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 9999,
          background: toast.type === "success" ? "#16a34a" : "#dc2626",
          color: "#fff", padding: "13px 22px", borderRadius: 12,
          fontSize: 14, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

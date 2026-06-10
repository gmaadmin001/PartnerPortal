"use client";

import Link from "next/link";
import { useDashboard } from "./layout";
import { cap, fmtDate } from "@/lib/utils";

const MAIN_APP = process.env.NEXT_PUBLIC_MAIN_APP_URL || "";

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="field-row">
      <span className="field-lbl">{label}</span>
      <span className="field-val">{value}</span>
    </div>
  );
}

function SkeletonBlock({ h = 76, radius = 12 }: { h?: number; radius?: number }) {
  return <div className="skel" style={{ height: h, borderRadius: radius }} />;
}

export default function DashboardOverview() {
  const { reg, loading, noListing, user } = useDashboard();

  if (loading) {
    return (
      <div className="dash-content">
        <SkeletonBlock h={128} radius={16} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, margin: "24px 0" }}>
          {[0,1,2,3].map(i => <SkeletonBlock key={i} h={76} />)}
        </div>
        <div className="grid-2">
          <SkeletonBlock h={260} radius={14} />
          <SkeletonBlock h={260} radius={14} />
        </div>
      </div>
    );
  }

  if (noListing || !reg) {
    return (
      <div className="dash-content">
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3 className="dsp" style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>No listing found</h3>
          <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>You haven&apos;t completed your partner registration yet.</p>
          <Link href="/register">
            <button style={{ padding: "11px 28px", background: "linear-gradient(135deg,#1E2E61,#1C66AD)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(28,102,173,0.3)" }}>
              Complete Registration →
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const plan = reg.membership_plan || "Basic";
  const planName = plan.split(/\s*[–—]\s*/)[0].trim();
  const billing = reg.membership_billing;
  const statusCls = reg.status === "active" ? "badge-green" : reg.status === "pending" ? "badge-amber" : "badge-gray";
  const statusLabel = cap(reg.status || "pending");
  const registerAs = cap(reg.register_as) || "Vendor";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const initial = (reg.company_name ?? "?")[0].toUpperCase();
  const listingHref = reg.slug ? `${MAIN_APP}/services/${reg.slug}` : null;

  return (
    <div className="dash-content">
      {/* Welcome banner */}
      <div className="welcome-banner">
        <div className="banner-dots" />
        <div className="banner-circle1" />
        <div className="banner-circle2" />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <p style={{ fontSize: 10.5, fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Partner Account</p>
                <span className="banner-tag">{statusLabel}</span>
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 4, fontWeight: 500 }}>{greeting}.</p>
              <h1 className="dsp" style={{ fontSize: 27, fontWeight: 800, color: "#fff", lineHeight: 1.2, marginBottom: 12 }}>
                {reg.company_name || "Your Company"}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span className="banner-tag">{registerAs}</span>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>·</span>
                <span className="banner-tag">{reg.primary_category || "Uncategorized"}</span>
              </div>
              {listingHref && (
                <a href={listingHref} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 14, background: "rgba(255,255,255,0.13)", border: "1px solid rgba(255,255,255,0.22)", color: "#fff", padding: "7px 13px", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none", letterSpacing: "0.02em" }}>
                  <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                  View My Listing
                </a>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12, flexShrink: 0 }}>
              <div className="banner-company-initial">{initial}</div>
              <div style={{ textAlign: "right" }}>
                <p className="dsp" style={{ fontSize: 20, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{planName} Plan</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
                  {billing ? (billing === "annual" ? "Billed annually" : "Billed monthly") : "Free tier"}
                </p>
                {reg.created_at && (
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 6 }}>
                    Member since {fmtDate(reg.created_at)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        <div className="stat-card navy">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <p className="stat-label">Plan Tier</p>
            <div style={{ width: 30, height: 30, background: "#eff4ff", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" fill="none" stroke="#1E2E61" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
            </div>
          </div>
          <p className="stat-value">{planName}</p>
        </div>
        <div className="stat-card green">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <p className="stat-label">Status</p>
            <div style={{ width: 30, height: 30, background: "#f0fdf4", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" fill="none" stroke="#16a34a" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
          </div>
          <span className={`badge ${statusCls}`}><span className="badge-dot" />{statusLabel}</span>
        </div>
        <div className="stat-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <p className="stat-label">Listing Type</p>
            <div style={{ width: 30, height: 30, background: "#eff6ff", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" fill="none" stroke="#1C66AD" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            </div>
          </div>
          <p className="stat-value">{registerAs}</p>
        </div>
        <div className="stat-card amber">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <p className="stat-label">Member Since</p>
            <div style={{ width: 30, height: 30, background: "#fffbeb", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" fill="none" stroke="#d97706" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </div>
          </div>
          <p className="stat-value" style={{ fontSize: 13 }}>{reg.created_at ? fmtDate(reg.created_at) : "—"}</p>
        </div>
      </div>

      {/* Content cards */}
      <div className="grid-2" style={{ marginBottom: 20 }}>
        {/* Company Profile card */}
        <div className="crd" style={{ borderTop: "3px solid #1C66AD" }}>
          <div className="crd-title">
            <div className="crd-title-icon" style={{ background: "#eff6ff" }}>
              <svg width="14" height="14" fill="none" stroke="#1C66AD" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            </div>
            Company Profile
          </div>
          <FieldRow label="Company" value={reg.company_name || "—"} />
          <FieldRow label="Category" value={`${reg.primary_category || "—"}${reg.sub_category ? ` › ${reg.sub_category}` : ""}`} />
          <FieldRow label="Website" value={reg.website_url ? <a href={reg.website_url} target="_blank" rel="noopener noreferrer">{reg.website_url}</a> : "—"} />
          <FieldRow label="Description" value={reg.short_description || "—"} />
          <FieldRow label="Delivery Model" value={cap(reg.delivery_model) || "—"} />
          <FieldRow label="Company Size" value={reg.company_size || "—"} />
        </div>

        {/* Contact + Coverage */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="crd" style={{ flex: 1, borderTop: "3px solid #16a34a" }}>
            <div className="crd-title">
              <div className="crd-title-icon" style={{ background: "#f0fdf4" }}>
                <svg width="14" height="14" fill="none" stroke="#16a34a" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              </div>
              Primary Contact
            </div>
            <FieldRow label="Name" value={reg.primary_contact_name || "—"} />
            <FieldRow label="Email" value={reg.primary_contact_email ? <a href={`mailto:${reg.primary_contact_email}`}>{reg.primary_contact_email}</a> : "—"} />
            <FieldRow label="Phone" value={reg.primary_contact_phone || "—"} />
          </div>

          <div className="crd" style={{ flex: 1, borderTop: "3px solid #ea580c" }}>
            <div className="crd-title">
              <div className="crd-title-icon" style={{ background: "#fff7ed" }}>
                <svg width="14" height="14" fill="none" stroke="#ea580c" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              Service Coverage
            </div>
            <FieldRow label="HQ" value={[reg.headquarters_country, reg.headquarters_city].filter(Boolean).join(", ") || "—"} />
            <FieldRow label="Countries Served" value={
              Array.isArray(reg.countries_served) && reg.countries_served.length
                ? <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: 2 }}>
                    {reg.countries_served.map(c => <span key={c} className="country-chip">{c}</span>)}
                  </div>
                : "—"
            } />
          </div>
        </div>
      </div>

      {/* Membership card */}
      <div className="crd" style={{ borderTop: "3px solid #1E2E61" }}>
        <div className="crd-title">
          <div className="crd-title-icon" style={{ background: "#eff4ff" }}>
            <svg width="14" height="14" fill="none" stroke="#1E2E61" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
          </div>
          Membership
        </div>
        {(() => {
          const billingLabel = planName === "Basic" ? "Free" : billing ? cap(billing) : "—";
          const mstats = [
            { label: "Plan", val: <span className="dsp" style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{planName}</span> },
            { label: "Billing Cycle", val: <span className="dsp" style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{billingLabel}</span> },
            { label: "Status", val: <span className={`badge ${statusCls}`}><span className="badge-dot" />{statusLabel}</span> },
          ];
          return (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", border: "1px solid #f3f4f6", borderRadius: 10, overflow: "hidden" }}>
              {mstats.map((s, i) => (
                <div key={s.label} style={{ padding: "18px 22px", borderRight: i < mstats.length - 1 ? "1px solid #f3f4f6" : undefined }}>
                  <p style={{ fontSize: 10.5, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>{s.label}</p>
                  {s.val}
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

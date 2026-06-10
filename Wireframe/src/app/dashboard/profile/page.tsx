"use client";

import { useState } from "react";
import { useDashboard } from "../layout";
import { cap } from "@/lib/utils";

function Toast({ msg }: { msg: string }) {
  return (
    <div style={{ position: "fixed", bottom: 28, right: 28, background: "#1E2E61", color: "#fff", padding: "12px 22px", borderRadius: 12, fontSize: 14, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", zIndex: 9999, animation: "fadeSlide 0.3s ease" }}>
      {msg}
    </div>
  );
}

function SkelCard() {
  return <div className="skel" style={{ height: 200, borderRadius: 14, marginBottom: 20 }} />;
}

export default function ProfilePage() {
  const { reg, loading, noListing } = useDashboard();
  const [toast, setToast] = useState("");

  function showToast(m: string) {
    setToast(m);
    setTimeout(() => setToast(""), 3000);
  }

  if (loading) return (
    <div className="dash-content">
      <SkelCard /><SkelCard /><SkelCard />
    </div>
  );

  if (noListing || !reg) return (
    <div className="dash-content">
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <h3 className="dsp" style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>No listing found</h3>
        <p style={{ fontSize: 14, color: "#6b7280" }}>Register to create your partner listing.</p>
      </div>
    </div>
  );

  const Section = ({ title, color, bg, icon, children }: { title: string; color: string; bg: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <div className="crd" style={{ borderTop: `3px solid ${color}`, marginBottom: 20 }}>
      <div className="crd-title">
        <div className="crd-title-icon" style={{ background: bg }}>{icon}</div>
        {title}
      </div>
      {children}
    </div>
  );

  const FR = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="field-row">
      <span className="field-lbl">{label}</span>
      <span className="field-val">{value}</span>
    </div>
  );

  return (
    <div className="dash-content">
      {toast && <Toast msg={toast} />}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 className="dsp" style={{ fontSize: 22, fontWeight: 800, color: "#0a1628" }}>Company Profile</h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 3 }}>Your directory listing information</p>
        </div>
        <button
          onClick={() => showToast("Profile editing coming soon")}
          style={{ padding: "9px 20px", background: "linear-gradient(135deg,#1E2E61,#1C66AD)", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          Edit Profile
        </button>
      </div>

      {/* Business Identity */}
      <Section title="Business Identity" color="#1C66AD" bg="#eff6ff"
        icon={<svg width="14" height="14" fill="none" stroke="#1C66AD" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>}>
        <FR label="Company Name" value={reg.company_name || "—"} />
        <FR label="Listing Type" value={cap(reg.register_as) || "—"} />
        <FR label="Website" value={reg.website_url ? <a href={reg.website_url} target="_blank" rel="noopener noreferrer">{reg.website_url}</a> : "—"} />
        <FR label="Description" value={reg.short_description || "—"} />
        <FR label="Company Size" value={reg.company_size || "—"} />
        <FR label="Delivery Model" value={cap(reg.delivery_model) || "—"} />
        <FR label="Certifications" value={reg.certifications || "—"} />
      </Section>

      {/* Contact Details */}
      <Section title="Contact Details" color="#16a34a" bg="#f0fdf4"
        icon={<svg width="14" height="14" fill="none" stroke="#16a34a" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>}>
        <FR label="Contact Name" value={reg.primary_contact_name || "—"} />
        <FR label="Contact Email" value={reg.primary_contact_email ? <a href={`mailto:${reg.primary_contact_email}`}>{reg.primary_contact_email}</a> : "—"} />
        <FR label="Contact Phone" value={reg.primary_contact_phone || "—"} />
      </Section>

      {/* Service Classification */}
      <Section title="Service Classification" color="#7c3aed" bg="#f5f3ff"
        icon={<svg width="14" height="14" fill="none" stroke="#7c3aed" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"/></svg>}>
        <FR label="Primary Category" value={reg.primary_category || "—"} />
        <FR label="Sub-Category" value={reg.sub_category || "—"} />
      </Section>

      {/* Geographic Coverage */}
      <Section title="Geographic Coverage" color="#ea580c" bg="#fff7ed"
        icon={<svg width="14" height="14" fill="none" stroke="#ea580c" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}>
        <FR label="Headquarters" value={[reg.headquarters_country, reg.headquarters_city].filter(Boolean).join(", ") || "—"} />
        <FR label="Countries Served" value={
          Array.isArray(reg.countries_served) && reg.countries_served.length
            ? <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: 2 }}>
                {reg.countries_served.map(c => <span key={c} className="country-chip">{c}</span>)}
              </div>
            : "—"
        } />
        {Array.isArray(reg.states_served) && reg.states_served.length > 0 && (
          <FR label="States Served" value={
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: 2 }}>
              {reg.states_served.map(s => <span key={s} className="country-chip">{s}</span>)}
            </div>
          } />
        )}
      </Section>
    </div>
  );
}

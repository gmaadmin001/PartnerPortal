"use client";

import { useState, useRef, useEffect } from "react";
import { useDashboard } from "../layout";
import { cap } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

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
  const { reg, loading, noListing, user } = useDashboard();
  const [toast, setToast] = useState("");

  // Photo gallery state
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);
  const [galleryNewUrl, setGalleryNewUrl] = useState("");
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [galleryUploadErr, setGalleryUploadErr] = useState<string | null>(null);
  const [gallerySaving, setGallerySaving] = useState(false);
  const [gallerySaved, setGallerySaved] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (reg) setGalleryPhotos((reg.photos ?? []) as unknown as string[]);
  }, [reg]);

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

  async function handleGalleryFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setGalleryUploadErr(null);
    setGalleryUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/gallery/${crypto.randomUUID()}.${ext}`;
    const supabase = createClient();
    const { error: upErr } = await supabase.storage.from("logos").upload(path, file, { upsert: true });
    setGalleryUploading(false);
    if (upErr) { setGalleryUploadErr(upErr.message); return; }
    const { data } = supabase.storage.from("logos").getPublicUrl(path);
    setGalleryPhotos(p => [...p, data.publicUrl]);
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  }

  function addGalleryUrl() {
    const url = galleryNewUrl.trim();
    if (!url) return;
    setGalleryPhotos(p => [...p, url]);
    setGalleryNewUrl("");
  }

  async function saveGallery() {
    if (!user) return;
    setGallerySaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("service_registrations")
      .update({ photos: galleryPhotos })
      .eq("user_id", user.id);
    setGallerySaving(false);
    if (!error) {
      setGallerySaved(true);
      showToast("Photos saved!");
      setTimeout(() => setGallerySaved(false), 2500);
    } else {
      showToast("Failed to save photos.");
    }
  }

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

      {/* Photo Gallery */}
      <Section title="Photo Gallery" color="#7c3aed" bg="#f5f3ff"
        icon={<svg width="14" height="14" fill="none" stroke="#7c3aed" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>}>
        {!(reg.membership_plan || "").includes("Premier") ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "#9ca3af" }}>
            <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ margin: "0 auto 10px", display: "block", opacity: 0.4 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 4 }}>Premier Plan required</p>
            <p style={{ fontSize: 12 }}>Upgrade to Premier to add a photo gallery to your profile.</p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 14 }}>
              Photos appear in the carousel on your public listing. Upload from your PC or paste a URL, then click Save.
            </p>

            {/* Existing photos grid */}
            {galleryPhotos.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
                {galleryPhotos.map((url, idx) => (
                  <div key={idx} style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "1px solid #e5e7eb", aspectRatio: "16/9", background: "#f9fafb" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Photo ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button
                      onClick={() => setGalleryPhotos(p => p.filter((_, i) => i !== idx))}
                      style={{ position: "absolute", top: 5, right: 5, width: 22, height: 22, borderRadius: "50%", background: "#ef4444", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}
                      aria-label="Remove"
                    >✕</button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload from PC */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <button
                onClick={() => galleryInputRef.current?.click()}
                disabled={galleryUploading}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", background: "#1C66AD", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: galleryUploading ? "not-allowed" : "pointer", opacity: galleryUploading ? 0.6 : 1, transition: "opacity 0.2s" }}
              >
                {galleryUploading ? (
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite" }}><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"/><path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                ) : (
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                )}
                {galleryUploading ? "Uploading…" : "Upload Photo"}
              </button>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>JPEG, PNG, WebP · max 2 MB</span>
              <input ref={galleryInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: "none" }} onChange={handleGalleryFile} />
            </div>
            {galleryUploadErr && <p style={{ fontSize: 12, color: "#ef4444", marginBottom: 10 }}>{galleryUploadErr}</p>}

            {/* URL paste */}
            <p style={{ fontSize: 10.5, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Or paste a URL</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input
                type="text"
                value={galleryNewUrl}
                onChange={e => setGalleryNewUrl(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addGalleryUrl())}
                placeholder="https://example.com/photo.jpg"
                style={{ flex: 1, padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none" }}
              />
              <button
                onClick={addGalleryUrl}
                disabled={!galleryNewUrl.trim()}
                style={{ padding: "8px 16px", background: "#1E2E61", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: galleryNewUrl.trim() ? "pointer" : "not-allowed", opacity: galleryNewUrl.trim() ? 1 : 0.4 }}
              >Add</button>
            </div>

            {/* Save */}
            <button
              onClick={saveGallery}
              disabled={gallerySaving || gallerySaved}
              style={{ padding: "9px 22px", background: gallerySaved ? "#16a34a" : "#1E2E61", color: "#fff", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: gallerySaving || gallerySaved ? "not-allowed" : "pointer", opacity: gallerySaving ? 0.6 : 1, transition: "all 0.2s" }}
            >
              {gallerySaved ? "✓ Saved!" : gallerySaving ? "Saving…" : "Save Photos"}
            </button>
          </>
        )}
      </Section>
    </div>
  );
}

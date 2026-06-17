"use client";

import { useState, useRef, useEffect } from "react";
import { useDashboard } from "../layout";
import { cap } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

// ── Helpers ───────────────────────────────────────────────────────────────────

function Toast({ msg, type = "info" }: { msg: string; type?: "info" | "success" | "error" }) {
  const bg = type === "error" ? "#dc2626" : type === "success" ? "#16a34a" : "#1E2E61";
  return (
    <div style={{ position: "fixed", bottom: 28, right: 28, background: bg, color: "#fff", padding: "12px 22px", borderRadius: 12, fontSize: 14, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", zIndex: 9999 }}>
      {msg}
    </div>
  );
}

function SkelCard() {
  return <div className="skel" style={{ height: 200, borderRadius: 14, marginBottom: 20 }} />;
}

function Lbl({ children }: { children: React.ReactNode }) {
  return <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#5b6a7e", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" as const }}>{children}</label>;
}

function Inp({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="reg-inp"
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="reg-inp"
      style={{ resize: "vertical" }}
    />
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className="reg-inp">
      <option value="">— Select —</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function TagInput({ tags, setTags, placeholder }: { tags: string[]; setTags: (t: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState("");
  function add() {
    const v = input.trim();
    if (v && !tags.includes(v)) setTags([...tags, v]);
    setInput("");
  }
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
        {tags.map(t => (
          <span key={t} className="chip">
            {t}
            <button onClick={() => setTags(tags.filter(x => x !== t))} aria-label={`Remove ${t}`}>×</button>
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder ?? "Type and press Enter"}
          className="reg-inp"
          style={{ flex: 1 }}
        />
        <button
          type="button"
          onClick={add}
          disabled={!input.trim()}
          style={{ padding: "0 16px", background: "#1E2E61", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: input.trim() ? "pointer" : "not-allowed", opacity: input.trim() ? 1 : 0.4 }}
        >Add</button>
      </div>
    </div>
  );
}

// ── View helpers ──────────────────────────────────────────────────────────────

function Section({ title, color, bg, icon, children }: { title: string; color: string; bg: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="crd" style={{ borderTop: `3px solid ${color}`, marginBottom: 20 }}>
      <div className="crd-title">
        <div className="crd-title-icon" style={{ background: bg }}>{icon}</div>
        {title}
      </div>
      {children}
    </div>
  );
}

function FR({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="field-row">
      <span className="field-lbl">{label}</span>
      <span className="field-val">{value}</span>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const BuildingIcon = <svg width="14" height="14" fill="none" stroke="#1C66AD" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>;
const PersonIcon = <svg width="14" height="14" fill="none" stroke="#16a34a" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>;
const TagIcon = <svg width="14" height="14" fill="none" stroke="#7c3aed" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"/></svg>;
const GlobeIcon = <svg width="14" height="14" fill="none" stroke="#ea580c" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const PhotoIcon = <svg width="14" height="14" fill="none" stroke="#7c3aed" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>;

const COMPANY_SIZES = ["1–10", "11–50", "51–200", "201–500", "500+"].map(v => ({ value: v, label: v }));
const DELIVERY_MODELS = ["Remote", "On-site", "Hybrid", "Franchise"].map(v => ({ value: v.toLowerCase(), label: v }));

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { reg, loading, noListing, user } = useDashboard();

  const [toast, setToast] = useState<{ msg: string; type: "info" | "success" | "error" } | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [form, setForm] = useState({
    company_name: "", website_url: "", short_description: "", company_bio: "",
    company_size: "", delivery_model: "", certifications: "",
    primary_contact_name: "", primary_contact_email: "", primary_contact_phone: "",
    primary_category: "", sub_category: "",
    headquarters_country: "", headquarters_city: "",
    countries_served: [] as string[], states_served: [] as string[],
    logo_url: "",
  });

  // Logo upload
  const [logoUploading, setLogoUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Gallery state
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

  function showToast(msg: string, type: "info" | "success" | "error" = "info") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function startEdit() {
    if (!reg) return;
    setForm({
      company_name: reg.company_name ?? "",
      website_url: reg.website_url ?? "",
      short_description: reg.short_description ?? "",
      company_bio: reg.company_bio ?? "",
      company_size: reg.company_size ?? "",
      delivery_model: reg.delivery_model ?? "",
      certifications: reg.certifications ?? "",
      primary_contact_name: reg.primary_contact_name ?? "",
      primary_contact_email: reg.primary_contact_email ?? "",
      primary_contact_phone: reg.primary_contact_phone ?? "",
      primary_category: reg.primary_category ?? "",
      sub_category: reg.sub_category ?? "",
      headquarters_country: reg.headquarters_country ?? "",
      headquarters_city: reg.headquarters_city ?? "",
      countries_served: (reg.countries_served as string[]) ?? [],
      states_served: (reg.states_served as string[]) ?? [],
      logo_url: reg.logo_url ?? "",
    });
    setEditing(true);
  }

  function cancelEdit() { setEditing(false); }

  function setField<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setLogoUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/logo.${ext}`;
    const supabase = createClient();
    const { error } = await supabase.storage.from("logos").upload(path, file, { upsert: true });
    setLogoUploading(false);
    if (error) { showToast("Logo upload failed: " + error.message, "error"); return; }
    const { data } = supabase.storage.from("logos").getPublicUrl(path);
    setField("logo_url", data.publicUrl + `?t=${Date.now()}`);
    if (logoInputRef.current) logoInputRef.current.value = "";
  }

  async function saveProfile() {
    if (!user) return;
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { error?: string };
      showToast(body.error ?? "Save failed", "error");
      return;
    }
    showToast("Profile saved!", "success");
    setEditing(false);
    setTimeout(() => window.location.reload(), 800);
  }

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
    const { error } = await supabase.from("service_registrations").update({ photos: galleryPhotos }).eq("user_id", user.id);
    setGallerySaving(false);
    if (!error) { setGallerySaved(true); showToast("Photos saved!", "success"); setTimeout(() => setGallerySaved(false), 2500); }
    else showToast("Failed to save photos.", "error");
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) return <div className="dash-content"><SkelCard /><SkelCard /><SkelCard /></div>;

  if (noListing || !reg) return (
    <div className="dash-content">
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <h3 className="dsp" style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>No listing found</h3>
        <p style={{ fontSize: 14, color: "#6b7280" }}>Register to create your partner listing.</p>
      </div>
    </div>
  );

  const isPremier = (reg.membership_plan || "").includes("Premier");

  return (
    <div className="dash-content">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 className="dsp" style={{ fontSize: 22, fontWeight: 800, color: "#0a1628" }}>Company Profile</h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 3 }}>
            {editing ? "Editing your directory listing" : "Your directory listing information"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {editing ? (
            <>
              <button
                onClick={cancelEdit}
                style={{ padding: "9px 20px", background: "#f3f4f6", color: "#374151", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={saveProfile}
                disabled={saving}
                style={{ padding: "9px 22px", background: saving ? "#93c5fd" : "linear-gradient(135deg,#1E2E61,#1C66AD)", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 7 }}
              >
                {saving ? (
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite" }}><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"/><path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                ) : (
                  <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                )}
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </>
          ) : (
            <button
              onClick={startEdit}
              style={{ padding: "9px 20px", background: "linear-gradient(135deg,#1E2E61,#1C66AD)", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* ══════════ EDIT MODE ══════════ */}
      {editing ? (
        <>
          {/* Business Identity */}
          <Section title="Business Identity" color="#1C66AD" bg="#eff6ff" icon={BuildingIcon}>
            {/* Logo upload */}
            <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid #f3f4f6" }}>
              <Lbl>Profile Picture / Logo</Lbl>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 72, height: 72, borderRadius: 14, overflow: "hidden", border: "2px solid #dde3ee", background: "#f9fafb", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {form.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.logo_url} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span className="dsp" style={{ fontSize: 26, fontWeight: 800, color: "#9ca3af" }}>
                      {(form.company_name || reg.company_name || "?")[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <button
                    onClick={() => logoInputRef.current?.click()}
                    disabled={logoUploading}
                    style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", background: "#1C66AD", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: logoUploading ? "not-allowed" : "pointer", opacity: logoUploading ? 0.6 : 1, marginBottom: 6 }}
                  >
                    <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                    {logoUploading ? "Uploading…" : "Upload Logo"}
                  </button>
                  <p style={{ fontSize: 11, color: "#9ca3af" }}>JPEG, PNG, WebP · Recommended 400×400px</p>
                  <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={handleLogoUpload} />
                </div>
                {form.logo_url && (
                  <button onClick={() => setField("logo_url", "")} style={{ background: "none", border: "none", color: "#ef4444", fontSize: 12, fontWeight: 600, cursor: "pointer", marginLeft: "auto" }}>Remove</button>
                )}
              </div>
            </div>

            <div className="reg-g2" style={{ marginBottom: 16 }}>
              <div><Lbl>Company Name</Lbl><Inp value={form.company_name} onChange={v => setField("company_name", v)} placeholder="Your company name" /></div>
              <div><Lbl>Website URL</Lbl><Inp value={form.website_url} onChange={v => setField("website_url", v)} placeholder="https://example.com" /></div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Lbl>Short Description</Lbl>
              <Textarea value={form.short_description} onChange={v => setField("short_description", v)} placeholder="One-line company statement shown on your listing…" rows={2} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <Lbl>Company Bio</Lbl>
              <Textarea value={form.company_bio} onChange={v => setField("company_bio", v)} placeholder="Full company description (shown for Professional and Premier plans)…" rows={4} />
            </div>
            <div className="reg-g2" style={{ marginBottom: 16 }}>
              <div><Lbl>Company Size</Lbl><Select value={form.company_size} onChange={v => setField("company_size", v)} options={COMPANY_SIZES} /></div>
              <div><Lbl>Delivery Model</Lbl><Select value={form.delivery_model} onChange={v => setField("delivery_model", v)} options={DELIVERY_MODELS} /></div>
            </div>
            <div>
              <Lbl>Certifications</Lbl>
              <Inp value={form.certifications} onChange={v => setField("certifications", v)} placeholder="e.g. ISO 9001, GDPR Compliant" />
            </div>
          </Section>

          {/* Contact Details */}
          <Section title="Contact Details" color="#16a34a" bg="#f0fdf4" icon={PersonIcon}>
            <div className="reg-g2" style={{ marginBottom: 16 }}>
              <div><Lbl>Contact Name</Lbl><Inp value={form.primary_contact_name} onChange={v => setField("primary_contact_name", v)} placeholder="Full name" /></div>
              <div><Lbl>Contact Email</Lbl><Inp value={form.primary_contact_email} onChange={v => setField("primary_contact_email", v)} placeholder="contact@example.com" type="email" /></div>
            </div>
            <div>
              <Lbl>Contact Phone</Lbl>
              <Inp value={form.primary_contact_phone} onChange={v => setField("primary_contact_phone", v)} placeholder="+1 555 000 0000" />
            </div>
          </Section>

          {/* Service Classification */}
          <Section title="Service Classification" color="#7c3aed" bg="#f5f3ff" icon={TagIcon}>
            <div className="reg-g2">
              <div><Lbl>Primary Category</Lbl><Inp value={form.primary_category} onChange={v => setField("primary_category", v)} placeholder="e.g. Relocation Services" /></div>
              <div><Lbl>Sub-Category</Lbl><Inp value={form.sub_category} onChange={v => setField("sub_category", v)} placeholder="e.g. Corporate Relocation" /></div>
            </div>
          </Section>

          {/* Geographic Coverage */}
          <Section title="Geographic Coverage" color="#ea580c" bg="#fff7ed" icon={GlobeIcon}>
            <div className="reg-g2" style={{ marginBottom: 16 }}>
              <div><Lbl>HQ Country</Lbl><Inp value={form.headquarters_country} onChange={v => setField("headquarters_country", v)} placeholder="United States" /></div>
              <div><Lbl>HQ City</Lbl><Inp value={form.headquarters_city} onChange={v => setField("headquarters_city", v)} placeholder="New York" /></div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Lbl>Countries Served</Lbl>
              <TagInput tags={form.countries_served} setTags={t => setField("countries_served", t)} placeholder="Type a country and press Enter" />
            </div>
            <div>
              <Lbl>States / Provinces Served</Lbl>
              <TagInput tags={form.states_served} setTags={t => setField("states_served", t)} placeholder="Type a state/province and press Enter" />
            </div>
          </Section>
        </>
      ) : (
        /* ══════════ VIEW MODE ══════════ */
        <>
          <Section title="Business Identity" color="#1C66AD" bg="#eff6ff" icon={BuildingIcon}>
            {/* Logo preview in view mode */}
            {reg.logo_url && (
              <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 12 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={reg.logo_url} alt="Logo" style={{ width: 56, height: 56, borderRadius: 12, objectFit: "cover", border: "1px solid #dde3ee" }} />
                <span style={{ fontSize: 12, color: "#9ca3af" }}>Profile Picture</span>
              </div>
            )}
            <FR label="Company Name" value={reg.company_name || "—"} />
            <FR label="Listing Type" value={cap(reg.register_as) || "—"} />
            <FR label="Website" value={reg.website_url ? <a href={reg.website_url} target="_blank" rel="noopener noreferrer">{reg.website_url}</a> : "—"} />
            <FR label="Description" value={reg.short_description || "—"} />
            <FR label="Company Size" value={reg.company_size || "—"} />
            <FR label="Delivery Model" value={cap(reg.delivery_model) || "—"} />
            <FR label="Certifications" value={reg.certifications || "—"} />
          </Section>

          <Section title="Contact Details" color="#16a34a" bg="#f0fdf4" icon={PersonIcon}>
            <FR label="Contact Name" value={reg.primary_contact_name || "—"} />
            <FR label="Contact Email" value={reg.primary_contact_email ? <a href={`mailto:${reg.primary_contact_email}`}>{reg.primary_contact_email}</a> : "—"} />
            <FR label="Contact Phone" value={reg.primary_contact_phone || "—"} />
          </Section>

          <Section title="Service Classification" color="#7c3aed" bg="#f5f3ff" icon={TagIcon}>
            <FR label="Primary Category" value={reg.primary_category || "—"} />
            <FR label="Sub-Category" value={reg.sub_category || "—"} />
          </Section>

          <Section title="Geographic Coverage" color="#ea580c" bg="#fff7ed" icon={GlobeIcon}>
            <FR label="Headquarters" value={[reg.headquarters_country, reg.headquarters_city].filter(Boolean).join(", ") || "—"} />
            <FR label="Countries Served" value={
              Array.isArray(reg.countries_served) && reg.countries_served.length
                ? <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: 4 }}>
                    {reg.countries_served.map(c => <span key={c} className="country-chip">{c}</span>)}
                  </div>
                : "—"
            } />
            {Array.isArray(reg.states_served) && reg.states_served.length > 0 && (
              <FR label="States Served" value={
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: 4 }}>
                  {reg.states_served.map(s => <span key={s} className="country-chip">{s}</span>)}
                </div>
              } />
            )}
          </Section>
        </>
      )}

      {/* ── Photo Gallery (always shown, independent of edit mode) ── */}
      <Section title="Photo Gallery" color="#7c3aed" bg="#f5f3ff" icon={PhotoIcon}>
        {!isPremier ? (
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

            {galleryPhotos.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
                {galleryPhotos.map((url, i) => (
                  <div key={i} style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "1px solid #e5e7eb", aspectRatio: "16/9", background: "#f9fafb" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Photo ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button
                      onClick={() => setGalleryPhotos(p => p.filter((_, j) => j !== i))}
                      style={{ position: "absolute", top: 5, right: 5, width: 22, height: 22, borderRadius: "50%", background: "#ef4444", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}
                      aria-label="Remove"
                    >✕</button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <button
                onClick={() => galleryInputRef.current?.click()}
                disabled={galleryUploading}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", background: "#1C66AD", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: galleryUploading ? "not-allowed" : "pointer", opacity: galleryUploading ? 0.6 : 1 }}
              >
                {galleryUploading
                  ? <svg width="14" height="14" fill="none" viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite" }}><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"/><path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  : <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                }
                {galleryUploading ? "Uploading…" : "Upload Photo"}
              </button>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>JPEG, PNG, WebP · max 2 MB</span>
              <input ref={galleryInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: "none" }} onChange={handleGalleryFile} />
            </div>
            {galleryUploadErr && <p style={{ fontSize: 12, color: "#ef4444", marginBottom: 10 }}>{galleryUploadErr}</p>}

            <p style={{ fontSize: 10.5, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Or paste a URL</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input type="text" value={galleryNewUrl} onChange={e => setGalleryNewUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addGalleryUrl())} placeholder="https://example.com/photo.jpg" style={{ flex: 1, padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none" }} />
              <button onClick={addGalleryUrl} disabled={!galleryNewUrl.trim()} style={{ padding: "8px 16px", background: "#1E2E61", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: galleryNewUrl.trim() ? "pointer" : "not-allowed", opacity: galleryNewUrl.trim() ? 1 : 0.4 }}>Add</button>
            </div>

            <button onClick={saveGallery} disabled={gallerySaving || gallerySaved} style={{ padding: "9px 22px", background: gallerySaved ? "#16a34a" : "#1E2E61", color: "#fff", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: gallerySaving || gallerySaved ? "not-allowed" : "pointer", opacity: gallerySaving ? 0.6 : 1, transition: "all 0.2s" }}>
              {gallerySaved ? "✓ Saved!" : gallerySaving ? "Saving…" : "Save Photos"}
            </button>
          </>
        )}
      </Section>
    </div>
  );
}

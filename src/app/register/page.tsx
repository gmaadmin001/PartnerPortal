"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { COUNTRIES } from "@/data/countries";

const MAIN_APP = process.env.NEXT_PUBLIC_MAIN_APP_URL || "";

const STEPS = [
  { label: "Service Type", desc: "Select your listing category" },
  { label: "Company Details", desc: "Business & contact info" },
  { label: "Membership", desc: "Choose your plan" },
  { label: "Create Account", desc: "Set your password" },
];

const CATEGORIES = [
  "Getting Established at the Destination",
  "Health, Safety & Security",
  "Housing & Accommodation",
  "Immigration & Work Authorization",
  "Moving Belongings",
  "Program Management & Outsourcing",
  "Strategy, Policy & Advisory",
  "Supporting Employees & Families",
  "Tax, Payroll & Compensation",
  "Technology & Data",
];

const SUBCATS: Record<string, string[]> = {
  "Getting Established at the Destination": [
    "Destination Services Providers (DSPs)",
    "School Search & Education Consultants",
  ],
  "Health, Safety & Security": [
    "International Health Insurance",
    "Travel Health & Medical Services",
    "Travel Risk & Security Services",
  ],
  "Housing & Accommodation": [
    "Corporate Housing / Temporary Accommodations",
    "Furniture & Appliance Rental",
    "Home Sale Program Administrators",
    "Property Management Services",
    "Real Estate Brokers & Agents",
    "Title, Appraisal & Closing Services",
  ],
  "Immigration & Work Authorization": [
    "Corporate Immigration Service Providers",
    "Document & Credential Services",
    "Immigration Law Firms",
  ],
  "Moving Belongings": [
    "Freight Forwarders",
    "Household Goods Movers",
    "Pet Relocation Specialists",
    "Vehicle Transport Specialists",
  ],
  "Program Management & Outsourcing": [
    "Lump Sum / Flex Program Administrators",
    "Move Coordination Specialists",
    "Relocation Management Companies (RMCs)",
  ],
  "Strategy, Policy & Advisory": [
    "Benchmarking & Data Service",
    "Mobility Consulting Firms",
  ],
  "Supporting Employees & Families": [
    "Executive Coaching",
    "Intercultural & Cross-Cultural Training",
    "Language Training Providers",
    "Mental Health & Wellbeing Services",
    "Spouse & Partner Career Services",
  ],
  "Tax, Payroll & Compensation": [
    "Compensation & Benefits Consulting",
    "Employer of Record / PEO Services",
    "Expatriate Tax Services",
    "Global Payroll Providers",
  ],
  "Technology & Data": [
    "Compliance & Tracking Tools",
    "Cost of Living & Hardship Data",
    "Expense Management Software",
    "Immigration Technology",
    "Mobility Management Platforms",
    "Tax Technology Platforms",
  ],
};


const PW_RULES = [
  (pw: string) => pw.length >= 8,
  (pw: string) => /[A-Z]/.test(pw),
  (pw: string) => /[a-z]/.test(pw),
  (pw: string) => /[0-9]/.test(pw),
  (pw: string) => /[^a-zA-Z0-9]/.test(pw),
];
const PW_REQ_LABELS = ["At least 8 characters","Uppercase letter","Lowercase letter","Number","Special character"];
const BAR_COLORS = ["#ef4444","#f97316","#eab308","#22c55e","#16a34a"];

export default function RegisterPage() {
  const supabase = createClient();

  // Step state
  const [step, setStep] = useState(1);

  // Step 1
  const [regType, setRegType] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");

  // Step 2
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [hqCountry, setHqCountry] = useState("");
  const [hqCity, setHqCity] = useState("");
  const [delivery, setDelivery] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [certifications, setCertifications] = useState("");
  const [countries, setCountries] = useState<string[]>([]);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // Step 3
  const [plan, setPlan] = useState("");
  const [billing, setBilling] = useState<"monthly"|"annual">("monthly");

  // Step 4
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [pwMet, setPwMet] = useState<boolean[]>([false,false,false,false,false]);
  const [showRegPw, setShowRegPw] = useState(false);

  // Errors / status
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [submitErr, setSubmitErr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successDetail, setSuccessDetail] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Detect return from Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    if (status === "success") {
      setPaymentSuccess(true);
    } else if (status === "cancelled") {
      setSubmitErr("Payment was cancelled. You can try again below.");
      setStep(3);
    }
  }, []);

  function clearErr(k: string) { setErrs(e => { const n = {...e}; delete n[k]; return n; }); }

  function checkPw(val: string) {
    setPwMet(PW_RULES.map(r => r(val)));
  }

  function pwScore() { return pwMet.filter(Boolean).length; }

  function validate1() {
    const e: Record<string, string> = {};
    if (!regType) e.type = "Please select Vendor or Realtor.";
    if (!category) e.category = "Please select a category.";
    if (Object.keys(e).length) { setErrs(e); return false; }
    return true;
  }
  function validate2() {
    const e: Record<string, string> = {};
    if (!companyName.trim()) e.companyName = "Company name is required.";
    if (!contactName.trim()) e.contactName = "Contact name required.";
    if (!contactEmail.trim() || !/\S+@\S+\.\S+/.test(contactEmail)) e.contactEmail = "Valid email required.";
    if (Object.keys(e).length) { setErrs(e); return false; }
    return true;
  }
  function validate3() {
    if (!plan) { setErrs({ plan: "Please select a plan." }); return false; }
    return true;
  }

  function goTo(n: number) { setStep(n); window.scrollTo(0, 0); }
  function next(n: number) {
    if (n === 1 && !validate1()) return;
    if (n === 2 && !validate2()) return;
    if (n === 3 && !validate3()) return;
    goTo(n + 1);
  }

  // For paid plans: redirect to Stripe at Step 3 without creating a password
  async function handlePaidCheckout() {
    if (!validate3()) return;
    setSubmitErr("");
    setSubmitting(true);
    try {
      const res = await fetch(`${MAIN_APP}/api/stripe-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: contactEmail,
          membershipPlan: plan,
          membershipBilling: billing,
          registration: {
            registerAs: regType,
            primaryCategory: category,
            subCategory: subCategory || null,
            companyName,
            websiteUrl: website || null,
            shortDescription: description || null,
            headquartersCountry: hqCountry || null,
            headquartersCity: hqCity || null,
            countriesServed: countries.length ? countries : null,
            deliveryModel: delivery || null,
            companySize: companySize || null,
            certifications: certifications || null,
            primaryContactName: contactName,
            primaryContactEmail: contactEmail,
            primaryContactPhone: contactPhone || null,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitErr(data.error ?? "Payment setup failed. Please try again.");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setSubmitErr("Payment setup failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const membershipPlan = plan === "Basic" ? "Basic"
    : billing === "annual" ? `${plan} – Annual` : `${plan} – Monthly`;

  // For Basic plan: send email+password to finish-registration, then sign in
  async function doSubmit() {
    const e: Record<string, string> = {};
    if (!contactEmail || !/\S+@\S+\.\S+/.test(contactEmail)) e.email = "A valid contact email is required in step 2.";
    if (pwScore() < 5) e.pw = "Password must meet all 5 requirements.";
    if (pw !== pw2) e.pw2 = "Passwords do not match.";
    if (Object.keys(e).length) { setErrs(e); return; }

    setErrs({});
    setSubmitErr("");
    setSubmitting(true);

    try {
      const res = await fetch(`${MAIN_APP}/api/finish-registration`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: contactEmail,
          password: pw,
          registerAs: regType,
          primaryCategory: category,
          subCategory: subCategory || null,
          companyName,
          websiteUrl: website || null,
          shortDescription: description || null,
          headquartersCountry: hqCountry || null,
          headquartersCity: hqCity || null,
          countriesServed: countries.length ? countries : null,
          deliveryModel: delivery || null,
          companySize: companySize || null,
          certifications: certifications || null,
          primaryContactName: contactName,
          primaryContactEmail: contactEmail,
          primaryContactPhone: contactPhone || null,
          membershipPlan,
          membershipBilling: null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitErr(data.error ?? "Registration failed. Please try again.");
        return;
      }

      // Auto sign-in so they can go straight to the dashboard
      await supabase.auth.signInWithPassword({ email: contactEmail, password: pw });

      setSuccessDetail(`${companyName} is registered on the ${membershipPlan} plan.`);
      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed. Please try again.";
      setSubmitErr(msg);
    } finally {
      setSubmitting(false);
    }
  }

  // Payment-success screen (paid plan returned from Stripe)
  if (paymentSuccess) {
    return (
      <div className="reg-page" style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ textAlign: "center", maxWidth: 460, padding: "64px 20px" }}>
          <div style={{ width: 76, height: 76, borderRadius: "50%", background: "linear-gradient(135deg,#1E2E61,#1C66AD)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px", boxShadow: "0 12px 32px rgba(28,102,173,0.35)" }}>
            <svg width="32" height="32" fill="none" stroke="white" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="dsp" style={{ fontSize: 28, fontWeight: 800, color: "#0a1628", marginBottom: 8 }}>Payment confirmed!</h2>
          <p style={{ fontSize: 14.5, color: "#6b7280", marginBottom: 8, lineHeight: 1.5 }}>Your GMA Partner listing is being set up.</p>
          <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 32, lineHeight: 1.5 }}>Check your inbox for an email with a link to set your password and access your dashboard.</p>
          <Link href="/">
            <span style={{ fontSize: 13, color: "#1C66AD", cursor: "pointer" }}>Return to main site →</span>
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="reg-page" style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ textAlign: "center", maxWidth: 460, padding: "64px 20px" }}>
          <div style={{ width: 76, height: 76, borderRadius: "50%", background: "linear-gradient(135deg,#1E2E61,#1C66AD)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px", boxShadow: "0 12px 32px rgba(28,102,173,0.35)" }}>
            <svg width="32" height="32" fill="none" stroke="white" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="dsp" style={{ fontSize: 28, fontWeight: 800, color: "#0a1628", marginBottom: 8 }}>You&apos;re listed!</h2>
          <p style={{ fontSize: 14.5, color: "#6b7280", marginBottom: 8, lineHeight: 1.5 }}>Your GMA Partner profile has been submitted successfully.</p>
          <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 32 }}>{successDetail}</p>
          <Link href="/dashboard">
            <button className="reg-btn reg-btn-primary" style={{ width: "100%", padding: "13px 26px" }}>Go to Dashboard →</button>
          </Link>
          <p style={{ fontSize: 11.5, color: "#9ca3af", marginTop: 14 }}>Your listing will be reviewed within 1–2 business days.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reg-page">
      {/* Sidebar */}
      <aside className="reg-sidebar">
        <div className="reg-sb-head">
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#1C66AD,#43B4E3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span className="dsp" style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>G</span>
          </div>
          <div style={{ minWidth: 0 }}>
            <p className="dsp" style={{ color: "#fff", fontWeight: 800, fontSize: 12.5, lineHeight: 1.15 }}>Global Mobility</p>
            <p className="dsp" style={{ color: "#fff", fontWeight: 800, fontSize: 12.5, lineHeight: 1.15 }}>Adviser</p>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 9.5, marginTop: 2 }}>Partner Portal</p>
          </div>
        </div>
        <div className="reg-sb-body">
          <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>Registration</p>
          <div className="reg-steps">
            {STEPS.map((s, i) => {
              const n = i + 1;
              const done = n < step, active = n === step;
              const cls = done ? "done" : active ? "active" : "upcoming";
              const tc = active ? "#43B4E3" : done ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.3)";
              return (
                <div className="step-row" key={n}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1 }}>
                    <div className={`step-dot ${cls}`}>
                      {done ? (
                        <svg width="12" height="12" fill="none" stroke="white" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : n}
                    </div>
                  </div>
                  <div className="step-meta">
                    <p className="step-title" style={{ color: tc }}>{s.label}</p>
                    <p className="step-desc">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="reg-sb-foot">
          <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.3)", marginBottom: 5 }}>Already have an account?</p>
          <Link href="/login" style={{ fontSize: 13, fontWeight: 700, color: "#43B4E3", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
            Sign in
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="reg-main">
        <div className="step-wrap">

          {/* Step 1: Type */}
          <div className={`step-panel${step === 1 ? " active" : ""}`}>
            <p className="dsp" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 26, fontWeight: 800, color: "#0a1628", lineHeight: 1.15, marginBottom: 5 }}>What type of listing?</p>
            <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 32, lineHeight: 1.5 }}>Tell us how you serve the global mobility market</p>

            <div className="type-grid">
              {[
                { id: "Vendor", icon: "🏢", color: "linear-gradient(135deg,#1E2E61,#1C66AD)", desc: "Service provider in the relocation ecosystem — moving, immigration, housing, finance, and more." },
                { id: "Realtor", icon: "🏡", color: "linear-gradient(135deg,#065f46,#059669)", desc: "Real estate agent or broker helping clients buy, sell, or rent a home in a new location." },
              ].map(t => (
                <div key={t.id} className={`type-card${regType === t.id ? " selected" : ""}`} onClick={() => { setRegType(t.id); clearErr("type"); }}>
                  <div className="type-card-top" style={{ background: t.color }}>
                    <div style={{ position: "absolute", width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.06)", top: -30, right: -20 }} />
                    <div style={{ position: "absolute", width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.05)", bottom: -10, left: 10 }} />
                    <span className="tc-icon">{t.icon}</span>
                    <div className="type-selected-ring">
                      <svg width="12" height="12" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                  </div>
                  <div className="type-card-body">
                    <p className="type-card-title">{t.id}</p>
                    <p className="type-card-desc">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            {errs.type && <p style={{ fontSize: 11.5, color: "#dc2626", marginBottom: 20, marginTop: 8 }}>{errs.type}</p>}

            <div className="reg-g2" style={{ marginBottom: 32 }}>
              <div>
                <label className="reg-lbl">Primary Category <span style={{ color: "#dc2626", fontWeight: 400, textTransform: "none" }}>*</span></label>
                <select className="reg-inp" value={category} onChange={e => { setCategory(e.target.value); setSubCategory(""); clearErr("category"); }}>
                  <option value="">Select category…</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                {errs.category && <p style={{ fontSize: 11.5, color: "#dc2626", marginTop: 5 }}>{errs.category}</p>}
              </div>
              <div>
                <label className="reg-lbl">Sub-Category <span style={{ fontWeight: 400, color: "#9ca3af", textTransform: "none", fontSize: 11 }}>(optional)</span></label>
                <select className="reg-inp" value={subCategory} onChange={e => setSubCategory(e.target.value)} disabled={!category}>
                  <option value="">{category ? "None / not applicable" : "Select a category first"}</option>
                  {(SUBCATS[category] || []).map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <button className="reg-btn reg-btn-primary" onClick={() => next(1)}>Continue →</button>

            <div style={{ marginTop: 44, paddingTop: 40, borderTop: "1px solid #dde3ee" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 18 }}>Why join the GMA network?</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
                {[{ n: "190+", l: "Partner listings", s: "across the network" }, { n: "50+", l: "Countries covered", s: "global service reach" }, { n: "Free", l: "to get started", s: "no credit card needed", c: "#059669" }].map(item => (
                  <div key={item.n} style={{ background: "#fff", border: "1px solid #dde3ee", borderRadius: 12, padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                    <p className="dsp" style={{ fontSize: 22, fontWeight: 800, color: item.c || "#1C66AD", lineHeight: 1 }}>{item.n}</p>
                    <p style={{ fontSize: 12, color: "#374151", fontWeight: 600, marginTop: 4 }}>{item.l}</p>
                    <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{item.s}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Step 2: Company Details */}
          <div className={`step-panel${step === 2 ? " active" : ""}`}>
            <p className="dsp" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 26, fontWeight: 800, color: "#0a1628", lineHeight: 1.15, marginBottom: 5 }}>Company Details</p>
            <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 32, lineHeight: 1.5 }}>This information will appear on your directory listing</p>

            <div className="scrd">
              <p className="scrd-label">
                <span className="scrd-label-icon" style={{ background: "#eff6ff" }}><svg width="13" height="13" fill="none" stroke="#1C66AD" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg></span>
                Business Information
              </p>
              <div className="reg-g2" style={{ marginBottom: 14 }}>
                <div>
                  <label className="reg-lbl">Company Name <span style={{ color: "#dc2626" }}>*</span></label>
                  <input className="reg-inp" type="text" placeholder="Acme Relocation Services" value={companyName} onChange={e => { setCompanyName(e.target.value); clearErr("companyName"); }} />
                  {errs.companyName && <p style={{ fontSize: 11.5, color: "#dc2626", marginTop: 5 }}>{errs.companyName}</p>}
                </div>
                <div>
                  <label className="reg-lbl">Website URL</label>
                  <input className="reg-inp" type="url" placeholder="https://yourcompany.com" value={website} onChange={e => setWebsite(e.target.value)} />
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label className="reg-lbl">Short Description</label>
                <textarea className="reg-inp" placeholder="One or two sentences about your company…" value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <div className="reg-g3">
                <div>
                  <label className="reg-lbl">Delivery Model</label>
                  <select className="reg-inp" value={delivery} onChange={e => setDelivery(e.target.value)}>
                    <option value="">Select…</option>
                    {["Direct","Aggregator","Mixed","Franchise","Unknown"].map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="reg-lbl">Company Size</label>
                  <select className="reg-inp" value={companySize} onChange={e => setCompanySize(e.target.value)}>
                    <option value="">Select…</option>
                    {["1–50","51–500","500+"].map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="reg-lbl">Certifications</label>
                  <input className="reg-inp" type="text" placeholder="FIDI, ISO 9001…" value={certifications} onChange={e => setCertifications(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="scrd">
              <p className="scrd-label">
                <span className="scrd-label-icon" style={{ background: "#fff7ed" }}><svg width="13" height="13" fill="none" stroke="#ea580c" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
                Headquarters & Service Coverage
              </p>
              <div className="reg-g2" style={{ marginBottom: 14 }}>
                <div>
                  <label className="reg-lbl">HQ Country</label>
                  <select className="reg-inp" value={hqCountry} onChange={e => setHqCountry(e.target.value)}>
                    <option value="">Select country…</option>
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="reg-lbl">HQ City</label>
                  <input className="reg-inp" type="text" placeholder="New York" value={hqCity} onChange={e => setHqCity(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="reg-lbl">Countries Served <span style={{ fontWeight: 400, color: "#9ca3af", textTransform: "none", fontSize: 11 }}>(select to add)</span></label>
                <select className="reg-inp" onChange={e => { const v = e.target.value; if (v && !countries.includes(v)) setCountries(c => [...c, v]); e.target.value = ""; }}>
                  <option value="">Add a country…</option>
                  {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                </select>
                {countries.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                    {countries.map((c, i) => (
                      <div key={c} className="chip">
                        {c}
                        <button onClick={() => setCountries(cs => cs.filter((_, j) => j !== i))} tabIndex={-1}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="scrd">
              <p className="scrd-label">
                <span className="scrd-label-icon" style={{ background: "#f0fdf4" }}><svg width="13" height="13" fill="none" stroke="#16a34a" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></span>
                Primary Contact
              </p>
              <div className="reg-g3">
                <div>
                  <label className="reg-lbl">Name <span style={{ color: "#dc2626" }}>*</span></label>
                  <input className="reg-inp" type="text" placeholder="Jane Smith" value={contactName} onChange={e => { setContactName(e.target.value); clearErr("contactName"); }} />
                  {errs.contactName && <p style={{ fontSize: 11.5, color: "#dc2626", marginTop: 5 }}>{errs.contactName}</p>}
                </div>
                <div>
                  <label className="reg-lbl">Email <span style={{ color: "#dc2626" }}>*</span></label>
                  <input className="reg-inp" type="email" placeholder="jane@company.com" value={contactEmail} onChange={e => { setContactEmail(e.target.value); clearErr("contactEmail"); }} />
                  {errs.contactEmail && <p style={{ fontSize: 11.5, color: "#dc2626", marginTop: 5 }}>{errs.contactEmail}</p>}
                </div>
                <div>
                  <label className="reg-lbl">Phone</label>
                  <input className="reg-inp" type="tel" placeholder="+1 (555) 000-0000" value={contactPhone} onChange={e => setContactPhone(e.target.value)} />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button className="reg-btn reg-btn-ghost" onClick={() => goTo(1)}>← Back</button>
              <button className="reg-btn reg-btn-primary" onClick={() => next(2)}>Continue →</button>
            </div>
          </div>

          {/* Step 3: Plan */}
          <div className={`step-panel${step === 3 ? " active" : ""}`}>
            <p className="dsp" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 26, fontWeight: 800, color: "#0a1628", lineHeight: 1.15, marginBottom: 5 }}>Choose Your Plan</p>
            <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 32, lineHeight: 1.5 }}>Start free, upgrade anytime — no setup fees or contracts</p>

            {/* Billing toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, background: "#fff", border: "1px solid #dde3ee", borderRadius: 12, padding: "12px 18px", maxWidth: 360, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
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
            {errs.plan && <p style={{ fontSize: 11.5, color: "#dc2626", marginBottom: 14 }}>{errs.plan}</p>}
            {submitErr && <div style={{ padding: "12px 16px", borderRadius: 10, fontSize: 13, marginBottom: 16, background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" }}>{submitErr}</div>}

            <div className="plan-grid">
              {[
                {
                  id: "Basic", price: "Free", sub: "No credit card needed",
                  features: ["Company name & website","1 service category","HQ city listing","Standard search placement"],
                  featLabel: "What's included",
                  btnStyle: plan === "Basic" ? { background: "#1C66AD", color: "#fff", border: "none" } : { background: "#f3f4f6", color: "#374151", border: "1.5px solid #e5e7eb" },
                  btnLabel: "Get Listed Free",
                },
                {
                  id: "Professional",
                  price: billing === "annual" ? "$250/yr" : "$25/mo",
                  savings: billing === "annual" ? "Save $50 vs monthly" : null,
                  features: ["Company logo & description","Contact details shown","Up to 3 service categories","Up to 3 service areas","Self-service profile editing"],
                  featLabel: "Everything in Basic, plus",
                  popular: true,
                  hdStyle: { background: "linear-gradient(180deg,#f0f5ff 0%,#fff 100%)" },
                  btnStyle: { background: plan === "Professional" ? "#0e4d8a" : "#1C66AD", color: "#fff", border: "none" },
                  btnLabel: "Select Professional",
                },
                {
                  id: "Premier",
                  price: billing === "annual" ? "$500/yr" : "$50/mo",
                  savings: billing === "annual" ? "Save $100 vs monthly" : null,
                  features: ["Unlimited categories & areas","Verified Badge — included","Star ratings & reviews","Preferred search placement*","Thought leadership posts","Media gallery"],
                  featLabel: "Everything in Professional, plus",
                  hdStyle: { background: "linear-gradient(180deg,#f5f7ff 0%,#fff 100%)" },
                  btnStyle: { background: plan === "Premier" ? "#0f1d40" : "#1E2E61", color: "#fff", border: "none" },
                  btnLabel: "Select Premier",
                },
              ].map(p => (
                <div key={p.id} className={`plan-card${plan === p.id ? " selected" : ""}`} onClick={() => { setPlan(p.id); clearErr("plan"); }}>
                  {p.popular && <div className="pop-badge">POPULAR</div>}
                  <div className="plan-hd" style={p.hdStyle}>
                    <p className="dsp" style={{ fontSize: 14, fontWeight: 700, color: "#0a1628", marginBottom: 10 }}>{p.id}</p>
                    <p className="plan-pn">{p.price.includes("/") ? <>{p.price.split("/")[0]}<span style={{ fontSize: 14, fontWeight: 400, color: "#9ca3af" }}>/{p.price.split("/")[1]}</span></> : p.price}</p>
                    {p.sub && <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 8 }}>{p.sub}</p>}
                    {p.savings && <p style={{ fontSize: 12, color: "#15803d", marginTop: 6, fontWeight: 600 }}>{p.savings}</p>}
                  </div>
                  <div className="plan-feats">
                    <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>{p.featLabel}</p>
                    <ul>{p.features.map(f => <li key={f}><span className="chk">✓</span>{f}</li>)}</ul>
                  </div>
                  <button className="plan-cta" style={p.btnStyle}>{p.btnLabel}</button>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
              <button className="reg-btn reg-btn-ghost" onClick={() => goTo(2)}>← Back</button>
              {plan === "Basic" ? (
                <button className="reg-btn reg-btn-primary" onClick={() => next(3)}>Continue →</button>
              ) : (
                <button
                  className="reg-btn reg-btn-primary"
                  disabled={submitting}
                  onClick={handlePaidCheckout}
                  style={{ opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? "Starting checkout…" : "Pay & Register →"}
                </button>
              )}
            </div>
            <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 10 }}>
              {plan && plan !== "Basic"
                ? "You'll set your password after payment via a link in your confirmation email."
                : ""}
            </p>
          </div>

          {/* Step 4: Account (Basic plan only) */}
          <div className={`step-panel${step === 4 ? " active" : ""}`}>
            <p className="dsp" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 26, fontWeight: 800, color: "#0a1628", lineHeight: 1.15, marginBottom: 5 }}>Create Your Account</p>
            <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 32, lineHeight: 1.5 }}>Almost done — set your login credentials</p>

            {/* Summary */}
            <div style={{ background: "linear-gradient(135deg,#1E2E61,#1C66AD)", borderRadius: 14, padding: "20px 24px", maxWidth: 520, marginBottom: 28, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 11, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="20" height="20" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              </div>
              <div>
                <p style={{ fontSize: 14.5, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>{companyName || "Your Company"}</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 3 }}>{regType} · {category || "Uncategorized"} · {membershipPlan}</p>
              </div>
            </div>

            {submitErr && <div style={{ padding: "12px 16px", borderRadius: 10, fontSize: 13, marginBottom: 20, background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", maxWidth: 520 }}>{submitErr}</div>}

            <div style={{ maxWidth: 520, display: "flex", flexDirection: "column", gap: 16, marginBottom: 28 }}>
              <div>
                <label className="reg-lbl">Email Address</label>
                <input className="reg-inp" type="email" value={contactEmail} readOnly style={{ background: "#f9fafb", color: "#6b7280", cursor: "not-allowed" }} />
                <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Your login email from the Details step.</p>
                {errs.email && <p style={{ fontSize: 11.5, color: "#dc2626", marginTop: 5 }}>{errs.email}</p>}
              </div>
              <div>
                <label className="reg-lbl">Password <span style={{ color: "#dc2626" }}>*</span></label>
                <div style={{ position: "relative" }}>
                  <input className="reg-inp" type={showRegPw ? "text" : "password"} placeholder="Choose a strong password" value={pw} onChange={e => { setPw(e.target.value); checkPw(e.target.value); clearErr("pw"); }} style={{ paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowRegPw(v => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex" }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showRegPw ? <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />}
                    </svg>
                  </button>
                </div>
                <div className="pw-bars">
                  {[0,1,2,3,4].map(i => (
                    <div key={i} className="pw-bar" style={{ background: i < pwScore() ? BAR_COLORS[pwScore()-1] : "#e5e7eb" }} />
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px", marginTop: 10 }}>
                  {PW_REQ_LABELS.map((l, i) => (
                    <div key={l} className={`pw-req${pwMet[i] ? " met" : ""}`}>
                      <span className="dot" />
                      {l}
                    </div>
                  ))}
                </div>
                {errs.pw && <p style={{ fontSize: 11.5, color: "#dc2626", marginTop: 5 }}>{errs.pw}</p>}
              </div>
              <div>
                <label className="reg-lbl">Confirm Password <span style={{ color: "#dc2626" }}>*</span></label>
                <input className="reg-inp" type="password" placeholder="Repeat your password" value={pw2} onChange={e => { setPw2(e.target.value); clearErr("pw2"); }} />
                {errs.pw2 && <p style={{ fontSize: 11.5, color: "#dc2626", marginTop: 5 }}>{errs.pw2}</p>}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button className="reg-btn reg-btn-ghost" onClick={() => goTo(3)}>← Back</button>
              <button className="reg-btn reg-btn-primary" disabled={submitting} onClick={doSubmit}>
                {submitting ? "Creating account…" : "Create Account"}
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

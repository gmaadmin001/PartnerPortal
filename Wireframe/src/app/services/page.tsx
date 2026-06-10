"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { cap } from "@/lib/utils";
import type { ServiceRegistration } from "@/types";

const MAIN_APP = process.env.NEXT_PUBLIC_MAIN_APP_URL || "";

const PRIMARY_CATEGORIES = [
  "Mortgage & Finance","Title & Escrow","Home Inspection","Insurance","Real Estate Law",
  "Property Management","Home Warranty","Moving & Relocation","Home Renovation","Landscaping",
  "Interior Design","Photography","Staging","Cleaning","Pest Control","Other",
];

const COUNTRIES = ["United States","Canada","Mexico","United Kingdom","Australia"];
const DIVERSITY = ["Woman-Owned","Minority-Owned","Veteran-Owned","LGBTQ+-Owned","Disability-Owned"];

const DELIVERY: Record<string, string> = { in_person: "In-Person", virtual: "Virtual", hybrid: "Hybrid" };

function ProviderCard({ r }: { r: ServiceRegistration }) {
  const initial = (r.company_name || "?")[0].toUpperCase();
  const profileUrl = r.slug ? `${MAIN_APP}/services/${r.slug}` : "#";

  const colorMap: Record<string, string> = {
    A:"#1C66AD",B:"#1E2E61",C:"#16a34a",D:"#7c3aed",E:"#ea580c",F:"#0891b2",
    G:"#db2777",H:"#d97706",I:"#4f46e5",J:"#059669",K:"#dc2626",L:"#2563eb",
    M:"#9333ea",N:"#0d9488",O:"#b45309",P:"#be185d",Q:"#0284c7",R:"#15803d",
    S:"#6d28d9",T:"#c2410c",U:"#1d4ed8",V:"#047857",W:"#7e22ce",X:"#0369a1",
    Y:"#065f46",Z:"#9f1239",
  };
  const avatarBg = colorMap[initial] || "#1E2E61";

  return (
    <div className="crd" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      <div style={{ width: 52, height: 52, borderRadius: 13, background: avatarBg, color: "#fff", fontWeight: 800, fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {initial}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 800, color: "#0a1628" }}>{r.company_name || "Unnamed"}</p>
            <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
              {[r.primary_category, r.sub_category].filter(Boolean).join(" · ")}
            </p>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {r.delivery_model && (
              <span style={{ fontSize: 11, fontWeight: 600, color: "#1C66AD", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 20, padding: "3px 10px" }}>
                {DELIVERY[r.delivery_model] || cap(r.delivery_model)}
              </span>
            )}
            {r.claim_status === "verified" && (
              <span style={{ fontSize: 11, fontWeight: 600, color: "#16a34a", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 20, padding: "3px 10px" }}>
                ✓ Verified
              </span>
            )}
          </div>
        </div>

        {r.short_description && (
          <p style={{ fontSize: 13, color: "#374151", marginTop: 8, lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {r.short_description}
          </p>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {r.headquarters_country && (
              <span style={{ fontSize: 11, color: "#6b7280", display: "flex", alignItems: "center", gap: 3 }}>
                <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                {[r.headquarters_city, r.headquarters_country].filter(Boolean).join(", ")}
              </span>
            )}
          </div>
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: "7px 16px", background: "linear-gradient(135deg,#1E2E61,#1C66AD)", color: "#fff", textDecoration: "none", borderRadius: 9, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}
          >
            View Profile
            <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          </a>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: 22, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", display: "flex", gap: 16 }}>
      <div className="skel" style={{ width: 52, height: 52, borderRadius: 13, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="skel" style={{ height: 15, borderRadius: 7, width: "40%", marginBottom: 8 }} />
        <div className="skel" style={{ height: 12, borderRadius: 6, width: "60%", marginBottom: 12 }} />
        <div className="skel" style={{ height: 11, borderRadius: 5, width: "90%" }} />
      </div>
    </div>
  );
}

export default function ServicesPage() {
  const [providers, setProviders] = useState<ServiceRegistration[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Filters
  const [keyword, setKeyword] = useState("");
  const [primaryCat, setPrimaryCat] = useState("");
  const [subCat, setSubCat] = useState("");
  const [country, setCountry] = useState("");
  const [diversity, setDiversity] = useState<string[]>([]);

  const doSearch = useCallback(async () => {
    setLoading(true);
    setHasSearched(true);
    const supabase = createClient();
    let q = supabase
      .from("service_registrations")
      .select("*")
      .eq("status", "active")
      .order("company_name");

    if (primaryCat) q = q.eq("primary_category", primaryCat);
    if (subCat) q = q.ilike("sub_category", `%${subCat}%`);
    if (country) q = q.contains("countries_served", [country]);
    if (keyword) q = q.or(`company_name.ilike.%${keyword}%,short_description.ilike.%${keyword}%`);

    const { data } = await q.limit(50);
    let results = (data as ServiceRegistration[]) ?? [];

    if (diversity.length > 0) {
      results = results.filter(r =>
        diversity.some(d => (r.certifications || "").toLowerCase().includes(d.toLowerCase()))
      );
    }

    setProviders(results);
    setLoading(false);
  }, [keyword, primaryCat, subCat, country, diversity]);

  function toggleDiversity(d: string) {
    setDiversity(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  }

  function clearAll() {
    setKeyword(""); setPrimaryCat(""); setSubCat(""); setCountry(""); setDiversity([]);
    setProviders([]); setHasSearched(false);
  }

  const activeFilters = [
    primaryCat && `Category: ${primaryCat}`,
    subCat && `Sub: ${subCat}`,
    country && `Country: ${country}`,
    ...diversity.map(d => d),
  ].filter(Boolean);

  return (
    <div style={{ minHeight: "100vh", background: "#f6f8fc" }}>
      {/* Hero Search */}
      <div style={{ background: "linear-gradient(135deg,#0c1428 0%,#1E2E61 50%,#1C66AD 100%)", padding: "56px 24px 60px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", marginBottom: 14 }}>Partner Directory</p>
          <h1 className="dsp" style={{ fontSize: 38, fontWeight: 900, color: "#fff", marginBottom: 12, lineHeight: 1.15 }}>Find a Trusted Service Provider</h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", marginBottom: 36 }}>Browse our network of verified real estate service professionals</p>

          <div style={{ display: "flex", gap: 10, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 14, padding: "10px 14px", backdropFilter: "blur(8px)" }}>
            <svg width="18" height="18" fill="none" stroke="rgba(255,255,255,0.4)" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text"
              placeholder="Search by company name or description…"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && doSearch()}
              style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 15, color: "#fff", caretColor: "#fff" }}
            />
            <button
              onClick={doSearch}
              style={{ padding: "9px 24px", background: "linear-gradient(135deg,#fff 0%,#e8edff 100%)", color: "#1E2E61", borderRadius: 10, border: "none", fontSize: 13.5, fontWeight: 800, cursor: "pointer", flexShrink: 0 }}
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "36px 24px", display: "grid", gridTemplateColumns: "260px 1fr", gap: 28, alignItems: "start" }}>
        {/* Filter sidebar */}
        <aside style={{ background: "#fff", borderRadius: 14, padding: 22, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", position: "sticky", top: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <p className="dsp" style={{ fontSize: 14, fontWeight: 700, color: "#0a1628" }}>Filters</p>
            {activeFilters.length > 0 && (
              <button onClick={clearAll} style={{ fontSize: 11.5, color: "#1C66AD", fontWeight: 700, background: "none", border: "none", cursor: "pointer", padding: 0 }}>Clear all</button>
            )}
          </div>

          {/* Primary category */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 10.5, fontWeight: 700, color: "#5b6a7e", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 7 }}>Service Type</label>
            <select
              value={primaryCat}
              onChange={e => setPrimaryCat(e.target.value)}
              style={{ width: "100%", padding: "9px 10px", border: "1.5px solid #dde3ee", borderRadius: 9, fontSize: 13, color: primaryCat ? "#0a1628" : "#9ca3af", background: "#fff", outline: "none" }}
            >
              <option value="">All categories</option>
              {PRIMARY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Sub-category */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 10.5, fontWeight: 700, color: "#5b6a7e", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 7 }}>Sub-Service</label>
            <input
              type="text"
              placeholder="e.g. FHA loans…"
              value={subCat}
              onChange={e => setSubCat(e.target.value)}
              style={{ width: "100%", padding: "9px 10px", border: "1.5px solid #dde3ee", borderRadius: 9, fontSize: 13, color: "#0a1628", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {/* Country */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 10.5, fontWeight: 700, color: "#5b6a7e", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 7 }}>Country</label>
            <select
              value={country}
              onChange={e => setCountry(e.target.value)}
              style={{ width: "100%", padding: "9px 10px", border: "1.5px solid #dde3ee", borderRadius: 9, fontSize: 13, color: country ? "#0a1628" : "#9ca3af", background: "#fff", outline: "none" }}
            >
              <option value="">All countries</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Diversity */}
          <div style={{ marginBottom: 22 }}>
            <label style={{ fontSize: 10.5, fontWeight: 700, color: "#5b6a7e", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 7 }}>Diversity</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {DIVERSITY.map(d => (
                <button
                  key={d}
                  onClick={() => toggleDiversity(d)}
                  style={{
                    padding: "5px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                    background: diversity.includes(d) ? "#1E2E61" : "#f3f4f6",
                    color: diversity.includes(d) ? "#fff" : "#374151",
                    border: diversity.includes(d) ? "1px solid #1E2E61" : "1px solid #e5e7eb",
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={doSearch}
            style={{ width: "100%", padding: "11px 0", background: "linear-gradient(135deg,#1E2E61,#1C66AD)", color: "#fff", border: "none", borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}
          >
            Apply Filters
          </button>
        </aside>

        {/* Results */}
        <main>
          {/* Active filter chips */}
          {activeFilters.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 16 }}>
              {activeFilters.map(f => (
                <span key={f} style={{ padding: "4px 12px", background: "#eff6ff", color: "#1C66AD", borderRadius: 20, fontSize: 12, fontWeight: 600, border: "1px solid #bfdbfe" }}>
                  {f}
                </span>
              ))}
            </div>
          )}

          {/* Result count */}
          {hasSearched && !loading && (
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16, fontWeight: 500 }}>
              {providers.length === 0 ? "No results found" : `${providers.length} provider${providers.length !== 1 ? "s" : ""} found`}
            </p>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Results */}
          {!loading && hasSearched && providers.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {providers.map(r => <ProviderCard key={r.id} r={r} />)}
            </div>
          )}

          {/* Empty result */}
          {!loading && hasSearched && providers.length === 0 && (
            <div style={{ background: "#fff", borderRadius: 14, padding: "60px 24px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <h3 className="dsp" style={{ fontSize: 18, fontWeight: 700, color: "#0a1628", marginBottom: 8 }}>No providers found</h3>
              <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 20 }}>Try adjusting your filters or broadening your search.</p>
              <button onClick={clearAll} style={{ padding: "9px 22px", background: "#1E2E61", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Clear Filters</button>
            </div>
          )}

          {/* Initial prompt */}
          {!loading && !hasSearched && (
            <div style={{ background: "#fff", borderRadius: 14, padding: "60px 24px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏢</div>
              <h3 className="dsp" style={{ fontSize: 18, fontWeight: 700, color: "#0a1628", marginBottom: 8 }}>Search for providers</h3>
              <p style={{ fontSize: 14, color: "#6b7280" }}>Use the search bar or filters to find real estate service providers in our directory.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

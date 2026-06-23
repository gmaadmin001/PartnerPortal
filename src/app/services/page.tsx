"use client";

import { useEffect, useState, useCallback } from "react";
import { cap } from "@/lib/utils";
import type { ServiceRegistration } from "@/types";

const MAIN_APP = process.env.NEXT_PUBLIC_MAIN_APP_URL || "";

const PRIMARY_CATEGORIES = [
  "Getting Established at Destination",
  "Health, Safety & Security",
  "Housing & Accommodation",
  "Immigration & Work Authorization",
  "Moving Belongings",
  "Program Management & Outsourcing",
  "Real Estate Professionals (Realtors)",
  "Strategy, Policy & Advisory",
  "Supporting Employees & Families",
  "Tax, Payroll & Compensation",
  "Technology & Data",
];
const COUNTRIES = [
  "United States","Canada","Mexico","United Kingdom","Australia","Germany","France",
  "Netherlands","Singapore","United Arab Emirates","India","Japan","Brazil","South Africa",
];
const DIVERSITY = ["Woman-Owned","Minority-Owned","Veteran-Owned","LGBTQ+-Owned","Disability-Owned"];
const DELIVERY_OPTS = [
  { value: "remote", label: "Remote" },
  { value: "on-site", label: "On-site" },
  { value: "hybrid", label: "Hybrid" },
  { value: "franchise", label: "Franchise" },
];
const SIZE_OPTS = ["1–10","11–50","51–200","201–500","500+"].map(v => ({ value: v, label: v }));
const TYPE_OPTS = [
  { value: "supplier", label: "Supplier" },
  { value: "realtor", label: "Realtor" },
  { value: "consultant", label: "Consultant" },
  { value: "broker", label: "Broker" },
];

const DELIVERY_LABEL: Record<string, string> = {
  in_person: "In-Person", virtual: "Virtual", hybrid: "Hybrid",
  remote: "Remote", "on-site": "On-site", franchise: "Franchise",
};

// ── Provider card ─────────────────────────────────────────────────────────────

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
  const coreServices = (r.core_services ?? []) as string[];

  return (
    <div className="crd" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      {r.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={r.logo_url} alt={r.company_name ?? ""} style={{ width: 52, height: 52, borderRadius: 13, objectFit: "cover", border: "1px solid #e5e7eb", flexShrink: 0 }} />
      ) : (
        <div style={{ width: 52, height: 52, borderRadius: 13, background: avatarBg, color: "#fff", fontWeight: 800, fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {initial}
        </div>
      )}
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
                {DELIVERY_LABEL[r.delivery_model] || cap(r.delivery_model)}
              </span>
            )}
            {r.is_verified && (
              <span style={{ fontSize: 11, fontWeight: 600, color: "#16a34a", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 20, padding: "3px 10px" }}>
                ✓ Verified
              </span>
            )}
          </div>
        </div>

        {r.short_description && (
          <p style={{ fontSize: 13, color: "#374151", marginTop: 8, lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
            {r.short_description}
          </p>
        )}

        {coreServices.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
            {coreServices.slice(0, 4).map(s => (
              <span key={s} style={{ fontSize: 10.5, fontWeight: 600, color: "#374151", background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 20, padding: "2px 9px" }}>{s}</span>
            ))}
            {coreServices.length > 4 && <span style={{ fontSize: 10.5, color: "#9ca3af" }}>+{coreServices.length - 4} more</span>}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            {r.headquarters_country && (
              <span style={{ fontSize: 11, color: "#6b7280", display: "flex", alignItems: "center", gap: 3 }}>
                <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                {[r.headquarters_city, r.headquarters_country].filter(Boolean).join(", ")}
              </span>
            )}
            {r.register_as && (
              <span style={{ fontSize: 10.5, fontWeight: 600, color: "#7c3aed", background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: 20, padding: "2px 8px", textTransform: "capitalize" }}>
                {r.register_as}
              </span>
            )}
          </div>
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: "7px 16px", background: "linear-gradient(135deg,#1E2E61,#1C66AD)", color: "#fff", textDecoration: "none", borderRadius: 9, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}
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

function FilterLabel({ children }: { children: React.ReactNode }) {
  return <label style={{ fontSize: 10.5, fontWeight: 700, color: "#5b6a7e", letterSpacing: "0.06em", textTransform: "uppercase" as const, display: "block", marginBottom: 7 }}>{children}</label>;
}

function FilterSelect({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; placeholder: string;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ width: "100%", padding: "9px 10px", border: "1.5px solid #dde3ee", borderRadius: 9, fontSize: 13, color: value ? "#0a1628" : "#9ca3af", background: "#fff", outline: "none", appearance: "auto" }}
    >
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ServicesPage() {
  const [providers, setProviders] = useState<ServiceRegistration[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [page, setPage] = useState(1);

  const SEARCH_PAGE_SIZE = 25;
  const totalPages = Math.max(1, Math.ceil(total / SEARCH_PAGE_SIZE));

  const [keyword, setKeyword] = useState("");
  const [primaryCat, setPrimaryCat] = useState("");
  const [subCat, setSubCat] = useState("");
  const [coreService, setCoreService] = useState("");
  const [country, setCountry] = useState("");
  const [deliveryModel, setDeliveryModel] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [listingType, setListingType] = useState("");
  const [diversity, setDiversity] = useState<string[]>([]);

  const doSearch = useCallback(async (overrides?: {
    keyword?: string; primaryCat?: string; subCat?: string; coreService?: string;
    country?: string; deliveryModel?: string; companySize?: string; listingType?: string;
    diversity?: string[]; page?: number;
  }) => {
    setLoading(true);
    setHasSearched(true);
    const kw = overrides?.keyword ?? keyword;
    const pc = overrides?.primaryCat ?? primaryCat;
    const sc = overrides?.subCat ?? subCat;
    const cs = overrides?.coreService ?? coreService;
    const ct = overrides?.country ?? country;
    const dm = overrides?.deliveryModel ?? deliveryModel;
    const sz = overrides?.companySize ?? companySize;
    const lt = overrides?.listingType ?? listingType;
    const dv = overrides?.diversity ?? diversity;
    const pg = overrides?.page ?? 1;

    const params = new URLSearchParams();
    params.set("page", String(pg));
    params.set("limit", String(SEARCH_PAGE_SIZE));
    if (kw) params.set("keyword", kw);
    if (pc) params.set("primaryService", pc);
    if (sc) params.set("subKeyword", sc);
    if (cs) params.set("coreService", cs);
    if (ct) params.set("country", ct);
    if (dm) params.set("deliveryModel", dm);
    if (sz) params.set("companySize", sz);
    if (lt) params.set("listingType", lt);
    if (dv.length > 0) params.set("diversityFlags", dv.join(","));

    const res = await fetch(`/api/services?${params}`);
    const json = await res.json();
    setProviders((json.data ?? []) as ServiceRegistration[]);
    setTotal(json.total ?? 0);
    setPage(pg);
    setLoading(false);
  }, [keyword, primaryCat, subCat, coreService, country, deliveryModel, companySize, listingType, diversity]);

  // Read URL params on mount and auto-search if any are present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlCoreService = params.get("coreService") ?? "";
    const urlKeyword = params.get("keyword") ?? "";
    const urlCat = params.get("category") ?? "";
    const urlCountry = params.get("country") ?? "";
    const urlSubCat = params.get("subCat") ?? "";

    if (urlCoreService) setCoreService(urlCoreService);
    if (urlKeyword) setKeyword(urlKeyword);
    if (urlCat) setPrimaryCat(urlCat);
    if (urlCountry) setCountry(urlCountry);
    if (urlSubCat) setSubCat(urlSubCat);

    if (urlCoreService || urlKeyword || urlCat || urlCountry || urlSubCat) {
      doSearch({ coreService: urlCoreService, keyword: urlKeyword, primaryCat: urlCat, country: urlCountry, subCat: urlSubCat });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleDiversity(d: string) {
    setDiversity(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  }

  function clearAll() {
    setKeyword(""); setPrimaryCat(""); setSubCat(""); setCoreService("");
    setCountry(""); setDeliveryModel(""); setCompanySize(""); setListingType("");
    setDiversity([]); setProviders([]); setTotal(0); setHasSearched(false); setPage(1);
    window.history.replaceState({}, "", window.location.pathname);
  }

  const activeFilters = [
    keyword && `"${keyword}"`,
    primaryCat && `Category: ${primaryCat}`,
    subCat && `Sub: ${subCat}`,
    coreService && `Service: ${coreService}`,
    country && `Country: ${country}`,
    deliveryModel && `Delivery: ${cap(deliveryModel)}`,
    companySize && `Size: ${companySize}`,
    listingType && `Type: ${cap(listingType)}`,
    ...diversity,
  ].filter(Boolean) as string[];

  return (
    <div style={{ minHeight: "100vh", background: "#f6f8fc" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg,#0c1428 0%,#1E2E61 50%,#1C66AD 100%)", padding: "56px 24px 60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px,transparent 1px)", backgroundSize: "22px 22px", pointerEvents: "none" }} />
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", marginBottom: 14 }}>Partner Directory</p>
          <h1 className="dsp" style={{ fontSize: 38, fontWeight: 900, color: "#fff", marginBottom: 12, lineHeight: 1.15 }}>Find a Trusted Service Provider</h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", marginBottom: 36 }}>Browse our network of verified global mobility service professionals</p>
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
              onClick={() => doSearch()}
              style={{ padding: "9px 24px", background: "linear-gradient(135deg,#fff 0%,#e8edff 100%)", color: "#1E2E61", borderRadius: 10, border: "none", fontSize: 13.5, fontWeight: 800, cursor: "pointer", flexShrink: 0 }}
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 24px", display: "grid", gridTemplateColumns: "280px 1fr", gap: 28, alignItems: "start" }}>

        {/* ── Filter sidebar ── */}
        <aside style={{ background: "#fff", borderRadius: 16, padding: 22, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", position: "sticky", top: 24, border: "1px solid #dde3ee" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #f3f4f6" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="14" height="14" fill="none" stroke="#1C66AD" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
              </div>
              <p className="dsp" style={{ fontSize: 14, fontWeight: 700, color: "#0a1628" }}>Filters</p>
            </div>
            {activeFilters.length > 0 && (
              <button onClick={clearAll} style={{ fontSize: 11.5, color: "#1C66AD", fontWeight: 700, background: "none", border: "none", cursor: "pointer", padding: 0 }}>Clear all</button>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <FilterLabel>Service Category</FilterLabel>
              <FilterSelect value={primaryCat} onChange={setPrimaryCat} options={PRIMARY_CATEGORIES.map(c => ({ value: c, label: c }))} placeholder="All categories" />
            </div>

            <div>
              <FilterLabel>Sub-Category</FilterLabel>
              <input type="text" placeholder="e.g. Corporate Housing…" value={subCat} onChange={e => setSubCat(e.target.value)}
                style={{ width: "100%", padding: "9px 10px", border: "1.5px solid #dde3ee", borderRadius: 9, fontSize: 13, color: "#0a1628", outline: "none", boxSizing: "border-box" as const }} />
            </div>

            <div>
              <FilterLabel>Core Service</FilterLabel>
              <input type="text" placeholder="e.g. Tax Consulting…" value={coreService} onChange={e => setCoreService(e.target.value)}
                onKeyDown={e => e.key === "Enter" && doSearch()}
                style={{ width: "100%", padding: "9px 10px", border: coreService ? "1.5px solid #1C66AD" : "1.5px solid #dde3ee", borderRadius: 9, fontSize: 13, color: "#0a1628", outline: "none", boxSizing: "border-box" as const, background: coreService ? "#eff6ff" : "#fff" }} />
              {coreService && <p style={{ fontSize: 10.5, color: "#1C66AD", marginTop: 4, fontWeight: 600 }}>Filtering by core service</p>}
            </div>

            <div>
              <FilterLabel>Country Served</FilterLabel>
              <FilterSelect value={country} onChange={setCountry} options={COUNTRIES.map(c => ({ value: c, label: c }))} placeholder="All countries" />
            </div>

            <div>
              <FilterLabel>Delivery Model</FilterLabel>
              <FilterSelect value={deliveryModel} onChange={setDeliveryModel} options={DELIVERY_OPTS} placeholder="Any delivery" />
            </div>

            <div>
              <FilterLabel>Company Size</FilterLabel>
              <FilterSelect value={companySize} onChange={setCompanySize} options={SIZE_OPTS} placeholder="Any size" />
            </div>

            <div>
              <FilterLabel>Listing Type</FilterLabel>
              <FilterSelect value={listingType} onChange={setListingType} options={TYPE_OPTS} placeholder="Any type" />
            </div>

            <div>
              <FilterLabel>Diversity</FilterLabel>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {DIVERSITY.map(d => (
                  <button key={d} onClick={() => toggleDiversity(d)}
                    style={{
                      padding: "5px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                      background: diversity.includes(d) ? "#1E2E61" : "#f3f4f6",
                      color: diversity.includes(d) ? "#fff" : "#374151",
                      border: diversity.includes(d) ? "1px solid #1E2E61" : "1px solid #e5e7eb",
                    }}
                  >{d}</button>
                ))}
              </div>
            </div>

            <button
              onClick={() => doSearch()}
              style={{ width: "100%", padding: "11px 0", background: "linear-gradient(135deg,#1E2E61,#1C66AD)", color: "#fff", border: "none", borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: "pointer", marginTop: 2 }}
            >
              Apply Filters
            </button>
          </div>
        </aside>

        {/* ── Results ── */}
        <main>
          {/* Active filter chips */}
          {activeFilters.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 }}>
              {activeFilters.map(f => (
                <span key={f} style={{ padding: "4px 12px", background: "#eff6ff", color: "#1C66AD", borderRadius: 20, fontSize: 12, fontWeight: 600, border: "1px solid #bfdbfe" }}>
                  {f}
                </span>
              ))}
            </div>
          )}

          {hasSearched && !loading && (
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 14, fontWeight: 500 }}>
              {total === 0
                ? "No results found"
                : total > SEARCH_PAGE_SIZE
                  ? `Showing ${(page - 1) * SEARCH_PAGE_SIZE + 1}–${Math.min(page * SEARCH_PAGE_SIZE, total)} of ${total} provider${total !== 1 ? "s" : ""}`
                  : `${total} provider${total !== 1 ? "s" : ""} found`}
            </p>
          )}

          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
            </div>
          )}

          {!loading && hasSearched && total > 0 && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {providers.map(r => <ProviderCard key={r.id} r={r} />)}
              </div>
              {total > SEARCH_PAGE_SIZE && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 24, flexWrap: "wrap", gap: 10 }}>
                  <span style={{ fontSize: 13, color: "#6b7280" }}>
                    Page {page} of {totalPages}
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => { doSearch({ page: page - 1 }); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      disabled={page === 1}
                      style={{ padding: "9px 20px", background: "#fff", border: "1.5px solid #dde3ee", borderRadius: 10, fontSize: 13, fontWeight: 700, color: page === 1 ? "#c0c7d4" : "#1E2E61", cursor: page === 1 ? "not-allowed" : "pointer" }}>
                      ← Previous
                    </button>
                    <button onClick={() => { doSearch({ page: page + 1 }); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      disabled={page === totalPages}
                      style={{ padding: "9px 20px", background: page === totalPages ? "#f3f4f6" : "linear-gradient(135deg,#1E2E61,#1C66AD)", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, color: page === totalPages ? "#c0c7d4" : "#fff", cursor: page === totalPages ? "not-allowed" : "pointer" }}>
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {!loading && hasSearched && total === 0 && (
            <div style={{ background: "#fff", borderRadius: 14, padding: "60px 24px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #dde3ee" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <h3 className="dsp" style={{ fontSize: 18, fontWeight: 700, color: "#0a1628", marginBottom: 8 }}>No providers found</h3>
              <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 20 }}>Try adjusting your filters or broadening your search.</p>
              <button onClick={clearAll} style={{ padding: "9px 22px", background: "#1E2E61", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Clear Filters</button>
            </div>
          )}

          {!loading && !hasSearched && (
            <div style={{ background: "#fff", borderRadius: 14, padding: "60px 24px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #dde3ee" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏢</div>
              <h3 className="dsp" style={{ fontSize: 18, fontWeight: 700, color: "#0a1628", marginBottom: 8 }}>Search for providers</h3>
              <p style={{ fontSize: 14, color: "#6b7280" }}>Use the search bar or filters to find global mobility service providers in our directory.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

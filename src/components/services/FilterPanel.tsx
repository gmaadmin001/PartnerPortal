"use client";

import { useState, useRef, useEffect } from "react";

// ── Static data — mirrors registration form exactly ───────────────────────────

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

const CATEGORIES = Object.keys(SUBCATS);

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Argentina","Australia","Austria","Bahrain","Bangladesh",
  "Belgium","Bolivia","Brazil","Bulgaria","Cambodia","Canada","Chile","China","Colombia",
  "Croatia","Czech Republic","Denmark","Ecuador","Egypt","Estonia","Ethiopia","Finland",
  "France","Germany","Ghana","Greece","Guatemala","Honduras","Hong Kong","Hungary","India",
  "Indonesia","Iran","Iraq","Ireland","Israel","Italy","Japan","Jordan","Kazakhstan","Kenya",
  "Kuwait","Latvia","Lebanon","Lithuania","Luxembourg","Malaysia","Mexico","Morocco",
  "Netherlands","New Zealand","Nigeria","Norway","Pakistan","Panama","Peru","Philippines",
  "Poland","Portugal","Qatar","Romania","Russia","Saudi Arabia","Senegal","Serbia","Singapore",
  "Slovakia","South Africa","South Korea","Spain","Sri Lanka","Sweden","Switzerland","Taiwan",
  "Tanzania","Thailand","Turkey","Uganda","Ukraine","United Arab Emirates","United Kingdom",
  "United States","Uruguay","Venezuela","Vietnam","Zambia","Zimbabwe",
];

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware",
  "Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky",
  "Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi",
  "Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico",
  "New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania",
  "Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
  "Virginia","Washington","West Virginia","Wisconsin","Wyoming",
];

const SERVICE_SCOPES = ["International", "National", "Local", "Hybrid"];
const COMPANY_SIZES  = ["1–50", "51–500", "500+"];
const DIVERSITY_OPTIONS = [
  "CRP Certified", "GMS Certified", "ERC® Appraisal Trained",
  "Woman Owned", "Veteran Owned", "Minority Owned", "LGBTQ+ Owned",
];

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FilterValues {
  primaryServices: string[];
  subServices:     string[];
  countries:       string[];
  states:          string[];
  city:            string;
  zip:             string;
  industry:        string;
  serviceScope:    string;
  companySize:     string;
  companyName:     string;
  diversityFlags:  string[];
}

export const EMPTY_FILTERS: FilterValues = {
  primaryServices: [], subServices: [], countries: [], states: [],
  city: "", zip: "", industry: "", serviceScope: "", companySize: "",
  companyName: "", diversityFlags: [],
};

interface FilterPanelProps {
  values:    FilterValues;
  onChange:  (v: FilterValues) => void;
  onSubmit:  () => void;
  compact?:  boolean;
}

// ── Searchable multi-select ───────────────────────────────────────────────────

function SearchableMultiSelect({
  options, selected, onChange, placeholder = "Search...",
}: {
  options:     string[];
  selected:    string[];
  onChange:    (v: string[]) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [open,  setOpen]  = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = options.filter(
    (o) => !selected.includes(o) && o.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    function handleDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleDown);
    return () => document.removeEventListener("mousedown", handleDown);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div
        className="flex items-center border border-gma-border rounded-lg bg-white px-3 py-2 gap-2 cursor-text"
        onClick={() => setOpen(true)}
      >
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="flex-1 min-w-0 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
        />
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gma-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filtered.slice(0, 60).map((opt) => (
            <div
              key={opt}
              onMouseDown={(e) => { e.preventDefault(); onChange([...selected, opt]); setQuery(""); }}
              className="px-3 py-2 hover:bg-gma-blue-pale cursor-pointer text-sm text-gray-700"
            >
              {opt}
            </div>
          ))}
        </div>
      )}

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selected.map((s) => (
            <span key={s} className="inline-flex items-center gap-1 bg-gma-navy text-white rounded-full pl-3 pr-2 py-0.5 text-xs font-semibold">
              {s}
              <button
                type="button"
                onClick={() => onChange(selected.filter((x) => x !== s))}
                className="hover:text-gma-blue-light leading-none text-base"
              >
                –
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHead({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-gma-surface border-y border-gray-100">
      <span className="text-gma-primary w-4 h-4 flex-shrink-0">{icon}</span>
      <span className="text-xs font-bold text-gray-500 tracking-widest uppercase">{label}</span>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const IconBriefcase = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const IconPin = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconGear = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconShield = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

// ── Main component ────────────────────────────────────────────────────────────

export default function FilterPanel({ values, onChange, onSubmit, compact = false }: FilterPanelProps) {
  const set = (patch: Partial<FilterValues>) => onChange({ ...values, ...patch });

  const availableSubs = values.primaryServices.length > 0
    ? values.primaryServices.flatMap((p) => SUBCATS[p] ?? [])
    : Object.values(SUBCATS).flat();

  const inp = "w-full border border-gma-border rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-gma-primary focus:ring-2 focus:ring-gma-primary/10 bg-white";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

      {/* Service Classification */}
      <SectionHead label="Service Classification" icon={<IconBriefcase />} />
      <div className={`p-4 ${compact ? "flex flex-col gap-3" : "grid grid-cols-2 gap-4"}`}>
        <div>
          <label className="block text-xs font-semibold text-gma-navy mb-1.5">Primary Service</label>
          <SearchableMultiSelect
            options={CATEGORIES}
            selected={values.primaryServices}
            onChange={(v) => set({ primaryServices: v, subServices: [] })}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gma-navy mb-1.5">Sub Service</label>
          <SearchableMultiSelect
            options={availableSubs}
            selected={values.subServices}
            onChange={(v) => set({ subServices: v })}
          />
        </div>
      </div>

      {/* Geographic Coverage */}
      <SectionHead label="Geographic Coverage" icon={<IconPin />} />
      <div className={`p-4 ${compact ? "flex flex-col gap-3" : "grid grid-cols-4 gap-4"}`}>
        <div>
          <label className="block text-xs font-semibold text-gma-navy mb-1.5">Country</label>
          <SearchableMultiSelect
            options={COUNTRIES}
            selected={values.countries}
            onChange={(v) => set({ countries: v })}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gma-navy mb-1.5">State</label>
          <SearchableMultiSelect
            options={US_STATES}
            selected={values.states}
            onChange={(v) => set({ states: v })}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gma-navy mb-1.5">City / Region</label>
          <input type="text" value={values.city} onChange={(e) => set({ city: e.target.value })} placeholder="Search..." className={inp} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gma-navy mb-1.5">Zip Code</label>
          <input type="text" value={values.zip} onChange={(e) => set({ zip: e.target.value })} placeholder="e.g. 90210" className={inp} />
        </div>
      </div>

      {/* Industry & Scope */}
      <SectionHead label="Industry & Scope" icon={<IconGear />} />
      <div className={`p-4 ${compact ? "flex flex-col gap-3" : "grid grid-cols-3 gap-4"}`}>
        <div>
          <label className="block text-xs font-semibold text-gma-navy mb-1.5">Industry</label>
          <input type="text" value={values.industry} onChange={(e) => set({ industry: e.target.value })} placeholder="e.g. Technology" className={inp} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gma-navy mb-1.5">Service Scope</label>
          <select value={values.serviceScope} onChange={(e) => set({ serviceScope: e.target.value })} className={inp}>
            <option value="">Select Scope Integration</option>
            {SERVICE_SCOPES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gma-navy mb-1.5">Company Size</label>
          <select value={values.companySize} onChange={(e) => set({ companySize: e.target.value })} className={inp}>
            <option value="">Select Size</option>
            {COMPANY_SIZES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Specific Company */}
      <SectionHead
        label="Specific Company"
        icon={
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        }
      />
      <div className="p-4">
        <label className="block text-xs font-semibold text-gma-navy mb-1.5">Specific Company</label>
        <div className="relative">
          <input
            type="text"
            value={values.companyName}
            onChange={(e) => set({ companyName: e.target.value })}
            placeholder="Search..."
            className={`${inp} pr-8`}
          />
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Diversity & Compliance */}
      <SectionHead label="Diversity & Compliance" icon={<IconShield />} />
      <div className="p-4">
        <div className="flex flex-wrap gap-2">
          {DIVERSITY_OPTIONS.map((opt) => {
            const active = values.diversityFlags.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() =>
                  set({
                    diversityFlags: active
                      ? values.diversityFlags.filter((f) => f !== opt)
                      : [...values.diversityFlags, opt],
                  })
                }
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  active
                    ? "bg-gma-navy text-white border-gma-navy"
                    : "bg-white text-gray-600 border-gray-300 hover:border-gma-navy hover:text-gma-navy"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit */}
      <div className="p-4 pt-0">
        <button
          type="button"
          onClick={onSubmit}
          className="w-full bg-gma-navy text-white font-bold text-sm uppercase tracking-widest py-3.5 rounded-xl hover:bg-gma-primary transition-colors flex items-center justify-center gap-2"
        >
          Perform Discovery
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}

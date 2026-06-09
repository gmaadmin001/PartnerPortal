"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FilterPanel, { FilterValues, EMPTY_FILTERS } from "@/components/services/FilterPanel";
import ProviderCard, { Provider } from "@/components/services/ProviderCard";

export function filtersToParams(v: FilterValues): URLSearchParams {
  const p = new URLSearchParams();
  if (v.primaryServices.length) p.set("primaryService", v.primaryServices.join("|"));
  if (v.subServices.length)     p.set("subService",     v.subServices.join("|"));
  if (v.countries.length)       p.set("country",        v.countries.join("|"));
  if (v.states.length)          p.set("state",          v.states.join("|"));
  if (v.city)                   p.set("city",           v.city);
  if (v.zip)                    p.set("zip",            v.zip);
  if (v.industry)               p.set("industry",       v.industry);
  if (v.serviceScope)           p.set("serviceScope",   v.serviceScope);
  if (v.companySize)            p.set("companySize",    v.companySize);
  if (v.companyName)            p.set("companyName",    v.companyName);
  if (v.diversityFlags.length)  p.set("diversityFlags", v.diversityFlags.join("|"));
  return p;
}

interface ServicesClientProps {
  initialFilters: FilterValues;
  results:        Provider[];
  total:          number;
  hasFilters:     boolean;
}

export default function ServicesClient({
  initialFilters, results, total, hasFilters,
}: ServicesClientProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterValues>(initialFilters);

  function submit(v: FilterValues) {
    const qs = filtersToParams(v).toString();
    router.push(qs ? `/services?${qs}` : "/services");
  }

  // ── Search form (no active filters) ─────────────────────────────────────────
  if (!hasFilters) {
    return (
      <div className="min-h-screen bg-gma-surface py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="font-display text-4xl font-bold text-gma-navy mb-3">
              Find Global Services
            </h1>
            <p className="text-gray-500 text-lg">
              Search through our vetted network of certified relocation and mobility partners.
            </p>
          </div>
          <FilterPanel
            values={filters}
            onChange={setFilters}
            onSubmit={() => submit(filters)}
          />
        </div>
      </div>
    );
  }

  // ── Results view ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gma-surface">
      <div className="max-w-screen-xl mx-auto px-6 py-10 flex gap-8 items-start">

        {/* Sidebar filter */}
        <aside className="w-72 flex-shrink-0 sticky top-6">
          <h2 className="font-display text-base font-bold text-gma-navy mb-3 pl-1">Filters</h2>
          <FilterPanel
            values={filters}
            onChange={setFilters}
            onSubmit={() => submit(filters)}
            compact
          />
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-display text-2xl font-bold text-gma-navy">Search Results</h1>
            <span className="text-sm text-gray-500">
              Showing {total} verified partner{total !== 1 ? "s" : ""}
            </span>
          </div>

          {results.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="font-display text-lg font-bold text-gma-navy mb-2">No partners found</h3>
              <p className="text-gray-500 text-sm mb-6">
                Try broadening your filters or clearing some criteria.
              </p>
              <button
                onClick={() => { setFilters(EMPTY_FILTERS); router.push("/services"); }}
                className="bg-gma-navy text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-gma-primary transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {results.map((p) => (
                <ProviderCard key={p.id} provider={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

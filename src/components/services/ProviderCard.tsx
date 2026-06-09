"use client";

import Link from "next/link";

export interface Provider {
  id: string;
  slug: string;
  company_name: string;
  website_url: string | null;
  short_description: string | null;
  logo_url: string | null;
  primary_category: string | null;
  sub_category: string | null;
  headquarters_country: string | null;
  headquarters_city: string | null;
  countries_served: string[] | null;
  states_served: string[] | null;
  industry_focus: string | null;
  service_scope: string | null;
  company_size: string | null;
  certifications: string | null;
  diversity_flags: string[] | null;
  core_services: string[] | null;
  membership_plan: string | null;
  is_verified: boolean;
  is_featured: boolean;
}

interface ProviderCardProps {
  provider: Provider;
}

export default function ProviderCard({ provider: p }: ProviderCardProps) {
  const serviceAreas = [
    ...(p.countries_served ?? []),
    ...(p.states_served ?? []),
  ];
  const visibleAreas  = serviceAreas.slice(0, 3);
  const extraAreas    = serviceAreas.length - visibleAreas.length;

  const services = [
    ...(p.sub_category ? [p.sub_category] : []),
    ...(p.core_services ?? []),
  ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 3);

  const certs = (p.certifications ?? "")
    .split(",").map((c) => c.trim()).filter(Boolean);

  const websiteDisplay = (p.website_url ?? "")
    .replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3 min-w-0">
          {/* Logo or initials */}
          {p.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.logo_url} alt={p.company_name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gma-navy flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">
                {p.company_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center flex-wrap gap-2 mb-0.5">
              <h3 className="font-bold text-gma-navy text-lg leading-tight">{p.company_name}</h3>
              {p.is_verified && (
                <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 rounded-full px-2.5 py-0.5 text-xs font-bold">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  VERIFIED
                </span>
              )}
              {p.is_featured && (
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2.5 py-0.5 text-xs font-bold">
                  BEST MATCH
                </span>
              )}
            </div>
            {p.website_url && (
              <a
                href={p.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-gma-primary text-sm hover:underline"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                </svg>
                {websiteDisplay}
              </a>
            )}
          </div>
        </div>
        <Link
          href={`/services/${p.slug}`}
          className="flex-shrink-0 bg-gma-navy text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-gma-primary transition-colors whitespace-nowrap"
        >
          View Profile
        </Link>
      </div>

      {/* Details grid */}
      <div className="space-y-2.5 text-sm">
        {visibleAreas.length > 0 && (
          <div className="flex gap-2">
            <span className="font-semibold text-gray-700 flex-shrink-0 w-40">Service Areas:</span>
            <span className="text-gray-600">
              {visibleAreas.join(", ")}
              {extraAreas > 0 && <span className="text-gray-400"> and {extraAreas} more</span>}
            </span>
          </div>
        )}

        {p.headquarters_country && (
          <div className="flex gap-2">
            <span className="font-semibold text-gray-700 flex-shrink-0 w-40">Headquarter Country:</span>
            <span className="text-gray-600">
              {[p.headquarters_country, p.headquarters_city].filter(Boolean).join(", ")}
            </span>
          </div>
        )}

        {services.length > 0 && (
          <div className="flex gap-2">
            <span className="font-semibold text-gray-700 flex-shrink-0 w-40">Services:</span>
            <div className="flex flex-col gap-0.5">
              {services.map((svc) => (
                <Link
                  key={svc}
                  href={`/services?subService=${encodeURIComponent(svc)}`}
                  className="text-gma-primary hover:underline flex items-center gap-1"
                >
                  <span className="text-gray-400">→</span> {svc}
                </Link>
              ))}
            </div>
          </div>
        )}

        {p.industry_focus && (
          <div className="flex gap-2">
            <span className="font-semibold text-gray-700 flex-shrink-0 w-40">Industry Focus:</span>
            <span className="text-gray-600">{p.industry_focus}</span>
          </div>
        )}

        {p.company_size && (
          <div className="flex gap-2">
            <span className="font-semibold text-gray-700 flex-shrink-0 w-40">Company Size:</span>
            <span className="text-gray-600">{p.company_size}</span>
          </div>
        )}

        {certs.length > 0 && (
          <div className="flex gap-2 items-start">
            <span className="font-semibold text-gray-700 flex-shrink-0 w-40">Certifications:</span>
            <div className="flex flex-wrap gap-1.5">
              {certs.map((c) => (
                <span key={c} className="bg-gma-blue-pale text-gma-navy text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {p.short_description && (
          <div className="flex gap-2">
            <span className="font-semibold text-gray-700 flex-shrink-0 w-40">Company Statement:</span>
            <span className="text-gray-600 line-clamp-2">{p.short_description}</span>
          </div>
        )}
      </div>
    </div>
  );
}
